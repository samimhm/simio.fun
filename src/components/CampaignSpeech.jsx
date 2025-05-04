import { motion } from 'framer-motion';

const CampaignSpeech = () => {
  return (
    <section className="py-20 bg-white/70 backdrop-blur-sm">
      <div className="max-w-4xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <blockquote className="text-2xl md:text-3xl font-display italic text-gray-800 leading-relaxed">
            <p className="mb-6">
              "I won't offer reforms. I offer volatility."
            </p>
            <p className="mb-6">
              "I won't give hope. I give memes."
            </p>
            <p>
              "I won't tax. I just pump."
            </p>
          </blockquote>
        </motion.div>
      </div>
    </section>
  );
};

export default CampaignSpeech; 