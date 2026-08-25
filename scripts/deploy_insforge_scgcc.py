#!/usr/bin/env python3
"""
⚡ CORPOELEC - GGPD / INSFORGE-BK SCGCC DEPLOYER
Despliega el esquema `scgcc`, las tablas maestras, la vista semántica `public.v_scgcc_correspondencias_activas`
y siembra las 11 correspondencias oficiales en InsForge PostgreSQL (ggpd-data-maestra-0002).
"""

import subprocess
import json

DDL_SQL = """
-- 1. CREACIÓN DEL ESQUEMA DEDICADO
CREATE SCHEMA IF NOT EXISTS scgcc;

-- 2. TABLA MAESTRA DE CORRESPONDENCIAS
CREATE TABLE IF NOT EXISTS scgcc.mae_correspondencias (
    id VARCHAR(50) PRIMARY KEY,
    correlativo VARCHAR(30) UNIQUE NOT NULL,
    direccion VARCHAR(20) NOT NULL CHECK (direccion IN ('ENTRADA', 'SALIDA', 'INTERNA')),
    proposito VARCHAR(40) NOT NULL DEFAULT 'EVALUACION_TECNICA' CHECK (proposito IN ('INSTRUCCION_EJECUTIVA', 'EVALUACION_TECNICA', 'REVISION_CONFORMACION', 'INFORMATIVO_NOTIFICACION')),
    instruido_por VARCHAR(200),
    tipo_documento VARCHAR(30) NOT NULL CHECK (tipo_documento IN ('OFICIO', 'MEMORANDUM', 'PUNTO_DE_CUENTA', 'CIRCULAR', 'SOLICITUD_1X10', 'INFORME_TECNICO', 'OTRO')),
    numero_documento_origen VARCHAR(100) NOT NULL,
    remitente_institucion VARCHAR(200) NOT NULL,
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
    fecha_limite_respuesta DATE,
    
    estado_tramite VARCHAR(30) NOT NULL DEFAULT 'RADICADO' CHECK (estado_tramite IN (
        'RADICADO', 'EN_REVISION', 'ASIGNADO_CON_TAREA', 'BORRADOR_RESPUESTA', 
        'PENDIENTE_FIRMA', 'FIRMADO_FISICO', 'DESPACHADO_CON_ACUSE', 'RESPONDIDO', 
        'ARCHIVADO', 'ANULADO'
    )),
    
    medio_entrega VARCHAR(50),
    observaciones TEXT,
    requiere_respuesta BOOLEAN DEFAULT FALSE,
    oficio_respuesta_ref VARCHAR(50),
    
    tarea_scmtp_id VARCHAR(50),
    tarea_scmtp_titulo TEXT,
    responsable_asignado VARCHAR(150),
    responsable_cargo VARCHAR(150),
    
    pdf_drive_url TEXT,
    pdf_drive_id VARCHAR(100),
    pdf_file_name VARCHAR(255),
    
    metadata_json JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. TABLA DE OFICIOS DE SALIDA / RESPUESTAS
CREATE TABLE IF NOT EXISTS scgcc.mae_oficios_salida (
    id VARCHAR(50) PRIMARY KEY,
    correspondencia_origen_id VARCHAR(50) NOT NULL REFERENCES scgcc.mae_correspondencias(id) ON DELETE CASCADE,
    correlativo_origen VARCHAR(30) NOT NULL,
    numero_oficio VARCHAR(50) UNIQUE NOT NULL,
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
    redactado_por VARCHAR(150),
    
    estado_firma VARCHAR(30) NOT NULL DEFAULT 'PENDIENTE_FIRMA' CHECK (estado_firma IN (
        'BORRADOR_REVISION', 'PENDIENTE_FIRMA', 'EN_CORRECCION', 'FIRMADO_FISICO', 'DESPACHADO_CON_ACUSE'
    )),
    observaciones_revision TEXT,
    
    fecha_creacion DATE NOT NULL DEFAULT CURRENT_DATE,
    fecha_firma DATE,
    fecha_despacho DATE,
    
    nro_guia_acuse VARCHAR(100),
    receptor_acuse_nombre VARCHAR(150),
    copias TEXT,
    anexos TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. VISTA SEMÁNTICA EN ESQUEMA PUBLIC
CREATE OR REPLACE VIEW public.v_scgcc_correspondencias_activas AS
SELECT 
    c.id,
    c.correlativo,
    c.direccion,
    c.proposito,
    c.instruido_por,
    c.tipo_documento,
    c.numero_documento_origen,
    c.remitente_institucion,
    c.remitente_nombre,
    c.remitente_cargo,
    c.destinatario_principal,
    c.destinatarios_copia,
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
    c.responsable_asignado,
    c.responsable_cargo,
    c.pdf_drive_url,
    c.pdf_drive_id,
    c.pdf_file_name,
    c.created_at,
    c.updated_at,
    -- Datos del Oficio de Salida Formal
    o.id AS oficio_id,
    o.numero_oficio AS oficio_numero,
    o.tipo_documento AS oficio_tipo,
    o.destinatario_institucion AS oficio_destinatario_inst,
    o.destinatario_nombre AS oficio_destinatario_nombre,
    o.destinatario_cargo AS oficio_destinatario_cargo,
    o.asunto AS oficio_asunto,
    o.referencia_antecedente AS oficio_referencia,
    o.cuerpo_texto AS oficio_cuerpo,
    o.conclusiones_tecnicas AS oficio_conclusiones,
    o.firmante_nombre AS oficio_firmante,
    o.firmante_cargo AS oficio_firmante_cargo,
    o.redactado_por AS oficio_redactado_por,
    o.estado_firma AS oficio_estado_firma,
    o.fecha_creacion AS oficio_fecha_creacion,
    o.fecha_firma AS oficio_fecha_firma,
    o.fecha_despacho AS oficio_fecha_despacho,
    o.nro_guia_acuse AS oficio_nro_guia,
    o.receptor_acuse_nombre AS oficio_receptor_acuse,
    o.copias AS oficio_copias,
    o.anexos AS oficio_anexos
FROM scgcc.mae_correspondencias c
LEFT JOIN scgcc.mae_oficios_salida o ON o.correspondencia_origen_id = c.id;
"""

def run_query(sql):
    res = subprocess.run(['npx', '@insforge/cli', 'db', 'query', sql], capture_output=True, text=True)
    if res.returncode != 0:
        print(f"❌ Error ejecutando SQL: {res.stderr}")
        return False
    print(res.stdout)
    return True

def main():
    print("================================================================================")
    print("⚡ DESPLEGANDO ESQUEMA SCGCC EN INSFORGE (insforge-bk)")
    print("================================================================================")
    
    print("\n1. Creando tablas y vistas en InsForge...")
    if not run_query(DDL_SQL):
        return

    print("\n2. Sembrando las 11 correspondencias oficiales en InsForge...")
    seed_sql = """
    INSERT INTO scgcc.mae_correspondencias (
        id, correlativo, direccion, proposito, instruido_por, tipo_documento,
        numero_documento_origen, remitente_institucion, remitente_nombre, remitente_cargo,
        destinatario_principal, destinatarios_copia, asunto, descripcion_sintesis,
        nivel_confidencialidad, prioridad, fecha_emision_origen, fecha_recepcion,
        fecha_limite_respuesta, estado_tramite, medio_entrega, requiere_respuesta,
        pdf_drive_id, pdf_file_name, pdf_drive_url, tarea_scmtp_id, tarea_scmtp_titulo,
        responsable_asignado, responsable_cargo, created_at, updated_at
    ) VALUES 
    (
        'corresp-001', 'RAD-GGPD-2026-0001', 'ENTRADA', 'INFORMATIVO_NOTIFICACION', NULL, 'CIRCULAR',
        'CGGTH-0004-07-2026', 'Gerencia General de Talento Humano (CGGTH)', 'Lic. Yelitza Tovar', 'Gerente General de Talento Humano (E)',
        'Todos los trabajadores y Gerentes Nacionales', NULL, 'Día No Laborable - Asueto Contractual',
        'Cláusula N° 49 Convención Colectiva CORPOELEC.', 'ORDINARIO', 'MEDIA', '2026-07-29', '2026-07-29',
        NULL, 'ARCHIVADO', 'Telegram Grupo Santa Rosa', FALSE, '1p32CE6CYM7T2mOSPjV_uLbZLcr_hdTki',
        'DOC-20260729-WA0174 DIA NO LABORABLE ASUETO CONTRACTUAL.pdf', 'https://drive.google.com/file/d/1p32CE6CYM7T2mOSPjV_uLbZLcr_hdTki/view',
        NULL, NULL, NULL, NULL, '2026-07-29T10:00:00Z', '2026-07-29T10:00:00Z'
    ),
    (
        'corresp-002', 'RAD-GGPD-2026-0002', 'ENTRADA', 'INSTRUCCION_EJECUTIVA', 'Ing. Adrián Correa - Gerente General de Distribución (GGD)', 'MEMORANDUM',
        'GGD-NR-0733-202608', 'Gerencia General de Distribución (GGD)', 'Ing. Adrián Correa', 'Gerente General de Distribución (GGD)',
        'Ing. Carlos Reyes (Gerente General Gestión de Planificación)', 'Lcdo. Rodolfo Labrador (Soporte Logístico)',
        'Remisión de Memorándum PRES-M-0876-2026', 'Remisión de instrucción de Despacho de Presidencia de CORPOELEC para adecuación del plan de distribución.',
        'CONFIDENCIAL', 'ALTA', '2026-08-05', '2026-08-17', '2026-08-25', 'EN_REVISION', 'WhatsApp Grupo GGD', TRUE,
        '17GnTkTgzIjyk0c_kb357gWBCDIa19E4a', 'GGD-NR-0733-202608-PRES-M-0876-2026_20260805101513.pdf', 'https://drive.google.com/file/d/17GnTkTgzIjyk0c_kb357gWBCDIa19E4a/view',
        NULL, NULL, NULL, NULL, '2026-08-05T09:00:00Z', '2026-08-17T11:00:00Z'
    ),
    (
        'corresp-003', 'RAD-GGPD-2026-0003', 'ENTRADA', 'INFORMATIVO_NOTIFICACION', NULL, 'CIRCULAR',
        'GGD-NR-0735-2026', 'Gerencia General de Distribución (GGD)', 'Ing. Adrián Correa', 'Gerente General de Distribución (GGD)',
        'Ing. Carlos Reyes / Lcdo. Rodolfo Labrador', NULL, 'Remisión de Circular N° PRES-C-0052-2026',
        'Directrices de presidencia para la coordinación logística y operativa.', 'ORDINARIO', 'MEDIA',
        '2026-08-04', '2026-08-17', NULL, 'RADICADO', 'WhatsApp Grupo GGD', FALSE,
        '1U_c_rknldDT0IYT4y7QziFti8qBKTdha', 'GGD-NR-0735-2026-PRES-C-0052-2026_20260805095847.pdf', 'https://drive.google.com/file/d/1U_c_rknldDT0IYT4y7QziFti8qBKTdha/view',
        NULL, NULL, NULL, NULL, '2026-08-04T10:00:00Z', '2026-08-17T10:00:00Z'
    ),
    (
        'corresp-004', 'RAD-GGPD-2026-0004', 'ENTRADA', 'REVISION_CONFORMACION', NULL, 'CIRCULAR',
        'GGD-NR-0758-202608', 'Gerencia General de Distribución (GGD)', 'Ing. Adrián Correa', 'Gerente General de Distribución (GGD)',
        'Ing. Carlos Reyes / Lcdo. Rodolfo Labrador', NULL, 'Remisión de Circular N° PRES-C-0058-2026: Delegación de Atribuciones',
        'Resolución de delegación de firmas y atribuciones directivas en CORPOELEC.', 'CONFIDENCIAL', 'ALTA',
        '2026-08-10', '2026-08-17', '2026-08-20', 'EN_REVISION', 'WhatsApp Grupo GGD', FALSE,
        '1lO3rAAS5v3HxlIvu6QmONeM5eG9ca9az', 'GGD-NR-0758-2026 - CIRCULAR PRES-C-0058.2026  _20260814181424.pdf', 'https://drive.google.com/file/d/1lO3rAAS5v3HxlIvu6QmONeM5eG9ca9az/view',
        NULL, NULL, NULL, NULL, '2026-08-10T10:00:00Z', '2026-08-17T10:00:00Z'
    ),
    (
        'corresp-005', 'RAD-GGPD-2026-0005', 'ENTRADA', 'INSTRUCCION_EJECUTIVA', 'Ing. Adrián Correa - Gerente General de Distribución (GGD)', 'MEMORANDUM',
        'GGD-NR-0764-202608', 'Gerencia General de Distribución (GGD)', 'Ing. Adrián Correa', 'Gerente General de Distribución (GGD)',
        'Mario Oswaldo Mora (Gerente Estadal Distribución La Guaira)', 'Ing. Carlos Reyes (GGPD) • Lcdo. Rodolfo Labrador (Soporte Logístico)',
        'Solicitud de Dos (2) Bancos de Transformadores 3x50 kVA para La Guaira', 'Remisión de comunicación MPRES-2616-2026 / PRES-INS-11970 para atención urgente de contingencia eléctrica en La Guaira.',
        'CONFIDENCIAL', 'URGENTE_24H', '2026-08-11', '2026-08-17', '2026-08-25', 'ASIGNADO_CON_TAREA', 'WhatsApp Grupo GGD', TRUE,
        '1u82a1gzG0rIszXOkh7yjp_ZNi1O1rE68', 'GGD-NR-0764-202608 MPRES-2616-PRES-INS-11970_20260813133715.pdf', 'https://drive.google.com/file/d/1u82a1gzG0rIszXOkh7yjp_ZNi1O1rE68/view',
        'T-2026-0027', 'Evaluación Técnica y Asignación de 2 Bancos Trafo 3x50kVA La Guaira', 'Ing. Josué Pacheco', 'Especialista de Planificación',
        '2026-08-11T12:00:00Z', '2026-08-17T14:30:00Z'
    ),
    (
        'corresp-006', 'RAD-GGPD-2026-0006', 'ENTRADA', 'EVALUACION_TECNICA', NULL, 'MEMORANDUM',
        'GGD-NR-0752-202608', 'Gerencia General de Distribución (GGD)', 'Ing. Adrián Correa', 'Gerente General de Distribución (GGD)',
        'Ing. Carlos Reyes / Lcdo. Rodolfo Labrador', NULL, 'Procedimiento de Solicitud de Disminución de Demanda Contratada',
        'Remisión del memorándum GGPPSYC-355-2026 estableciendo los protocolos para el ajuste de demanda contratada en grandes usuarios.',
        'ORDINARIO', 'ALTA', '2026-08-10', '2026-08-17', '2026-08-24', 'ASIGNADO_CON_TAREA', 'WhatsApp Grupo GGD', TRUE,
        '1qvQrnzxd-B5Axp0mPgUsWy6qM4Ezh6Wr', 'GGD-NR-0752-2026 - GGPPSYC-355-2026 _20260814175902.pdf', 'https://drive.google.com/file/d/1qvQrnzxd-B5Axp0mPgUsWy6qM4Ezh6Wr/view',
        'T-2026-0028', 'Adecuación de Normativa de Demanda Contratada en SIGI', 'Ing. Yván Cipiran', 'Líder de Automatización',
        '2026-08-10T10:00:00Z', '2026-08-17T15:00:00Z'
    ),
    (
        'corresp-007', 'RAD-GGPD-2026-0007', 'ENTRADA', 'INFORMATIVO_NOTIFICACION', NULL, 'CIRCULAR',
        'GGD-NR-0753-2026', 'Gerencia General de Distribución (GGD)', 'Ing. Adrián Correa', 'Gerente General de Distribución (GGD)',
        'Gerentes Nacionales y Estadales de Distribución', NULL, 'Remisión de Circular N° PRES-C-0053-2026',
        'Lineamientos operativos institucionales emitidos por presidencia.', 'ORDINARIO', 'MEDIA',
        '2026-08-10', '2026-08-14', NULL, 'RADICADO', 'WhatsApp Grupo GGD', FALSE,
        '1cFaeNIaKt99V0OLYhuQ_5ge-CaoN3hVS', 'GGD-NR-0753-2026 - CIRCULAR PRES-C-0053-2026  _20260814180100.pdf', 'https://drive.google.com/file/d/1cFaeNIaKt99V0OLYhuQ_5ge-CaoN3hVS/view',
        NULL, NULL, NULL, NULL, '2026-08-10T09:00:00Z', '2026-08-14T10:00:00Z'
    ),
    (
        'corresp-008', 'RAD-GGPD-2026-0008', 'ENTRADA', 'INFORMATIVO_NOTIFICACION', NULL, 'CIRCULAR',
        'GGD-NR-0754-202608', 'Gerencia General de Distribución (GGD)', 'Ing. Adrián Correa', 'Gerente General de Distribución (GGD)',
        'Gerentes Nacionales y Estadales de Distribución', NULL, 'Líneas de Acción de la Política de Comunicación e Información de CORPOELEC',
        'Remisión de Circular PRES-C-0054.2026 sobre uso de canales oficiales y confidencialidad.', 'CONFIDENCIAL', 'ALTA',
        '2026-08-10', '2026-08-14', NULL, 'RADICADO', 'WhatsApp Grupo GGD', FALSE,
        '1sjv50LxgiVQoq3aPKKz5ZkrcI5lUCkWO', 'GGD-NR-0754-202 - CIRrCULAR PRES-C-0054.2026  _20260814180229.pdf', 'https://drive.google.com/file/d/1sjv50LxgiVQoq3aPKKz5ZkrcI5lUCkWO/view',
        NULL, NULL, NULL, NULL, '2026-08-10T10:00:00Z', '2026-08-14T10:00:00Z'
    ),
    (
        'corresp-009', 'RAD-GGPD-2026-0009', 'ENTRADA', 'REVISION_CONFORMACION', NULL, 'CIRCULAR',
        'GGD-NR-0756-202607', 'Gerencia General de Distribución (GGD)', 'Ing. Adrián Correa', 'Gerente General de Distribución (GGD)',
        'Gerentes Nacionales y Estadales de Distribución', NULL, 'Ratificación de Circulares PRES-C-0005-2026 y PRES-C-0020-2026',
        'Cumplimiento normativo y directivas de control de gestión.', 'ORDINARIO', 'MEDIA',
        '2026-08-10', '2026-08-14', NULL, 'RADICADO', 'WhatsApp Grupo GGD', FALSE,
        '1AOEmitd03_UyoOc1ug7Cq899zTwNL8Ig', 'GGD-NR-0756-2026 - CIRCULAR PRES-C-0056.2026  _20260814181311.pdf', 'https://drive.google.com/file/d/1AOEmitd03_UyoOc1ug7Cq899zTwNL8Ig/view',
        NULL, NULL, NULL, NULL, '2026-08-10T10:00:00Z', '2026-08-14T10:00:00Z'
    ),
    (
        'corresp-010', 'RAD-GGPD-2026-0010', 'ENTRADA', 'EVALUACION_TECNICA', NULL, 'INFORME_TECNICO',
        'GGD-NR-0725-202607-1', 'Gerencia General de Distribución (GGD)', 'Ing. Adrián Correa', 'Gerente General de Distribución (GGD)',
        'Ing. Carlos Reyes (GGPD)', NULL, 'Remisión de Listado de Facturación y Cuentas de Distribución',
        'Informe y listado de facturas asociadas a proyectos especiales para evaluación técnica presupuestaria.',
        'CONFIDENCIAL', 'MEDIA', '2026-08-11', '2026-08-18', '2026-08-25', 'EN_REVISION', 'Drive GGD', TRUE,
        '1QhEeN3uzDbuZw6HpTDoggAxc1vXpWGjj', 'GGD-NR-0725-202607-1_20260811100351.pdf', 'https://drive.google.com/file/d/1QhEeN3uzDbuZw6HpTDoggAxc1vXpWGjj/view',
        NULL, NULL, NULL, NULL, '2026-08-11T10:00:00Z', '2026-08-18T10:00:00Z'
    ),
    (
        'corresp-011', 'RAD-GGPD-2026-0011', 'ENTRADA', 'INFORMATIVO_NOTIFICACION', NULL, 'INFORME_TECNICO',
        'GGD-NR-0680-202607', 'Gerencia General de Distribución (GGD)', 'Ing. Adrián Correa', 'Gerente General de Distribución (GGD)',
        'Ing. Carlos Reyes (GGPD)', NULL, 'Informe de Gestión Operativa de Redes y Subestaciones Julio 2026',
        'Balance mensual de disponibilidad y mantenimiento en el SEN.', 'ORDINARIO', 'MEDIA',
        '2026-07-17', '2026-08-18', NULL, 'ARCHIVADO', 'Drive GGD', FALSE,
        '1GoU2FufJLY3IDahpYwNilfrlN2W6xsl1', 'GGD-NR-0680-202607_20260717171039.pdf', 'https://drive.google.com/file/d/1GoU2FufJLY3IDahpYwNilfrlN2W6xsl1/view',
        NULL, NULL, NULL, NULL, '2026-07-17T17:00:00Z', '2026-08-18T10:00:00Z'
    )
    ON CONFLICT (id) DO UPDATE SET
        proposito = EXCLUDED.proposito,
        instruido_por = EXCLUDED.instruido_por,
        asunto = EXCLUDED.asunto,
        remitente_nombre = EXCLUDED.remitente_nombre,
        destinatario_principal = EXCLUDED.destinatario_principal,
        estado_tramite = EXCLUDED.estado_tramite,
        updated_at = NOW();

    -- Oficio de Respuesta para corresp-005
    INSERT INTO scgcc.mae_oficios_salida (
        id, correspondencia_origen_id, correlativo_origen, numero_oficio, tipo_documento,
        destinatario_institucion, destinatario_nombre, destinatario_cargo, asunto,
        referencia_antecedente, cuerpo_texto, conclusiones_tecnicas, firmante_nombre,
        firmante_cargo, redactado_por, estado_firma, fecha_creacion, fecha_firma,
        fecha_despacho, nro_guia_acuse, receptor_acuse_nombre, copias, anexos
    ) VALUES (
        'of-resp-001', 'corresp-005', 'RAD-GGPD-2026-0005', 'GGPD-OF-2026-0042', 'OFICIO',
        'Gerencia General de Distribución (GGD)', 'Ing. Adrián Correa', 'Gerente General de Distribución',
        'Respuesta Técnica y Priorización: Asignación de 2 Bancos de Transformadores 3x50 kVA para el Estado La Guaira',
        'GGD-NR-0764-202608 / MPRES-2616-2026',
        'Por medio de la presente, en atención a la comunicación de la referencia mediante la cual se solicita la dotación de dos (2) bancos de transformadores de 3x50 kVA para solventar contingencia operativa en los circuitos de distribución del Estado La Guaira, cumplo con informar que la División de Planificación Técnica ha efectuado la respectiva evaluación de criticidad y disponibilidad en almacén central.\n\nAl respecto, se emite dictamen técnico FAVORABLE para la asignación inmediata de los equipos requeridos.',
        '1. Factibilidad técnica comprobada.\n2. Equipos validados en stock estratégico.\n3. Se adjunta Ficha de Priorización PRTSEN.',
        'Ing. Carlos Reyes', 'Gerente General de Gestión de Planificación (GGPD)', 'Ing. Josué Pacheco',
        'DESPACHADO_CON_ACUSE', '2026-08-18', '2026-08-19', '2026-08-20',
        'GUIA-DESP-2026-0892', 'Lcdo. Rodolfo Labrador (Soporte Logístico)',
        'Ing. Carlos Reyes (GGPD) • Lcdo. Rodolfo Labrador (Soporte Logístico)',
        'Ficha Técnica de Equipos • Matriz de Carga Subestación La Guaira'
    )
    ON CONFLICT (id) DO UPDATE SET
        asunto = EXCLUDED.asunto,
        firmante_nombre = EXCLUDED.firmante_nombre,
        firmante_cargo = EXCLUDED.firmante_cargo,
        estado_firma = EXCLUDED.estado_firma;
    """
    
    if run_query(seed_sql):
        print("✅ 11 correspondencias oficiales sembradas exitosamente en InsForge PostgreSQL.")

    print("\n3. Verificando conteo en vista semántica pública...")
    run_query("SELECT COUNT(*) AS total_vista FROM public.v_scgcc_correspondencias_activas;")

if __name__ == "__main__":
    main()
