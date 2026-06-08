import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface OnboardingModalProps {
  onClose: () => void;
}

export default function OnboardingModal({ onClose }: OnboardingModalProps) {
  const [step, setStep] = useState(0);

  const steps = [
    {
      emoji: '🎮',
      title: 'BIENVENUE !',
      desc: 'Ton compagnon de productivité.',
      body: 'Crée des tâches, gagne des XP et fais évoluer Tasky jusqu\'au niveau Légende !',
    },
    {
      emoji: null, // use levels row
      title: 'FAIS ÉVOLUER TASKY',
      desc: '🥚 → 🌱 → 🦊 → ⚔️ → 👑',
      body: 'Chaque tâche terminée rapporte des XP. Plus la priorité est haute, plus tu gagnes de points !',
    },
    {
      emoji: '★',
      title: "C'EST PARTI !",
      desc: 'Tu es prêt.',
      body: 'Crée ta première tâche et commence à nourrir Tasky dès maintenant.',
    },
  ];

  const current = steps[step];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="absolute inset-0"
        style={{ background: 'rgba(22,16,10,0.85)' }}
      />
      <motion.div
        initial={{ scale: 0.85, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        className="relative w-full max-w-sm text-center p-8"
        style={{
          background: 'var(--paper-light)',
          border: 'var(--r-border)',
          borderRadius: 'var(--r-radius)',
          boxShadow: 'var(--r-shadow-lg)',
        }}
      >
        {/* Orange header bar */}
        <div
          className="absolute top-0 left-0 right-0 h-2"
          style={{ background: 'var(--orange)', borderBottom: 'var(--r-border)' }}
        />

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="space-y-4 mt-2"
          >
            <div style={{ fontSize: step === 1 ? '1.5rem' : '3.5rem', lineHeight: 1 }}>
              {step === 1 ? current.desc : current.emoji}
            </div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', color: 'var(--ink)', letterSpacing: '0.04em' }}>
              {current.title}
            </h2>
            {step !== 1 && (
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: 'var(--orange)', letterSpacing: '0.06em' }}>
                {current.desc.toUpperCase()}
              </p>
            )}
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.85rem', color: 'var(--ink-mid)', lineHeight: 1.6 }}>
              {current.body}
            </p>
          </motion.div>
        </AnimatePresence>

        {/* Progress dots */}
        <div className="flex justify-center gap-2 my-6">
          {steps.map((_, i) => (
            <div
              key={i}
              style={{
                width: i === step ? 20 : 8,
                height: 8,
                background: i === step ? 'var(--orange)' : 'var(--paper-dark)',
                border: 'var(--r-border)',
                borderRadius: 'var(--r-radius)',
                transition: 'all 0.3s',
              }}
            />
          ))}
        </div>

        {/* Button */}
        {step < 2 ? (
          <button
            onClick={() => setStep(s => s + 1)}
            className="btn-accent w-full"
          >
            SUIVANT →
          </button>
        ) : (
          <button onClick={onClose} className="btn-accent w-full">
            COMMENCER ★
          </button>
        )}
      </motion.div>
    </div>
  );
}
