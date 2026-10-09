// ==============================================================================
// ⚡ CORPOELEC - SIGAD: Cliente InsForge PostgreSQL / REST API & Fallback Local
// ==============================================================================

const INSFORGE_URL = (import.meta as any).env?.VITE_INSFORGE_URL 
  || (import.meta as any).env?.INSFORGE_URL 
  || 'https://wxkeqf37.ap-southeast.insforge.app';

const INSFORGE_API_KEY = (import.meta as any).env?.VITE_INSFORGE_API_KEY 
  || (import.meta as any).env?.INSFORGE_API_KEY 
  || '';

export interface QueryOptions {
  schema?: string;
  limit?: number;
  offset?: number;
  order?: string;
  filter?: Record<string, string>;
}

export const insforgeClient = {
  url: INSFORGE_URL,
  apiKey: INSFORGE_API_KEY,

  getHeaders: () => ({
    'apikey': INSFORGE_API_KEY,
    'Authorization': `Bearer ${INSFORGE_API_KEY}`,
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }),

  async select<T = any>(table: string, options: QueryOptions = {}): Promise<{ data: T[]; error: any | null }> {
    const schema = options.schema || 'core';
    const limit = options.limit || 5000;
    let url = `${INSFORGE_URL.replace(/\/+$/, '')}/api/database/records/${table}?schema=${schema}&limit=${limit}`;

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
    const url = `${INSFORGE_URL.replace(/\/+$/, '')}/api/database/records/${table}?schema=${schema}`;

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
    const url = `${INSFORGE_URL.replace(/\/+$/, '')}/api/database/records/${table}?schema=${schema}&${filterKey}=eq.${encodeURIComponent(filterVal)}`;

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
  }
};
