import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { TaskDashboard } from './components/TaskDashboard';
import { CompromisosList } from './components/CompromisosList';
import { KanbanBoard } from './components/KanbanBoard';
import { PendientesArea } from './components/PendientesArea';
import { PRTSENPOATracker } from './components/PRTSENPOATracker';
import { StrategicKpiDashboard } from './components/StrategicKpiDashboard';
import { MinutaUploader } from './components/MinutaUploader';
import { MinutaHistoryModal } from './components/MinutaHistoryModal';
import { SupabaseModal } from './components/SupabaseModal';
import { RoleSelectorModal } from './components/RoleSelectorModal';
import { GoogleDriveSyncModal } from './components/GoogleDriveSyncModal';
import { UserManagementModal } from './components/UserManagementModal';
import { IsoDocsExporterModal } from './components/IsoDocsExporterModal';
import { EmailReportConfigModal } from './components/EmailReportConfigModal';
import { Login } from './components/Login';

import { MinutaReunion, TareaCompromiso, PendienteArea, SupabaseConfig, FilterState, TaskStatus, UserProfile, IsoAuditLogEntry, IsoDataQualityMetric } from './types';
import { INITIAL_MINUTAS, INITIAL_COMPROMISOS, INITIAL_PENDIENTES_AREA, USER_PROFILES, INITIAL_AUDIT_LOGS, INITIAL_DATA_QUALITY_METRICS } from './data/initialData';
import { getStoredSupabaseConfig, getSupabaseClient } from './lib/supabase';
import { getVisibleCompromisos } from './utils/authUtils';
import { ShieldAlert, FileText, ArrowRight } from 'lucide-react';

export default function App() {
  const [minutasList, setMinutasList] = useState<MinutaReunion[]>(() => {
    try {
      const saved = localStorage.getItem('ggpd_minutas_v1');
      return saved ? JSON.parse(saved) : INITIAL_MINUTAS;
    } catch {
      return INITIAL_MINUTAS;
    }
  });
  const [selectedMinutaId, setSelectedMinutaId] = useState<string>('all'); // 'all' or specific minuta id
  
  const [compromisos, setCompromisos] = useState<TareaCompromiso[]>(() => {
    try {
      const saved = localStorage.getItem('ggpd_compromisos_v1');
      return saved ? JSON.parse(saved) : INITIAL_COMPROMISOS;
    } catch {
      return INITIAL_COMPROMISOS;
    }
  });

  const [pendientes, setPendientes] = useState<PendienteArea[]>(() => {
    try {
      const saved = localStorage.getItem('ggpd_pendientes_v1');
      return saved ? JSON.parse(saved) : INITIAL_PENDIENTES_AREA;
    } catch {
      return INITIAL_PENDIENTES_AREA;
    }
  });

  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);
  const [showIsoDocsModal, setShowIsoDocsModal] = useState<boolean>(false);
  const [supabaseConfig, setSupabaseConfig] = useState<SupabaseConfig>(getStoredSupabaseConfig());

  // User Profile, Directory & Access Control (ISO 27001 / ISO 8000)
  const [usersList, setUsersList] = useState<UserProfile[]>(() => {
    try {
      const saved = localStorage.getItem('ggpd_users_v1');
      return saved ? JSON.parse(saved) : USER_PROFILES;
    } catch {
      return USER_PROFILES;
    }
  });

  const [currentProfile, setCurrentProfile] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem('ggpd_current_profile_v1');
      if (saved) return JSON.parse(saved);
      return USER_PROFILES[0];
    } catch {
      return USER_PROFILES[0];
    }
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      return localStorage.getItem('ggpd_auth_v1') === 'true';
    } catch {
      return false;
    }
  });

  const [auditLogs, setAuditLogs] = useState<IsoAuditLogEntry[]>(() => {
    try {
      const saved = localStorage.getItem('ggpd_audit_logs_v1');
      return saved ? JSON.parse(saved) : INITIAL_AUDIT_LOGS;
    } catch {
      return INITIAL_AUDIT_LOGS;
    }
  });

  const [qualityMetrics, setQualityMetrics] = useState<IsoDataQualityMetric[]>(INITIAL_DATA_QUALITY_METRICS);

  // Auto-save effects for persistence
  useEffect(() => {
    try {
      localStorage.setItem('ggpd_minutas_v1', JSON.stringify(minutasList));
    } catch (e) { console.error('Error auto-saving minutas:', e); }
  }, [minutasList]);

  useEffect(() => {
    try {
      localStorage.setItem('ggpd_compromisos_v1', JSON.stringify(compromisos));
    } catch (e) { console.error('Error auto-saving compromisos:', e); }
  }, [compromisos]);

  useEffect(() => {
    try {
      localStorage.setItem('ggpd_pendientes_v1', JSON.stringify(pendientes));
    } catch (e) { console.error('Error auto-saving pendientes:', e); }
  }, [pendientes]);

  useEffect(() => {
    try {
      localStorage.setItem('ggpd_users_v1', JSON.stringify(usersList));
    } catch (e) { console.error('Error auto-saving users:', e); }
  }, [usersList]);

  useEffect(() => {
    try {
      localStorage.setItem('ggpd_current_profile_v1', JSON.stringify(currentProfile));
    } catch (e) { console.error('Error auto-saving current profile:', e); }
  }, [currentProfile]);

  useEffect(() => {
    try {
      localStorage.setItem('ggpd_audit_logs_v1', JSON.stringify(auditLogs));
    } catch (e) { console.error('Error auto-saving audit logs:', e); }
  }, [auditLogs]);

  const [showRoleModal, setShowRoleModal] = useState<boolean>(false);
  const [showUploadDeniedModal, setShowUploadDeniedModal] = useState<boolean>(false);
  const [showUserManagementModal, setShowUserManagementModal] = useState<boolean>(false);

  const [showUploader, setShowUploader] = useState<boolean>(false);
  const [showHistoryModal, setShowHistoryModal] = useState<boolean>(false);
  const [showSupabaseModal, setShowSupabaseModal] = useState<boolean>(false);
  const [showDriveSyncModal, setShowDriveSyncModal] = useState<boolean>(false);
  const [showEmailReportModal, setShowEmailReportModal] = useState<boolean>(false);

  // Check upload permissions before opening uploader
  const handleOpenUploaderClick = () => {
    if (!currentProfile.canUploadDocuments) {
      setShowUploadDeniedModal(true);
    } else {
      setShowUploader(true);
    }
  };


  const [filterState, setFilterState] = useState<FilterState>({
    searchQuery: '',
    responsable: '',
    estado: '',
    vinculacion: '',
    prioridad: '',
  });

  // Calculate active minuta (null means 'all')
  const activeMinuta = selectedMinutaId === 'all' 
    ? null 
    : minutasList.find(m => m.id === selectedMinutaId) || null;

  // Filter compromisos for active minuta if one is selected
  const activeCompromisos = activeMinuta 
    ? compromisos.filter(c => c.minutaNumero === activeMinuta.numero)
    : compromisos;

  const isElevatedUser = currentProfile?.role === 'admin' || currentProfile?.role === 'supervisor';

  // Filter compromisos according to role (admins/supervisors see all, analistas see only their own)
  const visibleCompromisos = getVisibleCompromisos(activeCompromisos, currentProfile);

  // Try fetching data from Supabase if connected
  useEffect(() => {
    async function loadFromSupabase() {
      const client = getSupabaseClient();
      if (!client || !supabaseConfig.isConnected) return;

      try {
        const { data: minutasData } = await client.from('minutas').select('*');
        if (minutasData && minutasData.length > 0) {
          const loadedMinutas: MinutaReunion[] = minutasData.map(m => ({
            id: m.id,
            numero: m.numero,
            fecha: m.fecha,
            fechaISO: m.fecha_iso,
            hora: m.hora,
            lugar: m.lugar,
            coordinador: m.coordinador,
            unidadOrganizativa: m.unidad_organizativa,
            objetivo: m.objetivo,
            participantes: [],
            compromisosCount: m.compromisos_count,
            pendientesCount: m.pendientes_count,
            proximaFechaSeguimiento: m.proxima_fecha_seguimiento,
            elaboradoPor: m.elaborado_por,
            nombreArchivo: m.nombre_archivo,
          }));
          setMinutasList(loadedMinutas);
        }

        const { data: compromisosData } = await client.from('compromisos_tareas').select('*');
        if (compromisosData && compromisosData.length > 0) {
          const mappedCompromisos: TareaCompromiso[] = compromisosData.map(c => ({
            id: c.id,
            minutaNumero: c.minuta_numero,
            minutaFecha: c.minuta_fecha,
            responsable: c.responsable,
            compromiso: c.compromiso,
            plazoText: c.plazo_text,
            plazoFechaISO: c.plazo_fecha_iso,
            vinculacionOrigen: c.vinculacion_origen,
            estado: c.estado as TaskStatus,
            prioridad: c.prioridad,
            avancePorcentaje: c.avance_porcentaje,
            areaGestion: c.area_gestion,
            observaciones: c.observaciones,
            historialAvances: c.historial_avances || [],
            createdAt: c.created_at,
            updatedAt: c.updated_at,
          }));
          setCompromisos(mappedCompromisos);
        }

        const { data: pendientesData } = await client.from('pendientes_area').select('*');
        if (pendientesData && pendientesData.length > 0) {
          const mappedPendientes: PendienteArea[] = pendientesData.map(p => ({
            id: p.id,
            area: p.area,
            pendiente: p.pendiente,
            dependeDe: p.depende_de,
            estado: p.estado as TaskStatus,
            observacion: p.observacion,
          }));
          setPendientes(mappedPendientes);
        }
      } catch (err) {
        console.error('Error cargando datos de Supabase:', err);
      }
    }

    loadFromSupabase();
  }, [supabaseConfig.isConnected]);

  // Sync updated commitment task
  const handleUpdateTask = async (updatedTask: TareaCompromiso) => {
    setCompromisos(prev => prev.map(c => c.id === updatedTask.id ? updatedTask : c));

    const client = getSupabaseClient();
    if (client && supabaseConfig.isConnected) {
      try {
        await client.from('compromisos_tareas').upsert({
          id: updatedTask.id,
          minuta_numero: updatedTask.minutaNumero,
          minuta_fecha: updatedTask.minutaFecha,
          responsable: updatedTask.responsable,
          compromiso: updatedTask.compromiso,
          plazo_text: updatedTask.plazoText,
          plazo_fecha_iso: updatedTask.plazoFechaISO,
          vinculacion_origen: updatedTask.vinculacionOrigen,
          estado: updatedTask.estado,
          prioridad: updatedTask.prioridad,
          avance_porcentaje: updatedTask.avancePorcentaje,
          area_gestion: updatedTask.areaGestion,
          observaciones: updatedTask.observaciones,
          historial_avances: updatedTask.historialAvances,
          updated_at: new Date().toISOString(),
        });
      } catch (err) {
        console.error('Error al guardar en Supabase:', err);
      }
    }
  };

  // Add new commitment task
  const handleAddTask = async (newTask: TareaCompromiso) => {
    setCompromisos(prev => [newTask, ...prev]);

    const client = getSupabaseClient();
    if (client && supabaseConfig.isConnected) {
      try {
        await client.from('compromisos_tareas').insert({
          id: newTask.id,
          minuta_numero: newTask.minutaNumero,
          minuta_fecha: newTask.minutaFecha,
          responsable: newTask.responsable,
          compromiso: newTask.compromiso,
          plazo_text: newTask.plazoText,
          plazo_fecha_iso: newTask.plazoFechaISO,
          vinculacion_origen: newTask.vinculacionOrigen,
          estado: newTask.estado,
          prioridad: newTask.prioridad,
          avance_porcentaje: newTask.avancePorcentaje,
          area_gestion: newTask.areaGestion,
          observaciones: newTask.observaciones,
          historial_avances: newTask.historialAvances,
        });
      } catch (err) {
        console.error('Error insertando en Supabase:', err);
      }
    }
  };

  // Update status in Kanban
  const handleUpdateTaskStatus = (taskId: string, newStatus: TaskStatus, newPct: number) => {
    const target = compromisos.find(c => c.id === taskId);
    if (target) {
      handleUpdateTask({
        ...target,
        estado: newStatus,
        avancePorcentaje: newPct,
        updatedAt: new Date().toISOString(),
      });
    }
  };

  // Update Pendiente Area
  const handleUpdatePendiente = (updatedPendiente: PendienteArea) => {
    setPendientes(prev => prev.map(p => p.id === updatedPendiente.id ? updatedPendiente : p));
  };

  // Convert Pendiente to active Commitment task
  const handleConvertToCompromiso = (p: PendienteArea) => {
    const newCompromisoTask: TareaCompromiso = {
      id: `comp-converted-${Date.now()}`,
      minutaNumero: activeMinuta ? activeMinuta.numero : minutasList[0]?.numero || '26-0004',
      minutaFecha: activeMinuta ? activeMinuta.fecha : minutasList[0]?.fecha || '30/07/2026',
      responsable: p.dependeDe || 'Gerencia de Planificación',
      compromiso: p.pendiente,
      plazoText: '12/08/2026',
      plazoFechaISO: '2026-08-12',
      vinculacionOrigen: `Pendiente (${p.area}) - Asignación Directa por ${currentProfile?.name || 'Supervisor'}`,
      estado: 'En Proceso',
      prioridad: 'Alta',
      avancePorcentaje: 10,
      areaGestion: p.area,
      observaciones: p.observacion,
      historialAvances: [
        {
          id: `h-${Date.now()}`,
          fecha: new Date().toISOString().split('T')[0],
          nota: `Asignación directa aprobada por ${currentProfile?.name || 'Supervisor'} desde Pendiente del área ${p.area}.`,
          porcentaje: 10,
          usuario: currentProfile?.name || 'Supervisor',
        }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    handleAddTask(newCompromisoTask);
    handleUpdatePendiente({ ...p, estado: 'En Proceso' });

    // Record ISO Audit Entry for Direct Task Creation
    const conversionAudit: IsoAuditLogEntry = {
      id: `aud-conv-${Date.now()}`,
      timestamp: new Date().toISOString(),
      usuario: currentProfile?.username || 'supervisor',
      rol: currentProfile?.role || 'supervisor',
      accion: 'Atribución Gerencial - Asignación Directa de Tarea',
      modulo: 'Pendientes por Área',
      detalles: `Asignación directa aprobada por ${currentProfile?.name} (@${currentProfile?.username}) para la tarea "${p.pendiente}" (${p.area}).`,
      isoStandard: 'ISO_9001'
    };
    setAuditLogs(prev => [conversionAudit, ...prev]);

    setActiveTab('compromisos');
  };

  // Handle Import from Minuta AI Extractor
  const handleImportMinuta = (newMinuta: MinutaReunion, newCompromisos: TareaCompromiso[], newPendientes: PendienteArea[]) => {
    setMinutasList(prev => {
      const exists = prev.some(m => m.numero === newMinuta.numero);
      if (exists) {
        return prev.map(m => m.numero === newMinuta.numero ? newMinuta : m);
      }
      return [newMinuta, ...prev];
    });
    setSelectedMinutaId(newMinuta.id);
    setCompromisos(prev => [...newCompromisos, ...prev.filter(c => c.minutaNumero !== newMinuta.numero)]);
    setPendientes(prev => [...newPendientes, ...prev]);
    setActiveTab('dashboard');
  };

  // Auth handlers
  const handleLoginSuccess = (profile: UserProfile) => {
    setCurrentProfile(profile);
    setIsAuthenticated(true);
    try {
      localStorage.setItem('ggpd_auth_v1', 'true');
      localStorage.setItem('ggpd_current_profile_v1', JSON.stringify(profile));
    } catch (e) {
      console.error('Error auto-saving auth state:', e);
    }

    setUsersList(prev => prev.map(u => u.id === profile.id ? { ...u, lastLogin: new Date().toISOString() } : u));

    const loginLog: IsoAuditLogEntry = {
      id: `aud-login-${Date.now()}`,
      timestamp: new Date().toISOString(),
      usuario: profile.username,
      rol: profile.role,
      accion: 'Inicio de Sesión Exitoso',
      modulo: 'Seguridad / Autenticación',
      detalles: `Acceso concedido para ${profile.name} (@${profile.username}).`,
      isoStandard: 'ISO_27001'
    };
    setAuditLogs(prev => [loginLog, ...prev]);
  };

  const handleLogout = () => {
    try {
      localStorage.removeItem('ggpd_auth_v1');
    } catch (e) {
      console.error('Error removing auth state:', e);
    }
    setIsAuthenticated(false);

    const logoutLog: IsoAuditLogEntry = {
      id: `aud-logout-${Date.now()}`,
      timestamp: new Date().toISOString(),
      usuario: currentProfile.username,
      rol: currentProfile.role,
      accion: 'Cierre de Sesión',
      modulo: 'Seguridad / Autenticación',
      detalles: `El usuario ${currentProfile.name} ha cerrado sesión en el sistema.`,
      isoStandard: 'ISO_27001'
    };
    setAuditLogs(prev => [logoutLog, ...prev]);
  };

  if (!isAuthenticated) {
    return <Login usersList={usersList} onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-900 flex">
      
      {/* Collapsible Left Sidebar */}
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        totalCompromisos={visibleCompromisos.length}
        totalMinutasCount={minutasList.length}
        currentProfile={currentProfile}
        supabaseConfig={supabaseConfig}
        onOpenSupabaseModal={() => setShowSupabaseModal(true)}
        onOpenUploader={handleOpenUploaderClick}
        onOpenMinutaHistory={() => setShowHistoryModal(true)}
        onOpenDriveSync={() => setShowDriveSyncModal(true)}
        onOpenUserManagement={() => setShowUserManagementModal(true)}
        onOpenRoleSelector={() => setShowRoleModal(true)}
        onLogout={handleLogout}
        onOpenIsoDocsExporter={() => setShowIsoDocsModal(true)}
        onOpenEmailReportConfig={() => setShowEmailReportModal(true)}
        isMobileOpen={isMobileSidebarOpen}
        setIsMobileOpen={setIsMobileSidebarOpen}
      />

      {/* Main Content Area (offset by sidebar width on desktop) */}
      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${
        isSidebarCollapsed ? 'md:ml-20' : 'md:ml-64'
      }`}>
        
        {/* Streamlined Top Header */}
        <Navbar
          onOpenUploader={handleOpenUploaderClick}
          onOpenMinutaHistory={() => setShowHistoryModal(true)}
          searchQuery={filterState.searchQuery}
          setSearchQuery={(q) => {
            setFilterState(prev => ({ ...prev, searchQuery: q }));
            if (activeTab === 'dashboard') setActiveTab('compromisos');
          }}
          activeMinuta={activeMinuta}
          totalMinutasCount={minutasList.length}
          totalCompromisos={visibleCompromisos.length}
          currentProfile={currentProfile}
          onOpenRoleSelector={() => setShowRoleModal(true)}
          onLogout={handleLogout}
          onToggleMobileSidebar={() => setIsMobileSidebarOpen(prev => !prev)}
        />

        {/* Main View Container */}
        <main className="flex-1 w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6">
          {activeTab === 'dashboard' && (
            <TaskDashboard
              currentProfile={currentProfile}
              activeMinuta={activeMinuta}
              minutasList={minutasList}
              compromisos={visibleCompromisos}
              pendientes={pendientes}
              onSelectResponsableFilter={(resp) => setFilterState(prev => ({ ...prev, responsable: resp }))}
              onSelectStatusFilter={(st) => setFilterState(prev => ({ ...prev, estado: st }))}
              onNavigateTab={setActiveTab}
              onOpenMinutaHistory={() => setShowHistoryModal(true)}
            />
          )}

          {activeTab === 'compromisos' && (
            <CompromisosList
              compromisos={visibleCompromisos}
              onUpdateTask={handleUpdateTask}
              onAddTask={handleAddTask}
              filterState={filterState}
              setFilterState={setFilterState}
              currentProfile={currentProfile}
            />
          )}

          {activeTab === 'kanban' && (
            <KanbanBoard
              compromisos={visibleCompromisos}
              onUpdateTaskStatus={handleUpdateTaskStatus}
              currentProfile={currentProfile}
            />
          )}

          {activeTab === 'pendientes' && (
            isElevatedUser ? (
              <PendientesArea
                pendientes={pendientes}
                onUpdatePendiente={handleUpdatePendiente}
                onConvertToCompromiso={handleConvertToCompromiso}
                currentProfile={currentProfile}
              />
            ) : (
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center space-y-4 max-w-xl mx-auto my-12 shadow-2xl">
                <div className="w-16 h-16 bg-red-500/10 text-red-400 rounded-2xl flex items-center justify-center mx-auto border border-red-500/20">
                  <ShieldAlert className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-black text-white">Módulo Restringido</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  El módulo <strong>Pendientes por Área</strong> está reservado exclusivamente para la Gerencia General, Administradores y Supervisores de CORPOELEC.
                </p>
                <button
                  onClick={() => setActiveTab('compromisos')}
                  className="px-5 py-2.5 bg-[#002B49] hover:bg-cyan-900 text-cyan-300 text-xs font-bold rounded-xl border border-cyan-500/30 transition-colors cursor-pointer"
                >
                  Volver a Compromisos Asignados
                </button>
              </div>
            )
          )}

          {activeTab === 'prtsen_poa' && (
            <PRTSENPOATracker
              compromisos={visibleCompromisos}
              onNavigateCompromisos={() => setActiveTab('compromisos')}
            />
          )}

          {activeTab === 'strategic_kpi' && (
            <StrategicKpiDashboard
              compromisos={visibleCompromisos}
              onNavigateCompromisos={() => setActiveTab('compromisos')}
            />
          )}
        </main>

        {/* Footer */}
        <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 text-xs py-4 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
            <div>
              <span className="font-bold text-white">CORPOELEC</span> • Gerencia de Gestión de Planificación de Distribución (GGPD)
            </div>
            <div className="text-slate-500 text-[11px]">
              Sistema de Seguimiento de Minutas y Proyectos Operativos PRTSEN / POA
            </div>
          </div>
        </footer>

      </div>

      {/* Upload Minuta Modal */}
      {showUploader && (
        <MinutaUploader
          onImportMinuta={handleImportMinuta}
          onClose={() => setShowUploader(false)}
          currentProfile={currentProfile}
        />
      )}

      {/* Minuta History Modal */}
      {showHistoryModal && (
        <MinutaHistoryModal
          minutas={minutasList}
          selectedMinutaId={selectedMinutaId}
          onSelectMinuta={setSelectedMinutaId}
          onOpenUploader={handleOpenUploaderClick}
          onClose={() => setShowHistoryModal(false)}
          compromisos={compromisos}
        />
      )}

      {/* Supabase Config Modal */}
      {showSupabaseModal && (
        <SupabaseModal
          config={supabaseConfig}
          onUpdateConfig={setSupabaseConfig}
          onClose={() => setShowSupabaseModal(false)}
        />
      )}

      {/* Role & Profile Selector Modal */}
      {showRoleModal && (
        <RoleSelectorModal
          currentProfile={currentProfile}
          usersList={usersList}
          onSelectProfile={setCurrentProfile}
          onOpenUserManagement={() => setShowUserManagementModal(true)}
          onLogout={handleLogout}
          onClose={() => setShowRoleModal(false)}
        />
      )}

      {/* Upload Denied Warning Modal for Analistas */}
      {showUploadDeniedModal && (
        <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-2xl p-6 space-y-4 text-slate-800">
            <div className="flex items-center space-x-3 text-[#E30613]">
              <div className="p-3 bg-red-100 rounded-xl">
                <ShieldAlert className="w-6 h-6 text-[#E30613]" />
              </div>
              <div>
                <h3 className="font-extrabold text-[#002B49] text-base">Acceso Restringido a Carga</h3>
                <p className="text-xs text-slate-500 font-normal">
                  Perfil actual: {currentProfile.name} ({currentProfile.role})
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              La carga e importación de minutas con Inteligencia Artificial está reservada para los perfiles de <strong>Administrador</strong> e <strong>Ing. Adrián Correa (Supervisor)</strong>.
            </p>

            <div className="flex items-center justify-end space-x-2 border-t pt-3">
              <button
                onClick={() => setShowUploadDeniedModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs transition-colors cursor-pointer"
              >
                Cerrar
              </button>
              <button
                onClick={() => {
                  setShowUploadDeniedModal(false);
                  setShowRoleModal(true);
                }}
                className="px-4 py-2 bg-[#002B49] hover:bg-slate-900 text-white rounded-xl font-bold text-xs transition-colors flex items-center space-x-1.5 cursor-pointer shadow-sm"
              >
                <span>Cambiar a Perfil Autorizado</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}


      {/* Google Drive Sync Modal */}
      {showDriveSyncModal && (
        <GoogleDriveSyncModal
          importedMinutas={minutasList}
          onImportFromDrive={handleImportMinuta}
          onClose={() => setShowDriveSyncModal(false)}
        />
      )}

      {/* ISO Admin User Management Modal */}
      {showUserManagementModal && (
        <UserManagementModal
          currentProfile={currentProfile}
          usersList={usersList}
          onUpdateUsersList={setUsersList}
          onSelectProfile={setCurrentProfile}
          auditLogs={auditLogs}
          qualityMetrics={qualityMetrics}
          onClose={() => setShowUserManagementModal(false)}
        />
      )}

      {/* ISO Google Docs Generator Modal */}
      {showIsoDocsModal && (
        <IsoDocsExporterModal
          currentProfile={currentProfile}
          activeMinuta={activeMinuta}
          compromisos={visibleCompromisos}
          onClose={() => setShowIsoDocsModal(false)}
        />
      )}

      {/* Parametric Email Notifications & Scheduled Google Drive Report Modal (Solo Admins y Supervisores) */}
      {showEmailReportModal && (currentProfile.role === 'admin' || currentProfile.role === 'supervisor') && (
        <EmailReportConfigModal
          currentProfile={currentProfile}
          activeMinuta={activeMinuta}
          compromisos={visibleCompromisos}
          onClose={() => setShowEmailReportModal(false)}
          onRecordAuditLog={(newLog) => setAuditLogs(prev => [newLog, ...prev])}
        />
      )}

    </div>
  );
}
