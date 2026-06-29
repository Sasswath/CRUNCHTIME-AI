import React, { useState, useEffect } from 'react';
import {
  Clock, Calendar as CalendarIcon, Zap, Sparkles, Brain, Star, HelpCircle, AlertCircle,
  Menu, X, Volume2, Mic, CheckCircle
} from 'lucide-react';
import Dashboard from './components/Dashboard';
import EapGenerator from './components/EapGenerator';
import FocusZone from './components/FocusZone';
import CalendarView from './components/CalendarView';
import VoiceAssistant from './components/VoiceAssistant';
import AuthPage from './components/AuthPage';
import OnboardingPage from './components/OnboardingPage';
import AntiPanicCoach from './components/AntiPanicCoach';
import { Task, Habit, Recommendation, EmergencyPlan, ChatMessage, User } from './types';

// Pre-seeded tasks for gorgeous immediate experience
const getInitialTasks = (): Task[] => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(9, 0, 0, 0);

  const inThreeDays = new Date();
  inThreeDays.setDate(inThreeDays.getDate() + 3);
  inThreeDays.setHours(17, 0, 0, 0);

  const inFiveDays = new Date();
  inFiveDays.setDate(inFiveDays.getDate() + 5);
  inFiveDays.setHours(14, 0, 0, 0);

  return [
    {
      id: 'task_seeded_1',
      title: 'CS301 Distributed Systems Project Submission',
      description: 'Must compile code, run benchmarks, and submit PDF project report explaining consensus algorithms.',
      deadline: tomorrow.toISOString(),
      priority: 'high',
      category: 'assignment',
      status: 'pending',
      estimatedHours: 6,
      subtasks: [
        { id: 'sub_seeded_1_1', title: 'Verify raft implementation testing suites', completed: true, estimatedMinutes: 45 },
        { id: 'sub_seeded_1_2', title: 'Collect benchmark latency diagrams', completed: false, estimatedMinutes: 30 },
      ],
      priorityScore: 94,
      createdAt: new Date().toISOString()
    },
    {
      id: 'task_seeded_2',
      title: 'SaaS Cloud Server Bill Renewal',
      description: 'Renew core development VPS subscriptions to avoid system service interruption.',
      deadline: inThreeDays.toISOString(),
      priority: 'medium',
      category: 'bill',
      status: 'pending',
      estimatedHours: 1,
      subtasks: [],
      priorityScore: 68,
      createdAt: new Date().toISOString()
    },
    {
      id: 'task_seeded_3',
      title: 'Series-A Investor Pitch Deck Dry-run',
      description: 'Present financial projections and roadmap variables to advisory stakeholders.',
      deadline: inFiveDays.toISOString(),
      priority: 'medium',
      category: 'meeting',
      status: 'pending',
      estimatedHours: 3,
      subtasks: [],
      priorityScore: 45,
      createdAt: new Date().toISOString()
    }
  ];
};

const initialHabits: Habit[] = [
  {
    id: 'habit_seeded_1',
    name: 'Solve 2 daily Leetcode logic puzzles',
    streak: 4,
    completedDates: [],
    frequency: 'daily',
    createdAt: new Date().toISOString()
  },
  {
    id: 'habit_seeded_2',
    name: 'Commit compiled working code to main',
    streak: 11,
    completedDates: [],
    frequency: 'daily',
    createdAt: new Date().toISOString()
  }
];

const initialRecommendations: Recommendation[] = [
  {
    id: 'rec_seeded_1',
    title: 'Emergency Salvage Recommended',
    content: 'CS301 Distributed Systems Project is due in under 24 hours. Activate your Rescue Plan to begin an hour-by-hour salvage schedule.',
    type: 'anti-procrastination'
  },
  {
    id: 'rec_seeded_2',
    title: 'Procrastination Anchor',
    content: 'Launch Brownian ambient sound masking in the Focus Zone to increase memory encoding and complete SaaS billing tasks.',
    type: 'focus'
  },
  {
    id: 'rec_seeded_3',
    title: 'Establish Streak Momentum',
    content: 'Mark your coding habit done early today to gain cognitive traction for high-stakes deliverables.',
    type: 'wellness'
  }
];

const getRoleBasedTasks = (role: 'student' | 'professional' | 'entrepreneur', institution?: string, mainGoal?: string): Task[] => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(17, 0, 0, 0);

  const inThreeDays = new Date();
  inThreeDays.setDate(inThreeDays.getDate() + 3);
  inThreeDays.setHours(12, 0, 0, 0);

  const inFiveDays = new Date();
  inFiveDays.setDate(inFiveDays.getDate() + 5);
  inFiveDays.setHours(15, 0, 0, 0);

  const goal = mainGoal || 'Critical deliverables';
  const place = institution || 'Operational workspace';

  if (role === 'student') {
    return [
      {
        id: 'task_seeded_1',
        title: goal,
        description: `Highly urgent assignment for ${place}. Code must compile cleanly, with full benchmarks and explain Consensus Engine logs.`,
        deadline: tomorrow.toISOString(),
        priority: 'high',
        category: 'assignment',
        status: 'pending',
        estimatedHours: 6,
        subtasks: [
          { id: 'sub_seeded_1_1', title: 'Verify test suites against specifications', completed: true, estimatedMinutes: 45 },
          { id: 'sub_seeded_1_2', title: 'Compile benchmark latency diagrams', completed: false, estimatedMinutes: 30 },
        ],
        priorityScore: 95,
        createdAt: new Date().toISOString()
      },
      {
        id: 'task_seeded_2',
        title: 'Review Study Guide and Prep Lectures',
        description: `Revise fundamental theorems and code components for the upcoming final examination.`,
        deadline: inThreeDays.toISOString(),
        priority: 'medium',
        category: 'commitment',
        status: 'pending',
        estimatedHours: 3,
        subtasks: [],
        priorityScore: 72,
        createdAt: new Date().toISOString()
      },
      {
        id: 'task_seeded_3',
        title: 'Academic Term Fees Statement Payment',
        description: `Clear outstanding accounts before semester enrollment gets temporarily locked.`,
        deadline: inFiveDays.toISOString(),
        priority: 'medium',
        category: 'bill',
        status: 'pending',
        estimatedHours: 1,
        subtasks: [],
        priorityScore: 40,
        createdAt: new Date().toISOString()
      }
    ];
  } else if (role === 'professional') {
    return [
      {
        id: 'task_seeded_1',
        title: goal,
        description: `Severe high-friction task at ${place}. Fix any regression logs, sync with core stakeholders, and dry-run code changes.`,
        deadline: tomorrow.toISOString(),
        priority: 'high',
        category: 'commitment',
        status: 'pending',
        estimatedHours: 4,
        subtasks: [
          { id: 'sub_seeded_1_1', title: 'Analyze stack trace and identify performance bottleneck', completed: true, estimatedMinutes: 60 },
          { id: 'sub_seeded_1_2', title: 'Deploy critical patch to staging environment', completed: false, estimatedMinutes: 45 },
        ],
        priorityScore: 92,
        createdAt: new Date().toISOString()
      },
      {
        id: 'task_seeded_2',
        title: 'Quarterly Operations Business Review Presentation',
        description: `Synthesize performance metrics, product delivery metrics, and roadmaps into clear, bite-sized slides.`,
        deadline: inThreeDays.toISOString(),
        priority: 'medium',
        category: 'meeting',
        status: 'pending',
        estimatedHours: 5,
        subtasks: [],
        priorityScore: 68,
        createdAt: new Date().toISOString()
      },
      {
        id: 'task_seeded_3',
        title: 'Review Client Service-Level Agreements',
        description: `Audit server uptime commitments and outline operational risks.`,
        deadline: inFiveDays.toISOString(),
        priority: 'medium',
        category: 'commitment',
        status: 'pending',
        estimatedHours: 2,
        subtasks: [],
        priorityScore: 35,
        createdAt: new Date().toISOString()
      }
    ];
  } else { // entrepreneur
    return [
      {
        id: 'task_seeded_1',
        title: goal,
        description: `Make or break pitch/release milestone for ${place}. Ensure presentation, code demo, and business plan are perfectly aligned.`,
        deadline: tomorrow.toISOString(),
        priority: 'high',
        category: 'meeting',
        status: 'pending',
        estimatedHours: 5,
        subtasks: [
          { id: 'sub_seeded_1_1', title: 'Refine financial projections on slide deck', completed: true, estimatedMinutes: 60 },
          { id: 'sub_seeded_1_2', title: 'Conduct dry-run presentation with advisory stakeholders', completed: false, estimatedMinutes: 45 },
        ],
        priorityScore: 98,
        createdAt: new Date().toISOString()
      },
      {
        id: 'task_seeded_2',
        title: 'MVP Landing Page & Signup Intake Form Release',
        description: `Set up the primary acquisition pipeline, verify DNS settings, and test responsive layouts.`,
        deadline: inThreeDays.toISOString(),
        priority: 'medium',
        category: 'assignment',
        status: 'pending',
        estimatedHours: 4,
        subtasks: [],
        priorityScore: 78,
        createdAt: new Date().toISOString()
      },
      {
        id: 'task_seeded_3',
        title: 'SaaS Server Billing VPS Renewal',
        description: `Verify billing credentials to avoid service interruption during high-traffic launch.`,
        deadline: inFiveDays.toISOString(),
        priority: 'medium',
        category: 'bill',
        status: 'pending',
        estimatedHours: 1,
        subtasks: [],
        priorityScore: 50,
        createdAt: new Date().toISOString()
      }
    ];
  }
};

const getRoleBasedHabits = (role: 'student' | 'professional' | 'entrepreneur'): Habit[] => {
  if (role === 'student') {
    return [
      { id: 'habit_seeded_1', name: 'Solve 2 Leetcode logic puzzles', streak: 4, completedDates: [], frequency: 'daily', createdAt: new Date().toISOString() },
      { id: 'habit_seeded_2', name: 'Review revision flashcards', streak: 11, completedDates: [], frequency: 'daily', createdAt: new Date().toISOString() }
    ];
  } else if (role === 'professional') {
    return [
      { id: 'habit_seeded_1', name: 'Clear email/slack backlog to zero', streak: 6, completedDates: [], frequency: 'daily', createdAt: new Date().toISOString() },
      { id: 'habit_seeded_2', name: 'Log accomplishments for performance reviews', streak: 3, completedDates: [], frequency: 'daily', createdAt: new Date().toISOString() }
    ];
  } else {
    return [
      { id: 'habit_seeded_1', name: 'Push compiled production commits to main', streak: 15, completedDates: [], frequency: 'daily', createdAt: new Date().toISOString() },
      { id: 'habit_seeded_2', name: 'Conduct 1 direct customer discovery session', streak: 8, completedDates: [], frequency: 'daily', createdAt: new Date().toISOString() }
    ];
  }
};

const getRoleBasedRecommendations = (role: 'student' | 'professional' | 'entrepreneur', mainGoal?: string): Recommendation[] => {
  const goal = mainGoal || 'your highest-pressure targets';
  if (role === 'student') {
    return [
      {
        id: 'rec_seeded_1',
        title: 'Academic Rescue Priority',
        content: `"${goal}" is approaching fast. Generate a custom Emergency Action Plan (EAP) right now to secure a passing grade.`,
        type: 'anti-procrastination'
      },
      {
        id: 'rec_seeded_2',
        title: 'Cognitive Reset Interval',
        content: 'Use standard Pomodoro cycles (25 mins focus, 5 mins walk) to digest dense textbook models without cognitive overload.',
        type: 'focus'
      },
      {
        id: 'rec_seeded_3',
        title: 'Peer Study Synergy',
        content: 'Avoid checking social alerts. Engage the Brownian static generator in the Focus Room to enter deep flow instantly.',
        type: 'wellness'
      }
    ];
  } else if (role === 'professional') {
    return [
      {
        id: 'rec_seeded_1',
        title: 'Corporate Pipeline Rescue',
        content: `Your deliverable "${goal}" is key to preventing system blocks. Run our AI Prioritizer to structure your day.`,
        type: 'anti-procrastination'
      },
      {
        id: 'rec_seeded_2',
        title: 'Meeting Interceptor',
        content: 'Block consecutive 90-minute "no-interruption focus zones" in your calendar to prevent context-switching fatigue.',
        type: 'scheduling'
      },
      {
        id: 'rec_seeded_3',
        title: 'Cognitive Offload Ritual',
        content: 'De-clutter inbox noise before initiating technical deep-dives to reduce background anxiety.',
        type: 'focus'
      }
    ];
  } else {
    return [
      {
        id: 'rec_seeded_1',
        title: 'Startup Launch Rescue',
        content: `Success of "${goal}" depends on immediate focused execution. Build an hourly salvage roadmap now.`,
        type: 'anti-procrastination'
      },
      {
        id: 'rec_seeded_2',
        title: 'MVP Fast-Track Rule',
        content: 'De-scope beautiful formatting for now. Prioritize structural validation and basic functional flow. Done is better than perfect.',
        type: 'focus'
      },
      {
        id: 'rec_seeded_3',
        title: 'Direct Feedback Synergy',
        content: 'Mark your core daily coding commitments completed early to unlock mindspace for critical user calls.',
        type: 'wellness'
      }
    ];
  }
};

const getAlignedSeededDeadline = (id: string, role?: 'student' | 'professional' | 'entrepreneur'): string => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  const inThreeDays = new Date();
  inThreeDays.setDate(inThreeDays.getDate() + 3);

  const inFiveDays = new Date();
  inFiveDays.setDate(inFiveDays.getDate() + 5);

  if (role) {
    if (role === 'student') {
      if (id === 'task_seeded_1') { tomorrow.setHours(17, 0, 0, 0); return tomorrow.toISOString(); }
      if (id === 'task_seeded_2') { inThreeDays.setHours(12, 0, 0, 0); return inThreeDays.toISOString(); }
      if (id === 'task_seeded_3') { inFiveDays.setHours(15, 0, 0, 0); return inFiveDays.toISOString(); }
    } else if (role === 'professional') {
      if (id === 'task_seeded_1') { tomorrow.setHours(17, 0, 0, 0); return tomorrow.toISOString(); }
      if (id === 'task_seeded_2') { inThreeDays.setHours(12, 0, 0, 0); return inThreeDays.toISOString(); }
      if (id === 'task_seeded_3') { inFiveDays.setHours(15, 0, 0, 0); return inFiveDays.toISOString(); }
    } else if (role === 'entrepreneur') {
      if (id === 'task_seeded_1') { tomorrow.setHours(17, 0, 0, 0); return tomorrow.toISOString(); }
      if (id === 'task_seeded_2') { inThreeDays.setHours(12, 0, 0, 0); return inThreeDays.toISOString(); }
      if (id === 'task_seeded_3') { inFiveDays.setHours(15, 0, 0, 0); return inFiveDays.toISOString(); }
    }
  }

  // Default initial tasks
  if (id === 'task_seeded_1') { tomorrow.setHours(9, 0, 0, 0); return tomorrow.toISOString(); }
  if (id === 'task_seeded_2') { inThreeDays.setHours(17, 0, 0, 0); return inThreeDays.toISOString(); }
  if (id === 'task_seeded_3') { inFiveDays.setHours(14, 0, 0, 0); return inFiveDays.toISOString(); }

  return new Date().toISOString();
};

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'calendar' | 'focus' | 'eap'>('dashboard');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [activeEapPlan, setActiveEapPlan] = useState<EmergencyPlan | null>(null);
  const [adviceText, setAdviceText] = useState<string>('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [istTime, setIstTime] = useState<string>('');
  const [isAntiPanicOpen, setIsAntiPanicOpen] = useState<boolean>(false);

  // Live IST Cockpit Clock Effect
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const formatter = new Intl.DateTimeFormat('en-IN', {
        timeZone: 'Asia/Kolkata',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      });
      setIstTime(formatter.format(now));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Task Lifecycle Toggles
  const [autoRemoveCompleted, setAutoRemoveCompleted] = useState<boolean>(() => {
    return localStorage.getItem('last_minute_auto_remove_completed') === 'true';
  });
  const [autoRemoveAfterDeadline, setAutoRemoveAfterDeadline] = useState<boolean>(() => {
    return localStorage.getItem('last_minute_auto_remove_deadline') === 'true';
  });

  // Save task lifecycle settings to localStorage
  useEffect(() => {
    localStorage.setItem('last_minute_auto_remove_completed', String(autoRemoveCompleted));
  }, [autoRemoveCompleted]);

  useEffect(() => {
    localStorage.setItem('last_minute_auto_remove_deadline', String(autoRemoveAfterDeadline));
  }, [autoRemoveAfterDeadline]);

  // Clean completed tasks reactively when auto-remove is toggled on
  useEffect(() => {
    if (autoRemoveCompleted) {
      setTasks(prev => {
        const active = prev.filter(t => t.status !== 'completed');
        if (active.length !== prev.length) {
          return active;
        }
        return prev;
      });
    }
  }, [autoRemoveCompleted]);

  // Clean past-deadline tasks periodically if enabled
  useEffect(() => {
    if (!autoRemoveAfterDeadline) return;

    const checkDeadlines = () => {
      const now = Date.now();
      setTasks(prev => {
        const remaining = prev.filter(t => {
          const isPast = new Date(t.deadline).getTime() < now;
          return !isPast;
        });
        if (remaining.length !== prev.length) {
          return remaining;
        }
        return prev;
      });
    };

    checkDeadlines();
    const interval = setInterval(checkDeadlines, 10000); // Check every 10 seconds
    return () => clearInterval(interval);
  }, [autoRemoveAfterDeadline]);

  // Load current user on boot
  useEffect(() => {
    const cachedUser = localStorage.getItem('last_minute_current_user');
    if (cachedUser) {
      try {
        setCurrentUser(JSON.parse(cachedUser));
      } catch (e) {
        console.error('Failed to parse cached user', e);
      }
    }
  }, []);

  // Load user-specific data from LocalStorage
  useEffect(() => {
    if (!currentUser) {
      setTasks([]);
      setHabits([]);
      setRecommendations([]);
      setActiveEapPlan(null);
      return;
    }

    const emailKey = currentUser.email;
    const cachedTasks = localStorage.getItem(`last_minute_tasks_${emailKey}`);
    const cachedHabits = localStorage.getItem(`last_minute_habits_${emailKey}`);
    const cachedRecs = localStorage.getItem(`last_minute_recs_${emailKey}`);
    const cachedEap = localStorage.getItem(`last_minute_eap_${emailKey}`);
    const cachedAdvice = localStorage.getItem(`last_minute_advice_${emailKey}`);

    let finalTasks: Task[] = [];
    if (cachedTasks) {
      const parsedTasks = JSON.parse(cachedTasks) as Task[];
      finalTasks = parsedTasks.map(t => {
        if (t.id.startsWith('task_seeded_')) {
          return {
            ...t,
            deadline: getAlignedSeededDeadline(t.id, currentUser?.role)
          };
        }
        return t;
      });
      setTasks(finalTasks);
    } else {
      finalTasks = getInitialTasks().map(t => ({
        ...t,
        deadline: getAlignedSeededDeadline(t.id, currentUser?.role)
      }));
      setTasks(finalTasks);
    }

    if (cachedHabits) setHabits(JSON.parse(cachedHabits));
    else setHabits(initialHabits);

    if (cachedRecs) setRecommendations(JSON.parse(cachedRecs));
    else setRecommendations(initialRecommendations);

    if (cachedEap) {
      const parsedEap = JSON.parse(cachedEap) as EmergencyPlan;
      const matchedTask = finalTasks.find(t => t.title === parsedEap.taskTitle);
      if (matchedTask) {
        parsedEap.deadline = matchedTask.deadline;
      }
      setActiveEapPlan(parsedEap);
    }
    else setActiveEapPlan(null);

    if (cachedAdvice) setAdviceText(cachedAdvice);
    else setAdviceText('Distributed Systems CS301 is extremely critical. Start planning your rescue before 5 PM today.');
  }, [currentUser]);

  // Save changes to localStorage
  useEffect(() => {
    if (!currentUser) return;
    if (tasks.length > 0) {
      localStorage.setItem(`last_minute_tasks_${currentUser.email}`, JSON.stringify(tasks));
    }
  }, [tasks, currentUser]);

  useEffect(() => {
    if (!currentUser) return;
    if (habits.length > 0) {
      localStorage.setItem(`last_minute_habits_${currentUser.email}`, JSON.stringify(habits));
    }
  }, [habits, currentUser]);

  useEffect(() => {
    if (!currentUser) return;
    if (recommendations.length > 0) {
      localStorage.setItem(`last_minute_recs_${currentUser.email}`, JSON.stringify(recommendations));
    }
  }, [recommendations, currentUser]);

  useEffect(() => {
    if (!currentUser) return;
    if (activeEapPlan) {
      localStorage.setItem(`last_minute_eap_${currentUser.email}`, JSON.stringify(activeEapPlan));
    } else {
      localStorage.removeItem(`last_minute_eap_${currentUser.email}`);
    }
  }, [activeEapPlan, currentUser]);

  useEffect(() => {
    if (!currentUser) return;
    if (adviceText) {
      localStorage.setItem(`last_minute_advice_${currentUser.email}`, adviceText);
    }
  }, [adviceText, currentUser]);

  const handleAuthSuccess = (user: User) => {
    localStorage.setItem('last_minute_current_user', JSON.stringify(user));
    setCurrentUser(user);
  };

  const handleLogout = () => {
    localStorage.removeItem('last_minute_current_user');
    setCurrentUser(null);
  };

  // Task Operations
  const handleAddTask = (newTaskData: Partial<Task>) => {
    const task: Task = {
      id: `task_${Date.now()}`,
      title: newTaskData.title || 'Untitled task',
      description: newTaskData.description || '',
      deadline: newTaskData.deadline || new Date().toISOString(),
      category: newTaskData.category || 'assignment',
      status: newTaskData.status || 'pending',
      estimatedHours: newTaskData.estimatedHours || 1,
      subtasks: newTaskData.subtasks || [],
      priorityScore: newTaskData.priorityScore || 50,
      priority: newTaskData.priority || 'medium',
      createdAt: new Date().toISOString()
    };

    setTasks(prev => [task, ...prev]);
    triggerLiveRecommendations([task, ...tasks], habits);
  };

  const handleUpdateTask = (id: string, updates: Partial<Task>) => {
    setTasks(prev => {
      const updated = prev.map(t => t.id === id ? { ...t, ...updates } : t);
      if (autoRemoveCompleted && updates.status === 'completed') {
        return updated.filter(t => t.id !== id);
      }
      return updated;
    });
  };

  const handleDeleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  // Habit Operations
  const handleAddHabit = (name: string) => {
    const habit: Habit = {
      id: `habit_${Date.now()}`,
      name,
      streak: 0,
      completedDates: [],
      frequency: 'daily',
      createdAt: new Date().toISOString()
    };
    setHabits(prev => [habit, ...prev]);
  };

  const handleToggleHabit = (id: string) => {
    const todayStr = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
    setHabits(prev => prev.map(h => {
      if (h.id !== id) return h;
      const isDone = h.completedDates.includes(todayStr);
      let newDates = [...h.completedDates];
      let newStreak = h.streak;

      if (isDone) {
        newDates = newDates.filter(d => d !== todayStr);
        newStreak = Math.max(0, newStreak - 1);
      } else {
        newDates.push(todayStr);
        newStreak += 1;
      }

      return { ...h, completedDates: newDates, streak: newStreak };
    }));
  };

  const handleDeleteHabit = (id: string) => {
    setHabits(prev => prev.filter(h => h.id !== id));
  };

  // Prioritize All Tasks using AI
  const handlePrioritizeAll = async () => {
    try {
      const response = await fetch('/api/ai/prioritize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tasks })
      });

      if (!response.ok) throw new Error('Prioritization service failed');

      const data = await response.json();
      const updatedScores = data.prioritizedTasks; // array of { id, priorityScore, priority }

      setTasks(prev => prev.map(task => {
        const scoreObj = updatedScores.find((u: any) => u.id === task.id);
        if (scoreObj) {
          return {
            ...task,
            priorityScore: scoreObj.priorityScore,
            priority: scoreObj.priority
          };
        }
        return task;
      }));

      if (data.advice) {
        setAdviceText(data.advice);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Refresh and generate smart custom recommendations
  const triggerLiveRecommendations = async (currentTasks: Task[], currentHabits: Habit[]) => {
    try {
      const response = await fetch('/api/ai/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tasks: currentTasks, habits: currentHabits })
      });

      if (!response.ok) throw new Error('Recommendations failed');

      const data = await response.json();
      if (data.recommendations) {
        setRecommendations(data.recommendations);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCompleteTaskByTitle = (title: string) => {
    const task = tasks.find(t => t.title.toLowerCase().includes(title.toLowerCase()));
    if (task) {
      handleUpdateTask(task.id, { status: 'completed' });
    }
  };

  const handleGeneratePlanByTitle = async (title: string) => {
    const task = tasks.find(t => t.title.toLowerCase().includes(title.toLowerCase()));
    if (task) {
      setActiveTab('eap');
      // Trigger API to generate EAP plan automatically
      try {
        const response = await fetch('/api/ai/emergency-plan', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: task.title,
            description: task.description,
            deadline: task.deadline,
            category: task.category,
            currentLocalTime: new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }) + ' IST'
          })
        });
        if (response.ok) {
          const plan = await response.json();
          setActiveEapPlan(plan);
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleOnboardingComplete = (updatedUser: User) => {
    // Save updated user to local storage and update currentUser state
    localStorage.setItem('last_minute_current_user', JSON.stringify(updatedUser));
    
    // Also store this user back in registered users so that if they logout and login, they remain onboarded!
    const usersData = localStorage.getItem('last_minute_registered_users');
    if (usersData) {
      try {
        const users = JSON.parse(usersData);
        if (users[updatedUser.email]) {
          users[updatedUser.email] = {
            ...users[updatedUser.email],
            role: updatedUser.role,
            institution: updatedUser.institution,
            mainGoal: updatedUser.mainGoal,
            workMode: updatedUser.workMode,
            dailyFocusHours: updatedUser.dailyFocusHours,
            onboarded: true,
          };
          localStorage.setItem('last_minute_registered_users', JSON.stringify(users));
        }
      } catch (err) {
        console.error('Failed to update registered users store', err);
      }
    }

    // Now, let's pre-populate custom, role-based tasks, habits, and recommendations!
    const emailKey = updatedUser.email;
    const role = updatedUser.role || 'student';
    const place = updatedUser.institution || '';
    const goal = updatedUser.mainGoal || '';

    const roleTasks = getRoleBasedTasks(role, place, goal);
    const roleHabits = getRoleBasedHabits(role);
    const roleRecs = getRoleBasedRecommendations(role, goal);
    
    let defaultAdvice = 'Keep pushing forward! Leverage the Focus Room to conquer high-friction points.';
    if (role === 'student') {
      defaultAdvice = `Academic Rescue active. Your highest pressure deliverable "${goal}" at ${place} is due soon. Generate an hourly action plan to guarantee results!`;
    } else if (role === 'professional') {
      defaultAdvice = `Corporate workstation calibrated. Deliverable "${goal}" for ${place} is extremely critical. Optimize focus limits to prevent fatigue.`;
    } else if (role === 'entrepreneur') {
      defaultAdvice = `Founder Flight Deck engaged. Let's salvage your milestone "${goal}" for ${place}. Every hour counts—streamline and iterate!`;
    }

    // Write to local storage
    localStorage.setItem(`last_minute_tasks_${emailKey}`, JSON.stringify(roleTasks));
    localStorage.setItem(`last_minute_habits_${emailKey}`, JSON.stringify(roleHabits));
    localStorage.setItem(`last_minute_recs_${emailKey}`, JSON.stringify(roleRecs));
    localStorage.setItem(`last_minute_advice_${emailKey}`, defaultAdvice);

    // Update React states directly so the screen refreshes seamlessly
    setTasks(roleTasks);
    setHabits(roleHabits);
    setRecommendations(roleRecs);
    setAdviceText(defaultAdvice);
    
    setCurrentUser(updatedUser);
  };

  if (!currentUser) {
    return <AuthPage onAuthSuccess={handleAuthSuccess} />;
  }

  if (!currentUser.onboarded) {
    return <OnboardingPage currentUser={currentUser} onComplete={handleOnboardingComplete} />;
  }

  return (
    <div className="min-h-screen bg-vivid-dark text-white flex flex-col font-sans selection:bg-[#ff453a] selection:text-white">
      {/* Navigation Header */}
      <nav className="border-b border-vivid-border bg-vivid-panel/90 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col py-4">
            {/* Top Row: App Name & System Status */}
            <div className="flex items-center justify-between w-full border-b border-white/5 pb-4">
              <div className="flex items-center gap-3">
                <div className="flex flex-col">
                  <span className="text-[10px] tracking-[0.3em] uppercase opacity-50 font-black mb-0.5">Emergency Salvage</span>
                  <h1 className="text-3xl font-black italic tracking-tighter leading-none text-white">
                    CRUNCHTIME <span className="text-[#FF3B30]">AI</span>
                  </h1>
                </div>
              </div>

              {/* Right Status Desk & Mobile Menu Toggle wrapper */}
              <div className="flex items-center gap-4">
                {/* Live IST Clock */}
                <div className="flex flex-col text-right bg-black/40 border border-[#FF3B30]/30 px-3 py-1">
                  <span className="text-[8px] tracking-wider uppercase text-[#FF3B30] font-black flex items-center gap-1 justify-end">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#FF3B30] animate-ping"></span> IST
                  </span>
                  <p className="text-[11px] font-mono font-black tracking-wider text-white whitespace-nowrap">
                    {istTime || 'LOADING...'}
                  </p>
                </div>

                {/* User Operator Badge */}
                <div className="hidden sm:flex flex-col text-right">
                  <span className="text-[9px] tracking-[0.3em] uppercase opacity-55 font-black">OPERATOR</span>
                  <p className="text-xs font-mono font-black uppercase tracking-tight text-white/90">
                    @{currentUser.username}
                  </p>
                </div>

                {/* SOS Panic Button */}
                <button
                  onClick={() => setIsAntiPanicOpen(true)}
                  className="px-3 py-1.5 bg-[#FF3B30] border border-[#FF3B30] text-black hover:bg-black hover:text-[#FF3B30] hover:border-[#FF3B30] text-[10px] font-mono font-black uppercase tracking-wider transition cursor-pointer shadow-[0_0_15px_rgba(255,59,48,0.4)] animate-pulse"
                >
                  🚨 SOS PANIC
                </button>

                <button
                  onClick={handleLogout}
                  className="px-3 py-1.5 bg-transparent border border-white/10 hover:border-[#FF3B30] hover:bg-[#FF3B30]/10 text-white/70 hover:text-[#FF3B30] text-[10px] font-mono font-black uppercase tracking-wider transition cursor-pointer"
                >
                  LOGOUT
                </button>

                {/* Right Status Desk */}
                <div className="hidden lg:flex flex-col text-right">
                  <span className="text-[9px] tracking-[0.3em] uppercase opacity-50 font-black">System Status</span>
                  <div className="flex items-center gap-2 mt-0.5 justify-end">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#34C759] animate-pulse"></div>
                    <p className="text-xs font-black uppercase tracking-tight">Optimal Flow</p>
                  </div>
                </div>

                {/* Mobile menu toggle */}
                <div className="md:hidden">
                  <button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="text-white hover:text-[#FF3B30] p-2"
                  >
                    {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Bottom Row: Navigation Tabs */}
            <div className="hidden md:flex items-center gap-2 pt-4">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`px-4 py-2.5 text-xs font-black uppercase tracking-widest border border-transparent transition ${
                  activeTab === 'dashboard'
                    ? 'bg-white text-black'
                    : 'text-white/60 hover:text-white hover:bg-white/5 border-white/10'
                }`}
              >
                Dashboard
              </button>
              <button
                onClick={() => setActiveTab('calendar')}
                className={`px-4 py-2.5 text-xs font-black uppercase tracking-widest border border-transparent transition ${
                  activeTab === 'calendar'
                    ? 'bg-white text-black'
                    : 'text-white/60 hover:text-white hover:bg-white/5 border-white/10'
                }`}
              >
                Calendar View
              </button>
              <button
                onClick={() => setActiveTab('focus')}
                className={`px-4 py-2.5 text-xs font-black uppercase tracking-widest border border-transparent transition ${
                  activeTab === 'focus'
                    ? 'bg-white text-black'
                    : 'text-white/60 hover:text-white hover:bg-white/5 border-white/10'
                }`}
              >
                Focus Room
              </button>
              <button
                onClick={() => setActiveTab('eap')}
                className={`px-4 py-2.5 text-xs font-black uppercase tracking-widest border border-transparent transition relative ${
                  activeTab === 'eap'
                    ? 'bg-white text-black'
                    : 'text-white/60 hover:text-white hover:bg-white/5 border-white/10'
                }`}
              >
                Emergency action
                {activeEapPlan && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#FF3B30] animate-pulse" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu panel */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-vivid-border bg-vivid-panel px-4 py-3 space-y-2">
            <button
              onClick={() => { setActiveTab('dashboard'); setIsMobileMenuOpen(false); }}
              className="w-full text-left px-3 py-2 text-xs font-black uppercase tracking-widest text-white/80 hover:bg-white/5 block"
            >
              Dashboard
            </button>
            <button
              onClick={() => { setActiveTab('calendar'); setIsMobileMenuOpen(false); }}
              className="w-full text-left px-3 py-2 text-xs font-black uppercase tracking-widest text-white/80 hover:bg-white/5 block"
            >
              Calendar View
            </button>
            <button
              onClick={() => { setActiveTab('focus'); setIsMobileMenuOpen(false); }}
              className="w-full text-left px-3 py-2 text-xs font-black uppercase tracking-widest text-white/80 hover:bg-white/5 block"
            >
              Focus Room
            </button>
            <button
              onClick={() => { setActiveTab('eap'); setIsMobileMenuOpen(false); }}
              className="w-full text-left px-3 py-2 text-xs font-black uppercase tracking-widest text-white/80 hover:bg-white/5 block"
            >
              Emergency action {activeEapPlan && '⚠️'}
            </button>
          </div>
        )}
      </nav>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {activeTab === 'dashboard' ? (
          /* Layout with Side NLP Controller for Dashboard */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Central Active Room */}
            <div className="lg:col-span-8 space-y-6">
              <Dashboard
                currentUser={currentUser}
                tasks={tasks}
                habits={habits}
                recommendations={recommendations}
                adviceText={adviceText}
                onAddTask={handleAddTask}
                onUpdateTask={handleUpdateTask}
                onDeleteTask={handleDeleteTask}
                onAddHabit={handleAddHabit}
                onToggleHabit={handleToggleHabit}
                onDeleteHabit={handleDeleteHabit}
                onPrioritizeAll={handlePrioritizeAll}
                onTriggerEapPlan={(task) => {
                  setActiveTab('eap');
                  handleGeneratePlanByTitle(task.title);
                }}
                refreshRecs={() => triggerLiveRecommendations(tasks, habits)}
                autoRemoveCompleted={autoRemoveCompleted}
                autoRemoveAfterDeadline={autoRemoveAfterDeadline}
                onToggleAutoRemoveCompleted={setAutoRemoveCompleted}
                onToggleAutoRemoveAfterDeadline={setAutoRemoveAfterDeadline}
              />
            </div>

            {/* Persistent Voice Assistant Sidebar */}
            <div className="lg:col-span-4 sticky top-24">
              <VoiceAssistant
                onAddTask={handleAddTask}
                onCompleteTaskByTitle={handleCompleteTaskByTitle}
                onGeneratePlanByTitle={handleGeneratePlanByTitle}
                tasks={tasks}
              />
            </div>
          </div>
        ) : (
          /* Full Width Layout for other rooms */
          <div className="w-full space-y-6">
            {activeTab === 'calendar' && (
              <CalendarView
                tasks={tasks}
                onAddTask={handleAddTask}
              />
            )}

            {activeTab === 'focus' && (
              <FocusZone
                activePlan={activeEapPlan}
                onOpenAntiPanic={() => setIsAntiPanicOpen(true)}
              />
            )}

            {activeTab === 'eap' && (
              <EapGenerator
                tasks={tasks}
                activeEapPlan={activeEapPlan}
                onSetEapPlan={(plan) => {
                  setActiveEapPlan(plan);
                  if (plan) {
                    setAdviceText(`EAP Plan generated for "${plan.taskTitle}". Step 1 requires ${plan.salvagePlanSteps[0]?.energyLevel} energy. Enter the Focus Room to begin.`);
                  } else {
                    setAdviceText('EAP Plan discarded. Select or create a task to plan your next high-stress salvage.');
                  }
                }}
                onStartFocusSession={(plan) => {
                  setActiveTab('focus');
                }}
              />
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/40 py-6 mt-12 text-center text-xs text-slate-500 font-mono">
        <p>CrunchTime AI © 2026. Empowered by Gemini 3.5 AI Action Framework.</p>
      </footer>

      {/* Anti-Panic Coach Overlay modal */}
      <AntiPanicCoach isOpen={isAntiPanicOpen} onClose={() => setIsAntiPanicOpen(false)} />
    </div>
  );
}
