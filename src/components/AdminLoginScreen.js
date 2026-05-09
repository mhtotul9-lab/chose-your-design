// src/components/AdminLoginScreen.js
import React, { useState } from "react";
import { ADMIN_PASS } from "../App";
import { S } from "./styles";

export default function AdminLoginScreen({ onSuccess }) {
  const [pw, setPw] = useState("");
  const [error, setError] = useState("");
  const login = () => {
    if (pw === ADMIN_PASS) { onSuccess({ isAdmin: true }); }
    else { setError("Incorrect admin password."); }
  };
  return (
    <div style={S.page}>
      <div style={S.card}>
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div style={{ fontSize: 40, marginBottom: 10 }}>🔐</div>
          <h2 style={S.h2}>Admin Login</h2>
          <p style={S.muted}>Access: giftjolrasi.vercel.app/admin</p>
        </div>
        <div style={S.fieldWrap}>
          <label style={S.label}>Admin Password</label>
          <input type="password" placeholder="Enter admin password" value={pw} onChange={e => setPw(e.target.value)} onKeyDown={e => e.key === "Enter" && login()} />
        </div>
        {error && <div style={S.errorBox}>{error}</div>}
        <button style={S.btnPrimary} onClick={login}>Login as Admin →</button>
        <button style={{ ...S.btnOutline, marginTop: 12, width: "100%", justifyContent: "center" }} onClick={() => { window.location.href = "/"; }}>← Back to site</button>
      </div>
    </div>
  );
}
