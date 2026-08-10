-- =====================================================
-- FASE 26: TRIGGER DE VALIDACIÓN DE COMPROBANTES
-- Corrección Hallazgo #3 de Auditoría
-- Fecha: 2026-03-08
-- =====================================================

-- Función para validar comprobantes antes de cerrar
CREATE OR REPLACE FUNCTION fn_validar_comprobantes_cierre()
RETURNS TRIGGER AS $$
DECLARE
    v_total_comprobantes DECIMAL(15,2);
    v_comprobantes_pendientes INTEGER;
    v_total_comprobantes_count INTEGER;
BEGIN
    -- Solo validar para cierres normales y reintegro
    IF NEW.tipo_cierre IN ('RENDICION_NORMAL', 'REINTEGRO') THEN
        -- Obtener total de comprobantes validados
        SELECT COALESCE(SUM(monto_comprobante), 0), COUNT(*)
        INTO v_total_comprobantes, v_total_comprobantes_count
        FROM comprobante_viatico
        WHERE asignacion_viatico_id = NEW.asignacion_viatico_id
        AND activo = TRUE
        AND estado = 'VALIDADO';
        
        -- Verificar que haya al menos un comprobante validado
        IF v_total_comprobantes_count = 0 THEN
            RAISE EXCEPTION ' No hay comprobantes validados para esta asignación. '
                'Se requiere al menos un comprobante validado para cerrar.';
        END IF;
        
        -- Verificar que el monto gastado coincida con comprobantes validados
        IF NEW.monto_gastado != v_total_comprobantes THEN
            RAISE EXCEPTION ' INCONSISTENCIA EN MONTOS: El monto gastado (Bs. %) '
                'no coincide con la suma de comprobantes validados (Bs. %)',
                NEW.monto_gastado, v_total_comprobantes;
        END IF;
        
        -- Verificar que no haya comprobantes pendientes
        SELECT COUNT(*) INTO v_comprobantes_pendientes
        FROM comprobante_viatico
        WHERE asignacion_viatico_id = NEW.asignacion_viatico_id
        AND activo = TRUE
        AND estado = 'PENDIENTE';
        
        IF v_comprobantes_pendientes > 0 THEN
            RAISE EXCEPTION ' COMPROBANTES PENDIENTES: Existen % comprobantes pendientes de validación. '
                'Todos los comprobantes deben estar validados antes de cerrar.',
                v_comprobantes_pendientes;
        END IF;
        
        -- Para reintegro, validar que monto_gastado < monto_asignado
        IF NEW.tipo_cierre = 'REINTEGRO' THEN
            IF NEW.monto_gastado >= NEW.monto_asignado THEN
                RAISE EXCEPTION ' Para tipo REINTEGRO, el monto gastado (Bs. %) '
                    'debe ser menor al monto asignado (Bs. %)',
                    NEW.monto_gastado, NEW.monto_asignado;
            END IF;
        END IF;
        
        -- Para reembolso, validar que monto_gastado > monto_asignado
    ELSIF NEW.tipo_cierre = 'REEMBOLSO' THEN
        IF NEW.monto_gastado <= NEW.monto_asignado THEN
            RAISE EXCEPTION ' Para tipo REEMBOLSO, el monto gastado (Bs. %) '
                'debe ser mayor al monto asignado (Bs. %)',
                NEW.monto_gastado, NEW.monto_asignado;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para validar comprobantes antes de cerrar
CREATE TRIGGER trg_validar_comprobantes_cierre
    BEFORE INSERT OR UPDATE ON cierre_viatico
    FOR EACH ROW
    EXECUTE FUNCTION fn_validar_comprobantes_cierre();

-- =====================================================
-- VERIFICACIÓN DE TRIGGER CREADO
-- =====================================================
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers
WHERE trigger_name = 'trg_validar_comprobantes_cierre';
