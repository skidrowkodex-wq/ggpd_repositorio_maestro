import { DriveAccessRequest, GoogleDriveWebhookConfig, DriveRoleLevel } from '../types/userManagement';
import { logSecurityAuditEvent } from './securityUtils';

const STORAGE_KEY_REQUESTS = 'CORPOELEC_SIGI_DRIVE_REQUESTS_V1';
const STORAGE_KEY_CONFIG = 'CORPOELEC_SIGI_DRIVE_WEBHOOK_CFG_V1';

const DEFAULT_WEBHOOK_CONFIG: GoogleDriveWebhookConfig = {
  webhookUrl: 'https://script.google.com/macros/s/AKfycbxonVU31GBXuVCfu_5G8hmADkYFB7yriPJVt2nS9w7uMjsERu5_WPzpQSVbuB2kvtQkqA/exec',
  targetFolderId: '1mnnChue2IUqOh5Or99_v2LiJ3TaRJvy7',
  accountEmail: 'bk.ggpd.corpoelec@gmail.com',
  autoRevokeOnDeactivate: true,
};

const INITIAL_SAMPLE_REQUESTS: DriveAccessRequest[] = [
  {
    id: 'req-001',
    userId: 'usr-006',
    username: 'b_gonzalez',
    fullName: 'Blanca González',
    email: 'b.gonzalez@corpoelec.gob.ve',
    googleEmail: 'blanca.gonzalez.asistencia@gmail.com',
    role: 'ANALISTA',
    stateCode: 'NAC',
    requestDate: '2026-08-14T09:30:00.000Z',
    reason: 'Requerido para apoyo en compilación de minutas de gerencia y archivo digital.',
    requestedLevel: 'VIEWER',
    status: 'PENDIENTE',
  },
  {
    id: 'req-002',
    userId: 'usr-008',
    username: 'e_tachira',
    fullName: 'Analista Estatal Táchira',
    email: 'analista.tachira@corpoelec.gob.ve',
    googleEmail: 'distribucion.tachira.sala@gmail.com',
    role: 'ANALISTA',
    stateCode: 'TAC',
    requestDate: '2026-08-13T16:20:00.000Z',
    reason: 'Consulta de planos y cronogramas de mantenimiento en subestaciones región Los Andes.',
    requestedLevel: 'VIEWER',
    status: 'PENDIENTE',
  },
  {
    id: 'req-003',
    userId: 'usr-005',
    username: 'j_bencomo',
    fullName: 'Jaime Bencomo',
    email: 'j_bencomo@corpoelec.gob.ve',
    googleEmail: 'jaime.bencomo.carabobo@gmail.com',
    role: 'ESPECIALISTA',
    stateCode: 'CAR',
    requestDate: '2026-08-11T10:00:00.000Z',
    reason: 'Carga de reportes PRTSEN Carabobo.',
    requestedLevel: 'EDITOR',
    status: 'APROBADO',
    reviewedBy: 'Ing. Josue D. Pacheco (ADMINISTRADOR)',
    reviewedDate: '2026-08-11T10:15:00.000Z',
    reviewNotes: 'Autorizado con rol Editor para gestión de viáticos y PRTSEN.',
    ttlDays: 90,
    webhookDispatched: true,
  }
];

export const getWebhookConfig = (): GoogleDriveWebhookConfig => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CONFIG);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.webhookUrl && parsed.webhookUrl.trim().startsWith('http')) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error loading webhook config:', e);
  }
  return DEFAULT_WEBHOOK_CONFIG;
};

export const saveWebhookConfig = (config: GoogleDriveWebhookConfig): void => {
  try {
    localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(config));
  } catch (e) {
    console.error('Error saving webhook config:', e);
  }
};

export const getAccessRequests = (): DriveAccessRequest[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_REQUESTS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error('Error loading access requests:', e);
  }
  return INITIAL_SAMPLE_REQUESTS;
};

export const saveAccessRequests = (requests: DriveAccessRequest[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY_REQUESTS, JSON.stringify(requests));
  } catch (e) {
    console.error('Error saving access requests:', e);
  }
};

export const getPendingRequestsCount = (): number => {
  const list = getAccessRequests();
  return list.filter(r => r.status === 'PENDIENTE').length;
};

export const createDriveAccessRequest = (
  data: Omit<DriveAccessRequest, 'id' | 'requestDate' | 'status'>
): DriveAccessRequest => {
  const currentRequests = getAccessRequests();
  const newReq: DriveAccessRequest = {
    ...data,
    id: `req-${Date.now().toString().slice(-4)}`,
    requestDate: new Date().toISOString(),
    status: 'PENDIENTE',
  };

  const updated = [newReq, ...currentRequests];
  saveAccessRequests(updated);

  logSecurityAuditEvent({
    eventType: 'GDRIVE_ACCESS_DENIED',
    userId: data.userId,
    username: data.username,
    fullName: data.fullName,
    targetApp: 'Repositorio Google Drive Corporativo',
    details: `Solicitud de acceso formal creada por el usuario. Motivo: ${data.reason}`,
    stateCode: data.stateCode,
  });

  return newReq;
};

export const dispatchGoogleDriveWebhook = async (
  action: 'GRANT' | 'REVOKE',
  payload: {
    email: string;
    roleLevel?: DriveRoleLevel;
    adminName?: string;
    reason?: string;
  }
): Promise<{ success: boolean; message: string }> => {
  const config = getWebhookConfig();
  const targetUrl = (config.webhookUrl && config.webhookUrl.trim().startsWith('http'))
    ? config.webhookUrl.trim()
    : DEFAULT_WEBHOOK_CONFIG.webhookUrl;

  const params = new URLSearchParams({
    action,
    email: payload.email,
    roleLevel: payload.roleLevel || 'VIEWER',
    adminName: payload.adminName || 'Administrador SIGI',
    reason: payload.reason || 'Acceso formal autorizado por Gerencia GGPD',
    timestamp: new Date().toISOString(),
  });

  const fullUrl = `${targetUrl}${targetUrl.includes('?') ? '&' : '?'}${params.toString()}`;

  try {
    // 1. Fetch dispatch via GET (prevents browser 302 cross-origin redirect errors)
    await fetch(fullUrl, {
      method: 'GET',
      mode: 'no-cors',
      cache: 'no-cache',
    });
  } catch (err) {
    // 2. Beacon Fallback (immune to CORS restrictions in all browsers)
    try {
      const beacon = new Image();
      beacon.src = fullUrl;
    } catch (beaconErr) {
      console.warn('Beacon fallback dispatch error:', beaconErr);
    }
  }

  return {
    success: true,
    message: `Comando ${action} despachado exitosamente hacia Google Drive (${config.accountEmail}).`,
  };
};
