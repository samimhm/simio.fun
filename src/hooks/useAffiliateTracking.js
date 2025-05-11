import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const useAffiliateTracking = () => {
  const { search } = useLocation();

  useEffect(() => {
    const searchParams = new URLSearchParams(search);
    const affiliateId = searchParams.get('a');
    if (!affiliateId || !/^[A-Z0-9]{5}$/.test(affiliateId)) return;

    const stored = JSON.parse(localStorage.getItem('simio_affiliate_id') || '{}');
    if (stored.timestamp && Date.now() - stored.timestamp > 30 * 24 * 60 * 60 * 1000) {
      localStorage.removeItem('simio_affiliate_id');
    }

    localStorage.setItem('simio_affiliate_id', JSON.stringify({ id: affiliateId, timestamp: Date.now() }));
    const walletAddress = window.walletAddress || '';
    fetch(`${import.meta.env.VITE_API_BASE_URL}/affiliate/track`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ participantAddress: walletAddress, affiliateId }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) console.log('Affiliate tracking successful');
        else console.error('Affiliate tracking failed:', data.error);
      })
      .catch((err) => console.error('Error tracking affiliate:', err));
  }, [search]);
};

export default useAffiliateTracking; 