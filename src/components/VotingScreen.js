// src/components/VotingScreen.js
import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { DEFAULT_PRODUCTS } from "../App";
import { S } from "./styles";
import logo from "../logo.png";

const FEMALE_CATS = ["dress", "saree", "salwar", "kurti", "skirt", "set", "top", "gown"];
const CLOTH_OPTS = ["Cotton", "Silk", "Linen", "Chiffon", "Georgette", "Polyester", "Velvet", "Muslin"];
const SLEEVE_OPTS = ["Full sleeve", "Half sleeve", "Sleeveless", "3/4 sleeve", "Puff sleeve", "Bell sleeve"];
const PANT_OPTS = ["Straight-cut", "Bootcut", "Skinny", "Flared", "Jogger", "Palazzo", "Wide-leg"];
const DUPATTA_OPTS = ["Chiffon dupatta", "Cotton dupatta", "Net dupatta", "Silk dupatta", "No dupatta"];
const COLOR_OPTS = ["Red", "Blue", "Green", "Black", "White", "Yellow", "Pink", "Purple", "Orange", "Beige", "Maroon", "Navy", "Teal", "Cream"];

export default function VotingScreen({ user, onLogout }) {
  const [step, setStep] = useState(1);
  const [products, setProducts] = useState(DEFAULT_PRODUCTS);
  const [selections, setSelections] = useState({ 1: null, 2: null, 3: null });
  const [scores, setScores] = useState({});
  const [attrs, setAttrs] = useState({});
  const [savedVotes, setSavedVotes] = useState({});
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!db) { setLoading(false); return; }
      try {
        const settSnap = await getDoc(doc(db, "settings", "global"));
        if (settSnap.exists() && settSnap.data().products) {
          setProducts(settSnap.data().products);
        }
        const voteSnap = await getDoc(doc(db, "votes", user.emailKey));
        if (voteSnap.exists()) {
          const vd = voteSnap.data();
          setSavedVotes(vd);
          const newSel = { 1: null, 2: null, 3: null };
          const newScores = {};
          const newAttrs = {};
          [1, 2, 3].forEach(s => {
            if (vd[s]) {
              const pid = Object.keys(vd[s])[0];
              newSel[s] = pid;
              newScores[`${s}_${pid}`] = vd[s][pid].score;
              newAttrs[`${s}_${pid}`] = vd[s][pid].attrs || {};
            }
          });
          setSelections(newSel);
          setScores(newScores);
          setAttrs(newAttrs);
        }
      } catch (e) { console.error(e); }
      setLoading(false);
    };
    load();
  }, [user.emailKey]);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const selectProduct = (pid) => {
    setSelections(s => ({ ...s, [step]: pid }));
    if (scores[`${step}_${pid}`] === undefined) setScores(sc => ({ ...sc, [`${step}_${pid}`]: 50 }));
  };

  const setScore = (pid, val) => setScores(sc => ({ ...sc, [`${step}_${pid}`]: parseInt(val) }));

  const pickAttr = (pid, type, val) => {
    const key = `${step}_${pid}`;
    setAttrs(a => ({ ...a, [key]: { ...(a[key] || {}), [type]: val } }));
  };

  const submitVote = async () => {
    const sel = selections[step];
    if (!sel) { showToast("Please select a product first.", "error"); return; }
    setSaving(true);
    try {
      const score = scores[`${step}_${sel}`] ?? 50;
      const attrData = attrs[`${step}_${sel}`] || {};
      const voteData = {
        ...savedVotes,
        [step]: { [sel]: { score, attrs: attrData, gender: user.gender, timestamp: new Date().toISOString() } }
      };
      await setDoc(doc(db, "votes", user.emailKey), { ...voteData, userEmail: user.email, userName: user.name, userGender: user.gender });
      setSavedVotes(voteData);
      showToast(`✓ Vote for Step ${step} saved!`, "success");
    } catch (e) { showToast("Failed to save. Try again.", "error"); }
    setSaving(false);
  };

  if (loading) return <div style={{ ...S.page }}><p style={S.muted}>Loading...</p></div>;

  const curProds = products[step] || [];
  const sel = selections[step];
  const selectedProd = sel ? curProds.find(p => p.id === sel) : null;
  const isFemale = selectedProd && FEMALE_CATS.includes(selectedProd.category);
  const curScore = sel ? (scores[`${step}_${sel}`] ?? 50) : 50;
  const curAttrs = sel ? (attrs[`${step}_${sel}`] || {}) : {};
  const stepSaved = sel && savedVotes[step] && savedVotes[step][sel];

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0f", padding: "1.5rem 1rem" }}>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <img src={logo} alt="Jolrasi" style={{ height: 36, objectFit: "contain" }} />
            <div>
              <h1 style={{ ...S.h1, fontSize: 18, marginBottom: 2 }}>StyleVote</h1>
              <p style={{ ...S.muted, fontSize: 12 }}>Welcome, {user.name}!</p>
            </div>
          </div>
          <button style={S.btnOutline} onClick={onLogout}>Logout</button>
        </div>

        {/* Toast */}
        {toast && (
          <div style={{ ...(toast.type === "success" ? S.successBox : S.errorBox), marginBottom: 16 }}>
            {toast.msg}
          </div>
        )}

        {/* Step tabs */}
        <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
          {[1, 2, 3].map(s => (
            <button key={s} onClick={() => setStep(s)}
              style={{ padding: "9px 22px", borderRadius: 20, border: "none", background: step === s ? "#6c5ce7" : "#1a1730", color: step === s ? "#fff" : "#a09ec0", fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: 14 }}>
              Step {s} {savedVotes[s] ? "✓" : ""}
            </button>
          ))}
        </div>

        <p style={{ ...S.muted, marginBottom: 16 }}>
          Select one product and rate it. Also choose your preferred fabric, sleeve style, and color.
        </p>

        {/* Products Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 14, marginBottom: 20 }}>
          {curProds.map(p => {
            const isSelected = sel === p.id;
            return (
              <div key={p.id} onClick={() => selectProduct(p.id)}
                style={{ background: isSelected ? "#1e1b3a" : "#16141f", border: `2px solid ${isSelected ? "#6c5ce7" : "#2a2840"}`, borderRadius: 14, padding: 14, cursor: "pointer", transition: "all 0.18s" }}>
                <img src={p.img} alt={p.name}
                  onError={e => { e.target.style.display = "none"; }}
                  style={{ width: "100%", height: 150, objectFit: "cover", borderRadius: 10, marginBottom: 10, display: "block" }} />
                <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>{p.name}</div>
                <div style={{ fontSize: 12, color: "#a09ec0" }}>{p.category}</div>
                {isSelected && <div style={{ marginTop: 8, ...S.badge("purple"), display: "block", textAlign: "center" }}>Selected ✓</div>}
              </div>
            );
          })}
        </div>

        {/* Rating + Attributes */}
        {sel && (
          <div style={{ background: "#16141f", border: "1.5px solid #2a2840", borderRadius: 16, padding: 20 }}>
            <h3 style={{ ...S.h3, marginBottom: 16 }}>Rating — {selectedProd?.name}</h3>

            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={S.muted}>Your Score</span>
              <span style={{ fontWeight: 700, color: "#a78bfa", fontSize: 18 }}>{curScore}/100</span>
            </div>
            <input type="range" min="0" max="100" value={curScore}
              onChange={e => setScore(sel, e.target.value)}
              style={{ width: "100%", marginBottom: 20, accentColor: "#6c5ce7" }} />

            <AttrGroup label="Preferred Fabric" options={CLOTH_OPTS} selected={curAttrs.cloth} onPick={v => pickAttr(sel, "cloth", v)} />
            <AttrGroup label="Preferred Sleeve" options={SLEEVE_OPTS} selected={curAttrs.sleeve} onPick={v => pickAttr(sel, "sleeve", v)} />
            {isFemale
              ? <AttrGroup label="Preferred Dupatta" options={DUPATTA_OPTS} selected={curAttrs.dupatta} onPick={v => pickAttr(sel, "dupatta", v)} />
              : <AttrGroup label="Preferred Pant Style" options={PANT_OPTS} selected={curAttrs.pant} onPick={v => pickAttr(sel, "pant", v)} />
            }
            <AttrGroup label="Preferred Color" options={COLOR_OPTS} selected={curAttrs.color} onPick={v => pickAttr(sel, "color", v)} />

            <button style={{ ...S.btnGreen, marginTop: 16, opacity: saving ? 0.7 : 1 }} onClick={submitVote} disabled={saving}>
              {saving ? "Saving..." : stepSaved ? "Update Vote for Step " + step + " ✓" : "Submit Vote for Step " + step + " →"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function AttrGroup({ label, options, selected, onPick }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <p style={{ ...S.muted, fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>{label}</p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        {options.map(o => (
          <button key={o} onClick={() => onPick(o)}
            style={{ padding: "6px 12px", borderRadius: 8, border: `1.5px solid ${selected === o ? "#00b894" : "#2a2840"}`, background: selected === o ? "#0a2420" : "#0d0b18", color: selected === o ? "#34d399" : "#a09ec0", fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: selected === o ? 600 : 400 }}>
            {o}
          </button>
        ))}
      </div>
    </div>
  );
}
