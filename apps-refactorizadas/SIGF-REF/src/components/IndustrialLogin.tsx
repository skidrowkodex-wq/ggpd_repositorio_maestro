import React, { useState, useEffect } from 'react';
import { 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  Lock, 
  AlertCircle, 
  ArrowRight, 
  MapPin, 
  Building2, 
  KeyRound, 
  Info,
  RefreshCw,
  HelpCircle
} from 'lucide-react';
import { VENEZUELA_STATES, VENEZUELA_REGIONS } from '../data/venezuelaRegions';
import { getRegionForState } from '../services/regionAdapter';
import { getStateUser } from '../data/defaultUsers';
import { authService } from '../services/authService';
import { ForgotPasswordModal } from './ForgotPasswordModal';
import logoCorpoelec from '../assets/logo-corpoelec.png';

interface IndustrialLoginProps {
  onLoginSuccess: (userEmail: string, selectedState?: string) => void;
}

// Generador de CAPTCHA alfanumérico visual
function generateCaptcha(): string {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let result = '';
  for (let i = 0; i < 5; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export const IndustrialLogin: React.FC<IndustrialLoginProps> = ({ onLoginSuccess }) => {
  const [loginMode, setLoginMode] = useState<'estado' | 'standard'>('estado');
  // Formulario en blanco por defecto: el usuario debe seleccionar estado/usuario.
  const [selectedState, setSelectedState] = useState<string>('');
  const [usuario, setUsuario] = useState('');
  
  // Contraseña siempre vacía por defecto
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // CAPTCHA institucional
  const [captchaCode, setCaptchaCode] = useState<string>(() => generateCaptcha());
  const [captchaInput, setCaptchaInput] = useState<string>('');

  const [error, setError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);

  // Region calculada para el estado seleccionado
  const stateRegion = getRegionForState(selectedState);

  const handleRefreshCaptcha = () => {
    setCaptchaCode(generateCaptcha());
    setCaptchaInput('');
  };

  const handleStateSelectChange = (stateName: string) => {
    setSelectedState(stateName);
    setError(null);
    setInfoMessage(null);
    setPassword('');

    if (!stateName) {
      // Sin estado seleccionado: no autocompletar el usuario.
      setUsuario('');
      return;
    }

    const user = getStateUser(stateName);
    if (user) {
      setUsuario(user.email);
    } else {
      const stateObj = VENEZUELA_STATES.find(s => s.nombre === stateName);
      const code = stateObj?.codigo?.toLowerCase() || 'zul';
      setUsuario(`${code}.corpoelec@corpoelec.gob.ve`);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfoMessage(null);

    if (loginMode === 'estado' && !selectedState.trim()) {
      setError('Debe seleccionar su Estado de Conexión SEN para continuar.');
      return;
    }

    if (!usuario.trim()) {
      setError('Debe especificar el usuario o correo institucional.');
      return;
    }

    if (!password.trim()) {
      setError(`Debe ingresar la clave confidencial de la entidad.`);
      return;
    }

    // 1. Validación de CAPTCHA institucional
    if (!captchaInput.trim() || captchaInput.trim().toUpperCase() !== captchaCode.toUpperCase()) {
      setError('Código de validación CAPTCHA incorrecto. Ingrese los caracteres mostrados en la imagen.');
      handleRefreshCaptcha();
      return;
    }

    // 2. Validación estricta con el almacén seguro de contraseñas por estado
    const validation = authService.validateCredentials(usuario.trim(), password.trim());
    if (!validation.success) {
      setError(validation.message || 'Credenciales no autorizadas para esta entidad territorial.');
      handleRefreshCaptcha();
      return;
    }

    setIsLoading(true);

    if (selectedState) {
      localStorage.setItem('sen_user_state', selectedState);
    }

    setTimeout(() => {
      setIsLoading(false);
      onLoginSuccess(usuario.trim(), selectedState);
    }, 350);
  };

  return (
    <div className="min-h-screen bg-[#0a1f17] flex flex-col justify-center items-center px-4 py-8 relative overflow-hidden">
      {/* Decorative SEN Grid Background */}
      <div 
        className="absolute inset-0 opacity-15 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(#c9a227 1px, transparent 1px), radial-gradient(#1a5f47 1px, #0a1f17 1px)`,
          backgroundSize: '40px 40px',
          backgroundPosition: '0 0, 20px 20px'
        }}
      />

      <div className="w-full max-w-lg z-10 space-y-5">
        {/* Pill Superior */}
        <div className="flex justify-center">
          <div 
            className="animate-sen-pulse inline-flex items-center text-xs text-white"
            style={{
              background: 'linear-gradient(90deg, #0b3d2e, #1a5f47)',
              borderRadius: '999px',
              padding: '6px 16px',
              fontWeight: 600,
              letterSpacing: '0.5px',
              boxShadow: '0 0 12px rgba(26,95,71,0.6)'
            }}
          >
            🛡️ ZONA SEGURA CIFRADA · ISO/IEC 27001 · RBAC SEN
          </div>
        </div>

        {/* Card Principal de Autenticación */}
        <div className="bg-white rounded-2xl shadow-2xl border-2 border-[#c9a227] p-6 sm:p-8 space-y-5 backdrop-blur-sm">
          {/* Sello de Certificación */}
          <div className="flex flex-col items-center text-center space-y-2">
            <div 
              style={{
                fontSize: '0.8rem',
                textTransform: 'uppercase',
                letterSpacing: '1.5px',
                color: '#c9a227',
                border: '1px solid #c9a227',
                borderRadius: '4px',
                padding: '3px 10px',
                fontWeight: 700
              }}
            >
              CERTIFICACIÓN DE GRADO INDUSTRIAL · SEN 2026
            </div>

            {/* Imagen Corporativa CORPOELEC (escala adaptativa al ancho de la tarjeta, sin deformar) */}
            <div className="w-full flex items-center justify-center py-1">
              <img
                src={logoCorpoelec}
                alt="CORPOELEC — Corporación Eléctrica Nacional"
                className="block w-full h-auto object-contain select-none"
                draggable={false}
                onError={(e) => {
                  // Respaldo si el asset no se carga: volver al rótulo de texto.
                  const el = e.currentTarget;
                  el.style.display = 'none';
                  const parent = el.parentElement;
                  if (parent) {
                    parent.textContent = 'CORPOELEC · GGPD';
                    parent.className = 'text-xl sm:text-2xl font-black text-[#0b3d2e] tracking-tight';
                  }
                }}
              />
            </div>

            <div>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Ingesta de Flota Vehicular con Autenticación Territorial Descentralizada
              </p>
            </div>
          </div>

          {/* Selector de Modo de Conexión: Territorial vs Roles Centrales */}
          <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs font-bold">
            <button
              type="button"
              onClick={() => {
                setLoginMode('estado');
                if (selectedState) {
                  handleStateSelectChange(selectedState);
                } else {
                  setUsuario('');
                  setPassword('');
                  setError(null);
                  setInfoMessage('Seleccione su estado territorial, ingrese su clave y el código CAPTCHA.');
                }
              }}
              className={`py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                loginMode === 'estado'
                  ? 'bg-[#0b3d2e] text-white shadow-xs border border-[#c9a227]'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
              }`}
            >
              <MapPin className="w-3.5 h-3.5 text-[#c9a227]" />
              <span>Conexión por Estado (24)</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setLoginMode('standard');
                setUsuario('');
                setPassword('');
                setError(null);
                setInfoMessage('Ingrese su usuario corporativo, clave y el código CAPTCHA.');
              }}
              className={`py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                loginMode === 'standard'
                  ? 'bg-[#0b3d2e] text-white shadow-xs border border-[#c9a227]'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
              }`}
            >
              <Building2 className="w-3.5 h-3.5 text-[#c9a227]" />
              <span>Roles Centrales / Admin</span>
            </button>
          </div>

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {loginMode === 'estado' && (
              /* SELECCIÓN DEL ESTADO TERRITORIAL */
              <div className="bg-emerald-50/70 border border-emerald-300 rounded-xl p-3.5 space-y-2.5">
                <div className="flex items-center justify-between">
                  <label htmlFor="estado-select" className="block text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-emerald-700" />
                    <span>Seleccione su Estado de Conexión SEN:</span>
                  </label>
                  {selectedState && (
                    <span className="text-[10px] font-mono font-bold bg-emerald-200/80 text-emerald-900 px-1.5 py-0.5 rounded">
                      {stateRegion.nombre}
                    </span>
                  )}
                </div>

                <select
                  id="estado-select"
                  value={selectedState}
                  onChange={(e) => handleStateSelectChange(e.target.value)}
                  className="w-full px-3 py-2.5 text-xs bg-white text-slate-900 font-bold border-2 border-emerald-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0b3d2e]"
                >
                  <option value="" disabled>
                    — Seleccione su Estado —
                  </option>
                  {VENEZUELA_REGIONS.map(reg => (
                    <optgroup key={reg.id} label={`REGIÓN ${reg.nombre.toUpperCase()} (${reg.estados.length} Estados)`}>
                      {reg.estados.map(stName => {
                        const stObj = VENEZUELA_STATES.find(s => s.nombre === stName);
                        return (
                          <option key={stName} value={stName}>
                            Estado {stName} ({stObj?.codigo || 'SEN'}) · {stObj?.capital || ''}
                          </option>
                        );
                      })}
                    </optgroup>
                  ))}
                </select>

                <div className="flex items-start gap-2 text-[11px] text-emerald-900 bg-white/80 p-2 rounded-lg border border-emerald-200">
                  <Lock className="w-3.5 h-3.5 text-emerald-700 shrink-0 mt-0.5" />
                  <div>
                    {selectedState ? (
                      <>
                        <span className="font-bold">Seguridad SEN:</span> Conectando a <strong>Estado {selectedState}</strong> ({stateRegion.nombre}). Cada coordinación territorial gestiona su propia clave confidencial.
                      </>
                    ) : (
                      <>
                        <span className="font-bold">Seguridad SEN:</span> Seleccione su entidad territorial para habilitar su credencial descentralizada.
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Campo: Usuario Corporativo / Correo */}
            <div>
              <label 
                htmlFor="usuario" 
                className="block text-xs font-bold text-slate-800 mb-1"
              >
                Usuario Corporativo / Correo
              </label>
              <div className="relative">
                <input
                  id="usuario"
                  type="text"
                  required
                  value={usuario}
                  onChange={(e) => {
                    setUsuario(e.target.value);
                    setPassword('');
                    setError(null);
                  }}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0b3d2e] focus:border-[#0b3d2e] font-medium text-slate-900 transition-colors"
                />
              </div>
            </div>

            {/* Campo: Contraseña Institucional */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label 
                  htmlFor="password" 
                  className="block text-xs font-bold text-slate-800"
                >
                  Contraseña Institucional
                </label>
                <button
                  type="button"
                  onClick={() => setIsForgotPasswordOpen(true)}
                  className="text-[11px] text-[#0b3d2e] hover:text-[#1a5f47] font-bold flex items-center gap-1 hover:underline cursor-pointer"
                >
                  <HelpCircle className="w-3.5 h-3.5 text-[#c9a227]" />
                  <span>¿Olvidó su clave?</span>
                </button>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  placeholder="Ingrese la clave confidencial de su entidad..."
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 pr-10 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0b3d2e] focus:border-[#0b3d2e] font-mono text-slate-900 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label="Alternar visibilidad de contraseña"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-[#0b3d2e] focus:outline-none"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* CAPTCHA Institucional de Seguridad SEN */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="captcha" className="block text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Código de Validación (CAPTCHA):</span>
                </label>
                <button
                  type="button"
                  onClick={handleRefreshCaptcha}
                  className="text-[11px] text-slate-500 hover:text-[#0b3d2e] flex items-center gap-1 font-semibold cursor-pointer"
                  title="Generar nuevo código"
                >
                  <RefreshCw className="w-3 h-3 text-[#c9a227]" />
                  <span>Cambiar imagen</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 items-center">
                {/* Visual CAPTCHA Canvas / Box */}
                <div 
                  className="h-10 rounded-lg flex items-center justify-center select-none relative overflow-hidden border border-slate-300 shadow-inner"
                  style={{
                    background: 'linear-gradient(135deg, #0b3d2e 0%, #134e3a 50%, #0a261c 100%)',
                    letterSpacing: '7px'
                  }}
                  title="Código de seguridad anti-automatización"
                >
                  {/* Decorative noise lines */}
                  <div className="absolute inset-0 opacity-20 pointer-events-none" style={{
                    backgroundImage: 'repeating-linear-gradient(45deg, #c9a227 0, #c9a227 1px, transparent 0, transparent 8px)'
                  }} />
                  <span className="font-mono font-black text-lg text-amber-300 drop-shadow-md transform -skew-x-6 tracking-widest pl-2">
                    {captchaCode}
                  </span>
                </div>

                {/* Input del CAPTCHA */}
                <input
                  id="captcha"
                  type="text"
                  required
                  maxLength={5}
                  value={captchaInput}
                  onChange={(e) => setCaptchaInput(e.target.value.toUpperCase())}
                  placeholder="Escriba el código..."
                  className="w-full h-10 px-3 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0b3d2e] font-mono font-bold tracking-widest text-slate-900 uppercase text-center"
                />
              </div>
              <p className="text-[10px] text-slate-500">
                Verificación anti-automatización según normativa de ciberseguridad SEN.
              </p>
            </div>

            {/* Mensajes de Información o Error */}
            {infoMessage && (
              <div className="p-2.5 bg-blue-50 border-l-4 border-blue-600 text-xs text-blue-800 flex items-center gap-2 rounded-r-md">
                <Info className="w-4 h-4 shrink-0 text-blue-600" />
                <span>{infoMessage}</span>
              </div>
            )}

            {error && (
              <div className="p-3 bg-red-50 border-l-4 border-[#c62828] text-xs text-[#c62828] flex items-center gap-2 rounded-r-md">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Aviso de Auditoria */}
            <div 
              style={{
                background: 'rgba(201,162,39,0.08)',
                borderLeft: '4px solid #c9a227',
                padding: '9px 12px',
                fontSize: '0.8rem',
                color: '#5a4a10',
                borderRadius: '0 6px 6px 0'
              }}
              className="font-medium"
            >
              Control de acceso descentralizado por estado bajo estándar ISO/IEC 27001.
            </div>

            {/* Botón de Envío */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg text-white font-bold text-xs uppercase tracking-wider transition-all duration-200 shadow-md cursor-pointer hover:shadow-lg disabled:opacity-50"
              style={{
                background: 'linear-gradient(135deg, #0b3d2e 0%, #1a5f47 100%)',
                border: '1px solid #c9a227'
              }}
            >
              {isLoading ? (
                <span>Validando credenciales y CAPTCHA SEN...</span>
              ) : (
                <>
                  <span>
                    {loginMode === 'estado'
                      ? (selectedState ? `Ingresar como Estado ${selectedState}` : 'Ingresar (seleccione estado)')
                      : 'Ingresar al Sistema Seguro SEN'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Pie Multinormativo */}
          <div 
            style={{
              fontSize: '0.72rem',
              color: '#666666',
              textAlign: 'center',
              marginTop: '16px'
            }}
            className="font-mono pt-3 border-t border-slate-100"
          >
            ISO 27001 · ISO 8000-110 · OWASP Top 10 · ISACA COBIT
          </div>
        </div>

        {/* Mención Institucional Inferior */}
        <div className="text-center text-[11px] text-slate-400">
          CORPOELEC · Gerencia General de Planificación y Distribución · 2026
        </div>
      </div>

      {/* Modal para Solicitar Reinicio de Clave */}
      {isForgotPasswordOpen && (
        <ForgotPasswordModal
          isOpen={isForgotPasswordOpen}
          onClose={() => setIsForgotPasswordOpen(false)}
          initialState={selectedState}
          initialEmail={usuario}
        />
      )}
    </div>
  );
};
