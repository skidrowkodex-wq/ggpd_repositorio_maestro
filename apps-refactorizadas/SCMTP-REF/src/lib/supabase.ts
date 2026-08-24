import { createClient } from '@supabase/supabase-js';
import { SupabaseConfig, TareaCompromiso, PendienteArea, MinutaReunion } from '../types';

const STORAGE_KEY = 'corpoelec_supabase_config';

export function getStoredSupabaseConfig(): SupabaseConfig {
  const metaEnv = (import.meta as any).env || {};
  const envUrl = (metaEnv.VITE_SUPABASE_URL || metaEnv.SUPABASE_URL || '').trim();
  const envAnonKey = (metaEnv.VITE_SUPABASE_ANON_KEY || metaEnv.SUPABASE_ANON_KEY || '').trim();

  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (parsed.url && parsed.anonKey) {
        return parsed;
      }
    } catch {
      // ignore
    }
  }

  return {
    url: envUrl,
    anonKey: envAnonKey,
    serviceRoleKey: '',
    isConnected: Boolean(envUrl && envAnonKey),
  };
}

export function saveSupabaseConfig(config: SupabaseConfig): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
}

let supabaseInstance: any = null;

export function getSupabaseClient(): any {
  const config = getStoredSupabaseConfig();
  if (!config.url || !config.anonKey) {
    return null;
  }
  if (!supabaseInstance) {
    supabaseInstance = createClient(config.url, config.anonKey, {
      db: {
        schema: 'sctap',
      },
    });
  }
  return supabaseInstance;
}


export function resetSupabaseClient() {
  supabaseInstance = null;
}

export const SUPABASE_SQL_SCHEMA = `-- SQL Schema para CORPOELEC - Gestor de Tareas y Minutas
-- Esquema: sctap (Seguimiento y Control de Tareas Asignadas Planificación)
-- Copia y ejecuta este script en el Editor SQL de tu proyecto Supabase

-- 1. Crear el esquema personalizado sctap
CREATE SCHEMA IF NOT EXISTS sctap;

-- Permisos de acceso al esquema sctap para API anon y usuarios autenticados
GRANT USAGE ON SCHEMA sctap TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA sctap TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA sctap TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA sctap GRANT ALL ON TABLES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA sctap GRANT ALL ON SEQUENCES TO anon, authenticated, service_role;

-- 2. Tabla de Minutas en el esquema sctap
CREATE TABLE IF NOT EXISTS sctap.minutas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  numero VARCHAR(50) NOT NULL UNIQUE,
  fecha VARCHAR(20) NOT NULL,
  fecha_iso DATE,
  hora VARCHAR(20),
  lugar VARCHAR(100),
  coordinador VARCHAR(150),
  unidad_organizativa TEXT,
  objetivo TEXT,
  compromisos_count INT DEFAULT 0,
  pendientes_count INT DEFAULT 0,
  proxima_fecha_seguimiento VARCHAR(50),
  elaborado_por TEXT,
  nombre_archivo VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Tabla de Compromisos / Tareas Asignadas en el esquema sctap
CREATE TABLE IF NOT EXISTS sctap.compromisos_tareas (
  id VARCHAR(100) PRIMARY KEY,
  minuta_numero VARCHAR(50) REFERENCES sctap.minutas(numero) ON DELETE SET NULL,
  minuta_fecha VARCHAR(20),
  responsable VARCHAR(150) NOT NULL,
  compromiso TEXT NOT NULL,
  plazo_text VARCHAR(100),
  plazo_fecha_iso DATE,
  vinculacion_origen VARCHAR(100),
  estado VARCHAR(50) DEFAULT 'Pendiente',
  prioridad VARCHAR(20) DEFAULT 'Media',
  avance_porcentaje INT DEFAULT 0,
  area_gestion VARCHAR(100),
  observaciones TEXT,
  historial_avances JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Tabla de Pendientes por Área en el esquema sctap
CREATE TABLE IF NOT EXISTS sctap.pendientes_area (
  id VARCHAR(100) PRIMARY KEY,
  area VARCHAR(100) NOT NULL,
  pendiente TEXT NOT NULL,
  depende_de VARCHAR(150),
  estado VARCHAR(50) DEFAULT 'Pendiente',
  observacion TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS (Row Level Security) y permitir acceso de lectura/escritura pública en el esquema sctap
ALTER TABLE sctap.minutas ENABLE ROW LEVEL SECURITY;
ALTER TABLE sctap.compromisos_tareas ENABLE ROW LEVEL SECURITY;
ALTER TABLE sctap.pendientes_area ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir todo acceso público en minutas" ON sctap.minutas FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir todo acceso público en compromisos_tareas" ON sctap.compromisos_tareas FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir todo acceso público en pendientes_area" ON sctap.pendientes_area FOR ALL USING (true) WITH CHECK (true);
`;

export async function testSupabaseConnection(url: string, anonKey: string): Promise<boolean> {
  try {
    const client = createClient(url, anonKey, {
      db: {
        schema: 'sctap',
      },
    });
    const { error } = await client.from('minutas').select('count', { count: 'exact', head: true });
    // If the table doesn't exist yet, error code is usually 42P01 or similar, but the connection itself succeeded
    if (!error || error.code === '42P01' || (error.message && error.message.includes('relation'))) {
      return true;
    }
    return false;
  } catch (err) {
    console.error('Error probando conexión a Supabase:', err);
    return false;
  }
}

