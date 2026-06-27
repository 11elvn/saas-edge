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
  background: #f5f5f7;
  padding: 0;
  overflow: hidden;
}

/* ══ MAIN PREVIEW CARD ══ */
.th-card {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  height: 100%;
}

/* ══ PREVIEW AREA ══ */
.th-preview-area {
  flex: 1;
  display: flex;
  flex-direction: row;
  gap: 16px;
  overflow: hidden;
  background: #f5f5f7;
  padding: 32px 32px 32px 32px;
  min-height: 0;
}

/* ══ DESKTOP BROWSER ══ */
.th-desktop {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 0 0 1px rgba(0,0,0,.1), 0 4px 32px rgba(0,0,0,.10);
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

/* ══ MOBILE FRAME ══ */
.th-mobile-wrap {
  width: 200px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  min-height: 0;
  max-height: 100%;
}
.th-mobile-device {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 0 0 1px rgba(0,0,0,.1), 0 4px 32px rgba(0,0,0,.10);
  overflow: hidden;
  min-height: 0;
}
.th-mobile-status {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px 6px;
  background: #ebebeb;
  border-bottom: 1px solid #ddd;
  flex-shrink: 0;
}
.th-mobile-time { color: #555; font-size: 9px; font-weight: 700; font-family: monospace; }
.th-mobile-icons { display: flex; gap: 3px; align-items: center; }
.th-mobile-screen {
  flex: 1;
  overflow-y: scroll;
  overflow-x: hidden;
  background: #fff;
  direction: rtl;
}
.th-mobile-screen::-webkit-scrollbar { width: 4px; }
.th-mobile-screen::-webkit-scrollbar-track { background: #f1f1f1; }
.th-mobile-screen::-webkit-scrollbar-thumb { background: #c1c1c1; border-radius: 99px; }
.th-mobile-screen::-webkit-scrollbar-thumb:hover { background: #a1a1a1; }

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

/* ══ FOOTER BAR ══ */
.th-footer {
  display: flex; align-items: center;
  justify-content: space-between;
  padding: 14px 24px;
  background: #fff;
  border-top: 1px solid #e5e7eb;
  flex-wrap: wrap; gap: 12px;
  flex-shrink: 0;
}
.th-footer-left { display: flex; flex-direction: column; gap: 3px; }
.th-footer-name-row { display: flex; align-items: center; gap: 8px; }
.th-footer-name { font-size: .92rem; font-weight: 700; color: #111827; }
.th-badge-current {
  font-size: .68rem; font-weight: 600;
  padding: 3px 10px; border-radius: 99px;
  background: #dcfce7; color: #16a34a;
  border: 1px solid #bbf7d0;
  display: inline-flex; align-items: center; gap: 5px;
}
.th-badge-current::before {
  content: ""; width: 6px; height: 6px;
  border-radius: 50%; background: #16a34a; display: block;
}
.th-footer-saved { font-size: .74rem; color: #9ca3af; }
.th-footer-actions { display: flex; gap: 8px; align-items: center; }

.th-btn-edit {
  display: inline-flex; align-items: center; gap: 7px;
  padding: 9px 20px; border-radius: 9px; border: none;
  background: #111827; color: #fff;
  font-size: .83rem; font-weight: 700;
  cursor: pointer; font-family: inherit; transition: opacity .15s;
}
.th-btn-edit:hover { opacity: .85; }
.th-btn-view {
  display: inline-flex; align-items: center; gap: 7px;
  padding: 9px 18px; border-radius: 9px;
  border: 1px solid #e5e7eb; background: #fff;
  color: #374151; font-size: .83rem; font-weight: 600;
  cursor: pointer; font-family: inherit; transition: all .15s;
  text-decoration: none;
}
.th-btn-view:hover { background: #f9fafb; border-color: #d1d5db; }

/* Loading */
.th-loading {
  display: flex; flex-direction: column; align-items: center;
  justify-content: center; height: 60vh; gap: 14px;
  color: #9ca3af; font-size: .85rem;
}
.th-spinner {
  width: 28px; height: 28px;
  border: 3px solid #f0f0f0; border-top-color: #111827;
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

  return (
    <div className="th-page" dir="ltr">
      <style>{CSS}</style>

      <div className="th-card">

        {/* ══ PREVIEW AREA ══ */}
        <div className="th-preview-area">

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

          {/* ── Mobile Frame ── */}
          <div className="th-mobile-wrap">
            <div className="th-mobile-device">
              {/* Mobile chrome bar - like desktop */}
              <div className="th-mobile-status">
                <span className="th-mobile-time">{store?.slug || "my-store"}</span>
                <div className="th-mobile-icons">
                  <svg width="10" height="10" fill="none" stroke="#666" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                  <svg width="10" height="10" fill="none" stroke="#666" strokeWidth="2" viewBox="0 0 24 24"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/></svg>
                </div>
              </div>
              {/* Screen */}
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

      </div>
    </div>
  );
}

export default Theme;