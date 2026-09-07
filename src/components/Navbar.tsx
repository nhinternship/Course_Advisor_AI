import React, { useState, useEffect } from 'react';
import { 
  GraduationCap, 
  Search, 
  PhoneCall, 
  Wifi, 
  WifiOff, 
  BookOpen, 
  Compass, 
  MessageSquare, 
  Users, 
  HardDriveDownload,
  CheckCircle2,
  Sparkles,
  School,
  X
} from 'lucide-react';
import { AppTab, UserRole } from '../types';

interface NavbarProps {
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  onOpenEmergency?: () => void;
  onOpenSearch?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  userRole,
  setUserRole,
  onOpenEmergency,
  onOpenSearch,
}) => {
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const navItems: { id: AppTab; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'chat', label: 'AI Assistant', icon: MessageSquare },
    { id: 'admissions', label: 'Admissions & Guide', icon: GraduationCap },
    { id: 'campus', label: 'Campus Map & Nav', icon: Compass },
    { id: 'courses', label: 'Course Catalog', icon: BookOpen },
    { id: 'directory', label: 'Faculty Directory', icon: Users },
    { id: 'offline', label: 'Offline Hub', icon: HardDriveDownload },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#08150D]/95 backdrop-blur-md border-b border-emerald-900/30 text-white shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
      {/* Top Notification / Role Switcher Bar */}
      <div className="bg-gradient-to-r from-[#030905] via-[#08150D] to-[#040c07] px-4 py-1.5 text-xs border-b border-emerald-900/40">
        <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center space-x-2">
            <span className="inline-flex items-center gap-1.5 font-medium text-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]"></span>
              Afe Babalola University, Ado-Ekiti (ABUAD)
            </span>
            <span className="hidden sm:inline text-emerald-800">|</span>
            <span className="hidden sm:inline text-emerald-400/80">Exemplary Leadership in Education</span>
          </div>

          <div className="flex items-center space-x-3">
            {/* Online / Offline badge */}
            <div 
              onClick={() => setActiveTab('offline')}
              className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium cursor-pointer transition-all ${
                isOnline 
                  ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-700/50 hover:bg-emerald-900/80 shadow-[0_0_10px_rgba(16,185,129,0.2)]' 
                  : 'bg-amber-950/80 text-amber-300 border border-amber-600/40'
              }`}
              title={isOnline ? 'System is online & connected to cloud AI' : 'Offline mode active. Using cached records'}
            >
              {isOnline ? <Wifi className="w-3 h-3 text-emerald-400" /> : <WifiOff className="w-3 h-3 text-amber-400" />}
              <span>{isOnline ? 'Live AI Cloud' : 'Offline Cache'}</span>
            </div>

            {/* Role Switcher Pill */}
            <div className="bg-[#0c1e13] p-0.5 rounded-lg border border-emerald-900/60 flex items-center">
              <button
                id="role-applicant-btn"
                onClick={() => setUserRole('applicant')}
                className={`px-2.5 py-0.5 rounded-md text-[11px] font-semibold transition-all ${
                  userRole === 'applicant'
                    ? 'bg-emerald-600 text-white shadow-[0_0_10px_rgba(16,185,129,0.3)]'
                    : 'text-emerald-300/70 hover:text-emerald-100'
                }`}
              >
                Prospective Applicant
              </button>
              <button
                id="role-student-btn"
                onClick={() => setUserRole('student')}
                className={`px-2.5 py-0.5 rounded-md text-[11px] font-semibold transition-all ${
                  userRole === 'student'
                    ? 'bg-emerald-600 text-white shadow-[0_0_10px_rgba(16,185,129,0.3)]'
                    : 'text-emerald-300/70 hover:text-emerald-100'
                }`}
              >
                Current Student
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div 
            className="flex items-center gap-3 cursor-pointer select-none group"
            onClick={() => setActiveTab('chat')}
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-800 via-emerald-600 to-teal-500 flex items-center justify-center shadow-[0_0_15px_rgba(5,150,105,0.4)] group-hover:scale-105 transition-transform border border-emerald-400/40">
              <School className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold tracking-tight text-lg text-white font-['Outfit']">ABUAD</span>
                <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 shadow-[0_0_8px_rgba(245,158,11,0.3)]">
                  ASSISTANT
                </span>
              </div>
              <p className="text-[11px] text-emerald-300/70 tracking-wide font-medium">Virtual Campus & Academic Guide</p>
            </div>
          </div>

          {/* Desktop Nav Tabs */}
          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-tab-${item.id}`}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-[0_0_12px_rgba(16,185,129,0.35)] font-semibold border border-emerald-400/30'
                      : 'text-slate-300 hover:text-white hover:bg-emerald-950/40'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-emerald-400/80'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center space-x-2">
            {/* Quick Search */}
            <button
              id="global-search-btn"
              onClick={onOpenSearch || (() => setActiveTab('courses'))}
              className="p-2 text-emerald-300 hover:text-white hover:bg-emerald-950/50 rounded-lg transition-colors border border-emerald-900/40 flex items-center gap-2"
              title="Search campus, courses, or guides"
            >
              <Search className="w-4 h-4 text-emerald-300" />
              <span className="hidden xl:inline text-xs text-emerald-400/80">Search (⌘K)</span>
            </button>

            {/* Emergency Hotline Button */}
            <button
              id="emergency-hotline-btn"
              onClick={onOpenEmergency || (() => setActiveTab('offline'))}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-rose-600/90 hover:bg-rose-600 text-white transition-all shadow-md shadow-rose-900/30 animate-pulse hover:animate-none border border-rose-500/40"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Emergency</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
