import React, { useState } from 'react';
import { Database, Zap, Info, BarChart3, MapPin, Eye, ShieldCheck, Sparkles, Filter } from 'lucide-react';

export interface StateAssetData {
  code: string;
  name: string;
  substations: number;
  circuits: number;
  transmissionSE: number;
  distributionSE: number;
  pathD: string;
  labelPos: { x: number; y: number };
}

// Datos Geográficos Consolidados (samc.activos_red)
export const VENEZUELA_STATES_GEO: StateAssetData[] = [
  {
    code: 'ZUL',
    name: 'Zulia',
    substations: 95,
    circuits: 380,
    transmissionSE: 28,
    distributionSE: 67,
    pathD: 'M 70 100 L 100 95 L 125 105 L 135 135 L 140 160 L 115 195 L 90 190 L 70 160 Z',
    labelPos: { x: 98, y: 140 },
  },
  {
    code: 'FAL',
    name: 'Falcón',
    substations: 25,
    circuits: 95,
    transmissionSE: 6,
    distributionSE: 19,
    pathD: 'M 125 105 L 155 55 L 175 60 L 160 100 L 210 110 L 215 130 L 150 130 L 135 135 Z',
    labelPos: { x: 165, y: 95 },
  },
  {
    code: 'LAR',
    name: 'Lara',
    substations: 38,
    circuits: 140,
    transmissionSE: 10,
    distributionSE: 28,
    pathD: 'M 140 135 L 185 130 L 195 160 L 155 170 L 140 160 Z',
    labelPos: { x: 165, y: 150 },
  },
  {
    code: 'YAR',
    name: 'Yaracuy',
    substations: 15,
    circuits: 52,
    transmissionSE: 4,
    distributionSE: 11,
    pathD: 'M 185 130 L 208 130 L 212 155 L 195 160 Z',
    labelPos: { x: 200, y: 144 },
  },
  {
    code: 'CAR',
    name: 'Carabobo',
    substations: 60,
    circuits: 220,
    transmissionSE: 16,
    distributionSE: 44,
    pathD: 'M 208 130 L 235 130 L 238 155 L 212 155 Z',
    labelPos: { x: 223, y: 142 },
  },
  {
    code: 'ARA',
    name: 'Aragua',
    substations: 42,
    circuits: 156,
    transmissionSE: 12,
    distributionSE: 30,
    pathD: 'M 235 130 L 260 130 L 260 158 L 238 155 Z',
    labelPos: { x: 248, y: 144 },
  },
  {
    code: 'LAG',
    name: 'La Guaira',
    substations: 14,
    circuits: 50,
    transmissionSE: 4,
    distributionSE: 10,
    pathD: 'M 260 124 L 290 124 L 290 132 L 260 132 Z',
    labelPos: { x: 275, y: 128 },
  },
  {
    code: 'DC',
    name: 'Distrito Capital',
    substations: 85,
    circuits: 310,
    transmissionSE: 22,
    distributionSE: 63,
    pathD: 'M 265 132 L 280 132 L 280 144 L 265 144 Z',
    labelPos: { x: 272, y: 138 },
  },
  {
    code: 'MIR',
    name: 'Miranda',
    substations: 70,
    circuits: 280,
    transmissionSE: 18,
    distributionSE: 52,
    pathD: 'M 260 144 L 310 132 L 325 158 L 278 168 L 260 158 Z',
    labelPos: { x: 290, y: 150 },
  },
  {
    code: 'TRU',
    name: 'Trujillo',
    substations: 17,
    circuits: 62,
    transmissionSE: 4,
    distributionSE: 13,
    pathD: 'M 125 170 L 155 170 L 145 195 L 120 195 Z',
    labelPos: { x: 136, y: 182 },
  },
  {
    code: 'MER',
    name: 'Mérida',
    substations: 22,
    circuits: 75,
    transmissionSE: 6,
    distributionSE: 16,
    pathD: 'M 115 195 L 145 195 L 130 225 L 95 210 Z',
    labelPos: { x: 122, y: 208 },
  },
  {
    code: 'TAC',
    name: 'Táchira',
    substations: 30,
    circuits: 110,
    transmissionSE: 8,
    distributionSE: 22,
    pathD: 'M 90 190 L 115 195 L 95 240 L 70 220 Z',
    labelPos: { x: 92, y: 212 },
  },
  {
    code: 'POR',
    name: 'Portuguesa',
    substations: 16,
    circuits: 58,
    transmissionSE: 4,
    distributionSE: 12,
    pathD: 'M 155 170 L 198 160 L 202 190 L 165 200 Z',
    labelPos: { x: 180, y: 180 },
  },
  {
    code: 'COJ',
    name: 'Cojedes',
    substations: 10,
    circuits: 35,
    transmissionSE: 3,
    distributionSE: 7,
    pathD: 'M 198 160 L 238 155 L 232 190 L 202 190 Z',
    labelPos: { x: 218, y: 174 },
  },
  {
    code: 'BAR',
    name: 'Barinas',
    substations: 18,
    circuits: 65,
    transmissionSE: 5,
    distributionSE: 13,
    pathD: 'M 130 225 L 165 200 L 218 215 L 180 250 L 135 240 Z',
    labelPos: { x: 165, y: 226 },
  },
  {
    code: 'APU',
    name: 'Apure',
    substations: 12,
    circuits: 45,
    transmissionSE: 3,
    distributionSE: 9,
    pathD: 'M 95 240 L 180 250 L 250 250 L 260 285 L 170 310 L 120 280 Z',
    labelPos: { x: 180, y: 275 },
  },
  {
    code: 'GUA',
    name: 'Guárico',
    substations: 15,
    circuits: 55,
    transmissionSE: 4,
    distributionSE: 11,
    pathD: 'M 238 155 L 315 160 L 305 240 L 250 250 Z',
    labelPos: { x: 278, y: 200 },
  },
  {
    code: 'ANZ',
    name: 'Anzoátegui',
    substations: 35,
    circuits: 110,
    transmissionSE: 10,
    distributionSE: 25,
    pathD: 'M 315 160 L 390 150 L 385 240 L 305 240 Z',
    labelPos: { x: 348, y: 195 },
  },
  {
    code: 'MON',
    name: 'Monagas',
    substations: 20,
    circuits: 70,
    transmissionSE: 6,
    distributionSE: 14,
    pathD: 'M 390 150 L 440 150 L 435 200 L 385 200 Z',
    labelPos: { x: 410, y: 175 },
  },
  {
    code: 'SUC',
    name: 'Sucre',
    substations: 19,
    circuits: 65,
    transmissionSE: 5,
    distributionSE: 14,
    pathD: 'M 355 125 L 450 125 L 445 150 L 390 150 Z',
    labelPos: { x: 400, y: 136 },
  },
  {
    code: 'NES',
    name: 'Nueva Esparta',
    substations: 18,
    circuits: 60,
    transmissionSE: 4,
    distributionSE: 14,
    pathD: 'M 385 92 C 385 85, 415 85, 415 92 C 415 102, 385 102, 385 92 Z',
    labelPos: { x: 400, y: 92 },
  },
  {
    code: 'DEL',
    name: 'Delta Amacuro',
    substations: 5,
    circuits: 15,
    transmissionSE: 1,
    distributionSE: 4,
    pathD: 'M 440 150 L 495 165 L 480 230 L 435 200 Z',
    labelPos: { x: 462, y: 182 },
  },
  {
    code: 'BOL',
    name: 'Bolívar',
    substations: 55,
    circuits: 180,
    transmissionSE: 20,
    distributionSE: 35,
    pathD: 'M 260 285 L 305 240 L 385 240 L 435 200 L 480 230 L 475 330 L 415 400 L 315 390 L 280 340 Z',
    labelPos: { x: 375, y: 310 },
  },
  {
    code: 'AMA',
    name: 'Amazonas',
    substations: 4,
    circuits: 12,
    transmissionSE: 1,
    distributionSE: 3,
    pathD: 'M 170 310 L 260 285 L 280 340 L 315 390 L 275 470 L 205 450 L 180 370 Z',
    labelPos: { x: 235, y: 380 },
  },
  {
    code: 'ESE',
    name: 'Guayana Esequiba 🇻🇪',
    substations: 8,
    circuits: 25,
    transmissionSE: 2,
    distributionSE: 6,
    pathD: 'M 480 230 L 555 220 L 540 360 L 475 330 Z',
    labelPos: { x: 510, y: 285 },
  },
];

export const AssetsMapDashboard: React.FC = () => {
  const [hoveredState, setHoveredState] = useState<StateAssetData | null>(null);
  const [selectedState, setSelectedState] = useState<StateAssetData>(VENEZUELA_STATES_GEO[0]);
  const [viewMode, setViewMode] = useState<'MAPS' | 'LIST'>('MAPS');

  const totalSE = VENEZUELA_STATES_GEO.reduce((acc, s) => acc + s.substations, 0);
  const totalCT = VENEZUELA_STATES_GEO.reduce((acc, s) => acc + s.circuits, 0);
  const maxSE = Math.max(...VENEZUELA_STATES_GEO.map(s => s.substations));
  const maxCT = Math.max(...VENEZUELA_STATES_GEO.map(s => s.circuits));

  // Función para determinar el color del mapa de Subestaciones
  const getSEColor = (count: number, isHovered: boolean, isSelected: boolean) => {
    if (isSelected) return '#f59e0b'; // Amber highlight
    if (isHovered) return '#fbbf24';
    const ratio = count / maxSE;
    if (ratio > 0.7) return '#dc2626'; // Deep Red
    if (ratio > 0.4) return '#ea580c'; // Orange
    if (ratio > 0.2) return '#d97706'; // Amber
    if (ratio > 0.1) return '#eab308'; // Yellow
    return '#64748b'; // Slate
  };

  // Función para determinar el color del mapa de Circuitos
  const getCTColor = (count: number, isHovered: boolean, isSelected: boolean) => {
    if (isSelected) return '#00f2fe'; // Electric Cyan highlight
    if (isHovered) return '#38bdf8';
    const ratio = count / maxCT;
    if (ratio > 0.7) return '#0284c7'; // Deep Sky
    if (ratio > 0.4) return '#0ea5e9'; // Cyan
    if (ratio > 0.2) return '#38bdf8'; // Light Blue
    if (ratio > 0.1) return '#7dd3fc'; // Soft Blue
    return '#475569'; // Dark Slate
  };

  const activeStateObj = hoveredState || selectedState;

  return (
    <div className="space-y-6 animate-in fade-in zoom-in duration-300">
      
      {/* Header Info Banner */}
      <div className="rounded-3xl bg-white dark:bg-gradient-to-r dark:from-[#0b182e] dark:via-[#112240] dark:to-[#0b182e] p-6 border border-slate-200 dark:border-[#00f2fe]/30 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <MapPin className="h-6 w-6 text-amber-500 dark:text-[#ffd700]" />
            <h3 className="text-xl font-black text-slate-900 dark:text-white">
              Visor Geográfico de Activos de Red — Venezuela 🇻🇪
            </h3>
          </div>
          <p className="text-xs text-slate-700 dark:text-slate-300 mt-1 max-w-3xl font-medium">
            Representación vectorial de la densidad de activos eléctricos basada en <code className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded font-mono text-amber-700 dark:text-amber-400">samc.activos_red</code>.
            Incluye la totalidad de las 24 entidades federales más la <strong className="text-[#002b49] dark:text-[#00f2fe]">Guayana Esequiba</strong>.
          </p>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center space-x-1.5 bg-slate-100 dark:bg-[#070f1e] p-1.5 rounded-2xl border border-slate-300 dark:border-slate-800 shadow-inner">
          <button
            onClick={() => setViewMode('MAPS')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
              viewMode === 'MAPS'
                ? 'bg-[#002b49] text-white dark:bg-[#00f2fe] dark:text-[#0a192f] shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <MapPin className="h-4 w-4" />
            <span>Mapas Vectoriales SVG</span>
          </button>

          <button
            onClick={() => setViewMode('LIST')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
              viewMode === 'LIST'
                ? 'bg-[#002b49] text-white dark:bg-[#00f2fe] dark:text-[#0a192f] shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <BarChart3 className="h-4 w-4" />
            <span>Barras de Calor & Tabla</span>
          </button>
        </div>
      </div>

      {/* State Detail Hover / Selected Floating Card */}
      <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-[#0b1f3a] to-slate-900 p-4 border border-amber-500/40 shadow-lg text-white flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center font-black text-amber-400 text-sm">
            {activeStateObj.code}
          </div>
          <div>
            <div className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Estado Seleccionado / Puntero</div>
            <h4 className="text-base font-black text-amber-400 flex items-center space-x-2">
              <span>{activeStateObj.name}</span>
              {activeStateObj.code === 'ESE' && <span>🇻🇪</span>}
            </h4>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-6">
          <div className="text-center">
            <div className="text-[10px] font-semibold text-slate-400">Subestaciones (SE)</div>
            <div className="text-lg font-black text-red-400 flex items-center justify-center space-x-1">
              <Database className="h-4 w-4" />
              <span>{activeStateObj.substations}</span>
            </div>
            <div className="text-[9px] text-slate-400">Transmisión: {activeStateObj.transmissionSE} | Distr: {activeStateObj.distributionSE}</div>
          </div>

          <div className="h-8 w-px bg-slate-700 hidden sm:block" />

          <div className="text-center">
            <div className="text-[10px] font-semibold text-slate-400">Circuitos (CT)</div>
            <div className="text-lg font-black text-[#00f2fe] flex items-center justify-center space-x-1">
              <Zap className="h-4 w-4" />
              <span>{activeStateObj.circuits}</span>
            </div>
            <div className="text-[9px] text-slate-400">{((activeStateObj.circuits / totalCT) * 100).toFixed(1)}% del Parque Nacional</div>
          </div>

          <div className="h-8 w-px bg-slate-700 hidden sm:block" />

          <div className="text-center">
            <div className="text-[10px] font-semibold text-slate-400">Estatus de Auditoría</div>
            <div className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-extrabold mt-1">
              <ShieldCheck className="h-3 w-3" />
              <span>100% CARACTERIZADO</span>
            </div>
          </div>
        </div>
      </div>

      {viewMode === 'MAPS' ? (
        /* VISTA DE MAPAS VECTORIALES SVG SIMULTÁNEOS */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* MAPA 1: SUBESTACIONES (SE) */}
          <div className="rounded-3xl bg-white dark:bg-[#070f1e] p-5 border border-slate-200 dark:border-slate-800 shadow-md relative overflow-hidden">
            <div className="flex items-center justify-between mb-4 border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <div className="h-8 w-8 rounded-xl bg-red-100 dark:bg-red-950/60 border border-red-300 dark:border-red-500/40 flex items-center justify-center text-red-600 dark:text-red-400">
                  <Database className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
                    Mapa 1: Subestaciones (SE)
                  </h4>
                  <span className="text-[10px] text-slate-500 font-semibold">Total Nacional: {totalSE} Subestaciones</span>
                </div>
              </div>

              {/* Intensity Legend */}
              <div className="flex items-center space-x-1 text-[9px] font-bold text-slate-500">
                <span>Bajo</span>
                <span className="h-2.5 w-3 bg-[#64748b] rounded-xs" />
                <span className="h-2.5 w-3 bg-[#eab308] rounded-xs" />
                <span className="h-2.5 w-3 bg-[#ea580c] rounded-xs" />
                <span className="h-2.5 w-3 bg-[#dc2626] rounded-xs" />
                <span>Alto</span>
              </div>
            </div>

            {/* SVG Map Canvas SE */}
            <div className="relative w-full aspect-[580/480] bg-slate-50 dark:bg-[#040914] rounded-2xl border border-slate-200 dark:border-slate-800/80 p-2 flex items-center justify-center">
              <svg
                viewBox="0 0 580 480"
                className="w-full h-full drop-shadow-md select-none"
              >
                {/* Background Water / Border Mesh */}
                <rect x="0" y="0" width="580" height="480" fill="transparent" />

                {/* State Paths */}
                {VENEZUELA_STATES_GEO.map((st) => {
                  const isHovered = hoveredState?.code === st.code;
                  const isSelected = selectedState.code === st.code;
                  const fillColor = getSEColor(st.substations, isHovered, isSelected);

                  return (
                    <g key={`se-${st.code}`}>
                      <path
                        d={st.pathD}
                        fill={fillColor}
                        stroke={isSelected ? '#ffffff' : '#1e293b'}
                        strokeWidth={isSelected ? 2.5 : 1}
                        className="transition-all duration-200 cursor-pointer hover:opacity-90 hover:stroke-white"
                        onMouseEnter={() => setHoveredState(st)}
                        onMouseLeave={() => setHoveredState(null)}
                        onClick={() => setSelectedState(st)}
                      />
                      {/* State Label Abbreviation */}
                      <text
                        x={st.labelPos.x}
                        y={st.labelPos.y}
                        fill={isSelected ? '#ffffff' : '#ffffff'}
                        fontSize="9"
                        fontWeight="900"
                        textAnchor="middle"
                        className="pointer-events-none drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]"
                      >
                        {st.code}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
            
            <div className="mt-3 flex items-center justify-between text-[10px] text-slate-500 font-semibold px-1">
              <span>* Haz clic o pasa el cursor sobre cualquier estado para consultar</span>
              <span className="text-red-500 font-bold">Límite Guayana Esequiba 🇻🇪 Incluido</span>
            </div>
          </div>

          {/* MAPA 2: CIRCUITOS (CT) */}
          <div className="rounded-3xl bg-white dark:bg-[#070f1e] p-5 border border-slate-200 dark:border-slate-800 shadow-md relative overflow-hidden">
            <div className="flex items-center justify-between mb-4 border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <div className="h-8 w-8 rounded-xl bg-cyan-100 dark:bg-cyan-950/60 border border-cyan-300 dark:border-cyan-500/40 flex items-center justify-center text-cyan-600 dark:text-cyan-400">
                  <Zap className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
                    Mapa 2: Circuitos de Distribución (CT)
                  </h4>
                  <span className="text-[10px] text-slate-500 font-semibold">Total Nacional: {totalCT.toLocaleString()} Circuitos</span>
                </div>
              </div>

              {/* Intensity Legend */}
              <div className="flex items-center space-x-1 text-[9px] font-bold text-slate-500">
                <span>Bajo</span>
                <span className="h-2.5 w-3 bg-[#475569] rounded-xs" />
                <span className="h-2.5 w-3 bg-[#38bdf8] rounded-xs" />
                <span className="h-2.5 w-3 bg-[#0ea5e9] rounded-xs" />
                <span className="h-2.5 w-3 bg-[#00f2fe] rounded-xs" />
                <span>Alto</span>
              </div>
            </div>

            {/* SVG Map Canvas CT */}
            <div className="relative w-full aspect-[580/480] bg-slate-50 dark:bg-[#040914] rounded-2xl border border-slate-200 dark:border-slate-800/80 p-2 flex items-center justify-center">
              <svg
                viewBox="0 0 580 480"
                className="w-full h-full drop-shadow-md select-none"
              >
                {/* Background Water / Border Mesh */}
                <rect x="0" y="0" width="580" height="480" fill="transparent" />

                {/* State Paths */}
                {VENEZUELA_STATES_GEO.map((st) => {
                  const isHovered = hoveredState?.code === st.code;
                  const isSelected = selectedState.code === st.code;
                  const fillColor = getCTColor(st.circuits, isHovered, isSelected);

                  return (
                    <g key={`ct-${st.code}`}>
                      <path
                        d={st.pathD}
                        fill={fillColor}
                        stroke={isSelected ? '#ffffff' : '#0f172a'}
                        strokeWidth={isSelected ? 2.5 : 1}
                        className="transition-all duration-200 cursor-pointer hover:opacity-90 hover:stroke-white"
                        onMouseEnter={() => setHoveredState(st)}
                        onMouseLeave={() => setHoveredState(null)}
                        onClick={() => setSelectedState(st)}
                      />
                      {/* State Label Abbreviation */}
                      <text
                        x={st.labelPos.x}
                        y={st.labelPos.y}
                        fill="#ffffff"
                        fontSize="9"
                        fontWeight="900"
                        textAnchor="middle"
                        className="pointer-events-none drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]"
                      >
                        {st.code}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>

            <div className="mt-3 flex items-center justify-between text-[10px] text-slate-500 font-semibold px-1">
              <span>* Integrado con el esquema oficial de Media Tensión (MT)</span>
              <span className="text-[#00f2fe] font-bold">25 Entidades Federales</span>
            </div>
          </div>

        </div>
      ) : (
        /* VISTA DE BARRAS DE CALOR Y TABLA */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Heatmap SE List */}
          <div className="rounded-3xl bg-white dark:bg-[#070f1e] p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center space-x-2 mb-4 border-b border-slate-200 dark:border-slate-800 pb-3">
              <Database className="h-5 w-5 text-red-500" />
              <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
                Densidad por Estado: Subestaciones
              </h4>
            </div>
            <div className="space-y-2 h-[420px] overflow-y-auto pr-2 scrollbar-thin">
              {VENEZUELA_STATES_GEO.slice().sort((a,b) => b.substations - a.substations).map((st) => (
                <div key={st.code} className="relative">
                  <div className="flex justify-between text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-0.5 px-2 pt-1">
                    <span>{st.name} {st.code === 'ESE' && '🇻🇪'}</span>
                    <span>{st.substations} SEs ({st.transmissionSE} Tx / {st.distributionSE} Dis)</span>
                  </div>
                  <div className="h-5 w-full bg-slate-100 dark:bg-slate-800/50 rounded overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-red-300 to-red-600 rounded"
                      style={{ width: `${(st.substations / maxSE) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Heatmap CT List */}
          <div className="rounded-3xl bg-white dark:bg-[#070f1e] p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center space-x-2 mb-4 border-b border-slate-200 dark:border-slate-800 pb-3">
              <Zap className="h-5 w-5 text-cyan-500" />
              <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
                Densidad por Estado: Circuitos
              </h4>
            </div>
            <div className="space-y-2 h-[420px] overflow-y-auto pr-2 scrollbar-thin">
              {VENEZUELA_STATES_GEO.slice().sort((a,b) => b.circuits - a.circuits).map((st) => (
                <div key={st.code} className="relative">
                  <div className="flex justify-between text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-0.5 px-2 pt-1">
                    <span>{st.name} {st.code === 'ESE' && '🇻🇪'}</span>
                    <span>{st.circuits} CTs</span>
                  </div>
                  <div className="h-5 w-full bg-slate-100 dark:bg-slate-800/50 rounded overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-cyan-300 to-cyan-600 rounded"
                      style={{ width: `${(st.circuits / maxCT) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* Tabla Unificada de Origen de Activos */}
      <div className="rounded-3xl bg-white dark:bg-[#070f1e] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden mt-6">
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center space-x-2">
            <BarChart3 className="h-4 w-4 text-emerald-500" />
            <span>Tabla Unificada de Origen de Activos (`samc.activos_red`)</span>
          </h4>
          <span className="text-[10px] font-mono font-bold bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/40 px-3 py-1 rounded-full">
            NORMAS ISO 8000 / 55000 / 27001
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-[#0a1526] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
                <th className="p-4 border-b border-slate-200 dark:border-slate-800">Código Entidad</th>
                <th className="p-4 border-b border-slate-200 dark:border-slate-800">Estado / Entidad Federal</th>
                <th className="p-4 border-b border-slate-200 dark:border-slate-800 text-center">Subestaciones (SE)</th>
                <th className="p-4 border-b border-slate-200 dark:border-slate-800 text-center">SE Transmisión</th>
                <th className="p-4 border-b border-slate-200 dark:border-slate-800 text-center">SE Distribución</th>
                <th className="p-4 border-b border-slate-200 dark:border-slate-800 text-right">Circuitos (CT)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-700 dark:text-slate-300 font-medium">
              {VENEZUELA_STATES_GEO.map((st) => (
                <tr 
                  key={st.code}
                  onClick={() => setSelectedState(st)}
                  className={`hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors cursor-pointer ${
                    selectedState.code === st.code ? 'bg-amber-50 dark:bg-amber-950/30' : ''
                  }`}
                >
                  <td className="p-4 font-mono font-bold text-slate-900 dark:text-white">{st.code}</td>
                  <td className="p-4 font-bold text-slate-900 dark:text-white flex items-center space-x-1.5">
                    <span>{st.name}</span>
                    {st.code === 'ESE' && <span>🇻🇪</span>}
                  </td>
                  <td className="p-4 text-center font-bold text-red-500">{st.substations}</td>
                  <td className="p-4 text-center font-mono text-slate-500">{st.transmissionSE}</td>
                  <td className="p-4 text-center font-mono text-slate-500">{st.distributionSE}</td>
                  <td className="p-4 text-right font-mono font-black text-cyan-600 dark:text-[#00f2fe]">{st.circuits}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default AssetsMapDashboard;
