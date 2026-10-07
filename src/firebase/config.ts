import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Firebase configuration from environment variables (or user provided fallback)
export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyCt9bOmfgoiYbxbPxhMMFPFmT7kEFL2-X0",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "vipto-doc.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "vipto-doc",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "vipto-doc.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "768722502197",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:768722502197:web:032c075b933fb85947a77c",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-PLTH2LTM00"
};

// Initialize Firebase
export const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export const db = getFirestore(app);
export const storage = getStorage(app);
