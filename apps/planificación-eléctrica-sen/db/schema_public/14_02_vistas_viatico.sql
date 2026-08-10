-- =====================================================
-- VISTA DE RESUMEN DE VIÁTICOS (PARTIDA 405)
-- Fecha: 2026-03-08
-- =====================================================

-- Vista de resumen de viáticos
CREATE OR REPLACE VIEW v_resumen_viatico AS
SELECT 
    v.id,
    v.concepto,
    v.numero_personas,
    v.dias,
    v.costo_unitario,
    v.costo_total,
    -- Datos de la partida
    pr.codigo AS partida_codigo,
    pr.nombre AS partida_nombre,
    pr.monto_presupuestado AS partida_monto_total,
    -- Porcentaje del total de la partida
    CASE 
        WHEN pr.monto_presupuestado > 0 
        THEN ROUND((v.costo_total / pr.monto_presupuestado) * 100, 2)
        ELSE 0 
    END AS porcentaje_partida,
    -- Datos de la acción
    ae.codigo AS accion_codigo,
    ae.nombre AS accion_nombre,
    -- Datos del POA
    p.codigo_sipes AS poa_codigo,
    p.nombre AS poa_nombre
FROM viatico v
LEFT JOIN partida_presupuestaria pr ON pr.id = v.partida_presupuestaria_id
LEFT JOIN accion_especifica ae ON ae.id = pr.accion_especifica_id
LEFT JOIN poa p ON p.id = ae.poa_id
WHERE v.activo = TRUE;

-- Vista de detalle de viáticos por acción
CREATE OR REPLACE VIEW v_detalle_viaticos_accion AS
SELECT 
    ae.id AS accion_id,
    ae.codigo AS accion_codigo,
    ae.nombre AS accion_nombre,
    -- Totales de viáticos por acción
    COUNT(DISTINCT v.id) AS total_viaticos,
    COALESCE(SUM(v.numero_personas), 0) AS total_personas,
    COALESCE(SUM(v.dias), 0) AS total_dias,
    COALESCE(SUM(v.costo_total), 0) AS total_viaticos_bs,
    -- Datos del POA
    p.codigo_sipes AS poa_codigo,
    p.nombre AS poa_nombre
FROM accion_especifica ae
LEFT JOIN partida_presupuestaria pr ON pr.accion_especifica_id = ae.id
LEFT JOIN viatico v ON v.partida_presupuestaria_id = pr.id
LEFT JOIN poa p ON p.id = ae.poa_id
WHERE ae.activo = TRUE
AND pr.codigo = '405'
GROUP BY ae.id, p.codigo_sipes, p.nombre;

-- =====================================================
-- VERIFICACIÓN DE VISTAS CREADAS
-- =====================================================
SELECT 
    viewname
FROM pg_views 
WHERE schemaname = 'public' 
AND viewname LIKE '%viatico%'
ORDER BY viewname;
