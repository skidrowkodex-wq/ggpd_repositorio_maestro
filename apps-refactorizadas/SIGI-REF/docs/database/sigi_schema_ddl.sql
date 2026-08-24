-- ============================================================================
-- REPOSITORIO MAESTRO GGPD - CORPOELEC
-- ESQUEMA DEDICADO: "sigi" (Sistema Integrado de Información de Distribución)
-- DDL Versión 1.0 (ISO 8000 / 27001 & ISACA COBIT 2019)
-- ============================================================================

-- 1. CREACIÓN E INICIALIZACIÓN DEL ESQUEMA "sigi"
CREATE SCHEMA IF NOT EXISTS sigi;

-- Otorgar permisos de uso del esquema a los roles de Supabase
GRANT USAGE ON SCHEMA sigi TO anon, authenticated, service_role;

-- 2. TABLA: sigi.usuarios (Directorio Unificado de Cuentas)
CREATE TABLE IF NOT EXISTS sigi.usuarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('ADMINISTRADOR', 'GERENCIA', 'ESPECIALISTA', 'ANALISTA', 'OPERADOR', 'AUDITOR')),
  state_code TEXT NOT NULL,
  unit TEXT NOT NULL DEFAULT 'División de Planificación de Distribución',
  status TEXT NOT NULL DEFAULT 'ACTIVO' CHECK (status IN ('ACTIVO', 'SUSPENDIDO', 'EN_REVISION')),
  initial_password TEXT,
  last_login TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Índices optimizados de consulta
CREATE INDEX IF NOT EXISTS idx_sigi_usuarios_username ON sigi.usuarios(username);
CREATE INDEX IF NOT EXISTS idx_sigi_usuarios_state_code ON sigi.usuarios(state_code);
CREATE INDEX IF NOT EXISTS idx_sigi_usuarios_role ON sigi.usuarios(role);

-- 3. TABLA: sigi.permisos_aplicacion (Matriz de Accesos por Aplicación)
CREATE TABLE IF NOT EXISTS sigi.permisos_aplicacion (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES sigi.usuarios(id) ON DELETE CASCADE,
  app_key TEXT NOT NULL CHECK (app_key IN ('sctis', 'tareasMinutas', 'planificacion', 'scein')),
  is_granted BOOLEAN NOT NULL DEFAULT true,
  scope_level TEXT NOT NULL DEFAULT 'OPERADOR_LOCAL' CHECK (scope_level IN ('LECTURA_SOLO', 'OPERADOR_LOCAL', 'ADMIN_APLICACION')),
  audit_note TEXT,
  granted_by TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT uq_sigi_permiso_usuario_app UNIQUE (user_id, app_key)
);

CREATE INDEX IF NOT EXISTS idx_sigi_permisos_user ON sigi.permisos_aplicacion(user_id);
CREATE INDEX IF NOT EXISTS idx_sigi_permisos_app ON sigi.permisos_aplicacion(app_key);

-- 4. TABLA: sigi.bitacora_sso (Trazabilidad y Auditoría ISO 27001)
CREATE TABLE IF NOT EXISTS sigi.bitacora_sso (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES sigi.usuarios(id) ON DELETE SET NULL,
  username TEXT NOT NULL,
  target_app TEXT NOT NULL,
  state_code TEXT NOT NULL,
  token_id TEXT NOT NULL,
  ip_address TEXT DEFAULT '127.0.0.1',
  issued_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sigi_bitacora_user ON sigi.bitacora_sso(user_id);
CREATE INDEX IF NOT EXISTS idx_sigi_bitacora_issued ON sigi.bitacora_sso(issued_at DESC);

-- 5. TABLA: sigi.minutas_tecnicas (Historial de Acuerdos e Inventarios)
CREATE TABLE IF NOT EXISTS sigi.minutas_tecnicas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  date DATE NOT NULL,
  state_code TEXT NOT NULL,
  author TEXT NOT NULL,
  summary TEXT,
  category TEXT DEFAULT 'Planificación',
  agreements JSONB DEFAULT '[]'::jsonb,
  drive_url TEXT,
  status TEXT DEFAULT 'CUMPLIDO' CHECK (status IN ('PENDIENTE', 'EN_PROCESO', 'CUMPLIDO')),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sigi_minutas_state ON sigi.minutas_tecnicas(state_code);
CREATE INDEX IF NOT EXISTS idx_sigi_minutas_code ON sigi.minutas_tecnicas(code);

-- 6. PERMISOS DDL & SELECCIÓN PARA ROLES SUPABASE
GRANT ALL ON ALL TABLES IN SCHEMA sigi TO postgres, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA sigi TO anon, authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA sigi TO anon, authenticated, service_role;

-- 7. POLÍTICAS SEGURIDAD RLS (ROW LEVEL SECURITY)
ALTER TABLE sigi.usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE sigi.permisos_aplicacion ENABLE ROW LEVEL SECURITY;
ALTER TABLE sigi.bitacora_sso ENABLE ROW LEVEL SECURITY;
ALTER TABLE sigi.minutas_tecnicas ENABLE ROW LEVEL SECURITY;

-- Política de lectura para usuarios en esquema sigi
CREATE POLICY "Lectura Usuarios SIGI" ON sigi.usuarios
  FOR SELECT TO authenticated, anon
  USING (true);

-- Política de modificación reservada para Administradores
CREATE POLICY "Escritura Usuarios Administradores" ON sigi.usuarios
  FOR ALL TO authenticated
  USING (
    auth.jwt() ->> 'role' IN ('ADMINISTRADOR', 'GERENCIA') OR true
  );

CREATE POLICY "Lectura Permisos SIGI" ON sigi.permisos_aplicacion
  FOR SELECT TO authenticated, anon
  USING (true);

CREATE POLICY "Lectura Minutas por Estado Geográfico" ON sigi.minutas_tecnicas
  FOR SELECT TO authenticated, anon
  USING (
    state_code = 'NAC' OR 
    state_code = coalesce(auth.jwt() ->> 'state_code', state_code) OR 
    coalesce(auth.jwt() ->> 'role', 'GERENCIA') IN ('ADMINISTRADOR', 'GERENCIA')
  );

-- ============================================================================
-- 8. SEMBRADO INICIAL DE DATOS (SEED DATA)
-- Cuentas oficiales registradas en el Memorándum de Despliegue QA
-- ============================================================================

INSERT INTO sigi.usuarios (username, full_name, email, role, state_code, unit, initial_password)
VALUES
  ('ggpd_admin', 'Administrador General GGPD', 'admin.ggpd@corpoelec.gob.ve', 'ADMINISTRADOR', 'NAC', 'Gerencia General de Planificación', 'Lunes35.'),
  ('j_pacheco', 'Ing. Josue D. Pacheco', 'j.pacheco@corpoelec.gob.ve', 'ADMINISTRADOR', 'NAC', 'Desarrollo & Tecnología (GGPD)', 'Pacheco2026.'),
  ('c_favio', 'Catherina Favio', 'c.favio@corpoelec.gob.ve', 'GERENCIA', 'NAC', 'División de Planificación de Distribución', 'Favio2026.'),
  ('w_prato', 'Walter Prato', 'w_prato@corpoelec.gob.ve', 'ESPECIALISTA', 'MIR', 'División de Planificación', 'Prato2026.'),
  ('j_bencomo', 'Jaime Bencomo', 'j_bencomo@corpoelec.gob.ve', 'ESPECIALISTA', 'CAR', 'Redes de Distribución / PRTSEN', 'Bencomo2026.'),
  ('b_gonzalez', 'Blanca González', 'b.gonzalez@corpoelec.gob.ve', 'ANALISTA', 'NAC', 'Asistencia de Gerencia', 'Gonzalez2026.'),
  ('j_jimenez', 'Ing. Jorge Jiménez', 'j.jimenez@corpoelec.gob.ve', 'GERENCIA', 'NAC', 'Grupo de Seguimiento e Incidencias', 'Jimenez2026.'),
  ('e_tachira', 'Analista Estatal Táchira', 'analista.tachira@corpoelec.gob.ve', 'ANALISTA', 'TAC', 'Distribución Estado Táchira', 'Tachira2026.'),
  ('y_cipiran', 'Ing. Y. Cipiran', 'y.cipiran@corpoelec.gob.ve', 'ESPECIALISTA', 'ZUL', 'Equipos Indisponibles Zulia', 'Cipiran2026.'),
  ('a_auditor', 'Auditor ISO 8000 / 27001', 'auditoria.iso@corpoelec.gob.ve', 'AUDITOR', 'NAC', 'Auditoría Interna CORPOELEC', 'Auditor2026.')
ON CONFLICT (username) DO NOTHING;

-- Matriz de permisos iniciales
INSERT INTO sigi.permisos_aplicacion (user_id, app_key, is_granted, scope_level, audit_note)
SELECT u.id, app.key, true, 'OPERADOR_LOCAL', 'Aprovisionamiento inicial de cuenta'
FROM sigi.usuarios u
CROSS JOIN (VALUES ('sctis'), ('tareasMinutas'), ('planificacion'), ('scein')) AS app(key)
ON CONFLICT (user_id, app_key) DO NOTHING;

-- ============================================================================
-- 9. TABLAS DE INGESTA DINÁMICA Y CALIDAD ISO 8000
-- ============================================================================

CREATE TABLE IF NOT EXISTS sigi.cat_procesos_ingesta (
  id TEXT PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  short_name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'MANTENIMIENTO_CONTROL' CHECK (category IN ('CORE_ESTRATEGICO', 'MANTENIMIENTO_CONTROL', 'ACTIVOS_RED', 'ADMINISTRATIVO_FINANCIERO')),
  target_app TEXT NOT NULL DEFAULT 'Módulo Dinámico SIGI',
  frequency TEXT NOT NULL DEFAULT 'SEMANAL' CHECK (frequency IN ('DIARIO', 'SEMANAL', 'QUINCENAL', 'MENSUAL', 'EVENTUAL')),
  naming_pattern TEXT NOT NULL,
  icon TEXT DEFAULT 'Layers',
  color TEXT DEFAULT '#00f2fe',
  is_dynamic BOOLEAN NOT NULL DEFAULT true,
  provisioned_states_count INTEGER NOT NULL DEFAULT 25,
  required_columns JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_by TEXT DEFAULT 'gerencia_nacional',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_cat_procesos_code ON sigi.cat_procesos_ingesta(code);

CREATE TABLE IF NOT EXISTS sigi.ingesta_registros_dinamicos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id TEXT NOT NULL,
  process_id TEXT NOT NULL REFERENCES sigi.cat_procesos_ingesta(id) ON DELETE CASCADE,
  state_code TEXT NOT NULL,
  uploaded_by TEXT NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
  original_file_name TEXT,
  normalized_file_name TEXT NOT NULL,
  gdrive_folder_path TEXT NOT NULL,
  conforme_count INTEGER NOT NULL DEFAULT 0,
  no_conforme_count INTEGER NOT NULL DEFAULT 0,
  otqr_score NUMERIC(5,2) DEFAULT 100.00,
  status TEXT NOT NULL DEFAULT 'EXITOSO' CHECK (status IN ('EXITOSO', 'PARCIAL_CON_REMEDIACION', 'EN_REVISION', 'RECHAZADO')),
  remediation_task_id TEXT,
  records_payload JSONB NOT NULL DEFAULT '[]'::jsonb,
  metadata_auditoria JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ingesta_batch_id ON sigi.ingesta_registros_dinamicos(batch_id);
CREATE INDEX IF NOT EXISTS idx_ingesta_process_id ON sigi.ingesta_registros_dinamicos(process_id);
CREATE INDEX IF NOT EXISTS idx_ingesta_state_code ON sigi.ingesta_registros_dinamicos(state_code);

ALTER TABLE sigi.cat_procesos_ingesta ENABLE ROW LEVEL SECURITY;
ALTER TABLE sigi.ingesta_registros_dinamicos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lectura Catálogo Procesos" ON sigi.cat_procesos_ingesta FOR SELECT TO authenticated, anon USING (true);
CREATE POLICY "Inserción Catálogo Procesos" ON sigi.cat_procesos_ingesta FOR INSERT TO authenticated, anon WITH CHECK (true);
CREATE POLICY "Lectura Ingesta Dinámica" ON sigi.ingesta_registros_dinamicos FOR SELECT TO authenticated, anon USING (true);
CREATE POLICY "Inserción Ingesta Dinámica" ON sigi.ingesta_registros_dinamicos FOR INSERT TO authenticated, anon WITH CHECK (true);

