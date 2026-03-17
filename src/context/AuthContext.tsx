/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { 
  onAuthStateChanged, 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut as firebaseSignOut,
  browserPopupRedirectResolver,
  type User as FirebaseUser
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, googleProvider, db } from '../firebase';
import type { User, UserRole } from '../types';
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

// Helper function to fetch and map Firebase user
const fetchUserProfile = async (fbUser: FirebaseUser): Promise<User> => {
  // Check if we have a mock user for this email
  const mockMatch = USERS.find(u => u.email === fbUser.email);
  
  let role: UserRole = 'student';
  let name = fbUser.displayName || fbUser.email?.split('@')[0] || 'User';

  try {
    const userDocRef = doc(db, 'users', fbUser.uid);
    const userDocSnap = await getDoc(userDocRef);
    if (userDocSnap.exists()) {
      const data = userDocSnap.data();
      if (data.role) role = data.role as UserRole;
      if (data.name) name = data.name;
    }
  } catch (err) {
    console.error("Error fetching user profile", err);
  }

  if (mockMatch) {
    return { ...mockMatch, role, id: fbUser.uid }; // merge mock data with real role/uid
  }
  
  return {
    id: fbUser.uid,
    name,
    email: fbUser.email || '',
    studentId: `STU-${Math.floor(Math.random() * 10000)}`,
    role, // Using role from Firestore
    avatarUrl: fbUser.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`,
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
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        const userProfile = await fetchUserProfile(fbUser);
        setUser(userProfile);
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    return unsubscribe;
  }, []);

  const signInWithGoogle = async () => {
    const result = await signInWithPopup(auth, googleProvider, browserPopupRedirectResolver);
    const fbUser = result.user;
    
    try {
      // Check if user document exists
      const userDoc = await getDoc(doc(db, 'users', fbUser.uid));
      if (!userDoc.exists()) {
        await setDoc(doc(db, 'users', fbUser.uid), {
          uid: fbUser.uid,
          email: fbUser.email,
          name: fbUser.displayName || fbUser.email?.split('@')[0] || 'User',
          role: 'student',
          createdAt: new Date().toISOString()
        });
      }
    } catch (e) {
      console.error("Error creating user profile in Firestore", e);
    }
  };

  const loginWithEmail = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signUpWithEmail = async (email: string, password: string) => {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    const fbUser = result.user;
    
    try {
      await setDoc(doc(db, 'users', fbUser.uid), {
        uid: fbUser.uid,
        email: fbUser.email,
        name: fbUser.email?.split('@')[0] || 'User',
        role: 'student',
        createdAt: new Date().toISOString()
      });
    } catch (e) {
      console.error("Error creating user profile in Firestore", e);
    }
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
