#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
==============================================================================
⚡ CORPOELEC - GGPD / INSFORGE-BK MDM CORE DEPLOYER
Genera e importa el modelo canónico de Subestaciones (871) y Circuitos (4,207)
en el backend PostgreSQL de InsForge (ggpd-data-maestra-0002).
==============================================================================
"""

import json
import subprocess
import os

STATE_NAME_TO_CODE = {
    'AMAZONAS': 'AMA',
    'ANZOATEGUI': 'ANZ',
    'ANZOÁTEGUI': 'ANZ',
    'APURE': 'APU',
    'ARAGUA': 'ARA',
    'BARINAS': 'BAR',
    'BOLIVAR': 'BOL',
    'BOLÍVAR': 'BOL',
    'CARABOBO': 'CAR',
    'COJEDES': 'COJ',
    'DELTA AMACURO': 'DEL',
    'DISTRITO CAPITAL': 'DCA',
    'FALCON': 'FAL',
    'FALCÓN': 'FAL',
    'GUARICO': 'GUA',
    'GUÁRICO': 'GUA',
    'LA GUAIRA': 'LGU',
    'VARGAS': 'LGU',
    'LARA': 'LAR',
    'MERIDA': 'MER',
    'MÉRIDA': 'MER',
    'MIRANDA': 'MIR',
    'MONAGAS': 'MON',
    'NUEVA ESPARTA': 'NES',
    'PORTUGUESA': 'POR',
    'SUCRE': 'SUC',
    'TACHIRA': 'TAC',
    'TÁCHIRA': 'TAC',
    'TRUJILLO': 'TRU',
    'YARACUY': 'YAR',
    'ZULIA': 'ZUL',
    'GUAYANA ESEQUIBA': 'GEQ',
    'NACIONAL': 'NAC'
}

def escape_sql(val):
    if val is None:
        return "NULL"
    if isinstance(val, bool):
        return "TRUE" if val else "FALSE"
    if isinstance(val, (int, float)):
        return str(val)
    if isinstance(val, dict):
        return "'" + json.dumps(val).replace("'", "''") + "'::jsonb"
    # String
    clean = str(val).replace("'", "''")
    return f"'{clean}'"

def main():
    json_path = 'apps/corpoelec-sigi-gestion-planificacion-distribucion/src/data/masterCatalogsLegacy.json'
    with open(json_path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    ses = data['caracterizacion']['subestaciones']
    cts = data['caracterizacion']['circuitos']

    sql_lines = []
    sql_lines.append("-- ==============================================================================")
    sql_lines.append("-- ⚡ CORPOELEC - GGPD / INSFORGE-BK: CANONICAL ASSETS MDM (871 SE + 4207 CT)")
    sql_lines.append("-- ==============================================================================\n")

    # 1. Tables DDL
    sql_lines.append("""
-- 1. Tabla Maestra: Subestaciones Eléctricas SEN
CREATE TABLE IF NOT EXISTS core.mae_subestaciones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    codigo_se VARCHAR(50) NOT NULL UNIQUE,
    nombre_subestacion VARCHAR(150) NOT NULL,
    codigo_estado VARCHAR(10) NOT NULL REFERENCES core.dim_estados(codigo_estado) ON UPDATE CASCADE,
    municipio VARCHAR(100),
    tipo_instalacion VARCHAR(50) DEFAULT 'SUBESTACION DISTRIBUCION',
    macro_proceso VARCHAR(30) NOT NULL DEFAULT 'DISTRIBUCION',
    atendida_por VARCHAR(50) DEFAULT 'DISTRIBUCIÓN',
    tension_entrada_kv NUMERIC(6,2),
    tension_secundaria_kv NUMERIC(6,2),
    alimentador_principal VARCHAR(150),
    tension_alimentador_kv NUMERIC(6,2),
    area_se_m2 NUMERIC(10,2),
    es_movil BOOLEAN NOT NULL DEFAULT false,
    estado_control VARCHAR(30) NOT NULL DEFAULT 'CONTROLADO',
    estado_caracterizacion VARCHAR(30) NOT NULL DEFAULT 'CARACTERIZADO',
    origen_dato VARCHAR(50) DEFAULT 'CARACTERIZACION',
    metadata_tecnica JSONB NOT NULL DEFAULT '{}'::jsonb,
    creado_en TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    actualizado_en TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

-- 2. Tabla Maestra: Circuitos y Alimentadores de Distribución SEN
CREATE TABLE IF NOT EXISTS core.mae_circuitos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    codigo_circuito VARCHAR(50) NOT NULL UNIQUE,
    nombre_circuito VARCHAR(150) NOT NULL,
    codigo_se_padre VARCHAR(50) NOT NULL REFERENCES core.mae_subestaciones(codigo_se) ON UPDATE CASCADE,
    subestacion_cabecera VARCHAR(150),
    codigo_estado VARCHAR(10) NOT NULL REFERENCES core.dim_estados(codigo_estado) ON UPDATE CASCADE,
    nivel_tension_kv NUMERIC(6,2),
    tipo_red VARCHAR(30) DEFAULT 'AÉREO',
    longitud_km NUMERIC(8,2) DEFAULT 0.0,
    elemento_tipo VARCHAR(50) DEFAULT 'CIRCUITO',
    elemento_tecnico_especifico VARCHAR(100) DEFAULT 'ALIMENTADOR_CONVENCIONAL',
    codigo_maniobra_norma VARCHAR(20) DEFAULT 'CTO',
    descripcion_elemento_tecnico TEXT,
    es_componente_patio BOOLEAN DEFAULT false,
    estado_control VARCHAR(30) NOT NULL DEFAULT 'CONTROLADO',
    estado_caracterizacion VARCHAR(30) NOT NULL DEFAULT 'CARACTERIZADO',
    metadata_tecnica JSONB NOT NULL DEFAULT '{}'::jsonb,
    creado_en TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    actualizado_en TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);
""")

    # 2. SE Population
    sql_lines.append("-- 3. Inserción de 871 Subestaciones Normalizadas")
    for se in ses:
        est_raw = se['estado'].strip().upper().replace('_', ' ')
        est_code = STATE_NAME_TO_CODE[est_raw]
        macro = 'TRANSMISION' if 'TRANSMISION' in se.get('tipo_instalacion', '').upper() else 'DISTRIBUCION'
        
        meta = {
            "region": se.get('region'),
            "nombre_original": se.get('nombre_se'),
            "observaciones_normalizacion": se.get('observaciones_normalizacion')
        }

        sql_lines.append(f"""INSERT INTO core.mae_subestaciones (
    codigo_se, nombre_subestacion, codigo_estado, municipio, tipo_instalacion,
    macro_proceso, atendida_por, tension_entrada_kv, tension_secundaria_kv,
    alimentador_principal, tension_alimentador_kv, area_se_m2, es_movil,
    estado_control, estado_caracterizacion, origen_dato, metadata_tecnica
) VALUES (
    {escape_sql(se['codigo'])}, {escape_sql(se['nombre_se_norm'])}, {escape_sql(est_code)}, {escape_sql(se.get('municipio'))}, {escape_sql(se.get('tipo_instalacion'))},
    {escape_sql(macro)}, {escape_sql(se.get('atendida_por'))}, {escape_sql(se.get('tension_entrada_kv'))}, {escape_sql(se.get('tension_secundaria_kv'))},
    {escape_sql(se.get('alimentador_principal'))}, {escape_sql(se.get('tension_alimentador_kv'))}, {escape_sql(se.get('area_se_m2'))}, {escape_sql(se.get('es_movil', False))},
    {escape_sql(se.get('estado_control', 'CONTROLADO'))}, {escape_sql(se.get('estado_caracterizacion', 'CARACTERIZADO'))}, {escape_sql(se.get('origen', 'CARACTERIZACION'))}, {escape_sql(meta)}
) ON CONFLICT (codigo_se) DO UPDATE SET
    nombre_subestacion = EXCLUDED.nombre_subestacion,
    codigo_estado = EXCLUDED.codigo_estado,
    municipio = EXCLUDED.municipio,
    tipo_instalacion = EXCLUDED.tipo_instalacion,
    macro_proceso = EXCLUDED.macro_proceso,
    atendida_por = EXCLUDED.atendida_por,
    tension_entrada_kv = EXCLUDED.tension_entrada_kv,
    tension_secundaria_kv = EXCLUDED.tension_secundaria_kv,
    alimentador_principal = EXCLUDED.alimentador_principal,
    tension_alimentador_kv = EXCLUDED.tension_alimentador_kv,
    area_se_m2 = EXCLUDED.area_se_m2,
    es_movil = EXCLUDED.es_movil,
    actualizado_en = clock_timestamp();""")

    # 3. CT Population
    sql_lines.append("\n-- 4. Inserción de 4,207 Circuitos Normalizados")
    for ct in cts:
        est_raw = ct['estado'].strip().upper().replace('_', ' ')
        est_code = STATE_NAME_TO_CODE[est_raw]

        meta = {
            "region": ct.get('region'),
            "nombre_original": ct.get('circuito'),
            "observaciones_normalizacion": ct.get('observaciones_normalizacion')
        }

        sql_lines.append(f"""INSERT INTO core.mae_circuitos (
    codigo_circuito, nombre_circuito, codigo_se_padre, subestacion_cabecera,
    codigo_estado, nivel_tension_kv, tipo_red, longitud_km, elemento_tipo,
    elemento_tecnico_especifico, codigo_maniobra_norma, descripcion_elemento_tecnico,
    es_componente_patio, estado_control, estado_caracterizacion, metadata_tecnica
) VALUES (
    {escape_sql(ct['codigo'])}, {escape_sql(ct['nombre_ct_norm'])}, {escape_sql(ct['se_codigo'])}, {escape_sql(ct.get('subestacion_cabecera'))},
    {escape_sql(est_code)}, {escape_sql(ct.get('nivel_tension_kv'))}, {escape_sql(ct.get('tipo_red', 'AÉREO'))}, {escape_sql(ct.get('km_total', 0.0))}, {escape_sql(ct.get('elemento_tipo', 'CIRCUITO'))},
    {escape_sql(ct.get('elemento_tecnico_especifico', 'ALIMENTADOR_CONVENCIONAL'))}, {escape_sql(ct.get('codigo_maniobra_norma', 'CTO'))}, {escape_sql(ct.get('descripcion_elemento_tecnico'))},
    {escape_sql(ct.get('es_componente_patio', False))}, {escape_sql(ct.get('estado_control', 'CONTROLADO'))}, {escape_sql(ct.get('estado_caracterizacion', 'CARACTERIZADO'))}, {escape_sql(meta)}
) ON CONFLICT (codigo_circuito) DO UPDATE SET
    nombre_circuito = EXCLUDED.nombre_circuito,
    codigo_se_padre = EXCLUDED.codigo_se_padre,
    subestacion_cabecera = EXCLUDED.subestacion_cabecera,
    codigo_estado = EXCLUDED.codigo_estado,
    nivel_tension_kv = EXCLUDED.nivel_tension_kv,
    tipo_red = EXCLUDED.tipo_red,
    longitud_km = EXCLUDED.longitud_km,
    elemento_tipo = EXCLUDED.elemento_tipo,
    elemento_tecnico_especifico = EXCLUDED.elemento_tecnico_especifico,
    codigo_maniobra_norma = EXCLUDED.codigo_maniobra_norma,
    descripcion_elemento_tecnico = EXCLUDED.descripcion_elemento_tecnico,
    es_componente_patio = EXCLUDED.es_componente_patio,
    actualizado_en = clock_timestamp();""")

    # 4. Indexes & Views
    sql_lines.append("""
-- 5. Índices de Rendimiento ISO / PostgreSQL
CREATE INDEX IF NOT EXISTS idx_se_estado ON core.mae_subestaciones (codigo_estado);
CREATE INDEX IF NOT EXISTS idx_se_macro_proceso ON core.mae_subestaciones (macro_proceso);
CREATE INDEX IF NOT EXISTS idx_ct_se_padre ON core.mae_circuitos (codigo_se_padre);
CREATE INDEX IF NOT EXISTS idx_ct_estado ON core.mae_circuitos (codigo_estado);
CREATE INDEX IF NOT EXISTS idx_ct_tension ON core.mae_circuitos (nivel_tension_kv);

-- 6. Vistas en esquema public para REST API / SDK
CREATE OR REPLACE VIEW public.mae_subestaciones AS SELECT * FROM core.mae_subestaciones;
CREATE OR REPLACE VIEW public.mae_circuitos AS SELECT * FROM core.mae_circuitos;

-- 7. Vista Unificada Semántica para Consultas de Analistas (Human Ergonomics)
CREATE OR REPLACE VIEW public.v_red_electrica_sen AS
SELECT 
    r.codigo_region,
    r.nombre_region,
    e.codigo_estado,
    e.nombre_estado,
    se.codigo_se,
    se.nombre_subestacion,
    se.tipo_instalacion AS tipo_subestacion,
    se.atendida_por,
    se.tension_entrada_kv AS se_tension_kv,
    ct.codigo_circuito,
    ct.nombre_circuito,
    ct.nivel_tension_kv AS ct_tension_kv,
    ct.tipo_red,
    ct.longitud_km,
    ct.elemento_tecnico_especifico,
    ct.codigo_maniobra_norma
FROM core.mae_circuitos ct
JOIN core.mae_subestaciones se ON ct.codigo_se_padre = se.codigo_se
JOIN core.dim_estados e ON ct.codigo_estado = e.codigo_estado
JOIN core.dim_regiones r ON e.codigo_region = r.codigo_region;

""")

    output_file = 'sql_insforge_02_canonical_assets.sql'
    with open(output_file, 'w', encoding='utf-8') as out:
        out.write('\n'.join(sql_lines))

    print(f"Generated {output_file} with {len(sql_lines)} lines.")

if __name__ == '__main__':
    main()
