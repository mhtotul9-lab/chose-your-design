// src/components/RegisterScreen.js
import React, { useState } from "react";
import { db } from "../firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { S } from "./styles";

export default function RegisterScreen({ goTo, onSuccess }) {
  const [form, setForm] = useState({ name: "", whatsapp: "", address: "", email: "", password: "" });
  const [gender, setGender] = useState("male");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async () => {
    const { name, whatsapp, address, email, password } = form;
    setError("");
    if (!name || !whatsapp || !address || !email || !password) { setError("Please fill in all fields."); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters."); return; }
    if (!/\S+@\S+\.\S+/.test(email)) { setError("Please enter a valid email address."); return; }
    setLoading(true);
    try {
      const emailKey = email.toLowerCase().replace(/\./g, "_");
      const userRef = doc(db, "users", emailKey);
      const existing = await getDoc(userRef);
      if (existing.exists()) { setError("This email is already registered. Please login."); setLoading(false); return; }
      const userData = { name, whatsapp, address, email: email.toLowerCase(), password, gender, registeredAt: new Date().toISOString() };
      await setDoc(userRef, userData);
      onSuccess({ email: email.toLowerCase(), name, gender, emailKey });
    } catch (e) {
      setError("Registration failed. Check your internet connection.");
    }
    setLoading(false);
  };

  return (
    <div style={S.page}>
      <div style={S.card}>
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <span style={S.badge("green")}>✓ Qualified!</span>
          <h2 style={{ ...S.h2, marginTop: 12, marginBottom: 4 }}>Create Account</h2>
          <p style={S.muted}>Fill in your details below</p>
        </div>

        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          {["male", "female"].map(g => (
            <button key={g} onClick={() => setGender(g)}
              style={{ flex: 1, padding: "9px", borderRadius: 10, border: `1.5px solid ${gender === g ? "#6c5ce7" : "#2a2840"}`, background: gender === g ? "#1e1b3a" : "transparent", color: gender === g ? "#a78bfa" : "#a09ec0", fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 600, textTransform: "capitalize" }}>
              {g === "male" ? "♂ Male" : "♀ Female"}
            </button>
          ))}
        </div>

        {[
          { key: "name", label: "Full Name", type: "text", placeholder: "Your full name" },
          { key: "whatsapp", label: "WhatsApp Number", type: "tel", placeholder: "+880 1X XX XXX XXX" },
          { key: "address", label: "Address", type: "text", placeholder: "City, Country" },
          { key: "email", label: "Email Address", type: "email", placeholder: "you@email.com" },
          { key: "password", label: "Password", type: "password", placeholder: "Minimum 6 characters" },
        ].map(f => (
          <div key={f.key} style={S.fieldWrap}>
            <label style={S.label}>{f.label}</label>
            <input type={f.type} placeholder={f.placeholder} value={form[f.key]} onChange={set(f.key)} />
          </div>
        ))}

        {error && <div style={S.errorBox}>{error}</div>}

        <button style={{ ...S.btnPrimary, opacity: loading ? 0.7 : 1 }} onClick={handleSubmit} disabled={loading}>
          {loading ? "Creating account..." : "Create Account →"}
        </button>

        <div style={{ textAlign: "center", marginTop: 14 }}>
          <button style={S.btnOutline} onClick={() => goTo("login")}>Already have an account? Login</button>
        </div>
      </div>
    </div>
  );
}
