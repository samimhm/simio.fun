import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-white/90 backdrop-blur border-t border-gray-200 shadow-sm py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* About Section */}
          <div>
            <h3 className="text-lg font-extrabold mb-4 text-gray-900">About #SIMIO</h3>
            <p className="text-gray-600">
              Join the #SIMIO revolution - where memes meet blockchain technology.
              The most entertaining and engaging crypto experience awaits!
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-extrabold mb-4 text-gray-900">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-700 hover:text-purple-700 hover:underline transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/raffle" className="text-gray-700 hover:text-purple-700 hover:underline transition-colors">
                  Raffle
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-gray-700 hover:text-purple-700 hover:underline transition-colors">
                  Terms & Conditions
                </Link>
              </li>
            </ul>
          </div>

          {/* Social Links */}
          <div>
            <h3 className="text-lg font-extrabold mb-4 text-gray-900">Connect With Us</h3>
            <div className="flex space-x-4">
              <a href="https://x.com/SIMIO_FUN" target="_blank" rel="noopener noreferrer" className="text-gray-700 hover:text-purple-700 hover:underline transition-colors">
                Twitter
              </a>
              <a href="https://t.me/+hqCsvBRbC4QwMjc0" target="_blank" rel="noopener noreferrer" className="text-gray-700 hover:text-purple-700 hover:underline transition-colors">
                Telegram
              </a>
              {/* <a href="https://discord.gg/simio" target="_blank" rel="noopener noreferrer" className="text-gray-700 hover:text-purple-700 hover:underline transition-colors">
                Discord
              </a> */}
            </div>
          </div>
        </div>

        <div className="border-t border-gray-100 mt-8 pt-8 text-center text-gray-500 text-sm">
          <p>&copy; {new Date().getFullYear()} #SIMIO. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 