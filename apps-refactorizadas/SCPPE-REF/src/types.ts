export type RolUsuario = 'ADMINISTRADOR' | 'ESPECIALISTA' | 'ANALISTA';

export interface UserProfile {
  id: string;
  username: string;
  nombre: string;
  email: string;
  rol: RolUsuario;
  cargo: string;
  gerencia: string;
}

export type TipoOrganizacionSector = 'ELECTRICO' | 'PUBLICO_NACIONAL' | 'REGIONAL_MUNICIPAL' | 'COMUNAL' | 'OTRO';

export interface TipoOrganizacion {
  id: string;
  nombre: string;
  nivel_jerarquico: number;
  sector: TipoOrganizacionSector;
}

export interface OrganizacionNodo {
  id: string;
  parent_id?: string | null;
  organizacion_padre_nombre?: string;
  organizacion_padre_siglas?: string;
  tipo_id: string;
  tipo_nombre?: string;
  nivel_jerarquico?: number;
  sector?: TipoOrganizacionSector;
  codigo_siglas: string;
  nombre_oficial: string;
  rif?: string;
  codigo_estado?: string;
  nombre_estado?: string;
  codigo_region?: string;
  nombre_region?: string;
  titular_nombre?: string;
  titular_cargo?: string;
  titular_email?: string;
  es_tenant_activo?: boolean;
  activo?: boolean;
}

export type TipoActivoElectrico =
  | 'SUBESTACION_POTENCIA'
  | 'LINEA_DISTRIBUCION_AEREA'
  | 'CIRCUITO_SUBTERRANEO'
  | 'BANCO_TRANSFORMACION_CT'
  | 'PROTECCION_Y_SECCIONAMIENTO';

export type NivelTensionNormalizado =
  | '765 kV'
  | '400 kV'
  | '230 kV'
  | '115 kV'
  | '34.5 kV'
  | '13.8 kV'
  | '4.16 kV'
  | '208/120 V';

export interface PartidaAPU {
  codigo: string;
  partida_onapre: string;
  descripcion: string;
  unidad: string;
  costo_unitario_usd: number;
  desglose: {
    materiales_pct: number;
    equipos_pct: number;
    mano_obra_pct: number;
  };
  rendimiento_diario?: string;
}

export interface ComputoMetricoProyecto {
  partida_codigo: string;
  partida_descripcion: string;
  unidad: string;
  cantidad: number;
  precio_unitario_usd: number;
  subtotal_usd: number;
}

export interface ComprobanteFiscalViatico {
  id: string;
  asignacion_id: string;
  rif_proveedor: string;
  razon_social: string;
  numero_factura: string;
  numero_control: string;
  fecha_emision: string;
  concepto: 'HOSPEDAJE' | 'ALIMENTACION' | 'TRANSPORTE' | 'COMBUSTIBLE' | 'PEAJE' | 'OTRO';
  monto_bs: number;
  monto_usd?: number;
  valido_seniat: boolean;
}

export interface ProyectoPRTSEN {
  id: string;
  codigo_rds: string;
  nombre: string;
  dimension: 'SUBESTACION' | 'CIRCUITO' | 'ESTADAL' | 'PLANTA';
  region: string;
  estado: string;
  subestacion_asociada?: string;
  circuito_asociado?: string;
  monto_usd: number;
  avance_fisico_pct: number;
  avance_financiero_pct: number;
  estatus: 'EN_EJECUCION' | 'FORMULACION' | 'PARALIZADO' | 'COMPLETADO';
  vinculado_poa: boolean;
  codigo_sipes?: string;
  accion_poa_codigo?: string;
  accion_poa_nombre?: string;
  match_metodo: 'EXACTO' | 'FUZZY' | 'SIN_MATCH';
  unidad_ejecutora_id?: string;
  unidad_ejecutora_nombre?: string;
  unidad_ejecutora_siglas?: string;
  ente_financiador_id?: string;
  ente_financiador_nombre?: string;
  ente_financiador_siglas?: string;
  alcance?: string;
  impacto_sen?: string;
  situacion_actual?: string;
  municipio?: string;
  direccion?: string;
  nivel_tension_kv?: string;
  tiempo_ejecucion_meses?: number;
  capacidad_o_km?: string;
  unidad_capacidad?: string;
  familias_beneficiadas?: string;
  desembolsos_plurianual?: Record<string, number>;
  observaciones?: string;
  fotografia_url?: string;

  // Extensiones de Ingeniería Eléctrica de Grado Industrial
  tipo_activo?: TipoActivoElectrico;
  tension_nominal_kv?: NivelTensionNormalizado;
  capacidad_mva?: number;
  tipo_conductor?: string;
  longitud_km?: number;
  icc_ka?: number;
  delta_v_pct?: number;
  factor_potencia?: number;
  criticidad_tecnica?: 'CRITICA_SOBRECARGA' | 'ALTA_REGULACION' | 'MEDIA' | 'NORMAL';

  // Extensiones de Presupuesto por Cómputos Métricos y APU
  computos_apu?: ComputoMetricoProyecto[];
  monto_calculado_apu_usd?: number;
  tasa_bcv_referencia?: number;
}

export interface SubestacionRDS {
  id: string;
  codigo_rds: string; // Ej: =VE+TACHIRA-LA PEDRERA
  nombre: string;
  estado: string;
  region: string;
  origen: 'CARACTERIZACION SE DISTRIBUCION' | 'CARACTERIZACION DE CT';
  tipo: 'DISTRIBUCION' | 'TRANSMISION' | 'GENERACION';
  circuitos_count: number;
}

export interface CircuitoRDS {
  id: string;
  codigo_rds: string; // Ej: =VE+TACHIRA-LA PEDRERA:D-105 CANO TIGRE
  nombre: string;
  subestacion_id: string;
  subestacion_nombre: string;
  estado: string;
  designador: string; // Ej: D-105, B-305
  voltaje: string; // Ej: 13.8 kV, 34.5 kV
}

export interface AccionPOA {
  id: string;
  codigo: string;
  nombre: string;
  unidad_ejecutora: string;
  unidad_ejecutora_id?: string;
  unidad_ejecutora_siglas?: string;
  ponderacion: number;
  presupuesto_asignado_bs: number;
  presupuesto_ejecutado_bs: number;
  meta_fisica_programada: number;
  meta_fisica_ejecutada: number;
  unidad_medida: string;
}

export interface RegistroAuditoria {
  id: string;
  fecha: string;
  usuario: string;
  esquema: 'samc' | 'maestro' | 'prtsen' | 'audit';
  tabla: string;
  accion: 'INSERT' | 'UPDATE' | 'DELETE';
  detalles: string;
  cumplimiento_iso: 'ISO_27001' | 'ISO_8000';
}

export type AuditLog = RegistroAuditoria;

export interface ViaticoControl {
  id: string;
  numero_solicitud: string;
  empleado_nombre: string;
  empleado_cedula: string;
  destino: string;
  fecha_inicio: string;
  fecha_fin: string;
  dias_duracion: number;
  monto_calculado_usd: number;
  monto_calculado_bs: number;
  estatus_flujo: 'PENDIENTE' | 'APROBADO' | 'COMPLETADO' | 'ANULADO' | 'RECHAZADO';
  motivo_comision?: string;
  proyecto_asociado_id?: string;
  proyecto_asociado_nombre?: string;
  unidad_solicitante_id?: string;
  gerencia_emisora_id?: string;
}

export interface ConciliacionPresupuestaria {
  partida_codigo: string;
  partida_nombre: string;
  presupuesto_partida: number;
  presupuesto_viatico: number;
  total_asignado: number;
  saldo_disponible: number;
  total_ejecutado: number;
  porcentaje_comprometido: number;
  estado_conciliacion: 'CONCILIADO_NORMAL' | 'ALERTA_EXCESO' | 'PRESUPUESTO_AGOTADO';
  trigger_activo: boolean;
}

export interface ProyectoGGD {
  id: string;
  codigo_convenio: string;
  nombre: string;
  ente_cofinanciador: string;
  ente_cofinanciador_id?: string;
  ente_cofinanciador_nombre?: string;
  ente_cofinanciador_siglas?: string;
  ente_cofinanciador_tipo?: string;
  gerencia_responsable_id?: string;
  gerencia_responsable_nombre?: string;
  gerencia_responsable_siglas?: string;
  ente_nombre: string;
  estado: string;
  region: string;
  monto_estimado_bs: number;
  monto_estimado_usd: number;
  avance_fisico_pct: number;
  estatus_gestion: 'DESCENTRALIZADO_GGD' | 'EN_REVISION_PLANIFICACION' | 'NORMALIZADO_POA_PRTSEN';
  fecha_registro: string;
  responsable_ggd: string;
  observaciones?: string;
}
