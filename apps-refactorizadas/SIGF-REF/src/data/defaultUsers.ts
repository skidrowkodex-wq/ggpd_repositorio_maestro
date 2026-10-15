import { VENEZUELA_STATES } from './venezuelaRegions';

export type UserRole = 'admin' | 'nacional' | 'gerente' | 'estado';

export interface SystemUser {
  email: string;
  nombre: string;
  role: UserRole;
  estadoAsignado?: string; // Solo para rol 'estado'
  cargo: string;
  avatar: string;
}

export const PREDEFINED_SYSTEM_USERS: SystemUser[] = [
  {
    email: 'bk.ggpd.corpoelec@gmail.com',
    nombre: 'Ing. Administrador SEN',
    role: 'admin',
    cargo: 'Administrador General de GGPD / Sistemas Eléctricos',
    avatar: '🛡️'
  },
  {
    email: 'nacional.corpoelec@corpoelec.gob.ve',
    nombre: 'Director Nacional de Flota',
    role: 'nacional',
    cargo: 'Supervisión Nacional - Todos los Estados',
    avatar: '🌐'
  },
  {
    email: 'gerencia.ejecutiva@corpoelec.gob.ve',
    nombre: 'Gerente General de Operaciones',
    role: 'gerente',
    cargo: 'Gerencia de Métricas, KPIs y Consolidación',
    avatar: '📊'
  },
  // Generamos un usuario por cada uno de los 24 estados de Venezuela
  ...VENEZUELA_STATES.map(st => ({
    email: `${st.codigo.toLowerCase()}.corpoelec@corpoelec.gob.ve`,
    nombre: `Coordinador Estado ${st.nombre}`,
    role: 'estado' as UserRole,
    estadoAsignado: st.nombre,
    cargo: `Jefe de Flota - Estado ${st.nombre} (${st.capital})`,
    avatar: '📍'
  }))
];

export function getUserProfile(email: string, stateOverride?: string): SystemUser {
  const cleanEmail = (email || '').trim().toLowerCase();
  const found = PREDEFINED_SYSTEM_USERS.find(u => u.email.toLowerCase() === cleanEmail);
  
  if (found) {
    if (stateOverride && found.role === 'estado') {
      return { ...found, estadoAsignado: stateOverride };
    }
    return found;
  }

  // Verificar si hay un estado guardado para esta sesión o usuario
  const storedState = typeof window !== 'undefined' ? localStorage.getItem('sen_user_state') : null;
  const resolvedState = stateOverride || storedState || 'Zulia';

  // Default fallback if custom email
  return {
    email: cleanEmail || 'usuario@corpoelec.gob.ve',
    nombre: cleanEmail ? cleanEmail.split('@')[0] : 'Operador SEN',
    role: 'estado',
    estadoAsignado: resolvedState,
    cargo: `Operador de Flota - Estado ${resolvedState}`,
    avatar: '📍'
  };
}

export function getStateUser(stateNameOrCode: string): SystemUser | undefined {
  const clean = stateNameOrCode.trim().toUpperCase();
  return PREDEFINED_SYSTEM_USERS.find(u => 
    u.role === 'estado' && (
      u.estadoAsignado?.toUpperCase() === clean ||
      u.email.toLowerCase().startsWith(clean.toLowerCase())
    )
  );
}

export function getAllStateUsers(): SystemUser[] {
  return PREDEFINED_SYSTEM_USERS.filter(u => u.role === 'estado' && Boolean(u.estadoAsignado));
}

