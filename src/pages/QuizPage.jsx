import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { isSupabaseConfigured, supabase } from "../utils/supabaseClient";

const QUESTIONS_TABLE = "vocab_words";
const DEFAULT_LIMIT = 1000;

const ALL_CATS = [
  {
    id: "conj",
    label: "Conjunction",
    short: "conj",
    color: "#4f8ef7",
    emoji: "🔗",
  },
  {
    id: "prep",
    label: "Preposition",
    short: "prep",
    color: "#f76f4f",
    emoji: "📍",
  },
  { id: "adv", label: "Adverb", short: "adv", color: "#4fcf8a", emoji: "⚡" },
  { id: "both", label: "Both", short: "both", color: "#f7c94f", emoji: "🔀" },
];

const isPartSixOrSeven = (part) => part === "reading";

const normalizeCatId = (raw) => {
  if (!raw) return null;
  const value = String(raw).trim().toLowerCase();
  if (value === "conj" || value === "conjunction") return "conj";
  if (value === "prep" || value === "preposition") return "prep";
  if (value === "adv" || value === "adverb") return "adv";
  if (value === "both") return "both";
  return value;
};

const getCorrectCat = (row, part) => {
  if (!row) return null;
  // Part 5: use word_type directly (conj/prep)
  if (part === "part5") return normalizeCatId(row.word_type);

  // Reading (Part 6/7): if dual_type exists => answer "both", otherwise use word_type
  if (isPartSixOrSeven(part)) {
    if (row.dual_type) return "both";
    return normalizeCatId(row.word_type);
  }

  // Other parts: if dual_type exists => "both", otherwise use word_type
  if (row.dual_type) return "both";
  return normalizeCatId(row.word_type);
};

function randomInt(max) {
  if (max <= 0) return 0;
  try {
    const buf = new Uint32Array(1);
    crypto.getRandomValues(buf);
    return buf[0] % max;
  } catch {
    return Math.floor(Math.random() * max);
  }
}

function shuffle(arr) {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = randomInt(i + 1);
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

const PART5_CATS = ALL_CATS.filter((c) => c.id === "conj" || c.id === "prep");
const FULL_CATS = ALL_CATS;

function QuizPage() {
  const params = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const part = useMemo(
    () => params.part || location.state?.part || "",
    [params.part, location.state],
  );
  const activeCats = part === "part5" ? PART5_CATS : FULL_CATS;

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(Boolean(part));
  const [error, setError] = useState(null);
  const [deck, setDeck] = useState([]);
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const [score, setScore] = useState(0);
  const [total, setTotal] = useState(0);
  const [done, setDone] = useState(false);
  const [animKey, setAnimKey] = useState(0);

  // ── Fetch ──────────────────────────────────────────────────
  useEffect(() => {
    if (!part) return;
    let cancelled = false;
    (async () => {
      if (!isSupabaseConfigured || !supabase) {
        if (cancelled) return;
        setError("Supabase ยังไม่ได้ตั้งค่า");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        let query = supabase.from(QUESTIONS_TABLE).select("*");

        if (isPartSixOrSeven(part)) {
          query = query.in("part_scope", ["reading"]);
        } else {
          query = query.eq("part_scope", part).limit(DEFAULT_LIMIT);

          if (part === "part5") {
            query = query.in("word_type", ["conj", "prep"]);
          }
        }

        const { data, error: err } = await query;
        if (cancelled) return;
        if (err) {
          setError(err.message);
          setLoading(false);
          return;
        }

        const s = shuffle(data ?? []);
        setRows(s);
        setDeck(s);
        setLoading(false);
      } catch (e) {
        if (!cancelled) {
          setError(String(e));
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [part]);

  useEffect(() => {
    let cancelled = false;
    Promise.resolve().then(() => {
      if (cancelled) return;
      setIdx(0);
      setSelected(null);
      setRevealed(false);
      setScore(0);
      setTotal(0);
      setDone(false);
    });
    return () => {
      cancelled = true;
    };
  }, [deck]);

  const current = deck[idx] ?? null;
  const correctCat = getCorrectCat(current, part);
  const isCorrect = selected === correctCat;
  const pct = total > 0 ? Math.round((score / total) * 100) : 0;
  const modeColor = part === "part5" ? "#4f8ef7" : "#a78bfa";
  const modeLabel = part === "part5" ? "PART 5" : "READING";

  const diffColor =
    current?.difficulty === 1
      ? "#4fcf8a"
      : current?.difficulty === 2
        ? "#f7c94f"
        : "#f76f4f";
  const diffLabel =
    current?.difficulty === 1
      ? "Beginner"
      : current?.difficulty === 2
        ? "Intermediate"
        : "Advanced";

  const CHEERS_OK = [
    "เก่งมาก! 🎉",
    "ถูกต้อง! ✨",
    "ยอดเยี่ยม! 🌟",
    "แม่นมาก! 💯",
  ];
  const CHEERS_NO = ["เกือบแล้ว! 🏋️", "ทบทวนด้วยนะ! 📖", "อย่าท้อ! 🔥"];
  const cheer = isCorrect
    ? CHEERS_OK[total % CHEERS_OK.length]
    : CHEERS_NO[total % CHEERS_NO.length];

  const handleSelect = (catId) => {
    if (revealed || !current) return;
    setSelected(catId);
    setRevealed(true);
    setTotal((t) => t + 1);
    if (catId === correctCat) setScore((s) => s + 1);
  };

  const handleNext = () => {
    if (idx + 1 >= deck.length) {
      setDone(true);
      return;
    }
    setIdx((i) => i + 1);
    setSelected(null);
    setRevealed(false);
    setAnimKey((k) => k + 1);
  };

  const restart = () => setDeck(shuffle(rows));

  // ── DONE ──────────────────────────────────────────────────
  if (done) {
    const grade =
      pct >= 90
        ? "S"
        : pct >= 75
          ? "A"
          : pct >= 60
            ? "B"
            : pct >= 40
              ? "C"
              : "D";
    const msg = {
      S: "พร้อมสอบ TOEIC! 🏆",
      A: "เก่งมาก! 🌟",
      B: "ทบทวนคำยากอีกนิด! 📚",
      C: "ลองใหม่ได้! 💪",
      D: "ทบทวนเพิ่มนะ! 📖",
    }[grade];
    return (
      <div style={S.root}>
        <style>{css}</style>
        <div style={S.resultCard}>
          <span
            style={{
              ...S.pill,
              background: `${modeColor}1a`,
              color: modeColor,
              border: `1px solid ${modeColor}44`,
            }}
          >
            {modeLabel}
          </span>
          <div style={S.rGrade}>{grade}</div>
          <div style={S.rScore}>
            {score} / {total}
          </div>
          <div style={{ fontSize: "0.9rem", color: "#7a84a8" }}>
            {pct}% ถูกต้อง
          </div>
          <div
            style={{
              fontSize: "0.9rem",
              color: "#c8d5f0",
              textAlign: "center",
              lineHeight: 1.6,
            }}
          >
            {msg}
          </div>
          <div
            style={{ display: "flex", gap: 10, width: "100%", marginTop: 8 }}
          >
            <button
              style={{
                ...S.btn,
                background: "#1e2a40",
                color: "#c8d5f0",
                flex: 1,
              }}
              onClick={() => navigate("/")}
            >
              ← หน้าหลัก
            </button>
            <button
              style={{ ...S.btn, background: modeColor, flex: 1 }}
              onClick={restart}
            >
              เล่นอีกครั้ง
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── QUIZ ─────────────────────────────────────────────────
  return (
    <div style={S.root}>
      <style>{css}</style>

      {/* ── Fixed layout wrapper ── */}
      <div style={S.layout}>
        {/* TOP PANEL */}
        <div style={S.topPanel}>
          {/* Header bar */}
          <div style={S.headerBar}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <button style={S.backBtn} onClick={() => navigate("/")}>
                ←
              </button>
              <span
                style={{
                  ...S.pill,
                  background: `${modeColor}18`,
                  color: modeColor,
                }}
              >
                {modeLabel}
              </span>
            </div>
            <div style={S.scoreBox}>
              <span style={S.scoreLabel}>คะแนน</span>
              <span style={S.scoreVal}>
                {score}
                <span style={S.scoreOf}>/{total}</span>
              </span>
              {total > 0 && <span style={S.scorePct}>{pct}%</span>}
            </div>
          </div>

          {/* Progress */}
          {deck.length > 0 && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginTop: 6,
              }}
            >
              <div style={S.progressTrack}>
                <div
                  style={{
                    ...S.progressFill,
                    width: `${(idx / deck.length) * 100}%`,
                    background: modeColor,
                  }}
                />
              </div>
              <span
                style={{
                  fontSize: "0.68rem",
                  color: "#7a84a8",
                  whiteSpace: "nowrap",
                }}
              >
                {idx + 1}/{deck.length}
              </span>
            </div>
          )}

          {/* States */}
          {!part ? (
            <p style={S.infoText}>ไม่ได้เลือก part</p>
          ) : loading ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 12,
                marginTop: 24,
              }}
            >
              <div className="spinner" />
              <span style={{ color: "#7a84a8", fontSize: "0.9rem" }}>
                กำลังโหลดคำศัพท์...
              </span>
            </div>
          ) : error ? (
            <p style={{ ...S.infoText, color: "#f76f4f" }}>Error: {error}</p>
          ) : !deck.length ? (
            <p style={S.infoText}>ไม่พบข้อมูล</p>
          ) : (
            /* Question card */
            <div key={animKey} style={S.questionCard} className="card-in">
              {/* Badges */}
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                <span
                  style={{
                    ...S.diffBadge,
                    color: diffColor,
                    background: `${diffColor}18`,
                    border: `1px solid ${diffColor}44`,
                  }}
                >
                  {diffLabel}
                </span>
                <span style={S.groupBadge}>
                  {" "}
                  กลุ่ม: {current?.meaning_th || "-"}
                </span>
              </div>

              <div style={{ fontSize: "0.74rem", color: "#7a84a8" }}>
                คำนี้เป็น part of speech อะไร?
              </div>

              {/* WORD — large */}
              <div style={S.word}>{current?.word}</div>

              {/* Choice buttons */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    activeCats.length === 2 ? "1fr 1fr" : "1fr 1fr",
                  gap: 8,
                  width: "100%",
                }}
              >
                {activeCats.map((cat) => {
                  let bg = "#1e2235",
                    border = "2px solid #2e3450",
                    color = "#c8d0e8";
                  if (revealed && selected === cat.id) {
                    bg = isCorrect ? "#0f2a1e" : "#2a0f0f";
                    border = `2px solid ${isCorrect ? "#4fcf8a" : "#f76f4f"}`;
                    color = isCorrect ? "#4fcf8a" : "#f76f4f";
                  } else if (revealed && cat.id === correctCat) {
                    bg = "#0f2a1e";
                    border = "2px solid #4fcf8a";
                    color = "#4fcf8a";
                  }
                  return (
                    <button
                      key={cat.id}
                      className="qbtn"
                      disabled={revealed}
                      onClick={() => handleSelect(cat.id)}
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 2,
                        padding: "11px 8px",
                        borderRadius: 12,
                        border,
                        background: bg,
                        color,
                        cursor: revealed ? "default" : "pointer",
                        fontFamily: "'DM Sans',sans-serif",
                        transition: "all 0.18s",
                      }}
                    >
                      <span style={{ fontSize: "1.15em" }}>{cat.emoji}</span>
                      <span style={{ fontWeight: 600, fontSize: "0.85rem" }}>
                        {cat.label}
                      </span>
                      <span style={{ fontSize: "0.68rem", opacity: 0.5 }}>
                        ({cat.short})
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* BOTTOM PANEL — feedback scrollable zone */}
        <div style={S.bottomPanel}>
          {revealed && current && (
            <div style={S.feedback(isCorrect)} className="feed-in ">
              {/* Result header */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: 6,
                }}
              >
                <span
                  style={{
                    fontFamily: "'Playfair Display',serif",
                    fontSize: "1rem",
                    fontWeight: 700,
                    color: "#e8d5a3",
                  }}
                >
                  {isCorrect ? "✅" : "❌"} {cheer}
                </span>
                <button
                  className="qbtn"
                  onClick={handleNext}
                  style={{ ...S.nextBtn, background: modeColor }}
                >
                  {idx + 1 >= deck.length ? "🏁 ดูผล" : "ถัดไป →"}
                </button>
              </div>

              {/* Info grid */}
              <div style={S.infoGrid}>
                <InfoBox
                  label="🎯 Part of Speech"
                  val={
                    ALL_CATS.find((c) => c.id === correctCat)?.label ??
                    correctCat
                  }
                />
                <InfoBox label="🇹🇭 ความหมาย" val={current?.meaning_th || "-"} />
              </div>

              {/* Dual-type hint for Part 5 */}
              {part === "part5" && current?.dual_type && (
                <div style={S.dualHint}>
                  <span style={{ fontSize: "0.75rem" }}>💡</span>
                  <span>
                    คำนี้ใน <strong>Reading mode</strong> ใช้ได้ทั้ง{" "}
                    <span style={{ color: "#4f8ef7" }}>Conjunction</span> และ{" "}
                    <span style={{ color: "#f76f4f" }}>Preposition</span>
                  </span>
                </div>
              )}

              {/* Examples */}
              {(current?.example_1 || current?.example_2) && (
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 5 }}
                >
                  <div style={S.sectionLabel}>✏️ ตัวอย่างประโยค</div>
                  {current.example_1 && (
                    <div
                      style={S.exLine}
                      dangerouslySetInnerHTML={{ __html: current.example_1 }}
                    />
                  )}
                  {current.example_2 && (
                    <div
                      style={S.exLine}
                      dangerouslySetInnerHTML={{ __html: current.example_2 }}
                    />
                  )}
                </div>
              )}
            </div>
          )}

          {/* Placeholder when not revealed */}
          {!revealed && deck.length > 0 && !loading && (
            <div style={S.hintBox}>👆 เลือกคำตอบด้านบนเพื่อดูคำอธิบาย</div>
          )}
        </div>
      </div>
    </div>
  );
}

function InfoBox({ label, val }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <div
        style={{
          fontSize: "0.62rem",
          fontWeight: 700,
          color: "#7a84a8",
          textTransform: "uppercase",
          letterSpacing: "0.08em",
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: "0.88rem",
          color: "#c8d5f0",
          fontWeight: 500,
          lineHeight: 1.4,
        }}
      >
        {val}
      </div>
    </div>
  );
}

const S = {
  root: {
    height: "100dvh",
    background: "linear-gradient(135deg,#0d1021 0%,#131729 60%,#1a1f35 100%)",
    display: "flex",
    justifyContent: "center",
    alignItems: "stretch",
    fontFamily: "'DM Sans', sans-serif",
    color: "#c8d0e8",
    overflow: "hidden",
  },

  // Main layout: 2 rows, fill full height
  layout: {
    width: "100%",
    maxWidth: 560,
    display: "flex",
    flexDirection: "column",
    padding: "12px 14px",
    gap: 10,
    overflow: "hidden",
    minHeight: 0,
  },

  // TOP: header + progress + question — flex shrink 0 so it doesn't grow
  topPanel: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
    flexShrink: 0,
  },

  headerBar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },

  backBtn: {
    background: "#1e2235",
    border: "1.5px solid #2e3450",
    color: "#7a84a8",
    borderRadius: 9,
    padding: "5px 12px",
    cursor: "pointer",
    fontFamily: "'DM Sans',sans-serif",
    fontSize: "1rem",
  },

  pill: {
    fontSize: "0.7rem",
    fontWeight: 700,
    borderRadius: 99,
    padding: "3px 11px",
    letterSpacing: "0.06em",
  },

  scoreBox: {
    display: "flex",
    alignItems: "center",
    gap: 5,
    background: "#1e2235",
    border: "1.5px solid #2e3450",
    borderRadius: 9,
    padding: "4px 11px",
  },
  scoreLabel: {
    fontSize: "0.62rem",
    color: "#7a84a8",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
  },
  scoreVal: { fontSize: "1rem", fontWeight: 700, color: "#e8d5a3" },
  scoreOf: { fontSize: "0.75rem", color: "#7a84a8" },
  scorePct: { fontSize: "0.68rem", color: "#4fcf8a", marginLeft: 2 },

  progressTrack: {
    flex: 1,
    height: 4,
    background: "#1e2235",
    borderRadius: 99,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 99,
    transition: "width 0.4s ease",
  },

  questionCard: {
    background: "#161b2e",
    border: "1.5px solid #252c44",
    borderRadius: 18,
    padding: "16px 14px",
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },

  diffBadge: {
    fontSize: "0.63rem",
    fontWeight: 700,
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    borderRadius: 99,
    padding: "2px 9px",
  },
  groupBadge: {
    fontSize: "0.63rem",
    color: "#7a84a8",
    background: "#1e2235",
    border: "1px solid #2e3450",
    borderRadius: 99,
    padding: "2px 9px",
  },

  word: {
    fontFamily: "'Playfair Display', serif",
    fontSize: "clamp(1.7rem, 6vw, 2.4rem)",
    fontWeight: 900,
    color: "#e8d5a3",
    letterSpacing: "-0.5px",
    lineHeight: 1.1,
    textAlign: "center",
  },

  // BOTTOM: scrollable feedback
  bottomPanel: {
    flex: 1,
    overflowY: "auto",
    borderRadius: 16,
    minHeight: 0,
  },

  feedback: (ok) => ({
    background: ok ? "#0a1a10" : "#1a0a0a",
    border: `1.5px solid ${ok ? "#2a4d36" : "#4d2a2a"}`,
    borderRadius: 16,
    padding: "14px 14px",
    display: "flex",
    flexDirection: "column",
    gap: 10,
  }),

  infoGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 10,
    background: "#0d1020",
    borderRadius: 10,
    padding: "10px 12px",
  },

  sectionLabel: {
    fontSize: "0.63rem",
    fontWeight: 700,
    color: "#7a84a8",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
  },

  exLine: {
    fontSize: "0.82rem",
    color: "#b0bcd8",
    lineHeight: 1.65,
    borderLeft: "3px solid #2e3a58",
    paddingLeft: 9,
  },

  nextBtn: {
    padding: "7px 18px",
    border: "none",
    borderRadius: 10,
    fontFamily: "'DM Sans',sans-serif",
    fontWeight: 700,
    fontSize: "0.88rem",
    color: "#fff",
    cursor: "pointer",
    whiteSpace: "nowrap",
  },

  btn: {
    padding: "11px 0",
    width: "100%",
    borderRadius: 12,
    border: "none",
    fontFamily: "'DM Sans',sans-serif",
    fontWeight: 700,
    fontSize: "0.95rem",
    color: "#fff",
    cursor: "pointer",
  },

  dualHint: {
    display: "flex",
    alignItems: "flex-start",
    gap: 8,
    background: "#1a1f38",
    border: "1px solid #2e3a58",
    borderRadius: 10,
    padding: "8px 12px",
    fontSize: "0.78rem",
    color: "#b0bcd8",
    lineHeight: 1.6,
  },

  hintBox: {
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "0.82rem",
    color: "#3a4060",
    textAlign: "center",
    padding: "20px",
  },

  infoText: {
    marginTop: 32,
    fontSize: "0.9rem",
    color: "#7a84a8",
    textAlign: "center",
  },

  resultCard: {
    margin: "auto",
    background: "#161b2e",
    border: "1.5px solid #252c44",
    borderRadius: 24,
    padding: "32px 24px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 10,
    width: "calc(100% - 32px)",
    maxWidth: 380,
  },
  rGrade: {
    fontFamily: "'Playfair Display',serif",
    fontSize: "5rem",
    fontWeight: 900,
    color: "#f7c94f",
    lineHeight: 1,
  },
  rScore: {
    fontFamily: "'Playfair Display',serif",
    fontSize: "1.8rem",
    fontWeight: 700,
    color: "#e8d5a3",
  },
};

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@400;500;700&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body, #root { height: 100%; overflow: hidden; }
  strong { color: #f7c94f; }

  @keyframes cardIn { from { opacity:0; transform:translateY(14px) } to { opacity:1; transform:translateY(0) } }
  @keyframes feedIn { from { opacity:0; transform:translateY(10px) } to { opacity:1; transform:translateY(0) } }
  .card-in { animation: cardIn 0.3s ease both; }
  .feed-in { animation: feedIn 0.25s ease both; }

  .qbtn:hover:not(:disabled) { transform:translateY(-2px); filter:brightness(1.1); }
  .qbtn:active:not(:disabled) { transform:scale(.97); }

  .spinner {
    width:32px; height:32px;
    border:3px solid #252c44;
    border-top-color:#4f8ef7;
    border-radius:50%;
    animation:spin 0.8s linear infinite;
  }
  @keyframes spin { to { transform:rotate(360deg) } }

  /* Scrollbar styling for bottom panel */
  .bottom-scroll::-webkit-scrollbar { width: 4px; }
  .bottom-scroll::-webkit-scrollbar-track { background: transparent; }
  .bottom-scroll::-webkit-scrollbar-thumb { background: #2e3450; border-radius: 99px; }

  /* Tablet / Desktop: wider layout */
  @media (min-width: 640px) {
    .quiz-layout { max-width: 680px !important; flex-direction: row !important; align-items: stretch; }
    .quiz-top-panel { width: 52%; flex-shrink: 0; }
    .quiz-bottom-panel { flex: 1; overflow-y: auto; }
  }

  /* Mobile landscape: reduce font */
  @media (max-height: 600px) {
    .word-big { font-size: 1.5rem !important; }
  }
`;

export default QuizPage;
