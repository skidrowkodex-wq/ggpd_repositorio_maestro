import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { VENEZUELAN_STATES } from '../mockData/portalData';
import { StateCode } from '../types/sigi';
import { Lock, ShieldCheck, MapPin, KeyRound, AlertCircle, ArrowRight, X } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  initialStateCode?: StateCode;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess, initialStateCode }) => {
  const { login } = useAuth();
  const [passkey, setPasskey] = useState('');
  const [selectedState, setSelectedState] = useState<StateCode>(initialStateCode || ('01' as StateCode));
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  React.useEffect(() => {
    if (initialStateCode) {
      setSelectedState(initialStateCode);
    }
  }, [initialStateCode, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsSubmitting(true);

    setTimeout(() => {
      const res = login(passkey, selectedState);
      setIsSubmitting(false);

      if (res.success) {
        onClose();
        if (onSuccess) onSuccess();
      } else {
        setErrorMsg(res.message || 'Clave de acceso institucional incorrecta.');
      }
    }, 300);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm animate-fadeIn">
      
      <div className="relative w-full max-w-md rounded-3xl bg-white dark:bg-[#0b172c] border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-6 shadow-2xl transition-all">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="text-center space-y-3">
          
          {/* Zona Segura Badge */}
          <div className="inline-flex items-center space-x-1.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 px-3 py-1 border border-emerald-300 dark:border-emerald-500/50 text-emerald-900 dark:text-emerald-300 text-[10px] font-mono font-bold">
            <Lock className="h-3 w-3 text-emerald-700 dark:text-emerald-400" />
            <span>ZONA SEGURA CIFRADA ISO 27001</span>
          </div>

          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-500/30 mx-auto text-[#002b49] dark:text-[#00f2fe]">
            <KeyRound className="h-7 w-7" />
          </div>

          <h2 className="text-2xl font-black text-slate-900 dark:text-white">Ingreso Institucional SIGI</h2>
          <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
            Gerencia Nacional de Gestión de Planificación de Distribución (GGPD)
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* State Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center space-x-1">
              <MapPin className="h-3.5 w-3.5 text-[#d97706] dark:text-[#ffd700]" />
              <span>Estado Geográfico Asignado *</span>
            </label>
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value as StateCode)}
              className="w-full rounded-xl bg-slate-50 dark:bg-[#081427] border border-slate-300 dark:border-slate-700 px-4 py-3 text-xs text-slate-900 dark:text-white focus:border-[#002b49] dark:focus:border-[#00f2fe] focus:outline-none focus:ring-1 focus:ring-[#002b49] font-mono font-bold"
            >
              {VENEZUELAN_STATES.map((st) => (
                <option key={st.code} value={st.code}>
                  [{st.code}] {st.name} ({st.circuitsCount} CTs)
                </option>
              ))}
            </select>
          </div>

          {/* Passkey Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center space-x-1">
              <Lock className="h-3.5 w-3.5 text-[#002b49] dark:text-[#00f2fe]" />
              <span>Clave de Acceso Institucional *</span>
            </label>
            <input
              type="password"
              placeholder="Ingrese clave (ej: SIGI2026, GERENCIA2026)"
              value={passkey}
              onChange={(e) => setPasskey(e.target.value)}
              className="w-full rounded-xl bg-slate-50 dark:bg-[#081427] border border-slate-300 dark:border-slate-700 px-4 py-3 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:border-[#002b49] dark:focus:border-[#00f2fe] focus:outline-none focus:ring-1 focus:ring-[#002b49] font-mono font-bold"
              required
            />
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="flex items-center space-x-2 rounded-xl bg-red-50 dark:bg-red-950/60 p-3 border border-red-200 dark:border-red-500/40 text-xs text-red-700 dark:text-red-300 font-medium">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-600 dark:text-red-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Key Reference Helper Box */}
          <div className="rounded-xl bg-blue-50/80 dark:bg-[#061224] p-3.5 border border-blue-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 space-y-2 font-mono">
            <div className="font-bold text-[#002b49] dark:text-[#00f2fe] flex items-center justify-between">
              <span>Claves de Acceso QA Institucionales:</span>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">25 Estados Activos</span>
            </div>
            <div className="text-[11px] leading-relaxed space-y-1">
              <div>
                • <strong>25 Coordinaciones Estadales:</strong> <code className="bg-amber-100 dark:bg-amber-950/60 px-1 py-0.2 rounded text-amber-900 dark:text-amber-300 font-bold">[Estado]2026!.</code>
                <span className="text-[10px] text-slate-500 block">Ej: <strong className="text-slate-900 dark:text-white">Tachira2026!.</strong>, <strong className="text-slate-900 dark:text-white">Zulia2026!.</strong>, <strong className="text-slate-900 dark:text-white">Capital2026!.</strong>, <strong className="text-slate-900 dark:text-white">Esequibo2026!.</strong></span>
              </div>
              <div className="pt-0.5 border-t border-slate-200 dark:border-slate-800">
                • <strong>Administradores / Gerencia:</strong> <code className="text-slate-900 dark:text-white font-bold">Pacheco2026.</code> / <code className="text-slate-900 dark:text-white font-bold">Favio2026.</code> / <code className="text-slate-900 dark:text-white font-bold">Lunes35.</code>
              </div>
              <div>
                • <strong>Claves de Nivel:</strong> <code className="text-slate-900 dark:text-white font-bold">SIGI2026</code> / <code className="text-slate-900 dark:text-white font-bold">GERENCIA2026</code>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center space-x-2 rounded-xl bg-[#002b49] hover:bg-[#001f35] text-white dark:bg-gradient-to-r dark:from-[#00f2fe] dark:via-[#00b4d8] dark:to-[#ffd700] dark:text-[#0a192f] py-3.5 text-xs font-black uppercase shadow-lg hover:shadow-xl active:scale-95 transition-all"
          >
            <span>{isSubmitting ? 'Verificando Credenciales...' : 'Iniciar Sesión Institucional'}</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        {/* Footer Badges */}
        <div className="pt-2 border-t border-slate-200 dark:border-slate-800 text-[10px] text-slate-500 dark:text-slate-400 text-center flex items-center justify-center space-x-3 font-semibold">
          <span className="flex items-center space-x-1 text-emerald-800 dark:text-emerald-400 font-bold">
            <ShieldCheck className="h-3 w-3" />
            <span>ISO 27001 · ISO 8000 · COBIT 2019</span>
          </span>
        </div>

      </div>

    </div>
  );
};
