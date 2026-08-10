-- =====================================================
-- FASE 22: VISTAS DE CONTROL DE CIERRES DE VIÁTICOS
-- Vistas para consulta y reportes por escenario
-- Fecha: 2026-03-08
-- =====================================================

-- Vista 1: Resumen de cierres por escenario
CREATE OR REPLACE VIEW v_resumen_cierres_viaticos AS
SELECT 
    cv.id AS cierre_id,
    -- Datos de la asignación
    av.id AS asignacion_id,
    r.cedula,
    r.numero_personal,
    r.nombres || ' ' || r.apellidos AS nombre_completo,
    av.destino,
    av.fecha_salida,
    av.fecha_retorno,
    av.dias_viaje,
    -- Datos del cierre
    cv.tipo_cierre,
    cv.fecha_cierre,
    cv.monto_asignado,
    cv.monto_gastado,
    cv.monto_reintegro,
    cv.monto_reembolso,
    -- Diferencia entre asignado y gastado
    CASE 
        WHEN cv.tipo_cierre = 'REINTEGRO' THEN cv.monto_asignado - cv.monto_gastado
        WHEN cv.tipo_cierre = 'REEMBOLSO' THEN cv.monto_gastado - cv.monto_asignado
        ELSE 0 
    END AS diferencia,
    -- Aprobaciones
    cv.aprobado_por_gerente,
    cv.fecha_aprobacion_gerente,
    cv.justificacion_gerente,
    cv.aprobado_por_director,
    cv.fecha_aprobacion_director,
    cv.justificacion_director,
    -- Origen de fondos
    cv.origen_fondos,
    -- Comprobantes
    cv.comprobante_reintegro,
    cv.comprobante_reembolso,
    -- Motivo y observaciones
    cv.motivo_cierre,
    cv.observaciones,
    -- Datos del viático
    v.concepto AS viatico_concepto,
    -- Datos de la acción
    ae.codigo AS accion_codigo,
    ae.nombre AS accion_nombre,
    -- Datos del POA
    p.codigo_sipes AS poa_codigo,
    p.nombre AS poa_nombre
FROM cierre_viatico cv
LEFT JOIN asignacion_viatico av ON av.id = cv.asignacion_viatico_id
LEFT JOIN responsable r ON r.id = av.responsable_id
LEFT JOIN viatico v ON v.id = av.viatico_id
LEFT JOIN partida_presupuestaria pr ON pr.id = v.partida_presupuestaria_id
LEFT JOIN accion_especifica ae ON ae.id = pr.accion_especifica_id
LEFT JOIN poa p ON p.id = ae.poa_id
WHERE cv.activo = TRUE;

-- Vista 2: Control de cierres excepcionales
CREATE OR REPLACE VIEW v_cierres_excepcionales AS
SELECT 
    cv.id AS cierre_id,
    av.id AS asignacion_id,
    r.nombres || ' ' || r.apellidos AS nombre_completo,
    r.cedula,
    av.destino,
    cv.fecha_cierre,
    cv.monto_asignado,
    cv.aprobado_por_gerente,
    cv.aprobado_por_director,
    cv.justificacion_director,
    cv.origen_fondos,
    cv.requiere_revision_periodica,
    cv.proxima_revision,
    cv.estado_revision,
    -- Días hasta próxima revisión
    CASE 
        WHEN cv.proxima_revision IS NOT NULL 
        THEN cv.proxima_revision - CURRENT_DATE
        ELSE NULL 
    END AS dias_hasta_revision,
    -- Estado de revisión
    CASE 
        WHEN cv.estado_revision = 'PENDIENTE' AND cv.proxima_revision < CURRENT_DATE 
        THEN 'REVISIÓN VENCIDA'
        WHEN cv.estado_revision = 'PENDIENTE' 
        THEN 'PENDIENTE DE REVISIÓN'
        WHEN cv.estado_revision = 'REVISADO' 
        THEN 'REVISADO - CERRAR'
        ELSE cv.estado_revision
    END AS estado_revision_detalle,
    -- Datos del viático
    v.concepto AS viatico_concepto
FROM cierre_viatico cv
LEFT JOIN asignacion_viatico av ON av.id = cv.asignacion_viatico_id
LEFT JOIN responsable r ON r.id = av.responsable_id
LEFT JOIN viatico v ON v.id = av.viatico_id
WHERE cv.activo = TRUE
AND cv.es_excepcional = TRUE;

-- Vista 3: Dashboard de cierres de viáticos
CREATE OR REPLACE VIEW v_dashboard_cierres_viaticos AS
SELECT 
    -- Por tipo de cierre
    COUNT(*) AS total_cierres,
    COUNT(CASE WHEN cv.tipo_cierre = 'RENDICION_NORMAL' THEN 1 END) AS cierres_normales,
    COUNT(CASE WHEN cv.tipo_cierre = 'REINTEGRO' THEN 1 END) AS cierres_reintegro,
    COUNT(CASE WHEN cv.tipo_cierre = 'REEMBOLSO' THEN 1 END) AS cierres_reembolso,
    COUNT(CASE WHEN cv.tipo_cierre = 'EXCEPCIONAL' THEN 1 END) AS cierres_excepcionales,
    -- Montos
    COALESCE(SUM(cv.monto_asignado), 0) AS total_monto_asignado,
    COALESCE(SUM(cv.monto_gastado), 0) AS total_monto_gastado,
    COALESCE(SUM(cv.monto_reintegro), 0) AS total_monto_reintegro,
    COALESCE(SUM(cv.monto_reembolso), 0) AS total_monto_reembolso,
    -- Por estado de revisión (excepcionales)
    COUNT(CASE WHEN cv.es_excepcional = TRUE AND cv.estado_revision = 'PENDIENTE' THEN 1 END) AS excepcionales_pendientes,
    COUNT(CASE WHEN cv.es_excepcional = TRUE AND cv.estado_revision = 'REVISADO' THEN 1 END) AS excepcionales_revisados,
    COUNT(CASE WHEN cv.es_excepcional = TRUE AND cv.estado_revision = 'CERRADO' THEN 1 END) AS excepcionales_cerrados,
    -- Revisiones vencidas
    COUNT(CASE 
        WHEN cv.es_excepcional = TRUE 
        AND cv.estado_revision = 'PENDIENTE' 
        AND cv.proxima_revision < CURRENT_DATE 
        THEN 1 
    END) AS revisiones_vencidas
FROM cierre_viatico cv
WHERE cv.activo = TRUE;

-- Vista 4: Control de aprobaciones por escenario
CREATE OR REPLACE VIEW v_control_aprobaciones_escenarios AS
SELECT 
    cv.tipo_cierre,
    cv.aprobado_por_gerente AS aprobador,
    'GERENTE' AS rol,
    COUNT(*) AS total_aprobaciones,
    COALESCE(SUM(cv.monto_asignado), 0) AS monto_total_aprobado
FROM cierre_viatico cv
WHERE cv.activo = TRUE
AND cv.aprobado_por_gerente IS NOT NULL
GROUP BY cv.tipo_cierre, cv.aprobado_por_gerente

UNION ALL

SELECT 
    cv.tipo_cierre,
    cv.aprobado_por_director AS aprobador,
    'DIRECTOR' AS rol,
    COUNT(*) AS total_aprobaciones,
    COALESCE(SUM(cv.monto_asignado), 0) AS monto_total_aprobado
FROM cierre_viatico cv
WHERE cv.activo = TRUE
AND cv.aprobado_por_director IS NOT NULL
GROUP BY cv.tipo_cierre, cv.aprobado_por_director

ORDER BY tipo_cierre, rol;

-- Vista 5: Resumen por origen de fondos
CREATE OR REPLACE VIEW v_resumen_origen_fondos AS
SELECT 
    cv.origen_fondos,
    cv.tipo_cierre,
    COUNT(*) AS cantidad_cierres,
    COALESCE(SUM(cv.monto_asignado), 0) AS monto_total_asignado,
    COALESCE(SUM(cv.monto_gastado), 0) AS monto_total_gastado,
    COALESCE(SUM(cv.monto_reembolso), 0) AS monto_total_reembolso
FROM cierre_viatico cv
WHERE cv.activo = TRUE
AND cv.origen_fondos IS NOT NULL
GROUP BY cv.origen_fondos, cv.tipo_cierre
ORDER BY cv.origen_fondos, cv.tipo_cierre;

-- =====================================================
-- VERIFICACIÓN DE VISTAS CREADAS
-- =====================================================
SELECT 
    viewname
FROM pg_views 
WHERE schemaname = 'public' 
AND (viewname LIKE '%cierre%' OR viewname LIKE '%escenario%')
ORDER BY viewname;
