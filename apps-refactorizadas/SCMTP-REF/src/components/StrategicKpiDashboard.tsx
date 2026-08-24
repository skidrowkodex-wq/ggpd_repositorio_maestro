import React, { useState } from 'react';
import { 
  Target, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  Award, 
  Activity, 
  History, 
  Lightbulb, 
  ShieldCheck, 
  ArrowUpRight, 
  ArrowDownRight, 
  Minus,
  Sparkles,
  Zap,
  BarChart3,
  Layers,
  Database,
  RefreshCw,
  Info
} from 'lucide-react';
import { StrategicKgiKpi, TareaCompromiso } from '../types';
import { INITIAL_STRATEGIC_KPI_KGI_V2 } from '../data/initialData';

interface StrategicKpiDashboardProps {
  compromisos: TareaCompromiso[];
  onNavigateCompromisos: () => void;
}

export const StrategicKpiDashboard: React.FC<StrategicKpiDashboardProps> = ({
  compromisos,
  onNavigateCompromisos,
}) => {
  const [selectedVersion, setSelectedVersion] = useState<'v2.0' | 'v1.0'>('v2.0');
  const [activeKgiFilter, setActiveKgiFilter] = useState<string>('all');
  const [kgiDataList, setKgiDataList] = useState<StrategicKgiKpi[]>(INITIAL_STRATEGIC_KPI_KGI_V2);

  const filteredMetrics = kgiDataList.filter(item => {
    if (activeKgiFilter === 'all') return true;
    if (activeKgiFilter === 'riesgo') return item.kgiGoal.estadoMeta === 'Riesgo Moderado' || item.kgiGoal.estadoMeta === 'Atención Requerida';
    if (activeKgiFilter === 'meta') return item.kgiGoal.estadoMeta === 'En Meta';
    return true;
  });

  const handleRollbackToV1 = () => {
    setSelectedVersion('v1.0');
  };

  const handleApplyV2 = () => {
    setSelectedVersion('v2.0');
  };

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
              Análisis experto de Project Management y Planificación Estratégica sobre los Indicadores Clave de Meta (<strong>KGI - Key Goal Indicators</strong>) e Indicadores Clave de Desempeño (<strong>KPI - Operational Indicators</strong>) derivados de las minutas de reunión de la GGPD.
            </p>
          </div>

          {/* Version Control & Rollback Widget */}
          <div className="bg-slate-950/90 p-4 rounded-2xl border border-slate-800 shadow-lg min-w-[280px] space-y-3">
            <div className="flex items-center justify-between text-xs border-b border-slate-800 pb-2">
              <span className="text-slate-400 font-bold flex items-center space-x-1">
                <History className="w-3.5 h-3.5 text-cyan-400" />
                <span>Control de Versiones</span>
              </span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                selectedVersion === 'v2.0' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
              }`}>
                {selectedVersion === 'v2.0' ? 'v2.0 Optimizada' : 'v1.0 Base (Rollback)'}
              </span>
            </div>

            <div className="space-y-1 text-xs">
              <div className="text-slate-300 font-medium text-[11px]">Git Tag Activo: <code className="text-cyan-300 font-mono">v1.0-checkpoint</code></div>
              <div className="text-slate-400 text-[10px]">Guardado el: 03/08/2026 14:27 (28 archivos)</div>
            </div>

            <div className="flex items-center space-x-2 pt-1">
              {selectedVersion === 'v2.0' ? (
                <button
                  onClick={handleRollbackToV1}
                  className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold border border-slate-700 transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3 text-amber-400" />
                  <span>Simular Rollback a v1.0</span>
                </button>
              ) : (
                <button
                  onClick={handleApplyV2}
                  className="w-full py-2 bg-[#E30613] hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5 cursor-pointer shadow-md"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Activar Versión 2.0 PM</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Strategic Summary Stat Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500 font-bold">
            <span>KGIs Monitoreados</span>
            <Target className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-[#002B49]">4 Ejes</div>
          <p className="text-[11px] text-slate-500 font-medium">SEN, Comercial, POAN e ISO</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500 font-bold">
            <span>Promedio de Cumplimiento KGI</span>
            <Activity className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-700">84.0%</div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: '84%' }} />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500 font-bold">
            <span>Metas en Riesgo / Atención</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-amber-600">2 Metas</div>
          <p className="text-[11px] text-slate-500 font-medium">Transformadores & Cobrabilidad</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500 font-bold">
            <span>Cumplimiento ISO 27001/8000</span>
            <ShieldCheck className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-black text-purple-900">98.5%</div>
          <p className="text-[11px] text-slate-500 font-medium">Trazabilidad en Supabase / Drive</p>
        </div>
      </div>

      {/* Filter and View Tabs */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-100 p-2.5 rounded-xl border border-slate-200 text-xs">
        <div className="flex items-center space-x-2">
          <span className="font-bold text-slate-700 px-2">Filtrar Ejes:</span>
          <button
            onClick={() => setActiveKgiFilter('all')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              activeKgiFilter === 'all' ? 'bg-[#002B49] text-white shadow-xs' : 'bg-white text-slate-700 hover:bg-slate-200'
            }`}
          >
            Todos los Ejes (4)
          </button>
          <button
            onClick={() => setActiveKgiFilter('riesgo')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              activeKgiFilter === 'riesgo' ? 'bg-amber-600 text-white shadow-xs' : 'bg-white text-slate-700 hover:bg-slate-200'
            }`}
          >
            En Riesgo / Atención (2)
          </button>
          <button
            onClick={() => setActiveKgiFilter('meta')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              activeKgiFilter === 'meta' ? 'bg-emerald-600 text-white shadow-xs' : 'bg-white text-slate-700 hover:bg-slate-200'
            }`}
          >
            En Meta (2)
          </button>
        </div>

        <button
          onClick={onNavigateCompromisos}
          className="px-3.5 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 font-bold rounded-lg transition-colors flex items-center space-x-1 cursor-pointer"
        >
          <span>Ver Tareas Operativas Relacionadas</span>
          <ArrowUpRight className="w-3.5 h-3.5 text-blue-600" />
        </button>
      </div>

      {/* Detailed KGI / KPI List with PM Recommendations */}
      <div className="space-y-4">
        {filteredMetrics.map((item) => {
          const kgiRatio = Math.round((item.kgiGoal.valorActual / item.kgiGoal.metaTarget) * 100);

          return (
            <div 
              key={item.id} 
              className={`bg-white rounded-2xl border-2 transition-all shadow-sm overflow-hidden ${
                item.kgiGoal.estadoMeta === 'Atención Requerida'
                  ? 'border-red-200'
                  : item.kgiGoal.estadoMeta === 'Riesgo Moderado'
                  ? 'border-amber-200'
                  : 'border-slate-200'
              }`}
            >
              {/* Card Header */}
              <div className="bg-slate-50 p-4 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="bg-[#002B49] text-white text-[10px] font-extrabold px-2 py-0.5 rounded uppercase font-mono">
                      {item.kgiGoal.codigo}
                    </span>
                    <span className="text-xs font-bold text-slate-500">
                      Eje Estratégico: <strong className="text-slate-800">{item.ejeEstrategico}</strong>
                    </span>
                  </div>
                  <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">
                    {item.kgiGoal.descripcion}
                  </h3>
                </div>

                <div className="flex items-center space-x-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider flex items-center space-x-1 border ${
                    item.kgiGoal.estadoMeta === 'En Meta'
                      ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                      : item.kgiGoal.estadoMeta === 'Riesgo Moderado'
                      ? 'bg-amber-100 text-amber-900 border-amber-300'
                      : 'bg-red-100 text-red-900 border-red-300'
                  }`}>
                    {item.kgiGoal.estadoMeta === 'En Meta' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                    {item.kgiGoal.estadoMeta !== 'En Meta' && <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />}
                    <span>{item.kgiGoal.estadoMeta}</span>
                  </span>
                </div>
              </div>

              {/* Card Body Grid: KGI vs KPI */}
              <div className="p-5 grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Column 1: KGI (Indicador Clave de Meta) */}
                <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between border-b pb-2">
                    <span className="font-extrabold text-[#002B49] text-xs uppercase tracking-wider flex items-center space-x-1.5">
                      <Target className="w-4 h-4 text-blue-600" />
                      <span>KGI - Indicador Clave de Meta</span>
                    </span>
                    <span className="text-[11px] font-bold text-slate-500">Meta Anual 2026</span>
                  </div>

                  <div className="flex items-end justify-between">
                    <div>
                      <div className="text-xs text-slate-500 font-semibold">Valor Actual Alcanzado</div>
                      <div className="text-3xl font-black text-[#002B49] flex items-center space-x-2">
                        <span>{item.kgiGoal.valorActual}{item.kgiGoal.unidad.startsWith('%') ? '%' : ''}</span>
                        <span className="text-xs font-bold text-slate-500">/ {item.kgiGoal.metaTarget}{item.kgiGoal.unidad.startsWith('%') ? '%' : ''}</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-xs text-slate-500 font-semibold">Progreso Meta</div>
                      <div className="text-xl font-bold text-emerald-700">{kgiRatio}%</div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-1">
                    <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
                      <div 
                        className={`h-2.5 rounded-full transition-all duration-500 ${
                          kgiRatio >= 85 ? 'bg-emerald-500' : kgiRatio >= 70 ? 'bg-amber-500' : 'bg-red-500'
                        }`} 
                        style={{ width: `${kgiRatio}%` }} 
                      />
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                      <span>0%</span>
                      <span>Meta: {item.kgiGoal.metaAnual}</span>
                    </div>
                  </div>
                </div>

                {/* Column 2: KPI (Indicador Operativo) */}
                <div className="bg-blue-50/40 p-4 rounded-xl border border-blue-200 space-y-3">
                  <div className="flex items-center justify-between border-b border-blue-200 pb-2">
                    <span className="font-extrabold text-blue-900 text-xs uppercase tracking-wider flex items-center space-x-1.5">
                      <Activity className="w-4 h-4 text-blue-700" />
                      <span>KPI Operativo Asociado ({item.kpiOperational.codigo})</span>
                    </span>
                    <span className="bg-blue-100 text-blue-900 text-[10px] font-bold px-2 py-0.5 rounded border border-blue-300">
                      Frecuencia: {item.kpiOperational.frecuencia}
                    </span>
                  </div>

                  <p className="text-xs font-bold text-slate-800">
                    {item.kpiOperational.indicador}
                  </p>

                  <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                    <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                      <div className="text-[10px] text-slate-500 font-bold">Ejecución Operativa</div>
                      <div className="text-lg font-black text-slate-900">{item.kpiOperational.porcentajeEjecucion}%</div>
                    </div>

                    <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                      <div className="text-[10px] text-slate-500 font-bold">Responsable Principal</div>
                      <div className="text-xs font-bold text-slate-800 truncate">{item.kpiOperational.responsablePrincipal}</div>
                    </div>
                  </div>
                </div>

              </div>

              {/* PM Expert Recommendation Banner v2.0 */}
              <div className="bg-gradient-to-r from-amber-50 via-amber-100/60 to-orange-50 p-4 border-t border-amber-200 flex items-start space-x-3 text-xs">
                <div className="p-2 bg-amber-500 text-white rounded-xl shadow-xs mt-0.5 shrink-0">
                  <Lightbulb className="w-4 h-4" />
                </div>
                <div className="space-y-1">
                  <div className="font-extrabold text-amber-950 flex items-center space-x-2">
                    <span>Recomendación Experta de Project Management (v2.0):</span>
                    <span className="bg-amber-200/80 text-amber-900 text-[10px] font-extrabold px-2 py-0.2 rounded-full border border-amber-300">
                      Planificación Estratégica
                    </span>
                  </div>
                  <p className="text-slate-800 leading-relaxed font-medium">
                    {item.observacionEstrategica}
                  </p>
                </div>
              </div>

            </div>
          );
        })}
      </div>

      {/* Strategic PM Framework Footer */}
      <div className="bg-slate-900 text-slate-300 p-5 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
        <div className="flex items-center space-x-3">
          <ShieldCheck className="w-6 h-6 text-emerald-400 shrink-0" />
          <div>
            <div className="font-extrabold text-white">Metodología ISO 21500 & PMI para Planificación Estratégica CORPOELEC</div>
            <div className="text-slate-400 text-[11px]">Control de avance basado en Valor Ganado (EVM) y Alineación Plan Patria 2025-2031.</div>
          </div>
        </div>

        <button
          onClick={handleApplyV2}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors cursor-pointer shrink-0"
        >
          Guardar Estado Estratégico v2.0
        </button>
      </div>

    </div>
  );
};
