/**
 * ==============================================================================
 * CORPOELEC - GERENCIA GENERAL DE PLANIFICACIÓN DE DISTRIBUCIÓN (GGPD)
 * SCRIPT MAESTRO DE APROVISIONAMIENTO Y GOBIERNO DE DATOS EN GOOGLE DRIVE
 * ==============================================================================
 * Archivo: google_apps_script_provisioner_2026.gs
 * Versión: 2.0.0 (Optimizado con ejecución por lotes y reanudación automática)
 * Cuenta Oficial: bk.ggpd.corpoelec@gmail.com
 * Carpeta Raíz ID: 1mnnChue2IUqOh5Or99_v2LiJ3TaRJvy7
 * ==============================================================================
 */

// 1. Catálogo Oficial de las 25 Entidades Federales del SEN
const SEN_ESTADOS = [
  { code: '01_DCA', name: 'DISTRITO_CAPITAL', abbr: 'DCA' },
  { code: '02_MIR', name: 'MIRANDA', abbr: 'MIR' },
  { code: '03_LGU', name: 'LA_GUAIRA', abbr: 'LGU' },
  { code: '04_ZUL', name: 'ZULIA', abbr: 'ZUL' },
  { code: '05_CAR', name: 'CARABOBO', abbr: 'CAR' },
  { code: '06_ARA', name: 'ARAGUA', abbr: 'ARA' },
  { code: '07_LAR', name: 'LARA', abbr: 'LAR' },
  { code: '08_BOL', name: 'BOLIVAR', abbr: 'BOL' },
  { code: '09_ANZ', name: 'ANZOATEGUI', abbr: 'ANZ' },
  { code: '10_BAR', name: 'BARINAS', abbr: 'BAR' },
  { code: '11_FAL', name: 'FALCON', abbr: 'FAL' },
  { code: '12_MER', name: 'MERIDA', abbr: 'MER' },
  { code: '13_TAC', name: 'TACHIRA', abbr: 'TAC' },
  { code: '14_TRU', name: 'TRUJILLO', abbr: 'TRU' },
  { code: '15_POR', name: 'PORTUGUESA', abbr: 'POR' },
  { code: '16_COJ', name: 'COJEDES', abbr: 'COJ' },
  { code: '17_GUA', name: 'GUARICO', abbr: 'GUA' },
  { code: '18_SUC', name: 'SUCRE', abbr: 'SUC' },
  { code: '19_MON', name: 'MONAGAS', abbr: 'MON' },
  { code: '20_APU', name: 'APURE', abbr: 'APU' },
  { code: '21_NES', name: 'NUEVA_ESPARTA', abbr: 'NES' },
  { code: '22_DEL', name: 'DELTA_AMACURO', abbr: 'DEL' },
  { code: '23_AMA', name: 'AMAZONAS', abbr: 'AMA' },
  { code: '24_YAR', name: 'YARACUY', abbr: 'YAR' },
  { code: '25_GEQ', name: 'GUAYANA_ESEQUIBA', abbr: 'GEQ' }
];

// 2. Catálogo Oficial de los 4 Macro-Procesos Estratégicos
const PROCESOS_MAESTROS = [
  {
    folderName: '01_SCTIS_INTERRUPCIONES',
    prefix: 'SCTIS',
    title: 'Seguimiento y Control de Tiras de Interrupción (SCTIS V2.0)',
    namingExample: 'SCTIS_[ESTADO]_[YYYYMMDD]_SEM[N]_V01.xlsx',
    description: 'Registro certificado semanal y cierre mensual de interrupciones del servicio eléctrico.'
  },
  {
    folderName: '02_SCEIN_INDISPONIBLES',
    prefix: 'SCEIN',
    title: 'Seguimiento y Control de Equipos Indisponibles (SCEIN V3.0)',
    namingExample: 'SCEIN_[ESTADO]_[YYYYMMDD]_V01.xlsx',
    description: 'Transformadores de potencia, interruptores y bahías fuera de servicio en subestaciones.'
  },
  {
    folderName: '03_SCPPE_PROYECTOS_VIATICOS',
    prefix: 'SCPPE',
    title: 'Planes, Proyectos y Viáticos SAMC (SCPPE V3.0)',
    namingExample: 'SCPPE_[ESTADO]_[YYYYMMDD]_PROYECTOS_V01.xlsx',
    description: 'Carga de proyectos POA/PRTSEN y justificaciones presupuestarias de viáticos.'
  },
  {
    folderName: '04_SCMTP_MINUTAS_COMPROMISOS',
    prefix: 'SCMTP',
    title: 'Minutas de Trabajo y Compromisos (SCMTP V2.0)',
    namingExample: 'SCMTP_[ESTADO]_[YYYYMMDD]_MINUTA_[ID].xlsx',
    description: 'Actas de reuniones, asignación de tareas operativas y acuerdos de gestión.'
  }
];

const ROOT_FOLDER_ID = '1mnnChue2IUqOh5Or99_v2LiJ3TaRJvy7';
const YEAR = '2026';

/**
 * ==============================================================================
 * OPCIÓN 1: CONTINUAR DESDE TÁCHIRA (ESTADOS 13 AL 25 + CONSOLIDADOS)
 * Ejecutar esta función si la anterior se detuvo en Táchira
 * ==============================================================================
 */
function provisionDataLakePart2_FromTachira() {
  Logger.log('🔄 Reanudando aprovisionamiento desde el Estado 13 (Táchira) hasta el 25 (Guayana Esequiba)...');
  return provisionStateRange(12, 25); // Índice 12 = 13_TAC (base 0)
}

/**
 * ==============================================================================
 * OPCIÓN 2: EJECUTAR PRIMERA PARTE (ESTADOS 01 AL 12)
 * ==============================================================================
 */
function provisionDataLakePart1_DCA_to_Merida() {
  Logger.log('🚀 Aprovisionando Lote 1: Distrito Capital a Mérida (01 al 12)...');
  return provisionStateRange(0, 12);
}

/**
 * ==============================================================================
 * FUNCIÓN GLOBAL (EJECUTAR CON BOTÓN "EJECUTAR", NO CON "DEPURAR")
 * ==============================================================================
 */
function provisionCompleteDataLake2026() {
  Logger.log('🚀 Iniciando aprovisionamiento completo del Data Lake GGPD 2026 en Google Drive...');
  return provisionStateRange(0, SEN_ESTADOS.length);
}

/**
 * Función interna de aprovisionamiento por rango
 */
function provisionStateRange(startIndex, endIndex) {
  let rootFolder;
  try {
    rootFolder = DriveApp.getFolderById(ROOT_FOLDER_ID);
  } catch (e) {
    Logger.log('⚠️ Usando carpeta raíz de la cuenta.');
    rootFolder = DriveApp.getRootFolder();
  }
  
  const dataLakeRoot = getOrCreateSubFolder(rootFolder, 'GGPD_DATA_LAKE_OFICIAL');
  const targetEstados = SEN_ESTADOS.slice(startIndex, endIndex);

  targetEstados.forEach((estado, idx) => {
    const globalIdx = startIndex + idx + 1;
    const estadoFolderName = `${estado.code}_${estado.name}`;
    Logger.log(`📁 [${globalIdx}/25] Procesando: ${estadoFolderName}`);
    
    const estadoFolder = getOrCreateSubFolder(dataLakeRoot, estadoFolderName);
    
    PROCESOS_MAESTROS.forEach((proc) => {
      const procFolder = getOrCreateSubFolder(estadoFolder, proc.folderName);
      const yearFolder = getOrCreateSubFolder(procFolder, YEAR);
      getOrCreateSubFolder(yearFolder, '08_AGOSTO');
      getOrCreateSubFolder(yearFolder, '09_SEPTIEMBRE');
      
      const readmeName = `NORMA_NOMENCLATURA_${proc.prefix}.txt`;
      const files = yearFolder.getFilesByName(readmeName);
      if (!files.hasNext()) {
        const readmeContent = 
`==============================================================================
CORPOELEC - GERENCIA GENERAL DE PLANIFICACIÓN DE DISTRIBUCIÓN (GGPD)
ESTÁNDAR DE NOMENCLATURA Y CALIDAD DE DATOS (ISO 8000-110)
==============================================================================
ESTADO: ${estado.name} (${estado.abbr})
PROCESO: ${proc.title}
AÑO OPERATIVO: ${YEAR}
------------------------------------------------------------------------------
FORMATO OFICIAL DE ARCHIVO EXIGIDO:
${proc.namingExample}

EJEMPLOS VÁLIDOS:
• Carga Semanal: ${proc.prefix}_${estado.abbr}_20260814_SEM32_V01.xlsx
• Cierre Mensual: ${proc.prefix}_${estado.abbr}_20260831_CIERRE_AGOSTO.xlsx
• Remediación: ${proc.prefix}_${estado.abbr}_20260814_SEM32_REMEDIACION.xlsx

PLAZOS DE ENTREGA NORMATIVOS:
1. Cargas Semanales: Miércoles 08:00 AM a Jueves 12:00 PM (Mediodía).
2. Cierres Mensuales: A más tardar el 3er Día Hábil del mes posterior.
==============================================================================`;
        yearFolder.createFile(readmeName, readmeContent, MimeType.PLAIN_TEXT);
      }
    });
  });

  // Si llegamos al final, asegurar la carpeta nacional
  if (endIndex >= SEN_ESTADOS.length) {
    Logger.log('📊 Creando carpeta 99_CONSOLIDADOS_NACIONALES...');
    const consolidadoFolder = getOrCreateSubFolder(dataLakeRoot, '99_CONSOLIDADOS_NACIONALES');
    const consYearFolder = getOrCreateSubFolder(consolidadoFolder, YEAR);
    getOrCreateSubFolder(consYearFolder, 'REPORTES_EJECUTIVOS_MPPEE');
    getOrCreateSubFolder(consYearFolder, 'MATRICES_DEDUPLICADAS_ISO8000');
  }

  Logger.log(`✅ ¡Lote (${startIndex + 1} al ${endIndex}) completado con éxito!`);
  return {
    status: 'SUCCESS',
    mensaje: `Estados ${startIndex + 1} al ${endIndex} procesados correctamente.`,
    timestamp: new Date().toISOString()
  };
}

/**
 * ==============================================================================
 * APROVISIONAMIENTO DINÁMICO DE UN NUEVO PROCESO (ej. Pica y Poda, Desmalezamiento)
 * ==============================================================================
 */
function provisionNewProcess(processCode, processName, description) {
  Logger.log(`⚡ Aprovisionando nuevo proceso: ${processCode}_${processName}`);
  
  let rootFolder = DriveApp.getFolderById(ROOT_FOLDER_ID);
  const dataLakeRoot = getOrCreateSubFolder(rootFolder, 'GGPD_DATA_LAKE_OFICIAL');
  
  SEN_ESTADOS.forEach((estado) => {
    const estadoFolderName = `${estado.code}_${estado.name}`;
    const estadoFolder = getOrCreateSubFolder(dataLakeRoot, estadoFolderName);
    const newProcFolder = getOrCreateSubFolder(estadoFolder, `${processCode}_${processName}`);
    const yearFolder = getOrCreateSubFolder(newProcFolder, YEAR);
    getOrCreateSubFolder(yearFolder, '08_AGOSTO');
  });
  
  return {
    status: 'SUCCESS',
    processCode: processCode,
    processName: processName,
    message: `Proceso ${processCode} creado exitosamente en los 25 Estados.`
  };
}

/**
 * Función auxiliar para obtener o crear carpetas de forma segura y rápida
 */
function getOrCreateSubFolder(parentFolder, subFolderName) {
  const folders = parentFolder.getFoldersByName(subFolderName);
  if (folders.hasNext()) {
    return folders.next();
  }
  return parentFolder.createFolder(subFolderName);
}

/**
 * ==============================================================================
 * MANEJADOR HTTP (Webhook GET y POST para integración con SIGI)
 * ==============================================================================
 */
function doGet(e) {
  const action = (e && e.parameter && e.parameter.action) ? e.parameter.action : 'STATUS';
  
  if (action === 'PROVISION_DATA_LAKE') {
    const res = provisionCompleteDataLake2026();
    return ContentService.createTextOutput(JSON.stringify(res)).setMimeType(ContentService.MimeType.JSON);
  }
  
  if (action === 'PROVISION_NEW_PROCESS') {
    const pCode = e.parameter.code || '05_SCPYP';
    const pName = e.parameter.name || 'PICA_Y_PODA';
    const res = provisionNewProcess(pCode, pName, 'Seguimiento y Control de Pica y Poda');
    return ContentService.createTextOutput(JSON.stringify(res)).setMimeType(ContentService.MimeType.JSON);
  }
  
  const status = {
    status: "ONLINE",
    servicio: "CORPOELEC GGPD Google Drive Webhook & Data Lake Hub",
    cuenta: "bk.ggpd.corpoelec@gmail.com",
    carpetaId: ROOT_FOLDER_ID,
    carpetaUrl: `https://drive.google.com/drive/folders/${ROOT_FOLDER_ID}`,
    fechaServidor: new Date().toISOString()
  };
  return ContentService.createTextOutput(JSON.stringify(status)).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  return doGet(e);
}
