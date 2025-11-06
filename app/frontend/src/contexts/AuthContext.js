import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  // Set axios default header
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [token]);

  // Get current user
  const getCurrentUser = async () => {
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const response = await axios.get(`${API_URL}/auth/me`);
      setUser(response.data.data.user);
    } catch (error) {
      console.error('Failed to get current user:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getCurrentUser();
  }, [token]);

  // Login
  const login = async (email, password) => {
    const response = await axios.post(`${API_URL}/auth/login`, {
      email,
      password
    });

    const { user, token } = response.data.data;
    setUser(user);
    setToken(token);
    localStorage.setItem('token', token);
    return user;
  };

  // Register
  const register = async (email, password, name) => {
    const response = await axios.post(`${API_URL}/auth/register`, {
      email,
      password,
      name
    });

    const { user, token } = response.data.data;
    setUser(user);
    setToken(token);
    localStorage.setItem('token', token);
    return user;
  };

  // Logout
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
  };

  // Link wallet
  const linkWallet = async (wallet, signature) => {
    const response = await axios.post(`${API_URL}/auth/wallet/verify`, {
      wallet,
      signature
    });

    // Update user
    await getCurrentUser();
    return response.data.data;
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    linkWallet,
    hasRole: (role) => user?.roles?.includes(role)
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
