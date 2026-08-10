-- ============================================================================
-- 01_samc_schema.sql
-- Schema SAMC — Planificación Comercial CORPOELEC
--
-- Diseñado para PostgreSQL 17
-- ISO 8000: calidad de datos (CHECK, NOT NULL, tipos fuertes)
-- ISO 27001: auditoría centralizada, control de acceso
-- ============================================================================
-- Orden de ejecución: este script es auto-contenido, ejecutar una sola vez.
-- ============================================================================

BEGIN;

-- ============================================================================
-- SCHEMA
-- ============================================================================

DROP SCHEMA IF EXISTS samc CASCADE;
CREATE SCHEMA samc AUTHORIZATION fullstack001;

SET search_path TO samc;

-- Extensión para búsqueda textual difusa en urbanizaciones
CREATE EXTENSION IF NOT EXISTS pg_trgm SCHEMA samc;

-- ============================================================================
-- FUNCIONES HELPER
-- ============================================================================

-- Normaliza textos de urbanizaciones (corrige errores de codificación OCR)
CREATE OR REPLACE FUNCTION samc.normalize_text(input TEXT)
RETURNS TEXT
LANGUAGE plpgsql IMMUTABLE
AS $$
BEGIN
    RETURN UPPER(TRIM(REGEXP_REPLACE(
        REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(
            REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(
                input,
            '#', 'Ñ'),
            '▌', 'Á'),
            '▄', 'É'),
            '▌', 'Í'),
            '▄', 'Ó'),
            '▄', 'Ú'),
            '▄', 'Ü'),
            '\', ''),
            '\\\\', ''),
            'PE#ITA', 'PEÑITA'),
            'MA#ANA', 'MAÑANA'),
            'AC#A', 'ACÑA'),
            'NI#O', 'NIÑO'),
        '\s+', ' ', 'g'
    )));
END;
$$;

-- Trigger para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION samc.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

-- Trigger de auditoría centralizado (ISO 27001)
CREATE OR REPLACE FUNCTION samc.audit_trigger()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    _record_id UUID;
    _old_data JSONB;
    _new_data JSONB;
BEGIN
    IF TG_OP = 'DELETE' OR TG_OP = 'UPDATE' THEN
        _record_id = OLD.id;
        _old_data = to_jsonb(OLD);
    END IF;
    IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
        _record_id = COALESCE(NEW.id, _record_id);
        _new_data = to_jsonb(NEW);
    END IF;

    INSERT INTO samc.samc_audit_log (
        table_name, operation, record_id, old_data, new_data,
        executed_by, client_addr, session_id
    ) VALUES (
        TG_TABLE_NAME, TG_OP, _record_id, _old_data, _new_data,
        current_user,
        inet_client_addr(),
        substring(pg_backend_pid()::TEXT, 1, 32)
    );

    RETURN COALESCE(NEW, OLD);
END;
$$;

-- ============================================================================
-- CARACTERIZACIÓN GEOGRÁFICA (carac_*)
-- ============================================================================

-- 1. carac_region
DROP TABLE IF EXISTS samc.carac_region CASCADE;
CREATE TABLE samc.carac_region (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre      TEXT        NOT NULL,
    ambito      TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX idx_carac_region_nombre ON samc.carac_region (nombre);

-- 2. carac_estado
DROP TABLE IF EXISTS samc.carac_estado CASCADE;
CREATE TABLE samc.carac_estado (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre          TEXT        NOT NULL,
    abreviatura     VARCHAR(2),
    region_id       UUID        NOT NULL REFERENCES samc.carac_region(id)
                                ON DELETE RESTRICT ON UPDATE CASCADE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_carac_estado_nombre UNIQUE (nombre)
);

CREATE INDEX idx_carac_estado_region ON samc.carac_estado (region_id);

-- 3. carac_municipio
DROP TABLE IF EXISTS samc.carac_municipio CASCADE;
CREATE TABLE samc.carac_municipio (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre          TEXT        NOT NULL,
    estado_id       UUID        NOT NULL REFERENCES samc.carac_estado(id)
                                ON DELETE RESTRICT ON UPDATE CASCADE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_carac_municipio_estado ON samc.carac_municipio (estado_id);
CREATE UNIQUE INDEX idx_carac_municipio_nombre_estado ON samc.carac_municipio (nombre, estado_id);

-- 4. carac_parroquia
DROP TABLE IF EXISTS samc.carac_parroquia CASCADE;
CREATE TABLE samc.carac_parroquia (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre          TEXT        NOT NULL,
    municipio_id    UUID        NOT NULL REFERENCES samc.carac_municipio(id)
                                ON DELETE RESTRICT ON UPDATE CASCADE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_carac_parroquia_municipio ON samc.carac_parroquia (municipio_id);
CREATE UNIQUE INDEX idx_carac_parroquia_nombre_municipio ON samc.carac_parroquia (nombre, municipio_id);

-- 5. carac_urbanizacion
DROP TABLE IF EXISTS samc.carac_urbanizacion CASCADE;
CREATE TABLE samc.carac_urbanizacion (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre          TEXT        NOT NULL,
    parroquia_id    UUID        NOT NULL REFERENCES samc.carac_parroquia(id)
                                ON DELETE RESTRICT ON UPDATE CASCADE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_carac_urbanizacion_parroquia ON samc.carac_urbanizacion (parroquia_id);
CREATE INDEX idx_carac_urbanizacion_nombre_trgm ON samc.carac_urbanizacion
    USING GIN (nombre gin_trgm_ops);

-- Triggers updated_at para carac_*
CREATE TRIGGER trg_carac_region_updated_at
    BEFORE UPDATE ON samc.carac_region
    FOR EACH ROW EXECUTE FUNCTION samc.set_updated_at();

CREATE TRIGGER trg_carac_estado_updated_at
    BEFORE UPDATE ON samc.carac_estado
    FOR EACH ROW EXECUTE FUNCTION samc.set_updated_at();

CREATE TRIGGER trg_carac_municipio_updated_at
    BEFORE UPDATE ON samc.carac_municipio
    FOR EACH ROW EXECUTE FUNCTION samc.set_updated_at();

CREATE TRIGGER trg_carac_parroquia_updated_at
    BEFORE UPDATE ON samc.carac_parroquia
    FOR EACH ROW EXECUTE FUNCTION samc.set_updated_at();

CREATE TRIGGER trg_carac_urbanizacion_updated_at
    BEFORE UPDATE ON samc.carac_urbanizacion
    FOR EACH ROW EXECUTE FUNCTION samc.set_updated_at();

-- ============================================================================
-- DOMINIO DE NEGOCIO — TABLAS MAESTRO (samc_*)
-- ============================================================================

-- 6. samc_ente
DROP TABLE IF EXISTS samc.samc_ente CASCADE;
CREATE TABLE samc.samc_ente (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre      TEXT        NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_samc_ente_nombre UNIQUE (nombre)
);

-- 7. samc_proceso
DROP TABLE IF EXISTS samc.samc_proceso CASCADE;
CREATE TABLE samc.samc_proceso (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    ente_id     UUID        NOT NULL REFERENCES samc.samc_ente(id)
                            ON DELETE RESTRICT ON UPDATE CASCADE,
    nombre      TEXT        NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_samc_proceso_nombre UNIQUE (nombre)
);

CREATE INDEX idx_samc_proceso_ente ON samc.samc_proceso (ente_id);

-- 8. samc_gerencia_ambito
DROP TABLE IF EXISTS samc.samc_gerencia_ambito CASCADE;
CREATE TABLE samc.samc_gerencia_ambito (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre      TEXT        NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_samc_gerencia_ambito_nombre UNIQUE (nombre)
);

-- 9. samc_gerencia_nivel
DROP TABLE IF EXISTS samc.samc_gerencia_nivel CASCADE;
CREATE TABLE samc.samc_gerencia_nivel (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre      TEXT        NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_samc_gerencia_nivel_nombre UNIQUE (nombre)
);

-- 10. samc_ae_modo (Modo de Acción Específica)
DROP TABLE IF EXISTS samc.samc_ae_modo CASCADE;
CREATE TABLE samc.samc_ae_modo (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre      TEXT        NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_samc_ae_modo_nombre UNIQUE (nombre)
);

-- 11. samc_cargo
DROP TABLE IF EXISTS samc.samc_cargo CASCADE;
CREATE TABLE samc.samc_cargo (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre      TEXT        NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_samc_cargo_nombre UNIQUE (nombre)
);

-- 12. samc_rol
DROP TABLE IF EXISTS samc.samc_rol CASCADE;
CREATE TABLE samc.samc_rol (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre      TEXT        NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_samc_rol_nombre UNIQUE (nombre)
);

-- 13. samc_partida (Partida Presupuestaria)
DROP TABLE IF EXISTS samc.samc_partida CASCADE;
CREATE TABLE samc.samc_partida (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    codigo      TEXT        NOT NULL,
    nombre      TEXT        NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_samc_partida_codigo ON samc.samc_partida (codigo);

-- 14. samc_trimestre
DROP TABLE IF EXISTS samc.samc_trimestre CASCADE;
CREATE TABLE samc.samc_trimestre (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre      TEXT        NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_samc_trimestre_nombre UNIQUE (nombre)
);

-- 15. samc_mes
DROP TABLE IF EXISTS samc.samc_mes CASCADE;
CREATE TABLE samc.samc_mes (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    trimestre_id    UUID        NOT NULL REFERENCES samc.samc_trimestre(id)
                                ON DELETE RESTRICT ON UPDATE CASCADE,
    nombre          TEXT        NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_samc_mes_nombre UNIQUE (nombre)
);

CREATE INDEX idx_samc_mes_trimestre ON samc.samc_mes (trimestre_id);

-- 16. samc_gerencia
DROP TABLE IF EXISTS samc.samc_gerencia CASCADE;
CREATE TABLE samc.samc_gerencia (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    codigo          TEXT,
    ambito_id       UUID        REFERENCES samc.samc_gerencia_ambito(id)
                                ON DELETE RESTRICT ON UPDATE CASCADE,
    nivel_id        UUID        REFERENCES samc.samc_gerencia_nivel(id)
                                ON DELETE RESTRICT ON UPDATE CASCADE,
    nombre          TEXT        NOT NULL,
    nivel_gerencia  TEXT,       -- 1, 2, 3, 4 (jerarquía dentro del organigrama)
    nivel_sup       TEXT,       -- referencia al nivel superior
    ente_id         UUID        REFERENCES samc.samc_ente(id)
                                ON DELETE RESTRICT ON UPDATE CASCADE,
    region_id       UUID        REFERENCES samc.carac_region(id)
                                ON DELETE RESTRICT ON UPDATE CASCADE,
    estado_id       UUID        REFERENCES samc.carac_estado(id)
                                ON DELETE RESTRICT ON UPDATE CASCADE,
    proceso_id      UUID        REFERENCES samc.samc_proceso(id)
                                ON DELETE RESTRICT ON UPDATE CASCADE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_samc_gerencia_ambito ON samc.samc_gerencia (ambito_id);
CREATE INDEX idx_samc_gerencia_nivel ON samc.samc_gerencia (nivel_id);
CREATE INDEX idx_samc_gerencia_ente ON samc.samc_gerencia (ente_id);
CREATE INDEX idx_samc_gerencia_proceso ON samc.samc_gerencia (proceso_id);

-- 17. samc_poa (Plan Operativo Anual)
DROP TABLE IF EXISTS samc.samc_poa CASCADE;
CREATE TABLE samc.samc_poa (
    id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    codigo_sipes        VARCHAR(64),
    denominacion        TEXT        NOT NULL,
    ente_id             UUID        REFERENCES samc.samc_ente(id)
                                    ON DELETE RESTRICT ON UPDATE CASCADE,
    objetivo_especifico TEXT,
    periodo_ejecucion   TEXT,
    fecha_inicio        DATE        NOT NULL,
    fecha_termino       DATE        NOT NULL,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT chk_poa_fechas CHECK (fecha_inicio < fecha_termino)
);

CREATE INDEX idx_samc_poa_ente ON samc.samc_poa (ente_id);

-- 18. samc_poa_accion_especifica
DROP TABLE IF EXISTS samc.samc_poa_accion_especifica CASCADE;
CREATE TABLE samc.samc_poa_accion_especifica (
    id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    poa_id              UUID        NOT NULL REFERENCES samc.samc_poa(id)
                                    ON DELETE CASCADE ON UPDATE CASCADE,
    codigo              VARCHAR(10) NOT NULL,
    numero              VARCHAR(10),
    descripcion         TEXT        NOT NULL,
    fecha_inicio        DATE,
    fecha_culminacion   DATE,
    unidad_medida       TEXT,
    programado          NUMERIC(18,2) DEFAULT 0,
    ejecutado           NUMERIC(18,2) DEFAULT 0,
    restante            NUMERIC(18,2) DEFAULT 0,
    eficacia            NUMERIC(5,2) DEFAULT 0,
    modo_id             UUID        REFERENCES samc.samc_ae_modo(id)
                                    ON DELETE RESTRICT ON UPDATE CASCADE,
    observaciones       TEXT,
    gerencia_reporta_id UUID        REFERENCES samc.samc_gerencia(id)
                                    ON DELETE SET NULL ON UPDATE CASCADE,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT chk_accion_eficacia CHECK (eficacia >= 0 AND eficacia <= 100),
    CONSTRAINT chk_accion_fechas CHECK (
        fecha_culminacion IS NULL OR fecha_inicio IS NULL OR fecha_inicio < fecha_culminacion
    ),
    CONSTRAINT uq_accion_poa_codigo UNIQUE (poa_id, codigo)
);

CREATE INDEX idx_samc_accion_poa ON samc.samc_poa_accion_especifica (poa_id);
CREATE INDEX idx_samc_accion_modo ON samc.samc_poa_accion_especifica (modo_id);
CREATE INDEX idx_samc_accion_gerencia ON samc.samc_poa_accion_especifica (gerencia_reporta_id);

-- 19. samc_meta_fisica
DROP TABLE IF EXISTS samc.samc_meta_fisica CASCADE;
CREATE TABLE samc.samc_meta_fisica (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    acc_esp_id      UUID        NOT NULL REFERENCES samc.samc_poa_accion_especifica(id)
                                ON DELETE CASCADE ON UPDATE CASCADE,
    mes_id          UUID        NOT NULL REFERENCES samc.samc_mes(id)
                                ON DELETE RESTRICT ON UPDATE CASCADE,
    trimestre_id    UUID        REFERENCES samc.samc_trimestre(id)
                                ON DELETE RESTRICT ON UPDATE CASCADE,
    programado      NUMERIC(18,2) DEFAULT 0,
    ejecutado       NUMERIC(18,2) DEFAULT 0,
    eficacia        NUMERIC(5,2) DEFAULT 0,
    unidad_medida   TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT chk_meta_fisica_eficacia CHECK (eficacia >= 0 AND eficacia <= 100),
    CONSTRAINT uq_meta_fisica_accion_mes UNIQUE (acc_esp_id, mes_id)
);

CREATE INDEX idx_samc_meta_fisica_accion ON samc.samc_meta_fisica (acc_esp_id);
CREATE INDEX idx_samc_meta_fisica_mes ON samc.samc_meta_fisica (mes_id);
CREATE INDEX idx_samc_meta_fisica_trimestre ON samc.samc_meta_fisica (trimestre_id);

-- 20. samc_meta_financiera
DROP TABLE IF EXISTS samc.samc_meta_financiera CASCADE;
CREATE TABLE samc.samc_meta_financiera (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    acc_esp_id      UUID        NOT NULL REFERENCES samc.samc_poa_accion_especifica(id)
                                ON DELETE CASCADE ON UPDATE CASCADE,
    partida_id      UUID        NOT NULL REFERENCES samc.samc_partida(id)
                                ON DELETE RESTRICT ON UPDATE CASCADE,
    mes_id          UUID        NOT NULL REFERENCES samc.samc_mes(id)
                                ON DELETE RESTRICT ON UPDATE CASCADE,
    trimestre_id    UUID        REFERENCES samc.samc_trimestre(id)
                                ON DELETE RESTRICT ON UPDATE CASCADE,
    programado      NUMERIC(18,2) DEFAULT 0,
    ejecutado       NUMERIC(18,2) DEFAULT 0,
    eficacia        NUMERIC(5,2) DEFAULT 0,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT chk_meta_financiera_eficacia CHECK (eficacia >= 0 AND eficacia <= 100),
    CONSTRAINT uq_meta_financiera_accion_partida_mes UNIQUE (acc_esp_id, partida_id, mes_id)
);

CREATE INDEX idx_samc_meta_financiera_accion ON samc.samc_meta_financiera (acc_esp_id);
CREATE INDEX idx_samc_meta_financiera_partida ON samc.samc_meta_financiera (partida_id);
CREATE INDEX idx_samc_meta_financiera_mes ON samc.samc_meta_financiera (mes_id);
CREATE INDEX idx_samc_meta_financiera_trimestre ON samc.samc_meta_financiera (trimestre_id);

-- 21. samc_persona
DROP TABLE IF EXISTS samc.samc_persona CASCADE;
CREATE TABLE samc.samc_persona (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    cedula      TEXT        NOT NULL,
    nombres     TEXT        NOT NULL,
    apellidos   TEXT        NOT NULL,
    trab_cod    TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_samc_persona_cedula UNIQUE (cedula)
);

-- 22. samc_cargo_historico (trazabilidad de asignaciones)
DROP TABLE IF EXISTS samc.samc_cargo_historico CASCADE;
CREATE TABLE samc.samc_cargo_historico (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    persona_id      UUID        NOT NULL REFERENCES samc.samc_persona(id)
                                ON DELETE CASCADE ON UPDATE CASCADE,
    gerencia_id     UUID        REFERENCES samc.samc_gerencia(id)
                                ON DELETE RESTRICT ON UPDATE CASCADE,
    cargo_id        UUID        REFERENCES samc.samc_cargo(id)
                                ON DELETE RESTRICT ON UPDATE CASCADE,
    rol_id          UUID        REFERENCES samc.samc_rol(id)
                                ON DELETE RESTRICT ON UPDATE CASCADE,
    estado_id       UUID        REFERENCES samc.carac_estado(id)
                                ON DELETE RESTRICT ON UPDATE CASCADE,
    region_id       UUID        REFERENCES samc.carac_region(id)
                                ON DELETE RESTRICT ON UPDATE CASCADE,
    fecha_inicio    DATE        NOT NULL,
    fecha_fin       DATE,
    es_actual       BOOLEAN     NOT NULL DEFAULT true,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT chk_cargo_historico_fechas CHECK (fecha_fin IS NULL OR fecha_inicio < fecha_fin),
    CONSTRAINT chk_cargo_historico_actual CHECK (NOT (es_actual = true AND fecha_fin IS NOT NULL))
);

CREATE INDEX idx_samc_cargo_historico_persona ON samc.samc_cargo_historico (persona_id);
CREATE INDEX idx_samc_cargo_historico_gerencia ON samc.samc_cargo_historico (gerencia_id);
CREATE INDEX idx_samc_cargo_historico_actual ON samc.samc_cargo_historico (persona_id, es_actual)
    WHERE es_actual = true;

-- ============================================================================
-- AUDITORÍA ISO 27001
-- ============================================================================

DROP TABLE IF EXISTS samc.samc_audit_log CASCADE;
CREATE TABLE samc.samc_audit_log (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    table_name  TEXT        NOT NULL,
    operation   TEXT        NOT NULL,
    record_id   UUID        NOT NULL,
    old_data    JSONB,
    new_data    JSONB,
    executed_by TEXT        NOT NULL DEFAULT current_user,
    executed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    client_addr INET,
    session_id  TEXT
);

CREATE INDEX idx_audit_log_table ON samc.samc_audit_log (table_name);
CREATE INDEX idx_audit_log_time ON samc.samc_audit_log (executed_at DESC);
CREATE INDEX idx_audit_log_record ON samc.samc_audit_log (record_id);

-- Triggers de auditoría para tablas transaccionales
CREATE TRIGGER trg_audit_poa
    AFTER INSERT OR UPDATE OR DELETE ON samc.samc_poa
    FOR EACH ROW EXECUTE FUNCTION samc.audit_trigger();

CREATE TRIGGER trg_audit_accion
    AFTER INSERT OR UPDATE OR DELETE ON samc.samc_poa_accion_especifica
    FOR EACH ROW EXECUTE FUNCTION samc.audit_trigger();

CREATE TRIGGER trg_audit_meta_fisica
    AFTER INSERT OR UPDATE OR DELETE ON samc.samc_meta_fisica
    FOR EACH ROW EXECUTE FUNCTION samc.audit_trigger();

CREATE TRIGGER trg_audit_meta_financiera
    AFTER INSERT OR UPDATE OR DELETE ON samc.samc_meta_financiera
    FOR EACH ROW EXECUTE FUNCTION samc.audit_trigger();

CREATE TRIGGER trg_audit_persona
    AFTER INSERT OR UPDATE OR DELETE ON samc.samc_persona
    FOR EACH ROW EXECUTE FUNCTION samc.audit_trigger();

CREATE TRIGGER trg_audit_cargo_historico
    AFTER INSERT OR UPDATE OR DELETE ON samc.samc_cargo_historico
    FOR EACH ROW EXECUTE FUNCTION samc.audit_trigger();

-- Triggers updated_at para samc_*
CREATE TRIGGER trg_samc_ente_updated_at
    BEFORE UPDATE ON samc.samc_ente
    FOR EACH ROW EXECUTE FUNCTION samc.set_updated_at();

CREATE TRIGGER trg_samc_proceso_updated_at
    BEFORE UPDATE ON samc.samc_proceso
    FOR EACH ROW EXECUTE FUNCTION samc.set_updated_at();

CREATE TRIGGER trg_samc_gerencia_ambito_updated_at
    BEFORE UPDATE ON samc.samc_gerencia_ambito
    FOR EACH ROW EXECUTE FUNCTION samc.set_updated_at();

CREATE TRIGGER trg_samc_gerencia_nivel_updated_at
    BEFORE UPDATE ON samc.samc_gerencia_nivel
    FOR EACH ROW EXECUTE FUNCTION samc.set_updated_at();

CREATE TRIGGER trg_samc_ae_modo_updated_at
    BEFORE UPDATE ON samc.samc_ae_modo
    FOR EACH ROW EXECUTE FUNCTION samc.set_updated_at();

CREATE TRIGGER trg_samc_cargo_updated_at
    BEFORE UPDATE ON samc.samc_cargo
    FOR EACH ROW EXECUTE FUNCTION samc.set_updated_at();

CREATE TRIGGER trg_samc_rol_updated_at
    BEFORE UPDATE ON samc.samc_rol
    FOR EACH ROW EXECUTE FUNCTION samc.set_updated_at();

CREATE TRIGGER trg_samc_partida_updated_at
    BEFORE UPDATE ON samc.samc_partida
    FOR EACH ROW EXECUTE FUNCTION samc.set_updated_at();

CREATE TRIGGER trg_samc_trimestre_updated_at
    BEFORE UPDATE ON samc.samc_trimestre
    FOR EACH ROW EXECUTE FUNCTION samc.set_updated_at();

CREATE TRIGGER trg_samc_mes_updated_at
    BEFORE UPDATE ON samc.samc_mes
    FOR EACH ROW EXECUTE FUNCTION samc.set_updated_at();

CREATE TRIGGER trg_samc_gerencia_updated_at
    BEFORE UPDATE ON samc.samc_gerencia
    FOR EACH ROW EXECUTE FUNCTION samc.set_updated_at();

CREATE TRIGGER trg_samc_poa_updated_at
    BEFORE UPDATE ON samc.samc_poa
    FOR EACH ROW EXECUTE FUNCTION samc.set_updated_at();

CREATE TRIGGER trg_samc_accion_updated_at
    BEFORE UPDATE ON samc.samc_poa_accion_especifica
    FOR EACH ROW EXECUTE FUNCTION samc.set_updated_at();

CREATE TRIGGER trg_samc_meta_fisica_updated_at
    BEFORE UPDATE ON samc.samc_meta_fisica
    FOR EACH ROW EXECUTE FUNCTION samc.set_updated_at();

CREATE TRIGGER trg_samc_meta_financiera_updated_at
    BEFORE UPDATE ON samc.samc_meta_financiera
    FOR EACH ROW EXECUTE FUNCTION samc.set_updated_at();

CREATE TRIGGER trg_samc_persona_updated_at
    BEFORE UPDATE ON samc.samc_persona
    FOR EACH ROW EXECUTE FUNCTION samc.set_updated_at();

CREATE TRIGGER trg_samc_cargo_historico_updated_at
    BEFORE UPDATE ON samc.samc_cargo_historico
    FOR EACH ROW EXECUTE FUNCTION samc.set_updated_at();

-- ============================================================================
-- COMENTARIOS DE TABLA (documentación ISO 8000)
-- ============================================================================

COMMENT ON SCHEMA samc IS 'SAMC — Sistema de Administración y Monitoreo Comercial CORPOELEC';
COMMENT ON TABLE samc.carac_region IS 'Regiones geográficas de Venezuela (ámbito general, nacional, estatal)';
COMMENT ON TABLE samc.carac_estado IS 'Estados / Entidades Federales de Venezuela';
COMMENT ON TABLE samc.carac_municipio IS 'Municipios por estado';
COMMENT ON TABLE samc.carac_parroquia IS 'Parroquias por municipio';
COMMENT ON TABLE samc.carac_urbanizacion IS 'Urbanizaciones, sectores y barrios por parroquia';
COMMENT ON TABLE samc.samc_ente IS 'Entes corporativos (CORPOELEC y afiliadas)';
COMMENT ON TABLE samc.samc_proceso IS 'Procesos del negocio eléctrico (Generación, Transmisión, Distribución, Comercialización)';
COMMENT ON TABLE samc.samc_gerencia_ambito IS 'Ámbito de gerencia (GENERAL, NACIONAL, ESTATAL)';
COMMENT ON TABLE samc.samc_gerencia_nivel IS 'Nivel de gerencia (APOYO, SUSTANTIVO, GENERAL)';
COMMENT ON TABLE samc.samc_ae_modo IS 'Modo de acción específica (INCREMENTO, DISMINUCIÓN, CUMPLIMIENTO)';
COMMENT ON TABLE samc.samc_cargo IS 'Catálogo de cargos del personal';
COMMENT ON TABLE samc.samc_rol IS 'Roles funcionales del personal';
COMMENT ON TABLE samc.samc_partida IS 'Partidas presupuestarias (402, 403, 404, 405, 408)';
COMMENT ON TABLE samc.samc_trimestre IS 'Trimestres del año fiscal';
COMMENT ON TABLE samc.samc_mes IS 'Meses del año, asociados a su trimestre';
COMMENT ON TABLE samc.samc_gerencia IS 'Gerencias y coordinaciones del ente';
COMMENT ON TABLE samc.samc_poa IS 'Plan Operativo Anual';
COMMENT ON TABLE samc.samc_poa_accion_especifica IS 'Acciones específicas que componen un POA';
COMMENT ON TABLE samc.samc_meta_fisica IS 'Metas físicas mensuales por acción específica';
COMMENT ON TABLE samc.samc_meta_financiera IS 'Metas financieras mensuales por acción y partida';
COMMENT ON TABLE samc.samc_persona IS 'Personas / trabajadores del ente';
COMMENT ON TABLE samc.samc_cargo_historico IS 'Histórico de asignaciones de cargo, gerencia, rol y ubicación del personal';
COMMENT ON TABLE samc.samc_audit_log IS 'Registro de auditoría ISO 27001 para cambios en datos transaccionales';

-- ============================================================================
-- PERMISOS MÍNIMO PRIVILEGIO
-- ============================================================================

REVOKE ALL ON ALL TABLES IN SCHEMA samc FROM PUBLIC;
GRANT USAGE ON SCHEMA samc TO fullstack001;
GRANT ALL ON ALL TABLES IN SCHEMA samc TO fullstack001;

-- ============================================================================
-- FIN
-- ============================================================================

COMMIT;
