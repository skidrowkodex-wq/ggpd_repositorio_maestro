import React, { useState } from 'react';
import { Zap, Lock, User, AlertCircle, RefreshCw, ShieldCheck, CheckCircle2, Database, Key, Cpu, Sparkles, Info, Sun, Moon } from 'lucide-react';
import { useAuth } from '../lib/authContext';
import { useTheme } from '../lib/themeContext';

export const LoginForm: React.FC = () => {
  const { login } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    const res = await login(username, password);
    if (!res.success) {
      setErrorMsg(res.error || 'Credenciales inválidas. Verifica tu usuario y contraseña.');
    }
    setLoading(false);
  };

  const handleQuickLogin = async (user: string, pass: string) => {
    setUsername(user);
    setPassword(pass);
    setErrorMsg('');
    setLoading(true);

    const res = await login(user, pass);
    if (!res.success) {
      setErrorMsg(res.error || 'Error al autenticar usuario predeterminado.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col items-center justify-center p-4 selection:bg-sky-500 selection:text-white relative transition-colors duration-200">
      {/* Theme Switcher Button at top right */}
      <div className="absolute top-4 right-4">
        <button
          onClick={toggleTheme}
          className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-amber-400 shadow-md hover:bg-slate-50 dark:hover:bg-slate-800 transition flex items-center gap-2 text-xs font-semibold"
          title={theme === 'light' ? 'Cambiar a Modo Oscuro' : 'Cambiar a Modo Claro Corporativo'}
        >
          {theme === 'light' ? (
            <>
              <Moon className="w-4 h-4 text-sky-600" />
              <span className="hidden sm:inline">Modo Oscuro</span>
            </>
          ) : (
            <>
              <Sun className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline">Modo Claro</span>
            </>
          )}
        </button>
      </div>

      <div className="max-w-md w-full space-y-6">
        {/* Header Branding */}
        <div className="text-center space-y-3">
          <div className="inline-flex h-14 w-14 rounded-2xl bg-gradient-to-tr from-amber-500 via-orange-600 to-amber-700 items-center justify-center shadow-xl shadow-amber-500/25 text-white mx-auto">
            <Zap className="w-8 h-8 fill-current text-white animate-pulse" />
          </div>
          <div>
            <div className="inline-block mb-1">
              <span className="text-[11px] font-mono tracking-widest text-amber-400 uppercase bg-amber-950/70 px-3 py-0.5 rounded-full border border-amber-500/40">
                PROCESO GGPD-SUB-01 • SUBESTACIONES
              </span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">CORPOELEC • GGPD</h1>
            <p className="text-sm font-bold text-amber-600 dark:text-amber-400 mt-0.5">SCEIN V3.0 — Seguimiento y Control de Equipos Indisponibles</p>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 font-mono">Gestión de Activos Mayores ISO 55000 & Calidad ISO 8000</p>
          </div>
        </div>

        {/* Card Form */}
        <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-amber-500/30 rounded-2xl p-6 sm:p-8 shadow-xl dark:shadow-2xl dark:shadow-amber-500/10 backdrop-blur-md space-y-6 relative overflow-hidden">
          {/* Banda Técnica de Proceso Ámbar Industrial (4px) */}
          <div className="h-1 w-full bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 absolute top-0 left-0 shadow-[0_0_12px_rgba(245,158,11,0.5)]"></div>

          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200 font-semibold text-sm">
              <Lock className="w-4 h-4 text-amber-500 dark:text-amber-400" />
              <span>Control de Acceso al Sistema</span>
            </div>
            <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/70 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-700/60 font-mono font-bold">
              Esquema DB: core
            </span>
          </div>

          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800/80 text-rose-800 dark:text-rose-200 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
              <div className="leading-relaxed">{errorMsg}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold font-mono text-slate-700 dark:text-slate-300 uppercase tracking-wider">Usuario Corporativo</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="ej: ggpd_admin, j_jimenez, e_tachira"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition font-mono"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold font-mono text-slate-700 dark:text-slate-300 uppercase tracking-wider">Contraseña</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition font-mono"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-extrabold text-sm shadow-lg shadow-amber-500/20 active:scale-[0.99] transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Verificando Credenciales...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4 text-slate-950" />
                  <span>Ingresar al Sistema SCEIN</span>
                </>
              )}
            </button>
          </form>

          {/* Security & Compliance Badges Card */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800/80 space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-emerald-700 dark:text-emerald-400">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Entorno Protegido & Criterios OWASP 2025</span>
              </div>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-500/80 font-mono">v2.4 SEC</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800/80 flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse"></div>
                <div>
                  <span className="font-bold text-slate-800 dark:text-slate-200 block">OWASP A01 & A07</span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">RBAC Strict & Rate Limit</span>
                </div>
              </div>

              <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800/80 flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-cyan-500 dark:bg-cyan-400 animate-pulse"></div>
                <div>
                  <span className="font-bold text-slate-800 dark:text-slate-200 block">OWASP A05 & A08</span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">Headers SEC & Integrity</span>
                </div>
              </div>

              <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800/80 flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-purple-500 dark:bg-purple-400 animate-pulse"></div>
                <div>
                  <span className="font-bold text-slate-800 dark:text-slate-200 block">ISO 27001</span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">Auditoría & Logs PBKDF2</span>
                </div>
              </div>

              <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800/80 flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-amber-500 dark:bg-amber-400 animate-pulse"></div>
                <div>
                  <span className="font-bold text-slate-800 dark:text-slate-200 block">ISO 8000-61</span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">Calidad de Datos SEN</span>
                </div>
              </div>
            </div>
          </div>

          {/* Technology Architecture Badge & Reference */}
          <div className="pt-3 border-t border-slate-200 dark:border-slate-800/80 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
              <Sparkles className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
              <span>Arquitectura Tecnológica & Motor de IA</span>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950/90 border border-slate-200 dark:border-slate-800 text-[11px] space-y-1.5">
              <div className="flex flex-wrap items-center gap-1.5 text-slate-700 dark:text-slate-300 font-medium">
                <span className="px-1.5 py-0.5 rounded bg-sky-100 dark:bg-sky-950 border border-sky-300 dark:border-sky-800/60 text-sky-800 dark:text-sky-300 text-[10px] font-bold">Google AI Studio</span>
                <span className="px-1.5 py-0.5 rounded bg-purple-100 dark:bg-purple-950 border border-purple-300 dark:border-purple-800/60 text-purple-800 dark:text-purple-300 text-[10px] font-bold">Gemini 3.6 Pro</span>
                <span className="px-1.5 py-0.5 rounded bg-indigo-100 dark:bg-indigo-950 border border-indigo-300 dark:border-indigo-800/60 text-indigo-800 dark:text-indigo-300 text-[10px] font-bold">Antigravity Engine</span>
                <span className="px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 border border-emerald-300 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold">Supabase PostgreSQL</span>
              </div>
              <p className="text-[9.5px] text-slate-500 dark:text-slate-400 leading-tight flex items-start gap-1 pt-1">
                <Info className="w-3 h-3 text-slate-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Aviso legal de arquitectura:</strong> Referencia exclusiva al stack de software y servicios en la nube utilizados para la aceleración y despliegue del prototipo. Las marcas registradas pertenecen a sus respectivos titulares y no implican patrocinio, respaldo comercial ni afiliación institucional oficial.
                </span>
              </p>
            </div>
          </div>

          {/* Quick Logins for Testing (Hidden in UI) */}
          <div className="hidden pt-2 border-t border-slate-800/80 space-y-3">
            <p className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-amber-400" />
              Acceso Rápido para Pruebas (Roles RBAC predeterminados):
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleQuickLogin('ggpd_admin', 'Lunes35.')}
                className="p-2 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-sky-700/60 text-left transition flex items-center justify-between group"
              >
                <div>
                  <span className="font-bold text-sky-400 block">ggpd_admin</span>
                  <span className="text-[10px] text-slate-400">ADMIN NACIONAL</span>
                </div>
                <CheckCircle2 className="w-3.5 h-3.5 text-slate-600 group-hover:text-sky-400" />
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('j_jimenez', 'Jimenez2026.')}
                className="p-2 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-sky-700/60 text-left transition flex items-center justify-between group"
              >
                <div>
                  <span className="font-bold text-sky-400 block">j_jimenez</span>
                  <span className="text-[10px] text-slate-400">ADMIN NACIONAL</span>
                </div>
                <CheckCircle2 className="w-3.5 h-3.5 text-slate-600 group-hover:text-sky-400" />
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('e_tachira', 'Tachira2026.')}
                className="p-2 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-amber-700/60 text-left transition flex items-center justify-between group"
              >
                <div>
                  <span className="font-bold text-amber-400 block">e_tachira</span>
                  <span className="text-[10px] text-slate-400">ANALISTA (Táchira)</span>
                </div>
                <CheckCircle2 className="w-3.5 h-3.5 text-slate-600 group-hover:text-amber-400" />
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('a_auditor', 'Auditor2026.')}
                className="p-2 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-purple-700/60 text-left transition flex items-center justify-between group"
              >
                <div>
                  <span className="font-bold text-purple-400 block">a_auditor</span>
                  <span className="text-[10px] text-slate-400">AUDITOR ISO</span>
                </div>
                <CheckCircle2 className="w-3.5 h-3.5 text-slate-600 group-hover:text-purple-400" />
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-slate-400 flex items-center justify-center gap-2">
          <Database className="w-3.5 h-3.5 text-slate-400" />
          <span>Esquema PostgreSQL <code className="text-cyan-300 font-mono">scei</code> en Supabase</span>
        </div>
      </div>
    </div>
  );
};
