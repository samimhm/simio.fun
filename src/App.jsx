import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { WalletProvider } from '@solana/wallet-adapter-react';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-phantom';
import { ConnectionProvider } from '@solana/wallet-adapter-react';
import { clusterApiUrl } from '@solana/web3.js';
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
import PhantomCallback from './pages/PhantomCallback';
import AffiliatePage from './pages/AffiliatePage';
import Navbar from './components/Navbar';
import ScrollToTop from './components/ScrollToTop';
import DexScreenerChart from './components/DexScreenerChart';
import CookieConsent from './components/CookieConsent';
import WalletConnection from './components/WalletConnection';
import useAffiliateTracking from './hooks/useAffiliateTracking';
import 'react-toastify/dist/ReactToastify.css';

// Create a wrapper component that uses the hook inside Router context
const AppContent = () => {
  useAffiliateTracking();
  
  return (
    <>
      <ScrollToTop />
      <Navbar />
      <WalletConnection />
      <div>
        <Routes>
          <Route path="/raffle" element={<RafflePage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/phantom-callback" element={<PhantomCallback />} />
          <Route path="/affiliate" element={<AffiliatePage />} />
          <Route path="/" element={
            <div className="min-h-screen pb-24">
              <Hero />
              <CampaignSpeech />
              <DexScreenerChart />
              <Roadmap />
              <Tokenomics />
              <MemeGallery />
              <Dao />
              <StickyBuyButton />
            </div>
          } />
        </Routes>
        <Footer />
        <CookieConsent />
        <ToastContainer position="bottom-right" />
      </div>
    </>
  );
};

function App() {
  const network = WalletAdapterNetwork.Mainnet;
  const endpoint = clusterApiUrl(network);
  const wallets = [new PhantomWalletAdapter()];

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <Router>
          <AppContent />
        </Router>
      </WalletProvider>
    </ConnectionProvider>
  );
}

export default App;
