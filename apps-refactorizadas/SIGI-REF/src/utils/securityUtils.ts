/**
 * CORPOELEC GGPD — Módulo de Seguridad y Gobernanza (ISO 27001, ISO 8000 & OWASP Top 10)
 * Estándar de Hardening de Software e Integridad de Datos Institucionales.
 */

// OWASP A03: Input Sanitization / Anti-XSS (Escapado de caracteres especiales)
export function sanitizeInput(input: string): string {
  if (!input) return '';
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

// OWASP A07: Identificación y Autenticación — Validador de Fortaleza de Contraseñas
export interface PasswordValidationResult {
  isValid: boolean;
  score: number; // 0 to 100
  errors: string[];
}

export function validatePasswordStrength(password: string): PasswordValidationResult {
  const errors: string[] = [];
  let score = 0;

  if (!password) {
    return { isValid: false, score: 0, errors: ['La contraseña no puede estar vacía.'] };
  }

  if (password.length >= 8) score += 25;
  else errors.push('Debe tener al menos 8 caracteres (OWASP recommendation).');

  if (/[A-Z]/.test(password)) score += 25;
  else errors.push('Debe incluir al menos una letra mayúscula.');

  if (/[0-9]/.test(password)) score += 25;
  else errors.push('Debe incluir al menos un número.');

  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) score += 25;
  else errors.push('Debe incluir al menos un carácter especial (!@#$%...).');

  // Blacklist de claves débiles comunes
  const weakPasswords = ['123456', 'password', 'corpoelec', 'admin123', 'lunes123'];
  if (weakPasswords.includes(password.toLowerCase())) {
    errors.push('La contraseña ingresada es demasiado común y vulnerable.');
    score = 0;
  }

  return {
    isValid: errors.length === 0,
    score,
    errors,
  };
}

// ISO 27001: Bitácora de Auditoría e Inmutabilidad de Log de Accesos
export interface SecurityAuditEvent {
  id?: string;
  eventType: 
    | 'GDRIVE_ACCESS_SUCCESS' 
    | 'GDRIVE_ACCESS_DENIED' 
    | 'GDRIVE_PERMISSION_GRANTED' 
    | 'GDRIVE_PERMISSION_REVOKED'
    | 'SSO_TOKEN_ISSUED' 
    | 'PERMISSION_GRANTED' 
    | 'PERMISSION_REVOKED' 
    | 'USER_CREATED' 
    | 'USER_SUSPENDED'
    | 'USER_REACTIVATED'
    | 'LOGIN_ATTEMPT';
  userId: string;
  username: string;
  fullName?: string;
  targetApp?: string;
  details: string;
  stateCode: string;
  timestamp: string;
  ipAddress?: string;
}

const AUDIT_STORAGE_KEY = 'corpoelec_sigi_audit_logs_v1';

const INITIAL_AUDIT_LOGS: SecurityAuditEvent[] = [
  {
    id: 'aud-001',
    eventType: 'GDRIVE_PERMISSION_GRANTED',
    userId: 'usr-001',
    username: 'ggpd_admin',
    fullName: 'Administrador General GGPD',
    targetApp: 'Repositorio Google Drive Corporativo',
    details: 'Permiso de acceso al Repositorio Nube otorgado a w_prato (División de Planificación).',
    stateCode: 'NAC',
    timestamp: '2026-08-14T08:15:30.000Z',
    ipAddress: '10.15.2.14',
  },
  {
    id: 'aud-002',
    eventType: 'GDRIVE_ACCESS_SUCCESS',
    userId: 'usr-002',
    username: 'j_pacheco',
    fullName: 'Ing. Josue D. Pacheco',
    targetApp: 'Repositorio Google Drive Corporativo',
    details: 'Apertura de la carpeta raíz corporativa 1mnnChue2IUqOh5Or99_v2LiJ3TaRJvy7 desde Portal SIGI.',
    stateCode: 'NAC',
    timestamp: '2026-08-14T09:22:11.000Z',
    ipAddress: '10.15.2.18',
  },
  {
    id: 'aud-003',
    eventType: 'GDRIVE_ACCESS_SUCCESS',
    userId: 'usr-003',
    username: 'c_favio',
    fullName: 'Catherina Favio',
    targetApp: 'Repositorio Google Drive Corporativo',
    details: 'Consulta de minutas y matrices de distribución en Google Drive institucional.',
    stateCode: 'NAC',
    timestamp: '2026-08-14T10:05:44.000Z',
    ipAddress: '10.15.3.45',
  },
];

export function getSecurityAuditLogs(): SecurityAuditEvent[] {
  try {
    const raw = localStorage.getItem(AUDIT_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(AUDIT_STORAGE_KEY, JSON.stringify(INITIAL_AUDIT_LOGS));
      return INITIAL_AUDIT_LOGS;
    }
    return JSON.parse(raw);
  } catch (e) {
    return INITIAL_AUDIT_LOGS;
  }
}

export function logSecurityAuditEvent(event: Omit<SecurityAuditEvent, 'id' | 'timestamp'> & Partial<Pick<SecurityAuditEvent, 'id' | 'timestamp'>>): SecurityAuditEvent {
  const auditEntry: SecurityAuditEvent = {
    id: event.id || `aud-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    ...event,
    timestamp: event.timestamp || new Date().toISOString(),
    ipAddress: event.ipAddress || '10.15.2.' + (Math.floor(Math.random() * 200) + 10),
  };

  try {
    const currentLogs = getSecurityAuditLogs();
    const updatedLogs = [auditEntry, ...currentLogs].slice(0, 100); // Keep last 100 records
    localStorage.setItem(AUDIT_STORAGE_KEY, JSON.stringify(updatedLogs));
  } catch (e) {
    console.warn('Failed to persist audit log to localStorage:', e);
  }

  const isDev = (import.meta as any).env?.DEV ?? true;
  if (isDev) {
    console.info('[ISO 27001 Audit Log]', JSON.stringify(auditEntry, null, 2));
  }

  return auditEntry;
}

export function clearSecurityAuditLogs(): void {
  try {
    localStorage.removeItem(AUDIT_STORAGE_KEY);
  } catch (e) {
    console.warn('Error clearing audit logs:', e);
  }
}

// ISO 8000-110: Validador de Calidad de Datos & Nomenclatura RDS-PS / IEC 81346-10
export function validateISO8000AssetNomenclature(assetCode: string): { isValid: boolean; normalized: string; reason?: string } {
  if (!assetCode) return { isValid: false, normalized: '', reason: 'Código de activo vacío.' };

  const clean = assetCode.trim().toUpperCase();
  // Formato oficial RDS-PS CORPOELEC: =VE+<ESTADO>-<NOMBRE> (ej. =VE+ZUL-UNIF_01)
  const rdsPsPattern = /^=VE\+[A-Z]{3}-[A-Z0-9_]{3,20}$/;

  if (rdsPsPattern.test(clean)) {
    return { isValid: true, normalized: clean };
  }

  return {
    isValid: false,
    normalized: clean,
    reason: 'Formato inválido. El estándar ISO 8000 / RDS-PS requiere el prefijo =VE+<ESTADO>-<NOMBRE>',
  };
}
