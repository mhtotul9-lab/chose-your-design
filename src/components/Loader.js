// src/components/Loader.js
import React from "react";

export default function Loader() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#0a0a0f" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>👗</div>
        <p style={{ color: "#a09ec0", fontFamily: "'DM Sans', sans-serif" }}>Loading StyleVote...</p>
      </div>
    </div>
  );
}
