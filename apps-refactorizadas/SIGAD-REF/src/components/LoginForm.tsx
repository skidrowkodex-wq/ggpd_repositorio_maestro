import React, { useState } from 'react';
import { useAuth, SIGAD_USUARIOS_PREDEFINIDOS } from '../lib/authContext';
import { useTheme } from '../lib/themeContext';
import { ShieldCheck, Lock, Eye, EyeOff, Zap, AlertCircle, CheckCircle2, Sun, Moon } from 'lucide-react';

export const LoginForm: React.FC = () => {
  const { login } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [username, setUsername] = useState<string>('admin.ggpd');
  const [password, setPassword] = useState<string>('admin2026!.');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await login(username, password);
      if (!res.success) {
        setError(res.error || 'Credenciales inválidas.');
      }
    } catch (err: any) {
      setError(err?.message || 'Error de conexión.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickSelect = (u: typeof SIGAD_USUARIOS_PREDEFINIDOS[0]) => {
    setUsername(u.username);
    setPassword(u.password);
    setError(null);
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 py-8 md:py-12 bg-slate-100/90 dark:bg-[#040914] text-slate-900 dark:text-slate-100 transition-colors duration-200 relative">
      {/* Selector de Tema Flotante */}
      <div className="absolute top-4 right-4 z-50">
        <button
          onClick={toggleTheme}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 shadow-sm text-xs font-bold hover:border-cyan-500 transition-all cursor-pointer"
          title={theme === 'dark' ? 'Cambiar a Modo Claro Corporativo' : 'Cambiar a Modo Oscuro SEN'}
        >
          {theme === 'dark' ? (
            <>
              <Sun className="w-3.5 h-3.5 text-amber-400" />
              <span>Tema Claro</span>
            </>
          ) : (
            <>
              <Moon className="w-3.5 h-3.5 text-cyan-600" />
              <span>Modo Oscuro</span>
            </>
          )}
        </button>
      </div>

      {/* Pill Superior Pulsante Normativo con Margen */}
      <div className="flex justify-center mb-6">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white dark:bg-slate-900/90 border border-sky-500/50 text-xs font-bold text-sky-900 dark:text-sky-300 shadow-md">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 animate-pulse"></span>
          🛡️ ZONA SEGURA CIFRADA · ISO/IEC 27001 · OWASP ASVS · PORT 3007
        </div>
      </div>

      {/* Contenedor Central */}
      <div className="w-full max-w-md mx-auto relative z-10 mb-8">
        <div className="bg-white dark:bg-[#071329] p-7 md:p-9 rounded-2xl border border-slate-300 dark:border-sky-900/50 shadow-xl shadow-slate-300/40 dark:shadow-2xl space-y-6">
          {/* Logo y Encabezado */}
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 flex items-center justify-center text-white font-black shadow-xl shadow-cyan-500/25 mx-auto">
              <Zap className="w-8 h-8 text-white fill-current" />
            </div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              CORPOELEC — SIGAD
            </h1>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Sistema Integrado de Gestión de Activos de Distribución (Subestaciones y Circuitos)
            </p>
            <div className="inline-block px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 dark:bg-slate-900 text-sky-700 dark:text-sky-400 border border-sky-300 dark:border-sky-900/50">
              CERTIFICACIÓN DE GRADO INDUSTRIAL · SEN 2026
            </div>
          </div>

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                Usuario Corporativo / Correo:
              </label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="usuario.ggpd o correo institucional"
                className="w-full rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 px-3.5 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500 font-mono transition-all"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                Contraseña Institucional:
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 px-3.5 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500 font-mono pr-10 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-blue-500 text-white font-black py-3 px-4 text-xs uppercase tracking-wider shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 cursor-pointer transition-all mt-2"
            >
              <Lock className="w-4 h-4 text-white" />
              <span className="text-white font-bold">{loading ? 'Validando Credencial...' : 'Ingresar a SIGAD'}</span>
            </button>
          </form>

          {/* Perfiles de Acceso Rápido */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
            <span className="text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block text-center mb-2">
              Perfiles IAM Disponibles para el Piloto:
            </span>
            <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
              {SIGAD_USUARIOS_PREDEFINIDOS.slice(0, 4).map((u) => (
                <button
                  key={u.id}
                  onClick={() => handleQuickSelect(u)}
                  className={`p-2.5 rounded-xl text-left border transition-all cursor-pointer ${
                    username === u.username
                      ? 'bg-cyan-500/15 border-cyan-500 text-cyan-900 dark:text-cyan-300 font-bold shadow-xs ring-1 ring-cyan-500/30'
                      : 'bg-slate-50 dark:bg-slate-950/60 border-slate-300 dark:border-slate-800/80 text-slate-700 dark:text-slate-400 hover:border-slate-400 dark:hover:border-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <div className="truncate font-semibold">{u.full_name.split('(')[0]}</div>
                  <div className="text-[10px] text-sky-600 dark:text-sky-400 font-bold">{u.username}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Pie Normativo */}
      <footer className="text-center text-[11px] font-mono text-slate-500 dark:text-slate-400 py-3">
        CORPOELEC · Gerencia General de Gestión de Planificación (GGPD) · ISO 55000 / ISO 8000 / ISO 27001
      </footer>
    </div>
  );
};
