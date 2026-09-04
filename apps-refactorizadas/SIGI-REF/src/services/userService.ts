import { insforge, insforgeUrl, insforgeAnonKey } from './insforgeClient';
import { InstitutionalUser, UserSystemRole, AppAccessPermissions } from '../types/userManagement';
import { StateCode } from '../types/sigi';

export interface InsForgeUserRecord {
  id: string;
  username: string;
  full_name: string;
  email: string;
  google_email?: string | null;
  password_hash?: string;
  role_code: UserSystemRole;
  estado_codigo?: StateCode | null;
  nombre_estado?: string | null;
  codigo_region?: string | null;
  unidad_organizativa?: string | null;
  cargo?: string | null;
  status: 'ACTIVO' | 'SUSPENDIDO' | 'EN_REVISION';
  permiso_sigi: boolean;
  permiso_sctis: boolean;
  permiso_scein: boolean;
  permiso_scppe: boolean;
  permiso_scmtp: boolean;
  permiso_scgcc: boolean;
  permiso_gdrive: boolean;
  ultimo_acceso?: string | null;
  fecha_creacion?: string;
  ultima_actualizacion?: string;
}

/**
 * Mapea un registro de InsForge al tipo de dominio InstitutionalUser
 */
function mapInsForgeToInstitutionalUser(record: InsForgeUserRecord): InstitutionalUser {
  return {
    id: record.id,
    username: record.username,
    fullName: record.full_name,
    email: record.email,
    googleEmail: record.google_email || undefined,
    role: record.role_code,
    stateCode: (record.estado_codigo as StateCode) || 'NAC',
    unit: record.unidad_organizativa || record.cargo || 'CORPOELEC',
    status: record.status || 'ACTIVO',
    permissions: {
      sctis: Boolean(record.permiso_sctis),
      tareasMinutas: Boolean(record.permiso_scmtp),
      planificacion: Boolean(record.permiso_scppe),
      scein: Boolean(record.permiso_scein),
      scgcc: Boolean(record.permiso_scgcc),
      gdriveRepo: Boolean(record.permiso_gdrive),
    },
    lastLogin: record.ultimo_acceso || undefined,
  };
}

/**
 * Obtiene todos los usuarios desde la vista semántica public.v_usuarios_sistema en InsForge
 */
export async function fetchUsersFromInsForge(): Promise<InstitutionalUser[]> {
  try {
    const { data, error } = await insforge.database
      .from('v_usuarios_sistema')
      .select('*')
      .order('role_code', { ascending: true })
      .order('username', { ascending: true });

    if (error) {
      console.warn('⚠️ Error al consultar InsForge v_usuarios_sistema, reintentando con fallback:', error);
      return [];
    }

    if (data && Array.isArray(data)) {
      return (data as unknown as InsForgeUserRecord[]).map(mapInsForgeToInstitutionalUser);
    }
    return [];
  } catch (err) {
    console.error('❌ Error de conexión con InsForge en fetchUsersFromInsForge:', err);
    return [];
  }
}

/**
 * Autentica un usuario contra la tabla maestra InsForge mediante la RPC
 * public.verificar_credencial_sistema (verificación por hash bcrypt + permiso de app).
 */
export async function authenticateWithInsForge(
  identifier: string,
  rawPassword: string
): Promise<{ success: boolean; user?: InstitutionalUser; error?: string }> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 8000);

    const res = await fetch(`${insforgeUrl}/api/database/rpc/verificar_credencial_sistema`, {
      method: 'POST',
      headers: {
        'apikey': insforgeAnonKey,
        'Authorization': `Bearer ${insforgeAnonKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        p_identifier: identifier.trim(),
        p_password: rawPassword,
        p_app: 'SIGI',
      }),
      signal: controller.signal,
    });

    clearTimeout(timer);

    if (!res.ok) {
      return { success: false, error: `Error HTTP ${res.status} al verificar credenciales.` };
    }

    const data = await res.json();

    if (!data || data.success !== true || !data.user) {
      return { success: false, error: data?.error || 'Credenciales inválidas o sin permisos en SIGI.' };
    }

    const record: Partial<InsForgeUserRecord> = data.user;
    const user: InstitutionalUser = {
      id: record.id || '',
      username: record.username || '',
      fullName: record.full_name || '',
      email: record.email || '',
      googleEmail: record.google_email || undefined,
      role: (record.role_code as UserSystemRole) || 'OPERADOR',
      stateCode: (record.estado_codigo as StateCode) || 'NAC',
      unit: record.unidad_organizativa || record.cargo || 'CORPOELEC',
      status: (record.status as InstitutionalUser['status']) || 'ACTIVO',
      permissions: {
        sctis: Boolean(record.permiso_sctis),
        tareasMinutas: Boolean(record.permiso_scmtp),
        planificacion: Boolean(record.permiso_scppe),
        scein: Boolean(record.permiso_scein),
        scgcc: Boolean(record.permiso_scgcc),
        gdriveRepo: Boolean(record.permiso_gdrive),
      },
      lastLogin: record.ultimo_acceso || undefined,
    };

    return { success: true, user };
  } catch (err: any) {
    console.error('❌ Error en authenticateWithInsForge:', err);
    return { success: false, error: err.message || 'Error de comunicación con InsForge.' };
  }
}

/**
 * Hashea una contraseña en el servidor usando la RPC public.hash_contrasena (bcrypt/pgcrypto),
 * evitando guardar la clave en texto plano en core.mae_usuarios_sistema.
 */
async function hashPasswordInServer(password: string): Promise<string | null> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 8000);

    const res = await fetch(`${insforgeUrl}/api/database/rpc/hash_contrasena`, {
      method: 'POST',
      headers: {
        'apikey': insforgeAnonKey,
        'Authorization': `Bearer ${insforgeAnonKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ p_password: password }),
      signal: controller.signal,
    });

    clearTimeout(timer);

    if (!res.ok) return null;
    const data = await res.json();
    return data?.password_hash || null;
  } catch (err) {
    console.error('❌ Error al hashear contraseña con RPC hash_contrasena:', err);
    return null;
  }
}

/**
 * Guarda o actualiza un usuario en InsForge (core.mae_usuarios_sistema)
 */
export async function saveUserToInsForge(
  user: Partial<InstitutionalUser>,
  password?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const payload: any = {
      username: user.username?.trim().toLowerCase(),
      full_name: user.fullName?.trim(),
      email: user.email?.trim().toLowerCase(),
      google_email: user.googleEmail?.trim().toLowerCase() || null,
      role_code: user.role,
      estado_codigo: user.stateCode === 'NAC' ? null : user.stateCode,
      unidad_organizativa: user.unit?.trim(),
      status: user.status || 'ACTIVO',
      permiso_sigi: true,
      permiso_sctis: Boolean(user.permissions?.sctis),
      permiso_scein: Boolean(user.permissions?.scein),
      permiso_scppe: Boolean(user.permissions?.planificacion),
      permiso_scmtp: Boolean(user.permissions?.tareasMinutas),
      permiso_scgcc: Boolean(user.permissions?.scgcc),
      permiso_gdrive: Boolean(user.permissions?.gdriveRepo),
      ultima_actualizacion: new Date().toISOString(),
    };

    if (password) {
      const hashed = await hashPasswordInServer(password);
      if (hashed) {
        payload.password_hash = hashed;
      }
    }

    let error;
    if (user.id && !user.id.startsWith('usr-')) {
      const res = await insforge.database
        .from('mae_usuarios_sistema')
        .update(payload)
        .eq('id', user.id);
      error = res.error;
    } else {
      if (!payload.password_hash) {
        const defaultHashed = await hashPasswordInServer('Corpoelec2026!.');
        payload.password_hash = defaultHashed || 'Corpoelec2026!.';
      }
      const res = await insforge.database
        .from('mae_usuarios_sistema')
        .insert([payload]);
      error = res.error;
    }

    if (error) {
      console.error('❌ Error al guardar en InsForge mae_usuarios_sistema:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    console.error('❌ Excepción en saveUserToInsForge:', err);
    return { success: false, error: err.message || 'Error al persistir usuario en InsForge.' };
  }
}

/**
 * Modifica el estado de un usuario (ACTIVO / SUSPENDIDO) - Kill switch
 */
export async function toggleUserStatusInInsForge(
  userId: string,
  status: 'ACTIVO' | 'SUSPENDIDO'
): Promise<boolean> {
  try {
    const { error } = await insforge.database
      .from('mae_usuarios_sistema')
      .update({ status, ultima_actualizacion: new Date().toISOString() })
      .eq('id', userId);

    return !error;
  } catch {
    return false;
  }
}

/**
 * Actualiza la matriz de permisos de un usuario en InsForge
 */
export async function updateUserPermissionsInInsForge(
  userId: string,
  permissions: AppAccessPermissions
): Promise<boolean> {
  try {
    const { error } = await insforge.database
      .from('mae_usuarios_sistema')
      .update({
        permiso_sctis: Boolean(permissions.sctis),
        permiso_scein: Boolean(permissions.scein),
        permiso_scppe: Boolean(permissions.planificacion),
        permiso_scmtp: Boolean(permissions.tareasMinutas),
        permiso_scgcc: Boolean(permissions.scgcc),
        permiso_gdrive: Boolean(permissions.gdriveRepo),
        ultima_actualizacion: new Date().toISOString(),
      })
      .eq('id', userId);

    return !error;
  } catch {
    return false;
  }
}
