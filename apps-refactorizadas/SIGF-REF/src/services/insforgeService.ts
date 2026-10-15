/**
 * Cliente HTTP minimal para InsForge (API REST estilo PostgREST).
 * Usado por el modo híbrido: localStorage como caché local + InsForge como
 * fuente de verdad sincronizada. Si la red falla, la app sigue operativa.
 *
 * Endpoints: /api/database/records/{tabla}
 * Auth: Bearer anon key (ISO/IEC 27001 — sin PII en la tabla sincronizada).
 */

const BASE_URL: string =
  (import.meta as any).env?.VITE_INSFORGE_URL ||
  (import.meta as any).env?.VITE_INSFORGE_API_URL ||
  'https://wxkeqf37.ap-southeast.insforge.app';

const ANON_KEY: string =
  (import.meta as any).env?.VITE_INSFORGE_ANON_KEY ||
  (import.meta as any).env?.VITE_INSFORGE_CLIENT_KEY ||
  '';

const REQUEST_TIMEOUT_MS = 8000;

export interface InsForgePermisoRow {
  id?: string;
  rol: string;
  accion: string;
  habilitado: boolean;
  actualizado_por?: string | null;
  actualizado_en?: string;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      ...init,
      signal: controller.signal,
      headers: {
        'Authorization': `Bearer ${ANON_KEY}`,
        'Content-Type': 'application/json',
        ...(init?.headers || {})
      }
    });
    if (!res.ok) {
      throw new Error(`InsForge HTTP ${res.status}`);
    }
    const text = await res.text();
    return (text ? JSON.parse(text) : []) as T;
  } finally {
    clearTimeout(timer);
  }
}

export const insforgeService = {
  isConfigured(): boolean {
    return Boolean(BASE_URL && ANON_KEY);
  },

  /** Lee la matriz completa de permisos desde InsForge. */
  async fetchPermisos(): Promise<InsForgePermisoRow[]> {
    return request<InsForgePermisoRow[]>(
      '/api/database/records/flota_permisos_roles?limit=1000'
    );
  },

  /**
   * Sincroniza la matriz completa: elimina las filas gestionadas por la app
   * y reinserta la matriz actual (upsert simple y seguro).
   */
  async pushPermisos(
    rows: Array<Omit<InsForgePermisoRow, 'id' | 'actualizado_en'>>,
    roles: string[]
  ): Promise<void> {
    // InsForge/PostgREST: los valores del operador `in.(...)` van SIN comillas.
    const filter = roles.join(',');
    await request(`/api/database/records/flota_permisos_roles?rol=in.(${filter})`, {
      method: 'DELETE'
    });
    if (rows.length > 0) {
      await request('/api/database/records/flota_permisos_roles', {
        method: 'POST',
        headers: { 'Prefer': 'return=minimal' },
        body: JSON.stringify(rows)
      });
    }
  }
};
