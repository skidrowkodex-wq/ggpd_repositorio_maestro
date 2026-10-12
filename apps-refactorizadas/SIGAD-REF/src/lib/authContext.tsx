import React, { createContext, useContext, useState } from 'react';
import { User, UserRole } from '../types/auth';
import { insforgeClient } from './insforgeClient';

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

// ---- IAM central ---------------------------------------------------------------
// La autenticación se delega POR COMPLETO al servidor (RPC bcrypt). En el cliente
// NO se almacena ninguna credencial ni se acepta identidad por URL. La sesión vive
// en sessionStorage (se destruye al cerrar la pestaña) y se valida su forma al
// rehidratar (ISO/IEC 27001 A.8.5 / OWASP ASVS V3).
const APP_CODE = 'SIGAD';

/** Traduce el role_code del IAM central al rol de dominio de SIGAD. */
function mapRoleCodeToRole(roleCode: string | null | undefined): UserRole {
  const rc = String(roleCode || '').toUpperCase();
  if (rc === 'ADMINISTRADOR' || rc === 'GERENCIA') return 'ADMIN_NACIONAL';
  if (rc === 'AUDITOR') return 'AUDITOR';
  return 'ANALISTA_ESTATAL';
}

/** Normaliza estado_codigo (p. ej. 'TAC') a state_code; nacional si es vacío. */
function mapStateCode(estadoCodigo: string | null | undefined): string | null {
  const s = String(estadoCodigo || '').trim().toUpperCase();
  return s && s !== 'NACIONAL' && s !== 'NAC' ? s : null;
}

/** Mapea la respuesta segura de la RPC al modelo de dominio de SIGAD. */
function mapIamUserToSigadUser(u: any): User {
  const role = mapRoleCodeToRole(u?.role_code);
  return {
    id: String(u?.id ?? ''),
    username: String(u?.username ?? ''),
    email: String(u?.email ?? ''),
    full_name: String(u?.full_name ?? u?.username ?? ''),
    role,
    state_code: role === 'ADMIN_NACIONAL' ? null : mapStateCode(u?.estado_codigo),
    is_active: String(u?.status ?? '').toUpperCase() === 'ACTIVO',
    last_login_at: u?.ultimo_acceso ?? new Date().toISOString(),
  };
}

/** Rehidrata la sesión SOLO desde sessionStorage y solo si su forma es válida. */
function getInitialUser(): User | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as User;
    if (parsed && parsed.id && parsed.username && parsed.role) return parsed;
    sessionStorage.removeItem(SESSION_STORAGE_KEY);
    return null;
  } catch {
    return null;
  }
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(getInitialUser);
  const [loading, setLoading] = useState<boolean>(false);

  const login = async (username: string, password: string): Promise<{ success: boolean; error?: string }> => {
    const identifier = (username || '').trim();
    const secret = password || '';
    if (!identifier || !secret) {
      return { success: false, error: 'Ingrese usuario/correo institucional y contraseña.' };
    }

    setLoading(true);
    try {
      const result = await insforgeClient.autenticar(identifier, secret, APP_CODE);
      if (!result.success || !result.user) {
        return { success: false, error: result.error || 'Credenciales inválidas o sin permiso para SIGAD.' };
      }
      const mapped = mapIamUserToSigadUser(result.user);
      if (!mapped.is_active) {
        return { success: false, error: 'La cuenta no está ACTIVA. Contacte al Administrador GGPD.' };
      }
      setUser(mapped);
      sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(mapped));
      return { success: true };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setUser(null);
    try {
      sessionStorage.removeItem(SESSION_STORAGE_KEY);
    } catch {
      /* ignore */
    }
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      ['sso', 'sso_auth', 'user', 'sso_user', 'role', 'state'].forEach((p) => url.searchParams.delete(p));
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
