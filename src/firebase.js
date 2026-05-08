// src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "AIzaSyDZBbLu4_3rdiTxO2rmb1PNlT-M6QjS2-A",
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "vote-system-complete-c5924.firebaseapp.com",
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "vote-system-complete-c5924",
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || "vote-system-complete-c5924.firebasestorage.app",
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "1004729044647",
  appId: process.env.REACT_APP_FIREBASE_APP_ID || "1:1004729044647:web:1eeb028d1d37b4d7315582",
};

const isConfigValid =
  firebaseConfig.apiKey.length > 0 && firebaseConfig.projectId.length > 0;

let app = null;
let db = null;

try {
  if (!isConfigValid) {
    throw new Error("Firebase config missing");
  }
  app = initializeApp(firebaseConfig);
  db = getFirestore(app);
} catch (e) {
  console.error("Firebase init failed:", e.message);
}

export { db };
export default app;
