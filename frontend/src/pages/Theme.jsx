// ============================================================
// 📁 pages/Theme.jsx — Themes Gallery (كيما Tassyir)
// ============================================================
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API   = () => import.meta.env.VITE_API_URL;
const token = () => localStorage.getItem("token");

const CSS = `
@keyframes th-spin { to { transform: rotate(360deg); } }

.th-page { display: flex; flex-direction: column; gap: 28px; }

/* ── Theme Card ── */
.th-card {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  overflow: hidden;
}

/* ── Preview wrapper ── */
.th-preview-wrap {
  background: #f3f4f6;
  padding: 32px 28px 0;
  display: flex;
  align-items: flex-end;
  gap: 16px;
  min-height: 380px;
  position: relative;
  overflow: hidden;
}

/* ── Desktop browser frame ── */
.th-browser {
  flex: 1;
  background: #fff;
  border-radius: 12px 12px 0 0;
  box-shadow: 0 -4px 32px rgba(0,0,0,.13), 0 0 0 1px #e5e7eb;
  overflow: hidden;
  min-height: 320px;
}
.th-browser__bar {
  background: #efefef;
  padding: 9px 12px;
  display: flex;
  align-items: center;
  gap: 6px;
  border-bottom: 1px solid #e0e0e0;
}
.th-dot { width: 11px; height: 11px; border-radius: 50%; flex-shrink: 0; }
.th-browser__url {
  flex: 1; margin: 0 10px;
  background: #fff; border: 1px solid #e0e0e0;
  border-radius: 6px; padding: 4px 10px;
  font-size: 10px; color: #6b7280;
  display: flex; align-items: center; gap: 5px;
  white-space: nowrap; overflow: hidden;
}
.th-browser__content {
  height: 280px;
  overflow: hidden;
}
.th-browser__iframe {
  width: 100%; height: 100%;
  border: none; display: block;
  pointer-events: none;
}
.th-browser__skeleton {
  padding: 0;
}

/* ── Mobile frame ── */
.th-mobile {
  width: 140px;
  flex-shrink: 0;
  background: #1c1c1e;
  border-radius: 28px 28px 0 0;
  padding: 10px 7px 0;
  box-shadow: -4px -4px 24px rgba(0,0,0,.18);
  align-self: flex-end;
  min-height: 260px;
}
.th-mobile__notch {
  width: 50px; height: 5px;
  background: #3a3a3c; border-radius: 3px;
  margin: 0 auto 8px;
}
.th-mobile__screen {
  border-radius: 18px 18px 0 0;
  overflow: hidden;
  background: #fff;
  height: 240px;
}
.th-mobile__iframe {
  width: 340px; height: 600px;
  border: none; display: block;
  transform: scale(0.41);
  transform-origin: top left;
  pointer-events: none;
}

/* ── Skeleton store preview ── */
.th-sk-nav {
  height: 46px;
  display: flex; align-items: center; justify-content: space-between;
  padding: 0 18px;
}
.th-sk-nav__logo { display: flex; align-items: center; gap: 8px; }
.th-sk-nav__logo-box { width: 28px; height: 28px; border-radius: 7px; }
.th-sk-nav__name { width: 70px; height: 10px; background: rgba(255,255,255,.3); border-radius: 4px; }
.th-sk-nav__links { display: flex; gap: 14px; }
.th-sk-nav__link { width: 40px; height: 8px; background: rgba(255,255,255,.25); border-radius: 4px; }
.th-sk-nav__icons { display: flex; gap: 10px; }
.th-sk-banner {
  width: 100%; height: 110px;
  display: flex; align-items: center; justify-content: center;
  font-size: 11px; color: rgba(255,255,255,.6);
  letter-spacing: .05em; font-weight: 500;
}
.th-sk-section { padding: 14px 16px; }
.th-sk-section__title { width: 100px; height: 9px; background: #e5e7eb; border-radius: 4px; margin-bottom: 12px; }
.th-sk-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
.th-sk-product { background: #f8f9fa; border-radius: 10px; overflow: hidden; }
.th-sk-product__img { height: 64px; display: flex; align-items: center; justify-content: center; font-size: 20px; background: #f0f0f0; }
.th-sk-product__body { padding: 8px 9px 10px; }
.th-sk-product__name { height: 7px; background: #e5e7eb; border-radius: 3px; width: 80%; margin-bottom: 5px; }
.th-sk-product__price { height: 7px; background: #eeeeee; border-radius: 3px; width: 50%; margin-bottom: 9px; }
.th-sk-product__btn {
  width: 100%; height: 26px; border-radius: 7px;
  display: flex; align-items: center; justify-content: center;
  font-size: 8px; font-weight: 700; color: #fff;
}

/* mobile skeleton */
.th-sk-m-nav {
  height: 42px; display: flex; align-items: center;
  justify-content: space-between; padding: 0 12px;
}
.th-sk-m-banner { width: 100%; height: 80px; display: flex; align-items: center; justify-content: center; font-size: 9px; color: rgba(255,255,255,.5); }
.th-sk-m-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 7px; padding: 10px; }
.th-sk-m-product { background: #f8f9fa; border-radius: 8px; overflow: hidden; }
.th-sk-m-img { height: 48px; background: #f0f0f0; display: flex; align-items: center; justify-content: center; font-size: 16px; }
.th-sk-m-body { padding: 6px 7px 7px; }
.th-sk-m-name { height: 5px; background: #e5e7eb; border-radius: 3px; width: 80%; margin-bottom: 4px; }
.th-sk-m-price { height: 5px; background: #eee; border-radius: 3px; width: 50%; margin-bottom: 7px; }
.th-sk-m-btn { width: 100%; height: 20px; border-radius: 5px; display: flex; align-items: center; justify-content: center; font-size: 7px; font-weight: 700; color: #fff; }

/* ── Card footer ── */
.th-card-footer {
  display: flex; align-items: center; justify-content: space-between;
  padding: 16px 22px;
  border-top: 1px solid #f3f4f6;
}
.th-card-footer__left {}
.th-card-footer__name {
  font-size: .9rem; font-weight: 700; color: #111827;
  display: flex; align-items: center; gap: 8px; margin-bottom: 3px;
}
.th-current-badge {
  font-size: .68rem; font-weight: 600; padding: 2px 8px;
  border-radius: 99px; background: #dcfce7; color: #16a34a;
  border: 1px solid #bbf7d0;
  display: flex; align-items: center; gap: 4px;
}
.th-current-badge::before {
  content: ""; width: 6px; height: 6px;
  border-radius: 50%; background: #16a34a; display: inline-block;
}
.th-card-footer__saved { font-size: .75rem; color: #9ca3af; }
.th-card-footer__actions { display: flex; gap: 8px; align-items: center; }

.th-btn-view {
  display: flex; align-items: center; gap: 6px;
  padding: 8px 16px; border-radius: 9px;
  border: 1px solid #e5e7eb; background: #fff;
  color: #374151; font-size: .82rem; font-weight: 600;
  cursor: pointer; font-family: inherit; transition: all .15s;
  text-decoration: none;
}
.th-btn-view:hover { border-color: #d1d5db; background: #f9fafb; }

.th-btn-edit {
  display: flex; align-items: center; gap: 6px;
  padding: 8px 18px; border-radius: 9px;
  border: none; background: #111827;
  color: #fff; font-size: .82rem; font-weight: 700;
  cursor: pointer; font-family: inherit; transition: opacity .15s;
}
.th-btn-edit:hover { opacity: .85; }

/* loading */
.th-loading {
  display: flex; flex-direction: column; align-items: center;
  justify-content: center; height: 300px; gap: 14px;
  color: #9ca3af; font-size: .85rem;
}
.th-spinner {
  width: 30px; height: 30px; border: 3px solid #f0f0f0;
  border-top-color: #111827; border-radius: 50%;
  animation: th-spin .7s linear infinite;
}
`;

// ── Store Skeleton Preview (Desktop) ──────────────────────────
function DesktopSkeleton({ store }) {
  const pc = store?.primaryColor || "#2563eb";
  const sc = store?.secondaryColor || "#0f172a";
  const name = store?.name || "اسم المتجر";
  const slug = store?.slug || "my-store";

  return (
    <div style={{ fontFamily: store?.fontFamily || "Inter" }}>
      {/* Nav */}
      <div className="th-sk-nav" style={{ background: pc }}>
        <div className="th-sk-nav__logo">
          {store?.logo
            ? <img src={store.logo} style={{ width: 28, height: 28, borderRadius: 7, objectFit: "cover" }} />
            : <div className="th-sk-nav__logo-box" style={{ background: "rgba(255,255,255,.25)" }}>
                <span style={{ fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>🏪</span>
              </div>
          }
          <div className="th-sk-nav__name" />
        </div>
        <div className="th-sk-nav__links">
          {[1,2,3].map(i => <div key={i} className="th-sk-nav__link" />)}
        </div>
        <div className="th-sk-nav__icons">
          <svg width="14" height="14" fill="none" stroke="rgba(255,255,255,.7)" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          <svg width="14" height="14" fill="none" stroke="rgba(255,255,255,.7)" strokeWidth="2" viewBox="0 0 24 24"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/></svg>
        </div>
      </div>
      {/* Banner */}
      {store?.banner
        ? <img src={store.banner} style={{ width: "100%", height: 110, objectFit: "cover", display: "block" }} />
        : <div className="th-sk-banner" style={{ background: pc + "22" }}>🖼️ البانر</div>
      }
      {/* Products */}
      <div className="th-sk-section">
        <div className="th-sk-section__title" />
        <div className="th-sk-grid">
          {[1,2,3].map(i => (
            <div key={i} className="th-sk-product">
              <div className="th-sk-product__img">📦</div>
              <div className="th-sk-product__body">
                <div className="th-sk-product__name" />
                <div className="th-sk-product__price" />
                <div className="th-sk-product__btn" style={{ background: sc }}>اطلب الآن</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Mobile Skeleton Preview ────────────────────────────────────
function MobileSkeleton({ store }) {
  const pc = store?.primaryColor || "#2563eb";
  const sc = store?.secondaryColor || "#0f172a";

  return (
    <div style={{ fontFamily: store?.fontFamily || "Inter" }}>
      <div className="th-sk-m-nav" style={{ background: pc }}>
        {store?.logo
          ? <img src={store.logo} style={{ width: 24, height: 24, borderRadius: 6, objectFit: "cover" }} />
          : <span style={{ fontSize: 14 }}>🏪</span>
        }
        <span style={{ fontSize: 9, fontWeight: 700, color: "#fff" }}>{store?.name || "المتجر"}</span>
        <svg width="12" height="12" fill="none" stroke="rgba(255,255,255,.8)" strokeWidth="2" viewBox="0 0 24 24"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/></svg>
      </div>
      {store?.banner
        ? <img src={store.banner} style={{ width: "100%", height: 60, objectFit: "cover", display: "block" }} />
        : <div className="th-sk-m-banner" style={{ background: pc + "22" }}>🖼️</div>
      }
      <div className="th-sk-m-grid">
        {[1,2].map(i => (
          <div key={i} className="th-sk-m-product">
            <div className="th-sk-m-img">📦</div>
            <div className="th-sk-m-body">
              <div className="th-sk-m-name" />
              <div className="th-sk-m-price" />
              <div className="th-sk-m-btn" style={{ background: sc }}>اطلب</div>
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
    ? new Date(store.updatedAt).toLocaleDateString("ar-DZ", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })
    : null;

  return (
    <div className="th-page" dir="rtl">
      <style>{CSS}</style>

      <div className="th-card">

        {/* ── Preview ── */}
        <div className="th-preview-wrap">

          {/* Desktop */}
          <div className="th-browser">
            <div className="th-browser__bar">
              <div className="th-dot" style={{ background: "#ff5f57" }} />
              <div className="th-dot" style={{ background: "#febc2e" }} />
              <div className="th-dot" style={{ background: "#28c840" }} />
              <div className="th-browser__url">
                <svg width="9" height="9" fill="none" stroke="#9ca3af" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                {window.location.hostname}/store/{store?.slug || "my-store"}
              </div>
            </div>
            <div className="th-browser__content th-browser__skeleton">
              <DesktopSkeleton store={store} />
            </div>
          </div>

          {/* Mobile */}
          <div className="th-mobile">
            <div className="th-mobile__notch" />
            <div className="th-mobile__screen">
              <MobileSkeleton store={store} />
            </div>
          </div>

        </div>

        {/* ── Footer ── */}
        <div className="th-card-footer">
          <div className="th-card-footer__left">
            <div className="th-card-footer__name">
              {store?.name ? `${store.name}'s theme` : "My Theme"}
              <span className="th-current-badge">Current theme</span>
            </div>
            {savedDate && (
              <div className="th-card-footer__saved">Last saved: {savedDate}</div>
            )}
          </div>

          <div className="th-card-footer__actions">
            {store?.slug && (
              <a
                href={`/store/${store.slug}`}
                target="_blank"
                rel="noreferrer"
                className="th-btn-view"
              >
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                View your store
              </a>
            )}
            <button className="th-btn-edit" onClick={() => navigate("/theme/edit")}>
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              Edit Theme
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Theme;