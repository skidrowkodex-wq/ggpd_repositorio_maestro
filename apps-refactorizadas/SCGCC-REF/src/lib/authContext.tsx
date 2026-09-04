import React, { createContext, useContext, useState } from 'react';
import { UserProfile } from '../types';
import { autenticarCredencialesInsForge } from '../services/insforgeService';

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  login: (username: string, password?: string) => Promise<boolean>;
  logout: () => void;
  availableUsers: UserProfile[];
  loginError: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = 'scgcc_user';

// Mapea la respuesta de la tabla maestra (snake_case / role_code) al UserProfile del dominio
const mapInsForgeUserToProfile = (u: NonNullable<Awaited<ReturnType<typeof autenticarCredencialesInsForge>>['user']>): UserProfile => {
  const roleCode = (u.role_code || '').toUpperCase();
  let rol: UserProfile['rol'] = 'ANALISTA';
  if (roleCode === 'ADMINISTRADOR') rol = 'ADMINISTRADOR';
  else if (roleCode === 'GERENCIA') rol = 'GERENTE';
  else if (roleCode === 'ESPECIALISTA') rol = 'SUPERVISOR';
  else if (roleCode === 'OPERADOR' || roleCode === 'AUDITOR') rol = 'AUDITOR';

  return {
    id: u.id,
    username: u.username,
    nombre: u.full_name,
    cargo: u.cargo || 'Funcionario Corporativo',
    rol,
    dependencia: u.unidad_organizativa || 'Gerencia General de Gestión de Planificación (GGPD)',
    email: u.email,
    permisoScgcc: Boolean(u.permiso_scgcc),
  };
};

const loadPersistedUser = (): UserProfile | null => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed: UserProfile = JSON.parse(raw);
    // Solo acepta sesiones que correspondan a un perfil institucional persistido
    // (no recupera resultados de autenticación local previa que carecían de id real de InsForge)
    if (parsed && parsed.id && parsed.username) return parsed;
    return null;
  } catch {
    return null;
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(loadPersistedUser);
  const [loginError, setLoginError] = useState<string | null>(null);

  const login = async (username: string, password?: string): Promise<boolean> => {
    const clean = username.trim();
    if (!clean || !password) {
      setLoginError('Por favor ingrese su usuario y contraseña institucional.');
      return false;
    }

    setLoginError(null);
    const result = await autenticarCredencialesInsForge(clean, password, 'SCGCC');
    if (!result.success || !result.user) {
      setLoginError(result.error || 'Credenciales inválidas o sin permisos en SCGCC.');
      return false;
    }

    const profile = mapInsForgeUserToProfile(result.user);
    setUser(profile);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    return true;
  };

  const logout = () => {
    setUser(null);
    setLoginError(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout, availableUsers: [], loginError }}>
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
