import { useState, useEffect, useCallback } from 'react';
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
  
  return new Promise((resolve) => {
    let hasApp = false;
    const timeout = setTimeout(() => resolve(false), 1000);
    
    // Încercăm să deschidem aplicația Phantom
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    iframe.src = 'phantom://';
    
    iframe.onload = () => {
      hasApp = true;
      clearTimeout(timeout);
      resolve(true);
    };
    
    iframe.onerror = () => {
      clearTimeout(timeout);
      resolve(false);
    };
    
    document.body.appendChild(iframe);
    setTimeout(() => {
      document.body.removeChild(iframe);
      if (!hasApp) resolve(false);
    }, 1000);
  });
};

/**
 * Hook pentru gestionarea conectării și deconectării wallet-ului Phantom.
 * Suportă extensia Phantom, Phantom SDK și aplicația mobilă Phantom.
 * @returns {object} Obiect cu starea și metodele wallet-ului.
 */
export const usePhantomWallet = () => {
  const [walletAddress, setWalletAddress] = useState(null);
  const [phantom, setPhantom] = useState(null);
  const [useExtension, setUseExtension] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isMobile, setIsMobile] = useState(false);
  const [showInstallModal, setShowInstallModal] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const location = useLocation();
  const navigate = useNavigate();
  const isExtensionAvailable = isPhantomExtensionAvailable();

  // Detectează dispozitivul mobil
  useEffect(() => {
    let isMounted = true;
    const checkMobile = async () => {
      const mobile = isMobileDevice();
      if (isMounted) {
        setIsMobile(mobile);
        const postInstallPath = localStorage.getItem('postInstallRedirect');
        if (postInstallPath && mobile) {
          localStorage.removeItem('postInstallRedirect');
          navigate(postInstallPath);
        }
      }
    };
    checkMobile();
    return () => { isMounted = false; };
  }, [navigate]);

  // Inițializează Phantom (extensie sau SDK)
  useEffect(() => {
    let isMounted = true;
    const init = async () => {
      if (isPhantomExtensionAvailable()) {
        if (isMounted) {
          setUseExtension(true);
          setPhantom(window.solana);
          console.log('[Phantom] Folosesc extensia Phantom (window.solana)');
        }
      } else {
        try {
          const phantomInstance = await createPhantom({
            position: Position.bottomRight,
            hideLauncherBeforeOnboarded: false,
            zIndex: 10000,
          });
          if (isMounted) {
            phantomInstance.show();
            setPhantom(phantomInstance);
            setUseExtension(false);
            console.log('[Phantom] Folosesc Phantom SDK embedded');
          }
        } catch (error) {
          console.error('Failed to initialize Phantom SDK:', error);
          if (isMounted) {
            setErrorMessage('Failed to initialize Phantom wallet.');
            toast.error('Failed to initialize Phantom wallet');
          }
        }
      }
    };
    init();
    return () => { isMounted = false; };
  }, []);

  // Verifică starea conexiunii și resetează isConnecting
  useEffect(() => {
    let isMounted = true;
    const checkConnection = async () => {
      if (!phantom || !isMounted || walletAddress) return;
      if (isConnecting) {
        const timeout = setTimeout(() => {
          if (isMounted && !walletAddress) {
            setIsConnecting(false);
            setShowInstallModal(true);
            toast.info('Connection not completed. Please try again.');
          }
        }, 10000);
        return () => clearTimeout(timeout);
      }
    };
    checkConnection();
    return () => { isMounted = false; };
  }, [phantom, walletAddress, isConnecting]);

  // Gestionează callback-ul Phantom și conexiunea automată
  useEffect(() => {
    let isMounted = true;
    const handleConnection = async () => {
      if (!phantom || !isMounted) return;

      if (location.pathname === '/phantom-callback') {
        try {
          setIsConnecting(true);
          const result = await (useExtension ? window.solana.connect() : phantom.solana.connect());
          const address = result.publicKey?.toBase58
            ? result.publicKey.toBase58()
            : result.publicKey?.toString?.() || result.publicKey || result;

          if (isMounted && typeof address === 'string' && address.length > 0) {
            setWalletAddress(address);
            toast.success('Wallet connected!');
            navigate('/raffle');
          } else {
            throw new Error('Invalid wallet address received');
          }
        } catch (error) {
          console.error('Error handling Phantom callback:', error);
          if (isMounted) {
            setErrorMessage(`Failed to connect wallet: ${error.message || 'Unknown error'}`);
            toast.error('Failed to connect wallet');
            setShowInstallModal(true);
            navigate('/raffle');
          }
        } finally {
          if (isMounted) setIsConnecting(false);
        }
      } else {
        try {
          const result = await (useExtension
            ? window.solana.connect({ onlyIfTrusted: true })
            : phantom.solana.connect({ onlyIfTrusted: true }));
          const address = result.publicKey?.toBase58
            ? result.publicKey.toBase58()
            : result.publicKey?.toString?.() || result.publicKey || result;

          if (isMounted && typeof address === 'string' && address.length > 0) {
            setWalletAddress(address);
          }
        } catch (error) {
          console.debug('No trusted connection found:', error);
        }
      }
    };
    handleConnection();
    return () => { isMounted = false; };
  }, [phantom, useExtension, location, navigate]);

  /**
   * Conectează wallet-ul Phantom cu maxim 3 încercări.
   * @param {number} [retries=3] - Numărul de încercări rămase.
   */
  const connectWallet = useCallback(async (retries = 3) => {
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
    setRetryCount(0);

    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Connection timed out')), 5000);
    });

    try {
      toast.info('Opening Phantom wallet...');
      localStorage.setItem('postInstallRedirect', window.location.pathname);
      const result = await Promise.race([
        useExtension ? window.solana.connect() : phantom.solana.connect(),
        timeoutPromise,
      ]);
      const address = result.publicKey?.toBase58
        ? result.publicKey.toBase58()
        : result.publicKey?.toString?.() || result.publicKey || result;

      if (typeof address !== 'string' || address.length === 0) {
        throw new Error('Invalid wallet address');
      }

      setWalletAddress(address);
      setShowInstallModal(false);
      toast.success('Wallet connected!');
    } catch (error) {
      console.error('Error connecting wallet:', error);
      if (retries > 1) {
        console.debug(`Retrying connection (${retries - 1} attempts left)`);
        setRetryCount(prev => prev + 1);
        setTimeout(() => connectWallet(retries - 1), 1000);
        return;
      }
      setErrorMessage(`Failed to connect wallet: ${error.message || 'Unknown error'}`);
      if (error.message.includes('rejected')) {
        toast.error('Connection rejected by user');
      } else if (error.message.includes('timed out')) {
        toast.error('Connection timed out. Please try again.');
      } else {
        setShowInstallModal(true);
        toast.error('Failed to connect wallet. Please try again or install Phantom app.');
      }
    } finally {
      setIsConnecting(false);
    }
  }, [phantom, useExtension, isConnecting]);

  /**
   * Reîncercă conectarea după eșecul conectării.
   */
  const retryConnection = useCallback(async () => {
    setShowInstallModal(false);
    await connectWallet();
  }, [connectWallet]);

  /**
   * Deconectează wallet-ul Phantom.
   */
  const disconnectWallet = useCallback(async () => {
    if (!phantom || !walletAddress) return;
    try {
      await (useExtension ? window.solana.disconnect() : phantom.solana.disconnect());
      setWalletAddress(null);
      setErrorMessage('');
      setShowInstallModal(false);
      toast.info('Wallet disconnected');
    } catch (error) {
      console.error('Error disconnecting wallet:', error);
      setErrorMessage(`Failed to disconnect wallet: ${error.message || 'Unknown error'}`);
      toast.error('Failed to disconnect wallet');
    }
  }, [phantom, walletAddress, useExtension]);

  return {
    walletAddress,
    connectWallet,
    disconnectWallet,
    retryConnection,
    isConnecting,
    errorMessage,
    setErrorMessage,
    phantom,
    useExtension,
    isExtensionAvailable,
    isMobile,
    isPhantomAppAvailable: isMobile,
    showInstallModal,
    setShowInstallModal,
  };
}; 