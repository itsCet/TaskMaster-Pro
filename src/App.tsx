import { useState, useEffect, useCallback } from 'react';
import {
  auth, db, collection, query, where, orderBy,
  onSnapshot, signInWithPopup, googleProvider,
  signOut, onAuthStateChanged, User,
  handleFirestoreError, OperationType, doc, serverTimestamp,
} from './lib/firebase';
import { Task, Theme } from './types';
import { getTaskyProfile, applyTheme } from './lib/utils';
import { motion, AnimatePresence } from 'motion/react';

import Sidebar, { SidebarView } from './components/Sidebar';
import TaskyView    from './components/TaskyView';
import TasksView    from './components/TasksView';
import ProfileView  from './components/ProfileView';
import StyleView    from './components/StyleView';
import TeamView     from './components/TeamView';
import SettingsView from './components/SettingsView';
import Stats        from './components/Stats';
import CalendarView from './components/CalendarView';
import TaskForm     from './components/TaskForm';

import { CheckCircle2, Menu, X, Plus } from 'lucide-react';
import { writeBatch } from 'firebase/firestore';
import { cn } from './lib/utils';

export default function App() {
  const [user,           setUser]          = useState<User | null>(null);
  const [loading,        setLoading]       = useState(true);
  const [tasks,          setTasks]         = useState<Task[]>([]);
  const [view,           setView]          = useState<SidebarView>('tasky');
  const [sidebarOpen,    setSidebarOpen]   = useState(false);   // mobile drawer
  const [sidebarCollapsed, setCollapsed]   = useState(false);   // desktop collapsed
  const [theme,          setTheme]         = useState<Theme>('zinc');
  const [darkMode,       setDarkMode]      = useState(false);
  const [compact,        setCompact]       = useState(false);
  const [taskyName,      setTaskyName]     = useState('Tasky');
  const [showAddTask,    setShowAddTask]   = useState(false);

  // ── Auth ──────────────────────────────────────────────────────────────────
  const login = async () => {
    try { await signInWithPopup(auth, googleProvider); }
    catch (e) { console.error('Login failed', e); }
  };
  const logout = async () => {
    try { await signOut(auth); }
    catch (e) { console.error('Logout failed', e); }
  };

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, u => { setUser(u); setLoading(false); });
    return () => unsub();
  }, []);

  // ── Firestore tasks ───────────────────────────────────────────────────────
  useEffect(() => {
    if (!user) { setTasks([]); return; }
    const q = query(
      collection(db, 'tasks'),
      where('ownerId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );
    const unsub = onSnapshot(
      q,
      snap => setTasks(snap.docs.map(d => ({ id: d.id, ...d.data() } as Task))),
      err  => handleFirestoreError(err, OperationType.LIST, 'tasks')
    );
    return () => unsub();
  }, [user]);

  // ── Theme ─────────────────────────────────────────────────────────────────
  useEffect(() => { applyTheme(theme); }, [theme]);
  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);
  useEffect(() => {
    document.documentElement.classList.toggle('compact', compact);
  }, [compact]);

  // ── Persist preferences ───────────────────────────────────────────────────
  useEffect(() => {
    const saved = localStorage.getItem('tasky-prefs');
    if (saved) {
      try {
        const p = JSON.parse(saved);
        if (p.theme)      setTheme(p.theme);
        if (p.taskyName)  setTaskyName(p.taskyName);
        if (p.collapsed !== undefined) setCollapsed(p.collapsed);
      } catch {}
    }
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) setDarkMode(true);
  }, []);

  const savePrefs = useCallback((patch: Record<string, unknown>) => {
    const saved = localStorage.getItem('tasky-prefs');
    const prev  = saved ? JSON.parse(saved) : {};
    localStorage.setItem('tasky-prefs', JSON.stringify({ ...prev, ...patch }));
  }, []);

  const handleTheme = (t: Theme) => { setTheme(t); savePrefs({ theme: t }); };
  const handleRenameTasky = (name: string) => { setTaskyName(name); savePrefs({ taskyName: name }); };
  const handleCollapse = () => { setCollapsed(c => { savePrefs({ collapsed: !c }); return !c; }); };

  // ── Tasky profile ─────────────────────────────────────────────────────────
  const taskyProfile = getTaskyProfile(tasks, taskyName);

  // ── Loading / Login ───────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-8 h-8 border-2 border-zinc-200 border-t-zinc-900 rounded-full"
        />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-br from-zinc-50 to-violet-50">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-sm text-center"
        >
          {/* Logo */}
          <div
            className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl"
            style={{ background: 'var(--color-accent)' }}
          >
            <CheckCircle2 className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight mb-2">TaskMaster Pro</h1>
          <p className="text-zinc-500 mb-2">Organise tes tâches. Fais évoluer Tasky.</p>
          <p className="text-sm text-zinc-400 mb-8">Ton compagnon virtuel te motive à rester productif chaque jour. 🐾</p>

          <button
            onClick={login}
            className="w-full py-4 bg-zinc-900 text-white rounded-2xl font-semibold flex items-center justify-center gap-3 shadow-lg shadow-zinc-900/20 hover:bg-zinc-800 active:scale-[0.98] transition-all"
          >
            <img src="https://www.google.com/favicon.ico" className="w-5 h-5 invert" alt="" />
            Se connecter avec Google
          </button>

          {/* Feature chips */}
          <div className="flex flex-wrap justify-center gap-2 mt-8">
            {['🐾 Avatar qui évolue', '✅ Gestion de tâches', '📊 Statistiques', '🎨 Thèmes'].map(f => (
              <span key={f} className="text-xs bg-white border border-zinc-200 px-3 py-1.5 rounded-full text-zinc-600 shadow-sm">{f}</span>
            ))}
          </div>
        </motion.div>
      </div>
    );
  }

  // ── Main app layout ───────────────────────────────────────────────────────
  return (
    <div className={cn('flex h-screen overflow-hidden bg-zinc-50', compact && 'text-sm')}>

      {/* ── Mobile overlay ── */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-zinc-900/50 backdrop-blur-sm z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* ── Sidebar (desktop always visible, mobile drawer) ── */}
      <div className={cn(
        'hidden lg:flex h-full transition-all',
      )}>
        <Sidebar
          user={user}
          view={view}
          onView={v => { setView(v); setSidebarOpen(false); }}
          onLogout={logout}
          taskyProfile={taskyProfile}
          collapsed={sidebarCollapsed}
          onToggle={handleCollapse}
        />
      </div>

      {/* Mobile sidebar drawer */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed left-0 top-0 h-full z-40 lg:hidden"
            style={{ width: 240 }}
          >
            <Sidebar
              user={user}
              view={view}
              onView={v => { setView(v); setSidebarOpen(false); }}
              onLogout={logout}
              taskyProfile={taskyProfile}
              collapsed={false}
              onToggle={() => setSidebarOpen(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Main content ── */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Mobile topbar */}
        <div className="lg:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-zinc-200 shrink-0">
          <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-xl hover:bg-zinc-100 transition-colors">
            <Menu className="w-5 h-5" />
          </button>
          <span className="font-extrabold text-sm">TaskMaster Pro</span>
          <button
            onClick={() => setShowAddTask(true)}
            className="w-9 h-9 rounded-xl text-white flex items-center justify-center"
            style={{ background: 'var(--color-accent)' }}
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* View content */}
        <main className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            {view === 'tasky' && (
              <motion.div key="tasky" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }}>
                <TaskyView tasks={tasks} taskyProfile={taskyProfile} onAddTask={() => { setView('tasks'); setShowAddTask(true); }} />
              </motion.div>
            )}
            {view === 'tasks' && (
              <motion.div key="tasks" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} className="h-full">
                <TasksView tasks={tasks} />
              </motion.div>
            )}
            {view === 'stats' && (
              <motion.div key="stats" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} className="p-6">
                <Stats tasks={tasks} />
              </motion.div>
            )}
            {view === 'calendar' && (
              <motion.div key="calendar" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} className="p-6">
                <CalendarView tasks={tasks} />
              </motion.div>
            )}
            {view === 'profile' && (
              <motion.div key="profile" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }}>
                <ProfileView user={user} tasks={tasks} taskyProfile={taskyProfile} taskyName={taskyName} onRenameTasky={handleRenameTasky} />
              </motion.div>
            )}
            {view === 'style' && (
              <motion.div key="style" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }}>
                <StyleView currentTheme={theme} onTheme={handleTheme} darkMode={darkMode} onDarkMode={setDarkMode} compact={compact} onCompact={setCompact} />
              </motion.div>
            )}
            {view === 'team' && (
              <motion.div key="team" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }}>
                <TeamView />
              </motion.div>
            )}
            {view === 'settings' && (
              <motion.div key="settings" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }}>
                <SettingsView user={user} tasks={tasks} onLogout={logout} />
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>

      {/* ── Quick add modal (from Tasky CTA or mobile button) ── */}
      <AnimatePresence>
        {showAddTask && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-zinc-900/60 backdrop-blur-sm"
              onClick={() => setShowAddTask(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 16 }}
              className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="px-8 py-5 border-b border-zinc-100 flex items-center justify-between">
                <h2 className="text-lg font-bold">Nouvelle tâche</h2>
                <button onClick={() => setShowAddTask(false)} className="p-2 hover:bg-zinc-100 rounded-full transition-colors">
                  <X className="w-5 h-5 text-zinc-400" />
                </button>
              </div>
              <div className="p-8">
                <TaskForm onClose={() => setShowAddTask(false)} />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
