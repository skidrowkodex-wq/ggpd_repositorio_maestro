import React from 'react';
import { 
  FileText, 
  Calendar, 
  User, 
  MapPin, 
  Users, 
  CheckCircle2, 
  Clock, 
  Upload, 
  Plus, 
  X,
  ChevronRight,
  Layers,
  Sparkles
} from 'lucide-react';
import { MinutaReunion, TareaCompromiso } from '../types';

interface MinutaHistoryModalProps {
  minutas: MinutaReunion[];
  selectedMinutaId: string; // 'all' or specific minuta id
  onSelectMinuta: (minutaId: string) => void;
  onOpenUploader: () => void;
  onClose: () => void;
  compromisos: TareaCompromiso[];
}

export const MinutaHistoryModal: React.FC<MinutaHistoryModalProps> = ({
  minutas,
  selectedMinutaId,
  onSelectMinuta,
  onOpenUploader,
  onClose,
  compromisos,
}) => {
  return (
    <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full border border-slate-200 shadow-2xl p-6 space-y-5 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-[#002B49] text-white rounded-xl shadow-sm">
              <Layers className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Histórico de Minutas de Reunión</h3>
              <p className="text-xs text-slate-500">
                Selecciona una minuta específica para auditar o la vista consolidada multiminuta
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                onClose();
                onOpenUploader();
              }}
              className="bg-[#E30613] hover:bg-red-700 text-white px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center space-x-1.5 cursor-pointer shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Cargar Nueva Minuta</span>
            </button>

            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Global Summary Option */}
        <div 
          onClick={() => {
            onSelectMinuta('all');
            onClose();
          }}
          className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
            selectedMinutaId === 'all'
              ? 'bg-[#002B49] text-white border-[#002B49] shadow-md'
              : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-200'
          }`}
        >
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg font-bold text-xs ${
              selectedMinutaId === 'all' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/30' : 'bg-slate-200 text-slate-700'
            }`}>
              VISTA GLOBAL
            </div>
            <div>
              <h4 className="font-bold text-sm">Todas las Minutas Registradas (Consolidado)</h4>
              <p className={`text-xs ${selectedMinutaId === 'all' ? 'text-slate-300' : 'text-slate-500'}`}>
                Muestra el total de {compromisos.length} compromisos acumulados de {minutas.length} minutas cargadas.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <span className={`text-xs font-extrabold px-2.5 py-1 rounded-full border ${
              selectedMinutaId === 'all'
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400/40'
                : 'bg-slate-200 text-slate-700 border-slate-300'
            }`}>
              {compromisos.length} tareas
            </span>
            <ChevronRight className={`w-5 h-5 ${selectedMinutaId === 'all' ? 'text-cyan-400' : 'text-slate-400'}`} />
          </div>
        </div>

        {/* List of Individual Minutas */}
        <div className="space-y-3">
          <h4 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">
            Minutas Individuales ({minutas.length})
          </h4>

          <div className="space-y-2.5">
            {minutas.map((m) => {
              const isSelected = selectedMinutaId === m.id;
              const minutaCompromisos = compromisos.filter(c => c.minutaNumero === m.numero);
              const completedCount = minutaCompromisos.filter(c => c.estado === 'Completado').length;
              const pctProgress = minutaCompromisos.length > 0 
                ? Math.round((completedCount / minutaCompromisos.length) * 100) 
                : 0;

              return (
                <div
                  key={m.id}
                  onClick={() => {
                    onSelectMinuta(m.id);
                    onClose();
                  }}
                  className={`p-4 rounded-xl border transition-all cursor-pointer space-y-3 ${
                    isSelected
                      ? 'bg-red-50/80 border-[#E30613] shadow-sm ring-1 ring-[#E30613]'
                      : 'bg-white hover:bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center space-x-2.5">
                      <span className="bg-[#002B49] text-white font-bold text-xs px-2.5 py-1 rounded-md">
                        Minuta #{m.numero}
                      </span>
                      <span className="text-xs text-slate-500 font-medium flex items-center space-x-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>Fecha: {m.fecha}</span>
                      </span>
                    </div>

                    <div className="flex items-center space-x-2 text-xs">
                      {m.pdfBase64 || m.driveFileId ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (m.pdfBase64) {
                              const byteCharacters = atob(m.pdfBase64);
                              const byteNumbers = new Array(byteCharacters.length);
                              for (let i = 0; i < byteCharacters.length; i++) {
                                byteNumbers[i] = byteCharacters.charCodeAt(i);
                              }
                              const byteArray = new Uint8Array(byteNumbers);
                              const blob = new Blob([byteArray], { type: 'application/pdf' });
                              const url = URL.createObjectURL(blob);
                              const a = document.createElement('a');
                              a.href = url;
                              a.download = m.nombreArchivo || `MINUTA_${m.numero}.pdf`;
                              a.click();
                            } else {
                              window.open(`https://drive.google.com/drive/folders/1QJhCCc5PwCARr41WePCfEHa_CrZslTZ6`, '_blank');
                            }
                          }}
                          className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-2.5 py-1 rounded-md flex items-center space-x-1 cursor-pointer transition-colors"
                          title="Descargar archivo PDF guardado en la Base de Datos"
                        >
                          <Upload className="w-3 h-3 rotate-180" />
                          <span>Descargar PDF BD</span>
                        </button>
                      ) : null}

                      <span className="bg-slate-100 text-slate-700 font-semibold px-2 py-0.5 rounded border border-slate-200">
                        {minutaCompromisos.length} compromisos
                      </span>
                      <span className="bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded border border-emerald-200">
                        {pctProgress}% completado
                      </span>
                    </div>
                  </div>

                  {/* Objective & Details */}
                  <p className="text-xs text-slate-700 font-medium leading-relaxed line-clamp-2">
                    {m.objetivo}
                  </p>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                    <div className="flex items-center space-x-3">
                      <span className="flex items-center space-x-1">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <span>Coordinador: <strong>{m.coordinador}</strong></span>
                      </span>
                      <span className="hidden md:inline flex items-center space-x-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>{m.lugar}</span>
                      </span>
                    </div>

                    <span className="text-[#E30613] font-bold flex items-center space-x-0.5 hover:underline">
                      <span>Seleccionar minuta</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
};
