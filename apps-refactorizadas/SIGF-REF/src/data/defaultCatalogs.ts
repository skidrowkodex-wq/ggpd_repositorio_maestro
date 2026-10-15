import { MasterCatalogsState } from '../types/fleet';
import { VENEZUELA_REGIONS, CORPOELEC_CENTROS_SERVICIOS } from './venezuelaRegions';

export const OFFICIAL_BRANDS_A4 = [
  { id: '1', nombre: 'TOYOTA', activo: true, adicional: 'Transporte de cuadrillas, supervisión, mantenimiento de redes, acceso a zonas rurales y de difícil acceso.' },
  { id: '2', nombre: 'FORD', activo: true, adicional: 'Camiones de carga para transporte de material estratégico y logística pesada.' },
  { id: '3', nombre: 'HINO', activo: true, adicional: 'Transporte de personal, mantenimiento de líneas aéreas y trabajos en altura.' },
  { id: '4', nombre: 'IVECO', activo: true, adicional: 'Camiones de carga, plataformas para transporte de equipos y materiales.' },
  { id: '5', nombre: 'CHEVROLET', activo: true, adicional: 'Transporte de personal y materiales; usado en labores de distribución.' },
  { id: '6', nombre: 'DONGFENG', activo: true, adicional: 'Trabajos en altura (cesta), transporte de personal y materiales en distribución.' },
  { id: '7', nombre: 'DAYUN', activo: true, adicional: 'Plan Pica y Poda, mantenimiento de líneas y transporte de cuadrillas.' },
  { id: '8', nombre: 'INTERNACIONAL', activo: true, adicional: 'Probablemente camiones de carga para logística pesada.' },
  { id: '9', nombre: 'ISUZU', activo: true, adicional: 'Vehículos para distribución y transmisión.' },
  { id: '10', nombre: 'HAOJUE', activo: true, adicional: 'Motocicletas para desplazamiento rápido de personal en inspecciones y averías.' },
  { id: '11', nombre: 'NISSAN', activo: true, adicional: 'Posiblemente vehículos utilitarios o pick-up para cuadrillas.' },
  { id: '12', nombre: 'MITSUBISHI', activo: true, adicional: 'Vehículos de apoyo para labores operativas.' },
  { id: '13', nombre: 'JEEP', activo: true, adicional: 'Transporte de personal en zonas de difícil acceso y supervisión.' },
  { id: '14', nombre: 'ENCAVA', activo: true, adicional: 'Autobuses para transporte de personal.' },
  { id: '15', nombre: 'MAZDA', activo: true, adicional: 'Posiblemente vehículos livianos para supervisión.' },
  { id: '16', nombre: 'SAIPA', activo: true, adicional: 'Vehículos livianos para transporte de personal y distribución.' },
  { id: '17', nombre: 'BAW', activo: true, adicional: 'Vehículos de apoyo para logística.' },
  { id: '18', nombre: 'REWARD', activo: true, adicional: 'Vehículos utilitarios.' },
  { id: '19', nombre: 'RUSA', activo: true, adicional: 'Vehículos rústicos para zonas alejadas.' }
];

export const OFFICIAL_MODELS = [
  // TOYOTA
  { id: 'm-toy-1', marca: 'TOYOTA', nombre: 'HILUX', adicional: 'Transporte de cuadrillas, supervisión y mantenimiento de redes.', activo: true },
  { id: 'm-toy-2', marca: 'TOYOTA', nombre: 'LAND CRUISER', adicional: 'Acceso a zonas rurales y de difícil acceso.', activo: true },
  { id: 'm-toy-3', marca: 'TOYOTA', nombre: 'LAND CRUISER (DOBLE CABINA)', adicional: 'Transporte de personal y cuadrillas operativas.', activo: true },
  { id: 'm-toy-4', marca: 'TOYOTA', nombre: 'LAND CRUISER (PARA CARGA)', adicional: 'Transporte de carga y materiales.', activo: true },
  { id: 'm-toy-5', marca: 'TOYOTA', nombre: 'CHASIS LARGO', adicional: 'Soporte y logística pesada.', activo: true },
  { id: 'm-toy-6', marca: 'TOYOTA', nombre: 'COROLLA', adicional: 'Supervisión y traslado administrativo.', activo: true },

  // FORD
  { id: 'm-ford-1', marca: 'FORD', nombre: 'F-750', adicional: 'Camiones de carga para material estratégico.', activo: true },
  { id: 'm-ford-2', marca: 'FORD', nombre: 'F-7000', adicional: 'Logística pesada de distribución.', activo: true },
  { id: 'm-ford-3', marca: 'FORD', nombre: 'CARGO', adicional: 'Transporte de transformadores y redes.', activo: true },
  { id: 'm-ford-4', marca: 'FORD', nombre: 'LARIAT XLT', adicional: 'Supervisión de operaciones.', activo: true },

  // HINO
  { id: 'm-hino-1', marca: 'HINO', nombre: 'CUADRILLERO', adicional: 'Transporte de personal y cuadrillas.', activo: true },
  { id: 'm-hino-2', marca: 'HINO', nombre: 'THERMO KING', adicional: 'Logística especializada.', activo: true },
  { id: 'm-hino-3', marca: 'HINO', nombre: 'CAMIÓN CESTA', adicional: 'Mantenimiento de líneas aéreas y trabajos en altura.', activo: true },

  // IVECO
  { id: 'm-iveco-1', marca: 'IVECO', nombre: 'PLATAFORMA', adicional: 'Transporte de equipos y materiales.', activo: true },
  { id: 'm-iveco-2', marca: 'IVECO', nombre: 'DAILY (70C15, 35S15)', adicional: 'Camiones de carga mediana.', activo: true },
  { id: 'm-iveco-3', marca: 'IVECO', nombre: 'EUROCARGO', adicional: 'Carga pesada en redes.', activo: true },
  { id: 'm-iveco-4', marca: 'IVECO', nombre: 'STRALIS', adicional: 'Logística de gran envergadura.', activo: true },

  // CHEVROLET
  { id: 'm-chev-1', marca: 'CHEVROLET', nombre: 'CAMIONETA DOBLE CABINA', adicional: 'Transporte de personal y materiales en distribución.', activo: true },

  // DONGFENG
  { id: 'm-dong-1', marca: 'DONGFENG', nombre: 'CAMIÓN CESTA', adicional: 'Trabajos en altura en distribución.', activo: true },
  { id: 'm-dong-2', marca: 'DONGFENG', nombre: 'CAMIONETA PICK-UP 4X2/4X4 (DOBLE CABINA)', adicional: 'Transporte de personal y materiales.', activo: true },
  { id: 'm-dong-3', marca: 'DONGFENG', nombre: 'RICH 6', adicional: 'Pick-up operativa para inspecciones.', activo: true },

  // DAYUN
  { id: 'm-day-1', marca: 'DAYUN', nombre: 'CAMIÓN CESTA', adicional: 'Plan Pica y Poda, mantenimiento de líneas.', activo: true },
  { id: 'm-day-2', marca: 'DAYUN', nombre: 'CAMIÓN CUADRILLERO', adicional: 'Transporte de cuadrillas operativas.', activo: true },

  // INTERNACIONAL
  { id: 'm-int-1', marca: 'INTERNACIONAL', nombre: 'OTRO / ESPECIFICAR', adicional: 'Camión de carga para logística pesada.', activo: true },

  // ISUZU
  { id: 'm-isu-1', marca: 'ISUZU', nombre: 'OTRO / ESPECIFICAR', adicional: 'Vehículos para distribución y transmisión.', activo: true },

  // HAOJUE
  { id: 'm-hao-1', marca: 'HAOJUE', nombre: 'HJ-150', adicional: 'Desplazamiento rápido en inspección de averías.', activo: true },
  { id: 'm-hao-2', marca: 'HAOJUE', nombre: 'NK 150 FI ABS', adicional: 'Motocicleta operativa para supervisión.', activo: true },
  { id: 'm-hao-3', marca: 'HAOJUE', nombre: 'DK 150', adicional: 'Mensajería y apoyo técnico rápido.', activo: true },
  { id: 'm-hao-4', marca: 'HAOJUE', nombre: 'DM125 S', adicional: 'Desplazamiento urbano de técnicos.', activo: true },

  // NISSAN
  { id: 'm-nis-1', marca: 'NISSAN', nombre: 'OTRO / ESPECIFICAR', adicional: 'Vehículo utilitario o pick-up para cuadrillas.', activo: true },

  // MITSUBISHI
  { id: 'm-mit-1', marca: 'MITSUBISHI', nombre: 'OTRO / ESPECIFICAR', adicional: 'Vehículo de apoyo para labores operativas.', activo: true },

  // JEEP
  { id: 'm-jeep-1', marca: 'JEEP', nombre: 'GRAND CHEROKEE 4X4', adicional: 'Transporte de personal en zonas de difícil acceso.', activo: true },
  { id: 'm-jeep-2', marca: 'JEEP', nombre: 'MACHITO', adicional: 'Supervisión en terrenos agrestes.', activo: true },

  // ENCAVA
  { id: 'm-enc-1', marca: 'ENCAVA', nombre: 'ENT-3300', adicional: 'Autobús para transporte de personal.', activo: true },
  { id: 'm-enc-2', marca: 'ENCAVA', nombre: 'ENT-610 URB', adicional: 'Transporte masivo de empleados.', activo: true },
  { id: 'm-enc-3', marca: 'ENCAVA', nombre: 'ET-5', adicional: 'Autobús corporativo.', activo: true },

  // MAZDA
  { id: 'm-maz-1', marca: 'MAZDA', nombre: 'OTRO / ESPECIFICAR', adicional: 'Vehículo liviano para supervisión.', activo: true },

  // SAIPA
  { id: 'm-sai-1', marca: 'SAIPA', nombre: 'SAINA', adicional: 'Vehículo liviano para transporte.', activo: true },
  { id: 'm-sai-2', marca: 'SAIPA', nombre: 'QUICK', adicional: 'Vehículo compacto de supervisión.', activo: true },

  // BAW
  { id: 'm-baw-1', marca: 'BAW', nombre: 'OTRO / ESPECIFICAR', adicional: 'Vehículo de apoyo para logística.', activo: true },

  // REWARD
  { id: 'm-rew-1', marca: 'REWARD', nombre: 'OTRO / ESPECIFICAR', adicional: 'Vehículo utilitario.', activo: true },

  // RUSA
  { id: 'm-rus-1', marca: 'RUSA', nombre: 'OTRO / ESPECIFICAR', adicional: 'Vehículo rústico para zonas alejadas.', activo: true }
];

export const INITIAL_CATALOGS: MasterCatalogsState = {
  marcas: OFFICIAL_BRANDS_A4,
  modelos: OFFICIAL_MODELS,

  tipos_vehiculo: [
    { id: 'tv-1', nombre: 'AUTOMOVIL', activo: true, adicional: 'Automóvil liviano' },
    { id: 'tv-2', nombre: 'CAMION', activo: true, adicional: 'Camión de carga' },
    { id: 'tv-3', nombre: 'CAMION CESTA', activo: true, adicional: 'Camión con cesta para trabajos en altura' },
    { id: 'tv-4', nombre: 'CAMION DOBLE CESTA', activo: true, adicional: 'Camión con doble cesta' },
    { id: 'tv-5', nombre: 'CAMIONETA', activo: true, adicional: 'Camioneta / Pick-up' },
    { id: 'tv-6', nombre: 'MOTO', activo: true, adicional: 'Motocicleta' },
    { id: 'tv-7', nombre: 'TRIMOTO', activo: true, adicional: 'Trimoto' },
    { id: 'tv-8', nombre: 'VEHICULO ESPECIAL', activo: true, adicional: 'Vehículo especial' }
  ],

  gerencias: [
    { id: 'g-1', nombre: 'GGPD (Gerencia General de Programación y Control de Operaciones)', activo: true },
    { id: 'g-2', nombre: 'GERENCIA GENERAL DE DISTRIBUCIÓN', activo: true },
    { id: 'g-3', nombre: 'GERENCIA GENERAL DE TRANSMISIÓN', activo: true },
    { id: 'g-4', nombre: 'GERENCIA GENERAL DE GENERACIÓN', activo: true },
    { id: 'g-5', nombre: 'GERENCIA GENERAL DE COMERCIALIZACIÓN', activo: true },
    { id: 'g-6', nombre: 'GERENCIA GENERAL DE BIENES Y SERVICIOS (TRANSPORTE)', activo: true },
    { id: 'g-7', nombre: 'GERENCIA GENERAL DE TALENTO HUMANO', activo: true },
    { id: 'g-8', nombre: 'GERENCIA GENERAL DE TECNOLOGÍA (TIC)', activo: true },
    { id: 'g-9', nombre: 'GERENCIA GENERAL DE SEGURIDAD INTEGRAL', activo: true },
    { id: 'g-10', nombre: 'GERENCIA REGIONAL CAPITAL', activo: true, adicional: 'Distrito Capital, Miranda, La Guaira' },
    { id: 'g-11', nombre: 'GERENCIA REGIONAL CENTRAL', activo: true, adicional: 'Carabobo, Aragua, Cojedes' },
    { id: 'g-12', nombre: 'GERENCIA REGIONAL OCCIDENTE', activo: true, adicional: 'Zulia' },
    { id: 'g-13', nombre: 'GERENCIA REGIONAL CENTRO-OCCIDENTAL', activo: true, adicional: 'Lara, Falcón, Yaracuy' },
    { id: 'g-14', nombre: 'GERENCIA REGIONAL LOS ANDES', activo: true, adicional: 'Mérida, Táchira, Trujillo' },
    { id: 'g-15', nombre: 'GERENCIA REGIONAL LOS LLANOS', activo: true, adicional: 'Guárico, Apure, Barinas, Portuguesa' },
    { id: 'g-16', nombre: 'GERENCIA REGIONAL ORIENTE', activo: true, adicional: 'Anzoátegui, Monagas, Sucre, Nueva Esparta' },
    { id: 'g-17', nombre: 'GERENCIA REGIONAL GUAYANA', activo: true, adicional: 'Bolívar, Amazonas, Delta Amacuro, Guayana Esequiba' },
    { id: 'g-18', nombre: 'GERENCIA REGIONAL INSULAR', activo: true, adicional: 'Nueva Esparta, Dependencias Federales' }
  ],

  centros_servicios: CORPOELEC_CENTROS_SERVICIOS,

  unidades_asignadas: [
    { id: 'u-1', nombre: 'GERENCIA ESTADAL', activo: true },
    { id: 'u-2', nombre: 'GESTIÓN DE INFORMACIÓN', activo: true },
    { id: 'u-3', nombre: 'PLANIFICACIÓN DE DISTRIBUCIÓN', activo: true },
    { id: 'u-4', nombre: 'INGENIERÍA DE MANTENIMIENTO', activo: true },
    { id: 'u-5', nombre: 'INFORMACIÓN GEOGRÁFICA', activo: true },
    { id: 'u-6', nombre: 'PROGRAMACIÓN Y CONTROL', activo: true },
    { id: 'u-7', nombre: 'SUBESTACIONES', activo: true },
    { id: 'u-8', nombre: 'TALLERES DE REPARACIONES MENORES', activo: true },
    { id: 'u-9', nombre: 'LÍNEAS ENERGIZADAS', activo: true },
    { id: 'u-10', nombre: 'GESTIÓN DE PROYECTOS', activo: true },
    { id: 'u-11', nombre: 'DISEÑO', activo: true },
    { id: 'u-12', nombre: 'OBRAS', activo: true },
    { id: 'u-13', nombre: 'REDES AÉREAS Y SUBTERRÁNEAS', activo: true },
    { id: 'u-14', nombre: 'ALUMBRADO PÚBLICO', activo: true },
    { id: 'u-15', nombre: 'MANTENIMIENTO', activo: true },
    { id: 'u-16', nombre: 'ATENCIÓN DE AVERÍAS', activo: true }
  ],

  medidas_cauchos: [
    { id: 'mc-1', nombre: '265/70R16', activo: true, adicional: 'Toyota Hilux / Land Cruiser' },
    { id: 'mc-2', nombre: '245/75R16', activo: true, adicional: 'Ford F-250 / F-350' },
    { id: 'mc-3', nombre: '7.50R16', activo: true, adicional: 'Iveco Daily / Camiones ligeros' },
    { id: 'mc-4', nombre: '205/55R16', activo: true, adicional: 'Automóviles y sedanes' },
    { id: 'mc-5', nombre: '11R22.5', activo: true, adicional: 'Camiones pesados / Cesta' },
    { id: 'mc-6', nombre: '295/80R22.5', activo: true, adicional: 'Autobuses y chasis largos' },
    { id: 'mc-7', nombre: '275/80R22.5', activo: true, adicional: 'Camiones cisterna y carga' },
    { id: 'mc-8', nombre: '215/85R16', activo: true, adicional: 'Dual traseros camiones 350' },
    { id: 'mc-9', nombre: '90/90-19', activo: true, adicional: 'Motos doble propósito' },
    { id: 'mc-10', nombre: '120/90-17', activo: true, adicional: 'Motos traseras' }
  ],

  caracteristicas_baterias: [
    { id: 'cb-1', nombre: '1100 AMP / 12V (Grupo 34MR)', activo: true, adicional: 'Camionetas diesel y carga liviana' },
    { id: 'cb-2', nombre: '800 AMP / 12V (Grupo 24R)', activo: true, adicional: 'Vehículos medianos y pickup gasolina' },
    { id: 'cb-3', nombre: '650 AMP / 12V (Grupo 42)', activo: true, adicional: 'Automóviles compactos' },
    { id: 'cb-4', nombre: '1400 AMP / 12V (Grupo 4D / 8D)', activo: true, adicional: 'Camiones pesados y cestas hidráulicas' },
    { id: 'cb-5', nombre: '12V 1000 AMP Heavy Duty', activo: true, adicional: 'Maquinaria pesada y grúas' },
    { id: 'cb-6', nombre: '12V 7AH / 9AH', activo: true, adicional: 'Motos operativas' }
  ],

  regiones: VENEZUELA_REGIONS.map(reg => ({
    id: reg.id,
    nombre: reg.nombre,
    activo: true,
    adicional: `[${reg.codigo}] ${reg.gerencia || ''} - Estados: ${reg.estados.join(', ')}`
  }))
};
