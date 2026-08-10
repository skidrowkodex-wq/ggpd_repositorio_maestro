-- ============================================================================
-- FASE 30: CORRECCIONES DE AUDITORÍA - VERSIÓN CORREGIDA
-- Fecha: 2026-03-09
-- Descripción: Corrección de inconsistencias identificadas en auditoría
-- ============================================================================

-- ============================================================================
-- 1. CORREGIR MONTOS DE ITEMS DE VIÁTICOS
-- ============================================================================
-- Los montos en item_presupuestario no coinciden con la tabla viatico

DO $$
DECLARE
    v_partida_405 UUID;
    v_relevamiento RECORD;
    v_talleres RECORD;
    v_acompanamiento RECORD;
BEGIN
    -- Obtener ID de partida 405
    SELECT id INTO v_partida_405 FROM partida_presupuestaria WHERE codigo = '405' LIMIT 1;
    
    -- Obtener datos de viatico
    SELECT * INTO v_relevamiento FROM viatico WHERE concepto LIKE '%Relevamiento%' LIMIT 1;
    SELECT * INTO v_talleres FROM viatico WHERE concepto LIKE '%Talleres%' LIMIT 1;
    SELECT * INTO v_acompanamiento FROM viatico WHERE concepto LIKE '%Acompañamiento%' LIMIT 1;
    
    -- Actualizar items de viáticos (solo costo_unitario, costo_total se calcula automáticamente)
    UPDATE item_presupuestario 
    SET costo_unitario = v_relevamiento.costo_unitario,
        updated_at = NOW()
    WHERE codigo = '405-VIA-01' AND partida_presupuestaria_id = v_partida_405;
    
    UPDATE item_presupuestario 
    SET costo_unitario = v_talleres.costo_unitario,
        updated_at = NOW()
    WHERE codigo = '405-VIA-02' AND partida_presupuestaria_id = v_partida_405;
    
    UPDATE item_presupuestario 
    SET costo_unitario = v_acompanamiento.costo_unitario,
        updated_at = NOW()
    WHERE codigo = '405-VIA-03' AND partida_presupuestaria_id = v_partida_405;
    
    RAISE NOTICE 'Viáticos corregidos exitosamente';
END $$;

-- ============================================================================
-- 2. CORREGIR MONTO DE PARTIDA 403 (EXCLUIR IVA)
-- ============================================================================

UPDATE partida_presupuestaria 
SET monto_presupuestado = 8500000,
    updated_at = NOW()
WHERE codigo = '403';

-- ============================================================================
-- 3. INSERTAR PROGRAMACIÓN MENSUAL (PARTIDA_MENSUAL)
-- ============================================================================

DO $$
DECLARE
    v_partida RECORD;
    v_mes RECORD;
    v_monto_mensual DECIMAL(18,2);
BEGIN
    -- Para cada partida activa
    FOR v_partida IN 
        SELECT id, codigo, monto_presupuestado 
        FROM partida_presupuestaria 
        WHERE activo = TRUE
    LOOP
        -- Distribuir en 12 meses
        v_monto_mensual := v_partida.monto_presupuestado / 12;
        
        -- Insertar para cada mes
        FOR v_mes IN SELECT id FROM mes ORDER BY id
        LOOP
            INSERT INTO partida_mensual (
                partida_presupuestaria_id, 
                mes_id, 
                anio, 
                monto_solicitado, 
                monto_asignado, 
                monto_ejecutado
            )
            VALUES (
                v_partida.id,
                v_mes.id,
                2027,
                v_monto_mensual,
                v_monto_mensual,
                0
            )
            ON CONFLICT (partida_presupuestaria_id, mes_id, anio) 
            DO UPDATE SET 
                monto_solicitado = v_monto_mensual,
                monto_asignado = v_monto_mensual,
                updated_at = NOW();
        END LOOP;
        
        RAISE NOTICE 'Partida %: Distribuido % mensual', v_partida.codigo, v_monto_mensual;
    END LOOP;
END $$;

-- ============================================================================
-- 4. VERIFICACIÓN FINAL
-- ============================================================================

-- Verificar montos corregidos
SELECT 
    'VIÁTICOS' AS verificacion,
    ip.codigo,
    ip.nombre,
    ip.costo_total,
    v.costo_total AS monto_viatico,
    CASE 
        WHEN ip.costo_total = v.costo_total THEN 'OK'
        ELSE 'ERROR'
    END AS estado
FROM item_presupuestario ip
JOIN viatico v ON ip.nombre = v.concepto
WHERE ip.tipo_item = 'VIATICO' AND ip.activo = TRUE;

-- Verificar programación mensual
SELECT 
    'PROGRAMACIÓN MENSUAL' AS verificacion,
    COUNT(*) AS registros_insertados
FROM partida_mensual
WHERE anio = 2027;

-- Verificar vistas corregidas
SELECT 
    'VISTA RESUMEN' AS verificacion,
    partida_codigo,
    costo_total_planificado,
    costo_total_ejecutado,
    porcentaje_avance
FROM v_resumen_partida;

-- ============================================================================
-- FIN CORRECCIONES
-- ============================================================================
