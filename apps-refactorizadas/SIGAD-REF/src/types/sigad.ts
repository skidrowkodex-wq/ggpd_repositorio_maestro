// ==============================================================================
// ⚡ CORPOELEC - SIGAD: Tipos y Modelos de Datos del Sistema de Gestión de Activos
// ==============================================================================

export type TipoInstalacion = 
  | 'SUBESTACION DISTRIBUCION' 
  | 'SUBESTACION TRANSMISION' 
  | 'SUBESTACION MOVIL PERMANENTE';

export type EstadoOperativo = 
  | 'EN_SERVICIO' 
  | 'INDISPONIBLE_FALLADO' 
  | 'EN_OBSERVACION' 
  | 'NO_INSTALADO';

export type TipoBahia = 
  | 'TRANSFORMACION_AT' 
  | 'BARRAS_MT' 
  | 'CIRCUITO_SALIDA' 
  | 'SERVICIOS_AUXILIARES' 
  | 'INFRAESTRUCTURA_CIVIL';

export type TipoElementoPatio =
  | 'TRANSFORMADOR_POTENCIA'
  | 'DISYUNTOR_POTENCIA'
  | 'SECCIONADOR'
  | 'TRANSFORMADOR_CORRIENTE_TC'
  | 'TRANSFORMADOR_POTENCIAL_TP'
  | 'PARARRAYOS'
  | 'JUEGO_BARRAS'
  | 'RECONECTADOR'
  | 'BANCO_CONDENSADORES'
  | 'BANCO_BATERIAS_DC'
  | 'RECTIFICADOR_CARGADOR'
  | 'TRANSFORMADOR_SSAA'
  | 'PLANTA_EMERGENCIA'
  | 'MALLA_PUESTA_TIERRA'
  | 'GRAVA_PIEDRA_PICADA'
  | 'CERCADO_PERIMETRAL';

export interface SubestacionMaster {
  codigo: string;              // e.g. 'SE-TAC-0685'
  nombre_se: string;           // e.g. 'SAN CRISTOBAL'
  nombre?: string;
  nombre_se_norm?: string;
  estado: string;              // e.g. 'TACHIRA'
  region: string;              // e.g. 'LOS ANDES'
  municipio?: string;
  tipo_instalacion: string;
  macro_proceso?: string;
  atendida_por?: string;
  es_movil: boolean;
  tension_entrada_kv?: number | null;
  tension_secundaria_kv?: number | null;
  tension_alimentador_kv?: number | null;
  alimentador_principal?: string | null;
  area_se_m2?: number | null;
  capacidad_mva_instalada?: number;
  circuitos_asociados?: CircuitoMaster[];
}

export interface CircuitoMaster {
  codigo: string;              // e.g. 'CT-TAC-03120'
  nombre_circuito: string;     // e.g. 'PUEBLO NUEVO'
  circuito?: string;
  nombre_ct_norm?: string;
  se_codigo: string;           // 'SE-TAC-0685'
  subestacion_cabecera?: string;
  estado: string;
  region: string;
  nivel_tension_kv: number;    // e.g. 13.8
  longitud_km: number;
  km_total?: number;
  tipo_red?: string;           // 'AÉREO' | 'SUBTERRÁNEO'
  elemento_tipo?: string;
  elemento_tecnico_especifico?: string;
  codigo_maniobra_norma?: string;
  es_componente_patio?: boolean;
  es_cliente_privado?: boolean;
}

export interface ComponentFaultEvent {
  id: string;
  fecha_evento: string;
  tipo_evento: 'FALLA_DECLARADA' | 'RESTABLECIMIENTO_SERVICIO' | 'INSPECCION_TECNICA';
  causa: string;
  descripcion: string;
  registrado_por: string;
  es_reemplazo_nuevo?: boolean;
  serial_anterior?: string;
  serial_nuevo?: string;
  capacidad_nueva_mva?: number;
  sincronizado_scein?: boolean;
}

export interface ComponentePatio {
  id: string;
  bahia_id: string;
  se_codigo: string;
  circuito_codigo?: string;
  codigo_norma: string;         // 'TR-1', 'D1', 'S1', 'B1', 'TC1', 'TP1', 'REC-1', 'BAT-1'
  nombre_equipo: string;
  tipo_elemento: TipoElementoPatio;
  estado_operativo: EstadoOperativo;
  tension_kv: number;
  capacidad_mva?: number;
  fabricante?: string;
  modelo?: string;
  serial?: string;
  anio_instalacion?: number;
  nivel_aceite?: 'NORMAL' | 'BAJO' | 'CRITICO' | 'N/A';
  tecnologia_corte?: 'SF6' | 'VACIO' | 'ACEITE' | 'AIRE';
  presion_sf6_bar?: number;
  alarma_activa?: boolean;
  observaciones?: string;
  historial_eventos?: ComponentFaultEvent[];
}

export interface BahiaPatio {
  id: string;
  se_codigo: string;
  nombre_bahia: string;        // 'Bahía de Transformación AT 1 (TR-1 115/13.8 kV)'
  tipo_bahia: TipoBahia;
  tension_kv: number;
  orden: number;
  componentes: ComponentePatio[];
}

export interface SubestacionEstructura {
  se_codigo: string;
  ultima_actualizacion: string;
  bahias: BahiaPatio[];
}
