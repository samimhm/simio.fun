import Hero from './components/Hero';
import CampaignSpeech from './components/CampaignSpeech';
import Roadmap from './components/Roadmap';
import Tokenomics from './components/Tokenomics';
import MemeGallery from './components/MemeGallery';
import Dao from './components/Dao';
import Footer from './components/Footer';

function App() {
  return (
    <div className="min-h-screen">
      <Hero />
      <CampaignSpeech />
      <Roadmap />
      <Tokenomics />
      <MemeGallery />
      <Dao />
      <Footer />
    </div>
  );
}

export default App;
