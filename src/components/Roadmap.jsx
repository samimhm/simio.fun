import { motion } from 'framer-motion';
import { FlagIcon, MegaphoneIcon, ScaleIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';

const Roadmap = () => {
  const stages = [
    {
      icon: FlagIcon,
      title: "Entry into the race",
      description: "Launching our campaign with a bang and a meme",
      emoji: "🏁",
      meme: "Guaranteed to change nothing!"
    },
    {
      icon: MegaphoneIcon,
      title: "The campaign trail",
      description: "Spreading the word through the power of memes",
      emoji: "📢",
      meme: "More memes, less promises!"
    },
    {
      icon: ScaleIcon,
      title: "Runoff hype",
      description: "Building momentum through community engagement",
      emoji: "⚖️",
      meme: "Democracy, but make it meme!"
    },
    {
      icon: ShieldCheckIcon,
      title: "On-chain governance",
      description: "Decentralized decision making through memes",
      emoji: "🛡️",
      meme: "Blockchain solves everything!"
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-yellow-50 via-white to-blue-50 relative">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="section-title flex items-center justify-center gap-2">
          Government Program <span className="text-2xl">🗳️</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stages.map((stage, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="relative bg-white/90 p-6 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-200 group cursor-pointer border border-yellow-100"
              whileHover={{ y: -6, scale: 1.03 }}
            >
              {/* Badge/emoji */}
              <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-yellow-200 text-lg rounded-full px-3 py-1 shadow font-bold border border-yellow-300">
                {stage.emoji}
              </span>
              <h3 className="text-lg font-semibold mb-2 mt-6">{stage.title}</h3>
              <p className="text-gray-600 italic">{stage.description}</p>
              <span className="hidden group-hover:block text-xs text-romanian-blue mt-2 text-center w-full">
                {stage.meme}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
      {/* Bandă tricoloră SVG la finalul secțiunii */}
      <div className="absolute left-0 right-0 -bottom-2 h-3 w-full">
        <svg width="100%" height="100%" viewBox="0 0 100 3" preserveAspectRatio="none" className="w-full h-full">
          <rect x="0" y="0" width="33.33" height="3" fill="#0057b7" />
          <rect x="33.33" y="0" width="33.33" height="3" fill="#ffd600" />
          <rect x="66.66" y="0" width="33.34" height="3" fill="#e63946" />
        </svg>
      </div>
    </section>
  );
};

export default Roadmap; 