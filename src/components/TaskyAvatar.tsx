import { motion } from 'motion/react';
import { TaskyLevel, TaskyMood } from '../types';

interface TaskyAvatarProps {
  level:        TaskyLevel;
  mood:         TaskyMood;
  size?:        number;
  celebrating?: boolean;
}

/* ── Duotone palette : Orange vif + Encre noire + Crème ─────────────────── */
const LEVEL_COLORS: Record<TaskyLevel, {
  body: string; belly: string; cheek: string; accent: string; outline: string;
}> = {
  1: { body: '#e8ddc8', belly: '#f2e8d4', cheek: '#ffb380', accent: '#7a5f44', outline: '#16100a' },
  2: { body: '#ff8040', belly: '#ffb380', cheek: '#ffd4a8', accent: '#16100a', outline: '#16100a' },
  3: { body: '#ff5300', belly: '#ff8040', cheek: '#ffb380', accent: '#16100a', outline: '#16100a' },
  4: { body: '#e04600', belly: '#ff5300', cheek: '#ff8040', accent: '#f2e8d4', outline: '#16100a' },
  5: { body: '#ff5300', belly: '#ffaa00', cheek: '#ffe080', accent: '#16100a', outline: '#16100a' },
};

/* ── Halftone dot pattern (risograph texture on body) ───────────────────── */
const HalftoneDots = ({ x, y, w, h, id }: { x: number; y: number; w: number; h: number; id: string }) => (
  <>
    <defs>
      <pattern id={id} x="0" y="0" width="5" height="5" patternUnits="userSpaceOnUse">
        <circle cx="2.5" cy="2.5" r="1" fill="rgba(22,16,10,0.12)" />
      </pattern>
    </defs>
    <ellipse cx={x} cy={y} rx={w} ry={h} fill={`url(#${id})`} />
  </>
);

/* ── Expressions par humeur ──────────────────────────────────────────────── */
function Eyes({ mood, colors }: { mood: TaskyMood; colors: typeof LEVEL_COLORS[1] }) {
  const L = { cx: 78, cy: 102 };
  const R = { cx: 122, cy: 102 };

  if (mood === 'sleeping') {
    return (
      <g>
        {/* Yeux fermés — lignes courbes */}
        <path d="M 68 106 Q 78 98 88 106" stroke={colors.outline} strokeWidth="3" fill="none" strokeLinecap="round" />
        <path d="M 112 106 Q 122 98 132 106" stroke={colors.outline} strokeWidth="3" fill="none" strokeLinecap="round" />
        {/* ZZZ en style rétro pixelisé */}
        <text x="140" y="78" fontSize="10" fontFamily="IBM Plex Mono" fontWeight="700" fill={colors.outline} opacity="0.6">z</text>
        <text x="150" y="66" fontSize="13" fontFamily="IBM Plex Mono" fontWeight="700" fill={colors.outline} opacity="0.4">z</text>
        <text x="162" y="52" fontSize="16" fontFamily="IBM Plex Mono" fontWeight="700" fill={colors.outline} opacity="0.25">z</text>
      </g>
    );
  }

  if (mood === 'bored') {
    return (
      <g>
        {/* Yeux mi-clos */}
        <ellipse cx={L.cx} cy={L.cy} rx="9" ry="7" fill="white" stroke={colors.outline} strokeWidth="2" />
        <ellipse cx={R.cx} cy={R.cy} rx="9" ry="7" fill="white" stroke={colors.outline} strokeWidth="2" />
        {/* Paupières tombantes */}
        <path d={`M ${L.cx - 9} ${L.cy - 2} Q ${L.cx} ${L.cy - 8} ${L.cx + 9} ${L.cy - 2}`} fill={colors.body} />
        <path d={`M ${R.cx - 9} ${R.cy - 2} Q ${R.cx} ${R.cy - 8} ${R.cx + 9} ${R.cy - 2}`} fill={colors.body} />
        <circle cx={L.cx + 1} cy={L.cy + 2} r="4" fill={colors.outline} />
        <circle cx={R.cx + 1} cy={R.cy + 2} r="4" fill={colors.outline} />
      </g>
    );
  }

  if (mood === 'excited' || mood === 'celebrating') {
    return (
      <g>
        {/* Étoiles à la place des yeux */}
        <text x="65"  y="112" fontSize="20" textAnchor="middle">★</text>
        <text x="135" y="112" fontSize="20" textAnchor="middle">★</text>
      </g>
    );
  }

  /* happy (défaut) */
  return (
    <g>
      <ellipse cx={L.cx} cy={L.cy} rx="10" ry="11" fill="white" stroke={colors.outline} strokeWidth="2" />
      <ellipse cx={R.cx} cy={R.cy} rx="10" ry="11" fill="white" stroke={colors.outline} strokeWidth="2" />
      <circle  cx={L.cx + 2} cy={L.cy + 1} r="5.5" fill={colors.outline} />
      <circle  cx={R.cx + 2} cy={R.cy + 1} r="5.5" fill={colors.outline} />
      {/* Reflet — catchlight */}
      <circle cx={L.cx + 6} cy={L.cy - 3} r="2" fill="white" />
      <circle cx={R.cx + 6} cy={R.cy - 3} r="2" fill="white" />
    </g>
  );
}

function Mouth({ mood, colors }: { mood: TaskyMood; colors: typeof LEVEL_COLORS[1] }) {
  if (mood === 'sleeping') return null;
  if (mood === 'bored') {
    return <line x1="88" y1="130" x2="112" y2="130" stroke={colors.outline} strokeWidth="2.5" strokeLinecap="round" />;
  }
  if (mood === 'excited' || mood === 'celebrating') {
    return (
      <path d="M 80 126 Q 100 148 120 126" stroke={colors.outline} strokeWidth="2.5" fill={colors.belly} strokeLinecap="round" />
    );
  }
  return <path d="M 87 128 Q 100 140 113 128" stroke={colors.outline} strokeWidth="2.5" fill="none" strokeLinecap="round" />;
}

/* ── Accessoires par niveau ──────────────────────────────────────────────── */
function Accessories({ level, colors }: { level: TaskyLevel; colors: typeof LEVEL_COLORS[1] }) {
  if (level === 1) return null;

  if (level === 2) {
    return (
      <g>
        {/* Petite pousse — tige + 2 feuilles */}
        <line x1="100" y1="52" x2="100" y2="28" stroke={colors.outline} strokeWidth="2.5" strokeLinecap="round" />
        <ellipse cx="91"  cy="22" rx="9"  ry="6" fill={colors.body}  stroke={colors.outline} strokeWidth="2" transform="rotate(-30 91 22)" />
        <ellipse cx="109" cy="19" rx="9"  ry="6" fill={colors.belly} stroke={colors.outline} strokeWidth="2" transform="rotate(30 109 19)" />
      </g>
    );
  }

  if (level === 3) {
    return (
      <g>
        {/* Oreilles pointues style arcade */}
        <polygon points="50,75 34,44 66,62" fill={colors.body}   stroke={colors.outline} strokeWidth="2" strokeLinejoin="round" />
        <polygon points="150,75 166,44 134,62" fill={colors.body} stroke={colors.outline} strokeWidth="2" strokeLinejoin="round" />
        <polygon points="52,73 40,52 64,64" fill={colors.cheek} opacity="0.6" />
        <polygon points="148,73 160,52 136,64" fill={colors.cheek} opacity="0.6" />
        {/* Bandana explorateur */}
        <path d="M 58 145 Q 100 157 142 145 L 138 162 L 100 168 L 62 162 Z" fill={colors.outline} />
        <path d="M 58 145 Q 100 152 142 145" stroke={colors.outline} fill="none" strokeWidth="0" />
        {/* Motif sur le bandana */}
        <line x1="78" y1="155" x2="122" y2="155" stroke={colors.cheek} strokeWidth="1.5" strokeDasharray="4 3" />
      </g>
    );
  }

  if (level === 4) {
    return (
      <g>
        {/* Ailes — style rétro */}
        <path d="M 38 118 C 8 92, 5 128, 26 144 C 30 146, 36 136, 38 130 Z"
          fill={colors.body} stroke={colors.outline} strokeWidth="2" strokeLinejoin="round" />
        <path d="M 38 118 C 14 110, 10 120, 26 144 Z" fill={colors.belly} opacity="0.7" />
        <path d="M 162 118 C 192 92, 195 128, 174 144 C 170 146, 164 136, 162 130 Z"
          fill={colors.body} stroke={colors.outline} strokeWidth="2" strokeLinejoin="round" />
        <path d="M 162 118 C 186 110, 190 120, 174 144 Z" fill={colors.belly} opacity="0.7" />
        {/* Badge étoile sur le torse */}
        <polygon points="100,152 104,163 116,163 107,170 110,182 100,176 90,182 93,170 84,163 96,163"
          fill={colors.body} stroke={colors.outline} strokeWidth="2" />
        <text x="100" y="172" textAnchor="middle" fontSize="8" fill={colors.outline} fontWeight="900">★</text>
      </g>
    );
  }

  if (level === 5) {
    return (
      <g>
        {/* Couronne isométrique */}
        <path d="M 68 62 L 68 38 L 85 54 L 100 30 L 115 54 L 132 38 L 132 62 Z"
          fill={colors.cheek} stroke={colors.outline} strokeWidth="2.5" strokeLinejoin="round" />
        {/* Gemmes */}
        <circle cx="100" cy="30" r="5.5" fill="#ff3030" stroke={colors.outline} strokeWidth="1.5" />
        <circle cx="68"  cy="38" r="4"   fill="#3080ff" stroke={colors.outline} strokeWidth="1.5" />
        <circle cx="132" cy="38" r="4"   fill="#30cc60" stroke={colors.outline} strokeWidth="1.5" />
        {/* Motif trame sur la couronne */}
        <path d="M 68 62 L 68 38 L 85 54 L 100 30 L 115 54 L 132 38 L 132 62 Z"
          fill="url(#crownDots)" opacity="0.4" />
        <defs>
          <pattern id="crownDots" x="0" y="0" width="4" height="4" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="0.8" fill={colors.outline} />
          </pattern>
        </defs>
        {/* Étoiles flottantes animées */}
        <motion.text x="18"  y="82"  fontSize="14" animate={{ opacity: [0.3,1,0.3], y: [82,72,82]   }} transition={{ duration: 2,   repeat: Infinity, ease: 'easeInOut' }}>✦</motion.text>
        <motion.text x="158" y="92"  fontSize="12" animate={{ opacity: [0.3,1,0.3], y: [92,82,92]   }} transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}>✦</motion.text>
        <motion.text x="28"  y="155" fontSize="10" animate={{ opacity: [0.3,1,0.3], y: [155,145,155] }} transition={{ duration: 3,   repeat: Infinity, ease: 'easeInOut', delay: 1 }}>★</motion.text>
        {/* Aura halo */}
        <ellipse cx="100" cy="130" rx="80" ry="72"
          fill="none" stroke={colors.cheek} strokeWidth="2" opacity="0.3" strokeDasharray="8 5" />
      </g>
    );
  }

  return null;
}

/* ── Composant principal ─────────────────────────────────────────────────── */
export default function TaskyAvatar({ level, mood, size = 200, celebrating = false }: TaskyAvatarProps) {
  const colors  = LEVEL_COLORS[level];
  const vbH     = 230;

  const floatAnim = {
    y:      celebrating ? [0, -22, 0, -12, 0] : [0, -8, 0],
    rotate: celebrating ? [-6, 6, -4, 4, 0]   : [0, 0, 0],
  };
  const floatTransition = {
    duration:   celebrating ? 0.9 : 3.2,
    repeat:     Infinity,
    ease:       'easeInOut' as const,
    repeatType: 'loop' as const,
  };

  const bodyRx = 53 + level * 3;
  const bodyRy = 60 + level * 2;

  return (
    <div style={{ width: size, height: size * 1.18 }} className="relative flex items-center justify-center">
      {/* Anneau pulsant pour niveaux élevés */}
      {level >= 4 && (
        <div
          className="tasky-ring absolute rounded-full"
          style={{
            width: size * 0.65, height: size * 0.65,
            border: `2px solid ${colors.body}`,
            top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
            opacity: 0.5,
          }}
        />
      )}

      <motion.svg
        viewBox={`0 0 200 ${vbH}`}
        width={size}
        height={size * 1.18}
        className={level === 5 ? 'tasky-glow' : ''}
        animate={floatAnim}
        transition={floatTransition}
      >
        {/* Ombre au sol */}
        <ellipse cx="100" cy="222" rx="50" ry="8" fill={colors.outline} opacity="0.12" />

        {/* Corps principal */}
        <ellipse cx="100" cy="128" rx={bodyRx} ry={bodyRy} fill={colors.body} stroke={colors.outline} strokeWidth="2.5" />

        {/* Texture halftone sur le corps */}
        <HalftoneDots x={100} y={128} w={bodyRx - 8} h={bodyRy - 8} id={`ht-l${level}`} />

        {/* Ventre clair */}
        <ellipse cx="100" cy="138" rx={bodyRx - 22} ry={bodyRy - 18} fill={colors.belly} opacity="0.7" />

        {/* Joues */}
        <ellipse cx="68"  cy="122" rx="13" ry="9" fill={colors.cheek} opacity="0.35" />
        <ellipse cx="132" cy="122" rx="13" ry="9" fill={colors.cheek} opacity="0.35" />

        {/* Yeux */}
        <Eyes mood={mood} colors={colors} />

        {/* Bouche */}
        <Mouth mood={mood} colors={colors} />

        {/* Contour épais (bold linework) — redessiné par dessus */}
        <ellipse cx="100" cy="128" rx={bodyRx} ry={bodyRy}
          fill="none" stroke={colors.outline} strokeWidth="2.5" />

        {/* Accessoires de niveau */}
        <Accessories level={level} colors={colors} />

        {/* Brillance corps */}
        <ellipse cx="78" cy="92" rx="11" ry="7" fill="white" opacity="0.18" transform="rotate(-20 78 92)" />
      </motion.svg>

      {/* Particules de célébration */}
      {celebrating && (
        <motion.div className="absolute inset-0 pointer-events-none" initial={{ opacity: 0 }} animate={{ opacity: [0, 1, 0] }} transition={{ duration: 1.5 }}>
          {['★', '✦', '!', '♪'].map((s, i) => (
            <motion.span
              key={i}
              className="absolute font-mono font-bold text-xl"
              style={{ left: `${15 + i * 22}%`, top: '8%', color: ['#ff5300','#ffaa00','#ff5300','#16100a'][i] }}
              animate={{ y: [-10, -50], opacity: [1, 0] }}
              transition={{ duration: 0.9, delay: i * 0.15 }}
            >
              {s}
            </motion.span>
          ))}
        </motion.div>
      )}
    </div>
  );
}
