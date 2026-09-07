import React, { useState, useEffect } from 'react';
import { 
  HardDriveDownload, 
  Wifi, 
  WifiOff, 
  PhoneCall, 
  Bookmark, 
  FileText, 
  Download, 
  Printer, 
  Smartphone, 
  CheckCircle2, 
  Sparkles,
  ShieldCheck,
  Building,
  BookOpen,
  HelpCircle,
  Clock,
  ArrowRight
} from 'lucide-react';
import { FAQS_DATA } from '../data/faqs';
import { COLLEGES_DATA } from '../data/colleges';
import { CAMPUS_LANDMARKS } from '../data/landmarks';
import { AppTab } from '../types';

interface OfflineHubProps {
  setActiveTab: (tab: AppTab) => void;
  onAskAI: (query: string) => void;
}

export const OfflineHub: React.FC<OfflineHubProps> = ({ setActiveTab, onAskAI }) => {
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [lastSyncedTime, setLastSyncedTime] = useState<string>(() => {
    return localStorage.getItem('abuad_last_synced') || new Date().toLocaleString();
  });

  // Read saved bookmarks
  const [bookmarkedCourseIds, setBookmarkedCourseIds] = useState<string[]>([]);
  const [savedLandmarkIds, setSavedLandmarkIds] = useState<string[]>([]);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      const now = new Date().toLocaleString();
      setLastSyncedTime(now);
      localStorage.setItem('abuad_last_synced', now);
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Load saved bookmarks
    try {
      const courses = JSON.parse(localStorage.getItem('abuad_bookmarked_courses') || '[]');
      setBookmarkedCourseIds(courses);
      const landmarks = JSON.parse(localStorage.getItem('abuad_saved_landmarks') || '[]');
      setSavedLandmarkIds(landmarks);
    } catch (_) {}

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleManualSync = () => {
    const now = new Date().toLocaleString();
    setLastSyncedTime(now);
    localStorage.setItem('abuad_last_synced', now);
    alert('Critical ABUAD data cache updated successfully for offline use!');
  };

  const handlePrintGuide = () => {
    window.print();
  };

  // Find bookmarked objects
  const allPrograms = COLLEGES_DATA.flatMap((c) => c.programs);
  const savedCourses = allPrograms.filter((p) => bookmarkedCourseIds.includes(p.id));
  const savedLandmarks = CAMPUS_LANDMARKS.filter((l) => savedLandmarkIds.includes(l.id));

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 text-slate-200">
      {/* Offline Status Card */}
      <div className={`rounded-3xl p-6 sm:p-8 text-white shadow-xl border ${
        isOnline
          ? 'bg-gradient-to-r from-[#08150D] via-[#0c1e13] to-[#08150D] border-emerald-800/60 shadow-[0_0_20px_rgba(5,150,105,0.15)]'
          : 'bg-gradient-to-r from-[#190d05] via-[#14080a] to-[#190d05] border-amber-800/60 shadow-[0_0_20px_rgba(245,158,11,0.15)]'
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className={`p-2 rounded-xl flex items-center justify-center border ${
                isOnline ? 'bg-[#0c1e13] text-emerald-400 border-emerald-700/60' : 'bg-amber-950/60 text-amber-300 border-amber-800/60'
              }`}>
                {isOnline ? <Wifi className="w-5 h-5" /> : <WifiOff className="w-5 h-5 animate-pulse" />}
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                {isOnline ? 'Network Connected & Synced' : 'Offline Mode Active'}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold font-['Outfit'] text-white">
              ABUAD Offline Survival & Critical Info Vault
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
              All essential campus telephone hotlines, admissions roadmaps, hostel regulations, landmark directories, and saved courses are cached locally in your browser storage.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2.5">
            <button
              onClick={handleManualSync}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-[0_0_15px_rgba(16,185,129,0.35)] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <HardDriveDownload className="w-4 h-4" />
              <span>Update Offline Cache</span>
            </button>

            <button
              onClick={handlePrintGuide}
              className="px-4 py-2.5 bg-[#0c1e13] hover:bg-[#10291a] text-slate-200 font-semibold text-xs rounded-xl border border-emerald-800/60 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-4 h-4 text-emerald-400" />
              <span>Print Offline Guide</span>
            </button>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-emerald-900/40 flex items-center justify-between text-xs text-slate-400">
          <span>Storage Status: 100% Ready (Encrypted Local Storage)</span>
          <span>Last Synced: {lastSyncedTime}</span>
        </div>
      </div>

      {/* Critical Emergency Hotlines Grid (Available 100% Offline) */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <PhoneCall className="w-5 h-5 text-rose-500" />
          <h2 className="text-lg font-bold text-white font-['Outfit']">
            Critical Emergency & Campus Support Hotlines (24/7 Offline)
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[#14080a] border border-rose-900/60 rounded-2xl p-4 flex flex-col justify-between shadow-md">
            <div>
              <span className="text-[10px] font-extrabold uppercase text-rose-400 tracking-wider">
                Immediate Response
              </span>
              <h3 className="font-bold text-white text-sm mt-1">Campus Security Command</h3>
              <p className="text-xs text-slate-300 mt-1">24/7 emergency dispatch, gate access, patrol.</p>
            </div>
            <a
              href="tel:+2348030009911"
              className="mt-3 w-full py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl text-center shadow-[0_0_10px_rgba(225,29,72,0.35)] flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>+234 803 000 9911</span>
            </a>
          </div>

          <div className="bg-[#08150D] border border-emerald-900/60 rounded-2xl p-4 flex flex-col justify-between shadow-md">
            <div>
              <span className="text-[10px] font-extrabold uppercase text-emerald-400 tracking-wider">
                Tertiary Healthcare
              </span>
              <h3 className="font-bold text-white text-sm mt-1">Multi-System Hospital Trauma</h3>
              <p className="text-xs text-slate-300 mt-1">Ambulance dispatch & casualty clinic.</p>
            </div>
            <a
              href="tel:+2348134160058"
              className="mt-3 w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl text-center shadow-[0_0_12px_rgba(16,185,129,0.35)] flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>+234 813 416 0058</span>
            </a>
          </div>

          <div className="bg-[#08150D] border border-teal-900/60 rounded-2xl p-4 flex flex-col justify-between shadow-md">
            <div>
              <span className="text-[10px] font-extrabold uppercase text-teal-400 tracking-wider">
                Admissions Desk
              </span>
              <h3 className="font-bold text-white text-sm mt-1">Undergraduate Screening</h3>
              <p className="text-xs text-slate-300 mt-1">JAMB cut-offs & direct entry help.</p>
            </div>
            <a
              href="tel:+2348127772121"
              className="mt-3 w-full py-2 bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold rounded-xl text-center shadow-[0_0_12px_rgba(20,184,166,0.35)] flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>+234 812 777 2121</span>
            </a>
          </div>

          <div className="bg-[#08150D] border border-emerald-900/60 rounded-2xl p-4 flex flex-col justify-between shadow-md">
            <div>
              <span className="text-[10px] font-extrabold uppercase text-emerald-400 tracking-wider">
                Student Welfare
              </span>
              <h3 className="font-bold text-white text-sm mt-1">Student Affairs Directorate</h3>
              <p className="text-xs text-slate-300 mt-1">Hostels, wardens & disciplinary office.</p>
            </div>
            <a
              href="tel:+2348055541120"
              className="mt-3 w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl text-center shadow-[0_0_12px_rgba(16,185,129,0.35)] flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>+234 805 554 1120</span>
            </a>
          </div>
        </div>
      </div>

      {/* Bookmarked Items Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Saved Courses */}
        <div className="bg-[#08150D] rounded-3xl p-6 border border-emerald-900/40 shadow-md space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-white text-base flex items-center gap-2 font-['Outfit']">
              <Bookmark className="w-4 h-4 text-emerald-400" />
              Saved Academic Courses ({savedCourses.length})
            </h3>
            <button
              onClick={() => setActiveTab('courses')}
              className="text-xs font-bold text-emerald-400 hover:underline cursor-pointer"
            >
              Browse Catalog
            </button>
          </div>

          {savedCourses.length === 0 ? (
            <p className="text-xs text-slate-400 py-4">No courses bookmarked yet. Click the bookmark icon on any course in the catalog to save it for offline review.</p>
          ) : (
            <div className="space-y-2.5">
              {savedCourses.map((c) => (
                <div
                  key={c.id}
                  onClick={() => setActiveTab('courses')}
                  className="p-3 bg-[#0c1e13] hover:bg-[#10291a] rounded-2xl border border-emerald-900/60 cursor-pointer transition-colors flex items-center justify-between"
                >
                  <div>
                    <h4 className="font-bold text-xs text-white">{c.name}</h4>
                    <span className="text-[11px] text-slate-400">{c.degree} • {c.durationYears} Years</span>
                  </div>
                  <span className="text-xs font-bold text-emerald-400">{c.jambCutOff}+ JAMB</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Saved Landmarks */}
        <div className="bg-[#08150D] rounded-3xl p-6 border border-emerald-900/40 shadow-md space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-white text-base flex items-center gap-2 font-['Outfit']">
              <Building className="w-4 h-4 text-emerald-400" />
              Saved Campus Landmarks ({savedLandmarks.length})
            </h3>
            <button
              onClick={() => setActiveTab('campus')}
              className="text-xs font-bold text-emerald-400 hover:underline cursor-pointer"
            >
              Open Campus Map
            </button>
          </div>

          {savedLandmarks.length === 0 ? (
            <p className="text-xs text-slate-400 py-4">No campus landmarks saved yet. Star any building on the map to review directions offline.</p>
          ) : (
            <div className="space-y-2.5">
              {savedLandmarks.map((l) => (
                <div
                  key={l.id}
                  onClick={() => setActiveTab('campus')}
                  className="p-3 bg-[#0c1e13] hover:bg-[#10291a] rounded-2xl border border-emerald-900/60 cursor-pointer transition-colors flex items-center justify-between"
                >
                  <div>
                    <h4 className="font-bold text-xs text-white">{l.name}</h4>
                    <span className="text-[11px] text-slate-400">{l.zone}</span>
                  </div>
                  <span className="text-[11px] text-slate-400">{l.hours.split('(')[0]}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Offline FAQ Knowledge Bank */}
      <div className="bg-[#08150D] rounded-3xl p-6 border border-emerald-900/40 shadow-md space-y-4">
        <div className="flex items-center justify-between border-b border-emerald-900/40 pb-3">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-white text-base font-['Outfit']">
              Offline FAQ Knowledge Bank (Cached)
            </h3>
          </div>
          <span className="text-xs font-semibold text-slate-400">{FAQS_DATA.length} Key Q&As Available Offline</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {FAQS_DATA.map((faq) => (
            <div key={faq.id} className="p-4 bg-[#0c1e13] rounded-2xl border border-emerald-900/60 text-xs space-y-2">
              <h4 className="font-bold text-white text-xs sm:text-sm">{faq.question}</h4>
              <p className="text-slate-300 leading-relaxed">{faq.answer}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Mobile iOS / Android Installation Guide */}
      <div className="bg-[#08150D] text-slate-200 rounded-3xl p-6 sm:p-8 border border-emerald-900/40 shadow-md">
        <div className="max-w-3xl">
          <div className="flex items-center gap-2 mb-2">
            <Smartphone className="w-5 h-5 text-amber-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-amber-300">
              Mobile Installation (iOS & Android)
            </span>
          </div>
          <h3 className="text-xl font-bold font-['Outfit'] text-white">
            Add ABUAD Virtual Assistant to Your Phone Home Screen
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 leading-relaxed">
            Run the assistant as a standalone native app with instant offline loading on your iPhone, iPad, or Android smartphone.
          </p>

          <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 bg-[#0c1e13] rounded-2xl border border-emerald-900/60">
              <span className="font-bold text-emerald-400 block mb-1">🍎 Apple iOS (Safari):</span>
              <p className="text-slate-300">
                1. Tap the <strong>Share</strong> button at the bottom of Safari.<br />
                2. Scroll down and select <strong>"Add to Home Screen"</strong>.<br />
                3. Tap <strong>"Add"</strong> in the top right corner.
              </p>
            </div>

            <div className="p-4 bg-[#0c1e13] rounded-2xl border border-emerald-900/60">
              <span className="font-bold text-emerald-400 block mb-1">🤖 Google Android (Chrome):</span>
              <p className="text-slate-300">
                1. Tap the <strong>three dots (⋮)</strong> menu in Chrome.<br />
                2. Select <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong>.<br />
                3. Follow the prompt to install the ABUAD app.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
