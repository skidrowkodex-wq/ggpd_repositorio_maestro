import React from 'react';
import { sigaSenService } from '../services/sigaSenService';
import { Zap, Activity, Building2, Layers, ShieldCheck, ArrowUpRight } from 'lucide-react';

export const BalanceSenView: React.FC = () => {
  const stats = sigaSenService.getEstadisticas();
  const subestaciones = sigaSenService.getSubestaciones();
  const clientes = sigaSenService.getClientesIndustriales();
  const cuadrantes = sigaSenService.getCuadrantes();

  // Agrupamiento de métricas por región
  const regionalData = cuadrantes.map((c) => {
    const nodosEnRegion = subestaciones.filter((s) => s.cuadrante === c);
    const mw = nodosEnRegion.reduce((acc, s) => acc + s.capacidad_mw, 0);
    const mva = nodosEnRegion.reduce((acc, s) => acc + s.capacidad_mva, 0);
    const mvar = nodosEnRegion.reduce((acc, s) => acc + s.capacidad_mvar, 0);
    return {
      cuadrante: c,
      nodosCount: nodosEnRegion.length,
      mw: Math.round(mw),
      mva: Math.round(mva),
      mvar: Math.round(mvar),
    };
  }).sort((a, b) => b.mw - a.mw || b.mva - a.mva);

  return (
    <div className="space-y-6">
      {/* Banner Principal */}
      <div className="bg-white dark:bg-slate-900/90 border border-slate-300/90 dark:border-slate-800 rounded-2xl p-6 shadow-sm dark:shadow-xl relative overflow-hidden transition-colors">
        <div className="flex items-center gap-2 text-xs font-bold text-amber-600 dark:text-amber-400 font-mono tracking-wider">
          <ShieldCheck className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          BALANCE ENERGÉTICO NACIONAL Y CAPACIDAD INSTALADA · SEN 2025
        </div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
          Diagnóstico de Capacidad y Activos de Potencia del SEN
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Consolidación estadística oficial de las 562 instalaciones y 649 patios del Sistema Eléctrico Nacional.
        </p>
      </div>

      {/* Grid de KPIs Nacionales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900/90 border border-slate-300/90 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-md dark:shadow-lg transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-500 dark:text-slate-400 uppercase font-semibold">Potencia Instalada SEN</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30">
              <Zap className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white mt-3 font-mono">
            {stats.potencia_instalada_mw.toLocaleString('es-VE')} <span className="text-sm font-bold text-amber-600 dark:text-amber-400">MW</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1 font-semibold">94 Grupos turbomotores en 22 centrales</p>
        </div>

        <div className="bg-white dark:bg-slate-900/90 border border-slate-300/90 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-md dark:shadow-lg transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-500 dark:text-slate-400 uppercase font-semibold">Capacidad de Transformación</span>
            <div className="p-2 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/30">
              <Layers className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white mt-3 font-mono">
            {stats.capacidad_transformacion_mva.toLocaleString('es-VE')} <span className="text-sm font-bold text-sky-600 dark:text-sky-400">MVA</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1 font-semibold">101 Bancos de transformación de potencia</p>
        </div>

        <div className="bg-white dark:bg-slate-900/90 border border-slate-300/90 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-md dark:shadow-lg transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-500 dark:text-slate-400 uppercase font-semibold">Compensación Reactiva</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
              <Activity className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white mt-3 font-mono">
            {stats.compensacion_reactiva_mvar.toLocaleString('es-VE')} <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">MVAr</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1 font-semibold">90 Bancos de inductores y capacitores</p>
        </div>

        <div className="bg-white dark:bg-slate-900/90 border border-slate-300/90 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-md dark:shadow-lg transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-500 dark:text-slate-400 uppercase font-semibold">Infraestructura Troncal</span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/30">
              <Building2 className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white mt-3 font-mono">
            {stats.total_nodos} <span className="text-sm font-bold text-purple-600 dark:text-purple-400">Nodos</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1 font-semibold">649 Barras y 2.506 Tramos de línea</p>
        </div>
      </div>

      {/* Distribución Regional */}
      <div className="bg-white dark:bg-slate-900/90 border border-slate-300/90 dark:border-slate-800 rounded-2xl p-6 shadow-sm dark:shadow-xl transition-colors">
        <h2 className="text-lg font-black text-slate-900 dark:text-white mb-4">
          Distribución Geográfica de la Capacidad de Potencia por Región
        </h2>
        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
          <table className="w-full min-w-[640px] text-left text-xs">
            <thead>
              <tr className="bg-slate-100/90 dark:bg-slate-950 border-b border-slate-300 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-mono uppercase font-bold text-[11px]">
                <th className="py-3.5 px-4">Región / Cuadrante Mural</th>
                <th className="py-3.5 px-4 text-center">Nodos S/E</th>
                <th className="py-3.5 px-4 text-right">Potencia Generación (MW)</th>
                <th className="py-3.5 px-4 text-right">Capacidad Trx (MVA)</th>
                <th className="py-3.5 px-4 text-right">Comp. Reactiva (MVAr)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800 font-mono">
              {regionalData.map((r, i) => (
                <tr key={i} className="hover:bg-amber-50/50 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 px-4 font-sans font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                    {r.cuadrante}
                  </td>
                  <td className="py-3.5 px-4 text-center text-slate-700 dark:text-slate-300 font-semibold">{r.nodosCount}</td>
                  <td className="py-3.5 px-4 text-right text-amber-600 dark:text-amber-400 font-bold">
                    {r.mw > 0 ? `${r.mw.toLocaleString('es-VE')} MW` : '—'}
                  </td>
                  <td className="py-3.5 px-4 text-right text-sky-600 dark:text-sky-400 font-bold">
                    {r.mva > 0 ? `${r.mva.toLocaleString('es-VE')} MVA` : '—'}
                  </td>
                  <td className="py-3.5 px-4 text-right text-emerald-600 dark:text-emerald-400 font-bold">
                    {r.mvar > 0 ? `${r.mvar.toLocaleString('es-VE')} MVAr` : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Clientes Industriales y Grandes Consumidores */}
      <div className="bg-white dark:bg-slate-900/90 border border-slate-300/90 dark:border-slate-800 rounded-2xl p-6 shadow-sm dark:shadow-xl transition-colors">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
          <div>
            <h2 className="text-lg font-black text-slate-900 dark:text-white">
              Grandes Clientes Industriales y Organismos del SEN
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Glosario oficial del CND de empresas básicas, petroleras y servicios de alto consumo.
            </p>
          </div>
          <span className="px-3 py-1 rounded-lg text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono border border-slate-200 dark:border-slate-700">
            {clientes.length} Entidades
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {clientes.map((cli) => (
            <div
              key={cli.sigla}
              className="bg-slate-50/90 dark:bg-slate-950/80 border border-slate-200/90 dark:border-slate-800/80 rounded-xl p-3 shadow-xs hover:border-amber-400 transition-all flex items-start gap-3"
            >
              <div className="px-2 py-1 rounded bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300 font-mono font-bold text-xs shrink-0">
                {cli.sigla}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold text-slate-900 dark:text-white truncate">{cli.nombre_completo}</div>
                <div className="text-[10px] text-slate-500 font-mono mt-0.5">{cli.sector_categoria}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
