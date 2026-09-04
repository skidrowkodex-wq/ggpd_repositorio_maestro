-- ============================================================================
-- MIGRACIÓN BCI: 20260904_bci_emision_y_gestion_tokens.sql
-- Instancia BCI: jd3uejbz.ap-southeast.insforge.app (ggpd-base-conocimientos-ia)
-- Objetivo: permitir a SIGI-REF emitir, suspender, revocar y reactivar
-- tokens BCI de forma segura vía API REST (sin conexión postgres del frontend).
-- ============================================================================

-- Sección 1: Wrapper RPC público para emitir un token
CREATE OR REPLACE FUNCTION public.fn_emitir_token_bci(
    p_usuario_id VARCHAR(100),
    p_nombre_desarrollador VARCHAR(200),
    p_correo_institucional VARCHAR(200),
    p_gerencia_division VARCHAR(200) DEFAULT 'Planificación de Distribución (GGPD)',
    p_nivel_acceso VARCHAR(50) DEFAULT 'NIVEL_2_TECNICO',
    p_cuota_diaria INT DEFAULT 500,
    p_dias_vigencia INT DEFAULT 90,
    p_emitido_por VARCHAR(100) DEFAULT 'admin.ggpd'
)
RETURNS JSONB AS $$
DECLARE
    v_token_plain VARCHAR(50);
    v_token_prefix VARCHAR(20);
    v_token_hash VARCHAR(64);
    v_token_id UUID;
BEGIN
    -- Validación de nivel
    IF p_nivel_acceso NOT IN ('NIVEL_1_GENERAL', 'NIVEL_2_TECNICO', 'NIVEL_3_RESERVADO_DIRECTIVA') THEN
        RETURN jsonb_build_object('success', false, 'error', 'Nivel de acceso no válido');
    END IF;

    -- Generar token (hex de 24 bytes -> bci_live_ + primeros 16 hex para prefix)
    v_token_plain := 'bci_live_' || encode(digest(
        p_usuario_id || p_nombre_desarrollador || p_correo_institucional || now()::text, 
        'sha256'
    ), 'hex');
    v_token_prefix := substring(v_token_plain from 1 for 15);
    v_token_hash := encode(digest(v_token_plain, 'sha256'), 'hex');

    -- Insertar en la tabla privada
    INSERT INTO knowledge.mae_api_tokens (
        id, token_prefix, token_hash, usuario_id, nombre_desarrollador,
        correo_institucional, gerencia_division, nivel_acceso,
        cuota_diaria_consultas, consultas_hoy,
        fecha_emision, fecha_expiracion, estado, ultimo_acceso,
        ip_ultimo_acceso, emitido_por, metadata_json, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), v_token_prefix, v_token_hash, p_usuario_id, p_nombre_desarrollador,
        p_correo_institucional, p_gerencia_division, p_nivel_acceso,
        p_cuota_diaria, 0,
        NOW(), NOW() + make_interval(days => p_dias_vigencia), 'ACTIVO', NULL,
        NULL, p_emitido_por, '{}'::jsonb, NOW(), NOW()
    )
    RETURNING id INTO v_token_id;

    RETURN jsonb_build_object(
        'success', true,
        'token_id', v_token_id,
        'token_prefix', v_token_prefix,
        'token_plain', v_token_plain, -- se retorna UNA SOLA VEZ, no se guarda en texto plano
        'usuario_id', p_usuario_id,
        'fecha_expiracion', (NOW() + make_interval(days => p_dias_vigencia))::timestamptz
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Sección 2: Wrapper RPC público para cambiar estado de un token
CREATE OR REPLACE FUNCTION public.fn_actualizar_estado_token_bci(
    p_token_id UUID,
    p_nuevo_estado VARCHAR(30),
    p_motivo TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
    v_rows INT;
BEGIN
    IF p_nuevo_estado NOT IN ('ACTIVO', 'SUSPENDIDO', 'REVOCADO') THEN
        RETURN jsonb_build_object('success', false, 'error', 'Estado no válido');
    END IF;

    UPDATE knowledge.mae_api_tokens
    SET estado = p_nuevo_estado,
        motivo_revocacion = p_motivo,
        updated_at = NOW()
    WHERE id = p_token_id;

    GET DIAGNOSTICS v_rows = ROW_COUNT;

    IF v_rows = 0 THEN
        RETURN jsonb_build_object('success', false, 'error', 'Token no encontrado');
    END IF;

    RETURN jsonb_build_object('success', true, 'token_id', p_token_id, 'nuevo_estado', p_nuevo_estado);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Sección 3: wrapper para acceder a la auditoría desde APIs (la vista ya existe
-- pero sin filtro de límite; creamos una selección paginable por seguridad)
CREATE OR REPLACE FUNCTION public.fn_listar_auditoria_bci(
    p_limit INT DEFAULT 100
)
RETURNS SETOF public.v_knowledge_auditoria_reciente AS $$
BEGIN
    RETURN QUERY SELECT * FROM public.v_knowledge_auditoria_reciente LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Triggers INSTEAD OF para la vista pública (permite que el frontend emita desde
-- el endpoint REST normal si se prefiere el patrón directo en vez de rpc)
CREATE OR REPLACE FUNCTION public.ins_v_knowledge_tokens_activos()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO knowledge.mae_api_tokens (
        id, token_prefix, token_hash, usuario_id, nombre_desarrollador,
        correo_institucional, gerencia_division, nivel_acceso,
        cuota_diaria_consultas, consultas_hoy,
        fecha_emision, fecha_expiracion, estado, ultimo_acceso,
        ip_ultimo_acceso, emitido_por, metadata_json, created_at, updated_at
    ) VALUES (
        COALESCE(NEW.id, gen_random_uuid()),
        NEW.token_prefix,
        COALESCE(NEW.token_hash, encode(digest(COALESCE(NEW.token_prefix, 'tmp') || '-' || NEW.usuario_id, 'sha256'), 'hex')),
        NEW.usuario_id, NEW.nombre_desarrollador,
        NEW.correo_institucional, NEW.gerencia_division, NEW.nivel_acceso,
        COALESCE(NEW.cuota_diaria_consultas, 500), COALESCE(NEW.consultas_hoy, 0),
        COALESCE(NEW.fecha_emision, NOW()), COALESCE(NEW.fecha_expiracion, NOW() + INTERVAL '90 days'),
        COALESCE(NEW.estado, 'ACTIVO'), NEW.ultimo_acceso,
        NEW.ip_ultimo_acceso, NEW.emitido_por, '{}'::jsonb, NOW(), NOW()
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_ins_v_knowledge_tokens_activos ON public.v_knowledge_tokens_activos;
CREATE TRIGGER trg_ins_v_knowledge_tokens_activos
    INSTEAD OF INSERT ON public.v_knowledge_tokens_activos
    FOR EACH ROW EXECUTE FUNCTION public.ins_v_knowledge_tokens_activos();

CREATE OR REPLACE FUNCTION public.upd_v_knowledge_tokens_activos()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE knowledge.mae_api_tokens SET
        usuario_id = NEW.usuario_id,
        nombre_desarrollador = NEW.nombre_desarrollador,
        correo_institucional = NEW.correo_institucional,
        gerencia_division = NEW.gerencia_division,
        nivel_acceso = NEW.nivel_acceso,
        cuota_diaria_consultas = NEW.cuota_diaria_consultas,
        consultas_hoy = NEW.consultas_hoy,
        fecha_emision = NEW.fecha_emision,
        fecha_expiracion = NEW.fecha_expiracion,
        estado = NEW.estado,
        motivo_revocacion = NEW.motivo_revocacion,
        ultimo_acceso = NEW.ultimo_acceso,
        emitido_por = NEW.emitido_por,
        updated_at = NOW()
    WHERE id = OLD.id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_upd_v_knowledge_tokens_activos ON public.v_knowledge_tokens_activos;
CREATE TRIGGER trg_upd_v_knowledge_tokens_activos
    INSTEAD OF UPDATE ON public.v_knowledge_tokens_activos
    FOR EACH ROW EXECUTE FUNCTION public.upd_v_knowledge_tokens_activos();

GRANT SELECT, INSERT, UPDATE ON public.v_knowledge_tokens_activos TO anon, authenticated;
GRANT SELECT ON public.v_knowledge_auditoria_reciente TO anon, authenticated;
