import { StateCode } from './sigi';

export type UserSystemRole = 'ADMINISTRADOR' | 'GERENCIA' | 'ESPECIALISTA' | 'ANALISTA' | 'OPERADOR' | 'AUDITOR';

export interface AppAccessPermissions {
  sctis: boolean;        // App 1: SCTIS v2.0 Interrupciones
  tareasMinutas: boolean;// App 2: Gestor de Tareas y Minutas
  planificacion: boolean; // App 3: Planificación Eléctrica SEN & Viáticos
  scein: boolean;        // App 4: REMIX SCEIN Equipos Indisponibles
}

export interface InstitutionalUser {
  id: string;
  username: string;
  fullName: string;
  email: string;
  role: UserSystemRole;
  stateCode: StateCode;
  unit: string;
  status: 'ACTIVO' | 'SUSPENDIDO' | 'EN_REVISION';
  initialPassword?: string;
  permissions: AppAccessPermissions;
  lastLogin?: string;
}
