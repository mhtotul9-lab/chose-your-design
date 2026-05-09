// src/components/VotingScreen.js
import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { DEFAULT_PRODUCTS } from "../App";
import { S } from "./styles";
import { useLang } from "../App";
import { T } from "../lang";
import LangSwitcher from "./LangSwitcher";

const FEMALE_CATS = ["dress", "saree", "salwar", "kurti", "skirt", "set", "top", "gown"];
const CLOTH_OPTS = ["Cotton", "Silk", "Linen", "Chiffon", "Georgette", "Polyester", "Velvet", "Muslin"];
const SLEEVE_OPTS = ["Full sleeve", "Half sleeve", "Sleeveless", "3/4 sleeve", "Puff sleeve", "Bell sleeve"];
const PANT_OPTS = ["Straight-cut", "Bootcut", "Skinny", "Flared", "Jogger", "Palazzo", "Wide-leg"];
const DUPATTA_OPTS = ["Chiffon dupatta", "Cotton dupatta", "Net dupatta", "Silk dupatta", "No dupatta"];
const COLOR_OPTS = ["Red", "Blue", "Green", "Black", "White", "Yellow", "Pink", "Purple", "Orange", "Beige", "Maroon", "Navy", "Teal", "Cream"];

// Voting has sub-stages within each step
// Stage 0: select product (or none)
// Stage 1: rate + attributes
const TOTAL_STEPS = 3;

export default function VotingScreen({ user, onLogout }) {
  const { lang } = useLang();
  const t = T[lang];

  const [step, setStep] = useState(1);
  const [stage, setStage] = useState(0); // 0=select, 1=rate
  const [products, setProducts] = useState(DEFAULT_PRODUCTS);
  const [selections, setSelections] = useState({ 1: null, 2: null, 3: null }); // null=not chosen, "none"=skipped
  const [scores, setScores] = useState({});
  const [attrs, setAttrs] = useState({});
  const [savedVotes, setSavedVotes] = useState({});
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [allDone, setAllDone] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const settSnap = await getDoc(doc(db, "settings", "global"));
        if (settSnap.exists() && settSnap.data().products) setProducts(settSnap.data().products);
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
              newSel[s] = pid; // could be "none"
              if (pid !== "none") {
                newScores[`${s}_${pid}`] = vd[s][pid].score;
                newAttrs[`${s}_${pid}`] = vd[s][pid].attrs || {};
              }
            }
          });
          setSelections(newSel);
          setScores(newScores);
          setAttrs(newAttrs);
          // check if all done
          if (newSel[1] && newSel[2] && newSel[3]) setAllDone(true);
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
    if (pid !== "none" && scores[`${step}_${pid}`] === undefined) {
      setScores(sc => ({ ...sc, [`${step}_${pid}`]: 50 }));
    }
    if (pid === "none") {
      // Auto-submit none
      submitVoteInternal(step, "none", 0, {});
    } else {
      setStage(1);
    }
  };

  const submitVoteInternal = async (stepN, pid, score, attrData) => {
    setSaving(true);
    try {
      const voteData = {
        ...savedVotes,
        [stepN]: pid === "none"
          ? { none: { score: 0, attrs: {}, gender: user.gender, whatsapp: user.whatsapp || "", userName: user.name, timestamp: new Date().toISOString() } }
          : { [pid]: { score, attrs: attrData, gender: user.gender, whatsapp: user.whatsapp || "", userName: user.name, timestamp: new Date().toISOString() } },
        userEmail: user.email,
        userName: user.name,
        userGender: user.gender,
        userWhatsapp: user.whatsapp || "",
      };
      await setDoc(doc(db, "votes", user.emailKey), voteData);
      setSavedVotes(voteData);
      showToast(t.vote_saved(stepN), "success");
      // Move to next step or mark done
      if (stepN < TOTAL_STEPS) {
        setStep(stepN + 1);
        setStage(0);
      } else {
        setAllDone(true);
      }
    } catch (e) { showToast(t.save_failed, "error"); }
    setSaving(false);
  };

  const submitVote = () => {
    const sel = selections[step];
    if (!sel) { showToast(t.select_first, "error"); return; }
    const score = scores[`${step}_${sel}`] ?? 50;
    const attrData = attrs[`${step}_${sel}`] || {};
    submitVoteInternal(step, sel, score, attrData);
  };

  const setScore = (pid, val) => setScores(sc => ({ ...sc, [`${step}_${pid}`]: parseInt(val) }));
  const pickAttr = (pid, type, val) => {
    const key = `${step}_${pid}`;
    setAttrs(a => ({ ...a, [key]: { ...(a[key] || {}), [type]: val } }));
  };

  if (loading) return <div style={S.page}><p style={S.muted}>{t.loading}</p></div>;

  const curProds = products[step] || [];
  const sel = selections[step];
  const selectedProd = sel && sel !== "none" ? curProds.find(p => p.id === sel) : null;
  const isFemale = selectedProd && FEMALE_CATS.includes(selectedProd.category);
  const curScore = sel && sel !== "none" ? (scores[`${step}_${sel}`] ?? 50) : 50;
  const curAttrs = sel && sel !== "none" ? (attrs[`${step}_${sel}`] || {}) : {};

  // All steps done screen
  if (allDone) {
    return (
      <div style={S.page}>
        <div style={{ position: "absolute", top: 16, right: 16 }}><LangSwitcher /></div>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>🎉</div>
          <h2 style={{ ...S.h2, textAlign: "center", marginBottom: 12 }}>
            {lang === "bn" ? "ধন্যবাদ! আপনার ভোট সম্পন্ন হয়েছে।" : "Thank you! All votes submitted."}
          </h2>
          <p style={{ ...S.muted, marginBottom: 24 }}>
            {lang === "bn" ? "আপনার মতামত আমাদের কাছে অনেক গুরুত্বপূর্ণ।" : "Your feedback means a lot to us."}
          </p>
          <button style={{ ...S.btnOutline, margin: "0 auto" }} onClick={() => { setAllDone(false); setStep(1); setStage(0); }}>
            {lang === "bn" ? "আবার দেখুন" : "Review votes"}
          </button>
          <button style={{ ...S.btnOutline, marginTop: 10, margin: "10px auto 0" }} onClick={onLogout}>{t.logout}</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0f", padding: "1.5rem 1rem" }}>
      <div style={{ maxWidth: 700, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, flexWrap: "wrap", gap: 10 }}>
          <div>
            <h1 style={{ ...S.h1, fontSize: 20, marginBottom: 2 }}>👗 Jolrasi Vote</h1>
            <p style={S.muted}>{t.welcome_user(user.name)}</p>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <LangSwitcher />
            <button style={S.btnOutline} onClick={onLogout}>{t.logout}</button>
          </div>
        </div>

        {toast && <div style={{ ...(toast.type === "success" ? S.successBox : S.errorBox), marginBottom: 16 }}>{toast.msg}</div>}

        {/* Step progress */}
        <div style={{ display: "flex", gap: 6, marginBottom: 20 }}>
          {[1, 2, 3].map(s => {
            const done = savedVotes[s] !== undefined;
            const active = s === step;
            return (
              <div key={s} onClick={() => { if (done || s <= step) { setStep(s); setStage(savedVotes[s] ? 1 : 0); } }}
                style={{ flex: 1, padding: "10px 0", textAlign: "center", borderRadius: 12, border: `2px solid ${active ? "#6c5ce7" : done ? "#00b894" : "#2a2840"}`, background: active ? "#1e1b3a" : done ? "#0a2420" : "#16141f", color: active ? "#a78bfa" : done ? "#34d399" : "#a09ec0", fontWeight: 700, fontSize: 14, cursor: (done || s <= step) ? "pointer" : "default" }}>
                {done ? "✓ " : ""}{t.step_label(s)}
              </div>
            );
          })}
        </div>

        {/* Instruction box */}
        <div style={S.infoBox}>
          <strong>{t.vote_instruction_title}</strong><br />
          {t.vote_instruction}
        </div>

        {/* Stage 0: Select product */}
        {stage === 0 && (
          <div>
            <p style={{ ...S.muted, marginBottom: 14, fontSize: 15, color: "#e8e6f0" }}>{t.select_instruction}</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 12, marginBottom: 16 }}>
              {curProds.map(p => {
                const isSelected = sel === p.id;
                return (
                  <div key={p.id} onClick={() => selectProduct(p.id)}
                    style={{ background: isSelected ? "#1e1b3a" : "#16141f", border: `2px solid ${isSelected ? "#6c5ce7" : "#2a2840"}`, borderRadius: 14, padding: 12, cursor: "pointer", transition: "all 0.18s" }}>
                    <img src={p.img} alt={p.name} onError={e => { e.target.style.display = "none"; }}
                      style={{ width: "100%", height: 140, objectFit: "cover", borderRadius: 10, marginBottom: 8, display: "block" }} />
                    <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 4 }}>{p.name}</div>
                    <div style={{ fontSize: 11, color: "#a09ec0" }}>{p.category}</div>
                    {isSelected && <div style={{ marginTop: 6, ...S.badge("purple"), display: "block", textAlign: "center" }}>✓ Selected</div>}
                  </div>
                );
              })}
            </div>
            {/* None option */}
            <button style={{ ...S.btnGray, marginTop: 8 }} onClick={() => selectProduct("none")}>
              🚫 {t.none_option}
            </button>
          </div>
        )}

        {/* Stage 1: Rate + attributes */}
        {stage === 1 && sel && sel !== "none" && selectedProd && (
          <div>
            <div style={{ display: "flex", gap: 16, marginBottom: 20, alignItems: "flex-start" }}>
              <img src={selectedProd.img} alt={selectedProd.name}
                style={{ width: 100, height: 100, objectFit: "cover", borderRadius: 12, flexShrink: 0 }} />
              <div>
                <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>{selectedProd.name}</div>
                <div style={{ fontSize: 12, color: "#a09ec0", marginBottom: 8 }}>{selectedProd.category}</div>
                <button style={{ ...S.btnOutline, fontSize: 12, padding: "5px 12px" }} onClick={() => setStage(0)}>
                  ← {lang === "bn" ? "পরিবর্তন করুন" : "Change selection"}
                </button>
              </div>
            </div>

            {/* Score */}
            <div style={{ background: "#16141f", border: "1.5px solid #2a2840", borderRadius: 14, padding: 16, marginBottom: 14 }}>
              <p style={{ ...S.muted, fontSize: 13, fontWeight: 600, marginBottom: 10 }}>{t.rating_instruction}</p>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={S.muted}>{lang === "bn" ? "স্কোর" : "Score"}</span>
                <span style={{ fontWeight: 700, color: "#a78bfa", fontSize: 20 }}>{curScore}/100</span>
              </div>
              <input type="range" min="0" max="100" value={curScore}
                onChange={e => setScore(sel, e.target.value)}
                style={{ width: "100%", accentColor: "#6c5ce7" }} />
            </div>

            <AttrGroup label={t.fabric_instruction} options={CLOTH_OPTS} selected={curAttrs.cloth} onPick={v => pickAttr(sel, "cloth", v)} />
            <AttrGroup label={t.sleeve_instruction} options={SLEEVE_OPTS} selected={curAttrs.sleeve} onPick={v => pickAttr(sel, "sleeve", v)} />
            {isFemale
              ? <AttrGroup label={lang === "bn" ? "🥻 কোন দুপাট্টা পছন্দ করবেন?" : "🥻 Preferred dupatta:"} options={DUPATTA_OPTS} selected={curAttrs.dupatta} onPick={v => pickAttr(sel, "dupatta", v)} />
              : <AttrGroup label={t.bottom_instruction} options={PANT_OPTS} selected={curAttrs.pant} onPick={v => pickAttr(sel, "pant", v)} />
            }
            <AttrGroup label={t.color_instruction} options={COLOR_OPTS} selected={curAttrs.color} onPick={v => pickAttr(sel, "color", v)} />

            <button style={{ ...S.btnGreen, marginTop: 16, opacity: saving ? 0.7 : 1 }} onClick={submitVote} disabled={saving}>
              {saving ? t.saving : (savedVotes[step] ? t.update_vote(step) : t.submit_vote(step))}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function AttrGroup({ label, options, selected, onPick }) {
  return (
    <div style={{ background: "#16141f", border: "1.5px solid #2a2840", borderRadius: 14, padding: 14, marginBottom: 12 }}>
      <p style={{ ...S.muted, fontSize: 13, fontWeight: 600, marginBottom: 10 }}>{label}</p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        {options.map(o => (
          <button key={o} onClick={() => onPick(o)}
            style={{ padding: "6px 12px", borderRadius: 8, border: `1.5px solid ${selected === o ? "#00b894" : "#2a2840"}`, background: selected === o ? "#0a2420" : "#0d0b18", color: selected === o ? "#34d399" : "#a09ec0", fontFamily: "'DM Sans',sans-serif", fontSize: 12, fontWeight: selected === o ? 600 : 400, cursor: "pointer" }}>
            {o}
          </button>
        ))}
      </div>
    </div>
  );
}
