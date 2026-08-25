/**
 * ==============================================================================
 * CORPOELEC - GERENCIA GENERAL DE PLANIFICACIÓN DE DISTRIBUCIÓN (GGPD)
 * SCRIPT MAESTRO DE APROVISIONAMIENTO Y GOBIERNO DE DATOS EN GOOGLE DRIVE
 * ==============================================================================
 * Archivo: google_apps_script_provisioner_2026.gs
 * Versión: 3.1.0 (Soporte de Ingesta, Auditoría e Inspección de Correspondencias)
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

// Directorios de Correspondencia GGP Oficiales para Auditoría y SCGCC
const CORRESPONDENCIA_FOLDERS = [
  { id: '1yKwQ8hKGjCPHwukuADkv__Kp3gicJkBj', alias: '_Gerencia Nacional (Registro Principal GGP)' },
  { id: '1rxcoAzXeBRPYOiKLWNmVWvKnPkF46Qfy', alias: 'Gestion de Correspondencia GGP (Correlativos Emitidos)' },
  { id: '1TLY85lMR7R1Yz7TgKaMVc2p42dgSO07D', alias: 'PDF CORRESP TTHH 2026 (Talento Humano -> GGP)' },
  { id: '1LHRo1PlKxPRHYFSOJsdemq8iXO8SNMRf', alias: 'PDF DOC. CORRESP GCIA GRAL DE DISTRIBUCION A LA GGP' },
  { id: '1-e_OVf929QnJkUUcXUFRy_pCujAdF26a', alias: 'FORMATO CORPORATIVOS VARIOS 2026' }
];

/**
 * ==============================================================================
 * FUNCIÓN DE INSPECCIÓN DE CORRESPONDENCIAS Y RUTAS
 * ==============================================================================
 */
function inspectCorrespondenciaFolders(customFolderId) {
  const targets = customFolderId 
    ? [{ id: customFolderId, alias: 'Directorio Personalizado' }]
    : CORRESPONDENCIA_FOLDERS;
    
  const results = [];
  
  targets.forEach(t => {
    try {
      const folder = DriveApp.getFolderById(t.id);
      const folderData = {
        id: t.id,
        alias: t.alias,
        realName: folder.getName(),
        url: folder.getUrl(),
        subfolders: [],
        files: []
      };
      
      // Subcarpetas directas
      const subIter = folder.getFolders();
      while (subIter.hasNext()) {
        const sub = subIter.next();
        folderData.subfolders.push({
          id: sub.getId(),
          name: sub.getName(),
          url: sub.getUrl()
        });
      }
      
      // Archivos directos
      const fileIter = folder.getFiles();
      while (fileIter.hasNext()) {
        const file = fileIter.next();
        folderData.files.push({
          id: file.getId(),
          name: file.getName(),
          mimeType: file.getMimeType(),
          sizeBytes: file.getSize(),
          sizeKB: Math.round(file.getSize() / 1024 * 100) / 100,
          lastUpdated: file.getLastUpdated().toISOString(),
          downloadUrl: `https://drive.google.com/uc?export=download&id=${file.getId()}`,
          viewUrl: file.getUrl()
        });
      }
      
      results.push(folderData);
    } catch (err) {
      results.push({
        id: t.id,
        alias: t.alias,
        error: err.toString()
      });
    }
  });
  
  return results;
}

/**
 * Obtiene el contenido Base64 de un archivo para descarga y análisis seguro en local
 */
function getFileBase64(fileId) {
  try {
    const file = DriveApp.getFileById(fileId);
    const blob = file.getBlob();
    const base64 = Utilities.base64Encode(blob.getBytes());
    return {
      success: true,
      id: fileId,
      name: file.getName(),
      mimeType: file.getMimeType(),
      sizeBytes: file.getSize(),
      base64Data: base64
    };
  } catch (err) {
    return {
      success: false,
      id: fileId,
      error: err.toString()
    };
  }
}

/**
 * ==============================================================================
 * APROVISIONAMIENTO COMPLETO ULTRA-RÁPIDO (25 ESTADOS)
 * ==============================================================================
 */
function provisionAll25StatesFast() {
  Logger.log('🚀 Creando los 25 Estados de Venezuela en Google Drive...');
  return runFastProvisioning(0, 25);
}

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

  // Crear carpeta central de plantillas oficiales
  const plantillasFolder = fastGetOrCreate(dataLakeRoot, '00_PLANTILLAS_OFICIALES');
  fastGetOrCreate(plantillasFolder, 'PLANTILLAS_EXCEL_NORMALIZADAS_2026');

  // Crear consolidados nacionales si llega al final
  if (endIdx >= SEN_ESTADOS.length) {
    Logger.log('📊 Creando 99_CONSOLIDADOS_NACIONALES...');
    const consFolder = fastGetOrCreate(dataLakeRoot, '99_CONSOLIDADOS_NACIONALES');
    const consYear = fastGetOrCreate(consFolder, YEAR);
    fastGetOrCreate(consYear, 'REPORTES_EJECUTIVOS_MPPEE');
    fastGetOrCreate(consYear, 'MATRICES_DEDUPLICADAS_ISO8000');
  }

  Logger.log('✅ ¡Ejecución completada con éxito!');
  return 'SUCCESS: Estados ' + (startIdx + 1) + ' al ' + endIdx + ' aprovisionados con Plantillas y Consolidados.';
}

function fastGetOrCreate(parent, name) {
  const iter = parent.getFoldersByName(name);
  if (iter.hasNext()) {
    return iter.next();
  }
  return parent.createFolder(name);
}

/**
 * ==============================================================================
 * WEBHOOK PARA SIGI & SCGCC (doGet / doPost)
 * ==============================================================================
 */
function doGet(e) {
  const action = (e && e.parameter && e.parameter.action) ? e.parameter.action : 'STATUS';
  
  if (action === 'INSPECT_CORRESPONDENCIAS') {
    const customId = e.parameter.folderId || null;
    const res = inspectCorrespondenciaFolders(customId);
    return ContentService.createTextOutput(JSON.stringify({ status: 'SUCCESS', count: res.length, data: res })).setMimeType(ContentService.MimeType.JSON);
  }

  if (action === 'GET_FILE_BASE64') {
    const fId = e.parameter.fileId;
    if (!fId) {
      return ContentService.createTextOutput(JSON.stringify({ status: 'ERROR', message: 'Falta parámetro fileId' })).setMimeType(ContentService.MimeType.JSON);
    }
    const res = getFileBase64(fId);
    return ContentService.createTextOutput(JSON.stringify(res)).setMimeType(ContentService.MimeType.JSON);
  }

  if (action === 'PROVISION_DATA_LAKE') {
    const res = provisionAll25StatesFast();
    return ContentService.createTextOutput(JSON.stringify({ status: 'SUCCESS', result: res })).setMimeType(ContentService.MimeType.JSON);
  }
  
  const status = {
    status: "ONLINE",
    servicio: "CORPOELEC GGPD Google Drive Webhook & SCGCC Data Hub",
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
