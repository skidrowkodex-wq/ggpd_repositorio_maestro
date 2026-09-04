import { insforgeUrl, insforgeAnonKey, isInsforgeConfigured } from './insforgeClient';

/**
 * ==============================================================================
 * SERVICIO SCMTP - MINUTAS, COMPROMISOS Y PENDIENTES DE ÁREA
 * Fuente: InsForge (vistas públicas v_scmtp_minutas, v_scmtp_compromisos_tareas,
 * v_scmtp_pendientes_area) — esquema maestro scmtp del proyecto ggpd-data-maestra-0002.
 * Sin data mock: si no hay registros o falla la conexión, retorna [].
 * ==============================================================================
 */

export interface ParticipanteMinuta {
  nombre: string;
  unidadOrganizativa: string;
  asistio: boolean;
  observacion?: string;
}

export interface HistorialAvance {
  id: string;
  fecha: string;
  nota: string;
  porcentaje: number;
  usuario: string;
}

export interface TareaCompromisoSCTAP {
  id: string;
  minutaNumero: string;
  minutaFecha: string;
  responsable: string;
  compromiso: string;
  plazoText: string;
  plazoFechaISO: string;
  vinculacionOrigen: string;
  estado: 'Pendiente' | 'En Proceso' | 'Validacion' | 'Completado';
  prioridad: 'Alta' | 'Media' | 'Baja';
  avancePorcentaje: number;
  areaGestion: string;
  observaciones: string;
  historialAvances: HistorialAvance[];
  createdAt: string;
  updatedAt: string;
}

export interface PendienteAreaSCTAP {
  id: string;
  area: string;
  pendiente: string;
  dependeDe: string;
  estado: 'Pendiente' | 'En Proceso' | 'Completado';
  observacion: string;
}

export interface MinutaReunionSCTAP {
  id: string;
  numero: string;
  code: string;
  fecha: string;
  fechaISO: string;
  hora: string;
  lugar: string;
  coordinador: string;
  unidadOrganizativa: string;
  objetivo: string;
  participantes: ParticipanteMinuta[];
  compromisosCount: number;
  pendientesCount: number;
  proximaFechaSeguimiento: string;
  elaboradoPor: string;
  nombreArchivo: string;
  driveUrl: string;
  stateCode: 'NAC' | 'DCA';
}

/** Registro crudo tal como viene de public.v_scmtp_minutas */
interface ScmtpMinutaRecord {
  id: string;
  numero?: string | null;
  fecha?: string | null;
  fecha_iso?: string | null;
  hora?: string | null;
  lugar?: string | null;
  coordinador?: string | null;
  unidad_organizativa?: string | null;
  objetivo?: string | null;
  compromisos_count?: number | null;
  pendientes_count?: number | null;
  proxima_fecha_seguimiento?: string | null;
  elaborado_por?: string | null;
  nombre_archivo?: string | null;
}

/** Registro crudo tal como viene de public.v_scmtp_compromisos_tareas */
interface ScmtpCompromisoRecord {
  id: string;
  minuta_numero?: string | null;
  minuta_fecha?: string | null;
  responsable?: string | null;
  compromiso?: string | null;
  plazo_text?: string | null;
  plazo_fecha_iso?: string | null;
  vinculacion_origen?: string | null;
  estado?: string | null;
  prioridad?: string | null;
  avance_porcentaje?: number | null;
  area_gestion?: string | null;
  observaciones?: string | null;
  historial_avances?: any;
  created_at?: string | null;
  updated_at?: string | null;
}

/** Registro crudo tal como viene de public.v_scmtp_pendientes_area */
interface ScmtpPendienteRecord {
  id: string;
  area?: string | null;
  pendiente?: string | null;
  depende_de?: string | null;
  estado?: string | null;
  observacion?: string | null;
}

function normalizeEstadoTarea(v?: string | null): TareaCompromisoSCTAP['estado'] {
  const e = (v || '').trim().toLowerCase();
  if (e === 'completado') return 'Completado';
  if (e === 'validacion' || e === 'validación') return 'Validacion';
  if (e === 'en proceso') return 'En Proceso';
  return 'Pendiente';
}

function normalizeEstadoPendiente(v?: string | null): PendienteAreaSCTAP['estado'] {
  const e = (v || '').trim().toLowerCase();
  if (e === 'completado') return 'Completado';
  if (e === 'en proceso') return 'En Proceso';
  return 'Pendiente';
}

function normalizePrioridad(v?: string | null): TareaCompromisoSCTAP['prioridad'] {
  const p = (v || '').trim().toLowerCase();
  if (p === 'alta') return 'Alta';
  if (p === 'baja') return 'Baja';
  return 'Media';
}

function normalizeHistorial(raw: any): HistorialAvance[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((h: any, i: number) => ({
    id: String(h?.id ?? `hist-${i}`),
    fecha: String(h?.fecha ?? ''),
    nota: String(h?.nota ?? ''),
    porcentaje: Number(h?.porcentaje ?? 0),
    usuario: String(h?.usuario ?? ''),
  }));
}

export function mapMinuta(r: ScmtpMinutaRecord): MinutaReunionSCTAP {
  const numero = r.numero || '';
  return {
    id: String(r.id),
    numero,
    code: numero ? `NAC_GGPD_MINUTA_${numero.replace(/-/g, '_')}` : String(r.id),
    fecha: r.fecha || (r.fecha_iso || ''),
    fechaISO: r.fecha_iso || '',
    hora: r.hora || '',
    lugar: r.lugar || '',
    coordinador: r.coordinador || '',
    unidadOrganizativa: r.unidad_organizativa || '',
    objetivo: r.objetivo || '',
    participantes: [],
    compromisosCount: r.compromisos_count ?? 0,
    pendientesCount: r.pendientes_count ?? 0,
    proximaFechaSeguimiento: r.proxima_fecha_seguimiento || '',
    elaboradoPor: r.elaborado_por || '',
    nombreArchivo: r.nombre_archivo || '',
    driveUrl: '',
    stateCode: 'NAC',
  };
}

export function mapCompromiso(r: ScmtpCompromisoRecord): TareaCompromisoSCTAP {
  return {
    id: String(r.id),
    minutaNumero: r.minuta_numero || '',
    minutaFecha: r.minuta_fecha || '',
    responsable: r.responsable || '',
    compromiso: r.compromiso || '',
    plazoText: r.plazo_text || '',
    plazoFechaISO: r.plazo_fecha_iso || '',
    vinculacionOrigen: r.vinculacion_origen || '',
    estado: normalizeEstadoTarea(r.estado),
    prioridad: normalizePrioridad(r.prioridad),
    avancePorcentaje: r.avance_porcentaje ?? 0,
    areaGestion: r.area_gestion || 'General',
    observaciones: r.observaciones || '',
    historialAvances: normalizeHistorial(r.historial_avances),
    createdAt: r.created_at || '',
    updatedAt: r.updated_at || '',
  };
}

export function mapPendiente(r: ScmtpPendienteRecord): PendienteAreaSCTAP {
  return {
    id: String(r.id),
    area: r.area || 'General',
    pendiente: r.pendiente || '',
    dependeDe: r.depende_de || '',
    estado: normalizeEstadoPendiente(r.estado),
    observacion: r.observacion || '',
  };
}

async function fetchView<T>(view: string): Promise<T[]> {
  try {
    const res = await fetch(
      `${insforgeUrl.replace(/\/+$/, '')}/api/database/records/${view}?limit=500`,
      {
        method: 'GET',
        headers: {
          apikey: insforgeAnonKey,
          Authorization: `Bearer ${insforgeAnonKey}`,
          Accept: 'application/json',
        },
      }
    );
    if (!res.ok) {
      console.warn(`⚠️ SCMTP: HTTP ${res.status} consultando ${view}`);
      return [];
    }
    const data = await res.json();
    return Array.isArray(data) ? (data as T[]) : [];
  } catch (err) {
    console.warn(`❌ SCMTP: Excepción consultando ${view}:`, err);
    return [];
  }
}

export interface ScmtpData {
  minutas: MinutaReunionSCTAP[];
  compromisos: TareaCompromisoSCTAP[];
  pendientes: PendienteAreaSCTAP[];
}

/**
 * Carga minutas, compromisos y pendientes de SCMTP desde InsForge.
 * Arranca vacío: ante fallo de red o sin registros devuelve listas vacías.
 */
export async function fetchScmtpData(): Promise<ScmtpData> {
  if (!isInsforgeConfigured || !insforgeAnonKey) {
    return { minutas: [], compromisos: [], pendientes: [] };
  }

  const [minutasRaw, compromisosRaw, pendientesRaw] = await Promise.all([
    fetchView<ScmtpMinutaRecord>('v_scmtp_minutas'),
    fetchView<ScmtpCompromisoRecord>('v_scmtp_compromisos_tareas'),
    fetchView<ScmtpPendienteRecord>('v_scmtp_pendientes_area'),
  ]);

  return {
    minutas: minutasRaw.map(mapMinuta),
    compromisos: compromisosRaw.map(mapCompromiso),
    pendientes: pendientesRaw.map(mapPendiente),
  };
}
