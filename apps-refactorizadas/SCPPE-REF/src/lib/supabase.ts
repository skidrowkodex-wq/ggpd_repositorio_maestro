/**
 * ==============================================================================
 * CORPOELEC - GERENCIA GENERAL DE PLANIFICACIÓN DE DISTRIBUCIÓN (GGPD)
 * CLIENTE MAESTRO DE DATOS - INSFORGE POSTGRESQL (SCPPE V3.0)
 * ==============================================================================
 */

const env = (import.meta as any).env || {};
const insforgeUrl = (env.VITE_INSFORGE_URL || env.INSFORGE_URL || 'https://wxkeqf37.ap-southeast.insforge.app').trim();
const insforgeApiKey = (env.VITE_INSFORGE_API_KEY || env.INSFORGE_API_KEY || '***REMOVED***').trim();

export const isSupabaseConfigured = Boolean(insforgeUrl && insforgeApiKey);

class InsforgeQueryBuilder implements PromiseLike<{ data: any[] | null; error: any }> {
  private url: string;
  private key: string;
  private tableName: string;
  private queryParams: string[] = [];
  private action: 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE' = 'SELECT';
  private writePayload: any = null;

  constructor(url: string, key: string, tableName: string) {
    this.url = url.replace(/\/+$/, '');
    this.key = key;
    this.tableName = tableName;
  }

  private getHeaders() {
    return {
      'apikey': this.key,
      'Authorization': `Bearer ${this.key}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
  }

  private resolveEndpoint() {
    const map: Record<string, string> = {
      'proyectos_prtsen': 'v_scppe_proyectos_prtsen',
      'samc_proyecto_especial': 'v_scppe_proyectos_prtsen',
      'mae_proyectos_especiales': 'v_scppe_proyectos_prtsen',
      'v_scppe_proyectos_prtsen': 'v_scppe_proyectos_prtsen',
      'viaticos': 'v_scppe_viaticos_control',
      'samc_asignacion_viatico': 'v_scppe_viaticos_control',
      'mae_viaticos_control': 'v_scppe_viaticos_control',
      'v_scppe_viaticos_control': 'v_scppe_viaticos_control',
      'mae_comprobantes_viatico': 'v_scppe_comprobantes_viatico',
      'comprobantes_viatico': 'v_scppe_comprobantes_viatico',
      'v_scppe_comprobantes_viatico': 'v_scppe_comprobantes_viatico',
      'v_conciliacion_presupuestaria': 'v_scppe_conciliacion_presupuestaria',
      'samc_subestacion': 'mae_subestaciones',
      'subestaciones': 'mae_subestaciones',
      'mae_subestaciones': 'mae_subestaciones',
      'samc_circuito': 'mae_circuitos',
      'circuitos': 'mae_circuitos',
      'mae_circuitos': 'mae_circuitos',
      'samc_poa_accion_especifica': 'v_scppe_poa_acciones',
      'poa_acciones': 'v_scppe_poa_acciones',
      'mae_poa_acciones': 'v_scppe_poa_acciones',
      'v_scppe_poa_acciones': 'v_scppe_poa_acciones',
      'samc_proyecto_ggd': 'v_scppe_proyectos_ggd',
      'proyectos_ggd': 'v_scppe_proyectos_ggd',
      'mae_proyectos_ggd': 'v_scppe_proyectos_ggd',
      'v_scppe_proyectos_ggd': 'v_scppe_proyectos_ggd',
      'organizaciones': 'v_organizaciones_arbol',
      'dim_organizaciones': 'v_organizaciones_arbol',
      'v_organizaciones_arbol': 'v_organizaciones_arbol',
      'cat_tipos_organizacion': 'cat_tipos_organizacion',
      'samc_audit_log': 'audit_logs',
      'audit_logs': 'audit_logs',
    };
    return map[this.tableName] || this.tableName;
  }

  private resolveWriteEndpoint() {
    const map: Record<string, string> = {
      'proyectos_prtsen': 'mae_proyectos_especiales',
      'samc_proyecto_especial': 'mae_proyectos_especiales',
      'v_scppe_proyectos_prtsen': 'mae_proyectos_especiales',
      'viaticos': 'mae_viaticos_control',
      'samc_asignacion_viatico': 'mae_viaticos_control',
      'v_scppe_viaticos_control': 'mae_viaticos_control',
      'mae_comprobantes_viatico': 'v_scppe_comprobantes_viatico',
      'comprobantes_viatico': 'v_scppe_comprobantes_viatico',
      'v_scppe_comprobantes_viatico': 'v_scppe_comprobantes_viatico',
      'samc_poa_accion_especifica': 'mae_poa_acciones',
      'v_scppe_poa_acciones': 'mae_poa_acciones',
      'samc_proyecto_ggd': 'mae_proyectos_ggd',
      'v_scppe_proyectos_ggd': 'mae_proyectos_ggd',
      'samc_audit_log': 'mae_auditorias',
    };
    return map[this.tableName] || this.tableName;
  }

  select(columns: string = '*') {
    this.action = 'SELECT';
    if (columns && columns !== '*') {
      this.queryParams.push(`select=${encodeURIComponent(columns)}`);
    }
    return this;
  }

  eq(column: string, value: any) {
    this.queryParams.push(`${column}=eq.${encodeURIComponent(value)}`);
    return this;
  }

  order(column: string, options?: { ascending?: boolean }) {
    const dir = options?.ascending === false ? 'desc' : 'asc';
    this.queryParams.push(`order=${column}.${dir}`);
    return this;
  }

  limit(count: number) {
    this.queryParams.push(`limit=${count}`);
    return this;
  }

  single() {
    this.queryParams.push('limit=1');
    return this;
  }

  insert(records: any | any[]) {
    this.action = 'INSERT';
    this.writePayload = Array.isArray(records) ? records : [records];
    return this;
  }

  upsert(records: any | any[]) {
    return this.insert(records);
  }

  update(updates: any) {
    this.action = 'UPDATE';
    this.writePayload = updates;
    return this;
  }

  delete() {
    this.action = 'DELETE';
    return this;
  }

  async execute(): Promise<{ data: any | null; error: any }> {
    try {
      if (this.action === 'SELECT') {
        const endpoint = this.resolveEndpoint();
        const qs = this.queryParams.length > 0 ? `?${this.queryParams.join('&')}` : '?limit=500';
        const res = await fetch(`${this.url}/api/database/records/${endpoint}${qs}`, {
          method: 'GET',
          headers: this.getHeaders(),
        });
        if (!res.ok) {
          return { data: null, error: { message: `HTTP ${res.status}: ${res.statusText}` } };
        }
        const data = await res.json();
        return { data: Array.isArray(data) ? data : [], error: null };
      }

      if (this.action === 'INSERT') {
        const endpoint = this.resolveWriteEndpoint();
        const res = await fetch(`${this.url}/api/database/records/${endpoint}`, {
          method: 'POST',
          headers: this.getHeaders(),
          body: JSON.stringify(this.writePayload),
        });
        if (!res.ok) {
          const text = await res.text();
          return { data: null, error: { message: text } };
        }
        const data = await res.json();
        return { data, error: null };
      }

      if (this.action === 'UPDATE') {
        const endpoint = this.resolveWriteEndpoint();
        const qs = this.queryParams.length > 0 ? `?${this.queryParams.join('&')}` : '';
        const res = await fetch(`${this.url}/api/database/records/${endpoint}${qs}`, {
          method: 'PATCH',
          headers: this.getHeaders(),
          body: JSON.stringify(this.writePayload),
        });
        if (!res.ok) {
          const text = await res.text();
          return { data: null, error: { message: text } };
        }
        const data = await res.json();
        return { data, error: null };
      }

      if (this.action === 'DELETE') {
        const endpoint = this.resolveWriteEndpoint();
        const qs = this.queryParams.length > 0 ? `?${this.queryParams.join('&')}` : '';
        const res = await fetch(`${this.url}/api/database/records/${endpoint}${qs}`, {
          method: 'DELETE',
          headers: this.getHeaders(),
        });
        return { data: null, error: res.ok ? null : { message: `HTTP ${res.status}` } };
      }

      return { data: null, error: null };
    } catch (err: any) {
      return { data: null, error: err };
    }
  }

  // Permite chaining y ejecución al hacer `await`
  then<TResult1 = { data: any | null; error: any }, TResult2 = never>(
    onfulfilled?: ((value: { data: any | null; error: any }) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null
  ): Promise<TResult1 | TResult2> {
    return this.execute().then(onfulfilled, onrejected);
  }
}

class InsforgeDbClient {
  private url: string;
  private key: string;

  constructor(url: string, key: string) {
    this.url = url;
    this.key = key;
  }

  schema(schemaName: string) {
    return this;
  }

  from(tableName: string) {
    return new InsforgeQueryBuilder(this.url, this.key, tableName);
  }
}

export const supabase = isSupabaseConfigured
  ? new InsforgeDbClient(insforgeUrl, insforgeApiKey)
  : null;

export interface ConnectionTestResult {
  success: boolean;
  message: string;
  urlUsed: string;
  latencyMs?: number;
  details?: any;
}

export async function testSupabaseConnection(): Promise<ConnectionTestResult> {
  if (!insforgeUrl || !insforgeApiKey) {
    return {
      success: false,
      message: 'Faltan variables de entorno para InsForge BaaS.',
      urlUsed: insforgeUrl || 'No especificada',
    };
  }

  const startTime = Date.now();
  try {
    const res = await fetch(`${insforgeUrl.replace(/\/+$/, '')}/api/database/records/v_organizaciones_arbol?limit=1`, {
      method: 'GET',
      headers: {
        'apikey': insforgeApiKey,
        'Authorization': `Bearer ${insforgeApiKey}`,
        'Accept': 'application/json',
      },
    });

    const latencyMs = Date.now() - startTime;

    if (!res.ok) {
      return {
        success: false,
        message: `InsForge respondió con error HTTP ${res.status}: ${res.statusText}`,
        urlUsed: insforgeUrl,
        latencyMs,
      };
    }

    const data = await res.json();
    return {
      success: true,
      message: `Conexión exitosa a InsForge PostgreSQL (${latencyMs}ms). Esquemas activos: scppe & core.`,
      urlUsed: insforgeUrl,
      latencyMs,
      details: data,
    };
  } catch (err: any) {
    return {
      success: false,
      message: `Error de red al conectar con InsForge: ${err.message}`,
      urlUsed: insforgeUrl,
    };
  }
}
