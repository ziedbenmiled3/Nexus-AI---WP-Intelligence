import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User, 
  onAuthStateChanged, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInAnonymously
} from 'firebase/auth';
import { auth } from '../lib/firebase';
import { firebaseService } from '../services/firebaseService';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  loginWithGoogle: () => Promise<User>;
  loginWithEmail: (email: string, password?: string) => Promise<User>;
  signUpWithEmail: (email: string, password?: string) => Promise<User>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function FirebaseProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
      if (user?.email) {
        localStorage.setItem('nexus_user_email', user.email);
        firebaseService.syncUserProfile(user);
      }
    });

    return unsubscribe;
  }, []);

  const loginWithGoogle = async (): Promise<User> => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    try {
      console.log('[FirebaseProvider] Attempting signInWithPopup...');
      const result = await signInWithPopup(auth, provider);
      return result.user;
    } catch (error: any) {
      console.warn('[FirebaseProvider] signInWithPopup failed:', error);
      throw error;
    }
  };

  const loginWithEmail = async (email: string, password?: string): Promise<User> => {
    const cleanEmail = email.toLowerCase().trim();
    const defaultPassword = `nexus_secure_2026_${cleanEmail.replace(/[@.]/g, '_')}`;
    const finalPassword = password || defaultPassword;

    try {
      console.log('[FirebaseProvider] Attempting email sign in for:', cleanEmail);
      const result = await signInWithEmailAndPassword(auth, cleanEmail, finalPassword);
      return result.user;
    } catch (signInError: any) {
      const isDesignatedAdmin = cleanEmail === 'contact@nexuswp.pro';
      
      // If an admin typed a custom password and it failed, attempt using their master key as fallback
      if (password && isDesignatedAdmin && password !== defaultPassword) {
        try {
          console.log('[FirebaseProvider] Admin custom password failed, trying master fallback password...');
          const result = await signInWithEmailAndPassword(auth, cleanEmail, defaultPassword);
          return result.user;
        } catch (fallbackError) {
          throw signInError;
        }
      }

      if (password) {
        // If a custom password was supplied and failed, bubble up the error directly
        throw signInError;
      }
      if (signInError.code === 'auth/user-not-found' || signInError.code === 'auth/invalid-credential' || signInError.code === 'auth/wrong-password') {
        try {
          console.log('[FirebaseProvider] Email not found, creating user with legacy pass:', cleanEmail);
          const result = await createUserWithEmailAndPassword(auth, cleanEmail, finalPassword);
          return result.user;
        } catch (signUpError: any) {
          console.error('[FirebaseProvider] Email sign up failed:', signUpError);
          throw signUpError;
        }
      } else {
        console.error('[FirebaseProvider] Email sign in failed:', signInError);
        throw signInError;
      }
    }
  };

  const signUpWithEmail = async (email: string, password?: string): Promise<User> => {
    const cleanEmail = email.toLowerCase().trim();
    const finalPassword = password || `nexus_secure_2026_${cleanEmail.replace(/[@.]/g, '_')}`;
    console.log('[FirebaseProvider] Attempting email sign up for:', cleanEmail);
    const result = await createUserWithEmailAndPassword(auth, cleanEmail, finalPassword);
    return result.user;
  };

  const logout = async () => {
    try {
      await signOut(auth);
      localStorage.clear();
      window.location.href = '/';
    } catch (error) {
      console.error('Logout Error:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, loginWithGoogle, loginWithEmail, signUpWithEmail, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within a FirebaseProvider');
  }
  return context;
}
