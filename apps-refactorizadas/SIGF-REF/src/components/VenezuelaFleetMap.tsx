import React, { useState, useMemo } from 'react';
import { VehicleRecord } from '../types/fleet';
import { CORPOELEC_CENTROS_SERVICIOS, VENEZUELA_STATES } from '../data/venezuelaRegions';
import { STATE_COORDINATES, CS_COORDINATES, projectCoordinates } from '../data/venezuelaCoordinates';
import {
  VENEZUELA_MAINLAND,
  LAGO_MARACAIBO,
  ORINOCO_RIVER,
  ORINOCO_DELTA,
  AGUA_LABELS,
  RIO_LABELS,
  VECINOS,
  SOBERANIA_LABELS,
  MERIDIANOS,
  PARALELOS,
  ENTITY_LABEL_ANCHORS,
  toSvgPath,
  toSmoothSvgPath,
  labelAt,
} from '../data/venezuelaGeoOutline';
import { MapPin, ZoomIn, ZoomOut, RotateCcw, Layers, Flag, ShieldCheck, Info } from 'lucide-react';

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
  /** Capa cartográfica: rótulos de la división político-territorial (visible por defecto). */
  const [showRotulos, setShowRotulos] = useState<boolean>(true);

  // Dimensiones del lienzo SVG base
  const svgWidth = 900;
  const svgHeight = 600;

  // Escala gráfica: 300 km expresados en píxeles del lienzo (latitud media ~7°N)
  // 110.48 km ≈ 1 grado de longitud a 7°N · 810 px ≈ 15.4° de longitud
  const escalaKm = 300;
  const escalaPx = Math.round((escalaKm / 110.48) * ((svgWidth * 0.9) / 15.4) * 10) / 10;

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

          {/* Capa cartográfica: rótulos político-territoriales */}
          <button
            onClick={() => setShowRotulos(prev => !prev)}
            aria-pressed={showRotulos}
            title={showRotulos ? 'Ocultar rótulos político-territoriales' : 'Mostrar rótulos político-territoriales'}
            className={`px-2.5 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              showRotulos
                ? 'bg-[#c9a227] text-[#0b3d2e] border-[#c9a227] shadow-xs'
                : isDarkMode
                  ? 'bg-[#13382b] border-[#1a5f47] text-slate-300 hover:border-[#c9a227]'
                  : 'bg-slate-100 border-slate-300 text-slate-600 hover:border-[#c9a227]'
            }`}
          >
            <Flag className="w-3.5 h-3.5" />
            <span>Rótulos</span>
          </button>
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
            <div className="flex items-center gap-2 pt-1 border-t border-slate-200 dark:border-[#1a5f47]">
              <span className="w-2.5 h-2.5 rounded-sm bg-emerald-300 dark:bg-[#2f8f6b] border border-[#0b3d2e] shrink-0"></span>
              <span>División político-territorial de Venezuela</span>
            </div>
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
                <filter id="reliefShadow" x="-25%" y="-25%" width="150%" height="150%">
                  <feDropShadow dx="0" dy="3" stdDeviation="3.5" floodColor="#000000" floodOpacity="0.22" />
                </filter>
                <linearGradient id="venezuelaLandGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor={isDarkMode ? '#14503c' : '#a7e8cd'} stopOpacity="0.95" />
                  <stop offset="100%" stopColor={isDarkMode ? '#0d3a2b' : '#86efac'} stopOpacity="0.95" />
                </linearGradient>
              </defs>

              {/* =================================================================
                  CAPA 0 · Retícula geográfica de referencia (graticule)
                  ================================================================= */}
              <g id="graticule" pointerEvents="none">
                {MERIDIANOS.map(lng => {
                  const a = projectCoordinates(12.8, lng, svgWidth, svgHeight);
                  const b = projectCoordinates(0.6, lng, svgWidth, svgHeight);
                  return (
                    <line
                      key={`m${lng}`}
                      x1={a.x} y1={a.y} x2={b.x} y2={b.y}
                      stroke={isDarkMode ? '#1a5f47' : '#0b3d2e'}
                      strokeOpacity="0.10" strokeWidth="0.7" strokeDasharray="2 6"
                    />
                  );
                })}
                {PARALELOS.map(lat => {
                  const a = projectCoordinates(lat, -73.6, svgWidth, svgHeight);
                  const b = projectCoordinates(lat, -58.2, svgWidth, svgHeight);
                  return (
                    <g key={`p${lat}`}>
                      <line
                        x1={a.x} y1={a.y} x2={b.x} y2={b.y}
                        stroke={isDarkMode ? '#1a5f47' : '#0b3d2e'}
                        strokeOpacity="0.10" strokeWidth="0.7" strokeDasharray="2 6"
                      />
                      <text x={a.x + 5} y={a.y - 4} fontSize="6.5" fontFamily="monospace"
                        fill={isDarkMode ? '#1a5f47' : '#0b3d2e'} opacity="0.40">
                        {lat}°N
                      </text>
                    </g>
                  );
                })}
              </g>

              {/* =================================================================
                  CAPA 1 · Entorno: países vecinos y masas de agua
                  ================================================================= */}
              <g id="entornos" pointerEvents="none">
                {VECINOS.map((v, i) => {
                  const lb = labelAt(v, svgWidth, svgHeight);
                  return (
                    <text key={`vecino-${i}`} x={lb.x} y={lb.y} textAnchor="middle" fontSize="8.5"
                      letterSpacing="2.2" fontWeight="700" fill={isDarkMode ? '#1f6f52' : '#6f9c88'} opacity="0.75">
                      {lb.texto}
                    </text>
                  );
                })}
                {AGUA_LABELS.map((a, i) => {
                  const lb = labelAt(a, svgWidth, svgHeight);
                  return (
                    <text key={`agua-${i}`} x={lb.x} y={lb.y} textAnchor="middle" fontSize="8.5"
                      fontStyle="italic" letterSpacing="2.4" fontWeight="600"
                      fill={isDarkMode ? '#1c7c63' : '#3b82a6'} opacity="0.6">
                      {lb.texto}
                    </text>
                  );
                })}
              </g>

              {/* =================================================================
                  CAPA 2 · Territorio de la República (contorno georreferenciado)
                  ================================================================= */}
              <g id="venezuela-land-outline">
                {/* Relieve: sombra proyectada bajo la masa continental */}
                <path
                  d={toSmoothSvgPath(VENEZUELA_MAINLAND, svgWidth, svgHeight, true, 0.85)}
                  fill="#000000"
                  opacity={isDarkMode ? 0.4 : 0.12}
                  filter="url(#reliefShadow)"
                  transform="translate(2,5)"
                />

                {/* Masa continental — tratamiento político uniforme */}
                <path
                  d={toSmoothSvgPath(VENEZUELA_MAINLAND, svgWidth, svgHeight, true, 0.85)}
                  fill="url(#venezuelaLandGradient)"
                  stroke={isDarkMode ? '#3ba57c' : '#0b3d2e'}
                  strokeWidth="2.4"
                  strokeLinejoin="round"
                />

                {/* Delta del Orinoco */}
                <path
                  d={toSvgPath(ORINOCO_DELTA, svgWidth, svgHeight, true)}
                  fill={isDarkMode ? '#0e4a39' : '#a7e8cd'}
                  fillOpacity="0.55"
                  stroke={isDarkMode ? '#2f8f6b' : '#0b3d2e'}
                  strokeWidth="0.8" strokeOpacity="0.5" strokeDasharray="3 2"
                />

                {/* Lago de Maracaibo */}
                <path
                  d={toSmoothSvgPath(LAGO_MARACAIBO, svgWidth, svgHeight, true, 0.7)}
                  fill={isDarkMode ? '#05130d' : '#f0fdfa'}
                  stroke={isDarkMode ? '#2f8f6b' : '#0b3d2e'}
                  strokeWidth="1" strokeOpacity="0.55"
                />

                {/* Eje del Río Orinoco (línea de vida eléctrica del SEN) */}
                <path
                  d={toSmoothSvgPath(ORINOCO_RIVER, svgWidth, svgHeight, false, 0.9)}
                  fill="none"
                  stroke={isDarkMode ? '#10b981' : '#059669'}
                  strokeWidth="1.6" strokeDasharray="5 4" strokeOpacity="0.55" strokeLinecap="round"
                />
                {(() => {
                  const lb = labelAt(RIO_LABELS[0], svgWidth, svgHeight);
                  return (
                    <text x={lb.x} y={lb.y} fontSize="8.5" fontStyle="italic" fontWeight="600"
                      fill={isDarkMode ? '#6ee7b7' : '#047857'} opacity="0.75"
                      transform={`rotate(${lb.rot} ${lb.x} ${lb.y})`}>
                      {lb.texto}
                    </text>
                  );
                })()}
                {(() => {
                  const lb = labelAt(RIO_LABELS[1], svgWidth, svgHeight);
                  return (
                    <text x={lb.x} y={lb.y} fontSize="8" fontStyle="italic" fontWeight="600" textAnchor="middle"
                      fill={isDarkMode ? '#6ee7b7' : '#047857'} opacity="0.75"
                      transform={`rotate(${lb.rot} ${lb.x} ${lb.y})`}>
                      {lb.texto}
                    </text>
                  );
                })()}

                {/* Marca de agua cartográfica: rotulación interior de soberanía */}
                {SOBERANIA_LABELS.map((s, i) => {
                  const lb = labelAt(s, svgWidth, svgHeight);
                  const principal = lb.texto === 'VENEZUELA';
                  return (
                    <text key={`sober-${i}`} x={lb.x} y={lb.y} textAnchor="middle"
                      fontSize={principal ? '23' : '12'}
                      fontWeight="900"
                      letterSpacing={principal ? '7' : '4.5'}
                      fill={isDarkMode ? '#2f8f6b' : '#0b3d2e'}
                      opacity={principal ? 0.11 : 0.16}
                      pointerEvents="none">
                      {lb.texto}
                    </text>
                  );
                })}
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

                        {/* Rótulo político-territorial permanente (mapa geopolítico).
                            Idéntico tratamiento tipográfico para las 25 entidades. */}
                        {showRotulos && (() => {
                          const anchor = ENTITY_LABEL_ANCHORS[st.codigo] ?? {
                            dx: 0,
                            dy: radius + 12,
                            anchor: 'middle' as const,
                          };
                          const nombre = st.codigo === 'CCS'
                            ? '★ CARACAS'
                            : st.nombre.replace(/^Estado\s+/i, '').toUpperCase();
                          const fontSize = st.codigo === 'CCS' ? 7.6
                            : nombre.length > 13 ? 6.1
                            : nombre.length > 10 ? 6.6
                            : 7.2;
                          const halo = isDarkMode ? '#04120c' : '#ffffff';
                          const tinta = isDarkMode ? '#d1fae5' : '#06301f';

                          return (
                            <g transform={`translate(${anchor.dx}, ${anchor.dy})`} pointerEvents="none">
                              {anchor.leader && (
                                <line
                                  x1={-anchor.dx}
                                  y1={-anchor.dy}
                                  x2="0"
                                  y2="0"
                                  stroke={isDarkMode ? '#7dd3a8' : '#0b3d2e'}
                                  strokeWidth="0.7"
                                  strokeOpacity="0.55"
                                  strokeDasharray="2 2"
                                />
                              )}
                              <text
                                textAnchor={anchor.anchor ?? 'middle'}
                                fontSize={fontSize}
                                fontWeight="800"
                                letterSpacing="0.5"
                                fill={tinta}
                                stroke={halo}
                                strokeWidth="2.4"
                                strokeLinejoin="round"
                                paintOrder="stroke"
                              >
                                {nombre}
                              </text>
                            </g>
                          );
                        })()}

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

              {/* =================================================================
                  CAPA 4 · Elementos cartográficos: rosa de los vientos y escala
                  ================================================================= */}
              <g id="cartografia" pointerEvents="none">
                {/* Rosa de los vientos */}
                <g transform={`translate(${svgWidth - 52}, 58)`}>
                  <circle
                    r="20"
                    fill={isDarkMode ? '#0a1f17' : '#ffffff'} fillOpacity="0.72"
                    stroke={isDarkMode ? '#1a5f47' : '#0b3d2e'} strokeOpacity="0.35" strokeWidth="0.8"
                  />
                  <path d="M 0,-14 L 4.5,0 L 0,14 L -4.5,0 Z" fill="#0b3d2e" opacity="0.26" />
                  <path d="M 0,-14 L 4.5,0 L 0,0 Z" fill={isDarkMode ? '#2f8f6b' : '#0b3d2e'} />
                  <path d="M 0,-14 L -4.5,0 L 0,0 Z" fill={isDarkMode ? '#0d2d20' : '#2f8f6b'} />
                  <path d="M 0,-14 L 0,-19" stroke={isDarkMode ? '#2f8f6b' : '#0b3d2e'} strokeWidth="1.2" />
                  <text y="-22" textAnchor="middle" fontSize="9.5" fontWeight="900"
                    fill={isDarkMode ? '#2f8f6b' : '#0b3d2e'}>
                    N
                  </text>
                  <text y="26" textAnchor="middle" fontSize="6.5" fontWeight="700"
                    fill={isDarkMode ? '#2f8f6b' : '#0b3d2e'} opacity="0.7">
                    S
                  </text>
                </g>

                {/* Escala gráfica (tres divisiones de 100 km) */}
                <g transform={`translate(${svgWidth - 60 - escalaPx}, ${svgHeight - 46})`}>
                  <rect x="0" y="0" width={escalaPx / 3} height="5"
                    fill={isDarkMode ? '#2f8f6b' : '#0b3d2e'} opacity="0.75" />
                  <rect x={escalaPx / 3} y="0" width={escalaPx / 3} height="5" fill="none"
                    stroke={isDarkMode ? '#2f8f6b' : '#0b3d2e'} strokeWidth="0.9" opacity="0.75" />
                  <rect x={(escalaPx / 3) * 2} y="0" width={escalaPx / 3} height="5"
                    fill={isDarkMode ? '#2f8f6b' : '#0b3d2e'} opacity="0.75" />
                  <text x="0" y="-4" fontSize="7" fontFamily="monospace"
                    fill={isDarkMode ? '#2f8f6b' : '#0b3d2e'} opacity="0.8">
                    0
                  </text>
                  <text x={escalaPx} y="-4" fontSize="7" fontFamily="monospace" textAnchor="end"
                    fill={isDarkMode ? '#2f8f6b' : '#0b3d2e'} opacity="0.8">
                    {escalaKm} km
                  </text>
                </g>
              </g>
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
