-- ====================================================================================
-- CORPOELEC GGPD | IAM CENTRAL — APROVISIONAMIENTO LOCAL OFFLINE (PostgreSQL 18)
-- ====================================================================================
-- Crea en la base local (`cnd_sen_unifilar_2025`) la MISMA estructura de identidad que
-- InsForge, para que SIGAD / SIGA-SEN autentiquen SIN INTERNET a través del puente
-- local (scripts/local_pg_bridge.py) usando la RPC public.verificar_credencial_sistema.
--
--   · core.mae_usuarios_sistema      : tabla maestra de usuarios (bcrypt en password_hash)
--   · public.verificar_credencial_sistema : verificación de credenciales fail-closed
--
-- La carga de usuarios NO se incluye aquí (evita versionar hashes): se aplica aparte
-- el archivo generado por `scripts/sync_iam_seed.py` -> `database/local_iam_seed.sql`.
--
-- Idempotente y no destructivo. NORMATIVA: ISO/IEC 27001 A.5.15/A.5.18 · ISO 8000-110
-- ====================================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ------------------------------------------------------------------------------------
-- Tabla maestra IAM (paridad 1:1 con InsForge ggpd-data-maestra-0002)
-- ------------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS core.mae_usuarios_sistema (
    id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    username             varchar(50)  NOT NULL UNIQUE,
    full_name            varchar(150) NOT NULL,
    email                varchar(150) NOT NULL UNIQUE,
    google_email         varchar(150),
    password_hash        varchar(255) NOT NULL,
    role_code            varchar(30)  NOT NULL,
    estado_codigo        varchar(3),
    unidad_organizativa  varchar(150),
    cargo                varchar(100),
    status               varchar(20)  DEFAULT 'ACTIVO',
    permiso_sigi         boolean DEFAULT true,
    permiso_sctis        boolean DEFAULT false,
    permiso_scein        boolean DEFAULT false,
    permiso_scppe        boolean DEFAULT false,
    permiso_scmtp        boolean DEFAULT false,
    permiso_gdrive       boolean DEFAULT false,
    permiso_scgcc        boolean DEFAULT false,
    ultimo_acceso        timestamptz,
    creado_por           varchar(50) DEFAULT 'SISTEMA',
    fecha_creacion       timestamptz DEFAULT now(),
    ultima_actualizacion timestamptz DEFAULT now(),
    cedula               varchar(20)
);

-- Columnas de permisos por aplicación (idempotente para bases ya existentes)
ALTER TABLE core.mae_usuarios_sistema ADD COLUMN IF NOT EXISTS permiso_sigad    boolean NOT NULL DEFAULT false;
ALTER TABLE core.mae_usuarios_sistema ADD COLUMN IF NOT EXISTS permiso_siga_sen boolean NOT NULL DEFAULT false;

-- ------------------------------------------------------------------------------------
-- RPC de verificación de credenciales (idéntica a la migración 08 de la nube)
-- FAIL-CLOSED: app desconocida => denegado. Verificación bcrypt vía pgcrypto.
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
    v_permiso BOOLEAN := FALSE;   -- FAIL-CLOSED
    v_result JSONB;
    v_cedula TEXT;
BEGIN
    IF p_identifier IS NULL OR trim(p_identifier) = '' OR p_password IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'Credenciales incompletas.');
    END IF;

    v_cedula := upper(regexp_replace(trim(p_identifier), '\s+', '', 'g'));

    SELECT * INTO v_user
    FROM core.mae_usuarios_sistema
    WHERE username = lower(trim(p_identifier))
       OR email = lower(trim(p_identifier))
       OR (cedula IS NOT NULL AND cedula <> '' AND cedula = v_cedula)
    LIMIT 1;

    IF v_user.id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'Usuario, correo institucional o cédula no encontrado.');
    END IF;

    IF v_user.status <> 'ACTIVO' THEN
        RETURN jsonb_build_object('success', false, 'error', 'La cuenta no está ACTIVA. Contacte al Administrador GGPD.');
    END IF;

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
        v_permiso := FALSE;
    END IF;

    IF NOT v_permiso THEN
        RETURN jsonb_build_object('success', false, 'error', 'La cuenta no tiene permiso para esta aplicación.');
    END IF;

    IF v_user.password_hash IS NULL
       OR v_user.password_hash = ''
       OR NOT (v_user.password_hash = crypt(p_password, v_user.password_hash)) THEN
        RETURN jsonb_build_object('success', false, 'error', 'Contraseña incorrecta.');
    END IF;

    UPDATE core.mae_usuarios_sistema
    SET ultimo_acceso = NOW()
    WHERE id = v_user.id;

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
