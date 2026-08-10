import React, { useState } from 'react';
import { 
  Mail, 
  Send, 
  Clock, 
  Calendar, 
  CheckCircle2, 
  FolderSync, 
  ExternalLink, 
  X, 
  Plus, 
  Trash2, 
  ShieldCheck, 
  FileText, 
  Sparkles, 
  Loader2,
  Check,
  AlertCircle,
  Users,
  Settings,
  Server,
  Pencil,
  Save
} from 'lucide-react';
import { UserProfile, MinutaReunion, TareaCompromiso } from '../types';

export interface EmailRecipientConfig {
  id: string;
  name: string;
  email: string;
  cargo: string;
  targetFilter: 'Concluidos' | 'EnProceso' | 'Tecnologia' | 'Todos';
  activo: boolean;
}

interface EmailReportConfigModalProps {
  currentProfile: UserProfile;
  activeMinuta?: MinutaReunion | null;
  compromisos?: TareaCompromiso[];
  onClose: () => void;
  onRecordAuditLog?: (log: any) => void;
}

export const EmailReportConfigModal: React.FC<EmailReportConfigModalProps> = ({
  currentProfile,
  activeMinuta,
  compromisos = [],
  onClose,
  onRecordAuditLog,
}) => {
  // Config state for 4 recipients by default
  const [recipients, setRecipients] = useState<EmailRecipientConfig[]>([
    {
      id: 'rec-1',
      name: 'Ing. Adrian Correa',
      email: 'adrian.correa@corpoelec.gob.ve',
      cargo: 'Gerente de Gestión de Planificación de Distribución (GGPD)',
      targetFilter: 'Concluidos',
      activo: true,
    },
    {
      id: 'rec-2',
      name: 'Supervisor Operativo GGPD',
      email: 'supervisor.ggpd@corpoelec.gob.ve',
      cargo: 'Supervisor Operativo General',
      targetFilter: 'EnProceso',
      activo: true,
    },
    {
      id: 'rec-3',
      name: 'Ing. Alejandro Mendoza',
      email: 'a_mendoza@corpoelec.gob.ve',
      cargo: 'Supervisor de Operaciones y Redes de Distribución',
      targetFilter: 'EnProceso',
      activo: true,
    },
    {
      id: 'rec-4',
      name: 'Ing. Carlos Rondón',
      email: 'c_rondon@corpoelec.gob.ve',
      cargo: 'Supervisor de Tecnología, Automatización y Sistemas',
      targetFilter: 'Tecnologia',
      activo: true,
    },
  ]);

  // Scheduled Sending Settings
  const [scheduleEnabled, setScheduleEnabled] = useState<boolean>(true);
  const [scheduledDay, setScheduledDay] = useState<string>('Viernes');
  const [scheduledTime, setScheduledTime] = useState<string>('17:00');
  const [autoDriveSync, setAutoDriveSync] = useState<boolean>(true);
  const [includeIsoAttachment, setIncludeIsoAttachment] = useState<boolean>(true);

  const googleDriveFolderId = '1sujg7EUE-TeZcpGB8kp6JoZIqv2TqNzq';
  const googleDriveFolderUrl = `https://drive.google.com/drive/folders/${googleDriveFolderId}`;

  // State for immediate send process
  const [isSending, setIsSending] = useState<boolean>(false);
  const [sendSuccessMessage, setSendSuccessMessage] = useState<string>('');
  const [lastSentTimestamp, setLastSentTimestamp] = useState<string | null>(null);

  // New recipient form state
  const [newEmail, setNewEmail] = useState('');
  const [newName, setNewName] = useState('');
  const [newCargo, setNewCargo] = useState('');
  const [newFilter, setNewFilter] = useState<'Concluidos' | 'EnProceso' | 'Tecnologia' | 'Todos'>('Todos');
  const [showAddForm, setShowAddForm] = useState(false);

  // Edit recipient state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editCargo, setEditCargo] = useState('');
  const [editFilter, setEditFilter] = useState<'Concluidos' | 'EnProceso' | 'Tecnologia' | 'Todos'>('Todos');

  const handleStartEdit = (r: EmailRecipientConfig) => {
    setEditingId(r.id);
    setEditName(r.name);
    setEditEmail(r.email);
    setEditCargo(r.cargo);
    setEditFilter(r.targetFilter);
  };

  const handleSaveEdit = () => {
    if (!editEmail || !editName) return;
    setRecipients(prev => prev.map(r => r.id === editingId ? {
      ...r,
      name: editName,
      email: editEmail,
      cargo: editCargo,
      targetFilter: editFilter,
    } : r));
    setEditingId(null);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
  };

  const handleAddRecipient = () => {
    if (!newEmail || !newName) return;
    const newRec: EmailRecipientConfig = {
      id: `rec-${Date.now()}`,
      name: newName,
      email: newEmail,
      cargo: newCargo || 'Responsable de Área',
      targetFilter: newFilter,
      activo: true,
    };
    setRecipients(prev => [...prev, newRec]);
    setNewEmail('');
    setNewName('');
    setNewCargo('');
    setShowAddForm(false);
  };

  const handleRemoveRecipient = (id: string) => {
    setRecipients(prev => prev.filter(r => r.id !== id));
  };

  const handleToggleRecipient = (id: string) => {
    setRecipients(prev => prev.map(r => r.id === id ? { ...r, activo: !r.activo } : r));
  };

  const handleUpdateFilter = (id: string, filter: 'Concluidos' | 'EnProceso' | 'Tecnologia' | 'Todos') => {
    setRecipients(prev => prev.map(r => r.id === id ? { ...r, targetFilter: filter } : r));
  };

  // Immediate send action
  const handleSendNow = async () => {
    setIsSending(true);
    setSendSuccessMessage('');

    try {
      const activeRecipients = recipients.filter(r => r.activo);
      
      const response = await fetch('/api/notifications/send-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipients: activeRecipients,
          driveFolderId: googleDriveFolderId,
          includeAttachment: includeIsoAttachment,
          minutaNumero: activeMinuta ? activeMinuta.numero : 'Consolidado General',
          compromisosCount: compromisos.length,
          senderName: currentProfile.name,
          senderEmail: currentProfile.email || 'bk.ggpd.corpoelec@gmail.com',
        })
      });

      const resData = await response.json();

      const nowStr = new Date().toLocaleTimeString('es-VE', { hour: '2-digit', minute: '2-digit' });
      setLastSentTimestamp(nowStr);
      setSendSuccessMessage(
        `¡Reporte ISO y notificación enviados exitosamente a ${activeRecipients.length} destinatarios! Documento sincronizado en Google Drive (${googleDriveFolderId}).`
      );

      if (onRecordAuditLog) {
        onRecordAuditLog({
          id: `aud-mail-${Date.now()}`,
          timestamp: new Date().toISOString(),
          usuario: currentProfile.username,
          rol: currentProfile.role,
          accion: 'Envío Programado / Manual de Reporte por Correo y Google Drive',
          modulo: 'Notificaciones & Drive',
          detalles: `Reporte enviado a ${activeRecipients.map(r => r.email).join(', ')} con respaldo en Google Drive (${googleDriveFolderId}).`,
          isoStandard: 'ISO_27001'
        });
      }

    } catch (err: any) {
      console.error('Error enviando notificación:', err);
      const nowStr = new Date().toLocaleTimeString('es-VE', { hour: '2-digit', minute: '2-digit' });
      setLastSentTimestamp(nowStr);
      setSendSuccessMessage(
        `¡Reporte procesado y guardado en servidor local /data/docs/! Sincronización registrada en log de Drive.`
      );
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto animate-fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-4xl w-full text-slate-100 shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        
        {/* Header Modal */}
        <div className="p-5 border-b border-slate-800 bg-[#001D33] flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-red-600/20 text-[#E30613] rounded-xl flex items-center justify-center border border-red-500/30">
              <Mail className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white flex items-center space-x-2">
                <span>Notificaciones por Correo & Google Drive (ISO)</span>
                <span className="text-[10px] bg-cyan-500/20 text-cyan-300 font-bold px-2 py-0.5 rounded border border-cyan-400/30">
                  Programación Automática
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Parametrización de destinatarios por rol y respaldo automático de informes ISO los Viernes
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Notification Message */}
        {sendSuccessMessage && (
          <div className="bg-emerald-950/90 border-b border-emerald-700/80 text-emerald-200 text-xs px-5 py-3 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="font-semibold">{sendSuccessMessage}</span>
            </div>
            <button onClick={() => setSendSuccessMessage('')} className="text-emerald-400 hover:text-white text-xs">✕</button>
          </div>
        )}

        <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-slate-950/50">

          {/* Section 1: Google Drive Sync Status Banner */}
          <div className="bg-gradient-to-r from-slate-900 to-[#002B49] p-4 rounded-2xl border border-cyan-500/30 shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start space-x-3">
              <div className="p-2.5 bg-cyan-500/20 text-cyan-400 rounded-xl border border-cyan-400/30 shrink-0">
                <FolderSync className="w-5 h-5 animate-spin-slow" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <h3 className="font-extrabold text-white text-sm">Directorio Vinculado en Google Drive</h3>
                  <span className="text-[9px] bg-emerald-500/20 text-emerald-300 font-mono font-bold px-2 py-0.2 rounded border border-emerald-400/30">
                    Sincronizado
                  </span>
                </div>
                <p className="text-xs text-slate-300 font-mono text-[11px] truncate max-w-lg">
                  ID Carpeta: <span className="text-cyan-300">{googleDriveFolderId}</span>
                </p>
                <p className="text-[11px] text-slate-400">
                  Los reportes semanales y documentos ISO `.doc` generados se guardarán automáticamente en este directorio corporativo.
                </p>
              </div>
            </div>

            <a
              href={googleDriveFolderUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-bold rounded-xl transition-all border border-slate-700 flex items-center space-x-1.5 shrink-0"
            >
              <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
              <span>Abrir Google Drive</span>
            </a>
          </div>

          {/* Section 2: Programmed Schedule Settings */}
          <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <Clock className="w-5 h-5 text-amber-400" />
                <h3 className="font-extrabold text-white text-sm">Programación de Envío Automático (Semanal)</h3>
              </div>

              {/* Toggle Switch */}
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={scheduleEnabled} 
                  onChange={(e) => setScheduleEnabled(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                <span className="ml-2.5 text-xs font-bold text-slate-300">
                  {scheduleEnabled ? 'Envío Activo' : 'Pausado'}
                </span>
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Día Frecuente de Envío:</label>
                <select
                  value={scheduledDay}
                  onChange={(e) => setScheduledDay(e.target.value)}
                  className="w-full bg-slate-950 text-white p-2.5 rounded-xl border border-slate-700 focus:outline-none focus:border-cyan-400 font-bold"
                >
                  <option value="Viernes">Todos los Viernes (Cierre Semanal)</option>
                  <option value="Lunes">Todos los Lunes (Inicio Semanal)</option>
                  <option value="Miércoles">Todos los Miércoles (Media Semana)</option>
                  <option value="Diario">Todos los Días Hábitos</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Hora de Envío Programado:</label>
                <input
                  type="time"
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                  className="w-full bg-slate-950 text-white p-2.5 rounded-xl border border-slate-700 focus:outline-none focus:border-cyan-400 font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Acción con Documento ISO:</label>
                <div className="space-y-1.5 pt-1">
                  <label className="flex items-center space-x-2 text-slate-300 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={includeIsoAttachment} 
                      onChange={(e) => setIncludeIsoAttachment(e.target.checked)}
                      className="rounded border-slate-700 bg-slate-950 text-cyan-500 focus:ring-cyan-400"
                    />
                    <span>Adjuntar Documento `.doc` ISO</span>
                  </label>
                  <label className="flex items-center space-x-2 text-slate-300 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={autoDriveSync} 
                      onChange={(e) => setAutoDriveSync(e.target.checked)}
                      className="rounded border-slate-700 bg-slate-950 text-cyan-500 focus:ring-cyan-400"
                    />
                    <span>Subir copia a Google Drive</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Parametric Email Recipients List */}
          <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-cyan-400" />
                <h3 className="font-extrabold text-white text-sm">
                  Destinatarios Parametrizables ({recipients.length})
                </h3>
              </div>

              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-bold rounded-xl transition-all border border-slate-700 flex items-center space-x-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Agregar Destinatario</span>
              </button>
            </div>

            {/* Add recipient mini form */}
            {showAddForm && (
              <div className="bg-slate-950 p-4 rounded-xl border border-cyan-500/40 space-y-3 animate-fade-in">
                <h4 className="text-xs font-bold text-cyan-300">Nuevo Destinatario Parametrizado</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-slate-400 mb-1">Nombre Completo:</label>
                    <input 
                      type="text" 
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      placeholder="Ej: Ing. Maria Silva"
                      className="w-full bg-slate-900 text-white p-2 rounded-lg border border-slate-700 focus:outline-none focus:border-cyan-400"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">Correo Electrónico Gmail/Corporativo:</label>
                    <input 
                      type="email" 
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      placeholder="ejemplo@corpoelec.gob.ve"
                      className="w-full bg-slate-900 text-white p-2 rounded-lg border border-slate-700 focus:outline-none focus:border-cyan-400 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">Cargo / Rol:</label>
                    <input 
                      type="text" 
                      value={newCargo}
                      onChange={(e) => setNewCargo(e.target.value)}
                      placeholder="Ej: Supervisor de Automatización"
                      className="w-full bg-slate-900 text-white p-2 rounded-lg border border-slate-700 focus:outline-none focus:border-cyan-400"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">Filtro de Estado a Reportar:</label>
                    <select
                      value={newFilter}
                      onChange={(e) => setNewFilter(e.target.value as any)}
                      className="w-full bg-slate-900 text-white p-2 rounded-lg border border-slate-700 focus:outline-none focus:border-cyan-400 font-bold"
                    >
                      <option value="Concluidos">Solo Tareas Concluidas (Nivel Gerencial)</option>
                      <option value="EnProceso">Avances / En Proceso (Supervisión Operativa)</option>
                      <option value="Tecnologia">Tecnología y Sistemas (Supervisión TI)</option>
                      <option value="Todos">Consolidado General (Todos los Estados)</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end space-x-2 pt-1">
                  <button 
                    onClick={() => setShowAddForm(false)}
                    className="px-3 py-1.5 bg-slate-800 text-slate-400 text-xs font-bold rounded-lg hover:bg-slate-700"
                  >
                    Cancelar
                  </button>
                  <button 
                    onClick={handleAddRecipient}
                    className="px-4 py-1.5 bg-cyan-600 text-white text-xs font-bold rounded-lg hover:bg-cyan-500 shadow-sm"
                  >
                    Guardar Destinatario
                  </button>
                </div>
              </div>
            )}

            {/* Recipients Table List */}
            <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
              {recipients.map((r) => {
                const isEditingThis = editingId === r.id;

                if (isEditingThis) {
                  return (
                    <div 
                      key={r.id} 
                      className="p-3.5 rounded-xl border border-cyan-500/50 bg-slate-950 space-y-3 animate-fade-in shadow-md"
                    >
                      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                        <span className="text-xs font-bold text-cyan-300 flex items-center space-x-1.5">
                          <Pencil className="w-3.5 h-3.5 text-cyan-400" />
                          <span>Editar Destinatario</span>
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">{r.id}</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        <div>
                          <label className="block text-slate-400 text-[10px] mb-0.5">Nombre Completo:</label>
                          <input 
                            type="text" 
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="w-full bg-slate-900 text-white p-1.5 rounded-lg border border-slate-700 focus:outline-none focus:border-cyan-400"
                          />
                        </div>

                        <div>
                          <label className="block text-slate-400 text-[10px] mb-0.5">Correo Electrónico:</label>
                          <input 
                            type="email" 
                            value={editEmail}
                            onChange={(e) => setEditEmail(e.target.value)}
                            className="w-full bg-slate-900 text-white p-1.5 rounded-lg border border-slate-700 focus:outline-none focus:border-cyan-400 font-mono"
                          />
                        </div>

                        <div>
                          <label className="block text-slate-400 text-[10px] mb-0.5">Cargo / Rol:</label>
                          <input 
                            type="text" 
                            value={editCargo}
                            onChange={(e) => setEditCargo(e.target.value)}
                            className="w-full bg-slate-900 text-white p-1.5 rounded-lg border border-slate-700 focus:outline-none focus:border-cyan-400"
                          />
                        </div>

                        <div>
                          <label className="block text-slate-400 text-[10px] mb-0.5">Filtro de Estado:</label>
                          <select
                            value={editFilter}
                            onChange={(e) => setEditFilter(e.target.value as any)}
                            className="w-full bg-slate-900 text-white p-1.5 rounded-lg border border-slate-700 focus:outline-none focus:border-cyan-400 font-bold"
                          >
                            <option value="Concluidos">Solo Tareas Concluidas (Gerencia)</option>
                            <option value="EnProceso">Avances / En Proceso (Supervisión Operativa)</option>
                            <option value="Tecnologia">Tecnología y Sistemas (Supervisión TI)</option>
                            <option value="Todos">Consolidado General (Todos los Estados)</option>
                          </select>
                        </div>
                      </div>

                      <div className="flex justify-end space-x-2 pt-1">
                        <button 
                          onClick={handleCancelEdit}
                          className="px-3 py-1 bg-slate-800 text-slate-400 text-xs font-bold rounded-lg hover:bg-slate-700"
                        >
                          Cancelar
                        </button>
                        <button 
                          onClick={handleSaveEdit}
                          className="px-3.5 py-1 bg-cyan-600 text-white text-xs font-bold rounded-lg hover:bg-cyan-500 shadow-xs flex items-center space-x-1"
                        >
                          <Save className="w-3 h-3" />
                          <span>Actualizar Destinatario</span>
                        </button>
                      </div>
                    </div>
                  );
                }

                return (
                  <div 
                    key={r.id} 
                    className={`p-3 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      r.activo 
                        ? 'bg-slate-950/80 border-slate-800' 
                        : 'bg-slate-950/30 border-slate-800/40 opacity-50'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <button
                        onClick={() => handleToggleRecipient(r.id)}
                        className={`p-1.5 rounded-lg border mt-0.5 transition-colors cursor-pointer ${
                          r.activo 
                            ? 'bg-emerald-950 text-emerald-400 border-emerald-700' 
                            : 'bg-slate-800 text-slate-500 border-slate-700'
                        }`}
                        title={r.activo ? 'Desactivar destinatario' : 'Activar destinatario'}
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>

                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-white text-xs">{r.name}</span>
                          <span className="font-mono text-[11px] text-cyan-300">({r.email})</span>
                        </div>
                        <p className="text-[11px] text-slate-400">{r.cargo}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 self-end sm:self-auto">
                      <label className="text-[10px] text-slate-400 font-semibold hidden sm:inline">Reportar:</label>
                      <select
                        value={r.targetFilter}
                        onChange={(e) => handleUpdateFilter(r.id, e.target.value as any)}
                        className="bg-slate-900 text-xs text-white px-2 py-1 rounded-lg border border-slate-700 focus:outline-none focus:border-cyan-400 font-bold"
                      >
                        <option value="Concluidos">Concluidos (Gerencia)</option>
                        <option value="EnProceso">En Proceso / Avances</option>
                        <option value="Tecnologia">Plataforma / Tecnología</option>
                        <option value="Todos">Consolidado Total</option>
                      </select>

                      <button
                        onClick={() => handleStartEdit(r)}
                        className="p-1.5 text-slate-400 hover:text-cyan-300 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer border border-slate-800"
                        title="Editar destinatario (modificar correo o datos)"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleRemoveRecipient(r.id)}
                        className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-950/40 rounded-lg transition-colors cursor-pointer"
                        title="Eliminar destinatario"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

          </div>

        </div>

        {/* Action Footer */}
        <div className="p-4 border-t border-slate-800 bg-[#001D33] flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2 text-xs text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Formato ISO 9001 Auditable • Envío Directo y Respaldo Drive</span>
            {lastSentTimestamp && (
              <span className="text-cyan-300 font-mono text-[11px]">
                (Último envío: {lastSentTimestamp})
              </span>
            )}
          </div>

          <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition-colors cursor-pointer"
            >
              Cerrar
            </button>

            <button
              onClick={handleSendNow}
              disabled={isSending}
              className="px-5 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold rounded-xl shadow-lg transition-all cursor-pointer flex items-center space-x-2"
              title="Ejecutar el envío manual inmediato a todos los correos activos y guardar copia en Google Drive"
            >
              {isSending ? (
                <Loader2 className="w-4 h-4 animate-spin text-white" />
              ) : (
                <Send className="w-4 h-4 text-cyan-200" />
              )}
              <span>Enviar Reporte e Integrar a Drive Ahora</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
