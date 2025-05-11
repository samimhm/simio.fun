import { useState, useEffect, useRef } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { ClipboardIcon, CurrencyDollarIcon, UsersIcon, ClockIcon } from '@heroicons/react/24/outline';
import { createPhantom, Position } from '@phantom/wallet-sdk';
import { useLocation, useNavigate } from 'react-router-dom';
import 'react-toastify/dist/ReactToastify.css';
import meme3 from '../assets/meme-3.webp';

// Constants
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

// Funcție pentru a verifica dacă extensia Phantom este instalată
const isPhantomExtensionAvailable = () => {
  return typeof window !== 'undefined' && window.solana && window.solana.isPhantom;
};

// Inițializarea Phantom Wallet SDK ca fallback
const initializePhantom = async () => {
  try {
    const phantom = await createPhantom({
      position: Position.bottomRight,
      hideLauncherBeforeOnboarded: false,
      zIndex: 10000,
    });
    phantom.show();
    return phantom;
  } catch (error) {
    console.error('Error initializing Phantom SDK:', error);
    throw error;
  }
};

const AffiliatePage = () => {
  const { publicKey, connected } = useWallet();
  const [affiliateData, setAffiliateData] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [walletAddress, setWalletAddress] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isMobile, setIsMobile] = useState(false);
  const [platform, setPlatform] = useState(null);
  const [phantom, setPhantom] = useState(null);
  const [useExtension, setUseExtension] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Inițializează Phantom SDK sau folosește extensia
  useEffect(() => {
    const init = async () => {
      if (isPhantomExtensionAvailable()) {
        setUseExtension(true);
        setPhantom(window.solana);
      } else {
        try {
          const phantomInstance = await initializePhantom();
          setPhantom(phantomInstance);
          setUseExtension(false);
        } catch (error) {
          setErrorMessage('Failed to initialize Phantom wallet. Please install Phantom extension or try refreshing.');
          toast.error('Failed to initialize Phantom wallet');
        }
      }
    };
    init();
  }, []);

  // Detect if the user is on a mobile device and identify platform
  useEffect(() => {
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    const isMobileDevice = /android|iPhone|iPad|iPod/i.test(userAgent);
    setIsMobile(isMobileDevice);
    if (/iPhone|iPad|iPod/i.test(userAgent)) {
      setPlatform('ios');
    } else if (/android/i.test(userAgent)) {
      setPlatform('android');
    }
  }, []);

  // Handle Phantom callback and connection
  useEffect(() => {
    const handleConnection = async () => {
      if (!phantom) return;

      if (location.pathname === '/phantom-callback') {
        try {
          setIsConnecting(true);
          const result = await (useExtension ? window.solana.connect() : phantom.solana.connect());
          const address = result.publicKey?.toBase58 ? result.publicKey.toBase58() : result.publicKey?.toString?.() || result.publicKey || result;
          setWalletAddress(address);
          setIsConnecting(false);
          toast.success('Wallet connected!');
          navigate('/affiliate');
        } catch (error) {
          console.error('Error handling Phantom callback:', error);
          setErrorMessage('Failed to connect wallet. Please try again.');
          toast.error('Failed to connect wallet');
          setIsConnecting(false);
          navigate('/affiliate');
        }
      } else {
        try {
          const result = await (useExtension
            ? window.solana.connect({ onlyIfTrusted: true })
            : phantom.solana.connect({ onlyIfTrusted: true }));
          const address = result.publicKey?.toBase58 ? result.publicKey.toBase58() : result.publicKey?.toString?.() || result.publicKey || result;
          if (address) {
            setWalletAddress(address);
          }
        } catch (error) {
          console.error('No trusted connection found:', error);
        }
      }
    };

    handleConnection();
  }, [phantom, useExtension, location, navigate]);

  const connectWallet = async () => {
    if (!phantom) {
      setErrorMessage('Phantom wallet not initialized. Please install Phantom extension or refresh the page.');
      toast.error('Phantom wallet not initialized');
      return;
    }

    if (isConnecting) {
      toast.info('Connection in progress. Please complete the process in Phantom.');
      return;
    }

    setIsConnecting(true);
    setErrorMessage('');

    try {
      const result = await (useExtension ? window.solana.connect() : phantom.solana.connect());
      const address = result.publicKey?.toBase58 ? result.publicKey.toBase58() : result.publicKey?.toString?.() || result.publicKey || result;
      setWalletAddress(address);
      setIsConnecting(false);
      toast.success('Wallet connected!');
    } catch (error) {
      console.error('Error connecting wallet:', error);
      setErrorMessage('Failed to connect wallet. Please ensure Phantom is installed and try again.');
      toast.error('Failed to connect wallet');
      setIsConnecting(false);
    }
  };

  const disconnectWallet = async () => {
    if (!phantom) return;

    try {
      // Verificăm dacă wallet-ul este deja deconectat
      if (!walletAddress) {
        return;
      }

      await (useExtension ? window.solana.disconnect() : phantom.solana.disconnect());
      
      // Resetăm toate stările doar dacă deconectarea a reușit
      setWalletAddress(null);
      setAffiliateData(null);
      setHistory([]);
      setErrorMessage('');
      setIsConnecting(false);
      toast.info('Wallet disconnected');
    } catch (error) {
      // Verificăm dacă eroarea este legată de faptul că wallet-ul este deja deconectat
      if (error.message?.includes('not connected') || error.message?.includes('already disconnected')) {
        // Dacă wallet-ul este deja deconectat, doar resetăm stările
        setWalletAddress(null);
        setAffiliateData(null);
        setHistory([]);
        setErrorMessage('');
        setIsConnecting(false);
        toast.info('Wallet disconnected');
      } else {
        console.error('Error disconnecting wallet:', error);
        setErrorMessage('Failed to disconnect wallet');
        toast.error('Failed to disconnect wallet');
      }
    }
  };

  const fetchAffiliateData = async (walletAddress) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/affiliate/status/${walletAddress}`, {
        credentials: 'include',
      });
      const data = await response.json();
      if (response.ok) {
        setAffiliateData(data);
      } else if (response.status === 404) {
        // Nu afișăm eroarea pentru 404 deoarece este un caz normal pentru un nou utilizator
        setAffiliateData(null);
      } else {
        toast.error(data.error || 'Failed to fetch affiliate status');
      }

      const historyResponse = await fetch(`${API_BASE_URL}/affiliate/history/${walletAddress}`, {
        credentials: 'include',
      });
      const historyData = await historyResponse.json();
      if (historyResponse.ok) {
        setHistory(historyData.rewardHistory || []);
      } else if (historyResponse.status === 404) {
        // Nu afișăm eroarea pentru 404 deoarece este un caz normal pentru un nou utilizator
        setHistory([]);
      } else {
        toast.error(historyData.error || 'Failed to fetch affiliate history');
      }
    } catch (err) {
      toast.error('Network error');
      console.error('Fetch error:', err);
    }
    setLoading(false);
  };

  const registerAffiliate = async () => {
    if (!walletAddress) {
      toast.error('Please connect your wallet');
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/affiliate/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ walletAddress }),
      });
      const data = await response.json();
      if (response.ok) {
        setAffiliateData({
          ...data,
          referredParticipants: data.referredParticipants || [],
          pendingRewards: data.pendingRewards || 0,
          transferredRewards: data.transferredRewards || 0
        });
        toast.success('Affiliate registered successfully');
      } else {
        toast.error(data.error || 'Failed to register affiliate');
      }
    } catch (err) {
      toast.error('Network error');
      console.error('Register error:', err);
    }
    setLoading(false);
  };

  const copyLink = () => {
    if (affiliateData?.affiliateLink) {
      navigator.clipboard.writeText(affiliateData.affiliateLink);
      toast.success('Link copied to clipboard');
    }
  };

  useEffect(() => {
    if (walletAddress) {
      fetchAffiliateData(walletAddress);
    }
  }, [walletAddress]);

  const shortenAddress = (address) => {
    return `${address?.slice(0, 4)}...${address?.slice(-4)}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-[#fdf6e3] flex flex-col items-center py-8 px-2 pt-28 md:pt-16 lg:pt-24"
    >
      <div className="w-full max-w-7xl flex flex-col lg:flex-row gap-16 items-start justify-center">
        {/* Left column: affiliate info, desktop only, sticky and contained */}
        <div className="w-full lg:w-[320px] flex-col items-center lg:items-stretch mb-6 lg:mb-0 lg:sticky lg:top-8 lg:self-start z-10 lg:h-auto lg:justify-center hidden lg:flex">
          <div className="bg-white rounded-3xl shadow-xl border-4 border-white w-full max-w-xs mx-auto flex flex-col items-center p-6">
            <img
              src={meme3}
              alt="Simio Affiliate Logo"
              className="rounded-full w-28 h-28 mb-4 border-4 border-gray-200 object-cover"
              style={{ background: '#fff' }}
            />
            <h2 className="text-2xl font-bold text-center mb-2 text-purple-800">Simio Affiliate</h2>
            <p className="text-gray-700 text-center text-base mb-2">
              Promote Simio and earn rewards for every friend you bring!<br />
              <span className="font-semibold text-purple-700">How does it work?</span>
            </p>
            <ul className="text-sm text-gray-600 list-disc list-inside text-left mt-2">
              <li>You get a unique affiliate link</li>
              <li>Invite friends to use your link</li>
              <li>Earn automatic rewards for every new user</li>
              <li>Track your stats and history directly in the platform</li>
            </ul>
          </div>
        </div>
        {/* Right column: main content */}
        <div className="flex-1 flex flex-col gap-8 justify-center w-full max-w-2xl mx-auto min-h-[60vh]">
          {/* Mobile header, no duplicate title */}
          <div className="w-full flex flex-col lg:hidden items-center mb-8">
            <img
              src={meme3}
              alt="Simio Affiliate Logo"
              className="rounded-full w-24 h-24 mb-4 border-4 border-gray-200 object-cover"
              style={{ background: '#fff' }}
            />
            <h1 className="text-3xl font-extrabold text-gray-900 mb-2 text-center">Simio Affiliate</h1>
            <p className="text-base text-gray-700 font-medium text-center mb-2 px-2">
              Promote Simio and earn rewards for every friend you bring!
            </p>
          </div>
          {/* Main content card, only one title */}
          <div className="flex justify-center items-center min-h-[350px] h-full">
            <div className="bg-white/90 rounded-2xl shadow-lg p-6 md:p-8 border border-gray-100 w-full max-w-xl mx-auto">
              {!walletAddress ? (
                <div className="flex flex-col items-center justify-center">
                  <p className="text-lg mb-4">Connect your wallet to join the affiliate program</p>
                  <button
                    onClick={connectWallet}
                    className={`w-full max-w-xs bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors text-lg font-bold shadow-md flex items-center justify-center gap-2 ${
                      isConnecting || !phantom ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                    disabled={isConnecting || !phantom}
                  >
                    {isConnecting ? (
                      <>
                        <svg
                          className="animate-spin h-5 w-5 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Connecting...
                      </>
                    ) : (
                      'Connect Wallet'
                    )}
                  </button>
                  {isMobile && (
                    <p className="mt-2 text-sm text-gray-600">
                      You will be redirected to the Phantom app to connect.
                    </p>
                  )}
                  {!useExtension && !isMobile && (
                    <p className="mt-2 text-sm text-gray-600">
                      Phantom extension not detected. Using embedded wallet.
                    </p>
                  )}
                  {errorMessage && (
                    <p className="mt-2 text-red-600 text-center font-semibold">{errorMessage}</p>
                  )}
                </div>
              ) : !affiliateData ? (
                <div className="text-center">
                  <div className="mb-4">
                    <p className="text-gray-600 font-mono">
                      Connected: {shortenAddress(walletAddress)}
                    </p>
                    <button
                      onClick={disconnectWallet}
                      className="mt-2 bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 transition-colors font-semibold shadow"
                    >
                      Disconnect
                    </button>
                  </div>
                  <p className="text-lg mb-4">Register as an affiliate to get your unique link</p>
                  <button
                    onClick={registerAffiliate}
                    disabled={loading}
                    className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 disabled:opacity-50"
                  >
                    {loading ? 'Registering...' : 'Register as Affiliate'}
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="bg-white p-6 rounded-lg shadow">
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-xl font-semibold">Your affiliate link</h2>
                      <button
                        onClick={disconnectWallet}
                        className="bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 transition-colors font-semibold shadow"
                      >
                        Disconnect
                      </button>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={affiliateData.affiliateLink}
                        readOnly
                        className="w-full p-2 border rounded"
                      />
                      <button
                        onClick={copyLink}
                        className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
                      >
                        <ClipboardIcon className="h-6 w-6" />
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-white p-4 rounded-lg shadow text-center">
                      <CurrencyDollarIcon className="h-8 w-8 mx-auto text-green-600" />
                      <p className="text-lg font-semibold">{affiliateData?.pendingRewards || 0} SIMIO</p>
                      <p className="text-sm text-gray-600">Pending rewards</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow text-center">
                      <CurrencyDollarIcon className="h-8 w-8 mx-auto text-blue-600" />
                      <p className="text-lg font-semibold">{affiliateData?.transferredRewards || 0} SIMIO</p>
                      <p className="text-sm text-gray-600">Transferred rewards</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow text-center">
                      <UsersIcon className="h-8 w-8 mx-auto text-purple-600" />
                      <p className="text-lg font-semibold">{affiliateData?.referredParticipants?.length || 0}</p>
                      <p className="text-sm text-gray-600">Referred participants</p>
                    </div>
                  </div>
                  <div className="bg-white p-6 rounded-lg shadow">
                    <h2 className="text-xl font-semibold mb-4">Reward history</h2>
                    {history.length === 0 ? (
                      <p>No rewards yet</p>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left">
                          <thead>
                            <tr className="bg-gray-100">
                              <th className="p-2">Round</th>
                              <th className="p-2">Participant</th>
                              <th className="p-2">Amount (SIMIO)</th>
                              <th className="p-2">Status</th>
                              <th className="p-2">Date</th>
                            </tr>
                          </thead>
                          <tbody>
                            {history.map((entry, index) => (
                              <tr key={index} className="border-b">
                                <td className="p-2">{entry.round}</td>
                                <td className="p-2">{entry.participant.slice(0, 6)}...{entry.participant.slice(-4)}</td>
                                <td className="p-2">{entry.amount}</td>
                                <td className="p-2">{entry.transferred ? 'Transferred' : 'Pending'}</td>
                                <td className="p-2">{new Date(entry.timestamp).toLocaleDateString()}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default AffiliatePage; 