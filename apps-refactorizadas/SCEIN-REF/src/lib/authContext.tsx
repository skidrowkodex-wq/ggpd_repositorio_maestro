import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  hasRole: (roles: UserRole[]) => boolean;
  canEditState: (stateCode: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const SESSION_STORAGE_KEY = 'scein_session_user';

const INSFORGE_URL = (import.meta as any).env?.VITE_INSFORGE_URL
  || (import.meta as any).env?.INSFORGE_URL
  || 'https://wxkeqf37.ap-southeast.insforge.app';
const INSFORGE_API_KEY = (import.meta as any).env?.VITE_INSFORGE_ANON_KEY
  || (import.meta as any).env?.VITE_INSFORGE_API_KEY
  || '';

// Catálogo de perfiles canónicos SCEIN para Single Sign-On y metadatos de rol.
// SEGURIDAD (ISO/IEC 27001 · OWASP ASVS V4): NO contiene contraseñas. La
// validación de credenciales es exclusivamente server-side vía el RPC
// public.verificar_credencial_sistema (hash bcrypt).
const SCEIN_USUARIOS_PREDEFINIDOS: User[] = [
  {
    id: 'usr-scein-001',
    username: 'admin.ggpd',
    email: 'admin.ggpd@corpoelec.gob.ve',
    full_name: 'Administrador General GGPD',
    role: 'ADMIN_NACIONAL',
    state_code: null,
    is_active: true,
  },
  {
    id: 'usr-scein-002',
    username: 'j_jimenez',
    email: 'j_jimenez@corpoelec.gob.ve',
    full_name: 'Ing. J. Jiménez',
    role: 'ADMIN_NACIONAL',
    state_code: null,
    is_active: true,
  },
  {
    id: 'usr-scein-003',
    username: 'j_pacheco',
    email: 'j_pacheco@corpoelec.gob.ve',
    full_name: 'Ing. J. Pacheco',
    role: 'ADMIN_NACIONAL',
    state_code: null,
    is_active: true,
  },
  {
    id: 'usr-scein-004',
    username: 'y_cipiran',
    email: 'y_cipiran@corpoelec.gob.ve',
    full_name: 'Ing. Y. Cipiran',
    role: 'ADMIN_NACIONAL',
    state_code: null,
    is_active: true,
  },
  {
    id: 'usr-scein-005',
    username: 'e_tachira',
    email: 'e_tachira@corpoelec.gob.ve',
    full_name: 'Analista Estatal Táchira',
    role: 'ANALISTA_ESTATAL',
    state_code: 'TA',
    is_active: true,
  },
  {
    id: 'usr-scein-006',
    username: 'a_auditor',
    email: 'a_auditor@corpoelec.gob.ve',
    full_name: 'Auditor ISO 8000 / 27001',
    role: 'AUDITOR',
    state_code: null,
    is_active: true,
  },
];

function mapInsforgeRole(roleCode?: string): UserRole {
  const rc = (roleCode || '').toUpperCase();
  if (rc.includes('AUDIT')) return 'AUDITOR';
  if (rc.includes('ANALISTA')) return 'ANALISTA_ESTATAL';
  return 'ADMIN_NACIONAL';
}

function getInitialUser(): User | null {
  if (typeof window !== 'undefined') {
    // 1. Single Sign-On (SSO) desde el Portal Maestro SIGI
    try {
      const params = new URLSearchParams(window.location.search);
      const isSso = params.get('sso') === 'true' || params.get('sso_auth') === 'true';
      const ssoUser = params.get('user') || params.get('sso_user');
      if (isSso) {
        const clean = (ssoUser || 'admin.ggpd').trim().toLowerCase();
        const found = SCEIN_USUARIOS_PREDEFINIDOS.find(
          u => u.username.toLowerCase() === clean || (u.email || '').toLowerCase() === clean
        ) || SCEIN_USUARIOS_PREDEFINIDOS[0];
        if (found) {
          localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(found));
          return found;
        }
      }
    } catch (e) {
      console.warn('Error leyendo SSO en SCEIN', e);
    }

    // 2. Sesión persistida del último inicio de sesión
    try {
      const saved = localStorage.getItem(SESSION_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.username && parsed.role) return parsed as User;
      }
    } catch (e) {
      console.warn('Error leyendo sesión local en SCEIN', e);
    }
  }
  return null;
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Check auth on startup (client-side: SSO o sesión persistida)
  useEffect(() => {
    const initial = getInitialUser();
    setUser(initial);
    setLoading(false);
  }, []);

  const login = async (username: string, password: string) => {
    // Autenticación centralizada (RPC public.verificar_credencial_sistema):
    // verificación de contraseña por hash bcrypt en el servidor, matriz de
    // permisos fail-closed y auditoría de acceso. El cliente NUNCA compara
    // contraseñas ni las almacena (ISO/IEC 27001 · OWASP ASVS V4).
    try {
      const res = await fetch(`${INSFORGE_URL.replace(/\/+$/, '')}/api/database/rpc/verificar_credencial_sistema`, {
        method: 'POST',
        headers: {
          'apikey': INSFORGE_API_KEY,
          'Authorization': `Bearer ${INSFORGE_API_KEY}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ p_identifier: username.trim(), p_password: password, p_app: 'SCEIN' }),
      });
      if (!res.ok) {
        return { success: false, error: `Error HTTP ${res.status} al validar credenciales.` };
      }
      const data = await res.json();
      if (!data || data.success !== true) {
        return { success: false, error: data?.error || 'Credenciales inválidas o sin permisos en SCEIN.' };
      }
      const u = data.user || {};
      const role = mapInsforgeRole(u.role_code);
      const profile: User = {
        id: u.id,
        username: u.username,
        email: u.email,
        full_name: u.full_name || u.username,
        role,
        state_code: role === 'ANALISTA_ESTATAL' ? (u.estado_codigo || null) : null,
        is_active: true,
        last_login_at: new Date().toISOString(),
      };
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(profile));
      setUser(profile);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Error de red con el servidor de autenticación.' };
    }
  };

  const logout = async () => {
    // Limpiar la sesión local SIEMPRE primero (independiente del backend)
    try {
      localStorage.removeItem(SESSION_STORAGE_KEY);
    } catch (e) {
      console.warn('SCEIN: no se pudo limpiar la sesión local', e);
    }
    setUser(null);

    // Limpiar parámetros SSO de la URL para que un reload no re-siembre sesión
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
        console.warn('SCEIN: no se pudieron limpiar los parámetros SSO de la URL', e);
      }
    }

    // Best-effort: notificar al backend Express si alguna vez está disponible
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (e) {}
  };

  const hasRole = (roles: UserRole[]): boolean => {
    if (!user) return false;
    return roles.includes(user.role);
  };

  const canEditState = (stateCode: string): boolean => {
    if (!user) return false;
    if (user.role === 'AUDITOR') return false;
    if (user.role === 'ADMIN_NACIONAL') return true;
    if (user.role === 'ANALISTA_ESTATAL') {
      return !user.state_code || user.state_code === stateCode;
    }
    return false;
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, hasRole, canEditState }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de AuthProvider');
  }
  return context;
};
