import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { MobileNav } from './components/MobileNav';
import { ChatAssistant } from './components/ChatAssistant';
import { AdmissionsGuide } from './components/AdmissionsGuide';
import { CampusNavigator } from './components/CampusNavigator';
import { CourseCatalog } from './components/CourseCatalog';
import { FacultyDirectory } from './components/FacultyDirectory';
import { OfflineHub } from './components/OfflineHub';
import { AppTab, UserRole } from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<AppTab>(() => {
    const saved = localStorage.getItem('abuad_active_tab') as AppTab;
    return saved || 'chat';
  });

  const [userRole, setUserRole] = useState<UserRole>(() => {
    const saved = localStorage.getItem('abuad_user_role') as UserRole;
    return saved || 'applicant';
  });

  const [aiInitialQuery, setAiInitialQuery] = useState<string>('');

  useEffect(() => {
    localStorage.setItem('abuad_active_tab', activeTab);
  }, [activeTab]);

  useEffect(() => {
    localStorage.setItem('abuad_user_role', userRole);
  }, [userRole]);

  const handleAskAI = (query: string) => {
    setAiInitialQuery(query);
    setActiveTab('chat');
  };

  return (
    <div className="min-h-screen bg-[#050D08] text-slate-200 flex flex-col font-['Plus_Jakarta_Sans',sans-serif] antialiased selection:bg-emerald-600 selection:text-white">
      {/* Desktop & Tablet Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        userRole={userRole}
        setUserRole={setUserRole}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-4 pb-20 md:pb-8">
        {activeTab === 'chat' && (
          <ChatAssistant
            setActiveTab={setActiveTab}
            userRole={userRole}
            initialQuery={aiInitialQuery}
          />
        )}

        {activeTab === 'admissions' && (
          <AdmissionsGuide
            setActiveTab={setActiveTab}
            onAskAI={handleAskAI}
          />
        )}

        {activeTab === 'campus' && (
          <CampusNavigator
            setActiveTab={setActiveTab}
            onAskAI={handleAskAI}
          />
        )}

        {activeTab === 'courses' && (
          <CourseCatalog
            setActiveTab={setActiveTab}
            onAskAI={handleAskAI}
          />
        )}

        {activeTab === 'directory' && (
          <FacultyDirectory
            setActiveTab={setActiveTab}
            onAskAI={handleAskAI}
          />
        )}

        {activeTab === 'offline' && (
          <OfflineHub
            setActiveTab={setActiveTab}
            onAskAI={handleAskAI}
          />
        )}
      </main>

      {/* Mobile Bottom Navigation (iOS & Android) */}
      <MobileNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />
    </div>
  );
}
