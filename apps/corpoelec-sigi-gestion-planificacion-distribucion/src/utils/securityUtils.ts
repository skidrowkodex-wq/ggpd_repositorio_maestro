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
  eventType: 'SSO_TOKEN_ISSUED' | 'PERMISSION_GRANTED' | 'PERMISSION_REVOKED' | 'USER_CREATED' | 'LOGIN_ATTEMPT';
  userId: string;
  username: string;
  targetApp?: string;
  details: string;
  stateCode: string;
  timestamp: string;
}

export function logSecurityAuditEvent(event: SecurityAuditEvent): SecurityAuditEvent {
  const auditEntry: SecurityAuditEvent = {
    ...event,
    timestamp: new Date().toISOString(),
  };

  const isDev = (import.meta as any).env?.DEV ?? true;
  if (isDev) {
    console.info('[ISO 27001 Audit Log]', JSON.stringify(auditEntry, null, 2));
  }

  return auditEntry;
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
