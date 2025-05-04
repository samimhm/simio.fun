import { motion } from 'framer-motion';
import { ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';

const Dao = () => {
  return (
    <section className="py-20 bg-white/70 backdrop-blur-sm">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <div className="w-16 h-16 bg-romanian-blue bg-opacity-10 rounded-full flex items-center justify-center mb-6 mx-auto">
            <ChatBubbleLeftRightIcon className="w-8 h-8 text-romanian-blue" />
          </div>
          
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-6">
            People's Parliament
          </h2>
          
          <p className="text-xl text-gray-600 mb-8">
            Join the SIMIO Monastery (Telegram)
          </p>
          
          <p className="text-lg text-gray-500 italic">
            Vote on memes. Change nothing. Enjoy the illusion of power.
          </p>
          
          <motion.a
            href="https://t.me/+hqCsvBRbC4QwMjc0"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary mt-8 inline-block"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Join the Monastery
          </motion.a>
        </motion.div>
      </div>
    </section>
  );
};

export default Dao; 