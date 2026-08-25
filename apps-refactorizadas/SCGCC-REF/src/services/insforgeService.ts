import { CorrespondenciaRecord, OficioRespuesta, EstadoFirma, PropositoDocumento } from '../types';

export const INSFORGE_URL = (import.meta as any).env?.VITE_INSFORGE_URL || 'https://wxkeqf37.ap-southeast.insforge.app';
export const INSFORGE_KEY = (import.meta as any).env?.VITE_INSFORGE_API_KEY || '***REMOVED***';

const getHeaders = () => ({
  'apikey': INSFORGE_KEY,
  'Authorization': `Bearer ${INSFORGE_KEY}`,
  'Content-Type': 'application/json',
  'Accept': 'application/json',
});

// Transforma la fila SQL snake_case a objeto CorrespondenciaRecord
export function mapRowToCorrespondencia(row: any): CorrespondenciaRecord {
  let oficioRespuestaDetalle: OficioRespuesta | undefined = undefined;

  if (row.oficio_numero) {
    oficioRespuestaDetalle = {
      id: row.oficio_id || `of-${row.id}`,
      correspondenciaOrigenId: row.id,
      correlativoOrigen: row.correlativo,
      numeroOficio: row.oficio_numero,
      tipoDocumento: row.oficio_tipo || 'OFICIO',
      destinatarioInstitucion: row.oficio_destinatario_inst || 'Gerencia General de Distribución (GGD)',
      destinatarioNombre: row.oficio_destinatario_nombre || 'Ing. Adrián Correa',
      destinatarioCargo: row.oficio_destinatario_cargo || 'Gerente General de Distribución',
      asunto: row.oficio_asunto || row.asunto,
      referenciaAntecedente: row.oficio_referencia,
      cuerpoTexto: row.oficio_cuerpo || '',
      conclusionesTecnicas: row.oficio_conclusiones,
      firmanteNombre: row.oficio_firmante || 'Ing. Carlos Reyes',
      firmanteCargo: row.oficio_firmante_cargo || 'Gerente General de Gestión de Planificación (GGPD)',
      redactadoPor: row.oficio_redactado_por || 'Ing. Josué Pacheco',
      estadoFirma: (row.oficio_estado_firma as EstadoFirma) || 'PENDIENTE_FIRMA',
      fechaCreacion: row.oficio_fecha_creacion || row.fecha_recepcion,
      fechaFirma: row.oficio_fecha_firma,
      fechaDespacho: row.oficio_fecha_despacho,
      nroGuiaAcuse: row.oficio_nro_guia,
      receptorAcuseNombre: row.oficio_receptor_acuse,
      copias: row.oficio_copias,
      anexos: row.oficio_anexos
    };
  }

  return {
    id: row.id,
    correlativo: row.correlativo,
    direccion: row.direccion,
    proposito: (row.proposito as PropositoDocumento) || 'EVALUACION_TECNICA',
    instruidoPor: row.instruido_por || undefined,
    tipoDocumento: row.tipo_documento,
    numeroDocumentoOrigen: row.numero_documento_origen,
    remitenteInstitucion: row.remitente_institucion,
    remitenteNombre: row.remitente_nombre,
    remitenteCargo: row.remitente_cargo,
    destinatarioPrincipal: row.destinatario_principal,
    destinatariosCopia: row.destinatarios_copia,
    asunto: row.asunto,
    descripcionSintesis: row.descripcion_sintesis,
    nivelConfidencialidad: row.nivel_confidencialidad,
    prioridad: row.prioridad,
    fechaEmisionOrigen: row.fecha_emision_origen,
    fechaRecepcion: row.fecha_recepcion,
    fechaLimiteRespuesta: row.fecha_limite_respuesta || undefined,
    estadoTramite: row.estado_tramite,
    medioEntrega: row.medio_entrega,
    requiereRespuesta: Boolean(row.requiere_respuesta),
    oficioRespuestaDetalle,
    tareaScmtpId: row.tarea_scmtp_id,
    tareaScmtpTitulo: row.tarea_scmtp_titulo,
    responsableAsignado: row.responsable_asignado,
    responsableCargo: row.responsable_cargo,
    pdfDriveUrl: row.pdf_drive_url,
    pdfDriveId: row.pdf_drive_id,
    pdfFileName: row.pdf_file_name,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

// Consulta en vivo a la Base de Datos PostgreSQL
export async function fetchLiveCorrespondencias(): Promise<{ success: boolean; data?: CorrespondenciaRecord[]; error?: string; latencyMs: number }> {
  const startTime = performance.now();
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 6000);

    const res = await fetch(`${INSFORGE_URL}/api/database/records/v_scgcc_correspondencias_activas?limit=100`, {
      method: 'GET',
      headers: getHeaders(),
      signal: controller.signal
    });

    clearTimeout(timer);
    const latencyMs = Math.round(performance.now() - startTime);

    if (res.ok) {
      const rows = await res.json();
      const records = rows.map(mapRowToCorrespondencia);
      return { success: true, data: records, latencyMs };
    }

    return { success: false, error: `HTTP ${res.status}: ${res.statusText}`, latencyMs };
  } catch (err: any) {
    const latencyMs = Math.round(performance.now() - startTime);
    return { success: false, error: err.message || 'Error de red con InsForge BaaS', latencyMs };
  }
}
