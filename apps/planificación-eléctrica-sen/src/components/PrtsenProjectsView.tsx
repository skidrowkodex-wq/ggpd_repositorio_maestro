import React, { useEffect, useState } from 'react';
import { ProyectoPRTSEN, AccionPOA } from '../types';
import { getProyectosPRTSEN, createProyectoPRTSEN, getAccionesPOA, vincularProyectoPRTSEN } from '../services/supabaseService';
import { Search, Filter, CheckCircle2, AlertCircle, Plus, RefreshCw, Database, Link2, FolderCheck } from 'lucide-react';

export function PrtsenProjectsView() {
  const [proyectos, setProyectos] = useState<ProyectoPRTSEN[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFromSupabase, setIsFromSupabase] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [dimensionFilter, setDimensionFilter] = useState<string>('TODAS');
  
  // Modal Nuevo Proyecto State
  const [showModal, setShowModal] = useState(false);
  const [newCodigo, setNewCodigo] = useState('');
  const [newNombre, setNewNombre] = useState('');
  const [newDimension, setNewDimension] = useState<'SUBESTACION' | 'CIRCUITO' | 'ESTADAL' | 'PLANTA'>('SUBESTACION');
  const [newEstado, setNewEstado] = useState('TACHIRA');
  const [newRegion, setNewRegion] = useState('LOS ANDES');
  const [newMontoUsd, setNewMontoUsd] = useState<number>(450000);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Modal Vinculación POA State
  const [showVincularModal, setShowVincularModal] = useState(false);
  const [selectedProyecto, setSelectedProyecto] = useState<ProyectoPRTSEN | null>(null);
  const [codigoAccionInput, setCodigoAccionInput] = useState('ACC-2026-01-MANT');
  const [accionesPOA, setAccionesPOA] = useState<AccionPOA[]>([]);
  const [isLinking, setIsLinking] = useState(false);

  const loadData = async () => {
    setLoading(true);
    const res = await getProyectosPRTSEN();
    setProyectos(res.data);
    setIsFromSupabase(res.isFromSupabase);

    // Cargar acciones POA disponibles
    const resPOA = await getAccionesPOA();
    setAccionesPOA(resPOA.data);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenVincularModal = (proyecto: ProyectoPRTSEN) => {
    setSelectedProyecto(proyecto);
    setCodigoAccionInput(proyecto.accion_poa_codigo || 'ACC-2026-01-MANT');
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
      alert('Error al vincular con Supabase: ' + (res.error || 'Error desconocido'));
    }
    setIsLinking(false);
  };

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
      vinculado_poa: false,
      match_metodo: 'EXACTO',
    });

    if (result.success && result.data) {
      setProyectos((prev) => [result.data!, ...prev]);
      setShowModal(false);
      setNewCodigo('');
      setNewNombre('');
    } else {
      alert('Error al guardar en Supabase: ' + (result.error || 'Error desconocido'));
    }
    setIsSubmitting(false);
  };

  const filteredProjects = proyectos.filter((p) => {
    const matchesSearch =
      p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.codigo_rds.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.estado.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDimension = dimensionFilter === 'TODAS' || p.dimension === dimensionFilter;
    return matchesSearch && matchesDimension;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              Proyectos PRTSEN (Sector Eléctrico Nacional)
            </h2>
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
              isFromSupabase 
                ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800' 
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
            }`}>
              {isFromSupabase ? 'En vivo Supabase' : 'Vista Conectada'}
            </span>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Catálogo de proyectos clasificados por Dimensión con persistencia directa en Supabase.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadData}
            disabled={loading}
            className="p-2 rounded-md bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs transition-colors shadow-sm"
            title="Recargar datos de Supabase"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={() => setShowModal(true)}
            className="px-3.5 py-2 rounded-md bg-corpo-blue hover:bg-corpo-dark text-white text-xs font-bold flex items-center gap-2 shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Nuevo Proyecto PRTSEN</span>
          </button>
        </div>
      </div>

      {/* Controles de Búsqueda y Filtro */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por código RDS-PS, nombre de proyecto o estado..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-200 text-xs rounded-md pl-9 pr-4 py-2 focus:outline-none focus:ring-1 focus:ring-red-500 dark:focus:ring-indigo-500 shadow-sm font-medium"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-500 dark:text-slate-400 shrink-0" />
          <select
            value={dimensionFilter}
            onChange={(e) => setDimensionFilter(e.target.value)}
            className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-200 text-xs rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-red-500 dark:focus:ring-indigo-500 shadow-sm font-medium"
          >
            <option value="TODAS">Todas las Dimensiones</option>
            <option value="SUBESTACION">Dimensión Subestación</option>
            <option value="CIRCUITO">Dimensión Circuito</option>
            <option value="ESTADAL">Dimensión Estadal</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center rounded-xl bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 space-y-3 shadow-sm">
          <RefreshCw className="w-6 h-6 text-corpo-red dark:text-corpo-blue animate-spin mx-auto" />
          <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">Cargando proyectos desde Supabase...</p>
        </div>
      ) : (
        /* Lista de Proyectos */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredProjects.map((proyecto: ProyectoPRTSEN) => (
            <div
              key={proyecto.id}
              className="p-5 industrial-card hover:border-slate-300 dark:hover:border-slate-700 transition-all space-y-3 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <span className="inline-block font-mono text-xs font-bold text-red-700 dark:text-corpo-blue bg-red-50 dark:bg-indigo-950/60 border border-red-200 dark:border-indigo-800/60 px-2 py-0.5 rounded">
                    {proyecto.codigo_rds}
                  </span>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 leading-snug">
                    {proyecto.nombre}
                  </h3>
                </div>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase shrink-0 ${
                    proyecto.dimension === 'SUBESTACION'
                      ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-corpo-accent border border-amber-300 dark:border-amber-800'
                      : proyecto.dimension === 'CIRCUITO'
                      ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800'
                      : 'bg-indigo-100 dark:bg-indigo-950/80 text-indigo-800 dark:text-corpo-blue border border-indigo-300 dark:border-indigo-800'
                  }`}
                >
                  {proyecto.dimension}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 dark:text-slate-400 py-2 border-y border-slate-200 dark:border-slate-800">
                <div>
                  <span className="block text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold">Estado / Región</span>
                  <span className="text-slate-900 dark:text-slate-200 font-semibold">{proyecto.estado} ({proyecto.region})</span>
                </div>
                <div>
                  <span className="block text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold">Presupuesto Referencial</span>
                  <span className="text-slate-900 dark:text-slate-200 font-mono font-bold">${proyecto.monto_usd.toLocaleString()} USD</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-slate-700 dark:text-slate-300 font-semibold">
                  <span>Avance Físico ({proyecto.avance_fisico_pct}%)</span>
                  <span>Avance Financiero ({proyecto.avance_financiero_pct}%)</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-200 dark:border-slate-800">
                  <div
                    className="bg-corpo-red dark:bg-indigo-500 h-full rounded-full"
                    style={{ width: `${proyecto.avance_fisico_pct}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-1 text-xs">
                <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                  {proyecto.vinculado_poa ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  ) : (
                    <AlertCircle className="w-3.5 h-3.5 text-corpo-accent dark:text-corpo-accent" />
                  )}
                  <div className="flex flex-col">
                    <span className="text-[11px] font-bold text-slate-900 dark:text-slate-200">
                      {proyecto.vinculado_poa ? 'Vinculado a POA 2026' : 'Pendiente Vinculación POA'}
                    </span>
                    {proyecto.accion_poa_codigo && (
                      <span className="text-[10px] text-red-700 dark:text-corpo-blue font-mono font-bold">
                        Acción: {proyecto.accion_poa_codigo}
                      </span>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => handleOpenVincularModal(proyecto)}
                  className="px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-red-700 dark:text-indigo-300 text-[11px] font-bold flex items-center gap-1.5 transition-colors border border-slate-300 dark:border-slate-700 shadow-sm"
                  title="Asignar o cambiar Vinculación a Acción Específica POA"
                >
                  <Link2 className="w-3 h-3" />
                  <span>{proyecto.vinculado_poa ? 'Re-vincular POA' : 'Vincular a Acción POA'}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Vinculación a Acción POA */}
      {showVincularModal && selectedProyecto && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-red-700 dark:text-corpo-blue">
                <FolderCheck className="w-5 h-5" />
                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">Vincular Proyecto PRTSEN a Acción POA</h3>
              </div>
              <button
                onClick={() => setShowVincularModal(false)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-md space-y-1">
              <span className="text-[10px] font-mono font-bold text-red-700 dark:text-corpo-blue">{selectedProyecto.codigo_rds}</span>
              <p className="text-xs font-bold text-slate-900 dark:text-slate-200">{selectedProyecto.nombre}</p>
              <p className="text-[11px] text-slate-600 dark:text-slate-400">{selectedProyecto.estado} — {selectedProyecto.dimension}</p>
            </div>

            <form onSubmit={handleConfirmVincular} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="block text-slate-800 dark:text-slate-300 font-bold">
                  Seleccionar o Ingresar Código de Acción Específica POA 2026:
                </label>

                {accionesPOA.length > 0 && (
                  <div className="space-y-1 mb-2">
                    <span className="text-[11px] text-slate-600 dark:text-slate-400 font-medium">Acciones POA Cargas en Sistema:</span>
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
                )}

                <span className="text-[11px] text-slate-600 dark:text-slate-400 font-medium">O escribir código predefinido de la Acción POA:</span>
                <input
                  type="text"
                  required
                  placeholder="ej. ACC-2026-01-MANT"
                  value={codigoAccionInput}
                  onChange={(e) => setCodigoAccionInput(e.target.value)}
                  className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-200 font-mono rounded-md p-2.5 focus:outline-none focus:ring-1 focus:ring-red-500 font-semibold"
                />
                <p className="text-[10px] text-slate-500 dark:text-slate-400 italic">
                  * Este enlace asignará formalmente el código SIPES (SIPES-{codigoAccionInput}) y actualizará la relación en Supabase (`samc_proyecto_especial` / `samc_proyecto_vinculacion_poa`).
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
              <div className="flex items-center gap-2 text-red-700 dark:text-corpo-blue">
                <Database className="w-5 h-5" />
                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">Nuevo Proyecto PRTSEN (Supabase)</h3>
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
                  placeholder="ej. =VE+TACHIRA-LA PEDRERA:PRT-099"
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
                    <option value="SUBESTACION">SUBESTACION</option>
                    <option value="CIRCUITO">CIRCUITO</option>
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
                  <span>Guardar en Supabase</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
