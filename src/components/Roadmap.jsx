import { motion } from 'framer-motion';
import { FlagIcon, MegaphoneIcon, ScaleIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';

const Roadmap = () => {
  const stages = [
    {
      icon: FlagIcon,
      title: "Entry into the race",
      description: "Launching our campaign with a bang and a meme"
    },
    {
      icon: MegaphoneIcon,
      title: "The campaign trail",
      description: "Spreading the word through the power of memes"
    },
    {
      icon: ScaleIcon,
      title: "Runoff hype",
      description: "Building momentum through community engagement"
    },
    {
      icon: ShieldCheckIcon,
      title: "On-chain governance",
      description: "Decentralized decision making through memes"
    }
  ];

  return (
    <section className="py-20">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="section-title">Government Program</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stages.map((stage, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow"
            >
              <div className="w-12 h-12 bg-romanian-blue bg-opacity-10 rounded-lg flex items-center justify-center mb-4">
                <stage.icon className="w-6 h-6 text-romanian-blue" />
              </div>
              <h3 className="text-xl font-bold mb-2">{stage.title}</h3>
              <p className="text-gray-600">{stage.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Roadmap; 