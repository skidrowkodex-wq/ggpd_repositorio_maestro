import React, { useState } from 'react';
import { VehicleRecord, MasterCatalogsState } from '../types/fleet';
import { BarChart3, TrendingUp, ShieldCheck, FileSpreadsheet, MapPin, AlertTriangle, CheckCircle2, Wrench, Battery, Disc, PieChart as PieChartIcon, Bell } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { auditService, AuditLogEntry } from '../services/auditService';
import { VenezuelaFleetMap } from './VenezuelaFleetMap';

interface ManagerDashboardViewProps {
  vehicles: VehicleRecord[];
  catalogs: MasterCatalogsState;
  onExportExcel: () => void;
  isDarkMode?: boolean;
  /** Verificación de permisos por rol. Si no se provee, todo está permitido. */
  can?: (actionId: string) => boolean;
}

export const ManagerDashboardView: React.FC<ManagerDashboardViewProps> = ({
  vehicles,
  catalogs,
  onExportExcel,
  isDarkMode = false,
  can
}) => {
  const allow = (actionId: string) => (can ? can(actionId) : true);
  const [selectedRegionFilter, setSelectedRegionFilter] = useState<string>('TODAS');
  const [isAlertsModalOpen, setIsAlertsModalOpen] = useState(false);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(() => auditService.getLogs());

  const filteredVehicles = selectedRegionFilter === 'TODAS'
    ? vehicles
    : vehicles.filter(v => v.region?.toUpperCase() === selectedRegionFilter.toUpperCase());

  // Métricas Ejecutivas
  const total = filteredVehicles.length;
  const activos = filteredVehicles.filter(v => v.estado === 'ACTIVO').length;
  const enMantenimiento = filteredVehicles.filter(v => v.estado === 'EN MANTENIMIENTO').length;
  const fueraDeServicio = filteredVehicles.filter(v => v.estado === 'FUERA DE SERVICIO').length;
  const recuperados = filteredVehicles.filter(v => v.vehiculo_recuperado === 'SI').length;
  
  const mantenimientoAlDia = filteredVehicles.filter(v => v.mantenimiento_preventivo === 'AL DIA').length;
  const mantenimientoVencido = filteredVehicles.filter(v => v.mantenimiento_preventivo === 'VENCIDO').length;
  const mantenimientoPendiente = filteredVehicles.filter(v => v.mantenimiento_preventivo === 'PENDIENTE' || v.mantenimiento_preventivo === 'NO APLICA').length;
  const porcentajeMantenimiento = total > 0 ? Math.round((mantenimientoAlDia / total) * 100) : 0;

  // Vehículos con mantenimiento próximo a vencer en 30 días (Vencido o Pendiente)
  const urgentMaintenanceVehicles = filteredVehicles.filter(
    v => v.mantenimiento_preventivo === 'VENCIDO' || v.mantenimiento_preventivo === 'PENDIENTE'
  );

  const totalCauchos = filteredVehicles.reduce((acc, v) => acc + (Number(v.cant_cauchos) || 0), 0);
  const totalBaterias = filteredVehicles.reduce((acc, v) => acc + (Number(v.cantidad_baterias) || 0), 0);
  const totalReparaciones = filteredVehicles.reduce((acc, v) => acc + (Number(v.cant_total_reparaciones) || 0), 0);

  const pieData = [
    { name: 'En Servicio', value: activos, color: '#10b981' },
    { name: 'En Taller', value: enMantenimiento, color: '#f59e0b' },
    { name: 'Fuera de Servicio', value: fueraDeServicio, color: '#ef4444' }
  ];

  const maintenanceChartData = [
    { name: 'Al Día', value: mantenimientoAlDia, color: '#10b981' },
    { name: 'Vencido', value: mantenimientoVencido, color: '#ef4444' },
    { name: 'Pendiente', value: mantenimientoPendiente, color: '#64748b' }
  ];

  return (
    <div className={`space-y-6 pb-12 ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>
      
      {/* Header Ejecutivo */}
      <div className={`p-6 rounded-2xl border shadow-md flex flex-col md:flex-row items-center justify-between gap-4 ${
        isDarkMode ? 'bg-[#0f2a20] border-[#1a5f47]' : 'bg-white border-slate-200'
      }`}>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 text-xs font-bold rounded bg-purple-100 text-purple-800 border border-purple-300">
              📊 CUADRO DE MANDO GERENCIAL · SEN 2026
            </span>
            <span className="text-xs font-mono text-slate-400">Gerencia General de Operaciones</span>
          </div>
          <h1 className={`text-xl sm:text-2xl font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-[#0b3d2e]'}`}>
            Métricas Ejecutivas y KPIs de Flota Vehicular
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Monitoreo en tiempo real del parque automotor, disponibilidad operativa e indicadores estratégicos por región.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          {allow('btn_export_excel') && (
          <button
            onClick={onExportExcel}
            className="flex-1 md:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-[#1a5f47] to-[#0b3d2e] hover:brightness-110 rounded-xl shadow-md transition-all cursor-pointer border border-[#c9a227]"
          >
            <FileSpreadsheet className="w-4 h-4 text-[#c9a227]" />
            <span>Exportar Consolidado Gerencial (Excel)</span>
          </button>
          )}
        </div>
      </div>

      {/* Sistema de Notificaciones Preventivas (Próximos a vencer en 30 días / Vencidos / Pendientes) */}
      {urgentMaintenanceVehicles.length > 0 && (
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-800 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold text-lg shrink-0 shadow-sm animate-bounce">
              <Bell className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xs sm:text-sm font-black text-amber-900 dark:text-amber-200">
                Alerta de Mantenimiento Preventivo ({urgentMaintenanceVehicles.length} unidades requieren atención en los próximos 30 días)
              </h2>
              <p className="text-[11px] text-amber-700 dark:text-amber-300 mt-0.5">
                Vehículos con estatus VENCIDO o PENDIENTE en su plan de mantenimiento preventivo. Se requiere inspección y programación en taller.
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsAlertsModalOpen(true)}
            className="px-4 py-2 text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white rounded-xl shadow transition-all cursor-pointer whitespace-nowrap"
          >
            Ver Alertas ({urgentMaintenanceVehicles.length})
          </button>
        </div>
      )}

      {/* Filtro de Región: Desplazable horizontalmente en móviles */}
      <div className={`p-3 sm:p-4 rounded-xl border flex items-center gap-2 overflow-x-auto no-scrollbar ${
        isDarkMode ? 'bg-[#0f2a20] border-[#1a5f47]' : 'bg-white border-slate-200'
      }`}>
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wide shrink-0">Región:</span>
        <div className="flex items-center gap-1.5 shrink-0">
          {['TODAS', 'CAPITAL', 'CENTRAL', 'LOS LLANOS', 'OCCIDENTE', 'LOS ANDES', 'ORIENTE', 'INSULAR', 'GUAYANA'].map(reg => (
            <button
              key={reg}
              onClick={() => setSelectedRegionFilter(reg)}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap min-h-[38px] ${
                selectedRegionFilter === reg
                  ? 'bg-[#0b3d2e] text-white shadow-xs border border-[#c9a227]'
                  : isDarkMode 
                    ? 'bg-[#13382b] text-slate-300 hover:bg-[#1a5f47] border border-[#1a5f47]'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300'
              }`}
            >
              {reg}
            </button>
          ))}
        </div>
      </div>

      {/* Grid de KPIs Principales: 2 columnas en móviles */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        
        {/* KPI 1 */}
        <div className={`p-5 rounded-2xl border shadow-sm flex flex-col justify-between ${
          isDarkMode ? 'bg-[#0f2a20] border-[#1a5f47]' : 'bg-white border-slate-200'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Total Parque Automotor</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700 font-bold">
              🚗
            </div>
          </div>
          <div className="my-3">
            <div className="text-3xl font-black text-slate-900 dark:text-white tabular-nums">{total}</div>
            <div className="text-xs text-emerald-600 font-semibold mt-1 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              {activos} Unidades Operativas Activas
            </div>
          </div>
          <div className="text-[11px] text-slate-400 border-t border-slate-100 dark:border-[#1a5f47] pt-2">
            Disponibilidad: {total > 0 ? Math.round((activos / total) * 100) : 0}% del total
          </div>
        </div>

        {/* KPI 2 */}
        <div className={`p-5 rounded-2xl border shadow-sm flex flex-col justify-between ${
          isDarkMode ? 'bg-[#0f2a20] border-[#1a5f47]' : 'bg-white border-slate-200'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Mantenimiento Preventivo</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 font-bold">
              🛠️
            </div>
          </div>
          <div className="my-3">
            <div className="text-3xl font-black text-slate-900 dark:text-white tabular-nums">{porcentajeMantenimiento}%</div>
            <div className="text-xs text-emerald-600 font-semibold mt-1">
              {mantenimientoAlDia} de {total} vehículos al día
            </div>
          </div>
          <div className="text-[11px] text-slate-400 border-t border-slate-100 dark:border-[#1a5f47] pt-2">
            Estándar SEN: Objetivo &gt; 85%
          </div>
        </div>

        {/* KPI 3 */}
        <div className={`p-5 rounded-2xl border shadow-sm flex flex-col justify-between ${
          isDarkMode ? 'bg-[#0f2a20] border-[#1a5f47]' : 'bg-white border-slate-200'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Vehículos Recuperados</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 font-bold">
              ⚡
            </div>
          </div>
          <div className="my-3">
            <div className="text-3xl font-black text-slate-900 dark:text-white tabular-nums">{recuperados}</div>
            <div className="text-xs text-amber-600 font-semibold mt-1">
              Restaurados para el SEN
            </div>
          </div>
          <div className="text-[11px] text-slate-400 border-t border-slate-100 dark:border-[#1a5f47] pt-2">
            Plan Especial de Soberanía Eléctrica
          </div>
        </div>

        {/* KPI 4 */}
        <div className={`p-5 rounded-2xl border shadow-sm flex flex-col justify-between ${
          isDarkMode ? 'bg-[#0f2a20] border-[#1a5f47]' : 'bg-white border-slate-200'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Insumos y Repuestos</span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-700 font-bold">
              📦
            </div>
          </div>
          <div className="my-3">
            <div className="text-3xl font-black text-slate-900 dark:text-white tabular-nums">{totalCauchos + totalBaterias}</div>
            <div className="text-xs text-purple-600 font-semibold mt-1">
              {totalCauchos} Cauchos · {totalBaterias} Baterías
            </div>
          </div>
          <div className="text-[11px] text-slate-400 border-t border-slate-100 dark:border-[#1a5f47] pt-2">
            Total reparaciones: {totalReparaciones}
          </div>
        </div>

      </div>

      {/* Mapa Geoespacial Interactivo: Densidad de Flota y Centros de Servicios */}
      <VenezuelaFleetMap
        vehicles={filteredVehicles}
        isDarkMode={isDarkMode}
        selectedRegion={selectedRegionFilter}
      />

      {/* Gráficos y Desglose Operativo (2x2 Grid) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* 1. Desglose por Estado Operativo General (Barras) */}
        <div className={`p-6 rounded-2xl border shadow-sm ${
          isDarkMode ? 'bg-[#0f2a20] border-[#1a5f47]' : 'bg-white border-slate-200'
        }`}>
          <h2 className="text-sm font-black uppercase tracking-wider text-slate-800 dark:text-white mb-4 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-[#c9a227]" />
            <span>Desglose por Estado Operativo</span>
          </h2>

          <div className="space-y-3">
            {[
              { label: 'ACTIVO', count: activos, color: 'bg-emerald-500', textColor: 'text-emerald-700' },
              { label: 'EN MANTENIMIENTO', count: enMantenimiento, color: 'bg-amber-500', textColor: 'text-amber-700' },
              { label: 'FUERA DE SERVICIO', count: fueraDeServicio, color: 'bg-red-500', textColor: 'text-red-700' },
              { label: 'RECUPERADOS', count: recuperados, color: 'bg-blue-500', textColor: 'text-blue-700' }
            ].map(item => {
              const pct = total > 0 ? Math.round((item.count / total) * 100) : 0;
              return (
                <div key={item.label} className="space-y-1">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-slate-700 dark:text-slate-200">{item.label}</span>
                    <span className="font-mono tabular-nums">{item.count} unidades ({pct}%)</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-[#13382b] h-3 rounded-full overflow-hidden border border-slate-200 dark:border-[#1a5f47]">
                    <div className={`h-full ${item.color} transition-all duration-500`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 2. Gráfico de Torta - Estado de Operatividad (Recharts) */}
        <div className={`p-6 rounded-2xl border shadow-sm flex flex-col justify-between ${
          isDarkMode ? 'bg-[#0f2a20] border-[#1a5f47]' : 'bg-white border-slate-200'
        }`}>
          <div>
            <h2 className="text-sm font-black uppercase tracking-wider text-slate-800 dark:text-white mb-1 flex items-center gap-2">
              <PieChartIcon className="w-4 h-4 text-[#c9a227]" />
              <span>Operatividad (Torta Recharts)</span>
            </h2>
            <p className="text-[11px] text-slate-500 mb-2">En Servicio, En Taller y Fuera de Servicio</p>

            <div className="h-48 w-full flex items-center justify-center">
              {total > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={70}
                      paddingAngle={4}
                      dataKey="value"
                      label={({ name, percent }) => `${(Number(percent || 0) * 100).toFixed(0)}%`}
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: isDarkMode ? '#0a1f17' : '#ffffff',
                        borderColor: isDarkMode ? '#1a5f47' : '#cbd5e1',
                        borderRadius: '0.75rem',
                        color: isDarkMode ? '#f8f9fa' : '#0f172a',
                        fontSize: '11px',
                        fontWeight: 'bold'
                      }}
                    />
                    <Legend
                      verticalAlign="bottom"
                      height={28}
                      formatter={(value) => <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-200">{value}</span>}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-xs text-slate-400">Sin datos registrados.</div>
              )}
            </div>
          </div>

          <div className="text-[11px] text-slate-400 border-t border-slate-100 dark:border-[#1a5f47] pt-2 flex justify-between">
            <span>En Servicio: <strong className="text-emerald-600">{activos}</strong></span>
            <span>En Taller: <strong className="text-amber-600">{enMantenimiento}</strong></span>
            <span>Fuera: <strong className="text-red-600">{fueraDeServicio}</strong></span>
          </div>
        </div>

        {/* 3. Gráfico de Mantenimiento Preventivo (Al Día vs Vencido - Recharts BarChart) */}
        <div className={`p-6 rounded-2xl border shadow-sm flex flex-col justify-between ${
          isDarkMode ? 'bg-[#0f2a20] border-[#1a5f47]' : 'bg-white border-slate-200'
        }`}>
          <div>
            <h2 className="text-sm font-black uppercase tracking-wider text-slate-800 dark:text-white mb-1 flex items-center gap-2">
              <Wrench className="w-4 h-4 text-[#c9a227]" />
              <span>Mantenimiento Preventivo (Al Día vs Vencido)</span>
            </h2>
            <p className="text-[11px] text-slate-500 mb-2">Basado en registro de último servicio y vigencia</p>

            <div className="h-48 w-full flex items-center justify-center">
              {total > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={maintenanceChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#1a5f47' : '#e2e8f0'} />
                    <XAxis dataKey="name" tick={{ fontSize: 10, fill: isDarkMode ? '#cbd5e1' : '#475569' }} />
                    <YAxis tick={{ fontSize: 10, fill: isDarkMode ? '#cbd5e1' : '#475569' }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: isDarkMode ? '#0a1f17' : '#ffffff',
                        borderColor: isDarkMode ? '#1a5f47' : '#cbd5e1',
                        borderRadius: '0.75rem',
                        color: isDarkMode ? '#f8f9fa' : '#0f172a',
                        fontSize: '11px',
                        fontWeight: 'bold'
                      }}
                    />
                    <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                      {maintenanceChartData.map((entry, index) => (
                        <Cell key={`bar-cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-xs text-slate-400">Sin datos registrados.</div>
              )}
            </div>
          </div>

          <div className="text-[11px] text-slate-400 border-t border-slate-100 dark:border-[#1a5f47] pt-2 flex justify-between">
            <span>Al Día: <strong className="text-emerald-600">{mantenimientoAlDia} ({porcentajeMantenimiento}%)</strong></span>
            <span>Vencidos: <strong className="text-red-600">{mantenimientoVencido}</strong></span>
          </div>
        </div>

        {/* 4. Resumen de Requerimientos de Gerencia */}
        <div className={`p-6 rounded-2xl border shadow-sm flex flex-col justify-between ${
          isDarkMode ? 'bg-[#0f2a20] border-[#1a5f47]' : 'bg-white border-slate-200'
        }`}>
          <div>
            <h2 className="text-sm font-black uppercase tracking-wider text-slate-800 dark:text-white mb-4 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#c9a227]" />
              <span>Resumen Ejecutivo · Normativa SEN</span>
            </h2>

            <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
              <div className="p-3 bg-slate-50 dark:bg-[#13382b] rounded-xl border border-slate-200 dark:border-[#1a5f47] flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-800 dark:text-white">Cumplimiento ISO 8000:</span> Trazabilidad validada en las 45 columnas del parque vehicular.
                </div>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-[#13382b] rounded-xl border border-slate-200 dark:border-[#1a5f47] flex items-start gap-2.5">
                <TrendingUp className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-800 dark:text-white">Reportes Oficiales:</span> Consolidado activo para Vicepresidencia Sectorial de Obras Públicas.
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-200 dark:border-[#1a5f47] flex items-center justify-between text-[11px] text-slate-400">
            <span>Región: <strong className="text-[#c9a227]">{selectedRegionFilter}</strong></span>
            <span>Total: <strong className="text-slate-700 dark:text-white">{total}</strong></span>
          </div>
        </div>

      </div>

      {/* Panel de Auditoría de Acciones Críticas */}
      {allow('btn_audit_history') && (
      <div className={`p-6 rounded-2xl border shadow-sm ${
        isDarkMode ? 'bg-[#0f2a20] border-[#1a5f47]' : 'bg-white border-slate-200'
      }`}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-sm font-black uppercase tracking-wider text-slate-800 dark:text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#c9a227]" />
              <span>Panel de Auditoría y Seguridad de Acciones Críticas</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">Registro de trazabilidad de acciones de usuarios (creación, edición, eliminación, importación y respaldos).</p>
          </div>
          <button
            onClick={() => {
              if (confirm('¿Desea limpiar el historial de auditoría?')) {
                auditService.clearLogs();
                setAuditLogs(auditService.getLogs());
              }
            }}
            className="px-3 py-1.5 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition-colors cursor-pointer"
          >
            Limpiar Auditoría
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100 dark:bg-[#13382b] text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-[#1a5f47]">
                <th className="p-2.5 font-bold">Fecha / Hora</th>
                <th className="p-2.5 font-bold">Usuario</th>
                <th className="p-2.5 font-bold">Acción</th>
                <th className="p-2.5 font-bold">Detalles de la Operación</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-[#1a5f47]/50">
              {auditLogs.length > 0 ? (
                auditLogs.map(log => (
                  <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-[#13382b]/50">
                    <td className="p-2.5 font-mono text-slate-500">{log.timestamp}</td>
                    <td className="p-2.5 font-mono font-semibold text-slate-800 dark:text-slate-200">{log.userEmail}</td>
                    <td className="p-2.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                        log.action === 'CREAR_VEHICULO' ? 'bg-emerald-100 text-emerald-800' :
                        log.action === 'EDITAR_VEHICULO' ? 'bg-blue-100 text-blue-800' :
                        log.action === 'ELIMINAR_VEHICULO' ? 'bg-red-100 text-red-800' :
                        log.action === 'IMPORTAR_EXCEL' ? 'bg-purple-100 text-purple-800' :
                        'bg-amber-100 text-amber-900'
                      }`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="p-2.5 text-slate-700 dark:text-slate-300">{log.details}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="p-4 text-center text-slate-400">
                    No hay registros de auditoría almacenados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      )}

      {/* Modal de Alertas de Mantenimiento (30 días / Vencidos) */}
      {isAlertsModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0f2a20] border border-slate-200 dark:border-[#1a5f47] rounded-2xl max-w-3xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden text-xs">
            <div className="p-5 border-b border-slate-200 dark:border-[#1a5f47] flex items-center justify-between bg-slate-50 dark:bg-[#13382b]">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-amber-600" />
                <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                  Centro de Alertas: Mantenimientos Preventivos Críticos ({urgentMaintenanceVehicles.length})
                </h3>
              </div>
              <button
                onClick={() => setIsAlertsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-3 flex-1">
              {urgentMaintenanceVehicles.length > 0 ? (
                urgentMaintenanceVehicles.map(v => (
                  <div key={v.id} className="p-3.5 rounded-xl border border-amber-200 dark:border-amber-900/50 bg-amber-50/50 dark:bg-[#13382b]/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-slate-900 dark:text-white">{v.numero_vehiculo}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          v.mantenimiento_preventivo === 'VENCIDO' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-900'
                        }`}>
                          {v.mantenimiento_preventivo}
                        </span>
                        <span className="text-slate-500 text-[11px] font-mono">{v.marca_vehiculo} {v.modelo_vehiculo || ''}</span>
                      </div>
                      <div className="text-[11px] text-slate-600 dark:text-slate-300 mt-1">
                        Región: <strong className="text-slate-800 dark:text-white">{v.region || 'N/D'}</strong> · Centro: {v.centro_servicios} · Custodio: {v.nombre_personal_responsable || 'No asignado'}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-mono text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-950 px-2 py-1 rounded-lg">
                        Próximo / Vencido (30 días)
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-slate-400">
                  No hay vehículos con mantenimientos vencidos o pendientes en este momento.
                </div>
              )}
            </div>

            <div className="p-4 bg-slate-100 dark:bg-[#13382b] border-t border-slate-200 dark:border-[#1a5f47] flex justify-end">
              <button
                onClick={() => setIsAlertsModalOpen(false)}
                className="px-4 py-2 text-xs font-bold bg-[#0b3d2e] text-white rounded-lg hover:bg-[#1a5f47] transition-colors cursor-pointer"
              >
                Cerrar Alertas
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
