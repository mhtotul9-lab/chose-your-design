// src/components/LoginScreen.js
import React, { useState } from "react";
import { db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import { S } from "./styles";
import { useLang } from "../App";
import { T } from "../lang";
import LangSwitcher from "./LangSwitcher";

export default function LoginScreen({ goTo, onSuccess }) {
  const { lang } = useLang();
  const t = T[lang];
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setError("");
    if (!email || !password) { setError(t.fill_all); return; }
    setLoading(true);
    try {
      const emailKey = email.toLowerCase().replace(/\./g, "_").replace(/@/g, "_at_");
      const snap = await getDoc(doc(db, "users", emailKey));
      if (!snap.exists()) { setError(t.no_account); setLoading(false); return; }
      const u = snap.data();
      if (u.password !== password) { setError(t.wrong_pass); setLoading(false); return; }
      if (u.banned) { setError("🚫 আপনার অ্যাকাউন্ট ব্যান করা হয়েছে। বিস্তারিত জানতে এডমিনের সাথে যোগাযোগ করুন।"); setLoading(false); return; }
      onSuccess({ email: u.email, name: u.name, gender: u.gender, emailKey, whatsapp: u.whatsapp });
    } catch (e) { setError(t.login_failed); }
    setLoading(false);
  };

  return (
    <div style={S.page}>
      <div style={{ position: "absolute", top: 16, right: 16 }}><LangSwitcher /></div>
      <div style={S.card}>
        <h2 style={{ ...S.h2, textAlign: "center" }}>{t.welcome_back}</h2>
        <p style={{ ...S.muted, textAlign: "center", marginBottom: 24 }}>{t.login_sub}</p>
        <div style={S.fieldWrap}>
          <label style={S.label}>{t.email}</label>
          <input type="email" placeholder={t.email_ph} value={email} onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === "Enter" && handleLogin()} />
        </div>
        <div style={S.fieldWrap}>
          <label style={S.label}>{t.password}</label>
          <input type="password" placeholder={t.pass_ph} value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === "Enter" && handleLogin()} />
        </div>
        {error && <div style={S.errorBox}>{error}</div>}
        <button style={{ ...S.btnPrimary, opacity: loading ? 0.7 : 1 }} onClick={handleLogin} disabled={loading}>
          {loading ? t.logging_in : t.login_btn}
        </button>
        <button style={{ ...S.btnOutline, marginTop: 12, width: "100%", justifyContent: "center" }} onClick={() => goTo("welcome")}>
          {t.back_home}
        </button>
      </div>
    </div>
  );
}
