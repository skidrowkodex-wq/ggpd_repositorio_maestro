import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './lib/authContext';
import { ThemeProvider } from './lib/themeContext';
import { LoginForm } from './components/LoginForm';
import { AppShell, SigaSenTab } from './components/Navbar';
import { NodosPatiosSenView } from './components/NodosPatiosSenView';
import { CentralesGeneracionView } from './components/CentralesGeneracionView';
import { BalanceSenView } from './components/BalanceSenView';
import { AtlasUnifilarCndView } from './components/AtlasUnifilarCndView';
import { UnifilarActivoSenView } from './components/UnifilarActivoSenView';
import { sigaSenService } from './services/sigaSenService';
import { CheckCircle2 } from 'lucide-react';

function SigaSenDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<SigaSenTab>('activos');
  const [selectedCodigoSubestacion, setSelectedCodigoSubestacion] = useState<string>('CND-EL-CONVENTO');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [, setDbVersion] = useState<number>(0);

  useEffect(() => {
    const unsub = sigaSenService.subscribe(() => {
      setDbVersion((v) => v + 1);
    });
    sigaSenService.syncFromInsforge();
    return () => unsub();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 4000);
  };

  const handleVerUnifilar = (codigo: string) => {
    setSelectedCodigoSubestacion(codigo);
    setActiveTab('unifilar_activo');
  };

  if (!user) {
    return <LoginForm onLoginSuccess={() => showToast('Sesión segura iniciada en SIGA-SEN')} />;
  }

  return (
    <>
      {/* Notificación flotante (Toast) */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-[70] max-w-[calc(100vw-2rem)] bg-emerald-500 text-slate-950 px-4 py-3 rounded-xl font-bold shadow-2xl flex items-center gap-2 text-xs animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-slate-950 shrink-0" />
          <span className="truncate">{toastMessage}</span>
        </div>
      )}

      {/* Estructura con rail lateral (≥1024px) / drawer off-canvas (<1024px) */}
      <AppShell activeTab={activeTab} setActiveTab={setActiveTab}>
        {activeTab === 'activos' && (
          <NodosPatiosSenView onVerUnifilar={handleVerUnifilar} />
        )}
        {activeTab === 'generacion' && <CentralesGeneracionView />}
        {activeTab === 'diagnostico' && <BalanceSenView />}
        {activeTab === 'atlas' && <AtlasUnifilarCndView />}
        {activeTab === 'unifilar_activo' && (
          <UnifilarActivoSenView initialCodigo={selectedCodigoSubestacion} />
        )}
      </AppShell>
    </>
  );
}

export function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <SigaSenDashboard />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
