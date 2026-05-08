// src/components/QuizScreen.js
import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import { DEFAULT_QUIZ } from "../App";
import { S } from "./styles";

export default function QuizScreen({ onPass, onFail, goTo }) {
  const [quiz, setQuiz] = useState([]);
  const [current, setCurrent] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [selected, setSelected] = useState(null);
  const [answered, setAnswered] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const snap = await getDoc(doc(db, "settings", "global"));
        const q = snap.exists() && snap.data().quiz ? snap.data().quiz : DEFAULT_QUIZ;
        setQuiz(q);
      } catch {
        setQuiz(DEFAULT_QUIZ);
      }
      setLoading(false);
    };
    load();
  }, []);

  const handleSelect = (i) => {
    if (answered) return;
    setSelected(i);
    setAnswered(true);
  };

  const handleNext = () => {
    const newCorrect = selected === quiz[current].ans ? correct + 1 : correct;
    if (current + 1 >= quiz.length) {
      const pct = (newCorrect / quiz.length) * 100;
      if (pct >= 80) onPass();
      else onFail();
    } else {
      setCorrect(newCorrect);
      setCurrent(c => c + 1);
      setSelected(null);
      setAnswered(false);
    }
  };

  if (loading) return <div style={{ ...S.page }}><p style={S.muted}>Loading quiz...</p></div>;
  if (!quiz.length) return <div style={{ ...S.page }}><p style={S.muted}>No questions available.</p></div>;

  const q = quiz[current];
  const progress = ((current) / quiz.length) * 100;

  return (
    <div style={S.page}>
      <div style={{ width: "100%", maxWidth: 520, marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
          <span style={S.muted}>Question {current + 1} of {quiz.length}</span>
          <span style={S.badge("purple")}>{correct} correct so far</span>
        </div>
        <div style={{ width: "100%", height: 6, background: "#1a1730", borderRadius: 10 }}>
          <div style={{ width: `${progress}%`, height: "100%", background: "linear-gradient(90deg, #6c5ce7, #a78bfa)", borderRadius: 10, transition: "width 0.4s" }} />
        </div>
      </div>

      <div style={{ ...S.card, maxWidth: 520 }}>
        <p style={{ fontSize: 17, fontWeight: 600, lineHeight: 1.6, marginBottom: 20, color: "#e8e6f0" }}>
          {q.q}
        </p>
        {q.img && (
          <img src={q.img} alt="question" style={{ width: "100%", borderRadius: 10, marginBottom: 16, maxHeight: 220, objectFit: "cover" }} />
        )}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {q.opts.map((opt, i) => {
            let bg = "#0d0b18", border = "#2a2840", color = "#e8e6f0";
            if (answered) {
              if (i === q.ans) { bg = "#0a2420"; border = "#00b894"; color = "#34d399"; }
              else if (i === selected && i !== q.ans) { bg = "#1f0e0e"; border = "#e74c3c"; color = "#f87171"; }
            } else if (selected === i) {
              bg = "#1e1b3a"; border = "#6c5ce7"; color = "#a78bfa";
            }
            return (
              <button
                key={i}
                onClick={() => handleSelect(i)}
                style={{ padding: "12px 14px", background: bg, border: `1.5px solid ${border}`, borderRadius: 10, color, fontFamily: "'DM Sans', sans-serif", fontSize: 14, textAlign: "left", cursor: answered ? "default" : "pointer", transition: "all 0.15s" }}
              >
                {opt}
              </button>
            );
          })}
        </div>
        {answered && (
          <button style={{ ...S.btnPrimary, marginTop: 20 }} onClick={handleNext}>
            {current + 1 >= quiz.length ? "See Results →" : "Next Question →"}
          </button>
        )}
      </div>
    </div>
  );
}
