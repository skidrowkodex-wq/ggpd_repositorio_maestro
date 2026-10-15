import { 
  VENEZUELA_REGIONS, 
  VENEZUELA_STATES, 
  CORPOELEC_CENTROS_SERVICIOS,
  VenezuelanRegion, 
  VenezuelanState 
} from '../data/venezuelaRegions';
import { VehicleRecord, CentroServicioItem, MasterCatalogItem } from '../types/fleet';

/**
 * Tabla Única y Adaptador de Regiones CORPOELEC
 * Sistema de normalización y vinculación territorial para la Corporación Eléctrica Nacional.
 * Modelo Relacional con Llaves Foráneas:
 *   cat_regiones (PK: id) 
 *       └── cat_estados (PK: id, FK: region_id -> cat_regiones.id)
 *               └── cat_centros_servicios (PK: id, FK: estado_id, FK: region_id)
 */

// Aliases y variantes comunes en documentos, reportes y sistemas legados de CORPOELEC
const REGION_ALIASES: { [alias: string]: string } = {
  // Capital
  'CAPITAL': 'CAPITAL',
  'REGION CAPITAL': 'CAPITAL',
  'REGIÓN CAPITAL': 'CAPITAL',
  'GRAN CARACAS': 'CAPITAL',
  'CARACAS': 'CAPITAL',
  'CAP': 'CAPITAL',
  'REG-CAPITAL': 'CAPITAL',

  // Central
  'CENTRAL': 'CENTRAL',
  'REGION CENTRAL': 'CENTRAL',
  'REGIÓN CENTRAL': 'CENTRAL',
  'CENTRO': 'CENTRAL',
  'CEN': 'CENTRAL',
  'REG-CENTRAL': 'CENTRAL',

  // Occidental
  'OCCIDENTE': 'OCCIDENTE',
  'OCCIDENTAL': 'OCCIDENTE',
  'REGION OCCIDENTAL': 'OCCIDENTE',
  'REGIÓN OCCIDENTAL': 'OCCIDENTE',
  'REGION OCCIDENTE': 'OCCIDENTE',
  'REGIÓN OCCIDENTE': 'OCCIDENTE',
  'ZULIA': 'OCCIDENTE',
  'OCC': 'OCCIDENTE',
  'REG-OCCIDENTE': 'OCCIDENTE',
  'CENTRO-OCCIDENTE': 'OCCIDENTE',
  'CENTRO OCCIDENTE': 'OCCIDENTE',

  // Los Llanos
  'LLANOS': 'LOS LLANOS',
  'LOS LLANOS': 'LOS LLANOS',
  'REGION LLANOS': 'LOS LLANOS',
  'REGIÓN LLANOS': 'LOS LLANOS',
  'REGION LOS LLANOS': 'LOS LLANOS',
  'REGIÓN LOS LLANOS': 'LOS LLANOS',
  'LLA': 'LOS LLANOS',
  'REG-LLANOS': 'LOS LLANOS',

  // Los Andes
  'ANDES': 'LOS ANDES',
  'LOS ANDES': 'LOS ANDES',
  'REGION ANDES': 'LOS ANDES',
  'REGIÓN ANDES': 'LOS ANDES',
  'REGION LOS ANDES': 'LOS ANDES',
  'REGIÓN LOS ANDES': 'LOS ANDES',
  'ANDINA': 'LOS ANDES',
  'AND': 'LOS ANDES',
  'REG-ANDES': 'LOS ANDES',

  // Oriente
  'ORIENTE': 'ORIENTE',
  'ORIENTAL': 'ORIENTE',
  'REGION ORIENTE': 'ORIENTE',
  'REGIÓN ORIENTE': 'ORIENTE',
  'REGION ORIENTAL': 'ORIENTE',
  'REGIÓN ORIENTAL': 'ORIENTE',
  'ORI': 'ORIENTE',
  'REG-ORIENTE': 'ORIENTE',

  // Insular
  'INSULAR': 'INSULAR',
  'REGION INSULAR': 'INSULAR',
  'REGIÓN INSULAR': 'INSULAR',
  'INS': 'INSULAR',
  'REG-INSULAR': 'INSULAR',

  // Guayana
  'GUAYANA': 'GUAYANA',
  'REGION GUAYANA': 'GUAYANA',
  'REGIÓN GUAYANA': 'GUAYANA',
  'SUR': 'GUAYANA',
  'REGION SUR': 'GUAYANA',
  'REGIÓN SUR': 'GUAYANA',
  'GUY': 'GUAYANA',
  'ESEQUIBO': 'GUAYANA',
  'GUAYANA ESEQUIBA': 'GUAYANA',
  'ESTADO GUAYANA ESEQUIBA': 'GUAYANA',
  'REG-GUAYANA': 'GUAYANA'
};

const STATE_ALIASES: { [alias: string]: string } = {
  'DISTRITO CAPITAL': 'Distrito Capital',
  'CARACAS': 'Distrito Capital',
  'CCS': 'Distrito Capital',
  'DF': 'Distrito Capital',
  'CAP': 'Distrito Capital',
  'MIRANDA': 'Miranda',
  'MIR': 'Miranda',
  'LA GUAIRA': 'La Guaira',
  'VARGAS': 'La Guaira',
  'LAG': 'La Guaira',
  'CARABOBO': 'Carabobo',
  'CAR': 'Carabobo',
  'VALENCIA': 'Carabobo',
  'ARAGUA': 'Aragua',
  'ARA': 'Aragua',
  'MARACAY': 'Aragua',
  'COJEDES': 'Cojedes',
  'COJ': 'Cojedes',
  'ZULIA': 'Zulia',
  'ZUL': 'Zulia',
  'MARACAIBO': 'Zulia',
  'LARA': 'Lara',
  'LAR': 'Lara',
  'BARQUISIMETO': 'Lara',
  'FALCON': 'Falcón',
  'FALCÓN': 'Falcón',
  'FAL': 'Falcón',
  'YARACUY': 'Yaracuy',
  'YAR': 'Yaracuy',
  'MERIDA': 'Mérida',
  'MÉRIDA': 'Mérida',
  'MER': 'Mérida',
  'TACHIRA': 'Táchira',
  'TÁCHIRA': 'Táchira',
  'TAC': 'Táchira',
  'TRUJILLO': 'Trujillo',
  'TRU': 'Trujillo',
  'BARINAS': 'Barinas',
  'BAR': 'Barinas',
  'PORTUGUESA': 'Portuguesa',
  'POR': 'Portuguesa',
  'GUARICO': 'Guárico',
  'GUÁRICO': 'Guárico',
  'GUA': 'Guárico',
  'APURE': 'Apure',
  'APU': 'Apure',
  'ANZOATEGUI': 'Anzoátegui',
  'ANZOÁTEGUI': 'Anzoátegui',
  'ANZ': 'Anzoátegui',
  'MONAGAS': 'Monagas',
  'MON': 'Monagas',
  'SUCRE': 'Sucre',
  'SUC': 'Sucre',
  'NUEVA ESPARTA': 'Nueva Esparta',
  'MARGARITA': 'Nueva Esparta',
  'NVE': 'Nueva Esparta',
  'BOLIVAR': 'Bolívar',
  'BOLÍVAR': 'Bolívar',
  'BOL': 'Bolívar',
  'AMAZONAS': 'Amazonas',
  'AMZ': 'Amazonas',
  'DELTA AMACURO': 'Delta Amacuro',
  'DEL': 'Delta Amacuro',
  'GUAYANA ESEQUIBA': 'Guayana Esequiba',
  'ESTADO GUAYANA ESEQUIBA': 'Guayana Esequiba',
  'ESEQUIBO': 'Guayana Esequiba',
  'ZONA EN RECLAMACION': 'Guayana Esequiba',
  'ESQ': 'Guayana Esequiba',
  'DEPENDENCIAS FEDERALES': 'Dependencias Federales',
  'DEP': 'Dependencias Federales'
};

/**
 * Normaliza cualquier denominación textual o ID a la Región CORPOELEC oficial canónica.
 */
export function adaptCorpoelecRegion(input?: string): VenezuelanRegion | null {
  if (!input || !input.trim()) return null;
  const clean = input.trim().toUpperCase();

  // 1. Direct match on official region names, IDs or codes
  const directMatch = VENEZUELA_REGIONS.find(
    r => r.nombre.toUpperCase() === clean || 
         r.codigo.toUpperCase() === clean || 
         r.id.toUpperCase() === clean
  );
  if (directMatch) return directMatch;

  // 2. Lookup alias
  const aliasTarget = REGION_ALIASES[clean];
  if (aliasTarget) {
    const found = VENEZUELA_REGIONS.find(r => r.nombre === aliasTarget);
    if (found) return found;
  }

  // 3. Substring match
  const partial = VENEZUELA_REGIONS.find(
    r => r.nombre.toUpperCase().includes(clean) || clean.includes(r.nombre.toUpperCase())
  );
  if (partial) return partial;

  return null;
}

/**
 * Normaliza cualquier denominación textual o ID al Estado oficial de Venezuela.
 */
export function adaptVenezuelanState(input?: string): VenezuelanState | null {
  if (!input || !input.trim()) return null;
  const clean = input.trim().toUpperCase();

  // 1. Direct match on state names, IDs or codes
  const directMatch = VENEZUELA_STATES.find(
    s => s.nombre.toUpperCase() === clean || 
         s.codigo.toUpperCase() === clean || 
         s.id.toUpperCase() === clean
  );
  if (directMatch) return directMatch;

  // 2. Lookup alias
  const aliasTarget = STATE_ALIASES[clean];
  if (aliasTarget) {
    const found = VENEZUELA_STATES.find(s => s.nombre === aliasTarget);
    if (found) return found;
  }

  // 3. Diacritics tolerant match
  const stripped = clean.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const matchStripped = VENEZUELA_STATES.find(s => {
    const sStripped = s.nombre.toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    return sStripped === stripped;
  });
  if (matchStripped) return matchStripped;

  return null;
}

/**
 * Obtiene la Región CORPOELEC a partir de un Estado utilizando su Llave Foránea 'region_id'.
 */
export function getRegionForState(stateNameOrCode?: string): VenezuelanRegion {
  const state = adaptVenezuelanState(stateNameOrCode);
  if (state) {
    const region = VENEZUELA_REGIONS.find(r => r.id === state.region_id || r.nombre === state.region);
    if (region) return region;
  }
  // Default to Región Guayana
  return VENEZUELA_REGIONS.find(r => r.id === 'reg-guayana') || VENEZUELA_REGIONS[0];
}

/**
 * Retorna ÚNICAMENTE los Estados dependientes de una Región CORPOELEC mediante relación de Llave Foránea.
 * NUNCA retorna estados de otras regiones.
 */
export function getStatesForRegion(regionNameOrCode?: string): VenezuelanState[] {
  const region = adaptCorpoelecRegion(regionNameOrCode);
  if (!region) return [];

  return VENEZUELA_STATES.filter(s => s.region_id === region.id || s.region === region.nombre);
}

/**
 * Retorna ÚNICAMENTE los Centros de Servicios correspondientes al Estado seleccionado (FK estado_id).
 * El Estado determina de forma directa y estricta los Centros de Servicios.
 */
export function getCentrosForState(
  stateNameOrId?: string,
  allCentros: (MasterCatalogItem | CentroServicioItem)[] = CORPOELEC_CENTROS_SERVICIOS
): (MasterCatalogItem | CentroServicioItem)[] {
  const state = adaptVenezuelanState(stateNameOrId);
  if (!state) return [];

  const stateCleanName = state.nombre.toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  const filterFn = (cs: MasterCatalogItem | CentroServicioItem) => {
    const matchStateId = cs.estado_id && cs.estado_id.toLowerCase() === state.id.toLowerCase();
    const csStateClean = cs.estado_nombre ? cs.estado_nombre.toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '') : '';
    const matchStateName = Boolean(csStateClean && (csStateClean === stateCleanName || csStateClean.includes(stateCleanName) || stateCleanName.includes(csStateClean)));
    const matchInNombre = !cs.estado_id && !cs.estado_nombre && (
      cs.nombre.toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').includes(stateCleanName) ||
      cs.nombre.toUpperCase().includes(state.codigo)
    );
    return Boolean(matchStateId || matchStateName || matchInNombre);
  };

  const matchedFromParam = allCentros.filter(filterFn);
  const matchedFromOfficial = CORPOELEC_CENTROS_SERVICIOS.filter(cs => cs.estado_id?.toLowerCase() === state.id.toLowerCase() || filterFn(cs));

  const combined = [...matchedFromParam, ...matchedFromOfficial];
  const uniqueMap = new Map<string, MasterCatalogItem | CentroServicioItem>();
  for (const cs of combined) {
    const key = cs.nombre.trim().toUpperCase();
    if (!uniqueMap.has(key)) {
      uniqueMap.set(key, cs);
    }
  }

  return Array.from(uniqueMap.values());
}

/**
 * Retorna los Centros de Servicios donde el Estado determina de forma estricta los resultados.
 */
export function getCentrosForStateAndRegion(
  stateNameOrId?: string,
  regionNameOrId?: string,
  allCentros: (MasterCatalogItem | CentroServicioItem)[] = CORPOELEC_CENTROS_SERVICIOS
): (MasterCatalogItem | CentroServicioItem)[] {
  const state = adaptVenezuelanState(stateNameOrId);
  // EL ESTADO DETERMINA ESTRICTAMENTE LOS CENTROS DE SERVICIOS
  if (state) {
    return getCentrosForState(state.nombre, allCentros);
  }

  // Si no hay estado seleccionado pero se especificó una región:
  const region = adaptCorpoelecRegion(regionNameOrId);
  if (region) {
    return allCentros.filter(cs => {
      const matchRegionId = cs.region_id && cs.region_id.toLowerCase() === region.id.toLowerCase();
      const matchRegionName = cs.region_nombre && cs.region_nombre.toUpperCase() === region.nombre.toUpperCase();
      return Boolean(matchRegionId || matchRegionName);
    });
  }

  return [];
}

/**
 * Validador de Integridad Referencial y Jerarquía de Llaves Foráneas
 * Verifica:
 * 1. Región -> Estado (FK: state.region_id === region.id)
 * 2. Estado -> Centro de Servicios (FK: cs.estado_id === state.id)
 * NOTA: Unidad Asignada es un campo operativo completamente libre y desacoplado del Centro de Servicios.
 */
export function validateForeignKeyRelations(
  regionInput?: string,
  stateInput?: string,
  centroServicioInput?: string,
  allCentros: (MasterCatalogItem | CentroServicioItem)[] = CORPOELEC_CENTROS_SERVICIOS
): {
  valid: boolean;
  errors: string[];
  correctedRegion?: string;
  correctedState?: string;
  availableStates: VenezuelanState[];
  availableCentros: (MasterCatalogItem | CentroServicioItem)[];
} {
  const errors: string[] = [];
  const region = adaptCorpoelecRegion(regionInput);
  const state = adaptVenezuelanState(stateInput);

  const availableStates = region ? getStatesForRegion(region.nombre) : [];
  const availableCentros = state ? getCentrosForState(state.nombre, allCentros) : [];

  // 1. Validar relación Región -> Estado
  if (region && state) {
    const belongsToRegion = state.region_id === region.id || state.region === region.nombre;
    if (!belongsToRegion) {
      errors.push(
        `Violación de Llave Foránea: El estado '${state.nombre}' no pertenece a la '${region.nombre}'. ` +
        `Debe pertenecer a '${state.region}' o seleccionar un estado válido para ${region.nombre} ` +
        `(${availableStates.map(s => s.nombre).join(', ')}).`
      );
    }
  }

  // 2. Validar relación Estado -> Centro de Servicios
  if (state && centroServicioInput && centroServicioInput.trim()) {
    const cleanCs = centroServicioInput.trim().toUpperCase();
    const foundCs = allCentros.find(cs => cs.nombre.toUpperCase() === cleanCs) ||
                    CORPOELEC_CENTROS_SERVICIOS.find(cs => cs.nombre.toUpperCase() === cleanCs);

    if (foundCs) {
      const matchState = (foundCs.estado_id && foundCs.estado_id.toLowerCase() === state.id.toLowerCase()) ||
                         (foundCs.estado_nombre && foundCs.estado_nombre.toUpperCase() === state.nombre.toUpperCase());
      if (!matchState) {
        errors.push(
          `Violación de Llave Foránea: El Centro de Servicios '${foundCs.nombre}' pertenece al estado '${foundCs.estado_nombre || foundCs.estado_id}', no corresponde al estado seleccionado '${state.nombre}'.`
        );
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    correctedRegion: state ? state.region : region?.nombre,
    correctedState: state?.nombre,
    availableStates,
    availableCentros
  };
}

/**
 * Adapta y armoniza de manera bidireccional los campos region y estado_venezuela de un vehículo.
 * Asegura que se respete la llave foránea y nunca persista una combinación discordante.
 */
export function adaptVehicleLocation(
  record: Partial<VehicleRecord>,
  allCentros: (MasterCatalogItem | CentroServicioItem)[] = CORPOELEC_CENTROS_SERVICIOS
): {
  region: string;
  estado_venezuela: string;
  codigo_estado: string;
  codigo_region: string;
  centro_servicios?: string;
  esEsequibo: boolean;
} {
  const stateObj = adaptVenezuelanState(record.estado_venezuela);
  const regionObj = adaptCorpoelecRegion(record.region);

  let finalState: VenezuelanState;
  let finalRegion: VenezuelanRegion;

  if (stateObj) {
    // Si el estado es válido, la región viene determinada de forma estricta por su Llave Foránea
    finalState = stateObj;
    finalRegion = VENEZUELA_REGIONS.find(r => r.id === stateObj.region_id || r.nombre === stateObj.region) || 
      VENEZUELA_REGIONS[0];
  } else if (regionObj) {
    finalRegion = regionObj;
    const statesInRegion = VENEZUELA_STATES.filter(s => s.region_id === regionObj.id || s.region === regionObj.nombre);
    finalState = statesInRegion[0] || VENEZUELA_STATES[0];
  } else {
    // Default institucional
    finalState = VENEZUELA_STATES.find(s => s.codigo === 'ESQ') || VENEZUELA_STATES[0];
    finalRegion = VENEZUELA_REGIONS.find(r => r.id === finalState.region_id || r.nombre === finalState.region) || VENEZUELA_REGIONS[0];
  }

  // Ajustar Centro de Servicios si no coincide
  let finalCentro = record.centro_servicios;
  if (finalCentro) {
    const validCentros = getCentrosForStateAndRegion(finalState.nombre, finalRegion.nombre, allCentros);
    const exists = validCentros.some(cs => cs.nombre.toUpperCase() === finalCentro!.toUpperCase());
    if (!exists && validCentros.length > 0) {
      finalCentro = validCentros[0].nombre;
    }
  }

  const esEsequibo = finalState.codigo === 'ESQ' || finalState.nombre === 'Guayana Esequiba';

  return {
    region: finalRegion.nombre,
    estado_venezuela: finalState.nombre,
    codigo_estado: finalState.codigo,
    codigo_region: finalRegion.codigo,
    centro_servicios: finalCentro,
    esEsequibo
  };
}

/**
 * Obtiene el resumen consolidado adaptado de todas las regiones oficiales de CORPOELEC.
 */
export interface CorpoelecRegionSummary {
  region: VenezuelanRegion;
  total: number;
  activos: number;
  enMantenimiento: number;
  fueraServicio: number;
  recuperados: number;
  disponibilidadPct: number;
  estados: {
    estado: VenezuelanState;
    total: number;
    activos: number;
  }[];
}

export function computeCorpoelecRegionalSummary(vehicles: VehicleRecord[]): CorpoelecRegionSummary[] {
  return VENEZUELA_REGIONS.map(region => {
    const statesInRegion = VENEZUELA_STATES.filter(s => s.region_id === region.id || s.region === region.nombre);
    
    // Match vehicles belonging to this region
    const regionVehicles = vehicles.filter(v => {
      const loc = adaptVehicleLocation(v);
      return loc.region === region.nombre;
    });

    const total = regionVehicles.length;
    const activos = regionVehicles.filter(v => v.estado === 'ACTIVO').length;
    const enMantenimiento = regionVehicles.filter(v => v.estado === 'EN MANTENIMIENTO').length;
    const fueraServicio = regionVehicles.filter(v => v.estado === 'FUERA DE SERVICIO').length;
    const recuperados = regionVehicles.filter(v => v.vehiculo_recuperado === 'SI' || v.estado === 'RECUPERADO').length;
    const disponibilidadPct = total > 0 ? Math.round((activos / total) * 100) : 0;

    const estadosBreakdown = statesInRegion.map(st => {
      const stVehicles = regionVehicles.filter(v => {
        const loc = adaptVehicleLocation(v);
        return loc.estado_venezuela === st.nombre;
      });
      return {
        estado: st,
        total: stVehicles.length,
        activos: stVehicles.filter(v => v.estado === 'ACTIVO').length
      };
    });

    return {
      region,
      total,
      activos,
      enMantenimiento,
      fueraServicio,
      recuperados,
      disponibilidadPct,
      estados: estadosBreakdown
    };
  });
}
