// src/components/Loader.js
import React from "react";
import logo from "../logo.png";

export default function Loader() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#0a0a0f" }}>
      <div style={{ textAlign: "center" }}>
        <img
          src={logo}
          alt="Jolrasi"
          style={{ width: 180, marginBottom: 24, opacity: 0.9 }}
        />
        <p style={{ color: "#a09ec0", fontFamily: "'DM Sans', sans-serif", fontSize: 14 }}>
          Loading StyleVote...
        </p>
      </div>
    </div>
  );
}
