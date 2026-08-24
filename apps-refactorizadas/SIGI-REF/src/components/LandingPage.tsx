import React, { useState } from 'react';
import { 
  Shield, 
  Zap, 
  Lock, 
  Activity, 
  ArrowRight, 
  Database, 
  Server, 
  CheckCircle2, 
  MessageSquareOff, 
  FileText, 
  BarChart3, 
  Sparkles, 
  Cpu, 
  Layers, 
  ShieldCheck, 
  Award, 
  ExternalLink,
  MapPin,
  TrendingDown,
  Clock,
  Radio,
  Eye,
  Check,
  Info,
  Network
} from 'lucide-react';
import { VENEZUELAN_STATES } from '../mockData/portalData';
import { IndustrialActionBanners } from './IndustrialActionBanners';
import { SigiAcronymModal } from './SigiAcronymModal';

interface LandingPageProps {
  onOpenAuth: (stateCode?: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onOpenAuth }) => {
  const [isSigiModalOpen, setIsSigiModalOpen] = useState(false);
  return (
    <div className="relative overflow-hidden space-y-12 sm:space-y-16 pt-1 pb-10 transition-colors">
      
      {/* Background Decorative Ambient Illumination */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[450px] bg-gradient-to-r from-blue-400/20 via-cyan-400/15 to-amber-400/15 dark:from-[#00f2fe]/10 dark:via-[#4facfe]/10 dark:to-[#ffd700]/10 blur-[150px] pointer-events-none -z-10" />

      {/* =========================================================================
          SECTION 1: HERO EJECUTIVO — PITCH CORPORATIVO Y CENTRO DE MANDO SEN
          ========================================================================= */}
      <section className="mx-auto max-w-7xl px-2 sm:px-4 pt-2">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          
          {/* Left Column: Executive Value Proposition */}
          <div className="lg:col-span-7 space-y-6 text-left">
            
            {/* Badges Bar */}
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center space-x-1.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 px-3 py-1 border border-emerald-300 dark:border-emerald-500/40 text-emerald-900 dark:text-emerald-300 text-[11px] font-bold">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Ciberseguridad ISO 27001 & OWASP Top 10</span>
              </span>

              <span className="inline-flex items-center space-x-1.5 rounded-full bg-blue-100 dark:bg-blue-950/60 px-3 py-1 border border-blue-300 dark:border-blue-500/40 text-[#002b49] dark:text-[#00f2fe] text-[11px] font-bold">
                <Sparkles className="h-3.5 w-3.5 text-cyan-600 dark:text-[#00f2fe]" />
                <span>Gemini 3.6 Flash & Antigravity</span>
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.15]">
              Plataforma de Inteligencia y Gobernanza para la <br className="hidden sm:inline" />
              <span className="text-gradient">Distribución Eléctrica del SEN</span>
            </h1>

            {/* Subtitle */}
            <p className="text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed font-medium max-w-2xl">
              Ecosistema unificado de grado industrial para la toma de decisiones estratégicas del 
              <strong> Ministerio de Energía Eléctrica (MPPEE)</strong> y la <strong>Gerencia General de Planificación de Distribución (GGPD)</strong>. 
              Telemetría de continuidad de red, trazabilidad de activos y gobierno de datos en tiempo real para 25 salas situacionales.
            </p>

            {/* Strategic Value Points */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2 text-xs font-semibold text-slate-800 dark:text-slate-200">
              <div className="flex items-center space-x-2">
                <div className="h-5 w-5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <Check className="h-3 w-3" />
                </div>
                <span>Monitoreo 2,480+ Circuitos Nacionales</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="h-5 w-5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <Check className="h-3 w-3" />
                </div>
                <span>Trazabilidad ISO 55000 de Subestaciones</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="h-5 w-5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <Check className="h-3 w-3" />
                </div>
                <span>Control Presupuestario Preventivo (COBIT)</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="h-5 w-5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <Check className="h-3 w-3" />
                </div>
                <span>Directiva Zero-WhatsApp (Canal Seguro Nube)</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <button
                onClick={() => onOpenAuth()}
                className="flex items-center justify-center space-x-3 rounded-2xl bg-[#002b49] text-white dark:bg-gradient-to-r dark:from-[#00f2fe] dark:via-[#00b4d8] dark:to-[#ffd700] dark:text-[#0a192f] px-8 py-4 text-sm font-black uppercase shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all"
              >
                <Lock className="h-4 w-4" />
                <span>Ingreso Seguro a Salas Estadales</span>
                <ArrowRight className="h-4 w-4" />
              </button>
              
              <a
                href="#ecosistema-aplicaciones"
                className="flex items-center justify-center space-x-2 rounded-2xl bg-white dark:bg-[#0b1b36] px-6 py-4 text-sm font-bold text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700/80 hover:border-[#002b49] dark:hover:border-[#00f2fe]/50 shadow-sm transition-all text-center"
              >
                <Layers className="h-4 w-4 text-[#002b49] dark:text-[#00f2fe]" />
                <span>Ver 4 Aplicaciones Maestras</span>
              </a>
            </div>

          </div>

          {/* Right Column: Hero High-Tech Control Room Showcase */}
          <div className="lg:col-span-5 relative">
            
            {/* Visual Frame Container */}
            <div className="relative rounded-3xl overflow-hidden border border-slate-300 dark:border-[#00f2fe]/40 shadow-2xl bg-slate-900 group">
              <img 
                src="/images/control_room_hero.jpg" 
                alt="Centro de Mando Nacional de Distribución Eléctrica CORPOELEC"
                className="w-full h-[360px] sm:h-[420px] object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

              {/* Floating Live Telemetry Badge Overlay */}
              <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
                <span className="flex items-center space-x-1.5 rounded-full bg-slate-900/90 backdrop-blur-md px-3 py-1 text-[10px] font-mono font-bold text-emerald-400 border border-emerald-500/40 shadow-lg">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                  <span>BASE DE DATOS NUBE SEN · EN LÍNEA</span>
                </span>
                <span className="rounded-full bg-slate-900/90 backdrop-blur-md px-2.5 py-1 text-[10px] font-mono font-bold text-[#ffd700] border border-amber-500/40">
                  SAIDI: 22.4 min
                </span>
              </div>

              {/* Bottom Caption Overlay */}
              <div className="absolute bottom-4 left-4 right-4 p-4 rounded-2xl bg-slate-900/95 backdrop-blur-md border border-slate-800 text-left space-y-1">
                <div className="text-xs font-black text-white flex items-center justify-between">
                  <span>Sala Situacional Nacional de Distribución</span>
                  <span className="text-[10px] text-cyan-400 font-mono">25 Estados Conectados</span>
                </div>
                <p className="text-[11px] text-slate-300 font-medium leading-relaxed">
                  Monitoreo predictivo de transformadores, continuidad de alimentadores y contingencias meteorológicas.
                </p>
              </div>

            </div>

            {/* Floating Security Guarantee Pill */}
            <div className="absolute -bottom-4 -left-4 hidden sm:flex items-center space-x-2 rounded-2xl bg-white dark:bg-[#071326] p-3 border border-slate-200 dark:border-emerald-500/40 shadow-xl text-xs font-bold text-slate-900 dark:text-white">
              <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-mono">Gobernanza de Datos</div>
                <div>ISO 8000-110 Certificado</div>
              </div>
            </div>

          </div>

        </div>

        {/* Strategic Impact Metrics Bar */}
        <div className="mt-14 grid grid-cols-2 lg:grid-cols-4 gap-4 font-mono">
          
          <div className="bg-white dark:bg-[#0b172c] p-5 rounded-2xl border border-slate-200 dark:border-slate-800 border-t-4 border-t-[#002b49] dark:border-t-[#00f2fe] shadow-sm text-left">
            <div className="text-2xl sm:text-3xl font-black text-[#002b49] dark:text-[#00f2fe]">2,480+</div>
            <div className="text-xs font-bold text-slate-600 dark:text-slate-300 mt-1 uppercase tracking-wider">Circuitos Monitoreados</div>
            <div className="text-[10px] text-slate-500 mt-1 font-sans">Media y Baja Tensión SEN</div>
          </div>

          <div className="bg-white dark:bg-[#0b172c] p-5 rounded-2xl border border-slate-200 dark:border-slate-800 border-t-4 border-t-emerald-600 dark:border-t-emerald-400 shadow-sm text-left">
            <div className="text-2xl sm:text-3xl font-black text-emerald-700 dark:text-emerald-400">-45% MTTR</div>
            <div className="text-xs font-bold text-slate-600 dark:text-slate-300 mt-1 uppercase tracking-wider">Tiempo de Restauración</div>
            <div className="text-[10px] text-slate-500 mt-1 font-sans">Detección Geoespacial SCTIS</div>
          </div>

          <div className="bg-white dark:bg-[#0b172c] p-5 rounded-2xl border border-slate-200 dark:border-slate-800 border-t-4 border-t-[#d97706] dark:border-t-[#ffd700] shadow-sm text-left">
            <div className="text-2xl sm:text-3xl font-black text-[#d97706] dark:text-[#ffd700]">25 / 25</div>
            <div className="text-xs font-bold text-slate-600 dark:text-slate-300 mt-1 uppercase tracking-wider">Entidades Territoriales</div>
            <div className="text-[10px] text-slate-500 mt-1 font-sans">24 Estados + Guayana Esequiba</div>
          </div>

          <div className="bg-white dark:bg-[#0b172c] p-5 rounded-2xl border border-slate-200 dark:border-slate-800 border-t-4 border-t-purple-600 dark:border-t-purple-400 shadow-sm text-left">
            <div className="text-2xl sm:text-3xl font-black text-purple-700 dark:text-purple-400">100% Zero-WhatsApp</div>
            <div className="text-xs font-bold text-slate-600 dark:text-slate-300 mt-1 uppercase tracking-wider">Soberanía de Información</div>
            <div className="text-[10px] text-slate-500 mt-1 font-sans">Canal Nube Cifrado Seguro</div>
          </div>

        </div>

      </section>

      {/* =========================================================================
          SPECIAL SECTION: ¿QUÉ ES EL SIGI? — IDENTIDAD Y SIGNIFICADO ESTRATÉGICO
          ========================================================================= */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#072146] via-[#002b49] to-[#041426] text-white p-7 sm:p-9 shadow-2xl border border-blue-900/60 dark:border-[#00f2fe]/40 group hover:border-[#00f2fe]/80 transition-all duration-300">
          
          {/* Background Matrix & Watermark */}
          <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#00f2fe_1.5px,transparent_1.5px)] [background-size:16px_16px]" />
          <div className="absolute -right-8 -bottom-8 opacity-10 pointer-events-none text-[#00f2fe] select-none">
            <svg width="220" height="220" viewBox="0 0 100 100" fill="currentColor">
              <path d="M10 20 L35 50 L10 80 L25 80 L50 50 L25 20 Z" />
              <path d="M40 20 L65 50 L40 80 L55 80 L80 50 L55 20 Z" />
            </svg>
          </div>

          <div className="relative z-10 space-y-6">
            
            {/* Header with Title and Action */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-white/10 pb-6">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="px-3 py-1 rounded-full bg-[#00f2fe]/20 text-[#00f2fe] border border-[#00f2fe]/40 text-[10px] font-mono font-black uppercase tracking-wider flex items-center space-x-1.5">
                    <Info className="h-3.5 w-3.5" />
                    <span>Identidad Corporativa · GGPD CORPOELEC</span>
                  </span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-white mt-2 tracking-tight">
                  ¿Qué significa <span className="text-[#00f2fe]">SIGI</span> y cuál es su rol estratégico?
                </h2>
                <p className="text-sm font-semibold text-cyan-100/90 mt-1">
                  <strong>SIGI</strong> = <strong>S</strong>istema <strong>I</strong>ntegrado de <strong>G</strong>estión de la <strong>I</strong>nformación
                </p>
              </div>

              <button
                onClick={() => setIsSigiModalOpen(true)}
                className="flex items-center space-x-2 px-5 py-3 rounded-2xl bg-white hover:bg-cyan-50 text-[#072146] font-black text-xs uppercase shadow-lg hover:scale-105 active:scale-95 transition-all cursor-pointer shrink-0"
              >
                <Info className="h-4 w-4 text-[#002b49]" />
                <span>Ver Arquitectura Completa</span>
              </button>
            </div>

            {/* 4 Interactive Semantic Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              
              {/* Card S */}
              <div className="p-5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 hover:border-[#00f2fe]/60 transition-all space-y-2 group/card text-left">
                <div className="flex items-center justify-between">
                  <span className="h-10 w-10 rounded-xl bg-white text-[#072146] font-black text-xl flex items-center justify-center shadow-md">
                    S
                  </span>
                  <span className="text-[10px] font-mono font-bold text-cyan-200 uppercase">Pilar 01</span>
                </div>
                <h3 className="text-base font-black text-white group-hover/card:text-[#00f2fe] transition-colors">Sistema</h3>
                <p className="text-xs text-cyan-100/80 leading-relaxed">
                  Infraestructura unificada de microservicios y bases de datos relacionales PostgreSQL que interconecta todo el SEN.
                </p>
              </div>

              {/* Card I */}
              <div className="p-5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 hover:border-[#00f2fe]/60 transition-all space-y-2 group/card text-left">
                <div className="flex items-center justify-between">
                  <span className="h-10 w-10 rounded-xl bg-[#00f2fe] text-[#072146] font-black text-xl flex items-center justify-center shadow-md">
                    I
                  </span>
                  <span className="text-[10px] font-mono font-bold text-cyan-200 uppercase">Pilar 02</span>
                </div>
                <h3 className="text-base font-black text-white group-hover/card:text-[#00f2fe] transition-colors">Integrado</h3>
                <p className="text-xs text-cyan-100/80 leading-relaxed">
                  Conexión sinérgica de telemetría de fallas (SCTIS), inversiones (SCEIN), caracterización de activos y minutas técnicas.
                </p>
              </div>

              {/* Card G */}
              <div className="p-5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 hover:border-[#00f2fe]/60 transition-all space-y-2 group/card text-left">
                <div className="flex items-center justify-between">
                  <span className="h-10 w-10 rounded-xl bg-amber-400 text-[#072146] font-black text-xl flex items-center justify-center shadow-md">
                    G
                  </span>
                  <span className="text-[10px] font-mono font-bold text-cyan-200 uppercase">Pilar 03</span>
                </div>
                <h3 className="text-base font-black text-white group-hover/card:text-[#00f2fe] transition-colors">Gestión</h3>
                <p className="text-xs text-cyan-100/80 leading-relaxed">
                  Supervisión y control en tiempo real de indicadores KGI/KPI (SAIDI, SAIFI, ENS en MWh) para decisiones tácticas certeras.
                </p>
              </div>

              {/* Card I */}
              <div className="p-5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 hover:border-[#00f2fe]/60 transition-all space-y-2 group/card text-left">
                <div className="flex items-center justify-between">
                  <span className="h-10 w-10 rounded-xl bg-purple-400 text-[#072146] font-black text-xl flex items-center justify-center shadow-md">
                    I
                  </span>
                  <span className="text-[10px] font-mono font-bold text-cyan-200 uppercase">Pilar 04</span>
                </div>
                <h3 className="text-base font-black text-white group-hover/card:text-[#00f2fe] transition-colors">Información</h3>
                <p className="text-xs text-cyan-100/80 leading-relaxed">
                  Soberanía de datos bajo normas ISO 8000 e ISO 27001, reemplazando canales informales por repositorios auditables.
                </p>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 2: ECOSISTEMA DE LAS 4 APLICACIONES ESTRATÉGICAS (SHOWCASE)
          ========================================================================= */}
      <section id="ecosistema-aplicaciones" className="mx-auto max-w-7xl px-4 sm:px-6">
        
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-12">
          <div className="inline-flex items-center space-x-2 rounded-full bg-blue-100 dark:bg-blue-950/80 px-4 py-1 border border-blue-300 dark:border-blue-500/40 text-[#002b49] dark:text-[#00f2fe] text-xs font-bold">
            <Layers className="h-4 w-4" />
            <span>ECOSISTEMA INTEGRAL DE DISTRIBUCIÓN</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">
            Las 4 Soluciones Maestras de GGPD
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium">
            Arquitectura de microservicios interconectados mediante InsForge BaaS PostgreSQL, autenticación única SSO y base de datos relacional normalizada.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* App 1: SCTIS V2.0 */}
          <div className="rounded-3xl bg-white dark:bg-[#071326] p-7 border border-slate-200 dark:border-slate-800 hover:border-[#002b49] dark:hover:border-[#00f2fe]/60 shadow-md hover:shadow-xl transition-all space-y-4 group text-left">
            <div className="flex items-center justify-between">
              <div className="p-3 rounded-2xl bg-amber-100 dark:bg-amber-500/10 text-amber-800 dark:text-[#ffd700] border border-amber-300 dark:border-amber-500/30">
                <Activity className="h-6 w-6" />
              </div>
              <span className="text-[11px] font-mono font-bold px-2.5 py-1 rounded bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-[#ffd700] border border-amber-300 dark:border-amber-500/40">
                PUERTO :3002 · OPERATIVO
              </span>
            </div>
            
            <h3 className="text-xl font-black text-slate-900 dark:text-white group-hover:text-[#002b49] dark:group-hover:text-[#00f2fe] transition-colors">
              SCTIS V2.0 - Seguimiento y Control de Tiras de Interrupciones
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
              Sistema de telemetría y registro de interrupciones del servicio eléctrico. Automatiza el cálculo de índices internacionales de confiabilidad <strong>SAIDI</strong> (duración media) y <strong>SAIFI</strong> (frecuencia media), junto a la Energía No Suministrada (ENS en MWh).
            </p>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-slate-500 dark:text-slate-400">
              <span>Módulo: Telemetría & Fallas</span>
              <span className="text-emerald-700 dark:text-emerald-400 font-bold">✓ Cero Errores ISO 8000</span>
            </div>
          </div>

          {/* App 2: SCEIN V3.0 */}
          <div className="rounded-3xl bg-white dark:bg-[#071326] p-7 border border-slate-200 dark:border-slate-800 hover:border-[#002b49] dark:hover:border-[#00f2fe]/60 shadow-md hover:shadow-xl transition-all space-y-4 group text-left">
            <div className="flex items-center justify-between">
              <div className="p-3 rounded-2xl bg-cyan-100 dark:bg-cyan-500/10 text-cyan-800 dark:text-[#00f2fe] border border-cyan-300 dark:border-cyan-500/30">
                <Cpu className="h-6 w-6" />
              </div>
              <span className="text-[11px] font-mono font-bold px-2.5 py-1 rounded bg-cyan-100 dark:bg-cyan-950/60 text-cyan-900 dark:text-[#00f2fe] border border-cyan-300 dark:border-cyan-500/40">
                PUERTO :3005 · OPERATIVO
              </span>
            </div>
            
            <h3 className="text-xl font-black text-slate-900 dark:text-white group-hover:text-[#002b49] dark:group-hover:text-[#00f2fe] transition-colors">
              SCEIN V3.0 - Seguimiento y Control de Equipos Indisponibles
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
              Gestión y trazabilidad del ciclo de vida de transformadores de potencia, interruptores y bahías en subestaciones eléctricas conforme a la norma <strong>ISO 55000 / 55001</strong>. Monitoreo de diagnósticos físico-químicos y planes de recuperación.
            </p>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-slate-500 dark:text-slate-400">
              <span>Módulo: Activos Subestaciones</span>
              <span className="text-emerald-700 dark:text-emerald-400 font-bold">✓ Salud de Activos</span>
            </div>
          </div>

          {/* App 3: SCPPE V3.0 */}
          <div className="rounded-3xl bg-white dark:bg-[#071326] p-7 border border-slate-200 dark:border-slate-800 hover:border-[#002b49] dark:hover:border-[#00f2fe]/60 shadow-md hover:shadow-xl transition-all space-y-4 group text-left">
            <div className="flex items-center justify-between">
              <div className="p-3 rounded-2xl bg-emerald-100 dark:bg-emerald-500/10 text-emerald-800 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-500/30">
                <BarChart3 className="h-6 w-6" />
              </div>
              <span className="text-[11px] font-mono font-bold px-2.5 py-1 rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/40">
                PUERTO :3004 · OPERATIVO
              </span>
            </div>
            
            <h3 className="text-xl font-black text-slate-900 dark:text-white group-hover:text-[#002b49] dark:group-hover:text-[#00f2fe] transition-colors">
              SCPPE V3.0 - Seguimiento y Control de Planes y Proyectos Especiales de Distribucion
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
              Administración de obras de electrificación, proyectos PRTSEN y control financiero preventivo de comisiones de servicio bajo estándar <strong>ISACA COBIT 2019 (MEA02)</strong>. Validación presupuestaria antes de la asignación de recursos.
            </p>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-slate-500 dark:text-slate-400">
              <span>Módulo: Finanzas & Proyectos</span>
              <span className="text-emerald-700 dark:text-emerald-400 font-bold">✓ Control MEA02</span>
            </div>
          </div>

          {/* App 4: SCMTP V2.0 */}
          <div className="rounded-3xl bg-white dark:bg-[#071326] p-7 border border-slate-200 dark:border-slate-800 hover:border-[#002b49] dark:hover:border-[#00f2fe]/60 shadow-md hover:shadow-xl transition-all space-y-4 group text-left">
            <div className="flex items-center justify-between">
              <div className="p-3 rounded-2xl bg-purple-100 dark:bg-purple-500/10 text-purple-800 dark:text-purple-400 border border-purple-300 dark:border-purple-500/30">
                <FileText className="h-6 w-6" />
              </div>
              <span className="text-[11px] font-mono font-bold px-2.5 py-1 rounded bg-purple-100 dark:bg-purple-950/60 text-purple-900 dark:text-purple-300 border border-purple-300 dark:border-purple-500/40">
                PUERTO :3003 · OPERATIVO
              </span>
            </div>
            
            <h3 className="text-xl font-black text-slate-900 dark:text-white group-hover:text-[#002b49] dark:group-hover:text-[#00f2fe] transition-colors">
              SCMTP V2.0 - Seguimiento y Control de Minutas y Tareas de Planificacion
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
              Repositorio centralizado de acuerdos técnicos, minutas de reuniones operativas y asignación de compromisos por coordinación regional. Búsqueda semántica instantánea e historial inmutable de decisiones.
            </p>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-slate-500 dark:text-slate-400">
              <span>Módulo: Gestión Documental</span>
              <span className="text-emerald-700 dark:text-emerald-400 font-bold">✓ Trazabilidad Total</span>
            </div>
          </div>

        </div>

      </section>

      {/* =========================================================================
          SECTION 2.5: MÓDULOS DE ACCIÓN OPERATIVA E INSTITUCIONAL (OPCIÓN A)
          ========================================================================= */}
      <IndustrialActionBanners onOpenAuth={onOpenAuth} />

      {/* =========================================================================
          SECTION 3: SPOTLIGHT SUBESTACIÓN DIGITAL TWIN & RETORNO ESTRATÉGICO
          ========================================================================= */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="rounded-3xl bg-slate-900 border border-slate-800 overflow-hidden shadow-2xl text-white">
          <div className="grid grid-cols-1 lg:grid-cols-12 items-center">
            
            {/* Image Column */}
            <div className="lg:col-span-6 relative h-[320px] sm:h-[400px]">
              <img 
                src="/images/substation_digital_twin.jpg" 
                alt="Gemelo Digital de Subestación Eléctrica CORPOELEC"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-slate-900/90 hidden lg:block" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent lg:hidden" />
              
              <div className="absolute bottom-4 left-4 p-2.5 rounded-xl bg-slate-950/80 backdrop-blur-md border border-cyan-500/40 text-[10px] font-mono text-cyan-300">
                Telemetría Predictiva ISO 55000 · Salud 94%
              </div>
            </div>

            {/* Content Column */}
            <div className="lg:col-span-6 p-8 sm:p-10 space-y-5 text-left">
              <div className="inline-flex items-center space-x-2 rounded-full bg-amber-500/20 px-3 py-1 text-xs font-mono text-[#ffd700] border border-amber-500/40 font-bold">
                <Zap className="h-3.5 w-3.5" />
                <span>INNOVACIÓN TECNOLÓGICA GGPD</span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">
                Gemelos Digitales y Mantenimiento Predictivo del Parque de Transformadores
              </h2>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
                A través de la integración de SCEIN y modelos de analítica con Google Antigravity & Gemini, la GGPD anticipa fallas catastróficas en el aislamiento de subestaciones, optimizando la asignación de repuestos y reduciendo costos de mantenimiento en un 38%.
              </p>

              <div className="grid grid-cols-2 gap-4 pt-2 font-mono text-xs">
                <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700">
                  <div className="text-[#00f2fe] font-black text-lg">220 kV / 115 kV</div>
                  <div className="text-[10px] text-slate-400">Tensión Monitoreada</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700">
                  <div className="text-[#ffd700] font-black text-lg">0 Pérdidas</div>
                  <div className="text-[10px] text-slate-400">Integridad de Registros</div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 4: BÚNKER DE CIBERSEGURIDAD, GOBERNANZA Y CERTIFICACIONES
          ========================================================================= */}
      <section id="seguridad-certificaciones" className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="rounded-3xl bg-white dark:bg-[#061427] p-8 border border-slate-200 dark:border-emerald-500/40 shadow-md space-y-8">
          
          <div className="text-center max-w-3xl mx-auto space-y-2">
            <div className="inline-flex items-center space-x-2 rounded-full bg-emerald-100 dark:bg-emerald-950/80 px-4 py-1 border border-emerald-300 dark:border-emerald-500/50 text-emerald-800 dark:text-emerald-300 text-xs font-bold">
              <ShieldCheck className="h-4 w-4 text-emerald-700 dark:text-emerald-400" />
              <span>MARCO INSTITUCIONAL DE AUDITORÍA & CONFORMIDAD</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              Certificaciones Industriales y Soberanía Tecnológica
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
              Cumplimiento irrestricto de las directrices para la protección de infraestructuras críticas nacionales.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* ISO 27001 */}
            <div className="bg-slate-50 dark:bg-[#08172c] p-6 rounded-2xl border border-slate-200 dark:border-emerald-500/30 space-y-3 relative overflow-hidden group hover:border-emerald-500 transition-all text-left shadow-xs">
              <div className="flex items-center justify-between">
                <div className="p-3 rounded-xl bg-emerald-100 dark:bg-emerald-500/10 text-emerald-800 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30">
                  <Lock className="h-6 w-6" />
                </div>
                <span className="text-[10px] font-mono font-bold bg-emerald-100 dark:bg-emerald-900/40 text-emerald-900 dark:text-emerald-300 px-2 py-0.5 rounded border border-emerald-300 dark:border-emerald-500/30">
                  ISO/IEC 27001:2022
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Seguridad de la Información</h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
                Gestión integral de riesgos informáticos, cifrado de credenciales institucionales, control granular RBAC y trazabilidad de eventos.
              </p>
              <div className="pt-2 flex items-center space-x-2 text-[10px] text-emerald-800 dark:text-emerald-400 font-bold font-mono">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>Protección Cifrada TLS 256-bit</span>
              </div>
            </div>

            {/* ISO 8000 */}
            <div className="bg-slate-50 dark:bg-[#08172c] p-6 rounded-2xl border border-slate-200 dark:border-[#00f2fe]/30 space-y-3 relative overflow-hidden group hover:border-blue-500 transition-all text-left shadow-xs">
              <div className="flex items-center justify-between">
                <div className="p-3 rounded-xl bg-blue-100 dark:bg-[#00f2fe]/10 text-[#002b49] dark:text-[#00f2fe] border border-blue-200 dark:border-[#00f2fe]/30">
                  <Award className="h-6 w-6" />
                </div>
                <span className="text-[10px] font-mono font-bold bg-blue-100 dark:bg-cyan-900/40 text-[#002b49] dark:text-cyan-300 px-2 py-0.5 rounded border border-blue-300 dark:border-cyan-500/30">
                  ISO 8000-110
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Calidad y Calibración de Datos</h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
                Estandarización de nombres canónicos de subestaciones y circuitos, integridad semántica y erradicación de duplicados.
              </p>
              <div className="pt-2 flex items-center space-x-2 text-[10px] text-[#002b49] dark:text-[#00f2fe] font-bold font-mono">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>Norma GGPD-SGM-INS-005</span>
              </div>
            </div>

            {/* ISACA COBIT */}
            <div className="bg-slate-50 dark:bg-[#08172c] p-6 rounded-2xl border border-slate-200 dark:border-[#ffd700]/30 space-y-3 relative overflow-hidden group hover:border-amber-500 transition-all text-left shadow-xs">
              <div className="flex items-center justify-between">
                <div className="p-3 rounded-xl bg-amber-100 dark:bg-amber-500/10 text-amber-800 dark:text-amber-400 border border-amber-200 dark:border-amber-500/30">
                  <Shield className="h-6 w-6" />
                </div>
                <span className="text-[10px] font-mono font-bold bg-amber-100 dark:bg-amber-900/40 text-amber-900 dark:text-amber-300 px-2 py-0.5 rounded border border-amber-300 dark:border-amber-500/30">
                  ISACA COBIT 2019
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Gobierno Empresarial y Control</h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
                Alineación estratégica de los objetivos de la Gerencia General con los automatismos en nube y control financiero preventivo MEA02.
              </p>
              <div className="pt-2 flex items-center space-x-2 text-[10px] text-amber-800 dark:text-[#ffd700] font-bold font-mono">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>Auditoría de Control Interno</span>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* =========================================================================
          SECTION 5: MATRIZ NACIONAL INTERACTIVA DE 25 COORDINACIONES ESTADALES
          ========================================================================= */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="bg-white dark:bg-[#061224] p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-md space-y-6">
          
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold text-[#002b49] dark:text-[#00f2fe] tracking-widest uppercase font-mono">
              Red Territorial Interconectada
            </span>
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              25 Coordinaciones Estadales y Salas Situacionales
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Seleccione una coordinación para ingresar con ámbito geográfico fijado (*State-Lock*) y telemetría territorial:
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {VENEZUELAN_STATES.filter(st => st.code !== 'NAC').map(st => (
              <div
                key={st.code}
                onClick={() => onOpenAuth(st.code)}
                className="group flex flex-col items-center justify-center p-3.5 rounded-2xl bg-slate-50 dark:bg-[#081427] border border-slate-200 dark:border-slate-800 hover:border-[#002b49] dark:hover:border-[#00f2fe]/60 hover:bg-blue-50/80 dark:hover:bg-[#0e2140] transition-all cursor-pointer shadow-xs"
              >
                <div className="flex items-center space-x-1.5">
                  <span className="text-xs font-black text-[#002b49] dark:text-[#ffd700] group-hover:scale-110 transition-transform font-mono">
                    [{st.code}]
                  </span>
                  {st.code === 'GEQ' && (
                    <span className="text-[9px] px-1.5 py-0.2 bg-amber-500/20 text-amber-700 dark:text-amber-300 font-bold rounded">
                      PROYECTO
                    </span>
                  )}
                </div>
                <span className="text-xs font-bold text-slate-900 dark:text-slate-200 truncate w-full text-center mt-1">
                  {st.name}
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 font-mono">
                  {st.circuitsCount} CTs
                </span>
              </div>
            ))}
          </div>

          <div className="pt-3 text-center text-xs text-slate-500 dark:text-slate-400 font-medium">
            💡 <em>Al pulsar sobre cualquier estado, se abrirá la ventana segura con su ámbito territorial asignado.</em>
          </div>

        </div>
      </section>

      {/* =========================================================================
          SECTION 6: DIRECTIVA ZERO-WHATSAPP & FILOSOFÍA DE GESTIÓN
          ========================================================================= */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 space-y-8">
        
        {/* Zero-WhatsApp Banner */}
        <div className="rounded-3xl bg-amber-50 dark:bg-gradient-to-r dark:from-[#0b1b36] dark:via-[#122749] dark:to-[#0b1b36] p-6 sm:p-8 border border-amber-300 dark:border-[#ffd700]/40 relative overflow-hidden shadow-sm">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-start space-x-4 text-left">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-amber-100 dark:bg-amber-500/10 border border-amber-300 dark:border-amber-500/40 text-amber-800 dark:text-amber-400">
                <MessageSquareOff className="h-7 w-7" />
              </div>
              <div>
                <span className="inline-block rounded bg-amber-200 dark:bg-amber-500/20 px-2.5 py-0.5 text-[10px] font-black tracking-widest text-amber-900 dark:text-amber-300 uppercase mb-1">
                  Directiva Operativa Nacional 2026
                </span>
                <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                  Migración Obligatoria a Canales Nube Institucionales (Zero-WhatsApp)
                </h3>
                <p className="mt-1 text-xs text-slate-700 dark:text-slate-300 max-w-3xl leading-relaxed font-medium">
                  Para resguardar la seguridad de la información técnica del SEN conforme a la norma ISO 27001, 
                  queda restringido el uso de redes personales de mensajería. Toda minuta, reporte e inventario debe procesarse desde el Repositorio Maestro GGPD.
                </p>
              </div>
            </div>
            <button
              onClick={() => onOpenAuth()}
              className="shrink-0 flex items-center space-x-2 rounded-xl bg-amber-500 dark:bg-amber-400 px-5 py-3 text-xs font-black text-white dark:text-[#0a192f] hover:bg-amber-600 dark:hover:bg-amber-300 transition-colors shadow-md"
            >
              <span>Acceder al Portal Nube</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Misión y Visión */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-[#081224] p-7 rounded-3xl border border-slate-200 dark:border-amber-500/30 space-y-3 shadow-xs text-left">
            <div className="flex items-center space-x-3">
              <div className="p-3 rounded-2xl bg-amber-100 dark:bg-amber-500/10 text-amber-800 dark:text-amber-400 border border-amber-200 dark:border-amber-500/30">
                <Shield className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white">Misión Institucional</h3>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
              Garantizar un servicio eléctrico eficiente, con calidad, sentido social, sostenible y en equilibrio ecológico en todo el territorio nacional, promoviendo el desarrollo soberano del país con tecnologías innovadoras y talento humano altamente capacitado.
            </p>
          </div>

          <div className="bg-white dark:bg-[#081224] p-7 rounded-3xl border border-slate-200 dark:border-[#00f2fe]/30 space-y-3 shadow-xs text-left">
            <div className="flex items-center space-x-3">
              <div className="p-3 rounded-2xl bg-blue-100 dark:bg-[#00f2fe]/10 text-[#002b49] dark:text-[#00f2fe] border border-blue-200 dark:border-[#00f2fe]/30">
                <Cpu className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white">Visión Institucional</h3>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
              Consolidar a CORPOELEC como motor de desarrollo nacional y modelo de gestión de infraestructura crítica, sustentable, con soberanía tecnológica, gobierno de datos estandarizado y excelencia operativa en la distribución de energía.
            </p>
          </div>
        </div>

      </section>

      {/* Dedicated SIGI Explanation Modal */}
      <SigiAcronymModal 
        isOpen={isSigiModalOpen} 
        onClose={() => setIsSigiModalOpen(false)} 
      />

    </div>
  );
};
