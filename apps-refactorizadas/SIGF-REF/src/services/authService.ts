import { VENEZUELA_STATES } from '../data/venezuelaRegions';
import { PREDEFINED_SYSTEM_USERS } from '../data/defaultUsers';
import { auditService } from './auditService';

const STORAGE_KEY_PASSWORDS = 'corpoelec_passwords_store_v1';

/**
 * Genera la clave institucional inicial por defecto para un usuario o estado.
 * Cada estado posee su propia clave inicial personalizada.
 */
export function getDefaultPasswordFor(email: string): string {
  const cleanEmail = (email || '').trim().toLowerCase();

  // Admin Central
  if (cleanEmail === 'bk.ggpd.corpoelec@gmail.com') {
    return 'Admin2026*';
  }
  // Dirección Nacional
  if (cleanEmail === 'nacional.corpoelec@corpoelec.gob.ve') {
    return 'Nacional2026*';
  }
  // Gerencia Ejecutiva
  if (cleanEmail === 'gerencia.ejecutiva@corpoelec.gob.ve') {
    return 'Gerente2026*';
  }

  // Buscar si es un usuario de estado
  const predefined = PREDEFINED_SYSTEM_USERS.find(u => u.email.toLowerCase() === cleanEmail);
  if (predefined && predefined.estadoAsignado) {
    const cleanState = predefined.estadoAsignado.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '');
    return `${cleanState}2026*`;
  }

  // Si el correo coincide con un código de estado (ej: car.corpoelec...)
  const stateMatch = VENEZUELA_STATES.find(s => cleanEmail.startsWith(s.codigo.toLowerCase()));
  if (stateMatch) {
    const cleanState = stateMatch.nombre.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '');
    return `${cleanState}2026*`;
  }

  return 'Corpoelec2026*';
}

export const authService = {
  /**
   * Obtiene el diccionario de contraseñas guardadas en LocalStorage
   */
  getStoredPasswords(): Record<string, string> {
    try {
      const data = localStorage.getItem(STORAGE_KEY_PASSWORDS);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.error('Error al leer almacén de contraseñas:', e);
    }
    return {};
  },

  /**
   * Guarda el diccionario de contraseñas
   */
  saveStoredPasswords(passwords: Record<string, string>) {
    try {
      localStorage.setItem(STORAGE_KEY_PASSWORDS, JSON.stringify(passwords));
    } catch (e) {
      console.error('Error al persistir contraseñas:', e);
    }
  },

  /**
   * Retorna la contraseña activa para un usuario dado. Si nunca se ha modificado,
   * asigna y persiste su clave inicial por defecto.
   */
  getPasswordForUser(email: string): string {
    const clean = (email || '').trim().toLowerCase();
    const stored = this.getStoredPasswords();
    if (stored[clean]) {
      return stored[clean];
    }

    const defaultPwd = getDefaultPasswordFor(clean);
    stored[clean] = defaultPwd;
    this.saveStoredPasswords(stored);
    return defaultPwd;
  },

  /**
   * Valida si la clave ingresada coincide exactamente con la clave activa del estado o usuario
   */
  validateCredentials(email: string, passwordInput: string): { success: boolean; message?: string } {
    const cleanEmail = (email || '').trim().toLowerCase();
    const input = (passwordInput || '').trim();

    if (!cleanEmail) {
      return { success: false, message: 'Debe ingresar el usuario o correo institucional.' };
    }
    if (!input) {
      return { success: false, message: 'Debe ingresar la clave asignada a esta entidad.' };
    }

    const actualPassword = this.getPasswordForUser(cleanEmail);

    // Verificación estricta: también acepta la clave genérica institucional sólo si la clave no ha sido cambiada
    const hasBeenCustomized = Boolean(this.getStoredPasswords()[cleanEmail]);
    const matchesCurrent = input === actualPassword;
    const matchesUniversalDefault = !hasBeenCustomized && input === 'Corpoelec2026*';

    if (matchesCurrent || matchesUniversalDefault) {
      return { success: true };
    }

    return { 
      success: false, 
      message: `Clave incorrecta para esta entidad. Verifique la contraseña o comuníquese con el Administrador para restablecerla.` 
    };
  },

  /**
   * Permite a un estado o usuario cambiar su clave institucional
   */
  changePassword(
    email: string, 
    currentPasswordInput: string, 
    newPasswordInput: string,
    confirmPasswordInput: string
  ): { success: boolean; message: string } {
    const cleanEmail = (email || '').trim().toLowerCase();
    const currentInput = (currentPasswordInput || '').trim();
    const newPwd = (newPasswordInput || '').trim();
    const confirmPwd = (confirmPasswordInput || '').trim();

    if (!cleanEmail) {
      return { success: false, message: 'Identificación de usuario inválida.' };
    }

    // 1. Validar clave actual
    const checkCurrent = this.validateCredentials(cleanEmail, currentInput);
    if (!checkCurrent.success) {
      return { success: false, message: 'La contraseña actual ingresada es incorrecta.' };
    }

    // 2. Validar que la nueva clave cumpla requisitos de seguridad SEN
    if (newPwd.length < 6) {
      return { success: false, message: 'La nueva contraseña debe tener un mínimo de 6 caracteres.' };
    }

    if (newPwd === currentInput) {
      return { success: false, message: 'La nueva contraseña debe ser distinta a la contraseña actual.' };
    }

    if (newPwd !== confirmPwd) {
      return { success: false, message: 'La confirmación de la contraseña no coincide con la nueva contraseña.' };
    }

    // 3. Persistir nueva clave
    const stored = this.getStoredPasswords();
    stored[cleanEmail] = newPwd;
    this.saveStoredPasswords(stored);

    // 4. Registro en auditoría
    auditService.logAction(
      cleanEmail, 
      'CAMBIO_CLAVE', 
      `Actualización exitosa de contraseña institucional para la cuenta ${cleanEmail}`
    );

    return { 
      success: true, 
      message: '¡Contraseña actualizada exitosamente! La nueva clave está en vigor inmediatamente.' 
    };
  },

  /**
   * Restablece la contraseña de un usuario o estado a su valor institucional inicial
   */
  resetPassword(email: string, adminUserEmail: string): { success: boolean; defaultPassword: string; message: string } {
    const cleanEmail = (email || '').trim().toLowerCase();
    const defaultPwd = getDefaultPasswordFor(cleanEmail);

    const stored = this.getStoredPasswords();
    stored[cleanEmail] = defaultPwd;
    this.saveStoredPasswords(stored);

    auditService.logAction(
      adminUserEmail,
      'CAMBIO_CLAVE',
      `Restablecimiento administrativo de clave para ${cleanEmail} por ${adminUserEmail}`
    );

    return {
      success: true,
      defaultPassword: defaultPwd,
      message: `Contraseña restablecida exitosamente al estándar inicial: "${defaultPwd}"`
    };
  }
};
