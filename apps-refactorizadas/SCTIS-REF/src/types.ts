export interface SupabaseConfig {
  url: string;
  anonKey: string;
  serviceRoleKey?: string;
  isConnected: boolean;
}

/**
 * Tira de Interrupción de Distribución.
 * Se carga desde la vista pública real de InsForge `v_sctis_tiras_interrupcion`
 * (espejo de la tabla maestra `sctis.mae_interrupciones_tiras`).
 * El mapeo es tolerante: soporta tanto la nomenclatura de la vista como la de la
 * tabla maestra, y los campos opcionales quedan como null si no vienen en el registro.
 */
export interface TiraInterrupcion {
  id: string | number;
  // Identificación del evento
  codigoEstado?: string | null;
  estadoNombre?: string | null;
  sistema?: string | null;
  jefatura?: string | null;
  // Subestación y circuito
  subestacionNombre?: string | null;
  circuitoCodigo?: string | null;
  // Ventana de tiempo
  fechaApertura?: string | null;
  fechaCierre?: string | null;
  duracionMinutos?: number | null;
  duracionHoras?: number | null;
  mes?: string | null;
  // Magnitudes
  mwInterrumpidos?: number | null;
  kva?: number | null;
  racion?: number | null;
  // Causa
  causaCodigo?: string | null;
  causaNombre?: string | null;
  // Detalle
  observacion?: string | null;
  sectores?: string | null;
  ciudad?: string | null;
  despachador?: string | null;
  // Metadatos
  creadoEn?: string | null;
  actualizadoEn?: string | null;
}

export interface Despachador {
  id: string | number;
  codigoDespachador?: string | null;
  nombre: string;
  centroDespacho?: string | null;
  esActivo?: boolean;
  createdAt?: string | null;
}

export interface CargaTira {
  codigoEstado?: string;
  sistema?: string;
  jefatura?: string;
  subestacionNombre?: string;
  circuitoCodigo?: string;
  fechaApertura?: string;
  fechaCierre?: string;
  duracionMinutos?: number;
  mwInterrumpidos?: number;
  causaCodigo?: string;
  observacion?: string;
  despachador?: string;
  mes?: string;
  ciudad?: string;
  sectores?: string;
}

export type EstadoCarga = 'idle' | 'cargando' | 'error' | 'vacio' | 'listo';