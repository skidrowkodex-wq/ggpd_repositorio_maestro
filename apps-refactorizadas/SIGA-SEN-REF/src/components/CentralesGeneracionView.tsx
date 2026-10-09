import React, { useState } from 'react';
import { sigaSenService } from '../services/sigaSenService';
import { SubestacionSigaSen } from '../types/sigaSen';
import { Zap, Flame, Droplets, Gauge, Search, SlidersHorizontal, ShieldCheck } from 'lucide-react';

export const CentralesGeneracionView: React.FC = () => {
  const [filtroFuente, setFiltroFuente] = useState<'TODAS' | 'HIDRO' | 'TERMO'>('TODAS');
  const [busqueda, setBusqueda] = useState('');

  const todasPlantas = sigaSenService.getSubestaciones('CENTRAL_GENERACION');

  const plantasFiltradas = todasPlantas.filter((p) => {
    const isHidro = p.generacion.some((g) => g.fuente === 'HIDROELECTRICA') || 
      ['GURI', 'MACAGUA', 'CARUACHI', 'PAEZ', 'CURUPAO'].some(h => p.nombre_norm.includes(h));
    
    if (filtroFuente === 'HIDRO' && !isHidro) return false;
    if (filtroFuente === 'TERMO' && isHidro) return false;

    if (busqueda.trim()) {
      const q = busqueda.trim().toUpperCase();
      const match = p.nombre_norm.toUpperCase().includes(q) || 
        p.cuadrante.toUpperCase().includes(q) ||
        p.tensiones_lista.toUpperCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  const totalMwFiltrado = plantasFiltradas.reduce((acc, p) => acc + p.capacidad_mw, 0);

  return (
    <div className="space-y-6">
      {/* Cabecera y KPIs */}
      <div className="bg-white dark:bg-slate-900/90 border border-slate-300/90 dark:border-amber-950/60 rounded-2xl p-6 shadow-sm dark:shadow-xl relative overflow-hidden transition-colors">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-amber-600 dark:text-amber-400 font-mono tracking-wider">
              <ShieldCheck className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              PARQUE GENERADOR NACIONAL · OFICIAL CND MAYO 2025
            </div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white mt-1">Centrales de Generación Eléctrica del SEN</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Catálogo oficial de unidades turbogeneradoras, potencia nominal y patios de salida a la red troncal.
            </p>
          </div>
          <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-950/80 px-4 py-2.5 rounded-xl border border-slate-300 dark:border-amber-900/40 shadow-xs">
            <div className="text-right">
              <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono uppercase font-semibold">Potencia Total Filtrada</div>
              <div className="text-2xl font-black text-amber-600 dark:text-amber-400 font-mono">{totalMwFiltrado.toLocaleString('es-VE')} MW</div>
            </div>
            <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-300">
              <Zap className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFiltroFuente('TODAS')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                filtroFuente === 'TODAS'
                  ? 'bg-amber-500 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              Todas ({todasPlantas.length})
            </button>
            <button
              onClick={() => setFiltroFuente('HIDRO')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                filtroFuente === 'HIDRO'
                  ? 'bg-cyan-600 dark:bg-cyan-500 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <Droplets className="w-3.5 h-3.5" />
              Hidroeléctricas
            </button>
            <button
              onClick={() => setFiltroFuente('TERMO')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                filtroFuente === 'TERMO'
                  ? 'bg-orange-600 dark:bg-orange-500 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <Flame className="w-3.5 h-3.5" />
              Termoeléctricas
            </button>
          </div>

          <div className="relative min-w-[280px]">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por planta, región o kV..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>
      </div>

      {/* Grid de Plantas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plantasFiltradas.map((planta) => {
          const isHidro = planta.generacion.some((g) => g.fuente === 'HIDROELECTRICA') || 
            ['GURI', 'MACAGUA', 'CARUACHI', 'PAEZ', 'CURUPAO'].some(h => planta.nombre_norm.includes(h));

          return (
            <div
              key={planta.codigo}
              className="bg-white dark:bg-slate-900/90 border border-slate-300/90 dark:border-slate-800 hover:border-amber-500/60 rounded-2xl p-5 shadow-sm hover:shadow-md dark:shadow-lg transition-all flex flex-col justify-between"
            >
              <div>
                {/* Header de Tarjeta */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className={`p-2 rounded-xl ${isHidro ? 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30' : 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/30'}`}>
                      {isHidro ? <Droplets className="w-4 h-4" /> : <Flame className="w-4 h-4" />}
                    </span>
                    <div>
                      <span className="text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400 block uppercase tracking-wider">
                        {isHidro ? 'CENTRAL HIDROELÉCTRICA' : 'COMPLEJO TERMOELÉCTRICO'}
                      </span>
                      <h3 className="text-base font-black text-slate-900 dark:text-white leading-tight">{planta.nombre_norm}</h3>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono border border-slate-200 dark:border-slate-700">
                    {planta.cuadrante}
                  </span>
                </div>

                {/* Potencia Total y Patios */}
                <div className="mt-4 grid grid-cols-2 gap-2 bg-slate-50/80 dark:bg-slate-950/60 p-3 rounded-xl border border-slate-200/90 dark:border-slate-800/80 shadow-xs">
                  <div>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-semibold">Capacidad Instalada</span>
                    <span className="text-lg font-black text-amber-600 dark:text-amber-400 font-mono">
                      {planta.capacidad_mw > 0 ? `${planta.capacidad_mw.toLocaleString('es-VE')} MW` : 'S/D en Plano'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-semibold">Patios de Tensión</span>
                    <span className="text-xs font-bold text-sky-600 dark:text-sky-400 font-mono">
                      {planta.tensiones_lista}
                    </span>
                  </div>
                </div>

                {/* Detalle de Unidades Turbomotoras */}
                <div className="mt-4 space-y-2">
                  <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase tracking-wider block font-bold">
                    Unidades de Generación Identificadas:
                  </span>
                  {planta.generacion.length > 0 ? (
                    planta.generacion.map((gen, idx) => (
                      <div
                        key={idx}
                        className="bg-slate-50/80 dark:bg-slate-950/80 border border-slate-200/90 dark:border-slate-800 px-3 py-2 rounded-lg flex items-center justify-between text-xs shadow-xs"
                      >
                        <div className="flex items-center gap-2">
                          <Gauge className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                          <span className="font-mono text-slate-900 dark:text-white font-medium">{gen.raw}</span>
                        </div>
                        <span className="font-mono font-bold text-amber-700 dark:text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded text-[11px] border border-amber-500/20">
                          {gen.total_mw} MW
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="text-xs text-slate-500 italic bg-slate-50 dark:bg-slate-950/40 p-2 rounded border border-slate-200 dark:border-transparent">
                      Nodo de entrega vinculado al complejo de generación.
                    </div>
                  )}
                </div>

                {/* Transformación y Reactivos si existen */}
                {(planta.capacidad_mva > 0 || planta.capacidad_mvar > 0) && (
                  <div className="mt-3 flex items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400 font-mono pt-2 border-t border-slate-200 dark:border-slate-800/60">
                    {planta.capacidad_mva > 0 && <span>⚡ {planta.capacidad_mva} MVA Trx</span>}
                    {planta.capacidad_mvar > 0 && <span>🌀 {planta.capacidad_mvar} MVAr React</span>}
                  </div>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                <span>Barras en Plano: <strong className="text-slate-900 dark:text-white">{planta.total_barras}</strong></span>
                <span className="font-mono text-slate-400 dark:text-slate-500">Coord: ({planta.coord_x}, {planta.coord_y})</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
