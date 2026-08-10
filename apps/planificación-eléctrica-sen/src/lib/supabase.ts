import { createClient } from '@supabase/supabase-js';

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL ||
  import.meta.env.NEXT_PUBLIC_SUPABASE_URL ||
  import.meta.env.SUPABASE_URL ||
  '';

const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  import.meta.env.SUPABASE_ANON_KEY ||
  import.meta.env.SUPABASE_KEY ||
  import.meta.env.SUPABASE_SERVICE_ROLE_KEY ||
  '';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export interface ConnectionTestResult {
  success: boolean;
  message: string;
  urlUsed: string;
  details?: any;
}

export async function testSupabaseConnection(): Promise<ConnectionTestResult> {
  if (!supabaseUrl || !supabaseAnonKey) {
    return {
      success: false,
      message: 'Faltan variables de entorno para Supabase (URL y/o Key no configuradas).',
      urlUsed: supabaseUrl || 'No especificada',
    };
  }

  if (!supabase) {
    return {
      success: false,
      message: 'No se pudo instanciar el cliente de Supabase.',
      urlUsed: supabaseUrl,
    };
  }

  try {
    // Intentamos hacer una consulta liviana al esquema o tabla
    // 1. Intentamos consultar en esquema samc si existe
    const { data: samcData, error: samcError } = await supabase
      .schema('samc')
      .from('samc_subestacion')
      .select('id, nombre')
      .limit(1);

    if (!samcError) {
      return {
        success: true,
        message: `¡Conexión Exitosa a Supabase! (Esquema 'samc' activo, ${samcData?.length ?? 0} registros leídos).`,
        urlUsed: supabaseUrl,
        details: samcData,
      };
    }

    // 2. Si falla samc por permisos o no existir la tabla aún, probamos consulta genérica
    const { data, error } = await supabase
      .from('subestaciones')
      .select('*')
      .limit(1);

    if (error && error.code !== 'PGRST116') {
      // Si responde el servidor Supabase pero da error de tabla no existente o RLS
      if (error.message || error.code) {
        return {
          success: true,
          message: `Servidor Supabase conectado correctamente a ${supabaseUrl}. (Respuesta API: ${error.message})`,
          urlUsed: supabaseUrl,
          details: error,
        };
      }
    }

    return {
      success: true,
      message: `¡Conexión establecida con éxito con la base de datos Supabase!`,
      urlUsed: supabaseUrl,
      details: data,
    };
  } catch (err: any) {
    return {
      success: false,
      message: `Error al intentar conectar con Supabase: ${err.message || String(err)}`,
      urlUsed: supabaseUrl,
    };
  }
}
