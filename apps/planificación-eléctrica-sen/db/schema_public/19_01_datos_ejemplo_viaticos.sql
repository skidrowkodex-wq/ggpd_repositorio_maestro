-- =====================================================
-- FASE 19: DATOS DE EJEMPLO PARA PRUEBAS
-- Estructura Híbrida - Datos de Demostración
-- Fecha: 2026-03-08
-- =====================================================

-- Primero, verificar si existen datos en las tablas dependientes
DO $$
DECLARE
    v_empresa_id UUID;
    v_ente_id UUID;
    v_gerencia_id UUID;
    v_unidad_id UUID;
    v_poa_id UUID;
    v_accion_id UUID;
    v_partida_id UUID;
    v_viatico_id UUID;
    v_responsable_id UUID;
    v_asignacion_id UUID;
BEGIN
    -- Obtener IDs existentes o crear nuevos
    SELECT id INTO v_empresa_id FROM empresa WHERE activo = TRUE LIMIT 1;
    SELECT id INTO v_ente_id FROM ente WHERE activo = TRUE LIMIT 1;
    SELECT id INTO v_gerencia_id FROM gerencia WHERE activo = TRUE LIMIT 1;
    SELECT id INTO v_unidad_id FROM unidad WHERE activo = TRUE LIMIT 1;
    SELECT id INTO v_poa_id FROM poa WHERE activo = TRUE LIMIT 1;
    
    -- Si no existe empresa, crear una
    IF v_empresa_id IS NULL THEN
        INSERT INTO empresa (codigo, nombre, tipo, ambito)
        VALUES ('CORPOELEC', 'CORPOELEC', 'PÚBLICA', 'NACIONALES')
        RETURNING id INTO v_empresa_id;
    END IF;
    
    -- Si no existe ente, crear uno
    IF v_ente_id IS NULL THEN
        INSERT INTO ente (empresa_id, codigo, nombre, tipo)
        VALUES (v_empresa_id, 'CORPOELEC', 'CORPOELEC', 'OPERADOR')
        RETURNING id INTO v_ente_id;
    END IF;
    
    -- Si no existe gerencia, crear una
    IF v_gerencia_id IS NULL THEN
        INSERT INTO gerencia (ente_id, codigo, nombre, ambito, proceso_medular)
        VALUES (v_ente_id, 'GER-PLAN-DIST', 'Gerencia de Planificación de Distribución', 'GENERAL', 'DISTRIBUCIÓN')
        RETURNING id INTO v_gerencia_id;
    END IF;
    
    -- Si no existe unidad, crear una
    IF v_unidad_id IS NULL THEN
        INSERT INTO unidad (gerencia_id, codigo, nombre)
        VALUES (v_gerencia_id, 'UP-PLAN', 'Unidad de Planificación')
        RETURNING id INTO v_unidad_id;
    END IF;
    
    -- Si no existe POA, crear uno
    IF v_poa_id IS NULL THEN
        INSERT INTO poa (unidad_id, anio, codigo, nombre, descripcion, fecha_inicio, fecha_fin, estado, codigo_sipes)
        VALUES (v_unidad_id, 2027, 'POA-2027-001', 'POA 2027 - Servicios de Innovación', 'Plan operativo para servicios tecnológicos', '2027-01-01', '2027-12-31', 'borrador', 'ACC-2027-MPPEE-PLANIF-001')
        RETURNING id INTO v_poa_id;
    END IF;
    
    -- Crear acción específica si no existe
    SELECT id INTO v_accion_id FROM accion_especifica WHERE poa_id = v_poa_id AND activo = TRUE LIMIT 1;
    IF v_accion_id IS NULL THEN
        INSERT INTO accion_especifica (poa_id, codigo, nombre, unidad_medida, orden, ponderacion, fecha_inicio_accion, fecha_fin_accion, ejecutor, meta)
        VALUES (v_poa_id, 'AE-001', 'Relevamiento de data en estados', 'Servicio', 1, 25, '2027-01-01', '2027-12-31', 'Gerencia de Planificación', 'Relevamiento de información en 24 estados')
        RETURNING id INTO v_accion_id;
    END IF;
    
    -- Crear partida presupuestaria 405 si no existe
    SELECT id INTO v_partida_id FROM partida_presupuestaria WHERE accion_especifica_id = v_accion_id AND codigo = '405' AND activo = TRUE LIMIT 1;
    IF v_partida_id IS NULL THEN
        INSERT INTO partida_presupuestaria (accion_especifica_id, codigo, nombre, descripcion, monto_presupuestado, cantidad, unidad_medida, costo_unitario, justificacion)
        VALUES (v_accion_id, '405', 'Transferencias y Viáticos', 'Viáticos, pasajes y alimentación para equipo técnico', 2800000, 1, 'Servicio', 2800000, 'Relevamiento de data en 24 estados para el proyecto de innovación')
        RETURNING id INTO v_partida_id;
    END IF;
    
    -- Crear viático si no existe
    SELECT id INTO v_viatico_id FROM viatico WHERE partida_presupuestaria_id = v_partida_id AND activo = TRUE LIMIT 1;
    IF v_viatico_id IS NULL THEN
        INSERT INTO viatico (partida_presupuestaria_id, concepto, numero_personas, dias, costo_unitario)
        VALUES (v_partida_id, 'Relevamiento de data en 24 estados', 4, 15, 20000)
        RETURNING id INTO v_viatico_id;
    END IF;
    
    -- Crear responsable si no existe
    SELECT id INTO v_responsable_id FROM responsable WHERE activo = TRUE LIMIT 1;
    IF v_responsable_id IS NULL THEN
        INSERT INTO responsable (cedula, numero_personal, nombres, apellidos)
        VALUES ('12345678', 'PER-001', 'Juan Carlos', 'Pérez González')
        RETURNING id INTO v_responsable_id;
    END IF;
    
    -- Crear asignación de viático
    INSERT INTO asignacion_viatico (viatico_id, responsable_id, monto_asignado, destino, fecha_salida, fecha_retorno, estado, observaciones)
    VALUES (v_viatico_id, v_responsable_id, 300000, 'Caracas - Estado Aragua - Estado Miranda', '2027-02-01', '2027-02-15', 'APROBADO', 'Viaje de relevamiento de información')
    RETURNING id INTO v_asignacion_id;
    
    -- Crear comprobantes de ejemplo
    INSERT INTO comprobante_viatico (asignacion_viatico_id, tipo_comprobante, numero_comprobante, fecha_comprobante, descripcion, monto_comprobante, proveedor, rif_proveedor, estado)
    VALUES 
        (v_asignacion_id, 'PASAJE', 'FAC-001-2027', '2027-02-01', 'Pasaje aéreo Caracas-Maracay', 50000, 'Aerolínea Venezuela', 'J-12345678-9', 'VALIDADO'),
        (v_asignacion_id, 'ALOJAMIENTO', 'FAC-002-2027', '2027-02-01', 'Hotel en Maracay - 5 noches', 120000, 'Hotel Maracay', 'J-87654321-0', 'VALIDADO'),
        (v_asignacion_id, 'ALIMENTACION', 'FAC-003-2027', '2027-02-01', 'Alimentación durante el viaje', 80000, 'Restaurantes varios', 'V-12345678', 'PENDIENTE');
    
    -- Crear aprobación de ejemplo
    INSERT INTO aprobacion_viatico (asignacion_viatico_id, solicitado_por, justificacion, aprobado_por, fecha_aprobacion, estado, monto_solicitado, monto_aprobado, observaciones_aprobacion)
    VALUES (v_asignacion_id, 'Juan Carlos Pérez', 'Relevamiento de información para el proyecto de innovación tecnológica en 24 estados', 'Gerente de Planificación', CURRENT_TIMESTAMP, 'APROBADO', 300000, 300000, 'Viaje aprobado por ser prioritario para el proyecto');
    
    RAISE NOTICE 'Datos de ejemplo insertados correctamente';
END $$;

-- =====================================================
-- VERIFICACIÓN DE DATOS INSERTADOS
-- =====================================================
SELECT 'VIÁTICOS' AS tabla, COUNT(*) AS total FROM viatico WHERE activo = TRUE
UNION ALL
SELECT 'ASIGNACIONES', COUNT(*) FROM asignacion_viatico WHERE activo = TRUE
UNION ALL
SELECT 'COMPROBANTES', COUNT(*) FROM comprobante_viatico WHERE activo = TRUE
UNION ALL
SELECT 'APROBACIONES', COUNT(*) FROM aprobacion_viatico WHERE activo = TRUE;
