import { motion } from 'motion/react';
import { TaskyLevel, TaskyMood } from '../types';

interface TaskyAvatarProps {
  level: TaskyLevel;
  mood:  TaskyMood;
  size?: number;
  /** Whether to play the level-up celebration */
  celebrating?: boolean;
}

// ── Color palette per level ───────────────────────────────────────────────────
const LEVEL_COLORS: Record<TaskyLevel, { body: string; belly: string; cheek: string; accent: string }> = {
  1: { body: '#cbd5e1', belly: '#e2e8f0', cheek: '#f1a1b5', accent: '#94a3b8' },
  2: { body: '#4ade80', belly: '#86efac', cheek: '#f9a8d4', accent: '#16a34a' },
  3: { body: '#38bdf8', belly: '#7dd3fc', cheek: '#f9a8d4', accent: '#0284c7' },
  4: { body: '#c084fc', belly: '#ddd6fe', cheek: '#f9a8d4', accent: '#7c3aed' },
  5: { body: '#fbbf24', belly: '#fde68a', cheek: '#fca5a5', accent: '#d97706' },
};

// ── Eyes by mood ─────────────────────────────────────────────────────────────
function Eyes({ mood, colors }: { mood: TaskyMood; colors: typeof LEVEL_COLORS[1] }) {
  const eyeLeft  = { cx: 78, cy: 102 };
  const eyeRight = { cx: 122, cy: 102 };

  if (mood === 'sleeping') {
    return (
      <g>
        {/* Closed curved eyes */}
        <path d="M 70 104 Q 78 97 86 104" stroke={colors.accent} strokeWidth="2.5" fill="none" strokeLinecap="round" />
        <path d="M 114 104 Q 122 97 130 104" stroke={colors.accent} strokeWidth="2.5" fill="none" strokeLinecap="round" />
        {/* ZZZ */}
        <text x="140" y="72" fontSize="10" fill={colors.accent} fontWeight="bold" opacity="0.7">z</text>
        <text x="148" y="62" fontSize="13" fill={colors.accent} fontWeight="bold" opacity="0.5">z</text>
        <text x="158" y="50" fontSize="16" fill={colors.accent} fontWeight="bold" opacity="0.3">z</text>
      </g>
    );
  }
  if (mood === 'bored') {
    return (
      <g>
        {/* Half-closed eyes */}
        <ellipse cx={eyeLeft.cx}  cy={eyeLeft.cy}  rx="9" ry="6" fill="white" />
        <ellipse cx={eyeRight.cx} cy={eyeRight.cy} rx="9" ry="6" fill="white" />
        {/* Droopy eyelids */}
        <path d={`M ${eyeLeft.cx - 9} ${eyeLeft.cy - 1} Q ${eyeLeft.cx} ${eyeLeft.cy - 7} ${eyeLeft.cx + 9} ${eyeLeft.cy - 1}`} fill={colors.body} />
        <path d={`M ${eyeRight.cx - 9} ${eyeRight.cy - 1} Q ${eyeRight.cx} ${eyeRight.cy - 7} ${eyeRight.cx + 9} ${eyeRight.cy - 1}`} fill={colors.body} />
        {/* Pupils */}
        <circle cx={eyeLeft.cx + 1}  cy={eyeLeft.cy + 1}  r="4" fill="#1e293b" />
        <circle cx={eyeRight.cx + 1} cy={eyeRight.cy + 1} r="4" fill="#1e293b" />
      </g>
    );
  }
  if (mood === 'excited' || mood === 'celebrating') {
    return (
      <g>
        {/* Star-shaped eyes */}
        <text x="68"  y="110" fontSize="18" textAnchor="middle">⭐</text>
        <text x="132" y="110" fontSize="18" textAnchor="middle">⭐</text>
      </g>
    );
  }
  // happy / default
  return (
    <g>
      <ellipse cx={eyeLeft.cx}  cy={eyeLeft.cy}  rx="9" ry="10" fill="white" />
      <ellipse cx={eyeRight.cx} cy={eyeRight.cy} rx="9" ry="10" fill="white" />
      <circle  cx={eyeLeft.cx + 2}  cy={eyeLeft.cy + 1}  r="5" fill="#1e293b" />
      <circle  cx={eyeRight.cx + 2} cy={eyeRight.cy + 1} r="5" fill="#1e293b" />
      {/* Catchlight */}
      <circle cx={eyeLeft.cx + 5}  cy={eyeLeft.cy - 3}  r="1.5" fill="white" />
      <circle cx={eyeRight.cx + 5} cy={eyeRight.cy - 3} r="1.5" fill="white" />
    </g>
  );
}

// ── Mouth by mood ─────────────────────────────────────────────────────────────
function Mouth({ mood, colors }: { mood: TaskyMood; colors: typeof LEVEL_COLORS[1] }) {
  if (mood === 'sleeping') return null;
  if (mood === 'bored') {
    return <path d="M 88 128 L 112 128" stroke={colors.accent} strokeWidth="2" strokeLinecap="round" />;
  }
  if (mood === 'excited' || mood === 'celebrating') {
    return (
      <g>
        <path d="M 82 124 Q 100 142 118 124" stroke={colors.accent} strokeWidth="2.5" fill={colors.belly} strokeLinecap="round" />
      </g>
    );
  }
  return <path d="M 88 126 Q 100 136 112 126" stroke={colors.accent} strokeWidth="2" fill="none" strokeLinecap="round" />;
}

// ── Level accessories ─────────────────────────────────────────────────────────
function Accessories({ level, colors }: { level: TaskyLevel; colors: typeof LEVEL_COLORS[1] }) {
  if (level === 1) return null;

  if (level === 2) {
    return (
      <g>
        {/* Tiny sprout on top */}
        <line x1="100" y1="50" x2="100" y2="28" stroke={colors.accent} strokeWidth="2" />
        <ellipse cx="93"  cy="22" rx="8"  ry="6" fill={colors.body}   transform="rotate(-30 93 22)" />
        <ellipse cx="107" cy="20" rx="8"  ry="6" fill={colors.accent} transform="rotate(30 107 20)" />
      </g>
    );
  }

  if (level === 3) {
    return (
      <g>
        {/* Pointed ears */}
        <polygon points="52,72 38,45 68,62" fill={colors.body} />
        <polygon points="148,72 162,45 132,62" fill={colors.body} />
        <polygon points="54,70 43,52 66,64" fill={colors.cheek} opacity="0.5" />
        <polygon points="146,70 157,52 134,64" fill={colors.cheek} opacity="0.5" />
        {/* Small explorer scarf */}
        <path d="M 60 148 Q 100 155 140 148 Q 135 165 125 160 L 100 168 L 75 160 Q 65 165 60 148 Z" fill={colors.accent} opacity="0.8" />
      </g>
    );
  }

  if (level === 4) {
    return (
      <g>
        {/* Wings */}
        <path d="M 40 115 C 10 90, 8 125, 28 140 C 28 140 35 130 40 130 Z" fill={colors.accent} opacity="0.75" />
        <path d="M 40 115 C 15 108, 12 118, 28 140 Z" fill={colors.belly} opacity="0.6" />
        <path d="M 160 115 C 190 90, 192 125, 172 140 C 172 140 165 130 160 130 Z" fill={colors.accent} opacity="0.75" />
        <path d="M 160 115 C 185 108, 188 118, 172 140 Z" fill={colors.belly} opacity="0.6" />
        {/* Star badge on chest */}
        <polygon points="100,150 104,162 116,162 107,170 110,182 100,175 90,182 93,170 84,162 96,162" fill={colors.accent} />
        <polygon points="100,154 103,163 112,163 105,168 108,177 100,172 92,177 95,168 88,163 97,163" fill={colors.belly} />
      </g>
    );
  }

  if (level === 5) {
    return (
      <g>
        {/* Crown */}
        <path d="M 70 60 L 70 38 L 85 52 L 100 32 L 115 52 L 130 38 L 130 60 Z" fill="#fbbf24" stroke="#d97706" strokeWidth="1.5" />
        <circle cx="100" cy="32" r="5" fill="#ef4444" />
        <circle cx="70"  cy="38" r="4" fill="#3b82f6" />
        <circle cx="130" cy="38" r="4" fill="#22c55e" />
        {/* Floating stars */}
        <motion.text x="20"  y="80" fontSize="14" animate={{ opacity: [0.3,1,0.3], y: [80,70,80] }} transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}>✨</motion.text>
        <motion.text x="155" y="90" fontSize="12" animate={{ opacity: [0.3,1,0.3], y: [90,80,90] }} transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}>⭐</motion.text>
        <motion.text x="30"  y="150" fontSize="10" animate={{ opacity: [0.3,1,0.3], y: [150,140,150] }} transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 1 }}>✨</motion.text>
        {/* Sparkle aura */}
        <ellipse cx="100" cy="130" rx="80" ry="72" fill="none" stroke={colors.body} strokeWidth="1" opacity="0.3" strokeDasharray="6 4" />
      </g>
    );
  }

  return null;
}

// ── Main avatar component ─────────────────────────────────────────────────────
export default function TaskyAvatar({ level, mood, size = 200, celebrating = false }: TaskyAvatarProps) {
  const colors   = LEVEL_COLORS[level];
  const viewSize = 200;
  const scale    = size / viewSize;

  const floatAnimation = {
    y: celebrating ? [0, -20, 0, -10, 0] : [0, -7, 0],
    rotate: celebrating ? [-5, 5, -3, 3, 0] : [0, 0, 0],
  };
  const floatTransition = {
    duration:   celebrating ? 0.8 : 3,
    repeat:     Infinity,
    ease:       'easeInOut' as const,
    repeatType: 'loop' as const,
  };

  return (
    <div style={{ width: size, height: size * 1.15 }} className="relative flex items-center justify-center">
      {/* Glow ring for high levels */}
      {(level >= 4) && (
        <div
          className="tasky-ring absolute rounded-full"
          style={{
            width:  size * 0.7,
            height: size * 0.7,
            border: `2px solid ${colors.body}`,
            top:    '50%',
            left:   '50%',
            transform: 'translate(-50%, -50%)',
            opacity: 0.4,
          }}
        />
      )}

      <motion.svg
        viewBox={`0 0 ${viewSize} ${viewSize * 1.15}`}
        width={size}
        height={size * 1.15}
        className={level === 5 ? 'tasky-glow' : ''}
        animate={floatAnimation}
        transition={floatTransition}
      >
        {/* Shadow on ground */}
        <ellipse cx="100" cy="215" rx="48" ry="8" fill="#0001" />

        {/* Body */}
        <ellipse
          cx="100" cy="128"
          rx={54 + level * 3}
          ry={58 + level * 2}
          fill={colors.body}
        />
        {/* Belly highlight */}
        <ellipse cx="100" cy="138" rx={32 + level * 2} ry={36 + level} fill={colors.belly} opacity="0.6" />

        {/* Cheeks */}
        <ellipse cx="68"  cy="120" rx="12" ry="8" fill={colors.cheek} opacity="0.4" />
        <ellipse cx="132" cy="120" rx="12" ry="8" fill={colors.cheek} opacity="0.4" />

        {/* Eyes */}
        <Eyes  mood={mood} colors={colors} />

        {/* Mouth */}
        <Mouth mood={mood} colors={colors} />

        {/* Level accessories (drawn on top) */}
        <Accessories level={level} colors={colors} />

        {/* Shine on body */}
        <ellipse cx="78" cy="90" rx="10" ry="7" fill="white" opacity="0.2" transform="rotate(-20 78 90)" />
      </motion.svg>

      {/* Celebration particles */}
      {celebrating && (
        <motion.div
          className="absolute inset-0 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 0] }}
          transition={{ duration: 1.5 }}
        >
          {['🎉', '⭐', '✨', '🎊'].map((emoji, i) => (
            <motion.span
              key={i}
              className="absolute text-xl"
              style={{ left: `${20 + i * 20}%`, top: '10%' }}
              animate={{ y: [-10, -40], opacity: [1, 0] }}
              transition={{ duration: 1, delay: i * 0.15 }}
            >
              {emoji}
            </motion.span>
          ))}
        </motion.div>
      )}
    </div>
  );
}
