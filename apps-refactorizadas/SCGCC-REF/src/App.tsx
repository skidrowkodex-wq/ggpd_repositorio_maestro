import React, { useState, useEffect } from 'react';
import { useAuth } from './lib/authContext';
import { Navbar, ActiveTabType } from './components/Navbar';
import { LoginForm } from './components/LoginForm';
import { CorrespondenceDashboard } from './components/CorrespondenceDashboard';
import { RegistryTable } from './components/RegistryTable';
import { SignatureDispatchHub } from './components/SignatureDispatchHub';
import { SmartRadicationModal } from './components/SmartRadicationModal';
import { TaskDerivationModal } from './components/TaskDerivationModal';
import { DocumentDetailModal } from './components/DocumentDetailModal';
import { ResponseDraftModal } from './components/ResponseDraftModal';
import { ExecutiveBriefing360Modal } from './components/ExecutiveBriefing360Modal';
import { CorporateTemplatesView } from './components/CorporateTemplatesModal';
import { AdminQAModal } from './components/AdminQAModal';
import { INITIAL_CORRESPONDENCIAS } from './data/initialCorrespondencias';
import { fetchLiveCorrespondencias } from './services/insforgeService';
import { CorrespondenciaRecord, EstadoTramite, OficioRespuesta, EstadoFirma } from './types';

export const App: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState<ActiveTabType>('dashboard');

  // Correspondencias State with localStorage persistence and live DB sync
  const [records, setRecords] = useState<CorrespondenciaRecord[]>(() => {
    const saved = localStorage.getItem('scgcc_records_v2');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.length > 0 ? parsed : INITIAL_CORRESPONDENCIAS;
      } catch {
        return INITIAL_CORRESPONDENCIAS;
      }
    }
    return INITIAL_CORRESPONDENCIAS;
  });

  // Background Live DB Hydration
  useEffect(() => {
    const syncFromDatabase = async () => {
      try {
        const result = await fetchLiveCorrespondencias();
        if (result.success && result.data && result.data.length > 0) {
          setRecords(result.data);
        }
      } catch (err) {
        console.warn('Live InsForge BaaS sync failed, retaining local store:', err);
      }
    };
    syncFromDatabase();
  }, []);

  useEffect(() => {
    localStorage.setItem('scgcc_records_v2', JSON.stringify(records));
  }, [records]);

  // Modals state
  const [isRadicacionOpen, setIsRadicacionOpen] = useState(false);
  const [isQAModalOpen, setIsQAModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<CorrespondenciaRecord | null>(null);
  const [derivationRecord, setDerivationRecord] = useState<CorrespondenciaRecord | null>(null);
  const [draftRecord, setDraftRecord] = useState<CorrespondenciaRecord | null>(null);
  const [briefingRecord, setBriefingRecord] = useState<CorrespondenciaRecord | null>(null);
  const [isBriefingModalOpen, setIsBriefingModalOpen] = useState(false);

  // Compute Next Correlativo
  const nextCorrelativoNumber = records.length + 1;
  const nextCorrelativo = `RAD-GGPD-2026-${String(nextCorrelativoNumber).padStart(4, '0')}`;

  // Compute Pending Signatures Count for badge
  const pendingSignaturesCount = records.filter(
    r => r.oficioRespuestaDetalle?.estadoFirma === 'PENDIENTE_FIRMA'
  ).length;

  const handleRadicar = (newRecord: CorrespondenciaRecord) => {
    setRecords(prev => [newRecord, ...prev]);
    setActiveTab('registro');
  };

  const handleStatusChange = (recordId: string, newStatus: EstadoTramite) => {
    setRecords(prev => prev.map(r => {
      if (r.id === recordId) {
        return { ...r, estadoTramite: newStatus, updatedAt: new Date().toISOString() };
      }
      return r;
    }));
    if (selectedRecord && selectedRecord.id === recordId) {
      setSelectedRecord(prev => prev ? { ...prev, estadoTramite: newStatus } : null);
    }
  };

  const handleDeriveTask = (
    correspondenciaId: string, 
    taskTitle: string, 
    assignee: string, 
    deadline: string
  ) => {
    const generatedTaskId = `T-2026-${String(Math.floor(Math.random() * 900) + 100)}`;
    setRecords(prev => prev.map(r => {
      if (r.id === correspondenciaId) {
        return {
          ...r,
          estadoTramite: 'ASIGNADO_CON_TAREA',
          tareaScmtpId: generatedTaskId,
          tareaScmtpTitulo: taskTitle,
          responsableAsignado: assignee,
          fechaLimiteRespuesta: deadline,
          updatedAt: new Date().toISOString()
        };
      }
      return r;
    }));
  };

  const handleSaveDraft = (correspondenciaId: string, oficio: OficioRespuesta) => {
    const newDocState: EstadoTramite = 
      oficio.estadoFirma === 'PENDIENTE_FIRMA' 
        ? 'PENDIENTE_FIRMA' 
        : oficio.estadoFirma === 'FIRMADO_FISICO' 
        ? 'FIRMADO_FISICO' 
        : oficio.estadoFirma === 'DESPACHADO_CON_ACUSE'
        ? 'RESPONDIDO'
        : 'EN_REVISION';

    setRecords(prev => prev.map(r => {
      if (r.id === correspondenciaId) {
        return {
          ...r,
          estadoTramite: newDocState,
          oficioRespuestaDetalle: oficio,
          updatedAt: new Date().toISOString()
        };
      }
      return r;
    }));
  };

  const handleUpdateOficioState = (correspondenciaId: string, newOficioState: EstadoFirma, additionalData?: any) => {
    setRecords(prev => prev.map(r => {
      if (r.id === correspondenciaId && r.oficioRespuestaDetalle) {
        const updatedOficio: OficioRespuesta = {
          ...r.oficioRespuestaDetalle,
          estadoFirma: newOficioState,
          ...additionalData
        };

        const newDocState: EstadoTramite = 
          newOficioState === 'DESPACHADO_CON_ACUSE' 
            ? 'RESPONDIDO' 
            : newOficioState === 'FIRMADO_FISICO' 
            ? 'FIRMADO_FISICO' 
            : r.estadoTramite;

        return {
          ...r,
          estadoTramite: newDocState,
          oficioRespuestaDetalle: updatedOficio,
          updatedAt: new Date().toISOString()
        };
      }
      return r;
    }));
  };

  const handleOpenBriefing = (record: CorrespondenciaRecord) => {
    setBriefingRecord(record);
    setIsBriefingModalOpen(true);
  };

  const handleSyncWithDB = (liveData: CorrespondenciaRecord[]) => {
    setRecords(liveData);
  };

  const handleResetToCanonical = () => {
    setRecords(INITIAL_CORRESPONDENCIAS);
    localStorage.setItem('scgcc_records_v2', JSON.stringify(INITIAL_CORRESPONDENCIAS));
  };

  if (!isAuthenticated) {
    return <LoginForm />;
  }

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-[#041426] text-slate-900 dark:text-slate-100 transition-colors duration-200 flex flex-col justify-between">
      <div>
        {/* Navbar */}
        <Navbar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onOpenRadicacionModal={() => setIsRadicacionOpen(true)}
          onOpenQAModal={() => setIsQAModalOpen(true)}
          pendingSignaturesCount={pendingSignaturesCount}
        />

        {/* Main Content Area */}
        <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
          {activeTab === 'dashboard' && (
            <CorrespondenceDashboard
              records={records}
              onFilterByStatus={() => setActiveTab('registro')}
              onOpenRadicacion={() => setIsRadicacionOpen(true)}
            />
          )}

          {activeTab === 'registro' && (
            <RegistryTable
              records={records}
              onSelectRecord={(rec) => setSelectedRecord(rec)}
              onDerivarTarea={(rec) => setDerivationRecord(rec)}
              onOpenRadicacion={() => setIsRadicacionOpen(true)}
              onOpenDraft={(rec) => setDraftRecord(rec)}
              onOpenBriefing={(rec) => handleOpenBriefing(rec)}
            />
          )}

          {activeTab === 'firmas' && (
            <SignatureDispatchHub
              records={records}
              onOpenDraftModal={(rec) => setDraftRecord(rec)}
              onUpdateOficioState={handleUpdateOficioState}
              onSelectRecordForBriefing={(rec) => handleOpenBriefing(rec)}
            />
          )}

          {activeTab === 'briefing360' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-amber-500/20 via-purple-500/20 to-indigo-500/20 border border-amber-500/40 p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-base font-black text-amber-900 dark:text-amber-200">
                    Modo Reunión & Ficha Ejecutiva 360° Activo
                  </h2>
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    Seleccione cualquier trámite para visualizar la trazabilidad instantánea de punta a punta.
                  </p>
                </div>
                <button
                  onClick={() => setIsBriefingModalOpen(true)}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow-md shrink-0 active:scale-95 transition-all"
                >
                  Abrir Buscador 360°
                </button>
              </div>

              <RegistryTable
                records={records}
                onSelectRecord={(rec) => handleOpenBriefing(rec)}
                onDerivarTarea={(rec) => setDerivationRecord(rec)}
                onOpenRadicacion={() => setIsRadicacionOpen(true)}
                onOpenDraft={(rec) => setDraftRecord(rec)}
                onOpenBriefing={(rec) => handleOpenBriefing(rec)}
              />
            </div>
          )}

          {activeTab === 'plantillas' && (
            <CorporateTemplatesView />
          )}
        </main>
      </div>

      {/* Footer Institucional de Grado Industrial */}
      <footer className="border-t border-slate-200 dark:border-purple-950/60 bg-white dark:bg-[#072146] py-6 text-center text-xs text-slate-500 dark:text-slate-400 font-mono">
        <div className="max-w-7xl mx-auto px-4 space-y-3">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
            <span className="font-bold text-slate-800 dark:text-slate-200">
              CORPOELEC • Gerencia General de Planificación de Distribución (GGPD)
            </span>
            <span className="text-purple-600 dark:text-purple-400 font-black">
              SCGCC V1.0 • GESTIÓN DE CORRESPONDENCIA CORPORATIVA & DESPACHO
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[11px] text-slate-400 dark:text-slate-500 pt-1 border-t border-slate-100 dark:border-slate-800/80">
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">✓ ZONA SEGURA CIFRADA</span>
            <span>•</span>
            <span>ISO/IEC 27001:2022</span>
            <span>•</span>
            <span>ISO 8000-110 Calidad de Datos</span>
            <span>•</span>
            <span>ISO 15489-1:2016 Custodia SHA-256</span>
            <span>•</span>
            <span>OWASP ASVS v4.0 Level 2</span>
            <span>•</span>
            <span>ISACA COBIT MEA02</span>
          </div>

          <div className="text-[10px] text-slate-400 dark:text-slate-500">
            Plataforma desarrollada e impulsada con Inteligencia Artificial Avanzada (Google Antigravity / Gemini Flash AI), diseñada bajo estándares de ingeniería eléctrica y gestión documental de grado industrial para la toma de decisiones estratégicas del SEN.
          </div>
        </div>
      </footer>

      {/* Modals */}
      <SmartRadicationModal
        isOpen={isRadicacionOpen}
        onClose={() => setIsRadicacionOpen(false)}
        onRadicar={handleRadicar}
        nextCorrelativo={nextCorrelativo}
      />

      <TaskDerivationModal
        isOpen={!!derivationRecord}
        onClose={() => setDerivationRecord(null)}
        record={derivationRecord}
        onDeriveTask={handleDeriveTask}
      />

      <DocumentDetailModal
        isOpen={!!selectedRecord}
        onClose={() => setSelectedRecord(null)}
        record={selectedRecord}
        onDerivar={(rec) => setDerivationRecord(rec)}
        onStatusChange={handleStatusChange}
        onOpenDraft={(rec) => setDraftRecord(rec)}
        onOpenBriefing={(rec) => handleOpenBriefing(rec)}
      />

      <ResponseDraftModal
        isOpen={!!draftRecord}
        onClose={() => setDraftRecord(null)}
        record={draftRecord}
        onSaveDraft={handleSaveDraft}
      />

      <ExecutiveBriefing360Modal
        isOpen={isBriefingModalOpen}
        onClose={() => {
          setIsBriefingModalOpen(false);
          setBriefingRecord(null);
        }}
        record={briefingRecord}
        allRecords={records}
        onSelectRecord={(rec) => setBriefingRecord(rec)}
      />

      {/* QA & Database Governance Modal (Admin & Supervisor Only) */}
      <AdminQAModal
        isOpen={isQAModalOpen}
        onClose={() => setIsQAModalOpen(false)}
        recordsCount={records.length}
        onSyncWithDB={handleSyncWithDB}
        onResetToCanonical={handleResetToCanonical}
      />
    </div>
  );
};
