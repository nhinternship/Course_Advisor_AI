import React, { useEffect, useRef, useState, useMemo } from 'react';
import { Sparkles, Waves, Eye, Hand, Move, Volume2, ShieldCheck, Play, Pause, ListOrdered } from 'lucide-react';
import { AudioSpectralMetrics } from '../utils/liveAudioEngine';

// Photorealistic Digital Human Avatar Frames (Dr. Funke Adeyemi)
// 1. Live Speech: Open mouth, visible teeth, realistic lip viseme, open-palm gesture
import speechAvatarImg from '../assets/images/avatar_live_speech_1788786228342.jpg';
// 2. Listening / Speech Pause: Resting lips, soft smile, hands together loosely
import pauseAvatarImg from '../assets/images/avatar_listening_pause_1788786248039.jpg';
// 3. Pointing & Counting: Mid-torso pointing finger for listing requirements
import pointingAvatarImg from '../assets/images/avatar_pointing_listing_1788786290956.jpg';
// 4. Natural Blink: Closed eyelids with realistic eyelid weight and lashes
import blinkAvatarImg from '../assets/images/avatar_eyes_blink_1788786313069.jpg';

export interface DittoAvatarProps {
  isSpeaking: boolean;
  isLoading: boolean;
  isLiveAudioActive: boolean;
  aiVolume: number;
  userVolume: number;
  audioMetrics?: AudioSpectralMetrics | null;
  wasInterrupted?: boolean;
  isExpanded?: boolean;
  speechRate?: number;
  speechText?: string;
}

export type AvatarVisualState = 'speech' | 'pause' | 'pointing' | 'blink';

export const DittoAvatarRenderer: React.FC<DittoAvatarProps> = ({
  isSpeaking,
  isLoading,
  isLiveAudioActive,
  aiVolume,
  userVolume,
  audioMetrics,
  wasInterrupted = false,
  isExpanded = false,
  speechRate = 0.88,
  speechText = '',
}) => {
  // Active visual frame
  const [activeFrame, setActiveFrame] = useState<AvatarVisualState>('pause');

  // Kinematic state: 3D perspective Euler angles + translation for torso & head
  const [headPose, setHeadPose] = useState({
    pitch: 0,
    yaw: 0,
    roll: 0,
    translateY: 0,
    scale: 1,
  });

  // Physical movement cues: Shoulder shifts & torso swaying
  const [shoulderShift, setShoulderShift] = useState({ x: 0, y: 0, roll: 0 });

  // Saccadic eye shifts (subtle focal shifts)
  const [gazeShift, setGazeShift] = useState({ x: 0, y: 0 });

  // Real-time telemetry indicators
  const [visemeLabel, setVisemeLabel] = useState<string>('Resting Lips');
  const [gestureLabel, setGestureLabel] = useState<string>('Hands Together • Pause');
  const [blinkStateLabel, setBlinkStateLabel] = useState<string>('~18/min');

  // Manual interactive triggers (for testing anytime)
  const [manualStateOverride, setManualStateOverride] = useState<AvatarVisualState | null>(null);
  const [testSpeechActive, setTestSpeechActive] = useState<boolean>(false);

  // Targets and smoothing refs for 60fps lerp
  const targetPoseRef = useRef({ pitch: 0, yaw: 0, roll: 0, translateY: 0, scale: 1 });
  const currentPoseRef = useRef({ pitch: 0, yaw: 0, roll: 0, translateY: 0, scale: 1 });
  const targetShoulderRef = useRef({ x: 0, y: 0, roll: 0 });
  const currentShoulderRef = useRef({ x: 0, y: 0, roll: 0 });

  // 1. Natural Eyelid Blink Cycle (15–20 blinks/min ~ every 3.2 to 4.2s with ~140ms duration)
  useEffect(() => {
    let blinkTimer: NodeJS.Timeout;
    let cancel = false;

    const executeBlink = () => {
      // Switch frame to natural blink frame
      setBlinkStateLabel('CLOSING');
      setActiveFrame('blink');

      const blinkDuration = 135 + Math.random() * 25; // 135-160ms realistic duration
      setTimeout(() => {
        if (cancel) return;
        setBlinkStateLabel('~18/min');
        // Restore non-blink frame based on current audio/speech state
        setActiveFrame(isSpeaking || testSpeechActive || aiVolume > 0.04 ? 'speech' : 'pause');

        // 20% natural double-blink micro-cadence
        if (Math.random() < 0.20) {
          setTimeout(() => {
            if (cancel) return;
            setBlinkStateLabel('CLOSING');
            setActiveFrame('blink');
            setTimeout(() => {
              if (cancel) return;
              setBlinkStateLabel('~18/min');
              setActiveFrame(isSpeaking || testSpeechActive || aiVolume > 0.04 ? 'speech' : 'pause');
              scheduleNextBlink();
            }, 120);
          }, 180);
        } else {
          scheduleNextBlink();
        }
      }, blinkDuration);
    };

    const scheduleNextBlink = () => {
      const wait = 3000 + Math.random() * 1200; // 15-20 blinks per minute
      blinkTimer = setTimeout(() => {
        if (cancel) return;
        executeBlink();
      }, wait);
    };

    scheduleNextBlink();
    return () => {
      cancel = true;
      clearTimeout(blinkTimer);
    };
  }, [isSpeaking, testSpeechActive, aiVolume]);

  // 2. Saccadic Eye Movements: Shift subtle gaze between camera lens & immediate surrounding space
  useEffect(() => {
    let saccadeTimer: NodeJS.Timeout;
    let cancel = false;

    const scheduleSaccade = () => {
      const interval = 1800 + Math.random() * 1400; // every 1.8-3.2s
      saccadeTimer = setTimeout(() => {
        if (cancel) return;
        const isDirect = Math.random() < 0.70;
        const offsetX = isDirect ? (Math.random() - 0.5) * 0.8 : (Math.random() - 0.5) * 2.5;
        const offsetY = isDirect ? (Math.random() - 0.5) * 0.5 : (Math.random() - 0.5) * 1.5;
        setGazeShift({ x: offsetX, y: offsetY });
        scheduleSaccade();
      }, interval);
    };

    scheduleSaccade();
    return () => {
      cancel = true;
      clearTimeout(saccadeTimer);
    };
  }, []);

  // 3. Real-Time Lip-Sync & Viseme Alternation Engine
  // Seamlessly cycles speech mouth open/teeth visibility with resting lips on phoneme cadence
  useEffect(() => {
    if (manualStateOverride) {
      setActiveFrame(manualStateOverride);
      return;
    }

    const effectiveSpeaking = isSpeaking || testSpeechActive || aiVolume > 0.04;
    const isUserTalking = userVolume > 0.08;

    const textLower = speechText.toLowerCase();
    const isListingContent =
      textLower.includes('first') ||
      textLower.includes('second') ||
      textLower.includes('third') ||
      textLower.includes('requirement') ||
      textLower.includes('criteria') ||
      textLower.includes('step') ||
      /\b\d\b/.test(textLower);

    if (wasInterrupted || isUserTalking) {
      setActiveFrame('pause');
      setVisemeLabel('Attentive Resting Lips');
      setGestureLabel(wasInterrupted ? '⚡ Interrupted • Hands Together' : 'Hands Together • Attentive');
      return;
    }

    if (isLoading) {
      setActiveFrame('pause');
      setVisemeLabel('Resting Lips');
      setGestureLabel('Hands Together • Consulting RAG');
      return;
    }

    if (!effectiveSpeaking) {
      setActiveFrame('pause');
      setVisemeLabel('Resting Lips');
      setGestureLabel('Hands Together • Gentle Breathing');
      return;
    }

    // When speaking:
    // If listing requirements, show pointing & counting frame
    if (isListingContent && Math.random() < 0.4) {
      setActiveFrame('pointing');
      setVisemeLabel('Communicative Viseme');
      setGestureLabel('Subtle Pointing • Listing Requirements');
      return;
    }

    // Alternates open-mouth / teeth viseme with resting lip viseme on human phoneme cadence (~5-7 Hz)
    let visemeCycleTimer: NodeJS.Timeout;
    let isMouthOpen = true;

    const runVisemeCycle = () => {
      if (!isSpeaking && !testSpeechActive && aiVolume <= 0.04) {
        setActiveFrame('pause');
        setVisemeLabel('Resting Lips');
        setGestureLabel('Hands Together • Pause');
        return;
      }

      isMouthOpen = !isMouthOpen;

      if (isMouthOpen) {
        setActiveFrame('speech');
        setVisemeLabel(aiVolume > 0.18 ? 'Open Vowel /ɑː, æ/ (Teeth Visible)' : 'Rounded Vowel /oʊ, uː/');
        setGestureLabel('Open-Palm Emphasis • Mid-Torso');
      } else {
        setActiveFrame('pause');
        setVisemeLabel('Plosive /p, b/ & Resting Lip');
        setGestureLabel('Open-Palm Cadence Sway');
      }

      // Varies cycle duration between 120ms and 210ms to simulate varied speech cadence
      const nextDelay = 120 + Math.random() * 90;
      visemeCycleTimer = setTimeout(runVisemeCycle, nextDelay);
    };

    runVisemeCycle();

    return () => {
      clearTimeout(visemeCycleTimer);
    };
  }, [isSpeaking, testSpeechActive, aiVolume, userVolume, speechText, isLoading, wasInterrupted, manualStateOverride]);

  // 4. 60 FPS Physics & Kinematics Engine (Breathing, Torso Sway, Shoulder Shifts, Head Pitch/Yaw/Roll)
  useEffect(() => {
    let animFrame: number;
    let time = 0;

    const updatePhysics = () => {
      time += 0.035;

      const effectiveVolume = testSpeechActive
        ? 0.22 + Math.sin(time * 6.0) * 0.16
        : aiVolume;
      const isAudiblyTalking = isSpeaking || testSpeechActive || effectiveVolume > 0.04;
      const isUserTalking = userVolume > 0.08;

      // Natural Breathing: Chest rising and falling softly (15 breaths/min)
      const breathingPhase = Math.sin(time * 1.57);
      const targetBreathingTranslateY = breathingPhase * 2.2;
      const targetBreathingScale = 1.0 + breathingPhase * 0.007;

      // Subtle shoulder shifts & torso swaying
      const targetShoulderX = Math.sin(time * 0.45) * 1.8 + (isAudiblyTalking ? Math.sin(time * 1.8) * 1.0 : 0);
      const targetShoulderY = Math.cos(time * 0.55) * 1.4;
      const targetShoulderRoll = Math.sin(time * 0.35) * 0.75;

      targetShoulderRef.current = {
        x: targetShoulderX,
        y: targetShoulderY,
        roll: targetShoulderRoll,
      };

      // Head kinematics
      let targetPitch = 0;
      let targetYaw = 0;
      let targetRoll = 0;
      let targetTranslateY = targetBreathingTranslateY;
      let targetScale = targetBreathingScale;

      if (isAudiblyTalking) {
        // Conversational speech nodding
        const speechNod = Math.sin(time * 5.8) * (2.2 * Math.min(1, effectiveVolume * 2.5));
        targetPitch = 0.8 + speechNod;
        targetYaw = Math.sin(time * 2.0) * 1.6;
        targetRoll = Math.cos(time * 2.4) * 1.2;
        targetScale = targetBreathingScale + Math.min(0.025, effectiveVolume * 0.04);
      } else if (isUserTalking) {
        // Attentive listening tilt
        targetPitch = Math.sin(time * 2.8) * 1.0 + 0.6;
        targetRoll = -2.2; // Warm collegiate listening tilt
        targetYaw = 0.6;
      } else if (isLoading) {
        // RAG consulting pose
        targetRoll = 2.4;
        targetPitch = -1.2;
        targetYaw = -1.5;
      } else {
        // Gentle head tilts during speech pauses
        targetYaw = Math.sin(time * 0.75) * 0.9;
        targetRoll = Math.cos(time * 0.55) * 0.8;
      }

      // Smooth lerp (avoids robotic jitter)
      const lerpHead = 0.14;
      currentPoseRef.current.pitch += (targetPitch - currentPoseRef.current.pitch) * lerpHead;
      currentPoseRef.current.yaw += (targetYaw - currentPoseRef.current.yaw) * lerpHead;
      currentPoseRef.current.roll += (targetRoll - currentPoseRef.current.roll) * lerpHead;
      currentPoseRef.current.translateY += (targetTranslateY - currentPoseRef.current.translateY) * lerpHead;
      currentPoseRef.current.scale += (targetScale - currentPoseRef.current.scale) * lerpHead;

      const lerpShoulder = 0.12;
      currentShoulderRef.current.x += (targetShoulderRef.current.x - currentShoulderRef.current.x) * lerpShoulder;
      currentShoulderRef.current.y += (targetShoulderRef.current.y - currentShoulderRef.current.y) * lerpShoulder;
      currentShoulderRef.current.roll += (targetShoulderRef.current.roll - currentShoulderRef.current.roll) * lerpShoulder;

      setHeadPose({
        pitch: currentPoseRef.current.pitch,
        yaw: currentPoseRef.current.yaw,
        roll: currentPoseRef.current.roll,
        translateY: currentPoseRef.current.translateY,
        scale: currentPoseRef.current.scale,
      });

      setShoulderShift({
        x: currentShoulderRef.current.x,
        y: currentShoulderRef.current.y,
        roll: currentShoulderRef.current.roll,
      });

      animFrame = requestAnimationFrame(updatePhysics);
    };

    animFrame = requestAnimationFrame(updatePhysics);
    return () => cancelAnimationFrame(animFrame);
  }, [isSpeaking, testSpeechActive, isLoading, aiVolume, userVolume]);

  // Combined 3D transform matrix: head motion + shoulder shift + gaze offset + locked background
  const avatarTransformStyle = useMemo(() => {
    return {
      transform: `
        perspective(1100px)
        translate3d(${gazeShift.x + shoulderShift.x}px, ${headPose.translateY + gazeShift.y + shoulderShift.y}px, 0px)
        rotateX(${headPose.pitch.toFixed(2)}deg)
        rotateY(${headPose.yaw.toFixed(2)}deg)
        rotateZ(${(headPose.roll + shoulderShift.roll).toFixed(2)}deg)
        scale(${headPose.scale.toFixed(3)})
      `,
      transformOrigin: '50% 68%',
      transition: 'transform 0.05s ease-out',
    };
  }, [headPose, gazeShift, shoulderShift]);

  // Determine which image asset to display based on active frame
  const currentImageAsset = useMemo(() => {
    switch (activeFrame) {
      case 'speech':
        return speechAvatarImg;
      case 'pointing':
        return pointingAvatarImg;
      case 'blink':
        return blinkAvatarImg;
      case 'pause':
      default:
        return pauseAvatarImg;
    }
  }, [activeFrame]);

  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden select-none bg-[#030805]">
      {/* 1. Locked Academic Office Background with Soft Bokeh (No camera jitter) */}
      <div className="absolute inset-0 bg-[#040C07] pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(16,185,129,0.12),transparent_65%)]" />
        <div className="absolute -top-16 -right-16 w-72 h-72 bg-emerald-900/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-16 -left-16 w-72 h-72 bg-teal-950/30 rounded-full blur-3xl" />
      </div>

      {/* 2. Dynamic Ambient Lighting Glow matched to vocal resonance */}
      <div
        className="absolute inset-0 pointer-events-none transition-opacity duration-150"
        style={{
          background: `radial-gradient(circle at 50% 38%, rgba(16, 185, 129, ${
            isSpeaking || testSpeechActive ? 0.20 + aiVolume * 0.35 : 0.05
          }), transparent 68%)`,
        }}
      />

      {/* 3. The Photorealistic Digital Human Avatar Layer with 60 FPS Kinematics */}
      <div
        className="w-full h-full relative flex items-center justify-center will-change-transform"
        style={avatarTransformStyle}
      >
        <img
          key={activeFrame}
          src={currentImageAsset}
          alt={`Real-Time Digital Human Avatar - Dr. Funke Adeyemi (${activeFrame})`}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-[center_20%] select-none pointer-events-none shadow-2xl transition-opacity duration-75"
          style={{
            filter: `brightness(${1 + (isSpeaking || testSpeechActive ? aiVolume * 0.06 : 0)}) contrast(1.02)`,
          }}
        />
      </div>

      {/* 4. Real-Time HUD & Gesture Telemetry Overlay */}
      <div className="absolute top-3 right-3 z-30 flex items-center gap-2 flex-wrap justify-end">
        {/* Active Gesture Pill */}
        <div className="px-2.5 py-1 rounded-xl bg-[#050D08]/85 backdrop-blur-md border border-emerald-500/50 text-[10px] font-mono text-emerald-300 font-bold flex items-center gap-1.5 shadow-md">
          <Hand className="w-3 h-3 text-emerald-400" />
          <span>{gestureLabel}</span>
        </div>

        {/* Active Viseme Pill */}
        <div className="px-2.5 py-1 rounded-xl bg-[#050D08]/85 backdrop-blur-md border border-emerald-700/50 text-[10px] font-mono text-emerald-300 font-medium flex items-center gap-1.5 shadow-md hidden sm:flex">
          <Waves className="w-3 h-3 text-emerald-400 animate-pulse" />
          <span>{visemeLabel}</span>
        </div>

        {/* 60 FPS Engine Tag */}
        <div className="px-2.5 py-1 rounded-xl bg-emerald-950/80 backdrop-blur-md border border-emerald-700/60 text-[10px] font-semibold text-emerald-200 hidden md:flex items-center gap-1 shadow-sm">
          <Sparkles className="w-3 h-3 text-emerald-400" />
          <span>Live Digital Human</span>
        </div>
      </div>

      {/* 5. Physical Movement Cues Mini-Telemetry (Shoulder Shifts, Kinematics, Blinking) */}
      <div className="absolute bottom-12 left-4 z-25 hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-xl bg-[#050D08]/85 backdrop-blur-md border border-emerald-900/60 text-[9px] font-mono text-slate-300 shadow-sm">
        <div className="flex items-center gap-1 text-emerald-400">
          <Move className="w-2.5 h-2.5" />
          <span>Shoulders: ({shoulderShift.x.toFixed(1)}px, {shoulderShift.y.toFixed(1)}px)</span>
        </div>
        <span className="text-emerald-800">•</span>
        <div className="flex items-center gap-1 text-emerald-300">
          <Eye className="w-2.5 h-2.5" />
          <span>Blink: {blinkStateLabel}</span>
        </div>
        <span className="text-emerald-800">•</span>
        <div className="flex items-center gap-1 text-slate-400">
          <span>P: {headPose.pitch.toFixed(1)}°</span>
          <span>Y: {headPose.yaw.toFixed(1)}°</span>
          <span>R: {headPose.roll.toFixed(1)}°</span>
        </div>
      </div>

      {/* 6. Quick Interactive Gesture & Lip-Sync Preview Controls Bar */}
      <div className="absolute top-12 left-4 z-25 flex items-center gap-1.5 flex-wrap">
        <button
          type="button"
          onClick={() => {
            setTestSpeechActive((prev) => !prev);
            setManualStateOverride(testSpeechActive ? null : 'speech');
          }}
          className={`px-2.5 py-1 rounded-lg text-[10px] font-mono border flex items-center gap-1 transition-all ${
            testSpeechActive
              ? 'bg-emerald-600 text-white border-emerald-400 shadow-md font-bold'
              : 'bg-[#050D08]/85 text-emerald-300 border-emerald-800/60 hover:bg-emerald-950/60'
          }`}
          title="Toggle live conversational speech with real-time lip-sync, visible teeth, and open-palm gestures"
        >
          {testSpeechActive ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
          <span>{testSpeechActive ? 'Stop Speech' : 'Test Speech & Lip-Sync'}</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setManualStateOverride('pointing');
            setGestureLabel('Subtle Pointing • Listing Requirements');
            setVisemeLabel('Communicative Articulation');
            setTimeout(() => setManualStateOverride(null), 4500);
          }}
          className="px-2.5 py-1 rounded-lg text-[10px] font-mono bg-[#050D08]/85 text-emerald-300 border border-emerald-800/60 hover:bg-emerald-950/60 flex items-center gap-1 transition-all"
          title="Simulate listing requirements with pointing and counting gestures"
        >
          <ListOrdered className="w-3 h-3 text-emerald-400" />
          <span>List Steps</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setManualStateOverride('pause');
            setGestureLabel('Hands Together • Speech Pause');
            setVisemeLabel('Resting Lips');
            setTimeout(() => setManualStateOverride(null), 3500);
          }}
          className="px-2.5 py-1 rounded-lg text-[10px] font-mono bg-[#050D08]/85 text-emerald-300 border border-emerald-800/60 hover:bg-emerald-950/60 flex items-center gap-1 transition-all"
          title="Simulate inter-sentence pause with hands brought loosely together"
        >
          <Hand className="w-3 h-3 text-emerald-400" />
          <span>Hands Pause</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveFrame('blink');
            setBlinkStateLabel('CLOSING');
            setTimeout(() => {
              setActiveFrame('pause');
              setBlinkStateLabel('~18/min');
            }, 180);
          }}
          className="px-2 py-1 rounded-lg text-[10px] font-mono bg-[#050D08]/85 text-slate-300 border border-emerald-900/60 hover:bg-emerald-950/60 flex items-center gap-1 transition-all"
          title="Trigger a realistic human eyelid blink cycle"
        >
          <Eye className="w-3 h-3 text-emerald-400" />
          <span>Blink</span>
        </button>
      </div>
    </div>
  );
};
