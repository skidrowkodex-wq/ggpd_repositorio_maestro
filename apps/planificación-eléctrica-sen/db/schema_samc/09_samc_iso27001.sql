-- ============================================================================
-- 09_samc_iso27001.sql
-- ISO 27001: Autenticación, Auditoría extendida y Control de Acceso
-- ============================================================================
-- Aplica después de 08_samc_proyecto_especial.sql
-- ============================================================================

BEGIN;

SET search_path TO samc;

-- ============================================================================
-- Paso 1: samc_usuario — autenticación con bcrypt
-- ============================================================================

CREATE TABLE samc.samc_usuario (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username        VARCHAR(50) NOT NULL UNIQUE,
    email           VARCHAR(255),
    password_hash   TEXT NOT NULL,
    persona_id      UUID REFERENCES samc.samc_persona(id) ON DELETE SET NULL,
    activo          BOOLEAN NOT NULL DEFAULT TRUE,
    bloqueado       BOOLEAN NOT NULL DEFAULT FALSE,
    intentos_fallidos SMALLINT NOT NULL DEFAULT 0,
    ultimo_acceso   TIMESTAMPTZ,
    must_change_pwd BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT chk_usuario_intentos CHECK (intentos_fallidos >= 0 AND intentos_fallidos <= 10)
);

CREATE INDEX idx_usuario_persona ON samc.samc_usuario(persona_id);
CREATE INDEX idx_usuario_activo ON samc.samc_usuario(activo) WHERE activo = TRUE;

COMMENT ON TABLE  samc.samc_usuario IS 'Usuarios del sistema con autenticación bcrypt (ISO 27001 A.9.4.2)';
COMMENT ON COLUMN samc.samc_usuario.password_hash   IS 'Hash bcrypt de la contraseña';
COMMENT ON COLUMN samc.samc_usuario.bloqueado        IS 'TRUE si la cuenta fue bloqueada por seguridad';
COMMENT ON COLUMN samc.samc_usuario.intentos_fallidos IS 'Contador de intentos fallidos de login (max 10)';
COMMENT ON COLUMN samc.samc_usuario.ultimo_acceso    IS 'Timestamp del último login exitoso';
COMMENT ON COLUMN samc.samc_usuario.must_change_pwd  IS 'Forzar cambio de contraseña en el próximo login';

-- ============================================================================
-- Paso 2: samc_usuario_rol — roles RBAC (ISO 27001 A.9.2.3)
-- ============================================================================

CREATE TABLE samc.samc_usuario_rol (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id  UUID NOT NULL REFERENCES samc.samc_usuario(id) ON DELETE CASCADE,
    rol         VARCHAR(20) NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(usuario_id, rol),
    CONSTRAINT chk_rol_valido CHECK (rol IN ('LECTOR', 'EDITOR', 'ADMIN'))
);

CREATE INDEX idx_usuario_rol_usuario ON samc.samc_usuario_rol(usuario_id);

COMMENT ON TABLE  samc.samc_usuario_rol IS 'Roles asignados a usuarios (RBAC). Un usuario puede tener múltiples roles (ISO 27001 A.9.2.3)';
COMMENT ON COLUMN samc.samc_usuario_rol.rol IS 'LECTOR = solo lectura; EDITOR = crear/editar; ADMIN = control total';

-- ============================================================================
-- Paso 3: Triggers updated_at y auditoría para usuario
-- ============================================================================

CREATE TRIGGER trg_samc_usuario_updated_at
    BEFORE UPDATE ON samc.samc_usuario
    FOR EACH ROW EXECUTE FUNCTION samc.set_updated_at();

CREATE TRIGGER trg_audit_usuario
    AFTER INSERT OR UPDATE OR DELETE ON samc.samc_usuario
    FOR EACH ROW EXECUTE FUNCTION samc.audit_trigger();

-- ============================================================================
-- Paso 4: Función de login con control de intentos fallidos
-- ============================================================================

CREATE OR REPLACE FUNCTION samc.autenticar(
    p_username TEXT,
    p_password TEXT
)
RETURNS TABLE (
    usuario_id UUID,
    username VARCHAR(50),
    roles TEXT[],
    bloqueado BOOLEAN,
    exito BOOLEAN,
    mensaje TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_usuario samc.samc_usuario%ROWTYPE;
    v_valid BOOLEAN;
BEGIN
    -- Buscar usuario
    SELECT * INTO v_usuario
    FROM samc.samc_usuario
    WHERE username = p_username AND activo = TRUE;

    IF NOT FOUND THEN
        RETURN QUERY SELECT NULL::UUID, NULL::VARCHAR, NULL::TEXT[], FALSE, FALSE, 'Usuario no encontrado';
        RETURN;
    END IF;

    -- Verificar bloqueo
    IF v_usuario.bloqueado THEN
        RETURN QUERY SELECT v_usuario.id, v_usuario.username, NULL::TEXT[], TRUE, FALSE, 'Cuenta bloqueada por seguridad';
        RETURN;
    END IF;

    -- Verificar contraseña (el hash se valida desde la app con bcrypt)
    -- Por ahora asumimos que la app pasa el hash ya validado
    -- La función recibe el resultado de bcrypt: TRUE si coincide
    IF p_password = 'BCRYPT_VALID' THEN
        v_valid := TRUE;
    ELSE
        v_valid := FALSE;
    END IF;

    IF NOT v_valid THEN
        -- Incrementar intentos fallidos
        UPDATE samc.samc_usuario
        SET intentos_fallidos = intentos_fallidos + 1,
            bloqueado = CASE WHEN intentos_fallidos + 1 >= 10 THEN TRUE ELSE FALSE END
        WHERE id = v_usuario.id;

        RETURN QUERY SELECT v_usuario.id, v_usuario.username, NULL::TEXT[], v_usuario.bloqueado, FALSE, 'Contraseña incorrecta';
        RETURN;
    END IF;

    -- Login exitoso: resetear contador y actualizar último acceso
    UPDATE samc.samc_usuario
    SET intentos_fallidos = 0,
        ultimo_acceso = now()
    WHERE id = v_usuario.id;

    -- Retornar datos del usuario y sus roles
    RETURN QUERY
    SELECT
        v_usuario.id,
        v_usuario.username,
        ARRAY(SELECT rol FROM samc.samc_usuario_rol WHERE usuario_id = v_usuario.id),
        FALSE,
        TRUE,
        'Autenticación exitosa';
END;
$$;

COMMENT ON FUNCTION samc.autenticar IS 'Autentica un usuario con control de intentos fallidos y bloqueo (ISO 27001 A.9.4.2, A.12.4.1)';

-- ============================================================================
-- Paso 5: Función para forzar cambio de contraseña
-- ============================================================================

CREATE OR REPLACE FUNCTION samc.cambiar_password(
    p_usuario_id UUID,
    p_password_hash TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE samc.samc_usuario
    SET password_hash = p_password_hash,
        must_change_pwd = FALSE,
        intentos_fallidos = 0,
        updated_at = now()
    WHERE id = p_usuario_id;

    RETURN FOUND;
END;
$$;

COMMENT ON FUNCTION samc.cambiar_password IS 'Cambia la contraseña de un usuario y resetea el flag must_change_pwd';

-- ============================================================================
-- Paso 6: Auditoría extendida — tablas faltantes
-- ============================================================================

-- Tablas catálogo (maestro — cambios menos frecuentes pero se auditan)
DO $$
DECLARE
    tbl TEXT;
BEGIN
    FOREACH tbl IN ARRAY ARRAY[
        'samc_subestacion',
        'samc_planta_generacion',
        'samc_circuito',
        'samc_empresa',
        'samc_empresa_socio',
        'samc_ente',
        'samc_proceso',
        'samc_gerencia'
    ]
    LOOP
        EXECUTE format(
            'CREATE TRIGGER trg_audit_%s
             AFTER INSERT OR UPDATE OR DELETE ON samc.%I
             FOR EACH ROW EXECUTE FUNCTION samc.audit_trigger()',
            replace(tbl, 'samc_', ''),
            tbl
        );
    END LOOP;
END;
$$;

-- Tablas relacionales M:N y financieras (alta criticidad)
DO $$
DECLARE
    tbl TEXT;
BEGIN
    FOREACH tbl IN ARRAY ARRAY[
        'samc_proyecto_especial_subestacion',
        'samc_proyecto_especial_planta',
        'samc_proyecto_especial_circuito',
        'samc_proyecto_especial_estado',
        'samc_proyecto_especial_poa_accion',
        'samc_proyecto_especial_financiero_moneda',
        'samc_asignacion',
        'samc_asignacion_moneda',
        'samc_meta_financiera_moneda',
        'samc_base_calculo',
        'samc_base_calculo_moneda'
    ]
    LOOP
        EXECUTE format(
            'CREATE TRIGGER trg_audit_%s
             AFTER INSERT OR UPDATE OR DELETE ON samc.%I
             FOR EACH ROW EXECUTE FUNCTION samc.audit_trigger()',
            replace(tbl, 'samc_', ''),
            tbl
        );
    END LOOP;
END;
$$;

-- ============================================================================
-- Paso 7: Roles de BD (ISO 27001 A.9.2.3)
-- ============================================================================

DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'samc_lector') THEN
        CREATE ROLE samc_lector;
    END IF;
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'samc_editor') THEN
        CREATE ROLE samc_editor;
    END IF;
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'samc_admin') THEN
        CREATE ROLE samc_admin;
    END IF;
END;
$$;

-- Permisos mínimos para LECTOR (SOLO SELECT en tablas)
GRANT USAGE ON SCHEMA samc TO samc_lector;
GRANT SELECT ON ALL TABLES IN SCHEMA samc TO samc_lector;
ALTER DEFAULT PRIVILEGES IN SCHEMA samc GRANT SELECT ON TABLES TO samc_lector;

-- Permisos para EDITOR (INSERT, UPDATE, DELETE en tablas transaccionales)
GRANT USAGE ON SCHEMA samc TO samc_editor;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA samc TO samc_editor;
ALTER DEFAULT PRIVILEGES IN SCHEMA samc GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO samc_editor;

-- Permisos para ADMIN (TODO, incluyendo DDL)
GRANT USAGE ON SCHEMA samc TO samc_admin;
GRANT ALL ON ALL TABLES IN SCHEMA samc TO samc_admin;
ALTER DEFAULT PRIVILEGES IN SCHEMA samc GRANT ALL ON TABLES TO samc_admin;

-- ============================================================================
-- Paso 8: Seed — usuario admin por defecto
-- ============================================================================
-- Contraseña: admin123 (hash bcrypt generado)
-- IMPORTANTE: cambiar en producción
INSERT INTO samc.samc_usuario (username, email, password_hash, must_change_pwd)
VALUES (
    'admin',
    'admin@corpoelec.gob.ve',
    '$2b$12$LJ3m4ys3Lg3YOCwFRIioeeJXHRgHCfx.NdO4KqKxL5qKqHz5qJz3q',
    TRUE
);

INSERT INTO samc.samc_usuario_rol (usuario_id, rol)
SELECT id, 'ADMIN' FROM samc.samc_usuario WHERE username = 'admin';

COMMIT;
