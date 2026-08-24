export interface ParticipanteMinuta {
  nombre: string;
  unidadOrganizativa: string;
  asistio: boolean;
  observacion?: string;
}

export interface HistorialAvance {
  id: string;
  fecha: string;
  nota: string;
  porcentaje: number;
  usuario: string;
}

export interface TareaCompromisoSCTAP {
  id: string;
  minutaNumero: string;
  minutaFecha: string;
  responsable: string;
  compromiso: string;
  plazoText: string;
  plazoFechaISO: string;
  vinculacionOrigen: string;
  estado: 'Pendiente' | 'En Proceso' | 'Validacion' | 'Completado';
  prioridad: 'Alta' | 'Media' | 'Baja';
  avancePorcentaje: number;
  areaGestion: string;
  observaciones: string;
  historialAvances: HistorialAvance[];
  createdAt: string;
  updatedAt: string;
}

export interface PendienteAreaSCTAP {
  id: string;
  area: string;
  pendiente: string;
  dependeDe: string;
  estado: 'Pendiente' | 'En Proceso' | 'Completado';
  observacion: string;
}

export interface MinutaReunionSCTAP {
  id: string;
  numero: string;
  code: string;
  fecha: string;
  fechaISO: string;
  hora: string;
  lugar: string;
  coordinador: string;
  unidadOrganizativa: string;
  objetivo: string;
  participantes: ParticipanteMinuta[];
  compromisosCount: number;
  pendientesCount: number;
  proximaFechaSeguimiento: string;
  elaboradoPor: string;
  nombreArchivo: string;
  driveUrl: string;
  stateCode: 'NAC' | 'DCA';
}

export const MINUTA_26_0004: MinutaReunionSCTAP = {
  id: 'minuta-26-0004',
  numero: '26-0004',
  code: 'NAC_2026_GGPD_MINUTA_26_0004_V01',
  fecha: '30/07/2026',
  fechaISO: '2026-07-30',
  hora: '10:00 a.m.',
  lugar: 'CARACAS',
  coordinador: 'Ing. Adrián Correa',
  unidadOrganizativa: 'GERENCIA DE GESTIÓN DE PLANIFICACIÓN DE DISTRIBUCIÓN',
  objetivo: 'REVISIÓN DEL PLAN DE CONTINGENCIA DE LA GERENCIA DE GESTIÓN DE PLANIFICACIÓN DE DISTRIBUCIÓN POR AFECTACIONES CONSECUENCIA DEL TERREMOTO OCURRIDO EL 24/06/2026; TRANSICIÓN DEFINITIVA HACIA FORMULARIOS AUTOMATIZADOS Y NORMALIZACIÓN DE DATOS. (MODALIDAD VIDEOCONFERENCIA VIA GOOGLE MEET)',
  participantes: [
    { nombre: 'Adrián Correa', unidadOrganizativa: 'Jefe de la División de Planificación', asistio: true },
    { nombre: 'Arturo García', unidadOrganizativa: 'Grupo de Seguimiento y Control', asistio: true },
    { nombre: 'Blanca González', unidadOrganizativa: 'Asistente del Gerente', asistio: true },
    { nombre: 'Caterina Fabio', unidadOrganizativa: 'División de Planificación', asistio: true },
    { nombre: 'Dayais E. Blanco', unidadOrganizativa: 'División de Planificación', asistio: true },
    { nombre: 'Esteban Castro', unidadOrganizativa: 'Grupo de Seguimiento y Control', asistio: true },
    { nombre: 'Jaime Bencomo', unidadOrganizativa: 'División de Planificación', asistio: true },
    { nombre: 'Jorge Jiménez', unidadOrganizativa: 'Grupo de Seguimiento y Control', asistio: true },
    { nombre: 'Josué Pacheco', unidadOrganizativa: 'Grupo de Seguimiento y Control', asistio: true },
    { nombre: 'Michael Brito', unidadOrganizativa: 'Grupo de Seguimiento y Control', asistio: true },
    { nombre: 'Walter Prato', unidadOrganizativa: 'División de Planificación', asistio: true },
    { nombre: 'Yván Cipirán', unidadOrganizativa: 'Gerencia Gestión de Planificación', asistio: true },
    { nombre: 'Carlos H. Reyes A.', unidadOrganizativa: 'Gerente Gestión de Planificación', asistio: false, observacion: 'POA' },
    { nombre: 'Jasmín Parra', unidadOrganizativa: 'Grupo de Seguimiento y Control', asistio: false, observacion: 'Vacaciones' },
    { nombre: 'Josser Parra', unidadOrganizativa: 'Grupo de Seguimiento y Control', asistio: false, observacion: 'Vacaciones' }
  ],
  compromisosCount: 17,
  pendientesCount: 7,
  proximaFechaSeguimiento: '14/08/2026',
  elaboradoPor: 'Resumen de Notas Meet de Gemini IA Google / Josué Pacheco - Grupo de Seguimiento y Control',
  nombreArchivo: 'MINUTA_20260730_26-0004.pdf',
  driveUrl: 'https://drive.google.com/drive/folders/1mnnChue2IUqOh5Or99_v2LiJ3TaRJvy7',
  stateCode: 'NAC'
};

export const MINUTA_26_0002: MinutaReunionSCTAP = {
  id: 'minuta-26-0002',
  numero: '26-0002',
  code: 'NAC_2026_GGPD_MINUTA_26_0002_V01',
  fecha: '29/06/2026',
  fechaISO: '2026-06-29',
  hora: '10:15 a.m.',
  lugar: 'CARACAS',
  coordinador: 'Ing. Adrián Correa',
  unidadOrganizativa: 'GERENCIA DE GESTIÓN DE PLANIFICACIÓN DE DISTRIBUCIÓN',
  objetivo: 'IMPLEMENTACIÓN DE PLAN DE CONTINGENCIA DE LA GERENCIA DE GESTIÓN DE PLANIFICACIÓN DE DISTRIBUCIÓN POR AFECTACIONES CONSECUENCIA DEL TERREMOTO OCURRIDO EL 24/06/2026. (MODALIDAD VIDEOCONFERENCIA VIA GOOGLE MEET)',
  participantes: [
    { nombre: 'Adrián Correa', unidadOrganizativa: 'Jefe de la División de Planificación', asistio: true },
    { nombre: 'Caterina Fabio', unidadOrganizativa: 'División de Planificación', asistio: true },
    { nombre: 'Walter Prato', unidadOrganizativa: 'División de Planificación', asistio: true },
    { nombre: 'Blanca González', unidadOrganizativa: 'Asistente del Gerente', asistio: true },
    { nombre: 'Josué Pacheco', unidadOrganizativa: 'Grupo de Seguimiento y Control', asistio: true },
    { nombre: 'Yván Cipirán', unidadOrganizativa: 'Gerencia Gestión de Planificación', asistio: true, observacion: 'Conexión alternativa' },
    { nombre: 'Michael Brito', unidadOrganizativa: 'Grupo de Seguimiento y Control', asistio: true },
    { nombre: 'Carlos H. Reyes A.', unidadOrganizativa: 'Gerente Gestión de Planificación', asistio: false },
    { nombre: 'Jaime Bencomo', unidadOrganizativa: 'División de Planificación', asistio: false },
    { nombre: 'Dayais E. Blanco', unidadOrganizativa: 'División de Planificación', asistio: false },
    { nombre: 'Jasmín Parra', unidadOrganizativa: 'Grupo de Seguimiento y Control', asistio: false },
    { nombre: 'Josser Parra', unidadOrganizativa: 'Grupo de Seguimiento y Control', asistio: false },
    { nombre: 'Arturo García', unidadOrganizativa: 'Grupo de Seguimiento y Control', asistio: false, observacion: 'Rescatista' },
    { nombre: 'Esteban Castro', unidadOrganizativa: 'Grupo de Seguimiento y Control', asistio: false, observacion: 'Reposo' },
    { nombre: 'Jorge Jiménez', unidadOrganizativa: 'Grupo de Seguimiento y Control', asistio: false, observacion: 'Vacaciones' }
  ],
  compromisosCount: 9,
  pendientesCount: 6,
  proximaFechaSeguimiento: '06/07/2026',
  elaboradoPor: 'Michael Brito / Josué Pacheco - Grupo de Seguimiento y Control',
  nombreArchivo: 'MINUTA_20260629_26-0002.pdf',
  driveUrl: 'https://drive.google.com/drive/folders/1mnnChue2IUqOh5Or99_v2LiJ3TaRJvy7',
  stateCode: 'NAC'
};

export const SCTAP_MINUTAS: MinutaReunionSCTAP[] = [MINUTA_26_0004, MINUTA_26_0002];

export const SCTAP_COMPROMISOS: TareaCompromisoSCTAP[] = [
  {
    id: 'comp-260002-1',
    minutaNumero: '26-0002',
    minutaFecha: '29/06/2026',
    responsable: 'Ing. Adrián Correa',
    compromiso: 'Realizar seguimiento diario al informe técnico de infraestructura y validar disponibilidad de sede alterna (Chacao).',
    plazoText: '48 horas (primer reporte)',
    plazoFechaISO: '2026-07-01',
    vinculacionOrigen: 'Punto 2 (Validación de instalaciones)',
    estado: 'Completado',
    prioridad: 'Alta',
    avancePorcentaje: 100,
    areaGestion: 'Infraestructura',
    observaciones: 'Informe preliminar verificado. Solicitud de espacio en sede Chacao enviada a Servicios Generales.',
    historialAvances: [
      { id: 'h-002-1', fecha: '2026-07-01', nota: 'Dictamen de peritaje verificado. Trabajo remoto ratificado.', porcentaje: 100, usuario: 'Adrián Correa' }
    ],
    createdAt: '2026-06-29T10:15:00Z',
    updatedAt: '2026-07-01T12:00:00Z'
  },
  {
    id: 'comp-260002-2',
    minutaNumero: '26-0002',
    minutaFecha: '29/06/2026',
    responsable: 'Ing. Adrián Correa',
    compromiso: 'Realizar un levantamiento detallado de la disponibilidad técnica de todo el personal y gestionar la reasignación de equipos, priorizando a Yván Cipirán.',
    plazoText: '72 horas',
    plazoFechaISO: '2026-07-02',
    vinculacionOrigen: 'Punto 4 (Disponibilidad tecnológica)',
    estado: 'Completado',
    prioridad: 'Alta',
    avancePorcentaje: 100,
    areaGestion: 'Tecnología',
    observaciones: 'Sondeo ejecutado. Reasignación de laptop efectuada prioritariamente para Yván Cipirán.',
    historialAvances: [
      { id: 'h-002-2', fecha: '2026-07-02', nota: 'Laptop entregada a Yván Cipirán para despliegue de plataforma.', porcentaje: 100, usuario: 'Adrián Correa' }
    ],
    createdAt: '2026-06-29T10:15:00Z',
    updatedAt: '2026-07-02T16:00:00Z'
  },
  {
    id: 'comp-260002-3',
    minutaNumero: '26-0002',
    minutaFecha: '29/06/2026',
    responsable: 'Ing. Adrián Correa',
    compromiso: 'Contactar directamente a las Gerencias Territoriales de los 6 estados sensibles para designar un enlace de emergencia.',
    plazoText: '24 horas',
    plazoFechaISO: '2026-06-30',
    vinculacionOrigen: 'Punto 5 (Abordaje a divisiones estadales)',
    estado: 'Completado',
    prioridad: 'Alta',
    avancePorcentaje: 100,
    areaGestion: 'Estados',
    observaciones: 'Enlaces de emergencia confirmados en Aragua, Carabobo, Dto. Capital, Falcón, La Guaira y Miranda.',
    historialAvances: [
      { id: 'h-002-3', fecha: '2026-06-30', nota: 'Contactos institucionales validados en los 6 estados sensibles.', porcentaje: 100, usuario: 'Adrián Correa' }
    ],
    createdAt: '2026-06-29T10:15:00Z',
    updatedAt: '2026-06-30T14:00:00Z'
  },
  {
    id: 'comp-260002-4',
    minutaNumero: '26-0002',
    minutaFecha: '29/06/2026',
    responsable: 'Josué Pacheco',
    compromiso: 'Crear y configurar las dos cuentas de correo de contingencia (recepción habitual y repositorio temporal), asegurando que sean funcionales sin depender de la red interna.',
    plazoText: '24 horas',
    plazoFechaISO: '2026-06-30',
    vinculacionOrigen: 'Punto 3 (Articulación remota)',
    estado: 'Completado',
    prioridad: 'Alta',
    avancePorcentaje: 100,
    areaGestion: 'Comunicación',
    observaciones: 'Cuentas creadas sin vinculación a infraestructura interna ni dependencia de VPN.',
    historialAvances: [
      { id: 'h-002-4', fecha: '2026-06-30', nota: 'Correos genéricos habilitados y probados satisfactoriamente.', porcentaje: 100, usuario: 'Josué Pacheco' }
    ],
    createdAt: '2026-06-29T10:15:00Z',
    updatedAt: '2026-06-30T11:00:00Z'
  },
  {
    id: 'comp-260002-5',
    minutaNumero: '26-0002',
    minutaFecha: '29/06/2026',
    responsable: 'Yván Cipirán',
    compromiso: 'Diseñar, estructurar y subir la nube temporal con la jerarquía de carpetas aprobada (por estado y tipo de documento).',
    plazoText: '48 horas',
    plazoFechaISO: '2026-07-01',
    vinculacionOrigen: 'Punto 3 (Articulación remota)',
    estado: 'Completado',
    prioridad: 'Alta',
    avancePorcentaje: 100,
    areaGestion: 'Comunicación',
    observaciones: 'Carpeta en servicio autorizado estructurada por estado (informes, planillas, estadísticas).',
    historialAvances: [
      { id: 'h-002-5', fecha: '2026-07-01', nota: 'Jerarquía de nube temporal finalizada.', porcentaje: 100, usuario: 'Yván Cipirán' }
    ],
    createdAt: '2026-06-29T10:15:00Z',
    updatedAt: '2026-07-01T15:30:00Z'
  },
  {
    id: 'comp-260002-6',
    minutaNumero: '26-0002',
    minutaFecha: '29/06/2026',
    responsable: 'Blanca González',
    compromiso: 'Contactar a Alejandro Molina (Tecnología S/C Santa Rosa) para agilizar la activación de VPNs y el traslado de equipos tecnológicos en resguardo.',
    plazoText: '24 horas',
    plazoFechaISO: '2026-06-30',
    vinculacionOrigen: 'Punto 4 (Soporte tecnológico)',
    estado: 'Completado',
    prioridad: 'Alta',
    avancePorcentaje: 100,
    areaGestion: 'Tecnología',
    observaciones: 'Activación de accesos VPN para 5 usuarios clave gestionada exitosamente con Alejandro Molina.',
    historialAvances: [
      { id: 'h-002-6', fecha: '2026-06-30', nota: 'VPNs autorizadas para el equipo estratégico.', porcentaje: 100, usuario: 'Blanca González' }
    ],
    createdAt: '2026-06-29T10:15:00Z',
    updatedAt: '2026-06-30T17:00:00Z'
  },
  {
    id: 'comp-260002-7',
    minutaNumero: '26-0002',
    minutaFecha: '29/06/2026',
    responsable: 'Michael Brito',
    compromiso: 'Contactar a todas las divisiones estadales operativas (excepto las 6 sensibles) para notificar la contingencia, cotejar su nivel de operatividad y presentar el listado de contactos válidos.',
    plazoText: '48 horas',
    plazoFechaISO: '2026-07-01',
    vinculacionOrigen: 'Punto 5 (Abordaje a divisiones estadales)',
    estado: 'Completado',
    prioridad: 'Media',
    avancePorcentaje: 100,
    areaGestion: 'Estados',
    observaciones: 'Directorio de contingencia de estados operativos enviado a la gerencia.',
    historialAvances: [
      { id: 'h-002-7', fecha: '2026-07-01', nota: 'Consolidado de estados operativos listo.', porcentaje: 100, usuario: 'Michael Brito' }
    ],
    createdAt: '2026-06-29T10:15:00Z',
    updatedAt: '2026-07-01T18:00:00Z'
  },
  {
    id: 'comp-260002-8',
    minutaNumero: '26-0002',
    minutaFecha: '29/06/2026',
    responsable: 'Caterina Fabio',
    compromiso: 'Elaborar el borrador de la matriz del Plan de Acción de Recuperación del SEN con base en el estado Miranda, para agilizar el proceso una vez definido el alcance.',
    plazoText: '72 horas',
    plazoFechaISO: '2026-07-02',
    vinculacionOrigen: 'Punto 6 (Requerimiento del SEN)',
    estado: 'Completado',
    prioridad: 'Media',
    avancePorcentaje: 100,
    areaGestion: 'Normativa',
    observaciones: 'Matriz borrador elaborada y guardada como plantilla preliminar.',
    historialAvances: [
      { id: 'h-002-8', fecha: '2026-07-02', nota: 'Formato borrador completado para Miranda.', porcentaje: 100, usuario: 'Caterina Fabio' }
    ],
    createdAt: '2026-06-29T10:15:00Z',
    updatedAt: '2026-07-02T10:00:00Z'
  },
  {
    id: 'comp-260002-9',
    minutaNumero: '26-0002',
    minutaFecha: '29/06/2026',
    responsable: 'Adrián Correa',
    compromiso: 'Validar directamente con el Ing. Carlos Reyes el alcance nacional o focalizado del instrumento del SEN.',
    plazoText: 'Pendiente de agenda',
    plazoFechaISO: '2026-07-05',
    vinculacionOrigen: 'Punto 6 (Requerimiento del SEN)',
    estado: 'Completado',
    prioridad: 'Media',
    avancePorcentaje: 100,
    areaGestion: 'Normativa',
    observaciones: 'Consulta realizada al Ing. Carlos Reyes. Alcance ajustado en la Minuta 26-0004.',
    historialAvances: [
      { id: 'h-002-9', fecha: '2026-07-05', nota: 'Validado alcance con la gerencia general.', porcentaje: 100, usuario: 'Adrián Correa' }
    ],
    createdAt: '2026-06-29T10:15:00Z',
    updatedAt: '2026-07-05T14:00:00Z'
  },
  {
    id: 'comp-1',
    minutaNumero: '26-0004',
    minutaFecha: '30/07/2026',
    responsable: 'Gerencia de Planificación / Adrián Correa',
    compromiso: 'Implementar un plan de seguimiento estadal para depurar la información reportada y asegurar consistencia.',
    plazoText: '12/08/2026',
    plazoFechaISO: '2026-08-12',
    vinculacionOrigen: 'Punto 1 (Calidad de datos)',
    estado: 'En Proceso',
    prioridad: 'Alta',
    avancePorcentaje: 45,
    areaGestion: 'Data Base',
    observaciones: 'Alineación con estándares internacionales ISO 8000, 9000, 27001 para auditoría.',
    historialAvances: [
      { id: 'h1', fecha: '2026-08-01', nota: 'Se estructuró la propuesta del plan de seguimiento estadal.', porcentaje: 20, usuario: 'Adrián Correa' },
      { id: 'h2', fecha: '2026-08-03', nota: 'Se definieron los criterios de validación para los reportes estadales.', porcentaje: 45, usuario: 'Adrián Correa' }
    ],
    createdAt: '2026-07-30T10:00:00Z',
    updatedAt: '2026-08-03T10:00:00Z'
  },
  {
    id: 'comp-2',
    minutaNumero: '26-0004',
    minutaFecha: '30/07/2026',
    responsable: 'Yván Cipirán',
    compromiso: 'Crear un directorio en la nube para automatización con subcarpetas (Proyectos/PRTSEN, Interrupciones).',
    plazoText: '03/08/2026',
    plazoFechaISO: '2026-08-03',
    vinculacionOrigen: 'Punto 2 (Automatización)',
    estado: 'Completado',
    prioridad: 'Alta',
    avancePorcentaje: 100,
    areaGestion: 'Automatización',
    observaciones: 'Repositorio habilitado con subcarpetas "Disponible", "Proyectos y PRTSEN", "Interrupciones".',
    historialAvances: [
      { id: 'h3', fecha: '2026-08-02', nota: 'Estructura de carpetas creada y permisos de acceso probados.', porcentaje: 100, usuario: 'Yván Cipirán' }
    ],
    createdAt: '2026-07-30T10:00:00Z',
    updatedAt: '2026-08-02T15:00:00Z'
  },
  {
    id: 'comp-3',
    minutaNumero: '26-0004',
    minutaFecha: '30/07/2026',
    responsable: 'Yván Cipirán',
    compromiso: 'Centralizar toda la información de avances de automatización en el repositorio creado.',
    plazoText: '05/08/2026',
    plazoFechaISO: '2026-08-05',
    vinculacionOrigen: 'Punto 2 (Automatización)',
    estado: 'En Proceso',
    prioridad: 'Alta',
    avancePorcentaje: 70,
    areaGestion: 'Automatización',
    observaciones: 'Recopilando archivos de avances desde las distintas divisiones.',
    historialAvances: [
      { id: 'h4', fecha: '2026-08-02', nota: 'Migrados los primeros instrumentos estandarizados.', porcentaje: 70, usuario: 'Yván Cipirán' }
    ],
    createdAt: '2026-07-30T10:00:00Z',
    updatedAt: '2026-08-03T09:00:00Z'
  },
  {
    id: 'comp-4',
    minutaNumero: '26-0004',
    minutaFecha: '30/07/2026',
    responsable: 'Yván Cipirán',
    compromiso: 'Desarrollar y publicar un cronograma de trabajo para la automatización de procesos a partir del 15/08/2026.',
    plazoText: '12/08/2026',
    plazoFechaISO: '2026-08-12',
    vinculacionOrigen: 'Punto 2 (Automatización)',
    estado: 'En Proceso',
    prioridad: 'Media',
    avancePorcentaje: 35,
    areaGestion: 'Automatización',
    observaciones: 'El cronograma inicia formalmente el 15 de agosto.',
    historialAvances: [],
    createdAt: '2026-07-30T10:00:00Z',
    updatedAt: '2026-07-30T10:00:00Z'
  },
  {
    id: 'comp-5',
    minutaNumero: '26-0004',
    minutaFecha: '30/07/2026',
    responsable: 'Yván Cipirán / Josué Pacheco',
    compromiso: 'Elaborar una agenda de trabajo con cada responsable de instrumentos para validar correcciones o simplificaciones.',
    plazoText: '06/08/2026',
    plazoFechaISO: '2026-08-06',
    vinculacionOrigen: 'Punto 2 (Automatización)',
    estado: 'En Proceso',
    prioridad: 'Media',
    avancePorcentaje: 60,
    areaGestion: 'Automatización',
    observaciones: 'Coordinación directa con Josué Pacheco.',
    historialAvances: [],
    createdAt: '2026-07-30T10:00:00Z',
    updatedAt: '2026-07-30T10:00:00Z'
  },
  {
    id: 'comp-6',
    minutaNumero: '26-0004',
    minutaFecha: '30/07/2026',
    responsable: 'Josué Pacheco',
    compromiso: 'Validar instrumentos de seguimiento y control junto a Yván Cipirán (agenda de trabajo).',
    plazoText: '07/08/2026',
    plazoFechaISO: '2026-08-07',
    vinculacionOrigen: 'Punto 2 (Automatización)',
    estado: 'En Proceso',
    prioridad: 'Media',
    avancePorcentaje: 50,
    areaGestion: 'Automatización',
    observaciones: 'Evaluación de formularios para sustituir hojas Excel arbitrarias.',
    historialAvances: [],
    createdAt: '2026-07-30T10:00:00Z',
    updatedAt: '2026-07-30T10:00:00Z'
  },
  {
    id: 'comp-7',
    minutaNumero: '26-0004',
    minutaFecha: '30/07/2026',
    responsable: 'Yván Cipirán',
    compromiso: 'Crear cuentas de acceso individualizadas para cada estado (ej. GGPD_Carabobo).',
    plazoText: '07/08/2026',
    plazoFechaISO: '2026-08-07',
    vinculacionOrigen: 'Punto 2 (Formularios)',
    estado: 'En Proceso',
    prioridad: 'Media',
    avancePorcentaje: 95,
    areaGestion: 'Tecnología',
    observaciones: '25 cuentas de Coordinación Estadal aprovisionadas en InsForge IAM.',
    historialAvances: [
      { id: 'h7-iam', fecha: '2026-08-23', nota: 'Motor IAM configurado en InsForge con matriz de permisos y credenciales OWASP.', porcentaje: 95, usuario: 'Yván Cipirán' }
    ],
    createdAt: '2026-07-30T10:00:00Z',
    updatedAt: '2026-08-23T15:00:00Z'
  },
  {
    id: 'comp-8',
    minutaNumero: '26-0004',
    minutaFecha: '30/07/2026',
    responsable: 'Yván Cipirán',
    compromiso: 'Programar el cálculo automático de los indicadores de desempeño.',
    plazoText: '20/08/2026',
    plazoFechaISO: '2026-08-20',
    vinculacionOrigen: 'Punto 2 (Indicadores)',
    estado: 'En Proceso',
    prioridad: 'Baja',
    avancePorcentaje: 85,
    areaGestion: 'Automatización',
    observaciones: 'Módulo de cálculo de KPIs operativos e integración KGI en SIGI.',
    historialAvances: [
      { id: 'h8-kpi', fecha: '2026-08-23', nota: 'Dashboard ejecutivo integrado con métricas de red y gobernanza.', porcentaje: 85, usuario: 'Yván Cipirán' }
    ],
    createdAt: '2026-07-30T10:00:00Z',
    updatedAt: '2026-08-23T16:00:00Z'
  },
  {
    id: 'comp-9',
    minutaNumero: '26-0004',
    minutaFecha: '30/07/2026',
    responsable: 'Caterina Fabio',
    compromiso: 'Entregar al equipo técnico los requerimientos y campos necesarios del formulario para el nuevo sistema de reporte de interrupciones.',
    plazoText: '05/08/2026',
    plazoFechaISO: '2026-08-05',
    vinculacionOrigen: 'Punto 2 (Interrupciones)',
    estado: 'Completado',
    prioridad: 'Alta',
    avancePorcentaje: 100,
    areaGestion: 'Automatización',
    observaciones: 'Estandarización de catálogo de fallas e interrupciones integrada en SCTIS v2.0.',
    historialAvances: [
      { id: 'h5', fecha: '2026-08-01', nota: 'Borrador de campos obligatorios listo para revisión.', porcentaje: 80, usuario: 'Caterina Fabio' },
      { id: 'h5-done', fecha: '2026-08-10', nota: 'Campos integrados en esquema canónico core.cat_causas_interrupcion.', porcentaje: 100, usuario: 'Caterina Fabio' }
    ],
    createdAt: '2026-07-30T10:00:00Z',
    updatedAt: '2026-08-10T11:00:00Z'
  },
  {
    id: 'comp-10',
    minutaNumero: '26-0004',
    minutaFecha: '30/07/2026',
    responsable: 'Gerencia de Planificación / Josué Pacheco',
    compromiso: 'Actualizar la data de subestaciones y circuitos en el repositorio de la nube con información certificada.',
    plazoText: '05/08/2026',
    plazoFechaISO: '2026-08-05',
    vinculacionOrigen: 'Punto 3 (Normalización)',
    estado: 'Completado',
    prioridad: 'Alta',
    avancePorcentaje: 100,
    areaGestion: 'Data Base',
    observaciones: '871 Subestaciones y 4,207 Circuitos normalizados con 0 huérfanos en InsForge canónico.',
    historialAvances: [
      { id: 'h10-done', fecha: '2026-08-20', nota: 'Catálogo reconciliado 100% bajo norma CADAFE NS-P-105 e ISO 8000.', porcentaje: 100, usuario: 'Josué Pacheco' }
    ],
    createdAt: '2026-07-30T10:00:00Z',
    updatedAt: '2026-08-20T14:30:00Z'
  },
  {
    id: 'comp-11',
    minutaNumero: '26-0004',
    minutaFecha: '30/07/2026',
    responsable: 'Gerencia de Planificación',
    compromiso: 'Redactar una guía rápida para la codificación de nombres de archivos (nomenclatura estandarizada).',
    plazoText: '07/08/2026',
    plazoFechaISO: '2026-08-07',
    vinculacionOrigen: 'Punto 3 (Normalización)',
    estado: 'Completado',
    prioridad: 'Media',
    avancePorcentaje: 100,
    areaGestion: 'Formalización',
    observaciones: 'Manual técnico GGPD-SGM-INS-005 v3.0 ISO y Guía de Data Lake emitidos.',
    historialAvances: [
      { id: 'h11-done', fecha: '2026-08-15', nota: 'Documentación normativa generada en Markdown y DOCX nativo.', porcentaje: 100, usuario: 'Adrián Correa' }
    ],
    createdAt: '2026-07-30T10:00:00Z',
    updatedAt: '2026-08-15T10:00:00Z'
  },
  {
    id: 'comp-12',
    minutaNumero: '26-0004',
    minutaFecha: '30/07/2026',
    responsable: 'Walter Prato / Jaime Bencomo',
    compromiso: 'Revisar el POA entregado por Carlos Reyes y proporcionar retroalimentación al equipo.',
    plazoText: '03/08/2026',
    plazoFechaISO: '2026-08-03',
    vinculacionOrigen: 'Punto 4 (POA)',
    estado: 'Completado',
    prioridad: 'Alta',
    avancePorcentaje: 100,
    areaGestion: 'Proyectos',
    observaciones: 'Revisión finalizada y observaciones remitidas a Yván Cipirán.',
    historialAvances: [
      { id: 'h6', fecha: '2026-08-03', nota: 'POA analizado y enviado informe de sugerencias.', porcentaje: 100, usuario: 'Walter Prato' }
    ],
    createdAt: '2026-07-30T10:00:00Z',
    updatedAt: '2026-08-03T11:30:00Z'
  },
  {
    id: 'comp-13',
    minutaNumero: '26-0004',
    minutaFecha: '30/07/2026',
    responsable: 'Yván Cipirán',
    compromiso: 'Proponer una estructura para vincular los proyectos del PRTSEN con el POA.',
    plazoText: '12/08/2026',
    plazoFechaISO: '2026-08-12',
    vinculacionOrigen: 'Punto 4 (PRTSEN/POA)',
    estado: 'En Proceso',
    prioridad: 'Alta',
    avancePorcentaje: 80,
    areaGestion: 'Proyectos',
    observaciones: 'Módulo SCPPE conectado a base de datos unificada para seguimiento presupuestario COBIT.',
    historialAvances: [
      { id: 'h13', fecha: '2026-08-18', nota: 'Estructura de proyectos y viáticos validada con triggers COBIT.', porcentaje: 80, usuario: 'Yván Cipirán' }
    ],
    createdAt: '2026-07-30T10:00:00Z',
    updatedAt: '2026-08-18T10:00:00Z'
  },
  {
    id: 'comp-14',
    minutaNumero: '26-0004',
    minutaFecha: '30/07/2026',
    responsable: 'Jorge Jiménez',
    compromiso: 'Revisar y definir tareas pendientes relacionadas con el reporte de equipos indisponibles (criterios de % de avance).',
    plazoText: '05/08/2026',
    plazoFechaISO: '2026-08-05',
    vinculacionOrigen: 'Punto 5 (Operatividad)',
    estado: 'Completado',
    prioridad: 'Media',
    avancePorcentaje: 100,
    areaGestion: 'Proyectos',
    observaciones: 'Catálogo de 12 tipos de equipos y reglas de tratamiento dual en SCEIN formalizadas.',
    historialAvances: [
      { id: 'h14-done', fecha: '2026-08-19', nota: 'Guía Spark y catálogo de equipos indisponibles completado.', porcentaje: 100, usuario: 'Jorge Jiménez' }
    ],
    createdAt: '2026-07-30T10:00:00Z',
    updatedAt: '2026-08-19T10:00:00Z'
  },
  {
    id: 'comp-15',
    minutaNumero: '26-0004',
    minutaFecha: '30/07/2026',
    responsable: 'Gerencia de Planificación',
    compromiso: 'Gestionar ante la Gerencia General la directriz oficial para reportar proyectos autogestionados.',
    plazoText: '12/08/2026',
    plazoFechaISO: '2026-08-12',
    vinculacionOrigen: 'Punto 5 (Proyectos)',
    estado: 'En Proceso',
    prioridad: 'Alta',
    avancePorcentaje: 75,
    areaGestion: 'Proyectos',
    observaciones: 'Asegurar visibilidad de obras regionales ejecutadas con recursos propios.',
    historialAvances: [],
    createdAt: '2026-07-30T10:00:00Z',
    updatedAt: '2026-07-30T10:00:00Z'
  },
  {
    id: 'comp-16',
    minutaNumero: '26-0004',
    minutaFecha: '30/07/2026',
    responsable: 'Todo el grupo / Equipo GGPD',
    compromiso: 'Reportar diariamente el avance de las tareas asignadas y dificultades de conectividad con los estados.',
    plazoText: 'A partir del 31/07/2026',
    plazoFechaISO: '2026-07-31',
    vinculacionOrigen: 'Punto 5 (Reporte diario)',
    estado: 'En Proceso',
    prioridad: 'Alta',
    avancePorcentaje: 95,
    areaGestion: 'Formalización',
    observaciones: 'Disciplina operativa diaria para evitar vacíos de información (Plataforma SCMTP activa).',
    historialAvances: [
      { id: 'h7', fecha: '2026-08-01', nota: 'Apertura de canal diario de reportes.', porcentaje: 90, usuario: 'Adrián Correa' },
      { id: 'h7-act', fecha: '2026-08-23', nota: 'Seguimiento diario consolidado en Minutario Técnico.', porcentaje: 95, usuario: 'Josué Pacheco' }
    ],
    createdAt: '2026-07-30T10:00:00Z',
    updatedAt: '2026-08-23T10:00:00Z'
  },
  {
    id: 'comp-17',
    minutaNumero: '26-0004',
    minutaFecha: '30/07/2026',
    responsable: 'Yván Cipirán / Adrián Correa',
    compromiso: 'Preparar documento PDF con los costos de la plataforma para solicitar pago (junto a Adrián Correa).',
    plazoText: '03/08/2026',
    plazoFechaISO: '2026-08-03',
    vinculacionOrigen: 'Punto 6 (Tecnología)',
    estado: 'Completado',
    prioridad: 'Alta',
    avancePorcentaje: 100,
    areaGestion: 'Tecnología',
    observaciones: 'Informe técnico-económico INF-STI-2026-008-V3 completado en PDF/DOCX y presentación de 12 slides.',
    historialAvances: [
      { id: 'h8', fecha: '2026-08-02', nota: 'Documento PDF elaborado y entregado a Adrián Correa.', porcentaje: 100, usuario: 'Yván Cipirán' },
      { id: 'h8-v3', fecha: '2026-08-22', nota: 'Informe INF-STI-2026-008-V3 finalizado con evaluación económica y SAIF.', porcentaje: 100, usuario: 'Yván Cipirán' }
    ],
    createdAt: '2026-07-30T10:00:00Z',
    updatedAt: '2026-08-22T16:00:00Z'
  }
];

export const SCTAP_PENDIENTES: PendienteAreaSCTAP[] = [
  {
    id: 'pend-260002-1',
    area: 'Infraestructura',
    pendiente: 'Reporte final de disponibilidad de sede alterna.',
    dependeDe: 'Respuesta de Servicios Generales / Ing. Adrián Correa',
    estado: 'Completado',
    observacion: 'Peritaje e informe preliminar entregado.'
  },
  {
    id: 'pend-260002-2',
    area: 'Tecnología',
    pendiente: 'Asignación efectiva de equipos y activación de VPN para el resto del personal.',
    dependeDe: 'Gestión de Blanca González y Alejandro Molina',
    estado: 'Completado',
    observacion: 'VPNs de contingencia activadas.'
  },
  {
    id: 'pend-260002-3',
    area: 'Comunicación',
    pendiente: 'Estructura definitiva de la nube y distribución de credenciales a los integrantes de la gerencia.',
    dependeDe: 'Finalización del trabajo de Yván Cipirán',
    estado: 'Completado',
    observacion: 'Nube estructurada y carpetas compartidas.'
  },
  {
    id: 'pend-260002-4',
    area: 'Estados',
    pendiente: 'Reporte consolidado del abordaje inicial a estados no sensibles (Michael Brito) y detección de enlaces en estados sensibles (Adrián Correa).',
    dependeDe: 'Cumplimiento de los plazos de 48 y 24 horas respectivamente',
    estado: 'Completado',
    observacion: 'Completado y consolidado.'
  },
  {
    id: 'pend-260002-5',
    area: 'Normativa',
    pendiente: 'Validación oficial del alcance del Plan de Acción de Recuperación del SEN.',
    dependeDe: 'Contacto con el Ing. Carlos Reyes',
    estado: 'Completado',
    observacion: 'Criterios incorporados en Minuta #26-0004.'
  },
  {
    id: 'pend-260002-6',
    area: 'Operatividad',
    pendiente: 'Esquema de distribución de carga de trabajo con las nuevas herramientas (definir quién procesa qué data).',
    dependeDe: 'Reunión posterior con el Equipo',
    estado: 'Completado',
    observacion: 'Continuidad operativa asignada y formalizada en SCMTP.'
  },
  {
    id: 'pend-1',
    area: 'Data Base',
    pendiente: 'Actualización de subestaciones y circuitos en el repositorio (insumo clave para IA).',
    dependeDe: 'Gerencia de Planificación / Carlos Reyes',
    estado: 'Completado',
    observacion: 'Poblada base de datos canónica en InsForge con 871 SEs y 4,207 CTs.'
  },
  {
    id: 'pend-2',
    area: 'Automatización',
    pendiente: 'Validación de instrumentos con responsables (definir qué se simplifica o elimina).',
    dependeDe: 'Josué Pacheco / Yván Cipirán',
    estado: 'En Proceso',
    observacion: 'Wizard ISO 8000 desplegado en SIGI para rediseño y normalización de formularios.'
  },
  {
    id: 'pend-3',
    area: 'Formalización',
    pendiente: 'Emisión de memorando o circular para formalizar los nuevos canales de reporte (evitar uso de WhatsApp/llamadas informales).',
    dependeDe: 'Gerencia de Planificación',
    estado: 'En Proceso',
    observacion: 'Memorando de despliegue QA emitido y canales web sincronizados.'
  },
  {
    id: 'pend-4',
    area: 'Tecnología',
    pendiente: 'Renovación de la plataforma (pagos del 1/08 y 1/09).',
    dependeDe: 'Yván Cipirán / Adrián Correa',
    estado: 'Completado',
    observacion: 'Trámite de pago e informe INF-STI-2026-008-V3 completado.'
  },
  {
    id: 'pend-5',
    area: 'Proyectos',
    pendiente: 'Definición del flujo oficial para reportar proyectos autogestionados por los estados.',
    dependeDe: 'Gerencia General de Distribución',
    estado: 'En Proceso',
    observacion: 'En espera de la directriz oficial; esquema DDL listo en InsForge.'
  },
  {
    id: 'pend-6',
    area: 'Transición',
    pendiente: 'Reasignación de tareas durante la ausencia de Michael Brito (vacaciones a partir del próximo lunes, regreso 17/09).',
    dependeDe: 'Gerencia de Planificación',
    estado: 'Completado',
    observacion: 'Cobertura de funciones de seguimiento distribuida entre Josué Pacheco y Adrián Correa.'
  },
  {
    id: 'pend-7',
    area: 'Cierres Mensuales',
    pendiente: 'Definir fecha fija de cierre mensual para recepción de instrumentos (evitar flujo continuo).',
    dependeDe: 'Todo el grupo / Coordinación',
    estado: 'En Proceso',
    observacion: 'Reglas de corte semanal y cierre de fin de mes implementadas en Data Ingestion Hub.'
  }
];
