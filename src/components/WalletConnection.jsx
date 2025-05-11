import { useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { toast } from 'react-toastify';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const WalletConnection = () => {
  const { publicKey, connected } = useWallet();

  useEffect(() => {
    if (connected && publicKey) {
      const storedAffiliate = JSON.parse(localStorage.getItem('simio_affiliate_id') || '{}');
      const affiliateId = storedAffiliate.id;
      if (!affiliateId || !/^[A-Z0-9]{5}$/.test(affiliateId)) return;

      const consent = localStorage.getItem('cookie_consent');
      if (consent === 'refused') {
        // Only use localStorage if cookies are refused
        fetch(`${API_BASE_URL}/affiliate/track`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ participantAddress: publicKey.toBase58(), affiliateId }),
        })
          .then(response => response.json())
          .then(data => {
            if (!data.success) {
              toast.error(data.error || 'Failed to track affiliate');
            }
          })
          .catch(err => {
            console.error('Track error:', err);
          });
      }
      // Cookie is sent automatically if consent is 'accepted'
    }
  }, [connected, publicKey]);

  return null;
};

export default WalletConnection; 