-- ============================================================================
-- 10_samc_plurianual.sql
-- Soporte plurianual para proyectos PRTSEN y POA multi-ejercicio
-- ============================================================================
-- Agrega columna anio a tablas financieras para permitir
-- múltiples años fiscales con los mismos meses genéricos.
-- ============================================================================

BEGIN;

SET search_path TO samc;

-- ============================================================================
-- Paso 1: samc_meta_financiera — agregar año fiscal
-- ============================================================================

ALTER TABLE samc.samc_meta_financiera
    ADD COLUMN anio INT NOT NULL DEFAULT EXTRACT(YEAR FROM now());

ALTER TABLE samc.samc_meta_financiera
    DROP CONSTRAINT IF EXISTS uq_meta_financiera_accion_partida_mes;

ALTER TABLE samc.samc_meta_financiera
    ADD CONSTRAINT uq_meta_financiera_accion_partida_mes_anio
        UNIQUE (acc_esp_id, partida_id, mes_id, anio);

COMMENT ON COLUMN samc.samc_meta_financiera.anio IS 'Año fiscal del registro. Permite metas plurianuales (mismo mes_id en diferentes años)';

-- ============================================================================
-- Paso 2: samc_proyecto_especial_financiero — agregar año fiscal
-- ============================================================================

ALTER TABLE samc.samc_proyecto_especial_financiero
    ADD COLUMN anio INT NOT NULL DEFAULT EXTRACT(YEAR FROM now());

ALTER TABLE samc.samc_proyecto_especial_financiero
    DROP CONSTRAINT IF EXISTS uq_pe_financiero_mes;

ALTER TABLE samc.samc_proyecto_especial_financiero
    ADD CONSTRAINT uq_pe_financiero_mes_anio
        UNIQUE (proyecto_especial_id, mes_id, partida_id, partida_elemento_id, anio);

COMMENT ON COLUMN samc.samc_proyecto_especial_financiero.anio IS 'Año fiscal del registro. Permite financiamiento plurianual';

-- ============================================================================
-- Paso 3: Recrear vista de conciliación proyecto ↔ POA
-- (no necesita cambios estructurales, SUM agrupa correctamente con anio)
-- ============================================================================

CREATE OR REPLACE VIEW samc.v_conciliacion_proyecto_poa AS
SELECT
    pe.id,
    pe.codigo,
    pe.nombre,
    pe.monto_total_bs AS proyecto_monto_referencia,
    COALESCE(pef_sum.programado, 0) AS proyecto_programado,
    COALESCE(pef_sum.ejecutado, 0)  AS proyecto_ejecutado,
    COALESCE(acc_sum.acc_programado, 0) AS poa_acciones_programado,
    COALESCE(acc_sum.acc_ejecutado, 0)  AS poa_acciones_ejecutado,
    COALESCE(pef_sum.programado, 0) - COALESCE(acc_sum.acc_programado, 0) AS diff_programado,
    COALESCE(pef_sum.ejecutado, 0)  - COALESCE(acc_sum.acc_ejecutado, 0)  AS diff_ejecutado
FROM samc.samc_proyecto_especial pe
LEFT JOIN (
    SELECT proyecto_especial_id,
           SUM(programado) AS programado,
           SUM(ejecutado)  AS ejecutado
    FROM samc.samc_proyecto_especial_financiero
    GROUP BY proyecto_especial_id
) pef_sum ON pef_sum.proyecto_especial_id = pe.id
LEFT JOIN (
    SELECT pepa.proyecto_especial_id,
           SUM(mf.programado) AS acc_programado,
           SUM(mf.ejecutado)  AS acc_ejecutado
    FROM samc.samc_proyecto_especial_poa_accion pepa
    JOIN samc.samc_meta_financiera mf ON mf.acc_esp_id = pepa.acc_esp_id
    GROUP BY pepa.proyecto_especial_id
) acc_sum ON acc_sum.proyecto_especial_id = pe.id;

COMMENT ON VIEW samc.v_conciliacion_proyecto_poa IS 'Concilia montos del proyecto PRTSEN vs suma de metas financieras de sus acciones POA vinculadas. Soporta múltiples años fiscales.';

-- ============================================================================
-- Paso 4: Actualizar registros existentes con el año de su POA
-- ============================================================================

UPDATE samc.samc_meta_financiera mf
SET anio = EXTRACT(YEAR FROM p.fecha_inicio)
FROM samc.samc_poa_accion_especifica ae
JOIN samc.samc_poa p ON p.id = ae.poa_id
WHERE mf.acc_esp_id = ae.id;

COMMIT;
