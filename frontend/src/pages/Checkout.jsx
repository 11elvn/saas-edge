// ============================================================
// 📁 pages/Checkout.jsx — صفحة الدفع المستقلة (السلة كاملة)
// Route: /store/:slug/checkout
// نفس تصميم "In-Page Checkout" ديال ProductDetails.jsx، مربوطة بـ
// themeConfig.checkout.sections (تتحرر من ThemeEdit → Checkout tab)
// ============================================================

import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { ALGERIAN_CITIES, getShippingPrice } from "../constants/algerianCities";
import StoreNavbar from "../components/StoreNavbar";
import StoreFooter from "../components/StoreFooter";
import FaqSection from "../components/FaqSection";
import { useCart } from "../context/CartContext";

const API = () => import.meta.env.VITE_API_URL;
const DEFAULT_IMG = "https://placehold.co/200x200/f9fafb/94a3b8?text=No+Image";

// ── Google Font loader (نفس المنطق ديال باقي الصفحات) ──
function loadFont(font) {
  const id = `font-${font}`;
  if (document.getElementById(id)) return;
  const link = document.createElement("link");
  link.id = id;
  link.rel = "stylesheet";
  link.href = `https://fonts.googleapis.com/css2?family=${font.replace(/ /g, "+")}:wght@400;500;600;700;800;900&display=swap`;
  document.head.appendChild(link);
}

// ── نفس CSS classes ديال ProductDetails (pd-input / pd-field-icon / pd-btn-order...) ──
// ✦ id مشترك "pd-styles" — إذا زارها الزبون من ProductDetails قبل، ما تتكررش
const PD_CSS = `
@keyframes pd-fade-up { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
@keyframes pd-spin     { to{transform:rotate(360deg)} }
@keyframes pd-marquee  { from { transform:translateX(0); } to { transform:translateX(-50%); } }
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
.pd-sticky-bar {
  position:fixed; bottom:0; left:0; right:0; z-index:500;
  padding:12px 16px calc(12px + env(safe-area-inset-bottom));
  background:#fff; border-top:1px solid #eee; box-shadow:0 -8px 24px rgba(0,0,0,.08);
}
.pd-section-wrapper { position: relative; }
.pd-section-label { display: none; }
@media (min-width: 769px) {
  .pd-section-wrapper:hover::after { content: ""; position: absolute; inset: 0; border: 2px dashed rgba(124,109,242,.55); background: rgba(124,109,242,.05); pointer-events: none; z-index: 140; }
  .pd-section-wrapper--highlighted::after { content: ""; position: absolute; inset: 0; border: 2px solid #7c6df2; background: rgba(124,109,242,.10); pointer-events: none; z-index: 140; }
  .pd-section-label {
    display: block;
    position: absolute; top: 8px; left: 8px; z-index: 150;
    background: #7c6df2; color: #fff; font-size: 11px; font-weight: 700;
    padding: 3px 10px; border-radius: 6px; pointer-events: none;
    font-family: 'Inter', sans-serif; letter-spacing: .3px; white-space: nowrap;
    box-shadow: 0 2px 8px rgba(124,109,242,.35);
    opacity: 0; transition: opacity .12s ease;
  }
  .pd-section-wrapper:hover .pd-section-label,
  .pd-section-wrapper--highlighted .pd-section-label { opacity: 1; }
}
`;

function injectCSS() {
  if (document.getElementById("pd-styles")) return;
  const s = document.createElement("style");
  s.id = "pd-styles";
  s.textContent = PD_CSS;
  document.head.appendChild(s);
}

// ── DEFAULTS — نفس القيم الافتراضية ديال ThemeEdit ──
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
// ── DEFAULT — Checkout Form (نفس CHECKOUT_PAGE_DEFAULT_CONFIG فـ ThemeEdit) ──
const DEFAULT_CHECKOUT_SECTIONS = [
  { id: "cartCheckout", type: "checkout", enabled: true, settings: {
      sectionTitle: "إتمام الطلب", titleAlign: "center", submitButtonText: "تأكيد الطلب الآن",
      formStyle: "default", buttonAnimation: "none", showFieldIcons: true,
      showAddressField: false, showNoteField: false, stickyButton: true, stickyButtonText: "تأكيد الطلب الآن",
      fields: {
        fullName:     { enabled: true, required: true },
        phone:        { enabled: true, required: true },
        province:     { enabled: true, required: true },
        municipality: { enabled: true, required: true },
      },
  } },
  { id: "checkoutTrust", type: "trust", enabled: true, settings: {
      layout: "row",
      badges: [
        { id: "cod",      enabled: true,  title: "دفع عند الاستلام", sub: "دفع آمن وسهل" },
        { id: "secure",   enabled: true,  title: "متجر موثوق",       sub: "آلاف العملاء الراضين" },
        { id: "shipping", enabled: true,  title: "توصيل سريع",       sub: "لجميع ولايات الجزائر" },
        { id: "return",   enabled: false, title: "إرجاع مجاني",      sub: "خلال 7 أيام" },
        { id: "support",  enabled: false, title: "دعم 24/7",         sub: "نحن هنا لمساعدتك" },
      ],
      bgColor: "#ffffff",
  } },
];

const sec = (arr, type) => (arr || []).find(s => s.type === type);

const SECTION_LABELS = { announcement: "Announcement Bar", header: "Header", checkout: "In-Page Checkout", trust: "Trust Badges", faq: "FAQ", footer: "Footer" };

// ── نفس مبدأ الـ checkout: id ديال Trust Badges مختلف عن الـ type (id: "checkoutTrust"، type: "trust").
// وFAQ زادة عندها نفس المشكل، لكن الـ id ديالها متولد ديناميكياً (`faq-${Date.now()}`) كي تتزاد من
// ThemeEdit "Add Section" — فكنستعملو regex باش نقطعو الـ timestamp ونرجعو للـ type الأصلي ──
const normalizeSection = (t) => {
  if (!t) return t;
  if (t === "cartCheckout")  return "checkout";
  if (t === "checkoutTrust") return "trust";
  return t.replace(/-\d+$/, ""); // "faq-1735999999999" → "faq" (وكذا أي section ديناميكي آخر مستقبلاً)
};

// ── SectionHighlightOverlay — Mobile فقط (isNarrowViewport). مربع الهايلايت + label مبنيين بـ JS
// (getBoundingClientRect + scrollY) → full-width حقيقي (left:0/right:0 بالنسبة لحاوية الصفحة) ──
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

// ── SectionWrapper — نفس منطق OrderSuccess/SearchResults: hover + highlight عبر ::after (desktop)،
// وSectionHighlightOverlay مبني بـ JS (mobile) — كيبعث SECTION_CLICK للـ ThemeEdit فـ preview ──
// ✦ faq: default 52/60 — كان مبني قبل فـ FaqSection.jsx نفسها، دابا تحكم فيه هنا (نفس القيمة بالضبط)
// ✦ trust: default 24/24 — نفس القيمة بالضبط ديال PS_SPACING_DEFAULTS.trust فـ PublicStore.jsx (Home)
const CO_SPACING_DEFAULTS = { faq: { top: 52, bottom: 60 }, trust: { top: 24, bottom: 24 } };
function SectionWrapper({ type, isPreview, isHighlighted, children, style = {}, spacing, registerRef, onHoverChange }) {
  const sp = spacing || {};
  const d = CO_SPACING_DEFAULTS[type] || {};
  const extraPad = { paddingTop: sp.top ?? d.top ?? 0, paddingBottom: sp.bottom ?? d.bottom ?? 0, paddingInlineStart: sp.start || 0, paddingInlineEnd: sp.end || 0 };
  if (!isPreview) return <div style={{ ...extraPad, ...style }} data-section={type}>{children}</div>;
  const handleClick = () => window.parent.postMessage({ type: "SECTION_CLICK", sectionType: type }, "*");
  return (
    <div
      ref={el => registerRef && registerRef(type, el)}
      style={{ position: "relative", ...extraPad, ...style, cursor: "pointer" }}
      data-section={type}
      onClick={handleClick}
      onMouseEnter={() => onHoverChange && onHoverChange(type)}
      onMouseLeave={() => onHoverChange && onHoverChange(null)}
      className={`pd-section-wrapper${isHighlighted ? " pd-section-wrapper--highlighted" : ""}`}
    >
      <div className="pd-section-label">{SECTION_LABELS[type] || type}</div>
      {children}
    </div>
  );
}

// ── أيقونات الحقول (نفس ProductDetails) ──
const IconUser  = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/></svg>;
const IconPhone = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.8 19.8 0 01-8.63-3.07 19.5 19.5 0 01-6-6A19.8 19.8 0 012.12 4.2 2 2 0 014.11 2h3a2 2 0 012 1.72c.13.96.36 1.9.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0122 16.92z"/></svg>;
const IconPin   = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 6-9 12-9 12s-9-6-9-12a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>;
const IconBuilding = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="4" y="3" width="16" height="18" rx="1"/><line x1="9" y1="8" x2="9" y2="8.01"/><line x1="15" y1="8" x2="15" y2="8.01"/><line x1="9" y1="13" x2="9" y2="13.01"/><line x1="15" y1="13" x2="15" y2="13.01"/><line x1="10" y1="21" x2="10" y2="17" /><line x1="14" y1="21" x2="14" y2="17" /></svg>;
const IconHome  = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 11l9-8 9 8"/><path d="M5 10v10h14V10"/></svg>;
const IconNote  = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 3H6a2 2 0 00-2 2v14a2 2 0 002 2h12a2 2 0 002-2V9z"/><path d="M14 3v6h6"/></svg>;
const IconBack  = () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></svg>;

const FIELD_ICONS = { fullName: <IconUser/>, phone: <IconPhone/>, province: <IconPin/>, municipality: <IconBuilding/>, address: <IconHome/>, note: <IconNote/> };

function FieldLabel({ text, required, optionalLabel, color }) {
  return (
    <label style={{ display: "block", fontSize: 13, fontWeight: 700, color, marginBottom: 8 }}>
      {text}
      {required && <span style={{ color, marginInlineStart: 3 }}>*</span>}
      {optionalLabel && <span style={{ color: "#9ca3af", fontWeight: 600 }}> (اختياري)</span>}
    </label>
  );
}

// ── منتجات تجريبية — تتعرض فقط فـ preview الـ ThemeEdit كي تكون السلة فارغة ──
const PREVIEW_ITEMS = [
  { productId: "preview1", name: "منتج تجريبي 1", image: "", price: 3500, quantity: 1, stock: 99, variant: ["المقاس: XL", "اللون: أسود"] },
  { productId: "preview2", name: "منتج تجريبي 2", image: "", price: 5200, quantity: 2, stock: 99, variant: ["المقاس: L", "اللون: أبيض"] },
];

function Checkout() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const isPreview = new URLSearchParams(location.search).get("preview") === "1";

  const [store,   setStore]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [ordering, setOrdering] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const { getCart, getCartTotal, clearCart } = useCart();
  const realItems = getCart(slug);
  const items = isPreview && realItems.length === 0 ? PREVIEW_ITEMS : realItems;
  const itemsTotal = isPreview && realItems.length === 0
    ? PREVIEW_ITEMS.reduce((sum, it) => sum + it.price * it.quantity, 0)
    : getCartTotal(slug);

  // ── حقول الفورم ──
  const [customerName, setCustomerName] = useState("");
  const [phone,        setPhone]        = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [municipality, setMunicipality] = useState("");
  const [address,      setAddress]      = useState("");
  const [note,         setNote]         = useState("");
  const [shippingPrice, setShippingPrice] = useState(0);

  // ── Live theme من الـ builder (postMessage) ──
  const [themeConfig, setThemeConfig] = useState(null);
  const [highlightedSection, setHighlightedSection] = useState(null);

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

  const measureOverlays = useCallback(() => {
    if (!isNarrowViewport) { setOverlayRects({ hover: null, active: null }); return; }
    const activeEl = highlightedSection ? sectionRefs.current[normalizeSection(highlightedSection)] : null;
    const showHover = hoveredSection && normalizeSection(hoveredSection) !== normalizeSection(highlightedSection);
    const hoverEl = showHover ? sectionRefs.current[normalizeSection(hoveredSection)] : null;
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

  // ✦ إعادة القياس إذا تبدل ارتفاع المحتوى (تعديل إعدادات فالـ builder، تحميل السلة/المتجر...)
  useEffect(() => {
    if (!isPreview || !isNarrowViewport) return;
    const id = requestAnimationFrame(measureOverlays);
    return () => cancelAnimationFrame(id);
  }, [isPreview, isNarrowViewport, measureOverlays, themeConfig, store, items.length, loading]);

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
  const rawTc        = themeConfig || store?.themeConfig || null;
  const homeSections  = rawTc?.sections || DEFAULT_HOME_SECTIONS;
  const checkoutSections = rawTc?.checkout?.sections || DEFAULT_CHECKOUT_SECTIONS;
  const styles = rawTc?.styles || DEFAULT_STYLES;

  const primary        = styles.primaryColor    || store?.primaryColor   || "#2563eb";
  const secondary      = styles.secondaryColor  || store?.secondaryColor || "#0f172a";
  const font           = styles.fontFamily      || store?.fontFamily     || "Cairo";
  const bgColor        = styles.backgroundColor || "#ffffff";
  const surfaceColor   = styles.surfaceColor    || "#fafafa";
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
    if (!slug) return;
    (async () => {
      try {
        const res  = await fetch(`${API()}/api/stores/public/${slug}`);
        const data = await res.json();
        if (data.store) setStore(data.store);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    })();
  }, [slug]);

  const handleCityChange = (city) => {
    setSelectedCity(city);
    setShippingPrice(getShippingPrice(city));
  };

  const checkoutSettings = sec(checkoutSections, "checkout")?.settings || DEFAULT_CHECKOUT_SECTIONS[0].settings;
  // ✦ fullName/phone أساسيين لإتمام الطلب — نفرضو enabled:true ديما، حتى لو كاين إعداد قديم
  // (من قبل الإصلاح) كيقول enabled:false، باش ما يبقاش الطلب يوصل بلا اسم/هاتف
  const fieldCfg = (key) => {
    const cfg = checkoutSettings.fields?.[key] || { enabled: true, required: true };
    if (key === "fullName" || key === "phone") return { ...cfg, enabled: true };
    return cfg;
  };

  const total = itemsTotal + shippingPrice;

  const handleOrder = async () => {
    if (isPreview) return; // ✦ فـ preview الـ builder ما نبعتوش طلبات حقيقية
    setErrorMsg("");
    if (!items.length) { setErrorMsg("السلة فارغة ⚠️"); return; }

    const provinceOn = fieldCfg("province").enabled !== false;
    if (
      (fieldCfg("fullName").enabled !== false && !customerName.trim()) ||
      (fieldCfg("phone").enabled !== false && !phone.trim()) ||
      (provinceOn && fieldCfg("province").required !== false && !selectedCity)
    ) {
      setErrorMsg("يرجى ملء جميع الحقول الإجبارية ⚠️"); return;
    }
    const phoneRegex = /^0[5-7][0-9]{8}$/;
    const cleanPhone = phone.trim().replace(/\s/g, "");
    if (!phoneRegex.test(cleanPhone)) {
      setErrorMsg("رقم الهاتف غير صحيح (مثال: 0550123456) ⚠️"); return;
    }

    setOrdering(true);
    try {
      const res = await fetch(`${API()}/api/orders/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map(it => ({ productId: it.productId, quantity: it.quantity })),
          customerName,
          phone: cleanPhone,
          address,
          municipality,
          note,
          shippingCity: selectedCity || "غير محدد",
          shippingPrice,
          totalPrice: total,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        const totalQty = items.reduce((s, it) => s + it.quantity, 0);
        const label = items.length > 1
          ? `${items[0].name} و ${items.length - 1} منتج${items.length - 1 > 1 ? "ات" : ""} آخر`
          : items[0].name;
        clearCart(slug);
        navigate(`/store/${slug}/order-success`, { state: {
          orderId: data.order?._id,
          productName: label,
          productImage: items[0].image || "",
          quantity: totalQty,
          totalPrice: total,
          customerName, shippingCity: selectedCity, slug,
        }});
      } else {
        setErrorMsg(data.message || "حدث خطأ أثناء إرسال الطلب ❌");
      }
    } catch { setErrorMsg("خطأ في الاتصال بالخادم ❌"); }
    finally { setOrdering(false); }
  };

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div className="pd-spinner" style={{ width: 36, height: 36, border: "3px solid #eee", borderTopColor: "#111", borderRadius: "50%" }} />
    </div>
  );

  const isCompact = checkoutSettings.formStyle === "compact";
  const inputCls = `pd-input${isCompact ? " pd-input--compact" : ""}`;
  const pulseCls = checkoutSettings.buttonAnimation === "pulse" ? " pd-btn-order--pulse" : "";
  const titleAlignCss = { right: "right", center: "center", left: "left" }[checkoutSettings.titleAlign || "center"];

  const headerSettings  = sec(homeSections, "header")?.settings;
  const announcementSec = sec(homeSections, "announcement");
  const footerSettings  = sec(homeSections, "footer")?.settings;

  return (
    <div
      dir={direction}
      style={{ minHeight: "100vh", position: "relative", background: bgColor, color: textColor, fontFamily: `'${font}', 'Cairo', sans-serif`, paddingBottom: checkoutSettings.stickyButton !== false && !isCompact ? 74 : 0 }}
    >
      {/* ── Announcement Bar ── */}
      {announcementSec?.enabled !== false && announcementSec && (
        <SectionWrapper type="announcement" isPreview={isPreview} spacing={sec(homeSections, "announcement")?.settings?.spacing} isHighlighted={highlightedSection === "announcement"} registerRef={registerSectionRef} onHoverChange={setHoveredSection}>
          <div style={{ background: announcementSec.settings.bgColor, borderBottom: "1px solid rgba(0,0,0,.1)", overflow: "hidden", padding: "9px 0", position: "relative" }}>
            {announcementSec.settings.animation ? (
              <div className="pd-marquee-track" style={{ display: "flex", width: "max-content" }}>
                {[...Array(6)].map((_, i) => (
                  <span key={i} style={{ fontSize: 12, fontWeight: 600, letterSpacing: 1.5, color: announcementSec.settings.textColor, whiteSpace: "nowrap", marginInlineEnd: 64 }}>
                    {announcementSec.settings.message}
                  </span>
                ))}
              </div>
            ) : (
              <p style={{ textAlign: "center", fontSize: 12, fontWeight: 600, color: announcementSec.settings.textColor, margin: 0, letterSpacing: 1 }}>
                {announcementSec.settings.message}
              </p>
            )}
            {announcementSec.settings.showClose && (
              <button onClick={e => e.currentTarget.parentElement.style.display = "none"}
                style={{ position: "absolute", top: "50%", left: 12, transform: "translateY(-50%)", background: "none", border: "none", color: announcementSec.settings.textColor, cursor: "pointer", fontSize: 16, opacity: .7 }}>✕</button>
            )}
          </div>
        </SectionWrapper>
      )}

      {/* ── Header ── */}
      {sec(homeSections, "header")?.enabled !== false && (
        <SectionWrapper type="header" isPreview={isPreview} spacing={sec(homeSections, "header")?.settings?.spacing} isHighlighted={highlightedSection === "header"} registerRef={registerSectionRef} onHoverChange={setHoveredSection}>
          <StoreNavbar
            store={store}
            slug={slug}
            headerSettings={headerSettings}
            themeColors={{ primary, secondary, bgColor, surfaceColor, textColor, mutedTextColor, borderColor }}
            cartCount={items.length}
            onCartClick={() => {}}
          />
        </SectionWrapper>
      )}

      <div style={{ maxWidth: 640, margin: "0 auto", padding: "28px 16px 0" }}>
        <button
          onClick={() => navigate(`/store/${slug}`)}
          style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", color: mutedTextColor, cursor: "pointer", fontFamily: "inherit", fontSize: 13, fontWeight: 600, marginBottom: 14, padding: 0 }}
        >
          <IconBack /> متابعة التسوق
        </button>

        {items.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 20px", background: surfaceColor, borderRadius: 16 }}>
            <p style={{ fontSize: 15, fontWeight: 700, color: textColor, margin: "0 0 6px" }}>السلة فارغة</p>
            <p style={{ fontSize: 13, color: mutedTextColor, margin: "0 0 20px" }}>زيد منتجات باش تقدر تكمل الطلب</p>
            <button
              onClick={() => navigate(`/store/${slug}`)}
              style={{ background: primary, color: "#fff", border: "none", borderRadius: 10, padding: "12px 28px", fontWeight: 800, fontSize: 14, cursor: "pointer", fontFamily: "inherit" }}
            >
              العودة للمتجر
            </button>
          </div>
        ) : (
          <SectionWrapper type="checkout" isPreview={isPreview} spacing={sec(checkoutSections, "checkout")?.settings?.spacing} isHighlighted={normalizeSection(highlightedSection) === "checkout"} registerRef={registerSectionRef} onHoverChange={setHoveredSection}>
            <div
              className="pd-fade pd-d2"
              style={{
                background: bgColor, border: `1px solid ${borderColor}`, borderRadius: 18, padding: "24px 22px",
                boxShadow: `0 -22px 40px -26px ${borderColor}, 0 22px 40px -26px ${borderColor}`,
              }}
            >
              <h1 style={{ margin: "0 0 20px", fontWeight: 800, fontSize: 20, color: textColor, textAlign: titleAlignCss }}>
                {checkoutSettings.sectionTitle || "إتمام الطلب"}
              </h1>

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

                {/* ── Order Summary ── */}
                <div style={{ background: surfaceColor, border: `1px solid ${borderColor}`, borderRadius: 14, overflow: "hidden" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px" }}>
                    <h4 style={{ margin: 0, fontSize: 14.5, fontWeight: 800, color: textColor }}>ملخص الطلب</h4>
                    <span style={{
                      fontSize: 12, fontWeight: 700, color: primary, border: `1px solid ${borderColor}`,
                      borderRadius: 99, padding: "3px 12px",
                    }}>
                      {items.length === 1 ? "منتج واحد" : items.length === 2 ? "منتجين" : `${items.length} منتجات`}
                    </span>
                  </div>

                  <div style={{ borderTop: `1px solid ${borderColor}`, background: bgColor, padding: "10px 16px", display: "flex", flexDirection: "column", gap: 12 }}>
                    {items.map(item => (
                      <div key={item.productId} style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 0" }}>
                        <div style={{
                          width: 42, height: 42, borderRadius: 9, flexShrink: 0, overflow: "hidden", background: surfaceColor,
                          backgroundImage: `url(${item.image || DEFAULT_IMG})`, backgroundSize: "cover", backgroundPosition: "center",
                        }} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: textColor, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {item.name}
                          </p>
                          {item.variant?.length ? (
                            item.variant.map((v, i) => (
                              <p key={i} style={{ margin: i === 0 ? "2px 0 0" : "0", fontSize: 11.5, color: mutedTextColor, fontWeight: 600 }}>{v}</p>
                            ))
                          ) : (
                            <p style={{ margin: "2px 0 0", fontSize: 11.5, color: mutedTextColor, fontWeight: 600 }}>الكمية {item.quantity}</p>
                          )}
                        </div>
                        <span style={{ fontSize: 13, fontWeight: 800, color: textColor, whiteSpace: "nowrap" }}>
                          {(item.price * item.quantity).toLocaleString()} د.ج
                        </span>
                      </div>
                    ))}
                  </div>

                  <div style={{ borderTop: `1px solid ${borderColor}`, background: bgColor, padding: "14px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ fontSize: 13.5, fontWeight: 700, color: textColor }}>المجموع الفرعي</span>
                      <span style={{ fontSize: 13.5, color: textColor }}>{itemsTotal.toLocaleString()} د.ج</span>
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

                {errorMsg && (
                  <div style={{ padding: "12px 14px", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 10, color: "#b91c1c", fontSize: 13, fontWeight: 700 }}>
                    {errorMsg}
                  </div>
                )}

                {checkoutSettings.stickyButton === false && (
                  <button
                    className={`pd-btn-order${pulseCls}`}
                    onClick={handleOrder}
                    disabled={ordering}
                    style={{
                      width: "100%", padding: "15px 0", borderRadius: 14,
                      border: "none", cursor: ordering ? "not-allowed" : "pointer",
                      background: primary, color: "#fff",
                      fontSize: 15, fontWeight: 800, fontFamily: "inherit",
                      opacity: ordering ? 0.7 : 1,
                      boxShadow: `0 4px 20px ${primary}44`,
                    }}
                  >
                    {ordering ? "⏳ جاري الإرسال..." : (checkoutSettings.submitButtonText || "تأكيد الطلب")}
                  </button>
                )}
              </div>
            </div>
          </SectionWrapper>
        )}
      </div>

      {/* ── Trust Badges ── */}
      {(() => {
        const s = sec(checkoutSections, "trust");
        if (!s || s.enabled === false) return null;
        const { badges, layout } = s.settings || {};
        const activeBadges = (badges || []).filter(b => b.enabled !== false);
        if (!activeBadges.length) return null;

        // ✦ نفس الأيقونات ديال Trust Badges فـ الصفحة الرئيسية (PublicStore)
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
          <SectionWrapper type="trust" isPreview={isPreview} spacing={sec(checkoutSections, "trust")?.settings?.spacing} isHighlighted={normalizeSection(highlightedSection) === "trust"} registerRef={registerSectionRef} onHoverChange={setHoveredSection}>
            <section style={{ background: bgColor }}>
              {isRow ? renderRow() : renderGrid()}
            </section>
          </SectionWrapper>
        );
      })()}

      {/* ── FAQ ── */}
      {sec(checkoutSections, "faq")?.enabled !== false && sec(checkoutSections, "faq") && (
        <SectionWrapper type="faq" isPreview={isPreview} spacing={sec(checkoutSections, "faq")?.settings?.spacing} isHighlighted={normalizeSection(highlightedSection) === "faq"} registerRef={registerSectionRef} onHoverChange={setHoveredSection}>
          <FaqSection
            settings={sec(checkoutSections, "faq")?.settings}
            primary={primary} bgColor={bgColor} surfaceColor={surfaceColor}
            textColor={textColor} mutedTextColor={mutedTextColor} borderColor={borderColor}
          />
        </SectionWrapper>
      )}

      {/* ── Footer ── */}
      {sec(homeSections, "footer")?.enabled !== false && (
        <SectionWrapper type="footer" isPreview={isPreview} spacing={sec(homeSections, "footer")?.settings?.spacing} isHighlighted={highlightedSection === "footer"} registerRef={registerSectionRef} onHoverChange={setHoveredSection}>
          <StoreFooter store={store} slug={slug} bgColor={surfaceColor} textColor={textColor} mutedColor={mutedTextColor} light={surfaceColor === "#ffffff"} settings={footerSettings} />
        </SectionWrapper>
      )}

      {/* ── Sticky order bar ── */}
      {checkoutSettings.stickyButton !== false && items.length > 0 && (
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
            {ordering ? "⏳ جاري الإرسال..." : `${checkoutSettings.stickyButtonText || "تأكيد الطلب الآن"} — ${total.toLocaleString()} د.ج`}
          </button>
        </div>
      )}

      {/* ── Highlight overlay (preview, mobile فقط) — full-width، JS-measured ── */}
      {overlayRects.hover && (
        <SectionHighlightOverlay rect={overlayRects.hover} label={SECTION_LABELS[normalizeSection(hoveredSection)] || hoveredSection} variant="hover" />
      )}
      {overlayRects.active && (
        <SectionHighlightOverlay rect={overlayRects.active} label={SECTION_LABELS[normalizeSection(highlightedSection)] || highlightedSection} variant="active" />
      )}
    </div>
  );
}

export default Checkout;