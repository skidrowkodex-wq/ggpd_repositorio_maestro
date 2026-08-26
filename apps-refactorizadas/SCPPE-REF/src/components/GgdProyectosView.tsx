import React, { useEffect, useState } from 'react';
import { ProyectoGGD, OrganizacionNodo } from '../types';
import { getProyectosGGD, createProyectoGGD, normalizarProyectoGGD, getEntesCofinanciadores, getGerencias } from '../services/supabaseService';
import { Building2, Plus, RefreshCw, CheckCircle2, ShieldAlert, Layers, ExternalLink } from 'lucide-react';

export function GgdProyectosView() {
  const [proyectos, setProyectos] = useState<ProyectoGGD[]>([]);
  const [entes, setEntes] = useState<OrganizacionNodo[]>([]);
  const [gerencias, setGerencias] = useState<OrganizacionNodo[]>([]);
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
    ente_cofinanciador_id: 'GOB_MIRANDA',
    ente_cofinanciador: 'GOBERNACION',
    ente_nombre: 'Gobernación del Estado Bolivariano de Miranda',
    gerencia_responsable_id: 'CORPOELEC_GGD',
    estado: 'MIRANDA',
    region: 'CAPITAL',
    monto_estimado_bs: 5000000,
    monto_estimado_usd: 85000,
    avance_fisico_pct: 30,
    responsable_ggd: 'Ing. Gerente Territorial GGD',
    observaciones: 'Convenio interinstitucional articulado bajo el Modelo Organizacional Recursivo.',
  });

  const loadData = async () => {
    setLoading(true);
    const [resProy, entesData, gerenciasData] = await Promise.all([
      getProyectosGGD(),
      getEntesCofinanciadores(),
      getGerencias(),
    ]);
    setProyectos(resProy.data);
    setIsFromSupabase(resProy.isFromSupabase);
    setEntes(entesData);
    setGerencias(gerenciasData);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleEnteSelectChange = (enteId: string) => {
    const selected = entes.find((e) => e.id === enteId);
    if (selected) {
      setFormData({
        ...formData,
        ente_cofinanciador_id: selected.id,
        ente_cofinanciador: selected.tipo_id,
        ente_nombre: selected.nombre_oficial,
        estado: selected.nombre_estado || formData.estado,
        region: selected.nombre_region || formData.region,
      });
    }
  };

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
      (p.ente_nombre && p.ente_nombre.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (p.ente_cofinanciador_nombre && p.ente_cofinanciador_nombre.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesEnte =
      enteFilter === 'TODOS' ||
      p.ente_cofinanciador === enteFilter ||
      p.ente_cofinanciador_id === enteFilter;
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
              {isFromSupabase ? 'En vivo InsForge PostgreSQL' : 'Vista Conectada (Modulo GGD)'}
            </span>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded border bg-purple-100 dark:bg-purple-950/80 text-purple-800 dark:text-purple-300 border-purple-300 dark:border-purple-800 flex items-center gap-1">
              <Layers className="w-3 h-3" />
              Árbol Organizacional core.dim_organizaciones
            </span>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Gestión descentralizada de convenios con Gobernaciones, Alcaldías y Entes vinculados al Modelo Organizacional Polimórfico.
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
          <h4 className="font-bold text-amber-950 dark:text-amber-300">Arquitectura Organizacional Recursiva (GGD vs POA Central)</h4>
          <p className="text-amber-900/90 dark:text-amber-200/90 leading-relaxed font-medium">
            Los proyectos convenidos con <strong>Gobernaciones, Alcaldías o Consejos Comunales</strong> se vinculan directamente a nodos formales de <code>core.dim_organizaciones</code>.
            Permite cuantificar la cofinanciación territorial sin distorsionar el presupuesto oficial del POA central de la GGPD.
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
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
            Entidades cofinanciadoras enlazadas al catálogo universal.
          </p>
        </div>

        <div className="p-4 industrial-card shadow-sm">
          <span className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Inversión Estimada (USD)</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 font-mono">
              ${totalMontoUsd.toLocaleString('es-VE')}
            </span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
            Equivalente en Bs: <span className="font-mono font-semibold">{totalMontoBs.toLocaleString('es-VE')} Bs.</span>
          </p>
        </div>

        <div className="p-4 industrial-card shadow-sm">
          <span className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">En Normalización POA</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-bold text-amber-600 dark:text-amber-400 font-mono">{pendientesNormalizar}</span>
            <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">En revisión técnica</span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
            Fase de transición hacia cartera oficial PRTSEN.
          </p>
        </div>
      </div>

      {/* Filtros y Buscador */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="w-full sm:w-80">
          <input
            type="text"
            placeholder="Buscar por código, nombre o ente..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-md px-3 py-1.5 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-red-500 font-medium"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-slate-700 dark:text-slate-300 font-bold shrink-0">Filtrar por Ente:</span>
          <select
            value={enteFilter}
            onChange={(e) => setEnteFilter(e.target.value)}
            className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-md px-2.5 py-1.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-red-500 font-medium"
          >
            <option value="TODOS">Todos los Entes y Gobernaciones</option>
            {entes.map((e) => (
              <option key={e.id} value={e.id}>
                {e.codigo_siglas} - {e.nombre_oficial}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Tabla de Proyectos GGD */}
      <div className="industrial-card overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
            <thead className="bg-slate-100 dark:bg-slate-950/80 text-slate-700 dark:text-slate-300 uppercase tracking-wider font-mono border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="p-3">Código Convenio</th>
                <th className="p-3">Proyecto / Alcance</th>
                <th className="p-3">Ente Cofinanciador (Árbol Org)</th>
                <th className="p-3">Ubicación</th>
                <th className="p-3 text-right">Inversión (USD)</th>
                <th className="p-3 text-center">Avance</th>
                <th className="p-3 text-center">Estatus</th>
                <th className="p-3 text-center">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {filteredProyectos.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/60 transition-colors">
                  <td className="p-3 font-mono font-bold text-slate-900 dark:text-slate-100 whitespace-nowrap">
                    {p.codigo_convenio}
                  </td>
                  <td className="p-3 max-w-xs">
                    <div className="font-semibold text-slate-900 dark:text-white line-clamp-1">{p.nombre}</div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Resp: {p.responsable_ggd}</div>
                  </td>
                  <td className="p-3">
                    <div className="flex flex-col gap-0.5">
                      <span className="font-bold text-slate-900 dark:text-slate-100">
                        {p.ente_cofinanciador_nombre || p.ente_nombre}
                      </span>
                      <span className="text-[10px] font-mono text-purple-700 dark:text-purple-400 font-semibold">
                        {p.ente_cofinanciador_siglas || p.ente_cofinanciador} • {p.ente_cofinanciador_tipo || 'COFINANCIADOR'}
                      </span>
                    </div>
                  </td>
                  <td className="p-3 whitespace-nowrap">
                    <div className="font-medium text-slate-800 dark:text-slate-200">{p.estado}</div>
                    <div className="text-[10px] text-slate-500 font-mono">{p.region}</div>
                  </td>
                  <td className="p-3 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                    ${p.monto_estimado_usd.toLocaleString('es-VE')}
                  </td>
                  <td className="p-3 text-center whitespace-nowrap">
                    <div className="flex items-center justify-center gap-1.5 font-mono font-bold">
                      <div className="w-12 bg-slate-200 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-corpo-blue h-1.5 rounded-full"
                          style={{ width: `${Math.min(100, p.avance_fisico_pct)}%` }}
                        />
                      </div>
                      <span>{p.avance_fisico_pct}%</span>
                    </div>
                  </td>
                  <td className="p-3 text-center whitespace-nowrap">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                        p.estatus_gestion === 'NORMALIZADO_POA_PRTSEN'
                          ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700'
                          : p.estatus_gestion === 'EN_REVISION_PLANIFICACION'
                          ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-700'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
                      }`}
                    >
                      {p.estatus_gestion === 'NORMALIZADO_POA_PRTSEN'
                        ? 'Normalizado POA'
                        : p.estatus_gestion === 'EN_REVISION_PLANIFICACION'
                        ? 'En Revisión Planif'
                        : 'Descentralizado GGD'}
                    </span>
                  </td>
                  <td className="p-3 text-center whitespace-nowrap">
                    {p.estatus_gestion === 'DESCENTRALIZADO_GGD' && (
                      <button
                        onClick={() => handleNormalizar(p.id)}
                        className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-corpo-blue dark:text-corpo-blue text-[11px] font-bold transition-colors"
                        title="Solicitar pase a cartera oficial de Gestión de Planificación"
                      >
                        Normalizar
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Registrar Convenio GGD */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl max-w-xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Building2 className="w-5 h-5 text-corpo-blue" />
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
                  <label className="text-slate-800 dark:text-slate-300 font-bold">Ente Cofinanciador (Árbol Organizacional)</label>
                  <select
                    value={formData.ente_cofinanciador_id}
                    onChange={(e) => handleEnteSelectChange(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded px-3 py-2 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-red-500 font-semibold"
                  >
                    {entes.map((e) => (
                      <option key={e.id} value={e.id}>
                        {e.codigo_siglas} - {e.nombre_oficial}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-800 dark:text-slate-300 font-bold">Nombre del Ente o Institución</label>
                <input
                  type="text"
                  required
                  value={formData.ente_nombre}
                  onChange={(e) => setFormData({ ...formData, ente_nombre: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded px-3 py-2 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-red-500 font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-800 dark:text-slate-300 font-bold">Gerencia Responsable</label>
                  <select
                    value={formData.gerencia_responsable_id}
                    onChange={(e) => setFormData({ ...formData, gerencia_responsable_id: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded px-3 py-2 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-red-500 font-semibold"
                  >
                    {gerencias.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.codigo_siglas} - {g.nombre_oficial}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-slate-800 dark:text-slate-300 font-bold">Responsable GGD / Inspector</label>
                  <input
                    type="text"
                    required
                    value={formData.responsable_ggd}
                    onChange={(e) => setFormData({ ...formData, responsable_ggd: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded px-3 py-2 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-red-500 font-semibold"
                  />
                </div>
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
