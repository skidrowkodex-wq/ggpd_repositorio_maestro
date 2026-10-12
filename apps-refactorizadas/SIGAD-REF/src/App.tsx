import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './lib/authContext';
import { ThemeProvider } from './lib/themeContext';
import { LoginForm } from './components/LoginForm';
import { AppShell, SigadTab } from './components/Navbar';
import { SubstationSelector } from './components/SubstationSelector';
import { SubstationHeaderCard } from './components/SubstationHeaderCard';
import { BaysTreeView } from './components/BaysTreeView';
import { DiagnosticsKpiPanel } from './components/DiagnosticsKpiPanel';
import { AtlasTopologicoView } from './components/AtlasTopologicoView';
import { FaultModal } from './components/FaultModal';
import { RestoreModal } from './components/RestoreModal';
import { ComponentModal } from './components/ComponentModal';
import { RegenerateCadafeModal } from './components/RegenerateCadafeModal';

import { 
  SubestacionMaster, 
  CircuitoMaster, 
  SubestacionEstructura, 
  ComponentePatio,
  BahiaPatio
} from './types/sigad';
import { catalogService } from './services/catalogService';
import { storageService } from './services/storageService';
import { generarEstructuraCadafe, OpcionesEstructuraCadafe } from './services/cadafeTemplateEngine';
import { Sparkles, AlertCircle, CheckCircle2 } from 'lucide-react';

function SigadDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<SigadTab>('bahias');
  
  // Subestación seleccionada
  const [selectedSe, setSelectedSe] = useState<SubestacionMaster | null>(() => {
    // Inicializar por defecto con Bejuma o San Cristóbal
    const all = catalogService.getSubestaciones();
    return all.find(s => s.codigo === 'SE-CAR-0216') || all[0] || null;
  });

  // Circuitos asociados reales
  const [circuitosAsociados, setCircuitosAsociados] = useState<CircuitoMaster[]>([]);

  // Estructura de activos de la subestación
  const [estructura, setEstructura] = useState<SubestacionEstructura | null>(null);

  // Modales
  const [compToFault, setCompToFault] = useState<ComponentePatio | null>(null);
  const [compToRestore, setCompToRestore] = useState<ComponentePatio | null>(null);
  const [compToInspect, setCompToInspect] = useState<ComponentePatio | null>(null);
  const [isRegenerateModalOpen, setIsRegenerateModalOpen] = useState<boolean>(false);

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [, setCatalogVersion] = useState<number>(0);

  // Suscribirse a sincronización de catálogos desde InsForge core
  useEffect(() => {
    const unsub = catalogService.subscribe(() => {
      setCatalogVersion((v) => v + 1);
    });
    catalogService.syncFromInsforge();
    return () => unsub();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 4000);
  };

  // Cargar circuitos asociados cuando cambia la S/E
  useEffect(() => {
    if (selectedSe) {
      const circs = catalogService.getCircuitosBySubestacion(selectedSe.codigo);
      setCircuitosAsociados(circs);
    } else {
      setCircuitosAsociados([]);
    }
  }, [selectedSe]);

  // Cargar estructura cuando cambia la S/E (local + InsForge)
  useEffect(() => {
    if (selectedSe) {
      const data = storageService.getEstructura(selectedSe.codigo);
      if (data) {
        setEstructura(data);
      } else {
        storageService.loadFromInsforge(selectedSe.codigo).then((dbData) => {
          if (dbData) setEstructura(dbData);
          else setEstructura(null);
        });
      }
    } else {
      setEstructura(null);
    }
  }, [selectedSe]);

  // Manejador para Abrir el Modal de Generación / Regeneración
  const handleOpenRegenerateModal = () => {
    setIsRegenerateModalOpen(true);
  };

  // Manejador para Aplicar la Generación / Regeneración con Opciones
  const handleConfirmRegenerate = (opciones: OpcionesEstructuraCadafe) => {
    if (!selectedSe) return;
    const nuevaEstructura = generarEstructuraCadafe(selectedSe, circuitosAsociados, opciones);
    storageService.saveEstructura(nuevaEstructura);
    setEstructura({ ...nuevaEstructura });

    const totalComps = nuevaEstructura.bahias.reduce((acc, b) => acc + b.componentes.length, 0);
    showToast(
      `✓ Esqueleto CADAFE actualizado para ${selectedSe.nombre_se}: ${nuevaEstructura.bahias.length} Bahías y ${totalComps} Componentes normalizados.`
    );
  };

  // Manejador de Falla
  const handleConfirmFault = (compId: string, causa: string, descripcion: string, registradoPor: string) => {
    if (!selectedSe) return;
    const updated = storageService.declararAveria(selectedSe.codigo, compId, causa, descripcion, registradoPor);
    if (updated) {
      setEstructura({ ...updated });
      showToast('⚠️ Avería registrada e indisponibilidad notificada.');
    }
  };

  // Manejador de Restablecimiento
  const handleConfirmRestore = (
    compId: string,
    detalles: {
      esNuevo: boolean;
      serial?: string;
      fabricante?: string;
      capacidadMva?: number;
      notas: string;
      registradoPor: string;
    }
  ) => {
    if (!selectedSe) return;
    const updated = storageService.restablecerServicio(selectedSe.codigo, compId, detalles);
    if (updated) {
      setEstructura({ ...updated });
      showToast('✓ Equipo restablecido a servicio operativo exitosamente.');
    }
  };

  // Manejador de Guardado de Edición Técnica
  const handleSaveComponent = (comp: ComponentePatio) => {
    if (!selectedSe) return;
    const updated = storageService.updateComponente(selectedSe.codigo, comp);
    if (updated) {
      setEstructura({ ...updated });
      showToast(`✓ Ficha técnica de ${comp.codigo_norma} guardada.`);
    }
  };

  // Manejador para Agregar Bahía
  const handleAddBay = (bahiaData: { nombre_bahia: string; tipo_bahia: any; tension_kv: number }) => {
    if (!selectedSe) return;
    const nuevaBahia: BahiaPatio = {
      id: `bahia-${selectedSe.codigo}-${Date.now()}`,
      se_codigo: selectedSe.codigo,
      nombre_bahia: bahiaData.nombre_bahia,
      tipo_bahia: bahiaData.tipo_bahia,
      tension_kv: bahiaData.tension_kv,
      orden: (estructura?.bahias.length || 0) + 1,
      componentes: [],
    };
    const updated = storageService.addBahia(selectedSe.codigo, nuevaBahia);
    if (updated) {
      setEstructura({ ...updated });
      showToast(`✓ Bahía "${nuevaBahia.nombre_bahia}" creada exitosamente.`);
    }
  };

  // Manejador para Eliminar Bahía
  const handleDeleteBay = (bahiaId: string) => {
    if (!selectedSe) return;
    const updated = storageService.deleteBahia(selectedSe.codigo, bahiaId);
    if (updated) {
      setEstructura({ ...updated });
      showToast('✓ Bahía eliminada del patio.');
    }
  };

  // Manejador para Agregar Componente a Bahía
  const handleAddComponent = (comp: ComponentePatio) => {
    if (!selectedSe) return;
    const updated = storageService.addComponente(selectedSe.codigo, comp.bahia_id, comp);
    if (updated) {
      setEstructura({ ...updated });
      showToast(`✓ Equipo "${comp.codigo_norma}" incorporado a la bahía.`);
    }
  };

  // Manejador para Eliminar Componente
  const handleDeleteComponent = (compId: string) => {
    if (!selectedSe) return;
    const updated = storageService.deleteComponente(selectedSe.codigo, compId);
    if (updated) {
      setEstructura({ ...updated });
      showToast('✓ Equipo eliminado del patio.');
    }
  };

  if (!user) {
    return <LoginForm />;
  }

  return (
    <>
      {/* Toast Notificación Flotante */}
      {toastMessage && (
        <div className="fixed top-20 left-4 right-4 sm:left-auto sm:right-6 z-50 max-w-[calc(100vw-2rem)] sm:max-w-sm flex items-center gap-2.5 px-4 py-3 rounded-xl bg-slate-900/95 border border-cyan-500/50 text-cyan-200 text-xs font-semibold shadow-2xl shadow-cyan-950/80 backdrop-blur-md animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="min-w-0">{toastMessage}</span>
        </div>
      )}

      <AppShell activeTab={activeTab} setActiveTab={setActiveTab}>
        {/* Selector de Subestación */}
        <SubstationSelector
          selectedSe={selectedSe}
          onSelectSe={(se) => setSelectedSe(se)}
        />

        {selectedSe ? (
          <>
            {/* Tarjeta de Cabecera 360 */}
            <SubstationHeaderCard
              subestacion={selectedSe}
              circuitosCount={circuitosAsociados.length}
              estructura={estructura}
              onGenerarCadafe={handleOpenRegenerateModal}
            />

            {/* Si no tiene estructura generada aún, invitar a generar */}
            {(!estructura || estructura.bahias.length === 0) && (
              <div className="glass-panel p-8 text-center space-y-4 my-8 bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-sky-900/60 shadow-sm">
                <div className="w-12 h-12 rounded-2xl bg-sky-50 dark:bg-cyan-500/10 border border-sky-200 dark:border-cyan-500/30 flex items-center justify-center text-sky-600 dark:text-cyan-400 mx-auto">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    Subestación sin Componentes Registrados
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 max-w-lg mx-auto">
                    Esta instalación aún no tiene inventario de equipos de patio cargado. 
                    Puede usar el motor CADAFE para autogenerar la estructura modular en 1 clic configurando transformadores, circuitos de salida y niveles de tensión.
                  </p>
                </div>
                <button
                  onClick={handleOpenRegenerateModal}
                  className="btn btn-primary py-2.5 px-6 text-xs font-bold shadow-md shadow-sky-600/20"
                >
                  ⚡ Configurar y Auto-Generar Esqueleto CADAFE
                </button>
              </div>
            )}

            {/* Vistas según pestaña activa */}
            {estructura && estructura.bahias.length > 0 && (
              <>
                {activeTab === 'bahias' && (
                  <BaysTreeView
                    estructura={estructura}
                    onSelectComponent={(c) => setCompToInspect(c)}
                    onOpenFaultModal={(c) => setCompToFault(c)}
                    onOpenRestoreModal={(c) => setCompToRestore(c)}
                    onAddBay={handleAddBay}
                    onDeleteBay={handleDeleteBay}
                    onAddComponent={handleAddComponent}
                    onDeleteComponent={handleDeleteComponent}
                  />
                )}

                {activeTab === 'diagnostico' && (
                  <DiagnosticsKpiPanel
                    subestacion={selectedSe}
                    estructura={estructura}
                  />
                )}

                {activeTab === 'atlas' && (
                  <AtlasTopologicoView
                    subestacion={selectedSe}
                    estructura={estructura}
                    onSelectComponent={(c) => setCompToInspect(c)}
                  />
                )}
              </>
            )}
          </>
        ) : (
          <div className="glass-panel p-12 text-center text-slate-400">
            <AlertCircle className="w-10 h-10 mx-auto mb-2 text-cyan-400 opacity-60" />
            <h3 className="text-base font-bold text-white">Seleccione una Subestación</h3>
            <p className="text-xs">Elija una subestación del catálogo superior para comenzar la gestión de activos.</p>
          </div>
        )}
      </AppShell>

      {/* Modal de Configuración y Regeneración CADAFE */}
      {selectedSe && (
        <RegenerateCadafeModal
          subestacion={selectedSe}
          circuitos={circuitosAsociados}
          estructuraActual={estructura}
          isOpen={isRegenerateModalOpen}
          onClose={() => setIsRegenerateModalOpen(false)}
          onConfirm={handleConfirmRegenerate}
        />
      )}

      {/* Modales de Control Operativo */}
      <FaultModal
        componente={compToFault}
        onClose={() => setCompToFault(null)}
        onConfirm={handleConfirmFault}
      />

      <RestoreModal
        componente={compToRestore}
        onClose={() => setCompToRestore(null)}
        onConfirm={handleConfirmRestore}
      />

      <ComponentModal
        componente={compToInspect}
        onClose={() => setCompToInspect(null)}
        onSave={handleSaveComponent}
      />
    </>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <SigadDashboard />
      </AuthProvider>
    </ThemeProvider>
  );
}
