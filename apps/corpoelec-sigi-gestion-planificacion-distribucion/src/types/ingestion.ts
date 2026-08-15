/**
 * ==============================================================================
 * CORPOELEC - GERENCIA GENERAL DE PLANIFICACIÓN DE DISTRIBUCIÓN (GGPD)
 * TIPOS Y MODELOS DE INGESTA INTELIGENTE, CALIDAD ISO 8000 Y DATA LAKE
 * ==============================================================================
 */

export type ProcessCategory = 'CORE_ESTRATEGICO' | 'MANTENIMIENTO_CONTROL' | 'ACTIVOS_RED';
export type ProcessFrequency = 'SEMANAL' | 'MENSUAL';

export interface ColumnDefinition {
  name: string;
  type: 'string' | 'number' | 'date' | 'boolean';
  description: string;
  required: boolean;
  sampleValue?: string;
  validationRegex?: string;
}

export interface ProcessDefinition {
  id: string;
  code: string;
  name: string;
  shortName: string;
  description: string;
  category: ProcessCategory;
  targetApp: string;
  frequency: ProcessFrequency;
  namingPattern: string;
  requiredColumns: ColumnDefinition[];
  icon: string;
  color: string;
  createdAt: string;
  isDynamic: boolean;
  provisionedStatesCount: number;
}

export interface InvalidRecordDetail {
  rowNumber: number;
  data: Record<string, any>;
  errors: string[];
}

export interface ValidationReport {
  fileName: string;
  fileSize: number;
  stateCode: string;
  processId: string;
  nomenclatureValid: boolean;
  nomenclatureErrors: string[];
  suggestedName: string;
  schemaValid: boolean;
  schemaErrors: string[];
  totalRows: number;
  validRowsCount: number;
  invalidRowsCount: number;
  validRecords: Record<string, any>[];
  invalidRecords: InvalidRecordDetail[];
  timestamp: string;
  batchId: string;
  otqrScore: number; // 0 to 100
}

export interface IngestionSubmission {
  id: string;
  batchId: string;
  processId: string;
  stateCode: string;
  uploadedBy: string;
  timestamp: string;
  originalFileName: string;
  normalizedFileName: string;
  gdriveFolderPath: string;
  conformeCount: number;
  noConformeCount: number;
  status: 'EXITOSO' | 'PARCIAL_CON_REMEDIACION' | 'RECHAZADO';
  remediationTaskId?: string;
  remediationFileUrl?: string;
}

export interface DataLakeFolderNode {
  name: string;
  path: string;
  type: 'folder' | 'file';
  processCode?: string;
  stateCode?: string;
  filesCount?: number;
  lastUpdated?: string;
  status?: 'ONLINE' | 'PROVISIONED';
  children?: DataLakeFolderNode[];
}
