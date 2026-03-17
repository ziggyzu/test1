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
import { doc, getDoc, setDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { auth, googleProvider, db } from '../firebase';
import type { User, UserRole } from '../types';
import { createBatch, getBatchByCode } from '../lib/firestore';

interface AuthContextType {
  user: User | null;
  isAdmin: boolean;
  isLoading: boolean;
  signInWithGoogle: () => Promise<void>;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (
    email: string,
    password: string,
    name: string,
    role: UserRole,
    batchCode?: string,
    batchName?: string
  ) => Promise<{ batchCode?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

const fetchUserProfile = async (fbUser: FirebaseUser): Promise<User | null> => {
  try {
    const userDocRef = doc(db, 'users', fbUser.uid);
    const userDocSnap = await getDoc(userDocRef);
    if (userDocSnap.exists()) {
      const data = userDocSnap.data();
      return {
        id: fbUser.uid,
        name: data.name || fbUser.displayName || fbUser.email?.split('@')[0] || 'User',
        email: fbUser.email || '',
        studentId: data.studentId || '',
        role: (data.role as UserRole) || 'student',
        avatarUrl: fbUser.photoURL || data.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(data.name || 'User')}&background=random`,
        skills: data.skills || [],
        department: data.department || '',
        batch: data.batch || '',
        section: data.section || '',
        batchId: data.batchId || '',
        phone: data.phone,
        whatsapp: data.whatsapp,
      };
    }
  } catch (err) {
    console.error('Error fetching user profile', err);
  }
  return null;
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        const profile = await fetchUserProfile(fbUser);
        setUser(profile);
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
      const userDoc = await getDoc(doc(db, 'users', fbUser.uid));
      if (!userDoc.exists()) {
        // New Google user — create with no batchId yet (Setup page handles it)
        await setDoc(doc(db, 'users', fbUser.uid), {
          uid: fbUser.uid,
          email: fbUser.email,
          name: fbUser.displayName || fbUser.email?.split('@')[0] || 'User',
          role: 'student',
          batchId: '',
          skills: [],
          department: '',
          batch: '',
          section: '',
          avatarUrl: fbUser.photoURL || '',
          createdAt: new Date().toISOString(),
        });
      }
    } catch (e) {
      console.error('Error creating user profile in Firestore', e);
    }
  };

  const loginWithEmail = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signUpWithEmail = async (
    email: string,
    password: string,
    name: string,
    role: UserRole,
    batchCode?: string,
    batchName?: string
  ): Promise<{ batchCode?: string }> => {
    // Validate batch code for students before creating account
    let resolvedBatchId = '';
    if (role === 'student') {
      if (!batchCode) throw new Error('Batch code is required for students.');
      const batch = await getBatchByCode(batchCode);
      if (!batch) throw new Error('Invalid batch code. Please check with your CR.');
      resolvedBatchId = batch.id;
    }

    const result = await createUserWithEmailAndPassword(auth, email, password);
    const fbUser = result.user;
    let generatedCode: string | undefined;

    try {
      if (role === 'admin') {
        // Create a new batch and assign admin
        const newBatch = await createBatch(batchName || 'My Batch', fbUser.uid);
        resolvedBatchId = newBatch.id;
        generatedCode = newBatch.code;
      }

      await setDoc(doc(db, 'users', fbUser.uid), {
        uid: fbUser.uid,
        email: fbUser.email,
        name,
        role,
        batchId: resolvedBatchId,
        skills: [],
        department: '',
        batch: '',
        section: '',
        avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`,
        createdAt: new Date().toISOString(),
      });
    } catch (e) {
      console.error('Error creating user profile in Firestore', e);
      throw e;
    }

    return { batchCode: generatedCode };
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

// Suppress unused import warning
void collection; void query; void where; void getDocs;
