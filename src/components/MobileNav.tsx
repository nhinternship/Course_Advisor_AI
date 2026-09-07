import React from 'react';
import { 
  MessageSquare, 
  GraduationCap, 
  Compass, 
  BookOpen, 
  Users, 
  HardDriveDownload 
} from 'lucide-react';
import { AppTab } from '../types';

interface MobileNavProps {
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: 'chat' as AppTab, label: 'Assistant', icon: MessageSquare },
    { id: 'admissions' as AppTab, label: 'Admissions', icon: GraduationCap },
    { id: 'campus' as AppTab, label: 'Campus Map', icon: Compass },
    { id: 'courses' as AppTab, label: 'Courses', icon: BookOpen },
    { id: 'directory' as AppTab, label: 'Directory', icon: Users },
    { id: 'offline' as AppTab, label: 'Offline', icon: HardDriveDownload },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#050D08]/95 backdrop-blur-lg border-t border-emerald-900/40 px-2 py-1.5 safe-area-pb shadow-[0_-4px_20px_rgba(0,0,0,0.6)]">
      <div className="grid grid-cols-6 gap-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              id={`mobile-tab-${tab.id}`}
              onClick={() => {
                setActiveTab(tab.id);
                // Simple vibration for mobile feel if supported
                if ('vibrate' in navigator) {
                  try { navigator.vibrate(15); } catch (_) {}
                }
              }}
              className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all ${
                isActive
                  ? 'text-emerald-300 font-bold bg-[#0c1e13] border border-emerald-700/50 shadow-[0_0_10px_rgba(16,185,129,0.2)]'
                  : 'text-slate-400 hover:text-emerald-200'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'text-emerald-400 scale-110' : 'text-slate-400'}`} />
                {isActive && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-[#050D08] shadow-[0_0_6px_#34d399]"></span>
                )}
              </div>
              <span className="text-[10px] mt-1 tracking-tight truncate max-w-full">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
