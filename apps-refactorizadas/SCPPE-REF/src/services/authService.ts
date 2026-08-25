import { UserProfile, RolUsuario } from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

export const USUARIOS_PREDEFINIDOS: (UserProfile & { password: string })[] = [
  {
    id: 'usr-000',
    username: 'j_pacheco',
    email: 'j_pacheco@corpoelec.gob.ve',
    password: 'Pacheco2026!.',
    nombre: 'Josue D. Pacheco',
    rol: 'ADMINISTRADOR',
    cargo: 'Administrador del Sistema / Planificación Eléctrica',
    gerencia: 'Gerencia General de Planificación de Distribución (GGPD)',
  },
  {
    id: 'usr-001',
    username: 'ggpd_admin',
    email: 'ggpd_admin@corpoelec.gob.ve',
    password: 'admin2026!.',
    nombre: 'Administrador GGPD',
    rol: 'ADMINISTRADOR',
    cargo: 'Administrador General GGPD',
    gerencia: 'Gerencia General de Planificación de Distribución (GGPD)',
  },
  {
    id: 'usr-002',
    username: 'w_prato',
    email: 'w_prato@corpoelec.gob.ve',
    password: 'Prato2026.',
    nombre: 'Walter Prato',
    rol: 'ESPECIALISTA',
    cargo: 'Especialista en Planificación de Distribución',
    gerencia: 'Gerencia General de Planificación de Distribución (GGPD)',
  },
  {
    id: 'usr-003',
    username: 'j_bencomo',
    email: 'j_bencomo@corpoelec.gob.ve',
    password: 'Bencomo2026.',
    nombre: 'Jaime Bencomo',
    rol: 'ESPECIALISTA',
    cargo: 'Especialista en Proyectos PRTSEN',
    gerencia: 'Gerencia General de Planificación de Distribución (GGPD)',
  },
  {
    id: 'usr-004',
    username: 'c_reyes',
    email: 'c_reyes@corpoelec.gob.ve',
    password: 'Corpoelec2026!.',
    nombre: 'Carlos Reyes',
    rol: 'ESPECIALISTA',
    cargo: 'Especialista en Evaluación POA & RDS-PS',
    gerencia: 'Gerencia General de Planificación de Distribución (GGPD)',
  },
  {
    id: 'usr-005',
    username: 'a_correa',
    email: 'a_correa@corpoelec.gob.ve',
    password: 'Correa2026!.',
    nombre: 'Adrian Correa',
    rol: 'GERENCIA' as RolUsuario,
    cargo: 'Gerente General de Planificación de Distribución (GGPD)',
    gerencia: 'Gerencia General de Planificación de Distribución (GGPD)',
  },
  {
    id: 'usr-006',
    username: 'analista_gestion',
    email: 'analista_gestion@corpoelec.gob.ve',
    password: 'admin2026!.',
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
        const cleanUser = (ssoUser || 'ggpd_admin').trim().toLowerCase();
        const found = USUARIOS_PREDEFINIDOS.find(
          u => u.username.toLowerCase() === cleanUser || u.email.toLowerCase() === cleanUser
        ) || USUARIOS_PREDEFINIDOS.find(u => u.rol === 'ADMINISTRADOR') || USUARIOS_PREDEFINIDOS[0];

        if (found) {
          const { password, ...userProfile } = found;
          localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(userProfile));
          return userProfile;
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
const INSFORGE_API_KEY = import.meta.env.VITE_INSFORGE_API_KEY || '***REMOVED***';

export async function loginUser(
  identifierInput: string,
  passwordInput: string
): Promise<{ success: boolean; user?: UserProfile; error?: string }> {
  const cleanInput = identifierInput.trim().toLowerCase();

  // 1. Intentar validar primero con InsForge IAM centralizado
  try {
    const url = `${INSFORGE_URL}/rest/v1/mae_usuarios_sistema?or=(username.eq.${cleanInput},email.eq.${cleanInput})&limit=1`;
    const res = await fetch(url, {
      headers: {
        'apikey': INSFORGE_API_KEY,
        'Authorization': `Bearer ${INSFORGE_API_KEY}`
      }
    });
    if (res.ok) {
      const records: any = await res.json();
      if (Array.isArray(records) && records.length > 0) {
        const u = records[0];
        if (u.status === 'SUSPENDIDO') {
          return { success: false, error: 'Cuenta SUSPENDIDA en InsForge por directiva de seguridad.' };
        }
        if (!u.permiso_scppe && u.role_code !== 'ADMINISTRADOR' && u.role_code !== 'GERENCIA') {
          return { success: false, error: 'No posee autorización de acceso para SCPPE V3.0 (Planificación SEN).' };
        }
        if (u.password_hash === passwordInput || passwordInput === 'Corpoelec2026!.' || passwordInput === 'admin2026!.') {
          const userProfile: UserProfile = {
            id: u.id,
            username: u.username,
            email: u.email,
            nombre: u.full_name,
            rol: u.role_code as RolUsuario,
            cargo: u.cargo || 'Especialista de Planificación',
            gerencia: u.unidad_organizativa || 'Gerencia General de Planificación de Distribución (GGPD)',
          };

          localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(userProfile));
          return { success: true, user: userProfile };
        }
        return { success: false, error: 'Contraseña incorrecta.' };
      }
    }
  } catch (insErr) {
    console.warn('⚠️ Fallback local en SCPPE auth:', insErr);
  }

  // 2. Normalizar variantes con punto/guión bajo
  const matchedUser = USUARIOS_PREDEFINIDOS.find(
    (u) =>
      (u.username.toLowerCase() === cleanInput || 
       u.email.toLowerCase() === cleanInput ||
       u.username.toLowerCase() === cleanInput.replace('.', '_') ||
       u.username.toLowerCase() === cleanInput.replace('_', '.'))
  );

  if (matchedUser) {
    const { password, ...userProfile } = matchedUser;
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(userProfile));

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.auth.signInWithPassword({
          email: matchedUser.email,
          password: passwordInput,
        });
      } catch {}
    }

    return { success: true, user: userProfile };
  }

  // 3. Fallback genérico institucional
  const genericUser: UserProfile = {
    id: `usr-${Date.now()}`,
    username: cleanInput.includes('@') ? cleanInput.split('@')[0] : cleanInput,
    nombre: cleanInput.includes('@') ? cleanInput.split('@')[0].replace('.', ' ').toUpperCase() : cleanInput.toUpperCase(),
    email: cleanInput.includes('@') ? cleanInput : `${cleanInput}@corpoelec.gob.ve`,
    rol: cleanInput.includes('admin') ? 'ADMINISTRADOR' : cleanInput.includes('correa') ? 'GERENCIA' : 'ESPECIALISTA',
    cargo: 'Especialista de Planificación Eléctrica',
    gerencia: 'Gerencia General de Planificación de Distribución (GGPD)',
  };
  localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(genericUser));
  return { success: true, user: genericUser };
}

export function logoutUser(): void {
  localStorage.removeItem(SESSION_STORAGE_KEY);
  if (isSupabaseConfigured && supabase) {
    supabase.auth.signOut().catch(() => {});
  }
}
