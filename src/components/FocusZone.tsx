import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, CheckCircle, Volume2, VolumeX, Sparkles, AlertCircle, Clock, Heart } from 'lucide-react';
import { EmergencyPlan, PlanStep } from '../types';

interface FocusZoneProps {
  activePlan: EmergencyPlan | null;
  onOpenAntiPanic?: () => void;
}

export default function FocusZone({ activePlan, onOpenAntiPanic }: FocusZoneProps) {
  const [timeLeft, setTimeLeft] = useState<number>(25 * 60); // default 25 mins
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [sessionType, setSessionType] = useState<'focus' | 'break'>('focus');
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [isAudioOn, setIsAudioOn] = useState<boolean>(false);
  const [selectedAmbient, setSelectedAmbient] = useState<string>('none');
  const audioContextRef = useRef<AudioContext | null>(null);
  const noiseSourceRef = useRef<AudioBufferSourceNode | null>(null);

  // Sound generator (simulated ambient noise for extreme concentration)
  const toggleAmbientSound = () => {
    if (isAudioOn) {
      stopNoise();
    } else {
      startNoise();
    }
  };

  const startNoise = () => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioContextRef.current;

      // Create Buffer for White/Pink/Brown noise depending on selection
      const bufferSize = 2 * ctx.sampleRate;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);

      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        if (selectedAmbient === 'brown') {
          // Brownian Noise
          output[i] = (lastOut + (0.02 * white)) / 1.02;
          lastOut = output[i];
          output[i] *= 3.5; // Gain compensation
        } else if (selectedAmbient === 'pink') {
          // Simple pink noise approximation
          output[i] = (lastOut + (0.12 * white)) / 1.12;
          lastOut = output[i];
          output[i] *= 2.5;
        } else {
          // White Noise
          output[i] = white * 0.15;
        }
      }

      const whiteNoise = ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      whiteNoise.loop = true;

      const gainNode = ctx.createGain();
      gainNode.gain.setValueAtTime(0.08, ctx.currentTime); // Safe, low volume

      whiteNoise.connect(gainNode);
      gainNode.connect(ctx.destination);
      whiteNoise.start();

      noiseSourceRef.current = whiteNoise;
      setIsAudioOn(true);
    } catch (e) {
      console.error("Audio Context failed to boot: ", e);
    }
  };

  const stopNoise = () => {
    if (noiseSourceRef.current) {
      try {
        noiseSourceRef.current.stop();
        noiseSourceRef.current.disconnect();
      } catch (e) {
        // Safe check
      }
      noiseSourceRef.current = null;
    }
    setIsAudioOn(false);
  };

  useEffect(() => {
    if (isAudioOn && selectedAmbient !== 'none') {
      stopNoise();
      startNoise();
    }
  }, [selectedAmbient]);

  useEffect(() => {
    return () => {
      stopNoise();
    };
  }, []);

  // Timer logic
  useEffect(() => {
    let interval: any = null;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      setIsRunning(false);
      // Trigger notification audio
      triggerBell();
      if (sessionType === 'focus') {
        setSessionType('break');
        setTimeLeft(5 * 60); // 5 min break
      } else {
        setSessionType('focus');
        setTimeLeft(25 * 60);
      }
    }

    return () => clearInterval(interval);
  }, [isRunning, timeLeft, sessionType]);

  const triggerBell = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5 chord vibe
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 1.2);
    } catch (e) {
      // Safe check
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartPause = () => {
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    setIsRunning(false);
    setTimeLeft(sessionType === 'focus' ? 25 * 60 : 5 * 60);
  };

  const toggleStepCompleted = (idx: number) => {
    if (completedSteps.includes(idx)) {
      setCompletedSteps(completedSteps.filter((i) => i !== idx));
    } else {
      setCompletedSteps([...completedSteps, idx]);
    }
  };

  // Preset time values
  const setTimerPreset = (minutes: number) => {
    setIsRunning(false);
    setTimeLeft(minutes * 60);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-white">
      {/* Central focus panel */}
      <div className="lg:col-span-7 flex flex-col justify-between bg-vivid-panel border-2 border-vivid-border p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-[#FF3B30]/5 rounded-full blur-3xl pointer-events-none"></div>

        <div>
          <div className="flex flex-wrap items-center justify-between gap-2 mb-6 border-b border-white/10 pb-4">
            <span className="bg-[#FF3B30] text-black text-[10px] font-black px-3 py-1 uppercase tracking-widest">
              {sessionType === 'focus' ? '🎯 Focus Mode' : '☕ Break Interval'}
            </span>
            {onOpenAntiPanic && (
              <button
                onClick={onOpenAntiPanic}
                className="text-[10px] bg-[#FF3B30]/10 border border-[#FF3B30]/30 text-[#FF3B30] px-2.5 py-1 font-mono font-bold uppercase tracking-wider hover:bg-[#FF3B30] hover:text-black transition flex items-center gap-1.5 cursor-pointer animate-pulse"
                title="Open physiological sigh coach to calm down immediately"
              >
                <Heart className="w-3 h-3 fill-current" /> Cortisol Level Reset
              </button>
            )}
            <span className="text-[10px] font-mono text-white/50 uppercase tracking-wider">
              Survival Protocol Active
            </span>
          </div>

          <div className="flex flex-col items-center justify-center py-12 space-y-8">
            <h2 className="text-[100px] md:text-[120px] font-black tracking-tighter leading-none tabular-nums text-white">
              {formatTime(timeLeft)}
            </h2>

            <div className="flex gap-4">
              <button
                onClick={handleStartPause}
                className={`px-6 py-3.5 text-xs font-black uppercase tracking-widest transition flex items-center gap-2 border ${
                  isRunning
                    ? 'bg-transparent text-white border-white/20 hover:border-white'
                    : 'bg-white text-black hover:bg-[#FF3B30] hover:text-white border-transparent'
                }`}
              >
                {isRunning ? <Pause className="w-4 h-4 stroke-[2.5px]" /> : <Play className="w-4 h-4 stroke-[2.5px]" />}
                {isRunning ? 'Pause Work' : 'Enter Deep Work'}
              </button>
              <button
                onClick={handleReset}
                className="px-5 py-3.5 bg-vivid-dark border border-vivid-border text-white/70 hover:text-white hover:border-white transition text-xs font-black uppercase tracking-widest flex items-center gap-1.5"
              >
                <RotateCcw className="w-4 h-4" /> Reset
              </button>
            </div>

            {/* Quick presets */}
            <div className="flex flex-wrap gap-2 pt-2 justify-center">
              <button
                onClick={() => setTimerPreset(15)}
                className="text-[10px] font-mono bg-vivid-dark border border-vivid-border px-3 py-1.5 text-white/60 hover:text-white hover:border-white transition uppercase tracking-wider"
              >
                15m Sprint
              </button>
              <button
                onClick={() => setTimerPreset(25)}
                className="text-[10px] font-mono bg-vivid-dark border border-vivid-border px-3 py-1.5 text-white/60 hover:text-white hover:border-white transition uppercase tracking-wider"
              >
                25m Pomodoro
              </button>
              <button
                onClick={() => setTimerPreset(45)}
                className="text-[10px] font-mono bg-vivid-dark border border-vivid-border px-3 py-1.5 text-white/60 hover:text-white hover:border-white transition uppercase tracking-wider"
              >
                45m Hard Mode
              </button>
            </div>
          </div>
        </div>

        {/* Ambient Noise Panel */}
        <div className="border-t border-white/10 pt-6 mt-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h4 className="text-xs font-black uppercase tracking-tight text-white">
                Anti-Distraction Soundscapes
              </h4>
              <p className="text-[11px] text-white/50 font-sans leading-relaxed">
                Generate real-time auditory masking (white/pink/brown noise).
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              <select
                value={selectedAmbient}
                onChange={(e) => setSelectedAmbient(e.target.value)}
                className="bg-vivid-dark border border-vivid-border text-xs text-white px-3 py-2 focus:outline-none focus:border-[#FF3B30] uppercase font-mono"
              >
                <option value="none">No Soundscape</option>
                <option value="white">White Noise (Focus)</option>
                <option value="pink">Pink Noise (Chill)</option>
                <option value="brown">Brownian Noise (Relaxing)</option>
              </select>

              <button
                onClick={toggleAmbientSound}
                disabled={selectedAmbient === 'none'}
                className={`p-2.5 border transition ${
                  isAudioOn
                    ? 'bg-[#FF3B30] text-black border-transparent'
                    : 'bg-vivid-dark border border-vivid-border text-white/50 hover:text-white hover:border-white disabled:opacity-30'
                }`}
                title="Toggle Soundscape Playback"
              >
                {isAudioOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Checklist / Plan progression */}
      <div className="lg:col-span-5 bg-vivid-panel border-2 border-vivid-border p-6 flex flex-col justify-between font-bold">
        <div>
          <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-5">
            <h3 className="text-sm font-black uppercase tracking-wider flex items-center gap-2 text-white">
              <Clock className="w-4 h-4 text-[#FF3B30]" /> Plan Tracker
            </h3>
            {activePlan && (
              <span className="text-[9px] bg-white text-black font-black uppercase tracking-widest px-2.5 py-0.5">
                {completedSteps.length} / {activePlan.salvagePlanSteps.length} Steps
              </span>
            )}
          </div>

          {activePlan ? (
            <div className="space-y-3.5 max-h-[380px] overflow-y-auto pr-1">
              {activePlan.salvagePlanSteps.map((step, idx) => {
                const isCompleted = completedSteps.includes(idx);
                return (
                  <div
                    key={idx}
                    onClick={() => toggleStepCompleted(idx)}
                    className={`p-4 border transition-all duration-300 cursor-pointer flex gap-3 ${
                      isCompleted
                        ? 'bg-vivid-dark border-vivid-border/30 text-white/40 opacity-50'
                        : 'bg-vivid-dark border-vivid-border hover:border-white text-white'
                    }`}
                  >
                    <button className="shrink-0 mt-0.5">
                      <CheckCircle
                        className={`w-5 h-5 transition-colors ${
                          isCompleted ? 'text-[#34C759] fill-[#34C759]/10' : 'text-white/30'
                        }`}
                      />
                    </button>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className={`text-[10px] font-mono font-bold uppercase ${isCompleted ? 'text-white/30' : 'text-[#FF3B30]'}`}>
                          Hour {idx + 1}
                        </span>
                        <span className="text-[9px] font-mono text-white/40">{step.durationMinutes}M</span>
                      </div>
                      <p className={`text-xs font-black uppercase tracking-tight ${isCompleted ? 'line-through text-white/30' : 'text-white'}`}>
                        {step.action}
                      </p>
                      {!isCompleted && step.focusTip && (
                        <p className="text-[11px] text-white/60 font-sans italic pt-0.5 leading-relaxed">
                          💡 {step.focusTip}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center py-20 space-y-3">
              <AlertCircle className="w-8 h-8 text-white/30" />
              <div>
                <h4 className="text-xs font-black uppercase tracking-widest text-white/40">No Active Emergency Plan</h4>
                <p className="text-xs text-white/50 max-w-xs mt-1.5 leading-relaxed">
                  Once you generate an Emergency Action Plan, its hourly progression tracker will appear here.
                </p>
              </div>
            </div>
          )}
        </div>

        {activePlan && (
          <div className="bg-vivid-dark border border-vivid-border p-4 mt-6 flex items-start gap-3">
            <Sparkles className="w-4 h-4 text-[#FF3B30] shrink-0 mt-0.5" />
            <div className="text-[11px] text-white/70 leading-relaxed">
              <span className="font-bold text-white block mb-0.5 uppercase tracking-wider">Extreme Salvage Mode:</span>
              Remember to take micro breaks. Turn on Brownian ambient noise to mask domestic or local workplace auditory disruptions.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
