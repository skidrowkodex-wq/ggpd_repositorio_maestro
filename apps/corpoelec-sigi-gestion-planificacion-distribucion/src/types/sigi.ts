export type UserRole = 'ADMINISTRADOR' | 'GERENCIA' | 'ESPECIALISTA' | 'ANALISTA' | 'OPERADOR' | 'AUDITOR' | 'VISOR_ESTADAL';

export type StateCode =
  | '01' | '02' | '03' | '04' | '05' | '06' | '07'
  | '08' | '09' | '10' | '11' | '12' | '13' | '14'
  | '15' | '16' | '17' | '18' | '19' | '20' | '21'
  | '22' | '23' | '24'
  | 'NAC' | 'ZUL' | 'DCA' | 'CAR' | 'MIR' | 'LAR' | 'ARA'
  | 'BOL' | 'ANZ' | 'BAR' | 'FAL' | 'MER' | 'TAC' | 'TRU'
  | 'POR' | 'COJ' | 'GUA' | 'SUC' | 'MON' | 'APU' | 'NES'
  | 'DEL' | 'AMA' | 'LGU' | 'YAR' | 'GEQ';

export interface VenezuelanState {
  code: StateCode;
  name: string;
  region: string;
  circuitsCount: number;
  activeAutomations: number;
}

export interface UserSession {
  authenticated: boolean;
  userCode?: string;
  name?: string;
  role: UserRole;
  stateCode: StateCode;
  stateName: string;
  accessTime?: string;
}

export type AuthSession = UserSession;

export interface AppItem {
  id: string;
  name: string;
  description: string;
  category: 'APLICACION_MAESTRA' | 'NUBE_AUTOMATIZACION' | 'REPOSITORIO';
  url: string;
  iconName: string;
  isCloud: boolean;
  requiredRole?: UserRole[];
  status?: 'ONLINE' | 'MANTENIMIENTO' | 'BETA';
  badgeText?: string;
}

export interface DocumentItem {
  id: string;
  code: string;
  title: string;
  fileType: 'pdf' | 'spreadsheet' | 'doc';
  stateCode: StateCode;
  driveEmbedUrl: string;
  author: string;
  updatedAt: string;
  downloadAllowedRoles: UserRole[];
  category?: string;
}

export interface TechnicalMinuta {
  id: string;
  code: string;
  title: string;
  date: string;
  stateCode: StateCode;
  author?: string;
  agreements?: string[];
  status?: 'PENDIENTE' | 'EN_PROCESO' | 'CUMPLIDO';
  summary?: string;
  category?: string;
  keyAgreements?: string[];
  driveUrl?: string;
  downloadAllowedMinRole?: UserRole;
}

export type MinutaItem = TechnicalMinuta;

export interface ProcessMetric {
  id: string;
  name: string;
  value: number;
  target: number;
  unit: string;
  stateCode: StateCode;
  category: string;
  change: string;
  trend: 'up' | 'down';
}
