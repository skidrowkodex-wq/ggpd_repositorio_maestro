import { UserProfile, RolUsuario } from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

export const USUARIOS_PREDEFINIDOS: (UserProfile & { password: string })[] = [
  {
    id: 'usr-000',
    username: 'j_pacheco',
    email: 'j_pacheco@corpoelec.gob.ve',
    password: 'Pacheco2026.',
    nombre: 'Josue D. Pacheco',
    rol: 'ADMINISTRADOR',
    cargo: 'Administrador del Sistema / Planificación Eléctrica',
    gerencia: 'Gerencia General de Planificación de Distribución (GGPD)',
  },
  {
    id: 'usr-001',
    username: 'ggpd_admin',
    email: 'ggpd_admin@corpoelec.gob.ve',
    password: 'Lunes35.',
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
    password: 'Reyes2026.',
    nombre: 'Carlos Reyes',
    rol: 'ESPECIALISTA',
    cargo: 'Especialista en Evaluación POA & RDS-PS',
    gerencia: 'Gerencia General de Planificación de Distribución (GGPD)',
  },
  {
    id: 'usr-005',
    username: 'a_correa',
    email: 'a_correa@corpoelec.gob.ve',
    password: 'Correa2026.',
    nombre: 'Adrian Correa',
    rol: 'ESPECIALISTA',
    cargo: 'Especialista en Control y Seguimiento Operativo',
    gerencia: 'Gerencia General de Planificación de Distribución (GGPD)',
  },
  {
    id: 'usr-006',
    username: 'analista_gestion',
    email: 'analista_gestion@corpoelec.gob.ve',
    password: 'Lunes35.',
    nombre: 'Lcdo. Juan Pérez',
    rol: 'ANALISTA',
    cargo: 'Analista de Control y Seguimiento Territorial',
    gerencia: 'Gerencia General de Distribución (GGD)',
  },
];

const SESSION_STORAGE_KEY = 'ggpd_session_user';

export function getInitialUser(): UserProfile | null {
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

export async function loginUser(
  identifierInput: string,
  passwordInput: string
): Promise<{ success: boolean; user?: UserProfile; error?: string }> {
  const cleanInput = identifierInput.trim().toLowerCase();

  // Check in pre-configured users first
  const matchedUser = USUARIOS_PREDEFINIDOS.find(
    (u) =>
      (u.username.toLowerCase() === cleanInput || u.email.toLowerCase() === cleanInput) &&
      u.password === passwordInput
  );

  if (matchedUser) {
    const { password, ...userProfile } = matchedUser;
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(userProfile));

    // Try optional Supabase authentication if configured
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.auth.signInWithPassword({
          email: matchedUser.email,
          password: passwordInput,
        });
      } catch {
        // Ignore Supabase auth error for demo user fallback
      }
    }

    return { success: true, user: userProfile };
  }

  // Attempt Supabase Auth login if not in pre-defined list
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanInput,
        password: passwordInput,
      });

      if (!error && data.user) {
        const userProfile: UserProfile = {
          id: data.user.id,
          username: cleanInput.split('@')[0],
          email: data.user.email || cleanInput,
          nombre: data.user.user_metadata?.nombre || 'Usuario Registrado Supabase',
          rol: (data.user.user_metadata?.rol as RolUsuario) || 'ANALISTA',
          cargo: data.user.user_metadata?.cargo || 'Personal de Operaciones',
          gerencia: data.user.user_metadata?.gerencia || 'Distribución',
        };

        localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(userProfile));
        return { success: true, user: userProfile };
      }
    } catch (err: any) {
      return { success: false, error: err.message || 'Error de autenticación' };
    }
  }

  return {
    success: false,
    error: 'Credenciales inválidas. Verifique el usuario o contraseña.',
  };
}

export function logoutUser(): void {
  localStorage.removeItem(SESSION_STORAGE_KEY);
  if (isSupabaseConfigured && supabase) {
    supabase.auth.signOut().catch(() => {});
  }
}
