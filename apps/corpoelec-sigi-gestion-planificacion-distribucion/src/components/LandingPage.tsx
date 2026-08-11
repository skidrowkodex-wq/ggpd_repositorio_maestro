import React from 'react';
import { Shield, Zap, CloudCheck, Lock, Activity, ArrowRight, Database, Server, CheckCircle2, MessageSquareOff, FileText, BarChart3, Sparkles, Cpu, Layers, ShieldCheck, Award, KeyRound } from 'lucide-react';
import { VENEZUELAN_STATES } from '../mockData/portalData';

interface LandingPageProps {
  onOpenAuth: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onOpenAuth }) => {
  return (
    <div className="relative overflow-hidden space-y-16 py-8 bg-industrial-grid transition-colors">
      
      {/* Background Decorative Glows */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-r from-blue-200/40 via-cyan-200/30 to-amber-200/30 dark:from-[#00f2fe]/15 dark:via-[#4facfe]/10 dark:to-[#ffd700]/10 blur-[140px] pointer-events-none -z-10" />

      {/* Hero Section: High Engineering & Executive Control Room */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 text-center pt-4">
        
        {/* Badges Bar */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-6">
          
          {/* Zona Segura Badge */}
          <div className="inline-flex items-center space-x-2 rounded-full bg-emerald-100 dark:bg-emerald-950/70 px-4 py-1.5 border border-emerald-300 dark:border-emerald-500/50 shadow-sm">
            <Lock className="h-3.5 w-3.5 text-emerald-700 dark:text-emerald-400" />
            <span className="text-xs font-black text-emerald-900 dark:text-emerald-300 uppercase tracking-wider">Zona Segura Cifrada 256-bit</span>
          </div>

          {/* Institutional Control Badge */}
          <div className="inline-flex items-center space-x-2 rounded-full bg-[#002b49] dark:bg-[#08182f] px-4 py-1.5 border border-blue-900 dark:border-[#00f2fe]/40 shadow-sm">
            <span className="flex h-2.5 w-2.5 rounded-full bg-cyan-400 dark:bg-[#00f2fe] animate-ping" />
            <span className="text-xs font-extrabold text-cyan-200 dark:text-[#00f2fe] uppercase tracking-wider">Centro de Mando de Ingeniería Eléctrica</span>
          </div>

          {/* AI Badge */}
          <div className="inline-flex items-center space-x-2 rounded-full bg-purple-100 dark:bg-purple-950/50 px-4 py-1.5 border border-purple-300 dark:border-purple-500/40 shadow-sm">
            <Sparkles className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400 animate-pulse" />
            <span className="text-xs font-bold text-purple-900 dark:text-gradient-ai">IA Avanzada: Google Antigravity & Gemini 3.6 Flash</span>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-slate-900 dark:text-white max-w-5xl mx-auto leading-tight">
          Sistema Integrado de Gestión de la Información <br />
          <span className="text-gradient">Planificación de Distribución (SIGI)</span>
        </h1>

        <p className="mt-6 text-base sm:text-lg text-slate-700 dark:text-slate-300 max-w-4xl mx-auto leading-relaxed font-medium">
          Plataforma de grado industrial para profesionales del SEN y Alta Directiva. Unificación de minutas técnicas, 
          dashboards analíticos y automatismos en la Nube con certificación ISO 27001, ISO 8000 e ISACA COBIT 2019.
        </p>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={onOpenAuth}
            className="w-full sm:w-auto flex items-center justify-center space-x-3 rounded-2xl bg-[#002b49] text-white dark:bg-gradient-to-r dark:from-[#00f2fe] dark:via-[#00b4d8] dark:to-[#ffd700] dark:text-[#0a192f] px-8 py-4 text-sm font-black uppercase shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all"
          >
            <Lock className="h-5 w-5" />
            <span>Ingreso Seguro al Portal (Passkey)</span>
            <ArrowRight className="h-5 w-5" />
          </button>
          
          <a
            href="#seguridad-certificaciones"
            className="w-full sm:w-auto flex items-center justify-center space-x-2 rounded-2xl bg-white dark:bg-[#0b1b36] px-6 py-4 text-sm font-semibold text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700/80 hover:border-[#002b49] dark:hover:border-[#00f2fe]/50 shadow-sm transition-all"
          >
            <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <span>Zona Segura & Certificaciones</span>
          </a>
        </div>

        {/* Live System Metrics Bar */}
        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto font-mono">
          <div className="bg-white dark:bg-[#0b172c] p-5 rounded-2xl text-center border border-slate-200 dark:border-slate-800 border-t-4 border-t-[#002b49] dark:border-t-[#00f2fe] shadow-sm">
            <div className="text-2xl sm:text-3xl font-black text-[#002b49] dark:text-[#00f2fe]">2,480</div>
            <div className="text-xs font-bold text-slate-600 dark:text-slate-300 mt-1 uppercase tracking-wider">Circuitos de Distribución</div>
          </div>
          <div className="bg-white dark:bg-[#0b172c] p-5 rounded-2xl text-center border border-slate-200 dark:border-slate-800 border-t-4 border-t-[#d97706] dark:border-t-[#ffd700] shadow-sm">
            <div className="text-2xl sm:text-3xl font-black text-[#d97706] dark:text-[#ffd700]">24 / 24</div>
            <div className="text-xs font-bold text-slate-600 dark:text-slate-300 mt-1 uppercase tracking-wider">Estados Interconectados</div>
          </div>
          <div className="bg-white dark:bg-[#0b172c] p-5 rounded-2xl text-center border border-slate-200 dark:border-slate-800 border-t-4 border-t-emerald-600 dark:border-t-emerald-400 shadow-sm">
            <div className="text-2xl sm:text-3xl font-black text-emerald-700 dark:text-emerald-400">60.00 Hz</div>
            <div className="text-xs font-bold text-slate-600 dark:text-slate-300 mt-1 uppercase tracking-wider">Estabilidad SEN</div>
          </div>
          <div className="bg-white dark:bg-[#0b172c] p-5 rounded-2xl text-center border border-slate-200 dark:border-slate-800 border-t-4 border-t-purple-600 dark:border-t-purple-400 shadow-sm">
            <div className="text-2xl sm:text-3xl font-black text-purple-700 dark:text-purple-400">Gemini 3.6 Pro</div>
            <div className="text-xs font-bold text-slate-600 dark:text-slate-300 mt-1 uppercase tracking-wider">Motor Analítico IA</div>
          </div>
        </div>
      </section>

      {/* Security & Governance Certifications Section */}
      <section id="seguridad-certificaciones" className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="rounded-3xl bg-white dark:bg-gradient-to-br dark:from-[#061427] dark:via-[#091f3a] dark:to-[#061427] p-8 border border-slate-200 dark:border-emerald-500/40 shadow-sm space-y-8">
          
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center space-x-2 rounded-full bg-emerald-100 dark:bg-emerald-950/80 px-4 py-1 border border-emerald-300 dark:border-emerald-500/50 text-emerald-800 dark:text-emerald-300 text-xs font-bold mb-3">
              <ShieldCheck className="h-4 w-4 text-emerald-700 dark:text-emerald-400" />
              <span>ZONA SEGURA INSTITUCIONAL & MARCO DE AUDITORÍA</span>
            </div>
            <h2 className="text-3xl font-black text-slate-900 dark:text-white">Certificaciones Industriales de Seguridad y Datos</h2>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 font-medium">
              Cumplimiento estricto de los estándares internacionales de protección de infraestructura crítica y gobernanza de datos
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* ISO 27001 Card */}
            <div className="bg-slate-50 dark:bg-[#08172c] p-6 rounded-2xl border border-slate-200 dark:border-emerald-500/30 space-y-3 relative overflow-hidden group hover:border-emerald-500 transition-all shadow-sm">
              <div className="flex items-center justify-between">
                <div className="p-3 rounded-xl bg-emerald-100 dark:bg-emerald-500/10 text-emerald-800 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30">
                  <Lock className="h-6 w-6" />
                </div>
                <span className="text-[10px] font-mono font-bold bg-emerald-100 dark:bg-emerald-900/40 text-emerald-900 dark:text-emerald-300 px-2 py-0.5 rounded border border-emerald-300 dark:border-emerald-500/30">
                  ISO/IEC 27001:2022
                </span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Seguridad de la Información</h3>
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-normal">
                Gestión de riesgos informáticos, cifrado de credenciales institucionales, control granular de roles y auditoría de descargas documentales.
              </p>
              <div className="pt-2 flex items-center space-x-2 text-[10px] text-emerald-800 dark:text-emerald-400 font-bold">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>Protección Cifrada TLS 256-bit</span>
              </div>
            </div>

            {/* ISO 8000 Card */}
            <div className="bg-slate-50 dark:bg-[#08172c] p-6 rounded-2xl border border-slate-200 dark:border-[#00f2fe]/30 space-y-3 relative overflow-hidden group hover:border-blue-500 transition-all shadow-sm">
              <div className="flex items-center justify-between">
                <div className="p-3 rounded-xl bg-blue-100 dark:bg-[#00f2fe]/10 text-[#002b49] dark:text-[#00f2fe] border border-blue-200 dark:border-[#00f2fe]/30">
                  <Award className="h-6 w-6" />
                </div>
                <span className="text-[10px] font-mono font-bold bg-blue-100 dark:bg-cyan-900/40 text-[#002b49] dark:text-cyan-300 px-2 py-0.5 rounded border border-blue-300 dark:border-cyan-500/30">
                  ISO 8000-110
                </span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Calidad y Gobernanza de Datos</h3>
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-normal">
                Normalización de nombres de subestaciones y circuitos, integridad semántica, deduplicación automatizada de minutas e inventarios.
              </p>
              <div className="pt-2 flex items-center space-x-2 text-[10px] text-[#002b49] dark:text-[#00f2fe] font-bold">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>Normativa GGPD-SGM-INS-005</span>
              </div>
            </div>

            {/* ISACA COBIT Card */}
            <div className="bg-slate-50 dark:bg-[#08172c] p-6 rounded-2xl border border-slate-200 dark:border-[#ffd700]/30 space-y-3 relative overflow-hidden group hover:border-amber-500 transition-all shadow-sm">
              <div className="flex items-center justify-between">
                <div className="p-3 rounded-xl bg-amber-100 dark:bg-amber-500/10 text-amber-800 dark:text-amber-400 border border-amber-200 dark:border-amber-500/30">
                  <Shield className="h-6 w-6" />
                </div>
                <span className="text-[10px] font-mono font-bold bg-amber-100 dark:bg-amber-900/40 text-amber-900 dark:text-amber-300 px-2 py-0.5 rounded border border-amber-300 dark:border-amber-500/30">
                  ISACA COBIT 2019
                </span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Gobierno Empresarial de TI</h3>
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-normal">
                Alineación estratégica de los objetivos de la Gerencia Nacional con los automatismos tecnológicos e informes para la Alta Dirección.
              </p>
              <div className="pt-2 flex items-center space-x-2 text-[10px] text-amber-800 dark:text-[#ffd700] font-bold">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>Auditoría de Control Interno</span>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* Zero-WhatsApp Official Directive Banner */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="rounded-3xl bg-amber-50 dark:bg-gradient-to-r dark:from-[#0b1b36] dark:via-[#122749] dark:to-[#0b1b36] p-6 sm:p-8 border border-amber-300 dark:border-[#ffd700]/40 relative overflow-hidden shadow-sm">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-start space-x-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-amber-100 dark:bg-amber-500/10 border border-amber-300 dark:border-amber-500/40 text-amber-800 dark:text-amber-400">
                <MessageSquareOff className="h-7 w-7" />
              </div>
              <div>
                <span className="inline-block rounded bg-amber-200 dark:bg-amber-500/20 px-2.5 py-0.5 text-[10px] font-black tracking-widest text-amber-900 dark:text-amber-300 uppercase mb-1">
                  Directiva Operativa Nacional 2026
                </span>
                <h3 className="text-xl font-black text-slate-900 dark:text-white">
                  Migración Obligatoria a Canales Nube Institucionales (Zero-WhatsApp)
                </h3>
                <p className="mt-1 text-xs text-slate-700 dark:text-slate-300 max-w-3xl leading-relaxed font-medium">
                  Para resguardar la seguridad de la información técnica del Sistema Eléctrico Nacional conforme a la norma ISO 27001, 
                  queda restringido el uso de redes personales de mensajería. Toda minuta y reporte debe procesarse desde este portal.
                </p>
              </div>
            </div>
            <button
              onClick={onOpenAuth}
              className="shrink-0 flex items-center space-x-2 rounded-xl bg-amber-500 dark:bg-amber-400 px-5 py-3 text-xs font-black text-white dark:text-[#0a192f] hover:bg-amber-600 dark:hover:bg-amber-300 transition-colors shadow-md"
            >
              <span>Acceder al Portal Nube</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Misión y Visión Section */}
      <section id="mision-vision" className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="text-center mb-8">
          <span className="text-xs font-bold text-[#002b49] dark:text-[#00f2fe] tracking-widest uppercase">Fundamentos Corporativos</span>
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">Filosofía de Gestión CORPOELEC</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          <div className="bg-white dark:bg-[#081224] p-8 rounded-3xl border border-slate-200 dark:border-amber-500/30 space-y-4 shadow-sm">
            <div className="flex items-center space-x-3">
              <div className="p-3 rounded-2xl bg-amber-100 dark:bg-amber-500/10 text-amber-800 dark:text-amber-400 border border-amber-200 dark:border-amber-500/30">
                <Shield className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white">Misión Institucional</h3>
            </div>
            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed text-justify font-normal">
              Garantizar un servicio eléctrico en todo el territorio nacional, eficiente, con calidad, sentido social, sostenible y en equilibrio ecológico, que promueva el desarrollo del país, con la participación activa, protagónica y corresponsable del Poder Popular, comprometido con la Ética Socialista y el Plan de la Patria, contribuyendo a la Seguridad y Defensa de la Nación.
            </p>
          </div>

          <div className="bg-white dark:bg-[#081224] p-8 rounded-3xl border border-slate-200 dark:border-[#00f2fe]/30 space-y-4 shadow-sm">
            <div className="flex items-center space-x-3">
              <div className="p-3 rounded-2xl bg-blue-100 dark:bg-[#00f2fe]/10 text-[#002b49] dark:text-[#00f2fe] border border-blue-200 dark:border-[#00f2fe]/30">
                <Cpu className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white">Visión Institucional</h3>
            </div>
            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed text-justify font-normal">
              Ser la corporación eléctrica, motor del desarrollo nacional y modelo de gestión en la prestación de servicio público, con ética socialista, ambiental y económicamente sustentable, con tecnologías innovadoras y talento humano altamente capacitado como garantes del uso racional y eficiente de la energía.
            </p>
          </div>

        </div>
      </section>

      {/* Venezuelan 24 States Interconnected Grid */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="bg-white dark:bg-[#061224] p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-center mb-6">
            <span className="text-xs font-bold text-[#002b49] dark:text-[#00f2fe] tracking-widest uppercase">Red Nacional Interconectada</span>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">24 Coordinaciones Estadales de Distribución</h3>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
            {VENEZUELAN_STATES.slice(0, 24).map(st => (
              <div
                key={st.code}
                onClick={onOpenAuth}
                className="group flex flex-col items-center justify-center p-3 rounded-xl bg-slate-50 dark:bg-[#081427] border border-slate-200 dark:border-slate-800 hover:border-[#002b49] dark:hover:border-[#00f2fe]/50 hover:bg-blue-50 dark:hover:bg-[#0e2140] transition-all cursor-pointer shadow-xs"
              >
                <span className="text-xs font-black text-[#002b49] dark:text-[#ffd700] group-hover:scale-110 transition-transform font-mono">{st.code}</span>
                <span className="text-[11px] font-bold text-slate-900 dark:text-slate-200 truncate w-full text-center">{st.name}</span>
                <span className="text-[10px] text-slate-600 dark:text-slate-400 mt-1 font-semibold">{st.circuitsCount} CTs</span>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
};
