import { motion } from 'motion/react';
import { Users, UserPlus, Lock, Zap, BarChart2, MessageCircle } from 'lucide-react';

export default function TeamView() {
  const features = [
    { icon: <Users className="w-5 h-5" />,       title: 'Espace partagé',         desc: 'Gérez les tâches de toute votre équipe dans un tableau de bord unifié.' },
    { icon: <Zap className="w-5 h-5" />,          title: 'Tasky de groupe',         desc: 'Un Tasky commun qui évolue avec les succès collectifs de l\'équipe.' },
    { icon: <BarChart2 className="w-5 h-5" />,    title: 'Stats d\'équipe',         desc: 'Visualisez la productivité, les tendances et les points forts de chacun.' },
    { icon: <MessageCircle className="w-5 h-5" />, title: 'Commentaires',           desc: 'Discutez directement sur les tâches pour garder le contexte.' },
    { icon: <Lock className="w-5 h-5" />,         title: 'Rôles & permissions',    desc: 'Définissez qui peut créer, modifier ou supprimer des tâches.' },
    { icon: <UserPlus className="w-5 h-5" />,     title: 'Invitations par lien',    desc: 'Invitez des membres en un clic avec un lien sécurisé.' },
  ];

  const fakeTeam = [
    { name: 'Sophie M.', role: 'Admin', tasks: 24, xp: 1240, level: 5, avatar: 'SM' },
    { name: 'Lucas D.',  role: 'Membre', tasks: 18, xp: 860, level: 4, avatar: 'LD' },
    { name: 'Emma K.',   role: 'Membre', tasks: 15, xp: 620, level: 4, avatar: 'EK' },
    { name: 'Théo B.',   role: 'Invité',  tasks: 7,  xp: 190, level: 2, avatar: 'TB' },
  ];

  const levelColors = ['#94a3b8', '#4ade80', '#38bdf8', '#c084fc', '#fbbf24'];

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="text-xl font-extrabold mb-1">Équipe</h2>
        <p className="text-sm text-zinc-500">Collaborez ensemble et faites évoluer votre Tasky collectif !</p>
      </motion.div>

      {/* Coming soon hero */}
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="card p-8 text-center"
        style={{ background: 'linear-gradient(135deg, #faf5ff, #eff6ff)' }}
      >
        <div className="text-5xl mb-4">👥</div>
        <div className="inline-flex items-center gap-2 bg-violet-100 text-violet-700 text-xs font-bold px-3 py-1.5 rounded-full mb-3">
          <Zap className="w-3.5 h-3.5" /> Bientôt disponible
        </div>
        <h3 className="text-lg font-extrabold mb-2">Mode Équipe en cours de développement</h3>
        <p className="text-sm text-zinc-600 max-w-sm mx-auto mb-5">
          Gérez vos projets avec votre équipe, partagez un Tasky collectif et montez de niveau ensemble !
        </p>
        <button
          className="btn-accent mx-auto flex items-center gap-2"
          onClick={() => alert('Vous serez notifié dès le lancement !')}
        >
          <UserPlus className="w-4 h-4" /> Rejoindre la liste d'attente
        </button>
      </motion.div>

      {/* Feature grid */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="card p-5">
        <h3 className="text-sm font-bold mb-4">Ce qui vous attend 🚀</h3>
        <div className="grid sm:grid-cols-2 gap-3">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.25 + i * 0.05 }}
              className="flex items-start gap-3 p-3 rounded-xl bg-zinc-50 hover:bg-zinc-100 transition-colors"
            >
              <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center shrink-0 shadow-sm text-zinc-600">
                {f.icon}
              </div>
              <div>
                <p className="text-sm font-semibold">{f.title}</p>
                <p className="text-xs text-zinc-500 leading-relaxed">{f.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Mock leaderboard */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="card p-5">
        <h3 className="text-sm font-bold mb-4">Aperçu du classement d'équipe</h3>
        <div className="space-y-2.5">
          {fakeTeam.map((member, i) => (
            <div key={member.name} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-zinc-50 transition-colors">
              <span className="text-sm font-bold text-zinc-400 w-5 text-center">{i + 1}</span>
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-bold shrink-0"
                style={{ background: levelColors[member.level - 1] || '#94a3b8' }}
              >
                {member.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold">{member.name}</p>
                <p className="text-[10px] text-zinc-400">{member.role} · Niv. {member.level}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold">{member.xp} XP</p>
                <p className="text-[10px] text-zinc-400">{member.tasks} tâches</p>
              </div>
              {i === 0 && <span className="text-lg">👑</span>}
            </div>
          ))}
        </div>
        <p className="text-center text-[10px] text-zinc-400 mt-3 italic">* Données de démonstration</p>
      </motion.div>
    </div>
  );
}
