import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { HeaderInstitutional } from './components/HeaderInstitutional';
import { Navbar } from './components/Navbar';
import { SidebarNav } from './components/SidebarNav';
import { MobileBottomNav } from './components/MobileBottomNav';
import { LandingPage } from './components/LandingPage';
import { DashboardPortal } from './components/DashboardPortal';
import { FooterInstitutional } from './components/FooterInstitutional';
import { AuthModal } from './components/AuthModal';

const MainLayout: React.FC = () => {
  const { session } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('apps');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#070f1e] text-slate-900 dark:text-slate-100 flex flex-col justify-between selection:bg-[#002b49] selection:text-white dark:selection:bg-[#00f2fe] dark:selection:text-[#0a192f] transition-colors">
      
      {/* Collapsible Sidebar Navigation for Authenticated Users */}
      {session.authenticated && (
        <SidebarNav
          activeSection={activeSection}
          setActiveSection={setActiveSection}
          isCollapsed={isSidebarCollapsed}
          setIsCollapsed={setIsSidebarCollapsed}
          isMobileOpen={isMobileMenuOpen}
          setIsMobileOpen={setIsMobileMenuOpen}
        />
      )}

      {/* Main Layout Area with Dynamic Left Padding for Sidebar */}
      <div className={`flex-1 flex flex-col justify-between transition-all duration-300 ${
        session.authenticated 
          ? (isSidebarCollapsed ? 'lg:pl-20' : 'lg:pl-64') 
          : 'pl-0'
      }`}>
        <div>
          {/* Official Government & Institutional Header */}
          <HeaderInstitutional />

          {/* Industrial Navigation Header Bar */}
          <Navbar
            onOpenAuthModal={() => setIsAuthModalOpen(true)}
            activeSection={activeSection}
            setActiveSection={setActiveSection}
            onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
            isSidebarCollapsed={isSidebarCollapsed}
          />

          {/* Main Content View Container */}
          <main className="mx-auto max-w-7xl px-3 sm:px-6 pb-16 lg:pb-6">
            {session.authenticated ? (
              <DashboardPortal
                activeSection={activeSection}
                setActiveSection={setActiveSection}
              />
            ) : (
              <LandingPage
                onOpenAuth={() => setIsAuthModalOpen(true)}
              />
            )}
          </main>
        </div>

        {/* Official Institutional Footer */}
        <FooterInstitutional />
      </div>

      {/* Sticky Bottom Navigation Bar for Mobile Smartphones */}
      <MobileBottomNav
        activeSection={activeSection}
        setActiveSection={setActiveSection}
      />

      {/* Auth Login Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={() => setActiveSection('apps')}
      />

    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <MainLayout />
    </AuthProvider>
  );
};

export default App;
