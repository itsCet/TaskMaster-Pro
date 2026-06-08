import type { ReactNode } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User } from '../lib/firebase';
import { cn } from '../lib/utils';
import { TaskyProfile, LEVEL_CONFIG } from '../types';
import TaskyAvatar from './TaskyAvatar';
import {
  Sparkles, ListTodo, User as UserIcon, Palette, Users, Settings2,
  ChevronLeft, ChevronRight, TrendingUp, CalendarDays,
} from 'lucide-react';

export type SidebarView = 'tasky' | 'tasks' | 'stats' | 'calendar' | 'profile' | 'style' | 'team' | 'settings';

interface SidebarProps {
  user:         User;
  view:         SidebarView;
  onView:       (v: SidebarView) => void;
  onLogout:     () => void;
  taskyProfile: TaskyProfile;
  collapsed:    boolean;
  onToggle:     () => void;
  celebrating?: boolean;
}

const NAV_ITEMS: { id: SidebarView; label: string; icon: ReactNode; sep?: boolean }[] = [
  { id: 'tasky',    label: 'Tasky',        icon: <Sparkles     className="w-4 h-4 shrink-0" /> },
  { id: 'tasks',    label: 'Tâches',       icon: <ListTodo     className="w-4 h-4 shrink-0" />, sep: true },
  { id: 'stats',    label: 'Stats',        icon: <TrendingUp   className="w-4 h-4 shrink-0" /> },
  { id: 'calendar', label: 'Calendrier',   icon: <CalendarDays className="w-4 h-4 shrink-0" /> },
  { id: 'profile',  label: 'Profil',       icon: <UserIcon     className="w-4 h-4 shrink-0" />, sep: true },
  { id: 'style',    label: 'Style',        icon: <Palette      className="w-4 h-4 shrink-0" /> },
  { id: 'team',     label: 'Équipe',       icon: <Users        className="w-4 h-4 shrink-0" /> },
  { id: 'settings', label: 'Paramètres',  icon: <Settings2    className="w-4 h-4 shrink-0" /> },
];

export default function Sidebar({ user, view, onView, onLogout, taskyProfile, collapsed, onToggle, celebrating }: SidebarProps) {
  const levelInfo = LEVEL_CONFIG[taskyProfile.level];

  return (
    <motion.aside
      animate={{ width: collapsed ? 68 : 248 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="relative flex flex-col h-full shrink-0 z-20 overflow-hidden"
      style={{
        background:   'var(--paper-light)',
        borderRight:  'var(--r-border)',
        boxShadow:    '4px 0 0 var(--ink)',
      }}
    >
      {/* ── Logo ───────────────────────────────────────────────────────── */}
      <div
        className="flex items-center justify-between px-3 py-3"
        style={{ borderBottom: 'var(--r-border)' }}
      >
        <div className="flex items-center gap-2.5 overflow-hidden min-w-0">
          {/* Logo stamp */}
          <div
            className="w-9 h-9 shrink-0 flex items-center justify-center"
            style={{
              background:   'var(--ink)',
              borderRadius: 'var(--r-radius)',
              boxShadow:    'var(--r-shadow-sm)',
            }}
          >
            <Sparkles className="w-5 h-5" style={{ color: 'var(--orange)' }} />
          </div>

          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                className="overflow-hidden min-w-0"
              >
                <p
                  className="leading-none truncate"
                  style={{ fontFamily: 'var(--font-display)', fontSize: '0.72rem', letterSpacing: '0.05em', color: 'var(--ink)' }}
                >
                  TASKMASTER
                </p>
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.55rem', color: 'var(--orange)', letterSpacing: '0.12em', fontWeight: 600 }}>
                  PRO
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <button
          onClick={onToggle}
          className="p-1.5 rounded transition-colors shrink-0"
          style={{ color: 'var(--ink-mid)' }}
          onMouseEnter={e => (e.currentTarget.style.background = 'var(--paper-dark)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
        >
          {collapsed
            ? <ChevronRight className="w-4 h-4" />
            : <ChevronLeft  className="w-4 h-4" />
          }
        </button>
      </div>

      {/* ── Icône Tasky (collapsed) ─────────────────────────────────────── */}
      {collapsed && (
        <div
          className="flex justify-center py-3"
          style={{ borderBottom: 'var(--r-border)' }}
        >
          <span
            className="text-xl cursor-pointer"
            title={`${taskyProfile.name} — Niv.${taskyProfile.level} ${levelInfo.name}`}
            onClick={() => onView('tasky')}
          >
            {levelInfo.emoji}
          </span>
        </div>
      )}

      {/* ── Carte mini Tasky (expanded) ─────────────────────────────────── */}
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
              className="w-full flex flex-col items-center gap-1.5 p-3 cursor-pointer transition-all"
              style={{
                borderBottom: 'var(--r-border)',
                background: view === 'tasky' ? 'var(--orange-pale)' : 'var(--paper)',
              }}
              onMouseEnter={e => { if (view !== 'tasky') e.currentTarget.style.background = 'var(--paper-dark)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = view === 'tasky' ? 'var(--orange-pale)' : 'var(--paper)'; }}
            >
              <TaskyAvatar level={taskyProfile.level} mood={celebrating ? 'celebrating' : taskyProfile.mood} size={80} celebrating={celebrating} />

              <div className="text-center w-full px-1">
                <p style={{ fontFamily: 'var(--font-display)', fontSize: '0.7rem', color: 'var(--ink)', letterSpacing: '0.04em' }}>
                  {taskyProfile.name}
                </p>
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.55rem', color: 'var(--ink-mid)' }}>
                  NIV.{taskyProfile.level} · {levelInfo.name.toUpperCase()}
                </p>
              </div>

              {/* Barre XP */}
              <div className="w-full xp-bar">
                <motion.div
                  className="xp-bar-fill"
                  initial={{ width: 0 }}
                  animate={{ width: `${taskyProfile.levelProgress.percent}%` }}
                  transition={{ duration: 1, delay: 0.3 }}
                />
              </div>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.52rem', color: 'var(--ink-light)' }}>
                {taskyProfile.levelProgress.current}/{taskyProfile.levelProgress.needed || '∞'} XP
              </p>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Navigation ──────────────────────────────────────────────────── */}
      <nav className="flex-1 px-2 py-2 space-y-0.5 overflow-y-auto no-scrollbar">
        {NAV_ITEMS.map(item => (
          <div key={item.id}>
            {item.sep && (
              <div style={{ height: 1, background: 'var(--paper-dark)', borderTop: '1px solid var(--ink)', margin: '6px 4px' }} />
            )}
            <button
              onClick={() => onView(item.id)}
              title={collapsed ? item.label : undefined}
              className={cn('nav-item', view === item.id && 'active')}
            >
              {item.icon}
              <AnimatePresence>
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -6 }}
                    style={{ fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: '0.78rem', letterSpacing: '0.01em' }}
                  >
                    {item.label.toUpperCase()}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          </div>
        ))}
      </nav>

      {/* ── Footer utilisateur ──────────────────────────────────────────── */}
      <div className="px-2 pb-3 pt-2" style={{ borderTop: 'var(--r-border)' }}>
        <div className="flex items-center gap-2.5 px-2 py-2 overflow-hidden">
          {/* Avatar générique rétro */}
          <div
            className="w-8 h-8 shrink-0 flex items-center justify-center"
            style={{
              background:   'var(--ink)',
              border:       'var(--r-border)',
              borderRadius: 'var(--r-radius)',
              color:        'var(--orange)',
              fontFamily:   'var(--font-display)',
              fontSize:     '0.7rem',
            }}
          >
            {taskyProfile.name.charAt(0).toUpperCase()}
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 min-w-0">
                <p style={{ fontFamily: 'var(--font-display)', fontSize: '0.6rem', color: 'var(--ink)', letterSpacing: '0.04em' }} className="truncate">
                  MON ESPACE
                </p>
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.5rem', color: 'var(--ink-light)' }}>
                  MODE LOCAL
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.aside>
  );
}
