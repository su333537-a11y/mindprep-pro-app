import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, getDoc, onSnapshot } from 'firebase/firestore';
import { getAuth, signInAnonymously, onAuthStateChanged, User } from 'firebase/auth';
import config from '../../firebase-applet-config.json';

const app = initializeApp(config);
export const db = getFirestore(app, config.firestoreDatabaseId);
export const auth = getAuth(app);

// Simple auth wrapper
export const initAuth = (onUser: (user: User | null) => void) => {
  return onAuthStateChanged(auth, async (user) => {
    if (!user) {
      // Auto sign-in anonymously for frictionless experience
      try {
        await signInAnonymously(auth);
      } catch (e) {
        console.error("Firebase auth error (domain may not be authorized):", e);
        // We still call onUser(null) so the app knows auth failed and can proceed with local data
        onUser(null);
      }
    } else {
      onUser(user);
    }
  });
};
