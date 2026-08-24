/**
 * ==============================================================================
 * CORPOELEC - GERENCIA GENERAL DE PLANIFICACIÓN DE DISTRIBUCIÓN (GGPD)
 * TIPOS Y MODELOS DE INGESTA INTELIGENTE, CALIDAD ISO 8000 Y DATA LAKE
 * ==============================================================================
 */

export type ProcessCategory = 'CORE_ESTRATEGICO' | 'MANTENIMIENTO_CONTROL' | 'ACTIVOS_RED' | 'ADMINISTRATIVO_FINANCIERO';
export type ProcessFrequency = 'DIARIO' | 'SEMANAL' | 'QUINCENAL' | 'MENSUAL' | 'EVENTUAL';

export type ColumnType = 'string' | 'number' | 'date' | 'boolean' | 'catalog';

export interface ColumnDefinition {
  name: string;
  type: ColumnType;
  description: string;
  required: boolean;
  sampleValue?: string;
  validationRegex?: string;
  masterCatalogId?: string; // ID del catálogo maestro vinculado (ej. CAT_SUBESTACIONES_SEN)
  options?: string[];       // Opciones de lista si es catálogo cerrado local
}

export interface MasterCatalogItem {
  id: string;
  code: string;
  name: string;
  category?: string;
  stateCode?: string;
  isActive: boolean;
}

export interface MasterCatalog {
  id: string;
  code: string;
  name: string;
  description: string;
  itemsCount: number;
  items: MasterCatalogItem[];
  sourceApp?: string; // ej. 'SCEIN', 'SCTIS', 'SAMC', 'SIGI'
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
  version?: string; // ej: 'V01', 'V02'
  schemaHash?: string;
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

// Modelos para el Asistente de Auditoría de Instrumentos ISO 8000
export type DesignFindingSeverity = 'CRITICAL_1NF' | 'WARNING_3NF' | 'CATALOG_MATCH' | 'MISSING_GRAIN' | 'INFO';

export interface DesignFinding {
  id: string;
  severity: DesignFindingSeverity;
  title: string;
  description: string;
  affectedColumns: string[];
  suggestedAction: string;
  matchedCatalogId?: string;
}

export interface DesignAuditReport {
  score: number; // 0 a 100
  status: 'CONFORME' | 'REQUIERE_AJUSTES' | 'NO_FACTIBLE';
  findings: DesignFinding[];
  originalColumnsCount: number;
  refactoredColumns: ColumnDefinition[];
  aiSummary?: string;
  timestamp: string;
}
