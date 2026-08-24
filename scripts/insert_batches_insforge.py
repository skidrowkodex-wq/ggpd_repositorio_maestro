#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Batch insert 871 SEs and 4,207 CTs into insforge-bk with sanitized numeric types.
"""

import json
import re
import subprocess
import time
import sys

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

def clean_numeric(val):
    if val is None or val == '':
        return "NULL"
    if isinstance(val, (int, float)):
        return str(float(val))
    if isinstance(val, str):
        v_clean = val.replace(',', '.').strip()
        try:
            return str(float(v_clean))
        except ValueError:
            m = re.search(r'(\d+(?:\.\d+)?)', v_clean)
            if m:
                return str(float(m.group(1)))
    return "NULL"

def escape_sql(val):
    if val is None:
        return "NULL"
    if isinstance(val, bool):
        return "TRUE" if val else "FALSE"
    if isinstance(val, (int, float)):
        return str(val)
    if isinstance(val, dict):
        return "'" + json.dumps(val).replace("'", "''") + "'::jsonb"
    clean = str(val).replace("'", "''")
    return f"'{clean}'"

def run_query(sql):
    res = subprocess.run(['npx', '@insforge/cli', 'db', 'query', sql], capture_output=True, text=True)
    if res.returncode != 0:
        print("SQL Error:", res.stderr, res.stdout)
        raise RuntimeError(f"Query failed with code {res.returncode}")
    return res.stdout

def main():
    with open('apps/corpoelec-sigi-gestion-planificacion-distribucion/src/data/masterCatalogsLegacy.json') as f:
        data = json.load(f)

    ses = data['caracterizacion']['subestaciones']
    cts = data['caracterizacion']['circuitos']

    print(f"Starting SE insert: {len(ses)} records...")
    batch_size = 100
    for i in range(0, len(ses), batch_size):
        chunk = ses[i:i+batch_size]
        vals = []
        for se in chunk:
            est_raw = se['estado'].strip().upper().replace('_', ' ')
            est_code = STATE_NAME_TO_CODE[est_raw]
            macro = 'TRANSMISION' if 'TRANSMISION' in se.get('tipo_instalacion', '').upper() else 'DISTRIBUCION'
            meta = {
                "region": se.get('region'),
                "nombre_original": se.get('nombre_se'),
                "observaciones_normalizacion": se.get('observaciones_normalizacion'),
                "tension_secundaria_raw": se.get('tension_secundaria_kv'),
                "tension_alimentador_raw": se.get('tension_alimentador_kv')
            }
            vals.append(f"""(
                {escape_sql(se['codigo'])}, {escape_sql(se['nombre_se_norm'])}, {escape_sql(est_code)}, {escape_sql(se.get('municipio'))}, {escape_sql(se.get('tipo_instalacion'))},
                {escape_sql(macro)}, {escape_sql(se.get('atendida_por'))}, {clean_numeric(se.get('tension_entrada_kv'))}, {clean_numeric(se.get('tension_secundaria_kv'))},
                {escape_sql(se.get('alimentador_principal'))}, {clean_numeric(se.get('tension_alimentador_kv'))}, {clean_numeric(se.get('area_se_m2'))}, {escape_sql(se.get('es_movil', False))},
                {escape_sql(se.get('estado_control', 'CONTROLADO'))}, {escape_sql(se.get('estado_caracterizacion', 'CARACTERIZADO'))}, {escape_sql(se.get('origen', 'CARACTERIZACION'))}, {escape_sql(meta)}
            )""")
        
        sql = f"""
        INSERT INTO core.mae_subestaciones (
            codigo_se, nombre_subestacion, codigo_estado, municipio, tipo_instalacion,
            macro_proceso, atendida_por, tension_entrada_kv, tension_secundaria_kv,
            alimentador_principal, tension_alimentador_kv, area_se_m2, es_movil,
            estado_control, estado_caracterizacion, origen_dato, metadata_tecnica
        ) VALUES {', '.join(vals)}
        ON CONFLICT (codigo_se) DO UPDATE SET
            nombre_subestacion = EXCLUDED.nombre_subestacion,
            codigo_estado = EXCLUDED.codigo_estado,
            actualizado_en = clock_timestamp();
        """
        run_query(sql)
        print(f"Inserted SEs up to {min(i+batch_size, len(ses))}/{len(ses)}")

    print(f"Starting CT insert: {len(cts)} records...")
    for i in range(0, len(cts), batch_size):
        chunk = cts[i:i+batch_size]
        vals = []
        for ct in chunk:
            est_raw = ct['estado'].strip().upper().replace('_', ' ')
            est_code = STATE_NAME_TO_CODE[est_raw]
            meta = {
                "region": ct.get('region'),
                "nombre_original": ct.get('circuito'),
                "observaciones_normalizacion": ct.get('observaciones_normalizacion')
            }
            vals.append(f"""(
                {escape_sql(ct['codigo'])}, {escape_sql(ct['nombre_ct_norm'])}, {escape_sql(ct['se_codigo'])}, {escape_sql(ct.get('subestacion_cabecera'))},
                {escape_sql(est_code)}, {clean_numeric(ct.get('nivel_tension_kv'))}, {escape_sql(ct.get('tipo_red', 'AÉREO'))}, {clean_numeric(ct.get('km_total', 0.0))}, {escape_sql(ct.get('elemento_tipo', 'CIRCUITO'))},
                {escape_sql(ct.get('elemento_tecnico_especifico', 'ALIMENTADOR_CONVENCIONAL'))}, {escape_sql(ct.get('codigo_maniobra_norma', 'CTO'))}, {escape_sql(ct.get('descripcion_elemento_tecnico'))},
                {escape_sql(ct.get('es_componente_patio', False))}, {escape_sql(ct.get('estado_control', 'CONTROLADO'))}, {escape_sql(ct.get('estado_caracterizacion', 'CARACTERIZADO'))}, {escape_sql(meta)}
            )""")

        sql = f"""
        INSERT INTO core.mae_circuitos (
            codigo_circuito, nombre_circuito, codigo_se_padre, subestacion_cabecera,
            codigo_estado, nivel_tension_kv, tipo_red, longitud_km, elemento_tipo,
            elemento_tecnico_especifico, codigo_maniobra_norma, descripcion_elemento_tecnico,
            es_componente_patio, estado_control, estado_caracterizacion, metadata_tecnica
        ) VALUES {', '.join(vals)}
        ON CONFLICT (codigo_circuito) DO UPDATE SET
            nombre_circuito = EXCLUDED.nombre_circuito,
            codigo_se_padre = EXCLUDED.codigo_se_padre,
            actualizado_en = clock_timestamp();
        """
        run_query(sql)
        print(f"Inserted CTs up to {min(i+batch_size, len(cts))}/{len(cts)}")

    # Create indexes and views
    print("Creating indexes and views...")
    post_sql = """
    CREATE INDEX IF NOT EXISTS idx_se_estado ON core.mae_subestaciones (codigo_estado);
    CREATE INDEX IF NOT EXISTS idx_se_macro_proceso ON core.mae_subestaciones (macro_proceso);
    CREATE INDEX IF NOT EXISTS idx_ct_se_padre ON core.mae_circuitos (codigo_se_padre);
    CREATE INDEX IF NOT EXISTS idx_ct_estado ON core.mae_circuitos (codigo_estado);
    CREATE INDEX IF NOT EXISTS idx_ct_tension ON core.mae_circuitos (nivel_tension_kv);

    CREATE OR REPLACE VIEW public.mae_subestaciones AS SELECT * FROM core.mae_subestaciones;
    CREATE OR REPLACE VIEW public.mae_circuitos AS SELECT * FROM core.mae_circuitos;

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
    """
    run_query(post_sql)
    print("ALL DONE SUCCESSFULLY!")

if __name__ == '__main__':
    main()
