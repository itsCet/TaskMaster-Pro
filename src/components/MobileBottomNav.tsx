import { motion } from 'motion/react';
import { Sparkles, ListTodo, User, Palette, Settings2 } from 'lucide-react';
import { SidebarView } from './Sidebar';

interface MobileBottomNavProps {
  view:   SidebarView;
  onView: (v: SidebarView) => void;
  taskyEmoji: string;
}

const ITEMS = [
  { id: 'tasky'    as SidebarView, icon: <Sparkles  className="w-5 h-5" />, label: 'Tasky'    },
  { id: 'tasks'    as SidebarView, icon: <ListTodo  className="w-5 h-5" />, label: 'Tâches'   },
  { id: 'profile'  as SidebarView, icon: <User      className="w-5 h-5" />, label: 'Profil'   },
  { id: 'style'    as SidebarView, icon: <Palette   className="w-5 h-5" />, label: 'Style'    },
  { id: 'settings' as SidebarView, icon: <Settings2 className="w-5 h-5" />, label: 'Params'   },
];

export default function MobileBottomNav({ view, onView, taskyEmoji }: MobileBottomNavProps) {
  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around"
      style={{
        height: '64px',
        background: 'var(--ink)',
        borderTop: '2px solid var(--orange)',
        boxShadow: '0 -3px 0 rgba(0,0,0,0.3)',
      }}
    >
      {ITEMS.map(item => {
        const isActive = view === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onView(item.id)}
            className="flex flex-col items-center justify-center gap-0.5 flex-1 h-full transition-all"
            style={{ color: isActive ? 'var(--orange)' : 'rgba(242,232,212,0.45)' }}
          >
            {item.id === 'tasky' && isActive ? (
              <span style={{ fontSize: '1.25rem', lineHeight: 1 }}>{taskyEmoji}</span>
            ) : (
              <span style={{ color: isActive ? 'var(--orange)' : 'rgba(242,232,212,0.45)' }}>
                {item.icon}
              </span>
            )}
            <span style={{
              fontFamily: 'var(--font-sans)',
              fontWeight: 700,
              fontSize: '0.55rem',
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
            }}>
              {item.label}
            </span>
            {isActive && (
              <motion.div
                layoutId="mobile-nav-indicator"
                className="absolute bottom-0"
                style={{ height: 2, width: 24, background: 'var(--orange)' }}
              />
            )}
          </button>
        );
      })}
    </nav>
  );
}
