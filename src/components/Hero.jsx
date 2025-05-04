import { motion } from 'framer-motion';
import { ArrowDownIcon } from '@heroicons/react/24/outline';
import simionImg from '../assets/simion-1.png';

const Hero = () => {
  return (
    <section className="min-h-screen flex items-center justify-center bg-white py-10 md:py-20">
      <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-10 md:gap-20 px-4">
        {/* Stânga: Text */}
        <div className="w-full md:w-1/2 flex flex-col items-center md:items-start text-center md:text-left space-y-8 md:space-y-12 max-w-2xl">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-3xl xs:text-4xl md:text-6xl font-extrabold leading-tight font-display"
          >
            Vote $SIMIO – The Only Candidate Who Doesn't Lie. Just Pumps.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-base xs:text-lg md:text-2xl text-gray-600"
          >
            No party. No promises. Just a token and a vision.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-col md:flex-row gap-4 w-full md:w-auto justify-center md:justify-start"
          >
            <a href="#" className="bg-blue-700 hover:bg-blue-800 text-white font-bold py-3 px-6 rounded shadow transition text-lg text-center">
              Vote with your wallet
            </a>
            <a href="#memes" className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-3 px-6 rounded shadow transition flex items-center gap-2 text-lg justify-center">
              <span>View Campaign Poster</span> <ArrowDownIcon className="w-5 h-5" />
            </a>
          </motion.div>
        </div>
        {/* Dreapta: Imagine */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="w-full md:w-1/2 flex justify-center items-center mb-8 md:mb-0"
        >
          <img
            src={simionImg}
            alt="$SIMIO Campaign"
            className="rounded-xl shadow-xl max-w-xs xs:max-w-sm md:max-w-lg w-full h-auto"
          />
        </motion.div>
      </div>
    </section>
  );
};

export default Hero; 