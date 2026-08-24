import React, { useState, useMemo } from 'react';
import { 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  TrendingUp, 
  Users, 
  Calendar, 
  Target, 
  ChevronRight,
  FileText,
  Building2,
  ShieldAlert,
  ArrowUpRight,
  Zap,
  Layers,
  Sparkles,
  UserCheck,
  User,
  PieChart as PieChartIcon,
  BarChart3,
  Award,
  Lightbulb,
  Filter,
  Eye,
  Check,
  AlertTriangle,
  CalendarDays,
  CalendarRange,
  ArrowRight
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  PieChart, 
  Pie, 
  Cell, 
  CartesianGrid,
  AreaChart,
  Area,
  LineChart,
  Line
} from 'recharts';
import { MinutaReunion, TareaCompromiso, PendienteArea, UserProfile } from '../types';

interface TaskDashboardProps {
  currentProfile: UserProfile;
  activeMinuta: MinutaReunion | null; // null means 'all minutas consolidated'
  minutasList: MinutaReunion[];
  compromisos: TareaCompromiso[];
  pendientes: PendienteArea[];
  onSelectResponsableFilter: (responsable: string) => void;
  onSelectStatusFilter: (status: string) => void;
  onNavigateTab: (tab: string) => void;
  onOpenMinutaHistory: () => void;
}

const MONTH_NAMES_ES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

// Helper to format date "DD/MM/YYYY" or "YYYY-MM-DD" into Month and Year
const parseDateToMonthYear = (dateStr: string | undefined) => {
  if (!dateStr || dateStr.trim() === '') {
    return { monthName: 'Sin Fecha', year: 'N/A', sortKey: '0000-00', displayLabel: 'Sin Fecha' };
  }

  const clean = dateStr.trim();

  // If format "DD/MM/YYYY" or "DD-MM-YYYY"
  if (clean.includes('/') || (clean.includes('-') && clean.split('-')[0].length <= 2)) {
    const delimiter = clean.includes('/') ? '/' : '-';
    const parts = clean.split(delimiter);
    if (parts.length === 3) {
      const monthNum = parseInt(parts[1], 10);
      const year = parts[2].trim();
      if (!isNaN(monthNum) && monthNum >= 1 && monthNum <= 12) {
        const monthName = MONTH_NAMES_ES[monthNum - 1];
        return {
          monthName,
          year,
          sortKey: `${year}-${parts[1].padStart(2, '0')}`,
          displayLabel: `${monthName} ${year}`
        };
      }
    }
  }

  // If format "YYYY-MM-DD"
  if (clean.includes('-')) {
    const parts = clean.split('-');
    if (parts.length >= 2) {
      const year = parts[0];
      const monthNum = parseInt(parts[1], 10);
      if (!isNaN(monthNum) && monthNum >= 1 && monthNum <= 12) {
        const monthName = MONTH_NAMES_ES[monthNum - 1];
        return {
          monthName,
          year,
          sortKey: `${year}-${parts[1].padStart(2, '0')}`,
          displayLabel: `${monthName} ${year}`
        };
      }
    }
  }

  return { monthName: clean, year: '2026', sortKey: '2026-00', displayLabel: clean };
};

export const TaskDashboard: React.FC<TaskDashboardProps> = ({
  currentProfile,
  activeMinuta,
  minutasList,
  compromisos,
  pendientes,
  onSelectResponsableFilter,
  onSelectStatusFilter,
  onNavigateTab,
  onOpenMinutaHistory,
}) => {
  // Mode: 'global' or 'personal'
  const [viewScope, setViewScope] = useState<'global' | 'personal'>('global');
  const [selectedUserFilter, setSelectedUserFilter] = useState<string>('all');

  // Temporal Grouping Mode: 'emision' (Fecha de Minuta) vs 'plazo' (Fecha Límite/Vencimiento)
  const [temporalGroupingMode, setTemporalGroupingMode] = useState<'emision' | 'plazo'>('emision');
  const [selectedMonthFilter, setSelectedMonthFilter] = useState<string>('all');

  // Match current profile to name in compromisos
  const myName = currentProfile.name;
  const isElevatedUser = currentProfile?.role === 'admin' || currentProfile?.role === 'supervisor';

  // Filter compromisos if in personal mode or user selected a filter
  const displayedCompromisos = useMemo(() => {
    if (viewScope === 'personal') {
      return compromisos.filter(c => 
        c.responsable.toLowerCase().includes(myName.toLowerCase()) ||
        myName.toLowerCase().includes(c.responsable.toLowerCase())
      );
    }
    if (selectedUserFilter !== 'all') {
      return compromisos.filter(c => c.responsable === selectedUserFilter);
    }
    return compromisos;
  }, [compromisos, viewScope, selectedUserFilter, myName]);

  // Overall Global Stats
  const globalTotal = compromisos.length;
  const globalCompletados = compromisos.filter(c => c.estado === 'Completado').length;
  const globalAvancePromedio = globalTotal > 0 
    ? Math.round(compromisos.reduce((acc, c) => acc + (c.avancePorcentaje || 0), 0) / globalTotal)
    : 0;

  // Personal Stats
  const myCompromisos = useMemo(() => {
    return compromisos.filter(c => 
      c.responsable.toLowerCase().includes(myName.toLowerCase()) ||
      myName.toLowerCase().includes(c.responsable.toLowerCase())
    );
  }, [compromisos, myName]);

  const myTotal = myCompromisos.length;
  const myCompletados = myCompromisos.filter(c => c.estado === 'Completado').length;
  const myEnProceso = myCompromisos.filter(c => c.estado === 'En Proceso').length;

  const myAvancePromedio = myTotal > 0 
    ? Math.round(myCompromisos.reduce((acc, c) => acc + (c.avancePorcentaje || 0), 0) / myTotal)
    : 0;

  // Contribution percentage to overall completed tasks
  const myContributionToGlobal = globalCompletados > 0 
    ? Math.round((myCompletados / globalCompletados) * 100)
    : 0;

  // Stats for displayed list
  const totalCompromisos = displayedCompromisos.length;
  const completados = displayedCompromisos.filter(c => c.estado === 'Completado').length;
  const enProceso = displayedCompromisos.filter(c => c.estado === 'En Proceso').length;
  const pendientesCount = displayedCompromisos.filter(c => c.estado === 'Pendiente' || c.estado === 'En Revisión').length;

  const totalAvance = totalCompromisos > 0 
    ? Math.round(displayedCompromisos.reduce((acc, c) => acc + (c.avancePorcentaje || 0), 0) / totalCompromisos)
    : 0;

  // MONTH & YEAR GROUPED DATA
  const monthYearGroupedData = useMemo(() => {
    const map = new Map<string, { 
      displayLabel: string;
      sortKey: string;
      year: string;
      monthName: string;
      total: number;
      completados: number;
      enProceso: number;
      pendientes: number;
      sumAvance: number;
      compromisos: TareaCompromiso[];
    }>();

    displayedCompromisos.forEach(c => {
      const dateToUse = temporalGroupingMode === 'emision' 
        ? c.minutaFecha 
        : (c.plazoFechaISO || c.plazoText || c.minutaFecha);
      
      const parsed = parseDateToMonthYear(dateToUse);
      const key = parsed.displayLabel;

      if (!map.has(key)) {
        map.set(key, {
          displayLabel: key,
          sortKey: parsed.sortKey,
          year: parsed.year,
          monthName: parsed.monthName,
          total: 0,
          completados: 0,
          enProceso: 0,
          pendientes: 0,
          sumAvance: 0,
          compromisos: [],
        });
      }

      const item = map.get(key)!;
      item.total += 1;
      if (c.estado === 'Completado') item.completados += 1;
      else if (c.estado === 'En Proceso') item.enProceso += 1;
      else item.pendientes += 1;
      item.sumAvance += (c.avancePorcentaje || 0);
      item.compromisos.push(c);
    });

    return Array.from(map.values())
      .map(item => ({
        ...item,
        promedioAvance: item.total > 0 ? Math.round(item.sumAvance / item.total) : 0
      }))
      .sort((a, b) => a.sortKey.localeCompare(b.sortKey));
  }, [displayedCompromisos, temporalGroupingMode]);

  // Tasks filtered by month selection
  const tasksForSelectedMonth = useMemo(() => {
    if (selectedMonthFilter === 'all') return displayedCompromisos;
    const found = monthYearGroupedData.find(m => m.displayLabel === selectedMonthFilter);
    return found ? found.compromisos : displayedCompromisos;
  }, [selectedMonthFilter, monthYearGroupedData, displayedCompromisos]);

  // Data for Recharts Pie Chart (Status Distribution)
  const statusChartData = useMemo(() => {
    return [
      { name: 'Completado', value: completados, color: '#10B981' },
      { name: 'En Proceso', value: enProceso, color: '#3B82F6' },
      { name: 'Pendiente', value: pendientesCount, color: '#F59E0B' },
      { name: 'Detenido / Riesgo', value: displayedCompromisos.filter(c => c.estado === 'Detenido').length, color: '#EF4444' },
    ].filter(item => item.value > 0);
  }, [completados, enProceso, pendientesCount, displayedCompromisos]);

  // Data for Recharts Bar Chart (Performance per Responsable)
  const responsableChartData = useMemo(() => {
    const map = new Map<string, { total: number; completados: number; enProceso: number; promedioAvance: number }>();
    
    compromisos.forEach(c => {
      const resp = c.responsable || 'Sin Asignar';
      if (!map.has(resp)) {
        map.set(resp, { total: 0, completados: 0, enProceso: 0, promedioAvance: 0 });
      }
      const item = map.get(resp)!;
      item.total += 1;
      if (c.estado === 'Completado') item.completados += 1;
      if (c.estado === 'En Proceso') item.enProceso += 1;
    });

    return Array.from(map.entries()).map(([nombre, stat]) => {
      // Short name for chart label
      const shortName = nombre.split(' ').slice(0, 2).join(' ');
      return {
        fullName: nombre,
        shortName: shortName,
        Total: stat.total,
        Completados: stat.completados,
        'En Proceso': stat.enProceso,
      };
    }).sort((a, b) => b.Total - a.Total);
  }, [compromisos]);

  // Comparison Chart: Personal vs GGPD Average
  const personalVsGlobalChartData = useMemo(() => {
    return [
      {
        categoria: '% Avance Promedio',
        'Mi Desempeño': myAvancePromedio,
        'Promedio General GGPD': globalAvancePromedio,
      },
      {
        categoria: '% Tareas Completadas',
        'Mi Desempeño': myTotal > 0 ? Math.round((myCompletados / myTotal) * 100) : 0,
        'Promedio General GGPD': globalTotal > 0 ? Math.round((globalCompletados / globalTotal) * 100) : 0,
      }
    ];
  }, [myAvancePromedio, globalAvancePromedio, myTotal, myCompletados, globalTotal, globalCompletados]);

  // Eje Estratégico POAN chart data
  const ejeEstrategicoChartData = useMemo(() => {
    const map = new Map<string, { count: number; sumAvance: number }>();
    compromisos.forEach(c => {
      const eje = c.ejeEstrategico || 'Operación SEN General';
      if (!map.has(eje)) {
        map.set(eje, { count: 0, sumAvance: 0 });
      }
      const item = map.get(eje)!;
      item.count += 1;
      item.sumAvance += (c.avancePorcentaje || 0);
    });

    return Array.from(map.entries()).map(([eje, data]) => ({
      eje: eje.length > 25 ? `${eje.substring(0, 22)}...` : eje,
      ejeFull: eje,
      porcentajeAvance: Math.round(data.sumAvance / data.count),
      totalTareas: data.count,
    }));
  }, [compromisos]);

  // Upcoming deadlines
  const upcomingDeadlines = useMemo(() => {
    return [...displayedCompromisos]
      .filter(c => c.estado !== 'Completado')
      .sort((a, b) => (a.plazoFechaISO || '9999').localeCompare(b.plazoFechaISO || '9999'))
      .slice(0, 5);
  }, [displayedCompromisos]);

  return (
    <div className="space-y-6">
      
      {/* Executive Header Banner */}
      <div className="bg-gradient-to-r from-[#002B49] via-[#001D33] to-[#002B49] border border-slate-800 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-[#E30613]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute left-1/3 bottom-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2.5 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="bg-[#E30613] text-white font-black text-xs px-2.5 py-1 rounded-md uppercase tracking-wider shadow-xs flex items-center space-x-1">
                <BarChart3 className="w-3.5 h-3.5" />
                <span>{activeMinuta ? `Minuta #${activeMinuta.numero}` : `Vista Consolidada Multiminuta (${minutasList.length})`}</span>
              </span>

              <span className="text-cyan-200 text-xs flex items-center space-x-1 font-medium bg-slate-900/80 px-2.5 py-1 rounded border border-slate-700">
                <UserCheck className="w-3.5 h-3.5 text-cyan-400" />
                <span>Usuario Conectado: <strong>{currentProfile.name}</strong> (@{currentProfile.username})</span>
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white leading-tight">
              SISTEMA INTEGRADO DE SEGUIMIENTO, TABLEROS Y AUDITORÍA DE MINUTAS DE DISTRIBUCIÓN
            </h1>

            <p className="text-slate-200 text-xs sm:text-sm leading-relaxed bg-slate-950/70 p-3 rounded-xl border border-slate-800 font-sans">
              <strong className="text-cyan-400 font-bold">
                {activeMinuta ? 'Objetivo de Sesión: ' : 'Consolidado General: '}
              </strong> 
              {activeMinuta ? activeMinuta.objetivo : 'Módulo institucional de control multiminuta que consolida los compromisos operativos, el cumplimiento de metas PRTSEN y el seguimiento individualizado de tareas en las gerencias de CORPOELEC.'}
            </p>
          </div>

          {/* Scope Selector: Personal vs Global */}
          <div className="bg-slate-950/90 p-4.5 rounded-2xl border border-slate-800 space-y-3 min-w-[280px] flex-shrink-0 shadow-inner">
            <div className="flex items-center justify-between text-xs border-b border-slate-800 pb-2">
              <span className="text-slate-400 font-semibold flex items-center space-x-1">
                <Filter className="w-3.5 h-3.5 text-cyan-400" />
                <span>Enfoque de Análisis</span>
              </span>
              <span className="text-cyan-300 font-mono text-[10px] font-bold">
                {viewScope === 'personal' ? 'Mi Aporte' : 'Equipo GGPD'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-900 rounded-xl border border-slate-800 text-xs">
              <button
                onClick={() => setViewScope('global')}
                className={`py-2 px-2.5 rounded-lg font-bold transition-all flex items-center justify-center space-x-1 cursor-pointer ${
                  viewScope === 'global' 
                    ? 'bg-[#002B49] text-white shadow-xs border border-cyan-500/30' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Global GGPD</span>
              </button>

              <button
                onClick={() => setViewScope('personal')}
                className={`py-2 px-2.5 rounded-lg font-bold transition-all flex items-center justify-center space-x-1 cursor-pointer ${
                  viewScope === 'personal' 
                    ? 'bg-[#E30613] text-white shadow-xs' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>Mi Aporte ({myTotal})</span>
              </button>
            </div>

            <div className="text-[11px] text-slate-400 pt-1 flex items-center justify-between">
              <span>Minuta Activa:</span>
              <button 
                onClick={onOpenMinutaHistory}
                className="text-cyan-400 hover:underline font-bold"
              >
                {activeMinuta ? `#${activeMinuta.numero}` : 'Todas'} (Cambiar)
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* INDIVIDUAL PERFORMANCE & CONTRIBUTION PANEL (Respuesta directa a la consulta del usuario) */}
      <div className="bg-gradient-to-r from-blue-900/20 via-slate-900 to-indigo-950/30 border-2 border-blue-500/30 rounded-2xl p-5 shadow-lg space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-blue-600 text-white rounded-xl shadow-md">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="font-extrabold text-white text-base">
                  Evaluación de Desempeño e Impacto Individual: {currentProfile.name}
                </h2>
                <span className="bg-blue-600 text-white text-[10px] font-extrabold px-2 py-0.5 rounded uppercase">
                  {currentProfile.role === 'admin' ? 'Administrador' : currentProfile.role === 'supervisor' ? 'Supervisor' : 'Analista de Planificación'}
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Visor comparativo de aporte individual frente al cumplimiento global de la división.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs text-slate-300 font-medium">Filtrar tabla por responsable:</span>
            <select
              value={selectedUserFilter}
              onChange={(e) => {
                setSelectedUserFilter(e.target.value);
                if (e.target.value !== 'all') setViewScope('global');
              }}
              className="bg-slate-950 text-white text-xs font-bold border border-slate-700 rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Ver Todos los Responsables</option>
              {responsableChartData.map(r => (
                <option key={r.fullName} value={r.fullName}>{r.fullName}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Metrics comparison grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 space-y-1">
            <div className="text-xs text-slate-400 font-bold">Tareas Asignadas a Mí</div>
            <div className="text-2xl font-black text-white">{myTotal} Tareas</div>
            <div className="text-[11px] text-slate-400">
              {myCompletados} Completadas • {myEnProceso} En Curso
            </div>
          </div>

          <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 space-y-1">
            <div className="text-xs text-slate-400 font-bold">Mi Avance Promedio</div>
            <div className="text-2xl font-black text-emerald-400">{myAvancePromedio}%</div>
            <div className="text-[11px] text-slate-400">
              vs {globalAvancePromedio}% Promedio Global GGPD
            </div>
          </div>

          <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 space-y-1">
            <div className="text-xs text-slate-400 font-bold">Aporte al Cumplimiento Total</div>
            <div className="text-2xl font-black text-cyan-400">{myContributionToGlobal}%</div>
            <div className="text-[11px] text-slate-400">
              de los {globalCompletados} compromisos logrados
            </div>
          </div>

          <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 space-y-1">
            <div className="text-xs text-slate-400 font-bold">Diagnóstico de Desempeño PM</div>
            <div className={`text-sm font-extrabold flex items-center space-x-1 ${
              myAvancePromedio >= globalAvancePromedio ? 'text-emerald-400' : 'text-amber-400'
            }`}>
              {myAvancePromedio >= globalAvancePromedio ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Aporte Altamente Positivo</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Requiere Aceleración</span>
                </>
              )}
            </div>
            <div className="text-[10px] text-slate-300 line-clamp-1">
              {myAvancePromedio >= globalAvancePromedio 
                ? 'Superas el promedio general de entregas de la GGPD.'
                : 'Prioriza tus compromisos próximos a vencer para nivelar.'}
            </div>
          </div>
        </div>

        {/* Comparison Chart: My Performance vs Global GGPD */}
        <div className="bg-slate-950/90 p-4 rounded-xl border border-slate-800">
          <div className="flex items-center justify-between text-xs font-bold text-white mb-3">
            <span className="flex items-center space-x-1.5">
              <TrendingUp className="w-4 h-4 text-cyan-400" />
              <span>Comparativo: Mi Desempeño vs. Promedio General de la GGPD</span>
            </span>
            <span className="text-slate-400 text-[10px]">Actualización en Tiempo Real</span>
          </div>

          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={personalVsGlobalChartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="categoria" stroke="#94A3B8" tick={{ fontSize: 11 }} />
                <YAxis stroke="#94A3B8" domain={[0, 100]} tick={{ fontSize: 11 }} unit="%" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '12px', color: '#FFF', fontSize: '12px' }} 
                  formatter={(value) => [`${value}%`, '']}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '5px' }} />
                <Bar dataKey="Mi Desempeño" fill="#10B981" radius={[6, 6, 0, 0]} barSize={40} />
                <Bar dataKey="Promedio General GGPD" fill="#3B82F6" radius={[6, 6, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Compromisos */}
        <div 
          onClick={() => onNavigateTab('compromisos')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              {viewScope === 'personal' ? 'Mis Tareas Totales' : 'Compromisos Registrados'}
            </span>
            <div className="p-2.5 bg-slate-100 rounded-xl text-[#002B49] group-hover:bg-[#002B49] group-hover:text-white transition-colors">
              <Target className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-black text-slate-900">{totalCompromisos}</span>
            <span className="text-xs text-slate-500 font-medium">tareas en total</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-500 border-t border-slate-100 pt-2">
            <span>{activeMinuta ? `Minuta #${activeMinuta.numero}` : `${minutasList.length} Minutas`}</span>
            <span className="text-[#E30613] font-bold flex items-center group-hover:translate-x-0.5 transition-transform">
              Ver lista <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
            </span>
          </div>
        </div>

        {/* En Proceso */}
        <div 
          onClick={() => {
            onSelectStatusFilter('En Proceso');
            onNavigateTab('compromisos');
          }}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700">
              En Ejecución Operativa
            </span>
            <div className="p-2.5 bg-blue-50 rounded-xl text-blue-700 group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-black text-slate-900">{enProceso}</span>
            <span className="text-xs text-blue-700 font-bold">
              {totalCompromisos > 0 ? Math.round((enProceso / totalCompromisos) * 100) : 0}% activo
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-500 border-t border-slate-100 pt-2">
            <span>En curso</span>
            <span className="text-blue-700 font-bold flex items-center group-hover:translate-x-0.5 transition-transform">
              Filtrar <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
            </span>
          </div>
        </div>

        {/* Completados */}
        <div 
          onClick={() => {
            onSelectStatusFilter('Completado');
            onNavigateTab('compromisos');
          }}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">
              Completados / Certificados
            </span>
            <div className="p-2.5 bg-emerald-50 rounded-xl text-emerald-700 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-black text-slate-900">{completados}</span>
            <span className="text-xs text-emerald-700 font-bold">
              {totalCompromisos > 0 ? Math.round((completados / totalCompromisos) * 100) : 0}% finalizado
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-500 border-t border-slate-100 pt-2">
            <span>Entregas completas</span>
            <span className="text-emerald-700 font-bold flex items-center group-hover:translate-x-0.5 transition-transform">
              Ver entregas <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
            </span>
          </div>
        </div>

        {/* Avance General Promedio */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              {viewScope === 'personal' ? 'Mi Cumplimiento Promedio' : 'Cumplimiento General'}
            </span>
            <div className="p-2.5 bg-purple-50 rounded-xl text-purple-700">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-black text-slate-900">{totalAvance}%</span>
            <span className="text-xs text-purple-700 font-bold">promedio ponderado</span>
          </div>
          <div className="mt-3 w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
            <div 
              className="bg-gradient-to-r from-[#E30613] via-amber-500 to-emerald-500 h-2.5 rounded-full transition-all duration-500"
              style={{ width: `${totalAvance}%` }}
            />
          </div>
        </div>

      </div>

      {/* MODULE: AGRUPACIÓN Y VISUALIZACIÓN POR MES Y AÑO */}
      <div className="bg-white rounded-2xl border-2 border-cyan-600/30 shadow-md p-5 sm:p-6 space-y-5">
        
        {/* Module Header & Mode Selectors */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-cyan-50 text-cyan-800 rounded-xl border border-cyan-200">
                <CalendarRange className="w-5 h-5 text-cyan-700" />
              </div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                Agrupación y Distribución de Tareas por Mes y Año
              </h2>
            </div>
            <p className="text-xs text-slate-500">
              Visualización temporal de compromisos asignados agrupados cronológicamente por su período de emisión o fecha límite.
            </p>
          </div>

          {/* Grouping Mode Toggle */}
          <div className="bg-slate-100 p-1 rounded-xl flex items-center border border-slate-200 self-start md:self-auto">
            <button
              onClick={() => {
                setTemporalGroupingMode('emision');
                setSelectedMonthFilter('all');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer ${
                temporalGroupingMode === 'emision'
                  ? 'bg-[#002B49] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <CalendarDays className="w-3.5 h-3.5 text-cyan-400" />
              <span>Por Mes/Año de Emisión (Minuta)</span>
            </button>

            <button
              onClick={() => {
                setTemporalGroupingMode('plazo');
                setSelectedMonthFilter('all');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer ${
                temporalGroupingMode === 'plazo'
                  ? 'bg-[#002B49] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>Por Mes/Año de Vencimiento (Plazo)</span>
            </button>
          </div>
        </div>

        {/* Monthly Summary Cards Grid */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700">
            <span>
              Períodos Detectados ({monthYearGroupedData.length} {temporalGroupingMode === 'emision' ? 'meses de minutas' : 'meses de vencimiento'}):
            </span>
            {selectedMonthFilter !== 'all' && (
              <button
                onClick={() => setSelectedMonthFilter('all')}
                className="text-[#E30613] hover:underline font-bold text-xs cursor-pointer"
              >
                Ver Todos los Meses
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {monthYearGroupedData.map((m) => {
              const isSelected = selectedMonthFilter === m.displayLabel;
              return (
                <div
                  key={m.displayLabel}
                  onClick={() => setSelectedMonthFilter(isSelected ? 'all' : m.displayLabel)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer space-y-3 relative overflow-hidden ${
                    isSelected
                      ? 'bg-slate-900 text-white border-cyan-500 ring-2 ring-cyan-400/40 shadow-lg'
                      : 'bg-slate-50 hover:bg-slate-100/80 text-slate-900 border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1.5 font-black text-sm">
                      <Calendar className={`w-4 h-4 ${isSelected ? 'text-cyan-400' : 'text-[#E30613]'}`} />
                      <span>{m.displayLabel}</span>
                    </div>
                    <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                      isSelected ? 'bg-cyan-500 text-slate-950' : 'bg-slate-200 text-slate-700'
                    }`}>
                      {m.total} {m.total === 1 ? 'tarea' : 'tareas'}
                    </span>
                  </div>

                  {/* Progress Bar & Stats */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className={isSelected ? 'text-slate-300' : 'text-slate-500'}>Avance Promedio:</span>
                      <strong className={`font-mono font-bold ${isSelected ? 'text-cyan-300' : 'text-slate-900'}`}>
                        {m.promedioAvance}%
                      </strong>
                    </div>
                    <div className={`w-full h-2 rounded-full overflow-hidden ${isSelected ? 'bg-slate-800' : 'bg-slate-200'}`}>
                      <div
                        className="bg-gradient-to-r from-blue-500 to-emerald-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${m.promedioAvance}%` }}
                      />
                    </div>
                  </div>

                  {/* Badges Breakdown */}
                  <div className="flex items-center justify-between text-[10px] pt-1 border-t border-slate-200/50">
                    <span className="text-emerald-600 font-bold">✓ {m.completados} completadas</span>
                    <span className="text-blue-600 font-bold">⏱ {m.enProceso} en proceso</span>
                    {m.pendientes > 0 && (
                      <span className="text-amber-600 font-bold">! {m.pendientes} pendientes</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recharts Monthly Volume & Progress Evolution Chart */}
        <div className="bg-slate-950 p-4.5 rounded-xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-white">
            <span className="flex items-center space-x-1.5">
              <BarChart3 className="w-4 h-4 text-cyan-400" />
              <span>Gráfico de Evolución y Volumen Mensual ({temporalGroupingMode === 'emision' ? 'Año 2026 de Emisión' : 'Vencimiento por Mes/Año'})</span>
            </span>
            <span className="text-slate-400 text-[10px]">
              {selectedMonthFilter === 'all' ? 'Mostrando Todos los Meses' : `Filtrado por: ${selectedMonthFilter}`}
            </span>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthYearGroupedData} margin={{ top: 10, right: 20, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="displayLabel" stroke="#94A3B8" tick={{ fontSize: 11 }} />
                <YAxis stroke="#94A3B8" tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '12px', color: '#FFF', fontSize: '12px' }}
                  formatter={(value, name) => [
                    name === 'promedioAvance' ? `${value}%` : `${value} tareas`,
                    name === 'completados' ? 'Completadas' : name === 'enProceso' ? 'En Proceso' : name === 'pendientes' ? 'Pendientes' : '% Avance Promedio'
                  ]}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Bar dataKey="completados" name="Completadas" fill="#10B981" stackId="a" radius={[0, 0, 0, 0]} barSize={35} />
                <Bar dataKey="enProceso" name="En Proceso" fill="#3B82F6" stackId="a" radius={[0, 0, 0, 0]} barSize={35} />
                <Bar dataKey="pendientes" name="Pendientes" fill="#F59E0B" stackId="a" radius={[4, 4, 0, 0]} barSize={35} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Selected Month Task Table / Detail List */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <h3 className="font-extrabold text-slate-900 text-sm flex items-center space-x-2">
              <FileText className="w-4 h-4 text-[#E30613]" />
              <span>
                Detalle de Tareas {selectedMonthFilter === 'all' ? 'de Todos los Meses' : `Asignadas en: ${selectedMonthFilter}`}
              </span>
              <span className="bg-slate-100 text-slate-800 text-xs px-2 py-0.5 rounded font-mono font-bold">
                {tasksForSelectedMonth.length} Tareas
              </span>
            </h3>

            <button
              onClick={() => onNavigateTab('compromisos')}
              className="text-xs bg-[#002B49] text-white px-3 py-1.5 rounded-lg font-bold flex items-center space-x-1 hover:bg-slate-900 transition-colors cursor-pointer"
            >
              <span>Abrir en Tabla de Compromisos</span>
              <ArrowRight className="w-3.5 h-3.5 text-cyan-400" />
            </button>
          </div>

          <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden bg-white max-h-72 overflow-y-auto">
            {tasksForSelectedMonth.slice(0, 8).map((task) => (
              <div key={task.id} className="p-3 hover:bg-slate-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div className="space-y-1 flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-[#E30613] bg-red-50 border border-red-200 px-1.5 py-0.2 rounded text-[10px]">
                      Minuta #{task.minutaNumero} ({task.minutaFecha})
                    </span>
                    <span className="text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.2 rounded font-semibold">
                      Plazo: {task.plazoText}
                    </span>
                  </div>
                  <p className="font-semibold text-slate-800 line-clamp-1">
                    {task.compromiso}
                  </p>
                </div>

                <div className="flex items-center space-x-3 shrink-0">
                  <div className="text-right">
                    <span className="font-bold text-slate-900 block">{task.responsable}</span>
                    <span className="text-[10px] text-slate-500">{task.avancePorcentaje}% completado</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    task.estado === 'Completado' ? 'bg-emerald-100 text-emerald-800' :
                    task.estado === 'En Proceso' ? 'bg-blue-100 text-blue-800' :
                    'bg-amber-100 text-amber-800'
                  }`}>
                    {task.estado}
                  </span>
                </div>
              </div>
            ))}

            {tasksForSelectedMonth.length > 8 && (
              <div className="p-2.5 text-center bg-slate-50 text-slate-500 text-xs font-semibold">
                Y {tasksForSelectedMonth.length - 8} tareas más en este período...
              </div>
            )}
          </div>
        </div>

      </div>

      {/* CHARTS SECTION (Recharts Integration) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Chart 1: Distribution by Status (Donut Chart) */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center space-x-2">
              <PieChartIcon className="w-5 h-5 text-[#002B49]" />
              <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">
                Distribución de Tareas por Estado Operativo
              </h3>
            </div>
            <span className="text-xs text-slate-500 font-bold bg-slate-100 px-2 py-0.5 rounded">
              {totalCompromisos} Tareas
            </span>
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {statusChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(val, name) => [`${val} compromisos`, name]}
                  contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '12px', color: '#FFF', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Performance per Responsable (Bar Chart) */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center space-x-2">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">
                Carga y Cumplimiento por Responsable
              </h3>
            </div>
            <span className="text-xs text-slate-500 font-bold bg-slate-100 px-2 py-0.5 rounded">
              {responsableChartData.length} Analistas
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={responsableChartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="shortName" stroke="#64748B" tick={{ fontSize: 10 }} interval={0} angle={-15} textAnchor="end" />
                <YAxis stroke="#64748B" tick={{ fontSize: 10 }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '12px', color: '#FFF', fontSize: '12px' }} 
                  labelFormatter={(name) => {
                    const found = responsableChartData.find(r => r.shortName === name);
                    return found ? found.fullName : name;
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '5px' }} />
                <Bar dataKey="Total" fill="#94A3B8" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Completados" fill="#10B981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="En Proceso" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Chart 3: Ejes Estratégicos POAN Alignment */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2">
            <Zap className="w-5 h-5 text-[#E30613]" />
            <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">
              Avance Ponderado por Eje Estratégico POAN / PRTSEN
            </h3>
          </div>
          <span className="text-xs text-slate-500 font-bold bg-slate-100 px-2.5 py-1 rounded">
            Plan Patria 2025-2031
          </span>
        </div>

        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart layout="vertical" data={ejeEstrategicoChartData} margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis type="number" domain={[0, 100]} unit="%" stroke="#64748B" tick={{ fontSize: 10 }} />
              <YAxis type="category" dataKey="eje" stroke="#64748B" tick={{ fontSize: 10 }} width={140} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '12px', color: '#FFF', fontSize: '12px' }}
                formatter={(val) => [`${val}% avance`, 'Cumplimiento']}
                labelFormatter={(label) => {
                  const item = ejeEstrategicoChartData.find(e => e.eje === label);
                  return item ? item.ejeFull : label;
                }}
              />
              <Bar dataKey="porcentajeAvance" fill="#002B49" radius={[0, 6, 6, 0]} barSize={20}>
                {ejeEstrategicoChartData.map((entry, index) => (
                  <Cell 
                    key={`cell-eje-${index}`} 
                    fill={entry.porcentajeAvance >= 80 ? '#10B981' : entry.porcentajeAvance >= 50 ? '#3B82F6' : '#F59E0B'} 
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Main Grid: Deadlines and Critical Areas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Upcoming Deadlines Widget */}
        <div className={`bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4 ${
          isElevatedUser ? 'lg:col-span-2' : 'lg:col-span-3'
        }`}>
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-1">
            <div className="flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-[#E30613]" />
              <h2 className="text-base font-extrabold text-slate-900">
                Próximos Vencimientos {viewScope === 'personal' ? 'Personales' : 'del Equipo'}
              </h2>
            </div>
            <span className="text-xs text-[#E30613] bg-red-50 font-extrabold px-2.5 py-1 rounded border border-red-100">
              Prioridad de Atención
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {upcomingDeadlines.map((task) => (
              <div 
                key={task.id}
                onClick={() => onNavigateTab('compromisos')}
                className="p-3.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors cursor-pointer text-xs space-y-2 flex flex-col justify-between"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-[#E30613] bg-red-50 px-2 py-0.5 rounded border border-red-200 text-[10px]">
                      Plazo: {task.plazoText}
                    </span>
                    <span className="text-[10px] font-bold text-slate-500 uppercase truncate max-w-[120px]">
                      Minuta #{task.minutaNumero}
                    </span>
                  </div>

                  <p className="font-bold text-slate-800 line-clamp-2 text-xs">
                    {task.compromiso}
                  </p>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-200">
                  <span className="font-semibold text-slate-700">{task.responsable}</span>
                  <span className="text-slate-800 font-bold bg-slate-200 px-2 py-0.5 rounded">{task.avancePorcentaje}% realizado</span>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() => onNavigateTab('compromisos')}
            className="w-full mt-2 bg-[#002B49] hover:bg-slate-900 text-white text-xs font-bold py-2.5 rounded-xl transition-colors flex items-center justify-center space-x-2 cursor-pointer shadow-sm"
          >
            <span>Ver Todos los Compromisos</span>
            <ChevronRight className="w-4 h-4 text-cyan-400" />
          </button>
        </div>

        {/* Critical Area Pendientes Overview (Only visible for Admin/Supervisor) */}
        {isElevatedUser && (
          <div className="bg-[#002B49] text-white rounded-2xl p-5 border border-slate-800 shadow-md flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center space-x-2.5">
                  <div className="p-2 bg-red-950/80 text-red-400 rounded-xl border border-red-800/60">
                    <ShieldAlert className="w-4 h-4 text-[#E30613]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-white">Pendientes por Área</h3>
                    <p className="text-[11px] text-slate-300">Asuntos estratégicos no resueltos</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2.5">
                {pendientes.slice(0, 3).map((p) => (
                  <div 
                    key={p.id}
                    onClick={() => onNavigateTab('pendientes')}
                    className="bg-slate-900/90 hover:bg-slate-900 p-3 rounded-xl border border-slate-800 transition-all cursor-pointer space-y-1.5 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="bg-[#E30613] text-white font-extrabold px-1.5 py-0.2 rounded text-[9px] uppercase">
                        {p.area}
                      </span>
                      <span className="text-slate-400 text-[10px] truncate max-w-[120px]">
                        {p.dependeDe}
                      </span>
                    </div>
                    <p className="text-slate-200 font-medium line-clamp-2">
                      {p.pendiente}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => onNavigateTab('pendientes')}
              className="w-full text-xs bg-slate-900 hover:bg-slate-800 text-cyan-300 py-2.5 rounded-xl border border-slate-700 font-bold transition-colors flex items-center justify-center space-x-1 cursor-pointer"
            >
              <span>Ver Todos los Pendientes ({pendientes.length})</span>
              <ChevronRight className="w-3.5 h-3.5 text-cyan-400" />
            </button>
          </div>
        )}

      </div>

    </div>
  );
};
