import React, { useState } from 'react';
import { sigaSenService } from '../services/sigaSenService';
import { SubestacionSigaSen } from '../types/sigaSen';
import { Layers, Search, Filter, Zap, Activity, ShieldCheck, ChevronRight, GitBranch } from 'lucide-react';

export const NodosPatiosSenView: React.FC<{ onVerUnifilar?: (codigo: string) => void }> = ({ onVerUnifilar }) => {
  const [filtroTipo, setFiltroTipo] = useState<string>('TODOS');
  const [filtroCuadrante, setFiltroCuadrante] = useState<string>('TODOS');
  const [filtroTension, setFiltroTension] = useState<string>('TODOS');
  const [busqueda, setBusqueda] = useState('');
  const [seSeleccionada, setSeSeleccionada] = useState<SubestacionSigaSen | null>(null);

  const cuadrantes = sigaSenService.getCuadrantes();
  const niveles = sigaSenService.getNivelesTension();
  const nodos = sigaSenService.getSubestaciones(filtroTipo, filtroCuadrante, filtroTension, busqueda);

  // Seleccionar la primera por defecto si no hay seleccionada
  const actualSe = seSeleccionada || nodos[0] || null;

  return (
    <div className="space-y-6">
      {/* Controles y Filtros */}
      <div className="bg-white dark:bg-slate-900/90 border border-slate-300/90 dark:border-slate-800 rounded-2xl p-6 shadow-sm dark:shadow-xl space-y-4 transition-colors">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white">Catálogo Maestro de Nodos y Patios del SEN</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              562 Instalaciones consolidadas por nivel de tensión y equipamiento de patio (CND Mayo 2025).
            </p>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono uppercase block">Resultados Activos</span>
            <span className="text-xl font-black text-amber-600 dark:text-amber-400 font-mono">{nodos.length} Nodos</span>
          </div>
        </div>

        {/* Barra de Filtros */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
          <div>
            <label className="text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase block mb-1">Buscar por Nombre o Código</label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Ej. LA ARENOSA, GURI..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase block mb-1">Clasificación del Nodo</label>
            <select
              value={filtroTipo}
              onChange={(e) => setFiltroTipo(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
            >
              <option value="TODOS">Todas las Instalaciones</option>
              <option value="SUBESTACION_TRANSMISION">Subestaciones de Transmisión</option>
              <option value="CENTRAL_GENERACION">Centrales de Generación</option>
              <option value="INTERCONEXION_INTERNACIONAL">Interconexiones Internacionales</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase block mb-1">Región / Cuadrante</label>
            <select
              value={filtroCuadrante}
              onChange={(e) => setFiltroCuadrante(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
            >
              <option value="TODOS">Todas las Regiones</option>
              {cuadrantes.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase block mb-1">Nivel de Tensión de Barra</label>
            <select
              value={filtroTension}
              onChange={(e) => setFiltroTension(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
            >
              <option value="TODOS">Todos los Niveles</option>
              {niveles.map((n) => (
                <option key={n.codigo_tension} value={n.tension_kv.toString()}>{n.tension_kv} kV ({n.nombre_sistema})</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Panel Dual: Lista de Nodos a la Izquierda, Detalle de Patios a la Derecha */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Panel Izquierdo: Lista de Nodos encapsulada en contenedor */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900/90 border border-slate-300/90 dark:border-slate-800 rounded-2xl p-4 shadow-sm dark:shadow-xl flex flex-col transition-colors">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 font-mono">
                Listado de Instalaciones
              </span>
            </div>
            <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold border border-slate-200 dark:border-slate-700">
              {nodos.length} Nodos
            </span>
          </div>

          <div className="space-y-2 overflow-y-auto thin-scroll pr-1 flex-1 max-h-[420px] lg:max-h-[640px]">
            {nodos.map((s, idx) => {
              const isSelected = actualSe?.codigo === s.codigo;
              return (
                <div
                  key={`${s.codigo}-${idx}`}
                  onClick={() => setSeSeleccionada(s)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                    isSelected
                      ? 'bg-amber-50/80 dark:bg-amber-500/10 border-amber-500 shadow-sm ring-1 ring-amber-500/30'
                      : 'bg-slate-50/70 dark:bg-slate-950/60 border-slate-200/90 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${isSelected ? 'bg-amber-500' : 'bg-slate-400 dark:bg-slate-600'}`} />
                      <span className="text-xs font-black text-slate-900 dark:text-white">{s.nombre_norm}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-slate-500 dark:text-slate-400 font-mono mt-1">
                      <span>{s.cuadrante}</span>
                      <span>·</span>
                      <span className="text-sky-600 dark:text-sky-400 font-semibold">{s.tensiones_lista}</span>
                    </div>
                  </div>

                  <div className="text-right flex items-center gap-2">
                    <div>
                      {s.capacidad_mw > 0 && (
                        <span className="text-xs font-bold text-amber-600 dark:text-amber-400 font-mono block">
                          {s.capacidad_mw} MW
                        </span>
                      )}
                      {s.capacidad_mva > 0 && (
                        <span className="text-[11px] font-bold text-sky-600 dark:text-sky-400 font-mono block">
                          {s.capacidad_mva} MVA
                        </span>
                      )}
                    </div>
                    <ChevronRight className={`w-4 h-4 ${isSelected ? 'text-amber-500' : 'text-slate-400 dark:text-slate-600'}`} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Detalle Técnico del Nodo Seleccionado */}
        <div className="lg:col-span-7">
          {actualSe ? (
            <div className="bg-white dark:bg-slate-900/90 border border-slate-300/90 dark:border-slate-800 rounded-2xl p-6 shadow-sm dark:shadow-xl space-y-6 transition-colors">
              {/* Header de la Subestación */}
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/40">
                      {actualSe.clasificacion}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">{actualSe.codigo}</span>
                  </div>
                  <h2 className="text-2xl font-black text-slate-900 dark:text-white mt-1">{actualSe.nombre_norm}</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Región CND: <strong className="text-slate-700 dark:text-slate-300">{actualSe.cuadrante}</strong> · Coordenadas Mural: ({actualSe.coord_x}, {actualSe.coord_y})
                  </p>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <div className="text-right">
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono uppercase block">Patios Operativos</span>
                    <span className="text-sm font-bold text-sky-600 dark:text-sky-400 font-mono">{actualSe.tensiones_lista}</span>
                  </div>
                  {onVerUnifilar && (
                    <button
                      onClick={() => onVerUnifilar(actualSe.codigo)}
                      className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-700 hover:from-cyan-500 hover:to-blue-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-cyan-600/20 transition-all cursor-pointer"
                    >
                      <GitBranch className="w-3.5 h-3.5" />
                      Ver Diagrama Unifilar
                    </button>
                  )}
                </div>
              </div>

              {/* Métricas de Potencia */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50/90 dark:bg-slate-950 p-4 rounded-xl border border-slate-200/90 dark:border-slate-800 text-center shadow-xs">
                <div>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-semibold">Capacidad Generación</span>
                  <span className="text-base font-black text-amber-600 dark:text-amber-400 font-mono">
                    {actualSe.capacidad_mw > 0 ? `${actualSe.capacidad_mw} MW` : 'N/A'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-semibold">Transformación AT</span>
                  <span className="text-base font-black text-sky-600 dark:text-sky-400 font-mono">
                    {actualSe.capacidad_mva > 0 ? `${actualSe.capacidad_mva} MVA` : 'N/A'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-semibold">Compensación Reactiva</span>
                  <span className="text-base font-black text-emerald-600 dark:text-emerald-400 font-mono">
                    {actualSe.capacidad_mvar > 0 ? `${actualSe.capacidad_mvar} MVAr` : 'N/A'}
                  </span>
                </div>
              </div>

              {/* Barras de Patio */}
              <div>
                <h3 className="text-xs font-mono font-bold text-slate-800 dark:text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                  Barras de Patio ({actualSe.barras.length} Tramos en Plano)
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {actualSe.barras.map((b) => (
                    <div
                      key={b.id}
                      className="bg-slate-50/80 dark:bg-slate-950 border border-slate-200/90 dark:border-slate-800/80 p-3 rounded-xl flex items-center justify-between text-xs shadow-xs"
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className="w-3 h-3 rounded-full inline-block shrink-0"
                          style={{ backgroundColor: b.color_hex }}
                        />
                        <span className="font-mono font-bold text-slate-900 dark:text-white">{b.tension_kv} kV</span>
                        <span className="text-[10px] text-slate-500 font-mono">({b.orientacion === 'H' ? 'Horiz' : 'Vert'})</span>
                      </div>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono font-semibold">Long: {b.longitud} pt</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Transformadores y Reactores */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Transformadores */}
                <div>
                  <h3 className="text-xs font-mono font-bold text-slate-800 dark:text-slate-300 uppercase tracking-wider mb-2">
                    ⚡ Bancos Transformación ({actualSe.transformadores.length})
                  </h3>
                  {actualSe.transformadores.length > 0 ? (
                    <div className="space-y-1.5">
                      {actualSe.transformadores.map((t) => (
                        <div key={t.id} className="bg-slate-50/80 dark:bg-slate-950 p-2.5 rounded-xl border border-slate-200/90 dark:border-slate-800 text-xs flex justify-between font-mono shadow-xs">
                          <span className="text-slate-900 dark:text-white font-medium">{t.raw}</span>
                          <span className="text-sky-600 dark:text-sky-400 font-bold">{t.total_mva} MVA</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-xs text-slate-500 italic bg-slate-50/80 dark:bg-slate-950/40 p-2.5 rounded-xl border border-slate-200/90 dark:border-transparent">
                      Sin bancos de transformación en este patio.
                    </div>
                  )}
                </div>

                {/* Reactores / Capacitores */}
                <div>
                  <h3 className="text-xs font-mono font-bold text-slate-800 dark:text-slate-300 uppercase tracking-wider mb-2">
                    🌀 Compensación Reactiva ({actualSe.reactivos.length})
                  </h3>
                  {actualSe.reactivos.length > 0 ? (
                    <div className="space-y-1.5">
                      {actualSe.reactivos.map((r) => (
                        <div key={r.id} className="bg-slate-50/80 dark:bg-slate-950 p-2.5 rounded-xl border border-slate-200/90 dark:border-slate-800 text-xs flex justify-between font-mono shadow-xs">
                          <span className="text-slate-900 dark:text-white font-medium">{r.raw}</span>
                          <span className="text-emerald-600 dark:text-emerald-400 font-bold">{r.total_mvar} MVAr</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-xs text-slate-500 italic bg-slate-50/80 dark:bg-slate-950/40 p-2.5 rounded-xl border border-slate-200/90 dark:border-transparent">
                      Sin reactivos instalados.
                    </div>
                  )}
                </div>
              </div>

              {/* Generación si aplica */}
              {actualSe.generacion.length > 0 && (
                <div>
                  <h3 className="text-xs font-mono font-bold text-slate-800 dark:text-slate-300 uppercase tracking-wider mb-2">
                    🏭 Unidades de Generación ({actualSe.generacion.length})
                  </h3>
                  <div className="space-y-2">
                    {actualSe.generacion.map((g) => (
                      <div key={g.id} className="bg-slate-50/80 dark:bg-slate-950 p-3 rounded-xl border border-slate-200/90 dark:border-slate-800 text-xs flex justify-between items-center font-mono shadow-xs">
                        <div>
                          <span className="text-slate-900 dark:text-white font-bold block">{g.raw}</span>
                          <span className="text-[10px] text-slate-500 font-semibold">{g.fuente}</span>
                        </div>
                        <span className="text-amber-600 dark:text-amber-400 font-bold text-sm">{g.total_mw} MW</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center text-slate-500 dark:text-slate-400 shadow-sm">
              Seleccione una subestación de la lista para inspeccionar sus activos de patio.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
