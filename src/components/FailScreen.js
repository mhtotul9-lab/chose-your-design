// src/components/FailScreen.js
import React from "react";
import { S } from "./styles";

export default function FailScreen({ goTo }) {
  return (
    <div style={S.page}>
      <div style={S.card}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>❌</div>
          <h2 style={{ ...S.h2, textAlign: "center" }}>Not Qualified</h2>
          <p style={{ ...S.muted, lineHeight: 1.7, marginBottom: 24 }}>
            You did not score 80% or higher on the qualification quiz.
            You are not eligible to access this platform at this time.
          </p>
          <button style={S.btnOutline} onClick={() => goTo("quiz")}>
            Try Again
          </button>
          <button style={{ ...S.btnOutline, marginTop: 10 }} onClick={() => goTo("welcome")}>
            ← Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}
