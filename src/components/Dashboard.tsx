import React, { useState, useEffect, useRef } from 'react';
import {
  Clock, AlertTriangle, CheckCircle, Trash2, Plus, Sparkles, ChevronDown, ChevronUp,
  Brain, Zap, PlusCircle, CheckSquare, RefreshCw, Star, Calendar, GraduationCap,
  Briefcase, Rocket, Users, Music, Volume2, Play, Pause, Flame, AlertCircle,
  DollarSign, Activity, Check
} from 'lucide-react';
import { Task, Habit, Recommendation, Priority, TaskCategory, Subtask, User } from '../types';
import CrisisCalculator from './CrisisCalculator';

interface DashboardProps {
  currentUser?: User;
  tasks: Task[];
  habits: Habit[];
  recommendations: Recommendation[];
  adviceText: string;
  onAddTask: (task: Partial<Task>) => void;
  onUpdateTask: (id: string, updates: Partial<Task>) => void;
  onDeleteTask: (id: string) => void;
  onAddHabit: (name: string) => void;
  onToggleHabit: (id: string) => void;
  onDeleteHabit: (id: string) => void;
  onPrioritizeAll: () => Promise<void>;
  onTriggerEapPlan: (task: Task) => void;
  refreshRecs: () => Promise<void>;
  autoRemoveCompleted?: boolean;
  autoRemoveAfterDeadline?: boolean;
  onToggleAutoRemoveCompleted?: (val: boolean) => void;
  onToggleAutoRemoveAfterDeadline?: (val: boolean) => void;
}

export default function Dashboard({
  currentUser,
  tasks,
  habits,
  recommendations,
  adviceText,
  onAddTask,
  onUpdateTask,
  onDeleteTask,
  onAddHabit,
  onToggleHabit,
  onDeleteHabit,
  onPrioritizeAll,
  onTriggerEapPlan,
  refreshRecs,
  autoRemoveCompleted = false,
  autoRemoveAfterDeadline = false,
  onToggleAutoRemoveCompleted,
  onToggleAutoRemoveAfterDeadline
}: DashboardProps) {
  // Task form state
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');

  // STUDENT-SPECIFIC INTERACTIVE STATES
  const [pomoTime, setPomoTime] = useState(1500); // 25 minutes
  const [pomoActive, setPomoActive] = useState(false);
  const [activeTrack, setActiveTrack] = useState('Chill Lofi study beats');
  const [musicPlaying, setMusicPlaying] = useState(false);
  const [gradeThreat, setGradeThreat] = useState(3);

  // PROFESSIONAL-SPECIFIC INTERACTIVE STATES
  const [meetingCount, setMeetingCount] = useState(4);
  const [slaOverdueCount, setSlaOverdueCount] = useState(1);

  // ENTREPRENEUR-SPECIFIC INTERACTIVE STATES
  const [fundingRunway, setFundingRunway] = useState(8); // weeks
  const [dailySleep, setDailySleep] = useState(5); // hours
  const [checkedDescopeFeatures, setCheckedDescopeFeatures] = useState<string[]>([
    'Native iOS & Android apps', 'Complex microservices backend', 'Enterprise SSO integration', 'AI continuous multi-lingual translation'
  ]);
  const [descopeResult, setDescopeResult] = useState('');

  // Pomodoro countdown ticker
  useEffect(() => {
    let interval: any = null;
    if (pomoActive) {
      interval = setInterval(() => {
        setPomoTime((prev) => {
          if (prev <= 1) {
            setPomoActive(false);
            alert("⏰ POMODORO FOCUS SESSION COMPLETE! Time for a well-deserved 5-minute break!");
            return 1500;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [pomoActive]);

  // Get tomorrow's date at 17:00
  const getTomorrowDateStr = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const [taskDate, setTaskDate] = useState(getTomorrowDateStr());
  const [taskDateInput, setTaskDateInput] = useState('');
  const [taskTime, setTaskTime] = useState('17:00');
  const datePickerRef = useRef<HTMLInputElement>(null);

  // Helper to format YYYY-MM-DD to DD/MM/YYYY
  const formatToIndianDate = (dateStr: string) => {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dateStr;
  };

  // Sync state to text input
  useEffect(() => {
    if (taskDate) {
      setTaskDateInput(formatToIndianDate(taskDate));
    }
  }, [taskDate]);

  // Handle typing in text input (supports auto slash insertion and validation)
  const handleDateTextInput = (val: string) => {
    // Only allow digits and slashes
    let cleaned = val.replace(/[^0-9/]/g, '');
    
    // Auto format as DD/MM/YYYY
    if (cleaned.length === 2 && !cleaned.includes('/') && val.length > taskDateInput.length) {
      cleaned = cleaned + '/';
    } else if (cleaned.length === 5 && cleaned.split('/').length === 2 && val.length > taskDateInput.length) {
      cleaned = cleaned + '/';
    }
    
    // Limit to 10 characters
    if (cleaned.length > 10) {
      cleaned = cleaned.slice(0, 10);
    }
    
    setTaskDateInput(cleaned);
    
    // If complete and valid, parse and set taskDate
    if (cleaned.length === 10) {
      const parts = cleaned.split('/');
      if (parts.length === 3) {
        const dd = parts[0];
        const mm = parts[1];
        const yyyy = parts[2];
        const dateObj = new Date(`${yyyy}-${mm}-${dd}`);
        if (!isNaN(dateObj.getTime()) && yyyy.length === 4) {
          setTaskDate(`${yyyy}-${mm}-${dd}`);
        }
      }
    }
  };

  const triggerDatePicker = () => {
    if (datePickerRef.current) {
      try {
        datePickerRef.current.showPicker();
      } catch (err) {
        datePickerRef.current.click();
      }
    }
  };

  const [taskCategory, setTaskCategory] = useState<TaskCategory>('assignment');
  const [taskPriority, setTaskPriority] = useState<Priority>('medium');
  const [taskHours, setTaskHours] = useState('2');

  // Habit input state
  const [habitName, setHabitName] = useState('');

  // UI state
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);
  const [isBreakingDown, setIsBreakingDown] = useState<string | null>(null);
  const [isPrioritizing, setIsPrioritizing] = useState(false);
  const [isRefreshingRecs, setIsRefreshingRecs] = useState(false);

  // Form submit
  const handleAddTaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim() || !taskDate || !taskTime) return;

    const combinedDeadline = `${taskDate}T${taskTime}`;

    onAddTask({
      title: taskTitle,
      description: taskDesc,
      deadline: new Date(combinedDeadline).toISOString(),
      category: taskCategory,
      priority: taskPriority,
      estimatedHours: parseFloat(taskHours) || 1,
      status: 'pending',
      subtasks: [],
      priorityScore: taskPriority === 'high' ? 80 : taskPriority === 'medium' ? 50 : 20
    });

    // Reset Form
    setTaskTitle('');
    setTaskDesc('');
    setTaskDate(getTomorrowDateStr());
    setTaskTime('17:00');
    setTaskCategory('assignment');
    setTaskPriority('medium');
    setTaskHours('2');
  };

  const handleAddHabitSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!habitName.trim()) return;
    onAddHabit(habitName);
    setHabitName('');
  };

  const triggerTaskBreakdown = async (task: Task) => {
    setIsBreakingDown(task.id);
    try {
      const response = await fetch('/api/ai/breakdown', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ task })
      });

      if (!response.ok) throw new Error('Breakdown failed');

      const steps: { title: string; estimatedMinutes: number }[] = await response.json();
      const newSubtasks: Subtask[] = steps.map((s, idx) => ({
        id: `sub_${Date.now()}_${idx}`,
        title: s.title,
        completed: false,
        estimatedMinutes: s.estimatedMinutes
      }));

      onUpdateTask(task.id, { subtasks: [...task.subtasks, ...newSubtasks] });
    } catch (err) {
      console.error(err);
    } finally {
      setIsBreakingDown(null);
    }
  };

  const handleToggleSubtask = (taskId: string, subtaskId: string, completed: boolean) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    const updatedSubtasks = task.subtasks.map(st =>
      st.id === subtaskId ? { ...st, completed } : st
    );
    onUpdateTask(taskId, { subtasks: updatedSubtasks });
  };

  const triggerPrioritization = async () => {
    setIsPrioritizing(true);
    await onPrioritizeAll();
    setIsPrioritizing(false);
  };

  const triggerRefreshRecommendations = async () => {
    setIsRefreshingRecs(true);
    await refreshRecs();
    setIsRefreshingRecs(false);
  };

  // Helper formatting values
  const getTimeRemainingStr = (deadlineStr: string) => {
    const diffMs = new Date(deadlineStr).getTime() - Date.now();
    if (diffMs <= 0) return 'Overdue';

    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days}d ${hours % 24}h remaining`;
    }
    return `${hours}h ${mins}m remaining`;
  };

  const isUrgent = (deadlineStr: string) => {
    const diffMs = new Date(deadlineStr).getTime() - Date.now();
    return diffMs > 0 && diffMs < 24 * 60 * 60 * 1000; // under 24 hours
  };

  const sortedTasks = [...tasks].sort((a, b) => b.priorityScore - a.priorityScore);

  return (
    <div className="space-y-8 text-white">
      {/* Role-Based Cockpit Status Banner */}
      {currentUser && currentUser.role && (
        <div className="bg-vivid-panel border-2 border-vivid-border/40 p-5 sm:p-6 relative overflow-hidden flex flex-col md:flex-row gap-5 items-center justify-between shadow-lg">
          {/* Subtle colored side-glow indicators based on role */}
          {currentUser.role === 'student' && (
            <div className="absolute top-0 left-0 w-2.5 h-full bg-[#34C759]" />
          )}
          {currentUser.role === 'professional' && (
            <div className="absolute top-0 left-0 w-2.5 h-full bg-[#007AFF]" />
          )}
          {currentUser.role === 'entrepreneur' && (
            <div className="absolute top-0 left-0 w-2.5 h-full bg-[#ff453a]" />
          )}

          <div className="flex flex-col sm:flex-row items-center gap-4.5 text-center sm:text-left w-full md:w-auto">
            <div className={`p-4 rounded-none border shrink-0 ${
              currentUser.role === 'student' ? 'bg-[#34C759]/10 border-[#34C759]/40 text-[#34C759]' :
              currentUser.role === 'professional' ? 'bg-[#007AFF]/10 border-[#007AFF]/40 text-[#007AFF]' :
              'bg-[#ff453a]/10 border-[#ff453a]/40 text-[#ff453a]'
            }`}>
              {currentUser.role === 'student' && <GraduationCap className="w-8 h-8" />}
              {currentUser.role === 'professional' && <Briefcase className="w-8 h-8" />}
              {currentUser.role === 'entrepreneur' && <Rocket className="w-8 h-8" />}
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-start">
                <span className={`text-[9px] font-mono font-black uppercase tracking-wider px-2.5 py-0.5 border ${
                  currentUser.role === 'student' ? 'bg-[#34C759]/10 border-[#34C759]/30 text-[#34C759]' :
                  currentUser.role === 'professional' ? 'bg-[#007AFF]/10 border-[#007AFF]/30 text-[#007AFF]' :
                  'bg-[#ff453a]/10 border-[#ff453a]/30 text-[#ff453a]'
                }`}>
                  {currentUser.role === 'student' && '🎓 STUDENT COMMAND DESK'}
                  {currentUser.role === 'professional' && '💼 ENTERPRISE WORKSTATION'}
                  {currentUser.role === 'entrepreneur' && '🚀 FOUNDER FLIGHT DECK'}
                </span>
                {currentUser.institution && (
                  <span className="text-[10px] font-mono text-white/50 uppercase tracking-wider">
                    at {currentUser.institution}
                  </span>
                )}
              </div>

              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white uppercase italic">
                {currentUser.username}'s Focus Console
              </h2>
              
              {currentUser.mainGoal && (
                <p className="text-xs text-white/70 font-sans">
                  🎯 <strong className="text-white">Active Rescue Mission:</strong> {currentUser.mainGoal}
                </p>
              )}
            </div>
          </div>

          {/* Quick Metrics Indicators */}
          <div className="grid grid-cols-2 gap-4 border-l border-white/5 pl-5 w-full md:w-auto">
            <div className="space-y-0.5 text-center sm:text-left">
              <span className="text-[9px] font-mono text-white/40 uppercase tracking-widest block">DAILY BUDGET</span>
              <span className="text-xs font-mono font-bold text-[#a78bfa] flex items-center gap-1 justify-center sm:justify-start">
                <Clock className="w-3.5 h-3.5 text-[#ff453a]" /> {currentUser.dailyFocusHours || 4}h flow
              </span>
            </div>
            <div className="space-y-0.5 text-center sm:text-left">
              <span className="text-[9px] font-mono text-white/40 uppercase tracking-widest block">SYNC MODE</span>
              <span className="text-xs font-mono font-bold text-white flex items-center gap-1 justify-center sm:justify-start">
                <Users className="w-3.5 h-3.5 text-[#a78bfa]" /> {currentUser.workMode === 'solo' ? 'SOLO ISOLATION' : 'TEAM ALIGN'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* DYNAMIC PERSONALIZED PROFESSIONS DASHBOARD COCKPIT */}
      {currentUser && currentUser.role && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {currentUser.role === 'student' && (
            <>
              {/* STUDENT COLUMN 1: POMODORO & AMBIENT LOFI HUB */}
              <div className="bg-vivid-panel border border-[#34C759]/40 p-5 relative overflow-hidden flex flex-col justify-between">
                <div className="absolute top-0 right-0 w-24 h-24 bg-[#34C759]/5 rounded-full blur-2xl pointer-events-none"></div>
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Music className="w-5 h-5 text-[#34C759]" />
                    <span className="text-[10px] font-mono font-bold text-[#34C759] uppercase tracking-wider">
                      ACADEMIC STUDY ROOM & POMODORO BUDDY
                    </span>
                  </div>

                  <div className="bg-vivid-dark/80 border border-vivid-border p-4 mb-4 text-center">
                    <span className="text-[9px] text-white/50 font-mono uppercase tracking-widest block mb-1">
                      ACTIVE FOCUS INTERVAL
                    </span>
                    <div className="text-4xl font-black font-mono tracking-widest text-[#34C759] mb-3">
                      {Math.floor(pomoTime / 60)}:{String(pomoTime % 60).padStart(2, '0')}
                    </div>
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => setPomoActive(!pomoActive)}
                        className={`px-4 py-1.5 text-[10px] font-mono font-bold uppercase border transition ${
                          pomoActive 
                            ? 'bg-[#34C759]/10 border-[#34C759] text-[#34C759]' 
                            : 'bg-white text-black border-transparent hover:bg-[#34C759] hover:text-black'
                        }`}
                      >
                        {pomoActive ? 'PAUSE TIMER' : 'START INTENSE FOCUS'}
                      </button>
                      <button
                        onClick={() => {
                          setPomoActive(false);
                          setPomoTime(1500);
                        }}
                        className="px-3 py-1.5 text-[10px] font-mono border border-white/10 text-white/60 hover:text-white hover:border-white transition"
                      >
                        RESET
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <span className="text-[9px] text-white/40 font-mono uppercase tracking-widest block">
                      AMBIENT CONCENTRATION LOOPS
                    </span>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { name: 'Chill Lofi Beats', icon: '🎧' },
                        { name: 'Rain Ambience', icon: '🌧️' },
                        { name: 'Synth Focus', icon: '🎹' }
                      ].map((track) => (
                        <button
                          key={track.name}
                          onClick={() => {
                            setActiveTrack(track.name);
                            setMusicPlaying(true);
                          }}
                          className={`p-2 text-center border text-[10px] transition font-mono ${
                            activeTrack === track.name && musicPlaying
                              ? 'bg-[#34C759]/10 border-[#34C759] text-white'
                              : 'bg-vivid-dark/40 border-vivid-border text-white/60 hover:text-white hover:border-white/30'
                          }`}
                        >
                          <div className="text-sm mb-1">{track.icon}</div>
                          <span className="truncate block">{track.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {musicPlaying && (
                  <div className="mt-4 bg-[#34C759]/5 border border-[#34C759]/20 p-2.5 flex items-center justify-between text-xs font-mono text-[#34C759]">
                    <span className="flex items-center gap-2">
                      <Volume2 className="w-4 h-4 animate-bounce" />
                      <span>NOW STREAMING: <strong className="text-white uppercase">{activeTrack}</strong></span>
                    </span>
                    <button 
                      onClick={() => setMusicPlaying(false)} 
                      className="text-[10px] underline hover:text-white"
                    >
                      MUTE
                    </button>
                  </div>
                )}
              </div>

              {/* STUDENT COLUMN 2: GPA SECURITY MARGIN SIMULATOR */}
              <div className="bg-vivid-panel border border-[#34C759]/40 p-5 relative overflow-hidden flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <GraduationCap className="w-5 h-5 text-[#34C759]" />
                    <span className="text-[10px] font-mono font-bold text-[#34C759] uppercase tracking-wider">
                      GPA SECURITY MARGIN & DEADLINE RISK GAUGE
                    </span>
                  </div>

                  <p className="text-xs text-white/70 mb-4 leading-relaxed font-sans">
                    Last-minute procrastination heavily discounts term GPA. Use our tactical calculator to assess active threat margins.
                  </p>

                  <div className="space-y-4 mb-4 bg-vivid-dark/30 p-4 border border-vivid-border">
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-white/60">UNSUBMITTED TASKS / LABS:</span>
                      <span className="text-white font-bold">{gradeThreat} pending</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={gradeThreat}
                      onChange={(e) => setGradeThreat(parseInt(e.target.value))}
                      className="w-full accent-[#34C759] bg-vivid-dark"
                    />

                    <div className="grid grid-cols-2 gap-2 text-center pt-2">
                      <div className="bg-vivid-dark p-2 border border-vivid-border">
                        <span className="text-[8px] text-white/40 block font-mono">EST. TERM GPA DROP</span>
                        <span className="text-base font-black font-mono text-[#ff453a]">
                          -{(gradeThreat * 0.28).toFixed(2)} pts
                        </span>
                      </div>
                      <div className="bg-vivid-dark p-2 border border-vivid-border">
                        <span className="text-[8px] text-white/40 block font-mono">DEADLINE THREAT LEVEL</span>
                        <span className={`text-xs font-black font-mono uppercase ${
                          gradeThreat >= 7 ? 'text-[#ff453a]' : gradeThreat >= 4 ? 'text-amber-400' : 'text-[#34C759]'
                        }`}>
                          {gradeThreat >= 7 ? '⚠️ SYSTEM CRITICAL' : gradeThreat >= 4 ? '⚡ HIGH WARNING' : '🟢 STABLE SECURE'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-[#34C759]/5 border border-[#34C759]/20 p-3 text-[11px] leading-relaxed text-white/80 font-mono">
                  <span className="font-bold text-[#34C759] uppercase tracking-widest block mb-0.5">🎓 ACADEMIC DIRECTIVE:</span>
                  Each remaining hour has a 4x impact score multiplier. Start with your highest estimated hour assignment instantly.
                </div>
              </div>
            </>
          )}

          {currentUser.role === 'professional' && (
            <>
              {/* PROFESSIONAL COLUMN 1: COGNITIVE FATIGUE GUARD */}
              <div className="bg-vivid-panel border border-[#007AFF]/40 p-5 relative overflow-hidden flex flex-col justify-between">
                <div className="absolute top-0 right-0 w-24 h-24 bg-[#007AFF]/5 rounded-full blur-3xl pointer-events-none"></div>
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Activity className="w-5 h-5 text-[#007AFF]" />
                    <span className="text-[10px] font-mono font-bold text-[#007AFF] uppercase tracking-wider">
                      COGNITIVE FATIGUE & MEETING CONTEXT-SWITCH RISK
                    </span>
                  </div>

                  <p className="text-xs text-white/70 mb-4 leading-relaxed font-sans">
                    Corporate context-switching costs up to 40% of deep focus capacity. Gauge your alignment pollution score:
                  </p>

                  <div className="space-y-4 mb-4 bg-vivid-dark/30 p-4 border border-vivid-border">
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-white/60">MEETINGS / ALIGNMENTS TODAY:</span>
                      <span className="text-white font-bold">{meetingCount} calls</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={meetingCount}
                      onChange={(e) => setMeetingCount(parseInt(e.target.value))}
                      className="w-full accent-[#007AFF] bg-vivid-dark"
                    />

                    <div className="grid grid-cols-2 gap-2 text-center pt-2">
                      <div className="bg-vivid-dark p-2 border border-vivid-border">
                        <span className="text-[8px] text-white/40 block font-mono">SWITCHING DRAG INDEX</span>
                        <span className="text-base font-black font-mono text-amber-400">
                          {(meetingCount * 12).toFixed(0)}% loss
                        </span>
                      </div>
                      <div className="bg-vivid-dark p-2 border border-vivid-border">
                        <span className="text-[8px] text-white/40 block font-mono">RECOMMENDED SHIELD</span>
                        <span className={`text-xs font-black font-mono uppercase ${
                          meetingCount >= 6 ? 'text-[#ff453a] animate-pulse' : 'text-[#007AFF]'
                        }`}>
                          {meetingCount >= 6 ? '🛡️ BLOCK OUT' : meetingCount >= 4 ? '⏰ DECLINE CALLS' : '🟢 DEEP BLOCK OK'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {meetingCount >= 5 && (
                  <div className="bg-[#ff453a]/10 border border-[#ff453a]/30 p-2.5 text-[11px] leading-relaxed text-white/90 font-mono">
                    ⚠️ <strong>SLA CRITICAL WARNING:</strong> Extreme meeting fragmentation blocks your absolute deliverables. Cancel or defer non-urgent calls immediately to safeguard project timelines.
                  </div>
                )}
              </div>

              {/* PROFESSIONAL COLUMN 2: CONTRACTUAL SLA PENALTY MATRIX */}
              <div className="bg-vivid-panel border border-[#007AFF]/40 p-5 relative overflow-hidden flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <DollarSign className="w-5 h-5 text-[#007AFF]" />
                    <span className="text-[10px] font-mono font-bold text-[#007AFF] uppercase tracking-wider">
                      SLA COMPLIANCE RISK & OVERTIME PREDICTOR
                    </span>
                  </div>

                  <p className="text-xs text-white/70 mb-4 leading-relaxed font-sans">
                    Delayed deliveries incur massive technical debt, missed sprint metrics, and critical SLA escalations.
                  </p>

                  <div className="space-y-3 bg-vivid-dark/40 border border-vivid-border p-4 mb-4">
                    <div className="flex justify-between items-center text-xs font-mono border-b border-white/5 pb-2">
                      <span className="text-white/50">ACTIVE SLA RISKS:</span>
                      <span className="font-bold text-white uppercase">{(tasks.filter(t => t.priority === 'high' && t.status === 'pending').length)} high-impact</span>
                    </div>

                    <div className="flex justify-between items-center text-xs font-mono border-b border-white/5 pb-2">
                      <span className="text-white/50">ESTIMATED EXHAUSTION INDEX:</span>
                      <span className="font-bold text-amber-400">{(tasks.reduce((sum, t) => sum + (t.status === 'pending' ? t.estimatedHours : 0), 0) > 6) ? '🔥 SEVERE OVERTIME' : '🟢 BUDGET COMPLIANT'}</span>
                    </div>

                    <div className="flex justify-between items-center text-xs font-mono">
                      <span className="text-white/50">COGNITIVE SPRINT VELOCITY:</span>
                      <span className="font-bold text-[#007AFF]">{currentUser.dailyFocusHours || 4}h high-efficiency focus</span>
                    </div>
                  </div>
                </div>

                <div className="bg-[#007AFF]/5 border border-[#007AFF]/20 p-3 text-[11px] leading-relaxed text-white/80 font-mono">
                  <span className="font-bold text-[#007AFF] uppercase tracking-widest block mb-0.5">💼 OPERATIONS DIRECTIVE:</span>
                  Apply the "Two-Minute Rule" on simple client alignments. Do not commit to unreviewed stakeholder requirements mid-sprint.
                </div>
              </div>
            </>
          )}

          {currentUser.role === 'entrepreneur' && (
            <>
              {/* ENTREPRENEUR COLUMN 1: FOUNDER SURVIVAL RUNWAY CALCULATOR */}
              <div className="bg-vivid-panel border border-[#ff453a]/40 p-5 relative overflow-hidden flex flex-col justify-between">
                <div className="absolute top-0 right-0 w-24 h-24 bg-[#ff453a]/5 rounded-full blur-3xl pointer-events-none"></div>
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Flame className="w-5 h-5 text-[#ff453a]" />
                    <span className="text-[10px] font-mono font-bold text-[#ff453a] uppercase tracking-wider">
                      COGNITIVE RUNWAY SURVIVAL COCKPIT
                    </span>
                  </div>

                  <p className="text-xs text-white/70 mb-4 leading-relaxed font-sans">
                    Your startup cannot survive if you burn out completely. Adjust sliders to calculate your personal "Vaporization Week".
                  </p>

                  <div className="space-y-4 mb-4 bg-vivid-dark/30 p-4 border border-vivid-border">
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-white/60">WEEKS OF FUNDING RUNWAY:</span>
                      <span className="text-white font-bold">{fundingRunway} weeks left</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="24"
                      value={fundingRunway}
                      onChange={(e) => setFundingRunway(parseInt(e.target.value))}
                      className="w-full accent-[#ff453a] bg-vivid-dark"
                    />

                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-white/60">FOUNDER DAILY SLEEP (HOURS):</span>
                      <span className="text-white font-bold">{dailySleep} hrs</span>
                    </div>
                    <input
                      type="range"
                      min="3"
                      max="9"
                      value={dailySleep}
                      onChange={(e) => setDailySleep(parseInt(e.target.value))}
                      className="w-full accent-[#ff453a] bg-vivid-dark"
                    />

                    <div className="grid grid-cols-2 gap-2 text-center pt-2">
                      <div className="bg-vivid-dark p-2 border border-vivid-border">
                        <span className="text-[8px] text-white/40 block font-mono">BURNOUT RISK COEFFICIENT</span>
                        <span className={`text-base font-black font-mono ${
                          dailySleep < 5 ? 'text-[#ff453a] animate-pulse' : 'text-yellow-400'
                        }`}>
                          {((12 - dailySleep) * 12).toFixed(0)}% Risk
                        </span>
                      </div>
                      <div className="bg-vivid-dark p-2 border border-vivid-border">
                        <span className="text-[8px] text-white/40 block font-mono">SURVIVAL COEFFICIENT</span>
                        <span className={`text-xs font-black font-mono uppercase ${
                          fundingRunway < 4 ? 'text-[#ff453a] animate-pulse' : 'text-[#34C759]'
                        }`}>
                          {fundingRunway < 4 ? '🚨 EXTREME LEAK' : '🟢 VIABLE'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {fundingRunway < 4 && (
                  <div className="bg-[#ff453a]/15 border border-[#ff453a]/30 p-2 text-[10px] leading-relaxed text-[#ff453a] font-mono font-bold uppercase text-center animate-pulse">
                    🚨 WARNING: RUNWAY CRITICAL. IMMEDIATE LAUNCH OF DESCOPED MVP MANDATORY!
                  </div>
                )}
              </div>

              {/* ENTREPRENEUR COLUMN 2: MVP DESCOPING ENGINE */}
              <div className="bg-vivid-panel border border-[#ff453a]/40 p-5 relative overflow-hidden flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Rocket className="w-5 h-5 text-[#ff453a]" />
                    <span className="text-[10px] font-mono font-bold text-[#ff453a] uppercase tracking-wider">
                      VIVID VENTURES MVP FEATURE DESCOPER
                    </span>
                  </div>

                  <p className="text-xs text-white/70 mb-3 leading-relaxed font-sans">
                    Procrastinating by building over-engineered features kills startups. Choose features you wanted to build:
                  </p>

                  <div className="space-y-1.5 mb-4 bg-vivid-dark/40 border border-vivid-border p-3">
                    {[
                      'Native iOS & Android apps',
                      'Complex microservices backend',
                      'Enterprise SSO integration',
                      'AI continuous multi-lingual translation'
                    ].map((feature) => (
                      <label key={feature} className="flex items-center gap-2 text-xs font-mono text-white/80 cursor-pointer hover:text-white select-none">
                        <input
                          type="checkbox"
                          checked={checkedDescopeFeatures.includes(feature)}
                          onChange={() => {
                            if (checkedDescopeFeatures.includes(feature)) {
                              setCheckedDescopeFeatures(checkedDescopeFeatures.filter(f => f !== feature));
                            } else {
                              setCheckedDescopeFeatures([...checkedDescopeFeatures, feature]);
                            }
                          }}
                          className="rounded-none border-vivid-border text-[#ff453a] focus:ring-0 bg-vivid-dark"
                        />
                        <span className={!checkedDescopeFeatures.includes(feature) ? 'line-through text-white/40' : ''}>
                          {feature}
                        </span>
                      </label>
                    ))}
                  </div>

                  <button
                    onClick={() => {
                      if (checkedDescopeFeatures.length === 0) {
                        setDescopeResult("Excellent! You've already descoped everything. Build a beautiful static page with an email form and ship right now!");
                        return;
                      }
                      setDescopeResult(`🚨 DESCULATION PROTOCOL ACTIVATED: Replace [${checkedDescopeFeatures.join(', ')}] with a simple responsive Vite page, standard Tailwind styling, and a single Typeform or manual Stripe button. Time saved: 3+ months! Launch velocity increased 1000%!`);
                    }}
                    className="w-full bg-white hover:bg-[#ff453a] text-black hover:text-white font-black uppercase text-[10px] py-2.5 transition tracking-widest border border-transparent font-mono flex items-center justify-center gap-1"
                  >
                    <Flame className="w-3.5 h-3.5" /> RUN AI DESCOPING SALVAGE!
                  </button>
                </div>

                {descopeResult && (
                  <div className="mt-4 bg-[#ff453a]/10 border border-[#ff453a]/30 p-3 text-[11px] leading-relaxed text-white font-mono font-semibold">
                    <span className="font-bold text-[#ff453a] block uppercase tracking-wider mb-0.5">💡 CRITICAL MVP RECIPE:</span>
                    {descopeResult}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}

      {/* Interactive Crisis Stress Telemetry */}
      <CrisisCalculator />

      {/* AI Advice Banner */}
      <div className="bg-vivid-panel border-2 border-vivid-border p-6 relative overflow-hidden glow-vivid">
        <div className="absolute top-0 right-0 w-48 h-48 bg-[#FF3B30]/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="flex flex-col md:flex-row gap-6 md:items-end justify-between">
          <div className="space-y-3 flex-1">
            <div className="flex items-center gap-3">
              <span className="bg-[#FF3B30] text-black text-[11px] font-black px-3 py-1 uppercase tracking-widest">
                AI Strategy Desk
              </span>
              <span className="text-xs font-mono opacity-50 uppercase tracking-wider">
                Live Analysis
              </span>
            </div>
            
            <h3 className="text-2xl font-black italic tracking-tighter leading-none uppercase">
              COMMANDER'S ADVICE <span className="text-[#FF3B30]">DESK</span>
            </h3>
            
            <p className="text-base text-white/80 leading-relaxed font-sans border-l-2 border-[#FF3B30] pl-4 italic">
              "{adviceText || 'Add some upcoming deadlines and ask AI to prioritize them. Keep striving, the salvage is always possible!'}"
            </p>
          </div>
          
          <button
            onClick={triggerPrioritization}
            disabled={isPrioritizing || tasks.length === 0}
            className="shrink-0 bg-white hover:bg-[#FF3B30] text-black hover:text-white font-black uppercase tracking-wider text-xs px-6 py-3.5 transition duration-200 flex items-center gap-2 self-start md:self-end border-2 border-transparent"
          >
            {isPrioritizing ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            Auto-Prioritize Queue
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Form Column & Habits */}
        <div className="lg:col-span-5 space-y-8">
          {/* Quick-Add Deadline Card */}
          <div className="bg-vivid-panel border border-vivid-border p-6">
            <h3 className="text-xl font-black italic uppercase tracking-tighter mb-5 border-b border-white/10 pb-3 flex items-center gap-2">
              <Zap className="w-5 h-5 text-[#FF3B30]" /> Log Urgent Deadline
            </h3>
            
            <form onSubmit={handleAddTaskSubmit} className="space-y-5">
              <div>
                <label className="block text-[10px] tracking-[0.2em] text-white/60 font-black mb-1.5 uppercase">
                  Task Title
                </label>
                <input
                  type="text"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  placeholder="e.g. Write CS301 Consensus Engines"
                  className="w-full bg-vivid-dark border border-vivid-border rounded-none px-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#FF3B30] transition font-semibold"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] tracking-[0.2em] text-white/60 font-black mb-1.5 uppercase">
                  Description / Details
                </label>
                <textarea
                  value={taskDesc}
                  onChange={(e) => setTaskDesc(e.target.value)}
                  placeholder="Add slides list, critical notes, key milestones..."
                  className="w-full bg-vivid-dark border border-vivid-border rounded-none px-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#FF3B30] transition h-20 resize-none font-sans"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] tracking-[0.2em] text-white/60 font-black mb-1.5 uppercase">
                    Category
                  </label>
                  <select
                    value={taskCategory}
                    onChange={(e) => setTaskCategory(e.target.value as TaskCategory)}
                    className="w-full bg-vivid-dark border border-vivid-border rounded-none px-4 py-3 text-sm text-white/90 focus:outline-none focus:border-[#FF3B30] transition uppercase font-mono text-xs"
                  >
                    <option value="assignment">Assignment</option>
                    <option value="meeting">Meeting</option>
                    <option value="bill">Bill Payment</option>
                    <option value="commitment">Commitment</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] tracking-[0.2em] text-white/60 font-black mb-1.5 uppercase">
                    Est. Work Hours
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={taskHours}
                    onChange={(e) => setTaskHours(e.target.value)}
                    className="w-full bg-vivid-dark border border-vivid-border rounded-none px-4 py-3 text-sm text-white focus:outline-none focus:border-[#FF3B30] transition font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] tracking-[0.2em] text-white/60 font-black mb-1.5 uppercase">
                  Absolute Deadline
                </label>

                {/* Calendar Date Picker and Manual Time Picker side-by-side */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[9px] tracking-[0.1em] text-white/40 font-black mb-1.5 uppercase font-mono">
                      Choose Date (DD/MM/YYYY)
                    </label>
                    <div className="relative flex items-center bg-vivid-dark border border-vivid-border focus-within:border-[#FF3B30] transition">
                      <input
                        type="text"
                        value={taskDateInput}
                        onChange={(e) => handleDateTextInput(e.target.value)}
                        placeholder="DD/MM/YYYY"
                        className="w-full bg-transparent px-4 py-3 text-sm text-white focus:outline-none font-mono font-bold"
                        required
                      />
                      <button
                        type="button"
                        onClick={triggerDatePicker}
                        className="px-3.5 py-3 text-white/60 hover:text-white transition border-l border-vivid-border/50 cursor-pointer flex items-center justify-center shrink-0"
                        title="Open Calendar Picker"
                      >
                        <Calendar className="w-4 h-4 text-[#FF3B30]" />
                      </button>
                      {/* Hidden native input for date selection */}
                      <input
                        ref={datePickerRef}
                        type="date"
                        value={taskDate}
                        onChange={(e) => {
                          if (e.target.value) {
                            setTaskDate(e.target.value);
                          }
                        }}
                        className="absolute inset-0 w-0 h-0 opacity-0 pointer-events-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[9px] tracking-[0.1em] text-white/40 font-black mb-1.5 uppercase font-mono">
                      Enter Time (24h)
                    </label>
                    <input
                      type="time"
                      value={taskTime}
                      onChange={(e) => setTaskTime(e.target.value)}
                      className="w-full bg-vivid-dark border border-vivid-border rounded-none px-4 py-3 text-sm text-white focus:outline-none focus:border-[#FF3B30] transition font-mono font-bold"
                      required
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-white hover:bg-[#FF3B30] text-black hover:text-white font-black uppercase text-xs py-4.5 transition duration-200 tracking-widest flex items-center justify-center gap-2 border-2 border-transparent"
              >
                <Plus className="w-4 h-4 stroke-[3px]" /> Save Absolute Deadline
              </button>
            </form>
          </div>

          {/* Goals & Habits Streak Tracker */}
          <div className="bg-vivid-panel border border-vivid-border p-6">
            <h3 className="text-xl font-black italic uppercase tracking-tighter mb-5 border-b border-white/10 pb-3 flex items-center gap-2">
              <Star className="w-5 h-5 text-[#FF3B30]" /> Daily Resiliency Habits
            </h3>

            <form onSubmit={handleAddHabitSubmit} className="flex gap-2 mb-5">
              <input
                type="text"
                value={habitName}
                onChange={(e) => setHabitName(e.target.value)}
                placeholder="e.g. Commit code to main daily"
                className="flex-1 bg-vivid-dark border border-vivid-border rounded-none px-3.5 py-2.5 text-xs text-white placeholder-white/30 focus:outline-none focus:border-[#FF3B30] transition font-semibold"
              />
              <button
                type="submit"
                className="bg-white hover:bg-[#FF3B30] text-black hover:text-white font-black uppercase text-xs px-4 py-2.5 transition"
              >
                Add
              </button>
            </form>

            <div className="space-y-3 max-h-[260px] overflow-y-auto pr-1">
              {habits.map((habit) => {
                const todayStr = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
                const isCompletedToday = habit.completedDates.includes(todayStr);

                return (
                  <div
                    key={habit.id}
                    className="flex items-center justify-between p-3.5 bg-vivid-dark border border-vivid-border"
                  >
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => onToggleHabit(habit.id)}
                        className={`p-1.5 border transition ${
                          isCompletedToday 
                            ? 'bg-[#34C759] border-[#34C759] text-black' 
                            : 'border-white/20 hover:border-white text-white/40'
                        }`}
                      >
                        <CheckSquare className="w-4 h-4" />
                      </button>
                      <div>
                        <p className={`text-xs font-black uppercase ${isCompletedToday ? 'line-through text-white/40' : 'text-white'}`}>
                          {habit.name}
                        </p>
                        <span className="text-[10px] text-white/50 font-mono uppercase tracking-wider">
                          Streak: <span className="text-white font-bold">{habit.streak} days</span>
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => onDeleteHabit(habit.id)}
                      className="text-white/40 hover:text-[#FF3B30] p-1.5 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}

              {habits.length === 0 && (
                <p className="text-xs text-white/40 text-center py-6 font-mono uppercase">
                  Establish protective habits!
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Right Active Tasks Grid */}
        <div className="lg:col-span-7 space-y-8">
          {/* Action Suggestions Desk */}
          <div className="bg-vivid-panel border border-vivid-border p-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-5">
              <h3 className="text-xl font-black italic uppercase tracking-tighter flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-[#FF3B30]" /> Active Recommendations
              </h3>
              <button
                onClick={triggerRefreshRecommendations}
                disabled={isRefreshingRecs || tasks.length === 0}
                className="text-xs font-black uppercase tracking-wider text-white/50 hover:text-white flex items-center gap-2 transition"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRefreshingRecs ? 'animate-spin' : ''}`} /> Refresh Suggestions
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {recommendations.map((rec) => (
                <div
                  key={rec.id}
                  className="p-4 bg-vivid-dark border border-vivid-border space-y-2 hover:border-[#FF3B30] transition"
                >
                  <span className={`text-[9px] font-mono font-black uppercase tracking-widest px-2 py-0.5 border ${
                    rec.type === 'anti-procrastination'
                      ? 'text-[#FF3B30] border-[#FF3B30]/30'
                      : rec.type === 'scheduling'
                      ? 'text-amber-400 border-amber-400/30'
                      : rec.type === 'wellness'
                      ? 'text-[#34C759] border-[#34C759]/30'
                      : 'text-blue-400 border-blue-400/30'
                  }`}>
                    {rec.type.replace('-', ' ')}
                  </span>
                  <h4 className="text-xs font-black uppercase tracking-tight text-white">{rec.title}</h4>
                  <p className="text-[11px] text-white/70 leading-relaxed font-sans">{rec.content}</p>
                </div>
              ))}

              {recommendations.length === 0 && (
                <div className="md:col-span-3 text-center py-6 text-xs text-white/40 uppercase font-mono">
                  No direct productivity flags active. Keep tasks balanced!
                </div>
              )}
            </div>
          </div>

          {/* Deadlines Section */}
          <div className="bg-vivid-panel border border-vivid-border p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h3 className="text-xl font-black italic uppercase tracking-tighter">
                DEADLINES PRIORITY QUEUE
              </h3>
              <span className="text-[10px] bg-white text-black font-black uppercase tracking-widest px-3 py-1">
                {tasks.filter(t => t.status === 'pending').length} Active Items
              </span>
            </div>

            {/* Task Lifecycle Automation Toggles */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-3 bg-vivid-dark/60 border border-vivid-border/50 text-left">
              <label className="flex items-start gap-2.5 text-xs font-mono text-white/80 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={autoRemoveCompleted}
                  onChange={(e) => onToggleAutoRemoveCompleted?.(e.target.checked)}
                  className="rounded-none border-vivid-border text-[#FF3B30] focus:ring-0 bg-vivid-dark w-4 h-4 mt-0.5 shrink-0"
                />
                <div>
                  <span className="font-black block text-white text-[10px] uppercase tracking-wider">AUTO-REMOVE ON COMPLETE</span>
                  <span className="text-[9px] text-white/45 block leading-tight mt-0.5">Tasks instantly vanish once marked finished</span>
                </div>
              </label>

              <label className="flex items-start gap-2.5 text-xs font-mono text-white/80 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={autoRemoveAfterDeadline}
                  onChange={(e) => onToggleAutoRemoveAfterDeadline?.(e.target.checked)}
                  className="rounded-none border-vivid-border text-[#FF3B30] focus:ring-0 bg-vivid-dark w-4 h-4 mt-0.5 shrink-0"
                />
                <div>
                  <span className="font-black block text-white text-[10px] uppercase tracking-wider">AUTO-REMOVE EXPIRED</span>
                  <span className="text-[9px] text-white/45 block leading-tight mt-0.5">Tasks auto-delete when absolute deadline passes</span>
                </div>
              </label>
            </div>

            {/* Task list */}
            <div className="space-y-4 max-h-[580px] overflow-y-auto pr-1">
              {sortedTasks.map((task) => {
                const isExpanded = expandedTaskId === task.id;
                const overdue = new Date(task.deadline).getTime() < Date.now();
                const urgent = isUrgent(task.deadline);

                return (
                  <div
                    key={task.id}
                    className={`border transition-all duration-300 relative ${
                      task.status === 'completed'
                        ? 'bg-vivid-dark border-vivid-border/40 opacity-60'
                        : overdue
                        ? 'bg-[#FF3B30]/10 border-[#FF3B30] glow-red'
                        : urgent
                        ? 'bg-amber-500/10 border-amber-400 glow-amber'
                        : 'bg-vivid-dark border border-vivid-border hover:border-white/50'
                    }`}
                  >
                    <div className="p-5 flex items-start gap-4">
                      {/* Priority Score Big Bold Badge */}
                      <div className="flex flex-col items-center justify-center p-2.5 w-14 bg-white/5 border border-white/10">
                        <span className="text-[8px] text-white/50 font-black uppercase tracking-widest">Score</span>
                        <span className={`text-xl font-black font-mono leading-none mt-1 ${
                          task.priorityScore >= 75 ? 'text-[#FF3B30]' : task.priorityScore >= 45 ? 'text-amber-400' : 'text-[#34C759]'
                        }`}>
                          {task.priorityScore}
                        </span>
                      </div>

                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 border ${
                            task.category === 'assignment'
                              ? 'text-blue-400 border-blue-400/30 bg-blue-950/20'
                              : task.category === 'meeting'
                              ? 'text-amber-400 border-amber-400/30 bg-amber-950/20'
                              : task.category === 'bill'
                              ? 'text-purple-400 border-purple-400/30 bg-purple-950/20'
                              : 'text-[#34C759] border-[#34C759]/30 bg-emerald-950/20'
                          }`}>
                            {task.category}
                          </span>

                          <span className={`text-[10px] font-mono font-black uppercase flex items-center gap-1 ${
                            overdue
                              ? 'text-[#FF3B30]'
                              : urgent
                              ? 'text-amber-400'
                              : 'text-white/60'
                          }`}>
                            <Clock className="w-3.5 h-3.5" />
                            {getTimeRemainingStr(task.deadline)}
                          </span>

                          <span className="text-[10px] text-white/40 font-mono font-bold uppercase whitespace-nowrap bg-white/5 px-2 py-0.5 border border-white/5">
                            Due: {new Date(task.deadline).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'short', timeStyle: 'short' })} IST
                          </span>
                        </div>

                        <div>
                          <h4 className={`text-base font-black uppercase tracking-tight ${
                            task.status === 'completed' ? 'line-through text-white/40' : 'text-white'
                          }`}>
                            {task.title}
                          </h4>
                          {task.description && (
                            <p className="text-xs text-white/70 font-sans mt-1 line-clamp-2 leading-relaxed">
                              {task.description}
                            </p>
                          )}
                        </div>

                        {/* Actions block */}
                        <div className="flex items-center gap-3 pt-2 flex-wrap">
                          <button
                            onClick={() => onUpdateTask(task.id, { status: task.status === 'completed' ? 'pending' : 'completed' })}
                            className={`text-[10px] font-black uppercase tracking-wider transition px-3 py-1.5 border ${
                              task.status === 'completed'
                                ? 'bg-white/10 text-white/60 border-transparent hover:text-white'
                                : 'bg-transparent text-[#34C759] border-[#34C759]/40 hover:bg-[#34C759] hover:text-black hover:border-transparent'
                            }`}
                          >
                            {task.status === 'completed' ? 'Completed' : 'Mark Done'}
                          </button>

                          <button
                            onClick={() => onTriggerEapPlan(task)}
                            disabled={task.status === 'completed'}
                            className="text-[10px] font-black uppercase tracking-wider bg-[#FF3B30] text-black hover:bg-white hover:text-black px-3 py-1.5 transition flex items-center gap-1 disabled:opacity-40"
                          >
                            <Zap className="w-3.5 h-3.5 stroke-[2.5px]" />
                            Rescue Plan
                          </button>

                          <button
                            onClick={() => setExpandedTaskId(isExpanded ? null : task.id)}
                            className="text-[10px] font-black uppercase tracking-wider text-white/50 hover:text-white flex items-center gap-1"
                          >
                            {isExpanded ? (
                              <>Hide Steps <ChevronUp className="w-3.5 h-3.5" /></>
                            ) : (
                              <>Steps ({task.subtasks.length}) <ChevronDown className="w-3.5 h-3.5" /></>
                            )}
                          </button>

                          <button
                            onClick={() => onDeleteTask(task.id)}
                            className="text-white/40 hover:text-[#FF3B30] transition ml-auto p-1"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Expandable subtasks breakdown workspace */}
                    {isExpanded && (
                      <div className="px-5 pb-5 border-t border-white/10 pt-5 bg-white/[0.02] space-y-4">
                        <div className="flex justify-between items-center">
                          <h5 className="text-[10px] font-black uppercase tracking-widest text-white/50">Subtask Breakdown</h5>
                          <button
                            onClick={() => triggerTaskBreakdown(task)}
                            disabled={isBreakingDown === task.id || task.status === 'completed'}
                            className="text-[10px] bg-white hover:bg-[#FF3B30] text-black hover:text-white font-black uppercase px-3 py-1.5 transition flex items-center gap-1 disabled:opacity-40"
                          >
                            {isBreakingDown === task.id ? (
                              <>
                                <RefreshCw className="w-3 h-3 animate-spin" />
                                Working...
                              </>
                            ) : (
                              <>
                                <Sparkles className="w-3 h-3" />
                                AI Auto-Breakdown
                              </>
                            )}
                          </button>
                        </div>

                        {/* Subtasks checklist */}
                        <div className="space-y-2">
                          {task.subtasks.map((st) => (
                            <div
                              key={st.id}
                              className="flex items-center gap-3 p-3 bg-vivid-dark border border-vivid-border"
                            >
                              <input
                                type="checkbox"
                                checked={st.completed}
                                onChange={(e) => handleToggleSubtask(task.id, st.id, e.target.checked)}
                                className="w-4.5 h-4.5 rounded-none border-white/20 bg-vivid-dark text-[#FF3B30] focus:ring-0"
                              />
                              <span className={`text-xs font-bold uppercase flex-1 ${st.completed ? 'line-through text-white/40' : 'text-white'}`}>
                                {st.title}
                              </span>
                              {st.estimatedMinutes && (
                                <span className="text-[10px] text-white/50 font-mono">{st.estimatedMinutes}M</span>
                              )}
                            </div>
                          ))}

                          {task.subtasks.length === 0 && (
                            <p className="text-xs text-white/40 italic text-center py-4 font-mono uppercase">
                              No micro steps loaded yet. Let Gemini break it down!
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}

              {tasks.length === 0 && (
                <div className="text-center py-16 flex flex-col items-center justify-center space-y-4">
                  <div className="p-5 bg-vivid-dark border border-vivid-border">
                    <CheckSquare className="w-8 h-8 text-white/40" />
                  </div>
                  <div className="max-w-md space-y-1">
                    <h3 className="text-lg font-black uppercase tracking-tight text-white">No Impending Deadlines</h3>
                    <p className="text-xs text-white/50 leading-relaxed uppercase font-mono">
                      Awesome! You currently have zero scheduled deadlines. Rest or register high-stakes commitments.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
