import React, { useState } from 'react';
import { AlertTriangle, Clock, Zap, Target, CheckSquare, Printer, Sparkles, Loader2, ArrowRight, ArrowUp, ArrowDown, Trash2, Plus } from 'lucide-react';
import { Task, EmergencyPlan, PlanStep } from '../types';

interface EapGeneratorProps {
  tasks: Task[];
  activeEapPlan: EmergencyPlan | null;
  onSetEapPlan: (plan: EmergencyPlan | null) => void;
  onStartFocusSession: (plan: EmergencyPlan) => void;
}

export default function EapGenerator({
  tasks,
  activeEapPlan,
  onSetEapPlan,
  onStartFocusSession
}: EapGeneratorProps) {
  const [selectedTaskId, setSelectedTaskId] = useState<string>('');
  const [customCrisis, setCustomCrisis] = useState<string>('');
  const [customDeadline, setCustomDeadline] = useState<string>('4'); // hours from now
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  // Custom step builder states
  const [newStepAction, setNewStepAction] = useState<string>('');
  const [newStepDuration, setNewStepDuration] = useState<string>('45');
  const [newStepEnergy, setNewStepEnergy] = useState<'high' | 'medium' | 'low'>('high');
  const [newStepFocusTip, setNewStepFocusTip] = useState<string>('');

  const handleMoveStep = (index: number, direction: 'up' | 'down') => {
    if (!activeEapPlan) return;
    const steps = [...activeEapPlan.salvagePlanSteps];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= steps.length) return;

    // Swap
    const temp = steps[index];
    steps[index] = steps[targetIndex];
    steps[targetIndex] = temp;

    // Dynamically update time slots to match their new sequence
    const updatedSteps = steps.map((step, idx) => ({
      ...step,
      timeSlot: `Hour ${idx + 1}`
    }));

    onSetEapPlan({
      ...activeEapPlan,
      salvagePlanSteps: updatedSteps
    });
  };

  const handleDeleteStep = (index: number) => {
    if (!activeEapPlan) return;
    const steps = activeEapPlan.salvagePlanSteps.filter((_, idx) => idx !== index);

    // Dynamically update remaining time slots to match their sequence
    const updatedSteps = steps.map((step, idx) => ({
      ...step,
      timeSlot: `Hour ${idx + 1}`
    }));

    onSetEapPlan({
      ...activeEapPlan,
      salvagePlanSteps: updatedSteps
    });
  };

  const handleAddCustomStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeEapPlan || !newStepAction.trim()) return;

    const newStep: PlanStep = {
      timeSlot: `Hour ${activeEapPlan.salvagePlanSteps.length + 1}`,
      action: newStepAction.trim(),
      durationMinutes: parseInt(newStepDuration, 10) || 45,
      energyLevel: newStepEnergy,
      focusTip: newStepFocusTip.trim() || 'Keep your focus lock active to salvage this phase.'
    };

    onSetEapPlan({
      ...activeEapPlan,
      salvagePlanSteps: [...activeEapPlan.salvagePlanSteps, newStep]
    });

    setNewStepAction('');
    setNewStepDuration('45');
    setNewStepEnergy('high');
    setNewStepFocusTip('');
  };

  const generatePlan = async (title: string, desc: string, deadlineStr: string, category: string) => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/ai/emergency-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description: desc,
          deadline: deadlineStr,
          category,
          currentLocalTime: new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }) + ' IST'
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate plan');
      }

      const plan: EmergencyPlan = await response.json();
      onSetEapPlan(plan);
    } catch (err: any) {
      console.error(err);
      setError('Failed to generate your salvage plan. Please verify server connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleTaskPlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTaskId) return;

    const task = tasks.find(t => t.id === selectedTaskId);
    if (!task) return;

    await generatePlan(task.title, task.description, task.deadline, task.category);
  };

  const handleCustomCrisis = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customCrisis.trim()) return;

    const hours = parseFloat(customDeadline) || 4;
    const computedDeadline = new Date(Date.now() + hours * 60 * 60 * 1000).toISOString();

    await generatePlan(
      `Salvage: ${customCrisis}`,
      'Custom crisis-salvage plan generated for immediate deadline.',
      computedDeadline,
      'other'
    );
    setCustomCrisis('');
  };

  const printPlan = () => {
    window.print();
  };

  const highPriorityTasks = tasks.filter(t => t.status === 'pending');

  return (
    <div className="space-y-6 text-white">
      {/* Header section */}
      <div className="bg-vivid-panel border-2 border-[#FF3B30]/30 p-6 relative overflow-hidden glow-vivid">
        <div className="absolute top-0 right-0 w-48 h-48 bg-[#FF3B30]/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="bg-[#FF3B30] text-black text-[10px] font-black uppercase tracking-widest px-2.5 py-1 animate-pulse">
                EMERGENCY ROOM
              </span>
              <AlertTriangle className="w-5 h-5 text-amber-500" />
            </div>
            <h2 className="text-2xl font-black uppercase italic tracking-tighter text-white">
              EMERGENCY ACTION PLAN <span className="text-[#FF3B30]">(EAP) GENERATOR</span>
            </h2>
            <p className="text-xs text-white/50 uppercase font-mono tracking-wider">
              Stressed out? No time left? We create realistic hour-by-hour salvage schedules to rescue your deadlines.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column - Plan Request forms */}
        <div className="lg:col-span-4 space-y-8">
          {/* Form 1: Plan for existing Task */}
          <div className="bg-vivid-panel border-2 border-vivid-border p-6">
            <h3 className="text-sm font-black uppercase tracking-wider mb-5 flex items-center gap-2 text-white border-b border-white/10 pb-3">
              <Target className="w-4 h-4 text-[#FF3B30]" /> RESCUE TASK
            </h3>
            <form onSubmit={handleTaskPlan} className="space-y-4">
              <div>
                <label className="block text-[10px] text-white/50 font-mono font-bold mb-2 uppercase tracking-wider">Select Task</label>
                <select
                  value={selectedTaskId}
                  onChange={(e) => setSelectedTaskId(e.target.value)}
                  className="w-full bg-vivid-dark border-2 border-vivid-border px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#FF3B30] uppercase font-mono"
                >
                  <option value="">-- Choose a Deadline --</option>
                  {highPriorityTasks.map(t => {
                    const hoursLeft = Math.max(0, (new Date(t.deadline).getTime() - Date.now()) / (1000 * 60 * 60));
                    return (
                      <option key={t.id} value={t.id}>
                        {t.title} ({hoursLeft.toFixed(1)} hrs left)
                      </option>
                    );
                  })}
                </select>
              </div>
              <button
                type="submit"
                disabled={loading || !selectedTaskId}
                className="w-full bg-white hover:bg-[#FF3B30] text-black hover:text-white font-black py-3 px-4 text-xs uppercase tracking-widest transition border border-transparent disabled:opacity-30"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                Generate Salvage Plan
              </button>
            </form>
          </div>

          {/* Form 2: Custom Late crisis */}
          <div className="bg-vivid-panel border-2 border-vivid-border p-6">
            <h3 className="text-sm font-black uppercase tracking-wider mb-5 flex items-center gap-2 text-white border-b border-white/10 pb-3">
              <Zap className="w-4 h-4 text-[#FF3B30]" /> CUSTOM DISASTER
            </h3>
            <form onSubmit={handleCustomCrisis} className="space-y-4">
              <div>
                <label className="block text-[10px] text-white/50 font-mono font-bold mb-2 uppercase tracking-wider">What is the crisis?</label>
                <input
                  type="text"
                  value={customCrisis}
                  onChange={(e) => setCustomCrisis(e.target.value)}
                  placeholder="e.g. Physics Final tomorrow, haven't studied"
                  className="w-full bg-vivid-dark border border-vivid-border px-3 py-2.5 text-xs text-white placeholder-white/30 focus:outline-none focus:border-[#FF3B30]"
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] text-white/50 font-mono font-bold mb-2 uppercase tracking-wider">Hours Left Until Due</label>
                <input
                  type="number"
                  min="1"
                  max="48"
                  value={customDeadline}
                  onChange={(e) => setCustomDeadline(e.target.value)}
                  className="w-full bg-vivid-dark border border-vivid-border px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#FF3B30]"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading || !customCrisis.trim()}
                className="w-full bg-white hover:bg-[#FF3B30] text-black hover:text-white font-black py-3 px-4 text-xs uppercase tracking-widest transition border border-transparent disabled:opacity-30"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <AlertTriangle className="w-4 h-4" />}
                Save My Life Now
              </button>
            </form>
          </div>

          {error && (
            <div className="bg-black border-2 border-[#FF3B30] text-white p-4 font-mono text-xs uppercase">
              {error}
            </div>
          )}
        </div>

        {/* Right Column - Active EAP Plan Display */}
        <div className="lg:col-span-8">
          {activeEapPlan ? (
            <div className="bg-vivid-panel border-2 border-vivid-border p-6 space-y-6 print:bg-white print:text-black print:border-none print:shadow-none">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
                <div>
                  <span className="text-[10px] font-mono text-[#FF3B30] uppercase font-black tracking-widest">ACTIVATE EAP PLAN</span>
                  <h3 className="text-xl font-black uppercase tracking-tight text-white">{activeEapPlan.taskTitle}</h3>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-white/50 mt-1.5 font-mono uppercase font-bold">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-[#FF3B30]" />
                      Due: {new Date(activeEapPlan.deadline).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'short', timeStyle: 'short' })} IST
                    </span>
                    <span className="bg-white text-black px-2 py-0.5 font-black text-[9px]">
                      ~{activeEapPlan.hoursRemaining.toFixed(1)} hrs left
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 print:hidden">
                  <button
                    onClick={() => onSetEapPlan(null)}
                    className="p-3 bg-vivid-dark border border-[#FF3B30]/30 hover:border-[#FF3B30] text-white/70 hover:text-[#FF3B30] transition text-xs font-black uppercase tracking-wider flex items-center gap-1.5"
                    title="Discard current salvage plan"
                  >
                    <Trash2 className="w-4 h-4 text-[#FF3B30]" /> Discard Plan
                  </button>
                  <button
                    onClick={printPlan}
                    className="p-3 bg-vivid-dark border border-vivid-border text-white/70 hover:text-white hover:border-white transition text-xs font-black uppercase tracking-wider flex items-center gap-1.5"
                    title="Print Salvage Manual"
                  >
                    <Printer className="w-4 h-4" /> Print
                  </button>
                  <button
                    onClick={() => onStartFocusSession(activeEapPlan)}
                    className="bg-[#FF3B30] text-black hover:bg-white hover:text-black border border-transparent px-5 py-3 text-xs font-black uppercase tracking-widest transition flex items-center gap-1.5"
                  >
                    Focus Room <ArrowRight className="w-4 h-4 stroke-[2.5px]" />
                  </button>
                </div>
              </div>

              {/* Steps block */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black uppercase tracking-widest text-[#FF3B30] flex items-center gap-2">
                    <Clock className="w-4 h-4" /> Salvage Schedule (Hour-By-Hour)
                  </h4>
                  <span className="text-[10px] text-white/40 font-mono uppercase">
                    Use Up/Down to prioritize steps
                  </span>
                </div>
                <div className="space-y-4 relative before:absolute before:inset-y-3 before:left-3.5 before:w-0.5 before:bg-white/10">
                  {activeEapPlan.salvagePlanSteps.map((step, idx) => (
                    <div key={idx} className="relative pl-10 group">
                      <div className="absolute left-1 top-2.5 w-6 h-6 bg-black border-2 border-[#FF3B30] text-[10px] font-black text-white flex items-center justify-center">
                        {idx + 1}
                      </div>
                      <div className="bg-vivid-dark border border-vivid-border p-4 hover:border-white transition">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2 pb-2 border-b border-white/5">
                          <span className="font-mono text-xs text-[#FF3B30] font-black uppercase tracking-wider">Priority {idx + 1}</span>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[9px] bg-white text-black font-mono px-2 py-0.5 font-bold uppercase tracking-wider">
                              {step.durationMinutes} min
                            </span>
                            <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 border ${
                              step.energyLevel === 'high'
                                ? 'bg-black text-[#FF3B30] border-[#FF3B30]/40'
                                : step.energyLevel === 'medium'
                                ? 'bg-black text-amber-500 border-amber-500/40'
                                : 'bg-black text-[#34C759] border-[#34C759]/40'
                            }`}>
                              {step.energyLevel} Energy
                            </span>

                            {/* Reordering and deleting controls */}
                            <div className="flex items-center gap-1 border-l border-white/10 pl-2 ml-1 print:hidden">
                              <button
                                disabled={idx === 0}
                                onClick={() => handleMoveStep(idx, 'up')}
                                className="p-1 text-white/50 hover:text-white hover:bg-white/10 disabled:opacity-20 disabled:pointer-events-none transition rounded"
                                title="Move Step Up (Prioritize first)"
                              >
                                <ArrowUp className="w-3.5 h-3.5" />
                              </button>
                              <button
                                disabled={idx === activeEapPlan.salvagePlanSteps.length - 1}
                                onClick={() => handleMoveStep(idx, 'down')}
                                className="p-1 text-white/50 hover:text-white hover:bg-white/10 disabled:opacity-20 disabled:pointer-events-none transition rounded"
                                title="Move Step Down (Prioritize later)"
                              >
                                <ArrowDown className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteStep(idx)}
                                className="p-1 text-white/50 hover:text-[#FF3B30] hover:bg-[#FF3B30]/10 transition rounded ml-0.5"
                                title="Delete this step from plan"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                        <p className="text-xs text-white font-bold uppercase tracking-tight mb-3">{step.action}</p>
                        <div className="bg-vivid-panel border border-vivid-border p-3 flex items-start gap-2 text-xs text-white/60">
                          <Target className="w-4 h-4 text-[#FF3B30] shrink-0 mt-0.5" />
                          <span><strong className="text-white uppercase font-black tracking-wider text-[10px] block mb-0.5">Focus Hack</strong> {step.focusTip}</span>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Add Custom Step interactive block */}
                  <div className="relative pl-10 group mt-6 print:hidden">
                    <div className="absolute left-1 top-2.5 w-6 h-6 bg-vivid-dark border border-dashed border-white/30 text-[10px] font-mono text-white/40 flex items-center justify-center">
                      +
                    </div>
                    <div className="bg-vivid-dark/40 border border-dashed border-vivid-border p-4 hover:border-white/20 transition">
                      <h5 className="text-[10px] font-mono font-bold text-[#FF3B30] uppercase tracking-widest mb-3 flex items-center gap-1.5">
                        <Plus className="w-3.5 h-3.5" /> Append Custom Step to Salvage Plan
                      </h5>
                      <form onSubmit={handleAddCustomStep} className="space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                          <div className="sm:col-span-6">
                            <label className="block text-[9px] text-white/40 font-mono font-bold mb-1 uppercase tracking-wider">Action Description</label>
                            <input
                              type="text"
                              value={newStepAction}
                              onChange={(e) => setNewStepAction(e.target.value)}
                              placeholder="e.g. Write database setup code"
                              className="w-full bg-vivid-dark border border-vivid-border px-3 py-2 text-xs text-white focus:outline-none focus:border-[#FF3B30] placeholder-white/25"
                              required
                            />
                          </div>
                          <div className="sm:col-span-3">
                            <label className="block text-[9px] text-white/40 font-mono font-bold mb-1 uppercase tracking-wider">Duration (Min)</label>
                            <input
                              type="number"
                              min="1"
                              max="180"
                              value={newStepDuration}
                              onChange={(e) => setNewStepDuration(e.target.value)}
                              placeholder="45"
                              className="w-full bg-vivid-dark border border-vivid-border px-3 py-2 text-xs text-white focus:outline-none focus:border-[#FF3B30]"
                            />
                          </div>
                          <div className="sm:col-span-3">
                            <label className="block text-[9px] text-white/40 font-mono font-bold mb-1 uppercase tracking-wider">Energy Needed</label>
                            <select
                              value={newStepEnergy}
                              onChange={(e) => setNewStepEnergy(e.target.value as 'high' | 'medium' | 'low')}
                              className="w-full bg-vivid-dark border border-vivid-border px-2 py-2 text-xs text-white focus:outline-none focus:border-[#FF3B30] uppercase font-mono"
                            >
                              <option value="high">High</option>
                              <option value="medium">Medium</option>
                              <option value="low">Low</option>
                            </select>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={newStepFocusTip}
                            onChange={(e) => setNewStepFocusTip(e.target.value)}
                            placeholder="Optional Focus Hack Tip (e.g. Turn off Slack alerts)"
                            className="flex-1 bg-vivid-dark border border-vivid-border px-3 py-2 text-xs text-white focus:outline-none focus:border-[#FF3B30] placeholder-white/25"
                          />
                          <button
                            type="submit"
                            className="bg-white hover:bg-[#FF3B30] text-black hover:text-white font-black px-5 text-xs uppercase tracking-wider transition shrink-0"
                          >
                            Add Step
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>

                </div>
              </div>

              {/* Survival advice section */}
              <div className="bg-vivid-dark border border-vivid-border p-5 space-y-4">
                <h4 className="text-xs font-black uppercase tracking-widest text-[#FF3B30] flex items-center gap-2 border-b border-white/10 pb-2">
                  <CheckSquare className="w-4 h-4" /> Mental Framing (AI Survival Kit)
                </h4>
                <ul className="space-y-3">
                  {activeEapPlan.generalTips.map((tip, idx) => (
                    <li key={idx} className="flex gap-2.5 items-start text-xs text-white/85">
                      <Zap className="w-4 h-4 text-[#FF3B30] shrink-0 mt-0.5" />
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <div className="border-2 border-dashed border-vivid-border p-16 text-center flex flex-col items-center justify-center space-y-4 bg-vivid-panel">
              <div className="p-4 bg-vivid-dark border border-vivid-border">
                <AlertTriangle className="w-8 h-8 text-white/30" />
              </div>
              <div className="max-w-md">
                <h3 className="text-xs font-black uppercase tracking-widest text-white/40">No Active Action Plan</h3>
                <p className="text-xs text-white/50 mt-2 leading-relaxed">
                  Choose a high-stakes task from the left column or type a custom panic scenario to generate your hyper-focused rescue protocol.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
