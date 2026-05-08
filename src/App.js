// src/App.js
import React, { useState, useEffect } from "react";
import { db } from "./firebase";
import { doc, getDoc, setDoc, onSnapshot } from "firebase/firestore";

import ClosedScreen from "./components/ClosedScreen";
import WelcomeScreen from "./components/WelcomeScreen";
import QuizScreen from "./components/QuizScreen";
import FailScreen from "./components/FailScreen";
import RegisterScreen from "./components/RegisterScreen";
import LoginScreen from "./components/LoginScreen";
import VotingScreen from "./components/VotingScreen";
import AdminLoginScreen from "./components/AdminLoginScreen";
import AdminPanel from "./components/AdminPanel";
import Loader from "./components/Loader";

export const ADMIN_PASS = process.env.REACT_APP_ADMIN_PASSWORD || "admin123";

export const DEFAULT_QUIZ = [
  { q: "What does 'haute couture' mean?", opts: ["High fashion/custom-made", "Ready-to-wear", "Casual wear", "Sports wear"], ans: 0 },
  { q: "Which fabric is made from silkworm cocoons?", opts: ["Cotton", "Linen", "Silk", "Polyester"], ans: 2 },
  { q: "What is a 'monochrome' outfit?", opts: ["Multiple colors", "One color in varying shades", "Black and white only", "Printed pattern"], ans: 1 },
  { q: "What does 'fast fashion' refer to?", opts: ["Sportswear brands", "Cheap rapidly-produced trendy clothes", "Luxury fashion", "Vintage clothing"], ans: 1 },
  { q: "Which part of clothing is an 'inseam'?", opts: ["Sleeve length", "Inner leg measurement", "Collar width", "Waist band"], ans: 1 },
];

export const DEFAULT_PRODUCTS = {
  1: [
    { id: "p1a", name: "Floral Summer Dress", img: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=400&h=400&fit=crop", category: "dress" },
    { id: "p1b", name: "Classic White Kurti", img: "https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?w=400&h=400&fit=crop", category: "kurti" },
    { id: "p1c", name: "Embroidered Salwar Set", img: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400&h=400&fit=crop", category: "salwar" },
    { id: "p1d", name: "Casual Denim Jacket", img: "https://images.unsplash.com/photo-1551537482-f2075a1d41f2?w=400&h=400&fit=crop", category: "jacket" },
  ],
  2: [
    { id: "p2a", name: "Silk Evening Gown", img: "https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=400&h=400&fit=crop", category: "dress" },
    { id: "p2b", name: "Striped Panjabi", img: "https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?w=400&h=400&fit=crop", category: "panjabi" },
    { id: "p2c", name: "Linen Palazzo Set", img: "https://images.unsplash.com/photo-1603400521630-9f2de124b33b?w=400&h=400&fit=crop", category: "set" },
    { id: "p2d", name: "Block Print Saree", img: "https://images.unsplash.com/photo-1594938298603-c8148c4b4a7b?w=400&h=400&fit=crop", category: "saree" },
  ],
  3: [
    { id: "p3a", name: "Chiffon Party Top", img: "https://images.unsplash.com/photo-1485968579580-b6d095142e6e?w=400&h=400&fit=crop", category: "top" },
    { id: "p3b", name: "Formal Sherwani", img: "https://images.unsplash.com/photo-1617711773026-ea4fd3cfdebd?w=400&h=400&fit=crop", category: "sherwani" },
    { id: "p3c", name: "Maxi Skirt & Blouse", img: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&h=400&fit=crop", category: "skirt" },
    { id: "p3d", name: "Sport Casual Polo", img: "https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?w=400&h=400&fit=crop", category: "polo" },
  ],
};

function App() {
  const [screen, setScreen] = useState("loader");
  const [systemOpen, setSystemOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [dbReady, setDbReady] = useState(false);
  const [firebaseError, setFirebaseError] = useState(false);

  // Step 1: Initialize Firebase + read initial systemOpen
  useEffect(() => {
    const init = async () => {
      if (!db) {
        setFirebaseError(true);
        setDbReady(true);
        return;
      }
      try {
        const ref = doc(db, "settings", "global");
        const snap = await getDoc(ref);
        if (!snap.exists()) {
          await setDoc(ref, {
            systemOpen: false,
            quiz: DEFAULT_QUIZ,
            products: DEFAULT_PRODUCTS,
          });
          setSystemOpen(false);
        } else {
          setSystemOpen(snap.data().systemOpen || false);
        }
      } catch (e) {
        console.error("Firebase init error:", e);
        setFirebaseError(true);
      }
      setDbReady(true);
    };
    init();
  }, []);

  // Step 2: After dbReady, decide which screen to show
  useEffect(() => {
    if (!dbReady) return;

    // Admin route — always works regardless of systemOpen
    if (window.location.search.includes("admin=1")) {
      const saved = localStorage.getItem("sv_user");
      if (saved) {
        try {
          const u = JSON.parse(saved);
          if (u.isAdmin) {
            setCurrentUser(u);
            setScreen("admin");
            return;
          }
        } catch (e) {}
      }
      setScreen("admin-login");
      return;
    }

    // Restore user session
    const saved = localStorage.getItem("sv_user");
    if (saved) {
      try {
        const u = JSON.parse(saved);
        setCurrentUser(u);
        if (u.isAdmin) { setScreen("admin"); return; }
        // Regular user — go to voting regardless of systemOpen
        setScreen("voting");
        return;
      } catch (e) {
        localStorage.removeItem("sv_user");
      }
    }

    // No session — check systemOpen
    setScreen(systemOpen ? "welcome" : "closed");
  }, [dbReady]);

  // Step 3: Listen to systemOpen changes in real-time
  useEffect(() => {
    if (!dbReady || !db || firebaseError) return;
    const unsub = onSnapshot(doc(db, "settings", "global"), (snap) => {
      if (snap.exists()) {
        const open = snap.data().systemOpen || false;
        setSystemOpen(open);
        // If system closed and user not logged in on non-admin screen
        if (!open && !currentUser && screen !== "admin" && screen !== "admin-login") {
          setScreen("closed");
        }
        // If system opened and was on closed
        if (open && screen === "closed" && !currentUser) {
          setScreen("welcome");
        }
      }
    });
    return unsub;
  }, [dbReady, firebaseError, currentUser, screen]);

  const goTo = (s) => setScreen(s);

  const handleLogin = (user) => {
    setCurrentUser(user);
    localStorage.setItem("sv_user", JSON.stringify(user));
    if (user.isAdmin) { setScreen("admin"); return; }
    setScreen("voting");
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem("sv_user");
    setScreen(systemOpen ? "welcome" : "closed");
  };

  // Loading state
  if (!dbReady) return <Loader />;

  // Firebase not configured
  if (firebaseError) {
    return (
      <div style={{ minHeight: "100vh", background: "#0a0a0f", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem", fontFamily: "sans-serif" }}>
        <div style={{ background: "#1f0e0e", border: "1.5px solid #7f1d1d", borderRadius: 16, padding: "2rem", maxWidth: 520, width: "100%" }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>⚠️</div>
          <h2 style={{ color: "#f87171", marginBottom: 16, fontSize: 20 }}>Firebase Not Configured</h2>
          <p style={{ color: "#fca5a5", lineHeight: 1.7, marginBottom: 16, fontSize: 14 }}>
            Your Firebase environment variables are missing in Vercel. Go to Vercel → Your Project → Settings → Environment Variables and add:
          </p>
          <div style={{ background: "#0d0b18", border: "1px solid #2a2840", borderRadius: 8, padding: 14, color: "#a78bfa", fontSize: 12, lineHeight: 2, fontFamily: "monospace" }}>
            REACT_APP_FIREBASE_API_KEY<br />
            REACT_APP_FIREBASE_AUTH_DOMAIN<br />
            REACT_APP_FIREBASE_PROJECT_ID<br />
            REACT_APP_FIREBASE_STORAGE_BUCKET<br />
            REACT_APP_FIREBASE_MESSAGING_SENDER_ID<br />
            REACT_APP_FIREBASE_APP_ID<br />
            REACT_APP_ADMIN_PASSWORD
          </div>
          <p style={{ color: "#fca5a5", fontSize: 13, marginTop: 14 }}>
            After adding → Vercel Dashboard → Deployments → Redeploy.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {screen === "closed" && <ClosedScreen />}
      {screen === "welcome" && <WelcomeScreen goTo={goTo} />}
      {screen === "quiz" && <QuizScreen goTo={goTo} onPass={() => goTo("register")} onFail={() => goTo("fail")} />}
      {screen === "fail" && <FailScreen goTo={goTo} />}
      {screen === "register" && <RegisterScreen goTo={goTo} onSuccess={handleLogin} />}
      {screen === "login" && <LoginScreen goTo={goTo} onSuccess={handleLogin} />}
      {screen === "voting" && currentUser && <VotingScreen user={currentUser} onLogout={handleLogout} />}
      {screen === "admin-login" && <AdminLoginScreen onSuccess={handleLogin} />}
      {screen === "admin" && currentUser?.isAdmin && <AdminPanel onLogout={handleLogout} systemOpen={systemOpen} />}
    </div>
  );
}

export default App;
