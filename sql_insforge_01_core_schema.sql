-- ==============================================================================
-- ⚡ CORPOELEC - GERENCIA GENERAL DE PLANIFICACIÓN DE DISTRIBUCIÓN (GGPD)
-- 🗄️ MODELO CANÓNICO DE DATOS MAESTROS (MDM) - POSTGRESQL / INSFORGE-BK
-- ==============================================================================

-- 1. Crear esquema dedicado 'core'
CREATE SCHEMA IF NOT EXISTS core;

-- 2. Tabla Dimensión: Regiones Operativas SEN
CREATE TABLE IF NOT EXISTS core.dim_regiones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    codigo_region VARCHAR(20) NOT NULL UNIQUE,
    nombre_region VARCHAR(100) NOT NULL,
    descripcion TEXT,
    creado_en TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    actualizado_en TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

-- 3. Tabla Dimensión: Estados y Territorios (25 Entidades + Consolidado Nacional)
CREATE TABLE IF NOT EXISTS core.dim_estados (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    codigo_estado VARCHAR(10) NOT NULL UNIQUE,
    nombre_estado VARCHAR(100) NOT NULL,
    codigo_region VARCHAR(20) NOT NULL REFERENCES core.dim_regiones(codigo_region) ON UPDATE CASCADE,
    numero_orden INT NOT NULL,
    es_activo BOOLEAN NOT NULL DEFAULT true,
    creado_en TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    actualizado_en TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

-- 4. Catálogo: Niveles de Tensión Normalizados SEN
CREATE TABLE IF NOT EXISTS core.cat_niveles_tension (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tension_kv NUMERIC(6,2) NOT NULL UNIQUE,
    clasificacion_rango VARCHAR(30) NOT NULL,
    es_distribucion BOOLEAN NOT NULL DEFAULT false,
    descripcion TEXT,
    creado_en TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

-- 5. Poblar Regiones SEN (8 Regiones + Nacional)
INSERT INTO core.dim_regiones (codigo_region, nombre_region, descripcion) VALUES
('NACIONAL', 'Nivel Central / Consolidado Nacional', 'Ámbito nacional para consolidaciones SEN'),
('CAPITAL', 'Región Capital', 'Distrito Capital, Miranda y La Guaira'),
('CENTRAL', 'Región Central', 'Carabobo, Aragua y Cojedes'),
('OCCIDENTE', 'Región Occidental', 'Zulia, Lara, Falcón y Yaracuy'),
('ANDES', 'Región Los Andes', 'Trujillo, Mérida, Táchira y Barinas'),
('LLANOS', 'Región Los Llanos', 'Portuguesa, Guárico y Apure'),
('ORIENTE', 'Región Oriental', 'Anzoátegui, Monagas y Sucre'),
('SUR', 'Región Guayana / Sur', 'Bolívar, Amazonas, Delta Amacuro y Guayana Esequiba'),
('INSULAR', 'Región Insular', 'Nueva Esparta y Dependencias Federales')
ON CONFLICT (codigo_region) DO UPDATE SET
    nombre_region = EXCLUDED.nombre_region,
    descripcion = EXCLUDED.descripcion,
    actualizado_en = clock_timestamp();

-- 6. Poblar los 26 Códigos Territoriales (Norma ISO 8000 / Data Lake 2026)
INSERT INTO core.dim_estados (codigo_estado, nombre_estado, codigo_region, numero_orden) VALUES
('NAC', 'CONSOLIDADO NACIONAL', 'NACIONAL', 0),
('DCA', 'DISTRITO CAPITAL', 'CAPITAL', 1),
('MIR', 'MIRANDA', 'CAPITAL', 2),
('LGU', 'LA GUAIRA', 'CAPITAL', 3),
('CAR', 'CARABOBO', 'CENTRAL', 4),
('ARA', 'ARAGUA', 'CENTRAL', 5),
('COJ', 'COJEDES', 'CENTRAL', 6),
('ZUL', 'ZULIA', 'OCCIDENTE', 7),
('LAR', 'LARA', 'OCCIDENTE', 8),
('FAL', 'FALCÓN', 'OCCIDENTE', 9),
('YAR', 'YARACUY', 'OCCIDENTE', 10),
('TRU', 'TRUJILLO', 'ANDES', 11),
('MER', 'MÉRIDA', 'ANDES', 12),
('TAC', 'TÁCHIRA', 'ANDES', 13),
('BAR', 'BARINAS', 'ANDES', 14),
('POR', 'PORTUGUESA', 'LLANOS', 15),
('GUA', 'GUÁRICO', 'LLANOS', 16),
('APU', 'APURE', 'LLANOS', 17),
('ANZ', 'ANZOÁTEGUI', 'ORIENTE', 18),
('MON', 'MONAGAS', 'ORIENTE', 19),
('SUC', 'SUCRE', 'ORIENTE', 20),
('NES', 'NUEVA ESPARTA', 'INSULAR', 21),
('BOL', 'BOLÍVAR', 'SUR', 22),
('AMA', 'AMAZONAS', 'SUR', 23),
('DEL', 'DELTA AMACURO', 'SUR', 24),
('GEQ', 'GUAYANA ESEQUIBA', 'SUR', 25)
ON CONFLICT (codigo_estado) DO UPDATE SET
    nombre_estado = EXCLUDED.nombre_estado,
    codigo_region = EXCLUDED.codigo_region,
    numero_orden = EXCLUDED.numero_orden,
    actualizado_en = clock_timestamp();

-- 7. Poblar Niveles de Tensión Normalizados SEN
INSERT INTO core.cat_niveles_tension (tension_kv, clasificacion_rango, es_distribucion, descripcion) VALUES
(765.00, 'EXTRA_ALTA_TENSION', false, 'Troncal de Transmisión Nacional Guri - Malena - San Gerónimo'),
(400.00, 'EXTRA_ALTA_TENSION', false, 'Red Troncal de Transmisión 400kV'),
(230.00, 'ALTA_TENSION', false, 'Red de Transmisión Regional 230kV'),
(115.00, 'ALTA_TENSION', false, 'Subtransmisión y Nodos de Transformación a Distribución'),
(34.50,  'MEDIA_TENSION', true,  'Red Troncal de Distribución y Subestaciones de Distribución'),
(24.00,  'MEDIA_TENSION', true,  'Distribución Media Tensión en zonas específicas'),
(13.80,  'MEDIA_TENSION', true,  'Red Principal de Distribución Urbana y Rural (Alimentadores)'),
(4.16,   'MEDIA_TENSION', true,  'Distribución Industrial / Circuitos Especiales'),
(0.208,  'BAJA_TENSION',  true,  'Red de Distribución Secundaria / Transformadores de Distribución')
ON CONFLICT (tension_kv) DO UPDATE SET
    clasificacion_rango = EXCLUDED.clasificacion_rango,
    es_distribucion = EXCLUDED.es_distribucion,
    descripcion = EXCLUDED.descripcion;

-- 8. Vistas en esquema public para acceso transparente en REST / SDK
CREATE OR REPLACE VIEW public.dim_regiones AS SELECT * FROM core.dim_regiones;
CREATE OR REPLACE VIEW public.dim_estados AS SELECT * FROM core.dim_estados;
CREATE OR REPLACE VIEW public.cat_niveles_tension AS SELECT * FROM core.cat_niveles_tension;

