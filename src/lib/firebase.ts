import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, initializeFirestore, persistentLocalCache } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase only once
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
let db: ReturnType<typeof getFirestore>;

if (typeof window !== "undefined") {
  // Client-side: Initialize with persistent cache safely
  try {
    db = initializeFirestore(app, {
      localCache: persistentLocalCache()
    });
  } catch (error) {
    // If it was already initialized (e.g., during Fast Refresh), just get it
    db = getFirestore(app);
  }
} else {
  // Server-side: Standard initialization
  db = getFirestore(app);
}

export { app, auth, db };
