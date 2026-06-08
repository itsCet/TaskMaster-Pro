import { motion } from 'motion/react';
import { Theme, THEME_CONFIG } from '../types';
import { Check, Palette } from 'lucide-react';
import { cn } from '../lib/utils';

interface StyleViewProps {
  currentTheme: Theme;
  onTheme:      (t: Theme) => void;
  darkMode:     boolean;
  onDarkMode:   (v: boolean) => void;
  compact:      boolean;
  onCompact:    (v: boolean) => void;
}

export default function StyleView({ currentTheme, onTheme, darkMode, onDarkMode, compact, onCompact }: StyleViewProps) {
  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="text-xl font-extrabold mb-1">Style & Apparence</h2>
        <p className="text-sm text-zinc-500">Personnalise l'interface selon tes préférences.</p>
      </motion.div>

      {/* ── Color themes ── */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card p-5">
        <h3 className="text-sm font-bold mb-4 flex items-center gap-2">
          <Palette className="w-4 h-4 text-zinc-500" /> Couleur principale
        </h3>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {(Object.entries(THEME_CONFIG) as [Theme, typeof THEME_CONFIG[Theme]][]).map(([key, cfg]) => (
            <button
              key={key}
              onClick={() => onTheme(key)}
              className={cn(
                'relative flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-all hover:scale-105',
                currentTheme === key ? 'border-zinc-900 shadow-md' : 'border-transparent hover:border-zinc-200'
              )}
            >
              {/* Color swatch */}
              <div
                className="w-10 h-10 rounded-xl shadow-md"
                style={{ background: cfg.primary }}
              />
              <span className="text-[10px] font-semibold text-zinc-600 text-center leading-tight">{cfg.label}</span>
              {currentTheme === key && (
                <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-zinc-900 flex items-center justify-center">
                  <Check className="w-2.5 h-2.5 text-white" />
                </div>
              )}
            </button>
          ))}
        </div>
      </motion.div>

      {/* ── Display options ── */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="card p-5 space-y-4">
        <h3 className="text-sm font-bold">Affichage</h3>

        {[
          {
            label: 'Mode sombre',
            description: 'Interface sombre pour le soir',
            emoji: darkMode ? '🌙' : '☀️',
            checked: darkMode,
            onChange: onDarkMode,
          },
          {
            label: 'Mode compact',
            description: 'Réduire les marges et espacements',
            emoji: '🗜️',
            checked: compact,
            onChange: onCompact,
          },
        ].map(opt => (
          <div key={opt.label} className="flex items-center justify-between py-2">
            <div className="flex items-center gap-3">
              <span className="text-xl">{opt.emoji}</span>
              <div>
                <p className="text-sm font-semibold">{opt.label}</p>
                <p className="text-xs text-zinc-500">{opt.description}</p>
              </div>
            </div>
            <button
              onClick={() => opt.onChange(!opt.checked)}
              className={cn(
                'relative w-12 h-6 rounded-full transition-colors',
                opt.checked ? 'bg-zinc-900' : 'bg-zinc-200'
              )}
              style={opt.checked ? { background: 'var(--color-accent)' } : {}}
            >
              <motion.div
                className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm"
                animate={{ left: opt.checked ? 26 : 4 }}
                transition={{ type: 'spring', stiffness: 400, damping: 28 }}
              />
            </button>
          </div>
        ))}
      </motion.div>

      {/* ── Preview ── */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="card p-5">
        <h3 className="text-sm font-bold mb-3">Aperçu</h3>
        <div className="space-y-3">
          <div className="flex gap-2">
            <button className="btn-accent">Bouton principal</button>
            <button className="btn-secondary">Secondaire</button>
          </div>
          <div className="xp-bar">
            <div className="xp-bar-fill" style={{ width: '65%' }} />
          </div>
          <div className="flex gap-2">
            {['Basse', 'Moyenne', 'Haute', 'Urgente'].map((l, i) => (
              <span key={l} className={cn('text-[10px] font-semibold px-2 py-1 rounded-lg border', [
                'bg-blue-100 text-blue-700 border-blue-200',
                'bg-yellow-100 text-yellow-700 border-yellow-200',
                'bg-orange-100 text-orange-700 border-orange-200',
                'bg-red-100 text-red-700 border-red-200',
              ][i])}>
                {l}
              </span>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
