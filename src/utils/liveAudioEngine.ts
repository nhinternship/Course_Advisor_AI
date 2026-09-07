// Real-time Audio-to-Audio Live Stream Engine with Barge-in & Interruption Support

export type LiveSessionStatus = 'disconnected' | 'connecting' | 'connected' | 'listening' | 'speaking' | 'interrupted' | 'error';

export interface AudioSpectralMetrics {
  volume: number;
  lowFreq: number; // 90 - 500Hz: fundamental pitch & jaw drop
  midFreq: number; // 500 - 2000Hz: F1/F2 formants (open vs rounded vowels)
  highFreq: number; // 2000 - 6000Hz: sibilance / fricatives
  viseme: 'silence' | 'open' | 'vowel_o' | 'wide' | 'fricative';
}

export interface LiveAudioEngineCallbacks {
  onStatusChange: (status: LiveSessionStatus, message?: string) => void;
  onUserVolume: (volume: number) => void;
  onModelVolume: (volume: number) => void;
  onAudioMetrics?: (metrics: AudioSpectralMetrics) => void;
  onTranscript: (role: 'user' | 'model', text: string, isFinal?: boolean) => void;
  onInterrupted: () => void;
  onTurnComplete: () => void;
  onError: (error: string) => void;
}

export class LiveAudioEngine {
  private ws: WebSocket | null = null;
  private inputAudioCtx: AudioContext | null = null;
  private outputAudioCtx: AudioContext | null = null;
  private mediaStream: MediaStream | null = null;
  private inputProcessor: ScriptProcessorNode | null = null;
  private inputSource: MediaStreamAudioSourceNode | null = null;
  private outputGainNode: GainNode | null = null;
  private outputAnalyser: AnalyserNode | null = null;

  private activeAudioSources: Set<AudioBufferSourceNode> = new Set();
  private nextOutputTime = 0;
  private isModelSpeaking = false;
  private isMicMuted = false;
  private status: LiveSessionStatus = 'disconnected';
  private callbacks: LiveAudioEngineCallbacks;

  private vadInterruptionThreshold = 0.18; // Energy threshold for user barge-in
  private consecutiveUserSpeechFrames = 0;

  constructor(callbacks: LiveAudioEngineCallbacks) {
    this.callbacks = callbacks;
  }

  public getStatus(): LiveSessionStatus {
    return this.status;
  }

  public isMuted(): boolean {
    return this.isMicMuted;
  }

  /**
   * Start two-way Audio-to-Audio Session
   */
  public async startSession(): Promise<boolean> {
    try {
      this.setStatus('connecting', 'Establishing Live Audio-to-Audio Stream...');

      // 1. Initialize Audio Contexts
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.inputAudioCtx = new AudioCtx({ sampleRate: 16000 });
      this.outputAudioCtx = new AudioCtx({ sampleRate: 24000 });

      if (this.inputAudioCtx.state === 'suspended') {
        await this.inputAudioCtx.resume();
      }
      if (this.outputAudioCtx.state === 'suspended') {
        await this.outputAudioCtx.resume();
      }

      this.outputGainNode = this.outputAudioCtx.createGain();
      this.outputAnalyser = this.outputAudioCtx.createAnalyser();
      this.outputAnalyser.fftSize = 128;
      this.outputAnalyser.smoothingTimeConstant = 0.2;
      this.outputGainNode.connect(this.outputAnalyser);
      this.outputAnalyser.connect(this.outputAudioCtx.destination);

      // Start output volume monitor
      this.monitorOutputVolume();

      // 2. Request Microphone Access (16kHz, mono, echo-cancellation)
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          sampleRate: 16000,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      // 3. Connect WebSocket to Server
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/api/live`;

      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        this.setStatus('connected', 'Live Audio Stream Connected • Speak to begin');
        this.startMicrophoneCapture();
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.handleServerMessage(data);
        } catch (err) {
          console.error('Error parsing live WS message:', err);
        }
      };

      this.ws.onerror = (err) => {
        console.warn('Live WebSocket error:', err);
        this.setStatus('error', 'Live WebSocket connection error.');
        this.callbacks.onError('Live WebSocket connection error');
      };

      this.ws.onclose = () => {
        if (this.status !== 'disconnected') {
          this.setStatus('disconnected', 'Live Audio session closed');
        }
      };

      return true;
    } catch (err: any) {
      console.error('Failed to start Live Audio Session:', err);
      this.setStatus('error', err.message || 'Microphone or connection failed');
      this.callbacks.onError(err.message || 'Failed to initialize microphone');
      return false;
    }
  }

  /**
   * Capture 16kHz microphone stream, downsample to 16-bit PCM little-endian, and send
   */
  private startMicrophoneCapture() {
    if (!this.inputAudioCtx || !this.mediaStream) return;

    this.inputSource = this.inputAudioCtx.createMediaStreamSource(this.mediaStream);
    // Buffer size 2048 gives low latency (~128ms at 16kHz)
    this.inputProcessor = this.inputAudioCtx.createScriptProcessor(2048, 1, 1);

    this.inputProcessor.onaudioprocess = (e) => {
      if (this.isMicMuted) {
        this.callbacks.onUserVolume(0);
        return;
      }

      const inputBuffer = e.inputBuffer.getChannelData(0);

      // Compute RMS volume for visual meter and VAD
      let sum = 0;
      for (let i = 0; i < inputBuffer.length; i++) {
        sum += inputBuffer[i] * inputBuffer[i];
      }
      const rms = Math.sqrt(sum / inputBuffer.length);
      const scaledVol = Math.min(1.0, rms * 4.5);
      this.callbacks.onUserVolume(scaledVol);

      // Voice Activity Detection (Barge-in detection when model is speaking)
      if (this.isModelSpeaking && scaledVol > this.vadInterruptionThreshold) {
        this.consecutiveUserSpeechFrames++;
        if (this.consecutiveUserSpeechFrames >= 2) {
          // Trigger local instant barge-in
          this.interruptModel('user_voice_barge_in');
          this.consecutiveUserSpeechFrames = 0;
        }
      } else {
        this.consecutiveUserSpeechFrames = Math.max(0, this.consecutiveUserSpeechFrames - 1);
      }

      // Encode Float32 to 16-bit PCM (little-endian)
      const pcm16 = this.floatTo16BitPCM(inputBuffer);
      const base64Audio = this.arrayBufferToBase64(pcm16);

      // Send to server WebSocket
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(
          JSON.stringify({
            type: 'audio',
            audio: base64Audio,
            mimeType: 'audio/pcm;rate=16000',
          })
        );
      }
    };

    this.inputSource.connect(this.inputProcessor);
    this.inputProcessor.connect(this.inputAudioCtx.destination);
  }

  /**
   * Handle server message events
   */
  private handleServerMessage(data: any) {
    if (data.type === 'audio' && data.audio) {
      this.isModelSpeaking = true;
      this.setStatus('speaking', 'ABUAD Assistant is speaking (You can interrupt anytime)');
      this.queueAudioChunk(data.audio);
    } else if (data.type === 'transcript') {
      if (data.text) {
        this.callbacks.onTranscript(data.role || 'model', data.text, true);
      }
    } else if (data.type === 'interrupted' || data.interrupted) {
      this.interruptModel('server_interrupted_event');
    } else if (data.type === 'turnComplete') {
      this.isModelSpeaking = false;
      this.setStatus('listening', 'Listening • Speak or interrupt anytime');
      this.callbacks.onTurnComplete();
    } else if (data.type === 'error') {
      this.callbacks.onError(data.message || 'Live session error');
    }
  }

  /**
   * Queue 24kHz raw PCM audio chunk for gapless playback
   */
  private queueAudioChunk(base64Audio: string) {
    if (!this.outputAudioCtx || !this.outputGainNode) return;

    try {
      const float32Data = this.base64ToFloat32Array(base64Audio);
      if (float32Data.length === 0) return;

      const audioBuffer = this.outputAudioCtx.createBuffer(1, float32Data.length, 24000);
      audioBuffer.getChannelData(0).set(float32Data);

      const source = this.outputAudioCtx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(this.outputGainNode);

      const currentTime = this.outputAudioCtx.currentTime;
      const startTime = Math.max(currentTime, this.nextOutputTime);
      source.start(startTime);
      this.nextOutputTime = startTime + audioBuffer.duration;

      this.activeAudioSources.add(source);

      source.onended = () => {
        this.activeAudioSources.delete(source);
        if (this.activeAudioSources.size === 0 && this.outputAudioCtx && this.outputAudioCtx.currentTime >= this.nextOutputTime - 0.05) {
          this.isModelSpeaking = false;
          this.setStatus('listening', 'Listening • Speak or interrupt anytime');
        }
      };
    } catch (err) {
      console.error('Error queuing audio chunk:', err);
    }
  }

  private isInterrupting = false;

  /**
   * Instant Interruption / Barge-in: Halt all active audio buffers immediately
   */
  public interruptModel(reason: string = 'manual') {
    if (this.isInterrupting) return;
    this.isInterrupting = true;
    try {
      // 1. Immediately stop and disconnect all scheduled AudioBufferSourceNodes
      this.activeAudioSources.forEach((source) => {
        try {
          source.stop(0);
          source.disconnect();
        } catch (_) {}
      });
      this.activeAudioSources.clear();

      // 2. Reset playback clock
      if (this.outputAudioCtx) {
        this.nextOutputTime = this.outputAudioCtx.currentTime;
      }

      this.isModelSpeaking = false;
      this.setStatus('interrupted', 'Interrupted • Attentively listening to your new question...');
      this.callbacks.onInterrupted();

      // 3. Notify server of user barge-in so Gemini Live cuts its current response
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(
          JSON.stringify({
            type: 'interrupt',
            reason,
          })
        );
      }
    } finally {
      this.isInterrupting = false;
    }
  }

  /**
   * Send text prompt directly to live session
   */
  public sendTextMessage(text: string) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      // If model is currently talking, interrupt first
      if (this.isModelSpeaking) {
        this.interruptModel('text_prompt_interruption');
      }
      this.ws.send(
        JSON.stringify({
          type: 'text',
          text,
        })
      );
      this.setStatus('listening', '3D Advisor is querying RAG knowledge & https://www.abuad.edu.ng/...');
    }
  }

  public toggleMute(): boolean {
    this.isMicMuted = !this.isMicMuted;
    if (this.isMicMuted) {
      this.callbacks.onUserVolume(0);
    }
    return this.isMicMuted;
  }

  private monitorOutputVolume() {
    if (!this.outputAnalyser) return;
    const dataArray = new Uint8Array(this.outputAnalyser.frequencyBinCount);

    const checkVolume = () => {
      if (!this.outputAnalyser || (this.status as LiveSessionStatus) === 'disconnected') return;
      this.outputAnalyser.getByteFrequencyData(dataArray);

      let sum = 0;
      let lowSum = 0;
      let midSum = 0;
      let highSum = 0;
      const binCount = dataArray.length;

      // 64 bins for fftSize=128 at 24kHz (~187.5 Hz per bin)
      for (let i = 0; i < binCount; i++) {
        const val = dataArray[i];
        sum += val;
        if (i < 4) {
          lowSum += val; // ~0 - 750 Hz (Fundamental & Jaw Openness)
        } else if (i < 16) {
          midSum += val; // ~750 - 3000 Hz (Formants F1 & F2: vowel rounding vs spread)
        } else {
          highSum += val; // ~3000 - 12000 Hz (Sibilants, fricatives, consonants)
        }
      }

      const avg = sum / binCount;
      const normalized = Math.min(1.0, avg / 128);

      const lowAvg = lowSum / 4;
      const midAvg = midSum / 12;
      const highAvg = highSum / Math.max(1, binCount - 16);

      const lowNorm = Math.min(1.0, lowAvg / 135);
      const midNorm = Math.min(1.0, midAvg / 120);
      const highNorm = Math.min(1.0, highAvg / 100);

      // Determine Ditto-style viseme target
      let viseme: 'silence' | 'open' | 'vowel_o' | 'wide' | 'fricative' = 'silence';
      if (this.isModelSpeaking && normalized > 0.04) {
        if (highNorm > 0.45 && lowNorm < 0.35) {
          viseme = 'fricative';
        } else if (lowNorm > 0.45 && midNorm < 0.38) {
          viseme = 'vowel_o';
        } else if (midNorm > 0.45 && lowNorm > 0.3) {
          viseme = 'wide';
        } else if (lowNorm > 0.15 || normalized > 0.08) {
          viseme = 'open';
        }
      }

      if (this.isModelSpeaking) {
        this.callbacks.onModelVolume(Math.max(0.08, normalized));
        this.callbacks.onAudioMetrics?.({
          volume: normalized,
          lowFreq: lowNorm,
          midFreq: midNorm,
          highFreq: highNorm,
          viseme,
        });
      } else {
        this.callbacks.onModelVolume(0);
        this.callbacks.onAudioMetrics?.({
          volume: 0,
          lowFreq: 0,
          midFreq: 0,
          highFreq: 0,
          viseme: 'silence',
        });
      }

      requestAnimationFrame(checkVolume);
    };

    requestAnimationFrame(checkVolume);
  }

  private setStatus(status: LiveSessionStatus, message?: string) {
    if (this.status === status && !message) return;
    this.status = status;
    this.callbacks.onStatusChange(status, message);
  }

  /**
   * Disconnect & Cleanup
   */
  public stopSession() {
    this.interruptModel('session_stopped');

    if (this.inputProcessor) {
      this.inputProcessor.disconnect();
      this.inputProcessor = null;
    }

    if (this.inputSource) {
      this.inputSource.disconnect();
      this.inputSource = null;
    }

    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((t) => t.stop());
      this.mediaStream = null;
    }

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }

    if (this.inputAudioCtx) {
      this.inputAudioCtx.close().catch(() => {});
      this.inputAudioCtx = null;
    }

    if (this.outputAudioCtx) {
      this.outputAudioCtx.close().catch(() => {});
      this.outputAudioCtx = null;
    }

    this.setStatus('disconnected', 'Session Ended');
    this.callbacks.onUserVolume(0);
    this.callbacks.onModelVolume(0);
  }

  // Helper: Float32Array to 16-bit PCM little-endian ArrayBuffer
  private floatTo16BitPCM(input: Float32Array): ArrayBuffer {
    const output = new DataView(new ArrayBuffer(input.length * 2));
    for (let i = 0; i < input.length; i++) {
      const s = Math.max(-1, Math.min(1, input[i]));
      output.setInt16(i * 2, s < 0 ? s * 0x8000 : s * 0x7fff, true);
    }
    return output.buffer;
  }

  // Helper: ArrayBuffer to base64
  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  }

  // Helper: base64 PCM 16-bit to Float32Array
  private base64ToFloat32Array(base64: string): Float32Array {
    try {
      const binaryString = window.atob(base64);
      const len = binaryString.length;
      const sampleCount = Math.floor(len / 2);
      if (sampleCount === 0) return new Float32Array(0);

      const float32Array = new Float32Array(sampleCount);
      const dataView = new DataView(new Uint8Array(len).buffer);
      for (let i = 0; i < len; i++) {
        dataView.setUint8(i, binaryString.charCodeAt(i));
      }

      for (let i = 0; i < sampleCount; i++) {
        const int16 = dataView.getInt16(i * 2, true);
        float32Array[i] = int16 / 32768.0;
      }
      return float32Array;
    } catch (e) {
      console.warn('Error decoding base64 PCM audio:', e);
      return new Float32Array(0);
    }
  }
}
