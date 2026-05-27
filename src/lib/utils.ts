import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { isSameDay } from 'date-fns';
import { Task, TaskyLevel, TaskyMood, TaskyProfile, PRIORITY_CONFIG, Theme } from '../types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ── XP & Level helpers ───────────────────────────────────────────────────────
export function getXPFromTasks(tasks: Task[]): number {
  return tasks
    .filter(t => t.status === 'completed')
    .reduce((acc, t) => acc + (PRIORITY_CONFIG[t.priority]?.xp ?? 10), 0);
}

export function getLevelFromXP(xp: number): TaskyLevel {
  if (xp >= 1000) return 5;
  if (xp >= 600)  return 4;
  if (xp >= 300)  return 3;
  if (xp >= 100)  return 2;
  return 1;
}

export function getLevelProgress(xp: number): { current: number; needed: number; percent: number } {
  const thresholds = [0, 100, 300, 600, 1000, Infinity] as const;
  const level      = getLevelFromXP(xp);
  const levelStart = thresholds[level - 1];
  const levelEnd   = thresholds[level];
  const current    = xp - levelStart;
  const needed     = levelEnd === Infinity ? 0 : (levelEnd - levelStart);
  const percent    = needed === 0 ? 100 : Math.min(100, Math.round((current / needed) * 100));
  return { current, needed, percent };
}

export function getTaskyMood(tasks: Task[]): TaskyMood {
  const today = new Date();
  const todayCompleted = tasks.filter(
    t =>
      t.status === 'completed' &&
      t.completedAt &&
      typeof t.completedAt.toDate === 'function' &&
      isSameDay(t.completedAt.toDate(), today)
  ).length;

  if (todayCompleted === 0) {
    return getXPFromTasks(tasks) === 0 ? 'sleeping' : 'bored';
  }
  if (todayCompleted >= 5) return 'excited';
  return 'happy';
}

export function getTaskyProfile(tasks: Task[], name = 'Tasky'): TaskyProfile {
  const xp            = getXPFromTasks(tasks);
  const level         = getLevelFromXP(xp);
  const mood          = getTaskyMood(tasks);
  const levelProgress = getLevelProgress(xp);
  return { xp, level, mood, levelProgress, name };
}

// ── Theme helpers ────────────────────────────────────────────────────────────
export function applyTheme(theme: Theme) {
  const root = document.documentElement;
  const themes: Record<Theme, { primary: string; hover: string }> = {
    zinc:   { primary: '#18181b', hover: '#27272a' },
    violet: { primary: '#7c3aed', hover: '#6d28d9' },
    ocean:  { primary: '#0284c7', hover: '#0369a1' },
    sunset: { primary: '#ea580c', hover: '#c2410c' },
    forest: { primary: '#16a34a', hover: '#15803d' },
    sakura: { primary: '#db2777', hover: '#be185d' },
  };
  root.style.setProperty('--color-accent',       themes[theme].primary);
  root.style.setProperty('--color-accent-hover',  themes[theme].hover);
  root.setAttribute('data-theme', theme);
}
