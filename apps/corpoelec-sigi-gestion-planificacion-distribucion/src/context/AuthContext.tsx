import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserRole, StateCode, AuthSession } from '../types/sigi';
import { VENEZUELAN_STATES } from '../mockData/portalData';

interface AuthContextType {
  session: AuthSession;
  login: (passkey: string, stateCode: StateCode) => { success: boolean; message?: string };
  logout: () => void;
  setStateCode: (code: StateCode) => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const PASSKEY_MAP: Record<string, UserRole> = {
  SIGI2026: 'OPERADOR',
  OPERADOR2026: 'OPERADOR',
  ANALISTA2026: 'ANALISTA',
  MINUTAS2026: 'ANALISTA',
  GERENCIA2026: 'GERENCIA',
  ADMIN2026: 'GERENCIA',
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<AuthSession>(() => {
    const saved = sessionStorage.getItem('sigi_auth_session');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return {
      authenticated: false,
      role: 'OPERADOR',
      stateCode: '01',
      stateName: 'Distrito Capital',
    };
  });

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const savedTheme = sessionStorage.getItem('sigi_theme');
    return (savedTheme === 'dark' || savedTheme === 'light') ? savedTheme : 'light';
  });

  useEffect(() => {
    sessionStorage.setItem('sigi_auth_session', JSON.stringify(session));
  }, [session]);

  useEffect(() => {
    sessionStorage.setItem('sigi_theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  const login = (passkey: string, stateCode: StateCode) => {
    const role = PASSKEY_MAP[passkey.trim().toUpperCase()];
    if (!role) {
      return { success: false, message: 'Clave institucional inválida.' };
    }

    const stateObj = VENEZUELAN_STATES.find((s) => s.code === stateCode);
    const newSession: AuthSession = {
      authenticated: true,
      role,
      stateCode,
      stateName: stateObj ? stateObj.name : 'Desconocido',
    };

    setSession(newSession);
    return { success: true };
  };

  const logout = () => {
    setSession({
      authenticated: false,
      role: 'OPERADOR',
      stateCode: '01',
      stateName: 'Distrito Capital',
    });
  };

  const setStateCode = (code: StateCode) => {
    const stateObj = VENEZUELAN_STATES.find((s) => s.code === code);
    setSession((prev) => ({
      ...prev,
      stateCode: code,
      stateName: stateObj ? stateObj.name : prev.stateName,
    }));
  };

  return (
    <AuthContext.Provider value={{ session, login, logout, setStateCode, theme, toggleTheme }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};
