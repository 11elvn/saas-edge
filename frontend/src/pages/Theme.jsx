// ============================================================
// 📁 pages/Theme.jsx — Live store preview (تصميم جديد)
// Layout: desktop preview (left) + mobile frame (right) + footer bar
// ============================================================
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

const API   = () => import.meta.env.VITE_API_URL;
const token = () => localStorage.getItem("token");

// ── CSS ────────────────────────────────────────────────────────
const CSS = `
@keyframes th-spin    { to { transform: rotate(360deg); } }
@keyframes th-marquee { from { transform:translateX(0); } to { transform:translateX(-50%); } }

/* ══ PAGE WRAPPER ══ */
.th-page {
  height: calc(100vh - 60px);
  margin: -28px -32px; /* يلغي حشوة .app-layout__content ليستعمل الصفحة كاملة */
  background: #fff;
  overflow: hidden;
  display: flex; flex-direction: column;
  padding: 16px 28px 16px;
  font-family: 'Inter', sans-serif;
  color: #1f1747;
}
.th-wrap { flex: 1; min-height: 0; width: 100%; max-width: 1180px; margin: 0 auto; display: flex; flex-direction: column; }

/* ══ HEADER ══ */
.th-head {
  display: flex; align-items: flex-start; justify-content: space-between;
  gap: 12px; flex-wrap: wrap; margin-bottom: 12px; flex-shrink: 0;
}
.th-title { font-size: 1.3rem; font-weight: 700; color: #1f1747; margin: 0; }
.th-sub   { font-size: .82rem; color: #8b7fae; margin: 3px 0 0; }
.th-actions { display: flex; gap: 8px; align-items: center; }
.th-btn-edit {
  display: inline-flex; align-items: center; gap: 7px;
  padding: 9px 18px; border-radius: 10px; border: 1px solid #5b3fd6;
  background: #6c5ce7; color: #fff;
  font-size: .83rem; font-weight: 600;
  cursor: pointer; font-family: inherit; transition: background .15s;
}
.th-btn-edit:hover { background: #5b4bd6; }
.th-btn-view {
  display: inline-flex; align-items: center; gap: 7px;
  padding: 9px 16px; border-radius: 10px;
  border: 1px solid #e0d9f7; background: #fff;
  color: #4b35c4; font-size: .83rem; font-weight: 600;
  cursor: pointer; font-family: inherit; transition: all .15s;
  text-decoration: none;
}
.th-btn-view:hover { background: #f5f3ff; border-color: #cabdf7; }

/* ══ STAGE ══ */
.th-stage {
  position: relative; background: #f4f1fe; border-radius: 16px;
  flex: 1; min-height: 0; overflow: hidden;
  display: flex; justify-content: center; align-items: flex-start;
  gap: 28px; padding: 58px 32px 18px;
}
.th-float {
  position: absolute; top: 14px; left: 50%; transform: translateX(-50%);
  display: flex; background: #fff; border: 1px solid #e0d9f7;
  border-radius: 99px; padding: 3px; gap: 2px; z-index: 30;
}
.th-float button {
  display: inline-flex; align-items: center; gap: 6px;
  border: none; background: transparent; color: #8b7fae;
  font-size: .76rem; font-weight: 600; font-family: inherit;
  padding: 7px 15px; border-radius: 99px; cursor: pointer; transition: all .15s;
}
.th-float button:hover { color: #5b3fd6; }
.th-float button.is-on { background: #6c5ce7; color: #fff; }

/* ══ DESKTOP BROWSER ══ */
.th-desktop {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 0 0 1px #e0d9f7;
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

/* ══ STAGE DEVICES ══ */
.th-stage .th-desktop { flex: 1; max-width: 700px; height: 100%; max-height: none; }
.th-stage.is-desktop .th-desktop { max-width: 980px; }
.th-stage .th-mobile-wrap { position: relative; flex-shrink: 0; display: block; }
.th-stage .th-iphone { transform-origin: top left; position: absolute; top: 0; left: 0; }

/* ══ LIVE PREVIEW (iframe) ══ */
.th-stage .th-desktop-store { position: relative; overflow: hidden; direction: ltr; }
.th-stage .th-mobile-screen { overflow: hidden; direction: ltr; }

/* ══ INFO CARDS ══ */
.th-info { display: grid; grid-template-columns: 1fr 1.5fr; gap: 12px; margin-top: 12px; flex-shrink: 0; }
.th-card-box {
  border: 1px solid #ebe7f7; border-radius: 14px; background: #fff;
  padding: 10px 16px; display: flex; align-items: center;
}
.th-theme-ico {
  width: 40px; height: 40px; border-radius: 12px; background: #ece7fb; color: #5b3fd6;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0; margin-right: 14px;
}
.th-theme-name-row { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.th-theme-name { font-size: 1rem; font-weight: 700; color: #1f1747; }
.th-badge-live {
  font-size: .68rem; font-weight: 600; padding: 3px 10px; border-radius: 99px;
  background: #e8f7ee; color: #157a3e;
}
.th-saved { font-size: .76rem; color: #8b7fae; margin-top: 3px; }
.th-stats { justify-content: space-around; gap: 6px; }
.th-stat { text-align: center; min-width: 0; }
.th-stat-v { font-size: .95rem; font-weight: 700; color: #1f1747; line-height: 1.25; }
.th-stat-l { font-size: .68rem; color: #8b7fae; margin-top: 3px; }
.th-stat-sep { width: 1px; height: 30px; background: #ebe7f7; flex-shrink: 0; }
.th-dots { display: flex; gap: 4px; justify-content: center; }
.th-dots i { width: 20px; height: 20px; border-radius: 50%; display: block; border: 1px solid rgba(0,0,0,.08); }
@media (max-width: 980px) { .th-info { grid-template-columns: 1fr; } }
@media (max-width: 768px) { .th-page { margin: -20px -16px; padding: 12px 16px; } }

/* Loading */
.th-loading {
  display: flex; flex-direction: column; align-items: center;
  justify-content: center; height: 60vh; gap: 14px;
  color: #9ca3af; font-size: .85rem;
}
.th-spinner {
  width: 28px; height: 28px;
  border: 3px solid #ece7fb; border-top-color: #6c5ce7;
  border-radius: 50%; animation: th-spin .7s linear infinite;
}
`;

// ── Live Store Preview (iframe) ────────────────────────────────
// يعرض المتجر الحقيقي (/store/:slug) بتصميمه الحالي كما عدّله المستخدم.
// الـ iframe يُعرض بعرض "افتراضي" (حاسوب 1280 / هاتف 390) ثم يُصغَّر ليناسب الإطار.
function ScaledFrame({ src, baseWidth, title }) {
  const boxRef = useRef(null);
  const [size, setSize] = useState({ w: 0, h: 0 });

  useEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    const measure = () => setSize({ w: el.clientWidth, h: el.clientHeight });
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const scale = size.w ? size.w / baseWidth : 1;

  return (
    <div ref={boxRef} style={{ position: "absolute", inset: 0, overflow: "hidden", background: "#fff" }}>
      {src ? (
        size.w > 0 && (
          <iframe
            key={src}
            src={src}
            title={title}
            style={{
              width: baseWidth,
              height: size.h / scale,
              border: 0,
              display: "block",
              transform: `scale(${scale})`,
              transformOrigin: "top left",
              background: "#fff",
            }}
          />
        )
      ) : (
        <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#8b7fae", fontSize: 13 }}>
          لا يوجد متجر بعد
        </div>
      )}
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
  const stageRef = useRef(null);
  const [scale, setScale] = useState(0.8);

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

  // يضبط حجم الهاتف حسب ارتفاع المعاينة ليبان كل شيء في شاشة واحدة
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const fit = () => {
      const h = el.clientHeight - 58 - 18;
      setScale(Math.max(0.5, Math.min(1, h / 564)));
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, [loading, view]);

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

  // ألوان وخطوط الثيم الحقيقية كما حفظها المستخدم في ThemeEdit (themeConfig.styles)
  const st = store?.themeConfig?.styles || {};
  const ff = st.fontFamily || store?.fontFamily || "Cairo";
  const PALETTE = [
    ["Primary",    st.primaryColor    || store?.primaryColor],
    ["Secondary",  st.secondaryColor  || store?.secondaryColor],
    ["Background", st.backgroundColor],
    ["Surface",    st.surfaceColor],
    ["Text",       st.textColor],
    ["Muted text", st.mutedTextColor],
    ["Border",     st.borderColor],
  ].filter(([, c]) => !!c);
  const showDesktop = view !== "mobile";
  const showMobile  = view !== "desktop";

  const VIEWS = [
    { id: "desktop", label: "Desktop", icon: <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg> },
    { id: "mobile",  label: "Mobile",  icon: <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="6" y="2" width="12" height="20" rx="3"/><path d="M11 18h2"/></svg> },
    { id: "both",    label: "Both",    icon: <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="2" y="4" width="14" height="11" rx="2"/><rect x="14" y="9" width="8" height="12" rx="2"/></svg> },
  ];

  return (
    <div className="th-page" dir="ltr">
      <style>{CSS}</style>
      <div className="th-wrap">

        {/* ══ HEADER ══ */}
        <div className="th-head">
          <div>
            <h1 className="th-title">Themes</h1>
            <p className="th-sub">Control how your store looks on every screen.</p>
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
              Edit theme
            </button>
          </div>
        </div>

        {/* ══ PREVIEW STAGE ══ */}
        <div ref={stageRef} className={`th-stage is-${view}`}>
          <div className="th-float" role="tablist" aria-label="Preview mode">
            {VIEWS.map(v => (
              <button key={v.id} role="tab" aria-selected={view === v.id}
                className={view === v.id ? "is-on" : ""} onClick={() => setView(v.id)}>
                {v.icon}{v.label}
              </button>
            ))}
          </div>

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
              <ScaledFrame src={storeUrl} baseWidth={1280} title="Desktop preview" />
            </div>
          </div>
          </>
          )}

          {showMobile && (
          <>
          {/* ── iPhone 15 Pro Frame ── */}
          <div className="th-mobile-wrap" style={{ width: 260 * scale, height: 564 * scale }}>
            <div className="th-iphone" style={{ transform: `scale(${scale})` }}>
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
                  <ScaledFrame src={storeUrl} baseWidth={390} title="Mobile preview" />
                </div>
              </div>
            </div>
          </div>
          </>
          )}
        </div>

        {/* ══ INFO ══ */}
        <div className="th-info">
          <div className="th-card-box">
            <div className="th-theme-ico">
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/></svg>
            </div>
            <div style={{ minWidth: 0 }}>
              <div className="th-theme-name-row">
                <span className="th-theme-name">{store?.name ? `${store.name}'s theme` : "My Theme"}</span>
                <span className="th-badge-live">Live</span>
              </div>
              {savedDate && <div className="th-saved">Last saved: {savedDate}</div>}
            </div>
          </div>

          <div className="th-card-box th-stats">
            <div className="th-stat">
              <div className="th-dots">
                {PALETTE.map(([n, c]) => <i key={n} style={{ background: c }} title={`${n} ${c}`} />)}
              </div>
              <div className="th-stat-l">Colors</div>
            </div>
            <div className="th-stat-sep" />
            <div className="th-stat">
              <div className="th-stat-v" style={{ fontFamily: `'${ff}', sans-serif` }}>Aa</div>
              <div className="th-stat-l">{ff}</div>
            </div>
            <div className="th-stat-sep" />
            <div className="th-stat">
              <div className="th-stat-v">{products.length}</div>
              <div className="th-stat-l">Products</div>
            </div>
            <div className="th-stat-sep" />
            <div className="th-stat">
              <div className="th-stat-v">{categories.length}</div>
              <div className="th-stat-l">Categories</div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Theme;