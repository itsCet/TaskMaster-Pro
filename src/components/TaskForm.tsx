import { useState, FormEvent } from 'react';
import { format } from 'date-fns';
import { db, collection, addDoc, updateDoc, doc, handleFirestoreError, OperationType, serverTimestamp, auth, Timestamp } from '../lib/firebase';
import { Priority, Task } from '../types';
import { Plus, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface TaskFormProps {
  onClose?: () => void;
  task?: Task;
}

export default function TaskForm({ onClose, task }: TaskFormProps) {
  const [title, setTitle] = useState(task?.title || '');
  const [description, setDescription] = useState(task?.description || '');
  const [category, setCategory] = useState(task?.category || '');
  const [priority, setPriority] = useState<Priority>(task?.priority || 'medium');
  const [dueDate, setDueDate] = useState(
    task?.dueDate && typeof task.dueDate.toDate === 'function' 
      ? format(task.dueDate.toDate(), 'yyyy-MM-dd') 
      : ''
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!title || !auth.currentUser) return;

    setIsSubmitting(true);
    const path = task ? `tasks/${task.id}` : 'tasks';
    try {
      if (task) {
        await updateDoc(doc(db, 'tasks', task.id), {
          title,
          description,
          category: category || null,
          priority,
          dueDate: dueDate ? Timestamp.fromDate(new Date(dueDate)) : null,
        });
      } else {
        await addDoc(collection(db, 'tasks'), {
          title,
          description,
          category: category || null,
          priority,
          status: 'pending',
          dueDate: dueDate ? Timestamp.fromDate(new Date(dueDate)) : null,
          createdAt: serverTimestamp(),
          ownerId: auth.currentUser.uid,
        });
      }
      
      onClose?.();
    } catch (error) {
      handleFirestoreError(error, task ? OperationType.UPDATE : OperationType.CREATE, path);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-zinc-700 mb-1">Titre</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Ex: Appeler le fournisseur..."
          className="input w-full"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-zinc-700 mb-1">Catégorie</label>
        <input
          type="text"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          placeholder="Ex: Pro, Perso..."
          className="input w-full"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-zinc-700 mb-1">Description (Optionnel)</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="input w-full min-h-[80px]"
          placeholder="Détails de la tâche..."
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-1">Priorité</label>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value as Priority)}
            className="input w-full appearance-none"
          >
            <option value="low">🏡 Basse</option>
            <option value="medium">⚡ Moyenne</option>
            <option value="high">🔥 Haute</option>
            <option value="urgent">⚠️ Urgente</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-1">Échéance (Optionnel)</label>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="input w-full"
          />
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onClose}
          className="btn-secondary flex-1"
        >
          Annuler
        </button>
        <button
          type="submit"
          disabled={isSubmitting || !title}
          className="btn-primary flex-1 flex items-center justify-center gap-2"
        >
          {isSubmitting ? 'Création...' : (
            <>
              <Plus className="w-4 h-4" />
              Créer la tâche
            </>
          )}
        </button>
      </div>
    </form>
  );
}
