import { Timestamp } from 'firebase/firestore';

export type Priority = 'low' | 'medium' | 'high' | 'urgent';
export type Status = 'pending' | 'completed';

export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: Priority;
  status: Status;
  dueDate?: Timestamp;
  completedAt?: Timestamp | null;
  createdAt: Timestamp;
  category?: string;
  ownerId: string;
}

export const PRIORITY_CONFIG = {
  low: { color: 'bg-blue-100 text-blue-700 border-blue-200', label: 'Basse' },
  medium: { color: 'bg-yellow-100 text-yellow-700 border-yellow-200', label: 'Moyenne' },
  high: { color: 'bg-orange-100 text-orange-700 border-orange-200', label: 'Haute' },
  urgent: { color: 'bg-red-100 text-red-700 border-red-200', label: 'Urgente' },
};
