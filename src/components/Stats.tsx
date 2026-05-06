import { useMemo } from 'react';
import { Task } from '../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, subDays } from 'date-fns';
import { fr } from 'date-fns/locale';

interface StatsProps {
  tasks: Task[];
}

export default function Stats({ tasks }: StatsProps) {
  const last7Days = useMemo(() => {
    const end = new Date();
    const start = subDays(end, 6);
    return eachDayOfInterval({ start, end });
  }, []);

  const dailyData = useMemo(() => {
    return last7Days.map(day => {
      const dayTasks = tasks.filter(t => t.completedAt && typeof t.completedAt.toDate === 'function' && isSameDay(t.completedAt.toDate(), day));
      return {
        name: format(day, 'EEE', { locale: fr }),
        completed: dayTasks.length,
        fullDate: format(day, 'd MMMM', { locale: fr })
      };
    });
  }, [tasks, last7Days]);

  const priorityData = useMemo(() => {
    const counts = tasks.reduce((acc, t) => {
      acc[t.priority] = (acc[t.priority] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return [
      { name: 'Bas', value: counts.low || 0, color: '#3b82f6' },
      { name: 'Moyen', value: counts.medium || 0, color: '#eab308' },
      { name: 'Haut', value: counts.high || 0, color: '#f97316' },
      { name: 'Urgent', value: counts.urgent || 0, color: '#ef4444' }
    ].filter(d => d.value > 0);
  }, [tasks]);

  const stats = useMemo(() => {
    const completed = tasks.filter(t => t.status === 'completed').length;
    const weekCount = tasks.filter(t => {
      if (!t.completedAt || typeof t.completedAt.toDate !== 'function') return false;
      const date = t.completedAt.toDate();
      return date >= subDays(new Date(), 7);
    }).length;
    
    return {
      total: tasks.length,
      completed,
      pending: tasks.length - completed,
      weekCount,
      completionRate: tasks.length > 0 ? Math.round((completed / tasks.length) * 100) : 0
    };
  }, [tasks]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card p-4 text-center">
          <p className="text-zinc-500 text-xs font-semibold uppercase tracking-wider mb-1">Tâches</p>
          <p className="text-2xl font-bold">{stats.total}</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-emerald-600 text-xs font-semibold uppercase tracking-wider mb-1">Terminées</p>
          <p className="text-2xl font-bold text-emerald-600">{stats.completed}</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-amber-600 text-xs font-semibold uppercase tracking-wider mb-1">En attente</p>
          <p className="text-2xl font-bold text-amber-600">{stats.pending}</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-indigo-600 text-xs font-semibold uppercase tracking-wider mb-1">7 derniers jours</p>
          <p className="text-2xl font-bold text-indigo-600">{stats.weekCount}</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="card p-6">
          <h3 className="text-sm font-semibold mb-6 flex items-center justify-between">
            Productivité de la semaine
            <span className="text-zinc-400 font-normal text-xs">Terminées par jour</span>
          </h3>
          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyData}>
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: '#71717a' }}
                />
                <Tooltip 
                  cursor={{ fill: '#f4f4f5' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  labelStyle={{ fontWeight: 600 }}
                />
                <Bar dataKey="completed" radius={[4, 4, 0, 0]}>
                  {dailyData.map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === dailyData.length - 1 ? '#18181b' : '#d4d4d8'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
