// src/components/ClosedScreen.js
import React from "react";
import { S } from "./styles";

export default function ClosedScreen() {
  return (
    <div style={S.page}>
      <div style={{ fontSize: 64, marginBottom: 20 }}>🔒</div>
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
