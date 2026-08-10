-- =====================================================
-- FASE 23: DATOS DE EJEMPLO PARA ESCENARIOS DE VIÁTICOS
-- Escenarios: Reintegro, Reembolso, Normal, Excepcional
-- Fecha: 2026-03-08
-- =====================================================

DO $$
DECLARE
    v_viatico_id UUID;
    v_responsable1_id UUID;
    v_responsable2_id UUID;
    v_responsable3_id UUID;
    v_responsable4_id UUID;
    v_asignacion1_id UUID;
    v_asignacion2_id UUID;
    v_asignacion3_id UUID;
    v_asignacion4_id UUID;
BEGIN
    -- Obtener IDs existentes
    SELECT id INTO v_viatico_id FROM viatico WHERE activo = TRUE LIMIT 1;
    
    -- Crear responsables adicionales si no existen
    SELECT id INTO v_responsable1_id FROM responsable WHERE cedula = '12345678' AND activo = TRUE;
    SELECT id INTO v_responsable2_id FROM responsable WHERE cedula = '87654321' AND activo = TRUE;
    SELECT id INTO v_responsable3_id FROM responsable WHERE cedula = '11223344' AND activo = TRUE;
    SELECT id INTO v_responsable4_id FROM responsable WHERE cedula = '55667788' AND activo = TRUE;
    
    IF v_responsable2_id IS NULL THEN
        INSERT INTO responsable (cedula, numero_personal, nombres, apellidos)
        VALUES ('87654321', 'PER-002', 'María Elena', 'Rodríguez López')
        RETURNING id INTO v_responsable2_id;
    END IF;
    
    IF v_responsable3_id IS NULL THEN
        INSERT INTO responsable (cedula, numero_personal, nombres, apellidos)
        VALUES ('11223344', 'PER-003', 'Carlos Alberto', 'Mendoza García')
        RETURNING id INTO v_responsable3_id;
    END IF;
    
    IF v_responsable4_id IS NULL THEN
        INSERT INTO responsable (cedula, numero_personal, nombres, apellidos)
        VALUES ('55667788', 'PER-004', 'Ana Patricia', 'Fernández Ruiz')
        RETURNING id INTO v_responsable4_id;
    END IF;
    
    -- =====================================================
    -- ESCENARIO 1: REINTEGRO (Sobrante sin comprobantes)
    -- =====================================================
    INSERT INTO asignacion_viatico (viatico_id, responsable_id, monto_asignado, destino, fecha_salida, fecha_retorno, estado, observaciones)
    VALUES (v_viatico_id, v_responsable2_id, 250000, 'Estado Lara - Barquisimeto', '2027-03-01', '2027-03-10', 'REINTEGRADO', 'Viaje de capacitación - sobrante sin comprobantes')
    RETURNING id INTO v_asignacion1_id;
    
    INSERT INTO cierre_viatico (
        asignacion_viatico_id, tipo_cierre, monto_asignado, monto_gastado, monto_reintegro,
        fecha_cierre, fecha_reintegro,
        aprobado_por_gerente, fecha_aprobacion_gerente, justificacion_gerente,
        comprobante_reintegro, motivo_cierre, observaciones
    ) VALUES (
        v_asignacion1_id, 'REINTEGRO', 250000, 200000, 50000,
        '2027-03-15', '2027-03-15',
        'Gerente de Planificación', '2027-03-12 10:00:00', 'Trabajador no utilizó la totalidad del viático y no posee soportes para el sobrante',
        'REC-2027-001', 'Reintegro de sobrante por falta de comprobantes', 'Trabajador reintegró Bs. 50,000 a caja'
    );
    
    -- =====================================================
    -- ESCENARIO 2: REEMBOLSO (Sobregasto por inflación)
    -- =====================================================
    INSERT INTO asignacion_viatico (viatico_id, responsable_id, monto_asignado, destino, fecha_salida, fecha_retorno, estado, observaciones)
    VALUES (v_viatico_id, v_responsable3_id, 300000, 'Estado Zulia - Maracaibo', '2027-04-01', '2027-04-15', 'REEMBOLSADO', 'Viaje de relevamiento - sobregasto por incremento de precios')
    RETURNING id INTO v_asignacion2_id;
    
    INSERT INTO cierre_viatico (
        asignacion_viatico_id, tipo_cierre, monto_asignado, monto_gastado, monto_reembolso,
        fecha_cierre, fecha_reembolso,
        aprobado_por_gerente, fecha_aprobacion_gerente, justificacion_gerente,
        comprobante_reembolso, origen_fondos, motivo_cierre, observaciones
    ) VALUES (
        v_asignacion2_id, 'REEMBOLSO', 300000, 380000, 80000,
        '2027-04-20', '2027-04-22',
        'Gerente de Planificación', '2027-04-18 14:00:00', 'Incremento de precios durante el viaje causó sobregasto de Bs. 80,000',
        'REM-2027-001', 'PRESUPUESTO GERENCIA', 'Reembolso por sobregasto inflacionario', 'Se reembolsa diferencia al trabajador'
    );
    
    -- =====================================================
    -- ESCENARIO 3: RENDICION NORMAL (Con comprobantes)
    -- =====================================================
    INSERT INTO asignacion_viatico (viatico_id, responsable_id, monto_asignado, destino, fecha_salida, fecha_retorno, estado, observaciones)
    VALUES (v_viatico_id, v_responsable4_id, 200000, 'Estado Aragua - Maracay', '2027-05-01', '2027-05-05', 'COMPLETADO', 'Viaje de supervisión - rendición completa')
    RETURNING id INTO v_asignacion3_id;
    
    INSERT INTO cierre_viatico (
        asignacion_viatico_id, tipo_cierre, monto_asignado, monto_gastado,
        fecha_cierre,
        aprobado_por_gerente, fecha_aprobacion_gerente, justificacion_gerente,
        motivo_cierre, observaciones
    ) VALUES (
        v_asignacion3_id, 'RENDICION_NORMAL', 200000, 195000,
        '2027-05-10',
        'Gerente de Planificación', '2027-05-08 09:00:00', 'Rendición completa con todos los comprobantes',
        'Cierre normal con rendición completa', 'Trabajador entregó todos los comprobantes'
    );
    
    -- =====================================================
    -- ESCENARIO 4: ASIGNACION EXCEPCIONAL (Sin rendición)
    -- =====================================================
    INSERT INTO asignacion_viatico (viatico_id, responsable_id, monto_asignado, destino, fecha_salida, fecha_retorno, estado, observaciones)
    VALUES (v_viatico_id, v_responsable1_id, 500000, 'Estado Miranda - Caracas', '2027-06-01', '2027-06-30', 'EXCEPCIONAL', 'Misión especial sin rendición de cuentas')
    RETURNING id INTO v_asignacion4_id;
    
    INSERT INTO cierre_viatico (
        asignacion_viatico_id, tipo_cierre, monto_asignado,
        fecha_cierre,
        aprobado_por_gerente, fecha_aprobacion_gerente, justificacion_gerente,
        aprobado_por_director, fecha_aprobacion_director, justificacion_director,
        origen_fondos, motivo_cierre, observaciones,
        es_excepcional, requiere_revision_periodica, proxima_revision, estado_revision
    ) VALUES (
        v_asignacion4_id, 'EXCEPCIONAL', 500000,
        '2027-06-01',
        'Gerente de Planificación', '2027-05-28 11:00:00', 'Misión especial que requiere discreción',
        'Director General', '2027-05-29 09:00:00', 'Misión confidencial de alto nivel - no requiere rendición',
        'FONDOS RESERVA', 'Asignación excepcional sin rendición de cuentas', 'Misión especial con aprobación de alta dirección',
        TRUE, TRUE, '2027-07-01', 'PENDIENTE'
    );
    
    RAISE NOTICE 'Datos de ejemplo insertados correctamente';
END $$;

-- =====================================================
-- VERIFICACIÓN DE DATOS INSERTADOS
-- =====================================================
SELECT 'ASIGNACIONES' AS tabla, COUNT(*) AS total FROM asignacion_viatico WHERE activo = TRUE
UNION ALL
SELECT 'CIERRES', COUNT(*) FROM cierre_viatico WHERE activo = TRUE;
