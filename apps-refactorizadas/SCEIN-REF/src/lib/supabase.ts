import { createClient, SupabaseClient } from '@supabase/supabase-js';

export function getSupabaseClient(customUrl?: string, customKey?: string, schema: string = 'scei'): SupabaseClient<any, any, any> | null {
  const metaEnv = (import.meta as any).env || {};
  const clean = (val?: string) => (val || '').trim().replace(/^["']|["']$/g, '');
  const url = clean(customUrl || metaEnv.VITE_SUPABASE_URL || metaEnv.SUPABASE_URL);
  const key = clean(customKey || metaEnv.VITE_SUPABASE_ANON_KEY || metaEnv.SUPABASE_ANON_KEY || metaEnv.SUPABASE_KEY);

  if (!url || !key || (!url.startsWith('http://') && !url.startsWith('https://'))) {
    return null;
  }

  try {
    return createClient(url, key, {
      db: {
        schema: schema,
      },
    });
  } catch (err) {
    console.error('Error instanciando cliente de Supabase:', err);
    return null;
  }
}

export async function testSupabaseConnection(url: string, key: string, schema: string = 'scei') {
  const startTime = performance.now();
  if (!url || !key) {
    return {
      success: false,
      message: 'Debes proporcionar tanto la URL del proyecto Supabase como la clave API (anon key).',
      latencyMs: 0,
    };
  }

  try {
    const client = createClient(url, key, {
      db: {
        schema: schema,
      },
    });

    // Intentar una consulta ligera para verificar conectividad con Supabase REST API en el esquema configurado
    const { data, error } = await client.from('_connection_test_check').select('*').limit(1);
    const endTime = performance.now();
    const latencyMs = Math.round(endTime - startTime);

    if (error) {
      // Si el error es PGRST204 o 42P01 (tabla no existe) o error de relación, la conexión con el servidor Supabase fue EXITOSA.
      if (
        error.code === '42P01' || 
        error.code === 'PGRST204' || 
        error.code === 'PGRST106' ||
        error.message.includes('relation') ||
        error.message.includes('does not exist') ||
        error.message.includes('schema') ||
        error.code === 'PGRST301'
      ) {
        return {
          success: true,
          message: `¡Conexión exitosa a Supabase en el esquema "${schema}"! El servidor respondió correctamente.`,
          latencyMs,
          details: `Respuesta del servidor PostgREST (esquema "${schema}"): [${error.code}] ${error.message}`,
        };
      }

      // Si hay error de autenticación o URL inválida
      return {
        success: false,
        message: `Error al conectar con Supabase en el esquema "${schema}": ${error.message}`,
        latencyMs,
        errorCode: error.code,
      };
    }

    return {
      success: true,
      message: `¡Conexión exitosa con el servidor Supabase en el esquema "${schema}"!`,
      latencyMs,
      data,
    };
  } catch (err: any) {
    const endTime = performance.now();
    return {
      success: false,
      message: `Error de red o configuración: ${err.message || 'No se pudo contactar al host de Supabase'}`,
      latencyMs: Math.round(endTime - startTime),
    };
  }
}
