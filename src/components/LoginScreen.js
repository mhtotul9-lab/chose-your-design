// src/components/LoginScreen.js
import React, { useState } from "react";
import { db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import { S } from "./styles";

export default function LoginScreen({ goTo, onSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setError("");
    if (!email || !password) { setError("Please enter email and password."); return; }
    setLoading(true);
    try {
      const emailKey = email.toLowerCase().replace(/\./g, "_");
      const snap = await getDoc(doc(db, "users", emailKey));
      if (!snap.exists()) { setError("No account found with this email."); setLoading(false); return; }
      const u = snap.data();
      if (u.password !== password) { setError("Incorrect password."); setLoading(false); return; }
      onSuccess({ email: u.email, name: u.name, gender: u.gender, emailKey });
    } catch (e) {
      setError("Login failed. Check your internet connection.");
    }
    setLoading(false);
  };

  return (
    <div style={S.page}>
      <div style={S.card}>
        <h2 style={{ ...S.h2, textAlign: "center" }}>Welcome Back</h2>
        <p style={{ ...S.muted, textAlign: "center", marginBottom: 24 }}>Login to your StyleVote account</p>

        <div style={S.fieldWrap}>
          <label style={S.label}>Email Address</label>
          <input type="email" placeholder="you@email.com" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === "Enter" && handleLogin()} />
        </div>
        <div style={S.fieldWrap}>
          <label style={S.label}>Password</label>
          <input type="password" placeholder="Your password" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === "Enter" && handleLogin()} />
        </div>

        {error && <div style={S.errorBox}>{error}</div>}

        <button style={{ ...S.btnPrimary, opacity: loading ? 0.7 : 1 }} onClick={handleLogin} disabled={loading}>
          {loading ? "Logging in..." : "Login →"}
        </button>
        <button style={{ ...S.btnOutline, marginTop: 12 }} onClick={() => goTo("welcome")}>
          ← Back to Home
        </button>
      </div>
    </div>
  );
}
