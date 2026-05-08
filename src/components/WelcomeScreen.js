// src/components/WelcomeScreen.js
import React from "react";
import { S } from "./styles";
import logo from "../logo.png";

export default function WelcomeScreen({ goTo }) {
  return (
    <div style={S.page}>
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <img
          src={logo}
          alt="Jolrasi Clothing Brand"
          style={{ width: 220, marginBottom: 16, filter: "drop-shadow(0 0 20px rgba(108,92,231,0.3))" }}
        />
        <h1 style={S.h1}>StyleVote</h1>
        <p style={S.muted}>Fashion Research Platform</p>
      </div>
      <div style={S.card}>
        <p style={{ ...S.muted, lineHeight: 1.8, marginBottom: 24 }}>
          Welcome! Before accessing the platform, you must complete a short qualification quiz.
          Score <strong style={{ color: "#a78bfa" }}>80% or higher</strong> to create your account and start voting.
        </p>
        <button style={S.btnPrimary} onClick={() => goTo("quiz")}>
          Take Qualification Quiz →
        </button>
        <div style={{ ...S.divider, marginTop: 20 }} />
        <div style={{ textAlign: "center" }}>
          <span style={S.muted}>Already registered? </span>
          <button
            style={{ ...S.btnOutline, width: "auto", marginTop: 0, display: "inline-flex" }}
            onClick={() => goTo("login")}
          >
            Login
          </button>
        </div>
        <div style={{ textAlign: "center", marginTop: 12 }}>
          <button
            style={{ ...S.btnOutline, width: "auto", fontSize: 12, color: "#5a5880", borderColor: "#1a1730", cursor: "pointer" }}
            onClick={() => { window.location.href = window.location.pathname + "?admin=1"; }}
          >
            Admin
          </button>
        </div>
      </div>
    </div>
  );
}
