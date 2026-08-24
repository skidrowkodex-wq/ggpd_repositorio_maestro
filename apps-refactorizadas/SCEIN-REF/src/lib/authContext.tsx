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

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Check auth on startup
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    // 1. Check Single Sign-On (SSO) from Portal Maestro SIGI
    if (typeof window !== 'undefined') {
      try {
        const params = new URLSearchParams(window.location.search);
        const isSso = params.get('sso') === 'true' || params.get('sso_auth') === 'true';
        const ssoUser = params.get('user') || params.get('sso_user');
        if (isSso) {
          const clean = (ssoUser || 'ggpd_admin').trim().toLowerCase();
          const ssoProfile: User = {
            id: 'usr-001',
            username: clean,
            fullName: clean === 'ggpd_admin' ? 'Administrador General GGPD' : clean,
            role: (params.get('role') as UserRole) || 'ADMIN',
            stateCode: params.get('state') || 'NAC',
            isActive: true,
          };
          setUser(ssoProfile);
          setLoading(false);
          return;
        }
      } catch (e) {
        console.warn('Error reading SSO in SCEIN', e);
      }
    }

    try {
      const res = await fetch('/api/auth/me');
      const data = await res.json();
      if (data.authenticated && data.user) {
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch (e) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (username: string, password: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();

      if (data.success && data.user) {
        setUser(data.user);
        return { success: true };
      } else {
        return { success: false, error: data.error || 'Credenciales inválidas.' };
      }
    } catch (err: any) {
      return { success: false, error: 'Error de red o comunicación con el servidor.' };
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (e) {}
    setUser(null);
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
