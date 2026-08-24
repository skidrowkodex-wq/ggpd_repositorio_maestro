import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { StateCode } from '../types/sigi';
import { Lock, ShieldCheck, KeyRound, AlertCircle, ArrowRight, X, User, Shield } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  initialStateCode?: StateCode;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess, initialStateCode }) => {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [passkey, setPasskey] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!username.trim() || !passkey.trim()) {
      setErrorMsg('Por favor ingrese su usuario corporativo y contraseña institucional.');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await login(username.trim(), passkey.trim(), initialStateCode);
      setIsSubmitting(false);

      if (res.success) {
        onClose();
        if (onSuccess) onSuccess();
      } else {
        setErrorMsg(res.message || 'Usuario o contraseña institucional incorrectos.');
      }
    } catch (err: any) {
      setIsSubmitting(false);
      setErrorMsg(err.message || 'Error de conexión.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 dark:bg-black/85 backdrop-blur-md animate-fadeIn">
      
      <div className="relative w-full max-w-md rounded-3xl bg-white dark:bg-[#0b172c] border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-6 shadow-2xl transition-all max-h-[95vh] overflow-y-auto">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title="Cerrar ventana"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="text-center space-y-2.5">
          
          {/* Zona Segura Badge */}
          <div className="inline-flex items-center space-x-1.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 px-3 py-1 border border-emerald-300 dark:border-emerald-500/50 text-emerald-900 dark:text-emerald-300 text-[10px] font-mono font-bold">
            <Lock className="h-3 w-3 text-emerald-700 dark:text-emerald-400" />
            <span>ZONA SEGURA CIFRADA · ISO 27001</span>
          </div>

          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-500/30 mx-auto text-[#002b49] dark:text-[#00f2fe]">
            <KeyRound className="h-6 w-6" />
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">Autenticación Institucional</h2>
          <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
            Sistema Integrado de Gestión e Información (SIGI — GGPD)
          </p>
        </div>

        {/* Formulario Estándar de Acceso (Sin ComboBox territorial, auto-asignado por cuenta) */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Username Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center space-x-1.5">
              <User className="h-3.5 w-3.5 text-[#002b49] dark:text-[#00f2fe]" />
              <span>Usuario Corporativo *</span>
            </label>
            <input
              type="text"
              placeholder="Ingrese su usuario corporativo"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full rounded-xl bg-slate-50 dark:bg-[#081427] border border-slate-300 dark:border-slate-700 px-3.5 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:border-[#002b49] dark:focus:border-[#00f2fe] focus:outline-none focus:ring-1 focus:ring-[#002b49] font-mono font-medium"
              required
              autoComplete="username"
            />
          </div>

          {/* Passkey / Password Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center space-x-1.5">
              <Lock className="h-3.5 w-3.5 text-[#002b49] dark:text-[#00f2fe]" />
              <span>Contraseña Institucional *</span>
            </label>
            <input
              type="password"
              placeholder="••••••••••••"
              value={passkey}
              onChange={(e) => setPasskey(e.target.value)}
              className="w-full rounded-xl bg-slate-50 dark:bg-[#081427] border border-slate-300 dark:border-slate-700 px-3.5 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:border-[#002b49] dark:focus:border-[#00f2fe] focus:outline-none focus:ring-1 focus:ring-[#002b49] font-mono"
              required
              autoComplete="current-password"
            />
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="flex items-center space-x-2 rounded-xl bg-red-50 dark:bg-red-950/60 p-3 border border-red-200 dark:border-red-500/40 text-xs text-red-700 dark:text-red-300 font-medium animate-fadeIn">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-600 dark:text-red-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Security Notice Box */}
          <div className="rounded-xl bg-slate-50 dark:bg-[#061224] p-3 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-400 flex items-start space-x-2.5">
            <Shield className="h-4 w-4 shrink-0 text-[#002b49] dark:text-[#00f2fe] mt-0.5" />
            <p className="leading-snug">
              El estado y nivel de acceso se configuran automáticamente según el perfil del usuario autenticado. Sesión auditada bajo norma <strong>ISO/IEC 27001</strong>.
            </p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center space-x-2 rounded-xl bg-[#002b49] hover:bg-[#001f35] text-white dark:bg-gradient-to-r dark:from-[#00f2fe] dark:via-[#00b4d8] dark:to-[#ffd700] dark:text-[#0a192f] py-3 text-xs font-black uppercase shadow-lg hover:shadow-xl active:scale-95 transition-all cursor-pointer disabled:opacity-50"
          >
            <span>{isSubmitting ? 'Verificando Credenciales...' : 'Iniciar Sesión Institucional'}</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        {/* Footer Badges */}
        <div className="pt-2 border-t border-slate-200 dark:border-slate-800 text-[10px] text-slate-500 dark:text-slate-400 text-center flex items-center justify-center space-x-3 font-semibold">
          <span className="flex items-center space-x-1 text-emerald-800 dark:text-emerald-400 font-bold">
            <ShieldCheck className="h-3 w-3" />
            <span>Control de Acceso Seguro · GGPD 2026</span>
          </span>
        </div>

      </div>

    </div>
  );
};
