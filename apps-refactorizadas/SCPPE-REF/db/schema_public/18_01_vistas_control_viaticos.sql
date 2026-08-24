-- =====================================================
-- FASE 18: VISTAS DE CONTROL DE VIÁTICOS
-- Estructura Híbrida - Vistas de Consulta y Reportes
-- Fecha: 2026-03-08
-- =====================================================

-- Vista 1: Resumen general de asignaciones de viáticos
CREATE OR REPLACE VIEW v_resumen_asignacion_viaticos AS
SELECT 
    av.id AS asignacion_id,
    -- Datos de la persona
    r.cedula,
    r.numero_personal,
    r.nombres || ' ' || r.apellidos AS nombre_completo,
    -- Datos del viaje
    av.destino,
    av.fecha_salida,
    av.fecha_retorno,
    av.dias_viaje,
    -- Montos
    av.monto_asignado,
    av.monto_ejecutado,
    av.saldo_pendiente,
    CASE 
        WHEN av.monto_asignado > 0 
        THEN ROUND((av.monto_ejecutado / av.monto_asignado) * 100, 2)
        ELSE 0 
    END AS porcentaje_ejecutado,
    -- Estado
    av.estado,
    -- Datos del viático (presupuesto)
    v.concepto AS viatico_concepto,
    -- Datos de la acción
    ae.codigo AS accion_codigo,
    ae.nombre AS accion_nombre,
    -- Datos del POA
    p.codigo_sipes AS poa_codigo,
    p.nombre AS poa_nombre
FROM asignacion_viatico av
LEFT JOIN responsable r ON r.id = av.responsable_id
LEFT JOIN viatico v ON v.id = av.viatico_id
LEFT JOIN partida_presupuestaria pr ON pr.id = v.partida_presupuestaria_id
LEFT JOIN accion_especifica ae ON ae.id = pr.accion_especifica_id
LEFT JOIN poa p ON p.id = ae.poa_id
WHERE av.activo = TRUE;

-- Vista 2: Detalle de comprobantes por asignación
CREATE OR REPLACE VIEW v_detalle_comprobantes_viaticos AS
SELECT 
    cv.id AS comprobante_id,
    -- Datos de la asignación
    av.id AS asignacion_id,
    r.nombres || ' ' || r.apellidos AS persona,
    av.destino,
    av.fecha_salida,
    av.fecha_retorno,
    -- Datos del comprobante
    cv.tipo_comprobante,
    cv.numero_comprobante,
    cv.fecha_comprobante,
    cv.descripcion,
    cv.monto_comprobante,
    cv.proveedor,
    cv.rif_proveedor,
    -- Archivo adjunto
    cv.archivo_nombre,
    cv.archivo_tipo,
    cv.archivo_tamano,
    -- Estado
    cv.estado,
    cv.motivo_rechazo,
    -- Datos del viático
    v.concepto AS viatico_concepto,
    -- Datos de la acción
    ae.codigo AS accion_codigo
FROM comprobante_viatico cv
LEFT JOIN asignacion_viatico av ON av.id = cv.asignacion_viatico_id
LEFT JOIN responsable r ON r.id = av.responsable_id
LEFT JOIN viatico v ON v.id = av.viatico_id
LEFT JOIN partida_presupuestaria pr ON pr.id = v.partida_presupuestaria_id
LEFT JOIN accion_especifica ae ON ae.id = pr.accion_especifica_id
WHERE cv.activo = TRUE;

-- Vista 3: Control de aprobaciones de viáticos
CREATE OR REPLACE VIEW v_control_aprobaciones_viaticos AS
SELECT 
    ap.id AS aprobacion_id,
    -- Datos de la solicitud
    ap.solicitado_por,
    ap.fecha_solicitud,
    ap.justificacion,
    ap.monto_solicitado,
    -- Datos de la aprobación
    ap.aprobado_por,
    ap.fecha_aprobacion,
    ap.estado,
    ap.monto_aprobado,
    ap.observaciones_aprobacion,
    ap.motivo_rechazo,
    -- Datos de la asignación
    av.id AS asignacion_id,
    r.nombres || ' ' || r.apellidos AS persona_viajera,
    av.destino,
    av.fecha_salida,
    av.fecha_retorno,
    -- Datos del viático
    v.concepto AS viatico_concepto,
    -- Datos de la acción
    ae.codigo AS accion_codigo,
    ae.nombre AS accion_nombre,
    -- Datos del POA
    p.codigo_sipes AS poa_codigo
FROM aprobacion_viatico ap
LEFT JOIN asignacion_viatico av ON av.id = ap.asignacion_viatico_id
LEFT JOIN responsable r ON r.id = av.responsable_id
LEFT JOIN viatico v ON v.id = av.viatico_id
LEFT JOIN partida_presupuestaria pr ON pr.id = v.partida_presupuestaria_id
LEFT JOIN accion_especifica ae ON ae.id = pr.accion_especifica_id
LEFT JOIN poa p ON p.id = ae.poa_id
WHERE ap.activo = TRUE;

-- Vista 4: Dashboard de control de viáticos
CREATE OR REPLACE VIEW v_dashboard_viaticos AS
SELECT 
    -- Por asignación
    COUNT(DISTINCT av.id) AS total_asignaciones,
    COUNT(DISTINCT CASE WHEN av.estado = 'PENDIENTE' THEN av.id END) AS asignaciones_pendientes,
    COUNT(DISTINCT CASE WHEN av.estado = 'APROBADO' THEN av.id END) AS asignaciones_aprobadas,
    COUNT(DISTINCT CASE WHEN av.estado = 'EN_VIAJE' THEN av.id END) AS asignaciones_en_viaje,
    COUNT(DISTINCT CASE WHEN av.estado = 'COMPLETADO' THEN av.id END) AS asignaciones_completadas,
    COUNT(DISTINCT CASE WHEN av.estado = 'RECHAZADO' THEN av.id END) AS asignaciones_rechazadas,
    -- Montos
    COALESCE(SUM(av.monto_asignado), 0) AS total_monto_asignado,
    COALESCE(SUM(av.monto_ejecutado), 0) AS total_monto_ejecutado,
    COALESCE(SUM(av.saldo_pendiente), 0) AS total_saldo_pendiente,
    -- Por comprobante
    (SELECT COUNT(*) FROM comprobante_viatico cv WHERE cv.activo = TRUE) AS total_comprobantes,
    (SELECT COUNT(*) FROM comprobante_viatico cv WHERE cv.estado = 'PENDIENTE' AND cv.activo = TRUE) AS comprobantes_pendientes,
    (SELECT COUNT(*) FROM comprobante_viatico cv WHERE cv.estado = 'VALIDADO' AND cv.activo = TRUE) AS comprobantes_validados,
    (SELECT COUNT(*) FROM comprobante_viatico cv WHERE cv.estado = 'RECHAZADO' AND cv.activo = TRUE) AS comprobantes_rechazados,
    -- Por aprobación
    (SELECT COUNT(*) FROM aprobacion_viatico ap WHERE ap.activo = TRUE) AS total_solicitudes,
    (SELECT COUNT(*) FROM aprobacion_viatico ap WHERE ap.estado = 'PENDIENTE' AND ap.activo = TRUE) AS solicitudes_pendientes,
    (SELECT COUNT(*) FROM aprobacion_viatico ap WHERE ap.estado = 'APROBADO' AND ap.activo = TRUE) AS solicitudes_aprobadas,
    (SELECT COUNT(*) FROM aprobacion_viatico ap WHERE ap.estado = 'RECHAZADO' AND ap.activo = TRUE) AS solicitudes_rechazadas
FROM asignacion_viatico av
WHERE av.activo = TRUE;

-- Vista 5: Resumen por tipo de comprobante
CREATE OR REPLACE VIEW v_resumen_comprobantes_tipo AS
SELECT 
    cv.tipo_comprobante,
    COUNT(*) AS cantidad,
    COALESCE(SUM(cv.monto_comprobante), 0) AS monto_total,
    COALESCE(AVG(cv.monto_comprobante), 0) AS monto_promedio,
    COALESCE(MIN(cv.monto_comprobante), 0) AS monto_minimo,
    COALESCE(MAX(cv.monto_comprobante), 0) AS monto_maximo
FROM comprobante_viatico cv
WHERE cv.activo = TRUE
GROUP BY cv.tipo_comprobante;

-- =====================================================
-- VERIFICACIÓN DE VISTAS CREADAS
-- =====================================================
SELECT 
    viewname
FROM pg_views 
WHERE schemaname = 'public' 
AND (viewname LIKE '%viatico%' OR viewname LIKE '%asignacion%' OR viewname LIKE '%comprobante%')
ORDER BY viewname;
