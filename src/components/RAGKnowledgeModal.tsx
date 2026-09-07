import React, { useState, useEffect } from 'react';
import {
  FileText,
  Upload,
  Plus,
  Trash2,
  CheckCircle2,
  ToggleLeft,
  ToggleRight,
  Search,
  BookOpen,
  Sparkles,
  ExternalLink,
  ShieldAlert,
  Layers,
  Database,
  Globe,
  X
} from 'lucide-react';
import { RAGEngine, OFFICIAL_ABUAD_CHUNKS } from '../utils/ragEngine';
import { RAGDocument, RAGChunk } from '../types';

interface RAGKnowledgeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSnippetQuery?: (query: string) => void;
}

export const RAGKnowledgeModal: React.FC<RAGKnowledgeModalProps> = ({
  isOpen,
  onClose,
  onSelectSnippetQuery,
}) => {
  const [documents, setDocuments] = useState<RAGDocument[]>([]);
  const [activeTab, setActiveTab] = useState<'manage' | 'official' | 'test'>('manage');
  
  // Upload Form State
  const [docTitle, setDocTitle] = useState('');
  const [docCategory, setDocCategory] = useState<RAGDocument['category']>('general');
  const [docContent, setDocContent] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  // Test Query State
  const [testQuery, setTestQuery] = useState('');
  const [testResults, setTestResults] = useState<{
    chunks: RAGChunk[];
    citations: any[];
    formattedContext: string;
  } | null>(null);

  // Preview Document State
  const [previewDoc, setPreviewDoc] = useState<RAGDocument | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadDocuments();
    }
  }, [isOpen]);

  const loadDocuments = () => {
    const docs = RAGEngine.getUserDocuments();
    setDocuments(docs);
  };

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        setDocTitle(file.name.replace(/\.[^/.]+$/, ''));
        setDocContent(text);
      }
    };
    reader.readAsText(file);
  };

  const handleAddDocument = (e: React.FormEvent) => {
    e.preventDefault();
    if (!docTitle.trim() || !docContent.trim()) return;

    setIsUploading(true);
    try {
      RAGEngine.addDocument(docTitle.trim(), docContent.trim(), docCategory);
      setDocTitle('');
      setDocContent('');
      setUploadSuccess(true);
      loadDocuments();
      setTimeout(() => setUploadSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to add document:', err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to remove this document from the RAG Knowledge Base?')) {
      RAGEngine.deleteDocument(id);
      loadDocuments();
    }
  };

  const handleToggleActive = (id: string) => {
    RAGEngine.toggleDocumentActive(id);
    loadDocuments();
  };

  const handleRunTestQuery = () => {
    if (!testQuery.trim()) return;
    const res = RAGEngine.queryKnowledge(testQuery, 4);
    setTestResults(res);
  };

  const totalUserChunks = documents.reduce((acc, d) => acc + (d.active ? d.chunksCount : 0), 0);
  const totalOfficialChunks = OFFICIAL_ABUAD_CHUNKS.length;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200">
      <div className="bg-[#08150D] rounded-3xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-emerald-900/60 text-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-[#050D08] px-6 py-4 border-b border-emerald-900/40 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0c1e13] border border-emerald-800/60 flex items-center justify-center text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.3)]">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-bold text-white font-['Outfit']">
                  RAG Knowledge Base & Document Hub
                </h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#0c1e13] text-emerald-300 border border-emerald-700/50 font-bold">
                  Sourced from https://www.abuad.edu.ng/
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Augment the 3D AI Advisor with custom university circulars, handbooks, syllabi, or department notices.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-[#0c1e13] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stats & Navigation Bar */}
        <div className="bg-[#0c1e13]/60 px-6 py-3 border-b border-emerald-900/30 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('manage')}
              className={`px-3.5 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                activeTab === 'manage'
                  ? 'bg-emerald-600 text-white shadow-[0_0_10px_rgba(16,185,129,0.35)]'
                  : 'bg-[#08150D] text-slate-300 hover:text-white border border-emerald-900/60'
              }`}
            >
              Upload & Manage Docs ({documents.length})
            </button>
            <button
              onClick={() => setActiveTab('official')}
              className={`px-3.5 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                activeTab === 'official'
                  ? 'bg-emerald-600 text-white shadow-[0_0_10px_rgba(16,185,129,0.35)]'
                  : 'bg-[#08150D] text-slate-300 hover:text-white border border-emerald-900/60'
              }`}
            >
              Official Web Vault ({totalOfficialChunks} Chunks)
            </button>
            <button
              onClick={() => setActiveTab('test')}
              className={`px-3.5 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                activeTab === 'test'
                  ? 'bg-emerald-600 text-white shadow-[0_0_10px_rgba(16,185,129,0.35)]'
                  : 'bg-[#08150D] text-slate-300 hover:text-white border border-emerald-900/60'
              }`}
            >
              Live Retrieval Test Bench
            </button>
          </div>

          <div className="flex items-center gap-3 text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399]"></span>
              Active Indexed Chunks: <strong className="text-emerald-300">{totalOfficialChunks + totalUserChunks}</strong>
            </span>
          </div>
        </div>

        {/* Modal Scroll Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* TAB 1: UPLOAD & MANAGE CUSTOM DOCUMENTS */}
          {activeTab === 'manage' && (
            <div className="space-y-6">
              {/* Add New Document Form */}
              <div className="bg-[#050D08] p-5 rounded-2xl border border-emerald-900/50 shadow-md">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2 font-['Outfit']">
                    <Plus className="w-4 h-4 text-emerald-400" />
                    Upload or Paste Knowledge Document
                  </h3>
                  <label className="cursor-pointer text-xs font-semibold px-3 py-1.5 bg-[#0c1e13] hover:bg-[#10291a] text-emerald-300 border border-emerald-800/60 rounded-xl transition-colors flex items-center gap-1.5">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Text File (.txt, .md, .csv)</span>
                    <input
                      type="file"
                      accept=".txt,.md,.csv,.json"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                {uploadSuccess && (
                  <div className="mb-4 p-3 bg-emerald-950/60 border border-emerald-700/60 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span>Document successfully chunked, indexed, and integrated into the RAG engine!</span>
                  </div>
                )}

                <form onSubmit={handleAddDocument} className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-2">
                      <label className="text-xs font-bold text-slate-300 block mb-1">
                        Document Title / Reference Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={docTitle}
                        onChange={(e) => setDocTitle(e.target.value)}
                        placeholder="e.g. 2026/2027 Post-UTME Screening Protocol or Engineering Syllabus"
                        className="w-full px-3 py-2 bg-[#08150D] border border-emerald-900/60 rounded-xl text-xs text-slate-100 placeholder:text-slate-500 focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-300 block mb-1">Category</label>
                      <select
                        value={docCategory}
                        onChange={(e) => setDocCategory(e.target.value as any)}
                        className="w-full px-3 py-2 bg-[#08150D] border border-emerald-900/60 rounded-xl text-xs text-slate-200 focus:ring-2 focus:ring-emerald-500"
                      >
                        <option value="general">General University</option>
                        <option value="admissions">Admissions & JAMB</option>
                        <option value="fees">Fees & Installments</option>
                        <option value="syllabus">Curriculum & Courses</option>
                        <option value="circular">Dean Circular / Notice</option>
                        <option value="handbook">Student Handbook / Rules</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">
                      Document Text Content *
                    </label>
                    <textarea
                      required
                      rows={4}
                      value={docContent}
                      onChange={(e) => setDocContent(e.target.value)}
                      placeholder="Paste guidelines, exam timetable, admission policy notes, hostel allocations, or course descriptions..."
                      className="w-full px-3 py-2 bg-[#08150D] border border-emerald-900/60 rounded-xl text-xs text-slate-100 placeholder:text-slate-500 focus:ring-2 focus:ring-emerald-500 font-mono"
                    />
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={isUploading || !docTitle.trim() || !docContent.trim()}
                      className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl transition-all shadow-[0_0_12px_rgba(16,185,129,0.35)] flex items-center gap-1.5 cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Index & Store in RAG Vault</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* Uploaded Documents List */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Custom Uploaded Knowledge Base Documents ({documents.length})
                </h4>

                {documents.length === 0 ? (
                  <div className="bg-[#050D08] p-8 text-center rounded-2xl border border-emerald-900/40 text-slate-400 space-y-2">
                    <FileText className="w-8 h-8 text-emerald-500/50 mx-auto" />
                    <p className="text-xs font-semibold text-slate-300">No custom documents uploaded yet.</p>
                    <p className="text-[11px] text-slate-500">
                      The AI Advisor is currently answering questions using verified knowledge sourced from the official university site https://www.abuad.edu.ng/. You can upload course outlines, circulars, or policies anytime above.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {documents.map((doc) => (
                      <div
                        key={doc.id}
                        className={`p-4 rounded-2xl border transition-all ${
                          doc.active
                            ? 'bg-[#050D08] border-emerald-900/60 shadow-md'
                            : 'bg-[#050D08]/50 border-slate-800 opacity-60'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-[#0c1e13] text-emerald-300 border border-emerald-800/60">
                              {doc.category}
                            </span>
                            <h5 className="font-bold text-sm text-white mt-1.5 line-clamp-1">{doc.name}</h5>
                            <p className="text-[11px] text-slate-400 mt-0.5">
                              {doc.chunksCount} Chunks • {(doc.sizeBytes / 1024).toFixed(1)} KB • {doc.uploadedAt}
                            </p>
                          </div>

                          <button
                            onClick={() => handleToggleActive(doc.id)}
                            className="text-emerald-400 hover:text-emerald-300 cursor-pointer"
                            title={doc.active ? 'Disable from RAG retrieval' : 'Enable in RAG retrieval'}
                          >
                            {doc.active ? (
                              <ToggleRight className="w-6 h-6 text-emerald-400" />
                            ) : (
                              <ToggleLeft className="w-6 h-6 text-slate-600" />
                            )}
                          </button>
                        </div>

                        <div className="mt-3 pt-3 border-t border-emerald-900/40 flex items-center justify-between text-xs">
                          <button
                            onClick={() => setPreviewDoc(doc)}
                            className="text-emerald-400 hover:underline font-semibold text-[11px] cursor-pointer"
                          >
                            Preview Content ({doc.chunksCount} chunks)
                          </button>

                          <button
                            onClick={() => handleDelete(doc.id)}
                            className="text-rose-400 hover:text-rose-300 p-1 rounded-lg hover:bg-rose-950/40 transition-colors cursor-pointer"
                            title="Delete Document"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: OFFICIAL SITE ABUAD.EDU.NG KNOWLEDGE CHUNKS */}
          {activeTab === 'official' && (
            <div className="space-y-4">
              <div className="bg-[#050D08] p-4 rounded-2xl border border-emerald-900/60 flex items-start gap-3">
                <Globe className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <div className="text-xs">
                  <h4 className="font-bold text-white">Verified Grounding: https://www.abuad.edu.ng/</h4>
                  <p className="text-slate-300 mt-0.5">
                    All base AI queries and admissions answers are grounded in these pre-indexed sections extracted from the official Afe Babalola University portal.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {OFFICIAL_ABUAD_CHUNKS.map((chunk, idx) => (
                  <div
                    key={chunk.id}
                    className="bg-[#050D08] p-4 rounded-2xl border border-emerald-900/40 space-y-2"
                  >
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5 text-emerald-400" />
                        {chunk.docName}
                      </span>
                      {chunk.url && (
                        <a
                          href={chunk.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[11px] text-emerald-400 hover:underline flex items-center gap-1 font-semibold"
                        >
                          <span>Visit Web Source</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed font-sans whitespace-pre-wrap">
                      {chunk.text}
                    </p>
                    <div className="flex flex-wrap gap-1 pt-1">
                      {chunk.keywords.slice(0, 6).map((k, i) => (
                        <span
                          key={i}
                          className="text-[10px] px-2 py-0.5 rounded-md bg-[#0c1e13] text-emerald-300/80 border border-emerald-900/60 font-mono"
                        >
                          #{k}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: LIVE RETRIEVAL TEST BENCH */}
          {activeTab === 'test' && (
            <div className="space-y-4">
              <div className="bg-[#050D08] p-4 rounded-2xl border border-emerald-900/60 space-y-3">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Search className="w-4 h-4 text-emerald-400" />
                  Test RAG Semantic Retrieval
                </h4>
                <p className="text-xs text-slate-400">
                  Type any query below to see which official website chunks or uploaded document snippets are retrieved and supplied to the 3D Advisor.
                </p>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={testQuery}
                    onChange={(e) => setTestQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleRunTestQuery()}
                    placeholder="e.g. What is the tuition fee installment plan or JAMB cut-off for Law?"
                    className="flex-1 px-3 py-2 bg-[#08150D] border border-emerald-900/60 rounded-xl text-xs text-slate-100 placeholder:text-slate-500 focus:ring-2 focus:ring-emerald-500"
                  />
                  <button
                    onClick={handleRunTestQuery}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-[0_0_10px_rgba(16,185,129,0.35)] flex items-center gap-1.5 cursor-pointer"
                  >
                    <Search className="w-3.5 h-3.5" />
                    <span>Run Query</span>
                  </button>
                </div>
              </div>

              {testResults && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-300">
                      Retrieved {testResults.chunks.length} Top Relevant Knowledge Snippets:
                    </span>
                  </div>

                  {testResults.chunks.length === 0 ? (
                    <p className="text-xs text-slate-500 p-4 text-center bg-[#050D08] rounded-2xl">
                      No matching chunks found for this query.
                    </p>
                  ) : (
                    testResults.chunks.map((chunk, i) => (
                      <div
                        key={chunk.id}
                        className="bg-[#050D08] p-4 rounded-2xl border border-emerald-900/60 space-y-2"
                      >
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-emerald-400">
                            Rank #{i + 1} • {chunk.docName}
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#0c1e13] text-emerald-300 border border-emerald-800/60">
                            {chunk.sourceType === 'official_abuad_web' ? 'Official Web Grounding' : 'User Uploaded'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-200 leading-relaxed font-sans">{chunk.text}</p>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Document Preview Drawer/Modal */}
        {previewDoc && (
          <div className="fixed inset-0 z-60 bg-black/80 flex items-center justify-center p-4">
            <div className="bg-[#08150D] rounded-3xl max-w-2xl w-full p-6 border border-emerald-900/60 shadow-2xl space-y-4 max-h-[80vh] flex flex-col">
              <div className="flex items-center justify-between border-b border-emerald-900/40 pb-3">
                <h3 className="font-bold text-white text-base font-['Outfit']">{previewDoc.name}</h3>
                <button
                  onClick={() => setPreviewDoc(null)}
                  className="p-1 text-slate-400 hover:text-white cursor-pointer"
                >
                  ✕
                </button>
              </div>
              <div className="flex-1 overflow-y-auto bg-[#050D08] p-4 rounded-2xl border border-emerald-900/40 font-mono text-xs text-slate-300 whitespace-pre-wrap leading-relaxed">
                {previewDoc.rawText}
              </div>
              <div className="flex justify-end">
                <button
                  onClick={() => setPreviewDoc(null)}
                  className="px-4 py-2 bg-emerald-600 text-white font-bold text-xs rounded-xl cursor-pointer"
                >
                  Close Preview
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
