#!/usr/bin/env python3
"""
==============================================================================
⚡ CORPOELEC - GERENCIA GENERAL DE PLANIFICACIÓN DE DISTRIBUCIÓN (GGPD)
🗄️ DESPLEGADOR DE ESQUEMAS DEDICADOS Y VISTAS SEMÁNTICAS EN INSFORGE (insforge-bk)
==============================================================================
Este script despliega los esquemas estructurados para las aplicaciones refactorizadas:
1. Esquema `sigi`: Ingesta inteligente, catálogos de procesos, registros dinámicos.
2. Esquema `scmtp`: Minutas de reunión, compromisos/tareas, pendientes por área.
3. Esquema `scppe`: Proyectos especiales PRTSEN, acciones POA, control de viáticos, conciliaciones presupuestarias.
4. Esquema `scein`: Equipos indisponibles de subestaciones, documentos técnicos, bitácora de auditoría.
5. Esquema `sctis`: Tiras de interrupción, despachadores, alias de normalización ISO 8000.

CERO DUPLICIDAD:
- Todas las subestaciones y circuitos se referencian exclusivamente desde `core.mae_subestaciones` y `core.mae_circuitos`.
- Todos los usuarios y roles se gestionan desde `core.mae_usuarios_sistema`.
- Los catálogos territoriales se consumen de `core.dim_estados` y `core.dim_regiones`.
"""

import subprocess
import sys
import json

DDL_SQL = """
-- ==============================================================================
-- 1. ESQUEMA SIGI (Consola Central de Planificación e Ingesta Inteligente)
-- ==============================================================================
CREATE SCHEMA IF NOT EXISTS sigi;

CREATE TABLE IF NOT EXISTS sigi.cat_procesos_ingesta (
    id VARCHAR(50) PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(200) NOT NULL,
    short_name VARCHAR(100),
    description TEXT,
    category VARCHAR(50) DEFAULT 'CORE_ESTRATEGICO',
    target_app VARCHAR(50),
    frequency VARCHAR(30) DEFAULT 'SEMANAL',
    naming_pattern VARCHAR(150),
    icon VARCHAR(50) DEFAULT 'Cpu',
    color VARCHAR(30) DEFAULT '#00f2fe',
    is_dynamic BOOLEAN DEFAULT true,
    provisioned_states_count INT DEFAULT 25,
    required_columns JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sigi.ingesta_registros_dinamicos (
    id VARCHAR(100) PRIMARY KEY,
    proceso_id VARCHAR(50) NOT NULL REFERENCES sigi.cat_procesos_ingesta(id) ON DELETE CASCADE,
    codigo_estado VARCHAR(10) REFERENCES core.dim_estados(codigo_estado) ON UPDATE CASCADE,
    codigo_rds VARCHAR(50),
    periodo VARCHAR(30),
    fecha_corte DATE DEFAULT CURRENT_DATE,
    datos_json JSONB NOT NULL DEFAULT '{}'::jsonb,
    es_valido BOOLEAN DEFAULT true,
    errores_validacion JSONB DEFAULT '[]'::jsonb,
    creado_por VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 2. ESQUEMA SCMTP (Seguimiento y Control de Minutas y Tareas - Proceso GGPD-PLA-02)
-- ==============================================================================
CREATE SCHEMA IF NOT EXISTS scmtp;

CREATE TABLE IF NOT EXISTS scmtp.mae_minutas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    numero VARCHAR(50) UNIQUE NOT NULL,
    fecha VARCHAR(20) NOT NULL,
    fecha_iso DATE,
    hora VARCHAR(20),
    lugar VARCHAR(100),
    coordinador VARCHAR(150),
    unidad_organizativa TEXT,
    objetivo TEXT,
    compromisos_count INT DEFAULT 0,
    pendientes_count INT DEFAULT 0,
    proxima_fecha_seguimiento VARCHAR(50),
    elaborado_por TEXT,
    nombre_archivo VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS scmtp.mae_compromisos_tareas (
    id VARCHAR(100) PRIMARY KEY,
    minuta_numero VARCHAR(50) REFERENCES scmtp.mae_minutas(numero) ON DELETE SET NULL,
    minuta_fecha VARCHAR(20),
    responsable VARCHAR(150) NOT NULL,
    compromiso TEXT NOT NULL,
    plazo_text VARCHAR(100),
    plazo_fecha_iso DATE,
    vinculacion_origen VARCHAR(100),
    estado VARCHAR(50) DEFAULT 'Pendiente',
    prioridad VARCHAR(20) DEFAULT 'Media',
    avance_porcentaje INT DEFAULT 0,
    area_gestion VARCHAR(100),
    observaciones TEXT,
    historial_avances JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS scmtp.mae_pendientes_area (
    id VARCHAR(100) PRIMARY KEY,
    area VARCHAR(100) NOT NULL,
    pendiente TEXT NOT NULL,
    depende_de VARCHAR(150),
    estado VARCHAR(50) DEFAULT 'Pendiente',
    observacion TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 3. ESQUEMA SCPPE (Planificación Eléctrica SEN & Viáticos - Proceso GGPD-PLA-01)
-- ==============================================================================
CREATE SCHEMA IF NOT EXISTS scppe;

CREATE TABLE IF NOT EXISTS scppe.mae_proyectos_especiales (
    id VARCHAR(100) PRIMARY KEY,
    codigo_rds VARCHAR(50) NOT NULL,
    nombre VARCHAR(255) NOT NULL,
    dimension VARCHAR(50) DEFAULT 'SUBESTACION',
    codigo_region VARCHAR(20) REFERENCES core.dim_regiones(codigo_region),
    codigo_estado VARCHAR(10) REFERENCES core.dim_estados(codigo_estado),
    subestacion_asociada VARCHAR(150),
    monto_usd NUMERIC(15,2) DEFAULT 0.00,
    avance_fisico_pct NUMERIC(5,2) DEFAULT 0.00,
    avance_financiero_pct NUMERIC(5,2) DEFAULT 0.00,
    estatus VARCHAR(50) DEFAULT 'EN_EJECUCION',
    vinculado_poa BOOLEAN DEFAULT true,
    codigo_sipes VARCHAR(50),
    match_metodo VARCHAR(30) DEFAULT 'EXACTO',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS scppe.mae_poa_acciones (
    id VARCHAR(100) PRIMARY KEY,
    codigo_accion VARCHAR(50) UNIQUE NOT NULL,
    descripcion TEXT NOT NULL,
    unidad_medida VARCHAR(50) DEFAULT 'UNIDAD',
    meta_anual NUMERIC(12,2) DEFAULT 0.00,
    ejecutado_acumulado NUMERIC(12,2) DEFAULT 0.00,
    porcentaje_cumplimiento NUMERIC(5,2) DEFAULT 0.00,
    presupuesto_asignado_bs NUMERIC(18,2) DEFAULT 0.00,
    presupuesto_ejecutado_bs NUMERIC(18,2) DEFAULT 0.00,
    responsable VARCHAR(150),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS scppe.mae_viaticos_control (
    id VARCHAR(100) PRIMARY KEY,
    numero_solicitud VARCHAR(50) UNIQUE NOT NULL,
    empleado_nombre VARCHAR(150) NOT NULL,
    empleado_cedula VARCHAR(20) NOT NULL,
    destino VARCHAR(150) NOT NULL,
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE NOT NULL,
    dias_duracion INT NOT NULL DEFAULT 1,
    monto_calculado_usd NUMERIC(10,2) DEFAULT 0.00,
    monto_calculado_bs NUMERIC(18,2) DEFAULT 0.00,
    estatus_flujo VARCHAR(50) DEFAULT 'BORRADOR',
    motivo_comision TEXT,
    proyecto_asociado_id VARCHAR(100) REFERENCES scppe.mae_proyectos_especiales(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS scppe.mae_proyectos_ggd (
    id VARCHAR(100) PRIMARY KEY,
    codigo VARCHAR(50) UNIQUE NOT NULL,
    nombre VARCHAR(255) NOT NULL,
    tipo VARCHAR(50) DEFAULT 'DISTRIBUCION',
    region VARCHAR(50),
    estado VARCHAR(50),
    inversion_usd NUMERIC(15,2) DEFAULT 0.00,
    avance_pct NUMERIC(5,2) DEFAULT 0.00,
    estatus VARCHAR(50) DEFAULT 'PLANIFICADO',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS scppe.mae_auditorias (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    evento VARCHAR(100) NOT NULL,
    usuario VARCHAR(100) NOT NULL,
    entidad VARCHAR(50) NOT NULL,
    entidad_id VARCHAR(100),
    detalles JSONB DEFAULT '{}'::jsonb,
    ip_origen VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 4. ESQUEMA SCEIN (Equipos Indisponibles de Subestaciones - Proceso GGPD-SUB-01)
-- ==============================================================================
CREATE SCHEMA IF NOT EXISTS scein;

CREATE TABLE IF NOT EXISTS scein.mae_equipos_indisponibles (
    record_id VARCHAR(100) PRIMARY KEY,
    substation_name VARCHAR(150) NOT NULL,
    tag_id VARCHAR(100),
    serial_number VARCHAR(100),
    voltage_level VARCHAR(30) DEFAULT '115/13.8 kV',
    equipment_type VARCHAR(100) NOT NULL,
    state_name VARCHAR(100),
    state_code VARCHAR(10) REFERENCES core.dim_estados(codigo_estado),
    region VARCHAR(50),
    unavailability_reason TEXT,
    current_status VARCHAR(50) DEFAULT 'INDISPONIBLE',
    date_out_of_service DATE,
    estimated_restoration_date DATE,
    mva_capacity NUMERIC(8,2),
    load_affected_mw NUMERIC(8,2) DEFAULT 0.00,
    metadata_json JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS scein.mae_documentos_institucionales (
    id VARCHAR(100) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(100) DEFAULT 'DIAGRAMA_UNIFILAR',
    substation_name VARCHAR(150),
    file_url TEXT NOT NULL,
    file_name VARCHAR(255),
    file_size_bytes BIGINT,
    uploaded_by VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS scein.mae_auditorias (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type VARCHAR(100) NOT NULL,
    user_id VARCHAR(100),
    username VARCHAR(100) NOT NULL,
    description TEXT,
    details_json JSONB DEFAULT '{}'::jsonb,
    ip_address VARCHAR(50),
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 5. ESQUEMA SCTIS (Tiras de Interrupción del SEN - Proceso GGPD-DIS-01)
-- ==============================================================================
CREATE SCHEMA IF NOT EXISTS sctis;

CREATE TABLE IF NOT EXISTS sctis.cat_despachadores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    codigo_despachador VARCHAR(50) UNIQUE NOT NULL,
    nombre VARCHAR(150) NOT NULL,
    centro_despacho VARCHAR(100),
    es_activo BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sctis.cat_asset_alias (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    alias_raw VARCHAR(200) NOT NULL,
    asset_type VARCHAR(50) NOT NULL, -- 'SUBESTACION' o 'CIRCUITO'
    official_code VARCHAR(100) NOT NULL,
    state_code VARCHAR(10) REFERENCES core.dim_estados(codigo_estado),
    confidence_score NUMERIC(5,2) DEFAULT 1.00,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sctis.mae_interrupciones_tiras (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    codigo_estado VARCHAR(10) REFERENCES core.dim_estados(codigo_estado),
    subestacion_nombre VARCHAR(150) NOT NULL,
    circuito_codigo VARCHAR(100),
    fecha_apertura TIMESTAMPTZ NOT NULL,
    fecha_cierre TIMESTAMPTZ,
    duracion_minutos NUMERIC(10,2),
    mw_interrumpidos NUMERIC(8,2) DEFAULT 0.00,
    causa_codigo VARCHAR(50),
    subcausa_codigo VARCHAR(50),
    despachador VARCHAR(150),
    observaciones TEXT,
    origen_carga VARCHAR(50) DEFAULT 'WEB_SCTIS',
    calidad_score NUMERIC(5,2) DEFAULT 100.00,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 6. VISTAS SEMÁNTICAS PÚBLICAS (public.*) PARA ACCESO SEGURO MULTI-APP
-- ==============================================================================

-- SIGI Vistas
CREATE OR REPLACE VIEW public.v_sigi_procesos_ingesta AS
SELECT * FROM sigi.cat_procesos_ingesta;

CREATE OR REPLACE VIEW public.cat_procesos_ingesta AS
SELECT * FROM sigi.cat_procesos_ingesta;

CREATE OR REPLACE VIEW public.v_sigi_registros_dinamicos AS
SELECT 
    r.id,
    r.proceso_id,
    p.name AS proceso_nombre,
    r.codigo_estado,
    e.nombre_estado,
    r.codigo_rds,
    r.periodo,
    r.fecha_corte,
    r.datos_json,
    r.es_valido,
    r.errores_validacion,
    r.creado_por,
    r.created_at,
    r.updated_at
FROM sigi.ingesta_registros_dinamicos r
LEFT JOIN sigi.cat_procesos_ingesta p ON p.id = r.proceso_id
LEFT JOIN core.dim_estados e ON e.codigo_estado = r.codigo_estado;

CREATE OR REPLACE VIEW public.ingesta_registros_dinamicos AS
SELECT * FROM sigi.ingesta_registros_dinamicos;

-- SCMTP Vistas
CREATE OR REPLACE VIEW public.v_scmtp_minutas AS
SELECT * FROM scmtp.mae_minutas ORDER BY fecha_iso DESC NULLS LAST, created_at DESC;

CREATE OR REPLACE VIEW public.minutas AS
SELECT * FROM scmtp.mae_minutas;

CREATE OR REPLACE VIEW public.v_scmtp_compromisos_tareas AS
SELECT * FROM scmtp.mae_compromisos_tareas ORDER BY created_at DESC;

CREATE OR REPLACE VIEW public.compromisos_tareas AS
SELECT * FROM scmtp.mae_compromisos_tareas;

CREATE OR REPLACE VIEW public.v_scmtp_pendientes_area AS
SELECT * FROM scmtp.mae_pendientes_area ORDER BY created_at DESC;

CREATE OR REPLACE VIEW public.pendientes_area AS
SELECT * FROM scmtp.mae_pendientes_area;

-- SCPPE Vistas y Aliases sin duplicidad
CREATE OR REPLACE VIEW public.v_scppe_proyectos_prtsen AS
SELECT 
    p.id,
    p.codigo_rds,
    p.nombre,
    p.dimension,
    p.codigo_region,
    r.nombre_region,
    p.codigo_estado,
    e.nombre_estado,
    p.subestacion_asociada,
    p.monto_usd,
    p.avance_fisico_pct,
    p.avance_financiero_pct,
    p.estatus,
    p.vinculado_poa,
    p.codigo_sipes,
    p.match_metodo,
    p.created_at,
    p.updated_at
FROM scppe.mae_proyectos_especiales p
LEFT JOIN core.dim_regiones r ON r.codigo_region = p.codigo_region
LEFT JOIN core.dim_estados e ON e.codigo_estado = p.codigo_estado;

CREATE OR REPLACE VIEW public.proyectos_prtsen AS
SELECT * FROM scppe.mae_proyectos_especiales;

CREATE OR REPLACE VIEW public.v_scppe_viaticos_control AS
SELECT 
    v.id,
    v.numero_solicitud,
    v.empleado_nombre,
    v.empleado_cedula,
    v.destino,
    v.fecha_inicio,
    v.fecha_fin,
    v.dias_duracion,
    v.monto_calculado_usd,
    v.monto_calculado_bs,
    v.estatus_flujo,
    v.motivo_comision,
    v.proyecto_asociado_id,
    p.nombre AS proyecto_asociado_nombre,
    v.created_at,
    v.updated_at
FROM scppe.mae_viaticos_control v
LEFT JOIN scppe.mae_proyectos_especiales p ON p.id = v.proyecto_asociado_id;

CREATE OR REPLACE VIEW public.viaticos AS
SELECT * FROM scppe.mae_viaticos_control;

CREATE OR REPLACE VIEW public.v_scppe_conciliacion_presupuestaria AS
SELECT 
    p.codigo_rds,
    p.nombre AS proyecto_nombre,
    p.monto_usd AS presupuesto_aprobado_usd,
    COALESCE(SUM(v.monto_calculado_usd), 0.00) AS total_viaticos_comprometidos_usd,
    p.monto_usd - COALESCE(SUM(v.monto_calculado_usd), 0.00) AS saldo_disponible_usd
FROM scppe.mae_proyectos_especiales p
LEFT JOIN scppe.mae_viaticos_control v ON v.proyecto_asociado_id = p.id
GROUP BY p.codigo_rds, p.nombre, p.monto_usd;

CREATE OR REPLACE VIEW public.v_conciliacion_presupuestaria AS
SELECT * FROM public.v_scppe_conciliacion_presupuestaria;

-- Aliases de compatibilidad directa para SCPPE (SAMC) sin duplicar tablas
CREATE OR REPLACE VIEW public.samc_subestacion AS
SELECT 
    id,
    codigo_se AS codigo_rds,
    codigo_se,
    nombre_subestacion,
    nombre_subestacion AS nombre,
    codigo_estado,
    municipio,
    tipo_instalacion,
    tension_entrada_kv AS nivel_tension_max_kv,
    tension_secundaria_kv,
    estado_control,
    creado_en
FROM core.mae_subestaciones;

CREATE OR REPLACE VIEW public.samc_circuito AS
SELECT 
    id,
    codigo_circuito AS codigo_rds,
    codigo_circuito,
    nombre_circuito,
    nombre_circuito AS nombre,
    codigo_se_padre,
    subestacion_cabecera,
    codigo_estado,
    nivel_tension_kv,
    tipo_red,
    longitud_km,
    estado_control,
    creado_en
FROM core.mae_circuitos;

CREATE OR REPLACE VIEW public.samc_proyecto_especial AS
SELECT * FROM scppe.mae_proyectos_especiales;

CREATE OR REPLACE VIEW public.samc_poa_accion_especifica AS
SELECT * FROM scppe.mae_poa_acciones;

CREATE OR REPLACE VIEW public.samc_asignacion_viatico AS
SELECT * FROM scppe.mae_viaticos_control;

CREATE OR REPLACE VIEW public.samc_proyecto_ggd AS
SELECT * FROM scppe.mae_proyectos_ggd;

CREATE OR REPLACE VIEW public.samc_audit_log AS
SELECT * FROM scppe.mae_auditorias;

-- SCEIN Vistas
CREATE OR REPLACE VIEW public.v_scein_equipos_indisponibles AS
SELECT 
    e.record_id,
    e.substation_name,
    e.tag_id,
    e.serial_number,
    e.voltage_level,
    e.equipment_type,
    e.state_name,
    e.state_code,
    e.region,
    e.unavailability_reason,
    e.current_status,
    e.date_out_of_service,
    e.estimated_restoration_date,
    e.mva_capacity,
    e.load_affected_mw,
    e.metadata_json,
    e.created_at,
    e.updated_at
FROM scein.mae_equipos_indisponibles e;

CREATE OR REPLACE VIEW public.equipment_records AS
SELECT * FROM scein.mae_equipos_indisponibles;

CREATE OR REPLACE VIEW public.institutional_documents AS
SELECT * FROM scein.mae_documentos_institucionales;

CREATE OR REPLACE VIEW public.technical_documents AS
SELECT * FROM scein.mae_documentos_institucionales;

CREATE OR REPLACE VIEW public.audit_logs AS
SELECT 
    id::text AS id,
    event_type AS action,
    user_id,
    username AS performed_by,
    description AS details,
    details_json,
    ip_address AS ip,
    timestamp AS created_at
FROM scein.mae_auditorias;

-- SCTIS Vistas
CREATE OR REPLACE VIEW public.v_sctis_tiras_interrupcion AS
SELECT 
    t.id,
    t.codigo_estado,
    e.nombre_estado,
    t.subestacion_nombre,
    t.circuito_codigo,
    t.fecha_apertura,
    t.fecha_cierre,
    t.duracion_minutos,
    t.mw_interrumpidos,
    t.causa_codigo,
    t.subcausa_codigo,
    t.despachador,
    t.observaciones,
    t.calidad_score,
    t.created_at
FROM sctis.mae_interrupciones_tiras t
LEFT JOIN core.dim_estados e ON e.codigo_estado = t.codigo_estado;

-- Permisos de lectura pública / anon en esquemas y vistas
GRANT USAGE ON SCHEMA sigi, scmtp, scppe, scein, sctis, public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA sigi, scmtp, scppe, scein, sctis, public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA sigi, scmtp, scppe, scein, sctis, public TO anon, authenticated;
"""

def run_query(sql):
    res = subprocess.run(['npx', '@insforge/cli', 'db', 'query', sql], capture_output=True, text=True)
    if res.returncode != 0:
        print(f"❌ Error ejecutando SQL: {res.stderr}")
        return False
    print(res.stdout)
    return True

def seed_data():
    print("\n🌱 Sembrando datos canónicos iniciales en los nuevos esquemas...")
    
    # 1. Sembrado SIGI Procesos
    sigi_seed = """
    INSERT INTO sigi.cat_procesos_ingesta (id, code, name, short_name, description, category, target_app, frequency, naming_pattern, icon, color, is_dynamic, provisioned_states_count)
    VALUES
    ('sctis', '01_SCTIS', 'Tiras de Interrupción de Distribución', 'Tiras Interrupción', 'Registro certificado semanal y cierre mensual de eventos de interrupción.', 'CORE_ESTRATEGICO', 'SCTIS V2.0', 'SEMANAL', 'SCTIS_[ESTADO]_[YYYYMMDD]_SEM[N]_V01.xlsx', 'Cpu', '#00f2fe', false, 25),
    ('scein', '02_SCEIN', 'Equipos Indisponibles de Subestaciones', 'Equipos Indisponibles', 'Control en tiempo real de transformadores e interruptores fuera de servicio.', 'CORE_ESTRATEGICO', 'SCEIN V3.0', 'CONTINUO', 'SCEIN_[ESTADO]_[YYYYMMDD]_V01.xlsx', 'AlertTriangle', '#f59e0b', false, 25),
    ('scppe', '03_SCPPE', 'Planificación Eléctrica SEN & Viáticos SAMC', 'Planificación SEN', 'Seguimiento físico-financiero de proyectos especiales y viáticos.', 'CORE_ESTRATEGICO', 'SCPPE V3.0', 'MENSUAL', 'SCPPE_PROYECTOS_[ESTADO]_[YYYYMM]_V01.xlsx', 'Zap', '#eab308', false, 25),
    ('scmtp', '04_SCMTP', 'Minutas y Compromisos de Gestión GGPD', 'Minutas & Tareas', 'Registro y trazabilidad de compromisos operativos y directivos.', 'GOBERNANZA', 'SCMTP V2.0', 'SEMANAL', 'SCMTP_MINUTA_[FECHA]_V01.xlsx', 'FileText', '#10b981', false, 1),
    ('scgcc', '05_SCGCC', 'Gestión de Correspondencia y Despacho', 'Correspondencia GGD', 'Control de oficios, radicaciones y bandejas de firmas institucionales.', 'GOBERNANZA', 'SCGCC V1.0', 'CONTINUO', 'SCGCC_RADICACION_[CORRELATIVO]_V01.pdf', 'Mail', '#8b5cf6', false, 1)
    ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        target_app = EXCLUDED.target_app,
        updated_at = NOW();
    """
    run_query(sigi_seed)

    # 2. Sembrado SCMTP Minutas y Compromisos
    scmtp_seed = """
    INSERT INTO scmtp.mae_minutas (numero, fecha, fecha_iso, hora, lugar, coordinador, unidad_organizativa, objetivo, compromisos_count, pendientes_count, proxima_fecha_seguimiento, elaborado_por, nombre_archivo)
    VALUES
    ('MIN-GGPD-2026-001', '12/08/2026', '2026-08-12', '09:30 AM', 'Sala de Conferencias GGPD - Sede San Bernardino', 'Ing. Carlos Reyes', 'Gerencia General de Planificación de Distribución', 'Coordinación y Planificación Operativa del SEN - Período Q3 2026', 15, 3, '19/08/2026', 'Ing. Josué Pacheco', 'MIN_GGPD_2026_001_CONSOLIDADA.pdf')
    ON CONFLICT (numero) DO UPDATE SET objetivo = EXCLUDED.objetivo;

    INSERT INTO scmtp.mae_compromisos_tareas (id, minuta_numero, minuta_fecha, responsable, compromiso, plazo_text, plazo_fecha_iso, vinculacion_origen, estado, prioridad, avance_porcentaje, area_gestion, observaciones)
    VALUES
    ('TAR-001', 'MIN-GGPD-2026-001', '12/08/2026', 'Ing. Josué Pacheco', 'Consolidación del Catálogo de 765 Subestaciones y 1,781 Circuitos en InsForge MDM.', '15/08/2026', '2026-08-15', 'Directiva Ministerial', 'Completado', 'Alta', 100, 'Base de Datos / MDM', 'Base de datos canónica desplegada y verificada bajo ISO 8000.'),
    ('TAR-002', 'MIN-GGPD-2026-001', '12/08/2026', 'Ing. Yván Cipirán', 'Despliegue y Pruebas de Carga del Sistema SCGCC V1.0 para Correspondencia.', '20/08/2026', '2026-08-20', 'GGD Oficio 0753', 'Completado', 'Alta', 100, 'Automatización / SCGCC', 'Esquema scgcc y panel QA desplegados en InsForge y VibeHost.'),
    ('TAR-003', 'MIN-GGPD-2026-001', '12/08/2026', 'Ing. Carlos Reyes', 'Revisión y Aprobación de Informes de Avance Físico-Financiero PRTSEN.', '25/08/2026', '2026-08-25', 'Plan Operativo Anual', 'En Progreso', 'Alta', 85, 'Planificación SEN', 'En revisión final con la Dirección General.')
    ON CONFLICT (id) DO UPDATE SET compromiso = EXCLUDED.compromiso, avance_porcentaje = EXCLUDED.avance_porcentaje;
    """
    run_query(scmtp_seed)

    # 3. Sembrado SCPPE Proyectos Especiales y Viáticos
    scppe_seed = """
    INSERT INTO scppe.mae_proyectos_especiales (id, codigo_rds, nombre, dimension, codigo_region, codigo_estado, subestacion_asociada, monto_usd, avance_fisico_pct, avance_financiero_pct, estatus, vinculado_poa, codigo_sipes, match_metodo)
    VALUES
    ('prt-001', '=VE+TAC-SE-001', 'Rehabilitación Integral de Celdas 13.8kV S/E San Cristóbal I', 'SUBESTACION', 'ANDES', 'TAC', 'S/E SAN CRISTOBAL I', 450000.00, 78.50, 65.00, 'EN_EJECUCION', true, 'SIPES-2026-0941', 'EXACTO'),
    ('prt-002', '=VE+ZUL-SE-002', 'Sustitución de Transformador de Potencia TR-1 36 MVA S/E Cuatricentenario', 'SUBESTACION', 'OCCIDENTE', 'ZUL', 'S/E CUATRICENTENARIO', 1200000.00, 92.00, 85.00, 'EN_EJECUCION', true, 'SIPES-2026-1120', 'EXACTO'),
    ('prt-003', '=VE+MIR-CIR-003', 'Adecuación de Troncal y Reubicación de Postes Circuito Guarenas Industrial', 'CIRCUITO', 'CAPITAL', 'MIR', 'S/E GUARENAS', 180000.00, 45.00, 40.00, 'EN_EJECUCION', true, 'SIPES-2026-0432', 'EXACTO')
    ON CONFLICT (id) DO UPDATE SET nombre = EXCLUDED.nombre, monto_usd = EXCLUDED.monto_usd;

    INSERT INTO scppe.mae_viaticos_control (id, numero_solicitud, empleado_nombre, empleado_cedula, destino, fecha_inicio, fecha_fin, dias_duracion, monto_calculado_usd, monto_calculado_bs, estatus_flujo, motivo_comision, proyecto_asociado_id)
    VALUES
    ('viat-001', 'VIAT-GGPD-2026-012', 'Ing. Carlos Reyes', 'V-14.892.110', 'San Cristóbal, Estado Táchira', '2026-08-10', '2026-08-14', 5, 350.00, 14700.00, 'APROBADO', 'Inspección técnica de obra y verificación de avance físico S/E San Cristóbal I.', 'prt-001'),
    ('viat-002', 'VIAT-GGPD-2026-013', 'Ing. Josué Pacheco', 'V-18.452.901', 'Maracaibo, Estado Zulia', '2026-08-16', '2026-08-20', 5, 350.00, 14700.00, 'APROBADO', 'Pruebas de aislamiento y comisionamiento TR-1 S/E Cuatricentenario.', 'prt-002')
    ON CONFLICT (id) DO UPDATE SET destino = EXCLUDED.destino;
    """
    run_query(scppe_seed)

    # 4. Sembrado SCEIN Equipos Indisponibles
    scein_seed = """
    INSERT INTO scein.mae_equipos_indisponibles (record_id, substation_name, tag_id, serial_number, voltage_level, equipment_type, state_name, state_code, region, unavailability_reason, current_status, date_out_of_service, mva_capacity, load_affected_mw)
    VALUES
    ('EQ-IND-2026-001', 'S/E EL CAFETAL', 'TR-2', 'SN-PAUW-2014-99', '115/13.8 kV', 'TRANSFORMADOR_POTENCIA', 'MIRANDA', 'MIR', 'CAPITAL', 'Disparo por protección diferencial (87T). Detección de gases disueltos en aceite dieléctrico.', 'INDISPONIBLE', '2026-08-05', 36.00, 14.50),
    ('EQ-IND-2026-002', 'S/E CABUDARE', 'INT-H105', 'SN-ABB-2018-44', '115 kV', 'INTERRUPTOR_POTENCIA', 'LARA', 'LAR', 'OCCIDENTE', 'Pérdida de presión de gas SF6 en polo B. Bloqueo de mando local y remoto.', 'EN_REPARACION', '2026-08-11', NULL, 8.20)
    ON CONFLICT (record_id) DO UPDATE SET substation_name = EXCLUDED.substation_name, current_status = EXCLUDED.current_status;
    """
    run_query(scein_seed)

def main():
    print("================================================================================")
    print("⚡ DESPLEGANDO MODELO CANÓNICO DE ESQUEMAS DEDICADOS EN INSFORGE (insforge-bk)")
    print("================================================================================")
    
    print("\n1. Creando esquemas dedicados (sigi, scmtp, scppe, scein, sctis) y vistas semánticas...")
    if not run_query(DDL_SQL):
        sys.exit(1)
        
    seed_data()

    print("\n✅ Verificando esquemas creados en InsForge PostgreSQL...")
    run_query("SELECT table_schema, count(*) FROM information_schema.tables WHERE table_schema IN ('core', 'scgcc', 'sigi', 'scmtp', 'scppe', 'scein', 'sctis', 'public') GROUP BY table_schema ORDER BY table_schema;")

if __name__ == '__main__':
    main()
