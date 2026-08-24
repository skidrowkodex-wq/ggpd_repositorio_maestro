import { createClient } from '@insforge/sdk';

export const insforgeUrl = (import.meta as any).env?.VITE_INSFORGE_URL || 'https://wxkeqf37.ap-southeast.insforge.app';
export const insforgeAnonKey = (import.meta as any).env?.VITE_INSFORGE_API_KEY || '***REMOVED***';
export const insforgeProjectId = 'ggpd-data-maestra-0002';

export const insforge = createClient({
  baseUrl: insforgeUrl,
  anonKey: insforgeAnonKey,
  headers: {
    apikey: insforgeAnonKey,
    Authorization: `Bearer ${insforgeAnonKey}`,
  },
});

export const isInsforgeConfigured = Boolean(insforgeUrl && insforgeAnonKey);

export interface InsForgeConnectionTestResult {
  success: boolean;
  message: string;
  urlUsed: string;
  projectId: string;
  latencyMs?: number;
  details?: any;
}

export async function testInsforgeConnection(): Promise<InsForgeConnectionTestResult> {
  if (!insforgeUrl || !insforgeAnonKey) {
    return {
      success: false,
      message: 'Variables de conexión para InsForge BaaS no detectadas.',
      urlUsed: insforgeUrl || 'No configurada',
      projectId: insforgeProjectId,
    };
  }

  const startTime = performance.now();

  // 1. Intento con fetch directo con timeout y headers completos
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 8000);

    const directRes = await fetch(`${insforgeUrl}/api/database/records/v_usuarios_sistema?limit=1`, {
      method: 'GET',
      headers: {
        'apikey': insforgeAnonKey,
        'Authorization': `Bearer ${insforgeAnonKey}`,
        'Accept': 'application/json',
      },
      signal: controller.signal,
    });

    clearTimeout(timer);

    const latencyMs = Math.round(performance.now() - startTime);

    if (directRes.ok) {
      const data = await directRes.json();
      return {
        success: true,
        message: `¡Servidor InsForge BaaS Operativo! (${latencyMs}ms)`,
        urlUsed: insforgeUrl,
        projectId: insforgeProjectId,
        latencyMs,
        details: data,
      };
    }
  } catch (directErr: any) {
    console.warn('Direct InsForge fetch failed, trying SDK fallback...', directErr);
  }

  // 2. Intento mediante el SDK de InsForge
  try {
    const { data, error } = await insforge.database
      .from('v_usuarios_sistema')
      .select('id, username, role_code, estado_codigo')
      .limit(1);

    const latencyMs = Math.round(performance.now() - startTime);

    if (!error && data) {
      return {
        success: true,
        message: `¡Servidor InsForge BaaS Operativo! (${latencyMs}ms)`,
        urlUsed: insforgeUrl,
        projectId: insforgeProjectId,
        latencyMs,
        details: data,
      };
    }

    return {
      success: false,
      message: `Error al consultar InsForge: ${error?.message || 'Respuesta vacía'}`,
      urlUsed: insforgeUrl,
      projectId: insforgeProjectId,
      latencyMs,
      details: error,
    };
  } catch (err: any) {
    return {
      success: false,
      message: `Error de red o conexión con InsForge BaaS: ${err.message || String(err)}`,
      urlUsed: insforgeUrl,
      projectId: insforgeProjectId,
    };
  }
}
