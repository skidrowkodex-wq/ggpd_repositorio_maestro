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

export const INITIAL_MINUTAS: MinutaItem[] = [
  {
    id: 'minuta-26-0004',
    code: 'NAC_2026_GGPD_MINUTA_26_0004_V01',
    title: 'Minuta #26-0004: Revisión del Plan de Contingencia y Transición a Formularios Automatizados',
    date: '2026-07-30',
    stateCode: 'NAC',
    category: 'Planificación Nacional / Contingencia',
    summary: 'Revisión del Plan de Contingencia de la GGPD por afectaciones del evento sísmico del 24/06/2026; transición definitiva hacia formularios automatizados y normalización de datos.',
    driveUrl: 'https://drive.google.com/drive/folders/1mnnChue2IUqOh5Or99_v2LiJ3TaRJvy7',
    downloadAllowedMinRole: 'ANALISTA',
    keyAgreements: [
      'Implementar plan de seguimiento estadal para depuración de datos bajo ISO 8000.',
      'Centralizar avances en el repositorio nube estructurado por estado y proceso.',
      'Estandarización de catálogo de fallas e interrupciones en SCTIS v2.0.',
      'Normalización de 871 subestaciones y 4,207 circuitos en base de datos canónica.',
      'Publicación de la Guía de Nomenclatura y Codificación de Archivos GGPD.'
    ]
  },
  {
    id: 'minuta-26-0002',
    code: 'NAC_2026_GGPD_MINUTA_26_0002_V01',
    title: 'Minuta #26-0002: Implementación de Plan de Contingencia GGPD',
    date: '2026-06-29',
    stateCode: 'NAC',
    category: 'Gestión de Emergencia / Resiliencia',
    summary: 'Implementación del plan de contingencia operativa de la Gerencia de Planificación de Distribución tras afectaciones estructurales en instalaciones centrales.',
    driveUrl: 'https://drive.google.com/drive/folders/1mnnChue2IUqOh5Or99_v2LiJ3TaRJvy7',
    downloadAllowedMinRole: 'ANALISTA',
    keyAgreements: [
      'Activación de trabajo remoto y sede alterna (Chacao) validada.',
      'Reasignación de recursos tecnológicos prioritarios para despliegue de plataforma.',
      'Establecimiento de enlaces de emergencia en los 6 estados sensibles.',
      'Configuración de cuentas de correo y repositorio en la nube temporal.',
      'Elaboración de la matriz preliminar de recuperación del SEN.'
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
    id: 'doc-000',
    code: 'NAC_2026_GGPD_INFORME_ARQUITECTURA_GOBERNANZA_ACCESOS_SIGI_V01',
    title: 'Informe Técnico: Arquitectura de Autenticación No Invasiva y Gobernanza de Accesos SIGI',
    category: 'Normativa e ISO 8000',
    stateCode: 'NAC',
    fileType: 'pdf',
    driveEmbedUrl: 'https://docs.google.com/document/d/e/2PACX-1vT_dummy_informe_gobernanza_sigi/pub?embedded=true',
    downloadAllowedRoles: ['OPERADOR', 'ANALISTA', 'GERENCIA', 'ADMINISTRADOR'],
    updatedAt: '2026-08-14',
    author: 'Área de Tecnología y Desarrollo (GGPD)'
  },
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
