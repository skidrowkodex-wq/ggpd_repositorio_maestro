#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
========================================================================================
CORPOELEC - GGPD | 🌉 PUENTE REST LOCAL COMPATIBLE CON INSFORGE (PostgreSQL 18 local)
========================================================================================

Permite que SIGAD y SIGA-SEN ejecutadas en local (http://localhost:3007, :3008)
consulten la base PostgreSQL local `cnd_sen_unifilar_2025` SIN INTERNET, reutilizando
exactamente el mismo protocolo REST que usa InsForge en la nube:

    GET    /api/database/records/{tabla}?schema={esquema}&limit=&offset=&order=&col=eq.valor
    POST   /api/database/records/{tabla}?schema={esquema}          (INSERT, body: objeto o array)
    PATCH  /api/database/records/{tabla}?schema={esquema}&col=eq.valor   (UPDATE)
    DELETE /api/database/records/{tabla}?schema={esquema}&col=eq.valor   (DELETE)
    POST   /api/database/rpc/{funcion}                             (RPC con argumentos nombrados)
    POST   /api/database/advance/rawsql                            (SQL crudo; deshabilitado por defecto)
    GET    /health                                                 (diagnóstico, sin clave)

Así el frontend no cambia su código de consultas: solo cambia la URL base según el
hostname (localhost -> este puente; *.vibehost.space -> InsForge).

Seguridad (ISO/IEC 27001 A.8.20 · OWASP ASVS v4 V13/V14):
  · Escucha SOLO en loopback.
  · Exige la cabecera `apikey` (o `Authorization: Bearer`) == BRIDGE_API_KEY.
  · CORS restringido a orígenes locales (localhost/127.0.0.1/::1).
  · rawsql deshabilitado por defecto y, si se habilita, solo lectura (SELECT/WITH).
  · RPC por whitelist explícita.

Cero dependencias externas (stdlib + psql).

Uso:
    python scripts/local_pg_bridge.py                 # 127.0.0.1:5431
    python scripts/local_pg_bridge.py --port 5431
    python scripts/local_pg_bridge.py --check         # prueba de conexión y sale
"""

from __future__ import annotations

import hmac
import json
import re
import sys
import threading
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import urlparse, parse_qs, unquote

# ---------------------------------------------------------------------------------------
# Configuración (módulo común: conexión, psql y utilidades seguro-SQL)
# ---------------------------------------------------------------------------------------
from local_pg_common import (  # noqa: E402
    PG_DSN_LABEL,
    PSQL,
    SqlError,
    check_ident,
    dollar_tag,
    env,
    json_text,
    run_psql,
    sql_literal,
)

BRIDGE_HOST = env("BRIDGE_HOST", "127.0.0.1")
BRIDGE_PORT = int(env("BRIDGE_PORT", "5431"))
MAX_LIMIT = int(env("BRIDGE_MAX_LIMIT", "100000"))
DEFAULT_LIMIT = int(env("BRIDGE_DEFAULT_LIMIT", "1000"))

RESERVED_PARAMS = {"schema", "limit", "offset", "order", "select", "columns", "allow_all"}

# --- Endurecimiento del puente (ISO/IEC 27001 A.8.20/A.8.22 · OWASP ASVS v4 V13/V14) ---
# Clave compartida exigida en toda operación de datos (la envía el frontend local).
BRIDGE_API_KEY = env("BRIDGE_API_KEY", "local-bridge")
# rawsql deshabilitado por defecto; si se habilita (BRIDGE_ALLOW_RAWSQL=true) se
# restringe a consultas de solo lectura (SELECT/WITH).
ALLOW_RAWSQL = env("BRIDGE_ALLOW_RAWSQL", "false").strip().lower() in ("1", "true", "yes", "on")
# Whitelist explícita de RPC invocables (mínimo privilegio).
ALLOWED_RPC = {"verificar_credencial_sistema"}
# CORS: solo se refleja el Origin si es una app local (localhost/127.0.0.1/::1).
ALLOWED_ORIGIN_RE = re.compile(r"^https?://(localhost|127\.0\.0\.1|\[::1\])(:\d+)?$")


class BadRequest(Exception):
    pass


class NotFound(Exception):
    pass


# ---------------------------------------------------------------------------------------
# Introspección de tablas/vistas
# ---------------------------------------------------------------------------------------
_cols_cache: dict[tuple[str, str], list[str]] = {}
_cols_lock = threading.Lock()


def table_columns(schema: str, table: str) -> list[str]:
    key = (schema, table)
    with _cols_lock:
        if key in _cols_cache:
            return _cols_cache[key]
    sql = (
        "SELECT COALESCE(json_agg(column_name ORDER BY ordinal_position), '[]') "
        "FROM information_schema.columns "
        f"WHERE table_schema = {sql_literal(schema)} AND table_name = {sql_literal(table)};"
    )
    cols = json.loads(run_psql(sql) or "[]")
    if not cols:
        raise NotFound(f"No existe la tabla/vista {schema}.{table} en la BD local.")
    with _cols_lock:
        _cols_cache[key] = cols
    return cols


# ---------------------------------------------------------------------------------------
# Construcción de SQL
# ---------------------------------------------------------------------------------------
def parse_filters(params: dict[str, list[str]]) -> list[tuple[str, str, str]]:
    filters: list[tuple[str, str, str]] = []
    for key, values in params.items():
        if key in RESERVED_PARAMS:
            continue
        raw = values[0]
        op, value = "=", None
        for prefix, operator in (
            ("neq.", "<>"), ("gte.", ">="), ("lte.", "<="),
            ("eq.", "="), ("gt.", ">"), ("lt.", "<"),
            ("ilike.", "ILIKE"), ("like.", "LIKE"), ("is.", "IS"),
        ):
            if raw.startswith(prefix):
                op, value = operator, raw[len(prefix):]
                break
        if value is None:
            # Parámetro no reconocido (p. ej. cache-buster): se ignora.
            continue
        filters.append((key, op, value))
    return filters


def build_where(filters: list[tuple[str, str, str]], prefix: str = "") -> str:
    parts = []
    for col, op, value in filters:
        ident = prefix + check_ident(col)
        if op == "IS":
            low = value.lower()
            if low in ("null", "none"):
                parts.append(f"{ident} IS NULL")
            elif low == "true":
                parts.append(f"{ident} IS TRUE")
            elif low == "false":
                parts.append(f"{ident} IS FALSE")
            else:
                parts.append(f"{ident} IS NOT DISTINCT FROM {sql_literal(value)}")
        else:
            parts.append(f"{ident} {op} {sql_literal(value)}")
    return " WHERE " + " AND ".join(parts) if parts else ""


def build_order(order: str) -> str:
    specs = []
    for token in (order or "").split(","):
        token = token.strip()
        if not token:
            continue
        if "." in token:
            col, _, direction = token.rpartition(".")
        else:
            col, direction = token, "asc"
        direction = direction.lower()
        if direction not in ("asc", "desc"):
            direction = "asc"
        specs.append(f"{check_ident(col.lower())} {direction.upper()}")
    return " ORDER BY " + ", ".join(specs) if specs else ""


def agg_sql(inner_sql: str, cte_sql: str | None = None) -> str:
    """Envuelve en SELECT json_agg para devolver un array JSON (formato InsForge)."""
    cte = f"WITH {cte_sql} " if cte_sql else ""
    alias = "ins" if cte_sql else "t"
    return (
        f"{cte}SELECT COALESCE(json_agg({alias}), '[]'::json)::text FROM {inner_sql};"
    )


def _safe_limit(params: dict[str, list[str]]) -> tuple[int, int]:
    try:
        limit = int(params.get("limit", [DEFAULT_LIMIT])[0])
    except (TypeError, ValueError):
        limit = DEFAULT_LIMIT
    try:
        offset = int(params.get("offset", ["0"])[0])
    except (TypeError, ValueError):
        offset = 0
    return max(1, min(limit, MAX_LIMIT)), max(0, offset)


# ---------------------------------------------------------------------------------------
# Operaciones CRUD (devuelven texto JSON, igual que InsForge records API)
# ---------------------------------------------------------------------------------------
def op_select(schema: str, table: str, params: dict[str, list[str]]) -> str:
    table_columns(schema, table)  # valida existencia (404 si no existe)
    limit, offset = _safe_limit(params)
    inner = (
        f"(SELECT * FROM {check_ident(schema)}.{check_ident(table)}"
        f"{build_where(parse_filters(params))}{build_order(params.get('order', [''])[0])}"
        f" LIMIT {limit} OFFSET {offset}) t"
    )
    return run_psql(agg_sql(inner))


def op_insert(schema: str, table: str, body: bytes) -> str:
    records = json.loads(body.decode("utf-8") or "null")
    if records is None:
        records = []
    if isinstance(records, dict):
        records = [records]
    if not isinstance(records, list):
        raise BadRequest("El cuerpo del INSERT debe ser un objeto o un array de objetos.")
    if not records:
        return "[]"

    valid = set(table_columns(schema, table))
    keys: list[str] = []
    for record in records:
        if not isinstance(record, dict):
            raise BadRequest("Cada registro del INSERT debe ser un objeto JSON.")
        for key in record.keys():
            if key not in keys:
                keys.append(key)
    unknown = [k for k in keys if k not in valid]
    if unknown:
        raise BadRequest(f"Columnas inexistentes en {schema}.{table}: {unknown}")

    cols = ", ".join(check_ident(k) for k in keys)
    payload = json_text(records)
    tag = dollar_tag(payload)
    typed = f"NULL::{check_ident(schema)}.{check_ident(table)}"
    sql = (
        f"WITH ins AS ("
        f"INSERT INTO {check_ident(schema)}.{check_ident(table)} ({cols}) "
        f"SELECT {cols} FROM jsonb_populate_recordset({typed}, ${tag}${payload}${tag}$::jsonb) "
        f"RETURNING *"
        f") SELECT COALESCE(json_agg(ins), '[]'::json)::text FROM ins;"
    )
    return run_psql(sql)


def op_update(schema: str, table: str, params: dict[str, list[str]], body: bytes) -> str:
    payload = json.loads(body.decode("utf-8") or "{}")
    if isinstance(payload, list):
        payload = payload[0] if payload else {}
    if not isinstance(payload, dict) or not payload:
        raise BadRequest("El cuerpo del PATCH debe ser un objeto JSON con columnas a actualizar.")

    valid = set(table_columns(schema, table))
    unknown = [k for k in payload.keys() if k not in valid]
    if unknown:
        raise BadRequest(f"Columnas inexistentes en {schema}.{table}: {unknown}")

    filters = parse_filters(params)
    if not filters and params.get("allow_all", ["false"])[0].lower() != "true":
        raise BadRequest("PATCH masivo bloqueado: especifique un filtro (col=eq.valor).")

    set_clause = ", ".join(f"{check_ident(k)} = r.{check_ident(k)}" for k in payload.keys())
    payload_json = json_text(payload)
    tag = dollar_tag(payload_json)
    typed = f"NULL::{check_ident(schema)}.{check_ident(table)}"
    sql = (
        f"WITH upd AS ("
        f"UPDATE {check_ident(schema)}.{check_ident(table)} t "
        f"SET {set_clause} "
        f"FROM jsonb_populate_record({typed}, ${tag}${payload_json}${tag}$::jsonb) r"
        f"{build_where(filters, prefix='t.')} "
        f"RETURNING t.*"
        f") SELECT COALESCE(json_agg(upd), '[]'::json)::text FROM upd;"
    )
    return run_psql(sql)


def op_delete(schema: str, table: str, params: dict[str, list[str]]) -> str:
    filters = parse_filters(params)
    if not filters and params.get("allow_all", ["false"])[0].lower() != "true":
        raise BadRequest("DELETE masivo bloqueado: especifique un filtro (col=eq.valor).")
    table_columns(schema, table)
    sql = (
        f"WITH del AS ("
        f"DELETE FROM {check_ident(schema)}.{check_ident(table)}"
        f"{build_where(filters)} RETURNING *"
        f") SELECT COALESCE(json_agg(del), '[]'::json)::text FROM del;"
    )
    return run_psql(sql)


def op_rawsql(body: bytes) -> str:
    data = json.loads(body.decode("utf-8") or "{}")
    query = data.get("query") or data.get("sql") or ""
    if not query.strip():
        raise BadRequest("Falta 'query' en el cuerpo.")
    stripped = query.strip().rstrip(";")
    # Blindaje: solo se permiten consultas de lectura (nunca DDL/DML por esta vía).
    head = re.sub(r"^[\(\s]+", "", stripped).split(None, 1)[0].upper() if stripped else ""
    if head not in ("SELECT", "WITH"):
        raise BadRequest("rawsql restringido a consultas de solo lectura (SELECT/WITH).")
    try:
        return run_psql(agg_sql(f"({stripped}) t"))
    except SqlError as exc:
        raise BadRequest(f"Consulta no válida o no permitida: {exc}")


def op_rpc(fn: str, body: bytes) -> str:
    """Invoca una RPC permitida (whitelist) con argumentos nombrados.

    Los argumentos se pasan como literales SQL seguros (nunca interpolación directa)
    y solo se autorizan funciones explícitamente listadas en ALLOWED_RPC.
    """
    if fn not in ALLOWED_RPC:
        raise BadRequest(f"RPC no permitida: {fn!r}.")
    data = json.loads(body.decode("utf-8") or "{}")
    if not isinstance(data, dict) or not data:
        raise BadRequest("El cuerpo RPC debe ser un objeto JSON con argumentos nombrados.")
    args: list[str] = []
    for key, value in data.items():
        name = check_ident(key)
        if value is None:
            args.append(f"{name} => NULL")
        elif isinstance(value, bool):
            args.append(f"{name} => {str(value).upper()}")
        elif isinstance(value, (int, float)):
            args.append(f"{name} => {value}")
        else:
            args.append(f"{name} => {sql_literal(str(value))}")
    sql = f"SELECT COALESCE(public.{check_ident(fn)}({', '.join(args)})::text, 'null');"
    return run_psql(sql)


# ---------------------------------------------------------------------------------------
# Servidor HTTP
# ---------------------------------------------------------------------------------------
class BridgeHandler(BaseHTTPRequestHandler):
    server_version = "CORPOELEC-LocalPG-Bridge/1.0"
    protocol_version = "HTTP/1.1"

    # --- utilidades de respuesta ---
    def _cors(self) -> None:
        # CORS restringido: se refleja el Origin SOLO si pertenece a una app local.
        origin = self.headers.get("Origin", "")
        if origin and ALLOWED_ORIGIN_RE.match(origin):
            self.send_header("Access-Control-Allow-Origin", origin)
            self.send_header("Vary", "Origin")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE, OPTIONS")
        self.send_header(
            "Access-Control-Allow-Headers",
            "Content-Type, Accept, apikey, Authorization, Prefer, Range, X-Client-Info",
        )
        self.send_header("Access-Control-Max-Age", "86400")

    def _authorized(self) -> bool:
        """Valida la clave del puente (cabecera apikey o Authorization: Bearer)."""
        provided = self.headers.get("apikey") or ""
        if not provided:
            auth = self.headers.get("Authorization") or ""
            if auth.lower().startswith("bearer "):
                provided = auth[7:].strip()
        return bool(provided) and hmac.compare_digest(provided, BRIDGE_API_KEY)

    def _send(self, status: int, payload, content_type: str = "application/json") -> None:
        if not isinstance(payload, (bytes, bytearray)):
            payload = str(payload).encode("utf-8")
        self.send_response(status)
        self._cors()
        self.send_header("Content-Type", content_type)
        self.send_header("Content-Length", str(len(payload)))
        self.end_headers()
        if self.command != "HEAD":
            self.wfile.write(payload)

    def _json(self, status: int, obj) -> None:
        self._send(status, json.dumps(obj, ensure_ascii=False, default=str).encode("utf-8"))

    def _error(self, status: int, message: str) -> None:
        self._json(status, {"error": {"status": status, "message": message}, "data": None})

    def log_message(self, fmt: str, *args) -> None:  # silenciar el log por defecto
        return

    def _logo(self, method: str, path: str, status: int) -> None:
        print(f"  {method:<6} {path:<70} -> {status}", flush=True)

    # --- dispatch ---
    def do_OPTIONS(self) -> None:  # noqa: N802
        self.send_response(204)
        self._cors()
        self.send_header("Content-Length", "0")
        self.end_headers()

    def do_GET(self) -> None:  # noqa: N802
        self._dispatch("GET")

    def do_POST(self) -> None:  # noqa: N802
        self._dispatch("POST")

    def do_PATCH(self) -> None:  # noqa: N802
        self._dispatch("PATCH")

    def do_DELETE(self) -> None:  # noqa: N802
        self._dispatch("DELETE")

    def _dispatch(self, method: str) -> None:
        parsed = urlparse(self.path)
        path = parsed.path.rstrip("/") or "/"
        params = parse_qs(parsed.query, keep_blank_values=True)
        schema = params.get("schema", ["public"])[0] or "public"

        length = int(self.headers.get("Content-Length") or 0)
        body = self.rfile.read(length) if length else b""
        if body.startswith(b"\xef\xbb\xbf"):  # tolerar BOM UTF-8
            body = body[3:]

        try:
            if path == "/health":
                self._json(200, self._health())
                self._logo(method, path, 200)
                return

            # Defensa en profundidad: toda operación de datos exige la clave del puente.
            if not self._authorized():
                self._error(401, "No autorizado: falta o es inválida la cabecera 'apikey'.")
                self._logo(method, path, 401)
                return

            if path == "/api/database/advance/rawsql" and method == "POST":
                if not ALLOW_RAWSQL:
                    self._error(403, "rawsql deshabilitado (BRIDGE_ALLOW_RAWSQL=true para habilitar).")
                    self._logo(method, path, 403)
                    return
                payload = op_rawsql(body)
                self._send(200, payload)
                self._logo(method, path, 200)
                return

            rpc_prefix = "/api/database/rpc/"
            if path.startswith(rpc_prefix) and method == "POST":
                fn = unquote(path[len(rpc_prefix):]).strip("/")
                payload = op_rpc(fn, body)
                self._send(200, payload)
                self._logo(method, path, 200)
                return

            records_prefix = "/api/database/records/"
            if path.startswith(records_prefix):
                table = unquote(path[len(records_prefix):])
                table = table.strip("/")
                if not table or "/" in table:
                    raise BadRequest("Tabla inválida en la ruta.")

                if method == "GET":
                    payload = op_select(schema, table, params)
                elif method == "POST":
                    payload = op_insert(schema, table, body)
                elif method == "PATCH":
                    payload = op_update(schema, table, params, body)
                elif method == "DELETE":
                    payload = op_delete(schema, table, params)
                else:
                    self._error(405, f"Método {method} no permitido.")
                    return
                self._send(200, payload)
                self._logo(method, f"{path}?schema={schema}", 200)
                return

            self._error(404, f"Ruta no encontrada: {path}")
            self._logo(method, path, 404)
        except NotFound as exc:
            self._error(404, str(exc))
            self._logo(method, path, 404)
        except BadRequest as exc:
            self._error(400, str(exc))
            self._logo(method, path, 400)
        except SqlError as exc:
            self._error(500, f"Error SQL: {exc}")
            self._logo(method, path, 500)
        except ValueError as exc:
            self._error(400, str(exc))
            self._logo(method, path, 400)
        except Exception as exc:  # noqa: BLE001
            self._error(500, f"Error interno del puente: {exc}")
            self._logo(method, path, 500)

    def _health(self) -> dict:
        info = {
            "ok": True,
            "service": "CORPOELEC Local PostgreSQL Bridge (InsForge-compatible)",
            "database": PG_DSN_LABEL,
            "psql": PSQL,
            "objects": {},
        }
        try:
            rows = run_psql(
                "SELECT COALESCE(json_agg(row_to_json(t)), '[]') FROM ("
                " SELECT table_schema, count(*)::int AS total"
                " FROM information_schema.tables"
                " WHERE table_schema IN ('core','sigad','sigad_sen','public')"
                " GROUP BY table_schema ORDER BY table_schema"
                ") t;"
            )
            info["objects"] = json.loads(rows or "[]")
            info["status"] = "online"
        except Exception as exc:  # noqa: BLE001
            info["ok"] = False
            info["status"] = "offline"
            info["error"] = str(exc)
        return info


class BridgeServer(ThreadingHTTPServer):
    daemon_threads = True

    def handle_error(self, request, client_address):
        exc = sys.exc_info()[1]
        if isinstance(exc, (ConnectionResetError, ConnectionAbortedError, BrokenPipeError)):
            return  # clientes que cierran la conexión: normal en fetch/curl
        super().handle_error(request, client_address)


def check_connection() -> int:
    print("=" * 88)
    print("🔎 DIAGNÓSTICO DEL PUENTE LOCAL (PostgreSQL 18)")
    print("=" * 88)
    print(f"  psql   : {PSQL}")
    print(f"  destino: {PG_DSN_LABEL}")
    try:
        version = run_psql("SELECT version();")
        print(f"  versión: {version.split(',')[0]}")
        rows = run_psql(
            "SELECT COALESCE(json_agg(row_to_json(t)), '[]') FROM ("
            " SELECT table_schema AS schema, count(*)::int AS objetos"
            " FROM information_schema.tables"
            " WHERE table_schema IN ('core','sigad','sigad_sen','public')"
            " GROUP BY table_schema ORDER BY table_schema) t;"
        )
        print(f"  objetos: {rows}")
        print("✅ Conexión local verificada.\n")
        return 0
    except Exception as exc:  # noqa: BLE001
        print(f"❌ No se pudo conectar: {exc}\n")
        return 1


def main(argv: list[str]) -> int:
    global BRIDGE_PORT, BRIDGE_HOST
    if "--check" in argv:
        return check_connection()
    if "--port" in argv:
        BRIDGE_PORT = int(argv[argv.index("--port") + 1])
    if "--host" in argv:
        BRIDGE_HOST = argv[argv.index("--host") + 1]

    print("=" * 88)
    print("🌉 CORPOELEC GGPD — PUENTE REST LOCAL COMPATIBLE CON INSFORGE")
    print("=" * 88)
    print(f"  Escuchando en : http://{BRIDGE_HOST}:{BRIDGE_PORT}")
    print(f"  PostgreSQL    : {PG_DSN_LABEL}")
    print(f"  psql          : {PSQL}")
    print("  Modo offline  : SIGAD/SIGA-SEN locales usarán esta pasarela (sin internet).")
    print("=" * 88)
    print("  Ctrl+C para detener.\n")

    httpd = BridgeServer((BRIDGE_HOST, BRIDGE_PORT), BridgeHandler)
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n⏹  Puente detenido.")
    finally:
        httpd.server_close()
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
