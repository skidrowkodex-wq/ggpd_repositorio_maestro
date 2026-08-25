-- ====================================================================================
-- ESQUEMA DEDICADO: scgcc (Seguimiento y Control de Correspondencia Corporativa)
-- APLICACIÓN: SCGCC V1.0 • PROCESO GGPD-SEC-01 • GESTIÓN DE CORRESPONDENCIA & DESPACHO
-- NORMATIVA: ISO 15489-1:2016 • ISO/IEC 27001:2022 • ISO 9001:2015 • ISACA COBIT 2019
-- CORPOELEC • Gerencia General de Planificación de Distribución (GGPD)
-- ====================================================================================

-- 1. CREACIÓN DEL ESQUEMA DEDICADO
CREATE SCHEMA IF NOT EXISTS scgcc;

-- ------------------------------------------------------------------------------------
-- 2. TABLA MAESTRA DE CORRESPONDENCIA (RADICACIÓN DIGITAL & TRIAJE)
-- ------------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS scgcc.mae_correspondencias (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    correlativo VARCHAR(30) UNIQUE NOT NULL, -- ej: RAD-GGPD-2026-0001
    direccion VARCHAR(20) NOT NULL CHECK (direccion IN ('ENTRADA', 'SALIDA', 'INTERNA')),
    tipo_documento VARCHAR(30) NOT NULL CHECK (tipo_documento IN ('OFICIO', 'MEMORANDUM', 'PUNTO_DE_CUENTA', 'CIRCULAR', 'SOLICITUD_1X10', 'INFORME_TECNICO', 'OTRO')),
    numero_documento_origen VARCHAR(100) NOT NULL, -- Nro físico/digital original
    remitente_institucion VARCHAR(200) NOT NULL, -- ej: MPPEE, Despacho Presidencia, GGD
    remitente_nombre VARCHAR(150),
    remitente_cargo VARCHAR(150),
    destinatario_principal VARCHAR(200) NOT NULL,
    destinatarios_copia TEXT,
    asunto TEXT NOT NULL,
    descripcion_sintesis TEXT,
    nivel_confidencialidad VARCHAR(30) NOT NULL DEFAULT 'ORDINARIO' CHECK (nivel_confidencialidad IN ('ORDINARIO', 'CONFIDENCIAL', 'RESERVADO_DIRECTIVA')),
    prioridad VARCHAR(20) NOT NULL DEFAULT 'MEDIA' CHECK (prioridad IN ('BAJA', 'MEDIA', 'ALTA', 'URGENTE_24H')),
    
    fecha_emision_origen DATE NOT NULL,
    fecha_recepcion DATE NOT NULL DEFAULT CURRENT_DATE,
    fecha_limite_respuesta DATE, -- SLA de atención formal
    
    estado_tramite VARCHAR(30) NOT NULL DEFAULT 'RADICADO' CHECK (estado_tramite IN (
        'RADICADO', 
        'EN_REVISION', 
        'ASIGNADO_CON_TAREA', 
        'BORRADOR_RESPUESTA', 
        'PENDIENTE_FIRMA', 
        'FIRMADO_FISICO', 
        'DESPACHADO_CON_ACUSE', 
        'RESPONDIDO', 
        'ARCHIVADO', 
        'ANULADO'
    )),
    
    medio_entrega VARCHAR(50), -- WhatsApp, Telegram, Valija Física, Correo Institucional
    observaciones TEXT,
    requiere_respuesta BOOLEAN DEFAULT FALSE,
    oficio_respuesta_ref VARCHAR(50),
    
    -- Vínculo Operativo a SCMTP V2.0 (Segregación de Confidencialidad)
    tarea_scmtp_id VARCHAR(50), -- ej: T-2026-0027
    tarea_scmtp_titulo TEXT,
    responsable_asignado_id UUID REFERENCES core.mae_usuarios_sistema(id),
    responsable_cargo VARCHAR(150),
    
    -- Expediente Digital en Google Drive Data Lake
    pdf_drive_url TEXT,
    pdf_drive_id VARCHAR(100),
    pdf_file_name VARCHAR(255),
    
    metadata_json JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ------------------------------------------------------------------------------------
-- 3. TABLA DE OFICIOS DE SALIDA, RESPUESTAS FORMALES & CONTROL DE FIRMAS
-- ------------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS scgcc.mae_oficios_salida (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    correspondencia_origen_id UUID NOT NULL REFERENCES scgcc.mae_correspondencias(id) ON DELETE CASCADE,
    correlativo_origen VARCHAR(30) NOT NULL,
    numero_oficio VARCHAR(50) UNIQUE NOT NULL, -- ej: GGPD-OF-2026-0045
    tipo_documento VARCHAR(30) NOT NULL DEFAULT 'OFICIO' CHECK (tipo_documento IN ('OFICIO', 'MEMORANDUM', 'PUNTO_DE_CUENTA')),
    
    destinatario_institucion VARCHAR(200) NOT NULL,
    destinatario_nombre VARCHAR(150) NOT NULL,
    destinatario_cargo VARCHAR(150) NOT NULL,
    asunto TEXT NOT NULL,
    referencia_antecedente VARCHAR(150),
    
    cuerpo_texto TEXT NOT NULL,
    conclusiones_tecnicas TEXT,
    
    firmante_nombre VARCHAR(150) NOT NULL DEFAULT 'Ing. Adrián Correa',
    firmante_cargo VARCHAR(150) NOT NULL DEFAULT 'Gerente General de Distribución',
    redactado_por_id UUID REFERENCES core.mae_usuarios_sistema(id),
    redactado_por_nombre VARCHAR(150),
    
    estado_firma VARCHAR(30) NOT NULL DEFAULT 'PENDIENTE_FIRMA' CHECK (estado_firma IN (
        'BORRADOR_REVISION', 
        'PENDIENTE_FIRMA', 
        'EN_CORRECCION', 
        'FIRMADO_FISICO', 
        'DESPACHADO_CON_ACUSE'
    )),
    observaciones_revision TEXT,
    
    fecha_creacion DATE NOT NULL DEFAULT CURRENT_DATE,
    fecha_firma DATE,
    fecha_despacho DATE,
    
    -- Trazabilidad de Despacho & Acuse de Recibo
    nro_guia_acuse VARCHAR(100), -- ej: GUIA-DESP-2026-0892
    receptor_acuse_nombre VARCHAR(150),
    archivo_acuse_url TEXT,
    archivo_word_url TEXT,
    
    copias TEXT,
    anexos TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ------------------------------------------------------------------------------------
-- 4. TABLA DE EXPEDIENTES Y DIGITALIZACIÓN DE ADJUNTOS (DATA LAKE GOOGLE DRIVE)
-- ------------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS scgcc.mae_adjuntos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    correspondencia_id UUID NOT NULL REFERENCES scgcc.mae_correspondencias(id) ON DELETE CASCADE,
    nombre_archivo VARCHAR(255) NOT NULL,
    tipo_mime VARCHAR(100) NOT NULL,
    tamano_bytes BIGINT NOT NULL,
    storage_url TEXT NOT NULL,
    storage_key TEXT NOT NULL,
    hash_sha256 VARCHAR(64) NOT NULL, -- Integridad inmutable ISO 27001
    es_documento_principal BOOLEAN DEFAULT FALSE,
    subido_por_id UUID REFERENCES core.mae_usuarios_sistema(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ------------------------------------------------------------------------------------
-- 5. TABLA DE TRAZABILIDAD E HISTORIAL INMUTABLE (ISO 15489 / ISACA COBIT MEA02)
-- ------------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS scgcc.mae_trazabilidad (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    correspondencia_id UUID NOT NULL REFERENCES scgcc.mae_correspondencias(id) ON DELETE CASCADE,
    usuario_id UUID REFERENCES core.mae_usuarios_sistema(id),
    usuario_nombre VARCHAR(150),
    accion VARCHAR(50) NOT NULL, -- RADICACION, DERIVACION_TAREA, REDACCION_OFICIO, FIRMA_GERENCIAL, REGISTRO_DESPACHO, CAMBIO_CONFIDENCIALIDAD
    estado_anterior VARCHAR(30),
    estado_nuevo VARCHAR(30),
    observaciones TEXT,
    ip_origen VARCHAR(45),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ------------------------------------------------------------------------------------
-- 6. TABLA DE PLANTILLAS CORPORATIVAS NORMALIZADAS 2026
-- ------------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS scgcc.cat_plantillas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    codigo_plantilla VARCHAR(30) UNIQUE NOT NULL, -- ej: TMPL-MEMO-2026, TMPL-OFIC-2026
    nombre_formato VARCHAR(200) NOT NULL,
    tipo VARCHAR(30) NOT NULL CHECK (tipo IN ('MEMORANDO', 'OFICIO', 'VACACIONES', 'PUNTO_DE_CUENTA', 'OTRO')),
    tamano_kb NUMERIC(10, 2),
    drive_id VARCHAR(100) NOT NULL,
    drive_url TEXT NOT NULL,
    formato_archivo VARCHAR(10) NOT NULL DEFAULT 'DOCX',
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ------------------------------------------------------------------------------------
-- 7. ÍNDICES DE ALTA VELOCIDAD (BÚSQUEDAS EN < 3 SEGUNDOS / MODO REUNIÓN)
-- ------------------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_scgcc_correlativo ON scgcc.mae_correspondencias (correlativo);
CREATE INDEX IF NOT EXISTS idx_scgcc_doc_origen ON scgcc.mae_correspondencias (numero_documento_origen);
CREATE INDEX IF NOT EXISTS idx_scgcc_remitente ON scgcc.mae_correspondencias (remitente_institucion);
CREATE INDEX IF NOT EXISTS idx_scgcc_fechas ON scgcc.mae_correspondencias (fecha_recepcion, fecha_limite_respuesta);
CREATE INDEX IF NOT EXISTS idx_scgcc_estado ON scgcc.mae_correspondencias (estado_tramite);
CREATE INDEX IF NOT EXISTS idx_scgcc_confidencialidad ON scgcc.mae_correspondencias (nivel_confidencialidad);

CREATE INDEX IF NOT EXISTS idx_scgcc_oficios_nro ON scgcc.mae_oficios_salida (numero_oficio);
CREATE INDEX IF NOT EXISTS idx_scgcc_oficios_estado_firma ON scgcc.mae_oficios_salida (estado_firma);
CREATE INDEX IF NOT EXISTS idx_scgcc_oficios_corresp_origen ON scgcc.mae_oficios_salida (correspondencia_origen_id);

-- ------------------------------------------------------------------------------------
-- 8. VISTAS SEMÁNTICAS PÚBLICAS (CONSUMO FRONTEND & DASHBOARDS KGI/KPI)
-- ------------------------------------------------------------------------------------

-- Vista 1: Correspondencias Activas con Detalle 360°
CREATE OR REPLACE VIEW public.v_scgcc_correspondencias_activas AS
SELECT 
    c.id,
    c.correlativo,
    c.direccion,
    c.tipo_documento,
    c.numero_documento_origen,
    c.remitente_institucion,
    c.remitente_nombre,
    c.remitente_cargo,
    c.destinatario_principal,
    c.asunto,
    c.descripcion_sintesis,
    c.nivel_confidencialidad,
    c.prioridad,
    c.fecha_emision_origen,
    c.fecha_recepcion,
    c.fecha_limite_respuesta,
    c.estado_tramite,
    c.medio_entrega,
    c.requiere_respuesta,
    c.tarea_scmtp_id,
    c.tarea_scmtp_titulo,
    c.pdf_drive_url,
    c.pdf_file_name,
    u.nombre AS responsable_nombre,
    u.cargo AS responsable_cargo,
    u.email AS responsable_email,
    -- Datos del Oficio de Salida Formal
    o.id AS oficio_salida_id,
    o.numero_oficio AS oficio_salida_numero,
    o.estado_firma AS oficio_salida_estado_firma,
    o.firmante_nombre AS oficio_salida_firmante,
    o.fecha_firma AS oficio_salida_fecha_firma,
    o.fecha_despacho AS oficio_salida_fecha_despacho,
    o.nro_guia_acuse AS oficio_salida_nro_guia,
    o.receptor_acuse_nombre AS oficio_salida_receptor
FROM scgcc.mae_correspondencias c
LEFT JOIN scgcc.mae_oficios_salida o ON o.correspondencia_origen_id = c.id
LEFT JOIN core.mae_usuarios_sistema u ON u.id = c.responsable_asignado_id;

-- Vista 2: Indicadores KGI / SLA de Tiempos de Respuesta
CREATE OR REPLACE VIEW public.v_scgcc_kpi_slas AS
SELECT 
    COUNT(*) AS total_radicados,
    COUNT(*) FILTER (WHERE estado_tramite = 'RADICADO') AS total_pendientes_triaje,
    COUNT(*) FILTER (WHERE estado_tramite = 'ASIGNADO_CON_TAREA') AS total_en_tarea_scmtp,
    COUNT(*) FILTER (WHERE estado_tramite = 'PENDIENTE_FIRMA') AS total_pendientes_firma,
    COUNT(*) FILTER (WHERE estado_tramite IN ('RESPONDIDO', 'DESPACHADO_CON_ACUSE')) AS total_despachados_atendidos,
    COUNT(*) FILTER (WHERE fecha_limite_respuesta < CURRENT_DATE AND estado_tramite NOT IN ('RESPONDIDO', 'DESPACHADO_CON_ACUSE', 'ARCHIVADO')) AS total_vencidos_fuera_sla,
    ROUND(
        (COUNT(*) FILTER (WHERE estado_tramite IN ('RESPONDIDO', 'DESPACHADO_CON_ACUSE'))::numeric / NULLIF(COUNT(*), 0)::numeric) * 100, 
        2
    ) AS tasa_efectividad_global_pct
FROM scgcc.mae_correspondencias;

-- ------------------------------------------------------------------------------------
-- 9. PERMISOS Y SEGURIDAD RLS (ROW LEVEL SECURITY)
-- ------------------------------------------------------------------------------------
ALTER TABLE scgcc.mae_correspondencias ENABLE ROW LEVEL SECURITY;
ALTER TABLE scgcc.mae_oficios_salida ENABLE ROW LEVEL SECURITY;
ALTER TABLE scgcc.mae_adjuntos ENABLE ROW LEVEL SECURITY;
ALTER TABLE scgcc.mae_trazabilidad ENABLE ROW LEVEL SECURITY;
ALTER TABLE scgcc.cat_plantillas ENABLE ROW LEVEL SECURITY;

-- Política de lectura para usuarios autenticados con permiso SCGCC
DROP POLICY IF EXISTS p_scgcc_lectura_autenticados ON scgcc.mae_correspondencias;
CREATE POLICY p_scgcc_lectura_autenticados ON scgcc.mae_correspondencias
    FOR SELECT
    USING (
        nivel_confidencialidad = 'ORDINARIO'
        OR auth.uid() IN (
            SELECT id FROM core.mae_usuarios_sistema 
            WHERE permiso_scgcc = TRUE AND rol IN ('ADMINISTRADOR', 'GERENTE', 'SECRETARIA', 'SUPERVISOR')
        )
    );
