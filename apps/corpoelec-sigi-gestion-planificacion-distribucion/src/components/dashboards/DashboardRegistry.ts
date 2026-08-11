import React from 'react';
import { IntegratedDashboard } from './IntegratedDashboard';
import { AssetsMapDashboard } from './AssetsMapDashboard';
import { 
  SCTISDashboard, 
  SGTADashboard, 
  PlanificacionDashboard, 
  SCEINDashboard 
} from './AppSpecificDashboards';
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
    title: 'SCTIS v2.0 - Interrupciones',
    shortName: 'SCTIS',
    icon: Cpu,
    component: SCTISDashboard,
    colorTheme: 'emerald',
  },
  {
    id: 'planificacion',
    title: 'Planificación SEN & Presupuesto',
    shortName: 'Planif.',
    icon: BarChart3,
    component: PlanificacionDashboard,
    colorTheme: 'purple',
  },
  {
    id: 'sgta',
    title: 'SGTA - Gestor de Tareas y Minutas',
    shortName: 'Tareas',
    icon: FileText,
    component: SGTADashboard,
    colorTheme: 'blue',
  },
  {
    id: 'scein',
    title: 'REMIX SCEIN - Equipos Indisponibles',
    shortName: 'SCEIN',
    icon: Zap,
    component: SCEINDashboard,
    colorTheme: 'amber',
  },
];
