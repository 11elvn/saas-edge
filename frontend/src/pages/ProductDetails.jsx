// ============================================================
// 📁 pages/ProductDetails.jsx — Product Page Builder (Tassyir-style)
// Sections: Announcement · Header · Gallery · Product Info · In-Page Checkout · Footer
// كل شي مربوط بـ themeConfig.product.sections (يتحرر من ThemeEdit → Product tab)
// ============================================================

import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { ALGERIAN_CITIES, getShippingPrice } from "../constants/algerianCities";
import StoreNavbar from "../components/StoreNavbar";
import StoreFooter from "../components/StoreFooter";
import CartDrawer from "../components/CartDrawer";
import { useCart } from "../context/CartContext";

const API = () => import.meta.env.VITE_API_URL;
const DEFAULT_IMG = "https://images.unsplash.com/photo-1531403009284-440f080d1e12?q=80&w=600";

// ── Google Font loader (نفس المنطق ديال PublicStore) ─────────
function loadFont(font) {
  const id = `font-${font}`;
  if (document.getElementById(id)) return;
  const link = document.createElement("link");
  link.id = id;
  link.rel = "stylesheet";
  link.href = `https://fonts.googleapis.com/css2?family=${font.replace(/ /g, "+")}:wght@400;500;600;700;800;900&display=swap`;
  document.head.appendChild(link);
}

// ── DEFAULTS — نفس القيم المبدئية ديال ThemeEdit (announcement/header/footer + styles) ──
const DEFAULT_HOME_SECTIONS = [
  { id: "announcement", type: "announcement", enabled: true, settings: { message: "توصيل لجميع ولايات الجزائر 🇩🇿 · الدفع عند الاستلام 💰", bgColor: "#111827", textColor: "#ffffff", animation: true, showClose: false } },
  { id: "header",       type: "header",       enabled: true, settings: { showSearch: true, showCart: true, sticky: true } },
  { id: "footer",       type: "footer",       enabled: true, settings: { copyright: "", showNewsletter: true, termsText: "الشروط والسياسات", showSocials: true, socials: {} } },
];
const DEFAULT_STYLES = {
  primaryColor: "#2563eb", secondaryColor: "#0f172a", backgroundColor: "#ffffff",
  surfaceColor: "#fafafa", textColor: "#111111", mutedTextColor: "#666666",
  borderColor: "#ebebeb", fontFamily: "Cairo", direction: "rtl",
};
// ── DEFAULTS — Gallery / Product Info / Checkout (نفس PRODUCT_DEFAULT_CONFIG فـ ThemeEdit) ──
const DEFAULT_PRODUCT_SECTIONS = [
  { id: "gallery", type: "gallery", enabled: true, settings: { carouselMode: false, layout: "stacked", imageRatio: "1:1", enableZoom: false, showArrows: true, showThumbnails: true, thumbnailsShown: 4 } },
  { id: "productInfo", type: "productInfo", enabled: true, settings: { ctaButtonText: "اطلب الآن", showQuantitySelector: true, showAddToCartButton: true, badgeText: "الأكثر مبيعاً", showDeliveryNote: true, deliveryNote: "توصيل خلال 3-5 أيام عمل لجميع ولايات الجزائر 🚚" } },
  { id: "checkout", type: "checkout", enabled: true, settings: {
      sectionTitle: "معلومات الطلب", titleAlign: "right", submitButtonText: "تأكيد الطلب",
      formStyle: "default", buttonAnimation: "none", showFieldIcons: true,
      showAddressField: false, showNoteField: false, stickyButton: true, stickyButtonText: "اطلب الآن",
      fields: { fullName: { enabled: true, required: true }, phone: { enabled: true, required: true }, province: { enabled: true, required: true }, municipality: { enabled: true, required: false } },
  } },
];

const sec = (arr, type) => (arr || []).find(s => s.type === type);

const PD_CSS = `
@keyframes pd-fade-up { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
@keyframes pd-spin     { to{transform:rotate(360deg)} }
@keyframes pd-marquee { from { transform:translateX(0); } to { transform:translateX(-50%); } }
@keyframes pd-pulse {
  0%   { box-shadow: 0 0 0 0 rgba(0,0,0,.35); }
  70%  { box-shadow: 0 0 0 12px rgba(0,0,0,0); }
  100% { box-shadow: 0 0 0 0 rgba(0,0,0,0); }
}
.pd-fade  { animation: pd-fade-up .45s ease both; }
.pd-d1    { animation-delay: .08s; }
.pd-d2    { animation-delay: .16s; }
.pd-spinner { animation: pd-spin .7s linear infinite; }
.pd-marquee-track { animation: pd-marquee 18s linear infinite; }
.pd-thumb {
  cursor:pointer; border-radius:10px; overflow:hidden;
  border:2px solid transparent; flex-shrink:0;
  transition: border-color .2s, transform .2s;
}
.pd-thumb:hover { transform:scale(1.05); }
.pd-thumb.active { border-color: var(--pd-primary); }
.pd-input {
  width:100%; padding:12px 14px; border-radius:12px;
  border:1px solid var(--pd-border, #e5e7eb); background:#f9fafb;
  color:#111; font-family:inherit; font-size:14px;
  outline:none; transition: border-color .2s, background .2s;
  text-align:right; box-sizing:border-box;
}
.pd-input--compact { padding:9px 12px; font-size:13px; border-radius:10px; }
.pd-input--icon { padding-right: 38px; }
.pd-input:focus { border-color: var(--pd-primary); background:#fff; }
.pd-input::placeholder { color:#aaa; }
.pd-field-wrap { position:relative; }
.pd-field-icon { position:absolute; top:50%; right:12px; transform:translateY(-50%); color:#9ca3af; pointer-events:none; display:flex; }
.pd-btn-order {
  position:relative; overflow:hidden;
  transition: transform .15s, box-shadow .15s, opacity .2s;
}
.pd-btn-order:not(:disabled):hover { transform:translateY(-2px); box-shadow: 0 8px 28px rgba(0,0,0,.5); }
.pd-btn-order:not(:disabled):active { transform:scale(.97); }
.pd-btn-order--pulse { animation: pd-pulse 1.8s ease-out infinite; }
.pd-qty-btn {
  width:34px; height:34px; border-radius:9px; border:1px solid #e5e7eb; background:#fff;
  display:flex; align-items:center; justify-content:center; cursor:pointer; color:#111;
  transition: background .15s;
}
.pd-qty-btn:hover { background:#f3f4f6; }
.pd-gallery-nav {
  position:absolute; top:50%; transform:translateY(-50%);
  width:36px; height:36px; border-radius:50%; border:none; cursor:pointer;
  background:rgba(255,255,255,.9); box-shadow:0 4px 14px rgba(0,0,0,.15);
  display:flex; align-items:center; justify-content:center; color:#111; z-index:2;
}
.pd-gallery-zoom { transition: transform .4s ease; }
.pd-gallery-zoom--enabled:hover { transform: scale(1.35); cursor: zoom-in; }
.pd-sticky-bar {
  position:fixed; bottom:0; left:0; right:0; z-index:500;
  padding:12px 16px calc(12px + env(safe-area-inset-bottom));
  background:#fff; border-top:1px solid #eee; box-shadow:0 -8px 24px rgba(0,0,0,.08);
}
`;

const PREVIEW_CSS = `
.pd-section-wrapper { position: relative; }
.pd-section-wrapper:hover::after { content: ""; position: absolute; inset: 0; border: 2px dashed rgba(124,109,242,.55); background: rgba(124,109,242,.05); pointer-events: none; z-index: 140; }
.pd-section-wrapper--highlighted::after { content: ""; position: absolute; inset: 0; border: 2px solid #7c6df2; background: rgba(124,109,242,.10); pointer-events: none; z-index: 140; }
.pd-section-label {
  position: absolute; top: 8px; left: 8px; z-index: 150;
  background: #7c6df2; color: #fff; font-size: 11px; font-weight: 700;
  padding: 3px 10px; border-radius: 6px; pointer-events: none;
  font-family: 'Inter', sans-serif; letter-spacing: .3px; white-space: nowrap;
  box-shadow: 0 2px 8px rgba(124,109,242,.35);
  opacity: 0; transition: opacity .12s ease;
}
.pd-section-wrapper:hover .pd-section-label,
.pd-section-wrapper--highlighted .pd-section-label { opacity: 1; }
`;

function injectCSS() {
  if (document.getElementById("pd-styles")) return;
  const s = document.createElement("style");
  s.id = "pd-styles";
  s.textContent = PD_CSS + PREVIEW_CSS;
  document.head.appendChild(s);
}

const SECTION_LABELS = {
  announcement: "Announcement Bar",
  header: "Header",
  gallery: "Gallery",
  productInfo: "Product Info",
  checkout: "In-Page Checkout",
  footer: "Footer",
};

// ── SectionWrapper — نفس منطق PublicStore: label + border + كليك يبعث للـ builder ──
function SectionWrapper({ type, isPreview, isHighlighted, children, style = {}, className = "" }) {
  if (!isPreview) return <div style={style} data-section={type} className={className || undefined}>{children}</div>;
  const handleClick = () => window.parent.postMessage({ type: "SECTION_CLICK", sectionType: type }, "*");
  return (
    <div
      style={{ position: "relative", ...style, cursor: "pointer" }}
      data-section={type}
      onClick={handleClick}
      className={`pd-section-wrapper${isHighlighted ? " pd-section-wrapper--highlighted" : ""}${className ? ` ${className}` : ""}`}
    >
      <div className="pd-section-label">{SECTION_LABELS[type] || type}</div>
      {children}
    </div>
  );
}

// ── أيقونات صغيرة ─────────────────────────────────────────
const IconCart = () => (
  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24">
    <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/>
  </svg>
);
const IconChevronL = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>;
const IconChevronR = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>;
const IconUser  = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/></svg>;
const IconPhone = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.8 19.8 0 01-8.63-3.07 19.5 19.5 0 01-6-6A19.8 19.8 0 012.12 4.2 2 2 0 014.11 2h3a2 2 0 012 1.72c.13.96.36 1.9.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0122 16.92z"/></svg>;
const IconPin   = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 6-9 12-9 12s-9-6-9-12a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>;
const IconBuilding = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="4" y="3" width="16" height="18" rx="1"/><line x1="9" y1="8" x2="9" y2="8.01"/><line x1="15" y1="8" x2="15" y2="8.01"/><line x1="9" y1="13" x2="9" y2="13.01"/><line x1="15" y1="13" x2="15" y2="13.01"/><line x1="10" y1="21" x2="10" y2="17" /><line x1="14" y1="21" x2="14" y2="17" /></svg>;
const IconHome  = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 11l9-8 9 8"/><path d="M5 10v10h14V10"/></svg>;
const IconNote  = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 3H6a2 2 0 00-2 2v14a2 2 0 002 2h12a2 2 0 002-2V9z"/><path d="M14 3v6h6"/></svg>;

const FIELD_ICONS = { fullName: <IconUser/>, phone: <IconPhone/>, province: <IconPin/>, municipality: <IconBuilding/>, address: <IconHome/>, note: <IconNote/> };

// ── GallerySlot — صورة حقيقية (فـ الموقع الحي)، أو placeholder رمادي مرقّم فـ preview الـ ThemeEdit ──
// ── FieldLabel — تسمية فوق كل حقل فـ In-Page Checkout (مع نجمة حمراء إذا إجباري) ──
function FieldLabel({ text, required, optionalLabel, color }) {
  return (
    <label style={{ display: "block", fontSize: 13, fontWeight: 700, color, marginBottom: 8 }}>
      {text}
      {required && <span style={{ color, marginInlineStart: 3 }}>*</span>}
      {optionalLabel && <span style={{ color: "#9ca3af", fontWeight: 600 }}> (اختياري)</span>}
    </label>
  );
}

function GallerySlot({ src, index, className = "", style = {} }) {
  if (src) {
    return (
      <img
        src={src} alt={`img-${index + 1}`}
        onError={e => { e.target.src = DEFAULT_IMG; }}
        className={className}
        style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", ...style }}
      />
    );
  }
  return (
    <div style={{
      width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center",
      background: "#e9eaee", color: "#a3a7b0", fontWeight: 800,
      fontSize: "clamp(22px,7vw,52px)", fontFamily: "'Inter', sans-serif",
    }}>
      {index + 1}
    </div>
  );
}

function ProductDetails() {
  const { slug, productId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const isPreview = new URLSearchParams(location.search).get("preview") === "1";

  const [product,      setProduct]      = useState(null);
  const [store,        setStore]        = useState(null);
  const [activeImg,    setActiveImg]    = useState(0);
  const [loading,      setLoading]      = useState(true);
  const [ordering,     setOrdering]     = useState(false);
  const [quantity,     setQuantity]     = useState(1);

  // ── السلة (Cart) ──────────────────────────────────────────
  const { addToCart, getCartCount } = useCart();
  const [cartOpen, setCartOpen] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  const [descExpanded, setDescExpanded] = useState(false);

  // ── حقول الفورم ──
  const [customerName, setCustomerName] = useState("");
  const [phone,        setPhone]        = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [municipality, setMunicipality] = useState("");
  const [address,      setAddress]      = useState("");
  const [note,         setNote]         = useState("");
  const [shippingPrice,setShippingPrice]= useState(0);

  // ── Live theme من الـ builder (postMessage) ──
  const [themeConfig, setThemeConfig] = useState(null);
  const [highlightedSection, setHighlightedSection] = useState(null);
  const checkoutRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (e.data?.type === "THEME_UPDATE" && e.data.themeConfig) setThemeConfig(e.data.themeConfig);
      if (e.data?.type === "STORE_UPDATE" && e.data.store) setStore(prev => (prev ? { ...prev, ...e.data.store } : prev));
      if (e.data?.type === "HIGHLIGHT_SECTION") setHighlightedSection(e.data.sectionType || null);
      if (e.data?.type === "SCROLL_TO_SECTION") {
        const el = document.querySelector(`[data-section="${e.data.sectionType}"]`);
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

  // ── الإعدادات الفعلية — من postMessage إذا preview، وإلا من store.themeConfig، وإلا defaults ──
  const rawTc      = themeConfig || store?.themeConfig || null;
  const homeSections    = rawTc?.sections || DEFAULT_HOME_SECTIONS;
  const productSections = rawTc?.product?.sections || DEFAULT_PRODUCT_SECTIONS;
  const styles = rawTc?.styles || DEFAULT_STYLES;

  // ✦ ترتيب ProductInfo/Checkout داخل العمود اليمين (Gallery ثابتة ديما فاليسار — العمود مقسوم
  // 2 لصور/معلومات، ماشي stack، فالتحريك ما عندوش معنى بصري ليها) — حسب مكانهم فـ themeConfig.product.sections
  const productOrder = (type) => {
    const idx = (productSections || []).findIndex(s => s.type === type);
    return idx === -1 ? 99 : idx;
  };

  const primary        = styles.primaryColor    || store?.primaryColor   || "#2563eb";
  const secondary      = styles.secondaryColor  || store?.secondaryColor || "#0f172a";
  const font           = styles.fontFamily      || store?.fontFamily     || "Cairo";
  const bgColor        = styles.backgroundColor || "#ffffff";
  const surfaceColor   = styles.surfaceColor    || "#f9fafb";
  const textColor      = styles.textColor       || "#111111";
  const mutedTextColor = styles.mutedTextColor  || "#888888";
  const borderColor    = styles.borderColor     || "#eeeeee";
  const direction      = styles.direction       || "rtl";

  useEffect(() => {
    injectCSS();
    loadFont("Cairo");
    document.documentElement.style.setProperty("--pd-primary", primary);
    document.documentElement.style.setProperty("--pd-border", borderColor);
  }, [primary, borderColor]);

  useEffect(() => { if (font) loadFont(font); }, [font]);

  useEffect(() => {
    if (!productId) return;
    (async () => {
      try {
        const pRes  = await fetch(`${API()}/api/products/${productId}`);
        const pData = await pRes.json();
        if (pRes.ok) setProduct(pData);
        if (slug) {
          const sRes  = await fetch(`${API()}/api/stores/public/${slug}`);
          const sData = await sRes.json();
          if (sData.store) setStore(sData.store);
        }
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    })();
  }, [productId, slug]);

  const handleCityChange = (city) => {
    setSelectedCity(city);
    setShippingPrice(getShippingPrice(city));
  };

  const checkoutSettings = sec(productSections, "checkout")?.settings || DEFAULT_PRODUCT_SECTIONS[2].settings;
  // ✦ fullName/phone أساسيين لإتمام الطلب — نفرضو enabled:true ديما، حتى لو كاين إعداد قديم
  // (من قبل الإصلاح) كيقول enabled:false، باش ما يبقاش الطلب يوصل بلا اسم/هاتف
  const fieldCfg = (key) => {
    const cfg = checkoutSettings.fields?.[key] || { enabled: true, required: true };
    if (key === "fullName" || key === "phone") return { ...cfg, enabled: true };
    return cfg;
  };

  const scrollToCheckout = () => checkoutRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });

  const handleOrder = async () => {
    const provinceOn = fieldCfg("province").enabled !== false;
    if (!customerName.trim() || !phone.trim() || (provinceOn && fieldCfg("province").required !== false && !selectedCity)) {
      alert("يرجى ملء جميع الحقول الإجبارية ⚠️"); return;
    }
    const phoneRegex = /^0[5-7][0-9]{8}$/;
    if (!phoneRegex.test(phone.trim().replace(/\s/g, ""))) {
      alert("رقم الهاتف غير صحيح (مثال: 0550123456) ⚠️"); return;
    }
    setOrdering(true);
    try {
      const total = product.currentPrice * quantity + shippingPrice;
      const res  = await fetch(`${API()}/api/orders/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          customerName,
          phone: phone.trim().replace(/\s/g, ""),
          address,
          municipality,
          note,
          quantity,
          shippingCity: selectedCity || "غير محدد",
          shippingPrice,
          totalPrice: total,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        navigate(`/store/${slug}/order-success`, { state: {
          orderId: data.order?._id,
          productName: product.name,
          productImage: product.images?.[0] || product.image || "",
          quantity,
          totalPrice: total,
          customerName, shippingCity: selectedCity, slug,
        }});
      } else {
        alert(data.message || "حدث خطأ أثناء إرسال الطلب ❌");
      }
    } catch { alert("خطأ في الاتصال بالخادم ❌"); }
    finally { setOrdering(false); }
  };

  // ── Loading ───────────────────────────────────────────────
  if (loading) return (
    <div style={{ minHeight: "100vh", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div className="pd-spinner" style={{ width: 36, height: 36, border: "3px solid #eee", borderTopColor: "#111", borderRadius: "50%" }} />
    </div>
  );

  if (!product) return (
    <div style={{ minHeight: "100vh", background: "#fff", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16 }} dir="rtl">
      <p style={{ color: "#ef4444", fontSize: 16 }}>المنتج غير موجود ❌</p>
      <button onClick={() => navigate(`/store/${slug}`)} style={{ background: primary, color: "#fff", border: "none", padding: "10px 24px", borderRadius: 10, cursor: "pointer", fontFamily: "inherit", fontWeight: 700 }}>
        العودة للمتجر
      </button>
    </div>
  );

  const realImages = product.images?.length > 0 ? product.images : (product.image ? [product.image] : []);
  const PLACEHOLDER_TARGET = 5; // ✦ عدد سلوتات الـ Gallery المعروضة فـ preview الـ ThemeEdit (أمثلة فقط، ماشي صور المستخدم)
  const images = isPreview
    ? Array(PLACEHOLDER_TARGET).fill(null) // ✦ preview ديما كيبان بأمثلة احترافية — ما نوريوش صور المنتج الحقيقية تاع المستخدم
    : (realImages.length ? realImages : [DEFAULT_IMG]);
  const outOfStock = product.stock === 0;
  const total = product.currentPrice * quantity + shippingPrice;

  const gallerySettings     = sec(productSections, "gallery")?.settings || DEFAULT_PRODUCT_SECTIONS[0].settings;
  const productInfoSettings = sec(productSections, "productInfo")?.settings || DEFAULT_PRODUCT_SECTIONS[1].settings;
  // ✦ الأقسام هادو دابا قابلين للإخفاء من ThemeEdit — خاصنا نتأكدو من enabled فعليا هنا
  const galleryEnabled     = sec(productSections, "gallery")?.enabled !== false;
  const productInfoEnabled = sec(productSections, "productInfo")?.enabled !== false;
  const checkoutEnabled    = sec(productSections, "checkout")?.enabled !== false;
  const headerSettings      = sec(homeSections, "header")?.settings;
  const announcementSec     = sec(homeSections, "announcement");
  const footerSettings      = sec(homeSections, "footer")?.settings;

  const aspectMap = { "1:1": "1/1", "3:4": "3/4", "4:3": "4/3" };
  const galleryAspect = gallerySettings.imageRatio === "adapt" ? undefined : (aspectMap[gallerySettings.imageRatio] || "1/1");
  const nextImg = () => setActiveImg(i => (i + 1) % images.length);
  const prevImg = () => setActiveImg(i => (i - 1 + images.length) % images.length);

  const isCompact = checkoutSettings.formStyle === "compact";
  const dirMultiplier = direction === "rtl" ? 1 : -1; // ✦ اتجاه الـ carousel peek حسب RTL/LTR
  const inputCls = `pd-input${isCompact ? " pd-input--compact" : ""}`;
  const pulseCls = checkoutSettings.buttonAnimation === "pulse" ? " pd-btn-order--pulse" : "";
  const titleAlignCss = { right: "right", center: "center", left: "left" }[checkoutSettings.titleAlign || "right"];

  return (
    <div
      dir="rtl"
      style={{ minHeight: "100vh", background: bgColor, color: textColor, fontFamily: `'${font}', 'Cairo', sans-serif`, direction, paddingBottom: checkoutSettings.stickyButton !== false ? 74 : 0 }}
    >
      <style>{`
        @media (max-width: 768px) {
          .pd-grid { grid-template-columns: 1fr !important; }
          .pd-gallery-outer { flex-direction: column !important; }
          .pd-thumbs-col { flex-direction: row !important; order: 2 !important; }
          .pd-thumb { width: 60px !important; height: 60px !important; }
          .pd-thumb-carousel { width: 84px !important; height: 84px !important; }
          .pd-thumbs-carousel-row { max-width: 100% !important; }
          .pd-gallery-sticky { position: static !important; top: auto !important; }
        }
      `}</style>

      {/* ── Announcement Bar (مشترك مع Home) ── */}
      {announcementSec?.enabled !== false && announcementSec?.settings && (
        <SectionWrapper type="announcement" isPreview={isPreview} isHighlighted={highlightedSection === "announcement"}>
          <div style={{ background: announcementSec.settings.bgColor, borderBottom: "1px solid rgba(0,0,0,.1)", overflow: "hidden", padding: "9px 0" }}>
            {announcementSec.settings.animation ? (
              <div className="pd-marquee-track" style={{ display: "flex", width: "max-content" }}>
                {[...Array(6)].map((_, i) => (
                  <span key={i} style={{ fontSize: 12, fontWeight: 600, letterSpacing: 1.5, color: announcementSec.settings.textColor, whiteSpace: "nowrap", marginInlineEnd: 64 }}>
                    {announcementSec.settings.message}
                  </span>
                ))}
              </div>
            ) : (
              <p style={{ textAlign: "center", fontSize: 12, fontWeight: 600, color: announcementSec.settings.textColor, margin: 0, letterSpacing: 1 }}>{announcementSec.settings.message}</p>
            )}
          </div>
        </SectionWrapper>
      )}

      {/* ── Navbar ── */}
      <SectionWrapper type="header" isPreview={isPreview} isHighlighted={highlightedSection === "header"}>
        <StoreNavbar
          store={store}
          slug={slug}
          headerSettings={headerSettings}
          themeColors={{ primary, secondary, bgColor, surfaceColor, textColor, mutedTextColor, borderColor }}
          cartCount={isPreview ? 2 : getCartCount(slug)}
          onCartClick={() => setCartOpen(true)}
        />
      </SectionWrapper>

      {/* ── Content ── */}
      <div
        className="pd-grid"
        style={{ maxWidth: 980, margin: "0 auto", padding: "36px 24px 60px", display: "grid", gridTemplateColumns: galleryEnabled ? "1fr 1fr" : "1fr", gap: 32, alignItems: "start" }}
      >

        {/* ── Gallery ── */}
        {galleryEnabled && (
        <SectionWrapper
          type="gallery" isPreview={isPreview} isHighlighted={highlightedSection === "gallery"}
          style={{ minWidth: 0 }}
        >
          {/* ✦ الـ sticky نقلناها لـ div داخلية منفصلة عن الـ SectionWrapper — باش المربع
              البنفسجي ديال الهايلايت (اللي مرتبط بـ SectionWrapper) يبقى ديما متزاوج صح مع
              بلاصة الصورة الحقيقية، بلا ما يتأثر بسلوك position:sticky وقت السكرول */}
          <div
            className="pd-gallery-sticky"
            style={{ position: "sticky", top: headerSettings?.sticky !== false ? 96 : 16, alignSelf: "start" }}
          >
          {gallerySettings.carouselMode ? (
            /* ══════════ CAROUSEL MODE — peek slider + thumbnails شريط اختياري ══════════ */
            <div className="pd-fade">
              <div style={{ position: "relative", borderRadius: 18, overflow: "hidden" }}>
                <div style={{ overflow: "hidden", borderRadius: 18 }}>
                  <div style={{
                    display: "flex", transition: "transform .38s cubic-bezier(.4,0,.2,1)",
                    transform: `translateX(${activeImg * 89 * dirMultiplier}%)`,
                  }}>
                    {images.map((img, i) => (
                      <div key={i} style={{
                        flex: "0 0 86%", marginInlineEnd: "3%",
                        aspectRatio: galleryAspect, background: surfaceColor,
                        border: `1px solid ${borderColor}`, borderRadius: 18, overflow: "hidden",
                      }}>
                        <GallerySlot src={img} index={i} />
                      </div>
                    ))}
                  </div>
                </div>
                {outOfStock && (
                  <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,.6)", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 18 }}>
                    <span style={{ background: "#fff", color: "#111", fontWeight: 800, fontSize: 13, padding: "8px 22px", borderRadius: 99 }}>نفد من المخزون</span>
                  </div>
                )}
                {gallerySettings.showArrows !== false && images.length > 1 && (
                  <>
                    <button className="pd-gallery-nav" style={{ left: 10 }} onClick={prevImg}><IconChevronR/></button>
                    <button className="pd-gallery-nav" style={{ right: 10 }} onClick={nextImg}><IconChevronL/></button>
                  </>
                )}
              </div>

              {gallerySettings.showThumbnails !== false && images.length > 1 && (
                <div
                  className="pd-thumbs-carousel-row"
                  style={{
                    display: "flex", gap: 10, marginTop: 12, overflowX: "auto",
                    maxWidth: `calc(${Math.max(1, gallerySettings.thumbnailsShown || 4)} * 78px)`,
                    paddingBottom: 2,
                  }}
                >
                  {images.map((img, i) => (
                    <div key={i} className={`pd-thumb pd-thumb-carousel ${activeImg === i ? "active" : ""}`} onClick={() => setActiveImg(i)} style={{ width: 68, height: 68 }}>
                      <GallerySlot src={img} index={i} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* ══════════ CAROUSEL OFF — Stacked / Bottom rail (layout ثابت) ══════════ */
            <div
              className="pd-fade pd-gallery-outer"
              style={{ display: "flex", gap: 14, flexDirection: gallerySettings.layout === "bottom-rail" ? "column" : "row" }}
            >
              {/* Thumbnails */}
              {images.length > 1 && (
                <div
                  className="pd-thumbs-col"
                  style={{
                    display: "flex", gap: 10,
                    flexDirection: gallerySettings.layout === "bottom-rail" ? "row" : "column",
                    order: gallerySettings.layout === "bottom-rail" ? 2 : 0,
                  }}
                >
                  {images.map((img, i) => (
                    <div key={i} className={`pd-thumb ${activeImg === i ? "active" : ""}`} onClick={() => setActiveImg(i)} style={{ width: 70, height: 70 }}>
                      <GallerySlot src={img} index={i} />
                    </div>
                  ))}
                </div>
              )}

              {/* Main image */}
              <div style={{
                flex: 1, borderRadius: 18, overflow: "hidden", background: surfaceColor,
                border: `1px solid ${borderColor}`, position: "relative",
                aspectRatio: galleryAspect,
              }}>
                <GallerySlot
                  src={images[activeImg]}
                  index={activeImg}
                  className={`pd-gallery-zoom ${gallerySettings.enableZoom ? "pd-gallery-zoom--enabled" : ""}`}
                  style={{ height: gallerySettings.imageRatio === "adapt" ? "auto" : "100%" }}
                />
                {outOfStock && (
                  <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,.6)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <span style={{ background: "#fff", color: "#111", fontWeight: 800, fontSize: 13, padding: "8px 22px", borderRadius: 99 }}>نفد من المخزون</span>
                  </div>
                )}
                {gallerySettings.showArrows !== false && images.length > 1 && (
                  <>
                    <button className="pd-gallery-nav" style={{ left: 10 }} onClick={prevImg}><IconChevronR/></button>
                    <button className="pd-gallery-nav" style={{ right: 10 }} onClick={nextImg}><IconChevronL/></button>
                  </>
                )}
              </div>
            </div>
          )}
          </div>
        </SectionWrapper>
        )}

        {/* ── RIGHT: Product Info + Checkout ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20, minWidth: 0 }}>

          {/* Product Info */}
          {productInfoEnabled && (
          <SectionWrapper type="productInfo" isPreview={isPreview} isHighlighted={highlightedSection === "productInfo"} style={{ order: productOrder("productInfo") }}>
            <div className="pd-fade pd-d1" style={{ padding: "8px 4px 28px" }}>
              {productInfoSettings.badgeText?.trim() && (
                <span style={{ background: primary, color: "#fff", fontSize: 11, fontWeight: 700, padding: "3px 12px", borderRadius: 99, display: "inline-block", marginBottom: 12 }}>
                  {productInfoSettings.badgeText}
                </span>
              )}
              {product.oldPrice && (
                <span style={{ background: "#ef4444", color: "#fff", fontSize: 11, fontWeight: 700, padding: "3px 12px", borderRadius: 99, display: "inline-block", marginBottom: 12, marginInlineStart: 8 }}>
                  خصم {Math.round((1 - product.currentPrice / product.oldPrice) * 100)}%
                </span>
              )}
              <h1 style={{ fontSize: "clamp(1.2rem,3vw,1.6rem)", fontWeight: 900, color: textColor, margin: "0 0 12px", lineHeight: 1.3 }}>
                {product.name}
              </h1>
              <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 14 }}>
                <span style={{ fontSize: "clamp(1.4rem,3vw,2rem)", fontWeight: 900, color: textColor }}>
                  {product.currentPrice.toLocaleString()}
                  <span style={{ fontSize: 14, fontWeight: 600, color: mutedTextColor, marginRight: 4 }}>د.ج</span>
                </span>
                {product.oldPrice && (
                  <span style={{ fontSize: 15, color: mutedTextColor, textDecoration: "line-through" }}>
                    {product.oldPrice.toLocaleString()} د.ج
                  </span>
                )}
              </div>
              {product.description && (() => {
                const isLong = product.description.length > 160;
                return (
                  <div>
                    <p style={{
                      fontSize: 14, color: mutedTextColor, lineHeight: 1.7, margin: 0,
                      ...(isLong && !descExpanded ? {
                        display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden",
                      } : {}),
                    }}>
                      {product.description}
                    </p>
                    {isLong && (
                      <button
                        onClick={() => setDescExpanded(v => !v)}
                        style={{
                          background: "none", border: "none", cursor: "pointer", padding: 0, marginTop: 6,
                          fontSize: 13, fontWeight: 700, color: primary, fontFamily: "inherit",
                        }}
                      >
                        {descExpanded ? "قراءة أقل" : "قراءة المزيد"}
                      </button>
                    )}
                  </div>
                );
              })()}
              {product.stock > 0 && product.stock <= 5 && (
                <p style={{ marginTop: 12, fontSize: 13, color: "#f59e0b", fontWeight: 700 }}>⚠️ بقي {product.stock} قطعة فقط</p>
              )}

              {/* Quantity selector */}
              {productInfoSettings.showQuantitySelector !== false && (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, marginTop: 20, marginBottom: 22 }}>
                  <span style={{ fontSize: 13, color: mutedTextColor, fontWeight: 600 }}>الكمية</span>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <button className="pd-qty-btn" onClick={() => setQuantity(q => Math.max(1, q - 1))}>−</button>
                    <span style={{ minWidth: 22, textAlign: "center", fontWeight: 700 }}>{quantity}</span>
                    <button className="pd-qty-btn" onClick={() => setQuantity(q => Math.min(product.stock || 99, q + 1))}>+</button>
                  </div>
                </div>
              )}

              {/* CTA + Add to cart — مرصوصين فوق بعض */}
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <button
                  onClick={scrollToCheckout}
                  disabled={outOfStock}
                  style={{
                    width: "100%", border: "none", cursor: outOfStock ? "not-allowed" : "pointer",
                    borderRadius: 12, padding: "13px 0", background: outOfStock ? "#f3f4f6" : primary,
                    color: outOfStock ? "#aaa" : "#fff", fontSize: 14, fontWeight: 800, fontFamily: "inherit",
                  }}
                >
                  {outOfStock ? "نفد من المخزون" : (productInfoSettings.ctaButtonText || "اطلب الآن")}
                </button>
                {productInfoSettings.showAddToCartButton !== false && !outOfStock && (
                  <button
                    onClick={() => {
                      addToCart(slug, product, quantity);
                      setAddedToCart(true);
                      setTimeout(() => setAddedToCart(false), 1800);
                    }}
                    style={{
                      width: "100%", border: `1.5px solid ${primary}`, cursor: "pointer",
                      borderRadius: 12, padding: "13px 0", background: "transparent",
                      color: primary, fontSize: 14, fontWeight: 800, fontFamily: "inherit",
                      display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                    }}
                  >
                    <IconCart /> {addedToCart ? "أُضيف للسلة ✓" : "أضف للسلة"}
                  </button>
                )}
              </div>

              {productInfoSettings.showDeliveryNote !== false && productInfoSettings.deliveryNote?.trim() && (
                <p style={{ marginTop: 14, fontSize: 12.5, color: mutedTextColor, textAlign: "center" }}>{productInfoSettings.deliveryNote}</p>
              )}
            </div>
          </SectionWrapper>
          )}

          {/* In-Page Checkout */}
          {checkoutEnabled && (
          <SectionWrapper type="checkout" isPreview={isPreview} isHighlighted={highlightedSection === "checkout"} style={{ order: productOrder("checkout") }}>
            <div
              ref={checkoutRef} className="pd-fade pd-d2"
              style={{
                background: bgColor, border: `1px solid ${borderColor}`, borderRadius: 18, padding: "24px 22px",
                boxShadow: `0 -22px 40px -26px ${borderColor}, 0 22px 40px -26px ${borderColor}`,
              }}
            >
              <h3 style={{ margin: "0 0 18px", fontWeight: 800, fontSize: 16, color: textColor, textAlign: titleAlignCss }}>
                {checkoutSettings.sectionTitle || "معلومات الطلب"}
              </h3>

              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {fieldCfg("fullName").enabled !== false && (
                  <div>
                    <FieldLabel text="الاسم الكامل" required={fieldCfg("fullName").required !== false} color={textColor} />
                    <div className="pd-field-wrap">
                      <input
                        className={`${inputCls}${checkoutSettings.showFieldIcons !== false ? " pd-input--icon" : ""}`}
                        value={customerName} onChange={e => setCustomerName(e.target.value)}
                        placeholder="الاسم واللقب..."
                      />
                      {checkoutSettings.showFieldIcons !== false && <span className="pd-field-icon">{FIELD_ICONS.fullName}</span>}
                    </div>
                  </div>
                )}

                {fieldCfg("phone").enabled !== false && (
                  <div>
                    <FieldLabel text="رقم الهاتف" required={fieldCfg("phone").required !== false} color={textColor} />
                    <div className="pd-field-wrap">
                      <input
                        className={`${inputCls}${checkoutSettings.showFieldIcons !== false ? " pd-input--icon" : ""}`}
                        value={phone} onChange={e => setPhone(e.target.value)} type="tel"
                        placeholder="06 59 24 23 17"
                      />
                      {checkoutSettings.showFieldIcons !== false && <span className="pd-field-icon">{FIELD_ICONS.phone}</span>}
                    </div>
                    <p style={{ margin: "6px 2px 0", fontSize: 12, color: mutedTextColor }}>يجب أن يبدأ بـ 05، 06، أو 07</p>
                  </div>
                )}

                {(fieldCfg("province").enabled !== false || fieldCfg("municipality").enabled !== false) && (
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    {fieldCfg("province").enabled !== false && (
                      <div>
                        <FieldLabel text="الولاية" required={fieldCfg("province").required !== false} color={textColor} />
                        <div className="pd-field-wrap">
                          <select
                            className={`${inputCls}${checkoutSettings.showFieldIcons !== false ? " pd-input--icon" : ""}`}
                            value={selectedCity} onChange={e => handleCityChange(e.target.value)} style={{ cursor: "pointer" }}
                          >
                            <option value="">اختر الولاية</option>
                            {ALGERIAN_CITIES.map(city => <option key={city.id} value={city.name}>{city.name}</option>)}
                          </select>
                          {checkoutSettings.showFieldIcons !== false && <span className="pd-field-icon">{FIELD_ICONS.province}</span>}
                        </div>
                      </div>
                    )}
                    {fieldCfg("municipality").enabled !== false && (
                      <div>
                        <FieldLabel text="البلدية" required={fieldCfg("municipality").required} color={textColor} />
                        <div className="pd-field-wrap">
                          <input
                            className={`${inputCls}${checkoutSettings.showFieldIcons !== false ? " pd-input--icon" : ""}`}
                            value={municipality} onChange={e => setMunicipality(e.target.value)}
                            placeholder="اختر البلدية"
                          />
                          {checkoutSettings.showFieldIcons !== false && <span className="pd-field-icon">{FIELD_ICONS.municipality}</span>}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {checkoutSettings.showAddressField && (
                  <div>
                    <FieldLabel text="العنوان التفصيلي" required={false} optionalLabel color={textColor} />
                    <div className="pd-field-wrap">
                      <input
                        className={`${inputCls}${checkoutSettings.showFieldIcons !== false ? " pd-input--icon" : ""}`}
                        value={address} onChange={e => setAddress(e.target.value)}
                        placeholder="الشارع، رقم العمارة، الباب..."
                      />
                      {checkoutSettings.showFieldIcons !== false && <span className="pd-field-icon">{FIELD_ICONS.address}</span>}
                    </div>
                  </div>
                )}

                {checkoutSettings.showNoteField && (
                  <div>
                    <FieldLabel text="ملاحظة على الطلب" required={false} optionalLabel color={textColor} />
                    <textarea
                      className={inputCls}
                      value={note} onChange={e => setNote(e.target.value)}
                      placeholder="أي تفاصيل إضافية على طلبك..." rows={2}
                      style={{ resize: "vertical", fontFamily: "inherit" }}
                    />
                  </div>
                )}

                {/* ── Order Summary — Surface + Border من التصميم ── */}
                <div style={{ background: surfaceColor, border: `1px solid ${borderColor}`, borderRadius: 14, overflow: "hidden" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px" }}>
                    <h4 style={{ margin: 0, fontSize: 14.5, fontWeight: 800, color: textColor }}>ملخص الطلب</h4>
                    <span style={{
                      fontSize: 12, fontWeight: 700, color: primary, border: `1px solid ${borderColor}`,
                      borderRadius: 99, padding: "3px 12px",
                    }}>
                      {quantity === 1 ? "منتج واحد" : quantity === 2 ? "منتجين" : `${quantity} منتجات`}
                    </span>
                  </div>

                  <div style={{ borderTop: `1px solid ${borderColor}`, background: bgColor, padding: "14px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ fontSize: 13.5, fontWeight: 700, color: textColor }}>المجموع الفرعي</span>
                      <span style={{ fontSize: 13.5, color: textColor }}>{(product.currentPrice * quantity).toLocaleString()} د.ج</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ fontSize: 13.5, fontWeight: 700, color: textColor }}>تكلفة التوصيل</span>
                      <span style={{ fontSize: 12.5, color: mutedTextColor }}>
                        {selectedCity ? `${shippingPrice.toLocaleString()} د.ج` : "تحدد عند اختيار الولاية"}
                      </span>
                    </div>
                  </div>

                  <div style={{ borderTop: `1px solid ${borderColor}`, padding: "14px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div>
                      <div style={{ fontSize: 14.5, fontWeight: 800, color: textColor }}>المجموع الإجمالي</div>
                      <div style={{ fontSize: 12, color: mutedTextColor, marginTop: 2 }}>الدفع عند الاستلام</div>
                    </div>
                    <span style={{ fontSize: 20, fontWeight: 900, color: primary }}>{total.toLocaleString()} د.ج</span>
                  </div>
                </div>

                <button
                  className={`pd-btn-order${pulseCls}`}
                  onClick={handleOrder}
                  disabled={outOfStock || ordering}
                  style={{
                    width: "100%", padding: "15px 0", borderRadius: 14,
                    border: "none", cursor: outOfStock || ordering ? "not-allowed" : "pointer",
                    background: outOfStock ? "#f3f4f6" : primary,
                    color: outOfStock ? "#aaa" : "#fff",
                    fontSize: 15, fontWeight: 800, fontFamily: "inherit",
                    opacity: ordering ? 0.7 : 1,
                    boxShadow: outOfStock ? "none" : `0 4px 20px ${primary}44`,
                  }}
                >
                  {ordering ? "⏳ جاري الإرسال..." : outOfStock ? "نفد من المخزون" : (checkoutSettings.submitButtonText || "تأكيد الطلب")}
                </button>
              </div>
            </div>
          </SectionWrapper>
          )}
        </div>
      </div>

      {/* ── Footer ── */}
      <SectionWrapper type="footer" isPreview={isPreview} isHighlighted={highlightedSection === "footer"}>
        <StoreFooter store={store} slug={slug} bgColor={surfaceColor} textColor={textColor} mutedColor={mutedTextColor} light={surfaceColor === "#ffffff"} settings={footerSettings} />
      </SectionWrapper>

      {/* ── Sticky order bar ── */}
      {checkoutEnabled && checkoutSettings.stickyButton !== false && !outOfStock && (
        <div className="pd-sticky-bar">
          <button
            className={`pd-btn-order${pulseCls}`}
            onClick={handleOrder}
            disabled={ordering}
            style={{
              width: "100%", padding: "14px 0", borderRadius: 12, border: "none",
              cursor: ordering ? "not-allowed" : "pointer", background: primary, color: "#fff",
              fontSize: 14.5, fontWeight: 800, fontFamily: "inherit", opacity: ordering ? 0.7 : 1,
            }}
          >
            {ordering ? "⏳ جاري الإرسال..." : `${checkoutSettings.stickyButtonText || "اطلب الآن"} — ${total.toLocaleString()} د.ج`}
          </button>
        </div>
      )}

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
    </div>
  );
}

export default ProductDetails;