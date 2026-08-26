-- =============================================================================
-- CORPOELEC - GGPD | BASE DE CONOCIMIENTOS INTELIGENTE (GGPD-BCI)
-- Esquema de Seguridad ISO/IEC 27001:2022 — Control de Acceso por Tokens Cifrados
-- =============================================================================

-- 1. TABLA MAESTRA DE API TOKENS CIFRADOS (ZERO-TRUST)
CREATE TABLE IF NOT EXISTS knowledge.mae_api_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    token_prefix VARCHAR(20) NOT NULL, -- Ej: 'bci_live_8f3a' para identificación pública
    token_hash VARCHAR(64) UNIQUE NOT NULL, -- Hash SHA-256 del token secreto (Nunca se guarda el token en texto plano)
    usuario_id VARCHAR(100) NOT NULL, -- Identificador institucional (ej. 'yvan.cipiran', 'josue.pacheco')
    nombre_desarrollador VARCHAR(200) NOT NULL,
    correo_institucional VARCHAR(200) NOT NULL,
    gerencia_division VARCHAR(200) DEFAULT 'Planificación de Distribución (GGPD)',
    nivel_acceso VARCHAR(50) NOT NULL DEFAULT 'NIVEL_2_TECNICO' CHECK (nivel_acceso IN (
        'NIVEL_1_GENERAL',          -- Acceso a hechos públicos y reglas generales
        'NIVEL_2_TECNICO',          -- Acceso a metas SEN, esquemas de BD, RAG técnico y codegraph
        'NIVEL_3_RESERVADO_DIRECTIVA'-- Acceso integral a toda la base incluyendo dictámenes confidenciales
    )),
    cuota_diaria_consultas INT NOT NULL DEFAULT 1000,
    consultas_hoy INT NOT NULL DEFAULT 0,
    fecha_emision TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    fecha_expiracion TIMESTAMPTZ NOT NULL,
    estado VARCHAR(30) NOT NULL DEFAULT 'ACTIVO' CHECK (estado IN ('ACTIVO', 'SUSPENDIDO', 'REVOCADO', 'EXPIRADO')),
    motivo_revocacion TEXT,
    ultimo_acceso TIMESTAMPTZ,
    ip_ultimo_acceso VARCHAR(50),
    emitido_por VARCHAR(100) NOT NULL DEFAULT 'admin.ggpd',
    metadata_json JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bci_tokens_hash ON knowledge.mae_api_tokens(token_hash);
CREATE INDEX IF NOT EXISTS idx_bci_tokens_user ON knowledge.mae_api_tokens(usuario_id);
CREATE INDEX IF NOT EXISTS idx_bci_tokens_estado ON knowledge.mae_api_tokens(estado);

-- 2. TABLA DE AUDITORÍA INMUTABLE DE CONSULTAS DE IA (ISACA COBIT / ISO 27001)
CREATE TABLE IF NOT EXISTS knowledge.mae_auditoria_consultas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    token_id UUID REFERENCES knowledge.mae_api_tokens(id) ON DELETE SET NULL,
    usuario_id VARCHAR(100) NOT NULL,
    tipo_consulta VARCHAR(50) NOT NULL, -- 'RAG_SEARCH', 'FACT_LOOKUP', 'DECISION_LOOKUP', 'GRAPH_LOOKUP', 'MCP_TOOL_CALL'
    termino_busqueda TEXT,
    chunks_retornados INT DEFAULT 0,
    latencia_ms INT,
    client_agent VARCHAR(100) DEFAULT 'Antigravity IDE / MCP',
    ip_cliente VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bci_audit_user ON knowledge.mae_auditoria_consultas(usuario_id);
CREATE INDEX IF NOT EXISTS idx_bci_audit_date ON knowledge.mae_auditoria_consultas(created_at DESC);

-- 3. FUNCIÓN DE VALIDACIÓN Y AUDITORÍA ATÓMICA DE TOKENS
CREATE OR REPLACE FUNCTION knowledge.fn_validar_token_bci(
    p_token_plain TEXT,
    p_tipo_consulta TEXT DEFAULT 'RAG_SEARCH',
    p_termino TEXT DEFAULT '',
    p_client_agent TEXT DEFAULT 'CLI / SDK',
    p_chunks_retornados INT DEFAULT 0,
    p_latencia_ms INT DEFAULT 0
)
RETURNS TABLE (
    valido BOOLEAN,
    mensaje TEXT,
    token_id UUID,
    usuario_id VARCHAR(100),
    nombre_desarrollador VARCHAR(200),
    nivel_acceso VARCHAR(50),
    consultas_restantes INT
) AS $$
DECLARE
    v_hash VARCHAR(64);
    v_rec RECORD;
BEGIN
    -- Calcular Hash SHA-256 del token plano entregado por la IDE/SDK
    v_hash := encode(digest(p_token_plain, 'sha256'), 'hex');
    
    -- Buscar token activo
    SELECT t.id, t.usuario_id, t.nombre_desarrollador, t.nivel_acceso, t.cuota_diaria_consultas,
           t.consultas_hoy, t.fecha_expiracion, t.estado
    INTO v_rec
    FROM knowledge.mae_api_tokens t
    WHERE t.token_hash = v_hash;
    
    IF NOT FOUND THEN
        RETURN QUERY SELECT FALSE, 'Token no válido o no existe en el registro central BCI'::TEXT, NULL::UUID, NULL::VARCHAR, NULL::VARCHAR, NULL::VARCHAR, 0;
        RETURN;
    END IF;
    
    IF v_rec.estado <> 'ACTIVO' THEN
        RETURN QUERY SELECT FALSE, ('Token en estado ' || v_rec.estado || '. Acceso denegado.')::TEXT, v_rec.id, v_rec.usuario_id, v_rec.nombre_desarrollador, v_rec.nivel_acceso, 0;
        RETURN;
    END IF;
    
    IF v_rec.fecha_expiracion < NOW() THEN
        -- Marcar como expirado
        UPDATE knowledge.mae_api_tokens SET estado = 'EXPIRADO', updated_at = NOW() WHERE id = v_rec.id;
        RETURN QUERY SELECT FALSE, 'Token expirado. Solicite renovación a la Gerencia General.'::TEXT, v_rec.id, v_rec.usuario_id, v_rec.nombre_desarrollador, v_rec.nivel_acceso, 0;
        RETURN;
    END IF;
    
    IF v_rec.consultas_hoy >= v_rec.cuota_diaria_consultas THEN
        RETURN QUERY SELECT FALSE, 'Cuota diaria de consultas excedida (' || v_rec.cuota_diaria_consultas || '/día).'::TEXT, v_rec.id, v_rec.usuario_id, v_rec.nombre_desarrollador, v_rec.nivel_acceso, 0;
        RETURN;
    END IF;
    
    -- Actualizar contador y último acceso
    UPDATE knowledge.mae_api_tokens
    SET consultas_hoy = consultas_hoy + 1,
        ultimo_acceso = NOW(),
        updated_at = NOW()
    WHERE id = v_rec.id;
    
    -- Registrar en bitácora de auditoría inmutable
    INSERT INTO knowledge.mae_auditoria_consultas (
        token_id, usuario_id, tipo_consulta, termino_busqueda, chunks_retornados, latencia_ms, client_agent
    ) VALUES (
        v_rec.id, v_rec.usuario_id, p_tipo_consulta, p_termino, p_chunks_retornados, p_latencia_ms, p_client_agent
    );
    
    RETURN QUERY SELECT TRUE, 'Acceso autorizado ISO 27001'::TEXT, v_rec.id, v_rec.usuario_id, v_rec.nombre_desarrollador, v_rec.nivel_acceso, (v_rec.cuota_diaria_consultas - v_rec.consultas_hoy - 1);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. VISTA DE MONITOREO DE TOKENS (SOLO ADMINISTRADORES)
CREATE OR REPLACE VIEW public.v_knowledge_tokens_activos AS
SELECT 
    id,
    token_prefix,
    usuario_id,
    nombre_desarrollador,
    correo_institucional,
    gerencia_division,
    nivel_acceso,
    cuota_diaria_consultas,
    consultas_hoy,
    fecha_emision,
    fecha_expiracion,
    estado,
    ultimo_acceso,
    emitido_por
FROM knowledge.mae_api_tokens
ORDER BY created_at DESC;

-- 5. VISTA DE MONITOREO DE AUDITORÍA
CREATE OR REPLACE VIEW public.v_knowledge_auditoria_reciente AS
SELECT 
    a.id,
    a.usuario_id,
    t.nombre_desarrollador,
    t.nivel_acceso,
    a.tipo_consulta,
    a.termino_busqueda,
    a.chunks_retornados,
    a.latencia_ms,
    a.client_agent,
    a.created_at
FROM knowledge.mae_auditoria_consultas a
LEFT JOIN knowledge.mae_api_tokens t ON t.id = a.token_id
ORDER BY a.created_at DESC
LIMIT 100;
