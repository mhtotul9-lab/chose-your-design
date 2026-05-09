// src/components/LangSwitcher.js
import React from "react";
import { useLang } from "../App";

export default function LangSwitcher({ style = {} }) {
  const { lang, setLang } = useLang();
  return (
    <select
      value={lang}
      onChange={e => setLang(e.target.value)}
      style={{
        padding: "6px 12px",
        borderRadius: 8,
        border: "1.5px solid #2a2840",
        background: "#16141f",
        color: "#a09ec0",
        fontFamily: "'DM Sans', sans-serif",
        fontSize: 13,
        cursor: "pointer",
        outline: "none",
        ...style,
      }}
    >
      <option value="en">🌐 English</option>
      <option value="bn">🇧🇩 বাংলা</option>
    </select>
  );
}
