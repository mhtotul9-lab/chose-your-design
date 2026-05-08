// src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
};

const isConfigValid =
  firebaseConfig.apiKey &&
  firebaseConfig.apiKey.length > 0 &&
  firebaseConfig.projectId &&
  firebaseConfig.projectId.length > 0;

let app = null;
let db = null;

try {
  if (!isConfigValid) throw new Error("Firebase config missing");
  app = initializeApp(firebaseConfig);
  db = getFirestore(app);
} catch (e) {
  console.error("Firebase init failed:", e.message);
}

export { db };
export default app;
