/**
 * ==============================================================================
 * CORPOELEC - GERENCIA GENERAL DE PLANIFICACIÓN DE DISTRIBUCIÓN (GGPD)
 * MOTOR DE INGESTA INTELIGENTE, CALIDAD ISO 8000 Y GOBERNANZA DE DATOS
 * ==============================================================================
 */

import * as XLSX from 'xlsx';
import { 
  ProcessDefinition, 
  ValidationReport, 
  InvalidRecordDetail, 
  IngestionSubmission, 
  DataLakeFolderNode 
} from '../types/ingestion';
import { VENEZUELAN_STATES } from '../mockData/portalData';
import { insforge, isInsforgeConfigured } from './insforgeClient';
import { getMasterCatalogs } from './instrumentAuditorService';

const STORAGE_KEY_PROCESSES = 'CORPOELEC_SIGI_PROCESSES_V1';
const STORAGE_KEY_SUBMISSIONS = 'CORPOELEC_SIGI_SUBMISSIONS_V1';
const GDRIVE_WEBHOOK_URL = 'https://script.google.com/macros/s/AKfycbxonVU31GBXuVCfu_5G8hmADkYFB7yriPJVt2nS9w7uMjsERu5_WPzpQSVbuB2kvtQkqA/exec';



export const DEFAULT_PROCESSES: ProcessDefinition[] = [
  {
    id: 'sctis',
    code: '01_SCTIS',
    name: 'Tiras de Interrupción de Distribución',
    shortName: 'Tiras Interrupción',
    description: 'Registro certificado semanal y cierre mensual de eventos de interrupción en subestaciones y circuitos.',
    category: 'CORE_ESTRATEGICO',
    targetApp: 'SCTIS V2.0',
    frequency: 'SEMANAL',
    namingPattern: 'SCTIS_[ESTADO]_[YYYYMMDD]_SEM[N]_V01.xlsx',
    icon: 'Cpu',
    color: '#00f2fe',
    createdAt: '2026-08-01T00:00:00Z',
    isDynamic: false,
    provisionedStatesCount: 25,
    requiredColumns: [
      { name: 'COD_ESTADO', type: 'string', description: 'Código del Estado (ej. DCA, MIR, ZUL)', required: true, sampleValue: 'DCA' },
      { name: 'SUBESTACION', type: 'string', description: 'Nombre oficial de la Subestación', required: true, sampleValue: 'S/E CHACAO' },
      { name: 'CIRCUITO', type: 'string', description: 'Código o nombre del circuito afectado', required: true, sampleValue: 'CIR-CHA-01' },
      { name: 'FECHA_APERTURA', type: 'string', description: 'Fecha y hora de inicio (YYYY-MM-DD HH:MM)', required: true, sampleValue: '2026-08-14 14:30' },
      { name: 'FECHA_CIERRE', type: 'string', description: 'Fecha y hora de restablecimiento', required: true, sampleValue: '2026-08-14 16:00' },
      { name: 'MW_INTERRUMPIDOS', type: 'number', description: 'Carga interrumpida en MegaWatts (>0)', required: true, sampleValue: '4.5' },
      { name: 'CAUSA_CODIGO', type: 'string', description: 'Código de causa normalizado según norma SEN', required: true, sampleValue: 'CAU-DIS-004' },
      { name: 'OBSERVACIONES', type: 'string', description: 'Detalle de la maniobra o falla', required: false, sampleValue: 'Disparo por sobrecorriente en celda 4' }
    ]
  },
  {
    id: 'scein',
    code: '02_SCEIN',
    name: 'Equipos Indisponibles de Subestaciones',
    shortName: 'Equipos Indisponibles',
    description: 'Control y seguimiento en tiempo real de transformadores de potencia, interruptores y bahías fuera de servicio.',
    category: 'CORE_ESTRATEGICO',
    targetApp: 'SCEIN V3.0',
    frequency: 'SEMANAL',
    namingPattern: 'SCEIN_[ESTADO]_[YYYYMMDD]_V01.xlsx',
    icon: 'AlertTriangle',
    color: '#f59e0b',
    createdAt: '2026-08-01T00:00:00Z',
    isDynamic: false,
    provisionedStatesCount: 25,
    requiredColumns: [
      { name: 'COD_ESTADO', type: 'string', description: 'Código del Estado', required: true, sampleValue: 'ZUL' },
      { name: 'SUBESTACION', type: 'string', description: 'Subestación eléctrica', required: true, sampleValue: 'S/E CUATRICENTENARIO' },
      { name: 'TAG_EQUIPO', type: 'string', description: 'Identificador del activo (ej. TR-01, INT-115KV)', required: true, sampleValue: 'TR-02-115/13.8KV' },
      { name: 'TIPO_EQUIPO', type: 'string', description: 'Categoría (Transformador, Interruptor, Seccionador)', required: true, sampleValue: 'TRANSFORMADOR' },
      { name: 'FECHA_FALLA', type: 'string', description: 'Fecha de salida de servicio', required: true, sampleValue: '2026-08-10' },
      { name: 'ESTATUS_EQUIPO', type: 'string', description: 'INDISPONIBLE / EN_REPARACION / REEMPLAZADO', required: true, sampleValue: 'INDISPONIBLE' },
      { name: 'DIAGNOSTICO_TECNICO', type: 'string', description: 'Dictamen de protecciones o laboratorio', required: true, sampleValue: 'Bajo aislamiento devanado secundario' }
    ]
  },
  {
    id: 'scppe',
    code: '03_SCPPE',
    name: 'Planes, Proyectos Especiales y Viáticos SAMC',
    shortName: 'Planes & Viáticos',
    description: 'Proyectos POA/PRTSEN, modelado analítico de capacidad y control presupuestario de viáticos de campo.',
    category: 'CORE_ESTRATEGICO',
    targetApp: 'SCPPE V3.0',
    frequency: 'MENSUAL',
    namingPattern: 'SCPPE_[ESTADO]_[YYYYMMDD]_PROYECTOS_V01.xlsx',
    icon: 'Zap',
    color: '#10b981',
    createdAt: '2026-08-01T00:00:00Z',
    isDynamic: false,
    provisionedStatesCount: 25,
    requiredColumns: [
      { name: 'COD_ESTADO', type: 'string', description: 'Código del Estado', required: true, sampleValue: 'CAR' },
      { name: 'COD_PROYECTO', type: 'string', description: 'Código presupuestario POA/PRTSEN', required: true, sampleValue: 'PRT-CAR-2026-012' },
      { name: 'NOMBRE_PROYECTO', type: 'string', description: 'Denominación de la obra o plan', required: true, sampleValue: 'Adecuación de alimentador Zona Industrial Valencia' },
      { name: 'AVANCE_FISICO_PCT', type: 'number', description: 'Porcentaje de ejecución física (0 a 100)', required: true, sampleValue: '75.5' },
      { name: 'MONTO_EJECUTADO_BS', type: 'number', description: 'Gasto ejecutado en Bs.', required: true, sampleValue: '450000.00' },
      { name: 'RESPONSABLE_TECNICO', type: 'string', description: 'Ingeniero inspector asignado', required: true, sampleValue: 'Ing. Carlos Mendoza' }
    ]
  },
  {
    id: 'scmtp',
    code: '04_SCMTP',
    name: 'Minutas de Trabajo y Gestión de Compromisos',
    shortName: 'Minutas & Tareas',
    description: 'Actas de reuniones técnicas, asignación de compromisos operativos y medición de SLAs de cumplimiento.',
    category: 'CORE_ESTRATEGICO',
    targetApp: 'SCMTP V2.0',
    frequency: 'SEMANAL',
    namingPattern: 'SCMTP_[ESTADO]_[YYYYMMDD]_MINUTA_V01.xlsx',
    icon: 'CheckSquare',
    color: '#8b5cf6',
    createdAt: '2026-08-01T00:00:00Z',
    isDynamic: false,
    provisionedStatesCount: 25,
    requiredColumns: [
      { name: 'COD_ESTADO', type: 'string', description: 'Código del Estado', required: true, sampleValue: 'BOL' },
      { name: 'NUMERO_MINUTA', type: 'string', description: 'Código de acta o minuta', required: true, sampleValue: 'MIN-BOL-2026-32' },
      { name: 'TITULO_COMPROMISO', type: 'string', description: 'Acción u orden técnica acordada', required: true, sampleValue: 'Inspección termográfica S/E Cayaurima' },
      { name: 'RESPONSABLE_ASIGNADO', type: 'string', description: 'Especialista o cuadrilla responsable', required: true, sampleValue: 'Tsu. Pedro Gómez' },
      { name: 'FECHA_COMPROMISO', type: 'string', description: 'Fecha límite de ejecución', required: true, sampleValue: '2026-08-20' },
      { name: 'ESTADO_TAREA', type: 'string', description: 'PENDIENTE / EN_PROCESO / COMPLETADA', required: true, sampleValue: 'PENDIENTE' }
    ]
  },
  {
    id: 'scpyp',
    code: '05_SCPYP',
    name: 'Seguimiento y Control de Pica y Poda de Circuitos',
    shortName: 'SC Pica y Poda',
    description: 'Mantenimiento preventivo y despeje de vegetación en corredores de líneas y alimentadores de distribución.',
    category: 'MANTENIMIENTO_CONTROL',
    targetApp: 'Módulo SIGI',
    frequency: 'SEMANAL',
    namingPattern: 'SCPYP_[ESTADO]_[YYYYMMDD]_SEM[N]_V01.xlsx',
    icon: 'Scissors',
    color: '#14b8a6',
    createdAt: '2026-08-14T00:00:00Z',
    isDynamic: true,
    provisionedStatesCount: 25,
    requiredColumns: [
      { name: 'COD_ESTADO', type: 'string', description: 'Código del Estado', required: true, sampleValue: 'MIR' },
      { name: 'CIRCUITO', type: 'string', description: 'Circuito intervenido', required: true, sampleValue: 'CIR-LOS-TEQUES-03' },
      { name: 'KM_PODADOS', type: 'number', description: 'Kilómetros lineales despejados (>0)', required: true, sampleValue: '12.4' },
      { name: 'NUM_ARBOLES_CRITICOS', type: 'number', description: 'Árboles de alto riesgo talados/podados', required: true, sampleValue: '8' },
      { name: 'CUADRILLA_RESPONSABLE', type: 'string', description: 'Nombre o código de cuadrilla', required: true, sampleValue: 'Cuadrilla Los Altos' },
      { name: 'FECHA_EJECUCION', type: 'string', description: 'Fecha de la labor', required: true, sampleValue: '2026-08-12' }
    ]
  },
  {
    id: 'scdes',
    code: '06_SCDES',
    name: 'Seguimiento y Control de Desmalezamiento en Subestaciones',
    shortName: 'SC Desmalezamiento',
    description: 'Despeje de patios de transformación y áreas perimetrales en subestaciones eléctricas.',
    category: 'MANTENIMIENTO_CONTROL',
    targetApp: 'Módulo SIGI',
    frequency: 'MENSUAL',
    namingPattern: 'SCDES_[ESTADO]_[YYYYMMDD]_V01.xlsx',
    icon: 'Trees',
    color: '#84cc16',
    createdAt: '2026-08-14T00:00:00Z',
    isDynamic: true,
    provisionedStatesCount: 25,
    requiredColumns: [
      { name: 'COD_ESTADO', type: 'string', description: 'Código del Estado', required: true, sampleValue: 'ARA' },
      { name: 'SUBESTACION', type: 'string', description: 'Subestación desmalezada', required: true, sampleValue: 'S/E SAN IGNACIO' },
      { name: 'PATIO_INTERVENIDO', type: 'string', description: 'Patio 115kV / 13.8kV / Perímetro', required: true, sampleValue: 'Patio de Transformadores 115kV' },
      { name: 'HECTAREAS_DESMALEZADAS', type: 'number', description: 'Área en hectáreas (>0)', required: true, sampleValue: '1.8' },
      { name: 'APLICACION_HERBICIDA', type: 'string', description: 'SI / NO', required: true, sampleValue: 'SI' },
      { name: 'FECHA_INSPECCION', type: 'string', description: 'Fecha de culminación', required: true, sampleValue: '2026-08-08' }
    ]
  },
  {
    id: 'sctrf',
    code: '07_SCTRF',
    name: 'Seguimiento y Control de Transformadores Fallados y Reemplazados',
    shortName: 'SC Transformadores',
    description: 'Censo, diagnóstico y reposición de transformadores de distribución urbana y rural.',
    category: 'ACTIVOS_RED',
    targetApp: 'Módulo SIGI',
    frequency: 'SEMANAL',
    namingPattern: 'SCTRF_[ESTADO]_[YYYYMMDD]_V01.xlsx',
    icon: 'Box',
    color: '#ec4899',
    createdAt: '2026-08-14T00:00:00Z',
    isDynamic: true,
    provisionedStatesCount: 25,
    requiredColumns: [
      { name: 'COD_ESTADO', type: 'string', description: 'Código del Estado', required: true, sampleValue: 'LAR' },
      { name: 'MUNICIPIO_PARROQUIA', type: 'string', description: 'Ubicación geográfica', required: true, sampleValue: 'Iribarren - Concepción' },
      { name: 'CAPACIDAD_KVA', type: 'number', description: 'Capacidad en KVA (ej. 25, 37.5, 50, 75, 100)', required: true, sampleValue: '50' },
      { name: 'SERIAL_FALLADO', type: 'string', description: 'Serial de equipo averiado', required: true, sampleValue: 'TRF-LAR-9821' },
      { name: 'SERIAL_INSTALADO', type: 'string', description: 'Serial de equipo nuevo/reparado', required: true, sampleValue: 'TRF-VEN-2026-441' },
      { name: 'FECHA_SUSTITUCION', type: 'string', description: 'Fecha de puesta en servicio', required: true, sampleValue: '2026-08-13' },
      { name: 'FAMILIAS_BENEFICIADAS', type: 'number', description: 'Usuarios atendidos', required: true, sampleValue: '120' }
    ]
  }
];

export const getStoredProcesses = (): ProcessDefinition[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PROCESSES);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error('Error reading stored processes:', e);
  }
  return DEFAULT_PROCESSES;
};

/**
 * Sincroniza procesos desde InsForge hacia la caché local
 */
export const syncProcessesFromSupabase = async (): Promise<ProcessDefinition[]> => {
  try {
    if (!isInsforgeConfigured) return getStoredProcesses();

    const { data, error } = await insforge.database
      .from('v_sigi_procesos_ingesta')
      .select('*');

    if (!error && data && data.length > 0) {
      const mapped: ProcessDefinition[] = data.map((row: any) => ({
        id: row.id,
        code: row.code,
        name: row.name,
        shortName: row.short_name,
        description: row.description || '',
        category: row.category || 'MANTENIMIENTO_CONTROL',
        targetApp: row.target_app || 'Módulo Dinámico SIGI',
        frequency: row.frequency || 'SEMANAL',
        namingPattern: row.naming_pattern || `${row.code}_[ESTADO]_[YYYYMMDD]_V01.xlsx`,
        icon: row.icon || 'Layers',
        color: row.color || '#00f2fe',
        createdAt: row.created_at || new Date().toISOString(),
        isDynamic: row.is_dynamic ?? true,
        provisionedStatesCount: row.provisioned_states_count || 25,
        requiredColumns: Array.isArray(row.required_columns) ? row.required_columns : []
      }));

      // Unir con los procesos base
      const local = getStoredProcesses();
      const mergedMap = new Map<string, ProcessDefinition>();
      DEFAULT_PROCESSES.forEach(p => mergedMap.set(p.id, p));
      local.forEach(p => mergedMap.set(p.id, p));
      mapped.forEach(p => mergedMap.set(p.id, p));

      const mergedList = Array.from(mergedMap.values());
      localStorage.setItem(STORAGE_KEY_PROCESSES, JSON.stringify(mergedList));
      return mergedList;
    }
  } catch (err) {
    console.warn('InsForge offline o tabla aún no creada, utilizando caché local:', err);
  }
  return getStoredProcesses();
};

export const saveProcessDefinition = (process: ProcessDefinition): void => {
  const current = getStoredProcesses();
  const existingIdx = current.findIndex(p => p.id === process.id || p.code === process.code);
  let updated: ProcessDefinition[];
  if (existingIdx >= 0) {
    updated = [...current];
    updated[existingIdx] = process;
  } else {
    updated = [...current, process];
  }
  localStorage.setItem(STORAGE_KEY_PROCESSES, JSON.stringify(updated));

  // Sincronización en segundo plano con InsForge
  if (isInsforgeConfigured) {
    const payload = {
      id: process.id,
      code: process.code,
      name: process.name,
      short_name: process.shortName,
      description: process.description,
      category: process.category,
      target_app: process.targetApp,
      frequency: process.frequency,
      naming_pattern: process.namingPattern,
      icon: process.icon,
      color: process.color,
      is_dynamic: process.isDynamic,
      provisioned_states_count: process.provisionedStatesCount,
      required_columns: process.requiredColumns,
      updated_at: new Date().toISOString()
    };

    (async () => {
      try {
        await insforge.database.from('cat_procesos_ingesta').upsert(payload);
      } catch (err) {
        console.warn('Error sincronizando proceso con InsForge:', err);
      }
    })();
  }
};

export const deleteProcessDefinition = (id: string): void => {
  const current = getStoredProcesses();
  const updated = current.filter(p => p.id !== id);
  localStorage.setItem(STORAGE_KEY_PROCESSES, JSON.stringify(updated));

  if (isInsforgeConfigured) {
    (async () => {
      try {
        await insforge.database.from('cat_procesos_ingesta').delete().eq('id', id);
      } catch (err) {
        console.warn('Error eliminando proceso en InsForge:', err);
      }
    })();
  }
};

export const getStoredSubmissions = (): IngestionSubmission[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SUBMISSIONS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.error('Error reading submissions:', e);
  }
  return [];
};

export const saveSubmissionRecord = (submission: IngestionSubmission, recordsPayload: Record<string, any>[] = []): void => {
  const current = getStoredSubmissions();
  const updated = [submission, ...current];
  localStorage.setItem(STORAGE_KEY_SUBMISSIONS, JSON.stringify(updated.slice(0, 100)));

  // Sincronizar lote con InsForge
  if (isInsforgeConfigured) {
    const dbRecord = {
      id: submission.batchId || `batch-${Date.now()}`,
      proceso_id: submission.processId,
      codigo_estado: submission.stateCode,
      creado_por: submission.uploadedBy,
      datos_json: {
        timestamp: submission.timestamp,
        original_file_name: submission.originalFileName,
        normalized_file_name: submission.normalizedFileName,
        gdrive_folder_path: submission.gdriveFolderPath,
        conforme_count: submission.conformeCount,
        no_conforme_count: submission.noConformeCount,
        status: submission.status,
        remediation_task_id: submission.remediationTaskId || null,
        records_payload: recordsPayload,
        metadata_auditoria: {
          source: 'PORTAL_SIGI_INGESTA_HUB',
          userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Node/Agent',
          savedAt: new Date().toISOString()
        }
      }
    };

    (async () => {
      try {
        await insforge.database.from('ingesta_registros_dinamicos').insert([dbRecord]);
      } catch (err) {
        console.warn('Error guardando lote en InsForge:', err);
      }
    })();
  }
};

/**
 * Validador de registro individual para formulario manual reactivo
 */
export const validateManualRecord = (
  record: Record<string, any>,
  process: ProcessDefinition,
  stateCode: string
): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  const masterCatalogs = getMasterCatalogs();

  process.requiredColumns.forEach(col => {
    const val = record[col.name];

    if (col.required && (val === undefined || val === null || val === '')) {
      errors.push(`El campo obligatorio '${col.name}' no puede estar vacío.`);
    }

    if (col.type === 'number' && val !== undefined && val !== null && val !== '') {
      const num = Number(val);
      if (isNaN(num)) {
        errors.push(`El campo '${col.name}' debe ser un número válido.`);
      } else if (num < 0 && (col.name.includes('MW') || col.name.includes('KM') || col.name.includes('HECTAREA') || col.name.includes('CAPACIDAD') || col.name.includes('CANTIDAD'))) {
        errors.push(`El campo '${col.name}' no puede ser negativo.`);
      }
    }

    // Validación contra Catálogo Maestro (MDM)
    if (col.type === 'catalog' && col.masterCatalogId && val) {
      const catalog = masterCatalogs.find(c => c.id === col.masterCatalogId);
      if (catalog) {
        const valStr = String(val).trim().toUpperCase();
        const found = catalog.items.some(item => 
          item.name.toUpperCase() === valStr || 
          item.code.toUpperCase() === valStr ||
          valStr.includes(item.name.toUpperCase())
        );
        if (!found) {
          errors.push(`El valor '${val}' en '${col.name}' no pertenece al catálogo oficial ${catalog.name}.`);
        }
      }
    }
  });

  return {
    isValid: errors.length === 0,
    errors
  };
};


/**
 * Generador de DDL SQL para tabla dedicada en PostgreSQL / Supabase
 */
export const generateProcessDDL = (process: ProcessDefinition): string => {
  const cleanTable = `ingesta_${process.code.toLowerCase().replace(/\s+/g, '_')}`;
  
  const colLines = process.requiredColumns.map(col => {
    let pgType = 'TEXT';
    if (col.type === 'number') pgType = 'NUMERIC(12,2)';
    if (col.type === 'date') pgType = 'TIMESTAMPTZ';
    if (col.type === 'boolean') pgType = 'BOOLEAN';

    const notNull = col.required ? ' NOT NULL' : '';
    return `  ${col.name.toLowerCase()} ${pgType}${notNull} -- ${col.description}`;
  });

  return `-- ============================================================================
-- DDL GENERADO AUTOMÁTICAMENTE PARA: ${process.name.toUpperCase()}
-- Código Proceso: ${process.code} | Esquema: sigi
-- ============================================================================

CREATE TABLE IF NOT EXISTS sigi.${cleanTable} (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id TEXT NOT NULL,
  cod_estado TEXT NOT NULL,
${colLines.join(',\n')},
  fecha_carga TIMESTAMPTZ DEFAULT now(),
  cargado_por TEXT NOT NULL,
  otqr_status TEXT DEFAULT 'CONFORME' CHECK (otqr_status IN ('CONFORME', 'EN_REMEDIACION'))
);

CREATE INDEX IF NOT EXISTS idx_${cleanTable}_estado ON sigi.${cleanTable}(cod_estado);
CREATE INDEX IF NOT EXISTS idx_${cleanTable}_batch ON sigi.${cleanTable}(batch_id);

GRANT ALL ON sigi.${cleanTable} TO postgres, service_role;
GRANT SELECT, INSERT ON sigi.${cleanTable} TO authenticated, anon;
`;
};


/**
 * ==============================================================================
 * VALIDADOR DE NOMENCLATURA ISO
 * ==============================================================================
 */
export const validateFileNameNomenclature = (
  fileName: string, 
  process: ProcessDefinition, 
  stateCode: string
): { isValid: boolean; suggestedName: string; errors: string[] } => {
  const cleanName = fileName.replace(/\.[^/.]+$/, "");
  const ext = fileName.split('.').pop()?.toLowerCase() || '';
  const errors: string[] = [];

  if (ext !== 'xlsx' && ext !== 'xls' && ext !== 'csv') {
    errors.push('La extensión del archivo debe ser .xlsx, .xls o .csv.');
  }

  const prefix = process.code.split('_')[1] || process.id.toUpperCase();
  const todayStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const suggestedName = `${prefix}_${stateCode}_${todayStr}_SEM32_V01.xlsx`;

  // Comprobar si el nombre contiene el prefijo del proceso y el código del estado
  const hasPrefix = cleanName.toUpperCase().includes(prefix.toUpperCase());
  const hasState = cleanName.toUpperCase().includes(stateCode.toUpperCase());

  if (!hasPrefix) {
    errors.push(`El nombre del archivo no incluye el código del proceso oficial (${prefix}).`);
  }
  if (!hasState && stateCode !== 'NAC') {
    errors.push(`El nombre del archivo no incluye el código de su estado (${stateCode}).`);
  }

  const isValid = errors.length === 0;
  return { isValid, suggestedName, errors };
};

/**
 * ==============================================================================
 * DICCIONARIO UNIVERSAL DE SINÓNIMOS DE ENCABEZADOS (ISO 8000 / CORPOELEC)
 * Mapea las variaciones típicas utilizadas por los 25 Estados a nombres canónicos
 * ==============================================================================
 */
export const UNIVERSAL_COLUMN_SYNONYMS: Record<string, string[]> = {
  'COD_ESTADO': ['ESTADO', 'COD_ESTADO', 'EDO', 'ENTIDAD', 'ESTADO_PROVINCIA', 'CODIGO_ESTADO', 'UBICACION_ESTADO', 'COD_EDO'],
  'SUBESTACION': ['SUBESTACION', 'S/E', 'SUB_ESTACION', 'SUB-ESTACION', 'ESTACION', 'NOMBRE_SE', 'SUBESTACION_CABECERA', 'S/E_CABECERA', 'SUBESTACION_ELECTRICA', 'SUBESTACIÓN'],
  'CIRCUITO': ['CIRCUITO', 'ALIMENTADOR', 'CTO', 'NOMBRE_CIRCUITO', 'NOMBRE_CT', 'CIRCUITO_AFECTADO', 'ALIMENTADOR_MT', 'LINEA_MT', 'ALIMENTADOR_DISTRIBUCION'],
  'FECHA_APERTURA': ['FECHA_APERTURA', 'FECHA_INICIO', 'INICIO', 'HORA_INICIO', 'FECHA_FALLA', 'FECHA_HORA_INICIO', 'FECHA/HORA_INICIO', 'FECHA_APERTURA_INTERRUPCION', 'HORA_APERTURA'],
  'FECHA_CIERRE': ['FECHA_CIERRE', 'FECHA_FIN', 'FIN', 'HORA_FIN', 'FECHA_RESTABLECIMIENTO', 'RESTABLECIMIENTO', 'FECHA_HORA_FIN', 'HORA_CIERRE'],
  'MW_INTERRUMPIDOS': ['MW_INTERRUMPIDOS', 'MW', 'CARGA_MW', 'CARGA_INTERRUMPIDA', 'CARGA_AFECTADA_MW', 'POTENCIA_MW', 'MW_AFECTADOS', 'CARGA_MW_AFECTADA'],
  'CAUSA_CODIGO': ['CAUSA_CODIGO', 'CAUSA', 'MOTIVO', 'ORIGEN_FALLA', 'CAUSA_INTERRUPCION', 'COD_CAUSA', 'DESCRIPCION_CAUSA', 'CAUSA_PRINCIPAL'],
  'OBSERVACIONES': ['OBSERVACIONES', 'OBSERVACION', 'DETALLE', 'DESCRIPCION', 'NOTAS', 'COMENTARIOS', 'ACCION_TOMADA', 'DIAGNOSTICO_PRELIMINAR'],
  'TAG_EQUIPO': ['TAG_EQUIPO', 'TAG', 'EQUIPO', 'CODIGO_EQUIPO', 'ID_EQUIPO', 'ACTIVO', 'NOMBRE_EQUIPO', 'ELEMENTO_FALLADO'],
  'TIPO_EQUIPO': ['TIPO_EQUIPO', 'TIPO', 'CATEGORIA_EQUIPO', 'ELEMENTO_TIPO', 'TIPO_ACTIVO'],
  'FECHA_FALLA': ['FECHA_FALLA', 'FECHA_INDISPONIBILIDAD', 'FECHA_EVENTO', 'FECHA_SALIDA', 'FECHA_DISPARO'],
  'ESTATUS_EQUIPO': ['ESTATUS_EQUIPO', 'ESTATUS', 'ESTADO_EQUIPO', 'CONDICION', 'ESTADO_ACTUAL'],
  'DIAGNOSTICO_TECNICO': ['DIAGNOSTICO_TECNICO', 'DIAGNOSTICO', 'DICTAMEN', 'ANALISIS_TECNICO', 'FALLA_DIAGNOSTICADA'],
  'COD_PROYECTO': ['COD_PROYECTO', 'CODIGO_PROYECTO', 'ID_PROYECTO', 'POA', 'PRTSEN', 'NUMERO_PROYECTO'],
  'NOMBRE_PROYECTO': ['NOMBRE_PROYECTO', 'PROYECTO', 'DENOMINACION', 'DESCRIPCION_PROYECTO', 'OBRA'],
  'AVANCE_FISICO_PCT': ['AVANCE_FISICO_PCT', 'AVANCE_FISICO', 'AVANCE_%', '%_AVANCE', 'AVANCE_PCT', 'PORCENTAJE_AVANCE', 'EJECUCION_FISICA'],
  'MONTO_EJECUTADO_BS': ['MONTO_EJECUTADO_BS', 'MONTO_EJECUTADO', 'GASTO_BS', 'MONTO_BS', 'EJECUTADO_BS', 'COSTO_BS', 'INVERSION_BS'],
  'RESPONSABLE_TECNICO': ['RESPONSABLE_TECNICO', 'RESPONSABLE', 'INGENIERO', 'INSPECTOR', 'SUPERVISOR', 'INGENIERO_RESIDENTE'],
  'NUMERO_MINUTA': ['NUMERO_MINUTA', 'MINUTA', 'NRO_MINUTA', 'ACTA', 'NUMERO_ACTA', 'COD_MINUTA'],
  'TITULO_COMPROMISO': ['TITULO_COMPROMISO', 'COMPROMISO', 'TAREA', 'TITULO_TAREA', 'ACCION_ACORDADA', 'ACTIVIDAD'],
  'RESPONSABLE_ASIGNADO': ['RESPONSABLE_ASIGNADO', 'ASIGNADO_A', 'RESPONSABLE', 'EJECUTOR', 'CUADRILLA'],
  'FECHA_COMPROMISO': ['FECHA_COMPROMISO', 'FECHA_LIMITE', 'FECHA_VENCIMIENTO', 'FECHA_ENTREGA'],
  'ESTADO_TAREA': ['ESTADO_TAREA', 'ESTATUS_TAREA', 'ESTADO', 'ESTATUS'],
  'KM_PODADOS': ['KM_PODADOS', 'KILOMETROS_PODADOS', 'KM_PODA', 'LONGITUD_KM', 'KM_DESPEJADOS', 'KM_EJECUTADOS'],
  'NUM_ARBOLES_CRITICOS': ['NUM_ARBOLES_CRITICOS', 'ARBOLES_CRITICOS', 'ARBOLES_PODADOS', 'ARBOLES_TALADOS', 'CANTIDAD_ARBOLES'],
  'CUADRILLA_RESPONSABLE': ['CUADRILLA_RESPONSABLE', 'CUADRILLA', 'EQUIPO_TRABAJO', 'RESPONSABLE_CUADRILLA'],
  'FECHA_EJECUCION': ['FECHA_EJECUCION', 'FECHA', 'FECHA_TRABAJO', 'FECHA_MANTENIMIENTO', 'FECHA_LABOR'],
  'PATIO_INTERVENIDO': ['PATIO_INTERVENIDO', 'PATIO', 'AREA_INTERVENIDA', 'SECTOR_SE', 'PATIO_SUBESTACION'],
  'HECTAREAS_DESMALEZADAS': ['HECTAREAS_DESMALEZADAS', 'HECTAREAS', 'HA_DESMALEZADAS', 'AREA_HA', 'HECTAREAS_LIMPIAS'],
  'APLICACION_HERBICIDA': ['APLICACION_HERBICIDA', 'HERBICIDA', 'QUIMICO', 'APLICO_HERBICIDA'],
  'FECHA_INSPECCION': ['FECHA_INSPECCION', 'FECHA_REVISION', 'FECHA_CIERRE', 'FECHA_SUPERVISION'],
  'CAPACIDAD_KVA': ['CAPACIDAD_KVA', 'KVA', 'CAPACIDAD', 'POTENCIA_KVA', 'CAP_KVA'],
  'SERIAL_FALLADO': ['SERIAL_FALLADO', 'SERIAL_AVERIADO', 'SERIAL_VIEJO', 'SERIAL_RETIRADO'],
  'SERIAL_INSTALADO': ['SERIAL_INSTALADO', 'SERIAL_NUEVO', 'SERIAL_COLOCADO', 'SERIAL_REEMPLAZO'],
  'FECHA_SUSTITUCION': ['FECHA_SUSTITUCION', 'FECHA_REEMPLAZO', 'FECHA_INSTALACION', 'FECHA_CAMBIO'],
  'FAMILIAS_BENEFICIADAS': ['FAMILIAS_BENEFICIADAS', 'FAMILIAS', 'USUARIOS_ATENDIDOS', 'USUARIOS_BENEFICIADOS', 'POBLACION_ATENDIDA']
};

/**
 * Normaliza un string eliminando acentos, caracteres especiales y espacios múltiples
 */
const normalizeHeaderKey = (str: string): string => {
  return str
    .toUpperCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^A-Z0-9]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');
};

/**
 * Selecciona automáticamente la mejor hoja operativa en un libro multi-hoja
 */
export const detectBestWorksheet = (workbook: XLSX.WorkBook, process: ProcessDefinition): string => {
  const sheetNames = workbook.SheetNames;
  if (sheetNames.length === 1) return sheetNames[0];

  const processKeywords = [
    process.code.split('_')[1] || '',
    process.id,
    'DISTRIBUCION',
    'INTERRUPCIONES',
    'TIRAS',
    'EVENTOS',
    'EQUIPOS',
    'PROYECTOS',
    'MINUTAS',
    'PICA',
    'DESMALEZAMIENTO',
    'TRANSFORMADORES',
    'DATOS',
    'REGISTRO'
  ].filter(Boolean).map(k => k.toUpperCase());

  // 1. Buscar coincidencia en nombre de hoja
  for (const name of sheetNames) {
    const norm = name.toUpperCase();
    if (norm.includes('PORTADA') || norm.includes('INSTRUCCION') || norm.includes('GRAFICO') || norm.includes('RESUMEN')) {
      continue;
    }
    if (processKeywords.some(k => norm.includes(k))) {
      return name;
    }
  }

  // 2. Si no coincide por nombre, buscar la hoja con mayor cantidad de datos útiles
  let bestSheet = sheetNames[0];
  let maxRows = -1;

  for (const name of sheetNames) {
    const ws = workbook.Sheets[name];
    if (!ws || !ws['!ref']) continue;
    const range = XLSX.utils.decode_range(ws['!ref']);
    const numRows = range.e.r - range.s.r + 1;
    if (numRows > maxRows) {
      maxRows = numRows;
      bestSheet = name;
    }
  }

  return bestSheet;
};

/**
 * Sanitiza números venezolanos/internacionales (comas, Bs., $, %, espacios)
 */
export const sanitizeNumberValue = (val: any): number | null => {
  if (val === undefined || val === null || val === '') return null;
  if (typeof val === 'number') return isNaN(val) ? null : val;

  let s = String(val).trim()
    .replace(/Bs\.?|\$|USD|EUR|%|\s/gi, '')
    .replace(/\.(?=\d{3})/g, '') // Eliminar puntos de miles
    .replace(',', '.');          // Reemplazar coma decimal por punto

  const num = parseFloat(s);
  return isNaN(num) ? null : num;
};

/**
 * Sanitiza horas y fechas con comas tipográficas o formato Excel
 */
export const sanitizeDateOrTimeString = (val: any): string => {
  if (val === undefined || val === null || val === '') return '';
  
  // Si es un número serial de fecha de Excel
  if (typeof val === 'number' && val > 30000 && val < 60000) {
    const jsDate = new Date((val - (25567 + 2)) * 86400 * 1000);
    if (!isNaN(jsDate.getTime())) {
      return jsDate.toISOString().slice(0, 19).replace('T', ' ');
    }
  }

  let s = String(val).trim();
  // Limpiar comas tipográficas en horas (ej: "08,:54:00," -> "08:54:00")
  s = s.replace(/,:/g, ':').replace(/,/g, '').trim();

  return s;
};

/**
 * Escanea dinámicamente hasta la fila 25 para detectar la cabecera real y mapear columnas
 */
export const detectHeaderRowAndMapColumns = (
  worksheet: XLSX.WorkSheet,
  process: ProcessDefinition
): {
  headerRowIndex: number;
  columnMap: Record<string, number>; // canonicalName -> colIndex
  detectedHeaders: string[];
  totalRows: number;
  matrixData: any[][];
} => {
  const matrix: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });
  const maxScanRows = Math.min(matrix.length, 25);
  const requiredCanonicalCols = process.requiredColumns.map(c => c.name);

  let bestHeaderRowIndex = 0;
  let bestScore = -1;
  let bestColumnMap: Record<string, number> = {};
  let bestDetectedHeaders: string[] = [];

  for (let r = 0; r < maxScanRows; r++) {
    const row = matrix[r];
    if (!Array.isArray(row) || row.length === 0) continue;

    const rowNormalized = row.map(cell => normalizeHeaderKey(String(cell || '')));
    const candidateMap: Record<string, number> = {};
    let score = 0;

    requiredCanonicalCols.forEach(canonicalCol => {
      const canonicalNorm = normalizeHeaderKey(canonicalCol);
      const synonyms = (UNIVERSAL_COLUMN_SYNONYMS[canonicalCol] || [canonicalCol]).map(normalizeHeaderKey);

      // Buscar si alguna celda de la fila r coincide con el nombre canónico o alguno de sus sinónimos
      for (let c = 0; c < rowNormalized.length; c++) {
        const cellNorm = rowNormalized[c];
        if (!cellNorm) continue;

        if (cellNorm === canonicalNorm || synonyms.includes(cellNorm)) {
          candidateMap[canonicalCol] = c;
          score += 3; // Coincidencia exacta o sinónimo fuerte
          break;
        } else if (synonyms.some(syn => cellNorm.includes(syn) || syn.includes(cellNorm))) {
          if (candidateMap[canonicalCol] === undefined) {
            candidateMap[canonicalCol] = c;
            score += 1; // Coincidencia parcial
          }
        }
      }
    });

    if (score > bestScore) {
      bestScore = score;
      bestHeaderRowIndex = r;
      bestColumnMap = candidateMap;
      bestDetectedHeaders = row.map(cell => String(cell || '').trim());
    }
  }

  // Fallback si no hubo coincidencia alta: usar fila 0
  if (bestScore <= 0 && matrix.length > 0) {
    bestHeaderRowIndex = 0;
    bestDetectedHeaders = matrix[0].map(cell => String(cell || '').trim());
    requiredCanonicalCols.forEach((col, idx) => {
      if (idx < matrix[0].length) {
        bestColumnMap[col] = idx;
      }
    });
  }

  return {
    headerRowIndex: bestHeaderRowIndex,
    columnMap: bestColumnMap,
    detectedHeaders: bestDetectedHeaders,
    totalRows: matrix.length,
    matrixData: matrix
  };
};

/**
 * ==============================================================================
 * MOTOR DE VALIDACIÓN DE CONTENIDO Y FILAS (ISO 8000-110 UNIVERSAL INTELIGENTE)
 * ==============================================================================
 */
export const validateExcelContent = async (
  file: File,
  process: ProcessDefinition,
  stateCode: string
): Promise<ValidationReport> => {
  const data = await file.arrayBuffer();
  const workbook = XLSX.read(data, { type: 'array' });
  
  // 1. Selección inteligente de la mejor hoja de datos
  const bestSheetName = detectBestWorksheet(workbook, process);
  const worksheet = workbook.Sheets[bestSheetName];

  // 2. Detección dinámica de cabecera (escaneando hasta fila 25) y sinónimos de columnas
  const { headerRowIndex, columnMap, detectedHeaders, matrixData } = detectHeaderRowAndMapColumns(worksheet, process);

  const nomenclatureCheck = validateFileNameNomenclature(file.name, process, stateCode);
  const schemaErrors: string[] = [];

  // Verificar columnas obligatorias mapeadas
  const requiredCols = process.requiredColumns.filter(c => c.required);
  const missingCols = requiredCols.filter(col => columnMap[col.name] === undefined);

  if (missingCols.length > 0) {
    schemaErrors.push(
      `No se detectaron las columnas obligatorias: ${missingCols.map(c => c.name).join(', ')}. ` +
      `Encabezados encontrados en fila ${headerRowIndex + 1}: [${detectedHeaders.filter(Boolean).slice(0, 8).join(', ')}...]`
    );
  }

  const validRecords: Record<string, any>[] = [];
  const invalidRecords: InvalidRecordDetail[] = [];
  const masterCatalogs = getMasterCatalogs();

  // 3. Procesamiento de filas de datos a partir de headerRowIndex + 1
  const dataRows = matrixData.slice(headerRowIndex + 1);

  dataRows.forEach((rowArray, idx) => {
    const rowNum = headerRowIndex + idx + 2; // Número de fila real 1-indexed
    
    // Descartar filas completamente vacías
    if (!Array.isArray(rowArray) || rowArray.every(c => c === '' || c === null || c === undefined)) {
      return;
    }

    const rowObj: Record<string, any> = {};
    const rowErrors: string[] = [];

    // Mapear y sanitizar cada columna requerida por el proceso
    process.requiredColumns.forEach(col => {
      const colIdx = columnMap[col.name];
      let rawVal = colIdx !== undefined ? rowArray[colIdx] : '';

      // Sanitización según tipo
      if (col.type === 'number') {
        const sanitizedNum = sanitizeNumberValue(rawVal);
        if (sanitizedNum !== null) {
          rowObj[col.name] = sanitizedNum;
        } else if (rawVal !== '' && rawVal !== null && rawVal !== undefined) {
          rowErrors.push(`El campo '${col.name}' con valor '${rawVal}' no es un número válido.`);
          rowObj[col.name] = rawVal;
        } else {
          rowObj[col.name] = null;
        }

        if (sanitizedNum !== null && sanitizedNum < 0 && (
          col.name.includes('MW') || col.name.includes('KM') || 
          col.name.includes('HECTAREA') || col.name.includes('CAPACIDAD') ||
          col.name.includes('AVANCE') || col.name.includes('MONTO')
        )) {
          rowErrors.push(`El campo '${col.name}' no puede ser negativo (${sanitizedNum}).`);
        }
      } else if (col.type === 'date' || col.name.includes('FECHA') || col.name.includes('HORA')) {
        const sanitizedDate = sanitizeDateOrTimeString(rawVal);
        rowObj[col.name] = sanitizedDate;
      } else {
        const sanitizedStr = String(rawVal ?? '').trim();
        rowObj[col.name] = sanitizedStr;
      }

      // Validación de obligatoriedad
      const currentVal = rowObj[col.name];
      if (col.required && (currentVal === '' || currentVal === null || currentVal === undefined)) {
        rowErrors.push(`Campo obligatorio '${col.name}' está vacío.`);
      }

      // Validación contra Catálogo Maestro (MDM)
      if (col.type === 'catalog' && col.masterCatalogId && currentVal) {
        const catalog = masterCatalogs.find(c => c.id === col.masterCatalogId);
        if (catalog) {
          const valStr = String(currentVal).trim().toUpperCase();
          const found = catalog.items.some(item => 
            item.name.toUpperCase() === valStr || 
            item.code.toUpperCase() === valStr ||
            valStr.includes(item.name.toUpperCase())
          );
          if (!found) {
            rowErrors.push(`El valor '${currentVal}' en '${col.name}' no coincide con el catálogo oficial ${catalog.name}.`);
          }
        }
      }
    });

    if (rowErrors.length === 0) {
      validRecords.push(rowObj);
    } else {
      invalidRecords.push({
        rowNumber: rowNum,
        data: rowObj,
        errors: rowErrors
      });
    }
  });

  const total = validRecords.length + invalidRecords.length;
  const validCount = validRecords.length;
  const invalidCount = invalidRecords.length;
  const otqrScore = total > 0 ? Math.round((validCount / total) * 100) : 0;
  const batchId = `BATCH-${process.code.split('_')[1]}-${stateCode}-${Date.now().toString().slice(-6)}`;

  return {
    fileName: file.name,
    fileSize: file.size,
    stateCode,
    processId: process.id,
    nomenclatureValid: nomenclatureCheck.isValid,
    nomenclatureErrors: nomenclatureCheck.errors,
    suggestedName: nomenclatureCheck.suggestedName,
    schemaValid: schemaErrors.length === 0,
    schemaErrors,
    totalRows: total,
    validRowsCount: validCount,
    invalidRowsCount: invalidCount,
    validRecords,
    invalidRecords,
    timestamp: new Date().toISOString(),
    batchId,
    otqrScore
  };
};

/**
 * ==============================================================================
 * GENERADOR DE ARCHIVO DE REMEDIACIÓN (.XLSX) PARA EL USUARIO
 * ==============================================================================
 */
export const exportRemediationExcel = (
  invalidRecords: InvalidRecordDetail[],
  process: ProcessDefinition,
  stateCode: string
): void => {
  const remediationData = invalidRecords.map(item => ({
    'FILA_ORIGINAL': item.rowNumber,
    ...item.data,
    'ERRORES_ISO_8000_A_SUBSANAR': item.errors.join(' | ')
  }));

  const worksheet = XLSX.utils.json_to_sheet(remediationData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'REMEDIACION_ERRORES');

  const prefix = process.code.split('_')[1] || process.id.toUpperCase();
  const todayStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const outFileName = `${prefix}_${stateCode}_${todayStr}_REMEDIACION_ISO8000.xlsx`;

  XLSX.writeFile(workbook, outFileName);
};

/**
 * ==============================================================================
 * GENERADOR DE PLANTILLA OFICIAL EN BLANCO (.XLSX)
 * ==============================================================================
 */
export const exportOfficialTemplateExcel = (process: ProcessDefinition): void => {
  const masterCatalogs = getMasterCatalogs();
  const sampleObj: Record<string, any> = {};

  process.requiredColumns.forEach(col => {
    if (col.sampleValue) {
      sampleObj[col.name] = col.sampleValue;
    } else if (col.type === 'catalog' && col.masterCatalogId) {
      const catalog = masterCatalogs.find(c => c.id === col.masterCatalogId);
      sampleObj[col.name] = catalog?.items[0]?.name || 'OPCION_CATALOGO';
    } else if (col.type === 'number') {
      sampleObj[col.name] = 0;
    } else if (col.type === 'date') {
      sampleObj[col.name] = '2026-08-15';
    } else {
      sampleObj[col.name] = 'EJEMPLO';
    }
  });

  const templateData = [sampleObj];
  const worksheet = XLSX.utils.json_to_sheet(templateData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'PLANTILLA_OFICIAL');

  const prefix = process.code.split('_')[1] || process.id.toUpperCase();
  const outFileName = `PLANTILLA_NORMATIVA_${prefix}_SEN_2026.xlsx`;

  XLSX.writeFile(workbook, outFileName);
};


/**
 * ==============================================================================
 * DISPARO DE APROVISIONAMIENTO EN GOOGLE DRIVE MEDIANTE WEBHOOK
 * ==============================================================================
 */
export const triggerGoogleDriveProvisioning = async (
  action: 'PROVISION_DATA_LAKE' | 'PROVISION_NEW_PROCESS',
  params?: { code?: string; name?: string }
): Promise<{ success: boolean; message: string; data?: any }> => {
  const queryParams = new URLSearchParams({
    action,
    code: params?.code || '',
    name: params?.name || '',
    timestamp: new Date().toISOString()
  });

  const fullUrl = `${GDRIVE_WEBHOOK_URL}?${queryParams.toString()}`;

  try {
    await fetch(fullUrl, {
      method: 'GET',
      mode: 'no-cors',
      cache: 'no-cache'
    });
    return {
      success: true,
      message: `Comando ${action} despachado exitosamente al Data Lake en Google Drive.`
    };
  } catch (e: any) {
    return {
      success: false,
      message: `Error comunicando con Google Drive Webhook: ${e.message}`
    };
  }
};

/**
 * Generador de árbol virtual de carpetas para visualización en el portal
 */
export const buildVirtualDataLakeTree = (): DataLakeFolderNode => {
  const processes = getStoredProcesses();
  
  return {
    name: 'GGPD_DATA_LAKE_OFICIAL (Raíz)',
    path: '/GGPD_DATA_LAKE_OFICIAL',
    type: 'folder',
    status: 'ONLINE',
    children: [
      ...VENEZUELAN_STATES.map((st: any) => {
        const stateCodePrefix = `${st.code}`;
        return {
          name: `${stateCodePrefix}_${st.name.toUpperCase().replace(/\s+/g, '_')}`,
          path: `/GGPD_DATA_LAKE_OFICIAL/${stateCodePrefix}_${st.name.toUpperCase().replace(/\s+/g, '_')}`,
          type: 'folder' as const,
          stateCode: st.code,
          status: 'PROVISIONED' as const,
          children: processes.map(pr => ({
            name: `${pr.code}_${pr.shortName.toUpperCase().replace(/\s+/g, '_')}`,
            path: `/GGPD_DATA_LAKE_OFICIAL/${stateCodePrefix}_${st.name.toUpperCase().replace(/\s+/g, '_')}/${pr.code}/2026/08_AGOSTO`,
            type: 'folder' as const,
            processCode: pr.code,
            status: 'PROVISIONED' as const,
            filesCount: Math.floor(Math.random() * 8) + 2,
            lastUpdated: '14/08/2026'
          }))
        };
      }),
      {
        name: '99_CONSOLIDADOS_NACIONALES',
        path: '/GGPD_DATA_LAKE_OFICIAL/99_CONSOLIDADOS_NACIONALES/2026',
        type: 'folder' as const,
        status: 'PROVISIONED' as const,
        children: [
          { name: 'REPORTES_EJECUTIVOS_MPPEE', path: '/GGPD_DATA_LAKE_OFICIAL/99_CONSOLIDADOS/2026/REPORTES', type: 'folder' as const },
          { name: 'MATRICES_DEDUPLICADAS_ISO8000', path: '/GGPD_DATA_LAKE_OFICIAL/99_CONSOLIDADOS/2026/MATRICES', type: 'folder' as const }
        ]
      }
    ]
  };
};
