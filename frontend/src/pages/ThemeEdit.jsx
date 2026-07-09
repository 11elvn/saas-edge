// ============================================================
// 📁 pages/ThemeEdit.jsx — Page Builder (Tassyir-style)
// 3 columns: Sections List | Live Preview | Settings Panel
// ============================================================
import { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import ImageUploader from "../components/ui/ImageUploader";

const API   = () => import.meta.env.VITE_API_URL;
const token = () => localStorage.getItem("token");

// ─────────────────────────────────────────────
// DEFAULT THEME CONFIG
// ─────────────────────────────────────────────
const DEFAULT_CONFIG = {
  sections: [
    {
      id: "announcement",
      type: "announcement",
      enabled: true,
      settings: {
        message: "توصيل لجميع ولايات الجزائر 🇩🇿 · الدفع عند الاستلام 💰",
        bgColor: "#111827",
        textColor: "#ffffff",
        animation: true,
        showClose: false,
      },
    },
    {
      id: "header",
      type: "header",
      enabled: true,
      settings: {
        showSearch: true,
        showCart: true,
        sticky: true,
      },
    },
    {
      id: "hero",
      type: "hero",
      enabled: true,
      settings: {
        image: "",
        title: "",
        subtitle: "اكتشف أفضل المنتجات",
        ctaText: "تسوق الآن",
        ctaLink: "#products",
        ctaColor: "",
        overlayOpacity: 50,
        height: "large",
        textAlign: "center",
      },
    },
    {
      id: "trust",
      type: "trust",
      enabled: true,
      settings: {
        layout: "row",
        badges: [
          { id: "cod",      enabled: true, title: "دفع عند الاستلام", sub: "دفع آمن وسهل" },
          { id: "shipping", enabled: true, title: "توصيل سريع",       sub: "لجميع ولايات الجزائر" },
          { id: "return",   enabled: true, title: "إرجاع مجاني",      sub: "خلال 7 أيام" },
          { id: "support",  enabled: true, title: "دعم 24/7",         sub: "نحن هنا لمساعدتك" },
          { id: "secure",   enabled: true, title: "متجر موثوق",       sub: "آلاف العملاء الراضين" },
        ],
        bgColor: "#ffffff",
      },
    },
    {
      id: "collection",
      type: "collection",
      enabled: true,
      settings: {
        title: "أحدث المنتجات",
        titleAlign: "right",        // right | center | left
        selectionMode: "all",       // حاليا All Products فقط
        productsShown: 8,           // 4 | 8 | 12
        carouselMode: false,
        columns: 3,                 // 2 | 3 | 4
        cardStyle: "default",       // default | minimal | bordered
        imageRatio: "1:1",          // 1:1 | 3:4 | adapt
        showBadge: true,
        showRating: false,
        showViewAll: true,
        viewAllText: "عرض الكل",
        viewAllStyle: "link",       // link | filled | outline
        infiniteScroll: false,
      },
    },
    {
      id: "categories",
      type: "categories",
      enabled: true,
      settings: {
        title: "التصنيفات",
        showIcons: true,
        maxItems: 6,
      },
    },
    {
      id: "footer",
      type: "footer",
      enabled: true,
      settings: {
        copyright: "",
        showSocials: false,
        bgColor: "#111827",
        textColor: "#ffffff",
      },
    },
  ],
  styles: {
    primaryColor: "#2563eb",
    secondaryColor: "#0f172a",
    backgroundColor: "#ffffff",
    surfaceColor: "#fafafa",
    textColor: "#111111",
    mutedTextColor: "#666666",
    borderColor: "#ebebeb",
    fontFamily: "Cairo",
    borderRadius: "medium",
    buttonStyle: "filled",
    direction: "rtl",
  },
};

// ─────────────────────────────────────────────
// ICON LIB — رموز SVG بدل الإيموجي
// ─────────────────────────────────────────────
function Icon({ path, size = 14, viewBox = "0 0 24 24" }) {
  return (
    <svg width={size} height={size} viewBox={viewBox} fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {path}
    </svg>
  );
}

const ICON_PATHS = {
  announcement: <><path d="m3 11 18-5v12L3 14v-3z"/><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/></>,
  header:       <><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/></>,
  hero:         <><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.1-3.1a2 2 0 0 0-2.8 0L6 21"/></>,
  trust:        <><path d="M12 2 4 5v6c0 5.25 3.4 9.74 8 11 4.6-1.26 8-5.75 8-11V5l-8-3z"/><path d="m9 12 2 2 4-4"/></>,
  collection:   <><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></>,
  categories:   <><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></>,
  footer:       <><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 15h18"/></>,
  home:         <><path d="M3 9.5 12 3l9 6.5V20a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z"/></>,
  search:       <><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></>,
};

// ─────────────────────────────────────────────
// SECTION ICONS & LABELS
// ─────────────────────────────────────────────
const SECTION_META = {
  announcement: { label: "Announcement Bar", icon: <Icon path={ICON_PATHS.announcement} /> },
  header:       { label: "Header",           icon: <Icon path={ICON_PATHS.header} /> },
  hero:         { label: "Hero Banner",      icon: <Icon path={ICON_PATHS.hero} /> },
  trust:        { label: "Trust Badges",     icon: <Icon path={ICON_PATHS.trust} /> },
  collection:   { label: "Collection",       icon: <Icon path={ICON_PATHS.collection} /> },
  categories:   { label: "Categories",       icon: <Icon path={ICON_PATHS.categories} /> },
  footer:       { label: "Footer",           icon: <Icon path={ICON_PATHS.footer} /> },
};

const PAGES = [
  { id: "home",     label: "Home",     icon: <Icon path={ICON_PATHS.home} size={13} /> },
  { id: "product",  label: "Product",  icon: <Icon path={ICON_PATHS.collection} size={13} /> },
  { id: "category", label: "Category", icon: <Icon path={ICON_PATHS.categories} size={13} /> },
  { id: "search",   label: "Search",   icon: <Icon path={ICON_PATHS.search} size={13} /> },
];

const FONTS     = ["Cairo","Inter","Poppins","Roboto"];
const RADII     = [{ v:"small", l:"صغير" },{ v:"medium", l:"متوسط" },{ v:"large", l:"كبير" }];
const BTN_STYLE = [{ v:"filled", l:"ممتلئ" },{ v:"outline", l:"مخطط" },{ v:"ghost", l:"شفاف" }];

// ─────────────────────────────────────────────
// CSS
// ─────────────────────────────────────────────
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&family=Inter:wght@400;500;600;700;800&family=IBM+Plex+Mono:wght@400;500;600;700&display=swap');

/* ═══════════════════════════════════════════════════════════
   DESIGN TOKENS — "Workbench" system
   عدّل هاد المتغيرات فقط باش تبدل الهوية اللونية بالكامل.
   ═══════════════════════════════════════════════════════════ */
.pb-shell {
  --pb-ink:        #0f1115;
  --pb-ink-soft:   #4b4f57;
  --pb-muted:      #8b8f98;
  --pb-line:       #e4e4e7;
  --pb-line-soft:  #edeef1;
  --pb-bg:         #f4f4f5;
  --pb-surface:    #ffffff;
  --pb-surface-2:  #fafafa;
  --pb-accent:     #111318;      /* اللون الأساسي — بدّلو هنا */
  --pb-accent-ink: #ffffff;
  --pb-accent-soft: rgba(17,19,24,.06);
  --pb-danger:     #dc2626;
  --pb-r-sm: 6px;
  --pb-r-md: 9px;
  --pb-r-lg: 13px;
  --pb-sans: 'Inter', sans-serif;
  --pb-mono: 'IBM Plex Mono', ui-monospace, 'SF Mono', monospace;
}

@keyframes pb-spin   { to { transform:rotate(360deg); } }
@keyframes pb-toast  { from { opacity:0; transform:translateX(-50%) translateY(10px); } }
@keyframes pb-panel  { from { opacity:0; transform:translateX(14px); } to { opacity:1; transform:translateX(0); } }
@keyframes pb-fade   { from { opacity:0; transform:translateY(4px); } to { opacity:1; transform:translateY(0); } }
@keyframes pb-line-grow { from { transform: scaleY(0); } to { transform: scaleY(1); } }

/* ── SHELL ── */
.pb-shell {
  display: flex;
  height: calc(100vh - 60px);
  background: var(--pb-bg);
  overflow: hidden;
  font-family: var(--pb-sans);
  color: var(--pb-ink);
}

/* ══════════════════ TOP BAR ══════════════════
   شريط أوامر رفيع بدل الـ glass bar — breadcrumb يوضّح
   وين راك (Store ▸ Page ▸ Section) بدل مجرد أزرار عائمة. */
.pb-topbar {
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 60px;
  background: var(--pb-surface);
  border-bottom: 1px solid var(--pb-line);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 18px;
  z-index: 100;
  gap: 14px;
}
.pb-topbar__left  { display:flex; align-items:center; gap:10px; min-width: 0; }
.pb-topbar__mid   { display:flex; align-items:center; gap:8px; position:relative; }
.pb-topbar__right { display:flex; align-items:center; gap:8px; }

.pb-back-btn {
  display: flex; align-items: center; gap: 6px;
  font-size: .78rem; font-weight: 600; color: var(--pb-ink-soft);
  background: none; border: none; cursor: pointer;
  font-family: inherit; padding: 6px 10px; border-radius: var(--pb-r-sm);
  transition: background .15s, color .15s;
}
.pb-back-btn:hover { background: var(--pb-line-soft); color: var(--pb-ink); }

.pb-crumb {
  display: flex; align-items: center; gap: 6px;
  font-size: .78rem; color: var(--pb-muted); font-weight: 500;
  padding-inline-start: 8px; border-inline-start: 1px solid var(--pb-line);
  white-space: nowrap;
}
.pb-crumb b { color: var(--pb-ink); font-weight: 700; }
.pb-crumb__sep { color: var(--pb-line); }

.pb-draft-badge {
  display: flex; align-items: center; gap: 5px;
  font-size: .68rem; font-weight: 700; font-family: var(--pb-mono);
  padding: 4px 9px 4px 7px; border-radius: 99px;
  background: #fff7ed; color: #9a5b0a; border: 1px solid #fde3bd;
}
.pb-draft-badge::before {
  content: ""; width: 5px; height: 5px; border-radius: 50%;
  background: #ea8b1c; flex-shrink: 0;
}

.pb-view-btn {
  display: flex; align-items: center; justify-content: center;
  width: 32px; height: 32px; border-radius: var(--pb-r-sm); border: 1px solid var(--pb-line);
  background: var(--pb-surface); cursor: pointer; color: var(--pb-muted);
  transition: all .15s;
}
.pb-view-btn:hover       { border-color: var(--pb-ink-soft); color: var(--pb-ink); }
.pb-view-btn--active     {
  border-color: var(--pb-accent);
  background: var(--pb-accent);
  color: var(--pb-accent-ink);
}

.pb-page-select {
  display: flex; align-items: center; gap: 7px;
  padding: 7px 12px; border-radius: var(--pb-r-sm); border: 1px solid var(--pb-line);
  font-size: .8rem; font-weight: 600; background: var(--pb-surface); cursor: pointer;
  color: var(--pb-ink); font-family: inherit; transition: all .15s;
}
.pb-page-select:hover { border-color: var(--pb-ink-soft); }

.pb-page-dropdown {
  position: absolute;
  top: 42px; left: 50%; transform: translateX(-50%);
  background: var(--pb-surface);
  border: 1px solid var(--pb-line);
  border-radius: var(--pb-r-md); padding: 5px;
  box-shadow: 0 16px 40px rgba(15,17,21,.14);
  z-index: 999; min-width: 180px;
}
.pb-page-option {
  display: flex; align-items: center; gap: 9px;
  padding: 9px 10px; border-radius: var(--pb-r-sm); cursor: pointer;
  font-size: .82rem; font-weight: 500; color: var(--pb-ink-soft);
  transition: background .12s;
}
.pb-page-option:hover    { background: var(--pb-line-soft); }
.pb-page-option--active  { background: var(--pb-accent-soft); font-weight: 700; color: var(--pb-ink); }

.pb-publish-btn {
  padding: 8px 18px; border-radius: var(--pb-r-sm); border: none;
  background: var(--pb-accent); color: var(--pb-accent-ink);
  font-size: .8rem; font-weight: 700; cursor: pointer;
  font-family: inherit; transition: opacity .15s;
  display: flex; align-items: center; gap: 7px;
}
.pb-publish-btn:hover:not(:disabled) { opacity: .85; }
.pb-publish-btn:disabled { opacity: .45; cursor: not-allowed; }

.pb-preview-btn {
  padding: 8px 14px; border-radius: var(--pb-r-sm);
  border: 1px solid var(--pb-line); background: var(--pb-surface);
  font-size: .8rem; font-weight: 600; cursor: pointer;
  font-family: inherit; color: var(--pb-ink); transition: all .15s;
}
.pb-preview-btn:hover { border-color: var(--pb-ink-soft); background: var(--pb-line-soft); }

/* ── BODY ── */
.pb-body {
  display: flex;
  width: 100%;
  height: 100%;
  padding-top: 60px;
}

/* ══════════════════ LEFT — Outline rail ══════════════════
   قائمة الـ sections كـ "outline" مرقّم بخط رابط عمودي —
   الرقم هنا معلومة حقيقية (ترتيب الظهور في الصفحة). */
.pb-left {
  width: 250px;
  flex-shrink: 0;
  background: var(--pb-surface);
  border-right: 1px solid var(--pb-line);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.pb-left__header {
  padding: 14px 16px 8px;
}

.pb-left__title {
  font-size: .68rem; font-weight: 700; font-family: var(--pb-mono);
  color: var(--pb-muted); text-transform: uppercase;
  letter-spacing: .09em;
}

.pb-sections-list {
  flex: 1; overflow-y: auto; padding: 6px 12px 12px;
  position: relative;
}

.pb-section-item {
  display: flex; align-items: center; gap: 10px;
  padding: 10px 8px; border-radius: var(--pb-r-md); cursor: pointer;
  transition: background .14s, border-color .14s;
  border: 1px solid transparent;
  position: relative;
  animation: pb-fade .2s ease both;
}
.pb-section-item:hover   { background: var(--pb-line-soft); }
.pb-section-item--active {
  background: var(--pb-accent-soft);
  border-color: rgba(17,19,24,.14);
}
.pb-section-item--disabled { opacity: .4; }
.pb-section-item--dragging { opacity: .35; }
.pb-section-item--drop-target::before {
  content: "";
  position: absolute; left: 34px; right: 8px; top: -2px;
  height: 2px; background: var(--pb-accent); border-radius: 2px;
}

.pb-section-item__drag {
  cursor: grab; color: var(--pb-line); flex-shrink: 0;
  width: 14px; display: flex; align-items: center; justify-content: center;
}
.pb-section-item:hover .pb-section-item__drag { color: var(--pb-muted); }

.pb-section-item__index {
  font-family: var(--pb-mono); font-size: .68rem; font-weight: 600;
  color: var(--pb-muted); width: 16px; flex-shrink: 0; text-align: center;
}
.pb-section-item--active .pb-section-item__index { color: var(--pb-ink); }

.pb-section-item__icon  {
  width: 26px; height: 26px; border-radius: var(--pb-r-sm);
  display:flex; align-items:center; justify-content:center; flex-shrink: 0;
  background: var(--pb-line-soft); color: var(--pb-ink-soft);
}
.pb-section-item--active .pb-section-item__icon { background: var(--pb-accent); color: var(--pb-accent-ink); }

.pb-section-item__label { flex: 1; font-size: .82rem; font-weight: 600; color: var(--pb-ink); min-width: 0;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

.pb-toggle {
  position: relative;
  width: 30px; height: 17px; flex-shrink: 0;
}
.pb-toggle input { opacity: 0; width: 0; height: 0; }
.pb-toggle__slider {
  position: absolute; inset: 0;
  background: var(--pb-line); border-radius: 99px;
  transition: background .18s; cursor: pointer;
}
.pb-toggle__slider::after {
  content: "";
  position: absolute;
  left: 2px; top: 2px;
  width: 13px; height: 13px;
  border-radius: 50%; background: #fff;
  box-shadow: 0 1px 2px rgba(15,17,21,.25);
  transition: transform .18s;
}
.pb-toggle input:checked + .pb-toggle__slider { background: var(--pb-accent); }
.pb-toggle input:checked + .pb-toggle__slider::after { transform: translateX(13px); }

.pb-add-section {
  padding: 10px 12px 14px;
  border-top: 1px solid var(--pb-line-soft);
}
.pb-add-btn {
  width: 100%; padding: 9px;
  border: 1px dashed var(--pb-line); border-radius: var(--pb-r-md);
  background: none; cursor: pointer; color: var(--pb-muted);
  font-size: .78rem; font-weight: 600; font-family: inherit;
  display: flex; align-items: center; justify-content: center; gap: 6px;
  transition: all .15s;
}
.pb-add-btn:hover { border-color: var(--pb-ink-soft); color: var(--pb-ink); }

/* ══════════════════ CENTER — Preview ══════════════════
   ruler حقيقي فوق المعاينة يبيّن العرض بالـ px — بدل chrome bar
   مزخرف. هذا معلومة مفيدة فعلا للـ builder (زي DevTools). */
.pb-center {
  flex: 1; overflow: hidden;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  background:
    linear-gradient(var(--pb-line-soft) 1px, transparent 1px),
    linear-gradient(90deg, var(--pb-line-soft) 1px, transparent 1px);
  background-size: 22px 22px;
  background-color: var(--pb-bg);
  padding: 20px;
  position: relative;
}

.pb-ruler {
  display: flex; align-items: center; gap: 8px;
  font-family: var(--pb-mono); font-size: .68rem; font-weight: 600;
  color: var(--pb-muted);
  background: var(--pb-surface); border: 1px solid var(--pb-line);
  padding: 5px 12px; border-radius: 99px; margin-bottom: 12px;
  flex-shrink: 0;
}
.pb-ruler b { color: var(--pb-ink); font-weight: 700; }
.pb-ruler__dot { width: 5px; height: 5px; border-radius: 50%; background: #22c55e; }

.pb-preview-desktop {
  width: 100%; height: 100%;
  background: var(--pb-surface); border-radius: var(--pb-r-lg);
  box-shadow: 0 1px 0 rgba(255,255,255,.6) inset, 0 1px 2px rgba(15,17,21,.04);
  border: 1px solid var(--pb-line);
  overflow: hidden;
  display: flex; flex-direction: column;
}

/* — Mobile frame: simplifié, ماشي phone bezel واقعي — */
.pb-iphone {
  position: relative;
  aspect-ratio: 375 / 812;
  height: calc(100vh - 190px);
  max-height: 720px;
  min-height: 460px;
  width: auto;
  flex-shrink: 0;
  margin: auto;
}
.pb-iphone__frame {
  position: absolute;
  inset: 0;
  border-radius: 32px;
  background: var(--pb-ink);
  box-shadow: 0 20px 48px rgba(15,17,21,.22);
  pointer-events: none;
  z-index: 5;
}
.pb-iphone__screen-wrap {
  position: absolute;
  top: 8px; left: 8px; right: 8px; bottom: 8px;
  border-radius: 26px;
  overflow: hidden;
  background: #000;
  z-index: 10;
}
.pb-iphone__island {
  position: absolute;
  top: 8px;
  left: 50%;
  transform: translateX(-50%);
  width: 64px; height: 5px;
  background: #000;
  border-radius: 99px;
  z-index: 25;
  pointer-events: none;
}
.pb-iphone__status {
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 30px;
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  padding: 0 16px;
  z-index: 22;
  pointer-events: none;
  background: rgba(255,255,255,0.96);
}
.pb-iphone__time {
  font-size: 11px; font-weight: 600;
  color: #000; font-family: var(--pb-mono);
  justify-self: start;
}
.pb-iphone__island-spacer { width: 64px; height: 5px; }
.pb-iphone__signals {
  display: flex; align-items: center; gap: 4px;
  justify-self: end;
}
.pb-iphone__btn-right, .pb-iphone__btn-left1, .pb-iphone__btn-left2, .pb-iphone__btn-left3 { display: none; }
.pb-iphone__content {
  position: absolute;
  top: 30px;
  left: 0; right: 0; bottom: 0;
  overflow: hidden;
}
.pb-iphone__iframe {
  position: absolute;
  top: 0; left: 0;
  width: 375px;
  height: 812px;
  border: none;
  display: block;
  transform-origin: top left;
}

.pb-chrome-bar {
  background: var(--pb-surface-2); padding: 8px 12px;
  display: flex; align-items: center; gap: 7px;
  border-bottom: 1px solid var(--pb-line); flex-shrink: 0;
}
.pb-chrome-dot { display: none; }
.pb-chrome-url {
  flex:1; margin: 0;
  background: var(--pb-surface); border:1px solid var(--pb-line);
  border-radius: var(--pb-r-sm); padding:5px 12px;
  font-size:11px; color: var(--pb-muted); font-family: var(--pb-mono);
  display:flex; align-items:center; gap:6px;
}

.pb-preview-iframe {
  width: 100%; height: 100%; border: none;
  flex: 1;
}

.pb-preview-section-highlight {
  outline: 2px solid var(--pb-accent);
  outline-offset: -2px;
}

/* ══════════════════ RIGHT — Inspector ══════════════════ */
.pb-right {
  width: 330px;
  flex-shrink: 0;
  background: var(--pb-surface);
  border-left: 1px solid var(--pb-line);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: pb-panel .18s ease;
}

.pb-right__header {
  padding: 14px 16px;
  border-bottom: 1px solid var(--pb-line);
  display: flex; align-items: center; justify-content: space-between;
  gap: 10px;
}

.pb-right__title {
  font-size: .86rem; font-weight: 700; color: var(--pb-ink);
  display: flex; align-items: center; gap: 10px;
  min-width: 0;
}
.pb-right__title-icon {
  width: 28px; height: 28px; border-radius: var(--pb-r-sm);
  background: var(--pb-accent); color: var(--pb-accent-ink);
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.pb-right__title-text { display: flex; flex-direction: column; gap: 1px; min-width: 0; }
.pb-right__title-text span:first-child {
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.pb-right__eyebrow {
  font-size: .64rem; font-weight: 600; font-family: var(--pb-mono);
  color: var(--pb-muted); text-transform: uppercase; letter-spacing: .07em;
}

.pb-right__close {
  width: 26px; height: 26px; border-radius: var(--pb-r-sm);
  border: 1px solid var(--pb-line); background: var(--pb-surface);
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; color: var(--pb-muted); transition: all .15s;
  flex-shrink: 0;
}
.pb-right__close:hover { background: var(--pb-line-soft); color: var(--pb-ink); }

.pb-right__body { flex:1; overflow-y:auto; padding: 16px; display:flex; flex-direction:column; gap:18px; }

/* ── FIELD GROUPS — كارت بدل خطوط فراغ بسيطة ── */
.pb-group {
  display:flex; flex-direction:column; gap:12px;
  background: var(--pb-surface-2);
  border: 1px solid var(--pb-line-soft);
  border-radius: var(--pb-r-md);
  padding: 13px;
}

.pb-group__label {
  font-size: .66rem; font-weight: 700; font-family: var(--pb-mono);
  color: var(--pb-muted); text-transform: uppercase; letter-spacing: .08em;
}

.pb-field { display:flex; flex-direction:column; gap:6px; }

.pb-label {
  font-size: .76rem; font-weight: 600; color: var(--pb-ink-soft);
  display: flex; justify-content: space-between;
}
.pb-label span { font-weight: 400; font-family: var(--pb-mono); color: var(--pb-muted); font-size: .7rem; }

.pb-input {
  width: 100%; padding: 8px 10px;
  border: 1px solid var(--pb-line); border-radius: var(--pb-r-sm);
  font-size: .82rem; color: var(--pb-ink); font-family: inherit;
  background: var(--pb-surface); outline: none; box-sizing: border-box;
  transition: border-color .15s;
}
.pb-input:focus { border-color: var(--pb-accent); }

.pb-textarea {
  width: 100%; padding: 8px 10px; min-height: 72px; resize: vertical;
  border: 1px solid var(--pb-line); border-radius: var(--pb-r-sm);
  font-size: .82rem; color: var(--pb-ink); font-family: inherit;
  background: var(--pb-surface); outline: none; box-sizing: border-box;
  transition: border-color .15s;
}
.pb-textarea:focus { border-color: var(--pb-accent); }

/* Color field */
.pb-color-row { display:flex; align-items:center; gap:8px; }
.pb-color-swatch {
  width: 34px; height: 34px; border-radius: var(--pb-r-sm);
  border: 1px solid var(--pb-line); overflow: hidden; position: relative;
  cursor: pointer; flex-shrink: 0;
}
.pb-color-swatch input[type=color] {
  position: absolute; inset: -4px; width: calc(100% + 8px);
  height: calc(100% + 8px); opacity: 0; cursor: pointer;
}
.pb-color-hex {
  flex: 1; padding: 8px 10px;
  border: 1px solid var(--pb-line); border-radius: var(--pb-r-sm);
  font-size: .8rem; font-family: var(--pb-mono); color: var(--pb-ink-soft);
  background: var(--pb-surface); outline: none;
  transition: border-color .15s;
}
.pb-color-hex:focus { border-color: var(--pb-accent); }

/* Toggle row */
.pb-toggle-row {
  display: flex; align-items: center; justify-content: space-between;
  padding: 3px 0;
}
.pb-toggle-row__label { font-size: .81rem; font-weight: 500; color: var(--pb-ink-soft); }

/* Segment */
.pb-segment {
  display:flex; gap:3px;
  background: var(--pb-line-soft);
  padding: 3px; border-radius: var(--pb-r-sm);
}
.pb-seg-btn {
  flex: 1; padding: 7px 6px; border-radius: 5px;
  border: none; background: transparent;
  font-size: .74rem; font-weight: 600; cursor: pointer;
  font-family: inherit; color: var(--pb-muted); transition: all .15s;
  text-align: center;
}
.pb-seg-btn:hover      { color: var(--pb-ink); }
.pb-seg-btn--active    { background: var(--pb-surface); color: var(--pb-ink); font-weight: 700; box-shadow: 0 1px 2px rgba(15,17,21,.12); }

/* Range */
.pb-range { width: 100%; accent-color: var(--pb-accent); }

/* Link input */
.pb-link-input {
  display: flex; align-items: center; gap: 8px;
  border: 1px solid var(--pb-line); border-radius: var(--pb-r-sm);
  padding: 8px 10px; background: var(--pb-surface);
  color: var(--pb-muted); transition: border-color .15s;
}
.pb-link-input__field {
  flex: 1; border: none; outline: none; font-size: .8rem;
  color: var(--pb-ink); background: transparent; font-family: var(--pb-mono);
}

/* Background image row */
.pb-img-row { display: flex; gap: 9px; }
.pb-img-thumb {
  position: relative; width: 60px; height: 60px;
  border-radius: var(--pb-r-sm); overflow: hidden; flex-shrink: 0;
  border: 1px solid var(--pb-line);
}
.pb-img-thumb img { width: 100%; height: 100%; object-fit: cover; display: block; }
.pb-img-thumb__remove {
  position: absolute; top: 3px; right: 3px;
  width: 16px; height: 16px; border-radius: 50%;
  background: rgba(15,17,21,.7); color: #fff; border: none;
  font-size: 10px; display: flex; align-items: center; justify-content: center;
  cursor: pointer;
}
.pb-img-add {
  width: 60px; height: 60px; border-radius: var(--pb-r-sm);
  border: 1px dashed var(--pb-line); flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  color: var(--pb-muted); cursor: pointer; transition: all .15s;
}
.pb-img-add:hover { border-color: var(--pb-ink-soft); color: var(--pb-ink); }

/* Text alignment row */
.pb-align-row { display: flex; gap: 5px; }
.pb-align-btn {
  flex: 1; padding: 9px; border-radius: var(--pb-r-sm);
  border: 1px solid var(--pb-line); background: var(--pb-surface);
  display: flex; align-items: center; justify-content: center;
  color: var(--pb-muted); cursor: pointer; transition: all .15s;
}
.pb-align-btn--active {
  border-color: var(--pb-accent);
  background: var(--pb-accent); color: var(--pb-accent-ink);
}

/* Badge card */
.pb-badge-card {
  background: var(--pb-surface); border: 1px solid var(--pb-line);
  border-radius: var(--pb-r-sm); padding: 11px; display:flex; flex-direction:column; gap:9px;
  transition: border-color .15s;
}
.pb-badge-card:hover { border-color: var(--pb-ink-soft); }
.pb-badge-card__header {
  display: flex; align-items: center; justify-content: space-between;
  font-size: .8rem; font-weight: 700; color: var(--pb-ink);
}

/* No-selection state */
.pb-no-selection {
  flex:1; display:flex; flex-direction:column;
  align-items:center; justify-content:center;
  gap:12px; color: var(--pb-muted);
  padding: 36px;
  text-align: center;
}
.pb-no-selection__icon {
  width: 44px; height: 44px; border-radius: var(--pb-r-md);
  background: var(--pb-line-soft); display: flex; align-items: center; justify-content: center;
}
.pb-no-selection__text { font-size: .82rem; line-height: 1.6; max-width: 190px; }

/* Tabs */
.pb-tabs {
  display:flex; gap:3px;
  padding: 10px; margin: 0;
  background: var(--pb-surface);
  border-bottom: 1px solid var(--pb-line);
}
.pb-tab {
  flex: 1;
  padding: 8px 12px; font-size: .8rem; font-weight: 600;
  color: var(--pb-muted); border: none; background: var(--pb-line-soft); cursor: pointer;
  font-family: inherit; border-radius: var(--pb-r-sm);
  transition: all .15s;
}
.pb-tab--active { background: var(--pb-accent); color: var(--pb-accent-ink); font-weight: 700; }

/* ── TOAST ── */
.pb-toast {
  position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%);
  padding: 10px 20px; border-radius: var(--pb-r-md);
  font-size: .82rem; font-weight: 600; z-index: 9999;
  box-shadow: 0 16px 40px rgba(15,17,21,.2); white-space: nowrap;
  animation: pb-toast .2s ease; font-family: var(--pb-sans);
}
.pb-toast--success { background: var(--pb-ink); color:#fff; }
.pb-toast--error   { background: var(--pb-danger); color:#fff; }

/* Loading */
.pb-loading {
  flex:1; display:flex; align-items:center; justify-content:center;
  flex-direction:column; gap:14px; color: var(--pb-muted, #8b8f98); font-size:.84rem;
  font-family: var(--pb-sans, 'Inter', sans-serif);
  background: var(--pb-bg, #f4f4f5);
}
.pb-spinner {
  width:26px; height:26px; border:2.5px solid var(--pb-line-soft, #edeef1);
  border-top-color: var(--pb-ink, #0f1115); border-radius:50%;
  animation: pb-spin .7s linear infinite;
}

/* font options */
.pb-font-grid { display:grid; grid-template-columns:1fr 1fr; gap:6px; }
.pb-font-btn {
  padding: 8px 6px; border-radius: var(--pb-r-sm);
  border: 1px solid var(--pb-line); background: var(--pb-surface);
  font-size: .78rem; font-weight: 600; cursor: pointer;
  font-family: inherit; color: var(--pb-ink-soft);
  transition: all .15s; text-align: center;
}
.pb-font-btn:hover   { border-color: var(--pb-ink-soft); }
.pb-font-btn--active {
  border-color: var(--pb-accent);
  background: var(--pb-accent); color: var(--pb-accent-ink);
}
`;

// ─────────────────────────────────────────────
// TOGGLE COMPONENT
// ─────────────────────────────────────────────
function Toggle({ checked, onChange }) {
  return (
    <label className="pb-toggle">
      <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} />
      <span className="pb-toggle__slider" />
    </label>
  );
}

// ─────────────────────────────────────────────
// COLOR FIELD
// ─────────────────────────────────────────────
function ColorField({ label, value, onChange }) {
  return (
    <div className="pb-field">
      {label && <div className="pb-label">{label}</div>}
      <div className="pb-color-row">
        <div className="pb-color-swatch" style={{ background: value }}>
          <input type="color" value={value} onChange={e => onChange(e.target.value)} />
        </div>
        <input
          className="pb-color-hex"
          value={value}
          onChange={e => onChange(e.target.value)}
          maxLength={7}
        />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// SECTION SETTINGS PANELS
// ─────────────────────────────────────────────
function AnnouncementSettings({ settings, onChange }) {
  const s = (k, v) => onChange({ ...settings, [k]: v });
  return (
    <>
      <div className="pb-group">
        <div className="pb-group__label">Content</div>
        <div className="pb-field">
          <div className="pb-label">Message</div>
          <textarea className="pb-textarea" value={settings.message} onChange={e => s("message", e.target.value)} />
        </div>
      </div>
      <div className="pb-group">
        <div className="pb-group__label">Styles</div>
        <ColorField label="Background color" value={settings.bgColor}   onChange={v => s("bgColor", v)} />
        <ColorField label="Text color"       value={settings.textColor} onChange={v => s("textColor", v)} />
      </div>
      <div className="pb-group">
        <div className="pb-group__label">Options</div>
        <div className="pb-toggle-row">
          <span className="pb-toggle-row__label">Animation (marquee)</span>
          <Toggle checked={settings.animation} onChange={v => s("animation", v)} />
        </div>
        <div className="pb-toggle-row">
          <span className="pb-toggle-row__label">Show close button</span>
          <Toggle checked={settings.showClose} onChange={v => s("showClose", v)} />
        </div>
      </div>
    </>
  );
}

function HeaderSettings({ settings, onChange, store, onLogoChange }) {
  const s = (k, v) => onChange({ ...settings, [k]: v });
  return (
    <>
      <div className="pb-group">
        <div className="pb-group__label">Branding</div>
        <div className="pb-field">
          <div className="pb-label">Store name</div>
          <input className="pb-input" value={store?.name || ""} disabled placeholder="اسم المتجر" />
        </div>
        <div className="pb-field">
          <div className="pb-label">Logo image</div>
          <ImageUploader value={store?.logo || ""} onChange={onLogoChange} label="Logo" dark={false} />
        </div>
      </div>
      <div className="pb-group">
        <div className="pb-group__label">Actions</div>
        <div className="pb-toggle-row">
          <span className="pb-toggle-row__label">Show search</span>
          <Toggle checked={settings.showSearch} onChange={v => s("showSearch", v)} />
        </div>
        <div className="pb-toggle-row">
          <span className="pb-toggle-row__label">Show cart</span>
          <Toggle checked={settings.showCart} onChange={v => s("showCart", v)} />
        </div>
        <div className="pb-toggle-row">
          <span className="pb-toggle-row__label">Sticky header</span>
          <Toggle checked={settings.sticky} onChange={v => s("sticky", v)} />
        </div>
      </div>
    </>
  );
}

function HeroSettings({ settings, onChange }) {
  const s = (k, v) => onChange({ ...settings, [k]: v });

  const handleFile = async (file) => {
    if (!file || !file.type.startsWith("image/")) return;
    const CLOUDINARY_CLOUD  = "dbcbkly4w";
    const CLOUDINARY_PRESET = "saas_edge";
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", CLOUDINARY_PRESET);
      const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD}/image/upload`, { method: "POST", body: formData });
      const data = await res.json();
      if (data.secure_url) s("image", data.secure_url);
    } catch (_) {}
  };

  return (
    <>
      <div className="pb-group">
        <div className="pb-group__label">Content</div>

        <div className="pb-field">
          <div className="pb-label">Headline</div>
          <input className="pb-input" value={settings.title} onChange={e => s("title", e.target.value)} placeholder="مرحباً بك في متجرنا" />
        </div>

        <div className="pb-field">
          <div className="pb-label">Subheading</div>
          <input className="pb-input" value={settings.subtitle} onChange={e => s("subtitle", e.target.value)} />
        </div>

        <div className="pb-field">
          <div className="pb-label">Button text</div>
          <input className="pb-input" value={settings.ctaText} onChange={e => s("ctaText", e.target.value)} />
        </div>

        <div className="pb-field">
          <div className="pb-label">Button link</div>
          <div className="pb-link-input">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10 13a5 5 0 007.07 0l1.93-1.93a5 5 0 00-7.07-7.07L10.5 5.43"/>
              <path d="M14 11a5 5 0 00-7.07 0l-1.93 1.93a5 5 0 007.07 7.07L13.5 18.57"/>
            </svg>
            <input className="pb-link-input__field" value={settings.ctaLink || ""} onChange={e => s("ctaLink", e.target.value)} placeholder="#products" />
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </div>
        </div>

        <ColorField label="Button color" value={settings.ctaColor || "#111827"} onChange={v => s("ctaColor", v)} />

        <div className="pb-field">
          <div className="pb-label">Background image</div>
          <div className="pb-img-row">
            {settings.image && (
              <div className="pb-img-thumb">
                <img src={settings.image} alt="" />
                <button type="button" className="pb-img-thumb__remove" onClick={() => s("image", "")}>✕</button>
              </div>
            )}
            <label className="pb-img-add">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              <input type="file" accept="image/*" hidden onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ""; }} />
            </label>
          </div>
        </div>

        <div className="pb-field">
          <div className="pb-label">Overlay opacity <span>{settings.overlayOpacity}%</span></div>
          <input type="range" className="pb-range" min={0} max={90} step={5}
            value={settings.overlayOpacity} onChange={e => s("overlayOpacity", +e.target.value)} />
        </div>
      </div>

      <div className="pb-group">
        <div className="pb-group__label">Layout</div>

        <div className="pb-field">
          <div className="pb-label">Text alignment</div>
          <div className="pb-align-row">
            {[
              { v: "right",  icon: "M21 6H3M21 12H9M21 18H3" },
              { v: "center", icon: "M21 6H3M17 12H7M21 18H3" },
              { v: "left",   icon: "M21 6H3M21 12H9M21 18H3" },
            ].map((o, i) => (
              <button key={o.v} type="button"
                className={`pb-align-btn ${settings.textAlign === o.v ? "pb-align-btn--active" : ""}`}
                onClick={() => s("textAlign", o.v)}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                  style={{ transform: i === 2 ? "scaleX(-1)" : "none" }}>
                  <path d={o.icon}/>
                </svg>
              </button>
            ))}
          </div>
        </div>

        <div className="pb-field">
          <div className="pb-label">Height</div>
          <div className="pb-segment">
            {[{v:"small",l:"Small"},{v:"large",l:"Medium"},{v:"full",l:"Large"}].map(o => (
              <button key={o.v}
                className={`pb-seg-btn ${settings.height === o.v ? "pb-seg-btn--active" : ""}`}
                onClick={() => s("height", o.v)}>{o.l}</button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

function TrustSettings({ settings, onChange }) {
  const s = (k, v) => onChange({ ...settings, [k]: v });
  const updateBadge = (i, field, val) => {
    const badges = settings.badges.map((b, idx) => idx === i ? { ...b, [field]: val } : b);
    s("badges", badges);
  };

  const BADGE_LABELS = {
    cod:      "دفع عند الاستلام",
    shipping: "توصيل سريع",
    return:   "إرجاع مجاني",
    support:  "دعم 24/7",
    secure:   "متجر موثوق",
  };

  return (
    <>
      <div className="pb-group">
        <div className="pb-group__label">Layout</div>
        <div className="pb-field">
          <div className="pb-label">Display Style</div>
          <select className="pb-input" value={settings.layout || "row"} onChange={e => s("layout", e.target.value)}>
            <option value="row">Row</option>
            <option value="grid">Grid</option>
          </select>
        </div>
      </div>

      <div className="pb-group">
        <div className="pb-group__label">Badges</div>
        {(settings.badges || []).map((badge, i) => (
          <div key={i} className="pb-badge-card">
            <div className="pb-badge-card__header">
              <span>{BADGE_LABELS[badge.id] || badge.title}</span>
              <Toggle checked={badge.enabled !== false} onChange={v => updateBadge(i, "enabled", v)} />
            </div>
            <div className="pb-field">
              <div className="pb-label">Title</div>
              <input className="pb-input" value={badge.title} onChange={e => updateBadge(i, "title", e.target.value)} />
            </div>
            <div className="pb-field">
              <div className="pb-label">Subtitle</div>
              <input className="pb-input" value={badge.sub} onChange={e => updateBadge(i, "sub", e.target.value)} />
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

function CollectionSettings({ settings, onChange }) {
  const s = (k, v) => onChange({ ...settings, [k]: v });
  return (
    <>
      <div className="pb-group">
        <div className="pb-group__label">General</div>
        <div className="pb-field">
          <div className="pb-label">Section title</div>
          <input className="pb-input" value={settings.title} onChange={e => s("title", e.target.value)} />
        </div>
        <div className="pb-field">
          <div className="pb-label">Title alignment</div>
          <div className="pb-segment">
            {[{v:"right",l:"⇥"},{v:"center",l:"≡"},{v:"left",l:"⇤"}].map(o => (
              <button key={o.v}
                className={`pb-seg-btn ${(settings.titleAlign || "right") === o.v ? "pb-seg-btn--active" : ""}`}
                onClick={() => s("titleAlign", o.v)}>{o.l}</button>
            ))}
          </div>
        </div>
      </div>

      <div className="pb-group">
        <div className="pb-group__label">Product Source</div>
        <div className="pb-field">
          <div className="pb-label">Selection Mode</div>
          <select className="pb-input" value={settings.selectionMode || "all"} onChange={e => s("selectionMode", e.target.value)}>
            <option value="all">All Products</option>
          </select>
        </div>
        <div className="pb-field">
          <div className="pb-label">Products shown</div>
          <div className="pb-segment">
            {[4,8,12].map(n => (
              <button key={n}
                className={`pb-seg-btn ${(settings.productsShown || 8) === n ? "pb-seg-btn--active" : ""}`}
                onClick={() => s("productsShown", n)}>{n}</button>
            ))}
          </div>
        </div>
      </div>

      <div className="pb-group">
        <div className="pb-group__label">Layout</div>
        <div className="pb-toggle-row">
          <span className="pb-toggle-row__label">Carousel mode</span>
          <Toggle checked={!!settings.carouselMode} onChange={v => s("carouselMode", v)} />
        </div>
        <div className="pb-field">
          <div className="pb-label">Columns</div>
          <div className="pb-segment">
            {[2,3,4].map(n => (
              <button key={n}
                className={`pb-seg-btn ${settings.columns === n ? "pb-seg-btn--active" : ""}`}
                onClick={() => s("columns", n)}>{n}</button>
            ))}
          </div>
        </div>
      </div>

      <div className="pb-group">
        <div className="pb-group__label">Product Cards</div>
        <div className="pb-field">
          <div className="pb-label">Card style</div>
          <div className="pb-segment">
            {[{v:"default",l:"Default"},{v:"minimal",l:"Minimal"},{v:"bordered",l:"Bordered"}].map(o => (
              <button key={o.v}
                className={`pb-seg-btn ${(settings.cardStyle || "default") === o.v ? "pb-seg-btn--active" : ""}`}
                onClick={() => s("cardStyle", o.v)}>{o.l}</button>
            ))}
          </div>
        </div>
        <div className="pb-field">
          <div className="pb-label">Image ratio</div>
          <div className="pb-segment">
            {[{v:"1:1",l:"1:1"},{v:"3:4",l:"3:4"},{v:"adapt",l:"Adapt"}].map(o => (
              <button key={o.v}
                className={`pb-seg-btn ${(settings.imageRatio || "1:1") === o.v ? "pb-seg-btn--active" : ""}`}
                onClick={() => s("imageRatio", o.v)}>{o.l}</button>
            ))}
          </div>
        </div>
        <div className="pb-toggle-row">
          <span className="pb-toggle-row__label">Show badge</span>
          <Toggle checked={settings.showBadge !== false} onChange={v => s("showBadge", v)} />
        </div>
        <div className="pb-toggle-row">
          <span className="pb-toggle-row__label">Show rating</span>
          <Toggle checked={!!settings.showRating} onChange={v => s("showRating", v)} />
        </div>
      </div>

      <div className="pb-group">
        <div className="pb-group__label">Footer</div>
        <div className="pb-toggle-row">
          <span className="pb-toggle-row__label">Show "View all" link</span>
          <Toggle checked={settings.showViewAll} onChange={v => s("showViewAll", v)} />
        </div>
        <div className="pb-toggle-row">
          <span className="pb-toggle-row__label">Enable Infinite Scroll</span>
          <Toggle checked={!!settings.infiniteScroll} onChange={v => s("infiniteScroll", v)} />
        </div>
        {settings.showViewAll && (
          <>
            <div className="pb-field">
              <div className="pb-label">View All text</div>
              <input className="pb-input" value={settings.viewAllText} onChange={e => s("viewAllText", e.target.value)} />
            </div>
            <div className="pb-field">
              <div className="pb-label">View all style</div>
              <div className="pb-segment">
                {[{v:"link",l:"Link"},{v:"filled",l:"Filled"},{v:"outline",l:"Outline"}].map(o => (
                  <button key={o.v}
                    className={`pb-seg-btn ${(settings.viewAllStyle || "link") === o.v ? "pb-seg-btn--active" : ""}`}
                    onClick={() => s("viewAllStyle", o.v)}>{o.l}</button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}

function CategoriesSettings({ settings, onChange }) {
  const s = (k, v) => onChange({ ...settings, [k]: v });
  return (
    <>
      <div className="pb-group">
        <div className="pb-group__label">Content</div>
        <div className="pb-field">
          <div className="pb-label">Section title</div>
          <input className="pb-input" value={settings.title} onChange={e => s("title", e.target.value)} />
        </div>
        <div className="pb-field">
          <div className="pb-label">Max items to show</div>
          <div className="pb-segment">
            {[4,6,8].map(n => (
              <button key={n}
                className={`pb-seg-btn ${settings.maxItems === n ? "pb-seg-btn--active" : ""}`}
                onClick={() => s("maxItems", n)}>{n}</button>
            ))}
          </div>
        </div>
      </div>
      <div className="pb-group">
        <div className="pb-group__label">Options</div>
        <div className="pb-toggle-row">
          <span className="pb-toggle-row__label">Show icons</span>
          <Toggle checked={settings.showIcons} onChange={v => s("showIcons", v)} />
        </div>
      </div>
    </>
  );
}

function FooterSettings({ settings, onChange }) {
  const s = (k, v) => onChange({ ...settings, [k]: v });
  return (
    <>
      <div className="pb-group">
        <div className="pb-group__label">Content</div>
        <div className="pb-field">
          <div className="pb-label">Copyright text <span>اختياري</span></div>
          <input className="pb-input" value={settings.copyright} onChange={e => s("copyright", e.target.value)}
            placeholder="جميع الحقوق محفوظة © 2025" />
        </div>
      </div>
      <div className="pb-group">
        <div className="pb-group__label">Styles</div>
        <ColorField label="Background color" value={settings.bgColor}   onChange={v => s("bgColor", v)} />
        <ColorField label="Text color"       value={settings.textColor} onChange={v => s("textColor", v)} />
      </div>
      <div className="pb-group">
        <div className="pb-group__label">Options</div>
        <div className="pb-toggle-row">
          <span className="pb-toggle-row__label">Show social links</span>
          <Toggle checked={settings.showSocials} onChange={v => s("showSocials", v)} />
        </div>
      </div>
    </>
  );
}

function StylesPanel({ styles, onChange }) {
  const s = (k, v) => onChange({ ...styles, [k]: v });
  return (
    <div style={{ padding: "14px 16px", display: "flex", flexDirection: "column", gap: 18, overflowY: "auto" }}>
      <div className="pb-group">
        <div className="pb-group__label">Colors</div>
        <ColorField label="Primary"    value={styles.primaryColor}    onChange={v => s("primaryColor",    v)} />
        <ColorField label="Secondary"  value={styles.secondaryColor}  onChange={v => s("secondaryColor",  v)} />
        <ColorField label="Background" value={styles.backgroundColor} onChange={v => s("backgroundColor", v)} />
        <ColorField label="Surface"    value={styles.surfaceColor}    onChange={v => s("surfaceColor",    v)} />
        <ColorField label="Text"       value={styles.textColor}       onChange={v => s("textColor",       v)} />
        <ColorField label="Muted text" value={styles.mutedTextColor}  onChange={v => s("mutedTextColor",  v)} />
        <ColorField label="Border"     value={styles.borderColor}     onChange={v => s("borderColor",     v)} />
      </div>
      <div className="pb-group">
        <div className="pb-group__label">Typography</div>
        <div className="pb-field">
          <div className="pb-label">Direction</div>
          <div className="pb-segment">
            {[{v:"rtl",l:"RTL"},{v:"ltr",l:"LTR"}].map(o => (
              <button key={o.v}
                className={`pb-seg-btn ${(styles.direction || "rtl") === o.v ? "pb-seg-btn--active" : ""}`}
                onClick={() => s("direction", o.v)}>{o.l}</button>
            ))}
          </div>
        </div>
        <div className="pb-font-grid">
          {FONTS.map(f => (
            <button key={f}
              className={`pb-font-btn ${styles.fontFamily === f ? "pb-font-btn--active" : ""}`}
              style={{ fontFamily: f }}
              onClick={() => s("fontFamily", f)}>{f}</button>
          ))}
        </div>
      </div>
      <div className="pb-group">
        <div className="pb-group__label">Border radius</div>
        <div className="pb-segment">
          {RADII.map(r => (
            <button key={r.v}
              className={`pb-seg-btn ${styles.borderRadius === r.v ? "pb-seg-btn--active" : ""}`}
              onClick={() => s("borderRadius", r.v)}>{r.l}</button>
          ))}
        </div>
      </div>
      <div className="pb-group">
        <div className="pb-group__label">Button style</div>
        <div className="pb-segment">
          {BTN_STYLE.map(b => (
            <button key={b.v}
              className={`pb-seg-btn ${styles.buttonStyle === b.v ? "pb-seg-btn--active" : ""}`}
              onClick={() => s("buttonStyle", b.v)}>{b.l}</button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// SETTINGS PANEL ROUTER
// ─────────────────────────────────────────────
function SectionSettingsPanel({ section, store, onUpdate, onClose, onLogoChange }) {
  const updateSettings = (newSettings) => onUpdate(section.id, newSettings);

  const inner = () => {
    switch (section.type) {
      case "announcement": return <AnnouncementSettings settings={section.settings} onChange={updateSettings} />;
      case "header":       return <HeaderSettings       settings={section.settings} onChange={updateSettings} store={store} onLogoChange={onLogoChange} />;
      case "hero":         return <HeroSettings         settings={section.settings} onChange={updateSettings} />;
      case "trust":        return <TrustSettings        settings={section.settings} onChange={updateSettings} />;
      case "collection":   return <CollectionSettings   settings={section.settings} onChange={updateSettings} />;
      case "categories":   return <CategoriesSettings   settings={section.settings} onChange={updateSettings} />;
      case "footer":       return <FooterSettings       settings={section.settings} onChange={updateSettings} />;
      default: return <p style={{ color: "#9ca3af", fontSize: ".82rem" }}>لا توجد إعدادات</p>;
    }
  };

  const meta = SECTION_META[section.type] || {};

  return (
    <div className="pb-right">
      <div className="pb-right__header">
        <div className="pb-right__title">
          <span className="pb-right__title-icon">{meta.icon}</span>
          <span className="pb-right__title-text">
            <span>{meta.label}</span>
            <span className="pb-right__eyebrow">Inspector</span>
          </span>
        </div>
        <button className="pb-right__close" onClick={onClose} title="Close (Esc)">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>
      <div className="pb-right__body">
        {inner()}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// MINI PREVIEW (iframe-based)
// ─────────────────────────────────────────────
function PreviewFrame({ slug, isMobile, themeConfig, activeSection }) {
  const iframeRef  = useRef(null);
  const loadedRef  = useRef(false);
  const pendingRef = useRef(null);
  const phoneRef   = useRef(null);
  const desktopWrapRef = useRef(null);
  const [desktopWidth, setDesktopWidth] = useState(null);

  // ✦ حساب scale ديناميكي باش الـ iframe يتناسب مع حجم الإطار
  useEffect(() => {
    if (!isMobile) return;
    const calcScale = () => {
      if (!phoneRef.current || !iframeRef.current) return;
      const screenW = phoneRef.current.clientWidth - 16; // 8px padding كل جهة
      const scale = screenW / 375;
      iframeRef.current.style.transform = `scale(${scale})`;
    };
    calcScale();
    const ro = new ResizeObserver(calcScale);
    if (phoneRef.current) ro.observe(phoneRef.current);
    return () => ro.disconnect();
  }, [isMobile]);

  // ✦ تتبّع العرض الحقيقي لمعاينة الديسكتوب — يتعرض فالـ ruler
  useEffect(() => {
    if (isMobile) return;
    const el = desktopWrapRef.current;
    if (!el) return;
    const update = () => setDesktopWidth(Math.round(el.clientWidth));
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [isMobile]);

  const sendConfig = (cfg) => {
    try {
      iframeRef.current?.contentWindow?.postMessage(
        { type: "THEME_UPDATE", themeConfig: cfg },
        "*"
      );
    } catch (_) {}
  };

  // ✦ عند تغيير activeSection — نرسل highlight للـ iframe
  useEffect(() => {
    if (!loadedRef.current) return;
    try {
      iframeRef.current?.contentWindow?.postMessage(
        { type: "HIGHLIGHT_SECTION", sectionType: activeSection },
        "*"
      );
    } catch (_) {}
  }, [activeSection]);

  // عند تغيير themeConfig — إذا الـ iframe محمّل أرسل مباشرة، وإلا احفظه كـ pending
  useEffect(() => {
    if (!themeConfig) return;
    if (loadedRef.current) {
      sendConfig(themeConfig);
    } else {
      pendingRef.current = themeConfig;
    }
  }, [themeConfig]);

  const handleLoad = () => {
    loadedRef.current = true;
    // أرسل أي config كان معلّق
    const cfg = pendingRef.current || themeConfig;
    if (cfg) sendConfig(cfg);
  };

  if (!slug) return (
    <div style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", color:"#9ca3af", flexDirection:"column", gap:12 }}>
      <div style={{ color:"#9ca3af" }}>
        <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9.5 12 3l9 6.5" />
          <path d="M4 10v9a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-9" />
          <path d="M9 20v-6h6v6" />
        </svg>
      </div>
      <div style={{ fontSize:".85rem" }}>لا يوجد متجر مرتبط</div>
    </div>
  );

  const src = `/store/${slug}?preview=1`;

  if (isMobile) return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
      <div className="pb-ruler">
        <span className="pb-ruler__dot" />
        <b>375</b>&nbsp;×&nbsp;812
      </div>
      <div className="pb-iphone" ref={phoneRef}>
        {/* الإطار الخارجي */}
        <div className="pb-iphone__frame" />
        {/* الشاشة */}
        <div className="pb-iphone__screen-wrap">
          {/* Dynamic Island — absolute فوق كل شي */}
          <div className="pb-iphone__island" />
          {/* Status Bar — 3 columns: time | island-spacer | signals */}
          <div className="pb-iphone__status">
            <span className="pb-iphone__time">9:41</span>
            <div className="pb-iphone__island-spacer" />
            <div className="pb-iphone__signals">
              <svg width="10" height="8" viewBox="0 0 17 12" fill="#000">
                <rect x="0" y="7" width="3" height="5" rx=".5"/>
                <rect x="4.5" y="4.5" width="3" height="7.5" rx=".5"/>
                <rect x="9" y="2" width="3" height="10" rx=".5"/>
                <rect x="13.5" y="0" width="3" height="12" rx=".5" opacity=".3"/>
              </svg>
              <svg width="10" height="8" viewBox="0 0 16 12" fill="none" stroke="#000" strokeWidth="1.8" strokeLinecap="round">
                <path d="M8 10h.01"/><path d="M5.5 7.5a3.5 3.5 0 015 0"/>
                <path d="M3 5a7 7 0 0110 0"/><path d="M1 2.5a11 11 0 0114 0"/>
              </svg>
              <svg width="15" height="8" viewBox="0 0 25 12" fill="#000">
                <rect x="0" y="1" width="21" height="10" rx="2.5" stroke="#000" strokeWidth="1" fill="none"/>
                <rect x="22" y="4" width="2.5" height="4" rx="1" fill="#000" opacity=".4"/>
                <rect x="1.5" y="2.5" width="17" height="7" rx="1.5"/>
              </svg>
            </div>
          </div>
          {/* iframe */}
          <div className="pb-iphone__content">
            <iframe
              ref={iframeRef}
              src={src}
              onLoad={handleLoad}
              className="pb-iphone__iframe"
              title="Mobile Preview"
            />
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>
      <div className="pb-ruler">
        <span className="pb-ruler__dot" />
        <span>/store/{slug}</span>
        <span style={{ opacity: .35 }}>·</span>
        <b>{desktopWidth || "—"}px</b>
      </div>
      <div className="pb-preview-desktop" ref={desktopWrapRef} style={{ width: "100%", flex: 1, minHeight: 0 }}>
        <iframe
          ref={iframeRef}
          src={src}
          onLoad={handleLoad}
          className="pb-preview-iframe"
          title="Desktop Preview"
        />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────
function ThemeEdit() {
  const navigate = useNavigate();

  const [store,         setStore]         = useState(null);
  const [themeConfig,   setThemeConfig]   = useState(null);
  const [loading,       setLoading]       = useState(true);
  const [saving,        setSaving]        = useState(false);
  const [notif,         setNotif]         = useState(null);
  const [activeSection, setActiveSection] = useState(null); // section id
  const [rightTab,      setRightTab]      = useState("sections"); // "sections" | "styles"
  const [isMobile,      setIsMobile]      = useState(false);
  const [currentPage,   setCurrentPage]   = useState("home");
  const [pageDropdown,  setPageDropdown]  = useState(false);
  const [isDirty,       setIsDirty]       = useState(false);
  const [dragId,        setDragId]        = useState(null);   // section.id قيد السحب
  const [dropOverId,    setDropOverId]    = useState(null);   // section.id تحته مؤشر الإفلات

  const notify = (msg, type = "success") => {
    setNotif({ msg, type });
    setTimeout(() => setNotif(null), 3500);
  };

  // ── Fetch store ──────────────────────────────────────────
  useEffect(() => {
    fetch(`${API()}/api/stores/my-store`, {
      headers: { Authorization: `Bearer ${token()}` },
    })
      .then(r => r.json())
      .then(d => {
        if (d.hasStore) {
          setStore(d.store);
          // إذا عنده themeConfig محفوظ استعمله، وإلا استعمل default
          let cfg = d.store.themeConfig;
          if (cfg && cfg.sections) {
            // نفرض الـ 5 badges الثابتة (نحافظ فقط على enabled/title/sub لو كانت موجودة بنفس id)
            const FIXED_BADGES = DEFAULT_CONFIG.sections.find(s => s.type === "trust")?.settings?.badges || [];
            cfg = {
              ...cfg,
              sections: cfg.sections.map(sec => {
                if (sec.type !== "trust") return sec;
                const oldBadges = sec.settings?.badges || [];
                const badges = FIXED_BADGES.map(fb => {
                  const old = oldBadges.find(b => b.id === fb.id);
                  return old ? { ...fb, enabled: old.enabled, title: old.title, sub: old.sub } : fb;
                });
                return {
                  ...sec,
                  settings: {
                    layout: sec.settings?.layout || "row",
                    bgColor: sec.settings?.bgColor || "#ffffff",
                    badges,
                  }
                };
              })
            };
          }
          setThemeConfig(cfg && cfg.sections ? cfg : DEFAULT_CONFIG);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // ✦ استقبال كليك من الـ iframe (PublicStore) — يفتح settings الـ section المختار
  useEffect(() => {
    const handler = (e) => {
      if (e.data?.type !== "SECTION_CLICK") return;
      const sectionType = e.data.sectionType;
      // نلقى الـ section اللي type ديالو يطابق
      const matched = themeConfig?.sections?.find(s => s.type === sectionType);
      if (matched) {
        setActiveSection(matched.id);
        setRightTab("sections");
      }
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, [themeConfig]);

  // ── Update section settings ──────────────────────────────
  const updateSectionSettings = useCallback((id, newSettings) => {
    setThemeConfig(prev => ({
      ...prev,
      sections: prev.sections.map(s =>
        s.id === id ? { ...s, settings: newSettings } : s
      ),
    }));
    setIsDirty(true);
  }, []);

  // ── Reorder sections (drag & drop) ───────────────────────
  const reorderSections = useCallback((fromId, toId) => {
    if (!fromId || !toId || fromId === toId) return;
    setThemeConfig(prev => {
      const list = [...prev.sections];
      const fromIdx = list.findIndex(s => s.id === fromId);
      const toIdx = list.findIndex(s => s.id === toId);
      if (fromIdx === -1 || toIdx === -1) return prev;
      const [moved] = list.splice(fromIdx, 1);
      list.splice(toIdx, 0, moved);
      return { ...prev, sections: list };
    });
    setIsDirty(true);
  }, []);

  // ── Toggle section enabled ───────────────────────────────
  const toggleSection = useCallback((id, enabled) => {
    setThemeConfig(prev => ({
      ...prev,
      sections: prev.sections.map(s => s.id === id ? { ...s, enabled } : s),
    }));
    setIsDirty(true);
  }, []);

  // ── Update global styles ─────────────────────────────────
  const updateStyles = useCallback((newStyles) => {
    setThemeConfig(prev => ({ ...prev, styles: newStyles }));
    setIsDirty(true);
  }, []);

  // ── Save Logo ────────────────────────────────────────────
  const saveLogo = async (url) => {
    try {
      const res = await fetch(`${API()}/api/stores/update`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token()}`,
        },
        body: JSON.stringify({ name: store.name, logo: url }),
      });
      const data = await res.json();
      if (res.ok) {
        setStore(data.store);
        notify("تم حفظ اللوجو");
      } else {
        notify(data.message || "فشل حفظ اللوجو", "error");
      }
    } catch {
      notify("تعذر الاتصال", "error");
    }
  };

  // ── Save ─────────────────────────────────────────────────
  const save = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${API()}/api/stores/theme-config`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token()}`,
        },
        body: JSON.stringify({ themeConfig }),
      });
      const data = await res.json();
      if (res.ok) {
        setIsDirty(false);
        notify("تم نشر الثيم");
      } else {
        notify(data.message || "حدث خطأ", "error");
      }
    } catch {
      notify("تعذر الاتصال", "error");
    } finally {
      setSaving(false);
    }
  };

  const activeSectionObj = themeConfig?.sections?.find(s => s.id === activeSection);

  // ── Loading ──────────────────────────────────────────────
  if (loading) return (
    <div className="pb-loading">
      <style>{CSS}</style>
      <div className="pb-spinner" />
      <p>جاري التحميل...</p>
    </div>
  );

  if (!store) return (
    <div className="pb-loading">
      <style>{CSS}</style>
      <p>لا يوجد متجر. <button onClick={() => navigate("/dashboard")} style={{ color:"#894bf4", background:"none", border:"none", cursor:"pointer", fontWeight:700 }}>العودة</button></p>
    </div>
  );

  return (
    <div className="pb-shell" dir="ltr">
      <style>{CSS}</style>
      {notif && <div className={`pb-toast pb-toast--${notif.type}`}>{notif.msg}</div>}

      {/* ══ TOP BAR ══ */}
      <div className="pb-topbar">
        {/* Left */}
        <div className="pb-topbar__left">
          <button className="pb-back-btn" onClick={() => navigate("/theme")}>
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
            Back
          </button>
          <span className="pb-crumb">
            <b>{store?.name || "Store"}</b>
            <span className="pb-crumb__sep">/</span>
            {PAGES.find(p => p.id === currentPage)?.label}
            {activeSectionObj && (
              <>
                <span className="pb-crumb__sep">/</span>
                {SECTION_META[activeSectionObj.type]?.label}
              </>
            )}
          </span>
          {isDirty && <span className="pb-draft-badge">Draft</span>}
        </div>

        {/* Mid — page switcher */}
        <div className="pb-topbar__mid" style={{ position: "relative" }}>
          <button className="pb-page-select" onClick={() => setPageDropdown(p => !p)}>
            <span>{PAGES.find(p => p.id === currentPage)?.icon}</span>
            {PAGES.find(p => p.id === currentPage)?.label}
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </button>

          {/* View toggle */}
          <button className={`pb-view-btn ${!isMobile ? "pb-view-btn--active" : ""}`} onClick={() => setIsMobile(false)} title="Desktop">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>
            </svg>
          </button>
          <button className={`pb-view-btn ${isMobile ? "pb-view-btn--active" : ""}`} onClick={() => setIsMobile(true)} title="Mobile">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/>
            </svg>
          </button>

          {/* Page dropdown */}
          {pageDropdown && (
            <>
              <div style={{ position:"fixed", inset:0, zIndex:998 }} onClick={() => setPageDropdown(false)} />
              <div className="pb-page-dropdown">
                {PAGES.map(p => (
                  <div key={p.id}
                    className={`pb-page-option ${currentPage === p.id ? "pb-page-option--active" : ""}`}
                    onClick={() => { setCurrentPage(p.id); setPageDropdown(false); }}>
                    <span>{p.icon}</span> {p.label}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Right */}
        <div className="pb-topbar__right">
          <button className="pb-preview-btn" onClick={() => window.open(`/store/${store.slug}`, "_blank")}>
            Preview ↗
          </button>
          <button className="pb-publish-btn" onClick={save} disabled={saving}>
            {saving
              ? <>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"
                    strokeLinecap="round" style={{ animation:"pb-spin .7s linear infinite" }}>
                    <circle cx="12" cy="12" r="9" strokeDasharray="42 100" opacity=".9" />
                  </svg>
                  Saving...
                </>
              : <>Publish</>
            }
          </button>
        </div>
      </div>

      {/* ══ BODY ══ */}
      <div className="pb-body">

        {/* ── LEFT: Sections List ── */}
        <div className="pb-left">
          {/* Tabs: Sections | Styles */}
          <div className="pb-tabs">
            <button className={`pb-tab ${rightTab === "sections" ? "pb-tab--active" : ""}`}
              onClick={() => setRightTab("sections")}>Sections</button>
            <button className={`pb-tab ${rightTab === "styles" ? "pb-tab--active" : ""}`}
              onClick={() => { setRightTab("styles"); setActiveSection(null); }}>Styles</button>
          </div>

          {rightTab === "sections" ? (
            <>
              <div className="pb-sections-list">
                {themeConfig?.sections?.map((sec, idx) => {
                  const meta = SECTION_META[sec.type] || {};
                  return (
                    <div key={sec.id}>
                      {/* ── Section Item ── */}
                      <div
                        draggable
                        onDragStart={() => setDragId(sec.id)}
                        onDragOver={(e) => { e.preventDefault(); if (dropOverId !== sec.id) setDropOverId(sec.id); }}
                        onDragLeave={() => setDropOverId(prev => (prev === sec.id ? null : prev))}
                        onDrop={(e) => { e.preventDefault(); reorderSections(dragId, sec.id); setDragId(null); setDropOverId(null); }}
                        onDragEnd={() => { setDragId(null); setDropOverId(null); }}
                        className={`pb-section-item ${activeSection === sec.id ? "pb-section-item--active" : ""} ${!sec.enabled ? "pb-section-item--disabled" : ""} ${dragId === sec.id ? "pb-section-item--dragging" : ""} ${dropOverId === sec.id && dragId && dragId !== sec.id ? "pb-section-item--drop-target" : ""}`}
                        onClick={() => {
                          const newActive = activeSection === sec.id ? null : sec.id;
                          setActiveSection(newActive);
                          // ✦ نطلب من الـ iframe يعمل scroll لهذا الـ section
                          if (newActive) {
                            try {
                              document.querySelector("iframe")?.contentWindow?.postMessage(
                                { type: "SCROLL_TO_SECTION", sectionType: sec.type }, "*"
                              );
                            } catch (_) {}
                          }
                        }}
                      >
                        <span className="pb-section-item__drag">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="9" cy="7" r="1" fill="currentColor"/>
                            <circle cx="9" cy="12" r="1" fill="currentColor"/>
                            <circle cx="9" cy="17" r="1" fill="currentColor"/>
                            <circle cx="15" cy="7" r="1" fill="currentColor"/>
                            <circle cx="15" cy="12" r="1" fill="currentColor"/>
                            <circle cx="15" cy="17" r="1" fill="currentColor"/>
                          </svg>
                        </span>
                        <span className="pb-section-item__index">{String(idx + 1).padStart(2, "0")}</span>
                        <span className="pb-section-item__icon">{meta.icon}</span>
                        <span className="pb-section-item__label">{meta.label}</span>
                        <span onClick={e => { e.stopPropagation(); toggleSection(sec.id, !sec.enabled); }}>
                          <Toggle checked={sec.enabled} onChange={v => toggleSection(sec.id, v)} />
                        </span>
                      </div>

                    </div>
                  );
                })}
              </div>
              <div className="pb-add-section">
                <button className="pb-add-btn" disabled>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                  </svg>
                  Add Section
                </button>
              </div>
            </>
          ) : (
            /* Styles panel inside left column */
            <StylesPanel
              styles={themeConfig?.styles || DEFAULT_CONFIG.styles}
              onChange={updateStyles}
            />
          )}
        </div>

        {/* ── CENTER: Preview ── */}
        <div className="pb-center">
          <PreviewFrame
            slug={store.slug}
            isMobile={isMobile}
            themeConfig={themeConfig}
            activeSection={activeSection}
          />
        </div>

        {/* ── RIGHT: Section Settings ── */}
        {activeSectionObj ? (
          <SectionSettingsPanel
            section={activeSectionObj}
            store={store}
            onUpdate={updateSectionSettings}
            onClose={() => setActiveSection(null)}
            onLogoChange={saveLogo}
          />
        ) : (
          <div className="pb-right">
            <div className="pb-no-selection">
              <div className="pb-no-selection__icon">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 12H5" /><path d="m12 19-7-7 7-7" />
                </svg>
              </div>
              <div className="pb-no-selection__text">
                اختر section من القائمة على اليسار لتعديل إعداداته
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default ThemeEdit;