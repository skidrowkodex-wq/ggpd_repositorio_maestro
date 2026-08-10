-- ============================================================================
-- 12_samc_politicas_plan.sql
-- Políticas de Estado: Plan Patria y Plan Carabobo 200
--
-- Cataloga los objetivos del Plan de la Patria 2019-2025 y las líneas
-- estratégicas del Plan Carabobo 200. Cualquier entidad del sistema
-- (POA, proyecto especial, acción específica) puede vincularse a una
-- política de cada plan mediante la tabla polimórfica samc_entidad_politica.
-- ============================================================================

BEGIN;

SET search_path TO samc;

-- ============================================================================
-- Paso 1: Catálogo de políticas del Plan de la Patria 2019-2025
-- ============================================================================

CREATE TABLE samc.samc_politica_plan_patria (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    codigo            VARCHAR(20) NOT NULL UNIQUE,
    descripcion       TEXT NOT NULL,
    linea_estrategica VARCHAR(300) NOT NULL,
    objetivo_nacional TEXT,
    is_active         BOOLEAN NOT NULL DEFAULT TRUE,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_ppp_is_active ON samc.samc_politica_plan_patria(is_active);

COMMENT ON TABLE  samc.samc_politica_plan_patria IS 'Catálogo de objetivos/lineas del Plan de la Patria 2019-2025';
COMMENT ON COLUMN samc.samc_politica_plan_patria.codigo            IS 'Código de la política (ej. PP-001)';
COMMENT ON COLUMN samc.samc_politica_plan_patria.descripcion       IS 'Descripción breve de la política';
COMMENT ON COLUMN samc.samc_politica_plan_patria.linea_estrategica IS 'Línea estratégica del Plan de la Patria';
COMMENT ON COLUMN samc.samc_politica_plan_patria.objetivo_nacional IS 'Objetivo nacional al que pertenece (opcional)';

-- ============================================================================
-- Paso 2: Catálogo de líneas estratégicas del Plan Carabobo 200
-- ============================================================================

CREATE TABLE samc.samc_politica_plan_carabobo (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    codigo            VARCHAR(20) NOT NULL UNIQUE,
    descripcion       TEXT NOT NULL,
    linea_estrategica VARCHAR(300) NOT NULL,
    is_active         BOOLEAN NOT NULL DEFAULT TRUE,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_ppc_is_active ON samc.samc_politica_plan_carabobo(is_active);

COMMENT ON TABLE  samc.samc_politica_plan_carabobo IS 'Catálogo de líneas estratégicas del Plan Carabobo 200';
COMMENT ON COLUMN samc.samc_politica_plan_carabobo.codigo            IS 'Código de la línea (ej. PC-001)';
COMMENT ON COLUMN samc.samc_politica_plan_carabobo.descripcion       IS 'Descripción de la línea estratégica';
COMMENT ON COLUMN samc.samc_politica_plan_carabobo.linea_estrategica IS 'Línea estratégica del Plan Carabobo 200';

-- ============================================================================
-- Paso 3: Junction polimórfica entidad ↔ políticas
-- ============================================================================

CREATE TABLE samc.samc_entidad_politica (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entidad_type      VARCHAR(30) NOT NULL,
    entidad_id        UUID NOT NULL,
    plan_patria_id    UUID REFERENCES samc.samc_politica_plan_patria(id) ON DELETE SET NULL,
    plan_carabobo_id  UUID REFERENCES samc.samc_politica_plan_carabobo(id) ON DELETE SET NULL,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT chk_entidad_type CHECK (entidad_type IN ('POA', 'PROYECTO_ESPECIAL', 'ACCION_ESPECIFICA')),
    CONSTRAINT uq_entidad_politica UNIQUE (entidad_type, entidad_id)
);

CREATE INDEX idx_entidad_politica_type_id ON samc.samc_entidad_politica(entidad_type, entidad_id);
CREATE INDEX idx_entidad_politica_pp ON samc.samc_entidad_politica(plan_patria_id);
CREATE INDEX idx_entidad_politica_pc ON samc.samc_entidad_politica(plan_carabobo_id);

COMMENT ON TABLE  samc.samc_entidad_politica IS 'Vínculo polimórfico: cualquier entidad (POA, proyecto, acción) puede asociarse a una política del Plan Patria y una del Plan Carabobo';
COMMENT ON COLUMN samc.samc_entidad_politica.entidad_type     IS 'Tipo de entidad: POA, PROYECTO_ESPECIAL, ACCION_ESPECIFICA';
COMMENT ON COLUMN samc.samc_entidad_politica.entidad_id       IS 'UUID de la entidad en su tabla respectiva';
COMMENT ON COLUMN samc.samc_entidad_politica.plan_patria_id   IS 'Política del Plan de la Patria asociada (opcional)';
COMMENT ON COLUMN samc.samc_entidad_politica.plan_carabobo_id IS 'Línea del Plan Carabobo 200 asociada (opcional)';

-- ============================================================================
-- Paso 4: Triggers de auditoría (updated_at)
-- ============================================================================

CREATE TRIGGER trg_samc_ppp_updated_at
    BEFORE UPDATE ON samc.samc_politica_plan_patria
    FOR EACH ROW EXECUTE FUNCTION samc.set_updated_at();

CREATE TRIGGER trg_samc_ppc_updated_at
    BEFORE UPDATE ON samc.samc_politica_plan_carabobo
    FOR EACH ROW EXECUTE FUNCTION samc.set_updated_at();

CREATE TRIGGER trg_samc_ep_updated_at
    BEFORE UPDATE ON samc.samc_entidad_politica
    FOR EACH ROW EXECUTE FUNCTION samc.set_updated_at();

-- ============================================================================
-- Paso 5: Datos iniciales (copiados de poa_manager)
-- ============================================================================

INSERT INTO samc.samc_politica_plan_patria (id, codigo, descripcion, linea_estrategica, objetivo_nacional, is_active, created_at, updated_at) VALUES
    ('d224028d-2319-43d6-bf4f-e0929c752a3c', 'PP-001',
     'Construir una sociedad igualitaria y justa',
     'Plan de la Patria 2019-2025 - Objetivo Nacional 1',
     'Garantizar la suprema felicidad social',
     TRUE, '2026-06-19 13:01:18.319041-04', '2026-06-19 13:01:18.319041-04'),
    ('51e6e9e3-ad38-4ec3-8472-a20f4d2f280e', 'PP-002',
     'Desarrollar el poderío económico nacional',
     'Plan de la Patria 2019-2025 - Objetivo Nacional 2',
     'Construir un modelo económico productivo',
     TRUE, '2026-06-19 13:01:18.319041-04', '2026-06-19 13:01:18.319041-04'),
    ('02e910d9-c415-43bb-b5fd-94d8f7b525b4', 'PP-003',
     'Fortalecer el poder popular y la democracia',
     'Plan de la Patria 2019-2025 - Objetivo Nacional 3',
     'Profundizar la democracia protagónica',
     TRUE, '2026-06-19 13:01:18.319041-04', '2026-06-19 13:01:18.319041-04');

INSERT INTO samc.samc_politica_plan_carabobo (id, codigo, descripcion, linea_estrategica, is_active, created_at, updated_at) VALUES
    ('c29a8e79-33a7-44fa-91ff-c7ffc167d1f4', 'PC-001',
     'Plan Carabobo 200 - Línea de acción estratégica regional',
     'Estrategia regional de desarrollo integral',
     TRUE, '2026-06-19 13:01:18.319041-04', '2026-06-19 13:01:18.319041-04');

COMMIT;
