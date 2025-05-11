import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';

const CookieConsent = () => {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookie_consent');
    if (!consent) {
      setShowBanner(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookie_consent', 'accepted');
    setShowBanner(false);
    toast.success('Cookie preferences saved');
  };

  const handleRefuse = () => {
    localStorage.setItem('cookie_consent', 'refused');
    setShowBanner(false);
    toast.info('Non-essential cookies disabled');
  };

  if (!showBanner) return null;

  return (
    <motion.div
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      className="fixed bottom-0 left-0 right-0 bg-gray-800 text-white p-4 flex flex-col sm:flex-row items-center justify-between"
    >
      <p className="text-sm mb-4 sm:mb-0">
        We use cookies. Learn more in our{' '}
        <Link to="/terms" className="underline">Terms & Conditions</Link>.
      </p>
      <div className="flex space-x-4">
        <button
          onClick={handleAccept}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Accept
        </button>
        {/* <button
          onClick={handleRefuse}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
        >
          Refuse
        </button> */}
      </div>
    </motion.div>
  );
};

export default CookieConsent; 