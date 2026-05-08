// src/components/ClosedScreen.js
import React from "react";
import { S } from "./styles";
import logo from "../logo.png";

export default function ClosedScreen() {
  return (
    <div style={S.page}>
      <img
        src={logo}
        alt="Jolrasi Clothing Brand"
        style={{ width: 200, marginBottom: 24, opacity: 0.8 }}
      />
      <div style={{ fontSize: 40, marginBottom: 16 }}>🔒</div>
      <h1 style={{ ...S.h1, textAlign: "center", marginBottom: 12 }}>StyleVote</h1>
      <p style={{ ...S.muted, textAlign: "center", maxWidth: 320, lineHeight: 1.7 }}>
        This platform is currently closed. Please check back later.
      </p>
      <button
        style={{ ...S.btnOutline, marginTop: 24, cursor: "pointer" }}
        onClick={() => {
          window.location.href = window.location.pathname + "?admin=1";
        }}
      >
        🔐 Admin Login
      </button>
    </div>
  );
}
