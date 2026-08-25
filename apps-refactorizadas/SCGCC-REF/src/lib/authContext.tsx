import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { INITIAL_USERS } from '../data/initialCorrespondencias';

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  login: (username: string, password?: string) => Promise<boolean>;
  logout: () => void;
  availableUsers: UserProfile[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('scgcc_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    return null;
  });

  const login = async (username: string, _password?: string): Promise<boolean> => {
    const clean = username.trim().toLowerCase();
    const found = INITIAL_USERS.find(
      u => u.username.toLowerCase() === clean || 
           u.email.toLowerCase() === clean ||
           u.id.toLowerCase() === clean
    );
    if (found) {
      setUser(found);
      localStorage.setItem('scgcc_user', JSON.stringify(found));
      return true;
    }
    // Fallback para usuarios del catálogo institucional
    const genericUser: UserProfile = {
      id: `usr-${Date.now()}`,
      username: clean.includes('@') ? clean.split('@')[0] : clean,
      nombre: clean.includes('@') ? clean.split('@')[0].replace('.', ' ').toUpperCase() : clean.toUpperCase(),
      cargo: 'Especialista de Correspondencia',
      rol: clean.includes('admin') ? 'ADMINISTRADOR' : 'ANALISTA',
      dependencia: 'Gerencia General de Gestión de Planificación (GGPD)',
      email: clean.includes('@') ? clean : `${clean}@corpoelec.gob.ve`,
      permisoScgcc: true
    };
    setUser(genericUser);
    localStorage.setItem('scgcc_user', JSON.stringify(genericUser));
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('scgcc_user');
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout, availableUsers: INITIAL_USERS }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};
