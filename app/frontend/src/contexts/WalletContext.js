import React, { createContext, useContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';

const WalletContext = createContext();

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within WalletProvider');
  }
  return context;
};

export const WalletProvider = ({ children }) => {
  const [account, setAccount] = useState(null);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [chainId, setChainId] = useState(null);
  const [connecting, setConnecting] = useState(false);

  // Connect wallet
  const connectWallet = async () => {
    if (!window.ethereum) {
      alert('Please install MetaMask!');
      return;
    }

    try {
      setConnecting(true);
      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.send('eth_requestAccounts', []);
      const signer = await provider.getSigner();
      const network = await provider.getNetwork();

      setProvider(provider);
      setSigner(signer);
      setAccount(accounts[0]);
      setChainId(Number(network.chainId));

      // Save to localStorage
      localStorage.setItem('walletConnected', 'true');
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      alert('Failed to connect wallet');
    } finally {
      setConnecting(false);
    }
  };

  // Disconnect wallet
  const disconnectWallet = () => {
    setAccount(null);
    setProvider(null);
    setSigner(null);
    setChainId(null);
    localStorage.removeItem('walletConnected');
  };

  // Sign message
  const signMessage = async (message) => {
    if (!signer) throw new Error('No signer available');
    return await signer.signMessage(message);
  };

  // Auto-connect on mount if previously connected
  useEffect(() => {
    const wasConnected = localStorage.getItem('walletConnected');
    if (wasConnected === 'true' && window.ethereum) {
      connectWallet();
    }
  }, []);

  // Listen for account changes
  useEffect(() => {
    if (window.ethereum) {
      const handleAccountsChanged = (accounts) => {
        if (accounts.length === 0) {
          disconnectWallet();
        } else {
          setAccount(accounts[0]);
        }
      };

      const handleChainChanged = (chainId) => {
        setChainId(Number(chainId));
        window.location.reload();
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, []);

  const value = {
    account,
    provider,
    signer,
    chainId,
    connecting,
    connectWallet,
    disconnectWallet,
    signMessage,
    isConnected: !!account
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
};
