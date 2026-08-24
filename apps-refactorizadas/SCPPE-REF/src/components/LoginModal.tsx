import React, { useState } from 'react';
import { UserProfile } from '../types';
import { loginUser } from '../services/authService';
import { ShieldCheck, User, Key, AlertCircle, RefreshCw } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: UserProfile) => void;
  darkMode?: boolean;
}

export function LoginModal({ isOpen, onClose, onLoginSuccess, darkMode = false }: LoginModalProps) {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier || !password) {
      setErrorMsg('Por favor ingrese usuario y contraseña');
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
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4">
      <div className={`industrial-card max-w-md w-full p-6 sm:p-8 space-y-6 relative overflow-hidden transition-colors ${
        darkMode ? 'border-slate-800 text-slate-100' : 'border-slate-200 text-slate-900'
      }`}>
        {/* Franja de Identidad Corporativa CORPOELEC (Rojo, Azul, Amarillo) */}
        <div className="absolute top-0 left-0 right-0 h-1.5 flex">
          <div className="h-full w-1/3 bg-corpo-red" />
          <div className="h-full w-1/3 bg-corpo-blue" />
          <div className="h-full w-1/3 bg-corpo-accent" />
        </div>

        {/* Encabezado */}
        <div className="text-center space-y-2 pt-1">
          <div className={`mx-auto w-12 h-12 rounded-md border flex items-center justify-center font-bold text-2xl shadow-inner ${
            darkMode ? 'bg-amber-500/10 border-amber-500/30 text-corpo-accent' : 'bg-red-50 border-red-200 text-corpo-red'
          }`}>
            ⚡
          </div>
          <div className="space-y-1">
            <h2 className={`text-xl font-bold tracking-tight ${darkMode ? 'text-white' : 'text-slate-900'}`}>
              Iniciar Sesión — Planificación Eléctrica SEN
            </h2>
            <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              CORPOELEC • Gerencia General de Planificación de Distribución
            </p>
          </div>
        </div>

        {/* Mensaje de error */}
        {errorMsg && (
          <div className={`p-3 rounded-md border text-xs flex items-center gap-2 ${
            darkMode
              ? 'bg-red-950/80 border-red-800/80 text-red-200'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}>
            <AlertCircle className="w-4 h-4 text-corpo-accent shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="space-y-1.5">
            <label className={`block font-semibold ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
              Usuario o Correo Institucional
            </label>
            <div className="relative">
              <input
                type="text"
                required
                placeholder="ej: j_pacheco"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className={`w-full border rounded-md pl-9 pr-3 py-2.5 font-mono focus:outline-none transition-colors ${
                  darkMode
                    ? 'bg-slate-950 border-slate-800 text-slate-100 focus:border-corpo-blue'
                    : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-corpo-blue focus:bg-white'
                }`}
              />
              <User className={`w-4 h-4 absolute left-3 top-3 ${darkMode ? 'text-slate-400' : 'text-slate-400'}`} />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className={`block font-semibold ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
              Contraseña
            </label>
            <div className="relative">
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full border rounded-md pl-9 pr-3 py-2.5 font-mono focus:outline-none transition-colors ${
                  darkMode
                    ? 'bg-slate-950 border-slate-800 text-slate-100 focus:border-corpo-blue'
                    : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-corpo-blue focus:bg-white'
                }`}
              />
              <Key className={`w-4 h-4 absolute left-3 top-3 ${darkMode ? 'text-slate-400' : 'text-slate-400'}`} />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-md bg-corpo-blue hover:bg-corpo-dark text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md active:scale-[0.99]"
          >
            {loading ? (
              <RefreshCw className="w-4 h-4 animate-spin text-white" />
            ) : (
              <ShieldCheck className="w-4 h-4" />
            )}
            <span>Autenticar y Acceder</span>
          </button>
        </form>
      </div>
    </div>
  );
}
