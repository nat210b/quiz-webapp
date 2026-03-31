import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAllVocab } from "../services/vocabService";

const PART5_WORDS = getAllVocab().then(
  (data) => data.filter((w) => w.part_scope === "part5").length,
);
const FULL_WORDS = getAllVocab().then(
  (data) => data.length,
);

function Home() {
  const [hovered, setHovered] = useState(null);
  const navigate = useNavigate();

  const startQuiz = (part) => navigate(`/quiz/${part}`, { state: { part } });

  return (
    <div style={S.root}>
      <style>{css}</style>

      <div style={S.wrap}>
        {/* Header */}
        <div style={S.logoBox}>
          <span style={S.logoEmoji}>📚</span>
        </div>
        <h1 style={S.title}>TOEIC Vocab</h1>
        <p style={S.sub}>เลือกโหมดที่ต้องการฝึก</p>

        {/* Part 5 Card */}
        <ModeCard
          id="part5"
          badge="🎯 PART 5 โฟกัส"
          badgeColor="#4f8ef7"
          title="Conjunction & Preposition"
          desc={
            <>
              เหมาะสำหรับ <strong>Part 5</strong> โดยเฉพาะ
              <br />
              Part 5 มีแค่ <strong>1 ประโยค</strong> — โฟกัสที่ conj vs prep
            </>
          }
          chips={[
            { color: "#4f8ef7", emoji: "🔗", label: "Conjunction" },
            { color: "#f76f4f", emoji: "📍", label: "Preposition" },
          ]}
          count={PART5_WORDS}
          btnColor="#4f8ef7"
          hovered={hovered === "part5"}
          onHover={setHovered}
          onStart={startQuiz}
        />

        {/* Full Reading Card */}
        <ModeCard
          id="reading"
          badge="📖 READING ทั้งหมด"
          badgeColor="#a78bfa"
          title="ครบทุก Part of Speech"
          desc={
            <>
              เหมาะสำหรับ <strong>Part 6 & Part 7</strong>
              <br />
              รวม Adverb และคำที่ใช้ได้หลายแบบ
            </>
          }
          chips={[
            { color: "#4f8ef7", emoji: "🔗", label: "Conj" },
            { color: "#f76f4f", emoji: "📍", label: "Prep" },
            { color: "#4fcf8a", emoji: "⚡", label: "Adv" },
            { color: "#f7c94f", emoji: "🔀", label: "Both" },
          ]}
          count={FULL_WORDS}
          btnColor="#a78bfa"
          hovered={hovered === "reading"}
          onHover={setHovered}
          onStart={startQuiz}
        />

        {/* Tip */}
        <div style={S.tip}>
          <span style={{ fontSize: "1rem" }}>💡</span>
          <div>
            <strong>Part 5 tip:</strong> ดูสิ่งที่ตามหลังช่องว่าง
            <br />
            ตามด้วย{" "}
            <span style={{ color: "#f76f4f", fontWeight: 700 }}>noun</span> →
            Preposition &nbsp;|&nbsp; ตามด้วย{" "}
            <span style={{ color: "#4f8ef7", fontWeight: 700 }}>clause</span> →
            Conjunction
          </div>
        </div>
      </div>
    </div>
  );
}

function ModeCard({
  id,
  badge,
  badgeColor,
  title,
  desc,
  chips,
  count,
  btnColor,
  hovered,
  onHover,
  onStart,
}) {
  return (
    <div
      className="mode-card"
      style={{
        ...S.card,
        border: hovered ? `2px solid ${badgeColor}` : "2px solid #252c44",
        boxShadow: hovered
          ? `0 0 28px ${badgeColor}28`
          : "0 4px 20px rgba(0,0,0,0.3)",
      }}
      onMouseEnter={() => onHover(id)}
      onMouseLeave={() => onHover(null)}
      onClick={() => onStart(id)}
    >
      <span
        style={{
          ...S.badge,
          background: `${badgeColor}1a`,
          color: badgeColor,
          border: `1px solid ${badgeColor}44`,
        }}
      >
        {badge}
      </span>
      <div style={S.cardTitle}>{title}</div>
      <div style={S.cardDesc}>{desc}</div>
      <div style={S.chips}>
        {chips.map((c) => (
          <span
            key={c.label}
            style={{
              fontSize: "0.72rem",
              color: c.color,
              background: `${c.color}18`,
              border: `1px solid ${c.color}44`,
              borderRadius: 99,
              padding: "2px 10px",
            }}
          >
            {c.emoji} {c.label}
          </span>
        ))}
      </div>
      <div style={{ fontSize: "0.75rem", color: "#7a84a8", marginBottom: 12 }}>
        {count} คำ
      </div>
      <button
        style={{ ...S.btn, background: btnColor }}
        onClick={(e) => {
          e.stopPropagation();
          onStart(id);
        }}
      >
        เริ่มเลย →
      </button>
    </div>
  );
}

const S = {
  root: {
    minHeight: "100vh",
    background: "linear-gradient(135deg,#0d1021 0%,#131729 60%,#1a1f35 100%)",
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-start",
    padding: "24px 12px 48px",
    fontFamily: "'DM Sans', sans-serif",
  },
  wrap: {
    width: "100%",
    maxWidth: 480,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 14,
  },
  logoBox: { marginTop: 12 },
  logoEmoji: { fontSize: "2.8rem" },
  title: {
    fontFamily: "'Playfair Display', serif",
    fontSize: "1.9rem",
    fontWeight: 900,
    color: "#e8d5a3",
    margin: 0,
    letterSpacing: "-0.5px",
  },
  sub: { fontSize: "0.9rem", color: "#7a84a8", margin: 0 },
  card: {
    width: "100%",
    background: "#161b2e",
    borderRadius: 20,
    padding: "20px 18px",
    cursor: "pointer",
    display: "flex",
    flexDirection: "column",
    gap: 8,
    transition: "all 0.2s ease",
  },
  badge: {
    alignSelf: "flex-start",
    fontSize: "0.72rem",
    fontWeight: 700,
    letterSpacing: "0.08em",
    borderRadius: 99,
    padding: "3px 12px",
  },
  cardTitle: {
    fontFamily: "'Playfair Display', serif",
    fontSize: "1.1rem",
    fontWeight: 700,
    color: "#e8e8f0",
  },
  cardDesc: { fontSize: "0.84rem", color: "#b0bcd8", lineHeight: 1.7 },
  chips: { display: "flex", gap: 6, flexWrap: "wrap" },
  btn: {
    padding: "11px 0",
    width: "100%",
    borderRadius: 12,
    border: "none",
    fontFamily: "'DM Sans', sans-serif",
    fontWeight: 700,
    fontSize: "0.95rem",
    color: "#fff",
    cursor: "pointer",
    letterSpacing: "0.02em",
    transition: "filter 0.15s",
  },
  tip: {
    width: "100%",
    background: "#1a2240",
    border: "1px solid #2e3a58",
    borderRadius: 14,
    padding: "12px 16px",
    fontSize: "0.82rem",
    color: "#b0bcd8",
    lineHeight: 1.7,
    display: "flex",
    gap: 10,
    alignItems: "flex-start",
  },
};

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@400;500;700&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  strong { color: #f7c94f; }
  .mode-card:hover { transform: translateY(-3px); }
  .mode-card:hover button { filter: brightness(1.1); }
`;

export default Home;
