/**
 * Coordenadas Geográficas Oficiales de Estados y Centros de Servicios CORPOELEC
 * Referencia espacial para el Cuadro de Mando Gerencial (Venezuela & Guayana Esequiba)
 */

export interface GeoLocation {
  lat: number;
  lng: number;
}

export interface StateCoordinateData extends GeoLocation {
  nombre: string;
  codigo: string;
  capital: string;
  region: string;
}

export interface CentroServicioCoordinateData extends GeoLocation {
  codigo: string;
  nombre: string;
  estado: string;
  region: string;
}

/**
 * Coordenadas de los 24 Estados de la República Bolivariana de Venezuela
 */
export const STATE_COORDINATES: Record<string, StateCoordinateData> = {
  'Distrito Capital': { lat: 10.5000, lng: -66.9167, nombre: 'Distrito Capital', codigo: 'CCS', capital: 'Caracas', region: 'CAPITAL' },
  'Miranda': { lat: 10.2500, lng: -66.6000, nombre: 'Miranda', codigo: 'MIR', capital: 'Los Teques', region: 'CAPITAL' },
  'La Guaira': { lat: 10.6000, lng: -66.9333, nombre: 'La Guaira', codigo: 'LAG', capital: 'La Guaira', region: 'CAPITAL' },
  'Carabobo': { lat: 10.1800, lng: -68.0000, nombre: 'Carabobo', codigo: 'CAR', capital: 'Valencia', region: 'CENTRAL' },
  'Aragua': { lat: 10.0500, lng: -67.3500, nombre: 'Aragua', codigo: 'ARA', capital: 'Maracay', region: 'CENTRAL' },
  'Yaracuy': { lat: 10.3400, lng: -68.7400, nombre: 'Yaracuy', codigo: 'YAR', capital: 'San Felipe', region: 'CENTRAL' },
  'Apure': { lat: 7.3000, lng: -68.5000, nombre: 'Apure', codigo: 'APU', capital: 'San Fernando de Apure', region: 'LOS LLANOS' },
  'Barinas': { lat: 8.3500, lng: -70.2000, nombre: 'Barinas', codigo: 'BAR', capital: 'Barinas', region: 'LOS LLANOS' },
  'Cojedes': { lat: 9.6600, lng: -68.5800, nombre: 'Cojedes', codigo: 'COJ', capital: 'San Carlos', region: 'LOS LLANOS' },
  'Guárico': { lat: 8.8500, lng: -66.5000, nombre: 'Guárico', codigo: 'GUA', capital: 'San Juan de los Morros', region: 'LOS LLANOS' },
  'Portuguesa': { lat: 9.2000, lng: -69.2500, nombre: 'Portuguesa', codigo: 'POR', capital: 'Guanare', region: 'LOS LLANOS' },
  'Falcón': { lat: 11.2000, lng: -69.8000, nombre: 'Falcón', codigo: 'FAL', capital: 'Coro', region: 'OCCIDENTE' },
  'Lara': { lat: 10.0700, lng: -69.6000, nombre: 'Lara', codigo: 'LAR', capital: 'Barquisimeto', region: 'OCCIDENTE' },
  'Zulia': { lat: 10.2000, lng: -71.8500, nombre: 'Zulia', codigo: 'ZUL', capital: 'Maracaibo', region: 'OCCIDENTE' },
  'Mérida': { lat: 8.6000, lng: -71.1500, nombre: 'Mérida', codigo: 'MER', capital: 'Mérida', region: 'LOS ANDES' },
  'Táchira': { lat: 7.7700, lng: -72.2300, nombre: 'Táchira', codigo: 'TAC', capital: 'San Cristóbal', region: 'LOS ANDES' },
  'Trujillo': { lat: 9.3700, lng: -70.4300, nombre: 'Trujillo', codigo: 'TRU', capital: 'Trujillo', region: 'LOS ANDES' },
  'Anzoátegui': { lat: 9.0000, lng: -64.4000, nombre: 'Anzoátegui', codigo: 'ANZ', capital: 'Barcelona', region: 'ORIENTE' },
  'Monagas': { lat: 9.6000, lng: -63.2000, nombre: 'Monagas', codigo: 'MON', capital: 'Maturín', region: 'ORIENTE' },
  'Sucre': { lat: 10.4500, lng: -63.5000, nombre: 'Sucre', codigo: 'SUC', capital: 'Cumaná', region: 'ORIENTE' },
  'Nueva Esparta': { lat: 10.9800, lng: -63.8600, nombre: 'Nueva Esparta', codigo: 'NVE', capital: 'La Asunción', region: 'INSULAR' },
  'Dependencias Federales': { lat: 11.8500, lng: -66.7500, nombre: 'Dependencias Federales', codigo: 'DEP', capital: 'Gran Roque', region: 'INSULAR' },
  'Amazonas': { lat: 3.2000, lng: -66.0000, nombre: 'Amazonas', codigo: 'AMZ', capital: 'Puerto Ayacucho', region: 'GUAYANA' },
  'Bolívar': { lat: 6.8000, lng: -63.2000, nombre: 'Bolívar', codigo: 'BOL', capital: 'Ciudad Bolívar', region: 'GUAYANA' },
  'Delta Amacuro': { lat: 8.8000, lng: -61.5000, nombre: 'Delta Amacuro', codigo: 'DEL', capital: 'Tucupita', region: 'GUAYANA' },
  'Guayana Esequiba': { lat: 6.8000, lng: -59.5000, nombre: 'Estado Guayana Esequiba', codigo: 'ESQ', capital: 'Tumeremo (Adm)', region: 'GUAYANA' },
  'Estado Guayana Esequiba': { lat: 6.8000, lng: -59.5000, nombre: 'Estado Guayana Esequiba', codigo: 'ESQ', capital: 'Tumeremo (Adm)', region: 'GUAYANA' }
};

/**
 * Coordenadas de los 101 Centros de Servicios (CS) de CORPOELEC
 */
export const CS_COORDINATES: Record<string, GeoLocation> = {
  'CS-AMZ-01': { lat: 5.6608, lng: -67.6256 }, // AMAZONAS - Pto Ayacucho
  'CS-ANZ-01': { lat: 9.4333, lng: -64.4667 }, // ANACO
  'CS-ANZ-02': { lat: 8.8875, lng: -64.2454 }, // EL TIGRE
  'CS-ANZ-03': { lat: 10.2167, lng: -64.6333 }, // METROPOLITANO Pto La Cruz
  'CS-ANZ-04': { lat: 8.8472, lng: -64.7083 }, // PARIAGUAN
  'CS-ANZ-05': { lat: 10.0667, lng: -65.0333 }, // PIRITU
  'CS-APU-01': { lat: 7.8939, lng: -67.4724 }, // SAN FERNANDO
  'CS-APU-02': { lat: 7.8167, lng: -68.2333 }, // ACHAGUAS
  'CS-APU-03': { lat: 7.2417, lng: -70.7328 }, // GUASDUALITO
  'CS-ARA-01': { lat: 10.1833, lng: -67.6000 }, // LIBERTADOR Palo Negro
  'CS-ARA-02': { lat: 10.2469, lng: -67.5958 }, // ATANASIO GIRARDOT Maracay
  'CS-ARA-03': { lat: 10.1861, lng: -67.4583 }, // JOSÉ ANTONIO SUCRE Cagua
  'CS-ARA-04': { lat: 10.2250, lng: -67.3333 }, // JOSÉ FÉLIX RIVAS La Victoria
  'CS-ARA-05': { lat: 9.8333, lng: -66.9083 }, // RAFAEL URDANETA Camatagua
  'CS-ARA-06': { lat: 10.4208, lng: -67.2833 }, // COLONIA TOVAR
  'CS-BAR-01': { lat: 8.6226, lng: -70.2075 }, // BARINAS
  'CS-BAR-02': { lat: 8.2417, lng: -70.7833 }, // SOCOPO
  'CS-BAR-03': { lat: 8.5278, lng: -69.9444 }, // SABANETA
  'CS-BOL-01': { lat: 8.3077, lng: -62.7125 }, // SIMÓN BOLÍVAR Pto Ordaz
  'CS-BOL-02': { lat: 8.1292, lng: -63.5408 }, // SIMÓN RODRÍGUEZ Cd Bolívar
  'CS-BOL-03': { lat: 8.0167, lng: -62.4000 }, // MANUEL PIAR Upata
  'CS-BOL-04': { lat: 7.7667, lng: -63.5333 }, // FRANCISCO DE MIRANDA
  'CS-BOL-05': { lat: 6.8333, lng: -66.1667 }, // EZEQUIEL ZAMORA
  'CS-CCS-01': { lat: 10.4833, lng: -66.9667 }, // LA YAGUARA
  'CS-CCS-02': { lat: 10.5056, lng: -66.8972 }, // SANTA ROSA
  'CS-CCS-03': { lat: 10.4917, lng: -66.8528 }, // CHACAO
  'CS-CAR-01': { lat: 10.1722, lng: -68.2583 }, // BEJUMA
  'CS-CAR-02': { lat: 10.0833, lng: -67.7833 }, // CARLOS ARVELO Güigüe
  'CS-CAR-03': { lat: 10.2333, lng: -67.8833 }, // GUACARA
  'CS-CAR-04': { lat: 10.1500, lng: -68.0667 }, // LIBERTADOR Tocuyito
  'CS-CAR-05': { lat: 10.2583, lng: -68.0167 }, // NAGUANAGUA
  'CS-CAR-06': { lat: 10.4667, lng: -68.0167 }, // PUERTO CABELLO
  'CS-CAR-07': { lat: 10.2500, lng: -67.9500 }, // SAN DIEGO
  'CS-CAR-08': { lat: 10.1667, lng: -68.0000 }, // VALENCIA
  'CS-COJ-01': { lat: 9.6611, lng: -68.5828 }, // SAN CARLOS
  'CS-COJ-02': { lat: 9.7000, lng: -68.4333 }, // TINACO
  'CS-COJ-03': { lat: 9.9167, lng: -68.3000 }, // TINAQUILLO
  'CS-DEL-01': { lat: 9.0583, lng: -62.0500 }, // TUCUPITA
  'CS-FAL-01': { lat: 10.8000, lng: -69.6500 }, // CHURUGUARA
  'CS-FAL-02': { lat: 11.4083, lng: -69.6778 }, // CORO
  'CS-FAL-03': { lat: 11.0250, lng: -70.6861 }, // DABAJURO
  'CS-FAL-04': { lat: 11.1667, lng: -68.7333 }, // MIRIMIRE
  'CS-FAL-05': { lat: 11.7000, lng: -70.1833 }, // PUNTO FIJO
  'CS-FAL-06': { lat: 10.7917, lng: -68.3250 }, // TUCACAS
  'CS-GUA-01': { lat: 9.8639, lng: -66.3806 }, // ALTAGRACIA DE ORITUCO
  'CS-GUA-02': { lat: 8.9242, lng: -67.4278 }, // CALABOZO
  'CS-GUA-03': { lat: 9.2139, lng: -66.0111 }, // LA PASCUA
  'CS-GUA-04': { lat: 9.9111, lng: -67.3556 }, // SAN JUAN DE LOS MORROS
  'CS-GUA-05': { lat: 9.3500, lng: -65.3167 }, // ZARAZA
  'CS-LAG-01': { lat: 10.6000, lng: -66.9333 }, // GUANAPE La Guaira
  'CS-LAR-01': { lat: 10.0678, lng: -69.3478 }, // BARQUISIMETO
  'CS-LAR-02': { lat: 10.0333, lng: -69.2667 }, // CABUDARE
  'CS-LAR-03': { lat: 10.1750, lng: -70.0806 }, // CARORA
  'CS-LAR-04': { lat: 10.3000, lng: -69.1667 }, // DUACA
  'CS-LAR-05': { lat: 9.9278, lng: -69.6222 }, // QUÍBOR
  'CS-MER-01': { lat: 8.5983, lng: -71.1450 }, // METROPOLITANO Mérida
  'CS-MER-02': { lat: 8.6250, lng: -71.6500 }, // PANAMERICANO El Vigía
  'CS-MER-03': { lat: 8.3333, lng: -71.7500 }, // MOCOTIES Tovar
  'CS-MER-04': { lat: 8.7500, lng: -70.9167 }, // PARAMO Mucuchíes
  'CS-MIR-01': { lat: 10.3444, lng: -67.0417 }, // ALTOS MIRANDINOS Los Teques
  'CS-MIR-02': { lat: 10.3000, lng: -65.9833 }, // BARLOVENTO Río Chico
  'CS-MIR-03': { lat: 10.2444, lng: -66.8611 }, // CHARALLAVE
  'CS-MIR-04': { lat: 10.4667, lng: -66.6167 }, // GUARENAS GUATIRE
  'CS-MIR-05': { lat: 10.4833, lng: -66.1000 }, // HIGUEROTE
  'CS-MIR-06': { lat: 10.2167, lng: -66.6667 }, // SANTA TERESA
  'CS-MON-01': { lat: 9.0167, lng: -62.7500 }, // LIBERTADOR Temblador
  'CS-MON-02': { lat: 9.7469, lng: -63.1831 }, // MATURIN
  'CS-MON-03': { lat: 9.6889, lng: -63.6278 }, // PUNTA DE MATA
  'CS-NVE-01': { lat: 11.0833, lng: -63.9667 }, // JUAN GRIEGO
  'CS-NVE-02': { lat: 10.9986, lng: -63.8056 }, // PAMPATAR
  'CS-POR-01': { lat: 9.5544, lng: -69.2008 }, // ACARIGUA
  'CS-POR-02': { lat: 9.3667, lng: -70.0000 }, // BISCUCUY
  'CS-POR-03': { lat: 9.0439, lng: -69.7422 }, // GUANARE
  'CS-POR-04': { lat: 9.3333, lng: -69.1167 }, // TUREN
  'CS-SUC-01': { lat: 10.4972, lng: -63.5472 }, // CARIACO
  'CS-SUC-02': { lat: 10.6667, lng: -63.2500 }, // CARUPANO
  'CS-SUC-03': { lat: 10.4536, lng: -64.1825 }, // CUMANA
  'CS-TAC-01': { lat: 8.2167, lng: -72.2500 }, // LA FRIA
  'CS-TAC-02': { lat: 7.5333, lng: -71.9000 }, // LA PEDRERA El Piñal
  'CS-TAC-03': { lat: 7.9444, lng: -72.2417 }, // MICHELENA
  'CS-TAC-04': { lat: 7.8139, lng: -72.4444 }, // SAN ANTONIO DEL TÁCHIRA
  'CS-TAC-05': { lat: 7.7669, lng: -72.2250 }, // SAN CRISTOBAL
  'CS-TRU-01': { lat: 9.2500, lng: -70.2667 }, // BOCONO
  'CS-TRU-02': { lat: 9.1500, lng: -71.0833 }, // CAJA SECA
  'CS-TRU-03': { lat: 9.4444, lng: -70.7639 }, // SABANA DE MENDOZA
  'CS-TRU-04': { lat: 9.3708, lng: -70.4347 }, // TRUJILLO
  'CS-TRU-05': { lat: 9.3175, lng: -70.6033 }, // VALERA
  'CS-YAR-01': { lat: 10.3394, lng: -68.7425 }, // SAN FELIPE
  'CS-YAR-02': { lat: 10.0778, lng: -69.1250 }, // YARITAGUA
  'CS-YAR-03': { lat: 10.4333, lng: -68.8917 }, // AROA
  'CS-ZUL-01': { lat: 10.6550, lng: -71.6375 }, // MARACAIBO
  'CS-ZUL-02': { lat: 10.5833, lng: -71.6500 }, // SAN FRANCISCO
  'CS-ZUL-03': { lat: 10.3958, lng: -71.4500 }, // CABIMAS
  'CS-ZUL-04': { lat: 10.1333, lng: -71.2667 }, // LAGUNILLAS Ciudad Ojeda
  'CS-ZUL-05': { lat: 9.8167, lng: -70.9167 }, // BARALT Mene Grande
  'CS-ZUL-06': { lat: 10.5833, lng: -71.9667 }, // LA CONCEPCIÓN
  'CS-ZUL-07': { lat: 8.9667, lng: -71.9333 }, // STA BÁRBARA DEL ZULIA
  'CS-ZUL-08': { lat: 10.9722, lng: -71.7389 }, // GUAJIRA El Moján
  'CS-ZUL-09': { lat: 10.3250, lng: -72.2944 }, // ROSARIO DE PERIJÁ
  'CS-ZUL-10': { lat: 10.0639, lng: -72.5519 }, // MACHIQUES
  'CS-ZUL-11': { lat: 10.7000, lng: -71.5167 }  // LOS PUERTOS DE ALTAGRACIA
};

/**
 * Bounding box espacial para Venezuela (incluyendo Guayana Esequiba y Dependencias)
 */
export const VENEZUELA_BOUNDS = {
  minLng: -73.6,
  maxLng: -58.2,
  minLat: 0.6,
  maxLat: 12.8
};

/**
 * Proyecta coordenadas geográficas (lat, lng) a coordenadas de visualización SVG [0..width, 0..height]
 */
export function projectCoordinates(
  lat: number,
  lng: number,
  width: number,
  height: number
): { x: number; y: number } {
  const { minLng, maxLng, minLat, maxLat } = VENEZUELA_BOUNDS;
  
  // Padding para que los nodos no toquen los bordes extremos del canvas
  const paddingX = width * 0.05;
  const paddingY = height * 0.06;
  const innerW = width - (paddingX * 2);
  const innerH = height - (paddingY * 2);

  const normX = (lng - minLng) / (maxLng - minLng);
  const normY = (maxLat - lat) / (maxLat - minLat);

  return {
    x: paddingX + (normX * innerW),
    y: paddingY + (normY * innerH)
  };
}
