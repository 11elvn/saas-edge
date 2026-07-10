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
// SECTION ICONS & LABELS
// ─────────────────────────────────────────────
const SECTION_META = {
  announcement: { label: "Announcement Bar", icon: "announcement" },
  header:       { label: "Header",           icon: "header" },
  hero:         { label: "Hero Banner",      icon: "hero" },
  trust:        { label: "Trust Badges",     icon: "trust" },
  collection:   { label: "Collection",       icon: "collection" },
  categories:   { label: "Categories",       icon: "categories" },
  footer:       { label: "Footer",           icon: "footer" },
};

const PAGES = [
  { id: "home",     label: "Home",     icon: "home" },
  { id: "product",  label: "Product",  icon: "collection" },
  { id: "category", label: "Category", icon: "categories" },
  { id: "search",   label: "Search",   icon: "search" },
];

// ─────────────────────────────────────────────
// SVG ICON SET (outline style, replaces emoji)
// ─────────────────────────────────────────────
function Icon({ name, size = 15 }) {
  const common = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round", strokeLinejoin: "round" };
  switch (name) {
    case "announcement":
      return (
        <svg {...common}>
          <path d="M3 11v2a2 2 0 0 0 2 2h1l3 5h2l-1-5h7a2 2 0 0 0 2-2v-5a2 2 0 0 0-2-2h-7l-3-5H5a2 2 0 0 0-2 2v2Z" />
          <path d="M14 8v8" />
        </svg>
      );
    case "header":
      return (
        <svg {...common}>
          <rect x="3" y="4" width="18" height="16" rx="2" />
          <line x1="3" y1="9" x2="21" y2="9" />
          <line x1="7" y1="6.5" x2="9" y2="6.5" />
        </svg>
      );
    case "hero":
      return (
        <svg {...common}>
          <rect x="3" y="4" width="18" height="16" rx="2" />
          <circle cx="8.5" cy="9.5" r="1.5" />
          <path d="M21 16l-5-5-9 9" />
        </svg>
      );
    case "trust":
      return (
        <svg {...common}>
          <path d="M12 3l7 3v6c0 4.5-3 8-7 9-4-1-7-4.5-7-9V6l7-3Z" />
          <path d="M9 12l2 2 4-4" />
        </svg>
      );
    case "collection":
      return (
        <svg {...common}>
          <path d="M21 8L12 3 3 8l9 5 9-5Z" />
          <path d="M3 8v8l9 5 9-5V8" />
          <path d="M12 13v8" />
        </svg>
      );
    case "categories":
      return (
        <svg {...common}>
          <rect x="3" y="3" width="7" height="7" rx="1.5" />
          <rect x="14" y="3" width="7" height="7" rx="1.5" />
          <rect x="3" y="14" width="7" height="7" rx="1.5" />
          <rect x="14" y="14" width="7" height="7" rx="1.5" />
        </svg>
      );
    case "footer":
      return (
        <svg {...common}>
          <rect x="3" y="4" width="18" height="16" rx="2" />
          <line x1="3" y1="15" x2="21" y2="15" />
          <line x1="7" y1="17.5" x2="9" y2="17.5" />
        </svg>
      );
    case "home":
      return (
        <svg {...common}>
          <path d="M3 11l9-8 9 8" />
          <path d="M5 10v10h14V10" />
          <path d="M10 20v-6h4v6" />
        </svg>
      );
    case "search":
      return (
        <svg {...common}>
          <circle cx="11" cy="11" r="7" />
          <line x1="21" y1="21" x2="16.5" y2="16.5" />
        </svg>
      );
    default:
      return null;
  }
}

const FONTS     = ["Cairo","Inter","Poppins","Roboto"];
const RADII     = [{ v:"small", l:"صغير" },{ v:"medium", l:"متوسط" },{ v:"large", l:"كبير" }];
const BTN_STYLE = [{ v:"filled", l:"ممتلئ" },{ v:"outline", l:"مخطط" },{ v:"ghost", l:"شفاف" }];

// ─────────────────────────────────────────────
// CSS
// ─────────────────────────────────────────────
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&family=Inter:wght@400;500;600;700;800&display=swap');

@keyframes pb-spin  { to { transform:rotate(360deg); } }
@keyframes pb-toast { from { opacity:0; transform:translateX(-50%) translateY(10px); } }
@keyframes pb-panel { from { opacity:0; transform:translateX(18px); } to { opacity:1; transform:translateX(0); } }
@keyframes pb-fade   { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:translateY(0); } }

/* ── BUILDER SHELL ── */
.pb-shell {
  display: flex;
  height: 100vh;
  background: #eaebef;
  overflow: hidden;
  font-family: 'Inter', sans-serif;
}

/* ── TOP BAR — glass pill ── */
.pb-topbar {
  position: absolute;
  top: 14px; left: 20px; right: 20px;
  height: 56px;
  background: rgba(255,255,255,.55);
  backdrop-filter: blur(24px) saturate(180%);
  -webkit-backdrop-filter: blur(24px) saturate(180%);
  border: 1px solid rgba(255,255,255,.6);
  border-radius: 999px;
  box-shadow: 0 8px 32px rgba(15,23,42,.10), inset 0 1px 0 rgba(255,255,255,.7);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 8px 0 22px;
  z-index: 100;
  gap: 14px;
}
.pb-topbar__left  { display:flex; align-items:center; gap:12px; }
.pb-topbar__mid   { display:flex; align-items:center; gap:4px; background: rgba(15,23,42,.045); border-radius: 999px; padding: 5px; }
.pb-topbar__right { display:flex; align-items:center; gap:6px; }

.pb-back-btn {
  display: flex; align-items: center; gap: 7px;
  font-size: .82rem; font-weight: 600; color: #64748b;
  background: none; border: none; cursor: pointer;
  font-family: inherit; padding: 8px 14px; border-radius: 999px;
  transition: background .18s, color .18s;
}
.pb-back-btn:hover { background: rgba(239,68,68,.1); color: #dc2626; }

.pb-draft-badge {
  font-size: .68rem; font-weight: 700;
  padding: 4px 10px; border-radius: 999px;
  background: linear-gradient(135deg,#fff3d6,#ffe7b0); color: #92600e;
}

.pb-view-btn {
  display: flex; align-items: center; justify-content: center;
  width: 32px; height: 32px; border-radius: 999px; border: none;
  background: transparent; cursor: pointer; color: #6b7280;
  transition: all .18s;
}
.pb-view-btn:hover       { background: rgba(255,255,255,.6); color: #111; }
.pb-view-btn--active     {
  background: linear-gradient(135deg,#8b7cf6,#6c4fe0);
  color: #fff;
  box-shadow: 0 6px 16px rgba(108,79,224,.35);
}

.pb-page-select {
  display: flex; align-items: center; gap: 7px;
  padding: 7px 14px; border-radius: 999px; border: none;
  font-size: .82rem; font-weight: 600; background: rgba(255,255,255,.7); cursor: pointer;
  color: #374151; font-family: inherit; transition: all .18s;
}
.pb-page-select:hover { background: #fff; box-shadow: 0 2px 10px rgba(15,23,42,.06); }

.pb-page-dropdown {
  position: absolute;
  top: 66px; left: 50%; transform: translateX(-50%);
  background: rgba(255,255,255,.92); backdrop-filter: blur(20px);
  border: 1px solid rgba(15,23,42,.06);
  border-radius: 14px; padding: 7px;
  box-shadow: 0 24px 64px rgba(15,23,42,.18);
  z-index: 999; min-width: 190px;
}
.pb-page-option {
  display: flex; align-items: center; gap: 9px;
  padding: 10px 12px; border-radius: 10px; cursor: pointer;
  font-size: .84rem; font-weight: 500; color: #374151;
  transition: background .15s;
}
.pb-page-option:hover    { background: rgba(124,109,242,.08); }
.pb-page-option--active  { background: rgba(124,109,242,.12); font-weight: 700; color: #5b3fd6; }

.pb-publish-btn {
  padding: 9px 20px; border-radius: 999px; border: none;
  background: linear-gradient(135deg,#8b7cf6,#6c4fe0); color: #fff;
  font-size: .84rem; font-weight: 700; cursor: pointer;
  font-family: inherit; transition: transform .15s, box-shadow .15s;
  display: flex; align-items: center; gap: 7px;
  box-shadow: 0 8px 20px rgba(108,79,224,.32);
}
.pb-publish-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 12px 28px rgba(108,79,224,.4); }
.pb-publish-btn:disabled { opacity: .5; cursor: not-allowed; transform:none; }

.pb-preview-btn {
  padding: 9px 16px; border-radius: 999px;
  border: none; background: transparent;
  font-size: .84rem; font-weight: 600; cursor: pointer;
  font-family: inherit; color: #374151; transition: all .18s;
  display: flex; align-items: center; justify-content: center; gap: 6px;
  white-space: nowrap;
}
.pb-preview-btn svg { flex-shrink: 0; }
.pb-preview-btn:hover { background: rgba(255,255,255,.6); }

/* ── BODY (below topbar) ── */
.pb-body {
  display: flex;
  width: 100%;
  height: 100%;
  padding-top: 86px;
}

/* ── LEFT PANEL — Sections list ── */
.pb-left {
  width: 264px;
  flex-shrink: 0;
  background: rgba(255,255,255,.58);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-right: 1px solid rgba(15,23,42,.06);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.pb-left__header {
  padding: 16px 16px 10px;
  border-bottom: 1px solid rgba(15,23,42,.05);
}

.pb-left__title {
  font-size: .72rem; font-weight: 700;
  color: #94a3b8; text-transform: uppercase;
  letter-spacing: .08em;
}

.pb-sections-list {
  flex: 1; overflow-y: auto; padding: 8px 10px;
}

.pb-section-item {
  display: flex; align-items: center; gap: 9px;
  padding: 11px 12px; border-radius: 12px; cursor: pointer;
  margin-bottom: 3px; transition: all .16s ease;
  border: 1px solid transparent;
  position: relative;
  animation: pb-fade .25s ease both;
}
.pb-section-item:hover   { background: rgba(124,109,242,.06); }
.pb-section-item--active {
  background: linear-gradient(135deg, rgba(124,109,242,.11), rgba(124,109,242,.04));
  border-color: rgba(124,109,242,.35);
  box-shadow: 0 3px 12px rgba(124,109,242,.1);
}
.pb-section-item--disabled { opacity: .42; }

.pb-section-item__drag {
  cursor: grab; color: #cbd5e1; flex-shrink: 0; padding: 2px;
}
.pb-section-item__icon  { font-size: 14px; flex-shrink: 0; width: 20px; text-align: center; }
.pb-section-item__label { flex: 1; font-size: .84rem; font-weight: 600; color: #334155; }

.pb-toggle {
  position: relative;
  width: 32px; height: 18px; flex-shrink: 0;
}
.pb-toggle input { opacity: 0; width: 0; height: 0; }
.pb-toggle__slider {
  position: absolute; inset: 0;
  background: #e2e8f0; border-radius: 99px;
  transition: background .2s; cursor: pointer;
}
.pb-toggle__slider::after {
  content: "";
  position: absolute;
  left: 2px; top: 2px;
  width: 14px; height: 14px;
  border-radius: 50%; background: #fff;
  box-shadow: 0 1px 3px rgba(15,23,42,.2);
  transition: transform .2s;
}
.pb-toggle input:checked + .pb-toggle__slider { background: linear-gradient(135deg,#8b7cf6,#6c4fe0); }
.pb-toggle input:checked + .pb-toggle__slider::after { transform: translateX(14px); }



.pb-add-section {
  padding: 11px 11px 13px;
  border-top: 1px solid rgba(15,23,42,.05);
}
.pb-add-btn {
  width: 100%; padding: 10px;
  border: 1.5px dashed rgba(124,109,242,.3); border-radius: 12px;
  background: none; cursor: pointer; color: #94a3b8;
  font-size: .8rem; font-weight: 600; font-family: inherit;
  display: flex; align-items: center; justify-content: center; gap: 6px;
  transition: all .18s;
}
.pb-add-btn:hover { border-color: #7c6df2; color: #7c6df2; background: rgba(124,109,242,.05); }

/* ── CENTER — Preview ── */
.pb-center {
  flex: 1; overflow: hidden;
  display: flex; align-items: center; justify-content: center;
  background: #eaebef;
  padding: 22px;
}

.pb-preview-desktop {
  width: 100%; height: 100%;
  background: #fff; border-radius: 16px;
  box-shadow: 0 1px 0 rgba(255,255,255,.6) inset, 0 24px 64px rgba(15,23,42,.18), 0 0 0 1px rgba(15,23,42,.05);
  overflow: hidden;
  display: flex; flex-direction: column;
}

.pb-iphone {
  position: relative;
  /* نسبة 15 Pro Max: 393 × 852 = 0.4613 */
  aspect-ratio: 393 / 852;
  height: calc(100vh - 140px);
  max-height: 760px;
  min-height: 500px;
  width: auto;
  flex-shrink: 0;
  margin: auto;
}
.pb-iphone__frame {
  position: absolute;
  inset: 0;
  border-radius: 54px;
  background: linear-gradient(160deg, #2a2a2a 0%, #1a1a1a 40%, #111 60%, #1e1e1e 100%);
  box-shadow:
    inset 0 0 0 1px rgba(255,255,255,.12),
    0 0 0 1px rgba(0,0,0,.8),
    0 24px 60px rgba(0,0,0,.55),
    0 6px 16px rgba(0,0,0,.35);
  pointer-events: none;
  z-index: 5;
}
.pb-iphone__screen-wrap {
  position: absolute;
  top: 10px; left: 10px; right: 10px; bottom: 10px;
  border-radius: 46px;
  overflow: hidden;
  background: #000;
  z-index: 10;
}
.pb-iphone__island {
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
.pb-iphone__status {
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
.pb-iphone__time {
  font-size: 12px; font-weight: 600;
  color: #000; font-family: -apple-system, sans-serif;
  letter-spacing: -.2px;
  justify-self: start;
  padding-top: 8px;
}
.pb-iphone__island-spacer {
  width: 86px; height: 24px;
}
.pb-iphone__signals {
  display: flex; align-items: center; gap: 4px;
  justify-self: end;
  padding-top: 8px;
}
.pb-iphone__btn-right {
  position: absolute;
  right: -3px; top: 140px;
  width: 3px; height: 72px;
  background: linear-gradient(to right, #1a1a1a, #2e2e2e, #1a1a1a);
  border-radius: 0 2px 2px 0;
  z-index: 21; pointer-events: none;
}
.pb-iphone__btn-left1 {
  position: absolute;
  left: -3px; top: 105px;
  width: 3px; height: 42px;
  background: linear-gradient(to left, #1a1a1a, #2e2e2e, #1a1a1a);
  border-radius: 2px 0 0 2px;
  z-index: 21; pointer-events: none;
}
.pb-iphone__btn-left2 {
  position: absolute;
  left: -3px; top: 170px;
  width: 3px; height: 66px;
  background: linear-gradient(to left, #1a1a1a, #2e2e2e, #1a1a1a);
  border-radius: 2px 0 0 2px;
  z-index: 21; pointer-events: none;
}
.pb-iphone__btn-left3 {
  position: absolute;
  left: -3px; top: 252px;
  width: 3px; height: 66px;
  background: linear-gradient(to left, #1a1a1a, #2e2e2e, #1a1a1a);
  border-radius: 2px 0 0 2px;
  z-index: 21; pointer-events: none;
}
.pb-iphone__content {
  position: absolute;
  top: 44px;
  left: 0; right: 0; bottom: 0;
  overflow: hidden;
}
.pb-iphone__iframe {
  position: absolute;
  top: 0; left: 0;
  width: 393px;
  height: 852px;
  border: none;
  display: block;
  transform-origin: top left;
  /* scale يتحسب بـ JS */
}

.pb-chrome-bar {
  background: linear-gradient(180deg,#f2f3f7,#e9eaf0); padding: 9px 14px;
  display: flex; align-items: center; gap: 7px;
  border-bottom: 1px solid rgba(15,23,42,.08); flex-shrink: 0;
}
.pb-chrome-dot { width:11px; height:11px; border-radius:50%; flex-shrink:0; }
.pb-chrome-url {
  flex:1; margin: 0 8px;
  background:#fff; border:1px solid rgba(15,23,42,.08);
  border-radius:8px; padding:5px 12px;
  font-size:11px; color:#6b7280; font-family:monospace;
  display:flex; align-items:center; gap:6px;
}

.pb-preview-iframe {
  width: 100%; height: 100%; border: none;
  flex: 1;
}

.pb-preview-section-highlight {
  outline: 2px solid #7c6df2;
  outline-offset: -2px;
}

/* ── RIGHT PANEL — Settings ── */
.pb-right {
  width: 300px;
  flex-shrink: 0;
  background: rgba(255,255,255,.6);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-left: 1px solid rgba(15,23,42,.06);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: pb-panel .22s ease;
}

.pb-right__header {
  padding: 16px 18px 13px;
  border-bottom: 1px solid rgba(15,23,42,.06);
  display: flex; align-items: center; justify-content: space-between;
}

.pb-right__title {
  font-size: .92rem; font-weight: 700; color: #111827;
  display: flex; align-items: center; gap: 8px;
}

.pb-right__close {
  width: 28px; height: 28px; border-radius: 9px;
  border: 1px solid rgba(15,23,42,.08); background: rgba(255,255,255,.6);
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; color: #94a3b8; transition: all .18s;
}
.pb-right__close:hover { background: rgba(124,109,242,.08); color: #5b3fd6; }

.pb-right__body { flex:1; overflow-y:auto; padding: 17px 18px; display:flex; flex-direction:column; gap:20px; }

/* ── FIELD GROUPS ── */
.pb-group { display:flex; flex-direction:column; gap:11px; }

.pb-group__label {
  font-size: .7rem; font-weight: 700;
  color: #94a3b8; text-transform: uppercase; letter-spacing: .08em;
  padding-bottom: 7px;
  border-bottom: 1px solid rgba(15,23,42,.06);
}

.pb-field { display:flex; flex-direction:column; gap:6px; }

.pb-label {
  font-size: .78rem; font-weight: 600; color: #475569;
  display: flex; justify-content: space-between;
}
.pb-label span { font-weight: 400; color: #94a3b8; }

.pb-input {
  width: 100%; padding: 9px 12px;
  border: 1px solid rgba(15,23,42,.09); border-radius: 10px;
  font-size: .84rem; color: #111827; font-family: inherit;
  background: rgba(248,249,252,.85); outline: none; box-sizing: border-box;
  transition: all .18s;
}
.pb-input:focus { border-color: #7c6df2; background: #fff; box-shadow: 0 0 0 3px rgba(124,109,242,.12); }

.pb-textarea {
  width: 100%; padding: 9px 12px; min-height: 76px; resize: vertical;
  border: 1px solid rgba(15,23,42,.09); border-radius: 10px;
  font-size: .84rem; color: #111827; font-family: inherit;
  background: rgba(248,249,252,.85); outline: none; box-sizing: border-box;
  transition: all .18s;
}
.pb-textarea:focus { border-color: #7c6df2; background: #fff; box-shadow: 0 0 0 3px rgba(124,109,242,.12); }

/* Color field */
.pb-color-row { display:flex; align-items:center; gap:9px; }
.pb-color-swatch {
  width: 38px; height: 38px; border-radius: 10px;
  border: 1px solid rgba(15,23,42,.09); overflow: hidden; position: relative;
  cursor: pointer; flex-shrink: 0;
  box-shadow: 0 1px 3px rgba(15,23,42,.08);
}
.pb-color-swatch input[type=color] {
  position: absolute; inset: -4px; width: calc(100% + 8px);
  height: calc(100% + 8px); opacity: 0; cursor: pointer;
}
.pb-color-hex {
  flex: 1; padding: 9px 12px;
  border: 1px solid rgba(15,23,42,.09); border-radius: 10px;
  font-size: .82rem; font-family: monospace; color: #374151;
  background: rgba(248,249,252,.85); outline: none;
  transition: all .18s;
}
.pb-color-hex:focus { border-color: #7c6df2; box-shadow: 0 0 0 3px rgba(124,109,242,.12); }

/* Toggle row */
.pb-toggle-row {
  display: flex; align-items: center; justify-content: space-between;
  padding: 5px 0;
}
.pb-toggle-row__label { font-size: .83rem; font-weight: 500; color: #374151; }

/* Segment — pill-style segmented control */
.pb-segment {
  display:flex; gap:4px;
  background: rgba(15,23,42,.035);
  padding: 4px; border-radius: 11px;
}
.pb-seg-btn {
  flex: 1; padding: 8px 6px; border-radius: 8px;
  border: none; background: transparent;
  font-size: .76rem; font-weight: 600; cursor: pointer;
  font-family: inherit; color: #64748b; transition: all .18s;
  text-align: center;
}
.pb-seg-btn:hover      { color: #111; }
.pb-seg-btn--active    { background: #fff; color: #5b3fd6; font-weight: 700; box-shadow: 0 2px 8px rgba(15,23,42,.1); }

/* Range */
.pb-range { width: 100%; accent-color: #7c6df2; }

/* Link input (Button link field) */
.pb-link-input {
  display: flex; align-items: center; gap: 8px;
  border: 1px solid rgba(15,23,42,.09); border-radius: 10px;
  padding: 9px 12px; background: rgba(248,249,252,.85);
  color: #94a3b8; transition: border-color .18s;
}
.pb-link-input__field {
  flex: 1; border: none; outline: none; font-size: .82rem;
  color: #111; background: transparent;
}

/* Background image row */
.pb-img-row { display: flex; gap: 10px; }
.pb-img-thumb {
  position: relative; width: 64px; height: 64px;
  border-radius: 12px; overflow: hidden; flex-shrink: 0;
  border: 1px solid rgba(15,23,42,.09);
  box-shadow: 0 1px 3px rgba(15,23,42,.08);
}
.pb-img-thumb img { width: 100%; height: 100%; object-fit: cover; display: block; }
.pb-img-thumb__remove {
  position: absolute; top: 3px; right: 3px;
  width: 18px; height: 18px; border-radius: 50%;
  background: rgba(15,23,42,.65); color: #fff; border: none;
  font-size: 10px; display: flex; align-items: center; justify-content: center;
  cursor: pointer; backdrop-filter: blur(4px);
}
.pb-img-add {
  width: 64px; height: 64px; border-radius: 12px;
  border: 1.5px dashed rgba(124,109,242,.3); flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  color: #94a3b8; cursor: pointer; transition: all .18s;
}
.pb-img-add:hover { border-color: #7c6df2; color: #7c6df2; background: rgba(124,109,242,.05); }

/* Text alignment row */
.pb-align-row { display: flex; gap: 6px; }
.pb-align-btn {
  flex: 1; padding: 10px; border-radius: 10px;
  border: 1px solid rgba(15,23,42,.09); background: rgba(248,249,252,.6);
  display: flex; align-items: center; justify-content: center;
  color: #64748b; cursor: pointer; transition: all .18s;
}
.pb-align-btn--active {
  border-color: transparent;
  background: linear-gradient(135deg,#1f2937,#0f172a); color: #fff;
  box-shadow: 0 4px 14px rgba(15,23,42,.22);
}

/* Badge card */
.pb-badge-card {
  background: rgba(248,249,252,.7); border: 1px solid rgba(15,23,42,.06);
  border-radius: 12px; padding: 12px 12px; display:flex; flex-direction:column; gap:9px;
  transition: border-color .18s;
}
.pb-badge-card:hover { border-color: rgba(124,109,242,.22); }
.pb-badge-card__header {
  display: flex; align-items: center; justify-content: space-between;
  font-size: .82rem; font-weight: 700; color: #1e293b;
}

/* Styles tab */
.pb-no-selection {
  flex:1; display:flex; flex-direction:column;
  align-items:center; justify-content:center;
  gap:12px; color:#94a3b8;
  padding: 36px;
  text-align: center;
}
.pb-no-selection__icon { font-size: 2.6rem; opacity:.35; }
.pb-no-selection__text { font-size: .83rem; line-height: 1.6; max-width: 190px; }

/* Tabs — segmented pill control */
.pb-tabs {
  display:flex; gap:4px;
  padding: 12px; margin: 0 2px;
  background: rgba(15,23,42,.035);
  border-radius: 12px;
}
.pb-tab {
  flex: 1;
  padding: 9px 14px; font-size: .82rem; font-weight: 600;
  color: #64748b; border: none; background: none; cursor: pointer;
  font-family: inherit; border-radius: 9px;
  transition: all .18s;
}
.pb-tab--active { background: #fff; color: #5b3fd6; font-weight: 700; box-shadow: 0 2px 8px rgba(15,23,42,.1); }

/* ── TOAST ── */
.pb-toast {
  position: fixed; bottom: 26px; left: 50%; transform: translateX(-50%);
  padding: 11px 22px; border-radius: 13px;
  font-size: .84rem; font-weight: 600; z-index: 9999;
  box-shadow: 0 20px 50px rgba(15,23,42,.25); white-space: nowrap;
  animation: pb-toast .25s ease; font-family: 'Inter', sans-serif;
  backdrop-filter: blur(10px);
}
.pb-toast--success { background: rgba(17,24,39,.94); color:#fff; }
.pb-toast--error   { background: rgba(239,68,68,.94); color:#fff; }

/* Loading */
.pb-loading {
  flex:1; display:flex; align-items:center; justify-content:center;
  flex-direction:column; gap:16px; color:#94a3b8; font-size:.86rem;
  font-family:'Inter',sans-serif;
  background: #eaebef;
}
.pb-spinner {
  width:32px; height:32px; border:3px solid rgba(124,109,242,.15);
  border-top-color:#7c6df2; border-radius:50%;
  animation: pb-spin .7s linear infinite;
}

/* font options */
.pb-font-grid { display:grid; grid-template-columns:1fr 1fr; gap:7px; }
.pb-font-btn {
  padding: 9px 6px; border-radius: 10px;
  border: 1px solid rgba(15,23,42,.09); background: rgba(248,249,252,.7);
  font-size: .8rem; font-weight: 600; cursor: pointer;
  font-family: inherit; color: #374151;
  transition: all .18s; text-align: center;
}
.pb-font-btn:hover   { border-color: rgba(124,109,242,.3); }
.pb-font-btn--active {
  border-color: transparent;
  background: linear-gradient(135deg,#8b7cf6,#6c4fe0); color: #fff;
  box-shadow: 0 6px 16px rgba(108,79,224,.3);
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
          <span style={{ display:"flex" }}><Icon name={meta.icon} size={16} /></span>
          {meta.label}
        </div>
        <button className="pb-right__close" onClick={onClose}>
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

  // ✦ حساب scale ديناميكي باش الـ iframe يتناسب مع حجم الإطار
  useEffect(() => {
    if (!isMobile) return;
    const calcScale = () => {
      if (!phoneRef.current || !iframeRef.current) return;
      const screenW = phoneRef.current.clientWidth - 20; // 10px padding كل جهة
      const scale = screenW / 393;
      iframeRef.current.style.transform = `scale(${scale})`;
    };
    calcScale();
    const ro = new ResizeObserver(calcScale);
    if (phoneRef.current) ro.observe(phoneRef.current);
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
      <div style={{ fontSize:"2rem" }}>🏪</div>
      <div style={{ fontSize:".85rem" }}>لا يوجد متجر مرتبط</div>
    </div>
  );

  const src = `/store/${slug}?preview=1`;

  if (isMobile) return (
    <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div className="pb-iphone" ref={phoneRef}>
        {/* الإطار الخارجي */}
        <div className="pb-iphone__frame" />
        {/* أزرار جانبية */}
        <div className="pb-iphone__btn-right" />
        <div className="pb-iphone__btn-left1" />
        <div className="pb-iphone__btn-left2" />
        <div className="pb-iphone__btn-left3" />
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
    <div className="pb-preview-desktop">
      <div className="pb-chrome-bar">
        <div className="pb-chrome-dot" style={{ background: "#ff5f56" }} />
        <div className="pb-chrome-dot" style={{ background: "#ffbd2e" }} />
        <div className="pb-chrome-dot" style={{ background: "#27c93f" }} />
        <div className="pb-chrome-url">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          {window.location.host}/store/{slug}
        </div>
      </div>
      <iframe
        ref={iframeRef}
        src={src}
        onLoad={handleLoad}
        className="pb-preview-iframe"
        title="Desktop Preview"
      />
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
        notify("تم حفظ اللوجو ✅");
      } else {
        notify(data.message || "فشل حفظ اللوجو ❌", "error");
      }
    } catch {
      notify("تعذر الاتصال ❌", "error");
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
        notify("تم نشر الثيم ✅");
      } else {
        notify(data.message || "حدث خطأ ❌", "error");
      }
    } catch {
      notify("تعذر الاتصال ❌", "error");
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
          {isDirty && <span className="pb-draft-badge">● Draft</span>}
        </div>

        {/* Mid — page switcher */}
        <div className="pb-topbar__mid" style={{ position: "relative" }}>
          <button className="pb-page-select" onClick={() => setPageDropdown(p => !p)}>
            <span style={{ display:"flex" }}><Icon name={PAGES.find(p => p.id === currentPage)?.icon} size={15} /></span>
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
                    <span style={{ display:"flex" }}><Icon name={p.icon} size={15} /></span> {p.label}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Right */}
        <div className="pb-topbar__right">
          <button className="pb-preview-btn" onClick={() => window.open(`/store/${store.slug}`, "_blank")}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
            </svg>
            View
          </button>
          <button className="pb-publish-btn" onClick={save} disabled={saving}>
            {saving
              ? <><span style={{ display:"inline-block", animation:"pb-spin .7s linear infinite" }}>⏳</span> Saving...</>
              : <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  Save
                </>
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
                        className={`pb-section-item ${activeSection === sec.id ? "pb-section-item--active" : ""} ${!sec.enabled ? "pb-section-item--disabled" : ""}`}
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
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="9" cy="7" r="1" fill="currentColor"/>
                            <circle cx="9" cy="12" r="1" fill="currentColor"/>
                            <circle cx="9" cy="17" r="1" fill="currentColor"/>
                            <circle cx="15" cy="7" r="1" fill="currentColor"/>
                            <circle cx="15" cy="12" r="1" fill="currentColor"/>
                            <circle cx="15" cy="17" r="1" fill="currentColor"/>
                          </svg>
                        </span>
                        <span className="pb-section-item__icon" style={{ display:"flex", alignItems:"center", justifyContent:"center" }}>
                          <Icon name={meta.icon} size={15} />
                        </span>
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
              <div className="pb-no-selection__icon">👈</div>
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