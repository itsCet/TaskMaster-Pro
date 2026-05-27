import { useState } from 'react';
import { Task } from '../types';
import TaskItem from './TaskItem';
import TaskForm from './TaskForm';
import Stats from './Stats';
import CalendarView from './CalendarView';
import {
  Plus, Search, Filter, CheckCircle2, Trash2,
  ListTodo, X,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { db, doc, serverTimestamp, handleFirestoreError, OperationType } from '../lib/firebase';
import { writeBatch } from 'firebase/firestore';

type SubView = 'list' | 'stats' | 'calendar';

interface TasksViewProps {
  tasks:      Task[];
  initialSub?: SubView;
}

export default function TasksView({ tasks, initialSub = 'list' }: TasksViewProps) {
  const [subView,         setSubView]         = useState<SubView>(initialSub);
  const [showForm,        setShowForm]         = useState(false);
  const [editingTask,     setEditingTask]       = useState<Task | null>(null);
  const [searchTerm,      setSearchTerm]        = useState('');
  const [filterPriority,  setFilterPriority]    = useState('all');
  const [filterCategory,  setFilterCategory]    = useState('all');
  const [filterStatus,    setFilterStatus]      = useState('all');

  const openEdit = (task: Task) => {
    setEditingTask(task);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingTask(null);
  };

  const bulkMarkDone = async () => {
    const batch = writeBatch(db);
    tasks.filter(t => t.status === 'pending').forEach(t => {
      batch.update(doc(db, 'tasks', t.id), { status: 'completed', completedAt: serverTimestamp() });
    });
    await batch.commit();
  };

  const bulkDeleteDone = async () => {
    const completed = tasks.filter(t => t.status === 'completed');
    if (!completed.length) return;
    const batch = writeBatch(db);
    completed.forEach(t => batch.delete(doc(db, 'tasks', t.id)));
    try {
      await batch.commit();
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'tasks');
    }
  };

  const categories = Array.from(new Set(tasks.map(t => t.category).filter(Boolean)));

  const filtered = tasks.filter(t => {
    const matchSearch   = t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (t.description?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
    const matchPriority = filterPriority === 'all' || t.priority === filterPriority;
    const matchCategory = filterCategory === 'all' || t.category === filterCategory;
    const matchStatus   = filterStatus === 'all' || t.status === filterStatus;
    return matchSearch && matchPriority && matchCategory && matchStatus;
  });

  const pending   = filtered.filter(t => t.status === 'pending');
  const completed = filtered.filter(t => t.status === 'completed');

  const SUB_TABS = [
    { id: 'list' as SubView,     label: 'Liste' },
    { id: 'stats' as SubView,    label: 'Stats' },
    { id: 'calendar' as SubView, label: 'Calendrier' },
  ];

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* ── Sub-navigation ── */}
      <div className="flex items-center gap-1 px-6 pt-5 pb-0 border-b border-zinc-100">
        {SUB_TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setSubView(tab.id)}
            className={cn(
              'px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors',
              subView === tab.id
                ? 'border-[color:var(--color-accent)] text-[color:var(--color-accent)]'
                : 'border-transparent text-zinc-400 hover:text-zinc-700'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Content ── */}
      <div className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          {subView === 'list' ? (
            <motion.div
              key="list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-6 space-y-6"
            >
              {/* Toolbar */}
              <div className="card p-4 space-y-3">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Chercher une tâche..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="input pl-11"
                  />
                </div>

                {/* Filters + actions */}
                <div className="flex flex-wrap items-center gap-2">
                  {[
                    {
                      value: filterPriority, onChange: setFilterPriority,
                      options: [
                        { value: 'all', label: 'Priorité : Tout' },
                        { value: 'low',    label: '🏡 Basse' },
                        { value: 'medium', label: '⚡ Moyenne' },
                        { value: 'high',   label: '🔥 Haute' },
                        { value: 'urgent', label: '⚠️ Urgente' },
                      ],
                    },
                    {
                      value: filterStatus, onChange: setFilterStatus,
                      options: [
                        { value: 'all',       label: 'Statut : Tout' },
                        { value: 'pending',   label: '⏳ En cours' },
                        { value: 'completed', label: '✅ Terminées' },
                      ],
                    },
                    ...(categories.length > 0
                      ? [{
                          value: filterCategory, onChange: setFilterCategory,
                          options: [
                            { value: 'all', label: 'Catégorie : Tout' },
                            ...categories.map(c => ({ value: c!, label: c! })),
                          ],
                        }]
                      : []
                    ),
                  ].map((sel, i) => (
                    <div key={i} className="flex items-center gap-1.5 bg-zinc-50 border border-zinc-200 px-3 py-2 rounded-xl text-sm text-zinc-600">
                      <Filter className="w-3.5 h-3.5 text-zinc-400" />
                      <select value={sel.value} onChange={e => sel.onChange(e.target.value)} className="bg-transparent text-xs font-semibold border-none outline-none cursor-pointer">
                        {sel.options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                      </select>
                    </div>
                  ))}

                  <div className="flex-1" />

                  <button onClick={bulkMarkDone} className="flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-zinc-800 px-3 py-2 rounded-xl hover:bg-zinc-100 transition-colors">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Tout finir
                  </button>
                  <button onClick={bulkDeleteDone} className="flex items-center gap-1.5 text-xs font-semibold text-red-400 hover:text-red-600 px-3 py-2 rounded-xl hover:bg-red-50 transition-colors">
                    <Trash2 className="w-3.5 h-3.5" /> Suppr. terminées
                  </button>
                  <button onClick={() => setShowForm(true)} className="btn-accent flex items-center gap-2">
                    <Plus className="w-4 h-4" /> Ajouter
                  </button>
                </div>
              </div>

              {/* Task columns */}
              <div className="grid md:grid-cols-2 gap-6">
                <section>
                  <div className="flex items-center justify-between mb-3 px-1">
                    <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-400">En cours</h2>
                    <span className="bg-zinc-200 text-zinc-600 px-2 py-0.5 rounded-full text-[10px] font-bold">{pending.length}</span>
                  </div>
                  {pending.length > 0 ? (
                    <AnimatePresence>
                      {pending.map(task => <TaskItem key={task.id} task={task} onEdit={openEdit} />)}
                    </AnimatePresence>
                  ) : (
                    <div className="card border-dashed text-center py-10">
                      <ListTodo className="w-6 h-6 text-zinc-300 mx-auto mb-2" />
                      <p className="text-sm text-zinc-400">Tout est en ordre !</p>
                    </div>
                  )}
                </section>

                <section>
                  <div className="flex items-center justify-between mb-3 px-1">
                    <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-400">Terminées</h2>
                    <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full text-[10px] font-bold">{completed.length}</span>
                  </div>
                  <AnimatePresence>
                    {completed.map(task => <TaskItem key={task.id} task={task} onEdit={openEdit} />)}
                  </AnimatePresence>
                  {completed.length === 0 && (
                    <div className="card border-dashed text-center py-10">
                      <CheckCircle2 className="w-6 h-6 text-zinc-300 mx-auto mb-2" />
                      <p className="text-sm text-zinc-400">Pas encore de tâches terminées.</p>
                    </div>
                  )}
                </section>
              </div>
            </motion.div>
          ) : subView === 'stats' ? (
            <motion.div key="stats" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-6">
              <Stats tasks={tasks} />
            </motion.div>
          ) : (
            <motion.div key="calendar" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-6">
              <CalendarView tasks={tasks} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Task Form Modal ── */}
      <AnimatePresence>
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-zinc-900/60 backdrop-blur-sm"
              onClick={closeForm}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="px-8 py-5 border-b border-zinc-100 flex items-center justify-between">
                <h2 className="text-lg font-bold">{editingTask ? 'Modifier la tâche' : 'Nouvelle tâche'}</h2>
                <button onClick={closeForm} className="p-2 hover:bg-zinc-100 rounded-full transition-colors">
                  <X className="w-5 h-5 text-zinc-400" />
                </button>
              </div>
              <div className="p-8">
                <TaskForm task={editingTask || undefined} onClose={closeForm} />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Mobile FAB */}
      <button
        onClick={() => setShowForm(true)}
        className="fixed bottom-6 right-6 sm:hidden w-14 h-14 text-white rounded-full shadow-xl flex items-center justify-center z-40"
        style={{ background: 'var(--color-accent)' }}
      >
        <Plus className="w-6 h-6" />
      </button>
    </div>
  );
}
