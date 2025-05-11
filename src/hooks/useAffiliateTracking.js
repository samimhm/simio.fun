import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';

const useAffiliateTracking = () => {
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const affiliateId = searchParams.get('a');
    if (!affiliateId || !/^[A-Z0-9]{5}$/.test(affiliateId)) return;

    // Check GDPR consent
    const consent = localStorage.getItem('cookie_consent');
    const thirtyDays = 30 * 24 * 60 * 60 * 1000;

    // Save to localStorage
    localStorage.setItem('simio_affiliate_id', JSON.stringify({
      id: affiliateId,
      timestamp: Date.now()
    }));

    // Set cookie if consent is given
    if (consent === 'accepted') {
      fetch(`https://api.simio.fun/affiliate/set?a=${affiliateId}`, {
        credentials: 'include',
      })
        .then(response => {
          if (!response.ok) {
            return response.json().then(data => {
              throw new Error(data.error || 'Failed to set affiliate cookie');
            });
          }
        })
        .catch(err => {
          console.error('Error setting affiliate cookie:', err);
        });
    }

    // Clean up expired localStorage entries
    const stored = JSON.parse(localStorage.getItem('simio_affiliate_id') || '{}');
    if (stored.timestamp && Date.now() - stored.timestamp > thirtyDays) {
      localStorage.removeItem('simio_affiliate_id');
    }
  }, [searchParams]);
};

export default useAffiliateTracking; 