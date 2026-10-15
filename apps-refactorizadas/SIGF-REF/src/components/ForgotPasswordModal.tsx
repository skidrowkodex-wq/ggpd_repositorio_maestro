import React, { useState } from 'react';
import { ShieldAlert, Send, CheckCircle2, AlertCircle, X, HelpCircle, MapPin, User, FileText } from 'lucide-react';
import { passwordResetService } from '../services/passwordResetService';
import { VENEZUELA_STATES } from '../data/venezuelaRegions';
import { getStateUser } from '../data/defaultUsers';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialState?: string;
  initialEmail?: string;
}

export const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({
  isOpen,
  onClose,
  initialState = 'Zulia',
  initialEmail = ''
}) => {
  const [selectedState, setSelectedState] = useState<string>(initialState);
  const [email, setEmail] = useState<string>(() => {
    if (initialEmail) return initialEmail;
    const u = getStateUser(initialState);
    return u?.email || 'zul.corpoelec@corpoelec.gob.ve';
  });

  const [solicitanteNombre, setSolicitanteNombre] = useState('');
  const [solicitanteCedula, setSolicitanteCedula] = useState('');
  const [motivo, setMotivo] = useState('Olvido de clave institucional de la coordinación territorial');
  const [error, setError] = useState<string | null>(null);
  const [submittedRequest, setSubmittedRequest] = useState<{ id: string; estado: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleStateChange = (stateName: string) => {
    setSelectedState(stateName);
    const u = getStateUser(stateName);
    if (u) {
      setEmail(u.email);
    } else {
      const st = VENEZUELA_STATES.find(s => s.nombre === stateName);
      setEmail(`${st?.codigo?.toLowerCase() || 'edo'}.corpoelec@corpoelec.gob.ve`);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!solicitanteNombre.trim()) {
      setError('Debe indicar el nombre y apellido del solicitante.');
      return;
    }
    if (!solicitanteCedula.trim()) {
      setError('Debe indicar la cédula de identidad del solicitante para la auditoría.');
      return;
    }
    if (!motivo.trim()) {
      setError('Debe especificar el motivo institucional de la solicitud.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      const req = passwordResetService.createRequest({
        email,
        estado: selectedState,
        solicitanteNombre,
        solicitanteCedula,
        motivo
      });

      setSubmittedRequest({ id: req.id, estado: req.estado });
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl border-2 border-[#c9a227] w-full max-w-lg flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-[#0b3d2e] text-white px-5 py-3.5 flex items-center justify-between border-b-2 border-[#c9a227] shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#1a5f47] border border-[#c9a227] flex items-center justify-center text-amber-300 shadow-inner shrink-0">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-black tracking-tight text-white">
                Solicitud de Reinicio de Clave SEN
              </h2>
              <p className="text-[11px] text-emerald-200 font-medium">
                Gestión formal ante el Administrador General GGPD
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

        {/* Contenido */}
        {submittedRequest ? (
          <div className="p-6 text-center space-y-4">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto border-2 border-emerald-500 shadow-inner">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div className="space-y-1.5">
              <span className="text-[11px] font-mono font-bold uppercase bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded border border-emerald-300">
                Ticket N° {submittedRequest.id}
              </span>
              <h3 className="text-base font-black text-[#0b3d2e]">
                Solicitud Registrada Exitosamente
              </h3>
              <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
                Se ha generado la notificación formal para el <strong>Estado {submittedRequest.estado}</strong> en la bandeja del <strong>Administrador General SEN</strong>.
              </p>
            </div>

            <div className="bg-amber-50 border-l-4 border-amber-500 p-3 rounded text-left text-xs text-amber-900 space-y-1">
              <div className="font-bold">Protocolo de Seguridad Institucional:</div>
              <p className="text-[11px]">
                El administrador auditará los datos suministrados y emitirá una nueva clave temporal autorizada a través de los canales institucionales.
              </p>
            </div>

            <button
              onClick={onClose}
              className="w-full py-2.5 px-4 bg-[#0b3d2e] hover:bg-[#1a5f47] text-white rounded-lg text-xs font-bold transition-all shadow-sm cursor-pointer"
            >
              Entendido / Regresar a Inicio de Sesión
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            
            <div className="text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-200">
              <p className="font-semibold text-slate-800">
                🔒 Proceso de Validación y Resguardo SEN:
              </p>
              <p className="text-[11px] mt-0.5 text-slate-600">
                Por políticas de seguridad ISO 27001, las contraseñas territoriales no son visibles de forma pública. Complete este formulario para que el Administrador evalúe su solicitud de reinicio.
              </p>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border-l-4 border-red-600 text-xs text-red-700 flex items-center gap-2 rounded-r-lg">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Selector de Estado */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-700" />
                <span>Estado / Entidad Afectada</span>
              </label>
              <select
                value={selectedState}
                onChange={(e) => handleStateChange(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white text-slate-900 font-semibold border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0b3d2e]"
              >
                {VENEZUELA_STATES.map(s => (
                  <option key={s.id} value={s.nombre}>
                    Estado {s.nombre} ({s.codigo}) · Región {s.region}
                  </option>
                ))}
              </select>
            </div>

            {/* Cuenta / Correo asignado */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Cuenta Institucional
              </label>
              <input
                type="text"
                readOnly
                value={email}
                className="w-full px-3 py-2 text-xs bg-slate-100 border border-slate-300 rounded-lg font-mono text-slate-700 cursor-not-allowed"
              />
            </div>

            {/* Datos del Solicitante: Nombre y Cédula */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1 flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-slate-500" />
                  <span>Nombre y Apellido</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Ing. Juan Pérez"
                  value={solicitanteNombre}
                  onChange={(e) => setSolicitanteNombre(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0b3d2e] text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Cédula de Identidad
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. V-18.456.789"
                  value={solicitanteCedula}
                  onChange={(e) => setSolicitanteCedula(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0b3d2e] text-slate-900 font-mono"
                />
              </div>
            </div>

            {/* Motivo de la Solicitud */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1 flex items-center gap-1">
                <FileText className="w-3.5 h-3.5 text-slate-500" />
                <span>Motivo del Reinicio de Clave</span>
              </label>
              <textarea
                required
                rows={2}
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0b3d2e] text-slate-900"
                placeholder="Indique motivo o justificación institucional..."
              />
            </div>

            {/* Botones */}
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
                className="px-4 py-2 text-xs font-bold text-white bg-[#0b3d2e] hover:bg-[#1a5f47] border border-[#c9a227] rounded-lg shadow-sm transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5 text-[#c9a227]" />
                <span>{isLoading ? 'Transmitiendo...' : 'Enviar Solicitud al Administrador'}</span>
              </button>
            </div>

          </form>
        )}

        {/* Footer */}
        <div className="px-5 py-2 bg-slate-100 border-t border-slate-200 text-center text-[10px] text-slate-500 font-mono">
          Sistema Nacional de Auditoría y Control de Acceso SEN
        </div>

      </div>
    </div>
  );
};
