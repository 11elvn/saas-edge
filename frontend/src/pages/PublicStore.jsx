// ============================================================
// 📁 pages/PublicStore.jsx — Day 23 Redesign (bat-caveee style)
// ============================================================

import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { ALGERIAN_CITIES } from "../constants/algerianCities";
import StoreNavbar from "../components/StoreNavbar";
import StoreFooter from "../components/StoreFooter";
import FaqSection  from "../components/FaqSection";
import ReviewsSection from "../components/ReviewsSection";
import CartDrawer from "../components/CartDrawer";
import AnnouncementBar, { isAnnouncementEnabled, ANNOUNCEMENT_BAR_CSS } from "../components/AnnouncementBar";
import { useCart } from "../context/CartContext";

const API = () => import.meta.env.VITE_API_URL;

// ── Demo categories — تبان غير جوه ThemeEdit (isPreview) كي التاجر مازال ما دار تصنيفات ──
// ✦ بلا صور — نستعملو placeholder أنيق (❓ + خلفية غامقة) كيما Tassyir، ماشي صور حقيقية
const DEMO_CATEGORIES = [
  { _id: "demo-1", name: "ملابس",       image: null, _demo: true },
  { _id: "demo-2", name: "إلكترونيات",  image: null, _demo: true },
  { _id: "demo-3", name: "إكسسوارات",   image: null, _demo: true },
  { _id: "demo-4", name: "أحذية",       image: null, _demo: true },
];

// ── Demo products — تبان غير جوه ThemeEdit (isPreview) كي التاجر مازال ما زاد حتى منتج ──
// ✦ نفس الشكل ديال SearchResults.jsx (PLACEHOLDER_PRODUCTS) — منتج تجريبي 1/2/3/4 بلا صور حقيقية
const DEMO_PRODUCTS = [1, 2, 3, 4].map(n => ({
  _id: `demo-product-${n}`,
  name: `منتج تجريبي ${n}`,
  currentPrice: 2000 + n * 300,
  oldPrice: null,
  stock: 10,
  images: [],
  _demo: true,
}));

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
${ANNOUNCEMENT_BAR_CSS}
@keyframes ps-spin { to { transform:rotate(360deg); } }

.ps-fade-up  { animation: ps-fade-up .55s ease both; }
.ps-delay-1  { animation-delay:.08s; }
.ps-delay-2  { animation-delay:.16s; }
.ps-delay-3  { animation-delay:.24s; }
.ps-delay-4  { animation-delay:.32s; }

.ps-drawer          { animation: ps-slide-in .3s cubic-bezier(.32,.72,0,1) both; }
.ps-spinner         { animation: ps-spin .7s linear infinite; }

.ps-card {
  transition: transform .25s ease, box-shadow .25s ease, border-color .25s ease;
}
.ps-card-img { transition: transform .2s; }
.ps-card:hover .ps-card-img { transform: scale(1.05); }
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

/* ✦ إخفاء الـ scrollbar الافتراضي للكاروسيل — بدّلناه بأزرار تنقل عائمة */
.ps-coll-grid[data-carousel="1"]::-webkit-scrollbar { display:none; }
.ps-coll-grid[data-carousel="1"] { -ms-overflow-style:none; scrollbar-width:none; }

/* ✦ أزرار التنقل العائمة لكاروسيل المنتجات */
.ps-carousel-nav {
  position: absolute; top: 40%; transform: translateY(-50%);
  width: 38px; height: 38px; border-radius: 50%; border: none; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 4px 14px rgba(0,0,0,.18);
  opacity: 0; transition: opacity .2s, transform .2s;
  z-index: 2;
}
.ps-carousel-wrap:hover .ps-carousel-nav,
.ps-carousel-nav:focus-visible { opacity: 1; }
.ps-carousel-nav--prev { right: -6px; }
.ps-carousel-nav--next { left: -6px; }
.ps-carousel-nav:hover { transform: translateY(-50%) scale(1.06); }
@media (max-width: 768px) {
  .ps-carousel-nav { opacity: 1; width: 32px; height: 32px; }
  .ps-carousel-nav--prev { right: 2px; }
  .ps-carousel-nav--next { left: 2px; }
}
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
        {["الصفحة الرئيسية", "المنتجات", "اتصل بنا"].map((item, i) => (
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
    { id:"footer",       type:"footer",       enabled:true,  settings:{ copyright:"© 2025 اسم متجرك", termsText:"الشروط والسياسات", showSocials:true, socials:{ facebook:"", instagram:"", youtube:"", tiktok:"", twitter:"", whatsapp:"" } } },
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
  faq:          "FAQ",
  footer:       "Footer",
};

// ── CSS للـ preview overlays ──────────────────────────────────
// ✦ Desktop (min-width:769px) — نفس السلوك الأصلي: CSS :hover + label ملتصقين بحدود السكشن (inset:0)
// ✦ Mobile (<769px) — الهايلايت + label كيترسمو بـ JS (SectionHighlightOverlay) — الـ label هنا display:none باش ما تتكررش
const PREVIEW_CSS = `
.ps-section-wrapper {
  position: relative;
}
.ps-section-label { display: none; }

@media (min-width: 769px) {
  /* Hover — تمرير الفار فوق أي section: طبقة overlay ملتصقة بالضبط بالحواف (inset:0)، فوق كل المحتوى */
  .ps-section-wrapper:hover::after {
    content: "";
    position: absolute;
    inset: 0;
    border: 2px dashed rgba(124,109,242,.55);
    background: rgba(124,109,242,.05);
    pointer-events: none;
    z-index: 140;
  }

  /* Selected/highlighted — الـ section المختارة فعليًا (كليك): نفس الطبقة بحدود صريحة + تلوين أقوى */
  .ps-section-wrapper--highlighted {
    position: relative;
  }
  .ps-section-wrapper--highlighted::after {
    content: "";
    position: absolute;
    inset: 0;
    border: 2px solid #7c6df2;
    background: rgba(124,109,242,.10);
    pointer-events: none;
    z-index: 140;
  }

  /* Label اسم الـ section — دايمًا فالزاوية اليسرى الفيزيائية (left)، بغض النظر عن اتجاه الصفحة */
  .ps-section-label {
    display: block;
    position: absolute;
    top: 8px;
    left: 8px;
    z-index: 150;
    background: #7c6df2;
    color: #fff;
    font-size: 11px;
    font-weight: 700;
    padding: 3px 10px;
    border-radius: 6px;
    pointer-events: none;
    font-family: 'Inter', sans-serif;
    letter-spacing: .3px;
    white-space: nowrap;
    box-shadow: 0 2px 8px rgba(124,109,242,.35);
    opacity: 0;
    transition: opacity .12s ease;
  }
  /* يبان عند hover حتى بلا اختيار، ويبقى ظاهر دايمًا كي الـ section مختارة */
  .ps-section-wrapper:hover .ps-section-label,
  .ps-section-wrapper--highlighted .ps-section-label {
    opacity: 1;
  }
  .ps-section-label--active {
    background: #7c6df2;
  }
}
`;

// ── SectionHighlightOverlay — Mobile فقط (isNarrowViewport). مربع الهايلايت + label مبنيين
// بـ JS (getBoundingClientRect + scrollY) → position:absolute نسبة للدوكيمو (ماشي fixed)
// ✦ left:0/right:0 (ماشي 100vw) — باش ما يفيضش عن عرض الصفحة الحقيقي عند وجود scrollbar
function SectionHighlightOverlay({ rect, label, variant }) {
  if (!rect) return null;
  const isActive = variant === "active";
  return (
    <>
      <div style={{
        position: "absolute", left: 0, right: 0,
        top: rect.top, height: rect.height,
        border: isActive ? "2px solid #7c6df2" : "2px dashed rgba(124,109,242,.55)",
        background: isActive ? "rgba(124,109,242,.10)" : "rgba(124,109,242,.05)",
        pointerEvents: "none", zIndex: 140,
      }} />
      <div style={{
        position: "absolute", top: rect.top + 8, left: 8, zIndex: 150,
        background: "#7c6df2", color: "#fff", fontSize: 11, fontWeight: 700,
        padding: "3px 10px", borderRadius: 6, pointerEvents: "none",
        fontFamily: "'Inter', sans-serif", letterSpacing: .3, whiteSpace: "nowrap",
        boxShadow: "0 2px 8px rgba(124,109,242,.35)",
      }}>
        {label}
      </div>
    </>
  );
}

// ── SectionWrapper — يلف كل section بـ label + border + زر + في preview mode ──
// ✦ فـ desktop: CSS :hover عادي (نفس القديم). فـ mobile: JS-measured overlay (registerRef/onHoverChange)
// ── PS_SPACING_DEFAULTS — القيمة الافتراضية (top فقط) لكل section باش أول تاجر يدخل يلقى
// فراغ مرتب بين الأقسام (ماشي ملتصقين). bottom كيبقى 0 ديما باش الفراغ ما يتضاعفش
// (الفراغ بين section A و B = top ديال B غير). faq ماشي هنا لأن عندها padding مبني فالكومبونيت
// نفسو (FaqSection.jsx: "52px 24px 60px") — زيادة default هنا غادي تضاعف الفراغ.
// ── PS_SPACING_DEFAULTS — القيمة الافتراضية (top+bottom) لكل section باش أول تاجر يدخل يلقى
// فراغ متناسق ومنطقي فـ كل جهة (ماشي top غير). announcement/header/hero/footer بقاو 0/0 —
// منطقي يبقاو ملتصقين (شريط رفيع، نافبار، بانر full-bleed، وفوتر عندها background خاص بيها).
// القيم متدرجة حسب وزن الـ section: trust (شريط خفيف) < categories/collection/faq (بلوكات رئيسية).
const PS_SPACING_DEFAULTS = {
  trust:      { top: 24, bottom: 24 },
  categories: { top: 32, bottom: 20 },
  collection: { top: 32, bottom: 32 },
  faq:        { top: 32, bottom: 32 },
  reviews:    { top: 15, bottom: 0 },
  footer:     { top: 0,  bottom: 0 },
};
function SectionWrapper({ type, isPreview, isHighlighted, children, style = {}, spacing, registerRef, onHoverChange }) {
  const sp = spacing || {};
  const d = PS_SPACING_DEFAULTS[type] || {};
  const extraPad = {
    paddingTop: sp.top ?? d.top ?? 0,
    paddingBottom: sp.bottom ?? d.bottom ?? 0,
    paddingInlineStart: sp.start || 0,
    paddingInlineEnd: sp.end || 0,
  };
  if (!isPreview) return <div style={{ ...extraPad, ...style }} data-section={type}>{children}</div>;

  // ✦ عند كليك على أي مكان في الـ section → نرسل للـ ThemeEdit باش يفتح settings
  const handleClick = () => {
    window.parent.postMessage({ type: "SECTION_CLICK", sectionType: type }, "*");
  };

  return (
    <div
      ref={el => registerRef && registerRef(type, el)}
      style={{ ...extraPad, ...style, position: "relative", cursor: "pointer" }}
      data-section={type}
      onClick={handleClick}
      onMouseEnter={() => onHoverChange && onHoverChange(type)}
      onMouseLeave={() => onHoverChange && onHoverChange(null)}
      className={`ps-section-wrapper${isHighlighted ? " ps-section-wrapper--highlighted" : ""}`}
    >
      {/* ── Label — اسم الـ section: يبان عند hover، ويبقى ظاهر إذا كانت مختارة (desktop فقط، CSS media query) ── */}
      <div className={`ps-section-label${isHighlighted ? " ps-section-label--active" : ""}`}>
        {SECTION_LABELS[type] || type}
      </div>
      {children}
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
  const { getCartCount } = useCart();
  const [cartOpen, setCartOpen] = useState(false);
  // ✦ themeConfig — يُحدَّث live من postMessage (page builder)
  const [themeConfig, setThemeConfig] = useState(null);
  // ✦ highlighted section type من page builder
  const [highlightedSection, setHighlightedSection] = useState(null);

  const productsRef = useRef(null);
  const loadMoreRef = useRef(null);
  const carouselRef  = useRef(null); // ✦ مرجع الكاروسيل — لأزرار التنقل الجديدة
  const catStripRef  = useRef(null); // ✦ مرجع سطر التصنيفات (displayStyle="row")
  const [visibleCount, setVisibleCount] = useState(null); // ✦ يُهيّأ بحسب productsShown عند توفر إعدادات collection

  // ── Highlight overlay (preview, mobile فقط) — قياس حقيقي بـ getBoundingClientRect لكل section ──
  const sectionRefs = useRef({});
  const registerSectionRef = useCallback((type, el) => {
    if (el) sectionRefs.current[type] = el;
    else delete sectionRefs.current[type];
  }, []);
  const [hoveredSection, setHoveredSection] = useState(null);
  const [overlayRects, setOverlayRects] = useState({ hover: null, active: null });
  const [isNarrowViewport, setIsNarrowViewport] = useState(
    () => (typeof window !== "undefined" ? window.innerWidth <= 768 : false)
  );

  useEffect(() => {
    if (!isPreview) return;
    const onResize = () => setIsNarrowViewport(window.innerWidth <= 768);
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [isPreview]);

  // ✦ absolute (ماشي fixed) نسبة للدوكيمو كامل — top = rect.top (viewport) + scrollY (السكرول الحالي)
  // ✦ الصندوق كيتبع الحدود الحقيقية ديال section ديالو بحال (getBoundingClientRect مباشرة) —
  // بلا ما "يبلع" الفراغ لأقرب section جايه (كان كيدير هاذشي قبل كي الفراغ بين الأقسام = 0،
  // دابا مع الـ spacing الحقيقي هاذشي كان كيخلي صندوق الهايلايت يبان أكبر أو أصغر من section
  // الحقيقية). نفس التصحيح لي تدار فـ ProductDetails.jsx و Checkout.jsx.
  const measureOverlays = useCallback(() => {
    if (!isNarrowViewport) { setOverlayRects({ hover: null, active: null }); return; }
    const activeEl = highlightedSection ? sectionRefs.current[highlightedSection] : null;
    const showHover = hoveredSection && hoveredSection !== highlightedSection;
    const hoverEl = showHover ? sectionRefs.current[hoveredSection] : null;
    const toRect = (el) => {
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return { top: r.top + window.scrollY, height: r.height };
    };
    setOverlayRects({ active: toRect(activeEl), hover: toRect(hoverEl) });
  }, [highlightedSection, hoveredSection, isNarrowViewport]);

  useEffect(() => {
    if (!isPreview || !isNarrowViewport) return;
    measureOverlays();
    window.addEventListener("resize", measureOverlays);
    return () => window.removeEventListener("resize", measureOverlays);
  }, [isPreview, isNarrowViewport, measureOverlays]);

  useEffect(() => {
    if (!isPreview || !isNarrowViewport) return;
    const id = requestAnimationFrame(measureOverlays);
    return () => cancelAnimationFrame(id);
  }, [isPreview, isNarrowViewport, measureOverlays, themeConfig, store, products, categories, loading]);

  // ✦ بعض الأقسام كيتبدل الطول ديالها بحركة الزائر نفسو، ماشي بتغيير فـ themeConfig/store/...
  // (مثال: فتح سؤال فـ FAQ). هاد الحالات ماكاينش ليهم dependency فالـ effect لي فوق، فالصندوق
  // كان كيبقى بالمقاس القديم حتى توقع حركة أخرى (resize/hover). ResizeObserver كيتبع القسم
  // المختار/اللي عليه الفار مباشرة، فأي تغيير حقيقي فـ الحجم ديالو كيعاود يقيس فوراً.
  useEffect(() => {
    if (!isPreview || !isNarrowViewport || typeof ResizeObserver === "undefined") return;
    const activeEl = highlightedSection ? sectionRefs.current[highlightedSection] : null;
    const showHover = hoveredSection && hoveredSection !== highlightedSection;
    const hoverEl = showHover ? sectionRefs.current[hoveredSection] : null;
    if (!activeEl && !hoverEl) return;
    const ro = new ResizeObserver(() => measureOverlays());
    if (activeEl) ro.observe(activeEl);
    if (hoverEl) ro.observe(hoverEl);
    return () => ro.disconnect();
  }, [isPreview, isNarrowViewport, highlightedSection, hoveredSection, measureOverlays]);
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
    // ✦ نطلبو آخر themeConfig مباشرة (بلاصة نتصنّتو غير على push من load event)
    if (isPreview) {
      try { window.parent.postMessage({ type: "REQUEST_THEME_CONFIG" }, "*"); } catch (_) {}
    }
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

  // ✦ ترتيب الـ section حسب مكانه الحقيقي فـ themeConfig.sections
  // (باش drag & drop ديال ThemeEdit يأثر فعلا على ترتيب العرض هنا، بلا ما يبقى الترتيب ثابت فالكود)
  const sectionOrder = (type) => {
    const idx = (tc?.sections || []).findIndex(s => s.type === type);
    return idx === -1 ? 999 : idx;
  };

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

  // ✦ سكرول لأي section عندو hash فالرابط (مثلا #ps-products جاي من "المنتجات" فالهيدر)
  useEffect(() => {
    if (!location.hash) return;
    const id = location.hash.slice(1);
    const el = document.getElementById(id);
    if (el) requestAnimationFrame(() => el.scrollIntoView({ behavior: "smooth" }));
  }, [location.hash, loading]);

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

  // ✦ التاجر مازال ما زاد حتى منتج — فـ preview كنوريو منتجات تجريبية بدل رسالة "لا توجد منتجات"
  // (نفس المنطق ديال usingDemo/DEMO_CATEGORIES فوق، ونفس PLACEHOLDER_PRODUCTS ديال SearchResults.jsx)
  const usingDemoProducts = products.length === 0 && isPreview;
  const filteredProducts = usingDemoProducts
    ? DEMO_PRODUCTS
    : activeCat === "all"
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
    if (item === "المنتجات") {
      productsRef.current?.scrollIntoView({ behavior: "smooth" });
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
    <div style={{ minHeight: "100vh", background: bgColor, color: textColor, fontFamily: `'${font}', 'Cairo', sans-serif`, direction: direction, display: "flex", flexDirection: "column" }}>

      {/* ── Announcement Bar ── */}
      {(() => {
        const s = sec(tc, "announcement");
        if (!isAnnouncementEnabled(s)) return null;
        return (
          <SectionWrapper type="announcement" isPreview={isPreview} spacing={s?.settings?.spacing} isHighlighted={highlightedSection === "announcement"} style={{ order: sectionOrder("announcement") }} registerRef={registerSectionRef} onHoverChange={setHoveredSection}>
            <AnnouncementBar settings={s.settings} slug={slug} isPreview={isPreview} />
          </SectionWrapper>
        );
      })()}

      {/* ── Navbar ── */}
      {sec(tc, "header")?.enabled !== false && (
      <SectionWrapper type="header" isPreview={isPreview} spacing={sec(tc, "header")?.settings?.spacing} isHighlighted={highlightedSection === "header"} style={{ order: sectionOrder("header") }} registerRef={registerSectionRef} onHoverChange={setHoveredSection}>
      <StoreNavbar
        store={store}
        slug={slug}
        headerSettings={sec(tc, "header")?.settings}
        themeColors={{ primary, secondary, bgColor, surfaceColor, textColor, mutedTextColor, borderColor }}
        cartCount={isPreview ? 2 : getCartCount(slug)}
        onCartClick={() => setCartOpen(true)}
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
        <SectionWrapper type="hero" isPreview={isPreview} spacing={sec(tc, "hero")?.settings?.spacing} isHighlighted={highlightedSection === "hero"} style={{ order: sectionOrder("hero") }} registerRef={registerSectionRef} onHoverChange={setHoveredSection}>
        <section style={{ position: "relative", height: heroHeight, overflow: "hidden", display: "flex", alignItems: "center" }}>
          {heroBanner ? (
            <img src={heroBanner} alt="banner" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
          ) : (
            <div style={{ position: "absolute", inset: 0, background: `linear-gradient(135deg, ${secondary} 0%, ${secondary}cc 100%)` }} />
          )}
          <div style={{ position: "absolute", inset: 0, background: `rgba(0,0,0,${overlayAlpha})` }} />

          {/* ── مجموعة واحدة: عنوان + وصف + زر، بمسافات ثابتة بينهم ── */}
          <div style={{ position: "relative", zIndex: 1, width: "100%", display: "flex", justifyContent: justify, padding: "0 24px" }}>
            <div style={{
              display: "flex", flexDirection: "column",
              alignItems: align === "center" ? "center" : align === "right" ? "flex-end" : "flex-start",
              textAlign: align, maxWidth: 640,
            }}>
              <p style={{ fontSize: "clamp(1.8rem,5vw,3.5rem)", fontWeight: 900, color: "#fff", margin: 0, letterSpacing: -1, lineHeight: 1.15, textShadow: "0 2px 16px rgba(0,0,0,.4)" }}>
                {hs.title || storeName}
              </p>
              {hs.subtitle && (
                <p style={{ color: "rgba(255,255,255,.92)", fontSize: "clamp(1rem,2.4vw,1.4rem)", fontWeight: 500, margin: "14px 0 0", letterSpacing: .2, lineHeight: 1.5, textShadow: "0 2px 12px rgba(0,0,0,.4)" }}>
                  {hs.subtitle}
                </p>
              )}
              <button
                onClick={handleCtaClick}
                className="ps-btn-order"
                style={{
                  marginTop: 32,
                  background: hs.ctaColor || primary, color: "#fff",
                  border: "none", borderRadius: 50, padding: "14px 34px",
                  fontSize: 15, fontWeight: 700, cursor: "pointer",
                  fontFamily: "inherit", letterSpacing: .5,
                  boxShadow: `0 4px 24px ${hs.ctaColor || primary}55`,
                }}
              >
                {hs.ctaText || "تسوق الآن"}
              </button>
            </div>
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
            <div style={{ maxWidth: 900, margin: "0 auto", padding: "0 24px", display: "flex", flexDirection: "column", gap: 12 }}>
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
            maxWidth: 900, margin: "0 auto", padding: "0 24px",
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
        <SectionWrapper type="trust" isPreview={isPreview} spacing={sec(tc, "trust")?.settings?.spacing} isHighlighted={highlightedSection === "trust"} style={{ order: sectionOrder("trust") }} registerRef={registerSectionRef} onHoverChange={setHoveredSection}>
          <section style={{ background: bgColor }}>
            {isRow ? renderRow() : renderGrid()}
          </section>
        </SectionWrapper>
        );
      })()}

      {/* ── Categories ── */}
      {sec(tc, "categories")?.enabled !== false && (categories.length > 0 || isPreview) && (() => {
        const s = sec(tc, "categories");
        const catTitle = s?.settings?.title || "التصنيفات";
        const catSubtitle = s?.settings?.subtitle || "اعثر على كل ما تريد";
        const maxItems = s?.settings?.maxItems || 6;
        const titleAlign = s?.settings?.titleAlign || "right";
        const displayStyle = s?.settings?.displayStyle || "grid";
        // ✦ كي التاجر مازال ما دار تصنيفات حقيقية، نعرضو أمثلة تجريبية جوه الـ builder فقط
        // ✦ باش يفهم كيفاش غادي يبان الديزاين — ما تبانش عند الزبون الحقيقي (isPreview=false)
        const usingDemo = categories.length === 0 && isPreview;
        const displayCategories = usingDemo ? DEMO_CATEGORIES : categories;
        return (
        <SectionWrapper type="categories" isPreview={isPreview} spacing={sec(tc, "categories")?.settings?.spacing} isHighlighted={highlightedSection === "categories"} style={{ order: sectionOrder("categories") }} registerRef={registerSectionRef} onHoverChange={setHoveredSection}>
        <section id="ps-categories" style={{ maxWidth: 980, margin: "0 auto", padding: "0 24px" }}>
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

          {/* Category cards — Grid (ثابت 2 أعمدة ديما، mobile و desktop) أو Row (سطر واحد، سكرول أفقي بلا scrollbar + أزرار عائمة) */}
          <div className={displayStyle === "row" ? "ps-carousel-wrap" : undefined} style={displayStyle === "row" ? { position: "relative" } : undefined}>
          <div
            ref={displayStyle === "row" ? catStripRef : null}
            className={displayStyle === "row" ? "ps-cat-strip" : undefined}
            style={{
              display: displayStyle === "row" ? "flex" : "grid",
              gridTemplateColumns: displayStyle === "row" ? undefined : "repeat(2, 1fr)",
              overflowX: displayStyle === "row" ? "auto" : undefined,
              scrollSnapType: displayStyle === "row" ? "x proximity" : undefined,
              gap: 16,
              paddingBottom: displayStyle === "row" ? 4 : 0,
            }}>
            {displayCategories.slice(0, maxItems).map(cat => (
              <div
                key={cat._id}
                onClick={() => { if (!cat._demo) navigate(`/store/${slug}/collections/${cat._id}`); }}
                style={{
                  position: "relative",
                  borderRadius: 16, overflow: "hidden", cursor: cat._demo ? "default" : "pointer",
                  height: 280,
                  boxShadow: "0 2px 8px rgba(0,0,0,.08)",
                  transition: "transform .25s, box-shadow .25s",
                  flexShrink: displayStyle === "row" ? 0 : undefined,
                  width: displayStyle === "row" ? 240 : "auto",
                  scrollSnapAlign: displayStyle === "row" ? "start" : undefined,
                  background: "#f1f1f3",
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 14px 34px rgba(0,0,0,.14)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,.08)"; }}
              >
                {/* Background image (fills the whole card) — أو كتلة لونية بلون المتجر كي ماكايناش صورة */}
                {cat.image ? (
                  <img
                    src={cat.image} alt={cat.name}
                    style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", transition: "transform .5s" }}
                    onMouseEnter={e => e.target.style.transform = "scale(1.06)"}
                    onMouseLeave={e => e.target.style.transform = "scale(1)"}
                  />
                ) : (
                  <div style={{ position: "absolute", inset: 0, background: primary, overflow: "hidden" }}>
                    <svg width="130" height="130" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.5"
                      style={{ position: "absolute", top: -18, insetInlineEnd: -18, opacity: .16 }}>
                      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" /><path d="M3 6h18" /><path d="M16 10a4 4 0 0 1-8 0" />
                    </svg>
                  </div>
                )}
                {/* Bottom gradient for text readability — غير كي كاينة صورة حقيقية */}
                {cat.image && (
                  <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: "62%", background: "linear-gradient(to top, rgba(0,0,0,.72), rgba(0,0,0,0))" }} />
                )}
                {/* Overlaid title + link */}
                <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, padding: "16px" }}>
                  <div style={{ fontWeight: 800, fontSize: 17, color: "#fff", marginBottom: 4, textShadow: "0 1px 4px rgba(0,0,0,.3)" }}>{cat.name}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12.5, fontWeight: 600, color: "rgba(255,255,255,.85)" }}>
                    تصفح المجموعة <span style={{ fontSize: 14 }}>←</span>
                  </div>
                </div>
                {/* بادج "مثال" — يبان غير على التصنيفات التجريبية باش التاجر يعرف بلي ماهيش حقيقية */}
                {cat._demo && (
                  <div style={{
                    position: "absolute", top: 10, insetInlineStart: 10,
                    background: "rgba(255,255,255,.92)",
                    color: "#1c1f24", fontSize: 10.5, fontWeight: 700,
                    padding: "4px 10px", borderRadius: 999, letterSpacing: ".3px",
                  }}>
                    مثال
                  </div>
                )}
              </div>
            ))}
          </div>
          {displayStyle === "row" && displayCategories.length > 2 && (
            <>
              <button
                aria-label="السابق"
                onClick={() => catStripRef.current?.scrollBy({ left: direction === "rtl" ? 240 : -240, behavior: "smooth" })}
                className="ps-carousel-nav ps-carousel-nav--prev"
                style={{ background: primary, top: "38%" }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5"><polyline points="15 6 9 12 15 18"/></svg>
              </button>
              <button
                aria-label="التالي"
                onClick={() => catStripRef.current?.scrollBy({ left: direction === "rtl" ? -240 : 240, behavior: "smooth" })}
                className="ps-carousel-nav ps-carousel-nav--next"
                style={{ background: primary, top: "38%" }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5"><polyline points="9 6 15 12 9 18"/></svg>
              </button>
            </>
          )}
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
        <SectionWrapper type="collection" isPreview={isPreview} spacing={sec(tc, "collection")?.settings?.spacing} isHighlighted={highlightedSection === "collection"} style={{ order: sectionOrder("collection") }} registerRef={registerSectionRef} onHoverChange={setHoveredSection}>
        <section ref={productsRef} id="ps-products" style={{ maxWidth: 980, margin: "0 auto", padding: "0 24px" }}>
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
            <div className={carouselMode ? "ps-carousel-wrap" : undefined} style={carouselMode ? { position: "relative" } : undefined}>
            <div
              ref={carouselMode ? carouselRef : null}
              className="ps-coll-grid"
              data-cols={columns}
              data-carousel={carouselMode ? "1" : "0"}
              style={carouselMode ? {
                display: "flex", gap: 20, overflowX: "auto", scrollSnapType: "x mandatory", paddingBottom: 4,
              } : {
                display: "grid", gridTemplateColumns: `repeat(${columns}, 1fr)`, gap: 20,
              }}
            >
              {visibleProducts.map((product, idx) => {
                const img = (product.images?.[0] || product.image || "");
                const hasImg = !!img;
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
                    onClick={() => { if (!isPreview) navigate(`/store/${slug}/product/${product._id}`); }}
                  >
                    {/* Image (with hover/touch CTA overlay) */}
                    <div style={{
                      position: "relative", overflow: "hidden", background: surfaceColor,
                      borderRadius: cardStyleCfg.imgRadius,
                      ...(imageRatio === "adapt" ? {} : { aspectRatio: aspectMap[imageRatio] || "1/1" }),
                    }}>
                      {hasImg ? (
                        <img
                          src={img}
                          alt={product.name}
                          className="ps-card-img"
                          onError={e => { e.target.onerror = null; e.target.style.display = "none"; e.target.nextSibling && (e.target.nextSibling.style.display = "flex"); }}
                          style={{ width: "100%", height: imageRatio === "adapt" ? "auto" : "100%", display: "block", objectFit: "cover" }}
                        />
                      ) : null}
                      <div style={{
                        position: "absolute", inset: 0, display: hasImg ? "none" : "flex",
                        alignItems: "center", justifyContent: "center", overflow: "hidden",
                        background: "#f1f2f4",
                      }}>
                        <div style={{ width: 68, height: 68, borderRadius: "50%", background: primary, display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="M21 15l-5-5L5 21" />
                          </svg>
                        </div>
                      </div>
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
                      {/* بادج "مثال" — يبان غير على المنتجات التجريبية باش التاجر يعرف بلي ماهيش حقيقية */}
                      {product._demo && (
                        <div style={{
                          position: "absolute", top: 10, insetInlineStart: 10,
                          background: "rgba(255,255,255,.92)",
                          color: primary, fontSize: 10.5, fontWeight: 700,
                          padding: "4px 10px", borderRadius: 999, letterSpacing: ".3px",
                        }}>
                          مثال
                        </div>
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
                            onClick={e => { e.stopPropagation(); if (!isPreview) navigate(`/store/${slug}/product/${product._id}`); }}
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
                      {showRating && (
                        <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 4 }}>
                          <span style={{ fontSize: 14, fontWeight: 700, color: "#f59e0b" }}>5.0</span>
                          <span style={{ fontSize: 15, color: "#f59e0b", letterSpacing: 1 }}>★★★★★</span>
                        </div>
                      )}
                      <p style={{ fontSize: cardStyleCfg.titleSize, fontWeight: 700, color: textColor, margin: `0 0 ${cardStyleCfg.gap - 2}px`, lineHeight: 1.4 }}>
                        {product.name}
                      </p>
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
            {carouselMode && (
              <>
                <button
                  aria-label="السابق"
                  onClick={() => carouselRef.current?.scrollBy({ left: direction === "rtl" ? 240 : -240, behavior: "smooth" })}
                  className="ps-carousel-nav ps-carousel-nav--prev"
                  style={{ background: primary }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5"><polyline points="15 6 9 12 15 18"/></svg>
                </button>
                <button
                  aria-label="التالي"
                  onClick={() => carouselRef.current?.scrollBy({ left: direction === "rtl" ? -240 : 240, behavior: "smooth" })}
                  className="ps-carousel-nav ps-carousel-nav--next"
                  style={{ background: primary }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5"><polyline points="9 6 15 12 9 18"/></svg>
                </button>
              </>
            )}
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

      {/* ── Reviews ── */}
      {sec(tc, "reviews")?.enabled !== false && sec(tc, "reviews") && (
        <SectionWrapper type="reviews" isPreview={isPreview} spacing={sec(tc, "reviews")?.settings?.spacing} isHighlighted={highlightedSection === "reviews"} style={{ order: sectionOrder("reviews") }} registerRef={registerSectionRef} onHoverChange={setHoveredSection}>
          <ReviewsSection
            settings={sec(tc, "reviews")?.settings}
            primary={primary} bgColor={bgColor} surfaceColor={surfaceColor}
            textColor={textColor} mutedTextColor={mutedTextColor} borderColor={borderColor}
          />
        </SectionWrapper>
      )}

      {/* ── FAQ ── */}
      {sec(tc, "faq")?.enabled !== false && sec(tc, "faq") && (
        <SectionWrapper type="faq" isPreview={isPreview} spacing={sec(tc, "faq")?.settings?.spacing} isHighlighted={highlightedSection === "faq"} style={{ order: sectionOrder("faq") }} registerRef={registerSectionRef} onHoverChange={setHoveredSection}>
          <FaqSection
            settings={sec(tc, "faq")?.settings}
            primary={primary} bgColor={bgColor} surfaceColor={surfaceColor}
            textColor={textColor} mutedTextColor={mutedTextColor} borderColor={borderColor}
          />
        </SectionWrapper>
      )}

      {/* ── Footer ── */}
      {sec(tc, "footer")?.enabled !== false && (
        <SectionWrapper type="footer" isPreview={isPreview} spacing={sec(tc, "footer")?.settings?.spacing} isHighlighted={highlightedSection === "footer"} style={{ order: sectionOrder("footer") }} registerRef={registerSectionRef} onHoverChange={setHoveredSection}>
          <StoreFooter store={store} slug={slug} bgColor={surfaceColor} textColor={textColor} mutedColor={mutedTextColor} light={surfaceColor === "#ffffff"} settings={sec(tc, "footer")?.settings || {}} />
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
          .ps-coll-grid[data-carousel="0"][data-cols="4"],
          .ps-coll-grid[data-carousel="0"][data-cols="3"] { grid-template-columns: repeat(1, 1fr) !important; }
          .ps-coll-grid[data-carousel="1"] > * { flex: 0 0 80% !important; }
        }
      `}</style>

      <CartDrawer
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        slug={slug}
        primary={primary}
        textColor={textColor}
        mutedTextColor={mutedTextColor}
        borderColor={borderColor}
        surfaceColor={surfaceColor}
        bgColor={bgColor}
        isPreview={isPreview}
      />

      {/* ── Highlight overlays — mobile فقط (preview): مربع + label، absolute ومقاسين بـ JS ── */}
      {isPreview && isNarrowViewport && (
        <>
          {overlayRects.hover && (
            <SectionHighlightOverlay rect={overlayRects.hover} label={SECTION_LABELS[hoveredSection] || hoveredSection} variant="hover" />
          )}
          {overlayRects.active && (
            <SectionHighlightOverlay rect={overlayRects.active} label={SECTION_LABELS[highlightedSection] || highlightedSection} variant="active" />
          )}
        </>
      )}
    </div>
  );
}

export default PublicStore;