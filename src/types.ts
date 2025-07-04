export interface Todo {
  id: string;
  text: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  category: string;
  estimatedTime?: number;
  createdAt: Date;
  completedAt?: Date;
}

export interface Quote {
  text: string;
  author: string;
}

export interface AIMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  suggestions?: string[];
}

export interface AISuggestion {
  id: string;
  title: string;
  description: string;
  type: 'productivity' | 'planning' | 'wellness' | 'optimization';
  priority: number;
}

export interface PomodoroSession {
  id: string;
  type: 'work' | 'shortBreak' | 'longBreak';
  duration: number; // in seconds
  startTime: Date;
  endTime?: Date;
  completed: boolean;
  taskId?: string;
}

export interface PomodoroSettings {
  workDuration: number; // in minutes
  shortBreakDuration: number; // in minutes
  longBreakDuration: number; // in minutes
  longBreakInterval: number; // number of work sessions before long break
}