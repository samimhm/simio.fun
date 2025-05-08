import React from 'react';

const DexScreenerChart = () => (
  <div
    style={{
      width: '100%',
      maxWidth: 1000,
      margin: '32px auto',
      position: 'relative',
    }}
  >
    <div
      id="dexscreener-embed"
      style={{
        position: 'relative',
        width: '100%',
        paddingBottom: '60%', // aspect ratio 5:3
      }}
    >
      <style>{`
        #dexscreener-embed{position:relative;width:100%;padding-bottom:60%;}
        @media(max-width: 600px){#dexscreener-embed{padding-bottom:125%;}}
        @media(min-width:1400px){#dexscreener-embed{padding-bottom:40%;}}
        #dexscreener-embed iframe{position:absolute;width:100%;height:100%;top:0;left:0;border:0;}
      `}</style>
      <iframe
        src="https://dexscreener.com/solana/J6QZf3j5HkTW9jzB2VvugJWaWtyonTi5PbB8YPVhCqbm?embed=1&loadChartSettings=0&trades=0&tabs=0&info=0&chartLeftToolbar=0&chartDefaultOnMobile=1&chartTheme=dark&theme=dark&chartStyle=1&chartType=usd&interval=15"
        title="DexScreener Chart"
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          top: 0,
          left: 0,
          border: 0,
          borderRadius: 12,
        }}
        allowFullScreen
      ></iframe>
    </div>
  </div>
);

export default DexScreenerChart; 