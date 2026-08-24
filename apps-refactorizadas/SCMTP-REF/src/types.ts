export type TaskStatus = 'Pendiente' | 'En Proceso' | 'En Revisión' | 'Completado';
export type PriorityLevel = 'Alta' | 'Media' | 'Baja';

export interface AvanceHistorial {
  id: string;
  fecha: string;
  nota: string;
  porcentaje: number;
  usuario: string;
}

export interface TareaCompromiso {
  id: string;
  minutaNumero: string;
  minutaFecha: string; // e.g. "30/07/2026"
  responsable: string; // e.g. "Yván Cipirán"
  compromiso: string; // Descripción del compromiso
  plazoText: string; // e.g. "12/08/2026" o "A partir del 31/07/2026"
  plazoFechaISO?: string; // YYYY-MM-DD para ordenamiento
  vinculacionOrigen: string; // e.g. "Punto 1 (Calidad de datos)", "Punto 2 (Automatización)"
  estado: TaskStatus;
  prioridad: PriorityLevel;
  avancePorcentaje: number; // 0 a 100
  areaGestion?: string;
  observaciones?: string;
  historialAvances: AvanceHistorial[];
  createdAt: string;
  updatedAt: string;
}

export interface PendienteArea {
  id: string;
  area: 'Data Base' | 'Automatización' | 'Formalización' | 'Tecnología' | 'Proyectos' | 'Transición' | 'Cierres' | string;
  pendiente: string;
  dependeDe: string;
  estado: TaskStatus;
  observacion?: string;
}

export interface ParticipanteMinuta {
  nombre: string;
  unidadOrganizativa: string;
  asistio: boolean;
  observacion?: string;
}

export interface MinutaReunion {
  id: string;
  numero: string; // e.g. "26-0004"
  fecha: string; // e.g. "30/07/2026"
  fechaISO: string; // e.g. "2026-07-30"
  hora: string; // e.g. "10:00 a.m."
  lugar: string; // e.g. "CARACAS"
  coordinador: string; // e.g. "ADRIAN CORREA"
  unidadOrganizativa: string; // "GERENCIA DE GESTIÓN DE PLANIFICACIÓN DE DISTRIBUCIÓN"
  objetivo: string;
  participantes: ParticipanteMinuta[];
  compromisosCount: number;
  pendientesCount: number;
  proximaFechaSeguimiento?: string;
  elaboradoPor?: string;
  nombreArchivo?: string;
  pdfBase64?: string; // Archivo PDF guardado en Base64 en la BD
  pdfUrl?: string; // URL publica o de Google Drive
  driveFileId?: string; // ID de Google Drive para descargas directas
}

export interface DriveFileItem {
  id: string;
  name: string;
  mimeType: string;
  createdTime?: string;
  modifiedTime?: string;
  size?: string;
  thumbnailLink?: string;
  webContentLink?: string;
  alreadyImported?: boolean;
}

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  serviceRoleKey?: string;
  isConnected: boolean;
}

export interface FilterState {
  searchQuery: string;
  responsable: string;
  estado: string;
  vinculacion: string;
  prioridad: string;
  mesEmision?: string;
}

export type UserRole = 'admin' | 'supervisor' | 'analista';

export interface UserProfile {
  id: string;
  name: string;
  username: string; // formato w_prato
  password?: string; // e.g. Prato2026.
  role: UserRole;
  cargo: string;
  unidadOrganizativa?: string;
  activo: boolean;
  canUploadDocuments: boolean;
  canManageUsers: boolean;
  canEditTaskStatus: boolean;
  lastLogin?: string;
}

export interface IsoAuditLogEntry {
  id: string;
  timestamp: string;
  usuario: string;
  rol: string;
  accion: string;
  modulo: string;
  detalles: string;
  ipAcceso?: string;
  isoStandard: 'ISO_27001' | 'ISO_8000' | 'ISO_9001';
}

export interface IsoDataQualityMetric {
  codigo: string;
  nombre: string;
  norma: string;
  estado: 'Conforme' | 'Advertencia' | 'No Conforme';
  porcentajeCumplimiento: number;
  observacion: string;
}

export interface StrategicKgiKpi {
  id: string;
  ejeEstrategico: string;
  kgiGoal: {
    codigo: string;
    descripcion: string;
    metaAnual: string;
    valorActual: number;
    metaTarget: number;
    unidad: string;
    tendencia: 'up' | 'down' | 'stable';
    estadoMeta: 'En Meta' | 'Riesgo Moderado' | 'Atención Requerida';
  };
  kpiOperational: {
    codigo: string;
    indicador: string;
    frecuencia: string;
    porcentajeEjecucion: number;
    compromisosAsociados: number;
    responsablePrincipal: string;
  };
  origenMinuta: string;
  observacionEstrategica: string;
}

