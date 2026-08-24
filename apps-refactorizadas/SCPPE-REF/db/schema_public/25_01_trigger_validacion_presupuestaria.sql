-- =====================================================
-- FASE 25: TRIGGER DE VALIDACIÓN PRESUPUESTARIA
-- Corrección Hallazgo #1 de Auditoría
-- Fecha: 2026-03-08
-- =====================================================

-- Función para validar presupuesto antes de insertar asignación
CREATE OR REPLACE FUNCTION fn_validar_presupuesto_viatico()
RETURNS TRIGGER AS $$
DECLARE
    v_costo_total DECIMAL(15,2);
    v_saldo_disponible DECIMAL(15,2);
    v_total_asignado DECIMAL(15,2);
BEGIN
    -- Obtener costo total del viático
    SELECT costo_total INTO v_costo_total
    FROM viatico
    WHERE id = NEW.viatico_id;
    
    -- Calcular total ya asignado (excluyendo anulados y rechazados)
    SELECT COALESCE(SUM(monto_asignado), 0) INTO v_total_asignado
    FROM asignacion_viatico
    WHERE viatico_id = NEW.viatico_id
    AND activo = TRUE
    AND estado NOT IN ('ANULADO', 'RECHAZADO');
    
    -- Calcular saldo disponible
    v_saldo_disponible := v_costo_total - v_total_asignado;
    
    -- Validar que no exceda el presupuesto
    IF NEW.monto_asignado > v_saldo_disponible THEN
        RAISE EXCEPTION ' PRESUPUESTO EXCEDIDO: El monto a asignar (Bs. %) excede el saldo disponible (Bs. %). '
            'Presupuesto total: Bs. %, Ya asignado: Bs. %',
            NEW.monto_asignado, v_saldo_disponible, v_costo_total, v_total_asignado;
    END IF;
    
    -- Registrar saldo disponible en logs (opcional)
    RAISE NOTICE 'Validación presupuestaria: Asignado Bs. %, Saldo disponible Bs. %',
        NEW.monto_asignado, v_saldo_disponible;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para validar presupuesto antes de insertar
CREATE TRIGGER trg_validar_presupuesto_viatico
    BEFORE INSERT ON asignacion_viatico
    FOR EACH ROW
    EXECUTE FUNCTION fn_validar_presupuesto_viatico();

-- =====================================================
-- VERIFICACIÓN DE TRIGGER CREADO
-- =====================================================
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers
WHERE trigger_name = 'trg_validar_presupuesto_viatico';
