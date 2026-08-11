import React, { useState } from 'react';
import { Database, MapPin, Zap, Info, BarChart } from 'lucide-react';

interface AssetStateCount {
  stateName: string;
  substations: number;
  circuits: number;
}

// Datos consolidados (Mock/samc.activos_red)
const STATE_DATA: AssetStateCount[] = [
  { stateName: 'Amazonas', substations: 4, circuits: 12 },
  { stateName: 'Anzoátegui', substations: 35, circuits: 110 },
  { stateName: 'Apure', substations: 12, circuits: 45 },
  { stateName: 'Aragua', substations: 42, circuits: 156 },
  { stateName: 'Barinas', substations: 18, circuits: 65 },
  { stateName: 'Bolívar', substations: 55, circuits: 180 },
  { stateName: 'Carabobo', substations: 60, circuits: 220 },
  { stateName: 'Cojedes', substations: 10, circuits: 35 },
  { stateName: 'Delta Amacuro', substations: 5, circuits: 15 },
  { stateName: 'Distrito Capital', substations: 85, circuits: 310 },
  { stateName: 'Falcón', substations: 25, circuits: 95 },
  { stateName: 'Guárico', substations: 15, circuits: 55 },
  { stateName: 'Lara', substations: 38, circuits: 140 },
  { stateName: 'Mérida', substations: 22, circuits: 75 },
  { stateName: 'Miranda', substations: 70, circuits: 280 },
  { stateName: 'Monagas', substations: 20, circuits: 70 },
  { stateName: 'Nueva Esparta', substations: 18, circuits: 60 },
  { stateName: 'Portuguesa', substations: 16, circuits: 58 },
  { stateName: 'Sucre', substations: 19, circuits: 65 },
  { stateName: 'Táchira', substations: 30, circuits: 110 },
  { stateName: 'Trujillo', substations: 17, circuits: 62 },
  { stateName: 'La Guaira', substations: 14, circuits: 50 },
  { stateName: 'Yaracuy', substations: 15, circuits: 52 },
  { stateName: 'Zulia', substations: 95, circuits: 380 },
  { stateName: 'Guayana Esequiba', substations: 8, circuits: 25 },
].sort((a, b) => b.substations - a.substations); // Sort by highest

export const AssetsMapDashboard: React.FC = () => {
  const maxSE = Math.max(...STATE_DATA.map(d => d.substations));
  const maxCT = Math.max(...STATE_DATA.map(d => d.circuits));

  return (
    <div className="space-y-6 animate-in fade-in zoom-in duration-300">
      
      {/* Header Info */}
      <div className="rounded-3xl bg-amber-50 dark:bg-amber-950/20 p-6 border border-amber-200 dark:border-amber-900/50 shadow-sm flex items-start space-x-3">
        <Info className="h-6 w-6 text-amber-600 dark:text-amber-400 shrink-0" />
        <div>
          <h3 className="text-lg font-black text-amber-900 dark:text-amber-400">
            Consolidado Nacional de Activos de Red (Choropleth Heatmap)
          </h3>
          <p className="text-xs text-amber-800 dark:text-amber-600/80 mt-1 font-medium">
            Representación de densidad de Subestaciones (SE) y Circuitos (CT) basada en `samc.activos_red`. 
            Incluye la representación de la Guayana Esequiba. *(Vista de lista en mapa de calor debido a compatibilidad ESM en React 19)*.
          </p>
        </div>
      </div>

      {/* Mapas / Heatmaps de Densidad */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Mapa Heatmap de Subestaciones */}
        <div className="rounded-3xl bg-white dark:bg-[#081224] p-5 border border-slate-200 dark:border-slate-800 shadow-sm relative">
          <div className="flex items-center space-x-2 mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">
            <Database className="h-5 w-5 text-red-500" />
            <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
              Mapa de Calor: Subestaciones
            </h4>
          </div>
          <div className="space-y-2 h-[400px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800">
            {STATE_DATA.map((state) => (
              <div key={state.stateName} className="relative">
                <div className="flex justify-between text-[10px] font-bold text-slate-700 dark:text-slate-300 mb-0.5 relative z-10 px-2 pt-1">
                  <span>{state.stateName} {state.stateName === 'Guayana Esequiba' && '🇻🇪'}</span>
                  <span>{state.substations} SEs</span>
                </div>
                <div className="h-5 w-full bg-slate-100 dark:bg-slate-800/50 rounded overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-red-200 to-red-500 dark:from-red-900/50 dark:to-red-600 rounded"
                    style={{ width: `${(state.substations / maxSE) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Mapa Heatmap de Circuitos */}
        <div className="rounded-3xl bg-white dark:bg-[#081224] p-5 border border-slate-200 dark:border-slate-800 shadow-sm relative">
          <div className="flex items-center space-x-2 mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">
            <Zap className="h-5 w-5 text-blue-500" />
            <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
              Mapa de Calor: Circuitos
            </h4>
          </div>
          <div className="space-y-2 h-[400px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800">
            {STATE_DATA.map((state) => (
              <div key={state.stateName} className="relative">
                <div className="flex justify-between text-[10px] font-bold text-slate-700 dark:text-slate-300 mb-0.5 relative z-10 px-2 pt-1">
                  <span>{state.stateName} {state.stateName === 'Guayana Esequiba' && '🇻🇪'}</span>
                  <span>{state.circuits} CTs</span>
                </div>
                <div className="h-5 w-full bg-slate-100 dark:bg-slate-800/50 rounded overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-200 to-blue-500 dark:from-blue-900/50 dark:to-blue-600 rounded"
                    style={{ width: `${(state.circuits / maxCT) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Tabla Resumen de Activos (Mock/Estructura base para samc.activos_red) */}
      <div className="rounded-3xl bg-white dark:bg-[#081224] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden mt-6">
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center space-x-2">
            <BarChart className="h-4 w-4 text-emerald-500" />
            <span>Tabla Unificada de Origen de Activos</span>
          </h4>
          <span className="text-[10px] font-mono font-bold bg-blue-100 text-[#002b49] dark:bg-cyan-950 dark:text-cyan-300 px-2.5 py-1 rounded-full">
            INTEGRADO DESDE: samc.activos_red
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-[#0a1526] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
                <th className="p-4 border-b border-slate-200 dark:border-slate-800">Tipo de Activo</th>
                <th className="p-4 border-b border-slate-200 dark:border-slate-800">Origen de Ingesta</th>
                <th className="p-4 border-b border-slate-200 dark:border-slate-800">Segmento</th>
                <th className="p-4 border-b border-slate-200 dark:border-slate-800 text-right">Cantidad Registrada</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-700 dark:text-slate-300 font-medium">
              <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <td className="p-4 flex items-center space-x-2"><Database className="h-4 w-4 text-red-500"/><span>Subestaciones (SE)</span></td>
                <td className="p-4"><code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-[10px] text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">Caracterización SE</code></td>
                <td className="p-4"><span className="text-blue-600 dark:text-cyan-400 font-bold">Transmisión</span></td>
                <td className="p-4 text-right font-mono font-black text-slate-900 dark:text-white">214</td>
              </tr>
              <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <td className="p-4 flex items-center space-x-2"><Database className="h-4 w-4 text-amber-500"/><span>Subestaciones (SE)</span></td>
                <td className="p-4"><code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-[10px] text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">Caracterización SE</code></td>
                <td className="p-4"><span className="text-emerald-600 dark:text-emerald-400 font-bold">Distribución</span></td>
                <td className="p-4 text-right font-mono font-black text-slate-900 dark:text-white">542</td>
              </tr>
              <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <td className="p-4 flex items-center space-x-2"><Zap className="h-4 w-4 text-blue-500"/><span>Circuitos (CT)</span></td>
                <td className="p-4"><code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-[10px] text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">Caracterización CT</code></td>
                <td className="p-4"><span className="text-emerald-600 dark:text-emerald-400 font-bold">Distribución (13.8kV - 34.5kV)</span></td>
                <td className="p-4 text-right font-mono font-black text-slate-900 dark:text-white">2,480</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
