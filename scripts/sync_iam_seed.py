#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
========================================================================================
CORPOELEC - GGPD | 🔐 SINCRONIZADOR DE LA SEMILLA IAM (InsForge Cloud -> PostgreSQL local)
========================================================================================

Genera `database/local_iam_seed.sql` (archivo NO versionado — ver .gitignore) con los
usuarios de la tabla maestra `core.mae_usuarios_sistema` y sus hashes bcrypt, para que el
modo OFFLINE (PostgreSQL 18 local) autentique con las MISMAS contraseñas institucionales
a través del puente local.

No se versionan los hashes: el archivo resultante queda excluido por .gitignore y debe
regenerarse (con internet) cuando cambie el padrón de usuarios.

Uso:
    python scripts/sync_iam_seed.py
    python scripts/sync_iam_seed.py --out database/local_iam_seed.sql
"""

from __future__ import annotations

import json
import sys
import urllib.request
from pathlib import Path

from local_pg_common import REPO_ROOT, env, sql_literal

FIELDS = [
    "id", "username", "cedula", "full_name", "email", "google_email",
    "password_hash", "role_code", "estado_codigo", "unidad_organizativa", "cargo",
    "status", "permiso_sigi", "permiso_sctis", "permiso_scein", "permiso_scppe",
    "permiso_scmtp", "permiso_gdrive", "permiso_scgcc", "permiso_sigad", "permiso_siga_sen",
]

DEFAULT_OUT = REPO_ROOT / "database" / "local_iam_seed.sql"

# Columnas que se refrescan en un conflicto (nunca el id)
UPDATE_COLS = [c for c in FIELDS if c != "id"]


def _read_app_env() -> dict[str, str]:
    """Lee apps-refactorizadas/SIGAD-REF/.env (URL/clave admin de InsForge)."""
    data: dict[str, str] = {}
    envf = REPO_ROOT / "apps-refactorizadas" / "SIGAD-REF" / ".env"
    if envf.exists():
        for line in envf.read_text(encoding="utf-8").splitlines():
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                k, v = line.split("=", 1)
                data[k.strip()] = v.strip().strip('"').strip("'")
    return data


def _cloud_creds() -> tuple[str, str]:
    app = _read_app_env()
    url = (
        env("INSFORGE_URL") or env("VITE_INSFORGE_URL")
        or app.get("VITE_INSFORGE_URL") or "https://wxkeqf37.ap-southeast.insforge.app"
    ).rstrip("/")
    key = (
        env("INSFORGE_API_KEY") or env("VITE_INSFORGE_API_KEY")
        or app.get("VITE_INSFORGE_API_KEY") or ""
    ).strip()
    if not key:
        raise SystemExit("❌ No se encontró la clave de InsForge (INSFORGE_API_KEY / VITE_INSFORGE_API_KEY).")
    return url, key


def fetch_users(url: str, key: str) -> list[dict]:
    sql = "SELECT COALESCE(json_agg(t ORDER BY t.username), '[]') FROM (SELECT " + \
          ", ".join(FIELDS) + " FROM core.mae_usuarios_sistema) t;"
    body = json.dumps({"query": sql}).encode("utf-8")
    req = urllib.request.Request(
        f"{url}/api/database/advance/rawsql",
        data=body,
        headers={
            "Content-Type": "application/json",
            "apikey": key,
            "Authorization": f"Bearer {key}",
        },
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=60) as resp:  # noqa: S310 (URL controlada)
        payload = json.loads(resp.read().decode("utf-8"))
    rows = payload.get("rows") or []
    if not rows:
        return []
    first = rows[0]
    value = next(iter(first.values())) if isinstance(first, dict) else first
    return value or []


def _lit(value) -> str:
    if value is None:
        return "NULL"
    if isinstance(value, bool):
        return "TRUE" if value else "FALSE"
    return sql_literal(str(value))


def render_seed(users: list[dict]) -> str:
    cols = ", ".join(FIELDS)
    lines = [
        "-- ====================================================================================",
        "-- SEMILLA IAM LOCAL (generada por scripts/sync_iam_seed.py) — NO VERSIONAR",
        "-- Contiene hashes bcrypt de las cuentas institucionales. Uso exclusivo del modo offline.",
        f"-- Usuarios: {len(users)}",
        "-- ====================================================================================",
        "BEGIN;",
    ]
    for u in users:
        values = ", ".join(_lit(u.get(c)) for c in FIELDS)
        updates = ", ".join(f"{c} = EXCLUDED.{c}" for c in UPDATE_COLS)
        lines.append(
            f"INSERT INTO core.mae_usuarios_sistema ({cols})\n"
            f"VALUES ({values})\n"
            f"ON CONFLICT (username) DO UPDATE SET {updates};"
        )
    lines.append("COMMIT;")
    lines.append("")
    return "\n".join(lines)


def main(argv: list[str]) -> int:
    out = DEFAULT_OUT
    if "--out" in argv:
        out = Path(argv[argv.index("--out") + 1])

    url, key = _cloud_creds()
    print("=" * 88)
    print("🔐 CORPOELEC GGPD — SINCRONIZACIÓN DE LA SEMILLA IAM LOCAL")
    print("=" * 88)
    print(f"  Origen : {url} (core.mae_usuarios_sistema)")
    print(f"  Destino: {out}")

    users = fetch_users(url, key)
    if not users:
        print("⚠️  No se obtuvieron usuarios. ¿Clave/URL correctas?")
        return 1

    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(render_seed(users), encoding="utf-8")
    print(f"  ✅ {len(users)} usuarios exportados -> {out}")
    print("     (archivo NO versionado; aplíquelo con: python scripts/setup_local_postgres.py --only iam)")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
