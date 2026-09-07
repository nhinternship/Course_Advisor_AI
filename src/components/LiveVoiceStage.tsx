import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Sparkles,
  Database,
  Globe,
  Radio,
  Activity,
  Zap,
  PhoneCall,
  PhoneOff,
  Camera,
  CameraOff,
  Scan,
  Maximize2,
  Minimize2,
  ShieldCheck,
  Gauge
} from 'lucide-react';
import { AvatarPose, RAGSourceCitation } from '../types';
import abuadLogoCrest from '../assets/images/abuad_logo_crest_1788198732395.jpg';
import { NigerianVoiceEngine } from '../utils/voiceSynthesis';
import { LiveAudioEngine, LiveSessionStatus, AudioSpectralMetrics } from '../utils/liveAudioEngine';
import { DittoAvatarRenderer } from './DittoAvatarRenderer';

interface LiveVoiceStageProps {
  isSpeaking: boolean;
  isLoading: boolean;
  onSendMessage: (text: string) => void;
  onOpenRAGModal: () => void;
  latestModelText?: string;
  activeSources?: RAGSourceCitation[];
}

export const LiveVoiceStage: React.FC<LiveVoiceStageProps> = ({
  isSpeaking: externalIsSpeaking,
  isLoading: externalIsLoading,
  onSendMessage,
  onOpenRAGModal,
  latestModelText,
  activeSources = [],
}) => {
  // Live Audio Engine state
  const [liveEngineStatus, setLiveEngineStatus] = useState<LiveSessionStatus>('disconnected');
  const [isLiveAudioActive, setIsLiveAudioActive] = useState(false);
  const [isMicMuted, setIsMicMuted] = useState(false);

  // Vision Tool State ("Avatar Can See You" - from Akapulu video tutorial)
  const [isVisionActive, setIsVisionActive] = useState(false);
  const [visionError, setVisionError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const visionStreamRef = useRef<MediaStream | null>(null);

  // Ditto Neural Avatar & Kinematic States
  const [isExpandedView, setIsExpandedView] = useState(false);
  const [audioMetrics, setAudioMetrics] = useState<AudioSpectralMetrics | null>(null);

  // General Voice / Avatar State
  const [speechRate, setSpeechRate] = useState<number>(0.88); // Default: measured Nigerian cadence
  const [isVoiceOutputEnabled, setIsVoiceOutputEnabled] = useState(true);
  const [pose, setPose] = useState<AvatarPose>('idle');
  const [aiVolume, setAiVolume] = useState<number>(0);
  const [userVolume, setUserVolume] = useState<number>(0);
  const [liveTranscript, setLiveTranscript] = useState<{ role: 'user' | 'model'; text: string } | null>(null);
  const [speechStatus, setSpeechStatus] = useState<string>('Real-Time Digital Human Advisor • Audio-to-Audio Ready');
  const [wasInterrupted, setWasInterrupted] = useState(false);

  // Web Speech fallback recognition
  const [isWebSpeechMicActive, setIsWebSpeechMicActive] = useState(false);
  const recognitionRef = useRef<any>(null);
  const liveEngineRef = useRef<LiveAudioEngine | null>(null);
  const onSendMessageRef = useRef(onSendMessage);

  useEffect(() => {
    onSendMessageRef.current = onSendMessage;
  }, [onSendMessage]);

  // Real-Time Lip-Sync & Viseme Modulation during speech
  const isCurrentlySpeaking = pose === 'speaking' || externalIsSpeaking || aiVolume > 0.08;
  const lastSpokenTextRef = useRef<string | null>(null);

  // Initialize Speech Synthesis and check voices
  useEffect(() => {
    NigerianVoiceEngine.init();
  }, []);

  // Real-time Speech Audio Synthesis & direct Lip-Sync Synchronization
  useEffect(() => {
    if (!latestModelText || !isVoiceOutputEnabled || isLiveAudioActive) {
      return;
    }

    // Don't re-speak the exact same text automatically
    if (latestModelText === lastSpokenTextRef.current) {
      return;
    }
    lastSpokenTextRef.current = latestModelText;

    setPose('speaking');
    setSpeechStatus('Speaking with Nigerian accent & real-time synchronized lip-sync...');

    NigerianVoiceEngine.speak(latestModelText, {
      customRate: speechRate,
      onStart: () => {
        setPose('speaking');
        setSpeechStatus('Speaking with Nigerian accent & real-time synchronized lip-sync...');
      },
      onVolume: (vol) => {
        setAiVolume(vol);
      },
      onViseme: (v) => {
        setAudioMetrics({
          volume: aiVolume || 0.45,
          lowFreq: v === 'open' ? 0.8 : 0.25,
          midFreq: v === 'wide' ? 0.7 : 0.3,
          highFreq: 0.2,
          viseme: v,
        });
      },
      onEnd: () => {
        setPose('idle');
        setAiVolume(0);
        setAudioMetrics(null);
        setSpeechStatus('Real-Time Digital Human Advisor • Online & Ready');
      },
      onError: () => {
        setPose('idle');
        setAiVolume(0);
        setAudioMetrics(null);
        setSpeechStatus('Real-Time Digital Human Advisor • Online & Ready');
      },
    });

    return () => {
      NigerianVoiceEngine.stop();
    };
  }, [latestModelText, isVoiceOutputEnabled, isLiveAudioActive, speechRate]);

  // Fallback simulator if external speaking is forced without text
  useEffect(() => {
    if (!externalIsSpeaking || isLiveAudioActive || pose === 'speaking') {
      return;
    }

    const visemeCycle: Array<'open' | 'vowel_o' | 'wide' | 'fricative'> = [
      'open', 'vowel_o', 'open', 'wide', 'open', 'fricative'
    ];
    let idx = 0;
    const interval = setInterval(() => {
      idx = (idx + 1) % visemeCycle.length;
      const currentViseme = visemeCycle[idx];
      setAudioMetrics({
        volume: 0.35 + Math.random() * 0.35,
        lowFreq: currentViseme === 'open' ? 0.6 : 0.25,
        midFreq: currentViseme === 'wide' ? 0.7 : 0.3,
        highFreq: currentViseme === 'fricative' ? 0.65 : 0.15,
        viseme: currentViseme,
      });
      setAiVolume(0.3 + Math.random() * 0.3);
    }, 130);

    return () => {
      clearInterval(interval);
      setAudioMetrics(null);
      setAiVolume(0);
    };
  }, [externalIsSpeaking, isLiveAudioActive, pose]);

  // Handle interruption / barge-in
  const handleInterruption = useCallback((fromEngine: boolean = false) => {
    setWasInterrupted(true);
    setPose('listening');
    setAiVolume(0);
    setAudioMetrics(null);
    setSpeechStatus('⚡ Interrupted: Stopped speech immediately. Listening to your new question...');
    NigerianVoiceEngine.stop();

    if (!fromEngine && liveEngineRef.current) {
      liveEngineRef.current.interruptModel('user_barge_in');
    }

    setTimeout(() => {
      setWasInterrupted(false);
    }, 3000);
  }, []);

  // Initialize Live Audio Engine callbacks once
  useEffect(() => {
    const engine = new LiveAudioEngine({
      onStatusChange: (status, message) => {
        setLiveEngineStatus(status);
        if (message) setSpeechStatus(message);

        if (status === 'speaking') {
          setPose('speaking');
        } else if (status === 'listening') {
          setPose('listening');
        } else if (status === 'interrupted') {
          setPose('listening');
          setWasInterrupted(true);
          setTimeout(() => setWasInterrupted(false), 2500);
        } else if (status === 'connected') {
          setPose('idle');
        } else if (status === 'disconnected') {
          setPose('idle');
          setIsLiveAudioActive(false);
        }
      },
      onUserVolume: (vol) => {
        setUserVolume(vol);
      },
      onModelVolume: (vol) => {
        setAiVolume(vol);
      },
      onAudioMetrics: (metrics) => {
        setAudioMetrics(metrics);
      },
      onTranscript: (role, text) => {
        setLiveTranscript({ role, text });
        if (role === 'user' && text.trim()) {
          onSendMessageRef.current(text.trim());
        }
      },
      onInterrupted: () => {
        handleInterruption(true);
      },
      onTurnComplete: () => {
        setPose('idle');
      },
      onError: (err) => {
        console.warn('Live Engine Error:', err);
      },
    });

    liveEngineRef.current = engine;

    return () => {
      engine.stopSession();
    };
  }, [handleInterruption]);

  // Sync avatar pose with external props when not in direct live audio stream
  useEffect(() => {
    if (isLiveAudioActive) return;

    if (externalIsSpeaking) {
      setPose('speaking');
      setSpeechStatus('Speaking with natural Nigerian accent & real-time lip sync...');
    } else if (isWebSpeechMicActive) {
      setPose('listening');
      setSpeechStatus('Attentively listening to your question...');
    } else if (externalIsLoading) {
      setPose('thinking');
      setSpeechStatus('Advisor is querying RAG knowledge & https://www.abuad.edu.ng/...');
    } else {
      setPose('idle');
      setSpeechStatus('Real-Time Digital Human Advisor • Online & Ready');
    }
  }, [externalIsSpeaking, isWebSpeechMicActive, externalIsLoading, isLiveAudioActive]);

  // Clean up user webcam on unmount
  useEffect(() => {
    return () => {
      if (visionStreamRef.current) {
        visionStreamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  // Web Speech Fallback Setup
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-NG'; // Nigerian English

      recognition.onstart = () => {
        setIsWebSpeechMicActive(true);
        setSpeechStatus('Listening to your enquiry...');
      };

      recognition.onresult = (event: any) => {
        const current = event.resultIndex;
        const resultTranscript = event.results[current][0].transcript;
        setLiveTranscript({ role: 'user', text: resultTranscript });

        if (event.results[current].isFinal) {
          setIsWebSpeechMicActive(false);
          if (resultTranscript.trim()) {
            onSendMessageRef.current(resultTranscript.trim());
          }
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        setIsWebSpeechMicActive(false);
        setSpeechStatus('Microphone standby');
      };

      recognition.onend = () => {
        setIsWebSpeechMicActive(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  // Toggle Live Audio Stream (Direct Audio-to-Audio with Interception)
  const toggleLiveAudioSession = async () => {
    if (!liveEngineRef.current) return;

    if (isLiveAudioActive) {
      liveEngineRef.current.stopSession();
      setIsLiveAudioActive(false);
      setLiveEngineStatus('disconnected');
    } else {
      NigerianVoiceEngine.stop();
      const success = await liveEngineRef.current.startSession();
      if (success) {
        setIsLiveAudioActive(true);
      }
    }
  };

  // Toggle standard mic (fallback mode)
  const toggleStandardMic = () => {
    if (isLiveAudioActive && liveEngineRef.current) {
      const muted = liveEngineRef.current.toggleMute();
      setIsMicMuted(muted);
      return;
    }

    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in this browser. Please use text chat.');
      return;
    }

    if (isWebSpeechMicActive) {
      recognitionRef.current.stop();
      setIsWebSpeechMicActive(false);
    } else {
      try {
        NigerianVoiceEngine.stop();
        recognitionRef.current.start();
      } catch (e) {
        console.error('Mic start error:', e);
      }
    }
  };

  // Toggle Vision Tool ("Avatar Can See You" - Camera feature from tutorial)
  const toggleVisionTool = async () => {
    if (isVisionActive) {
      if (visionStreamRef.current) {
        visionStreamRef.current.getTracks().forEach((track) => track.stop());
        visionStreamRef.current = null;
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
      setIsVisionActive(false);
      setVisionError(null);
    } else {
      setVisionError(null);
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 640 },
            height: { ideal: 480 },
            facingMode: 'user',
          },
        });
        visionStreamRef.current = stream;
        setIsVisionActive(true);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch((e) => console.warn('Video play error:', e));
        }
      } catch (err: any) {
        console.warn('Camera access denied or error:', err);
        setVisionError('Camera permission required to enable Vision Mode.');
      }
    }
  };

  // Connect video element to stream if stream exists
  useEffect(() => {
    if (isVisionActive && videoRef.current && visionStreamRef.current) {
      videoRef.current.srcObject = visionStreamRef.current;
      videoRef.current.play().catch(() => {});
    }
  }, [isVisionActive]);

  return (
    <div className="relative bg-[#07130B] rounded-3xl border border-emerald-900/60 shadow-[0_12px_45px_rgba(0,0,0,0.85)] overflow-hidden transition-all">
      {/* Background Studio Lighting & Vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(16,185,129,0.12),transparent_75%)] pointer-events-none" />
      <div className="absolute -top-24 -right-24 w-80 h-80 bg-emerald-900/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-teal-950/30 rounded-full blur-3xl pointer-events-none" />

      {/* Top Studio Control Bar */}
      <div className="relative z-10 px-4 sm:px-6 py-3 bg-[#050D08]/90 border-b border-emerald-900/50 flex items-center justify-between flex-wrap gap-2.5 backdrop-blur-md">
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Identity & Real-Time Badge */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-[#0c1e13] border border-emerald-700/60 shadow-sm">
            <img
              src={abuadLogoCrest}
              alt="ABUAD Seal"
              referrerPolicy="no-referrer"
              className="w-5 h-5 rounded-full object-cover ring-1 ring-emerald-400/50 shadow-xs"
            />
            <span className="text-xs font-bold tracking-wide text-white font-['Outfit']">
              Dr. Funke Adeyemi
            </span>
            <span className="text-[10px] text-emerald-400/90 font-medium hidden sm:inline">
              • ABUAD AI Academic Advisor
            </span>
          </div>

          {/* Real-time Status Beacon */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-emerald-950/60 border border-emerald-700/40 text-[11px] font-bold text-emerald-300">
            <span className={`w-2 h-2 rounded-full ${
              isCurrentlySpeaking
                ? 'bg-emerald-400 animate-ping'
                : isLiveAudioActive
                ? 'bg-amber-400 animate-pulse'
                : 'bg-emerald-500'
            }`} />
            <span>{isLiveAudioActive ? 'Live Audio Connected' : 'Real-Time Avatar Ready'}</span>
          </div>

          {/* Vision Status Beacon */}
          <div className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-semibold border transition-all ${
            isVisionActive
              ? 'bg-cyan-950/70 text-cyan-300 border-cyan-500/60 shadow-[0_0_10px_rgba(6,182,212,0.25)]'
              : 'bg-[#050D08] text-slate-400 border-emerald-900/40'
          }`}>
            <Scan className={`w-3 h-3 ${isVisionActive ? 'text-cyan-400 animate-spin' : 'text-slate-500'}`} />
            <span>{isVisionActive ? 'Vision Online (Can See You)' : 'Vision Standby'}</span>
          </div>
        </div>

        {/* Right Tools: Speech Rate, View Toggle, RAG Hub */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Cadence Selection */}
          <div className="flex items-center bg-[#08150D] px-2 py-1 rounded-xl border border-emerald-900/60 text-[11px] text-slate-300">
            <Gauge className="w-3 h-3 text-emerald-400 mr-1.5" />
            <button
              onClick={() => setSpeechRate(0.82)}
              className={`px-1.5 py-0.5 rounded cursor-pointer ${speechRate === 0.82 ? 'bg-emerald-800 text-white font-bold' : 'hover:text-white'}`}
              title="Calm"
            >
              0.82x
            </button>
            <button
              onClick={() => setSpeechRate(0.88)}
              className={`px-1.5 py-0.5 rounded cursor-pointer ${speechRate === 0.88 ? 'bg-emerald-600 text-white font-bold' : 'hover:text-white'}`}
              title="Measured Nigerian cadence"
            >
              0.88x (Calm)
            </button>
            <button
              onClick={() => setSpeechRate(1.0)}
              className={`px-1.5 py-0.5 rounded cursor-pointer ${speechRate === 1.0 ? 'bg-emerald-800 text-white font-bold' : 'hover:text-white'}`}
              title="Standard"
            >
              1.0x
            </button>
          </div>

          {/* Voice Output Toggle */}
          <button
            onClick={() => {
              if (isVoiceOutputEnabled) {
                NigerianVoiceEngine.stop();
                setPose('idle');
                setAiVolume(0);
                setAudioMetrics(null);
                setIsVoiceOutputEnabled(false);
              } else {
                setIsVoiceOutputEnabled(true);
                if (latestModelText) {
                  lastSpokenTextRef.current = null; // force speak
                }
              }
            }}
            className={`px-2.5 py-1 rounded-xl text-[11px] font-bold border transition-all flex items-center gap-1.5 cursor-pointer ${
              isVoiceOutputEnabled
                ? 'bg-emerald-950/80 text-emerald-300 border-emerald-600/60 shadow-xs'
                : 'bg-[#08150D] text-slate-400 border-emerald-950/80 hover:text-white'
            }`}
            title={isVoiceOutputEnabled ? 'Spoken Voice Output is ON. Click to mute.' : 'Spoken Voice Output is MUTED. Click to enable.'}
          >
            {isVoiceOutputEnabled ? <Volume2 className="w-3.5 h-3.5 text-emerald-400" /> : <VolumeX className="w-3.5 h-3.5 text-slate-500" />}
            <span className="hidden sm:inline">{isVoiceOutputEnabled ? 'Voice ON' : 'Voice Muted'}</span>
          </button>

          {/* RAG Knowledge Hub */}
          <button
            onClick={onOpenRAGModal}
            className="px-3 py-1.5 rounded-xl bg-[#0c1e13] hover:bg-[#10291a] text-emerald-300 hover:text-white border border-emerald-800/60 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
            title="Inspect Official ABUAD Knowledge Base"
          >
            <Database className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">RAG Hub</span>
          </button>

          {/* Expanded Video Frame Toggle */}
          <button
            onClick={() => setIsExpandedView(!isExpandedView)}
            className="p-2 rounded-xl bg-[#08150D] hover:bg-[#0c1e13] text-slate-300 hover:text-white border border-emerald-900/60 transition-colors cursor-pointer"
            title={isExpandedView ? 'Compact Video View' : 'Expanded Studio View'}
          >
            {isExpandedView ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Interruption / Barge-in Notice Banner */}
      {wasInterrupted && (
        <div className="relative z-20 mx-4 sm:mx-6 my-2 px-4 py-2 rounded-2xl bg-amber-500/20 border border-amber-400/60 text-amber-200 text-xs font-bold flex items-center justify-between gap-2 shadow-lg animate-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400 animate-pulse" />
            <span>⚡ Barge-In: AI stopped speaking to immediately address your new question!</span>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-100 uppercase font-mono">Instant Intercept</span>
        </div>
      )}

      {/* MAIN REAL-TIME CONVERSATIONAL AVATAR VIDEO STAGE */}
      <div className="relative z-10 p-4 sm:p-6 flex flex-col items-center justify-center">
        {/* Widescreen / Studio Video Frame Container */}
        <div
          className={`relative w-full rounded-3xl overflow-hidden border-2 border-emerald-700/50 bg-[#040A06] shadow-[0_10px_35px_rgba(0,0,0,0.9)] transition-all duration-300 ${
            isExpandedView
              ? 'max-w-4xl h-[420px] sm:h-[480px]'
              : 'max-w-2xl h-[330px] sm:h-[370px]'
          }`}
        >
          {/* Subtle Ambient Studio Spotlight Backdrop */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#050D08] via-transparent to-transparent z-10 pointer-events-none" />

          {/* High-Tech Biometric Target Brackets in Corners (like in AI Avatar video) */}
          <div className="absolute top-3 left-3 w-5 h-5 border-t-2 border-l-2 border-emerald-400/70 z-20 pointer-events-none" />
          <div className="absolute top-3 right-3 w-5 h-5 border-t-2 border-r-2 border-emerald-400/70 z-20 pointer-events-none" />
          <div className="absolute bottom-16 left-3 w-5 h-5 border-b-2 border-l-2 border-emerald-400/70 z-20 pointer-events-none" />
          <div className="absolute bottom-16 right-3 w-5 h-5 border-b-2 border-r-2 border-emerald-400/70 z-20 pointer-events-none" />

          {/* The Real-Time Conversational AI Avatar with Realistic Gestures, Lip Movements & Facial Expressions */}
          <DittoAvatarRenderer
            isSpeaking={isCurrentlySpeaking}
            isLoading={externalIsLoading}
            isLiveAudioActive={isLiveAudioActive}
            aiVolume={aiVolume}
            userVolume={userVolume}
            audioMetrics={audioMetrics}
            wasInterrupted={wasInterrupted}
            isExpanded={isExpandedView}
            speechRate={speechRate}
            speechText={latestModelText || liveTranscript?.text || ''}
          />

          {/* TOP HUD: Live Session Badges */}
          <div className="absolute top-4 left-4 z-20 flex items-center gap-2 flex-wrap">
            <div className="px-3 py-1 rounded-full bg-[#050D08]/85 backdrop-blur-md border border-emerald-600/60 text-white font-mono text-[11px] font-bold flex items-center gap-1.5 shadow-md">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
              <span>LIVE AVATAR</span>
            </div>

            <div className="px-2.5 py-1 rounded-full bg-[#050D08]/80 backdrop-blur-md border border-emerald-800/60 text-emerald-300 text-[10px] font-semibold hidden sm:flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              <span>Official University Model</span>
            </div>
          </div>

          {/* TOP RIGHT: Vision Mode Status Indicator */}
          {isVisionActive && (
            <div className="absolute top-4 right-4 z-20 flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950/85 backdrop-blur-md border border-cyan-400/80 text-cyan-200 text-[11px] font-bold shadow-lg animate-in fade-in">
              <Scan className="w-3.5 h-3.5 text-cyan-300 animate-spin" />
              <span>Vision: Observing User Feed</span>
            </div>
          )}

          {/* USER CAMERA PICTURE-IN-PICTURE (PiP) - "Avatar Can See You" from Tutorial */}
          {isVisionActive && (
            <div className="absolute bottom-16 right-4 z-25 w-32 sm:w-44 h-24 sm:h-32 rounded-2xl overflow-hidden border-2 border-cyan-400/80 shadow-[0_0_20px_rgba(6,182,212,0.4)] bg-[#050D08] backdrop-blur-md">
              {/* Webcam video element */}
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover transform -scale-x-100"
              />

              {/* Animated Scanline Overlay */}
              <div className="absolute inset-x-0 h-1 bg-cyan-400/80 shadow-[0_0_8px_#22d3ee] animate-vision-scan pointer-events-none" />

              {/* HUD Target Corners on user video */}
              <div className="absolute top-1 left-1 w-2.5 h-2.5 border-t border-l border-cyan-300 pointer-events-none" />
              <div className="absolute top-1 right-1 w-2.5 h-2.5 border-t border-r border-cyan-300 pointer-events-none" />
              <div className="absolute bottom-1 left-1 w-2.5 h-2.5 border-b border-l border-cyan-300 pointer-events-none" />
              <div className="absolute bottom-1 right-1 w-2.5 h-2.5 border-b border-r border-cyan-300 pointer-events-none" />

              <div className="absolute bottom-1 inset-x-1 px-1.5 py-0.5 rounded-md bg-[#050D08]/80 text-[9px] font-mono text-cyan-300 font-bold text-center truncate pointer-events-none">
                Camera Live
              </div>
            </div>
          )}

          {/* BOTTOM OVERLAY: Real-Time Audio Equalizer Waveform */}
          <div className="absolute bottom-2 inset-x-0 z-20 px-4 sm:px-6 flex items-center justify-between gap-3">
            {/* Advisor Nameplate */}
            <div className="px-3 py-1 rounded-xl bg-[#050D08]/85 backdrop-blur-md border border-emerald-800/60 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="text-xs font-bold text-white font-['Outfit']">
                Dr. Funke Adeyemi
              </span>
              <span className="text-[10px] text-emerald-400 font-mono hidden md:inline">
                • Nigerian Accent
              </span>
            </div>

            {/* Audio Reactive Equalizer Bar Visualizer */}
            <div className="flex items-center gap-1 h-5 px-3 py-1 rounded-xl bg-[#050D08]/85 backdrop-blur-md border border-emerald-800/60">
              {[...Array(16)].map((_, i) => {
                const multiplier = ((i * 17) % 7) / 7;
                const barHeight = isCurrentlySpeaking
                  ? Math.max(3, Math.min(18, aiVolume * 18 * (0.5 + multiplier * 0.8)))
                  : (isWebSpeechMicActive || userVolume > 0.05)
                  ? Math.max(3, Math.min(18, userVolume * 18 * (0.6 + multiplier * 0.6)))
                  : 3;

                return (
                  <div
                    key={i}
                    className={`w-1 rounded-full transition-all duration-75 ${
                      isCurrentlySpeaking
                        ? 'bg-gradient-to-t from-emerald-500 to-teal-300'
                        : 'bg-gradient-to-t from-amber-500 to-emerald-400'
                    }`}
                    style={{
                      height: `${barHeight}px`,
                      opacity: isCurrentlySpeaking || isWebSpeechMicActive || userVolume > 0.05 ? 0.95 : 0.3,
                    }}
                  />
                );
              })}
            </div>
          </div>
        </div>

        {/* Live Subtitle Transcript Bubble */}
        {liveTranscript && (
          <div className="mt-3 px-4 py-2 bg-[#0c1e13] border border-emerald-600/60 rounded-2xl text-xs text-emerald-200 flex items-center gap-2 shadow-lg animate-in fade-in max-w-xl text-center">
            {liveTranscript.role === 'user' ? (
              <Mic className="w-3.5 h-3.5 text-amber-400 shrink-0 animate-pulse" />
            ) : (
              <Volume2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            )}
            <span className="italic font-medium">"{liveTranscript.text}"</span>
          </div>
        )}

        {/* Vision Error Toast if any */}
        {visionError && (
          <div className="mt-2 px-3 py-1.5 rounded-xl bg-rose-950/80 border border-rose-500/60 text-rose-200 text-xs font-semibold">
            {visionError}
          </div>
        )}

        {/* Status Subtitle */}
        <p className="text-xs text-slate-400 font-medium mt-2 text-center max-w-lg">
          {speechStatus}
        </p>
      </div>

      {/* PRIMARY REAL-TIME CONVERSATIONAL ACTION CONTROLS */}
      <div className="relative z-10 flex flex-wrap items-center justify-center gap-2.5 sm:gap-3 p-4 bg-[#050D08]/95 border-t border-emerald-900/50 backdrop-blur-md">
        {/* 1. Start Live Audio (Audio-to-Audio) with Nigerian Accent */}
        <button
          id="btn-live-audio-session"
          onClick={toggleLiveAudioSession}
          className={`px-5 py-3 rounded-2xl font-bold text-xs sm:text-sm transition-all flex items-center gap-2.5 cursor-pointer shadow-lg ${
            isLiveAudioActive
              ? 'bg-rose-700 hover:bg-rose-600 text-white shadow-[0_0_20px_rgba(190,18,60,0.5)] animate-pulse'
              : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_25px_rgba(16,185,129,0.4)] hover:scale-[1.02]'
          }`}
        >
          {isLiveAudioActive ? (
            <>
              <PhoneOff className="w-4 h-4" />
              <span>End Live Audio Session</span>
            </>
          ) : (
            <>
              <PhoneCall className="w-4 h-4" />
              <span>Start Live Audio (Audio-to-Audio)</span>
            </>
          )}
        </button>

        {/* 2. Barge-in / Intercept Button (Active during Live Audio when AI is speaking) */}
        {isLiveAudioActive && isCurrentlySpeaking && (
          <button
            id="btn-barge-in-intercept"
            onClick={() => handleInterruption(false)}
            className="px-4 py-3 rounded-2xl font-bold text-xs sm:text-sm bg-amber-500 hover:bg-amber-400 text-slate-950 transition-all flex items-center gap-2 cursor-pointer shadow-[0_0_20px_rgba(245,158,11,0.5)] animate-bounce"
            title="Interrupt the assistant immediately to ask another question"
          >
            <Zap className="w-4 h-4 fill-slate-950" />
            <span>Intercept / Ask New Question</span>
          </button>
        )}

        {/* 3. Mute / Unmute Microphone */}
        <button
          id="btn-toggle-mic"
          onClick={toggleStandardMic}
          className={`px-4 py-3 rounded-2xl font-bold text-xs sm:text-sm transition-all flex items-center gap-2 cursor-pointer border shadow-md ${
            isMicMuted || isWebSpeechMicActive
              ? 'bg-amber-600 hover:bg-amber-500 text-white border-amber-400 shadow-[0_0_15px_rgba(217,119,6,0.4)]'
              : 'bg-[#0c1e13] hover:bg-[#10291a] text-emerald-300 border-emerald-700/60'
          }`}
        >
          {isMicMuted ? (
            <>
              <MicOff className="w-4 h-4" />
              <span>Unmute Mic</span>
            </>
          ) : (
            <>
              <Mic className="w-4 h-4 text-emerald-400" />
              <span>{isWebSpeechMicActive ? 'Listening...' : 'Mute Mic'}</span>
            </>
          )}
        </button>

        {/* 4. Avatar Vision Tool ("Can See You" - from tutorial video) */}
        <button
          id="btn-toggle-vision"
          onClick={toggleVisionTool}
          className={`px-4 py-3 rounded-2xl font-bold text-xs sm:text-sm transition-all flex items-center gap-2 cursor-pointer border shadow-md ${
            isVisionActive
              ? 'bg-cyan-700 hover:bg-cyan-600 text-white border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.4)]'
              : 'bg-[#0c1e13] hover:bg-[#10291a] text-cyan-300 border-cyan-700/60'
          }`}
          title="Turn user camera on/off so the Avatar can see you and your documents"
        >
          {isVisionActive ? (
            <>
              <CameraOff className="w-4 h-4" />
              <span>Turn Off Vision</span>
            </>
          ) : (
            <>
              <Camera className="w-4 h-4 text-cyan-400" />
              <span>Avatar Vision (Can See You)</span>
            </>
          )}
        </button>

        {/* 5. Quick Document Analysis Prompt if Vision is Active */}
        {isVisionActive && (
          <button
            onClick={() => onSendMessage("I am holding up my document/credential in front of the camera. Please inspect it for ABUAD admission qualification.")}
            className="px-3.5 py-3 rounded-2xl font-bold text-xs sm:text-sm bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 text-white shadow-md flex items-center gap-1.5 cursor-pointer animate-pulse"
            title="Ask Avatar to analyze the document held up to the camera"
          >
            <Scan className="w-4 h-4" />
            <span>Analyze Held Document</span>
          </button>
        )}
      </div>
    </div>
  );
};
