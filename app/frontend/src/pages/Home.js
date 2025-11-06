import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="text-center py-16 bg-gradient-to-r from-maroon-700 to-gold-600 text-white rounded-lg">
        <h1 className="text-5xl font-bold mb-4">
          Welcome to SunDevilSync 2.0
        </h1>
        <p className="text-xl mb-8">
          Earn NFT badges for attending campus events. Collect, trade, and showcase your achievements!
        </p>
        <div className="space-x-4">
          <Link
            to="/events"
            className="bg-white text-maroon-900 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition inline-block"
          >
            Browse Events
          </Link>
          <Link
            to="/register"
            className="bg-gold-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-gold-700 transition inline-block"
          >
            Get Started
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="grid md:grid-cols-3 gap-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-4xl mb-4">🎫</div>
          <h3 className="text-xl font-bold mb-2">Attend Events</h3>
          <p className="text-gray-600">
            Discover and attend exciting campus events. Check in with QR codes.
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-4xl mb-4">🏆</div>
          <h3 className="text-xl font-bold mb-2">Earn NFT Badges</h3>
          <p className="text-gray-600">
            Get blockchain-verified achievement badges for participation and wins.
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-4xl mb-4">✨</div>
          <h3 className="text-xl font-bold mb-2">Collect & Trade</h3>
          <p className="text-gray-600">
            Build your collection, trade collectibles, and showcase your achievements.
          </p>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-white p-8 rounded-lg shadow">
        <h2 className="text-3xl font-bold mb-6 text-center">How It Works</h2>
        <ol className="space-y-4 max-w-2xl mx-auto">
          <li className="flex items-start">
            <span className="bg-maroon-900 text-white rounded-full w-8 h-8 flex items-center justify-center mr-4 flex-shrink-0">
              1
            </span>
            <div>
              <strong>Register & Connect Wallet:</strong> Create an account and link your MetaMask wallet.
            </div>
          </li>
          <li className="flex items-start">
            <span className="bg-maroon-900 text-white rounded-full w-8 h-8 flex items-center justify-center mr-4 flex-shrink-0">
              2
            </span>
            <div>
              <strong>Browse Events:</strong> Find events you're interested in and enroll.
            </div>
          </li>
          <li className="flex items-start">
            <span className="bg-maroon-900 text-white rounded-full w-8 h-8 flex items-center justify-center mr-4 flex-shrink-0">
              3
            </span>
            <div>
              <strong>Check In:</strong> Scan the QR code at the event venue to check in.
            </div>
          </li>
          <li className="flex items-start">
            <span className="bg-maroon-900 text-white rounded-full w-8 h-8 flex items-center justify-center mr-4 flex-shrink-0">
              4
            </span>
            <div>
              <strong>Earn NFT Badge:</strong> Receive your blockchain-verified achievement badge automatically.
            </div>
          </li>
        </ol>
      </section>
    </div>
  );
};

export default Home;
