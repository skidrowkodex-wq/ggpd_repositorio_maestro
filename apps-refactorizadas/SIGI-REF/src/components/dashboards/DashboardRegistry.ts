import React from 'react';
import { IntegratedDashboard } from './IntegratedDashboard';
import { AssetsMapDashboard } from './AssetsMapDashboard';
import { 
  SCTISDashboard, 
  PlanificacionDashboard, 
  SCEINDashboard 
} from './AppSpecificDashboards';
import { SCMTPDashboard } from './SCMTPDashboard';
import { 
  BarChart3, 
  Cpu, 
  FileText, 
  Zap, 
  MapPin, 
  Activity 
} from 'lucide-react';

export interface DashboardDefinition {
  id: string;
  title: string;
  shortName: string;
  icon: React.ElementType;
  component: React.FC;
  colorTheme: string;
}

// Arquitectura Plug & Play para nuevos Dashboards
export const DASHBOARD_REGISTRY: DashboardDefinition[] = [
  {
    id: 'integrated',
    title: 'Dashboard Integrado (Resumen Nacional)',
    shortName: 'General',
    icon: Activity,
    component: IntegratedDashboard,
    colorTheme: 'blue',
  },
  {
    id: 'activos',
    title: 'Visor de Activos de Red y Mapas',
    shortName: 'Activos',
    icon: MapPin,
    component: AssetsMapDashboard,
    colorTheme: 'amber',
  },
  {
    id: 'sctis',
    title: 'SCTIS V2.0 - Seguimiento y Control de Tiras de Interrupciones',
    shortName: 'SCTIS V2.0',
    icon: Cpu,
    component: SCTISDashboard,
    colorTheme: 'emerald',
  },
  {
    id: 'planificacion',
    title: 'SCPPE V3.0 - Seguimiento y Control de Planes y Proyectos Especiales de Distribucion',
    shortName: 'SCPPE V3.0',
    icon: BarChart3,
    component: PlanificacionDashboard,
    colorTheme: 'purple',
  },
  {
    id: 'sgta',
    title: 'SCMTP V2.0 - Seguimiento y Control de Minutas y Tareas de Planificación',
    shortName: 'SCMTP V2.0',
    icon: FileText,
    component: SCMTPDashboard,
    colorTheme: 'blue',
  },
  {
    id: 'scein',
    title: 'SCEIN V3.0 - Seguimiento y Control de Equipos Indisponibles',
    shortName: 'SCEIN V3.0',
    icon: Zap,
    component: SCEINDashboard,
    colorTheme: 'amber',
  },
];
