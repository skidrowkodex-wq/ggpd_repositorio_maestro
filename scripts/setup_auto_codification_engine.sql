-- ==============================================================================
-- ⚡ CORPOELEC - GGPD: MOTOR DE AUTO-CODIFICACIÓN Y GOBERNANZA DE ACTIVOS
-- Genera automáticamente códigos normalizados (ISO 8000 / CADAFE NS-P-105)
-- para nuevas Subestaciones (SE) y Circuitos (CT).
-- ==============================================================================

-- 1. Secuencias Atómicas Concurrencia-Safe
DO $$
DECLARE
    v_max_se INT;
    v_max_ct INT;
BEGIN
    SELECT COALESCE(MAX(NULLIF(substring(codigo_se from '\d+$'), '')::int), 871) INTO v_max_se FROM core.mae_subestaciones;
    SELECT COALESCE(MAX(NULLIF(substring(codigo_circuito from '\d+$'), '')::int), 4207) INTO v_max_ct FROM core.mae_circuitos;

    -- Drop existing if any to sync
    DROP SEQUENCE IF EXISTS core.seq_subestacion_correlativo CASCADE;
    DROP SEQUENCE IF EXISTS core.seq_circuito_correlativo CASCADE;

    EXECUTE format('CREATE SEQUENCE core.seq_subestacion_correlativo START WITH %s INCREMENT BY 1;', v_max_se + 1);
    EXECUTE format('CREATE SEQUENCE core.seq_circuito_correlativo START WITH %s INCREMENT BY 1;', v_max_ct + 1);
END $$;

-- 2. Función Generadora de Código de Subestación
CREATE OR REPLACE FUNCTION core.fn_generar_codigo_se(p_codigo_estado VARCHAR)
RETURNS VARCHAR AS $$
DECLARE
    v_seq INT;
    v_est VARCHAR;
BEGIN
    v_est := UPPER(TRIM(p_codigo_estado));
    IF v_est IS NULL OR v_est = '' THEN
        v_est := 'NAC';
    END IF;

    v_seq := nextval('core.seq_subestacion_correlativo');
    RETURN 'SE-' || v_est || '-' || LPAD(v_seq::text, 4, '0');
END;
$$ LANGUAGE plpgsql SECURITY INVOKER;

-- 3. Función Generadora de Código de Circuito
CREATE OR REPLACE FUNCTION core.fn_generar_codigo_ct(p_codigo_estado VARCHAR)
RETURNS VARCHAR AS $$
DECLARE
    v_seq INT;
    v_est VARCHAR;
BEGIN
    v_est := UPPER(TRIM(p_codigo_estado));
    IF v_est IS NULL OR v_est = '' THEN
        v_est := 'NAC';
    END IF;

    v_seq := nextval('core.seq_circuito_correlativo');
    RETURN 'CT-' || v_est || '-' || LPAD(v_seq::text, 5, '0');
END;
$$ LANGUAGE plpgsql SECURITY INVOKER;

-- 4. Trigger Function: Auto-Codificación y Normalización de Subestaciones
CREATE OR REPLACE FUNCTION core.trg_fn_auto_codificar_subestacion()
RETURNS TRIGGER AS $$
BEGIN
    -- Validar / Normalizar Estado
    NEW.codigo_estado := UPPER(TRIM(NEW.codigo_estado));
    IF NOT EXISTS (SELECT 1 FROM core.dim_estados WHERE codigo_estado = NEW.codigo_estado) THEN
        RAISE EXCEPTION 'Código de estado % inválido. Debe existir en core.dim_estados.', NEW.codigo_estado;
    END IF;

    -- Auto-Generar Código si viene vacío, NULL o 'AUTO'
    IF NEW.codigo_se IS NULL OR TRIM(NEW.codigo_se) = '' OR UPPER(TRIM(NEW.codigo_se)) IN ('AUTO', 'PROVISIONAL', 'PENDIENTE') THEN
        NEW.codigo_se := core.fn_generar_codigo_se(NEW.codigo_estado);
    ELSE
        NEW.codigo_se := UPPER(TRIM(NEW.codigo_se));
    END IF;

    -- Normalización de texto
    NEW.nombre_subestacion := UPPER(TRIM(NEW.nombre_subestacion));
    IF NEW.municipio IS NOT NULL THEN
        NEW.municipio := UPPER(TRIM(NEW.municipio));
    END IF;

    NEW.actualizado_en := clock_timestamp();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 5. Trigger Function: Auto-Codificación y Normalización de Circuitos
CREATE OR REPLACE FUNCTION core.trg_fn_auto_codificar_circuito()
RETURNS TRIGGER AS $$
DECLARE
    v_se_estado VARCHAR;
    v_se_nombre VARCHAR;
BEGIN
    -- Validar Subestación Padre
    NEW.codigo_se_padre := UPPER(TRIM(NEW.codigo_se_padre));
    SELECT codigo_estado, nombre_subestacion INTO v_se_estado, v_se_nombre
    FROM core.mae_subestaciones 
    WHERE codigo_se = NEW.codigo_se_padre;

    IF v_se_estado IS NULL THEN
        RAISE EXCEPTION 'Subestación padre con código % no existe en core.mae_subestaciones.', NEW.codigo_se_padre;
    END IF;

    -- Si no se proveyó estado, hereda el de la Subestación Padre
    IF NEW.codigo_estado IS NULL OR TRIM(NEW.codigo_estado) = '' THEN
        NEW.codigo_estado := v_se_estado;
    ELSE
        NEW.codigo_estado := UPPER(TRIM(NEW.codigo_estado));
    END IF;

    -- Auto-completar nombre de cabecera si viene vacío
    IF NEW.subestacion_cabecera IS NULL OR TRIM(NEW.subestacion_cabecera) = '' THEN
        NEW.subestacion_cabecera := v_se_nombre;
    ELSE
        NEW.subestacion_cabecera := UPPER(TRIM(NEW.subestacion_cabecera));
    END IF;

    -- Auto-Generar Código de Circuito si viene vacío, NULL o 'AUTO'
    IF NEW.codigo_circuito IS NULL OR TRIM(NEW.codigo_circuito) = '' OR UPPER(TRIM(NEW.codigo_circuito)) IN ('AUTO', 'PROVISIONAL', 'PENDIENTE') THEN
        NEW.codigo_circuito := core.fn_generar_codigo_ct(NEW.codigo_estado);
    ELSE
        NEW.codigo_circuito := UPPER(TRIM(NEW.codigo_circuito));
    END IF;

    -- Normalización de texto
    NEW.nombre_circuito := UPPER(TRIM(NEW.nombre_circuito));
    NEW.actualizado_en := clock_timestamp();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 6. Adjuntar Triggers a las tablas maestras
DROP TRIGGER IF EXISTS trg_subestacion_auto_cod ON core.mae_subestaciones;
CREATE TRIGGER trg_subestacion_auto_cod
    BEFORE INSERT OR UPDATE ON core.mae_subestaciones
    FOR EACH ROW
    EXECUTE FUNCTION core.trg_fn_auto_codificar_subestacion();

DROP TRIGGER IF EXISTS trg_circuito_auto_cod ON core.mae_circuitos;
CREATE TRIGGER trg_circuito_auto_cod
    BEFORE INSERT OR UPDATE ON core.mae_circuitos
    FOR EACH ROW
    EXECUTE FUNCTION core.trg_fn_auto_codificar_circuito();

