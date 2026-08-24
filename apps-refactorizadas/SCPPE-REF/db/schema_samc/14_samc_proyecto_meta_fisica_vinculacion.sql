-- ============================================================================
-- 14_samc_proyecto_meta_fisica_vinculacion.sql
-- Nuevas tablas para proyectos plurianuales
--  - samc_proyecto_meta_fisica: metas físicas del proyecto (mes × año)
--  - samc_proyecto_vinculacion_poa: vinculación temporal proyecto→POA acción
--  - función proyectos_huerfanos(anio)
-- ============================================================================

BEGIN;

SET search_path TO samc;

-- ============================================================================
-- Paso 1: Tabla de metas físicas del proyecto
-- ============================================================================

CREATE TABLE samc.samc_proyecto_meta_fisica (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    proyecto_id       UUID NOT NULL REFERENCES samc.samc_proyecto_especial(id) ON DELETE CASCADE,
    mes_id            UUID NOT NULL REFERENCES samc.samc_mes(id),
    anio              INTEGER NOT NULL,
    programado        NUMERIC(18,2) NOT NULL DEFAULT 0,
    ejecutado         NUMERIC(18,2) NOT NULL DEFAULT 0,
    unidad_medida     TEXT,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_proyecto_meta_fisica UNIQUE (proyecto_id, mes_id, anio)
);

CREATE INDEX idx_pmf_proyecto_anio ON samc.samc_proyecto_meta_fisica(proyecto_id, anio);

-- Eficacia GENERATED para proyecto_meta_fisica
ALTER TABLE samc.samc_proyecto_meta_fisica
    ADD COLUMN eficacia NUMERIC(5,2)
    GENERATED ALWAYS AS (
        CASE WHEN programado > 0
             THEN LEAST((ejecutado / programado) * 100, 100)
             ELSE 0
        END
    ) STORED;

-- ============================================================================
-- Paso 2: Vinculación temporal proyecto ↔ POA acción
-- Reemplaza funcionalmente a samc_proyecto_especial_poa_accion
-- con soporte plurianual, activo/inactivo y monto_aporte
-- ============================================================================

CREATE TABLE samc.samc_proyecto_vinculacion_poa (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    proyecto_id       UUID NOT NULL REFERENCES samc.samc_proyecto_especial(id) ON DELETE CASCADE,
    poa_id            UUID NOT NULL REFERENCES samc.samc_poa(id) ON DELETE CASCADE,
    acc_esp_id        UUID NOT NULL REFERENCES samc.samc_poa_accion_especifica(id) ON DELETE CASCADE,
    anio              INTEGER NOT NULL,
    activo            BOOLEAN NOT NULL DEFAULT TRUE,
    monto_aporte      NUMERIC(18,2) NOT NULL DEFAULT 0,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_vinculacion_poa UNIQUE (proyecto_id, poa_id, acc_esp_id, anio)
);

CREATE INDEX idx_vp_proyecto ON samc.samc_proyecto_vinculacion_poa(proyecto_id);
CREATE INDEX idx_vp_poa ON samc.samc_proyecto_vinculacion_poa(poa_id);
CREATE INDEX idx_vp_activo_anio ON samc.samc_proyecto_vinculacion_poa(activo, anio);

-- ============================================================================
-- Paso 3: Migrar datos existentes desde la tabla antigua
-- ============================================================================

INSERT INTO samc.samc_proyecto_vinculacion_poa (proyecto_id, poa_id, acc_esp_id, anio, activo, monto_aporte)
SELECT
    pepa.proyecto_especial_id,
    ae.poa_id,
    pepa.acc_esp_id,
    EXTRACT(YEAR FROM COALESCE(p.fecha_inicio, NOW()))::INTEGER AS anio,
    TRUE AS activo,
    0 AS monto_aporte
FROM samc.samc_proyecto_especial_poa_accion pepa
JOIN samc.samc_poa_accion_especifica ae ON ae.id = pepa.acc_esp_id
JOIN samc.samc_poa p ON p.id = ae.poa_id
ON CONFLICT (proyecto_id, poa_id, acc_esp_id, anio) DO NOTHING;

-- ============================================================================
-- Paso 4: Función proyectos_huerfanos(anio)
-- Retorna proyectos con fecha activa en el año dado pero sin vinculación
-- activa a ningún POA en ese año.
-- ============================================================================

CREATE OR REPLACE FUNCTION samc.proyectos_huerfanos(p_anio INTEGER DEFAULT EXTRACT(YEAR FROM NOW())::INTEGER)
RETURNS TABLE(
    proyecto_id   UUID,
    codigo        VARCHAR(40),
    nombre        TEXT,
    fecha_inicio  DATE,
    fecha_culminacion DATE,
    estatus       VARCHAR(30),
    monto_total_bs NUMERIC(18,2),
    poa_previo_id      UUID,
    poa_previo_nombre  TEXT,
    ultima_vinculacion INTEGER
)
LANGUAGE SQL
STABLE
AS $$
    SELECT
        pe.id,
        pe.codigo,
        pe.nombre,
        pe.fecha_inicio,
        pe.fecha_culminacion,
        pe.estatus,
        pe.monto_total_bs,
        vp.poa_id AS poa_previo_id,
        poa_prev.denominacion AS poa_previo_nombre,
        vp.anio AS ultima_vinculacion
    FROM samc.samc_proyecto_especial pe
    CROSS JOIN (SELECT p_anio AS anio_consulta) ac
    -- Traer la vinculación anterior más reciente (si existe)
    LEFT JOIN LATERAL (
        SELECT vp3.poa_id, vp3.anio
        FROM samc.samc_proyecto_vinculacion_poa vp3
        WHERE vp3.proyecto_id = pe.id
          AND vp3.anio < ac.anio_consulta
        ORDER BY vp3.anio DESC
        LIMIT 1
    ) vp ON TRUE
    LEFT JOIN samc.samc_poa poa_prev ON poa_prev.id = vp.poa_id
    WHERE (EXTRACT(YEAR FROM pe.fecha_inicio) <= ac.anio_consulta
       AND (pe.fecha_culminacion IS NULL OR EXTRACT(YEAR FROM pe.fecha_culminacion) >= ac.anio_consulta))
      AND pe.estatus IN ('PLANIFICADO', 'EJECUCION')
      AND pe.es_plantilla = FALSE
      AND NOT EXISTS (
          SELECT 1 FROM samc.samc_proyecto_vinculacion_poa vp2
          WHERE vp2.proyecto_id = pe.id
            AND vp2.anio = ac.anio_consulta
            AND vp2.activo = TRUE
      )
    ORDER BY pe.nombre;
$$;

-- ============================================================================
-- Paso 5: Función para alertar al crear POA
-- Retorna count de proyectos huérfanos del año anterior
-- ============================================================================

CREATE OR REPLACE FUNCTION samc.alertar_proyectos_huerfanos_al_crear_poa()
RETURNS TABLE(
    total_huerfanos   BIGINT,
    anio_referencia   INTEGER
)
LANGUAGE SQL
STABLE
AS $$
    SELECT
        COUNT(*)::BIGINT AS total_huerfanos,
        (EXTRACT(YEAR FROM NOW())::INTEGER - 1) AS anio_referencia
    FROM samc.proyectos_huerfanos(EXTRACT(YEAR FROM NOW())::INTEGER - 1);
$$;

COMMIT;
