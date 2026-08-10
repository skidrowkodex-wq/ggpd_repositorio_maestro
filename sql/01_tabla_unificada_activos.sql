-- ==============================================================================
-- ⚡ CORPOELEC - GERENCIA DE DISTRIBUCIÓN
-- 📜 SCRIPT DDL: TABLA UNIFICADA DE ACTIVOS DE RED (SE y CT)
-- ==============================================================================
-- Descripción:
--   Este script crea la estructura para la Tabla Unificada de Activos (`activos_red`),
--   sus tipos enumerados, índices optimizados, función de ingesta automática,
--   vistas analíticas y políticas RLS para consumo seguro en Supabase.
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. TIPOS ENUMERADOS (ENUMS)
-- ------------------------------------------------------------------------------
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'macro_proceso_enum') THEN
        CREATE TYPE macro_proceso_enum AS ENUM ('DISTRIBUCION', 'TRANSMISION', 'GENERACION_DISTRIBUIDA', 'OTRO');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'estado_control_enum') THEN
        CREATE TYPE estado_control_enum AS ENUM ('CONTROLADO', 'NO_CONTROLADO');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'estado_caracterizacion_enum') THEN
        CREATE TYPE estado_caracterizacion_enum AS ENUM ('CARACTERIZADO', 'PROVISIONAL', 'NO_CARACTERIZADO');
    END IF;
END $$;

-- ------------------------------------------------------------------------------
-- 2. TABLA PRINCIPAL: activos_red
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.activos_red (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    codigo_activo VARCHAR(50) NOT NULL UNIQUE,
    nombre TEXT NOT NULL,
    tipo_activo VARCHAR(30) NOT NULL, -- 'SE' (Subestación), 'CT' (Circuito), 'TRANSFORMADOR', etc.
    macro_proceso macro_proceso_enum NOT NULL DEFAULT 'DISTRIBUCION',
    estado_control estado_control_enum NOT NULL DEFAULT 'CONTROLADO',
    estado_caracterizacion estado_caracterizacion_enum NOT NULL DEFAULT 'PROVISIONAL',
    esquema_origen VARCHAR(50) NOT NULL DEFAULT 'public',
    metadata_tecnica JSONB NOT NULL DEFAULT '{}'::jsonb,
    fecha_registro TIMESTAMPTZ NOT NULL DEFAULT now(),
    ultima_actualizacion TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Comentarios descriptivos en tabla y columnas
COMMENT ON TABLE public.activos_red IS 'Tabla Unificada de Activos de Red de Distribución (Subestaciones, Circuitos y Equipos Asociados).';
COMMENT ON COLUMN public.activos_red.codigo_activo IS 'Código único normalizado del activo de red (ej: SE-0104, CT-02).';
COMMENT ON COLUMN public.activos_red.estado_control IS 'CONTROLADO: Gestionado oficialmente por Distribución. NO_CONTROLADO: Activo externo o no mapeado.';
COMMENT ON COLUMN public.activos_red.estado_caracterizacion IS 'CARACTERIZADO: Ficha técnica auditada. PROVISIONAL: Registrado automáticamente desde ingesta.';

-- ------------------------------------------------------------------------------
-- 3. TRIGGER PARA ACTUALIZACIÓN AUTOMÁTICA DE TIMESTAMP
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.update_activos_red_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.ultima_actualizacion = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_activos_red_timestamp ON public.activos_red;
CREATE TRIGGER trg_activos_red_timestamp
    BEFORE UPDATE ON public.activos_red
    FOR EACH ROW
    EXECUTE FUNCTION public.update_activos_red_timestamp();

-- ------------------------------------------------------------------------------
-- 4. ÍNDICES DE RENDIMIENTO (BEST PRACTICES POSTGRES / SUPABASE)
-- ------------------------------------------------------------------------------
-- B-Tree Index compuesto para consultas analíticas y filtrado de reportes
CREATE INDEX IF NOT EXISTS idx_activos_red_clasificacion 
    ON public.activos_red (macro_proceso, estado_control, estado_caracterizacion);

-- Index B-Tree sobre tipo_activo
CREATE INDEX IF NOT EXISTS idx_activos_red_tipo 
    ON public.activos_red (tipo_activo);

-- Index GIN sobre la metadata técnica JSONB
CREATE INDEX IF NOT EXISTS idx_activos_red_metadata_gin 
    ON public.activos_red USING gin (metadata_tecnica);

-- ------------------------------------------------------------------------------
-- 5. FUNCIÓN RPC: INGESTA AUTOMÁTICA DE ACTIVOS (upsert_activo_ingesta)
-- ------------------------------------------------------------------------------
-- Esta función permite registrar o actualizar activos recibidos desde sistemas de telemetría/reportes
-- sin perder ningún registro operativo.
CREATE OR REPLACE FUNCTION public.upsert_activo_ingesta(
    p_codigo_activo VARCHAR(50),
    p_nombre TEXT DEFAULT NULL,
    p_tipo_activo VARCHAR(30) DEFAULT 'CT',
    p_macro_proceso macro_proceso_enum DEFAULT 'DISTRIBUCION',
    p_esquema_origen VARCHAR(50) DEFAULT 'public',
    p_metadata_tecnica JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID AS $$
DECLARE
    v_activo_id UUID;
BEGIN
    INSERT INTO public.activos_red (
        codigo_activo,
        nombre,
        tipo_activo,
        macro_proceso,
        estado_control,
        estado_caracterizacion,
        esquema_origen,
        metadata_tecnica
    )
    VALUES (
        p_codigo_activo,
        COALESCE(p_nombre, 'Activo ' || p_codigo_activo),
        p_tipo_activo,
        p_macro_proceso,
        'NO_CONTROLADO',
        'PROVISIONAL',
        p_esquema_origen,
        p_metadata_tecnica
    )
    ON CONFLICT (codigo_activo) DO UPDATE
    SET 
        ultima_actualizacion = now(),
        metadata_tecnica = public.activos_red.metadata_tecnica || EXCLUDED.metadata_tecnica
    RETURNING id INTO v_activo_id;

    RETURN v_activo_id;
END;
$$ LANGUAGE plpgsql SECURITY INVOKER SET search_path = public;

COMMENT ON FUNCTION public.upsert_activo_ingesta IS 'Registra automáticamente activos provisionales al recibir telemetría o actualiza su metadata si ya existen.';

-- ------------------------------------------------------------------------------
-- 6. VISTAS ANALÍTICAS (SECURITY INVOKER = TRUE)
-- ------------------------------------------------------------------------------
-- Vista 1: Activos Oficiales Caracterizados y Controlados de Distribución
CREATE OR REPLACE VIEW public.v_activos_distribucion_oficial
WITH (security_invoker = true) AS
SELECT 
    id,
    codigo_activo,
    nombre,
    tipo_activo,
    metadata_tecnica,
    fecha_registro,
    ultima_actualizacion
FROM public.activos_red
WHERE macro_proceso = 'DISTRIBUCION'
  AND estado_control = 'CONTROLADO'
  AND estado_caracterizacion = 'CARACTERIZADO';

-- Vista 2: Activos Pendientes por Caracterizar / Auditoría Técnica
CREATE OR REPLACE VIEW public.v_activos_pendientes_auditoria
WITH (security_invoker = true) AS
SELECT 
    id,
    codigo_activo,
    nombre,
    tipo_activo,
    macro_proceso,
    estado_control,
    estado_caracterizacion,
    esquema_origen,
    metadata_tecnica,
    fecha_registro
FROM public.activos_red
WHERE estado_caracterizacion = 'PROVISIONAL' 
   OR estado_control = 'NO_CONTROLADO';

-- ------------------------------------------------------------------------------
-- 7. POLÍTICAS DE SEGURIDAD RLS (ROW LEVEL SECURITY) EN SUPABASE
-- ------------------------------------------------------------------------------
ALTER TABLE public.activos_red ENABLE ROW LEVEL SECURITY;

-- Eliminación preventiva de políticas previas
DROP POLICY IF EXISTS "Permitir lectura de activos a usuarios autenticados y anon" ON public.activos_red;
DROP POLICY IF EXISTS "Permitir insercion a usuarios autenticados" ON public.activos_red;
DROP POLICY IF EXISTS "Permitir actualizacion a usuarios autenticados" ON public.activos_red;

-- Política SELECT: Permitir lectura pública o autenticada
CREATE POLICY "Permitir lectura de activos a usuarios autenticados y anon"
ON public.activos_red
FOR SELECT
TO authenticated, anon
USING (true);

-- Política INSERT: Permitir creación a usuarios autenticados
CREATE POLICY "Permitir insercion a usuarios autenticados"
ON public.activos_red
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Política UPDATE: Permitir actualización a usuarios autenticados
CREATE POLICY "Permitir actualizacion a usuarios autenticados"
ON public.activos_red
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- ------------------------------------------------------------------------------
-- 8. DATOS SEMILLA DE PRUEBA (SEED DATA - OPCIONAL)
-- ------------------------------------------------------------------------------
INSERT INTO public.activos_red 
    (codigo_activo, nombre, tipo_activo, macro_proceso, estado_control, estado_caracterizacion, metadata_tecnica)
VALUES 
    ('SE-0104', 'Subestación El Sitio 230kV', 'SE', 'DISTRIBUCION', 'CONTROLADO', 'CARACTERIZADO', '{"tension_kv": 230, "capacidad_mva": 100, "region": "Capital"}'::jsonb),
    ('SE-0208', 'Subestación La Mariposa 115kV', 'SE', 'DISTRIBUCION', 'CONTROLADO', 'CARACTERIZADO', '{"tension_kv": 115, "capacidad_mva": 60, "region": "Capital"}'::jsonb),
    ('CT-0104-01', 'Circuito El Bosque 13.8kV', 'CT', 'DISTRIBUCION', 'CONTROLADO', 'CARACTERIZADO', '{"tension_kv": 13.8, "se_cabecera": "SE-0104", "clientes_est": 4200}'::jsonb),
    ('CT-0104-02', 'Circuito Las Mercedes 13.8kV', 'CT', 'DISTRIBUCION', 'CONTROLADO', 'CARACTERIZADO', '{"tension_kv": 13.8, "se_cabecera": "SE-0104", "clientes_est": 3800}'::jsonb),
    ('CT-TEMP-99', 'Circuito Ingesta Automática Telemetría', 'CT', 'DISTRIBUCION', 'NO_CONTROLADO', 'PROVISIONAL', '{"tension_kv": 13.8, "origen_telemetria": "Sensor_IoT_04"}'::jsonb)
ON CONFLICT (codigo_activo) DO NOTHING;
