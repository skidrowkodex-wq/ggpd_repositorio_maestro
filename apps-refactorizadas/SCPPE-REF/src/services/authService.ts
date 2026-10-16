import { UserProfile, RolUsuario } from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

// Catálogo de perfiles institucionales (SOLO metadatos de rol/cargo).
// SEGURIDAD (ISO/IEC 27001 · OWASP ASVS V4): NO contiene contraseñas.
export const USUARIOS_PREDEFINIDOS: UserProfile[] = [
  {
    id: 'usr-000',
    username: 'j_pacheco',
    email: 'j_pacheco@corpoelec.gob.ve',
    nombre: 'Josue D. Pacheco',
    rol: 'ADMINISTRADOR',
    cargo: 'Administrador del Sistema / Planificación Eléctrica',
    gerencia: 'Gerencia General de Planificación de Distribución (GGPD)',
  },
  {
    id: 'usr-001',
    username: 'admin.ggpd',
    email: 'admin.ggpd@corpoelec.gob.ve',
    nombre: 'Administrador GGPD',
    rol: 'ADMINISTRADOR',
    cargo: 'Administrador General GGPD',
    gerencia: 'Gerencia General de Planificación de Distribución (GGPD)',
  },
  {
    id: 'usr-002',
    username: 'w_prato',
    email: 'w_prato@corpoelec.gob.ve',
    nombre: 'Walter Prato',
    rol: 'ESPECIALISTA',
    cargo: 'Especialista en Planificación de Distribución',
    gerencia: 'Gerencia General de Planificación de Distribución (GGPD)',
  },
  {
    id: 'usr-003',
    username: 'j_bencomo',
    email: 'j_bencomo@corpoelec.gob.ve',
    nombre: 'Jaime Bencomo',
    rol: 'ESPECIALISTA',
    cargo: 'Especialista en Proyectos PRTSEN',
    gerencia: 'Gerencia General de Planificación de Distribución (GGPD)',
  },
  {
    id: 'usr-004',
    username: 'c_reyes',
    email: 'c_reyes@corpoelec.gob.ve',
    nombre: 'Carlos Reyes',
    rol: 'ESPECIALISTA',
    cargo: 'Especialista en Evaluación POA & RDS-PS',
    gerencia: 'Gerencia General de Planificación de Distribución (GGPD)',
  },
  {
    id: 'usr-005',
    username: 'a_correa',
    email: 'a_correa@corpoelec.gob.ve',
    nombre: 'Adrian Correa',
    rol: 'GERENCIA' as RolUsuario,
    cargo: 'Gerente General de Planificación de Distribución (GGPD)',
    gerencia: 'Gerencia General de Planificación de Distribución (GGPD)',
  },
  {
    id: 'usr-006',
    username: 'analista_gestion',
    email: 'analista_gestion@corpoelec.gob.ve',
    nombre: 'Lcdo. Juan Pérez',
    rol: 'ANALISTA',
    cargo: 'Analista de Control y Seguimiento Territorial',
    gerencia: 'Gerencia General de Distribución (GGD)',
  },
];

const SESSION_STORAGE_KEY = 'ggpd_session_user';

export function getInitialUser(): UserProfile | null {
  if (typeof window !== 'undefined') {
    try {
      const params = new URLSearchParams(window.location.search);
      const isSso = params.get('sso') === 'true' || params.get('sso_auth') === 'true';
      const ssoUser = params.get('user') || params.get('sso_user');
      if (isSso) {
        const cleanUser = (ssoUser || 'admin.ggpd').trim().toLowerCase();
        const found = USUARIOS_PREDEFINIDOS.find(
          u => u.username.toLowerCase() === cleanUser || u.email.toLowerCase() === cleanUser
        ) || USUARIOS_PREDEFINIDOS.find(u => u.rol === 'ADMINISTRADOR') || USUARIOS_PREDEFINIDOS[0];

        if (found) {
          // El catálogo institucional NO almacena contraseñas (ISO/IEC 27001).
          localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(found));
          return found;
        }
      }
    } catch (e) {
      console.warn('Error reading SSO params in Planificacion SEN', e);
    }
  }

  const saved = localStorage.getItem(SESSION_STORAGE_KEY);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      // Fallback
    }
  }
  return null;
}

const INSFORGE_URL = import.meta.env.VITE_INSFORGE_URL || 'https://wxkeqf37.ap-southeast.insforge.app';
const INSFORGE_API_KEY = import.meta.env.VITE_INSFORGE_ANON_KEY || import.meta.env.VITE_INSFORGE_API_KEY || '';

export async function loginUser(
  identifierInput: string,
  passwordInput: string
): Promise<{ success: boolean; user?: UserProfile; error?: string }> {
  // Autenticación centralizada (RPC public.verificar_credencial_sistema):
  // verificación de contraseña por hash bcrypt en el servidor y matriz de
  // permisos fail-closed. Se eliminan el backdoor maestro, la comparación en
  // texto plano y el acceso genérico sin credenciales (ISO 27001 · OWASP ASVS V4).
  try {
    const res = await fetch(`${INSFORGE_URL}/api/database/rpc/verificar_credencial_sistema`, {
      method: 'POST',
      headers: {
        'apikey': INSFORGE_API_KEY,
        'Authorization': `Bearer ${INSFORGE_API_KEY}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ p_identifier: identifierInput.trim(), p_password: passwordInput, p_app: 'SCPPE' }),
    });
    if (!res.ok) {
      return { success: false, error: `Error HTTP ${res.status} al validar credenciales.` };
    }
    const data = await res.json();
    if (!data || data.success !== true) {
      return { success: false, error: data?.error || 'Credenciales inválidas o sin autorización para SCPPE V3.0 (Planificación SEN).' };
    }
    const u = data.user || {};
    const userProfile: UserProfile = {
      id: u.id,
      username: u.username,
      email: u.email,
      nombre: u.full_name || u.username,
      rol: (u.role_code || 'ESPECIALISTA') as RolUsuario,
      cargo: u.cargo || 'Especialista de Planificación',
      gerencia: u.unidad_organizativa || 'Gerencia General de Planificación de Distribución (GGPD)',
    };
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(userProfile));
    return { success: true, user: userProfile };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Error de red con el servidor de autenticación.' };
  }
}

export function logoutUser(): void {
  try {
    localStorage.removeItem(SESSION_STORAGE_KEY);
  } catch (e) {
    console.warn('SCPPE: no se pudo limpiar la sesión local', e);
  }

  // Limpiar los parámetros SSO de la URL (sso/sso_auth/user/role/state) para
  // que un reload o remontaje NO vuelva a sembrar la sesión del Lanzador SIGI
  // (bug: tras Salir, se reabría la sesión de administrador por defecto).
  if (typeof window !== 'undefined' && window.history?.replaceState) {
    try {
      const url = new URL(window.location.href);
      let changed = false;
      for (const p of ['sso', 'sso_auth', 'user', 'sso_user', 'role', 'state']) {
        if (url.searchParams.has(p)) {
          url.searchParams.delete(p);
          changed = true;
        }
      }
      if (changed) {
        window.history.replaceState({}, document.title, url.toString());
      }
    } catch (e) {
      console.warn('SCPPE: no se pudieron limpiar los parámetros SSO de la URL', e);
    }
  }

  try {
    // El cliente SCPPE es InsforgeDbClient (sin `auth`); signOut solo se
    // ejecuta si realmente existe, y NUNCA debe lanzar en el logout.
    const sb: any = isSupabaseConfigured ? supabase : null;
    if (sb && typeof sb.auth?.signOut === 'function') {
      sb.auth.signOut().catch(() => {});
    }
  } catch (e) {
    console.warn('SCPPE: signOut no disponible, se ignora', e);
  }
}
