import React, { useState } from 'react';
import { UserProfile } from '../types';
import { loginUser } from '../services/authService';
import { 
  ShieldCheck, 
  User, 
  Lock, 
  AlertCircle, 
  RefreshCw, 
  Eye, 
  EyeOff, 
  KeyRound, 
  ArrowRight,
  Database,
  Cpu
} from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: UserProfile) => void;
  darkMode?: boolean;
}

export function LoginModal({ isOpen, onClose, onLoginSuccess, darkMode = false }: LoginModalProps) {
  const [identifier, setIdentifier] = useState('carlos.reyes');
  const [password, setPassword] = useState('Corpoelec2026!.');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier || !password) {
      setErrorMsg('Por favor ingrese usuario corporativo y contraseña');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    const result = await loginUser(identifier, password);
    setLoading(false);

    if (result.success && result.user) {
      onLoginSuccess(result.user);
      onClose();
    } else {
      setErrorMsg(result.error || 'Credenciales inválidas');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className={`max-w-md w-full p-6 sm:p-8 space-y-5 relative overflow-hidden transition-colors border shadow-2xl rounded-2xl ${
        darkMode ? 'border-yellow-500/30 bg-slate-900/95 text-slate-100' : 'border-slate-200 bg-white text-slate-900'
      }`}>
        {/* Banda Técnica de Proceso Dorado Energía (4px) */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-yellow-500 via-amber-400 to-yellow-500 shadow-[0_0_12px_rgba(234,179,8,0.5)]" />

        {/* Encabezado */}
        <div className="text-center space-y-2 pt-2">
          
          {/* Zona Segura Badge */}
          <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 dark:bg-emerald-950/90 px-3.5 py-1 border border-emerald-300 dark:border-emerald-500/50 text-emerald-900 dark:text-emerald-300 text-[10px] font-mono font-black shadow-xs">
            <Lock className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
            <span>ZONA SEGURA CIFRADA · ISO/IEC 27001 · OWASP ASVS</span>
          </div>

          <div className={`mx-auto w-12 h-12 rounded-2xl border flex items-center justify-center font-bold text-2xl shadow-inner ${
            darkMode ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400' : 'bg-amber-50 border-amber-200 text-amber-600'
          }`}>
            ⚡
          </div>

          <div className="space-y-1">
            <div className="inline-block">
              <span className="text-[10px] font-mono tracking-widest text-yellow-400 uppercase bg-yellow-950/70 px-2.5 py-0.5 rounded-full border border-yellow-500/40">
                PROCESO GGPD-PLA-01 • PLANES & VIÁTICOS
              </span>
            </div>
            <h2 className={`text-xl font-black tracking-tight ${darkMode ? 'text-white' : 'text-slate-900'}`}>
              SCPPE V3.0 — Planificación Eléctrica SEN
            </h2>
            <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              CORPOELEC • Gerencia General de Planificación de Distribución
            </p>
            <div className="pt-0.5">
              <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400 bg-slate-200/60 dark:bg-slate-800 px-2.5 py-0.5 rounded-md border border-slate-300 dark:border-slate-700">
                <ShieldCheck className="w-3 h-3 text-yellow-500" />
                <span>CERTIFICACIÓN DE GRADO INDUSTRIAL · SEN 2026</span>
              </span>
            </div>
          </div>
        </div>

        {/* Mensaje de error */}
        {errorMsg && (
          <div className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
            darkMode
              ? 'bg-red-950/80 border-red-800/80 text-red-200'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}>
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="space-y-1.5">
            <label className={`block font-semibold uppercase tracking-wider ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
              Usuario Corporativo / Correo *
            </label>
            <div className="relative">
              <input
                type="text"
                required
                placeholder="ej: carlos.reyes o j_pacheco"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className={`w-full border rounded-xl pl-9 pr-3 py-2.5 font-mono focus:outline-none transition-colors ${
                  darkMode
                    ? 'bg-slate-950 border-slate-800 text-slate-100 focus:border-yellow-500'
                    : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-amber-500 focus:bg-white'
                }`}
              />
              <User className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className={`block font-semibold uppercase tracking-wider ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
              Contraseña Institucional *
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full border rounded-xl pl-9 pr-10 py-2.5 font-mono focus:outline-none transition-colors ${
                  darkMode
                    ? 'bg-slate-950 border-slate-800 text-slate-100 focus:border-yellow-500'
                    : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-amber-500 focus:bg-white'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                title={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Security Notice Box */}
          <div className={`rounded-xl p-3 border text-[11px] flex items-start gap-2.5 ${
            darkMode ? 'bg-slate-950/80 border-slate-800 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-600'
          }`}>
            <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-500 mt-0.5" />
            <p className="leading-snug">
              Sesión protegida y auditada bajo norma <strong>ISO/IEC 27001</strong> y controles financieros <strong>ISACA COBIT</strong>.
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs uppercase flex items-center justify-center gap-2 transition-all shadow-md active:scale-[0.99] tracking-wider cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
            ) : (
              <KeyRound className="w-4 h-4" />
            )}
            <span>Iniciar Sesión Institucional</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Footer Multi-Normative Badges */}
        <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-2 text-[10px] font-mono text-slate-500 dark:text-slate-400">
          <div className="grid grid-cols-2 gap-2 text-left">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              ISO 27001 / ISO 55000
            </span>
            <span className="flex items-center gap-1">
              <Database className="w-3.5 h-3.5 text-yellow-500" />
              ISO 8000-110 Data
            </span>
            <span className="flex items-center gap-1">
              <Cpu className="w-3.5 h-3.5 text-amber-500" />
              COBIT 2019 MEA02
            </span>
            <span className="flex items-center gap-1">
              <Lock className="w-3.5 h-3.5 text-cyan-500" />
              OWASP ASVS v4.0
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}
