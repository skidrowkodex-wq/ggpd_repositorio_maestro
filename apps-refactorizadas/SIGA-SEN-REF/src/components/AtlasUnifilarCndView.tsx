import React, { useState, useRef, useEffect } from 'react';
import { sigaSenService } from '../services/sigaSenService';
import { SubestacionSigaSen } from '../types/sigaSen';
import { ZoomIn, ZoomOut, RotateCcw, Search, Zap, Crosshair, X, Layers, Activity, Type, Sun, Moon } from 'lucide-react';

interface ElementoActivo {
  tipo: 'NODO' | 'GENERADOR' | 'TRANSFORMADOR' | 'BARRA';
  nodo: SubestacionSigaSen;
  id?: string | number;
  cx: number;
  cy: number;
  titulo: string;
  subtitulo: string;
  capacidadTexto?: string;
  detalles: Array<{ label: string; valor: string }>;
}

export const AtlasUnifilarCndView: React.FC = () => {
  const SVG_TOTAL_W = 5669.25;
  const SVG_TOTAL_H = 3146.25;

  // ViewBox Dinámico: controla matemáticamente la cámara y el zoom en unidades nativas SVG
  const [viewBox, setViewBox] = useState({
    x: 0,
    y: 0,
    w: SVG_TOTAL_W,
    h: SVG_TOTAL_H,
  });

  const viewBoxRef = useRef({ x: 0, y: 0, w: SVG_TOTAL_W, h: SVG_TOTAL_H });
  const animFrameRef = useRef<number | null>(null);

  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [filtroKv, setFiltroKv] = useState<string>('TODOS');
  const [elementoActivo, setElementoActivo] = useState<ElementoActivo | null>(null);
  const [busqueda, setBusqueda] = useState('');

  // Modo de Fondo / Visualización del Diagrama (Por defecto 'claro' / Blanco Papel Técnico CND)
  const [temaFondo, setTemaFondo] = useState<'claro' | 'oscuro'>('claro');

  // Factor de escala de tipografía (100% estándar de fábrica)
  const [factorEscalaTexto, setFactorEscalaTexto] = useState<number>(1.0);

  const containerRef = useRef<HTMLDivElement>(null);

  const subestaciones = sigaSenService.getSubestaciones();
  const lineas = sigaSenService.getLineas(filtroKv !== 'TODOS' ? parseFloat(filtroKv) : undefined);
  const niveles = sigaSenService.getNivelesTension();

  // Mantener sincronizado el ref del viewBox
  useEffect(() => {
    viewBoxRef.current = viewBox;
  }, [viewBox]);

  // Limpiar animación al desmontar
  useEffect(() => {
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  // Nivel de magnificación aproximado
  const nivelZoomActual = Math.round((SVG_TOTAL_W / viewBox.w) * 10) / 10;

  // ==============================================================================
  // ⚡ TIPOGRAFÍA ADAPTATIVA INTERMEDIA CALIBRADA
  // Al aumentar el zoom vectorial, el tamaño de las letras disminuye suavemente
  // en un rango intermedio (~25% a 40%) para conservar alta legibilidad y nitidez
  // sin desbordarse ni verse diminutas.
  // ==============================================================================
  const getTamanoTexto = (tamanoBase: number, potencia = 0.22) => {
    const baseAjustada = tamanoBase * factorEscalaTexto;
    if (nivelZoomActual <= 1.1) return baseAjustada;
    const atenuacion = Math.pow(nivelZoomActual, potencia);
    return Math.max(baseAjustada * 0.45, Number((baseAjustada / atenuacion).toFixed(2)));
  };

  const getGrosorBordeTexto = (grosorBase: number, potencia = 0.24) => {
    if (nivelZoomActual <= 1.1) return grosorBase;
    const atenuacion = Math.pow(nivelZoomActual, potencia);
    return Math.max(0.8, Number((grosorBase / atenuacion).toFixed(2)));
  };

  const getOffsetTexto = (offsetBase: number, potencia = 0.16) => {
    if (nivelZoomActual <= 1.1) return offsetBase;
    const atenuacion = Math.pow(nivelZoomActual, potencia);
    return Math.max(8, Number((offsetBase / atenuacion).toFixed(2)));
  };

  // Paleta cromática por nivel de tensión según el tema del lienzo
  const getColorTension = (kv: number, colorOriginal?: string) => {
    if (temaFondo === 'oscuro') {
      // SCADA Oscuro: contraste de alta luminiscencia para fondo oscuro
      if (kv === 69 || colorOriginal === '#000000' || colorOriginal === '#000') return '#e2e8f0'; // Plata Titanio
      if (kv === 115 || colorOriginal === '#0000FF' || colorOriginal === '#00F') return '#38bdf8'; // Celeste Eléctrico
      if (kv === 138) return '#ff00ff'; // Fucsia
      if (kv === 230) return '#ff0000'; // Rojo
      if (kv === 400) return '#00c700'; // Verde
      if (kv === 765) return '#ffa100'; // Naranja
      return colorOriginal || '#e2e8f0';
    } else {
      // Lienzo Blanco (Oficial CND): colores normativos con máximo contraste en papel claro
      if (kv === 69 || colorOriginal === '#000000' || colorOriginal === '#000') return '#000000'; // Negro puro CND (21:1)
      if (kv === 115 || colorOriginal === '#0000FF' || colorOriginal === '#00F') return '#0038a8'; // Azul Marino Eléctrico CND
      if (kv === 138) return '#c026d3'; // Magenta CAD
      if (kv === 230) return '#dc2626'; // Rojo señal CND
      if (kv === 400) return '#16a34a'; // Verde CND
      if (kv === 765) return '#d97706'; // Ámbar / Naranja CND
      return colorOriginal || '#000000';
    }
  };

  // Transición suave animada del ViewBox con física cúbica Ease-Out
  const animarViewBox = (
    target: { x: number; y: number; w: number; h: number },
    duracionMs = 450
  ) => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);

    const start = { ...viewBoxRef.current };
    const startTime = performance.now();

    const pasoAnim = (now: number) => {
      const transcurrido = now - startTime;
      const t = Math.min(1, transcurrido / duracionMs);
      const ease = 1 - Math.pow(1 - t, 3);

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

  // Enfocar directamente y con zoom de precisión sobre cualquier elemento o nodo
  const enfocarElemento = (
    elem: ElementoActivo,
    zoomW = 420,
    zoomH = 260,
    duracion = 500
  ) => {
    setElementoActivo(elem);
    const targetX = Math.max(0, Math.min(SVG_TOTAL_W - zoomW, elem.cx - zoomW / 2));
    const targetY = Math.max(0, Math.min(SVG_TOTAL_H - zoomH, elem.cy - zoomH / 2));

    animarViewBox({ x: targetX, y: targetY, w: zoomW, h: zoomH }, duracion);
  };

  // Enfocar Nodo / Subestación completa
  const enfocarNodo = (s: SubestacionSigaSen, zoomW = 750, zoomH = 460) => {
    const elem: ElementoActivo = {
      tipo: 'NODO',
      nodo: s,
      id: s.codigo,
      cx: s.coord_x,
      cy: s.coord_y,
      titulo: s.nombre_norm,
      subtitulo: s.clasificacion.replace('_', ' '),
      capacidadTexto: s.capacidad_mw > 0 ? `${s.capacidad_mw} MW` : `${s.capacidad_mva} MVA`,
      detalles: [
        { label: 'Tensiones', valor: s.tensiones_lista },
        { label: 'Región CND', valor: s.cuadrante },
        { label: 'Barras de Patio', valor: `${s.total_barras} tramos` },
        { label: 'Generadores', valor: `${s.generacion.length} grupos` },
        { label: 'Transformadores', valor: `${s.transformadores.length} bancos` },
      ],
    };
    enfocarElemento(elem, zoomW, zoomH, 500);
  };

  // Zoom In / Out incremental con animación
  const handleZoom = (factor: number) => {
    const prev = viewBoxRef.current;
    const newW = Math.max(250, Math.min(SVG_TOTAL_W, prev.w * factor));
    const newH = Math.max(150, Math.min(SVG_TOTAL_H, prev.h * factor));
    const cx = prev.x + prev.w / 2;
    const cy = prev.y + prev.h / 2;

    const target = {
      x: Math.max(0, Math.min(SVG_TOTAL_W - newW, cx - newW / 2)),
      y: Math.max(0, Math.min(SVG_TOTAL_H - newH, cy - newH / 2)),
      w: newW,
      h: newH,
    };
    animarViewBox(target, 250);
  };

  // Restablecer a la vista general completa del país
  const resetView = () => {
    setElementoActivo(null);
    animarViewBox({ x: 0, y: 0, w: SVG_TOTAL_W, h: SVG_TOTAL_H }, 600);
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
      x: Math.max(0, Math.min(SVG_TOTAL_W - viewBox.w, viewBox.x - dx)),
      y: Math.max(0, Math.min(SVG_TOTAL_H - viewBox.h, viewBox.y - dy)),
    };
    setViewBox(nuevoVb);
    viewBoxRef.current = nuevoVb;
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Zoom interactivo con la rueda del ratón centrado exactamente sobre el cursor
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

    const zoomFactor = e.deltaY < 0 ? 0.82 : 1.22;
    const newW = Math.max(220, Math.min(SVG_TOTAL_W, currentVb.w * zoomFactor));
    const newH = Math.max(130, Math.min(SVG_TOTAL_H, currentVb.h * zoomFactor));

    const newX = Math.max(0, Math.min(SVG_TOTAL_W - newW, svgX - (mouseX / rect.width) * newW));
    const newY = Math.max(0, Math.min(SVG_TOTAL_H - newH, svgY - (mouseY / rect.height) * newH));

    const nuevoVb = { x: newX, y: newY, w: newW, h: newH };
    setViewBox(nuevoVb);
    viewBoxRef.current = nuevoVb;
  };

  // Nodos visibles según filtro de tensión
  const nodosVisibles = subestaciones.filter((s) => {
    if (filtroKv !== 'TODOS') {
      const targetKv = parseFloat(filtroKv);
      return s.barras.some((b) => Math.abs(b.tension_kv - targetKv) < 2);
    }
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Barra de Controles Superiores */}
      <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm dark:shadow-xl flex flex-wrap items-center justify-between gap-4 transition-colors">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <h2 className="text-lg font-black text-slate-900 dark:text-white">Atlas Unifilar Nacional CND (Mayo 2025)</h2>
            <span className="text-[10px] font-mono font-bold bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded">
              ZOOM VECTORIAL {nivelZoomActual}×
            </span>
            {elementoActivo && (
              <span className="text-[10px] font-mono font-bold bg-sky-500/15 text-sky-700 dark:text-sky-300 border border-sky-500/40 px-2 py-0.5 rounded animate-pulse">
                ENFOCADO: {elementoActivo.titulo}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Lienzo topológico de 2m × 1.1m ({nodosVisibles.length} Nodos · {lineas.length} Tramos). Haga clic en cualquier elemento para zoom automático en alta definición con tipografía adaptativa.
          </p>
        </div>

        {/* Filtros de Nivel de Tensión */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 dark:bg-slate-950 p-1.5 rounded-xl border border-slate-200 dark:border-slate-800">
          <button
            onClick={() => setFiltroKv('TODOS')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              filtroKv === 'TODOS'
                ? 'bg-amber-500 text-white shadow-sm font-black'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800'
            }`}
          >
            Todos
          </button>
          {niveles.map((n) => {
            const colorVigente = getColorTension(n.tension_kv, n.color_hex);
            return (
              <button
                key={n.codigo_tension}
                onClick={() => setFiltroKv(n.tension_kv.toString())}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  filtroKv === n.tension_kv.toString()
                    ? (n.tension_kv === 69 && temaFondo === 'claro' ? 'text-white shadow-sm font-black' : 'text-slate-950 shadow-sm font-black')
                    : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800'
                }`}
                style={{
                  backgroundColor: filtroKv === n.tension_kv.toString() ? colorVigente : undefined,
                }}
              >
                <span
                  className="w-2.5 h-2.5 rounded-full inline-block border border-slate-600/50"
                  style={{ backgroundColor: colorVigente }}
                />
                {n.tension_kv} kV
              </button>
            );
          })}
        </div>

        {/* Selector de Fondo de Diagrama: Blanco CND vs SCADA Oscuro */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
          <button
            onClick={() => setTemaFondo('claro')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              temaFondo === 'claro'
                ? 'bg-amber-500 text-white shadow-sm font-black'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800'
            }`}
            title="Lienzo Blanco Papel Técnico CND (Máximo contraste de líneas 69 kV negras y 115 kV azules)"
          >
            <Sun className="w-3.5 h-3.5 text-white" />
            Lienzo Blanco (Oficial CND)
          </button>
          <button
            onClick={() => setTemaFondo('oscuro')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              temaFondo === 'oscuro'
                ? 'bg-sky-600 dark:bg-sky-500 text-white shadow-sm font-black'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800'
            }`}
            title="Modo Centro de Control SCADA Oscuro"
          >
            <Moon className="w-3.5 h-3.5" />
            SCADA Oscuro
          </button>
        </div>

        {/* Controles de Búsqueda, Zoom y Tipografía */}
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar y viajar a S/E..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-amber-500 w-48"
            />
            {busqueda && (
              <div className="absolute top-full left-0 right-0 mt-1 max-h-56 overflow-y-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl z-50">
                {subestaciones
                  .filter((s) => s.nombre_norm.includes(busqueda.toUpperCase()) || s.nombre_cnd.includes(busqueda.toUpperCase()))
                  .slice(0, 8)
                  .map((s) => (
                    <button
                      key={s.codigo}
                      onClick={() => {
                        enfocarNodo(s);
                        setBusqueda('');
                      }}
                      className="w-full text-left px-3 py-2 text-xs text-slate-800 dark:text-slate-300 hover:bg-amber-500/15 hover:text-amber-800 dark:hover:text-amber-300 border-b border-slate-100 dark:border-slate-800/50 flex items-center justify-between cursor-pointer"
                    >
                      <span className="font-bold">{s.nombre_norm}</span>
                      <span className="font-mono text-[10px] text-slate-500">{s.tensiones_lista}</span>
                    </button>
                  ))}
              </div>
            )}
          </div>

          {/* Calibrador de Tamaño de Letras / Tipografía */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-800" title="Ajuste manual del tamaño de texto en el diagrama">
            <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 pl-1.5 pr-0.5 flex items-center gap-0.5">
              <Type className="w-3 h-3 text-amber-600 dark:text-amber-400" />
              Letras:
            </span>
            <button
              onClick={() => setFactorEscalaTexto((prev) => Math.max(0.4, Number((prev - 0.1).toFixed(2))))}
              className="px-1.5 py-0.5 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition-all cursor-pointer"
              title="Reducir letras un poquito más"
            >
              A-
            </button>
            <span className="text-[10px] font-mono font-bold text-amber-700 dark:text-amber-300 px-1">
              {Math.round(factorEscalaTexto * 100)}%
            </span>
            <button
              onClick={() => setFactorEscalaTexto((prev) => Math.min(1.4, Number((prev + 0.1).toFixed(2))))}
              className="px-1.5 py-0.5 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition-all cursor-pointer"
              title="Aumentar letras"
            >
              A+
            </button>
          </div>

          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
            <button
              onClick={() => handleZoom(0.6)}
              className="p-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 cursor-pointer"
              title="Acercar (Zoom In)"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleZoom(1.6)}
              className="p-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 cursor-pointer"
              title="Alejar (Zoom Out)"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              onClick={resetView}
              className="p-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 cursor-pointer"
              title="Vista General Completa (Reset)"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Visor SVG NATIVO CON VIEWBOX DINÁMICO Y ANIMADO */}
      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        className={`w-full h-[720px] ${
          temaFondo === 'claro'
            ? 'bg-[#ffffff] border-slate-300 shadow-2xl'
            : 'bg-[#050811] border-slate-800 shadow-xl'
        } rounded-2xl border overflow-hidden relative select-none ${
          isDragging ? 'cursor-grabbing' : 'cursor-grab'
        }`}
      >
        <svg
          viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.w} ${viewBox.h}`}
          className="w-full h-full"
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Fondo Cuadrícula Mural CAD */}
          <defs>
            <pattern id="grid" width="200" height="200" patternUnits="userSpaceOnUse">
              <path
                d="M 200 0 L 0 0 0 200"
                fill="none"
                stroke={temaFondo === 'claro' ? '#e2e8f0' : '#10192a'}
                strokeWidth="1"
                strokeDasharray="6 6"
              />
            </pattern>
          </defs>
          <rect
            width={SVG_TOTAL_W}
            height={SVG_TOTAL_H}
            fill={temaFondo === 'claro' ? '#ffffff' : '#050811'}
          />
          <rect width={SVG_TOTAL_W} height={SVG_TOTAL_H} fill="url(#grid)" />

          {/* 1. Líneas de Transmisión */}
          <g id="lineas-transmision">
            {lineas.map((linea, idx) => {
              const strokeColor = getColorTension(linea.kv, linea.color);
              return (
                <line
                  key={idx}
                  x1={linea.x0}
                  y1={linea.y0}
                  x2={linea.x1}
                  y2={linea.y1}
                  stroke={strokeColor}
                  strokeWidth={Math.max(linea.grosor * 1.6, 2)}
                  strokeOpacity={temaFondo === 'claro' ? 0.95 : 0.88}
                  strokeLinecap="round"
                />
              );
            })}
          </g>

          {/* 2. Barras de Patio de Subestación */}
          <g id="barras-patio">
            {nodosVisibles.map((nodo) =>
              nodo.barras.map((b) => {
                const isSelectedBar = elementoActivo?.tipo === 'BARRA' && elementoActivo.id === b.id;
                const barColor = getColorTension(b.tension_kv, b.color_hex);
                return (
                  <g
                    key={b.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      enfocarElemento({
                        tipo: 'BARRA',
                        nodo,
                        id: b.id,
                        cx: b.cx,
                        cy: b.cy,
                        titulo: `Barra Colectora ${b.tension_kv} kV`,
                        subtitulo: nodo.nombre_norm,
                        capacidadTexto: `${b.tension_kv} kV`,
                        detalles: [
                          { label: 'Tensión de Barra', valor: `${b.tension_kv} kV` },
                          { label: 'Longitud en Diagrama', valor: `${Math.round(b.longitud)} pt` },
                          { label: 'Subestación Base', valor: nodo.nombre_norm },
                          { label: 'Región SEN', valor: nodo.cuadrante },
                        ],
                      }, 420, 260);
                    }}
                    className="cursor-pointer group"
                  >
                    <line
                      x1={b.x0}
                      y1={b.y0}
                      x2={b.x1}
                      y2={b.y1}
                      stroke={isSelectedBar ? '#fbbf24' : barColor}
                      strokeWidth={isSelectedBar ? Math.max(b.grosor * 3.5, 8) : Math.max(b.grosor * 2.8, 5.5)}
                      strokeLinecap="square"
                    />
                    {/* Etiqueta adaptativa de kV sobre la barra si estamos en zoom de detalle */}
                    {nivelZoomActual > 3 && (
                      <text
                        x={b.cx}
                        y={b.cy - getOffsetTexto(6)}
                        fill={isSelectedBar ? '#fbbf24' : barColor}
                        fontSize={getTamanoTexto(11)}
                        fontFamily="JetBrains Mono, monospace"
                        fontWeight="bold"
                        textAnchor="middle"
                        stroke={temaFondo === 'claro' ? '#ffffff' : '#000000'}
                        strokeWidth={getGrosorBordeTexto(2.2)}
                        paintOrder="stroke"
                      >
                        {b.tension_kv} kV
                      </text>
                    )}
                  </g>
                );
              })
            )}
          </g>

          {/* 3. Generadores Turbomotores */}
          <g id="generadores-turbinas">
            {nodosVisibles.map((nodo) =>
              nodo.generacion.map((g) => {
                const isSelectedGen = elementoActivo?.tipo === 'GENERADOR' && elementoActivo.id === g.id;
                return (
                  <g
                    key={g.id}
                    transform={`translate(${g.cx}, ${g.cy})`}
                    onClick={(e) => {
                      e.stopPropagation();
                      enfocarElemento({
                        tipo: 'GENERADOR',
                        nodo,
                        id: g.id,
                        cx: g.cx,
                        cy: g.cy,
                        titulo: `Unidad Generadora / Turbina`,
                        subtitulo: `${nodo.nombre_norm}`,
                        capacidadTexto: `${g.total_mw} MW`,
                        detalles: [
                          { label: 'Capacidad Nominal', valor: `${g.total_mw} MW` },
                          { label: 'Unidades Físicas', valor: `${g.qty}` },
                          { label: 'Central de Generación', valor: nodo.nombre_norm },
                          { label: 'Tensión de Salida', valor: nodo.tensiones_lista },
                          { label: 'Región CND', valor: nodo.cuadrante },
                        ],
                      }, 360, 220);
                    }}
                    className="cursor-pointer group"
                  >
                    <circle
                      r={isSelectedGen ? "16" : "12"}
                      fill={isSelectedGen ? "#fbbf24" : "#d97706"}
                      stroke={temaFondo === 'claro' ? "#0f172a" : "#ffffff"}
                      strokeWidth={isSelectedGen ? "2.5" : "1.5"}
                    />
                    <text
                      x="0"
                      y={getOffsetTexto(4)}
                      fill="#ffffff"
                      fontSize={getTamanoTexto(9)}
                      fontWeight="bold"
                      fontFamily="Inter, sans-serif"
                      textAnchor="middle"
                    >
                      ~
                    </text>
                    {nivelZoomActual > 3 && (
                      <text
                        x={getOffsetTexto(16)}
                        y={getOffsetTexto(4)}
                        fill={temaFondo === 'claro' ? "#b45309" : "#fef08a"}
                        fontSize={getTamanoTexto(10.5)}
                        fontFamily="JetBrains Mono, monospace"
                        fontWeight="bold"
                        stroke={temaFondo === 'claro' ? "#ffffff" : "#000000"}
                        strokeWidth={getGrosorBordeTexto(2.0)}
                        paintOrder="stroke"
                      >
                        {g.total_mw} MW
                      </text>
                    )}
                  </g>
                );
              })
            )}
          </g>

          {/* 4. Transformadores de Potencia */}
          <g id="transformadores-potencia">
            {nodosVisibles.map((nodo) =>
              nodo.transformadores.map((t) => {
                const isSelectedTrafo = elementoActivo?.tipo === 'TRANSFORMADOR' && elementoActivo.id === t.id;
                const trafoColor = isSelectedTrafo ? '#fbbf24' : (temaFondo === 'claro' ? '#0284c7' : '#38bdf8');
                return (
                  <g
                    key={t.id}
                    transform={`translate(${t.cx}, ${t.cy})`}
                    onClick={(e) => {
                      e.stopPropagation();
                      enfocarElemento({
                        tipo: 'TRANSFORMADOR',
                        nodo,
                        id: t.id,
                        cx: t.cx,
                        cy: t.cy,
                        titulo: `Banco Transformador de Potencia`,
                        subtitulo: `${nodo.nombre_norm}`,
                        capacidadTexto: `${t.total_mva} MVA`,
                        detalles: [
                          { label: 'Capacidad de Transformación', valor: `${t.total_mva} MVA` },
                          { label: 'Unidades Bancarias', valor: `${t.qty}` },
                          { label: 'Subestación Asociada', valor: nodo.nombre_norm },
                          { label: 'Patios Conectados', valor: nodo.tensiones_lista },
                          { label: 'Región CND', valor: nodo.cuadrante },
                        ],
                      }, 360, 220);
                    }}
                    className="cursor-pointer group"
                  >
                    <circle cx="-5" cy="0" r="7" fill="none" stroke={trafoColor} strokeWidth={isSelectedTrafo ? "3" : "2"} />
                    <circle cx="5" cy="0" r="7" fill="none" stroke={trafoColor} strokeWidth={isSelectedTrafo ? "3" : "2"} />
                    {nivelZoomActual > 3 && (
                      <text
                        x={getOffsetTexto(14)}
                        y={getOffsetTexto(3)}
                        fill={temaFondo === 'claro' ? "#0369a1" : "#bae6fd"}
                        fontSize={getTamanoTexto(10.5)}
                        fontFamily="JetBrains Mono, monospace"
                        fontWeight="bold"
                        stroke={temaFondo === 'claro' ? "#ffffff" : "#000000"}
                        strokeWidth={getGrosorBordeTexto(2.0)}
                        paintOrder="stroke"
                      >
                        {t.total_mva} MVA
                      </text>
                    )}
                  </g>
                );
              })
            )}
          </g>

          {/* 5. Nodos de Subestación y Centrales */}
          <g id="nodos-subestaciones">
            {nodosVisibles.map((nodo) => {
              const isSelected = elementoActivo?.nodo.codigo === nodo.codigo && elementoActivo?.tipo === 'NODO';
              const isGen = nodo.clasificacion === 'CENTRAL_GENERACION';

              return (
                <g
                  key={nodo.codigo}
                  transform={`translate(${nodo.coord_x}, ${nodo.coord_y})`}
                  onClick={(e) => {
                    e.stopPropagation();
                    enfocarNodo(nodo, 600, 360);
                  }}
                  className="cursor-pointer group"
                >
                  {/* Halo de Enfoque y Selección */}
                  {isSelected && (
                    <g>
                      <circle r="42" fill="#f59e0b" fillOpacity="0.15" stroke="#f59e0b" strokeWidth="3" strokeDasharray="8 6" />
                      <circle r="60" fill="none" stroke="#f59e0b" strokeWidth="1" strokeDasharray="4 4" strokeOpacity="0.4" />
                    </g>
                  )}

                  {/* Icono de Nodo */}
                  <circle
                    r={isGen ? "14" : "9"}
                    fill={isGen ? "#f59e0b" : "#0284c7"}
                    stroke={temaFondo === 'claro' ? "#0f172a" : "#ffffff"}
                    strokeWidth="2.5"
                  />

                  {/* Nombre del Nodo con Tipografía Adaptativa */}
                  <text
                    x={getOffsetTexto(16)}
                    y={getOffsetTexto(5)}
                    fill={
                      isSelected
                        ? (temaFondo === 'claro' ? "#b45309" : "#fbbf24")
                        : (temaFondo === 'claro' ? "#0f172a" : "#ffffff")
                    }
                    fontSize={getTamanoTexto(isSelected ? 16 : 13.5)}
                    fontWeight="bold"
                    fontFamily="Inter, sans-serif"
                    stroke={temaFondo === 'claro' ? "#ffffff" : "#000000"}
                    strokeWidth={getGrosorBordeTexto(temaFondo === 'claro' ? 3.5 : 2.8)}
                    paintOrder="stroke"
                  >
                    {nodo.nombre_norm}
                  </text>

                  {/* Datos del Nodo con Tipografía Adaptativa - Tensiones destacadas y legibles */}
                  <text
                    x={getOffsetTexto(16)}
                    y={getOffsetTexto(18)}
                    fill={
                      isSelected
                        ? (temaFondo === 'claro' ? '#b45309' : '#fbbf24')
                        : isGen
                        ? (temaFondo === 'claro' ? '#b45309' : '#fde047')
                        : (temaFondo === 'claro' ? '#0369a1' : '#bae6fd')
                    }
                    fontSize={getTamanoTexto(11)}
                    fontFamily="JetBrains Mono, monospace"
                    fontWeight="bold"
                    stroke={temaFondo === 'claro' ? "#ffffff" : "#000000"}
                    strokeWidth={getGrosorBordeTexto(temaFondo === 'claro' ? 2.8 : 2.2)}
                    paintOrder="stroke"
                  >
                    {nodo.tensiones_lista} {nodo.capacidad_mw > 0 ? `· ${nodo.capacidad_mw} MW` : ''}
                  </text>
                </g>
              );
            })}
          </g>

          {/* 6. Retícula Radar HUD Focal sobre el elemento seleccionado */}
          {elementoActivo && (
            <g id="radar-focal" transform={`translate(${elementoActivo.cx}, ${elementoActivo.cy})`}>
              <circle r="26" fill="none" stroke="#f59e0b" strokeWidth="2.5" opacity="0.8" strokeDasharray="5 3" />
              <circle r="44" fill="none" stroke={temaFondo === 'claro' ? "#0284c7" : "#38bdf8"} strokeWidth="1.5" strokeDasharray="4 4" opacity="0.6" />
              <line x1="-54" y1="0" x2="-32" y2="0" stroke="#f59e0b" strokeWidth="2" />
              <line x1="32" y1="0" x2="54" y2="0" stroke="#f59e0b" strokeWidth="2" />
              <line x1="0" y1="-54" x2="0" y2="-32" stroke="#f59e0b" strokeWidth="2" />
              <line x1="0" y1="32" x2="0" y2="54" stroke="#f59e0b" strokeWidth="2" />
            </g>
          )}
        </svg>

        {/* Panel Modal Flotante de Detalle del Elemento Enfocado */}
        {elementoActivo && (
          <div className="absolute bottom-5 right-5 w-96 bg-slate-900/95 border border-amber-500/70 rounded-2xl p-5 shadow-2xl backdrop-blur-2xl z-50">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-mono font-bold text-amber-400 block uppercase tracking-wider flex items-center gap-1.5">
                  <Activity className="w-3 h-3 text-amber-400" />
                  {elementoActivo.tipo} · {elementoActivo.subtitulo}
                </span>
                <h3 className="text-lg font-black text-white mt-0.5">{elementoActivo.titulo}</h3>
                <span className="text-xs text-slate-400 font-mono">Nodo Base: {elementoActivo.nodo.nombre_norm}</span>
              </div>
              <button
                onClick={() => setElementoActivo(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
                title="Cerrar Ficha"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Capacidad en Cifras Destacada */}
            <div className="mt-4 grid grid-cols-3 gap-2 bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-center">
              <div>
                <span className="text-[10px] text-slate-400 block">Generación</span>
                <span className="text-xs font-bold text-amber-400 font-mono">
                  {elementoActivo.nodo.capacidad_mw > 0 ? `${elementoActivo.nodo.capacidad_mw} MW` : '—'}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Transformación</span>
                <span className="text-xs font-bold text-sky-400 font-mono">
                  {elementoActivo.nodo.capacidad_mva > 0 ? `${elementoActivo.nodo.capacidad_mva} MVA` : '—'}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Reactivos</span>
                <span className="text-xs font-bold text-emerald-400 font-mono">
                  {elementoActivo.nodo.capacidad_mvar > 0 ? `${elementoActivo.nodo.capacidad_mvar} MVAr` : '—'}
                </span>
              </div>
            </div>

            {/* Ficha Técnica Dinámica del Elemento */}
            <div className="mt-3 text-xs space-y-1.5 border-t border-slate-800 pt-3">
              {elementoActivo.detalles.map((d, i) => (
                <div key={i} className="flex justify-between text-slate-300">
                  <span className="text-slate-400">{d.label}:</span>
                  <span className="font-mono font-bold text-slate-200">{d.valor}</span>
                </div>
              ))}
              <div className="flex justify-between text-slate-300">
                <span className="text-slate-400">Coordenadas Mural CND:</span>
                <span className="font-mono text-[10px] text-amber-400/90 font-bold">
                  ({Math.round(elementoActivo.cx)}, {Math.round(elementoActivo.cy)})
                </span>
              </div>
            </div>

            {/* Botones de Control de Zoom Dinámico */}
            <div className="mt-4 pt-3 border-t border-slate-800 space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => enfocarElemento(elementoActivo, 320, 190, 400)}
                  className="py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-amber-500/20 transition-all"
                  title="Hacer zoom directo y de cerca a este elemento"
                >
                  <Crosshair className="w-3.5 h-3.5" />
                  Zoom Detalle (18×)
                </button>
                <button
                  onClick={() => enfocarNodo(elementoActivo.nodo, 850, 500)}
                  className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-sky-300 font-bold text-xs flex items-center justify-center gap-1.5 border border-slate-700 transition-all"
                  title="Ver todo el patio y líneas de la subestación"
                >
                  <Layers className="w-3.5 h-3.5" />
                  Ver Patio S/E
                </button>
              </div>

              <button
                onClick={resetView}
                className="w-full py-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-white font-mono text-[11px] flex items-center justify-center gap-1.5 border border-slate-800/80 transition-all"
              >
                <RotateCcw className="w-3 h-3" />
                Alejar a Vista Nacional Completa (1×)
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
