import { SupabaseConfig } from '../types';

const STORAGE_KEY = 'corpoelec_sctis_insforge_config';
const DEFAULT_URL = 'https://wxkeqf37.ap-southeast.insforge.app';
const DEFAULT_KEY = '';

export function getStoredSupabaseConfig(): SupabaseConfig {
  const metaEnv = (import.meta as any).env || {};
  const envUrl = (
    metaEnv.VITE_INSFORGE_URL ||
    metaEnv.INSFORGE_URL ||
    DEFAULT_URL
  ).trim();
  const envAnonKey = (
    metaEnv.VITE_INSFORGE_API_KEY ||
    metaEnv.INSFORGE_API_KEY ||
    DEFAULT_KEY
  ).trim();

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

  // SCTIS: lecturas y escrituras pasan por las vistas públicas de InsForge.
  // `public.v_sctis_tiras_interrupcion` ya es actualizable (triggers INSTEAD OF
  // sobre sctis.mae_interrupciones_tiras, ver sql/06_sctis_exposicion_publica.sql)
  // y `public.v_sctis_despachadores` expone el catálogo de despachadores.
  private resolveEndpoint(operation: 'read' | 'write') {
    if (this.tableName === 'tiras') {
      return 'v_sctis_tiras_interrupcion';
    }
    if (this.tableName === 'despachadores') {
      return 'v_sctis_despachadores';
    }
    return this.tableName;
  }

  async select(columns: string = '*', options?: { count?: string; head?: boolean }): Promise<{ data: any[] | null; error: any }> {
    try {
      const target = this.resolveEndpoint('read');
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
      const target = this.resolveEndpoint('write');
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
          const target = this.resolveEndpoint('write');
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

export async function testSupabaseConnection(url: string, anonKey: string): Promise<boolean> {
  try {
    const res = await fetch(`${url.replace(/\/+$/, '')}/api/database/records/v_sctis_tiras_interrupcion?limit=1`, {
      method: 'GET',
      headers: {
        'apikey': anonKey,
        'Authorization': `Bearer ${anonKey}`,
      },
    });
    return res.ok;
  } catch (err) {
    console.error('Error probando conexión a InsForge:', err);
    return false;
  }
}