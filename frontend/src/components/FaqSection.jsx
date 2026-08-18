// ============================================================
// 📁 components/FaqSection.jsx
// ✦ قسم "أسئلة شائعة" (FAQ) — theme-driven، يُستعمل فـ 3 بلايص:
//   Home (PublicStore) · Product (ProductDetails) · Checkout
// ✦ settings: { title, openFirstItem, style: "divided"|"cards", questions:[{id,enabled,question,answer}] }
// ============================================================
import { useState } from "react";

function Chevron({ open }) {
  return (
    <svg
      width="18" height="18" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      style={{ flexShrink: 0, transition: "transform .2s ease", transform: open ? "rotate(180deg)" : "none" }}
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

export default function FaqSection({ settings, primary, bgColor, surfaceColor, textColor, mutedTextColor, borderColor }) {
  const allQuestions = settings?.questions || [];
  const questions = allQuestions.filter(q => q.enabled !== false && (q.question || q.answer));

  // ✦ accordion state — إذا "Open first item" مفعّل، أول سؤال مفتوح من البداية
  const [openId, setOpenId] = useState(
    settings?.openFirstItem && questions[0] ? questions[0].id : null
  );

  if (!questions.length) return null;

  const style = settings?.style === "cards" ? "cards" : "divided";
  const title = settings?.title || "أسئلة شائعة";
  const isCards = style === "cards";

  return (
    <section style={{ maxWidth: 780, margin: "0 auto", padding: "52px 24px 60px" }}>
      <h2
        style={{
          fontSize: "clamp(1.3rem,3vw,1.8rem)", fontWeight: 900, color: textColor,
          margin: "0 0 22px", textAlign: "right", direction: "rtl",
        }}
      >
        {title}
      </h2>

      <div
        style={
          isCards
            ? { display: "flex", flexDirection: "column", gap: 12 }
            : { background: surfaceColor, border: `1px solid ${borderColor}`, borderRadius: 16, padding: "2px 18px" }
        }
      >
        {questions.map((q, i) => {
          const open = openId === q.id;
          const isLast = i === questions.length - 1;
          return (
            <div
              key={q.id}
              style={
                isCards
                  ? { background: surfaceColor, border: `1px solid ${borderColor}`, borderRadius: 14, overflow: "hidden" }
                  : { borderBottom: isLast ? "none" : `1px solid ${borderColor}` }
              }
            >
              <button
                type="button"
                onClick={() => setOpenId(open ? null : q.id)}
                style={{
                  width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
                  gap: 10, background: "none", border: "none", cursor: "pointer", textAlign: "right",
                  padding: isCards ? "16px 18px" : "18px 4px",
                  fontFamily: "inherit", direction: "rtl",
                }}
              >
                <span style={{ color: open ? primary : textColor, fontWeight: 700, fontSize: 14.5 }}>
                  {q.question}
                </span>
                <span style={{ color: open ? primary : mutedTextColor, display: "flex" }}>
                  <Chevron open={open} />
                </span>
              </button>
              {open && (
                <div style={{ padding: isCards ? "0 18px 16px" : "0 4px 18px", direction: "rtl" }}>
                  <p style={{ margin: 0, color: mutedTextColor, fontSize: 13.5, lineHeight: 1.85 }}>
                    {q.answer}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}