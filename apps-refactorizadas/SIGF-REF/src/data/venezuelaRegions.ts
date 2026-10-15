import { CentroServicioItem } from '../types/fleet';

export interface VenezuelanState {
  id: string; // Primary Key: 'bol', 'mir', 'cap', 'esq', etc.
  nombre: string;
  codigo: string; // 3-letter uppercase identifier for vehicle correlativo
  capital?: string;
  region_id: string; // Foreign Key -> VenezuelanRegion.id
  region: string; // Canonical region name
}

export interface VenezuelanRegion {
  id: string; // Primary Key: 'reg-capital', 'reg-central', etc.
  nombre: string;
  codigo: string; // 3-letter code: 'CAP', 'CEN', etc.
  gerencia?: string;
  sedePrincipal?: string;
  estados: string[]; // State names
  descripcion?: string;
}

/**
  * Tabla Única Oficial de 8 Regiones CORPOELEC
  * División Estratégica Territorial del Sistema Eléctrico Nacional (SEN)
  */
export const VENEZUELA_REGIONS: VenezuelanRegion[] = [
  {
    id: 'reg-capital',
    nombre: 'CAPITAL',
    codigo: 'CAP',
    gerencia: 'GERENCIA REGIONAL CAPITAL',
    sedePrincipal: 'Caracas / Subestación El Marqués / Chacao',
    estados: ['Distrito Capital', 'La Guaira', 'Miranda'],
    descripcion: 'Nodo central neurálgico administrativo, sedes corporativas y área metropolitana de Caracas.'
  },
  {
    id: 'reg-central',
    nombre: 'CENTRAL',
    codigo: 'CEN',
    gerencia: 'GERENCIA REGIONAL CENTRAL',
    sedePrincipal: 'Valencia / Subestación La Arenosa',
    estados: ['Aragua', 'Carabobo', 'Yaracuy'],
    descripcion: 'Cinturón industrial y parques de manufactura pesada central.'
  },
  {
    id: 'reg-llanos',
    nombre: 'LOS LLANOS',
    codigo: 'LLA',
    gerencia: 'GERENCIA REGIONAL LOS LLANOS',
    sedePrincipal: 'San Juan de los Morros / Barinas',
    estados: ['Apure', 'Barinas', 'Cojedes', 'Guárico', 'Portuguesa'],
    descripcion: 'Corredores de líneas de transmisión de 765 kV y electrificación rural y agroproductiva.'
  },
  {
    id: 'reg-occidente',
    nombre: 'OCCIDENTE',
    codigo: 'OCC',
    gerencia: 'GERENCIA REGIONAL OCCIDENTE',
    sedePrincipal: 'Maracaibo / Barquisimeto',
    estados: ['Falcón', 'Lara', 'Zulia'],
    descripcion: 'Operaciones petroleras, lacustres, centro-occidentales y subestaciones de transmisión.'
  },
  {
    id: 'reg-andes',
    nombre: 'LOS ANDES',
    codigo: 'AND',
    gerencia: 'GERENCIA REGIONAL LOS ANDES',
    sedePrincipal: 'Mérida / San Cristóbal',
    estados: ['Mérida', 'Táchira', 'Trujillo'],
    descripcion: 'Redes de alta montaña, cordillera andina y subestaciones de frontera.'
  },
  {
    id: 'reg-oriente',
    nombre: 'ORIENTE',
    codigo: 'ORI',
    gerencia: 'GERENCIA REGIONAL ORIENTE',
    sedePrincipal: 'Puerto La Cruz / San Diego',
    estados: ['Anzoátegui', 'Monagas', 'Sucre'],
    descripcion: 'Faja Petrolífera del Orinoco, costa oriental y circuito interconectado insular submarino.'
  },
  {
    id: 'reg-insular',
    nombre: 'INSULAR',
    codigo: 'INS',
    gerencia: 'GERENCIA REGIONAL INSULAR',
    sedePrincipal: 'Porlamar / Isla de Margarita',
    estados: ['Nueva Esparta', 'Dependencias Federales'],
    descripcion: 'Territorio insular caribeño, cable submarino Chacopata-Margarita y dependencias federales.'
  },
  {
    id: 'reg-guayana',
    nombre: 'GUAYANA',
    codigo: 'GUY',
    gerencia: 'GERENCIA REGIONAL GUAYANA',
    sedePrincipal: 'Puerto Ordaz / Complejo Hidroeléctrico Macagua',
    estados: ['Amazonas', 'Bolívar', 'Delta Amacuro', 'Guayana Esequiba'],
    descripcion: 'Pilar hidroeléctrico nacional (Guri, Caruachi, Macagua). Abarca el territorio de la Guayana Esequiba.'
  }
];

/**
  * Tabla Única de Estados / Entidades Federales con Llave Foránea 'region_id'
  * Vinculadas estrictamente a las 8 Regiones CORPOELEC oficiales.
  */
export const VENEZUELA_STATES: VenezuelanState[] = [
  // --- CAPITAL ---
  { id: 'cap', nombre: 'Distrito Capital', codigo: 'CCS', capital: 'Caracas', region_id: 'reg-capital', region: 'CAPITAL' },
  { id: 'mir', nombre: 'Miranda', codigo: 'MIR', capital: 'Los Teques', region_id: 'reg-capital', region: 'CAPITAL' },
  { id: 'lag', nombre: 'La Guaira', codigo: 'LAG', capital: 'La Guaira', region_id: 'reg-capital', region: 'CAPITAL' },

  // --- CENTRAL ---
  { id: 'car', nombre: 'Carabobo', codigo: 'CAR', capital: 'Valencia', region_id: 'reg-central', region: 'CENTRAL' },
  { id: 'ara', nombre: 'Aragua', codigo: 'ARA', capital: 'Maracay', region_id: 'reg-central', region: 'CENTRAL' },
  { id: 'yar', nombre: 'Yaracuy', codigo: 'YAR', capital: 'San Felipe', region_id: 'reg-central', region: 'CENTRAL' },

  // --- LOS LLANOS ---
  { id: 'apu', nombre: 'Apure', codigo: 'APU', capital: 'San Fernando de Apure', region_id: 'reg-llanos', region: 'LOS LLANOS' },
  { id: 'bar', nombre: 'Barinas', codigo: 'BAR', capital: 'Barinas', region_id: 'reg-llanos', region: 'LOS LLANOS' },
  { id: 'coj', nombre: 'Cojedes', codigo: 'COJ', capital: 'San Carlos', region_id: 'reg-llanos', region: 'LOS LLANOS' },
  { id: 'gua', nombre: 'Guárico', codigo: 'GUA', capital: 'San Juan de los Morros', region_id: 'reg-llanos', region: 'LOS LLANOS' },
  { id: 'por', nombre: 'Portuguesa', codigo: 'POR', capital: 'Guanare', region_id: 'reg-llanos', region: 'LOS LLANOS' },

  // --- OCCIDENTE ---
  { id: 'fal', nombre: 'Falcón', codigo: 'FAL', capital: 'Coro', region_id: 'reg-occidente', region: 'OCCIDENTE' },
  { id: 'lar', nombre: 'Lara', codigo: 'LAR', capital: 'Barquisimeto', region_id: 'reg-occidente', region: 'OCCIDENTE' },
  { id: 'zul', nombre: 'Zulia', codigo: 'ZUL', capital: 'Maracaibo', region_id: 'reg-occidente', region: 'OCCIDENTE' },

  // --- LOS ANDES ---
  { id: 'mer', nombre: 'Mérida', codigo: 'MER', capital: 'Mérida', region_id: 'reg-andes', region: 'LOS ANDES' },
  { id: 'tac', nombre: 'Táchira', codigo: 'TAC', capital: 'San Cristóbal', region_id: 'reg-andes', region: 'LOS ANDES' },
  { id: 'tru', nombre: 'Trujillo', codigo: 'TRU', capital: 'Trujillo', region_id: 'reg-andes', region: 'LOS ANDES' },

  // --- ORIENTE ---
  { id: 'anz', nombre: 'Anzoátegui', codigo: 'ANZ', capital: 'Barcelona', region_id: 'reg-oriente', region: 'ORIENTE' },
  { id: 'mon', nombre: 'Monagas', codigo: 'MON', capital: 'Maturín', region_id: 'reg-oriente', region: 'ORIENTE' },
  { id: 'suc', nombre: 'Sucre', codigo: 'SUC', capital: 'Cumaná', region_id: 'reg-oriente', region: 'ORIENTE' },

  // --- INSULAR ---
  { id: 'nve', nombre: 'Nueva Esparta', codigo: 'NVE', capital: 'La Asunción', region_id: 'reg-insular', region: 'INSULAR' },
  { id: 'dep', nombre: 'Dependencias Federales', codigo: 'DEP', capital: 'Gran Roque', region_id: 'reg-insular', region: 'INSULAR' },

  // --- GUAYANA ---
  { id: 'amz', nombre: 'Amazonas', codigo: 'AMZ', capital: 'Puerto Ayacucho', region_id: 'reg-guayana', region: 'GUAYANA' },
  { id: 'bol', nombre: 'Bolívar', codigo: 'BOL', capital: 'Ciudad Bolívar / Pto. Ordaz', region_id: 'reg-guayana', region: 'GUAYANA' },
  { id: 'del', nombre: 'Delta Amacuro', codigo: 'DEL', capital: 'Tucupita', region_id: 'reg-guayana', region: 'GUAYANA' },
  { id: 'esq', nombre: 'Guayana Esequiba', codigo: 'ESQ', capital: 'Tumeremo (Administrativa)', region_id: 'reg-guayana', region: 'GUAYANA' }
];

/**
  * Tabla Única Relacional de Centros de Servicios (CS) CORPOELEC (Exactamente 101 Centros)
  */
export const CORPOELEC_CENTROS_SERVICIOS: CentroServicioItem[] = [
  { id: 'cs-001', codigo: 'CS-AMZ-01', nombre: 'AMAZONAS', estado_id: 'amz', estado_nombre: 'Amazonas', region_id: 'reg-guayana', region_nombre: 'GUAYANA', municipio: 'AV. ROMULO GALLEGOS, PUERTO AYACUCHO', tipo: 'Atención Técnica y Distribución', activo: true },
  { id: 'cs-002', codigo: 'CS-ANZ-01', nombre: 'ANACO', estado_id: 'anz', estado_nombre: 'Anzoátegui', region_id: 'reg-oriente', region_nombre: 'ORIENTE', municipio: 'AV. PRINCIPAL LAS CHARAS, ANACO', tipo: 'Atención Técnica y Distribución', activo: true },
  { id: 'cs-003', codigo: 'CS-ANZ-02', nombre: 'EL TIGRE', estado_id: 'anz', estado_nombre: 'Anzoátegui', region_id: 'reg-oriente', region_nombre: 'ORIENTE', municipio: 'AV. PEÑALVER, EL TIGRE', tipo: 'Atención Técnica y Distribución', activo: true },
  { id: 'cs-004', codigo: 'CS-ANZ-03', nombre: 'METROPOLITANO', estado_id: 'anz', estado_nombre: 'Anzoátegui', region_id: 'reg-oriente', region_nombre: 'ORIENTE', municipio: 'CALLE SIMON RODRIGUEZ ENTRE TRONCAL 9 Y CALLE PROVIDENCIA, PUERTO LA CRUZ', tipo: 'Atención Técnica y Distribución', activo: true },
  { id: 'cs-005', codigo: 'CS-ANZ-04', nombre: 'PARIAGUAN', estado_id: 'anz', estado_nombre: 'Anzoátegui', region_id: 'reg-oriente', region_nombre: 'ORIENTE', municipio: 'CALLE EL COMERCIO, PARIAGUÁN', tipo: 'Atención Técnica y Distribución', activo: true },
  { id: 'cs-006', codigo: 'CS-ANZ-05', nombre: 'PIRITU', estado_id: 'anz', estado_nombre: 'Anzoátegui', region_id: 'reg-oriente', region_nombre: 'ORIENTE', municipio: 'CALLE BOLIVAR, PUERTO PÍRITU', tipo: 'Atención Técnica y Distribución', activo: true },
  { id: 'cs-007', codigo: 'CS-APU-01', nombre: 'SAN FERNANDO', estado_id: 'apu', estado_nombre: 'Apure', region_id: 'reg-llanos', region_nombre: 'LOS LLANOS', municipio: 'CALLE SUCRE ENTRE CALLES SANTA ANA Y COTOPAUL, SAN FERNANDO, ESTADO APURE', tipo: 'Atención Técnica y Distribución', activo: true },
  { id: 'cs-008', codigo: 'CS-APU-02', nombre: 'ACHAGUAS', estado_id: 'apu', estado_nombre: 'Apure', region_id: 'reg-llanos', region_nombre: 'LOS LLANOS', municipio: 'CALLE URDANETA, CRUCE CON CALLE BOYACÁ, ACHAGUAS, ESTADO APURE', tipo: 'Atención Técnica y Distribución', activo: true },
  { id: 'cs-009', codigo: 'CS-APU-03', nombre: 'GUASDUALITO', estado_id: 'apu', estado_nombre: 'Apure', region_id: 'reg-llanos', region_nombre: 'LOS LLANOS', municipio: 'AV. ACUEDUCTO, AL LADO DE LA PLANTA DE HIDROLLANOS, GUASDUALITO, ESTADO APURE', tipo: 'Atención Técnica y Distribución', activo: true },
  { id: 'cs-010', codigo: 'CS-ARA-01', nombre: 'LIBERTADOR', estado_id: 'ara', estado_nombre: 'Aragua', region_id: 'reg-central', region_nombre: 'CENTRAL', municipio: 'CALLE PAEZ ENTRE CALLES NEGRO PRIMERO Y RONDON, PALO NEGRO, EDO. ARAGUA.', tipo: 'Atención Técnica y Distribución', activo: true },
  { id: 'cs-011', codigo: 'CS-ARA-02', nombre: 'ATANASIO GIRARDOT', estado_id: 'ara', estado_nombre: 'Aragua', region_id: 'reg-central', region_nombre: 'CENTRAL', municipio: 'AV. MARIÑO, CRUCE CON AV. CONSTITUCIÓN, LATERAL AL CC. ESTACIÓN PASEO CENTRAL, MARACAY, MUNICIPIO GIRARDOT, EDO. ARAGUA.', tipo: 'Atención Técnica y Distribución', activo: true },
  { id: 'cs-012', codigo: 'CS-ARA-03', nombre: 'JOSÉ ANTONIO SUCRE', estado_id: 'ara', estado_nombre: 'Aragua', region_id: 'reg-central', region_nombre: 'CENTRAL', municipio: 'CALLE FROILÁN CORREA NORTE, NRO. 10, CAGUA, MUNICIPIO SUCRE, EDO. ARAGUA.', tipo: 'Atención Técnica y Distribución', activo: true },
  { id: 'cs-013', codigo: 'CS-ARA-04', nombre: 'JOSÉ FÉLIX RIVAS', estado_id: 'ara', estado_nombre: 'Aragua', region_id: 'reg-central', region_nombre: 'CENTRAL', municipio: 'AV. FRANCISCO DE LORETTO, NRO. 8, LA VICTORIA, MUNICIPIO JOSÉ FÉLIX RIBAS, EDO. ARAGUA.', tipo: 'Atención Técnica y Distribución', activo: true },
  { id: 'cs-014', codigo: 'CS-ARA-05', nombre: 'RAFAEL URDANETA', estado_id: 'ara', estado_nombre: 'Aragua', region_id: 'reg-central', region_nombre: 'CENTRAL', municipio: 'CALLE BOLÍVAR, NRO. 37 - A, CAMATAGUA, MUNICIPIO CAMATAGUA, EDO. ARAGUA.', tipo: 'Atención Técnica y Distribución', activo: true },
  { id: 'cs-015', codigo: 'CS-BAR-01', nombre: 'BARINAS', estado_id: 'bar', estado_nombre: 'Barinas', region_id: 'reg-llanos', region_nombre: 'LOS LLANOS', municipio: 'AV. CUATRICENTENARIA EDIF. SEDE CORPOELEC', tipo: 'Atención Técnica y Distribución', activo: true },
  { id: 'cs-016', codigo: 'CS-BAR-02', nombre: 'SOCOPO', estado_id: 'bar', estado_nombre: 'Barinas', region_id: 'reg-llanos', region_nombre: 'LOS LLANOS', municipio: '(dirección no especificada)', tipo: 'Atención Técnica y Distribución', activo: true },
  { id: 'cs-017', codigo: 'CS-BAR-03', nombre: 'SABANETA', estado_id: 'bar', estado_nombre: 'Barinas', region_id: 'reg-llanos', region_nombre: 'LOS LLANOS', municipio: 'SABANETA MUNICIPIO ALBERTO ARVELO TORREALVA', tipo: 'Atención Técnica y Distribución', activo: true },
  { id: 'cs-018', codigo: 'CS-BOL-01', nombre: 'SIMÓN BOLÍVAR', estado_id: 'bol', estado_nombre: 'Bolívar', region_id: 'reg-guayana', region_nombre: 'GUAYANA', municipio: 'AV. LAS AMERICAS, CALLE POTOSI, AL LADO DE LA CANTV, PUERT ORDAZ', tipo: 'Atención Técnica y Distribución', activo: true },
  { id: 'cs-019', codigo: 'CS-BOL-02', nombre: 'SIMÓN RODRÍGUEZ', estado_id: 'bol', estado_nombre: 'Bolívar', region_id: 'reg-guayana', region_nombre: 'GUAYANA', municipio: 'PASEO ORINOCO CON CALLE MATURIN NRO 10 EDIFICIO CORPOELEC', tipo: 'Atención Técnica y Distribución', activo: true },
  { id: 'cs-020', codigo: 'CS-BOL-03', nombre: 'MANUEL PIAR', estado_id: 'bol', estado_nombre: 'Bolívar', region_id: 'reg-guayana', region_nombre: 'GUAYANA', municipio: 'AV. HUMBOLT FRENTE A LA PLAZA MIRANDA DIAGONAL AL CEMENTERIO', tipo: 'Atención Técnica y Distribución', activo: true },
  { id: 'cs-021', codigo: 'CS-BOL-04', nombre: 'FRANCISCO DE MIRANDA', estado_id: 'bol', estado_nombre: 'Bolívar', region_id: 'reg-guayana', region_nombre: 'GUAYANA', municipio: 'CALLE HERES AL FRENTE DE FARMA EXPRESS', tipo: 'Atención Técnica y Distribución', activo: true },
  { id: 'cs-022', codigo: 'CS-BOL-05', nombre: 'EZEQUIEL ZAMORA', estado_id: 'bol', estado_nombre: 'Bolívar', region_id: 'reg-guayana', region_nombre: 'GUAYANA', municipio: 'BARRIO GUANIAMO CALLE LA PLANTA', tipo: 'Atención Técnica y Distribución', activo: true },
  { id: 'cs-023', codigo: 'CS-CCS-01', nombre: 'LA YAGUARA', estado_id: 'cap', estado_nombre: 'Distrito Capital', region_id: 'reg-capital', region_nombre: 'CAPITAL', municipio: 'AV.GARCIA GONZALEZ DASILVA KILOMETRO 1 DEL JUNQUITO', tipo: 'Atención Técnica y Distribución', activo: true },
  { id: 'cs-024', codigo: 'CS-CCS-02', nombre: 'SANTA ROSA', estado_id: 'cap', estado_nombre: 'Distrito Capital', region_id: 'reg-capital', region_nombre: 'CAPITAL', municipio: 'PARROQUIA EL RECREO CALLE SANTA ROSA URB. SANTA ROSA', tipo: 'Atención Técnica y Distribución', activo: true },
  { id: 'cs-025', codigo: 'CS-CCS-03', nombre: 'CHACAO', estado_id: 'cap', estado_nombre: 'Distrito Capital', region_id: 'reg-capital', region_nombre: 'CAPITAL', municipio: 'URB. CHACAO, FINAL AVENIDA ADRIAN RODRÍGUEZ', tipo: 'Atención Técnica y Distribución', activo: true },
  { id: 'cs-026', codigo: 'CS-ARA-06', nombre: 'COLONIA TOVAR', estado_id: 'ara', estado_nombre: 'Aragua', region_id: 'reg-capital', region_nombre: 'CAPITAL', municipio: 'PRINCIPAL DE PLAN DE MORENO, SECTOR LOS SKI, SUB EST COLONIA TOVAR.', tipo: 'Atención Técnica y Distribución', activo: true },
  { id: 'cs-027', codigo: 'CS-CAR-01', nombre: 'BEJUMA', estado_id: 'car', estado_nombre: 'Carabobo', region_id: 'reg-central', region_nombre: 'CENTRAL', municipio: 'AV RICAURTE ENTRE AV. BOLIVAR C/C CALLE SUCRE, EDF. PALERMO. BEJUMA', tipo: 'Atención Técnica y Distribución', activo: true },
  { id: 'cs-028', codigo: 'CS-CAR-02', nombre: 'CARLOS ARVELO', estado_id: 'car', estado_nombre: 'Carabobo', region_id: 'reg-central', region_nombre: 'CENTRAL', municipio: 'CALLE ARVELO, EDF. ELISMAR NO. 36, GUIGUE', tipo: 'Atención Técnica y Distribución', activo: true },
  { id: 'cs-029', codigo: 'CS-CAR-03', nombre: 'GUACARA', estado_id: 'car', estado_nombre: 'Carabobo', region_id: 'reg-central', region_nombre: 'CENTRAL', municipio: 'CENTRO COMERCIAL GUACARA, LOCALES 43-44', tipo: 'Atención Técnica y Distribución', activo: true },
  { id: 'cs-030', codigo: 'CS-CAR-04', nombre: 'LIBERTADOR', estado_id: 'car', estado_nombre: 'Carabobo', region_id: 'reg-central', region_nombre: 'CENTRAL', municipio: 'CENTRO COMERCIAL FORTUNATA, CALLE SUCRE C/C BOLIVAR, TOCUYITO.', tipo: 'Atención Técnica y Distribución', activo: true },
  { id: 'cs-031', codigo: 'CS-CAR-05', nombre: 'NAGUANAGUA', estado_id: 'car', estado_nombre: 'Carabobo', region_id: 'reg-central', region_nombre: 'CENTRAL', municipio: 'CENTRO COMERCIAL EL DORADO AV BOLIVAR VIEJA Y PROLONGACION EL CEMENTERIO. NAGUANAGUA.', tipo: 'Atención Técnica y Distribución', activo: true },
  { id: 'cs-032', codigo: 'CS-CAR-06', nombre: 'PUERTO CABELLO', estado_id: 'car', estado_nombre: 'Carabobo', region_id: 'reg-central', region_nombre: 'CENTRAL', municipio: 'URB. COLINAS DE VALLE SECO, FINAL AV. BOLÍVAR. PUERTO CABELLO.', tipo: 'Atención Técnica y Distribución', activo: true },
  { id: 'cs-033', codigo: 'CS-CAR-07', nombre: 'SAN DIEGO', estado_id: 'car', estado_nombre: 'Carabobo', region_id: 'reg-central', region_nombre: 'CENTRAL', municipio: 'URB. IND. CASTILLITO, PARALELO A LA A.R.C. AL LADO DEL DISTRIBUIDOR DIVENCA.', tipo: 'Atención Técnica y Distribución', activo: true },
  { id: 'cs-034', codigo: 'CS-CAR-08', nombre: 'VALENCIA', estado_id: 'car', estado_nombre: 'Carabobo', region_id: 'reg-central', region_nombre: 'CENTRAL', municipio: 'AV. MICHELENA ENTRE AV. BRANGER Y AV. LAS FERIAS. VALENCIA.', tipo: 'Atención Técnica y Distribución', activo: true },
  { id: 'cs-035', codigo: 'CS-COJ-01', nombre: 'SAN CARLOS', estado_id: 'coj', estado_nombre: 'Cojedes', region_id: 'reg-llanos', region_nombre: 'LOS LLANOS', municipio: 'CALLE ALEGRIA, ENTRE AV. CARACAS Y AV. ESTADIO', tipo: 'Atención Técnica y Distribución', activo: true },
  { id: 'cs-036', codigo: 'CS-COJ-02', nombre: 'TINACO', estado_id: 'coj', estado_nombre: 'Cojedes', region_id: 'reg-llanos', region_nombre: 'LOS LLANOS', municipio: 'AV, BOLIVAR ENTRE CALLES MAURICIO PEREZ LAZO Y LUIS LORETO LIMA', tipo: 'Atención Técnica y Distribución', activo: true },
  { id: 'cs-037', codigo: 'CS-COJ-03', nombre: 'TINAQUILLO', estado_id: 'coj', estado_nombre: 'Cojedes', region_id: 'reg-llanos', region_nombre: 'LOS LLANOS', municipio: 'AV CARABOBO CC 19 BIS', tipo: 'Atención Técnica y Distribución', activo: true },
  { id: 'cs-038', codigo: 'CS-DEL-01', nombre: 'TUCUPITA', estado_id: 'del', estado_nombre: 'Delta Amacuro', region_id: 'reg-guayana', region_nombre: 'GUAYANA', municipio: 'AV GUASINA GALPON CORPOELEC ESTADO DELTA AMACURO', tipo: 'Atención Técnica y Distribución', activo: true },
  { id: 'cs-039', codigo: 'CS-FAL-01', nombre: 'CHURUGUARA', estado_id: 'fal', estado_nombre: 'Falcón', region_id: 'reg-occidente', region_nombre: 'OCCIDENTE', municipio: 'CALLE BERMUDEZ ESQUINA SAN RAFAEL CHURUGUARA MUNICIPIO FEDERACION', tipo: 'Atención Técnica y Distribución', activo: true },
  { id: 'cs-040', codigo: 'CS-FAL-02', nombre: 'CORO', estado_id: 'fal', estado_nombre: 'Falcón', region_id: 'reg-occidente', region_nombre: 'OCCIDENTE', municipio: 'CALLEJON CADAFE CON AVDA MANAURE SUR VIA LA SIERRA, PROLONGACION MANAURE. CORO', tipo: 'Atención Técnica y Distribución', activo: true },
  { id: 'cs-041', codigo: 'CS-FAL-03', nombre: 'DABAJURO', estado_id: 'fal', estado_nombre: 'Falcón', region_id: 'reg-occidente', region_nombre: 'OCCIDENTE', municipio: 'FINAL AVENIDA AEROPUERTO SECTOR CADAFE', tipo: 'Atención Técnica y Distribución', activo: true },
  { id: 'cs-042', codigo: 'CS-FAL-04', nombre: 'MIRIMIRE', estado_id: 'fal', estado_nombre: 'Falcón', region_id: 'reg-occidente', region_nombre: 'OCCIDENTE', municipio: 'AVDA. PRINCIPAL ENTRADA A MIRIMIRE SECTOR PARAISO', tipo: 'Atención Técnica y Distribución', activo: true },
  { id: 'cs-043', codigo: 'CS-FAL-05', nombre: 'PUNTO FIJO', estado_id: 'fal', estado_nombre: 'Falcón', region_id: 'reg-occidente', region_nombre: 'OCCIDENTE', municipio: 'AV. RAMON RUIZ POLANCO ENTRE CALLES MONAGAS Y URDANETA, SEDE DEL DISTRITO TECNICO PUNTO FIJO', tipo: 'Atención Técnica y Distribución', activo: true },
  { id: 'cs-044', codigo: 'CS-FAL-06', nombre: 'TUCACAS', estado_id: 'fal', estado_nombre: 'Falcón', region_id: 'reg-occidente', region_nombre: 'OCCIDENTE', municipio: 'CARRETERA MORON CORO AL LADO DEL CEMENTERIO', tipo: 'Atención Técnica y Distribución', activo: true },
  { id: 'cs-045', codigo: 'CS-GUA-01', nombre: 'ALTAGRACIA', estado_id: 'gua', estado_nombre: 'Guárico', region_id: 'reg-llanos', region_nombre: 'LOS LLANOS', municipio: 'ALTAGRACIA DE ORITUCO MUNICIPIO JOSÉ TADEO MONAGAS ESTADO GUARICO', tipo: 'Atención Técnica y Distribución', activo: true },
  { id: 'cs-046', codigo: 'CS-GUA-02', nombre: 'CALABOZO', estado_id: 'gua', estado_nombre: 'Guárico', region_id: 'reg-llanos', region_nombre: 'LOS LLANOS', municipio: 'CALABOZO MUNICIPIO FRANCISCO DE MIRANDA ESTADO GUARICO', tipo: 'Atención Técnica y Distribución', activo: true },
  { id: 'cs-047', codigo: 'CS-GUA-03', nombre: 'LA PASCUA', estado_id: 'gua', estado_nombre: 'Guárico', region_id: 'reg-llanos', region_nombre: 'LOS LLANOS', municipio: 'VALLE DE LA PASCUA MUNICIPIO LEONARDO INFANTE ESTADO GUARICO, AV. ROMULO GALLEGOS', tipo: 'Atención Técnica y Distribución', activo: true },
  { id: 'cs-048', codigo: 'CS-GUA-04', nombre: 'SAN JUAN', estado_id: 'gua', estado_nombre: 'Guárico', region_id: 'reg-llanos', region_nombre: 'LOS LLANOS', municipio: 'SAN JUAN DE LOS MORROS MUNICIPIO JUAN GERMAN ROSCIO ESTADO GUARICO', tipo: 'Atención Técnica y Distribución', activo: true },
  { id: 'cs-049', codigo: 'CS-GUA-05', nombre: 'ZARAZA', estado_id: 'gua', estado_nombre: 'Guárico', region_id: 'reg-llanos', region_nombre: 'LOS LLANOS', municipio: 'ZARAZA MUNICIPIO PEDRO ZARAZA', tipo: 'Atención Técnica y Distribución', activo: true },
  { id: 'cs-050', codigo: 'CS-LAG-01', nombre: 'GUANAPE', estado_id: 'lag', estado_nombre: 'La Guaira', region_id: 'reg-capital', region_nombre: 'CAPITAL', municipio: 'AVENIDA CARLOS SOUBLETTE, AL LADO DEL HOSPITAL JOSE MARIA VARGAS (SEGURO SOCIAL), LA GUAIRA.', tipo: 'Atención Técnica y Distribución', activo: true },
  { id: 'cs-051', codigo: 'CS-LAR-01', nombre: 'BARQUISIMETO', estado_id: 'lar', estado_nombre: 'Lara', region_id: 'reg-occidente', region_nombre: 'OCCIDENTE', municipio: 'ZONA INDUSTRIAL I, CARRERA 4 CON CALLE 15', tipo: 'Atención Técnica y Distribución', activo: true },
  { id: 'cs-052', codigo: 'CS-LAR-02', nombre: 'CABUDARE', estado_id: 'lar', estado_nombre: 'Lara', region_id: 'reg-occidente', region_nombre: 'OCCIDENTE', municipio: 'AV LA MATA, EDIFICIO CENTRO DE OPERACIONES PALAVECINO', tipo: 'Atención Técnica y Distribución', activo: true },
  { id: 'cs-053', codigo: 'CS-LAR-03', nombre: 'CARORA', estado_id: 'lar', estado_nombre: 'Lara', region_id: 'reg-occidente', region_nombre: 'OCCIDENTE', municipio: 'AV FRANCISCO DE MIRANDA ENTRE CALLES SAN CARLOS Y CALLEJÓN SAN CARLOS SECTOR LA TOÑONA', tipo: 'Atención Técnica y Distribución', activo: true },
  { id: 'cs-054', codigo: 'CS-LAR-04', nombre: 'DUACA', estado_id: 'lar', estado_nombre: 'Lara', region_id: 'reg-occidente', region_nombre: 'OCCIDENTE', municipio: 'AV. JUAN CANELON SECTOR MOROTURO', tipo: 'Atención Técnica y Distribución', activo: true },
  { id: 'cs-055', codigo: 'CS-LAR-05', nombre: 'QUÍBOR', estado_id: 'lar', estado_nombre: 'Lara', region_id: 'reg-occidente', region_nombre: 'OCCIDENTE', municipio: 'AV. FRANCISCO DE MIRANDA, SECTOR EL CALVARIO', tipo: 'Atención Técnica y Distribución', activo: true },
  { id: 'cs-056', codigo: 'CS-MER-01', nombre: 'METROPOLITANO', estado_id: 'mer', estado_nombre: 'Mérida', region_id: 'reg-andes', region_nombre: 'LOS ANDES', municipio: 'SECTOR SANTA BARBARA NORTE ANTIGUO CLUB DE LA ULA', tipo: 'Atención Técnica y Distribución', activo: true },
  { id: 'cs-057', codigo: 'CS-MER-02', nombre: 'PANAMERICANO', estado_id: 'mer', estado_nombre: 'Mérida', region_id: 'reg-andes', region_nombre: 'LOS ANDES', municipio: 'BARRIO SAN ISIDRO FTE AL MINISTERIO DE AGRICULTURA, EL VIGIA, MUNICIPIO ALBERTO ADRIANI', tipo: 'Atención Técnica y Distribución', activo: true },
  { id: 'cs-058', codigo: 'CS-MER-03', nombre: 'MOCOTIES', estado_id: 'mer', estado_nombre: 'Mérida', region_id: 'reg-andes', region_nombre: 'LOS ANDES', municipio: 'CARRERA 3 FEDERACION FTE A LA PLAZA BOLIVAR, TOVAR, MUNICIPIO TOVAR', tipo: 'Atención Técnica y Distribución', activo: true },
  { id: 'cs-059', codigo: 'CS-MER-04', nombre: 'PARAMO', estado_id: 'mer', estado_nombre: 'Mérida', region_id: 'reg-andes', region_nombre: 'LOS ANDES', municipio: 'AV. PPAL MUCUCHIES, MUNICIPIO RANGEL', tipo: 'Atención Técnica y Distribución', activo: true },
  { id: 'cs-060', codigo: 'CS-MIR-01', nombre: 'ALTOS MIRANDINOS', estado_id: 'mir', estado_nombre: 'Miranda', region_id: 'reg-capital', region_nombre: 'CAPITAL', municipio: 'SECTOR EL BARBECHO CALLE CESAR ZAMORA EDIF CORPOELEC LOS TEQUES ESTADO MIRANDA', tipo: 'Atención Técnica y Distribución', activo: true },
  { id: 'cs-061', codigo: 'CS-MIR-02', nombre: 'BARLOVENTO', estado_id: 'mir', estado_nombre: 'Miranda', region_id: 'reg-capital', region_nombre: 'CAPITAL', municipio: 'MUN. PAEZ RIO CHICO CALLE NUEVA CON CALLE CARABOBO FRENTE AL MERCADO MUNICIPAL', tipo: 'Atención Técnica y Distribución', activo: true },
  { id: 'cs-062', codigo: 'CS-MIR-03', nombre: 'CHARALLAVE', estado_id: 'mir', estado_nombre: 'Miranda', region_id: 'reg-capital', region_nombre: 'CAPITAL', municipio: 'CHARALLAVE AV CRISTOBAL ROJAS CENTRO RES. Y COMERCIAL EL CAMPITO DIAGONAL A LA POLICIA MIRANDA MUN. CRISTOBAL ROJAS', tipo: 'Atención Técnica y Distribución', activo: true },
  { id: 'cs-063', codigo: 'CS-MIR-04', nombre: 'GUARENAS GUATIRE CAUCAGUA', estado_id: 'mir', estado_nombre: 'Miranda', region_id: 'reg-capital', region_nombre: 'CAPITAL', municipio: 'CARRETERA NACIONAL GUARENAS GUATIRE EDIF CORPOELEC', tipo: 'Atención Técnica y Distribución', activo: true },
  { id: 'cs-064', codigo: 'CS-MIR-05', nombre: 'HIGUEROTE', estado_id: 'mir', estado_nombre: 'Miranda', region_id: 'reg-capital', region_nombre: 'CAPITAL', municipio: 'HIGUEROTE FINAL CALLE COMERCIO EDIF CORPOELEC AL LADO DE LA FARMACIA CARIBE MAR', tipo: 'Atención Técnica y Distribución', activo: true },
  { id: 'cs-065', codigo: 'CS-MIR-06', nombre: 'SANTA TERESA', estado_id: 'mir', estado_nombre: 'Miranda', region_id: 'reg-capital', region_nombre: 'CAPITAL', municipio: 'SANTA TERESA DEL TUY MUN. INDEPENDENCIA AV. BOLIVAR ENTRADA A LAS URB. LAS FLORES EDIF CORPOELEC.', tipo: 'Atención Técnica y Distribución', activo: true },
  { id: 'cs-066', codigo: 'CS-MON-01', nombre: 'LIBERTADOR', estado_id: 'mon', estado_nombre: 'Monagas', region_id: 'reg-oriente', region_nombre: 'ORIENTE', municipio: 'CALLE MONAGAS, CASA SIN NUMERO, DIAGONAL A LA FUNERARIA VIRGEN DE LOURDES. TEMBLADOR. MUNICIPIO LIBERTADOR', tipo: 'Atención Técnica y Distribución', activo: true },
  { id: 'cs-067', codigo: 'CS-MON-02', nombre: 'MATURIN', estado_id: 'mon', estado_nombre: 'Monagas', region_id: 'reg-oriente', region_nombre: 'ORIENTE', municipio: 'URB. CUCUTA. CALLE LA PLANTA SECTOR NEGRO PRIMERO MATURÌN', tipo: 'Atención Técnica y Distribución', activo: true },
  { id: 'cs-068', codigo: 'CS-MON-03', nombre: 'PUNTA DE MATA', estado_id: 'mon', estado_nombre: 'Monagas', region_id: 'reg-oriente', region_nombre: 'ORIENTE', municipio: 'AV. BOLIVAR DIAGONAL AL MODULO POLICIAL DE PUNTA DE MATA', tipo: 'Atención Técnica y Distribución', activo: true },
  { id: 'cs-069', codigo: 'CS-NVE-01', nombre: 'JUAN GRIEGO', estado_id: 'nve', estado_nombre: 'Nueva Esparta', region_id: 'reg-insular', region_nombre: 'INSULAR', municipio: 'MUN MARCANO JUAN GRIEGO, AVENIDA JESUS RAFEL LEANDRO', tipo: 'Atención Técnica y Distribución', activo: true },
  { id: 'cs-070', codigo: 'CS-NVE-02', nombre: 'PAMPATAR', estado_id: 'nve', estado_nombre: 'Nueva Esparta', region_id: 'reg-insular', region_nombre: 'INSULAR', municipio: 'MUN MANEIRO. SECTOR SAN LORENZO, CALLE PRINCIPAL SAN LORENZO', tipo: 'Atención Técnica y Distribución', activo: true },
  { id: 'cs-071', codigo: 'CS-POR-01', nombre: 'ACARIGUA', estado_id: 'por', estado_nombre: 'Portuguesa', region_id: 'reg-llanos', region_nombre: 'LOS LLANOS', municipio: 'AV. LIBERTADOR EDF. PLAZA FRENTE AL BOULEVAR SAN ROQUE ACARIGUA', tipo: 'Atención Técnica y Distribución', activo: true },
  { id: 'cs-072', codigo: 'CS-POR-02', nombre: 'BISCUCUY', estado_id: 'por', estado_nombre: 'Portuguesa', region_id: 'reg-llanos', region_nombre: 'LOS LLANOS', municipio: 'CALLE PAEZ BISCUCUY', tipo: 'Atención Técnica y Distribución', activo: true },
  { id: 'cs-073', codigo: 'CS-POR-03', nombre: 'GUANARE', estado_id: 'por', estado_nombre: 'Portuguesa', region_id: 'reg-llanos', region_nombre: 'LOS LLANOS', municipio: 'AV. JUAN FERNANDEZ DE LEON FRENTE AL LICEO CEMO GUANARE', tipo: 'Atención Técnica y Distribución', activo: true },
  { id: 'cs-074', codigo: 'CS-POR-04', nombre: 'TUREN', estado_id: 'por', estado_nombre: 'Portuguesa', region_id: 'reg-llanos', region_nombre: 'LOS LLANOS', municipio: 'AV. 2 CON CALLE 6 TUREN', tipo: 'Atención Técnica y Distribución', activo: true },
  { id: 'cs-075', codigo: 'CS-SUC-01', nombre: 'CARIACO', estado_id: 'suc', estado_nombre: 'Sucre', region_id: 'reg-oriente', region_nombre: 'ORIENTE', municipio: 'SECTOR GUARAPICHE. CALLE 01. CASNAY. ESTADO SUCRE', tipo: 'Atención Técnica y Distribución', activo: true },
  { id: 'cs-076', codigo: 'CS-SUC-02', nombre: 'CARUPANO', estado_id: 'suc', estado_nombre: 'Sucre', region_id: 'reg-oriente', region_nombre: 'ORIENTE', municipio: 'CALLE LA PLANTA SECTOR DEL VALLE', tipo: 'Atención Técnica y Distribución', activo: true },
  { id: 'cs-077', codigo: 'CS-SUC-03', nombre: 'CUMANA', estado_id: 'suc', estado_nombre: 'Sucre', region_id: 'reg-oriente', region_nombre: 'ORIENTE', municipio: 'AV UNIVERSIDAD EDF SEDE DE CORPOELEC', tipo: 'Atención Técnica y Distribución', activo: true },
  { id: 'cs-078', codigo: 'CS-TAC-01', nombre: 'LA FRIA', estado_id: 'tac', estado_nombre: 'Táchira', region_id: 'reg-andes', region_nombre: 'LOS ANDES', municipio: 'CALLES 7 ENTRE CARRERAS 6 Y 7 LA FRIA MUNICIPIO GARCIA DE HEVIA ESTADO TACHIRA', tipo: 'Atención Técnica y Distribución', activo: true },
  { id: 'cs-079', codigo: 'CS-TAC-02', nombre: 'LA PEDRERA', estado_id: 'tac', estado_nombre: 'Táchira', region_id: 'reg-andes', region_nombre: 'LOS ANDES', municipio: 'CALLE PRINCIPAL EL PIÑAL, AL LADO DE LA UNELLEZ', tipo: 'Atención Técnica y Distribución', activo: true },
  { id: 'cs-080', codigo: 'CS-TAC-03', nombre: 'MICHELENA', estado_id: 'tac', estado_nombre: 'Táchira', region_id: 'reg-andes', region_nombre: 'LOS ANDES', municipio: 'CALLE 4 ENTRE CARRERAS 8 Y 9', tipo: 'Atención Técnica y Distribución', activo: true },
  { id: 'cs-081', codigo: 'CS-TAC-04', nombre: 'SAN ANTONIO', estado_id: 'tac', estado_nombre: 'Táchira', region_id: 'reg-andes', region_nombre: 'LOS ANDES', municipio: 'CENTRO CIVICO, PLATA ALTA, SAN ANTONIO DEL TÁCHIRA', tipo: 'Atención Técnica y Distribución', activo: true },
  { id: 'cs-082', codigo: 'CS-TAC-05', nombre: 'SAN CRISTOBAL', estado_id: 'tac', estado_nombre: 'Táchira', region_id: 'reg-andes', region_nombre: 'LOS ANDES', municipio: 'AV LIBERTADOR EDIFICIO CORPOELEC ZONA TACHIRA', tipo: 'Atención Técnica y Distribución', activo: true },
  { id: 'cs-083', codigo: 'CS-TRU-01', nombre: 'BOCONO', estado_id: 'tru', estado_nombre: 'Trujillo', region_id: 'reg-andes', region_nombre: 'LOS ANDES', municipio: 'SECTOR LOS PANTANOS C-6 MONSEÑOR JAUREGUI Y C. LOS INOS', tipo: 'Atención Técnica y Distribución', activo: true },
  { id: 'cs-084', codigo: 'CS-TRU-02', nombre: 'CAJA SECA', estado_id: 'tru', estado_nombre: 'Trujillo', region_id: 'reg-andes', region_nombre: 'LOS ANDES', municipio: 'SECTOR NUEVA BOLIVIA PANAMERICANA CON AV. TULI FEBRES CORDERO', tipo: 'Atención Técnica y Distribución', activo: true },
  { id: 'cs-085', codigo: 'CS-TRU-03', nombre: 'SABANA DE MENDOZA', estado_id: 'tru', estado_nombre: 'Trujillo', region_id: 'reg-andes', region_nombre: 'LOS ANDES', municipio: 'SERTOR SABANA DE MENDOZA, FINAL DE CALLE PIAR', tipo: 'Atención Técnica y Distribución', activo: true },
  { id: 'cs-086', codigo: 'CS-TRU-04', nombre: 'TRUJILLO', estado_id: 'tru', estado_nombre: 'Trujillo', region_id: 'reg-andes', region_nombre: 'LOS ANDES', municipio: 'AV. CORO ENTRE MENDOZA AL LADO DE PLAZA MENDOZA', tipo: 'Atención Técnica y Distribución', activo: true },
  { id: 'cs-087', codigo: 'CS-TRU-05', nombre: 'VALERA', estado_id: 'tru', estado_nombre: 'Trujillo', region_id: 'reg-andes', region_nombre: 'LOS ANDES', municipio: 'SECTOR EL BOLO, C.C MERCEDEZ DIAZ, FRENTE A LOS BOMBEROS', tipo: 'Atención Técnica y Distribución', activo: true },
  { id: 'cs-088', codigo: 'CS-YAR-01', nombre: 'SAN FELIPE', estado_id: 'yar', estado_nombre: 'Yaracuy', region_id: 'reg-central', region_nombre: 'CENTRAL', municipio: 'AV. INTERCOMUNAL SAN FELIPE EL FUERTE FRENTE A LA URB. LOS MANGOS, MUNICIPIO INDEPENDENCIA', tipo: 'Atención Técnica y Distribución', activo: true },
  { id: 'cs-089', codigo: 'CS-YAR-02', nombre: 'YARITAGUA', estado_id: 'yar', estado_nombre: 'Yaracuy', region_id: 'reg-central', region_nombre: 'CENTRAL', municipio: 'AV. EL TROCADERO ENTRE CARRERA 14 Y AUTOPISTA CIMARRON ANDRESOTE DIAGONAL AL HOSPITAL RAFAEL RANGEL, MUNICIPIO PEÑA', tipo: 'Atención Técnica y Distribución', activo: true },
  { id: 'cs-090', codigo: 'CS-YAR-03', nombre: 'AROA', estado_id: 'yar', estado_nombre: 'Yaracuy', region_id: 'reg-central', region_nombre: 'CENTRAL', municipio: 'CALLE BOLIVAR SECTOR CASA DE TEJAS, FRENTE ATENEO DE AROA VIA MANGA DE COLEO, MUNICIPIO BOLIVAR-YARACUY', tipo: 'Atención Técnica y Distribución', activo: true },
  { id: 'cs-091', codigo: 'CS-ZUL-01', nombre: 'MARACAIBO', estado_id: 'zul', estado_nombre: 'Zulia', region_id: 'reg-occidente', region_nombre: 'OCCIDENTE', municipio: 'AV 29 CON CIRCUNVALACION 2, SECTOR AMPARO', tipo: 'Atención Técnica y Distribución', activo: true },
  { id: 'cs-092', codigo: 'CS-ZUL-02', nombre: 'SAN FRANCISCO', estado_id: 'zul', estado_nombre: 'Zulia', region_id: 'reg-occidente', region_nombre: 'OCCIDENTE', municipio: 'KILÒMETRO 8 1/2 VIA A PERIJA CENTRO DE OPERACIONES SUR, SAN FRANCISCO.', tipo: 'Atención Técnica y Distribución', activo: true },
  { id: 'cs-093', codigo: 'CS-ZUL-03', nombre: 'CABIMAS - SIMÓN BOLIVAR', estado_id: 'zul', estado_nombre: 'Zulia', region_id: 'reg-occidente', region_nombre: 'OCCIDENTE', municipio: 'AVENIDA INDEPENDENCIA CASCO CENTRAL # 111 PARROQUIA CARMEN HERRERA', tipo: 'Atención Técnica y Distribución', activo: true },
  { id: 'cs-094', codigo: 'CS-ZUL-04', nombre: 'LAGUNILLAS', estado_id: 'zul', estado_nombre: 'Zulia', region_id: 'reg-occidente', region_nombre: 'OCCIDENTE', municipio: 'AVENIDA ALONSO DE OJEDA) FRENTE A LA PLAZA ALONSO DE OJEDA Y BANCO MERCANTIL EDIFICIO CORPOELEC', tipo: 'Atención Técnica y Distribución', activo: true },
  { id: 'cs-095', codigo: 'CS-ZUL-05', nombre: 'BARALT - VALMORE RODRIGUEZ', estado_id: 'zul', estado_nombre: 'Zulia', region_id: 'reg-occidente', region_nombre: 'OCCIDENTE', municipio: 'OFICINA PRINCIPAL CORPOELEC, MENE GRANDE, MUNICIPIO BARALT, SECTOR LA GOLFO, AV. INDEPENDENCIA, CALLE 100, ANTES DEL BANCO MERCANTIL', tipo: 'Atención Técnica y Distribución', activo: true },
  { id: 'cs-096', codigo: 'CS-ZUL-06', nombre: 'JESUS E. LOZADA - CAÑADA DE URDANETA', estado_id: 'zul', estado_nombre: 'Zulia', region_id: 'reg-occidente', region_nombre: 'OCCIDENTE', municipio: 'OFICINA CORPOELEC CONCEPCION, UBICADA EN PLANTA CONCEPCION, FINAL BOULEVAR FRANCIA A UN KM DE LA GUARDIA NACIONAL VIA A MARA', tipo: 'Atención Técnica y Distribución', activo: true },
  { id: 'cs-097', codigo: 'CS-ZUL-07', nombre: 'JESÚS MARÍA SEMPRÚN', estado_id: 'zul', estado_nombre: 'Zulia', region_id: 'reg-occidente', region_nombre: 'OCCIDENTE', municipio: 'SECTOR LA CARMELA, CENTRO DE OPERACIONES LA CARMELA, PARROQUIA SANTA BARBARA MUNICIPIO COLON.', tipo: 'Atención Técnica y Distribución', activo: true },
  { id: 'cs-098', codigo: 'CS-ZUL-08', nombre: 'GUAJIRA', estado_id: 'zul', estado_nombre: 'Zulia', region_id: 'reg-occidente', region_nombre: 'OCCIDENTE', municipio: 'CENTRO DE OPERACIONES ARMANDO CLEMENTE, AV. LIBERTADOR FRENTE AL CEMENTERIO DE EL MOJAN. EL MOJAN, MUNICIPIO MARA', tipo: 'Atención Técnica y Distribución', activo: true },
  { id: 'cs-099', codigo: 'CS-ZUL-09', nombre: 'ROSARIO DE PERIJÁ', estado_id: 'zul', estado_nombre: 'Zulia', region_id: 'reg-occidente', region_nombre: 'OCCIDENTE', municipio: 'OFICINA CORPOELEC LA VILLA, AV ADOLFO LOPEZ, ENTRE CALLES EL MARQUEZ Y CALLE EL REGISTRO. FRENTE AL INCES', tipo: 'Atención Técnica y Distribución', activo: true },
  { id: 'cs-100', codigo: 'CS-ZUL-10', nombre: 'MACHIQUES', estado_id: 'zul', estado_nombre: 'Zulia', region_id: 'reg-occidente', region_nombre: 'OCCIDENTE', municipio: 'CENTRO DE OPERACIONES APON FINAL DE CALLE LA GRANJA AL LADO DEL BALNERIO APON MACHIQUES DE PERIJA', tipo: 'Atención Técnica y Distribución', activo: true },
  { id: 'cs-101', codigo: 'CS-ZUL-11', nombre: 'MIRANDA - SANTA RITA', estado_id: 'zul', estado_nombre: 'Zulia', region_id: 'reg-occidente', region_nombre: 'OCCIDENTE', municipio: 'OFICINA CORPOELEC LOS PUERTOS, AV 11, ENTRE CALLES 5 Y 6, LOS PUERTOS DE ALTAGRACIA, MUNICIPIO MIRANDA.', tipo: 'Atención Técnica y Distribución', activo: true }
];

export const ASSET_TYPE_CODES: { [key: string]: string } = {
  'CAMIONETA': 'CAMI',
  'CAMION': 'CAM',
  'CAMION CESTA AISLADA': 'CESTA',
  'CAMION BRAZO HIDRAULICO': 'BRAZO',
  'AUTOBUS': 'BUS',
  'AUTOMOVIL': 'AUTO',
  'MOTO': 'MOTO',
  'MAQUINARIA': 'MAQ',
  'OTRO': 'OTRO'
};
