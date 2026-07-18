// ============================================================
// 📁 pages/PublicStore.jsx — Day 23 Redesign (bat-caveee style)
// ============================================================

import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
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
.ps-card-cta {
  opacity: 0;
  transform: translateY(8px);
  transition: opacity .22s ease, transform .22s ease;
}
.ps-card:hover .ps-card-cta {
  opacity: 1;
  transform: translateY(0);
}
@media (hover: none) {
  .ps-card-cta { opacity: 1; transform: translateY(0); }
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
  s.textContent = CSS + PREVIEW_CSS;
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

// ── DEFAULT THEME CONFIG (fallback) ──────────────────────────
const DEFAULT_TC = {
  sections: [
    { id:"announcement", type:"announcement", enabled:true,  settings:{ message:"توصيل لجميع ولايات الجزائر 🇩🇿 · الدفع عند الاستلام 💰", bgColor:"#111827", textColor:"#ffffff", animation:true,  showClose:false } },
    { id:"header",       type:"header",       enabled:true,  settings:{ showSearch:true, showCart:true, sticky:true } },
    { id:"hero",         type:"hero",         enabled:true,  settings:{ image:"", title:"", subtitle:"اكتشف أفضل المنتجات", ctaText:"تسوق الآن", ctaLink:"#products", ctaColor:"", overlayOpacity:50, height:"large", textAlign:"center" } },
    { id:"trust", type:"trust", enabled:true, settings:{ layout:"row", badges:[ {id:"cod",enabled:true,title:"دفع عند الاستلام",sub:"دفع آمن وسهل"}, {id:"shipping",enabled:true,title:"توصيل سريع",sub:"لجميع ولايات الجزائر"}, {id:"return",enabled:true,title:"إرجاع مجاني",sub:"خلال 7 أيام"}, {id:"support",enabled:true,title:"دعم 24/7",sub:"نحن هنا لمساعدتك"}, {id:"secure",enabled:true,title:"متجر موثوق",sub:"آلاف العملاء الراضين"} ], bgColor:"#ffffff" } },
    { id:"collection",   type:"collection",   enabled:true,  settings:{ title:"أحدث المنتجات", titleAlign:"right", selectionMode:"all", productsShown:8, carouselMode:false, columns:3, imageRatio:"1:1", showBadge:true, showRating:false, showViewAll:true, viewAllText:"عرض الكل", viewAllStyle:"link", infiniteScroll:false } },
    { id:"categories",   type:"categories",   enabled:true,  settings:{ title:"التصنيفات", subtitle:"اعثر على كل ما تريد", titleAlign:"right", displayStyle:"grid", maxItems:6 } },
    { id:"footer",       type:"footer",       enabled:true,  settings:{ copyright:"© 2025 اسم متجرك", showNewsletter:true, termsText:"الشروط والسياسات", showSocials:true, socials:{ facebook:"", instagram:"", youtube:"", tiktok:"", twitter:"", whatsapp:"" } } },
  ],
  styles: { primaryColor:"#2563eb", secondaryColor:"#0f172a", fontFamily:"Cairo", borderRadius:"medium", buttonStyle:"filled" },
};

// helper — بحث في sections
const sec = (tc, type) => tc?.sections?.find(s => s.type === type);

// ── اسماء الـ sections للـ label ──────────────────────────────
const SECTION_LABELS = {
  announcement: "Announcement Bar",
  header:       "Header",
  hero:         "Hero Banner",
  trust:        "Trust Badges",
  collection:   "Product Collection",
  categories:   "Categories",
  footer:       "Footer",
};

// ── CSS للـ preview overlays ──────────────────────────────────
const PREVIEW_CSS = `
.ps-section-wrapper {
  position: relative;
}

/* Border أزرق كامل حول الـ section المختار فقط */
.ps-section-wrapper--highlighted {
  outline: 2px solid #2563eb;
  outline-offset: -2px;
  position: relative;
}

/* Label اسم الـ section */
.ps-section-label {
  position: fixed;
  top: 8px;
  left: 8px;
  z-index: 9999;
  background: #2563eb;
  color: #fff;
  font-size: 11px;
  font-weight: 700;
  padding: 3px 10px;
  border-radius: 6px;
  pointer-events: none;
  font-family: 'Inter', sans-serif;
  letter-spacing: .3px;
  white-space: nowrap;
  box-shadow: 0 2px 8px rgba(37,99,235,.35);
}
.ps-section-label--active {
  background: #2563eb;
}

/* زر + أسفل الـ section المختار */
.ps-add-below {
  position: absolute;
  bottom: -14px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 101;
  display: flex;
  align-items: center;
  justify-content: center;
}
.ps-add-below__btn {
  width: 28px; height: 28px;
  border-radius: 50%;
  background: #2563eb;
  border: 2px solid #fff;
  color: #fff;
  font-size: 18px;
  font-weight: 700;
  line-height: 1;
  display: flex; align-items: center; justify-content: center;
  cursor: not-allowed;
  box-shadow: 0 2px 8px rgba(37,99,235,.45);
}
`;

// ── SectionWrapper — يلف كل section بـ label + border + زر + في preview mode ──
function SectionWrapper({ type, isPreview, isHighlighted, children, style = {} }) {
  if (!isPreview) return <div style={style} data-section={type}>{children}</div>;

  // ✦ عند كليك على أي مكان في الـ section → نرسل للـ ThemeEdit باش يفتح settings
  const handleClick = () => {
    window.parent.postMessage({ type: "SECTION_CLICK", sectionType: type }, "*");
  };

  return (
    <div
      style={{ ...style, position: "relative", cursor: "pointer" }}
      data-section={type}
      onClick={handleClick}
      className={`ps-section-wrapper${isHighlighted ? " ps-section-wrapper--highlighted" : ""}`}
    >
      {/* ── Label — اسم الـ section (يظهر فقط عند highlight) ── */}
      {isHighlighted && (
        <div className="ps-section-label ps-section-label--active">
          {SECTION_LABELS[type] || type}
        </div>
      )}
      {children}
      {/* ── زر + أسفل الـ section (يظهر فقط عند highlight) ── */}
      {isHighlighted && (
        <div className="ps-add-below">
          <button className="ps-add-below__btn" title="Add section" disabled>+</button>
        </div>
      )}
    </div>
  );
}

// ── AddBetween — محذوف من الـ preview (لا يظهر شي بين sections) ──
function AddBetween({ isPreview }) {
  return null;
}

// ── MAIN ─────────────────────────────────────────────────────
function PublicStore() {
  const { slug } = useParams();
  const navigate  = useNavigate();
  const location  = useLocation();
  // ✦ preview mode — نشغّلوه فقط من داخل ThemeEdit iframe
  const isPreview = new URLSearchParams(location.search).get("preview") === "1";

  const [store,      setStore]      = useState(null);
  const [products,   setProducts]   = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCat,  setActiveCat]  = useState("all");
  const [loading,    setLoading]    = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  // ✦ themeConfig — يُحدَّث live من postMessage (page builder)
  const [themeConfig, setThemeConfig] = useState(null);
  // ✦ highlighted section type من page builder
  const [highlightedSection, setHighlightedSection] = useState(null);

  const productsRef = useRef(null);
  const loadMoreRef = useRef(null);
  const [visibleCount, setVisibleCount] = useState(null); // ✦ يُهيّأ بحسب productsShown عند توفر إعدادات collection

  // ✦ Listen for live updates from ThemeEdit (iframe postMessage)
  useEffect(() => {
    const handler = (e) => {
      if (e.data?.type === "THEME_UPDATE" && e.data.themeConfig) {
        setThemeConfig(e.data.themeConfig);
      }
      // ✦ تحديث فوري لاسم/لوجو المتجر من page builder (preview بدون حفظ)
      if (e.data?.type === "STORE_UPDATE" && e.data.store) {
        setStore(prev => (prev ? { ...prev, ...e.data.store } : prev));
      }
      // ✦ Highlight section في الـ preview
      if (e.data?.type === "HIGHLIGHT_SECTION") {
        setHighlightedSection(e.data.sectionType || null);
      }
      // ✦ Scroll لـ section معين من الـ left panel
      if (e.data?.type === "SCROLL_TO_SECTION") {
        const type = e.data.sectionType;
        // كل section عنده data-section attribute نحوسو عليه
        const el = document.querySelector(`[data-section="${type}"]`);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, []);

  // ✦ الـ config الفعلي — إذا وصل من postMessage استعمله، وإلا استعمل ما في store
  const rawTc = themeConfig || (store?.themeConfig?.sections ? store.themeConfig : DEFAULT_TC);

  // نفرض الـ 5 badges الثابتة على Trust Badges (نحافظ على enabled/title/sub القديمة لو متطابقة بالـ id)
  const tc = (() => {
    if (!rawTc?.sections) return rawTc;
    const FIXED_BADGES = DEFAULT_TC.sections.find(s => s.type === "trust")?.settings?.badges || [];
    return {
      ...rawTc,
      sections: rawTc.sections.map(sec => {
        if (sec.type !== "trust") return sec;
        const oldBadges = sec.settings?.badges || [];
        const badges = FIXED_BADGES.map(fb => {
          const old = oldBadges.find(b => b.id === fb.id);
          return old ? { ...fb, enabled: old.enabled, title: old.title, sub: old.sub } : fb;
        });
        return { ...sec, settings: { ...sec.settings, badges } };
      })
    };
  })();

  // derived theme values (من styles أو من store مباشرة كـ fallback)
  const primary         = tc?.styles?.primaryColor    || store?.primaryColor   || "#111827";
  const secondary       = tc?.styles?.secondaryColor  || store?.secondaryColor || "#1f2937";
  const font            = tc?.styles?.fontFamily      || store?.fontFamily     || "Cairo";
  const bgColor         = tc?.styles?.backgroundColor || "#ffffff";
  const surfaceColor    = tc?.styles?.surfaceColor    || "#fafafa";
  const textColor       = tc?.styles?.textColor       || "#111111";
  const mutedTextColor  = tc?.styles?.mutedTextColor  || "#666666";
  const borderColor     = tc?.styles?.borderColor     || "#ebebeb";
  const direction       = tc?.styles?.direction       || "rtl";

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

  // ✦ نرجّعو عداد العرض لقيمته الأصلية كي يتبدل القسم النشط
  useEffect(() => {
    setVisibleCount(null);
  }, [activeCat]);

  // ✦ Infinite Scroll — يحمّل المزيد كل ما يوصل المستخدم للـ sentinel
  useEffect(() => {
    const collSettings = sec(tc, "collection")?.settings || {};
    if (!collSettings.infiniteScroll || !loadMoreRef.current) return;
    const productsShown = collSettings.productsShown || 8;
    const el = loadMoreRef.current;
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        setVisibleCount(prev => Math.min((prev || productsShown) + productsShown, filteredProducts.length));
      }
    }, { rootMargin: "200px" });
    observer.observe(el);
    return () => observer.disconnect();
  }, [tc, filteredProducts.length, visibleCount]);

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
    <div style={{ minHeight: "100vh", background: bgColor, color: textColor, fontFamily: `'${font}', 'Cairo', sans-serif`, direction: direction }}>

      {/* ── Announcement Bar ── */}
      {(() => {
        const s = sec(tc, "announcement");
        if (!s?.enabled) return null;
        const { message, bgColor, textColor, animation, showClose } = s.settings;
        return (
          <SectionWrapper type="announcement" isPreview={isPreview} isHighlighted={highlightedSection === "announcement"}>
          <div style={{ background: bgColor, borderBottom: "1px solid rgba(0,0,0,.1)", overflow: "hidden", padding: "9px 0", position: "relative" }}>
            {animation ? (
              <div className="ps-marquee-track" style={{ display: "flex", gap: 64, width: "max-content" }}>
                {[...Array(6)].map((_, i) => (
                  <span key={i} style={{ fontSize: 12, fontWeight: 600, letterSpacing: 1.5, color: textColor, whiteSpace: "nowrap" }}>
                    {message}
                  </span>
                ))}
              </div>
            ) : (
              <p style={{ textAlign: "center", fontSize: 12, fontWeight: 600, color: textColor, margin: 0, letterSpacing: 1 }}>{message}</p>
            )}
            {showClose && (
              <button onClick={e => e.currentTarget.parentElement.style.display = "none"}
                style={{ position: "absolute", top: "50%", left: 12, transform: "translateY(-50%)", background: "none", border: "none", color: textColor, cursor: "pointer", fontSize: 16, opacity: .7 }}>✕</button>
            )}
          </div>
          </SectionWrapper>
        );
      })()}

      {/* ── Navbar ── */}
      {sec(tc, "header")?.enabled !== false && (
      <SectionWrapper type="header" isPreview={isPreview} isHighlighted={highlightedSection === "header"}>
      <StoreNavbar
        store={store}
        slug={slug}
        headerSettings={sec(tc, "header")?.settings}
        themeColors={{ primary, secondary, bgColor, surfaceColor, textColor, mutedTextColor, borderColor }}
        links={[
          { label: "الصفحة الرئيسية", action: () => window.scrollTo({ top: 0, behavior: "smooth" }) },
          { label: "التصنيفات",       action: () => navigate(`/store/${slug}/collections`) },
          { label: "اتصل بنا",        action: () => phone && window.open(`https://wa.me/${phone}`, "_blank") },
        ]}
      />
      </SectionWrapper>
      )}

      {/* ── Hero / Banner ── */}
      {(() => {
        const s = sec(tc, "hero");
        if (!s?.enabled) return null;
        const hs = s.settings;
        const heroBanner = hs.image || banner;
        const heroHeight = hs.height === "small" ? "clamp(200px,30vw,360px)" : hs.height === "full" ? "100vh" : "clamp(300px, 52vw, 580px)";
        const overlayAlpha = (hs.overlayOpacity ?? 50) / 100;
        const align = hs.textAlign || "center";
        // ⚠️ الصفحة فيها direction:rtl، فـ flex-end/flex-start ينعكسوا بصرياً.
        // نستعمل قيم بصرية صريحة باش "يمين" يطلع يمين فعلاً.
        const justify = align === "right" ? "flex-start" : align === "left" ? "flex-end" : "center";
        const handleCtaClick = () => {
          const link = hs.ctaLink || "#products";
          if (link.startsWith("#")) {
            const id = link.slice(1);
            if (id === "products") { productsRef.current?.scrollIntoView({ behavior: "smooth" }); return; }
            document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
          } else {
            window.open(link, "_blank");
          }
        };
        return (
        <SectionWrapper type="hero" isPreview={isPreview} isHighlighted={highlightedSection === "hero"}>
        <section style={{ position: "relative", height: heroHeight, overflow: "hidden" }}>
          {heroBanner ? (
            <img src={heroBanner} alt="banner" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : (
            <div style={{
              width: "100%", height: "100%",
              background: `linear-gradient(135deg, ${secondary} 0%, ${secondary}cc 100%)`,
              display: "flex", alignItems: "center", justifyContent: justify,
            }}>
              <div style={{ textAlign: align, padding: "0 24px" }}>
                <p style={{ fontSize: "clamp(2rem,6vw,4.5rem)", fontWeight: 900, color: "#fff", letterSpacing: -1, lineHeight: 1.1 }}>
                  {hs.title || storeName}
                </p>
                <p style={{ color: "#aaa", fontSize: 16, marginTop: 12, letterSpacing: 1 }}>{hs.subtitle}</p>
              </div>
            </div>
          )}
          <div style={{ position: "absolute", inset: 0, background: `rgba(0,0,0,${overlayAlpha})` }} />
          {(hs.title || hs.subtitle) && heroBanner && (
            <div style={{ position: "absolute", top: "50%", left: 0, right: 0, transform: "translateY(-50%)", textAlign: align, padding: "0 24px" }}>
              {hs.title && <p style={{ fontSize: "clamp(1.8rem,5vw,3.5rem)", fontWeight: 900, color: "#fff", margin: "0 0 12px", letterSpacing: -1 }}>{hs.title}</p>}
              {hs.subtitle && <p style={{ color: "rgba(255,255,255,.8)", fontSize: 16, margin: 0 }}>{hs.subtitle}</p>}
            </div>
          )}
          <div style={{ position: "absolute", bottom: 36, right: 0, left: 0, display: "flex", justifyContent: justify, padding: "0 24px" }}>
            <button
              onClick={handleCtaClick}
              className="ps-btn-order"
              style={{
                background: hs.ctaColor || primary, color: "#fff",
                border: "none", borderRadius: 50, padding: "13px 32px",
                fontSize: 15, fontWeight: 700, cursor: "pointer",
                fontFamily: "inherit", letterSpacing: .5,
                boxShadow: `0 4px 24px ${hs.ctaColor || primary}55`,
              }}
            >
              {hs.ctaText || "تسوق الآن"}
            </button>
          </div>
        </section>
        </SectionWrapper>
        );
      })()}

      {/* ── Trust Badges ── */}
      {(() => {
        const s = sec(tc, "trust");
        if (!s?.enabled) return null;
        const { badges, layout } = s.settings; // ✦ bgColor تاع القسم تشال — Trust يتبع لون الـ Background الرئيسي ديما
        const activeBadges = (badges || []).filter(b => b.enabled !== false);
        if (!activeBadges.length) return null;

        // أيقونات SVG لكل نوع
        const ICONS = {
          cod: (
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 014.33 12a19.79 19.79 0 01-3.07-8.67A2 2 0 013.24 1.18h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L7.09 8.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/>
            </svg>
          ),
          shipping: (
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <rect x="1" y="3" width="15" height="13" rx="1"/><path d="M16 8h4l3 4v5h-7V8z"/>
              <circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
            </svg>
          ),
          return: (
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 12a9 9 0 109-9 9.75 9.75 0 00-6.74 2.74L3 8"/><path d="M3 3v5h5"/>
            </svg>
          ),
          support: (
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 18v-6a9 9 0 0118 0v6"/><path d="M21 19a2 2 0 01-2 2h-1a2 2 0 01-2-2v-3a2 2 0 012-2h3zM3 19a2 2 0 002 2h1a2 2 0 002-2v-3a2 2 0 00-2-2H3z"/>
            </svg>
          ),
          secure: (
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/>
            </svg>
          ),
        };

        const isRow = (layout || "row") === "row";

        // بطاقة واحدة مدورة لكل مجموعة (4 بالأقصى) فيها فواصل بين الأعمدة
        const renderRow = () => {
          const groups = [];
          for (let i = 0; i < activeBadges.length; i += 4) groups.push(activeBadges.slice(i, i + 4));
          return (
            <div style={{ maxWidth: 900, margin: "0 auto", display: "flex", flexDirection: "column", gap: 12 }}>
              {groups.map((group, gi) => (
                <div key={gi} style={{
                  background: surfaceColor, borderRadius: 20, overflow: "hidden",
                  display: "grid", gridTemplateColumns: `repeat(${group.length}, 1fr)`,
                }}>
                  {group.map((b, i) => (
                    <div key={i} style={{
                      display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
                      textAlign: "center", padding: "22px 10px",
                      borderInlineStart: i !== 0 ? `1px solid ${borderColor}` : "none",
                    }}>
                      <div style={{ width: 48, height: 48, borderRadius: "50%", background: bgColor, display: "flex", alignItems: "center", justifyContent: "center", color: primary }}>
                        {ICONS[b.id] || ICONS.secure}
                      </div>
                      <p style={{ fontSize: 12, fontWeight: 700, color: textColor, margin: "0 0 2px", direction: "rtl" }}>{b.title}</p>
                      <p style={{ fontSize: 10, color: mutedTextColor, margin: 0, direction: "rtl" }}>{b.sub}</p>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          );
        };

        const renderGrid = () => (
          <div style={{
            maxWidth: 900, margin: "0 auto",
            display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12,
          }}>
            {activeBadges.map((b, i) => (
              <div key={i} style={{
                display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
                textAlign: "center", padding: "20px 12px",
                background: surfaceColor, borderRadius: 18, border: `1px solid ${borderColor}`,
              }}>
                <div style={{ width: 48, height: 48, borderRadius: "50%", background: bgColor, display: "flex", alignItems: "center", justifyContent: "center", color: primary }}>
                  {ICONS[b.id] || ICONS.secure}
                </div>
                <p style={{ fontSize: 13, fontWeight: 700, color: textColor, margin: "0 0 2px", direction: "rtl" }}>{b.title}</p>
                <p style={{ fontSize: 11, color: mutedTextColor, margin: 0, direction: "rtl" }}>{b.sub}</p>
              </div>
            ))}
          </div>
        );

        return (
        <SectionWrapper type="trust" isPreview={isPreview} isHighlighted={highlightedSection === "trust"}>
          <section style={{ background: bgColor, padding: "24px 16px" }}>
            {isRow ? renderRow() : renderGrid()}
          </section>
        </SectionWrapper>
        );
      })()}

      {/* ── Categories ── */}
      {sec(tc, "categories")?.enabled !== false && categories.length > 0 && (() => {
        const s = sec(tc, "categories");
        const catTitle = s?.settings?.title || "التصنيفات";
        const catSubtitle = s?.settings?.subtitle || "اعثر على كل ما تريد";
        const maxItems = s?.settings?.maxItems || 6;
        const titleAlign = s?.settings?.titleAlign || "right";
        const displayStyle = s?.settings?.displayStyle || "grid";
        return (
        <SectionWrapper type="categories" isPreview={isPreview} isHighlighted={highlightedSection === "categories"}>
        <section id="ps-categories" style={{ maxWidth: 980, margin: "0 auto", padding: "52px 24px 0" }}>
          {/* Header row */}
          <div style={{
            display: "flex", alignItems: "flex-end", marginBottom: 28, gap: 12,
            justifyContent: titleAlign === "center" ? "center" : "flex-start",
            flexDirection: titleAlign === "left" ? "row-reverse" : "row",
          }}>
            <div style={{ textAlign: titleAlign, width: titleAlign === "center" ? "100%" : "auto" }}>
              <h2 style={{ fontSize: "clamp(1.3rem,3vw,1.8rem)", fontWeight: 900, color: "#111", margin: "0 0 6px" }}>{catTitle}</h2>
              <p style={{ color: "#888", fontSize: 13, margin: 0 }}>{catSubtitle}</p>
            </div>
          </div>

          {/* Category cards — Grid (ثابت 2 أعمدة ديما، mobile و desktop) أو Row (سطر واحد، سكرول أفقي) */}
          <div style={{
            display: displayStyle === "row" ? "flex" : "grid",
            gridTemplateColumns: displayStyle === "row" ? undefined : "repeat(2, 1fr)",
            overflowX: displayStyle === "row" ? "auto" : undefined,
            gap: 16,
            paddingBottom: displayStyle === "row" ? 4 : 0,
          }}>
            {categories.slice(0, maxItems).map(cat => (
              <div
                key={cat._id}
                onClick={() => navigate(`/store/${slug}/collections/${cat._id}`)}
                style={{
                  position: "relative",
                  borderRadius: 16, overflow: "hidden", cursor: "pointer",
                  height: 280,
                  boxShadow: "0 2px 8px rgba(0,0,0,.08)",
                  transition: "transform .25s, box-shadow .25s",
                  flexShrink: displayStyle === "row" ? 0 : undefined,
                  width: displayStyle === "row" ? 240 : "auto",
                  background: "#f1f1f3",
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 14px 34px rgba(0,0,0,.14)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,.08)"; }}
              >
                {/* Background image (fills the whole card) */}
                {cat.image ? (
                  <img
                    src={cat.image} alt={cat.name}
                    style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", transition: "transform .5s" }}
                    onMouseEnter={e => e.target.style.transform = "scale(1.06)"}
                    onMouseLeave={e => e.target.style.transform = "scale(1)"}
                  />
                ) : (
                  <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 44, color: "#cbd5e1", background: "linear-gradient(135deg,#e5e7eb,#f8fafc)" }}>📁</div>
                )}
                {/* Bottom gradient for text readability */}
                <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: "62%", background: "linear-gradient(to top, rgba(0,0,0,.72), rgba(0,0,0,0))" }} />
                {/* Overlaid title + link */}
                <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, padding: "16px" }}>
                  <div style={{ fontWeight: 800, fontSize: 17, color: "#fff", marginBottom: 4, textShadow: "0 1px 4px rgba(0,0,0,.3)" }}>{cat.name}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12.5, fontWeight: 600, color: "rgba(255,255,255,.85)" }}>
                    تصفح المجموعة <span style={{ fontSize: 14 }}>←</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
        </SectionWrapper>
        );
      })()}

      {/* ── Products Grid ── */}
      {sec(tc, "collection")?.enabled !== false && (() => {
        const collSettings   = sec(tc, "collection")?.settings || {};
        const titleAlign     = collSettings.titleAlign || "right";
        const productsShown  = collSettings.productsShown || 8;
        const carouselMode   = !!collSettings.carouselMode;
        const columns        = collSettings.columns || 3;
        const imageRatio     = collSettings.imageRatio || "1:1";
        const cardStyle      = collSettings.cardStyle || "default";
        const showBadge      = collSettings.showBadge !== false;
        const showRating     = !!collSettings.showRating;
        const showViewAll    = collSettings.showViewAll;
        const viewAllText    = collSettings.viewAllText || "عرض الكل";
        const viewAllStyle   = collSettings.viewAllStyle || "link";
        const infiniteScroll = !!collSettings.infiniteScroll;

        const effectiveCount = infiniteScroll ? (visibleCount || productsShown) : productsShown;
        const visibleProducts = carouselMode ? filteredProducts : filteredProducts.slice(0, effectiveCount);
        const aspectMap = { "1:1": "1/1", "3:4": "3/4" };

        // ✦ Card style presets — Default | Minimal | Bordered
        const CARD_STYLE_MAP = {
          default:  { cardBorder: "none", cardPadding: 0,  imgRadius: 14, titleSize: 14, priceSize: 16, gap: 8  },
          minimal:  { cardBorder: "none", cardPadding: 0,  imgRadius: 6,  titleSize: 13, priceSize: 14, gap: 6  },
          bordered: { cardBorder: `1px solid ${borderColor}`, cardPadding: 8, imgRadius: 12, titleSize: 14, priceSize: 16, gap: 8 },
        };
        const cardStyleCfg = CARD_STYLE_MAP[cardStyle] || CARD_STYLE_MAP.default;

        const viewAllBtnStyle = {
          link:    { background: "none", color: primary, border: "none", textDecoration: "underline" },
          filled:  { background: primary, color: "#fff", border: "none" },
          outline: { background: "none", color: primary, border: `1px solid ${primary}` },
        }[viewAllStyle];

        return (
        <SectionWrapper type="collection" isPreview={isPreview} isHighlighted={highlightedSection === "collection"}>
        <section ref={productsRef} style={{ maxWidth: 980, margin: "0 auto", padding: "40px 24px 80px" }}>
          <div style={{
            display: "flex", alignItems: "center", marginBottom: 24, gap: 12,
            justifyContent: titleAlign === "center" ? "center" : "space-between",
            flexDirection: titleAlign === "left" ? "row-reverse" : "row",
          }}>
            <h2 style={{ fontSize: "clamp(1.3rem,3vw,1.7rem)", fontWeight: 800, color: textColor, margin: 0, textAlign: titleAlign }}>
              {activeCat === "all"
                ? (collSettings.title || "جميع المنتجات")
                : categories.find(c => c._id === activeCat)?.name || "المنتجات"}
            </h2>
            {titleAlign !== "center" && (
              <span style={{ fontSize: 13, color: mutedTextColor, background: surfaceColor, border: `1px solid ${borderColor}`, padding: "5px 14px", borderRadius: 50 }}>
                {filteredProducts.length} منتج
              </span>
            )}
          </div>

          {filteredProducts.length === 0 ? (
            <div style={{ textAlign: "center", padding: "80px 0", color: mutedTextColor }}>
              <p style={{ fontSize: 40, marginBottom: 12 }}>🛍️</p>
              <p style={{ fontSize: 14 }}>لا توجد منتجات في هذا القسم</p>
            </div>
          ) : (
            <div
              className="ps-coll-grid"
              data-cols={columns}
              data-carousel={carouselMode ? "1" : "0"}
              style={carouselMode ? {
                display: "flex", gap: 20, overflowX: "auto", scrollSnapType: "x mandatory", paddingBottom: 8,
              } : {
                display: "grid", gridTemplateColumns: `repeat(${columns}, 1fr)`, gap: 20,
              }}
            >
              {visibleProducts.map((product, idx) => {
                const img = (product.images?.[0] || product.image || DEFAULT_IMG);
                const outOfStock = product.stock === 0;
                return (
                  <div
                    key={product._id}
                    className="ps-card ps-fade-up"
                    style={{
                      animationDelay: `${(idx % 6) * 0.07}s`,
                      background: "transparent",
                      border: cardStyleCfg.cardBorder,
                      borderRadius: cardStyleCfg.imgRadius + (cardStyleCfg.cardPadding ? 4 : 0),
                      padding: cardStyleCfg.cardPadding,
                      display: "flex", flexDirection: "column",
                      cursor: "pointer",
                      opacity: outOfStock ? 0.6 : 1,
                      ...(carouselMode ? { flex: `0 0 calc((100% - ${(columns - 1) * 20}px) / ${columns})`, scrollSnapAlign: "start", minWidth: 220 } : {}),
                    }}
                    onClick={() => navigate(`/store/${slug}/product/${product._id}`)}
                  >
                    {/* Image (with hover/touch CTA overlay) */}
                    <div style={{
                      position: "relative", overflow: "hidden", background: surfaceColor,
                      borderRadius: cardStyleCfg.imgRadius,
                      ...(imageRatio === "adapt" ? {} : { aspectRatio: aspectMap[imageRatio] || "1/1" }),
                    }}>
                      <img
                        src={img}
                        alt={product.name}
                        onError={e => { e.target.onerror = null; e.target.src = DEFAULT_IMG; }}
                        style={{ width: "100%", height: imageRatio === "adapt" ? "auto" : "100%", display: "block", objectFit: "cover", transition: "transform .5s ease" }}
                        onMouseEnter={e => e.target.style.transform = "scale(1.06)"}
                        onMouseLeave={e => e.target.style.transform = "scale(1)"}
                      />
                      {/* Badges */}
                      {showBadge && product.oldPrice && !outOfStock && (
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
                          position: "absolute", top: 12, left: 12,
                          background: "rgba(245,158,11,.9)", color: "#fff",
                          fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 99,
                        }}>⚠️ آخر {product.stock} قطع</span>
                      )}

                      {/* CTA overlay — appears on hover (desktop) / always on touch devices */}
                      {!outOfStock && (
                        <div
                          className="ps-card-cta"
                          style={{
                            position: "absolute", left: 10, right: 10, bottom: 10,
                          }}
                        >
                          <button
                            onClick={e => { e.stopPropagation(); navigate(`/store/${slug}/product/${product._id}`); }}
                            style={{
                              width: "100%", border: "none", cursor: "pointer",
                              borderRadius: 12, padding: "12px 0",
                              background: primary, color: "#fff",
                              fontSize: 13.5, fontWeight: 700, fontFamily: "inherit",
                              display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
                              boxShadow: "0 4px 16px rgba(0,0,0,.25)",
                            }}
                          >
                            <IconCart />
                            أضف للسلة
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Info — simple, no background box */}
                    <div style={{ padding: `${cardStyleCfg.gap}px 2px 0`, display: "flex", flexDirection: "column" }}>
                      <p style={{ fontSize: cardStyleCfg.titleSize, fontWeight: 700, color: textColor, margin: `0 0 ${cardStyleCfg.gap - 2}px`, lineHeight: 1.4 }}>
                        {product.name}
                      </p>
                      {showRating && (
                        <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 6 }}>
                          <span style={{ fontSize: 12, fontWeight: 700, color: "#f59e0b" }}>5.0</span>
                          <span style={{ fontSize: 12, color: "#f59e0b", letterSpacing: 1 }}>★★★★★</span>
                        </div>
                      )}
                      <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                        <span style={{ fontSize: cardStyleCfg.priceSize, fontWeight: 800, color: textColor }}>
                          {product.currentPrice.toLocaleString()} <span style={{ fontSize: 12, fontWeight: 600, color: mutedTextColor }}>د.ج</span>
                        </span>
                        {product.oldPrice && (
                          <span style={{ fontSize: 12.5, color: mutedTextColor, textDecoration: "line-through" }}>
                            {product.oldPrice.toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ✦ Infinite scroll sentinel — يحمّل المزيد تلقائياً عند الوصول للأسفل */}
          {!carouselMode && infiniteScroll && effectiveCount < filteredProducts.length && (
            <div ref={loadMoreRef} style={{ height: 1 }} />
          )}

          {/* ✦ View All */}
          {!carouselMode && !infiniteScroll && showViewAll && (
            <div style={{ display: "flex", justifyContent: "center", marginTop: 28 }}>
              <button
                onClick={() => navigate(`/store/${slug}/collections`)}
                style={{
                  padding: "11px 28px", borderRadius: 12, cursor: "pointer",
                  fontSize: 14, fontWeight: 700, fontFamily: "inherit",
                  ...viewAllBtnStyle,
                }}
              >
                {viewAllText}
              </button>
            </div>
          )}
        </section>
        </SectionWrapper>
        );
      })()}

      {/* ── Footer ── */}
      {sec(tc, "footer")?.enabled !== false && (
        <SectionWrapper type="footer" isPreview={isPreview} isHighlighted={highlightedSection === "footer"}>
          <StoreFooter store={store} slug={slug} bgColor={surfaceColor} textColor={textColor} light={surfaceColor === "#ffffff"} settings={sec(tc, "footer")?.settings || {}} />
        </SectionWrapper>
      )}

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
        /* ✦ Collection grid — يتقلص تلقائياً على الشاشات الصغيرة */
        @media (max-width: 900px) {
          .ps-coll-grid[data-carousel="0"][data-cols="4"],
          .ps-coll-grid[data-carousel="0"][data-cols="3"] { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 480px) {
          .ps-coll-grid[data-carousel="0"] { grid-template-columns: repeat(1, 1fr) !important; }
          .ps-coll-grid[data-carousel="1"] > * { flex: 0 0 80% !important; }
        }
      `}</style>

    </div>
  );
}

export default PublicStore;