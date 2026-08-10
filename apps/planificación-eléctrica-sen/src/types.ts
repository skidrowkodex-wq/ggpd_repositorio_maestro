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
  codigo_asignacion: string;
  responsable: string;
  cargo: string;
  destino: string;
  monto_asignado_bs: number;
  monto_ejecutado_bs: number;
  tipo_cierre: 'RENDICION_NORMAL' | 'REINTEGRO' | 'REEMBOLSO' | 'EXCEPCIONAL';
  estado: 'PENDIENTE' | 'APROBADO' | 'COMPLETADO' | 'EXCEPCIONAL';
  origen_fondos: string;
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
  ente_cofinanciador: 'RECURSOS_PROPIOS' | 'GOBERNACION' | 'ALCALDIA' | 'CONVENIO_LOCAL';
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

