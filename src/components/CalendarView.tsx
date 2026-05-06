import { useMemo, useState } from 'react';
import { Task, PRIORITY_CONFIG } from '../types';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, startOfWeek, endOfWeek } from 'date-fns';
import { fr } from 'date-fns/locale';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';

interface CalendarViewProps {
  tasks: Task[];
}

export default function CalendarView({ tasks }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  
  const days = useMemo(() => {
    return eachDayOfInterval({ 
      start: startOfWeek(monthStart, { weekStartsOn: 1 }), 
      end: endOfWeek(monthEnd, { weekStartsOn: 1 }) 
    });
  }, [monthStart, monthEnd]);

  const weekDays = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

  const getTasksForDay = (day: Date) => {
    return tasks.filter(t => t.dueDate && typeof t.dueDate.toDate === 'function' && isSameDay(t.dueDate.toDate(), day));
  };

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold capitalize">
          {format(currentDate, 'MMMM yyyy', { locale: fr })}
        </h2>
        <div className="flex gap-2">
          <button onClick={() => setCurrentDate(subMonths(currentDate, 1))} className="p-2 hover:bg-zinc-100 rounded-lg">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button onClick={() => setCurrentDate(addMonths(currentDate, 1))} className="p-2 hover:bg-zinc-100 rounded-lg">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-7 gap-px bg-zinc-200 border border-zinc-200 rounded-xl overflow-hidden">
        {weekDays.map(day => (
          <div key={day} className="bg-zinc-50 p-2 text-center text-xs font-bold text-zinc-500 uppercase">
            {day}
          </div>
        ))}
        {days.map(day => {
          const dayTasks = getTasksForDay(day);
          const isToday = isSameDay(day, new Date());
          
          return (
            <div 
              key={day.toString()} 
              className={cn(
                "bg-white min-h-[100px] p-2 transition-colors hover:bg-zinc-50",
                !isSameMonth(day, monthStart) && "bg-zinc-50/50 text-zinc-400"
              )}
            >
              <div className="flex items-center justify-between mb-1">
                <span className={cn(
                  "text-xs font-medium w-6 h-6 flex items-center justify-center rounded-full",
                  isToday ? "bg-zinc-900 text-white" : "text-zinc-700"
                )}>
                  {format(day, 'd')}
                </span>
                {dayTasks.length > 0 && (
                  <div className="w-1.5 h-1.5 rounded-full bg-zinc-400" />
                )}
              </div>
              <div className="space-y-1">
                {dayTasks.map(task => {
                  const priority = PRIORITY_CONFIG[task.priority];
                  return (
                    <div 
                      key={task.id}
                      className={cn(
                        "text-[10px] p-1 rounded truncate border flex items-center gap-1",
                        task.status === 'completed' 
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200 line-through" 
                          : `${priority.color} border-transparent`
                      )}
                      title={`${task.title} (${priority.label})`}
                    >
                      <div className={cn(
                        "w-1.5 h-1.5 rounded-full shrink-0",
                        task.status === 'completed' ? "bg-emerald-500" : "bg-current"
                      )} />
                      <span className="truncate">{task.title}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
