import { supabase, isSupabaseConfigured } from '../lib/supabase';
import {
  ProyectoPRTSEN,
  SubestacionRDS,
  CircuitoRDS,
  AccionPOA,
  RegistroAuditoria,
  ViaticoControl,
  ConciliacionPresupuestaria,
  ProyectoGGD,
  OrganizacionNodo,
  PartidaAPU,
  ComputoMetricoProyecto,
  ComprobanteFiscalViatico,
} from '../types';
import {
  CATALOGO_PARTIDAS_APU_SEN,
  TASA_BCV_OFICIAL,
  TABULADOR_VIATICOS_CORPOELEC_2026,
} from '../data/mockData';

export interface DataFetchResult<T> {
  data: T[];
  isFromSupabase: boolean;
  error?: string;
}

// ----------------------------------------------------
// PROYECTOS PRTSEN (Plan de Recuperación y Transformación SEN)
// ----------------------------------------------------
export async function getProyectosPRTSEN(): Promise<DataFetchResult<ProyectoPRTSEN>> {
  if (!isSupabaseConfigured || !supabase) {
    return { data: [], isFromSupabase: false, error: 'InsForge no configurado' };
  }

  try {
    const { data, error } = await supabase
      .from('v_scppe_proyectos_prtsen')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return { data: [], isFromSupabase: false, error: error.message };
    }

    if (!data || data.length === 0) {
      return { data: [], isFromSupabase: true };
    }

    const mapped: ProyectoPRTSEN[] = data.map((p: any) => ({
      id: p.id,
      codigo_rds: p.codigo_rds || p.codigo || '=VE+PRTSEN-001',
      nombre: p.nombre || p.descripcion || 'Proyecto PRTSEN',
      dimension: (p.dimension || 'SUBESTACION') as any,
      region: p.nombre_region || p.region || p.codigo_region || 'LOS ANDES',
      estado: p.nombre_estado || p.estado || p.codigo_estado || 'TACHIRA',
      subestacion_asociada: p.subestacion_asociada,
      circuito_asociado: p.circuito_asociado,
      monto_usd: Number(p.monto_usd || p.presupuesto_usd || 0),
      avance_fisico_pct: Number(p.avance_fisico_pct || 0),
      avance_financiero_pct: Number(p.avance_financiero_pct || 0),
      estatus: (p.estatus || 'EN_EJECUCION') as any,
      vinculado_poa: Boolean(p.vinculado_poa),
      codigo_sipes: p.codigo_sipes,
      accion_poa_codigo: p.accion_poa_codigo,
      accion_poa_nombre: p.accion_poa_nombre,
      match_metodo: (p.match_metodo || 'EXACTO') as any,
      unidad_ejecutora_id: p.unidad_ejecutora_id,
      unidad_ejecutora_nombre: p.unidad_ejecutora_nombre,
      unidad_ejecutora_siglas: p.unidad_ejecutora_siglas,
      ente_financiador_id: p.ente_financiador_id,
      ente_financiador_nombre: p.ente_financiador_nombre,
      ente_financiador_siglas: p.ente_financiador_siglas,
      alcance: p.alcance,
      impacto_sen: p.impacto_sen,
      situacion_actual: p.situacion_actual,
      municipio: p.municipio,
      direccion: p.direccion,
      nivel_tension_kv: p.nivel_tension_kv,
      tiempo_ejecucion_meses: p.tiempo_ejecucion_meses,
      capacidad_o_km: p.capacidad_o_km,
      unidad_capacidad: p.unidad_capacidad,
      familias_beneficiadas: p.familias_beneficiadas,
      desembolsos_plurianual: p.desembolsos_plurianual,
      observaciones: p.observaciones,
      fotografia_url: p.fotografia_url,

      // Atributos de Ingeniería Eléctrica
      tipo_activo: p.tipo_activo,
      tension_nominal_kv: p.tension_nominal_kv,
      capacidad_mva: p.capacidad_mva ? Number(p.capacidad_mva) : undefined,
      tipo_conductor: p.tipo_conductor,
      longitud_km: p.longitud_km ? Number(p.longitud_km) : undefined,
      icc_ka: p.icc_ka ? Number(p.icc_ka) : undefined,
      delta_v_pct: p.delta_v_pct ? Number(p.delta_v_pct) : undefined,
      factor_potencia: p.factor_potencia ? Number(p.factor_potencia) : undefined,
      criticidad_tecnica: p.criticidad_tecnica,

      // Atributos de Cómputos Métricos y APU
      computos_apu: p.computos_apu,
      monto_calculado_apu_usd: p.monto_calculado_apu_usd ? Number(p.monto_calculado_apu_usd) : undefined,
      tasa_bcv_referencia: p.tasa_bcv_referencia ? Number(p.tasa_bcv_referencia) : TASA_BCV_OFICIAL,
    }));

    return { data: mapped, isFromSupabase: true };
  } catch (err: any) {
    return { data: [], isFromSupabase: false, error: err.message };
  }
}

export async function createProyectoPRTSEN(
  proyecto: Omit<ProyectoPRTSEN, 'id'>
): Promise<{ success: boolean; data?: ProyectoPRTSEN; error?: string }> {
  if (!isSupabaseConfigured || !supabase) {
    return { success: false, error: 'InsForge no configurado' };
  }

  try {
    const newId = `prt-${Date.now()}`;
    const payload = {
      id: newId,
      codigo: proyecto.codigo_rds,
      codigo_rds: proyecto.codigo_rds,
      nombre: proyecto.nombre,
      dimension: proyecto.dimension,
      codigo_region: proyecto.region || 'ANDES',
      codigo_estado: proyecto.estado ? proyecto.estado.substring(0, 3).toUpperCase() : 'TAC',
      subestacion_asociada: proyecto.subestacion_asociada,
      circuito_asociado: proyecto.circuito_asociado,
      monto_usd: proyecto.monto_usd,
      avance_fisico_pct: proyecto.avance_fisico_pct || 0,
      avance_financiero_pct: proyecto.avance_financiero_pct || 0,
      estatus: proyecto.estatus || 'FORMULACION',
      vinculado_poa: proyecto.vinculado_poa || false,
      codigo_sipes: proyecto.codigo_sipes,
      accion_poa_codigo: proyecto.accion_poa_codigo,
      match_metodo: proyecto.match_metodo || 'EXACTO',
      unidad_ejecutora_id: proyecto.unidad_ejecutora_id || 'GGPD_DIV_PLANIF',
      ente_financiador_id: proyecto.ente_financiador_id || 'MPPEE',
      alcance: proyecto.alcance,
      impacto_sen: proyecto.impacto_sen,
      situacion_actual: proyecto.situacion_actual,
      municipio: proyecto.municipio,
      direccion: proyecto.direccion,
      nivel_tension_kv: proyecto.nivel_tension_kv,
      tiempo_ejecucion_meses: proyecto.tiempo_ejecucion_meses,
      capacidad_o_km: proyecto.capacidad_o_km,
      unidad_capacidad: proyecto.unidad_capacidad,
      familias_beneficiadas: proyecto.familias_beneficiadas,
      desembolsos_plurianual: proyecto.desembolsos_plurianual,
      observaciones: proyecto.observaciones,
      fotografia_url: proyecto.fotografia_url,
    };

    const { data, error } = await supabase
      .from('mae_proyectos_especiales')
      .insert([payload])
      .select();

    if (error) {
      return { success: false, error: error.message };
    }

    const created: ProyectoPRTSEN = {
      ...proyecto,
      id: newId,
    };
    return { success: true, data: (data && data[0]) ? (data[0] as unknown as ProyectoPRTSEN) : created };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function vincularProyectoPRTSEN(
  proyectoId: string,
  accionPoaCodigo: string,
  accionPoaNombre?: string
): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured || !supabase) {
    return { success: false, error: 'InsForge no configurado' };
  }

  try {
    const sipesCode = `SIPES-${accionPoaCodigo}`;
    const { error } = await supabase
      .from('mae_proyectos_especiales')
      .update({
        vinculado_poa: true,
        codigo_sipes: sipesCode,
        accion_poa_codigo: accionPoaCodigo,
        match_metodo: 'EXACTO',
      })
      .eq('id', proyectoId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function updateProyectoPRTSEN(
  id: string,
  updates: Partial<ProyectoPRTSEN>
): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured || !supabase) {
    return { success: false, error: 'InsForge no configurado' };
  }

  try {
    const payload: any = {};
    if (updates.nombre !== undefined) payload.nombre = updates.nombre;
    if (updates.codigo_rds !== undefined) payload.codigo_rds = updates.codigo_rds;
    if (updates.dimension !== undefined) payload.dimension = updates.dimension;
    if (updates.subestacion_asociada !== undefined) payload.subestacion_asociada = updates.subestacion_asociada;
    if (updates.circuito_asociado !== undefined) payload.circuito_asociado = updates.circuito_asociado;
    if (updates.monto_usd !== undefined) payload.monto_usd = updates.monto_usd;
    if (updates.avance_fisico_pct !== undefined) payload.avance_fisico_pct = updates.avance_fisico_pct;
    if (updates.avance_financiero_pct !== undefined) payload.avance_financiero_pct = updates.avance_financiero_pct;
    if (updates.estatus !== undefined) payload.estatus = updates.estatus;
    if (updates.match_metodo !== undefined) payload.match_metodo = updates.match_metodo;
    if (updates.vinculado_poa !== undefined) payload.vinculado_poa = updates.vinculado_poa;
    if (updates.accion_poa_codigo !== undefined) {
      payload.accion_poa_codigo = updates.accion_poa_codigo;
      payload.codigo_sipes = `SIPES-${updates.accion_poa_codigo}`;
    }
    if (updates.alcance !== undefined) payload.alcance = updates.alcance;
    if (updates.impacto_sen !== undefined) payload.impacto_sen = updates.impacto_sen;
    if (updates.situacion_actual !== undefined) payload.situacion_actual = updates.situacion_actual;
    if (updates.municipio !== undefined) payload.municipio = updates.municipio;
    if (updates.direccion !== undefined) payload.direccion = updates.direccion;
    if (updates.nivel_tension_kv !== undefined) payload.nivel_tension_kv = updates.nivel_tension_kv;
    if (updates.tiempo_ejecucion_meses !== undefined) payload.tiempo_ejecucion_meses = updates.tiempo_ejecucion_meses;
    if (updates.capacidad_o_km !== undefined) payload.capacidad_o_km = updates.capacidad_o_km;
    if (updates.unidad_capacidad !== undefined) payload.unidad_capacidad = updates.unidad_capacidad;
    if (updates.familias_beneficiadas !== undefined) payload.familias_beneficiadas = updates.familias_beneficiadas;
    if (updates.desembolsos_plurianual !== undefined) payload.desembolsos_plurianual = updates.desembolsos_plurianual;
    if (updates.observaciones !== undefined) payload.observaciones = updates.observaciones;
    if (updates.fotografia_url !== undefined) payload.fotografia_url = updates.fotografia_url;

    // Atributos de Ingeniería Eléctrica
    if (updates.tipo_activo !== undefined) payload.tipo_activo = updates.tipo_activo;
    if (updates.tension_nominal_kv !== undefined) payload.tension_nominal_kv = updates.tension_nominal_kv;
    if (updates.capacidad_mva !== undefined) payload.capacidad_mva = updates.capacidad_mva;
    if (updates.tipo_conductor !== undefined) payload.tipo_conductor = updates.tipo_conductor;
    if (updates.longitud_km !== undefined) payload.longitud_km = updates.longitud_km;
    if (updates.icc_ka !== undefined) payload.icc_ka = updates.icc_ka;
    if (updates.delta_v_pct !== undefined) payload.delta_v_pct = updates.delta_v_pct;
    if (updates.factor_potencia !== undefined) payload.factor_potencia = updates.factor_potencia;
    if (updates.criticidad_tecnica !== undefined) payload.criticidad_tecnica = updates.criticidad_tecnica;

    // Atributos de Cómputos Métricos y APU
    if (updates.computos_apu !== undefined) payload.computos_apu = updates.computos_apu;
    if (updates.monto_calculado_apu_usd !== undefined) payload.monto_calculado_apu_usd = updates.monto_calculado_apu_usd;
    if (updates.tasa_bcv_referencia !== undefined) payload.tasa_bcv_referencia = updates.tasa_bcv_referencia;

    const { error } = await supabase
      .from('mae_proyectos_especiales')
      .update(payload)
      .eq('id', id);

    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// ----------------------------------------------------
// SUBESTACIONES Y CIRCUITOS RDS-PS (Norma IEC 81346-10)
// ----------------------------------------------------
export async function getSubestacionesRDS(): Promise<DataFetchResult<SubestacionRDS>> {
  if (!isSupabaseConfigured || !supabase) {
    return { data: [], isFromSupabase: false, error: 'InsForge no configurado' };
  }

  try {
    const { data, error } = await supabase
      .from('mae_subestaciones')
      .select('*')
      .limit(100);

    if (error) {
      return { data: [], isFromSupabase: true, error: error.message };
    }

    if (!data || data.length === 0) {
      return { data: [], isFromSupabase: true };
    }

    const mapped: SubestacionRDS[] = data.map((s: any) => ({
      id: s.id,
      codigo_rds: s.codigo_se || s.codigo || `=VE+${s.codigo_estado || 'EST'}-${s.nombre_subestacion || s.nombre}`,
      nombre: s.nombre_subestacion || s.nombre,
      estado: s.codigo_estado || 'NES',
      region: s.municipio || s.region || 'LOS ANDES',
      origen: (s.origen_dato || 'CARACTERIZACION SE DISTRIBUCION') as any,
      tipo: (s.tipo_instalacion || 'DISTRIBUCION') as any,
      circuitos_count: Number(s.circuitos_count || 4),
    }));

    return { data: mapped, isFromSupabase: true };
  } catch (err: any) {
    return { data: [], isFromSupabase: false, error: err.message };
  }
}

export async function getCircuitosRDS(): Promise<DataFetchResult<CircuitoRDS>> {
  if (!isSupabaseConfigured || !supabase) {
    return { data: [], isFromSupabase: false, error: 'InsForge no configurado' };
  }

  try {
    const { data, error } = await supabase
      .from('mae_circuitos')
      .select('*')
      .limit(100);

    if (error) {
      return { data: [], isFromSupabase: true, error: error.message };
    }

    if (!data || data.length === 0) {
      return { data: [], isFromSupabase: true };
    }

    const mapped: CircuitoRDS[] = data.map((c: any) => ({
      id: c.id,
      codigo_rds: c.codigo_circuito || c.codigo || `=VE+${c.codigo_estado || 'EST'}-${c.subestacion_cabecera || 'SE'}:${c.nombre_circuito || c.nombre}`,
      nombre: c.nombre_circuito || c.nombre,
      subestacion_id: c.codigo_se_padre || 'se-001',
      subestacion_nombre: c.subestacion_cabecera || 'SUBESTACION',
      estado: c.codigo_estado || 'AMA',
      designador: c.codigo_maniobra_norma || 'D-100',
      voltaje: c.nivel_tension_kv ? `${c.nivel_tension_kv} kV` : '13.8 kV',
    }));

    return { data: mapped, isFromSupabase: true };
  } catch (err: any) {
    return { data: [], isFromSupabase: false, error: err.message };
  }
}

// ----------------------------------------------------
// ACCIONES POA & PRESUPUESTO
// ----------------------------------------------------
export async function getAccionesPOA(): Promise<DataFetchResult<AccionPOA>> {
  if (!isSupabaseConfigured || !supabase) {
    return { data: [], isFromSupabase: false, error: 'InsForge no configurado' };
  }

  try {
    const { data, error } = await supabase
      .from('v_scppe_poa_acciones')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return { data: [], isFromSupabase: true, error: error.message };
    }

    if (!data || data.length === 0) {
      return { data: [], isFromSupabase: true };
    }

    const mapped: AccionPOA[] = data.map((a: any) => ({
      id: a.id,
      codigo: a.codigo,
      nombre: a.nombre,
      unidad_ejecutora_id: a.unidad_ejecutora_id,
      unidad_ejecutora: a.unidad_ejecutora || a.unidad_ejecutora_siglas || 'GERENCIA GENERAL',
      ponderacion: Number(a.ponderacion || 0),
      presupuesto_asignado_bs: Number(a.presupuesto_asignado_bs || 0),
      presupuesto_ejecutado_bs: Number(a.presupuesto_ejecutado_bs || 0),
      meta_fisica_programada: Number(a.meta_fisica_programada || 0),
      meta_fisica_ejecutada: Number(a.meta_fisica_ejecutada || 0),
      unidad_medida: a.unidad_medida || 'Unidad',
    }));

    return { data: mapped, isFromSupabase: true };
  } catch (err: any) {
    return { data: [], isFromSupabase: false, error: err.message };
  }
}

export async function createAccionPOA(
  accion: Omit<AccionPOA, 'id'>
): Promise<{ success: boolean; data?: AccionPOA; error?: string }> {
  if (!isSupabaseConfigured || !supabase) {
    return { success: false, error: 'InsForge no configurado' };
  }

  try {
    const newId = `poa-${Date.now()}`;
    const payload = {
      id: newId,
      codigo: accion.codigo,
      codigo_accion: accion.codigo,
      nombre: accion.nombre,
      descripcion: accion.nombre,
      unidad_ejecutora_id: accion.unidad_ejecutora_id || 'GGPD_DIV_PLANIF',
      ponderacion: accion.ponderacion,
      presupuesto_asignado_bs: accion.presupuesto_asignado_bs,
      presupuesto_ejecutado_bs: accion.presupuesto_ejecutado_bs || 0,
      meta_fisica_programada: accion.meta_fisica_programada,
      meta_fisica_ejecutada: accion.meta_fisica_ejecutada || 0,
      meta_anual: accion.meta_fisica_programada,
      ejecutado_acumulado: accion.meta_fisica_ejecutada || 0,
      porcentaje_cumplimiento: 0,
      unidad_medida: accion.unidad_medida,
    };

    const { data, error } = await supabase
      .from('mae_poa_acciones')
      .insert([payload])
      .select();

    if (error) {
      return { success: false, error: error.message };
    }

    const created: AccionPOA = { ...accion, id: newId };
    return { success: true, data: (data && data[0]) ? (data[0] as unknown as AccionPOA) : created };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function updateAccionPOA(
  id: string,
  updates: Partial<AccionPOA>
): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured || !supabase) {
    return { success: false, error: 'InsForge no configurado' };
  }

  try {
    const payload: any = {};
    if (updates.codigo !== undefined) {
      payload.codigo = updates.codigo;
      payload.codigo_accion = updates.codigo;
    }
    if (updates.nombre !== undefined) {
      payload.nombre = updates.nombre;
      payload.descripcion = updates.nombre;
    }
    if (updates.unidad_ejecutora_id !== undefined) payload.unidad_ejecutora_id = updates.unidad_ejecutora_id;
    if (updates.ponderacion !== undefined) payload.ponderacion = updates.ponderacion;
    if (updates.presupuesto_asignado_bs !== undefined) payload.presupuesto_asignado_bs = updates.presupuesto_asignado_bs;
    if (updates.presupuesto_ejecutado_bs !== undefined) payload.presupuesto_ejecutado_bs = updates.presupuesto_ejecutado_bs;
    if (updates.meta_fisica_programada !== undefined) {
      payload.meta_fisica_programada = updates.meta_fisica_programada;
      payload.meta_anual = updates.meta_fisica_programada;
    }
    if (updates.meta_fisica_ejecutada !== undefined) {
      payload.meta_fisica_ejecutada = updates.meta_fisica_ejecutada;
      payload.ejecutado_acumulado = updates.meta_fisica_ejecutada;
    }
    if (updates.unidad_medida !== undefined) payload.unidad_medida = updates.unidad_medida;

    const { error } = await supabase
      .from('mae_poa_acciones')
      .update(payload)
      .eq('id', id);

    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function createMultipleAccionesPOA(
  acciones: Omit<AccionPOA, 'id'>[]
): Promise<{ success: boolean; count: number; error?: string }> {
  if (!isSupabaseConfigured || !supabase) {
    return { success: false, count: 0, error: 'InsForge no configurado' };
  }

  try {
    const payload = acciones.map((a, idx) => ({
      id: `poa-${Date.now()}-${idx}`,
      codigo: a.codigo,
      codigo_accion: a.codigo,
      nombre: a.nombre,
      descripcion: a.nombre,
      unidad_ejecutora_id: a.unidad_ejecutora_id || 'GGPD_DIV_PLANIF',
      ponderacion: a.ponderacion,
      presupuesto_asignado_bs: a.presupuesto_asignado_bs,
      presupuesto_ejecutado_bs: a.presupuesto_ejecutado_bs || 0,
      meta_fisica_programada: a.meta_fisica_programada,
      meta_fisica_ejecutada: a.meta_fisica_ejecutada || 0,
      meta_anual: a.meta_fisica_programada,
      ejecutado_acumulado: a.meta_fisica_ejecutada || 0,
      porcentaje_cumplimiento: 0,
      unidad_medida: a.unidad_medida,
    }));

    const { error } = await supabase
      .from('mae_poa_acciones')
      .insert(payload);

    if (error) {
      return { success: false, count: 0, error: error.message };
    }

    return { success: true, count: payload.length };
  } catch (err: any) {
    return { success: false, count: 0, error: err.message };
  }
}

// ----------------------------------------------------
// CONTROL DE VIÁTICOS Y CONCILIACIÓN PRESUPUESTARIA
// ----------------------------------------------------
export async function getViaticos(): Promise<DataFetchResult<ViaticoControl>> {
  if (!isSupabaseConfigured || !supabase) {
    return { data: [], isFromSupabase: false, error: 'InsForge no configurado' };
  }

  try {
    const { data, error } = await supabase
      .from('v_scppe_viaticos_control')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return { data: [], isFromSupabase: true, error: error.message };
    }

    if (!data || data.length === 0) {
      return { data: [], isFromSupabase: true };
    }

    const mapped: ViaticoControl[] = data.map((v: any) => ({
      id: v.id || v.numero_solicitud,
      numero_solicitud: v.numero_solicitud || 'SCPPE-VIAT-N/A',
      empleado_nombre: v.empleado_nombre || 'Empleado CORPOELEC',
      empleado_cedula: v.empleado_cedula || 'V-00000000',
      destino: v.destino || 'Misión de Inspección SEN',
      fecha_inicio: v.fecha_inicio || '',
      fecha_fin: v.fecha_fin || '',
      dias_duracion: Number(v.dias_duracion || 0),
      monto_calculado_usd: Number(v.monto_calculado_usd || 0),
      monto_calculado_bs: Number(v.monto_calculado_bs || 0),
      estatus_flujo: (v.estatus_flujo || 'PENDIENTE') as any,
      motivo_comision: v.motivo_comision || undefined,
      proyecto_asociado_id: v.proyecto_asociado_id || undefined,
      proyecto_asociado_nombre: v.proyecto_asociado_nombre || undefined,
      unidad_solicitante_id: v.unidad_solicitante_id || undefined,
      gerencia_emisora_id: v.gerencia_emisora_id || undefined,
    }));

    return { data: mapped, isFromSupabase: true };
  } catch (err: any) {
    return { data: [], isFromSupabase: false, error: err.message };
  }
}

export function getTasaBCV(): number {
  return TASA_BCV_OFICIAL;
}

export function getTabuladorViaticos() {
  return TABULADOR_VIATICOS_CORPOELEC_2026;
}

export function getPartidasAPU(): PartidaAPU[] {
  return CATALOGO_PARTIDAS_APU_SEN;
}

export async function getComprobantesViatico(asignacionId?: string): Promise<ComprobanteFiscalViatico[]> {
  if (!isSupabaseConfigured || !supabase) return [];

  try {
    let query = supabase.from('mae_comprobantes_viatico').select('*');
    if (asignacionId) {
      query = query.eq('asignacion_id', asignacionId);
    }
    const { data, error } = await query.order('fecha_emision', { ascending: false });
    if (error || !data) return [];
    return (data as any[]).map((c: any) => ({
      id: c.id,
      asignacion_id: c.asignacion_id,
      rif_proveedor: c.rif_proveedor,
      razon_social: c.razon_social,
      numero_factura: c.numero_factura,
      numero_control: c.numero_control,
      fecha_emision: c.fecha_emision,
      concepto: c.concepto,
      monto_bs: Number(c.monto_bs || 0),
      monto_usd: c.monto_usd ? Number(c.monto_usd) : undefined,
      valido_seniat: Boolean(c.valido_seniat),
    }));
  } catch (err) {
    return [];
  }
}

export async function registrarComprobanteViatico(
  comprobante: Omit<ComprobanteFiscalViatico, 'id'>
): Promise<{ success: boolean; data?: ComprobanteFiscalViatico; error?: string }> {
  if (!isSupabaseConfigured || !supabase) {
    return { success: false, error: 'InsForge no configurado' };
  }
  try {
    const { data, error } = await supabase
      .from('mae_comprobantes_viatico')
      .insert([{
        asignacion_id: comprobante.asignacion_id,
        rif_proveedor: comprobante.rif_proveedor,
        razon_social: comprobante.razon_social,
        numero_factura: comprobante.numero_factura,
        numero_control: comprobante.numero_control,
        fecha_emision: comprobante.fecha_emision,
        concepto: comprobante.concepto,
        monto_bs: comprobante.monto_bs,
        monto_usd: comprobante.monto_usd,
        valido_seniat: comprobante.valido_seniat ?? true,
      }])
      .select()
      .single();
    if (error) return { success: false, error: error.message };
    return { success: true, data: data as ComprobanteFiscalViatico };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function getConciliacionPresupuestaria(
  viaticosList?: ViaticoControl[]
): Promise<ConciliacionPresupuestaria> {
  const currentList = viaticosList || [];
  // Techo presupuestario de inspección técnica indexado al tabulador multimoneda (Fondo $25,000 USD @ Tasa BCV)
  const techoPresupuestarioUsd = 25000.0;
  const techoPresupuestario = Math.round(techoPresupuestarioUsd * TASA_BCV_OFICIAL);

  const totalAsignado = currentList.reduce((acc, v) => acc + (v.monto_calculado_bs || 0), 0);
  const totalEjecutado = currentList.reduce((acc, v) => acc + (v.monto_calculado_usd || 0), 0);
  const saldoDisponible = Math.max(0, techoPresupuestario - totalAsignado);
  const pctComprometido = Number(((totalAsignado / (techoPresupuestario || 1)) * 100).toFixed(2));

  let estadoConciliacion: 'CONCILIADO_NORMAL' | 'ALERTA_EXCESO' | 'PRESUPUESTO_AGOTADO' = 'CONCILIADO_NORMAL';
  if (totalAsignado > techoPresupuestario) {
    estadoConciliacion = 'ALERTA_EXCESO';
  } else if (totalAsignado === techoPresupuestario && techoPresupuestario > 0) {
    estadoConciliacion = 'PRESUPUESTO_AGOTADO';
  }

  return {
    partida_codigo: 'PARTIDA-405',
    partida_nombre: 'Viáticos y Pasajes de Inspección Técnica SEN (Indexado BCV)',
    presupuesto_partida: techoPresupuestario,
    presupuesto_viatico: techoPresupuestario,
    total_asignado: totalAsignado,
    saldo_disponible: saldoDisponible,
    total_ejecutado: totalEjecutado,
    porcentaje_comprometido: pctComprometido,
    estado_conciliacion: estadoConciliacion,
    trigger_activo: true,
  };
}

export async function crearAsignacionViatico(
  nuevaAsignacion: Omit<ViaticoControl, 'id' | 'numero_solicitud' | 'monto_calculado_usd' | 'estatus_flujo'>
): Promise<{ success: boolean; data?: ViaticoControl; error?: string }> {
  const techoPresupuestarioUsd = 25000.0;
  const techoPresupuestario = Math.round(techoPresupuestarioUsd * TASA_BCV_OFICIAL);
  const viatRes = await getViaticos();
  const actualAsignado = viatRes.data.reduce((acc, v) => acc + (v.monto_calculado_bs || 0), 0);
  const saldoDisponible = techoPresupuestario - actualAsignado;

  // Validación presupuestaria (Trigger preventivo DDL)
  if (nuevaAsignacion.monto_calculado_bs > saldoDisponible) {
    return {
      success: false,
      error: `PRESUPUESTO EXCEDIDO [trg_validar_presupuesto_viatico]: El monto solicitado (Bs. ${nuevaAsignacion.monto_calculado_bs.toLocaleString('es-VE')}) excede el saldo disponible (Bs. ${saldoDisponible.toLocaleString('es-VE')}). Techo Partida 405: Bs. ${techoPresupuestario.toLocaleString('es-VE')} ($25,000 USD @ Tasa BCV ${TASA_BCV_OFICIAL}).`,
    };
  }

  const newId = `via-${Date.now()}`;
  const nuevoMontoUsd = Number((nuevaAsignacion.monto_calculado_bs / TASA_BCV_OFICIAL).toFixed(2));

  try {
    const payload = {
      id: newId,
      numero_solicitud: `SCPPE-VIAT-${Math.floor(100 + Math.random() * 900)}`,
      empleado_nombre: nuevaAsignacion.empleado_nombre,
      empleado_cedula: nuevaAsignacion.empleado_cedula || 'V-00000000',
      destino: nuevaAsignacion.destino,
      fecha_inicio: nuevaAsignacion.fecha_inicio,
      fecha_fin: nuevaAsignacion.fecha_fin,
      dias_duracion: nuevaAsignacion.dias_duracion || 1,
      monto_calculado_usd: nuevoMontoUsd,
      monto_calculado_bs: nuevaAsignacion.monto_calculado_bs,
      estatus_flujo: 'PENDIENTE',
      motivo_comision: nuevaAsignacion.motivo_comision || null,
    };

    const { data, error } = await supabase
      .from('mae_viaticos_control')
      .insert([payload])
      .select();

    if (error) {
      return { success: false, error: error.message };
    }

    const created: ViaticoControl = {
      id: newId,
      numero_solicitud: payload.numero_solicitud,
      empleado_nombre: nuevaAsignacion.empleado_nombre,
      empleado_cedula: payload.empleado_cedula,
      destino: nuevaAsignacion.destino,
      fecha_inicio: nuevaAsignacion.fecha_inicio,
      fecha_fin: nuevaAsignacion.fecha_fin,
      dias_duracion: payload.dias_duracion,
      monto_calculado_usd: nuevoMontoUsd,
      monto_calculado_bs: nuevaAsignacion.monto_calculado_bs,
      estatus_flujo: 'PENDIENTE',
      motivo_comision: nuevaAsignacion.motivo_comision,
    };

    return { success: true, data: (data && data[0]) ? (data[0] as unknown as ViaticoControl) : created };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// ----------------------------------------------------
// AUDITORÍA ISO 27001
// ----------------------------------------------------
export async function getAuditoriaLogs(): Promise<DataFetchResult<RegistroAuditoria>> {
  if (!isSupabaseConfigured || !supabase) {
    return { data: [], isFromSupabase: false, error: 'InsForge no configurado' };
  }

  try {
    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .order('executed_at', { ascending: false })
      .limit(20);

    if (error) {
      return { data: [], isFromSupabase: true, error: error.message };
    }

    if (!data || data.length === 0) {
      return { data: [], isFromSupabase: true };
    }

    const mapped: RegistroAuditoria[] = data.map((a: any) => ({
      id: a.id,
      fecha: a.executed_at ? new Date(a.executed_at).toLocaleString('es-VE') : new Date().toLocaleString('es-VE'),
      usuario: a.executed_by || 'corpoelec_admin',
      esquema: a.table_schema || 'scppe',
      tabla: a.table_name || 'mae_proyectos_especiales',
      accion: (a.operation || 'UPDATE') as any,
      detalles: JSON.stringify(a.new_data || a.old_data || {}),
      cumplimiento_iso: 'ISO_27001',
    }));

    return { data: mapped, isFromSupabase: true };
  } catch (err: any) {
    return { data: [], isFromSupabase: false, error: err.message };
  }
}

export const getAuditLogs = getAuditoriaLogs;

// ----------------------------------------------------
// MODELO ORGANIZACIONAL RECURSIVO Y POLIMÓRFICO
// ----------------------------------------------------
export async function getOrganizaciones(): Promise<DataFetchResult<OrganizacionNodo>> {
  if (!isSupabaseConfigured || !supabase) {
    return { data: [], isFromSupabase: false, error: 'InsForge no configurado' };
  }

  try {
    const { data, error } = await supabase
      .from('v_organizaciones_arbol')
      .select('*')
      .order('nivel_jerarquico', { ascending: true });

    if (error) {
      return { data: [], isFromSupabase: true, error: error.message };
    }

    if (!data || data.length === 0) {
      return { data: [], isFromSupabase: true };
    }

    return { data: data as OrganizacionNodo[], isFromSupabase: true };
  } catch (err: any) {
    return { data: [], isFromSupabase: false, error: err.message };
  }
}

export async function getEntesCofinanciadores(): Promise<OrganizacionNodo[]> {
  const res = await getOrganizaciones();
  return res.data.filter(
    (o) =>
      o.tipo_id === 'GOBERNACION' ||
      o.tipo_id === 'ALCALDIA' ||
      o.tipo_id === 'CONVENIO_COMUNAL' ||
      o.tipo_id === 'EMPRESA_ESTATAL' ||
      o.tipo_id === 'MINISTERIO'
  );
}

export async function getGerencias(): Promise<OrganizacionNodo[]> {
  const res = await getOrganizaciones();
  return res.data.filter(
    (o) => o.tipo_id === 'GERENCIA_GENERAL' || o.tipo_id === 'DESPACHO_PRESIDENCIA'
  );
}

export async function getUnidadesEjecutoras(): Promise<OrganizacionNodo[]> {
  const res = await getOrganizaciones();
  return res.data.filter((o) => o.tipo_id === 'DIVISION_UNIDAD');
}

// ----------------------------------------------------
// PROYECTOS TERRITORIALES DIRECTOS (GGD)
// ----------------------------------------------------
export async function getProyectosGGD(): Promise<DataFetchResult<ProyectoGGD>> {
  if (!isSupabaseConfigured || !supabase) {
    return { data: [], isFromSupabase: false, error: 'InsForge no configurado' };
  }

  try {
    const { data, error } = await supabase
      .from('v_scppe_proyectos_ggd')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return { data: [], isFromSupabase: true, error: error.message };
    }

    if (!data || data.length === 0) {
      return { data: [], isFromSupabase: true };
    }

    const mapped: ProyectoGGD[] = data.map((p: any) => ({
      id: p.id,
      codigo: p.codigo || p.codigo_convenio,
      codigo_convenio: p.codigo_convenio || p.codigo,
      nombre: p.nombre,
      ente_cofinanciador_id: p.ente_cofinanciador_id,
      tipo_ente: p.ente_cofinanciador_tipo || p.tipo_ente || 'GOBERNACION',
      nombre_ente: p.ente_cofinanciador_nombre || p.nombre_ente || 'Ente Cofinanciador',
      gerencia_responsable_id: p.gerencia_responsable_id,
      gerencia_responsable: p.gerencia_responsable_nombre || p.gerencia_responsable || 'Gerencia General de Distribución',
      responsable_seguimiento: p.responsable_seguimiento,
      estado: p.codigo_estado || p.estado || 'TAC',
      monto_estimado_bs: Number(p.monto_estimado_bs || 0),
      monto_estimado_usd: Number(p.monto_estimado_usd || 0),
      avance_fisico_pct: Number(p.avance_fisico_pct || 0),
      estatus_gestion: (p.estatus_gestion || 'EN_FORMULACION') as any,
      fecha_limite: p.fecha_limite,
      observaciones_auditoria: p.observaciones_auditoria,
      vinculado_arbol_org: Boolean(p.ente_cofinanciador_nombre),
      ente_cofinanciador_siglas: p.ente_cofinanciador_siglas,
      gerencia_responsable_siglas: p.gerencia_responsable_siglas,
    }));

    return { data: mapped, isFromSupabase: true };
  } catch (err: any) {
    return { data: [], isFromSupabase: false, error: err.message };
  }
}

export async function createProyectoGGD(
  proyecto: Omit<ProyectoGGD, 'id'>
): Promise<{ success: boolean; data?: ProyectoGGD; error?: string }> {
  if (!isSupabaseConfigured || !supabase) {
    return { success: false, error: 'InsForge no configurado' };
  }

  try {
    const newId = `ggd-${Date.now()}`;
    const payload = {
      id: newId,
      codigo: proyecto.codigo_convenio || proyecto.codigo,
      codigo_convenio: proyecto.codigo_convenio,
      nombre: proyecto.nombre,
      ente_cofinanciador_id: proyecto.ente_cofinanciador_id || 'GOB_MIRANDA',
      gerencia_responsable_id: proyecto.gerencia_responsable_id || 'CORPOELEC_GGD',
      responsable_seguimiento: proyecto.responsable_seguimiento,
      codigo_estado: proyecto.estado || 'MIR',
      monto_estimado_bs: proyecto.monto_estimado_bs,
      monto_estimado_usd: proyecto.monto_estimado_usd,
      avance_fisico_pct: proyecto.avance_fisico_pct || 0,
      estatus_gestion: proyecto.estatus_gestion || 'EN_FORMULACION',
      fecha_limite: proyecto.fecha_limite,
      observaciones_auditoria: proyecto.observaciones_auditoria,
    };

    const { data, error } = await supabase
      .from('mae_proyectos_ggd')
      .insert([payload])
      .select();

    if (error) {
      return { success: false, error: error.message };
    }

    const created: ProyectoGGD = { ...proyecto, id: newId };
    return { success: true, data: (data && data[0]) ? (data[0] as unknown as ProyectoGGD) : created };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export function normalizarProyectoGGD(
  proyectoId: string,
  accionPoaCodigo: string,
  proyectoPrtsenId?: string
): Promise<{ success: boolean; error?: string }> {
  return Promise.resolve({ success: true });
}
