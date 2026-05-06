import React, { useState } from 'react';
import { db, doc, updateDoc, deleteDoc, handleFirestoreError, OperationType, serverTimestamp } from '../lib/firebase';
import { Task, PRIORITY_CONFIG } from '../types';
import { CheckCircle2, Circle, Trash2, Calendar, AlertCircle, Edit2 } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

interface TaskItemProps {
  task: Task;
  onEdit: (task: Task) => void;
  key?: React.Key;
}

export default function TaskItem({ task, onEdit }: TaskItemProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const toggleStatus = async () => {
    const newStatus = task.status === 'pending' ? 'completed' : 'pending';
    const path = `tasks/${task.id}`;
    try {
      await updateDoc(doc(db, 'tasks', task.id), {
        status: newStatus,
        completedAt: newStatus === 'completed' ? serverTimestamp() : null
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  };

  const deleteTask = async () => {
    setIsDeleting(true);
    const path = `tasks/${task.id}`;
    console.log('Attempting to delete task at:', path);
    try {
      await deleteDoc(doc(db, 'tasks', task.id));
      console.log('Task deleted successfully');
    } catch (error) {
      console.error('Error deleting task:', error);
      handleFirestoreError(error, OperationType.DELETE, path);
      setIsDeleting(false);
    }
  };

  const priorityInfo = PRIORITY_CONFIG[task.priority];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ scale: 1.005, backgroundColor: "rgba(255, 255, 255, 0.8)", borderColor: "rgba(228, 228, 231, 1)" }}
      className={cn(
        "group flex items-start gap-4 p-4 card mb-3 transition-colors border duration-300",
        task.status === 'completed' && "opacity-60 bg-zinc-50 border-transparent"
      )}
    >
      <button 
        onClick={toggleStatus}
        className="mt-1 transition-transform active:scale-90"
      >
        {task.status === 'completed' ? (
          <CheckCircle2 className="w-5 h-5 text-emerald-500" />
        ) : (
          <Circle className="w-5 h-5 text-zinc-300 group-hover:text-zinc-500" />
        )}
      </button>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h3 className={cn(
            "text-sm font-semibold leading-tight truncate tracking-tight text-brand-primary",
            task.status === 'completed' && "line-through text-brand-secondary"
          )}>
            {task.title}
          </h3>
          {task.category && (
            <span className="text-[9px] bg-zinc-100 text-brand-secondary font-mono uppercase px-1.5 py-0.5 rounded-md">
              {task.category}
            </span>
          )}
          <span className={cn(
            "text-[9px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded-md border",
            priorityInfo.color
          )}>
            {priorityInfo.label}
          </span>
        </div>

        {task.description && (
          <p className={cn(
            "text-xs text-brand-secondary line-clamp-1 font-sans",
            task.status === 'completed' && "line-through opacity-50"
          )}>
            {task.description}
          </p>
        )}

        <div className="flex items-center gap-4 mt-3 text-xs text-zinc-400">
          {task.dueDate && typeof task.dueDate.toDate === 'function' && (
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              <span>Pour le {format(task.dueDate.toDate(), 'd MMMM', { locale: fr })}</span>
            </div>
          )}
          <div className="flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            <span>Ajoutée le {task.createdAt && typeof task.createdAt.toDate === 'function' 
              ? format(task.createdAt.toDate(), 'd MMM', { locale: fr })
              : 'Date invalide'}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          className="p-2 text-zinc-300 hover:text-zinc-600 dark:hover:text-zinc-400 rounded-lg transition-colors"
          onClick={() => onEdit(task)}
        >
          <Edit2 className="w-4 h-4" />
        </button>
        <button
          onClick={deleteTask}
          disabled={isDeleting}
          className="p-2 text-zinc-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
}
