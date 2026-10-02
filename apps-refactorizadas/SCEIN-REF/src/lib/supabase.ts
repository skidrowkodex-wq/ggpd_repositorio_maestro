/**
 * ==============================================================================
 * CORPOELEC - GERENCIA GENERAL DE PLANIFICACIÓN DE DISTRIBUCIÓN (GGPD)
 * CLIENTE MAESTRO DE DATOS - INSFORGE POSTGRESQL (SCEIN V3.0)
 * ==============================================================================
 * Cliente InsForge client-side (hosting estático, sin backend Express).
 * Las tablas del esquema `scein` se resuelven vía `?schema=scein`.
 */

const TABLES: Record<string, string> = {
  equipment_records: 'equipment_records',
  audit_logs: 'mae_auditorias',
  institutional_documents: 'mae_documentos_institucionales',
  technical_documents: 'mae_documentos_institucionales',
};

export function getSupabaseClient(customUrl?: string, customKey?: string, schema: string = 'scein'): any {
  const metaEnv = (import.meta as any).env || {};
  const clean = (val?: string) => (val || '').trim().replace(/^["']|["']$/g, '');
  const url = clean(customUrl || metaEnv.VITE_INSFORGE_URL || metaEnv.INSFORGE_URL || 'https://wxkeqf37.ap-southeast.insforge.app');
  const key = clean(customKey || metaEnv.VITE_INSFORGE_API_KEY || metaEnv.INSFORGE_API_KEY || '');

  if (!url || !key) return null;

  const getHeaders = () => ({
    'apikey': key,
    'Authorization': `Bearer ${key}`,
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  });

  const resolveTable = (tableName: string) => TABLES[tableName] || tableName;

  const parseJson = async (res: Response) => {
    const txt = await res.text();
    try {
      return JSON.parse(txt);
    } catch {
      return { raw: txt };
    }
  };

  return {
    from: (tableName: string) => {
      const table = resolveTable(tableName);
      const base = `${url.replace(/\/+$/, '')}/api/database/records/${table}`;

      return {
        select: async () => {
          try {
            const res = await fetch(`${base}?schema=${schema}&limit=100000&order=created_at.desc.nullslast`, {
              method: 'GET',
              headers: getHeaders(),
            });
            const data = await parseJson(res);
            return res.ok
              ? { data: Array.isArray(data) ? data : [], error: null }
              : { data: [], error: { message: `HTTP ${res.status} ${JSON.stringify(data)}` } };
          } catch (err: any) {
            return { data: [], error: err };
          }
        },
        get: async (filter: Record<string, any>) => {
          try {
            const qs = Object.entries(filter)
              .map(([k, v]) => `${k}=eq.${encodeURIComponent(String(v))}`)
              .join('&');
            const res = await fetch(`${base}?schema=${schema}&${qs}&limit=100000`, {
              method: 'GET',
              headers: getHeaders(),
            });
            const data = await parseJson(res);
            return res.ok
              ? { data: Array.isArray(data) ? data : [], error: null }
              : { data: [], error: { message: `HTTP ${res.status}` } };
          } catch (err: any) {
            return { data: [], error: err };
          }
        },
        insert: async (records: any | any[]) => {
          try {
            const arr = Array.isArray(records) ? records : [records];
            let payload = arr;
            if (arr.length > 1) {
              const keys = new Set<string>();
              arr.forEach(r => Object.keys(r).forEach(k => keys.add(k)));
              payload = arr.map(r => {
                const o: any = {};
                keys.forEach(k => { o[k] = r[k] === undefined ? null : r[k]; });
                return o;
              });
            }
            const res = await fetch(`${base}?schema=${schema}`, {
              method: 'POST',
              headers: getHeaders(),
              body: JSON.stringify(payload),
            });
            const data = await parseJson(res);
            return res.ok
              ? { data, error: null }
              : { data: null, error: { message: `HTTP ${res.status} ${JSON.stringify(data)}` } };
          } catch (err: any) {
            return { data: null, error: err };
          }
        },
        update: async (pk: string, idValue: string, changes: any) => {
          try {
            const res = await fetch(`${base}?schema=${schema}&${pk}=eq.${encodeURIComponent(idValue)}`, {
              method: 'PATCH',
              headers: getHeaders(),
              body: JSON.stringify(changes || {}),
            });
            const data = await parseJson(res);
            return res.ok
              ? { data, error: null }
              : { data: null, error: { message: `HTTP ${res.status} ${JSON.stringify(data)}` } };
          } catch (err: any) {
            return { data: null, error: err };
          }
        },
        remove: async (pk: string, idValue: string) => {
          try {
            const res = await fetch(`${base}?schema=${schema}&${pk}=eq.${encodeURIComponent(idValue)}`, {
              method: 'DELETE',
              headers: getHeaders(),
            });
            return res.ok
              ? { data: null, error: null }
              : { data: null, error: { message: `HTTP ${res.status}` } };
          } catch (err: any) {
            return { data: null, error: err };
          }
        },
        upsertByExisting: async (records: any[]) => {
          if (!Array.isArray(records) || records.length === 0) return { count: 0, error: null as any };
          try {
            const existing = await fetch(`${base}?schema=${schema}&select=record_id&limit=100000`, {
              method: 'GET',
              headers: getHeaders(),
            });
            const existingRows: any = existing.ok ? await existing.json() : [];
            const existingIds = new Set(Array.isArray(existingRows) ? existingRows.map((r: any) => r.record_id) : []);
            let count = 0;
            for (const rec of records) {
              if (rec.record_id && existingIds.has(rec.record_id)) {
                const up = await fetch(`${base}?schema=${schema}&record_id=eq.${encodeURIComponent(rec.record_id)}`, {
                  method: 'PATCH',
                  headers: getHeaders(),
                  body: JSON.stringify(rec),
                });
                if (up.ok) count++;
              } else {
                const ins = await fetch(`${base}?schema=${schema}`, {
                  method: 'POST',
                  headers: getHeaders(),
                  body: JSON.stringify([rec]),
                });
                if (ins.ok) count++;
              }
            }
            return { count, error: null };
          } catch (err: any) {
            return { count: 0, error: err };
          }
        },
      };
    }
  };
}

export async function testSupabaseConnection(url?: string, key?: string, schema: string = 'scein') {
  const targetUrl = (url || 'https://wxkeqf37.ap-southeast.insforge.app').replace(/\/+$/, '');
  const targetKey = key || '';
  const startTime = performance.now();

  try {
    const res = await fetch(`${targetUrl}/api/database/records/equipment_records?schema=${schema}&limit=1`, {
      method: 'GET',
      headers: {
        'apikey': targetKey,
        'Authorization': `Bearer ${targetKey}`,
      },
    });

    const latencyMs = Math.round(performance.now() - startTime);

    if (res.ok) {
      const data = await res.json();
      return {
        success: true,
        message: `¡Conexión exitosa a InsForge PostgreSQL (Esquema "${schema}")!`,
        latencyMs,
        data,
      };
    }

    return {
      success: false,
      message: `Error HTTP ${res.status} al conectar con InsForge`,
      latencyMs,
    };
  } catch (err: any) {
    return {
      success: false,
      message: `Error de red: ${err.message || 'No se pudo contactar a InsForge'}`,
      latencyMs: Math.round(performance.now() - startTime),
    };
  }
}