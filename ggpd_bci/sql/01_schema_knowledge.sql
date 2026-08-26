-- =============================================================================
-- CORPOELEC - GGPD | BASE DE CONOCIMIENTOS INTELIGENTE (GGPD-BCI)
-- Esquema Maestro de Memoria de IA, RAG y Gobernanza Desacoplada
-- Alias de Conexión: insforge-base-conocimientos-automatizacion
-- Base de Datos: jd3uejbz.ap-southeast.database.insforge.app (InsForge PostgreSQL)
-- =============================================================================

-- 1. EXTENSIONES REQUERIDAS
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS unaccent;

-- 2. ESQUEMA DEDICADO
CREATE SCHEMA IF NOT EXISTS knowledge;

-- 3. CAPA L1: HECHOS ATÓMICOS Y CONFIGURACIONES MAESTRAS
CREATE TABLE IF NOT EXISTS knowledge.mae_hechos_l1 (
    id VARCHAR(100) PRIMARY KEY,
    categoria VARCHAR(50) NOT NULL, -- 'INFRAESTRUCTURA', 'PRODUCCION', 'METAS_SEN', 'ACTIVOS_SEN', 'ORGANIZACION', 'HARDWARE'
    clave VARCHAR(100) NOT NULL,
    valor_texto TEXT,
    valor_json JSONB,
    descripcion TEXT,
    vigente BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. CAPA L2: DECISIONES ARQUITECTURALES Y DICTÁMENES FORMALES (ADRs)
CREATE TABLE IF NOT EXISTS knowledge.mae_decisiones_l2 (
    id VARCHAR(100) PRIMARY KEY,
    codigo_documento VARCHAR(50), -- 'DOC-GGPD-2026-METAS-001', 'DOC-GGPD-2026-GOB-001', 'DOC-GGPD-2026-DIAG-PROC-001'
    titulo TEXT NOT NULL,
    escenario TEXT NOT NULL,
    decision TEXT NOT NULL,
    justificacion_normativa TEXT, -- ISO 8000, ISO 27001, ISACA COBIT 2019, ISO 55000
    impacto_sistemas TEXT[], -- ['SIGI', 'SCMTP', 'SCGCC', 'SCPPE', 'SCEIN', 'SCTIS']
    fecha_decision DATE NOT NULL DEFAULT CURRENT_DATE,
    estado VARCHAR(30) DEFAULT 'APROBADO_VIGENTE',
    metadata_json JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. CAPA L3: DOCUMENTOS, MANUALES Y CHUNKS RAG (BÚSQUEDA SEMÁNTICA & TEXTO)
CREATE TABLE IF NOT EXISTS knowledge.mae_documentos_rag (
    id VARCHAR(100) PRIMARY KEY,
    documento_origen VARCHAR(255) NOT NULL,
    seccion VARCHAR(255) NOT NULL,
    chunk_index INT DEFAULT 0,
    titulo TEXT NOT NULL,
    contenido TEXT NOT NULL,
    resumen TEXT,
    tags TEXT[],
    tsv_contenido TSVECTOR,
    embedding VECTOR(1536), -- Compatible con OpenAI text-embedding-3-small / InsForge Embeddings
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_doc_rag_tsv ON knowledge.mae_documentos_rag USING gin (tsv_contenido);
CREATE INDEX IF NOT EXISTS idx_doc_rag_doc ON knowledge.mae_documentos_rag (documento_origen);
CREATE INDEX IF NOT EXISTS idx_doc_rag_tags ON knowledge.mae_documentos_rag USING gin (tags);

-- Función y Trigger para actualización automática de tsvector en español
CREATE OR REPLACE FUNCTION knowledge.fn_update_doc_tsv()
RETURNS TRIGGER AS $$
BEGIN
    NEW.tsv_contenido := to_tsvector('spanish', 
        coalesce(NEW.titulo, '') || ' ' || 
        coalesce(NEW.contenido, '') || ' ' || 
        coalesce(NEW.resumen, '') || ' ' || 
        coalesce(array_to_string(NEW.tags, ' '), '')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_doc_rag_tsv ON knowledge.mae_documentos_rag;
CREATE TRIGGER trg_doc_rag_tsv
BEFORE INSERT OR UPDATE ON knowledge.mae_documentos_rag
FOR EACH ROW EXECUTE FUNCTION knowledge.fn_update_doc_tsv();

-- 6. CAPA L4: GRAFO DE CÓDIGO, DEPENDENCIAS Y TAXONOMÍA DE LAS 6 APLICACIONES
CREATE TABLE IF NOT EXISTS knowledge.mae_grafo_codigo (
    id VARCHAR(100) PRIMARY KEY,
    aplicacion VARCHAR(50) NOT NULL,
    tipo_nodo VARCHAR(50) NOT NULL,
    nombre_nodo VARCHAR(200) NOT NULL,
    ruta_archivo TEXT,
    puerto INT,
    descripcion TEXT,
    lecturas_db TEXT[],
    escrituras_db TEXT[],
    enlaces_apps TEXT[],
    dependencias_json JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. CAPA L5: SESIONES DE HANDOFF, CONTINUIDAD Y TRAZABILIDAD MULTI-AGENTE
CREATE TABLE IF NOT EXISTS knowledge.mae_sesiones_handoff (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    fecha_sesion TIMESTAMPTZ DEFAULT NOW(),
    version_repositorio VARCHAR(50),
    resumen_ejecutivo TEXT NOT NULL,
    tareas_completadas JSONB NOT NULL DEFAULT '[]'::jsonb,
    proximas_acciones JSONB NOT NULL DEFAULT '[]'::jsonb,
    agente_emisor VARCHAR(100) DEFAULT 'Antigravity IDE 2.0 (Gemini 3.7 Flash)',
    commit_sha VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. VISTAS SEMÁNTICAS PÚBLICAS
CREATE OR REPLACE VIEW public.v_knowledge_hechos_activos AS
SELECT id, categoria, clave, valor_texto, valor_json, descripcion
FROM knowledge.mae_hechos_l1
WHERE vigente = TRUE;

CREATE OR REPLACE VIEW public.v_knowledge_decisiones_activas AS
SELECT id, codigo_documento, titulo, escenario, decision, justificacion_normativa, impacto_sistemas, fecha_decision
FROM knowledge.mae_decisiones_l2
WHERE estado = 'APROBADO_VIGENTE'
ORDER BY fecha_decision DESC;

CREATE OR REPLACE VIEW public.v_knowledge_grafo_resumen AS
SELECT aplicacion, tipo_nodo, count(*) as total_elementos
FROM knowledge.mae_grafo_codigo
GROUP BY aplicacion, tipo_nodo
ORDER BY aplicacion, tipo_nodo;
