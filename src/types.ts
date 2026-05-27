import { Timestamp } from 'firebase/firestore';

export type Priority = 'low' | 'medium' | 'high' | 'urgent';
export type Status = 'pending' | 'completed';

export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: Priority;
  status: Status;
  dueDate?: Timestamp;
  completedAt?: Timestamp | null;
  createdAt: Timestamp;
  category?: string;
  ownerId: string;
}

export const PRIORITY_CONFIG = {
  low:    { color: 'bg-blue-100 text-blue-700 border-blue-200',     label: 'Basse',   xp: 10  },
  medium: { color: 'bg-yellow-100 text-yellow-700 border-yellow-200', label: 'Moyenne', xp: 20  },
  high:   { color: 'bg-orange-100 text-orange-700 border-orange-200', label: 'Haute',   xp: 50  },
  urgent: { color: 'bg-red-100 text-red-700 border-red-200',         label: 'Urgente', xp: 100 },
};

// ── Tasky Avatar system ──────────────────────────────────────────────────────
export type TaskyLevel = 1 | 2 | 3 | 4 | 5;
export type TaskyMood  = 'sleeping' | 'bored' | 'happy' | 'excited' | 'celebrating';

export interface TaskyProfile {
  xp:            number;
  level:         TaskyLevel;
  mood:          TaskyMood;
  levelProgress: { current: number; needed: number; percent: number };
  name:          string;
}

export const LEVEL_CONFIG: Record<TaskyLevel, {
  name: string; color: string; bg: string; description: string; emoji: string; unlockXP: number;
}> = {
  1: { name: 'Graine',      color: '#94a3b8', bg: '#f1f5f9', description: 'Tasky sommeille... Complète tes premières tâches !',          emoji: '🥚', unlockXP: 0    },
  2: { name: 'Pousse',      color: '#4ade80', bg: '#f0fdf4', description: 'Tasky commence à s\'éveiller ! Continue comme ça.',           emoji: '🌱', unlockXP: 100  },
  3: { name: 'Explorateur', color: '#38bdf8', bg: '#f0f9ff', description: 'Tasky est curieux et aventurier ! Tu avances bien.',          emoji: '🦊', unlockXP: 300  },
  4: { name: 'Champion',    color: '#c084fc', bg: '#faf5ff', description: 'Tasky est un guerrier redoutable ! Tu es sur une lancée. 🔥', emoji: '⚔️', unlockXP: 600  },
  5: { name: 'Légende',     color: '#facc15', bg: '#fefce8', description: 'Tasky est légendaire ! Tu es un maître de la productivité.',  emoji: '👑', unlockXP: 1000 },
};

// ── Theme system ─────────────────────────────────────────────────────────────
export type Theme = 'zinc' | 'violet' | 'ocean' | 'sunset' | 'forest' | 'sakura';

export const THEME_CONFIG: Record<Theme, { label: string; primary: string; accent: string; preview: string }> = {
  zinc:   { label: 'Obsidienne', primary: '#18181b', accent: '#3f3f46', preview: '#18181b' },
  violet: { label: 'Violet',     primary: '#7c3aed', accent: '#6d28d9', preview: '#7c3aed' },
  ocean:  { label: 'Océan',      primary: '#0284c7', accent: '#0369a1', preview: '#0284c7' },
  sunset: { label: 'Coucher de soleil', primary: '#ea580c', accent: '#c2410c', preview: '#ea580c' },
  forest: { label: 'Forêt',      primary: '#16a34a', accent: '#15803d', preview: '#16a34a' },
  sakura: { label: 'Sakura',     primary: '#db2777', accent: '#be185d', preview: '#db2777' },
};
