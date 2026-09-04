import { VenezuelanState, AppItem } from '../types/sigi';

export const VENEZUELAN_STATES: VenezuelanState[] = [
  { code: 'NAC', name: 'Consolidado Nacional', region: 'República Bolivariana de Venezuela', circuitsCount: 2480, activeAutomations: 142 },
  { code: 'ZUL', name: 'Zulia', region: 'Occidente', circuitsCount: 320, activeAutomations: 24 },
  { code: 'DCA', name: 'Distrito Capital', region: 'Capital', circuitsCount: 210, activeAutomations: 18 },
  { code: 'CAR', name: 'Carabobo', region: 'Central', circuitsCount: 195, activeAutomations: 14 },
  { code: 'MIR', name: 'Miranda', region: 'Capital', circuitsCount: 230, activeAutomations: 16 },
  { code: 'LAR', name: 'Lara', region: 'Centro Occidente', circuitsCount: 160, activeAutomations: 11 },
  { code: 'ARA', name: 'Aragua', region: 'Central', circuitsCount: 155, activeAutomations: 10 },
  { code: 'BOL', name: 'Bolívar', region: 'Guayana', circuitsCount: 140, activeAutomations: 9 },
  { code: 'ANZ', name: 'Anzoátegui', region: 'Oriente', circuitsCount: 150, activeAutomations: 8 },
  { code: 'BAR', name: 'Barinas', region: 'Los Andes', circuitsCount: 95, activeAutomations: 5 },
  { code: 'FAL', name: 'Falcón', region: 'Occidente', circuitsCount: 110, activeAutomations: 6 },
  { code: 'MER', name: 'Mérida', region: 'Los Andes', circuitsCount: 85, activeAutomations: 4 },
  { code: 'TAC', name: 'Táchira', region: 'Los Andes', circuitsCount: 105, activeAutomations: 5 },
  { code: 'TRU', name: 'Trujillo', region: 'Los Andes', circuitsCount: 75, activeAutomations: 3 },
  { code: 'POR', name: 'Portuguesa', region: 'Llanos', circuitsCount: 90, activeAutomations: 4 },
  { code: 'COJ', name: 'Cojedes', region: 'Llanos', circuitsCount: 55, activeAutomations: 2 },
  { code: 'GUA', name: 'Guárico', region: 'Llanos', circuitsCount: 85, activeAutomations: 3 },
  { code: 'SUC', name: 'Sucre', region: 'Oriente', circuitsCount: 80, activeAutomations: 3 },
  { code: 'MON', name: 'Monagas', region: 'Oriente', circuitsCount: 95, activeAutomations: 4 },
  { code: 'APU', name: 'Apure', region: 'Llanos', circuitsCount: 45, activeAutomations: 2 },
  { code: 'NES', name: 'Nueva Esparta', region: 'Insular', circuitsCount: 65, activeAutomations: 4 },
  { code: 'DEL', name: 'Delta Amacuro', region: 'Guayana', circuitsCount: 25, activeAutomations: 1 },
  { code: 'AMA', name: 'Amazonas', region: 'Guayana', circuitsCount: 20, activeAutomations: 1 },
  { code: 'LGU', name: 'La Guaira', region: 'Capital', circuitsCount: 70, activeAutomations: 5 },
  { code: 'YAR', name: 'Yaracuy', region: 'Centro Occidente', circuitsCount: 88, activeAutomations: 4 },
  { code: 'GEQ', name: 'Guayana Esequiba', region: 'Guayana', circuitsCount: 15, activeAutomations: 1 }
];

export const SYSTEM_APPS: AppItem[] = [
  {
    id: 'sctis',
    name: 'SCTIS V2.0 - Seguimiento y Control de Tiras de Interrupciones',
    description: 'Sistema de Ingesta, Deduplicación y Gobierno de Activos Eléctricos (Subestaciones y Circuitos).',
    category: 'APLICACION_MAESTRA',
    url: 'https://corpoelec-sctis-corpoelec-ggpd-hosting-apps.vibehost.space',
    iconName: 'Cpu',
    isCloud: false,
    badgeText: 'Producción ISO 8000'
  },
  {
    id: 'planificacion-sen',
    name: 'SCPPE V3.0 - Seguimiento y Control de Planes y Proyectos Especiales de Distribucion',
    description: 'Modelado analítico, proyección de capacidad, proyectos POA y viáticos de campo del SEN.',
    category: 'APLICACION_MAESTRA',
    url: 'https://corpoelec-scppe-corpoelec-ggpd-hosting-apps.vibehost.space',
    iconName: 'Zap',
    isCloud: false,
    badgeText: 'IA Gemini 3.6'
  },
  {
    id: 'scein',
    name: 'SCEIN V3.0 - Seguimiento y Control de Equipos Indisponibles',
    description: 'Seguimiento y control operativo en tiempo real de transformación y bahías fuera de servicio.',
    category: 'APLICACION_MAESTRA',
    url: 'https://corpoelec-scein-corpoelec-ggpd-hosting-apps.vibehost.space',
    iconName: 'AlertTriangle',
    isCloud: false,
    badgeText: 'Alerta Operativa'
  },
  {
    id: 'minutas-app',
    name: 'SCMTP V2.0 - Seguimiento y Control de Minutas y Tareas de Planificacion',
    description: 'Administración de compromisos, minutas de reuniones de planificación y acuerdos institucionales.',
    category: 'APLICACION_MAESTRA',
    url: 'https://corpoelec-scmtp-corpoelec-ggpd-hosting-apps.vibehost.space',
    iconName: 'ClipboardList',
    isCloud: false,
    badgeText: 'Auditoría COBIT'
  },
  {
    id: 'scgcc',
    name: 'SCGCC V1.0 - Gestión de Correspondencia & Despacho GGPD',
    description: 'Radicación digital, redacción asistida con IA, bandeja de firmas y ficha ejecutiva 360°.',
    category: 'APLICACION_MAESTRA',
    url: 'https://corpoelec-scgcc-corpoelec-ggpd-hosting-apps.vibehost.space',
    iconName: 'FileText',
    isCloud: false,
    badgeText: 'Protocolo 2026'
  },
  {
    id: 'gdrive-ggpd',
    name: 'Repositorio Google Drive Corporativo',
    description: 'Buzón institucional unificado de carpetas, minutas en vivo y matrices de distribución en la nube.',
    category: 'NUBE_AUTOMATIZACION',
    url: 'https://drive.google.com/drive/folders/1mnnChue2IUqOh5Or99_v2LiJ3TaRJvy7',
    iconName: 'FolderCloud',
    isCloud: true,
    badgeText: 'Cloud Oficial'
  },
  {
    id: 'webhooks-nube',
    name: 'Consola de Automatizaciones Nube',
    description: 'Disparadores y bots automatizados para actualización de inventarios y alertas por correo.',
    category: 'NUBE_AUTOMATIZACION',
    url: 'https://script.google.com/macros/s/AKfycbxonVU31GBXuVCfu_5G8hmADkYFB7yriPJVt2nS9w7uMjsERu5_WPzpQSVbuB2kvtQkqA/exec',
    iconName: 'Bot',
    isCloud: true,
    badgeText: 'Solo Administrador'
  }
];
