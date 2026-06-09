import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import apiClient from '../utils/apiClient';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

// Configure axios base URL
apiClient.defaults.withCredentials = true;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('sg_token'));
  const [loading, setLoading] = useState(true);

  // Set axios default auth header whenever token changes
  useEffect(() => {
    if (token) {
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      fetchCurrentUser();
    } else {
      delete apiClient.defaults.headers.common['Authorization'];
      setUser(null);
      setLoading(false);
    }
  }, [token]);

  const fetchCurrentUser = async () => {
    try {
      const { data } = await apiClient.get('/api/auth/me');
      if (data.success) {
        setUser(data.data);
      } else {
        logout();
      }
    } catch {
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const { data } = await apiClient.post('/api/auth/login', { email, password });
    if (data.success) {
      localStorage.setItem('sg_token', data.token);
      setToken(data.token);
      setUser(data.user);
      return data;
    }
    throw new Error(data.error || 'Login failed');
  };

  const register = async (name, email, password, role) => {
    const { data } = await apiClient.post('/api/auth/register', { name, email, password, role });
    if (data.success) {
      localStorage.setItem('sg_token', data.token);
      setToken(data.token);
      setUser(data.user);
      if (data.devVerificationToken) {
        localStorage.setItem('sg_dev_verification_token', data.devVerificationToken);
      }
      return data;
    }
    throw new Error(data.error || 'Registration failed');
  };

  const logout = async () => {
    try {
      await apiClient.get('/api/auth/logout');
    } catch {}
    localStorage.removeItem('sg_token');
    setToken(null);
    setUser(null);
    delete apiClient.defaults.headers.common['Authorization'];
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
