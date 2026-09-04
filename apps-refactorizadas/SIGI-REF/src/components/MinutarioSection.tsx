import React, { useState, useEffect } from 'react';
import {
  fetchScmtpData,
  MinutaReunionSCTAP,
  TareaCompromisoSCTAP,
  PendienteAreaSCTAP
} from '../services/scmtpService';
import { useAuth } from '../context/AuthContext';
import { 
  FileText, 
  Search, 
  Filter, 
  Calendar, 
  CheckCircle2, 
  ExternalLink, 
  Eye, 
  X, 
  Activity, 
  Clock, 
  AlertCircle, 
  Users, 
  Layers, 
  TrendingUp, 
  Tag,
  Check,
  ChevronRight,
  ShieldCheck,
  Building2
} from 'lucide-react';

export const MinutarioSection: React.FC = () => {
  const { session } = useAuth();
  const [activeTab, setActiveTab] = useState<'minutas' | 'compromisos' | 'kanban' | 'pendientes'>('minutas');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMinutaFilter, setSelectedMinutaFilter] = useState<string>('ALL');
  const [selectedAreaFilter, setSelectedAreaFilter] = useState<string>('ALL');
  const [selectedResponsableFilter, setSelectedResponsableFilter] = useState<string>('ALL');
  const [selectedMinutaModal, setSelectedMinutaModal] = useState<MinutaReunionSCTAP | null>(null);
  const [selectedTareaModal, setSelectedTareaModal] = useState<TareaCompromisoSCTAP | null>(null);
  const [SCTAP_MINUTAS, setMinutas] = useState<MinutaReunionSCTAP[]>([]);
  const [SCTAP_COMPROMISOS, setCompromisos] = useState<TareaCompromisoSCTAP[]>([]);
  const [SCTAP_PENDIENTES, setPendientes] = useState<PendienteAreaSCTAP[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Carga de datos reales desde InsForge (vistas v_scmtp_*)
  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    fetchScmtpData()
      .then((data) => {
        if (cancelled) return;
        setMinutas(data.minutas);
        setCompromisos(data.compromisos);
        setPendientes(data.pendientes);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  // Estadísticas globales de las tareas SCTAP (derivadas de datos reales)
  const totalCompromisos = SCTAP_COMPROMISOS.length;
  const completadosCount = SCTAP_COMPROMISOS.filter(c => c.avancePorcentaje === 100 || c.estado === 'Completado').length;
  const enProcesoCount = SCTAP_COMPROMISOS.filter(c => c.avancePorcentaje > 0 && c.avancePorcentaje < 100).length;
  const pendientesCount = SCTAP_COMPROMISOS.filter(c => c.avancePorcentaje === 0 || c.estado === 'Pendiente').length;
  const promedioAvance = totalCompromisos === 0
    ? 0
    : Math.round(
        SCTAP_COMPROMISOS.reduce((acc, curr) => acc + curr.avancePorcentaje, 0) / totalCompromisos
      );

  // Lista única de responsables y áreas
  const responsablesList = Array.from(new Set(SCTAP_COMPROMISOS.map(c => c.responsable)));
  const areasList = Array.from(new Set(SCTAP_COMPROMISOS.map(c => c.areaGestion)));
  const minutaNumerosList = Array.from(new Set(SCTAP_COMPROMISOS.map(c => c.minutaNumero).filter(Boolean))).sort();

  // Filtrado de compromisos
  const filteredCompromisos = SCTAP_COMPROMISOS.filter(comp => {
    const matchesSearch = 
      comp.compromiso.toLowerCase().includes(searchQuery.toLowerCase()) ||
      comp.responsable.toLowerCase().includes(searchQuery.toLowerCase()) ||
      comp.minutaNumero.toLowerCase().includes(searchQuery.toLowerCase()) ||
      comp.observaciones.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesMinuta = selectedMinutaFilter === 'ALL' || comp.minutaNumero === selectedMinutaFilter;
    const matchesArea = selectedAreaFilter === 'ALL' || comp.areaGestion === selectedAreaFilter;
    const matchesResponsable = selectedResponsableFilter === 'ALL' || comp.responsable.includes(selectedResponsableFilter);

    return matchesSearch && matchesMinuta && matchesArea && matchesResponsable;
  });

  // Filtrado de minutas
  const filteredMinutas = SCTAP_MINUTAS.filter(min => {
    const matchesSearch = 
      min.numero.toLowerCase().includes(searchQuery.toLowerCase()) ||
      min.objetivo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      min.coordinador.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  // Kanban Columns
  const kanbanColumns = {
    porIniciar: SCTAP_COMPROMISOS.filter(c => c.avancePorcentaje < 30),
    enProceso: SCTAP_COMPROMISOS.filter(c => c.avancePorcentaje >= 30 && c.avancePorcentaje < 80),
    qaRevision: SCTAP_COMPROMISOS.filter(c => c.avancePorcentaje >= 80 && c.avancePorcentaje < 100),
    completado: SCTAP_COMPROMISOS.filter(c => c.avancePorcentaje === 100 || c.estado === 'Completado')
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#072146] via-[#002b49] to-[#041426] text-white p-6 sm:p-7 shadow-xl border border-blue-900/60 dark:border-[#00f2fe]/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group hover:border-[#00f2fe]/80 transition-all duration-300">
        <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#00f2fe_1.5px,transparent_1.5px)] [background-size:16px_16px]" />
        
        <div className="relative z-10">
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#00f2fe] font-bold flex items-center space-x-1.5 bg-cyan-950/60 px-2.5 py-1 rounded-full border border-cyan-500/30">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Sincronizado con SCTAP-REF · Base Canónica InsForge</span>
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white mt-2">
            Minutario Técnico & Matriz de Compromisos GGPD
          </h2>
          <p className="text-xs text-cyan-100/90 mt-1 font-medium max-w-2xl leading-relaxed">
            Consolidado institucional auditable de minutas oficiales, tareas/compromisos operativos y asignación de responsabilidades (base maestra InsForge).
          </p>
        </div>

        {/* Badge Resumen */}
        <div className="relative z-10 bg-white/10 dark:bg-[#00f2fe]/10 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/20 dark:border-[#00f2fe]/30 text-right shrink-0">
          <div className="text-[10px] text-cyan-200 font-bold uppercase tracking-wider">Avance Global SCTAP</div>
          <div className="text-2xl font-black text-white dark:text-[#00f2fe]">{promedioAvance}%</div>
          <div className="text-[10px] text-emerald-300 font-mono mt-0.5">{completadosCount} de {totalCompromisos} tareas al 100%</div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="rounded-2xl bg-white dark:bg-[#0b172c] p-4 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Minutas Registradas</span>
            <FileText className="h-4 w-4 text-blue-500" />
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900 dark:text-white">{SCTAP_MINUTAS.length} Actas</div>
          <span className="text-[10px] text-slate-400 font-medium">{minutaNumerosList.length > 0 ? minutaNumerosList.map(n => `#${n}`).join(' y ') : 'Sin minutas registradas'}</span>
        </div>

        <div className="rounded-2xl bg-white dark:bg-[#0b172c] p-4 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Compromisos Totales</span>
            <Layers className="h-4 w-4 text-[#00f2fe]" />
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900 dark:text-white">{totalCompromisos} Items</div>
          <span className="text-[10px] text-blue-500 font-medium">Trazabilidad ISO 8000</span>
        </div>

        <div className="rounded-2xl bg-white dark:bg-[#0b172c] p-4 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Completados</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="mt-2 text-2xl font-black text-emerald-600 dark:text-emerald-400">{completadosCount}</div>
          <span className="text-[10px] text-emerald-600/80 font-medium">{totalCompromisos === 0 ? 0 : Math.round((completadosCount / totalCompromisos) * 100)}% de efectividad</span>
        </div>

        <div className="rounded-2xl bg-white dark:bg-[#0b172c] p-4 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">En Ejecución Activa</span>
            <Clock className="h-4 w-4 text-amber-500" />
          </div>
          <div className="mt-2 text-2xl font-black text-amber-600 dark:text-amber-400">{enProcesoCount}</div>
          <span className="text-[10px] text-amber-600/80 font-medium">{pendientesCount} pendientes de inicio</span>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab('minutas')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-black transition-all ${
            activeTab === 'minutas'
              ? 'bg-[#002b49] text-white dark:bg-[#00f2fe] dark:text-[#072146] shadow-md'
              : 'bg-slate-100 dark:bg-[#112240] text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          <FileText className="h-4 w-4" />
          <span>Minutas Oficiales ({SCTAP_MINUTAS.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('compromisos')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-black transition-all ${
            activeTab === 'compromisos'
              ? 'bg-[#002b49] text-white dark:bg-[#00f2fe] dark:text-[#072146] shadow-md'
              : 'bg-slate-100 dark:bg-[#112240] text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          <Layers className="h-4 w-4" />
          <span>Compromisos & Tareas ({totalCompromisos})</span>
        </button>

        <button
          onClick={() => setActiveTab('kanban')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-black transition-all ${
            activeTab === 'kanban'
              ? 'bg-[#002b49] text-white dark:bg-[#00f2fe] dark:text-[#072146] shadow-md'
              : 'bg-slate-100 dark:bg-[#112240] text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          <Activity className="h-4 w-4" />
          <span>Tablero Kanban Dinámico</span>
        </button>

        <button
          onClick={() => setActiveTab('pendientes')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-black transition-all ${
            activeTab === 'pendientes'
              ? 'bg-[#002b49] text-white dark:bg-[#00f2fe] dark:text-[#072146] shadow-md'
              : 'bg-slate-100 dark:bg-[#112240] text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          <AlertCircle className="h-4 w-4" />
          <span>Pendientes por Área ({SCTAP_PENDIENTES.length})</span>
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <div className="relative sm:col-span-2">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por compromiso, responsable, minuta u observaciones..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl bg-white dark:bg-[#112240] pl-10 pr-4 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 border border-slate-300 dark:border-slate-700 focus:border-[#002b49] dark:focus:border-[#00f2fe] focus:outline-none font-medium shadow-xs"
          />
        </div>

        <div className="relative">
          <Filter className="absolute left-3.5 top-3 h-4 w-4 text-blue-500" />
          <select
            value={selectedMinutaFilter}
            onChange={(e) => setSelectedMinutaFilter(e.target.value)}
            className="w-full rounded-xl bg-white dark:bg-[#112240] pl-10 pr-4 py-2.5 text-xs text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 focus:outline-none font-bold cursor-pointer shadow-xs"
          >
            <option value="ALL">Todas las Minutas</option>
            {minutaNumerosList.map(num => (
              <option key={num} value={num}>Minuta #{num} ({SCTAP_COMPROMISOS.filter(c => c.minutaNumero === num).length} tareas)</option>
            ))}
          </select>
        </div>

        <div className="relative">
          <Tag className="absolute left-3.5 top-3 h-4 w-4 text-purple-500" />
          <select
            value={selectedAreaFilter}
            onChange={(e) => setSelectedAreaFilter(e.target.value)}
            className="w-full rounded-xl bg-white dark:bg-[#112240] pl-10 pr-4 py-2.5 text-xs text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 focus:outline-none font-bold cursor-pointer shadow-xs"
          >
            <option value="ALL">Todas las Áreas</option>
            {areasList.map(a => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Estado de carga / vacío */}
      {isLoading && (
        <div className="rounded-2xl bg-slate-50 dark:bg-[#0b172c] p-6 border border-slate-200 dark:border-slate-800 text-center text-xs font-bold text-slate-500 dark:text-slate-400">
          Cargando minutario desde InsForge (v_scmtp_minutas · v_scmtp_compromisos_tareas · v_scmtp_pendientes_area)…
        </div>
      )}
      {!isLoading && SCTAP_MINUTAS.length === 0 && SCTAP_COMPROMISOS.length === 0 && (
        <div className="rounded-2xl bg-amber-50 dark:bg-amber-950/20 p-6 border border-amber-200 dark:border-amber-900/40 text-center">
          <p className="text-sm font-black text-amber-800 dark:text-amber-300">No hay compromisos en InsForge</p>
          <p className="text-xs text-amber-700/80 dark:text-amber-400/80 mt-1">
            Las vistas v_scmtp_* no retornaron registros o no hay conexión con la base maestra.
          </p>
        </div>
      )}

      {/* VIEW 1: MINUTAS OFICIALES */}
      {activeTab === 'minutas' && (
        <div className="space-y-4">
          {filteredMinutas.map((min) => (
            <div
              key={min.id}
              className="rounded-3xl bg-white dark:bg-[#0b172c] p-6 border border-slate-200 dark:border-slate-800 hover:border-[#002b49] dark:hover:border-[#00f2fe]/40 transition-all shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
            >
              <div className="space-y-3 max-w-4xl">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-lg bg-blue-100 text-[#002b49] border border-blue-300 dark:bg-[#00f2fe]/10 dark:text-[#00f2fe] dark:border-[#00f2fe]/30 px-3 py-1 text-xs font-mono font-black">
                    ACTA {min.numero}
                  </span>
                  <span className="flex items-center space-x-1 rounded bg-slate-100 dark:bg-slate-800 px-2.5 py-1 text-[11px] font-bold text-slate-700 dark:text-slate-300">
                    <Calendar className="h-3.5 w-3.5 text-slate-500 mr-1" />
                    <span>{min.fecha}</span>
                  </span>
                  <span className="flex items-center space-x-1 rounded bg-slate-100 dark:bg-slate-800 px-2.5 py-1 text-[11px] font-bold text-slate-700 dark:text-slate-300">
                    <Building2 className="h-3.5 w-3.5 text-slate-500 mr-1" />
                    <span>{min.lugar}</span>
                  </span>
                  <span className="rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-400 px-2.5 py-1 text-[11px] font-bold">
                    {min.compromisosCount} Compromisos Asignados
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white leading-snug">
                    Minuta #{min.numero}: {min.objetivo}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
                    <strong>Coordinador:</strong> {min.coordinador} &nbsp;|&nbsp; <strong>Elaborado por:</strong> {min.elaboradoPor}
                  </p>
                </div>

                {/* Participantes Resumen */}
                <div className="flex items-center space-x-2 pt-1 text-xs text-slate-600 dark:text-slate-400">
                  <Users className="h-4 w-4 text-blue-500" />
                  <span>
                    <strong>{min.participantes.filter(p => p.asistio).length} Asistentes</strong> ({min.participantes.filter(p => !p.asistio).length} Justificados / Reposo / Vacaciones)
                  </span>
                </div>
              </div>

              {/* View & Drive Buttons */}
              <div className="shrink-0 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <button
                  onClick={() => setSelectedMinutaModal(min)}
                  className="flex items-center justify-center space-x-2 rounded-xl bg-slate-100 dark:bg-[#112240] px-4 py-2.5 text-xs font-bold text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 hover:border-[#002b49] dark:hover:border-[#00f2fe] transition-all"
                >
                  <Eye className="h-4 w-4" />
                  <span>Ver Acta y Asistentes</span>
                </button>

                {min.driveUrl && (
                  <a
                    href={min.driveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center space-x-2 rounded-xl bg-[#002b49] text-white dark:bg-[#00f2fe] dark:text-[#0a192f] px-4 py-2.5 text-xs font-black shadow-sm hover:opacity-90 transition-opacity"
                  >
                    <span>Google Drive</span>
                    <ExternalLink className="h-4 w-4" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* VIEW 2: COMPROMISOS & TAREAS (26 ITEMS) */}
      {activeTab === 'compromisos' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between px-2 text-xs text-slate-500 font-bold">
            <span>Mostrando {filteredCompromisos.length} de {totalCompromisos} tareas</span>
            <span>SCTAP v2.0 · ISO 8000</span>
          </div>

          {filteredCompromisos.map((comp) => (
            <div
              key={comp.id}
              onClick={() => setSelectedTareaModal(comp)}
              className="rounded-2xl bg-white dark:bg-[#0b172c] p-4 sm:p-5 border border-slate-200 dark:border-slate-800 hover:border-[#002b49] dark:hover:border-[#00f2fe]/40 transition-all shadow-xs cursor-pointer group"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                
                <div className="space-y-1.5 max-w-3xl">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] font-mono font-bold text-blue-700 dark:text-[#00f2fe] bg-blue-50 dark:bg-[#00f2fe]/10 px-2 py-0.5 rounded">
                      Minuta #{comp.minutaNumero}
                    </span>
                    <span className="text-[10px] font-bold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-900/30 px-2 py-0.5 rounded">
                      {comp.areaGestion}
                    </span>
                    <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                      comp.prioridad === 'Alta' ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300' :
                      comp.prioridad === 'Media' ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300' :
                      'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                    }`}>
                      {comp.prioridad}
                    </span>
                    <span className="text-[11px] text-slate-500 font-medium flex items-center">
                      <Calendar className="h-3 w-3 mr-1" /> Plazo: {comp.plazoText}
                    </span>
                  </div>

                  <h4 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-[#00f2fe] transition-colors">
                    {comp.compromiso}
                  </h4>

                  <p className="text-[11px] text-slate-600 dark:text-slate-400">
                    <strong>Responsable:</strong> {comp.responsable} &nbsp;·&nbsp; <strong>Origen:</strong> {comp.vinculacionOrigen}
                  </p>
                </div>

                {/* Progress Indicator */}
                <div className="shrink-0 flex items-center space-x-3 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100 dark:border-slate-800">
                  <div className="text-right">
                    <span className={`text-xs font-black ${
                      comp.avancePorcentaje === 100 ? 'text-emerald-500' :
                      comp.avancePorcentaje >= 50 ? 'text-blue-500 dark:text-[#00f2fe]' : 'text-amber-500'
                    }`}>
                      {comp.avancePorcentaje}%
                    </span>
                    <div className="w-24 bg-slate-200 dark:bg-slate-700 rounded-full h-1.5 mt-1 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          comp.avancePorcentaje === 100 ? 'bg-emerald-500' :
                          comp.avancePorcentaje >= 50 ? 'bg-blue-600 dark:bg-[#00f2fe]' : 'bg-amber-500'
                        }`}
                        style={{ width: `${comp.avancePorcentaje}%` }}
                      />
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-[#00f2fe] transition-transform group-hover:translate-x-1" />
                </div>

              </div>
            </div>
          ))}
        </div>
      )}

      {/* VIEW 3: TABLERO KANBAN DINÁMICO */}
      {activeTab === 'kanban' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-bold">{totalCompromisos} Tareas distribuidas por estado de avance real</span>
            <span className="text-[10px] font-mono bg-blue-100 text-blue-800 dark:bg-[#00f2fe]/10 dark:text-[#00f2fe] px-2.5 py-0.5 rounded-full font-black">
              LIVE SCTAP DATA
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            
            {/* Column 1: Por Iniciar / Pendientes (<30%) */}
            <div className="bg-slate-50 dark:bg-[#0a1526] rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-inner flex flex-col">
              <h4 className="text-xs font-black text-slate-500 uppercase tracking-wider mb-3 flex items-center justify-between">
                <span>Por Iniciar (&lt;30%)</span>
                <span className="bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded-full text-[10px]">
                  {kanbanColumns.porIniciar.length}
                </span>
              </h4>
              <div className="space-y-3 flex-1 overflow-y-auto max-h-[600px] pr-1">
                {kanbanColumns.porIniciar.map(c => (
                  <div 
                    key={c.id} 
                    onClick={() => setSelectedTareaModal(c)}
                    className="bg-white dark:bg-[#112240] p-3 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm border-l-4 border-l-slate-400 hover:border-l-[#00f2fe] cursor-pointer transition-all"
                  >
                    <div className="text-[10px] font-bold text-slate-500 mb-1 flex justify-between">
                      <span>#{c.minutaNumero}</span>
                      <span className="font-mono">{c.avancePorcentaje}%</span>
                    </div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white line-clamp-2 leading-tight">
                      {c.compromiso}
                    </p>
                    <div className="mt-2 text-[9px] text-slate-500 font-medium">
                      Resp: {c.responsable}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Column 2: En Proceso (30% - 79%) */}
            <div className="bg-blue-50/50 dark:bg-blue-950/10 rounded-2xl p-4 border border-blue-100 dark:border-blue-900/30 shadow-inner flex flex-col">
              <h4 className="text-xs font-black text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-3 flex items-center justify-between">
                <span>En Proceso (30-79%)</span>
                <span className="bg-blue-200 dark:bg-blue-900/60 text-blue-800 dark:text-blue-300 px-2 py-0.5 rounded-full text-[10px]">
                  {kanbanColumns.enProceso.length}
                </span>
              </h4>
              <div className="space-y-3 flex-1 overflow-y-auto max-h-[600px] pr-1">
                {kanbanColumns.enProceso.map(c => (
                  <div 
                    key={c.id} 
                    onClick={() => setSelectedTareaModal(c)}
                    className="bg-white dark:bg-[#112240] p-3 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm border-l-4 border-l-blue-500 hover:border-l-[#00f2fe] cursor-pointer transition-all"
                  >
                    <div className="text-[10px] font-bold text-blue-600 dark:text-blue-400 mb-1 flex justify-between">
                      <span>#{c.minutaNumero} · {c.areaGestion}</span>
                      <span className="font-mono font-black">{c.avancePorcentaje}%</span>
                    </div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white line-clamp-2 leading-tight">
                      {c.compromiso}
                    </p>
                    <div className="mt-2 text-[9px] text-slate-500 font-medium">
                      Resp: {c.responsable}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Column 3: QA & Validación (80% - 99%) */}
            <div className="bg-amber-50/50 dark:bg-amber-950/10 rounded-2xl p-4 border border-amber-100 dark:border-amber-900/30 shadow-inner flex flex-col">
              <h4 className="text-xs font-black text-amber-600 dark:text-amber-400 uppercase tracking-wider mb-3 flex items-center justify-between">
                <span>Validación (80-99%)</span>
                <span className="bg-amber-200 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300 px-2 py-0.5 rounded-full text-[10px]">
                  {kanbanColumns.qaRevision.length}
                </span>
              </h4>
              <div className="space-y-3 flex-1 overflow-y-auto max-h-[600px] pr-1">
                {kanbanColumns.qaRevision.map(c => (
                  <div 
                    key={c.id} 
                    onClick={() => setSelectedTareaModal(c)}
                    className="bg-white dark:bg-[#112240] p-3 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm border-l-4 border-l-amber-500 hover:border-l-[#00f2fe] cursor-pointer transition-all"
                  >
                    <div className="text-[10px] font-bold text-amber-600 dark:text-amber-400 mb-1 flex justify-between">
                      <span>#{c.minutaNumero}</span>
                      <span className="font-mono font-black">{c.avancePorcentaje}%</span>
                    </div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white line-clamp-2 leading-tight">
                      {c.compromiso}
                    </p>
                    <div className="mt-2 text-[9px] text-slate-500 font-medium">
                      Resp: {c.responsable}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Column 4: Completado (100%) */}
            <div className="bg-emerald-50/50 dark:bg-emerald-950/10 rounded-2xl p-4 border border-emerald-100 dark:border-emerald-900/30 shadow-inner flex flex-col">
              <h4 className="text-xs font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-3 flex items-center justify-between">
                <span>Completado (100%)</span>
                <span className="bg-emerald-200 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 rounded-full text-[10px]">
                  {kanbanColumns.completado.length}
                </span>
              </h4>
              <div className="space-y-3 flex-1 overflow-y-auto max-h-[600px] pr-1">
                {kanbanColumns.completado.map(c => (
                  <div 
                    key={c.id} 
                    onClick={() => setSelectedTareaModal(c)}
                    className="bg-white dark:bg-[#112240] p-3 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm border-l-4 border-l-emerald-500 hover:border-l-[#00f2fe] cursor-pointer transition-all"
                  >
                    <div className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 mb-1 flex justify-between">
                      <span>#{c.minutaNumero}</span>
                      <span className="font-mono font-black">100%</span>
                    </div>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200 line-clamp-2 leading-tight">
                      {c.compromiso}
                    </p>
                    <div className="mt-2 text-[9px] text-slate-500 font-medium">
                      Resp: {c.responsable}
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* VIEW 4: PENDIENTES POR ÁREA (13 ITEMS) */}
      {activeTab === 'pendientes' && (
        <div className="space-y-3">
          <div className="rounded-2xl bg-amber-50 dark:bg-amber-950/20 p-4 border border-amber-200 dark:border-amber-900/40 text-xs text-amber-900 dark:text-amber-300">
            <strong>Matriz de Pendientes Operacionales:</strong> Acciones estratégicas transversales asignadas a las divisiones para garantizar continuidad del servicio y gobierno de datos.
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {SCTAP_PENDIENTES.map(p => (
              <div
                key={p.id}
                className="rounded-2xl bg-white dark:bg-[#0b172c] p-4 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-[#002b49] dark:text-[#00f2fe] bg-blue-50 dark:bg-[#00f2fe]/10 px-2 py-0.5 rounded">
                    Área: {p.area}
                  </span>
                  <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                    p.estado === 'Completado' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' :
                    p.estado === 'En Proceso' ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300' :
                    'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                  }`}>
                    {p.estado}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-relaxed">
                  {p.pendiente}
                </h4>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800 space-y-0.5">
                  <p><strong>Depende de:</strong> {p.dependeDe}</p>
                  <p className="text-slate-600 dark:text-slate-300"><strong>Observación:</strong> {p.observacion}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL 1: DETALLE DE MINUTA */}
      {selectedMinutaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-3xl rounded-3xl bg-white dark:bg-[#0b172c] p-6 border border-slate-200 dark:border-[#00f2fe]/40 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
              <div>
                <span className="text-xs font-mono font-black text-[#002b49] dark:text-[#00f2fe]">
                  ACTA OFICIAL #{selectedMinutaModal.numero}
                </span>
                <h3 className="text-lg font-black text-slate-900 dark:text-white mt-1">
                  {selectedMinutaModal.objetivo}
                </h3>
              </div>
              <button
                onClick={() => setSelectedMinutaModal(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Metadatos */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 dark:bg-[#112240] p-4 rounded-2xl text-xs">
              <div>
                <span className="text-slate-500 font-bold">Fecha / Hora:</span>
                <p className="font-black text-slate-900 dark:text-white">{selectedMinutaModal.fecha} {selectedMinutaModal.hora}</p>
              </div>
              <div>
                <span className="text-slate-500 font-bold">Lugar / Sede:</span>
                <p className="font-black text-slate-900 dark:text-white">{selectedMinutaModal.lugar}</p>
              </div>
              <div>
                <span className="text-slate-500 font-bold">Coordinador:</span>
                <p className="font-black text-slate-900 dark:text-white">{selectedMinutaModal.coordinador}</p>
              </div>
              <div>
                <span className="text-slate-500 font-bold">Próximo Seg.:</span>
                <p className="font-black text-blue-600 dark:text-[#00f2fe]">{selectedMinutaModal.proximaFechaSeguimiento}</p>
              </div>
            </div>

            {/* Participantes */}
            <div>
              <h4 className="text-xs font-black uppercase text-slate-500 tracking-wider mb-2 flex items-center space-x-1">
                <Users className="h-4 w-4" />
                <span>Asistencia y Participantes ({selectedMinutaModal.participantes.length})</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                {selectedMinutaModal.participantes.map((p, idx) => (
                  <div 
                    key={idx} 
                    className={`p-2.5 rounded-xl border text-xs flex items-center justify-between ${
                      p.asistio 
                        ? 'bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/40'
                        : 'bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 opacity-70'
                    }`}
                  >
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white">{p.nombre}</p>
                      <p className="text-[10px] text-slate-500">{p.unidadOrganizativa}</p>
                    </div>
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded ${
                      p.asistio ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300' : 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                    }`}>
                      {p.asistio ? 'Presente' : (p.observacion || 'No asistió')}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer Modal */}
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-200 dark:border-slate-800">
              <span className="text-[10px] text-slate-500 font-semibold">
                Registro oficial de la Gerencia de Planificación de Distribución (GGPD)
              </span>
              {selectedMinutaModal.driveUrl && (
                <a
                  href={selectedMinutaModal.driveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 rounded-xl bg-[#002b49] text-white dark:bg-[#00f2fe] dark:text-[#0a192f] px-5 py-2.5 text-xs font-black shadow-md hover:opacity-90 transition-all"
                >
                  <span>Ver Carpeta en Google Drive</span>
                  <ExternalLink className="h-4 w-4" />
                </a>
              )}
            </div>

          </div>
        </div>
      )}

      {/* MODAL 2: DETALLE DE TAREA / COMPROMISO */}
      {selectedTareaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-3xl bg-white dark:bg-[#0b172c] p-6 border border-slate-200 dark:border-[#00f2fe]/40 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-mono font-bold text-blue-600 dark:text-[#00f2fe]">
                  Minuta #{selectedTareaModal.minutaNumero} · {selectedTareaModal.areaGestion}
                </span>
                <h3 className="text-base font-black text-slate-900 dark:text-white mt-1">
                  {selectedTareaModal.compromiso}
                </h3>
              </div>
              <button
                onClick={() => setSelectedTareaModal(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-slate-50 dark:bg-[#112240] p-4 rounded-2xl text-xs">
              <div>
                <span className="text-slate-500 font-bold">Responsable:</span>
                <p className="font-black text-slate-900 dark:text-white">{selectedTareaModal.responsable}</p>
              </div>
              <div>
                <span className="text-slate-500 font-bold">Plazo Comprometido:</span>
                <p className="font-black text-blue-600 dark:text-[#00f2fe]">{selectedTareaModal.plazoText}</p>
              </div>
              <div>
                <span className="text-slate-500 font-bold">Prioridad / Estado:</span>
                <p className="font-black text-slate-900 dark:text-white">{selectedTareaModal.prioridad} · {selectedTareaModal.estado}</p>
              </div>
            </div>

            {/* Avance */}
            <div className="space-y-1.5 bg-slate-50 dark:bg-[#112240] p-4 rounded-2xl">
              <div className="flex justify-between items-center text-xs font-bold">
                <span className="text-slate-700 dark:text-slate-300">Porcentaje de Avance Registrado:</span>
                <span className="text-blue-600 dark:text-[#00f2fe] font-black">{selectedTareaModal.avancePorcentaje}%</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    selectedTareaModal.avancePorcentaje === 100 ? 'bg-emerald-500' :
                    selectedTareaModal.avancePorcentaje >= 50 ? 'bg-blue-600 dark:bg-[#00f2fe]' : 'bg-amber-500'
                  }`}
                  style={{ width: `${selectedTareaModal.avancePorcentaje}%` }}
                />
              </div>
            </div>

            {/* Observaciones */}
            <div className="text-xs space-y-1">
              <span className="font-bold text-slate-500">Observaciones Técnicas:</span>
              <p className="text-slate-800 dark:text-slate-200 font-medium bg-slate-50 dark:bg-[#112240] p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                {selectedTareaModal.observaciones}
              </p>
            </div>

            {/* Historial de Avances */}
            {selectedTareaModal.historialAvances.length > 0 && (
              <div className="space-y-2 pt-2">
                <h4 className="text-xs font-black uppercase text-slate-500 tracking-wider">Historial de Notas de Avance</h4>
                <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                  {selectedTareaModal.historialAvances.map(h => (
                    <div key={h.id} className="p-3 rounded-xl bg-slate-50 dark:bg-[#112240] border border-slate-200 dark:border-slate-800 text-xs">
                      <div className="flex justify-between items-center text-slate-500 text-[10px] font-bold mb-1">
                        <span>{h.fecha} · Registrado por {h.usuario}</span>
                        <span className="text-blue-500 font-mono font-black">{h.porcentaje}%</span>
                      </div>
                      <p className="text-slate-800 dark:text-slate-200 font-medium">{h.nota}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-3 flex justify-end border-t border-slate-200 dark:border-slate-800">
              <button
                onClick={() => setSelectedTareaModal(null)}
                className="px-5 py-2 rounded-xl bg-[#002b49] text-white dark:bg-[#00f2fe] dark:text-[#072146] font-black text-xs"
              >
                Cerrar
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
