import React, { useState, useRef, useEffect } from 'react';
import { Connection, PublicKey } from '@solana/web3.js';
import meme1 from '../assets/meme-1.webp';

const RafflePage = () => {
  const [walletAddress, setWalletAddress] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [transactionStatus, setTransactionStatus] = useState('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [showStickyWallet, setShowStickyWallet] = useState(false);
  const walletRef = useRef(null);

  // Mock data
  const currentParticipants = 2;
  const requiredParticipants = 3;
  const lastWinner = {
    address: '5hd...D3a',
    txHash: '0x123...abc'
  };

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

  const connectWallet = async () => {
    try {
      if (!window.solana) {
        throw new Error('Phantom wallet not found!');
      }
      const response = await window.solana.connect();
      const address = response.publicKey.toString();
      setWalletAddress(address);
    } catch (error) {
      console.error('Error connecting wallet:', error);
      setErrorMessage('Failed to connect wallet');
    }
  };

  const disconnectWallet = async () => {
    try {
      if (window.solana) {
        await window.solana.disconnect();
        setWalletAddress(null);
        setTransactionStatus('idle');
        setErrorMessage('');
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Error disconnecting wallet:', error);
      setErrorMessage('Failed to disconnect wallet');
    }
  };

  const joinRaffle = async () => {
    if (!walletAddress) return;
    setIsLoading(true);
    setTransactionStatus('pending');
    try {
      // Simulate transaction
      await new Promise(resolve => setTimeout(resolve, 2000));
      setTransactionStatus('success');
    } catch (error) {
      setTransactionStatus('error');
      setErrorMessage('Transaction failed');
    } finally {
      setIsLoading(false);
    }
  };

  const shortenAddress = (address) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  return (
    <div className="min-h-screen bg-[#fdf6e3] flex flex-col items-center py-8 px-2">
      <div className="w-full max-w-7xl flex flex-col lg:flex-row gap-16 items-start justify-center">
        {/* Left: Sticky Column on Desktop */}
        <div className="w-full lg:w-[320px] flex flex-col items-center lg:items-stretch mb-6 lg:mb-0 lg:sticky lg:top-8 lg:self-start z-10 lg:h-[calc(100vh-4rem)] lg:justify-center">
          <img
            src={meme1}
            alt="Simio Meme"
            className="rounded-3xl shadow-xl border-4 border-white w-full max-w-xs object-cover bg-white lg:max-w-xs lg:max-h-72"
            style={{ minHeight: 180, background: '#fff' }}
          />
          {/* Show wallet/join only on desktop in sticky column */}
          <div className="hidden lg:flex flex-col gap-4 mt-8">
            {/* Connect Wallet */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <h2 className="text-xl font-semibold mb-4">Connect Wallet</h2>
              {!walletAddress ? (
                <button
                  onClick={connectWallet}
                  className="w-full bg-purple-600 text-white py-3 px-6 rounded-lg hover:bg-purple-700 transition-colors text-lg font-bold shadow-md"
                >
                  Connect Wallet
                </button>
              ) : (
                <div className="flex items-center justify-between gap-2">
                  <p className="text-gray-600 font-mono">Connected: {shortenAddress(walletAddress)}</p>
                  <button
                    onClick={disconnectWallet}
                    className="bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 transition-colors font-semibold shadow"
                  >
                    Disconnect
                  </button>
                </div>
              )}
            </div>
            {/* Join Raffle */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <h2 className="text-xl font-semibold mb-4">Join Raffle</h2>
              <button
                onClick={joinRaffle}
                disabled={!walletAddress || isLoading}
                className={`w-full py-3 px-6 rounded-lg transition-colors text-lg font-bold shadow-md ${
                  !walletAddress || isLoading
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-green-600 hover:bg-green-700 text-white'
                }`}
              >
                {isLoading ? 'Processing...' : 'Join Raffle (1M $SIMIO)'}
              </button>
              {transactionStatus === 'success' && (
                <p className="mt-4 text-green-600 text-center font-semibold">Transaction successful!</p>
              )}
              {transactionStatus === 'error' && (
                <p className="mt-4 text-red-600 text-center font-semibold">{errorMessage}</p>
              )}
            </div>
          </div>
        </div>
        {/* Right: Content */}
        <div className="flex-1 flex flex-col gap-8 justify-center w-full max-w-2xl mx-auto">
          {/* Header */}
          <div className="mb-0 text-center lg:text-left">
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-2 tracking-tight">Simio Raffle</h1>
            <p className="text-lg md:text-xl text-gray-700 font-medium">
              Join with <span className="font-bold text-purple-700">1M $SIMIO</span> and win <span className="font-bold text-green-700">2M!</span> The raffle automatically when 3 players have joined.
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
                  <li>A random winner is selected by the smart contract</li>
                </ol>
              </div>
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-xl">
                <h3 className="font-semibold text-lg mb-2 text-green-800">Prize Distribution (3M $SIMIO Total):</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between bg-white/60 p-2 rounded-lg">
                    <span className="flex items-center gap-2"><span className="text-xl">🥇</span>1st place (Winner)</span>
                    <span className="font-semibold">2,000,000 $SIMIO</span>
                  </div>
                  <div className="flex items-center justify-between bg-white/60 p-2 rounded-lg">
                    <span className="flex items-center gap-2"><span className="text-xl">🥈</span>2nd place</span>
                    <span className="font-semibold">300,000 $SIMIO</span>
                  </div>
                  <div className="flex items-center justify-between bg-white/60 p-2 rounded-lg">
                    <span className="flex items-center gap-2"><span className="text-xl">🥉</span>3rd place</span>
                    <span className="font-semibold">200,000 $SIMIO</span>
                  </div>
                  <div className="flex items-center justify-between bg-white/60 p-2 rounded-lg">
                    <span className="flex items-center gap-2"><span className="text-xl">🧘</span>SIMIO Monastery (developer reward)</span>
                    <span className="font-semibold">250,000 $SIMIO</span>
                  </div>
                  <div className="flex items-center justify-between bg-white/60 p-2 rounded-lg">
                    <span className="flex items-center gap-2"><span className="text-xl">🔥</span>Burned (deflationary)</span>
                    <span className="font-semibold">250,000 $SIMIO</span>
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-r from-amber-50 to-yellow-50 p-4 rounded-xl">
                <h3 className="font-semibold text-lg mb-2 text-amber-800">Transparency & Verification</h3>
                <p className="text-amber-700 text-sm">
                  Every raffle round is transparent and executed fully on-chain. Past winners and transactions are publicly visible for verification.
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
            <h2 className="text-xl font-semibold mb-4">Connect Wallet</h2>
            {!walletAddress ? (
              <button
                onClick={connectWallet}
                className="w-full bg-purple-600 text-white py-3 px-6 rounded-lg hover:bg-purple-700 transition-colors text-lg font-bold shadow-md"
              >
                Connect Wallet
              </button>
            ) : (
              <div className="flex items-center justify-between gap-2">
                <p className="text-gray-600 font-mono">Connected: {shortenAddress(walletAddress)}</p>
                <button
                  onClick={disconnectWallet}
                  className="bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 transition-colors font-semibold shadow"
                >
                  Disconnect
                </button>
              </div>
            )}
          </div>

          {/* Participation Section (MOBILE ONLY) */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-4 border border-gray-100 block lg:hidden">
            <h2 className="text-xl font-semibold mb-4">Join Raffle</h2>
            <button
              onClick={joinRaffle}
              disabled={!walletAddress || isLoading}
              className={`w-full py-3 px-6 rounded-lg transition-colors text-lg font-bold shadow-md ${
                !walletAddress || isLoading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-green-600 hover:bg-green-700 text-white'
              }`}
            >
              {isLoading ? 'Processing...' : 'Join Raffle (1M $SIMIO)'}
            </button>
            {transactionStatus === 'success' && (
              <p className="mt-4 text-green-600 text-center font-semibold">Transaction successful!</p>
            )}
            {transactionStatus === 'error' && (
              <p className="mt-4 text-red-600 text-center font-semibold">{errorMessage}</p>
            )}
          </div>

          {/* Raffle Status Section */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <h2 className="text-xl font-semibold mb-4">Raffle Status</h2>
            <div className="space-y-2">
              <div>
                <p className="text-gray-600 font-medium">
                  Current Participants: <span className="font-bold text-purple-700">{currentParticipants}</span> of <span className="font-bold">{requiredParticipants}</span>
                </p>
              </div>
              <div>
                <p className="text-gray-600 font-medium">Last Winner: <span className="font-mono">{lastWinner.address}</span></p>
                <p className="text-gray-500 text-sm font-mono">Transaction: {lastWinner.txHash}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Sticky Connect Wallet for mobile */}
      {!walletAddress && showStickyWallet && (
        <div className="fixed bottom-0 left-0 w-full z-50 block lg:hidden">
          <div className="bg-white border-t border-gray-200 shadow-2xl p-4 flex flex-col items-center">
            <button
              onClick={connectWallet}
              className="w-full bg-purple-600 text-white py-3 px-6 rounded-lg hover:bg-purple-700 transition-colors text-lg font-bold shadow-md"
            >
              Connect Wallet
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RafflePage; 