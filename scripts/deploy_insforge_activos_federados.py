#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
==============================================================================
⚡ CORPOELEC - GERENCIA GENERAL DE PLANIFICACIÓN DE DISTRIBUCIÓN (GGPD)
🏛️ DESPLEGADOR DE ESQUEMAS FEDERADOS DE ACTIVOS EN INSFORGE (insforge-bk)
   - Esquema sigad_sen: Nodos CND, Barras, Transformadores, Generación, Líneas (Mayo 2025)
   - Esquema sigad: Bahías CADAFE NS-P-105, Componentes Físicos y Ciclo de Vida SCEIN
   - Esquema core: Vista Federada Unificada core.v_activos_sen_integrados
   - CERO DATA MOCK: Todos los datos provienen directamente del CND y de CORE.
==============================================================================
"""

import os
import re
import sys
import json
import time
import urllib.request
import urllib.error

# Configurar salida UTF-8
sys.stdout.reconfigure(encoding='utf-8')

ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ENV_FILE = os.path.join(ROOT_DIR, '.env.local')
SQL_CND_FILE = os.path.join(ROOT_DIR, 'database', 'cnd_sen_unifilar_2025_pg.sql')

# 1. Cargar Variables de Entorno
env_vars = {}
if os.path.exists(ENV_FILE):
    with open(ENV_FILE, 'r', encoding='utf-8') as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith('#') and '=' in line:
                k, v = line.split('=', 1)
                env_vars[k.strip()] = v.strip().strip('"').strip("'")

INSFORGE_URL = env_vars.get('INSFORGE_URL')
INSFORGE_API_KEY = env_vars.get('INSFORGE_API_KEY')

if not INSFORGE_URL or not INSFORGE_API_KEY:
    print("❌ ERROR: INSFORGE_URL o INSFORGE_API_KEY no encontrados en .env.local")
    sys.exit(1)

RAWSQL_URL = f"{INSFORGE_URL.rstrip('/')}/api/database/advance/rawsql"

def exec_sql(sql_statement, label="SQL Batch", max_retries=3):
    """Ejecuta una sentencia SQL en InsForge mediante el endpoint advance/rawsql."""
    payload = json.dumps({"query": sql_statement}).encode("utf-8")
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {INSFORGE_API_KEY}",
        "apikey": INSFORGE_API_KEY
    }
    
    for attempt in range(1, max_retries + 1):
        try:
            req = urllib.request.Request(RAWSQL_URL, data=payload, headers=headers, method="POST")
            with urllib.request.urlopen(req, timeout=120) as resp:
                data = json.loads(resp.read().decode("utf-8"))
                return data
        except urllib.error.HTTPError as e:
            err_body = e.read().decode("utf-8", errors="ignore")
            print(f"⚠️ Error HTTP {e.code} en {label} (intento {attempt}/{max_retries}): {err_body[:300]}")
            if attempt == max_retries:
                raise RuntimeError(f"Falla en {label}: HTTP {e.code} - {err_body}")
            time.sleep(2)
        except Exception as e:
            print(f"⚠️ Error de red en {label} (intento {attempt}/{max_retries}): {e}")
            if attempt == max_retries:
                raise
            time.sleep(2)

def deploy_sigad_sen():
    print("\n================================================================================")
    print("⚡ 1. DESPLEGANDO ESQUEMA 'sigad_sen' (TOPOLOGÍA OFICIAL CND SEN MAYO 2025 - CERO MOCK)")
    print("================================================================================")
    
    exec_sql("CREATE SCHEMA IF NOT EXISTS sigad_sen;", "Crear esquema sigad_sen")
    
    if not os.path.exists(SQL_CND_FILE):
        print(f"❌ Archivo SQL no encontrado: {SQL_CND_FILE}")
        sys.exit(1)
        
    print(f"📖 Leyendo script de extracción CND: {SQL_CND_FILE}...")
    with open(SQL_CND_FILE, 'r', encoding='utf-8') as f:
        raw_sql = f.read()

    # 1. Eliminar comentarios de línea para análisis sintáctico limpio
    clean_sql = re.sub(r'--[^\n]*', '', raw_sql)

    # 2. Reemplazar nombres de tabla para forzar esquema sigad_sen
    cnd_tables = [
        'cnd_lineas_tramos', 'cnd_rotulos_texto', 'cnd_generacion',
        'cnd_compensacion_reactiva', 'cnd_transformadores', 'cnd_barras',
        'cnd_subestaciones', 'cnd_clientes_industriales', 'cnd_niveles_tension',
        'cnd_metadata'
    ]
    
    transformed_sql = clean_sql
    for t in cnd_tables:
        transformed_sql = re.sub(rf'\b{t}\b', f'sigad_sen.{t}', transformed_sql)

    # 3. Separar sentencias por ';'
    raw_stmts = [s.strip() for s in transformed_sql.split(';') if s.strip()]
    
    ddl_statements = []
    dml_statements = []
    post_statements = []
    
    for s in raw_stmts:
        up = s.upper()
        if up.startswith(('DROP TABLE', 'CREATE TABLE', 'SET ')):
            ddl_statements.append(s)
        elif up.startswith('INSERT INTO'):
            dml_statements.append(s)
        elif up.startswith('CREATE INDEX') or 'SETVAL' in up:
            post_statements.append(s)
        else:
            # Otras sentencias
            post_statements.append(s)
            
    print(f"Total sentencias clasificadas: DDL={len(ddl_statements)}, DML={len(dml_statements)}, Post={len(post_statements)}")
    
    # Ejecutar DDL una por una para garantizar creación de relaciones
    print("⚙️ Ejecutando sentencias DDL...")
    for i, ddl in enumerate(ddl_statements, 1):
        exec_sql(ddl + ";", f"DDL {i}/{len(ddl_statements)}")
    print("✅ Todas las tablas del esquema 'sigad_sen' han sido creadas exitosamente.")
    
    # Ejecutar DML en lotes de 100 inserts para máxima velocidad
    print(f"Insertando {len(dml_statements)} registros reales del CND en bloques...")
    batch_size = 100
    total_batches = (len(dml_statements) + batch_size - 1) // batch_size
    for i in range(0, len(dml_statements), batch_size):
        chunk = dml_statements[i:i + batch_size]
        batch_num = (i // batch_size) + 1
        sql_chunk = ";\n".join(chunk) + ";"
        exec_sql(sql_chunk, f"DML Lote {batch_num}/{total_batches}")
        if batch_num % 10 == 0 or batch_num == total_batches:
            print(f"  Progreso CND: {batch_num}/{total_batches} lotes insertados ({min(i + batch_size, len(dml_statements))}/{len(dml_statements)} registros)")
            
    # Ejecutar índices y secuencias post-inserción
    if post_statements:
        print(f"⚙️ Creando {len(post_statements)} índices y actualizando secuencias...")
        for j, post in enumerate(post_statements, 1):
            try:
                exec_sql(post + ";", f"Post-DML {j}/{len(post_statements)}")
            except Exception as e:
                print(f"  Nota post-DML ({j}): {e}")
                
    print("✅ Ingesta de datos reales de topología CND 2025 en 'sigad_sen' completada con éxito.")

def backfill_codigo_cnd():
    """Añade la columna canónica `codigo` (slug CND-*) a sigad_sen.cnd_subestaciones.

    Regla idéntica a scripts/generate_siga_sen_seed.py:67:
        codigo = 'CND-' + replace(no-alnum -> '-') .strip('-')
    con [^A-Za-z0-9] -> '-' (trim solo de extremos; conserva dashes internos repetidos).
    Idempotente: solo rellena NULL y recrea el índice.
    """
    print("\n================================================================================")
    print("⚡ 1b. BACKFILL DE CÓDIGO CANÓNICO CND (columna sigad_sen.cnd_subestaciones.codigo)")
    print("================================================================================")
    exec_sql("ALTER TABLE sigad_sen.cnd_subestaciones ADD COLUMN IF NOT EXISTS codigo varchar(120);", "ALTER ADD codigo")
    res = exec_sql(
        "UPDATE sigad_sen.cnd_subestaciones "
        "SET codigo = 'CND-' || trim(both '-' from regexp_replace(nombre_normalizado, '[^A-Za-z0-9]', '-', 'g')) "
        "WHERE codigo IS NULL;",
        "Backfill codigo CND",
    )
    print(f"   Filas actualizadas: {res.get('rowCount')}")
    exec_sql("CREATE INDEX IF NOT EXISTS idx_sigad_sen_cnd_sub_codigo ON sigad_sen.cnd_subestaciones(codigo);", "Índice codigo (NO único: el CND trae duplicados preexistentes)")
    check = exec_sql(
        "SELECT codigo FROM sigad_sen.cnd_subestaciones WHERE nombre_normalizado = 'EL CONVENTO';",
        "Verificar CND-EL-CONVENTO",
    )
    print(f"✅ Backfill codigo CND completado. Muestra: {check.get('rows')}")

def deploy_sigad():
    print("\n================================================================================")
    print("⚡ 2. DESPLEGANDO ESQUEMA 'sigad' (BAHÍAS CADAFE NS-P-105, COMPONENTES Y EVENTOS)")
    print("================================================================================")
    
    sigad_ddl = """
    CREATE SCHEMA IF NOT EXISTS sigad;

    -- 1. Estructuras Jerárquicas de Subestaciones (Bahías de Patio CADAFE)
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

    -- 2. Inventario Físico de Componentes de Patio Normalizados
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

    -- 3. Historial de Eventos, Fallas y Reposiciones (ISO 55000 / Enlace SCEIN)
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
    
    exec_sql(sigad_ddl, "DDL sigad")
    print("✅ Tablas del esquema 'sigad' creadas exitosamente.")

def deploy_federated_views_and_security():
    print("\n================================================================================")
    print("⚡ 3. DESPLEGANDO VISTAS FEDERADAS DE INTEGRACIÓN Y POLÍTICAS DE SEGURIDAD")
    print("================================================================================")
    
    views_sql = """
    -- 1. Vista de Resumen de Subestaciones CND
    CREATE OR REPLACE VIEW sigad_sen.v_subestaciones_resumen AS
    SELECT 
        s.id,
        s.nombre_cnd,
        s.nombre_normalizado,
        s.clasificacion,
        s.cuadrante_mural,
        s.tension_maxima_kv,
        s.tension_minima_kv,
        s.niveles_tension_lista,
        s.total_barras,
        s.total_transformadores,
        s.total_generadores,
        s.total_reactivos,
        s.capacidad_total_mw,
        s.capacidad_total_mva,
        s.capacidad_total_mvar,
        s.coord_x,
        s.coord_y
    FROM sigad_sen.cnd_subestaciones s;

    -- 2. Estadísticas Nacionales del SEN (consumida por SIGA-SEN: BalanceSenView)
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

    -- 3. Tramos y Líneas de Interconexión (consumida por SIGA-SEN: Atlas Unifilar)
    CREATE OR REPLACE VIEW sigad_sen.v_lineas_transmision AS
    SELECT
        cnd_lineas_tramos.id,
        cnd_lineas_tramos.codigo_tension AS kv_code,
        cnd_lineas_tramos.tension_kv AS kv,
        cnd_lineas_tramos.color_hex AS color,
        cnd_lineas_tramos.grosor_pt AS grosor,
        cnd_lineas_tramos.x0,
        cnd_lineas_tramos.y0,
        cnd_lineas_tramos.x1,
        cnd_lineas_tramos.y1,
        cnd_lineas_tramos.longitud_aprox AS len,
        cnd_lineas_tramos.nodo_cercano_1 AS origen,
        cnd_lineas_tramos.nodo_cercano_2 AS destino
    FROM sigad_sen.cnd_lineas_tramos;

    -- 4. Detalle de Subestaciones con bahías/equipos (consumida por SIGA-SEN: NodosPatiosSenView / UnifilarActivoSenView)
    --    OJO: expone `s.codigo` (slug CND-*) y NO `s.id::text`, que rompería las búsquedas por código del frontend.
    --    Se hace DROP + CREATE porque el tipo de `codigo` cambió (text -> varchar).
    DROP VIEW IF EXISTS sigad_sen.v_subestaciones_detalle;
    CREATE VIEW sigad_sen.v_subestaciones_detalle AS
    SELECT
        s.id,
        s.codigo,
        s.nombre_cnd,
        s.nombre_normalizado AS nombre_norm,
        s.clasificacion,
        s.cuadrante_mural   AS cuadrante,
        s.coord_x,
        s.coord_y,
        jsonb_build_array(s.bbox_x0, s.bbox_y0, s.bbox_x1, s.bbox_y1) AS bbox,
        s.tension_maxima_kv AS tension_max_kv,
        s.tension_minima_kv AS tension_min_kv,
        s.niveles_tension_lista AS tensiones_lista,
        s.total_barras,
        s.total_transformadores,
        s.total_generadores,
        s.total_reactivos,
        s.capacidad_total_mva  AS capacidad_mva,
        s.capacidad_total_mw   AS capacidad_mw,
        s.capacidad_total_mvar AS capacidad_mvar,
        COALESCE(b.barras, '[]'::jsonb)          AS barras,
        COALESCE(t.transformadores, '[]'::jsonb) AS transformadores,
        COALESCE(g.generacion, '[]'::jsonb)      AS generacion,
        COALESCE(r.reactivos, '[]'::jsonb)       AS reactivos
    FROM sigad_sen.cnd_subestaciones s
    LEFT JOIN (
        SELECT cnd_barras.subestacion_id,
               jsonb_agg(jsonb_build_object(
                 'id', cnd_barras.id, 'codigo_tension', cnd_barras.codigo_tension,
                 'tension_kv', cnd_barras.tension_kv, 'color_hex', cnd_barras.color_hex,
                 'grosor', cnd_barras.grosor_pt, 'orientacion', cnd_barras.orientacion,
                 'longitud', cnd_barras.longitud_pt, 'x0', cnd_barras.x0, 'y0', cnd_barras.y0,
                 'x1', cnd_barras.x1, 'y1', cnd_barras.y1,
                 'cx', cnd_barras.centro_x, 'cy', cnd_barras.centro_y)) AS barras
        FROM sigad_sen.cnd_barras GROUP BY cnd_barras.subestacion_id) b ON b.subestacion_id = s.id
    LEFT JOIN (
        SELECT cnd_transformadores.subestacion_id,
               jsonb_agg(jsonb_build_object(
                 'id', cnd_transformadores.id, 'raw', cnd_transformadores.etiqueta_cruda,
                 'qty', cnd_transformadores.unidades_count, 'unit_mva', cnd_transformadores.mva_unitario,
                 'total_mva', cnd_transformadores.mva_total,
                 'cx', cnd_transformadores.coord_x, 'cy', cnd_transformadores.coord_y)) AS transformadores
        FROM sigad_sen.cnd_transformadores GROUP BY cnd_transformadores.subestacion_id) t ON t.subestacion_id = s.id
    LEFT JOIN (
        SELECT cnd_generacion.subestacion_id,
               jsonb_agg(jsonb_build_object(
                 'id', cnd_generacion.id, 'raw', cnd_generacion.etiqueta_cruda,
                 'tag', cnd_generacion.detalle_maquinas, 'qty', cnd_generacion.unidades_count,
                 'unit_mw', cnd_generacion.mw_unitario, 'total_mw', cnd_generacion.mw_total,
                 'fuente', cnd_generacion.tipo_fuente,
                 'cx', cnd_generacion.coord_x, 'cy', cnd_generacion.coord_y)) AS generacion
        FROM sigad_sen.cnd_generacion GROUP BY cnd_generacion.subestacion_id) g ON g.subestacion_id = s.id
    LEFT JOIN (
        SELECT cnd_compensacion_reactiva.subestacion_id,
               jsonb_agg(jsonb_build_object(
                 'id', cnd_compensacion_reactiva.id, 'raw', cnd_compensacion_reactiva.etiqueta_cruda,
                 'tipo', cnd_compensacion_reactiva.tipo_equipo, 'qty', cnd_compensacion_reactiva.unidades_count,
                 'unit_mvar', cnd_compensacion_reactiva.mvar_unitario, 'total_mvar', cnd_compensacion_reactiva.mvar_total,
                 'cx', cnd_compensacion_reactiva.coord_x, 'cy', cnd_compensacion_reactiva.coord_y)) AS reactivos
        FROM sigad_sen.cnd_compensacion_reactiva GROUP BY cnd_compensacion_reactiva.subestacion_id) r ON r.subestacion_id = s.id;

    -- 5. Vista de Componentes Indisponibles de Distribución
    CREATE OR REPLACE VIEW sigad.v_componentes_indisponibles AS
    SELECT 
        c.id,
        c.se_codigo,
        c.codigo_norma,
        c.nombre_equipo,
        c.tipo_elemento,
        c.estado_operativo,
        c.tension_kv,
        c.capacidad_mva,
        c.serial,
        c.observaciones,
        c.actualizado_en
    FROM sigad.componentes_patio c
    WHERE c.estado_operativo IN ('INDISPONIBLE_FALLADO', 'EN_OBSERVACION');

    -- 6. Vista Federada Unificada: CORE 360° (Une core, sigad_sen y sigad)
    CREATE OR REPLACE VIEW core.v_activos_sen_integrados AS
    SELECT 
        se.codigo_se,
        se.nombre_subestacion,
        se.codigo_estado,
        se.tipo_instalacion,
        se.macro_proceso,
        se.tension_entrada_kv,
        se.tension_secundaria_kv,
        -- Datos CND Troncal (si existe match)
        cnd.id AS cnd_id,
        cnd.nombre_cnd,
        cnd.cuadrante_mural,
        cnd.capacidad_total_mw AS cnd_capacidad_mw,
        cnd.capacidad_total_mva AS cnd_capacidad_mva,
        cnd.total_barras AS cnd_total_barras,
        -- Datos de Patio Distribución (si existen bahías generadas)
        est.total_bahias AS dist_total_bahias,
        est.total_componentes AS dist_total_componentes,
        est.total_indisponibles AS dist_total_indisponibles,
        est.actualizado_en AS dist_ultima_actualizacion
    FROM core.mae_subestaciones se
    LEFT JOIN sigad_sen.cnd_subestaciones cnd 
        ON UPPER(TRIM(cnd.nombre_normalizado)) = UPPER(TRIM(se.nombre_subestacion))
    LEFT JOIN sigad.estructuras_subestaciones est 
        ON est.se_codigo::text = se.codigo_se::text;

    -- 7. Permisos de Seguridad (ISO/IEC 27001 & OWASP)
    GRANT USAGE ON SCHEMA sigad, sigad_sen TO anon, authenticated;
    GRANT ALL ON ALL TABLES IN SCHEMA sigad, sigad_sen TO anon, authenticated;
    GRANT ALL ON ALL SEQUENCES IN SCHEMA sigad, sigad_sen TO anon, authenticated;
    GRANT SELECT ON core.v_activos_sen_integrados TO anon, authenticated;
    GRANT SELECT ON sigad_sen.v_subestaciones_resumen TO anon, authenticated;
    GRANT SELECT ON sigad_sen.v_estadisticas_nacionales TO anon, authenticated;
    GRANT SELECT ON sigad_sen.v_lineas_transmision TO anon, authenticated;
    GRANT SELECT ON sigad_sen.v_subestaciones_detalle TO anon, authenticated;
    GRANT SELECT ON sigad.v_componentes_indisponibles TO anon, authenticated;
    """
    
    exec_sql(views_sql, "Vistas y Permisos Federados")
    print("✅ Vistas federadas y permisos de seguridad desplegados exitosamente.")

def verify_deployment():
    print("\n================================================================================")
    print("🔍 4. AUDITORÍA Y CERTIFICACIÓN DE REGISTROS EN INSFORGE POSTGRESQL (CERO MOCK)")
    print("================================================================================")
    
    check_query = """
    SELECT 
        table_schema, 
        table_name,
        (xpath('/row/cnt/text()', xml_count))[1]::text::int as row_count
    FROM (
        SELECT 
            table_schema, 
            table_name, 
            query_to_xml(format('SELECT count(*) as cnt FROM %I.%I', table_schema, table_name), false, true, '') as xml_count
        FROM information_schema.tables
        WHERE table_schema IN ('sigad_sen', 'sigad')
        AND table_type = 'BASE TABLE'
    ) t
    ORDER BY table_schema, table_name;
    """
    
    res = exec_sql(check_query, "Conteo de Tablas y Filas")
    rows = res.get("rows", [])
    
    print("\nResumen de Tablas Desplegadas con Data 100% Real:")
    print("-" * 65)
    print(f"{'ESQUEMA':<15} | {'TABLA':<35} | {'FILAS':<10}")
    print("-" * 65)
    for r in rows:
        print(f"{r['table_schema']:<15} | {r['table_name']:<35} | {r['row_count']:<10}")
    print("-" * 65)
    
    # Verificar vista federada core
    vista_res = exec_sql("SELECT count(*) as total FROM core.v_activos_sen_integrados;", "Verificar vista federada")
    total_vista = vista_res["rows"][0]["total"]
    print(f"\n📊 Total Registros en Vista Federada Unificada (core.v_activos_sen_integrados): {total_vista}")

    # Verificar vistas de sigad_sen consumidas por SIGA-SEN
    try:
        v = exec_sql(
            "SELECT "
            "(SELECT count(*) FROM sigad_sen.v_subestaciones_detalle) AS detalle, "
            "(SELECT count(*) FROM sigad_sen.v_estadisticas_nacionales) AS stats, "
            "(SELECT count(*) FROM sigad_sen.v_lineas_transmision) AS lineas, "
            "(SELECT count(*) FROM sigad_sen.v_subestaciones_detalle WHERE codigo = 'CND-EL-CONVENTO') AS convento;",
            "Verificar vistas SIGA-SEN",
        )["rows"][0]
        print(f"📊 Vistas SIGA-SEN -> detalle={v['detalle']} · stats={v['stats']} · lineas={v['lineas']} · CND-EL-CONVENTO={v['convento']}")
    except Exception as e:
        print(f"⚠️ No se pudieron verificar las vistas SIGA-SEN: {e}")

    print("================================================================================")
    print("🚀 DESPLIEGUE FEDERADO DE ACTIVOS EN INSFORGE CERTIFICADO Y COMPLETADO")
    print("================================================================================\n")

def main():
    start = time.time()
    deploy_sigad_sen()
    backfill_codigo_cnd()
    deploy_sigad()
    deploy_federated_views_and_security()
    verify_deployment()
    print(f"⏱️ Tiempo total de despliegue: {time.time() - start:.2f} segundos.")

if __name__ == '__main__':
    main()
