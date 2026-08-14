import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { VENEZUELAN_STATES } from '../mockData/portalData';
import { StateCode } from '../types/sigi';
import { Lock, ShieldCheck, MapPin, KeyRound, AlertCircle, ArrowRight, X, User, CheckCircle2 } from 'lucide-react';

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
      // If user typed username and password, pass both; otherwise pass single token
      const res = username.trim() 
        ? login(username, selectedState, passkey)
        : login(passkey, selectedState);
      
      setIsSubmitting(false);

      if (res.success) {
        onClose();
        if (onSuccess) onSuccess();
      } else {
        setErrorMsg(res.message || 'Clave de acceso institucional incorrecta.');
      }
    }, 300);
  };

  const handleQuickFill = (usr: string, pass: string) => {
    setUsername(usr);
    setPasskey(pass);
    setErrorMsg('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm animate-fadeIn">
      
      <div className="relative w-full max-w-md rounded-3xl bg-white dark:bg-[#0b172c] border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-5 shadow-2xl transition-all max-h-[95vh] overflow-y-auto">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="text-center space-y-2">
          
          {/* Zona Segura Badge */}
          <div className="inline-flex items-center space-x-1.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 px-3 py-1 border border-emerald-300 dark:border-emerald-500/50 text-emerald-900 dark:text-emerald-300 text-[10px] font-mono font-bold">
            <Lock className="h-3 w-3 text-emerald-700 dark:text-emerald-400" />
            <span>ZONA SEGURA CIFRADA ISO 27001</span>
          </div>

          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-500/30 mx-auto text-[#002b49] dark:text-[#00f2fe]">
            <KeyRound className="h-6 w-6" />
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">Ingreso Institucional SIGI</h2>
          <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
            Gerencia General de Planificación de Distribución (GGPD)
          </p>
        </div>

        {/* Quick Access Badges for Key Users */}
        <div className="space-y-1.5">
          <span className="text-[10px] font-mono font-bold uppercase text-slate-500 dark:text-slate-400 block text-center">
            Acceso Rápido por Perfil Directivo:
          </span>
          <div className="grid grid-cols-3 gap-1.5 text-[11px] font-mono">
            <button
              type="button"
              onClick={() => handleQuickFill('ggpd_admin', 'admin2026!.')}
              className={`p-1.5 rounded-lg border text-center transition-all ${
                username === 'ggpd_admin'
                  ? 'bg-blue-100 border-blue-400 dark:bg-blue-950/80 dark:border-cyan-400 text-blue-900 dark:text-cyan-200 font-bold'
                  : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-blue-300'
              }`}
            >
              <div className="font-black text-[10px]">ggpd_admin</div>
              <div className="text-[9px] text-slate-500 truncate">Admin GGPD</div>
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('a_correa', 'Correa2026!.')}
              className={`p-1.5 rounded-lg border text-center transition-all ${
                username === 'a_correa'
                  ? 'bg-blue-100 border-blue-400 dark:bg-blue-950/80 dark:border-cyan-400 text-blue-900 dark:text-cyan-200 font-bold'
                  : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-blue-300'
              }`}
            >
              <div className="font-black text-[10px]">a_correa</div>
              <div className="text-[9px] text-slate-500 truncate">Adrian Correa</div>
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('j_pacheco', 'Pacheco2026!.')}
              className={`p-1.5 rounded-lg border text-center transition-all ${
                username === 'j_pacheco'
                  ? 'bg-blue-100 border-blue-400 dark:bg-blue-950/80 dark:border-cyan-400 text-blue-900 dark:text-cyan-200 font-bold'
                  : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-blue-300'
              }`}
            >
              <div className="font-black text-[10px]">j_pacheco</div>
              <div className="text-[9px] text-slate-500 truncate">Josue Pacheco</div>
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          
          {/* State Selector */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center space-x-1">
              <MapPin className="h-3.5 w-3.5 text-[#d97706] dark:text-[#ffd700]" />
              <span>Estado Geográfico Asignado *</span>
            </label>
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value as StateCode)}
              className="w-full rounded-xl bg-slate-50 dark:bg-[#081427] border border-slate-300 dark:border-slate-700 px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:border-[#002b49] dark:focus:border-[#00f2fe] focus:outline-none focus:ring-1 focus:ring-[#002b49] font-mono font-bold"
            >
              {VENEZUELAN_STATES.map((st) => (
                <option key={st.code} value={st.code}>
                  [{st.code}] {st.name} ({st.circuitsCount} CTs)
                </option>
              ))}
            </select>
          </div>

          {/* Username Input (Optional if using direct passkey) */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center justify-between">
              <span className="flex items-center space-x-1">
                <User className="h-3.5 w-3.5 text-[#002b49] dark:text-[#00f2fe]" />
                <span>Usuario Corporativo</span>
              </span>
              <span className="text-[10px] text-slate-500 font-normal">Opcional para claves directas</span>
            </label>
            <input
              type="text"
              placeholder="Ej: ggpd_admin, a_correa, j_pacheco"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full rounded-xl bg-slate-50 dark:bg-[#081427] border border-slate-300 dark:border-slate-700 px-3.5 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:border-[#002b49] dark:focus:border-[#00f2fe] focus:outline-none focus:ring-1 focus:ring-[#002b49] font-mono font-bold"
            />
          </div>

          {/* Passkey / Password Input */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center space-x-1">
              <Lock className="h-3.5 w-3.5 text-[#002b49] dark:text-[#00f2fe]" />
              <span>Clave de Acceso Institucional *</span>
            </label>
            <input
              type="password"
              placeholder="Ingrese clave (ej: admin2026!., Correa2026!., Pacheco2026!.)"
              value={passkey}
              onChange={(e) => setPasskey(e.target.value)}
              className="w-full rounded-xl bg-slate-50 dark:bg-[#081427] border border-slate-300 dark:border-slate-700 px-3.5 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:border-[#002b49] dark:focus:border-[#00f2fe] focus:outline-none focus:ring-1 focus:ring-[#002b49] font-mono font-bold"
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
          <div className="rounded-xl bg-blue-50/80 dark:bg-[#061224] p-3 border border-blue-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 space-y-1.5 font-mono">
            <div className="font-bold text-[#002b49] dark:text-[#00f2fe] flex items-center justify-between text-[11px]">
              <span>Directorio de Credenciales SIGI:</span>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">25 Estados Activos</span>
            </div>
            <div className="text-[10.5px] leading-relaxed space-y-1">
              <div>
                • <strong>Administrador General:</strong> <code className="text-slate-900 dark:text-white font-bold bg-white dark:bg-slate-800 px-1 rounded">ggpd_admin</code> / <code className="text-slate-900 dark:text-white font-bold bg-white dark:bg-slate-800 px-1 rounded">admin2026!.</code>
              </div>
              <div>
                • <strong>Gerente General:</strong> <code className="text-slate-900 dark:text-white font-bold bg-white dark:bg-slate-800 px-1 rounded">a_correa</code> (Adrian Correa) / <code className="text-slate-900 dark:text-white font-bold bg-white dark:bg-slate-800 px-1 rounded">Correa2026!.</code>
              </div>
              <div>
                • <strong>Administrador Dev:</strong> <code className="text-slate-900 dark:text-white font-bold bg-white dark:bg-slate-800 px-1 rounded">j_pacheco</code> (Josue Pacheco) / <code className="text-slate-900 dark:text-white font-bold bg-white dark:bg-slate-800 px-1 rounded">Pacheco2026!.</code>
              </div>
              <div className="pt-1 border-t border-slate-200 dark:border-slate-800">
                • <strong>25 Coordinaciones Estadales:</strong> <code className="bg-amber-100 dark:bg-amber-950/60 px-1 py-0.2 rounded text-amber-900 dark:text-amber-300 font-bold">[Estado]2026!.</code>
                <span className="text-[9.5px] text-slate-500 block">Ej: <strong className="text-slate-900 dark:text-white">Tachira2026!.</strong>, <strong className="text-slate-900 dark:text-white">Zulia2026!.</strong>, <strong className="text-slate-900 dark:text-white">Capital2026!.</strong></span>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center space-x-2 rounded-xl bg-[#002b49] hover:bg-[#001f35] text-white dark:bg-gradient-to-r dark:from-[#00f2fe] dark:via-[#00b4d8] dark:to-[#ffd700] dark:text-[#0a192f] py-3 text-xs font-black uppercase shadow-lg hover:shadow-xl active:scale-95 transition-all cursor-pointer"
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
