import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { TrophyIcon, UserIcon, UsersIcon, CurrencyDollarIcon, ArrowTrendingUpIcon } from '@heroicons/react/24/outline';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
const REQUIRED_PARTICIPANTS = 3;
const PRIZE_POOL = 3000000;
const LAST_PRIZES = ['2,000,000 SIMIO 🥇', '300,000 SIMIO 🥈', '200,000 SIMIO 🥉'];

const shortenAddress = (address) => `${address?.slice(0, 4)}...${address?.slice(-4)}`;

const GameStatsPanelHome = ({ round, lastWinners, lastPrizes }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
    className="w-full max-w-2xl mx-auto bg-gradient-to-br from-yellow-50 to-purple-50 rounded-2xl shadow-lg px-4 py-5 md:px-8 md:py-7 mb-4 border border-purple-100"
  >
    <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-4 md:text-left text-center items-center md:items-end">
      <div className="flex flex-col gap-1 items-center md:items-start w-full md:w-auto">
        <div className="flex items-center gap-2 justify-center md:justify-start">
          <TrophyIcon className="h-6 w-6 text-yellow-500" />
          <span className="text-lg md:text-xl font-bold text-purple-900">Last Round: <span className="text-purple-700">{round}</span></span>
        </div>
        <div className="text-sm text-gray-600 font-medium ml-0 md:ml-8">Prize Pool: <span className="font-semibold text-green-700">{PRIZE_POOL.toLocaleString()} SIMIO</span></div>
      </div>
    </div>
    {lastWinners && lastWinners.length > 0 && (
      <div className="mb-2">
        <div className="font-semibold text-gray-800 mb-2 flex items-center gap-2"><ArrowTrendingUpIcon className="h-5 w-5 text-green-600" />Last Winners:</div>
        <div className="flex flex-col gap-2 md:grid md:grid-cols-3 md:gap-6">
          {lastWinners.map((winner, idx) => (
            <motion.div
              key={winner + '-' + idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * idx }}
              className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl shadow-sm border w-full min-w-0 ${idx===0 ? 'bg-yellow-50 border-yellow-200' : idx===1 ? 'bg-purple-50 border-purple-200' : 'bg-amber-50 border-amber-200'}`}
            >
              <div className="flex items-center gap-1">
                <span className="text-xl">{idx===0?'🥇':idx===1?'🥈':'🥉'}</span>
                <span className="font-mono text-sm">{shortenAddress(winner)}</span>
              </div>
              <div className="text-green-700 font-semibold text-base text-center whitespace-nowrap">{lastPrizes[idx]}</div>
            </motion.div>
          ))}
        </div>
      </div>
    )}
  </motion.div>
);

const RafflePromo = () => {
  const [lastRound, setLastRound] = useState(null);
  const [lastWinners, setLastWinners] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRaffleHistory = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/raffle/history`, { method: 'GET', headers: { Accept: 'application/json' }, mode: 'cors' });
        if (!res.ok) return;
        const data = await res.json();
        const rounds = data.rounds || [];
        if (rounds.length > 0) {
          const last = rounds.sort((a, b) => b.round - a.round)[0];
          setLastRound(last.round);
          setLastWinners(last.winners);
        }
      } catch (e) {
        // fail silent
      }
    };
    fetchRaffleHistory();
  }, []);

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 md:p-10 flex flex-col items-center my-12">
      <h2 className="text-3xl font-extrabold text-purple-800 mb-2">Simio Raffle — Win Big Every Round!</h2>
      <p className="text-lg text-gray-700 mb-6 text-center">
        Join with <span className="font-bold text-purple-700">1M $SIMIO</span> and win up to <span className="font-bold text-green-700">2M!</span> 3 winners every round, instant prizes.
      </p>
      <GameStatsPanelHome round={lastRound} lastWinners={lastWinners} lastPrizes={LAST_PRIZES} />
      <button
        onClick={() => navigate('/raffle')}
        className="mt-6 bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-8 rounded-lg text-lg shadow transition"
      >
        Go to Raffle
      </button>
    </div>
  );
};

export default RafflePromo; 