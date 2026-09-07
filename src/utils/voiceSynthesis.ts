// Voice Synthesis Engine configured for Nigerian Accent Female Voice
// Optimized with measured pacing (not fast, ~0.88 rate) and warm natural pitch.

export interface VoiceSettings {
  rate: number; // e.g. 0.88 for measured, articulated pace
  pitch: number; // e.g. 1.1 for warm female timbre
  volume: number;
  voiceURI?: string;
  lang: string;
}

export const DEFAULT_VOICE_SETTINGS: VoiceSettings = {
  rate: 0.88, // "not fast" - measured, warm, clear Nigerian cadence
  pitch: 1.12, // natural female pitch
  volume: 1.0,
  lang: 'en-NG', // Nigerian English locale
};

export class NigerianVoiceEngine {
  private static cachedVoices: SpeechSynthesisVoice[] = [];
  private static isInitialized = false;

  public static init() {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    
    const updateVoices = () => {
      this.cachedVoices = window.speechSynthesis.getVoices();
      this.isInitialized = true;
    };

    updateVoices();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = updateVoices;
    }
  }

  public static getAvailableVoices(): SpeechSynthesisVoice[] {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return [];
    if (this.cachedVoices.length === 0) {
      this.cachedVoices = window.speechSynthesis.getVoices();
    }
    return this.cachedVoices;
  }

  /**
   * Selects the best matching Nigerian female voice or natural female English voice fallback
   */
  public static getBestNigerianFemaleVoice(): SpeechSynthesisVoice | null {
    const voices = this.getAvailableVoices();
    if (!voices || voices.length === 0) return null;

    // 1. Direct Nigerian English voice match (e.g. en-NG)
    const nigerianFemale = voices.find(
      (v) =>
        (v.lang.toLowerCase().includes('en-ng') || v.name.toLowerCase().includes('nigeria')) &&
        (v.name.toLowerCase().includes('female') || !v.name.toLowerCase().includes('male'))
    );
    if (nigerianFemale) return nigerianFemale;

    // 2. Any en-NG voice
    const anyNigerian = voices.find((v) => v.lang.toLowerCase().includes('en-ng') || v.name.toLowerCase().includes('nigeria'));
    if (anyNigerian) return anyNigerian;

    // 3. African / Commonwealth English natural female voices
    const commonwealthFemale = voices.find(
      (v) =>
        (v.lang.includes('en-ZA') || v.lang.includes('en-GB') || v.lang.includes('en-IE') || v.lang.includes('en-IN')) &&
        (v.name.toLowerCase().includes('female') ||
          v.name.toLowerCase().includes('zira') ||
          v.name.toLowerCase().includes('samantha') ||
          v.name.toLowerCase().includes('karen') ||
          v.name.toLowerCase().includes('hazel') ||
          v.name.toLowerCase().includes('victoria'))
    );
    if (commonwealthFemale) return commonwealthFemale;

    // 4. Any English Female voice
    const anyFemale = voices.find(
      (v) =>
        v.lang.startsWith('en') &&
        (v.name.toLowerCase().includes('female') ||
          v.name.toLowerCase().includes('woman') ||
          v.name.toLowerCase().includes('samantha') ||
          v.name.toLowerCase().includes('karen') ||
          v.name.toLowerCase().includes('serena') ||
          v.name.toLowerCase().includes('moira') ||
          v.name.toLowerCase().includes('tessa'))
    );
    if (anyFemale) return anyFemale;

    // 5. Any English voice
    const englishVoice = voices.find((v) => v.lang.startsWith('en'));
    return englishVoice || voices[0] || null;
  }

  /**
   * Speak clean text using the calibrated Nigerian female voice parameters
   * Includes real-time volume modulation, viseme timing, and boundary callbacks
   */
  public static speak(
    rawText: string,
    options?: {
      onStart?: () => void;
      onEnd?: () => void;
      onError?: (err: any) => void;
      onVolume?: (volume: number) => void;
      onViseme?: (viseme: 'open' | 'wide' | 'vowel_o' | 'rest') => void;
      onWord?: (word: string) => void;
      customRate?: number;
      customPitch?: number;
    }
  ): SpeechSynthesisUtterance | null {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null;

    // Cancel ongoing speech to avoid overlap
    this.stop();

    // Clean text by stripping markdown symbols and urls for silky spoken output
    const cleanText = rawText
      .replace(/https?:\/\/[^\s]+/g, 'the official university portal')
      .replace(/[*#_`~[\]()]/g, '')
      .replace(/₦\s*([0-9,]+)/g, '$1 Naira')
      .replace(/\s+/g, ' ')
      .trim();

    if (!cleanText) return null;

    const utterance = new SpeechSynthesisUtterance(cleanText);
    const bestVoice = this.getBestNigerianFemaleVoice();

    if (bestVoice) {
      utterance.voice = bestVoice;
      utterance.lang = bestVoice.lang || 'en-NG';
    } else {
      utterance.lang = 'en-NG';
    }

    // Set pacing: "not fast", calibrated at 0.88 rate for respectful Nigerian clarity
    utterance.rate = options?.customRate || DEFAULT_VOICE_SETTINGS.rate;
    utterance.pitch = options?.customPitch || DEFAULT_VOICE_SETTINGS.pitch;
    utterance.volume = DEFAULT_VOICE_SETTINGS.volume;

    let volumeInterval: NodeJS.Timeout | null = null;
    let keepAliveInterval: NodeJS.Timeout | null = null;

    const startVolumeModulation = () => {
      let t = 0;
      volumeInterval = setInterval(() => {
        t += 0.15;
        // Natural speech syllabic volume variation (0.28 to 0.75)
        const envelope = 0.42 + Math.sin(t * 4.8) * 0.22 + Math.cos(t * 8.2) * 0.12;
        const boundedVol = Math.max(0.18, Math.min(0.85, envelope));
        options?.onVolume?.(boundedVol);

        // Cyclic viseme cues if boundary is sparse
        const cycle = Math.sin(t * 5.2);
        if (cycle > 0.3) {
          options?.onViseme?.('open');
        } else if (cycle < -0.3) {
          options?.onViseme?.('vowel_o');
        } else {
          options?.onViseme?.('rest');
        }
      }, 75);
    };

    const stopVolumeModulation = () => {
      if (volumeInterval) {
        clearInterval(volumeInterval);
        volumeInterval = null;
      }
      if (keepAliveInterval) {
        clearInterval(keepAliveInterval);
        keepAliveInterval = null;
      }
      options?.onVolume?.(0);
      options?.onViseme?.('rest');
    };

    utterance.onstart = () => {
      startVolumeModulation();
      // Chrome keep-alive to avoid pauses on long text
      keepAliveInterval = setInterval(() => {
        if (window.speechSynthesis.speaking) {
          window.speechSynthesis.pause();
          window.speechSynthesis.resume();
        }
      }, 12000);

      options?.onStart?.();
    };

    utterance.onboundary = (event: any) => {
      if (event.name === 'word') {
        const spokenWord = cleanText.substring(event.charIndex, event.charIndex + (event.charLength || 6));
        options?.onWord?.(spokenWord);

        // Analyze word for open vs rounded vowels
        const lower = spokenWord.toLowerCase();
        if (/[aei]/.test(lower)) {
          options?.onViseme?.('open');
          options?.onVolume?.(0.65 + Math.random() * 0.2);
        } else if (/[ou]/.test(lower)) {
          options?.onViseme?.('vowel_o');
          options?.onVolume?.(0.55 + Math.random() * 0.18);
        } else {
          options?.onViseme?.('rest');
          options?.onVolume?.(0.3);
        }
      }
    };

    utterance.onend = () => {
      stopVolumeModulation();
      options?.onEnd?.();
    };

    utterance.onerror = (e) => {
      stopVolumeModulation();
      console.warn('Speech synthesis notice:', e);
      options?.onError?.(e);
    };

    window.speechSynthesis.speak(utterance);
    return utterance;
  }

  public static stop() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }

  public static getIntroductionScript(): string {
    return 'Hello! I am Dr. Funke Adeyemi, your official virtual admissions advisor for Afe Babalola University. How may I help you today?';
  }
}
