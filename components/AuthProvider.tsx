// AuthProvider: Provides authentication state and actions to the app using React context.
// Uses the mock auth utility in lib/auth.ts
// Wrap your app with <AuthProvider> in layout.tsx

import React, { createContext, useContext, useEffect, useState } from 'react';
import { getCurrentUser, login as mockLogin, register as mockRegister, logout as mockLogout, User } from '../lib/auth';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => void;
  register: (name: string, email: string, password: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    setUser(getCurrentUser());
  }, []);

  const login = (email: string, password: string) => {
    const user = mockLogin(email, password);
    setUser(user);
  };

  const register = (name: string, email: string, password: string) => {
    const user = mockRegister(name, email, password);
    setUser(user);
  };

  const logout = () => {
    mockLogout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 