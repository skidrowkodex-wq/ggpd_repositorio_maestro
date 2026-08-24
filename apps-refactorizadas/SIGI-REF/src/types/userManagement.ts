import { StateCode } from './sigi';

export type UserSystemRole = 'ADMINISTRADOR' | 'GERENCIA' | 'ESPECIALISTA' | 'ANALISTA' | 'OPERADOR' | 'AUDITOR' | 'VISOR_ESTADAL';

export interface AppAccessPermissions {
  sctis: boolean;        // App 1: SCTIS V2.0 - Seguimiento y Control de Tiras de Interrupciones
  tareasMinutas: boolean;// App 2: SCMTP V2.0 - Seguimiento y Control de Minutas y Tareas de Planificacion
  planificacion: boolean;// App 3: SCPPE V3.0 - Seguimiento y Control de Planes y Proyectos Especiales de Distribucion
  scein: boolean;        // App 4: SCEIN V3.0 - Seguimiento y Control de Equipos Indisponibles
  gdriveRepo: boolean;   // App 5: Repositorio Cloud Google Drive GGPD
}

export interface InstitutionalUser {
  id: string;
  username: string;
  fullName: string;
  email: string;             // Correo Corporativo CORPOELEC (@corpoelec.gob.ve)
  googleEmail?: string;       // Cuenta Google / Repositorio Nube (@gmail.com o vinculada)
  role: UserSystemRole;
  stateCode: StateCode;
  unit: string;
  status: 'ACTIVO' | 'SUSPENDIDO' | 'EN_REVISION';
  initialPassword?: string;
  permissions: AppAccessPermissions;
  lastLogin?: string;
}

export type AccessRequestStatus = 'PENDIENTE' | 'APROBADO' | 'RECHAZADO' | 'EXPIRADO';
export type DriveRoleLevel = 'VIEWER' | 'EDITOR';

export interface DriveAccessRequest {
  id: string;
  userId: string;
  username: string;
  fullName: string;
  email: string;
  googleEmail: string;
  role: UserSystemRole;
  stateCode: StateCode;
  requestDate: string;
  reason: string;
  requestedLevel: DriveRoleLevel;
  status: AccessRequestStatus;
  reviewedBy?: string;
  reviewedDate?: string;
  reviewNotes?: string;
  ttlDays?: number;          // Expiración en días (ej: 30, 90, 0 = permanente)
  webhookDispatched?: boolean;
}

export interface GoogleDriveWebhookConfig {
  webhookUrl: string;
  targetFolderId: string;
  accountEmail: string;
  lastSync?: string;
  autoRevokeOnDeactivate: boolean;
}
