/**
 * ==============================================================================
 * CORPOELEC - GERENCIA GENERAL DE PLANIFICACIÓN DE DISTRIBUCIÓN (GGPD)
 * CLIENTE MAESTRO DE DATOS - INSFORGE POSTGRESQL (SCEIN V3.0)
 * ==============================================================================
 */

export function getSupabaseClient(customUrl?: string, customKey?: string, schema: string = 'scein'): any {
  const metaEnv = (import.meta as any).env || {};
  const clean = (val?: string) => (val || '').trim().replace(/^["']|["']$/g, '');
  const url = clean(customUrl || metaEnv.VITE_INSFORGE_URL || metaEnv.INSFORGE_URL || 'https://wxkeqf37.ap-southeast.insforge.app');
  const key = clean(customKey || metaEnv.VITE_INSFORGE_API_KEY || metaEnv.INSFORGE_API_KEY || '***REMOVED***');

  if (!url || !key) return null;

  return {
    from: (tableName: string) => {
      const getHeaders = () => ({
        'apikey': key,
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      });

      const resolveEndpoint = () => {
        if (tableName === 'equipment_records') return 'v_scein_equipos_indisponibles';
        if (tableName === 'institutional_documents' || tableName === 'technical_documents') return 'institutional_documents';
        if (tableName === 'audit_logs') return 'audit_logs';
        return tableName;
      };

      const resolveWriteEndpoint = () => {
        if (tableName === 'equipment_records') return 'mae_equipos_indisponibles';
        if (tableName === 'institutional_documents' || tableName === 'technical_documents') return 'mae_documentos_institucionales';
        if (tableName === 'audit_logs') return 'mae_auditorias';
        return tableName;
      };

      return {
        select: async (cols: string = '*') => {
          try {
            const res = await fetch(`${url.replace(/\/+$/, '')}/api/database/records/${resolveEndpoint()}?limit=500`, {
              method: 'GET',
              headers: getHeaders(),
            });
            if (!res.ok) return { data: null, error: { message: `HTTP ${res.status}` } };
            const data = await res.json();
            return { data: Array.isArray(data) ? data : [], error: null };
          } catch (err: any) {
            return { data: null, error: err };
          }
        },
        insert: async (records: any | any[]) => {
          try {
            const res = await fetch(`${url.replace(/\/+$/, '')}/api/database/records/${resolveWriteEndpoint()}`, {
              method: 'POST',
              headers: getHeaders(),
              body: JSON.stringify(Array.isArray(records) ? records : [records]),
            });
            const data = await res.json();
            return { data, error: res.ok ? null : { message: 'Insert error' } };
          } catch (err: any) {
            return { data: null, error: err };
          }
        },
        upsert: async (records: any | any[]) => {
          return this?.insert ? this.insert(records) : { data: records, error: null };
        }
      };
    }
  };
}

export async function testSupabaseConnection(url?: string, key?: string, schema: string = 'scein') {
  const targetUrl = (url || 'https://wxkeqf37.ap-southeast.insforge.app').replace(/\/+$/, '');
  const targetKey = key || '***REMOVED***';
  const startTime = performance.now();

  try {
    const res = await fetch(`${targetUrl}/api/database/records/v_scein_equipos_indisponibles?limit=1`, {
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
        message: `¡Conexión exitosa a InsForge PostgreSQL (Esquema "scein")!`,
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
