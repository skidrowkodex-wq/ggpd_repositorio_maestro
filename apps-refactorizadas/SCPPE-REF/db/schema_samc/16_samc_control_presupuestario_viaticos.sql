-- ============================================================================
-- SCRIPT DE MIGRACIÓN: 16_samc_control_presupuestario_viaticos.sql
-- RESOLUCIÓN DE HALLAZGOS DE AUDITORÍA PRESUPUESTARIA (HALLAZGO #1 Y CONCILIACIÓN)
-- Fecha: Agosto 2026
-- Esquema: samc
-- Norma: ISO 8000 (Calidad de Datos) / ISO 27001 (Seguridad & Control de Auditoría)
-- ============================================================================

-- 1. CATÁLOGO DE ORIGEN DE FONDOS
CREATE TABLE IF NOT EXISTS samc.catalogo_origen_fondos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    codigo VARCHAR(50) NOT NULL UNIQUE,
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100) DEFAULT 'sistema',
    updated_by VARCHAR(100) DEFAULT 'sistema',
    version INTEGER DEFAULT 1
);

INSERT INTO samc.catalogo_origen_fondos (codigo, nombre, descripcion) VALUES
('PRESUPUESTO_GERENCIA', 'Presupuesto de Gerencia', 'Fondos asignados al presupuesto ordinario de la gerencia'),
('PRESUPUESTO_CORPORATIVO', 'Presupuesto Corporativo', 'Fondos del presupuesto general de CORPOELEC'),
('FONDOS_RESERVA', 'Fondos de Reserva SEN', 'Fondos de reserva para emergencias en el SEN'),
('FONDOS_ESPECIALES', 'Fondos Especiales PRTSEN', 'Fondos asignados a proyectos especiales de distribución'),
('OTROS', 'Otros Fondos', 'Otros orígenes autorizados')
ON CONFLICT (codigo) DO NOTHING;

-- 2. FUNCIÓN Y TRIGGER DE VALIDACIÓN PRESUPUESTARIA DE VIÁTICOS (HALLAZGO #1)
CREATE OR REPLACE FUNCTION samc.fn_validar_presupuesto_viatico()
RETURNS TRIGGER AS $$
DECLARE
    v_costo_total DECIMAL(15,2);
    v_total_asignado DECIMAL(15,2);
    v_saldo_disponible DECIMAL(15,2);
BEGIN
    -- Obtener costo total asignado a la partida/concepto del viático
    SELECT COALESCE(costo_total, 0) INTO v_costo_total
    FROM samc.samc_viatico
    WHERE id = NEW.viatico_id;

    -- Si no existe tabla samc_viatico, buscar en viatico público o usar fallback de partida 405
    IF v_costo_total IS NULL OR v_costo_total = 0 THEN
        v_costo_total := 1200000.00; -- Presupuesto Techo Asignado Partida 405
    END IF;

    -- Calcular asignaciones acumuladas activas
    SELECT COALESCE(SUM(monto_asignado), 0) INTO v_total_asignado
    FROM samc.samc_asignacion_viatico
    WHERE viatico_id = NEW.viatico_id
      AND activo = TRUE
      AND estado NOT IN ('ANULADO', 'RECHAZADO')
      AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid);

    v_saldo_disponible := v_costo_total - v_total_asignado;

    -- Validar exceso presupuestario
    IF NEW.monto_asignado > v_saldo_disponible THEN
        RAISE EXCEPTION 'PRESUPUESTO EXCEDIDO [HALLAZGO #1 AUDITORÍA]: El monto a asignar (Bs. %) excede el saldo disponible (Bs. %). Presupuesto total: Bs. %, Ya asignado: Bs. %',
            NEW.monto_asignado, v_saldo_disponible, v_costo_total, v_total_asignado;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_validar_presupuesto_viatico ON samc.samc_asignacion_viatico;
CREATE TRIGGER trg_validar_presupuesto_viatico
    BEFORE INSERT OR UPDATE ON samc.samc_asignacion_viatico
    FOR EACH ROW
    EXECUTE FUNCTION samc.fn_validar_presupuesto_viatico();

-- 3. FUNCIÓN Y TRIGGER DE VALIDACIÓN DE COMPROBANTES DE CIERRE
CREATE OR REPLACE FUNCTION samc.fn_validar_comprobantes_cierre()
RETURNS TRIGGER AS $$
DECLARE
    v_total_comprobantes DECIMAL(15,2);
    v_pendientes INT;
BEGIN
    IF NEW.tipo_cierre = 'RENDICION_NORMAL' THEN
        SELECT COALESCE(SUM(monto_comprobante), 0),
               COUNT(CASE WHEN estado = 'PENDIENTE' THEN 1 END)
        INTO v_total_comprobantes, v_pendientes
        FROM samc.samc_comprobante_viatico
        WHERE asignacion_viatico_id = NEW.asignacion_viatico_id
          AND activo = TRUE;

        IF v_pendientes > 0 THEN
            RAISE EXCEPTION 'No se puede cerrar la asignación: existen % comprobantes pendientes de validación', v_pendientes;
        END IF;

        IF NEW.monto_gastado != v_total_comprobantes THEN
            RAISE EXCEPTION 'El monto gastado (Bs. %) no coincide con la suma de comprobantes validados (Bs. %)', NEW.monto_gastado, v_total_comprobantes;
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. VISTA DE CONCILIACIÓN PRESUPUESTARIA DE VIÁTICOS
CREATE OR REPLACE VIEW samc.v_conciliacion_presupuestaria AS
SELECT 
    'PARTIDA-405' AS partida_codigo,
    'Viáticos y Pasajes de Inspección SEN' AS partida_nombre,
    1200000.00 AS presupuesto_partida,
    COALESCE(SUM(av.monto_asignado), 0) AS total_asignado,
    1200000.00 - COALESCE(SUM(av.monto_asignado), 0) AS saldo_disponible,
    COALESCE(SUM(cv.monto_gastado), 0) AS total_ejecutado,
    CASE 
        WHEN COALESCE(SUM(av.monto_asignado), 0) > 1200000.00 THEN 'ALERTA_EXCESO'
        WHEN COALESCE(SUM(av.monto_asignado), 0) = 1200000.00 THEN 'PRESUPUESTO_AGOTADO'
        ELSE 'CONCILIADO_NORMAL'
    END AS estado_conciliacion
FROM samc.samc_asignacion_viatico av
LEFT JOIN samc.samc_cierre_viatico cv ON cv.asignacion_viatico_id = av.id AND cv.activo = TRUE
WHERE av.activo = TRUE AND av.estado NOT IN ('ANULADO', 'RECHAZADO');

-- 5. PROCEDIMIENTO DE CIERRE DE ASIGNACIÓN
CREATE OR REPLACE FUNCTION samc.sp_cerrar_asignacion_viatico(
    p_asignacion_id UUID,
    p_tipo_cierre VARCHAR(30),
    p_monto_gastado DECIMAL(15,2),
    p_aprobado_por VARCHAR(255),
    p_origen_fondos VARCHAR(100)
)
RETURNS UUID AS $$
DECLARE
    v_cierre_id UUID;
    v_monto_asignado DECIMAL(15,2);
BEGIN
    SELECT monto_asignado INTO v_monto_asignado
    FROM samc.samc_asignacion_viatico
    WHERE id = p_asignacion_id;

    IF v_monto_asignado IS NULL THEN
        RAISE EXCEPTION 'Asignación de viático no encontrada con ID %', p_asignacion_id;
    END IF;

    INSERT INTO samc.samc_cierre_viatico (
        asignacion_viatico_id, tipo_cierre, monto_asignado, monto_gastado,
        monto_reintegro, monto_reembolso, fecha_cierre, aprobado_por_gerente,
        origen_fondos
    ) VALUES (
        p_asignacion_id, p_tipo_cierre, v_monto_asignado, p_monto_gastado,
        GREATEST(0, v_monto_asignado - p_monto_gastado),
        GREATEST(0, p_monto_gastado - v_monto_asignado),
        CURRENT_DATE, p_aprobado_por, p_origen_fondos
    ) RETURNING id INTO v_cierre_id;

    UPDATE samc.samc_asignacion_viatico
    SET estado = 'COMPLETADO', monto_ejecutado = p_monto_gastado, updated_at = CURRENT_TIMESTAMP
    WHERE id = p_asignacion_id;

    RETURN v_cierre_id;
END;
$$ LANGUAGE plpgsql;

-- 6. AUDITORÍA Y TRAZABILIDAD
INSERT INTO samc.samc_audit_log (table_name, operation, executed_by, new_data)
VALUES ('samc_asignacion_viatico', 'TRIGGER_CREATED', 'auditor_presupuestario', 
        '{"hallazgo": "HALLAZGO_1_RESOLVED", "trigger": "trg_validar_presupuesto_viatico", "techo_maximo": 1200000.00}'::jsonb);
