import { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Sidebar, TabType } from './components/Sidebar';
import { DashboardOverview } from './components/DashboardOverview';
import { PrtsenProjectsView } from './components/PrtsenProjectsView';
import { RdsPsExplorerView } from './components/RdsPsExplorerView';
import { PoaBudgetView } from './components/PoaBudgetView';
import { GgdProyectosView } from './components/GgdProyectosView';
import { ViaticosControlView } from './components/ViaticosControlView';
import { IsoAuditView } from './components/IsoAuditView';
import { LoginModal } from './components/LoginModal';
import { IsoAuditBadge } from './components/IsoAuditBadge';
import { UserProfile } from './types';
import { getInitialUser, logoutUser } from './services/authService';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => getInitialUser());
  const [showLoginModal, setShowLoginModal] = useState(() => getInitialUser() === null);
  const [darkMode, setDarkMode] = useState(true); // Tema Oscuro Glassmorphism por defecto

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const handleLogout = () => {
    logoutUser();
    setCurrentUser(null);
    setShowLoginModal(true);
  };

  const handleLoginSuccess = (user: UserProfile) => {
    setCurrentUser(user);
    setShowLoginModal(false);
  };

  return (
    <div className={`min-h-screen flex flex-col font-sans selection:bg-red-600 selection:text-white transition-colors ${
      darkMode ? 'dark bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'
    }`}>
      <Navbar
        currentUser={currentUser}
        onOpenLogin={() => setShowLoginModal(true)}
        onLogout={handleLogout}
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode(!darkMode)}
      />

      <div className="flex-1 flex overflow-hidden">
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          userRole={currentUser?.rol}
        />

        <main className="flex-1 p-6 md:p-8 overflow-y-auto max-w-7xl mx-auto w-full">
          {activeTab === 'dashboard' && <DashboardOverview />}
          {activeTab === 'prtsen' && <PrtsenProjectsView />}
          {activeTab === 'rds' && <RdsPsExplorerView />}
          {activeTab === 'poa' && <PoaBudgetView />}
          {activeTab === 'ggd' && <GgdProyectosView />}
          {activeTab === 'viaticos' && <ViaticosControlView />}
          {activeTab === 'auditoria' && currentUser?.rol !== 'ANALISTA' && <IsoAuditView />}
        </main>
      </div>

      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onLoginSuccess={handleLoginSuccess}
        darkMode={darkMode}
      />

      <IsoAuditBadge onGoToAudit={() => setActiveTab('auditoria')} />
    </div>
  );
}


