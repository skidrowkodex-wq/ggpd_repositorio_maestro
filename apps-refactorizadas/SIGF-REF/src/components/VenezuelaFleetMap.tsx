import React, { useState, useMemo } from 'react';
import { VehicleRecord } from '../types/fleet';
import { CORPOELEC_CENTROS_SERVICIOS, VENEZUELA_STATES } from '../data/venezuelaRegions';
import { STATE_COORDINATES, CS_COORDINATES, projectCoordinates } from '../data/venezuelaCoordinates';
import { MapPin, ZoomIn, ZoomOut, RotateCcw, Layers, Radio, ShieldCheck, Car, Wrench, AlertTriangle, Eye, Info } from 'lucide-react';

interface VenezuelaFleetMapProps {
  vehicles: VehicleRecord[];
  isDarkMode?: boolean;
  selectedRegion?: string;
  onSelectState?: (stateName: string) => void;
}

export const VenezuelaFleetMap: React.FC<VenezuelaFleetMapProps> = ({
  vehicles,
  isDarkMode = false,
  selectedRegion = 'TODAS',
  onSelectState
}) => {
  const [viewMode, setViewMode] = useState<'estados' | 'centros' | 'hibrido'>('hibrido');
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [hoveredState, setHoveredState] = useState<string | null>(null);
  const [hoveredCs, setHoveredCs] = useState<string | null>(null);
  const [activeStateDetails, setActiveStateDetails] = useState<string | null>(null);

  // Dimensiones del lienzo SVG base
  const svgWidth = 900;
  const svgHeight = 600;

  // Métricas agregadas por Estado
  const stateStats = useMemo(() => {
    const stats: Record<string, {
      nombre: string;
      codigo: string;
      region: string;
      capital: string;
      total: number;
      activos: number;
      mantenimiento: number;
      fueraServicio: number;
      recuperados: number;
      centrosCount: number;
    }> = {};

    // Inicializar todos los 24 estados oficiales
    VENEZUELA_STATES.forEach(st => {
      const coord = STATE_COORDINATES[st.nombre] || STATE_COORDINATES[st.id] || {
        lat: 8.0,
        lng: -66.0,
        nombre: st.nombre,
        codigo: st.codigo,
        capital: st.capital || '',
        region: st.region
      };

      const csList = CORPOELEC_CENTROS_SERVICIOS.filter(cs => 
        cs.estado_id === st.id || cs.estado_nombre.toUpperCase() === st.nombre.toUpperCase()
      );

      stats[st.nombre] = {
        nombre: st.nombre,
        codigo: st.codigo,
        region: st.region,
        capital: coord.capital,
        total: 0,
        activos: 0,
        mantenimiento: 0,
        fueraServicio: 0,
        recuperados: 0,
        centrosCount: csList.length
      };
    });

    // Agregar conteo de vehículos
    vehicles.forEach(v => {
      const stateName = v.estado_venezuela || '';
      // Normalizar nombre de estado
      const matchedKey = Object.keys(stats).find(k => 
        k.toUpperCase() === stateName.toUpperCase() ||
        (stateName.includes('Esequiba') && k.includes('Esequiba')) ||
        (stateName.includes('Capital') && k.includes('Capital'))
      );

      if (matchedKey && stats[matchedKey]) {
        stats[matchedKey].total++;
        if (v.estado === 'ACTIVO') stats[matchedKey].activos++;
        else if (v.estado === 'EN MANTENIMIENTO') stats[matchedKey].mantenimiento++;
        else if (v.estado === 'FUERA DE SERVICIO') stats[matchedKey].fueraServicio++;
        if (v.vehiculo_recuperado === 'SI' || v.estado === 'RECUPERADO') stats[matchedKey].recuperados++;
      }
    });

    return stats;
  }, [vehicles]);

  // Centros de Servicios con conteo de vehículos asignados
  const csStats = useMemo(() => {
    return CORPOELEC_CENTROS_SERVICIOS.map(cs => {
      const coords = CS_COORDINATES[cs.codigo || ''] || STATE_COORDINATES[cs.estado_nombre] || { lat: 8.5, lng: -66.0 };
      const vList = vehicles.filter(v => 
        v.centro_servicios && cs.nombre && v.centro_servicios.toUpperCase().includes(cs.nombre.toUpperCase())
      );
      return {
        ...cs,
        lat: coords.lat,
        lng: coords.lng,
        totalVehiculos: vList.length,
        activos: vList.filter(v => v.estado === 'ACTIVO').length,
        enMantenimiento: vList.filter(v => v.estado === 'EN MANTENIMIENTO').length
      };
    });
  }, [vehicles]);

  // Máximo conteo para normalizar tamaños de burbuja
  const maxVehicleCount = useMemo(() => {
    const counts = Object.values(stateStats).map(s => s.total);
    return Math.max(...counts, 1);
  }, [stateStats]);

  // Ranking de los 5 estados con mayor densidad
  const topStates = useMemo(() => {
    return Object.values(stateStats)
      .filter(s => s.total > 0)
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);
  }, [stateStats]);

  // Función para determinar color según disponibilidad operativa
  const getDensityColor = (total: number, activos: number) => {
    if (total === 0) return isDarkMode ? '#1a5f47' : '#94a3b8';
    const pct = activos / total;
    if (pct >= 0.75) return '#10b981'; // Verde SEN óptimo
    if (pct >= 0.50) return '#f59e0b'; // Ámbar preventivo
    return '#ef4444'; // Rojo crítico
  };

  const selectedStateData = activeStateDetails ? stateStats[activeStateDetails] : null;

  return (
    <div className={`p-6 rounded-2xl border shadow-md space-y-4 ${
      isDarkMode ? 'bg-[#0f2a20] border-[#1a5f47] text-white' : 'bg-white border-slate-200 text-slate-900'
    }`}>
      {/* Header del Mapa */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 text-[11px] font-bold rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-emerald-600" />
              SISTEMA GEOESPACIAL DE DISTRIBUCIÓN SEN · VENEZUELA
            </span>
            <span className="text-xs font-mono text-slate-400">101 Centros de Servicios · 24 Entidades</span>
          </div>
          <h2 className={`text-lg sm:text-xl font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-[#0b3d2e]'}`}>
            Densidad Territorial y Despliegue Operativo de la Flota
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Visualización interactiva de nodos técnicos, concentración vehicular y disponibilidad en tiempo real por estado.
          </p>
        </div>

        {/* Controles de visualización y zoom */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Selector de Modo */}
          <div className={`p-1 rounded-xl border flex items-center gap-1 text-xs ${
            isDarkMode ? 'bg-[#13382b] border-[#1a5f47]' : 'bg-slate-100 border-slate-300'
          }`}>
            <button
              onClick={() => setViewMode('estados')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                viewMode === 'estados'
                  ? 'bg-[#0b3d2e] text-white shadow-xs border border-[#c9a227]'
                  : 'text-slate-600 dark:text-slate-300 hover:text-white'
              }`}
            >
              Estados
            </button>
            <button
              onClick={() => setViewMode('centros')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                viewMode === 'centros'
                  ? 'bg-[#0b3d2e] text-white shadow-xs border border-[#c9a227]'
                  : 'text-slate-600 dark:text-slate-300 hover:text-white'
              }`}
            >
              Centros (101 CS)
            </button>
            <button
              onClick={() => setViewMode('hibrido')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                viewMode === 'hibrido'
                  ? 'bg-[#0b3d2e] text-white shadow-xs border border-[#c9a227]'
                  : 'text-slate-600 dark:text-slate-300 hover:text-white'
              }`}
            >
              Híbrido
            </button>
          </div>

          {/* Zoom Buttons */}
          <div className={`flex items-center border rounded-xl overflow-hidden ${
            isDarkMode ? 'bg-[#13382b] border-[#1a5f47]' : 'bg-slate-100 border-slate-300'
          }`}>
            <button
              onClick={() => setZoomLevel(prev => Math.min(prev + 0.25, 2.0))}
              className="p-1.5 hover:bg-[#1a5f47] hover:text-white text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
              title="Acercar mapa"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={() => setZoomLevel(prev => Math.max(prev - 0.25, 0.75))}
              className="p-1.5 hover:bg-[#1a5f47] hover:text-white text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
              title="Alejar mapa"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              onClick={() => setZoomLevel(1)}
              className="p-1.5 hover:bg-[#1a5f47] hover:text-white text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
              title="Restablecer zoom"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Grid: Canvas de Mapa + Panel Lateral de Métricas */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Contenedor del Mapa SVG Interactivo */}
        <div className={`lg:col-span-3 relative rounded-2xl border overflow-hidden transition-all flex items-center justify-center min-h-[460px] sm:min-h-[520px] ${
          isDarkMode 
            ? 'bg-gradient-to-br from-[#06140e] via-[#0b241b] to-[#071912] border-[#1a5f47]' 
            : 'bg-gradient-to-br from-emerald-50/40 via-slate-50 to-emerald-100/30 border-slate-200'
        }`}>
          {/* Leyenda flotante sobre el mapa */}
          <div className="absolute top-3 left-3 z-10 p-2.5 rounded-xl backdrop-blur-md border text-[11px] shadow-sm space-y-1.5 pointer-events-none ${
            isDarkMode ? 'bg-[#0f2a20]/80 border-[#1a5f47] text-slate-200' : 'bg-white/90 border-slate-200 text-slate-700'
          }">
            <div className="font-bold flex items-center gap-1.5 text-xs text-[#0b3d2e] dark:text-[#c9a227]">
              <Layers className="w-3.5 h-3.5" />
              <span>Semáforo de Operatividad</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-xs"></span>
              <span>Óptimo (&ge;75% Activo)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-xs"></span>
              <span>Preventivo (50% - 74%)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-xs"></span>
              <span>Crítico (&lt;50% Activo)</span>
            </div>
            {viewMode !== 'estados' && (
              <div className="flex items-center gap-2 pt-1 border-t border-slate-200 dark:border-[#1a5f47]">
                <span className="w-2 h-2 rounded-full bg-[#c9a227] ring-2 ring-[#c9a227]/40"></span>
                <span>Centro de Servicios (CS)</span>
              </div>
            )}
          </div>

          {/* SVG Map Container con Soporte de Zoom */}
          <div 
            className="w-full h-full flex items-center justify-center p-2 transition-transform duration-300"
            style={{ transform: `scale(${zoomLevel})` }}
          >
            <svg 
              viewBox={`0 0 ${svgWidth} ${svgHeight}`} 
              className="w-full h-full max-h-[500px] select-none"
            >
              <defs>
                {/* Filtro de resplandor para nodos seleccionados */}
                <filter id="glow" x="-30%" y="-30%" width="160%" height="160%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
                <linearGradient id="venezuelaLandGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor={isDarkMode ? '#0d2d20' : '#dcfce7'} stopOpacity="0.8" />
                  <stop offset="100%" stopColor={isDarkMode ? '#091f16' : '#bbf7d0'} stopOpacity="0.9" />
                </linearGradient>
              </defs>

              {/* Polígono Vectorial Estilizado de la República de Venezuela (Incluye Guayana Esequiba) */}
              <g id="venezuela-land-outline">
                {/* Cuenca y Costas Venezolanas estilizadas con alta precisión geográfica */}
                <path
                  d="
                    M 140, 110 
                    C 170, 70, 240, 80, 280, 70
                    C 320, 50, 360, 45, 410, 60
                    C 460, 70, 520, 55, 590, 75
                    C 640, 90, 710, 80, 740, 100
                    C 780, 120, 810, 160, 825, 230
                    C 840, 290, 830, 350, 800, 390
                    C 760, 430, 700, 480, 640, 510
                    C 570, 540, 490, 560, 430, 550
                    C 380, 540, 350, 480, 340, 420
                    C 330, 360, 300, 310, 260, 280
                    C 220, 260, 170, 270, 130, 290
                    C 95, 270, 90, 230, 110, 180
                    Z
                  "
                  fill="url(#venezuelaLandGradient)"
                  stroke={isDarkMode ? '#1a5f47' : '#86efac'}
                  strokeWidth="2.5"
                  strokeLinejoin="round"
                />

                {/* Golfo de Venezuela & Lago de Maracaibo */}
                <ellipse 
                  cx="195" 
                  cy="175" 
                  rx="32" 
                  ry="48" 
                  fill={isDarkMode ? '#06140e' : '#f0fdf4'} 
                  stroke={isDarkMode ? '#1a5f47' : '#86efac'} 
                  strokeWidth="1.5" 
                  strokeDasharray="3 3"
                />
                <text x="195" y="180" textAnchor="middle" fontSize="9" fill={isDarkMode ? '#4ade80' : '#0b3d2e'} opacity="0.6" fontWeight="bold">
                  Lago de Maracaibo
                </text>

                {/* Eje del Río Orinoco (Línea de Vida Eléctrica) */}
                <path
                  d="M 360, 380 Q 480, 340 590, 310 T 730, 220"
                  fill="none"
                  stroke={isDarkMode ? '#10b981' : '#059669'}
                  strokeWidth="1.5"
                  strokeDasharray="4 4"
                  opacity="0.4"
                />
                <text x="560" y="300" fontSize="9" fill={isDarkMode ? '#6ee7b7' : '#047857'} opacity="0.6" fontStyle="italic">
                  Eje Orinoco - Complejo Hidroeléctrico
                </text>

                {/* Territorio de la Guayana Esequiba (Línea Estratégica) */}
                <path
                  d="M 720, 220 L 825, 230 L 800, 390 L 710, 340 Z"
                  fill={isDarkMode ? 'rgba(201, 162, 39, 0.08)' : 'rgba(201, 162, 39, 0.12)'}
                  stroke="#c9a227"
                  strokeWidth="1.5"
                  strokeDasharray="5 3"
                />
                <text x="760" y="300" textAnchor="middle" fontSize="9" fill="#c9a227" fontWeight="bold" opacity="0.8">
                  Estado Guayana Esequiba
                </text>
              </g>

              {/* Capa de Nodos de Centros de Servicios (CS) */}
              {(viewMode === 'centros' || viewMode === 'hibrido') && (
                <g id="centros-servicios-pins">
                  {csStats.map(cs => {
                    const pos = projectCoordinates(cs.lat, cs.lng, svgWidth, svgHeight);
                    const isHovered = hoveredCs === cs.codigo;

                    return (
                      <g
                        key={cs.id}
                        transform={`translate(${pos.x}, ${pos.y})`}
                        className="cursor-pointer transition-transform"
                        onMouseEnter={() => setHoveredCs(cs.codigo || null)}
                        onMouseLeave={() => setHoveredCs(null)}
                      >
                        {/* Pulso del Centro de Servicios */}
                        {cs.totalVehiculos > 0 && (
                          <circle
                            r={isHovered ? "8" : "4"}
                            fill="#c9a227"
                            opacity={isHovered ? "0.6" : "0.3"}
                            className="animate-ping"
                          />
                        )}
                        <circle
                          r={isHovered ? "5" : "2.8"}
                          fill="#c9a227"
                          stroke={isDarkMode ? '#0a1f17' : '#ffffff'}
                          strokeWidth="1"
                        />
                      </g>
                    );
                  })}
                </g>
              )}

              {/* Capa de Nodos y Burbujas de Densidad por Estado */}
              {(viewMode === 'estados' || viewMode === 'hibrido') && (
                <g id="state-density-bubbles">
                  {Object.values(stateStats).map(st => {
                    const coord = STATE_COORDINATES[st.nombre];
                    if (!coord) return null;

                    const pos = projectCoordinates(coord.lat, coord.lng, svgWidth, svgHeight);
                    const isHovered = hoveredState === st.nombre;
                    const isSelected = activeStateDetails === st.nombre;
                    const count = st.total;

                    // Radio dinámico según cantidad de vehículos
                    const baseRadius = count === 0 ? 9 : Math.min(34, Math.max(14, Math.sqrt(count / maxVehicleCount) * 32));
                    const radius = isHovered || isSelected ? baseRadius * 1.25 : baseRadius;
                    const color = getDensityColor(count, st.activos);

                    return (
                      <g
                        key={st.nombre}
                        transform={`translate(${pos.x}, ${pos.y})`}
                        className="cursor-pointer transition-all duration-300"
                        onClick={() => {
                          setActiveStateDetails(st.nombre);
                          if (onSelectState) onSelectState(st.nombre);
                        }}
                        onMouseEnter={() => setHoveredState(st.nombre)}
                        onMouseLeave={() => setHoveredState(null)}
                      >
                        {/* Halo translúcido de densidad */}
                        {count > 0 && (
                          <circle
                            r={radius * 1.5}
                            fill={color}
                            opacity={isHovered ? "0.35" : "0.15"}
                            filter={isHovered ? "url(#glow)" : undefined}
                          />
                        )}

                        {/* Círculo Principal de Estado */}
                        <circle
                          r={radius}
                          fill={color}
                          stroke={isSelected ? '#ffffff' : (isDarkMode ? '#06140e' : '#ffffff')}
                          strokeWidth={isSelected ? "3" : "1.8"}
                          className="shadow-md"
                        />

                        {/* Etiqueta Código / Conteo */}
                        <text
                          textAnchor="middle"
                          dy="-2"
                          fontSize={radius > 16 ? "10" : "8"}
                          fontWeight="900"
                          fill="#ffffff"
                          pointerEvents="none"
                        >
                          {st.codigo}
                        </text>
                        <text
                          textAnchor="middle"
                          dy="9"
                          fontSize={radius > 16 ? "9" : "7"}
                          fontWeight="bold"
                          fill="#ffffff"
                          opacity="0.95"
                          pointerEvents="none"
                        >
                          {count}
                        </text>

                        {/* Etiqueta flotante con nombre de estado */}
                        {(isHovered || isSelected) && (
                          <g transform={`translate(0, ${-radius - 10})`}>
                            <rect
                              x="-60"
                              y="-20"
                              width="120"
                              height="22"
                              rx="6"
                              fill={isDarkMode ? '#0a1f17' : '#ffffff'}
                              stroke={color}
                              strokeWidth="1.5"
                              filter="url(#glow)"
                            />
                            <text
                              textAnchor="middle"
                              y="-5"
                              fontSize="10"
                              fontWeight="bold"
                              fill={isDarkMode ? '#ffffff' : '#0b3d2e'}
                            >
                              {st.nombre} ({st.total} veh)
                            </text>
                          </g>
                        )}
                      </g>
                    );
                  })}
                </g>
              )}
            </svg>
          </div>

          {/* Tooltip de Centro de Servicios hover */}
          {hoveredCs && (
            <div className={`absolute bottom-3 left-3 z-20 p-3 rounded-xl border shadow-lg text-xs pointer-events-none transition-all ${
              isDarkMode ? 'bg-[#0a1f17]/95 border-[#c9a227] text-white' : 'bg-white/95 border-emerald-300 text-slate-800'
            }`}>
              {(() => {
                const item = csStats.find(c => c.codigo === hoveredCs);
                if (!item) return null;
                return (
                  <div>
                    <div className="font-bold flex items-center gap-1.5 text-xs text-[#c9a227]">
                      <MapPin className="w-3.5 h-3.5" />
                      <span>{item.codigo}: {item.nombre}</span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      Estado: <strong className="text-white dark:text-emerald-300">{item.estado_nombre}</strong> ({item.region_nombre})
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5 truncate max-w-xs">
                      {item.municipio}
                    </div>
                    <div className="mt-1.5 pt-1.5 border-t border-slate-200 dark:border-[#1a5f47] flex gap-3 text-[11px]">
                      <span>Vehículos Asignados: <strong className="text-emerald-400 font-mono">{item.totalVehiculos}</strong></span>
                      <span>Operativos: <strong className="text-emerald-400 font-mono">{item.activos}</strong></span>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
        </div>

        {/* Panel Lateral: Ficha Detallada del Estado o Ranking de Densidad */}
        <div className={`p-4 rounded-2xl border flex flex-col justify-between space-y-4 ${
          isDarkMode ? 'bg-[#13382b]/70 border-[#1a5f47]' : 'bg-slate-50 border-slate-200'
        }`}>
          {selectedStateData ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-[#1a5f47]">
                <div>
                  <span className="text-[10px] font-mono font-bold text-[#c9a227] uppercase">Ficha Geográfica</span>
                  <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                    <span>{selectedStateData.nombre}</span>
                    <span className="text-xs font-mono px-1.5 py-0.5 rounded bg-[#0b3d2e] text-white">
                      {selectedStateData.codigo}
                    </span>
                  </h3>
                </div>
                <button
                  onClick={() => setActiveStateDetails(null)}
                  className="text-slate-400 hover:text-slate-700 dark:hover:text-white text-xs cursor-pointer"
                  title="Volver a ranking general"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Región CORPOELEC:</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">{selectedStateData.region}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Capital / Sede:</span>
                  <span className="font-semibold truncate max-w-[140px]">{selectedStateData.capital}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Centros de Servicios:</span>
                  <span className="font-mono font-bold">{selectedStateData.centrosCount} CS oficiales</span>
                </div>
              </div>

              {/* Indicadores de Flota en el Estado */}
              <div className="p-3 rounded-xl bg-white dark:bg-[#0a1f17] border border-slate-200 dark:border-[#1a5f47] space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="font-bold text-slate-600 dark:text-slate-300">Total Parque Vehicular:</span>
                  <span className="text-base font-black font-mono text-[#0b3d2e] dark:text-[#c9a227]">
                    {selectedStateData.total}
                  </span>
                </div>

                <div className="space-y-1 pt-1">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-emerald-600 flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      En Servicio (Activos):
                    </span>
                    <span className="font-mono font-bold">{selectedStateData.activos}</span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-amber-600 flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                      En Taller (Mantenimiento):
                    </span>
                    <span className="font-mono font-bold">{selectedStateData.mantenimiento}</span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-red-600 flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-red-500"></span>
                      Fuera de Servicio:
                    </span>
                    <span className="font-mono font-bold">{selectedStateData.fueraServicio}</span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-blue-600 flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                      Recuperados (Plan Soberanía):
                    </span>
                    <span className="font-mono font-bold">{selectedStateData.recuperados}</span>
                  </div>
                </div>

                {selectedStateData.total > 0 && (
                  <div className="mt-2 pt-2 border-t border-slate-100 dark:border-[#1a5f47]/50 text-[10px] text-slate-400">
                    Disponibilidad: <strong className="text-emerald-600 dark:text-emerald-400">
                      {Math.round((selectedStateData.activos / selectedStateData.total) * 100)}%
                    </strong>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-200 dark:border-[#1a5f47]">
                <ShieldCheck className="w-4 h-4 text-[#c9a227]" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-white">
                  Top Estados por Densidad
                </h3>
              </div>

              {topStates.length > 0 ? (
                <div className="space-y-2">
                  {topStates.map((st, idx) => {
                    const pct = Math.round((st.total / (vehicles.length || 1)) * 100);
                    return (
                      <div
                        key={st.nombre}
                        onClick={() => setActiveStateDetails(st.nombre)}
                        className={`p-2 rounded-xl border transition-all cursor-pointer ${
                          isDarkMode 
                            ? 'bg-[#0a1f17] border-[#1a5f47] hover:border-[#c9a227]' 
                            : 'bg-white border-slate-200 hover:border-emerald-400 hover:shadow-xs'
                        }`}
                      >
                        <div className="flex items-center justify-between text-xs font-bold">
                          <span className="flex items-center gap-1.5">
                            <span className="text-[10px] font-mono text-slate-400">#{idx + 1}</span>
                            <span>{st.nombre}</span>
                          </span>
                          <span className="font-mono text-emerald-600 dark:text-emerald-400">
                            {st.total} veh
                          </span>
                        </div>
                        <div className="flex justify-between text-[10px] text-slate-500 mt-0.5">
                          <span>{st.region}</span>
                          <span>{pct}% del parque</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-xs text-slate-400 py-6 text-center">
                  Haz clic en un estado del mapa para visualizar su desglose operativo.
                </div>
              )}
            </div>
          )}

          {/* Indicador de ayuda */}
          <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-[11px] text-amber-900 dark:text-amber-200 flex items-start gap-2">
            <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span>
              Pasa el cursor sobre los nodos o centros de servicios para consultar su asignación técnica.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
