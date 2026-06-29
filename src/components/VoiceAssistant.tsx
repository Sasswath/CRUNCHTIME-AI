import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Send, Sparkles, Volume2, VolumeX, Terminal, Play, CheckCircle } from 'lucide-react';
import { Task, TaskCategory } from '../types';

interface VoiceAssistantProps {
  onAddTask: (task: Partial<Task>) => void;
  onCompleteTaskByTitle: (title: string) => void;
  onGeneratePlanByTitle: (title: string) => void;
  tasks: Task[];
}

export default function VoiceAssistant({
  onAddTask,
  onCompleteTaskByTitle,
  onGeneratePlanByTitle,
  tasks
}: VoiceAssistantProps) {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const [transcript, setTranscript] = useState('');
  const [inputText, setInputText] = useState('');
  const [feedback, setFeedback] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [waveformArr, setWaveformArr] = useState<number[]>(Array(15).fill(10));
  const recognitionRef = useRef<any>(null);
  const animationRef = useRef<number | null>(null);

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      setIsSupported(true);
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = true;
      rec.lang = 'en-US';

      rec.onstart = () => {
        setIsListening(true);
        setFeedback('Listening for command...');
        startWaveformAnimation();
      };

      rec.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }

        const displayedText = finalTranscript || interimTranscript;
        if (displayedText) {
          setTranscript(displayedText);
        }

        if (finalTranscript) {
          processCommand(finalTranscript);
        }
      };

      rec.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        if (event.error === 'not-allowed') {
          setFeedback('Microphone access denied. Please click the mic and allow microphone permissions in your browser, or type your command below.');
        } else {
          setFeedback(`Speech Error: ${event.error}. Feel free to type below!`);
        }
        setIsListening(false);
        stopWaveformAnimation();
      };

      rec.onend = () => {
        setIsListening(false);
        stopWaveformAnimation();
      };

      recognitionRef.current = rec;
    } else {
      setIsSupported(false);
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {}
      }
    };
  }, []);

  const startWaveformAnimation = () => {
    const animate = () => {
      setWaveformArr(Array.from({ length: 20 }, () => Math.floor(Math.random() * 40) + 5));
      animationRef.current = requestAnimationFrame(animate);
    };
    animate();
  };

  const stopWaveformAnimation = () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    setWaveformArr(Array(15).fill(4));
  };

  const toggleListening = async () => {
    if (!recognitionRef.current) {
      setFeedback("Web Speech API not supported in this browser. Please type your command!");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      setTranscript('');
      setFeedback('Requesting microphone permissions...');
      try {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          // Explicitly trigger permission prompt
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          // Stop all tracks to release the microphone lock so SpeechRecognition can use it!
          stream.getTracks().forEach(track => track.stop());
        }
        recognitionRef.current.start();
      } catch (err: any) {
        console.error("Microphone access failed:", err);
        setFeedback("Microphone access denied. Please unblock microphone permission or type your command.");
        setIsListening(false);
      }
    }
  };

  const speakText = (text: string) => {
    if (isMuted || !('speechSynthesis' in window)) return;
    // Cancel any active speech
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.05;
    window.speechSynthesis.speak(utterance);
  };

  const processCommand = async (commandStr: string) => {
    if (!commandStr.trim()) return;
    setIsProcessing(true);
    setFeedback('AI analyzing command...');

    try {
      const response = await fetch('/api/ai/voice-command', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcript: commandStr,
          currentLocalTime: new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }) + ' IST'
        })
      });

      if (!response.ok) {
        throw new Error('Failed to parse command');
      }

      const data = await response.json();
      const { action, extractedData, feedbackMessage } = data;

      setFeedback(feedbackMessage);
      speakText(feedbackMessage);

      // Perform state modifications based on the action
      if (action === 'CREATE_TASK' && extractedData) {
        const category: TaskCategory = extractedData.category || 'assignment';
        onAddTask({
          title: extractedData.title || 'Untitled Action task',
          deadline: extractedData.deadline || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          category: category,
          description: `Created via Voice Companion: "${commandStr}"`,
          estimatedHours: extractedData.estimatedHours || 1,
          status: 'pending'
        });
      } else if (action === 'COMPLETE_TASK' && extractedData?.title) {
        onCompleteTaskByTitle(extractedData.title);
      } else if (action === 'GENERATE_PLAN' && extractedData?.title) {
        onGeneratePlanByTitle(extractedData.title);
      }
    } catch (err: any) {
      console.error(err);
      setFeedback('Sorry, I failed to process that command. Let\'s try typing or asking again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    setTranscript(inputText);
    processCommand(inputText);
    setInputText('');
  };

  return (
    <div className="bg-vivid-panel border-2 border-vivid-border p-5 sm:p-6 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-[#FF3B30]/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="flex items-center justify-between mb-5 border-b border-white/10 pb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-[#FF3B30] animate-pulse" />
          <h3 className="text-lg font-black uppercase italic tracking-tighter text-white">
            VOICE & NLP <span className="text-[#FF3B30]">CONTROL</span>
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="p-1.5 text-white/50 hover:text-white hover:bg-white/5 transition border border-transparent hover:border-white/10"
            title={isMuted ? 'Unmute voice feedback' : 'Mute voice feedback'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
          <span className="text-[10px] bg-white text-black font-mono font-bold px-2 py-0.5 uppercase tracking-wider flex items-center gap-1">
            <Terminal className="w-3 h-3" /> Cockpit AI
          </span>
        </div>
      </div>

      {/* Frame Sandbox Warning / Guidance */}
      <div className="bg-[#ff453a]/10 border border-[#ff453a]/30 p-3 mb-5 text-[11px] leading-relaxed text-white/95">
        <span className="font-bold text-[#ff453a] block uppercase tracking-wider mb-0.5">🔒 SANDBOX PERMISSION NOTICE:</span>
        Chrome blocks microphone recording inside nested browser preview cards. 
        <strong className="text-white"> To use your actual voice</strong>, click the <strong className="text-white">"Open in New Tab" ↗</strong> icon at the top right of this page! Or use our rapid <strong className="text-white">Simulator Deck</strong> below.
      </div>

      <div className="flex flex-col items-center justify-center py-4 mb-4 bg-vivid-dark/40 border border-vivid-border p-4">
        {/* Animated Waveform / Mic Button */}
        <div className="flex items-center justify-center gap-1.5 h-12 mb-5 text-center max-w-[280px]">
          {isListening || isProcessing ? (
            waveformArr.map((h, i) => (
              <span
                key={i}
                className="w-1.5 bg-[#FF3B30] transition-all duration-75"
                style={{ height: `${h}px` }}
              />
            ))
          ) : (
            <span className="text-xs text-white/40 font-mono uppercase tracking-widest text-center">
              Tap mic to speak or use simulator
            </span>
          )}
        </div>

        <button
          onClick={toggleListening}
          className={`relative p-5 transition-all duration-300 rounded-none border-2 ${
            isListening
              ? 'bg-[#FF3B30] text-black border-transparent animate-pulse shadow-lg shadow-[#FF3B30]/20'
              : !isSupported
              ? 'bg-white/5 text-white/20 border-white/10 cursor-not-allowed'
              : 'bg-white text-black hover:bg-[#FF3B30] hover:text-white border-transparent'
          }`}
          disabled={!isSupported}
          title={!isSupported ? 'Microphone input not supported on this browser context' : 'Speak command'}
        >
          {isListening ? <MicOff className="w-7 h-7" /> : <Mic className={`w-7 h-7 ${!isSupported ? 'opacity-30' : ''}`} />}
        </button>
      </div>

      {/* Transcription & Feedback */}
      <div className="space-y-4">
        {transcript && (
          <div className="bg-vivid-dark border border-vivid-border p-3">
            <span className="text-[9px] text-[#FF3B30] font-black uppercase tracking-wider block mb-1">DETECTOR TRANSCRIPT / COMMAND</span>
            <p className="text-xs text-white/90 font-mono font-bold uppercase leading-relaxed">
              "{transcript}"
            </p>
          </div>
        )}

        {feedback && (
          <div className="bg-vivid-dark border border-[#FF3B30]/30 p-3.5 flex gap-2.5 items-start">
            <Sparkles className="w-4 h-4 text-[#FF3B30] shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="text-[9px] text-[#FF3B30] font-black uppercase tracking-wider block mb-0.5">COMPANION RESCUE FEEDBACK</span>
              <p className="text-xs text-white/80 leading-relaxed font-sans">{feedback}</p>
            </div>
          </div>
        )}

        {/* Simulator Presets */}
        <div className="pt-2 border-t border-white/10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[9px] text-[#ff453a] font-black uppercase tracking-wider">
              ⚡ Rapid Voice Simulator
            </span>
            <span className="text-[8px] text-white/40 font-mono">Click to simulate speech</span>
          </div>
          
          <div className="flex flex-col gap-1.5">
            {/* Student Sim */}
            <button
              onClick={() => {
                const cmd = "Add CS301 consensus engine assignment due tomorrow at 6 PM";
                setTranscript(cmd);
                startWaveformAnimation();
                setTimeout(() => {
                  stopWaveformAnimation();
                  processCommand(cmd);
                }, 1000);
              }}
              className="text-[10px] bg-vivid-dark border border-vivid-border hover:border-[#34C759]/40 text-white/70 px-3 py-2 text-left transition flex items-center justify-between uppercase font-mono"
            >
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#34C759]" />
                <span className="truncate">"Add CS301 assignment due tomorrow..."</span>
              </div>
              <span className="text-[8px] bg-[#34C759]/10 text-[#34C759] border border-[#34C759]/20 px-1 font-bold">STUDENT</span>
            </button>

            {/* Professional Sim */}
            <button
              onClick={() => {
                const cmd = "Add critical SLA production regression check due in 3 hours";
                setTranscript(cmd);
                startWaveformAnimation();
                setTimeout(() => {
                  stopWaveformAnimation();
                  processCommand(cmd);
                }, 1000);
              }}
              className="text-[10px] bg-vivid-dark border border-vivid-border hover:border-[#007AFF]/40 text-white/70 px-3 py-2 text-left transition flex items-center justify-between uppercase font-mono"
            >
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#007AFF]" />
                <span className="truncate">"Add critical SLA production regression..."</span>
              </div>
              <span className="text-[8px] bg-[#007AFF]/10 text-[#007AFF] border border-[#007AFF]/20 px-1 font-bold">PROFESSIONAL</span>
            </button>

            {/* Entrepreneur Sim */}
            <button
              onClick={() => {
                const cmd = "Add launch MVP presentation deck due tonight at 10 PM";
                setTranscript(cmd);
                startWaveformAnimation();
                setTimeout(() => {
                  stopWaveformAnimation();
                  processCommand(cmd);
                }, 1000);
              }}
              className="text-[10px] bg-vivid-dark border border-vivid-border hover:border-[#ff453a]/40 text-white/70 px-3 py-2 text-left transition flex items-center justify-between uppercase font-mono"
            >
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#ff453a]" />
                <span className="truncate">"Add launch MVP presentation deck..."</span>
              </div>
              <span className="text-[8px] bg-[#ff453a]/10 text-[#ff453a] border border-[#ff453a]/20 px-1 font-bold">FOUNDER</span>
            </button>

            {/* Action complete / plan sims */}
            <button
              onClick={() => {
                const cmd = "Mark study task completed";
                setTranscript(cmd);
                startWaveformAnimation();
                setTimeout(() => {
                  stopWaveformAnimation();
                  processCommand(cmd);
                }, 1000);
              }}
              className="text-[10px] bg-vivid-dark border border-vivid-border hover:border-yellow-400/40 text-white/70 px-3 py-2 text-left transition flex items-center justify-between uppercase font-mono"
            >
              <div className="flex items-center gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-yellow-400" />
                <span>"Mark study task completed"</span>
              </div>
              <span className="text-[8px] text-yellow-400 font-bold">RESOLVE</span>
            </button>

            <button
              onClick={() => {
                const cmd = "Generate rescue plan for consensus engine";
                setTranscript(cmd);
                startWaveformAnimation();
                setTimeout(() => {
                  stopWaveformAnimation();
                  processCommand(cmd);
                }, 1000);
              }}
              className="text-[10px] bg-vivid-dark border border-vivid-border hover:border-amber-500/40 text-white/70 px-3 py-2 text-left transition flex items-center justify-between uppercase font-mono"
            >
              <div className="flex items-center gap-2">
                <Play className="w-3.5 h-3.5 text-amber-500" />
                <span>"Generate rescue plan..."</span>
              </div>
              <span className="text-[8px] text-amber-500 font-bold">EAP PLAN</span>
            </button>
          </div>
        </div>

        {/* Text Input Fallback */}
        <form onSubmit={handleTextSubmit} className="flex gap-2 mt-4 pt-3 border-t border-white/10">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type command or voice input..."
            className="flex-1 bg-vivid-dark border border-vivid-border rounded-none px-4 py-3 text-xs text-white placeholder-white/30 focus:outline-none focus:border-[#FF3B30] transition font-semibold"
            disabled={isProcessing}
          />
          <button
            type="submit"
            className="bg-white hover:bg-[#FF3B30] text-black hover:text-white px-4 py-3 transition font-black text-xs uppercase flex items-center justify-center border border-transparent"
            disabled={isProcessing || !inputText.trim()}
          >
            <Send className="w-4 h-4 stroke-[2.5px]" />
          </button>
        </form>
      </div>
    </div>
  );
}
