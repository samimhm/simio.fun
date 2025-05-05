import { motion } from 'framer-motion';
import { ArrowDownIcon } from '@heroicons/react/24/outline';
import simionImg from '../assets/simion-2.webp';

const Hero = () => {
  return (
    <section id="hero-section" className="min-h-screen flex items-center justify-center py-10 md:py-20 pt-24 md:pt-32">
      <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-10 md:gap-20 px-4">
        {/* Stânga: Text */}
        <div className="w-full md:w-1/2 flex flex-col items-center md:items-start text-center md:text-left space-y-8 md:space-y-12 max-w-2xl">
          {/* Badge satiric */}
          {/* <span className="inline-block mb-2 px-4 py-1 bg-yellow-400 text-black font-semibold rounded-full text-xs tracking-wider shadow-sm animate-pulse">
            Meme Coin Satire
          </span> */}
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
            className="text-sm md:text-base text-slate-500 italic font-light"
          >
            No party. No promises. Just a token and a vision.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-col gap-4 w-full md:w-auto justify-center md:justify-start md:max-w-xs"
          >
            <a
              href="https://pump.fun/coin/Abcg5FT33Yg9aLZrXD15QhmwjBoCSfvhHbPhG1ahpump"
              className="bg-blue-700 hover:bg-blue-800 text-white font-bold py-3 px-6 rounded-2xl shadow transition-all text-lg text-center transform hover:-translate-y-1 hover:scale-105 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 duration-200"
              aria-label="Buy $SIMIO on Pump.fun"
            >
              Buy $SIMIO on Pump.fun
            </a>
            <a
              href="/raffle"
              className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-2xl shadow transition-all text-lg text-center transform hover:-translate-y-1 hover:scale-105 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 duration-200"
              aria-label="Join the Raffle & Win 2M $SIMIO"
            >
              Join the Raffle & Win 2M $SIMIO
            </a>
          </motion.div>
        </div>
        {/* Dreapta: Imagine */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="w-full md:w-1/2 flex justify-center items-center mb-8 md:mb-0 relative"
        >
          {/* Badge top-right */}
          <span className="absolute top-2 right-2 z-10 bg-yellow-200 rounded-full text-xs px-2 py-1 font-semibold shadow-sm select-none">
            🗳️ Official Candidate On-Chain
          </span>
          <img
            src={simionImg}
            alt="Portrait of SIMIO meditating with a floating Dacia 1300"
            className="rounded-3xl shadow-2xl max-w-xs xs:max-w-sm md:max-w-lg w-full h-auto border-4 border-yellow-100 hover:-translate-y-1 hover:scale-[1.01] transition-transform duration-200"
          />
        </motion.div>
      </div>
    </section>
  );
};

export default Hero; 