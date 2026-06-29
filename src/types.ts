export type Priority = 'high' | 'medium' | 'low';
export type TaskCategory = 'assignment' | 'meeting' | 'bill' | 'commitment' | 'other';
export type TaskStatus = 'pending' | 'completed' | 'missed';

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
  estimatedMinutes?: number;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  deadline: string; // ISO String
  priority: Priority;
  category: TaskCategory;
  status: TaskStatus;
  estimatedHours: number;
  subtasks: Subtask[];
  priorityScore: number; // calculated score (0 - 100)
  createdAt: string;
}

export interface Habit {
  id: string;
  name: string;
  streak: number;
  completedDates: string[]; // YYYY-MM-DD
  frequency: 'daily' | 'weekly';
  createdAt: string;
}

export interface PlanStep {
  timeSlot: string; // e.g. "Hour 1", "08:00 - 09:00"
  action: string;
  focusTip: string;
  durationMinutes: number;
  energyLevel: 'high' | 'medium' | 'low';
}

export interface EmergencyPlan {
  taskId: string;
  taskTitle: string;
  deadline: string;
  hoursRemaining: number;
  salvagePlanSteps: PlanStep[];
  generalTips: string[];
}

export interface Recommendation {
  id: string;
  title: string;
  content: string;
  type: 'anti-procrastination' | 'scheduling' | 'wellness' | 'focus';
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface User {
  username: string;
  email: string;
  avatarUrl?: string;
  createdAt: string;
  role?: 'student' | 'professional' | 'entrepreneur';
  institution?: string;
  mainGoal?: string;
  workMode?: 'solo' | 'collaborative';
  dailyFocusHours?: number;
  onboarded?: boolean;
}

