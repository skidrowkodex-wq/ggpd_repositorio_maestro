import { getSupabaseClient } from '../lib/supabase';
import { TiraInterrupcion, Despachador, CargaTira } from '../types';

// ─── Helpers de mapeo tolerante ────────────────────────────────────────────
// La vista pública `v_sctis_tiras_interrupcion` expone el evento con nombres de
// columna que pueden variar respecto a la tabla maestra. Estos lectores toman el
// primer valor no-nulo de un conjunto de aliases conocidos.

function pick(row: any, keys: string[], fallback: any = null): any {
  for (const k of keys) {
    const v = row?.[k];
    if (v !== undefined && v !== null && v !== '') return v;
  }
  return fallback;
}

function toNumber(v: any): number | null {
  const n = typeof v === 'number' ? v : Number.parseFloat(String(v ?? ''));
  return Number.isFinite(n) ? n : null;
}

export function mapTira(row: any): TiraInterrupcion {
  const duracionMin = toNumber(
    pick(row, ['duracion_minutos', 'duracion', 'horas_calculadas', 'horas'], null),
  );
  return {
    id: pick(row, ['id', 'tira_id'], String(Date.now())),
    codigoEstado: pick(row, ['codigo_estado', 'estado_codigo', 'estado'], null),
    estadoNombre: pick(row, ['estado_nombre', 'state_name'], null),
    sistema: pick(row, ['sistema', 'sistema_nombre'], null),
    jefatura: pick(row, ['jefatura', 'centro_despacho'], null),
    subestacionNombre: pick(row, ['subestacion_nombre', 'subestacion'], null),
    circuitoCodigo: pick(row, ['circuito_codigo', 'circuito'], null),
    fechaApertura: pick(row, ['fecha_apertura', 'fecha_inicio', 'fecha_falla'], null),
    fechaCierre: pick(row, ['fecha_cierre', 'fecha_fin'], null),
    duracionMinutos: duracionMin,
    duracionHoras: duracionMin != null ? Math.round(duracionMin / 60 * 100) / 100 : null,
    mes: pick(row, ['mes'], null),
    mwInterrumpidos: toNumber(pick(row, ['mw_interrumpidos', 'mw'], null)),
    kva: toNumber(pick(row, ['kva'], null)),
    racion: toNumber(pick(row, ['racion', 'clientes_afectados'], null)),
    causaCodigo: pick(row, ['causa_codigo'], null),
    causaNombre: pick(row, ['causa_nombre', 'causa'], null),
    observacion: pick(row, ['observacion', 'observaciones'], null),
    sectores: pick(row, ['sectores'], null),
    ciudad: pick(row, ['ciudad'], null),
    despachador: pick(row, ['despachador', 'despachador_nombre'], null),
    creadoEn: pick(row, ['created_at', 'creado_en'], null),
    actualizadoEn: pick(row, ['updated_at', 'actualizado_en'], null),
  };
}

export function mapDespachador(row: any): Despachador {
  return {
    id: pick(row, ['id', 'despachador_id'], String(Date.now())),
    codigoDespachador: pick(row, ['codigo_despachador'], null),
    nombre: pick(row, ['nombre', 'nombre_completo', 'nombre_despachador'], 'Sin nombre'),
    centroDespacho: pick(row, ['centro_despacho', 'cargo'], null),
    esActivo: pick(row, ['es_activo', 'activo'], true) !== false,
    createdAt: pick(row, ['created_at', 'createdAt'], null),
  };
}

// ─── Servicio: Tiras de Interrupción ───────────────────────────────────────

export async function cargarTiras(): Promise<{ tiras: TiraInterrupcion[]; error: string | null }> {
  const client = getSupabaseClient();
  if (!client) {
    return { tiras: [], error: 'No hay configuración de InsForge.' };
  }
  try {
    const { data, error } = await client.from('tiras').select('*');
    if (error) {
      return { tiras: [], error: error.message || 'Error de conexión con InsForge.' };
    }
    const tiras = (Array.isArray(data) ? data : []).map(mapTira);
    return { tiras, error: null };
  } catch (err: any) {
    return { tiras: [], error: err?.message || 'Error inesperado al cargar las tiras.' };
  }
}

export async function crearTira(payload: CargaTira): Promise<{ id: any; error: string | null }> {
  const client = getSupabaseClient();
  if (!client) return { id: null, error: 'No hay configuración de InsForge.' };
  try {
    const registro = toDbRecord(payload);
    const { data, error } = await client.from('tiras').insert([registro]);
    if (error) return { id: null, error: error.message || 'No se pudo persistir la tira.' };
    return { id: pick(data?.[0] || {}, ['id', 'tira_id'], null), error: null };
  } catch (err: any) {
    return { id: null, error: err?.message || 'Error inesperado al crear la tira.' };
  }
}

export async function eliminarTira(id: any): Promise<{ error: string | null }> {
  const client = getSupabaseClient();
  if (!client) return { error: 'No hay configuración de InsForge.' };
  try {
    const { error } = await client.from('tiras').delete().eq('id', id);
    if (error) return { error: error.message || 'No se pudo eliminar la tira.' };
    return { error: null };
  } catch (err: any) {
    return { error: err?.message || 'Error inesperado al eliminar la tira.' };
  }
}

// ─── Servicio: Despachadores ───────────────────────────────────────────────

export async function cargarDespachadores(): Promise<{ despachadores: Despachador[]; error: string | null }> {
  const client = getSupabaseClient();
  if (!client) {
    return { despachadores: [], error: 'No hay configuración de InsForge.' };
  }
  try {
    const { data, error } = await client.from('despachadores').select('*');
    if (error) {
      // Si el catálogo aún no está expuesto en la API pública, no se maqueta:
      // se devuelve lista vacía y el formulario queda sin sugerencias.
      console.warn('Despachadores no disponibles:', error.message);
      return { despachadores: [], error: null };
    }
    const despachadores = (Array.isArray(data) ? data : []).map(mapDespachador);
    return { despachadores, error: null };
  } catch (err: any) {
    console.warn('Despachadores no disponibles:', err?.message);
    return { despachadores: [], error: null };
  }
}

// ─── Conversión UI -> registro InsForge ────────────────────────────────────

function toDbRecord(payload: CargaTira): Record<string, any> {
  const r: Record<string, any> = {};
  if (payload.codigoEstado) r.codigo_estado = payload.codigoEstado;
  if (payload.sistema) r.sistema = payload.sistema;
  if (payload.jefatura) r.jefatura = payload.jefatura;
  if (payload.subestacionNombre) r.subestacion_nombre = payload.subestacionNombre;
  if (payload.circuitoCodigo) r.circuito_codigo = payload.circuitoCodigo;
  if (payload.fechaApertura) r.fecha_apertura = payload.fechaApertura;
  if (payload.fechaCierre) r.fecha_cierre = payload.fechaCierre;
  if (payload.duracionMinutos != null) r.duracion_minutos = payload.duracionMinutos;
  if (payload.mwInterrumpidos != null) r.mw_interrumpidos = payload.mwInterrumpidos;
  if (payload.causaCodigo) r.causa_codigo = payload.causaCodigo;
  if (payload.observacion) r.observacion = payload.observacion;
  if (payload.despachador) r.despachador = payload.despachador;
  if (payload.mes) r.mes = payload.mes;
  if (payload.ciudad) r.ciudad = payload.ciudad;
  if (payload.sectores) r.sectores = payload.sectores;
  return r;
}