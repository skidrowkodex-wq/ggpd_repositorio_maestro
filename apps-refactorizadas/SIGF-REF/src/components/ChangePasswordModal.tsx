import React, { useState } from 'react';
import { KeyRound, Eye, EyeOff, ShieldCheck, CheckCircle2, AlertCircle, X, Lock } from 'lucide-react';
import { authService, getDefaultPasswordFor } from '../services/authService';
import { getUserProfile } from '../data/defaultUsers';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUserEmail: string;
}

export const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({
  isOpen,
  onClose,
  currentUserEmail
}) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const profile = getUserProfile(currentUserEmail);
  const defaultInitialPwd = getDefaultPasswordFor(currentUserEmail);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!currentPassword.trim()) {
      setError('Debe ingresar su contraseña actual.');
      return;
    }
    if (!newPassword.trim()) {
      setError('Debe ingresar una nueva contraseña.');
      return;
    }
    if (newPassword.length < 6) {
      setError('La nueva contraseña debe tener un mínimo de 6 caracteres.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('La confirmación no coincide con la nueva contraseña.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      const res = authService.changePassword(
        currentUserEmail,
        currentPassword,
        newPassword,
        confirmPassword
      );

      if (res.success) {
        setSuccessMessage(res.message);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setTimeout(() => {
          onClose();
        }, 1800);
      } else {
        setError(res.message);
      }
    }, 300);
  };

  // Indicador de fortaleza de clave
  const getPasswordStrength = (pwd: string) => {
    if (!pwd) return { score: 0, label: 'Vacía', color: 'bg-slate-200' };
    let s = 0;
    if (pwd.length >= 6) s += 1;
    if (pwd.length >= 8) s += 1;
    if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) s += 1;
    if (/[0-9]/.test(pwd)) s += 1;
    if (/[^A-Za-z0-9]/.test(pwd)) s += 1;

    if (s <= 2) return { score: s, label: 'Básica', color: 'bg-amber-500' };
    if (s <= 4) return { score: s, label: 'Fuerte', color: 'bg-emerald-500' };
    return { score: s, label: 'Industrial SEN', color: 'bg-emerald-700' };
  };

  const strength = getPasswordStrength(newPassword);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl border-2 border-[#c9a227] w-full max-w-md flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-[#0b3d2e] text-white px-5 py-3.5 flex items-center justify-between border-b-2 border-[#c9a227] shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#1a5f47] border border-[#c9a227] flex items-center justify-center text-amber-300 shadow-inner shrink-0">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-black tracking-tight text-white">
                Cambio de Contraseña SEN
              </h2>
              <p className="text-[11px] text-emerald-200 font-medium">
                Gestión de credenciales para esta entidad
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Info del Usuario / Estado Actual */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-white border border-slate-300 flex items-center justify-center text-sm shrink-0">
              {profile.avatar}
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-slate-900 truncate">
                {profile.nombre}
              </div>
              <div className="text-[10px] text-slate-500 font-mono truncate">
                {profile.email}
              </div>
            </div>
          </div>
          <div className="shrink-0">
            {profile.estadoAsignado ? (
              <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-100 text-emerald-900 font-bold border border-emerald-300">
                📍 {profile.estadoAsignado.toUpperCase()}
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded text-[10px] bg-blue-100 text-blue-900 font-bold border border-blue-300">
                🌐 NACIONAL
              </span>
            )}
          </div>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          
          {/* Mensajes de Alerta */}
          {error && (
            <div className="p-3 bg-red-50 border-l-4 border-red-600 text-xs text-red-700 flex items-start gap-2 rounded-r-lg">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3 bg-emerald-50 border-l-4 border-emerald-600 text-xs text-emerald-800 flex items-start gap-2 rounded-r-lg">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
              <span className="font-semibold">{successMessage}</span>
            </div>
          )}

          {/* Campo 1: Contraseña Actual */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-slate-800">
                Contraseña Actual
              </label>
              <span className="text-[10px] text-slate-500 font-normal">
                Clave en uso
              </span>
            </div>
            <div className="relative">
              <input
                type={showCurrent ? 'text' : 'password'}
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Ingrese contraseña actual..."
                className="w-full px-3 py-2 pr-10 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0b3d2e] focus:border-[#0b3d2e] font-mono text-slate-900"
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                aria-label="Alternar visibilidad"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-700"
              >
                {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-[10px] text-slate-500 mt-1">
              💡 Clave inicial por defecto: <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-800 font-bold">{defaultInitialPwd}</code> o <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-800 font-bold">Corpoelec2026*</code>
            </p>
          </div>

          {/* Campo 2: Nueva Contraseña */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              Nueva Contraseña
            </label>
            <div className="relative">
              <input
                type={showNew ? 'text' : 'password'}
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres..."
                className="w-full px-3 py-2 pr-10 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0b3d2e] focus:border-[#0b3d2e] font-mono text-slate-900"
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                aria-label="Alternar visibilidad"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-700"
              >
                {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Barra de fortaleza */}
            {newPassword && (
              <div className="mt-1.5 space-y-1">
                <div className="flex items-center justify-between text-[10px] text-slate-600 font-medium">
                  <span>Seguridad:</span>
                  <span className="font-bold">{strength.label}</span>
                </div>
                <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-300 ${strength.color}`} 
                    style={{ width: `${Math.min(100, strength.score * 20)}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Campo 3: Confirmar Nueva Contraseña */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              Confirmar Nueva Contraseña
            </label>
            <div className="relative">
              <input
                type={showConfirm ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repita la nueva contraseña..."
                className="w-full px-3 py-2 pr-10 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0b3d2e] focus:border-[#0b3d2e] font-mono text-slate-900"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                aria-label="Alternar visibilidad"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-700"
              >
                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Botones de Acción */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 text-xs font-bold text-white bg-[#0b3d2e] hover:bg-[#1a5f47] border border-[#c9a227] rounded-lg shadow-sm transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
            >
              <Lock className="w-3.5 h-3.5 text-[#c9a227]" />
              <span>{isLoading ? 'Actualizando...' : 'Guardar Nueva Contraseña'}</span>
            </button>
          </div>

        </form>

        {/* Footer */}
        <div className="px-5 py-2.5 bg-slate-100 border-t border-slate-200 text-center text-[10px] text-slate-500 font-mono">
          Cifrado local seguro · Evento registrado en Auditoría ISO 27001
        </div>

      </div>
    </div>
  );
};
