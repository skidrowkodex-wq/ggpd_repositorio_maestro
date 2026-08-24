import { execSync } from 'child_process';
import https from 'https';
import fs from 'fs';
import path from 'path';

// Las credenciales se leen de variables de entorno para cumplimiento ISO 27001
const TOKEN_A = process.env.GITHUB_TOKEN_PERSONAL || '';
const TOKEN_B = process.env.GITHUB_TOKEN_INNOVACION || '';

const ACCOUNTS = [
  {
    username: 'skidrowkodex-wq',
    token: TOKEN_A,
    label: 'Cuenta Personal / Master (skidrowkodex-wq)'
  },
  {
    username: 'distribucion-corpoelec-automatizacion',
    token: TOKEN_B,
    label: 'Cuenta Institucional / Innovación (distribucion-corpoelec-automatizacion)'
  }
];

const APPS = [
  {
    dirName: 'SIGI-REF',
    repoName: 'SIGI-REF',
    description: 'Sistema Integral de Gestión de Información (SIGI) Refactorizado - Portal Maestro CORPOELEC GGPD (InsForge BaaS)',
  },
  {
    dirName: 'SCTIS-REF',
    repoName: 'SCTIS-V2.0-REF',
    description: 'Sistema de Control de Tiras de Interrupción (SCTIS v2.0) Refactorizado - CORPOELEC GGPD (InsForge BaaS)',
  },
  {
    dirName: 'SCMTP-REF',
    repoName: 'SCMTP-V2.0-REF',
    description: 'Seguimiento y Control de Minutas y Tareas de Planificación (SCMTP v2.0) Refactorizado - CORPOELEC GGPD (InsForge BaaS)',
  },
  {
    dirName: 'SCPPE-REF',
    repoName: 'SCPPE-V3.0-REF',
    description: 'Seguimiento y Control de Planes, Proyectos Especiales y Viáticos (SCPPE v3.0) Refactorizado - CORPOELEC GGPD (InsForge BaaS)',
  },
  {
    dirName: 'SCEIN-REF',
    repoName: 'SCEIN-V3.0-REF',
    description: 'Seguimiento y Control de Equipos Indisponibles (SCEIN v3.0) Refactorizado - CORPOELEC GGPD (InsForge BaaS)',
  }
];

console.log('Script de sincronización de repositorios GitHub preparado.');
