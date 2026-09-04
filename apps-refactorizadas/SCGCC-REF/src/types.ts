export type DireccionTipo = 'ENTRADA' | 'SALIDA' | 'INTERNA';

export type TipoDocumento = 
  | 'OFICIO'
  | 'MEMORANDUM'
  | 'PUNTO_DE_CUENTA'
  | 'CIRCULAR'
  | 'SOLICITUD_1X10'
  | 'INFORME_TECNICO'
  | 'OTRO';

export type NivelConfidencialidad = 'ORDINARIO' | 'CONFIDENCIAL' | 'RESERVADO_DIRECTIVA';

export type PropositoDocumento = 
  | 'INSTRUCCION_EJECUTIVA'    // ⚡ Instrucción Directa Superior (GGD / Despacho Ministerial)
  | 'EVALUACION_TECNICA'       // 🔍 Evaluación Técnica / Dictamen SEN
  | 'REVISION_CONFORMACION'    // 📑 Revisión / Conformación Previa
  | 'INFORMATIVO_NOTIFICACION'; // 📢 Informativo / Toma de Razón

export type Prioridad = 'BAJA' | 'MEDIA' | 'ALTA' | 'URGENTE_24H';

export type EstadoTramite = 
  | 'RADICADO'
  | 'EN_REVISION'
  | 'ASIGNADO_CON_TAREA'
  | 'BORRADOR_RESPUESTA'
  | 'PENDIENTE_FIRMA'
  | 'FIRMADO_FISICO'
  | 'DESPACHADO_CON_ACUSE'
  | 'RESPONDIDO'
  | 'ARCHIVADO'
  | 'ANULADO';

export type EstadoFirma = 
  | 'BORRADOR_REVISION'
  | 'PENDIENTE_FIRMA'
  | 'EN_CORRECCION'
  | 'FIRMADO_FISICO'
  | 'DESPACHADO_CON_ACUSE';

export interface OficioRespuesta {
  id: string;
  correspondenciaOrigenId: string;
  correlativoOrigen: string;
  numeroOficio: string; // ej: GGPD-OF-2026-0045
  tipoDocumento: 'OFICIO' | 'MEMORANDUM' | 'PUNTO_DE_CUENTA';
  destinatarioInstitucion: string;
  destinatarioNombre: string;
  destinatarioCargo: string;
  asunto: string;
  referenciaAntecedente: string;
  cuerpoTexto: string;
  conclusionesTecnicas?: string;
  firmanteNombre: string;
  firmanteCargo: string;
  redactadoPor: string;
  estadoFirma: EstadoFirma;
  observacionesRevision?: string;
  fechaCreacion: string;
  fechaFirma?: string;
  fechaDespacho?: string;
  nroGuiaAcuse?: string;
  receptorAcuseNombre?: string;
  archivoAcuseUrl?: string;
  archivoWordUrl?: string;
  copias?: string;
  anexos?: string;
}

export interface CorrespondenciaRecord {
  id: string;
  correlativo: string; // ej: RAD-GGPD-2026-0001
  direccion: DireccionTipo;
  tipoDocumento: TipoDocumento;
  numeroDocumentoOrigen: string; // ej: GGD-NR-0764-202608
  remitenteInstitucion: string; // ej: Gerencia General de Distribución
  remitenteNombre?: string;
  remitenteCargo?: string;
  destinatarioPrincipal: string;
  destinatariosCopia?: string;
  asunto: string;
  descripcionSintesis?: string;
  nivelConfidencialidad: NivelConfidencialidad;
  proposito?: PropositoDocumento;
  instruidoPor?: string; // ej: "Ing. Adrián Correa (GGD)" o "Despacho Ministerial"
  prioridad: Prioridad;
  fechaEmisionOrigen: string; // YYYY-MM-DD
  fechaRecepcion: string; // YYYY-MM-DD o ISO
  fechaLimiteRespuesta?: string; // SLA
  estadoTramite: EstadoTramite;
  medioEntrega?: string; // WhatsApp, Telegram, Físico, Correo
  observaciones?: string;
  requiereRespuesta: boolean;
  oficioRespuestaRef?: string;
  oficioRespuestaDetalle?: OficioRespuesta;
  pdfDriveUrl?: string;
  pdfDriveId?: string;
  pdfFileName?: string;
  tareaScmtpId?: string;
  tareaScmtpTitulo?: string;
  responsableAsignado?: string;
  responsableCargo?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TrazabilidadEvent {
  id: string;
  correspondenciaId: string;
  fecha: string;
  usuario: string;
  accion: string;
  estadoAnterior?: string;
  estadoNuevo?: string;
  detalle: string;
}

export interface PlantillaCorporativa {
  id: string;
  nombre: string;
  tipo: 'MEMORANDO' | 'OFICIO' | 'VACACIONES' | 'OTRO';
  tamanoKB: number;
  driveUrl: string;
  driveId: string;
  formato: 'DOCX' | 'XLSX';
}

export interface UserProfile {
  id: string;
  username: string;
  nombre: string;
  cargo: string;
  rol: 'ADMINISTRADOR' | 'GERENTE' | 'SUPERVISOR' | 'SECRETARIA' | 'ANALISTA' | 'AUDITOR';
  dependencia: string;
  email?: string;
  permisoScgcc: boolean;
  avatar?: string;
  aliases?: string[];
}

