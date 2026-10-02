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
const INSFORGE_API_KEY = (import.meta as any).env?.VITE_INSFORGE_API_KEY
  || (import.meta as any).env?.INSFORGE_API_KEY
  || '';

// Semilla canónica SCEIN (espejo de INITIAL_USERS en server.ts) para validar
// credenciales cuando el backend Express no está disponible (hosting estático)
// o la cuenta aún no existe en el IAM centralizado de InsForge.
const SCEIN_USUARIOS_PREDEFINIDOS: (User & { password: string })[] = [
  {
    id: 'usr-scein-001',
    username: 'admin.ggpd',
    email: 'admin.ggpd@corpoelec.gob.ve',
    password: 'admin2026!.',
    full_name: 'Administrador General GGPD',
    role: 'ADMIN_NACIONAL',
    state_code: null,
    is_active: true,
  },
  {
    id: 'usr-scein-002',
    username: 'j_jimenez',
    email: 'j_jimenez@corpoelec.gob.ve',
    password: 'Jimenez2026.',
    full_name: 'Ing. J. Jiménez',
    role: 'ADMIN_NACIONAL',
    state_code: null,
    is_active: true,
  },
  {
    id: 'usr-scein-003',
    username: 'j_pacheco',
    email: 'j_pacheco@corpoelec.gob.ve',
    password: 'Pacheco2026.',
    full_name: 'Ing. J. Pacheco',
    role: 'ADMIN_NACIONAL',
    state_code: null,
    is_active: true,
  },
  {
    id: 'usr-scein-004',
    username: 'y_cipiran',
    email: 'y_cipiran@corpoelec.gob.ve',
    password: 'Cipiran2026.',
    full_name: 'Ing. Y. Cipiran',
    role: 'ADMIN_NACIONAL',
    state_code: null,
    is_active: true,
  },
  {
    id: 'usr-scein-005',
    username: 'e_tachira',
    email: 'e_tachira@corpoelec.gob.ve',
    password: 'Tachira2026.',
    full_name: 'Analista Estatal Táchira',
    role: 'ANALISTA_ESTATAL',
    state_code: 'TA',
    is_active: true,
  },
  {
    id: 'usr-scein-006',
    username: 'a_auditor',
    email: 'a_auditor@corpoelec.gob.ve',
    password: 'Auditor2026.',
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
          const { password, ...userProfile } = found;
          localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(userProfile));
          return userProfile;
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
    const cleanInput = username.trim().toLowerCase();

    // 1. Validar primero con el IAM centralizado de InsForge
    try {
      const url = `${INSFORGE_URL.replace(/\/+$/, '')}/rest/v1/mae_usuarios_sistema?or=(username.eq.${encodeURIComponent(cleanInput)},email.eq.${encodeURIComponent(cleanInput)})&limit=1`;
      const res = await fetch(url, {
        headers: {
          'apikey': INSFORGE_API_KEY,
          'Authorization': `Bearer ${INSFORGE_API_KEY}`
        }
      });
      if (res.ok) {
        const records: any = await res.json();
        if (Array.isArray(records) && records.length > 0) {
          const insUser = records[0];
          if (insUser.status === 'SUSPENDIDO') {
            return { success: false, error: 'Cuenta SUSPENDIDA en InsForge por directiva de seguridad.' };
          }
          if (!insUser.permiso_scein && (insUser.role_code || '') !== 'ADMINISTRADOR' && (insUser.role_code || '') !== 'GERENCIA') {
            return { success: false, error: 'No posee autorización de acceso para SCEIN V3.0.' };
          }
          if (insUser.password_hash === password) {
            const role = mapInsforgeRole(insUser.role_code);
            const profile: User = {
              id: insUser.id,
              username: insUser.username,
              email: insUser.email,
              full_name: insUser.full_name || insUser.username,
              role,
              state_code: role === 'ANALISTA_ESTATAL' ? (insUser.estado_codigo || null) : null,
              is_active: true,
              last_login_at: new Date().toISOString(),
            };
            localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(profile));
            setUser(profile);
            return { success: true };
          }
          // Si el hash del IAM no coincide, NO bloquear: caer a la semilla
          // canónica (el password institucional puede seguir siendo válido).
        }
      }
    } catch (insErr) {
      console.warn('⚠️ Fallback local en SCEIN auth:', insErr);
    }

    // 2. Fallback semilla canónica (backend Express no disponible / IAM sin la cuenta)
    const normalized = cleanInput.replace('_', '.');
    const matchedUser = SCEIN_USUARIOS_PREDEFINIDOS.find(
      (u) =>
        u.username.toLowerCase() === cleanInput ||
        (u.email || '').toLowerCase() === cleanInput ||
        u.username.toLowerCase() === normalized
    );

    if (matchedUser) {
      if (matchedUser.password !== password) {
        return { success: false, error: 'Contraseña incorrecta.' };
      }
      const { password: _pw, ...profile } = matchedUser;
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(profile));
      setUser(profile as User);
      return { success: true };
    }

    return { success: false, error: 'Credenciales inválidas o sin permisos en SCEIN.' };
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