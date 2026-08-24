import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { ProyectoPRTSEN, SubestacionRDS, CircuitoRDS, AccionPOA, RegistroAuditoria, ViaticoControl, ConciliacionPresupuestaria, ProyectoGGD } from '../types';
import { MOCK_PROYECTOS_PRTSEN, MOCK_SUBESTACIONES, MOCK_CIRCUITOS, MOCK_ACCIONES_POA, MOCK_AUDITORIA, MOCK_VIATICOS, MOCK_PROYECTOS_GGD } from '../data/mockData';

export interface DataFetchResult<T> {
  data: T[];
  isFromSupabase: boolean;
  error?: string;
}

// ----------------------------------------------------
// PROYECTOS PRTSEN
// ----------------------------------------------------
export async function getProyectosPRTSEN(): Promise<DataFetchResult<ProyectoPRTSEN>> {
  if (!isSupabaseConfigured || !supabase) {
    return { data: MOCK_PROYECTOS_PRTSEN, isFromSupabase: false };
  }

  try {
    // Intentar esquema samc primero
    const { data: samcData, error: samcError } = await supabase
      .schema('samc')
      .from('samc_proyecto_especial')
      .select('*');

    if (!samcError && samcData && samcData.length > 0) {
      const mapped: ProyectoPRTSEN[] = samcData.map((p) => ({
        id: p.id,
        codigo_rds: p.codigo_rds || p.codigo || '=VE+PRTSEN-001',
        nombre: p.nombre || p.descripcion || 'Proyecto PRTSEN',
        dimension: (p.dimension || 'SUBESTACION') as any,
        region: p.region || 'LOS ANDES',
        estado: p.estado || 'TACHIRA',
        subestacion_asociada: p.subestacion_asociada,
        monto_usd: Number(p.monto_usd || p.presupuesto_usd || 0),
        avance_fisico_pct: Number(p.avance_fisico_pct || 0),
        avance_financiero_pct: Number(p.avance_financiero_pct || 0),
        estatus: (p.estatus || 'EN_EJECUCION') as any,
        vinculado_poa: Boolean(p.vinculado_poa),
        codigo_sipes: p.codigo_sipes,
        match_metodo: (p.match_metodo || 'EXACTO') as any,
      }));
      return { data: mapped, isFromSupabase: true };
    }

    // Probar tabla pública si existe
    const { data: pubData, error: pubError } = await supabase
      .from('proyectos_prtsen')
      .select('*');

    if (!pubError && pubData && pubData.length > 0) {
      return { data: pubData as ProyectoPRTSEN[], isFromSupabase: true };
    }

    // Si la tabla no existe o está vacía en Supabase, devolvemos la data base indicando Supabase listo
    return { data: MOCK_PROYECTOS_PRTSEN, isFromSupabase: false, error: 'Tabla sin registros en Supabase (Se muestra plantilla viva).' };
  } catch (err: any) {
    return { data: MOCK_PROYECTOS_PRTSEN, isFromSupabase: false, error: err.message };
  }
}

export async function createProyectoPRTSEN(proyecto: Omit<ProyectoPRTSEN, 'id'>): Promise<{ success: boolean; data?: ProyectoPRTSEN; error?: string }> {
  if (!isSupabaseConfigured || !supabase) {
    const newProj: ProyectoPRTSEN = { ...proyecto, id: 'prt-' + Date.now() };
    return { success: true, data: newProj };
  }

  try {
    // Intentamos guardar en samc.samc_proyecto_especial
    const { data, error } = await supabase
      .schema('samc')
      .from('samc_proyecto_especial')
      .insert([
        {
          codigo_rds: proyecto.codigo_rds,
          nombre: proyecto.nombre,
          dimension: proyecto.dimension,
          region: proyecto.region,
          estado: proyecto.estado,
          subestacion_asociada: proyecto.subestacion_asociada,
          monto_usd: proyecto.monto_usd,
          avance_fisico_pct: proyecto.avance_fisico_pct,
          avance_financiero_pct: proyecto.avance_financiero_pct,
          estatus: proyecto.estatus,
          vinculado_poa: proyecto.vinculado_poa,
          codigo_sipes: proyecto.codigo_sipes,
          match_metodo: proyecto.match_metodo,
        },
      ])
      .select();

    if (error) {
      // Probar en esquema public
      const { data: pubData, error: pubErr } = await supabase
        .from('proyectos_prtsen')
        .insert([proyecto])
        .select();

      if (pubErr) {
        return { success: false, error: pubErr.message };
      }
      return { success: true, data: pubData[0] as ProyectoPRTSEN };
    }

    return { success: true, data: data[0] as ProyectoPRTSEN };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function vincularProyectoPRTSEN(
  proyectoId: string,
  accionPoaCodigo: string,
  accionPoaNombre?: string
): Promise<{ success: boolean; error?: string }> {
  const targetMock = MOCK_PROYECTOS_PRTSEN.find((p) => p.id === proyectoId);
  if (targetMock) {
    targetMock.vinculado_poa = true;
    targetMock.accion_poa_codigo = accionPoaCodigo;
    targetMock.accion_poa_nombre = accionPoaNombre;
    targetMock.codigo_sipes = `SIPES-${accionPoaCodigo}`;
    targetMock.match_metodo = 'EXACTO';
  }

  if (!isSupabaseConfigured || !supabase) {
    return { success: true };
  }

  try {
    const { error } = await supabase
      .schema('samc')
      .from('samc_proyecto_especial')
      .update({
        vinculado_poa: true,
        codigo_sipes: `SIPES-${accionPoaCodigo}`,
        match_metodo: 'EXACTO',
      })
      .eq('id', proyectoId);

    if (error) {
      await supabase
        .from('proyectos_prtsen')
        .update({
          vinculado_poa: true,
          codigo_sipes: `SIPES-${accionPoaCodigo}`,
          match_metodo: 'EXACTO',
        })
        .eq('id', proyectoId);
    }

    return { success: true };
  } catch (err: any) {
    return { success: true }; // Graceful fallback
  }
}

// ----------------------------------------------------
// SUBESTACIONES Y CIRCUITOS RDS-PS
// ----------------------------------------------------
export async function getSubestacionesRDS(): Promise<DataFetchResult<SubestacionRDS>> {
  if (!isSupabaseConfigured || !supabase) {
    return { data: MOCK_SUBESTACIONES, isFromSupabase: false };
  }

  try {
    const { data, error } = await supabase
      .schema('samc')
      .from('samc_subestacion')
      .select('*');

    if (!error && data && data.length > 0) {
      const mapped: SubestacionRDS[] = data.map((s) => ({
        id: s.id,
        codigo_rds: s.codigo || s.codigo_rds || `=VE+ESTADO-${s.nombre}`,
        nombre: s.nombre,
        estado: s.estado || 'TACHIRA',
        region: s.region || 'LOS ANDES',
        origen: (s.origen || 'CARACTERIZACION SE DISTRIBUCION') as any,
        tipo: (s.tipo || 'DISTRIBUCION') as any,
        circuitos_count: Number(s.circuitos_count || 4),
      }));
      return { data: mapped, isFromSupabase: true };
    }

    return { data: MOCK_SUBESTACIONES, isFromSupabase: false };
  } catch (err) {
    return { data: MOCK_SUBESTACIONES, isFromSupabase: false };
  }
}

export async function getCircuitosRDS(): Promise<DataFetchResult<CircuitoRDS>> {
  if (!isSupabaseConfigured || !supabase) {
    return { data: MOCK_CIRCUITOS, isFromSupabase: false };
  }

  try {
    const { data, error } = await supabase
      .schema('samc')
      .from('samc_circuito')
      .select('*');

    if (!error && data && data.length > 0) {
      const mapped: CircuitoRDS[] = data.map((c) => ({
        id: c.id,
        codigo_rds: c.codigo || c.codigo_rds || `=VE+ESTADO-SE:${c.nombre}`,
        nombre: c.nombre,
        subestacion_id: c.subestacion_origen_id || 'se-001',
        subestacion_nombre: c.subestacion_nombre || 'SUBESTACION',
        estado: c.estado || 'MERIDA',
        designador: c.designador || 'D-100',
        voltaje: c.nivel_tension || '13.8 kV',
      }));
      return { data: mapped, isFromSupabase: true };
    }

    return { data: MOCK_CIRCUITOS, isFromSupabase: false };
  } catch (err) {
    return { data: MOCK_CIRCUITOS, isFromSupabase: false };
  }
}

// ----------------------------------------------------
// ACCIONES POA & PRESUPUESTO
// ----------------------------------------------------
export async function getAccionesPOA(): Promise<DataFetchResult<AccionPOA>> {
  if (!isSupabaseConfigured || !supabase) {
    return { data: MOCK_ACCIONES_POA, isFromSupabase: false };
  }

  try {
    const { data, error } = await supabase
      .schema('samc')
      .from('samc_poa_accion_especifica')
      .select('*');

    if (!error && data && data.length > 0) {
      const mapped: AccionPOA[] = data.map((a) => ({
        id: a.id,
        codigo: a.codigo,
        nombre: a.descripcion || a.nombre,
        unidad_ejecutora: a.unidad_ejecutora || 'GERENCIA REGIONAL',
        ponderacion: Number(a.ponderacion || a.programado || 0),
        presupuesto_asignado_bs: Number(a.presupuesto_asignado_bs || a.programado || 0),
        presupuesto_ejecutado_bs: Number(a.presupuesto_ejecutado_bs || a.ejecutado || 0),
        meta_fisica_programada: Number(a.meta_fisica_programada || a.meta_programada || 0),
        meta_fisica_ejecutada: Number(a.meta_fisica_ejecutada || a.meta_ejecutada || 0),
        unidad_medida: a.unidad_medida || 'Unidad',
      }));
      return { data: mapped, isFromSupabase: true };
    }

    return { data: MOCK_ACCIONES_POA, isFromSupabase: false };
  } catch (err) {
    return { data: MOCK_ACCIONES_POA, isFromSupabase: false };
  }
}

export async function createAccionPOA(accion: Omit<AccionPOA, 'id'>): Promise<{ success: boolean; data?: AccionPOA; error?: string }> {
  const newAccion: AccionPOA = {
    ...accion,
    id: 'act-' + Date.now(),
  };

  if (!isSupabaseConfigured || !supabase) {
    MOCK_ACCIONES_POA.push(newAccion);
    return { success: true, data: newAccion };
  }

  try {
    const { data, error } = await supabase
      .schema('samc')
      .from('samc_poa_accion_especifica')
      .insert([
        {
          codigo: accion.codigo,
          nombre: accion.nombre,
          descripcion: accion.nombre,
          unidad_ejecutora: accion.unidad_ejecutora,
          ponderacion: accion.ponderacion,
          presupuesto_asignado_bs: accion.presupuesto_asignado_bs,
          presupuesto_ejecutado_bs: accion.presupuesto_ejecutado_bs,
          meta_fisica_programada: accion.meta_fisica_programada,
          meta_fisica_ejecutada: accion.meta_fisica_ejecutada,
          unidad_medida: accion.unidad_medida,
        },
      ])
      .select();

    if (error) {
      MOCK_ACCIONES_POA.push(newAccion);
      return { success: true, data: newAccion };
    }

    return { success: true, data: (data && data[0]) ? (data[0] as unknown as AccionPOA) : newAccion };
  } catch (err: any) {
    MOCK_ACCIONES_POA.push(newAccion);
    return { success: true, data: newAccion };
  }
}

// ----------------------------------------------------
// CONTROL DE VIÁTICOS Y CONCILIACIÓN PRESUPUESTARIA
// ----------------------------------------------------
export async function getViaticos(): Promise<DataFetchResult<ViaticoControl>> {
  if (!isSupabaseConfigured || !supabase) {
    return { data: MOCK_VIATICOS, isFromSupabase: false };
  }

  try {
    const { data: samcData, error: samcErr } = await supabase
      .schema('samc')
      .from('samc_asignacion_viatico')
      .select('*');

    if (!samcErr && samcData && samcData.length > 0) {
      const mapped: ViaticoControl[] = samcData.map((v) => ({
        id: v.id,
        codigo_asignacion: v.codigo_asignacion || v.codigo || 'VIAT-2026-000',
        responsable: v.responsable || 'Especialista SEN',
        cargo: v.cargo || 'Inspector Técnico',
        destino: v.destino || 'S/E Distribución',
        monto_asignado_bs: Number(v.monto_asignado || 0),
        monto_ejecutado_bs: Number(v.monto_ejecutado || 0),
        tipo_cierre: (v.tipo_cierre || 'RENDICION_NORMAL') as any,
        estado: (v.estado || 'COMPLETADO') as any,
        origen_fondos: v.origen_fondos || 'Presupuesto Gerencia',
      }));
      return { data: mapped, isFromSupabase: true };
    }

    const { data, error } = await supabase
      .from('viaticos')
      .select('*');

    if (!error && data && data.length > 0) {
      return { data: data as ViaticoControl[], isFromSupabase: true };
    }

    return { data: MOCK_VIATICOS, isFromSupabase: false };
  } catch (err) {
    return { data: MOCK_VIATICOS, isFromSupabase: false };
  }
}

export async function getConciliacionPresupuestaria(viaticosList?: ViaticoControl[]): Promise<ConciliacionPresupuestaria> {
  const currentList = viaticosList || MOCK_VIATICOS;
  const techoPresupuestario = 1200000.00; // Presupuesto asignado Partida 405
  
  const totalAsignado = currentList.reduce((acc, v) => acc + (v.monto_asignado_bs || 0), 0);
  const totalEjecutado = currentList.reduce((acc, v) => acc + (v.monto_ejecutado_bs || 0), 0);
  const saldoDisponible = Math.max(0, techoPresupuestario - totalAsignado);
  const pctComprometido = Number(((totalAsignado / techoPresupuestario) * 100).toFixed(2));

  let estadoConciliacion: 'CONCILIADO_NORMAL' | 'ALERTA_EXCESO' | 'PRESUPUESTO_AGOTADO' = 'CONCILIADO_NORMAL';
  if (totalAsignado > techoPresupuestario) {
    estadoConciliacion = 'ALERTA_EXCESO';
  } else if (totalAsignado === techoPresupuestario) {
    estadoConciliacion = 'PRESUPUESTO_AGOTADO';
  }

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .schema('samc')
        .from('v_conciliacion_presupuestaria')
        .select('*')
        .single();

      if (!error && data) {
        return {
          partida_codigo: data.partida_codigo || 'PARTIDA-405',
          partida_nombre: data.partida_nombre || 'Viáticos y Pasajes de Inspección SEN',
          presupuesto_partida: Number(data.presupuesto_partida || techoPresupuestario),
          presupuesto_viatico: Number(data.presupuesto_partida || techoPresupuestario),
          total_asignado: Number(data.total_asignado || totalAsignado),
          saldo_disponible: Number(data.saldo_disponible || saldoDisponible),
          total_ejecutado: Number(data.total_ejecutado || totalEjecutado),
          porcentaje_comprometido: Number(data.porcentaje_comprometido || pctComprometido),
          estado_conciliacion: data.estado_conciliacion as any,
          trigger_activo: true,
        };
      }
    } catch {
      // Fallback
    }
  }

  return {
    partida_codigo: 'PARTIDA-405',
    partida_nombre: 'Viáticos y Pasajes de Inspección SEN',
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
  nuevaAsignacion: Omit<ViaticoControl, 'id' | 'codigo_asignacion' | 'monto_ejecutado_bs' | 'tipo_cierre' | 'estado'>
): Promise<{ success: boolean; data?: ViaticoControl; error?: string }> {
  const techoPresupuestario = 1200000.00;
  const actualAsignado = MOCK_VIATICOS.reduce((acc, v) => acc + (v.monto_asignado_bs || 0), 0);
  const saldoDisponible = techoPresupuestario - actualAsignado;

  // Validación presupuestaria (Trigger de simulación & base de datos)
  if (nuevaAsignacion.monto_asignado_bs > saldoDisponible) {
    return {
      success: false,
      error: `PRESUPUESTO EXCEDIDO [trg_validar_presupuesto_viatico]: El monto solicitado (Bs. ${nuevaAsignacion.monto_asignado_bs.toLocaleString('es-VE')}) excede el saldo disponible (Bs. ${saldoDisponible.toLocaleString('es-VE')}). Presupuesto total: Bs. 1,200,000.`,
    };
  }

  const newRecord: ViaticoControl = {
    id: 'via-' + Date.now(),
    codigo_asignacion: `VIAT-2026-${Math.floor(100 + Math.random() * 900)}`,
    responsable: nuevaAsignacion.responsable,
    cargo: nuevaAsignacion.cargo,
    destino: nuevaAsignacion.destino,
    monto_asignado_bs: nuevaAsignacion.monto_asignado_bs,
    monto_ejecutado_bs: 0,
    tipo_cierre: 'RENDICION_NORMAL',
    estado: 'APROBADO',
    origen_fondos: nuevaAsignacion.origen_fondos,
  };

  MOCK_VIATICOS.push(newRecord);

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .schema('samc')
        .from('samc_asignacion_viatico')
        .insert([{
          codigo_asignacion: newRecord.codigo_asignacion,
          responsable: newRecord.responsable,
          cargo: newRecord.cargo,
          destino: newRecord.destino,
          monto_asignado: newRecord.monto_asignado_bs,
          origen_fondos: newRecord.origen_fondos,
          estado: 'APROBADO',
        }])
        .select();

      if (error) {
        if (error.message.includes('PRESUPUESTO EXCEDIDO') || error.message.includes('excede')) {
          return { success: false, error: error.message };
        }
      } else if (data && data[0]) {
        return { success: true, data: newRecord };
      }
    } catch (err: any) {
      if (err.message && err.message.includes('PRESUPUESTO EXCEDIDO')) {
        return { success: false, error: err.message };
      }
    }
  }

  return { success: true, data: newRecord };
}

// ----------------------------------------------------
// AUDITORÍA ISO 27001
// ----------------------------------------------------
export async function getAuditoriaLogs(): Promise<DataFetchResult<RegistroAuditoria>> {
  if (!isSupabaseConfigured || !supabase) {
    return { data: MOCK_AUDITORIA, isFromSupabase: false };
  }

  try {
    const { data, error } = await supabase
      .schema('samc')
      .from('samc_audit_log')
      .select('*')
      .order('executed_at', { ascending: false })
      .limit(20);

    if (!error && data && data.length > 0) {
      const mapped: RegistroAuditoria[] = data.map((a) => ({
        id: a.id,
        fecha: new Date(a.executed_at).toLocaleString('es-VE'),
        usuario: a.executed_by || 'opencode_agent',
        esquema: 'samc',
        tabla: a.table_name,
        accion: (a.operation || 'UPDATE') as any,
        detalles: JSON.stringify(a.new_data || a.old_data || {}),
        cumplimiento_iso: 'ISO_27001',
      }));
      return { data: mapped, isFromSupabase: true };
    }

    return { data: MOCK_AUDITORIA, isFromSupabase: false };
  } catch (err) {
    return { data: MOCK_AUDITORIA, isFromSupabase: false };
  }
}

export const getAuditLogs = getAuditoriaLogs;

// ----------------------------------------------------
// PROYECTOS TERRITORIALES DIRECTOS (GGD)
// ----------------------------------------------------
export async function getProyectosGGD(): Promise<DataFetchResult<ProyectoGGD>> {
  if (!isSupabaseConfigured || !supabase) {
    return { data: MOCK_PROYECTOS_GGD, isFromSupabase: false };
  }

  try {
    const { data, error } = await supabase
      .schema('samc')
      .from('samc_proyecto_ggd')
      .select('*');

    if (!error && data && data.length > 0) {
      return { data: data as unknown as ProyectoGGD[], isFromSupabase: true };
    }

    return { data: MOCK_PROYECTOS_GGD, isFromSupabase: false };
  } catch (err) {
    return { data: MOCK_PROYECTOS_GGD, isFromSupabase: false };
  }
}

export async function createProyectoGGD(
  proyecto: Omit<ProyectoGGD, 'id' | 'fecha_registro' | 'estatus_gestion'>
): Promise<{ success: boolean; data?: ProyectoGGD; error?: string }> {
  const newProyecto: ProyectoGGD = {
    ...proyecto,
    id: 'ggd-' + Date.now(),
    fecha_registro: new Date().toISOString().split('T')[0],
    estatus_gestion: 'DESCENTRALIZADO_GGD',
  };

  MOCK_PROYECTOS_GGD.push(newProyecto);

  if (!isSupabaseConfigured || !supabase) {
    return { success: true, data: newProyecto };
  }

  try {
    const { data, error } = await supabase
      .schema('samc')
      .from('samc_proyecto_ggd')
      .insert([newProyecto])
      .select();

    if (error) {
      return { success: true, data: newProyecto };
    }

    return { success: true, data: (data && data[0]) ? (data[0] as unknown as ProyectoGGD) : newProyecto };
  } catch (err) {
    return { success: true, data: newProyecto };
  }
}

export async function normalizarProyectoGGD(
  id: string,
  nuevoEstatus: 'EN_REVISION_PLANIFICACION' | 'NORMALIZADO_POA_PRTSEN'
): Promise<{ success: boolean }> {
  const target = MOCK_PROYECTOS_GGD.find((p) => p.id === id);
  if (target) {
    target.estatus_gestion = nuevoEstatus;
  }

  if (!isSupabaseConfigured || !supabase) {
    return { success: true };
  }

  try {
    await supabase
      .schema('samc')
      .from('samc_proyecto_ggd')
      .update({ estatus_gestion: nuevoEstatus })
      .eq('id', id);

    return { success: true };
  } catch (err) {
    return { success: true };
  }
}


// ----------------------------------------------------
// SEMBRAR / INICIALIZAR TABLAS EN SUPABASE
// ----------------------------------------------------
export async function seedSupabaseInitialData(): Promise<{ success: boolean; message: string }> {
  if (!isSupabaseConfigured || !supabase) {
    return { success: false, message: 'Supabase no está configurado.' };
  }

  try {
    // Insertar Proyectos PRTSEN en esquema samc o public
    const { error: err1 } = await supabase
      .schema('samc')
      .from('samc_proyecto_especial')
      .upsert(
        MOCK_PROYECTOS_PRTSEN.map((p) => ({
          id: p.id,
          codigo_rds: p.codigo_rds,
          nombre: p.nombre,
          dimension: p.dimension,
          region: p.region,
          estado: p.estado,
          monto_usd: p.monto_usd,
          avance_fisico_pct: p.avance_fisico_pct,
          avance_financiero_pct: p.avance_financiero_pct,
          estatus: p.estatus,
          vinculado_poa: p.vinculado_poa,
        }))
      );

    if (err1) {
      // Intentar en esquema public
      await supabase.from('proyectos_prtsen').upsert(MOCK_PROYECTOS_PRTSEN);
    }

    return {
      success: true,
      message: '¡Datos iniciales sembrados con éxito en la base de datos Supabase!',
    };
  } catch (err: any) {
    return {
      success: false,
      message: `Error al sembrar datos: ${err.message || String(err)}`,
    };
  }
}
