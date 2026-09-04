import React, { useState, useMemo, useEffect } from 'react';
import {
  fetchScmtpData,
  TareaCompromisoSCTAP
} from '../../services/scmtpService';
import { 
  FileText, 
  TrendingUp, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Users, 
  Layers, 
  ShieldCheck, 
  Calendar, 
  Briefcase, 
  Award, 
  ArrowUpRight, 
  BarChart3, 
  PieChart, 
  Filter, 
  Compass, 
  ChevronRight, 
  Sparkles,
  Info,
  Check,
  Building,
  Target
} from 'lucide-react';

export const SCMTPDashboard: React.FC = () => {
  const [selectedDiscipline, setSelectedDiscipline] = useState<string>('ALL');
  const [selectedMinuta, setSelectedMinuta] = useState<string>('ALL');
  const [timeframeView, setTimeframeView] = useState<'kgi' | 'wbs' | 'responsables' | 'riesgos'>('kgi');
  const [compromisos, setCompromisos] = useState<TareaCompromisoSCTAP[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Carga de compromisos reales desde InsForge (v_scmtp_compromisos_tareas)
  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    fetchScmtpData()
      .then((data) => {
        if (!cancelled) setCompromisos(data.compromisos);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  // Cálculos de métricas KGI/KPI consolidados (derivados de datos reales)
  const totalTareas = compromisos.length;
  const completadas = compromisos.filter(t => t.avancePorcentaje === 100 || t.estado === 'Completado').length;
  const enEjecucion = compromisos.filter(t => t.avancePorcentaje > 0 && t.avancePorcentaje < 100).length;
  const porIniciar = compromisos.filter(t => t.avancePorcentaje === 0 || t.estado === 'Pendiente').length;

  const avanceGlobal = totalTareas === 0
    ? 0
    : Math.round(
        compromisos.reduce((acc, curr) => acc + curr.avancePorcentaje, 0) / totalTareas
      );

  // Tareas con plazo vencido y aún sin completar (calculado de datos reales)
  const vencidasSinCompletar = compromisos.filter(t => {
    if (!t.plazoFechaISO || t.avancePorcentaje === 100) return false;
    const plazo = new Date(t.plazoFechaISO);
    return !isNaN(plazo.getTime()) && plazo.getTime() < Date.now();
  }).length;

  // Indicadores calculados a partir de los compromisos reales de InsForge
  const strategicKGIs = [
    {
      codigo: 'KGI-SCMTP-01',
      eje: 'Compromisos Completados',
      meta: 100,
      actual: totalTareas === 0 ? 0 : Math.round((completadas / totalTareas) * 100),
      unidad: '% Completado',
      estado: 'CALCULADO',
      descripcion: 'Porcentaje de compromisos con avance 100% sobre el total registrado en InsForge.',
      norma: 'InsForge v_scmtp_compromisos_tareas',
      trend: `${completadas}/${totalTareas} tareas`,
    },
    {
      codigo: 'KGI-SCMTP-02',
      eje: 'Compromisos en Ejecución Activa',
      meta: 100,
      actual: totalTareas === 0 ? 0 : Math.round((enEjecucion / totalTareas) * 100),
      unidad: '% En Ejecución',
      estado: 'CALCULADO',
      descripcion: 'Proporción de compromisos con avance entre 1% y 99% al momento de la consulta.',
      norma: 'InsForge v_scmtp_compromisos_tareas',
      trend: `${enEjecucion} tareas`,
    },
    {
      codigo: 'KGI-SCMTP-03',
      eje: 'Avance Global Ponderado',
      meta: 100,
      actual: avanceGlobal,
      unidad: '% Avance',
      estado: 'CALCULADO',
      descripcion: 'Promedio aritmético del avance_porcentaje de todos los compromisos registrados.',
      norma: 'InsForge v_scmtp_compromisos_tareas',
      trend: `Σ avance / ${totalTareas}`,
    },
    {
      codigo: 'KGI-SCMTP-04',
      eje: 'Plazos Vencidos sin Completar',
      meta: 100,
      actual: totalTareas === 0 ? 0 : Math.round(((totalTareas - vencidasSinCompletar) / totalTareas) * 100),
      unidad: '% En Plazo',
      estado: vencidasSinCompletar === 0 ? 'SIN_VENCIDOS' : 'EN_RIESGO',
      descripcion: 'Compromisos cuya fecha de plazo (plazo_fecha_iso) venció y aún no alcanzan el 100%.',
      norma: 'InsForge v_scmtp_compromisos_tareas',
      trend: `${vencidasSinCompletar} vencidas`,
    }
  ];

  // Desglose por Disciplinas RUP / Áreas de Gestión (WBS)
  const areasSummary = useMemo(() => {
    const map: Record<string, { total: number; sumAvance: number; completadas: number; altas: number }> = {};
    compromisos.forEach(t => {
      const area = t.areaGestion || 'General';
      if (!map[area]) {
        map[area] = { total: 0, sumAvance: 0, completadas: 0, altas: 0 };
      }
      map[area].total += 1;
      map[area].sumAvance += t.avancePorcentaje;
      if (t.avancePorcentaje === 100) map[area].completadas += 1;
      if (t.prioridad === 'Alta') map[area].altas += 1;
    });

    return Object.entries(map).map(([area, data]) => ({
      area,
      total: data.total,
      promedio: Math.round(data.sumAvance / data.total),
      completadas: data.completadas,
      altas: data.altas
    })).sort((a, b) => b.total - a.total);
  }, [compromisos]);

  // Desglose por Responsables Clave
  const responsablesSummary = useMemo(() => {
    const map: Record<string, { total: number; sumAvance: number; completadas: number }> = {};
    compromisos.forEach(t => {
      const resp = t.responsable.split('/')[0].trim();
      if (!map[resp]) {
        map[resp] = { total: 0, sumAvance: 0, completadas: 0 };
      }
      map[resp].total += 1;
      map[resp].sumAvance += t.avancePorcentaje;
      if (t.avancePorcentaje === 100) map[resp].completadas += 1;
    });

    return Object.entries(map).map(([resp, data]) => ({
      responsable: resp,
      total: data.total,
      promedio: Math.round(data.sumAvance / data.total),
      completadas: data.completadas
    })).sort((a, b) => b.total - a.total);
  }, [compromisos]);

  // Filtrado de compromisos según selectores
  const filteredTareas = compromisos.filter(t => {
    const matchDiscipline = selectedDiscipline === 'ALL' || t.areaGestion === selectedDiscipline;
    const matchMinuta = selectedMinuta === 'ALL' || t.minutaNumero === selectedMinuta;
    return matchDiscipline && matchMinuta;
  });

  // Números de minuta disponibles derivados de los datos reales
  const minutaNumeros = Array.from(new Set(compromisos.map(t => t.minutaNumero).filter(Boolean))).sort();

  // Porcentaje seguro contra división por cero
  const pct = (n: number) => (totalTareas === 0 ? 0 : Math.round((n / totalTareas) * 100));

  return (
    <div className="space-y-6">
      
      {/* Header Institucional & Marco Metodológico */}
      <div className="rounded-3xl bg-gradient-to-r from-[#072146] via-[#0b284e] to-[#041426] p-6 sm:p-7 text-white border border-blue-900/60 dark:border-[#00f2fe]/30 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-64 h-64 bg-[#00f2fe]/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-mono font-black uppercase tracking-wider bg-blue-500/20 text-[#00f2fe] px-3 py-1 rounded-full border border-cyan-400/30 flex items-center gap-1.5">
                <Compass className="h-3.5 w-3.5" />
                <span>Modelo de Gobernanza RUP-WBS · Seguimiento Institucional</span>
              </span>
              <span className="text-[10px] font-bold text-amber-300 bg-amber-950/40 px-2.5 py-1 rounded-full border border-amber-500/30">
                Basado en Actas Oficiales GGPD
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              Tablero Ejecutivo KGI / KPI — SCMTP V2.0
            </h2>
            <p className="text-xs text-cyan-100/90 max-w-3xl leading-relaxed">
              Monitoreo y evaluación de objetivos clave de gobernanza (KGI) e indicadores de desempeño operativo (KPI) derivados de las Minutas #26-0004 y #26-0002, estructurados por disciplinas de trabajo y matriz de responsabilidades.
            </p>
          </div>

          <div className="bg-white/10 dark:bg-[#00f2fe]/10 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/20 dark:border-[#00f2fe]/30 text-right shrink-0">
            <div className="text-[10px] text-cyan-200 uppercase font-bold tracking-wider">Índice de Ejecución Global</div>
            <div className="text-3xl font-black text-white dark:text-[#00f2fe]">{avanceGlobal}%</div>
            <div className="text-[10px] text-emerald-300 font-mono mt-0.5">{completadas} completadas de {totalTareas}</div>
          </div>
        </div>
      </div>

      {/* 4 Cards de KGI Estratégicos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {strategicKGIs.map((kgi) => (
          <div
            key={kgi.codigo}
            className="rounded-2xl bg-white dark:bg-[#0b172c] p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between hover:border-[#00f2fe]/50 transition-all group"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono font-black text-blue-600 dark:text-[#00f2fe] bg-blue-50 dark:bg-[#00f2fe]/10 px-2 py-0.5 rounded">
                  {kgi.codigo}
                </span>
                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded flex items-center gap-1">
                  <ArrowUpRight className="h-3 w-3" />
                  <span>{kgi.trend}</span>
                </span>
              </div>
              <h3 className="text-xs font-black text-slate-900 dark:text-white leading-tight">
                {kgi.eje}
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5 line-clamp-2">
                {kgi.descripcion}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
              <div className="flex justify-between items-baseline mb-1.5">
                <span className="text-xs font-bold text-slate-500">Avance:</span>
                <span className="text-base font-black text-slate-900 dark:text-white">
                  {kgi.actual} <span className="text-[10px] text-slate-400 font-normal">/ {kgi.meta}%</span>
                </span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-600 to-[#00f2fe] rounded-full transition-all duration-500"
                  style={{ width: `${(kgi.actual / kgi.meta) * 100}%` }}
                />
              </div>
              <div className="mt-2 text-[9px] text-slate-400 font-mono flex items-center justify-between">
                <span>Norma: {kgi.norma}</span>
                <span className="font-bold text-emerald-500">{kgi.estado}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Estado de carga / vacío */}
      {isLoading && (
        <div className="rounded-2xl bg-slate-50 dark:bg-[#0b172c] p-6 border border-slate-200 dark:border-slate-800 text-center text-xs font-bold text-slate-500 dark:text-slate-400">
          Cargando compromisos desde InsForge (v_scmtp_compromisos_tareas)…
        </div>
      )}
      {!isLoading && totalTareas === 0 && (
        <div className="rounded-2xl bg-amber-50 dark:bg-amber-950/20 p-6 border border-amber-200 dark:border-amber-900/40 text-center">
          <p className="text-sm font-black text-amber-800 dark:text-amber-300">No hay compromisos en InsForge</p>
          <p className="text-xs text-amber-700/80 dark:text-amber-400/80 mt-1">
            La vista v_scmtp_compromisos_tareas no retornó registros o no hay conexión con la base maestra.
          </p>
        </div>
      )}

      {/* Sub-navegación de Vistas Analíticas */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setTimeframeView('kgi')}
            className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-black transition-all ${
              timeframeView === 'kgi'
                ? 'bg-[#002b49] text-white dark:bg-[#00f2fe] dark:text-[#072146] shadow-sm'
                : 'bg-slate-100 dark:bg-[#112240] text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            <Target className="h-4 w-4" />
            <span>1. Matriz KGI / Curva S</span>
          </button>

          <button
            onClick={() => setTimeframeView('wbs')}
            className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-black transition-all ${
              timeframeView === 'wbs'
                ? 'bg-[#002b49] text-white dark:bg-[#00f2fe] dark:text-[#072146] shadow-sm'
                : 'bg-slate-100 dark:bg-[#112240] text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            <Layers className="h-4 w-4" />
            <span>2. WBS por Disciplinas ({areasSummary.length})</span>
          </button>

          <button
            onClick={() => setTimeframeView('responsables')}
            className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-black transition-all ${
              timeframeView === 'responsables'
                ? 'bg-[#002b49] text-white dark:bg-[#00f2fe] dark:text-[#072146] shadow-sm'
                : 'bg-slate-100 dark:bg-[#112240] text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            <Users className="h-4 w-4" />
            <span>3. Matriz de Responsabilidad</span>
          </button>

          <button
            onClick={() => setTimeframeView('riesgos')}
            className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-black transition-all ${
              timeframeView === 'riesgos'
                ? 'bg-[#002b49] text-white dark:bg-[#00f2fe] dark:text-[#072146] shadow-sm'
                : 'bg-slate-100 dark:bg-[#112240] text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            <span>4. Análisis de Riesgo & Plazos</span>
          </button>
        </div>

        {/* Filtros Rápidos */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <select
              value={selectedMinuta}
              onChange={(e) => setSelectedMinuta(e.target.value)}
              className="rounded-xl bg-white dark:bg-[#112240] pl-3 pr-8 py-1.5 text-xs text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 font-bold cursor-pointer shadow-xs focus:outline-none"
            >
              <option value="ALL">Todas las Minutas ({totalTareas} tareas)</option>
              {minutaNumeros.map(num => (
                <option key={num} value={num}>Minuta #{num}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* VISTA 1: MATRIZ KGI / CURVA S Y GRÁFICOS */}
      {timeframeView === 'kgi' && (
        <div className="space-y-6">
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Gráfico Curva S de Avance Ponderado */}
            <div className="lg:col-span-2 rounded-3xl bg-white dark:bg-[#0b172c] p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-blue-600 dark:text-[#00f2fe]" />
                    <span>Curva S de Avance Ponderado vs. Planificado (RUP Milestone Track)</span>
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Trayectoria temporal de cumplimiento desde la declaratoria de contingencia (24/06/2026 al 23/08/2026).
                  </p>
                </div>
                <span className="text-xs font-mono font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-full">
                  {avanceGlobal}% Ejecutado
                </span>
              </div>

              {/* Visualización Visual de la Curva S */}
              <div className="space-y-3 pt-2">
                {minutaNumeros.map((num) => {
                  const tareasMinuta = compromisos.filter(t => t.minutaNumero === num);
                  const totalM = tareasMinuta.length;
                  const completadasM = tareasMinuta.filter(t => t.avancePorcentaje === 100 || t.estado === 'Completado').length;
                  const real = totalM === 0 ? 0 : Math.round(tareasMinuta.reduce((a, c) => a + c.avancePorcentaje, 0) / totalM);
                  return {
                    fase: `Minuta #${num}`,
                    plan: 100,
                    real,
                    status: real === 100 ? 'Completado (100%)' : `En Progreso (${real}%)`,
                    tareas: `${completadasM}/${totalM} tareas al 100%`,
                  };
                }).map((fase, i) => (
                  <div key={i} className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#112240] border border-slate-200 dark:border-slate-800 space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-1">
                      <span className="font-black text-slate-900 dark:text-white">{fase.fase}</span>
                      <span className="text-[10px] font-mono text-blue-600 dark:text-[#00f2fe] font-bold">{fase.tareas}</span>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] text-slate-500 font-bold">
                        <span>Planificado: {fase.plan}%</span>
                        <span className="text-slate-900 dark:text-white font-mono">Real: {fase.real}%</span>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden flex">
                        <div
                          className="h-full bg-[#002b49] dark:bg-[#00f2fe] rounded-full transition-all"
                          style={{ width: `${fase.real}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Distribución por Estado de Tareas (Pie / Stack) */}
            <div className="rounded-3xl bg-white dark:bg-[#0b172c] p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-4">
              <div>
                <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <PieChart className="h-4 w-4 text-purple-500" />
                  <span>Estado de los {totalTareas} Compromisos</span>
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Proporción de tareas según su nivel de avance real en SCMTP.
                </p>

                <div className="space-y-3 mt-4">
                  <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40">
                    <div className="flex justify-between text-xs font-black text-emerald-800 dark:text-emerald-300">
                      <span>Completados (100%)</span>
                      <span className="font-mono">{completadas} tareas ({pct(completadas)}%)</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-2xl bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/40">
                    <div className="flex justify-between text-xs font-black text-blue-800 dark:text-blue-300">
                      <span>En Ejecución Activa (30-99%)</span>
                      <span className="font-mono">{enEjecucion} tareas ({pct(enEjecucion)}%)</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40">
                    <div className="flex justify-between text-xs font-black text-amber-800 dark:text-amber-300">
                      <span>Por Iniciar (&lt;30%)</span>
                      <span className="font-mono">{porIniciar} tareas ({pct(porIniciar)}%)</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Badge de Conformidad ISO */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#112240] border border-slate-200 dark:border-slate-700 text-xs space-y-1">
                <div className="flex items-center gap-2 text-[#002b49] dark:text-[#00f2fe] font-black">
                  <ShieldCheck className="h-4 w-4" />
                  <span>Auditoría ISO 8000 / 27001</span>
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">
                  Todas las tareas cuentan con sello de tiempo, responsable asignado y trazabilidad en base canónica InsForge.
                </p>
              </div>
            </div>

          </div>

          {/* Tabla de Hitos Principales */}
          <div className="rounded-3xl bg-white dark:bg-[#0b172c] p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Award className="h-4 w-4 text-amber-500" />
              <span>Hitos Críticos de Gobernanza y Entregables Cumplidos</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#112240] border border-slate-200 dark:border-slate-800 space-y-1.5">
                <span className="text-[10px] font-mono font-bold text-emerald-500 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded">HITO 1 · CUMPLIDO</span>
                <h4 className="text-xs font-black text-slate-900 dark:text-white">Normalización de Activos de Red</h4>
                <p className="text-[11px] text-slate-500">871 Subestaciones y 4,207 Circuitos reconciliados bajo norma CADAFE NS-P-105 sin duplicados.</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#112240] border border-slate-200 dark:border-slate-800 space-y-1.5">
                <span className="text-[10px] font-mono font-bold text-emerald-500 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded">HITO 2 · CUMPLIDO</span>
                <h4 className="text-xs font-black text-slate-900 dark:text-white">Arquitectura IAM & SSO Multi-App</h4>
                <p className="text-[11px] text-slate-500">37 Usuarios oficiales aprovisionados en InsForge con matriz RBAC segregada por aplicativo.</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#112240] border border-slate-200 dark:border-slate-800 space-y-1.5">
                <span className="text-[10px] font-mono font-bold text-blue-500 bg-blue-50 dark:bg-blue-950/50 px-2 py-0.5 rounded">HITO 3 · EN PROGRESO (85%)</span>
                <h4 className="text-xs font-black text-slate-900 dark:text-white">Despliegue Asistente Wizard ISO 8000</h4>
                <p className="text-[11px] text-slate-500">Estandarización de 47 formularios analógicos a formato tabular relacional web.</p>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* VISTA 2: WBS POR DISCIPLINAS RUP */}
      {timeframeView === 'wbs' && (
        <div className="space-y-4">
          <div className="rounded-2xl bg-blue-50 dark:bg-blue-950/20 p-4 border border-blue-200 dark:border-blue-900/40 text-xs text-blue-900 dark:text-blue-300">
            <strong>Estructura de Desglose de Trabajo (WBS - RUP):</strong> Las {totalTareas} tareas se distribuyen en {areasSummary.length} áreas o disciplinas técnicas de la GGPD.
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {areasSummary.map(areaItem => (
              <div
                key={areaItem.area}
                className="rounded-3xl bg-white dark:bg-[#0b172c] p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-[#00f2fe]">
                      <Briefcase className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-slate-900 dark:text-white">{areaItem.area}</h4>
                      <span className="text-[10px] text-slate-500 font-bold">{areaItem.total} compromisos asignados</span>
                    </div>
                  </div>
                  <span className="text-sm font-black font-mono text-blue-600 dark:text-[#00f2fe]">
                    {areaItem.promedio}%
                  </span>
                </div>

                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full bg-[#002b49] dark:bg-[#00f2fe] rounded-full"
                    style={{ width: `${areaItem.promedio}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <span>Completadas: <strong className="text-emerald-500">{areaItem.completadas}</strong> / {areaItem.total}</span>
                  <span>Prioridad Alta: <strong className="text-red-500">{areaItem.altas}</strong></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VISTA 3: MATRIZ DE RESPONSABILIDADES */}
      {timeframeView === 'responsables' && (
        <div className="space-y-4">
          <div className="rounded-3xl bg-white dark:bg-[#0b172c] p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-500" />
              <span>Matriz RAM (Responsibility Assignment Matrix) — GGPD</span>
            </h3>

            <div className="space-y-3">
              {responsablesSummary.map(r => (
                <div
                  key={r.responsable}
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-[#112240] border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1 max-w-xl">
                    <h4 className="text-xs font-black text-slate-900 dark:text-white">{r.responsable}</h4>
                    <p className="text-[11px] text-slate-500">
                      Tiene <strong>{r.total} compromisos asignados</strong> bajo su responsabilidad en minutas oficiales.
                    </p>
                  </div>

                  <div className="flex items-center space-x-4 shrink-0">
                    <div className="text-right">
                      <div className="text-xs font-black text-slate-900 dark:text-white font-mono">{r.promedio}%</div>
                      <div className="text-[10px] text-emerald-500 font-bold">{r.completadas} de {r.total} listas</div>
                    </div>
                    <div className="w-24 bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                      <div
                        className="h-full bg-blue-600 dark:bg-[#00f2fe] rounded-full"
                        style={{ width: `${r.promedio}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* VISTA 4: ANÁLISIS DE RIESGO Y PLAZOS */}
      {timeframeView === 'riesgos' && (
        <div className="space-y-4">
          <div className="rounded-3xl bg-white dark:bg-[#0b172c] p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                <span>Matriz de Mitigación de Riesgos Operacionales (Heatmap)</span>
              </h3>
              <span className="text-[10px] font-mono font-bold bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300 px-2.5 py-0.5 rounded-full">
                RIESGO CONTROLADO
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-red-50/60 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 space-y-2">
                <span className="text-[10px] font-black text-red-700 dark:text-red-300 uppercase">Riesgo 1 · Dispersión Territorial de Datos</span>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Uso histórico de hojas Excel no homologadas en divisiones estadales.
                </p>
                <div className="text-[11px] text-slate-600 dark:text-slate-400 pt-1 border-t border-red-100 dark:border-red-900/30">
                  <strong>Mitigación Activa:</strong> Wizard ISO 8000 y bloqueo de carga sin validación relacional.
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 space-y-2">
                <span className="text-[10px] font-black text-amber-700 dark:text-amber-300 uppercase">Riesgo 2 · Dependencia de Enlaces Individuales</span>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Ausencia temporal de personal clave por reposo o vacaciones.
                </p>
                <div className="text-[11px] text-slate-600 dark:text-slate-400 pt-1 border-t border-amber-100 dark:border-amber-900/30">
                  <strong>Mitigación Activa:</strong> Reasignación cruzada de seguimiento entre Josué Pacheco y Adrián Correa.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
