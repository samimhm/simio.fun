import React, { useState, useRef, useEffect } from 'react';
import { Connection, PublicKey, Transaction } from '@solana/web3.js';
import { getAssociatedTokenAddress, createAssociatedTokenAccountInstruction, createTransferInstruction, getAccount } from '@solana/spl-token';
import { ToastContainer, toast } from 'react-toastify';
import { motion } from 'framer-motion';
import meme1 from '../assets/meme-1.webp';
import 'react-toastify/dist/ReactToastify.css';

const RafflePage = () => {
  const [walletAddress, setWalletAddress] = useState(null);
  const [simioBalance, setSimioBalance] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [transactionStatus, setTransactionStatus] = useState('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [showStickyWallet, setShowStickyWallet] = useState(false);
  const [phantomAvailable, setPhantomAvailable] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [platform, setPlatform] = useState(null); // 'ios', 'android', or null
  const [isConnecting, setIsConnecting] = useState(false); // New state to track connection attempt
  const [raffleStatus, setRaffleStatus] = useState({
    round: 1,
    participants: [],
    ready: false,
  });
  const [raffleHistory, setRaffleHistory] = useState([]);
  const [apiError, setApiError] = useState(null);
  const [isParticipant, setIsParticipant] = useState(false);
  const [lastPrize, setLastPrize] = useState(null);
  const [isBackendDown, setIsBackendDown] = useState(false);
  const walletRef = useRef(null);

  // Constants
  const SIMIO_MINT = new PublicKey(import.meta.env.VITE_SIMIO_MINT_ADDRESS);
  const COLLECTOR_WALLET = new PublicKey(import.meta.env.VITE_COLLECTOR_WALLET_PUBLIC_KEY);
  const TOKEN_DECIMALS = 6;
  const REQUIRED_PARTICIPANTS = 3;
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
  const SOLANA_NETWORK = import.meta.env.VITE_SOLANA_NETWORK || 'https://api.devnet.solana.com';
  const PHANTOM_UNIVERSAL_LINK = 'https://phantom.app/ul/connect?app_url=' + encodeURIComponent(window.location.origin);
  const PHANTOM_APP_STORE = 'https://apps.apple.com/us/app/phantom-crypto-wallet/id1598432977';
  const PHANTOM_PLAY_STORE = 'https://play.google.com/store/apps/details?id=app.phantom';

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

  // Sticky Connect Wallet logic for mobile
  useEffect(() => {
    const handleScroll = () => {
      if (!walletRef.current) return;
      const rect = walletRef.current.getBoundingClientRect();
      setShowStickyWallet(rect.bottom > window.innerHeight || rect.top < 0);
    };
    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [walletRef, walletAddress]);

  // Check Phantom availability initially
  useEffect(() => {
    setPhantomAvailable(!!(window.solana && window.solana.isPhantom));
  }, []);

  // Fetch SIMIO balance
  const fetchSimioBalance = async () => {
    if (!walletAddress) return;
    try {
      const connection = new Connection(SOLANA_NETWORK, 'confirmed');
      const userPublicKey = new PublicKey(walletAddress);
      const userAta = await getAssociatedTokenAddress(SIMIO_MINT, userPublicKey);
      const accountInfo = await getAccount(connection, userAta).catch(() => null);
      if (accountInfo) {
        const balance = Number(accountInfo.amount) / 10 ** TOKEN_DECIMALS;
        setSimioBalance(balance.toLocaleString());
      } else {
        setSimioBalance('0');
      }
    } catch (error) {
      console.error('Error fetching SIMIO balance:', error);
      setSimioBalance('0');
    }
  };

  useEffect(() => {
    fetchSimioBalance();
  }, [walletAddress, transactionStatus]);

  // Fetch raffle status and history
  useEffect(() => {
    const fetchRaffleData = async () => {
      try {
        setApiError(null);
        const [statusRes, historyRes] = await Promise.all([
          fetch(`${API_BASE_URL}/raffle/status`, { method: 'GET', headers: { Accept: 'application/json' }, mode: 'cors' }),
          fetch(`${API_BASE_URL}/raffle/history`, { method: 'GET', headers: { Accept: 'application/json' }, mode: 'cors' }),
        ]);

        if (!statusRes.ok || !historyRes.ok) {
          throw new Error('Failed to fetch raffle data');
        }

        const statusData = await statusRes.json();
        const historyData = await historyRes.json();

        setRaffleStatus(statusData);
        setRaffleHistory(historyData.rounds);
        setIsBackendDown(false);

        if (walletAddress) {
          const isCurrentParticipant = statusData.participants.includes(walletAddress);
          setIsParticipant(isCurrentParticipant);

          const lastRound = historyData.rounds.find((r) => r.round === statusData.round - 1);
          if (lastRound && lastRound.winners.includes(walletAddress)) {
            const index = lastRound.winners.indexOf(walletAddress);
            const prizes = ['2,000,000 SIMIO 🥇', '300,000 SIMIO 🥈', '200,000 SIMIO 🥉'];
            setLastPrize(prizes[index]);
          } else {
            setLastPrize(null);
          }
        }
      } catch (error) {
        console.error('Error fetching raffle data:', error);
        setApiError('Unable to connect to raffle server. Please make sure the backend is running and CORS is enabled.');
        setIsBackendDown(true);
      }
    };

    fetchRaffleData();
    const interval = setInterval(fetchRaffleData, isParticipant ? 2000 : 5000);
    return () => clearInterval(interval);
  }, [walletAddress, isParticipant]);

  const connectWallet = async () => {
    try {
      if (isMobile) {
        // If already in connecting state, don't redirect again
        if (isConnecting) {
          toast.info('Please complete the connection in Phantom and return to the browser.');
          return;
        }

        setIsConnecting(true);
        setErrorMessage('');

        // On mobile, use Universal Link to open Phantom
        window.location.href = PHANTOM_UNIVERSAL_LINK;

        // Start polling for window.solana availability
        let attempts = 0;
        const maxAttempts = 30; // 30 seconds (1 second per attempt)
        const checkPhantom = setInterval(async () => {
          attempts++;
          if (window.solana && window.solana.isPhantom) {
            clearInterval(checkPhantom);
            setPhantomAvailable(true);
            try {
              const response = await window.solana.connect();
              const address = response.publicKey.toString();
              setWalletAddress(address);
              toast.success('Wallet connected!');
              setIsConnecting(false);
            } catch (error) {
              console.error('Error connecting wallet after detection:', error);
              setErrorMessage('Failed to connect wallet');
              toast.error('Failed to connect wallet');
              setIsConnecting(false);
            }
          } else if (attempts >= maxAttempts) {
            clearInterval(checkPhantom);
            setPhantomAvailable(false);
            setErrorMessage('Phantom wallet not found! Please ensure it is installed.');
            setIsConnecting(false);
            // Redirect to the appropriate app store based on platform
            window.location.href = platform === 'ios' ? PHANTOM_APP_STORE : PHANTOM_PLAY_STORE;
          }
        }, 1000);
      } else {
        // On desktop, use the standard Phantom connection
        if (!window.solana || !window.solana.isPhantom) {
          setPhantomAvailable(false);
          setErrorMessage('Phantom wallet not found!');
          window.location.href = 'https://phantom.app/download';
          return;
        }
        setErrorMessage('');
        const response = await window.solana.connect();
        const address = response.publicKey.toString();
        setWalletAddress(address);
        toast.success('Wallet connected!');
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
      setErrorMessage('Failed to connect wallet');
      toast.error('Failed to connect wallet');
      setIsConnecting(false);
    }
  };

  // Reset isConnecting state if the user navigates away and returns
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && isConnecting) {
        // If the tab becomes visible again, check if Phantom is available
        if (window.solana && window.solana.isPhantom) {
          setPhantomAvailable(true);
          setIsConnecting(false);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isConnecting]);

  const disconnectWallet = async () => {
    try {
      if (window.solana) {
        await window.solana.disconnect();
        setWalletAddress(null);
        setSimioBalance(null);
        setTransactionStatus('idle');
        setErrorMessage('');
        setIsLoading(false);
        setIsParticipant(false);
        setLastPrize(null);
        setIsConnecting(false);
        toast.info('Wallet disconnected');
      }
    } catch (error) {
      console.error('Error disconnecting wallet:', error);
      setErrorMessage('Failed to disconnect wallet');
      toast.error('Failed to disconnect wallet');
    }
  };

  const joinRaffle = async () => {
    if (!walletAddress || isBackendDown) return;
    setIsLoading(true);
    setTransactionStatus('pending');
    setErrorMessage('');

    try {
      const connection = new Connection(SOLANA_NETWORK, 'confirmed');
      const wallet = window.solana;
      const userPublicKey = new PublicKey(walletAddress);

      const userAta = await getAssociatedTokenAddress(SIMIO_MINT, userPublicKey);
      const collectorAta = await getAssociatedTokenAddress(SIMIO_MINT, COLLECTOR_WALLET);
      const transaction = new Transaction();

      const userAtaInfo = await connection.getAccountInfo(userAta);
      if (!userAtaInfo) {
        console.log('Creating user ATA...');
        transaction.add(
          createAssociatedTokenAccountInstruction(userPublicKey, userAta, userPublicKey, SIMIO_MINT)
        );
      }

      const collectorAtaInfo = await connection.getAccountInfo(collectorAta);
      if (!collectorAtaInfo) {
        console.log('Creating collector ATA...');
        transaction.add(
          createAssociatedTokenAccountInstruction(userPublicKey, collectorAta, COLLECTOR_WALLET, SIMIO_MINT)
        );
      }

      console.log('Adding transfer instruction...');
      transaction.add(
        createTransferInstruction(userAta, collectorAta, userPublicKey, 1_000_000 * 10 ** TOKEN_DECIMALS)
      );

      console.log('Getting latest blockhash...');
      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = userPublicKey;

      console.log('Signing and sending transaction...');
      const signedTx = await wallet.signTransaction(transaction);
      const signature = await connection.sendRawTransaction(signedTx.serialize());
      console.log('Transaction sent:', signature);

      console.log('Waiting for confirmation...');
      const confirmation = await connection.confirmTransaction(signature, 'confirmed');
      console.log('Confirmation response:', confirmation);

      if (confirmation.value.err) {
        throw new Error(`Transaction failed: ${JSON.stringify(confirmation.value.err)}`);
      }

      setTransactionStatus('success');
      toast.success('Successfully joined raffle!');
    } catch (error) {
      console.error('Error joining raffle:', error);
      setTransactionStatus('error');
      setErrorMessage(error.message || 'Transaction failed');
      toast.error(error.message || 'Transaction failed');
    } finally {
      setIsLoading(false);
    }
  };

  const shortenAddress = (address) => {
    return `${address?.slice(0, 4)}...${address?.slice(-4)}`;
  };

  return (
    <div className="min-h-screen bg-[#fdf6e3] flex flex-col items-center py-8 px-2 pt-28 md:pt-16 lg:pt-24">
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
      <div className="w-full max-w-7xl flex flex-col lg:flex-row gap-16 items-start justify-center">
        {/* MOBILE: Title, image, description */}
        <div className="w-full flex flex-col lg:hidden items-center mb-8">
          <h1 className="text-3xl xs:text-4xl font-extrabold text-gray-900 mb-4 text-center">Simio Raffle</h1>
          <img
            src={meme1}
            alt="Simio Meme"
            className="rounded-3xl shadow-xl border-4 border-white w-full max-w-xs object-cover bg-white mb-4"
            style={{ minHeight: 180, background: '#fff' }}
          />
          <p className="text-base xs:text-lg text-gray-700 font-medium text-center mb-2 px-2">
            Join with <span className="font-bold text-purple-700">1M $SIMIO</span> and win{' '}
            <span className="font-bold text-green-700">2M!</span> The raffle starts when 3 players join.
          </p>
        </div>
        {/* Left: Sticky Column on Desktop */}
        <div className="w-full lg:w-[320px] flex-col items-center lg:items-stretch mb-6 lg:mb-0 lg:sticky lg:top-8 lg:self-start z-10 lg:h-[calc(100vh-4rem)] lg:justify-center hidden lg:flex">
          <img
            src={meme1}
            alt="Simio Meme"
            className="rounded-3xl shadow-xl border-4 border-white w-full max-w-xs object-cover bg-white lg:max-w-xs lg:max-h-72"
            style={{ minHeight: 180, background: '#fff' }}
          />
          <div className="hidden lg:flex flex-col gap-4 mt-8">
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <h2 className="text-xl font-semibold mb-4">Wallet</h2>
              {!phantomAvailable ? (
                <div className="text-center">
                  <p className="text-red-600 font-semibold mb-2">Phantom wallet not found!</p>
                  <a
                    href={isMobile ? (platform === 'ios' ? PHANTOM_APP_STORE : PHANTOM_PLAY_STORE) : 'https://phantom.app/download'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors font-bold mt-2"
                  >
                    Install Phantom Wallet
                  </a>
                </div>
              ) : !walletAddress ? (
                <button
                  onClick={connectWallet}
                  className={`w-full bg-purple-600 text-white py-3 px-6 rounded-lg hover:bg-purple-700 transition-colors text-lg font-bold shadow-md flex items-center justify-center gap-2 ${
                    isConnecting ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  disabled={isConnecting}
                  aria-label="Connect Wallet"
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
                <div className="flex flex-col gap-2">
                  <p className="text-gray-600 font-mono">
                    Connected: {shortenAddress(walletAddress)}
                  </p>
                  <p className="text-gray-600 font-medium">
                    SIMIO Balance: <span className="font-bold">{simioBalance || 'Loading...'}</span>
                  </p>
                  {simioBalance && Number(simioBalance.replace(/,/g, '')) < 1_000_000 && (
                    <p className="text-red-600 text-sm">
                      Insufficient SIMIO! You need 1M to join.
                    </p>
                  )}
                  <button
                    onClick={disconnectWallet}
                    className="bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 transition-colors font-semibold shadow"
                    aria-label="Disconnect Wallet"
                  >
                    Disconnect
                  </button>
                </div>
              )}
              {errorMessage && phantomAvailable && (
                <p className="mt-2 text-red-600 text-center font-semibold">{errorMessage}</p>
              )}
              {isConnecting && (
                <p className="mt-2 text-blue-600 text-center font-semibold">
                  Please approve the connection in Phantom and return to this page.
                </p>
              )}
            </div>
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <h2 className="text-xl font-semibold mb-4">Join Raffle</h2>
              {isParticipant ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center"
                >
                  <p className="text-green-600 font-semibold">
                    {raffleStatus.ready
                      ? 'You’re in! Awaiting raffle results.'
                      : `You’re in! Waiting for ${REQUIRED_PARTICIPANTS - raffleStatus.participants.length} more participant(s).`}
                  </p>
                  <div className="mt-4">
                    <div className="bg-gray-200 rounded-full h-2.5">
                      <div
                        className="bg-purple-600 h-2.5 rounded-full"
                        style={{ width: `${(raffleStatus.participants.length / REQUIRED_PARTICIPANTS) * 100}%` }}
                      ></div>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {raffleStatus.participants.length}/{REQUIRED_PARTICIPANTS} participants
                    </p>
                  </div>
                </motion.div>
              ) : (
                <button
                  onClick={joinRaffle}
                  disabled={!walletAddress || isLoading || Number(simioBalance?.replace(/,/g, '')) < 1_000_000 || isBackendDown}
                  className={`w-full py-3 px-6 rounded-lg transition-colors text-lg font-bold shadow-md flex items-center justify-center gap-2 ${
                    !walletAddress || isLoading || Number(simioBalance?.replace(/,/g, '')) < 1_000_000 || isBackendDown
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-green-600 hover:bg-green-700 text-white'
                  }`}
                  aria-label="Join Raffle"
                >
                  {isLoading ? (
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
                      Processing...
                    </>
                  ) : isBackendDown ? (
                    'Raffle Stopped'
                  ) : (
                    'Join Raffle (1M $SIMIO)'
                  )}
                </button>
              )}
              {transactionStatus === 'success' && !isParticipant && (
                <p className="mt-4 text-green-600 text-center font-semibold flex items-center gap-1">
                  <span>✅ Transaction successful!</span>
                </p>
              )}
              {transactionStatus === 'error' && (
                <p className="mt-4 text-red-600 text-center font-semibold flex items-center gap-1">
                  <span>❌ {errorMessage}</span>
                </p>
              )}
              {lastPrize && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mt-4 text-center bg-green-100 p-4 rounded-lg"
                >
                  <p className="text-green-800 font-semibold">🎉 You won {lastPrize}!</p>
                </motion.div>
              )}
            </div>
          </div>
        </div>
        {/* Right: Content */}
        <div className="flex-1 flex flex-col gap-8 justify-center w-full max-w-2xl mx-auto">
          {/* Header (desktop only) */}
          <div className="mb-0 text-center lg:text-left hidden lg:block">
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-2 tracking-tight">Simio Raffle</h1>
            <p className="text-lg md:text-xl text-gray-700 font-medium">
              Join with <span className="font-bold text-purple-700">1M $SIMIO</span> and win{' '}
              <span className="font-bold text-green-700">2M!</span> The raffle starts when 3 players join.
            </p>
          </div>

          {/* Game Description */}
          <div className="bg-white/90 rounded-2xl shadow-lg p-6 md:p-8 mb-0 border border-gray-100">
            <h2 className="text-2xl font-bold mb-4 text-center text-purple-800">How Simio Raffle Works</h2>
            <div className="space-y-6 text-gray-700">
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-4 rounded-xl">
                <h3 className="font-semibold text-lg mb-2 text-purple-800">Simple Steps to Play:</h3>
                <ol className="list-decimal list-inside space-y-1 text-purple-700">
                  <li>Connect your wallet (Phantom or any Solana-compatible wallet)</li>
                  <li>Join the raffle by submitting 1 million $SIMIO tokens</li>
                  <li>Once 3 players have joined, the raffle automatically begins</li>
                  <li>A random winner is selected off-chain</li>
                </ol>
              </div>
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-xl">
                <h3 className="font-semibold text-lg mb-2 text-green-800">Prize Distribution (3M $SIMIO Total):</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between bg-white/60 p-2 rounded-lg">
                    <span className="flex items-center gap-2">
                      <span className="text-xl">🥇</span>1st place (Winner)
                    </span>
                    <span className="font-semibold">2,000,000 $SIMIO</span>
                  </div>
                  <div className="flex items-center justify-between bg-white/60 p-2 rounded-lg">
                    <span className="flex items-center gap-2">
                      <span className="text-xl">🥈</span>2nd place
                    </span>
                    <span className="font-semibold">300,000 $SIMIO</span>
                  </div>
                  <div className="flex items-center justify-between bg-white/60 p-2 rounded-lg">
                    <span className="flex items-center gap-2">
                      <span className="text-xl">🥉</span>3rd place
                    </span>
                    <span className="font-semibold">200,000 $SIMIO</span>
                  </div>
                  <div className="flex items-center justify-between bg-white/60 p-2 rounded-lg">
                    <span className="flex items-center gap-2">
                      <span className="text-xl">🧘</span>SIMIO Monastery (developer reward)
                    </span>
                    <span className="font-semibold">250,000 $SIMIO</span>
                  </div>
                  <div className="flex items-center justify-between bg-white/60 p-2 rounded-lg">
                    <span className="flex items-center gap-2">
                      <span className="text-xl">🔥</span>Burned (deflationary)
                    </span>
                    <span className="font-semibold">250,000 $SIMIO</span>
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-r from-amber-50 to-yellow-50 p-4 rounded-xl">
                <h3 className="font-semibold text-lg mb-2 text-amber-800">Transparency & Verification</h3>
                <p className="text-amber-700 text-sm">
                  Every raffle round is transparent and executed off-chain. Past winners and transactions are publicly
                  visible for verification.
                </p>
              </div>
              <div className="text-center">
                <p className="text-lg font-semibold text-purple-600">
                  Try your luck — everyone gets something, but only one wins big!
                </p>
              </div>
            </div>
          </div>

          {/* Wallet Connect Section (MOBILE ONLY) */}
          <div ref={walletRef} className="bg-white rounded-2xl shadow-lg p-6 mb-4 border border-gray-100 block lg:hidden">
            <h2 className="text-xl font-semibold mb-4">Wallet</h2>
            {!phantomAvailable ? (
              <div className="text-center">
                <p className="text-red-600 font-semibold mb-2">Phantom wallet not found!</p>
                <a
                  href={isMobile ? (platform === 'ios' ? PHANTOM_APP_STORE : PHANTOM_PLAY_STORE) : 'https://phantom.app/download'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors font-bold mt-2"
                >
                  Install Phantom Wallet
                </a>
              </div>
            ) : !walletAddress ? (
              <button
                onClick={connectWallet}
                className={`w-full bg-purple-600 text-white py-3 px-6 rounded-lg hover:bg-purple-700 transition-colors text-lg font-bold shadow-md flex items-center justify-center gap-2 ${
                  isConnecting ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                disabled={isConnecting}
                aria-label="Connect Wallet"
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
              <div className="flex flex-col gap-2">
                <p className="text-gray-600 font-mono">
                  Connected: {shortenAddress(walletAddress)}
                </p>
                <p className="text-gray-600 font-medium">
                  SIMIO Balance: <span className="font-bold">{simioBalance || 'Loading...'}</span>
                </p>
                {simioBalance && Number(simioBalance.replace(/,/g, '')) < 1_000_000 && (
                  <p className="text-red-600 text-sm">
                    Insufficient SIMIO! You need 1M to join.
                  </p>
                )}
                <button
                  onClick={disconnectWallet}
                  className="bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 transition-colors font-semibold shadow"
                  aria-label="Disconnect Wallet"
                >
                  Disconnect
                </button>
              </div>
            )}
            {errorMessage && phantomAvailable && (
              <p className="mt-2 text-red-600 text-center font-semibold">{errorMessage}</p>
            )}
            {isConnecting && (
              <p className="mt-2 text-blue-600 text-center font-semibold">
                Please approve the connection in Phantom and return to this page.
              </p>
            )}
          </div>

          {/* Participation Section (MOBILE ONLY) */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-4 border border-gray-100 block lg:hidden">
            <h2 className="text-xl font-semibold mb-4">Join Raffle</h2>
            {isParticipant ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center"
              >
                <p className="text-green-600 font-semibold">
                  {raffleStatus.ready
                    ? 'You’re in! Awaiting raffle results.'
                    : `You’re in! Waiting for ${REQUIRED_PARTICIPANTS - raffleStatus.participants.length} more participant(s).`}
                </p>
                <div className="mt-4">
                  <div className="bg-gray-200 rounded-full h-2.5">
                    <div
                      className="bg-purple-600 h-2.5 rounded-full"
                      style={{ width: `${(raffleStatus.participants.length / REQUIRED_PARTICIPANTS) * 100}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    {raffleStatus.participants.length}/{REQUIRED_PARTICIPANTS} participants
                  </p>
                </div>
              </motion.div>
            ) : (
              <button
                onClick={joinRaffle}
                disabled={!walletAddress || isLoading || Number(simioBalance?.replace(/,/g, '')) < 1_000_000 || isBackendDown}
                className={`w-full py-3 px-6 rounded-lg transition-colors text-lg font-bold shadow-md flex items-center justify-center gap-2 ${
                  !walletAddress || isLoading || Number(simioBalance?.replace(/,/g, '')) < 1_000_000 || isBackendDown
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-green-600 hover:bg-green-700 text-white'
                }`}
                aria-label="Join Raffle"
              >
                {isLoading ? (
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
                    Processing...
                  </>
                ) : isBackendDown ? (
                  'Raffle Stopped'
                ) : (
                  'Join Raffle (1M $SIMIO)'
                )}
              </button>
            )}
            {transactionStatus === 'success' && !isParticipant && (
              <p className="mt-4 text-green-600 text-center font-semibold flex items-center gap-1">
                <span>✅ Transaction successful!</span>
              </p>
            )}
            {transactionStatus === 'error' && (
              <p className="mt-4 text-red-600 text-center font-semibold flex items-center gap-1">
                <span>❌ {errorMessage}</span>
              </p>
            )}
            {lastPrize && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mt-4 text-center bg-green-100 p-4 rounded-lg"
              >
                <p className="text-green-800 font-semibold">🎉 You won {lastPrize}!</p>
              </motion.div>
            )}
          </div>

          {/* Raffle Status Section */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <h2 className="text-xl font-semibold mb-4">Raffle Status</h2>
            <div className="space-y-4">
              <div>
                <p className="text-gray-600 font-medium">
                  Current Round: <span className="font-bold text-purple-700">{raffleStatus.round}</span>
                </p>
                <p className="text-gray-600 font-medium">
                  Participants:{' '}
                  <span className="font-bold text-purple-700">{raffleStatus.participants.length}</span> of{' '}
                  <span className="font-bold">{REQUIRED_PARTICIPANTS}</span>
                </p>
                {raffleStatus.ready && (
                  <p className="text-green-600 font-semibold mt-2">Raffle is ready to be drawn!</p>
                )}
              </div>
            </div>
          </div>

          {/* Raffle History Section */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <h2 className="text-xl font-semibold mb-4">Raffle History</h2>
            <div className="max-h-96 overflow-y-auto space-y-4">
              {raffleHistory.length === 0 ? (
                <p className="text-gray-500 text-center">No raffle history yet</p>
              ) : (
                [...raffleHistory]
                  .sort((a, b) => b.round - a.round)
                  .map((round) => (
                    <div key={round.round} className="border-b border-gray-100 pb-4 last:border-0">
                      <h3 className="font-semibold text-purple-700">Round {round.round}</h3>
                      <div className="space-y-1 mt-2">
                        {round.winners.map((winner, index) => (
                          <div key={winner} className="flex items-center gap-2">
                            <span className="text-lg">
                              {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                            </span>
                            <span className="font-mono text-sm">{shortenAddress(winner)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>
        </div>
      </div>
      {/* Sticky Button for mobile */}
      {showStickyWallet && (
        <div className="fixed bottom-0 left-0 w-full z-50 block lg:hidden">
          <div className="bg-white border-t border-gray-200 shadow-2xl p-4 flex flex-col items-center">
            {!phantomAvailable ? (
              <div className="text-center">
                <p className="text-red-600 font-semibold mb-2">Phantom wallet not found!</p>
                <a
                  href={isMobile ? (platform === 'ios' ? PHANTOM_APP_STORE : PHANTOM_PLAY_STORE) : 'https://phantom.app/download'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors font-bold mt-2"
                >
                  Install Phantom Wallet
                </a>
              </div>
            ) : !walletAddress ? (
              <button
                onClick={connectWallet}
                className={`w-full bg-purple-600 text-white py-3 px-6 rounded-lg hover:bg-purple-700 transition-colors text-lg font-bold shadow-md flex items-center justify-center gap-2 ${
                  isConnecting ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                disabled={isConnecting}
                aria-label="Connect Wallet"
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
            ) : !isParticipant ? (
              <button
                onClick={joinRaffle}
                disabled={!walletAddress || isLoading || Number(simioBalance?.replace(/,/g, '')) < 1_000_000 || isBackendDown}
                className={`w-full py-3 px-6 rounded-lg transition-colors text-lg font-bold shadow-md flex items-center justify-center gap-2 ${
                  !walletAddress || isLoading || Number(simioBalance?.replace(/,/g, '')) < 1_000_000 || isBackendDown
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-green-600 hover:bg-green-700 text-white'
                }`}
                aria-label="Join Raffle"
              >
                {isLoading ? (
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
                    Processing...
                  </>
                ) : isBackendDown ? (
                  'Raffle Stopped'
                ) : (
                  'Join Raffle (1M $SIMIO)'
                )}
              </button>
            ) : null}
          </div>
        </div>
      )}

      {/* API Error Alert */}
      {apiError && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-md">
          <div
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
            role="alert"
            aria-live="assertive"
          >
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{apiError}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default RafflePage;