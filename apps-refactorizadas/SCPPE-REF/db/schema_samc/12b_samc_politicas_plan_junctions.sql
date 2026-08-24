-- ============================================================================
-- 12b_samc_politicas_plan_junctions.sql
-- Junction tables: entidad ↔ Plan de la Patria (M:N) y entidad ↔ Carabobo 200
--
-- Plan Carabobo: cada entidad apunta a una única línea (1:1)
-- Plan de la Patria: cada entidad puede apuntar a varios objetivos (M:N)
-- ============================================================================

BEGIN;

SET search_path TO samc;

-- ============================================================================
-- Paso 1: Junction 1:1 — Entidad ↔ Plan Carabobo 200
-- ============================================================================

CREATE TABLE samc.samc_entidad_plan_carabobo (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entidad_type      VARCHAR(30) NOT NULL,
    entidad_id        UUID NOT NULL,
    plan_carabobo_id  UUID NOT NULL
                      REFERENCES samc.samc_politica_plan_carabobo(id) ON DELETE RESTRICT,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT chk_epc_entidad_type CHECK (entidad_type IN ('POA', 'PROYECTO_ESPECIAL', 'ACCION_ESPECIFICA')),
    CONSTRAINT uq_epc_entidad UNIQUE (entidad_type, entidad_id)
);

CREATE INDEX idx_epc_entidad ON samc.samc_entidad_plan_carabobo(entidad_type, entidad_id);
CREATE INDEX idx_epc_carabobo ON samc.samc_entidad_plan_carabobo(plan_carabobo_id);

COMMENT ON TABLE  samc.samc_entidad_plan_carabobo IS 'Vínculo 1:1 — cada POA/proyecto/acción apunta a una línea del Plan Carabobo 200';
COMMENT ON COLUMN samc.samc_entidad_plan_carabobo.entidad_type     IS 'Tipo de entidad: POA, PROYECTO_ESPECIAL, ACCION_ESPECIFICA';
COMMENT ON COLUMN samc.samc_entidad_plan_carabobo.entidad_id       IS 'UUID de la entidad';
COMMENT ON COLUMN samc.samc_entidad_plan_carabobo.plan_carabobo_id IS 'Línea del Plan Carabobo 200 asociada';

-- ============================================================================
-- Paso 2: Junction M:N — Entidad ↔ Plan de la Patria
-- ============================================================================

CREATE TABLE samc.samc_entidad_plan_patria (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entidad_type      VARCHAR(30) NOT NULL,
    entidad_id        UUID NOT NULL,
    plan_patria_id    UUID NOT NULL
                      REFERENCES samc.samc_politica_plan_patria(id) ON DELETE RESTRICT,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT chk_epp_entidad_type CHECK (entidad_type IN ('POA', 'PROYECTO_ESPECIAL', 'ACCION_ESPECIFICA')),
    CONSTRAINT uq_epp_entidad_patria UNIQUE (entidad_type, entidad_id, plan_patria_id)
);

CREATE INDEX idx_epp_entidad ON samc.samc_entidad_plan_patria(entidad_type, entidad_id);
CREATE INDEX idx_epp_patria ON samc.samc_entidad_plan_patria(plan_patria_id);

COMMENT ON TABLE  samc.samc_entidad_plan_patria IS 'Vínculo M:N — cada POA/proyecto/acción puede apuntar a varios objetivos del Plan de la Patria';
COMMENT ON COLUMN samc.samc_entidad_plan_patria.entidad_type   IS 'Tipo de entidad: POA, PROYECTO_ESPECIAL, ACCION_ESPECIFICA';
COMMENT ON COLUMN samc.samc_entidad_plan_patria.entidad_id     IS 'UUID de la entidad';
COMMENT ON COLUMN samc.samc_entidad_plan_patria.plan_patria_id IS 'Objetivo del Plan de la Patria asociado';

-- ============================================================================
-- Paso 3: Triggers updated_at
-- ============================================================================

CREATE TRIGGER trg_samc_epc_updated_at
    BEFORE UPDATE ON samc.samc_entidad_plan_carabobo
    FOR EACH ROW EXECUTE FUNCTION samc.set_updated_at();

CREATE TRIGGER trg_samc_epp_updated_at
    BEFORE UPDATE ON samc.samc_entidad_plan_patria
    FOR EACH ROW EXECUTE FUNCTION samc.set_updated_at();

COMMIT;
