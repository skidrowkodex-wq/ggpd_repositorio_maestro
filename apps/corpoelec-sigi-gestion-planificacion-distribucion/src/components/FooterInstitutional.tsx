import React from 'react';
import { ShieldCheck, Cpu, Sparkles, Lock, ExternalLink } from 'lucide-react';

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

        {/* Institutional Links & Adscripción */}
        <div className="flex flex-col sm:flex-row items-center justify-between border-t border-slate-300 dark:border-slate-800/80 pt-6 gap-4 text-xs">
          <div>
            <span className="font-bold text-slate-900 dark:text-white">CORPOELEC — Gerencia Nacional de Gestión de Planificación de Distribución</span>
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
          <p>Cumplimiento normativo ISO 8000-110 (Calidad de Datos), ISO/IEC 27001 (Seguridad de la Información) e ISACA COBIT 2019.</p>
        </div>

      </div>
    </footer>
  );
};
