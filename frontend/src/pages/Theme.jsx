// ============================================================
// 📁 pages/Theme.jsx — Shopify-style theme preview
// ============================================================
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API   = () => import.meta.env.VITE_API_URL;
const token = () => localStorage.getItem("token");

const CSS = `
@keyframes th-spin { to { transform: rotate(360deg); } }

.th-page { display: flex; flex-direction: column; gap: 0; }

/* ── Outer card ── */
.th-card {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  overflow: hidden;
}

/* ── Preview area: grey bg ── */
.th-preview-area {
  background: #f0f0f0;
  padding: 28px 24px 0;
  display: flex;
  align-items: flex-end;
  gap: 0;
  min-height: 420px;
  position: relative;
  overflow: hidden;
}

/* ══ DESKTOP BROWSER (dominant, right side in RTL) ══ */
.th-desktop {
  flex: 1;
  background: #fff;
  border-radius: 10px 10px 0 0;
  box-shadow: 0 -2px 24px rgba(0,0,0,.12), 0 0 0 1px rgba(0,0,0,.07);
  overflow: hidden;
  min-height: 360px;
  position: relative;
  z-index: 2;
}

/* browser chrome bar */
.th-desktop__chrome {
  background: #e8e8e8;
  padding: 8px 12px;
  display: flex;
  align-items: center;
  gap: 6px;
  border-bottom: 1px solid #d8d8d8;
}
.th-dot { width: 11px; height: 11px; border-radius: 50%; flex-shrink: 0; }
.th-desktop__url-bar {
  flex: 1;
  margin: 0 8px;
  background: #fff;
  border: 1px solid #d0d0d0;
  border-radius: 5px;
  padding: 4px 10px;
  font-size: 10px;
  color: #555;
  display: flex;
  align-items: center;
  gap: 4px;
  overflow: hidden;
  white-space: nowrap;
}
.th-desktop__content {
  height: 330px;
  overflow: hidden;
}

/* ══ MOBILE FRAME (small, left side in RTL, overlapping) ══ */
.th-mobile-wrap {
  width: 155px;
  flex-shrink: 0;
  position: relative;
  z-index: 3;
  margin-right: -16px; /* overlap slightly on desktop */
  align-self: flex-end;
}
.th-mobile-device {
  width: 155px;
  background: #111;
  border-radius: 26px 26px 0 0;
  padding: 9px 7px 0;
  box-shadow: -6px 0 30px rgba(0,0,0,.22), 0 -4px 20px rgba(0,0,0,.15);
}
.th-mobile-notch {
  width: 48px; height: 5px;
  background: #2a2a2a;
  border-radius: 3px;
  margin: 0 auto 7px;
}
.th-mobile-screen {
  border-radius: 18px 18px 0 0;
  overflow: hidden;
  background: #fff;
  height: 300px;
  overflow-y: hidden;
}

/* ══ STORE CONTENT — Desktop ══ */
.th-d-nav {
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
}
.th-d-nav__left { display: flex; align-items: center; gap: 9px; }
.th-d-nav__logo { width: 28px; height: 28px; border-radius: 7px; object-fit: cover; }
.th-d-nav__logo-ph {
  width: 28px; height: 28px; border-radius: 7px;
  display: flex; align-items: center; justify-content: center; font-size: 15px;
}
.th-d-nav__name { font-size: 12px; font-weight: 700; color: #fff; }
.th-d-nav__links { display: flex; gap: 18px; }
.th-d-nav__link { height: 7px; width: 38px; background: rgba(255,255,255,.3); border-radius: 3px; }
.th-d-nav__actions { display: flex; gap: 10px; align-items: center; }
.th-d-nav__avatar { width: 28px; height: 28px; border-radius: 50%; background: rgba(255,255,255,.25); display: flex; align-items: center; justify-content: center; font-size: 13px; }

.th-d-banner { width: 100%; height: 160px; object-fit: cover; display: block; }
.th-d-banner-ph {
  width: 100%; height: 160px;
  display: flex; align-items: center; justify-content: center; font-size: 40px;
}

.th-d-products { padding: 16px 18px; }
.th-d-products-title { height: 8px; width: 120px; background: #e5e7eb; border-radius: 4px; margin-bottom: 14px; }
.th-d-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
.th-d-product { background: #f8f9fa; border-radius: 10px; overflow: hidden; }
.th-d-product__img { height: 72px; background: #efefef; display: flex; align-items: center; justify-content: center; font-size: 26px; }
.th-d-product__body { padding: 9px 10px 11px; }
.th-d-product__name { height: 7px; background: #e0e0e0; border-radius: 3px; width: 78%; margin-bottom: 5px; }
.th-d-product__price { height: 7px; background: #ececec; border-radius: 3px; width: 48%; margin-bottom: 10px; }
.th-d-product__btn {
  width: 100%; height: 28px; border-radius: 7px;
  display: flex; align-items: center; justify-content: center;
  font-size: 8px; font-weight: 700; color: #fff;
}

/* ══ STORE CONTENT — Mobile ══ */
.th-m-nav {
  height: 42px;
  display: flex; align-items: center;
  justify-content: space-between;
  padding: 0 12px;
}
.th-m-nav__logo { width: 24px; height: 24px; border-radius: 6px; object-fit: cover; }
.th-m-nav__logo-ph { font-size: 14px; }
.th-m-nav__name { font-size: 10px; font-weight: 700; color: #fff; }
.th-m-nav__icons { display: flex; gap: 8px; }

.th-m-banner { width: 100%; height: 90px; object-fit: cover; display: block; }
.th-m-banner-ph { width: 100%; height: 90px; display: flex; align-items: center; justify-content: center; font-size: 24px; }

.th-m-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; padding: 10px; }
.th-m-product { background: #f8f9fa; border-radius: 9px; overflow: hidden; }
.th-m-product__img { height: 56px; background: #efefef; display: flex; align-items: center; justify-content: center; font-size: 20px; }
.th-m-product__body { padding: 7px 8px 9px; }
.th-m-product__name { height: 6px; background: #e0e0e0; border-radius: 3px; width: 80%; margin-bottom: 4px; }
.th-m-product__price { height: 6px; background: #ececec; border-radius: 3px; width: 50%; margin-bottom: 8px; }
.th-m-product__btn {
  width: 100%; height: 22px; border-radius: 6px;
  display: flex; align-items: center; justify-content: center;
  font-size: 7px; font-weight: 700; color: #fff;
}

/* ══ FOOTER BAR ══ */
.th-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 22px;
  border-top: 1px solid #f0f0f0;
  flex-wrap: wrap;
  gap: 12px;
}
.th-footer__left {}
.th-footer__name-row {
  display: flex; align-items: center; gap: 8px; margin-bottom: 4px;
}
.th-footer__name { font-size: .9rem; font-weight: 700; color: #111827; }
.th-badge-current {
  font-size: .68rem; font-weight: 600;
  padding: 2px 9px; border-radius: 99px;
  background: #dcfce7; color: #16a34a;
  border: 1px solid #bbf7d0;
  display: flex; align-items: center; gap: 4px;
}
.th-badge-current::before {
  content: ""; width: 6px; height: 6px;
  border-radius: 50%; background: #16a34a; display: block;
}
.th-footer__saved { font-size: .75rem; color: #9ca3af; }
.th-footer__actions { display: flex; gap: 8px; }

.th-btn-edit {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 9px 18px; border-radius: 9px; border: none;
  background: #111827; color: #fff;
  font-size: .82rem; font-weight: 700;
  cursor: pointer; font-family: inherit; transition: opacity .15s;
}
.th-btn-edit:hover { opacity: .85; }

.th-btn-view {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 9px 16px; border-radius: 9px;
  border: 1px solid #e5e7eb; background: #fff;
  color: #374151; font-size: .82rem; font-weight: 600;
  cursor: pointer; font-family: inherit; transition: all .15s;
  text-decoration: none;
}
.th-btn-view:hover { background: #f9fafb; border-color: #d1d5db; }

/* loading */
.th-loading {
  display: flex; flex-direction: column; align-items: center;
  justify-content: center; height: 340px; gap: 14px;
  color: #9ca3af; font-size: .85rem;
}
.th-spinner {
  width: 30px; height: 30px;
  border: 3px solid #f0f0f0; border-top-color: #111827;
  border-radius: 50%; animation: th-spin .7s linear infinite;
}
`;

// ── Desktop store skeleton ─────────────────────────────────────
function DesktopStore({ store }) {
  const pc = store?.primaryColor || "#2563eb";
  const sc = store?.secondaryColor || "#0f172a";
  return (
    <div style={{ fontFamily: store?.fontFamily || "Inter" }}>
      {/* Nav */}
      <div className="th-d-nav" style={{ background: pc }}>
        <div className="th-d-nav__left">
          {store?.logo
            ? <img src={store.logo} className="th-d-nav__logo" alt="" />
            : <div className="th-d-nav__logo-ph" style={{ background: "rgba(255,255,255,.2)" }}>🏪</div>
          }
          <span className="th-d-nav__name">{store?.name || "اسم المتجر"}</span>
        </div>
        <div className="th-d-nav__links">
          {[1,2,3].map(i => <div key={i} className="th-d-nav__link" />)}
        </div>
        <div className="th-d-nav__actions">
          <svg width="14" height="14" fill="none" stroke="rgba(255,255,255,.8)" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          <svg width="14" height="14" fill="none" stroke="rgba(255,255,255,.8)" strokeWidth="2" viewBox="0 0 24 24"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/></svg>
          <div className="th-d-nav__avatar">
            {store?.logo ? <img src={store.logo} style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }} /> : "👤"}
          </div>
        </div>
      </div>
      {/* Banner */}
      {store?.banner
        ? <img src={store.banner} className="th-d-banner" alt="" />
        : <div className="th-d-banner-ph" style={{ background: pc + "18" }}>🖼️</div>
      }
      {/* Products */}
      <div className="th-d-products">
        <div className="th-d-products-title" />
        <div className="th-d-grid">
          {[1,2,3].map(i => (
            <div key={i} className="th-d-product">
              <div className="th-d-product__img">📦</div>
              <div className="th-d-product__body">
                <div className="th-d-product__name" />
                <div className="th-d-product__price" />
                <div className="th-d-product__btn" style={{ background: sc }}>اطلب الآن</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Mobile store skeleton ──────────────────────────────────────
function MobileStore({ store }) {
  const pc = store?.primaryColor || "#2563eb";
  const sc = store?.secondaryColor || "#0f172a";
  return (
    <div style={{ fontFamily: store?.fontFamily || "Inter" }}>
      {/* Nav */}
      <div className="th-m-nav" style={{ background: pc }}>
        {store?.logo
          ? <img src={store.logo} className="th-m-nav__logo" alt="" />
          : <div className="th-m-nav__logo-ph">🏪</div>
        }
        <span className="th-m-nav__name">{store?.name || "المتجر"}</span>
        <div className="th-m-nav__icons">
          <svg width="13" height="13" fill="none" stroke="rgba(255,255,255,.85)" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          <svg width="13" height="13" fill="none" stroke="rgba(255,255,255,.85)" strokeWidth="2" viewBox="0 0 24 24"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/></svg>
        </div>
      </div>
      {/* Banner */}
      {store?.banner
        ? <img src={store.banner} className="th-m-banner" alt="" />
        : <div className="th-m-banner-ph" style={{ background: pc + "18" }}>🖼️</div>
      }
      {/* Products */}
      <div className="th-m-grid">
        {[1,2].map(i => (
          <div key={i} className="th-m-product">
            <div className="th-m-product__img">📦</div>
            <div className="th-m-product__body">
              <div className="th-m-product__name" />
              <div className="th-m-product__price" />
              <div className="th-m-product__btn" style={{ background: sc }}>اطلب</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────
function Theme() {
  const navigate = useNavigate();
  const [store,   setStore]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API()}/api/stores/my-store`, {
      headers: { Authorization: `Bearer ${token()}` },
    })
      .then(r => r.json())
      .then(d => { if (d.hasStore) setStore(d.store); })
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

  const savedDate = store?.updatedAt
    ? new Date(store.updatedAt).toLocaleDateString("ar-DZ", {
        day: "numeric", month: "short",
        hour: "2-digit", minute: "2-digit",
      })
    : null;

  return (
    <div className="th-page" dir="rtl">
      <style>{CSS}</style>

      <div className="th-card">

        {/* ══ PREVIEW AREA ══ */}
        <div className="th-preview-area">

          {/* Mobile — يسار (في RTL يجي على اليسار) */}
          <div className="th-mobile-wrap">
            <div className="th-mobile-device">
              <div className="th-mobile-notch" />
              <div className="th-mobile-screen">
                <MobileStore store={store} />
              </div>
            </div>
          </div>

          {/* Desktop — يمين */}
          <div className="th-desktop">
            {/* Chrome bar */}
            <div className="th-desktop__chrome">
              <div className="th-dot" style={{ background: "#ff5f57" }} />
              <div className="th-dot" style={{ background: "#febc2e" }} />
              <div className="th-dot" style={{ background: "#28c840" }} />
              <div className="th-desktop__url-bar">
                <svg width="9" height="9" fill="none" stroke="#9ca3af" strokeWidth="2" viewBox="0 0 24 24">
                  <rect x="3" y="11" width="18" height="11" rx="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
                {window.location.hostname}/store/{store?.slug || "my-store"}
              </div>
            </div>
            {/* Content */}
            <div className="th-desktop__content">
              <DesktopStore store={store} />
            </div>
          </div>

        </div>

        {/* ══ FOOTER BAR ══ */}
        <div className="th-footer">
          <div className="th-footer__left">
            <div className="th-footer__name-row">
              <button className="th-btn-edit" onClick={() => navigate("/theme/edit")}>
                <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
                Edit Theme
              </button>
              {store?.slug && (
                <a href={`/store/${store.slug}`} target="_blank" rel="noreferrer" className="th-btn-view">
                  <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                  View your store
                </a>
              )}
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 3 }}>
            <div className="th-footer__name-row" style={{ justifyContent: "flex-end" }}>
              <span className="th-badge-current">Current theme</span>
              <span className="th-footer__name">{store?.name ? `${store.name}'s theme` : "My Theme"}</span>
            </div>
            {savedDate && (
              <span className="th-footer__saved">Last saved: {savedDate}</span>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

export default Theme;