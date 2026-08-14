import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserRole, StateCode, AuthSession } from '../types/sigi';
import { VENEZUELAN_STATES } from '../mockData/portalData';
import { INITIAL_INSTITUTIONAL_USERS } from '../mockData/usersCatalog';
import { InstitutionalUser } from '../types/userManagement';

export const STORAGE_USERS_KEY = 'CORPOELEC_SIGI_USERS_V1';

export const getCatalogUsers = (): InstitutionalUser[] => {
  try {
    const raw = localStorage.getItem(STORAGE_USERS_KEY);
    if (raw) {
      const parsed: InstitutionalUser[] = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Merge with INITIAL_INSTITUTIONAL_USERS to guarantee latest system accounts (ggpd_admin, a_correa, j_pacheco)
        const userMap = new Map<string, InstitutionalUser>();
        INITIAL_INSTITUTIONAL_USERS.forEach(u => userMap.set(u.username.toLowerCase(), u));
        parsed.forEach(u => {
          const existing = userMap.get(u.username.toLowerCase());
          if (existing) {
            userMap.set(u.username.toLowerCase(), {
              ...existing,
              ...u,
              initialPassword: existing.initialPassword || u.initialPassword,
            });
          } else {
            userMap.set(u.username.toLowerCase(), u);
          }
        });
        return Array.from(userMap.values());
      }
    }
  } catch (e) {
    console.error('Error loading users from storage:', e);
  }
  return INITIAL_INSTITUTIONAL_USERS;
};

export const saveCatalogUsers = (users: InstitutionalUser[]) => {
  try {
    localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(users));
  } catch (e) {
    console.error('Error saving users to storage:', e);
  }
};

interface AuthContextType {
  session: AuthSession;
  login: (credentialOrPasskey: string, stateCode: StateCode, passwordInput?: string) => { success: boolean; message?: string };
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
  ADMIN2026: 'ADMINISTRADOR',
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

  const login = (credentialOrPasskey: string, stateCode: StateCode, passwordInput?: string) => {
    const trimmed = credentialOrPasskey.trim();
    const trimmedPass = passwordInput ? passwordInput.trim() : '';

    if (!trimmed && !trimmedPass) {
      return { success: false, message: 'Por favor ingrese sus credenciales de acceso institucional.' };
    }

    const allUsers = getCatalogUsers();
    let matchedUser: InstitutionalUser | undefined = undefined;

    // Case 1: Both username and password provided
    if (trimmed && trimmedPass) {
      matchedUser = allUsers.find(
        (u) => 
          (u.username.toLowerCase() === trimmed.toLowerCase() || 
           u.email.toLowerCase() === trimmed.toLowerCase() || 
           (u.googleEmail && u.googleEmail.toLowerCase() === trimmed.toLowerCase())) &&
          (u.initialPassword === trimmedPass || u.initialPassword?.toLowerCase() === trimmedPass.toLowerCase())
      );

      if (!matchedUser) {
        return { 
          success: false, 
          message: 'Usuario o clave institucional incorrectos. Verifique sus credenciales corporativas.' 
        };
      }
    } else {
      // Case 2: Single token / passkey entered
      const token = trimmed || trimmedPass;

      // 2.1 Match by password in catalog
      matchedUser = allUsers.find(
        (u) => u.initialPassword === token || u.initialPassword?.toLowerCase() === token.toLowerCase()
      );

      // 2.2 Match by username in catalog
      if (!matchedUser) {
        matchedUser = allUsers.find(
          (u) => u.username.toLowerCase() === token.toLowerCase()
        );
      }
    }

    // If matched to a specific user in the catalog
    if (matchedUser) {
      if (matchedUser.status === 'SUSPENDIDO') {
        return { success: false, message: 'Usuario temporalmente suspendido por directiva de seguridad.' };
      }

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
        stateName: stateObj ? stateObj.name : 'Nivel Central / Nacional',
        accessTime: new Date().toLocaleTimeString(),
      };

      setSession(newSession);
      return { success: true };
    }

    // Case 3: Match with level passkey map (SIGI2026, GERENCIA2026, ADMIN2026, ADMINISTRADOR2026)
    const singleToken = (trimmed || trimmedPass).toUpperCase();
    const roleFromMap = PASSKEY_MAP[singleToken];
    if (roleFromMap) {
      const stateObj = VENEZUELAN_STATES.find((s) => s.code === stateCode);
      const newSession: AuthSession = {
        authenticated: true,
        userCode: `usr-${singleToken.toLowerCase()}`,
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
      message: 'Clave o credenciales institucionales inválidas. Ingrese usuario y clave corporativa (ej. ggpd_admin, a_correa, j_pacheco) o clave directa [Estado]2026!.' 
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
