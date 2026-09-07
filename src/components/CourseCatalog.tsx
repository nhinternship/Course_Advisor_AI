import React, { useState, useMemo } from 'react';
import { 
  BookOpen, 
  Search, 
  Filter, 
  GraduationCap, 
  Clock, 
  Award, 
  Briefcase, 
  Bookmark, 
  BookmarkCheck, 
  Sparkles, 
  ExternalLink,
  Layers,
  ChevronDown,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { COLLEGES_DATA } from '../data/colleges';
import { College, Program, AppTab } from '../types';

interface CourseCatalogProps {
  setActiveTab: (tab: AppTab) => void;
  onAskAI: (query: string) => void;
}

export const CourseCatalog: React.FC<CourseCatalogProps> = ({ setActiveTab, onAskAI }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCollegeId, setSelectedCollegeId] = useState<string>('all');
  const [selectedDuration, setSelectedDuration] = useState<string>('all');
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(COLLEGES_DATA[0].programs[0]);

  // Bookmarked course IDs
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('abuad_bookmarked_courses');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (_) {}
    }
    return ['llb-law', 'mbbs', 'mechatronics', 'computer-science'];
  });

  const toggleBookmark = (id: string) => {
    setBookmarkedIds((prev) => {
      const next = prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id];
      localStorage.setItem('abuad_bookmarked_courses', JSON.stringify(next));
      return next;
    });
  };

  // Flatten programs with college references
  const allProgramsWithCollege = useMemo(() => {
    return COLLEGES_DATA.flatMap((c) =>
      c.programs.map((p) => ({
        ...p,
        collegeName: c.name,
        collegeShort: c.shortName,
        collegeColor: c.color,
      }))
    );
  }, []);

  const filteredPrograms = useMemo(() => {
    return allProgramsWithCollege.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.overview.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.careerProspects.some((c) => c.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCollege = selectedCollegeId === 'all' || p.collegeId === selectedCollegeId;
      const matchesDuration =
        selectedDuration === 'all' ||
        (selectedDuration === '4' && p.durationYears === 4) ||
        (selectedDuration === '5' && p.durationYears === 5) ||
        (selectedDuration === '6' && p.durationYears === 6) ||
        (selectedDuration === 'pg' && p.durationYears <= 3 && p.jambCutOff === 0);

      return matchesSearch && matchesCollege && matchesDuration;
    });
  }, [allProgramsWithCollege, searchQuery, selectedCollegeId, selectedDuration]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 text-slate-200">
      {/* Header */}
      <div className="bg-[#08150D] rounded-3xl p-6 border border-emerald-900/40 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-[#0c1e13] text-emerald-400 border border-emerald-800/60">
              <BookOpen className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-bold text-white font-['Outfit']">
              ABUAD Academic Programs & Course Catalog
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Browse fully accredited undergraduate and postgraduate programs across all 8 Colleges with entry requirements and career outcomes.
          </p>
        </div>

        <div className="relative min-w-[260px] sm:min-w-[320px]">
          <Search className="w-4 h-4 text-emerald-500/70 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Law, Medicine, Cybersecurity, Mechatronics..."
            className="w-full pl-10 pr-4 py-2.5 bg-[#050D08] border border-emerald-900/60 text-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all placeholder:text-slate-500"
          />
        </div>
      </div>

      {/* College & Duration Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        {/* College Filter Horizontal Scroll */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar w-full pb-1">
          <button
            onClick={() => setSelectedCollegeId('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all cursor-pointer ${
              selectedCollegeId === 'all'
                ? 'bg-emerald-600 text-white shadow-[0_0_12px_rgba(16,185,129,0.35)] font-bold border border-emerald-400/40'
                : 'bg-[#08150D] text-emerald-300/80 hover:bg-[#0c1e13] hover:text-white border border-emerald-900/60'
            }`}
          >
            All Colleges ({allProgramsWithCollege.length})
          </button>
          {COLLEGES_DATA.map((col) => (
            <button
              key={col.id}
              onClick={() => setSelectedCollegeId(col.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedCollegeId === col.id
                  ? 'bg-emerald-600 text-white shadow-[0_0_12px_rgba(16,185,129,0.35)] font-bold border border-emerald-400/40'
                  : 'bg-[#08150D] text-emerald-300/80 hover:bg-[#0c1e13] hover:text-white border border-emerald-900/60'
              }`}
            >
              {col.shortName}
            </button>
          ))}
        </div>

        {/* Duration Select */}
        <div className="flex items-center gap-2 min-w-max">
          <Filter className="w-3.5 h-3.5 text-emerald-400" />
          <select
            value={selectedDuration}
            onChange={(e) => setSelectedDuration(e.target.value)}
            className="px-3 py-1.5 bg-[#050D08] text-slate-200 rounded-xl border border-emerald-900/60 text-xs font-semibold focus:ring-2 focus:ring-emerald-500"
          >
            <option value="all">All Program Durations</option>
            <option value="4">4-Year Degrees (B.Sc)</option>
            <option value="5">5-Year Professional (LL.B / B.Eng)</option>
            <option value="6">6-Year Medical & Pharm (MBBS / Pharm.D)</option>
            <option value="pg">Postgraduate (PGD / M.Sc / Ph.D)</option>
          </select>
        </div>
      </div>

      {/* Main Content Layout: Programs Grid + Inspector Drawer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Course Cards List */}
        <div className="lg:col-span-7 space-y-4">
          {filteredPrograms.length === 0 ? (
            <div className="bg-[#08150D] rounded-3xl p-12 text-center border border-emerald-900/40">
              <BookOpen className="w-12 h-12 text-slate-500 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-200">No courses match your query</h3>
              <p className="text-xs text-slate-400 mt-1">Try refining your search keyword or clearing the filters.</p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCollegeId('all');
                  setSelectedDuration('all');
                }}
                className="mt-4 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-all shadow-[0_0_12px_rgba(16,185,129,0.35)] cursor-pointer"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            filteredPrograms.map((prog) => {
              const isSelected = selectedProgram?.id === prog.id;
              const isBookmarked = bookmarkedIds.includes(prog.id);

              return (
                <div
                  key={prog.id}
                  onClick={() => setSelectedProgram(prog)}
                  className={`bg-[#08150D] rounded-2xl p-5 border cursor-pointer transition-all ${
                    isSelected
                      ? 'border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.25)] ring-1 ring-emerald-500'
                      : 'border-emerald-900/40 hover:border-emerald-800/60'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="text-[11px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-[#0c1e13] text-emerald-300 border border-emerald-800/60">
                          {prog.collegeShort}
                        </span>
                        <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-emerald-400" />
                          {prog.durationYears} Years Duration
                        </span>
                        {prog.isPopular && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30">
                            ★ High Demand
                          </span>
                        )}
                      </div>

                      <h3 className="text-base sm:text-lg font-bold text-white font-['Outfit']">
                        {prog.name}
                      </h3>
                      <p className="text-xs font-semibold text-emerald-400 mt-0.5">{prog.degree}</p>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleBookmark(prog.id);
                      }}
                      className={`p-2 rounded-xl transition-colors cursor-pointer ${
                        isBookmarked ? 'bg-amber-400/20 text-amber-300 border border-amber-400/30' : 'bg-[#0c1e13] text-slate-400 hover:text-slate-200 border border-emerald-900/60'
                      }`}
                      title={isBookmarked ? 'Remove Bookmark' : 'Bookmark Course'}
                    >
                      {isBookmarked ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                    </button>
                  </div>

                  <p className="text-xs text-slate-300 mt-2.5 line-clamp-2 leading-relaxed">
                    {prog.overview}
                  </p>

                  <div className="mt-3 pt-3 border-t border-emerald-900/40 flex items-center justify-between flex-wrap gap-2 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400 font-medium">JAMB Cut-off:</span>
                      <span className="font-bold text-emerald-300 px-2 py-0.5 bg-[#050D08] border border-emerald-900/60 rounded-md">
                        {prog.jambCutOff > 0 ? `${prog.jambCutOff}+` : 'N/A (PG)'}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="font-extrabold text-emerald-400 font-['Outfit']">{prog.tuitionRange}</span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Selected Program Deep Inspection Card */}
        <div className="lg:col-span-5">
          {selectedProgram ? (
            <div className="bg-[#08150D] rounded-3xl p-6 border border-emerald-900/40 shadow-md space-y-5 sticky top-24">
              <div className="border-b border-emerald-900/40 pb-4">
                <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">
                  Comprehensive Curriculum Details
                </span>
                <h2 className="text-xl font-bold text-white mt-1 font-['Outfit']">
                  {selectedProgram.name}
                </h2>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs font-bold px-2.5 py-1 bg-[#0c1e13] border border-emerald-800/60 rounded-lg text-emerald-300">
                    {selectedProgram.degree}
                  </span>
                  <span className="text-xs font-semibold px-2.5 py-1 bg-[#10291a] text-emerald-300 border border-emerald-700/50 rounded-lg">
                    {selectedProgram.durationYears} Academic Years
                  </span>
                </div>
              </div>

              {/* Overview */}
              <div>
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Program Overview:
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {selectedProgram.overview}
                </p>
              </div>

              {/* O'Level Requirements */}
              <div className="bg-[#0c1e13] p-4 rounded-2xl border border-emerald-900/60">
                <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  O'Level Subject Requirements (WAEC / NECO):
                </h4>
                <ul className="space-y-1">
                  {selectedProgram.oLevelRequirements.map((req, i) => (
                    <li key={i} className="text-xs text-slate-300 flex items-start gap-1.5">
                      <span className="text-emerald-400 font-bold">•</span>
                      <span>{req}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* UTME Subjects */}
              <div className="bg-[#0c1e13] p-4 rounded-2xl border border-emerald-900/60">
                <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-1.5">
                  JAMB UTME Subject Combination:
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {selectedProgram.utmeSubjects.map((sub, i) => (
                    <span key={i} className="text-xs font-semibold px-2.5 py-1 bg-[#050D08] border border-emerald-900/60 rounded-lg text-slate-200">
                      {sub}
                    </span>
                  ))}
                </div>
              </div>

              {/* Career Outcomes */}
              <div>
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Briefcase className="w-4 h-4 text-emerald-400" />
                  Graduate Career Pathways:
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {selectedProgram.careerProspects.map((cp, i) => (
                    <span key={i} className="text-[11px] font-medium px-2.5 py-1 bg-[#0c1e13] text-emerald-300 border border-emerald-800/60 rounded-lg">
                      {cp}
                    </span>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="pt-2 flex flex-col gap-2">
                <button
                  onClick={() => onAskAI(`What is the curriculum, career prospects, and admission cut-off mark for ${selectedProgram.name} at ABUAD?`)}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-all shadow-[0_0_15px_rgba(16,185,129,0.35)] flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Ask AI Assistant About This Course</span>
                </button>

                <a
                  href="https://admissions.abuad.edu.ng"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2 bg-[#0c1e13] hover:bg-[#10291a] text-slate-200 text-xs font-semibold rounded-xl text-center transition-colors flex items-center justify-center gap-1.5 border border-emerald-800/60"
                >
                  <span>Apply for this Program</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          ) : (
            <div className="bg-[#08150D] rounded-3xl p-8 text-center border border-emerald-900/40 text-slate-400">
              Select a course to view complete curriculum requirements.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
