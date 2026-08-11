import React, { useState } from 'react';
import { INITIAL_MINUTAS, VENEZUELAN_STATES } from '../mockData/portalData';
import { MinutaItem, StateCode } from '../types/sigi';
import { useAuth } from '../context/AuthContext';
import { FileText, Search, Filter, Calendar, MapPin, CheckCircle2, ExternalLink, Plus, Eye, Lock, X, Activity } from 'lucide-react';

export const MinutarioSection: React.FC = () => {
  const { session } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedState, setSelectedState] = useState<string>(session.stateCode !== 'NAC' ? session.stateCode : 'ALL');
  const [selectedMinuta, setSelectedMinuta] = useState<MinutaItem | null>(null);

  const filteredMinutas = INITIAL_MINUTAS.filter(min => {
    const matchesSearch = min.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          min.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (min.summary || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesState = selectedState === 'ALL' || min.stateCode === selectedState || min.stateCode === 'NAC';
    return matchesSearch && matchesState;
  });

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="rounded-3xl bg-white dark:bg-gradient-to-r dark:from-[#112240] dark:via-[#0a192f] dark:to-[#112240] p-6 border border-slate-200 dark:border-[#00f2fe]/30 shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <FileText className="h-5 w-5 text-[#002b49] dark:text-[#00f2fe]" />
            <h2 className="text-xl font-black text-slate-900 dark:text-white">Eje 2: Minutario e Historial de Reuniones Institucionales</h2>
          </div>
          <p className="text-xs text-slate-700 dark:text-slate-300 mt-1 font-medium">
            Registro auditable de minutas, acuerdos y compromisos operativos de planificación por estado geográfico.
          </p>
        </div>

        {/* Action Button (Role Aware) */}
        {['ANALISTA', 'GERENCIA'].includes(session.role) && (
          <button
            onClick={() => alert('Función de registro de minutas activada. Redirigiendo a formulario en la Nube...')}
            className="flex items-center space-x-2 rounded-xl bg-[#002b49] text-white dark:bg-gradient-to-r dark:from-[#00f2fe] dark:to-[#00b4d8] dark:text-[#0a192f] px-4 py-2.5 text-xs font-black uppercase shadow-md hover:scale-105 transition-all"
          >
            <Plus className="h-4 w-4" />
            <span>Registrar Nueva Minuta</span>
          </button>
        )}
      </div>


      {/* KPI Minutas Activas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {INITIAL_MINUTAS.slice(0, 4).map(min => (
          <div key={min.id} className="rounded-2xl bg-white dark:bg-[#0b172c] p-4 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between hover:border-[#00f2fe]/40 transition-colors">
            <div>
              <div className="flex justify-between items-start mb-2 gap-2">
                <span className="text-[10px] font-mono font-bold text-[#002b49] dark:text-[#00f2fe] break-all leading-tight">{min.code}</span>
                <span className="flex items-center text-[10px] text-slate-500 font-medium bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded shrink-0">
                  <Calendar className="h-3 w-3 mr-1 shrink-0" />
                  <span className="whitespace-nowrap">{min.date}</span>
                </span>
              </div>
              <h4 className="text-xs font-black text-slate-900 dark:text-white line-clamp-2 leading-tight">{min.title}</h4>
            </div>
            <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/60 flex justify-between items-center">
              <span className="text-[10px] text-slate-600 dark:text-slate-400 font-semibold">Tareas / Acuerdos:</span>
              <span className="text-xs font-black text-[#002b49] dark:text-[#00f2fe] bg-blue-50 dark:bg-[#00f2fe]/10 px-2 py-0.5 rounded-full">
                {(min.keyAgreements || min.agreements || []).length} items
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Search & Filter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        {/* Search */}
        <div className="relative sm:col-span-2">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por código, título o acuerdos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl bg-white dark:bg-[#112240] pl-10 pr-4 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 border border-slate-300 dark:border-slate-700 focus:border-[#002b49] dark:focus:border-[#00f2fe] focus:outline-none font-medium shadow-xs"
          />
        </div>

        {/* Filter State */}
        <div className="relative">
          <Filter className="absolute left-3.5 top-3 h-4 w-4 text-[#d97706] dark:text-[#ffd700]" />
          <select
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value)}
            className="w-full rounded-xl bg-white dark:bg-[#112240] pl-10 pr-4 py-2.5 text-xs text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 focus:border-[#002b49] dark:focus:border-[#00f2fe] focus:outline-none font-bold cursor-pointer shadow-xs"
          >
            <option value="ALL" className="bg-white dark:bg-[#0a192f]">Todos los Estados</option>
            {VENEZUELAN_STATES.map(s => (
              <option key={s.code} value={s.code} className="bg-white dark:bg-[#0a192f]">
                {s.code} - {s.name}
              </option>
            ))}
          </select>
        </div>

      </div>

      {/* Minutas List */}
      <div className="space-y-4">
        {filteredMinutas.length === 0 ? (
          <div className="rounded-3xl bg-white dark:bg-[#081427] p-10 text-center text-slate-600 dark:text-slate-400 font-medium border border-slate-200 dark:border-slate-800 shadow-sm">
            No se encontraron minutas registradas para el criterio de búsqueda seleccionado.
          </div>
        ) : (
          filteredMinutas.map((min: MinutaItem) => (
            <div
              key={min.id}
              className="rounded-3xl bg-white dark:bg-[#0b172c] p-6 border border-slate-200 dark:border-slate-800 hover:border-[#002b49] dark:hover:border-[#00f2fe]/40 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm"
            >
              <div className="space-y-2 max-w-3xl">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded bg-blue-100 text-[#002b49] border border-blue-300 dark:bg-[#00f2fe]/10 dark:text-[#00f2fe] dark:border-[#00f2fe]/30 px-2 py-0.5 text-[10px] font-mono font-black break-all">
                    {min.code}
                  </span>
                  <span className="flex items-center space-x-1 rounded bg-amber-100 text-amber-900 border border-amber-300 dark:bg-[#ffd700]/10 dark:text-[#ffd700] dark:border-[#ffd700]/30 px-2 py-0.5 text-[10px] font-bold">
                    <MapPin className="h-3 w-3" />
                    <span>{min.stateCode}</span>
                  </span>
                  <span className="flex items-center space-x-1 text-[11px] text-slate-600 dark:text-slate-400 font-medium">
                    <Calendar className="h-3 w-3 text-slate-500" />
                    <span>{min.date}</span>
                  </span>
                </div>

                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  {min.title}
                </h3>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-normal">
                  {min.summary}
                </p>

                {/* Key Agreements List */}
                <div className="space-y-1 pt-2">
                  {(min.keyAgreements || min.agreements || []).map((agreement: string, idx: number) => (
                    <div key={idx} className="flex items-start space-x-2 text-[11px] text-slate-800 dark:text-slate-200 font-medium">
                      <CheckCircle2 className="h-3.5 w-3.5 text-[#002b49] dark:text-[#00f2fe] shrink-0 mt-0.5" />
                      <span>{agreement}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* View Button */}
              <div className="shrink-0 flex items-center space-x-2">
                <button
                  onClick={() => setSelectedMinuta(min)}
                  className="flex items-center space-x-2 rounded-xl bg-slate-100 dark:bg-[#112240] px-4 py-2 text-xs font-bold text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 hover:border-[#002b49] dark:hover:border-[#00f2fe] transition-all shadow-xs"
                >
                  <Eye className="h-4 w-4" />
                  <span>Ver Detalle</span>
                </button>
              </div>

            </div>
          ))
        )}
      </div>

      {/* Kanban de Procesos (Lectura) */}
      <div className="mt-10 pt-8 border-t border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 rounded-xl">
              <Activity className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white">Tablero Kanban de Flujo de Procesos</h3>
              <p className="text-xs text-slate-500 font-medium">Visualización de lectura sobre el estado de las tareas derivadas de minutas.</p>
            </div>
          </div>
          <span className="text-[10px] font-black uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-3 py-1 rounded-full border border-slate-200 dark:border-slate-700">Modo Lectura</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Column 1 */}
          <div className="bg-slate-50 dark:bg-[#0a1526] rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-inner">
            <h4 className="text-xs font-black text-slate-500 uppercase tracking-wider mb-4 flex items-center justify-between">
              <span>Por Iniciar</span>
              <span className="bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-full text-[10px]">4</span>
            </h4>
            <div className="space-y-3">
              <div className="bg-white dark:bg-[#112240] p-3 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm border-l-4 border-l-slate-400">
                <div className="text-[10px] font-bold text-amber-600 dark:text-amber-400 mb-1 flex justify-between"><span>Planificación</span><span className="text-[8px] text-slate-400">NAC-001</span></div>
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">Revisión de Inventario Poda (Zulia)</p>
              </div>
              <div className="bg-white dark:bg-[#112240] p-3 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm border-l-4 border-l-slate-400">
                <div className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 mb-1 flex justify-between"><span>QA / Auditoría</span><span className="text-[8px] text-slate-400">NAC-001</span></div>
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">Emisión de Normativa ISO 8000</p>
              </div>
              <div className="bg-white dark:bg-[#112240] p-3 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm border-l-4 border-l-slate-400">
                <div className="text-[10px] font-bold text-blue-600 dark:text-blue-400 mb-1 flex justify-between"><span>Mantenimiento</span><span className="text-[8px] text-slate-400">DCA-003</span></div>
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">Revisión T1 y T2 Subestaciones Blindadas</p>
              </div>
              <div className="bg-white dark:bg-[#112240] p-3 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm border-l-4 border-l-slate-400">
                <div className="text-[10px] font-bold text-[#00f2fe] mb-1 flex justify-between"><span>Operaciones</span><span className="text-[8px] text-slate-400">ZUL-002</span></div>
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">Corte Programado y Reemplazo SF6</p>
              </div>
            </div>
          </div>

          {/* Column 2 */}
          <div className="bg-blue-50/50 dark:bg-blue-950/10 rounded-2xl p-4 border border-blue-100 dark:border-blue-900/30 shadow-inner">
            <h4 className="text-xs font-black text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-4 flex items-center justify-between">
              <span>En Progreso</span>
              <span className="bg-blue-200 dark:bg-blue-900/60 text-blue-800 dark:text-blue-300 px-2 py-0.5 rounded-full text-[10px]">5</span>
            </h4>
            <div className="space-y-3">
              <div className="bg-white dark:bg-[#112240] p-3 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm border-l-4 border-l-blue-500">
                <div className="text-[10px] font-bold text-blue-600 dark:text-blue-400 mb-1 flex justify-between"><span>Desarrollo</span><span className="text-[8px] text-slate-400">NAC-001</span></div>
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">Integración de Mapas Leaflet GIS</p>
                <div className="mt-2 text-[9px] text-slate-500 font-bold flex justify-between bg-slate-50 dark:bg-[#0a1526] p-1 rounded">
                  <span>Resp: J. Pacheco</span><span className="text-blue-500">75%</span>
                </div>
              </div>
              <div className="bg-white dark:bg-[#112240] p-3 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm border-l-4 border-l-amber-500">
                <div className="text-[10px] font-bold text-amber-600 dark:text-amber-400 mb-1 flex justify-between"><span>Auditoría</span><span className="text-[8px] text-slate-400">NAC-001</span></div>
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">Revisión de Control de Accesos SSO</p>
                <div className="mt-2 text-[9px] text-slate-500 font-bold flex justify-between bg-slate-50 dark:bg-[#0a1526] p-1 rounded">
                  <span>Resp: QA Team</span><span className="text-amber-500">40%</span>
                </div>
              </div>
              <div className="bg-white dark:bg-[#112240] p-3 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm border-l-4 border-l-purple-500">
                <div className="text-[10px] font-bold text-purple-600 dark:text-purple-400 mb-1 flex justify-between"><span>Ingesta</span><span className="text-[8px] text-slate-400">NAC-001</span></div>
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">Cruce de BD Activos de Red</p>
                <div className="mt-2 text-[9px] text-slate-500 font-bold flex justify-between bg-slate-50 dark:bg-[#0a1526] p-1 rounded">
                  <span>Resp: Data Eng.</span><span className="text-purple-500">90%</span>
                </div>
              </div>
              <div className="bg-white dark:bg-[#112240] p-3 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm border-l-4 border-l-emerald-500">
                <div className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 mb-1 flex justify-between"><span>Sensores</span><span className="text-[8px] text-slate-400">ZUL-002</span></div>
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">Despliegue sensor inteligente CT Maracaibo</p>
              </div>
              <div className="bg-white dark:bg-[#112240] p-3 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm border-l-4 border-l-emerald-500">
                <div className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 mb-1 flex justify-between"><span>Gobernanza</span><span className="text-[8px] text-slate-400">DCA-003</span></div>
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">Digitalización firmas Minutas 69kV</p>
              </div>
            </div>
          </div>

          {/* Column 3 */}
          <div className="bg-amber-50/50 dark:bg-amber-950/10 rounded-2xl p-4 border border-amber-100 dark:border-amber-900/30 shadow-inner">
            <h4 className="text-xs font-black text-amber-600 dark:text-amber-400 uppercase tracking-wider mb-4 flex items-center justify-between">
              <span>Validación QA</span>
              <span className="bg-amber-200 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300 px-2 py-0.5 rounded-full text-[10px]">3</span>
            </h4>
            <div className="space-y-3">
              <div className="bg-white dark:bg-[#112240] p-3 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm border-l-4 border-l-red-500">
                <div className="text-[10px] font-bold text-red-600 dark:text-red-400 mb-1 flex justify-between uppercase tracking-wide"><span>Urgente</span><span className="text-[8px] text-slate-400">NAC-001</span></div>
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">Despliegue Portal Unificado GGPD</p>
                <div className="mt-2 flex items-center justify-center space-x-1 text-[9px] text-amber-700 dark:text-amber-400 font-bold bg-amber-50 dark:bg-amber-950/50 p-1 rounded">
                  <CheckCircle2 className="h-3 w-3" />
                  <span>Esperando 15 de Agosto</span>
                </div>
              </div>
              <div className="bg-white dark:bg-[#112240] p-3 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm border-l-4 border-l-amber-500">
                <div className="text-[10px] font-bold text-amber-600 dark:text-amber-400 mb-1 flex justify-between uppercase tracking-wide"><span>Revisión</span><span className="text-[8px] text-slate-400">NAC-001</span></div>
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">Matriz Contingencia Zulia/Falcón</p>
              </div>
              <div className="bg-white dark:bg-[#112240] p-3 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm border-l-4 border-l-amber-500">
                <div className="text-[10px] font-bold text-amber-600 dark:text-amber-400 mb-1 flex justify-between uppercase tracking-wide"><span>Revisión</span><span className="text-[8px] text-slate-400">ZUL-002</span></div>
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">Reporte Nube SIGI Automatizado</p>
              </div>
            </div>
          </div>

          {/* Column 4 */}
          <div className="bg-emerald-50/50 dark:bg-emerald-950/10 rounded-2xl p-4 border border-emerald-100 dark:border-emerald-900/30 shadow-inner">
            <h4 className="text-xs font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-4 flex items-center justify-between">
              <span>Completado</span>
              <span className="bg-emerald-200 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 rounded-full text-[10px]">5</span>
            </h4>
            <div className="space-y-3 opacity-70 hover:opacity-100 transition-opacity">
              <div className="bg-white dark:bg-[#112240] p-3 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm border-l-4 border-l-emerald-500">
                <p className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 line-through">Prohibición de reportes WhatsApp</p>
                <div className="mt-1 text-[8px] text-emerald-500 font-mono">NAC-001</div>
              </div>
              <div className="bg-white dark:bg-[#112240] p-3 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm border-l-4 border-l-emerald-500">
                <p className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 line-through">Sincronización Inventario SCTIS</p>
                <div className="mt-1 text-[8px] text-emerald-500 font-mono">NAC-001</div>
              </div>
              <div className="bg-white dark:bg-[#112240] p-3 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm border-l-4 border-l-emerald-500">
                <p className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 line-through">Creación de Esquema BD (samc.activos_red)</p>
                <div className="mt-1 text-[8px] text-emerald-500 font-mono">CORE-DEV</div>
              </div>
              <div className="bg-white dark:bg-[#112240] p-3 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm border-l-4 border-l-emerald-500">
                <p className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 line-through">Módulo de Autenticación SSO</p>
                <div className="mt-1 text-[8px] text-emerald-500 font-mono">CORE-DEV</div>
              </div>
              <div className="bg-white dark:bg-[#112240] p-3 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm border-l-4 border-l-emerald-500">
                <p className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 line-through">Trazabilidad y Origen de Datos</p>
                <div className="mt-1 text-[8px] text-emerald-500 font-mono">CORE-DEV</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Minuta Detail Modal */}
      {selectedMinuta && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-3xl bg-white dark:bg-[#0b172c] p-6 border border-slate-200 dark:border-[#00f2fe]/40 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-mono font-bold text-[#002b49] dark:text-[#00f2fe]">{selectedMinuta.code}</span>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">{selectedMinuta.title}</h3>
              </div>
              <button
                onClick={() => setSelectedMinuta(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-700 dark:text-slate-300 font-medium">
              <p><strong className="text-slate-900 dark:text-white">Resumen Ejecutivo:</strong> {selectedMinuta.summary}</p>
              <div className="bg-slate-50 dark:bg-[#112240] p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
                <h4 className="font-extrabold text-[#d97706] dark:text-[#ffd700]">Acuerdos Institucionales Registrados:</h4>
                <ul className="space-y-1">
                  {(selectedMinuta.keyAgreements || selectedMinuta.agreements || []).map((ag: string, i: number) => (
                    <li key={i} className="flex items-start space-x-2">
                      <CheckCircle2 className="h-4 w-4 text-[#002b49] dark:text-[#00f2fe] shrink-0 mt-0.5" />
                      <span>{ag}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="pt-4 flex items-center justify-between border-t border-slate-200 dark:border-slate-800">
              <span className="text-[10px] text-slate-500 font-semibold">
                Visualización auditable por la Gerencia de Planificación
              </span>
              <a
                href={selectedMinuta.driveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 rounded-xl bg-[#002b49] text-white dark:bg-[#00f2fe] dark:text-[#0a192f] px-4 py-2 text-xs font-black"
              >
                <span>Abrir en Google Drive</span>
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
