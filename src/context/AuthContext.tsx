import { createContext, useContext, useState, type ReactNode } from 'react';
import type { User } from '../types';
import { USERS } from '../data/mockData';

interface AuthContextType {
  user: User | null;
  isAdmin: boolean;
  login: (role: 'admin' | 'student') => void;
  logout: () => void;
  allUsers: User[];
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const login = (role: 'admin' | 'student') => {
    const found = USERS.find((u) => u.role === role);
    if (found) setUser(found);
  };

  const logout = () => setUser(null);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAdmin: user?.role === 'admin',
        login,
        logout,
        allUsers: USERS,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
