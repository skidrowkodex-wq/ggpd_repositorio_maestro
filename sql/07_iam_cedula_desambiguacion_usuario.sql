-- ====================================================================================
-- MIGRACIÓN 07: CÉDULA COMO IDENTIDAD CANÓNICA (ISO 8000-110) + DESAMBIGUACIÓN
--               DE USERNAME PARA HOMÓNIMOS EN LA TABLA MAESTRA IAM
-- PROYECTO: Repositorio Maestro CORPOELEC (GGPD) • InsForge ggpd-data-maestra-0002
-- OBJETIVO:
--   1. Agregar la columna `cedula` (VARCHAR, UNIQUE parcial) a core.mae_usuarios_sistema
--      como ancla canónica de identidad única por persona (ISO 8000-110). Permite
--      distinguir homónimos (dos "Adrián Correa" distintos) manteniendo UNIQUE en
--      username, email y ahora cedula.
--   2. Exponer `cedula` en la vista semántica public.v_usuarios_sistema y en la RPC
--      public.verificar_credencial_sistema (también permite autenticar por cédula).
--   3. Crear el generador determinístico de username con desambiguación automática:
--      * Primera persona  -> nombre.apellido   (ej: adrian.correa)
--      * Segunda homónima -> nombre.apellido2  (ej: adrian.correa2)
--      * Tercera y sucesivas -> <base>3, <base>4, ...
--      * Si la cédula ya está registrada, reutiliza el username existente (no duplica).
--   4. Exponer la RPC public.sugerir_username_unico para que SIGI (gestión de usuarios)
--      sugiera el username único en tiempo real al registrar un nuevo usuario.
-- NORMATIVA: ISO/IEC 27001:2022 (A8.2, A8.5) • ISO 8000-110 (unicidad sintáctica)
--            • OWASP ASVS v4.0 (V2, V5) • ISACA COBIT 2019 (MEA02)
-- ====================================================================================

-- ------------------------------------------------------------------------------------
-- 1. COLUMNA cedula EN LA TABLA MAESTRA + ÍNDICE ÚNICO PARCIAL
--    (permite NULL mientras se completa el censo; bloquea duplicados una vez cargada)
-- ------------------------------------------------------------------------------------
ALTER TABLE core.mae_usuarios_sistema
    ADD COLUMN IF NOT EXISTS cedula VARCHAR(20);

CREATE UNIQUE INDEX IF NOT EXISTS idx_usuarios_cedula_unico
    ON core.mae_usuarios_sistema(cedula)
    WHERE cedula IS NOT NULL AND cedula <> '';

-- ------------------------------------------------------------------------------------
-- 2. VISTA SEMÁNTICA public.v_usuarios_sistema INCLUYENDO cedula
--    (Se mantiene la exclusión deliberada de password_hash de la vista pública)
--    NOTA: se hace DROP+CREATE (no CREATE OR REPLACE) porque Postgres no permite
--    reordenar/insertar columnas en mitad de una vista existente.
-- ------------------------------------------------------------------------------------
DROP VIEW IF EXISTS public.v_usuarios_sistema;
CREATE VIEW public.v_usuarios_sistema AS
SELECT
    u.id,
    u.username,
    u.cedula,
    u.full_name,
    u.email,
    u.google_email,
    u.role_code,
    u.estado_codigo,
    e.nombre_estado,
    e.codigo_region,
    u.unidad_organizativa,
    u.cargo,
    u.status,
    u.permiso_sigi,
    u.permiso_sctis,
    u.permiso_scein,
    u.permiso_scppe,
    u.permiso_scmtp,
    u.permiso_gdrive,
    u.permiso_scgcc,
    u.ultimo_acceso,
    u.fecha_creacion,
    u.ultima_actualizacion
FROM core.mae_usuarios_sistema u
LEFT JOIN core.dim_estados e ON e.codigo_estado::text = u.estado_codigo::text;

GRANT SELECT ON public.v_usuarios_sistema TO anon, authenticated;

-- ------------------------------------------------------------------------------------
-- 3. NORMALIZACIÓN DE NOMBRES (ISO 8000-110: datos sintácticamente limpios)
--    Convierte a minúsculas y elimina acentos/diacríticos del español venezolano.
-- ------------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION core.iam_no_acentos(p_text TEXT)
RETURNS TEXT
LANGUAGE sql
IMMUTABLE
AS $$
    SELECT translate(lower(coalesce(p_text, '')), 'áéíóúüñ', 'aeiouun');
$$;

-- ------------------------------------------------------------------------------------
-- 4. BASE TIPOGRÁFICA DE USERNAME: nombre.apellido[.segundo_apellido]
-- ------------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION core.iam_username_base(
    p_nombre TEXT,
    p_apellido1 TEXT,
    p_apellido2 TEXT DEFAULT NULL
)
RETURNS TEXT
LANGUAGE sql
IMMUTABLE
AS $$
    SELECT NULLIF(concat_ws('.',
            NULLIF(core.iam_no_acentos(p_nombre), ''),
            NULLIF(core.iam_no_acentos(p_apellido1), '')
        ), '')
        || CASE WHEN core.iam_no_acentos(p_apellido2) <> ''
                THEN '.' || core.iam_no_acentos(p_apellido2)
                ELSE ''
           END;
$$;

-- ------------------------------------------------------------------------------------
-- 5. GENERADOR DETERMINÍSTICO DE USERNAME ÚNICO (SECURITY DEFINER: lee la tabla
--    maestra sin fricción con RLS y devuelve la propuesta desambiguada).
--    Regla: <base>, <base>2, <base>3, ...  |  Si la cédula ya existe -> su username.
-- ------------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION core.iam_username_unico(
    p_base TEXT,
    p_cedula TEXT DEFAULT NULL
)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, core
AS $$
DECLARE
    v_base TEXT;
    v_cedula TEXT;
    v_candidate TEXT;
    v_suffix INT := 2;
    v_existing_username TEXT;
BEGIN
    v_base := core.iam_no_acentos(p_base);
    v_base := regexp_replace(v_base, '[^a-z0-9._-]', '', 'g');
    IF v_base IS NULL OR v_base = '' THEN
        RAISE EXCEPTION 'Base de username inválida.';
    END IF;

    -- Si la cédula ya está registrada, NO duplicar: devolver su username actual
    IF p_cedula IS NOT NULL THEN
        v_cedula := upper(regexp_replace(trim(p_cedula), '\s+', '', 'g'));
        IF v_cedula <> '' THEN
            SELECT username INTO v_existing_username
            FROM core.mae_usuarios_sistema
            WHERE cedula IS NOT NULL AND cedula <> '' AND cedula = v_cedula
            LIMIT 1;
            IF v_existing_username IS NOT NULL THEN
                RETURN v_existing_username;
            END IF;
        END IF;
    END IF;

    v_candidate := v_base;
    IF NOT EXISTS (SELECT 1 FROM core.mae_usuarios_sistema WHERE username = v_candidate) THEN
        RETURN v_candidate;
    END IF;

    LOOP
        v_candidate := v_base || v_suffix::text;
        IF NOT EXISTS (SELECT 1 FROM core.mae_usuarios_sistema WHERE username = v_candidate) THEN
            RETURN v_candidate;
        END IF;
        v_suffix := v_suffix + 1;
    END LOOP;
END;
$$;

GRANT EXECUTE ON FUNCTION core.iam_username_unico(TEXT, TEXT) TO anon, authenticated;

-- ------------------------------------------------------------------------------------
-- 6. RPC pública public.sugerir_username_unico (consumida por SIGI en tiempo real)
--    POST /api/database/rpc/sugerir_username_unico
--    Body: { p_nombre, p_apellido1, p_apellido2?, p_cedula? }
--    Respuesta: { success, base, suggested, homonym }
-- ------------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.sugerir_username_unico(
    p_nombre TEXT,
    p_apellido1 TEXT,
    p_apellido2 TEXT DEFAULT NULL,
    p_cedula TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
STABLE
SET search_path = public, core
AS $$
DECLARE
    v_base TEXT;
    v_suggested TEXT;
BEGIN
    v_base := core.iam_username_base(p_nombre, p_apellido1, p_apellido2);
    v_suggested := core.iam_username_unico(v_base, p_cedula);
    RETURN jsonb_build_object(
        'success', true,
        'base', v_base,
        'suggested', v_suggested,
        'homonym', (v_suggested <> v_base)
    );
END;
$$;

REVOKE ALL ON FUNCTION public.sugerir_username_unico(TEXT, TEXT, TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.sugerir_username_unico(TEXT, TEXT, TEXT, TEXT) TO anon, authenticated;

-- ------------------------------------------------------------------------------------
-- 7. RECREAR RPC public.verificar_credencial_sistema
--    * Autenticación adicional por cédula (normalizada: mayúsculas, sin espacios).
--    * Devuelve cedula y la matriz completa de permisos por app (antes solo permiso_scgcc),
--      para que SIGI/SCGCC/etc. reflejen fielmente la matriz IAM tras el login.
--    * NUNCA expone password_hash.
-- ------------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.verificar_credencial_sistema(
    p_identifier TEXT,
    p_password TEXT,
    p_app VARCHAR(30) DEFAULT 'SCGCC'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, core
AS $$
DECLARE
    v_user core.mae_usuarios_sistema%ROWTYPE;
    v_permiso BOOLEAN;
    v_result JSONB;
    v_cedula TEXT;
BEGIN
    -- Validación mínima de entrada (anti inyección / anti DoS)
    IF p_identifier IS NULL OR trim(p_identifier) = '' OR p_password IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'Credenciales incompletas.');
    END IF;

    v_cedula := upper(regexp_replace(trim(p_identifier), '\s+', '', 'g'));

    -- Búsqueda por username, correo institucional o cédula (normalizada)
    SELECT * INTO v_user
    FROM core.mae_usuarios_sistema
    WHERE username = lower(trim(p_identifier))
       OR email = lower(trim(p_identifier))
       OR (cedula IS NOT NULL AND cedula <> '' AND cedula = v_cedula)
    LIMIT 1;

    IF v_user.id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'Usuario, correo institucional o cédula no encontrado.');
    END IF;

    -- Kill-switch: cuenta suspendida o en revisión no puede ingresar
    IF v_user.status <> 'ACTIVO' THEN
        RETURN jsonb_build_object('success', false, 'error', 'La cuenta no está ACTIVA. Contacte al Administrador GGPD.');
    END IF;

    -- Matriz de acceso por aplicación solicitada
    v_permiso := TRUE;
    IF upper(p_app) = 'SCGCC' THEN
        v_permiso := v_user.permiso_scgcc;
    ELSIF upper(p_app) = 'SCMTP' THEN
        v_permiso := v_user.permiso_scmtp;
    ELSIF upper(p_app) = 'SCTIS' THEN
        v_permiso := v_user.permiso_sctis;
    ELSIF upper(p_app) = 'SCEIN' THEN
        v_permiso := v_user.permiso_scein;
    ELSIF upper(p_app) = 'SCPPE' THEN
        v_permiso := v_user.permiso_scppe;
    ELSIF upper(p_app) = 'SIGI' THEN
        v_permiso := v_user.permiso_sigi;
    END IF;

    IF NOT v_permiso THEN
        RETURN jsonb_build_object('success', false, 'error', 'La cuenta no tiene permiso para esta aplicación.');
    END IF;

    -- Verificación de contraseña con comparación de hash (bcrypt / pgcrypto)
    IF v_user.password_hash IS NULL
       OR v_user.password_hash = ''
       OR NOT (v_user.password_hash = crypt(p_password, v_user.password_hash)) THEN
        RETURN jsonb_build_object('success', false, 'error', 'Contraseña incorrecta.');
    END IF;

    -- Registro de auditoría del último acceso (ISO 27001 / COBIT MEA02)
    UPDATE core.mae_usuarios_sistema
    SET ultimo_acceso = NOW()
    WHERE id = v_user.id;

    -- Retornar SOLO campos seguros (ninguna información de credenciales)
    v_result := jsonb_build_object(
        'success', true,
        'user', jsonb_build_object(
            'id', v_user.id,
            'username', v_user.username,
            'cedula', v_user.cedula,
            'full_name', v_user.full_name,
            'email', v_user.email,
            'google_email', v_user.google_email,
            'role_code', v_user.role_code,
            'estado_codigo', v_user.estado_codigo,
            'unidad_organizativa', v_user.unidad_organizativa,
            'cargo', v_user.cargo,
            'status', v_user.status,
            'permiso_sigi', v_user.permiso_sigi,
            'permiso_sctis', v_user.permiso_sctis,
            'permiso_scein', v_user.permiso_scein,
            'permiso_scppe', v_user.permiso_scppe,
            'permiso_scmtp', v_user.permiso_scmtp,
            'permiso_scgcc', v_user.permiso_scgcc,
            'permiso_gdrive', v_user.permiso_gdrive,
            'ultimo_acceso', NOW()
        )
    );
    RETURN v_result;
END;
$$;

-- Permisos de ejecución: las apps (anon/authenticated) pueden invocar la RPC
REVOKE ALL ON FUNCTION public.verificar_credencial_sistema(TEXT, TEXT, VARCHAR) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.verificar_credencial_sistema(TEXT, TEXT, VARCHAR) TO anon, authenticated;