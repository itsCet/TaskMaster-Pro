import { useMemo } from 'react';
import { motion } from 'motion/react';
import { Task, LEVEL_CONFIG, PRIORITY_CONFIG, TaskyProfile } from '../types';
import { getXPFromTasks, getLevelFromXP, getLevelProgress } from '../lib/utils';
import TaskyAvatar from './TaskyAvatar';
import { isSameDay, subDays, format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Zap, Trophy, Flame, Star, CheckCircle2 } from 'lucide-react';
import { cn } from '../lib/utils';

interface TaskyViewProps {
  tasks: TaskyProfile & { raw: Task[] };
}

const MOTIVATIONAL_QUOTES = [
  "Un pas à la fois, tu atteins des sommets. 🏔️",
  "Chaque tâche terminée est une victoire. 🏆",
  "Ta discipline d'aujourd'hui crée ta liberté de demain. ✨",
  "Tu es plus fort que tu ne le crois. 💪",
  "La progression, pas la perfection. 🌱",
  "Fais une chose à la fois, et fais-la bien. 🎯",
  "Le succès est la somme de petits efforts répétés. 🔥",
];

interface Props {
  tasks: Task[];
  taskyProfile: TaskyProfile;
  onAddTask: () => void;
}

export default function TaskyView({ tasks, taskyProfile, onAddTask }: Props) {
  const todayCompleted = useMemo(() => {
    const today = new Date();
    return tasks.filter(
      t =>
        t.status === 'completed' &&
        t.completedAt &&
        typeof t.completedAt.toDate === 'function' &&
        isSameDay(t.completedAt.toDate(), today)
    );
  }, [tasks]);

  // Streak: consecutive days with at least 1 completed task
  const streak = useMemo(() => {
    let count = 0;
    for (let i = 0; i < 30; i++) {
      const day = subDays(new Date(), i);
      const hasCompleted = tasks.some(
        t =>
          t.status === 'completed' &&
          t.completedAt &&
          typeof t.completedAt.toDate === 'function' &&
          isSameDay(t.completedAt.toDate(), day)
      );
      if (hasCompleted) count++;
      else if (i > 0) break; // allow today to be 0
    }
    return count;
  }, [tasks]);

  const recentXP = useMemo(() => {
    return todayCompleted.reduce((acc, t) => acc + (PRIORITY_CONFIG[t.priority]?.xp ?? 10), 0);
  }, [todayCompleted]);

  const quote = MOTIVATIONAL_QUOTES[new Date().getDay() % MOTIVATIONAL_QUOTES.length];
  const levelInfo = LEVEL_CONFIG[taskyProfile.level];

  // Next level info
  const nextLevel = taskyProfile.level < 5 ? (taskyProfile.level + 1) as 2|3|4|5 : null;
  const nextLevelInfo = nextLevel ? LEVEL_CONFIG[nextLevel] : null;

  // All-time XP history
  const xpHistory = useMemo(() => {
    const days = Array.from({ length: 7 }, (_, i) => subDays(new Date(), 6 - i));
    return days.map(day => {
      const dayTasks = tasks.filter(
        t =>
          t.status === 'completed' &&
          t.completedAt &&
          typeof t.completedAt.toDate === 'function' &&
          isSameDay(t.completedAt.toDate(), day)
      );
      const xp = dayTasks.reduce((acc, t) => acc + (PRIORITY_CONFIG[t.priority]?.xp ?? 10), 0);
      return { day: format(day, 'EEE', { locale: fr }), xp, count: dayTasks.length };
    });
  }, [tasks]);

  const maxXP = Math.max(...xpHistory.map(d => d.xp), 1);

  return (
    <div className="p-6 space-y-6 max-w-2xl mx-auto">
      {/* ── Hero card ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${levelInfo.bg}, white)` }}
      >
        <div className="p-6 flex flex-col sm:flex-row items-center gap-6">
          {/* Avatar */}
          <div className="relative shrink-0">
            <TaskyAvatar
              level={taskyProfile.level}
              mood={taskyProfile.mood}
              size={140}
            />
          </div>

          {/* Info */}
          <div className="flex-1 text-center sm:text-left space-y-3">
            <div>
              <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
                <span className="text-2xl">{levelInfo.emoji}</span>
                <h2 className="text-xl font-extrabold">{taskyProfile.name}</h2>
              </div>
              <p className="text-sm text-zinc-500">{levelInfo.description}</p>
            </div>

            {/* Level badge */}
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <span
                className="px-3 py-1 rounded-full text-xs font-bold text-white"
                style={{ background: levelInfo.color }}
              >
                Niveau {taskyProfile.level} · {levelInfo.name}
              </span>
              {taskyProfile.level === 5 && (
                <span className="text-xs text-amber-500 font-bold">MAX 🔥</span>
              )}
            </div>

            {/* XP bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-zinc-500">
                <span>{taskyProfile.xp} XP au total</span>
                {nextLevelInfo && (
                  <span>Prochain : {nextLevelInfo.name} ({taskyProfile.levelProgress.needed - taskyProfile.levelProgress.current} XP restants)</span>
                )}
              </div>
              <div className="xp-bar">
                <motion.div
                  className="xp-bar-fill"
                  initial={{ width: 0 }}
                  animate={{ width: `${taskyProfile.levelProgress.percent}%` }}
                  transition={{ duration: 1.2, delay: 0.4, ease: 'easeOut' }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-zinc-400">
                <span>{taskyProfile.levelProgress.current} XP</span>
                <span>{taskyProfile.levelProgress.percent}%</span>
                <span>{taskyProfile.level < 5 ? `${taskyProfile.levelProgress.needed} XP` : '∞'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quote banner */}
        <div className="border-t border-zinc-100 px-6 py-3 bg-white/60">
          <p className="text-sm text-zinc-600 italic text-center">{quote}</p>
        </div>
      </motion.div>

      {/* ── Today stats ── */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { icon: <CheckCircle2 className="w-5 h-5" />, label: 'Aujourd\'hui', value: todayCompleted.length, suffix: 'tâches', color: '#22c55e' },
          { icon: <Zap className="w-5 h-5" />, label: 'XP aujourd\'hui', value: recentXP, suffix: 'XP', color: '#f59e0b' },
          { icon: <Flame className="w-5 h-5" />, label: 'Série', value: streak, suffix: 'jours', color: '#ef4444' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * i }}
            className="card p-4 text-center"
          >
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center mx-auto mb-2" style={{ background: stat.color + '20', color: stat.color }}>
              {stat.icon}
            </div>
            <p className="text-2xl font-extrabold">{stat.value}</p>
            <p className="text-[11px] text-zinc-500 font-medium">{stat.suffix}</p>
            <p className="text-[10px] text-zinc-400">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* ── XP bar chart (last 7 days) ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="card p-5"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold">XP des 7 derniers jours</h3>
          <div className="flex items-center gap-1 text-xs text-zinc-400">
            <Star className="w-3 h-3" />
            <span>{getXPFromTasks(tasks.filter(t => {
              const d = t.completedAt && typeof t.completedAt.toDate === 'function' ? t.completedAt.toDate() : null;
              return d && d >= subDays(new Date(), 7);
            }))} XP cette semaine</span>
          </div>
        </div>
        <div className="flex items-end gap-2 h-24">
          {xpHistory.map((d, i) => (
            <div key={d.day} className="flex-1 flex flex-col items-center gap-1">
              <motion.div
                className="w-full rounded-lg"
                style={{ background: i === 6 ? 'var(--color-accent)' : '#e4e4e7', minHeight: 4 }}
                initial={{ height: 0 }}
                animate={{ height: `${(d.xp / maxXP) * 80}px` }}
                transition={{ duration: 0.6, delay: i * 0.07, ease: 'easeOut' }}
                title={`${d.xp} XP (${d.count} tâches)`}
              />
              <span className="text-[9px] text-zinc-400 capitalize">{d.day}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* ── Level roadmap ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="card p-5"
      >
        <h3 className="text-sm font-bold mb-4 flex items-center gap-2">
          <Trophy className="w-4 h-4 text-amber-500" /> Évolution de Tasky
        </h3>
        <div className="space-y-3">
          {([1, 2, 3, 4, 5] as const).map(lvl => {
            const info     = LEVEL_CONFIG[lvl];
            const isActive = lvl === taskyProfile.level;
            const isDone   = lvl < taskyProfile.level;
            return (
              <div key={lvl} className={cn('flex items-center gap-3 p-3 rounded-xl transition-colors', isActive && 'ring-2')} style={isActive ? { ringColor: info.color, background: info.bg } : {}}>
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-base shrink-0"
                  style={{ background: isDone || isActive ? info.color + '30' : '#f1f5f9' }}
                >
                  {isDone ? '✅' : info.emoji}
                </div>
                <div className="flex-1">
                  <p className={cn('text-sm font-semibold', isDone && 'line-through text-zinc-400')}>
                    Niv. {lvl} — {info.name}
                  </p>
                  <p className="text-[11px] text-zinc-500">{info.unlockXP} XP requis</p>
                </div>
                {isActive && (
                  <span className="text-[10px] font-bold px-2 py-1 rounded-full text-white" style={{ background: info.color }}>
                    EN COURS
                  </span>
                )}
                {isDone && <span className="text-[10px] text-zinc-400 font-medium">TERMINÉ</span>}
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* ── CTA if no tasks today ── */}
      {todayCompleted.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="card p-6 text-center border-dashed"
        >
          <p className="text-4xl mb-3">😴</p>
          <p className="font-semibold text-zinc-700 mb-1">Tasky t'attend...</p>
          <p className="text-sm text-zinc-500 mb-4">Lance une tâche pour lui redonner de l'énergie !</p>
          <button onClick={onAddTask} className="btn-accent">
            ➕ Ajouter une tâche
          </button>
        </motion.div>
      )}
    </div>
  );
}
