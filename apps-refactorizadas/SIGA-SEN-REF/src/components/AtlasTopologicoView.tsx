import React, { useState, useRef, useEffect } from 'react';
import { SubestacionMaster, SubestacionEstructura, ComponentePatio } from '../types/sigad';
import {
  Layers,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Sliders,
  Crosshair,
  X,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Zap,
} from 'lucide-react';

interface Props {
  subestacion: SubestacionMaster;
  estructura: SubestacionEstructura | null;
  onSelectComponent: (comp: ComponentePatio) => void;
}

export const AtlasTopologicoView: React.FC<Props> = ({
  subestacion,
  estructura,
  onSelectComponent,
}) => {
  const CANVAS_W = 960;
  const CANVAS_H = 480;

  const [viewBox, setViewBox] = useState({ x: 0, y: 0, w: CANVAS_W, h: CANVAS_H });
  const viewBoxRef = useRef({ x: 0, y: 0, w: CANVAS_W, h: CANVAS_H });
  const animFrameRef = useRef<number | null>(null);

  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [compEnfocado, setCompEnfocado] = useState<{ comp: ComponentePatio; cx: number; cy: number } | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    viewBoxRef.current = viewBox;
  }, [viewBox]);

  useEffect(() => {
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  if (!estructura || estructura.bahias.length === 0) {
    return (
      <div className="glass-panel p-12 text-center text-slate-400 space-y-3">
        <Layers className="w-12 h-12 text-cyan-500/40 mx-auto" />
        <h3 className="text-base font-bold text-white">Sin Estructura Generada para el Atlas</h3>
        <p className="text-xs max-w-md mx-auto">
          Para proyectar el diagrama unifilar del Atlas Topológico SEN, primero debe registrar o auto-generar el esqueleto de bahías de esta subestación.
        </p>
      </div>
    );
  }

  // Extraer componentes clave de las bahías
  const trafoBays = estructura.bahias.filter((b) => b.tipo_bahia === 'TRANSFORMACION_AT');
  const barraBay = estructura.bahias.find((b) => b.tipo_bahia === 'BARRAS_MT');
  const circuitoBays = estructura.bahias.filter((b) => b.tipo_bahia === 'CIRCUITO_SALIDA');

  const getStatusColor = (estado?: string) => {
    switch (estado) {
      case 'INDISPONIBLE_FALLADO':
        return '#ef4444'; // Red
      case 'EN_OBSERVACION':
        return '#f59e0b'; // Amber
      default:
        return '#10b981'; // Green
    }
  };

  const factorMagnificacion = Math.round((CANVAS_W / viewBox.w) * 10) / 10;

  // Tipografía adaptativa que disminuye suavemente en SVG a medida que se hace zoom
  const getTamanoTexto = (tamanoBase: number, potencia = 0.5) => {
    if (factorMagnificacion <= 1.1) return tamanoBase;
    const factor = Math.pow(factorMagnificacion, potencia);
    return Math.max(tamanoBase * 0.25, Number((tamanoBase / factor).toFixed(2)));
  };

  const getOffsetTexto = (offsetBase: number, potencia = 0.4) => {
    if (factorMagnificacion <= 1.1) return offsetBase;
    const factor = Math.pow(factorMagnificacion, potencia);
    return Math.max(2, Number((offsetBase / factor).toFixed(2)));
  };

  // Animación cúbica suave para enfocar y hacer zoom en el elemento
  const animarViewBox = (
    target: { x: number; y: number; w: number; h: number },
    duracionMs = 400
  ) => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);

    const start = { ...viewBoxRef.current };
    const startTime = performance.now();

    const pasoAnim = (now: number) => {
      const transcurrido = now - startTime;
      const t = Math.min(1, transcurrido / duracionMs);
      const ease = 1 - Math.pow(1 - t, 3); // ease-out cubic

      const nuevoVb = {
        x: start.x + (target.x - start.x) * ease,
        y: start.y + (target.y - start.y) * ease,
        w: start.w + (target.w - start.w) * ease,
        h: start.h + (target.h - start.h) * ease,
      };

      setViewBox(nuevoVb);
      viewBoxRef.current = nuevoVb;

      if (t < 1) {
        animFrameRef.current = requestAnimationFrame(pasoAnim);
      } else {
        animFrameRef.current = null;
      }
    };

    animFrameRef.current = requestAnimationFrame(pasoAnim);
  };

  // Enfocar un elemento con zoom cercano en el diagrama
  const enfocarElemento = (comp: ComponentePatio, cx: number, cy: number, zoomW = 340, zoomH = 190) => {
    setCompEnfocado({ comp, cx, cy });

    const targetX = Math.max(0, Math.min(CANVAS_W - zoomW, cx - zoomW / 2));
    const targetY = Math.max(0, Math.min(CANVAS_H - zoomH, cy - zoomH / 2));

    animarViewBox({ x: targetX, y: targetY, w: zoomW, h: zoomH }, 450);
  };

  // Zoom general in/out
  const handleZoom = (factor: number) => {
    const prev = viewBoxRef.current;
    const newW = Math.max(180, Math.min(CANVAS_W, prev.w * factor));
    const newH = Math.max(100, Math.min(CANVAS_H, prev.h * factor));
    const cx = prev.x + prev.w / 2;
    const cy = prev.y + prev.h / 2;

    const target = {
      x: Math.max(0, Math.min(CANVAS_W - newW, cx - newW / 2)),
      y: Math.max(0, Math.min(CANVAS_H - newH, cy - newH / 2)),
      w: newW,
      h: newH,
    };
    animarViewBox(target, 250);
  };

  // Restablecer a vista completa de la subestación
  const resetView = () => {
    setCompEnfocado(null);
    animarViewBox({ x: 0, y: 0, w: CANVAS_W, h: CANVAS_H }, 500);
  };

  // Arrastre fluido (Pan)
  const handleMouseDown = (e: React.MouseEvent) => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const scaleX = viewBox.w / rect.width;
    const scaleY = viewBox.h / rect.height;
    const dx = (e.clientX - dragStart.x) * scaleX;
    const dy = (e.clientY - dragStart.y) * scaleY;

    const nuevoVb = {
      ...viewBox,
      x: Math.max(0, Math.min(CANVAS_W - viewBox.w, viewBox.x - dx)),
      y: Math.max(0, Math.min(CANVAS_H - viewBox.h, viewBox.y - dy)),
    };
    setViewBox(nuevoVb);
    viewBoxRef.current = nuevoVb;
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Zoom interactivo con rueda del ratón
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (!containerRef.current) return;
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);

    const rect = containerRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const currentVb = viewBoxRef.current;
    const svgX = currentVb.x + (mouseX / rect.width) * currentVb.w;
    const svgY = currentVb.y + (mouseY / rect.height) * currentVb.h;

    const zoomFactor = e.deltaY < 0 ? 0.8 : 1.25;
    const newW = Math.max(160, Math.min(CANVAS_W, currentVb.w * zoomFactor));
    const newH = Math.max(90, Math.min(CANVAS_H, currentVb.h * zoomFactor));

    const newX = Math.max(0, Math.min(CANVAS_W - newW, svgX - (mouseX / rect.width) * newW));
    const newY = Math.max(0, Math.min(CANVAS_H - newH, svgY - (mouseY / rect.height) * newH));

    const nuevoVb = { x: newX, y: newY, w: newW, h: newH };
    setViewBox(nuevoVb);
    viewBoxRef.current = nuevoVb;
  };

  return (
    <div className="glass-panel p-6 space-y-6">
      {/* Cabecera del Visor Atlas */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-sky-950">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
              ATLAS DIGITAL CADAFE / SEN
            </span>
            <span className="text-xs text-slate-400 font-mono">
              IEC 81346 · RDS-PS · UNIFILAR VIVO
            </span>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
              ZOOM {factorMagnificacion}×
            </span>
          </div>
          <h2 className="text-xl font-extrabold text-white mt-1">
            Proyección Topológica Unifilar: S/E {subestacion.nombre_se} ({subestacion.codigo})
          </h2>
          <p className="text-xs text-slate-400">
            Diagrama esquemático vectorial interactivo. Haga clic en cualquier equipo (interruptor, trafo, seccionador, reconectador) para zoom instantáneo y ficha de elemento con tipografía adaptativa.
          </p>
        </div>

        {/* Leyenda y Controles de Zoom */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-4 text-xs font-mono bg-slate-900/90 px-3 py-2 rounded-xl border border-sky-950">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
              En Servicio
            </span>
            <span className="flex items-center gap-1.5 text-rose-400">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse"></span>
              Indisponible
            </span>
            <span className="flex items-center gap-1.5 text-amber-400">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
              Alerta / Obs.
            </span>
          </div>

          <div className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-xl border border-sky-950">
            <button
              onClick={() => handleZoom(0.65)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
              title="Acercar (Zoom In)"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleZoom(1.5)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
              title="Alejar (Zoom Out)"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              onClick={resetView}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
              title="Vista Completa (Reset)"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Lienzo del Diagrama Unifilar Interactivo (SVG) con ViewBox Dinámico */}
      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        className={`relative bg-slate-950/90 rounded-2xl border border-sky-950 p-6 overflow-hidden min-h-[500px] flex items-center justify-center select-none ${
          isDragging ? 'cursor-grabbing' : 'cursor-grab'
        }`}
      >
        <svg
          viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.w} ${viewBox.h}`}
          className="w-full h-full max-w-[960px] h-[480px]"
          preserveAspectRatio="xMidYMid meet"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Fondo cuadriculado de ingeniería */}
          <defs>
            <pattern id="grid-topologico" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(56, 189, 248, 0.05)" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="960" height="480" fill="url(#grid-topologico)" />

          {/* 1. Línea de Llegada AT */}
          <text
            x="480"
            y="24"
            fill="#38bdf8"
            fontSize={getTamanoTexto(11)}
            fontFamily="JetBrains Mono"
            textAnchor="middle"
            fontWeight="bold"
          >
            ⚡ LLEGADA LÍNEA DE TRANSMISIÓN ({subestacion.tension_entrada_kv || 115} kV)
          </text>
          <line x1="480" y1="32" x2="480" y2="70" stroke="#00d2ff" strokeWidth="3" />

          {/* 2. Bahías de Transformadores */}
          {trafoBays.map((bay, idx) => {
            const trafo = bay.componentes.find((c) => c.tipo_elemento === 'TRANSFORMADOR_POTENCIA');
            const disyuntor = bay.componentes.find((c) => c.tipo_elemento === 'DISYUNTOR_POTENCIA');
            const seccionador = bay.componentes.find((c) => c.tipo_elemento === 'SECCIONADOR');

            // Posicionamiento horizontal según si hay 1 o 2 trafos
            const x = trafoBays.length === 1 ? 480 : idx === 0 ? 320 : 640;

            const trafoColor = getStatusColor(trafo?.estado_operativo);
            const disyuntorColor = getStatusColor(disyuntor?.estado_operativo);
            const seccionadorColor = getStatusColor(seccionador?.estado_operativo);

            const isSecSelected = compEnfocado?.comp.id === seccionador?.id;
            const isDisSelected = compEnfocado?.comp.id === disyuntor?.id;
            const isTrafoSelected = compEnfocado?.comp.id === trafo?.id;

            return (
              <g key={bay.id}>
                {/* Enlace desde llegada central si hay 2 trafos */}
                {trafoBays.length > 1 && (
                  <path d={`M 480 70 L ${x} 70 L ${x} 80`} fill="none" stroke="#00d2ff" strokeWidth="2.5" />
                )}

                {/* Seccionador AT (S1) */}
                <g
                  onClick={(e) => {
                    e.stopPropagation();
                    if (seccionador) enfocarElemento(seccionador, x, 99);
                  }}
                  className="cursor-pointer group"
                >
                  {isSecSelected && (
                    <circle cx={x} cy="99" r="22" fill="#38bdf8" fillOpacity="0.15" stroke="#38bdf8" strokeWidth="2" strokeDasharray="4 2" />
                  )}
                  <circle cx={x} cy="90" r="4" fill={seccionadorColor} />
                  <line x1={x} y1="90" x2={x + 12} y2="104" stroke={seccionadorColor} strokeWidth="2.5" />
                  <circle cx={x} cy="108" r="4" fill={seccionadorColor} />
                  <text
                    x={x + getOffsetTexto(18)}
                    y="102"
                    fill={isSecSelected ? "#38bdf8" : "#94a3b8"}
                    fontSize={getTamanoTexto(10)}
                    fontFamily="JetBrains Mono"
                    fontWeight="bold"
                  >
                    {seccionador?.codigo_norma || 'S'}
                  </text>
                </g>

                <line x1={x} y1="112" x2={x} y2="130" stroke="#00d2ff" strokeWidth="2.5" />

                {/* Interruptor AT (D1) */}
                <g
                  onClick={(e) => {
                    e.stopPropagation();
                    if (disyuntor) enfocarElemento(disyuntor, x, 144);
                  }}
                  className="cursor-pointer group"
                >
                  {isDisSelected && (
                    <circle cx={x} cy="144" r="28" fill="#38bdf8" fillOpacity="0.15" stroke="#38bdf8" strokeWidth="2" strokeDasharray="4 2" />
                  )}
                  <rect x={x - 14} y="130" width="28" height="28" fill="#0f1d36" stroke={disyuntorColor} strokeWidth="2" rx="4" />
                  <path d={`M ${x - 8} ${x - 8} L ${x + 8} ${x + 8}`} stroke={disyuntorColor} strokeWidth="2" />
                  <text
                    x={x + getOffsetTexto(20)}
                    y="148"
                    fill={isDisSelected ? "#38bdf8" : "#94a3b8"}
                    fontSize={getTamanoTexto(10)}
                    fontFamily="JetBrains Mono"
                    fontWeight="bold"
                  >
                    {disyuntor?.codigo_norma || 'D'}
                  </text>
                </g>

                <line x1={x} y1="158" x2={x} y2="185" stroke="#00d2ff" strokeWidth="2.5" />

                {/* Transformador de Potencia TR-1 */}
                <g
                  onClick={(e) => {
                    e.stopPropagation();
                    if (trafo) enfocarElemento(trafo, x, 214);
                  }}
                  className="cursor-pointer group"
                >
                  {isTrafoSelected && (
                    <circle cx={x} cy="214" r="38" fill="#38bdf8" fillOpacity="0.15" stroke="#38bdf8" strokeWidth="2" strokeDasharray="4 2" />
                  )}
                  <circle cx={x} cy="202" r="18" fill="none" stroke={trafoColor} strokeWidth="3" />
                  <circle cx={x} cy="226" r="18" fill="none" stroke={trafoColor} strokeWidth="3" />
                  <text
                    x={x + getOffsetTexto(26)}
                    y="210"
                    fill={isTrafoSelected ? "#38bdf8" : "#f1f5f9"}
                    fontSize={getTamanoTexto(11)}
                    fontFamily="JetBrains Mono"
                    fontWeight="bold"
                  >
                    {trafo?.codigo_norma || 'TR'}
                  </text>
                  <text
                    x={x + getOffsetTexto(26)}
                    y="226"
                    fill="#38bdf8"
                    fontSize={getTamanoTexto(9.5)}
                    fontFamily="JetBrains Mono"
                  >
                    {trafo?.capacidad_mva ? `${trafo.capacidad_mva} MVA` : 'TR Potencia'}
                  </text>
                </g>

                <line x1={x} y1="244" x2={x} y2="280" stroke="#10b981" strokeWidth="2.5" />
              </g>
            );
          })}

          {/* 3. Barra Colectora MT */}
          <line x1="80" y1="280" x2="880" y2="280" stroke="#10b981" strokeWidth="6" strokeLinecap="round" />
          <text
            x="80"
            y="270"
            fill="#34d399"
            fontSize={getTamanoTexto(11)}
            fontFamily="JetBrains Mono"
            fontWeight="bold"
          >
            BARRA DE DISTRIBUCIÓN MT ({subestacion.tension_secundaria_kv || 13.8} kV)
          </text>

          {/* 4. Alimentadores / Circuitos de Salida */}
          {circuitoBays.map((bay, idx) => {
            const numCirc = Math.min(circuitoBays.length, 8);
            const spacing = 800 / (numCirc + 1);
            const cx = 80 + (idx + 1) * spacing;

            const rec = bay.componentes.find((c) => c.tipo_elemento === 'RECONECTADOR');
            const sec = bay.componentes.find((c) => c.tipo_elemento === 'SECCIONADOR');

            const recColor = getStatusColor(rec?.estado_operativo);
            const secColor = getStatusColor(sec?.estado_operativo);

            const isRecSelected = compEnfocado?.comp.id === rec?.id;
            const isSecOutSelected = compEnfocado?.comp.id === sec?.id;

            const ctoNombre = bay.nombre_bahia.replace('Bahía de Circuito: ', '').split('(')[0].trim();

            return (
              <g key={bay.id}>
                {/* Conexión desde barra */}
                <line x1={cx} y1="280" x2={cx} y2="310" stroke="#10b981" strokeWidth="2" />

                {/* Reconectador / Disyuntor de Salida */}
                <g
                  onClick={(e) => {
                    e.stopPropagation();
                    if (rec) enfocarElemento(rec, cx, 320);
                  }}
                  className="cursor-pointer group"
                >
                  {isRecSelected && (
                    <circle cx={cx} cy="320" r="22" fill="#38bdf8" fillOpacity="0.15" stroke="#38bdf8" strokeWidth="2" strokeDasharray="4 2" />
                  )}
                  <rect x={cx - 10} y="310" width="20" height="20" fill="#0f1d36" stroke={recColor} strokeWidth="2" rx="3" />
                  <text
                    x={cx + getOffsetTexto(14)}
                    y="324"
                    fill={isRecSelected ? "#38bdf8" : "#94a3b8"}
                    fontSize={getTamanoTexto(9)}
                    fontFamily="JetBrains Mono"
                    fontWeight="bold"
                  >
                    {rec?.codigo_norma || 'REC'}
                  </text>
                </g>

                <line x1={cx} y1="330" x2={cx} y2="350" stroke="#38bdf8" strokeWidth="2" />

                {/* Seccionador de Salida */}
                <g
                  onClick={(e) => {
                    e.stopPropagation();
                    if (sec) enfocarElemento(sec, cx, 363);
                  }}
                  className="cursor-pointer group"
                >
                  {isSecOutSelected && (
                    <circle cx={cx} cy="363" r="20" fill="#38bdf8" fillOpacity="0.15" stroke="#38bdf8" strokeWidth="2" strokeDasharray="4 2" />
                  )}
                  <circle cx={cx} cy="355" r="3" fill={secColor} />
                  <line x1={cx} y1="355" x2={cx + 8} y2="368" stroke={secColor} strokeWidth="2.5" />
                  <circle cx={cx} cy="372" r="3" fill={secColor} />
                </g>

                <line x1={cx} y1="375" x2={cx} y2="400" stroke="#38bdf8" strokeWidth="2" />

                {/* Flecha hacia la red y Etiqueta del Circuito */}
                <polygon points={`${cx - 5},400 ${cx + 5},400 ${cx},410`} fill="#38bdf8" />
                <text
                  x={cx}
                  y={426}
                  fill="#f1f5f9"
                  fontSize={getTamanoTexto(9)}
                  fontFamily="Inter"
                  textAnchor="middle"
                  fontWeight="600"
                  className="w-20"
                >
                  {ctoNombre.length > 14 ? `${ctoNombre.slice(0, 12)}..` : ctoNombre}
                </text>
              </g>
            );
          })}

          {/* Retícula Radar Focal sobre el elemento seleccionado */}
          {compEnfocado && (
            <g transform={`translate(${compEnfocado.cx}, ${compEnfocado.cy})`}>
              <circle r="30" fill="none" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="4 4" opacity="0.8" />
              <line x1="-38" y1="0" x2="-26" y2="0" stroke="#38bdf8" strokeWidth="2" />
              <line x1="26" y1="0" x2="38" y2="0" stroke="#38bdf8" strokeWidth="2" />
              <line x1="0" y1="-38" x2="0" y2="-26" stroke="#38bdf8" strokeWidth="2" />
              <line x1="0" y1="26" x2="0" y2="38" stroke="#38bdf8" strokeWidth="2" />
            </g>
          )}
        </svg>

        {/* Card Modal Flotante de Elemento Seleccionado con Zoom y Ficha */}
        {compEnfocado && (
          <div className="absolute bottom-4 right-4 w-80 bg-slate-900/95 border border-cyan-500/60 rounded-2xl p-4 shadow-2xl backdrop-blur-2xl z-40 animate-in fade-in slide-in-from-bottom-2">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-mono font-bold text-cyan-400 block uppercase tracking-wider">
                  {compEnfocado.comp.tipo_elemento.replace('_', ' ')}
                </span>
                <h3 className="text-base font-extrabold text-white mt-0.5">
                  {compEnfocado.comp.codigo_norma} · {compEnfocado.comp.nombre_equipo}
                </h3>
              </div>
              <button
                onClick={() => setCompEnfocado(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
                title="Cerrar Ficha"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-3 bg-slate-950 p-2.5 rounded-xl border border-sky-950 text-xs space-y-1 font-mono">
              <div className="flex justify-between">
                <span className="text-slate-400">Tensión Operativa:</span>
                <span className="text-cyan-300 font-bold">{compEnfocado.comp.tension_kv || subestacion.tension_entrada_kv} kV</span>
              </div>
              {compEnfocado.comp.capacidad_mva && (
                <div className="flex justify-between">
                  <span className="text-slate-400">Capacidad MVA:</span>
                  <span className="text-amber-400 font-bold">{compEnfocado.comp.capacidad_mva} MVA</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-slate-400">Estado Operativo:</span>
                <span
                  className="font-bold px-1.5 py-0.2 rounded"
                  style={{ color: getStatusColor(compEnfocado.comp.estado_operativo) }}
                >
                  {compEnfocado.comp.estado_operativo}
                </span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-sky-950 space-y-2">
              <button
                onClick={() => onSelectComponent(compEnfocado.comp)}
                className="w-full py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-cyan-950/60 transition-all"
              >
                <Sliders className="w-3.5 h-3.5" />
                Abrir Ficha Técnica y Editar
              </button>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => enfocarElemento(compEnfocado.comp, compEnfocado.cx, compEnfocado.cy, 240, 140)}
                  className="py-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 text-cyan-300 font-mono text-[11px] flex items-center justify-center gap-1 border border-sky-950 transition-all"
                >
                  <Crosshair className="w-3 h-3" />
                  Zoom Máximo
                </button>
                <button
                  onClick={resetView}
                  className="py-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-white font-mono text-[11px] flex items-center justify-center gap-1 border border-sky-950 transition-all"
                >
                  <RotateCcw className="w-3 h-3" />
                  Ver Todo
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between text-xs text-slate-400 font-mono pt-2">
        <span>💡 Haga clic en cualquier equipo del diagrama para enfocarlo automáticamente con zoom o arrastre para desplazarse libremente.</span>
        <span>Atlas CADAFE v2.0 · Proyección Automatizada</span>
      </div>
    </div>
  );
};
