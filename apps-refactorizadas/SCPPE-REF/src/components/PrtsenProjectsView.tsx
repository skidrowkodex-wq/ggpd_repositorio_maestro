import React, { useEffect, useState, useMemo } from 'react';
import { ProyectoPRTSEN, AccionPOA, SubestacionRDS, CircuitoRDS } from '../types';
import { 
  getProyectosPRTSEN, 
  createProyectoPRTSEN, 
  updateProyectoPRTSEN, 
  getAccionesPOA, 
  vincularProyectoPRTSEN,
  getSubestacionesRDS,
  getCircuitosRDS
} from '../services/supabaseService';
import { 
  Search, 
  Filter, 
  CheckCircle2, 
  AlertCircle, 
  Plus, 
  RefreshCw, 
  Database, 
  Link2, 
  FolderCheck, 
  Edit3, 
  Zap, 
  Building2, 
  Layers, 
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeft, 
  ChevronsRight,
  DollarSign,
  MapPin,
  FileText
} from 'lucide-react';
import { FichaTecnicaModal } from './FichaTecnicaModal';

export function PrtsenProjectsView() {
  const [proyectos, setProyectos] = useState<ProyectoPRTSEN[]>([]);
  const [subestaciones, setSubestaciones] = useState<SubestacionRDS[]>([]);
  const [circuitos, setCircuitos] = useState<CircuitoRDS[]>([]);
  const [accionesPOA, setAccionesPOA] = useState<AccionPOA[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFromSupabase, setIsFromSupabase] = useState(false);

  // Modal Ficha Técnica
  const [fichaProyecto, setFichaProyecto] = useState<ProyectoPRTSEN | null>(null);
  const [showFichaModal, setShowFichaModal] = useState(false);

  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [dimensionFilter, setDimensionFilter] = useState<string>('TODAS');
  const [estadoFilter, setEstadoFilter] = useState<string>('TODOS');
  const [estatusFilter, setEstatusFilter] = useState<string>('TODOS');
  const [matchFilter, setMatchFilter] = useState<string>('TODOS');

  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  // Modal Nuevo Proyecto State
  const [showModal, setShowModal] = useState(false);
  const [newCodigo, setNewCodigo] = useState('');
  const [newNombre, setNewNombre] = useState('');
  const [newDimension, setNewDimension] = useState<'SUBESTACION' | 'CIRCUITO' | 'ESTADAL' | 'PLANTA'>('SUBESTACION');
  const [newEstado, setNewEstado] = useState('DISTRITO CAPITAL');
  const [newRegion, setNewRegion] = useState('CAPITAL');
  const [newMontoUsd, setNewMontoUsd] = useState<number>(250000);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Modal Edición / Asignación Manual State
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingProyecto, setEditingProyecto] = useState<ProyectoPRTSEN | null>(null);
  const [editNombre, setEditNombre] = useState('');
  const [editDimension, setEditDimension] = useState<string>('CIRCUITO');
  const [editSubestacion, setEditSubestacion] = useState('');
  const [editCircuito, setEditCircuito] = useState('');
  const [editMontoUsd, setEditMontoUsd] = useState<number>(0);
  const [editEstatus, setEditEstatus] = useState<string>('FORMULACION');
  const [editAvanceFisico, setEditAvanceFisico] = useState<number>(0);
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  // Modal Vinculación POA State
  const [showVincularModal, setShowVincularModal] = useState(false);
  const [selectedProyecto, setSelectedProyecto] = useState<ProyectoPRTSEN | null>(null);
  const [codigoAccionInput, setCodigoAccionInput] = useState('ACC-2026-04-PRTSEN');
  const [isLinking, setIsLinking] = useState(false);

  const loadData = async () => {
    setLoading(true);
    const [resProy, resPOA, resSE, resCto] = await Promise.all([
      getProyectosPRTSEN(),
      getAccionesPOA(),
      getSubestacionesRDS(),
      getCircuitosRDS()
    ]);

    setProyectos(resProy.data);
    setIsFromSupabase(resProy.isFromSupabase);
    setAccionesPOA(resPOA.data);
    setSubestaciones(resSE.data);
    setCircuitos(resCto.data);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  // Lista de estados únicos presentes en los proyectos
  const estadosUnicos = useMemo(() => {
    const set = new Set<string>();
    proyectos.forEach(p => {
      if (p.estado) set.add(p.estado.toUpperCase());
    });
    return Array.from(set).sort();
  }, [proyectos]);

  // Filtrado de proyectos
  const filteredProjects = useMemo(() => {
    return proyectos.filter((p) => {
      const matchSearch =
        p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.codigo_rds.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.estado && p.estado.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (p.subestacion_asociada && p.subestacion_asociada.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (p.circuito_asociado && p.circuito_asociado.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchDim = dimensionFilter === 'TODAS' || p.dimension === dimensionFilter;
      const matchEst = estadoFilter === 'TODOS' || (p.estado && p.estado.toUpperCase() === estadoFilter);
      const matchStatus = estatusFilter === 'TODOS' || p.estatus === estatusFilter;
      const matchMet = matchFilter === 'TODOS' || p.match_metodo === matchFilter;

      return matchSearch && matchDim && matchEst && matchStatus && matchMet;
    });
  }, [proyectos, searchTerm, dimensionFilter, estadoFilter, estatusFilter, matchFilter]);

  // Reiniciar a la primera página cuando cambian los filtros
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, dimensionFilter, estadoFilter, estatusFilter, matchFilter, itemsPerPage]);

  // Paginación calculada
  const totalPages = Math.ceil(filteredProjects.length / itemsPerPage) || 1;
  const paginatedProjects = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredProjects.slice(start, start + itemsPerPage);
  }, [filteredProjects, currentPage, itemsPerPage]);

  // Métricas Consolidadas
  const totalInversionUSD = useMemo(() => {
    return proyectos.reduce((acc, p) => acc + (p.monto_usd || 0), 0);
  }, [proyectos]);

  const vinculadosCount = useMemo(() => {
    return proyectos.filter(p => p.vinculado_poa).length;
  }, [proyectos]);

  const pendientesMatchCount = useMemo(() => {
    return proyectos.filter(p => p.match_metodo === 'MANUAL_PENDIENTE').length;
  }, [proyectos]);

  // Handlers para Edición / Asignación Manual
  const handleOpenEditModal = (proyecto: ProyectoPRTSEN) => {
    setEditingProyecto(proyecto);
    setEditNombre(proyecto.nombre);
    setEditDimension(proyecto.dimension);
    setEditSubestacion(proyecto.subestacion_asociada || '');
    setEditCircuito(proyecto.circuito_asociado || '');
    setEditMontoUsd(proyecto.monto_usd);
    setEditEstatus(proyecto.estatus);
    setEditAvanceFisico(proyecto.avance_fisico_pct || 0);
    setShowEditModal(true);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProyecto) return;

    setIsSavingEdit(true);
    const updates: Partial<ProyectoPRTSEN> = {
      nombre: editNombre,
      dimension: editDimension as any,
      subestacion_asociada: editSubestacion || undefined,
      circuito_asociado: editCircuito || undefined,
      monto_usd: Number(editMontoUsd),
      estatus: editEstatus as any,
      avance_fisico_pct: Number(editAvanceFisico),
      match_metodo: 'EXACTO', // Tras edición manual se valida como match exacto
    };

    const res = await updateProyectoPRTSEN(editingProyecto.id, updates);
    if (res.success) {
      setProyectos((prev) =>
        prev.map((p) =>
          p.id === editingProyecto.id ? { ...p, ...updates } : p
        )
      );
      setShowEditModal(false);
    } else {
      alert('Error al actualizar en InsForge: ' + (res.error || 'Error desconocido'));
    }
    setIsSavingEdit(false);
  };

  // Handlers para Vinculación POA
  const handleOpenVincularModal = (proyecto: ProyectoPRTSEN) => {
    setSelectedProyecto(proyecto);
    setCodigoAccionInput(proyecto.accion_poa_codigo || 'ACC-2026-04-PRTSEN');
    setShowVincularModal(true);
  };

  const handleConfirmVincular = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProyecto || !codigoAccionInput) return;

    setIsLinking(true);
    const res = await vincularProyectoPRTSEN(selectedProyecto.id, codigoAccionInput);
    if (res.success) {
      setProyectos((prev) =>
        prev.map((p) =>
          p.id === selectedProyecto.id
            ? {
                ...p,
                vinculado_poa: true,
                accion_poa_codigo: codigoAccionInput,
                codigo_sipes: `SIPES-${codigoAccionInput}`,
                match_metodo: 'EXACTO',
              }
            : p
        )
      );
      setShowVincularModal(false);
    } else {
      alert('Error al vincular con InsForge: ' + (res.error || 'Error desconocido'));
    }
    setIsLinking(false);
  };

  // Handler para Crear Proyecto
  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCodigo || !newNombre) return;

    setIsSubmitting(true);
    const result = await createProyectoPRTSEN({
      codigo_rds: newCodigo,
      nombre: newNombre,
      dimension: newDimension,
      estado: newEstado,
      region: newRegion,
      monto_usd: Number(newMontoUsd),
      avance_fisico_pct: 0,
      avance_financiero_pct: 0,
      estatus: 'FORMULACION',
      vinculado_poa: true,
      codigo_sipes: 'SIPES-ACC-2026-04-PRTSEN',
      accion_poa_codigo: 'ACC-2026-04-PRTSEN',
      accion_poa_nombre: 'Acción #4: Rehabilitación, Modernización y Transformación del Sistema Eléctrico Nacional',
      match_metodo: 'EXACTO',
    });

    if (result.success && result.data) {
      setProyectos((prev) => [result.data!, ...prev]);
      setShowModal(false);
      setNewCodigo('');
      setNewNombre('');
    } else {
      alert('Error al guardar en InsForge: ' + (result.error || 'Error desconocido'));
    }
    setIsSubmitting(false);
  };

  return (
    <div className="space-y-6">
      {/* Cabecera Principal */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              Proyectos PRTSEN (Sector Eléctrico Nacional)
            </h2>
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold border shrink-0 ${
              isFromSupabase 
                ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800' 
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
            }`}>
              {isFromSupabase ? 'En vivo InsForge PostgreSQL' : 'Conectando...'}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-0.5">
            Cartera nacional de 821 proyectos con asignación RDS-PS, gobernanza ISO 8000 y anclaje a la Acción #4 del POA 2026.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
          <button
            onClick={loadData}
            disabled={loading}
            className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs transition-colors shadow-2xs"
            title="Recargar datos de InsForge"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={() => setShowModal(true)}
            className="px-3.5 py-2 rounded-lg bg-corpo-blue hover:bg-corpo-dark text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Nuevo Proyecto</span>
          </button>
        </div>
      </div>

      {/* Tarjetas Resumen de KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-3">
          <div className="p-2 rounded-md bg-blue-100 dark:bg-blue-950/60 text-corpo-blue">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider">Cartera Total</div>
            <div className="text-lg font-bold text-slate-900 dark:text-slate-100">{proyectos.length} Proyectos</div>
          </div>
        </div>

        <div className="p-3.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-3">
          <div className="p-2 rounded-md bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider">Inversión Consolidada</div>
            <div className="text-lg font-bold text-slate-900 dark:text-slate-100">
              ${(totalInversionUSD / 1000000).toFixed(2)}M USD
            </div>
          </div>
        </div>

        <div className="p-3.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-3">
          <div className="p-2 rounded-md bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
            <FolderCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider">Vinculados Acción #4</div>
            <div className="text-lg font-bold text-slate-900 dark:text-slate-100">{vinculadosCount} (100%)</div>
          </div>
        </div>

        <div className="p-3.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-3">
          <div className="p-2 rounded-md bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider">Ajuste Manual / Pendientes</div>
            <div className="text-lg font-bold text-slate-900 dark:text-slate-100">{pendientesMatchCount} Proyectos</div>
          </div>
        </div>
      </div>

      {/* Barra de Búsqueda y Multi-Filtros */}
      <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por código RDS-PS, nombre de proyecto, subestación, circuito o estado..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-200 text-xs rounded-md pl-9 pr-4 py-2 focus:outline-none focus:ring-1 focus:ring-red-500 shadow-inner font-medium"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {/* Filtro Estado */}
            <select
              value={estadoFilter}
              onChange={(e) => setEstadoFilter(e.target.value)}
              className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-200 text-xs rounded-md px-2.5 py-2 focus:outline-none focus:ring-1 focus:ring-red-500 font-semibold"
            >
              <option value="TODOS">Todos los Estados ({estadosUnicos.length})</option>
              {estadosUnicos.map((est) => (
                <option key={est} value={est}>{est}</option>
              ))}
            </select>

            {/* Filtro Dimensión */}
            <select
              value={dimensionFilter}
              onChange={(e) => setDimensionFilter(e.target.value)}
              className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-200 text-xs rounded-md px-2.5 py-2 focus:outline-none focus:ring-1 focus:ring-red-500 font-semibold"
            >
              <option value="TODAS">Todas las Dimensiones</option>
              <option value="CIRCUITO">⚡ Circuito</option>
              <option value="SUBESTACION">🏢 Subestación</option>
              <option value="EQUIPO_MENOR">🔌 Equipo Menor</option>
              <option value="ESTADAL">🌐 Estadal</option>
            </select>

            {/* Filtro Estatus */}
            <select
              value={estatusFilter}
              onChange={(e) => setEstatusFilter(e.target.value)}
              className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-200 text-xs rounded-md px-2.5 py-2 focus:outline-none focus:ring-1 focus:ring-red-500 font-semibold"
            >
              <option value="TODOS">Todos los Estatus</option>
              <option value="FORMULACION">Formulación / Por Ejecutar</option>
              <option value="EN_EJECUCION">En Ejecución</option>
              <option value="PARALIZADO">Paralizado</option>
              <option value="COMPLETADO">Completado / Ejecutado</option>
            </select>

            {/* Filtro Match */}
            <select
              value={matchFilter}
              onChange={(e) => setMatchFilter(e.target.value)}
              className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-200 text-xs rounded-md px-2.5 py-2 focus:outline-none focus:ring-1 focus:ring-red-500 font-semibold"
            >
              <option value="TODOS">Todos los Matches</option>
              <option value="EXACTO">✓ Match Exacto MDM</option>
              <option value="NORMALIZADO">≈ Match Normalizado</option>
              <option value="MANUAL_PENDIENTE">⚠️ Asignación Manual</option>
            </select>
          </div>
        </div>

        {/* Resumen de Resultados y Paginación Superior */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/60 text-xs text-slate-500">
          <div>
            Mostrando <strong>{filteredProjects.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1}</strong> - <strong>{Math.min(currentPage * itemsPerPage, filteredProjects.length)}</strong> de <strong>{filteredProjects.length}</strong> proyectos encontrados
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-medium">Por pág:</span>
            <select
              value={itemsPerPage}
              onChange={(e) => setItemsPerPage(Number(e.target.value))}
              className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded px-1.5 py-0.5 text-xs font-bold"
            >
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>

            <div className="flex items-center gap-1 ml-2">
              <button
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30"
                title="Primera página"
              >
                <ChevronsLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30"
                title="Página anterior"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-2 font-mono font-bold text-slate-700 dark:text-slate-300">
                {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30"
                title="Página siguiente"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
                className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30"
                title="Última página"
              >
                <ChevronsRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center rounded-xl bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 space-y-3 shadow-sm">
          <RefreshCw className="w-6 h-6 text-corpo-red dark:text-corpo-blue animate-spin mx-auto" />
          <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">Cargando catálogo PRTSEN desde InsForge...</p>
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="p-12 text-center rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
          <AlertCircle className="w-8 h-8 text-amber-500 mx-auto" />
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">No se encontraron proyectos con los filtros seleccionados</h3>
          <p className="text-xs text-slate-500">Prueba ajustando el término de búsqueda o seleccionando "Todos los Estados / Dimensiones".</p>
        </div>
      ) : (
        /* Lista de Tarjetas de Proyecto */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {paginatedProjects.map((proyecto: ProyectoPRTSEN) => (
            <div
              key={proyecto.id}
              className="p-5 industrial-card hover:border-slate-300 dark:hover:border-slate-700 transition-all space-y-3 shadow-sm flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-bold text-slate-900 dark:text-slate-100">
                        {proyecto.codigo_rds}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                        {proyecto.dimension}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                        proyecto.match_metodo === 'EXACTO'
                          ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                          : proyecto.match_metodo === 'NORMALIZADO'
                          ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800'
                          : 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                      }`}>
                        {proyecto.match_metodo === 'EXACTO' ? '✓ Match MDM' : proyecto.match_metodo === 'NORMALIZADO' ? '≈ Normalizado' : '⚠️ Asig. Manual'}
                      </span>
                    </div>
                    <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm mt-1 leading-snug">
                      {proyecto.nombre}
                    </h3>
                  </div>

                  <div className="shrink-0 flex items-center gap-1">
                    <button
                      onClick={() => {
                        setFichaProyecto(proyecto);
                        setShowFichaModal(true);
                      }}
                      className="p-1.5 rounded-md bg-purple-50 dark:bg-purple-950/60 hover:bg-purple-100 dark:hover:bg-purple-900/60 text-purple-700 dark:text-purple-300 transition-colors shadow-2xs"
                      title="Ver Ficha Técnica Oficial (PRTSEN / SEN)"
                    >
                      <FileText className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleOpenEditModal(proyecto)}
                      className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-corpo-blue transition-colors"
                      title="Editar / Asignar Activo Manualmente"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/60 p-2.5 rounded-md border border-slate-100 dark:border-slate-800/80">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate"><strong>Estado:</strong> {proyecto.estado || 'N/A'}</span>
                  </div>
                  <div>
                    <strong>Región:</strong> {proyecto.region || 'N/A'}
                  </div>
                  <div className="col-span-2 space-y-0.5">
                    {proyecto.subestacion_asociada && (
                      <div className="truncate flex items-center gap-1">
                        <Building2 className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                        <span className="truncate"><strong>S/E:</strong> {proyecto.subestacion_asociada}</span>
                      </div>
                    )}
                    {proyecto.circuito_asociado && (
                      <div className="truncate flex items-center gap-1">
                        <Zap className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                        <span className="truncate"><strong>Circuito:</strong> {proyecto.circuito_asociado}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-500">Monto Inversión USD:</span>
                    <span className="font-mono text-slate-900 dark:text-slate-100 font-bold">
                      ${proyecto.monto_usd ? proyecto.monto_usd.toLocaleString('en-US', { minimumFractionDigits: 2 }) : '0.00'}
                    </span>
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-500">
                    <span>Avance Físico: {proyecto.avance_fisico_pct || 0}%</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      {proyecto.estatus === 'FORMULACION' ? 'Por Ejecutar' : proyecto.estatus === 'EN_EJECUCION' ? 'En Ejecución' : proyecto.estatus}
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-corpo-blue"
                      style={{ width: `${Math.min(100, proyecto.avance_fisico_pct || 0)}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Bloque de Vinculación POA */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                {proyecto.vinculado_poa ? (
                  <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold truncate">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span className="truncate">
                      {proyecto.codigo_sipes || 'SIPES-ACC-2026-04-PRTSEN'}
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-bold">
                    <AlertCircle className="w-4 h-4" />
                    <span>Sin Enlace POA</span>
                  </div>
                )}

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => {
                      setFichaProyecto(proyecto);
                      setShowFichaModal(true);
                    }}
                    className="px-2 py-1 rounded bg-purple-50 dark:bg-purple-950/60 hover:bg-purple-100 dark:hover:bg-purple-900/60 text-purple-700 dark:text-purple-300 font-bold text-[11px] flex items-center gap-1 transition-colors border border-purple-200 dark:border-purple-800/80"
                    title="Abrir e Imprimir Ficha Técnica Oficial"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Ficha</span>
                  </button>

                  <button
                    onClick={() => handleOpenVincularModal(proyecto)}
                    className="px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-[11px] flex items-center gap-1 transition-colors"
                  >
                    <Link2 className="w-3.5 h-3.5" />
                    <span>{proyecto.vinculado_poa ? 'Cambiar AE' : 'Vincular POA'}</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Edición y Asignación Manual de Activos */}
      {showEditModal && editingProyecto && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl w-full max-w-lg p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-corpo-blue">
                <Edit3 className="w-5 h-5" />
                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                  Editar / Asignar Activo Manualmente ({editingProyecto.codigo_rds})
                </h3>
              </div>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-800 dark:text-slate-300 font-bold mb-1">Nombre del Proyecto *</label>
                <textarea
                  rows={2}
                  required
                  value={editNombre}
                  onChange={(e) => setEditNombre(e.target.value)}
                  className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-200 rounded-md p-2.5 focus:outline-none focus:ring-1 focus:ring-red-500 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-800 dark:text-slate-300 font-bold mb-1">Dimensión</label>
                  <select
                    value={editDimension}
                    onChange={(e) => setEditDimension(e.target.value)}
                    className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-200 rounded-md p-2.5 focus:outline-none font-semibold"
                  >
                    <option value="CIRCUITO">⚡ CIRCUITO</option>
                    <option value="SUBESTACION">🏢 SUBESTACION</option>
                    <option value="EQUIPO_MENOR">🔌 EQUIPO MENOR</option>
                    <option value="ESTADAL">🌐 ESTADAL</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-800 dark:text-slate-300 font-bold mb-1">Monto Inversión USD</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editMontoUsd}
                    onChange={(e) => setEditMontoUsd(Number(e.target.value))}
                    className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-200 rounded-md p-2.5 focus:outline-none font-mono font-bold"
                  />
                </div>
              </div>

              {/* Asignación de Subestación */}
              <div>
                <label className="block text-slate-800 dark:text-slate-300 font-bold mb-1">
                  🏢 Subestación Cabecera Asignada:
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Escribir o seleccionar subestación..."
                    value={editSubestacion}
                    onChange={(e) => setEditSubestacion(e.target.value)}
                    className="flex-1 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-200 rounded-md p-2.5 focus:outline-none font-medium"
                  />
                  {subestaciones.length > 0 && (
                    <select
                      onChange={(e) => setEditSubestacion(e.target.value)}
                      className="w-36 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-200 rounded-md px-2 text-[11px]"
                    >
                      <option value="">Elegir S/E ({subestaciones.length})</option>
                      {subestaciones.slice(0, 50).map((s) => (
                        <option key={s.id} value={s.nombre}>{s.nombre}</option>
                      ))}
                    </select>
                  )}
                </div>
              </div>

              {/* Asignación de Circuito */}
              <div>
                <label className="block text-slate-800 dark:text-slate-300 font-bold mb-1">
                  ⚡ Circuito Eléctrico Asignado:
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Escribir o seleccionar circuito..."
                    value={editCircuito}
                    onChange={(e) => setEditCircuito(e.target.value)}
                    className="flex-1 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-200 rounded-md p-2.5 focus:outline-none font-medium"
                  />
                  {circuitos.length > 0 && (
                    <select
                      onChange={(e) => setEditCircuito(e.target.value)}
                      className="w-36 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-200 rounded-md px-2 text-[11px]"
                    >
                      <option value="">Elegir Cto ({circuitos.length})</option>
                      {circuitos.slice(0, 50).map((c) => (
                        <option key={c.id} value={c.nombre}>{c.nombre}</option>
                      ))}
                    </select>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-800 dark:text-slate-300 font-bold mb-1">Estatus del Proyecto</label>
                  <select
                    value={editEstatus}
                    onChange={(e) => setEditEstatus(e.target.value)}
                    className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-200 rounded-md p-2.5 focus:outline-none font-semibold"
                  >
                    <option value="FORMULACION">Formulación / Por Ejecutar</option>
                    <option value="EN_EJECUCION">En Ejecución</option>
                    <option value="PARALIZADO">Paralizado</option>
                    <option value="COMPLETADO">Completado / Ejecutado</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-800 dark:text-slate-300 font-bold mb-1">Avance Físico (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={editAvanceFisico}
                    onChange={(e) => setEditAvanceFisico(Number(e.target.value))}
                    className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-200 rounded-md p-2.5 focus:outline-none font-bold"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSavingEdit}
                  className="px-4 py-2 rounded-md bg-corpo-blue hover:bg-corpo-dark text-white font-bold flex items-center gap-2"
                >
                  {isSavingEdit && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>Guardar Cambios (InsForge)</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Vinculación POA */}
      {showVincularModal && selectedProyecto && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-corpo-blue">
                <Link2 className="w-5 h-5" />
                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                  Vincular Proyecto PRTSEN a Acción Específica POA
                </h3>
              </div>
              <button
                onClick={() => setShowVincularModal(false)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-lg border border-slate-200 dark:border-slate-800 space-y-1">
              <span className="text-[10px] font-mono text-slate-500">PROYECTO SELECCIONADO</span>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{selectedProyecto.nombre}</p>
              <p className="text-[11px] font-mono text-slate-600 dark:text-slate-400">{selectedProyecto.codigo_rds}</p>
            </div>

            <form onSubmit={handleConfirmVincular} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="block text-slate-800 dark:text-slate-300 font-bold">
                  Seleccionar Acción Específica POA 2026:
                </label>

                {accionesPOA.length > 0 ? (
                  <div className="space-y-1 mb-2">
                    <select
                      value={codigoAccionInput}
                      onChange={(e) => setCodigoAccionInput(e.target.value)}
                      className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-200 rounded-md p-2.5 focus:outline-none focus:ring-1 focus:ring-red-500 font-mono font-medium"
                    >
                      {accionesPOA.map((acc) => (
                        <option key={acc.id} value={acc.codigo}>
                          {acc.codigo} — {acc.nombre.substring(0, 45)}...
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div className="p-2.5 mb-2 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded text-[11px] text-amber-800 dark:text-amber-300 space-y-1">
                    <p className="font-semibold">💡 Aún no se han formulado acciones en el POA 2026.</p>
                  </div>
                )}

                <span className="text-[11px] text-slate-600 dark:text-slate-400 font-medium">O escribir código predefinido de la Acción POA:</span>
                <input
                  type="text"
                  required
                  placeholder="ej. ACC-2026-04-PRTSEN"
                  value={codigoAccionInput}
                  onChange={(e) => setCodigoAccionInput(e.target.value)}
                  className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-200 font-mono rounded-md p-2.5 focus:outline-none focus:ring-1 focus:ring-red-500 font-semibold"
                />
                <p className="text-[10px] text-slate-500 dark:text-slate-400 italic">
                  * Este enlace asignará formalmente el código SIPES (SIPES-{codigoAccionInput}) y actualizará la relación en InsForge.
                </p>
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowVincularModal(false)}
                  className="px-4 py-2 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isLinking}
                  className="px-4 py-2 rounded-md bg-corpo-blue hover:bg-corpo-dark text-white font-bold flex items-center gap-2"
                >
                  {isLinking && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>Guardar Vinculación</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Nuevo Proyecto PRTSEN */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-corpo-blue">
                <Database className="w-5 h-5" />
                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">Nuevo Proyecto PRTSEN (InsForge)</h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateProject} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-800 dark:text-slate-300 font-bold mb-1">Código RDS-PS *</label>
                <input
                  type="text"
                  required
                  placeholder="ej. =VE+DCA-PRT-822"
                  value={newCodigo}
                  onChange={(e) => setNewCodigo(e.target.value)}
                  className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-200 font-mono rounded-md p-2.5 focus:outline-none focus:ring-1 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block text-slate-800 dark:text-slate-300 font-bold mb-1">Nombre del Proyecto *</label>
                <input
                  type="text"
                  required
                  placeholder="ej. Rehabilitación Transformador 115/13.8kV"
                  value={newNombre}
                  onChange={(e) => setNewNombre(e.target.value)}
                  className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-200 rounded-md p-2.5 focus:outline-none focus:ring-1 focus:ring-red-500 font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-800 dark:text-slate-300 font-bold mb-1">Dimensión</label>
                  <select
                    value={newDimension}
                    onChange={(e: any) => setNewDimension(e.target.value)}
                    className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-200 rounded-md p-2.5 focus:outline-none focus:ring-1 focus:ring-red-500 font-semibold"
                  >
                    <option value="CIRCUITO">CIRCUITO</option>
                    <option value="SUBESTACION">SUBESTACION</option>
                    <option value="ESTADAL">ESTADAL</option>
                    <option value="PLANTA">PLANTA</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-800 dark:text-slate-300 font-bold mb-1">Monto Referencial (USD)</label>
                  <input
                    type="number"
                    value={newMontoUsd}
                    onChange={(e) => setNewMontoUsd(Number(e.target.value))}
                    className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-200 rounded-md p-2.5 focus:outline-none focus:ring-1 focus:ring-red-500 font-mono font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-800 dark:text-slate-300 font-bold mb-1">Estado</label>
                  <input
                    type="text"
                    value={newEstado}
                    onChange={(e) => setNewEstado(e.target.value)}
                    className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-200 rounded-md p-2.5 focus:outline-none font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-slate-800 dark:text-slate-300 font-bold mb-1">Región</label>
                  <input
                    type="text"
                    value={newRegion}
                    onChange={(e) => setNewRegion(e.target.value)}
                    className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-200 rounded-md p-2.5 focus:outline-none font-semibold"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-md bg-corpo-blue hover:bg-corpo-dark text-white font-bold flex items-center gap-2"
                >
                  {isSubmitting && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>Guardar en InsForge</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Ficha Técnica Oficial */}
      {showFichaModal && fichaProyecto && (
        <FichaTecnicaModal
          proyecto={fichaProyecto}
          onClose={() => {
            setShowFichaModal(false);
            setFichaProyecto(null);
          }}
          onUpdated={() => {
            loadData();
          }}
        />
      )}
    </div>
  );
}
