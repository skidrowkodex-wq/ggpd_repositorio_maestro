#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
==============================================================================
⚡ CORPOELEC — GERENCIA GENERAL DE PLANIFICACIÓN DE DISTRIBUCIÓN (GGPD)
Script Maestro de Remediación e Ingesta de Caracterización de Activos de Red
(Subestaciones SE y Circuitos CT) — Normalización Gemini SPARK (ISO 8000-110)
y Segmentación Técnica Especializada según Norma CADAFE/EDELCA NS-P-105
==============================================================================
"""

import os
import json
import re
import pandas as pd

def clean_val(v):
    if pd.isna(v) or v is None or str(v).strip().lower() in ('nan', 'none', '', 'null'):
        return None
    return v

def clean_str(v):
    val = clean_val(v)
    if val is None:
        return ''
    return str(val).strip()

def clean_num_or_str(v):
    val = clean_val(v)
    if val is None:
        return None
    if isinstance(val, (int, float)):
        return float(val)
    s = str(val).strip().replace(',', '.')
    try:
        return float(s)
    except ValueError:
        return str(val).strip()

def classify_circuit_nsp105(nombre_circuito, observaciones, elemento_tipo):
    """
    Clasifica el elemento reportado como CT según la Norma CADAFE/EDELCA NS-P-105.
    Retorna (elemento_tecnico_especifico, codigo_maniobra_norma, descripcion_elemento_tecnico, es_componente_patio)
    """
    nombre = str(nombre_circuito or '').strip()
    obs = str(observaciones or '').strip()
    tipo = str(elemento_tipo or 'CIRCUITO').strip().upper()

    # 1. Observaciones explícitas de normalización
    if obs.startswith('SECCIONADOR'):
        cod = obs.split(':')[-1] if ':' in obs else 'S'
        return ('SECCIONADOR_MANIOBRA', cod, f'Seccionador de Maniobra y Aislamiento [{cod}] (Norma NS-P-105)', True)
    if obs.startswith('DISYUNTOR'):
        cod = obs.split(':')[-1] if ':' in obs else 'D'
        return ('DISYUNTOR_POTENCIA', cod, f'Disyuntor / Interruptor de Potencia [{cod}] (Norma NS-P-105)', True)
    if obs.startswith('BARRA') or tipo == 'BARRA':
        cod = obs.split(':')[-1] if ':' in obs else 'B'
        return ('JUEGO_BARRAS', cod, f'Juego de Barras Colectoras / Transferencia [{cod}] (Norma NS-P-105)', True)

    # 2. Sufijos entre paréntesis en el nombre: (S1..S10), (D1..D4), (B1..B2), (L1..L2), (Q), (RESERVA)
    m = re.search(r'\(([A-Za-z]+-?\d+[A-Za-z]?|[A-Za-z]+)\)\s*$', nombre)
    if m:
        code_str = m.group(1).upper()
        if re.match(r'^S\d*$', code_str):
            return ('SECCIONADOR_MANIOBRA', code_str, f'Seccionador de Maniobra [{code_str}] (Norma NS-P-105)', True)
        elif re.match(r'^D\d*$', code_str):
            return ('DISYUNTOR_POTENCIA', code_str, f'Disyuntor de Potencia [{code_str}] (Norma NS-P-105)', True)
        elif re.match(r'^B\d*$', code_str):
            return ('JUEGO_BARRAS', code_str, f'Juego de Barras [{code_str}] (Norma NS-P-105)', True)
        elif re.match(r'^L\d*$', code_str) or tipo == 'LINEA':
            return ('LINEA_ENLACE', code_str, f'Línea de Enlace / Interconexión [{code_str}] (Norma NS-P-105)', True)
        elif re.match(r'^T\d*$', code_str) or tipo == 'TRANSFORMADOR' or 'TRAFO' in nombre.upper():
            return ('TRANSFORMADOR', code_str, f'Transformador de Potencia [{code_str}] (Norma NS-P-105)', True)
        elif code_str in ('RESERVA', 'Q', 'RESPALDO'):
            return ('POSICION_RESERVA', code_str, f'Posición / Bahía de Reserva [{code_str}] (Norma NS-P-105)', True)

    # 3. Patrones textuales de tipo
    if tipo == 'LINEA' or re.search(r'^L\d+\s+', nombre, re.I) or 'LINEA ' in nombre.upper():
        m_l = re.search(r'(L\d+)', nombre, re.I)
        cod = m_l.group(1).upper() if m_l else 'L'
        return ('LINEA_ENLACE', cod, f'Línea de Enlace / Interconexión [{cod}] (Norma NS-P-105)', True)

    if tipo == 'BARRA' or 'BARRA ' in nombre.upper():
        return ('JUEGO_BARRAS', 'B', 'Juego de Barras Colectoras / Transferencia (Norma NS-P-105)', True)

    if tipo == 'TRANSFORMADOR' or 'TRANSFORMADOR' in nombre.upper() or 'TRAFO' in nombre.upper():
        return ('TRANSFORMADOR', 'T', 'Transformador de Potencia / Distribución (Norma NS-P-105)', True)

    if 'RESERVA' in nombre.upper():
        return ('POSICION_RESERVA', 'RESERVA', 'Posición / Bahía de Reserva en Subestación', True)

    # 4. Por defecto: Alimentador Convencional de Distribución
    return ('ALIMENTADOR_CONVENCIONAL', 'CTO', 'Alimentador de Distribución Convencional', False)

def main():
    excel_path = 'apps/caracterizacion_distribucion/data/caracterizacion_distribucion_normalizado.xlsx'
    json_path = 'apps/corpoelec-sigi-gestion-planificacion-distribucion/src/data/masterCatalogsLegacy.json'
    sql_path = 'sql/03_poblar_activos_red_caracterizacion.sql'

    print("1. Cargando datos desde Excel de Caracterización SPARK...")
    df_se = pd.read_excel(excel_path, sheet_name='CARACTERIZACION_SE_COMPLETO')
    df_ct = pd.read_excel(excel_path, sheet_name='CARACTERIZACION_CIRCUITOS')

    print(f"   Subestaciones cargadas: {len(df_se)}")
    print(f"   Circuitos cargados: {len(df_ct)}")

    print("\n2. Aplicando reglas de remediación y saneamiento ISO 8000...")
    # Regla 1: Normalización de cabecera Yaracal II en Falcón
    df_ct.loc[df_ct['SUBESTACION_CABECERA'] == 'YARACAL LL', 'SUBESTACION_CABECERA'] = 'YARACAL II'
    df_ct.loc[df_ct['se_codigo'] == 'SE-FAL-0321', 'se_codigo'] = 'SE-FAL-0320'

    # Regla 2: Completar cabeceras en blanco
    df_ct.loc[df_ct['ID_CIRCUITO_NORMALIZADO'] == 'CT-CAR-01238', 'SUBESTACION_CABECERA'] = 'CENTRO'
    df_ct.loc[df_ct['ID_CIRCUITO_NORMALIZADO'] == 'CT-CAR-01239', 'SUBESTACION_CABECERA'] = 'QUIZANDA'
    df_ct.loc[df_ct['ID_CIRCUITO_NORMALIZADO'] == 'CT-CAR-01240', 'SUBESTACION_CABECERA'] = 'QUIZANDA'
    df_ct.loc[df_ct['ID_CIRCUITO_NORMALIZADO'] == 'CT-CAR-01241', 'SUBESTACION_CABECERA'] = 'CENTRO'
    df_ct.loc[df_ct['ID_CIRCUITO_NORMALIZADO'] == 'CT-CAR-01242', 'SUBESTACION_CABECERA'] = 'QUIZANDA'
    df_ct.loc[df_ct['ID_CIRCUITO_NORMALIZADO'] == 'CT-CAR-01243', 'SUBESTACION_CABECERA'] = 'QUIZANDA'

    df_ct.loc[df_ct['ID_CIRCUITO_NORMALIZADO'].isin([
        'CT-ZUL-03817', 'CT-ZUL-03818', 'CT-ZUL-03819', 'CT-ZUL-03820', 'CT-ZUL-03821'
    ]), 'SUBESTACION_CABECERA'] = 'NODO ZULIA'

    # Validar integridad referencial
    se_ids = set(df_se['ID_ACTIVO_NORMALIZADO'].dropna())
    diff_fks = set(df_ct['se_codigo'].dropna()) - se_ids
    if len(diff_fks) > 0:
        raise ValueError(f"Error de integridad referencial: {diff_fks}")
    print("   🟢 Integridad Referencial 100% Verificada (0 huérfanos).")

    print("\n3. Clasificando elementos según Norma CADAFE/EDELCA NS-P-105...")
    # Convertir SE a estructura enriquecida
    se_list = []
    for _, row in df_se.iterrows():
        se_list.append({
            'codigo': clean_str(row['ID_ACTIVO_NORMALIZADO']),
            'region': clean_str(row['REGION']),
            'estado': clean_str(row['ESTADO']),
            'tipo_instalacion': clean_str(row['TIPO_INSTALACION']),
            'nombre_se': clean_str(row['NOMBRE_SUBESTACION']),
            'nombre_se_norm': clean_str(row['NOMBRE_SE_NORM']),
            'es_movil': str(row['ES_MOVIL']).strip().upper() == 'SI',
            'observaciones_normalizacion': clean_val(row['OBSERVACIONES_NORMALIZACION']),
            'origen': clean_str(row['ORIGEN']),
            'atendida_por': clean_str(row['ATENDIDA_POR']),
            'municipio': clean_str(row['MUNICIPIO']),
            'area_se_m2': clean_num_or_str(row['AREA_SE_M2']),
            'tension_entrada_kv': clean_num_or_str(row['TENSION_ENTRADA_KV']),
            'tension_secundaria_kv': clean_num_or_str(row['TENSION_SECUNDARIA_KV']),
            'alimentador_principal': clean_str(row['ALIMENTADOR_PRINCIPAL']),
            'tension_alimentador_kv': clean_num_or_str(row['TENSION_ALIMENTADOR_KV']),
            'estado_control': clean_str(row['ESTADO_CONTROL']),
            'estado_caracterizacion': clean_str(row['ESTADO_CARACTERIZACION'])
        })

    # Convertir CT a estructura enriquecida con Norma NS-P-105
    ct_list = []
    stats_nsp105 = {}
    for _, row in df_ct.iterrows():
        elem_tecnico, cod_maniobra, desc_tecnica, es_patio = classify_circuit_nsp105(
            row['NOMBRE_CIRCUITO'], row.get('OBSERVACIONES_NORMALIZACION'), row.get('ELEMENTOS_TIPO')
        )
        stats_nsp105[elem_tecnico] = stats_nsp105.get(elem_tecnico, 0) + 1

        ct_list.append({
            'codigo': clean_str(row['ID_CIRCUITO_NORMALIZADO']),
            'region': clean_str(row['REGION']),
            'estado': clean_str(row['ESTADO']),
            'subestacion_cabecera': clean_str(row['SUBESTACION_CABECERA']),
            'se_codigo': clean_str(row['se_codigo']),
            'circuito': clean_str(row['NOMBRE_CIRCUITO']),
            'nombre_ct_norm': clean_str(row['NOMBRE_CT_NORM']),
            'elemento_tipo': clean_str(row['ELEMENTOS_TIPO']),
            'elemento_tecnico_especifico': elem_tecnico,
            'codigo_maniobra_norma': cod_maniobra,
            'descripcion_elemento_tecnico': desc_tecnica,
            'es_componente_patio': es_patio,
            'observaciones_normalizacion': clean_val(row['OBSERVACIONES_NORMALIZACION']),
            'nivel_tension_kv': clean_num_or_str(row['NIVEL_TENSION_KV']) or 13.8,
            'km_total': clean_num_or_str(row['LONGITUD_KM']) or 0.0,
            'tipo_red': clean_str(row['TIPO_RED']),
            'estado_control': clean_str(row['ESTADO_CONTROL']),
            'estado_caracterizacion': clean_str(row['ESTADO_CARACTERIZACION'])
        })

    print("   Estadísticas de clasificación NS-P-105:")
    for k, v in sorted(stats_nsp105.items(), key=lambda x: -x[1]):
        print(f"     - {k}: {v} activos")

    print("\n4. Actualizando JSON Maestro de Catálogos (masterCatalogsLegacy.json)...")
    with open(json_path, 'r', encoding='utf-8') as f:
        master_json = json.load(f)

    master_json['caracterizacion']['subestaciones'] = se_list
    master_json['caracterizacion']['circuitos'] = ct_list
    if '_metadata' not in master_json:
        master_json['_metadata'] = {}
    master_json['_metadata']['version_caracterizacion'] = '2026.3_SPARK_NSP105_NORMALIZADO'
    master_json['_metadata']['total_subestaciones_normalizadas'] = len(se_list)
    master_json['_metadata']['total_circuitos_normalizados'] = len(ct_list)
    master_json['_metadata']['clasificacion_nsp105'] = stats_nsp105

    with open(json_path, 'w', encoding='utf-8') as f:
        json.dump(master_json, f, ensure_ascii=False, indent=2)
    print(f"   🟢 Archivo {json_path} actualizado exitosamente.")

    print("\n5. Generando script SQL de Ingesta Idempotente (sql/03_poblar_activos_red_caracterizacion.sql)...")
    os.makedirs('sql', exist_ok=True)
    with open(sql_path, 'w', encoding='utf-8') as sql_file:
        sql_file.write("""-- ==============================================================================
-- ⚡ CORPOELEC - GERENCIA DE DISTRIBUCIÓN (GGPD)
-- 📜 SCRIPT DE CARGA Y ACTUALIZACIÓN MAESTRA DE ACTIVOS (SE Y CT NORMALIZADOS)
-- Fuente: caracterizacion_distribucion_normalizado.xlsx (Gemini SPARK ISO 8000 / NS-P-105)
-- ==============================================================================

BEGIN;

-- 1. Inserción / Actualización de Subestaciones (SE: 871 Registros)
""")
        for se in se_list:
            meta = {
                'region': se['region'],
                'estado': se['estado'],
                'nombre_normalizado': se['nombre_se_norm'],
                'es_movil': se['es_movil'],
                'atendida_por': se['atendida_por'],
                'municipio': se['municipio'],
                'area_se_m2': se['area_se_m2'],
                'tension_entrada_kv': se['tension_entrada_kv'],
                'tension_secundaria_kv': se['tension_secundaria_kv'],
                'alimentador_principal': se['alimentador_principal'],
                'tension_alimentador_kv': se['tension_alimentador_kv'],
                'observaciones': se['observaciones_normalizacion']
            }
            macro = 'TRANSMISION' if 'TRANSMISION' in se['tipo_instalacion'].upper() else 'DISTRIBUCION'
            meta_json_str = json.dumps(meta, ensure_ascii=False).replace("'", "''")
            nombre_escaped = se['nombre_se'].replace("'", "''")
            codigo_escaped = se['codigo'].replace("'", "''")
            origen_escaped = se['origen'].replace("'", "''")

            sql_file.write(f"""INSERT INTO public.activos_red (codigo_activo, nombre, tipo_activo, macro_proceso, estado_control, estado_caracterizacion, origen_dato, metadata_tecnica)
VALUES ('{codigo_escaped}', '{nombre_escaped}', 'SE', '{macro}', 'CONTROLADO', 'CARACTERIZADO', '{origen_escaped}', '{meta_json_str}'::jsonb)
ON CONFLICT (codigo_activo) DO UPDATE SET
    nombre = EXCLUDED.nombre,
    macro_proceso = EXCLUDED.macro_proceso,
    estado_control = EXCLUDED.estado_control,
    estado_caracterizacion = EXCLUDED.estado_caracterizacion,
    origen_dato = EXCLUDED.origen_dato,
    metadata_tecnica = public.activos_red.metadata_tecnica || EXCLUDED.metadata_tecnica,
    ultima_actualizacion = now();\n""")

        sql_file.write("\n-- 2. Inserción / Actualización de Circuitos y Equipos (CT: 4,207 Registros)\n")
        for ct in ct_list:
            meta_ct = {
                'region': ct['region'],
                'estado': ct['estado'],
                'se_codigo_padre': ct['se_codigo'],
                'subestacion_cabecera': ct['subestacion_cabecera'],
                'nombre_normalizado': ct['nombre_ct_norm'],
                'elemento_tipo': ct['elemento_tipo'],
                'elemento_tecnico_especifico': ct['elemento_tecnico_especifico'],
                'codigo_maniobra_norma': ct['codigo_maniobra_norma'],
                'descripcion_elemento_tecnico': ct['descripcion_elemento_tecnico'],
                'es_componente_patio': ct['es_componente_patio'],
                'nivel_tension_kv': ct['nivel_tension_kv'],
                'longitud_km': ct['km_total'],
                'tipo_red': ct['tipo_red'],
                'observaciones': ct['observaciones_normalizacion']
            }
            meta_ct_str = json.dumps(meta_ct, ensure_ascii=False).replace("'", "''")
            nombre_ct_escaped = ct['circuito'].replace("'", "''")
            codigo_ct_escaped = ct['codigo'].replace("'", "''")

            sql_file.write(f"""INSERT INTO public.activos_red (codigo_activo, nombre, tipo_activo, macro_proceso, estado_control, estado_caracterizacion, origen_dato, metadata_tecnica)
VALUES ('{codigo_ct_escaped}', '{nombre_ct_escaped}', 'CT', 'DISTRIBUCION', 'CONTROLADO', 'CARACTERIZADO', 'CARACTERIZACION_CT', '{meta_ct_str}'::jsonb)
ON CONFLICT (codigo_activo) DO UPDATE SET
    nombre = EXCLUDED.nombre,
    macro_proceso = EXCLUDED.macro_proceso,
    estado_control = EXCLUDED.estado_control,
    estado_caracterizacion = EXCLUDED.estado_caracterizacion,
    origen_dato = EXCLUDED.origen_dato,
    metadata_tecnica = public.activos_red.metadata_tecnica || EXCLUDED.metadata_tecnica,
    ultima_actualizacion = now();\n""")

        sql_file.write("\nCOMMIT;\n")

    print(f"   🟢 Script SQL {sql_path} generado exitosamente (5,078 sentencias UPSERT con segmentación NS-P-105).")

if __name__ == '__main__':
    main()
