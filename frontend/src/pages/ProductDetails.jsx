// ============================================================
// 📁 pages/PublicStore.jsx — Day 23 Redesign (bat-caveee style)
// ============================================================

import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ALGERIAN_CITIES } from "../constants/algerianCities";
import StoreNavbar from "../components/StoreNavbar";
import StoreFooter from "../components/StoreFooter";

const API = () => import.meta.env.VITE_API_URL;
const DEFAULT_IMG = "https://images.unsplash.com/photo-1531403009284-440f080d1e12?q=80&w=600";

// ── Google Font loader ──────────────────────────────────────
function loadFont(font) {
  const id = `font-${font}`;
  if (document.getElementById(id)) return;
  const link = document.createElement("link");
  link.id = id;
  link.rel = "stylesheet";
  link.href = `https://fonts.googleapis.com/css2?family=${font.replace(/ /g, "+")}:wght@400;500;600;700;800;900&display=swap`;
  document.head.appendChild(link);
}

// ── CSS inject ──────────────────────────────────────────────
const CSS = `
@keyframes ps-fade-up {
  from { opacity:0; transform:translateY(24px); }
  to   { opacity:1; transform:translateY(0); }
}
@keyframes ps-slide-in {
  from { transform:translateX(100%); }
  to   { transform:translateX(0); }
}
@keyframes ps-marquee {
  from { transform:translateX(0); }
  to   { transform:translateX(-50%); }
}
@keyframes ps-spin { to { transform:rotate(360deg); } }

.ps-fade-up  { animation: ps-fade-up .55s ease both; }
.ps-delay-1  { animation-delay:.08s; }
.ps-delay-2  { animation-delay:.16s; }
.ps-delay-3  { animation-delay:.24s; }
.ps-delay-4  { animation-delay:.32s; }

.ps-drawer          { animation: ps-slide-in .3s cubic-bezier(.32,.72,0,1) both; }
.ps-marquee-track   { animation: ps-marquee 18s linear infinite; }
.ps-spinner         { animation: ps-spin .7s linear infinite; }

.ps-card {
  transition: transform .25s ease, box-shadow .25s ease, border-color .25s ease;
}
.ps-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 16px 40px rgba(0,0,0,.18);
}
.ps-cat-chip {
  transition: background .2s, color .2s, border-color .2s;
  white-space: nowrap;
  cursor: pointer;
}
.ps-btn-order {
  position: relative;
  overflow: hidden;
  transition: transform .15s, box-shadow .15s;
}
.ps-btn-order:not(:disabled):hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(0,0,0,.35);
}
.ps-btn-order:not(:disabled):active { transform: scale(.97); }
.ps-btn-order::after {
  content:'';
  position:absolute;inset:0;
  background:rgba(255,255,255,.12);
  opacity:0; transition:opacity .2s;
}
.ps-btn-order:not(:disabled):hover::after { opacity:1; }

.ps-whatsapp {
  position: fixed;
  bottom: 24px;
  left: 24px;
  z-index: 999;
  width: 54px; height: 54px;
  border-radius: 50%;
  background: #25D366;
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 4px 20px rgba(37,211,102,.45);
  transition: transform .2s, box-shadow .2s;
}
.ps-whatsapp:hover {
  transform: scale(1.1);
  box-shadow: 0 6px 28px rgba(37,211,102,.6);
}
.ps-overlay {
  position:fixed;inset:0;
  background:rgba(0,0,0,.55);
  z-index:998;
  backdrop-filter: blur(2px);
}
/* Hide scrollbar for cat strip */
.ps-cat-strip::-webkit-scrollbar { display:none; }
.ps-cat-strip { -ms-overflow-style:none; scrollbar-width:none; }
`;

function injectCSS() {
  if (document.getElementById("ps-styles")) return;
  const s = document.createElement("style");
  s.id = "ps-styles";
  s.textContent = CSS;
  document.head.appendChild(s);
}

// ── Icons ───────────────────────────────────────────────────
const IconMenu = () => (
  <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24">
    <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
  </svg>
);
const IconX = () => (
  <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);
const IconCart = () => (
  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24">
    <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/>
  </svg>
);
const IconChevron = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24">
    <polyline points="9 18 15 12 9 6"/>
  </svg>
);
const IconTruck   = () => <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><rect x="1" y="3" width="15" height="13" rx="1"/><path d="M16 8h4l3 4v5h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>;
const IconShield  = () => <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>;
const IconHeadset = () => <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M3 18v-6a9 9 0 0118 0v6"/><path d="M21 19a2 2 0 01-2 2h-1a2 2 0 01-2-2v-3a2 2 0 012-2h3z"/><path d="M3 19a2 2 0 002 2h1a2 2 0 002-2v-3a2 2 0 00-2-2H3z"/></svg>;
const IconWA = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 00-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

// ── Drawer (mobile menu) ────────────────────────────────────
function Drawer({ open, onClose, logo, storeName, primaryColor, onNavigate }) {
  if (!open) return null;
  return (
    <>
      <div className="ps-overlay" onClick={onClose} />
      <div
        className="ps-drawer"
        style={{
          position: "fixed", top: 0, right: 0, bottom: 0, width: "280px",
          background: "#fff", zIndex: 999, display: "flex", flexDirection: "column",
          boxShadow: "-8px 0 40px rgba(0,0,0,.2)",
        }}
        dir="rtl"
      >
        {/* Header */}
        <div style={{ padding: "20px 20px 16px", borderBottom: "1px solid #f0f0f0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {logo
              ? <img src={logo} alt="logo" style={{ width: 36, height: 36, borderRadius: 8, objectFit: "cover" }} />
              : <div style={{ width: 36, height: 36, borderRadius: 8, background: primaryColor, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: 16 }}>{storeName?.charAt(0) || "م"}</div>
            }
            <span style={{ fontWeight: 700, fontSize: 15, color: "#111" }}>{storeName}</span>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#6b7280", padding: 4 }}>
            <IconX />
          </button>
        </div>

        {/* Search */}
        <div style={{ padding: "16px 20px", borderBottom: "1px solid #f0f0f0" }}>
          <div style={{ background: "#f9fafb", borderRadius: 10, padding: "10px 14px", display: "flex", alignItems: "center", gap: 8, border: "1px solid #e5e7eb" }}>
            <svg width="16" height="16" fill="none" stroke="#9ca3af" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            <input placeholder="البحث عن منتج" style={{ border: "none", background: "none", outline: "none", fontSize: 14, color: "#374151", width: "100%", textAlign: "right" }} />
          </div>
        </div>

        {/* Nav links */}
        {["الصفحة الرئيسية", "التصنيفات", "اتصل بنا"].map((item, i) => (
          <button
            key={i}
            onClick={() => { onNavigate(item); onClose(); }}
            style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "16px 20px", border: "none", borderBottom: "1px solid #f9fafb",
              background: "none", cursor: "pointer", fontSize: 15, fontWeight: 600, color: "#111",
              fontFamily: "inherit",
            }}
          >
            {item}
            <IconChevron />
          </button>
        ))}
      </div>
    </>
  );
}

// ── MAIN ─────────────────────────────────────────────────────
function PublicStore() {
  const { slug } = useParams();
  const navigate  = useNavigate();

  const [store,      setStore]      = useState(null);
  const [products,   setProducts]   = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCat,  setActiveCat]  = useState("all");
  const [loading,    setLoading]    = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const productsRef = useRef(null);

  // derived theme values
  const primary   = store?.primaryColor   || "#111827";
  const secondary = store?.secondaryColor || "#1f2937";
  const font      = store?.fontFamily     || "Cairo";

  useEffect(() => {
    injectCSS();
    loadFont("Cairo");
    loadFont("Poppins");
  }, []);

  useEffect(() => {
    if (font) loadFont(font);
  }, [font]);

  useEffect(() => {
    if (!slug) return;
    (async () => {
      try {
        const res  = await fetch(`${API()}/api/stores/public/${slug}`);
        const data = await res.json();
        if (data.store) {
          setStore(data.store);
          // fetch categories
          const catRes  = await fetch(`${API()}/api/categories/public/${data.store._id}`);
          const catData = await catRes.json();
          if (Array.isArray(catData)) setCategories(catData);
        }
        if (Array.isArray(data.products)) setProducts(data.products);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, [slug]);

  const filteredProducts = activeCat === "all"
    ? products
    : products.filter(p => {
        const catId = p.categoryId?._id
          ? String(p.categoryId._id)
          : p.categoryId ? String(p.categoryId) : null;
        return catId === String(activeCat);
      });

  const handleDrawerNav = (item) => {
    if (item === "التصنيفات") {
      document.getElementById("ps-categories")?.scrollIntoView({ behavior: "smooth" });
    } else if (item === "اتصل بنا") {
      if (store?.whatsappNumber) window.open(`https://wa.me/${store.whatsappNumber}`, "_blank");
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // ── Loading ───────────────────────────────────────────────
  if (loading) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#fff" }}>
      <div style={{ textAlign: "center" }}>
        <div className="ps-spinner" style={{ width: 36, height: 36, border: "3px solid #eee", borderTopColor: "#111", borderRadius: "50%", margin: "0 auto 16px" }} />
        <p style={{ color: "#555", fontSize: 13, letterSpacing: 2, textTransform: "uppercase" }}>جاري التحميل</p>
      </div>
    </div>
  );

  const storeName = store?.name || "المتجر";
  const logo      = store?.logo || "";
  const banner    = store?.banner || "";
  const phone     = store?.whatsappNumber || "";

  return (
    <div style={{ minHeight: "100vh", background: "#fff", color: "#111", fontFamily: `'${font}', 'Cairo', sans-serif`, direction: "rtl" }}>

      {/* ── Announcement Bar ── */}
      <div style={{ background: "#111", borderBottom: "1px solid #222", overflow: "hidden", padding: "9px 0" }}>
        <div className="ps-marquee-track" style={{ display: "flex", gap: 64, width: "max-content" }}>
          {[...Array(6)].map((_, i) => (
            <span key={i} style={{ fontSize: 12, fontWeight: 600, letterSpacing: 1.5, color: "#555", whiteSpace: "nowrap" }}>
              توصيل لـ 58 ولاية 🇩🇿 &nbsp;·&nbsp; الدفع عند الاستلام 💰 &nbsp;·&nbsp; جودة مضمونة ✅
            </span>
          ))}
        </div>
      </div>

      {/* ── Navbar ── */}
      <StoreNavbar
        store={store}
        slug={slug}
        links={[
          { label: "الصفحة الرئيسية", action: () => window.scrollTo({ top: 0, behavior: "smooth" }) },
          { label: "التصنيفات",       action: () => navigate(`/store/${slug}/collections`) },
          { label: "اتصل بنا",        action: () => phone && window.open(`https://wa.me/${phone}`, "_blank") },
        ]}
      />

      {/* ── Hero / Banner ── */}
      <section style={{ position: "relative", height: "clamp(300px, 52vw, 580px)", overflow: "hidden" }}>
        {banner ? (
          <img src={banner} alt="banner" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <div style={{
            width: "100%", height: "100%",
            background: `linear-gradient(135deg, #f8f9fa 0%, ${primary}18 50%, ${secondary}28 100%)`,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <div style={{ textAlign: "center" }}>
              <p style={{ fontSize: "clamp(2rem,6vw,4.5rem)", fontWeight: 900, color: "#fff", letterSpacing: -1, lineHeight: 1.1 }}>
                {storeName}
              </p>
              <p style={{ color: "#555", fontSize: 16, marginTop: 12, letterSpacing: 1 }}>اكتشف أفضل المنتجات</p>
            </div>
          </div>
        )}
        {/* Dark overlay gradient */}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, transparent 50%, rgba(0,0,0,.55) 100%)" }} />

        {/* CTA */}
        <div style={{ position: "absolute", bottom: 36, right: 0, left: 0, textAlign: "center" }}>
          <button
            onClick={() => productsRef.current?.scrollIntoView({ behavior: "smooth" })}
            className="ps-btn-order"
            style={{
              background: primary, color: "#fff",
              border: "none", borderRadius: 50, padding: "13px 32px",
              fontSize: 15, fontWeight: 700, cursor: "pointer",
              fontFamily: "inherit", letterSpacing: .5,
              boxShadow: `0 4px 24px ${primary}55`,
            }}
          >
            <span style={{ marginLeft: 8 }}>🛍️</span> تسوق الآن
          </button>
        </div>
      </section>

      {/* ── Trust Badges ── */}
      <section style={{ background: "#fff", borderTop: "1px solid #1a1a1a", borderBottom: "1px solid #222" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", padding: "28px 24px", display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
          {[
            { icon: <IconTruck />,   title: "توصيل سريع وآمن",   sub: "لجميع الولايات الـ 58" },
            { icon: <IconShield />,  title: "جودة مضمونة",        sub: "فحص شامل لكل منتج"    },
            { icon: <IconHeadset />, title: "خدمة العملاء",       sub: "دعم على مدار 24 ساعة" },
          ].map((b, i) => (
            <div key={i} className={`ps-fade-up ps-delay-${i+1}`} style={{
              background: "#161616", border: "1px solid #eee",
              borderRadius: 14, padding: "20px 18px",
              display: "flex", flexDirection: "column", alignItems: "center", gap: 10, textAlign: "center",
            }}>
              <div style={{ color: primary }}>{b.icon}</div>
              <p style={{ fontSize: 14, fontWeight: 700, color: "#111", margin: 0 }}>{b.title}</p>
              <p style={{ fontSize: 12, color: "#555", margin: 0 }}>{b.sub}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Categories ── */}
      {categories.length > 0 && (
        <section id="ps-categories" style={{ maxWidth: 980, margin: "0 auto", padding: "52px 24px 0" }}>
          {/* Header row */}
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 28 }}>
            <div>
              <h2 style={{ fontSize: "clamp(1.3rem,3vw,1.8rem)", fontWeight: 900, color: "#111", margin: "0 0 6px" }}>التصنيفات</h2>
              <p style={{ color: "#888", fontSize: 13, margin: 0 }}>اعثر على كل ما تريد</p>
            </div>
            <button
              onClick={() => navigate(`/store/${slug}/collections`)}
              style={{
                background: "none", border: `1.5px solid ${primary}`,
                color: primary, padding: "7px 16px", borderRadius: 99,
                fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
              }}
            >عرض الكل ←</button>
          </div>

          {/* Big category cards — bat-caveee style */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
            gap: 16,
          }}>
            {categories.slice(0, 6).map(cat => (
              <div
                key={cat._id}
                onClick={() => navigate(`/store/${slug}/collections/${cat._id}`)}
                style={{
                  borderRadius: 16, overflow: "hidden", cursor: "pointer",
                  border: "1px solid #eee", background: "#fff",
                  boxShadow: "0 2px 8px rgba(0,0,0,.05)",
                  transition: "transform .25s, box-shadow .25s",
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 12px 32px rgba(0,0,0,.1)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,.05)"; }}
              >
                {/* Big image */}
                <div style={{ height: 200, overflow: "hidden", background: "#f9fafb" }}>
                  {cat.image ? (
                    <img
                      src={cat.image} alt={cat.name}
                      style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform .5s" }}
                      onMouseEnter={e => e.target.style.transform = "scale(1.06)"}
                      onMouseLeave={e => e.target.style.transform = "scale(1)"}
                    />
                  ) : (
                    <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 44, color: "#e5e7eb" }}>📁</div>
                  )}
                </div>
                {/* Name */}
                <div style={{ padding: "14px 16px" }}>
                  <span style={{ fontWeight: 700, fontSize: 15, color: "#111" }}>{cat.name}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Products Grid ── */}
      <section ref={productsRef} style={{ maxWidth: 980, margin: "0 auto", padding: "40px 24px 80px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
          <h2 style={{ fontSize: "clamp(1.3rem,3vw,1.7rem)", fontWeight: 800, color: "#fff", margin: 0 }}>
            {activeCat === "all" ? "جميع المنتجات" : categories.find(c => c._id === activeCat)?.name || "المنتجات"}
          </h2>
          <span style={{ fontSize: 13, color: "#555", background: "#161616", border: "1px solid #eee", padding: "5px 14px", borderRadius: 50 }}>
            {filteredProducts.length} منتج
          </span>
        </div>

        {filteredProducts.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 0", color: "#888" }}>
            <p style={{ fontSize: 40, marginBottom: 12 }}>🛍️</p>
            <p style={{ fontSize: 14 }}>لا توجد منتجات في هذا القسم</p>
          </div>
        ) : (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
            gap: 20,
          }}>
            {filteredProducts.map((product, idx) => {
              const img = (product.images?.[0] || product.image || DEFAULT_IMG);
              const outOfStock = product.stock === 0;
              return (
                <div
                  key={product._id}
                  className={`ps-card ps-fade-up`}
                  style={{
                    animationDelay: `${(idx % 6) * 0.07}s`,
                    background: "#fff",
                    border: "1px solid #eee",
                    borderRadius: 18,
                    overflow: "hidden",
                    display: "flex", flexDirection: "column",
                    cursor: "pointer",
                    opacity: outOfStock ? 0.6 : 1,
                  }}
                  onClick={() => navigate(`/store/${slug}/product/${product._id}`)}
                >
                  {/* Image */}
                  <div style={{ position: "relative", height: 220, overflow: "hidden", background: "#fff" }}>
                    <img
                      src={img}
                      alt={product.name}
                      onError={e => { e.target.onerror = null; e.target.src = DEFAULT_IMG; }}
                      style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform .5s ease" }}
                      onMouseEnter={e => e.target.style.transform = "scale(1.06)"}
                      onMouseLeave={e => e.target.style.transform = "scale(1)"}
                    />
                    {/* Badges */}
                    {product.oldPrice && !outOfStock && (
                      <span style={{
                        position: "absolute", top: 12, right: 12,
                        background: "#ef4444", color: "#fff",
                        fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 99,
                        letterSpacing: .5,
                      }}>تخفيض</span>
                    )}
                    {outOfStock && (
                      <div style={{
                        position: "absolute", inset: 0,
                        background: "rgba(0,0,0,.65)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}>
                        <span style={{ background: "#111", color: "#fff", fontWeight: 800, fontSize: 12, padding: "6px 18px", borderRadius: 99 }}>
                          نفد من المخزون
                        </span>
                      </div>
                    )}
                    {/* Stock warning */}
                    {!outOfStock && product.stock <= 5 && (
                      <span style={{
                        position: "absolute", bottom: 10, right: 10,
                        background: "rgba(245,158,11,.9)", color: "#fff",
                        fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 99,
                      }}>⚠️ آخر {product.stock} قطع</span>
                    )}
                  </div>

                  {/* Info */}
                  <div style={{ padding: "16px 16px 18px", display: "flex", flexDirection: "column", flex: 1 }}>
                    <p style={{ fontSize: 14, fontWeight: 700, color: "#111", margin: "0 0 6px", lineHeight: 1.4 }}>
                      {product.name}
                    </p>
                    <p style={{ fontSize: 12, color: "#555", margin: "0 0 14px", lineHeight: 1.6, flex: 1 }}>
                      {product.description?.slice(0, 80)}{product.description?.length > 80 ? "..." : ""}
                    </p>

                    {/* Price */}
                    <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 14 }}>
                      <span style={{ fontSize: 18, fontWeight: 800, color: "#111" }}>
                        {product.currentPrice.toLocaleString()} <span style={{ fontSize: 12, fontWeight: 600, color: "#555" }}>د.ج</span>
                      </span>
                      {product.oldPrice && (
                        <span style={{ fontSize: 13, color: "#888", textDecoration: "line-through" }}>
                          {product.oldPrice.toLocaleString()}
                        </span>
                      )}
                    </div>

                    {/* CTA */}
                    <button
                      className="ps-btn-order"
                      disabled={outOfStock}
                      onClick={e => { e.stopPropagation(); navigate(`/store/${slug}/product/${product._id}`); }}
                      style={{
                        width: "100%", padding: "11px 0", borderRadius: 12,
                        border: "none", cursor: outOfStock ? "not-allowed" : "pointer",
                        background: outOfStock ? "#1f1f1f" : `linear-gradient(135deg, ${primary}, ${secondary})`,
                        color: outOfStock ? "#444" : "#fff",
                        fontSize: 13, fontWeight: 700, fontFamily: "inherit",
                        display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
                      }}
                    >
                      <IconCart />
                      {outOfStock ? "نفد المخزون" : "اطلب الآن"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ── Footer ── */}
      <StoreFooter store={store} slug={slug} light />

      {/* ── WhatsApp Floating ── */}
      {phone && (
        <a href={`https://wa.me/${phone}`} target="_blank" rel="noreferrer" className="ps-whatsapp" title="تواصل معنا على واتساب">
          <IconWA />
        </a>
      )}

      {/* Responsive overrides */}
      <style>{`
        @media (max-width: 768px) {
          .ps-desktop-nav { display: none !important; }
          .ps-mobile-menu { display: flex !important; }
        }
        @media (min-width: 769px) {
          .ps-mobile-menu { display: none !important; }
        }
      `}</style>

    </div>
  );
}

export default PublicStore;