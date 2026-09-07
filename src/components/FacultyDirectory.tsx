import React, { useState, useMemo } from 'react';
import { 
  Users, 
  Search, 
  Mail, 
  Phone, 
  MapPin, 
  Clock, 
  Send, 
  Building, 
  ShieldCheck, 
  CheckCircle2, 
  Sparkles,
  ExternalLink,
  MessageSquare,
  Copy,
  Check
} from 'lucide-react';
import { DIRECTORY_CONTACTS } from '../data/directories';
import { DirectoryContact, AppTab } from '../types';

interface FacultyDirectoryProps {
  setActiveTab: (tab: AppTab) => void;
  onAskAI: (query: string) => void;
}

export const FacultyDirectory: React.FC<FacultyDirectoryProps> = ({ setActiveTab, onAskAI }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [inquiryModalContact, setInquiryModalContact] = useState<DirectoryContact | null>(null);
  
  // Inquiry Form State
  const [senderName, setSenderName] = useState('');
  const [senderEmail, setSenderEmail] = useState('');
  const [senderMatricOrAppNo, setSenderMatricOrAppNo] = useState('');
  const [inquirySubject, setInquirySubject] = useState('');
  const [inquiryMessage, setInquiryMessage] = useState('');
  const [inquirySubmitted, setInquirySubmitted] = useState(false);
  const [copiedEmailId, setCopiedEmailId] = useState<string | null>(null);

  const categories = [
    { id: 'all', label: 'All Staff & Units' },
    { id: 'executive', label: 'Principal Officers' },
    { id: 'student_services', label: 'Student Affairs & Hostels' },
    { id: 'administration', label: 'Registry, ICT & Bursary' },
    { id: 'emergency', label: 'Security & Medical' },
  ];

  const filteredContacts = useMemo(() => {
    return DIRECTORY_CONTACTS.filter((c) => {
      const matchesSearch =
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.responsibilities && c.responsibilities.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCategory = selectedCategory === 'all' || c.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  const handleCopyEmail = (id: string, email: string) => {
    navigator.clipboard.writeText(email);
    setCopiedEmailId(id);
    setTimeout(() => setCopiedEmailId(null), 2000);
  };

  const handleSendInquiry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inquiryModalContact) return;

    const mailtoUrl = `mailto:${inquiryModalContact.email}?subject=${encodeURIComponent(
      `ABUAD Inquiry: ${inquirySubject} [${senderMatricOrAppNo || 'Prospective Applicant'}]`
    )}&body=${encodeURIComponent(
      `Dear ${inquiryModalContact.name},\n\n${inquiryMessage}\n\nSender Name: ${senderName}\nEmail: ${senderEmail}\nMatric/App No: ${senderMatricOrAppNo || 'N/A'}\nSent via ABUAD Virtual Assistant Portal.`
    )}`;

    window.open(mailtoUrl, '_blank');
    setInquirySubmitted(true);
    setTimeout(() => {
      setInquirySubmitted(false);
      setInquiryModalContact(null);
      setInquirySubject('');
      setInquiryMessage('');
    }, 2500);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 text-slate-200">
      {/* Header */}
      <div className="bg-[#08150D] rounded-3xl p-6 border border-emerald-900/40 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-[#0c1e13] text-emerald-400 border border-emerald-800/60">
              <Users className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-bold text-white font-['Outfit']">
              Faculty & Administrative Contact Directory
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Connect directly with Academic Deans, Student Affairs, Admissions, Bursary, ICT Support, and Emergency desks.
          </p>
        </div>

        <div className="relative min-w-[260px] sm:min-w-[320px]">
          <Search className="w-4 h-4 text-emerald-500/70 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, department, role, or email..."
            className="w-full pl-10 pr-4 py-2.5 bg-[#050D08] border border-emerald-900/60 text-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all placeholder:text-slate-500"
          />
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all cursor-pointer ${
              selectedCategory === cat.id
                ? 'bg-emerald-600 text-white shadow-[0_0_12px_rgba(16,185,129,0.35)] font-bold border border-emerald-400/40'
                : 'bg-[#08150D] text-emerald-300/80 hover:bg-[#0c1e13] hover:text-white border border-emerald-900/60'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Directory Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredContacts.map((contact) => {
          const isCopied = copiedEmailId === contact.id;

          return (
            <div
              key={contact.id}
              className="bg-[#08150D] rounded-2xl p-5 border border-emerald-900/40 shadow-md hover:border-emerald-800/60 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-[#0c1e13] text-emerald-300 border border-emerald-800/60">
                    {contact.department}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    contact.category === 'emergency' 
                      ? 'bg-rose-950/60 text-rose-300 border border-rose-800/60' 
                      : contact.category === 'executive' 
                      ? 'bg-amber-950/60 text-amber-300 border border-amber-800/60' 
                      : 'bg-[#0c1e13] text-emerald-300 border border-emerald-800/60'
                  }`}>
                    {contact.category.toUpperCase()}
                  </span>
                </div>

                <h3 className="font-bold text-white text-base font-['Outfit']">{contact.name}</h3>
                <p className="text-xs font-semibold text-emerald-400 mb-3">{contact.title}</p>

                {contact.responsibilities && (
                  <p className="text-xs text-slate-300 mb-4 bg-[#0c1e13] p-2.5 rounded-xl border border-emerald-900/60 leading-relaxed">
                    {contact.responsibilities}
                  </p>
                )}

                <div className="space-y-2 text-xs text-slate-300 pt-2 border-t border-emerald-900/40">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 truncate">
                      <Mail className="w-3.5 h-3.5 text-emerald-500/80 flex-shrink-0" />
                      <a href={`mailto:${contact.email}`} className="text-emerald-400 hover:underline truncate">
                        {contact.email}
                      </a>
                    </div>
                    <button
                      onClick={() => handleCopyEmail(contact.id, contact.email)}
                      className="p-1 text-slate-400 hover:text-emerald-300 cursor-pointer"
                      title="Copy Email"
                    >
                      {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-emerald-500/80 flex-shrink-0" />
                    <a href={`tel:${contact.phone}`} className="text-slate-200 font-medium hover:text-emerald-400">
                      {contact.phone}
                    </a>
                  </div>

                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-emerald-500/80 flex-shrink-0" />
                    <span className="truncate">{contact.office}</span>
                  </div>

                  <div className="flex items-center gap-2 text-slate-400">
                    <Clock className="w-3.5 h-3.5 text-emerald-500/80 flex-shrink-0" />
                    <span className="text-[11px]">{contact.availability}</span>
                  </div>
                </div>
              </div>

              {/* Card Action Buttons */}
              <div className="mt-4 pt-3 border-t border-emerald-900/40 flex gap-2">
                <button
                  onClick={() => setInquiryModalContact(contact)}
                  className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition-all shadow-[0_0_12px_rgba(16,185,129,0.35)] flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Inquiry</span>
                </button>

                <button
                  onClick={() => onAskAI(`What are the office hours, roles, and guidelines for contacting ${contact.name} (${contact.title}) at ABUAD?`)}
                  className="p-2 bg-[#0c1e13] hover:bg-[#10291a] text-emerald-300 border border-emerald-900/60 rounded-xl transition-colors cursor-pointer"
                  title="Ask AI about this officer"
                >
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Send Inquiry Modal */}
      {inquiryModalContact && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#08150D] rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-emerald-900/60 animate-in fade-in zoom-in-95 duration-150 text-slate-200">
            <div className="flex items-start justify-between border-b border-emerald-900/40 pb-4">
              <div>
                <span className="text-[11px] font-bold text-emerald-400 uppercase">Direct Official Inquiry</span>
                <h3 className="text-lg font-bold text-white mt-0.5 font-['Outfit']">
                  To: {inquiryModalContact.name}
                </h3>
                <p className="text-xs text-slate-400">{inquiryModalContact.title} • {inquiryModalContact.email}</p>
              </div>
              <button
                onClick={() => setInquiryModalContact(null)}
                className="p-1.5 text-slate-400 hover:text-slate-200 rounded-xl hover:bg-[#0c1e13] cursor-pointer"
              >
                ✕
              </button>
            </div>

            {inquirySubmitted ? (
              <div className="py-8 text-center space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
                <h4 className="font-bold text-white text-base">Inquiry Prepared & Email Client Opened!</h4>
                <p className="text-xs text-slate-300">
                  Your message draft has been composed and forwarded to {inquiryModalContact.email}.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSendInquiry} className="mt-4 space-y-3.5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">Your Full Name *</label>
                    <input
                      type="text"
                      required
                      value={senderName}
                      onChange={(e) => setSenderName(e.target.value)}
                      placeholder="e.g. Samuel Adebayo"
                      className="w-full px-3 py-2 bg-[#050D08] border border-emerald-900/60 text-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 placeholder:text-slate-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">Your Email Address *</label>
                    <input
                      type="email"
                      required
                      value={senderEmail}
                      onChange={(e) => setSenderEmail(e.target.value)}
                      placeholder="your.email@example.com"
                      className="w-full px-3 py-2 bg-[#050D08] border border-emerald-900/60 text-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 placeholder:text-slate-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Matric No / Application No (Optional)</label>
                  <input
                    type="text"
                    value={senderMatricOrAppNo}
                    onChange={(e) => setSenderMatricOrAppNo(e.target.value)}
                    placeholder="e.g. 2026/ABUAD/APP/1042 or 22/LAW01/045"
                    className="w-full px-3 py-2 bg-[#050D08] border border-emerald-900/60 text-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 placeholder:text-slate-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Inquiry Subject *</label>
                  <input
                    type="text"
                    required
                    value={inquirySubject}
                    onChange={(e) => setInquirySubject(e.target.value)}
                    placeholder="e.g. Clarification on Admission Screening / Transcript"
                    className="w-full px-3 py-2 bg-[#050D08] border border-emerald-900/60 text-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 placeholder:text-slate-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Message Content *</label>
                  <textarea
                    required
                    rows={4}
                    value={inquiryMessage}
                    onChange={(e) => setInquiryMessage(e.target.value)}
                    placeholder="Provide details about your question, requested assistance, or enquiry..."
                    className="w-full px-3 py-2 bg-[#050D08] border border-emerald-900/60 text-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 placeholder:text-slate-500"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setInquiryModalContact(null)}
                    className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-slate-200 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-[0_0_12px_rgba(16,185,129,0.35)] flex items-center gap-1.5 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Launch Email & Send</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
