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
import { LoginForm } from './components/LoginForm';
import { IsoAuditBadge } from './components/IsoAuditBadge';
import { UserProfile } from './types';
import { getInitialUser, logoutUser } from './services/authService';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => getInitialUser());
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('scppe_theme');
    return saved === 'dark';
  });

  useEffect(() => {
    localStorage.setItem('scppe_theme', darkMode ? 'dark' : 'light');
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const handleLogout = () => {
    logoutUser();
    setCurrentUser(null);
  };

  const handleLoginSuccess = (user: UserProfile) => {
    setCurrentUser(user);
  };

  if (!currentUser) {
    return (
      <LoginForm
        onLoginSuccess={handleLoginSuccess}
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode(!darkMode)}
      />
    );
  }

  return (
    <div className={`min-h-screen flex flex-col font-sans selection:bg-red-600 selection:text-white transition-colors ${
      darkMode ? 'dark bg-[#041426] text-slate-100' : 'bg-slate-50 text-slate-900'
    }`}>
      <Navbar
        currentUser={currentUser}
        onOpenLogin={() => {}}
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

      <IsoAuditBadge onGoToAudit={() => setActiveTab('auditoria')} />
    </div>
  );
}


