-- ====================================================================================
-- CORPOELEC GGPD | IAM CENTRAL (InsForge ggpd-data-maestra-0002)
-- Alta de dos Ingenieros Gerentes de Gestión de Planificación de Distribución
-- con perfil administrativo (ADMINISTRADOR) y acceso a todas las aplicaciones.
--   · Carlos Reyes  -> usuario nuevo: carlos.reyes
--   · Adrián Correa -> usuario existente: se actualiza a ADMINISTRADOR + acceso total
-- NORMATIVA: ISO/IEC 27001 A.5.15/A.5.18 · ISO 8000-110 (sin duplicados: username/email únicos)
-- Contraseñas iniciales convención GGPD (hash bcrypt generado por pgcrypto en servidor).
-- ====================================================================================

-- ------------------------------------------------------------------------------------
-- 1) CARLOS REYES (nuevo): Gerente de Gestión de Planificación de Distribución
-- ------------------------------------------------------------------------------------
INSERT INTO core.mae_usuarios_sistema
    (username, full_name, email, google_email, password_hash, role_code,
     unidad_organizativa, cargo, status,
     permiso_sigi, permiso_sctis, permiso_scein, permiso_scppe, permiso_scmtp,
     permiso_gdrive, permiso_scgcc, permiso_sigad, permiso_siga_sen, creado_por)
VALUES
    ('carlos.reyes', 'Ing. Carlos Reyes', 'c.reyes@corpoelec.gob.ve', 'carlos.reyes.ggpd@gmail.com',
     crypt('Reyes2026!.', gen_salt('bf', 10)), 'ADMINISTRADOR',
     'Gerencia de Gestión de Planificación de Distribución',
     'Gerente de Gestión de Planificación de Distribución', 'ACTIVO',
     TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, 'admin.ggpd')
ON CONFLICT (username) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    email = EXCLUDED.email,
    google_email = EXCLUDED.google_email,
    password_hash = EXCLUDED.password_hash,
    role_code = EXCLUDED.role_code,
    unidad_organizativa = EXCLUDED.unidad_organizativa,
    cargo = EXCLUDED.cargo,
    status = EXCLUDED.status,
    permiso_sigi = EXCLUDED.permiso_sigi,
    permiso_sctis = EXCLUDED.permiso_sctis,
    permiso_scein = EXCLUDED.permiso_scein,
    permiso_scppe = EXCLUDED.permiso_scppe,
    permiso_scmtp = EXCLUDED.permiso_scmtp,
    permiso_gdrive = EXCLUDED.permiso_gdrive,
    permiso_scgcc = EXCLUDED.permiso_scgcc,
    permiso_sigad = EXCLUDED.permiso_sigad,
    permiso_siga_sen = EXCLUDED.permiso_siga_sen,
    ultima_actualizacion = now();

-- ------------------------------------------------------------------------------------
-- 2) ADRIÁN CORREA (existente): perfil administrativo + contraseña convención GGPD
-- ------------------------------------------------------------------------------------
UPDATE core.mae_usuarios_sistema
SET role_code = 'ADMINISTRADOR',
    password_hash = crypt('Correa2026!.', gen_salt('bf', 10)),
    unidad_organizativa = 'Gerencia de Gestión de Planificación de Distribución',
    cargo = 'Gerente de Gestión de Planificación de Distribución',
    ultima_actualizacion = now()
WHERE username = 'adrian.correa';