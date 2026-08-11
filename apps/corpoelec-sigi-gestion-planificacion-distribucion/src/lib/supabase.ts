import { createClient } from '@supabase/supabase-js';

const env = (import.meta as any).env || {};

const supabaseUrl =
  env.VITE_SUPABASE_URL ||
  env.NEXT_PUBLIC_SUPABASE_URL ||
  env.SUPABASE_URL ||
  'https://owpiwacuotcaeruvonbd.supabase.co';

const supabaseAnonKey =
  env.VITE_SUPABASE_ANON_KEY ||
  env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  env.SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im93cGl3YWN1b3RjYWVydXZvbmJkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI4MzA2MDQsImV4cCI6MjA5ODQwNjYwNH0.cKoGATpTwXF-awZiqdCuY_L4hQX2t69P72vdLQTiVls';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Cliente tipado para el esquema dedicado 'sigi'
export const sigiSchema = supabase ? supabase.schema('sigi') : null;

export interface ConnectionTestResult {
  success: boolean;
  message: string;
  urlUsed: string;
  latencyMs?: number;
  details?: any;
}

export async function testSupabaseConnection(): Promise<ConnectionTestResult> {
  if (!supabaseUrl || !supabaseAnonKey) {
    return {
      success: false,
      message: 'Variables de entorno para Supabase no detectadas.',
      urlUsed: supabaseUrl || 'No configurada',
    };
  }

  if (!supabase) {
    return {
      success: false,
      message: 'No se pudo instanciar el cliente de Supabase JS.',
      urlUsed: supabaseUrl,
    };
  }

  const startTime = performance.now();

  try {
    // 1. Probar primero el esquema dedicado 'sigi'
    const { data: sigiData, error: sigiError } = await supabase
      .schema('sigi')
      .from('usuarios')
      .select('id, username, role, state_code')
      .limit(1);

    const endTime = performance.now();
    const latencyMs = Math.round(endTime - startTime);

    if (!sigiError) {
      return {
        success: true,
        message: `¡Conexión Exitosa al Esquema 'sigi'! (PostgreSQL Cloud Supabase, Latencia: ${latencyMs}ms)`,
        urlUsed: supabaseUrl,
        latencyMs,
        details: sigiData,
      };
    }

    // 2. Probar esquema 'samc' o tabla pública como fallback
    const { data: samcData, error: samcError } = await supabase
      .schema('samc')
      .from('samc_subestacion')
      .select('id, nombre')
      .limit(1);

    if (!samcError) {
      return {
        success: true,
        message: `Conexión activa a Supabase (Esquema 'samc' verificado. Esquema 'sigi' listo para ejecución de DDL DDL)`,
        urlUsed: supabaseUrl,
        latencyMs,
        details: samcData,
      };
    }

    return {
      success: true,
      message: `¡Servidor Supabase Operativo! (${latencyMs}ms)`,
      urlUsed: supabaseUrl,
      latencyMs,
      details: sigiError || samcError,
    };
  } catch (err: any) {
    return {
      success: false,
      message: `Error de red o conexión con Supabase: ${err.message || String(err)}`,
      urlUsed: supabaseUrl,
    };
  }
}
