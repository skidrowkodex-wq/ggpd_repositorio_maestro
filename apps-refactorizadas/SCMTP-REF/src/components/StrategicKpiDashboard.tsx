import React, { useMemo } from 'react';
import { 
  Target, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  Activity, 
  History, 
  ShieldCheck, 
  ArrowUpRight, 
  Sparkles,
  BarChart3,
  Users,
  FolderKanban
} from 'lucide-react';
import { TareaCompromiso } from '../types';

interface StrategicKpiDashboardProps {
  compromisos: TareaCompromiso[];
  onNavigateCompromisos: () => void;
}

interface EstadoBreakdown {
  total: number;
  pendiente: number;
  enProceso: number;
  completado: number;
  vencidas: number;
  avancePromedio: number;
  porArea: { area: string; total: number; completado: number; avancePromedio: number }[];
  porResponsable: { responsable: string; total: number; completado: number; avancePromedio: number }[];
}

function buildBreakdown(compromisos: TareaCompromiso[]): EstadoBreakdown {
  const total = compromisos.length;
  let pendiente = 0;
  let enProceso = 0;
  let completado = 0;
  let vencidas = 0;
  let sumaAvance = 0;
  const hoy = new Date().toISOString().split('T')[0];

  const areaMap = new Map<string, { total: number; completado: number; sumaAvance: number }>();
  const respMap = new Map<string, { total: number; completado: number; sumaAvance: number }>();

  for (const c of compromisos) {
    const estado = (c.estado || '').toLowerCase();
    if (estado === 'pendiente') pendiente++;
    else if (estado === 'en proceso') enProceso++;
    else if (estado === 'completado' || estado === 'completada') completado++;

    const avance = Number(c.avancePorcentaje) || 0;
    sumaAvance += avance;

    if (c.plazoFechaISO && c.plazoFechaISO < hoy && estado !== 'completado' && estado !== 'completada') {
      vencidas++;
    }

    const area = c.areaGestion || 'Sin área';
    const areaEntry = areaMap.get(area) || { total: 0, completado: 0, sumaAvance: 0 };
    areaEntry.total++;
    if (estado === 'completado' || estado === 'completada') areaEntry.completado++;
    areaEntry.sumaAvance += avance;
    areaMap.set(area, areaEntry);

    const resp = c.responsable || 'Sin responsable';
    const respEntry = respMap.get(resp) || { total: 0, completado: 0, sumaAvance: 0 };
    respEntry.total++;
    if (estado === 'completado' || estado === 'completada') respEntry.completado++;
    respEntry.sumaAvance += avance;
    respMap.set(resp, respEntry);
  }

  const porArea = Array.from(areaMap.entries())
    .map(([area, v]) => ({
      area,
      total: v.total,
      completado: v.completado,
      avancePromedio: v.total ? Math.round(v.sumaAvance / v.total) : 0,
    }))
    .sort((a, b) => b.total - a.total);

  const porResponsable = Array.from(respMap.entries())
    .map(([responsable, v]) => ({
      responsable,
      total: v.total,
      completado: v.completado,
      avancePromedio: v.total ? Math.round(v.sumaAvance / v.total) : 0,
    }))
    .sort((a, b) => b.total - a.total);

  return {
    total,
    pendiente,
    enProceso,
    completado,
    vencidas,
    avancePromedio: total ? Math.round(sumaAvance / total) : 0,
    porArea,
    porResponsable,
  };
}

export const StrategicKpiDashboard: React.FC<StrategicKpiDashboardProps> = ({
  compromisos,
  onNavigateCompromisos,
}) => {
  const [activeFilter, setActiveFilter] = React.useState<'all' | 'Pendiente' | 'En Proceso' | 'Completado' | 'Vencidas'>('all');

  const stats = useMemo(() => buildBreakdown(compromisos), [compromisos]);

  const pctCompletado = stats.total ? Math.round((stats.completado / stats.total) * 100) : 0;

  const filtered = compromisos.filter(c => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'Vencidas') {
      const hoy = new Date().toISOString().split('T')[0];
      const est = (c.estado || '').toLowerCase();
      return !!c.plazoFechaISO && c.plazoFechaISO < hoy && est !== 'completado' && est !== 'completada';
    }
    return (c.estado || '') === activeFilter;
  });

  return (
    <div className="space-y-6">
      
      {/* Strategic PM Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-[#002B49] to-slate-900 text-white p-6 rounded-2xl border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Target className="w-64 h-64 text-blue-400" />
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative z-10">
          <div className="space-y-2 max-w-3xl">
            <div className="flex items-center space-x-2.5">
              <span className="bg-[#E30613] text-white font-extrabold text-xs px-3 py-1 rounded-md shadow-xs flex items-center space-x-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Estrategia PM & Gobernanaza v2.0</span>
              </span>

              <span className="bg-blue-600/30 text-blue-300 font-bold text-xs px-2.5 py-1 rounded-md border border-blue-500/30 font-mono">
                Punto de Control: v1.0-checkpoint
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              Tablero de Control Estratégico de KGIs y KPIs CORPOELEC
            </h2>

            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed font-normal">
              Análisis experto de Project Management y Planificación Estratégica sobre los Indicadores Clave de Meta (<strong>KGI - Key Goal Indicators</strong>) e Indicadores Clave de Desempeño (<strong>KPI - Operational Indicators</strong>) derivados de los compromisos registrados de las minutas de reunión de la GGPD.
            </p>
          </div>

          {/* Version Control & Rollback Widget */}
          <div className="bg-slate-950/90 p-4 rounded-2xl border border-slate-800 shadow-lg min-w-[280px] space-y-3">
            <div className="flex items-center justify-between text-xs border-b border-slate-800 pb-2">
              <span className="text-slate-400 font-bold flex items-center space-x-1">
                <History className="w-3.5 h-3.5 text-cyan-400" />
                <span>Control de Versiones</span>
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                v2.0 Optimizada
              </span>
            </div>

            <div className="space-y-1 text-xs">
              <div className="text-slate-300 font-medium text-[11px]">Git Tag Activo: <code className="text-cyan-300 font-mono">v1.0-checkpoint</code></div>
              <div className="text-slate-400 text-[10px]">Datos fuente: Base de Datos InsForge (esquema scmtp)</div>
            </div>

            <div className="flex items-center space-x-2 pt-1">
              <button
                onClick={onNavigateCompromisos}
                className="w-full py-2 bg-[#E30613] hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5 cursor-pointer shadow-md"
              >
                <BarChart3 className="w-3 h-3" />
                <span>Ver Compromisos Operativos</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Strategic Summary Stat Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500 font-bold">
            <span>Compromisos Totales</span>
            <Target className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-[#002B49]">{stats.total}</div>
          <p className="text-[11px] text-slate-500 font-medium">Tareas registradas en minutas</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500 font-bold">
            <span>Avance Promedio</span>
            <Activity className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-700">{stats.total ? `${stats.avancePromedio}%` : '—'}</div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${stats.avancePromedio}%` }} />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500 font-bold">
            <span>Completadas</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-emerald-600">{stats.total ? `${stats.completado} (${pctCompletado}%)` : '—'}</div>
          <p className="text-[11px] text-slate-500 font-medium">Pendiente {stats.pendiente} · En Proceso {stats.enProceso}</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500 font-bold">
            <span>Vencidas</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-amber-600">{stats.vencidas}</div>
          <p className="text-[11px] text-slate-500 font-medium">Plazo excedido sin completar</p>
        </div>
      </div>

      {/* Filter and View Tabs */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-100 p-2.5 rounded-xl border border-slate-200 text-xs">
        <div className="flex items-center space-x-2 flex-wrap gap-y-2">
          <span className="font-bold text-slate-700 px-2">Filtrar Estado:</span>
          {([
            ['all', 'Todos', stats.total],
            ['Pendiente', 'Pendiente', stats.pendiente],
            ['En Proceso', 'En Proceso', stats.enProceso],
            ['Completado', 'Completado', stats.completado],
            ['Vencidas', 'Vencidas', stats.vencidas],
          ] as const).map(([key, label, count]) => (
            <button
              key={key}
              onClick={() => setActiveFilter(key)}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                activeFilter === key ? 'bg-[#002B49] text-white shadow-xs' : 'bg-white text-slate-700 hover:bg-slate-200'
              }`}
            >
              {label} ({count})
            </button>
          ))}
        </div>

        <button
          onClick={onNavigateCompromisos}
          className="px-3.5 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 font-bold rounded-lg transition-colors flex items-center space-x-1 cursor-pointer"
        >
          <span>Ver Tareas Operativas Relacionadas</span>
          <ArrowUpRight className="w-3.5 h-3.5 text-blue-600" />
        </button>
      </div>

      {stats.total === 0 ? (
        <div className="bg-white rounded-2xl border-2 border-dashed border-slate-200 p-12 text-center space-y-3">
          <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center mx-auto">
            <BarChart3 className="w-8 h-8" />
          </div>
          <h3 className="font-extrabold text-slate-800 text-base">No hay datos disponibles</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
            No se encontraron compromisos registrados en la base de datos. Importa una minuta o registra compromisos para visualizar los indicadores estratégicos.
          </p>
        </div>
      ) : (
        <>
          {/* Estado distribution */}
          <div className="bg-white rounded-2xl border-2 border-slate-200 shadow-sm overflow-hidden">
            <div className="bg-slate-50 p-4 border-b border-slate-200 flex items-center justify-between">
              <span className="font-extrabold text-[#002B49] text-sm flex items-center space-x-2">
                <TrendingUp className="w-4 h-4 text-blue-600" />
                <span>Distribución por Estado</span>
              </span>
              <span className="text-[11px] font-bold text-slate-500">{stats.total} compromisos</span>
            </div>
            <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-4">
              {([
                ['Pendiente', stats.pendiente, 'bg-amber-500'],
                ['En Proceso', stats.enProceso, 'bg-blue-500'],
                ['Completado', stats.completado, 'bg-emerald-500'],
              ] as const).map(([label, count, color]) => {
                const pct = stats.total ? Math.round((count / stats.total) * 100) : 0;
                return (
                  <div key={label} className="bg-slate-50/70 p-4 rounded-xl border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-700">{label}</span>
                      <span className="font-black text-slate-900">{count}</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
                      <div className={`${color} h-2.5 rounded-full`} style={{ width: `${pct}%` }} />
                    </div>
                    <div className="text-[10px] font-mono text-slate-500">{pct}% del total</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Detailed KPI List: filtered tasks */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-slate-900 text-sm flex items-center space-x-2">
                <Activity className="w-4 h-4 text-blue-600" />
                <span>Detalle Operativo {activeFilter !== 'all' ? `· ${activeFilter}` : ''}</span>
              </h3>
              <span className="text-xs font-bold text-slate-500">{filtered.length} resultado(s)</span>
            </div>

            {filtered.length === 0 ? (
              <div className="bg-white rounded-xl border border-dashed border-slate-200 p-6 text-center text-xs text-slate-500">
                Sin compromisos para el filtro seleccionado.
              </div>
            ) : (
              filtered.map(c => {
                const est = (c.estado || 'Pendiente');
                const isCompletado = est === 'Completado' || est === 'Completada';
                return (
                  <div key={c.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div className="space-y-1 flex-1 min-w-0">
                      <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center space-x-1 border ${
                          isCompletado
                            ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                            : est === 'En Proceso'
                            ? 'bg-blue-100 text-blue-900 border-blue-300'
                            : 'bg-amber-100 text-amber-900 border-amber-300'
                        }`}>
                          {isCompletado ? <CheckCircle2 className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                          <span>{est}</span>
                        </span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Minuta {c.minutaNumero || 'S/N'}</span>
                        {c.prioridad && <span className="text-[10px] font-bold text-slate-400">{c.prioridad}</span>}
                      </div>
                      <p className="font-bold text-slate-800 text-sm leading-snug">{c.compromiso}</p>
                      <div className="flex items-center space-x-3 text-[11px] text-slate-500 font-medium flex-wrap gap-y-1">
                        <span className="flex items-center space-x-1"><Users className="w-3 h-3 text-slate-400" />{c.responsable}</span>
                        {c.areaGestion && <span className="flex items-center space-x-1"><FolderKanban className="w-3 h-3 text-slate-400" />{c.areaGestion}</span>}
                        {c.plazoText && <span>Plazo: {c.plazoText}</span>}
                      </div>
                    </div>
                    <div className="md:w-40 shrink-0">
                      <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 mb-1">
                        <span>Avance</span>
                        <span className="text-slate-900">{c.avancePorcentaje}%</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                        <div className={`h-2 rounded-full ${c.avancePorcentaje >= 85 ? 'bg-emerald-500' : c.avancePorcentaje >= 40 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${c.avancePorcentaje || 0}%` }} />
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* KPI por Área y Responsable */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl border-2 border-slate-200 shadow-sm overflow-hidden">
              <div className="bg-slate-50 p-4 border-b border-slate-200">
                <span className="font-extrabold text-[#002B49] text-sm flex items-center space-x-2">
                  <FolderKanban className="w-4 h-4 text-blue-600" />
                  <span>KPI por Área de Gestión</span>
                </span>
              </div>
              <div className="p-4 space-y-3">
                {stats.porArea.length === 0 ? (
                  <p className="text-xs text-slate-500 text-center py-4">Sin datos de área.</p>
                ) : (
                  stats.porArea.slice(0, 8).map(a => (
                    <div key={a.area} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-800 truncate">{a.area}</span>
                        <span className="text-slate-500 font-bold">{a.completado}/{a.total} · {a.avancePromedio}%</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                        <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${a.avancePromedio}%` }} />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="bg-white rounded-2xl border-2 border-slate-200 shadow-sm overflow-hidden">
              <div className="bg-slate-50 p-4 border-b border-slate-200">
                <span className="font-extrabold text-[#002B49] text-sm flex items-center space-x-2">
                  <Users className="w-4 h-4 text-blue-600" />
                  <span>KPI por Responsable</span>
                </span>
              </div>
              <div className="p-4 space-y-3">
                {stats.porResponsable.length === 0 ? (
                  <p className="text-xs text-slate-500 text-center py-4">Sin datos de responsables.</p>
                ) : (
                  stats.porResponsable.slice(0, 8).map(r => (
                    <div key={r.responsable} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-800 truncate">{r.responsable}</span>
                        <span className="text-slate-500 font-bold">{r.completado}/{r.total} · {r.avancePromedio}%</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                        <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${r.avancePromedio}%` }} />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Strategic PM Framework Footer */}
      <div className="bg-slate-900 text-slate-300 p-5 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
        <div className="flex items-center space-x-3">
          <ShieldCheck className="w-6 h-6 text-emerald-400 shrink-0" />
          <div>
            <div className="font-extrabold text-white">Metodología ISO 21500 & PMI para Planificación Estratégica CORPOELEC</div>
            <div className="text-slate-400 text-[11px]">Indicadores derivados en tiempo real de los compromisos registrados en InsForge (esquema scmtp).</div>
          </div>
        </div>

        <button
          onClick={onNavigateCompromisos}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors cursor-pointer shrink-0"
        >
          Gestionar Compromisos
        </button>
      </div>

    </div>
  );
};