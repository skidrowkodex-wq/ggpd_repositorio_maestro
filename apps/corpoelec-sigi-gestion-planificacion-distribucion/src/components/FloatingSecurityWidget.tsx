import React, { useState } from 'react';
import { 
  ShieldCheck, 
  X, 
  Lock, 
  CheckCircle2, 
  Database, 
  FileCheck, 
  Award, 
  ShieldAlert, 
  Cpu, 
  ExternalLink,
  ChevronRight,
  Sparkles,
  Key,
  Shield,
  Activity
} from 'lucide-react';

export const FloatingSecurityWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'ISO27001' | 'ISO8000' | 'OWASP' | 'ISO55000' | 'COBIT'>('ISO27001');

  return (
    <>
      {/* FLOATING TRIGGER BUTTON (Bottom-Right) */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex items-center space-x-2.5 rounded-full bg-slate-900/90 text-white dark:bg-[#091830]/95 dark:text-[#00f2fe] p-2.5 pr-4 border border-emerald-500/40 dark:border-[#00f2fe]/40 shadow-2xl backdrop-blur-md hover:scale-105 transition-all group ring-4 ring-emerald-500/10 dark:ring-[#00f2fe]/10"
        title="Verificar Centro de Gobernanza, Seguridad ISO & OWASP"
      >
        <div className="relative flex items-center justify-center h-8 w-8 rounded-full bg-emerald-500/20 text-emerald-400 dark:bg-[#00f2fe]/20 dark:text-[#00f2fe] border border-emerald-400/40 dark:border-[#00f2fe]/40">
          <ShieldCheck className="h-4 w-4 animate-pulse" />
          <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-500 border-2 border-slate-900 animate-ping" />
        </div>
        <div className="text-left leading-none">
          <div className="text-[10px] font-mono font-black text-emerald-400 dark:text-[#00f2fe] tracking-wider uppercase flex items-center space-x-1">
            <span>NORMATIVA ISO & OWASP</span>
          </div>
          <div className="text-[9px] font-extrabold text-slate-300 dark:text-slate-400 mt-0.5 flex items-center space-x-1">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 inline-block" />
            <span>100% CUMPLIMIENTO VERIFICADO</span>
          </div>
        </div>
      </button>

      {/* COMPLIANCE MODAL DRAWER */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-3xl rounded-3xl bg-white dark:bg-[#081326] p-6 border border-slate-200 dark:border-[#00f2fe]/40 space-y-5 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            
            {/* Header */}
            <div className="flex items-start justify-between border-b border-slate-200 dark:border-slate-800 pb-4 shrink-0">
              <div className="flex items-center space-x-3">
                <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60">
                  <Award className="h-6 w-6" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-lg font-black text-slate-900 dark:text-white">
                      Centro de Gobernanza, Seguridad ISO & OWASP
                    </h3>
                    <span className="text-[10px] font-mono font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                      GGPD — CORPOELEC
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 font-medium mt-0.5">
                    Matriz de estándares internacionales aplicados en la arquitectura del Portal SIGI.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center space-x-2 overflow-x-auto pb-1 shrink-0 scrollbar-none">
              <button
                onClick={() => setActiveTab('ISO27001')}
                className={`px-3 py-2 rounded-xl text-xs font-black transition-all flex items-center space-x-1.5 whitespace-nowrap ${
                  activeTab === 'ISO27001'
                    ? 'bg-[#002b49] text-white dark:bg-gradient-to-r dark:from-[#00f2fe] dark:to-[#00b4d8] dark:text-[#0a192f] shadow-md'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-[#112240] dark:text-slate-300 dark:hover:text-white'
                }`}
              >
                <Shield className="h-3.5 w-3.5" />
                <span>1. ISO/IEC 27001 (Seguridad)</span>
              </button>

              <button
                onClick={() => setActiveTab('OWASP')}
                className={`px-3 py-2 rounded-xl text-xs font-black transition-all flex items-center space-x-1.5 whitespace-nowrap ${
                  activeTab === 'OWASP'
                    ? 'bg-[#002b49] text-white dark:bg-gradient-to-r dark:from-[#00f2fe] dark:to-[#00b4d8] dark:text-[#0a192f] shadow-md'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-[#112240] dark:text-slate-300 dark:hover:text-white'
                }`}
              >
                <Lock className="h-3.5 w-3.5" />
                <span>2. OWASP Top 10</span>
              </button>

              <button
                onClick={() => setActiveTab('ISO8000')}
                className={`px-3 py-2 rounded-xl text-xs font-black transition-all flex items-center space-x-1.5 whitespace-nowrap ${
                  activeTab === 'ISO8000'
                    ? 'bg-[#002b49] text-white dark:bg-gradient-to-r dark:from-[#00f2fe] dark:to-[#00b4d8] dark:text-[#0a192f] shadow-md'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-[#112240] dark:text-slate-300 dark:hover:text-white'
                }`}
              >
                <Database className="h-3.5 w-3.5" />
                <span>3. ISO 8000 (Calidad Datos)</span>
              </button>

              <button
                onClick={() => setActiveTab('ISO55000')}
                className={`px-3 py-2 rounded-xl text-xs font-black transition-all flex items-center space-x-1.5 whitespace-nowrap ${
                  activeTab === 'ISO55000'
                    ? 'bg-[#002b49] text-white dark:bg-gradient-to-r dark:from-[#00f2fe] dark:to-[#00b4d8] dark:text-[#0a192f] shadow-md'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-[#112240] dark:text-slate-300 dark:hover:text-white'
                }`}
              >
                <Cpu className="h-3.5 w-3.5" />
                <span>4. ISO 55000 (Activos)</span>
              </button>

              <button
                onClick={() => setActiveTab('COBIT')}
                className={`px-3 py-2 rounded-xl text-xs font-black transition-all flex items-center space-x-1.5 whitespace-nowrap ${
                  activeTab === 'COBIT'
                    ? 'bg-[#002b49] text-white dark:bg-gradient-to-r dark:from-[#00f2fe] dark:to-[#00b4d8] dark:text-[#0a192f] shadow-md'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-[#112240] dark:text-slate-300 dark:hover:text-white'
                }`}
              >
                <FileCheck className="h-3.5 w-3.5" />
                <span>5. ISACA COBIT 2019</span>
              </button>
            </div>

            {/* Tab Content Details */}
            <div className="overflow-y-auto pr-1 space-y-4 flex-1 text-xs">
              
              {/* TAB 1: ISO 27001 */}
              {activeTab === 'ISO27001' && (
                <div className="space-y-3">
                  <div className="p-4 rounded-2xl bg-blue-50/70 dark:bg-[#0c1a30] border border-blue-200 dark:border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-[#002b49] dark:text-[#00f2fe] uppercase">ISO/IEC 27001:2022 — Seguridad de la Información</span>
                      <span className="text-[10px] font-mono font-bold bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-300 px-2 py-0.5 rounded-md">VERIFICADO</span>
                    </div>
                    <p className="text-slate-700 dark:text-slate-300 font-medium">
                      Garantiza la confidencialidad, integridad y disponibilidad del sistema de credenciales y datos de planificación de la República.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#0a1526] border border-slate-200 dark:border-slate-800 space-y-1.5">
                      <div className="flex items-center space-x-2 text-emerald-600 dark:text-emerald-400 font-bold">
                        <Key className="h-4 w-4" />
                        <span>Autenticación SSO y Tokens JWT</span>
                      </div>
                      <p className="text-slate-600 dark:text-slate-300 text-[11px]">
                        Single Sign-On firmado con algoritmos SHA-256 / RSA. Elimina la exposición de contraseñas repetidas en aplicaciones satélites.
                      </p>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#0a1526] border border-slate-200 dark:border-slate-800 space-y-1.5">
                      <div className="flex items-center space-x-2 text-emerald-600 dark:text-emerald-400 font-bold">
                        <Activity className="h-4 w-4" />
                        <span>Bitácora Inmutable (sigi.bitacora_sso)</span>
                      </div>
                      <p className="text-slate-600 dark:text-slate-300 text-[11px]">
                        Registro inalterable de eventos de acceso, emisión de tokens y cambios de permisos con estampa de tiempo ISO 8601 y dirección IP.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: OWASP TOP 10 */}
              {activeTab === 'OWASP' && (
                <div className="space-y-3">
                  <div className="p-4 rounded-2xl bg-blue-50/70 dark:bg-[#0c1a30] border border-blue-200 dark:border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-[#002b49] dark:text-[#00f2fe] uppercase">OWASP Top 10 (2021) — Hardening Web</span>
                      <span className="text-[10px] font-mono font-bold bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-300 px-2 py-0.5 rounded-md">APLICADO</span>
                    </div>
                    <p className="text-slate-700 dark:text-slate-300 font-medium">
                      Blindaje contra las 10 vulnerabilidades más críticas de aplicaciones web según Open Web Application Security Project.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#0a1526] border border-slate-200 dark:border-slate-800 space-y-1.5">
                      <div className="flex items-center space-x-2 text-blue-600 dark:text-cyan-400 font-bold">
                        <Lock className="h-4 w-4" />
                        <span>Anti-XSS & Input Sanitization</span>
                      </div>
                      <p className="text-slate-600 dark:text-slate-300 text-[11px]">
                        Sanitización obligante mediante <code>sanitizeInput()</code> para prevenir inyección de scripts maliciosos en formularios y búsquedas.
                      </p>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#0a1526] border border-slate-200 dark:border-slate-800 space-y-1.5">
                      <div className="flex items-center space-x-2 text-blue-600 dark:text-cyan-400 font-bold">
                        <ShieldAlert className="h-4 w-4" />
                        <span>Cabeceras HTTP CSP & Nosniff</span>
                      </div>
                      <p className="text-slate-600 dark:text-slate-300 text-[11px]">
                        Content-Security-Policy estricto, X-Frame-Options (Sameorigin) y X-Content-Type-Options para mitigar Clickjacking y MIME sniffing.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: ISO 8000 */}
              {activeTab === 'ISO8000' && (
                <div className="space-y-3">
                  <div className="p-4 rounded-2xl bg-blue-50/70 dark:bg-[#0c1a30] border border-blue-200 dark:border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-[#002b49] dark:text-[#00f2fe] uppercase">ISO 8000-110 — Calidad e Integridad de Datos</span>
                      <span className="text-[10px] font-mono font-bold bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300 px-2 py-0.5 rounded-md">ESTÁNDAR</span>
                    </div>
                    <p className="text-slate-700 dark:text-slate-300 font-medium">
                      Gobierno de datos maestros y homologación de código de activos para garantizar intercambio sin fricción entre sistemas.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#0a1526] border border-slate-200 dark:border-slate-800 space-y-1.5">
                    <div className="font-bold text-amber-600 dark:text-amber-400 flex items-center space-x-2">
                      <CheckCircle2 className="h-4 w-4" />
                      <span>Nomenclatura RDS-PS / IEC 81346-10</span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-300 text-[11px]">
                      Validación de sintaxis unificada para Subestaciones y Circuitos bajo el patrón <code>=VE+&lt;ESTADO&gt;-&lt;NOMBRE_ACTIVO&gt;</code> (ej. <code>=VE+ZUL-UNIF_01</code>).
                    </p>
                  </div>
                </div>
              )}

              {/* TAB 4: ISO 55000 */}
              {activeTab === 'ISO55000' && (
                <div className="space-y-3">
                  <div className="p-4 rounded-2xl bg-blue-50/70 dark:bg-[#0c1a30] border border-blue-200 dark:border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-[#002b49] dark:text-[#00f2fe] uppercase">ISO 55000 / 55001 — Gestión de Activos Eléctricos</span>
                      <span className="text-[10px] font-mono font-bold bg-purple-100 text-purple-900 dark:bg-purple-950 dark:text-purple-300 px-2 py-0.5 rounded-md">SEN READY</span>
                    </div>
                    <p className="text-slate-700 dark:text-slate-300 font-medium">
                      Control del ciclo de vida útil, mantenimiento basado en condición y taxonomía de criticidad de componentes del Sistema Eléctrico Nacional.
                    </p>
                  </div>
                </div>
              )}

              {/* TAB 5: ISACA COBIT 2019 */}
              {activeTab === 'COBIT' && (
                <div className="space-y-3">
                  <div className="p-4 rounded-2xl bg-blue-50/70 dark:bg-[#0c1a30] border border-blue-200 dark:border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-[#002b49] dark:text-[#00f2fe] uppercase">ISACA COBIT 2019 — Marco de Control Interno</span>
                      <span className="text-[10px] font-mono font-bold bg-cyan-100 text-cyan-900 dark:bg-cyan-950 dark:text-cyan-300 px-2 py-0.5 rounded-md">PL/pgSQL HARDENED</span>
                    </div>
                    <p className="text-slate-700 dark:text-slate-300 font-medium">
                      Controles preventivos a nivel de base de datos PostgreSQL para validación de comprobantes, topes presupuestarios y viáticos en campo.
                    </p>
                  </div>
                </div>
              )}

            </div>

            {/* Footer Diagnostic Bar */}
            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
              <div className="flex items-center space-x-2 text-[11px] font-bold text-slate-600 dark:text-slate-400">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>Auditoría Continua Activa — Repositorio Maestro GGPD</span>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#002b49] text-white dark:bg-[#00f2fe] dark:text-[#0a192f] text-xs font-black uppercase shadow-md hover:scale-105 transition-all"
              >
                Cerrar Panel de Gobernanza
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
};
