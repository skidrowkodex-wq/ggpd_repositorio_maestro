/**
 * ==============================================================================
 * CORPOELEC - GERENCIA GENERAL DE PLANIFICACIÓN DE DISTRIBUCIÓN (GGPD)
 * SCRIPT MAESTRO DE APROVISIONAMIENTO Y GOBIERNO DE DATOS EN GOOGLE DRIVE
 * ==============================================================================
 * Archivo: google_apps_script_provisioner_2026.gs
 * Versión: 3.0.0 (Ultra-Rápido: Creación pura de carpetas sin sobrecarga de API)
 * Cuenta Oficial: bk.ggpd.corpoelec@gmail.com
 * Carpeta Raíz ID: 1mnnChue2IUqOh5Or99_v2LiJ3TaRJvy7
 * ==============================================================================
 */

// Catálogo Oficial de los 25 Estados del SEN
const SEN_ESTADOS = [
  { code: '01_DCA', name: 'DISTRITO_CAPITAL' },
  { code: '02_MIR', name: 'MIRANDA' },
  { code: '03_LGU', name: 'LA_GUAIRA' },
  { code: '04_ZUL', name: 'ZULIA' },
  { code: '05_CAR', name: 'CARABOBO' },
  { code: '06_ARA', name: 'ARAGUA' },
  { code: '07_LAR', name: 'LARA' },
  { code: '08_BOL', name: 'BOLIVAR' },
  { code: '09_ANZ', name: 'ANZOATEGUI' },
  { code: '10_BAR', name: 'BARINAS' },
  { code: '11_FAL', name: 'FALCON' },
  { code: '12_MER', name: 'MERIDA' },
  { code: '13_TAC', name: 'TACHIRA' },
  { code: '14_TRU', name: 'TRUJILLO' },
  { code: '15_POR', name: 'PORTUGUESA' },
  { code: '16_COJ', name: 'COJEDES' },
  { code: '17_GUA', name: 'GUARICO' },
  { code: '18_SUC', name: 'SUCRE' },
  { code: '19_MON', name: 'MONAGAS' },
  { code: '20_APU', name: 'APURE' },
  { code: '21_NES', name: 'NUEVA_ESPARTA' },
  { code: '22_DEL', name: 'DELTA_AMACURO' },
  { code: '23_AMA', name: 'AMAZONAS' },
  { code: '24_YAR', name: 'YARACUY' },
  { code: '25_GEQ', name: 'GUAYANA_ESEQUIBA' }
];

// 4 Macro-Procesos Oficiales
const PROCESOS = [
  '01_SCTIS_INTERRUPCIONES',
  '02_SCEIN_INDISPONIBLES',
  '03_SCPPE_PROYECTOS_VIATICOS',
  '04_SCMTP_MINUTAS_COMPROMISOS'
];

const ROOT_FOLDER_ID = '1mnnChue2IUqOh5Or99_v2LiJ3TaRJvy7';
const YEAR = '2026';
const MONTH = '08_AGOSTO';

/**
 * ==============================================================================
 * FUNCIÓN 1 (RECOMENDADA): COMPLETAR DESDE TÁCHIRA HASTA EL ESEQUIBO (13 AL 25)
 * Tiempo estimado: ~25 segundos
 * ==============================================================================
 */
function provisionFromTachiraToEnd() {
  Logger.log('🚀 Creando Estados del 13 (Táchira) al 25 (Guayana Esequiba) + Consolidados...');
  return runFastProvisioning(12, 25);
}

/**
 * ==============================================================================
 * FUNCIÓN 2: CREACIÓN COMPLETA ULTRA-RÁPIDA (25 ESTADOS)
 * Tiempo estimado: ~45 segundos
 * ==============================================================================
 */
function provisionAll25StatesFast() {
  Logger.log('🚀 Creando los 25 Estados de Venezuela en Google Drive...');
  return runFastProvisioning(0, 25);
}

/**
 * ==============================================================================
 * MOTOR ULTRA-OPTIMIZADO DE CREACIÓN DE DIRECTORIOS
 * ==============================================================================
 */
function runFastProvisioning(startIdx, endIdx) {
  const root = DriveApp.getFolderById(ROOT_FOLDER_ID);
  const dataLakeRoot = fastGetOrCreate(root, 'GGPD_DATA_LAKE_OFICIAL');
  
  const target = SEN_ESTADOS.slice(startIdx, endIdx);
  
  target.forEach((estado, i) => {
    const num = startIdx + i + 1;
    const estadoName = `${estado.code}_${estado.name}`;
    Logger.log(`📁 [${num}/25] Generando: ${estadoName}`);
    
    const estadoFolder = fastGetOrCreate(dataLakeRoot, estadoName);
    
    PROCESOS.forEach(procName => {
      const procFolder = fastGetOrCreate(estadoFolder, procName);
      const yearFolder = fastGetOrCreate(procFolder, YEAR);
      fastGetOrCreate(yearFolder, MONTH);
      fastGetOrCreate(yearFolder, '09_SEPTIEMBRE');
    });
  });

  // Crear consolidados nacionales si llega al final
  if (endIdx >= SEN_ESTADOS.length) {
    Logger.log('📊 Creando 99_CONSOLIDADOS_NACIONALES...');
    const consFolder = fastGetOrCreate(dataLakeRoot, '99_CONSOLIDADOS_NACIONALES');
    const consYear = fastGetOrCreate(consFolder, YEAR);
    fastGetOrCreate(consYear, 'REPORTES_EJECUTIVOS_MPPEE');
    fastGetOrCreate(consYear, 'MATRICES_DEDUPLICADAS_ISO8000');
  }

  Logger.log('✅ ¡Ejecución completada con éxito!');
  return 'SUCCESS: Estados ' + (startIdx + 1) + ' al ' + endIdx + ' aprovisionados.';
}

/**
 * Obtiene o crea la carpeta de forma directa y rápida
 */
function fastGetOrCreate(parent, name) {
  const iter = parent.getFoldersByName(name);
  if (iter.hasNext()) {
    return iter.next();
  }
  return parent.createFolder(name);
}

/**
 * ==============================================================================
 * APROVISIONAMIENTO DINÁMICO DE UN NUEVO PROCESO (ej. 05_SCPYP)
 * ==============================================================================
 */
function provisionNewProcess(processCode, processName) {
  const root = DriveApp.getFolderById(ROOT_FOLDER_ID);
  const dataLakeRoot = fastGetOrCreate(root, 'GGPD_DATA_LAKE_OFICIAL');
  const fullProcName = `${processCode}_${processName}`;
  
  SEN_ESTADOS.forEach(estado => {
    const estadoName = `${estado.code}_${estado.name}`;
    const estadoFolder = fastGetOrCreate(dataLakeRoot, estadoName);
    const procFolder = fastGetOrCreate(estadoFolder, fullProcName);
    const yearFolder = fastGetOrCreate(procFolder, YEAR);
    fastGetOrCreate(yearFolder, MONTH);
  });
  
  return 'SUCCESS: Proceso ' + fullProcName + ' creado en los 25 Estados.';
}

/**
 * ==============================================================================
 * WEBHOOK PARA SIGI (doGet / doPost)
 * ==============================================================================
 */
function doGet(e) {
  const action = (e && e.parameter && e.parameter.action) ? e.parameter.action : 'STATUS';
  
  if (action === 'PROVISION_DATA_LAKE') {
    const res = provisionAll25StatesFast();
    return ContentService.createTextOutput(JSON.stringify({ status: 'SUCCESS', result: res })).setMimeType(ContentService.MimeType.JSON);
  }
  
  if (action === 'PROVISION_NEW_PROCESS') {
    const pCode = e.parameter.code || '05_SCPYP';
    const pName = e.parameter.name || 'PICA_Y_PODA';
    const res = provisionNewProcess(pCode, pName);
    return ContentService.createTextOutput(JSON.stringify({ status: 'SUCCESS', result: res })).setMimeType(ContentService.MimeType.JSON);
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
