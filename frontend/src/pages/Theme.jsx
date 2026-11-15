// ============================================================
// 📁 pages/Theme.jsx — Live store preview (Overview style)
// Layout: desktop preview + mobile frame + info cards
// ============================================================
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

const API   = () => import.meta.env.VITE_API_URL;
const token = () => localStorage.getItem("token");

// ── CSS ────────────────────────────────────────────────────────
const CSS = `
@keyframes th-spin { to { transform: rotate(360deg); } }

/* ══ PAGE WRAPPER (same look as .ov-page) ══ */
.th-page {
  display: flex; flex-direction: column; gap: 20px;
  position: relative; border-radius: 22px; padding: 24px;
  height: calc(100vh - var(--topbar-height, 60px) - 56px);
  min-height: 560px;
  border: 1px solid rgba(255,255,255,.9);
  background:
    radial-gradient(380px 260px at 55% 48%, rgba(221,214,254,.45), transparent 70%),
    #faf7ff;
  box-shadow: 0 10px 40px rgba(137,75,244,.10), inset 0 1px 0 rgba(255,255,255,.9);
  font-family: 'Inter', sans-serif;
  color: #111827;
  overflow: hidden;
}

/* ══ HEADER ══ */
.th-head {
  display: flex; align-items: center; justify-content: space-between;
  gap: 12px; flex-wrap: wrap; flex-shrink: 0;
}
.th-title { font-size: 1.5rem; font-weight: 700; color: #111827; line-height: 1.2; margin: 0; }
.th-sub   { font-size: .82rem; color: #6b7280; margin: 4px 0 0; }
.th-actions { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; }

.th-tabs {
  display: inline-flex; align-items: center; gap: 4px; padding: 4px;
  background: #fff;
  border: 1px solid rgba(255,255,255,.9);
  border-radius: 999px;
  box-shadow: 0 2px 10px rgba(137,75,244,.10);
}
.th-tab {
  display: inline-flex; align-items: center; justify-content: center;
  width: 36px; height: 36px; padding: 0; border: none; border-radius: 50%;
  background: transparent; color: #6b7280; cursor: pointer;
  font-family: inherit; transition: background .15s, color .15s;
}
.th-tab svg { width: 17px; height: 17px; }
.th-tab:hover { background: #f4f1fe; color: #894bf4; }
.th-tab:focus-visible { outline: 2px solid #894bf4; outline-offset: 1px; }
.th-tab.is-on, .th-tab.is-on:hover { background: #894bf4; color: #fff; }

.th-btn-view {
  display: inline-flex; align-items: center; justify-content: center;
  width: 42px; height: 42px; border-radius: 50%;
  border: 1px solid rgba(255,255,255,.9);
  background: rgba(255,255,255,.75); color: #6b7280;
  cursor: pointer; transition: background .15s, color .15s;
  text-decoration: none;
}
.th-btn-view svg { width: 18px; height: 18px; }
.th-btn-view:hover { background: #fff; color: #894bf4; }
.th-btn-view:focus-visible, .th-btn-edit:focus-visible { outline: 2px solid #894bf4; outline-offset: 2px; }

.th-btn-edit {
  display: inline-flex; align-items: center; gap: 8px;
  height: 42px; padding: 0 20px; border-radius: 999px; border: none;
  background: #894bf4; color: #fff;
  font-size: .85rem; font-weight: 600;
  cursor: pointer; font-family: inherit; transition: background .15s, box-shadow .15s;
  box-shadow: 0 4px 14px rgba(137,75,244,.25);
}
.th-btn-edit:hover { background: #7c3aed; box-shadow: 0 6px 18px rgba(137,75,244,.32); }

/* ══ GLASS CARD ══ */
.th-card {
  background: rgba(255,255,255,.62);
  border: 1px solid rgba(255,255,255,.85);
  border-radius: 16px;
  -webkit-backdrop-filter: blur(14px); backdrop-filter: blur(14px);
  box-shadow: 0 4px 20px rgba(137,75,244,.07);
  min-width: 0;
}

/* ══ STAGE ══ */
.th-stage {
  flex: 1; min-height: 0; padding: 16px;
  display: flex; justify-content: center; align-items: stretch; gap: 20px;
  overflow: hidden;
}

/* ══ BROWSER FRAMES ══ */
.th-desktop {
  flex: 1; min-width: 0; max-width: 700px;
  display: flex; flex-direction: column;
  background: #fff; border-radius: 12px;
  box-shadow: 0 0 0 1px rgba(137,75,244,.12), 0 6px 24px rgba(137,75,244,.08);
  overflow: hidden; min-height: 0;
}
.th-stage.is-desktop .th-desktop { max-width: 980px; }
.th-m-frame {
  width: 300px; flex-shrink: 0;
  display: flex; flex-direction: column;
  background: #fff; border-radius: 12px; overflow: hidden;
  box-shadow: 0 0 0 1px rgba(137,75,244,.12), 0 6px 24px rgba(137,75,244,.08);
}
.th-stage.is-mobile .th-m-frame { width: 420px; max-width: 100%; }
.th-m-wrap { position: relative; flex: 1; overflow: hidden; }

.th-chrome {
  background: #f3f0fb;
  padding: 10px 14px;
  display: flex; align-items: center; gap: 7px;
  border-bottom: 1px solid #ebe7f7;
  flex-shrink: 0;
}
.th-dot { width: 11px; height: 11px; border-radius: 50%; flex-shrink: 0; }
.th-url-bar {
  flex: 1; min-width: 0; margin: 0 10px;
  background: #fff; border: 1px solid #e5e0f5;
  border-radius: 7px; padding: 5px 12px;
  font-size: 11px; color: #6b7280;
  display: flex; align-items: center; gap: 6px;
  overflow: hidden; white-space: nowrap; text-overflow: ellipsis;
  font-family: monospace;
}
.th-desktop-store { flex: 1; position: relative; overflow: hidden; direction: ltr; min-height: 0; }

/* ══ INFO CARDS ══ */
.th-info { display: grid; grid-template-columns: 1fr 1.5fr; gap: 16px; flex-shrink: 0; }
.th-info .th-card { padding: 14px 18px; display: flex; align-items: center; }
.th-theme-ico {
  width: 42px; height: 42px; border-radius: 12px;
  background: #ede9ff; color: #894bf4;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0; margin-right: 14px;
}
.th-theme-name-row { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.th-theme-name { font-size: 1rem; font-weight: 700; color: #111827; }
.th-badge-live {
  font-size: .68rem; font-weight: 600; padding: 3px 10px; border-radius: 99px;
  background: #ecfdf5; color: #059669;
}
.th-saved { font-size: .76rem; color: #9ca3af; margin-top: 3px; }
.th-stats { justify-content: space-around; gap: 6px; }
.th-stat { text-align: center; min-width: 0; }
.th-stat-v { font-size: 1.05rem; font-weight: 700; color: #111827; line-height: 1.25; }
.th-stat-l { font-size: .72rem; color: #9ca3af; margin-top: 3px; font-weight: 500; }
.th-stat-sep { width: 1px; height: 30px; background: rgba(137,75,244,.12); flex-shrink: 0; }
.th-dots { display: flex; gap: 4px; justify-content: center; flex-wrap: wrap; }
.th-dots i {
  width: 20px; height: 20px; border-radius: 50%; display: block;
  border: 2px solid #fff; box-shadow: 0 0 0 1px rgba(0,0,0,.08);
}

@media (max-width: 980px) {
  .th-info { grid-template-columns: 1fr; }
  .th-page { height: auto; min-height: calc(100vh - var(--topbar-height, 60px) - 56px); }
  .th-stage { height: 560px; flex: none; }
}
@media (max-width: 768px) {
  .th-page { min-height: calc(100vh - var(--topbar-height, 60px) - 40px); }
}
@media (max-width: 520px) {
  .th-page { padding: 14px; border-radius: 16px; }
  .th-stage { padding: 10px; gap: 10px; }
  .th-stats { flex-wrap: wrap; row-gap: 12px; }
  .th-m-frame, .th-stage.is-mobile .th-m-frame { width: 100%; }
}
@media (max-width: 700px) {
  .th-stage.is-both .th-desktop { display: none; }
  .th-stage.is-both .th-m-frame { width: 100%; }
}

/* Loading */
.th-loading {
  display: flex; flex-direction: column; align-items: center;
  justify-content: center; height: 300px; gap: 16px;
  color: #6b7280; font-size: .9rem;
}
.th-spinner {
  width: 32px; height: 32px;
  border: 3px solid #f0f0f0; border-top-color: #894bf4;
  border-radius: 50%; animation: th-spin .7s linear infinite;
}
@media (prefers-reduced-motion: reduce) { .th-spinner { animation-duration: 2s; } }
`;

// ── Live Store Preview (iframe) ────────────────────────────────
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
            onLoad={(e) => {
              try {
                const d = e.currentTarget.contentDocument;
                if (!d) return;
                const st = d.createElement("style");
                st.textContent = "html{scrollbar-width:none}html::-webkit-scrollbar,body::-webkit-scrollbar{width:0;height:0;display:none}";
                d.head?.appendChild(st);
              } catch (_) {}
            }}
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
        <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#9ca3af", fontSize: 13 }}>
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

  const host = typeof window !== "undefined" ? window.location.hostname : "";

  return (
    <div className="th-page" dir="ltr">
      <style>{CSS}</style>

      {/* ══ HEADER ══ */}
      <div className="th-head">
        <div>
          <h1 className="th-title">Themes</h1>
          <p className="th-sub">Control how your store looks on every screen.</p>
        </div>
        <div className="th-actions">
          <div className="th-tabs" role="tablist" aria-label="Preview mode">
            {VIEWS.map(v => (
              <button
                key={v.id}
                role="tab"
                aria-selected={view === v.id}
                className={`th-tab ${view === v.id ? "is-on" : ""}`}
                title={v.label}
                aria-label={v.label}
                onClick={() => setView(v.id)}
              >
                {v.icon}
              </button>
            ))}
          </div>
          {storeUrl && (
            <a href={storeUrl} target="_blank" rel="noreferrer"  className="th-btn-view" title="View your store" aria-label="View your store">
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
              </svg>
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
      <div className={`th-card th-stage is-${view}`}>
        {showDesktop && (
          <div className="th-desktop">
            <div className="th-chrome">
              <div className="th-dot" style={{ background: "#ff5f57" }} />
              <div className="th-dot" style={{ background: "#febc2e" }} />
              <div className="th-dot" style={{ background: "#28c840" }} />
              <div className="th-url-bar">
                <svg width="9" height="9" fill="none" stroke="#9ca3af" strokeWidth="2" viewBox="0 0 24 24">
                  <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
                {host || "moo.tassyir.io"}/store/{store?.slug || "my-store"}
              </div>
            </div>
            <div className="th-desktop-store">
              <ScaledFrame src={storeUrl} baseWidth={1280} title="Desktop preview" />
            </div>
          </div>
        )}

        {showMobile && (
          <div className="th-m-frame">
            <div className="th-chrome">
              <div className="th-dot" style={{ background: "#ff5f57" }} />
              <div className="th-dot" style={{ background: "#febc2e" }} />
              <div className="th-dot" style={{ background: "#28c840" }} />
              <div className="th-url-bar">
                <svg width="9" height="9" fill="none" stroke="#9ca3af" strokeWidth="2" viewBox="0 0 24 24">
                  <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
                {host}/store/{store?.slug || "my-store"}
              </div>
            </div>
            <div className="th-m-wrap">
              <ScaledFrame src={storeUrl} baseWidth={393} title="Mobile preview" />
            </div>
          </div>
        )}
      </div>

      {/* ══ INFO ══ */}
      <div className="th-info">
        <div className="th-card">
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

        <div className="th-card th-stats">
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
  );
}

export default Theme;