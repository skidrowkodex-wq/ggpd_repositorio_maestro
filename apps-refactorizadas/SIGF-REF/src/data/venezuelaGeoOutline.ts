/**
 * Cartografía Vectorial Georreferenciada de la República Bolivariana de Venezuela
 * ---------------------------------------------------------------------------
 * Mapa geopolítico del Cuadro de Mando Gerencial · SEN 2026 (SIGF / Flota Vehicular).
 *
 * Los trazos se proyectan con la MISMA función `projectCoordinates` que usan los
 * nodos de Estados y Centros de Servicios, de modo que el territorio y los
 * puntos de datos quedan perfectamente alineados en el lienzo SVG.
 *
 * Criterio cartográfico: mapa POLÍTICO. El territorio nacional se representa
 * como una unidad uniforme —sin tramas, quiebres ni líneas interiores— conforme
 * a la delimitación soberana oficial de Venezuela, que comprende la GUAYANA
 * ESEQUIBA delimitada al oriente por el río Essequibo. Sobre esa base se rotula
 * la división político-territorial (25 entidades federales) con idéntico
 * tratamiento tipográfico para todas ellas.
 *
 * Cero dependencias externas: no requiere GeoJSON ni librerías de mapeo.
 */
import { projectCoordinates } from './venezuelaCoordinates';

/** Par geográfico [latitud, longitud] en grados decimales. */
export type LatLon = readonly [number, number];

/** Rótulo georreferenciado para la rotulación cartográfica. */
export interface MapLabel {
  lat: number;
  lng: number;
  texto: string;
  /** Rotación en grados (positiva en sentido horario). */
  rot?: number;
}

// ---------------------------------------------------------------------------
// 1. TERRITORIO NACIONAL (perímetro cerrado, sentido horario desde Punta Castilletes)
// ---------------------------------------------------------------------------

/** Litoral caribeño (oeste → este), incluidas las penínsulas de Paraguaná y de Paria. */
const CARIBE: readonly LatLon[] = [
  [11.68, -71.70], // Punta Castilletes (frontera Colombia · Venezuela, sobre la costa)
  [11.35, -71.55],
  [11.05, -71.52],
  [10.92, -71.45], // Estrecho de la Barra (entrada del canal de navegación)
  [10.85, -71.30], // Costa sur del Golfo de Venezuela
  [11.05, -71.02],
  [11.45, -70.72], // Base de la península de Paraguaná
  [12.05, -70.28],
  [12.19, -70.12], // Punta Gallina (extremo norte del país)
  [11.85, -70.11],
  [11.58, -70.42],
  [11.22, -70.04], // Bahía Honda, Falcón
  [11.05, -69.74],
  [10.92, -69.34], // Boca del río Tocuyo
  [10.80, -69.04],
  [10.90, -68.54], // Punta Quíbor
  [10.78, -68.32], // Golfo de Triste
  [10.92, -68.04], // Península de Paria (norte)
  [11.02, -67.58],
  [10.88, -66.86], // Golfo de Cariaco / Araya
  [10.62, -66.28], // Punta María (extremo oriental de la Paria)
  [10.30, -65.94], // Parque Nacional Mochima
  [10.05, -65.14], // Sucre
  [9.95, -64.44],  // Barcelona, Anzoátegui
  [9.65, -63.98],
  [9.35, -63.28],  // Monagas
  [9.10, -62.48],  // Barra del Orinoco
  [8.92, -61.78],  // Delta Amacuro
  [8.98, -61.28],
  [8.75, -60.94],  // Punta Oriental del Delta
  [8.55, -60.52],
  [8.42, -59.98],  // Litoral atlántico
  [8.58, -59.30],
  [8.62, -58.88],  // Boca del río Essequibo (límite oriental de la Zona en Reclamación)
];

/** Río Essequibo: límite oriental del territorio nacional (tramo de frontera). */
const LIMITE_ORIENTAL: readonly LatLon[] = [
  [8.62, -58.88],
  [7.70, -59.02],
  [6.60, -59.32],
  [5.50, -60.08],
  [4.20, -60.60],
  [3.20, -60.75],
  [2.10, -61.00],
  [1.30, -61.22], // Punto tripartito Venezuela · Guyana · Brasil
];

/** Frontera sur con Brasil, de oriente a poniente. */
const FRONTERA_SUR: readonly LatLon[] = [
  [1.30, -63.50],
  [1.50, -65.30],
  [2.60, -66.10],
  [3.70, -67.10],
  [4.10, -67.80], // Río Atabapo (confluencia con Colombia)
];

/** Frontera con Colombia, de sur a norte (Alto Orinoco · Guaviare · Meta · Apure · Perijá · Guajira). */
const FRONTERA_COLOMBIA: readonly LatLon[] = [
  [4.15, -68.60],
  [5.30, -68.90],
  [6.20, -69.70],
  [6.85, -70.30],
  [7.10, -71.10],
  [7.28, -72.45], // Nacimiento de los Andes
  [8.00, -72.95], // Serranía de Perijá
  [8.60, -72.65],
  [9.20, -72.20], // Zulia, frente a Cúcuta
  [10.05, -72.55],
  [10.80, -72.40], // Guajira insular
  [11.30, -72.05],
];

/** Perímetro completo del territorio nacional. */
export const VENEZUELA_MAINLAND: readonly LatLon[] = [
  ...CARIBE,
  ...LIMITE_ORIENTAL,
  ...FRONTERA_SUR,
  ...FRONTERA_COLOMBIA,
];

// ---------------------------------------------------------------------------
// 2. ROTULACIÓN POLÍTICO-TERRITORIAL (MAPA GEOPOLÍTICO)
// ---------------------------------------------------------------------------

/** Anclaje del rótulo político de una entidad federal respecto de su nodo. */
export interface EntityLabelAnchor {
  /** Desplazamiento horizontal en píxeles del lienzo SVG. */
  dx: number;
  /** Desplazamiento vertical en píxeles del lienzo SVG. */
  dy: number;
  /** Alineación horizontal del texto. */
  anchor?: 'start' | 'middle' | 'end';
  /** Traza una línea guía desde el nodo hasta el rótulo (rotulación descolgada). */
  leader?: boolean;
}

/**
 * Posición de los rótulos de las 25 entidades federales.
 * Los desplazamientos se ajustan para despejar los solapamientos de las
 * regiones Capital, Centro-Norte y Nororiental, las de mayor densidad.
 */
export const ENTITY_LABEL_ANCHORS: Record<string, EntityLabelAnchor> = {
  CCS: { dx: -14, dy: -44, anchor: 'middle', leader: true },
  LAG: { dx: -58, dy: -66, anchor: 'end', leader: true },
  MIR: { dx: 48, dy: 8, anchor: 'start', leader: true },
  DEP: { dx: 0, dy: -30, anchor: 'middle' },
  CAR: { dx: -34, dy: -32, anchor: 'end', leader: true },
  ARA: { dx: 34, dy: 28, anchor: 'start', leader: true },
  YAR: { dx: -36, dy: -16, anchor: 'end', leader: true },
  LAR: { dx: -40, dy: 2, anchor: 'end', leader: true },
  COJ: { dx: 38, dy: 18, anchor: 'start', leader: true },
  POR: { dx: -36, dy: 30, anchor: 'end', leader: true },
  TRU: { dx: -42, dy: -6, anchor: 'end', leader: true },
  MER: { dx: 0, dy: 32, anchor: 'middle' },
  TAC: { dx: -6, dy: 30, anchor: 'middle' },
  BAR: { dx: 0, dy: 34, anchor: 'middle' },
  APU: { dx: 0, dy: 32, anchor: 'middle' },
  GUA: { dx: 0, dy: 32, anchor: 'middle' },
  ZUL: { dx: 0, dy: 40, anchor: 'middle' },
  FAL: { dx: -34, dy: -24, anchor: 'end', leader: true },
  ANZ: { dx: 8, dy: 32, anchor: 'middle' },
  MON: { dx: 32, dy: -16, anchor: 'start', leader: true },
  SUC: { dx: 0, dy: -32, anchor: 'middle' },
  NVE: { dx: 40, dy: -6, anchor: 'start', leader: true },
  AMZ: { dx: 0, dy: 32, anchor: 'middle' },
  BOL: { dx: 0, dy: 34, anchor: 'middle' },
  DEL: { dx: 10, dy: 30, anchor: 'middle' },
  ESQ: { dx: -30, dy: 36, anchor: 'middle' },
};

// ---------------------------------------------------------------------------
// 3. HIDROGRAFÍA Y CUERPOS DE AGUA
// ---------------------------------------------------------------------------

/** Lago de Maracaibo y su estrecho de navegación. */
export const LAGO_MARACAIBO: readonly LatLon[] = [
  [10.92, -71.42], // Boca del estrecho (conecta con el Golfo)
  [10.60, -71.62],
  [10.05, -71.66],
  [9.55, -71.38],
  [9.15, -71.20],
  [8.90, -71.38], // Sur del lago
  [9.08, -71.58],
  [9.75, -71.74],
  [10.35, -71.80],
  [10.85, -71.70],
];

/** Eje del río Orinoco: columna vertebral hidroeléctrica del SEN. */
export const ORINOCO_RIVER: readonly LatLon[] = [
  [8.35, -61.90],
  [8.15, -62.60],
  [7.85, -63.35],
  [7.60, -63.90],
  [7.30, -64.35],
  [6.95, -64.75],
  [6.65, -65.30],
  [6.35, -65.85],
  [6.10, -66.40],
  [5.85, -66.90],
  [5.65, -67.40],
  [5.55, -67.80], // Atures / Guri (región Guayana)
];

/** Desembocadura y delta del Orinoco sobre el Océano Atlántico. */
export const ORINOCO_DELTA: readonly LatLon[] = [
  [8.92, -61.78],
  [9.08, -61.10],
  [8.90, -60.55],
  [8.55, -60.52],
  [8.42, -59.98],
  [8.28, -60.35],
  [8.38, -61.05],
  [8.62, -61.55],
];

// ---------------------------------------------------------------------------
// 4. ROTULACIÓN CARTOGRÁFICA
// ---------------------------------------------------------------------------

/** Masas de agua. */
export const AGUA_LABELS: readonly MapLabel[] = [
  { lat: 12.50, lng: -70.80, texto: 'MAR CARIBE' },
  { lat: 9.35, lng: -59.60, texto: 'OCÉANO ATLÁNTICO' },
  { lat: 10.62, lng: -71.24, texto: 'GOLFO' },
];

/** Ríos y lagos. */
export const RIO_LABELS: readonly MapLabel[] = [
  { lat: 7.05, lng: -64.30, texto: 'Río Orinoco', rot: -28 },
  { lat: 9.72, lng: -71.30, texto: 'Maracaibo', rot: -78 },
];

/** Países vecinos (entorno de referencia). */
export const VECINOS: readonly MapLabel[] = [
  { lat: 9.90, lng: -73.35, texto: 'R. DE COLOMBIA' },
  { lat: 2.60, lng: -63.60, texto: 'BRASIL' },
  { lat: 4.75, lng: -58.80, texto: 'REPUBLICA COOPERATIVA' },
  { lat: 3.70, lng: -58.80, texto: 'DE GUYANA' },
];

/** Rótulos interiores de soberanía (marca de agua cartográfica). */
export const SOBERANIA_LABELS: readonly MapLabel[] = [
  { lat: 7.55, lng: -67.20, texto: 'VENEZUELA' },
  { lat: 4.55, lng: -63.30, texto: 'GUAYANA' },
  { lat: 3.55, lng: -63.30, texto: 'BOLIVARIANA' },
];

// ---------------------------------------------------------------------------
// 5. RETÍCULA GEOGRÁFICA (GRATICULE)
// ---------------------------------------------------------------------------

/** Longitudes (meridianos) cada 2°, dentro de los límites proyectados. */
export const MERIDIANOS: readonly number[] = [-72, -70, -68, -66, -64, -62, -60];

/** Latitudes (paralelos) cada 2°, dentro de los límites proyectados. */
export const PARALELOS: readonly number[] = [2, 4, 6, 8, 10, 12];

/** Kilómetros correspondientes a `grados` de longitud a la latitud media del país (~7°N). */
export function kmPorGradoLng(grados = 1, latMedia = 7.0): number {
  return grados * 111.32 * Math.cos((latMedia * Math.PI) / 180);
}

// ---------------------------------------------------------------------------
// 6. PROYECCIÓN A SVG
// ---------------------------------------------------------------------------

/**
 * Convierte una secuencia de coordenadas en un trazado SVG poligonal (`M … L …`).
 */
export function toSvgPath(
  coords: readonly LatLon[],
  width: number,
  height: number,
  close = true
): string {
  if (coords.length === 0) return '';
  const d = coords
    .map(([lat, lng], i) => {
      const p = projectCoordinates(lat, lng, width, height);
      return `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)},${p.y.toFixed(1)}`;
    })
    .join(' ');
  return close ? `${d} Z` : d;
}

/**
 * Convierte coordenadas en un trazado SVG suavizado mediante splines
 * Catmull-Rom convertidos a curvas cúbicas Bézier. Produce siluetas
 * orgánicas y continuas, idóneas para costas y cauces fluviales.
 *
 * @param closed  Cierra el trazado uniendo el último punto con el primero.
 * @param tension 0 = muy quebrado · 1 = muy suave (por defecto 0.85).
 */
export function toSmoothSvgPath(
  coords: readonly LatLon[],
  width: number,
  height: number,
  closed = true,
  tension = 0.85
): string {
  if (coords.length < 2) return toSvgPath(coords, width, height, closed);

  const pts = coords.map(c => projectCoordinates(c[0], c[1], width, height));
  const n = pts.length;
  const at = (i: number) => {
    if (closed) return pts[(i + n) % n];
    return pts[Math.max(0, Math.min(n - 1, i))];
  };
  const k = tension / 6;

  let d = `M ${pts[0].x.toFixed(1)},${pts[0].y.toFixed(1)}`;
  const last = closed ? n : n - 1;

  for (let i = 0; i < last; i++) {
    const p0 = at(i - 1);
    const p1 = at(i);
    const p2 = at(i + 1);
    const p3 = at(i + 2);

    const c1x = p1.x + (p2.x - p0.x) * k;
    const c1y = p1.y + (p2.y - p0.y) * k;
    const c2x = p2.x - (p3.x - p1.x) * k;
    const c2y = p2.y - (p3.y - p1.y) * k;

    d += ` C ${c1x.toFixed(1)},${c1y.toFixed(1)} ${c2x.toFixed(1)},${c2y.toFixed(1)} ${p2.x.toFixed(1)},${p2.y.toFixed(1)}`;
  }

  return closed ? `${d} Z` : d;
}

/** Posición SVG de un rótulo georreferenciado. */
export function labelAt(l: MapLabel, width: number, height: number) {
  const p = projectCoordinates(l.lat, l.lng, width, height);
  return { x: p.x, y: p.y, texto: l.texto, rot: l.rot ?? 0 };
}
