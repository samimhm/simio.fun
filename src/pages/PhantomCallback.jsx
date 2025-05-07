import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const PhantomCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // RafflePage handles the callback in its useEffect
    navigate('/raffle');
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fdf6e3]">
      <p className="text-lg text-gray-700">Processing Phantom connection...</p>
    </div>
  );
};

export default PhantomCallback; 