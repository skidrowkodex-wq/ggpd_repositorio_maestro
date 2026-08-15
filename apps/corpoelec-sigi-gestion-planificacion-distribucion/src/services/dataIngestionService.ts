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
import { supabase } from '../lib/supabase';
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
 * Sincroniza procesos desde Supabase hacia la caché local
 */
export const syncProcessesFromSupabase = async (): Promise<ProcessDefinition[]> => {
  try {
    if (!supabase) return getStoredProcesses();

    // Intentar consultar esquema sigi o public
    let response = await supabase
      .schema('sigi')
      .from('cat_procesos_ingesta')
      .select('*');

    if (response.error) {
      response = await supabase
        .from('cat_procesos_ingesta')
        .select('*');
    }

    if (response.data && response.data.length > 0) {
      const mapped: ProcessDefinition[] = response.data.map((row: any) => ({
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
    console.warn('Supabase offline o tabla aún no creada, utilizando caché local:', err);
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

  // Sincronización en segundo plano con Supabase si está disponible
  if (supabase) {
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
        if (!supabase) return;
        const resSigi = await supabase.schema('sigi').from('cat_procesos_ingesta').upsert(payload);
        if (resSigi.error) {
          await supabase.from('cat_procesos_ingesta').upsert(payload);
        }
      } catch (err) {
        console.warn('Error sincronizando proceso con Supabase:', err);
      }
    })();
  }
};

export const deleteProcessDefinition = (id: string): void => {
  const current = getStoredProcesses();
  const updated = current.filter(p => p.id !== id);
  localStorage.setItem(STORAGE_KEY_PROCESSES, JSON.stringify(updated));

  if (supabase) {
    (async () => {
      try {
        if (!supabase) return;
        const resSigi = await supabase.schema('sigi').from('cat_procesos_ingesta').delete().eq('id', id);
        if (resSigi.error) {
          await supabase.from('cat_procesos_ingesta').delete().eq('id', id);
        }
      } catch (err) {
        console.warn('Error eliminando proceso en Supabase:', err);
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

  // Sincronizar lote con Supabase
  if (supabase) {
    const dbRecord = {
      batch_id: submission.batchId,
      process_id: submission.processId,
      state_code: submission.stateCode,
      uploaded_by: submission.uploadedBy,
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
    };

    (async () => {
      try {
        if (!supabase) return;
        const resSigi = await supabase.schema('sigi').from('ingesta_registros_dinamicos').insert(dbRecord);
        if (resSigi.error) {
          await supabase.from('ingesta_registros_dinamicos').insert(dbRecord);
        }
      } catch (err) {
        console.warn('Error guardando lote en Supabase:', err);
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
 * MOTOR DE VALIDACIÓN DE CONTENIDO Y FILAS (ISO 8000-110)
 * ==============================================================================
 */
export const validateExcelContent = async (
  file: File,
  process: ProcessDefinition,
  stateCode: string
): Promise<ValidationReport> => {
  const data = await file.arrayBuffer();
  const workbook = XLSX.read(data, { type: 'array' });
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const rows: Record<string, any>[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

  const nomenclatureCheck = validateFileNameNomenclature(file.name, process, stateCode);
  const schemaErrors: string[] = [];
  const requiredCols = process.requiredColumns.filter(c => c.required).map(c => c.name.toUpperCase());

  // Verificar encabezados
  const fileHeaders = rows.length > 0 ? Object.keys(rows[0]).map(h => h.trim().toUpperCase()) : [];
  const missingHeaders = requiredCols.filter(rc => !fileHeaders.includes(rc));

  if (missingHeaders.length > 0) {
    schemaErrors.push(`Faltan columnas requeridas en el archivo: ${missingHeaders.join(', ')}`);
  }

  const validRecords: Record<string, any>[] = [];
  const invalidRecords: InvalidRecordDetail[] = [];

  const masterCatalogs = getMasterCatalogs();

  rows.forEach((row, index) => {
    const rowNum = index + 2; // +1 cabecera, +1 base 1
    const rowErrors: string[] = [];

    // Validar columnas obligatorias
    process.requiredColumns.forEach(col => {
      // Buscar valor insensible a mayúsculas
      const matchingKey = Object.keys(row).find(k => k.trim().toUpperCase() === col.name.toUpperCase());
      const val = matchingKey ? row[matchingKey] : '';

      if (col.required && (val === '' || val === null || val === undefined)) {
        rowErrors.push(`Campo obligatorio '${col.name}' está vacío.`);
      }

      if (col.type === 'number' && val !== '' && val !== null) {
        const num = Number(val);
        if (isNaN(num)) {
          rowErrors.push(`El campo '${col.name}' debe ser numérico.`);
        } else if (num < 0 && (col.name.includes('MW') || col.name.includes('KM') || col.name.includes('HECTAREA') || col.name.includes('CAPACIDAD'))) {
          rowErrors.push(`El campo '${col.name}' no puede ser negativo (${num}).`);
        }
      }

      // Validación contra Catálogo Maestro en Excel
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
            rowErrors.push(`El valor '${val}' en '${col.name}' no pertenece al catálogo oficial ${catalog.name}.`);
          }
        }
      }
    });

    if (rowErrors.length === 0) {
      validRecords.push(row);
    } else {
      invalidRecords.push({
        rowNumber: rowNum,
        data: row,
        errors: rowErrors
      });
    }
  });

  const total = rows.length;
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
