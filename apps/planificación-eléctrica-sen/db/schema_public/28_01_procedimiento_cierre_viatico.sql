-- =====================================================
-- FASE 28: PROCEDIMIENTO DE CIERRE CON VALIDACIÓN
-- Corrección Hallazgo #3 de Auditoría
-- Fecha: 2026-03-08
-- =====================================================

-- Procedimiento para cerrar asignación con validación completa
CREATE OR REPLACE FUNCTION sp_cerrar_asignacion_viatico(
    p_asignacion_id UUID,
    p_tipo_cierre VARCHAR(30),
    p_monto_gastado DECIMAL(15,2),
    p_aprobado_por_gerente VARCHAR(255),
    p_justificacion_gerente TEXT,
    p_motivo_cierre TEXT,
    p_comprobante_reintegro VARCHAR(100) DEFAULT NULL,
    p_comprobante_reembolso VARCHAR(100) DEFAULT NULL,
    p_origen_fondos VARCHAR(100) DEFAULT NULL,
    p_aprobado_por_director VARCHAR(255) DEFAULT NULL,
    p_justificacion_director TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    v_asignacion RECORD;
    v_cierre_id UUID;
    v_monto_reintegro DECIMAL(15,2) := 0;
    v_monto_reembolso DECIMAL(15,2) := 0;
    v_total_comprobantes DECIMAL(15,2);
    v_comprobantes_pendientes INTEGER;
BEGIN
    -- Obtener datos de la asignación
    SELECT * INTO v_asignacion
    FROM asignacion_viatico
    WHERE id = p_asignacion_id
    AND activo = TRUE;
    
    -- Validar que la asignación exista y esté en estado válido
    IF v_asignacion IS NULL THEN
        RAISE EXCEPTION 'ASIGNACIÓN NO ENCONTRADA: La asignación % no existe o está inactiva', p_asignacion_id;
    END IF;
    
    IF v_asignacion.estado NOT IN ('APROBADO', 'EN_VIAJE') THEN
        RAISE EXCEPTION 'ESTADO INVÁLIDO: La asignación está en estado % y no puede cerrarse. '
            'Estados válidos: APROBADO, EN_VIAJE', v_asignacion.estado;
    END IF;
    
    -- Validar monto gastado
    IF p_monto_gastado <= 0 THEN
        RAISE EXCEPTION 'MONTO INVÁLIDO: El monto gastado debe ser mayor a cero';
    END IF;
    
    -- Validar comprobantes para cierres normales y reintegro
    IF p_tipo_cierre IN ('RENDICION_NORMAL', 'REINTEGRO') THEN
        -- Obtener total de comprobantes validados
        SELECT COALESCE(SUM(monto_comprobante), 0), COUNT(*)
        INTO v_total_comprobantes, v_comprobantes_pendientes
        FROM comprobante_viatico
        WHERE asignacion_viatico_id = p_asignacion_id
        AND activo = TRUE
        AND estado = 'VALIDADO';
        
        -- Verificar que haya comprobantes
        IF v_total_comprobantes = 0 THEN
            RAISE EXCEPTION 'SIN COMPROBANTES: No hay comprobantes validados para esta asignación';
        END IF;
        
        -- Verificar conciliación de montos
        IF p_monto_gastado != v_total_comprobantes THEN
            RAISE EXCEPTION 'INCONSISTENCIA: El monto gastado (Bs. %) no coincide con comprobantes validados (Bs. %)',
                p_monto_gastado, v_total_comprobantes;
        END IF;
        
        -- Verificar comprobantes pendientes
        SELECT COUNT(*) INTO v_comprobantes_pendientes
        FROM comprobante_viatico
        WHERE asignacion_viatico_id = p_asignacion_id
        AND activo = TRUE
        AND estado = 'PENDIENTE';
        
        IF v_comprobantes_pendientes > 0 THEN
            RAISE EXCEPTION 'COMPROBANTES PENDIENTES: Existen % comprobantes pendientes de validación',
                v_comprobantes_pendientes;
        END IF;
    END IF;
    
    -- Calcular montos según tipo de cierre
    CASE p_tipo_cierre
        WHEN 'RENDICION_NORMAL' THEN
            IF p_monto_gastado > v_asignacion.monto_asignado THEN
                RAISE EXCEPTION 'RENDICION NORMAL: El monto gastado (Bs. %) no puede exceder el asignado (Bs. %)',
                    p_monto_gastado, v_asignacion.monto_asignado;
            END IF;
            v_monto_reintegro := v_asignacion.monto_asignado - p_monto_gastado;
            
        WHEN 'REINTEGRO' THEN
            IF p_monto_gastado >= v_asignacion.monto_asignado THEN
                RAISE EXCEPTION 'REINTEGRO: El monto gastado (Bs. %) debe ser menor al asignado (Bs. %)',
                    p_monto_gastado, v_asignacion.monto_asignado;
            END IF;
            v_monto_reintegro := v_asignacion.monto_asignado - p_monto_gastado;
            
        WHEN 'REEMBOLSO' THEN
            IF p_monto_gastado <= v_asignacion.monto_asignado THEN
                RAISE EXCEPTION 'REEMBOLSO: El monto gastado (Bs. %) debe ser mayor al asignado (Bs. %)',
                    p_monto_gastado, v_asignacion.monto_asignado;
            END IF;
            v_monto_reembolso := p_monto_gastado - v_asignacion.monto_asignado;
            
        WHEN 'EXCEPCIONAL' THEN
            IF p_aprobado_por_director IS NULL THEN
                RAISE EXCEPTION 'EXCEPCIONAL: Se requiere aprobación del Director';
            END IF;
            IF p_justificacion_director IS NULL THEN
                RAISE EXCEPTION 'EXCEPCIONAL: Se requiere justificación del Director';
            END IF;
            
        ELSE
            RAISE EXCEPTION 'TIPO INVÁLIDO: El tipo de cierre % no es válido', p_tipo_cierre;
    END CASE;
    
    -- Insertar cierre
    INSERT INTO cierre_viatico (
        asignacion_viatico_id, tipo_cierre, monto_asignado, monto_gastado,
        monto_reintegro, monto_reembolso, fecha_cierre,
        aprobado_por_gerente, fecha_aprobacion_gerente, justificacion_gerente,
        aprobado_por_director, fecha_aprobacion_director, justificacion_director,
        origen_fondos, comprobante_reintegro, comprobante_reembolso,
        motivo_cierre, es_excepcional, requiere_revision_periodica
    ) VALUES (
        p_asignacion_id, p_tipo_cierre, v_asignacion.monto_asignado, p_monto_gastado,
        v_monto_reintegro, v_monto_reembolso, CURRENT_DATE,
        p_aprobado_por_gerente, CURRENT_TIMESTAMP, p_justificacion_gerente,
        p_aprobado_por_director, 
        CASE WHEN p_aprobado_por_director IS NOT NULL THEN CURRENT_TIMESTAMP END,
        p_justificacion_director,
        p_origen_fondos, p_comprobante_reintegro, p_comprobante_reembolso,
        p_motivo_cierre,
        CASE WHEN p_tipo_cierre = 'EXCEPCIONAL' THEN TRUE ELSE FALSE END,
        CASE WHEN p_tipo_cierre = 'EXCEPCIONAL' THEN TRUE ELSE FALSE END
    ) RETURNING id INTO v_cierre_id;
    
    -- Actualizar estado de la asignación
    UPDATE asignacion_viatico
    SET estado = CASE 
        WHEN p_tipo_cierre = 'REINTEGRO' THEN 'REINTEGRADO'
        WHEN p_tipo_cierre = 'REEMBOLSO' THEN 'REEMBOLSADO'
        WHEN p_tipo_cierre = 'EXCEPCIONAL' THEN 'EXCEPCIONAL'
        ELSE 'COMPLETADO'
    END,
    monto_ejecutado = p_monto_gastado
    WHERE id = p_asignacion_id;
    
    RAISE NOTICE 'CIERRE REGISTRADO EXITOSAMENTE: ID %, Tipo: %, Monto gastado: Bs. %',
        v_cierre_id, p_tipo_cierre, p_monto_gastado;
    
    RETURN v_cierre_id;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- VERIFICACIÓN DE PROCEDIMIENTO CREADO
-- =====================================================
SELECT 
    routine_name,
    routine_type,
    data_type
FROM information_schema.routines
WHERE routine_name = 'sp_cerrar_asignacion_viatico';
