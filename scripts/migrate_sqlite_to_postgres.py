#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
========================================================================================
CORPOELEC - GGPD
Migración de Datos: SQLite -> PostgreSQL Local (cnd_sen_unifilar_2025)
Base de Datos Origen: database/cnd_sen_unifilar_2025.sqlite
Base de Datos Destino: PostgreSQL 18 Local (cnd_sen_unifilar_2025)
========================================================================================
"""

import os
import sys
import sqlite3
import subprocess

SQLITE_PATH = os.path.join("database", "cnd_sen_unifilar_2025.sqlite")
PG_SQL_PATH = os.path.join("database", "cnd_sen_unifilar_2025_pg.sql")
PSQL_PATH = r"C:\Program Files\PostgreSQL\18\bin\psql.exe"

PG_HOST = "127.0.0.1"
PG_PORT = "5432"
PG_USER = "fullstack001"
PG_DB = "cnd_sen_unifilar_2025"
PG_PASS = "Lunes35."


def escape_sql_val(val):
    if val is None:
        return "NULL"
    elif isinstance(val, (int, float)):
        return str(val)
    elif isinstance(val, bool):
        return "TRUE" if val else "FALSE"
    else:
        # Escape single quotes
        s = str(val).replace("'", "''")
        return f"'{s}'"


def generate_postgres_script():
    print(f"Leyendo base de datos SQLite: {SQLITE_PATH} ...")
    if not os.path.exists(SQLITE_PATH):
        raise FileNotFoundError(f"No existe: {SQLITE_PATH}")

    conn = sqlite3.connect(SQLITE_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()

    sql_lines = []
    sql_lines.append("-- ======================================================================")
    sql_lines.append("-- ESQUEMA Y DATOS POSTGRESQL: CND SEN UNIFILAR NACIONAL (MAYO 2025)")
    sql_lines.append(f"-- Generado para la BD: {PG_DB} | Usuario: {PG_USER}")
    sql_lines.append("-- ======================================================================\n")
    sql_lines.append("SET client_encoding = 'UTF8';\n")

    # DDL
    ddl = """
-- 1. Metadatos del Documento CND
DROP TABLE IF EXISTS cnd_lineas_tramos CASCADE;
DROP TABLE IF EXISTS cnd_rotulos_texto CASCADE;
DROP TABLE IF EXISTS cnd_generacion CASCADE;
DROP TABLE IF EXISTS cnd_compensacion_reactiva CASCADE;
DROP TABLE IF EXISTS cnd_transformadores CASCADE;
DROP TABLE IF EXISTS cnd_barras CASCADE;
DROP TABLE IF EXISTS cnd_subestaciones CASCADE;
DROP TABLE IF EXISTS cnd_clientes_industriales CASCADE;
DROP TABLE IF EXISTS cnd_niveles_tension CASCADE;
DROP TABLE IF EXISTS cnd_metadata CASCADE;

CREATE TABLE cnd_metadata (
    id SERIAL PRIMARY KEY,
    titulo TEXT NOT NULL,
    emisor TEXT NOT NULL,
    autor_dibujo TEXT,
    revisado_por TEXT,
    aprobado_por TEXT,
    fecha_emision TEXT,
    software_origen TEXT,
    ancho_pt NUMERIC(10,2),
    alto_pt NUMERIC(10,2),
    ancho_mm NUMERIC(10,2),
    alto_mm NUMERIC(10,2),
    total_bloques_texto INTEGER,
    total_geometrias INTEGER,
    fecha_extraccion TIMESTAMP
);

-- 2. Niveles de Tensión Canónicos CND
CREATE TABLE cnd_niveles_tension (
    id SERIAL PRIMARY KEY,
    codigo_tension TEXT UNIQUE NOT NULL,
    tension_kv NUMERIC(6,1) NOT NULL,
    nombre_sistema TEXT NOT NULL,
    color_hex TEXT NOT NULL,
    color_rgb TEXT NOT NULL,
    grosor_nominal_pt NUMERIC(5,2),
    descripcion TEXT
);

-- 3. Clientes Industriales y Organismos
CREATE TABLE cnd_clientes_industriales (
    id SERIAL PRIMARY KEY,
    sigla TEXT UNIQUE NOT NULL,
    nombre_completo TEXT NOT NULL,
    sector_categoria TEXT
);

-- 4. Subestaciones y Nodos del SEN
CREATE TABLE cnd_subestaciones (
    id SERIAL PRIMARY KEY,
    nombre_cnd TEXT NOT NULL,
    nombre_normalizado TEXT NOT NULL,
    coord_x NUMERIC(10,2) NOT NULL,
    coord_y NUMERIC(10,2) NOT NULL,
    bbox_x0 NUMERIC(10,2),
    bbox_y0 NUMERIC(10,2),
    bbox_x1 NUMERIC(10,2),
    bbox_y1 NUMERIC(10,2),
    cuadrante_mural TEXT,
    clasificacion TEXT,
    tension_maxima_kv NUMERIC(6,1),
    tension_minima_kv NUMERIC(6,1),
    niveles_tension_lista TEXT,
    total_patios INTEGER DEFAULT 0,
    total_barras INTEGER DEFAULT 0,
    total_transformadores INTEGER DEFAULT 0,
    total_generadores INTEGER DEFAULT 0,
    total_reactivos INTEGER DEFAULT 0,
    capacidad_total_mva NUMERIC(10,2) DEFAULT 0,
    capacidad_total_mw NUMERIC(10,2) DEFAULT 0,
    capacidad_total_mvar NUMERIC(10,2) DEFAULT 0
);

-- 5. Barras de Patio
CREATE TABLE cnd_barras (
    id SERIAL PRIMARY KEY,
    subestacion_id INTEGER REFERENCES cnd_subestaciones(id) ON DELETE SET NULL,
    subestacion_nombre TEXT,
    codigo_tension TEXT NOT NULL,
    tension_kv NUMERIC(6,1) NOT NULL,
    color_hex TEXT NOT NULL,
    grosor_pt NUMERIC(5,2) NOT NULL,
    orientacion VARCHAR(2),
    longitud_pt NUMERIC(10,2),
    x0 NUMERIC(10,2) NOT NULL,
    y0 NUMERIC(10,2) NOT NULL,
    x1 NUMERIC(10,2) NOT NULL,
    y1 NUMERIC(10,2) NOT NULL,
    centro_x NUMERIC(10,2) NOT NULL,
    centro_y NUMERIC(10,2) NOT NULL,
    distancia_subestacion NUMERIC(10,2)
);

-- 6. Transformadores de Potencia
CREATE TABLE cnd_transformadores (
    id SERIAL PRIMARY KEY,
    subestacion_id INTEGER REFERENCES cnd_subestaciones(id) ON DELETE SET NULL,
    subestacion_nombre TEXT,
    etiqueta_cruda TEXT,
    unidades_count INTEGER,
    mva_unitario NUMERIC(10,2),
    mva_total NUMERIC(10,2),
    coord_x NUMERIC(10,2) NOT NULL,
    coord_y NUMERIC(10,2) NOT NULL,
    distancia_subestacion NUMERIC(10,2)
);

-- 7. Compensación Reactiva
CREATE TABLE cnd_compensacion_reactiva (
    id SERIAL PRIMARY KEY,
    subestacion_id INTEGER REFERENCES cnd_subestaciones(id) ON DELETE SET NULL,
    subestacion_nombre TEXT,
    etiqueta_cruda TEXT,
    tipo_equipo TEXT,
    unidades_count INTEGER,
    mvar_unitario NUMERIC(10,2),
    mvar_total NUMERIC(10,2),
    coord_x NUMERIC(10,2) NOT NULL,
    coord_y NUMERIC(10,2) NOT NULL,
    distancia_subestacion NUMERIC(10,2)
);

-- 8. Grupos de Generación
CREATE TABLE cnd_generacion (
    id SERIAL PRIMARY KEY,
    subestacion_id INTEGER REFERENCES cnd_subestaciones(id) ON DELETE SET NULL,
    planta_nombre TEXT,
    etiqueta_cruda TEXT,
    detalle_maquinas TEXT,
    unidades_count INTEGER,
    mw_unitario NUMERIC(10,2),
    mw_total NUMERIC(10,2),
    tipo_fuente TEXT,
    coord_x NUMERIC(10,2) NOT NULL,
    coord_y NUMERIC(10,2) NOT NULL,
    distancia_subestacion NUMERIC(10,2)
);

-- 9. Tramos y Líneas de Transmisión
CREATE TABLE cnd_lineas_tramos (
    id SERIAL PRIMARY KEY,
    codigo_tension TEXT NOT NULL,
    tension_kv NUMERIC(6,1) NOT NULL,
    color_hex TEXT NOT NULL,
    grosor_pt NUMERIC(5,2) NOT NULL,
    tipo_geometria TEXT,
    x0 NUMERIC(10,2) NOT NULL,
    y0 NUMERIC(10,2) NOT NULL,
    x1 NUMERIC(10,2) NOT NULL,
    y1 NUMERIC(10,2) NOT NULL,
    longitud_aprox NUMERIC(10,2),
    nodo_cercano_1 TEXT,
    distancia_nodo_1 NUMERIC(10,2),
    nodo_cercano_2 TEXT,
    distancia_nodo_2 NUMERIC(10,2)
);

-- 10. Rótulos Completos
CREATE TABLE cnd_rotulos_texto (
    id SERIAL PRIMARY KEY,
    texto TEXT NOT NULL,
    x0 NUMERIC(10,2) NOT NULL,
    y0 NUMERIC(10,2) NOT NULL,
    x1 NUMERIC(10,2) NOT NULL,
    y1 NUMERIC(10,2) NOT NULL,
    centro_x NUMERIC(10,2) NOT NULL,
    centro_y NUMERIC(10,2) NOT NULL,
    fuente_nombre TEXT,
    fuente_tamano NUMERIC(5,2),
    categoria TEXT
);
"""
    sql_lines.append(ddl)

    # TABLES TO POPULATE IN ORDER
    tables = [
        "cnd_metadata",
        "cnd_niveles_tension",
        "cnd_clientes_industriales",
        "cnd_subestaciones",
        "cnd_barras",
        "cnd_transformadores",
        "cnd_compensacion_reactiva",
        "cnd_generacion",
        "cnd_lineas_tramos",
        "cnd_rotulos_texto",
    ]

    for tbl in tables:
        cursor.execute(f"PRAGMA table_info({tbl})")
        cols = [col[1] for col in cursor.fetchall()]
        cols_str = ", ".join(cols)

        cursor.execute(f"SELECT * FROM {tbl}")
        rows = cursor.fetchall()
        print(f"  Preparando datos para '{tbl}': {len(rows)} filas...")

        sql_lines.append(f"\n-- Datos para: {tbl} ({len(rows)} filas)")
        for r in rows:
            vals = [escape_sql_val(r[col]) for col in cols]
            vals_str = ", ".join(vals)
            sql_lines.append(f"INSERT INTO {tbl} ({cols_str}) VALUES ({vals_str});")

    # Indices
    indexes_sql = """
-- Índices para optimización
CREATE INDEX idx_pg_se_nombre ON cnd_subestaciones(nombre_normalizado);
CREATE INDEX idx_pg_se_clasif ON cnd_subestaciones(clasificacion);
CREATE INDEX idx_pg_se_cuadrante ON cnd_subestaciones(cuadrante_mural);
CREATE INDEX idx_pg_barras_se ON cnd_barras(subestacion_id);
CREATE INDEX idx_pg_barras_kv ON cnd_barras(tension_kv);
CREATE INDEX idx_pg_trx_se ON cnd_transformadores(subestacion_id);
CREATE INDEX idx_pg_react_se ON cnd_compensacion_reactiva(subestacion_id);
CREATE INDEX idx_pg_gen_se ON cnd_generacion(subestacion_id);
CREATE INDEX idx_pg_gen_fuente ON cnd_generacion(tipo_fuente);
CREATE INDEX idx_pg_lineas_kv ON cnd_lineas_tramos(tension_kv);
"""
    sql_lines.append(indexes_sql)

    # Reset sequences
    for tbl in tables:
        sql_lines.append(f"SELECT setval(pg_get_serial_sequence('{tbl}', 'id'), COALESCE(MAX(id), 1)) FROM {tbl};")

    with open(PG_SQL_PATH, "w", encoding="utf-8") as f_out:
        f_out.write("\n".join(sql_lines))

    print(f"\nArchivo PostgreSQL DDL/DML generado: {PG_SQL_PATH} ({os.path.getsize(PG_SQL_PATH) / 1024:.1f} KB)")
    conn.close()


def run_psql_import():
    print(f"\nImportando datos en PostgreSQL local '{PG_DB}'...")
    env = os.environ.copy()
    env["PGPASSWORD"] = PG_PASS

    res = subprocess.run(
        [
            PSQL_PATH,
            "-U", PG_USER,
            "-h", PG_HOST,
            "-p", PG_PORT,
            "-d", PG_DB,
            "-f", PG_SQL_PATH,
            "-q"
        ],
        env=env,
        capture_output=True,
        text=True,
        encoding="utf-8"
    )

    if res.returncode != 0:
        print("ERROR en la ejecución de psql:")
        print(res.stderr[:500])
        sys.exit(1)

    print("Importación completada con éxito!")

    # Verificación en PostgreSQL
    verify_cmd = [
        PSQL_PATH,
        "-U", PG_USER,
        "-h", PG_HOST,
        "-p", PG_PORT,
        "-d", PG_DB,
        "-c", """
        SELECT 'cnd_subestaciones' as tabla, count(*) as filas FROM cnd_subestaciones
        UNION ALL SELECT 'cnd_barras', count(*) FROM cnd_barras
        UNION ALL SELECT 'cnd_transformadores', count(*) FROM cnd_transformadores
        UNION ALL SELECT 'cnd_generacion', count(*) FROM cnd_generacion
        UNION ALL SELECT 'cnd_compensacion_reactiva', count(*) FROM cnd_compensacion_reactiva
        UNION ALL SELECT 'cnd_lineas_tramos', count(*) FROM cnd_lineas_tramos
        UNION ALL SELECT 'cnd_clientes_industriales', count(*) FROM cnd_clientes_industriales;
        """
    ]
    res_verify = subprocess.run(verify_cmd, env=env, capture_output=True, text=True, encoding="utf-8")
    print("\nAuditoría de Tablas en PostgreSQL Local:")
    print(res_verify.stdout)


if __name__ == "__main__":
    generate_postgres_script()
    run_psql_import()
