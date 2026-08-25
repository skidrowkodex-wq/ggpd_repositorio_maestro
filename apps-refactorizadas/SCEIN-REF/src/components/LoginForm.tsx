import React, { useState } from 'react';
import { useAuth } from '../lib/authContext';
import { useTheme } from '../lib/themeContext';
import { 
  Zap, 
  ShieldCheck, 
  Lock, 
  Sun, 
  Moon,
  ArrowRight,
  User,
  KeyRound,
  Eye,
  EyeOff,
  AlertCircle,
  Database,
  Cpu,
  RefreshCw
} from 'lucide-react';

export const LoginForm: React.FC = () => {
  const { login } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      setError('Por favor ingrese su usuario corporativo.');
      return;
    }
    if (!password.trim()) {
      setError('Por favor ingrese su contraseña institucional.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await login(username.trim(), password.trim());
      if (!res.success) {
        setError(res.error || 'Credenciales inválidas o sin permisos en SCEIN.');
      }
    } catch {
      setError('Error al conectar con el servidor de autenticación.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-[#041426] flex flex-col justify-center py-10 sm:px-6 lg:px-8 transition-colors duration-200 relative">
      
      {/* Selector de Tema Flotante */}
      <div className="absolute top-4 right-4 z-50">
        <button
          onClick={toggleTheme}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white dark:bg-[#072146] text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-amber-900/60 shadow-sm text-xs font-semibold hover:border-amber-500 transition-colors cursor-pointer"
          title={theme === 'dark' ? 'Cambiar a Tema Claro' : 'Cambiar a Modo Oscuro'}
        >
          {theme === 'dark' ? (
            <>
              <Sun className="w-3.5 h-3.5 text-amber-400" />
              <span>Tema Claro</span>
            </>
          ) : (
            <>
              <Moon className="w-3.5 h-3.5 text-amber-600" />
              <span>Modo Oscuro Azul SEN</span>
            </>
          )}
        </button>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        {/* 🛡️ ZONA SEGURA CIFRADA BADGE */}
        <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 dark:bg-emerald-950/90 px-3.5 py-1 border border-emerald-300 dark:border-emerald-500/50 text-emerald-900 dark:text-emerald-300 text-[11px] font-mono font-black mb-3 shadow-xs animate-fadeIn">
          <Lock className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>ZONA SEGURA CIFRADA · ISO/IEC 27001 · OWASP ASVS</span>
        </div>

        {/* Logo Card */}
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 via-amber-500 to-orange-700 flex items-center justify-center text-white shadow-xl shadow-orange-500/30 ring-4 ring-orange-500/20">
            <Zap className="w-8 h-8 fill-current text-white" />
          </div>
        </div>

        <h2 className="mt-3 text-center text-2xl font-black tracking-tight text-slate-900 dark:text-white">
          SCEIN <span className="text-orange-500 dark:text-orange-400">V3.0</span>
        </h2>
        <p className="mt-1 text-center text-xs font-bold uppercase tracking-wider text-orange-700 dark:text-orange-300 font-mono">
          PROCESO GGPD-SUB-01 • EQUIPOS INDISPONIBLES DE SUBESTACIONES
        </p>
        <p className="text-center text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Gerencia General de Gestión de Planificación (GGPD) • CORPOELEC
        </p>

        {/* Certificación de Grado Industrial Badge */}
        <div className="mt-2 inline-flex items-center gap-1 text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400 bg-slate-200/60 dark:bg-[#072146] px-2.5 py-0.5 rounded-md border border-slate-300 dark:border-orange-900/60">
          <ShieldCheck className="w-3 h-3 text-orange-500" />
          <span>CERTIFICACIÓN DE GRADO INDUSTRIAL · SEN 2026</span>
        </div>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white dark:bg-[#072146] py-8 px-6 sm:px-9 shadow-2xl rounded-2xl border border-slate-200 dark:border-orange-900/40 relative overflow-hidden">
          
          {/* Top Security Line Indicator */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-orange-500 to-amber-500"></div>

          {/* Formulario Convencional */}
          <form className="space-y-4" onSubmit={handleSubmit}>
            
            {/* Username Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 uppercase tracking-wider">
                <User className="h-3.5 w-3.5 text-orange-600 dark:text-orange-400" />
                <span>Usuario Corporativo / Correo *</span>
              </label>
              <input
                type="text"
                placeholder="ej: carlos.reyes o ggpd_admin"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full rounded-xl bg-slate-50 dark:bg-[#041426] border border-slate-300 dark:border-slate-700 px-3.5 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 font-mono font-medium transition-all"
                required
                autoComplete="username"
              />
            </div>

            {/* Password Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 uppercase tracking-wider">
                <Lock className="h-3.5 w-3.5 text-orange-600 dark:text-orange-400" />
                <span>Contraseña Institucional *</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl bg-slate-50 dark:bg-[#041426] border border-slate-300 dark:border-slate-700 px-3.5 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 font-mono transition-all pr-10"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                  title={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-2 rounded-xl bg-red-50 dark:bg-red-950/60 p-3 border border-red-200 dark:border-red-500/40 text-xs text-red-700 dark:text-red-300 font-medium animate-fadeIn">
                <AlertCircle className="h-4 w-4 shrink-0 text-red-600 dark:text-red-400" />
                <span>{error}</span>
              </div>
            )}

            {/* Security Notice Box */}
            <div className="rounded-xl bg-slate-50 dark:bg-[#061224] p-3 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-400 flex items-start gap-2.5">
              <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400 mt-0.5" />
              <p className="leading-snug">
                Acceso restringido a personal técnico autorizado del SEN. Sesión auditada bajo norma <strong>ISO/IEC 27001</strong>.
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-black text-white bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 hover:from-orange-600 hover:to-amber-600 shadow-lg shadow-orange-500/30 transition-all active:scale-[0.98] disabled:opacity-50 uppercase tracking-wider cursor-pointer"
            >
              {loading ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin text-white" />
                  <span>Validando Acceso IAM...</span>
                </>
              ) : (
                <>
                  <KeyRound className="w-4 h-4" />
                  <span>Iniciar Sesión Institucional</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Footer Multi-Normative Badges */}
          <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800 space-y-2">
            <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>ISO 27001 / ISO 55000</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                <span>ISO 8000-110 Data Quality</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span>OWASP ASVS Level 2</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-red-500 shrink-0" />
                <span>ISACA COBIT MEA02</span>
              </div>
            </div>

            <div className="text-[10px] text-center text-slate-400 dark:text-slate-500 pt-1">
              Plataforma protegida con cifrado TLS 1.3 • Trazabilidad de activos mayores ISO 55001.
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
