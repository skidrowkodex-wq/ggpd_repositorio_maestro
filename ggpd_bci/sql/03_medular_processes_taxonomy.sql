-- =============================================================================
-- CORPOELEC - GGPD | BASE DE CONOCIMIENTOS INTELIGENTE (GGPD-BCI)
-- Migración 03: Taxonomía Multi-Proceso Medular SEN (G, T, D, C y Transversal)
-- =============================================================================

-- 1. CATÁLOGO CANÓNICO DE PROCESOS MEDULARES SEN
CREATE TABLE IF NOT EXISTS knowledge.cat_procesos_medulares (
    codigo VARCHAR(30) PRIMARY KEY,
    denominacion VARCHAR(150) NOT NULL,
    descripcion TEXT,
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sembrar los 4 Procesos Medulares Oficiales + Transversal
INSERT INTO knowledge.cat_procesos_medulares (codigo, denominacion, descripcion) VALUES
('DISTRIBUCION', 'Distribución Eléctrica', 'Redes de media/baja tensión, subestaciones de distribución, confiabilidad (TTI/FMI), mantenimiento de transformadores y pica y poda.')
ON CONFLICT (codigo) DO UPDATE SET denominacion = EXCLUDED.denominacion, descripcion = EXCLUDED.descripcion;

INSERT INTO knowledge.cat_procesos_medulares (codigo, denominacion, descripcion) VALUES
('COMERCIALIZACION', 'Comercialización y Facturación', 'Gestión de suministros, micromedición, macromedición, facturación, cobranza, cierres financieros y control de pérdidas no técnicas.')
ON CONFLICT (codigo) DO UPDATE SET denominacion = EXCLUDED.denominacion, descripcion = EXCLUDED.descripcion;

INSERT INTO knowledge.cat_procesos_medulares (codigo, denominacion, descripcion) VALUES
('TRANSMISION', 'Transmisión Eléctrica', 'Sistema Troncal Interconectado (765kV a 115kV), subestaciones de potencia, líneas de alta tensión y Centro Nacional de Despacho (CND).')
ON CONFLICT (codigo) DO UPDATE SET denominacion = EXCLUDED.denominacion, descripcion = EXCLUDED.descripcion;

INSERT INTO knowledge.cat_procesos_medulares (codigo, denominacion, descripcion) VALUES
('GENERACION', 'Generación Eléctrica', 'Parques de generación hidroeléctrica, termoeléctrica y energías renovables; balance energético primario y disponibilidad de unidades.')
ON CONFLICT (codigo) DO UPDATE SET denominacion = EXCLUDED.denominacion, descripcion = EXCLUDED.descripcion;

INSERT INTO knowledge.cat_procesos_medulares (codigo, denominacion, descripcion) VALUES
('TRANSVERSAL', 'Gobernanza Corporativa y Soporte', 'Planificación Estratégica SEN, Plan de la Patria, Metas 2026, Auditoría ISO (8000, 27001, 55000), COBIT y Tecnologías de Información.')
ON CONFLICT (codigo) DO UPDATE SET denominacion = EXCLUDED.denominacion, descripcion = EXCLUDED.descripcion;

-- 2. ENRIQUECIMIENTO DE TABLAS DE CONOCIMIENTO CON COLUMNAS MULTI-PROCESO
ALTER TABLE knowledge.mae_documentos_rag 
    ADD COLUMN IF NOT EXISTS proceso_primario VARCHAR(30) DEFAULT 'DISTRIBUCION' REFERENCES knowledge.cat_procesos_medulares(codigo),
    ADD COLUMN IF NOT EXISTS procesos_impactados TEXT[] DEFAULT ARRAY['DISTRIBUCION'],
    ADD COLUMN IF NOT EXISTS dominio_funcional VARCHAR(100) DEFAULT 'PLANIFICACION_OPERATIVA';

ALTER TABLE knowledge.mae_hechos_l1 
    ADD COLUMN IF NOT EXISTS proceso_primario VARCHAR(30) DEFAULT 'DISTRIBUCION' REFERENCES knowledge.cat_procesos_medulares(codigo),
    ADD COLUMN IF NOT EXISTS procesos_impactados TEXT[] DEFAULT ARRAY['DISTRIBUCION'];

ALTER TABLE knowledge.mae_decisiones_l2 
    ADD COLUMN IF NOT EXISTS proceso_primario VARCHAR(30) DEFAULT 'DISTRIBUCION' REFERENCES knowledge.cat_procesos_medulares(codigo),
    ADD COLUMN IF NOT EXISTS procesos_impactados TEXT[] DEFAULT ARRAY['DISTRIBUCION'];

-- 3. ÍNDICES GIN Y BTREE POR PROCESO
CREATE INDEX IF NOT EXISTS idx_doc_rag_proceso ON knowledge.mae_documentos_rag(proceso_primario);
CREATE INDEX IF NOT EXISTS idx_doc_rag_procesos_arr ON knowledge.mae_documentos_rag USING gin(procesos_impactados);

-- 4. VISTAS SEMÁNTICAS PÚBLICAS POR PROCESO MEDULAR
CREATE OR REPLACE VIEW public.v_knowledge_distribucion AS
SELECT id, documento_origen, seccion, titulo, contenido, resumen, tags, proceso_primario, procesos_impactados, dominio_funcional
FROM knowledge.mae_documentos_rag 
WHERE 'DISTRIBUCION' = ANY(procesos_impactados);

CREATE OR REPLACE VIEW public.v_knowledge_comercializacion AS
SELECT id, documento_origen, seccion, titulo, contenido, resumen, tags, proceso_primario, procesos_impactados, dominio_funcional
FROM knowledge.mae_documentos_rag 
WHERE 'COMERCIALIZACION' = ANY(procesos_impactados);

CREATE OR REPLACE VIEW public.v_knowledge_transmision AS
SELECT id, documento_origen, seccion, titulo, contenido, resumen, tags, proceso_primario, procesos_impactados, dominio_funcional
FROM knowledge.mae_documentos_rag 
WHERE 'TRANSMISION' = ANY(procesos_impactados);

CREATE OR REPLACE VIEW public.v_knowledge_generacion AS
SELECT id, documento_origen, seccion, titulo, contenido, resumen, tags, proceso_primario, procesos_impactados, dominio_funcional
FROM knowledge.mae_documentos_rag 
WHERE 'GENERACION' = ANY(procesos_impactados);

CREATE OR REPLACE VIEW public.v_knowledge_interfases_solapadas AS
SELECT id, documento_origen, seccion, titulo, proceso_primario, procesos_impactados, dominio_funcional, array_length(procesos_impactados, 1) as total_procesos
FROM knowledge.mae_documentos_rag 
WHERE array_length(procesos_impactados, 1) > 1
ORDER BY array_length(procesos_impactados, 1) DESC;
