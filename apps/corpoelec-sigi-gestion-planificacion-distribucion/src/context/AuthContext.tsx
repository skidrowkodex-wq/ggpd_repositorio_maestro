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

import { INITIAL_INSTITUTIONAL_USERS } from '../mockData/usersCatalog';
import { InstitutionalUser } from '../types/userManagement';

const STORAGE_USERS_KEY = 'CORPOELEC_SIGI_USERS_V1';

const getCatalogUsers = (): InstitutionalUser[] => {
  try {
    const raw = localStorage.getItem(STORAGE_USERS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error(e);
  }
  return INITIAL_INSTITUTIONAL_USERS;
};

const PASSKEY_MAP: Record<string, UserRole> = {
  SIGI2026: 'OPERADOR',
  OPERADOR2026: 'OPERADOR',
  ANALISTA2026: 'ANALISTA',
  MINUTAS2026: 'ANALISTA',
  GERENCIA2026: 'GERENCIA',
  ADMIN2026: 'GERENCIA',
  ADMINISTRADOR2026: 'ADMINISTRADOR',
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
    const trimmed = passkey.trim();
    if (!trimmed) {
      return { success: false, message: 'Por favor ingrese su clave institucional.' };
    }

    const allUsers = getCatalogUsers();

    // 1. Check exact match in users catalog by initialPassword
    let matchedUser = allUsers.find(
      (u) => u.initialPassword === trimmed || u.initialPassword?.toLowerCase() === trimmed.toLowerCase()
    );

    // 1.1 If not found, check by username (if user entered their username)
    if (!matchedUser) {
      matchedUser = allUsers.find(
        (u) => u.username.toLowerCase() === trimmed.toLowerCase()
      );
    }

    // 1.2 If matched by catalog user
    if (matchedUser) {
      const targetState = matchedUser.stateCode && matchedUser.stateCode !== 'NAC' 
        ? matchedUser.stateCode 
        : stateCode;
      
      const stateObj = VENEZUELAN_STATES.find((s) => s.code === targetState) || VENEZUELAN_STATES.find(s => s.code === stateCode);

      const newSession: AuthSession = {
        authenticated: true,
        userCode: matchedUser.id,
        name: matchedUser.fullName,
        role: matchedUser.role,
        stateCode: targetState,
        stateName: stateObj ? stateObj.name : 'Desconocido',
        accessTime: new Date().toLocaleTimeString(),
      };

      setSession(newSession);
      return { success: true };
    }

    // 2. Check legacy passkey map (e.g., SIGI2026, GERENCIA2026, ADMIN2026)
    const roleFromMap = PASSKEY_MAP[trimmed.toUpperCase()];
    if (roleFromMap) {
      const stateObj = VENEZUELAN_STATES.find((s) => s.code === stateCode);
      const newSession: AuthSession = {
        authenticated: true,
        userCode: `usr-${trimmed.toLowerCase()}`,
        name: `Usuario ${roleFromMap}`,
        role: roleFromMap,
        stateCode,
        stateName: stateObj ? stateObj.name : 'Desconocido',
        accessTime: new Date().toLocaleTimeString(),
      };

      setSession(newSession);
      return { success: true };
    }

    return { 
      success: false, 
      message: 'Clave institucional inválida. Para Coordinaciones Estadales use [Estado]2026!. (ej. Tachira2026!., Zulia2026!.) o claves de nivel (SIGI2026, GERENCIA2026).' 
    };
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
