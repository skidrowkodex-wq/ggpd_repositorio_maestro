-- ====================================================================================
-- MIGRACIÓN 05: SEGURIDAD DE CREDENCIALES (HASHING) + PERMISO SCGCC EN LA TABLA MAESTRA
-- PROYECTO: Repositorio Maestro CORPOELEC (GGPD) • InsForge ggpd-data-maestra-0002
-- OBJETIVO:
--   1. Agregar la columna `permiso_scgcc` a `core.mae_usuarios_sistema` y a la vista
--      semántica `public.v_usuarios_sistema` (para que SCGCC y SIGI gestionen el acceso).
--   2. Hashear las contraseñas actuales (texto plano) con pgcrypto crypt(gen_salt('bf')).
--   3. Crear la función RPC `public.verificar_credencial_sistema()` como ÚNICO canal de
--      verificación de credenciales, exponiendo solo datos seguros (nunca el hash).
--
-- ⚠ NOTA DE ESTADO: Las secciones 1-4 de este archivo YA FUERON APLICADAS a la BD de
--   InsForge el 02-Sep-2026 (verificado por CLI y REST). La antigua "Sección 5"
--   (corrección de vista/policy SCGCC) se RETIRÓ porque la BD real de SCGCC ya difiere
--   del archivo `04_scgcc_schema_correspondencia.sql`: la vista actual
--   `v_scgcc_correspondencias_activas` no referencia `nombre` ni `rol`, y las tablas
--   SCGCC tienen RLS deshabilitado. Aplicar esa corrección habría causado regresión.
--   La reconciliación esquema SCGCC es una tarea de gobernanza aparte.
-- NORMATIVA: ISO/IEC 27001:2022 (A8.2, A8.5) • OWASP ASVS v4.0 (V2, V5) • ISACA COBIT (MEA02)
-- ====================================================================================

-- ------------------------------------------------------------------------------------
-- 1. AGREGAR COLUMNA permiso_scgcc A LA TABLA MAESTRA
-- ------------------------------------------------------------------------------------
ALTER TABLE core.mae_usuarios_sistema
    ADD COLUMN IF NOT EXISTS permiso_scgcc BOOLEAN DEFAULT FALSE;

-- Índice opcional para filtrado de acceso SCGCC
CREATE INDEX IF NOT EXISTS idx_usuarios_permiso_scgcc
    ON core.mae_usuarios_sistema(permiso_scgcc);

-- ------------------------------------------------------------------------------------
-- 2. RECREAR VISTA SEMÁNTICA public.v_usuarios_sistema INCLUYENDO permiso_scgcc
--    (Se mantiene la exclusión deliberada de password_hash de la vista pública)
-- ------------------------------------------------------------------------------------
CREATE OR REPLACE VIEW public.v_usuarios_sistema AS
SELECT
    u.id,
    u.username,
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

-- Otorgar SELECT de la vista a los roles de API de lectura (si no existiera ya)
GRANT SELECT ON public.v_usuarios_sistema TO anon, authenticated;

-- ------------------------------------------------------------------------------------
-- 3. HASHING DE CONTRASEÑAS EXISTENTES (pgcrypto • bcrypt)
--    Solo convierte a hash las que actualmente están en texto plano (sin prefijo $2)
-- ------------------------------------------------------------------------------------
UPDATE core.mae_usuarios_sistema
SET password_hash = crypt(password_hash, gen_salt('bf', 10))
WHERE password_hash IS NOT NULL
  AND password_hash NOT LIKE '$2%';

-- ------------------------------------------------------------------------------------
-- 4. FUNCIÓN RPC: VERIFICACIÓN SEGURA DE CREDENCIALES
--    Es EL único canal para validar login. Devuelve SOLO datos seguros (nunca el hash)
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
BEGIN
    -- Validación mínima de entrada (anti inyección / anti DoS)
    IF p_identifier IS NULL OR trim(p_identifier) = '' OR p_password IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'Credenciales incompletas.');
    END IF;

    -- Búsqueda por username o email institucional (normalizado a minúsculas)
    SELECT * INTO v_user
    FROM core.mae_usuarios_sistema
    WHERE username = lower(trim(p_identifier))
       OR email = lower(trim(p_identifier))
    LIMIT 1;

    IF v_user.id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'Usuario o correo institucional no encontrado.');
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
            'full_name', v_user.full_name,
            'email', v_user.email,
            'google_email', v_user.google_email,
            'role_code', v_user.role_code,
            'estado_codigo', v_user.estado_codigo,
            'unidad_organizativa', v_user.unidad_organizativa,
            'cargo', v_user.cargo,
            'status', v_user.status,
            'permiso_scgcc', v_user.permiso_scgcc,
            'ultimo_acceso', NOW()
        )
    );
    RETURN v_result;
END;
$$;

-- Permisos de ejecución: las apps (anon/authenticated) pueden invocar la RPC
REVOKE ALL ON FUNCTION public.verificar_credencial_sistema(TEXT, TEXT, VARCHAR) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.verificar_credencial_sistema(TEXT, TEXT, VARCHAR) TO anon, authenticated;

-- ====================================================================================
-- 5. (RETIRADO) Corrección de inconsistencias de vista/RLS de SCGCC
-- ====================================================================================
-- LA SECCIÓN 5 ORIGINAL (recrear `v_scgcc_correspondencias_activas` con full_name y
-- corregir la policy `p_scgcc_lectura_autenticados` con role_code) NO SE APLICA.
--
-- MOTIVO: La BD real de InsForge YA diverge del archivo `04_scgcc_schema_correspondencia.sql`:
--   1. La vista actual `public.v_scgcc_correspondencias_activas` fue redefinida en una
--      iteración posterior y NO hace JOIN con `core.mae_usuarios_sistema` (ni usa `nombre`
--      ni `rol`). No existe riesgo de la columna inexistente en la vista actual.
--   2. Las tablas `scgcc.mae_correspondencias` y `scgcc.mae_oficios_salida` tienen
--      Row Level Security DESHABILITADO (relrowsecurity = false) y NO existe la policy
--      `p_scgcc_lectura_autenticados` en la BD.
--   3. Solo existen 2 tablas en el esquema `scgcc` (mae_correspondencias, mae_oficios_salida),
--      no las 5 que describe el archivo 04.
--
-- PENDIENTE (gobernanza): reconciliar `04_scgcc_schema_correspondencia.sql` con la BD real
-- y, en una iteración aparte, decidir el modelo RLS definitivo (con permiso_scgcc y role_code)
-- que hoy NO está activo. Ver `retrospective.MD` sección 7.
