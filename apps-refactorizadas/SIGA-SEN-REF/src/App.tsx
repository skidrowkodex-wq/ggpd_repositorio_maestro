import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './lib/authContext';
import { ThemeProvider } from './lib/themeContext';
import { LoginForm } from './components/LoginForm';
import { Navbar, SigaSenTab } from './components/Navbar';
import { Footer } from './components/Footer';
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
    <div className="min-h-screen bg-slate-100/70 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-500 text-slate-950 px-4 py-3 rounded-xl font-bold shadow-2xl flex items-center gap-2 text-xs animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-slate-950" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Navbar Superior con pestañas y conmutador de tema */}
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Contenido Principal */}
      <main className="flex-1 app-container py-6">
        {activeTab === 'activos' && (
          <NodosPatiosSenView onVerUnifilar={handleVerUnifilar} />
        )}
        {activeTab === 'generacion' && <CentralesGeneracionView />}
        {activeTab === 'diagnostico' && <BalanceSenView />}
        {activeTab === 'atlas' && <AtlasUnifilarCndView />}
        {activeTab === 'unifilar_activo' && (
          <UnifilarActivoSenView initialCodigo={selectedCodigoSubestacion} />
        )}
      </main>

      {/* Pie de Página Institucional */}
      <Footer />
    </div>
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
