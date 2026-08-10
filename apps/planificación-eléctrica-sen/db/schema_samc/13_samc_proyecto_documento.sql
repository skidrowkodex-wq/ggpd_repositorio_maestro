-- ============================================================================
-- 13_samc_proyecto_documento.sql
-- Expansión de samc_proyecto_especial para soportar el documento completo
-- del proyecto (plantilla de propuesta de acción específica).
--
-- Agrega ~22 columnas para cubrir todas las secciones del documento:
-- Identificación, Análisis, Formulación, Políticas, Conexiones, Equipo.
-- También inserta una plantilla por defecto con los valores estándar
-- para CORPOELEC DISTRIBUCIÓN / PLANIFICACIÓN.
-- ============================================================================

BEGIN;

SET search_path TO samc;

-- ============================================================================
-- Paso 1: Nuevas columnas para el documento del proyecto
-- ============================================================================

-- IDENTIFICACIÓN
ALTER TABLE samc.samc_proyecto_especial
    ADD COLUMN IF NOT EXISTS organismo_responsable TEXT,
    ADD COLUMN IF NOT EXISTS organismo_ejecutor TEXT,
    ADD COLUMN IF NOT EXISTS competencias TEXT,
    ADD COLUMN IF NOT EXISTS resumen_ejecutivo TEXT;

-- ANÁLISIS DE LA NECESIDAD O PROBLEMA
ALTER TABLE samc.samc_proyecto_especial
    ADD COLUMN IF NOT EXISTS situacion_actual TEXT,
    ADD COLUMN IF NOT EXISTS situacion_deseada TEXT,
    ADD COLUMN IF NOT EXISTS balance_analisis JSONB;

-- ANÁLISIS ESTRATÉGICO
ALTER TABLE samc.samc_proyecto_especial
    ADD COLUMN IF NOT EXISTS linea_presidencial TEXT;

-- FORMULACIÓN DEL PROYECTO
ALTER TABLE samc.samc_proyecto_especial
    ADD COLUMN IF NOT EXISTS objetivo_general TEXT,
    ADD COLUMN IF NOT EXISTS objetivo_especifico TEXT,
    ADD COLUMN IF NOT EXISTS ubicacion_parroquia VARCHAR(200),
    ADD COLUMN IF NOT EXISTS ubicacion_municipio VARCHAR(200),
    ADD COLUMN IF NOT EXISTS ubicacion_estado VARCHAR(200),
    ADD COLUMN IF NOT EXISTS bienes_servicios TEXT,
    ADD COLUMN IF NOT EXISTS meta_proyecto TEXT,
    ADD COLUMN IF NOT EXISTS beneficiarios TEXT,
    ADD COLUMN IF NOT EXISTS acciones_especificas_detalle JSONB;

-- CONEXIONES
ALTER TABLE samc.samc_proyecto_especial
    ADD COLUMN IF NOT EXISTS conexiones_intrainstitucionales TEXT,
    ADD COLUMN IF NOT EXISTS conexiones_interinstitucionales TEXT;

-- EQUIPO Y RACI
ALTER TABLE samc.samc_proyecto_especial
    ADD COLUMN IF NOT EXISTS equipo_descripcion TEXT,
    ADD COLUMN IF NOT EXISTS modelo_raci JSONB;

-- PLANTILLA
ALTER TABLE samc.samc_proyecto_especial
    ADD COLUMN IF NOT EXISTS es_plantilla BOOLEAN NOT NULL DEFAULT FALSE;

CREATE INDEX IF NOT EXISTS idx_proyecto_plantilla ON samc.samc_proyecto_especial(es_plantilla);

COMMENT ON COLUMN samc.samc_proyecto_especial.organismo_responsable             IS 'Ej: CORPOELEC';
COMMENT ON COLUMN samc.samc_proyecto_especial.organismo_ejecutor                IS 'Ej: GERENCIA GENERAL DE PLANIFICACIÓN DE DISTRIBUCIÓN';
COMMENT ON COLUMN samc.samc_proyecto_especial.competencias                      IS 'Competencias del organismo ejecutor';
COMMENT ON COLUMN samc.samc_proyecto_especial.resumen_ejecutivo                 IS 'Resumen ejecutivo del proyecto';
COMMENT ON COLUMN samc.samc_proyecto_especial.situacion_actual                  IS 'Diagnóstico: situación actual del problema';
COMMENT ON COLUMN samc.samc_proyecto_especial.situacion_deseada                 IS 'Diagnóstico: situación deseada';
COMMENT ON COLUMN samc.samc_proyecto_especial.balance_analisis                  IS 'Tabla comparativa situación actual vs deseada (JSONB)';
COMMENT ON COLUMN samc.samc_proyecto_especial.linea_presidencial                IS 'Línea de acción presidencial vinculada';
COMMENT ON COLUMN samc.samc_proyecto_especial.objetivo_general                  IS 'Objetivo general del proyecto';
COMMENT ON COLUMN samc.samc_proyecto_especial.objetivo_especifico               IS 'Objetivo específico del proyecto';
COMMENT ON COLUMN samc.samc_proyecto_especial.ubicacion_parroquia               IS 'Parroquia de ejecución';
COMMENT ON COLUMN samc.samc_proyecto_especial.ubicacion_municipio               IS 'Municipio de ejecución';
COMMENT ON COLUMN samc.samc_proyecto_especial.ubicacion_estado                  IS 'Estado de ejecución';
COMMENT ON COLUMN samc.samc_proyecto_especial.bienes_servicios                  IS 'Bienes o servicios que produce el proyecto';
COMMENT ON COLUMN samc.samc_proyecto_especial.meta_proyecto                     IS 'Meta cuantitativa del proyecto';
COMMENT ON COLUMN samc.samc_proyecto_especial.beneficiarios                     IS 'Población beneficiaria';
COMMENT ON COLUMN samc.samc_proyecto_especial.acciones_especificas_detalle      IS 'Tabla de acciones específicas con ponderación, unidad, metas (JSONB)';
COMMENT ON COLUMN samc.samc_proyecto_especial.conexiones_intrainstitucionales   IS 'Requiere acciones de otra institución';
COMMENT ON COLUMN samc.samc_proyecto_especial.conexiones_interinstitucionales   IS 'Contribuye o complementa proyectos de otra institución';
COMMENT ON COLUMN samc.samc_proyecto_especial.equipo_descripcion                IS 'Descripción del equipo de trabajo y organigrama';
COMMENT ON COLUMN samc.samc_proyecto_especial.modelo_raci                       IS 'Matriz RACI de líneas gruesas (JSONB)';
COMMENT ON COLUMN samc.samc_proyecto_especial.es_plantilla                      IS 'Si es TRUE, es una plantilla reusable para crear nuevos proyectos';

-- ============================================================================
-- Paso 2: Plantilla por defecto para CORPOELEC DISTRIBUCIÓN
-- ============================================================================

INSERT INTO samc.samc_proyecto_especial (
    codigo, nombre, ambito, tipo_proyecto, estatus,
    fecha_inicio, fecha_culminacion,
    organismo_responsable, organismo_ejecutor, competencias,
    linea_presidencial, equipo_descripcion,
    es_plantilla
) VALUES (
    'TEMPLATE-DIST-001', '[Plantilla] Proyecto DISTRIBUCIÓN / PLANIFICACIÓN',
    'MIXTO', 'PRTSEN', 'PLANTILLA',
    '2026-01-01', '2026-12-31',
    'CORPOELEC',
    'GERENCIA GENERAL DE PLANIFICACIÓN DE DISTRIBUCIÓN',
    'La división de Seguimiento y Control adscrita a la Gerencia Nacional de Planificación de Distribución tiene como sede la ciudad de Caracas con un radio de influencia de 24 estados que conforman la Corporación Eléctrica Nacional, la cual tiene como objetivo principal coordinar la elaboración de los planes de adecuación y mantenimiento del sistema de distribución, con el fin de proveer un servicio eléctrico con equidad, calidad y eficiencia, tanto a la demanda actual como a la futura, garantizando el equilibrio y cargabilidad en sistema eléctrico de distribución a nivel nacional.',
    'Línea Presidencial N° 5. Servicios Públicos y eficiencia del gobierno: Garantizar la eficiencia y la eficacia de los servicios públicos y de las políticas públicas ejecutadas para garantizar el bienestar y calidad de vida del pueblo.',
    'La División de Innovación, Automatización y Desarrollo Tecnológico es una división de carácter estratégico adscrita al Grupo de Trabajo Planes de Adecuación y Mantenimiento de la Gerencia General de Planificación de Distribución. Su objetivo principal es investigar, crear y gestionar los procesos de automatización y migración requeridos para implementar opciones de mejora informáticas a los procesos asociados al área de Planificación de Distribución, así como la evaluación de la aplicabilidad de mecanismos informáticos que permitan el seguimiento y control de los procesos relacionados, manteniendo el énfasis en el aseguramiento tecnológico e informático de la Corporación.',
    TRUE
);

COMMIT;
