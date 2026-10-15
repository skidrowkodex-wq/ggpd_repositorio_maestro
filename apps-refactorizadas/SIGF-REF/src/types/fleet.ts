export type ComponentStatus = 'BUENO' | 'REGULAR' | 'MALO' | 'N/A';
export type VehicleGeneralStatus = 'ACTIVO' | 'INACTIVO' | 'EN MANTENIMIENTO' | 'FUERA DE SERVICIO' | 'RECUPERADO';
export type CurrentCondition = 'BUENO' | 'REGULAR' | 'MALO' | 'FUERA DE SERVICIO';
export type PreventiveMaintenance = 'AL DIA' | 'VENCIDO' | 'PENDIENTE' | 'NO APLICA';
export type YesNo = 'SI' | 'NO';
export type PriorityLevel = 'ALTA' | 'MEDIA' | 'BAJA';

export interface VehicleRecord {
  id: string; // Internal UUID
  // Col A (1)
  estado: VehicleGeneralStatus;
  // Col B (2) - Unique Key
  numero_vehiculo: string;
  // Placa del Vehículo
  placa?: string;
  // Col C (3)
  marca_vehiculo: string;
  // Modelo del Vehículo
  modelo_vehiculo?: string;
  // Col D (4)
  tipo_vehiculo: string;
  // Col E (5)
  unidad_asignada: string;
  // Col F (6)
  centro_servicios: string;
  // Col G (7)
  condicion_actual: CurrentCondition;
  // Col H (8)
  mantenimiento_preventivo: PreventiveMaintenance;

  // 21 Componentes Mecánicos / Eléctricos (Cols I - AC, 9 - 29)
  pastillas: ComponentStatus;
  bandas: ComponentStatus;
  bomba_freno: ComponentStatus;
  disco: ComponentStatus;
  plato: ComponentStatus;
  collarin: ComponentStatus;
  bombin_superior: ComponentStatus;
  bombin_inferior: ComponentStatus;
  bateria: ComponentStatus;
  bobina: ComponentStatus;
  bujias: ComponentStatus;
  cauchos: ComponentStatus;
  correas_motor: ComponentStatus;
  luces_delanteras: ComponentStatus;
  parabrisas: ComponentStatus;
  tren_delantero: ComponentStatus;
  ballesta: ComponentStatus;
  crucetas: ComponentStatus;
  amortiguadores: ComponentStatus;
  radiador: ComponentStatus;
  motor: ComponentStatus;

  // Insumos y Repuestos (Cols AD - AH, 30 - 34)
  cant_total_reparaciones: number;
  cant_cauchos: number;
  medidas_caucho: string;
  cantidad_baterias: number;
  caracteristicas_bateria: string;

  // Trazabilidad de Recuperación y Gerencias (Cols AI - AM, 35 - 39)
  vehiculo_recuperado: YesNo;
  fecha_recuperacion: string; // DD/MM/AAAA
  gerencia_origen: string;
  vehiculo_otra_gerencia_devuelto: YesNo;
  fecha_entrega_gerencia_origen: string; // DD/MM/AAAA

  // Observaciones y Prioridad (Cols AN - AP, 40 - 42)
  observacion: string;
  certificar_tipo_vehiculo: string;
  prioridad_recuperacion: PriorityLevel;

  // Personal Asignado Responsable (Cols AQ - AS, 43 - 45)
  nombre_personal_responsable: string;
  cedula_personal_responsable: string; // V-12345678
  telefono_personal_responsable: string;

  // Registro fotográfico (al menos 3 fotos)
  fotos_vehiculo?: string[];

  // Ubicación Territorial Venezuela y Correlativo Automático
  region?: string;
  estado_venezuela?: string;
  correlativo_carga?: string;

  // Metadatos de auditoría del sistema
  fecha_registro?: string;
  ultima_actualizacion?: string;
}

export interface ColumnDefinition {
  orden: number;
  columna_excel: string; // A .. AS
  campo: keyof VehicleRecord;
  titulo: string;
  tipo_dato: 'texto' | 'entero' | 'fecha' | 'si_no' | 'estado_componente' | 'prioridad' | 'telefono' | 'cedula';
  obligatorio: boolean;
  unico?: boolean;
  descripcion: string;
  ejemplo?: string;
  valores_sugeridos?: string[];
  catalogo_sugerido?: string; // Nombre del catálogo maestro que debe alimentar este campo
  categoria_logica: 'Identificación' | 'Ubicación' | 'Condición General' | 'Componentes Mecánicos' | 'Insumos y Repuestos' | 'Recuperación y Gerencias' | 'Custodia y Responsable';
}

export interface MasterCatalogItem {
  id: string;
  nombre: string;
  descripcion?: string;
  activo: boolean;
  adicional?: string;
  // Llaves foráneas para integridad relacional dependiente
  region_id?: string;
  region_nombre?: string;
  estado_id?: string;
  estado_nombre?: string;
  codigo?: string;
  tipo?: string;
  marca?: string;
}

export interface CentroServicioItem extends MasterCatalogItem {
  codigo?: string;
  estado_id: string; // Foreign Key -> VenezuelanState.id
  estado_nombre: string;
  region_id: string; // Foreign Key -> VenezuelanRegion.id
  region_nombre: string;
  municipio?: string;
  tipo?: string;
}

export interface MasterCatalogsState {
  marcas: MasterCatalogItem[];
  modelos: MasterCatalogItem[];
  tipos_vehiculo: MasterCatalogItem[];
  gerencias: MasterCatalogItem[];
  centros_servicios: (MasterCatalogItem | CentroServicioItem)[];
  unidades_asignadas: MasterCatalogItem[];
  medidas_cauchos: MasterCatalogItem[];
  caracteristicas_baterias: MasterCatalogItem[];
  regiones?: MasterCatalogItem[];
}

export interface ValidationErrorItem {
  fila?: number;
  vehiculo?: string;
  columna_excel: string;
  campo: string;
  mensaje: string;
  tipo: 'error' | 'advertencia';
  valor_actual: any;
}

export interface IngestionValidationResult {
  total_filas: number;
  filas_validas: number;
  filas_con_errores: number;
  errores: ValidationErrorItem[];
  registros_procesados: Partial<VehicleRecord>[];
}
