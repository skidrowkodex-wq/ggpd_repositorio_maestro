-- ============================================
-- 03_05_vistas_meta_fisica.sql
-- Vistas para consulta y reportes
-- ============================================

BEGIN;

-- ============================================
-- Vista 1: Meta física del POA (formulario)
-- ============================================
CREATE OR REPLACE VIEW v_meta_fisica_poa AS
SELECT 
    p.id AS poa_id,
    p.codigo AS poa_codigo,
    p.nombre AS poa_nombre,
    p.anio,
    ae.codigo AS accion_codigo,
    ae.orden,
    ae.nombre AS accion_nombre,
    ae.unidad_medida,
    m.numero AS mes_numero,
    m.nombre AS mes_nombre,
    mf.programado,
    mf.ejecutado,
    mf.eficacia
FROM poa p
JOIN accion_especifica ae ON ae.poa_id = p.id
JOIN meta_fisica mf ON mf.accion_especifica_id = ae.id
JOIN mes m ON m.id = mf.mes_id
WHERE p.activo = true 
  AND ae.activo = true 
  AND mf.activo = true
ORDER BY p.codigo, ae.orden, ae.codigo, m.numero;

-- ============================================
-- Vista 2: Resumen de metas por acción
-- ============================================
CREATE OR REPLACE VIEW v_resumen_meta_fisica AS
SELECT 
    ae.id AS accion_id,
    ae.codigo AS accion_codigo,
    ae.nombre AS accion_nombre,
    ae.unidad_medida,
    ae.orden,
    mf.anio,
    SUM(mf.programado) AS total_programado,
    SUM(mf.ejecutado) AS total_ejecutado,
    CASE 
        WHEN SUM(mf.programado) > 0 
        THEN ROUND((SUM(mf.ejecutado) / SUM(mf.programado)) * 100, 2)
        ELSE 0 
    END AS eficacia_total
FROM accion_especifica ae
JOIN meta_fisica mf ON mf.accion_especifica_id = ae.id
WHERE ae.activo = true 
  AND mf.activo = true
GROUP BY ae.id, ae.codigo, ae.nombre, ae.unidad_medida, ae.orden, mf.anio;

-- ============================================
-- Vista 3: Trazabilidad de aprobación
-- ============================================
CREATE OR REPLACE VIEW v_trazabilidad_aprobacion AS
SELECT 
    p.id AS poa_id,
    p.codigo AS poa_codigo,
    p.nombre AS poa_nombre,
    p.anio,
    pa.tipo_aprobacion,
    pa.monto_solicitado,
    pa.monto_asignado,
    pa.porcentaje_variacion,
    CASE 
        WHEN pa.monto_solicitado = pa.monto_asignado 
        THEN 'SIN AJUSTE'
        ELSE 'CON AJUSTE'
    END AS estado_ajuste,
    pa.requiere_ajuste_metas,
    pa.fecha_aprobacion,
    pa.aprobado_por,
    pa.observaciones
FROM poa p
JOIN poa_aprobacion pa ON pa.poa_id = p.id
WHERE p.activo = true;

-- ============================================
-- Vista 4: Resumen de metas por POA
-- ============================================
CREATE OR REPLACE VIEW v_resumen_poa_meta_fisica AS
SELECT 
    p.id AS poa_id,
    p.codigo AS poa_codigo,
    p.nombre AS poa_nombre,
    p.anio,
    COUNT(DISTINCT ae.id) AS total_acciones,
    SUM(mf.programado) AS total_programado,
    SUM(mf.ejecutado) AS total_ejecutado,
    CASE 
        WHEN SUM(mf.programado) > 0 
        THEN ROUND((SUM(mf.ejecutado) / SUM(mf.programado)) * 100, 2)
        ELSE 0 
    END AS eficacia_total
FROM poa p
JOIN accion_especifica ae ON ae.poa_id = p.id
JOIN meta_fisica mf ON mf.accion_especifica_id = ae.id
WHERE p.activo = true 
  AND ae.activo = true 
  AND mf.activo = true
GROUP BY p.id, p.codigo, p.nombre, p.anio;

-- ============================================
-- Vista 5: Programación mensual de partidas
-- ============================================
CREATE OR REPLACE VIEW v_programacion_mensual_partida AS
SELECT 
    pr.id AS partida_id,
    pr.codigo AS partida_codigo,
    pr.nombre AS partida_nombre,
    pm.monto_solicitado,
    pm.monto_asignado,
    pm.monto_ejecutado,
    pm.eficacia,
    m.numero AS mes_numero,
    m.nombre AS mes_nombre,
    pm.anio
FROM partida_presupuestaria pr
JOIN partida_mensual pm ON pm.partida_presupuestaria_id = pr.id
JOIN mes m ON m.id = pm.mes_id
WHERE pr.activo = true 
  AND pm.activo = true
ORDER BY pr.codigo, m.numero;

COMMIT;
