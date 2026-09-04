import { CorrespondenciaRecord, OficioRespuesta, EstadoFirma, PropositoDocumento } from '../types';

export const INSFORGE_URL = (import.meta as any).env?.VITE_INSFORGE_URL || 'https://wxkeqf37.ap-southeast.insforge.app';
export const INSFORGE_KEY = (import.meta as any).env?.VITE_INSFORGE_API_KEY || '';

export interface InsForgeLoginResult {
  success: boolean;
  error?: string;
  user?: {
    id: string;
    username: string;
    full_name: string;
    email: string;
    role_code: string;
    estado_codigo?: string | null;
    unidad_organizativa?: string | null;
    cargo?: string | null;
    status: string;
    permiso_scgcc: boolean;
  };
}

// Autenticación unificada contra la tabla maestra core.mae_usuarios_sistema
// vía la función RPC public.verificar_credencial_sistema (verificación por hash bcrypt)
export async function autenticarCredencialesInsForge(
  identifier: string,
  password: string,
  app: string = 'SCGCC'
): Promise<InsForgeLoginResult> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 8000);

    const res = await fetch(`${INSFORGE_URL}/api/database/rpc/verificar_credencial_sistema`, {
      method: 'POST',
      headers: {
        'apikey': INSFORGE_KEY,
        'Authorization': `Bearer ${INSFORGE_KEY}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        p_identifier: identifier.trim(),
        p_password: password,
        p_app: app,
      }),
      signal: controller.signal,
    });

    clearTimeout(timer);

    if (!res.ok) {
      return { success: false, error: `Error HTTP ${res.status} al verificar credenciales.` };
    }

    const data = await res.json();
    if (!data || data.success !== true) {
      return { success: false, error: data?.error || 'Credenciales inválidas o sin permisos en SCGCC.' };
    }

    return { success: true, user: data.user };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Error de red con el servidor de autenticación.' };
  }
}

const getHeaders = (isWrite = false) => ({
  'apikey': INSFORGE_KEY,
  'Authorization': `Bearer ${INSFORGE_KEY}`,
  'Content-Type': 'application/json',
  'Accept': 'application/json',
  'Accept-Profile': 'scgcc',
  'Content-Profile': 'scgcc',
  ...(isWrite ? { 'Prefer': 'return=representation' } : {})
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
      firmanteCargo: row.oficio_firmante_cargo || 'Gerente General de Distribución (GGD)',
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

    const res = await fetch(`${INSFORGE_URL}/api/database/records/v_scgcc_correspondencias_activas?limit=150`, {
      method: 'GET',
      headers: {
        'apikey': INSFORGE_KEY,
        'Authorization': `Bearer ${INSFORGE_KEY}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
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

// Persistir Nueva Correspondencia en InsForge PostgreSQL
export async function saveCorrespondenciaToDatabase(record: CorrespondenciaRecord): Promise<{ success: boolean; error?: string }> {
  try {
    const payload = [{
      id: record.id,
      correlativo: record.correlativo,
      direccion: record.direccion,
      proposito: record.proposito || 'EVALUACION_TECNICA',
      instruido_por: record.instruidoPor || null,
      tipo_documento: record.tipoDocumento,
      numero_documento_origen: record.numeroDocumentoOrigen,
      remitente_institucion: record.remitenteInstitucion,
      remitente_nombre: record.remitenteNombre || null,
      remitente_cargo: record.remitenteCargo || null,
      destinatario_principal: record.destinatarioPrincipal,
      destinatarios_copia: record.destinatariosCopia || null,
      asunto: record.asunto,
      descripcion_sintesis: record.descripcionSintesis || null,
      nivel_confidencialidad: record.nivelConfidencialidad,
      prioridad: record.prioridad,
      fecha_emision_origen: record.fechaEmisionOrigen,
      fecha_recepcion: record.fechaRecepcion,
      fecha_limite_respuesta: record.fechaLimiteRespuesta || null,
      estado_tramite: record.estadoTramite,
      medio_entrega: record.medioEntrega || null,
      observaciones: record.observaciones || null,
      requiere_respuesta: record.requiereRespuesta,
      oficio_respuesta_ref: record.oficioRespuestaRef || null,
      tarea_scmtp_id: record.tareaScmtpId || null,
      tarea_scmtp_titulo: record.tareaScmtpTitulo || null,
      responsable_asignado: record.responsableAsignado || null,
      responsable_cargo: record.responsableCargo || null,
      pdf_drive_url: record.pdfDriveUrl || null,
      pdf_drive_id: record.pdfDriveId || null,
      pdf_file_name: record.pdfFileName || null,
      updated_at: new Date().toISOString()
    }];

    const res = await fetch(`${INSFORGE_URL}/api/database/records/mae_correspondencias`, {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify(payload)
    });

    if (res.ok || res.status === 201) {
      return { success: true };
    }

    if (res.status === 409) {
      // Registro ya existente, aplicar PATCH
      const patchRes = await fetch(`${INSFORGE_URL}/api/database/records/mae_correspondencias?id=eq.${encodeURIComponent(record.id)}`, {
        method: 'PATCH',
        headers: getHeaders(true),
        body: JSON.stringify(payload[0])
      });
      return { success: patchRes.ok };
    }

    return { success: false, error: `HTTP ${res.status}` };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// Actualizar Estado o Tarea en InsForge PostgreSQL
export async function updateCorrespondenciaInDatabase(recordId: string, partial: Partial<any>): Promise<{ success: boolean; error?: string }> {
  try {
    const dbPayload: any = { updated_at: new Date().toISOString() };
    if (partial.estadoTramite !== undefined) dbPayload.estado_tramite = partial.estadoTramite;
    if (partial.tareaScmtpId !== undefined) dbPayload.tarea_scmtp_id = partial.tareaScmtpId;
    if (partial.tareaScmtpTitulo !== undefined) dbPayload.tarea_scmtp_titulo = partial.tareaScmtpTitulo;
    if (partial.responsableAsignado !== undefined) dbPayload.responsable_asignado = partial.responsableAsignado;
    if (partial.responsableCargo !== undefined) dbPayload.responsable_cargo = partial.responsableCargo;
    if (partial.fechaLimiteRespuesta !== undefined) dbPayload.fecha_limite_respuesta = partial.fechaLimiteRespuesta;

    const res = await fetch(`${INSFORGE_URL}/api/database/records/mae_correspondencias?id=eq.${encodeURIComponent(recordId)}`, {
      method: 'PATCH',
      headers: getHeaders(true),
      body: JSON.stringify(dbPayload)
    });

    return { success: res.ok };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// Guardar o Actualizar Oficio de Salida en InsForge PostgreSQL
export async function saveOficioToDatabase(oficio: OficioRespuesta): Promise<{ success: boolean; error?: string }> {
  try {
    const payload = [{
      id: oficio.id,
      correspondencia_origen_id: oficio.correspondenciaOrigenId,
      correlativo_origen: oficio.correlativoOrigen,
      numero_oficio: oficio.numeroOficio,
      tipo_documento: oficio.tipoDocumento || 'OFICIO',
      destinatario_institucion: oficio.destinatarioInstitucion,
      destinatario_nombre: oficio.destinatarioNombre,
      destinatario_cargo: oficio.destinatarioCargo,
      asunto: oficio.asunto,
      referencia_antecedente: oficio.referenciaAntecedente || null,
      cuerpo_texto: oficio.cuerpoTexto,
      conclusiones_tecnicas: oficio.conclusionesTecnicas || null,
      firmante_nombre: oficio.firmanteNombre,
      firmante_cargo: oficio.firmanteCargo,
      redactado_por: oficio.redactadoPor || null,
      estado_firma: oficio.estadoFirma,
      fecha_creacion: oficio.fechaCreacion || new Date().toISOString().split('T')[0],
      fecha_firma: oficio.fechaFirma || null,
      fecha_despacho: oficio.fechaDespacho || null,
      nro_guia_acuse: oficio.nroGuiaAcuse || null,
      receptor_acuse_nombre: oficio.receptorAcuseNombre || null,
      copias: oficio.copias || null,
      anexos: oficio.anexos || null,
      updated_at: new Date().toISOString()
    }];

    const res = await fetch(`${INSFORGE_URL}/api/database/records/mae_oficios_salida`, {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify(payload)
    });

    if (res.ok || res.status === 201) return { success: true };

    if (res.status === 409) {
      const patchRes = await fetch(`${INSFORGE_URL}/api/database/records/mae_oficios_salida?id=eq.${encodeURIComponent(oficio.id)}`, {
        method: 'PATCH',
        headers: getHeaders(true),
        body: JSON.stringify(payload[0])
      });
      return { success: patchRes.ok };
    }

    return { success: false, error: `HTTP ${res.status}` };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// Eliminar Correspondencia en InsForge PostgreSQL (borrado lógico opcional por RLS)
export async function deleteCorrespondenciaFromDatabase(recordId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch(`${INSFORGE_URL}/api/database/records/mae_correspondencias?id=eq.${encodeURIComponent(recordId)}`, {
      method: 'DELETE',
      headers: {
        'apikey': INSFORGE_KEY,
        'Authorization': `Bearer ${INSFORGE_KEY}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Accept-Profile': 'scgcc',
        'Content-Profile': 'scgcc',
        'Prefer': 'return=minimal'
      }
    });

    if (res.ok || res.status === 204) return { success: true };
    return { success: false, error: `HTTP ${res.status}: ${res.statusText}` };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
