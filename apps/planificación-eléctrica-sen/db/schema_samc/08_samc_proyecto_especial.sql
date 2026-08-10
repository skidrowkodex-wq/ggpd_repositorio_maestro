-- ============================================================================
-- 08_samc_proyecto_especial.sql
-- Proyectos Especiales PRTSEN y Catálogo de Infraestructura Eléctrica
--
-- Modelo: Proyectos PRTSEN (transversales al POA) vinculados a activos
-- de la red eléctrica: subestaciones, plantas de generación, circuitos.
-- ============================================================================
-- Orden: catálogo infraestructura → proyecto especial → relaciones → financiero
-- ============================================================================

BEGIN;

SET search_path TO samc;

-- ============================================================================
-- Paso 1: Catálogo de Subestaciones (Transmisión y Distribución)
-- ============================================================================

CREATE TABLE samc.samc_subestacion (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    codigo          VARCHAR(20) NOT NULL UNIQUE,
    nombre          TEXT NOT NULL,
    tipo            VARCHAR(20) NOT NULL DEFAULT 'DISTRIBUCION',
    nivel_tension   VARCHAR(20),
    estado_id       UUID REFERENCES samc.carac_estado(id) ON DELETE RESTRICT,
    municipio_id    UUID REFERENCES samc.carac_municipio(id) ON DELETE RESTRICT,
    ubicacion       TEXT,
    latitud         NUMERIC(10,7),
    longitud        NUMERIC(10,7),
    activo          BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT chk_subestacion_tipo CHECK (tipo IN ('TRANSMISION', 'DISTRIBUCION', 'MIXTA'))
);

CREATE INDEX idx_subestacion_estado ON samc.samc_subestacion(estado_id);
CREATE INDEX idx_subestacion_municipio ON samc.samc_subestacion(municipio_id);
CREATE INDEX idx_subestacion_tipo ON samc.samc_subestacion(tipo);

COMMENT ON TABLE  samc.samc_subestacion IS 'Catálogo de subestaciones eléctricas (transmisión, distribución o mixtas)';
COMMENT ON COLUMN samc.samc_subestacion.codigo        IS 'Código único de la subestación (ej. SE-AN-220)';
COMMENT ON COLUMN samc.samc_subestacion.tipo          IS 'TRANSMISION, DISTRIBUCION o MIXTA';
COMMENT ON COLUMN samc.samc_subestacion.nivel_tension IS 'Nivel de tensión en kV (ej. 220, 115, 34.5, 13.8)';

-- ============================================================================
-- Paso 2: Catálogo de Plantas de Generación
-- ============================================================================

CREATE TABLE samc.samc_planta_generacion (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    codigo          VARCHAR(20) NOT NULL UNIQUE,
    nombre          TEXT NOT NULL,
    tipo            VARCHAR(20) NOT NULL DEFAULT 'TERMOELECTRICA',
    capacidad_mw    NUMERIC(10,2),
    estado_id       UUID REFERENCES samc.carac_estado(id) ON DELETE RESTRICT,
    municipio_id    UUID REFERENCES samc.carac_municipio(id) ON DELETE RESTRICT,
    ubicacion       TEXT,
    latitud         NUMERIC(10,7),
    longitud        NUMERIC(10,7),
    activo          BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT chk_planta_tipo CHECK (tipo IN ('HIDROELECTRICA', 'TERMOELECTRICA', 'EOLICA', 'SOLAR', 'NUCLEAR', 'OTRO'))
);

CREATE INDEX idx_planta_estado ON samc.samc_planta_generacion(estado_id);
CREATE INDEX idx_planta_municipio ON samc.samc_planta_generacion(municipio_id);
CREATE INDEX idx_planta_tipo ON samc.samc_planta_generacion(tipo);

COMMENT ON TABLE  samc.samc_planta_generacion IS 'Catálogo de plantas de generación eléctrica';
COMMENT ON COLUMN samc.samc_planta_generacion.codigo       IS 'Código único de la planta (ej. PL-TACOA)';
COMMENT ON COLUMN samc.samc_planta_generacion.tipo         IS 'HIDROELECTRICA, TERMOELECTRICA, EOLICA, SOLAR, NUCLEAR, OTRO';
COMMENT ON COLUMN samc.samc_planta_generacion.capacidad_mw IS 'Capacidad instalada en megavatios (MW)';

-- ============================================================================
-- Paso 3: Catálogo de Circuitos (Transmisión y Distribución)
-- ============================================================================

CREATE TABLE samc.samc_circuito (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    codigo              VARCHAR(20) NOT NULL UNIQUE,
    nombre              TEXT NOT NULL,
    tipo                VARCHAR(20) NOT NULL DEFAULT 'DISTRIBUCION',
    nivel_tension       VARCHAR(20),
    subestacion_origen_id UUID REFERENCES samc.samc_subestacion(id) ON DELETE RESTRICT,
    subestacion_destino_id UUID REFERENCES samc.samc_subestacion(id) ON DELETE RESTRICT,
    longitud_km         NUMERIC(10,2),
    estado_id           UUID REFERENCES samc.carac_estado(id) ON DELETE RESTRICT,
    activo              BOOLEAN NOT NULL DEFAULT TRUE,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT chk_circuito_tipo CHECK (tipo IN ('TRANSMISION', 'DISTRIBUCION'))
);

CREATE INDEX idx_circuito_estado ON samc.samc_circuito(estado_id);
CREATE INDEX idx_circuito_origen ON samc.samc_circuito(subestacion_origen_id);
CREATE INDEX idx_circuito_destino ON samc.samc_circuito(subestacion_destino_id);
CREATE INDEX idx_circuito_tipo ON samc.samc_circuito(tipo);

COMMENT ON TABLE  samc.samc_circuito IS 'Catálogo de circuitos de transmisión y distribución';
COMMENT ON COLUMN samc.samc_circuito.codigo               IS 'Código único del circuito (ej. CTO-AN-001)';
COMMENT ON COLUMN samc.samc_circuito.tipo                 IS 'TRANSMISION o DISTRIBUCION';
COMMENT ON COLUMN samc.samc_circuito.nivel_tension        IS 'Nivel de tensión en kV';
COMMENT ON COLUMN samc.samc_circuito.subestacion_origen_id IS 'Subestación de origen del circuito';
COMMENT ON COLUMN samc.samc_circuito.subestacion_destino_id IS 'Subestación de destino (NULL si es radial)';
COMMENT ON COLUMN samc.samc_circuito.longitud_km          IS 'Longitud total del circuito en kilómetros';

-- ============================================================================
-- Paso 4: samc_proyecto_especial (PRTSEN)
-- ============================================================================

CREATE TABLE samc.samc_proyecto_especial (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    codigo              VARCHAR(20) NOT NULL UNIQUE,
    nombre              TEXT NOT NULL,
    descripcion         TEXT,
    ambito              VARCHAR(20) NOT NULL DEFAULT 'MIXTO',
    tipo_proyecto       VARCHAR(30) NOT NULL DEFAULT 'PRTSEN',
    gerencia_id         UUID REFERENCES samc.samc_gerencia(id) ON DELETE RESTRICT,
    proceso_id          UUID REFERENCES samc.samc_proceso(id) ON DELETE RESTRICT,
    ente_id             UUID REFERENCES samc.samc_ente(id) ON DELETE RESTRICT,
    fecha_inicio        DATE NOT NULL,
    fecha_culminacion   DATE,
    estatus             VARCHAR(20) NOT NULL DEFAULT 'PLANIFICADO',
    monto_total_bs      NUMERIC(18,2),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT chk_proyecto_ambito CHECK (ambito IN ('ESTADAL', 'SUBESTACION', 'PLANTA', 'CIRCUITO', 'MIXTO')),
    CONSTRAINT chk_proyecto_tipo CHECK (tipo_proyecto IN ('PRTSEN', 'ESPECIAL', 'INVERSION', 'DESARROLLO', 'REHABILITACION', 'OTRO')),
    CONSTRAINT chk_proyecto_estatus CHECK (estatus IN ('PLANIFICADO', 'EJECUCION', 'FINALIZADO', 'SUSPENDIDO', 'CANCELADO')),
    CONSTRAINT chk_proyecto_fechas CHECK (fecha_culminacion IS NULL OR fecha_inicio < fecha_culminacion)
);

CREATE INDEX idx_proyecto_gerencia ON samc.samc_proyecto_especial(gerencia_id);
CREATE INDEX idx_proyecto_proceso ON samc.samc_proyecto_especial(proceso_id);
CREATE INDEX idx_proyecto_ente ON samc.samc_proyecto_especial(ente_id);
CREATE INDEX idx_proyecto_estatus ON samc.samc_proyecto_especial(estatus);
CREATE INDEX idx_proyecto_ambito ON samc.samc_proyecto_especial(ambito);

COMMENT ON TABLE  samc.samc_proyecto_especial IS 'Proyectos PRTSEN y especiales transversales al POA';
COMMENT ON COLUMN samc.samc_proyecto_especial.codigo        IS 'Código único del proyecto (ej. PRTSEN-2025-001)';
COMMENT ON COLUMN samc.samc_proyecto_especial.ambito        IS 'ESTADAL, SUBESTACION, PLANTA, CIRCUITO o MIXTO';
COMMENT ON COLUMN samc.samc_proyecto_especial.tipo_proyecto IS 'PRTSEN, ESPECIAL, INVERSION, DESARROLLO, REHABILITACION, OTRO';
COMMENT ON COLUMN samc.samc_proyecto_especial.estatus       IS 'PLANIFICADO, EJECUCION, FINALIZADO, SUSPENDIDO, CANCELADO';
COMMENT ON COLUMN samc.samc_proyecto_especial.monto_total_bs IS 'Monto total del proyecto en Bs. (referencia, se concilia contra POA)';

-- ============================================================================
-- Paso 5: Relaciones M:N — Proyecto ↔ Infraestructura
-- ============================================================================

CREATE TABLE samc.samc_proyecto_especial_subestacion (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    proyecto_especial_id UUID NOT NULL REFERENCES samc.samc_proyecto_especial(id) ON DELETE CASCADE,
    subestacion_id      UUID NOT NULL REFERENCES samc.samc_subestacion(id) ON DELETE CASCADE,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(proyecto_especial_id, subestacion_id)
);

CREATE INDEX idx_pe_subestacion_pe ON samc.samc_proyecto_especial_subestacion(proyecto_especial_id);
CREATE INDEX idx_pe_subestacion_sub ON samc.samc_proyecto_especial_subestacion(subestacion_id);

COMMENT ON TABLE samc.samc_proyecto_especial_subestacion IS 'Subestaciones impactadas por un proyecto PRTSEN';

CREATE TABLE samc.samc_proyecto_especial_planta (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    proyecto_especial_id UUID NOT NULL REFERENCES samc.samc_proyecto_especial(id) ON DELETE CASCADE,
    planta_id           UUID NOT NULL REFERENCES samc.samc_planta_generacion(id) ON DELETE CASCADE,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(proyecto_especial_id, planta_id)
);

CREATE INDEX idx_pe_planta_pe ON samc.samc_proyecto_especial_planta(proyecto_especial_id);
CREATE INDEX idx_pe_planta_pl ON samc.samc_proyecto_especial_planta(planta_id);

COMMENT ON TABLE samc.samc_proyecto_especial_planta IS 'Plantas de generación impactadas por un proyecto PRTSEN';

CREATE TABLE samc.samc_proyecto_especial_circuito (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    proyecto_especial_id UUID NOT NULL REFERENCES samc.samc_proyecto_especial(id) ON DELETE CASCADE,
    circuito_id         UUID NOT NULL REFERENCES samc.samc_circuito(id) ON DELETE CASCADE,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(proyecto_especial_id, circuito_id)
);

CREATE INDEX idx_pe_circuito_pe ON samc.samc_proyecto_especial_circuito(proyecto_especial_id);
CREATE INDEX idx_pe_circuito_ci ON samc.samc_proyecto_especial_circuito(circuito_id);

COMMENT ON TABLE samc.samc_proyecto_especial_circuito IS 'Circuitos impactados por un proyecto PRTSEN';

-- ============================================================================
-- Paso 6: Relación M:N — Proyecto ↔ Estado (ámbito estadal)
-- ============================================================================

CREATE TABLE samc.samc_proyecto_especial_estado (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    proyecto_especial_id UUID NOT NULL REFERENCES samc.samc_proyecto_especial(id) ON DELETE CASCADE,
    estado_id           UUID NOT NULL REFERENCES samc.carac_estado(id) ON DELETE CASCADE,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(proyecto_especial_id, estado_id)
);

CREATE INDEX idx_pe_estado_pe ON samc.samc_proyecto_especial_estado(proyecto_especial_id);
CREATE INDEX idx_pe_estado_es ON samc.samc_proyecto_especial_estado(estado_id);

COMMENT ON TABLE samc.samc_proyecto_especial_estado IS 'Estados impactados por proyectos PRTSEN de ámbito estadal';

-- ============================================================================
-- Paso 7: Relación M:N — Proyecto ↔ Acción Específica POA
-- ============================================================================

CREATE TABLE samc.samc_proyecto_especial_poa_accion (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    proyecto_especial_id UUID NOT NULL REFERENCES samc.samc_proyecto_especial(id) ON DELETE CASCADE,
    acc_esp_id          UUID NOT NULL REFERENCES samc.samc_poa_accion_especifica(id) ON DELETE CASCADE,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(proyecto_especial_id, acc_esp_id)
);

CREATE INDEX idx_pe_poa_pe ON samc.samc_proyecto_especial_poa_accion(proyecto_especial_id);
CREATE INDEX idx_pe_poa_acc ON samc.samc_proyecto_especial_poa_accion(acc_esp_id);

COMMENT ON TABLE samc.samc_proyecto_especial_poa_accion IS 'Vinculación M:N entre proyectos PRTSEN y acciones específicas del POA';

-- ============================================================================
-- Paso 8: samc_proyecto_especial_financiero — Seguimiento financiero mensual
-- Replica el modelo de samc_meta_financiera con 3 escenarios + ejecutado
-- ============================================================================

CREATE TABLE samc.samc_proyecto_especial_financiero (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    proyecto_especial_id UUID NOT NULL REFERENCES samc.samc_proyecto_especial(id) ON DELETE CASCADE,
    mes_id              UUID NOT NULL REFERENCES samc.samc_mes(id) ON DELETE RESTRICT,
    partida_id          UUID NOT NULL REFERENCES samc.samc_partida(id) ON DELETE RESTRICT,
    partida_elemento_id UUID REFERENCES samc.samc_partida_elemento(id) ON DELETE RESTRICT,
    programado          NUMERIC(18,2) DEFAULT 0,
    ajustado            NUMERIC(18,2),
    asignado            NUMERIC(18,2),
    ejecutado           NUMERIC(18,2) DEFAULT 0,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_pe_financiero_mes UNIQUE (proyecto_especial_id, mes_id, partida_id, partida_elemento_id),
    CONSTRAINT chk_pe_fin_ejecutado_no_excede CHECK (
        ejecutado >= 0 AND ejecutado <= GREATEST(COALESCE(programado, 0), COALESCE(asignado, 0), COALESCE(ajustado, 0))
    ),
    CONSTRAINT chk_pe_fin_ajustado_no_menor CHECK (
        ajustado IS NULL OR programado IS NULL OR ajustado >= programado
    )
);

CREATE INDEX idx_pe_financiero_proyecto ON samc.samc_proyecto_especial_financiero(proyecto_especial_id);
CREATE INDEX idx_pe_financiero_mes ON samc.samc_proyecto_especial_financiero(mes_id);
CREATE INDEX idx_pe_financiero_partida ON samc.samc_proyecto_especial_financiero(partida_id);

COMMENT ON TABLE  samc.samc_proyecto_especial_financiero IS 'Metas financieras mensuales por proyecto PRTSEN y partida';
COMMENT ON COLUMN samc.samc_proyecto_especial_financiero.programado IS 'Bs. SOLICITADO';
COMMENT ON COLUMN samc.samc_proyecto_especial_financiero.ajustado   IS 'Bs. AJUSTADO MPPP';
COMMENT ON COLUMN samc.samc_proyecto_especial_financiero.asignado   IS 'Bs. ASIGNADO';
COMMENT ON COLUMN samc.samc_proyecto_especial_financiero.ejecutado  IS 'Bs. realmente ejecutado';

-- ============================================================================
-- Paso 9: samc_proyecto_especial_financiero_moneda — Multimoneda
-- Replica el modelo de samc_meta_financiera_moneda
-- ============================================================================

CREATE TABLE samc.samc_proyecto_especial_financiero_moneda (
    id                              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pe_financiero_id                UUID NOT NULL REFERENCES samc.samc_proyecto_especial_financiero(id) ON DELETE CASCADE,
    moneda_id                       UUID NOT NULL REFERENCES samc.samc_moneda(id) ON DELETE RESTRICT,
    monto_solicitado                NUMERIC(18,2) NOT NULL DEFAULT 0,
    monto_ajustado                  NUMERIC(18,2) NOT NULL DEFAULT 0,
    monto_asignado                  NUMERIC(18,2),
    monto_ejecutado                 NUMERIC(18,2),
    tasa_oficial_bs                 NUMERIC(14,4) NOT NULL,
    tasa_ministerio_bs              NUMERIC(14,4) NOT NULL,
    created_at                      TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(pe_financiero_id, moneda_id)
);

CREATE INDEX idx_pe_fin_moneda_pe ON samc.samc_proyecto_especial_financiero_moneda(pe_financiero_id);
CREATE INDEX idx_pe_fin_moneda_mon ON samc.samc_proyecto_especial_financiero_moneda(moneda_id);

COMMENT ON TABLE  samc.samc_proyecto_especial_financiero_moneda IS 'Montos en moneda extranjera por meta financiera del proyecto';
COMMENT ON COLUMN samc.samc_proyecto_especial_financiero_moneda.monto_solicitado   IS 'USD/EUR solicitado';
COMMENT ON COLUMN samc.samc_proyecto_especial_financiero_moneda.monto_ajustado     IS 'USD/EUR ajustado MPPP';
COMMENT ON COLUMN samc.samc_proyecto_especial_financiero_moneda.monto_asignado     IS 'USD/EUR asignado';
COMMENT ON COLUMN samc.samc_proyecto_especial_financiero_moneda.monto_ejecutado    IS 'USD/EUR realmente ejecutado';
COMMENT ON COLUMN samc.samc_proyecto_especial_financiero_moneda.tasa_oficial_bs    IS 'Tasa BCV';
COMMENT ON COLUMN samc.samc_proyecto_especial_financiero_moneda.tasa_ministerio_bs IS 'Tasa MPPP';

-- ============================================================================
-- Paso 10: Triggers updated_at
-- ============================================================================

CREATE TRIGGER trg_samc_subestacion_updated_at
    BEFORE UPDATE ON samc.samc_subestacion
    FOR EACH ROW EXECUTE FUNCTION samc.set_updated_at();

CREATE TRIGGER trg_samc_planta_generacion_updated_at
    BEFORE UPDATE ON samc.samc_planta_generacion
    FOR EACH ROW EXECUTE FUNCTION samc.set_updated_at();

CREATE TRIGGER trg_samc_circuito_updated_at
    BEFORE UPDATE ON samc.samc_circuito
    FOR EACH ROW EXECUTE FUNCTION samc.set_updated_at();

CREATE TRIGGER trg_samc_proyecto_especial_updated_at
    BEFORE UPDATE ON samc.samc_proyecto_especial
    FOR EACH ROW EXECUTE FUNCTION samc.set_updated_at();

CREATE TRIGGER trg_samc_pe_financiero_updated_at
    BEFORE UPDATE ON samc.samc_proyecto_especial_financiero
    FOR EACH ROW EXECUTE FUNCTION samc.set_updated_at();

-- ============================================================================
-- Paso 11: Triggers de auditoría (ISO 27001)
-- ============================================================================

CREATE TRIGGER trg_audit_proyecto_especial
    AFTER INSERT OR UPDATE OR DELETE ON samc.samc_proyecto_especial
    FOR EACH ROW EXECUTE FUNCTION samc.audit_trigger();

CREATE TRIGGER trg_audit_pe_financiero
    AFTER INSERT OR UPDATE OR DELETE ON samc.samc_proyecto_especial_financiero
    FOR EACH ROW EXECUTE FUNCTION samc.audit_trigger();

-- ============================================================================
-- Paso 12: Vistas de conciliación
-- ============================================================================

-- Vista: concilia el total financiero del proyecto contra la suma de sus
-- acciones POA vinculadas (a través de samc_meta_financiera)
CREATE VIEW samc.v_conciliacion_proyecto_poa AS
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

COMMENT ON VIEW samc.v_conciliacion_proyecto_poa IS 'Concilia montos del proyecto PRTSEN contra la suma de metas financieras de sus acciones POA vinculadas. diff != 0 indica desfase.';

-- ============================================================================
-- Paso 13: Permisos mínimo privilegio
-- ============================================================================

GRANT ALL ON ALL TABLES IN SCHEMA samc TO fullstack001;

-- ============================================================================
-- FIN
-- ============================================================================

COMMIT;
