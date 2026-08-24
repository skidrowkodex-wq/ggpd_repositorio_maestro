-- =====================================================
-- FASE 13: VISTAS SIPES PARA CONSULTA Y REPORTES
-- Análisis: formulario_ficha_sipes_proyecto.xlsx
-- Fecha: 2026-03-08
-- =====================================================

-- Vista 1: Ficha del Proyecto SIPES (resumen)
CREATE OR REPLACE VIEW v_ficha_sipes AS
SELECT 
    p.id AS poa_id,
    p.codigo_sipes,
    p.nombre,
    p.descripcion,
    p.fecha_inicio,
    p.fecha_fin,
    p.estado,
    p.organismo_responsable,
    p.unidad_ejecutora_local,
    p.responsable_ejecucion_nombre,
    p.cargo_responsable,
    p.responsable_tecnico_nombre,
    p.responsable_tecnico_email,
    p.responsable_admin_nombre,
    p.responsable_admin_email,
    p.localizacion,
    p.es_plurianual,
    p.situacion_presupuestaria,
    p.politica_sen,
    p.programa_sen,
    -- Datos de la unidad ejecutora
    u.nombre AS unidad_nombre,
    g.nombre AS gerencia_nombre,
    -- Conteo de acciones
    COUNT(DISTINCT ae.id) AS total_acciones,
    -- Monto total del proyecto
    COALESCE(SUM(DISTINCT pr.monto_presupuestado), 0) AS monto_total
FROM poa p
LEFT JOIN accion_especifica ae ON ae.poa_id = p.id
LEFT JOIN partida_presupuestaria pr ON pr.accion_especifica_id = ae.id
LEFT JOIN unidad u ON u.id = p.unidad_id
LEFT JOIN gerencia g ON g.id = u.gerencia_id
WHERE p.activo = TRUE
GROUP BY p.id, u.nombre, g.nombre;

-- Vista 2: Detalle de Acciones Específicas SIPES
CREATE OR REPLACE VIEW v_detalle_acciones_sipes AS
SELECT 
    ae.id AS accion_id,
    ae.codigo,
    ae.nombre,
    ae.descripcion,
    ae.unidad_medida,
    ae.orden,
    ae.ponderacion,
    ae.fecha_inicio_accion,
    ae.fecha_fin_accion,
    ae.ejecutor,
    ae.meta,
    -- Datos del POA
    p.codigo_sipes AS poa_codigo,
    p.nombre AS poa_nombre,
    -- Meta física programada total
    COALESCE(SUM(mf.programado), 0) AS meta_fisica_programada,
    COALESCE(SUM(mf.ejecutado), 0) AS meta_fisica_ejecutada,
    CASE 
        WHEN COALESCE(SUM(mf.programado), 0) > 0 
        THEN ROUND((COALESCE(SUM(mf.ejecutado), 0) / SUM(mf.programado)) * 100, 2)
        ELSE 0 
    END AS avance_porcentaje
FROM accion_especifica ae
LEFT JOIN poa p ON p.id = ae.poa_id
LEFT JOIN meta_fisica mf ON mf.accion_especifica_id = ae.id
WHERE ae.activo = TRUE
GROUP BY ae.id, p.codigo_sipes, p.nombre;

-- Vista 3: Detalle de Partidas Presupuestarias SIPES
CREATE OR REPLACE VIEW v_detalle_partidas_sipes AS
SELECT 
    pr.id AS partida_id,
    pr.codigo,
    pr.nombre,
    pr.monto_presupuestado,
    pr.cantidad,
    pr.unidad_medida,
    pr.costo_unitario,
    pr.justificacion,
    -- Datos de la acción específica
    ae.codigo AS accion_codigo,
    ae.nombre AS accion_nombre,
    -- Datos del POA
    p.codigo_sipes AS poa_codigo,
    p.nombre AS poa_nombre,
    -- Recursos humanos (solo para partida 402)
    (SELECT COUNT(*) FROM recurso_humano rh 
     WHERE rh.partida_presupuestaria_id = pr.id) AS total_recursos_humanos,
    (SELECT COALESCE(SUM(rh.costo_anual), 0) FROM recurso_humano rh 
     WHERE rh.partida_presupuestaria_id = pr.id) AS total_costo_recursos_humanos
FROM partida_presupuestaria pr
LEFT JOIN accion_especifica ae ON ae.id = pr.accion_especifica_id
LEFT JOIN poa p ON p.id = ae.poa_id
WHERE pr.activo = TRUE;

-- Vista 4: Resumen de Recursos Humanos (Partida 402)
CREATE OR REPLACE VIEW v_resumen_recurso_humano AS
SELECT 
    rh.id,
    rh.rol_funcional,
    rh.dedicacion_meses,
    rh.costo_mensual,
    rh.costo_anual,
    -- Datos de la partida
    pr.codigo AS partida_codigo,
    pr.nombre AS partida_nombre,
    -- Datos de la acción
    ae.codigo AS accion_codigo,
    ae.nombre AS accion_nombre,
    -- Datos del POA
    p.codigo_sipes AS poa_codigo,
    p.nombre AS poa_nombre
FROM recurso_humano rh
LEFT JOIN partida_presupuestaria pr ON pr.id = rh.partida_presupuestaria_id
LEFT JOIN accion_especifica ae ON ae.id = pr.accion_especifica_id
LEFT JOIN poa p ON p.id = ae.poa_id
WHERE rh.activo = TRUE;

-- =====================================================
-- VERIFICACIÓN DE VISTAS CREADAS
-- =====================================================
SELECT 
    viewname
FROM pg_views 
WHERE schemaname = 'public' 
AND (viewname LIKE '%sipes%' OR viewname LIKE '%recurso%')
ORDER BY viewname;
