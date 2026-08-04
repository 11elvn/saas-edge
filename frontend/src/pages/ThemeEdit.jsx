// ============================================================
// 📁 pages/ThemeEdit.jsx — Page Builder (Tassyir-style)
// 3 columns: Sections List | Live Preview | Settings Panel
// ============================================================
import { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";

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
        links: [
          { id: "l1", title: "الصفحة الرئيسية", url: "/" },
          { id: "l2", title: "التصنيفات", url: "/collections" },
          { id: "l3", title: "اتصل بنا", url: "#" },
        ],
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
        subtitle: "اعثر على كل ما تريد",
        titleAlign: "right",
        displayStyle: "grid",
        maxItems: 6,
      },
    },
    {
      id: "footer",
      type: "footer",
      enabled: true,
      settings: {
        copyright: "© 2025 اسم متجرك",
        showNewsletter: true,
        termsText: "الشروط والسياسات",
        showSocials: true,
        socials: { facebook: "", instagram: "", youtube: "", tiktok: "", twitter: "", whatsapp: "" },
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
// PRODUCT PAGE — DEFAULT CONFIG
// ✦ Gallery / Product Info / In-Page Checkout — خاصين بصفحة المنتج فقط
// ✦ Announcement / Header / Footer مشتركين مع Home (يتقراو من themeConfig.sections)
// ─────────────────────────────────────────────
const PRODUCT_DEFAULT_CONFIG = {
  sections: [
    {
      id: "gallery",
      type: "gallery",
      enabled: true,
      settings: {
        carouselMode: false,
        layout: "stacked",     // stacked | bottom-rail
        imageRatio: "1:1",     // 1:1 | 3:4 | 4:3 | adapt
        enableZoom: false,
        showArrows: true,
        showThumbnails: true,  // فقط فـ Carousel mode
        thumbnailsShown: 4,    // فقط فـ Carousel mode
      },
    },
    {
      id: "productInfo",
      type: "productInfo",
      enabled: true,
      settings: {
        ctaButtonText: "اطلب الآن",
        showQuantitySelector: true,
        showAddToCartButton: true,
        badgeText: "الأكثر مبيعاً",
        showDeliveryNote: true,
        deliveryNote: "توصيل خلال 3-5 أيام عمل لجميع ولايات الجزائر 🚚",
      },
    },
    {
      id: "checkout",
      type: "checkout",
      enabled: true,
      settings: {
        sectionTitle: "معلومات الطلب",
        titleAlign: "right",     // right | center | left
        submitButtonText: "تأكيد الطلب",
        formStyle: "default",    // default | compact
        buttonAnimation: "none", // none | pulse
        showFieldIcons: true,
        showAddressField: false,
        showNoteField: false,
        stickyButton: true,
        stickyButtonText: "اطلب الآن",
        fields: {
          fullName:     { enabled: true, required: true },
          phone:        { enabled: true, required: true },
          province:     { enabled: true, required: true },
          municipality: { enabled: true, required: false },
        },
      },
    },
  ],
};

// ✦ Default config لصفحة Category (بانر التصنيف + شبكة المنتجات) — نفس مبدأ PRODUCT_DEFAULT_CONFIG
const CATEGORY_DEFAULT_CONFIG = {
  sections: [
    {
      id: "categoryBanner",
      type: "categoryBanner",
      enabled: true,
      settings: {
        style: "overlay",        // overlay (تصميم A) | compact (تصميم B)
        showProductCount: true,
      },
    },
    // ✦ نفس section الـ Collection ديال Home — كيتحكم فـ شكل شبكة المنتجات هنا
    // ✦ id فريد (categoryCollection) باش ما يتصادمش مع section الهوم اللي عندو نفس النوع "collection"
    // (activeIsCategorySection فـ ThemeEdit كيتأكد بـ id، فإذا كان نفس id كيروح التحديث غلط لـ Home)
    {
      id: "categoryCollection",
      type: "collection",
      enabled: true,
      settings: {
        title: "منتجات",
        titleAlign: "right",
        selectionMode: "all",
        productsShown: 8,
        carouselMode: false,
        columns: 3,                 // 2 | 3 | 4
        cardStyle: "default",       // default | minimal | bordered
        imageRatio: "1:1",          // 1:1 | 3:4 | adapt
        showBadge: true,
        showRating: false,
        showViewAll: false,
        viewAllText: "عرض الكل",
        viewAllStyle: "link",
        infiniteScroll: false,
      },
    },
  ],
};

// ✦ Default config لصفحة Success (تأكيد الطلب) — section واحد "successMessage"
// ✦ Announcement / Header / Footer مشتركين مع Home، نفس مبدأ Product/Category
const SUCCESS_DEFAULT_CONFIG = {
  sections: [
    {
      id: "successMessage",
      type: "successMessage",
      enabled: true,
      settings: {
        headline: "تم تأكيد طلبك بنجاح",
        subtext: "سيتواصل معك فريقنا قريباً لتأكيد تفاصيل التوصيل",
        showOrderNumber: true,
        showOrderSummary: true,
        showTimeline: true,
        ctaButtonText: "تابع التسوق",
        ctaButtonLink: "/",
        showSecondaryButton: true,
        secondaryButtonText: "تواصل معنا عبر واتساب",
        whatsappNumber: "",
        backgroundStyle: "tinted",    // plain | tinted
      },
    },
  ],
};

// ─────────────────────────────────────────────
// SECTION ICONS & LABELS
// ─────────────────────────────────────────────
const SECTION_META = {
  announcement: { label: "Announcement Bar", icon: "announcement" },
  header:       { label: "Header",           icon: "header", locked: true },
  hero:         { label: "Hero Banner",      icon: "hero" },
  trust:        { label: "Trust Badges",     icon: "trust" },
  collection:   { label: "Collection",       icon: "collection" },
  categories:   { label: "Categories",       icon: "categories" },
  footer:       { label: "Footer",           icon: "footer", locked: true },
};

// ✦ Sections خاصة بصفحة المنتج فقط — locked ديما (ماشي قابلين للحذف)
const PRODUCT_SECTION_META = {
  gallery:     { label: "Gallery",           icon: "gallery",     locked: true },
  productInfo: { label: "Product Info",      icon: "productInfo", locked: true },
  checkout:    { label: "In-Page Checkout",  icon: "checkout",    locked: true },
};

// ✦ Sections خاصة بصفحة Category فقط — locked ديما
const CATEGORY_SECTION_META = {
  categoryBanner: { label: "Category Banner", icon: "categories", locked: true },
};

// ✦ Section خاص بصفحة Success (تأكيد الطلب) فقط — locked ديما
const SUCCESS_SECTION_META = {
  successMessage: { label: "Success Message", icon: "success", locked: true },
};

// ✦ helper — يلقى meta الـ section سواء كانت Home ولا Product ولا Category ولا Success
const getSectionMeta = (type) =>
  SECTION_META[type] || PRODUCT_SECTION_META[type] || CATEGORY_SECTION_META[type] || SUCCESS_SECTION_META[type] || {};

const PAGES = [
  { id: "home",     label: "Home",     icon: "home" },
  { id: "product",  label: "Product",  icon: "collection" },
  { id: "category", label: "Category", icon: "categories" },
  { id: "success",  label: "Success",  icon: "success" },
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
    case "success":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <polyline points="8 12.5 11 15.5 16 9.5" />
        </svg>
      );
    case "gallery":
      return (
        <svg {...common}>
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <path d="M21 15l-5-5L5 21" />
        </svg>
      );
    case "productInfo":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <line x1="12" y1="11" x2="12" y2="16.5" />
          <circle cx="12" cy="7.8" r="0.9" fill="currentColor" stroke="none" />
        </svg>
      );
    case "checkout":
      return (
        <svg {...common}>
          <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
          <line x1="3" y1="6" x2="21" y2="6" />
          <path d="M16 10a4 4 0 01-8 0" />
        </svg>
      );
    case "chevronDown":
      return (
        <svg {...common}>
          <polyline points="6 9 12 15 18 9" />
        </svg>
      );
    case "alignRight":
      return (
        <svg {...common}>
          <line x1="21" y1="6" x2="3" y2="6" /><line x1="21" y1="12" x2="9" y2="12" /><line x1="21" y1="18" x2="6" y2="18" />
        </svg>
      );
    case "alignCenter":
      return (
        <svg {...common}>
          <line x1="21" y1="6" x2="3" y2="6" /><line x1="18" y1="12" x2="6" y2="12" /><line x1="19" y1="18" x2="5" y2="18" />
        </svg>
      );
    case "alignLeft":
      return (
        <svg {...common}>
          <line x1="21" y1="6" x2="3" y2="6" /><line x1="15" y1="12" x2="3" y2="12" /><line x1="18" y1="18" x2="3" y2="18" />
        </svg>
      );
    case "rowLayout":
      return (
        <svg {...common}>
          <rect x="3" y="5" width="18" height="5" rx="1.5" />
          <rect x="3" y="14" width="18" height="5" rx="1.5" />
        </svg>
      );
    case "eye":
      return (
        <svg {...common}>
          <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7Z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      );
    case "eye-off":
      return (
        <svg {...common}>
          <path d="M17.9 17.9A10.4 10.4 0 0 1 12 20c-6.4 0-10-8-10-8a18.6 18.6 0 0 1 4.2-5.2M9.9 9.9a3 3 0 0 0 4.2 4.2" />
          <path d="M12 4c6.4 0 10 8 10 8a18.6 18.6 0 0 1-2.2 3.2" />
          <line x1="2" y1="2" x2="22" y2="22" />
        </svg>
      );
    case "trash":
      return (
        <svg {...common}>
          <polyline points="3 6 5 6 21 6" />
          <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m2 0-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
          <line x1="10" y1="11" x2="10" y2="17" />
          <line x1="14" y1="11" x2="14" y2="17" />
        </svg>
      );
    case "lock":
      return (
        <svg {...common}>
          <rect x="4" y="10" width="16" height="11" rx="2" />
          <path d="M8 10V7a4 4 0 0 1 8 0v3" />
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
  position: relative;
}

/* ── COLLAPSE ARROW (toggles left/right panels) ── */
.pb-collapse-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 26px; height: 26px;
  border-radius: 50%;
  background: #ffffff;
  border: 1px solid rgba(15,23,42,.08);
  box-shadow: 0 2px 8px rgba(15,23,42,.14);
  display: flex; align-items: center; justify-content: center;
  cursor: pointer;
  color: #6b7280;
  z-index: 60;
  padding: 0;
  transition: left .25s ease, right .25s ease, background .15s, color .15s;
}
.pb-collapse-btn:hover { background: #f5f3ff; color: #5b3fd6; }

/* ── LEFT PANEL — Sections list ── */
.pb-left {
  width: 340px;
  flex-shrink: 0;
  margin: 14px 0;
  background: rgba(255,255,255,.72);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: 16px;
  box-shadow: 0 8px 28px rgba(15,23,42,.08);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition: width .25s ease;
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
  display: flex; align-items: center; justify-content: center;
}
.pb-section-item__icon  { font-size: 14px; flex-shrink: 0; width: 20px; text-align: center; }
.pb-section-item__label { flex: 1; font-size: .84rem; font-weight: 600; color: #334155; }

.pb-section-item__actions {
  display: flex; align-items: center; gap: 6px; flex-shrink: 0;
  opacity: 0; transition: opacity .12s ease;
}
.pb-section-item:hover .pb-section-item__actions,
.pb-section-item--active .pb-section-item__actions {
  opacity: 1;
}
.pb-section-item__action {
  width: 26px; height: 26px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  background: #fff; border: 1px solid rgba(15,23,42,.08);
  color: #475569; cursor: pointer; padding: 0;
  box-shadow: 0 1px 3px rgba(15,23,42,.08);
  transition: all .14s ease;
}
.pb-section-item__action:hover { background: #f5f3ff; color: #5b3fd6; border-color: rgba(124,109,242,.3); }
.pb-section-item__action--danger:hover { background: #fef2f2; color: #dc2626; border-color: rgba(220,38,38,.25); }

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

.pb-add-menu {
  position: absolute;
  bottom: calc(100% + 8px);
  left: 11px; right: 11px;
  background: #fff;
  border-radius: 12px;
  border: 1px solid rgba(15,23,42,.08);
  box-shadow: 0 12px 32px rgba(15,23,42,.16);
  padding: 6px;
  max-height: 240px;
  overflow-y: auto;
  z-index: 40;
  animation: pb-fade .16s ease both;
}
.pb-add-menu__item {
  width: 100%; display: flex; align-items: center; gap: 10px;
  padding: 9px 10px; border-radius: 9px; border: none; background: none;
  font-family: inherit; font-size: .82rem; font-weight: 600; color: #334155;
  cursor: pointer; text-align: right; transition: background .12s;
}
.pb-add-menu__item:hover { background: rgba(124,109,242,.08); color: #5b3fd6; }
.pb-add-menu__empty {
  padding: 12px 10px; font-size: .78rem; color: #94a3b8; text-align: center;
}

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

.pb-preview-mobile {
  width: 420px; max-width: 100%; height: 100%;
  background: #fff; border-radius: 16px;
  box-shadow: 0 1px 0 rgba(255,255,255,.6) inset, 0 24px 64px rgba(15,23,42,.18), 0 0 0 1px rgba(15,23,42,.05);
  overflow: hidden;
  display: flex; flex-direction: column;
  margin: auto;
}
.pb-preview-mobile-wrap {
  position: relative;
  flex: 1;
  overflow: hidden;
}
.pb-preview-mobile-iframe {
  position: absolute;
  top: 0; left: 0;
  border: none;
  transform-origin: top left;
  /* width/height/transform يتحسبو بـ JS باش يبقى الـ layout ديال الموبايل صحيح */
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

.pb-preview-desktop-wrap {
  position: relative;
  flex: 1;
  overflow: hidden;
}
.pb-preview-iframe {
  position: absolute;
  top: 0; left: 0;
  border: none;
  transform-origin: top left;
  /* width/height/transform يتحسبو بـ JS باش يبقى الـ layout ديال الحاسوب صحيح */
}

.pb-preview-section-highlight {
  outline: 2px solid #7c6df2;
  outline-offset: -2px;
}

/* ── RIGHT PANEL — Settings ── */
.pb-right {
  width: 340px;
  flex-shrink: 0;
  margin: 14px 0;
  background: rgba(255,255,255,.75);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: 16px;
  box-shadow: 0 8px 28px rgba(15,23,42,.08);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition: width .25s ease;
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

/* Logo uploader — premium drag & drop */
.pb-logo-upload { position: relative; }
.pb-logo-upload__dropzone {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 7px; padding: 26px 16px;
  border: 1.5px dashed rgba(124,109,242,.32); border-radius: 14px;
  background: rgba(124,109,242,.03);
  cursor: pointer; transition: all .2s; position: relative;
}
.pb-logo-upload__dropzone:hover,
.pb-logo-upload__dropzone--drag {
  border-color: #7c6df2; background: rgba(124,109,242,.07);
}
.pb-logo-upload__icon {
  width: 38px; height: 38px; border-radius: 11px;
  background: linear-gradient(135deg, rgba(124,109,242,.16), rgba(124,109,242,.06));
  display: flex; align-items: center; justify-content: center;
  color: #7c6df2;
}
.pb-logo-upload__title { font-size: .82rem; font-weight: 700; color: #334155; }
.pb-logo-upload__hint  { font-size: .72rem; color: #94a3b8; }

.pb-logo-upload__preview {
  position: relative; display: flex; align-items: center; gap: 12px;
  padding: 10px; border-radius: 14px;
  border: 1px solid rgba(15,23,42,.08);
  background-image:
    linear-gradient(45deg, #f1f5f9 25%, transparent 25%),
    linear-gradient(-45deg, #f1f5f9 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, #f1f5f9 75%),
    linear-gradient(-45deg, transparent 75%, #f1f5f9 75%);
  background-size: 12px 12px;
  background-position: 0 0, 0 6px, 6px -6px, -6px 0px;
  background-color: #fff;
}
.pb-logo-upload__thumb {
  width: 60px; height: 60px; border-radius: 12px; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  overflow: hidden; background: #fff; border: 1px solid rgba(15,23,42,.06);
}
.pb-logo-upload__thumb img { max-width: 100%; max-height: 100%; object-fit: contain; }
.pb-logo-upload__meta { flex: 1; min-width: 0; }
.pb-logo-upload__filename {
  font-size: .8rem; font-weight: 700; color: #1e293b;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.pb-logo-upload__status {
  font-size: .72rem; color: #10b981; font-weight: 600;
  margin-top: 3px; display: flex; align-items: center; gap: 4px;
}
.pb-logo-upload__actions { display: flex; gap: 6px; flex-shrink: 0; }
.pb-logo-upload__btn {
  width: 30px; height: 30px; border-radius: 9px;
  display: flex; align-items: center; justify-content: center;
  border: 1px solid rgba(15,23,42,.08); background: #fff; color: #64748b;
  cursor: pointer; transition: all .15s;
}
.pb-logo-upload__btn:hover { background: rgba(124,109,242,.09); border-color: #7c6df2; color: #7c6df2; }
.pb-logo-upload__btn--danger:hover { background: rgba(239,68,68,.09); border-color: #ef4444; color: #ef4444; }

.pb-logo-upload__loading {
  position: absolute; inset: 0; background: rgba(255,255,255,.88);
  backdrop-filter: blur(2px); border-radius: 14px;
  display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px;
  font-size: .78rem; font-weight: 700; color: #7c6df2;
}
.pb-logo-upload__spinner {
  width: 20px; height: 20px; border-radius: 50%;
  border: 2.5px solid rgba(124,109,242,.2); border-top-color: #7c6df2;
  animation: pb-logo-spin .7s linear infinite;
}
@keyframes pb-logo-spin { to { transform: rotate(360deg); } }
.pb-logo-upload__error { font-size: .74rem; color: #ef4444; font-weight: 600; margin-top: 6px; }

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

/* Navigation link card (repeater) */
.pb-link-card {
  border: 1px solid rgba(15,23,42,.08); border-radius: 12px;
  overflow: hidden; margin-bottom: 10px; background: #fff;
  transition: border-color .18s;
}
.pb-link-card:hover { border-color: rgba(124,109,242,.22); }
.pb-link-card__header {
  display: flex; align-items: center; justify-content: space-between;
  background: rgba(248,249,252,.9);
  padding: 10px 14px;
  font-size: .82rem; font-weight: 700; color: #1e293b;
  border-bottom: 1px solid rgba(15,23,42,.06);
}
.pb-link-card__body {
  padding: 12px 14px; display: flex; flex-direction: column; gap: 10px;
}
.pb-link-card__delete {
  background: none; border: none; cursor: pointer; color: #94a3b8;
  padding: 4px; border-radius: 6px; display: flex; align-items: center;
  transition: color .15s, background .15s;
}
.pb-link-card__delete:hover { color: #ef4444; background: rgba(239,68,68,.1); }
.pb-add-link-btn {
  width: 100%; padding: 12px; border-radius: 12px; margin-top: 2px;
  border: 1.5px dashed rgba(124,109,242,.35); background: rgba(124,109,242,.04);
  color: #7c6df2; font-weight: 700; font-size: .85rem; cursor: pointer;
  display: flex; align-items: center; justify-content: center; gap: 6px;
  transition: all .18s; font-family: inherit;
}
.pb-add-link-btn:hover { background: rgba(124,109,242,.09); border-color: #7c6df2; }

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
  background: #ffffff;
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

/* ── COLLAPSIBLE GROUP (accordion) — لصفحة Product settings ── */
.pb-acc { border-bottom: 1px solid rgba(15,23,42,.07); }
.pb-acc:last-child { border-bottom: none; }
.pb-acc__header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 13px 2px; cursor: pointer; user-select: none;
  background: none; border: none; width: 100%;
  font-family: 'Inter', sans-serif;
}
.pb-acc__title { font-size: .78rem; font-weight: 700; color: #374151; text-transform: uppercase; letter-spacing: .02em; }
.pb-acc__chevron { display:flex; color: #9ca3af; transition: transform .2s; }
.pb-acc__chevron--open { transform: rotate(180deg); }
.pb-acc__body { display:flex; flex-direction:column; gap:11px; padding-bottom: 14px; }

/* ── FIELD CARD (checkout form fields list) ── */
.pb-field-card {
  border: 1px solid rgba(15,23,42,.08); border-radius: 12px;
  padding: 12px 13px; display:flex; flex-direction:column; gap: 9px;
  background: rgba(248,249,252,.6);
}
.pb-field-card__title { font-size: .82rem; font-weight: 700; color: #1f2937; }
.pb-field-card__hint { font-size: .72rem; color: #9ca3af; margin-top: -2px; }
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
// COLLAPSE (accordion group) — يستعملها Gallery/Product Info/Checkout settings
// ─────────────────────────────────────────────
function Collapse({ title, defaultOpen = true, children }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="pb-acc">
      <button type="button" className="pb-acc__header" onClick={() => setOpen(v => !v)}>
        <span className="pb-acc__title">{title}</span>
        <span className={`pb-acc__chevron ${open ? "pb-acc__chevron--open" : ""}`}>
          <Icon name="chevronDown" size={14} />
        </span>
      </button>
      {open && <div className="pb-acc__body">{children}</div>}
    </div>
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

// ─────────────────────────────────────────────
// LOGO UPLOADER — drag & drop, بتصميم احترافي
// ─────────────────────────────────────────────
function LogoUploader({ value, onChange }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError]         = useState("");
  const [dragOver, setDragOver]   = useState(false);
  const inputRef = useRef(null);

  const upload = async (file) => {
    setError("");
    if (!file || !file.type.startsWith("image/")) { setError("الملف ليس صورة ❌"); return; }
    if (file.size > 5 * 1024 * 1024) { setError("الحجم يتجاوز 5MB ❌"); return; }
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", "saas_edge");
      const res  = await fetch("https://api.cloudinary.com/v1_1/dbcbkly4w/image/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (data.secure_url) onChange(data.secure_url);
      else setError("فشل رفع الصورة ❌");
    } catch {
      setError("فشل رفع الصورة، حاول مجدداً ❌");
    } finally {
      setUploading(false);
    }
  };

  const onFileSelected = (e) => {
    const f = e.target.files?.[0];
    if (f) upload(f);
    e.target.value = "";
  };

  const dragHandlers = {
    onDragOver:  e => { e.preventDefault(); setDragOver(true); },
    onDragLeave: () => setDragOver(false),
    onDrop: e => {
      e.preventDefault(); setDragOver(false);
      const f = e.dataTransfer.files?.[0];
      if (f) upload(f);
    },
  };

  const UploadIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/>
    </svg>
  );

  return (
    <div className="pb-logo-upload">
      <input ref={inputRef} type="file" accept="image/*" hidden disabled={uploading} onChange={onFileSelected} />

      {value ? (
        <div className="pb-logo-upload__preview" {...dragHandlers}>
          <div className="pb-logo-upload__thumb"><img src={value} alt="logo" /></div>
          <div className="pb-logo-upload__meta">
            <div className="pb-logo-upload__filename">اللوجو الحالي</div>
            <div className="pb-logo-upload__status">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              محفوظ
            </div>
          </div>
          <div className="pb-logo-upload__actions">
            <button type="button" className="pb-logo-upload__btn" title="تغيير الصورة" onClick={() => inputRef.current?.click()}>
              <UploadIcon />
            </button>
            <button type="button" className="pb-logo-upload__btn pb-logo-upload__btn--danger" title="حذف" onClick={() => onChange("")}>
              <Icon name="trash" size={14} />
            </button>
          </div>
          {uploading && (
            <div className="pb-logo-upload__loading">
              <div className="pb-logo-upload__spinner" />
              جاري الرفع...
            </div>
          )}
        </div>
      ) : (
        <div
          className={`pb-logo-upload__dropzone ${dragOver ? "pb-logo-upload__dropzone--drag" : ""}`}
          onClick={() => !uploading && inputRef.current?.click()}
          {...dragHandlers}
        >
          <div className="pb-logo-upload__icon"><UploadIcon /></div>
          <div className="pb-logo-upload__title">اسحب صورة هنا أو اضغط للرفع</div>
          <div className="pb-logo-upload__hint">PNG, JPG أو SVG — حتى 5MB</div>
          {uploading && (
            <div className="pb-logo-upload__loading">
              <div className="pb-logo-upload__spinner" />
              جاري الرفع...
            </div>
          )}
        </div>
      )}
      {error && <div className="pb-logo-upload__error">{error}</div>}
    </div>
  );
}

function HeaderSettings({ settings, onChange, store, onLogoChange, onNameChange, onNamePreview }) {
  const s = (k, v) => onChange({ ...settings, [k]: v });

  // ✦ حالة محلية لحقل اسم المتجر (تعديل مباشر + حفظ بعد توقف الكتابة)
  const [nameValue, setNameValue] = useState(store?.name || "");
  const nameTimer = useRef(null);

  useEffect(() => {
    setNameValue(store?.name || "");
  }, [store?.name]);

  const handleNameInput = (v) => {
    setNameValue(v);
    onNamePreview?.(v); // ✦ تحديث فوري في الـ preview (بدون طلب API)
    if (nameTimer.current) clearTimeout(nameTimer.current);
    nameTimer.current = setTimeout(() => {
      const trimmed = v.trim();
      if (trimmed && trimmed !== store?.name) onNameChange?.(trimmed);
    }, 700);
  };

  const commitName = () => {
    if (nameTimer.current) clearTimeout(nameTimer.current);
    const trimmed = nameValue.trim();
    if (trimmed && trimmed !== store?.name) onNameChange?.(trimmed);
    else if (!trimmed) setNameValue(store?.name || "");
  };

  // ✦ روابط التنقّل (Navigation) — قائمة قابلة للإضافة/التعديل/الحذف
  // للمتاجر القديمة اللي ماعندهاش settings.links بعد، نعرض نفس الروابط الافتراضية بدل قائمة فارغة
  const DEFAULT_HEADER_LINKS = [
    { id: "l1", title: "الصفحة الرئيسية", url: "/" },
    { id: "l2", title: "التصنيفات", url: "/collections" },
    { id: "l3", title: "اتصل بنا", url: "#" },
  ];
  const navLinks = settings.links !== undefined ? settings.links : DEFAULT_HEADER_LINKS;
  const updateLink = (id, patch) => s("links", navLinks.map(l => l.id === id ? { ...l, ...patch } : l));
  const deleteLink = (id) => s("links", navLinks.filter(l => l.id !== id));
  const addLink = () => s("links", [...navLinks, { id: `l_${Date.now()}`, title: "New link", url: "#" }]);

  return (
    <>
      <div className="pb-group">
        <div className="pb-group__label">Branding</div>
        <div className="pb-field">
          <div className="pb-label">Store name</div>
          <input
            className="pb-input"
            value={nameValue}
            onChange={e => handleNameInput(e.target.value)}
            onBlur={commitName}
            onKeyDown={e => { if (e.key === "Enter") e.currentTarget.blur(); }}
            placeholder="اسم المتجر"
          />
        </div>
        <div className="pb-field">
          <div className="pb-label">Logo image</div>
          <LogoUploader value={store?.logo || ""} onChange={onLogoChange} />
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
      <div className="pb-group">
        <div className="pb-group__label">Navigation</div>
        {navLinks.map((link, i) => (
          <div key={link.id} className="pb-link-card">
            <div className="pb-link-card__header">
              <span>Link {i + 1}</span>
              <button type="button" className="pb-link-card__delete" title="حذف" onClick={() => deleteLink(link.id)}>
                <Icon name="trash" size={14} />
              </button>
            </div>
            <div className="pb-link-card__body">
              <div className="pb-field">
                <div className="pb-label">Title</div>
                <input className="pb-input" value={link.title} onChange={e => updateLink(link.id, { title: e.target.value })} placeholder="مثال: اتصل بنا" />
              </div>
              <div className="pb-field">
                <div className="pb-label">Link</div>
                <input className="pb-input" value={link.url} onChange={e => updateLink(link.id, { url: e.target.value })} placeholder="/contact أو https://..." />
              </div>
            </div>
          </div>
        ))}
        <button type="button" className="pb-add-link-btn" onClick={addLink}>
          <span style={{ fontSize: 16, lineHeight: 1 }}>+</span> Add link
        </button>
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
          <div className="pb-label">Subtitle</div>
          <input className="pb-input" value={settings.subtitle ?? "اعثر على كل ما تريد"} onChange={e => s("subtitle", e.target.value)} />
        </div>
        <div className="pb-field">
          <div className="pb-label">Title alignment</div>
          <div className="pb-segment">
            {[{v:"right",i:"alignRight"},{v:"center",i:"alignCenter"},{v:"left",i:"alignLeft"}].map(o => (
              <button key={o.v}
                className={`pb-seg-btn ${(settings.titleAlign || "right") === o.v ? "pb-seg-btn--active" : ""}`}
                onClick={() => s("titleAlign", o.v)}>
                <Icon name={o.i} size={15} />
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="pb-group">
        <div className="pb-group__label">Layout</div>
        <div className="pb-field">
          <div className="pb-label">Display style</div>
          <div className="pb-segment">
            <button
              className={`pb-seg-btn ${(settings.displayStyle || "grid") === "row" ? "pb-seg-btn--active" : ""}`}
              onClick={() => s("displayStyle", "row")}>
              <span style={{ display:"flex", alignItems:"center", gap:6 }}>
                <Icon name="rowLayout" size={13} /> Row
              </span>
            </button>
            <button
              className={`pb-seg-btn ${(settings.displayStyle || "grid") === "grid" ? "pb-seg-btn--active" : ""}`}
              onClick={() => s("displayStyle", "grid")}>
              <span style={{ display:"flex", alignItems:"center", gap:6 }}>
                <Icon name="categories" size={13} /> Grid
              </span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

function FooterSettings({ settings, onChange }) {
  const s = (k, v) => onChange({ ...settings, [k]: v });
  const setSocial = (platform, url) => onChange({ ...settings, socials: { ...(settings.socials || {}), [platform]: url } });
  const socials = settings.socials || {};

  const SOCIAL_FIELDS = [
    { key: "facebook",  label: "Facebook",    placeholder: "https://facebook.com/yourpage" },
    { key: "instagram", label: "Instagram",   placeholder: "https://instagram.com/yourpage" },
    { key: "youtube",   label: "YouTube",     placeholder: "https://youtube.com/@yourchannel" },
    { key: "tiktok",    label: "TikTok",      placeholder: "https://tiktok.com/@yourpage" },
    { key: "twitter",   label: "X (Twitter)", placeholder: "https://x.com/yourpage" },
    { key: "whatsapp",  label: "WhatsApp number", placeholder: "213XXXXXXXXX" },
  ];

  return (
    <>
      <div className="pb-group">
        <div className="pb-group__label">Content</div>
        <div className="pb-field">
          <div className="pb-label">Copyright text <span>اختياري</span></div>
          <input className="pb-input" value={settings.copyright} onChange={e => s("copyright", e.target.value)} />
        </div>
        <div className="pb-toggle-row">
          <span className="pb-toggle-row__label">Show newsletter box</span>
          <Toggle checked={settings.showNewsletter} onChange={v => s("showNewsletter", v)} />
        </div>
        <div className="pb-field">
          <div className="pb-label">Terms link text <span>خوي الخانة باش تخفي الرابط</span></div>
          <input className="pb-input" value={settings.termsText || ""} onChange={e => s("termsText", e.target.value)} />
        </div>
      </div>

      <div className="pb-group">
        <div className="pb-group__label">Social links</div>
        <div className="pb-toggle-row">
          <span className="pb-toggle-row__label">Show social links</span>
          <Toggle checked={settings.showSocials !== false} onChange={v => s("showSocials", v)} />
        </div>
        {settings.showSocials !== false && (
          <>
            <div style={{ fontSize: 11.5, color: "#94a3b8", margin: "2px 0 10px" }}>اترك الحقل فارغ باش تخفي الأيقونة</div>
            {SOCIAL_FIELDS.map(f => (
              <div className="pb-field" key={f.key}>
                <div className="pb-label">{f.label}</div>
                <input className="pb-input" value={socials[f.key] || ""} onChange={e => setSocial(f.key, e.target.value)}
                  placeholder={f.placeholder} />
              </div>
            ))}
          </>
        )}
      </div>
    </>
  );
}

// ─────────────────────────────────────────────
// PRODUCT PAGE SETTINGS PANELS
// ─────────────────────────────────────────────
function GallerySettings({ settings, onChange, isMobile }) {
  const s = (k, v) => onChange({ ...settings, [k]: v });
  return (
    <>
      <Collapse title="Display mode">
        <div className="pb-toggle-row">
          <span className="pb-toggle-row__label">Carousel mode</span>
          <Toggle checked={!!settings.carouselMode} onChange={v => s("carouselMode", v)} />
        </div>
        {!settings.carouselMode && !isMobile && (
          <div className="pb-field">
            <div className="pb-label">Layout</div>
            <div className="pb-segment">
              {[{ v: "stacked", l: "Stacked" }, { v: "bottom-rail", l: "Bottom rail" }].map(o => (
                <button key={o.v}
                  className={`pb-seg-btn ${(settings.layout || "stacked") === o.v ? "pb-seg-btn--active" : ""}`}
                  onClick={() => s("layout", o.v)}>{o.l}</button>
              ))}
            </div>
          </div>
        )}
      </Collapse>

      <Collapse title="Image options">
        <div className="pb-field">
          <div className="pb-label">Image ratio</div>
          <div className="pb-segment">
            {[{ v: "1:1", l: "1:1" }, { v: "3:4", l: "3:4" }, { v: "4:3", l: "4:3" }, { v: "adapt", l: "Adapt" }].map(o => (
              <button key={o.v}
                className={`pb-seg-btn ${(settings.imageRatio || "1:1") === o.v ? "pb-seg-btn--active" : ""}`}
                onClick={() => s("imageRatio", o.v)}>{o.l}</button>
            ))}
          </div>
        </div>
        <div className="pb-toggle-row">
          <span className="pb-toggle-row__label">Enable zoom</span>
          <Toggle checked={!!settings.enableZoom} onChange={v => s("enableZoom", v)} />
        </div>
      </Collapse>

      <Collapse title="Navigation">
        <div className="pb-toggle-row">
          <span className="pb-toggle-row__label">Show arrows</span>
          <Toggle checked={settings.showArrows !== false} onChange={v => s("showArrows", v)} />
        </div>
        {settings.carouselMode && (
          <>
            <div className="pb-toggle-row">
              <span className="pb-toggle-row__label">Show thumbnails</span>
              <Toggle checked={settings.showThumbnails !== false} onChange={v => s("showThumbnails", v)} />
            </div>
            {settings.showThumbnails !== false && (
              <div className="pb-field">
                <div className="pb-label" style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>Thumbnails shown</span><span>{settings.thumbnailsShown || 4}</span>
                </div>
                <input type="range" className="pb-range" min={2} max={6} step={1}
                  value={settings.thumbnailsShown || 4}
                  onChange={e => s("thumbnailsShown", Number(e.target.value))} />
              </div>
            )}
          </>
        )}
      </Collapse>
    </>
  );
}

function ProductInfoSettings({ settings, onChange }) {
  const s = (k, v) => onChange({ ...settings, [k]: v });
  return (
    <>
      <Collapse title="Checkout options">
        <div className="pb-field">
          <div className="pb-label">CTA button text</div>
          <input className="pb-input" value={settings.ctaButtonText} onChange={e => s("ctaButtonText", e.target.value)} />
        </div>
        <div className="pb-toggle-row">
          <span className="pb-toggle-row__label">Show quantity selector</span>
          <Toggle checked={settings.showQuantitySelector !== false} onChange={v => s("showQuantitySelector", v)} />
        </div>
        <div className="pb-toggle-row">
          <span className="pb-toggle-row__label">Show Add to Cart button</span>
          <Toggle checked={settings.showAddToCartButton !== false} onChange={v => s("showAddToCartButton", v)} />
        </div>
      </Collapse>

      <Collapse title="Badges & notes">
        <div className="pb-field">
          <div className="pb-label">Badge text <span>اتركه فارغ باش تخفيه</span></div>
          <input className="pb-input" value={settings.badgeText || ""} onChange={e => s("badgeText", e.target.value)} />
        </div>
        <div className="pb-toggle-row">
          <span className="pb-toggle-row__label">Show delivery note</span>
          <Toggle checked={settings.showDeliveryNote !== false} onChange={v => s("showDeliveryNote", v)} />
        </div>
        {settings.showDeliveryNote !== false && (
          <div className="pb-field">
            <div className="pb-label">Delivery note</div>
            <input className="pb-input" value={settings.deliveryNote || ""} onChange={e => s("deliveryNote", e.target.value)} />
          </div>
        )}
      </Collapse>
    </>
  );
}

// ✦ حقول الفورم القابلة للتحكم — key يطابق fields object فالـ settings
const CHECKOUT_FIELD_LABELS = [
  { key: "fullName",     label: "Full name" },
  { key: "phone",        label: "Phone number" },
  { key: "province",     label: "Province (Wilaya)" },
  { key: "municipality", label: "Municipality (Commune)" },
];

function CheckoutSettings({ settings, onChange }) {
  const s = (k, v) => onChange({ ...settings, [k]: v });
  const fields = settings.fields || {};
  const setField = (key, k, v) => onChange({
    ...settings,
    fields: { ...fields, [key]: { ...(fields[key] || { enabled: true, required: true }), [k]: v } },
  });

  return (
    <>
      <Collapse title="General">
        <div className="pb-field">
          <div className="pb-label">Section title</div>
          <input className="pb-input" value={settings.sectionTitle || ""} onChange={e => s("sectionTitle", e.target.value)} />
        </div>
        <div className="pb-field">
          <div className="pb-label">Title alignment</div>
          <div className="pb-segment">
            {[{ v: "right", i: "alignRight" }, { v: "center", i: "alignCenter" }, { v: "left", i: "alignLeft" }].map(o => (
              <button key={o.v}
                className={`pb-seg-btn ${(settings.titleAlign || "right") === o.v ? "pb-seg-btn--active" : ""}`}
                onClick={() => s("titleAlign", o.v)}>
                <Icon name={o.i} size={15} />
              </button>
            ))}
          </div>
        </div>
        <div className="pb-field">
          <div className="pb-label">Submit button text</div>
          <input className="pb-input" value={settings.submitButtonText || ""} onChange={e => s("submitButtonText", e.target.value)} />
        </div>
      </Collapse>

      <Collapse title="Form fields">
        {CHECKOUT_FIELD_LABELS.map(f => {
          const fv = fields[f.key] || { enabled: true, required: true };
          return (
            <div key={f.key} className="pb-field-card">
              <div className="pb-field-card__title">{f.label}</div>
              <div className="pb-toggle-row">
                <span className="pb-toggle-row__label">Required</span>
                <Toggle checked={fv.required !== false} onChange={v => setField(f.key, "required", v)} />
              </div>
              <div className="pb-toggle-row">
                <span className="pb-toggle-row__label">Enabled</span>
                <Toggle checked={fv.enabled !== false} onChange={v => setField(f.key, "enabled", v)} />
              </div>
            </div>
          );
        })}
      </Collapse>

      <Collapse title="Form style" defaultOpen={false}>
        <div className="pb-field">
          <div className="pb-label">Form style</div>
          <select className="pb-input" value={settings.formStyle || "default"} onChange={e => s("formStyle", e.target.value)}>
            <option value="default">Default</option>
            <option value="compact">Compact</option>
          </select>
        </div>
        <div className="pb-field">
          <div className="pb-label">Button animation</div>
          <select className="pb-input" value={settings.buttonAnimation || "none"} onChange={e => s("buttonAnimation", e.target.value)}>
            <option value="none">None</option>
            <option value="pulse">Pulse</option>
          </select>
        </div>
      </Collapse>

      <Collapse title="Field options" defaultOpen={false}>
        <div className="pb-toggle-row">
          <span className="pb-toggle-row__label">Show field icons</span>
          <Toggle checked={settings.showFieldIcons !== false} onChange={v => s("showFieldIcons", v)} />
        </div>
        <div className="pb-toggle-row">
          <span className="pb-toggle-row__label">Show address field</span>
          <Toggle checked={!!settings.showAddressField} onChange={v => s("showAddressField", v)} />
        </div>
        <div className="pb-toggle-row">
          <span className="pb-toggle-row__label">Show note field</span>
          <Toggle checked={!!settings.showNoteField} onChange={v => s("showNoteField", v)} />
        </div>
      </Collapse>

      <Collapse title="Sticky button" defaultOpen={false}>
        <div className="pb-toggle-row">
          <span className="pb-toggle-row__label">Sticky order button</span>
          <Toggle checked={settings.stickyButton !== false} onChange={v => s("stickyButton", v)} />
        </div>
        {settings.stickyButton !== false && (
          <div className="pb-field">
            <div className="pb-label">Sticky button text</div>
            <input className="pb-input" value={settings.stickyButtonText || ""} onChange={e => s("stickyButtonText", e.target.value)} />
          </div>
        )}
      </Collapse>
    </>
  );
}

function CategoryBannerSettings({ settings, onChange }) {
  const s = (k, v) => onChange({ ...settings, [k]: v });
  return (
    <>
      <div className="pb-group">
        <div className="pb-group__label">Banner style</div>
        <div className="pb-field">
          <div className="pb-label">Style</div>
          <div className="pb-segment">
            {[{ v: "overlay", l: "Overlay" }, { v: "compact", l: "Compact" }].map(o => (
              <button key={o.v}
                className={`pb-seg-btn ${(settings.style || "overlay") === o.v ? "pb-seg-btn--active" : ""}`}
                onClick={() => s("style", o.v)}>{o.l}</button>
            ))}
          </div>
        </div>
        <div className="pb-toggle-row">
          <span className="pb-toggle-row__label">Show product count</span>
          <Toggle checked={settings.showProductCount !== false} onChange={v => s("showProductCount", v)} />
        </div>
      </div>
    </>
  );
}

function SuccessMessageSettings({ settings, onChange }) {
  const s = (k, v) => onChange({ ...settings, [k]: v });
  return (
    <>
      <Collapse title="Message">
        <div className="pb-field">
          <div className="pb-label">Headline</div>
          <input className="pb-input" value={settings.headline || ""} onChange={e => s("headline", e.target.value)} />
        </div>
        <div className="pb-field">
          <div className="pb-label">Subtext</div>
          <input className="pb-input" value={settings.subtext || ""} onChange={e => s("subtext", e.target.value)} />
        </div>
      </Collapse>

      <Collapse title="Order details">
        <div className="pb-toggle-row">
          <span className="pb-toggle-row__label">Show order number</span>
          <Toggle checked={settings.showOrderNumber !== false} onChange={v => s("showOrderNumber", v)} />
        </div>
        <div className="pb-toggle-row">
          <span className="pb-toggle-row__label">Show order summary card</span>
          <Toggle checked={settings.showOrderSummary !== false} onChange={v => s("showOrderSummary", v)} />
        </div>
        <div className="pb-toggle-row">
          <span className="pb-toggle-row__label">Show delivery timeline</span>
          <Toggle checked={settings.showTimeline !== false} onChange={v => s("showTimeline", v)} />
        </div>
      </Collapse>

      <Collapse title="Call to action">
        <div className="pb-field">
          <div className="pb-label">Button text</div>
          <input className="pb-input" value={settings.ctaButtonText || ""} onChange={e => s("ctaButtonText", e.target.value)} />
        </div>
        <div className="pb-field">
          <div className="pb-label">Button link</div>
          <input className="pb-input" value={settings.ctaButtonLink || ""} onChange={e => s("ctaButtonLink", e.target.value)} placeholder="/" />
        </div>
        <div className="pb-toggle-row">
          <span className="pb-toggle-row__label">Show secondary button (WhatsApp)</span>
          <Toggle checked={settings.showSecondaryButton !== false} onChange={v => s("showSecondaryButton", v)} />
        </div>
        {settings.showSecondaryButton !== false && (
          <>
            <div className="pb-field">
              <div className="pb-label">Secondary button text</div>
              <input className="pb-input" value={settings.secondaryButtonText || ""} onChange={e => s("secondaryButtonText", e.target.value)} />
            </div>
            <div className="pb-field">
              <div className="pb-label">WhatsApp number <span>مثال: 213550123456</span></div>
              <input className="pb-input" value={settings.whatsappNumber || ""} onChange={e => s("whatsappNumber", e.target.value)} placeholder="213550123456" />
            </div>
          </>
        )}
      </Collapse>

      <Collapse title="Appearance" defaultOpen={false}>
        <div className="pb-field">
          <div className="pb-label">Background style</div>
          <div className="pb-segment">
            {[{ v: "plain", l: "Plain" }, { v: "tinted", l: "Tinted" }].map(o => (
              <button key={o.v}
                className={`pb-seg-btn ${(settings.backgroundStyle || "tinted") === o.v ? "pb-seg-btn--active" : ""}`}
                onClick={() => s("backgroundStyle", o.v)}>{o.l}</button>
            ))}
          </div>
        </div>
      </Collapse>
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
function SectionSettingsPanel({ section, store, onUpdate, onClose, onLogoChange, onNameChange, onNamePreview, collapsed, isMobile }) {
  const updateSettings = (newSettings) => onUpdate(section.id, newSettings);

  const inner = () => {
    switch (section.type) {
      case "announcement": return <AnnouncementSettings settings={section.settings} onChange={updateSettings} />;
      case "header":       return <HeaderSettings       settings={section.settings} onChange={updateSettings} store={store} onLogoChange={onLogoChange} onNameChange={onNameChange} onNamePreview={onNamePreview} />;
      case "hero":         return <HeroSettings         settings={section.settings} onChange={updateSettings} />;
      case "trust":        return <TrustSettings        settings={section.settings} onChange={updateSettings} />;
      case "collection":   return <CollectionSettings   settings={section.settings} onChange={updateSettings} />;
      case "categories":   return <CategoriesSettings   settings={section.settings} onChange={updateSettings} />;
      case "footer":       return <FooterSettings       settings={section.settings} onChange={updateSettings} />;
      case "gallery":      return <GallerySettings      settings={section.settings} onChange={updateSettings} isMobile={isMobile} />;
      case "productInfo":  return <ProductInfoSettings  settings={section.settings} onChange={updateSettings} />;
      case "checkout":     return <CheckoutSettings     settings={section.settings} onChange={updateSettings} />;
      case "categoryBanner": return <CategoryBannerSettings settings={section.settings} onChange={updateSettings} />;
      case "successMessage": return <SuccessMessageSettings settings={section.settings} onChange={updateSettings} />;
      default: return <p style={{ color: "#9ca3af", fontSize: ".82rem" }}>لا توجد إعدادات</p>;
    }
  };

  const meta = getSectionMeta(section.type);

  return (
    <div className="pb-right" style={{ width: collapsed ? 0 : 340 }}>
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
function PreviewFrame({ slug, isMobile, themeConfig, activeSection, page = "home", productId, categoryId, storePatch }) {
  const iframeRef  = useRef(null);
  const loadedRef  = useRef(false);
  const pendingRef = useRef(null);
  const pendingStoreRef = useRef(null);
  const phoneRef   = useRef(null);
  const desktopWrapRef = useRef(null);
  const MOBILE_W  = 393;  // ✦ عرض مرجعي "موبايل" — نفس عرض iPhone القياسي، يضمن أن breakpoint الموبايل (768px) يتفعّل صحيح
  const DESKTOP_W = 1280; // ✦ عرض مرجعي "حاسوب" — يضمن أن الـ iframe ما يهبطش تحت breakpoint الموبايل (768px) حتى ملي اللوحات مفتوحة وكيضيق المكان

  // ✦ نفس مبدأ الـ Desktop — نفرض عرض 393px حقيقي جوا الـ iframe ونصغّرو/نكبّرو بصريا (transform: scale) باش يبقى الـ layout ديال الموبايل صحيح بغض النظر عن حجم الإطار
  useEffect(() => {
    if (!isMobile) return;
    const calcScale = () => {
      if (!phoneRef.current || !iframeRef.current) return;
      const wrapW = phoneRef.current.clientWidth;
      const wrapH = phoneRef.current.clientHeight;
      const scale = wrapW / MOBILE_W;
      iframeRef.current.style.transform = `scale(${scale})`;
      iframeRef.current.style.width  = `${MOBILE_W}px`;
      iframeRef.current.style.height = `${scale > 0 ? wrapH / scale : wrapH}px`;
    };
    calcScale();
    const ro = new ResizeObserver(calcScale);
    if (phoneRef.current) ro.observe(phoneRef.current);
    return () => ro.disconnect();
  }, [isMobile]);

  // ✦ نفس المبدأ للنسخة Desktop — نفرض عرض 1280px حقيقي جوا الـ iframe ونصغّرو بصريا (transform: scale) باش يبقى الـ layout ديال الحاسوب صحيح (2 أعمدة، sticky، إلخ) بغض النظر عن ضيق اللوحة
  useEffect(() => {
    if (isMobile) return;
    const calcScale = () => {
      if (!desktopWrapRef.current || !iframeRef.current) return;
      const wrapW = desktopWrapRef.current.clientWidth;
      const wrapH = desktopWrapRef.current.clientHeight;
      const scale = Math.min(1, wrapW / DESKTOP_W);
      iframeRef.current.style.transform = `scale(${scale})`;
      iframeRef.current.style.width  = `${DESKTOP_W}px`;
      iframeRef.current.style.height = `${scale > 0 ? wrapH / scale : wrapH}px`;
    };
    calcScale();
    const ro = new ResizeObserver(calcScale);
    if (desktopWrapRef.current) ro.observe(desktopWrapRef.current);
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

  // ✦ إرسال تحديث فوري لبيانات المتجر (اسم/لوجو) للـ preview iframe
  const sendStorePatch = (patch) => {
    try {
      iframeRef.current?.contentWindow?.postMessage(
        { type: "STORE_UPDATE", store: patch },
        "*"
      );
    } catch (_) {}
  };

  // ✦ عند تغيير storePatch (اسم/لوجو المتجر) — أرسل مباشرة إذا الـ iframe محمّل، وإلا احفظه كـ pending
  useEffect(() => {
    if (!storePatch) return;
    if (loadedRef.current) {
      sendStorePatch(storePatch);
    } else {
      pendingStoreRef.current = storePatch;
    }
  }, [storePatch]);

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
    // أرسل أي تحديث متجر كان معلّق
    const sp = pendingStoreRef.current || storePatch;
    if (sp) sendStorePatch(sp);
  };

  if (!slug) return (
    <div style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", color:"#9ca3af", flexDirection:"column", gap:12 }}>
      <div style={{ fontSize:"2rem" }}>🏪</div>
      <div style={{ fontSize:".85rem" }}>لا يوجد متجر مرتبط</div>
    </div>
  );

  // ✦ صفحة Product محتاجة منتج حقيقي باش نعاينوه
  if (page === "product" && !productId) return (
    <div style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", color:"#9ca3af", flexDirection:"column", gap:12 }}>
      <div style={{ fontSize:"2rem" }}>📦</div>
      <div style={{ fontSize:".85rem" }}>زيد منتج واحد على الأقل باش تعاين هاذي الصفحة</div>
    </div>
  );

  // ✦ صفحة Category محتاجة تصنيف حقيقي باش نعاينوها
  if (page === "category" && !categoryId) return (
    <div style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", color:"#9ca3af", flexDirection:"column", gap:12 }}>
      <div style={{ fontSize:"2rem" }}>🗂️</div>
      <div style={{ fontSize:".85rem" }}>زيد تصنيف واحد على الأقل باش تعاين هاذي الصفحة</div>
    </div>
  );

  const src = page === "product"
    ? `/store/${slug}/product/${productId}?preview=1`
    : page === "category"
    ? `/store/${slug}/collections/${categoryId}?preview=1`
    : page === "success"
    ? `/store/${slug}/order-success?preview=1`
    : `/store/${slug}?preview=1`;

  if (isMobile) return (
    <div className="pb-preview-mobile">
      <div className="pb-chrome-bar">
        <div className="pb-chrome-dot" style={{ background: "#ff5f56" }} />
        <div className="pb-chrome-dot" style={{ background: "#ffbd2e" }} />
        <div className="pb-chrome-dot" style={{ background: "#27c93f" }} />
        <div className="pb-chrome-url">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          {window.location.host}/store/{slug}
        </div>
      </div>
      <div className="pb-preview-mobile-wrap" ref={phoneRef}>
        <iframe
          ref={iframeRef}
          src={src}
          onLoad={handleLoad}
          className="pb-preview-mobile-iframe"
          title="Mobile Preview"
        />
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
      <div className="pb-preview-desktop-wrap" ref={desktopWrapRef}>
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
  const [collapsedLeft,  setCollapsedLeft]  = useState(false);
  const [collapsedRight, setCollapsedRight] = useState(false);
  const [showAddMenu,    setShowAddMenu]    = useState(false);
  const [previewProductId, setPreviewProductId] = useState(null); // ✦ أول منتج فالمتجر — نستعملوه لمعاينة صفحة Product
  const [previewCategoryId, setPreviewCategoryId] = useState(null); // ✦ أول تصنيف فالمتجر — نستعملوه لمعاينة صفحة Category
  const PANEL_W = 340; // نفس عرض الأعمدة كيف كيف (يسار ويمين)

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
          let cfg = (d.store.themeConfig && d.store.themeConfig.sections) ? d.store.themeConfig : DEFAULT_CONFIG;

          // نفرض الـ 5 badges الثابتة (نحافظ فقط على enabled/title/sub لو كانت موجودة بنفس id)
          const FIXED_BADGES = DEFAULT_CONFIG.sections.find(s => s.type === "trust")?.settings?.badges || [];

          cfg = {
            ...cfg,
            sections: cfg.sections.map(sec => {
              if (sec.type === "trust") {
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
              }
              if (sec.type === "footer") {
                // ✦ copyright وtermsText نصوص حقيقية مكتوبة (ماشي placeholder فارغ) — كي ما يكونوش محفوظين نحطو نص افتراضي حقيقي
                const defaultCopyright = `© ${new Date().getFullYear()} ${d.store.name || "اسم متجرك"}`;
                return {
                  ...sec,
                  settings: {
                    ...sec.settings,
                    copyright: sec.settings?.copyright || defaultCopyright,
                    termsText: sec.settings?.termsText || "الشروط والسياسات",
                    showSocials: sec.settings?.showSocials !== false, // ديفولت مفعّل
                    socials: { facebook: "", instagram: "", youtube: "", tiktok: "", twitter: "", whatsapp: "", ...(sec.settings?.socials || {}) },
                  }
                };
              }
              return sec;
            })
          };

          // ✦ نطمّنو أن themeConfig.product فيه الـ 3 sections (gallery/productInfo/checkout) بكل الحقول
          const savedProductSections = d.store.themeConfig?.product?.sections || [];
          cfg.product = {
            sections: PRODUCT_DEFAULT_CONFIG.sections.map(defSec => {
              const saved = savedProductSections.find(s => s.type === defSec.type);
              if (!saved) return defSec;
              return {
                ...defSec,
                ...saved,
                settings: { ...defSec.settings, ...(saved.settings || {}), fields: { ...defSec.settings.fields, ...(saved.settings?.fields || {}) } },
              };
            }),
          };

          // ✦ نطمّنو أن themeConfig.category فيه section البانر بكل الحقول
          const savedCategorySections = d.store.themeConfig?.category?.sections || [];
          cfg.category = {
            sections: CATEGORY_DEFAULT_CONFIG.sections.map(defSec => {
              const saved = savedCategorySections.find(s => s.type === defSec.type);
              if (!saved) return defSec;
              return { ...defSec, ...saved, settings: { ...defSec.settings, ...(saved.settings || {}) } };
            }),
          };

          // ✦ نطمّنو أن themeConfig.success فيه section successMessage بكل الحقول
          const savedSuccessSections = d.store.themeConfig?.success?.sections || [];
          cfg.success = {
            sections: SUCCESS_DEFAULT_CONFIG.sections.map(defSec => {
              const saved = savedSuccessSections.find(s => s.type === defSec.type);
              if (!saved) return defSec;
              return { ...defSec, ...saved, settings: { ...defSec.settings, ...(saved.settings || {}) } };
            }),
          };

          setThemeConfig(cfg);

          // ✦ نجيبو أول منتج فالمتجر باش نعاينو بيه صفحة Product فالـ builder
          fetch(`${API()}/api/products/store/${d.store._id}`)
            .then(r => r.json())
            .then(list => { if (Array.isArray(list) && list.length) setPreviewProductId(list[0]._id); })
            .catch(() => {});

          // ✦ نجيبو أول تصنيف فالمتجر باش نعاينو بيه صفحة Category فالـ builder
          fetch(`${API()}/api/categories/public/${d.store._id}`)
            .then(r => r.json())
            .then(list => { if (Array.isArray(list) && list.length) setPreviewCategoryId(list[0]._id); })
            .catch(() => {});
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
      // نلقى الـ section اللي type ديالو يطابق — سواء فـ Home ولا Product ولا Category
      const matched = themeConfig?.sections?.find(s => s.type === sectionType)
        || themeConfig?.product?.sections?.find(s => s.type === sectionType)
        || themeConfig?.category?.sections?.find(s => s.type === sectionType)
        || themeConfig?.success?.sections?.find(s => s.type === sectionType);
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

  // ── Update product-page section settings (Gallery/Product Info/Checkout) ──
  const updateProductSectionSettings = useCallback((id, newSettings) => {
    setThemeConfig(prev => ({
      ...prev,
      product: {
        ...prev.product,
        sections: prev.product.sections.map(s =>
          s.id === id ? { ...s, settings: newSettings } : s
        ),
      },
    }));
    setIsDirty(true);
  }, []);

  // ── Update category-page section settings (Category Banner) ──
  const updateCategorySectionSettings = useCallback((id, newSettings) => {
    setThemeConfig(prev => ({
      ...prev,
      category: {
        ...prev.category,
        sections: prev.category.sections.map(s =>
          s.id === id ? { ...s, settings: newSettings } : s
        ),
      },
    }));
    setIsDirty(true);
  }, []);

  // ── Update success-page section settings (Success Message) ──
  const updateSuccessSectionSettings = useCallback((id, newSettings) => {
    setThemeConfig(prev => ({
      ...prev,
      success: {
        ...prev.success,
        sections: prev.success.sections.map(s =>
          s.id === id ? { ...s, settings: newSettings } : s
        ),
      },
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

  // ── Delete section (non-locked only) ─────────────────────
  const deleteSection = useCallback((id) => {
    setThemeConfig(prev => ({
      ...prev,
      sections: prev.sections.filter(s => s.id !== id),
    }));
    setActiveSection(prevActive => (prevActive === id ? null : prevActive));
    setIsDirty(true);
  }, []);

  // ── Add a section back (only types not already present) ──
  const addSection = useCallback((type) => {
    const template = DEFAULT_CONFIG.sections.find(s => s.type === type);
    if (!template) return;
    setThemeConfig(prev => ({
      ...prev,
      sections: [...prev.sections, { ...template, id: `${type}-${Date.now()}` }],
    }));
    setIsDirty(true);
    setShowAddMenu(false);
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

  // ── Preview فوري لاسم المتجر (بدون طلب API) ───────────────
  const previewName = useCallback((v) => {
    setStore(prev => (prev ? { ...prev, name: v } : prev));
  }, []);

  // ── Save Store Name ──────────────────────────────────────
  const saveName = async (newName) => {
    try {
      const res = await fetch(`${API()}/api/stores/update`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token()}`,
        },
        body: JSON.stringify({ name: newName, logo: store.logo }),
      });
      const data = await res.json();
      if (res.ok) {
        setStore(data.store);
        notify("تم حفظ اسم المتجر ✅");
      } else {
        notify(data.message || "فشل حفظ اسم المتجر ❌", "error");
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

  const activeSectionObj = themeConfig?.sections?.find(s => s.id === activeSection)
    || themeConfig?.product?.sections?.find(s => s.id === activeSection)
    || themeConfig?.category?.sections?.find(s => s.id === activeSection)
    || themeConfig?.success?.sections?.find(s => s.id === activeSection);
  const activeIsProductSection = !themeConfig?.sections?.some(s => s.id === activeSection)
    && !!themeConfig?.product?.sections?.some(s => s.id === activeSection);
  const activeIsCategorySection = !themeConfig?.sections?.some(s => s.id === activeSection)
    && !!themeConfig?.category?.sections?.some(s => s.id === activeSection);
  const activeIsSuccessSection = !themeConfig?.sections?.some(s => s.id === activeSection)
    && !!themeConfig?.success?.sections?.some(s => s.id === activeSection);

  // ✦ لائحة الـ sections المعروضة فالعمود الأيسر — تتبدل حسب الصفحة المختارة
  const displaySections = currentPage === "product"
    ? (() => {
        const home = themeConfig?.sections || [];
        const prod = themeConfig?.product?.sections || [];
        const pick = (arr, type) => arr.find(s => s.type === type);
        return [
          pick(home, "announcement"),
          pick(home, "header"),
          pick(prod, "gallery"),
          pick(prod, "productInfo"),
          pick(prod, "checkout"),
          pick(home, "footer"),
        ].filter(Boolean);
      })()
    : currentPage === "category"
    ? (() => {
        const home = themeConfig?.sections || [];
        const cat  = themeConfig?.category?.sections || [];
        const pick = (arr, type) => arr.find(s => s.type === type);
        return [
          pick(home, "announcement"),
          pick(home, "header"),
          pick(cat, "categoryBanner"),
          pick(cat, "collection"),
          pick(home, "footer"),
        ].filter(Boolean);
      })()
    : currentPage === "success"
    ? (() => {
        const home = themeConfig?.sections || [];
        const succ = themeConfig?.success?.sections || [];
        const pick = (arr, type) => arr.find(s => s.type === type);
        return [
          pick(home, "announcement"),
          pick(home, "header"),
          pick(succ, "successMessage"),
          pick(home, "footer"),
        ].filter(Boolean);
      })()
    : (themeConfig?.sections || []);

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
                    onClick={() => { setCurrentPage(p.id); setPageDropdown(false); setActiveSection(null); }}>
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
        <div className="pb-left" style={{ width: collapsedLeft ? 0 : PANEL_W }}>
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
                {displaySections.map((sec, idx) => {
                  const meta = getSectionMeta(sec.type);
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
                          {meta.locked ? (
                            <Icon name="lock" size={13} />
                          ) : (
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <circle cx="9" cy="7" r="1" fill="currentColor"/>
                              <circle cx="9" cy="12" r="1" fill="currentColor"/>
                              <circle cx="9" cy="17" r="1" fill="currentColor"/>
                              <circle cx="15" cy="7" r="1" fill="currentColor"/>
                              <circle cx="15" cy="12" r="1" fill="currentColor"/>
                              <circle cx="15" cy="17" r="1" fill="currentColor"/>
                            </svg>
                          )}
                        </span>
                        <span className="pb-section-item__icon" style={{ display:"flex", alignItems:"center", justifyContent:"center" }}>
                          <Icon name={meta.icon} size={15} />
                        </span>
                        <span className="pb-section-item__label">{meta.label}</span>
                        {!meta.locked && (
                          <span className="pb-section-item__actions">
                            <button
                              className="pb-section-item__action"
                              title={sec.enabled ? "إخفاء" : "إظهار"}
                              onClick={e => { e.stopPropagation(); toggleSection(sec.id, !sec.enabled); }}
                            >
                              <Icon name={sec.enabled ? "eye" : "eye-off"} size={14} />
                            </button>
                            <button
                              className="pb-section-item__action pb-section-item__action--danger"
                              title="حذف"
                              onClick={e => { e.stopPropagation(); deleteSection(sec.id); }}
                            >
                              <Icon name="trash" size={14} />
                            </button>
                          </span>
                        )}
                      </div>

                    </div>
                  );
                })}
              </div>
              {currentPage === "home" && (
              <div className="pb-add-section" style={{ position: "relative" }}>
                {showAddMenu && (
                  <div className="pb-add-menu">
                    {Object.entries(SECTION_META)
                      .filter(([type]) => !themeConfig?.sections?.some(s => s.type === type))
                      .map(([type, meta]) => (
                        <button key={type} className="pb-add-menu__item" onClick={() => addSection(type)}>
                          <Icon name={meta.icon} size={15} />
                          <span>{meta.label}</span>
                        </button>
                      ))}
                    {Object.keys(SECTION_META).every(type => themeConfig?.sections?.some(s => s.type === type)) && (
                      <div className="pb-add-menu__empty">كل الأقسام مضافة بالفعل</div>
                    )}
                  </div>
                )}
                <button className="pb-add-btn" onClick={() => setShowAddMenu(v => !v)}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                  </svg>
                  Add Section
                </button>
              </div>
              )}
            </>
          ) : (
            /* Styles panel inside left column */
            <StylesPanel
              styles={themeConfig?.styles || DEFAULT_CONFIG.styles}
              onChange={updateStyles}
            />
          )}
        </div>

        {/* ── Collapse toggle: Left panel ── */}
        <button
          className="pb-collapse-btn"
          style={{ left: collapsedLeft ? 8 : PANEL_W - 13 }}
          onClick={() => setCollapsedLeft(v => !v)}
          title={collapsedLeft ? "إظهار القائمة" : "إخفاء القائمة"}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            {collapsedLeft
              ? <polyline points="9 6 15 12 9 18" />
              : <polyline points="15 6 9 12 15 18" />}
          </svg>
        </button>

        {/* ── CENTER: Preview ── */}
        <div className="pb-center">
          <PreviewFrame
            slug={store.slug}
            isMobile={isMobile}
            themeConfig={themeConfig}
            activeSection={activeSection}
            page={currentPage}
            productId={previewProductId}
            categoryId={previewCategoryId}
            storePatch={{ name: store.name, logo: store.logo }}
          />
        </div>

        {/* ── Collapse toggle: Right panel ── */}
        <button
          className="pb-collapse-btn"
          style={{ right: collapsedRight ? 8 : PANEL_W - 13 }}
          onClick={() => setCollapsedRight(v => !v)}
          title={collapsedRight ? "إظهار الإعدادات" : "إخفاء الإعدادات"}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            {collapsedRight
              ? <polyline points="15 6 9 12 15 18" />
              : <polyline points="9 6 15 12 9 18" />}
          </svg>
        </button>

        {/* ── RIGHT: Section Settings ── */}
        {activeSectionObj ? (
          <SectionSettingsPanel
            section={activeSectionObj}
            store={store}
            onUpdate={
              activeIsProductSection ? updateProductSectionSettings
              : activeIsCategorySection ? updateCategorySectionSettings
              : activeIsSuccessSection ? updateSuccessSectionSettings
              : updateSectionSettings
            }
            onClose={() => setActiveSection(null)}
            onLogoChange={saveLogo}
            onNameChange={saveName}
            onNamePreview={previewName}
            collapsed={collapsedRight}
            isMobile={isMobile}
          />
        ) : (
          <div className="pb-right" style={{ width: collapsedRight ? 0 : PANEL_W }}>
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