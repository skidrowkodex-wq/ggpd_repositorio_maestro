-- ============================================================================
-- 05_samc_empresa_socio.sql
-- Multinacionalidad: tipo_capital + socios por país
-- ============================================================================
-- Aplica después de 04_samc_empresa.sql
-- ============================================================================

BEGIN;

-- ============================================================================
-- Paso 1: pais → pais_domicilio (país de registro legal)
-- ============================================================================
ALTER TABLE samc.samc_empresa RENAME COLUMN pais TO pais_domicilio;

COMMENT ON COLUMN samc.samc_empresa.pais_domicilio IS 'País de registro legal (ISO 3166-1 alpha-2)';

-- ============================================================================
-- Paso 2: tipo_capital (NACIONAL / EXTRANJERO / MIXTO)
-- ============================================================================
ALTER TABLE samc.samc_empresa
    ADD COLUMN tipo_capital VARCHAR(10) NOT NULL DEFAULT 'NACIONAL',
    ADD CONSTRAINT chk_empresa_capital CHECK (tipo_capital IN ('NACIONAL', 'EXTRANJERO', 'MIXTO'));

COMMENT ON COLUMN samc.samc_empresa.tipo_capital IS 'NACIONAL = 100% capital nacional; EXTRANJERO = 100% extranjero; MIXTO = mixto';

-- ============================================================================
-- Paso 3: samc_empresa_socio — países participantes + porcentaje
-- ============================================================================
CREATE TABLE samc.samc_empresa_socio (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    empresa_id   UUID NOT NULL REFERENCES samc.samc_empresa(id) ON DELETE CASCADE,
    pais         VARCHAR(2) NOT NULL,
    porcentaje   NUMERIC(5,2),
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(empresa_id, pais)
);

CREATE INDEX idx_socio_empresa ON samc.samc_empresa_socio(empresa_id);

COMMENT ON TABLE  samc.samc_empresa_socio IS 'Países socios de una empresa mixta (porcentaje de participación)';
COMMENT ON COLUMN samc.samc_empresa_socio.pais       IS 'País del socio (ISO 3166-1 alpha-2)';
COMMENT ON COLUMN samc.samc_empresa_socio.porcentaje IS 'Porcentaje de participación (ej. 51.00). NULL si se desconoce';

-- ============================================================================
-- Paso 4: Actualizar MPPEE
-- ============================================================================
UPDATE samc.samc_empresa
SET tipo_capital = 'NACIONAL'
WHERE codigo = 'MPPEE';

COMMIT;
