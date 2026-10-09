import React, { createContext, useContext, useState } from 'react';
import { User, UserRole } from '../types/auth';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  hasRole: (roles: UserRole[]) => boolean;
  canEditState: (stateCode: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const SESSION_STORAGE_KEY = 'sigad_session_user';

export const SIGAD_USUARIOS_PREDEFINIDOS: (User & { password: string })[] = [
  {
    id: 'usr-sigad-001',
    username: 'admin.ggpd',
    email: 'admin.ggpd@corpoelec.gob.ve',
    password: 'admin2026!.',
    full_name: 'Administrador General GGPD',
    role: 'ADMIN_NACIONAL',
    state_code: null,
    is_active: true,
  },
  {
    id: 'usr-sigad-002',
    username: 'y_cipiran',
    email: 'y_cipiran@corpoelec.gob.ve',
    password: 'Cipiran2026.',
    full_name: 'Ing. Y. Cipiran',
    role: 'ADMIN_NACIONAL',
    state_code: null,
    is_active: true,
  },
  {
    id: 'usr-sigad-003',
    username: 'j_jimenez',
    email: 'j_jimenez@corpoelec.gob.ve',
    password: 'Jimenez2026.',
    full_name: 'Ing. J. Jiménez',
    role: 'ADMIN_NACIONAL',
    state_code: null,
    is_active: true,
  },
  {
    id: 'usr-sigad-004',
    username: 'j_pacheco',
    email: 'j_pacheco@corpoelec.gob.ve',
    password: 'Pacheco2026.',
    full_name: 'Ing. J. Pacheco',
    role: 'ADMIN_NACIONAL',
    state_code: null,
    is_active: true,
  },
  {
    id: 'usr-sigad-005',
    username: 'e_tachira',
    email: 'e_tachira@corpoelec.gob.ve',
    password: 'Tachira2026.',
    full_name: 'Analista Estatal Táchira',
    role: 'ANALISTA_ESTATAL',
    state_code: 'TA',
    is_active: true,
  },
  {
    id: 'usr-sigad-006',
    username: 'a_auditor',
    email: 'a_auditor@corpoelec.gob.ve',
    password: 'Auditor2026.',
    full_name: 'Auditor ISO 55000 / 27001',
    role: 'AUDITOR',
    state_code: null,
    is_active: true,
  },
];

function getInitialUser(): User | null {
  if (typeof window !== 'undefined') {
    // 1. Detección SSO desde el Lanzador del Portal Maestro SIGI
    try {
      const params = new URLSearchParams(window.location.search);
      const isSso = params.get('sso') === 'true' || params.get('sso_auth') === 'true';
      const ssoUser = params.get('user') || params.get('sso_user');
      if (isSso && ssoUser) {
        const found = SIGAD_USUARIOS_PREDEFINIDOS.find(
          u => u.username.toLowerCase() === ssoUser.toLowerCase()
        );
        if (found) {
          const { password: _, ...safeUser } = found;
          localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(safeUser));
          return safeUser;
        }
      }
    } catch (e) {
      console.warn('SIGAD: Error parseando params SSO:', e);
    }

    // 2. Sesión guardada en localStorage
    try {
      const saved = localStorage.getItem(SESSION_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('SIGAD: Error recuperando sesión:', e);
    }
  }
  return null;
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(getInitialUser);
  const [loading, setLoading] = useState<boolean>(false);

  const login = async (username: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setLoading(true);
    try {
      const cleanU = (username || '').trim().toLowerCase();
      const cleanP = (password || '').trim();

      const matched = SIGAD_USUARIOS_PREDEFINIDOS.find(
        u => (u.username.toLowerCase() === cleanU || u.email.toLowerCase() === cleanU) && u.password === cleanP
      );

      if (matched) {
        const { password: _, ...safeUser } = matched;
        safeUser.last_login_at = new Date().toISOString();
        setUser(safeUser);
        localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(safeUser));
        return { success: true };
      }

      return { success: false, error: 'Credenciales inválidas. Verifique usuario institucional y contraseña.' };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setUser(null);
    localStorage.removeItem(SESSION_STORAGE_KEY);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      ['sso', 'sso_auth', 'user', 'sso_user', 'role', 'state'].forEach(p => url.searchParams.delete(p));
      window.history.replaceState({}, '', url.pathname);
    }
  };

  const hasRole = (roles: UserRole[]): boolean => {
    if (!user) return false;
    return roles.includes(user.role);
  };

  const canEditState = (stateCode: string): boolean => {
    if (!user) return false;
    if (user.role === 'ADMIN_NACIONAL') return true;
    if (user.role === 'AUDITOR') return false;
    return user.state_code === stateCode;
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
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
};
