#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
========================================================================================
CORPOELEC - GGPD | 🧱 APROVISIONADOR LOCAL PostgreSQL 18 (Modo offline de SIGAD/SIGA-SEN)
========================================================================================

Deja la base local (`cnd_sen_unifilar_2025`) con PARIDAD 1:1 respecto a InsForge para que
SIGAD y SIGA-SEN funcionen en local sin internet:

  • core       -> sql_insforge_01_core_schema.sql + sql_insforge_02_canonical_assets.sql
                  (871 subestaciones + 4.207 circuitos canónicos) + core.v_activos_sen_integrados
  • sigad      -> estructuras_subestaciones, componentes_patio, eventos_historial
                  + sigad.v_componentes_indisponibles
  • sigad_sen  -> 10 tablas CND (desde database/cnd_sen_unifilar_2025_pg.sql, cargadas en el
                  esquema sigad_sen) + columna `codigo` (slug CND-*, misma regla que el seed)
                  + índice + las 4 vistas que consume SIGA-SEN.

Idempotente y NO destructivo sobre `public`: las tablas CND se crean dentro de `sigad_sen`
con `search_path` limitado a ese esquema, por lo que la data existente en `public` no se toca.

Uso:
    python scripts/setup_local_postgres.py            # aprovisiona todo
    python scripts/setup_local_postgres.py --verify   # solo audita lo existente
"""

from __future__ import annotations

import re
import sys
import tempfile
from pathlib import Path

from local_pg_common import (
    PGDATABASE,
    PG_DSN_LABEL,
    PGPASSWORD,
    PGHOST,
    PGPORT,
    PGUSER,
    PSQL,
    REPO_ROOT,
    SqlError,
    env,
    run_psql,
    run_sql_file,
)

CND_DUMP = REPO_ROOT / "database" / "cnd_sen_unifilar_2025_pg.sql"
CORE_SCHEMA_SQL = REPO_ROOT / "sql_insforge_01_core_schema.sql"
CORE_ASSETS_SQL = REPO_ROOT / "sql_insforge_02_canonical_assets.sql"

# ---------------------------------------------------------------------------------------
# DDL: esquema sigad (idéntico a scripts/deploy_insforge_activos_federados.py -> deploy_sigad)
# ---------------------------------------------------------------------------------------
SIGAD_DDL = """
CREATE SCHEMA IF NOT EXISTS sigad;

CREATE TABLE IF NOT EXISTS sigad.estructuras_subestaciones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    se_codigo VARCHAR(50) UNIQUE NOT NULL,
    nombre_se VARCHAR(150),
    estado_territorio VARCHAR(50),
    region VARCHAR(50),
    datos_estructura JSONB NOT NULL DEFAULT '{}'::jsonb,
    total_bahias INT DEFAULT 0,
    total_componentes INT DEFAULT 0,
    total_indisponibles INT DEFAULT 0,
    actualizado_por VARCHAR(100) DEFAULT 'SISTEMA_SIGAD',
    creado_en TIMESTAMPTZ DEFAULT NOW(),
    actualizado_en TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_sigad_estructuras_se_codigo ON sigad.estructuras_subestaciones(se_codigo);

CREATE TABLE IF NOT EXISTS sigad.componentes_patio (
    id VARCHAR(100) PRIMARY KEY,
    se_codigo VARCHAR(50) NOT NULL,
    bahia_id VARCHAR(100) NOT NULL,
    circuito_codigo VARCHAR(50),
    codigo_norma VARCHAR(50) NOT NULL,
    nombre_equipo VARCHAR(150) NOT NULL,
    tipo_elemento VARCHAR(50) NOT NULL,
    estado_operativo VARCHAR(50) NOT NULL DEFAULT 'EN_SERVICIO',
    tension_kv NUMERIC(8,2),
    capacidad_mva NUMERIC(8,2),
    fabricante VARCHAR(100),
    modelo VARCHAR(100),
    serial VARCHAR(100),
    anio_instalacion INT,
    nivel_aceite VARCHAR(30) DEFAULT 'N/A',
    tecnologia_corte VARCHAR(30) DEFAULT 'N/A',
    presion_sf6_bar NUMERIC(6,2),
    alarma_activa BOOLEAN DEFAULT false,
    observaciones TEXT,
    actualizado_en TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_sigad_comp_se_codigo ON sigad.componentes_patio(se_codigo);
CREATE INDEX IF NOT EXISTS idx_sigad_comp_bahia ON sigad.componentes_patio(bahia_id);
CREATE INDEX IF NOT EXISTS idx_sigad_comp_estado ON sigad.componentes_patio(estado_operativo);

CREATE TABLE IF NOT EXISTS sigad.eventos_historial (
    id VARCHAR(100) PRIMARY KEY,
    se_codigo VARCHAR(50) NOT NULL,
    componente_id VARCHAR(100) NOT NULL,
    componente_nombre VARCHAR(150),
    codigo_norma VARCHAR(50),
    tipo_evento VARCHAR(50) NOT NULL,
    causa TEXT,
    descripcion TEXT,
    registrado_por VARCHAR(100) NOT NULL,
    es_reemplazo_nuevo BOOLEAN DEFAULT false,
    serial_anterior VARCHAR(100),
    serial_nuevo VARCHAR(100),
    capacidad_nueva_mva NUMERIC(8,2),
    sincronizado_scein BOOLEAN DEFAULT false,
    fecha_evento TIMESTAMPTZ DEFAULT NOW(),
    creado_en TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_sigad_eventos_se_codigo ON sigad.eventos_historial(se_codigo);
CREATE INDEX IF NOT EXISTS idx_sigad_eventos_comp ON sigad.eventos_historial(componente_id);
CREATE INDEX IF NOT EXISTS idx_sigad_eventos_fecha ON sigad.eventos_historial(fecha_evento);
"""

# ---------------------------------------------------------------------------------------
# Backfill canónico `codigo` (regla idéntica a scripts/generate_siga_sen_seed.py:67)
# ---------------------------------------------------------------------------------------
CODIGO_SQL = """
ALTER TABLE sigad_sen.cnd_subestaciones ADD COLUMN IF NOT EXISTS codigo varchar(120);
UPDATE sigad_sen.cnd_subestaciones
   SET codigo = 'CND-' || trim(both '-' from regexp_replace(nombre_normalizado, '[^A-Za-z0-9]', '-', 'g'))
 WHERE codigo IS NULL;
CREATE INDEX IF NOT EXISTS idx_sigad_sen_cnd_sub_codigo ON sigad_sen.cnd_subestaciones(codigo);
"""

# ---------------------------------------------------------------------------------------
# Vistas (espejo 1:1 de las desplegadas en InsForge)
# ---------------------------------------------------------------------------------------
SIGAD_SEN_VIEWS_SQL = """
CREATE OR REPLACE VIEW sigad_sen.v_subestaciones_resumen AS
SELECT s.id, s.nombre_cnd, s.nombre_normalizado, s.clasificacion, s.cuadrante_mural,
       s.tension_maxima_kv, s.tension_minima_kv, s.niveles_tension_lista,
       s.total_barras, s.total_transformadores, s.total_generadores, s.total_reactivos,
       s.capacidad_total_mw, s.capacidad_total_mva, s.capacidad_total_mvar, s.coord_x, s.coord_y
FROM sigad_sen.cnd_subestaciones s;

CREATE OR REPLACE VIEW sigad_sen.v_estadisticas_nacionales AS
SELECT
    (SELECT count(*)::integer FROM sigad_sen.cnd_subestaciones) AS total_nodos,
    (SELECT count(*)::integer FROM sigad_sen.cnd_subestaciones WHERE clasificacion = 'CENTRAL_GENERACION') AS centrales_generacion,
    (SELECT count(*)::integer FROM sigad_sen.cnd_subestaciones WHERE clasificacion = 'SUBESTACION_TRANSMISION') AS subestaciones_transmision,
    (SELECT COALESCE(sum(capacidad_total_mw), 0)::numeric(12,2) FROM sigad_sen.cnd_subestaciones) AS potencia_instalada_mw,
    (SELECT COALESCE(sum(capacidad_total_mva), 0)::numeric(12,2) FROM sigad_sen.cnd_subestaciones) AS capacidad_transformacion_mva,
    (SELECT COALESCE(sum(capacidad_total_mvar), 0)::numeric(12,2) FROM sigad_sen.cnd_subestaciones) AS compensacion_reactiva_mvar,
    (SELECT count(*)::integer FROM sigad_sen.cnd_barras) AS total_barras,
    (SELECT count(*)::integer FROM sigad_sen.cnd_lineas_tramos) AS total_lineas;

CREATE OR REPLACE VIEW sigad_sen.v_lineas_transmision AS
SELECT id, codigo_tension AS kv_code, tension_kv AS kv, color_hex AS color, grosor_pt AS grosor,
       x0, y0, x1, y1, longitud_aprox AS len, nodo_cercano_1 AS origen, nodo_cercano_2 AS destino
FROM sigad_sen.cnd_lineas_tramos;

DROP VIEW IF EXISTS sigad_sen.v_subestaciones_detalle;
CREATE VIEW sigad_sen.v_subestaciones_detalle AS
SELECT
    s.id, s.codigo, s.nombre_cnd, s.nombre_normalizado AS nombre_norm, s.clasificacion,
    s.cuadrante_mural AS cuadrante, s.coord_x, s.coord_y,
    jsonb_build_array(s.bbox_x0, s.bbox_y0, s.bbox_x1, s.bbox_y1) AS bbox,
    s.tension_maxima_kv AS tension_max_kv, s.tension_minima_kv AS tension_min_kv,
    s.niveles_tension_lista AS tensiones_lista,
    s.total_barras, s.total_transformadores, s.total_generadores, s.total_reactivos,
    s.capacidad_total_mva AS capacidad_mva, s.capacidad_total_mw AS capacidad_mw,
    s.capacidad_total_mvar AS capacidad_mvar,
    COALESCE(b.barras, '[]'::jsonb) AS barras,
    COALESCE(t.transformadores, '[]'::jsonb) AS transformadores,
    COALESCE(g.generacion, '[]'::jsonb) AS generacion,
    COALESCE(r.reactivos, '[]'::jsonb) AS reactivos
FROM sigad_sen.cnd_subestaciones s
LEFT JOIN (
    SELECT subestacion_id, jsonb_agg(jsonb_build_object(
        'id', id, 'codigo_tension', codigo_tension, 'tension_kv', tension_kv, 'color_hex', color_hex,
        'grosor', grosor_pt, 'orientacion', orientacion, 'longitud', longitud_pt,
        'x0', x0, 'y0', y0, 'x1', x1, 'y1', y1, 'cx', centro_x, 'cy', centro_y)) AS barras
    FROM sigad_sen.cnd_barras GROUP BY subestacion_id) b ON b.subestacion_id = s.id
LEFT JOIN (
    SELECT subestacion_id, jsonb_agg(jsonb_build_object(
        'id', id, 'raw', etiqueta_cruda, 'qty', unidades_count, 'unit_mva', mva_unitario,
        'total_mva', mva_total, 'cx', coord_x, 'cy', coord_y)) AS transformadores
    FROM sigad_sen.cnd_transformadores GROUP BY subestacion_id) t ON t.subestacion_id = s.id
LEFT JOIN (
    SELECT subestacion_id, jsonb_agg(jsonb_build_object(
        'id', id, 'raw', etiqueta_cruda, 'tag', detalle_maquinas, 'qty', unidades_count,
        'unit_mw', mw_unitario, 'total_mw', mw_total, 'fuente', tipo_fuente,
        'cx', coord_x, 'cy', coord_y)) AS generacion
    FROM sigad_sen.cnd_generacion GROUP BY subestacion_id) g ON g.subestacion_id = s.id
LEFT JOIN (
    SELECT subestacion_id, jsonb_agg(jsonb_build_object(
        'id', id, 'raw', etiqueta_cruda, 'tipo', tipo_equipo, 'qty', unidades_count,
        'unit_mvar', mvar_unitario, 'total_mvar', mvar_total,
        'cx', coord_x, 'cy', coord_y)) AS reactivos
    FROM sigad_sen.cnd_compensacion_reactiva GROUP BY subestacion_id) r ON r.subestacion_id = s.id;
"""

SIGAD_VIEWS_SQL = """
CREATE OR REPLACE VIEW sigad.v_componentes_indisponibles AS
SELECT c.id, c.se_codigo, c.codigo_norma, c.nombre_equipo, c.tipo_elemento, c.estado_operativo,
       c.tension_kv, c.capacidad_mva, c.serial, c.observaciones, c.actualizado_en
FROM sigad.componentes_patio c
WHERE c.estado_operativo IN ('INDISPONIBLE_FALLADO', 'EN_OBSERVACION');
"""

CORE_FEDERATED_VIEW_SQL = """
CREATE OR REPLACE VIEW core.v_activos_sen_integrados AS
SELECT
    se.codigo_se, se.nombre_subestacion, se.codigo_estado, se.tipo_instalacion, se.macro_proceso,
    se.tension_entrada_kv, se.tension_secundaria_kv,
    cnd.id AS cnd_id, cnd.nombre_cnd, cnd.cuadrante_mural,
    cnd.capacidad_total_mw AS cnd_capacidad_mw, cnd.capacidad_total_mva AS cnd_capacidad_mva,
    cnd.total_barras AS cnd_total_barras,
    est.total_bahias AS dist_total_bahias, est.total_componentes AS dist_total_componentes,
    est.total_indisponibles AS dist_total_indisponibles, est.actualizado_en AS dist_ultima_actualizacion
FROM core.mae_subestaciones se
LEFT JOIN sigad_sen.cnd_subestaciones cnd
    ON UPPER(TRIM(cnd.nombre_normalizado)) = UPPER(TRIM(se.nombre_subestacion))
LEFT JOIN sigad.estructuras_subestaciones est
    ON est.se_codigo::text = se.codigo_se::text;
"""


def banner(text: str) -> None:
    print("\n" + "=" * 88)
    print(text)
    print("=" * 88)


def _extract_numeric_bad_values(stderr: str) -> list[str]:
    """Extrae los literales rechazados por el parser numérico de PostgreSQL.

    El mensaje puede estar localizado («... tipo numeric: «12,47 y 8,3»") por lo que
    se ancla en la palabra 'numeric' y en las comillas angulares o dobles.
    """
    found: list[str] = []
    for match in re.finditer(r"numeric:\s*[«\"]([^»\"]*)[»\"]", stderr):
        value = match.group(1)
        if value not in found:
            found.append(value)
    return found


def provision_core() -> None:
    banner("1. APROVISIONANDO ESQUEMA 'core' (871 SE + 4.207 CT canónicos)")
    print(f"   · {CORE_SCHEMA_SQL.name} ...")
    run_sql_file(CORE_SCHEMA_SQL)
    print(f"   · {CORE_ASSETS_SQL.name} (7 MB) ...")

    # 1ª pasada tolerante: carga las filas válidas y detecta literales numéricos sucios.
    stderr = run_sql_file(CORE_ASSETS_SQL, on_error_stop=False)
    bad_values = _extract_numeric_bad_values(stderr)

    final_stderr = stderr
    if bad_values:
        print(f"   ⚠️  {len(bad_values)} literal(es) numérico(s) con datos sucios "
              f"(archivo canónico preexistente). Se neutralizan a NULL y se recargan:")
        for value in bad_values[:8]:
            print(f"      - {value!r}")
        sanitized = _sanitize_numeric_literals(CORE_ASSETS_SQL, bad_values)
        try:
            # 2ª pasada (definitiva): inserta las filas antes rechazadas y upserta el resto.
            final_stderr = run_sql_file(sanitized)
        finally:
            Path(sanitized).unlink(missing_ok=True)

    final_errors = [ln for ln in final_stderr.splitlines() if "ERROR:" in ln]
    if final_errors:
        print(f"   ⚠️  {len(final_errors)} error(es) persisten tras la limpieza:")
        for ln in final_errors[:5]:
            print(f"      - {ln.split('ERROR:', 1)[-1].strip()[:90]}")
    else:
        print("   ✅ Carga canónica sin errores (871 SE / 4.207 CT).")

    print("   ✅ core listo.")


def _sanitize_numeric_literals(src: Path, bad_values: list[str]) -> str:
    """Copia el SQL reemplazando los literales numéricos inválidos por NULL."""
    text = src.read_text(encoding="utf-8")
    for value in bad_values:
        text = text.replace("'" + value + "'", "NULL")
    tmp = tempfile.NamedTemporaryFile(
        "w", encoding="utf-8", suffix="_core_assets_clean.sql", delete=False
    )
    tmp.write(text)
    tmp.close()
    return tmp.name


def provision_sigad() -> None:
    banner("2. APROVISIONANDO ESQUEMA 'sigad' (bahías CADAFE, componentes y eventos)")
    run_psql(SIGAD_DDL)
    print("   ✅ sigad listo.")


def provision_sigad_sen() -> None:
    banner("3. APROVISIONANDO ESQUEMA 'sigad_sen' (topología CND + vistas)")
    if not CND_DUMP.exists():
        raise FileNotFoundError(f"No existe el dump CND: {CND_DUMP}")

    # Se limita search_path a sigad_sen para NO tocar las tablas homónimas en public.
    dump = CND_DUMP.read_text(encoding="utf-8")
    composed = (
        "CREATE SCHEMA IF NOT EXISTS sigad_sen;\n"
        "SET search_path = sigad_sen;\n"
        "SET client_encoding = 'UTF8';\n"
        + dump
    )

    tmp = tempfile.NamedTemporaryFile(
        "w", encoding="utf-8", suffix="_sigad_sen.sql", delete=False
    )
    try:
        tmp.write(composed)
        tmp.close()
        print("   · Cargando 10 tablas CND en sigad_sen ...")
        run_sql_file(tmp.name)
    finally:
        Path(tmp.name).unlink(missing_ok=True)

    print("   · Añadiendo columna codigo + índice (slug CND-*) ...")
    run_psql(CODIGO_SQL)

    print("   · Creando las 4 vistas de SIGA-SEN ...")
    run_psql(SIGAD_SEN_VIEWS_SQL)
    print("   ✅ sigad_sen listo.")


def provision_views() -> None:
    banner("4. APROVISIONANDO VISTAS FEDERADAS (sigad + core)")
    run_psql(SIGAD_VIEWS_SQL)
    run_psql(CORE_FEDERATED_VIEW_SQL)
    print("   ✅ Vistas federadas listas.")


def verify() -> int:
    banner("5. AUDITORÍA DE LA BASE LOCAL")
    ok = True
    checks = {
        "core.mae_subestaciones": "SELECT count(*) FROM core.mae_subestaciones",
        "core.mae_circuitos": "SELECT count(*) FROM core.mae_circuitos",
        "sigad.estructuras_subestaciones": "SELECT count(*) FROM sigad.estructuras_subestaciones",
        "sigad.componentes_patio": "SELECT count(*) FROM sigad.componentes_patio",
        "sigad_sen.cnd_subestaciones": "SELECT count(*) FROM sigad_sen.cnd_subestaciones",
        "sigad_sen.v_subestaciones_detalle": "SELECT count(*) FROM sigad_sen.v_subestaciones_detalle",
        "sigad_sen.v_estadisticas_nacionales": "SELECT count(*) FROM sigad_sen.v_estadisticas_nacionales",
        "sigad_sen.v_lineas_transmision": "SELECT count(*) FROM sigad_sen.v_lineas_transmision",
        "core.v_activos_sen_integrados": "SELECT count(*) FROM core.v_activos_sen_integrados",
    }
    for label, query in checks.items():
        try:
            value = run_psql(query)
            print(f"   · {label:<42} {value:>8}")
        except SqlError as exc:
            ok = False
            print(f"   · {label:<42} ❌  {str(exc).splitlines()[0][:60]}")

    try:
        probe = run_psql(
            "SELECT codigo FROM sigad_sen.cnd_subestaciones "
            "WHERE nombre_normalizado = 'EL CONVENTO' LIMIT 1;"
        )
        print(f"   · {'codigo CND-EL-CONVENTO (prueba)':<42} {probe:>8}")
    except SqlError:
        ok = False

    print("\n" + ("✅ AUDITORÍA OK — modo local listo." if ok else "⚠️  Revisar objetos faltantes."))
    return 0 if ok else 1


def main(argv: list[str]) -> int:
    print("=" * 88)
    print("🧱 CORPOELEC GGPD — APROVISIONAMIENTO PostgreSQL LOCAL (modo offline)")
    print("=" * 88)
    print(f"  Destino : {PG_DSN_LABEL}")
    print(f"  psql    : {PSQL}")

    if "--verify" in argv:
        return verify()

    only = None
    if "--only" in argv:
        only = argv[argv.index("--only") + 1].strip().lower()

    steps = {
        "core": provision_core,
        "sigad": provision_sigad,
        "sigad_sen": provision_sigad_sen,
        "views": provision_views,
    }
    if only:
        if only not in steps:
            print(f"❌ --only inválido: {only}. Opciones: {list(steps)}")
            return 2
        steps[only]()
    else:
        provision_core()
        provision_sigad()
        provision_sigad_sen()
        provision_views()
    return verify()


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
