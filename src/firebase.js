// src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// ✅ Hardcoded config — works without env variables
const firebaseConfig = {
  apiKey: "AIzaSyDZBbLu4_3rdiTxO2rmb1PNlT-M6QjS2-A",
  authDomain: "vote-system-complete-c5924.firebaseapp.com",
  projectId: "vote-system-complete-c5924",
  storageBucket: "vote-system-complete-c5924.firebasestorage.app",
  messagingSenderId: "1004729044647",
  appId: "1:1004729044647:web:1eeb028d1d37b4d7315582",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
export default app;
