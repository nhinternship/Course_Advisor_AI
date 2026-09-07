import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { 
  GraduationCap, 
  Calculator, 
  CheckSquare, 
  Award, 
  DollarSign, 
  FileText, 
  ExternalLink, 
  ChevronRight, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles,
  HelpCircle,
  Clock,
  ArrowRight,
  ShieldCheck,
  Building,
  Info
} from 'lucide-react';
import { ADMISSION_STEPS, FEE_SCHEDULES, SCHOLARSHIPS_DATA, APPLICATION_CHECKLIST } from '../data/admissions';
import { COLLEGES_DATA } from '../data/colleges';
import { AppTab } from '../types';

interface AdmissionsGuideProps {
  setActiveTab: (tab: AppTab) => void;
  onAskAI: (query: string) => void;
}

export const AdmissionsGuide: React.FC<AdmissionsGuideProps> = ({ setActiveTab, onAskAI }) => {
  const [activeSection, setActiveSection] = useState<'roadmap' | 'calculator' | 'fees' | 'scholarships' | 'checklist'>('roadmap');

  // Eligibility Calculator State
  const [jambScore, setJambScore] = useState<number>(240);
  const [appliedCategory, setAppliedCategory] = useState<string>('all');
  const [mathGrade, setMathGrade] = useState<string>('B2');
  const [engGrade, setEngGrade] = useState<string>('A1');
  const [sub3Grade, setSub3Grade] = useState<string>('B3');
  const [sub4Grade, setSub4Grade] = useState<string>('B2');
  const [sub5Grade, setSub5Grade] = useState<string>('B3');

  // Checklist state
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>(() => {
    const saved = localStorage.getItem('abuad_checklist');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (_) {}
    }
    return {};
  });

  // Selected fee schedule for interactive breakdown
  const [selectedFeeIndex, setSelectedFeeIndex] = useState<number>(0);

  useEffect(() => {
    localStorage.setItem('abuad_checklist', JSON.stringify(checkedItems));
  }, [checkedItems]);

  const toggleChecklist = (id: string) => {
    setCheckedItems((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const completedCount = APPLICATION_CHECKLIST.filter((item) => checkedItems[item.id]).length;
  const progressPercent = Math.round((completedCount / APPLICATION_CHECKLIST.length) * 100);

  // Grade point mapping (A1=6, B2=5, B3=4, C4=3, C5=2, C6=1, D7/F9=0)
  const gradePoints: Record<string, number> = {
    A1: 6,
    B2: 5,
    B3: 4,
    C4: 3,
    C5: 2,
    C6: 1,
    D7: 0,
    E8: 0,
    F9: 0,
  };

  const oLevelTotalPoints = 
    (gradePoints[engGrade] || 0) + 
    (gradePoints[mathGrade] || 0) + 
    (gradePoints[sub3Grade] || 0) + 
    (gradePoints[sub4Grade] || 0) + 
    (gradePoints[sub5Grade] || 0);

  // Aggregate evaluation out of 100 (50% JAMB, 50% O'Level points)
  const jambContribution = (jambScore / 400) * 50;
  const oLevelContribution = (oLevelTotalPoints / 30) * 50;
  const totalAggregateScore = Math.round((jambContribution + oLevelContribution) * 10) / 10;

  const handleCelebrate = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
    });
  };

  // Filter programs based on eligibility
  const allPrograms = COLLEGES_DATA.flatMap((c) => c.programs);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 text-slate-200">
      {/* Hero Banner with Quick Navigation */}
      <div className="bg-gradient-to-r from-[#081f12] via-[#08150D] to-[#040c07] rounded-3xl p-6 sm:p-8 text-white shadow-[0_4px_30px_rgba(0,0,0,0.6)] border border-emerald-800/40 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 max-w-3xl">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30 mb-3 shadow-[0_0_10px_rgba(245,158,11,0.2)]">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" /> ABUAD Admissions Portal 2026/2027
          </span>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight font-['Outfit']">
            Your Comprehensive Guide to Joining Afe Babalola University
          </h1>
          <p className="mt-2 text-sm sm:text-base text-emerald-100/90 leading-relaxed">
            Step-by-step application procedures, real-time eligibility calculator, 3-tier installment fee schedules, and Founder's merit scholarships.
          </p>

          <div className="mt-6 flex flex-wrap gap-2.5">
            <a
              href="https://admissions.abuad.edu.ng"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold rounded-xl shadow-[0_0_15px_rgba(16,185,129,0.4)] transition-all"
            >
              <span>Official Application Portal</span>
              <ExternalLink className="w-4 h-4" />
            </a>

            <button
              onClick={() => onAskAI('What are the full admission requirements and registration steps for ABUAD this session?')}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#0c1e13] hover:bg-[#10291a] text-slate-200 text-sm font-semibold rounded-xl border border-emerald-800/60 transition-all"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Ask AI Assistant</span>
            </button>
          </div>
        </div>

        {/* Section Tabs */}
        <div className="mt-8 pt-6 border-t border-emerald-900/60 flex items-center gap-2 overflow-x-auto no-scrollbar">
          {[
            { id: 'roadmap', label: '6-Step Enrollment Roadmap', icon: GraduationCap },
            { id: 'calculator', label: 'Eligibility Calculator', icon: Calculator },
            { id: 'fees', label: 'Tuition & Installments', icon: DollarSign },
            { id: 'scholarships', label: 'Scholarships & Bursaries', icon: Award },
            { id: 'checklist', label: 'Application Checklist', icon: CheckSquare },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeSection === tab.id;
            return (
              <button
                key={tab.id}
                id={`admissions-subtab-${tab.id}`}
                onClick={() => setActiveSection(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-[0_0_12px_rgba(16,185,129,0.35)] font-bold border border-emerald-400/40'
                    : 'bg-[#08150D] text-emerald-300/80 hover:bg-[#0c1e13] hover:text-white border border-emerald-900/60'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* SECTION 1: 6-STEP ENROLLMENT ROADMAP */}
      {activeSection === 'roadmap' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white font-['Outfit']">Step-by-Step Enrollment Pathway</h2>
              <p className="text-sm text-slate-400">Follow these 6 stages for a seamless transition into Afe Babalola University.</p>
            </div>
            <span className="hidden sm:inline-block px-3 py-1 bg-emerald-950/80 border border-emerald-700/50 text-emerald-300 rounded-full text-xs font-bold shadow-[0_0_8px_rgba(16,185,129,0.2)]">
              100% Accredited
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {ADMISSION_STEPS.map((step) => (
              <div
                key={step.stepNumber}
                className="bg-[#08150D] rounded-2xl p-5 border border-emerald-900/40 shadow-md hover:border-emerald-700/60 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="w-8 h-8 rounded-xl bg-emerald-600 text-white font-extrabold text-sm flex items-center justify-center shadow-[0_0_10px_rgba(16,185,129,0.3)]">
                      {step.stepNumber}
                    </span>
                    <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-[#0c1e13] text-emerald-300 border border-emerald-900/60 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-emerald-400" />
                      {step.timeline}
                    </span>
                  </div>

                  <h3 className="font-bold text-white text-base mb-1.5 font-['Outfit']">{step.title}</h3>
                  <p className="text-xs text-slate-300 mb-3 leading-relaxed">{step.fullDesc}</p>

                  <div className="space-y-1.5 pt-2 border-t border-emerald-900/40">
                    <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider block">Key Pro-Tips:</span>
                    {step.tips.map((tip, idx) => (
                      <div key={idx} className="flex items-start gap-1.5 text-xs text-slate-300">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 flex-shrink-0" />
                        <span>{tip}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {step.link && (
                  <div className="mt-4 pt-3 border-t border-emerald-900/40">
                    <a
                      href={step.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400 hover:text-emerald-300 transition-colors"
                    >
                      <span>{step.actionText || 'Proceed to Portal'}</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 2: ELIGIBILITY & ADMISSION POINTS CALCULATOR */}
      {activeSection === 'calculator' && (
        <div className="space-y-6">
          <div className="bg-[#08150D] rounded-3xl p-6 sm:p-8 border border-emerald-900/40 shadow-md">
            <div className="max-w-2xl">
              <h2 className="text-xl sm:text-2xl font-bold text-white font-['Outfit'] flex items-center gap-2">
                <Calculator className="w-6 h-6 text-emerald-400" />
                Interactive Eligibility & Aggregate Points Calculator
              </h2>
              <p className="text-sm text-slate-400 mt-1">
                Enter your JAMB score and select your 5 core O'Level grades to see your computed aggregate score and verified course eligibility across all colleges.
              </p>
            </div>

            <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Calculator Inputs */}
              <div className="lg:col-span-7 space-y-5 bg-[#0c1e13] p-5 sm:p-6 rounded-2xl border border-emerald-900/60">
                {/* JAMB Score Slider */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-bold text-slate-200">
                      JAMB UTME Score (Max 400)
                    </label>
                    <span className="px-3 py-1 rounded-lg text-sm font-extrabold bg-emerald-600 text-white shadow-[0_0_10px_rgba(16,185,129,0.3)]">
                      {jambScore} / 400
                    </span>
                  </div>
                  <input
                    type="range"
                    min="140"
                    max="400"
                    step="1"
                    value={jambScore}
                    onChange={(e) => setJambScore(parseInt(e.target.value))}
                    className="w-full h-2.5 bg-[#050D08] rounded-lg appearance-none cursor-pointer accent-emerald-500"
                  />
                  <div className="flex justify-between text-[11px] text-slate-400 mt-1">
                    <span>180 (General Cut-Off)</span>
                    <span>200 (Law/Eng)</span>
                    <span>250 (Medicine/Pharm)</span>
                    <span>400</span>
                  </div>
                </div>

                {/* O'Level Core Grades */}
                <div>
                  <h4 className="text-sm font-bold text-slate-200 mb-2">
                    Select Your 5 O'Level Grades (WAEC / NECO / IGCSE)
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-slate-300 block mb-1">English Language*</label>
                      <select
                        value={engGrade}
                        onChange={(e) => setEngGrade(e.target.value)}
                        className="w-full px-3 py-2 bg-[#050D08] text-slate-200 rounded-xl border border-emerald-900/60 text-sm font-medium focus:ring-2 focus:ring-emerald-500"
                      >
                        {Object.keys(gradePoints).map((g) => (
                          <option key={g} value={g}>{g} ({gradePoints[g]} pts)</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-300 block mb-1">Mathematics*</label>
                      <select
                        value={mathGrade}
                        onChange={(e) => setMathGrade(e.target.value)}
                        className="w-full px-3 py-2 bg-[#050D08] text-slate-200 rounded-xl border border-emerald-900/60 text-sm font-medium focus:ring-2 focus:ring-emerald-500"
                      >
                        {Object.keys(gradePoints).map((g) => (
                          <option key={g} value={g}>{g} ({gradePoints[g]} pts)</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-300 block mb-1">Subject 3 (e.g. Physics/Gov)</label>
                      <select
                        value={sub3Grade}
                        onChange={(e) => setSub3Grade(e.target.value)}
                        className="w-full px-3 py-2 bg-[#050D08] text-slate-200 rounded-xl border border-emerald-900/60 text-sm font-medium focus:ring-2 focus:ring-emerald-500"
                      >
                        {Object.keys(gradePoints).map((g) => (
                          <option key={g} value={g}>{g} ({gradePoints[g]} pts)</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-300 block mb-1">Subject 4 (e.g. Chem/Lit)</label>
                      <select
                        value={sub4Grade}
                        onChange={(e) => setSub4Grade(e.target.value)}
                        className="w-full px-3 py-2 bg-[#050D08] text-slate-200 rounded-xl border border-emerald-900/60 text-sm font-medium focus:ring-2 focus:ring-emerald-500"
                      >
                        {Object.keys(gradePoints).map((g) => (
                          <option key={g} value={g}>{g} ({gradePoints[g]} pts)</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-300 block mb-1">Subject 5 (e.g. Bio/Econ)</label>
                      <select
                        value={sub5Grade}
                        onChange={(e) => setSub5Grade(e.target.value)}
                        className="w-full px-3 py-2 bg-[#050D08] text-slate-200 rounded-xl border border-emerald-900/60 text-sm font-medium focus:ring-2 focus:ring-emerald-500"
                      >
                        {Object.keys(gradePoints).map((g) => (
                          <option key={g} value={g}>{g} ({gradePoints[g]} pts)</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={handleCelebrate}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-sm transition-all shadow-[0_0_15px_rgba(16,185,129,0.35)] flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>Evaluate & Validate Admission Chances</span>
                  </button>
                </div>
              </div>

              {/* Computed Results Card */}
              <div className="lg:col-span-5 bg-gradient-to-br from-[#050D08] via-[#08150D] to-[#0c1e13] text-white p-6 rounded-2xl shadow-lg border border-emerald-800/60">
                <div className="text-center pb-4 border-b border-emerald-900/80">
                  <span className="text-xs uppercase tracking-widest text-emerald-400 font-bold">Estimated Aggregate Rating</span>
                  <div className="text-4xl font-extrabold text-amber-400 mt-1 font-['Outfit']">
                    {totalAggregateScore}%
                  </div>
                  <p className="text-xs text-emerald-200 mt-1">
                    JAMB ({jambContribution.toFixed(1)}/50) + O'Level ({oLevelContribution.toFixed(1)}/50)
                  </p>
                </div>

                <div className="mt-4 space-y-3">
                  <div className="flex items-center justify-between text-xs py-1 border-b border-emerald-900/60">
                    <span className="text-slate-300">Minimum UTME Status:</span>
                    <span className={`font-bold ${jambScore >= 180 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {jambScore >= 180 ? '✓ Qualified (180+)' : '✗ Below 180 (Needs DE/Pre-degree)'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs py-1 border-b border-emerald-900/60">
                    <span className="text-slate-300">O'Level Points:</span>
                    <span className="font-bold text-amber-300">{oLevelTotalPoints} / 30 points</span>
                  </div>

                  <div className="flex items-center justify-between text-xs py-1 border-b border-emerald-900/60">
                    <span className="text-slate-300">Medicine & Surgery (MBBS):</span>
                    <span className={`font-bold ${jambScore >= 250 ? 'text-emerald-400' : 'text-amber-300'}`}>
                      {jambScore >= 250 ? 'Highly Competitive' : 'Consider Nursing / B.MLS'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs py-1 border-b border-emerald-900/60">
                    <span className="text-slate-300">Law & Engineering:</span>
                    <span className={`font-bold ${jambScore >= 200 ? 'text-emerald-400' : 'text-slate-400'}`}>
                      {jambScore >= 200 ? '✓ Eligible' : 'Marginal'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs py-1">
                    <span className="text-slate-300">Sciences & Social Sciences:</span>
                    <span className={`font-bold ${jambScore >= 180 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {jambScore >= 180 ? '✓ Fully Eligible' : 'Ineligible'}
                    </span>
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-emerald-900/80 flex flex-col gap-2">
                  <a
                    href="https://admissions.abuad.edu.ng"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-xl text-center shadow-md transition-all flex items-center justify-center gap-1.5"
                  >
                    <span>Proceed to Apply with this Score</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>

                  <button
                    onClick={() => onAskAI(`My JAMB score is ${jambScore} and my aggregate is ${totalAggregateScore}%. What specific course at ABUAD do you recommend for me?`)}
                    className="w-full py-2 bg-[#10291a] hover:bg-[#153823] text-emerald-300 text-xs rounded-xl font-semibold border border-emerald-700/60 text-center transition-colors cursor-pointer"
                  >
                    Ask AI for Personalized Course Advice
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 3: TUITION & 3-TIER INSTALLMENT BREAKDOWN */}
      {activeSection === 'fees' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white font-['Outfit']">Tuition & Structured Installment Schedule</h2>
              <p className="text-sm text-slate-400">All-inclusive fees covering modern on-campus hostel accommodation, health care, and ICT.</p>
            </div>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-700/50 text-emerald-300 shadow-[0_0_8px_rgba(16,185,129,0.2)]">
              50% / 30% / 20% Installments
            </span>
          </div>

          {/* College Fee Selector & Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Fee Schedule List */}
            <div className="lg:col-span-5 space-y-3">
              {FEE_SCHEDULES.map((fee, idx) => {
                const isSelected = selectedFeeIndex === idx;
                return (
                  <div
                    key={idx}
                    onClick={() => setSelectedFeeIndex(idx)}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-[#0c1e13] border-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.25)] ring-1 ring-emerald-500'
                        : 'bg-[#08150D] border-emerald-900/40 hover:border-emerald-800/60'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-bold text-sm text-white">{fee.collegeName}</h4>
                        <p className="text-xs text-slate-400">{fee.degree}</p>
                      </div>
                      <div className="text-right">
                        <span className="font-extrabold text-sm text-emerald-400 font-['Outfit']">
                          ₦{(fee.tuitionPerSession).toLocaleString()}
                        </span>
                        <span className="text-[10px] text-slate-500 block">per session</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Selected Fee Detail Display */}
            <div className="lg:col-span-7 bg-[#08150D] rounded-3xl p-6 border border-emerald-900/40 shadow-md space-y-5">
              {(() => {
                const current = FEE_SCHEDULES[selectedFeeIndex];
                return (
                  <>
                    <div className="border-b border-emerald-900/40 pb-4">
                      <span className="text-xs uppercase tracking-wider text-emerald-400/80 font-bold">Selected Program Fee Schedule</span>
                      <h3 className="text-xl font-bold text-white mt-0.5 font-['Outfit']">{current.collegeName}</h3>
                      <p className="text-xs text-slate-400">{current.degree}</p>
                    </div>

                    {/* Installment Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="p-4 rounded-2xl bg-[#0c1e13] border border-emerald-800/50">
                        <span className="text-[11px] font-bold text-emerald-400 uppercase">1st Installment (50%)</span>
                        <div className="text-lg font-extrabold text-white mt-1 font-['Outfit']">
                          ₦{current.installment1.toLocaleString()}
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1">Payable upon 1st semester registration & resumption.</p>
                      </div>

                      <div className="p-4 rounded-2xl bg-[#0c1e13] border border-emerald-800/50">
                        <span className="text-[11px] font-bold text-emerald-400 uppercase">2nd Installment (30%)</span>
                        <div className="text-lg font-extrabold text-white mt-1 font-['Outfit']">
                          ₦{current.installment2.toLocaleString()}
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1">Payable at start of 2nd semester resumption.</p>
                      </div>

                      <div className="p-4 rounded-2xl bg-[#0c1e13] border border-emerald-800/50">
                        <span className="text-[11px] font-bold text-emerald-400 uppercase">3rd Installment (20%)</span>
                        <div className="text-lg font-extrabold text-white mt-1 font-['Outfit']">
                          ₦{current.installment3.toLocaleString()}
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1">Payable prior to final session examination clearance.</p>
                      </div>
                    </div>

                    {/* What's Included */}
                    <div className="space-y-2 pt-2">
                      <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">What Your Tuition Covers:</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {current.includes.map((inc, i) => (
                          <div key={i} className="flex items-center gap-2 text-xs text-slate-300 bg-[#050D08] px-3 py-2 rounded-xl border border-emerald-900/60">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                            <span>{inc}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Official Bank Account Information Disclaimer */}
                    <div className="p-4 bg-amber-950/40 rounded-2xl border border-amber-600/40 text-amber-200 text-xs flex items-start gap-2.5">
                      <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <strong className="font-bold">Official Payment Security Notice:</strong>
                        <p className="mt-0.5 text-amber-200/90">
                          All payments must be generated via your unique invoice on <strong>portal.abuad.edu.ng</strong> or official bank drafts made payable to <strong>Afe Babalola University</strong>. Never make payments to personal individual accounts.
                        </p>
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* SECTION 4: SCHOLARSHIPS & FINANCIAL AWARDS */}
      {activeSection === 'scholarships' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white font-['Outfit']">Founder's Scholarships & Grants</h2>
              <p className="text-sm text-slate-400">Rewarding academic brilliance, sports prowess, and indigent financial support.</p>
            </div>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 shadow-[0_0_8px_rgba(245,158,11,0.2)]">
              Over ₦500M Disbursed
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {SCHOLARSHIPS_DATA.map((sch) => (
              <div
                key={sch.id}
                className="bg-[#08150D] rounded-2xl p-6 border border-emerald-900/40 shadow-md hover:border-emerald-700/60 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#0c1e13] text-emerald-300 border border-emerald-800/60">
                      {sch.category === 'merit' ? 'High UTME Merit' : sch.category === 'deans_list' ? '1st Class CGPA' : sch.category === 'sports' ? 'Athletics & Arts' : 'Need-Based'}
                    </span>
                    <span className="text-sm font-extrabold text-emerald-400 font-['Outfit']">
                      {sch.amount}
                    </span>
                  </div>

                  <h3 className="font-bold text-white text-base mb-2 font-['Outfit']">{sch.title}</h3>
                  <p className="text-xs text-slate-300 mb-4 leading-relaxed">{sch.description}</p>

                  <div className="bg-[#050D08] rounded-xl p-3 border border-emerald-900/60 text-xs space-y-1.5">
                    <div>
                      <span className="font-bold text-slate-300">Eligibility: </span>
                      <span className="text-slate-400">{sch.eligibility}</span>
                    </div>
                    <div>
                      <span className="font-bold text-slate-300">Deadline: </span>
                      <span className="text-slate-400">{sch.deadline}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-emerald-900/40 flex items-center justify-between">
                  <button
                    onClick={() => onAskAI(`How do I apply for the ${sch.title} at ABUAD?`)}
                    className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer"
                  >
                    <span>Ask AI How to Apply</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 5: APPLICATION CHECKLIST TRACKER */}
      {activeSection === 'checklist' && (
        <div className="space-y-6">
          <div className="bg-[#08150D] rounded-3xl p-6 sm:p-8 border border-emerald-900/40 shadow-md">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-emerald-900/40 pb-5">
              <div>
                <h2 className="text-xl font-bold text-white font-['Outfit'] flex items-center gap-2">
                  <CheckSquare className="w-5 h-5 text-emerald-400" />
                  Applicant Document & Verification Checklist
                </h2>
                <p className="text-xs sm:text-sm text-slate-400 mt-1">
                  Keep track of all mandatory documents required for Post-UTME screening and physical matriculation clearance.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <span className="text-xs font-bold text-slate-400">Progress:</span>
                  <div className="text-base font-extrabold text-emerald-400 font-['Outfit']">
                    {completedCount} / {APPLICATION_CHECKLIST.length} ({progressPercent}%)
                  </div>
                </div>
                <div className="w-12 h-12 rounded-full bg-[#0c1e13] border-4 border-emerald-500 flex items-center justify-center font-bold text-xs text-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.3)]">
                  {progressPercent}%
                </div>
              </div>
            </div>

            {/* Checklist Items */}
            <div className="mt-6 space-y-2.5">
              {APPLICATION_CHECKLIST.map((item) => {
                const isChecked = Boolean(checkedItems[item.id]);
                return (
                  <div
                    key={item.id}
                    onClick={() => toggleChecklist(item.id)}
                    className={`flex items-center justify-between p-3.5 sm:p-4 rounded-2xl border cursor-pointer transition-all ${
                      isChecked
                        ? 'bg-[#0c1e13] border-emerald-700/60 text-emerald-200'
                        : 'bg-[#050D08] border-emerald-900/40 hover:bg-[#07130a] text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}} // Controlled by div click
                        className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-emerald-900/60 bg-[#050D08] cursor-pointer"
                      />
                      <span className={`text-xs sm:text-sm font-medium ${isChecked ? 'line-through text-slate-500' : ''}`}>
                        {item.label}
                      </span>
                    </div>

                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      item.required 
                        ? 'bg-rose-950/80 text-rose-300 border border-rose-800/50' 
                        : 'bg-[#10291a] text-emerald-300 border border-emerald-800/40'
                    }`}>
                      {item.required ? 'Mandatory' : 'Optional'}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 flex items-center justify-between flex-wrap gap-3 pt-4 border-t border-emerald-900/40 text-xs text-slate-400">
              <span>* Your checklist is saved automatically in offline local storage.</span>
              <button
                onClick={() => setCheckedItems({})}
                className="text-emerald-400 hover:text-emerald-300 font-semibold cursor-pointer"
              >
                Reset Checklist
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
