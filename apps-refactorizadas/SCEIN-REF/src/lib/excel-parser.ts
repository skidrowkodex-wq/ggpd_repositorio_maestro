import * as XLSX from 'xlsx';
import {
  DocumentIngestType,
  EquipmentRecord,
  EquipmentStatus,
  EquipmentPriority,
  MaterialLine,
  PlanExecutionLine,
  ISO8000Report,
  ISO8000QualityIssue,
  QualityGrade,
  PresupuestoEstado,
  IngestWindowStatus
} from '../types';
import { VOLTAGE_LEVELS_KV, getStateRegion, VENEZUELAN_STATES } from '../constants/states';

export interface ParseResult {
  docType: DocumentIngestType;
  fileName: string;
  equipmentRecords: EquipmentRecord[];
  materialLines: MaterialLine[];
  planLines: PlanExecutionLine[];
  report: ISO8000Report;
}

const normalizeHeader = (s: string) =>
  String(s || '')
    .toUpperCase()
    .replace(/[ÁÀÂÄ]/g, 'A')
    .replace(/[ÉÈÊË]/g, 'E')
    .replace(/[ÍÌÎÏ]/g, 'I')
    .replace(/[ÓÒÔÖ]/g, 'O')
    .replace(/[ÚÙÛÜ]/g, 'U')
    .replace(/Ñ/g, 'N')
    .replace(/['´`]/g, '')
    .replace(/[()¿?]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const parseEuroValue = (v: any): number => {
  if (typeof v === 'number') return Number.isFinite(v) ? v : 0;
  const s = String(v ?? '').trim();
  if (!s) return 0;
  const n = Number(s.replace(/[€\s]/g, '').replace(/,/g, '.'));
  return Number.isFinite(n) ? n : 0;
};

function pickBudgetCell(row: any): number {
  const entries = Object.entries(row || {});
  let found: [string, any] | undefined;

  found = entries.find(([key]) =>
    normalizeHeader(key).includes('PRESUPUESTO') && normalizeHeader(key).includes('EUR')
  );
  if (!found) {
    found = entries.find(([key]) => {
      const nk = normalizeHeader(key);
      return nk.includes('MONTO') && (nk.includes('EUR') || nk.includes('€'));
    });
  }
  if (!found) {
    found = entries.find(([key]) => normalizeHeader(key).includes('PRESUPUESTO'));
  }
  if (!found) return 0;

  return parseEuroValue(found[1]);
}

function pickCells(row: any, needles: string[]): [string, any] | undefined {
  const entries = Object.entries(row || {});
  for (const needle of needles) {
    const found = entries.find(([key]) => normalizeHeader(key).includes(needle));
    if (found) return found;
  }
  return undefined;
}

function pick(row: any, needles: string[]): any {
  const found = pickCells(row, needles);
  return found ? found[1] : '';
}

function pickStr(row: any, needles: string[], fallback = ''): string {
  return String(pick(row, needles) ?? '').trim() || fallback;
}

function pickNum(row: any, needles: string[]): number {
  const v = pick(row, needles);
  const n = typeof v === 'number' ? v : Number(String(v ?? '').trim());
  return Number.isFinite(n) ? n : 0;
}

function toSeq(v: any, fallback: number): number {
  const n = typeof v === 'number' ? v : Number(String(v ?? '').replace(/[^0-9.]/g, ''));
  return Number.isFinite(n) && n > 0 ? Math.round(n) : fallback;
}

const pad2 = (n: number) => String(n).padStart(2, '0');

function toDateStr(d: Date): string {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

const MONTH_ES: Record<string, number> = {
  ENERO: 1, FEBRERO: 2, MARZO: 3, ABRIL: 4, MAYO: 5, JUNIO: 6,
  JULIO: 7, AGOSTO: 8, SEPTIEMBRE: 9, OCTUBRE: 10, NOVIEMBRE: 11, DICIEMBRE: 12
};

function parseDateString(s: string): string | null {
  const t = String(s || '').trim().replace(/\s+/g, ' ');
  if (!t) return null;

  let m = t.match(/(\d{4})-(\d{2})-(\d{2})/);
  if (m) return `${m[1]}-${m[2]}-${m[3]}`;

  m = t.match(/(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{4})/);
  if (m) {
    const dd = Number(m[1]);
    const mm = Number(m[2]);
    const yyyy = Number(m[3]);
    if (dd >= 1 && dd <= 31 && mm >= 1 && mm <= 12) {
      const d = new Date(Date.UTC(yyyy, mm - 1, dd));
      if (
        d.getUTCFullYear() === yyyy &&
        d.getUTCMonth() === mm - 1 &&
        d.getUTCDate() === dd
      ) {
        return `${yyyy}-${pad2(mm)}-${pad2(dd)}`;
      }
    }
  }

  const mc = t.toUpperCase().match(/(ENERO|FEBRERO|MARZO|ABRIL|MAYO|JUNIO|JULIO|AGOSTO|SEPTIEMBRE|OCTUBRE|NOVIEMBRE|DICIEMBRE)(?: DE)?\s+(\d{4})/);
  if (mc) return `${mc[2]}-${pad2(MONTH_ES[mc[1]])}-01`;

  return null;
}

function formatDateCell(v: any): string | null {
  if (v == null || v === '') return null;
  if (v instanceof Date && !isNaN(v.getTime())) return toDateStr(v);
  if (typeof v === 'number' && v > 20000 && v < 80000) {
    const d = new Date(Math.round((v - 25569) * 86400000));
    if (!isNaN(d.getTime())) return toDateStr(d);
  }
  if (typeof v === 'number') return null;
  return parseDateString(String(v));
}

function stateCodeOf(value: string): string {
  const norm = normalizeHeader(value);
  if (/^[A-Z]{2}$/.test(norm)) return norm;
  const found = VENEZUELAN_STATES.find(s => normalizeHeader(s.name) === norm);
  return found ? found.code : 'TA';
}

function regionClean(v: any, stateCode: string): string {
  const s = String(v ?? '').trim().replace(/_/g, ' ').replace(/\s+/g, ' ').toUpperCase();
  return s || getStateRegion(stateCode);
}

function normalizeStatus(raw: string): EquipmentStatus {
  const s = raw.toUpperCase().trim();
  if (s.includes('RESUELTO') || s.includes('OPERATIVO') || s.includes('LISTO')) return 'RESUELTO';
  if (s.includes('EJECUCION') || s.includes('EN PROCESO')) return 'EN EJECUCIÓN';
  return 'PENDIENTE';
}

function normalizePriority(raw: string): EquipmentPriority {
  const s = raw.toUpperCase().trim();
  if (s.includes('ALTA') || s.includes('CRITICA')) return 'ALTA';
  if (s.includes('BAJA')) return 'BAJA';
  return 'MEDIA';
}

function clampPct(v: number): number {
  if (!Number.isFinite(v)) return 0;
  if (v >= 0 && v <= 1) return Math.round(v * 100);
  return Math.min(100, Math.max(0, Math.round(v)));
}

function isHardIssue(i: ISO8000QualityIssue): boolean {
  if (i.axis === 'Exactitud') return true;
  if (i.axis === 'Exhaustividad' && ['Subestación', 'Acción Operativa', 'P x Q'].includes(i.field)) return true;
  return false;
}

const C_SEQ = ['IDENTIFICADOR', 'SECUENCIA', 'SEQ'];
const C_REGION = ['REGION'];
const C_STATE = ['ESTADO'];
const C_SUB = ['NOMBRE SUBESTACION', 'SUBESTACION'];
const C_KV = ['NIVEL TENSION', 'TENSION', 'KTN', 'KV'];
const C_COMP = ['COMPONENTE DE LA SUBESTACION', 'COMPONENTE'];
const C_ELEM = ['TIPO DE EQUIPO O ELEMENTO', 'TIPO DE EQUIPO', 'TIPO DE ELEMENTO', 'ELEMENTO'];
const C_SPECS = ['ESPECIFICACIONES', 'ESPECIFICACION'];
const C_ACTION = ['ACCION OPERATIVA', 'ACCION'];
const C_NOM = ['NOMENCLATURA', 'CODIGO'];
const C_STATUS = ['ESTATUS', 'STATUS'];
const C_PRIO = ['PRIORIDAD'];
const C_UOM = ['UNIDAD'];
const C_QTY = ['CANTIDAD DE EQUIPO A', 'CANTIDAD DE EQUIPO', 'CANTIDAD SOLICITADA', 'CANTIDAD'];
const C_FECHA = ['FECHA PROGRAMADA DE INTERVENCION', 'FECHA PROGRAMADA', 'FECHA'];
const C_ATENDIDOS = ['ATENDIDOS'];
const C_DESC_TRABAJOS = ['DESCRIPCION DE LOS TRABAJOS'];
const C_FECHA_INI = ['FECHA DE INICIO PROGRAMADA', 'INICIO'];
const C_FECHA_FIN = ['ULTIMA FECHA DE INTERVENCION', 'FECHA FIN'];
const C_AVANCE = ['PORCENTAJE DE AVANCE', 'PORCENTAJE META', 'META', 'AVANCE', 'PORCENTAJE'];
const C_OBS = ['OBSERVACION'];
const C_FAM = ['FAMILIA'];
const C_MAT_DESC = ['DESCRIPCION DEL MATERIAL', 'DESCRIPCION'];
const C_PU = ['PRECIO UNITARIO', 'PRECIO'];
const C_QTY_MAT = ['CANTIDAD SOLICITADA', 'CANTIDAD'];
const C_PXQ = ['P X Q', 'P*Q', 'TOTAL EUR', 'TOTAL'];

function findSheetName(workbook: XLSX.WorkBook, needles: string[]): string | undefined {
  for (const needle of needles) {
    const name = workbook.SheetNames.find(s => normalizeHeader(s).includes(needle));
    if (name) return name;
  }
  return undefined;
}

export function getSubmissionWindowStatus(date: Date = new Date()): {
  status: IngestWindowStatus;
  dayName: string;
  isExtemporaneous: boolean;
  message: string;
} {
  const day = date.getDay();
  const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  const dayName = dayNames[day];

  if (day === 3) {
    return {
      status: 'EN_TIEMPO',
      dayName,
      isExtemporaneous: false,
      message: 'Carga dentro de la ventana oficial ordinaria (Miércoles).'
    };
  } else if (day === 4) {
    return {
      status: 'PRORROGA_JUEVES',
      dayName,
      isExtemporaneous: false,
      message: 'Carga realizada en prórroga autorizada (Jueves).'
    };
  } else {
    return {
      status: 'EXTEMPORANEO',
      dayName,
      isExtemporaneous: true,
      message: `Carga extemporánea fuera de la ventana normativa (${dayName}). Se requiere justificación de retraso obligatoria.`
    };
  }
}

export function detectDocumentType(fileName: string, sheetNames: string[]): {
  docType: DocumentIngestType;
  filenameValid: boolean;
  filenameMsg: string;
} {
  const upperName = fileName.toUpperCase();
  const upperSheets = sheetNames.map(s => s.toUpperCase());

  let docType: DocumentIngestType = 'LEV';
  let filenameValid = true;
  let filenameMsg = 'Formato de nombre válido según norma GGPD-SGM-INS-005.';

  if (upperName.includes('LEV_EI_SE') || upperName.includes('LEVANTAMIENTO')) {
    docType = 'LEV';
    filenameValid = true;
  } else if (
    upperName.includes('PLA_EI_SE') ||
    upperName.includes('PLAN_DE_ATENCION') ||
    (upperName.includes('PLAN') && upperName.includes('ATENCION'))
  ) {
    docType = 'PLA';
    filenameValid = true;
  } else {
    const hasLevTabs = upperSheets.some(s => s.includes('EQUIPOS INDISPONIBLES') || s.includes('LEVANTAMIENTO'));
    const hasPlaTabs = upperSheets.some(s => s.includes('PLAN') || s.includes('EJECUCION') || s.includes('ATENCION'));

    docType = hasPlaTabs && !hasLevTabs ? 'PLA' : 'LEV';
    filenameValid = false;
    filenameMsg = `Nombre de archivo no sigue la nomenclatura estandarizada '[LEVANTAMIENTO|PLAN DE ATENCION]_DE_EQUIPOS_INDISPONIBLES_EN_S-E_[ESTADO]_[FECHA].xlsx'.`;
  }

  return { docType, filenameValid, filenameMsg };
}

export function parseExcelWorkbook(file: File, buffer: ArrayBuffer, forcedType?: DocumentIngestType): ParseResult {
  const workbook = XLSX.read(buffer, { type: 'array', cellDates: true });
  const sheetNames = workbook.SheetNames;

  const detection = detectDocumentType(file.name, sheetNames);
  const docType = forcedType || detection.docType;

  const equipmentSheetName = findSheetName(workbook, ['EQUIPOS INDISPONIBLES', 'EQUIPO', 'INDISPONIBLE']);
  const materialsSheetName = findSheetName(workbook, ['MATERIAL POR ACTIVIDAD', 'MATERIAL', 'MATERIALES']);
  const materialsPresent = !!materialsSheetName && materialsSheetName !== equipmentSheetName;

  const eqRows: any[] = equipmentSheetName
    ? XLSX.utils.sheet_to_json(workbook.Sheets[equipmentSheetName], { defval: '' })
    : [];

  const materialLines: MaterialLine[] = [];
  const materialBudgetBySeq = new Map<number, { n: number; total: number; hasZero: boolean }>();

  if (materialsPresent && materialsSheetName) {
    const matRows: any[] = XLSX.utils.sheet_to_json(workbook.Sheets[materialsSheetName], { defval: '' });
    matRows.forEach((row, idx) => {
      const seq = toSeq(pick(row, C_SEQ), idx + 1);
      const state = stateCodeOf(pickStr(row, C_STATE, ''));
      const region = regionClean(pick(row, C_REGION), state);
      const sub = pickStr(row, C_SUB);
      const kv = pickNum(row, C_KV) || 115;
      const component = pickStr(row, C_COMP, 'COMP');
      const element = pickStr(row, C_ELEM, 'Equipo');
      const family = pickStr(row, C_FAM, 'GENERAL');
      const desc = pickStr(row, C_MAT_DESC, 'Material s/d');
      const uom = pickStr(row, C_UOM, 'UN');
      const unitPrice = pickNum(row, C_PU);
      const qty = pickNum(row, C_QTY_MAT);
      const total = pickNum(row, C_PXQ) || (unitPrice * qty);

      const bucket = materialBudgetBySeq.get(seq) || { n: 0, total: 0, hasZero: false };
      bucket.n++;
      bucket.total += total > 0 ? total : 0;
      if (total <= 0 || unitPrice <= 0 || qty <= 0) bucket.hasZero = true;
      materialBudgetBySeq.set(seq, bucket);

      materialLines.push({
        equipment_seq: seq,
        region_code: region,
        state_code: state,
        substation_name: sub,
        voltage_in_kv: kv,
        component_code: component,
        element_type: element,
        material_family: family,
        material_description: desc,
        uom,
        unit_price_eur: unitPrice,
        qty_required: qty,
        total_eur: total,
        status: normalizeStatus(pickStr(row, C_STATUS, 'PENDIENTE')),
        priority: normalizePriority(pickStr(row, C_PRIO, 'MEDIA'))
      });
    });
  }

  const equipmentRecords: EquipmentRecord[] = [];
  const planLines: PlanExecutionLine[] = [];
  const issues: ISO8000QualityIssue[] = [];
  const seenNomenclators = new Set<string>();
  let duplicates = 0;

  eqRows.forEach((row, idx) => {
    const rowNum = idx + 2;
    const seq = toSeq(pick(row, C_SEQ), idx + 1);

    const stateCode = stateCodeOf(pickStr(row, C_STATE, ''));
    const region = regionClean(pick(row, C_REGION), stateCode);
    const sub = pickStr(row, C_SUB);
    const kv = pickNum(row, C_KV);
    const component = pickStr(row, C_COMP, 'COMP');
    const element = pickStr(row, C_ELEM, 'Equipo');
    const specs = pickStr(row, C_SPECS);
    const action = pickStr(row, C_ACTION);
    const rawNom = pickStr(row, C_NOM);
    const uom = pickStr(row, C_UOM, 'UN');
    const qty = pickNum(row, C_QTY) || 1;
    const scheduledDate = formatDateCell(pick(row, C_FECHA));
    const attended = pickNum(row, C_ATENDIDOS);

    const status = normalizeStatus(pickStr(row, C_STATUS, 'PENDIENTE'));
    const priority = normalizePriority(pickStr(row, C_PRIO, 'MEDIA'));

    const subSlug = (sub.toUpperCase().replace(/[^A-Z0-9]+/g, '-') || 'SE').replace(/^[-]+|[-]+$/g, '');
    const seqPadded = String(seq).padStart(3, '0');

    let nomenclator = rawNom;
    if (
      !nomenclator ||
      ['SIN INFORMACION', '0', '-', 'N/A', 'NA', 'S/D', 'N/D', 'SIN DATOS'].includes(normalizeHeader(nomenclator))
    ) {
      nomenclator = `${stateCode}-${subSlug}-${seqPadded}`;
    }

    const rowIssues: ISO8000QualityIssue[] = [];
    const pushIssue = (iss: ISO8000QualityIssue) => {
      issues.push(iss);
      rowIssues.push(iss);
    };

    if (!rawNom || ['SIN INFORMACION', '0', '-'].includes(normalizeHeader(rawNom))) {
      pushIssue({
        row_number: rowNum,
        nomenclator,
        axis: 'Exhaustividad',
        field: 'Nomenclatura',
        issue: `Nomenclatura '${rawNom || 'vacía'}' no válida. Generado '${nomenclator}' por norma.`,
        suggested_fix: nomenclator
      });
    }

    if (nomenclator !== nomenclator.toUpperCase()) {
      pushIssue({
        row_number: rowNum,
        nomenclator,
        axis: 'Sintaxis',
        field: 'Nomenclatura',
        issue: 'Inconsistencia de formato (minúsculas). Debe ser mayúsculas.',
        suggested_fix: nomenclator.toUpperCase()
      });
    }

    if (!sub) {
      pushIssue({
        row_number: rowNum,
        nomenclator,
        axis: 'Exhaustividad',
        field: 'Subestación',
        issue: 'Nombre de Subestación es obligatorio para el levantamiento físico.'
      });
    }

    if (!action) {
      pushIssue({
        row_number: rowNum,
        nomenclator,
        axis: 'Exhaustividad',
        field: 'Acción Operativa',
        issue: 'Acción operativa ausente en la plantilla de levantamiento.'
      });
    }

    if (kv > 0 && !VOLTAGE_LEVELS_KV.includes(kv)) {
      pushIssue({
        row_number: rowNum,
        nomenclator,
        axis: 'Exactitud',
        field: 'Nivel kV',
        issue: `Nivel de tensión ${kv}kV no pertenece al catálogo oficial SEN (${VOLTAGE_LEVELS_KV.join(', ')} kV).`
      });
    }

    if (seenNomenclators.has(nomenclator)) {
      duplicates++;
      pushIssue({
        row_number: rowNum,
        nomenclator,
        axis: 'Deduplicación',
        field: 'Nomenclatura',
        issue: `Equipo duplicado detectado con nomenclatura '${nomenclator}'.`
      });
    } else {
      seenNomenclators.add(nomenclator);
    }

    const bucket = materialBudgetBySeq.get(seq);
    let budget = 0;
    let nMat = 0;
    let presuEstado: PresupuestoEstado = 'SIN_MATERIALES';

    if (bucket) {
      nMat = bucket.n;
      budget = bucket.total > 0 ? Math.round(bucket.total * 100) / 100 : 0;
      if (bucket.hasZero) {
        presuEstado = nMat > 0 && budget > 0 ? 'INCOMPLETO' : 'SIN_MATERIALES';
        pushIssue({
          row_number: rowNum,
          nomenclator,
          axis: 'Exhaustividad',
          field: 'P x Q',
          issue: `Existe al menos un material del equipo (SEQ ${seq}) sin P x Q válido (monto en EUR). Revisar hoja MATERIAL POR ACTIVIDAD.`
        });
      } else {
        presuEstado = budget > 0 ? 'ESTIMADO' : 'INCOMPLETO';
      }
    } else if (!materialsPresent) {
      const legacyBudget = pickBudgetCell(row);
      budget = legacyBudget > 0 ? Math.round(legacyBudget * 100) / 100 : 0;
      presuEstado = budget > 0 ? 'ESTIMADO' : 'SIN_MATERIALES';
    }

    const obs = pickStr(row, C_OBS);
    const descripcionTrabajos = pickStr(row, C_DESC_TRABAJOS);
    const fechaIni = formatDateCell(pick(row, C_FECHA_INI));
    const fechaFin = formatDateCell(pick(row, C_FECHA_FIN));

    const progress = docType === 'PLA'
      ? clampPct(pickNum(row, C_AVANCE)) || (status === 'RESUELTO' ? 100 : status === 'EN EJECUCIÓN' ? 50 : 0)
      : status === 'RESUELTO' ? 100 : status === 'EN EJECUCIÓN' ? 50 : 0;

    const record_id = `REC-${docType}-${stateCode}-${subSlug}-${seqPadded}`;

    const hard = rowIssues.some(isHardIssue);

    const rec: EquipmentRecord = {
      record_id,
      legacy_seq: seq,
      region_code: region,
      state_code: stateCode,
      substation_name: sub || 'S/E Desconocida',
      voltage_in_kv: kv || 115,
      component_code: component,
      element_type: element,
      technical_specs: specs || null,
      operational_action: action || 'Pendiente de definición',
      equipment_nomenclator: nomenclator,
      status,
      priority,
      uom,
      qty_equip: qty,
      scheduled_date: scheduledDate || null,
      material_count: nMat || null,
      total_budget_eur: budget,
      progress_pct: progress,
      execution_notes: [descripcionTrabajos, obs].filter(Boolean).join(' — ') || null,
      estado_ingesta: hard ? 'PENDIENTE_ISO' : 'VALID',
      issues_iso: {
        iso: rowIssues,
        presupuesto: { estado: presuEstado, n_materiales: nMat, pxq_total: budget, moneda: 'EUR' }
      },
      created_at: new Date().toISOString()
    };

    Object.defineProperty(rec, '_row', { value: rowNum, enumerable: false });

    equipmentRecords.push(rec);

    if (docType === 'PLA') {
      planLines.push({
        seq_plan: seq,
        region_code: region,
        state_code: stateCode,
        substation_name: sub || 'S/E Desconocida',
        plan_line: `PLA-${stateCode}-${subSlug}-${seqPadded}`,
        planned_action: action || 'Ejecución de Plan',
        budget_assigned_eur: budget,
        target_pct: clampPct(pickNum(row, C_AVANCE)) || 100,
        start_date: fechaIni || undefined,
        end_date: fechaFin || undefined,
        responsible: 'GGPD'
      });
    }
  });

  const totalRows = equipmentRecords.length;
  const hardIssues = issues.filter(isHardIssue);
  const invalidRows = new Set(hardIssues.map(i => i.row_number)).size;
  const validRows = Math.max(0, totalRows - invalidRows);

  const rowsWithAxis = (axis: string) => new Set(hardIssues.filter(i => i.axis === axis).map(i => i.row_number)).size;
  const completitudPct = totalRows > 0 ? Math.round(((totalRows - rowsWithAxis('Exhaustividad')) / totalRows) * 100) : 100;
  const consistenciaPct = totalRows > 0 ? Math.round(((totalRows - rowsWithAxis('Sintaxis')) / totalRows) * 100) : 100;
  const catalogoPct = totalRows > 0 ? Math.round(((totalRows - rowsWithAxis('Exactitud')) / totalRows) * 100) : 100;

  const rawScore = (0.40 * Math.max(0, completitudPct)) + (0.40 * Math.max(0, consistenciaPct)) + (0.20 * Math.max(0, catalogoPct));
  const scorePct = Math.min(100, Math.max(0, Math.round(rawScore)));

  let grade: QualityGrade = 'D';
  if (scorePct >= 95) grade = 'A+';
  else if (scorePct >= 85) grade = 'A';
  else if (scorePct >= 75) grade = 'B';
  else if (scorePct >= 60) grade = 'C';

  const report: ISO8000Report = {
    doc_type: docType,
    file_name: file.name,
    filename_status: detection.filenameValid ? 'VALIDO' : 'ERROR_NOMENCLATURA',
    filename_error_msg: detection.filenameValid ? undefined : detection.filenameMsg,
    total_rows: totalRows,
    valid_rows: validRows,
    invalid_rows: invalidRows,
    duplicates_count: duplicates,
    score_pct: scorePct,
    grade,
    completitud_pct: Math.max(0, completitudPct),
    consistencia_pct: Math.max(0, consistenciaPct),
    catalogo_pct: Math.max(0, catalogoPct),
    materials_count: materialLines.length,
    plan_lines_count: planLines.length,
    issues
  };

  return {
    docType,
    fileName: file.name,
    equipmentRecords,
    materialLines,
    planLines,
    report
  };
}

export function generateSampleExcel(type: DocumentIngestType, customFileName?: string) {
  const wb = XLSX.utils.book_new();

  const equipBaseHeaders = [
    'IDENTIFICADOR EQUIPO O COMPONENTE A  NORMALIZAR',
    'REGION',
    'ESTADO',
    'NOMBRE SUBESTACIÓN',
    'NIVEL TENSION\nENTRADA',
    'COMPONENTE DE LA SUBESTACION',
    'TIPO DE EQUIPO O ELEMENTO A NORMALIZAR EN LA SUBESTACION',
    'ESPECIFICACIONES TECNICAS DEL EQUIPO O ELEMENTOS REQUERIDO (NÚMERO DE NORMA QUE REGULA AL EQUIPO O COMPONENTE)',
    'ACCIÓN OPERATIVA \n(BREVE DESCRIPCION DE LOS TRABAJOS  A REALIZAR)',
    'NOMENCLATURA DEL EQUIPO (CÓDIGO QUE IDENTIFICA AL COMPONENTE EN LA SE)',
    'ESTATUS',
    'N° DE PRIORIDAD',
    'UNIDAD',
    'CANTIDAD DE EQUIPO A  O COMPONENTE A NORMALIZAR',
    'FECHA PROGRAMADA DE INTERVENCION'
  ];

  const plaExtraHeaders = [
    'CANTIDAD DE EQUIPO O COMPONENTES ATENDIDOS EN LA SUBESTACION',
    'PORCENTAJE DE AVANCE EN LA RECUPERACION',
    'FECHA DE INICIO PROGRAMADA PARA LA INTERVENCION',
    'ULTIMA FECHA DE INTERVENCION PARA LA RECUPERACION',
    'DESCRIPCION DE LOS TRABAJOS PROGRAMADOS',
    'OBSERVACION'
  ];

  const materialHeaders = [
    'IDENTIFICADOR EQUIPO O COMPONENTE A  NORMALIZAR',
    'REGION',
    'ESTADO',
    'NOMBRE SUBESTACIÓN',
    'NIVEL TENSION\nENTRADA',
    'COMPONENTE DE LA SUBESTACION',
    'TIPO DE EQUIPO O ELEMENTO A NORMALIZAR EN LA SUBESTACION',
    'FAMILIA DE MATERIAL',
    'DESCRIPCION DEL MATERIAL',
    'UNIDAD',
    'PRECIO UNITARIO (Euros)',
    'CANTIDAD SOLICITADA',
    'P x Q',
    'ESTATUS',
    'N° DE PRIORIDAD'
  ];

  const baseEqRow1 = [
    1,
    'LOS_ANDES',
    'TÁCHIRA',
    'S/E COLONCITO',
    '115',
    'TRNF-1',
    'TRANSFORMADOR DE POTENCIA',
    'NORMAS COVENIN COD ELECT',
    'REEMPLAZO DE BUSHINGS',
    'TA-COLONCITO-TR-115',
    'EN EJECUCIÓN',
    'ALTA',
    'UN',
    1,
    '02-03-2026'
  ];

  const baseEqRow2 = [
    2,
    'ORIENTAL',
    'SUCRE',
    'S/E ARAYA',
    '34.5',
    'INT-1',
    'INTERRUPTOR DE POTENCIA',
    'NORMAS COVENIN CIE',
    'MANTENIMIENTO MAYOR',
    'SU-ARAYA-INT-34.5',
    'PENDIENTE',
    'MEDIA',
    'UN',
    1,
    '15-03-2026'
  ];

  const matRows = [
    [1, 'LOS_ANDES', 'TÁCHIRA', 'S/E COLONCITO', '115', 'TRNF-1', 'TRANSFORMADOR DE POTENCIA', 'AISLADORES', 'BUSHING PASA-TAPA 115kV 1200A', 'PZA', 30000, 2, 60000, 'APROBADO', 'ALTA'],
    [1, 'LOS_ANDES', 'TÁCHIRA', 'S/E COLONCITO', '115', 'TRNF-1', 'TRANSFORMADOR DE POTENCIA', 'FERRETERIA', 'TORNILLERIA GRADO 8', 'PZA', 10, 80, 800, 'APROBADO', 'ALTA'],
    [2, 'ORIENTAL', 'SUCRE', 'S/E ARAYA', '34.5', 'INT-1', 'INTERRUPTOR DE POTENCIA', 'BLOQUES DE CONTACTO', 'CONTACTO PRINCIPAL 34.5kV', 'PZA', 2600, 2, 5200, 'PENDIENTE', 'MEDIA']
  ];

  if (type === 'LEV') {
    const ws = XLSX.utils.aoa_to_sheet([equipBaseHeaders, baseEqRow1, baseEqRow2]);
    XLSX.utils.book_append_sheet(wb, ws, 'EQUIPOS INDISPONIBLES SE');

    const ws2 = XLSX.utils.aoa_to_sheet([materialHeaders, ...matRows]);
    XLSX.utils.book_append_sheet(wb, ws2, 'MATERIAL  POR ACTIVIDAD');

    XLSX.writeFile(wb, customFileName || 'LEVANTAMIENTO_DE_EQUIPOS_INDISPONIBLES_EN_S-E_SUCRE_25092026.xlsx');
  } else {
    const extraEq1 = [1, 100, '10-01-2026', '20-03-2026', 'SUSTITUCION BUSHINGS TRNF-1', 'MATERIAL LLEGADO A REGION'];
    const extraEq2 = [0, 0, '10-01-2026', '31-12-2026', 'REPOSICION INTERRUPTOR ARAYA', 'EN TRAMITE DE COMPRA'];

    const ws = XLSX.utils.aoa_to_sheet([[...equipBaseHeaders, ...plaExtraHeaders], [...baseEqRow1, ...extraEq1], [...baseEqRow2, ...extraEq2]]);
    XLSX.utils.book_append_sheet(wb, ws, 'EQUIPOS INDISPONIBLES SE');

    const ws2 = XLSX.utils.aoa_to_sheet([materialHeaders, ...matRows]);
    XLSX.utils.book_append_sheet(wb, ws2, 'MATERIAL  POR ACTIVIDAD');

    XLSX.writeFile(wb, customFileName || 'PLAN_DE_ATENCION_DE_EQUIPOS_INDISPONIBLES_EN_S-E_SUCRE_25092026.xlsx');
  }
}