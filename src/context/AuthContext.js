// src/context/AuthContext.js
// ─── Même logique que frontend/src/context/AuthContext.js
// ─── localStorage → TokenStore (SecureStore / AsyncStorage)

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService, TokenStore } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchMe = useCallback(async () => {
    try {
      const { data } = await authService.me();
      setUser(data);
    } catch {
      setUser(null);
      await TokenStore.clear();
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    (async () => {
      const token = await TokenStore.getAccess();
      if (token) await fetchMe();
      else setLoading(false);
    })();
  }, [fetchMe]);

  const login = async (credentials) => {
    const { data } = await authService.login(credentials);
    await TokenStore.setTokens(data.access, data.refresh);
    await fetchMe();
  };

  const register = async (formData) => {
    const { data } = await authService.register(formData);
    await TokenStore.setTokens(data.tokens.access, data.tokens.refresh);
    setUser(data.user);
    return data;
  };

  const logout = async () => {
    await TokenStore.clear();
    setUser(null);
  };

  const refreshUser = () => fetchMe();

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
