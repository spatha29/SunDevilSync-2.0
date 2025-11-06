import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WalletProvider } from './contexts/WalletContext';
import { AuthProvider } from './contexts/AuthContext';

// Pages
import Home from './pages/Home';
import Events from './pages/Events';
import EventDetail from './pages/EventDetail';
import MyBadges from './pages/MyBadges';
import Verify from './pages/Verify';
import Admin from './pages/Admin';
import Login from './pages/Login';
import Register from './pages/Register';

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <WalletProvider>
        <AuthProvider>
          <Router>
            <div className="min-h-screen flex flex-col bg-gray-50">
              <Navbar />
              <main className="flex-grow container mx-auto px-4 py-8">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/events" element={<Events />} />
                  <Route path="/events/:id" element={<EventDetail />} />
                  <Route path="/my-badges" element={<MyBadges />} />
                  <Route path="/verify" element={<Verify />} />
                  <Route path="/verify/:tokenId" element={<Verify />} />
                  <Route path="/admin/*" element={<Admin />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                </Routes>
              </main>
              <Footer />
            </div>
          </Router>
        </AuthProvider>
      </WalletProvider>
    </QueryClientProvider>
  );
}

export default App;
