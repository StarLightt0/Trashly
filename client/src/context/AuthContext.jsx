import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('trashly_token') || null);
  const [loading, setLoading] = useState(true);

  const loadUser = useCallback(async (activeToken) => {
    const t = activeToken || token;
    if (t) {
      try {
        const response = await authAPI.getProfile();
        if (response.data.success) {
          setUser(response.data.user);
        } else {
          logout();
        }
      } catch (err) {
        console.error('Failed to load user profile:', err);
        if (err.response?.status === 401 || err.response?.status === 403) {
          logout();
        }
      }
    }
    setLoading(false);
  }, [token]);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const refreshUser = useCallback(async () => {
    try {
      const response = await authAPI.getProfile();
      if (response.data.success) {
        setUser(response.data.user);
        return response.data.user;
      }
    } catch (err) {
      console.error('Failed to refresh user:', err);
    }
    return null;
  }, []);

  const updateUserPoints = useCallback((newPoints) => {
    if (typeof newPoints === 'number') {
      setUser(prev => prev ? { ...prev, points: newPoints } : prev);
    }
  }, []);

  const updateUserData = useCallback((updatedFields) => {
    setUser(prev => prev ? { ...prev, ...updatedFields } : prev);
  }, []);

  const login = async (email, password) => {
    const response = await authAPI.login({ email, password });
    if (response.data.success) {
      const { token: receivedToken, user: receivedUser } = response.data;
      localStorage.setItem('trashly_token', receivedToken);
      setToken(receivedToken);
      setUser(receivedUser);
      return response.data;
    }
    throw new Error(response.data.message || 'Login gagal.');
  };

  const register = async (name, email, password) => {
    const response = await authAPI.register({ name, email, password });
    if (response.data.success) {
      const { token: receivedToken, user: receivedUser } = response.data;
      localStorage.setItem('trashly_token', receivedToken);
      setToken(receivedToken);
      setUser(receivedUser);
      return response.data;
    }
    throw new Error(response.data.message || 'Registrasi gagal.');
  };

  const logout = () => {
    localStorage.removeItem('trashly_token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        loading,
        login,
        register,
        logout,
        refreshUser,
        updateUserPoints,
        updateUserData
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
