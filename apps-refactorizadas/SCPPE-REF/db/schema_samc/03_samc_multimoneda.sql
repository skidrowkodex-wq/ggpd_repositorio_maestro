-- ============================================================================
-- 03_samc_multimoneda.sql
-- Multimoneda y 3 escenarios financieros (SOLICITADO / AJUSTADO MPPP / ASIGNADO)
-- ============================================================================
-- Aplica después de 02_samc_migracion.sql
-- Orden: catálogo → columnas → tablas → triggers
-- ============================================================================

BEGIN;

-- ============================================================================
-- Paso 1: Catálogo de monedas (extensible: USD, EUR, RUB, CNY, BRICS...)
-- ============================================================================
CREATE TABLE samc.samc_moneda (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    codigo      VARCHAR(3) NOT NULL UNIQUE,
    nombre      TEXT NOT NULL,
    simbolo     VARCHAR(5) NOT NULL,
    activo      BOOLEAN NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO samc.samc_moneda (codigo, nombre, simbolo) VALUES
    ('USD', 'Dólar estadounidense', '$'),
    ('EUR', 'Euro', '€');

-- ============================================================================
-- Paso 2: samc_meta_financiera — montos en Bs. para los 3 escenarios
-- ============================================================================
ALTER TABLE samc.samc_meta_financiera
    ADD COLUMN ajustado   NUMERIC(18,2),
    ADD COLUMN asignado   NUMERIC(18,2);

COMMENT ON COLUMN samc.samc_meta_financiera.programado IS 'Bs. SOLICITADO — monto proyectado a tasa oficial BCV';
COMMENT ON COLUMN samc.samc_meta_financiera.ajustado  IS 'Bs. AJUSTADO — monto calculado con tasa del Ministerio de Planificación (MPPP)';
COMMENT ON COLUMN samc.samc_meta_financiera.asignado  IS 'Bs. ASIGNADO — monto realmente aprobado';

-- ============================================================================
-- Paso 3: samc_meta_financiera_moneda — montos en moneda extranjera por meta
-- Plano: una fila por moneda con los 3 escenarios + las 2 tasas
-- ============================================================================
CREATE TABLE samc.samc_meta_financiera_moneda (
    id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    meta_financiera_id    UUID NOT NULL REFERENCES samc.samc_meta_financiera(id) ON DELETE CASCADE,
    moneda_id             UUID NOT NULL REFERENCES samc.samc_moneda(id) ON DELETE RESTRICT,
    monto_solicitado      NUMERIC(18,2) NOT NULL DEFAULT 0,
    monto_ajustado        NUMERIC(18,2) NOT NULL DEFAULT 0,
    monto_asignado        NUMERIC(18,2),
    tasa_oficial_bs       NUMERIC(14,4) NOT NULL,
    tasa_ministerio_bs    NUMERIC(14,4) NOT NULL,
    created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(meta_financiera_id, moneda_id)
);

CREATE INDEX idx_mfm_meta   ON samc.samc_meta_financiera_moneda(meta_financiera_id);
CREATE INDEX idx_mfm_moneda ON samc.samc_meta_financiera_moneda(moneda_id);

COMMENT ON TABLE  samc.samc_meta_financiera_moneda IS 'Montos en moneda extranjera por meta financiera. Cada fila contiene los 3 escenarios (solicitado, ajustado MPPP, asignado) y las 2 tasas de cambio (oficial BCV y ministerio)';
COMMENT ON COLUMN samc.samc_meta_financiera_moneda.monto_solicitado   IS 'USD/EUR solicitado (tasa oficial BCV)';
COMMENT ON COLUMN samc.samc_meta_financiera_moneda.monto_ajustado     IS 'USD/EUR ajustado por factor MPPP (normalmente = monto_solicitado, la tasa es la que cambia)';
COMMENT ON COLUMN samc.samc_meta_financiera_moneda.monto_asignado     IS 'USD/EUR realmente asignado (NULL si no asignado)';
COMMENT ON COLUMN samc.samc_meta_financiera_moneda.tasa_oficial_bs    IS 'Tasa de cambio oficial BCV (Bs. por unidad de moneda extranjera)';
COMMENT ON COLUMN samc.samc_meta_financiera_moneda.tasa_ministerio_bs IS 'Tasa de cambio ajustada por el MPPP (factor macrofiscal)';

-- ============================================================================
-- Paso 4: samc_base_calculo — tipo SOLICITADO / ASIGNADO
-- ============================================================================
ALTER TABLE samc.samc_base_calculo
    ADD COLUMN tipo VARCHAR(10) NOT NULL DEFAULT 'SOLICITADO',
    ADD CONSTRAINT chk_bc_tipo CHECK (tipo IN ('SOLICITADO', 'ASIGNADO'));

COMMENT ON COLUMN samc.samc_base_calculo.tipo IS 'SOLICITADO = cálculo original (presupuestado); ASIGNADO = cálculo reducido por recorte';

-- ============================================================================
-- Paso 5: samc_base_calculo_moneda — USD/EUR por renglón de cálculo
-- ============================================================================
CREATE TABLE samc.samc_base_calculo_moneda (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    base_calculo_id   UUID NOT NULL REFERENCES samc.samc_base_calculo(id) ON DELETE CASCADE,
    moneda_id         UUID NOT NULL REFERENCES samc.samc_moneda(id) ON DELETE RESTRICT,
    tipo              VARCHAR(10) NOT NULL DEFAULT 'SOLICITADO',
    costo_unitario    NUMERIC(18,2) NOT NULL DEFAULT 0,
    total             NUMERIC(18,2) NOT NULL DEFAULT 0,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT chk_bcm_tipo CHECK (tipo IN ('SOLICITADO', 'ASIGNADO')),
    UNIQUE(base_calculo_id, moneda_id, tipo)
);

CREATE INDEX idx_bcm_base  ON samc.samc_base_calculo_moneda(base_calculo_id);
CREATE INDEX idx_bcm_moneda ON samc.samc_base_calculo_moneda(moneda_id);

-- ============================================================================
-- Paso 6: samc_asignacion — monto total asignado por acción específica
-- ============================================================================
CREATE TABLE samc.samc_asignacion (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    acc_esp_id      UUID NOT NULL REFERENCES samc.samc_poa_accion_especifica(id) ON DELETE CASCADE,
    monto_bs        NUMERIC(18,2) NOT NULL DEFAULT 0,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(acc_esp_id)
);

CREATE INDEX idx_asignacion_acc ON samc.samc_asignacion(acc_esp_id);

CREATE TABLE samc.samc_asignacion_moneda (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asignacion_id   UUID NOT NULL REFERENCES samc.samc_asignacion(id) ON DELETE CASCADE,
    moneda_id       UUID NOT NULL REFERENCES samc.samc_moneda(id) ON DELETE RESTRICT,
    monto           NUMERIC(18,2) NOT NULL DEFAULT 0,
    tasa_bs         NUMERIC(14,4),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(asignacion_id, moneda_id)
);

CREATE INDEX idx_asignacion_moneda_asig ON samc.samc_asignacion_moneda(asignacion_id);

CREATE TRIGGER trg_samc_asignacion_updated_at
    BEFORE UPDATE ON samc.samc_asignacion
    FOR EACH ROW EXECUTE FUNCTION samc.set_updated_at();

COMMIT;
