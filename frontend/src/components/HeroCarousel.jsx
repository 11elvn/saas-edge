// ✦ HeroCarousel — Hero Banner بوضع Carousel (عدة شرائح)
// يستعمل fade بدل translate باش يخدم صح فـ RTL وLTR بدون مشاكل اتجاه.
import { useEffect, useRef, useState, useCallback } from "react";

export const HERO_CAROUSEL_CSS = `
.hc-root { position: relative; width: 100%; }
.hc-stage { position: relative; overflow: hidden; display: block; width: 100%; }
.hc-slide {
  position: absolute; inset: 0; display: flex; align-items: center;
  opacity: 0; visibility: hidden;
  transition: opacity .6s ease, visibility 0s linear .6s;
}
.hc-slide--active { opacity: 1; visibility: visible; transition: opacity .6s ease, visibility 0s; z-index: 1; }
@media (prefers-reduced-motion: reduce) {
  .hc-slide, .hc-slide--active { transition: none; }
}
.hc-ctrl {
  border: none; cursor: pointer; display: flex; align-items: center; justify-content: center;
  font-family: inherit; padding: 0; flex-shrink: 0;
  transition: background .2s, transform .2s, opacity .2s;
}
.hc-ctrl:hover { transform: scale(1.06); }
.hc-ctrl:focus-visible { outline: 2px solid currentColor; outline-offset: 2px; }
.hc-arrow { width: 38px; height: 38px; border-radius: 50%; }
.hc-arrow--on {
  position: absolute; top: 50%; transform: translateY(-50%); z-index: 3;
  background: rgba(255,255,255,.88); color: #111827; box-shadow: 0 4px 14px rgba(0,0,0,.18);
}
.hc-arrow--on:hover { transform: translateY(-50%) scale(1.06); }
.hc-arrow--on.hc-prev { right: 12px; }
.hc-arrow--on.hc-next { left: 12px; }
.hc-arrow--under { background: rgba(15,23,42,.08); color: inherit; }
.hc-arrow--under:hover { background: rgba(15,23,42,.16); }
.hc-dots { display: flex; align-items: center; gap: 8px; }
.hc-dot {
  height: 8px; width: 8px; border-radius: 99px; border: none; padding: 0; cursor: pointer;
  transition: width .25s, background .25s;
}
.hc-dot--active { width: 26px; }
.hc-dots--on {
  position: absolute; left: 0; right: 0; bottom: 14px; z-index: 3; justify-content: center;
}
.hc-pause--on {
  position: absolute; top: 12px; left: 12px; z-index: 3; width: 34px; height: 34px; border-radius: 50%;
  background: rgba(255,255,255,.88); color: #111827; box-shadow: 0 4px 14px rgba(0,0,0,.18);
}
.hc-bar {
  display: flex; align-items: center; justify-content: center; gap: 14px;
  padding: 14px 16px; min-height: 52px;
}
.hc-pause--under { width: 32px; height: 32px; border-radius: 50%; background: rgba(15,23,42,.08); color: inherit; }
.hc-pause--under:hover { background: rgba(15,23,42,.16); }
@media (max-width: 768px) {
  .hc-arrow { width: 32px; height: 32px; }
  .hc-arrow--on.hc-prev { right: 6px; }
  .hc-arrow--on.hc-next { left: 6px; }
}
`;

const ChevronIcon = ({ dir }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {dir === "right" ? <polyline points="9 18 15 12 9 6" /> : <polyline points="15 18 9 12 15 6" />}
  </svg>
);

const PauseIcon = ({ playing }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    {playing
      ? (<><rect x="6" y="4" width="4" height="16" rx="1" /><rect x="14" y="4" width="4" height="16" rx="1" /></>)
      : <polygon points="6 4 20 12 6 20 6 4" />}
  </svg>
);

export default function HeroCarousel({
  settings,          // hero settings (carouselMode, slides, autoplay, speed, ...)
  heroHeight,        // CSS height للـ stage
  fallbackImage,     // صورة احتياطية للشريحة الأولى (banner تاع المتجر)
  fallbackTitle,     // اسم المتجر لما العنوان فارغ
  primary,
  secondary,
  textColor,
  rs,
  btnStyle,
  styles,
  onCtaClick,        // (link) => void
}) {
  const hs = settings || {};
  const slides = Array.isArray(hs.slides) ? hs.slides : [];
  const count = slides.length;
  const autoplay = hs.autoplay ?? true;
  const showArrows = hs.showArrows ?? true;
  const showPause = hs.showPause ?? false;
  const speed = Math.min(15, Math.max(1, Number(hs.speed ?? 4)));
  const navPos = hs.navPosition === "on" ? "on" : "under";
  const overlayAlpha = (hs.overlayOpacity ?? 50) / 100;
  const align = hs.textAlign || "center";
  // ⚠️ الصفحة direction:rtl → نستعمل قيم بصرية صريحة (نفس منطق الـ hero العادي)
  const justify = align === "right" ? "flex-start" : align === "left" ? "flex-end" : "center";

  const [index, setIndex] = useState(0);
  const [userPaused, setUserPaused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const touchX = useRef(null);

  const reduceMotion = typeof window !== "undefined" && window.matchMedia
    ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
    : false;

  // لو نقصو الشرائح (حذف) نبقاو داخل الحدود بدون effect
  const current = count ? Math.min(index, count - 1) : 0;

  const go = useCallback((i) => {
    if (!count) return;
    setIndex(((i % count) + count) % count);
  }, [count]);
  const next = useCallback(() => go(current + 1), [go, current]);
  const prev = useCallback(() => go(current - 1), [go, current]);

  const running = autoplay && count > 1 && !userPaused && !hovered && !reduceMotion;
  useEffect(() => {
    if (!running) return undefined;
    const t = setInterval(() => setIndex(i => (i + 1) % count), speed * 1000);
    return () => clearInterval(t);
  }, [running, speed, count]);

  if (!count) return null;

  const multi = count > 1;
  const dotActive = navPos === "on" ? "#ffffff" : (primary || "#111827");
  const dotIdle = navPos === "on" ? "rgba(255,255,255,.5)" : "rgba(15,23,42,.22)";

  const onTouchStart = (e) => { touchX.current = e.touches?.[0]?.clientX ?? null; };
  const onTouchEnd = (e) => {
    if (touchX.current == null || !multi) return;
    const dx = (e.changedTouches?.[0]?.clientX ?? touchX.current) - touchX.current;
    touchX.current = null;
    if (Math.abs(dx) < 40) return;
    if (dx < 0) next(); else prev();
  };

  const arrows = showArrows && multi;
  const pauseBtn = showPause && multi && autoplay;

  const dots = (
    <div className={`hc-dots ${navPos === "on" ? "hc-dots--on" : ""}`} role="tablist" aria-label="Slides">
      {slides.map((sl, i) => (
        <button
          key={sl.id || i}
          type="button"
          role="tab"
          aria-selected={i === current}
          aria-label={`Slide ${i + 1}`}
          className={`hc-dot ${i === current ? "hc-dot--active" : ""}`}
          style={{ background: i === current ? dotActive : dotIdle }}
          onClick={() => go(i)}
        />
      ))}
    </div>
  );

  const pauseControl = (cls) => (
    <button
      type="button"
      className={`hc-ctrl ${cls}`}
      aria-label={userPaused ? "Play" : "Pause"}
      onClick={() => setUserPaused(v => !v)}
    >
      <PauseIcon playing={!userPaused} />
    </button>
  );

  return (
    <div
      className="hc-root"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      aria-roledescription="carousel"
    >
      <div className="hc-stage" style={{ height: heroHeight }}>
        {slides.map((sl, i) => {
          const img = sl.image || (i === 0 ? fallbackImage : "");
          const ctaBg = sl.ctaColor || primary;
          return (
            <div
              key={sl.id || i}
              className={`hc-slide ${i === current ? "hc-slide--active" : ""}`}
              aria-hidden={i !== current}
              aria-roledescription="slide"
            >
              {img ? (
                <img src={img} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                <div style={{ position: "absolute", inset: 0, background: `linear-gradient(135deg, ${secondary} 0%, ${secondary}cc 100%)` }} />
              )}
              <div style={{ position: "absolute", inset: 0, background: `rgba(0,0,0,${overlayAlpha})` }} />

              <div style={{ position: "relative", zIndex: 1, width: "100%", display: "flex", justifyContent: justify, padding: "0 24px" }}>
                <div style={{
                  display: "flex", flexDirection: "column",
                  alignItems: align === "center" ? "center" : align === "right" ? "flex-end" : "flex-start",
                  textAlign: align, maxWidth: 640,
                }}>
                  {(sl.title || (i === 0 && fallbackTitle)) && (
                    <p style={{ fontSize: "clamp(1.8rem,5vw,3.5rem)", fontWeight: 900, color: "#fff", margin: 0, letterSpacing: -1, lineHeight: 1.15, textShadow: "0 2px 16px rgba(0,0,0,.4)" }}>
                      {sl.title || fallbackTitle}
                    </p>
                  )}
                  {sl.subtitle && (
                    <p style={{ color: "rgba(255,255,255,.92)", fontSize: "clamp(1rem,2.4vw,1.4rem)", fontWeight: 500, margin: "14px 0 0", letterSpacing: .2, lineHeight: 1.5, textShadow: "0 2px 12px rgba(0,0,0,.4)" }}>
                      {sl.subtitle}
                    </p>
                  )}
                  {sl.ctaText && (
                    <button
                      onClick={() => onCtaClick && onCtaClick(sl.ctaLink || "#products")}
                      tabIndex={i === current ? 0 : -1}
                      className="ps-btn-order"
                      style={{
                        marginTop: 32,
                        background: ctaBg, color: "#fff",
                        border: "none", borderRadius: rs ? rs(50) : 50, padding: "14px 34px",
                        fontSize: 15, fontWeight: 700, cursor: "pointer",
                        fontFamily: "inherit", letterSpacing: .5,
                        boxShadow: `0 4px 24px ${ctaBg}55`,
                        ...(btnStyle ? btnStyle(styles, ctaBg, { onImage: true, padX: 34 }) : {}),
                      }}
                    >
                      {sl.ctaText}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {navPos === "on" && (
          <>
            {arrows && (
              <>
                <button type="button" className="hc-ctrl hc-arrow hc-arrow--on hc-prev" aria-label="Previous slide" onClick={prev}><ChevronIcon dir="right" /></button>
                <button type="button" className="hc-ctrl hc-arrow hc-arrow--on hc-next" aria-label="Next slide" onClick={next}><ChevronIcon dir="left" /></button>
              </>
            )}
            {dots}
            {pauseBtn && pauseControl("hc-pause--on")}
          </>
        )}
      </div>

      {navPos === "under" && (
        <div className="hc-bar" style={{ color: textColor || "#111827" }}>
          {arrows && (
            <button type="button" className="hc-ctrl hc-arrow hc-arrow--under hc-prev" aria-label="Previous slide" onClick={prev}><ChevronIcon dir="right" /></button>
          )}
          {dots}
          {arrows && (
            <button type="button" className="hc-ctrl hc-arrow hc-arrow--under hc-next" aria-label="Next slide" onClick={next}><ChevronIcon dir="left" /></button>
          )}
          {pauseBtn && pauseControl("hc-pause--under")}
        </div>
      )}
    </div>
  );
}