import { useState, useEffect, useRef } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { ClipboardIcon, CurrencyDollarIcon, UsersIcon, ClockIcon, LinkIcon, UserPlusIcon, ArrowTrendingUpIcon, EyeIcon } from '@heroicons/react/24/outline';
import { useLocation, useNavigate } from 'react-router-dom';
import 'react-toastify/dist/ReactToastify.css';
import meme3 from '../assets/meme-3.webp';
import { usePhantomWallet } from '../hooks/usePhantomWallet';

// Constants
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

const AffiliatePage = () => {
  const { publicKey, connected } = useWallet();
  const { walletAddress, connectWallet, disconnectWallet, isConnecting, errorMessage, setErrorMessage, phantom, useExtension } = usePhantomWallet();
  const [affiliateData, setAffiliateData] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [platform, setPlatform] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  // Constants
  const REFRESH_INTERVAL = 60000; // 60 seconds
  const REWARD_THRESHOLD = 250000;
  const AFFILIATE_REWARD = 25000;
  const TOKEN_DECIMALS = 6;

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
          setIsConnecting(false);
          toast.success('Wallet connected!');
          navigate('/affiliate');
        } catch (error) {
          console.error('Error handling Phantom callback:', error);
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
            // Adresa este deja gestionată de hook-ul usePhantomWallet
          }
        } catch (error) {
          console.error('No trusted connection found:', error);
        }
      }
    };

    handleConnection();
  }, [phantom, useExtension, location, navigate]);

  const fetchAffiliateData = async (walletAddress) => {
    if (!walletAddress) return;
    
    try {
      setIsRefreshing(true);
      setLoading(true);
      setErrorMessage('');

      // Fetch both status and history in parallel
      const [statusRes, historyRes] = await Promise.all([
        fetch(`${API_BASE_URL}/affiliate/status/${walletAddress}`, {
          credentials: 'include',
        }),
        fetch(`${API_BASE_URL}/affiliate/history/${walletAddress}`, {
          credentials: 'include',
        })
      ]);

      if (!statusRes.ok && !historyRes.ok) {
        if(statusRes?.statusText !== 'Not Found') {
          throw new Error('Failed to fetch affiliate data');
        }
      }

      const statusData = await statusRes.json();
      const historyData = await historyRes.json();

      if (statusRes.ok) {
        setAffiliateData(statusData);
        setLastUpdate(new Date());
      } else if (statusRes.status === 404 || statusData.error === 'Affiliate not found') {
        setAffiliateData(null);
        setLastUpdate(new Date());
      } else {
        toast.error(statusData.error || 'Failed to fetch affiliate status');
      }

      if (historyRes.ok) {
        // Sort history by timestamp descending and ensure unique entries
        const uniqueHistory = historyData.rewardHistory
          ?.filter((entry, index, self) => 
            index === self.findIndex((e) => 
              e.round === entry.round && 
              e.participant === entry.participant
            )
          )
          .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)) || [];
        setHistory(uniqueHistory);
      } else if (historyRes.status === 404) {
        setHistory([]);
      } else {
        toast.error(historyData.error || 'Failed to fetch affiliate history');
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setErrorMessage('Failed to sync with server. Please try again.');
      if (!(err?.message?.includes('Affiliate not found') || err?.response?.data?.error === 'Affiliate not found')) {
        console.log('err:', err);
        toast.error('Network error - data may be outdated');
      }
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  const registerAffiliate = async () => {
    if (!walletAddress) {
      toast.error('Please connect your wallet first');
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/affiliate/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ walletAddress }),
      });
      const data = await response.json();
      if (response.ok && data.affiliateId) {
        setAffiliateData(data);
        toast.success('Affiliate registered successfully');

        // Asociază participantul cu afiliatul
        await fetch(`${import.meta.env.VITE_API_BASE_URL}/affiliate/track`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ participantAddress: walletAddress, affiliateId: data.affiliateId }),
        })
          .then((res) => res.json())
          .then((trackData) => {
            if (trackData.success) toast.info('Affiliate association successful');
            else toast.error('Failed to associate affiliate');
          })
          .catch((err) => toast.error('Error associating affiliate'));
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
      <div className="w-full max-w-7xl flex flex-col lg:flex-row gap-16 items-start lg:items-center justify-center">
        {/* Left column: affiliate info, desktop only, sticky and vertically centered */}
        <div className="w-full lg:w-[320px] flex-col items-center lg:items-stretch mb-6 lg:mb-0 lg:sticky lg:top-16 lg:self-start z-10 lg:h-[calc(100vh-4rem)] lg:flex lg:flex-col lg:justify-center hidden">
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
            <ul className="text-sm text-gray-600 list-disc list-inside text-left mt-2 mb-6">
              <li>You get a unique affiliate link</li>
              <li>Invite friends to use your link</li>
              <li>Earn automatic rewards for every new user</li>
              <li>Track your stats and history directly in the platform</li>
            </ul>
            {/* Wallet controls on desktop only */}
            <div className="w-full mt-4">
              {!walletAddress ? (
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
              ) : (
                <div className="flex flex-col items-center w-full gap-2">
                  <span className="text-gray-600 font-mono text-sm">Connected: {shortenAddress(walletAddress)}</span>
                  <button
                    onClick={disconnectWallet}
                    className="w-full max-w-xs bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition-colors font-semibold shadow"
                  >
                    Disconnect
                  </button>
                </div>
              )}
              {isMobile && !walletAddress && (
                <p className="mt-2 text-sm text-gray-600">
                  You will be redirected to the Phantom app to connect.
                </p>
              )}
              {!useExtension && !isMobile && !walletAddress && (
                <p className="mt-2 text-sm text-gray-600">
                  Phantom extension not detected. Using embedded wallet.
                </p>
              )}
              {errorMessage && !walletAddress && (
                <p className="mt-2 text-red-600 text-center font-semibold">{errorMessage}</p>
              )}
            </div>
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
            <div className="bg-white/90 rounded-2xl shadow-lg p-6 md:p-8 border border-gray-100 w-full max-w-3xl xl:max-w-4xl mx-auto">
              {/* On mobile, wallet controls here */}
              {!walletAddress && (
                <>
                  <div className="flex flex-col items-center justify-center lg:hidden">
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
                  {/* Campaign info card on all screens, but CTA button only on mobile */}
                  <div className="mt-8 w-full">
                    <div className="bg-white rounded-2xl shadow p-4 md:p-6 xl:p-8 w-full">
                      <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-2 text-center">Earn Big with Simio Affiliate Program!</h1>
                      <p className="text-lg text-gray-700 text-center mb-6 font-medium">Invite friends and earn <span className="font-bold text-green-700">25k SIMIO</span> per round they play—straight from 30% of our 250k SIMIO round revenue!</p>
                      <div className="flex flex-col lg:flex-row gap-8">
                        <div className="flex-1 mb-6 lg:mb-0">
                          <h2 className="text-xl font-semibold text-gray-900 mb-2">How It Works</h2>
                          <ul className="space-y-3">
                            <li className="flex items-start gap-3">
                              <LinkIcon className="h-6 w-6 text-blue-500 mt-1" />
                              <div>
                                <span className="font-semibold text-gray-800">Get Your Unique Link</span><br />
                                <span className="text-gray-700">Connect your wallet to receive a personalized referral link.</span>
                              </div>
                            </li>
                            <li className="flex items-start gap-3">
                              <UserPlusIcon className="h-6 w-6 text-purple-500 mt-1" />
                              <div>
                                <span className="font-semibold text-gray-800">Share with Friends</span><br />
                                <span className="text-gray-700">Invite others to join Simio Fun using your link.</span>
                              </div>
                            </li>
                            <li className="flex items-start gap-3">
                              <CurrencyDollarIcon className="h-6 w-6 text-green-600 mt-1" />
                              <div>
                                <span className="font-semibold text-gray-800">Earn 25k SIMIO Per Round</span><br />
                                <span className="text-gray-700">Get 25k SIMIO for every round played by your referrals, sourced from 30% of our 250k SIMIO round revenue.</span>
                              </div>
                            </li>
                            <li className="flex items-start gap-3">
                              <EyeIcon className="h-6 w-6 text-indigo-500 mt-1" />
                              <div>
                                <span className="font-semibold text-gray-800">Track & Withdraw</span><br />
                                <span className="text-gray-700">Monitor your earnings and withdraw automatically at 250k SIMIO.</span>
                              </div>
                            </li>
                          </ul>
                        </div>
                        <div className="flex-1">
                          <h2 className="text-xl font-semibold text-gray-900 mb-2">Why Join?</h2>
                          <ul className="space-y-2">
                            <li className="flex items-start gap-2"><ArrowTrendingUpIcon className="h-5 w-5 text-green-600 mt-1" /><span className="text-gray-700"><span className="font-semibold">Recurring Rewards:</span> Earn 25k SIMIO per round played by each referral.</span></li>
                            <li className="flex items-start gap-2"><CurrencyDollarIcon className="h-5 w-5 text-blue-600 mt-1" /><span className="text-gray-700"><span className="font-semibold">Big Potential:</span> Tap into 30% of our 250k SIMIO round revenue.</span></li>
                            <li className="flex items-start gap-2"><UserPlusIcon className="h-5 w-5 text-purple-600 mt-1" /><span className="text-gray-700"><span className="font-semibold">Free to Join:</span> No fees, just connect your wallet.</span></li>
                            <li className="flex items-start gap-2"><EyeIcon className="h-5 w-5 text-indigo-500 mt-1" /><span className="text-gray-700"><span className="font-semibold">Real-Time Tracking:</span> See your progress anytime.</span></li>
                          </ul>
                        </div>
                      </div>
                      {/* CTA button only on mobile */}
                      <div className="flex justify-center lg:hidden mt-6">
                        <button
                          onClick={connectWallet}
                          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 text-lg font-bold shadow-md flex items-center gap-2"
                        >
                          Connect Wallet to Start Earning Recurring Rewards!
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              )}
              {/* On mobile, show connected status and disconnect */}
              {walletAddress && (
                <div className="flex flex-col items-center justify-center lg:hidden mb-4 gap-2">
                  <span className="text-gray-600 font-mono text-sm">Connected: {shortenAddress(walletAddress)}</span>
                  <button
                    onClick={disconnectWallet}
                    className="w-full max-w-xs bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition-colors font-semibold shadow"
                  >
                    Disconnect
                  </button>
                </div>
              )}
              {/* Register as affiliate if wallet connected and no affiliateData */}
              {walletAddress && !affiliateData && (
                <div className="text-center mb-8">
                  <p className="text-lg mb-4">Register as an affiliate to get your unique link</p>
                  <button
                    onClick={registerAffiliate}
                    disabled={loading}
                    className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 disabled:opacity-50"
                  >
                    {loading ? 'Registering...' : 'Register as Affiliate'}
                  </button>
                </div>
              )}
              {/* Cardul cu informatii program affiliate - vizibil si cand walletAddress && !affiliateData */}
              {walletAddress && !affiliateData && (
                <div className="mt-8 w-full">
                  <div className="bg-white rounded-2xl shadow p-4 md:p-6 xl:p-8 w-full">
                    <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-2 text-center">Earn Big with Simio Affiliate Program!</h1>
                    <p className="text-lg text-gray-700 text-center mb-6 font-medium">Invite friends and earn <span className="font-bold text-green-700">25k SIMIO</span> per round they play—straight from 30% of our 250k SIMIO round revenue!</p>
                    <div className="flex flex-col lg:flex-row gap-8">
                      <div className="flex-1 mb-6 lg:mb-0">
                        <h2 className="text-xl font-semibold text-gray-900 mb-2">How It Works</h2>
                        <ul className="space-y-3">
                          <li className="flex items-start gap-3">
                            <LinkIcon className="h-6 w-6 text-blue-500 mt-1" />
                            <div>
                              <span className="font-semibold text-gray-800">Get Your Unique Link</span><br />
                              <span className="text-gray-700">Connect your wallet to receive a personalized referral link.</span>
                            </div>
                          </li>
                          <li className="flex items-start gap-3">
                            <UserPlusIcon className="h-6 w-6 text-purple-500 mt-1" />
                            <div>
                              <span className="font-semibold text-gray-800">Share with Friends</span><br />
                              <span className="text-gray-700">Invite others to join Simio Fun using your link.</span>
                            </div>
                          </li>
                          <li className="flex items-start gap-3">
                            <CurrencyDollarIcon className="h-6 w-6 text-green-600 mt-1" />
                            <div>
                              <span className="font-semibold text-gray-800">Earn 25k SIMIO Per Round</span><br />
                              <span className="text-gray-700">Get 25k SIMIO for every round played by your referrals, sourced from 30% of our 250k SIMIO round revenue.</span>
                            </div>
                          </li>
                          <li className="flex items-start gap-3">
                            <EyeIcon className="h-6 w-6 text-indigo-500 mt-1" />
                            <div>
                              <span className="font-semibold text-gray-800">Track & Withdraw</span><br />
                              <span className="text-gray-700">Monitor your earnings and withdraw automatically at 250k SIMIO.</span>
                            </div>
                          </li>
                        </ul>
                      </div>
                      <div className="flex-1">
                        <h2 className="text-xl font-semibold text-gray-900 mb-2">Why Join?</h2>
                        <ul className="space-y-2">
                          <li className="flex items-start gap-2"><ArrowTrendingUpIcon className="h-5 w-5 text-green-600 mt-1" /><span className="text-gray-700"><span className="font-semibold">Recurring Rewards:</span> Earn 25k SIMIO per round played by each referral.</span></li>
                          <li className="flex items-start gap-2"><CurrencyDollarIcon className="h-5 w-5 text-blue-600 mt-1" /><span className="text-gray-700"><span className="font-semibold">Big Potential:</span> Tap into 30% of our 250k SIMIO round revenue.</span></li>
                          <li className="flex items-start gap-2"><UserPlusIcon className="h-5 w-5 text-purple-600 mt-1" /><span className="text-gray-700"><span className="font-semibold">Free to Join:</span> No fees, just connect your wallet.</span></li>
                          <li className="flex items-start gap-2"><EyeIcon className="h-5 w-5 text-indigo-500 mt-1" /><span className="text-gray-700"><span className="font-semibold">Real-Time Tracking:</span> See your progress anytime.</span></li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {/* Show affiliate info if affiliateData exists */}
              {affiliateData && (
                <div className="space-y-6">
                  <div className="bg-white p-6 rounded-lg shadow">
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-xl font-semibold">Your affiliate link</h2>
                      {isRefreshing && (
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          Updating...
                        </div>
                      )}
                    </div>
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-gray-600 font-mono text-sm">Connected: {shortenAddress(walletAddress)}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={affiliateData.affiliateLink || ''}
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
                      <p className="text-lg font-semibold">
                        {loading ? (
                          <svg className="animate-spin h-5 w-5 mx-auto" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                        ) : (
                          `${(affiliateData.pendingRewards || 0).toLocaleString()} SIMIO`
                        )}
                      </p>
                      <p className="text-sm text-gray-600">Pending rewards</p>
                      {affiliateData.pendingRewards >= REWARD_THRESHOLD && (
                        <p className="text-sm text-green-600 font-semibold mt-1">Ready for withdrawal!</p>
                      )}
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow text-center">
                      <CurrencyDollarIcon className="h-8 w-8 mx-auto text-blue-600" />
                      <p className="text-lg font-semibold">
                        {loading ? (
                          <svg className="animate-spin h-5 w-5 mx-auto" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                        ) : (
                          `${(affiliateData.transferredRewards || 0).toLocaleString()} SIMIO`
                        )}
                      </p>
                      <p className="text-sm text-gray-600">Transferred rewards</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow text-center">
                      <UsersIcon className="h-8 w-8 mx-auto text-purple-600" />
                      <p className="text-lg font-semibold">
                        {loading ? (
                          <svg className="animate-spin h-5 w-5 mx-auto" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                        ) : (
                          affiliateData.referredParticipants?.length || 0
                        )}
                      </p>
                      <p className="text-sm text-gray-600">Referred participants</p>
                    </div>
                  </div>
                  <div className="bg-white p-6 rounded-lg shadow">
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-xl font-semibold">Reward history</h2>
                      {lastUpdate && (
                        <p className="text-sm text-gray-500">
                          Last updated: {new Date(lastUpdate).toLocaleTimeString()}
                        </p>
                      )}
                    </div>
                    {history.length === 0 ? (
                      <p className="text-center text-gray-500">No rewards yet</p>
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
                              <tr key={index} className="border-b hover:bg-gray-50">
                                <td className="p-2">{entry.round}</td>
                                <td className="p-2 font-mono">{shortenAddress(entry.participant)}</td>
                                <td className="p-2">{entry.amount.toLocaleString()}</td>
                                <td className="p-2">
                                  <span className={`px-2 py-1 rounded-full text-sm ${
                                    entry.transferred 
                                      ? 'bg-green-100 text-green-800'
                                      : 'bg-yellow-100 text-yellow-800'
                                  }`}>
                                    {entry.transferred ? 'Transferred' : 'Pending'}
                                  </span>
                                </td>
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