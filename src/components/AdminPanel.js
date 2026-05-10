// src/components/AdminPanel.js
import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import { doc, getDoc, setDoc, collection, getDocs, deleteDoc, updateDoc } from "firebase/firestore";
import { DEFAULT_QUIZ, DEFAULT_PRODUCTS } from "../App";
import { S } from "./styles";

const TABS = ["Products", "Quiz", "Results", "Users"];

const COLOR_MAP = {
  Red: "#e74c3c", Blue: "#3498db", Green: "#27ae60", Black: "#2c2c2c",
  White: "#ecf0f1", Yellow: "#f1c40f", Pink: "#e91e8c", Purple: "#9b59b6",
  Orange: "#e67e22", Beige: "#d4b896", Maroon: "#800000", Navy: "#001f5b",
  Teal: "#009688", Cream: "#fffdd0",
};

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
    setTimeout(() => setToast(null), 3500);
  };

  const loadAll = async () => {
    setLoading(true);
    try {
      const settSnap = await getDoc(doc(db, "settings", "global"));
      if (settSnap.exists()) {
        const d = settSnap.data();
        setSystemOpen(d.systemOpen || false);
        if (d.products) setProducts(d.products);
        if (d.quiz) setQuiz(d.quiz);
      }
      const userSnaps = await getDocs(collection(db, "users"));
      setUsers(userSnaps.docs.map(d => ({ _id: d.id, ...d.data() })));
      const voteSnaps = await getDocs(collection(db, "votes"));
      setVotes(voteSnaps.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { loadAll(); }, []);

  const saveSettings = async (data) => {
    setSaving(true);
    try {
      await setDoc(doc(db, "settings", "global"), data, { merge: true });
      showToast("Saved!");
    } catch { showToast("Failed to save.", "error"); }
    setSaving(false);
  };

  const toggleSystem = async () => {
    const v = !systemOpen; setSystemOpen(v);
    await saveSettings({ systemOpen: v });
  };

  const handleLogout = () => {
    sessionStorage.removeItem("sv_admin");
    window.location.href = "/admin";
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("এই ইউজারকে ডিলিট করবেন? এই কাজ পূর্বাবস্থায় ফেরানো যাবে না।")) return;
    try {
      await deleteDoc(doc(db, "users", userId));
      setUsers(prev => prev.filter(u => u._id !== userId));
      showToast("ইউজার ডিলিট করা হয়েছে।");
    } catch (e) { showToast("ডিলিট ব্যর্থ হয়েছে।", "error"); }
  };

  const handleBanUser = async (userId, currentBanned) => {
    try {
      await updateDoc(doc(db, "users", userId), { banned: !currentBanned });
      setUsers(prev => prev.map(u => u._id === userId ? { ...u, banned: !currentBanned } : u));
      showToast(currentBanned ? "ব্যান তুলে নেওয়া হয়েছে।" : "ইউজার ব্যান করা হয়েছে।");
    } catch (e) { showToast("আপডেট ব্যর্থ হয়েছে।", "error"); }
  };

  const handleDeleteVote = async (voteId) => {
    if (!window.confirm("এই ভোটের ডাটা মুছে দেবেন?")) return;
    try {
      await deleteDoc(doc(db, "votes", voteId));
      setVotes(prev => prev.filter(v => v.id !== voteId));
      showToast("ভোট ডাটা মুছে দেওয়া হয়েছে।");
    } catch (e) { showToast("মুছতে ব্যর্থ হয়েছে।", "error"); }
  };

  if (loading) return <div style={S.page}><p style={S.muted}>Loading admin panel...</p></div>;

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0f", padding: "1.5rem 1rem" }}>
      <div style={{ maxWidth: 980, margin: "0 auto" }}>
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
            <button style={{ ...S.btnOutline, cursor: "pointer" }} onClick={() => loadAll()}>🔄 Refresh</button>
            <button style={{ ...S.btnOutline, cursor: "pointer" }} onClick={handleLogout}>Logout</button>
          </div>
        </div>

        {toast && <div style={{ ...(toast.type === "success" ? S.successBox : S.errorBox), marginBottom: 16 }}>{toast.msg}</div>}

        <div style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
          {TABS.map(t2 => (
            <button key={t2} onClick={() => setTab(t2)}
              style={{ padding: "9px 20px", borderRadius: 20, border: "none", background: tab === t2 ? "#6c5ce7" : "#1a1730", color: tab === t2 ? "#fff" : "#a09ec0", fontFamily: "'DM Sans',sans-serif", fontWeight: 600, fontSize: 14, cursor: "pointer" }}>
              {t2}
            </button>
          ))}
        </div>

        {tab === "Products" && <ProductsTab products={products} setProducts={setProducts} onSave={() => saveSettings({ products })} saving={saving} />}
        {tab === "Quiz" && <QuizTab quiz={quiz} setQuiz={setQuiz} onSave={() => saveSettings({ quiz })} saving={saving} />}
        {tab === "Results" && <ResultsTab votes={votes} products={products} onDeleteVote={handleDeleteVote} />}
        {tab === "Users" && <UsersTab users={users} onDelete={handleDeleteUser} onBan={handleBanUser} />}
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

function ProductsTab({ products, setProducts, onSave, saving }) {
  const update = (step, i, k, v) => setProducts(prev => { const n = JSON.parse(JSON.stringify(prev)); n[step][i][k] = v; return n; });
  const del = (step, i) => setProducts(prev => { const n = JSON.parse(JSON.stringify(prev)); n[step].splice(i, 1); return n; });
  const add = (step) => setProducts(prev => { const n = JSON.parse(JSON.stringify(prev)); n[step].push({ id: "p" + Date.now(), name: "New Product", img: "", category: "dress" }); return n; });
  return (
    <div>
      <div style={{ ...S.successBox, marginBottom: 20 }}>
        💡 <strong>Image tip:</strong> Paste any public image URL — no file upload needed!
      </div>
      {[1, 2, 3].map(step => (
        <div key={step} style={{ marginBottom: 28 }}>
          <h3 style={{ ...S.h3, marginBottom: 14, color: "#a09ec0" }}>Step {step} Products</h3>
          {(products[step] || []).map((p, i) => (
            <div key={p.id || i} style={{ background: "#16141f", border: "1.5px solid #2a2840", borderRadius: 14, padding: 16, marginBottom: 10 }}>
              <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                <div style={{ width: 80, height: 80, borderRadius: 10, overflow: "hidden", background: "#0d0b18", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28 }}>
                  {p.img ? <img src={p.img} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={e => { e.target.style.display = "none"; }} /> : "🛍️"}
                </div>
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
                  <input value={p.name} onChange={e => update(step, i, "name", e.target.value)} placeholder="Product name" style={{ marginBottom: 0 }} />
                  <input value={p.img} onChange={e => update(step, i, "img", e.target.value)} placeholder="Image URL" style={{ fontSize: 12, marginBottom: 0 }} />
                  <input value={p.category} onChange={e => update(step, i, "category", e.target.value)} placeholder="Category (dress/kurti/panjabi...)" style={{ fontSize: 12, marginBottom: 0 }} />
                </div>
                <button onClick={() => del(step, i)} style={{ padding: "6px 12px", borderRadius: 8, background: "#3d1a1a", color: "#f87171", border: "none", cursor: "pointer", fontWeight: 600, fontSize: 12 }}>Delete</button>
              </div>
            </div>
          ))}
          <button onClick={() => add(step)} style={{ ...S.btnOutline, cursor: "pointer", marginBottom: 6 }}>+ Add to Step {step}</button>
        </div>
      ))}
      <button style={{ ...S.btnPrimary, maxWidth: 260, opacity: saving ? 0.7 : 1 }} onClick={onSave} disabled={saving}>
        {saving ? "Saving..." : "💾 Save All Products"}
      </button>
    </div>
  );
}

function QuizTab({ quiz, setQuiz, onSave, saving }) {
  const upQ = (qi, k, v) => setQuiz(p => { const n = [...p]; n[qi] = { ...n[qi], [k]: v }; return n; });
  const upO = (qi, oi, v) => setQuiz(p => { const n = JSON.parse(JSON.stringify(p)); n[qi].opts[oi] = v; return n; });
  const del = (qi) => setQuiz(p => p.filter((_, i) => i !== qi));
  const add = () => setQuiz(p => [...p, { q: "New question?", opts: ["Option A", "Option B", "Option C", "Option D"], ans: 0 }]);
  return (
    <div>
      <p style={{ ...S.muted, marginBottom: 16 }}>Users must score ≥80% to register. Radio = correct answer.</p>
      {quiz.map((q, qi) => (
        <div key={qi} style={{ background: "#16141f", border: "1.5px solid #2a2840", borderRadius: 14, padding: 16, marginBottom: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <span style={S.badge("purple")}>Q{qi + 1}</span>
            <button onClick={() => del(qi)} style={{ padding: "5px 12px", borderRadius: 8, background: "#3d1a1a", color: "#f87171", border: "none", cursor: "pointer", fontSize: 12, fontWeight: 600 }}>Delete</button>
          </div>
          <input value={q.q} onChange={e => upQ(qi, "q", e.target.value)} placeholder="Question" style={{ marginBottom: 12 }} />
          {q.opts.map((o, oi) => (
            <div key={oi} style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 8 }}>
              <input type="radio" name={"c_" + qi} checked={q.ans === oi} onChange={() => upQ(qi, "ans", oi)} style={{ width: 16, height: 16, accentColor: "#00b894", cursor: "pointer" }} />
              <input value={o} onChange={e => upO(qi, oi, e.target.value)} style={{ flex: 1, marginBottom: 0 }} />
              {q.ans === oi && <span style={S.badge("green")}>✓</span>}
            </div>
          ))}
          <input value={q.img || ""} onChange={e => upQ(qi, "img", e.target.value)} placeholder="Optional image URL" style={{ marginTop: 8, fontSize: 12 }} />
        </div>
      ))}
      <button onClick={add} style={{ ...S.btnOutline, marginBottom: 16 }}>+ Add Question</button><br />
      <button style={{ ...S.btnPrimary, maxWidth: 260, opacity: saving ? 0.7 : 1 }} onClick={onSave} disabled={saving}>
        {saving ? "Saving..." : "💾 Save Quiz"}
      </button>
    </div>
  );
}

function ColorSwatch({ color }) {
  const bg = COLOR_MAP[color];
  if (!color) return <span style={{ color: "#555" }}>—</span>;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
      <span style={{
        display: "inline-block", width: 14, height: 14, borderRadius: "50%",
        background: bg || "#555", border: "1.5px solid #555", flexShrink: 0,
        boxShadow: (bg === "#ecf0f1" || bg === "#fffdd0") ? "inset 0 0 0 1px #888" : "none"
      }} />
      <span style={{ color: "#d4d0ee", fontSize: 11 }}>{color}</span>
    </span>
  );
}

function ResultsTab({ votes, products, onDeleteVote }) {
  if (votes.length === 0) return <p style={S.muted}>No votes submitted yet.</p>;
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
              allScores.push(vd.score || 0);
              const g = vd.gender || "male";
              genders[g] = (genders[g] || 0) + 1;
              voterDetails.push({
                voteDocId: v.id,
                user: vd.userName || v.userName || v.id,
                whatsapp: vd.whatsapp || v.userWhatsapp || "N/A",
                score: vd.score || 0,
                gender: g,
                attrs: vd.attrs || {},
              });
            }
          });
          const avg = allScores.length ? Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length) : 0;
          return { ...p, avg, count: allScores.length, genders, voterDetails };
        });
        const sorted = [...scored].sort((a, b) => b.count !== a.count ? b.count - a.count : b.avg - a.avg);
        let noneCount = 0;
        const noneVoters = [];
        votes.forEach(v => {
          if (v[step] && v[step]["none"]) {
            noneCount++;
            noneVoters.push({ voteDocId: v.id, user: v.userName || v.id });
          }
        });
        return (
          <div key={step} style={{ marginBottom: 36 }}>
            <h3 style={{ ...S.h3, marginBottom: 16, color: "#a09ec0", borderBottom: "1px solid #2a2840", paddingBottom: 10 }}>
              Step {step} Results — {votes.length} total voters
            </h3>
            {sorted.map((p, rank) => (
              <div key={p.id} style={{ background: "#16141f", border: "2px solid " + (rank === 0 && p.count > 0 ? "#f59e0b" : "#2a2840"), borderRadius: 16, padding: 16, marginBottom: 14 }}>
                <div style={{ display: "flex", gap: 14, alignItems: "flex-start", marginBottom: 12 }}>
                  <div style={{ position: "relative", flexShrink: 0 }}>
                    {rank === 0 && p.count > 0 && <div style={{ position: "absolute", top: -8, left: -8, fontSize: 20, zIndex: 1 }}>👑</div>}
                    {p.img
                      ? <img src={p.img} alt={p.name} style={{ width: 80, height: 80, objectFit: "cover", borderRadius: 10, border: "2px solid " + (rank === 0 && p.count > 0 ? "#f59e0b" : "#2a2840") }} />
                      : <div style={{ width: 80, height: 80, borderRadius: 10, background: "#1a1730", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28 }}>🛍️</div>
                    }
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 6 }}>
                      <span style={{ fontWeight: rank === 0 ? 700 : 500, fontSize: 16 }}>#{rank + 1} {p.name}</span>
                      {rank === 0 && p.count > 0 && <span style={S.badge("gold")}>🏆 Winner</span>}
                    </div>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      <span style={S.badge("purple")}>{p.count} votes</span>
                      {p.count > 0 && <span style={S.badge("green")}>Avg: {p.avg}/100</span>}
                      <span style={{ ...S.muted, fontSize: 12 }}>♂ {p.genders.male || 0} ♀ {p.genders.female || 0}</span>
                    </div>
                    {p.count > 0 && (
                      <div style={{ marginTop: 8, width: "100%", height: 8, background: "#1a1730", borderRadius: 10 }}>
                        <div style={{ width: p.avg + "%", height: "100%", background: rank === 0 ? "#f59e0b" : "#6c5ce7", borderRadius: 10, transition: "width 0.4s" }} />
                      </div>
                    )}
                  </div>
                </div>

                {p.voterDetails.length > 0 && (
                  <details>
                    <summary style={{ ...S.muted, cursor: "pointer", fontSize: 13, padding: "6px 0", userSelect: "none" }}>
                      📋 View {p.voterDetails.length} voter(s)
                    </summary>
                    <div style={{ marginTop: 10, background: "#0d0b18", borderRadius: 10, overflow: "hidden" }}>
                      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1.2fr 0.8fr 0.6fr 1fr 1fr 1fr 0.8fr", padding: "8px 12px", borderBottom: "1px solid #1a1730", gap: 6 }}>
                        {["নাম", "WhatsApp", "লিঙ্গ", "স্কোর", "কাপড়/হাতা", "পেন্ট/দুপাট্টা", "রঙ", "মুছুন"].map(h => (
                          <span key={h} style={{ ...S.muted, fontSize: 10, fontWeight: 700, textTransform: "uppercase" }}>{h}</span>
                        ))}
                      </div>
                      {p.voterDetails.map((vd, vi) => (
                        <div key={vi} style={{ display: "grid", gridTemplateColumns: "1.2fr 1.2fr 0.8fr 0.6fr 1fr 1fr 1fr 0.8fr", padding: "10px 12px", borderBottom: "1px solid #1a1730", fontSize: 12, alignItems: "center", gap: 6 }}>
                          <span style={{ fontWeight: 600 }}>{vd.user}</span>
                          <span style={{ color: "#34d399", fontWeight: 600 }}>📱 {vd.whatsapp}</span>
                          <span><span style={S.badge(vd.gender === "female" ? "purple" : "green")}>{vd.gender}</span></span>
                          <span style={{ color: "#a78bfa", fontWeight: 700 }}>{vd.score}/100</span>
                          <span style={{ color: "#a09ec0", fontSize: 11, lineHeight: 1.7 }}>
                            {vd.attrs.cloth && <span style={{ display: "block" }}>🧵 {vd.attrs.cloth}</span>}
                            {vd.attrs.sleeve && <span style={{ display: "block" }}>👕 {vd.attrs.sleeve}</span>}
                            {!vd.attrs.cloth && !vd.attrs.sleeve && "—"}
                          </span>
                          <span style={{ color: "#a09ec0", fontSize: 11, lineHeight: 1.7 }}>
                            {vd.attrs.pant && <span style={{ display: "block" }}>👖 {vd.attrs.pant}</span>}
                            {vd.attrs.dupatta && <span style={{ display: "block" }}>🥻 {vd.attrs.dupatta}</span>}
                            {!vd.attrs.pant && !vd.attrs.dupatta && "—"}
                          </span>
                          <ColorSwatch color={vd.attrs.color} />
                          <button onClick={() => onDeleteVote(vd.voteDocId)}
                            style={{ padding: "4px 8px", borderRadius: 6, background: "#3d1a1a", color: "#f87171", border: "none", cursor: "pointer", fontSize: 11, fontWeight: 600 }}>
                            🗑️ মুছুন
                          </button>
                        </div>
                      ))}
                    </div>
                  </details>
                )}
              </div>
            ))}

            {noneCount > 0 && (
              <div style={{ background: "#16141f", border: "1.5px solid #2a2840", borderRadius: 12, padding: 14 }}>
                <span style={S.muted}>🚫 {noneCount} voter(s) selected "None of these"</span>
                {noneVoters.map((nv, ni) => (
                  <div key={ni} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 6, borderTop: "1px solid #1a1730", paddingTop: 6 }}>
                    <span style={{ fontSize: 12, color: "#a09ec0" }}>{nv.user}</span>
                    <button onClick={() => onDeleteVote(nv.voteDocId)}
                      style={{ padding: "3px 8px", borderRadius: 6, background: "#3d1a1a", color: "#f87171", border: "none", cursor: "pointer", fontSize: 11, fontWeight: 600 }}>
                      🗑️ মুছুন
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function UsersTab({ users, onDelete, onBan }) {
  const [search, setSearch] = useState("");
  const filtered = users.filter(u => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      (u.name || "").toLowerCase().includes(q) ||
      (u.whatsapp || "").includes(q) ||
      (u.email || "").toLowerCase().includes(q)
    );
  });

  return (
    <div>
      <div style={{ marginBottom: 16, display: "flex", gap: 10, alignItems: "center" }}>
        <div style={{ position: "relative", flex: 1, maxWidth: 380 }}>
          <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", fontSize: 16, pointerEvents: "none" }}>🔍</span>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="নাম, নম্বর বা ইমেইল দিয়ে খুঁজুন..."
            style={{ width: "100%", paddingLeft: 36, paddingRight: 12, paddingTop: 9, paddingBottom: 9, borderRadius: 10, border: "1.5px solid #2a2840", background: "#16141f", color: "#e8e6f0", fontFamily: "'DM Sans',sans-serif", fontSize: 13, boxSizing: "border-box" }}
          />
        </div>
        {search && (
          <button onClick={() => setSearch("")} style={{ ...S.btnOutline, fontSize: 12, padding: "7px 14px" }}>✕ Clear</button>
        )}
      </div>

      <p style={{ ...S.muted, marginBottom: 16 }}>
        মোট: <strong style={{ color: "#e8e6f0" }}>{users.length}</strong>
        {search && <span> · পাওয়া গেছে: <strong style={{ color: "#a78bfa" }}>{filtered.length}</strong></span>}
      </p>

      {filtered.length === 0 && <p style={S.muted}>কোন ইউজার পাওয়া যায়নি।</p>}

      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: "2px solid #2a2840" }}>
              {["Name", "Gender", "Email", "WhatsApp", "Address", "Registered", "Status", "Actions"].map(h => (
                <th key={h} style={{ padding: "10px 12px", textAlign: "left", color: "#a09ec0", fontWeight: 700, fontSize: 11, textTransform: "uppercase", whiteSpace: "nowrap" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((u, i) => (
              <tr key={i} style={{ borderBottom: "1px solid #1a1730", background: u.banned ? "#1a0f0f" : "transparent" }}>
                <td style={{ padding: "10px 12px", fontWeight: 600, opacity: u.banned ? 0.6 : 1 }}>
                  {u.name}
                  {u.banned && <span style={{ marginLeft: 6, fontSize: 10, background: "#7f1d1d", color: "#f87171", padding: "2px 6px", borderRadius: 4, fontWeight: 700 }}>BANNED</span>}
                </td>
                <td style={{ padding: "10px 12px" }}><span style={S.badge(u.gender === "female" ? "purple" : "green")}>{u.gender}</span></td>
                <td style={{ padding: "10px 12px", color: "#a09ec0" }}>{u.email}</td>
                <td style={{ padding: "10px 12px", color: "#34d399", fontWeight: 600 }}>📱 {u.whatsapp}</td>
                <td style={{ padding: "10px 12px", color: "#a09ec0" }}>{u.address}</td>
                <td style={{ padding: "10px 12px", color: "#a09ec0", whiteSpace: "nowrap" }}>{u.registeredAt ? new Date(u.registeredAt).toLocaleDateString() : "—"}</td>
                <td style={{ padding: "10px 12px" }}>
                  {u.banned
                    ? <span style={{ color: "#f87171", fontSize: 12, fontWeight: 600 }}>🚫 Banned</span>
                    : <span style={{ color: "#34d399", fontSize: 12, fontWeight: 600 }}>✅ Active</span>
                  }
                </td>
                <td style={{ padding: "10px 12px", whiteSpace: "nowrap" }}>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button onClick={() => onBan(u._id, !!u.banned)}
                      style={{ padding: "5px 10px", borderRadius: 7, background: u.banned ? "#0a2420" : "#2a1a0a", color: u.banned ? "#34d399" : "#f59e0b", border: "1px solid " + (u.banned ? "#00b894" : "#f59e0b"), cursor: "pointer", fontSize: 11, fontWeight: 700 }}>
                      {u.banned ? "✅ Unban" : "🚫 Ban"}
                    </button>
                    <button onClick={() => onDelete(u._id)}
                      style={{ padding: "5px 10px", borderRadius: 7, background: "#3d1a1a", color: "#f87171", border: "1px solid #7f1d1d", cursor: "pointer", fontSize: 11, fontWeight: 700 }}>
                      🗑️ Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
