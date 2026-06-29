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
        overlayOpacity: 50,
        height: "large",
      },
    },
    {
      id: "trust",
      type: "trust",
      enabled: true,
      settings: {
        badges: [
          { icon: "🚚", title: "توصيل سريع وآمن",  sub: "لجميع الولايات الـ 58" },
          { icon: "✅", title: "جودة مضمونة",       sub: "فحص شامل لكل منتج"    },
          { icon: "🎧", title: "خدمة العملاء",      sub: "دعم على مدار 24 ساعة" },
        ],
        bgColor: "#f8f9fa",
      },
    },
    {
      id: "collection",
      type: "collection",
      enabled: true,
      settings: {
        title: "أحدث المنتجات",
        columns: 3,
        showViewAll: true,
        viewAllText: "عرض الكل",
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
    fontFamily: "Cairo",
    borderRadius: "medium",
    buttonStyle: "filled",
  },
};

// ─────────────────────────────────────────────
// SECTION ICONS & LABELS
// ─────────────────────────────────────────────
const SECTION_META = {
  announcement: { label: "Announcement Bar", icon: "📢" },
  header:       { label: "Header",           icon: "🔝" },
  hero:         { label: "Hero Banner",      icon: "🖼️" },
  trust:        { label: "Trust Badges",     icon: "🛡️" },
  collection:   { label: "Collection",       icon: "📦" },
  categories:   { label: "Categories",       icon: "🗂️" },
  footer:       { label: "Footer",           icon: "📋" },
};

const PAGES = [
  { id: "home",     label: "Home",     icon: "🏠" },
  { id: "product",  label: "Product",  icon: "📦" },
  { id: "category", label: "Category", icon: "🗂️" },
  { id: "search",   label: "Search",   icon: "🔍" },
];

const FONTS     = ["Cairo","Inter","Poppins","Roboto"];
const RADII     = [{ v:"small", l:"صغير" },{ v:"medium", l:"متوسط" },{ v:"large", l:"كبير" }];
const BTN_STYLE = [{ v:"filled", l:"ممتلئ" },{ v:"outline", l:"مخطط" },{ v:"ghost", l:"شفاف" }];

// ─────────────────────────────────────────────
// CSS
// ─────────────────────────────────────────────
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&family=Inter:wght@400;500;600;700&display=swap');

@keyframes pb-spin  { to { transform:rotate(360deg); } }
@keyframes pb-toast { from { opacity:0; transform:translateX(-50%) translateY(8px); } }
@keyframes pb-panel { from { opacity:0; transform:translateX(16px); } to { opacity:1; transform:translateX(0); } }

/* ── BUILDER SHELL ── */
.pb-shell {
  display: flex;
  height: calc(100vh - 60px);
  background: #f0f2f5;
  overflow: hidden;
  font-family: 'Inter', sans-serif;
}

/* ── TOP BAR ── */
.pb-topbar {
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 52px;
  background: #fff;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  z-index: 100;
  gap: 12px;
}
.pb-topbar__left  { display:flex; align-items:center; gap:10px; }
.pb-topbar__mid   { display:flex; align-items:center; gap:6px; }
.pb-topbar__right { display:flex; align-items:center; gap:8px; }

.pb-back-btn {
  display: flex; align-items: center; gap: 6px;
  font-size: .8rem; font-weight: 600; color: #6b7280;
  background: none; border: none; cursor: pointer;
  font-family: inherit; padding: 6px 8px; border-radius: 7px;
  transition: background .15s, color .15s;
}
.pb-back-btn:hover { background: #f3f4f6; color: #111; }

.pb-draft-badge {
  font-size: .7rem; font-weight: 700;
  padding: 3px 8px; border-radius: 5px;
  background: #fef3c7; color: #92400e;
}

.pb-view-btn {
  display: flex; align-items: center; justify-content: center;
  width: 34px; height: 34px; border-radius: 8px; border: 1.5px solid #e5e7eb;
  background: #fff; cursor: pointer; color: #6b7280;
  transition: all .15s;
}
.pb-view-btn:hover       { border-color: #d1d5db; color: #111; }
.pb-view-btn--active     { border-color: #111827; background: #111827; color: #fff; }

.pb-page-select {
  display: flex; align-items: center; gap: 6px;
  padding: 6px 12px; border-radius: 8px; border: 1.5px solid #e5e7eb;
  font-size: .8rem; font-weight: 600; background: #fff; cursor: pointer;
  color: #374151; font-family: inherit; transition: border-color .15s;
}
.pb-page-select:hover { border-color: #d1d5db; }

.pb-page-dropdown {
  position: absolute;
  top: 52px; left: 50%; transform: translateX(-50%);
  background: #fff; border: 1px solid #e5e7eb;
  border-radius: 10px; padding: 6px;
  box-shadow: 0 8px 32px rgba(0,0,0,.12);
  z-index: 999; min-width: 180px;
}
.pb-page-option {
  display: flex; align-items: center; gap: 8px;
  padding: 9px 12px; border-radius: 7px; cursor: pointer;
  font-size: .83rem; font-weight: 500; color: #374151;
  transition: background .12s;
}
.pb-page-option:hover    { background: #f3f4f6; }
.pb-page-option--active  { background: #f3f4f6; font-weight: 700; }

.pb-publish-btn {
  padding: 8px 20px; border-radius: 8px; border: none;
  background: #111827; color: #fff;
  font-size: .83rem; font-weight: 700; cursor: pointer;
  font-family: inherit; transition: opacity .15s;
  display: flex; align-items: center; gap: 6px;
}
.pb-publish-btn:hover:not(:disabled) { opacity: .85; }
.pb-publish-btn:disabled { opacity: .5; cursor: not-allowed; }

.pb-preview-btn {
  padding: 8px 16px; border-radius: 8px;
  border: 1.5px solid #e5e7eb; background: #fff;
  font-size: .83rem; font-weight: 600; cursor: pointer;
  font-family: inherit; color: #374151; transition: border-color .15s;
}
.pb-preview-btn:hover { border-color: #d1d5db; }

/* ── BODY (below topbar) ── */
.pb-body {
  display: flex;
  width: 100%;
  height: 100%;
  padding-top: 52px;
}

/* ── LEFT PANEL — Sections list ── */
.pb-left {
  width: 240px;
  flex-shrink: 0;
  background: #fff;
  border-right: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.pb-left__header {
  padding: 14px 14px 10px;
  border-bottom: 1px solid #f3f4f6;
}

.pb-left__title {
  font-size: .75rem; font-weight: 700;
  color: #9ca3af; text-transform: uppercase;
  letter-spacing: .08em;
}

.pb-sections-list {
  flex: 1; overflow-y: auto; padding: 8px;
}

.pb-section-item {
  display: flex; align-items: center; gap: 8px;
  padding: 9px 10px; border-radius: 8px; cursor: pointer;
  margin-bottom: 2px; transition: background .12s;
  border: 1.5px solid transparent;
  position: relative;
}
.pb-section-item:hover   { background: #f9fafb; }
.pb-section-item--active { background: #f0f0ff; border-color: #894bf4; }
.pb-section-item--disabled { opacity: .45; }

.pb-section-item__drag {
  cursor: grab; color: #d1d5db; flex-shrink: 0; padding: 2px;
}
.pb-section-item__icon  { font-size: 14px; flex-shrink: 0; width: 20px; text-align: center; }
.pb-section-item__label { flex: 1; font-size: .82rem; font-weight: 500; color: #374151; }

.pb-toggle {
  position: relative;
  width: 30px; height: 17px; flex-shrink: 0;
}
.pb-toggle input { opacity: 0; width: 0; height: 0; }
.pb-toggle__slider {
  position: absolute; inset: 0;
  background: #d1d5db; border-radius: 99px;
  transition: background .2s; cursor: pointer;
}
.pb-toggle__slider::after {
  content: "";
  position: absolute;
  left: 2px; top: 2px;
  width: 13px; height: 13px;
  border-radius: 50%; background: #fff;
  transition: transform .2s;
}
.pb-toggle input:checked + .pb-toggle__slider { background: #894bf4; }
.pb-toggle input:checked + .pb-toggle__slider::after { transform: translateX(13px); }



.pb-add-section {
  padding: 10px 10px 12px;
  border-top: 1px solid #f3f4f6;
}
.pb-add-btn {
  width: 100%; padding: 9px;
  border: 1.5px dashed #d1d5db; border-radius: 8px;
  background: none; cursor: pointer; color: #9ca3af;
  font-size: .8rem; font-weight: 600; font-family: inherit;
  display: flex; align-items: center; justify-content: center; gap: 6px;
  transition: border-color .15s, color .15s;
}
.pb-add-btn:hover { border-color: #894bf4; color: #894bf4; }

/* ── CENTER — Preview ── */
.pb-center {
  flex: 1; overflow: hidden;
  display: flex; align-items: center; justify-content: center;
  background: #e8e8e8;
  padding: 20px;
}

.pb-preview-desktop {
  width: 100%; height: 100%;
  background: #fff; border-radius: 10px;
  box-shadow: 0 0 0 1px rgba(0,0,0,.1), 0 8px 40px rgba(0,0,0,.15);
  overflow: hidden;
  display: flex; flex-direction: column;
}

.pb-iphone {
  position: relative;
  width: 260px;
  height: 564px;
  flex-shrink: 0;
  margin: auto;
}
.pb-iphone__frame {
  position: absolute;
  inset: 0;
  border-radius: 44px;
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
  border-radius: 36px;
  overflow: hidden;
  background: #000;
  z-index: 10;
}
.pb-iphone__island {
  position: absolute;
  top: 14px;
  left: 50%;
  transform: translateX(-50%);
  width: 88px; height: 26px;
  background: #000;
  border-radius: 20px;
  z-index: 25;
  pointer-events: none;
}
.pb-iphone__status {
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 50px;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  padding: 0 20px 8px;
  z-index: 22;
  pointer-events: none;
  background: rgba(255,255,255,0.92);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}
.pb-iphone__time {
  font-size: 13px; font-weight: 700;
  color: #000; font-family: -apple-system, sans-serif;
  letter-spacing: -.3px;
}
.pb-iphone__signals { display: flex; align-items: center; gap: 5px; }
.pb-iphone__btn-right {
  position: absolute;
  right: -3px; top: 110px;
  width: 3px; height: 58px;
  background: linear-gradient(to right, #1a1a1a, #2e2e2e, #1a1a1a);
  border-radius: 0 2px 2px 0;
  z-index: 21; pointer-events: none;
}
.pb-iphone__btn-left1 {
  position: absolute;
  left: -3px; top: 85px;
  width: 3px; height: 34px;
  background: linear-gradient(to left, #1a1a1a, #2e2e2e, #1a1a1a);
  border-radius: 2px 0 0 2px;
  z-index: 21; pointer-events: none;
}
.pb-iphone__btn-left2 {
  position: absolute;
  left: -3px; top: 138px;
  width: 3px; height: 54px;
  background: linear-gradient(to left, #1a1a1a, #2e2e2e, #1a1a1a);
  border-radius: 2px 0 0 2px;
  z-index: 21; pointer-events: none;
}
.pb-iphone__btn-left3 {
  position: absolute;
  left: -3px; top: 204px;
  width: 3px; height: 54px;
  background: linear-gradient(to left, #1a1a1a, #2e2e2e, #1a1a1a);
  border-radius: 2px 0 0 2px;
  z-index: 21; pointer-events: none;
}
.pb-iphone__content {
  position: absolute;
  top: 50px;
  left: 0; right: 0; bottom: 0;
  overflow: hidden;
}
.pb-iphone__iframe {
  position: absolute;
  top: 0; left: 0;
  width: 390px;
  height: 844px;
  border: none;
  display: block;
  transform-origin: top left;
  transform: scale(0.615);
}

.pb-chrome-bar {
  background: #ebebeb; padding: 8px 12px;
  display: flex; align-items: center; gap: 6px;
  border-bottom: 1px solid #ddd; flex-shrink: 0;
}
.pb-chrome-dot { width:11px; height:11px; border-radius:50%; flex-shrink:0; }
.pb-chrome-url {
  flex:1; margin: 0 8px;
  background:#fff; border:1px solid #d0d0d0;
  border-radius:5px; padding:4px 10px;
  font-size:11px; color:#555; font-family:monospace;
  display:flex; align-items:center; gap:5px;
}

.pb-preview-iframe {
  width: 100%; height: 100%; border: none;
  flex: 1;
}

.pb-preview-section-highlight {
  outline: 2px solid #894bf4;
  outline-offset: -2px;
}

/* ── RIGHT PANEL — Settings ── */
.pb-right {
  width: 280px;
  flex-shrink: 0;
  background: #fff;
  border-left: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: pb-panel .2s ease;
}

.pb-right__header {
  padding: 14px 16px 12px;
  border-bottom: 1px solid #f3f4f6;
  display: flex; align-items: center; justify-content: space-between;
}

.pb-right__title {
  font-size: .88rem; font-weight: 700; color: #111827;
  display: flex; align-items: center; gap: 7px;
}

.pb-right__close {
  width: 26px; height: 26px; border-radius: 6px;
  border: 1.5px solid #e5e7eb; background: #fff;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; color: #9ca3af; transition: all .15s;
}
.pb-right__close:hover { background: #f3f4f6; color: #111; }

.pb-right__body { flex:1; overflow-y:auto; padding: 14px 16px; display:flex; flex-direction:column; gap:18px; }

/* ── FIELD GROUPS ── */
.pb-group { display:flex; flex-direction:column; gap:10px; }

.pb-group__label {
  font-size: .68rem; font-weight: 700;
  color: #9ca3af; text-transform: uppercase; letter-spacing: .08em;
  padding-bottom: 6px;
  border-bottom: 1px solid #f3f4f6;
}

.pb-field { display:flex; flex-direction:column; gap:5px; }

.pb-label {
  font-size: .75rem; font-weight: 600; color: #374151;
  display: flex; justify-content: space-between;
}
.pb-label span { font-weight: 400; color: #9ca3af; }

.pb-input {
  width: 100%; padding: 8px 10px;
  border: 1.5px solid #e5e7eb; border-radius: 7px;
  font-size: .83rem; color: #111827; font-family: inherit;
  background: #fafafa; outline: none; box-sizing: border-box;
  transition: border-color .15s;
}
.pb-input:focus { border-color: #894bf4; background: #fff; }

.pb-textarea {
  width: 100%; padding: 8px 10px; min-height: 72px; resize: vertical;
  border: 1.5px solid #e5e7eb; border-radius: 7px;
  font-size: .83rem; color: #111827; font-family: inherit;
  background: #fafafa; outline: none; box-sizing: border-box;
  transition: border-color .15s;
}
.pb-textarea:focus { border-color: #894bf4; background: #fff; }

/* Color field */
.pb-color-row { display:flex; align-items:center; gap:8px; }
.pb-color-swatch {
  width: 36px; height: 36px; border-radius: 8px;
  border: 1.5px solid #e5e7eb; overflow: hidden; position: relative;
  cursor: pointer; flex-shrink: 0;
}
.pb-color-swatch input[type=color] {
  position: absolute; inset: -4px; width: calc(100% + 8px);
  height: calc(100% + 8px); opacity: 0; cursor: pointer;
}
.pb-color-hex {
  flex: 1; padding: 8px 10px;
  border: 1.5px solid #e5e7eb; border-radius: 7px;
  font-size: .82rem; font-family: monospace; color: #374151;
  background: #fafafa; outline: none;
  transition: border-color .15s;
}
.pb-color-hex:focus { border-color: #894bf4; }

/* Toggle row */
.pb-toggle-row {
  display: flex; align-items: center; justify-content: space-between;
  padding: 4px 0;
}
.pb-toggle-row__label { font-size: .82rem; font-weight: 500; color: #374151; }

/* Segment */
.pb-segment { display:flex; gap:4px; }
.pb-seg-btn {
  flex: 1; padding: 7px 4px; border-radius: 6px;
  border: 1.5px solid #e5e7eb; background: #fafafa;
  font-size: .75rem; font-weight: 600; cursor: pointer;
  font-family: inherit; color: #6b7280; transition: all .15s;
  text-align: center;
}
.pb-seg-btn:hover      { border-color: #d1d5db; color: #111; }
.pb-seg-btn--active    { border-color: #894bf4; background: #f0f0ff; color: #894bf4; }

/* Range */
.pb-range { width: 100%; accent-color: #894bf4; }

/* Badge card */
.pb-badge-card {
  background: #f9fafb; border: 1.5px solid #f0f0f0;
  border-radius: 8px; padding: 10px 10px; display:flex; flex-direction:column; gap:6px;
}
.pb-badge-card__header {
  font-size: .72rem; font-weight: 700; color: #9ca3af;
  text-transform: uppercase; letter-spacing: .06em;
}

/* Styles tab */
.pb-no-selection {
  flex:1; display:flex; flex-direction:column;
  align-items:center; justify-content:center;
  gap:10px; color:#9ca3af;
  padding: 32px;
  text-align: center;
}
.pb-no-selection__icon { font-size: 2.5rem; opacity:.4; }
.pb-no-selection__text { font-size: .82rem; line-height: 1.5; }

/* Tabs */
.pb-tabs {
  display:flex; border-bottom: 1px solid #f3f4f6;
  padding: 0 14px;
}
.pb-tab {
  padding: 11px 14px; font-size: .8rem; font-weight: 600;
  color: #9ca3af; border: none; background: none; cursor: pointer;
  font-family: inherit; border-bottom: 2px solid transparent;
  transition: color .15s; margin-bottom: -1px;
}
.pb-tab--active { color: #894bf4; border-bottom-color: #894bf4; }

/* ── TOAST ── */
.pb-toast {
  position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%);
  padding: 10px 22px; border-radius: 10px;
  font-size: .84rem; font-weight: 600; z-index: 9999;
  box-shadow: 0 4px 20px rgba(0,0,0,.15); white-space: nowrap;
  animation: pb-toast .25s ease; font-family: 'Inter', sans-serif;
}
.pb-toast--success { background:#111827; color:#fff; }
.pb-toast--error   { background:#ef4444; color:#fff; }

/* Loading */
.pb-loading {
  flex:1; display:flex; align-items:center; justify-content:center;
  flex-direction:column; gap:14px; color:#9ca3af; font-size:.85rem;
  font-family:'Inter',sans-serif;
}
.pb-spinner {
  width:30px; height:30px; border:3px solid #f0f0f0;
  border-top-color:#894bf4; border-radius:50%;
  animation: pb-spin .7s linear infinite;
}

/* font options */
.pb-font-grid { display:grid; grid-template-columns:1fr 1fr; gap:6px; }
.pb-font-btn {
  padding: 8px 6px; border-radius: 7px;
  border: 1.5px solid #e5e7eb; background: #fafafa;
  font-size: .8rem; font-weight: 600; cursor: pointer;
  font-family: inherit; color: #374151;
  transition: all .15s; text-align: center;
}
.pb-font-btn:hover   { border-color: #d1d5db; }
.pb-font-btn--active { border-color: #894bf4; background: #f0f0ff; color: #894bf4; }
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
  return (
    <>
      <div className="pb-group">
        <div className="pb-group__label">Image</div>
        <div className="pb-field">
          <div className="pb-label">Hero image</div>
          <ImageUploader value={settings.image} onChange={v => s("image", v)} label="Hero Banner" dark={false} />
        </div>
        <div className="pb-field">
          <div className="pb-label">Height</div>
          <div className="pb-segment">
            {[{v:"small",l:"صغير"},{v:"large",l:"كبير"},{v:"full",l:"كامل"}].map(o => (
              <button key={o.v}
                className={`pb-seg-btn ${settings.height === o.v ? "pb-seg-btn--active" : ""}`}
                onClick={() => s("height", o.v)}>{o.l}</button>
            ))}
          </div>
        </div>
        <div className="pb-field">
          <div className="pb-label">Overlay opacity <span>{settings.overlayOpacity}%</span></div>
          <input type="range" className="pb-range" min={0} max={90} step={5}
            value={settings.overlayOpacity} onChange={e => s("overlayOpacity", +e.target.value)} />
        </div>
      </div>
      <div className="pb-group">
        <div className="pb-group__label">Content</div>
        <div className="pb-field">
          <div className="pb-label">Title <span>اختياري</span></div>
          <input className="pb-input" value={settings.title} onChange={e => s("title", e.target.value)} placeholder="عنوان كبير..." />
        </div>
        <div className="pb-field">
          <div className="pb-label">Subtitle</div>
          <input className="pb-input" value={settings.subtitle} onChange={e => s("subtitle", e.target.value)} />
        </div>
        <div className="pb-field">
          <div className="pb-label">CTA button text</div>
          <input className="pb-input" value={settings.ctaText} onChange={e => s("ctaText", e.target.value)} />
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
  return (
    <>
      <div className="pb-group">
        <div className="pb-group__label">Badges</div>
        {settings.badges.map((badge, i) => (
          <div key={i} className="pb-badge-card">
            <div className="pb-badge-card__header">Badge {i + 1}</div>
            <div className="pb-field">
              <div className="pb-label">Icon (emoji)</div>
              <input className="pb-input" value={badge.icon}  onChange={e => updateBadge(i, "icon",  e.target.value)} maxLength={4} />
            </div>
            <div className="pb-field">
              <div className="pb-label">Title</div>
              <input className="pb-input" value={badge.title} onChange={e => updateBadge(i, "title", e.target.value)} />
            </div>
            <div className="pb-field">
              <div className="pb-label">Subtitle</div>
              <input className="pb-input" value={badge.sub}   onChange={e => updateBadge(i, "sub",   e.target.value)} />
            </div>
          </div>
        ))}
      </div>
      <div className="pb-group">
        <div className="pb-group__label">Styles</div>
        <ColorField label="Background color" value={settings.bgColor} onChange={v => s("bgColor", v)} />
      </div>
    </>
  );
}

function CollectionSettings({ settings, onChange }) {
  const s = (k, v) => onChange({ ...settings, [k]: v });
  return (
    <>
      <div className="pb-group">
        <div className="pb-group__label">Content</div>
        <div className="pb-field">
          <div className="pb-label">Section title</div>
          <input className="pb-input" value={settings.title} onChange={e => s("title", e.target.value)} />
        </div>
        <div className="pb-toggle-row">
          <span className="pb-toggle-row__label">Show "View All" link</span>
          <Toggle checked={settings.showViewAll} onChange={v => s("showViewAll", v)} />
        </div>
        {settings.showViewAll && (
          <div className="pb-field">
            <div className="pb-label">View All text</div>
            <input className="pb-input" value={settings.viewAllText} onChange={e => s("viewAllText", e.target.value)} />
          </div>
        )}
      </div>
      <div className="pb-group">
        <div className="pb-group__label">Layout</div>
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
        <ColorField label="Primary color"   value={styles.primaryColor}   onChange={v => s("primaryColor",   v)} />
        <ColorField label="Secondary color" value={styles.secondaryColor} onChange={v => s("secondaryColor", v)} />
      </div>
      <div className="pb-group">
        <div className="pb-group__label">Typography</div>
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
          <span>{meta.icon}</span>
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
      <div className="pb-iphone">
        {/* الإطار الخارجي */}
        <div className="pb-iphone__frame" />
        {/* أزرار جانبية */}
        <div className="pb-iphone__btn-right" />
        <div className="pb-iphone__btn-left1" />
        <div className="pb-iphone__btn-left2" />
        <div className="pb-iphone__btn-left3" />
        {/* الشاشة */}
        <div className="pb-iphone__screen-wrap">
          {/* Dynamic Island */}
          <div className="pb-iphone__island" />
          {/* Status Bar */}
          <div className="pb-iphone__status">
            <span className="pb-iphone__time">9:41</span>
            <div className="pb-iphone__signals">
              <svg width="13" height="10" viewBox="0 0 17 12" fill="#000">
                <rect x="0" y="7" width="3" height="5" rx=".5"/>
                <rect x="4.5" y="4.5" width="3" height="7.5" rx=".5"/>
                <rect x="9" y="2" width="3" height="10" rx=".5"/>
                <rect x="13.5" y="0" width="3" height="12" rx=".5" opacity=".3"/>
              </svg>
              <svg width="13" height="10" viewBox="0 0 16 12" fill="none" stroke="#000" strokeWidth="1.8" strokeLinecap="round">
                <path d="M8 10h.01"/><path d="M5.5 7.5a3.5 3.5 0 015 0"/>
                <path d="M3 5a7 7 0 0110 0"/><path d="M1 2.5a11 11 0 0114 0"/>
              </svg>
              <svg width="19" height="10" viewBox="0 0 25 12" fill="#000">
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
          const cfg = d.store.themeConfig;
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
              ? <><span style={{ display:"inline-block", animation:"pb-spin .7s linear infinite" }}>⏳</span> Saving...</>
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