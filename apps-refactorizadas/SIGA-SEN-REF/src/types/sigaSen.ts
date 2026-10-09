// ==============================================================================
// ⚡ CORPOELEC - SIGA-SEN v1.0: Tipos y Modelos de Activos del SEN
// Topología Oficial Centro Nacional de Despacho (CND - Mayo 2025)
// ==============================================================================

export type TipoNodoSEN = 
  | 'CENTRAL_GENERACION' 
  | 'SUBESTACION_TRANSMISION' 
  | 'INTERCONEXION_INTERNACIONAL' 
  | 'CLIENTE_INDUSTRIAL';

export type CuadranteMural =
  | 'Guayana / Sur'
  | 'Región Central / Capital'
  | 'Oriente'
  | 'Occidente / Zulia'
  | 'Suroeste / Andes'
  | 'Centro-Occidente'
  | 'Llanos Centrales / Apure';

export interface UnidadGeneracionSEN {
  id: number;
  raw: string;
  tag: string;
  qty: number;
  unit_mw: number;
  total_mw: number;
  fuente: string;
  cx: number;
  cy: number;
}

export interface BarraPatioSEN {
  id: number;
  codigo_tension: string;
  tension_kv: number;
  color_hex: string;
  grosor: number;
  orientacion: string;
  longitud: number;
  x0: number;
  y0: number;
  x1: number;
  y1: number;
  cx: number;
  cy: number;
}

export interface TransformadorPotenciaSEN {
  id: number;
  raw: string;
  qty: number;
  unit_mva: number;
  total_mva: number;
  cx: number;
  cy: number;
}

export interface CompensacionReactivaSEN {
  id: number;
  raw: string;
  tipo: string;
  qty: number;
  unit_mvar: number;
  total_mvar: number;
  cx: number;
  cy: number;
}

export interface SubestacionSigaSen {
  id: number;
  codigo: string;
  nombre_cnd: string;
  nombre_norm: string;
  clasificacion: TipoNodoSEN;
  cuadrante: string;
  coord_x: number;
  coord_y: number;
  bbox: [number, number, number, number];
  tension_max_kv: number | null;
  tension_min_kv: number | null;
  tensiones_lista: string;
  total_barras: number;
  total_transformadores: number;
  total_generadores: number;
  total_reactivos: number;
  capacidad_mva: number;
  capacidad_mw: number;
  capacidad_mvar: number;
  barras: BarraPatioSEN[];
  transformadores: TransformadorPotenciaSEN[];
  generacion: UnidadGeneracionSEN[];
  reactivos: CompensacionReactivaSEN[];
}

export interface LineaTransmisionSEN {
  kv_code: string;
  kv: number;
  color: string;
  grosor: number;
  x0: number;
  y0: number;
  x1: number;
  y1: number;
  len: number;
  origen: string | null;
  destino: string | null;
}

export interface SigaSenSeedData {
  metadata: {
    sistema: string;
    titulo: string;
    fuente_oficial: string;
    certificacion: string;
    dimensiones_mural: [number, number];
  };
  estadisticas: {
    total_nodos: number;
    centrales_generacion: number;
    subestaciones_transmision: number;
    potencia_instalada_mw: number;
    capacidad_transformacion_mva: number;
    compensacion_reactiva_mvar: number;
    total_barras: number;
    total_lineas: number;
  };
  niveles_tension: Array<{
    codigo_tension: string;
    tension_kv: number;
    nombre_sistema: string;
    color_hex: string;
    grosor_nominal_pt: number;
    descripcion: string;
  }>;
  clientes_industriales: Array<{
    id: number;
    sigla: string;
    nombre_completo: string;
    sector_categoria: string;
  }>;
  subestaciones: SubestacionSigaSen[];
  lineas: LineaTransmisionSEN[];
}
