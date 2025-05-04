import Hero from './components/Hero';
import CampaignSpeech from './components/CampaignSpeech';
import Roadmap from './components/Roadmap';
import Tokenomics from './components/Tokenomics';
import MemeGallery from './components/MemeGallery';
import Dao from './components/Dao';
import Footer from './components/Footer';
import StickyBuyButton from './components/StickyBuyButton';

function App() {
  return (
    <div className="min-h-screen pb-24">
      <Hero />
      <CampaignSpeech />
      <Roadmap />
      <Tokenomics />
      <MemeGallery />
      <Dao />
      <Footer />
      <StickyBuyButton />
    </div>
  );
}

export default App;
