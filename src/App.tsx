import { useState, useEffect } from 'react';
import { 
  auth, 
  db, 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  signInWithPopup, 
  googleProvider, 
  signOut, 
  onAuthStateChanged,
  User,
  handleFirestoreError,
  OperationType,
  doc,
  serverTimestamp
} from './lib/firebase';
import { Task } from './types';
import TaskItem from './components/TaskItem';
import TaskForm from './components/TaskForm';
import Stats from './components/Stats';
import CalendarView from './components/CalendarView';
import { X, LayoutDashboard, 
  CheckCircle2, 
  ListTodo, 
  Plus, 
  LogOut, 
  ChevronRight,
  TrendingUp,
  Search,
  Filter,
  CalendarDays,
  Moon,
  Sun,
  Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './lib/utils';
import { writeBatch } from 'firebase/firestore';

type View = 'list' | 'stats' | 'calendar';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [view, setView] = useState<View>('list');
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setDarkMode(true);
    }
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const login = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) {
      setTasks([]);
      return;
    }

    const q = query(
      collection(db, 'tasks'),
      where('ownerId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        const t: Task[] = [];
        snapshot.forEach((doc) => {
          t.push({ id: doc.id, ...doc.data() } as Task);
        });
        setTasks(t);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'tasks');
      }
    );

    return () => unsubscribe();
  }, [user]);

  const bulkMarkDone = async () => {
    const batch = writeBatch(db);
    tasks.filter(t => t.status === 'pending').forEach(t => {
      batch.update(doc(db, 'tasks', t.id), { status: 'completed', completedAt: serverTimestamp() });
    });
    await batch.commit();
  };

  const bulkDeleteDone = async () => {
    const completedTasks = tasks.filter(t => t.status === 'completed');
    if (completedTasks.length === 0) return;
    
    const batch = writeBatch(db);
    completedTasks.forEach(t => {
      batch.delete(doc(db, 'tasks', t.id));
    });
    
    try {
      await batch.commit();
    } catch (error) {
      console.error('Error in bulkDeleteDone:', error);
      handleFirestoreError(error, OperationType.WRITE, 'tasks');
    }
  };
 
  const filteredTasks = tasks.filter(t => {
    const matchesSearch = t.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (t.description?.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesPriority = filterPriority === 'all' || t.priority === filterPriority;
    const matchesCategory = filterCategory === 'all' || t.category === filterCategory;
    return matchesSearch && matchesPriority && matchesCategory;
  });

  const categories = Array.from(new Set(tasks.map(t => t.category).filter(Boolean)));
  
  // ... rest of the App component ...

  const pendingTasks = filteredTasks.filter(t => t.status === 'pending');
  const completedTasks = filteredTasks.filter(t => t.status === 'completed');

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-2 border-zinc-200 border-t-zinc-900 rounded-full"
        />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-zinc-50">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm text-center"
        >
          <div className="w-16 h-16 bg-zinc-900 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-zinc-900/20">
            <CheckCircle2 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight mb-3">TaskMaster Pro</h1>
          <p className="text-zinc-500 mb-10">Optimisez votre gestion quotidienne avec précision et clarté.</p>
          <button 
            onClick={login}
            className="w-full py-4 bg-zinc-900 text-white rounded-2xl font-semibold flex items-center justify-center gap-3 shadow-lg shadow-zinc-900/20 transition-all hover:bg-zinc-800 active:scale-[0.98]"
          >
            <img src="https://www.google.com/favicon.ico" className="w-5 h-5 invert" alt="" />
            Se connecter avec Google
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-zinc-200 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-zinc-900 rounded-xl flex items-center justify-center shadow-lg shadow-zinc-900/10">
              <CheckCircle2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight leading-none">TaskMaster</h1>
              <p className="text-[10px] uppercase tracking-widest text-zinc-400 font-bold">Workspace</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden sm:flex flex-col items-end mr-2 text-right">
              <span className="text-xs font-semibold">{user.displayName}</span>
              <span className="text-[10px] text-zinc-400">{user.email}</span>
            </div>
            <button 
              onClick={logout}
              className="p-2 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg transition-colors"
              title="Déconnexion"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Navigation */}
      <nav className="bg-white border-b border-zinc-200">
        <div className="max-w-5xl mx-auto px-6 flex items-center overflow-x-auto no-scrollbar">
          <button 
            onClick={() => setView('list')}
            className={cn(
              "px-4 py-4 text-sm font-medium flex items-center gap-2 border-b-2 transition-all whitespace-nowrap",
              view === 'list' ? "border-zinc-900 text-zinc-900" : "border-transparent text-zinc-400 hover:text-zinc-600"
            )}
          >
            <ListTodo className="w-4 h-4" />
            Mes Tâches
          </button>
          <button 
            onClick={() => setView('stats')}
            className={cn(
              "px-4 py-4 text-sm font-medium flex items-center gap-2 border-b-2 transition-all whitespace-nowrap",
              view === 'stats' ? "border-zinc-900 text-zinc-900" : "border-transparent text-zinc-400 hover:text-zinc-600"
            )}
          >
            <TrendingUp className="w-4 h-4" />
            Statistiques
          </button>
          <button 
            onClick={() => setView('calendar')}
            className={cn(
              "px-4 py-4 text-sm font-medium flex items-center gap-2 border-b-2 transition-all whitespace-nowrap",
              view === 'calendar' ? "border-zinc-900 text-zinc-900" : "border-transparent text-zinc-400 hover:text-zinc-600"
            )}
          >
            <CalendarDays className="w-4 h-4" />
            Calendrier
          </button>
        </div>
      </nav>

      <main className="flex-1 max-w-5xl w-full mx-auto p-6">
        <AnimatePresence mode="wait">
          {view === 'list' ? (
            <motion.div
              key="list"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="space-y-8"
            >
              {/* Toolbar */}
              <div className="flex flex-col gap-4 bg-white p-6 rounded-3xl border border-zinc-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
                <div className="relative flex-1 w-full">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                  <input 
                    type="text" 
                    placeholder="Qu'est-ce qui presse aujourd'hui ?"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-100 rounded-2xl pl-12 pr-4 py-3 text-sm focus:ring-2 focus:ring-zinc-900/5 outline-none transition-all placeholder:text-zinc-400"
                  />
                </div>
                <div className="flex flex-wrap items-center gap-3 w-full">
                  <div className="flex items-center gap-2 bg-zinc-50 border border-zinc-100 px-4 py-2.5 rounded-2xl text-zinc-600">
                    <Filter className="w-3.5 h-3.5 text-zinc-400" />
                    <select 
                      value={filterPriority}
                      onChange={(e) => setFilterPriority(e.target.value)}
                      className="bg-transparent text-xs font-semibold border-none outline-none cursor-pointer"
                    >
                      <option value="all">Priorité : Tout</option>
                      <option value="low">Basse</option>
                      <option value="medium">Moyenne</option>
                      <option value="high">Haute</option>
                      <option value="urgent">Urgente</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-2 bg-zinc-50 border border-zinc-100 px-4 py-2.5 rounded-2xl text-zinc-600">
                    <Filter className="w-3.5 h-3.5 text-zinc-400" />
                    <select 
                      value={filterCategory}
                      onChange={(e) => setFilterCategory(e.target.value)}
                      className="bg-transparent text-xs font-semibold border-none outline-none cursor-pointer"
                    >
                      <option value="all">Catégorie : Tout</option>
                      {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="flex-1" />
                  <button onClick={bulkMarkDone} className="text-xs font-semibold text-zinc-500 hover:text-zinc-900 transition-colors flex items-center gap-2 px-3 py-2">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Tout finir
                  </button>
                  <button onClick={bulkDeleteDone} className="text-xs font-semibold text-red-500 hover:text-red-700 transition-colors flex items-center gap-2 px-3 py-2">
                    <Trash2 className="w-3.5 h-3.5" /> Suppr. terminées
                  </button>
                  <button 
                    onClick={() => setShowForm(true)}
                    className="flex items-center gap-2.5 bg-zinc-900 hover:bg-zinc-800 text-white text-sm font-semibold px-5 py-2.5 rounded-2xl transition-all active:scale-[0.98] shadow-lg shadow-zinc-900/10"
                  >
                    <Plus className="w-4 h-4" />
                    Ajouter
                  </button>
                  <button onClick={toggleDarkMode} className="p-3 bg-zinc-100 rounded-2xl hover:bg-zinc-200 transition-colors">
                    {darkMode ? <Sun className="w-4 h-4 text-zinc-500" /> : <Moon className="w-4 h-4 text-zinc-500" />}
                  </button>
                </div>
              </div>

              {/* Task Section */}
              <div className="grid md:grid-cols-2 gap-8 items-start">
                <section>
                  <div className="flex items-center justify-between mb-4 px-2">
                    <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-400">En cours</h2>
                    <span className="bg-zinc-200 text-zinc-600 px-2 py-0.5 rounded-full text-[10px] font-bold">
                      {pendingTasks.length}
                    </span>
                  </div>
                  
                  {pendingTasks.length > 0 ? (
                    <div className="space-y-1">
                      <AnimatePresence>
                        {pendingTasks.map((task) => (
                          <TaskItem key={task.id} task={task} onEdit={setEditingTask} />
                        ))}
                      </AnimatePresence>
                    </div>
                  ) : (
                    <div className="text-center py-12 card border-dashed">
                      <div className="w-12 h-12 bg-zinc-50 rounded-full flex items-center justify-center mx-auto mb-3">
                        <ListTodo className="w-6 h-6 text-zinc-300" />
                      </div>
                      <p className="text-zinc-400 text-sm">Tout est en ordre !</p>
                    </div>
                  )}
                </section>

                <section>
                  <div className="flex items-center justify-between mb-4 px-2">
                    <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-400">Terminées</h2>
                    <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full text-[10px] font-bold">
                      {completedTasks.length}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <AnimatePresence>
                      {completedTasks.map((task) => (
                        <TaskItem key={task.id} task={task} onEdit={setEditingTask} />
                      ))}
                    </AnimatePresence>
                  </div>
                </section>
              </div>
            </motion.div>
          ) : view === 'stats' ? (
            <motion.div
              key="stats"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
            >
              <Stats tasks={tasks} />
            </motion.div>
          ) : (
            <motion.div
              key="calendar"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
            >
              <CalendarView tasks={tasks} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Modal Form Overlay */}
      <AnimatePresence>
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowForm(false)}
              className="absolute inset-0 bg-zinc-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="px-8 py-6 border-b border-zinc-100 flex items-center justify-between">
                <h2 className="text-xl font-bold">{editingTask ? 'Modifier la Tâche' : 'Nouvelle Tâche'}</h2>
                <button 
                  onClick={() => { setShowForm(false); setEditingTask(null); }}
                  className="p-2 hover:bg-zinc-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-zinc-400" />
                </button>
              </div>
              <div className="p-8">
                <TaskForm task={editingTask || undefined} onClose={() => { setShowForm(false); setEditingTask(null); }} />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Quick Add FAB (Mobile) */}
      <button 
        onClick={() => setShowForm(true)}
        className="fixed bottom-6 right-6 sm:hidden w-14 h-14 bg-zinc-900 text-white rounded-full shadow-lg shadow-zinc-900/30 flex items-center justify-center active:scale-95 transition-transform z-40"
      >
        <Plus className="w-6 h-6" />
      </button>
    </div>
  );
}
