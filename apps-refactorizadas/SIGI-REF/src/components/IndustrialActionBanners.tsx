import React, { useState } from 'react';
import { 
  ShieldAlert, 
  Cpu, 
  Wrench, 
  Headphones, 
  ArrowRight, 
  Activity, 
  Lock, 
  CheckCircle2, 
  X, 
  Send, 
  AlertTriangle, 
  Zap,
  Sliders,
  ChevronRight
} from 'lucide-react';

interface IndustrialActionBannersProps {
  onOpenAuth: (stateCode?: string) => void;
}

export const IndustrialActionBanners: React.FC<IndustrialActionBannersProps> = ({ onOpenAuth }) => {
  const [activeModal, setActiveModal] = useState<'denuncia' | 'simulador' | 'obras' | 'soporte' | null>(null);
  const [simulationState, setSimulationState] = useState({
    loadPercentage: 78,
    voltageLevel: '13.8 kV',
    contingencyN1: false,
    ambientTemp: 32,
  });
  const [reportSent, setReportSent] = useState(false);

  return (
    <section className="mx-auto max-w-7xl px-3 sm:px-6 space-y-6">
      
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4 text-left">
        <div>
          <div className="inline-flex items-center space-x-2 rounded-md bg-[#002b49]/10 dark:bg-[#00f2fe]/10 px-2.5 py-1 text-[11px] font-mono font-bold text-[#002b49] dark:text-[#00f2fe] mb-1.5">
            <Activity className="h-3.5 w-3.5" />
            <span>MÓDULOS DE ACCIÓN OPERATIVA · CORPOELEC GGPD</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Servicios Críticos y Herramientas Estratégicas del SEN
          </h2>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium max-w-md text-left sm:text-right">
          Accesos directos para auditoría de integridad, modelado de carga eléctrica, supervisión de obras y soporte de salas situacionales.
        </p>
      </div>

      {/* 2x2 Grid of Industrial Vanguard Banners */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        
        {/* =========================================================================
            BANNER 1: LÍNEA DE INTEGRIDAD & CIBERSEGURIDAD SEN (0800-DENUNCIA)
            ========================================================================= */}
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#072146] via-[#002b49] to-[#041426] text-white p-6 sm:p-7 shadow-lg border border-blue-900/60 dark:border-[#00f2fe]/30 flex flex-col justify-between group hover:border-[#00f2fe]/80 transition-all duration-300">
          
          {/* Subtle Technical Dot Matrix & Circuit Overlay */}
          <div 
            className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#00f2fe_1.5px,transparent_1.5px)] [background-size:16px_16px]" 
          />

          {/* Stylized Right Watermark Chevrons */}
          <div className="absolute -right-6 -bottom-6 opacity-10 pointer-events-none text-[#00f2fe] select-none">
            <svg width="180" height="180" viewBox="0 0 100 100" fill="currentColor">
              <path d="M10 20 L35 50 L10 80 L25 80 L50 50 L25 20 Z" />
              <path d="M40 20 L65 50 L40 80 L55 80 L80 50 L55 20 Z" />
            </svg>
          </div>

          <div className="relative z-10 space-y-4">
            
            {/* Header: Title & Hotline Code */}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#00f2fe] font-bold">
                  Canal Seguro de Integridad SEN
                </span>
                <h3 className="text-2xl sm:text-3xl font-black tracking-tight flex items-center space-x-2 text-white">
                  <span>0800-DENUNCIA</span>
                </h3>
                <div className="text-xs font-mono font-bold tracking-[0.25em] text-cyan-200/90 mt-0.5">
                  0800 · 3 3 6 8 6 7 2
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-[#00f2fe]">
                <ShieldAlert className="h-6 w-6" />
              </div>
            </div>

            {/* Pill Container with Chevron Glyphs */}
            <div className="rounded-2xl bg-cyan-500/20 backdrop-blur-md border border-cyan-400/30 p-3 sm:p-3.5 flex items-center space-x-3">
              {/* Chevron Flow Indicator */}
              <div className="flex items-center text-[#00f2fe] font-black text-sm tracking-tighter shrink-0 animate-pulse">
                <span>&gt;&gt;&gt;</span>
              </div>
              <p className="text-xs sm:text-[13px] text-cyan-50 font-medium leading-snug">
                Atención confidencial y técnica de reportes sobre sabotaje, anomalías operativas o vulneración física y lógica del Sistema Eléctrico Nacional.
              </p>
            </div>

          </div>

          {/* Action Footer */}
          <div className="relative z-10 pt-5 flex items-center justify-between border-t border-white/10 mt-4">
            <span className="text-[11px] font-mono text-cyan-200/80 flex items-center space-x-1.5">
              <Lock className="h-3 w-3 text-emerald-400" />
              <span>Protocolo Cifrado TLS 256-bit</span>
            </span>

            <button
              onClick={() => setActiveModal('denuncia')}
              className="px-4 py-2 rounded-xl bg-white hover:bg-cyan-50 text-[#072146] text-xs font-extrabold shadow-md hover:shadow-lg active:scale-95 transition-all flex items-center space-x-1.5"
            >
              <span>REPORTAR</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

        </div>

        {/* =========================================================================
            BANNER 2: SIMULADOR DE FLUJO DE CARGA & DEMANDA GGPD
            ========================================================================= */}
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#002b49] via-[#0b3359] to-[#041a33] text-white p-6 sm:p-7 shadow-lg border border-blue-900/60 dark:border-cyan-500/30 flex flex-col justify-between group hover:border-[#00f2fe]/80 transition-all duration-300">
          
          {/* Subtle Technical Dot Matrix */}
          <div 
            className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#38bdf8_1.5px,transparent_1.5px)] [background-size:16px_16px]" 
          />

          {/* Stylized Right Watermark Chevrons */}
          <div className="absolute -right-6 -bottom-6 opacity-10 pointer-events-none text-sky-400 select-none">
            <svg width="180" height="180" viewBox="0 0 100 100" fill="currentColor">
              <path d="M10 20 L35 50 L10 80 L25 80 L50 50 L25 20 Z" />
              <path d="M40 20 L65 50 L40 80 L55 80 L80 50 L55 20 Z" />
            </svg>
          </div>

          <div className="relative z-10 space-y-4">
            
            {/* Header: Title */}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-sky-300 font-bold">
                  Ingeniería de Distribución GGPD
                </span>
                <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                  SIMULADOR DE CARGA SEN
                </h3>
                <div className="text-xs font-semibold text-sky-200/90 mt-0.5">
                  Modelado de Potencia, Tensión y Comportamiento Térmico
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-sky-300">
                <Cpu className="h-6 w-6" />
              </div>
            </div>

            {/* Pill Container with Chevron Glyphs */}
            <div className="rounded-2xl bg-sky-500/20 backdrop-blur-md border border-sky-400/30 p-3 sm:p-3.5 flex items-center space-x-3">
              <div className="flex items-center text-sky-300 font-black text-sm tracking-tighter shrink-0 animate-pulse">
                <span>&gt;&gt;&gt;</span>
              </div>
              <p className="text-xs sm:text-[13px] text-sky-50 font-medium leading-snug">
                Evalúe perfiles de demanda, cargabilidad de transformadores en subestaciones y márgenes de contingencia N-1 por circuito.
              </p>
            </div>

          </div>

          {/* Action Footer */}
          <div className="relative z-10 pt-5 flex items-center justify-between border-t border-white/10 mt-4">
            <span className="text-[11px] font-mono text-sky-200/80 flex items-center space-x-1.5">
              <Zap className="h-3 w-3 text-amber-400" />
              <span>Algoritmo Newton-Raphson Integrado</span>
            </span>

            <button
              onClick={() => setActiveModal('simulador')}
              className="px-4 py-2 rounded-xl bg-white hover:bg-sky-50 text-[#002b49] text-xs font-extrabold shadow-md hover:shadow-lg active:scale-95 transition-all flex items-center space-x-1.5"
            >
              <span>SIMULAR</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

        </div>

        {/* =========================================================================
            BANNER 3: PLAN DE OBRAS Y MANTENIMIENTO ESTRATÉGICO (SCPPE)
            ========================================================================= */}
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#0c243b] via-[#103657] to-[#08182b] text-white p-6 sm:p-7 shadow-lg border border-blue-900/60 dark:border-indigo-500/30 flex flex-col justify-between group hover:border-[#00f2fe]/80 transition-all duration-300">
          
          <div 
            className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#818cf8_1.5px,transparent_1.5px)] [background-size:16px_16px]" 
          />

          <div className="absolute -right-6 -bottom-6 opacity-10 pointer-events-none text-indigo-300 select-none">
            <svg width="180" height="180" viewBox="0 0 100 100" fill="currentColor">
              <path d="M10 20 L35 50 L10 80 L25 80 L50 50 L25 20 Z" />
              <path d="M40 20 L65 50 L40 80 L55 80 L80 50 L55 20 Z" />
            </svg>
          </div>

          <div className="relative z-10 space-y-4">
            
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-indigo-300 font-bold">
                  Planes de Inversión y PRTSEN
                </span>
                <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                  OBRAS Y MANTENIMIENTO
                </h3>
                <div className="text-xs font-semibold text-indigo-200/90 mt-0.5">
                  Seguimiento Técnico y Avance Físico de Redes de Distribución
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-indigo-300">
                <Wrench className="h-6 w-6" />
              </div>
            </div>

            <div className="rounded-2xl bg-indigo-500/20 backdrop-blur-md border border-indigo-400/30 p-3 sm:p-3.5 flex items-center space-x-3">
              <div className="flex items-center text-indigo-300 font-black text-sm tracking-tighter shrink-0 animate-pulse">
                <span>&gt;&gt;&gt;</span>
              </div>
              <p className="text-xs sm:text-[13px] text-indigo-50 font-medium leading-snug">
                Inspección georreferenciada de planes de picada y poda, adecuación de subestaciones y reemplazo de conductores en las 25 entidades.
              </p>
            </div>

          </div>

          <div className="relative z-10 pt-5 flex items-center justify-between border-t border-white/10 mt-4">
            <span className="text-[11px] font-mono text-indigo-200/80 flex items-center space-x-1.5">
              <CheckCircle2 className="h-3 w-3 text-emerald-400" />
              <span>Auditoría COBIT 2019 (MEA02)</span>
            </span>

            <button
              onClick={() => setActiveModal('obras')}
              className="px-4 py-2 rounded-xl bg-white hover:bg-indigo-50 text-[#0c243b] text-xs font-extrabold shadow-md hover:shadow-lg active:scale-95 transition-all flex items-center space-x-1.5"
            >
              <span>CONSULTAR</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

        </div>

        {/* =========================================================================
            BANNER 4: CENTROS DE DESPACHO Y ASISTENCIA TÉCNICA (CIAU / GGPD)
            ========================================================================= */}
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#061e38] via-[#0c2d4f] to-[#041426] text-white p-6 sm:p-7 shadow-lg border border-blue-900/60 dark:border-teal-500/30 flex flex-col justify-between group hover:border-[#00f2fe]/80 transition-all duration-300">
          
          <div 
            className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#2dd4bf_1.5px,transparent_1.5px)] [background-size:16px_16px]" 
          />

          <div className="absolute -right-6 -bottom-6 opacity-10 pointer-events-none text-teal-300 select-none">
            <svg width="180" height="180" viewBox="0 0 100 100" fill="currentColor">
              <path d="M10 20 L35 50 L10 80 L25 80 L50 50 L25 20 Z" />
              <path d="M40 20 L65 50 L40 80 L55 80 L80 50 L55 20 Z" />
            </svg>
          </div>

          <div className="relative z-10 space-y-4">
            
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-teal-300 font-bold">
                  Enlace Operacional Continuo
                </span>
                <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                  CENTROS DE DESPACHO Y CIAU
                </h3>
                <div className="text-xs font-semibold text-teal-200/90 mt-0.5">
                  Coordinación Técnica entre Distribución y Transmisión
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-teal-300">
                <Headphones className="h-6 w-6" />
              </div>
            </div>

            <div className="rounded-2xl bg-teal-500/20 backdrop-blur-md border border-teal-400/30 p-3 sm:p-3.5 flex items-center space-x-3">
              <div className="flex items-center text-teal-300 font-black text-sm tracking-tighter shrink-0 animate-pulse">
                <span>&gt;&gt;&gt;</span>
              </div>
              <p className="text-xs sm:text-[13px] text-teal-50 font-medium leading-snug">
                Sincronización en tiempo real de cuadrillas de guardia, Centros Integrales de Atención al Usuario y salas de control estadal.
              </p>
            </div>

          </div>

          <div className="relative z-10 pt-5 flex items-center justify-between border-t border-white/10 mt-4">
            <span className="text-[11px] font-mono text-teal-200/80 flex items-center space-x-1.5">
              <Activity className="h-3 w-3 text-emerald-400" />
              <span>25 Salas Estadales Activas</span>
            </span>

            <button
              onClick={() => setActiveModal('soporte')}
              className="px-4 py-2 rounded-xl bg-white hover:bg-teal-50 text-[#061e38] text-xs font-extrabold shadow-md hover:shadow-lg active:scale-95 transition-all flex items-center space-x-1.5"
            >
              <span>CONTACTAR</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

        </div>

      </div>

      {/* =========================================================================
          INTERACTIVE MODALS FOR EACH SERVICE (NO DEAD ENDS / FULL EXPERIENCE)
          ========================================================================= */}

      {/* 1. Modal Denuncia / Canal Seguro */}
      {activeModal === 'denuncia' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-[#071326] border border-slate-200 dark:border-cyan-500/40 p-6 sm:p-7 shadow-2xl space-y-4 text-left">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-xl bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400">
                  <ShieldAlert className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-base font-black text-slate-900 dark:text-white">Canal Seguro de Integridad SEN</h4>
                  <span className="text-[11px] font-mono text-slate-500">Línea 0800-DENUNSA (3368672)</span>
                </div>
              </div>
              <button 
                onClick={() => { setActiveModal(null); setReportSent(false); }}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {reportSent ? (
              <div className="py-8 text-center space-y-3">
                <div className="h-12 w-12 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center">
                  <CheckCircle2 className="h-7 w-7" />
                </div>
                <h5 className="text-lg font-black text-slate-900 dark:text-white">Reporte Cifrado Transmitido</h5>
                <p className="text-xs text-slate-600 dark:text-slate-300 max-w-sm mx-auto">
                  El caso ha sido radicado bajo el código criptográfico <strong className="font-mono text-cyan-600 dark:text-cyan-400">SEN-2026-X889</strong> para investigación prioritaria por la Unidad de Protección y Seguridad de CORPOELEC.
                </p>
                <button
                  onClick={() => { setActiveModal(null); setReportSent(false); }}
                  className="px-5 py-2.5 rounded-xl bg-[#002b49] text-white dark:bg-[#00f2fe] dark:text-[#0a192f] text-xs font-bold"
                >
                  Entendido
                </button>
              </div>
            ) : (
              <form onSubmit={(e) => { e.preventDefault(); setReportSent(true); }} className="space-y-3.5 text-xs">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Tipo de Evento Crítico</label>
                  <select className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 p-2.5 text-slate-800 dark:text-slate-200">
                    <option>Sabotaje / Hurto de Conductores o Transformadores</option>
                    <option>Manipulación no autorizada de Subestación o Bahía</option>
                    <option>Riesgo de Incendio / Vegetación Crítica en Trazado</option>
                    <option>Vulneración de Ciberseguridad o Acceso No Autorizado</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Ubicación / Subestación / Circuito</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="Ej. S/E El Cafetal 115/13.8kV, Circuito A-04" 
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 p-2.5 text-slate-800 dark:text-slate-200" 
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Detalles del Reporte</label>
                  <textarea 
                    rows={3} 
                    required 
                    placeholder="Describa la anomalía de manera precisa..." 
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 p-2.5 text-slate-800 dark:text-slate-200"
                  />
                </div>

                <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-500/30 flex items-start space-x-2 text-[11px] text-amber-800 dark:text-amber-300">
                  <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
                  <span>Su reporte es totalmente anónimo y procesado con cifrado de grado militar según protocolo ISO 27001.</span>
                </div>

                <div className="flex items-center justify-end space-x-3 pt-2">
                  <button 
                    type="button" 
                    onClick={() => setActiveModal(null)} 
                    className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit" 
                    className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold flex items-center space-x-1.5 shadow-md"
                  >
                    <Send className="h-3.5 w-3.5" />
                    <span>Enviar Reporte Cifrado</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* 2. Modal Simulador de Carga */}
      {activeModal === 'simulador' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="w-full max-w-xl rounded-3xl bg-white dark:bg-[#071326] border border-slate-200 dark:border-sky-500/40 p-6 sm:p-7 shadow-2xl space-y-5 text-left">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-xl bg-sky-100 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400">
                  <Sliders className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-base font-black text-slate-900 dark:text-white">Simulador de Flujo y Cargabilidad GGPD</h4>
                  <span className="text-[11px] font-mono text-slate-500">Modelo Matemático de Redes en Tiempo Real</span>
                </div>
              </div>
              <button onClick={() => setActiveModal(null)} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Interactive Simulation Controls */}
            <div className="space-y-4 text-xs">
              <div>
                <div className="flex justify-between font-bold text-slate-700 dark:text-slate-300 mb-1">
                  <span>Nivel de Demanda del Circuito:</span>
                  <span className="font-mono text-sky-600 dark:text-sky-400 font-bold">{simulationState.loadPercentage}% MVA Nominal</span>
                </div>
                <input 
                  type="range" 
                  min="30" 
                  max="125" 
                  value={simulationState.loadPercentage}
                  onChange={(e) => setSimulationState({ ...simulationState, loadPercentage: Number(e.target.value) })}
                  className="w-full accent-sky-500 cursor-pointer"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Tensión de Operación</label>
                  <select 
                    value={simulationState.voltageLevel}
                    onChange={(e) => setSimulationState({ ...simulationState, voltageLevel: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 p-2 text-slate-800 dark:text-slate-200"
                  >
                    <option>13.8 kV (Distribución Urbana)</option>
                    <option>34.5 kV (Subtransmisión Rural)</option>
                    <option>115 kV (Alimentación S/E)</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Temperatura Ambiental (°C)</label>
                  <input 
                    type="number" 
                    value={simulationState.ambientTemp}
                    onChange={(e) => setSimulationState({ ...simulationState, ambientTemp: Number(e.target.value) })}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 p-2 text-slate-800 dark:text-slate-200 font-mono"
                  />
                </div>
              </div>

              {/* Simulation Result Output */}
              <div className="p-4 rounded-2xl bg-slate-100 dark:bg-[#0b172a] border border-slate-200 dark:border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-500 dark:text-slate-400">Estado Térmico del Devanado:</span>
                  <span className={`font-black ${simulationState.loadPercentage > 95 ? 'text-red-500 animate-pulse' : simulationState.loadPercentage > 80 ? 'text-amber-500' : 'text-emerald-500'}`}>
                    {simulationState.loadPercentage > 95 ? 'SOBRECARGA CRÍTICA (>95°C)' : simulationState.loadPercentage > 80 ? 'ALERTA TÉRMICA (78°C)' : 'ÓPTIMO (54°C)'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-500 dark:text-slate-400">Caída de Tensión Estimada (ΔV):</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {(simulationState.loadPercentage * 0.038).toFixed(2)}% (Norma IEEE 141)
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-500 dark:text-slate-400">Índice de Confiabilidad SAIDI proyectado:</span>
                  <span className="font-bold text-cyan-600 dark:text-cyan-400">18.4 min/año</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-[11px] text-slate-500 dark:text-slate-400">Módulo SCTIS V2.0 conectado</span>
              <button 
                onClick={() => { setActiveModal(null); onOpenAuth(); }}
                className="px-5 py-2.5 rounded-xl bg-[#002b49] hover:bg-[#003961] text-white dark:bg-[#00f2fe] dark:hover:bg-cyan-300 dark:text-[#0a192f] text-xs font-black"
              >
                Abrir Telemetría Completa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Modal Obras y Mantenimientos */}
      {activeModal === 'obras' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-[#071326] border border-slate-200 dark:border-indigo-500/40 p-6 sm:p-7 shadow-2xl space-y-4 text-left">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                  <Wrench className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-base font-black text-slate-900 dark:text-white">Plan Maestro de Obras y PRTSEN</h4>
                  <span className="text-[11px] font-mono text-slate-500">Módulo SCPPE V3.0 / GGPD</span>
                </div>
              </div>
              <button onClick={() => setActiveModal(null)} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300">
              Para consultar el desglose de proyectos de inversión, avances de electrificación por entidad territorial y control presupuestario bajo norma COBIT 2019:
            </p>

            <div className="space-y-2 font-mono text-xs">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 flex justify-between items-center">
                <span>Obras en Ejecución Nacional:</span>
                <span className="font-bold text-indigo-600 dark:text-indigo-400">142 Proyectos</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 flex justify-between items-center">
                <span>Transformadores Instalados 2026:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">1,890 Unidades</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 flex justify-between items-center">
                <span>Picada y Poda de Circuitos:</span>
                <span className="font-bold text-cyan-600 dark:text-cyan-400">4,230 km saneados</span>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => { setActiveModal(null); onOpenAuth(); }}
                className="px-5 py-2.5 rounded-xl bg-[#002b49] text-white dark:bg-[#00f2fe] dark:text-[#0a192f] text-xs font-black"
              >
                Ingresar a Gestión de Obras (SCPPE)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. Modal Soporte y Despacho */}
      {activeModal === 'soporte' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-[#071326] border border-slate-200 dark:border-teal-500/40 p-6 sm:p-7 shadow-2xl space-y-4 text-left">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-xl bg-teal-100 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400">
                  <Headphones className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-base font-black text-slate-900 dark:text-white">Centros de Despacho y Asistencia CIAU</h4>
                  <span className="text-[11px] font-mono text-slate-500">Mesa Técnica de Ayuda GGPD</span>
                </div>
              </div>
              <button onClick={() => setActiveModal(null)} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-700 dark:text-slate-300">
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
                <div className="font-black text-[#002b49] dark:text-[#00f2fe] text-xs">Mesa de Control Nacional (Despacho GGPD)</div>
                <div className="font-mono text-slate-500 dark:text-slate-400">soporte.ggpd@corpoelec.gob.ve</div>
                <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">Disponibilidad 24/7/365 · Canal Cifrado Nube</div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
                <div className="font-black text-[#002b49] dark:text-[#00f2fe] text-xs">Coordinación de 25 Salas Situacionales</div>
                <p className="text-[11px] text-slate-500">Para consultas directas por estado, ingrese al portal con el código de su entidad territorial.</p>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => { setActiveModal(null); onOpenAuth(); }}
                className="px-5 py-2.5 rounded-xl bg-[#002b49] text-white dark:bg-[#00f2fe] dark:text-[#0a192f] text-xs font-black"
              >
                Acceder al Directorio Operativo
              </button>
            </div>
          </div>
        </div>
      )}

    </section>
  );
};
