import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { 
  onAuthStateChanged, 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut as firebaseSignOut,
  type User as FirebaseUser
} from 'firebase/auth';
import { auth, googleProvider } from '../firebase';
import type { User } from '../types';
import { USERS } from '../data/mockData';

interface AuthContextType {
  user: User | null;
  isAdmin: boolean;
  isLoading: boolean;
  signInWithGoogle: () => Promise<void>;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  allUsers: User[];
}

const AuthContext = createContext<AuthContextType | null>(null);

// Helper function to map Firebase user to our custom User type
const mapFirebaseUser = (fbUser: FirebaseUser): User => {
  // Check if we have a mock user for this email to retain roles for demo purposes
  const mockMatch = USERS.find(u => u.email === fbUser.email);
  if (mockMatch) return mockMatch;
  
  return {
    id: fbUser.uid,
    name: fbUser.displayName || fbUser.email?.split('@')[0] || 'User',
    email: fbUser.email || '',
    studentId: `STU-${Math.floor(Math.random() * 10000)}`,
    role: 'student', // Default role
    avatarUrl: fbUser.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(fbUser.displayName || fbUser.email || 'User')}&background=random`,
    skills: [],
    department: 'CSE',
    batch: '2024',
    section: 'A'
  };
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (fbUser) => {
      if (fbUser) {
        setUser(mapFirebaseUser(fbUser));
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    return unsubscribe;
  }, []);

  const signInWithGoogle = async () => {
    await signInWithPopup(auth, googleProvider);
  };

  const loginWithEmail = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signUpWithEmail = async (email: string, password: string) => {
    await createUserWithEmailAndPassword(auth, email, password);
  };

  const logout = async () => {
    await firebaseSignOut(auth);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAdmin: user?.role === 'admin',
        isLoading,
        signInWithGoogle,
        loginWithEmail,
        signUpWithEmail,
        logout,
        allUsers: USERS,
      }}
    >
      {isLoading ? (
        <div className="min-h-screen flex items-center justify-center bg-surface-950">
          <div className="w-8 h-8 rounded-full border-4 border-primary-500 border-t-transparent animate-spin"></div>
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
