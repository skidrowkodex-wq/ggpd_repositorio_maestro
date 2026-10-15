/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { TopHeader } from './components/TopHeader';
import { Sidebar } from './components/Sidebar';
import { Footer } from './components/Footer';
import { IndustrialLogin } from './components/IndustrialLogin';
import { VehicleFormView } from './components/VehicleFormView';
import { ConsolidatedView } from './components/ConsolidatedView';
import { ManagerDashboardView } from './components/ManagerDashboardView';
import { UserManagementModal } from './components/UserManagementModal';
import { ImportModal } from './components/ImportModal';
import { VehicleDetailModal } from './components/VehicleDetailModal';
import { BackupModal } from './components/BackupModal';
import { ChangePasswordModal } from './components/ChangePasswordModal';
import { AdminPasswordResetModal } from './components/AdminPasswordResetModal';
import { PostgreSqlManagerModal } from './components/PostgreSqlManagerModal';
import { MobileBottomNav } from './components/MobileBottomNav';
import { RolePermissionsView } from './components/RolePermissionsView';
import { auditService } from './services/auditService';
import { permissionService, PermissionMatrix, UserRoleKey } from './services/permissionService';

import { VehicleRecord, MasterCatalogsState } from './types/fleet';
import { INITIAL_CATALOGS, OFFICIAL_BRANDS_A4 } from './data/defaultCatalogs';
import { CORPOELEC_CENTROS_SERVICIOS } from './data/venezuelaRegions';
import { getUserProfile } from './data/defaultUsers';
import { exportFleetToExcel } from './services/excelService';

const STORAGE_KEY_VEHICLES = 'corpoelec_flota_vehicles_v3';
const STORAGE_KEY_CATALOGS = 'corpoelec_flota_catalogs_v11';
const STORAGE_KEY_AUTH = 'sen_auth_session_v1';
const STORAGE_KEY_USER = 'sen_user_email_v1';
const STORAGE_KEY_THEME = 'sen_theme_mode_v1';

const deduplicateById = <T extends { id: string }>(items: T[]): T[] => {
  if (!Array.isArray(items)) return [];
  const seen = new Set<string>();
  return items.filter(item => {
    if (!item || !item.id || seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
};

export default function App() {
  // Catalogs state: strictly uses official brands and models from JSON specification
  const [catalogs, setCatalogs] = useState<MasterCatalogsState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CATALOGS);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...INITIAL_CATALOGS,
          ...parsed,
          marcas: OFFICIAL_BRANDS_A4,
          modelos: INITIAL_CATALOGS.modelos,
          tipos_vehiculo: INITIAL_CATALOGS.tipos_vehiculo,
          unidades_asignadas: INITIAL_CATALOGS.unidades_asignadas,
          centros_servicios: deduplicateById(CORPOELEC_CENTROS_SERVICIOS)
        };
      }
    } catch (e) {
      console.error('Error loading catalogs from localStorage', e);
    }
    return {
      ...INITIAL_CATALOGS,
      marcas: OFFICIAL_BRANDS_A4,
      modelos: INITIAL_CATALOGS.modelos,
      tipos_vehiculo: INITIAL_CATALOGS.tipos_vehiculo,
      unidades_asignadas: INITIAL_CATALOGS.unidades_asignadas,
      centros_servicios: deduplicateById(CORPOELEC_CENTROS_SERVICIOS)
    };
  });

  // Database vehicles state
  const [vehicles, setVehicles] = useState<VehicleRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_VEHICLES);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error(e);
    }
    return [];
  });

  // Industrial Zone Authentication State
  const [currentUser, setCurrentUser] = useState<string>(() => {
    return localStorage.getItem(STORAGE_KEY_USER) || '';
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem(STORAGE_KEY_AUTH) === 'active';
  });

  const userProfile = getUserProfile(currentUser);

  // ── Matriz de Permisos por Rol (RBAC híbrido: localStorage + InsForge) ──
  const [permissionMatrix, setPermissionMatrix] = useState<PermissionMatrix>(() => permissionService.getMatrix());

  useEffect(() => {
    const unsubscribe = permissionService.subscribe(setPermissionMatrix);
    // Sincronización diferida con InsForge (no bloquea el arranque).
    permissionService.syncFromCloud();
    return () => unsubscribe();
  }, []);

  /** ¿El rol del usuario actual tiene habilitada la acción/botón? */
  const can = (actionId: string): boolean =>
    permissionService.canForMatrix(permissionMatrix, userProfile.role, actionId);

  const handleLoginSuccess = (email: string, selectedState?: string) => {
    setCurrentUser(email);
    localStorage.setItem(STORAGE_KEY_USER, email);
    localStorage.setItem(STORAGE_KEY_AUTH, 'active');
    if (selectedState) {
      localStorage.setItem('sen_user_state', selectedState);
    }
    setIsAuthenticated(true);
    setEditingVehicle(null);
    // Aterrizar en la primera pestaña permitida para el rol entrante.
    const role = getUserProfile(email, selectedState).role;
    const landing: 'formulario' | 'consolidado' | 'gerencia' =
      permissionService.canForMatrix(permissionMatrix, role, 'tab_formulario') ? 'formulario'
      : permissionService.canForMatrix(permissionMatrix, role, 'tab_consolidado') ? 'consolidado'
      : 'gerencia';
    setCurrentTab(landing);
  };

  const handleLogout = () => {
    localStorage.removeItem(STORAGE_KEY_AUTH);
    setIsAuthenticated(false);
  };

  // Dark Mode Industrial SEN state (persisted)
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return localStorage.getItem(STORAGE_KEY_THEME) === 'dark';
  });

  const handleToggleDarkMode = () => {
    setIsDarkMode(prev => {
      const next = !prev;
      localStorage.setItem(STORAGE_KEY_THEME, next ? 'dark' : 'light');
      return next;
    });
  };

  const [currentTab, setCurrentTab] = useState<'formulario' | 'consolidado' | 'gerencia' | 'permisos'>('formulario');

  const [selectedVehicleForDetail, setSelectedVehicleForDetail] = useState<VehicleRecord | null>(null);
  const [editingVehicle, setEditingVehicle] = useState<VehicleRecord | null>(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isUserManagementOpen, setIsUserManagementOpen] = useState(false);
  const [isBackupModalOpen, setIsBackupModalOpen] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [isAdminPasswordResetsOpen, setIsAdminPasswordResetsOpen] = useState(false);
  const [isPostgreSqlModalOpen, setIsPostgreSqlModalOpen] = useState(false);

  // Sync state to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_CATALOGS, JSON.stringify(catalogs));
    } catch (e) {
      console.error(e);
    }
  }, [catalogs]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_VEHICLES, JSON.stringify(vehicles));
    } catch (e) {
      console.error(e);
    }
  }, [vehicles]);

  // Reubicar al usuario si su rol pierde el permiso de la pestaña activa (RBAC).
  useEffect(() => {
    if (!isAuthenticated) return;
    const permId =
      currentTab === 'formulario' ? 'tab_formulario'
      : currentTab === 'consolidado' ? 'tab_consolidado'
      : currentTab === 'gerencia' ? 'tab_gerencia'
      : 'tab_permisos';
    if (!permissionService.canForMatrix(permissionMatrix, userProfile.role, permId)) {
      const fallback =
        permissionService.canForMatrix(permissionMatrix, userProfile.role, 'tab_consolidado') ? 'consolidado'
        : permissionService.canForMatrix(permissionMatrix, userProfile.role, 'tab_formulario') ? 'formulario'
        : permissionService.canForMatrix(permissionMatrix, userProfile.role, 'tab_gerencia') ? 'gerencia'
        : null;
      if (fallback && fallback !== currentTab) {
        setCurrentTab(fallback);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTab, permissionMatrix, currentUser, isAuthenticated]);

  // Filtrado de vehículos según el rol y ámbito del usuario actual
  const visibleVehicles = vehicles.filter(v => {
    if (userProfile.role === 'estado' && userProfile.estadoAsignado) {
      return v.estado_venezuela?.toUpperCase() === userProfile.estadoAsignado.toUpperCase();
    }
    // Admin, Nacional y Gerente ven todos los estados
    return true;
  });

  // Handlers
  const handleSaveVehicle = (vehicle: VehicleRecord) => {
    // Verificación de seguridad institucional: Un usuario de estado no puede registrar vehículos de otra entidad
    if (userProfile.role === 'estado' && userProfile.estadoAsignado) {
      if ((vehicle.estado_venezuela || '').toUpperCase() !== userProfile.estadoAsignado.toUpperCase()) {
        alert(`⚠️ Infracción de Seguridad SEN: Su usuario (${userProfile.nombre}) está asignado exclusivamente al Estado ${userProfile.estadoAsignado}. El sistema no permite cargar ni guardar unidades pertenecientes a otra entidad territorial.`);
        return;
      }
    }

    setVehicles(prev => {
      const idx = prev.findIndex(v => v.id === vehicle.id || v.numero_vehiculo.toUpperCase() === vehicle.numero_vehiculo.toUpperCase());
      if (idx >= 0) {
        auditService.logAction(currentUser, 'EDITAR_VEHICULO', `Actualización de ficha técnica vehículo N° ${vehicle.numero_vehiculo} (${vehicle.marca_vehiculo})`);
        const next = [...prev];
        next[idx] = vehicle;
        return next;
      } else {
        auditService.logAction(currentUser, 'CREAR_VEHICULO', `Creación de nuevo registro vehículo N° ${vehicle.numero_vehiculo} (${vehicle.marca_vehiculo}) en ${vehicle.estado_venezuela || 'Capital'}`);
        return [vehicle, ...prev];
      }
    });

    setEditingVehicle(null);
    setCurrentTab('consolidado');
  };

  const handleDeleteVehicle = (id: string, numero: string) => {
    if (!can('btn_delete_vehiculo')) {
      alert('⚠️ Acceso restringido: su perfil no tiene habilitada la eliminación de vehículos.');
      return;
    }
    if (confirm(`¿Confirma eliminar el registro del vehículo "${numero}" de la base de datos?`)) {
      auditService.logAction(currentUser, 'ELIMINAR_VEHICULO', `Eliminación de registro vehículo N° ${numero}`);
      setVehicles(prev => prev.filter(v => v.id !== id));
    }
  };

  const handleEditVehicle = (vehicle: VehicleRecord) => {
    if (!can('btn_edit_vehiculo')) {
      alert('⚠️ Acceso restringido: su perfil no tiene habilitada la edición de vehículos.');
      return;
    }
    setEditingVehicle(vehicle);
    setSelectedVehicleForDetail(null);
    setCurrentTab('formulario');
  };

  const handleClearDatabase = () => {
    if (!can('btn_vaciar_bd')) {
      alert('⚠️ Acción restringida: Solo el usuario Administrador puede vaciar la base de datos completa.');
      return;
    }
    if (confirm('¿Está seguro de vaciar toda la base de datos de vehículos y reiniciar los correlativos a 0001?')) {
      auditService.logAction(currentUser, 'VACIAR_BASE', 'Vaciado completo de la base de datos de vehículos');
      setVehicles([]);
      localStorage.removeItem(STORAGE_KEY_VEHICLES);
    }
  };

  /** Cambio de pestaña con verificación de permisos por rol (RBAC). */
  const handleSelectTab = (tab: 'formulario' | 'consolidado' | 'gerencia' | 'permisos') => {
    const permId =
      tab === 'formulario' ? 'tab_formulario'
      : tab === 'consolidado' ? 'tab_consolidado'
      : tab === 'gerencia' ? 'tab_gerencia'
      : 'tab_permisos';
    if (!can(permId)) {
      alert('⚠️ Acceso restringido: su perfil no tiene habilitado este módulo. Consulte al Administrador del sistema.');
      return;
    }
    if (tab === 'formulario') {
      setEditingVehicle(null);
    }
    setCurrentTab(tab);
  };

  const handleImportSuccess = (newVehicles: VehicleRecord[]) => {
    auditService.logAction(currentUser, 'IMPORTAR_EXCEL', `Importación exitosa de ${newVehicles.length} registros de flota desde Excel/JSON`);
    setVehicles(prev => {
      const map = new Map<string, VehicleRecord>();
      prev.forEach(v => map.set(v.numero_vehiculo.toUpperCase(), v));
      newVehicles.forEach(v => map.set(v.numero_vehiculo.toUpperCase(), v));
      return Array.from(map.values());
    });

    setIsImportModalOpen(false);
    setCurrentTab('consolidado');
  };

  if (!isAuthenticated) {
    return <IndustrialLogin onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className={`min-h-screen flex flex-col font-['Inter',sans-serif] transition-colors duration-200 overflow-x-hidden w-full max-w-full ${
      isDarkMode ? 'dark bg-[#0a1f17] text-slate-100' : 'bg-[#f8f9fa] text-slate-900'
    }`}>
      {/* Top Header Industrial */}
      <TopHeader
        userEmail={currentUser}
        onLogout={handleLogout}
        isDarkMode={isDarkMode}
        onToggleDarkMode={handleToggleDarkMode}
        onOpenUserManagement={() => setIsUserManagementOpen(true)}
        onOpenBackupModal={() => setIsBackupModalOpen(true)}
        onOpenChangePassword={() => setIsChangePasswordOpen(true)}
        onOpenPasswordResets={() => setIsAdminPasswordResetsOpen(true)}
        onOpenPostgreSql={() => setIsPostgreSqlModalOpen(true)}
        onOpenMobileMenu={() => setIsMobileDrawerOpen(true)}
        can={can}
      />

      {/* Layout Principal con Navbar Lateral Colapsable y Drawer Móvil */}
      <div className="flex flex-1 min-h-[calc(100vh-50px)] w-full max-w-full overflow-x-hidden">
        <Sidebar
          currentTab={currentTab}
          onSelectTab={handleSelectTab}
          totalRecords={visibleVehicles.length}
          userEmail={currentUser}
          isDarkMode={isDarkMode}
          onExportExcel={() => exportFleetToExcel(visibleVehicles)}
          mobileOpen={isMobileDrawerOpen}
          onCloseMobile={() => setIsMobileDrawerOpen(false)}
          onOpenUserManagement={() => setIsUserManagementOpen(true)}
          onOpenBackupModal={() => setIsBackupModalOpen(true)}
          onOpenChangePassword={() => setIsChangePasswordOpen(true)}
          onOpenPostgreSql={() => setIsPostgreSqlModalOpen(true)}
          onToggleDarkMode={handleToggleDarkMode}
          can={can}
        />

        {/* Main Content Area: Responsive padding with safe bottom clearance on mobile */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 pt-4 sm:pt-6 pb-24 md:pb-12 overflow-x-hidden">
          {currentTab === 'formulario' && (
            <VehicleFormView
              initialVehicle={editingVehicle}
              catalogs={catalogs}
              existingVehicles={vehicles}
              onSaveVehicle={handleSaveVehicle}
              onCancel={() => {
                setEditingVehicle(null);
                setCurrentTab('consolidado');
              }}
              isDarkMode={isDarkMode}
              currentUserEmail={currentUser}
            />
          )}

          {currentTab === 'consolidado' && (
            <ConsolidatedView
              vehicles={visibleVehicles}
              onSelectVehicle={setSelectedVehicleForDetail}
              onEditVehicle={handleEditVehicle}
              onDeleteVehicle={handleDeleteVehicle}
              onGoToForm={() => {
                setEditingVehicle(null);
                setCurrentTab('formulario');
              }}
              onOpenImportModal={() => setIsImportModalOpen(true)}
              onClearDatabase={handleClearDatabase}
              can={can}
            />
          )}

          {currentTab === 'gerencia' && (
            <ManagerDashboardView
              vehicles={visibleVehicles}
              catalogs={catalogs}
              onExportExcel={() => exportFleetToExcel(visibleVehicles)}
              isDarkMode={isDarkMode}
              can={can}
            />
          )}

          {currentTab === 'permisos' && userProfile.role === 'admin' && (
            <RolePermissionsView
              currentUserEmail={currentUser}
              isDarkMode={isDarkMode}
            />
          )}
        </main>
      </div>

      {/* Modals */}
      {isImportModalOpen && (
        <ImportModal
          existingVehicles={vehicles}
          onImportSuccess={handleImportSuccess}
          onClose={() => setIsImportModalOpen(false)}
        />
      )}

      {selectedVehicleForDetail && (
        <VehicleDetailModal
          vehicle={selectedVehicleForDetail}
          onClose={() => setSelectedVehicleForDetail(null)}
          onEdit={handleEditVehicle}
        />
      )}

      {isUserManagementOpen && (
        <UserManagementModal
          isOpen={isUserManagementOpen}
          onClose={() => setIsUserManagementOpen(false)}
          currentUserEmail={currentUser}
          onSwitchUser={(email, estadoAsignado) => {
            setCurrentUser(email);
            localStorage.setItem(STORAGE_KEY_USER, email);
            if (estadoAsignado) {
              localStorage.setItem('sen_user_state', estadoAsignado);
            }
            setEditingVehicle(null);
            const role = getUserProfile(email, estadoAsignado).role;
            const landing: 'formulario' | 'consolidado' | 'gerencia' =
              permissionService.canForMatrix(permissionMatrix, role, 'tab_formulario') ? 'formulario'
              : permissionService.canForMatrix(permissionMatrix, role, 'tab_consolidado') ? 'consolidado'
              : 'gerencia';
            setCurrentTab(landing);
          }}
        />
      )}

      {isBackupModalOpen && (
        <BackupModal
          isOpen={isBackupModalOpen}
          vehicles={vehicles}
          catalogs={catalogs}
          onRestore={(restoredVehicles, restoredCatalogs) => {
            setVehicles(restoredVehicles);
            if (restoredCatalogs) {
              setCatalogs(restoredCatalogs);
            }
            setIsBackupModalOpen(false);
          }}
          onClose={() => setIsBackupModalOpen(false)}
        />
      )}

      {isChangePasswordOpen && (
        <ChangePasswordModal
          isOpen={isChangePasswordOpen}
          onClose={() => setIsChangePasswordOpen(false)}
          currentUserEmail={currentUser}
        />
      )}

      {isAdminPasswordResetsOpen && (
        <AdminPasswordResetModal
          isOpen={isAdminPasswordResetsOpen}
          onClose={() => setIsAdminPasswordResetsOpen(false)}
          adminUserEmail={currentUser}
        />
      )}

      {isPostgreSqlModalOpen && (
        <PostgreSqlManagerModal
          isOpen={isPostgreSqlModalOpen}
          onClose={() => setIsPostgreSqlModalOpen(false)}
          vehicles={vehicles}
          catalogs={catalogs}
          isDarkMode={isDarkMode}
        />
      )}

      {/* Footer Unificado con margen inferior en móvil */}
      <div className="mb-14 md:mb-0">
        <Footer totalRecords={visibleVehicles.length} />
      </div>

      {/* Barra de Navegación Inferior Flotante para Celulares / Móviles */}
      <MobileBottomNav
        currentTab={currentTab}
        onSelectTab={handleSelectTab}
        totalRecords={visibleVehicles.length}
        userEmail={currentUser}
        isDarkMode={isDarkMode}
        onOpenMobileMenu={() => setIsMobileDrawerOpen(true)}
        can={can}
      />
    </div>
  );
}
