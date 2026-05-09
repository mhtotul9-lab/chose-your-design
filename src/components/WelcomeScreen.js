// src/components/WelcomeScreen.js
import React from "react";
import { S } from "./styles";
import { useLang } from "../App";
import { T } from "../lang";
import LangSwitcher from "./LangSwitcher";

export default function WelcomeScreen({ goTo }) {
  const { lang } = useLang();
  const t = T[lang];
  return (
    <div style={S.page}>
      <div style={{ position: "absolute", top: 16, right: 16 }}>
        <LangSwitcher />
      </div>
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <div style={{ fontSize: 56, marginBottom: 12 }}>👗</div>
        <h1 style={S.h1}>{t.welcome_title}</h1>
        <p style={S.muted}>{t.welcome_sub}</p>
      </div>
      <div style={S.card}>
        <p style={{ ...S.muted, lineHeight: 1.8, marginBottom: 24 }}>
          {t.welcome_desc.split("80%").map((part, i, arr) =>
            i < arr.length - 1
              ? <span key={i}>{part}<strong style={{ color: "#a78bfa" }}>80%</strong></span>
              : <span key={i}>{part}</span>
          )}
        </p>
        <button style={S.btnPrimary} onClick={() => goTo("quiz")}>{t.take_quiz}</button>
        <div style={{ ...S.divider, marginTop: 20 }} />
        <div style={{ textAlign: "center" }}>
          <span style={S.muted}>{t.already_registered} </span>
          <button style={{ ...S.btnOutline, display: "inline-flex", marginTop: 0 }} onClick={() => goTo("login")}>
            {t.login}
          </button>
        </div>
      </div>
    </div>
  );
}
