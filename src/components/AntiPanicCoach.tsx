import React, { useState, useEffect, useRef } from 'react';
import { X, Wind, Heart, Sparkles, Volume2, VolumeX, AlertTriangle, Play, Check } from 'lucide-react';

interface AntiPanicCoachProps {
  isOpen: boolean;
  onClose: () => void;
}

type BreathPhase = 'idle' | 'inhale1' | 'inhale2' | 'exhale' | 'hold';

export default function AntiPanicCoach({ isOpen, onClose }: AntiPanicCoachProps) {
  const [cycleCount, setCycleCount] = useState<number>(0);
  const [phase, setPhase] = useState<BreathPhase>('idle');
  const [secondsLeft, setSecondsLeft] = useState<number>(0);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [sessionCompleted, setSessionCompleted] = useState<boolean>(false);

  // Web Audio Context reference for live breath synthesizer
  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const timerRef = useRef<any>(null);

  useEffect(() => {
    if (!isOpen) {
      stopBreathingSession();
    }
    return () => {
      stopBreathingSession();
    };
  }, [isOpen]);

  const startAudioSynth = () => {
    if (!soundEnabled) return;
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      // Create a warm low frequency drone that represents inhalation/exhalation
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(110, ctx.currentTime); // A2 warm pitch
      gain.gain.setValueAtTime(0, ctx.currentTime);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();

      oscillatorRef.current = osc;
      gainNodeRef.current = gain;
    } catch (e) {
      console.error("Breath audio synthesis failed: ", e);
    }
  };

  const updateSynthVolume = (targetVol: number, rampTime: number) => {
    if (!soundEnabled || !gainNodeRef.current || !audioCtxRef.current) return;
    try {
      const ctx = audioCtxRef.current;
      gainNodeRef.current.gain.linearRampToValueAtTime(targetVol, ctx.currentTime + rampTime);
    } catch (e) {
      // Safe guard
    }
  };

  const updateSynthPitch = (targetHz: number, rampTime: number) => {
    if (!soundEnabled || !oscillatorRef.current || !audioCtxRef.current) return;
    try {
      const ctx = audioCtxRef.current;
      oscillatorRef.current.frequency.linearRampToValueAtTime(targetHz, ctx.currentTime + rampTime);
    } catch (e) {
      // Safe guard
    }
  };

  const stopAudioSynth = () => {
    if (oscillatorRef.current) {
      try {
        oscillatorRef.current.stop();
        oscillatorRef.current.disconnect();
      } catch (e) {}
      oscillatorRef.current = null;
    }
    gainNodeRef.current = null;
  };

  const startBreathingSession = () => {
    setCycleCount(1);
    setSessionCompleted(false);
    startAudioSynth();
    runPhase('inhale1');
  };

  const stopBreathingSession = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setPhase('idle');
    setCycleCount(0);
    setSecondsLeft(0);
    stopAudioSynth();
  };

  const runPhase = (nextPhase: BreathPhase) => {
    setPhase(nextPhase);

    if (nextPhase === 'inhale1') {
      // Phase 1: Deep primary inhale (4 seconds)
      setSecondsLeft(4);
      updateSynthVolume(0.12, 1.0);
      updateSynthPitch(140, 4.0); // pitch goes up slightly as you inhale

      timerRef.current = setTimeout(() => {
        runPhase('inhale2');
      }, 4000);

    } else if (nextPhase === 'inhale2') {
      // Phase 2: Quick sharp double-inhale (1.2 seconds)
      setSecondsLeft(1.2);
      updateSynthVolume(0.18, 0.2);
      updateSynthPitch(165, 0.4); // higher pitch burst

      timerRef.current = setTimeout(() => {
        runPhase('exhale');
      }, 1200);

    } else if (nextPhase === 'exhale') {
      // Phase 3: Slow complete sigh release (6 seconds)
      setSecondsLeft(6);
      updateSynthVolume(0.02, 3.0); // release slowly
      updateSynthPitch(90, 6.0); // lower tone

      timerRef.current = setTimeout(() => {
        runPhase('hold');
      }, 6000);

    } else if (nextPhase === 'hold') {
      // Phase 4: Settle hold (1.8 seconds)
      setSecondsLeft(1.8);
      updateSynthVolume(0, 0.5);

      timerRef.current = setTimeout(() => {
        setCycleCount(prev => {
          if (prev >= 4) { // Complete 4 rounds (~50s total)
            setSessionCompleted(true);
            stopAudioSynth();
            setPhase('idle');
            return 0;
          } else {
            runPhase('inhale1');
            return prev + 1;
          }
        });
      }, 1800);
    }
  };

  // Fluid countdown display decrementer
  useEffect(() => {
    let interval: any = null;
    if (phase !== 'idle' && secondsLeft > 0) {
      interval = setInterval(() => {
        setSecondsLeft(prev => Math.max(0, parseFloat((prev - 0.1).toFixed(1))));
      }, 100);
    }
    return () => clearInterval(interval);
  }, [phase, secondsLeft]);

  if (!isOpen) return null;

  // Compute dynamic circle size and text guides based on current phase
  let scaleClass = 'scale-100';
  let instruction = 'Get ready to calm your nervous system';
  let subtitle = 'The physiological sigh is the fastest scientific technique to lower heart rate and adrenaline.';
  let phaseColor = 'border-white/10 bg-white/5';
  let glowColor = 'shadow-none';

  if (phase === 'inhale1') {
    scaleClass = 'scale-[1.6]';
    instruction = 'Inhale deeply through your nose';
    subtitle = 'Fill your lungs as much as possible.';
    phaseColor = 'border-[#007AFF] bg-[#007AFF]/10 text-[#007AFF]';
    glowColor = 'shadow-[0_0_50px_rgba(0,122,255,0.35)]';
  } else if (phase === 'inhale2') {
    scaleClass = 'scale-[1.9]';
    instruction = 'QUICK SHARP INHALE AGAIN!';
    subtitle = 'Take one more tiny sniff to pop open the lung air sacs.';
    phaseColor = 'border-[#34C759] bg-[#34C759]/20 text-[#34C759]';
    glowColor = 'shadow-[0_0_60px_rgba(52,199,89,0.5)]';
  } else if (phase === 'exhale') {
    scaleClass = 'scale-[0.95]';
    instruction = 'Sloooowly sigh out through mouth';
    subtitle = 'Release all tension with a long, unforced exhale.';
    phaseColor = 'border-[#a78bfa] bg-[#a78bfa]/10 text-[#a78bfa]';
    glowColor = 'shadow-[0_0_30px_rgba(167,139,250,0.2)]';
  } else if (phase === 'hold') {
    scaleClass = 'scale-100';
    instruction = 'Hold & Settle';
    subtitle = 'Allow your heartbeat to naturally slow down.';
    phaseColor = 'border-[#FF3B30] bg-[#FF3B30]/5 text-[#FF3B30]';
    glowColor = 'shadow-none';
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95 backdrop-blur-md animate-fade-in font-sans">
      <div className="bg-vivid-panel border-2 border-vivid-border max-w-lg w-full p-6 relative overflow-hidden flex flex-col justify-between min-h-[500px]">
        {/* Glowing backdrop elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#FF3B30]/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#007AFF]/5 rounded-full blur-3xl pointer-events-none"></div>

        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-[#FF3B30] animate-pulse" />
            <span className="text-[10px] font-mono font-black text-[#FF3B30] uppercase tracking-widest">
              Cortisol Level Rescue Protocol
            </span>
          </div>
          <button
            onClick={() => {
              stopBreathingSession();
              onClose();
            }}
            className="p-1 text-white/50 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Main interactive segment */}
        <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6 py-6">
          {phase === 'idle' ? (
            sessionCompleted ? (
              <div className="space-y-6 animate-fade-in">
                <div className="w-16 h-16 bg-[#34C759]/10 border-2 border-[#34C759] text-[#34C759] rounded-full flex items-center justify-center mx-auto shadow-[0_0_20px_rgba(52,199,89,0.2)]">
                  <Check className="w-8 h-8 stroke-[3px]" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-black tracking-tight text-white uppercase italic">
                    SYSTEM RESET SUCCESSFUL
                  </h3>
                  <p className="text-xs text-white/70 max-w-sm mx-auto leading-relaxed font-sans">
                    Your heart rate has stabilized. Adrenaline is channeled into calm, logical focus. Your cognitive capacity has recovered.
                  </p>
                </div>
                <div className="bg-[#34C759]/5 border border-[#34C759]/20 p-3 text-[11px] font-mono text-white/90 max-w-sm mx-auto">
                  💡 <span className="font-bold text-[#34C759]">SALVAGE COMMAND:</span> Take this clarity straight into your next Action Plan step.
                </div>
                <button
                  onClick={startBreathingSession}
                  className="px-6 py-3 bg-white text-black hover:bg-[#FF3B30] hover:text-white transition text-xs font-black uppercase tracking-widest font-mono"
                >
                  Restart Sigh Exercise
                </button>
              </div>
            ) : (
              <div className="space-y-6 animate-fade-in">
                <div className="w-16 h-16 bg-[#FF3B30]/10 border border-[#FF3B30] text-[#FF3B30] rounded-full flex items-center justify-center mx-auto animate-bounce">
                  <Wind className="w-8 h-8" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-black tracking-tight text-white uppercase italic">
                    THE PHYSIOLOGICAL SIGH COACH
                  </h3>
                  <p className="text-xs text-white/60 max-w-sm mx-auto leading-relaxed font-sans">
                    Inhale deeply through your nose, take a rapid second sniff, then let out a slow, extended sigh. Doing this 4 times instantly slows down your breathing and shuts down cortisol-induced panic.
                  </p>
                </div>
                <button
                  onClick={startBreathingSession}
                  className="px-6 py-3.5 bg-white text-black hover:bg-[#FF3B30] hover:text-white transition text-xs font-black uppercase tracking-widest font-mono flex items-center gap-2 mx-auto shadow-md"
                >
                  <Play className="w-4 h-4 fill-current" /> Begin 60s Cortisol Purge
                </button>
              </div>
            )
          ) : (
            <div className="space-y-8 w-full">
              {/* Animated breathing container */}
              <div className="h-44 flex items-center justify-center relative">
                {/* Concentric ripples */}
                <div className={`absolute w-32 h-32 rounded-full border-2 transition-all duration-1000 ${scaleClass} ${phaseColor} ${glowColor}`} />
                <div className={`absolute w-24 h-24 rounded-full border border-dashed transition-all duration-700 opacity-40 ${scaleClass} ${phaseColor}`} />
                
                {/* Center time indicator */}
                <div className="z-10 bg-vivid-dark/90 border border-vivid-border w-16 h-16 rounded-full flex flex-col items-center justify-center">
                  <span className="text-[9px] font-mono text-white/40 uppercase">sec</span>
                  <span className="text-lg font-black font-mono leading-none">{secondsLeft.toFixed(0)}</span>
                </div>
              </div>

              {/* Instructions and progress */}
              <div className="space-y-2 max-w-sm mx-auto px-4">
                <span className="text-[10px] font-mono font-bold text-[#FF3B30] bg-[#FF3B30]/10 px-3 py-0.5 uppercase tracking-wider">
                  Sigh Cycle {cycleCount} / 4
                </span>
                <h3 className="text-md sm:text-lg font-black text-white uppercase tracking-tight leading-snug min-h-[28px] animate-pulse">
                  {instruction}
                </h3>
                <p className="text-[11px] text-white/50 font-sans min-h-[36px] leading-relaxed">
                  {subtitle}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="border-t border-white/10 pt-4 flex items-center justify-between mt-4">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="flex items-center gap-1.5 text-[10px] font-mono text-white/40 hover:text-white transition"
          >
            {soundEnabled ? (
              <>
                <Volume2 className="w-3.5 h-3.5 text-[#34C759]" /> Sound Synthesizer: ON
              </>
            ) : (
              <>
                <VolumeX className="w-3.5 h-3.5" /> Sound Synthesizer: OFF
              </>
            )}
          </button>

          {phase !== 'idle' && (
            <button
              onClick={stopBreathingSession}
              className="text-[10px] font-mono font-bold text-[#FF3B30] uppercase tracking-wider hover:underline"
            >
              Abort Session
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
