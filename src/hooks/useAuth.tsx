import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User as FirebaseUser,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut as fbSignOut,
  updateProfile,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, googleProvider, db } from '@/firebase/config';
import { UserProfile, UserRole } from '@/types';
import { seedInitialWorkspaceData } from '@/services/seedService';

interface AuthContextType {
  user: UserProfile | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  signUpWithEmail: (name: string, email: string, pass: string) => Promise<void>;
  signOut: () => Promise<void>;
  switchUserRole: (newRole: UserRole) => void;
  quickLoginAs: (role: UserRole, name?: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Sync profile from Firestore or create if first login
  const syncUserProfile = async (fbUser: FirebaseUser): Promise<UserProfile> => {
    const userDocRef = doc(db, 'users', fbUser.uid);
    const snap = await getDoc(userDocRef);
    const now = new Date().toISOString();

    if (snap.exists()) {
      const data = snap.data() as UserProfile;
      // Update last login
      await setDoc(userDocRef, { lastLogin: now }, { merge: true });
      return data;
    } else {
      // First time user: default role Owner for first user, Editor for others
      const newProfile: UserProfile = {
        uid: fbUser.uid,
        name: fbUser.displayName || fbUser.email?.split('@')[0] || 'Team Member',
        email: fbUser.email || '',
        avatar: fbUser.photoURL || '',
        role: 'Owner',
        createdAt: now,
        lastLogin: now,
      };
      await setDoc(userDocRef, newProfile);
      // Seed workspace if needed
      await seedInitialWorkspaceData(newProfile.uid, newProfile.name);
      return newProfile;
    }
  };

  useEffect(() => {
    // Check if demo user saved in session
    const savedDemo = sessionStorage.getItem('vipto_demo_user');
    if (savedDemo) {
      try {
        const demoProfile = JSON.parse(savedDemo) as UserProfile;
        setUser(demoProfile);
        setLoading(false);
        // Seed workspace data
        seedInitialWorkspaceData(demoProfile.uid, demoProfile.name);
        return;
      } catch (e) {
        sessionStorage.removeItem('vipto_demo_user');
      }
    }

    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        setFirebaseUser(fbUser);
        try {
          const profile = await syncUserProfile(fbUser);
          setUser(profile);
        } catch (error) {
          console.warn('Firestore profile sync error, using fallback profile:', error);
          const fallbackProfile: UserProfile = {
            uid: fbUser.uid,
            name: fbUser.displayName || 'Vipto User',
            email: fbUser.email || '',
            avatar: fbUser.photoURL || '',
            role: 'Owner',
            createdAt: new Date().toISOString(),
            lastLogin: new Date().toISOString(),
          };
          setUser(fallbackProfile);
        }
      } else {
        setFirebaseUser(null);
        // If not logged in, provide ready default demo user for instant explore
        const defaultProfile: UserProfile = {
          uid: 'user_ayush_vipto',
          name: 'Ayush Kumar',
          email: 'ayush@vipto.io',
          avatar: '',
          role: 'Owner',
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString(),
        };
        setUser(defaultProfile);
        seedInitialWorkspaceData(defaultProfile.uid, defaultProfile.name);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    setLoading(true);
    try {
      const res = await signInWithPopup(auth, googleProvider);
      sessionStorage.removeItem('vipto_demo_user');
      const profile = await syncUserProfile(res.user);
      setUser(profile);
    } catch (error: any) {
      console.error('Google sign in error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signInWithEmail = async (email: string, pass: string) => {
    setLoading(true);
    try {
      const res = await signInWithEmailAndPassword(auth, email, pass);
      sessionStorage.removeItem('vipto_demo_user');
      const profile = await syncUserProfile(res.user);
      setUser(profile);
    } catch (error: any) {
      console.error('Email sign in error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signUpWithEmail = async (name: string, email: string, pass: string) => {
    setLoading(true);
    try {
      const res = await createUserWithEmailAndPassword(auth, email, pass);
      await updateProfile(res.user, { displayName: name });
      sessionStorage.removeItem('vipto_demo_user');
      const profile = await syncUserProfile(res.user);
      setUser(profile);
    } catch (error: any) {
      console.error('Sign up error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    sessionStorage.removeItem('vipto_demo_user');
    await fbSignOut(auth).catch(() => {});
    setUser(null);
    setFirebaseUser(null);
  };

  const switchUserRole = (newRole: UserRole) => {
    if (!user) return;
    const updated = { ...user, role: newRole };
    setUser(updated);
    sessionStorage.setItem('vipto_demo_user', JSON.stringify(updated));
  };

  const quickLoginAs = async (role: UserRole, customName?: string) => {
    const roleProfiles: Record<UserRole, { name: string; email: string }> = {
      Owner: { name: customName || 'Ayush Kumar (Owner)', email: 'ayush@vipto.io' },
      Admin: { name: customName || 'Rahul Sharma (Admin)', email: 'rahul@vipto.io' },
      Editor: { name: customName || 'Priya Patel (Editor)', email: 'priya@vipto.io' },
      Viewer: { name: customName || 'Alex Chen (Viewer)', email: 'alex@vipto.io' },
    };

    const target = roleProfiles[role];
    const demoProfile: UserProfile = {
      uid: `demo_${role.toLowerCase()}`,
      name: target.name,
      email: target.email,
      avatar: '',
      role,
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
    };

    setUser(demoProfile);
    sessionStorage.setItem('vipto_demo_user', JSON.stringify(demoProfile));
    await seedInitialWorkspaceData(demoProfile.uid, demoProfile.name);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        firebaseUser,
        loading,
        signInWithGoogle,
        signInWithEmail,
        signUpWithEmail,
        signOut,
        switchUserRole,
        quickLoginAs,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
