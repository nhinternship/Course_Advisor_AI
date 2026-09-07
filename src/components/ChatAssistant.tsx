import React, { useState, useRef, useEffect, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import { 
  Send, 
  Sparkles, 
  Copy, 
  Check, 
  RotateCcw, 
  GraduationCap, 
  BookOpen, 
  School,
  ExternalLink,
  ArrowRight,
  Database,
  ChevronDown,
  ChevronUp,
  Globe,
  FileText
} from 'lucide-react';
import { ChatMessage, AppTab, UserRole, RAGSourceCitation } from '../types';
import { LiveVoiceStage } from './LiveVoiceStage';
import { RAGKnowledgeModal } from './RAGKnowledgeModal';
import { RAGEngine } from '../utils/ragEngine';

interface ChatAssistantProps {
  setActiveTab: (tab: AppTab) => void;
  userRole: UserRole;
  initialQuery?: string;
}

export const ChatAssistant: React.FC<ChatAssistantProps> = ({
  setActiveTab,
  userRole,
  initialQuery,
}) => {
  // Clear chat by default
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedMsgId, setCopiedMsgId] = useState<string | null>(null);
  const [isRAGModalOpen, setIsRAGModalOpen] = useState(false);
  const [isVoiceStageExpanded, setIsVoiceStageExpanded] = useState(true);
  const [activeSources, setActiveSources] = useState<RAGSourceCitation[]>([]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const lastInitialQueryRef = useRef<string | null>(null);
  const messagesRef = useRef(messages);
  const userRoleRef = useRef(userRole);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  useEffect(() => {
    userRoleRef.current = userRole;
  }, [userRole]);

  // Save to local storage
  useEffect(() => {
    localStorage.setItem('abuad_chat_messages', JSON.stringify(messages));
  }, [messages]);

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSendMessage = useCallback(async (userText: string) => {
    if (!userText.trim()) return;

    const userMessage: ChatMessage = {
      id: 'msg-' + Date.now(),
      role: 'user',
      text: userText.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // 1. RAG Knowledge Retrieval
    const ragResult = RAGEngine.queryKnowledge(userText.trim(), 4);
    setActiveSources(ragResult.citations);

    try {
      // Build history payload for server
      const currentHistory = messagesRef.current;
      const historyPayload = currentHistory.slice(-8).map((m) => ({
        role: m.role,
        text: m.text,
      }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userText.trim(),
          history: historyPayload,
          userRole: userRoleRef.current,
          ragContext: ragResult.formattedContext,
        }),
      });

      if (!res.ok) {
        throw new Error(`Server responded with ${res.status}`);
      }

      const data = await res.json();
      const replyText = data.reply || 'No response returned.';

      // Determine smart suggested actions - leaving Open Admissions Roadmap & Explore Course Catalog
      const suggestedActions: ChatMessage['suggestedActions'] = [];
      const lower = replyText.toLowerCase();

      if (lower.includes('admission') || lower.includes('jamb') || lower.includes('cut-off') || lower.includes('apply') || lower.includes('requirement')) {
        suggestedActions.push({ label: 'Open Admissions Roadmap & Checker', tab: 'admissions' });
      }
      if (lower.includes('course') || lower.includes('program') || lower.includes('engineering') || lower.includes('law') || lower.includes('medicine') || lower.includes('college') || lower.includes('degree')) {
        suggestedActions.push({ label: 'Explore Course Catalog', tab: 'courses' });
      }

      const botMessage: ChatMessage = {
        id: 'msg-' + Date.now() + '-bot',
        role: 'model',
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedActions: suggestedActions.length > 0 ? suggestedActions : undefined,
        sources: ragResult.citations.length > 0 ? ragResult.citations : undefined,
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (err: any) {
      console.error('Chat error:', err);

      // Offline / fallback response grounded in local RAG knowledge
      let fallbackText = '';
      if (ragResult.chunks.length > 0) {
        fallbackText = `### Grounded Response from Official ABUAD Records:\n\n${ragResult.chunks[0].text}\n\n*Source: ${ragResult.chunks[0].docName} (https://www.abuad.edu.ng/)*`;
      } else {
        fallbackText = `**Notice**: Unable to connect to the cloud AI server right now. All cached ABUAD admissions guidelines, fee schedules, campus maps, and course catalogs remain fully accessible in the navigation tabs!`;
      }

      const errorMessage: ChatMessage = {
        id: 'msg-' + Date.now() + '-err',
        role: 'model',
        text: fallbackText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedActions: [
          { label: 'Open Admissions Roadmap & Checker', tab: 'admissions' },
          { label: 'Explore Course Catalog', tab: 'courses' },
        ],
        sources: ragResult.citations.length > 0 ? ragResult.citations : undefined,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Handle incoming initial query safely
  useEffect(() => {
    if (initialQuery && initialQuery.trim() && initialQuery !== lastInitialQueryRef.current) {
      lastInitialQueryRef.current = initialQuery;
      handleSendMessage(initialQuery);
    }
  }, [initialQuery, handleSendMessage]);

  const handleCopy = (msgId: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMsgId(msgId);
    setTimeout(() => setCopiedMsgId(null), 2000);
  };

  const handleClearChat = () => {
    localStorage.removeItem('abuad_chat_messages');
    setMessages([]);
  };

  const latestModelMessage = messages.filter((m) => m.role === 'model').slice(-1)[0];

  return (
    <div className="space-y-4 max-w-5xl mx-auto w-full pb-8">
      {/* 3D AVATAR LIVE VOICE STAGE AT CENTER */}
      {isVoiceStageExpanded && (
        <LiveVoiceStage
          isSpeaking={false}
          isLoading={isLoading}
          onSendMessage={handleSendMessage}
          onOpenRAGModal={() => setIsRAGModalOpen(true)}
          latestModelText={latestModelMessage?.text}
          activeSources={activeSources}
        />
      )}

      {/* Main Conversation Container */}
      <div className="flex flex-col h-[520px] sm:h-[580px] w-full bg-[#08150D] text-slate-200 rounded-3xl shadow-[0_4px_30px_rgba(0,0,0,0.7)] border border-emerald-900/40 overflow-hidden">
        {/* Assistant Header */}
        <div className="bg-[#050D08] text-white px-4 sm:px-6 py-3.5 border-b border-emerald-900/40 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-9 h-9 rounded-xl bg-[#0c1e13] border border-emerald-600/50 flex items-center justify-center text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.3)]">
                <Sparkles className="w-4 h-4 animate-pulse text-emerald-300" />
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 border-2 border-[#050D08] rounded-full shadow-[0_0_8px_#34d399]"></span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-sm sm:text-base text-white font-['Outfit']">
                  ABUAD 3D AI Advisor Conversation
                </h2>
                <span className="px-2 py-0.5 text-[10px] font-bold bg-[#0c1e13] text-emerald-300 border border-emerald-700/50 rounded-full">
                  RAG Active
                </span>
              </div>
              <p className="text-[11px] text-emerald-400/80">
                {userRole === 'student' ? 'Current Student Support Mode' : 'Prospective Applicant & Parent Mode'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsVoiceStageExpanded(!isVoiceStageExpanded)}
              className="flex items-center gap-1 px-2.5 py-1 text-xs text-slate-300 hover:text-white bg-[#0c1e13] hover:bg-[#10291a] rounded-lg transition-colors border border-emerald-900/60 cursor-pointer"
              title={isVoiceStageExpanded ? 'Minimize 3D Live Stage' : 'Expand 3D Live Stage'}
            >
              {isVoiceStageExpanded ? (
                <>
                  <ChevronUp className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="hidden sm:inline">Hide Stage</span>
                </>
              ) : (
                <>
                  <ChevronDown className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="hidden sm:inline">Show 3D Stage</span>
                </>
              )}
            </button>

            <button
              onClick={() => setIsRAGModalOpen(true)}
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs text-emerald-300 hover:text-white bg-[#0c1e13] hover:bg-[#10291a] rounded-lg transition-colors border border-emerald-800/60 cursor-pointer"
              title="Manage RAG Knowledge Documents"
            >
              <Database className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Knowledge Vault</span>
            </button>

            <button
              onClick={handleClearChat}
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs text-slate-400 hover:text-white hover:bg-emerald-950/60 rounded-lg transition-colors border border-emerald-900/60 cursor-pointer"
              title="Clear Chat History"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Clear Chat</span>
            </button>
          </div>
        </div>

        {/* Primary 2-Action Selection Area: Open Admissions Roadmap & Checker AND Explore Course Catalog ONLY */}
        <div className="bg-[#050D08] border-b border-emerald-900/40 p-3 sm:p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-4xl mx-auto">
            {/* Action 1: Open Admissions Roadmap & Checker */}
            <button
              id="btn-open-admissions-roadmap"
              onClick={() => setActiveTab('admissions')}
              className="group p-3.5 rounded-2xl bg-gradient-to-br from-[#0c1e13] to-[#08150D] hover:from-[#10291a] hover:to-[#0c1e13] border border-emerald-700/50 hover:border-emerald-500/80 transition-all text-left shadow-md flex items-center justify-between cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-900/40 border border-emerald-600/50 flex items-center justify-center text-emerald-300 group-hover:scale-105 group-hover:bg-emerald-600 group-hover:text-white transition-all shadow-sm">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-xs sm:text-sm text-white group-hover:text-emerald-300 transition-colors font-['Outfit'] flex items-center gap-1.5">
                    Open Admissions Roadmap & Checker
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    UTME cut-offs, Direct Entry, O'Level & screening guide
                  </p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-emerald-400 opacity-60 group-hover:opacity-100 group-hover:translate-x-1 transition-all ml-2 shrink-0" />
            </button>

            {/* Action 2: Explore Course Catalog */}
            <button
              id="btn-explore-course-catalog"
              onClick={() => setActiveTab('courses')}
              className="group p-3.5 rounded-2xl bg-gradient-to-br from-[#0c1e13] to-[#08150D] hover:from-[#10291a] hover:to-[#0c1e13] border border-emerald-700/50 hover:border-emerald-500/80 transition-all text-left shadow-md flex items-center justify-between cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-900/40 border border-emerald-600/50 flex items-center justify-center text-emerald-300 group-hover:scale-105 group-hover:bg-emerald-600 group-hover:text-white transition-all shadow-sm">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-xs sm:text-sm text-white group-hover:text-emerald-300 transition-colors font-['Outfit'] flex items-center gap-1.5">
                    Explore Course Catalog
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Browse all 8 Colleges, accredited degrees & faculties
                  </p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-emerald-400 opacity-60 group-hover:opacity-100 group-hover:translate-x-1 transition-all ml-2 shrink-0" />
            </button>
          </div>
        </div>

        {/* Messages Scroll Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-[#050D08]/70">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center px-4 py-8 text-slate-400">
              <div className="w-12 h-12 rounded-2xl bg-[#0c1e13] border border-emerald-800/60 flex items-center justify-center text-emerald-400 mb-3 shadow-inner">
                <School className="w-6 h-6" />
              </div>
              <h4 className="text-white font-bold text-sm sm:text-base font-['Outfit'] mb-1">
                Chat Cleared & Ready
              </h4>
              <p className="text-xs text-slate-400 max-w-sm mb-4">
                Use the shortcuts above to explore admissions or colleges, start Live Audio, or type your enquiry below.
              </p>
            </div>
          ) : (
            messages.map((msg) => {
              const isUser = msg.role === 'user';
              return (
                <div
                  key={msg.id}
                  className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  {/* Avatar */}
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-xs font-bold shadow-xs ${
                      isUser
                        ? 'bg-emerald-600 text-white shadow-[0_0_10px_rgba(16,185,129,0.3)]'
                        : 'bg-gradient-to-tr from-[#08150D] to-[#10291a] text-emerald-400 border border-emerald-600/40'
                    }`}
                  >
                    {isUser ? 'You' : <School className="w-4 h-4" />}
                  </div>

                  {/* Message Bubble */}
                  <div className={`max-w-[85%] sm:max-w-[80%] rounded-2xl p-4 shadow-md ${
                    isUser
                      ? 'bg-emerald-600 text-white rounded-tr-xs shadow-[0_0_15px_rgba(16,185,129,0.25)]'
                      : 'bg-[#0c1e13] text-slate-200 border border-emerald-900/60 rounded-tl-xs'
                  }`}>
                    {/* Message Content */}
                    <div className={`text-sm leading-relaxed ${isUser ? 'text-white' : 'text-slate-200'}`}>
                      {isUser ? (
                        <p className="whitespace-pre-wrap">{msg.text}</p>
                      ) : (
                        <div className="prose prose-sm max-w-none text-slate-200 prose-headings:font-bold prose-headings:text-emerald-300 prose-headings:font-['Outfit'] prose-a:text-emerald-400 prose-strong:text-emerald-200 prose-ul:my-2 prose-li:my-0.5">
                          <ReactMarkdown>{msg.text}</ReactMarkdown>
                        </div>
                      )}
                    </div>

                    {/* RAG Source Grounding Citations */}
                    {!isUser && msg.sources && msg.sources.length > 0 && (
                      <div className="mt-3 pt-2.5 border-t border-emerald-900/40 space-y-1.5">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                          <Globe className="w-3 h-3 text-emerald-400" />
                          Grounded Knowledge Sources ({msg.sources.length}):
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {msg.sources.map((src, idx) => (
                            <div
                              key={idx}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] bg-[#08150D] text-emerald-300 border border-emerald-900/60"
                            >
                              {src.sourceType === 'official_abuad_web' ? (
                                <Globe className="w-3 h-3 text-emerald-400" />
                              ) : (
                                <FileText className="w-3 h-3 text-teal-400" />
                              )}
                              <span className="font-medium line-clamp-1">{src.title}</span>
                              {src.url && (
                                <a
                                  href={src.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-emerald-400 hover:text-white ml-0.5"
                                  title="Open official web source"
                                >
                                  <ExternalLink className="w-2.5 h-2.5" />
                                </a>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Suggested Action Buttons if attached */}
                    {!isUser && msg.suggestedActions && msg.suggestedActions.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-emerald-900/40 flex flex-wrap gap-2">
                        {msg.suggestedActions.map((action, idx) => (
                          <button
                            key={idx}
                            onClick={() => {
                              if (action.tab) setActiveTab(action.tab);
                              if (action.query) handleSendMessage(action.query);
                            }}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#10291a] hover:bg-[#153823] text-emerald-300 border border-emerald-800/60 transition-colors shadow-xs cursor-pointer"
                          >
                            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                            <span>{action.label}</span>
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Bubble Footer & Actions */}
                    <div className={`mt-2 flex items-center justify-between text-[11px] ${
                      isUser ? 'text-emerald-200' : 'text-slate-400'
                    }`}>
                      <span>{msg.timestamp}</span>

                      {!isUser && (
                        <div className="flex items-center space-x-1.5">
                          {/* Copy message button */}
                          <button
                            onClick={() => handleCopy(msg.id, msg.text)}
                            className="p-1 hover:text-emerald-400 hover:bg-emerald-950/50 rounded transition-colors cursor-pointer"
                            title="Copy to Clipboard"
                          >
                            {copiedMsgId === msg.id ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}

          {/* Loading Bubble */}
          {isLoading && (
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#08150D] to-[#10291a] flex items-center justify-center text-emerald-400 flex-shrink-0 border border-emerald-700/40">
                <School className="w-4 h-4" />
              </div>
              <div className="bg-[#0c1e13] border border-emerald-900/60 rounded-2xl rounded-tl-xs p-4 shadow-md">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce"></div>
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce [animation-delay:0.2s]"></div>
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce [animation-delay:0.4s]"></div>
                  <span className="text-xs text-emerald-300/80 font-medium ml-2">
                    3D Advisor is querying RAG knowledge & https://www.abuad.edu.ng/...
                  </span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Control Box */}
        <div className="p-3 sm:p-4 bg-[#08150D] border-t border-emerald-900/40">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage(input);
            }}
            className="flex items-center gap-2"
          >
            <input
              ref={inputRef}
              type="text"
              id="chat-user-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about admissions, cut-off marks, fees, hostels, courses, directions..."
              disabled={isLoading}
              className="flex-1 px-4 py-3 bg-[#050D08] text-slate-100 placeholder:text-slate-500 text-sm rounded-xl border border-emerald-900/60 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-[#06120b] transition-all disabled:opacity-50"
            />

            <button
              type="submit"
              id="chat-send-btn"
              disabled={isLoading || !input.trim()}
              className="px-5 py-3 bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-950/60 disabled:text-slate-500 text-white rounded-xl font-semibold text-sm transition-all shadow-[0_0_15px_rgba(5,150,105,0.4)] flex items-center gap-2 disabled:cursor-not-allowed cursor-pointer"
            >
              <span className="hidden sm:inline">Ask AI</span>
              <Send className="w-4 h-4" />
            </button>
          </form>
          <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2 px-1">
            <span>Powered by Gemini 3.7 Flash + RAG Knowledge Vault</span>
            <button
              onClick={() => setIsRAGModalOpen(true)}
              className="text-emerald-400 hover:underline cursor-pointer flex items-center gap-1"
            >
              <Database className="w-3 h-3" />
              <span>Upload Custom Docs</span>
            </button>
          </div>
        </div>
      </div>

      {/* RAG KNOWLEDGE BASE MANAGEMENT MODAL */}
      <RAGKnowledgeModal
        isOpen={isRAGModalOpen}
        onClose={() => setIsRAGModalOpen(false)}
        onSelectSnippetQuery={(q) => handleSendMessage(q)}
      />
    </div>
  );
};


