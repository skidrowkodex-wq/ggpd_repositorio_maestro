-- ============================================================================
-- 04b_samc_poa_gerencia.sql
-- Agrega gerencia_id y proceso_id a samc_poa
-- ============================================================================
-- Aplica después de 04_samc_empresa.sql
-- ============================================================================

BEGIN;

ALTER TABLE samc.samc_poa
    ADD COLUMN gerencia_id UUID REFERENCES samc.samc_gerencia(id) ON DELETE RESTRICT,
    ADD COLUMN proceso_id  UUID REFERENCES samc.samc_proceso(id) ON DELETE RESTRICT;

CREATE INDEX idx_poa_gerencia ON samc.samc_poa(gerencia_id);
CREATE INDEX idx_poa_proceso  ON samc.samc_poa(proceso_id);

COMMENT ON COLUMN samc.samc_poa.gerencia_id IS 'Gerencia propietaria/custodia del POA';
COMMENT ON COLUMN samc.samc_poa.proceso_id  IS 'Proceso principal al que pertenece el POA';

COMMIT;
