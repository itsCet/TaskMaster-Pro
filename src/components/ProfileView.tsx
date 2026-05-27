import { useState } from 'react';
import { motion } from 'motion/react';
import { User } from '../lib/firebase';
import { Task, PRIORITY_CONFIG, LEVEL_CONFIG } from '../types';
import { TaskyProfile } from '../types';
import { isSameDay, subDays, format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Edit2, Trophy, Zap, CheckCircle2, Flame, Star } from 'lucide-react';
import { cn } from '../lib/utils';
import TaskyAvatar from './TaskyAvatar';

interface ProfileViewProps {
  user:         User;
  tasks:        Task[];
  taskyProfile: TaskyProfile;
  taskyName:    string;
  onRenameTasky: (name: string) => void;
}

export default function ProfileView({ user, tasks, taskyProfile, taskyName, onRenameTasky }: ProfileViewProps) {
  const [editingName, setEditingName] = useState(false);
  const [nameInput,   setNameInput]   = useState(taskyName);

  const completed = tasks.filter(t => t.status === 'completed');
  const totalXP   = taskyProfile.xp;
  const levelInfo = LEVEL_CONFIG[taskyProfile.level];

  const streak = (() => {
    let count = 0;
    for (let i = 0; i < 30; i++) {
      const day = subDays(new Date(), i);
      const has = completed.some(t =>
        t.completedAt &&
        typeof t.completedAt.toDate === 'function' &&
        isSameDay(t.completedAt.toDate(), day)
      );
      if (has) count++;
      else if (i > 0) break;
    }
    return count;
  })();

  const urgentDone  = completed.filter(t => t.priority === 'urgent').length;
  const weekDone    = completed.filter(t => {
    const d = t.completedAt && typeof t.completedAt.toDate === 'function' ? t.completedAt.toDate() : null;
    return d && d >= subDays(new Date(), 7);
  }).length;

  const badges = [
    { emoji: '🏆', label: 'Première tâche',  earned: completed.length >= 1 },
    { emoji: '🔥', label: '5 d\'affilée',     earned: streak >= 5 },
    { emoji: '⚡', label: '10 urgentes',       earned: urgentDone >= 10 },
    { emoji: '💎', label: '50 tâches',          earned: completed.length >= 50 },
    { emoji: '👑', label: 'Niveau Légende',    earned: taskyProfile.level === 5 },
    { emoji: '🚀', label: '20 cette semaine',  earned: weekDone >= 20 },
  ];

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      {/* ── Header card ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="card p-6"
      >
        <div className="flex items-center gap-5">
          <div className="relative">
            <img
              src={user.photoURL ?? `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || 'U')}&background=18181b&color=fff&size=128`}
              alt={user.displayName || 'Avatar'}
              className="w-20 h-20 rounded-2xl object-cover border-4 border-white shadow-lg"
            />
            <div
              className="absolute -bottom-2 -right-2 w-8 h-8 rounded-xl flex items-center justify-center text-sm border-2 border-white shadow"
              style={{ background: levelInfo.color }}
            >
              {levelInfo.emoji}
            </div>
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-extrabold">{user.displayName}</h2>
            <p className="text-sm text-zinc-500">{user.email}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full text-white" style={{ background: levelInfo.color }}>
                Niv. {taskyProfile.level} · {levelInfo.name}
              </span>
              <span className="text-xs text-zinc-400">{totalXP} XP total</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Stats row ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 sm:grid-cols-4 gap-3"
      >
        {[
          { icon: <CheckCircle2 className="w-4 h-4" />, label: 'Tâches terminées', value: completed.length,     color: '#22c55e' },
          { icon: <Zap          className="w-4 h-4" />, label: 'XP total',          value: totalXP,             color: '#f59e0b' },
          { icon: <Flame        className="w-4 h-4" />, label: 'Meilleure série',   value: `${streak}j`,        color: '#ef4444' },
          { icon: <Star         className="w-4 h-4" />, label: 'Urgentes résolues', value: urgentDone,          color: '#8b5cf6' },
        ].map(s => (
          <div key={s.label} className="card p-4 text-center">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center mx-auto mb-1" style={{ background: s.color + '20', color: s.color }}>
              {s.icon}
            </div>
            <p className="text-xl font-extrabold">{s.value}</p>
            <p className="text-[10px] text-zinc-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </motion.div>

      {/* ── Tasky companion ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="card p-5 flex items-center gap-5"
      >
        <TaskyAvatar level={taskyProfile.level} mood={taskyProfile.mood} size={80} />
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            {editingName ? (
              <form
                onSubmit={e => {
                  e.preventDefault();
                  onRenameTasky(nameInput.trim() || 'Tasky');
                  setEditingName(false);
                }}
                className="flex gap-2"
              >
                <input
                  autoFocus
                  value={nameInput}
                  onChange={e => setNameInput(e.target.value)}
                  className="input text-sm py-1.5 px-3 w-36"
                  maxLength={20}
                />
                <button type="submit" className="btn-accent py-1.5 px-3 text-xs">OK</button>
              </form>
            ) : (
              <>
                <h3 className="font-bold text-base">{taskyName}</h3>
                <button onClick={() => { setNameInput(taskyName); setEditingName(true); }} className="p-1 text-zinc-400 hover:text-zinc-700 rounded-lg transition-colors">
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              </>
            )}
          </div>
          <p className="text-sm text-zinc-500">{levelInfo.description}</p>
          {/* XP bar */}
          <div className="xp-bar mt-2">
            <motion.div
              className="xp-bar-fill"
              initial={{ width: 0 }}
              animate={{ width: `${taskyProfile.levelProgress.percent}%` }}
              transition={{ duration: 1 }}
            />
          </div>
          <p className="text-[11px] text-zinc-400 mt-1">
            {taskyProfile.levelProgress.current} / {taskyProfile.levelProgress.needed || '∞'} XP pour le niveau {(taskyProfile.level + 1) <= 5 ? taskyProfile.level + 1 : 'Max'}
          </p>
        </div>
      </motion.div>

      {/* ── Badges ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="card p-5"
      >
        <h3 className="text-sm font-bold mb-4 flex items-center gap-2">
          <Trophy className="w-4 h-4 text-amber-500" /> Badges
        </h3>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {badges.map(badge => (
            <div key={badge.label} className={cn('flex flex-col items-center gap-1 p-3 rounded-xl transition-all', badge.earned ? 'bg-amber-50' : 'bg-zinc-50 opacity-40 grayscale')}>
              <span className="text-2xl">{badge.emoji}</span>
              <p className="text-[9px] text-center font-medium text-zinc-600 leading-tight">{badge.label}</p>
              {badge.earned && <span className="text-[8px] text-amber-600 font-bold">✓ Débloqué</span>}
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
