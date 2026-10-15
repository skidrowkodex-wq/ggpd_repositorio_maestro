import { ColumnDefinition } from '../types/fleet';

export const FLEET_COLUMNS: ColumnDefinition[] = [
  {
    orden: 1,
    columna_excel: 'A',
    campo: 'estado',
    titulo: 'ESTADO',
    tipo_dato: 'texto',
    obligatorio: true,
    descripcion: 'Estado general del vehículo en la flota institucional.',
    valores_sugeridos: ['ACTIVO', 'INACTIVO', 'EN MANTENIMIENTO', 'FUERA DE SERVICIO', 'RECUPERADO'],
    catalogo_sugerido: 'Estados Operativos',
    categoria_logica: 'Condición General'
  },
  {
    orden: 2,
    columna_excel: 'B',
    campo: 'numero_vehiculo',
    titulo: 'Número de Vehículo',
    tipo_dato: 'texto',
    obligatorio: true,
    unico: true,
    descripcion: 'Identificador único institucional o código de flota (ej. GGDT-ESQ-CAMI-0001). Clave Primaria en BD.',
    ejemplo: 'GGDT-ESQ-CAMI-0001',
    categoria_logica: 'Identificación'
  },
  {
    orden: 3,
    columna_excel: 'C',
    campo: 'marca_vehiculo',
    titulo: 'Marca de Vehículo',
    tipo_dato: 'texto',
    obligatorio: true,
    descripcion: 'Marca comercial del fabricante del vehículo. Exclusivamente las 19 marcas del catálogo oficial A4_marcas.csv.',
    valores_sugeridos: [
      'TOYOTA', 'FORD', 'HINO', 'IVECO', 'CHEVROLET', 'DONGFENG', 'DAYUN',
      'INTERNACIONAL', 'ISUZU', 'HAOJUE', 'NISSAN', 'MITSUBISHI', 'JEEP',
      'ENCAVA', 'MAZDA', 'SAIPA', 'BAW', 'REWARD', 'RUSA'
    ],
    catalogo_sugerido: 'Marcas de Vehículo (A4_marcas.csv - 19 marcas)',
    categoria_logica: 'Identificación'
  },
  {
    orden: 4,
    columna_excel: 'D',
    campo: 'tipo_vehiculo',
    titulo: 'Tipo de Vehículo',
    tipo_dato: 'texto',
    obligatorio: true,
    descripcion: 'Categoría o tipología operativa del automotor.',
    valores_sugeridos: ['CAMIONETA', 'CAMION', 'AUTOBUS', 'AUTOMOVIL', 'MOTO', 'MAQUINARIA', 'OTRO'],
    catalogo_sugerido: 'Tipos de Vehículo',
    categoria_logica: 'Identificación'
  },
  {
    orden: 5,
    columna_excel: 'E',
    campo: 'unidad_asignada',
    titulo: 'Unidad Asignada (Libre)',
    tipo_dato: 'texto',
    obligatorio: false,
    descripcion: 'Unidad técnica, operativa o administrativa a la que está adscrito el vehículo (campo libre, desacoplado del Centro de Servicios).',
    catalogo_sugerido: 'Sugerencias de Unidades Asignadas',
    categoria_logica: 'Ubicación'
  },
  {
    orden: 6,
    columna_excel: 'F',
    campo: 'centro_servicios',
    titulo: 'Centro de Servicios',
    tipo_dato: 'texto',
    obligatorio: false,
    descripcion: 'Centro de servicios o base operativa determinado directamente por el Estado (FK: estado_id).',
    catalogo_sugerido: 'Centros de Servicios',
    categoria_logica: 'Ubicación'
  },
  {
    orden: 7,
    columna_excel: 'G',
    campo: 'condicion_actual',
    titulo: 'Condición Actual',
    tipo_dato: 'texto',
    obligatorio: true,
    descripcion: 'Condición operativa y física actual del automotor.',
    valores_sugeridos: ['BUENO', 'REGULAR', 'MALO', 'FUERA DE SERVICIO'],
    categoria_logica: 'Condición General'
  },
  {
    orden: 8,
    columna_excel: 'H',
    campo: 'mantenimiento_preventivo',
    titulo: 'Mantenimiento Preventivo',
    tipo_dato: 'texto',
    obligatorio: false,
    descripcion: 'Estatus del plan de mantenimiento preventivo y kilometraje.',
    valores_sugeridos: ['AL DIA', 'VENCIDO', 'PENDIENTE', 'NO APLICA'],
    categoria_logica: 'Condición General'
  },

  // 21 Componentes Mecánicos (I - AC)
  {
    orden: 9,
    columna_excel: 'I',
    campo: 'pastillas',
    titulo: 'Pastillas',
    tipo_dato: 'estado_componente',
    obligatorio: false,
    descripcion: 'Estado técnico del sistema de pastillas de freno.',
    valores_sugeridos: ['BUENO', 'REGULAR', 'MALO', 'N/A'],
    categoria_logica: 'Componentes Mecánicos'
  },
  {
    orden: 10,
    columna_excel: 'J',
    campo: 'bandas',
    titulo: 'Bandas',
    tipo_dato: 'estado_componente',
    obligatorio: false,
    descripcion: 'Estado técnico de las bandas de freno traseras/tambor.',
    valores_sugeridos: ['BUENO', 'REGULAR', 'MALO', 'N/A'],
    categoria_logica: 'Componentes Mecánicos'
  },
  {
    orden: 11,
    columna_excel: 'K',
    campo: 'bomba_freno',
    titulo: 'Bomba del Freno',
    tipo_dato: 'estado_componente',
    obligatorio: false,
    descripcion: 'Estado de la bomba principal / cilindro maestro del freno.',
    valores_sugeridos: ['BUENO', 'REGULAR', 'MALO', 'N/A'],
    categoria_logica: 'Componentes Mecánicos'
  },
  {
    orden: 12,
    columna_excel: 'L',
    campo: 'disco',
    titulo: 'Disco',
    tipo_dato: 'estado_componente',
    obligatorio: false,
    descripcion: 'Estado de los discos de freno delanteros/traseros.',
    valores_sugeridos: ['BUENO', 'REGULAR', 'MALO', 'N/A'],
    categoria_logica: 'Componentes Mecánicos'
  },
  {
    orden: 13,
    columna_excel: 'M',
    campo: 'plato',
    titulo: 'Plato',
    tipo_dato: 'estado_componente',
    obligatorio: false,
    descripcion: 'Estado del plato de presión de embrague (clutch).',
    valores_sugeridos: ['BUENO', 'REGULAR', 'MALO', 'N/A'],
    categoria_logica: 'Componentes Mecánicos'
  },
  {
    orden: 14,
    columna_excel: 'N',
    campo: 'collarin',
    titulo: 'Collarin',
    tipo_dato: 'estado_componente',
    obligatorio: false,
    descripcion: 'Estado del collarín de embrague / rodamiento de empuje.',
    valores_sugeridos: ['BUENO', 'REGULAR', 'MALO', 'N/A'],
    categoria_logica: 'Componentes Mecánicos'
  },
  {
    orden: 15,
    columna_excel: 'O',
    campo: 'bombin_superior',
    titulo: 'Bombin Superior',
    tipo_dato: 'estado_componente',
    obligatorio: false,
    descripcion: 'Estado del bombín superior de embrague.',
    valores_sugeridos: ['BUENO', 'REGULAR', 'MALO', 'N/A'],
    categoria_logica: 'Componentes Mecánicos'
  },
  {
    orden: 16,
    columna_excel: 'P',
    campo: 'bombin_inferior',
    titulo: 'Bombin Inferior',
    tipo_dato: 'estado_componente',
    obligatorio: false,
    descripcion: 'Estado del bombín inferior de embrague / cilindro esclavo.',
    valores_sugeridos: ['BUENO', 'REGULAR', 'MALO', 'N/A'],
    categoria_logica: 'Componentes Mecánicos'
  },
  {
    orden: 17,
    columna_excel: 'Q',
    campo: 'bateria',
    titulo: 'Batería',
    tipo_dato: 'estado_componente',
    obligatorio: false,
    descripcion: 'Estado operativo del acumulador eléctrico (batería instalada).',
    valores_sugeridos: ['BUENO', 'REGULAR', 'MALO', 'N/A'],
    categoria_logica: 'Componentes Mecánicos'
  },
  {
    orden: 18,
    columna_excel: 'R',
    campo: 'bobina',
    titulo: 'Bobina',
    tipo_dato: 'estado_componente',
    obligatorio: false,
    descripcion: 'Estado de las bobinas de encendido.',
    valores_sugeridos: ['BUENO', 'REGULAR', 'MALO', 'N/A'],
    categoria_logica: 'Componentes Mecánicos'
  },
  {
    orden: 19,
    columna_excel: 'S',
    campo: 'bujias',
    titulo: 'Bujías',
    tipo_dato: 'estado_componente',
    obligatorio: false,
    descripcion: 'Estado del juego de bujías o calentadores.',
    valores_sugeridos: ['BUENO', 'REGULAR', 'MALO', 'N/A'],
    categoria_logica: 'Componentes Mecánicos'
  },
  {
    orden: 20,
    columna_excel: 'T',
    campo: 'cauchos',
    titulo: 'Cauchos',
    tipo_dato: 'estado_componente',
    obligatorio: false,
    descripcion: 'Estado general del juego de neumáticos instalados.',
    valores_sugeridos: ['BUENO', 'REGULAR', 'MALO', 'N/A'],
    categoria_logica: 'Componentes Mecánicos'
  },
  {
    orden: 21,
    columna_excel: 'U',
    campo: 'correas_motor',
    titulo: 'Correas Motor',
    tipo_dato: 'estado_componente',
    obligatorio: false,
    descripcion: 'Estado de las correas de tiempo, alternador y accesorios.',
    valores_sugeridos: ['BUENO', 'REGULAR', 'MALO', 'N/A'],
    categoria_logica: 'Componentes Mecánicos'
  },
  {
    orden: 22,
    columna_excel: 'V',
    campo: 'luces_delanteras',
    titulo: 'Luces Delanteras',
    tipo_dato: 'estado_componente',
    obligatorio: false,
    descripcion: 'Estado de faros principales y luces exploradoras.',
    valores_sugeridos: ['BUENO', 'REGULAR', 'MALO', 'N/A'],
    categoria_logica: 'Componentes Mecánicos'
  },
  {
    orden: 23,
    columna_excel: 'W',
    campo: 'parabrisas',
    titulo: 'Parabrisas',
    tipo_dato: 'estado_componente',
    obligatorio: false,
    descripcion: 'Estado del cristal parabrisas (fisuras, astillado o íntegro).',
    valores_sugeridos: ['BUENO', 'REGULAR', 'MALO', 'N/A'],
    categoria_logica: 'Componentes Mecánicos'
  },
  {
    orden: 24,
    columna_excel: 'X',
    campo: 'tren_delantero',
    titulo: 'Tren delantero',
    tipo_dato: 'estado_componente',
    obligatorio: false,
    descripcion: 'Estado integral del tren delantero (terminales, muñones, rótulas).',
    valores_sugeridos: ['BUENO', 'REGULAR', 'MALO', 'N/A'],
    categoria_logica: 'Componentes Mecánicos'
  },
  {
    orden: 25,
    columna_excel: 'Y',
    campo: 'ballesta',
    titulo: 'Ballesta',
    tipo_dato: 'estado_componente',
    obligatorio: false,
    descripcion: 'Estado de las ballestas de suspensión trasera/delantera.',
    valores_sugeridos: ['BUENO', 'REGULAR', 'MALO', 'N/A'],
    categoria_logica: 'Componentes Mecánicos'
  },
  {
    orden: 26,
    columna_excel: 'Z',
    campo: 'crucetas',
    titulo: 'Crucetas',
    tipo_dato: 'estado_componente',
    obligatorio: false,
    descripcion: 'Estado de crucetas y cardán de transmisión.',
    valores_sugeridos: ['BUENO', 'REGULAR', 'MALO', 'N/A'],
    categoria_logica: 'Componentes Mecánicos'
  },
  {
    orden: 27,
    columna_excel: 'AA',
    campo: 'amortiguadores',
    titulo: 'Amortiguadores',
    tipo_dato: 'estado_componente',
    obligatorio: false,
    descripcion: 'Estado de los amortiguadores hidráulicos/gas.',
    valores_sugeridos: ['BUENO', 'REGULAR', 'MALO', 'N/A'],
    categoria_logica: 'Componentes Mecánicos'
  },
  {
    orden: 28,
    columna_excel: 'AB',
    campo: 'radiador',
    titulo: 'Radiador',
    tipo_dato: 'estado_componente',
    obligatorio: false,
    descripcion: 'Estado del radiador, serpentín y mangueras de enfriamiento.',
    valores_sugeridos: ['BUENO', 'REGULAR', 'MALO', 'N/A'],
    categoria_logica: 'Componentes Mecánicos'
  },
  {
    orden: 29,
    columna_excel: 'AC',
    campo: 'motor',
    titulo: 'Motor',
    tipo_dato: 'estado_componente',
    obligatorio: false,
    descripcion: 'Estado general del bloque de motor y compresión.',
    valores_sugeridos: ['BUENO', 'REGULAR', 'MALO', 'N/A'],
    categoria_logica: 'Componentes Mecánicos'
  },

  // Insumos y Repuestos (AD - AH)
  {
    orden: 30,
    columna_excel: 'AD',
    campo: 'cant_total_reparaciones',
    titulo: 'Cant. Total de reparaciones',
    tipo_dato: 'entero',
    obligatorio: false,
    descripcion: 'Cantidad total estimada de reparaciones o ítems críticos a intervenir.',
    ejemplo: '4',
    categoria_logica: 'Insumos y Repuestos'
  },
  {
    orden: 31,
    columna_excel: 'AE',
    campo: 'cant_cauchos',
    titulo: 'Cant. de cauchos',
    tipo_dato: 'entero',
    obligatorio: false,
    descripcion: 'Cantidad de neumáticos requeridos o a sustituir.',
    ejemplo: '4',
    categoria_logica: 'Insumos y Repuestos'
  },
  {
    orden: 32,
    columna_excel: 'AF',
    campo: 'medidas_caucho',
    titulo: 'Medidas del caucho',
    tipo_dato: 'texto',
    obligatorio: false,
    descripcion: 'Dimensión técnica del neumático según especificación de fábrica.',
    ejemplo: '265/70R16',
    catalogo_sugerido: 'Medidas de Cauchos',
    categoria_logica: 'Insumos y Repuestos'
  },
  {
    orden: 33,
    columna_excel: 'AG',
    campo: 'cantidad_baterias',
    titulo: 'Cantidad de Baterias',
    tipo_dato: 'entero',
    obligatorio: false,
    descripcion: 'Cantidad de acumuladores eléctricos que requiere el vehículo (1 para vehículos ligeros, 2 o más para camiones 24V).',
    ejemplo: '1',
    categoria_logica: 'Insumos y Repuestos'
  },
  {
    orden: 34,
    columna_excel: 'AH',
    campo: 'caracteristicas_bateria',
    titulo: 'Caracteristicas de la bateria',
    tipo_dato: 'texto',
    obligatorio: false,
    descripcion: 'Amperaje y tamaño de grupo BCI de la batería requerida.',
    ejemplo: '1100 AMP / 12V 34MR',
    catalogo_sugerido: 'Especificaciones de Batería',
    categoria_logica: 'Insumos y Repuestos'
  },

  // Trazabilidad de Recuperación y Gerencias (AI - AM)
  {
    orden: 35,
    columna_excel: 'AI',
    campo: 'vehiculo_recuperado',
    titulo: 'VEHICULO RECUPERADO (SI O NO)',
    tipo_dato: 'si_no',
    obligatorio: false,
    descripcion: 'Indica si el vehículo formó parte de un plan o jornada de recuperación.',
    valores_sugeridos: ['SI', 'NO'],
    categoria_logica: 'Recuperación y Gerencias'
  },
  {
    orden: 36,
    columna_excel: 'AJ',
    campo: 'fecha_recuperacion',
    titulo: 'FECHA DE RECUPERACIÓN',
    tipo_dato: 'fecha',
    obligatorio: false,
    descripcion: 'Fecha en la que fue culminada o formalizada la recuperación (DD/MM/AAAA).',
    ejemplo: '15/08/2024',
    categoria_logica: 'Recuperación y Gerencias'
  },
  {
    orden: 37,
    columna_excel: 'AK',
    campo: 'gerencia_origen',
    titulo: 'GERENCIA A LA CUAL PERTENECE ORIGINARIAMENTE EL VEHÍCULO',
    tipo_dato: 'texto',
    obligatorio: false,
    descripcion: 'Gerencia titular o propietaria originaria del activo automotor.',
    catalogo_sugerido: 'Gerencias de Origen',
    categoria_logica: 'Recuperación y Gerencias'
  },
  {
    orden: 38,
    columna_excel: 'AL',
    campo: 'vehiculo_otra_gerencia_devuelto',
    titulo: 'EL VEHÍCULO PERTENECIENTE A OTRA GERENCIA FUE DEVUELTO (SI o NO)',
    tipo_dato: 'si_no',
    obligatorio: false,
    descripcion: 'Indica si una unidad transferida temporalmente ya fue devuelta a su gerencia titular.',
    valores_sugeridos: ['SI', 'NO'],
    categoria_logica: 'Recuperación y Gerencias'
  },
  {
    orden: 39,
    columna_excel: 'AM',
    campo: 'fecha_entrega_gerencia_origen',
    titulo: 'FECHA DE ENTREGA A LA GERENCIA DE ORIGEN (DD/MM/AAAA)',
    tipo_dato: 'fecha',
    obligatorio: false,
    descripcion: 'Fecha formal del acta de entrega a la gerencia propietaria (DD/MM/AAAA).',
    ejemplo: '20/09/2024',
    categoria_logica: 'Recuperación y Gerencias'
  },

  // Observaciones y Prioridad (AN - AP)
  {
    orden: 40,
    columna_excel: 'AN',
    campo: 'observacion',
    titulo: 'OBSERVACIÓN',
    tipo_dato: 'texto',
    obligatorio: false,
    descripcion: 'Detalles operativos, faltantes mecánicos o notas de campo.',
    categoria_logica: 'Condición General'
  },
  {
    orden: 41,
    columna_excel: 'AO',
    campo: 'certificar_tipo_vehiculo',
    titulo: 'CERTIFICAR TIPO DE VEHÍCULO',
    tipo_dato: 'texto',
    obligatorio: false,
    descripcion: 'Verificación pericial del tipo de automotor (especializado vs estándar, ej. Cesta Aislada, Grúa Pluma, Chasis Cabina).',
    categoria_logica: 'Identificación'
  },
  {
    orden: 42,
    columna_excel: 'AP',
    campo: 'prioridad_recuperacion',
    titulo: 'PRIORIDAD DE RECUPERACIÓN (ALTA, MEDIA O BAJA)',
    tipo_dato: 'prioridad',
    obligatorio: false,
    descripcion: 'Nivel de urgencia operativa para reincorporar la unidad a la red eléctrica.',
    valores_sugeridos: ['ALTA', 'MEDIA', 'BAJA'],
    categoria_logica: 'Condición General'
  },

  // Custodia y Personal Responsable (AQ - AS)
  {
    orden: 43,
    columna_excel: 'AQ',
    campo: 'nombre_personal_responsable',
    titulo: 'NOMBRE DEL PERSONAL ASIGNADO RESPONSABLE',
    tipo_dato: 'texto',
    obligatorio: false,
    descripcion: 'Nombre y apellido del trabajador o chofer que tiene en custodia el vehículo.',
    ejemplo: 'Carlos Eduardo Mendoza',
    categoria_logica: 'Custodia y Responsable'
  },
  {
    orden: 44,
    columna_excel: 'AR',
    campo: 'cedula_personal_responsable',
    titulo: 'N° DE C.I. DEL  PERSONAL ASIGNADO RESPONSABLE',
    tipo_dato: 'cedula',
    obligatorio: false,
    descripcion: 'Cédula de identidad del trabajador responsable (ej. V-14892301).',
    ejemplo: 'V-14892301',
    categoria_logica: 'Custodia y Responsable'
  },
  {
    orden: 45,
    columna_excel: 'AS',
    campo: 'telefono_personal_responsable',
    titulo: 'TELÉFONO DE CONTACTO DEL PERSONAL ASIGNADO RESPONSABLE',
    tipo_dato: 'telefono',
    obligatorio: false,
    descripcion: 'Número de teléfono móvil o corporativo para contacto operativo.',
    ejemplo: '0414-1234567',
    categoria_logica: 'Custodia y Responsable'
  }
];

export const VALIDATION_RULES_LIST = [
  {
    id: 'R1',
    titulo: 'Inmutabilidad del Encabezado (A:AS)',
    descripcion: 'No modificar la fila de encabezados ni alterar el orden estricto de las columnas 1 a 45 (A a AS) para garantizar compatibilidad con macros y sistemas centrales.',
    tipo: 'Estructural'
  },
  {
    id: 'R2',
    titulo: 'Unicidad del Número de Vehículo (Columna B)',
    descripcion: 'La columna B "Número de Vehículo" actúa como Clave Primaria (Primary Key). Debe ser obligatoria, no vacía y sin duplicados en toda la base de datos.',
    tipo: 'Integridad'
  },
  {
    id: 'R3',
    titulo: 'Dominio de Componentes Mecánicos (Cols I a AC)',
    descripcion: 'Las 21 columnas de diagnóstico técnico solo admiten los 4 valores discretos: BUENO, REGULAR, MALO, N/A en mayúsculas sostenidas.',
    tipo: 'Dominio de Datos'
  },
  {
    id: 'R4',
    titulo: 'Normalización Booleana SI / NO (Cols AI, AL)',
    descripcion: 'Los campos indicadores solo aceptan exactamente "SI" o "NO". Se deben rechazar variantes como "si", "s", "yes", "true" o "X".',
    tipo: 'Dominio de Datos'
  },
  {
    id: 'R5',
    titulo: 'Consistencia de Fechas (Cols AJ, AM)',
    descripcion: 'Las fechas deben registrarse en formato DD/MM/AAAA. Si "VEHICULO RECUPERADO" = NO, no debe exigirse fecha de recuperación.',
    tipo: 'Lógica de Negocio'
  },
  {
    id: 'R6',
    titulo: 'Valores Numéricos Enteros >= 0 (Cols AD, AE, AG)',
    descripcion: 'Las cantidades de reparaciones, cauchos y baterías deben ser números enteros no negativos. No se admiten decimales ni texto descriptivo en estas columnas.',
    tipo: 'Tipo de Dato'
  },
  {
    id: 'R7',
    titulo: 'Estandarización de Identidad (Cédula y Teléfono)',
    descripcion: 'La cédula debe normalizarse a formato nacional (ej. V-12345678 o E-12345678) y el teléfono a 11 dígitos o formato estándar internacional.',
    tipo: 'Formato'
  },
  {
    id: 'R8',
    titulo: 'Alimentación por Catálogos Maestros (Cols C, D, E, F, AF, AK)',
    descripcion: 'Para evitar inconsistencias tipográficas (ej. "TOYOTA" vs "Toyota" vs "Toyotta"), estos campos deben ser alimentados exclusivamente por catálogos parametrizables.',
    tipo: 'Arquitectura'
  },
  {
    id: 'R9',
    titulo: 'Integridad Referencial de Llaves Foráneas (Región -> Estado -> Centros de Servicios)',
    descripcion: 'Las Regiones determinan estrictamente a los Estados mediante Llave Foránea (region_id). No se permite asignar estados de regiones distintas. A su vez, los Centros de Servicios (cat_centros_servicios) dependen jerárquicamente del Estado (estado_id) y la Región (region_id).',
    tipo: 'Integridad Relacional'
  }
];
