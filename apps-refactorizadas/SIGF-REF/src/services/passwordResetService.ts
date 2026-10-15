import { auditService } from './auditService';
import { authService } from './authService';

export interface PasswordResetRequest {
  id: string;
  email: string;
  estado: string;
  solicitanteNombre: string;
  solicitanteCedula: string;
  motivo: string;
  fechaSolicitud: string;
  status: 'PENDIENTE' | 'APROBADO' | 'RECHAZADO';
  nuevaClaveTemporal?: string;
  atendidoPor?: string;
  fechaAtencion?: string;
  observaciones?: string;
}

const STORAGE_KEY_RESETS = 'corpoelec_password_reset_requests_v1';

export const passwordResetService = {
  getRequests(): PasswordResetRequest[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY_RESETS);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.error('Error al leer solicitudes de reinicio:', e);
    }
    // Semilla inicial demostrativa para pruebas institucionales
    return [
      {
        id: 'rst-1001',
        email: 'car.corpoelec@corpoelec.gob.ve',
        estado: 'Carabobo',
        solicitanteNombre: 'Ing. Carlos Mendoza',
        solicitanteCedula: 'V-15.820.314',
        motivo: 'Olvido de clave tras rotación de personal en Centro de Servicio Guacara',
        fechaSolicitud: new Date(Date.now() - 3600000 * 3).toLocaleString(),
        status: 'PENDIENTE'
      }
    ];
  },

  saveRequests(requests: PasswordResetRequest[]) {
    try {
      localStorage.setItem(STORAGE_KEY_RESETS, JSON.stringify(requests));
    } catch (e) {
      console.error('Error al guardar solicitudes de reinicio:', e);
    }
  },

  getPendingCount(): number {
    return this.getRequests().filter(r => r.status === 'PENDIENTE').length;
  },

  createRequest(params: {
    email: string;
    estado: string;
    solicitanteNombre: string;
    solicitanteCedula: string;
    motivo: string;
  }): PasswordResetRequest {
    const list = this.getRequests();
    const newReq: PasswordResetRequest = {
      id: `rst-${Date.now().toString().slice(-6)}`,
      email: params.email.trim().toLowerCase(),
      estado: params.estado,
      solicitanteNombre: params.solicitanteNombre.trim(),
      solicitanteCedula: params.solicitanteCedula.trim(),
      motivo: params.motivo.trim(),
      fechaSolicitud: new Date().toLocaleString(),
      status: 'PENDIENTE'
    };

    const updated = [newReq, ...list];
    this.saveRequests(updated);

    auditService.logAction(
      params.email,
      'CAMBIO_CLAVE',
      `Solicitud de reinicio de clave registrada para Estado ${params.estado} por ${params.solicitanteNombre} (${params.solicitanteCedula})`
    );

    return newReq;
  },

  approveRequest(
    requestId: string,
    adminEmail: string,
    customTempPassword?: string
  ): { success: boolean; tempPassword: string; message: string } {
    const list = this.getRequests();
    const idx = list.findIndex(r => r.id === requestId);
    if (idx === -1) {
      return { success: false, tempPassword: '', message: 'Solicitud no encontrada.' };
    }

    const req = list[idx];
    // Generar una clave temporal segura de 8 caracteres alfanumérica SEN
    const cleanState = req.estado.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '');
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const tempPassword = customTempPassword?.trim() || `${cleanState}${randomSuffix}*`;

    // Aplicar la clave directamente al almacén de authService
    const stored = authService.getStoredPasswords();
    stored[req.email.toLowerCase()] = tempPassword;
    authService.saveStoredPasswords(stored);

    // Actualizar solicitud
    list[idx] = {
      ...req,
      status: 'APROBADO',
      nuevaClaveTemporal: tempPassword,
      atendidoPor: adminEmail,
      fechaAtencion: new Date().toLocaleString()
    };
    this.saveRequests(list);

    auditService.logAction(
      adminEmail,
      'CAMBIO_CLAVE',
      `Aprobación de reinicio de clave para Estado ${req.estado} (${req.email}). Clave temporal asignada.`
    );

    return {
      success: true,
      tempPassword,
      message: `Solicitud aprobada. La nueva clave temporal asignada es: "${tempPassword}"`
    };
  },

  rejectRequest(
    requestId: string,
    adminEmail: string,
    reason: string
  ): { success: boolean; message: string } {
    const list = this.getRequests();
    const idx = list.findIndex(r => r.id === requestId);
    if (idx === -1) {
      return { success: false, message: 'Solicitud no encontrada.' };
    }

    const req = list[idx];
    list[idx] = {
      ...req,
      status: 'RECHAZADO',
      observaciones: reason.trim() || 'No cumple con los requisitos de verificación institucional.',
      atendidoPor: adminEmail,
      fechaAtencion: new Date().toLocaleString()
    };
    this.saveRequests(list);

    auditService.logAction(
      adminEmail,
      'CAMBIO_CLAVE',
      `Rechazo de solicitud de reinicio de clave para Estado ${req.estado} (${req.email}). Motivo: ${reason}`
    );

    return {
      success: true,
      message: `Solicitud de reinicio rechazada correctamente.`
    };
  }
};
