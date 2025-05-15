import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePhantomWallet } from '../hooks/usePhantomWallet';
import { toast } from 'react-toastify';

const PhantomCallback = () => {
  const navigate = useNavigate();
  const { 
    connectWallet, 
    isConnecting, 
    errorMessage, 
    walletAddress,
    retryConnection,
    showInstallModal,
    setShowInstallModal 
  } = usePhantomWallet();

  useEffect(() => {
    const handleCallback = async () => {
      if (walletAddress) {
        navigate('/raffle');
        return;
      }

      try {
        await connectWallet();
        if (walletAddress) {
          navigate('/raffle');
        }
      } catch (error) {
        console.error('Failed to process Phantom callback:', error);
        setShowInstallModal(true);
        toast.error('Failed to connect wallet. Please try again or install Phantom app.');
      }
    };

    handleCallback();
  }, [connectWallet, walletAddress, navigate, setShowInstallModal]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#fdf6e3]">
      <p className="text-lg text-gray-700">
        {isConnecting ? 'Processing Phantom connection...' : 'Connection failed. Please try again.'}
      </p>
      
      {errorMessage && (
        <div className="mt-4 text-red-600">
          {errorMessage}
          <button
            onClick={retryConnection}
            className="ml-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      )}

      {showInstallModal && (
        <div className="mt-4 p-4 bg-white rounded-lg shadow-lg">
          <p className="text-gray-800 mb-4">
            Please install Phantom app to continue or try connecting again.
          </p>
          <div className="flex gap-4">
            <button
              onClick={retryConnection}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
            <button
              onClick={() => {
                const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
                const storeUrl = isIOS
                  ? 'https://apps.apple.com/app/phantom-solana-wallet/id1598432977'
                  : 'https://play.google.com/store/apps/details?id=app.phantom';
                window.open(storeUrl, '_blank');
              }}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
            >
              Install Phantom
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PhantomCallback; 