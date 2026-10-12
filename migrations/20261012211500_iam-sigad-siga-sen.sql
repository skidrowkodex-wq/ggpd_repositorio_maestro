-- ====================================================================================
-- MIGRACIÓN 08: IAM CENTRAL PARA SIGAD Y SIGA-SEN (MATRIZ DE PERMISOS + RPC FAIL-CLOSED)
-- PROYECTO: Repositorio Maestro CORPOELEC (GGPD) • InsForge ggpd-data-maestra-0002
-- OBJETIVO:
--   1. Incorporar los permisos por aplicación `permiso_sigad` y `permiso_siga_sen`
--      a la tabla maestra IAM core.mae_usuarios_sistema (ISO 27001 A.5.15, A.5.18).
--   2. Exponerlos en la vista semántica public.v_usuarios_sistema.
--   3. Endurecer public.verificar_credencial_sistema:
--        · Cambiar el valor por defecto de la matriz a FAIL-CLOSED (FALSE). Antes era
--          `v_permiso := TRUE`, por lo que CUALQUIER p_app desconocido concedía acceso
--          a cualquier cuenta ACTIVA (fail-open, OWASP ASVS V4 / Broken Access Control).
--        · Añadir las ramas SIGAD y SIGA-SEN.
--        · Devolver permiso_sigad y permiso_siga_sen en el JSON del usuario.
--   4. Asignar el acceso del PILOTO (núcleo GGPD + analista estadal de Táchira).
--   5. Habilitar Row Level Security en sigad.* y sigad_sen.* (fail-closed: sin políticas
--      permisivas). Se documenta que la política por usuario requiere JWT de plataforma;
--      por ahora la app accede con la clave de servicio (BYPASSRLS) y las vistas
--      federadas propiedad del runner (BYPASSRLS) siguen resolviendo sin fricción.
-- NORMATIVA: ISO/IEC 27001:2022 (A.5.15, A.8.2, A.8.5) • ISO 8000-110 • OWASP ASVS v4.0
--            (V2, V4) • ISACA COBIT 2019 (MEA02)
-- ====================================================================================

-- ------------------------------------------------------------------------------------
-- 1. COLUMNAS DE PERMISO POR APLICACIÓN EN LA TABLA MAESTRA
-- ------------------------------------------------------------------------------------
ALTER TABLE core.mae_usuarios_sistema
    ADD COLUMN IF NOT EXISTS permiso_sigad BOOLEAN NOT NULL DEFAULT FALSE;

ALTER TABLE core.mae_usuarios_sistema
    ADD COLUMN IF NOT EXISTS permiso_siga_sen BOOLEAN NOT NULL DEFAULT FALSE;

-- ------------------------------------------------------------------------------------
-- 2. VISTA SEMÁNTICA public.v_usuarios_sistema (con los dos permisos nuevos)
--    DROP+CREATE: Postgres no permite insertar columnas en mitad de una vista.
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
    u.permiso_sigad,
    u.permiso_siga_sen,
    u.ultimo_acceso,
    u.fecha_creacion,
    u.ultima_actualizacion
FROM core.mae_usuarios_sistema u
LEFT JOIN core.dim_estados e ON e.codigo_estado::text = u.estado_codigo::text;

GRANT SELECT ON public.v_usuarios_sistema TO anon, authenticated;

-- ------------------------------------------------------------------------------------
-- 3. RPC public.verificar_credencial_sistema (FAIL-CLOSED + ramas SIGAD / SIGA-SEN)
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
    v_permiso BOOLEAN := FALSE;   -- FAIL-CLOSED (antes fail-open: TRUE)
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

    -- Matriz de acceso por aplicación solicitada (por defecto DENEGADO)
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
    ELSIF upper(p_app) = 'SIGAD' THEN
        v_permiso := v_user.permiso_sigad;
    ELSIF upper(p_app) = 'SIGA-SEN' THEN
        v_permiso := v_user.permiso_siga_sen;
    ELSE
        v_permiso := FALSE;   -- app desconocida => denegado
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
            'permiso_sigad', v_user.permiso_sigad,
            'permiso_siga_sen', v_user.permiso_siga_sen,
            'ultimo_acceso', NOW()
        )
    );
    RETURN v_result;
END;
$$;

REVOKE ALL ON FUNCTION public.verificar_credencial_sistema(TEXT, TEXT, VARCHAR) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.verificar_credencial_sistema(TEXT, TEXT, VARCHAR) TO anon, authenticated;

-- ------------------------------------------------------------------------------------
-- 4. ASIGNACIÓN DE ACCESO DEL PILOTO (núcleo GGPD + analista estadal Táchira)
--    Remapeo fiel de la lista previa (admin.ggpd, y_cipiran, j_jimenez, j_pacheco,
--    e_tachira, a_auditor) a las cuentas reales del IAM + núcleo corporativo/técnico.
--    Para ampliar cobertura, añada usernames o cambie a una condición por role_code.
-- ------------------------------------------------------------------------------------
UPDATE core.mae_usuarios_sistema
SET permiso_sigad = TRUE,
    permiso_siga_sen = TRUE
WHERE username IN (
    -- Núcleo GGPD (roles corporativos / técnicos)
    'admin.ggpd', 'yvan.cipiran', 'jorge.jimenez', 'josue.pacheco',
    'adrian.correa', 'catherina.favio', 'diana.rivero', 'blanca.gonzalez',
    'jaime.bencomo', 'walter.prato', 'marina.torres', 'carlos.mendoza',
    -- Analista estadal del piloto (Táchira)
    'distribucion.tachira'
);

-- ------------------------------------------------------------------------------------
-- 5. RLS en sigad.* y sigad_sen.* (fail-closed: se habilita SIN políticas permisivas)
--    La app accede con la clave de servicio (BYPASSRLS) y las vistas federadas
--    propiedad del runner siguen resolviendo. Las políticas por usuario llegarán con
--    la migración al JWT de plataforma (evita "RLS de fachada").
-- ------------------------------------------------------------------------------------
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN
        SELECT n.nspname AS sch, c.relname AS tbl
        FROM pg_class c
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE c.relkind = 'r'
          AND n.nspname IN ('sigad', 'sigad_sen')
    LOOP
        EXECUTE format('ALTER TABLE %I.%I ENABLE ROW LEVEL SECURITY', r.sch, r.tbl);
    END LOOP;
END;
$$;
