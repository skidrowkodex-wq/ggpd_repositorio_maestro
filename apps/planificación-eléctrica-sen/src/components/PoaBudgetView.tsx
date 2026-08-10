import React, { useEffect, useState } from 'react';
import { AccionPOA } from '../types';
import { getAccionesPOA, createAccionPOA } from '../services/supabaseService';
import { RefreshCw, Plus, FolderPlus, CheckCircle2 } from 'lucide-react';

export function PoaBudgetView() {
  const [acciones, setAcciones] = useState<AccionPOA[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFromSupabase, setIsFromSupabase] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form state for specialist data entry
  const [formData, setFormData] = useState({
    codigo: 'ACC-2026-01-PRUEBA',
    nombre: 'Mantenimiento y Adecuación de Subestaciones y Redes de Distribución',
    unidad_ejecutora: 'GERENCIA REGIONAL DE DISTRIBUCIÓN LOS ANDES',
    ponderacion: 25.0,
    presupuesto_asignado_bs: 10000000.0,
    presupuesto_ejecutado_bs: 0.0,
    meta_fisica_programada: 100,
    meta_fisica_ejecutada: 0,
    unidad_medida: 'Circuito Atendido',
  });

  const loadData = async () => {
    setLoading(true);
    const res = await getAccionesPOA();
    setAcciones(res.data);
    setIsFromSupabase(res.isFromSupabase);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const res = await createAccionPOA(formData);
    if (res.success) {
      setShowModal(false);
      loadData();
    }
    setSaving(false);
  };

  const totalAsignado = acciones.reduce((acc, curr) => acc + curr.presupuesto_asignado_bs, 0);
  const totalEjecutado = acciones.reduce((acc, curr) => acc + curr.presupuesto_ejecutado_bs, 0);
  const pctEjecucion = totalAsignado > 0 ? Math.round((totalEjecutado / totalAsignado) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              Planes Operativos Anuales (POA 2026) & Presupuesto
            </h2>
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
              isFromSupabase 
                ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800' 
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
            }`}>
              {isFromSupabase ? 'En vivo Supabase' : 'Vista Conectada (En Blanco)'}
            </span>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Seguimiento de Acciones Específicas, Partidas Presupuestarias y Cumplimiento de Metas Físicas.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowModal(true)}
            className="px-3.5 py-2 rounded-md bg-corpo-blue hover:bg-corpo-dark text-white text-xs font-bold flex items-center gap-2 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Cargar Nueva Acción POA</span>
          </button>

          <button
            onClick={loadData}
            disabled={loading}
            className="p-2 rounded-md bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold transition-colors flex items-center gap-2 shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Actualizar Supabase</span>
          </button>
        </div>
      </div>

      {/* Tarjetas Resumen */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 industrial-card space-y-1 shadow-sm">
          <span className="text-xs text-slate-600 dark:text-slate-400 uppercase font-bold">Presupuesto Asignado</span>
          <div className="text-xl font-bold font-mono text-slate-900 dark:text-white">
            Bs. {totalAsignado.toLocaleString('es-VE')}
          </div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">Partidas 402, 405 y Operativas</span>
        </div>

        <div className="p-4 industrial-card space-y-1 shadow-sm">
          <span className="text-xs text-slate-600 dark:text-slate-400 uppercase font-bold">Presupuesto Ejecutado</span>
          <div className="text-xl font-bold font-mono text-emerald-700 dark:text-emerald-400">
            Bs. {totalEjecutado.toLocaleString('es-VE')}
          </div>
          <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-bold">{pctEjecucion}% devengado</span>
        </div>

        <div className="p-4 industrial-card space-y-1 shadow-sm">
          <span className="text-xs text-slate-600 dark:text-slate-400 uppercase font-bold">Acciones Registradas</span>
          <div className="text-xl font-bold font-mono text-red-700 dark:text-corpo-blue">
            {acciones.length} Acciones
          </div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">Ponderación Validadas</span>
        </div>
      </div>

      {/* Acciones Específicas */}
      <div className="p-5 industrial-card space-y-4 shadow-sm">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Acciones Específicas del POA 2026</h3>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Módulo iniciado desde cero para pruebas
          </span>
        </div>

        {loading ? (
          <div className="p-8 text-center text-xs text-slate-600 dark:text-slate-400 flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-corpo-red dark:text-corpo-blue" />
            <span className="font-medium">Cargando acciones desde Supabase...</span>
          </div>
        ) : acciones.length === 0 ? (
          <div className="p-12 text-center rounded-md bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="w-12 h-12 rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center mx-auto text-red-700 dark:text-corpo-blue shadow-sm">
              <FolderPlus className="w-6 h-6" />
            </div>
            <div className="space-y-1 max-w-md mx-auto">
              <h4 className="text-sm font-bold text-slate-900 dark:text-slate-200">Módulo POA en Blanco</h4>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                No hay acciones registradas actualmente. El especialista puede empezar a cargar y probar sus propios datos proyectados para el POA 2026.
              </p>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="px-4 py-2 rounded-md bg-corpo-blue hover:bg-corpo-dark text-white text-xs font-bold inline-flex items-center gap-2 transition-colors mt-2 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Cargar Primera Acción POA</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
              <thead className="bg-slate-100 dark:bg-slate-950 text-slate-700 dark:text-slate-400 uppercase text-[10px] tracking-wider font-bold">
                <tr>
                  <th className="p-3">Código</th>
                  <th className="p-3">Nombre de la Acción Específica</th>
                  <th className="p-3">Unidad Ejecutora</th>
                  <th className="p-3">Ponderación</th>
                  <th className="p-3">Presupuesto Asignado vs Ejecutado</th>
                  <th className="p-3">Metas Físicas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {acciones.map((act) => {
                  const pctFisico = act.meta_fisica_programada > 0 ? Math.round((act.meta_fisica_ejecutada / act.meta_fisica_programada) * 100) : 0;
                  return (
                    <tr key={act.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="p-3 font-mono font-bold text-red-700 dark:text-indigo-300">{act.codigo}</td>
                      <td className="p-3 font-bold text-slate-900 dark:text-slate-100 max-w-xs">{act.nombre}</td>
                      <td className="p-3 text-slate-600 dark:text-slate-400 text-[11px] font-medium">{act.unidad_ejecutora}</td>
                      <td className="p-3 font-mono text-amber-800 dark:text-corpo-accent font-bold">{act.ponderacion}%</td>
                      <td className="p-3">
                        <div className="font-mono text-xs">
                          <span className="text-emerald-700 dark:text-emerald-400 font-bold">Bs. {act.presupuesto_ejecutado_bs.toLocaleString('es-VE')}</span>
                          <span className="text-slate-500 dark:text-slate-400 block text-[10px]">de Bs. {act.presupuesto_asignado_bs.toLocaleString('es-VE')}</span>
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-slate-900 dark:text-slate-200 font-bold">{act.meta_fisica_ejecutada} / {act.meta_fisica_programada}</span>
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-50 dark:bg-indigo-950 text-red-700 dark:text-indigo-300 border border-red-200 dark:border-indigo-800">
                            {act.unidad_medida}
                          </span>
                        </div>
                        <span className="text-[10px] text-emerald-700 dark:text-emerald-400 mt-0.5 block font-bold">{pctFisico}% cumplimiento</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal para Crear/Cargar Nueva Acción POA */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FolderPlus className="w-5 h-5 text-red-700 dark:text-corpo-blue" />
                <span>Cargar Acción Específica POA 2026</span>
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-white text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-800 dark:text-slate-300 font-bold">Código de Acción</label>
                  <input
                    type="text"
                    required
                    value={formData.codigo}
                    onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded px-3 py-2 text-slate-900 dark:text-slate-100 font-mono focus:outline-none focus:border-red-500 font-semibold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-800 dark:text-slate-300 font-bold">Ponderación (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={formData.ponderacion}
                    onChange={(e) => setFormData({ ...formData, ponderacion: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded px-3 py-2 text-slate-900 dark:text-slate-100 font-mono focus:outline-none focus:border-red-500 font-semibold"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-800 dark:text-slate-300 font-bold">Nombre de la Acción Específica</label>
                <input
                  type="text"
                  required
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded px-3 py-2 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-red-500 font-semibold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-800 dark:text-slate-300 font-bold">Unidad Ejecutora</label>
                <input
                  type="text"
                  required
                  value={formData.unidad_ejecutora}
                  onChange={(e) => setFormData({ ...formData, unidad_ejecutora: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded px-3 py-2 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-red-500 font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-800 dark:text-slate-300 font-bold">Presupuesto Asignado (Bs.)</label>
                  <input
                    type="number"
                    required
                    value={formData.presupuesto_asignado_bs}
                    onChange={(e) => setFormData({ ...formData, presupuesto_asignado_bs: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded px-3 py-2 text-slate-900 dark:text-slate-100 font-mono focus:outline-none focus:border-red-500 font-semibold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-800 dark:text-slate-300 font-bold">Presupuesto Ejecutado (Bs.)</label>
                  <input
                    type="number"
                    required
                    value={formData.presupuesto_ejecutado_bs}
                    onChange={(e) => setFormData({ ...formData, presupuesto_ejecutado_bs: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded px-3 py-2 text-slate-900 dark:text-slate-100 font-mono focus:outline-none focus:border-red-500 font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-800 dark:text-slate-300 font-bold">Meta Prog.</label>
                  <input
                    type="number"
                    required
                    value={formData.meta_fisica_programada}
                    onChange={(e) => setFormData({ ...formData, meta_fisica_programada: parseInt(e.target.value) || 0 })}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded px-3 py-2 text-slate-900 dark:text-slate-100 font-mono focus:outline-none focus:border-red-500 font-semibold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-800 dark:text-slate-300 font-bold">Meta Ejec.</label>
                  <input
                    type="number"
                    required
                    value={formData.meta_fisica_ejecutada}
                    onChange={(e) => setFormData({ ...formData, meta_fisica_ejecutada: parseInt(e.target.value) || 0 })}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded px-3 py-2 text-slate-900 dark:text-slate-100 font-mono focus:outline-none focus:border-red-500 font-semibold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-800 dark:text-slate-300 font-bold">Unid. Medida</label>
                  <input
                    type="text"
                    required
                    value={formData.unidad_medida}
                    onChange={(e) => setFormData({ ...formData, unidad_medida: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded px-3 py-2 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-red-500 font-semibold"
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
                  {saving ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  )}
                  <span>Guardar Acción</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

