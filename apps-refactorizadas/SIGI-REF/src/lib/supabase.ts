/**
 * ==============================================================================
 * CORPOELEC - GERENCIA GENERAL DE PLANIFICACIÓN DE DISTRIBUCIÓN (GGPD)
 * CLIENTE MAESTRO DE DATOS - INSFORGE BAAS (POSTGRESQL CLOUD)
 * ==============================================================================
 * Conexión centralizada al BaaS InsForge de Grado Industrial SEN.
 */

export { 
  insforge as supabase,
  isInsforgeConfigured as isSupabaseConfigured,
  testInsforgeConnection as testSupabaseConnection,
  insforgeUrl as supabaseUrl
} from '../services/insforgeClient';

export type { InsForgeConnectionTestResult as ConnectionTestResult } from '../services/insforgeClient';
