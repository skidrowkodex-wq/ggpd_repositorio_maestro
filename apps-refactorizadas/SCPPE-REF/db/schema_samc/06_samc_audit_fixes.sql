-- ============================================================================
-- 06_samc_audit_fixes.sql
-- Correcciones de auditoría financiera
--   1. eficacia → GENERATED ALWAYS (en 3 tablas)
--   2. restante → GENERATED ALWAYS (acción)
--   3. Vista de conciliación acción ↔ metas
-- ============================================================================

BEGIN;

-- ============================================================================
-- Fix 1a: samc_meta_financiera.eficacia → GENERATED
-- ============================================================================
ALTER TABLE samc.samc_meta_financiera DROP COLUMN eficacia;
ALTER TABLE samc.samc_meta_financiera
    ADD COLUMN eficacia NUMERIC(5,2) GENERATED ALWAYS AS (
        CASE WHEN programado > 0
             THEN LEAST((ejecutado / programado * 100)::numeric(5,2), 100)
             ELSE 0 END
    ) STORED;

COMMENT ON COLUMN samc.samc_meta_financiera.eficacia IS 'Generado: (ejecutado / programado × 100). Garantizado entre 0 y 100.';

-- ============================================================================
-- Fix 1b: samc_meta_fisica.eficacia → GENERATED
-- ============================================================================
ALTER TABLE samc.samc_meta_fisica DROP COLUMN eficacia;
ALTER TABLE samc.samc_meta_fisica
    ADD COLUMN eficacia NUMERIC(5,2) GENERATED ALWAYS AS (
        CASE WHEN programado > 0
             THEN LEAST((ejecutado / programado * 100)::numeric(5,2), 100)
             ELSE 0 END
    ) STORED;

COMMENT ON COLUMN samc.samc_meta_fisica.eficacia IS 'Generado: (ejecutado / programado × 100). Garantizado entre 0 y 100.';

-- ============================================================================
-- Fix 1c: samc_poa_accion_especifica.eficacia → GENERATED
-- ============================================================================
ALTER TABLE samc.samc_poa_accion_especifica DROP COLUMN eficacia;
ALTER TABLE samc.samc_poa_accion_especifica
    ADD COLUMN eficacia NUMERIC(5,2) GENERATED ALWAYS AS (
        CASE WHEN programado > 0
             THEN LEAST((ejecutado / programado * 100)::numeric(5,2), 100)
             ELSE 0 END
    ) STORED;

COMMENT ON COLUMN samc.samc_poa_accion_especifica.eficacia IS 'Generado: (ejecutado / programado × 100). Garantizado entre 0 y 100.';

-- ============================================================================
-- Fix 2: samc_poa_accion_especifica.restante → GENERATED
-- ============================================================================
ALTER TABLE samc.samc_poa_accion_especifica DROP COLUMN restante;
ALTER TABLE samc.samc_poa_accion_especifica
    ADD COLUMN restante NUMERIC(18,2) GENERATED ALWAYS AS (
        programado - ejecutado
    ) STORED;

COMMENT ON COLUMN samc.samc_poa_accion_especifica.restante IS 'Generado: programado - ejecutado';

-- ============================================================================
-- Fix 3: Vista de conciliación acción ↔ metas
-- Cruza los totales declarados en la acción vs la suma de sus metas hijas
-- ============================================================================
CREATE VIEW samc.v_conciliacion_accion AS
SELECT
    ae.id,
    ae.codigo,
    ae.descripcion,
    ae.programado  AS accion_programado,
    ae.ejecutado   AS accion_ejecutado,
    ae.eficacia    AS accion_eficacia,
    ae.restante    AS accion_restante,
    COALESCE(SUM(mf.programado), 0) AS meta_programado,
    COALESCE(SUM(mf.ejecutado), 0)  AS meta_ejecutado,
    ae.programado - COALESCE(SUM(mf.programado), 0) AS diff_programado,
    ae.ejecutado  - COALESCE(SUM(mf.ejecutado), 0)  AS diff_ejecutado
FROM samc.samc_poa_accion_especifica ae
LEFT JOIN samc.samc_meta_financiera mf ON mf.acc_esp_id = ae.id
GROUP BY ae.id, ae.codigo, ae.descripcion, ae.programado, ae.ejecutado, ae.eficacia, ae.restante;

COMMENT ON VIEW samc.v_conciliacion_accion IS 'Conciliación: compara totales declarados en acción vs suma de metas hijas. diff != 0 indica desfase.';

COMMIT;
