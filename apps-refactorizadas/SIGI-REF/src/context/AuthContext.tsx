import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserRole, StateCode, AuthSession } from '../types/sigi';
import { VENEZUELAN_STATES } from '../mockData/portalData';
import { INITIAL_INSTITUTIONAL_USERS } from '../mockData/usersCatalog';
import { InstitutionalUser } from '../types/userManagement';
import { fetchUsersFromInsForge, authenticateWithInsForge } from '../services/userService';

export const STORAGE_USERS_KEY = 'CORPOELEC_SIGI_USERS_V1';

export const getCatalogUsers = (): InstitutionalUser[] => {
  try {
    const raw = localStorage.getItem(STORAGE_USERS_KEY);
    if (raw) {
      const parsed: InstitutionalUser[] = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
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
  login: (usernameInput: string, passwordInput: string, fallbackStateCode?: StateCode) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  setStateCode: (code: StateCode) => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  refreshUsers: () => Promise<InstitutionalUser[]>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<AuthSession>(() => {
    const saved = sessionStorage.getItem('sigi_auth_session');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error parsing stored session', e);
      }
    }
    return {
      authenticated: false,
      userCode: '',
      name: '',
      role: 'OPERADOR',
      stateCode: '01' as StateCode,
      stateName: 'Distrito Capital',
      accessTime: '',
    };
  });

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const savedTheme = sessionStorage.getItem('sigi_theme');
    return (savedTheme === 'dark' || savedTheme === 'light') ? savedTheme : 'light';
  });

  // Sincronizar catálogo con InsForge en segundo plano al montar la aplicación
  useEffect(() => {
    fetchUsersFromInsForge().then(insforgeUsers => {
      if (insforgeUsers && insforgeUsers.length > 0) {
        saveCatalogUsers(insforgeUsers);
      }
    }).catch(err => console.warn('⚠️ Sincronización pasiva de InsForge diferida:', err));
  }, []);

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

  const refreshUsers = async (): Promise<InstitutionalUser[]> => {
    const remoteUsers = await fetchUsersFromInsForge();
    if (remoteUsers && remoteUsers.length > 0) {
      saveCatalogUsers(remoteUsers);
      return remoteUsers;
    }
    return getCatalogUsers();
  };

  const login = async (usernameInput: string, passwordInput: string, fallbackStateCode?: StateCode) => {
    const trimmed = usernameInput.trim();
    const trimmedPass = passwordInput ? passwordInput.trim() : '';

    if (!trimmed || !trimmedPass) {
      return { success: false, message: 'Por favor ingrese su usuario corporativo y contraseña institucional.' };
    }

    // Intentar autenticación directa en vivo con InsForge
    const insforgeAuth = await authenticateWithInsForge(trimmed, trimmedPass);
    if (insforgeAuth.success && insforgeAuth.user) {
      const u = insforgeAuth.user;
      const targetState = u.stateCode && u.stateCode !== 'NAC' 
        ? u.stateCode 
        : (fallbackStateCode || ('01' as StateCode));
      
      const stateObj = VENEZUELAN_STATES.find((s) => s.code === u.stateCode) || 
                       VENEZUELAN_STATES.find((s) => s.code === targetState) || 
                       VENEZUELAN_STATES[0];

      const newSession: AuthSession = {
        authenticated: true,
        userCode: u.id,
        name: u.fullName,
        role: u.role,
        stateCode: targetState as StateCode,
        stateName: u.stateCode === 'NAC' ? 'Nivel Central / Nacional' : (stateObj ? stateObj.name : 'Coordinación Estadal'),
        accessTime: new Date().toLocaleTimeString(),
      };

      setSession(newSession);
      return { success: true };
    }

    // Fallback con catálogo local si no hay conexión a InsForge
    const allUsers = getCatalogUsers();
    const matchedUser = allUsers.find(
      (u) => 
        (u.username.toLowerCase() === trimmed.toLowerCase() || 
         u.email.toLowerCase() === trimmed.toLowerCase() || 
         (u.googleEmail && u.googleEmail.toLowerCase() === trimmed.toLowerCase())) &&
        (u.initialPassword === trimmedPass || u.initialPassword?.toLowerCase() === trimmedPass.toLowerCase())
    );

    if (!matchedUser) {
      return { 
        success: false, 
        message: insforgeAuth.error || 'Usuario o contraseña institucional incorrectos. Verifique sus credenciales corporativas.' 
      };
    }

    if (matchedUser.status === 'SUSPENDIDO') {
      return { success: false, message: 'Usuario temporalmente suspendido por directiva de seguridad.' };
    }

    const targetState = matchedUser.stateCode && matchedUser.stateCode !== 'NAC' 
      ? matchedUser.stateCode 
      : (fallbackStateCode || ('01' as StateCode));
    
    const stateObj = VENEZUELAN_STATES.find((s) => s.code === matchedUser.stateCode) || 
                     VENEZUELAN_STATES.find((s) => s.code === targetState) || 
                     VENEZUELAN_STATES[0];

    const newSession: AuthSession = {
      authenticated: true,
      userCode: matchedUser.id,
      name: matchedUser.fullName,
      role: matchedUser.role,
      stateCode: targetState as StateCode,
      stateName: matchedUser.stateCode === 'NAC' ? 'Nivel Central / Nacional' : (stateObj ? stateObj.name : 'Coordinación Estadal'),
      accessTime: new Date().toLocaleTimeString(),
    };

    setSession(newSession);
    return { success: true };
  };

  const logout = () => {
    setSession({
      authenticated: false,
      userCode: '',
      name: '',
      role: 'OPERADOR',
      stateCode: '01' as StateCode,
      stateName: 'Distrito Capital',
      accessTime: '',
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
    <AuthContext.Provider value={{ session, login, logout, setStateCode, theme, toggleTheme, refreshUsers }}>
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
