import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import simionLogo from '../assets/simion-2.webp';

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { name: 'Home', to: '/' },
    { name: 'Raffle', to: '/raffle' },
  ];

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-white/90 backdrop-blur border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <img src={simionLogo} alt="Simio Logo" className="h-10 w-10 rounded-full border-2 border-purple-200 bg-white object-cover" />
          <span className="font-extrabold text-xl text-gray-900 hidden sm:inline">Simio</span>
        </Link>
        {/* Desktop Links */}
        <div className="hidden md:flex gap-6 items-center">
          {navLinks.map(link => (
            <Link
              key={link.to}
              to={link.to}
              className={`text-lg font-semibold px-3 py-1 rounded transition-colors duration-200 ${
                location.pathname === link.to
                  ? 'text-purple-700 bg-purple-100'
                  : 'text-gray-700 hover:text-purple-700 hover:bg-purple-50'
              }`}
            >
              {link.name}
            </Link>
          ))}
        </div>
        {/* Mobile Hamburger */}
        <button
          className="md:hidden flex items-center p-2 rounded hover:bg-purple-50 focus:outline-none"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <svg className="h-7 w-7 text-purple-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {menuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
            )}
          </svg>
        </button>
      </div>
      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 shadow-sm">
          <div className="flex flex-col gap-2 px-4 py-3">
            {navLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className={`text-lg font-semibold px-3 py-2 rounded transition-colors duration-200 ${
                  location.pathname === link.to
                    ? 'text-purple-700 bg-purple-100'
                    : 'text-gray-700 hover:text-purple-700 hover:bg-purple-50'
                }`}
                onClick={() => setMenuOpen(false)}
              >
                {link.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar; 