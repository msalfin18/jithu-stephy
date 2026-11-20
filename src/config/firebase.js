import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

/**
 * Firebase configuration.
 * Values can be provided in .env using Vite's VITE_ prefix.
 * Example:
 *   VITE_FIREBASE_API_KEY=AIzaSy...
 *   VITE_FIREBASE_PROJECT_ID=wedding-website-xxx
 */
const env = (typeof import.meta !== 'undefined' && import.meta.env) ? import.meta.env : {};

export const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY || '',
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: env.VITE_FIREBASE_APP_ID || '',
};

/**
 * Checks whether Firebase credentials have been configured.
 * Returns false during development if credentials are empty or placeholders.
 */
export const isFirebaseConfigured = () => {
  const { apiKey, projectId } = firebaseConfig;
  return Boolean(
    apiKey &&
    projectId &&
    !apiKey.includes('your_') &&
    !apiKey.startsWith('PLACEHOLDER') &&
    apiKey.trim() !== ''
  );
};

let app = null;
let db = null;

if (isFirebaseConfigured()) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    db = getFirestore(app);
  } catch (err) {
    console.warn('Firebase could not be initialized:', err);
    app = null;
    db = null;
  }
}

export { app, db };
