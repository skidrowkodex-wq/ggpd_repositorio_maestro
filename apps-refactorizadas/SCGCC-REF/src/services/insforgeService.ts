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

// Verificar duplicado por número de documento origen (ISO 8000-110)
export async function checkDuplicateCorrespondencia(numeroDocumentoOrigen: string): Promise<{ exists: boolean; existingId?: string; existingCorrelativo?: string }> {
  try {
    const res = await fetch(
      `${INSFORGE_URL}/api/database/records/mae_correspondencias?numero_documento_origen=eq.${encodeURIComponent(numeroDocumentoOrigen)}&select=id,correlativo`,
      { method: 'GET', headers: getHeaders(false) }
    );
    if (res.ok) {
      const rows = await res.json();
      if (rows && rows.length > 0) {
        return { exists: true, existingId: rows[0].id, existingCorrelativo: rows[0].correlativo };
      }
    }
    return { exists: false };
  } catch {
    return { exists: false };
  }
}

// Persistir Nueva Correspondencia en InsForge PostgreSQL
export async function saveCorrespondenciaToDatabase(record: CorrespondenciaRecord): Promise<{ success: boolean; error?: string; conflict?: boolean }> {
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
      // Conflicto de UNIQUE (p. ej. correlativo duplicado). Si el conflicto es por
      // el id del registro (re-guardado idempotente), el PATCH lo resuelve; si el
      // PATCH no afecta ninguna fila, el conflicto es de correlativo y el llamador
      // debe reintentar con el siguiente correlativo disponible.
      const patchRes = await fetch(`${INSFORGE_URL}/api/database/records/mae_correspondencias?id=eq.${encodeURIComponent(record.id)}`, {
        method: 'PATCH',
        headers: getHeaders(true),
        body: JSON.stringify(payload[0])
      });
      if (patchRes.ok) {
        const patched = await patchRes.json().catch(() => []);
        if (Array.isArray(patched) && patched.length > 0) {
          return { success: true };
        }
      }
      return { success: false, conflict: true, error: 'Conflicto de correlativo único (HTTP 409 no resuelto)' };
    }

    const errBody = await res.text().catch(() => '');
    return { success: false, error: `HTTP ${res.status}: ${errBody.slice(0, 200)}` };
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

// ============================================================================
// SUBIDA DE ARCHIVOS A GOOGLE DRIVE VIA GOOGLE APPS SCRIPT (Web App)
// ============================================================================

const GAS_WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbyzIB8dLPwnObVD86Yhun4-NQJF-JcMLhjFG9VLeP0lz4VJ4m9bR5S2Z1aAHSE7lciF/exec';

export interface DriveUploadResult {
  success: boolean;
  fileID?: string;
  viewURL?: string;
  folderName?: string;
  error?: string;
}

// Busca un archivo ya subido en la bóveda SCGCC por su nombre final.
// Requiere GAS >= v3.3.0 (acción FIND_FILE). En GAS antiguo devuelve supported=false.
async function findFileInScgccVault(finalName: string): Promise<{ supported: boolean; found: boolean; fileID?: string; viewURL?: string; folderName?: string }> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 12000);
    const res = await fetch(`${GAS_WEB_APP_URL}?action=FIND_FILE&fileName=${encodeURIComponent(finalName)}`, {
      redirect: 'follow',
      signal: controller.signal
    });
    clearTimeout(timer);
    const j = await res.json();
    if (j.status === 'FOUND') {
      return { supported: true, found: true, fileID: j.fileID, viewURL: j.viewURL, folderName: j.folderName };
    }
    if (j.status === 'NOT_FOUND') {
      return { supported: true, found: false };
    }
    // GAS v3.2.0 o anterior: no soporta FIND_FILE (responde STATUS ONLINE)
    return { supported: false, found: false };
  } catch {
    return { supported: false, found: false };
  }
}

export async function uploadFileToDrive(
  file: File,
  metadata: {
    correlativo: string;
    tipoDocumento: string;
    remitenteInstitucion: string;
    remitenteNombre: string;
    direccion: string;
    fechaRecepcion: string;
  }
): Promise<DriveUploadResult> {
  // Nombre final idéntico al que aplica el GAS en Drive (para verificación FIND_FILE)
  const finalName = metadata.correlativo ? `${metadata.correlativo} - ${file.name}` : file.name;

  try {
    // Leer archivo como Base64
    const base64 = await fileToBase64(file);

    const payload = {
      action: 'UPLOAD_FILE',
      fileName: file.name,
      fileBase64: base64,
      mimeType: file.type || 'application/pdf',
      correlativo: metadata.correlativo,
      tipoDocumento: metadata.tipoDocumento,
      remitenteInstitucion: metadata.remitenteInstitucion,
      remitenteNombre: metadata.remitenteNombre,
      direccion: metadata.direccion,
      fechaRecepcion: metadata.fechaRecepcion
    };

    // Máximo 2 intentos de POST. El GAS v3.3.0 es idempotente por nombre final,
    // por lo que un reintento nunca genera duplicados en la bóveda.
    for (let attempt = 1; attempt <= 2; attempt++) {
      let result: any = null;
      try {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 30000);

        const res = await fetch(GAS_WEB_APP_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify(payload),
          redirect: 'follow',
          signal: controller.signal
        });

        clearTimeout(timer);

        if (!res.ok) {
          if (attempt === 2) return { success: false, error: `HTTP ${res.status}: ${res.statusText}` };
          continue;
        }

        result = await res.json();
      } catch (networkErr: any) {
        // Fallo de red/timeout: verificar si el archivo igualmente quedó subido
        const check = await findFileInScgccVault(finalName);
        if (check.supported && check.found) {
          return { success: true, fileID: check.fileID, viewURL: check.viewURL, folderName: check.folderName };
        }
        if (attempt === 2 || !check.supported) {
          return { success: false, error: networkErr?.message || 'Error de red al subir a Drive' };
        }
        continue; // GAS idempotente disponible y archivo NO encontrado: reintento seguro
      }

      if (result.status === 'SUCCESS') {
        return {
          success: true,
          fileID: result.fileID,
          viewURL: result.viewURL,
          folderName: result.folderName
        };
      }

      // Cadena de redirección degradada de Google (echo 302 → /exec): el cliente
      // recibió la respuesta STATUS del doGet en lugar del resultado del doPost.
      // El doPost pudo haberse ejecutado: verificar ANTES de reintentar.
      if (result.status === 'ONLINE') {
        const check = await findFileInScgccVault(finalName);
        if (check.supported && check.found) {
          return { success: true, fileID: check.fileID, viewURL: check.viewURL, folderName: check.folderName };
        }
        if (check.supported && !check.found) {
          continue; // Confirmado que NO subió (GAS idempotente): reintento seguro
        }
        // GAS antiguo sin FIND_FILE: no se puede confirmar ni reintentar sin
        // riesgo de duplicado. Se reporta con honestidad operativa.
        return {
          success: false,
          error: 'UPLOAD_NO_CONFIRMADO: Google degradó la respuesta y el webhook actual no permite verificar la subida. El archivo pudo haber llegado a Drive; verifique la carpeta de la bóveda.'
        };
      }

      // Error funcional reportado por el GAS (no reintentar)
      return { success: false, error: result.message || 'Error desconocido del GAS' };
    }

    return { success: false, error: 'No se pudo confirmar la subida a Drive tras 2 intentos' };
  } catch (err: any) {
    return { success: false, error: err.message || 'Error de red al subir a Drive' };
  }
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Remover prefijo data:...;base64,
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
