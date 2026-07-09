// ============================================================
// 📁 pages/ThemeEdit.jsx — Page Builder (edge — unified panel)
// 2 zones: Unified Panel (sections + inline settings) | Canvas
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
        titleAlign: "right",
        selectionMode: "all",
        productsShown: 8,
        carouselMode: false,
        columns: 3,
        cardStyle: "default",
        imageRatio: "1:1",
        showBadge: true,
        showRating: false,
        showViewAll: true,
        viewAllText: "عرض الكل",
        viewAllStyle: "link",
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
  chevron:      <path d="m6 9 6 6 6-6"/>,
  arrowLeft:    <><path d="M19 12H5"/><path d="m12 19-7-7 7-7"/></>,
  desktop:      <><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8"/><path d="M12 17v4"/></>,
  mobile:       <><rect x="5" y="2" width="14" height="20" rx="2"/><path d="M12 18h.01"/></>,
  external:     <><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><path d="M15 3h6v6"/><path d="M10 14 21 3"/></>,
  drag:         <><circle cx="9" cy="7" r="1" fill="currentColor" stroke="none"/><circle cx="9" cy="12" r="1" fill="currentColor" stroke="none"/><circle cx="9" cy="17" r="1" fill="currentColor" stroke="none"/><circle cx="15" cy="7" r="1" fill="currentColor" stroke="none"/><circle cx="15" cy="12" r="1" fill="currentColor" stroke="none"/><circle cx="15" cy="17" r="1" fill="currentColor" stroke="none"/></>,
  plus:         <><path d="M12 5v14"/><path d="M5 12h14"/></>,
  close:        <><path d="M18 6 6 18"/><path d="m6 6 12 12"/></>,
  store:        <><path d="M3 9.5 12 3l9 6.5"/><path d="M4 10v9a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-10"/><path d="M9 20v-6h6v6"/></>,
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
// CSS — بنية جديدة: Unified Panel + Floating Canvas Toolbar
// ─────────────────────────────────────────────
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&family=Inter:wght@400;500;600;700;800&display=swap');

@keyframes ed-spin  { to { transform:rotate(360deg); } }
@keyframes ed-toast { from { opacity:0; transform:translateX(-50%) translateY(10px); } }
@keyframes ed-fade  { from { opacity:0; transform:translateY(4px); } to { opacity:1; transform:translateY(0); } }
@keyframes ed-open  { from { opacity:0; max-height:0; } to { opacity:1; max-height:600px; } }

* { box-sizing: border-box; }

/* ── SHELL ── */
.ed-shell {
  display: flex;
  height: 100vh;
  background: #eef0f6;
  overflow: hidden;
  font-family: 'Inter', sans-serif;
}

/* ── LEFT: UNIFIED PANEL ── */
.ed-panel {
  width: 352px;
  flex-shrink: 0;
  background: #fff;
  border-right: 1px solid rgba(15,23,42,.07);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  z-index: 20;
}

.ed-panel__header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 16px 18px 12px;
  flex-shrink: 0;
}
.ed-panel__brand { display:flex; align-items:center; gap:10px; }
.ed-panel__logo {
  width: 30px; height: 30px; border-radius: 9px;
  background: linear-gradient(135deg,#8b7cf6,#6c4fe0);
  display:flex; align-items:center; justify-content:center;
  color:#fff; font-weight:800; font-size:.8rem; flex-shrink:0;
}
.ed-panel__store-name { font-size: .86rem; font-weight: 700; color:#111827; line-height:1.2; }
.ed-panel__draft { font-size:.64rem; font-weight:700; color:#92600e; }

.ed-back-btn {
  display: flex; align-items: center; gap: 6px;
  font-size: .76rem; font-weight: 600; color: #94a3b8;
  background: none; border: none; cursor: pointer;
  font-family: inherit; padding: 6px 4px;
  transition: color .18s;
}
.ed-back-btn:hover { color: #5b3fd6; }

.ed-panel__tabs {
  display:flex; gap:4px; margin: 4px 18px 12px;
  background: rgba(15,23,42,.035); padding: 4px; border-radius: 11px;
  flex-shrink: 0;
}
.ed-tab {
  flex: 1; padding: 8px 10px; font-size: .8rem; font-weight: 600;
  color: #64748b; border: none; background: none; cursor: pointer;
  font-family: inherit; border-radius: 8px; transition: all .18s;
}
.ed-tab--active { background: #fff; color: #5b3fd6; font-weight: 700; box-shadow: 0 2px 8px rgba(15,23,42,.1); }

.ed-panel__body { flex:1; overflow-y:auto; padding: 4px 12px 16px; }

/* ── SECTION CARD (accordion — settings expand inline) ── */
.ed-section-card {
  border-radius: 14px; margin-bottom: 6px; overflow: hidden;
  border: 1px solid transparent;
  transition: border-color .16s, background .16s;
  animation: ed-fade .2s ease both;
}
.ed-section-card--open {
  border-color: rgba(124,109,242,.3);
  background: rgba(124,109,242,.035);
}
.ed-section-card__head {
  display: flex; align-items: center; gap: 9px;
  padding: 11px 10px; cursor: pointer;
}
.ed-section-card__head:hover { background: rgba(124,109,242,.05); }
.ed-section-card--disabled .ed-section-card__label { opacity: .4; }
.ed-section-card__drag { color: #d4d8e2; flex-shrink: 0; cursor: grab; display:flex; }
.ed-section-card__icon {
  width: 26px; height: 26px; border-radius: 8px; flex-shrink: 0;
  display:flex; align-items:center; justify-content:center;
  background: rgba(15,23,42,.045); color: #64748b;
}
.ed-section-card--open .ed-section-card__icon { background: rgba(124,109,242,.14); color:#6c4fe0; }
.ed-section-card__label { flex: 1; font-size: .84rem; font-weight: 600; color: #334155; }
.ed-section-card__chevron {
  color: #94a3b8; display:flex; transition: transform .2s; flex-shrink:0;
}
.ed-section-card--open .ed-section-card__chevron { transform: rotate(180deg); color:#6c4fe0; }

.ed-section-card__body {
  padding: 4px 16px 18px 44px;
  display: flex; flex-direction: column; gap: 18px;
  animation: ed-open .18s ease;
  overflow: hidden;
}

.ed-add-section {
  width: 100%; padding: 12px; margin-top: 6px;
  border: 1.5px dashed rgba(124,109,242,.3); border-radius: 12px;
  background: none; cursor: pointer; color: #94a3b8;
  font-size: .8rem; font-weight: 600; font-family: inherit;
  display: flex; align-items: center; justify-content: center; gap: 6px;
  transition: all .18s;
}
.ed-add-section:hover { border-color: #7c6df2; color: #7c6df2; background: rgba(124,109,242,.05); }

/* ── RIGHT: CANVAS ── */
.ed-canvas {
  flex: 1; position: relative; overflow: hidden;
  background: radial-gradient(circle at 25% 10%, #f3f4fc 0%, #e7e9f2 60%, #e2e4ee 100%);
  display: flex; align-items: center; justify-content: center;
}

.ed-toolbar {
  position: absolute; top: 18px; left: 18px;
  display: flex; align-items: center; gap: 4px;
  background: rgba(255,255,255,.85); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(15,23,42,.06);
  border-radius: 14px; padding: 6px; z-index: 50;
  box-shadow: 0 10px 30px rgba(15,23,42,.1);
}
.ed-toolbar__select {
  display: flex; align-items: center; gap: 6px;
  padding: 7px 10px; border-radius: 9px; border: none;
  font-size: .8rem; font-weight: 600; background: transparent; cursor: pointer;
  color: #374151; font-family: inherit;
}
.ed-toolbar__select:hover { background: rgba(15,23,42,.045); }
.ed-toolbar__divider { width: 1px; height: 20px; background: rgba(15,23,42,.08); margin: 0 2px; }
.ed-toolbar__btn {
  display: flex; align-items: center; justify-content: center;
  width: 32px; height: 32px; border-radius: 9px; border: none;
  background: transparent; cursor: pointer; color: #6b7280;
}
.ed-toolbar__btn:hover      { background: rgba(15,23,42,.045); color: #111; }
.ed-toolbar__btn--active    { background: #1f2937; color: #fff; }

.ed-page-dropdown {
  position: absolute; top: 46px; left: 0;
  background: rgba(255,255,255,.96); backdrop-filter: blur(20px);
  border: 1px solid rgba(15,23,42,.06);
  border-radius: 14px; padding: 6px;
  box-shadow: 0 24px 64px rgba(15,23,42,.18);
  z-index: 999; min-width: 170px;
}
.ed-page-option {
  display: flex; align-items: center; gap: 9px;
  padding: 9px 11px; border-radius: 9px; cursor: pointer;
  font-size: .82rem; font-weight: 500; color: #374151;
}
.ed-page-option:hover    { background: rgba(124,109,242,.08); }
.ed-page-option--active  { background: rgba(124,109,242,.12); font-weight: 700; color: #5b3fd6; }

.ed-actions {
  position: absolute; top: 18px; right: 18px;
  display: flex; align-items: center; gap: 8px; z-index: 50;
}
.ed-btn-preview {
  display: flex; align-items:center; gap:6px;
  padding: 10px 16px; border-radius: 12px;
  border: none; background: linear-gradient(135deg,#8b7cf6,#6c4fe0);
  font-size: .82rem; font-weight: 700; cursor: pointer;
  font-family: inherit; color: #fff; transition: transform .15s, box-shadow .15s;
  box-shadow: 0 10px 24px rgba(108,79,224,.34);
}
.ed-btn-preview:hover { transform: translateY(-1px); }
.ed-btn-publish {
  padding: 10px 20px; border-radius: 12px; border: none;
  background: #1f2937; color: #fff;
  font-size: .82rem; font-weight: 700; cursor: pointer;
  font-family: inherit; transition: transform .15s;
  display: flex; align-items: center; gap: 7px;
  box-shadow: 0 10px 24px rgba(15,23,42,.24);
}
.ed-btn-publish:hover:not(:disabled) { transform: translateY(-1px); }
.ed-btn-publish:disabled { opacity: .5; cursor: not-allowed; transform:none; }

/* ── DESKTOP STAGE ── */
.ed-stage-desktop {
  width: calc(100% - 36px); height: calc(100% - 36px);
  background: #fff; border-radius: 20px;
  box-shadow: 0 30px 70px rgba(15,23,42,.16), 0 0 0 1px rgba(15,23,42,.05);
  overflow: hidden;
}
.ed-stage-iframe { width: 100%; height: 100%; border: none; }

/* ── MOBILE (iPhone) STAGE ── */
.ed-iphone {
  position: relative;
  aspect-ratio: 393 / 852;
  height: calc(100vh - 90px);
  max-height: 760px; min-height: 500px; width: auto; margin: auto;
}
.ed-iphone__frame {
  position: absolute; inset: 0; border-radius: 54px;
  background: linear-gradient(160deg, #2a2a2a 0%, #1a1a1a 40%, #111 60%, #1e1e1e 100%);
  box-shadow: inset 0 0 0 1px rgba(255,255,255,.12), 0 0 0 1px rgba(0,0,0,.8),
    0 24px 60px rgba(0,0,0,.55), 0 6px 16px rgba(0,0,0,.35);
  pointer-events: none; z-index: 5;
}
.ed-iphone__screen {
  position: absolute; top: 10px; left: 10px; right: 10px; bottom: 10px;
  border-radius: 46px; overflow: hidden; background: #000; z-index: 10;
}
.ed-iphone__island {
  position: absolute; top: 10px; left: 50%; transform: translateX(-50%);
  width: 86px; height: 24px; background: #000; border-radius: 20px; z-index: 25; pointer-events:none;
}
.ed-iphone__status {
  position: absolute; top: 0; left: 0; right: 0; height: 44px;
  display: grid; grid-template-columns: 1fr auto 1fr; align-items: center;
  padding: 0 16px; z-index: 22; pointer-events: none;
  background: rgba(255,255,255,.95); backdrop-filter: blur(10px);
}
.ed-iphone__time { font-size: 12px; font-weight: 600; color:#000; font-family: -apple-system,sans-serif; justify-self:start; padding-top:8px; }
.ed-iphone__spacer { width: 86px; height: 24px; }
.ed-iphone__signals { display:flex; align-items:center; gap:4px; justify-self:end; padding-top:8px; }
.ed-iphone__content { position: absolute; top: 44px; left:0; right:0; bottom:0; overflow: hidden; }
.ed-iphone__iframe { position: absolute; top:0; left:0; width: 393px; height: 852px; border: none; transform-origin: top left; }

/* ── EMPTY / LOADING ── */
.ed-empty {
  display:flex; flex-direction:column; align-items:center; justify-content:center;
  gap:12px; color:#9ca3af; text-align:center; padding: 30px;
}
.ed-loading {
  flex:1; display:flex; align-items:center; justify-content:center;
  flex-direction:column; gap:16px; color:#94a3b8; font-size:.86rem;
  font-family:'Inter',sans-serif; background:#eef0f6; height:100vh;
}
.ed-spinner {
  width:32px; height:32px; border:3px solid rgba(124,109,242,.15);
  border-top-color:#7c6df2; border-radius:50%; animation: ed-spin .7s linear infinite;
}

/* ── NO-SELECTION HINT (styles tab empty state not needed, kept for parity) ── */
.ed-no-selection { display:flex; flex-direction:column; align-items:center; justify-content:center; gap:10px; color:#94a3b8; padding: 30px; text-align:center; }

/* ── TOAST ── */
.ed-toast {
  position: fixed; bottom: 26px; left: 50%; transform: translateX(-50%);
  padding: 11px 22px; border-radius: 13px;
  font-size: .84rem; font-weight: 600; z-index: 9999;
  box-shadow: 0 20px 50px rgba(15,23,42,.25); white-space: nowrap;
  animation: ed-toast .25s ease; font-family: 'Inter', sans-serif;
  backdrop-filter: blur(10px);
}
.ed-toast--success { background: rgba(17,24,39,.94); color:#fff; }
.ed-toast--error   { background: rgba(239,68,68,.94); color:#fff; }

/* ══════════════════════════════════════════════
   FORM CONTROLS — عام لكل settings (نفس المستوى القديم)
   ══════════════════════════════════════════════ */
.pb-group { display:flex; flex-direction:column; gap:11px; }
.pb-group__label {
  font-size: .7rem; font-weight: 700; color: #94a3b8;
  text-transform: uppercase; letter-spacing: .08em;
  padding-bottom: 7px; border-bottom: 1px solid rgba(15,23,42,.06);
}
.pb-field { display:flex; flex-direction:column; gap:6px; }
.pb-label { font-size: .78rem; font-weight: 600; color: #475569; display: flex; justify-content: space-between; }
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

.pb-color-row { display:flex; align-items:center; gap:9px; }
.pb-color-swatch {
  width: 38px; height: 38px; border-radius: 10px;
  border: 1px solid rgba(15,23,42,.09); overflow: hidden; position: relative;
  cursor: pointer; flex-shrink: 0; box-shadow: 0 1px 3px rgba(15,23,42,.08);
}
.pb-color-swatch input[type=color] { position: absolute; inset: -4px; width: calc(100% + 8px); height: calc(100% + 8px); opacity: 0; cursor: pointer; }
.pb-color-hex {
  flex: 1; padding: 9px 12px;
  border: 1px solid rgba(15,23,42,.09); border-radius: 10px;
  font-size: .82rem; font-family: monospace; color: #374151;
  background: rgba(248,249,252,.85); outline: none; transition: all .18s;
}
.pb-color-hex:focus { border-color: #7c6df2; box-shadow: 0 0 0 3px rgba(124,109,242,.12); }

.pb-toggle { position: relative; width: 32px; height: 18px; flex-shrink: 0; }
.pb-toggle input { opacity: 0; width: 0; height: 0; }
.pb-toggle__slider { position: absolute; inset: 0; background: #e2e8f0; border-radius: 99px; transition: background .2s; cursor: pointer; }
.pb-toggle__slider::after {
  content: ""; position: absolute; left: 2px; top: 2px; width: 14px; height: 14px;
  border-radius: 50%; background: #fff; box-shadow: 0 1px 3px rgba(15,23,42,.2); transition: transform .2s;
}
.pb-toggle input:checked + .pb-toggle__slider { background: linear-gradient(135deg,#8b7cf6,#6c4fe0); }
.pb-toggle input:checked + .pb-toggle__slider::after { transform: translateX(14px); }

.pb-toggle-row { display: flex; align-items: center; justify-content: space-between; padding: 5px 0; }
.pb-toggle-row__label { font-size: .83rem; font-weight: 500; color: #374151; }

.pb-segment { display:flex; gap:4px; background: rgba(15,23,42,.035); padding: 4px; border-radius: 11px; }
.pb-seg-btn {
  flex: 1; padding: 8px 6px; border-radius: 8px; border: none; background: transparent;
  font-size: .76rem; font-weight: 600; cursor: pointer; font-family: inherit; color: #64748b;
  transition: all .18s; text-align: center;
}
.pb-seg-btn:hover      { color: #111; }
.pb-seg-btn--active    { background: #fff; color: #5b3fd6; font-weight: 700; box-shadow: 0 2px 8px rgba(15,23,42,.1); }

.pb-range { width: 100%; accent-color: #7c6df2; }

.pb-link-input {
  display: flex; align-items: center; gap: 8px;
  border: 1px solid rgba(15,23,42,.09); border-radius: 10px;
  padding: 9px 12px; background: rgba(248,249,252,.85); color: #94a3b8; transition: border-color .18s;
}
.pb-link-input__field { flex: 1; border: none; outline: none; font-size: .82rem; color: #111; background: transparent; }

.pb-img-row { display: flex; gap: 10px; }
.pb-img-thumb { position: relative; width: 64px; height: 64px; border-radius: 12px; overflow: hidden; flex-shrink: 0; border: 1px solid rgba(15,23,42,.09); box-shadow: 0 1px 3px rgba(15,23,42,.08); }
.pb-img-thumb img { width: 100%; height: 100%; object-fit: cover; display: block; }
.pb-img-thumb__remove {
  position: absolute; top: 3px; right: 3px; width: 18px; height: 18px; border-radius: 50%;
  background: rgba(15,23,42,.65); color: #fff; border: none; font-size: 10px;
  display: flex; align-items: center; justify-content: center; cursor: pointer; backdrop-filter: blur(4px);
}
.pb-img-add {
  width: 64px; height: 64px; border-radius: 12px; border: 1.5px dashed rgba(124,109,242,.3); flex-shrink: 0;
  display: flex; align-items: center; justify-content: center; color: #94a3b8; cursor: pointer; transition: all .18s;
}
.pb-img-add:hover { border-color: #7c6df2; color: #7c6df2; background: rgba(124,109,242,.05); }

.pb-align-row { display: flex; gap: 6px; }
.pb-align-btn {
  flex: 1; padding: 10px; border-radius: 10px; border: 1px solid rgba(15,23,42,.09); background: rgba(248,249,252,.6);
  display: flex; align-items: center; justify-content: center; color: #64748b; cursor: pointer; transition: all .18s;
}
.pb-align-btn--active { border-color: transparent; background: linear-gradient(135deg,#1f2937,#0f172a); color: #fff; box-shadow: 0 4px 14px rgba(15,23,42,.22); }

.pb-badge-card { background: rgba(248,249,252,.7); border: 1px solid rgba(15,23,42,.06); border-radius: 12px; padding: 12px; display:flex; flex-direction:column; gap:9px; transition: border-color .18s; }
.pb-badge-card:hover { border-color: rgba(124,109,242,.22); }
.pb-badge-card__header { display: flex; align-items: center; justify-content: space-between; font-size: .82rem; font-weight: 700; color: #1e293b; }

.pb-font-grid { display:grid; grid-template-columns:1fr 1fr; gap:7px; }
.pb-font-btn {
  padding: 9px 6px; border-radius: 10px; border: 1px solid rgba(15,23,42,.09); background: rgba(248,249,252,.7);
  font-size: .8rem; font-weight: 600; cursor: pointer; font-family: inherit; color: #374151; transition: all .18s; text-align: center;
}
.pb-font-btn:hover   { border-color: rgba(124,109,242,.3); }
.pb-font-btn--active { border-color: transparent; background: linear-gradient(135deg,#8b7cf6,#6c4fe0); color: #fff; box-shadow: 0 6px 16px rgba(108,79,224,.3); }
`;

// ─────────────────────────────────────────────
// TOGGLE / COLOR FIELD
// ─────────────────────────────────────────────
function Toggle({ checked, onChange }) {
  return (
    <label className="pb-toggle">
      <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} />
      <span className="pb-toggle__slider" />
    </label>
  );
}

function ColorField({ label, value, onChange }) {
  return (
    <div className="pb-field">
      {label && <div className="pb-label">{label}</div>}
      <div className="pb-color-row">
        <div className="pb-color-swatch" style={{ background: value }}>
          <input type="color" value={value} onChange={e => onChange(e.target.value)} />
        </div>
        <input className="pb-color-hex" value={value} onChange={e => onChange(e.target.value)} maxLength={7} />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// SECTION SETTINGS PANELS (نفس المنطق القديم بلا تغيير)
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
    cod: "دفع عند الاستلام", shipping: "توصيل سريع", return: "إرجاع مجاني", support: "دعم 24/7", secure: "متجر موثوق",
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
    <div style={{ padding: "8px 6px 16px", display: "flex", flexDirection: "column", gap: 18 }}>
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
// SETTINGS ROUTER — يرجع الفورم المناسب لنوع الـ section
// ─────────────────────────────────────────────
function SectionSettingsInner({ section, store, onUpdate, onLogoChange }) {
  const updateSettings = (newSettings) => onUpdate(section.id, newSettings);
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
}

// ─────────────────────────────────────────────
// SECTION CARD — accordion: الإعدادات كتتفتح جوة نفس البانل
// ─────────────────────────────────────────────
function SectionCard({ section, isOpen, onToggleOpen, onToggleEnabled, store, onUpdate, onLogoChange }) {
  const meta = SECTION_META[section.type] || {};
  return (
    <div className={`ed-section-card ${isOpen ? "ed-section-card--open" : ""} ${!section.enabled ? "ed-section-card--disabled" : ""}`}>
      <div className="ed-section-card__head" onClick={onToggleOpen}>
        <span className="ed-section-card__drag"><Icon path={ICON_PATHS.drag} size={13} /></span>
        <span className="ed-section-card__icon">{meta.icon}</span>
        <span className="ed-section-card__label">{meta.label}</span>
        <span onClick={e => { e.stopPropagation(); onToggleEnabled(!section.enabled); }}>
          <Toggle checked={section.enabled} onChange={onToggleEnabled} />
        </span>
        <span className="ed-section-card__chevron"><Icon path={ICON_PATHS.chevron} size={15} /></span>
      </div>
      {isOpen && (
        <div className="ed-section-card__body">
          <SectionSettingsInner section={section} store={store} onUpdate={onUpdate} onLogoChange={onLogoChange} />
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// CANVAS — preview + floating toolbar
// ─────────────────────────────────────────────
function PreviewStage({ slug, isMobile, themeConfig, activeSection }) {
  const iframeRef  = useRef(null);
  const loadedRef  = useRef(false);
  const pendingRef = useRef(null);
  const phoneRef   = useRef(null);

  useEffect(() => {
    if (!isMobile) return;
    const calcScale = () => {
      if (!phoneRef.current || !iframeRef.current) return;
      const screenW = phoneRef.current.clientWidth - 20;
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
      iframeRef.current?.contentWindow?.postMessage({ type: "THEME_UPDATE", themeConfig: cfg }, "*");
    } catch (_) {}
  };

  useEffect(() => {
    if (!loadedRef.current) return;
    try {
      iframeRef.current?.contentWindow?.postMessage({ type: "HIGHLIGHT_SECTION", sectionType: activeSection }, "*");
    } catch (_) {}
  }, [activeSection]);

  useEffect(() => {
    if (!themeConfig) return;
    if (loadedRef.current) sendConfig(themeConfig);
    else pendingRef.current = themeConfig;
  }, [themeConfig]);

  const handleLoad = () => {
    loadedRef.current = true;
    const cfg = pendingRef.current || themeConfig;
    if (cfg) sendConfig(cfg);
  };

  if (!slug) return (
    <div className="ed-empty">
      <Icon path={ICON_PATHS.store} size={30} />
      <div style={{ fontSize:".85rem" }}>لا يوجد متجر مرتبط</div>
    </div>
  );

  const src = `/store/${slug}?preview=1`;

  if (isMobile) return (
    <div className="ed-iphone" ref={phoneRef}>
      <div className="ed-iphone__frame" />
      <div className="ed-iphone__screen">
        <div className="ed-iphone__island" />
        <div className="ed-iphone__status">
          <span className="ed-iphone__time">9:41</span>
          <div className="ed-iphone__spacer" />
          <div className="ed-iphone__signals">
            <svg width="10" height="8" viewBox="0 0 17 12" fill="#000">
              <rect x="0" y="7" width="3" height="5" rx=".5"/><rect x="4.5" y="4.5" width="3" height="7.5" rx=".5"/>
              <rect x="9" y="2" width="3" height="10" rx=".5"/><rect x="13.5" y="0" width="3" height="12" rx=".5" opacity=".3"/>
            </svg>
            <svg width="10" height="8" viewBox="0 0 16 12" fill="none" stroke="#000" strokeWidth="1.8" strokeLinecap="round">
              <path d="M8 10h.01"/><path d="M5.5 7.5a3.5 3.5 0 015 0"/><path d="M3 5a7 7 0 0110 0"/><path d="M1 2.5a11 11 0 0114 0"/>
            </svg>
            <svg width="15" height="8" viewBox="0 0 25 12" fill="#000">
              <rect x="0" y="1" width="21" height="10" rx="2.5" stroke="#000" strokeWidth="1" fill="none"/>
              <rect x="22" y="4" width="2.5" height="4" rx="1" fill="#000" opacity=".4"/>
              <rect x="1.5" y="2.5" width="17" height="7" rx="1.5"/>
            </svg>
          </div>
        </div>
        <div className="ed-iphone__content">
          <iframe ref={iframeRef} src={src} onLoad={handleLoad} className="ed-iphone__iframe" title="Mobile Preview" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="ed-stage-desktop">
      <iframe ref={iframeRef} src={src} onLoad={handleLoad} className="ed-stage-iframe" title="Desktop Preview" />
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
  const [openSection,   setOpenSection]   = useState(null); // section id المفتوح فالـ accordion
  const [panelTab,      setPanelTab]      = useState("sections"); // "sections" | "styles"
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
    fetch(`${API()}/api/stores/my-store`, { headers: { Authorization: `Bearer ${token()}` } })
      .then(r => r.json())
      .then(d => {
        if (d.hasStore) {
          setStore(d.store);
          let cfg = d.store.themeConfig;
          if (cfg && cfg.sections) {
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
                return { ...sec, settings: { layout: sec.settings?.layout || "row", bgColor: sec.settings?.bgColor || "#ffffff", badges } };
              })
            };
          }
          setThemeConfig(cfg && cfg.sections ? cfg : DEFAULT_CONFIG);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // ✦ استقبال كليك من الـ iframe (PublicStore) — يفتح الـ section جوة الـ accordion
  useEffect(() => {
    const handler = (e) => {
      if (e.data?.type !== "SECTION_CLICK") return;
      const sectionType = e.data.sectionType;
      const matched = themeConfig?.sections?.find(s => s.type === sectionType);
      if (matched) {
        setOpenSection(matched.id);
        setPanelTab("sections");
      }
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, [themeConfig]);

  const updateSectionSettings = useCallback((id, newSettings) => {
    setThemeConfig(prev => ({ ...prev, sections: prev.sections.map(s => s.id === id ? { ...s, settings: newSettings } : s) }));
    setIsDirty(true);
  }, []);

  const toggleSection = useCallback((id, enabled) => {
    setThemeConfig(prev => ({ ...prev, sections: prev.sections.map(s => s.id === id ? { ...s, enabled } : s) }));
    setIsDirty(true);
  }, []);

  const updateStyles = useCallback((newStyles) => {
    setThemeConfig(prev => ({ ...prev, styles: newStyles }));
    setIsDirty(true);
  }, []);

  const saveLogo = async (url) => {
    try {
      const res = await fetch(`${API()}/api/stores/update`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}` },
        body: JSON.stringify({ name: store.name, logo: url }),
      });
      const data = await res.json();
      if (res.ok) { setStore(data.store); notify("تم حفظ اللوجو"); }
      else notify(data.message || "فشل حفظ اللوجو", "error");
    } catch { notify("تعذر الاتصال", "error"); }
  };

  const save = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${API()}/api/stores/theme-config`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}` },
        body: JSON.stringify({ themeConfig }),
      });
      const data = await res.json();
      if (res.ok) { setIsDirty(false); notify("تم نشر الثيم"); }
      else notify(data.message || "حدث خطأ", "error");
    } catch { notify("تعذر الاتصال", "error"); }
    finally { setSaving(false); }
  };

  // ── Loading ──────────────────────────────────────────────
  if (loading) return (
    <div className="ed-loading">
      <style>{CSS}</style>
      <div className="ed-spinner" />
      <p>جاري التحميل...</p>
    </div>
  );

  if (!store) return (
    <div className="ed-loading">
      <style>{CSS}</style>
      <p>لا يوجد متجر. <button onClick={() => navigate("/dashboard")} style={{ color:"#894bf4", background:"none", border:"none", cursor:"pointer", fontWeight:700 }}>العودة</button></p>
    </div>
  );

  return (
    <div className="ed-shell" dir="ltr">
      <style>{CSS}</style>
      {notif && <div className={`ed-toast ed-toast--${notif.type}`}>{notif.msg}</div>}

      {/* ══ LEFT: UNIFIED PANEL ══ */}
      <div className="ed-panel">
        <div className="ed-panel__header">
          <button className="ed-back-btn" onClick={() => navigate("/theme")}>
            <Icon path={ICON_PATHS.arrowLeft} size={13} />
            Back
          </button>
          {isDirty && <span className="ed-panel__draft">● Draft</span>}
        </div>

        <div className="ed-panel__tabs">
          <button className={`ed-tab ${panelTab === "sections" ? "ed-tab--active" : ""}`} onClick={() => setPanelTab("sections")}>Sections</button>
          <button className={`ed-tab ${panelTab === "styles" ? "ed-tab--active" : ""}`} onClick={() => { setPanelTab("styles"); setOpenSection(null); }}>Styles</button>
        </div>

        <div className="ed-panel__body">
          {panelTab === "sections" ? (
            <>
              {themeConfig?.sections?.map(sec => (
                <SectionCard
                  key={sec.id}
                  section={sec}
                  isOpen={openSection === sec.id}
                  onToggleOpen={() => {
                    const next = openSection === sec.id ? null : sec.id;
                    setOpenSection(next);
                    if (next) {
                      try {
                        document.querySelector("iframe")?.contentWindow?.postMessage({ type: "SCROLL_TO_SECTION", sectionType: sec.type }, "*");
                      } catch (_) {}
                    }
                  }}
                  onToggleEnabled={v => toggleSection(sec.id, v)}
                  store={store}
                  onUpdate={updateSectionSettings}
                  onLogoChange={saveLogo}
                />
              ))}
              <button className="ed-add-section" disabled>
                <Icon path={ICON_PATHS.plus} size={13} />
                Add Section
              </button>
            </>
          ) : (
            <StylesPanel styles={themeConfig?.styles || DEFAULT_CONFIG.styles} onChange={updateStyles} />
          )}
        </div>
      </div>

      {/* ══ RIGHT: CANVAS ══ */}
      <div className="ed-canvas">
        {/* floating toolbar — يسار */}
        <div className="ed-toolbar" style={{ position: "relative" }}>
          <button className="ed-toolbar__select" onClick={() => setPageDropdown(p => !p)}>
            {PAGES.find(p => p.id === currentPage)?.icon}
            {PAGES.find(p => p.id === currentPage)?.label}
            <Icon path={ICON_PATHS.chevron} size={11} />
          </button>
          <div className="ed-toolbar__divider" />
          <button className={`ed-toolbar__btn ${!isMobile ? "ed-toolbar__btn--active" : ""}`} onClick={() => setIsMobile(false)} title="Desktop">
            <Icon path={ICON_PATHS.desktop} size={15} />
          </button>
          <button className={`ed-toolbar__btn ${isMobile ? "ed-toolbar__btn--active" : ""}`} onClick={() => setIsMobile(true)} title="Mobile">
            <Icon path={ICON_PATHS.mobile} size={13} />
          </button>

          {pageDropdown && (
            <>
              <div style={{ position:"fixed", inset:0, zIndex:998 }} onClick={() => setPageDropdown(false)} />
              <div className="ed-page-dropdown">
                {PAGES.map(p => (
                  <div key={p.id}
                    className={`ed-page-option ${currentPage === p.id ? "ed-page-option--active" : ""}`}
                    onClick={() => { setCurrentPage(p.id); setPageDropdown(false); }}>
                    {p.icon} {p.label}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* floating actions — يمين */}
        <div className="ed-actions">
          <button className="ed-btn-preview" onClick={() => window.open(`/store/${store.slug}`, "_blank")}>
            Preview <Icon path={ICON_PATHS.external} size={13} />
          </button>
          <button className="ed-btn-publish" onClick={save} disabled={saving}>
            {saving
              ? <>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"
                    strokeLinecap="round" style={{ animation:"ed-spin .7s linear infinite" }}>
                    <circle cx="12" cy="12" r="9" strokeDasharray="42 100" opacity=".9" />
                  </svg>
                  Saving...
                </>
              : <>Publish</>
            }
          </button>
        </div>

        <PreviewStage slug={store.slug} isMobile={isMobile} themeConfig={themeConfig} activeSection={openSection ? themeConfig?.sections?.find(s => s.id === openSection)?.type : null} />
      </div>
    </div>
  );
}

export default ThemeEdit;