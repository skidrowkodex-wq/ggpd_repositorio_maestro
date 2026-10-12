#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
========================================================================================
CORPOELEC - GGPD | Utilidades comunes para el modo local (PostgreSQL 18 en 127.0.0.1)
========================================================================================
Módulo compartido por:
  - scripts/local_pg_bridge.py   (puente REST compatible con InsForge)
  - scripts/setup_local_postgres.py (aprovisiona core / sigad / sigad_sen en local)

Cero dependencias externas: solo stdlib + el binario `psql` que ya trae PostgreSQL.
Las credenciales se leen de variables de entorno o de `.env.local` (nunca hardcodeadas).
"""

from __future__ import annotations

import json
import os
import re
import subprocess
import sys
from pathlib import Path

# Consolas Windows (cp1252) no soportan emojis/acentos: forzar UTF-8 en stdout/stderr.
for _stream in (sys.stdout, sys.stderr):
    try:
        _stream.reconfigure(encoding="utf-8")  # type: ignore[union-attr]
    except Exception:
        pass

REPO_ROOT = Path(__file__).resolve().parent.parent

# ---------------------------------------------------------------------------------------
# Carga de variables (.env.local tiene prioridad sobre .env)
# ---------------------------------------------------------------------------------------
def load_env_file(path: Path) -> dict:
    data: dict[str, str] = {}
    if not path.exists():
        return data
    for line in path.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if line and not line.startswith("#") and "=" in line:
            key, value = line.split("=", 1)
            data[key.strip()] = value.strip().strip('"').strip("'")
    return data


_ENV_FILE: dict[str, str] = {}
for _p in (REPO_ROOT / ".env", REPO_ROOT / ".env.local"):
    _ENV_FILE.update(load_env_file(_p))


def env(name: str, default: str = "") -> str:
    """Prioriza variables de entorno reales; cae a .env/.env.local."""
    return os.getenv(name) or _ENV_FILE.get(name) or default


# ---------------------------------------------------------------------------------------
# Conexión PostgreSQL local
# ---------------------------------------------------------------------------------------
PGHOST = env("PGHOST", "127.0.0.1")
PGPORT = env("PGPORT", "5432")
PGUSER = env("PGUSER", "fullstack001")
PGPASSWORD = env("PGPASSWORD", "Lunes35.")
PGDATABASE = env("PGDATABASE", "cnd_sen_unifilar_2025")

# Etiqueta visible en consola para confirmar contra qué BD se está trabajando.
PG_DSN_LABEL = f"{PGUSER}@{PGHOST}:{PGPORT}/{PGDATABASE}"


def find_psql() -> str:
    """Localiza psql.exe (env PSQL_PATH -> instalaciones estándar -> PATH)."""
    explicit = env("PSQL_PATH")
    if explicit and Path(explicit).exists():
        return explicit
    for base in (r"C:\Program Files\PostgreSQL", r"C:\Program Files (x86)\PostgreSQL"):
        root = Path(base)
        if root.exists():
            versions = sorted(
                (d for d in root.iterdir() if d.is_dir()),
                key=lambda d: [int(x) for x in re.findall(r"\d+", d.name)] or [0],
                reverse=True,
            )
            for ver in versions:
                exe = ver / "bin" / "psql.exe"
                if exe.exists():
                    return str(exe)
    from shutil import which

    return which("psql") or "psql"


PSQL = find_psql()


class SqlError(RuntimeError):
    """Error devuelto por psql."""


def run_psql(sql: str, database: str | None = None, aligned: bool = False) -> str:
    """Ejecuta SQL por stdin y devuelve stdout.

    Se usa stdin (no argumentos) para no chocar con el límite de longitud de la
    línea de comandos de Windows al insertar payloads grandes.
    `aligned=False` (por defecto) => salida limpia para parsear (-t -A).
    """
    cmd = [
        PSQL, "-X", "-q", "-w",
        "-v", "ON_ERROR_STOP=1",
        "-h", PGHOST, "-p", PGPORT, "-U", PGUSER, "-d", database or PGDATABASE,
    ]
    if not aligned:
        cmd[1:1] = ["-t", "-A"]

    child_env = os.environ.copy()
    child_env["PGPASSWORD"] = PGPASSWORD
    child_env["PGCLIENTENCODING"] = "UTF8"

    res = subprocess.run(
        cmd, input=sql, capture_output=True, text=True,
        encoding="utf-8", errors="replace", env=child_env,
    )
    if res.returncode != 0:
        raise SqlError(res.stderr.strip() or f"psql exit code {res.returncode}")
    return res.stdout.strip()


def run_sql_file(path: str | Path, database: str | None = None, on_error_stop: bool = True) -> str:
    """Ejecuta un archivo .sql completo (psql -f).

    Con `on_error_stop=False` no aborta ante filas defectuosas: carga las válidas y
    devuelve el stderr para que el llamador audite el número de errores.
    """
    cmd = [
        PSQL, "-X", "-q", "-w", "-v", f"ON_ERROR_STOP={'1' if on_error_stop else '0'}",
        "-h", PGHOST, "-p", PGPORT, "-U", PGUSER, "-d", database or PGDATABASE,
        "-f", str(path),
    ]
    child_env = os.environ.copy()
    child_env["PGPASSWORD"] = PGPASSWORD
    child_env["PGCLIENTENCODING"] = "UTF8"
    res = subprocess.run(cmd, capture_output=True, text=True, encoding="utf-8", errors="replace", env=child_env)
    if on_error_stop and res.returncode != 0:
        raise SqlError(res.stderr.strip() or f"psql exit code {res.returncode}")
    return res.stderr


# ---------------------------------------------------------------------------------------
# Seguridad SQL: validación de identificadores y literales
# ---------------------------------------------------------------------------------------
IDENT_RE = re.compile(r"^[a-z_][a-z0-9_]*$")


def check_ident(name: str) -> str:
    """Valida un identificador (schema/tabla/columna) y lo devuelve entre comillas."""
    if not name or not IDENT_RE.match(name):
        raise ValueError(f"Identificador inválido: {name!r}")
    return '"' + name + '"'


def sql_literal(value: str) -> str:
    """Literal de texto seguro (escapa comillas simples, sin backslash-escapes)."""
    return "'" + str(value).replace("'", "''") + "'"


def dollar_tag(payload: str, base: str = "bridge") -> str:
    """Devuelve una etiqueta de dollar-quoting ($tag$) ausente en el payload."""
    tag = base
    i = 0
    while f"${tag}$" in payload:
        i += 1
        tag = f"{base}{i}"
    return tag


def json_text(value) -> str:
    return json.dumps(value, ensure_ascii=False, default=str)
