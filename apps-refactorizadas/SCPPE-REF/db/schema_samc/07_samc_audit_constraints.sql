-- ============================================================================
-- 07_samc_audit_constraints.sql
-- Correcciones de auditoría — constraints faltantes
--   H1: ejecutado no excede programado
--   H2: base_calculo.total = cantidad × costo_unitario
--   H3: monto_ejecutado en moneda extranjera
--   H5: ajustado >= programado
-- ============================================================================

BEGIN;

-- ============================================================================
-- H1: ejecutado no puede exceder lo presupuestado
-- Usa GREATEST(programado, asignado, ajustado) para tomar el más alto disponible
-- ============================================================================
ALTER TABLE samc.samc_meta_financiera
    ADD CONSTRAINT chk_ejecutado_no_excede
        CHECK (ejecutado >= 0 AND ejecutado <= GREATEST(COALESCE(programado, 0), COALESCE(asignado, 0), COALESCE(ajustado, 0)));

ALTER TABLE samc.samc_meta_fisica
    ADD CONSTRAINT chk_ejecutado_no_excede
        CHECK (ejecutado >= 0 AND ejecutado <= programado);

-- ============================================================================
-- H2: base_calculo.total = cantidad × costo_unitario (GENERATED)
-- ============================================================================
ALTER TABLE samc.samc_base_calculo DROP COLUMN total;
ALTER TABLE samc.samc_base_calculo
    ADD COLUMN total NUMERIC(18,2) NOT NULL GENERATED ALWAYS AS (
        COALESCE(cantidad, 0) * COALESCE(costo_unitario, 0)
    ) STORED;

COMMENT ON COLUMN samc.samc_base_calculo.total IS 'Generado: cantidad × costo_unitario';

-- ============================================================================
-- H3: monto_ejecutado en moneda extranjera
-- ============================================================================
ALTER TABLE samc.samc_meta_financiera_moneda
    ADD COLUMN monto_ejecutado NUMERIC(18,2);

COMMENT ON COLUMN samc.samc_meta_financiera_moneda.monto_ejecutado
    IS 'Monto realmente ejecutado en esta moneda (NULL si no hay ejecución reportada)';

-- ============================================================================
-- H5: ajustado >= programado (tasa Ministerio >= tasa BCV)
-- ============================================================================
ALTER TABLE samc.samc_meta_financiera
    ADD CONSTRAINT chk_ajustado_no_menor
        CHECK (ajustado IS NULL OR programado IS NULL OR ajustado >= programado);

COMMIT;
