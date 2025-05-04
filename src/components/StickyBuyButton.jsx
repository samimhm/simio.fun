import { useEffect, useRef, useState } from 'react';

const StickyBuyButton = () => {
  const [show, setShow] = useState(false);
  const heroRef = useRef(null);

  useEffect(() => {
    const hero = document.getElementById('hero-section');
    if (!hero) return;
    const observer = new window.IntersectionObserver(
      ([entry]) => {
        setShow(!entry.isIntersecting);
      },
      { threshold: 0.1 }
    );
    observer.observe(hero);
    return () => observer.disconnect();
  }, []);

  return show ? (
    <div className="fixed bottom-0 left-0 w-full z-50 flex justify-center pointer-events-none">
      <a
        href="#"
        aria-label="Buy $SIMIO on Pump.fun"
        className="pointer-events-auto m-4 px-8 py-4 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-2xl shadow-xl text-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 w-full max-w-md text-center"
      >
        Buy $SIMIO on Pump.fun
      </a>
    </div>
  ) : null;
};

export default StickyBuyButton; 