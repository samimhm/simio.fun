import Hero from './components/Hero';
import CampaignSpeech from './components/CampaignSpeech';
import DexScreenerChart from './components/DexScreenerChart';
import RafflePromo from './components/RafflePromo';
import Roadmap from './components/Roadmap';
import Tokenomics from './components/Tokenomics';
import MemeGallery from './components/MemeGallery';
import Dao from './components/Dao';
import StickyBuyButton from './components/StickyBuyButton';

const Home = () => (
  <div className="min-h-screen pb-24">
    <Hero />
    <CampaignSpeech />
    <DexScreenerChart />
    <RafflePromo />
    <Roadmap />
    <Tokenomics />
    <MemeGallery />
    <Dao />
    <StickyBuyButton />
  </div>
);

export default Home; 