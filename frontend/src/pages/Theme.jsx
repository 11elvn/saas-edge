// ============================================================
// 📁 pages/Theme.jsx — Live skeleton preview (بيانات حقيقية)
// يعكس PublicStore الحقيقية: announcement bar + navbar +
// hero/banner + trust badges + categories + products
// ============================================================
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API   = () => import.meta.env.VITE_API_URL;
const token = () => localStorage.getItem("token");

// ── CSS ────────────────────────────────────────────────────────
const CSS = `
@keyframes th-spin  { to { transform: rotate(360deg); } }
@keyframes th-fade  { from { opacity:0; } to { opacity:1; } }
@keyframes th-marquee { from { transform:translateX(0); } to { transform:translateX(-50%); } }

.th-page { display:flex; flex-direction:column; gap:0; }

/* ── Outer card ── */
.th-card {
  background:#fff;
  border:1px solid #e5e7eb;
  border-radius:16px;
  overflow:hidden;
}

/* ── Preview area background ── */
.th-preview-area {
  background:#f3f4f6;
  padding:28px 28px 0;
  display:flex;
  align-items:flex-end;
  gap:0;
  min-height:480px;
  position:relative;
  overflow:hidden;
}

/* ══ DESKTOP BROWSER ══ */
.th-desktop {
  flex:1;
  background:#fff;
  border-radius:10px 10px 0 0;
  box-shadow:0 -4px 32px rgba(0,0,0,.13), 0 0 0 1px rgba(0,0,0,.07);
  overflow:hidden;
  position:relative;
  z-index:2;
}

/* Chrome bar */
.th-chrome {
  background:#e4e4e4;
  padding:9px 14px;
  display:flex;
  align-items:center;
  gap:7px;
  border-bottom:1px solid #d0d0d0;
  user-select:none;
  flex-shrink:0;
}
.th-dot { width:12px; height:12px; border-radius:50%; flex-shrink:0; }
.th-url-bar {
  flex:1; margin:0 10px;
  background:#fff; border:1px solid #d0d0d0;
  border-radius:6px; padding:5px 12px;
  font-size:11px; color:#555;
  display:flex; align-items:center; gap:5px;
  overflow:hidden; white-space:nowrap; font-family:monospace;
}

/* Desktop store scroll area */
.th-desktop-store {
  height:420px;
  overflow-y:auto;
  overflow-x:hidden;
  direction:rtl;
}
.th-desktop-store::-webkit-scrollbar { width:4px; }
.th-desktop-store::-webkit-scrollbar-thumb { background:#ddd; border-radius:4px; }

/* ══ MOBILE FRAME ══ */
.th-mobile-wrap {
  width:158px;
  flex-shrink:0;
  position:relative;
  z-index:3;
  margin-left:-18px;
  align-self:flex-end;
}
.th-mobile-device {
  width:158px;
  background:#1a1a1a;
  border-radius:28px 28px 0 0;
  padding:10px 7px 0;
  box-shadow:-8px 0 40px rgba(0,0,0,.28), 0 -4px 20px rgba(0,0,0,.15);
}
.th-mobile-notch {
  width:48px; height:5px;
  background:#333; border-radius:3px;
  margin:0 auto 8px;
}
.th-mobile-screen {
  border-radius:20px 20px 0 0;
  overflow:hidden; background:#fff;
  height:336px; overflow-y:auto;
  direction:rtl;
}
.th-mobile-screen::-webkit-scrollbar { display:none; }

/* ══ STORE CONTENT (shared) ══ */

/* Announcement bar */
.th-announce {
  overflow:hidden; padding:7px 0;
}
.th-announce-track {
  display:flex; gap:48px; width:max-content;
  animation:th-marquee 16s linear infinite;
}
.th-announce-text {
  white-space:nowrap; font-weight:600; letter-spacing:1px;
}

/* Navbar */
.th-navbar {
  display:flex; align-items:center;
  justify-content:space-between;
}
.th-nav-logo {
  object-fit:cover; border-radius:6px;
}
.th-nav-letter {
  display:flex; align-items:center; justify-content:center;
  font-weight:800; color:#fff; border-radius:6px;
}
.th-nav-name { font-weight:700; color:#111; }
.th-nav-links { display:flex; gap:16px; }
.th-nav-link { font-size:12px; font-weight:600; color:#444; cursor:default; }
.th-nav-icons { display:flex; gap:10px; align-items:center; }

/* Hero */
.th-hero {
  position:relative; overflow:hidden;
  display:flex; align-items:flex-end; justify-content:center;
}
.th-hero-img { width:100%; height:100%; object-fit:cover; display:block; }
.th-hero-overlay {
  position:absolute; inset:0;
  background:linear-gradient(to bottom, transparent 50%, rgba(0,0,0,.55) 100%);
}
.th-hero-cta {
  position:absolute; bottom:18px;
  display:flex; justify-content:center; width:100%;
}
.th-hero-btn {
  border:none; color:#fff; font-weight:700; cursor:default;
  letter-spacing:.3px; border-radius:99px; font-family:inherit;
}
.th-hero-placeholder {
  width:100%; height:100%;
  display:flex; align-items:center; justify-content:center;
}

/* Trust badges */
.th-trust { display:grid; border-top:1px solid #e5e7eb; border-bottom:1px solid #e5e7eb; }
.th-trust-item {
  display:flex; flex-direction:column;
  align-items:center; gap:6px; text-align:center;
  border-right:1px solid #e5e7eb;
}
.th-trust-item:last-child { border-right:none; }
.th-trust-icon { font-size:18px; }
.th-trust-title { font-weight:700; color:#111; }
.th-trust-sub   { color:#888; }

/* Section header */
.th-section-header {
  display:flex; align-items:flex-end; justify-content:space-between;
}
.th-section-title { font-weight:900; color:#111; margin:0 0 4px; line-height:1; }
.th-section-sub   { color:#888; margin:0; }
.th-view-all {
  border-radius:99px; font-weight:700; cursor:default;
  border-style:solid;
}

/* Category cards */
.th-cat-card {
  border-radius:12px; overflow:hidden;
  border:1px solid #eee; background:#fff;
}
.th-cat-img  { width:100%; object-fit:cover; display:block; }
.th-cat-ph   { width:100%; display:flex; align-items:center; justify-content:center; }
.th-cat-name { font-weight:700; color:#111; }
.th-cat-count{ color:#888; }

/* Product cards */
.th-prod-card {
  border-radius:12px; overflow:hidden;
  border:1px solid #eee; background:#fff;
}
.th-prod-img  { width:100%; object-fit:cover; display:block; }
.th-prod-ph   { width:100%; display:flex; align-items:center; justify-content:center; background:#f8f9fa; }
.th-prod-name { font-weight:700; color:#111; }
.th-prod-price{ font-weight:800; }
.th-prod-old  { text-decoration:line-through; color:#aaa; }
.th-prod-btn  {
  width:100%; border:none; color:#fff;
  font-weight:700; cursor:default; font-family:inherit;
  border-radius:8px;
}

/* ══ FOOTER BAR ══ */
.th-footer {
  display:flex; align-items:center;
  justify-content:space-between;
  padding:16px 24px;
  border-top:1px solid #f0f0f0;
  flex-wrap:wrap; gap:12px;
}
.th-footer-left { display:flex; flex-direction:column; gap:3px; }
.th-footer-name-row { display:flex; align-items:center; gap:8px; }
.th-footer-name { font-size:.92rem; font-weight:700; color:#111827; }
.th-badge-current {
  font-size:.68rem; font-weight:600;
  padding:3px 10px; border-radius:99px;
  background:#dcfce7; color:#16a34a;
  border:1px solid #bbf7d0;
  display:inline-flex; align-items:center; gap:5px;
}
.th-badge-current::before {
  content:""; width:6px; height:6px;
  border-radius:50%; background:#16a34a; display:block;
}
.th-footer-saved { font-size:.74rem; color:#9ca3af; }
.th-footer-actions { display:flex; gap:8px; align-items:center; }

.th-btn-edit {
  display:inline-flex; align-items:center; gap:7px;
  padding:9px 20px; border-radius:9px; border:none;
  background:#111827; color:#fff;
  font-size:.83rem; font-weight:700;
  cursor:pointer; font-family:inherit; transition:opacity .15s;
}
.th-btn-edit:hover { opacity:.85; }
.th-btn-view {
  display:inline-flex; align-items:center; gap:7px;
  padding:9px 18px; border-radius:9px;
  border:1px solid #e5e7eb; background:#fff;
  color:#374151; font-size:.83rem; font-weight:600;
  cursor:pointer; font-family:inherit; transition:all .15s;
  text-decoration:none;
}
.th-btn-view:hover { background:#f9fafb; border-color:#d1d5db; }

/* Loading */
.th-loading {
  display:flex; flex-direction:column; align-items:center;
  justify-content:center; height:380px; gap:14px;
  color:#9ca3af; font-size:.85rem;
}
.th-spinner {
  width:30px; height:30px;
  border:3px solid #f0f0f0; border-top-color:#111827;
  border-radius:50%; animation:th-spin .7s linear infinite;
}
`;

// ── Desktop store preview ──────────────────────────────────────
function DesktopStore({ store, products, categories }) {
  const pc  = store?.primaryColor   || "#2563eb";
  const sc  = store?.secondaryColor || "#0f172a";
  const ff  = store?.fontFamily     || "Inter";
  const name = store?.name || "المتجر";

  return (
    <div style={{ fontFamily: `'${ff}', sans-serif`, direction: "rtl", background: "#fff" }}>

      {/* Announcement bar */}
      <div className="th-announce" style={{ background: sc }}>
        <div className="th-announce-track">
          {[...Array(6)].map((_, i) => (
            <span key={i} className="th-announce-text" style={{ fontSize: 10, color: "rgba(255,255,255,.55)" }}>
              توصيل لـ 58 ولاية 🇩🇿 &nbsp;·&nbsp; الدفع عند الاستلام 💰 &nbsp;·&nbsp; جودة مضمونة ✅
            </span>
          ))}
        </div>
      </div>

      {/* Navbar */}
      <div className="th-navbar" style={{ padding: "10px 20px", borderBottom: "1px solid #f0f0f0", background: "#fff" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {store?.logo
            ? <img src={store.logo} className="th-nav-logo" style={{ width: 26, height: 26 }} alt="" />
            : <div className="th-nav-letter" style={{ width: 26, height: 26, fontSize: 13, background: pc }}>{name.charAt(0)}</div>
          }
          <span className="th-nav-name" style={{ fontSize: 12 }}>{name}</span>
        </div>
        <div className="th-nav-links">
          {["الرئيسية", "التصنيفات", "اتصل بنا"].map(l => (
            <span key={l} className="th-nav-link">{l}</span>
          ))}
        </div>
        <div className="th-nav-icons">
          <svg width="14" height="14" fill="none" stroke="#555" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          <svg width="14" height="14" fill="none" stroke="#555" strokeWidth="2" viewBox="0 0 24 24"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/></svg>
        </div>
      </div>

      {/* Hero */}
      <div className="th-hero" style={{ height: 200 }}>
        {store?.banner
          ? <img src={store.banner} className="th-hero-img" alt="banner" />
          : <div className="th-hero-placeholder" style={{ height: 200, background: `linear-gradient(135deg, ${pc}22 0%, ${pc}44 100%)` }}>
              <span style={{ fontSize: 36 }}>🖼️</span>
            </div>
        }
        <div className="th-hero-overlay" />
        <div className="th-hero-cta">
          <button className="th-hero-btn" style={{ background: pc, padding: "7px 20px", fontSize: 11 }}>
            🛍️ تسوق الآن
          </button>
        </div>
      </div>

      {/* Trust badges */}
      <div className="th-trust" style={{ gridTemplateColumns: "repeat(3,1fr)", padding: 0 }}>
        {[
          { icon: "🚚", title: "توصيل سريع", sub: "58 ولاية" },
          { icon: "🛡️", title: "جودة مضمونة", sub: "فحص شامل" },
          { icon: "🎧", title: "دعم 24/7", sub: "خدمة العملاء" },
        ].map((b, i) => (
          <div key={i} className="th-trust-item" style={{ padding: "14px 10px" }}>
            <span className="th-trust-icon">{b.icon}</span>
            <p className="th-trust-title" style={{ fontSize: 10, margin: 0 }}>{b.title}</p>
            <p className="th-trust-sub" style={{ fontSize: 9, margin: 0 }}>{b.sub}</p>
          </div>
        ))}
      </div>

      {/* Categories */}
      {categories.length > 0 && (
        <div style={{ padding: "18px 16px 10px" }}>
          <div className="th-section-header" style={{ marginBottom: 12 }}>
            <div>
              <h3 className="th-section-title" style={{ fontSize: 13 }}>التصنيفات</h3>
              <p className="th-section-sub" style={{ fontSize: 10 }}>اعثر على كل ما تريد</p>
            </div>
            <span className="th-view-all" style={{ fontSize: 10, color: pc, borderColor: pc, padding: "3px 10px" }}>عرض الكل ←</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8 }}>
            {categories.slice(0, 3).map(cat => (
              <div key={cat._id} className="th-cat-card">
                {cat.image
                  ? <img src={cat.image} className="th-cat-img" style={{ height: 60 }} alt={cat.name} />
                  : <div className="th-cat-ph" style={{ height: 60, background: pc + "18" }}>📁</div>
                }
                <div style={{ padding: "6px 8px" }}>
                  <p className="th-cat-name" style={{ fontSize: 10, margin: 0 }}>{cat.name}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Products */}
      <div style={{ padding: "14px 16px 20px" }}>
        <div className="th-section-header" style={{ marginBottom: 12 }}>
          <div>
            <h3 className="th-section-title" style={{ fontSize: 13 }}>المنتجات</h3>
            <p className="th-section-sub" style={{ fontSize: 10 }}>أحدث المنتجات المتاحة</p>
          </div>
        </div>
        {products.length > 0 ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8 }}>
            {products.slice(0, 6).map(p => (
              <div key={p._id} className="th-prod-card">
                {p.image
                  ? <img src={p.image} className="th-prod-img" style={{ height: 70 }} alt={p.name} />
                  : <div className="th-prod-ph" style={{ height: 70, fontSize: 22 }}>📦</div>
                }
                <div style={{ padding: "7px 8px 9px" }}>
                  <p className="th-prod-name" style={{ fontSize: 10, margin: "0 0 3px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.name}</p>
                  <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 6 }}>
                    <span className="th-prod-price" style={{ fontSize: 10, color: pc }}>{p.currentPrice?.toLocaleString()} DA</span>
                    {p.oldPrice && <span className="th-prod-old" style={{ fontSize: 9 }}>{p.oldPrice?.toLocaleString()}</span>}
                  </div>
                  <button className="th-prod-btn" style={{ background: sc, padding: "5px 0", fontSize: 9 }}>اطلب الآن</button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: "center", padding: "24px 0", color: "#ccc", fontSize: 11 }}>
            📦 لا توجد منتجات بعد
          </div>
        )}
      </div>

    </div>
  );
}

// ── Mobile store preview ───────────────────────────────────────
function MobileStore({ store, products, categories }) {
  const pc  = store?.primaryColor   || "#2563eb";
  const sc  = store?.secondaryColor || "#0f172a";
  const ff  = store?.fontFamily     || "Inter";
  const name = store?.name || "المتجر";

  return (
    <div style={{ fontFamily: `'${ff}', sans-serif`, direction: "rtl", background: "#fff" }}>

      {/* Announcement bar */}
      <div style={{ background: sc, padding: "5px 0", overflow: "hidden" }}>
        <div className="th-announce-track">
          {[...Array(4)].map((_, i) => (
            <span key={i} style={{ fontSize: 8, color: "rgba(255,255,255,.55)", whiteSpace: "nowrap", fontWeight: 600, marginRight: 32 }}>
              توصيل لـ 58 ولاية 🇩🇿 · الدفع عند الاستلام 💰
            </span>
          ))}
        </div>
      </div>

      {/* Navbar */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 12px", borderBottom: "1px solid #f0f0f0", background: "#fff" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          {store?.logo
            ? <img src={store.logo} style={{ width: 22, height: 22, borderRadius: 5, objectFit: "cover" }} alt="" />
            : <div style={{ width: 22, height: 22, borderRadius: 5, background: pc, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: 11 }}>{name.charAt(0)}</div>
          }
          <span style={{ fontWeight: 700, fontSize: 10, color: "#111" }}>{name}</span>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <svg width="12" height="12" fill="none" stroke="#555" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          <svg width="12" height="12" fill="none" stroke="#555" strokeWidth="2" viewBox="0 0 24 24"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/></svg>
        </div>
      </div>

      {/* Hero */}
      <div style={{ position: "relative", height: 110, overflow: "hidden" }}>
        {store?.banner
          ? <img src={store.banner} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} alt="" />
          : <div style={{ width: "100%", height: "100%", background: `linear-gradient(135deg, ${pc}22 0%, ${pc}44 100%)`, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontSize: 28 }}>🖼️</span>
            </div>
        }
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, transparent 50%, rgba(0,0,0,.5) 100%)" }} />
        <div style={{ position: "absolute", bottom: 10, left: 0, right: 0, textAlign: "center" }}>
          <button style={{ background: pc, color: "#fff", border: "none", borderRadius: 99, padding: "5px 14px", fontSize: 9, fontWeight: 700, fontFamily: "inherit" }}>
            🛍️ تسوق الآن
          </button>
        </div>
      </div>

      {/* Categories */}
      {categories.length > 0 && (
        <div style={{ padding: "12px 10px 6px" }}>
          <p style={{ fontSize: 10, fontWeight: 900, color: "#111", margin: "0 0 8px" }}>التصنيفات</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
            {categories.slice(0, 2).map(cat => (
              <div key={cat._id} style={{ borderRadius: 8, overflow: "hidden", border: "1px solid #eee" }}>
                {cat.image
                  ? <img src={cat.image} style={{ width: "100%", height: 44, objectFit: "cover", display: "block" }} alt={cat.name} />
                  : <div style={{ width: "100%", height: 44, background: pc + "18", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>📁</div>
                }
                <p style={{ fontSize: 9, fontWeight: 700, color: "#111", margin: 0, padding: "4px 6px" }}>{cat.name}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Products */}
      <div style={{ padding: "10px 10px 16px" }}>
        <p style={{ fontSize: 10, fontWeight: 900, color: "#111", margin: "0 0 8px" }}>المنتجات</p>
        {products.length > 0 ? (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
            {products.slice(0, 4).map(p => (
              <div key={p._id} style={{ borderRadius: 8, overflow: "hidden", border: "1px solid #eee", background: "#fff" }}>
                {p.image
                  ? <img src={p.image} style={{ width: "100%", height: 56, objectFit: "cover", display: "block" }} alt={p.name} />
                  : <div style={{ width: "100%", height: 56, background: "#f8f9fa", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>📦</div>
                }
                <div style={{ padding: "5px 7px 7px" }}>
                  <p style={{ fontSize: 9, fontWeight: 700, color: "#111", margin: "0 0 3px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.name}</p>
                  <p style={{ fontSize: 9, fontWeight: 800, color: pc, margin: "0 0 5px" }}>{p.currentPrice?.toLocaleString()} DA</p>
                  <button style={{ width: "100%", background: sc, color: "#fff", border: "none", borderRadius: 6, padding: "4px 0", fontSize: 8, fontWeight: 700, fontFamily: "inherit" }}>اطلب</button>
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

  useEffect(() => {
    const t = token();
    Promise.all([
      fetch(`${API()}/api/stores/my-store`,         { headers: { Authorization: `Bearer ${t}` } }).then(r => r.json()),
      fetch(`${API()}/api/products/my-products`,    { headers: { Authorization: `Bearer ${t}` } }).then(r => r.json()),
      fetch(`${API()}/api/categories/my-categories`,{ headers: { Authorization: `Bearer ${t}` } }).then(r => r.json()),
    ])
      .then(([storeData, prodsData, catsData]) => {
        if (storeData.hasStore) setStore(storeData.store);
        if (Array.isArray(prodsData))   setProducts(prodsData);
        if (Array.isArray(catsData))    setCategories(catsData);
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

  return (
    <div className="th-page" dir="ltr">
      <style>{CSS}</style>

      <div className="th-card">

        {/* ══ PREVIEW AREA ══ */}
        <div className="th-preview-area">

          {/* ── Desktop ── */}
          <div className="th-desktop">
            <div className="th-chrome">
              <div className="th-dot" style={{ background: "#ff5f57" }} />
              <div className="th-dot" style={{ background: "#febc2e" }} />
              <div className="th-dot" style={{ background: "#28c840" }} />
              <div className="th-url-bar">
                <svg width="9" height="9" fill="none" stroke="#9ca3af" strokeWidth="2" viewBox="0 0 24 24">
                  <rect x="3" y="11" width="18" height="11" rx="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
                {window.location.hostname}/store/{store?.slug || "my-store"}
              </div>
            </div>
            <div className="th-desktop-store">
              <DesktopStore store={store} products={products} categories={categories} />
            </div>
          </div>

          {/* ── Mobile ── */}
          <div className="th-mobile-wrap">
            <div className="th-mobile-device">
              <div className="th-mobile-notch" />
              <div className="th-mobile-screen">
                <MobileStore store={store} products={products} categories={categories} />
              </div>
            </div>
          </div>

        </div>

        {/* ══ FOOTER BAR ══ */}
        <div className="th-footer">

          <div className="th-footer-left">
            <div className="th-footer-name-row">
              <span className="th-footer-name">
                {store?.name ? `${store.name}'s theme` : "My Theme"}
              </span>
              <span className="th-badge-current">Current theme</span>
            </div>
            {savedDate && (
              <span className="th-footer-saved">Last saved: {savedDate}</span>
            )}
          </div>

          <div className="th-footer-actions">
            {storeUrl && (
              <a href={storeUrl} target="_blank" rel="noreferrer" className="th-btn-view">
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                  <circle cx="12" cy="12" r="3"/>
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
      </div>
    </div>
  );
}

export default Theme;