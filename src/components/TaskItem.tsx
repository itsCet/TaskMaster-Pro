import React, { useState } from 'react';
import { db, doc, updateDoc, deleteDoc, handleFirestoreError, OperationType, serverTimestamp } from '../lib/firebase';
import { Task, PRIORITY_CONFIG } from '../types';
import { CheckCircle2, Circle, Trash2, Calendar, AlertCircle, Edit2 } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

const PRIORITY_RETRO: Record<string, { bg: string; border: string; text: string; label: string }> = {
  low:    { bg: '#e8f0ff', border: '#4060cc', text: '#2040aa', label: 'BASSE'   },
  medium: { bg: '#fff8e0', border: '#cc8800', text: '#885500', label: 'MOY.'    },
  high:   { bg: '#fff0e0', border: '#cc5500', text: '#883300', label: 'HAUTE'   },
  urgent: { bg: '#ffe0e0', border: '#cc2200', text: '#880000', label: 'URGENT'  },
};

interface TaskItemProps {
  task:   Task;
  onEdit: (task: Task) => void;
  key?:   React.Key;
}

export default function TaskItem({ task, onEdit }: TaskItemProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const toggleStatus = async () => {
    const newStatus = task.status === 'pending' ? 'completed' : 'pending';
    try {
      await updateDoc(doc(db, 'tasks', task.id), {
        status:      newStatus,
        completedAt: newStatus === 'completed' ? serverTimestamp() : null,
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `tasks/${task.id}`);
    }
  };

  const deleteTask = async () => {
    setIsDeleting(true);
    try {
      await deleteDoc(doc(db, 'tasks', task.id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `tasks/${task.id}`);
      setIsDeleting(false);
    }
  };

  const p = PRIORITY_RETRO[task.priority] ?? PRIORITY_RETRO.medium;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ x: -1, y: -1 }}
      className="group flex items-start gap-3 mb-3"
      style={{
        background:   task.status === 'completed' ? 'var(--paper-dark)' : 'var(--paper-light)',
        border:       'var(--r-border)',
        borderRadius: 'var(--r-radius)',
        boxShadow:    task.status === 'completed' ? '2px 2px 0 var(--ink)' : 'var(--r-shadow-sm)',
        padding:      '0.875rem',
        opacity:      task.status === 'completed' ? 0.65 : 1,
        transition:   'box-shadow 0.08s, transform 0.08s',
      }}
    >
      {/* Checkbox */}
      <button
        onClick={toggleStatus}
        className="mt-0.5 shrink-0 transition-transform active:scale-90"
        style={{ color: task.status === 'completed' ? 'var(--orange)' : 'var(--ink-light)' }}
      >
        {task.status === 'completed'
          ? <CheckCircle2 className="w-5 h-5" />
          : <Circle className="w-5 h-5" />
        }
      </button>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* Title row */}
        <div className="flex items-center gap-2 flex-wrap mb-1">
          <h3
            className={cn('text-sm font-semibold leading-tight truncate', task.status === 'completed' && 'line-through')}
            style={{ fontFamily: 'var(--font-sans)', color: 'var(--ink)', textDecoration: task.status === 'completed' ? 'line-through' : 'none' }}
          >
            {task.title}
          </h3>

          {/* Priority tag — retro style */}
          <span
            style={{
              fontFamily:   'var(--font-mono)',
              fontSize:     '0.52rem',
              fontWeight:   700,
              letterSpacing: '0.06em',
              padding:      '0.1rem 0.4rem',
              background:   p.bg,
              border:       `1.5px solid ${p.border}`,
              borderRadius: 'var(--r-radius)',
              color:        p.text,
            }}
          >
            {p.label}
          </span>

          {/* Category tag */}
          {task.category && (
            <span style={{
              fontFamily:   'var(--font-mono)',
              fontSize:     '0.52rem',
              fontWeight:   600,
              letterSpacing: '0.06em',
              padding:      '0.1rem 0.4rem',
              background:   'var(--paper-dark)',
              border:       '1.5px solid var(--ink)',
              borderRadius: 'var(--r-radius)',
              color:        'var(--ink-mid)',
            }}>
              {task.category.toUpperCase()}
            </span>
          )}
        </div>

        {/* Description */}
        {task.description && (
          <p className="text-xs line-clamp-1 mb-2" style={{ color: 'var(--ink-light)', fontFamily: 'var(--font-sans)', textDecoration: task.status === 'completed' ? 'line-through' : 'none' }}>
            {task.description}
          </p>
        )}

        {/* Meta — dates */}
        <div className="flex items-center gap-3" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.55rem', color: 'var(--ink-light)' }}>
          {task.dueDate && typeof task.dueDate.toDate === 'function' && (
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {format(task.dueDate.toDate(), 'd MMM', { locale: fr }).toUpperCase()}
            </span>
          )}
          <span className="flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            {task.createdAt && typeof task.createdAt.toDate === 'function'
              ? format(task.createdAt.toDate(), 'd MMM', { locale: fr }).toUpperCase()
              : '—'
            }
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
        <button
          onClick={() => onEdit(task)}
          className="p-1.5 rounded transition-colors"
          style={{ border: '1.5px solid transparent' }}
          onMouseEnter={e => { e.currentTarget.style.border = 'var(--r-border)'; e.currentTarget.style.background = 'var(--paper-dark)'; }}
          onMouseLeave={e => { e.currentTarget.style.border = '1.5px solid transparent'; e.currentTarget.style.background = ''; }}
        >
          <Edit2 className="w-3.5 h-3.5" style={{ color: 'var(--ink-mid)' }} />
        </button>
        <button
          onClick={deleteTask}
          disabled={isDeleting}
          className="p-1.5 rounded transition-colors disabled:opacity-50"
          style={{ border: '1.5px solid transparent' }}
          onMouseEnter={e => { e.currentTarget.style.border = '1.5px solid #cc2200'; e.currentTarget.style.background = '#ffe0e0'; }}
          onMouseLeave={e => { e.currentTarget.style.border = '1.5px solid transparent'; e.currentTarget.style.background = ''; }}
        >
          <Trash2 className="w-3.5 h-3.5" style={{ color: '#cc2200' }} />
        </button>
      </div>
    </motion.div>
  );
}
