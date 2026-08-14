import React from 'react';
import { ShieldCheck, Cpu, Sparkles, Lock, ExternalLink, ShieldAlert, Award, CheckCircle2 } from 'lucide-react';

export const FooterInstitutional: React.FC = () => {
  return (
    <footer className="w-full border-t border-slate-300 dark:border-[#00f2fe]/30 bg-slate-100 dark:bg-[#040814] text-slate-700 dark:text-slate-300 pt-10 pb-6 mt-16 transition-colors">
      
      <div className="mx-auto max-w-7xl px-4 sm:px-6 space-y-8">
        
        {/* Main Grid: Misión, Visión & AI Co-Development */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Misión */}
          <div className="space-y-3 bg-white dark:bg-[#081224] p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <h4 className="text-xs font-black uppercase text-[#d97706] dark:text-amber-400 tracking-wider flex items-center space-x-2">
              <ShieldCheck className="h-4 w-4" />
              <span>Misión Institucional</span>
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed text-justify">
              Garantizar un servicio eléctrico en todo el territorio nacional, eficiente, con calidad, sentido social, sostenible y en equilibrio ecológico, que promueva el desarrollo del país, con la participación activa y protagónica del Poder Popular, comprometido con la Ética Socialista y el Plan de la Patria.
            </p>
          </div>

          {/* Visión */}
          <div className="space-y-3 bg-white dark:bg-[#081224] p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <h4 className="text-xs font-black uppercase text-[#002b49] dark:text-[#00f2fe] tracking-wider flex items-center space-x-2">
              <Cpu className="h-4 w-4" />
              <span>Visión Institucional</span>
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed text-justify">
              Ser la corporación eléctrica, motor del desarrollo nacional y modelo de gestión en la prestación de servicio público, con ética socialista, ambiental y económicamente sustentable, con tecnologías innovadoras y talento humano altamente capacitado como garantes del uso racional y eficiente de la energía.
            </p>
          </div>

          {/* AI Co-Development & Technical Attributes */}
          <div className="space-y-3 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-[#0c192e] dark:to-[#120a24] p-5 rounded-2xl border border-purple-200 dark:border-purple-500/30 shadow-sm">
            <h4 className="text-xs font-black uppercase text-purple-700 dark:text-gradient-ai tracking-wider flex items-center space-x-2">
              <Sparkles className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              <span>Co-Desarrollo de IA de Alto Nivel</span>
            </h4>
            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
              Plataforma desarrollada e impulsada con Inteligencia Artificial Avanzada: <strong className="text-purple-800 dark:text-purple-300">Google Antigravity</strong> y <strong className="text-[#002b49] dark:text-[#00f2fe]">Gemini 3.6 Flash (Modelo Pro Actual)</strong>, diseñada bajo estándares de ingeniería eléctrica de grado industrial para la toma de decisiones estratégicas del SEN.
            </p>
            <div className="pt-2 flex flex-wrap gap-2 text-[10px] font-mono text-purple-800 dark:text-purple-300">
              <span className="rounded bg-purple-200 dark:bg-purple-900/40 px-2 py-0.5 border border-purple-300 dark:border-purple-500/30">Gemini 3.6 Flash</span>
              <span className="rounded bg-cyan-200 dark:bg-cyan-900/40 px-2 py-0.5 border border-cyan-300 dark:border-cyan-500/30">Antigravity Agentic Stack</span>
            </div>
          </div>

        </div>

        {/* Industrial Standards & OWASP Security Ribbon */}
        <div className="rounded-2xl bg-white dark:bg-[#071326] p-4 border border-slate-200 dark:border-slate-800/90 shadow-xs">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className="h-9 w-9 rounded-xl bg-blue-50 dark:bg-cyan-950/60 text-[#002b49] dark:text-[#00f2fe] flex items-center justify-center border border-blue-200 dark:border-cyan-800 shrink-0">
                <Award className="h-5 w-5" />
              </div>
              <div>
                <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider block">
                  Marco Regulatorio, Calidad de Datos y Ciberseguridad Aplicada
                </span>
                <span className="text-[11px] text-slate-600 dark:text-slate-300 font-medium">
                  Arquitectura robustecida con protección contra vulnerabilidades Web, controles de integridad y gobierno corporativo.
                </span>
              </div>
            </div>

            {/* Certification Badges */}
            <div className="flex flex-wrap items-center gap-2 font-mono text-[10px] font-bold">
              <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-700 flex items-center space-x-1" title="Seguridad de la Información y RLS">
                <Lock className="h-3 w-3 text-emerald-600" />
                <span>ISO/IEC 27001:2022</span>
              </span>

              <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-800 dark:bg-cyan-950/60 dark:text-cyan-300 border border-blue-200 dark:border-cyan-700 flex items-center space-x-1" title="Calidad de Datos Sintáctica y Semántica">
                <CheckCircle2 className="h-3 w-3 text-blue-600" />
                <span>ISO 8000-110</span>
              </span>

              <span className="px-2.5 py-1 rounded-lg bg-purple-50 text-purple-900 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200 dark:border-purple-700 flex items-center space-x-1" title="Mitigación OWASP Top 10: XSS, SQLi, CSRF, Password Strength & Hardening">
                <ShieldCheck className="h-3 w-3 text-purple-600 dark:text-purple-400" />
                <span>OWASP TOP 10 HARDENED</span>
              </span>

              <span className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-900 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-700 flex items-center space-x-1" title="Gobierno y Auditoría de TI">
                <Award className="h-3 w-3 text-amber-600" />
                <span>ISACA COBIT 2019</span>
              </span>

              <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700 flex items-center space-x-1" title="Gestión de Ciclo de Vida de Activos Eléctricos">
                <Cpu className="h-3 w-3 text-slate-600" />
                <span>ISO 55000 / 55001</span>
              </span>
            </div>
          </div>
        </div>

        {/* Institutional Links & Adscripción */}
        <div className="flex flex-col sm:flex-row items-center justify-between border-t border-slate-300 dark:border-slate-800/80 pt-6 gap-4 text-xs">
          <div>
            <span className="font-bold text-slate-900 dark:text-white">CORPOELEC — Gerencia General de Planificación de Distribución (GGPD)</span>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Órgano adscrito al Ministerio del Poder Popular para la Energía Eléctrica (MPPEE). República Bolivariana de Venezuela.
            </p>
          </div>

          <div className="flex items-center space-x-4 text-xs font-semibold">
            <a href="https://corpoelec.gob.ve/" target="_blank" rel="noopener noreferrer" className="text-[#002b49] dark:text-[#00f2fe] hover:underline flex items-center space-x-1">
              <span>Portal Oficial CORPOELEC</span>
              <ExternalLink className="h-3 w-3" />
            </a>
            <a href="https://corpoelec.gob.ve/mision-vision-valores/" target="_blank" rel="noopener noreferrer" className="text-[#d97706] dark:text-[#ffd700] hover:underline flex items-center space-x-1">
              <span>Misión y Visión</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>

        {/* Legal Disclaimer */}
        <div className="text-center pt-4 border-t border-slate-300 dark:border-slate-800 text-[10px] text-slate-500 space-y-1">
          <p>© 2026 Corporación Eléctrica Nacional (CORPOELEC). Todos los derechos reservados.</p>
          <p>Cumplimiento normativo ISO 8000-110 (Calidad de Datos), ISO/IEC 27001 (Seguridad de la Información), OWASP Top 10 (Seguridad en Aplicaciones Web), ISO 55000 e ISACA COBIT 2019 (MEA02).</p>
        </div>

      </div>
    </footer>
  );
};
