-- ============================================================================
-- 15b_samc_vistas_consolidadas.sql
-- Vistas para reportes consolidados de proyectos plurianuales
-- ============================================================================

BEGIN;

SET search_path TO samc;

-- ============================================================================
-- Vista 1: v_avance_proyecto
-- Resumen de avance físico (por proyecto, por año, y total)
-- ============================================================================

CREATE OR REPLACE VIEW samc.v_avance_proyecto AS
WITH yearly AS (
    SELECT
        pmf.proyecto_id,
        pmf.anio,
        SUM(pmf.programado) AS programado_anio,
        SUM(pmf.ejecutado) AS ejecutado_anio,
        CASE WHEN SUM(pmf.programado) > 0
             THEN ROUND((SUM(pmf.ejecutado) / SUM(pmf.programado)) * 100, 2)
             ELSE 0
        END AS eficacia_anio
    FROM samc.samc_proyecto_meta_fisica pmf
    GROUP BY pmf.proyecto_id, pmf.anio
),
totals AS (
    SELECT
        pmf.proyecto_id,
        SUM(pmf.programado) AS programado_total,
        SUM(pmf.ejecutado) AS ejecutado_total,
        CASE WHEN SUM(pmf.programado) > 0
             THEN ROUND((SUM(pmf.ejecutado) / SUM(pmf.programado)) * 100, 2)
             ELSE 0
        END AS eficacia_total
    FROM samc.samc_proyecto_meta_fisica pmf
    GROUP BY pmf.proyecto_id
)
SELECT
    pe.id AS proyecto_id,
    pe.codigo,
    pe.nombre,
    pe.estatus,
    y.anio,
    y.programado_anio,
    y.ejecutado_anio,
    y.eficacia_anio,
    t.programado_total,
    t.ejecutado_total,
    t.eficacia_total,
    CASE WHEN t.programado_total > 0 AND t.programado_total IS NOT NULL
         THEN ROUND((y.programado_anio / t.programado_total) * 100, 2)
         ELSE 0
    END AS peso_porcentual_anio
FROM samc.samc_proyecto_especial pe
JOIN yearly y ON y.proyecto_id = pe.id
JOIN totals t ON t.proyecto_id = pe.id
WHERE pe.es_plantilla = FALSE
ORDER BY pe.nombre, y.anio;

-- ============================================================================
-- Vista 2: v_avance_proyecto_resumen
-- Una fila por proyecto con eficacia total y desglose anual como JSON
-- ============================================================================

CREATE OR REPLACE VIEW samc.v_avance_proyecto_resumen AS
SELECT
    pe.id AS proyecto_id,
    pe.codigo,
    pe.nombre,
    pe.estatus,
    COALESCE(t.programado_total, 0) AS programado_total,
    COALESCE(t.ejecutado_total, 0) AS ejecutado_total,
    COALESCE(t.eficacia_total, 0) AS eficacia_total,
    COALESCE(
        (SELECT JSON_AGG(
            JSON_BUILD_OBJECT(
                'anio', y.anio,
                'programado', y.programado_anio,
                'ejecutado', y.ejecutado_anio,
                'eficacia', y.eficacia_anio,
                'peso', ROUND(CASE WHEN t.programado_total > 0
                              THEN (y.programado_anio / t.programado_total) * 100
                              ELSE 0 END, 2)
            )
            ORDER BY y.anio
         )
         FROM samc.v_avance_proyecto y
         WHERE y.proyecto_id = pe.id
         GROUP BY y.proyecto_id
        ),
        '[]'::JSON
    ) AS detalle_anual,
    pe.monto_total_bs,
    EXTRACT(YEAR FROM pe.fecha_inicio)::INTEGER AS anio_inicio,
    EXTRACT(YEAR FROM pe.fecha_culminacion)::INTEGER AS anio_fin
FROM samc.samc_proyecto_especial pe
LEFT JOIN (
    SELECT
        proyecto_id,
        SUM(programado) AS programado_total,
        SUM(ejecutado) AS ejecutado_total,
        CASE WHEN SUM(programado) > 0
             THEN ROUND((SUM(ejecutado) / SUM(programado)) * 100, 2)
             ELSE 0
        END AS eficacia_total
    FROM samc.samc_proyecto_meta_fisica
    GROUP BY proyecto_id
) t ON t.proyecto_id = pe.id
WHERE pe.es_plantilla = FALSE
ORDER BY pe.nombre;

-- ============================================================================
-- Vista 3: v_consolidado_poa_accion
-- Presupuesto de acción POA + aportes de proyectos vinculados
-- ============================================================================

CREATE OR REPLACE VIEW samc.v_consolidado_poa_accion AS
WITH action_budget AS (
    SELECT
        ae.id AS acc_esp_id,
        ae.poa_id,
        ae.codigo AS acc_codigo,
        ae.descripcion AS acc_descripcion,
        ae.programado AS presupuesto_propio,
        COALESCE(SUM(vp.monto_aporte), 0) AS total_aportes_proyectos,
        COUNT(DISTINCT vp.proyecto_id) FILTER (WHERE vp.activo = TRUE) AS proyectos_vinculados
    FROM samc.samc_poa_accion_especifica ae
    LEFT JOIN samc.samc_proyecto_vinculacion_poa vp
        ON vp.acc_esp_id = ae.id AND vp.activo = TRUE
    GROUP BY ae.id, ae.poa_id, ae.codigo, ae.descripcion, ae.programado
)
SELECT
    ab.acc_esp_id,
    ab.poa_id,
    p.denominacion AS poa_nombre,
    ab.acc_codigo,
    ab.acc_descripcion,
    ab.presupuesto_propio,
    ab.total_aportes_proyectos,
    (ab.presupuesto_propio + ab.total_aportes_proyectos) AS presupuesto_total_consolidado,
    ab.proyectos_vinculados,
    CASE WHEN (ab.presupuesto_propio + ab.total_aportes_proyectos) > 0
         THEN ROUND((ab.presupuesto_propio / (ab.presupuesto_propio + ab.total_aportes_proyectos)) * 100, 2)
         ELSE 100
    END AS porcentaje_propio
FROM action_budget ab
JOIN samc.samc_poa p ON p.id = ab.poa_id
ORDER BY p.denominacion, ab.acc_codigo;

-- ============================================================================
-- Vista 4: v_consolidado_poa
-- Resumen por POA (presupuesto propio + aportes de proyectos)
-- ============================================================================

CREATE OR REPLACE VIEW samc.v_consolidado_poa AS
SELECT
    vc.poa_id,
    vc.poa_nombre,
    COUNT(DISTINCT vc.acc_esp_id) AS total_acciones,
    SUM(vc.presupuesto_propio) AS presupuesto_propio_total,
    SUM(vc.total_aportes_proyectos) AS total_aportes_proyectos,
    SUM(vc.presupuesto_total_consolidado) AS presupuesto_consolidado_total,
    COUNT(DISTINCT vc.proyectos_vinculados) AS proyectos_vinculados_unicos
FROM samc.v_consolidado_poa_accion vc
GROUP BY vc.poa_id, vc.poa_nombre
ORDER BY vc.poa_nombre;

-- ============================================================================
-- Vista 5: v_proyectos_sin_poa
-- Proyectos activos sin vinculación POA en el año actual
-- ============================================================================

CREATE OR REPLACE VIEW samc.v_proyectos_sin_poa AS
SELECT * FROM samc.proyectos_huerfanos(EXTRACT(YEAR FROM NOW())::INTEGER);

COMMIT;
