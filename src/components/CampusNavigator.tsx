import React, { useState, useMemo } from 'react';
import { 
  Compass, 
  MapPin, 
  Navigation, 
  Search, 
  Building, 
  Clock, 
  Phone, 
  Layers, 
  Route, 
  Share2, 
  Bookmark, 
  BookmarkCheck, 
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Stethoscope,
  BookOpen,
  Coffee,
  Info,
  Maximize2
} from 'lucide-react';
import { CAMPUS_LANDMARKS } from '../data/landmarks';
import { CampusLandmark, AppTab } from '../types';

interface CampusNavigatorProps {
  setActiveTab: (tab: AppTab) => void;
  onAskAI: (query: string) => void;
}

export const CampusNavigator: React.FC<CampusNavigatorProps> = ({ setActiveTab, onAskAI }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedLandmark, setSelectedLandmark] = useState<CampusLandmark | null>(CAMPUS_LANDMARKS[0]);
  
  // Route Navigation State
  const [startPointId, setStartPointId] = useState<string>('main-gate');
  const [destPointId, setDestPointId] = useState<string>('abuad-hospital');
  const [showRoute, setShowRoute] = useState<boolean>(false);

  // Saved Landmarks in local storage
  const [savedLandmarkIds, setSavedLandmarkIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('abuad_saved_landmarks');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (_) {}
    }
    return ['abuad-hospital', 'college-of-law'];
  });

  const toggleSave = (id: string) => {
    setSavedLandmarkIds((prev) => {
      const next = prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id];
      localStorage.setItem('abuad_saved_landmarks', JSON.stringify(next));
      return next;
    });
  };

  const categories = [
    { id: 'all', label: 'All Landmarks', icon: Layers },
    { id: 'academic', label: 'Colleges & Libraries', icon: BookOpen },
    { id: 'medical', label: 'Hospital & Clinics', icon: Stethoscope },
    { id: 'hostel', label: 'Hostels & Residence', icon: Building },
    { id: 'recreational', label: 'Sports & TDC', icon: Compass },
    { id: 'dining', label: 'Food & Cafeterias', icon: Coffee },
    { id: 'administrative', label: 'Admin & Gates', icon: ShieldCheck },
  ];

  const filteredLandmarks = useMemo(() => {
    return CAMPUS_LANDMARKS.filter((l) => {
      const matchesSearch = 
        l.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.zone.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || l.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  const startLandmark = CAMPUS_LANDMARKS.find((l) => l.id === startPointId) || CAMPUS_LANDMARKS[0];
  const destLandmark = CAMPUS_LANDMARKS.find((l) => l.id === destPointId) || CAMPUS_LANDMARKS[2];

  // Calculate distance & approximate walking time (in meters and mins)
  const dx = destLandmark.x - startLandmark.x;
  const dy = destLandmark.y - startLandmark.y;
  const estimatedDistanceMeters = Math.round(Math.sqrt(dx * dx + dy * dy) * 12);
  const estimatedWalkMinutes = Math.max(1, Math.round(estimatedDistanceMeters / 75));

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 text-slate-200">
      {/* Header & Search */}
      <div className="bg-[#08150D] rounded-3xl p-6 border border-emerald-900/40 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-[#0c1e13] text-emerald-400 border border-emerald-800/60">
              <Compass className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-bold text-white font-['Outfit']">
              Interactive 2D Campus Navigator & Landmark Map
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Explore Afe Babalola University Ado-Ekiti's 130-hectare world-class campus, find building directions, and locate colleges.
          </p>
        </div>

        <div className="relative min-w-[260px] sm:min-w-[320px]">
          <Search className="w-4 h-4 text-emerald-500/70 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Law Complex, Hospital, Alfa Belgore..."
            className="w-full pl-10 pr-4 py-2.5 bg-[#050D08] border border-emerald-900/60 text-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all placeholder:text-slate-500"
          />
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isActive = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-emerald-600 text-white shadow-[0_0_12px_rgba(16,185,129,0.35)] font-bold border border-emerald-400/40'
                  : 'bg-[#08150D] text-emerald-300/80 hover:bg-[#0c1e13] hover:text-white border border-emerald-900/60'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Grid: Interactive Map + Landmark Inspector & Route Finder */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Interactive 2D SVG Campus Canvas */}
        <div className="lg:col-span-8 bg-[#08150D] rounded-3xl p-4 sm:p-6 text-white shadow-lg border border-emerald-900/40 flex flex-col relative overflow-hidden">
          {/* Map Overlay Controls */}
          <div className="flex items-center justify-between mb-4 z-10">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                ABUAD Master Plan View
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowRoute(!showRoute)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  showRoute
                    ? 'bg-amber-400 text-slate-950 shadow-[0_0_10px_rgba(245,158,11,0.3)]'
                    : 'bg-[#0c1e13] text-slate-300 hover:text-white border border-emerald-800/60'
                }`}
              >
                <Route className="w-3.5 h-3.5" />
                <span>{showRoute ? 'Hide Route' : 'Show Walk Route'}</span>
              </button>
            </div>
          </div>

          {/* SVG Map Canvas */}
          <div className="relative w-full aspect-[4/3] bg-gradient-to-b from-[#050D08] via-[#08150D] to-[#040c07] rounded-2xl border border-emerald-900/60 overflow-hidden select-none">
            <svg
              viewBox="0 0 1000 750"
              className="w-full h-full object-contain"
              style={{ filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.5))' }}
            >
              <defs>
                {/* Grid pattern */}
                <pattern id="campusGrid" width="50" height="50" patternUnits="userSpaceOnUse">
                  <path d="M 50 0 L 0 0 0 50" fill="none" stroke="rgba(16,185,129,0.05)" strokeWidth="1" />
                </pattern>
                
                {/* Road gradient */}
                <linearGradient id="roadGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#1e3a29" />
                  <stop offset="100%" stopColor="#0d2417" />
                </linearGradient>

                {/* Campus Greenery Zone */}
                <linearGradient id="grassGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#064e3b" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#022c22" stopOpacity="0.15" />
                </linearGradient>
              </defs>

              {/* Grid Background */}
              <rect width="1000" height="750" fill="url(#campusGrid)" />

              {/* Campus Boundary & Perimeter */}
              <path
                d="M 80,80 L 920,80 L 920,680 L 80,680 Z"
                fill="url(#grassGrad)"
                stroke="#10b981"
                strokeWidth="1.5"
                strokeDasharray="6,6"
                opacity="0.6"
              />

              {/* Campus Roads & Main Afe Babalola Way Arteries */}
              {/* Main South-North Boulevard */}
              <path
                d="M 500,700 L 500,240 L 480,180"
                stroke="url(#roadGrad)"
                strokeWidth="24"
                strokeLinecap="round"
                fill="none"
              />
              <path
                d="M 500,700 L 500,240 L 480,180"
                stroke="#10b981"
                strokeWidth="1.5"
                strokeDasharray="12,12"
                opacity="0.4"
                fill="none"
              />

              {/* East Hospital & Medical Boulevard */}
              <path
                d="M 500,420 L 820,420 L 820,550"
                stroke="url(#roadGrad)"
                strokeWidth="18"
                strokeLinecap="round"
                fill="none"
              />

              {/* West Law & Engineering Boulevard */}
              <path
                d="M 500,420 L 220,420 L 220,620"
                stroke="url(#roadGrad)"
                strokeWidth="18"
                strokeLinecap="round"
                fill="none"
              />

              {/* North Residence Loop */}
              <path
                d="M 220,420 L 220,180 L 820,180 L 820,420"
                stroke="url(#roadGrad)"
                strokeWidth="14"
                strokeLinecap="round"
                fill="none"
              />

              {/* Campus Zones Annotations */}
              <text x="500" y="735" fill="#a7f3d0" fontSize="13" fontWeight="bold" textAnchor="middle">
                KM 8.5 AFE BABALOLA WAY (MAIN ENTRANCE)
              </text>
              <text x="220" y="140" fill="#6ee7b7" fontSize="12" fontWeight="bold" textAnchor="middle" opacity="0.8">
                NORTH-WEST RESIDENTIAL
              </text>
              <text x="820" y="140" fill="#6ee7b7" fontSize="12" fontWeight="bold" textAnchor="middle" opacity="0.8">
                NORTH-EAST RESIDENTIAL
              </text>
              <text x="820" y="620" fill="#6ee7b7" fontSize="12" fontWeight="bold" textAnchor="middle" opacity="0.8">
                HEALTHCARE & MULTI-SYSTEM HOSPITAL
              </text>
              <text x="180" y="700" fill="#6ee7b7" fontSize="12" fontWeight="bold" textAnchor="middle" opacity="0.8">
                SPORTS COMPLEX
              </text>

              {/* Route Line if navigation is active */}
              {showRoute && (
                <g>
                  <line
                    x1={startLandmark.x * 10}
                    y1={startLandmark.y * 7.5}
                    x2={destLandmark.x * 10}
                    y2={destLandmark.y * 7.5}
                    stroke="#f59e0b"
                    strokeWidth="6"
                    strokeDasharray="8,8"
                    strokeLinecap="round"
                    className="animate-pulse"
                  />
                </g>
              )}

              {/* Landmark Map Pins */}
              {CAMPUS_LANDMARKS.map((landmark) => {
                const isSelected = selectedLandmark?.id === landmark.id;
                const isStart = startLandmark.id === landmark.id && showRoute;
                const isDest = destLandmark.id === landmark.id && showRoute;
                const posX = landmark.x * 10;
                const posY = landmark.y * 7.5;

                return (
                  <g
                    key={landmark.id}
                    className="cursor-pointer transition-transform hover:scale-125"
                    onClick={() => setSelectedLandmark(landmark)}
                  >
                    {/* Landmark footprint zone */}
                    <circle
                      cx={posX}
                      cy={posY}
                      r={isSelected ? 22 : 16}
                      fill={landmark.color}
                      opacity={isSelected ? 0.95 : 0.8}
                      stroke={isSelected ? '#ffffff' : '#050D08'}
                      strokeWidth={isSelected ? 3 : 1.5}
                    />

                    {/* Landmark Icon / Pin Center */}
                    <circle
                      cx={posX}
                      cy={posY}
                      r={4}
                      fill="#ffffff"
                    />

                    {/* Label Tag on Map */}
                    <text
                      x={posX}
                      y={posY - 24}
                      fill={isSelected ? '#ffffff' : '#e2e8f0'}
                      fontSize={isSelected ? '12' : '10'}
                      fontWeight="bold"
                      textAnchor="middle"
                      className="pointer-events-none drop-shadow"
                    >
                      {landmark.name.split('&')[0].substring(0, 18)}
                    </text>

                    {/* Route badges */}
                    {isStart && (
                      <rect
                        x={posX - 24}
                        y={posY + 16}
                        width="48"
                        height="18"
                        rx="4"
                        fill="#10b981"
                      />
                    )}
                    {isStart && (
                      <text
                        x={posX}
                        y={posY + 29}
                        fill="#ffffff"
                        fontSize="9"
                        fontWeight="bold"
                        textAnchor="middle"
                      >
                        START
                      </text>
                    )}

                    {isDest && (
                      <rect
                        x={posX - 24}
                        y={posY + 16}
                        width="48"
                        height="18"
                        rx="4"
                        fill="#f59e0b"
                      />
                    )}
                    {isDest && (
                      <text
                        x={posX}
                        y={posY + 29}
                        fill="#050D08"
                        fontSize="9"
                        fontWeight="extrabold"
                        textAnchor="middle"
                      >
                        DEST
                      </text>
                    )}
                  </g>
                );
              })}
            </svg>
          </div>

          <p className="text-[11px] text-slate-400 text-center mt-3">
            💡 Click on any pin on the map to inspect landmark details, open hours, and navigation routes.
          </p>
        </div>

        {/* Landmark Detail Inspector & Route Calculator */}
        <div className="lg:col-span-4 space-y-5">
          {/* Route Finder Card */}
          <div className="bg-[#08150D] rounded-3xl p-5 border border-emerald-900/40 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5 font-['Outfit']">
                <Navigation className="w-4 h-4 text-emerald-400" />
                Campus Wayfinding & Route Finder
              </h3>
              <span className="text-[11px] font-semibold text-emerald-300 bg-[#0c1e13] px-2 py-0.5 rounded-full border border-emerald-800/60">
                ~{estimatedWalkMinutes} mins walk
              </span>
            </div>

            <div className="space-y-2">
              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase">From (Starting Point):</label>
                <select
                  value={startPointId}
                  onChange={(e) => {
                    setStartPointId(e.target.value);
                    setShowRoute(true);
                  }}
                  className="w-full px-3 py-2 bg-[#050D08] text-slate-200 rounded-xl border border-emerald-900/60 text-xs font-medium focus:ring-2 focus:ring-emerald-500"
                >
                  {CAMPUS_LANDMARKS.map((l) => (
                    <option key={l.id} value={l.id}>{l.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase">To (Destination):</label>
                <select
                  value={destPointId}
                  onChange={(e) => {
                    setDestPointId(e.target.value);
                    setShowRoute(true);
                  }}
                  className="w-full px-3 py-2 bg-[#050D08] text-slate-200 rounded-xl border border-emerald-900/60 text-xs font-medium focus:ring-2 focus:ring-emerald-500"
                >
                  {CAMPUS_LANDMARKS.map((l) => (
                    <option key={l.id} value={l.id}>{l.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Route Stats */}
            <div className="p-3 bg-[#0c1e13] rounded-xl border border-emerald-800/60 text-xs flex items-center justify-between">
              <div>
                <span className="text-slate-400 text-[11px]">Est. Walking Distance</span>
                <p className="font-bold text-emerald-300 font-['Outfit']">{estimatedDistanceMeters} meters</p>
              </div>
              <div className="text-right">
                <span className="text-slate-400 text-[11px]">Walk Duration</span>
                <p className="font-bold text-emerald-300 font-['Outfit']">~{estimatedWalkMinutes} minutes</p>
              </div>
            </div>

            <button
              onClick={() => onAskAI(`What is the best walking direction from ${startLandmark.name} to ${destLandmark.name} on the ABUAD campus?`)}
              className="w-full py-2 bg-[#0c1e13] hover:bg-[#10291a] text-slate-200 text-xs font-semibold rounded-xl text-center transition-colors flex items-center justify-center gap-1.5 border border-emerald-800/60 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Ask AI for Turn-by-Turn Navigation</span>
            </button>
          </div>

          {/* Selected Landmark Details Card */}
          {selectedLandmark && (
            <div className="bg-[#08150D] rounded-3xl p-5 border border-emerald-900/40 shadow-sm space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#0c1e13] text-emerald-300 border border-emerald-800/60">
                    {selectedLandmark.zone}
                  </span>
                  <h3 className="text-lg font-bold text-white mt-1 font-['Outfit']">
                    {selectedLandmark.name}
                  </h3>
                </div>

                <button
                  onClick={() => toggleSave(selectedLandmark.id)}
                  className={`p-2 rounded-xl transition-colors cursor-pointer ${
                    savedLandmarkIds.includes(selectedLandmark.id)
                      ? 'bg-amber-400/20 text-amber-300 border border-amber-400/30'
                      : 'bg-[#0c1e13] text-slate-400 hover:text-slate-200 border border-emerald-900/60'
                  }`}
                  title="Bookmark Landmark"
                >
                  {savedLandmarkIds.includes(selectedLandmark.id) ? (
                    <BookmarkCheck className="w-4 h-4" />
                  ) : (
                    <Bookmark className="w-4 h-4" />
                  )}
                </button>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                {selectedLandmark.description}
              </p>

              {/* Hours & Contact */}
              <div className="space-y-2 text-xs text-slate-300 pt-2 border-t border-emerald-900/40">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>{selectedLandmark.hours}</span>
                </div>
                {selectedLandmark.contact && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span>{selectedLandmark.contact}</span>
                  </div>
                )}
              </div>

              {/* Facilities / Features list */}
              <div className="pt-2 border-t border-emerald-900/40">
                <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block mb-2">
                  Key Facilities & Amenities:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedLandmark.features.map((feat, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-lg text-[11px] bg-[#050D08] text-slate-300 border border-emerald-900/60 font-medium"
                    >
                      ✓ {feat}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-emerald-900/40 flex gap-2">
                <button
                  onClick={() => {
                    setDestPointId(selectedLandmark.id);
                    setShowRoute(true);
                  }}
                  className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition-all shadow-[0_0_12px_rgba(16,185,129,0.35)] flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>Navigate Here</span>
                </button>
                <button
                  onClick={() => onAskAI(`Tell me more about the facilities, rules, and history of ${selectedLandmark.name} at Afe Babalola University.`)}
                  className="p-2 bg-[#0c1e13] hover:bg-[#10291a] text-slate-200 border border-emerald-800/60 rounded-xl transition-colors cursor-pointer"
                  title="Ask AI about this place"
                >
                  <Sparkles className="w-4 h-4 text-amber-400" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
