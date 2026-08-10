import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './lib/authContext';
import { ThemeProvider, useTheme } from './lib/themeContext';
import { Navbar } from './components/Navbar';
import { LoginForm } from './components/LoginForm';
import { DashboardTab } from './components/tabs/DashboardTab';
import { ExcelIngestionTab } from './components/tabs/ExcelIngestionTab';
import { InventoryTab } from './components/tabs/InventoryTab';
import { RemediationTab } from './components/tabs/RemediationTab';
import { AuditTab } from './components/tabs/AuditTab';
import { UserManagementTab } from './components/tabs/UserManagementTab';
import { EquipmentRecord } from './types';
import { RefreshCw, Zap } from 'lucide-react';

function MainApp() {
  const { user, loading: authLoading } = useAuth();
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const [records, setRecords] = useState<EquipmentRecord[]>([]);
  const [dataLoading, setDataLoading] = useState<boolean>(true);

  useEffect(() => {
    if (user) {
      fetchEquipmentRecords();
    }
  }, [user]);

  const fetchEquipmentRecords = async () => {
    setDataLoading(true);
    try {
      const res = await fetch('/api/equipment');
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setRecords(data.data);
      }
    } catch (err) {
      console.error('Error cargando equipos:', err);
    } finally {
      setDataLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-100 text-slate-800 dark:bg-slate-950 dark:text-slate-100 flex flex-col items-center justify-center space-y-4">
        <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-sky-600 via-sky-700 to-red-600 flex items-center justify-center text-white shadow-lg shadow-sky-500/20 animate-pulse">
          <Zap className="w-6 h-6 fill-current" />
        </div>
        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 text-xs font-medium">
          <RefreshCw className="w-4 h-4 animate-spin text-sky-600 dark:text-sky-400" />
          <span>Iniciando plataforma SCEIN CORPOELEC...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginForm />;
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 dark:bg-slate-950 dark:text-slate-100 flex flex-col lg:flex-row font-sans antialiased selection:bg-sky-500 selection:text-white transition-colors duration-200">
      {/* Corporate Responsive Sidebar & Navigation */}
      <Navbar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen overflow-x-hidden">
        <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 py-6 space-y-6">
          {activeTab === 'dashboard' && (
            <DashboardTab records={records} loading={dataLoading} />
          )}

          {activeTab === 'ingestion' && (
            <ExcelIngestionTab onIngestSuccess={fetchEquipmentRecords} />
          )}

          {activeTab === 'inventory' && (
            <InventoryTab 
              records={records} 
              loading={dataLoading} 
              onRefreshNeeded={fetchEquipmentRecords} 
            />
          )}

          {activeTab === 'remediation' && (
            <RemediationTab 
              records={records} 
              onRemediationDone={fetchEquipmentRecords} 
            />
          )}

          {activeTab === 'audit' && (
            <AuditTab />
          )}

          {activeTab === 'users' && user.role === 'ADMIN_NACIONAL' && (
            <UserManagementTab />
          )}
        </main>

        {/* Footer */}
        <footer className="border-t border-slate-200 bg-white/80 dark:border-slate-900 dark:bg-slate-950/80 py-4 text-center text-xs text-slate-500 dark:text-slate-400 mt-auto transition-colors">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex flex-col items-start text-left gap-1">
              <span className="font-semibold text-slate-800 dark:text-slate-300">CORPOELEC • Corporación Eléctrica Nacional — GGPD</span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400">
                Desarrollado sobre el stack de Google AI Studio, Gemini, Antigravity y Supabase PostgreSQL *(Referencia de arquitectura técnica; no implica patrocinio oficial)*.
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="font-mono text-slate-500 dark:text-slate-400 text-right">SCEIN v1.0.0 • DB: <strong className="text-sky-600 dark:text-cyan-400">scei</strong> (Supabase)</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <MainApp />
      </AuthProvider>
    </ThemeProvider>
  );
}
