-- ============================================================================
-- FASE 30: CORRECCIONES DE AUDITORÍA - FLUJO DE PRESUPUESTO
-- Fecha: 2026-03-09
-- Descripción: Corrección de inconsistencias identificadas en auditoría
-- ============================================================================

-- ============================================================================
-- 1. CORREGIR MONTOS DE ITEMS DE VIÁTICOS
-- ============================================================================
-- Los montos en item_presupuestario no coinciden con la tabla viatico

-- Primero, obtener los montos correctos de la tabla viatico
DO $$
DECLARE
    v_partida_405 UUID;
    v_monto_relevamiento DECIMAL(18,2);
    v_monto_talleres DECIMAL(18,2);
    v_monto_acompanamiento DECIMAL(18,2);
BEGIN
    -- Obtener ID de partida 405
    SELECT id INTO v_partida_405 FROM partida_presupuestaria WHERE codigo = '405' LIMIT 1;
    
    -- Obtener montos de viatico
    SELECT costo_total INTO v_monto_relevamiento 
    FROM viatico WHERE concepto LIKE '%Relevamiento%' LIMIT 1;
    
    SELECT costo_total INTO v_monto_talleres 
    FROM viatico WHERE concepto LIKE '%Talleres%' LIMIT 1;
    
    SELECT costo_total INTO v_monto_acompanamiento 
    FROM viatico WHERE concepto LIKE '%Acompañamiento%' LIMIT 1;
    
    -- Actualizar items de viáticos
    UPDATE item_presupuestario 
    SET costo_unitario = v_monto_relevamiento / (numero_personas * numero_dias),
        costo_total = v_monto_relevamiento,
        updated_at = NOW()
    WHERE codigo = '405-VIA-01' AND partida_presupuestaria_id = v_partida_405;
    
    UPDATE item_presupuestario 
    SET costo_unitario = v_monto_talleres / (numero_personas * numero_dias),
        costo_total = v_monto_talleres,
        updated_at = NOW()
    WHERE codigo = '405-VIA-02' AND partida_presupuestaria_id = v_partida_405;
    
    UPDATE item_presupuestario 
    SET costo_unitario = v_monto_acompanamiento / (numero_personas * numero_dias),
        costo_total = v_monto_acompanamiento,
        updated_at = NOW()
    WHERE codigo = '405-VIA-03' AND partida_presupuestaria_id = v_partida_405;
    
    RAISE NOTICE 'Viáticos corregidos: %, %, %', v_monto_relevamiento, v_monto_talleres, v_monto_acompanamiento;
END $$;

-- ============================================================================
-- 2. CORREGIR MONTO DE PARTIDA 403 (EXCLUIR IVA)
-- ============================================================================
-- El IVA no debe incluirse como item, sino calcularse por separado

-- Actualizar monto de partida 403 (sin IVA)
UPDATE partida_presupuestaria 
SET monto_presupuestado = 8500000,
    updated_at = NOW()
WHERE codigo = '403';

-- ============================================================================
-- 3. CORREGIR VISTA DE RESUMEN PARA MOSTRAR EJECUCIÓN REAL
-- ============================================================================

-- Eliminar vista existente
DROP VIEW IF EXISTS v_resumen_partida;

-- Recrear vista con ejecución real
CREATE OR REPLACE VIEW v_resumen_partida AS
SELECT 
    pp.id AS partida_id,
    pp.codigo AS partida_codigo,
    pp.nombre AS partida_nombre,
    COUNT(DISTINCT ip.id) AS total_items,
    COUNT(DISTINCT CASE WHEN ip.estado = 'COMPLETADO' THEN ip.id END) AS items_completados,
    COUNT(DISTINCT CASE WHEN ip.estado = 'EN_PROCESO' THEN ip.id END) AS items_en_proceso,
    COUNT(DISTINCT CASE WHEN ip.estado = 'PENDIENTE' THEN ip.id END) AS items_pendientes,
    COALESCE(SUM(ip.costo_total), 0) AS costo_total_planificado,
    COALESCE((
        SELECT SUM(ei.costo_ejecutado)
        FROM ejecucion_item ei
        JOIN item_presupuestario ip2 ON ei.item_presupuestario_id = ip2.id
        WHERE ip2.partida_presupuestaria_id = pp.id
          AND ei.activo = TRUE AND ip2.activo = TRUE
    ), 0) AS costo_total_ejecutado,
    COALESCE(SUM(ip.costo_total), 0) - COALESCE((
        SELECT SUM(ei.costo_ejecutado)
        FROM ejecucion_item ei
        JOIN item_presupuestario ip2 ON ei.item_presupuestario_id = ip2.id
        WHERE ip2.partida_presupuestaria_id = pp.id
          AND ei.activo = TRUE AND ip2.activo = TRUE
    ), 0) AS costo_total_pendiente,
    CASE 
        WHEN SUM(ip.costo_total) > 0 THEN 
            ROUND((COALESCE((
                SELECT SUM(ei.costo_ejecutado)
                FROM ejecucion_item ei
                JOIN item_presupuestario ip2 ON ei.item_presupuestario_id = ip2.id
                WHERE ip2.partida_presupuestaria_id = pp.id
                  AND ei.activo = TRUE AND ip2.activo = TRUE
            ), 0) / SUM(ip.costo_total)) * 100, 2)
        ELSE 0 
    END AS porcentaje_avance,
    pp.monto_presupuestado,
    pp.monto_ejecutado
FROM partida_presupuestaria pp
LEFT JOIN item_presupuestario ip ON pp.id = ip.partida_presupuestaria_id AND ip.activo = TRUE
WHERE pp.activo = TRUE
GROUP BY pp.id, pp.codigo, pp.nombre, pp.monto_presupuestado, pp.monto_ejecutado;

COMMENT ON VIEW v_resumen_partida IS 'Resumen de avance por partida presupuestaria con ejecución real';

-- ============================================================================
-- 4. CORREGIR VISTA DE CONCILIACIÓN
-- ============================================================================

-- Eliminar vista existente
DROP VIEW IF EXISTS v_conciliacion_items;

-- Recrear vista con ejecución real
CREATE OR REPLACE VIEW v_conciliacion_items AS
SELECT 
    pp.codigo AS partida,
    pp.nombre AS nombre_partida,
    ip.codigo AS item,
    ip.nombre AS nombre_item,
    ip.costo_total AS presupuestado,
    COALESCE(ej.ejecutado, 0) AS ejecutado,
    ip.costo_total - COALESCE(ej.ejecutado, 0) AS saldo,
    CASE 
        WHEN ip.costo_total > 0 THEN 
            ROUND((COALESCE(ej.ejecutado, 0) / ip.costo_total) * 100, 2)
        ELSE 0 
    END AS porcentaje_ejecutado,
    CASE 
        WHEN COALESCE(ej.ejecutado, 0) > ip.costo_total THEN 'SOBREGASTO'
        WHEN COALESCE(ej.ejecutado, 0) = ip.costo_total THEN 'EXACTO'
        WHEN COALESCE(ej.ejecutado, 0) > 0 THEN 'PARCIAL'
        ELSE 'SIN EJECUTAR'
    END AS estado_conciliacion
FROM item_presupuestario ip
JOIN partida_presupuestaria pp ON ip.partida_presupuestaria_id = pp.id
LEFT JOIN (
    SELECT 
        item_presupuestario_id,
        SUM(costo_ejecutado) AS ejecutado
    FROM ejecucion_item
    WHERE activo = TRUE
    GROUP BY item_presupuestario_id
) ej ON ip.id = ej.item_presupuestario_id
WHERE ip.activo = TRUE AND pp.activo = TRUE
ORDER BY pp.codigo, ip.codigo;

COMMENT ON VIEW v_conciliacion_items IS 'Conciliación presupuestaria por item con ejecución real';

-- ============================================================================
-- 5. INSERTAR PROGRAMACIÓN MENSUAL (PARTIDA_MENSUAL)
-- ============================================================================

-- Insertar distribución mensual para cada partida
DO $$
DECLARE
    v_partida RECORD;
    v_mes RECORD;
    v_monto_mensual DECIMAL(18,2);
    v_meses ARRAY;
    i INT;
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
        FOR v_mes IN SELECT id, nombre FROM mes ORDER BY id
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
-- 6. SINCRONIZAR MONTO_EJECUTADO EN PARTIDA_PRESUPUESTARIA
-- ============================================================================

-- Actualizar monto_ejecutado basado en ejecuciones reales
UPDATE partida_presupuestaria 
SET monto_ejecutado = (
    SELECT COALESCE(SUM(ei.costo_ejecutado), 0)
    FROM ejecucion_item ei
    JOIN item_presupuestario ip ON ei.item_presupuestario_id = ip.id
    WHERE ip.partida_presupuestaria_id = partida_presupuestaria.id
      AND ei.activo = TRUE AND ip.activo = TRUE
),
updated_at = NOW()
WHERE activo = TRUE;

-- ============================================================================
-- 7. VERIFICACIÓN FINAL
-- ============================================================================

-- Verificar montos corregidos
SELECT 
    'VIÁTICOS CORREGIDOS' AS verificacion,
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
WHERE ip.tipo_item = 'VIATICO' AND ip.activo = TRUE
UNION ALL
SELECT 
    'PARTIDAS vs ITEMS' AS verificacion,
    pp.codigo,
    pp.nombre,
    pp.monto_presupuestado,
    COALESCE(SUM(ip.costo_total), 0),
    CASE 
        WHEN pp.monto_presupuestado = COALESCE(SUM(ip.costo_total), 0) THEN 'OK'
        ELSE 'DIFERENCIA'
    END AS estado
FROM partida_presupuestaria pp
LEFT JOIN item_presupuestario ip ON pp.id = ip.partida_presupuestaria_id AND ip.activo = TRUE
WHERE pp.activo = TRUE
GROUP BY pp.id, pp.codigo, pp.nombre, pp.monto_presupuestado;

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
