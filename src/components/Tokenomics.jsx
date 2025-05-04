import { motion } from 'framer-motion';
import { BanknotesIcon, NoSymbolIcon, UserGroupIcon, WalletIcon } from '@heroicons/react/24/outline';

const Tokenomics = () => {
  const stats = [
    {
      icon: BanknotesIcon,
      title: "Total Supply",
      value: "1,000,000,000 $SIMIO"
    },
    {
      icon: NoSymbolIcon,
      title: "Tax",
      value: "0%"
    },
    {
      icon: UserGroupIcon,
      title: "Team & VC",
      value: "None"
    },
    {
      icon: WalletIcon,
      title: "Community Owned",
      value: "100%"
    }
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="section-title">National Budget</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-white/80 p-6 rounded-xl shadow-lg text-center"
            >
              <div className="w-12 h-12 bg-romanian-yellow bg-opacity-10 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <stat.icon className="w-6 h-6 text-romanian-yellow" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{stat.title}</h3>
              <p className="text-2xl font-bold text-romanian-blue">{stat.value}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Tokenomics; 