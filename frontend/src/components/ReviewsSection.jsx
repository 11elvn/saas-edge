// ============================================================
// 📁 components/ReviewsSection.jsx
// ✦ قسم "آراء زبائننا" (Reviews) — theme-driven، يُستعمل فـ 2 بلايص:
//   Home (PublicStore) · Product (ProductDetails)
// ✦ settings: { title, layout: "grid"|"carousel"|"list"|"wall"|"spotlight", sort,
//               showRatingSummary, showDates, showWilaya,
//               reviews:[{id,enabled,rating,name,wilaya,text,date,verified}] }
// ============================================================
import { useRef } from "react";

function Stars({ rating = 5, size = 13, color = "#f59e0b" }) {
  return (
    <span style={{ display: "inline-flex", gap: 1, direction: "ltr" }}>
      {[1, 2, 3, 4, 5].map(n => {
        const fillPct = Math.max(0, Math.min(1, rating - (n - 1))) * 100;
        return (
          <span key={n} style={{ position: "relative", width: size, height: size, display: "inline-block" }}>
            <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" style={{ position: "absolute", inset: 0 }}>
              <polygon points="12 2.5 15 9 22 10 17 15 18.2 21.5 12 18.3 5.8 21.5 7 15 2 10 9 9 12 2.5" />
            </svg>
            <span style={{ position: "absolute", inset: 0, width: `${fillPct}%`, overflow: "hidden" }}>
              <svg width={size} height={size} viewBox="0 0 24 24" fill={color} stroke={color} strokeWidth="1.5">
                <polygon points="12 2.5 15 9 22 10 17 15 18.2 21.5 12 18.3 5.8 21.5 7 15 2 10 9 9 12 2.5" />
              </svg>
            </span>
          </span>
        );
      })}
    </span>
  );
}

function ReviewCard({ r, surfaceColor, textColor, mutedTextColor, borderColor, showDates, showWilaya, big }) {
  return (
    <div style={{
      background: surfaceColor, border: `1px solid ${borderColor}`, borderRadius: 16,
      padding: big ? "24px 26px" : "18px 20px", display: "flex", flexDirection: "column", gap: 10,
      textAlign: big ? "center" : "right", alignItems: big ? "center" : "stretch",
    }}>
      <Stars rating={r.rating} size={big ? 17 : 14} />
      <p style={{
        margin: 0, color: textColor, fontWeight: big ? 800 : 600,
        fontSize: big ? "clamp(1.05rem,2vw,1.3rem)" : 13.5, lineHeight: 1.7,
      }}>
        {r.text}
      </p>
      <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, color: mutedTextColor, marginTop: big ? 6 : 2 }}>
        {r.verified && (
          <span style={{
            background: "rgba(34,197,94,.14)", color: "#22c55e", fontWeight: 700,
            fontSize: 11, padding: "3px 9px", borderRadius: 999, display: "inline-flex", alignItems: "center", gap: 4,
          }}>
            ✓ طلب مؤكد
          </span>
        )}
        <span style={{ fontWeight: 700, color: textColor }}>{r.name}</span>
        {showWilaya && r.wilaya && <span>— {r.wilaya}</span>}
        {showDates && r.date && <span style={{ marginInlineStart: "auto" }}>{r.date}</span>}
      </div>
    </div>
  );
}

export default function ReviewsSection({ settings, primary, bgColor, surfaceColor, textColor, mutedTextColor, borderColor }) {
  const carouselRef = useRef(null);
  const allReviews = settings?.reviews || [];
  let reviews = allReviews.filter(r => r.enabled !== false && r.text?.trim());

  const sort = settings?.sort || "manual";
  if (sort === "newest") reviews = [...reviews].sort((a, b) => (b.date || "").localeCompare(a.date || ""));
  if (sort === "highest") reviews = [...reviews].sort((a, b) => (b.rating || 0) - (a.rating || 0));

  if (!reviews.length) return null;

  const layout = settings?.layout || "wall";
  const title = settings?.title || "آراء زبائننا";
  const showDates = settings?.showDates !== false;
  const showWilaya = settings?.showWilaya !== false;
  const showRatingSummary = settings?.showRatingSummary !== false;

  const avg = (reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length).toFixed(1);

  return (
    <section style={{ maxWidth: 980, margin: "0 auto", padding: "0 24px" }}>
      {/* Header row */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, gap: 12, flexWrap: "wrap" }}>
        <h2 style={{ fontSize: "clamp(1.3rem,3vw,1.8rem)", fontWeight: 900, color: textColor, margin: 0, textAlign: "right", direction: "rtl" }}>
          {title}
        </h2>
        {showRatingSummary && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, direction: "rtl" }}>
            <span style={{ fontSize: 13, color: mutedTextColor, fontWeight: 600 }}>{reviews.length}٠</span>
            <Stars rating={Number(avg)} size={16} />
            <span style={{ fontSize: 15, fontWeight: 800, color: textColor }}>{avg}</span>
          </div>
        )}
      </div>

      {/* ── Spotlight: مراجعة كبيرة فالوسط + الباقي تحتها كـ list ── */}
      {layout === "spotlight" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <ReviewCard r={reviews[0]} surfaceColor={surfaceColor} textColor={textColor} mutedTextColor={mutedTextColor} borderColor={borderColor} showDates={showDates} showWilaya={showWilaya} big />
          {reviews.slice(1).map(r => (
            <ReviewCard key={r.id} r={r} surfaceColor={surfaceColor} textColor={textColor} mutedTextColor={mutedTextColor} borderColor={borderColor} showDates={showDates} showWilaya={showWilaya} />
          ))}
        </div>
      )}

      {/* ── List: عمود واحد، كل مراجعة عرض كامل ── */}
      {layout === "list" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {reviews.map(r => (
            <ReviewCard key={r.id} r={r} surfaceColor={surfaceColor} textColor={textColor} mutedTextColor={mutedTextColor} borderColor={borderColor} showDates={showDates} showWilaya={showWilaya} />
          ))}
        </div>
      )}

      {/* ── Grid: شبكة أعمدة ثابتة (2 موبايل / 3 ديسكتوب) ── */}
      {layout === "grid" && (
        <div className="rvs-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
          {reviews.map(r => (
            <ReviewCard key={r.id} r={r} surfaceColor={surfaceColor} textColor={textColor} mutedTextColor={mutedTextColor} borderColor={borderColor} showDates={showDates} showWilaya={showWilaya} />
          ))}
        </div>
      )}

      {/* ── Wall: شبكة عمودين، الكروت متدرجة الطول (masonry-style) ── */}
      {layout === "wall" && (
        <div className="rvs-wall" style={{ columnCount: 2, columnGap: 14 }}>
          {reviews.map(r => (
            <div key={r.id} style={{ breakInside: "avoid", marginBottom: 14 }}>
              <ReviewCard r={r} surfaceColor={surfaceColor} textColor={textColor} mutedTextColor={mutedTextColor} borderColor={borderColor} showDates={showDates} showWilaya={showWilaya} />
            </div>
          ))}
        </div>
      )}

      {/* ── Carousel: سطر واحد، سكرول أفقي + أزرار تنقل ── */}
      {layout === "carousel" && (
        <div className="rvs-carousel-wrap" style={{ position: "relative" }}>
          <div ref={carouselRef} className="rvs-carousel-strip" style={{ display: "flex", gap: 14, overflowX: "auto", scrollSnapType: "x proximity", paddingBottom: 4 }}>
            {reviews.map(r => (
              <div key={r.id} style={{ flex: "0 0 260px", scrollSnapAlign: "start" }}>
                <ReviewCard r={r} surfaceColor={surfaceColor} textColor={textColor} mutedTextColor={mutedTextColor} borderColor={borderColor} showDates={showDates} showWilaya={showWilaya} />
              </div>
            ))}
          </div>
          {reviews.length > 2 && (
            <>
              <button
                aria-label="السابق" className="rvs-carousel-nav rvs-carousel-nav--prev" style={{ background: primary }}
                onClick={() => carouselRef.current?.scrollBy({ left: -280, behavior: "smooth" })}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5"><polyline points="15 6 9 12 15 18" /></svg>
              </button>
              <button
                aria-label="التالي" className="rvs-carousel-nav rvs-carousel-nav--next" style={{ background: primary }}
                onClick={() => carouselRef.current?.scrollBy({ left: 280, behavior: "smooth" })}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5"><polyline points="9 6 15 12 9 18" /></svg>
              </button>
            </>
          )}
        </div>
      )}

      <style>{`
        .rvs-carousel-strip::-webkit-scrollbar { display:none; }
        .rvs-carousel-strip { -ms-overflow-style:none; scrollbar-width:none; }
        .rvs-carousel-nav {
          position: absolute; top: 40%; transform: translateY(-50%);
          width: 36px; height: 36px; border-radius: 50%; border: none; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 4px 14px rgba(0,0,0,.18);
          opacity: 0; transition: opacity .2s;
        }
        .rvs-carousel-wrap:hover .rvs-carousel-nav { opacity: 1; }
        .rvs-carousel-nav--prev { right: -6px; }
        .rvs-carousel-nav--next { left: -6px; }
        @media (max-width: 768px) {
          .rvs-carousel-nav { opacity: 1; }
          .rvs-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 480px) {
          .rvs-grid { grid-template-columns: 1fr !important; }
          .rvs-wall { column-count: 1 !important; }
        }
      `}</style>
    </section>
  );
}