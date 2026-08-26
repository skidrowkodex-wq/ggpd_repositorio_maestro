import { SupabaseConfig, TareaCompromiso, PendienteArea, MinutaReunion } from '../types';

const STORAGE_KEY = 'corpoelec_insforge_config';

export function getStoredSupabaseConfig(): SupabaseConfig {
  const metaEnv = (import.meta as any).env || {};
  const envUrl = (metaEnv.VITE_INSFORGE_URL || metaEnv.INSFORGE_URL || 'https://wxkeqf37.ap-southeast.insforge.app').trim();
  const envAnonKey = (metaEnv.VITE_INSFORGE_API_KEY || metaEnv.INSFORGE_API_KEY || '***REMOVED***').trim();

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

class InsforgeTableQuery {
  private baseUrl: string;
  private apiKey: string;
  private tableName: string;

  constructor(baseUrl: string, apiKey: string, tableName: string) {
    this.baseUrl = baseUrl.replace(/\/+$/, '');
    this.apiKey = apiKey;
    this.tableName = tableName;
  }

  private getHeaders() {
    return {
      'apikey': this.apiKey,
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
  }

  private resolveEndpoint(viewPreferred: boolean = true) {
    if (viewPreferred) {
      if (this.tableName === 'minutas') return 'v_scmtp_minutas';
      if (this.tableName === 'compromisos_tareas') return 'v_scmtp_compromisos_tareas';
      if (this.tableName === 'pendientes_area') return 'v_scmtp_pendientes_area';
    }
    return this.tableName;
  }

  async select(columns: string = '*', options?: { count?: string; head?: boolean }): Promise<{ data: any[] | null; error: any }> {
    try {
      const target = this.resolveEndpoint(true);
      const res = await fetch(`${this.baseUrl}/api/database/records/${target}?limit=500`, {
        method: 'GET',
        headers: this.getHeaders(),
      });
      if (!res.ok) {
        return { data: null, error: { message: `HTTP ${res.status}: ${res.statusText}` } };
      }
      const data = await res.json();
      return { data: Array.isArray(data) ? data : [], error: null };
    } catch (err: any) {
      return { data: null, error: err };
    }
  }

  async insert(records: any | any[]): Promise<{ data: any | null; error: any }> {
    try {
      const target = this.resolveEndpoint(false);
      const payload = Array.isArray(records) ? records : [records];
      const res = await fetch(`${this.baseUrl}/api/database/records/${target}`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const errText = await res.text();
        return { data: null, error: { message: errText } };
      }
      const data = await res.json();
      return { data, error: null };
    } catch (err: any) {
      return { data: null, error: err };
    }
  }

  async upsert(records: any | any[]): Promise<{ data: any | null; error: any }> {
    return this.insert(records);
  }

  delete() {
    return {
      eq: async (column: string, value: any): Promise<{ data: any | null; error: any }> => {
        try {
          const target = this.resolveEndpoint(false);
          const res = await fetch(`${this.baseUrl}/api/database/records/${target}?${column}=eq.${value}`, {
            method: 'DELETE',
            headers: this.getHeaders(),
          });
          return { data: null, error: res.ok ? null : { message: `HTTP ${res.status}` } };
        } catch (err: any) {
          return { data: null, error: err };
        }
      }
    };
  }
}

class InsforgeClient {
  private url: string;
  private key: string;

  constructor(url: string, key: string) {
    this.url = url;
    this.key = key;
  }

  from(tableName: string) {
    return new InsforgeTableQuery(this.url, this.key, tableName);
  }
}

let insforgeInstance: any = null;

export function getSupabaseClient(): any {
  const config = getStoredSupabaseConfig();
  if (!config.url || !config.anonKey) {
    return null;
  }
  if (!insforgeInstance) {
    insforgeInstance = new InsforgeClient(config.url, config.anonKey);
  }
  return insforgeInstance;
}

export function resetSupabaseClient() {
  insforgeInstance = null;
}

export const SUPABASE_SQL_SCHEMA = `-- SQL Schema para CORPOELEC - Gestor de Tareas y Minutas
-- Esquema: scmtp (Seguimiento y Control de Minutas y Tareas Planificación)
-- Desplegado en InsForge PostgreSQL (ggpd-data-maestra-0002)

CREATE SCHEMA IF NOT EXISTS scmtp;

CREATE TABLE IF NOT EXISTS scmtp.mae_minutas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  numero VARCHAR(50) UNIQUE NOT NULL,
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
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS scmtp.mae_compromisos_tareas (
  id VARCHAR(100) PRIMARY KEY,
  minuta_numero VARCHAR(50) REFERENCES scmtp.mae_minutas(numero) ON DELETE SET NULL,
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
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS scmtp.mae_pendientes_area (
  id VARCHAR(100) PRIMARY KEY,
  area VARCHAR(100) NOT NULL,
  pendiente TEXT NOT NULL,
  depende_de VARCHAR(150),
  estado VARCHAR(50) DEFAULT 'Pendiente',
  observacion TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
`;

export async function testSupabaseConnection(url: string, anonKey: string): Promise<boolean> {
  try {
    const res = await fetch(`${url.replace(/\/+$/, '')}/api/database/records/v_scmtp_minutas?limit=1`, {
      method: 'GET',
      headers: {
        'apikey': anonKey,
        'Authorization': `Bearer ${anonKey}`,
      }
    });
    return res.ok;
  } catch (err) {
    console.error('Error probando conexión a InsForge:', err);
    return false;
  }
}
