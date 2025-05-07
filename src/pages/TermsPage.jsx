import { Link } from 'react-router-dom';

const TermsPage = () => {
  return (
    <div className="min-h-screen bg-gray-100 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8">
          <Link to="/" className="text-blue-600 hover:text-blue-800 mb-6 inline-block">
            ← Back to Home
          </Link>

          <h1 className="text-3xl font-bold mb-8">Terms and Conditions</h1>

          <div className="space-y-6 text-gray-700">
            <section>
              <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
              <p>
                Welcome to the SIMIO project. These Terms and Conditions govern your use of our platform,
                including the $SIMIO token, the Simio Raffle game, and all related services. By interacting with
                any part of the SIMIO ecosystem, you agree to these Terms in full.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">2. Definitions</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>"SIMIO"</strong> – the meme-based crypto project and social movement.</li>
                <li><strong>"Platform"</strong> – websites, applications, communication channels, and any other services offered under the SIMIO brand.</li>
                <li><strong>"User"</strong> – any individual or entity interacting with the platform.</li>
                <li><strong>"Token"</strong> – the $SIMIO token used within the ecosystem.</li>
                <li><strong>"Raffle"</strong> – the Simio Raffle game, which may operate off-chain or on-chain.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">3. Current Raffle Implementation</h2>
              <p>
                As of now, the Simio Raffle is managed <strong>off-chain</strong>. All entries, randomness,
                payouts, and verification are coordinated through our backend systems, while public balances
                and winners may be reflected on-chain via token transfers.
              </p>
              <p className="mt-2">
                We strive for fairness, transparency, and traceability, but users must understand that the current version is not fully decentralized.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">4. Future Use of Smart Contracts</h2>
              <p>
                In future versions of the Simio Raffle or other games, SIMIO may transition to smart contract-based systems, either:
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-2">
                <li>Public and verifiable smart contracts deployed on open blockchains (e.g. Solana, Ethereum)</li>
                <li>Private or permissioned smart contracts hosted under SIMIO control</li>
              </ul>
              <p className="mt-2">
                In either case, terms specific to such implementations will be published separately, and interaction will remain voluntary and at users’ own risk.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">5. Token Disclaimer</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>The $SIMIO token is created purely for entertainment, social coordination, and community participation.</li>
                <li>It has no guaranteed value, utility, or future price expectation.</li>
                <li>By acquiring or using $SIMIO, you accept full responsibility for your financial decisions.</li>
                <li>Do not treat $SIMIO as an investment. It's a meme. A glorious one, but still a meme.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">6. Eligibility</h2>
              <p>
                You must be of legal age and allowed by the laws of your jurisdiction to participate in crypto-related games or hold crypto assets.
                We do not verify age or residency, so participation is your responsibility.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">7. No Warranties</h2>
              <p>
                The SIMIO platform is offered “as is.” No warranties, express or implied, are provided regarding uptime, fairness, accuracy,
                or the availability of services. Glitches may happen. Bugs may occur. Bananas may be lost.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">8. Limitations of Liability</h2>
              <p>
                SIMIO, its creators, and contributors shall not be held liable for any direct or indirect damages
                arising from the use of the platform, including but not limited to financial loss, smart contract bugs,
                or rug-related anxieties. Participation is at your own discretion.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">9. Changes to These Terms</h2>
              <p>
                We reserve the right to update these Terms at any time. Any substantial changes will be announced
                through our official channels. Continued use implies agreement with the latest version.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">10. Contact</h2>
              <p>
                For questions, memes, or philosophical discussions, reach out to us via Telegram or X (@simio_fun),
                or visit our site at <a href="https://simio.fun" className="text-blue-600 hover:underline">simio.fun</a>.
              </p>
            </section>
          </div>

          <div className="mt-12 pt-6 border-t text-sm text-gray-500">
            <p>Last updated: {new Date().toLocaleDateString()}</p>
          </div>

          <div className="mt-8">
            <Link to="/" className="text-blue-600 hover:text-blue-800">
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsPage;
