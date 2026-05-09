// src/components/FailScreen.js
import React from "react";
import { S } from "./styles";
import { useLang } from "../App";
import { T } from "../lang";
import LangSwitcher from "./LangSwitcher";

export default function FailScreen({ goTo }) {
  const { lang } = useLang();
  const t = T[lang];
  return (
    <div style={S.page}>
      <div style={{ position: "absolute", top: 16, right: 16 }}><LangSwitcher /></div>
      <div style={S.card}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>❌</div>
          <h2 style={{ ...S.h2, textAlign: "center" }}>{t.not_qualified}</h2>
          <p style={{ ...S.muted, lineHeight: 1.7, marginBottom: 24 }}>{t.fail_msg}</p>
          <button style={{ ...S.btnPrimary, marginBottom: 10 }} onClick={() => goTo("quiz")}>{t.try_again}</button>
          <button style={S.btnOutline} onClick={() => goTo("welcome")}>{t.back_home}</button>
        </div>
      </div>
    </div>
  );
}
