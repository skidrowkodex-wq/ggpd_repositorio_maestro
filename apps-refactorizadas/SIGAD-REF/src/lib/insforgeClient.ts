// ==============================================================================
// ⚡ CORPOELEC - SIGAD: Cliente de datos con BACKEND DUAL (InsForge ⇄ LocalPG)
// ------------------------------------------------------------------------------
// · Ejecutado en localhost        -> Puente REST local (PostgreSQL 18, offline)
// · Desplegado en VibeHost/nube   -> InsForge Cloud (ggpd-data-maestra-0002)
//
// La selección se hace en TIEMPO DE EJECUCIÓN según el hostname, por lo que el
// mismo build sirve para ambos entornos sin recompilar. Se puede forzar con la
// variable VITE_DATA_BACKEND=local|insforge.
// ==============================================================================

const ENV = (import.meta as any).env || {};

const CLOUD_URL = String(
  ENV.VITE_INSFORGE_URL || ENV.INSFORGE_URL || 'https://wxkeqf37.ap-southeast.insforge.app'
).replace(/\/+$/, '');

const CLOUD_KEY = String(ENV.VITE_INSFORGE_API_KEY || ENV.INSFORGE_API_KEY || '');

const LOCAL_URL = String(
  ENV.VITE_LOCAL_API_URL || ENV.LOCAL_API_URL || 'http://127.0.0.1:5431'
).replace(/\/+$/, '');

const LOCAL_KEY = String(ENV.VITE_LOCAL_API_KEY || 'local-bridge');

const FORCED_BACKEND = String(ENV.VITE_DATA_BACKEND || '').trim().toLowerCase();

export type DataBackendMode = 'insforge' | 'local';

function isLocalHost(hostname: string): boolean {
  const h = (hostname || '').toLowerCase();
  return (
    h === 'localhost' ||
    h === '127.0.0.1' ||
    h === '::1' ||
    h === '0.0.0.0' ||
    h.endsWith('.localhost') ||
    h.endsWith('.local')
  );
}

function resolveBackend(): { mode: DataBackendMode; url: string; apiKey: string } {
  if (FORCED_BACKEND === 'local') {
    return { mode: 'local', url: LOCAL_URL, apiKey: LOCAL_KEY };
  }
  if (FORCED_BACKEND === 'insforge' || FORCED_BACKEND === 'cloud') {
    return { mode: 'insforge', url: CLOUD_URL, apiKey: CLOUD_KEY };
  }

  const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
  return isLocalHost(hostname)
    ? { mode: 'local', url: LOCAL_URL, apiKey: LOCAL_KEY }
    : { mode: 'insforge', url: CLOUD_URL, apiKey: CLOUD_KEY };
}

const backend = resolveBackend();

/** Información del backend activo (para badges/estado en la UI). */
export const dataBackend = {
  mode: backend.mode,
  label: backend.mode === 'local' ? 'PostgreSQL Local · Offline' : 'InsForge Cloud · SEN 2026',
  url: backend.url,
} as const;

export interface QueryOptions {
  schema?: string;
  limit?: number;
  offset?: number;
  order?: string;
  filter?: Record<string, string>;
}

export const insforgeClient = {
  url: backend.url,
  apiKey: backend.apiKey,
  mode: backend.mode,

  getHeaders: () => ({
    apikey: backend.apiKey,
    Authorization: `Bearer ${backend.apiKey}`,
    'Content-Type': 'application/json',
    Accept: 'application/json',
  }),

  async select<T = any>(table: string, options: QueryOptions = {}): Promise<{ data: T[]; error: any | null }> {
    const schema = options.schema || 'core';
    const limit = options.limit || 5000;
    let url = `${backend.url}/api/database/records/${table}?schema=${schema}&limit=${limit}`;

    if (options.offset) {
      url += `&offset=${options.offset}`;
    }

    if (options.order) {
      url += `&order=${encodeURIComponent(options.order)}`;
    }

    if (options.filter) {
      for (const [k, v] of Object.entries(options.filter)) {
        url += `&${k}=eq.${encodeURIComponent(v)}`;
      }
    }

    try {
      const res = await fetch(url, {
        method: 'GET',
        headers: this.getHeaders(),
      });
      if (!res.ok) {
        return { data: [], error: { status: res.status, statusText: res.statusText } };
      }
      const data = await res.json();
      return { data: Array.isArray(data) ? data : [], error: null };
    } catch (err) {
      return { data: [], error: err };
    }
  },

  async insert<T = any>(table: string, records: any | any[], schema: string = 'sigad'): Promise<{ data: T | null; error: any | null }> {
    const arr = Array.isArray(records) ? records : [records];
    const url = `${backend.url}/api/database/records/${table}?schema=${schema}`;

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(arr),
      });
      if (!res.ok) {
        const txt = await res.text();
        return { data: null, error: { status: res.status, message: txt } };
      }
      const data = await res.json();
      return { data, error: null };
    } catch (err) {
      return { data: null, error: err };
    }
  },

  async patch<T = any>(table: string, filterKey: string, filterVal: string, payload: any, schema: string = 'sigad'): Promise<{ data: T | null; error: any | null }> {
    const url = `${backend.url}/api/database/records/${table}?schema=${schema}&${filterKey}=eq.${encodeURIComponent(filterVal)}`;

    try {
      const res = await fetch(url, {
        method: 'PATCH',
        headers: this.getHeaders(),
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const txt = await res.text();
        return { data: null, error: { status: res.status, message: txt } };
      }
      return { data: payload, error: null };
    } catch (err) {
      return { data: null, error: err };
    }
  },
};
