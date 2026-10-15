import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  KeyRound, 
  X, 
  Search, 
  Filter, 
  RefreshCw,
  User,
  MapPin,
  Check,
  AlertCircle
} from 'lucide-react';
import { passwordResetService, PasswordResetRequest } from '../services/passwordResetService';

interface AdminPasswordResetModalProps {
  isOpen: boolean;
  onClose: () => void;
  adminUserEmail: string;
}

export const AdminPasswordResetModal: React.FC<AdminPasswordResetModalProps> = ({
  isOpen,
  onClose,
  adminUserEmail
}) => {
  const [requests, setRequests] = useState<PasswordResetRequest[]>([]);
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'PENDIENTE' | 'ATENDIDO'>('PENDIENTE');
  const [searchTerm, setSearchTerm] = useState('');
  
  const [selectedReqForApproval, setSelectedReqForApproval] = useState<PasswordResetRequest | null>(null);
  const [customTempPassword, setCustomTempPassword] = useState('');
  const [approvalResult, setApprovalResult] = useState<{ id: string; tempPassword: string; message: string } | null>(null);

  const [rejectingReq, setRejectingReq] = useState<PasswordResetRequest | null>(null);
  const [rejectReason, setRejectReason] = useState('No se pudo verificar la autenticidad de la identidad');

  const reloadRequests = () => {
    setRequests(passwordResetService.getRequests());
  };

  useEffect(() => {
    if (isOpen) {
      reloadRequests();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const filteredRequests = requests.filter(r => {
    const matchesStatus = 
      filterStatus === 'ALL' ||
      (filterStatus === 'PENDIENTE' && r.status === 'PENDIENTE') ||
      (filterStatus === 'ATENDIDO' && r.status !== 'PENDIENTE');

    const matchesSearch = 
      r.estado.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.solicitanteNombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.solicitanteCedula.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesStatus && matchesSearch;
  });

  const pendingCount = requests.filter(r => r.status === 'PENDIENTE').length;

  const handleStartApproval = (req: PasswordResetRequest) => {
    setSelectedReqForApproval(req);
    const cleanState = req.estado.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '');
    const rand = Math.floor(1000 + Math.random() * 9000);
    setCustomTempPassword(`${cleanState}${rand}*`);
    setApprovalResult(null);
  };

  const handleConfirmApproval = () => {
    if (!selectedReqForApproval) return;
    const res = passwordResetService.approveRequest(
      selectedReqForApproval.id,
      adminUserEmail,
      customTempPassword
    );
    if (res.success) {
      setApprovalResult({
        id: selectedReqForApproval.id,
        tempPassword: res.tempPassword,
        message: res.message
      });
      reloadRequests();
      setSelectedReqForApproval(null);
    }
  };

  const handleConfirmRejection = () => {
    if (!rejectingReq) return;
    passwordResetService.rejectRequest(
      rejectingReq.id,
      adminUserEmail,
      rejectReason
    );
    reloadRequests();
    setRejectingReq(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl border-2 border-[#c9a227] w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-[#0b3d2e] text-white px-5 py-3.5 flex items-center justify-between border-b-2 border-[#c9a227] shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#1a5f47] border border-[#c9a227] flex items-center justify-center text-amber-300 shadow-inner shrink-0">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-black tracking-tight text-white">
                  Bandeja de Solicitudes de Reinicio de Clave
                </h2>
                {pendingCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500 text-slate-950 animate-pulse">
                    {pendingCount} PENDIENTES
                  </span>
                )}
              </div>
              <p className="text-[11px] text-emerald-200 font-medium">
                Módulo de Autorización y Emisión de Claves Temporales SEN
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

        {/* Toolbar de Filtros y Búsqueda */}
        <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por estado, cédula o solicitante..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0b3d2e] text-slate-900"
            />
          </div>

          <div className="flex items-center gap-1.5 w-full sm:w-auto">
            <span className="text-xs font-bold text-slate-700 mr-1">Filtrar:</span>
            <button
              onClick={() => setFilterStatus('PENDIENTE')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                filterStatus === 'PENDIENTE'
                  ? 'bg-amber-500 text-slate-950 shadow-xs'
                  : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-100'
              }`}
            >
              Pendientes ({pendingCount})
            </button>
            <button
              onClick={() => setFilterStatus('ATENDIDO')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                filterStatus === 'ATENDIDO'
                  ? 'bg-[#0b3d2e] text-white shadow-xs'
                  : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-100'
              }`}
            >
              Atendidos
            </button>
            <button
              onClick={() => setFilterStatus('ALL')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                filterStatus === 'ALL'
                  ? 'bg-[#0b3d2e] text-white shadow-xs'
                  : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-100'
              }`}
            >
              Todos ({requests.length})
            </button>
          </div>
        </div>

        {/* Notificación de aprobación reciente */}
        {approvalResult && (
          <div className="p-3 bg-emerald-50 border-b border-emerald-300 flex items-center justify-between gap-3 text-xs text-emerald-900">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <span className="font-bold">Clave temporal generada con éxito:</span>{' '}
                <code className="bg-emerald-200/80 px-2 py-0.5 rounded font-mono font-black text-emerald-950">
                  {approvalResult.tempPassword}
                </code>
                <span className="block text-[11px] text-emerald-800">
                  Transmita esta clave temporal al solicitante verificado para su ingreso.
                </span>
              </div>
            </div>
            <button
              onClick={() => setApprovalResult(null)}
              className="text-xs font-bold text-emerald-700 hover:underline shrink-0"
            >
              Descartar
            </button>
          </div>
        )}

        {/* Listado de Solicitudes */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3">
          {filteredRequests.length === 0 ? (
            <div className="p-10 text-center space-y-2">
              <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto">
                <Check className="w-6 h-6 text-emerald-600" />
              </div>
              <h3 className="text-sm font-bold text-slate-800">
                No hay solicitudes en esta bandeja
              </h3>
              <p className="text-xs text-slate-500">
                {filterStatus === 'PENDIENTE' 
                  ? 'Todas las solicitudes de reinicio han sido evaluadas y atendidas.' 
                  : 'No se encontraron registros que coincidan con la búsqueda.'}
              </p>
            </div>
          ) : (
            filteredRequests.map((req) => {
              const isPending = req.status === 'PENDIENTE';
              const isApproved = req.status === 'APROBADO';

              return (
                <div
                  key={req.id}
                  className={`p-4 rounded-xl border transition-all space-y-3 ${
                    isPending
                      ? 'border-amber-400 bg-amber-50/40 shadow-xs ring-1 ring-amber-300'
                      : isApproved
                      ? 'border-emerald-200 bg-emerald-50/20'
                      : 'border-slate-200 bg-slate-50'
                  }`}
                >
                  {/* Encabezado del Ticket */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-black text-slate-800 bg-white px-2 py-0.5 rounded border border-slate-300">
                        {req.id}
                      </span>
                      <span className="font-bold text-xs text-slate-900 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-emerald-700" />
                        <span>Estado {req.estado}</span>
                      </span>
                      <span className="text-[11px] font-mono text-slate-500 hidden sm:inline">
                        ({req.email})
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{req.fechaSolicitud}</span>
                      </span>

                      {isPending && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-black bg-amber-100 text-amber-900 border border-amber-300">
                          PENDIENTE DE EVALUACIÓN
                        </span>
                      )}
                      {isApproved && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-black bg-emerald-100 text-emerald-900 border border-emerald-300 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>APROBADO</span>
                        </span>
                      )}
                      {req.status === 'RECHAZADO' && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-black bg-red-100 text-red-900 border border-red-300 flex items-center gap-1">
                          <XCircle className="w-3 h-3 text-red-600" />
                          <span>RECHAZADO</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Detalle del Solicitante y Motivo */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="bg-white p-2.5 rounded-lg border border-slate-200/70 space-y-1">
                      <div className="text-[10px] font-bold text-slate-400 uppercase">
                        Inspector / Solicitante:
                      </div>
                      <div className="font-bold text-slate-900 flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-slate-500" />
                        <span>{req.solicitanteNombre}</span>
                      </div>
                      <div className="text-[11px] text-slate-600 font-mono">
                        Cédula: <strong>{req.solicitanteCedula}</strong>
                      </div>
                    </div>

                    <div className="bg-white p-2.5 rounded-lg border border-slate-200/70 space-y-1">
                      <div className="text-[10px] font-bold text-slate-400 uppercase">
                        Motivo Declarado:
                      </div>
                      <div className="text-slate-800 text-[11px] leading-relaxed">
                        {req.motivo}
                      </div>
                    </div>
                  </div>

                  {/* Estado de Resolución */}
                  {isApproved && (
                    <div className="p-2.5 bg-emerald-100/60 rounded-lg border border-emerald-200 flex items-center justify-between text-xs text-emerald-950">
                      <div>
                        <span>Clave Temporal Asignada: </span>
                        <code className="font-mono font-bold bg-white px-2 py-0.5 rounded border border-emerald-300 text-emerald-900">
                          {req.nuevaClaveTemporal}
                        </code>
                        <span className="block text-[10px] text-emerald-700 mt-0.5">
                          Atendido por: {req.atendidoPor} ({req.fechaAtencion})
                        </span>
                      </div>
                    </div>
                  )}

                  {req.status === 'RECHAZADO' && (
                    <div className="p-2.5 bg-red-50 rounded-lg border border-red-200 text-xs text-red-900">
                      <span className="font-bold">Motivo de Rechazo:</span> {req.observaciones}
                      <span className="block text-[10px] text-red-700 mt-0.5">
                        Atendido por: {req.atendidoPor} ({req.fechaAtencion})
                      </span>
                    </div>
                  )}

                  {/* Botones de Acción para Administrador */}
                  {isPending && (
                    <div className="flex items-center justify-end gap-2 pt-1">
                      <button
                        onClick={() => setRejectingReq(req)}
                        className="px-3 py-1.5 text-xs font-bold text-red-700 bg-red-50 hover:bg-red-100 border border-red-300 rounded-lg transition-colors cursor-pointer"
                      >
                        Rechazar
                      </button>
                      <button
                        onClick={() => handleStartApproval(req)}
                        className="px-3.5 py-1.5 text-xs font-bold text-white bg-[#0b3d2e] hover:bg-[#1a5f47] border border-[#c9a227] rounded-lg transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
                      >
                        <KeyRound className="w-3.5 h-3.5 text-[#c9a227]" />
                        <span>Aprobar y Emitir Clave Temporal</span>
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Modal Secundario: Aprobación con Clave Temporal */}
        {selectedReqForApproval && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-3 bg-black/60 backdrop-blur-xs">
            <div className="bg-white rounded-xl shadow-2xl border-2 border-emerald-500 w-full max-w-md p-5 space-y-4">
              <div className="flex items-center justify-between border-b pb-2">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-emerald-700" />
                  <span>Aprobar Reinicio: Estado {selectedReqForApproval.estado}</span>
                </h3>
                <button
                  onClick={() => setSelectedReqForApproval(null)}
                  className="text-slate-400 hover:text-slate-700"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="text-xs text-slate-600 space-y-1">
                <p>
                  Inspector: <strong>{selectedReqForApproval.solicitanteNombre}</strong> ({selectedReqForApproval.solicitanteCedula})
                </p>
                <p>
                  Cuenta: <code className="font-mono text-slate-900 font-bold">{selectedReqForApproval.email}</code>
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Nueva Clave Temporal Generada para el Estado:
                </label>
                <input
                  type="text"
                  value={customTempPassword}
                  onChange={(e) => setCustomTempPassword(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-emerald-50 border-2 border-emerald-500 rounded-lg font-mono font-bold text-emerald-950 focus:outline-none"
                />
                <span className="text-[10px] text-slate-500 mt-1 block">
                  Esta clave reemplazará inmediatamente la contraseña activa del Estado {selectedReqForApproval.estado}.
                </span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t">
                <button
                  onClick={() => setSelectedReqForApproval(null)}
                  className="px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleConfirmApproval}
                  className="px-4 py-1.5 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-sm"
                >
                  Confirmar Aprobación
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Secundario: Rechazo */}
        {rejectingReq && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-3 bg-black/60 backdrop-blur-xs">
            <div className="bg-white rounded-xl shadow-2xl border-2 border-red-500 w-full max-w-md p-5 space-y-4">
              <div className="flex items-center justify-between border-b pb-2">
                <h3 className="text-sm font-bold text-red-900 flex items-center gap-2">
                  <XCircle className="w-4 h-4 text-red-700" />
                  <span>Rechazar Solicitud: Estado {rejectingReq.estado}</span>
                </h3>
                <button
                  onClick={() => setRejectingReq(null)}
                  className="text-slate-400 hover:text-slate-700"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Motivo Institucional de Rechazo:
                </label>
                <textarea
                  rows={3}
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t">
                <button
                  onClick={() => setRejectingReq(null)}
                  className="px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleConfirmRejection}
                  className="px-4 py-1.5 text-xs font-bold text-white bg-red-700 hover:bg-red-800 rounded-lg shadow-sm"
                >
                  Confirmar Rechazo
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="p-3 bg-slate-100 border-t border-slate-200 flex items-center justify-between">
          <span className="text-xs text-slate-500 font-medium">
            Toda aprobación o rechazo genera traza inalterable en el registro de auditoría ISO 27001.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-bold bg-[#0b3d2e] text-white rounded-lg hover:bg-[#1a5f47] transition-colors cursor-pointer"
          >
            Cerrar Bandeja
          </button>
        </div>

      </div>
    </div>
  );
};
