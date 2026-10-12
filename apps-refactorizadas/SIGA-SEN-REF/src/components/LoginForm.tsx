import React, { useState } from 'react';
import { useAuth } from '../lib/authContext';
import { useTheme } from '../lib/themeContext';
import { ShieldCheck, Lock, Eye, EyeOff, Zap, AlertCircle, CheckCircle2, Sun, Moon } from 'lucide-react';

export const LoginForm: React.FC<{ onLoginSuccess?: () => void }> = ({ onLoginSuccess }) => {
  const { login } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
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
      } else if (onLoginSuccess) {
        onLoginSuccess();
      }
    } catch (err: any) {
      setError(err?.message || 'Error de conexión.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 py-8 md:py-12 bg-slate-100/90 dark:bg-[#040914] text-slate-900 dark:text-slate-100 transition-colors duration-200 relative">
      {/* Selector de Tema Flotante */}
      <div className="absolute top-4 right-4 z-50">
        <button
          onClick={toggleTheme}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 shadow-sm text-xs font-bold hover:border-amber-500 transition-all cursor-pointer"
          title={theme === 'dark' ? 'Cambiar a Modo Claro Corporativo' : 'Cambiar a Modo Oscuro SEN'}
        >
          {theme === 'dark' ? (
            <>
              <Sun className="w-3.5 h-3.5 text-amber-400" />
              <span>Tema Claro</span>
            </>
          ) : (
            <>
              <Moon className="w-3.5 h-3.5 text-sky-600" />
              <span>Modo Oscuro</span>
            </>
          )}
        </button>
      </div>

      {/* Pill Superior Pulsante Normativo con Margen Claro */}
      <div className="flex justify-center mb-6">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white dark:bg-slate-900/90 border border-amber-500/50 text-xs font-bold text-amber-900 dark:text-amber-300 shadow-md">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse"></span>
          🛡️ ZONA SEGURA CIFRADA · ISO/IEC 27001 · OWASP ASVS · PORT 3008
        </div>
      </div>

      {/* Contenedor Central */}
      <div className="w-full max-w-md mx-auto relative z-10 mb-8">
        <div className="bg-white dark:bg-[#071329] p-7 md:p-9 rounded-2xl border border-slate-300 dark:border-amber-900/50 shadow-xl shadow-slate-300/40 dark:shadow-2xl space-y-6">
          {/* Logo y Encabezado */}
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 via-orange-600 to-red-600 flex items-center justify-center text-white font-black shadow-xl shadow-amber-500/25 mx-auto">
              <Zap className="w-8 h-8 text-white fill-current" />
            </div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              CORPOELEC — SIGA-SEN
            </h1>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Sistema Integrado de Gestión de Activos del SEN (Generación · Transmisión · Distribución)
            </p>
            <div className="inline-block px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 dark:bg-slate-900 text-amber-700 dark:text-amber-400 border border-amber-300 dark:border-amber-900/50">
              CERTIFICACIÓN DE GRADO INDUSTRIAL · CND MAYO 2025
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
                className="w-full rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 px-3.5 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-amber-500 font-mono transition-all"
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
                  className="w-full rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 px-3.5 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-amber-500 font-mono pr-10 transition-all"
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
              className="w-full rounded-xl bg-gradient-to-r from-amber-500 via-orange-600 to-red-600 hover:from-amber-400 hover:to-orange-500 text-white font-black py-3 px-4 text-xs uppercase tracking-wider shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 cursor-pointer transition-all mt-2"
            >
              <Lock className="w-4 h-4 text-white" />
              <span className="text-white font-bold">{loading ? 'Validando Credencial...' : 'Ingresar a SIGA-SEN'}</span>
            </button>
          </form>

          {/* Aviso de sesión auditada (ISO/IEC 27001 A.8.15 / A.8.16) */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
            <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60">
              <ShieldCheck className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
              <p className="text-[10px] leading-relaxed text-amber-900 dark:text-amber-300 font-medium">
                Sesión auditada bajo norma <span className="font-bold">ISO/IEC 27001</span>. La autenticación se valida
                contra el IAM corporativo central y el acceso queda registrado. El uso indebido se sanciona conforme a la
                normativa interna de CORPOELEC.
              </p>
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
