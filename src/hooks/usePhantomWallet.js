import { useState, useEffect } from 'react';
import { createPhantom, Position } from '@phantom/wallet-sdk';
import { toast } from 'react-toastify';
import { useLocation, useNavigate } from 'react-router-dom';

/**
 * Verifică dacă extensia Phantom este disponibilă în browser.
 * @returns {boolean} True dacă extensia este disponibilă.
 */
const isPhantomExtensionAvailable = () => {
  return typeof window !== 'undefined' && window.solana && window.solana.isPhantom;
};

/**
 * Verifică dacă dispozitivul este mobil.
 * @returns {boolean} True dacă dispozitivul este mobil.
 */
const isMobileDevice = () => {
  return /android|iPhone|iPad|iPod/i.test(navigator.userAgent || navigator.vendor || window.opera);
};

/**
 * Verifică dacă aplicația Phantom este instalată pe dispozitivul mobil.
 * @returns {Promise<boolean>} True dacă aplicația este instalată.
 */
const isPhantomAppInstalled = async () => {
  if (!isMobileDevice()) return false;
  
  try {
    // Încercăm să deschidem aplicația Phantom
    window.location.href = 'phantom://';
    // Dacă ajungem aici, înseamnă că aplicația nu este instalată
    return false;
  } catch (error) {
    return false;
  }
};

/**
 * Hook pentru gestionarea conectării și deconectării wallet-ului Phantom.
 * Suportă atât extensia Phantom, cât și Phantom SDK.
 * @returns {object} Obiect cu starea și metodele wallet-ului.
 */
export const usePhantomWallet = () => {
  const [walletAddress, setWalletAddress] = useState(null);
  const [phantom, setPhantom] = useState(null);
  const [useExtension, setUseExtension] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isMobile, setIsMobile] = useState(false);
  const [isPhantomAppAvailable, setIsPhantomAppAvailable] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Detectează dispozitivul mobil și disponibilitatea aplicației Phantom
  useEffect(() => {
    const checkMobileAndPhantom = async () => {
      const mobile = isMobileDevice();
      setIsMobile(mobile);
      if (mobile) {
        const installed = await isPhantomAppInstalled();
        setIsPhantomAppAvailable(installed);
      }
    };
    checkMobileAndPhantom();
  }, []);

  // Inițializează Phantom (extensie sau SDK)
  useEffect(() => {
    const init = async () => {
      if (isPhantomExtensionAvailable()) {
        setUseExtension(true);
        setPhantom(window.solana);
      } else {
        try {
          const phantomInstance = await createPhantom({
            position: Position.bottomRight,
            hideLauncherBeforeOnboarded: false,
            zIndex: 10000,
          });
          phantomInstance.show();
          setPhantom(phantomInstance);
        } catch (error) {
          setErrorMessage('Failed to initialize Phantom wallet.');
          toast.error('Failed to initialize Phantom wallet');
        }
      }
    };
    init();
  }, []);

  // Gestionează callback-ul Phantom și conexiunea
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
          navigate('/');
        } catch (error) {
          console.error('Error handling Phantom callback:', error);
          setErrorMessage('Failed to connect wallet. Please try again.');
          toast.error('Failed to connect wallet');
          setIsConnecting(false);
          navigate('/');
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

  /**
   * Conectează wallet-ul Phantom.
   */
  const connectWallet = async () => {
    if (!phantom) {
      setErrorMessage('Phantom wallet not initialized.');
      toast.error('Phantom wallet not initialized');
      return;
    }
    if (isConnecting) {
      toast.info('Connection in progress.');
      return;
    }
    setIsConnecting(true);
    setErrorMessage('');
    try {
      if (isMobile && !isPhantomAppAvailable) {
        // Redirecționează către App Store/Play Store
        const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
        const storeUrl = isIOS 
          ? 'https://apps.apple.com/app/phantom-solana-wallet/id1598432977'
          : 'https://play.google.com/store/apps/details?id=app.phantom';
        window.open(storeUrl, '_blank');
        toast.info('Please install Phantom app to continue');
        setIsConnecting(false);
        return;
      }

      const result = await (useExtension ? window.solana.connect() : phantom.solana.connect());
      const address = result.publicKey?.toBase58 ? result.publicKey.toBase58() : result.publicKey?.toString?.() || result.publicKey || result;
      setWalletAddress(address);
      toast.success('Wallet connected!');
    } catch (error) {
      console.error('Error connecting wallet:', error);
      setErrorMessage('Failed to connect wallet. Please ensure Phantom is installed and try again.');
      toast.error('Failed to connect wallet');
    } finally {
      setIsConnecting(false);
    }
  };

  /**
   * Deconectează wallet-ul Phantom.
   */
  const disconnectWallet = async () => {
    if (!phantom || !walletAddress) return;
    try {
      await (useExtension ? window.solana.disconnect() : phantom.solana.disconnect());
      setWalletAddress(null);
      setErrorMessage('');
      toast.info('Wallet disconnected');
    } catch (error) {
      console.error('Error disconnecting wallet:', error);
      setErrorMessage('Failed to disconnect wallet');
      toast.error('Failed to disconnect wallet');
    }
  };

  return {
    walletAddress,
    connectWallet,
    disconnectWallet,
    isConnecting,
    errorMessage,
    setErrorMessage,
    phantom,
    useExtension,
    isMobile,
    isPhantomAppAvailable,
  };
}; 