import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { UserProfile } from './types';

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  login: (user: UserProfile, token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  login: () => {},
  logout: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('cryptohub_user');
    return saved ? JSON.parse(saved) : null;
  });

  const isAuthenticated = !!user;

  const login = useCallback((u: UserProfile, token: string) => {
    setUser(u);
    localStorage.setItem('cryptohub_user', JSON.stringify(u));
    localStorage.setItem('cryptohub_token', token);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('cryptohub_user');
    localStorage.removeItem('cryptohub_token');
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('cryptohub_token');
    if (!token) {
      setUser(null);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
