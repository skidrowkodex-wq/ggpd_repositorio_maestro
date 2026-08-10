-- =====================================================
-- FASE 27: VISTA DE CONCILIACIÓN PRESUPUESTARIA
-- Corrección Hallazgo #2 de Auditoría
-- Fecha: 2026-03-08
-- =====================================================

-- Vista de conciliación presupuestaria completa
CREATE OR REPLACE VIEW v_conciliacion_presupuestaria AS
SELECT 
    -- Datos de la partida
    pp.codigo AS partida_codigo,
    pp.nombre AS partida_nombre,
    pp.monto_presupuestado AS presupuesto_partida,
    
    -- Datos del viático
    v.id AS viatico_id,
    v.concepto AS viatico_concepto,
    v.costo_total AS presupuesto_viatico,
    v.numero_personas,
    v.dias,
    v.costo_unitario,
    
    -- Cálculo de asignaciones
    (SELECT COALESCE(SUM(av.monto_asignado), 0)
     FROM asignacion_viatico av
     WHERE av.viatico_id = v.id
     AND av.activo = TRUE
     AND av.estado NOT IN ('ANULADO', 'RECHAZADO')
    ) AS total_asignado,
    
    -- Saldo disponible
    v.costo_total - (
        SELECT COALESCE(SUM(av.monto_asignado), 0)
        FROM asignacion_viatico av
        WHERE av.viatico_id = v.id
        AND av.activo = TRUE
        AND av.estado NOT IN ('ANULADO', 'RECHAZADO')
    ) AS saldo_disponible,
    
    -- Porcentaje comprometido
    CASE 
        WHEN v.costo_total > 0 
        THEN ROUND((
            (SELECT COALESCE(SUM(av.monto_asignado), 0)
             FROM asignacion_viatico av
             WHERE av.viatico_id = v.id
             AND av.activo = TRUE
             AND av.estado NOT IN ('ANULADO', 'RECHAZADO')
            ) / v.costo_total
        ) * 100, 2)
        ELSE 0 
    END AS porcentaje_comprometido,
    
    -- Cálculo de cierres
    (SELECT COALESCE(SUM(cv.monto_gastado), 0)
     FROM cierre_viatico cv
     JOIN asignacion_viatico av ON av.id = cv.asignacion_viatico_id
     WHERE av.viatico_id = v.id
     AND cv.activo = TRUE
    ) AS total_gastado,
    
    (SELECT COALESCE(SUM(cv.monto_reintegro), 0)
     FROM cierre_viatico cv
     JOIN asignacion_viatico av ON av.id = cv.asignacion_viatico_id
     WHERE av.viatico_id = v.id
     AND cv.activo = TRUE
    ) AS total_reintegro,
    
    (SELECT COALESCE(SUM(cv.monto_reembolso), 0)
     FROM cierre_viatico cv
     JOIN asignacion_viatico av ON av.id = cv.asignacion_viatico_id
     WHERE av.viatico_id = v.id
     AND cv.activo = TRUE
    ) AS total_reembolso,
    
    -- Estado de conciliación
    CASE 
        WHEN (
            SELECT COALESCE(SUM(av.monto_asignado), 0)
            FROM asignacion_viatico av
            WHERE av.viatico_id = v.id
            AND av.activo = TRUE
            AND av.estado NOT IN ('ANULADO', 'RECHAZADO')
        ) > v.costo_total 
        THEN 'EXCEDIDO'
        WHEN (
            SELECT COALESCE(SUM(av.monto_asignado), 0)
            FROM asignacion_viatico av
            WHERE av.viatico_id = v.id
            AND av.activo = TRUE
            AND av.estado NOT IN ('ANULADO', 'RECHAZADO')
        ) = v.costo_total 
        THEN 'COMPLETO'
        WHEN (
            SELECT COALESCE(SUM(av.monto_asignado), 0)
            FROM asignacion_viatico av
            WHERE av.viatico_id = v.id
            AND av.activo = TRUE
            AND av.estado NOT IN ('ANULADO', 'RECHAZADO')
        ) > 0 
        THEN 'PARCIAL'
        ELSE 'SIN_ASIGNAR'
    END AS estado_conciliacion,
    
    -- Datos de la acción y POA
    ae.codigo AS accion_codigo,
    ae.nombre AS accion_nombre,
    p.codigo_sipes AS poa_codigo,
    p.nombre AS poa_nombre
    
FROM partida_presupuestaria pp
JOIN viatico v ON v.partida_presupuestaria_id = pp.id
JOIN accion_especifica ae ON ae.id = pp.accion_especifica_id
JOIN poa p ON p.id = ae.poa_id
WHERE pp.activo = TRUE
AND v.activo = TRUE;

-- Vista de resumen de conciliación
CREATE OR REPLACE VIEW v_resumen_conciliacion AS
SELECT 
    COUNT(DISTINCT v.id) AS total_viaticos,
    SUM(v.costo_total) AS presupuesto_total_viaticos,
    SUM(v_con.total_asignado) AS total_asignado,
    SUM(v.costo_total) - SUM(v_con.total_asignado) AS saldo_total_disponible,
    CASE 
        WHEN SUM(v.costo_total) > 0 
        THEN ROUND((SUM(v_con.total_asignado) / SUM(v.costo_total)) * 100, 2)
        ELSE 0 
    END AS porcentaje_total_comprometido,
    SUM(v_con.total_gastado) AS total_gastado,
    SUM(v_con.total_reintegro) AS total_reintegro,
    SUM(v_con.total_reembolso) AS total_reembolso,
    -- Conteo por estado
    COUNT(CASE WHEN v_con.estado_conciliacion = 'EXCEDIDO' THEN 1 END) AS viaticos_excedidos,
    COUNT(CASE WHEN v_con.estado_conciliacion = 'COMPLETO' THEN 1 END) AS viaticos_completos,
    COUNT(CASE WHEN v_con.estado_conciliacion = 'PARCIAL' THEN 1 END) AS viaticos_parciales,
    COUNT(CASE WHEN v_con.estado_conciliacion = 'SIN_ASIGNAR' THEN 1 END) AS viaticos_sin_asignar
FROM viatico v
JOIN v_conciliacion_presupuestaria v_con ON v_con.viatico_id = v.id
WHERE v.activo = TRUE;

-- =====================================================
-- VERIFICACIÓN DE VISTAS CREADAS
-- =====================================================
SELECT 
    viewname
FROM pg_views 
WHERE schemaname = 'public' 
AND viewname LIKE '%conciliacion%'
ORDER BY viewname;
