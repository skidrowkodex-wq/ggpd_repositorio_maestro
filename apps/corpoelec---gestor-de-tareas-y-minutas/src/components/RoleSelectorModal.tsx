import React from 'react';
import { Shield, UserCheck, CheckCircle2, Lock, X, Sparkles, User, FileText, Settings, LogOut } from 'lucide-react';
import { UserProfile, UserRole } from '../types';
import { USER_PROFILES } from '../data/initialData';

interface RoleSelectorModalProps {
  currentProfile: UserProfile;
  usersList?: UserProfile[];
  onSelectProfile: (profile: UserProfile) => void;
  onOpenUserManagement?: () => void;
  onLogout?: () => void;
  onClose: () => void;
}

export const RoleSelectorModal: React.FC<RoleSelectorModalProps> = ({
  currentProfile,
  usersList,
  onSelectProfile,
  onOpenUserManagement,
  onLogout,
  onClose,
}) => {
  const profilesToRender = usersList && usersList.length > 0 ? usersList : USER_PROFILES;

  return (
    <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-xl w-full border border-slate-200 shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b pb-3">
          <div className="flex items-center space-x-2 text-slate-900 font-bold text-base">
            <div className="p-2.5 bg-blue-50 text-[#002B49] rounded-xl border border-blue-100">
              <Shield className="w-5 h-5 text-[#002B49]" />
            </div>
            <div>
              <h3 className="font-extrabold text-[#002B49] text-base">Autenticación y Perfil Activo (ISO 27001)</h3>
              <p className="text-xs text-slate-500 font-normal">
                Selecciona tu usuario institucional registrado en SCTAP CORPOELEC
              </p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Roles List */}
        <div className="space-y-2.5 max-h-[50vh] overflow-y-auto pr-1">
          {profilesToRender.map((profile) => {
            const isSelected = profile.id === currentProfile.id;
            const isAdmin = profile.role === 'admin';
            const isSupervisor = profile.role === 'supervisor';

            return (
              <div
                key={profile.id}
                onClick={() => {
                  onSelectProfile(profile);
                  onClose();
                }}
                className={`p-3.5 rounded-xl border-2 transition-all cursor-pointer relative ${
                  isSelected 
                    ? 'border-[#E30613] bg-red-50/30 shadow-md' 
                    : 'border-slate-200 hover:border-slate-300 bg-slate-50/50 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <div className={`p-2 rounded-xl mt-0.5 ${
                      isAdmin ? 'bg-amber-100 text-amber-800' : isSupervisor ? 'bg-blue-100 text-[#002B49]' : 'bg-slate-200 text-slate-700'
                    }`}>
                      <User className="w-5 h-5" />
                    </div>

                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-mono bg-slate-900 text-white text-[11px] font-extrabold px-1.5 py-0.2 rounded">
                          @{profile.username}
                        </span>
                        <span className="font-extrabold text-slate-900 text-sm">
                          {profile.name}
                        </span>
                        <span className={`text-[9px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-full ${
                          isAdmin 
                            ? 'bg-amber-100 text-amber-800 border border-amber-300' 
                            : isSupervisor 
                            ? 'bg-blue-100 text-[#002B49] border border-blue-200' 
                            : 'bg-slate-200 text-slate-700'
                        }`}>
                          {profile.role}
                        </span>
                      </div>

                      <p className="text-xs text-slate-600 font-medium mt-0.5">
                        {profile.cargo}
                      </p>

                      {/* Capabilities badges */}
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        <span className={`inline-flex items-center space-x-1 text-[10px] font-bold px-2 py-0.5 rounded-md ${
                          profile.canUploadDocuments 
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                            : 'bg-slate-200/80 text-slate-500'
                        }`}>
                          <FileText className="w-3 h-3" />
                          <span>{profile.canUploadDocuments ? 'Carga Autorizada PDF' : 'Solo Consulta'}</span>
                        </span>

                        <span className={`inline-flex items-center space-x-1 text-[10px] font-bold px-2 py-0.5 rounded-md ${
                          profile.canManageUsers 
                            ? 'bg-purple-100 text-purple-800 border border-purple-200' 
                            : 'bg-slate-200/80 text-slate-500'
                        }`}>
                          <Settings className="w-3 h-3" />
                          <span>{profile.canManageUsers ? 'Administración General ISO' : 'Operativo'}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {isSelected && (
                    <div className="text-[#E30613]">
                      <CheckCircle2 className="w-5 h-5 fill-red-100 text-[#E30613]" />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>


        {/* Informative Note for Document Upload Profile */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-3.5 text-xs text-blue-900 space-y-1.5">
          <div className="flex items-center space-x-1.5 font-bold">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Reglas de Perfil para Carga de Documentos</span>
          </div>
          <p className="text-blue-800/90 leading-relaxed">
            Los perfiles de <strong>Administrador</strong> y <strong>Supervisor</strong> cuentan con permisos autorizados para procesar nuevas minutas en PDF con IA Gemini e incorporar tareas al sistema. Los <strong>Analistas</strong> tienen perfil de seguimiento y consulta.
          </p>
        </div>

        <div className="border-t pt-3 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="text-[11px] text-slate-500 font-medium flex items-center space-x-1">
            <User className="w-3.5 h-3.5 text-slate-400" />
            <span>Haz clic en un usuario de la lista para cambiar de perfil</span>
          </div>

          <div className="flex items-center space-x-2 flex-wrap gap-y-1">
            {onLogout && (
              <button
                onClick={() => {
                  onClose();
                  onLogout();
                }}
                className="px-3 py-2 bg-red-50 hover:bg-red-100 text-[#E30613] border border-red-200 font-bold text-xs rounded-xl transition-colors cursor-pointer flex items-center space-x-1"
                title="Cerrar sesión completamente e ir a la pantalla de Login"
              >
                <LogOut className="w-3.5 h-3.5 text-[#E30613]" />
                <span>Cerrar Sesión</span>
              </button>
            )}

            {(currentProfile.canManageUsers || currentProfile.role === 'admin') && onOpenUserManagement && (
              <button
                onClick={() => {
                  onClose();
                  onOpenUserManagement();
                }}
                className="px-3 py-2 bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200 font-bold text-xs rounded-xl transition-colors cursor-pointer flex items-center space-x-1"
              >
                <Settings className="w-3.5 h-3.5 text-purple-700" />
                <span>Gestión / Crear Usuarios</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="px-5 py-2 bg-[#002B49] hover:bg-slate-900 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer flex items-center space-x-1.5"
            >
              <span>Confirmar y Cerrar</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
