import * as XLSX from 'xlsx';
import { 
  DocumentIngestType, 
  EquipmentRecord, 
  MaterialLine, 
  PlanExecutionLine, 
  ISO8000Report, 
  ISO8000QualityIssue, 
  QualityGrade,
  IngestWindowStatus
} from '../types';
import { VOLTAGE_LEVELS_KV, getStateRegion } from '../constants/states';

export interface ParseResult {
  docType: DocumentIngestType;
  fileName: string;
  equipmentRecords: EquipmentRecord[];
  materialLines: MaterialLine[];
  planLines: PlanExecutionLine[];
  report: ISO8000Report;
}

/**
 * Checks the current day of the week to calculate the window submission status.
 * Wednesday (3) = EN_TIEMPO
 * Thursday (4) = PRORROGA_JUEVES
 * Friday (5) - Tuesday (2) = EXTEMPORANEO
 */
export function getSubmissionWindowStatus(date: Date = new Date()): {
  status: IngestWindowStatus;
  dayName: string;
  isExtemporaneous: boolean;
  message: string;
} {
  const day = date.getDay(); // 0 = Sun, 1 = Mon, 2 = Tue, 3 = Wed, 4 = Thu, 5 = Fri, 6 = Sat
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

/**
 * Auto-detect document type according to GGPD-SGM-INS-005 rules:
 * 1. Filename string match
 * 2. Tab names fallback
 */
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

  if (upperName.includes('LEV_EI_SE')) {
    docType = 'LEV';
  } else if (upperName.includes('PLA_EI_SE')) {
    docType = 'PLA';
  } else {
    // Fallback tab inspection
    const hasLevTabs = upperSheets.some(s => s.includes('EQUIPO') || s.includes('INDISPONIBLE') || s.includes('MATERIAL'));
    const hasPlaTabs = upperSheets.some(s => s.includes('PLAN') || s.includes('EJECUCION') || s.includes('RESUMEN'));

    if (hasPlaTabs && !hasLevTabs) {
      docType = 'PLA';
    } else {
      docType = 'LEV';
    }

    filenameValid = false;
    filenameMsg = `Nombre de archivo no sigue la nomenclatura estandarizada '[GEOGRAFÍA]_[AÑO]_GGPD_${docType === 'LEV' ? 'LEV_EI_SE' : 'PLA_EI_SE'}_[VERSIÓN].xlsx'.`;
  }

  return { docType, filenameValid, filenameMsg };
}

/**
 * Main parsing engine supporting LEV and PLA formats.
 */
export function parseExcelWorkbook(file: File, buffer: ArrayBuffer, forcedType?: DocumentIngestType): ParseResult {
  const workbook = XLSX.read(buffer, { type: 'array' });
  const sheetNames = workbook.SheetNames;

  const detection = detectDocumentType(file.name, sheetNames);
  const docType = forcedType || detection.docType;

  const equipmentRecords: EquipmentRecord[] = [];
  const materialLines: MaterialLine[] = [];
  const planLines: PlanExecutionLine[] = [];
  const issues: ISO8000QualityIssue[] = [];

  const seenNomenclators = new Set<string>();
  let duplicates = 0;

  if (docType === 'LEV') {
    // Look for sheet: EQUIPOS INDISPONIBLES
    let equipSheetName = sheetNames.find(s => s.toUpperCase().includes('EQUIPO') || s.toUpperCase().includes('INDISPONIBLE')) || sheetNames[0];
    const equipSheet = workbook.Sheets[equipSheetName];
    const rawEquipJson: any[] = equipSheet ? XLSX.utils.sheet_to_json(equipSheet, { defval: '' }) : [];

    rawEquipJson.forEach((row, idx) => {
      const rowNum = idx + 2;
      const seq = Number(row['Secuencia'] || row['secuencia'] || row['SEQ'] || idx + 1);
      const state = String(row['Estado'] || row['ESTADO'] || 'TA').toUpperCase().trim().slice(0, 2);
      const region = String(row['Región'] || row['REGION'] || getStateRegion(state)).toUpperCase().trim();
      const sub = String(row['Subestación'] || row['SUBESTACION'] || row['Subestacion'] || '').trim();
      let kv = Number(row['Nivel kV'] || row['Tensión (kV)'] || row['Voltage_kV'] || row['KV'] || row['Nivel de Tensión'] || 0);
      const component = String(row['Componente'] || row['COMPONENTE'] || 'COMP').trim();
      const element = String(row['Tipo de Elemento'] || row['ELEMENTO'] || row['Elemento'] || 'Equipo').trim();
      const specs = String(row['Especificaciones Técnicas'] || row['Especificación Técnica'] || row['ESPECIFICACION'] || '').trim();
      const action = String(row['Acción Operativa'] || row['ACCION'] || 'Mantenimiento').trim();
      let nomenclator = String(row['Nomenclatura'] || row['NOMENCLATURA'] || row['Código'] || '').trim();

      let statusRaw = String(row['Estatus'] || row['ESTATUS'] || 'PENDIENTE').toUpperCase().trim();
      let status: any = 'PENDIENTE';
      if (statusRaw.includes('RESUELTO') || statusRaw.includes('OPERATIVO') || statusRaw.includes('LISTO')) status = 'RESUELTO';
      if (statusRaw.includes('EJECUCION') || statusRaw.includes('EN PROCESO')) status = 'EN EJECUCIÓN';

      let priorityRaw = String(row['Prioridad'] || row['PRIORIDAD'] || 'MEDIA').toUpperCase().trim();
      let priority: any = 'MEDIA';
      if (priorityRaw.includes('ALTA') || priorityRaw.includes('CRITICA')) priority = 'ALTA';
      if (priorityRaw.includes('BAJA')) priority = 'BAJA';

      const uom = String(row['Unidad Medida'] || row['Unidad'] || 'UN').trim();
      const qty = Number(row['Cantidad'] || 1);
      const scheduledDate = String(row['Fecha Programada'] || '').trim();

      if (!nomenclator) {
        nomenclator = `${state}-${sub.toUpperCase().replace(/\s+/g, '-') || 'SE'}-${idx + 1}`;
        issues.push({
          row_number: rowNum,
          nomenclator,
          axis: 'Exhaustividad',
          field: 'Nomenclatura',
          issue: 'Campo Nomenclatura ausente. Generado automáticamente por norma.',
          suggested_fix: nomenclator
        });
      }

      if (nomenclator !== nomenclator.toUpperCase()) {
        issues.push({
          row_number: rowNum,
          nomenclator,
          axis: 'Sintaxis',
          field: 'Nomenclatura',
          issue: 'Inconsistencia de formato (minúsculas). Debe ser mayúsculas.',
          suggested_fix: nomenclator.toUpperCase()
        });
      }

      if (!sub) {
        issues.push({
          row_number: rowNum,
          nomenclator,
          axis: 'Exhaustividad',
          field: 'Subestación',
          issue: 'Nombre de Subestación es obligatorio para levantamiento físico.'
        });
      }

      if (!action) {
        issues.push({
          row_number: rowNum,
          nomenclator,
          axis: 'Exhaustividad',
          field: 'Acción Operativa',
          issue: 'Acción operativa ausente en plantilla de levantamiento.'
        });
      }

      if (kv > 0 && !VOLTAGE_LEVELS_KV.includes(kv)) {
        issues.push({
          row_number: rowNum,
          nomenclator,
          axis: 'Exactitud',
          field: 'Nivel kV',
          issue: `Nivel de tensión ${kv}kV no pertenece al catálogo oficial SEN (${VOLTAGE_LEVELS_KV.join(', ')} kV).`
        });
      }

      if (seenNomenclators.has(nomenclator)) {
        duplicates++;
        issues.push({
          row_number: rowNum,
          nomenclator,
          axis: 'Deduplicación',
          field: 'Nomenclatura',
          issue: `Equipo duplicado detectado con nomenclatura '${nomenclator}'.`
        });
      } else {
        seenNomenclators.add(nomenclator);
      }

      equipmentRecords.push({
        record_id: `REC-LEV-${Date.now().toString().slice(-5)}-${idx}`,
        legacy_seq: seq,
        region_code: region,
        state_code: state,
        substation_name: sub || 'S/E Desconocida',
        voltage_in_kv: kv || 115,
        component_code: component,
        element_type: element,
        technical_specs: specs,
        operational_action: action,
        equipment_nomenclator: nomenclator,
        status,
        priority,
        uom,
        qty_equip: qty,
        scheduled_date: scheduledDate,
        total_budget_eur: 0,
        progress_pct: status === 'RESUELTO' ? 100 : status === 'EN EJECUCIÓN' ? 50 : 0,
        created_at: new Date().toISOString()
      });
    });

    // Parse Sheet 2: MATERIALES REQUERIDOS
    let matSheetName = sheetNames.find(s => s.toUpperCase().includes('MATERIAL'));
    if (matSheetName) {
      const matSheet = workbook.Sheets[matSheetName];
      const rawMatJson: any[] = XLSX.utils.sheet_to_json(matSheet, { defval: '' });

      rawMatJson.forEach((row, idx) => {
        const eqSeq = Number(row['Secuencia Equipo'] || row['Secuencia'] || idx + 1);
        const state = String(row['Estado'] || 'TA').toUpperCase().trim().slice(0, 2);
        const region = String(row['Región'] || getStateRegion(state)).toUpperCase().trim();
        const sub = String(row['Subestación'] || '').trim();
        const kv = Number(row['Nivel kV'] || 115);
        const component = String(row['Componente'] || '').trim();
        const element = String(row['Tipo Elemento'] || row['Tipo de Elemento'] || '').trim();
        const family = String(row['Familia Material'] || 'GENERAL').trim();
        const desc = String(row['Descripción del Material'] || row['Descripción'] || 'Material s/d').trim();
        const uom = String(row['Unidad'] || 'UN').trim();
        const unitPrice = Number(row['Precio Unitario EUR'] || 0);
        const qty = Number(row['Cantidad Requerida'] || row['Cantidad'] || 1);
        const totalEur = Number(row['Total EUR'] || (unitPrice * qty));
        const status = String(row['Estatus'] || 'PENDIENTE').trim();
        const priority = String(row['Prioridad'] || 'MEDIA').trim();

        materialLines.push({
          equipment_seq: eqSeq,
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
          total_eur: totalEur,
          status,
          priority
        });
      });
    }

  } else {
    // docType === 'PLA'
    // Sheet 1: PLAN DE EJECUCIÓN
    let planSheetName = sheetNames.find(s => s.toUpperCase().includes('PLAN') || s.toUpperCase().includes('EJECUCION')) || sheetNames[0];
    const planSheet = workbook.Sheets[planSheetName];
    const rawPlanJson: any[] = planSheet ? XLSX.utils.sheet_to_json(planSheet, { defval: '' }) : [];

    rawPlanJson.forEach((row, idx) => {
      const rowNum = idx + 2;
      const seqPlan = Number(row['Secuencia Plan'] || row['Secuencia'] || idx + 1);
      const state = String(row['Estado'] || 'TA').toUpperCase().trim().slice(0, 2);
      const region = String(row['Región'] || getStateRegion(state)).toUpperCase().trim();
      const sub = String(row['Subestación'] || '').trim();
      const planLine = String(row['Línea de Plan'] || row['Linea'] || 'PLAN-01').trim();
      const action = String(row['Acción Planificada'] || row['Acción'] || '').trim();
      const budget = Number(row['Presupuesto Asignado EUR'] || row['Presupuesto EUR'] || row['Monto EUR'] || 0);
      const targetPct = Number(row['Porcentaje Meta'] || row['Meta %'] || 100);
      const startDate = String(row['Fecha Inicio'] || '').trim();
      const endDate = String(row['Fecha Fin'] || '').trim();
      const responsible = String(row['Responsable'] || 'GGPD').trim();

      const nomenclator = `PLA-${state}-${sub.toUpperCase().replace(/\s+/g, '-') || 'SE'}-${seqPlan}`;

      // ISO 8000 Checks for PLA
      if (budget <= 0) {
        issues.push({
          row_number: rowNum,
          nomenclator,
          axis: 'Exhaustividad',
          field: 'Presupuesto Asignado EUR',
          issue: 'El plan de ejecución requiere asignación presupuestaria en EUR (monto > 0).'
        });
      }

      if (!action) {
        issues.push({
          row_number: rowNum,
          nomenclator,
          axis: 'Exhaustividad',
          field: 'Acción Planificada',
          issue: 'Campo Acción Planificada es obligatorio en la plantilla PLA.'
        });
      }

      if (targetPct <= 0 || targetPct > 100) {
        issues.push({
          row_number: rowNum,
          nomenclator,
          axis: 'Exactitud',
          field: 'Porcentaje Meta',
          issue: `Porcentaje meta inválido (${targetPct}%). Debe estar entre 1% y 100%.`
        });
      }

      planLines.push({
        seq_plan: seqPlan,
        region_code: region,
        state_code: state,
        substation_name: sub || 'S/E Desconocida',
        plan_line: planLine,
        planned_action: action,
        budget_assigned_eur: budget,
        target_pct: targetPct,
        start_date: startDate,
        end_date: endDate,
        responsible
      });

      // Also create corresponding equipment record for integration
      equipmentRecords.push({
        record_id: `REC-PLA-${Date.now().toString().slice(-5)}-${idx}`,
        legacy_seq: seqPlan,
        region_code: region,
        state_code: state,
        substation_name: sub || 'S/E Desconocida',
        voltage_in_kv: 115,
        component_code: 'PLAN',
        element_type: 'Inversión de Infraestructura',
        technical_specs: `Línea: ${planLine} | Resp: ${responsible}`,
        operational_action: action || 'Ejecución de Plan',
        equipment_nomenclator: nomenclator,
        status: targetPct >= 100 ? 'EN EJECUCIÓN' : 'PENDIENTE',
        priority: 'ALTA',
        total_budget_eur: budget,
        progress_pct: 0,
        execution_notes: `Plan de Acción (${startDate} a ${endDate})`,
        created_at: new Date().toISOString()
      });
    });
  }

  // Calculate ISO 8000 scores
  const totalRows = docType === 'LEV' ? equipmentRecords.length : planLines.length;
  const invalidRows = new Set(issues.map(i => i.row_number)).size;
  const validRows = Math.max(0, totalRows - invalidRows);

  const completitudPct = totalRows > 0 
    ? Math.round(((totalRows - issues.filter(i => i.axis === 'Exhaustividad').length) / totalRows) * 100) 
    : 100;
  
  const consistenciaPct = totalRows > 0 
    ? Math.round(((totalRows - issues.filter(i => i.axis === 'Sintaxis').length) / totalRows) * 100) 
    : 100;
  
  const catalogoPct = totalRows > 0 
    ? Math.round(((totalRows - issues.filter(i => i.axis === 'Exactitud').length) / totalRows) * 100) 
    : 100;

  // Formula: Score Quality = (0.40 * Completitud) + (0.40 * Consistencia) + (0.20 * Catálogo)
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

/**
 * Generate sample template files for download
 */
export function generateSampleExcel(type: DocumentIngestType, customFileName?: string) {
  const wb = XLSX.utils.book_new();

  if (type === 'LEV') {
    const equipData = [
      {
        'Secuencia': 1,
        'Región': 'ANDES',
        'Estado': 'TA',
        'Subestación': 'S/E San Cristóbal',
        'Nivel kV': 230,
        'Componente': 'TR-1',
        'Tipo de Elemento': 'Transformador de Potencia 100MVA',
        'Especificaciones Técnicas': '230/115kV EFACEC',
        'Acción Operativa': 'Reemplazo de Bushings',
        'Nomenclatura': 'TA-SAN-CRISTOBAL-TR1',
        'Estatus': 'EN EJECUCIÓN',
        'Prioridad': 'ALTA',
        'Unidad Medida': 'UN',
        'Cantidad': 1,
        'Fecha Programada': '2026-08-15'
      },
      {
        'Secuencia': 2,
        'Región': 'CAPITAL',
        'Estado': 'DC',
        'Subestación': 'S/E Tacagua',
        'Nivel kV': 115,
        'Componente': 'TC-1',
        'Tipo de Elemento': 'Transformador de Corriente',
        'Especificaciones Técnicas': '115kV Trench',
        'Acción Operativa': 'Mantenimiento Mayor',
        'Nomenclatura': 'DC-TACAGUA-TC-115',
        'Estatus': 'PENDIENTE',
        'Prioridad': 'MEDIA',
        'Unidad Medida': 'UN',
        'Cantidad': 3,
        'Fecha Programada': '2026-09-01'
      }
    ];

    const matData = [
      {
        'Secuencia Equipo': 1,
        'Región': 'ANDES',
        'Estado': 'TA',
        'Subestación': 'S/E San Cristóbal',
        'Nivel kV': 230,
        'Componente': 'TR-1',
        'Tipo Elemento': 'Transformador de Potencia',
        'Familia Material': 'AISLADORES',
        'Descripción del Material': 'Bushing Pasa-Tapa 230kV 1200A Rip',
        'Unidad': 'PZA',
        'Precio Unitario EUR': 18500,
        'Cantidad Requerida': 3,
        'Total EUR': 55500,
        'Estatus': 'APROBADO',
        'Prioridad': 'ALTA'
      }
    ];

    const ws1 = XLSX.utils.json_to_sheet(equipData);
    const ws2 = XLSX.utils.json_to_sheet(matData);

    XLSX.utils.book_append_sheet(wb, ws1, 'EQUIPOS INDISPONIBLES');
    XLSX.utils.book_append_sheet(wb, ws2, 'MATERIALES REQUERIDOS');

    XLSX.writeFile(wb, customFileName || 'TAC_2026_GGPD_LEV_EI_SE_V01.xlsx');
  } else {
    const planData = [
      {
        'Secuencia Plan': 1,
        'Región': 'ANDES',
        'Estado': 'TA',
        'Subestación': 'S/E San Cristóbal',
        'Línea de Plan': 'PLAN-REEMPLAZO-TR',
        'Acción Planificada': 'Sustitución de Transformador T2 115kV por unidad de reserva estratégica',
        'Presupuesto Asignado EUR': 145000,
        'Porcentaje Meta': 100,
        'Fecha Inicio': '2026-08-10',
        'Fecha Fin': '2026-10-30',
        'Responsable': 'Ing. Carlos Mendoza (GGPD Táchira)'
      },
      {
        'Secuencia Plan': 2,
        'Región': 'CAPITAL',
        'Estado': 'DC',
        'Subestación': 'S/E Tacagua',
        'Línea de Plan': 'PLAN-MANTENIMIENTO-INTERRUPTORES',
        'Acción Planificada': 'Mantenimiento preventivo a banco de interruptores de 115kV',
        'Presupuesto Asignado EUR': 42000,
        'Porcentaje Meta': 100,
        'Fecha Inicio': '2026-09-01',
        'Fecha Fin': '2026-11-15',
        'Responsable': 'Coordinación Capital GGPD'
      }
    ];

    const summaryData = [
      {
        'Familia Componente': 'TRANSFORMADORES DE POTENCIA',
        'Proyectos Asignados': 1,
        'Total Presupuesto EUR': 145000
      },
      {
        'Familia Componente': 'INTERRUPTORES DE POTENCIA',
        'Proyectos Asignados': 1,
        'Total Presupuesto EUR': 42000
      }
    ];

    const ws1 = XLSX.utils.json_to_sheet(planData);
    const ws2 = XLSX.utils.json_to_sheet(summaryData);

    XLSX.utils.book_append_sheet(wb, ws1, 'PLAN DE EJECUCIÓN');
    XLSX.utils.book_append_sheet(wb, ws2, 'RESUMEN PRESUPUESTARIO');

    XLSX.writeFile(wb, customFileName || 'TAC_2026_GGPD_PLA_EI_SE_V01.xlsx');
  }
}
