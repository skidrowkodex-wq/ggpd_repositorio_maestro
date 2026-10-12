import React, { useState, useRef, useEffect, useMemo } from 'react';
import { SubestacionSigaSen, LineaTransmisionSEN } from '../types/sigaSen';
import { sigaSenService } from '../services/sigaSenService';
import {
  Layers,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Search,
  Zap,
  Activity,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  X,
  Compass,
  ArrowRight,
  Sun,
  Moon,
  Info,
  ShieldCheck,
  Cpu
} from 'lucide-react';

interface ElementoActivo {
  id: string;
  tipo: 'INTERRUPTOR' | 'SECCIONADOR' | 'TRANSFORMADOR' | 'GENERADOR' | 'BARRA' | 'REACTIVO' | 'LINEA_ENTRANTE' | 'LINEA_SALIENTE';
  tag: string;
  nombre: string;
  kv: number;
  potencia?: string;
  estado: 'EN_SERVICIO' | 'INDISPONIBLE' | 'EN_OBSERVACION';
  cx: number;
  cy: number;
  detalles: {
    claseAislamiento?: string;
    corrienteNominal?: string;
    capacidadRuptura?: string;
    fabricante?: string;
    ano?: number;
    norma?: string;
  };
}

interface Props {
  initialCodigo?: string;
}

export const UnifilarActivoSenView: React.FC<Props> = ({ initialCodigo }) => {
  const CANVAS_W = 1200;
  const CANVAS_H = 750;

  // Estado del activo seleccionado
  const [busqueda, setBusqueda] = useState('');
  const [filtroCuadrante, setFiltroCuadrante] = useState('TODOS');
  const [filtroTension, setFiltroTension] = useState('TODOS');
  const [modoLienzo, setModoLienzo] = useState<'blanco' | 'oscuro'>('blanco');

  const [codigoSeleccionado, setCodigoSeleccionado] = useState<string>(() => {
    return initialCodigo || 'CND-EL-CONVENTO';
  });

  // Cámara y Navegación SVG
  const [viewBox, setViewBox] = useState({ x: 0, y: 0, w: CANVAS_W, h: CANVAS_H });
  const viewBoxRef = useRef({ x: 0, y: 0, w: CANVAS_W, h: CANVAS_H });
  const animFrameRef = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Soporte táctil (tablet/teléfono): punteros activos y estado de pinch-zoom.
  const pointersRef = useRef<Map<number, { x: number; y: number }>>(new Map());
  const pinchRef = useRef<{ d: number; vb: { x: number; y: number; w: number; h: number } } | null>(null);

  // Inspección de Elemento
  const [elementoEnfocado, setElementoEnfocado] = useState<ElementoActivo | null>(null);
  const [estadosPersonalizados, setEstadosPersonalizados] = useState<Record<string, 'EN_SERVICIO' | 'INDISPONIBLE' | 'EN_OBSERVACION'>>({});

  useEffect(() => {
    viewBoxRef.current = viewBox;
  }, [viewBox]);

  useEffect(() => {
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  // Liberar el arrastre/pinch aunque el puntero se suelte fuera del lienzo.
  useEffect(() => {
    const liberarPuntero = (e: PointerEvent) => {
      pointersRef.current.delete(e.pointerId);
      if (pointersRef.current.size < 2) pinchRef.current = null;
      if (pointersRef.current.size === 0) setIsDragging(false);
    };
    window.addEventListener('pointerup', liberarPuntero);
    window.addEventListener('pointercancel', liberarPuntero);
    return () => {
      window.removeEventListener('pointerup', liberarPuntero);
      window.removeEventListener('pointercancel', liberarPuntero);
    };
  }, []);

  // Obtener subestación actual
  const actualSe = useMemo(() => {
    const s = sigaSenService.getSubestacionByCodigo(codigoSeleccionado);
    if (s) return s;
    const all = sigaSenService.getSubestaciones();
    return all.find((x) => x.codigo === 'CND-EL-CONVENTO') || all[0] || null;
  }, [codigoSeleccionado]);

  // Lista de subestaciones filtrada para el selector
  const listaSubestaciones = useMemo(() => {
    return sigaSenService.getSubestaciones('TODOS', filtroCuadrante, filtroTension, busqueda);
  }, [filtroCuadrante, filtroTension, busqueda]);

  const cuadrantes = useMemo(() => sigaSenService.getCuadrantes(), []);
  const niveles = useMemo(() => sigaSenService.getNivelesTension(), []);

  // Líneas conectadas
  const lineasConectadas = useMemo(() => {
    if (!actualSe) return { entrantes: [], salientes: [] };
    return sigaSenService.getLineasConectadas(actualSe.nombre_norm);
  }, [actualSe]);

  // Paleta de colores CND según tensión y modo de lienzo
  const getColorTension = (kv: number): string => {
    if (kv >= 700) return '#d97706'; // 765 kV Ámbar
    if (kv >= 350) return '#16a34a'; // 400 kV Verde Esmeralda
    if (kv >= 200) return '#dc2626'; // 230 kV Rojo
    if (kv >= 130) return '#c026d3'; // 138 kV Magenta
    if (kv >= 100) return modoLienzo === 'blanco' ? '#0038a8' : '#38bdf8'; // 115 kV Azul CND / Celeste
    if (kv >= 60) return modoLienzo === 'blanco' ? '#000000' : '#e2e8f0'; // 69 kV Negro sólido / Plata
    return '#0d9488'; // Media Tensión MT
  };

  const getStatusColor = (estado: 'EN_SERVICIO' | 'INDISPONIBLE' | 'EN_OBSERVACION') => {
    switch (estado) {
      case 'INDISPONIBLE':
        return '#ef4444'; // Red
      case 'EN_OBSERVACION':
        return '#f59e0b'; // Amber
      default:
        return '#10b981'; // Emerald
    }
  };

  // Cálculo del factor de magnificación del ViewBox
  const factorZoom = Math.round((CANVAS_W / viewBox.w) * 10) / 10;

  const getTamanoTexto = (tamanoBase: number, potencia = 0.28) => {
    if (factorZoom <= 1.05) return tamanoBase;
    const factor = Math.pow(factorZoom, potencia);
    return Math.max(tamanoBase * 0.4, Number((tamanoBase / factor).toFixed(2)));
  };

  // Animación cúbica suave
  const animarViewBox = (target: { x: number; y: number; w: number; h: number }, duracionMs = 400) => {
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

  // Centrar y enfocar un elemento
  const enfocarElemento = (el: ElementoActivo, zoomW = 420, zoomH = 260) => {
    setElementoEnfocado(el);
    const targetX = Math.max(0, Math.min(CANVAS_W - zoomW, el.cx - zoomW / 2));
    const targetY = Math.max(0, Math.min(CANVAS_H - zoomH, el.cy - zoomH / 2));
    animarViewBox({ x: targetX, y: targetY, w: zoomW, h: zoomH }, 450);
  };

  const handleZoom = (factor: number) => {
    const prev = viewBoxRef.current;
    const newW = Math.max(220, Math.min(CANVAS_W, prev.w * factor));
    const newH = Math.max(140, Math.min(CANVAS_H, prev.h * factor));
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

  const resetView = () => {
    setElementoEnfocado(null);
    animarViewBox({ x: 0, y: 0, w: CANVAS_W, h: CANVAS_H }, 500);
  };

  // Arrastre fluido (Pan) con Pointer Events (ratón / lápiz / dedo) + Pinch-Zoom táctil
  const handlePointerDown = (e: React.PointerEvent) => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (pointersRef.current.size === 1) {
      setIsDragging(true);
      setDragStart({ x: e.clientX, y: e.clientY });
      pinchRef.current = null;
    } else if (pointersRef.current.size === 2) {
      setIsDragging(false);
      const pts = Array.from(pointersRef.current.values());
      pinchRef.current = {
        d: Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y),
        vb: { ...viewBoxRef.current },
      };
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!pointersRef.current.has(e.pointerId) || !containerRef.current) return;
    pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    // Pinch-Zoom de dos dedos
    if (pointersRef.current.size >= 2 && pinchRef.current) {
      const pts = Array.from(pointersRef.current.values());
      const dist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
      if (dist > 0 && pinchRef.current.d > 0) {
        const start = pinchRef.current.vb;
        const factor = pinchRef.current.d / dist;
        const newW = Math.max(200, Math.min(CANVAS_W, start.w * factor));
        const newH = Math.max(125, Math.min(CANVAS_H, start.h * factor));
        const cx = start.x + start.w / 2;
        const cy = start.y + start.h / 2;
        const nuevoVb = {
          x: Math.max(0, Math.min(CANVAS_W - newW, cx - newW / 2)),
          y: Math.max(0, Math.min(CANVAS_H - newH, cy - newH / 2)),
          w: newW,
          h: newH,
        };
        setViewBox(nuevoVb);
        viewBoxRef.current = nuevoVb;
      }
      return;
    }

    // Pan de un solo puntero
    if (!isDragging) return;
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

  const handleMouseUp = () => setIsDragging(false);

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
    const newW = Math.max(200, Math.min(CANVAS_W, currentVb.w * zoomFactor));
    const newH = Math.max(125, Math.min(CANVAS_H, currentVb.h * zoomFactor));

    const newX = Math.max(0, Math.min(CANVAS_W - newW, svgX - (mouseX / rect.width) * newW));
    const newY = Math.max(0, Math.min(CANVAS_H - newH, svgY - (mouseY / rect.height) * newH));

    const nuevoVb = { x: newX, y: newY, w: newW, h: newH };
    setViewBox(nuevoVb);
    viewBoxRef.current = nuevoVb;
  };

  // Cambiar estado operativo de un elemento
  const handleToggleEstado = (elId: string, nuevoEstado: 'EN_SERVICIO' | 'INDISPONIBLE' | 'EN_OBSERVACION') => {
    setEstadosPersonalizados((prev) => ({
      ...prev,
      [elId]: nuevoEstado,
    }));
    if (elementoEnfocado && elementoEnfocado.id === elId) {
      setElementoEnfocado({
        ...elementoEnfocado,
        estado: nuevoEstado,
      });
    }
  };

  // Obtener estado efectivo de un elemento
  const getEstadoElemento = (id: string, defaultEstado: 'EN_SERVICIO' | 'INDISPONIBLE' | 'EN_OBSERVACION' = 'EN_SERVICIO') => {
    return estadosPersonalizados[id] || defaultEstado;
  };

  // Procesamiento de datos topológicos del activo
  const tensiones = useMemo(() => {
    if (!actualSe) return [];
    const setKv = new Set<number>();
    actualSe.barras.forEach((b) => setKv.add(b.tension_kv));
    return Array.from(setKv).sort((a, b) => b - a); // De mayor a menor
  }, [actualSe]);

  const maxKv = tensiones[0] || actualSe?.tension_max_kv || 230;
  const secKv = tensiones.length > 1 ? tensiones[1] : actualSe?.tension_min_kv && actualSe.tension_min_kv !== maxKv ? actualSe.tension_min_kv : 69;

  const esCentral = actualSe?.clasificacion === 'CENTRAL_GENERACION' || (actualSe?.generacion && actualSe.generacion.length > 0);
  const colorMax = getColorTension(maxKv);
  const colorSec = getColorTension(secKv);

  // Destacados directos para exploración rápida
  const accesosRapidos = [
    { label: 'GURI B', codigo: 'CND-GURI-B', subtitulo: '765/400 kV · 7.480 MW' },
    { label: 'PLANTA CENTRO', codigo: 'CND-PLANTA-CENTRO', subtitulo: '400/230/115 kV · 1.400 MW' },
    { label: 'LA ARENOSA', codigo: 'CND-LA-ARENOSA', subtitulo: '765/400/230 kV · 2.400 MVA' },
    { label: 'EL CONVENTO', codigo: 'CND-EL-CONVENTO', subtitulo: '230/69 kV · 748 MVA' },
    { label: 'MACAGUA II', codigo: 'CND-MACAGUA-II', subtitulo: '400/115 kV · 2.544 MW' },
    { label: 'BARBACOA', codigo: 'CND-BARBACOA', subtitulo: '230/115 kV · 600 MVA' },
    { label: 'SAN GERONIMO', codigo: 'CND-SAN-GERONIMO', subtitulo: '765/400 kV · 2.000 MVA' },
    { label: 'JOSEFA CAMEJO', codigo: 'CND-JOSEFA-CAMEJO', subtitulo: '230/115 kV · 450 MW' }
  ];

  if (!actualSe) {
    return (
      <div className="p-12 text-center text-slate-400">
        <Activity className="w-12 h-12 text-amber-500 mx-auto mb-3" />
        <h3 className="text-white font-bold">Seleccione un activo para generar el diagrama unifilar.</h3>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 1. Selector Superior y Accesos Directos */}
      <div className="bg-white dark:bg-slate-900/95 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm dark:shadow-2xl space-y-4 transition-colors">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-100 dark:bg-cyan-950 text-cyan-800 dark:text-cyan-300 border border-cyan-300 dark:border-cyan-800">
                MOTOR DE DIAGRAMADO UNIFILAR DINÁMICO
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">IEC 60617 · RDS-PS · SEN 2026</span>
            </div>
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">
              Diagrama Unifilar Esquemático de Activo Focal
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Generación vectorial automática a partir de los componentes reales de patio cargados en la base de datos nacional.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">Modo de Lienzo:</span>
            <div className="flex items-center bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
              <button
                onClick={() => setModoLienzo('blanco')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  modoLienzo === 'blanco'
                    ? 'bg-amber-500 text-white font-bold shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Sun className="w-3.5 h-3.5" />
                Lienzo Blanco (CND)
              </button>
              <button
                onClick={() => setModoLienzo('oscuro')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  modoLienzo === 'oscuro'
                    ? 'bg-sky-600 dark:bg-sky-500 text-white font-bold shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Moon className="w-3.5 h-3.5" />
                SCADA Oscuro
              </button>
            </div>
          </div>
        </div>

        {/* Barra de Filtros y Búsqueda */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
          <div className="md:col-span-2 relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar subestación o central (ej. EL CONVENTO, GURI, LA ARENOSA)..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <select
              value={filtroCuadrante}
              onChange={(e) => setFiltroCuadrante(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
            >
              <option value="TODOS">Todos los Cuadrantes / Regiones</option>
              {cuadrantes.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={codigoSeleccionado}
              onChange={(e) => setCodigoSeleccionado(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-1.5 text-xs text-amber-700 dark:text-amber-300 font-semibold focus:outline-none focus:border-cyan-500"
            >
              {listaSubestaciones.slice(0, 80).map((s) => (
                <option key={s.codigo} value={s.codigo}>
                  {s.nombre_norm} ({s.tensiones_lista})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Accesos directos rápidos */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase tracking-wider mr-1">
            Accesos Rápidos:
          </span>
          {accesosRapidos.map((acc) => (
            <button
              key={acc.codigo}
              onClick={() => {
                setCodigoSeleccionado(acc.codigo);
                resetView();
              }}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all border ${
                codigoSeleccionado === acc.codigo
                  ? 'bg-cyan-500/15 text-cyan-800 dark:text-cyan-300 border-cyan-500 font-bold'
                  : 'bg-slate-50 dark:bg-slate-950/80 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              ⚡ {acc.label}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Tarjeta Resumen del Activo Seleccionado */}
      <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm dark:shadow-xl flex flex-wrap items-center justify-between gap-4 transition-colors">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/40">
              {actualSe.clasificacion}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">{actualSe.codigo}</span>
            <span className="text-xs text-slate-400 dark:text-slate-500 font-mono">· Cuadrante: {actualSe.cuadrante}</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">
            {actualSe.nombre_norm}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Patios en Servicio: <strong className="text-sky-600 dark:text-sky-400 font-mono">{actualSe.tensiones_lista}</strong>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-center">
          {actualSe.capacidad_mw > 0 && (
            <div className="bg-slate-50 dark:bg-slate-950 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] text-slate-500 dark:text-slate-400 block uppercase font-mono">Potencia Turbomotriz</span>
              <span className="text-base font-black text-amber-600 dark:text-amber-400 font-mono">{actualSe.capacidad_mw} MW</span>
            </div>
          )}
          {actualSe.capacidad_mva > 0 && (
            <div className="bg-slate-50 dark:bg-slate-950 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] text-slate-500 dark:text-slate-400 block uppercase font-mono">Transformación AT</span>
              <span className="text-base font-black text-sky-600 dark:text-sky-400 font-mono">{actualSe.capacidad_mva} MVA</span>
            </div>
          )}
          {actualSe.capacidad_mvar > 0 && (
            <div className="bg-slate-50 dark:bg-slate-950 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] text-slate-500 dark:text-slate-400 block uppercase font-mono">Compensación Reactiva</span>
              <span className="text-base font-black text-emerald-600 dark:text-emerald-400 font-mono">{actualSe.capacidad_mvar} MVAr</span>
            </div>
          )}
          <div className="bg-slate-50 dark:bg-slate-950 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 block uppercase font-mono">Barras de Patio</span>
            <span className="text-base font-black text-slate-900 dark:text-white font-mono">{actualSe.barras.length}</span>
          </div>
          <div className="bg-slate-50 dark:bg-slate-950 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 block uppercase font-mono">Líneas Vinculadas</span>
            <span className="text-base font-black text-cyan-600 dark:text-cyan-400 font-mono">
              {lineasConectadas.entrantes.length + lineasConectadas.salientes.length}
            </span>
          </div>
        </div>
      </div>

      {/* 3. Lienzo Vectorial SVG del Diagrama Unifilar */}
      <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm dark:shadow-2xl space-y-4 transition-colors">
        {/* Controles de Vista y Leyenda */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/40">
              ZOOM {factorZoom}×
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Arrastre para Pan · Rueda del ratón o pinza de dos dedos para Zoom · Toque un equipo para su Ficha Técnica e inspección HUD
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Semáforo de estados */}
            <div className="flex items-center gap-3 text-xs font-mono bg-slate-50 dark:bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800">
              <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> En Servicio
              </span>
              <span className="flex items-center gap-1 text-rose-600 dark:text-rose-400">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse"></span> Indisponible
              </span>
              <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Observación
              </span>
            </div>

            {/* Botones de Zoom */}
            <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
              <button
                onClick={() => handleZoom(0.7)}
                className="p-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition-all cursor-pointer"
                title="Acercar (Zoom In)"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleZoom(1.4)}
                className="p-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition-all cursor-pointer"
                title="Alejar (Zoom Out)"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <button
                onClick={resetView}
                className="p-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition-all cursor-pointer"
                title="Restablecer Vista"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Lienzo SVG */}
        <div
          ref={containerRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerLeave={handleMouseUp}
          onWheel={handleWheel}
          className={`relative rounded-xl border p-2 sm:p-4 overflow-hidden flex items-center justify-center select-none transition-colors touch-pan-zoom ${
            modoLienzo === 'blanco'
              ? 'bg-white border-slate-300 shadow-inner'
              : 'bg-slate-950 border-sky-950'
          } ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
        >
          <svg
            viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.w} ${viewBox.h}`}
            className="w-full max-w-[1200px] h-[360px] sm:h-[500px] lg:h-[640px]"
            preserveAspectRatio="xMidYMid meet"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Cuadrícula de Fondo */}
            <defs>
              <pattern
                id="grid-unifilar-activo"
                width="20"
                height="20"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M 20 0 L 0 0 0 20"
                  fill="none"
                  stroke={modoLienzo === 'blanco' ? 'rgba(203, 213, 225, 0.45)' : 'rgba(56, 189, 248, 0.05)'}
                  strokeWidth="1"
                />
              </pattern>
            </defs>
            <rect width="1200" height="750" fill="url(#grid-unifilar-activo)" />

            {/* MARCO Y TÍTULO TÉCNICO INTERNO */}
            <text
              x="600"
              y="32"
              fill={modoLienzo === 'blanco' ? '#0f172a' : '#ffffff'}
              fontSize={getTamanoTexto(14)}
              fontFamily="JetBrains Mono"
              fontWeight="900"
              textAnchor="middle"
            >
              DIAGRAMA UNIFILAR DE DETALLE · {actualSe.nombre_norm} ({actualSe.codigo})
            </text>
            <text
              x="600"
              y="48"
              fill={modoLienzo === 'blanco' ? '#64748b' : '#94a3b8'}
              fontSize={getTamanoTexto(9.5)}
              fontFamily="JetBrains Mono"
              textAnchor="middle"
            >
              NORMA TÉCNICA CND · {actualSe.tensiones_lista} · CUADRANTE {actualSe.cuadrante.toUpperCase()}
            </text>

            {/* ============================================================== */}
            {/* NIVEL SUPERIOR: GENERACIÓN O LLEGADAS DE LÍNEA DE ALTA TENSIÓN */}
            {/* ============================================================== */}

            {esCentral ? (
              // CASO 1: CENTRAL DE GENERACIÓN
              <g>
                <text
                  x="200"
                  y="75"
                  fill={modoLienzo === 'blanco' ? '#b45309' : '#f59e0b'}
                  fontSize={getTamanoTexto(10)}
                  fontFamily="JetBrains Mono"
                  fontWeight="bold"
                >
                  ⚡ UNIDADES DE GENERACIÓN TURBOMOTRIZ
                </text>

                {(actualSe.generacion.length > 0 ? actualSe.generacion : [
                  { id: 1, tag: 'G1-G4', qty: 4, unit_mw: actualSe.capacidad_mw / 4 || 150, total_mw: actualSe.capacidad_mw || 600, fuente: 'TURBO' }
                ]).slice(0, 4).map((gen, idx, arr) => {
                  const spacing = 800 / (arr.length + 1);
                  const gx = 200 + (idx + 1) * spacing;
                  const gy = 115;
                  const genId = `GEN-${actualSe.codigo}-${idx + 1}`;
                  const estado = getEstadoElemento(genId);
                  const isSelected = elementoEnfocado?.id === genId;
                  const stColor = getStatusColor(estado);

                  return (
                    <g
                      key={genId}
                      className="cursor-pointer group"
                      onClick={(e) => {
                        e.stopPropagation();
                        enfocarElemento({
                          id: genId,
                          tipo: 'GENERADOR',
                          tag: `G-${idx + 1}`,
                          nombre: `Unidad Generadora ${gen.tag || `G${idx + 1}`} (${gen.fuente || 'Síncrona'})`,
                          kv: maxKv,
                          potencia: `${gen.unit_mw} MW (${gen.total_mw} MW bloque)`,
                          estado: estado,
                          cx: gx,
                          cy: gy,
                          detalles: {
                            claseAislamiento: '18 kV / 24 kV Generación',
                            corrienteNominal: `${Math.round((gen.unit_mw * 1000) / (18 * 1.732))} A`,
                            fabricante: 'Hitachi / Siemens / GE',
                            norma: 'IEEE C50.13 / IEC 60034',
                          },
                        });
                      }}
                    >
                      {/* Foco Radar HUD */}
                      {isSelected && (
                        <circle cx={gx} cy={gy} r="32" fill="#38bdf8" fillOpacity="0.18" stroke="#38bdf8" strokeWidth="2" strokeDasharray="4 2" />
                      )}

                      {/* Símbolo IEC de Generador Síncrono */}
                      <circle cx={gx} cy={gy} r="22" fill={modoLienzo === 'blanco' ? '#f8fafc' : '#0f172a'} stroke={stColor} strokeWidth="3" />
                      <text x={gx} y={gy + 5} fill={stColor} fontSize={getTamanoTexto(16)} fontWeight="bold" textAnchor="middle">
                        ∿
                      </text>
                      <text x={gx} y={gy - 28} fill={modoLienzo === 'blanco' ? '#0f172a' : '#f1f5f9'} fontSize={getTamanoTexto(9.5)} fontFamily="JetBrains Mono" fontWeight="bold" textAnchor="middle">
                        {gen.tag || `G${idx + 1}`}
                      </text>
                      <text x={gx} y={gy + 36} fill={modoLienzo === 'blanco' ? '#b45309' : '#fbbf24'} fontSize={getTamanoTexto(8.5)} fontFamily="JetBrains Mono" textAnchor="middle">
                        {gen.unit_mw} MW
                      </text>

                      {/* Conductor y Disyuntor de Generador */}
                      <line x1={gx} y1={gy + 22} x2={gx} y2={gy + 50} stroke={stColor} strokeWidth="2.5" />
                      
                      {/* Interruptor de Máquina */}
                      <rect x={gx - 10} y={gy + 50} width="20" height="20" fill={modoLienzo === 'blanco' ? '#ffffff' : '#0f172a'} stroke={stColor} strokeWidth="2" rx="3" />
                      
                      {/* Conductor hacia barra de alta */}
                      <line x1={gx} y1={gy + 70} x2={gx} y2={230} stroke={colorMax} strokeWidth="2.5" />
                    </g>
                  );
                })}
              </g>
            ) : (
              // CASO 2: SUBESTACIÓN DE TRANSMISIÓN (LLEGADAS DE LÍNEA)
              <g>
                <text
                  x="120"
                  y="75"
                  fill={colorMax}
                  fontSize={getTamanoTexto(10)}
                  fontFamily="JetBrains Mono"
                  fontWeight="bold"
                >
                  ⚡ LLEGADAS DE LÍNEA DE INTERCONEXIÓN ({maxKv} kV)
                </text>

                {(lineasConectadas.entrantes.length > 0 ? lineasConectadas.entrantes : [
                  { origen: 'SUBESTACION TRONCAL', kv: maxKv },
                  { origen: 'S/E ALIMENTADORA', kv: maxKv }
                ]).slice(0, 4).map((linea, idx, arr) => {
                  const spacing = 800 / (arr.length + 1);
                  const lx = 200 + (idx + 1) * spacing;
                  const ly = 90;
                  const lineId = `LIN-IN-${actualSe.codigo}-${idx + 1}`;
                  const estado = getEstadoElemento(lineId);
                  const isSelected = elementoEnfocado?.id === lineId;
                  const stColor = getStatusColor(estado);

                  return (
                    <g
                      key={lineId}
                      className="cursor-pointer group"
                      onClick={(e) => {
                        e.stopPropagation();
                        enfocarElemento({
                          id: lineId,
                          tipo: 'LINEA_ENTRANTE',
                          tag: `L-IN-${idx + 1}`,
                          nombre: `Línea de Transmisión desde ${linea.origen || 'S/E Interconectada'}`,
                          kv: linea.kv || maxKv,
                          potencia: 'Línea de Interconexión SEN',
                          estado: estado,
                          cx: lx,
                          cy: ly + 40,
                          detalles: {
                            claseAislamiento: `${maxKv} kV BIL 1050 kV`,
                            corrienteNominal: '2.000 A',
                            capacidadRuptura: '40 kA',
                            norma: 'CND Transmisión',
                          },
                        });
                      }}
                    >
                      {isSelected && (
                        <circle cx={lx} cy={ly + 40} r="28" fill="#38bdf8" fillOpacity="0.18" stroke="#38bdf8" strokeWidth="2" strokeDasharray="4 2" />
                      )}

                      {/* Flecha y Rótulo de Entrada */}
                      <path d={`M ${lx - 6} ${ly} L ${lx + 6} ${ly} L ${lx} ${ly + 10} Z`} fill={colorMax} />
                      <line x1={lx} y1={ly + 10} x2={lx} y2={ly + 40} stroke={colorMax} strokeWidth="2.5" />
                      
                      <text x={lx} y={ly - 8} fill={modoLienzo === 'blanco' ? '#0f172a' : '#f1f5f9'} fontSize={getTamanoTexto(8.5)} fontFamily="JetBrains Mono" fontWeight="bold" textAnchor="middle">
                        Desde {linea.origen ? linea.origen.split(' ')[0] : 'SEN'}
                      </text>

                      {/* Seccionador de Línea */}
                      <circle cx={lx} cy={ly + 40} r="3" fill={stColor} />
                      <line x1={lx} y1={ly + 40} x2={lx + 8} y2={ly + 52} stroke={stColor} strokeWidth="2" />
                      <circle cx={lx} cy={ly + 56} r="3" fill={stColor} />

                      <line x1={lx} y1={ly + 56} x2={lx} y2={ly + 75} stroke={colorMax} strokeWidth="2.5" />

                      {/* Disyuntor de Entrada */}
                      <rect x={lx - 10} y={ly + 75} width="20" height="20" fill={modoLienzo === 'blanco' ? '#ffffff' : '#0f172a'} stroke={stColor} strokeWidth="2" rx="3" />
                      <line x1={lx} y1={ly + 95} x2={lx} y2={230} stroke={colorMax} strokeWidth="2.5" />
                    </g>
                  );
                })}
              </g>
            )}

            {/* ============================================================== */}
            {/* 1. BARRA COLECTORA PRINCIPAL DE ALTA TENSIÓN (MÁXIMO KV) */}
            {/* ============================================================== */}
            <g>
              <line x1="120" y1="230" x2="1080" y2="230" stroke={colorMax} strokeWidth="7" strokeLinecap="round" />
              <text
                x="120"
                y="218"
                fill={colorMax}
                fontSize={getTamanoTexto(11)}
                fontFamily="JetBrains Mono"
                fontWeight="900"
              >
                BARRA COLECTORA PRINCIPAL {maxKv} kV
              </text>
              <text
                x="1080"
                y="218"
                fill={modoLienzo === 'blanco' ? '#64748b' : '#94a3b8'}
                fontSize={getTamanoTexto(9)}
                fontFamily="JetBrains Mono"
                textAnchor="end"
              >
                PATIO EAT/AT {maxKv} kV
              </text>
            </g>

            {/* ============================================================== */}
            {/* NIVEL INTERMEDIO: TRANSFORMADORES DE POTENCIA & REACTIVOS */}
            {/* ============================================================== */}
            <g>
              {/* Transformadores / Autotransformadores de Patio */}
              {(actualSe.transformadores.length > 0 ? actualSe.transformadores : [
                { id: 1, raw: '1 x 100 MVA', qty: 1, unit_mva: actualSe.capacidad_mva || 100, total_mva: actualSe.capacidad_mva || 100 }
              ]).slice(0, 3).map((trafo, idx, arr) => {
                const spacing = 650 / (arr.length + 1);
                const tx = 250 + (idx + 1) * spacing;
                const ty = 345;
                const trafoId = `TR-${actualSe.codigo}-${idx + 1}`;
                const estado = getEstadoElemento(trafoId);
                const isSelected = elementoEnfocado?.id === trafoId;
                const stColor = getStatusColor(estado);

                return (
                  <g
                    key={trafoId}
                    className="cursor-pointer group"
                    onClick={(e) => {
                      e.stopPropagation();
                      enfocarElemento({
                        id: trafoId,
                        tipo: 'TRANSFORMADOR',
                        tag: `AT-${idx + 1}`,
                        nombre: `Banco de Transformación AT-${idx + 1} (${maxKv}/${secKv} kV)`,
                        kv: maxKv,
                        potencia: `${trafo.unit_mva} MVA (${trafo.total_mva} MVA Total)`,
                        estado: estado,
                        cx: tx,
                        cy: ty,
                        detalles: {
                          claseAislamiento: `${maxKv}/${secKv} kV ONAF/OFAF`,
                          fabricante: 'ABB / Pauwels / Toshiba / General Electric',
                          ano: 2012,
                          norma: 'IEC 60076 / IEEE C57.12',
                        },
                      });
                    }}
                  >
                    {/* Foco Radar HUD */}
                    {isSelected && (
                      <circle cx={tx} cy={ty} r="46" fill="#38bdf8" fillOpacity="0.18" stroke="#38bdf8" strokeWidth="2" strokeDasharray="4 2" />
                    )}

                    {/* Conductor desde barra superior */}
                    <line x1={tx} y1="230" x2={tx} y2={ty - 45} stroke={colorMax} strokeWidth="2.5" />

                    {/* Disyuntor AT Lado Alta */}
                    <rect x={tx - 10} y={ty - 45} width="20" height="20" fill={modoLienzo === 'blanco' ? '#ffffff' : '#0f172a'} stroke={stColor} strokeWidth="2" rx="3" />
                    <line x1={tx} y1={ty - 25} x2={tx} y2={ty - 16} stroke={colorMax} strokeWidth="2.5" />

                    {/* Símbolo IEC de Devanados Acoplados (Doble Círculo) */}
                    <circle cx={tx} cy={ty - 12} r="18" fill="none" stroke={colorMax} strokeWidth="3" />
                    <circle cx={tx} cy={ty + 12} r="18" fill="none" stroke={colorSec} strokeWidth="3" />

                    {/* Textos del Trafo */}
                    <text x={tx + 30} y={ty - 6} fill={modoLienzo === 'blanco' ? '#0f172a' : '#f8fafc'} fontSize={getTamanoTexto(10)} fontFamily="JetBrains Mono" fontWeight="bold">
                      AT-{idx + 1}
                    </text>
                    <text x={tx + 30} y={ty + 10} fill={modoLienzo === 'blanco' ? '#0284c7' : '#38bdf8'} fontSize={getTamanoTexto(9)} fontFamily="JetBrains Mono">
                      {trafo.unit_mva} MVA
                    </text>
                    <text x={tx + 30} y={ty + 24} fill={modoLienzo === 'blanco' ? '#64748b' : '#94a3b8'} fontSize={getTamanoTexto(8)} fontFamily="JetBrains Mono">
                      {maxKv}/{secKv} kV
                    </text>

                    {/* Conductor y Disyuntor Lado Secundaria */}
                    <line x1={tx} y1={ty + 30} x2={tx} y2={ty + 40} stroke={colorSec} strokeWidth="2.5" />
                    <rect x={tx - 10} y={ty + 40} width="20" height="20" fill={modoLienzo === 'blanco' ? '#ffffff' : '#0f172a'} stroke={stColor} strokeWidth="2" rx="3" />
                    <line x1={tx} y1={ty + 60} x2={tx} y2="470" stroke={colorSec} strokeWidth="2.5" />
                  </g>
                );
              })}

              {/* Compensación Reactiva (si aplica) */}
              {actualSe.reactivos.length > 0 && (
                <g>
                  {actualSe.reactivos.slice(0, 2).map((rec, idx) => {
                    const rx = 960 + idx * 80;
                    const ry = 340;
                    const recId = `REC-${actualSe.codigo}-${idx + 1}`;
                    const estado = getEstadoElemento(recId);
                    const isSelected = elementoEnfocado?.id === recId;
                    const stColor = getStatusColor(estado);

                    return (
                      <g
                        key={recId}
                        className="cursor-pointer group"
                        onClick={(e) => {
                          e.stopPropagation();
                          enfocarElemento({
                            id: recId,
                            tipo: 'REACTIVO',
                            tag: `REA-${idx + 1}`,
                            nombre: `Banco de Compensación Reactiva (${rec.tipo || 'Reactor Shunt / Condensador'})`,
                            kv: maxKv,
                            potencia: `${rec.unit_mvar} MVAr (${rec.total_mvar} MVAr Total)`,
                            estado: estado,
                            cx: rx,
                            cy: ry,
                            detalles: {
                              claseAislamiento: `${maxKv} kV`,
                              fabricante: 'Alstom / Trench',
                              norma: 'IEEE C57.21',
                            },
                          });
                        }}
                      >
                        {isSelected && (
                          <circle cx={rx} cy={ry} r="32" fill="#38bdf8" fillOpacity="0.18" stroke="#38bdf8" strokeWidth="2" strokeDasharray="4 2" />
                        )}

                        <line x1={rx} y1="230" x2={rx} y2={ry - 25} stroke={colorMax} strokeWidth="2" />
                        <rect x={rx - 8} y={ry - 25} width="16" height="16" fill={modoLienzo === 'blanco' ? '#ffffff' : '#0f172a'} stroke={stColor} strokeWidth="2" rx="2" />
                        <line x1={rx} y1={ry - 9} x2={rx} y2={ry} stroke={colorMax} strokeWidth="2" />

                        {/* Bobina / Reactor Shunt */}
                        <circle cx={rx} cy={ry + 10} r="10" fill="none" stroke="#10b981" strokeWidth="2.5" />
                        <circle cx={rx} cy={ry + 22} r="10" fill="none" stroke="#10b981" strokeWidth="2.5" />
                        <line x1={rx} y1={ry + 32} x2={rx} y2={ry + 45} stroke="#10b981" strokeWidth="2" />
                        {/* Puesta a Tierra */}
                        <line x1={rx - 8} y1={ry + 45} x2={rx + 8} y2={ry + 45} stroke="#10b981" strokeWidth="2" />
                        <line x1={rx - 5} y1={ry + 48} x2={rx + 5} y2={ry + 48} stroke="#10b981" strokeWidth="1.5" />
                        <line x1={rx - 2} y1={ry + 51} x2={rx + 2} y2={ry + 51} stroke="#10b981" strokeWidth="1" />

                        <text x={rx} y={ry - 32} fill="#10b981" fontSize={getTamanoTexto(8)} fontFamily="JetBrains Mono" fontWeight="bold" textAnchor="middle">
                          {rec.unit_mvar} MVAr
                        </text>
                      </g>
                    );
                  })}
                </g>
              )}
            </g>

            {/* ============================================================== */}
            {/* 2. BARRA COLECTORA SECUNDARIA (SUBTRANSMISIÓN / DISTRIBUCIÓN) */}
            {/* ============================================================== */}
            <g>
              <line x1="120" y1="470" x2="1080" y2="470" stroke={colorSec} strokeWidth="6" strokeLinecap="round" />
              <text
                x="120"
                y="492"
                fill={colorSec}
                fontSize={getTamanoTexto(11)}
                fontFamily="JetBrains Mono"
                fontWeight="900"
              >
                BARRA COLECTORA SECUNDARIA {secKv} kV
              </text>
              <text
                x="1080"
                y="492"
                fill={modoLienzo === 'blanco' ? '#64748b' : '#94a3b8'}
                fontSize={getTamanoTexto(9)}
                fontFamily="JetBrains Mono"
                textAnchor="end"
              >
                SUBTRANSMISIÓN / DISTRIBUCIÓN
              </text>
            </g>

            {/* ============================================================== */}
            {/* NIVEL INFERIOR: BAHÍAS DE SALIDA DE LÍNEA / ALIMENTADORES */}
            {/* ============================================================== */}
            <g>
              <text
                x="120"
                y="525"
                fill={colorSec}
                fontSize={getTamanoTexto(10)}
                fontFamily="JetBrains Mono"
                fontWeight="bold"
              >
                ⚡ SALIDAS DE LÍNEA / ALIMENTADORES ({secKv} kV)
              </text>

              {(lineasConectadas.salientes.length > 0 ? lineasConectadas.salientes : [
                { destino: 'S/E DESTINO 1', kv: secKv },
                { destino: 'S/E DESTINO 2', kv: secKv },
                { destino: 'CIRCUITO METROPOLITANO', kv: secKv },
                { destino: 'SUBESTACION ENLACE', kv: secKv }
              ]).slice(0, 6).map((linea, idx, arr) => {
                const spacing = 880 / (arr.length + 1);
                const sx = 160 + (idx + 1) * spacing;
                const sy = 510;
                const outId = `LIN-OUT-${actualSe.codigo}-${idx + 1}`;
                const estado = getEstadoElemento(outId);
                const isSelected = elementoEnfocado?.id === outId;
                const stColor = getStatusColor(estado);

                return (
                  <g
                    key={outId}
                    className="cursor-pointer group"
                    onClick={(e) => {
                      e.stopPropagation();
                      enfocarElemento({
                        id: outId,
                        tipo: 'LINEA_SALIENTE',
                        tag: `L-OUT-${idx + 1}`,
                        nombre: `Salida de Línea hacia ${linea.destino || 'S/E Vecina'}`,
                        kv: linea.kv || secKv,
                        potencia: 'Alimentador de Subtransmisión / Distribución',
                        estado: estado,
                        cx: sx,
                        cy: sy + 70,
                        detalles: {
                          claseAislamiento: `${secKv} kV`,
                          corrienteNominal: '1.250 A',
                          capacidadRuptura: '25 kA / 31.5 kA',
                          norma: 'CND / GGPD Distribución',
                        },
                      });
                    }}
                  >
                    {isSelected && (
                      <circle cx={sx} cy={sy + 70} r="28" fill="#38bdf8" fillOpacity="0.18" stroke="#38bdf8" strokeWidth="2" strokeDasharray="4 2" />
                    )}

                    {/* Conductor desde barra secundaria */}
                    <line x1={sx} y1="470" x2={sx} y2={sy + 20} stroke={colorSec} strokeWidth="2.5" />

                    {/* Seccionador de Barra */}
                    <circle cx={sx} cy={sy + 20} r="3" fill={stColor} />
                    <line x1={sx} y1={sy + 20} x2={sx + 8} y2={sy + 32} stroke={stColor} strokeWidth="2" />
                    <circle cx={sx} cy={sy + 36} r="3" fill={stColor} />

                    <line x1={sx} y1={sy + 36} x2={sx} y2={sy + 55} stroke={colorSec} strokeWidth="2.5" />

                    {/* Interruptor de Salida */}
                    <rect x={sx - 10} y={sy + 55} width="20" height="20" fill={modoLienzo === 'blanco' ? '#ffffff' : '#0f172a'} stroke={stColor} strokeWidth="2" rx="3" />

                    <line x1={sx} y1={sy + 75} x2={sx} y2={sy + 105} stroke={colorSec} strokeWidth="2.5" />

                    {/* Flecha hacia abajo y Destino */}
                    <path d={`M ${sx - 6} ${sy + 105} L ${sx + 6} ${sy + 105} L ${sx} ${sy + 115} Z`} fill={colorSec} />
                    <text
                      x={sx}
                      y={sy + 130}
                      fill={modoLienzo === 'blanco' ? '#0f172a' : '#f1f5f9'}
                      fontSize={getTamanoTexto(8.5)}
                      fontFamily="JetBrains Mono"
                      fontWeight="bold"
                      textAnchor="middle"
                    >
                      Hacia {linea.destino ? linea.destino.split(' ')[0] : 'S/E Red'}
                    </text>
                    <text
                      x={sx}
                      y={sy + 142}
                      fill={colorSec}
                      fontSize={getTamanoTexto(7.5)}
                      fontFamily="JetBrains Mono"
                      textAnchor="middle"
                    >
                      {secKv} kV
                    </text>
                  </g>
                );
              })}
            </g>
          </svg>
        </div>
      </div>

      {/* 4. Panel Modal / HUD de Inspección del Elemento Seleccionado */}
      {elementoEnfocado && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-sky-800 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto thin-scroll p-4 sm:p-6 shadow-2xl relative space-y-5">
            <button
              onClick={() => setElementoEnfocado(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Cabecera del Modal */}
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-950 text-cyan-400 border border-cyan-800 flex items-center justify-center font-bold">
                <Cpu className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-800 font-bold">
                    {elementoEnfocado.tipo}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">{elementoEnfocado.tag}</span>
                </div>
                <h3 className="text-lg font-bold text-white mt-0.5">{elementoEnfocado.nombre}</h3>
                <p className="text-xs text-slate-400">
                  Ubicación: S/E {actualSe.nombre_norm} · Patio {elementoEnfocado.kv} kV
                </p>
              </div>
            </div>

            {/* Semáforo y Modificador de Estado Operativo */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                Estado Operativo en Tiempo Real (Simulador SCADA):
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button
                  onClick={() => handleToggleEstado(elementoEnfocado.id, 'EN_SERVICIO')}
                  className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all border ${
                    elementoEnfocado.estado === 'EN_SERVICIO'
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500 font-bold shadow-md shadow-emerald-500/10'
                      : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span> En Servicio
                </button>
                <button
                  onClick={() => handleToggleEstado(elementoEnfocado.id, 'INDISPONIBLE')}
                  className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all border ${
                    elementoEnfocado.estado === 'INDISPONIBLE'
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500 font-bold shadow-md shadow-rose-500/10'
                      : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span> Indisponible
                </button>
                <button
                  onClick={() => handleToggleEstado(elementoEnfocado.id, 'EN_OBSERVACION')}
                  className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all border ${
                    elementoEnfocado.estado === 'EN_OBSERVACION'
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500 font-bold shadow-md shadow-amber-500/10'
                      : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-amber-400"></span> Observación
                </button>
              </div>
            </div>

            {/* Parámetros Técnicos */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 font-mono block">NIVEL DE TENSIÓN</span>
                <span className="text-sm font-bold text-sky-400 font-mono">{elementoEnfocado.kv} kV</span>
              </div>
              {elementoEnfocado.potencia && (
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 font-mono block">POTENCIA NOMINAL</span>
                  <span className="text-sm font-bold text-amber-400 font-mono">{elementoEnfocado.potencia}</span>
                </div>
              )}
              {elementoEnfocado.detalles.claseAislamiento && (
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 font-mono block">CLASE DE AISLAMIENTO</span>
                  <span className="text-xs font-semibold text-slate-300 font-mono">{elementoEnfocado.detalles.claseAislamiento}</span>
                </div>
              )}
              {elementoEnfocado.detalles.corrienteNominal && (
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 font-mono block">CORRIENTE NOMINAL</span>
                  <span className="text-xs font-semibold text-slate-300 font-mono">{elementoEnfocado.detalles.corrienteNominal}</span>
                </div>
              )}
              {elementoEnfocado.detalles.capacidadRuptura && (
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 font-mono block">CAPACIDAD DE RUPTURA</span>
                  <span className="text-xs font-semibold text-slate-300 font-mono">{elementoEnfocado.detalles.capacidadRuptura}</span>
                </div>
              )}
              {elementoEnfocado.detalles.fabricante && (
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 font-mono block">FABRICANTE / REFERENCIA</span>
                  <span className="text-xs font-semibold text-slate-300">{elementoEnfocado.detalles.fabricante}</span>
                </div>
              )}
            </div>

            {/* Pie Normativo ISO */}
            <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-400 font-mono">
              <span className="flex items-center gap-1 text-sky-400">
                <ShieldCheck className="w-3.5 h-3.5" /> ISO 55000 · GESTIÓN DE ACTIVOS SEN
              </span>
              <button
                onClick={() => setElementoEnfocado(null)}
                className="px-4 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-lg font-bold transition-all text-xs"
              >
                Cerrar Ficha
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
