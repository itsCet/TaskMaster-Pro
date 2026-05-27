import type { ReactNode } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User } from '../lib/firebase';
import { cn } from '../lib/utils';
import { TaskyProfile, LEVEL_CONFIG } from '../types';
import TaskyAvatar from './TaskyAvatar';
import {
  Sparkles, ListTodo, User as UserIcon, Palette, Users, Settings2,
  ChevronLeft, ChevronRight, LogOut, TrendingUp, CalendarDays,
} from 'lucide-react';

export type SidebarView = 'tasky' | 'tasks' | 'stats' | 'calendar' | 'profile' | 'style' | 'team' | 'settings';

interface SidebarProps {
  user:        User;
  view:        SidebarView;
  onView:      (v: SidebarView) => void;
  onLogout:    () => void;
  taskyProfile: TaskyProfile;
  collapsed:   boolean;
  onToggle:    () => void;
}

const NAV_ITEMS: { id: SidebarView; label: string; icon: ReactNode; group?: string }[] = [
  { id: 'tasky',    label: 'Tasky',         icon: <Sparkles  className="w-5 h-5 shrink-0" /> },
  { id: 'tasks',    label: 'Mes Tâches',    icon: <ListTodo  className="w-5 h-5 shrink-0" />, group: 'sep' },
  { id: 'stats',    label: 'Statistiques',  icon: <TrendingUp className="w-5 h-5 shrink-0" /> },
  { id: 'calendar', label: 'Calendrier',    icon: <CalendarDays className="w-5 h-5 shrink-0" /> },
  { id: 'profile',  label: 'Profil',        icon: <UserIcon  className="w-5 h-5 shrink-0" />, group: 'sep' },
  { id: 'style',    label: 'Style',         icon: <Palette   className="w-5 h-5 shrink-0" /> },
  { id: 'team',     label: 'Équipe',        icon: <Users     className="w-5 h-5 shrink-0" /> },
  { id: 'settings', label: 'Paramètres',   icon: <Settings2 className="w-5 h-5 shrink-0" /> },
];

export default function Sidebar({ user, view, onView, onLogout, taskyProfile, collapsed, onToggle }: SidebarProps) {
  const levelInfo = LEVEL_CONFIG[taskyProfile.level];

  return (
    <motion.aside
      animate={{ width: collapsed ? 68 : 240 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="relative flex flex-col h-full bg-white border-r border-zinc-200 overflow-hidden shrink-0 z-20"
    >
      {/* ── Logo ── */}
      <div className="flex items-center justify-between px-3 pt-4 pb-3 border-b border-zinc-100">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center text-white shrink-0 shadow-md"
            style={{ background: 'var(--color-accent)' }}
          >
            <Sparkles className="w-5 h-5" />
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                className="overflow-hidden"
              >
                <p className="text-sm font-extrabold tracking-tight leading-none">TaskMaster</p>
                <p className="text-[9px] font-bold uppercase tracking-widest text-zinc-400">Pro</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <button
          onClick={onToggle}
          className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors"
        >
          {collapsed
            ? <ChevronRight className="w-4 h-4" />
            : <ChevronLeft  className="w-4 h-4" />
          }
        </button>
      </div>

      {/* ── Mini Tasky preview (when collapsed) ── */}
      {collapsed && (
        <div className="flex justify-center py-3 border-b border-zinc-100">
          <div className="text-xl" title={`${taskyProfile.name} — Niv. ${taskyProfile.level} ${levelInfo.name}`}>
            {levelInfo.emoji}
          </div>
        </div>
      )}

      {/* ── Tasky mini card (when expanded) ── */}
      <AnimatePresence>
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <button
              onClick={() => onView('tasky')}
              className={cn(
                "w-full mx-3 mt-3 mb-1 rounded-2xl p-3 flex flex-col items-center gap-1 transition-all",
                "border-2 cursor-pointer",
                view === 'tasky'
                  ? "border-transparent text-white"
                  : "border-zinc-100 hover:border-zinc-200 bg-zinc-50 hover:bg-zinc-100"
              )}
              style={view === 'tasky' ? { background: levelInfo.color + '33', borderColor: levelInfo.color } : {}}
            >
              <TaskyAvatar level={taskyProfile.level} mood={taskyProfile.mood} size={72} />
              <div className="text-center">
                <p className="text-xs font-bold text-zinc-800">{taskyProfile.name}</p>
                <p className="text-[10px] text-zinc-500">Niv. {taskyProfile.level} · {levelInfo.name}</p>
              </div>
              {/* XP bar */}
              <div className="w-full xp-bar mt-1">
                <motion.div
                  className="xp-bar-fill"
                  initial={{ width: 0 }}
                  animate={{ width: `${taskyProfile.levelProgress.percent}%` }}
                  transition={{ duration: 1, delay: 0.3 }}
                />
              </div>
              <p className="text-[9px] text-zinc-400">
                {taskyProfile.levelProgress.current} / {taskyProfile.levelProgress.needed || '∞'} XP
              </p>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Navigation ── */}
      <nav className="flex-1 px-2 py-2 space-y-0.5 overflow-y-auto no-scrollbar">
        {NAV_ITEMS.map((item) => (
          <div key={item.id}>
            {item.group === 'sep' && <div className="h-px bg-zinc-100 my-2 mx-1" />}
            <button
              onClick={() => onView(item.id)}
              title={collapsed ? item.label : undefined}
              className={cn(
                'nav-item w-full text-left',
                view === item.id && 'active'
              )}
            >
              {item.icon}
              <AnimatePresence>
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -6 }}
                    className="text-sm font-medium truncate"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          </div>
        ))}
      </nav>

      {/* ── User footer ── */}
      <div className="px-2 pb-4 border-t border-zinc-100 pt-3 space-y-1">
        <div className={cn("flex items-center gap-2.5 px-2 py-2 rounded-xl", !collapsed && "overflow-hidden")}>
          <img
            src={user.photoURL ?? `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || 'U')}&background=18181b&color=fff`}
            alt={user.displayName || 'Avatar'}
            className="w-8 h-8 rounded-full border-2 border-zinc-200 shrink-0 object-cover"
          />
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 min-w-0"
              >
                <p className="text-xs font-semibold truncate">{user.displayName}</p>
                <p className="text-[10px] text-zinc-400 truncate">{user.email}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <button
          onClick={onLogout}
          title="Déconnexion"
          className="nav-item w-full text-red-400 hover:text-red-600 hover:bg-red-50"
        >
          <LogOut className="w-5 h-5 shrink-0" />
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-sm font-medium"
              >
                Déconnexion
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
    </motion.aside>
  );
}
