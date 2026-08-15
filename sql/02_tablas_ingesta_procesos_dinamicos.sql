-- ============================================================================
-- REPOSITORIO MAESTRO GGPD - CORPOELEC
-- ESQUEMA DEDICADO: "sigi" (Sistema Integrado de Información de Distribución)
-- DDL COMPLEMENTARIO: TABLAS MAESTRAS DE INGESTA Y PROCESOS DINÁMICOS
-- Estándar: ISO 8000-110 / ISO 27001:2022 / ISACA COBIT 2019
-- ============================================================================

-- 1. Asegurar esquema "sigi"
CREATE SCHEMA IF NOT EXISTS sigi;
GRANT USAGE ON SCHEMA sigi TO anon, authenticated, service_role;

-- 2. TABLA: sigi.cat_procesos_ingesta (Catálogo Centralizado de Procesos y Formularios)
-- Permite que la Gerencia Nacional registre nuevos procesos y esquemas de columnas en caliente
-- replicándose en tiempo real hacia los 25 Estados de Venezuela.
CREATE TABLE IF NOT EXISTS sigi.cat_procesos_ingesta (
  id TEXT PRIMARY KEY, -- ej: 'sctis', 'scein', 'scpyp'
  code TEXT UNIQUE NOT NULL, -- ej: '01_SCTIS', '05_SCPYP'
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
  required_columns JSONB NOT NULL DEFAULT '[]'::jsonb, -- Definición estructurada de columnas
  created_by TEXT DEFAULT 'gerencia_nacional',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_cat_procesos_code ON sigi.cat_procesos_ingesta(code);
CREATE INDEX IF NOT EXISTS idx_cat_procesos_category ON sigi.cat_procesos_ingesta(category);

-- 3. TABLA: sigi.ingesta_registros_dinamicos (Almacén Universal de Ingesta y Lotes Conformes)
-- Soporta el almacenamiento de datos válidos (ISO 8000) de cualquier proceso nuevo mediante JSONB
CREATE TABLE IF NOT EXISTS sigi.ingesta_registros_dinamicos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id TEXT NOT NULL, -- ej: 'BATCH-SCPYP-DCA-123456'
  process_id TEXT NOT NULL REFERENCES sigi.cat_procesos_ingesta(id) ON DELETE CASCADE,
  state_code TEXT NOT NULL, -- ej: 'DCA', 'ZUL', 'MIR'
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
  records_payload JSONB NOT NULL DEFAULT '[]'::jsonb, -- Array de registros validados
  metadata_auditoria JSONB DEFAULT '{}'::jsonb, -- IP, hash SHA-256, User-Agent
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ingesta_batch_id ON sigi.ingesta_registros_dinamicos(batch_id);
CREATE INDEX IF NOT EXISTS idx_ingesta_process_id ON sigi.ingesta_registros_dinamicos(process_id);
CREATE INDEX IF NOT EXISTS idx_ingesta_state_code ON sigi.ingesta_registros_dinamicos(state_code);
CREATE INDEX IF NOT EXISTS idx_ingesta_timestamp ON sigi.ingesta_registros_dinamicos(timestamp DESC);

-- 4. PERMISOS DDL PARA SUPABASE
GRANT ALL ON ALL TABLES IN SCHEMA sigi TO postgres, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA sigi TO anon, authenticated;

-- 5. ROW LEVEL SECURITY (RLS)
ALTER TABLE sigi.cat_procesos_ingesta ENABLE ROW LEVEL SECURITY;
ALTER TABLE sigi.ingesta_registros_dinamicos ENABLE ROW LEVEL SECURITY;

-- Políticas de lectura abierta para usuarios autenticados y anónimos autorizados
CREATE POLICY "Lectura Catálogo Procesos" ON sigi.cat_procesos_ingesta
  FOR SELECT TO authenticated, anon USING (true);

CREATE POLICY "Inserción Catálogo Procesos" ON sigi.cat_procesos_ingesta
  FOR INSERT TO authenticated, anon WITH CHECK (true);

CREATE POLICY "Lectura Ingesta Dinámica" ON sigi.ingesta_registros_dinamicos
  FOR SELECT TO authenticated, anon USING (true);

CREATE POLICY "Inserción Ingesta Dinámica" ON sigi.ingesta_registros_dinamicos
  FOR INSERT TO authenticated, anon WITH CHECK (true);

-- 6. COMENTARIOS DE DOCUMENTACIÓN NORMATIVA
COMMENT ON TABLE sigi.cat_procesos_ingesta IS 'Catálogo maestro de procesos operativos y estructuras de columnas configurables para la red de distribución';
COMMENT ON TABLE sigi.ingesta_registros_dinamicos IS 'Bitácora universal de lotes y registros estructurados conformes bajo ISO 8000';
