import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Hero from './components/Hero';
import CampaignSpeech from './components/CampaignSpeech';
import Roadmap from './components/Roadmap';
import Tokenomics from './components/Tokenomics';
import MemeGallery from './components/MemeGallery';
import Dao from './components/Dao';
import Footer from './components/Footer';
import StickyBuyButton from './components/StickyBuyButton';
import RafflePage from './pages/RafflePage';
import TermsPage from './pages/TermsPage';
import Navbar from './components/Navbar';
import ScrollToTop from './components/ScrollToTop';

function App() {
  return (
    <Router>
      <ScrollToTop />
      <Navbar />
      <div>
        <Routes>
          <Route path="/raffle" element={<RafflePage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/" element={
            <div className="min-h-screen pb-24">
              <Hero />
              <CampaignSpeech />
              <Roadmap />
              <Tokenomics />
              <MemeGallery />
              <Dao />
              <StickyBuyButton />
            </div>
          } />
        </Routes>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
