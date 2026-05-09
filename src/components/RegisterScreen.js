// src/components/RegisterScreen.js
import React, { useState } from "react";
import { db } from "../firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { S } from "./styles";
import { useLang } from "../App";
import { T } from "../lang";
import LangSwitcher from "./LangSwitcher";

export default function RegisterScreen({ goTo, onSuccess }) {
  const { lang } = useLang();
  const t = T[lang];
  const [form, setForm] = useState({ name: "", whatsapp: "", address: "", email: "", password: "" });
  const [gender, setGender] = useState("male");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async () => {
    const { name, whatsapp, address, email, password } = form;
    setError("");
    if (!name || !whatsapp || !address || !email || !password) { setError(t.fill_all); return; }
    if (password.length < 6) { setError(t.pass_short); return; }
    if (!/\S+@\S+\.\S+/.test(email)) { setError(t.invalid_email); return; }
    setLoading(true);
    try {
      const emailKey = email.toLowerCase().replace(/\./g, "_").replace(/@/g, "_at_");
      const userRef = doc(db, "users", emailKey);
      const existing = await getDoc(userRef);
      if (existing.exists()) { setError(t.email_exists); setLoading(false); return; }
      const userData = { name, whatsapp, address, email: email.toLowerCase(), password, gender, registeredAt: new Date().toISOString(), emailKey };
      await setDoc(userRef, userData);
      onSuccess({ email: email.toLowerCase(), name, gender, emailKey });
    } catch (e) { setError(t.reg_failed); }
    setLoading(false);
  };

  const fields = [
    { key: "name", label: t.full_name, type: "text", ph: t.name_ph },
    { key: "whatsapp", label: t.whatsapp, type: "tel", ph: t.wa_ph },
    { key: "address", label: t.address, type: "text", ph: t.addr_ph },
    { key: "email", label: t.email, type: "email", ph: t.email_ph },
    { key: "password", label: t.password, type: "password", ph: t.pass_ph },
  ];

  return (
    <div style={S.page}>
      <div style={{ position: "absolute", top: 16, right: 16 }}><LangSwitcher /></div>
      <div style={S.card}>
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <span style={S.badge("green")}>{t.qualified}</span>
          <h2 style={{ ...S.h2, marginTop: 12, marginBottom: 4 }}>{t.create_account}</h2>
          <p style={S.muted}>{t.fill_details}</p>
        </div>
        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          {["male", "female"].map(g => (
            <button key={g} onClick={() => setGender(g)}
              style={{ flex: 1, padding: 9, borderRadius: 10, border: `1.5px solid ${gender === g ? "#6c5ce7" : "#2a2840"}`, background: gender === g ? "#1e1b3a" : "transparent", color: gender === g ? "#a78bfa" : "#a09ec0", fontFamily: "'DM Sans',sans-serif", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
              {g === "male" ? t.male : t.female}
            </button>
          ))}
        </div>
        {fields.map(f => (
          <div key={f.key} style={S.fieldWrap}>
            <label style={S.label}>{f.label}</label>
            <input type={f.type} placeholder={f.ph} value={form[f.key]} onChange={set(f.key)} />
          </div>
        ))}
        {error && <div style={S.errorBox}>{error}</div>}
        <button style={{ ...S.btnPrimary, opacity: loading ? 0.7 : 1 }} onClick={handleSubmit} disabled={loading}>
          {loading ? t.creating : t.create_btn}
        </button>
        <button style={{ ...S.btnOutline, marginTop: 12, width: "100%", justifyContent: "center" }} onClick={() => goTo("login")}>
          {t.have_account}
        </button>
      </div>
    </div>
  );
}
