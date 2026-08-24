import React, { useEffect, useState } from 'react';
import { ProyectoGGD } from '../types';
import { getProyectosGGD, createProyectoGGD, normalizarProyectoGGD } from '../services/supabaseService';
import { Building2, Plus, RefreshCw, AlertCircle, ArrowUpRight, CheckCircle2, ShieldAlert } from 'lucide-react';

export function GgdProyectosView() {
  const [proyectos, setProyectos] = useState<ProyectoGGD[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFromSupabase, setIsFromSupabase] = useState(false);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [enteFilter, setEnteFilter] = useState<string>('TODOS');

  // Modal registrar
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    codigo_convenio: 'CONV-GGD-2026-LOCAL-01',
    nombre: 'Adecuación de Redes Locales en Convenio con Alcaldía',
    ente_cofinanciador: 'ALCALDIA' as const,
    ente_nombre: 'Alcaldía Local',
    estado: 'TACHIRA',
    region: 'LOS ANDES',
    monto_estimado_bs: 5000000,
    monto_estimado_usd: 85000,
    avance_fisico_pct: 30,
    responsable_ggd: 'Ing. Gerente Territorial GGD',
    observaciones: 'Convenio municipal reportado directamente a Gerencia General de Distribución.',
  });

  const loadData = async () => {
    setLoading(true);
    const res = await getProyectosGGD();
    setProyectos(res.data);
    setIsFromSupabase(res.isFromSupabase);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const res = await createProyectoGGD(formData);
    if (res.success) {
      setShowModal(false);
      loadData();
    }
    setSaving(false);
  };

  const handleNormalizar = async (id: string) => {
    if (!confirm('¿Desea solicitar la migración y normalización de este proyecto hacia la Cartera Oficial POA / PRTSEN de Gestión de Planificación?')) {
      return;
    }
    await normalizarProyectoGGD(id, 'EN_REVISION_PLANIFICACION');
    loadData();
  };

  const filteredProyectos = proyectos.filter((p) => {
    const matchesSearch =
      p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.codigo_convenio.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.ente_nombre.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesEnte = enteFilter === 'TODOS' || p.ente_cofinanciador === enteFilter;
    return matchesSearch && matchesEnte;
  });

  const totalMontoUsd = proyectos.reduce((acc, p) => acc + p.monto_estimado_usd, 0);
  const totalMontoBs = proyectos.reduce((acc, p) => acc + p.monto_estimado_bs, 0);
  const pendientesNormalizar = proyectos.filter((p) => p.estatus_gestion === 'EN_REVISION_PLANIFICACION').length;

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
              Proyectos Territoriales Directos GGD
            </h1>
            <span
              className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                isFromSupabase
                  ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
              }`}
            >
              {isFromSupabase ? 'En vivo Supabase' : 'Vista Conectada (Modulo GGD)'}
            </span>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Gestión descentralizada de convenios locales, gobernaciones, alcaldías y recursos propios administrados a nivel de Gerencia General de Distribución.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowModal(true)}
            className="px-3.5 py-2 rounded-md bg-corpo-blue hover:bg-corpo-dark text-white text-xs font-bold flex items-center gap-2 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Registrar Convenio GGD</span>
          </button>

          <button
            onClick={loadData}
            disabled={loading}
            className="p-2 rounded-md bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold transition-colors flex items-center gap-2 shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Actualizar</span>
          </button>
        </div>
      </div>

      {/* Banner de Contexto de Negocio */}
      <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-amber-900 dark:text-amber-200 text-xs flex items-start gap-3 shadow-sm">
        <ShieldAlert className="w-5 h-5 text-corpo-accent dark:text-corpo-accent shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h4 className="font-bold text-amber-950 dark:text-amber-300">Aislamiento de Regla de Negocio (GGD vs POA Central)</h4>
          <p className="text-amber-900/90 dark:text-amber-200/90 leading-relaxed font-medium">
            Estos proyectos son ejecutados directamente por los estados y convenios municipales bajo supervisión de la Gerencia General de Distribución. 
            <strong> No alteran ni distorsionan</strong> el presupuesto oficial ni las metas físicas del POA de Gestión de Planificación. 
            Poseen un flujo especial para solicitar su regularización e integración paulatina a la cartera formal de PRTSEN / POA.
          </p>
        </div>
      </div>

      {/* Tarjetas Resumen */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 industrial-card shadow-sm">
          <span className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Convenios Registrados</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-bold text-slate-900 dark:text-white font-mono">{proyectos.length}</span>
            <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">Proyectos GGD</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Recursos Propios y Entes Territoriales</p>
        </div>

        <div className="p-4 industrial-card shadow-sm">
          <span className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Monto Total Estimado</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-bold text-emerald-700 dark:text-emerald-400 font-mono">${totalMontoUsd.toLocaleString()} USD</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Equivalente a Bs. {totalMontoBs.toLocaleString()}</p>
        </div>

        <div className="p-4 industrial-card shadow-sm">
          <span className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">En Migración a Planificación</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-bold text-red-700 dark:text-corpo-blue font-mono">{pendientesNormalizar}</span>
            <span className="text-xs text-red-800 dark:text-indigo-300 font-medium">Solicitudes</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Proyectos en vías de pasar a POA/PRTSEN</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Buscar por código convenio, nombre o ente..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-md pl-9 pr-4 py-2 text-xs text-slate-900 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-red-500 font-medium shadow-sm"
          />
          <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </div>

        <select
          value={enteFilter}
          onChange={(e) => setEnteFilter(e.target.value)}
          className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-md px-3 py-2 text-xs text-slate-900 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-red-500 font-mono font-medium shadow-sm"
        >
          <option value="TODOS">Todos los Entes Cofinanciadores</option>
          <option value="ALCALDIA">Alcaldías Municipal</option>
          <option value="GOBERNACION">Gobernaciones de Estado</option>
          <option value="RECURSOS_PROPIOS">Recursos Propios GGD</option>
          <option value="CONVENIO_LOCAL">Convenios Locales</option>
        </select>
      </div>

      {/* Lista / Tarjetas de Proyectos GGD */}
      <div className="space-y-4">
        {loading ? (
          <div className="p-8 text-center text-xs text-slate-600 dark:text-slate-400 flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-corpo-red dark:text-corpo-blue" />
            <span className="font-medium">Cargando proyectos territoriales GGD...</span>
          </div>
        ) : filteredProyectos.length === 0 ? (
          <div className="p-8 text-center industrial-card text-xs text-slate-600 dark:text-slate-400 font-medium shadow-sm">
            No se encontraron convenios directos GGD con los criterios seleccionados.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredProyectos.map((p) => (
              <div
                key={p.id}
                className="p-5 industrial-card space-y-3 hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between shadow-sm"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-red-700 dark:text-corpo-blue font-bold bg-red-50 dark:bg-indigo-950/80 px-2 py-0.5 rounded border border-red-200 dark:border-indigo-800/60">
                      {p.codigo_convenio}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        p.estatus_gestion === 'NORMALIZADO_POA_PRTSEN'
                          ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800'
                          : p.estatus_gestion === 'EN_REVISION_PLANIFICACION'
                          ? 'bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-800'
                          : 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-corpo-accent border border-amber-300 dark:border-amber-800'
                      }`}
                    >
                      {p.estatus_gestion === 'NORMALIZADO_POA_PRTSEN'
                        ? 'NORMALIZADO PLANIFICACION'
                        : p.estatus_gestion === 'EN_REVISION_PLANIFICACION'
                        ? 'EN REVISION PLANIFICACION'
                        : 'DESCENTRALIZADO GGD'}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">{p.nombre}</h3>

                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 dark:text-slate-300">
                    <div>
                      <span className="text-slate-500 dark:text-slate-400 block text-[10px] uppercase font-bold">Ente Financiamiento</span>
                      <span className="font-bold text-slate-900 dark:text-slate-200">{p.ente_nombre}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 dark:text-slate-400 block text-[10px] uppercase font-bold">Ubicación</span>
                      <span className="text-slate-900 dark:text-slate-200 font-semibold">{p.estado} — {p.region}</span>
                    </div>
                  </div>

                  <div className="p-2.5 rounded bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-slate-500 dark:text-slate-400 text-[10px] block font-bold">Monto Presupuestado</span>
                      <span className="font-mono text-emerald-700 dark:text-emerald-400 font-bold">${p.monto_estimado_usd.toLocaleString()} USD</span>
                    </div>
                    <div>
                      <span className="text-slate-500 dark:text-slate-400 text-[10px] block font-bold">Avance Físico</span>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-corpo-red dark:bg-indigo-500 rounded-full"
                            style={{ width: `${p.avance_fisico_pct}%` }}
                          />
                        </div>
                        <span className="font-mono text-red-700 dark:text-indigo-300 font-bold text-[11px]">{p.avance_fisico_pct}%</span>
                      </div>
                    </div>
                  </div>

                  {p.observaciones && (
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 italic font-medium">"{p.observaciones}"</p>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-[10px] text-slate-600 dark:text-slate-400 font-medium truncate max-w-[200px]">
                    Resp: {p.responsable_ggd}
                  </span>

                  {p.estatus_gestion === 'DESCENTRALIZADO_GGD' && (
                    <button
                      onClick={() => handleNormalizar(p.id)}
                      className="px-2.5 py-1 rounded bg-corpo-blue hover:bg-corpo-dark text-white text-[11px] font-bold flex items-center gap-1 transition-colors shadow-sm"
                    >
                      <span>Migrar a Planificación</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  )}

                  {p.estatus_gestion === 'EN_REVISION_PLANIFICACION' && (
                    <span className="text-[11px] text-red-700 dark:text-corpo-blue font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>En Evaluación POA</span>
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Registrar Convenio GGD */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Building2 className="w-5 h-5 text-red-700 dark:text-corpo-blue" />
                <span>Registrar Convenio / Proyecto Directo GGD</span>
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-700 dark:hover:text-white text-xs font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-800 dark:text-slate-300 font-bold">Código Convenio</label>
                  <input
                    type="text"
                    required
                    value={formData.codigo_convenio}
                    onChange={(e) => setFormData({ ...formData, codigo_convenio: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded px-3 py-2 text-slate-900 dark:text-slate-100 font-mono focus:outline-none focus:border-red-500 font-semibold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-800 dark:text-slate-300 font-bold">Tipo Ente Cofinanciador</label>
                  <select
                    value={formData.ente_cofinanciador}
                    onChange={(e) => setFormData({ ...formData, ente_cofinanciador: e.target.value as any })}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded px-3 py-2 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-red-500 font-semibold"
                  >
                    <option value="ALCALDIA">Alcaldía Municipal</option>
                    <option value="GOBERNACION">Gobernación del Estado</option>
                    <option value="RECURSOS_PROPIOS">Recursos Propios GGD</option>
                    <option value="CONVENIO_LOCAL">Convenio Local Especial</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-800 dark:text-slate-300 font-bold">Nombre del Ente o Institución</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Alcaldía del Municipio San Cristóbal"
                  value={formData.ente_nombre}
                  onChange={(e) => setFormData({ ...formData, ente_nombre: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded px-3 py-2 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-red-500 font-semibold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-800 dark:text-slate-300 font-bold">Nombre del Proyecto</label>
                <input
                  type="text"
                  required
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded px-3 py-2 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-red-500 font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-800 dark:text-slate-300 font-bold">Estado</label>
                  <input
                    type="text"
                    required
                    value={formData.estado}
                    onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded px-3 py-2 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-red-500 font-semibold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-800 dark:text-slate-300 font-bold">Región</label>
                  <input
                    type="text"
                    required
                    value={formData.region}
                    onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded px-3 py-2 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-red-500 font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-800 dark:text-slate-300 font-bold">Monto Estimado (USD)</label>
                  <input
                    type="number"
                    required
                    value={formData.monto_estimado_usd}
                    onChange={(e) => setFormData({ ...formData, monto_estimado_usd: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded px-3 py-2 text-slate-900 dark:text-slate-100 font-mono focus:outline-none focus:border-red-500 font-bold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-800 dark:text-slate-300 font-bold">Avance Físico (%)</label>
                  <input
                    type="number"
                    required
                    value={formData.avance_fisico_pct}
                    onChange={(e) => setFormData({ ...formData, avance_fisico_pct: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded px-3 py-2 text-slate-900 dark:text-slate-100 font-mono focus:outline-none focus:border-red-500 font-bold"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-800 dark:text-slate-300 font-bold">Responsable GGD</label>
                <input
                  type="text"
                  required
                  value={formData.responsable_ggd}
                  onChange={(e) => setFormData({ ...formData, responsable_ggd: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded px-3 py-2 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-red-500 font-semibold"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-3.5 py-2 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 rounded bg-corpo-blue hover:bg-corpo-dark text-white font-bold flex items-center gap-2"
                >
                  {saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                  <span>Guardar Proyecto GGD</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
