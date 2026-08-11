import { VenezuelanState, AppItem, MinutaItem, ProcessMetric, DocumentItem } from '../types/sigi';

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
  { code: 'GEQ', name: 'Guayana Esequiba', region: 'Guayana', circuitsCount: 15, activeAutomations: 1 }
];

export const SYSTEM_APPS: AppItem[] = [
  {
    id: 'sctis',
    name: 'SCTIS v2.0 Distribución',
    description: 'Sistema de Ingesta, Deduplicación y Gobierno de Activos Eléctricos (Subestaciones y Circuitos).',
    category: 'APLICACION_MAESTRA',
    url: 'https://corpoelec-sctis-v2-distribucion.vercel.app',
    iconName: 'Cpu',
    isCloud: false,
    badgeText: 'Producción ISO 8000'
  },
  {
    id: 'planificacion-sen',
    name: 'Planificación Eléctrica SEN',
    description: 'Modelado analítico y proyección de capacidad de distribución del Sistema Eléctrico Nacional.',
    category: 'APLICACION_MAESTRA',
    url: 'https://corpoelec-planificacion-sen.vercel.app',
    iconName: 'Zap',
    isCloud: false,
    badgeText: 'IA Gemini 3.6'
  },
  {
    id: 'scein',
    name: 'SCEIN Equipos Indisponibles',
    description: 'Seguimiento y control operativo en tiempo real de transformación y bahías fuera de servicio.',
    category: 'APLICACION_MAESTRA',
    url: 'https://corpoelec-scein-indisponibles.vercel.app',
    iconName: 'AlertTriangle',
    isCloud: false,
    badgeText: 'Alerta Operativa'
  },
  {
    id: 'minutas-app',
    name: 'Gestor de Tareas y Minutas GGPD',
    description: 'Administración de compromisos, minutas de reuniones de planificación y acuerdos institucionales.',
    category: 'APLICACION_MAESTRA',
    url: 'https://corpoelec-gestor-minutas.vercel.app',
    iconName: 'ClipboardList',
    isCloud: false,
    badgeText: 'Auditoría COBIT'
  },
  {
    id: 'gdrive-ggpd',
    name: 'Repositorio Google Drive Corporativo',
    description: 'Buzón institucional unificado de carpetas, minutas en vivo y matrices de distribución en la nube.',
    category: 'NUBE_AUTOMATIZACION',
    url: 'https://drive.google.com/drive/folders/ggpd-corpoelec-oficial',
    iconName: 'FolderCloud',
    isCloud: true,
    badgeText: 'Cloud Oficial'
  },
  {
    id: 'webhooks-nube',
    name: 'Consola de Automatizaciones Nube',
    description: 'Disparadores y bots automatizados para actualización de inventarios y alertas por correo.',
    category: 'NUBE_AUTOMATIZACION',
    url: 'https://script.google.com/macros/s/ggpd-corpoelec-automations',
    iconName: 'Bot',
    isCloud: true,
    badgeText: 'Zero-WhatsApp'
  }
];

export const INITIAL_MINUTAS: MinutaItem[] = [
  {
    id: 'min-001',
    code: 'NAC_2026_GGPD_MINUTA_PLANIFICACION_CUATRIMESTRAL_V01',
    title: 'Minuta de Coordinación Nacional de Planificación de Distribución Q3-2026',
    date: '2026-08-05',
    stateCode: 'NAC',
    category: 'Planificación Nacional',
    summary: 'Aprobación del plan de incorporación de 45 nuevos transformadores de potencia y migracion de reportes al cloud.',
    driveUrl: 'https://docs.google.com/document/d/1_sigi_ggpd_minuta_nacional_2026/preview',
    downloadAllowedMinRole: 'ANALISTA',
    keyAgreements: [
      'Prohibición del envío de reportes críticos vía WhatsApp a partir del 15-Ago-2026.',
      'Sincronización obligatoria de inventarios de subestaciones en SCTIS v2.0.',
      'Aprobación de la matriz de contingencia para la Región Occidental (Zulia/Falcón).'
    ]
  },
  {
    id: 'min-002',
    code: 'ZUL_2026_GGPD_MINUTA_PLAN_ESTABILIZACION_RED_V01',
    title: 'Minuta de Trabajo Regional Zulia - Plan de Alivio de Carga y Automatismo 13.8kV',
    date: '2026-08-08',
    stateCode: 'ZUL',
    category: 'Gestión Regional',
    summary: 'Evaluación técnica del esquema de corte programado y reemplazo de interruptores de SF6 en SE Cuatricentenario.',
    driveUrl: 'https://docs.google.com/document/d/1_sigi_ggpd_minuta_zulia_2026/preview',
    downloadAllowedMinRole: 'ANALISTA',
    keyAgreements: [
      'Despliegue del sensor inteligente en circuitos críticos de Maracaibo.',
      'Actualización diaria del reporte en la plataforma nube SIGI.'
    ]
  },
  {
    id: 'min-003',
    code: 'DCA_2026_GGPD_MINUTA_MANTENIMIENTO_SUBESTACIONES_V01',
    title: 'Minuta de Inspección Subestaciones Blindadas Distrito Capital',
    date: '2026-08-09',
    stateCode: 'DCA',
    category: 'Mantenimiento Preventivo',
    summary: 'Minuta del comité de seguimiento a subestaciones blindadas GIS en el anillo 69kV de Caracas.',
    driveUrl: 'https://docs.google.com/document/d/1_sigi_ggpd_minuta_dca_2026/preview',
    downloadAllowedMinRole: 'GERENCIA',
    keyAgreements: [
      'Validación de la prueba de rigidez dieléctrica de aceite en transformadores T1 y T2.',
      'Subida de minutas escaneadas al Google Drive institucional con firma digital.'
    ]
  }
];

export const INITIAL_METRICS: ProcessMetric[] = [
  {
    id: 'met-001',
    name: 'Disponibilidad de Circuitos de Distribución',
    category: 'Operatividad de Red',
    value: 96.8,
    target: 98.5,
    unit: '%',
    change: '+1.4%',
    stateCode: 'NAC',
    trend: 'up'
  },
  {
    id: 'met-002',
    name: 'Tasa de Migración a Procesos Nube (Zero-WhatsApp)',
    category: 'Automatización y Gobierno',
    value: 88.2,
    target: 95.0,
    unit: '%',
    change: '+12.5%',
    stateCode: 'NAC',
    trend: 'up'
  },
  {
    id: 'met-003',
    name: 'Equipos Indisponibles en Proceso de Sustitución',
    category: 'Mantenimiento',
    value: 14,
    target: 8,
    unit: 'Equipos',
    change: '-3',
    stateCode: 'ZUL',
    trend: 'up'
  },
  {
    id: 'met-004',
    name: 'Cumplimiento de Minutas y Acuerdos de Planificación',
    category: 'Gobernanza',
    value: 94.0,
    target: 90.0,
    unit: '%',
    change: '+4.0%',
    stateCode: 'DCA',
    trend: 'up'
  }
];

export const INITIAL_DOCUMENTS: DocumentItem[] = [
  {
    id: 'doc-001',
    code: 'NAC_2026_GGPD_MANUAL_GOBIERNO_DATOS_DISTRIBUCION_V01',
    title: 'Manual de Normas de Gobierno de Datos e Ingesta Nube GGPD 2026',
    category: 'Normativa e ISO 8000',
    stateCode: 'NAC',
    fileType: 'pdf',
    driveEmbedUrl: 'https://docs.google.com/document/d/e/2PACX-1vT_dummy_manual_gobierno/pub?embedded=true',
    downloadAllowedRoles: ['ANALISTA', 'GERENCIA'],
    updatedAt: '2026-08-01',
    author: 'Gerencia Nacional de Planificación'
  },
  {
    id: 'doc-002',
    code: 'NAC_2026_GGPD_MATRIZ_AUTOMATISMOS_DISTRIBUCION_V01',
    title: 'Matriz Nacional de Automatismos y Webhooks por Estado Geográfico',
    category: 'Automatización',
    stateCode: 'NAC',
    fileType: 'spreadsheet',
    driveEmbedUrl: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vS_dummy_matriz_automatismos/pubhtml?widget=true&amp;headers=false',
    downloadAllowedRoles: ['GERENCIA'],
    updatedAt: '2026-08-07',
    author: 'Unidad de Automatización Nube'
  },
  {
    id: 'doc-003',
    code: 'ZUL_2026_GGPD_ESQUEMA_CIRCUITOS_CRITICOS_V01',
    title: 'Esquema de Protecciones y Cargas del Estado Zulia 2026',
    category: 'Planificación Eléctrica',
    stateCode: 'ZUL',
    fileType: 'pdf',
    driveEmbedUrl: 'https://docs.google.com/document/d/e/2PACX-1vR_dummy_zulia_circuitos/pub?embedded=true',
    downloadAllowedRoles: ['OPERADOR', 'ANALISTA', 'GERENCIA'],
    updatedAt: '2026-08-10',
    author: 'Coordinación Zulia'
  }
];
