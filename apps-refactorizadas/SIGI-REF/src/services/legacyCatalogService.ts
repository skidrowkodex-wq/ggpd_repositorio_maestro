/**
 * ==============================================================================
 * CORPOELEC — GGPD · SIGI
 * SERVICIO DE CATÁLOGOS LEGACY EXTRAÍDOS DE PROPUESTA FORMATOS 2026
 * ==============================================================================
 * 
 * Este módulo carga los catálogos maestros extraídos de los formularios legacy
 * (PROPUESTA FORMATOS 2026) y los convierte al formato MasterCatalog del SIGI.
 * 
 * Fuente: Auditoría NAC_2026_GGPD_AUDITORIA_FORMATOS_LEGACY_PROPUESTA_V01
 * Norma: ISO 8000-110 — Datos maestros de fuente única
 * 
 * Contiene:
 *   - 48 listas extraídas
 *   - 997+ items únicos
 *   - 804 precios de materiales
 *   - 871 registros de caracterización de subestaciones
 *   - 4,207 registros de caracterización de circuitos
 */

import { MasterCatalog, MasterCatalogItem } from '../types/ingestion';

// Import the extracted JSON catalog
import legacyData from '../data/masterCatalogsLegacy.json';

// ============================================================================
// HELPERS
// ============================================================================

let _counter = 0;
const nextId = (prefix: string) => `${prefix}-${(++_counter).toString().padStart(4, '0')}`;

function arrayToItems(
  arr: string[],
  codePrefix: string,
  options?: { stateCode?: string }
): MasterCatalogItem[] {
  return arr.map((name, i) => ({
    id: nextId(codePrefix.toLowerCase()),
    code: `${codePrefix}_${name.toUpperCase().replace(/[^A-Z0-9]+/g, '_').slice(0, 30)}`,
    name,
    stateCode: options?.stateCode,
    isActive: true,
  }));
}

// ============================================================================
// CATALOG BUILDERS
// ============================================================================

function buildTerritorialCatalogs(): MasterCatalog[] {
  const catalogs: MasterCatalog[] = [];
  const t = (legacyData as any).territoriales;

  // Regiones
  if (t?.regiones?.length) {
    catalogs.push({
      id: 'CAT_REGIONES_SEN',
      code: 'CAT_REG',
      name: 'Regiones CORPOELEC',
      description: 'Las 8 regiones administrativas de distribución eléctrica.',
      sourceApp: 'Legacy PROPUESTA FORMATOS 2026',
      itemsCount: t.regiones.length,
      items: arrayToItems(t.regiones, 'REG'),
    });
  }

  // Estados por Región
  if (t?.estados_por_region) {
    const allEstados: MasterCatalogItem[] = [];
    for (const [region, estados] of Object.entries(t.estados_por_region)) {
      for (const estado of estados as string[]) {
        allEstados.push({
          id: nextId('edo'),
          code: `EDO_${estado.toUpperCase().replace(/[^A-Z0-9]+/g, '_').slice(0, 20)}`,
          name: estado,
          stateCode: region,
          isActive: true,
        });
      }
    }
    if (allEstados.length > 0) {
      catalogs.push({
        id: 'CAT_ESTADOS_POR_REGION',
        code: 'CAT_EDO',
        name: 'Estados por Región CORPOELEC',
        description: 'Estados agrupados por región administrativa. stateCode = región.',
        sourceApp: 'Legacy PROPUESTA FORMATOS 2026',
        itemsCount: allEstados.length,
        items: allEstados,
      });
    }
  }

  // Subestaciones referencia
  if (t?.subestaciones_referencia?.length) {
    catalogs.push({
      id: 'CAT_SUBESTACIONES_LEGACY',
      code: 'CAT_SE_LEG',
      name: 'Subestaciones de Referencia (Legacy)',
      description: '24 subestaciones de referencia extraídas de los formularios legacy.',
      sourceApp: 'Legacy PROPUESTA FORMATOS 2026',
      itemsCount: t.subestaciones_referencia.length,
      items: arrayToItems(t.subestaciones_referencia, 'SEL'),
    });
  }

  return catalogs;
}

function buildProcessCatalogs(): MasterCatalog[] {
  const catalogs: MasterCatalog[] = [];
  const p = (legacyData as any).procesos;

  if (p?.categorias?.length) {
    catalogs.push({
      id: 'CAT_CATEGORIAS_ACTIVIDAD',
      code: 'CAT_CATEG',
      name: 'Categorías de Actividad de Distribución',
      description: '13 categorías de actividad operativa de la GGPD.',
      sourceApp: 'Legacy PROPUESTA FORMATOS 2026',
      itemsCount: p.categorias.length,
      items: arrayToItems(p.categorias, 'CATEG'),
    });
  }

  if (p?.actividades_mantenimiento?.length) {
    catalogs.push({
      id: 'CAT_ACTIVIDADES_MTTO',
      code: 'CAT_ACT',
      name: 'Actividades de Mantenimiento',
      description: 'Las 5 actividades principales del Plan de Mantenimiento GGPD.',
      sourceApp: 'Legacy PROPUESTA FORMATOS 2026',
      itemsCount: p.actividades_mantenimiento.length,
      items: arrayToItems(p.actividades_mantenimiento, 'ACT'),
    });
  }

  if (p?.tipos_restriccion_extendida?.length) {
    catalogs.push({
      id: 'CAT_TIPOS_RESTRICCION',
      code: 'CAT_REST',
      name: 'Tipos de Restricción Operativa',
      description: 'Clasificación de restricciones operativas en circuitos y subestaciones.',
      sourceApp: 'Legacy PROPUESTA FORMATOS 2026',
      itemsCount: p.tipos_restriccion_extendida.length,
      items: arrayToItems(p.tipos_restriccion_extendida, 'REST'),
    });
  }

  if (p?.componentes_circuito?.length) {
    catalogs.push({
      id: 'CAT_COMPONENTES_CIRCUITO',
      code: 'CAT_COMP_CTO',
      name: 'Componentes de Circuito a Inspeccionar',
      description: '18 componentes de circuito para inspección y diagnóstico.',
      sourceApp: 'Legacy PROPUESTA FORMATOS 2026',
      itemsCount: p.componentes_circuito.length,
      items: arrayToItems(p.componentes_circuito, 'CCTO'),
    });
  }

  if (p?.componentes_subestacion?.length) {
    catalogs.push({
      id: 'CAT_COMPONENTES_SUBESTACION',
      code: 'CAT_COMP_SE',
      name: 'Componentes de Subestación',
      description: '25 componentes de subestación para planes de mantenimiento.',
      sourceApp: 'Legacy PROPUESTA FORMATOS 2026',
      itemsCount: p.componentes_subestacion.length,
      items: arrayToItems(p.componentes_subestacion, 'CSE'),
    });
  }

  if (p?.componentes_ap?.length) {
    catalogs.push({
      id: 'CAT_COMPONENTES_AP',
      code: 'CAT_COMP_AP',
      name: 'Componentes de Alumbrado Público',
      description: '15 componentes de instalaciones de alumbrado público.',
      sourceApp: 'Legacy PROPUESTA FORMATOS 2026',
      itemsCount: p.componentes_ap.length,
      items: arrayToItems(p.componentes_ap, 'CAP'),
    });
  }

  return catalogs;
}

function buildMaterialCatalogs(): MasterCatalog[] {
  const catalogs: MasterCatalog[] = [];
  const m = (legacyData as any).materiales;

  // Main families catalog
  if (m?.familias?.length) {
    catalogs.push({
      id: 'CAT_FAMILIAS_MATERIAL',
      code: 'CAT_FAM',
      name: 'Familias de Materiales GGPD',
      description: '21 familias de materiales para el Plan de Mantenimiento.',
      sourceApp: 'Legacy PROPUESTA FORMATOS 2026',
      itemsCount: m.familias.length,
      items: arrayToItems(m.familias, 'FAM'),
    });
  }

  // Individual family catalogs (items per family)
  if (m?.items_por_familia) {
    for (const [familyKey, items] of Object.entries(m.items_por_familia)) {
      const itemArr = items as string[];
      if (itemArr.length > 0) {
        const friendlyName = familyKey
          .replace(/_/g, ' ')
          .replace(/\b\w/g, c => c.toUpperCase())
          .replace(/De /g, 'de ')
          .replace(/Y /g, 'y ');

        catalogs.push({
          id: `CAT_MAT_${familyKey}`,
          code: `CAT_${familyKey.slice(0, 8)}`,
          name: `Materiales: ${friendlyName}`,
          description: `${itemArr.length} items de la familia ${friendlyName}.`,
          sourceApp: 'Legacy PROPUESTA FORMATOS 2026',
          itemsCount: itemArr.length,
          items: arrayToItems(itemArr, familyKey.slice(0, 6)),
        });
      }
    }
  }

  return catalogs;
}

function buildEquipmentCatalogs(): MasterCatalog[] {
  const catalogs: MasterCatalog[] = [];
  const eq = (legacyData as any).equipos;

  const equipCatalogDefs: { key: string; id: string; code: string; name: string; desc: string }[] = [
    { key: 'componentes_se', id: 'CAT_COMPONENTES_SE_INDISPONIBLES', code: 'CAT_CSE_IND', name: 'Componentes SE (Indisponibles)', desc: '21 componentes de subestación para seguimiento de equipos indisponibles.' },
    { key: 'servicios_auxiliares', id: 'CAT_SERVICIOS_AUXILIARES', code: 'CAT_SA', name: 'Servicios Auxiliares de Subestación', desc: 'Baterías, cargadores, rectificadores, plantas de emergencia, etc.' },
    { key: 'tipos_interruptor', id: 'CAT_TIPOS_INTERRUPTOR', code: 'CAT_INT', name: 'Tipos de Interruptor por Tensión', desc: 'Clasificación de interruptores por nivel de tensión y función.' },
    { key: 'seguridad_infraestructura', id: 'CAT_SEGURIDAD_INFRA', code: 'CAT_SEG', name: 'Seguridad e Infraestructura SE', desc: 'A/C, alumbrado, cercas, desmalezamiento, SCI.' },
    { key: 'estados_trx_potencia', id: 'CAT_ESTADOS_TRX', code: 'CAT_ETRX', name: 'Estados de Transformador de Potencia', desc: 'Condiciones operativas de transformadores de potencia.' },
    { key: 'estados_se_movil', id: 'CAT_ESTADOS_SE_MOVIL', code: 'CAT_ESEM', name: 'Estados de Subestación Móvil', desc: 'Condiciones operativas de subestaciones móviles.' },
    { key: 'tipos_seccionador', id: 'CAT_TIPOS_SECCIONADOR', code: 'CAT_TSEC', name: 'Tipos de Seccionador', desc: 'Clasificación de seccionadores por posición y nivel.' },
    { key: 'tipos_pararrayo', id: 'CAT_TIPOS_PARARRAYO', code: 'CAT_TPAR', name: 'Tipos de Pararrayo', desc: 'Clasificación de pararrayos por lado y tensión.' },
    { key: 'sistema_pat', id: 'CAT_SISTEMA_PAT', code: 'CAT_PAT', name: 'Sistema de Puesta a Tierra', desc: 'Componentes del sistema de puesta a tierra.' },
    { key: 'tipos_reconectador', id: 'CAT_TIPOS_RECONECTADOR', code: 'CAT_TREC', name: 'Tipos de Reconectador', desc: 'Reconectadores por tensión y componentes asociados.' },
  ];

  for (const def of equipCatalogDefs) {
    const items = eq?.[def.key] as string[] | undefined;
    if (items?.length) {
      catalogs.push({
        id: def.id,
        code: def.code,
        name: def.name,
        description: def.desc,
        sourceApp: 'Legacy PROPUESTA FORMATOS 2026 — Equipos Indisponibles',
        itemsCount: items.length,
        items: arrayToItems(items, def.code.replace('CAT_', '')),
      });
    }
  }

  return catalogs;
}

function buildTensionCatalogs(): MasterCatalog[] {
  const catalogs: MasterCatalog[] = [];
  const tens = (legacyData as any).tensiones;

  if (tens?.subestacion?.length) {
    catalogs.push({
      id: 'CAT_TENSIONES_SUBESTACION',
      code: 'CAT_TKV_SE',
      name: 'Niveles de Tensión de Subestación',
      description: 'Tensiones de entrada a subestaciones del SEN.',
      sourceApp: 'Legacy PROPUESTA FORMATOS 2026',
      itemsCount: tens.subestacion.length,
      items: tens.subestacion.map((v: string) => ({
        id: nextId('tse'),
        code: `TKV_SE_${v.replace('.', '_')}`,
        name: `${v} kV`,
        isActive: true,
      })),
    });
  }

  if (tens?.circuito?.length) {
    catalogs.push({
      id: 'CAT_TENSIONES_CIRCUITO',
      code: 'CAT_TKV_CTO',
      name: 'Niveles de Tensión de Circuito',
      description: 'Tensiones nominales de circuitos de distribución.',
      sourceApp: 'Legacy PROPUESTA FORMATOS 2026',
      itemsCount: tens.circuito.length,
      items: tens.circuito.map((v: string) => ({
        id: nextId('tcto'),
        code: `TKV_CTO_${v.replace('.', '_')}`,
        name: `${v} kV`,
        isActive: true,
      })),
    });
  }

  return catalogs;
}

function buildUnitsCatalog(): MasterCatalog[] {
  const units = (legacyData as any).unidades;
  if (!units?.normalized) return [];

  const items: MasterCatalogItem[] = [];
  const seen = new Set<string>();

  for (const [raw, norm] of Object.entries(units.normalized)) {
    const n = norm as { code: string; name: string; iso: string };
    if (!seen.has(n.code)) {
      seen.add(n.code);
      items.push({
        id: nextId('unit'),
        code: n.code,
        name: `${n.name} (${n.iso})`,
        isActive: true,
      });
    }
  }

  return [{
    id: 'CAT_UNIDADES_MEDIDA',
    code: 'CAT_UOM',
    name: 'Unidades de Medida Normalizadas',
    description: 'Unidades armonizadas según ISO con código y alias.',
    sourceApp: 'Legacy PROPUESTA FORMATOS 2026 — Normalizado',
    itemsCount: items.length,
    items,
  }];
}

// ============================================================================
// PUBLIC API
// ============================================================================

/**
 * Returns all legacy catalogs converted to MasterCatalog format.
 * These complement the existing DEFAULT_MASTER_CATALOGS from instrumentAuditorService.
 */
export function getLegacyCatalogs(): MasterCatalog[] {
  _counter = 0; // Reset counter for deterministic IDs
  return [
    ...buildTerritorialCatalogs(),
    ...buildProcessCatalogs(),
    ...buildMaterialCatalogs(),
    ...buildEquipmentCatalogs(),
    ...buildTensionCatalogs(),
    ...buildUnitsCatalog(),
  ];
}

/**
 * Returns the raw legacy data for direct access to characterization data
 * (subestaciones and circuitos) which are too large for the MasterCatalog format.
 */
export function getLegacyCharacterizationData() {
  return {
    subestaciones: (legacyData as any).caracterizacion?.subestaciones || [],
    circuitos: (legacyData as any).caracterizacion?.circuitos || [],
  };
}

/**
 * Returns the price list from legacy data.
 */
export function getLegacyPriceList() {
  return (legacyData as any).precios || [];
}

/**
 * Returns metadata and statistics about the legacy extraction.
 */
export function getLegacyMetadata() {
  return (legacyData as any)._metadata || {};
}
