/**
 * ==============================================================================
 * CORPOELEC - GERENCIA GENERAL DE PLANIFICACIÓN DE DISTRIBUCIÓN (GGPD)
 * SERVICIO DE AUDITORÍA Y CALIDAD DE DISEÑO DE INSTRUMENTOS ISO 8000
 * Y GESTOR DE CATÁLOGOS MAESTROS COMPARTIDOS (MDM REGISTRY)
 * ==============================================================================
 */

import { 
  ColumnDefinition, 
  DesignAuditReport, 
  DesignFinding, 
  MasterCatalog, 
  MasterCatalogItem 
} from '../types/ingestion';
import { supabase } from '../lib/supabase';

const STORAGE_KEY_CATALOGS = 'CORPOELEC_SIGI_MDM_CATALOGS_V1';

// ==============================================================================
// 1. CATÁLOGOS MAESTROS COMPARTIDOS DEL SEN (MDM REGISTRY)
// ==============================================================================

export const DEFAULT_MASTER_CATALOGS: MasterCatalog[] = [
  {
    id: 'CAT_SUBESTACIONES_SEN',
    code: 'CAT_SE',
    name: 'Subestaciones de Transmisión y Distribución (SEN)',
    description: 'Catálogo oficial normalizado de las 838 Subestaciones Eléctricas de Venezuela.',
    sourceApp: 'SCEIN / SCTIS / SIGI',
    itemsCount: 16,
    items: [
      { id: 'se-01', code: 'SE_CHA', name: 'S/E CHACAO', stateCode: 'DCA', isActive: true },
      { id: 'se-02', code: 'SE_CAF', name: 'S/E EL CAFETAL', stateCode: 'MIR', isActive: true },
      { id: 'se-03', code: 'SE_TAH', name: 'S/E LA TAHONA', stateCode: 'MIR', isActive: true },
      { id: 'se-04', code: 'SE_STF', name: 'S/E SANTA FE', stateCode: 'MIR', isActive: true },
      { id: 'se-05', code: 'SE_CON', name: 'S/E CONVENTO', stateCode: 'DCA', isActive: true },
      { id: 'se-06', code: 'SE_CUA', name: 'S/E CUATRICENTENARIO', stateCode: 'ZUL', isActive: true },
      { id: 'se-07', code: 'SE_STC', name: 'S/E SANTA CRUZ', stateCode: 'ARA', isActive: true },
      { id: 'se-08', code: 'SE_ZUL', name: 'S/E ZULIA', stateCode: 'ZUL', isActive: true },
      { id: 'se-09', code: 'SE_BAR', name: 'S/E BARINAS I', stateCode: 'BAR', isActive: true },
      { id: 'se-10', code: 'SE_CAY', name: 'S/E CAYAURIMA', stateCode: 'BOL', isActive: true },
      { id: 'se-11', code: 'SE_SIG', name: 'S/E SAN IGNACIO', stateCode: 'ARA', isActive: true },
      { id: 'se-12', code: 'SE_VAL', name: 'S/E VALENCIA SUR', stateCode: 'CAR', isActive: true },
      { id: 'se-13', code: 'SE_TAC', name: 'S/E TACHIRA', stateCode: 'TAC', isActive: true },
      { id: 'se-14', code: 'SE_COR', name: 'S/E CORO', stateCode: 'FAL', isActive: true },
      { id: 'se-15', code: 'SE_PLC', name: 'S/E PUERTO LA CRUZ', stateCode: 'ANZ', isActive: true },
      { id: 'se-16', code: 'SE_ESE', name: 'S/E GUAYANA ESEQUIBA CENTRAL', stateCode: 'GEQ', isActive: true }
    ]
  },
  {
    id: 'CAT_CIRCUITOS_DISTRIBUCION',
    code: 'CAT_CIR',
    name: 'Circuitos y Alimentadores de Distribución',
    description: 'Catálogo de circuitos troncales en 13.8kV, 24kV y 34.5kV.',
    sourceApp: 'SCTIS / SCPYP',
    itemsCount: 10,
    items: [
      { id: 'cir-01', code: 'CIR_CHA_01', name: 'CIR-CHACAO-01', stateCode: 'DCA', isActive: true },
      { id: 'cir-02', code: 'CIR_CHA_02', name: 'CIR-CHACAO-02', stateCode: 'DCA', isActive: true },
      { id: 'cir-03', code: 'CIR_TAH_01', name: 'CIR-LA-TAHONA-01', stateCode: 'MIR', isActive: true },
      { id: 'cir-04', code: 'CIR_LTQ_03', name: 'CIR-LOS-TEQUES-03', stateCode: 'MIR', isActive: true },
      { id: 'cir-05', code: 'CIR_GTI_01', name: 'CIR-GUATIRE-01', stateCode: 'MIR', isActive: true },
      { id: 'cir-06', code: 'CIR_CUA_04', name: 'CIR-CUATRICENTENARIO-04', stateCode: 'ZUL', isActive: true },
      { id: 'cir-07', code: 'CIR_IND_02', name: 'CIR-ZONA-INDUSTRIAL-02', stateCode: 'CAR', isActive: true },
      { id: 'cir-08', code: 'CIR_SAN_01', name: 'CIR-SAN-IGNACIO-01', stateCode: 'ARA', isActive: true },
      { id: 'cir-09', code: 'CIR_CAY_03', name: 'CIR-CAYAURIMA-03', stateCode: 'BOL', isActive: true },
      { id: 'cir-10', code: 'CIR_ESE_01', name: 'CIR-ESEQUIBO-NORTE-01', stateCode: 'GEQ', isActive: true }
    ]
  },
  {
    id: 'CAT_NIVELES_TENSION',
    code: 'CAT_KV',
    name: 'Niveles de Tensión Normalizados SEN',
    description: 'Tensiones nominales estándar según norma técnica CORPOELEC.',
    sourceApp: 'SAMC / SCEIN / SCTIS',
    itemsCount: 7,
    items: [
      { id: 'kv-01', code: '13.8KV', name: '13.8 kV (Distribución Media)', isActive: true },
      { id: 'kv-02', code: '24.0KV', name: '24.0 kV (Distribución Suburbana)', isActive: true },
      { id: 'kv-03', code: '34.5KV', name: '34.5 kV (Subtransmisión / Rural)', isActive: true },
      { id: 'kv-04', code: '115.0KV', name: '115.0 kV (Alta Tensión)', isActive: true },
      { id: 'kv-05', code: '230.0KV', name: '230.0 kV (Troncal SEN)', isActive: true },
      { id: 'kv-06', code: '400.0KV', name: '400.0 kV (Extra Alta Tensión)', isActive: true },
      { id: 'kv-07', code: '765.0KV', name: '765.0 kV (Columna Vertebral Guri)', isActive: true }
    ]
  },
  {
    id: 'CAT_TIPOS_EQUIPO_SCEIN',
    code: 'CAT_EQ',
    name: 'Familias de Equipos Mayores de Subestación',
    description: 'Clasificación de activos electromecánicos de potencia según ISO 55000.',
    sourceApp: 'SCEIN V3.0',
    itemsCount: 9,
    items: [
      { id: 'eq-01', code: 'TRANSFORMADOR_POTENCIA', name: 'Transformador de Potencia', isActive: true },
      { id: 'eq-02', code: 'INTERRUPTOR_POTENCIA', name: 'Interruptor de Potencia (SF6 / Vacío)', isActive: true },
      { id: 'eq-03', code: 'SECCIONADOR_LINEA', name: 'Seccionador de Línea', isActive: true },
      { id: 'eq-04', code: 'SECCIONADOR_BARRA', name: 'Seccionador de Barra', isActive: true },
      { id: 'eq-05', code: 'TRANSFORMADOR_CORRIENTE', name: 'Transformador de Corriente (TC)', isActive: true },
      { id: 'eq-06', code: 'TRANSFORMADOR_POTENCIAL', name: 'Transformador de Potencial (TP)', isActive: true },
      { id: 'eq-07', code: 'CELDA_METALCLAD', name: 'Celda Metalclad 13.8kV / 24kV', isActive: true },
      { id: 'eq-08', code: 'BANCO_CONDENSADORES', name: 'Banco de Condensadores', isActive: true },
      { id: 'eq-09', code: 'DESCARGADOR_SOBRETENSION', name: 'Descargador de Sobretensión (DPS / Pararrayo)', isActive: true }
    ]
  },
  {
    id: 'CAT_MATERIALES_REPUESTOS',
    code: 'CAT_MAT',
    name: 'Materiales, Repuestos y Consumibles Críticos',
    description: 'Insumos homologados para mantenimiento de subestaciones y circuitos.',
    sourceApp: 'SCEIN / Mantenimiento',
    itemsCount: 8,
    items: [
      { id: 'mat-01', code: 'ACEITE_DIELECTRICO', name: 'Aceite Dieléctrico Mineral Inhibido (Tambor)', isActive: true },
      { id: 'mat-02', code: 'FUSIBLE_K_25A', name: 'Fusible Tipo K 25A (Caja)', isActive: true },
      { id: 'mat-03', code: 'FUSIBLE_T_40A', name: 'Fusible Tipo T 40A (Caja)', isActive: true },
      { id: 'mat-04', code: 'CONECTOR_CUAL_40', name: 'Conector Bimetálico Cu-Al 4/0 AWG', isActive: true },
      { id: 'mat-05', code: 'AISLADOR_SUSP_52_3', name: 'Aislador de Suspensión ANSI 52-3 Polimérico', isActive: true },
      { id: 'mat-06', code: 'CABLE_ARVIDAL_40', name: 'Cable de Aluminio Arvidal 4/0 AWG (m)', isActive: true },
      { id: 'mat-07', code: 'DPS_POLIMERICO_12KV', name: 'Pararrayo Polimérico 12kV 10kA', isActive: true },
      { id: 'mat-08', code: 'BORNE_TRANSFORMADOR', name: 'Borne Pasatapa MT/AT para Transformador', isActive: true }
    ]
  },
  {
    id: 'CAT_CONDICIONES_OPERATIVAS',
    code: 'CAT_COND',
    name: 'Condiciones y Estados de Operatividad',
    description: 'Dictámenes de operatividad técnica para salas situacionales.',
    sourceApp: 'SCEIN / SCTIS',
    itemsCount: 6,
    items: [
      { id: 'cond-01', code: 'OPERATIVO', name: 'Operativo Normal', isActive: true },
      { id: 'cond-02', code: 'INDISPONIBLE_FALLA', name: 'Indisponible por Falla / Avería', isActive: true },
      { id: 'cond-03', code: 'MANTENIMIENTO_PREVENTIVO', name: 'En Mantenimiento Preventivo', isActive: true },
      { id: 'cond-04', code: 'ALARMA_CRITICA', name: 'En Alarma Crítica / Observación', isActive: true },
      { id: 'cond-05', code: 'PRUEBAS_ELECTRICAS', name: 'En Pruebas Eléctricas y Laboratorio', isActive: true },
      { id: 'cond-06', code: 'DESENERGIZADO_SEGURIDAD', name: 'Desenergizado por Seguridad', isActive: true }
    ]
  },
  {
    id: 'CAT_CAUSAS_INTERRUPCION',
    code: 'CAT_CAU',
    name: 'Causas Normalizadas de Interrupción SEN',
    description: 'Catálogo de códigos de eventos y fallas normalizado.',
    sourceApp: 'SCTIS V2.0',
    itemsCount: 6,
    items: [
      { id: 'cau-01', code: 'CAU-DIS-001', name: 'Vegetación / Pica y Poda (Contacto)', isActive: true },
      { id: 'cau-02', code: 'CAU-DIS-002', name: 'Sobrecarga Térmica de Circuito', isActive: true },
      { id: 'cau-03', code: 'CAU-DIS-003', name: 'Falla o Pérdida de Aislamiento', isActive: true },
      { id: 'cau-04', code: 'CAU-DIS-004', name: 'Disparo por Sobrecorriente / Protección', isActive: true },
      { id: 'cau-05', code: 'CAU-DIS-005', name: 'Mantenimiento Programado / Maniobra', isActive: true },
      { id: 'cau-06', code: 'CAU-DIS-006', name: 'Condición Atmosférica / Descarga Eléctrica', isActive: true }
    ]
  }
];

export const getMasterCatalogs = (): MasterCatalog[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CATALOGS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error('Error reading master catalogs:', e);
  }
  return DEFAULT_MASTER_CATALOGS;
};

export const saveMasterCatalogItem = (catalogId: string, item: { code: string; name: string; stateCode?: string }): MasterCatalog[] => {
  const current = getMasterCatalogs();
  const updated = current.map(cat => {
    if (cat.id === catalogId) {
      const newItem: MasterCatalogItem = {
        id: `item-${Date.now().toString().slice(-6)}`,
        code: item.code.toUpperCase().replace(/\s+/g, '_'),
        name: item.name,
        stateCode: item.stateCode,
        isActive: true
      };
      return {
        ...cat,
        itemsCount: cat.items.length + 1,
        items: [...cat.items, newItem]
      };
    }
    return cat;
  });

  localStorage.setItem(STORAGE_KEY_CATALOGS, JSON.stringify(updated));
  return updated;
};

// ==============================================================================
// 2. MOTOR HEURÍSTICO DE AUDITORÍA Y DIAGNÓSTICO ISO 8000
// ==============================================================================

export const auditInstrumentColumns = (columns: ColumnDefinition[]): DesignAuditReport => {
  const findings: DesignFinding[] = [];
  const colNames = columns.map(c => c.name.toUpperCase().trim());
  let penalty = 0;

  // 1. Detección de Violación 1NF (Columnas Repetitivas Horizontales ej: TP1, TP2, TR_A, CIR_1)
  const repeatingPatterns = [
    { prefix: 'TP', regex: /^(TP|TRANSFORMADOR_POTENCIA)[-_]?[0-9]+/i, entity: 'Transformadores de Potencia' },
    { prefix: 'TR', regex: /^(TR|TRANSFORMADOR)[-_]?[0-9]+/i, entity: 'Transformadores' },
    { prefix: 'CIR', regex: /^(CIR|CIRCUITO)[-_]?[0-9]+/i, entity: 'Circuitos' },
    { prefix: 'INT', regex: /^(INT|INTERRUPTOR)[-_]?[0-9]+/i, entity: 'Interruptores' },
    { prefix: 'CEL', regex: /^(CEL|CELDA)[-_]?[0-9]+/i, entity: 'Celdas' },
    { prefix: 'MAT', regex: /^(MAT|MATERIAL)[-_]?[0-9]+/i, entity: 'Materiales' }
  ];

  repeatingPatterns.forEach(pat => {
    const matched = colNames.filter(name => pat.regex.test(name));
    if (matched.length >= 2) {
      penalty += 35;
      findings.push({
        id: `1NF-${pat.prefix}`,
        severity: 'CRITICAL_1NF',
        title: `Violación 1ra Forma Normal (1NF): Columnas Repetitivas para ${pat.entity}`,
        description: `Se detectaron ${matched.length} columnas numeradas horizontalmente (${matched.join(', ')}). Esto impide consultas dinámicas, colapsa el formato cuando un estado tiene más elementos y genera sobreconteo en la consolidación nacional.`,
        affectedColumns: matched,
        suggestedAction: `Convertir las columnas horizontales en registros verticales utilizando los campos normalizados 'TAG_${pat.prefix}', 'TIPO_ACTIVO' y métricas individuales por fila.`
      });
    }
  });

  // 2. Detección de Violación 3NF (Métricas Agregadas / Totales en Tablas de Detalle)
  const aggregateKeywords = ['TOTAL_', 'CANTIDAD_TOTAL', 'SUMA_', 'SUBTOTAL_', 'TOTAL_AFECTADOS', 'TOTAL_MW'];
  const aggregateMatches = colNames.filter(name => aggregateKeywords.some(kw => name.includes(kw)));

  if (aggregateMatches.length > 0) {
    penalty += 20;
    findings.push({
      id: '3NF-AGGREGATES',
      severity: 'WARNING_3NF',
      title: 'Violación 3ra Forma Normal (3NF): Métricas Agregadas en Tabla Transaccional',
      description: `Se detectaron campos calculados o totales de resumen (${aggregateMatches.join(', ')}). Al ingresar un total en cada fila de detalle, las herramientas analíticas (PowerBI/Supabase) multiplican el total provocando duplicación de cifras.`,
      affectedColumns: aggregateMatches,
      suggestedAction: 'Eliminar las columnas agregadas. Las métricas de total se calculan dinámicamente mediante funciones de agregación (SUM, COUNT) en el sistema.'
    });
  }

  // 3. Matching Inteligente contra Catálogos Maestros del SEN (MDM Matcher)
  const catalogs = getMasterCatalogs();

  columns.forEach(col => {
    const name = col.name.toUpperCase();

    // Subestación
    if ((name.includes('SUBESTACION') || name === 'SE' || name === 'S_E') && col.type !== 'catalog') {
      findings.push({
        id: `MDM-SE-${col.name}`,
        severity: 'CATALOG_MATCH',
        title: `Oportunidad MDM: Vincular '${col.name}' a Catálogo de Subestaciones`,
        description: `El campo '${col.name}' coincide con la entidad física de Subestación. Vincularlo a la lista desplegable oficial 'CAT_SUBESTACIONES_SEN' previene faltas ortográficas y errores de tipeo.`,
        affectedColumns: [col.name],
        suggestedAction: 'Cambiar tipo de campo a Catálogo Maestro y vincular a CAT_SUBESTACIONES_SEN.',
        matchedCatalogId: 'CAT_SUBESTACIONES_SEN'
      });
    }

    // Circuito
    if ((name.includes('CIRCUITO') || name === 'CIR' || name === 'ALIMENTADOR') && col.type !== 'catalog') {
      findings.push({
        id: `MDM-CIR-${col.name}`,
        severity: 'CATALOG_MATCH',
        title: `Oportunidad MDM: Vincular '${col.name}' a Catálogo de Circuitos`,
        description: `El campo '${col.name}' coincide con la red de alimentadores. Se sugiere vincularlo a 'CAT_CIRCUITOS_DISTRIBUCION'.`,
        affectedColumns: [col.name],
        suggestedAction: 'Cambiar tipo a Catálogo Maestro y vincular a CAT_CIRCUITOS_DISTRIBUCION.',
        matchedCatalogId: 'CAT_CIRCUITOS_DISTRIBUCION'
      });
    }

    // Niveles de Tensión
    if ((name.includes('TENSION') || name.includes('KV') || name.includes('VOLTAJE')) && col.type !== 'catalog') {
      findings.push({
        id: `MDM-KV-${col.name}`,
        severity: 'CATALOG_MATCH',
        title: `Oportunidad MDM: Vincular '${col.name}' a Niveles de Tensión`,
        description: `El campo '${col.name}' puede restringirse a las tensiones nominales normalizadas (13.8kV, 24kV, 34.5kV, 115kV, etc.).`,
        affectedColumns: [col.name],
        suggestedAction: 'Vincular a CAT_NIVELES_TENSION.',
        matchedCatalogId: 'CAT_NIVELES_TENSION'
      });
    }

    // Tipos de Equipo / Activos
    if ((name.includes('TIPO_EQUIPO') || name === 'EQUIPO' || name.includes('FAMILIA_EQUIPO')) && col.type !== 'catalog') {
      findings.push({
        id: `MDM-EQ-${col.name}`,
        severity: 'CATALOG_MATCH',
        title: `Oportunidad MDM: Vincular '${col.name}' a Catálogo de Equipos SCEIN`,
        description: `El campo '${col.name}' puede heredar el catálogo oficial de activos electromecánicos de SCEIN.`,
        affectedColumns: [col.name],
        suggestedAction: 'Vincular a CAT_TIPOS_EQUIPO_SCEIN.',
        matchedCatalogId: 'CAT_TIPOS_EQUIPO_SCEIN'
      });
    }

    // Materiales / Repuestos
    if ((name.includes('MATERIAL') || name.includes('REPUESTO') || name.includes('INSUMO')) && col.type !== 'catalog') {
      findings.push({
        id: `MDM-MAT-${col.name}`,
        severity: 'CATALOG_MATCH',
        title: `Oportunidad MDM: Vincular '${col.name}' a Materiales y Repuestos`,
        description: `El campo '${col.name}' puede vincularse a la lista oficial de insumos homologados.`,
        affectedColumns: [col.name],
        suggestedAction: 'Vincular a CAT_MATERIALES_REPUESTOS.',
        matchedCatalogId: 'CAT_MATERIALES_REPUESTOS'
      });
    }
  });

  // 4. Verificación de Grano y Trazabilidad (Claves Espaciales y Temporales)
  const hasState = colNames.some(n => n === 'COD_ESTADO' || n === 'ESTADO');
  const hasDate = colNames.some(n => n.includes('FECHA') || n === 'DATE');

  if (!hasState) {
    penalty += 15;
    findings.push({
      id: 'GRAIN-NO-STATE',
      severity: 'MISSING_GRAIN',
      title: 'Falta de Clave Territorial: No se detectó campo COD_ESTADO',
      description: 'El instrumento carece de identificación geográfica estatal obligatoria según la directiva de Gobernanza SEN.',
      affectedColumns: [],
      suggestedAction: 'Incorporar la columna obligatoria COD_ESTADO vinculada a las 25 entidades federales.'
    });
  }

  if (!hasDate) {
    penalty += 10;
    findings.push({
      id: 'GRAIN-NO-DATE',
      severity: 'MISSING_GRAIN',
      title: 'Falta de Clave Temporal: No se detectó campo FECHA',
      description: 'No se identificó un campo de fecha para trazabilidad cronológica de los eventos o trabajos.',
      affectedColumns: [],
      suggestedAction: 'Incorporar la columna FECHA_REGISTRO o FECHA_EVENTO.'
    });
  }

  // Cálculo del Score de Madurez
  const score = Math.max(10, Math.min(100, 100 - penalty));
  let status: 'CONFORME' | 'REQUIERE_AJUSTES' | 'NO_FACTIBLE' = 'CONFORME';
  if (score < 70) status = 'NO_FACTIBLE';
  else if (score < 88 || findings.length > 0) status = 'REQUIERE_AJUSTES';

  // Generación de la Estructura Refactorizada Sugerida
  const refactoredColumns = suggestRefactoredSchema(columns, findings);

  return {
    score,
    status,
    findings,
    originalColumnsCount: columns.length,
    refactoredColumns,
    timestamp: new Date().toISOString()
  };
};

/**
 * Generador automático de esquema normalizado a 1 clic
 */
export const suggestRefactoredSchema = (
  originalColumns: ColumnDefinition[], 
  findings: DesignFinding[]
): ColumnDefinition[] => {
  const forbiddenColumns = new Set<string>();
  const catalogBindings = new Map<string, string>();

  // Identificar columnas a remover o refactorizar
  findings.forEach(f => {
    if (f.severity === 'CRITICAL_1NF' || f.severity === 'WARNING_3NF') {
      f.affectedColumns.forEach(c => forbiddenColumns.add(c.toUpperCase()));
    }
    if (f.severity === 'CATALOG_MATCH' && f.matchedCatalogId) {
      f.affectedColumns.forEach(c => catalogBindings.set(c.toUpperCase(), f.matchedCatalogId!));
    }
  });

  const refactored: ColumnDefinition[] = [];

  // Asegurar COD_ESTADO al inicio
  const hasState = originalColumns.some(c => c.name.toUpperCase() === 'COD_ESTADO');
  if (!hasState) {
    refactored.push({
      name: 'COD_ESTADO',
      type: 'string',
      description: 'Código oficial del Estado (DCA, ZUL, MIR...)',
      required: true,
      sampleValue: 'DCA'
    });
  }

  // Procesar columnas no prohibidas
  originalColumns.forEach(col => {
    const upperName = col.name.toUpperCase();
    if (forbiddenColumns.has(upperName)) return;

    if (catalogBindings.has(upperName)) {
      const catalogId = catalogBindings.get(upperName)!;
      refactored.push({
        ...col,
        type: 'catalog',
        masterCatalogId: catalogId,
        description: `${col.description || col.name} (Lista Desplegable Oficial)`
      });
    } else {
      refactored.push(col);
    }
  });

  // Si hubo violación 1NF de transformadores/equipos, agregar campos verticales estándar
  const has1NF = findings.some(f => f.severity === 'CRITICAL_1NF');
  if (has1NF) {
    const alreadyHasTag = refactored.some(c => c.name.toUpperCase().includes('TAG') || c.name.toUpperCase().includes('EQUIPO'));
    if (!alreadyHasTag) {
      refactored.push({
        name: 'TAG_EQUIPO',
        type: 'string',
        description: 'Identificador del equipo individual intervenido (ej. TR-01, INT-115)',
        required: true,
        sampleValue: 'TR-01'
      });
      refactored.push({
        name: 'TIPO_EQUIPO',
        type: 'catalog',
        masterCatalogId: 'CAT_TIPOS_EQUIPO_SCEIN',
        description: 'Categoría del activo electromecánico',
        required: true,
        sampleValue: 'TRANSFORMADOR DE POTENCIA'
      });
      refactored.push({
        name: 'CAPACIDAD_MVA_O_KVA',
        type: 'number',
        description: 'Capacidad o potencia del equipo afectado (>0)',
        required: false,
        sampleValue: '36.0'
      });
    }
  }

  // Asegurar fecha si faltaba
  const hasDate = refactored.some(c => c.name.toUpperCase().includes('FECHA'));
  if (!hasDate) {
    refactored.push({
      name: 'FECHA_REGISTRO',
      type: 'date',
      description: 'Fecha oficial del registro o evento (YYYY-MM-DD)',
      required: true,
      sampleValue: '2026-08-15'
    });
  }

  return refactored;
};

// ==============================================================================
// 3. CAPA ENRIQUECIDA CON GOOGLE GEMINI IA (Opcional / Pro)
// ==============================================================================

export const requestGeminiDesignReview = async (
  columns: ColumnDefinition[],
  auditReport: DesignAuditReport,
  apiKey?: string
): Promise<string> => {
  const env = (import.meta as any).env || {};
  const activeKey = apiKey || env.VITE_GEMINI_API_KEY || '';

  // Prompt estructurado para Gemini
  const promptText = `Eres un Ingeniero Principal de Datos y Auditor Líder ISO 8000-110 para CORPOELEC (Sector Eléctrico de Venezuela).
Analiza el siguiente diseño de instrumento operativo propuesto para una sala situacional del SEN:
Columnas Originales: ${columns.map(c => `${c.name} (${c.type})`).join(', ')}
Score de Normalización: ${auditReport.score}% (${auditReport.status})
Hallazgos Técnicos: ${auditReport.findings.map(f => `[${f.severity}] ${f.title}: ${f.description}`).join(' | ')}

Genera un DICTAMEN EJECUTIVO Y PEDAGÓGICO DE 3 PÁRRAFOS:
1. Explica al especialista con cortesía pero rigor técnico por qué los errores detectados (ej. grupos repetitivos o totales mezclados) causarán problemas graves en la consolidación nacional de los 25 Estados.
2. Explica los beneficios operacionales de utilizar la estructura refactorizada propuesta y los Catálogos Maestros oficiales (MDM).
3. Concluye con una recomendación de aprobación institucional bajo estándar ISO 8000 / ISO 55000.`;

  if (activeKey) {
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${activeKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: promptText }] }]
        })
      });

      if (response.ok) {
        const json = await response.json();
        const generatedText = json.candidates?.[0]?.content?.parts?.[0]?.text;
        if (generatedText) return generatedText;
      }
    } catch (e) {
      console.warn('Error comunicando con Google Gemini API, utilizando motor nativo local:', e);
    }
  }

  // Fallback Determinista Nativo de Alta Calidad
  return `DICTAMEN DE AUDITORÍA TÉCNICA GGPD (Norma ISO 8000-110 / ISO 55000):

1. Diagnóstico de Arquitectura: El instrumento presentado presenta un índice de madurez de ${auditReport.score}% (${auditReport.status}). Se identificaron ${auditReport.findings.length} hallazgos estructurales que comprometen la normalización sintáctica y la integridad referencial requerida por la Dirección General de Planificación.

2. Impacto en Consolidación: La presencia de estructuras horizontales o métricas agregadas en tablas de detalle genera sobreconteo matemático al sumarizar los reportes de las 25 salas situacionales estadales. 

3. Dictamen de Normalización: Se recomienda adoptar la propuesta refactorizada generada por el Asistente SIGI, vinculando las columnas a los Catálogos Maestros del SEN (CAT_SUBESTACIONES_SEN y afines) para erradicar inconsistencias sintácticas y certificar el proceso con su firma digital de esquema.`;
};
