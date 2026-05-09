// src/components/ClosedScreen.js
import React from "react";
import { S } from "./styles";
import { useLang } from "../App";
import { T } from "../lang";
import LangSwitcher from "./LangSwitcher";

export default function ClosedScreen() {
  const { lang } = useLang();
  const t = T[lang];
  return (
    <div style={S.page}>
      <div style={{ position: "absolute", top: 16, right: 16 }}>
        <LangSwitcher />
      </div>
      <div style={{ fontSize: 64, marginBottom: 20 }}>🔒</div>
      <h1 style={{ ...S.h1, textAlign: "center", marginBottom: 12 }}>Jolrasi</h1>
      <p style={{ ...S.muted, textAlign: "center", maxWidth: 320, lineHeight: 1.7 }}>{t.closed_msg}</p>
      <button
        style={{ ...S.btnOutline, marginTop: 24 }}
        onClick={() => { window.location.href = "/admin"; }}
      >
        🔐 {t.admin_login}
      </button>
    </div>
  );
}
