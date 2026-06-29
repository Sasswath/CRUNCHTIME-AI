import React, { useState, useEffect } from 'react';
import { ShieldAlert, Zap, HelpCircle, Activity, Flame, ShieldCheck } from 'lucide-react';

export default function CrisisCalculator() {
  const [hoursLeft, setHoursLeft] = useState<number>(12);
  const [workloadHours, setWorkloadHours] = useState<number>(6);
  const [caffeineLevel, setCaffeineLevel] = useState<number>(150); // in mg
  const [sleepDebt, setSleepDebt] = useState<number>(5); // sleep last night in hours
  const [distractions, setDistractions] = useState<string[]>(['tabs']);

  const toggleDistraction = (id: string) => {
    if (distractions.includes(id)) {
      setDistractions(distractions.filter(d => d !== id));
    } else {
      setDistractions([...distractions, id]);
    }
  };

  // Calculate high stress crisis metrics
  const totalEffortRatio = workloadHours / Math.max(1, hoursLeft);
  
  // Panic risk calculation
  let panicScore = Math.min(100, Math.round(
    (totalEffortRatio * 45) + 
    ((8 - sleepDebt) * 5) + 
    (distractions.length * 8) + 
    (caffeineLevel > 300 ? (caffeineLevel - 200) * 0.05 : 0)
  ));
  if (panicScore < 10) panicScore = 10;

  // Survival rate calculation
  let survivalRate = Math.max(5, Math.round(
    100 - (panicScore * 0.8) - (totalEffortRatio > 1 ? (totalEffortRatio - 1) * 35 : 0)
  ));
  if (survivalRate > 100) survivalRate = 100;

  // Procrastination Hourly Tax
  const hourlyTax = Math.round((workloadHours * 15) * (1 + (distractions.length * 0.25)));

  let survivalDirective = "STABLE SECURE: You have enough time. Open EAP and lock in the schedule.";
  let directiveColor = "text-[#34C759] border-[#34C759]/30 bg-[#34C759]/5";

  if (panicScore >= 80) {
    survivalDirective = "⚠️ SYSTEM CRITICAL: Put phone in another room. Go to the Anti-Panic Sigh Coach first, then descope 50% of the project and begin Hour 1 immediately!";
    directiveColor = "text-[#FF3B30] border-[#FF3B30]/30 bg-[#FF3B30]/10 animate-pulse";
  } else if (panicScore >= 50) {
    survivalDirective = "⚡ HIGH WARNING: Drink 500ml water, turn off Slack, and enter the Focus Room. You are leaking precious capacity to small distractions.";
    directiveColor = "text-amber-400 border-amber-400/30 bg-amber-400/5";
  }

  return (
    <div className="bg-vivid-panel border-2 border-vivid-border p-6 relative overflow-hidden text-white font-sans">
      <div className="absolute top-0 right-0 w-32 h-32 bg-[#FF3B30]/5 rounded-full blur-2xl pointer-events-none"></div>

      {/* Header */}
      <div className="flex items-center gap-2 mb-5 border-b border-white/10 pb-4">
        <ShieldAlert className="w-5 h-5 text-[#FF3B30]" />
        <div>
          <span className="text-[10px] font-mono font-bold text-[#FF3B30] uppercase block tracking-widest">Interactive Stress Telemetry</span>
          <h3 className="text-sm font-black uppercase tracking-wider">
            Crisis Crash Risk & Procrastination Analyzer
          </h3>
        </div>
      </div>

      <p className="text-xs text-white/70 mb-5 leading-relaxed">
        Input your real-time parameters to analyze cognitive bandwidth, estimated survival chances, and procrastination penalty indexes.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Sliders and Configuration */}
        <div className="space-y-4">
          {/* Hours left slider */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-white/60 uppercase">Hours Until Deadline:</span>
              <span className="text-[#FF3B30] font-black">{hoursLeft} hrs left</span>
            </div>
            <input
              type="range"
              min="1"
              max="72"
              value={hoursLeft}
              onChange={(e) => setHoursLeft(parseInt(e.target.value))}
              className="w-full accent-[#FF3B30] bg-vivid-dark h-1 cursor-pointer"
            />
          </div>

          {/* Workload slider */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-white/60 uppercase">Required Deep Work Hours:</span>
              <span className="text-[#007AFF] font-black">{workloadHours} hrs work</span>
            </div>
            <input
              type="range"
              min="1"
              max="24"
              value={workloadHours}
              onChange={(e) => setWorkloadHours(parseInt(e.target.value))}
              className="w-full accent-[#007AFF] bg-vivid-dark h-1 cursor-pointer"
            />
          </div>

          {/* Sleep debt slider */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-white/60 uppercase">Sleep Last Night:</span>
              <span className="text-white font-black">{sleepDebt} hours</span>
            </div>
            <input
              type="range"
              min="3"
              max="10"
              value={sleepDebt}
              onChange={(e) => setSleepDebt(parseInt(e.target.value))}
              className="w-full accent-white bg-vivid-dark h-1 cursor-pointer"
            />
          </div>

          {/* Caffeine Select */}
          <div className="space-y-1.5">
            <label className="block text-[10px] font-mono text-white/50 uppercase tracking-wider">Caffeine Consumed</label>
            <div className="grid grid-cols-4 gap-1">
              {[
                { label: '0mg (None)', val: 0 },
                { label: '100mg (Safe)', val: 100 },
                { label: '250mg (Focus)', val: 250 },
                { label: '400mg+ (Arrhythmia)', val: 400 },
              ].map((item) => (
                <button
                  key={item.val}
                  onClick={() => setCaffeineLevel(item.val)}
                  className={`p-1.5 text-center border text-[9px] font-mono transition ${
                    caffeineLevel === item.val
                      ? 'bg-white text-black border-transparent font-bold'
                      : 'bg-vivid-dark/40 border-vivid-border text-white/60 hover:text-white'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Distractions Multiselect */}
          <div className="space-y-1.5">
            <label className="block text-[10px] font-mono text-white/50 uppercase tracking-wider">Focus Disruption Factors</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'tabs', label: '15+ Open browser tabs' },
                { id: 'notifications', label: 'Active Social Media/Slack' },
                { id: 'room', label: 'Noisy roommate/environment' },
                { id: 'multitask', label: 'Multi-tasking audio/video' },
              ].map((item) => {
                const isActive = distractions.includes(item.id);
                return (
                  <button
                    key={item.id}
                    onClick={() => toggleDistraction(item.id)}
                    className={`p-2 text-left border text-[10px] font-mono transition flex items-center justify-between ${
                      isActive
                        ? 'bg-[#FF3B30]/10 border-[#FF3B30] text-white'
                        : 'bg-vivid-dark/30 border-vivid-border text-white/50 hover:text-white hover:border-white/30'
                    }`}
                  >
                    <span>{item.label}</span>
                    <span className="text-[8px] opacity-60">{isActive ? '⚠️' : ' '}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Real-Time Telemetry Gauges */}
        <div className="bg-vivid-dark/50 border border-vivid-border p-4 flex flex-col justify-between">
          <div className="space-y-4">
            <span className="text-[9px] font-mono text-white/40 uppercase tracking-widest block">Survival Telemetry Metrics</span>

            {/* Panic level gauge */}
            <div className="space-y-1">
              <div className="flex justify-between items-end">
                <span className="text-[10px] font-mono text-white/60 uppercase">Panic Level Index</span>
                <span className={`text-sm font-black font-mono ${panicScore >= 75 ? 'text-[#FF3B30]' : 'text-amber-400'}`}>
                  {panicScore}%
                </span>
              </div>
              <div className="w-full bg-vivid-dark h-2 border border-vivid-border relative">
                <div 
                  className={`h-full transition-all duration-500 ${panicScore >= 75 ? 'bg-[#FF3B30]' : 'bg-amber-400'}`} 
                  style={{ width: `${panicScore}%` }} 
                />
              </div>
            </div>

            {/* Survival rate gauge */}
            <div className="space-y-1">
              <div className="flex justify-between items-end">
                <span className="text-[10px] font-mono text-white/60 uppercase">Estimated Survival Rate</span>
                <span className={`text-sm font-black font-mono ${survivalRate >= 65 ? 'text-[#34C759]' : 'text-[#FF3B30]'}`}>
                  {survivalRate}%
                </span>
              </div>
              <div className="w-full bg-vivid-dark h-2 border border-vivid-border relative">
                <div 
                  className={`h-full transition-all duration-500 ${survivalRate >= 65 ? 'bg-[#34C759]' : 'bg-[#FF3B30]'}`} 
                  style={{ width: `${survivalRate}%` }} 
                />
              </div>
            </div>

            {/* Procrastination Tax metric */}
            <div className="grid grid-cols-2 gap-2 pt-2">
              <div className="bg-vivid-dark p-2.5 border border-vivid-border">
                <span className="text-[8px] text-white/40 block font-mono uppercase">Effort Intensity</span>
                <span className="text-xs font-black font-mono text-[#007AFF] uppercase">
                  {totalEffortRatio > 1.2 ? '🚨 Hyper-Sustained' : totalEffortRatio > 0.8 ? '🔥 High Strain' : '🟢 Manageable'}
                </span>
              </div>
              <div className="bg-vivid-dark p-2.5 border border-vivid-border">
                <span className="text-[8px] text-white/40 block font-mono uppercase">Procrastination Cost</span>
                <span className="text-xs font-black font-mono text-white">
                  ${hourlyTax} / hr of delay
                </span>
              </div>
            </div>
          </div>

          {/* Live Directive Box */}
          <div className={`p-3 border mt-4 text-[11px] font-mono leading-relaxed ${directiveColor}`}>
            <span className="font-bold block uppercase tracking-wider mb-1">
              {panicScore >= 80 ? '🔥 TACTICAL SURVIVAL DIRECTIVE:' : '🛡️ GUIDANCE COUNSEL:'}
            </span>
            {survivalDirective}
          </div>
        </div>
      </div>
    </div>
  );
}
