import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useWallet } from '../contexts/WalletContext';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const { account, connectWallet, disconnectWallet, isConnected } = useWallet();

  return (
    <nav className="bg-maroon-900 text-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold">☀️ SunDevilSync</span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex space-x-6">
            <Link to="/events" className="hover:text-gold-500 transition">
              Events
            </Link>
            {isAuthenticated && (
              <Link to="/my-badges" className="hover:text-gold-500 transition">
                My Badges
              </Link>
            )}
            <Link to="/verify" className="hover:text-gold-500 transition">
              Verify
            </Link>
            {user?.roles?.includes('admin') && (
              <Link to="/admin" className="hover:text-gold-500 transition">
                Admin
              </Link>
            )}
          </div>

          {/* Auth & Wallet */}
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <span className="text-sm">Hello, {user.name}</span>
                {isConnected ? (
                  <button
                    onClick={disconnectWallet}
                    className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded text-sm"
                  >
                    {account.slice(0, 6)}...{account.slice(-4)}
                  </button>
                ) : (
                  <button
                    onClick={connectWallet}
                    className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-sm"
                  >
                    Connect Wallet
                  </button>
                )}
                <button
                  onClick={logout}
                  className="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded text-sm"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="hover:text-gold-500 transition"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-gold-600 hover:bg-gold-700 px-4 py-2 rounded text-sm"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
