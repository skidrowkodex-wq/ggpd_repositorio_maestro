-- ============================================================================
-- 04_samc_empresa.sql
-- Tabla samc_empresa (jerarquía superior a samc_ente) + normalización
-- ============================================================================
-- Orden: CREATE empresa → ALTER ente → seed → actualizar FK
-- ============================================================================

BEGIN;

-- ============================================================================
-- Paso 1: samc_empresa
-- ============================================================================
CREATE TABLE samc.samc_empresa (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    codigo            VARCHAR(20) NOT NULL UNIQUE,
    nombre            TEXT NOT NULL,
    siglas            VARCHAR(20),
    rif               VARCHAR(20),
    tipo              TEXT NOT NULL DEFAULT 'PUBLIC',
    clase             TEXT NOT NULL DEFAULT 'EMPRESA',
    pais              VARCHAR(2) NOT NULL DEFAULT 'VE',
    direccion         TEXT,
    telefono          VARCHAR(50),
    email             VARCHAR(255),
    website           VARCHAR(255),
    activo            BOOLEAN NOT NULL DEFAULT TRUE,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT chk_empresa_tipo CHECK (tipo IN ('PUBLIC', 'PRIVATE', 'MIXED', 'JOINT_VENTURE', 'OTHER')),
    CONSTRAINT chk_empresa_clase CHECK (clase IN ('MINISTERIO', 'EMPRESA', 'FUNDACION', 'INSTITUTO', 'CORPORACION', 'OTHER'))
);

CREATE INDEX idx_empresa_tipo ON samc.samc_empresa(tipo);
CREATE INDEX idx_empresa_clase ON samc.samc_empresa(clase);

COMMENT ON TABLE  samc.samc_empresa IS 'Empresas públicas, privadas, mixtas, joint ventures. Nivel jerárquico superior a samc_ente';
COMMENT ON COLUMN samc.samc_empresa.codigo  IS 'Código único corto (ej. MPPEE, PDVSA)';
COMMENT ON COLUMN samc.samc_empresa.siglas  IS 'Siglas o acrónimo';
COMMENT ON COLUMN samc.samc_empresa.rif     IS 'Registro de Información Fiscal (RIF)';
COMMENT ON COLUMN samc.samc_empresa.tipo    IS 'PUBLIC, PRIVATE, MIXED, JOINT_VENTURE, OTHER';
COMMENT ON COLUMN samc.samc_empresa.clase   IS 'MINISTERIO, EMPRESA, FUNDACION, INSTITUTO, CORPORACION, OTHER';
COMMENT ON COLUMN samc.samc_empresa.pais    IS 'Código ISO 3166-1 alpha-2 del país';

-- ============================================================================
-- Paso 2: Normalizar samc_ente — agregar codigo, siglas, rif, empresa_id
-- ============================================================================
ALTER TABLE samc.samc_ente
    ADD COLUMN codigo      VARCHAR(20),
    ADD COLUMN siglas      VARCHAR(20),
    ADD COLUMN rif         VARCHAR(20),
    ADD COLUMN empresa_id  UUID;

ALTER TABLE samc.samc_ente
    ADD CONSTRAINT uq_ente_codigo UNIQUE (codigo);

CREATE INDEX idx_ente_empresa ON samc.samc_ente(empresa_id);

COMMENT ON COLUMN samc.samc_ente.codigo     IS 'Código corto único del ente (ej. CORPOELEC)';
COMMENT ON COLUMN samc.samc_ente.siglas     IS 'Siglas del ente';
COMMENT ON COLUMN samc.samc_ente.rif        IS 'Registro de Información Fiscal';
COMMENT ON COLUMN samc.samc_ente.empresa_id IS 'Empresa a la que pertenece este ente';

-- ============================================================================
-- Paso 3: Seed — empresa MPPEE
-- ============================================================================
INSERT INTO samc.samc_empresa (codigo, nombre, siglas, tipo, clase, pais)
VALUES (
    'MPPEE',
    'Ministerio del Poder Popular Para la Energía Eléctrica',
    'MPPEE',
    'PUBLIC',
    'MINISTERIO',
    'VE'
);

-- ============================================================================
-- Paso 4: Vincular CORPOELEC al MPPEE
-- ============================================================================
UPDATE samc.samc_ente
SET
    codigo     = 'CORPOELEC',
    siglas     = 'CORPOELEC',
    rif        = 'G-20000700-0',
    empresa_id = (SELECT id FROM samc.samc_empresa WHERE codigo = 'MPPEE')
WHERE nombre ILIKE '%CORPOELEC%';

-- ============================================================================
-- Paso 5: Agregar FK + NOT NULL después de migrar datos
-- ============================================================================
ALTER TABLE samc.samc_ente
    ADD CONSTRAINT samc_ente_empresa_id_fkey
        FOREIGN KEY (empresa_id) REFERENCES samc.samc_empresa(id)
        ON UPDATE CASCADE ON DELETE RESTRICT;

ALTER TABLE samc.samc_ente
    ALTER COLUMN empresa_id SET NOT NULL,
    ALTER COLUMN codigo SET NOT NULL;

-- ============================================================================
-- Paso 6: Triggers
-- ============================================================================
CREATE TRIGGER trg_samc_empresa_updated_at
    BEFORE UPDATE ON samc.samc_empresa
    FOR EACH ROW EXECUTE FUNCTION samc.set_updated_at();

COMMIT;
