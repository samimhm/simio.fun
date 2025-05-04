import { motion } from 'framer-motion';
import { ArrowDownTrayIcon } from '@heroicons/react/24/outline';

const MemeGallery = () => {
  const memes = [
    {
      id: 1,
      caption: "When you see the chart going up"
    },
    {
      id: 2,
      caption: "The only honest politician"
    },
    {
      id: 3,
      caption: "To the moon, comrades!"
    }
  ];

  return (
    <section id="memes" className="py-20">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="section-title">Election Posters & Meme Pack</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {memes.map((meme, index) => (
            <motion.div
              key={meme.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="group relative"
            >
              <img 
                src={`/memes/${meme.id}.png`} 
                alt={`Meme ${meme.id}`}
                className="w-full h-auto rounded-lg shadow-lg transition-transform group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 rounded-lg flex items-center justify-center">
                <p className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-center px-4">
                  {meme.caption}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <a 
            href="/memes.zip" 
            className="btn-primary inline-flex items-center gap-2"
            download
          >
            <ArrowDownTrayIcon className="w-5 h-5" />
            Download Meme Pack (.zip)
          </a>
        </motion.div>
      </div>
    </section>
  );
};

export default MemeGallery; 