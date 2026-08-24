export type UserRole = 'ADMIN_NACIONAL' | 'ANALISTA_ESTATAL' | 'AUDITOR';

export interface User {
  id: string;
  username: string;
  email?: string;
  full_name: string;
  role: UserRole;
  state_code: string | null; // e.g. 'TA', 'ZU', or null for national
  is_active: boolean;
  last_login_at?: string | null;
  created_at?: string;
}

export type EquipmentStatus = 'PENDIENTE' | 'EN EJECUCIÓN' | 'RESUELTO';
export type EquipmentPriority = 'ALTA' | 'MEDIA' | 'BAJA';

export type DocumentIngestType = 'LEV' | 'PLA';
export type IngestWindowStatus = 'EN_TIEMPO' | 'PRORROGA_JUEVES' | 'EXTEMPORANEO';
export type QualityGrade = 'A+' | 'A' | 'B' | 'C' | 'D';

export interface EquipmentRecord {
  record_id: string;
  legacy_seq?: number;
  region_code: string;
  state_code: string;
  substation_name: string;
  voltage_in_kv: number;
  component_code: string;
  element_type: string; // e.g., Transformador de Potencia, Interruptor de Potencia, Seccionador
  technical_specs?: string;
  operational_action: string; // e.g., Reemplazo, Mantenimiento Mayor, Reparación
  equipment_nomenclator: string;
  status: EquipmentStatus;
  priority: EquipmentPriority;
  uom?: string; // e.g., UN, PZA
  qty_equip?: number;
  scheduled_date?: string;
  material_count?: number;
  total_budget_eur: number;
  progress_pct: number;
  execution_notes?: string;
  created_at?: string;
}

export interface MaterialLine {
  id?: string;
  equipment_seq?: number;
  region_code: string;
  state_code: string;
  substation_name: string;
  voltage_in_kv: number;
  component_code: string;
  element_type: string;
  material_family: string;
  material_description: string;
  uom: string;
  unit_price_eur: number;
  qty_required: number;
  total_eur: number;
  status: string;
  priority: string;
}

export interface PlanExecutionLine {
  id?: string;
  seq_plan: number;
  region_code: string;
  state_code: string;
  substation_name: string;
  plan_line: string;
  planned_action: string;
  budget_assigned_eur: number;
  target_pct: number;
  start_date?: string;
  end_date?: string;
  responsible: string;
}

export interface AuditLog {
  id: number | string;
  user_id?: string;
  username: string;
  action_type: string; // e.g., LOGIN_EXITO, LOGIN_FALLIDO, INGESTA_EXCEL, ACTUALIZACION_EQUIPO
  entity_type?: string;
  entity_id?: string;
  details: string;
  created_at: string;
  ip_address?: string;
  status?: 'EXITO' | 'ADVERTENCIA' | 'ERROR';
}

export type AuditEventStatus = 'EXITO' | 'ADVERTENCIA' | 'ERROR';

export interface AuditEvent {
  id: number | string;
  action: string;
  user_email: string;
  ip_address?: string;
  details: string;
  status: AuditEventStatus;
  created_at: string;
}

export interface InstitutionalDocument {
  doc_id?: string;
  doc_key: string;
  title: string;
  filename: string;
  mime_type: string;
  version: string;
  content_text?: string;
  size_bytes?: number;
  update_notes?: string;
  updated_by?: string;
  created_at?: string;
  updated_at?: string;
  is_template?: boolean;
  download_url?: string;
}

export interface ISO8000QualityIssue {
  row_number: number;
  nomenclator: string;
  axis: 'Sintaxis' | 'Exhaustividad' | 'Exactitud' | 'Deduplicación';
  field: string;
  issue: string;
  suggested_fix?: string;
}

export interface ISO8000Report {
  doc_type: DocumentIngestType;
  file_name: string;
  filename_status: 'VALIDO' | 'ERROR_NOMENCLATURA' | 'ERROR_PESTAÑAS';
  filename_error_msg?: string;
  total_rows: number;
  valid_rows: number;
  invalid_rows: number;
  duplicates_count: number;
  score_pct: number;
  grade: QualityGrade;
  completitud_pct: number;
  consistencia_pct: number;
  catalogo_pct: number;
  materials_count?: number;
  plan_lines_count?: number;
  issues: ISO8000QualityIssue[];
}

export interface TechDocument {
  id: string;
  code: string;
  title: string;
  category: 'NORMATIVO' | 'TÉCNICO' | 'OPERATIVO';
  version: string;
  author: string;
  updated_at: string;
  summary: string;
  content: string;
}


