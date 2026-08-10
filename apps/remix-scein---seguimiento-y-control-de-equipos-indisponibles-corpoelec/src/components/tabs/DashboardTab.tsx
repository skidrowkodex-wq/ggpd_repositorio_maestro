import React from 'react';
import { EquipmentRecord } from '../../types';
import { getStateName } from '../../constants/states';
import { 
  Activity, 
  Euro, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Zap, 
  TrendingUp, 
  BarChart3, 
  PieChart as PieChartIcon, 
  ShieldCheck,
  Layers
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Legend 
} from 'recharts';

interface DashboardTabProps {
  records: EquipmentRecord[];
  loading: boolean;
}

export const DashboardTab: React.FC<DashboardTabProps> = ({ records, loading }) => {
  // Calculated KPIs
  const totalCount = records.length;
  
  const totalBudget = records.reduce((acc, curr) => acc + (Number(curr.total_budget_eur) || 0), 0);
  
  const resueltos = records.filter(r => r.status === 'RESUELTO').length;
  const enEjecucion = records.filter(r => r.status === 'EN EJECUCIÓN').length;
  const pendientes = records.filter(r => r.status === 'PENDIENTE').length;

  const resueltosPct = totalCount > 0 ? Math.round((resueltos / totalCount) * 100) : 0;
  const enEjecucionPct = totalCount > 0 ? Math.round((enEjecucion / totalCount) * 100) : 0;
  const pendientesPct = totalCount > 0 ? Math.round((pendientes / totalCount) * 100) : 0;

  const altaPriority = records.filter(r => r.priority === 'ALTA').length;
  const mediaPriority = records.filter(r => r.priority === 'MEDIA').length;
  const bajaPriority = records.filter(r => r.priority === 'BAJA').length;

  // Chart Data 1: Records per State
  const stateCountMap: { [code: string]: number } = {};
  records.forEach(r => {
    const code = r.state_code || 'S/E';
    stateCountMap[code] = (stateCountMap[code] || 0) + 1;
  });

  const stateChartData = Object.keys(stateCountMap).map(code => ({
    state: getStateName(code),
    code,
    cantidad: stateCountMap[code]
  })).sort((a, b) => b.cantidad - a.cantidad);

  // Chart Data 2: Status Donut Chart
  const statusPieData = [
    { name: 'RESUELTO', value: resueltos, color: '#10b981' }, // Emerald
    { name: 'EN EJECUCIÓN', value: enEjecucion, color: '#0284c7' }, // Sky
    { name: 'PENDIENTE', value: pendientes, color: '#f59e0b' } // Amber
  ].filter(d => d.value > 0);

  // Chart Data 3: Budget by Voltage Level
  const voltageBudgetMap: { [kv: string]: number } = {};
  records.forEach(r => {
    const kvLabel = `${r.voltage_in_kv} kV`;
    voltageBudgetMap[kvLabel] = (voltageBudgetMap[kvLabel] || 0) + (Number(r.total_budget_eur) || 0);
  });

  const voltageChartData = Object.keys(voltageBudgetMap).map(kv => ({
    voltage: kv,
    presupuesto: Math.round(voltageBudgetMap[kv])
  })).sort((a, b) => parseFloat(b.voltage) - parseFloat(a.voltage));

  if (loading) {
    return (
      <div className="py-20 text-center space-y-4">
        <div className="inline-block w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm text-slate-400">Cargando métricas e indicadores de la infraestructura eléctrica nacional...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Title Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Activity className="w-6 h-6 text-sky-600 dark:text-sky-400" />
            <span>Dashboard de Métricas & KPIs de Equipos Indisponibles</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
            Visualización consolidada de estatus operativo, presupuesto asignado (€) e impacto en el Sistema Eléctrico Nacional (SEN).
          </p>
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-mono text-sky-800 dark:text-cyan-300 shadow-sm">
          <Zap className="w-4 h-4 text-amber-500 dark:text-amber-400" />
          <span>Equipos Registrados: <strong>{totalCount}</strong></span>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Equipos */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-xl space-y-2">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Equipos</span>
            <div className="p-2 rounded-xl bg-sky-50 dark:bg-sky-950/80 text-sky-600 dark:text-sky-400 border border-sky-200 dark:border-sky-800/60">
              <Layers className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">{totalCount}</div>
          <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Monitoreo continuo GGPD</span>
          </p>
        </div>

        {/* Presupuesto Total */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-xl space-y-2">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Presupuesto Asignado</span>
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60">
              <Euro className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-emerald-700 dark:text-emerald-400 tracking-tight font-mono">
            € {totalBudget.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Inversión en Mantenimiento y Sustitución</span>
          </p>
        </div>

        {/* Estatus Resueltos vs Pendientes */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-xl space-y-2">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Estatus Operativo</span>
            <div className="p-2 rounded-xl bg-cyan-50 dark:bg-cyan-950/80 text-cyan-700 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-800/60">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-3">
            <span className="text-2xl font-extrabold text-emerald-700 dark:text-emerald-400">{resueltos}</span>
            <span className="text-xs text-slate-500 dark:text-slate-400">Resueltos ({resueltosPct}%)</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-950 rounded-full h-2 overflow-hidden flex border border-slate-200 dark:border-none">
            <div className="bg-emerald-500 h-full" style={{ width: `${resueltosPct}%` }}></div>
            <div className="bg-sky-500 h-full" style={{ width: `${enEjecucionPct}%` }}></div>
            <div className="bg-amber-500 h-full" style={{ width: `${pendientesPct}%` }}></div>
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 flex justify-between">
            <span>Ejecución: {enEjecucion}</span>
            <span>Pendientes: {pendientes}</span>
          </div>
        </div>

        {/* Prioridad Alta */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-xl space-y-2">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Distribución Prioridad</span>
            <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800/60">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-rose-600 dark:text-rose-400">{altaPriority}</span>
            <span className="text-xs text-slate-500 dark:text-slate-400">Atención Crítica (Alta)</span>
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between pt-1">
            <span>Media: <strong className="text-amber-600 dark:text-amber-400">{mediaPriority}</strong></span>
            <span>Baja: <strong className="text-slate-700 dark:text-slate-300">{bajaPriority}</strong></span>
          </div>
        </div>
      </div>

      {/* Interactive Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bar Chart: Equipos por Estado */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm dark:shadow-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200 font-semibold text-sm">
              <BarChart3 className="w-4 h-4 text-sky-600 dark:text-sky-400" />
              <span>Distribución de Equipos Indisponibles por Estado / Entidad Federal</span>
            </div>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">Gráfico por Estado</span>
          </div>

          <div className="h-72 w-full pt-2">
            {stateChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stateChartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="code" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                  <YAxis stroke="#94a3b8" tick={{ fontSize: 11 }} allowDecimals={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', color: '#f8fafc', fontSize: '12px' }}
                    formatter={(value: any) => [`${value} equipos`, 'Cantidad']}
                    labelFormatter={(label) => `Estado: ${getStateName(label)} (${label})`}
                  />
                  <Bar dataKey="cantidad" fill="#0284c7" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 text-xs">
                No hay datos para mostrar en este gráfico.
              </div>
            )}
          </div>
        </div>

        {/* Pie Chart: Status Distribution */}
        <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm dark:shadow-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200 font-semibold text-sm">
              <PieChartIcon className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Porcentaje por Estatus</span>
            </div>
          </div>

          <div className="h-72 w-full flex items-center justify-center">
            {statusPieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {statusPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', color: '#f8fafc', fontSize: '12px' }}
                    formatter={(value: any) => [`${value} equipos (${Math.round((value/totalCount)*100)}%)`, 'Cantidad']}
                  />
                  <Legend 
                    verticalAlign="bottom" 
                    height={36} 
                    formatter={(value) => <span className="text-xs text-slate-700 dark:text-slate-300 font-medium">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-slate-500 dark:text-slate-400 text-xs">Sin registros.</div>
            )}
          </div>
        </div>
      </div>

      {/* Chart 3: Presupuesto por Nivel de Tensión */}
      <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm dark:shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200 font-semibold text-sm">
            <Euro className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <span>Presupuesto Estimado Asignado por Nivel de Tensión (€ EUR)</span>
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">kV SEN</span>
        </div>

        <div className="h-64 w-full pt-2">
          {voltageChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={voltageChartData} layout="vertical" margin={{ top: 10, right: 30, left: 20, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis type="number" stroke="#94a3b8" tick={{ fontSize: 11 }} formatter={(val) => `€${(val/1000).toFixed(0)}k`} />
                <YAxis dataKey="voltage" type="category" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', color: '#f8fafc', fontSize: '12px' }}
                  formatter={(value: any) => [`€ ${Number(value).toLocaleString('es-ES')}`, 'Presupuesto']}
                />
                <Bar dataKey="presupuesto" fill="#10b981" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-400 text-xs">
              No hay datos presupuestarios disponibles.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
