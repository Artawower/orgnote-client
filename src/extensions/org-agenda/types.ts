import type { FileTask } from 'orgnote-api';

export interface AgendaTaskDraft {
  title: string;
  body: string;
  scheduledDate?: string;
}

export interface WeekDayCompletion {
  date: string;
  dayLabel: string;
  isToday: boolean;
  completionLevel: 'none' | 'partial' | 'full';
  completionRatio: number;
}

export interface AgendaHabitView extends FileTask {
  filePath: string;
  fileTitle: string;
  totalDays: number;
  currentStreak: number;
  completedToday: boolean;
}
