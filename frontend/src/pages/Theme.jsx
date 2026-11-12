// ============================================================
// 📁 pages/Theme.jsx — Live store preview (تصميم جديد)
// Layout: desktop preview (left) + mobile frame (right) + footer bar
// ============================================================
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API   = () => import.meta.env.VITE_API_URL;
const token = () => localStorage.getItem("token");

// ── CSS ────────────────────────────────────────────────────────
const CSS = `
@keyframes th-spin    { to { transform: rotate(360deg); } }
@keyframes th-marquee { from { transform:translateX(0); } to { transform:translateX(-50%); } }

/* ══ PAGE WRAPPER ══ */
.th-page {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 60px);
  background: #fff;
  padding: 0;
  overflow: hidden;
  font-family: 'Inter', sans-serif;
}
.th-card { flex: 1; display: flex; flex-direction: column; overflow: hidden; min-height: 0; }

/* ══ TOP TOOLBAR ══ */
.th-top {
  display: flex; align-items: center; justify-content: space-between;
  gap: 12px; flex-wrap: wrap; flex-shrink: 0;
  padding: 14px 24px; background: #fff;
  border-bottom: 1px solid #ece7fb;
}
.th-top-left { display: flex; align-items: center; gap: 10px; min-width: 0; }
.th-top-name { font-size: .95rem; font-weight: 700; color: #2a1f5c; white-space: nowrap; }
.th-top-saved { font-size: .74rem; color: #8b7fae; white-space: nowrap; }
.th-badge-current {
  font-size: .68rem; font-weight: 600; padding: 3px 10px; border-radius: 99px;
  background: #ece7fb; color: #5b3fd6; border: 1px solid #e7e1fa;
  display: inline-flex; align-items: center; gap: 5px; white-space: nowrap;
}
.th-badge-current::before {
  content: ""; width: 6px; height: 6px; border-radius: 50%; background: #7c6df2; display: block;
}

/* Segmented toggle */
.th-seg { display: flex; background: #f1eefd; border-radius: 99px; padding: 3px; gap: 2px; }
.th-seg button {
  display: inline-flex; align-items: center; gap: 6px;
  border: none; background: transparent; color: #8b7fae;
  font-size: .78rem; font-weight: 600; font-family: inherit;
  padding: 7px 16px; border-radius: 99px; cursor: pointer; transition: all .15s;
}
.th-seg button:hover { color: #5b3fd6; }
.th-seg button.is-on { background: #7c6df2; color: #fff; }

/* ══ PREVIEW STAGE ══ */
.th-preview-area {
  flex: 1; display: flex; flex-direction: row; gap: 24px;
  overflow: hidden; background: #faf8ff;
  padding: 24px 32px; min-height: 0;
  justify-content: center;
}
.th-preview-area.is-mobile .th-mobile-wrap { margin: 0 auto; }
.th-preview-area.is-desktop .th-desktop { max-width: 1100px; margin: 0 auto; }

/* ══ DESKTOP BROWSER ══ */
.th-desktop {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 0 0 1px #e7e1fa, 0 4px 28px rgba(91,63,214,.10);
  overflow: hidden;
  min-height: 0;
  max-height: 100%;
}

/* Chrome bar */
.th-chrome {
  background: #ebebeb;
  padding: 10px 14px;
  display: flex;
  align-items: center;
  gap: 7px;
  border-bottom: 1px solid #ddd;
  flex-shrink: 0;
}
.th-dot { width: 12px; height: 12px; border-radius: 50%; flex-shrink: 0; }
.th-url-bar {
  flex: 1; margin: 0 10px;
  background: #fff; border: 1px solid #d0d0d0;
  border-radius: 6px; padding: 5px 12px;
  font-size: 11px; color: #555;
  display: flex; align-items: center; gap: 6px;
  overflow: hidden; white-space: nowrap; font-family: monospace;
}

/* Desktop scroll content */
.th-desktop-store {
  flex: 1;
  overflow-y: scroll;
  overflow-x: hidden;
  direction: rtl;
}
.th-desktop-store::-webkit-scrollbar { width: 6px; }
.th-desktop-store::-webkit-scrollbar-track { background: #f1f1f1; }
.th-desktop-store::-webkit-scrollbar-thumb { background: #c1c1c1; border-radius: 99px; }
.th-desktop-store::-webkit-scrollbar-thumb:hover { background: #a1a1a1; }

/* ══ MOBILE FRAME — iPhone 15 Pro ══ */
.th-mobile-wrap {
  width: 260px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}
.th-iphone {
  position: relative;
  width: 260px;
  height: 564px;
  flex-shrink: 0;
}
/* الإطار الخارجي للهاتف */
.th-iphone__frame {
  position: absolute;
  inset: 0;
  border-radius: 44px;
  background: linear-gradient(160deg, #2a2a2a 0%, #1a1a1a 40%, #111 60%, #1e1e1e 100%);
  box-shadow:
    inset 0 0 0 1px rgba(255,255,255,.12),
    0 0 0 1px rgba(0,0,0,.8),
    0 24px 60px rgba(0,0,0,.55),
    0 6px 16px rgba(0,0,0,.35);
  pointer-events: none;
  z-index: 5;
}
/* الشاشة الداخلية */
.th-iphone__screen-wrap {
  position: absolute;
  top: 10px; left: 10px; right: 10px; bottom: 10px;
  border-radius: 36px;
  overflow: hidden;
  background: #000;
  z-index: 10;
}
/* Dynamic Island */
.th-iphone__island {
  position: absolute;
  top: 10px;
  left: 50%;
  transform: translateX(-50%);
  width: 86px; height: 24px;
  background: #000;
  border-radius: 20px;
  z-index: 25;
  pointer-events: none;
}
/* Status bar */
.th-iphone__status {
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 44px;
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  padding: 0 16px;
  z-index: 22;
  pointer-events: none;
  background: rgba(255,255,255,0.95);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}
.th-iphone__time {
  font-size: 12px; font-weight: 600;
  color: #000; font-family: -apple-system, sans-serif;
  letter-spacing: -.2px;
  justify-self: start;
  padding-top: 8px;
}
.th-iphone__island-spacer {
  width: 86px; height: 24px;
}
.th-iphone__signals {
  display: flex; align-items: center; gap: 4px;
  justify-self: end;
  padding-top: 8px;
}
/* الشاشة القابلة للتمرير */
.th-mobile-screen {
  position: absolute;
  top: 44px;
  left: 0; right: 0; bottom: 0;
  overflow-y: scroll;
  overflow-x: hidden;
  background: #fff;
  direction: rtl;
}
.th-mobile-screen::-webkit-scrollbar { display: none; }
/* أزرار جانبية */
.th-iphone__btn-right {
  position: absolute;
  right: -3px; top: 110px;
  width: 3px; height: 58px;
  background: linear-gradient(to right, #1a1a1a, #2e2e2e, #1a1a1a);
  border-radius: 0 2px 2px 0;
  z-index: 21;
  pointer-events: none;
}
.th-iphone__btn-left1 {
  position: absolute;
  left: -3px; top: 85px;
  width: 3px; height: 34px;
  background: linear-gradient(to left, #1a1a1a, #2e2e2e, #1a1a1a);
  border-radius: 2px 0 0 2px;
  z-index: 21;
  pointer-events: none;
}
.th-iphone__btn-left2 {
  position: absolute;
  left: -3px; top: 138px;
  width: 3px; height: 54px;
  background: linear-gradient(to left, #1a1a1a, #2e2e2e, #1a1a1a);
  border-radius: 2px 0 0 2px;
  z-index: 21;
  pointer-events: none;
}
.th-iphone__btn-left3 {
  position: absolute;
  left: -3px; top: 204px;
  width: 3px; height: 54px;
  background: linear-gradient(to left, #1a1a1a, #2e2e2e, #1a1a1a);
  border-radius: 2px 0 0 2px;
  z-index: 21;
  pointer-events: none;
}

/* ══ STORE CONTENT SHARED ══ */

/* Announcement bar */
.th-announce { overflow: hidden; }
.th-announce-track {
  display: flex; gap: 40px; width: max-content;
  animation: th-marquee 18s linear infinite;
}

/* Navbar */
.th-navbar {
  display: flex; align-items: center;
  justify-content: space-between;
  background: #fff;
}

/* Hero */
.th-hero {
  position: relative; overflow: hidden;
  display: flex; align-items: flex-end; justify-content: center;
}
.th-hero-img { width: 100%; height: 100%; object-fit: cover; display: block; }
.th-hero-overlay {
  position: absolute; inset: 0;
  background: linear-gradient(to bottom, transparent 40%, rgba(0,0,0,.6) 100%);
}
.th-hero-cta {
  position: absolute; bottom: 16px;
  display: flex; justify-content: center; width: 100%;
}

/* Trust badges */
.th-trust { display: grid; }
.th-trust-item {
  display: flex; flex-direction: column;
  align-items: center; gap: 4px; text-align: center;
}

/* Product card */
.th-prod-card {
  border-radius: 10px; overflow: hidden;
  border: 1px solid #eee; background: #fff;
}
.th-prod-img  { width: 100%; object-fit: cover; display: block; }
.th-prod-ph   { width: 100%; display: flex; align-items: center; justify-content: center; background: #f8f9fa; }

/* Category card */
.th-cat-card {
  border-radius: 10px; overflow: hidden;
  border: 1px solid #eee; background: #fff;
  position: relative;
}

/* ══ ACTION BUTTONS ══ */
.th-actions { display: flex; gap: 8px; align-items: center; }
.th-btn-edit {
  display: inline-flex; align-items: center; gap: 7px;
  padding: 9px 20px; border-radius: 12px; border: 1px solid #5b3fd6;
  background: #7c6df2; color: #fff;
  font-size: .83rem; font-weight: 700;
  cursor: pointer; font-family: inherit; transition: background .15s;
}
.th-btn-edit:hover { background: #6b5be6; }
.th-btn-view {
  display: inline-flex; align-items: center; gap: 7px;
  padding: 9px 18px; border-radius: 12px;
  border: 1px solid #e7e1fa; background: #fff;
  color: #5b3fd6; font-size: .83rem; font-weight: 600;
  cursor: pointer; font-family: inherit; transition: all .15s;
  text-decoration: none;
}
.th-btn-view:hover { background: #f5f3ff; border-color: #cabdf7; }

/* ══ THEMES STRIP ══ */
.th-themes {
  flex-shrink: 0; background: #fff; border-top: 1px solid #ece7fb;
  padding: 12px 24px 16px;
}
.th-themes-title { font-size: .72rem; color: #8b7fae; margin: 0 0 8px; font-weight: 600; }
.th-themes-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px; max-width: 720px; }
.th-theme-card {
  background: #fff; border: 1px solid #e7e1fa; border-radius: 12px;
  padding: 7px; display: flex; flex-direction: column; gap: 6px;
}
.th-theme-card.is-active { border: 1.5px solid #7c6df2; }
.th-theme-card.is-soon { opacity: .6; }
.th-theme-thumb { height: 34px; border-radius: 8px; background: #f5f3ff; }
.th-theme-card.is-active .th-theme-thumb { background: #ece7fb; }
.th-theme-name {
  display: flex; align-items: center; justify-content: space-between;
  font-size: .74rem; font-weight: 600; color: #2a1f5c; padding: 0 2px;
}
.th-theme-card.is-soon .th-theme-name { color: #8b7fae; }
.th-theme-soon { font-size: .62rem; font-weight: 600; color: #8b7fae; }

/* Loading */
.th-loading {
  display: flex; flex-direction: column; align-items: center;
  justify-content: center; height: 60vh; gap: 14px;
  color: #8b7fae; font-size: .85rem;
}
.th-spinner {
  width: 28px; height: 28px;
  border: 3px solid #ece7fb; border-top-color: #7c6df2;
  border-radius: 50%; animation: th-spin .7s linear infinite;
}
`;

// ── Desktop Store Preview ──────────────────────────────────────
function DesktopStore({ store, products, categories }) {
  const pc   = store?.primaryColor   || "#2563eb";
  const sc   = store?.secondaryColor || "#0f172a";
  const ff   = store?.fontFamily     || "Inter";
  const name = store?.name           || "المتجر";

  return (
    <div style={{ fontFamily: `'${ff}', sans-serif`, direction: "rtl", background: "#fff" }}>

      {/* Announcement bar */}
      <div className="th-announce" style={{ background: sc, padding: "7px 0" }}>
        <div className="th-announce-track">
          {[...Array(6)].map((_, i) => (
            <span key={i} style={{ fontSize: 11, color: "rgba(255,255,255,.6)", whiteSpace: "nowrap", fontWeight: 600 }}>
              مرحبًا بك في متجرنا &nbsp;·&nbsp; توصيل 58 ولاية 🇩🇿 &nbsp;·&nbsp; الدفع عند الاستلام 💰
            </span>
          ))}
        </div>
      </div>

      {/* Navbar */}
      <div className="th-navbar" style={{ padding: "12px 24px", borderBottom: "1px solid #f0f0f0" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {store?.logo
            ? <img src={store.logo} style={{ width: 30, height: 30, borderRadius: 7, objectFit: "cover" }} alt="" />
            : <div style={{ width: 30, height: 30, borderRadius: 7, background: pc, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: 14 }}>{name.charAt(0)}</div>
          }
          <span style={{ fontWeight: 700, fontSize: 13, color: "#111" }}>{name}</span>
        </div>
        <div style={{ display: "flex", gap: 20 }}>
          {["الرئيسية", "التصنيفات", "اتصل بنا"].map(l => (
            <span key={l} style={{ fontSize: 12, fontWeight: 600, color: "#444", cursor: "default" }}>{l}</span>
          ))}
        </div>
        <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
          <svg width="16" height="16" fill="none" stroke="#555" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          <div style={{ position: "relative" }}>
            <svg width="16" height="16" fill="none" stroke="#555" strokeWidth="2" viewBox="0 0 24 24"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/></svg>
            <span style={{ position: "absolute", top: -6, right: -6, background: pc, color: "#fff", borderRadius: "50%", width: 14, height: 14, fontSize: 8, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800 }}>3</span>
          </div>
        </div>
      </div>

      {/* Hero / Banner */}
      <div className="th-hero" style={{ height: 220 }}>
        {store?.banner
          ? <img src={store.banner} className="th-hero-img" alt="banner" />
          : <div style={{ width: "100%", height: "100%", background: `linear-gradient(135deg, ${pc}33 0%, ${sc}88 100%)`, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontSize: 48 }}>🖼️</span>
            </div>
        }
        <div className="th-hero-overlay" />
        <div className="th-hero-cta" style={{ gap: 10 }}>
          <button style={{ background: pc, color: "#fff", border: "none", borderRadius: 99, padding: "9px 24px", fontSize: 12, fontWeight: 700, cursor: "default", fontFamily: "inherit" }}>
            🛍️ تسوق الآن
          </button>
        </div>
      </div>

      {/* Trust badges */}
      <div className="th-trust" style={{ gridTemplateColumns: "repeat(3,1fr)", borderTop: "1px solid #eee", borderBottom: "1px solid #eee" }}>
        {[
          { icon: "🚚", title: "توصيل سريع", sub: "58 ولاية" },
          { icon: "🛡️", title: "جودة مضمونة", sub: "فحص شامل" },
          { icon: "🎧", title: "دعم 24/7", sub: "خدمة العملاء" },
        ].map((b, i) => (
          <div key={i} className="th-trust-item" style={{ padding: "14px 10px", borderRight: i < 2 ? "1px solid #eee" : "none" }}>
            <span style={{ fontSize: 18 }}>{b.icon}</span>
            <p style={{ fontWeight: 700, color: "#111", fontSize: 11, margin: 0 }}>{b.title}</p>
            <p style={{ color: "#888", fontSize: 9, margin: 0 }}>{b.sub}</p>
          </div>
        ))}
      </div>

      {/* Categories */}
      {categories.length > 0 && (
        <div style={{ padding: "20px 24px 10px" }}>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 14 }}>
            <div>
              <h3 style={{ fontWeight: 900, color: "#111", margin: "0 0 3px", fontSize: 14 }}>Collection</h3>
              <p style={{ color: "#888", margin: 0, fontSize: 10 }}>اعثر على كل ما تريد</p>
            </div>
            <span style={{ fontSize: 11, color: pc, fontWeight: 700, cursor: "default" }}>عرض الكل →</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10 }}>
            {categories.slice(0, 4).map(cat => (
              <div key={cat._id} className="th-cat-card">
                {cat.image
                  ? <img src={cat.image} style={{ width: "100%", height: 72, objectFit: "cover", display: "block" }} alt={cat.name} />
                  : <div style={{ width: "100%", height: 72, background: pc + "18", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>📁</div>
                }
                <div style={{ padding: "7px 9px" }}>
                  <p style={{ fontWeight: 700, fontSize: 11, color: "#111", margin: 0 }}>{cat.name}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Products */}
      <div style={{ padding: "16px 24px 28px" }}>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 14 }}>
          <div>
            <h3 style={{ fontWeight: 900, color: "#111", margin: "0 0 3px", fontSize: 14 }}>المنتجات</h3>
            <p style={{ color: "#888", margin: 0, fontSize: 10 }}>أحدث المنتجات المتاحة</p>
          </div>
        </div>
        {products.length > 0 ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10 }}>
            {products.slice(0, 8).map(p => (
              <div key={p._id} className="th-prod-card">
                {(p.images?.[0] || p.image)
                  ? <img src={p.images?.[0] || p.image} className="th-prod-img" style={{ height: 80 }} alt={p.name} />
                  : <div className="th-prod-ph" style={{ height: 80, fontSize: 24 }}>📦</div>
                }
                <div style={{ padding: "8px 9px 10px" }}>
                  <p style={{ fontWeight: 700, fontSize: 10, color: "#111", margin: "0 0 4px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.name}</p>
                  <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 7 }}>
                    <span style={{ fontWeight: 800, fontSize: 11, color: pc }}>{p.currentPrice?.toLocaleString()} DA</span>
                    {p.oldPrice && <span style={{ textDecoration: "line-through", color: "#aaa", fontSize: 9 }}>{p.oldPrice?.toLocaleString()}</span>}
                  </div>
                  <button style={{ width: "100%", background: sc, color: "#fff", border: "none", borderRadius: 7, padding: "5px 0", fontSize: 9, fontWeight: 700, cursor: "default", fontFamily: "inherit" }}>اطلب الآن</button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: "center", padding: "32px 0", color: "#ccc", fontSize: 12 }}>📦 لا توجد منتجات بعد</div>
        )}
      </div>

    </div>
  );
}

// ── Mobile Store Preview ───────────────────────────────────────
function MobileStore({ store, products, categories }) {
  const pc   = store?.primaryColor   || "#2563eb";
  const sc   = store?.secondaryColor || "#0f172a";
  const ff   = store?.fontFamily     || "Inter";
  const name = store?.name           || "المتجر";

  return (
    <div style={{ fontFamily: `'${ff}', sans-serif`, direction: "rtl", background: "#fff" }}>

      {/* Announcement bar */}
      <div style={{ background: sc, padding: "5px 0", overflow: "hidden" }}>
        <div className="th-announce-track">
          {[...Array(4)].map((_, i) => (
            <span key={i} style={{ fontSize: 8, color: "rgba(255,255,255,.6)", whiteSpace: "nowrap", fontWeight: 600, marginRight: 28 }}>
              مرحبًا بك في متجرنا · الدفع عند الاستلام 💰
            </span>
          ))}
        </div>
      </div>

      {/* Navbar */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 10px", borderBottom: "1px solid #f0f0f0" }}>
        <svg width="13" height="13" fill="none" stroke="#555" strokeWidth="2" viewBox="0 0 24 24"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
          {store?.logo
            ? <img src={store.logo} style={{ width: 20, height: 20, borderRadius: 5, objectFit: "cover" }} alt="" />
            : <div style={{ width: 20, height: 20, borderRadius: 5, background: pc, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: 10 }}>{name.charAt(0)}</div>
          }
        </div>
        <div style={{ position: "relative" }}>
          <svg width="13" height="13" fill="none" stroke="#555" strokeWidth="2" viewBox="0 0 24 24"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/></svg>
          <span style={{ position: "absolute", top: -5, right: -5, background: pc, color: "#fff", borderRadius: "50%", width: 11, height: 11, fontSize: 7, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800 }}>3</span>
        </div>
      </div>

      {/* Hero */}
      <div style={{ position: "relative", height: 120, overflow: "hidden" }}>
        {store?.banner
          ? <img src={store.banner} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} alt="" />
          : <div style={{ width: "100%", height: "100%", background: `linear-gradient(135deg, ${pc}33 0%, ${sc}88 100%)`, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontSize: 32 }}>🖼️</span>
            </div>
        }
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, transparent 40%, rgba(0,0,0,.6) 100%)" }} />
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "10px 12px" }}>
          <p style={{ color: "#fff", fontSize: 9, fontWeight: 800, margin: "0 0 4px" }}>مرحبًا بك في متجرنا</p>
          <p style={{ color: "rgba(255,255,255,.7)", fontSize: 8, margin: "0 0 7px" }}>اكتشف أفضل المنتجات بأسعار رائعة مع خدمة التوصيل لجميع ولايات الجزائر</p>
          <button style={{ background: pc, color: "#fff", border: "none", borderRadius: 99, padding: "4px 12px", fontSize: 8, fontWeight: 700, cursor: "default", fontFamily: "inherit" }}>
            اسوق الآن
          </button>
        </div>
      </div>

      {/* Categories */}
      {categories.length > 0 && (
        <div style={{ padding: "10px 10px 6px" }}>
          <p style={{ fontSize: 9, fontWeight: 900, color: "#111", margin: "0 0 7px" }}>Collection</p>
          <div style={{ display: "flex", gap: 6, overflowX: "auto" }}>
            {categories.slice(0, 3).map(cat => (
              <div key={cat._id} style={{ flexShrink: 0, width: 70, borderRadius: 8, overflow: "hidden", border: "1px solid #eee" }}>
                {cat.image
                  ? <img src={cat.image} style={{ width: "100%", height: 52, objectFit: "cover", display: "block" }} alt={cat.name} />
                  : <div style={{ width: "100%", height: 52, background: pc + "18", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>📁</div>
                }
                <p style={{ fontSize: 8, fontWeight: 700, color: "#111", margin: 0, padding: "4px 5px", textAlign: "center" }}>{cat.name}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Products */}
      <div style={{ padding: "8px 10px 16px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 7 }}>
          <p style={{ fontSize: 9, fontWeight: 900, color: "#111", margin: 0 }}>المنتجات</p>
          <span style={{ fontSize: 8, color: pc, fontWeight: 700 }}>عرض الكل</span>
        </div>
        {products.length > 0 ? (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
            {products.slice(0, 4).map(p => (
              <div key={p._id} style={{ borderRadius: 8, overflow: "hidden", border: "1px solid #eee", background: "#fff" }}>
                {(p.images?.[0] || p.image)
                  ? <img src={p.images?.[0] || p.image} style={{ width: "100%", height: 60, objectFit: "cover", display: "block" }} alt={p.name} />
                  : <div style={{ width: "100%", height: 60, background: "#f8f9fa", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>📦</div>
                }
                <div style={{ padding: "5px 7px 7px" }}>
                  <p style={{ fontSize: 8, fontWeight: 700, color: "#111", margin: "0 0 2px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.name}</p>
                  {/* Stars */}
                  <div style={{ display: "flex", gap: 1, marginBottom: 2 }}>
                    {"★★★★★".split("").map((s, i) => <span key={i} style={{ color: "#f59e0b", fontSize: 8 }}>{s}</span>)}
                  </div>
                  <p style={{ fontSize: 8, fontWeight: 800, color: pc, margin: "0 0 5px" }}>{p.currentPrice?.toLocaleString()} DA</p>
                  <button style={{ width: "100%", background: sc, color: "#fff", border: "none", borderRadius: 5, padding: "4px 0", fontSize: 7, fontWeight: 700, cursor: "default", fontFamily: "inherit" }}>اطلب الآن</button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: "center", padding: "16px 0", color: "#ccc", fontSize: 9 }}>📦 لا توجد منتجات</div>
        )}
      </div>

    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────
function Theme() {
  const navigate = useNavigate();

  const [store,      setStore]      = useState(null);
  const [products,   setProducts]   = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [view,       setView]       = useState("both"); // both | desktop | mobile

  useEffect(() => {
    const t = token();
    Promise.all([
      fetch(`${API()}/api/stores/my-store`,          { headers: { Authorization: `Bearer ${t}` } }).then(r => r.json()),
      fetch(`${API()}/api/products/my-products`,     { headers: { Authorization: `Bearer ${t}` } }).then(r => r.json()),
      fetch(`${API()}/api/categories/my-categories`, { headers: { Authorization: `Bearer ${t}` } }).then(r => r.json()),
    ])
      .then(([storeData, prodsData, catsData]) => {
        if (storeData.hasStore)       setStore(storeData.store);
        if (Array.isArray(prodsData)) setProducts(prodsData);
        if (Array.isArray(catsData))  setCategories(catsData);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="th-loading">
      <style>{CSS}</style>
      <div className="th-spinner" />
      <p>جاري التحميل...</p>
    </div>
  );

  const storeUrl = store?.slug ? `/store/${store.slug}` : null;

  const savedDate = store?.updatedAt
    ? new Date(store.updatedAt).toLocaleDateString("fr-DZ", {
        day: "numeric", month: "short",
        hour: "2-digit", minute: "2-digit",
      })
    : null;

  const showDesktop = view !== "mobile";
  const showMobile  = view !== "desktop";

  const VIEWS = [
    { id: "desktop", label: "Desktop", icon: <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg> },
    { id: "mobile",  label: "Mobile",  icon: <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="6" y="2" width="12" height="20" rx="3"/><path d="M11 18h2"/></svg> },
    { id: "both",    label: "Both",    icon: <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="2" y="4" width="14" height="11" rx="2"/><rect x="14" y="9" width="8" height="12" rx="2" fill="#fff"/></svg> },
  ];

  return (
    <div className="th-page" dir="ltr">
      <style>{CSS}</style>

      <div className="th-card">

        {/* ══ TOP TOOLBAR ══ */}
        <div className="th-top">
          <div className="th-top-left">
            <span className="th-top-name">
              {store?.name ? `${store.name}'s theme` : "My Theme"}
            </span>
            <span className="th-badge-current">Current theme</span>
            {savedDate && <span className="th-top-saved">Last saved: {savedDate}</span>}
          </div>

          <div className="th-seg" role="tablist" aria-label="Preview mode">
            {VIEWS.map(v => (
              <button
                key={v.id}
                role="tab"
                aria-selected={view === v.id}
                className={view === v.id ? "is-on" : ""}
                onClick={() => setView(v.id)}
              >
                {v.icon}{v.label}
              </button>
            ))}
          </div>

          <div className="th-actions">
            {storeUrl && (
              <a href={storeUrl} target="_blank" rel="noreferrer" className="th-btn-view">
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                </svg>
                View your store
              </a>
            )}
            <button className="th-btn-edit" onClick={() => navigate("/theme/edit")}>
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
              Edit Theme
            </button>
          </div>
        </div>

        {/* ══ PREVIEW STAGE ══ */}
        <div className={`th-preview-area is-${view}`}>

          {showDesktop && (
          <>
          {/* ── Desktop Browser ── */}
          <div className="th-desktop">
            {/* Chrome bar */}
            <div className="th-chrome">
              <div className="th-dot" style={{ background: "#ff5f57" }} />
              <div className="th-dot" style={{ background: "#febc2e" }} />
              <div className="th-dot" style={{ background: "#28c840" }} />
              <div className="th-url-bar">
                <svg width="9" height="9" fill="none" stroke="#9ca3af" strokeWidth="2" viewBox="0 0 24 24">
                  <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
                {typeof window !== "undefined" ? window.location.hostname : "moo.tassyir.io"}/store/{store?.slug || "my-store"}
              </div>
            </div>
            {/* Store content */}
            <div className="th-desktop-store">
              <DesktopStore store={store} products={products} categories={categories} />
            </div>
          </div>
          </>
          )}

          {showMobile && (
          <>
          {/* ── iPhone 15 Pro Frame ── */}
          <div className="th-mobile-wrap">
            <div className="th-iphone">
              {/* الإطار الخارجي */}
              <div className="th-iphone__frame" />
              {/* أزرار جانبية */}
              <div className="th-iphone__btn-right" />
              <div className="th-iphone__btn-left1" />
              <div className="th-iphone__btn-left2" />
              <div className="th-iphone__btn-left3" />
              {/* الشاشة */}
              <div className="th-iphone__screen-wrap">
                {/* Dynamic Island */}
                <div className="th-iphone__island" />
                {/* Status Bar */}
                <div className="th-iphone__status">
                  <span className="th-iphone__time">9:41</span>
                  <div className="th-iphone__island-spacer" />
                  <div className="th-iphone__signals">
                    {/* Signal bars */}
                    <svg width="10" height="8" viewBox="0 0 17 12" fill="#000">
                      <rect x="0" y="7" width="3" height="5" rx=".5"/>
                      <rect x="4.5" y="4.5" width="3" height="7.5" rx=".5"/>
                      <rect x="9" y="2" width="3" height="10" rx=".5"/>
                      <rect x="13.5" y="0" width="3" height="12" rx=".5" opacity=".3"/>
                    </svg>
                    {/* WiFi */}
                    <svg width="10" height="8" viewBox="0 0 16 12" fill="none" stroke="#000" strokeWidth="1.8" strokeLinecap="round">
                      <path d="M8 10h.01"/>
                      <path d="M5.5 7.5a3.5 3.5 0 015 0"/>
                      <path d="M3 5a7 7 0 0110 0"/>
                      <path d="M1 2.5a11 11 0 0114 0"/>
                    </svg>
                    {/* Battery */}
                    <svg width="15" height="8" viewBox="0 0 25 12" fill="#000">
                      <rect x="0" y="1" width="21" height="10" rx="2.5" stroke="#000" strokeWidth="1" fill="none"/>
                      <rect x="22" y="4" width="2.5" height="4" rx="1" fill="#000" opacity=".4"/>
                      <rect x="1.5" y="2.5" width="17" height="7" rx="1.5"/>
                    </svg>
                  </div>
                </div>
                {/* Store content */}
                <div className="th-mobile-screen">
                  <MobileStore store={store} products={products} categories={categories} />
                </div>
              </div>
            </div>
          </div>
          </>
          )}

        </div>

        {/* ══ THEMES STRIP ══ */}
        <div className="th-themes">
          <p className="th-themes-title">Your themes</p>
          <div className="th-themes-grid">
            <div className="th-theme-card is-active">
              <div className="th-theme-thumb" />
              <div className="th-theme-name">
                <span>{store?.name || "My Theme"}</span>
                <svg width="13" height="13" fill="none" stroke="#7c6df2" strokeWidth="2.2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="m8 12 3 3 5-6"/></svg>
              </div>
            </div>
            {["Classic", "Minimal"].map(n => (
              <div key={n} className="th-theme-card is-soon">
                <div className="th-theme-thumb" />
                <div className="th-theme-name"><span>{n}</span><span className="th-theme-soon">Soon</span></div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

export default Theme;