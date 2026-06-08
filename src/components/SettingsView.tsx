import { useState, type ReactNode } from 'react';
import { motion } from 'motion/react';
import { User } from '../lib/firebase';
import { Task } from '../types';
import { db, doc, handleFirestoreError, OperationType } from '../lib/firebase';
import { writeBatch } from 'firebase/firestore';
import { Bell, Globe, Shield, Trash2, AlertTriangle, ChevronRight, Moon, Sun } from 'lucide-react';
import { cn } from '../lib/utils';

interface SettingsViewProps {
  user:     User;
  tasks:    Task[];
  onLogout: () => void;
}

export default function SettingsView({ user, tasks, onLogout }: SettingsViewProps) {
  const [notifs,       setNotifs]       = useState(true);
  const [dailyRemind,  setDailyRemind]  = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);
  const [loading,      setLoading]      = useState(false);

  const deleteAllTasks = async () => {
    setLoading(true);
    try {
      const batch = writeBatch(db);
      tasks.forEach(t => batch.delete(doc(db, 'tasks', t.id)));
      await batch.commit();
      setConfirmClear(false);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, 'tasks');
    } finally {
      setLoading(false);
    }
  };

  const Toggle = ({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) => (
    <button
      onClick={() => onChange(!checked)}
      className={cn('relative w-12 h-6 rounded-full transition-colors', checked ? '' : 'bg-zinc-200')}
      style={checked ? { background: 'var(--color-accent)' } : {}}
    >
      <motion.div
        className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm"
        animate={{ left: checked ? 26 : 4 }}
        transition={{ type: 'spring', stiffness: 400, damping: 28 }}
      />
    </button>
  );

  const Section = ({ title, icon, children }: { title: string; icon: ReactNode; children: ReactNode }) => (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="card p-5">
      <h3 className="text-sm font-bold mb-4 flex items-center gap-2">
        <span className="text-zinc-500">{icon}</span> {title}
      </h3>
      <div className="space-y-3">{children}</div>
    </motion.div>
  );

  const Row = ({ label, description, right }: { label: string; description?: string; right: ReactNode }) => (
    <div className="flex items-center justify-between py-1">
      <div>
        <p className="text-sm font-medium">{label}</p>
        {description && <p className="text-xs text-zinc-500">{description}</p>}
      </div>
      {right}
    </div>
  );

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="text-xl font-extrabold mb-1">Paramètres</h2>
        <p className="text-sm text-zinc-500">Gère tes préférences et ton compte.</p>
      </motion.div>

      {/* Account */}
      <Section title="Compte" icon={<Shield className="w-4 h-4" />}>
        <Row
          label={user.displayName || 'Utilisateur'}
          description={user.email || undefined}
          right={
            <span className="text-xs font-semibold text-zinc-400 flex items-center gap-1">
              Google <ChevronRight className="w-3.5 h-3.5" />
            </span>
          }
        />
      </Section>

      {/* Notifications */}
      <Section title="Notifications" icon={<Bell className="w-4 h-4" />}>
        <Row label="Activer les notifications" description="Recevez des alertes pour vos tâches" right={<Toggle checked={notifs} onChange={setNotifs} />} />
        <Row label="Rappel quotidien" description="Un rappel chaque matin à 9h" right={<Toggle checked={dailyRemind} onChange={setDailyRemind} />} />
      </Section>

      {/* Language */}
      <Section title="Langue & Région" icon={<Globe className="w-4 h-4" />}>
        <Row
          label="Langue de l'interface"
          right={
            <select className="bg-zinc-50 border border-zinc-200 rounded-xl text-sm px-3 py-1.5 outline-none">
              <option value="fr">🇫🇷 Français</option>
              <option value="en">🇬🇧 English</option>
            </select>
          }
        />
      </Section>

      {/* Data */}
      <Section title="Données & Confidentialité" icon={<Trash2 className="w-4 h-4" />}>
        <Row
          label="Tâches enregistrées"
          description={`${tasks.length} tâche${tasks.length > 1 ? 's' : ''} en base`}
          right={
            !confirmClear ? (
              <button
                onClick={() => setConfirmClear(true)}
                className="text-xs font-semibold text-red-500 hover:text-red-700 px-3 py-1.5 rounded-xl hover:bg-red-50 transition-colors"
              >
                Tout effacer
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-xs text-red-500 font-medium flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" /> Confirmer ?
                </span>
                <button
                  onClick={deleteAllTasks}
                  disabled={loading}
                  className="text-xs font-bold text-white bg-red-500 hover:bg-red-600 px-3 py-1.5 rounded-xl disabled:opacity-50 transition-colors"
                >
                  {loading ? '...' : 'Oui, effacer'}
                </button>
                <button onClick={() => setConfirmClear(false)} className="text-xs text-zinc-500 hover:text-zinc-700 px-2 py-1.5">
                  Non
                </button>
              </div>
            )
          }
        />
      </Section>

      {/* Logout */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        onClick={onLogout}
        className="w-full py-3 rounded-2xl border-2 border-red-200 text-red-500 text-sm font-bold hover:bg-red-50 transition-colors"
      >
        Se déconnecter
      </motion.button>

      <p className="text-center text-[11px] text-zinc-400">TaskMaster Pro · v2.0 · Fabriqué avec ❤️</p>
    </div>
  );
}
