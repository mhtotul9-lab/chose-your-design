// src/components/AdminPanel.js
import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import { doc, getDoc, setDoc, collection, getDocs } from "firebase/firestore";
import { DEFAULT_QUIZ, DEFAULT_PRODUCTS } from "../App";
import { S } from "./styles";

const TABS = ["Products", "Quiz", "Results", "Users"];

export default function AdminPanel({ onLogout, systemOpen: initOpen }) {
  const [tab, setTab] = useState("Products");
  const [systemOpen, setSystemOpen] = useState(initOpen);
  const [products, setProducts] = useState(DEFAULT_PRODUCTS);
  const [quiz, setQuiz] = useState(DEFAULT_QUIZ);
  const [votes, setVotes] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    const load = async () => {
      if (!db) { setLoading(false); return; }
      try {
        const settSnap = await getDoc(doc(db, "settings", "global"));
        if (settSnap.exists()) {
          const d = settSnap.data();
          setSystemOpen(d.systemOpen || false);
          if (d.products) setProducts(d.products);
          if (d.quiz) setQuiz(d.quiz);
        }
        const userSnaps = await getDocs(collection(db, "users"));
        setUsers(userSnaps.docs.map(d => d.data()));
        const voteSnaps = await getDocs(collection(db, "votes"));
        setVotes(voteSnaps.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (e) { console.error("AdminPanel load error:", e); }
      setLoading(false);
    };
    load();
  }, []);

  const saveSettings = async (newData) => {
    if (!db) { showToast("Firebase not connected.", "error"); return; }
    setSaving(true);
    try {
      await setDoc(doc(db, "settings", "global"), newData, { merge: true });
      showToast("Saved successfully!");
    } catch (e) {
      console.error(e);
      showToast("Failed to save. Check Firebase.", "error");
    }
    setSaving(false);
  };

  const toggleSystem = async () => {
    const newVal = !systemOpen;
    setSystemOpen(newVal);
    await saveSettings({ systemOpen: newVal });
  };

  const saveProducts = () => saveSettings({ products });
  const saveQuiz = () => saveSettings({ quiz });

  const handleLogout = () => {
    localStorage.removeItem("sv_user");
    window.location.href = window.location.pathname;
  };

  if (loading) return <div style={S.page}><p style={S.muted}>Loading admin panel...</p></div>;

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0f", padding: "1.5rem 1rem" }}>
      <div style={{ maxWidth: 960, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
          <h1 style={{ ...S.h1, fontSize: 22 }}>⚙️ Admin Panel</h1>
          <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, background: "#16141f", border: "1.5px solid #2a2840", borderRadius: 12, padding: "10px 16px" }}>
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: systemOpen ? "#00b894" : "#e74c3c", boxShadow: systemOpen ? "0 0 8px #00b894" : "none" }} />
              <span style={{ fontSize: 13, fontWeight: 600, color: systemOpen ? "#34d399" : "#f87171" }}>
                {systemOpen ? "System: OPEN" : "System: CLOSED"}
              </span>
              <ToggleSwitch checked={systemOpen} onChange={toggleSystem} />
            </div>
            <button style={{ ...S.btnOutline, cursor: "pointer" }} onClick={handleLogout}>Logout</button>
          </div>
        </div>

        {toast && (
          <div style={{ ...(toast.type === "success" ? S.successBox : S.errorBox), marginBottom: 16 }}>
            {toast.msg}
          </div>
        )}

        {/* Tabs */}
        <div style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)}
              style={{ padding: "9px 20px", borderRadius: 20, border: "none", background: tab === t ? "#6c5ce7" : "#1a1730", color: tab === t ? "#fff" : "#a09ec0", fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: 14, cursor: "pointer" }}>
              {t}
            </button>
          ))}
        </div>

        {tab === "Products" && <ProductsTab products={products} setProducts={setProducts} onSave={saveProducts} saving={saving} />}
        {tab === "Quiz" && <QuizTab quiz={quiz} setQuiz={setQuiz} onSave={saveQuiz} saving={saving} />}
        {tab === "Results" && <ResultsTab votes={votes} products={products} />}
        {tab === "Users" && <UsersTab users={users} />}
      </div>
    </div>
  );
}

function ToggleSwitch({ checked, onChange }) {
  return (
    <label style={{ position: "relative", width: 48, height: 26, display: "inline-block", cursor: "pointer" }}>
      <input type="checkbox" checked={checked} onChange={onChange} style={{ opacity: 0, width: 0, height: 0 }} />
      <span style={{ position: "absolute", inset: 0, background: checked ? "#6c5ce7" : "#2a2840", borderRadius: 20, transition: "0.3s" }}>
        <span style={{ position: "absolute", height: 20, width: 20, left: checked ? 24 : 3, bottom: 3, background: "#fff", borderRadius: "50%", transition: "0.3s" }} />
      </span>
    </label>
  );
}

// ─── Products Tab ─────────────────────────────────────────────
function ProductsTab({ products, setProducts, onSave, saving }) {
  const updateField = (step, idx, key, val) => {
    setProducts(prev => {
      const next = JSON.parse(JSON.stringify(prev));
      next[step][idx][key] = val;
      return next;
    });
  };
  const deleteProduct = (step, idx) => {
    setProducts(prev => {
      const next = JSON.parse(JSON.stringify(prev));
      next[step].splice(idx, 1);
      return next;
    });
  };
  const addProduct = (step) => {
    setProducts(prev => {
      const next = JSON.parse(JSON.stringify(prev));
      next[step].push({ id: "p" + Date.now(), name: "New Product", img: "", category: "dress" });
      return next;
    });
  };

  return (
    <div>
      <div style={{ ...S.successBox, marginBottom: 20 }}>
        💡 <strong>Image tip:</strong> Paste any public image URL (Unsplash, Imgur, Google Drive public link, etc.) — no file upload needed!
      </div>
      {[1, 2, 3].map(step => (
        <div key={step} style={{ marginBottom: 28 }}>
          <h3 style={{ ...S.h3, marginBottom: 14, color: "#a09ec0" }}>Step {step} Products</h3>
          {(products[step] || []).map((p, i) => (
            <div key={p.id || i} style={{ background: "#16141f", border: "1.5px solid #2a2840", borderRadius: 14, padding: 16, marginBottom: 10 }}>
              <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                <div style={{ width: 80, height: 80, borderRadius: 10, overflow: "hidden", background: "#0d0b18", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28 }}>
                  {p.img
                    ? <img src={p.img} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={e => { e.target.style.display = "none"; }} />
                    : "🛍️"
                  }
                </div>
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
                  <input value={p.name} onChange={e => updateField(step, i, "name", e.target.value)} placeholder="Product name" style={{ marginBottom: 0 }} />
                  <input value={p.img} onChange={e => updateField(step, i, "img", e.target.value)} placeholder="Image URL — paste any public image link here" style={{ fontSize: 12, marginBottom: 0 }} />
                  <input value={p.category} onChange={e => updateField(step, i, "category", e.target.value)} placeholder="Category (dress / kurti / salwar / jacket / panjabi / saree)" style={{ fontSize: 12, marginBottom: 0 }} />
                </div>
                <button onClick={() => deleteProduct(step, i)}
                  style={{ padding: "6px 12px", borderRadius: 8, background: "#3d1a1a", color: "#f87171", border: "none", cursor: "pointer", fontWeight: 600, fontSize: 12 }}>
                  Delete
                </button>
              </div>
            </div>
          ))}
          <button onClick={() => addProduct(step)}
            style={{ ...S.btnOutline, cursor: "pointer", marginBottom: 6 }}>
            + Add Product to Step {step}
          </button>
        </div>
      ))}
      <button style={{ ...S.btnPrimary, maxWidth: 260, opacity: saving ? 0.7 : 1, cursor: "pointer" }} onClick={onSave} disabled={saving}>
        {saving ? "Saving..." : "💾 Save All Products"}
      </button>
    </div>
  );
}

// ─── Quiz Tab ─────────────────────────────────────────────────
function QuizTab({ quiz, setQuiz, onSave, saving }) {
  const updateQ = (qi, key, val) => setQuiz(prev => { const n = [...prev]; n[qi] = { ...n[qi], [key]: val }; return n; });
  const updateOpt = (qi, oi, val) => setQuiz(prev => { const n = JSON.parse(JSON.stringify(prev)); n[qi].opts[oi] = val; return n; });
  const deleteQ = (qi) => setQuiz(prev => prev.filter((_, i) => i !== qi));
  const addQ = () => setQuiz(prev => [...prev, { q: "New question?", opts: ["Option A", "Option B", "Option C", "Option D"], ans: 0 }]);

  return (
    <div>
      <p style={{ ...S.muted, marginBottom: 16 }}>
        Users must score ≥80% to register. Select the correct answer by clicking the radio button.
      </p>
      {quiz.map((q, qi) => (
        <div key={qi} style={{ background: "#16141f", border: "1.5px solid #2a2840", borderRadius: 14, padding: 16, marginBottom: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <span style={S.badge("purple")}>Question {qi + 1}</span>
            <button onClick={() => deleteQ(qi)}
              style={{ padding: "5px 12px", borderRadius: 8, background: "#3d1a1a", color: "#f87171", border: "none", cursor: "pointer", fontSize: 12, fontWeight: 600 }}>
              Delete
            </button>
          </div>
          <input value={q.q} onChange={e => updateQ(qi, "q", e.target.value)} placeholder="Question text" style={{ marginBottom: 12 }} />
          <label style={S.label}>Options — click radio to mark correct answer</label>
          {q.opts.map((o, oi) => (
            <div key={oi} style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 8 }}>
              <input type="radio" name={`correct_${qi}`} checked={q.ans === oi}
                onChange={() => updateQ(qi, "ans", oi)}
                style={{ width: 16, height: 16, accentColor: "#00b894", cursor: "pointer" }} />
              <input value={o} onChange={e => updateOpt(qi, oi, e.target.value)} style={{ flex: 1, marginBottom: 0 }} />
              {q.ans === oi && <span style={S.badge("green")}>✓ Correct</span>}
            </div>
          ))}
          <div style={{ marginTop: 10 }}>
            <label style={S.label}>Optional image URL for this question</label>
            <input value={q.img || ""} onChange={e => updateQ(qi, "img", e.target.value)} placeholder="https://..." style={{ fontSize: 12 }} />
          </div>
        </div>
      ))}
      <button onClick={addQ} style={{ ...S.btnOutline, marginBottom: 16, cursor: "pointer" }}>+ Add Question</button>
      <br />
      <button style={{ ...S.btnPrimary, maxWidth: 260, opacity: saving ? 0.7 : 1, cursor: "pointer" }} onClick={onSave} disabled={saving}>
        {saving ? "Saving..." : "💾 Save Quiz Questions"}
      </button>
    </div>
  );
}

// ─── Results Tab ──────────────────────────────────────────────
function ResultsTab({ votes, products }) {
  if (votes.length === 0) {
    return <p style={S.muted}>No votes submitted yet.</p>;
  }

  return (
    <div>
      {[1, 2, 3].map(step => {
        const prods = products[step] || [];
        const scored = prods.map(p => {
          const allScores = [];
          const genders = { male: 0, female: 0 };
          const voterDetails = [];
          votes.forEach(v => {
            if (v[step] && v[step][p.id]) {
              const vd = v[step][p.id];
              allScores.push(vd.score);
              const g = vd.gender || "male";
              genders[g] = (genders[g] || 0) + 1;
              voterDetails.push({
                user: v.userName || v.userEmail || v.id,
                score: vd.score,
                gender: g,
                attrs: vd.attrs || {},
              });
            }
          });
          const avg = allScores.length
            ? Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length)
            : 0;
          return { ...p, avg, count: allScores.length, genders, voterDetails };
        }).sort((a, b) => b.avg - a.avg);

        return (
          <div key={step} style={{ marginBottom: 32 }}>
            <h3 style={{ ...S.h3, marginBottom: 14, color: "#a09ec0" }}>
              Step {step} — Results
            </h3>
            {scored.map((p, rank) => (
              <div key={p.id} style={{ background: "#16141f", border: `1.5px solid ${rank === 0 && p.count > 0 ? "#f59e0b" : "#2a2840"}`, borderRadius: 14, padding: 16, marginBottom: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10, flexWrap: "wrap" }}>
                  <span style={{ fontSize: 22 }}>{rank === 0 && p.count > 0 ? "👑" : `#${rank + 1}`}</span>
                  <span style={{ fontWeight: rank === 0 ? 700 : 500, fontSize: 15 }}>{p.name}</span>
                  <span style={S.badge("purple")}>{p.count} votes</span>
                  {p.count > 0 && <span style={S.badge("green")}>Avg: {p.avg}/100</span>}
                  <span style={{ ...S.muted, fontSize: 12 }}>
                    Male: {p.genders.male || 0} &nbsp;|&nbsp; Female: {p.genders.female || 0}
                  </span>
                </div>
                {p.count > 0 && (
                  <div style={{ width: "100%", height: 8, background: "#1a1730", borderRadius: 10, marginBottom: 10 }}>
                    <div style={{ width: `${p.avg}%`, height: "100%", background: rank === 0 ? "#f59e0b" : "#6c5ce7", borderRadius: 10, transition: "width 0.4s" }} />
                  </div>
                )}
                {p.voterDetails.length > 0 && (
                  <details>
                    <summary style={{ ...S.muted, cursor: "pointer", fontSize: 12, userSelect: "none" }}>
                      View individual votes ({p.voterDetails.length})
                    </summary>
                    <div style={{ marginTop: 10, background: "#0d0b18", borderRadius: 10, overflow: "hidden" }}>
                      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 2fr", padding: "8px 12px", borderBottom: "1px solid #1a1730" }}>
                        {["User", "Gender", "Score", "Preferences"].map(h => (
                          <span key={h} style={{ ...S.muted, fontSize: 11, fontWeight: 700, textTransform: "uppercase" }}>{h}</span>
                        ))}
                      </div>
                      {p.voterDetails.map((vd, vi) => (
                        <div key={vi} style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 2fr", padding: "8px 12px", borderBottom: "1px solid #1a1730", fontSize: 12 }}>
                          <span style={{ fontWeight: 600 }}>{vd.user}</span>
                          <span><span style={S.badge(vd.gender === "female" ? "purple" : "green")}>{vd.gender}</span></span>
                          <span style={{ color: "#a78bfa", fontWeight: 700 }}>{vd.score}/100</span>
                          <span style={{ color: "#a09ec0", fontSize: 11 }}>
                            {[vd.attrs.cloth, vd.attrs.sleeve, vd.attrs.color, vd.attrs.pant, vd.attrs.dupatta].filter(Boolean).join(" · ") || "—"}
                          </span>
                        </div>
                      ))}
                    </div>
                  </details>
                )}
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}

// ─── Users Tab ────────────────────────────────────────────────
function UsersTab({ users }) {
  return (
    <div>
      <p style={{ ...S.muted, marginBottom: 16 }}>
        Total registered users: <strong style={{ color: "#e8e6f0" }}>{users.length}</strong>
      </p>
      {users.length === 0 && (
        <p style={S.muted}>No users registered yet.</p>
      )}
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: "2px solid #2a2840" }}>
              {["Name", "Gender", "Email", "WhatsApp", "Address", "Registered"].map(h => (
                <th key={h} style={{ padding: "10px 12px", textAlign: "left", color: "#a09ec0", fontWeight: 700, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em", whiteSpace: "nowrap" }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.map((u, i) => (
              <tr key={i} style={{ borderBottom: "1px solid #1a1730" }}>
                <td style={{ padding: "10px 12px", fontWeight: 600 }}>{u.name}</td>
                <td style={{ padding: "10px 12px" }}>
                  <span style={S.badge(u.gender === "female" ? "purple" : "green")}>{u.gender}</span>
                </td>
                <td style={{ padding: "10px 12px", color: "#a09ec0" }}>{u.email}</td>
                <td style={{ padding: "10px 12px", color: "#a09ec0" }}>{u.whatsapp}</td>
                <td style={{ padding: "10px 12px", color: "#a09ec0" }}>{u.address}</td>
                <td style={{ padding: "10px 12px", color: "#a09ec0", whiteSpace: "nowrap" }}>
                  {u.registeredAt ? new Date(u.registeredAt).toLocaleDateString("en-US") : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
