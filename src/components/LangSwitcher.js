// src/components/LangSwitcher.js
import React from "react";
import { useLang } from "../App";

export default function LangSwitcher({ style = {} }) {
  const { lang, setLang } = useLang();
  return (
    <div className="jr-lang-switch" style={style}>
      <button
        type="button"
        className={`jr-lang-btn${lang === "en" ? " active" : ""}`}
        onClick={() => setLang("en")}
      >
        🌐 EN
      </button>
      <button
        type="button"
        className={`jr-lang-btn${lang === "bn" ? " active" : ""}`}
        onClick={() => setLang("bn")}
      >
        🇧🇩 বাং
      </button>
    </div>
  );
}

