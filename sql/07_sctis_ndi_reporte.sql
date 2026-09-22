-- ============================================================================
-- MIGRACIÓN: 07_sctis_ndi_reporte.sql
-- Motor de Reportes NDI / Calidad de Servicio SCTIS (DOC-GGPD-2026-METAS-001)
-- ----------------------------------------------------------------------------
-- Objetivo:
--   1. Extender sctis.mae_interrupciones_tiras al grano completo del PLANTILLA
--      de la Ing. Catherina Favio (34 columnas) + auditoría ETL, sin borrar data.
--   2. Catálogos de homologación de entrada (estado / causa) para que cada
--      estado cargue su formato ordinario y el sistema normalice a norma SEN.
--   3. Vista pública ampliada v_sctis_tiras_interrupcion + triggers INSTEAD OF.
--   4. Vistas KPI (NDI Bruto / Consolidado / Meta 150.347, ranking de circuitos).
-- Granularidad: 1 fila = 1 TIRA (registro por subestación/circuito/evento).
-- NDI_Bruto       = COUNT(*) por (estado, mes)                (publicado por Ing.)
-- NDI_Consolidado = COUNT(DISTINCT (estado, SE, circuito, fecha))  (evento coalescido)
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1) AMPLIACIÓN DEL GRANO (premisa de esquema: columnas tipadas + raw_json)
-- ----------------------------------------------------------------------------
ALTER TABLE sctis.mae_interrupciones_tiras
    ADD COLUMN IF NOT EXISTS fecha DATE,
    ADD COLUMN IF NOT EXISTS sistema VARCHAR(50),
    ADD COLUMN IF NOT EXISTS distrito VARCHAR(150),
    ADD COLUMN IF NOT EXISTS inicio TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS carga_kva NUMERIC(12,2),
    ADD COLUMN IF NOT EXISTS frec NUMERIC(18,8),
    ADD COLUMN IF NOT EXISTS dur_hora NUMERIC(10,4),
    ADD COLUMN IF NOT EXISTS tti NUMERIC(16,6),
    ADD COLUMN IF NOT EXISTS senal VARCHAR(150),
    ADD COLUMN IF NOT EXISTS causa_nombre VARCHAR(220),
    ADD COLUMN IF NOT EXISTS subcausa_nombre VARCHAR(220),
    ADD COLUMN IF NOT EXISTS sectores TEXT,
    ADD COLUMN IF NOT EXISTS ciudad TEXT,
    ADD COLUMN IF NOT EXISTS kva_instalados NUMERIC(14,2),
    ADD COLUMN IF NOT EXISTS circuito_estado VARCHAR(220),
    ADD COLUMN IF NOT EXISTS kva_hora NUMERIC(16,4),
    ADD COLUMN IF NOT EXISTS kva_int_f NUMERIC(16,4),
    ADD COLUMN IF NOT EXISTS dia_num SMALLINT,
    ADD COLUMN IF NOT EXISTS mes_num SMALLINT,
    ADD COLUMN IF NOT EXISTS anio_num SMALLINT,
    ADD COLUMN IF NOT EXISTS dia_semana VARCHAR(20),
    ADD COLUMN IF NOT EXISTS mes_nombre VARCHAR(20),
    ADD COLUMN IF NOT EXISTS elimina_espacio VARCHAR(20),
    ADD COLUMN IF NOT EXISTS causa_falla VARCHAR(220),
    ADD COLUMN IF NOT EXISTS fecha_f DATE,
    ADD COLUMN IF NOT EXISTS col32 VARCHAR(20),
    ADD COLUMN IF NOT EXISTS raw_json JSONB,
    ADD COLUMN IF NOT EXISTS fingerprint VARCHAR(64),
    ADD COLUMN IF NOT EXISTS fuente_archivo VARCHAR(220),
    ADD COLUMN IF NOT EXISTS linea_origen INTEGER,
    ADD COLUMN IF NOT EXISTS es_duplicado BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS es_eliminado BOOLEAN DEFAULT FALSE;

-- Índices de consulta / deduplicación
CREATE INDEX IF NOT EXISTS idx_sctis_tiras_ndi_key
    ON sctis.mae_interrupciones_tiras (codigo_estado, subestacion_nombre, circuito_codigo, fecha);
CREATE INDEX IF NOT EXISTS idx_sctis_tiras_fecha
    ON sctis.mae_interrupciones_tiras (fecha);
CREATE INDEX IF NOT EXISTS idx_sctis_tiras_fingerprint
    ON sctis.mae_interrupciones_tiras (fingerprint);
CREATE INDEX IF NOT EXISTS idx_sctis_tiras_estado_anio
    ON sctis.mae_interrupciones_tiras (codigo_estado, anio_num, mes_num);

-- ----------------------------------------------------------------------------
-- 2) CATÁLOGOS DE HOMOLOGACIÓN DE ENTRADA (cargas por estado, ISO 8000-110)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS sctis.map_estado_entrada (
    nombre_entrada TEXT PRIMARY KEY,
    codigo_estado VARCHAR(10) REFERENCES core.dim_estados(codigo_estado),
    nombre_oficial VARCHAR(100),
    nota TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO sctis.map_estado_entrada (nombre_entrada, codigo_estado, nombre_oficial, nota) VALUES
    ('AMAZONAS',        'AMA', 'AMAZONAS',        ''),
    ('ANZOATEGUI',      'ANZ', 'ANZOATEGUI',      'sin acento en fuente; oficial ANZOATEGUI'),
    ('APURE',           'APU', 'APURE',           ''),
    ('ARAGUA',          'ARA', 'ARAGUA',          ''),
    ('BARINAS',         'BAR', 'BARINAS',         ''),
    ('BOLIVAR',         'BOL', 'BOLIVAR',         'sin acento en fuente; oficial BOLIVAR'),
    ('CARABOBO',        'CAR', 'CARABOBO',        ''),
    ('COJEDES',         'COJ', 'COJEDES',         ''),
    ('DELTA AMACURO',   'DEL', 'DELTA AMACURO',   ''),
    ('FALCON',          'FAL', 'FALCON',          'sin acento en fuente; oficial FALCON'),
    ('GUARICO',         'GUA', 'GUARICO',         'sin acento en fuente; oficial GUARICO'),
    ('LA GUAIRA',       'LGU', 'LA GUAIRA',       ''),
    ('LARA',            'LAR', 'LARA',            ''),
    ('MERIDA',          'MER', 'MERIDA',          'sin acento en fuente; oficial MERIDA'),
    ('MIRANDA',         'MIR', 'MIRANDA',         ''),
    ('MONAGAS',         'MON', 'MONAGAS',         ''),
    ('NUEVA ESPARTA',   'NES', 'NUEVA ESPARTA',   'código canónico MDM es NES'),
    ('PORTUGUESA',      'POR', 'PORTUGUESA',      ''),
    ('REGION CAPITAL',  'DCA', 'DISTRITO CAPITAL','ex-EDC; MDM asigna Distrito Capital (Caracas), sustento DOC-GGPD-2026'),
    ('SUCRE',           'SUC', 'SUCRE',           ''),
    ('TACHIRA',         'TAC', 'TACHIRA',         'sin acento en fuente; oficial TACHIRA'),
    ('TRUJILLO',        'TRU', 'TRUJILLO',        ''),
    ('YARACUY',         'YAR', 'YARACUY',         ''),
    ('ZULIA',           'ZUL', 'ZULIA',           '')
ON CONFLICT (nombre_entrada) DO UPDATE SET
    codigo_estado = EXCLUDED.codigo_estado,
    nombre_oficial = EXCLUDED.nombre_oficial,
    nota = EXCLUDED.nota;

CREATE TABLE IF NOT EXISTS sctis.map_causa_entrada (
    nombre_entrada TEXT PRIMARY KEY,
    codigo_causa VARCHAR(50) REFERENCES core.cat_causas_interrupcion(codigo_causa),
    nombre_oficial VARCHAR(150),
    veces_usado INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 3) VISTA PÚBLICA AMPLIADA v_sctis_tiras_interrupcion (CREATE OR REPLACE,
--    columnas nuevas al final: preserva el contrato REST/frontend existente)
-- ----------------------------------------------------------------------------
CREATE OR REPLACE VIEW public.v_sctis_tiras_interrupcion AS
SELECT
    t.id,
    t.codigo_estado,
    e.nombre_estado,
    t.subestacion_nombre,
    t.circuito_codigo,
    t.fecha_apertura,
    t.fecha_cierre,
    t.duracion_minutos,
    t.mw_interrumpidos,
    t.causa_codigo,
    t.subcausa_codigo,
    t.despachador,
    t.observaciones,
    t.calidad_score,
    t.created_at,
    t.fecha,
    t.sistema,
    t.distrito,
    t.inicio,
    t.carga_kva,
    t.frec,
    t.dur_hora,
    t.tti,
    t.senal,
    t.causa_nombre,
    t.subcausa_nombre,
    t.sectores,
    t.ciudad,
    t.kva_instalados,
    t.circuito_estado,
    t.kva_hora,
    t.kva_int_f,
    t.dia_num,
    t.mes_num,
    t.anio_num,
    t.dia_semana,
    t.mes_nombre,
    t.elimina_espacio,
    t.causa_falla,
    t.fecha_f,
    t.col32,
    t.raw_json,
    t.fingerprint,
    t.fuente_archivo,
    t.linea_origen,
    t.es_duplicado,
    t.es_eliminado,
    t.updated_at
FROM sctis.mae_interrupciones_tiras t
LEFT JOIN core.dim_estados e ON e.codigo_estado = t.codigo_estado;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.v_sctis_tiras_interrupcion TO anon, authenticated;

-- ----------------------------------------------------------------------------
-- 3.1) Triggers INSTEAD OF (escritura REST → base) con las columnas ampliadas
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.ins_v_sctis_tiras()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO sctis.mae_interrupciones_tiras (
        id, codigo_estado, subestacion_nombre, circuito_codigo,
        fecha_apertura, fecha_cierre, duracion_minutos, mw_interrumpidos,
        causa_codigo, subcausa_codigo, despachador, observaciones,
        calidad_score, created_at, updated_at,
        fecha, sistema, distrito, inicio, carga_kva, frec, dur_hora, tti,
        senal, causa_nombre, subcausa_nombre, sectores, ciudad, kva_instalados,
        circuito_estado, kva_hora, kva_int_f, dia_num, mes_num, anio_num,
        dia_semana, mes_nombre, elimina_espacio, causa_falla, fecha_f, col32,
        raw_json, fingerprint, fuente_archivo, linea_origen,
        es_duplicado, es_eliminado
    ) VALUES (
        COALESCE(NEW.id, gen_random_uuid()),
        NEW.codigo_estado, NEW.subestacion_nombre, NEW.circuito_codigo,
        NEW.fecha_apertura, NEW.fecha_cierre, NEW.duracion_minutos, NEW.mw_interrumpidos,
        NEW.causa_codigo, NEW.subcausa_codigo, NEW.despachador, NEW.observaciones,
        NEW.calidad_score, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP,
        NEW.fecha, NEW.sistema, NEW.distrito, NEW.inicio, NEW.carga_kva, NEW.frec,
        NEW.dur_hora, NEW.tti, NEW.senal, NEW.causa_nombre, NEW.subcausa_nombre,
        NEW.sectores, NEW.ciudad, NEW.kva_instalados, NEW.circuito_estado,
        NEW.kva_hora, NEW.kva_int_f, NEW.dia_num, NEW.mes_num, NEW.anio_num,
        NEW.dia_semana, NEW.mes_nombre, NEW.elimina_espacio, NEW.causa_falla,
        NEW.fecha_f, NEW.col32, NEW.raw_json, NEW.fingerprint, NEW.fuente_archivo,
        NEW.linea_origen, NEW.es_duplicado, NEW.es_eliminado
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_ins_v_sctis_tiras ON public.v_sctis_tiras_interrupcion;
CREATE TRIGGER trg_ins_v_sctis_tiras
    INSTEAD OF INSERT ON public.v_sctis_tiras_interrupcion
    FOR EACH ROW EXECUTE FUNCTION public.ins_v_sctis_tiras();

CREATE OR REPLACE FUNCTION public.upd_v_sctis_tiras()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE sctis.mae_interrupciones_tiras SET
        codigo_estado     = NEW.codigo_estado,
        subestacion_nombre = NEW.subestacion_nombre,
        circuito_codigo   = NEW.circuito_codigo,
        fecha_apertura    = NEW.fecha_apertura,
        fecha_cierre      = NEW.fecha_cierre,
        duracion_minutos  = NEW.duracion_minutos,
        mw_interrumpidos  = NEW.mw_interrumpidos,
        causa_codigo      = NEW.causa_codigo,
        subcausa_codigo   = NEW.subcausa_codigo,
        despachador       = NEW.despachador,
        observaciones     = NEW.observaciones,
        calidad_score     = NEW.calidad_score,
        fecha = NEW.fecha, sistema = NEW.sistema, distrito = NEW.distrito,
        inicio = NEW.inicio, carga_kva = NEW.carga_kva, frec = NEW.frec,
        dur_hora = NEW.dur_hora, tti = NEW.tti, senal = NEW.senal,
        causa_nombre = NEW.causa_nombre, subcausa_nombre = NEW.subcausa_nombre,
        sectores = NEW.sectores, ciudad = NEW.ciudad, kva_instalados = NEW.kva_instalados,
        circuito_estado = NEW.circuito_estado, kva_hora = NEW.kva_hora,
        kva_int_f = NEW.kva_int_f, dia_num = NEW.dia_num, mes_num = NEW.mes_num,
        anio_num = NEW.anio_num, dia_semana = NEW.dia_semana,
        mes_nombre = NEW.mes_nombre, elimina_espacio = NEW.elimina_espacio,
        causa_falla = NEW.causa_falla, fecha_f = NEW.fecha_f, col32 = NEW.col32,
        raw_json = NEW.raw_json, es_eliminado = NEW.es_eliminado,
        updated_at        = CURRENT_TIMESTAMP
    WHERE id = OLD.id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_upd_v_sctis_tiras ON public.v_sctis_tiras_interrupcion;
CREATE TRIGGER trg_upd_v_sctis_tiras
    INSTEAD OF UPDATE ON public.v_sctis_tiras_interrupcion
    FOR EACH ROW EXECUTE FUNCTION public.upd_v_sctis_tiras();

CREATE OR REPLACE FUNCTION public.del_v_sctis_tiras()
RETURNS TRIGGER AS $$
BEGIN
    DELETE FROM sctis.mae_interrupciones_tiras WHERE id = OLD.id;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_del_v_sctis_tiras ON public.v_sctis_tiras_interrupcion;
CREATE TRIGGER trg_del_v_sctis_tiras
    INSTEAD OF DELETE ON public.v_sctis_tiras_interrupcion
    FOR EACH ROW EXECUTE FUNCTION public.del_v_sctis_tiras();

-- ----------------------------------------------------------------------------
-- 4) VISTAS KPI / NDI (1er Nivel: Confiabilidad y Calidad de Servicio SEN)
-- ----------------------------------------------------------------------------
-- NDI por (estado, mes): Bruto (COUNT tira) y Consolidado (evento coalescido)
CREATE OR REPLACE VIEW public.v_sctis_kpi_ndi AS
WITH base AS (
    SELECT
        t.codigo_estado,
        e.nombre_estado,
        COALESCE(t.fecha, (t.fecha_apertura AT TIME ZONE 'America/Caracas')::date) AS fecha_ndi,
        t.subestacion_nombre,
        t.circuito_codigo,
        t.mw_interrumpidos,
        t.duracion_minutos,
        t.es_eliminado
    FROM sctis.mae_interrupciones_tiras t
    LEFT JOIN core.dim_estados e ON e.codigo_estado = t.codigo_estado
)
SELECT
    codigo_estado,
    nombre_estado,
    EXTRACT(YEAR FROM fecha_ndi)::int  AS anio,
    EXTRACT(MONTH FROM fecha_ndi)::int AS mes_num,
    TO_CHAR(fecha_ndi, 'TMMonth')      AS mes_nombre,
    COUNT(*) FILTER (WHERE es_eliminado = FALSE) AS ndi_bruto,
    COUNT(DISTINCT (codigo_estado, subestacion_nombre, circuito_codigo, fecha_ndi)) FILTER (WHERE es_eliminado = FALSE) AS ndi_consolidado,
    COALESCE(SUM(duracion_minutos) FILTER (WHERE es_eliminado = FALSE), 0) / 60.0 AS tti_horas,
    COUNT(*) FILTER (WHERE es_eliminado = FALSE AND duracion_minutos > 0) AS eventos_con_duracion
FROM base
GROUP BY codigo_estado, nombre_estado,
         EXTRACT(YEAR FROM fecha_ndi), EXTRACT(MONTH FROM fecha_ndi);

-- NDI anual por estado + avance vs Meta Nacional 2026 (150.347 disparos, METAS-001)
CREATE OR REPLACE VIEW public.v_sctis_kpi_ndi_anual AS
SELECT
    codigo_estado,
    nombre_estado,
    anio,
    SUM(ndi_bruto)        AS ndi_bruto_anual,
    SUM(ndi_consolidado)  AS ndi_consolidado_anual,
    SUM(tti_horas)        AS tti_horas_anual,
    ROUND(SUM(tti_horas) / NULLIF(SUM(ndi_consolidado), 0), 2) AS dpi_horas,
    SUM(ndi_consolidado) * 1.0 / NULLIF(SUM(ndi_bruto), 0) AS tasa_consolidacion
FROM public.v_sctis_kpi_ndi
GROUP BY codigo_estado, nombre_estado, anio;

-- Tabulador nacional mensual: bruto, consolidado, acumulado + avance vs meta
CREATE OR REPLACE VIEW public.v_sctis_kpi_ndi_tabulador AS
WITH mes AS (
    SELECT
        anio, mes_num, mes_nombre,
        SUM(ndi_bruto) AS bruto,
        SUM(ndi_consolidado) AS consolidado
    FROM public.v_sctis_kpi_ndi
    GROUP BY anio, mes_num, mes_nombre
)
SELECT
    anio, mes_num, mes_nombre,
    bruto, consolidado,
    SUM(bruto)       OVER (ORDER BY anio, mes_num) AS bruto_acumulado,
    SUM(consolidado) OVER (ORDER BY anio, mes_num) AS consolidado_acumulado,
    150347 AS meta_anual,
    ROUND(SUM(consolidado) OVER (ORDER BY anio, mes_num) * 100.0 / 150347, 2) AS pct_avance_meta
FROM mes
ORDER BY anio, mes_num;

-- Ranking Top-10 circuitos por NDI (consolidado) dentro de cada estado
CREATE OR REPLACE VIEW public.v_sctis_ranking_circuitos AS
SELECT codigo_estado, nombre_estado, subestacion_nombre, circuito_codigo,
       ndi_bruto, ndi_consolidado, kva_hora_total, duracion_horas_total,
       posicion
FROM (
    SELECT
        t.codigo_estado,
        e.nombre_estado,
        t.subestacion_nombre,
        t.circuito_codigo,
        COUNT(*) AS ndi_bruto,
        COUNT(DISTINCT t.fecha) AS ndi_consolidado,
        COALESCE(SUM(t.kva_hora), 0) AS kva_hora_total,
        COALESCE(SUM(t.dur_hora), 0) AS duracion_horas_total,
        ROW_NUMBER() OVER (
            PARTITION BY t.codigo_estado
            ORDER BY COUNT(DISTINCT t.fecha) DESC, COUNT(*) DESC
        ) AS posicion
    FROM sctis.mae_interrupciones_tiras t
    LEFT JOIN core.dim_estados e ON e.codigo_estado = t.codigo_estado
    WHERE t.es_eliminado = FALSE
    GROUP BY t.codigo_estado, e.nombre_estado, t.subestacion_nombre, t.circuito_codigo
) r
WHERE posicion <= 10;