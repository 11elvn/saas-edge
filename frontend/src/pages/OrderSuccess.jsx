// ============================================================
// 📁 pages/OrderSuccess.jsx — Success Page (Tassyir-style, theme-driven)
// Sections: Announcement · Header · Success Message · Footer
// كل شي مربوط بـ themeConfig.success.sections (يتحرر من ThemeEdit → Success tab)
// ============================================================

import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import StoreNavbar from "../components/StoreNavbar";
import StoreFooter from "../components/StoreFooter";
import CartDrawer from "../components/CartDrawer";
import AnnouncementBar, { isAnnouncementEnabled, ANNOUNCEMENT_BAR_CSS } from "../components/AnnouncementBar";

const API = () => import.meta.env.VITE_API_URL;

// ── Google Font loader (نفس المنطق ديال ProductDetails/PublicStore) ──
function loadFont(font) {
  const id = `font-${font}`;
  if (document.getElementById(id)) return;
  const link = document.createElement("link");
  link.id = id;
  link.rel = "stylesheet";
  link.href = `https://fonts.googleapis.com/css2?family=${font.replace(/ /g, "+")}:wght@400;500;600;700;800;900&display=swap`;
  document.head.appendChild(link);
}

// ── DEFAULTS — نفس القيم المبدئية ديال ThemeEdit ──
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
// ── DEFAULT — Success Message (نفس SUCCESS_DEFAULT_CONFIG فـ ThemeEdit) ──
const DEFAULT_SUCCESS_SECTIONS = [
  { id: "successMessage", type: "successMessage", enabled: true, settings: {
      headline: "تم تأكيد طلبك بنجاح", subtext: "سيتواصل معك فريقنا قريباً لتأكيد تفاصيل التوصيل",
      showOrderNumber: true, showOrderSummary: true, showTimeline: true,
      ctaButtonText: "تابع التسوق", ctaButtonLink: "/", showSecondaryButton: true,
      secondaryButtonText: "تواصل معنا عبر واتساب", whatsappNumber: "", backgroundStyle: "tinted",
  } },
];

const sec = (arr, type) => (arr || []).find(s => s.type === type);

// ── يحوّل ObjectId مونجو إلى رقم طلب قصير قابل للعرض ──
const shortOrderNumber = (id) => (id ? `#${id.slice(-6).toUpperCase()}` : "#000000");

// ── اسماء الـ sections للـ label ──
const SECTION_LABELS = {
  announcement:   "Announcement Bar",
  header:         "Header",
  successMessage: "Success Message",
  footer:         "Footer",
};

// ── SectionHighlightOverlay — Mobile فقط (isNarrowViewport). مربع الهايلايت + label مبنيين بـ JS
// (getBoundingClientRect + scrollY) → full-width، بلا ما يبقى محدود بحدود السكشن الداخلية ──
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

// ── SectionWrapper — نفس مبدأ ProductDetails/PublicStore: hover + highlight عبر ::after (desktop)،
// وSectionHighlightOverlay مبني بـ JS (mobile) — كيبعث SECTION_CLICK للـ ThemeEdit فـ preview ──
// ✦ label ديما فالزاوية اليسرى الفيزيائية (left)، بحال باقي الصفحات (ماشي insetInlineStart لي كان كيقلب لليمين فـ RTL)
// ✦ successMessage: default 0/0 — نفس القيمة ديال SPACING_DEFAULTS_BY_PAGE.success فـ ThemeEdit.jsx
const OS_SPACING_DEFAULTS = { successMessage: { top: 0, bottom: 0 } };
function SectionWrapper({ type, isPreview, isHighlighted, children, style = {}, spacing, registerRef, onHoverChange }) {
  const sp = spacing || {};
  const d = OS_SPACING_DEFAULTS[type] || {};
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
      className={`os-section-wrapper${isHighlighted ? " os-section-wrapper--highlighted" : ""}`}
    >
      <div className="os-section-label">{SECTION_LABELS[type] || type}</div>
      {children}
    </div>
  );
}

function OrderSuccess() {
  const { slug: slugParam } = useParams();
  const { state } = useLocation();
  const navigate  = useNavigate();
  const location  = useLocation();
  const search    = new URLSearchParams(location.search);
  const isPreview = search.get("preview") === "1";

  const slug = slugParam || state?.slug;

  const [store,        setStore]        = useState(null);
  const [loading,       setLoading]      = useState(true);

  // ── مرحلتين: أولاً الأنيميشن، بعدها التفاصيل ──
  const [showCheck,   setShowCheck]   = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  // ── سلة التسوق (Drawer) — نفس المنطق ديال باقي صفحات المتجر ──
  const [cartOpen, setCartOpen] = useState(false);

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

  // ✦ إعادة القياس إذا تبدل ارتفاع المحتوى (تعديل إعدادات فالـ builder، مراحل الأنيميشن، تحميل store...)
  useEffect(() => {
    if (!isPreview || !isNarrowViewport) return;
    const id = requestAnimationFrame(measureOverlays);
    return () => cancelAnimationFrame(id);
  }, [isPreview, isNarrowViewport, measureOverlays, themeConfig, store, showDetails]);

  useEffect(() => {
    const t1 = setTimeout(() => setShowCheck(true), 100);
    const t2 = setTimeout(() => setShowDetails(true), 700);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (e.data?.type === "THEME_UPDATE" && e.data.themeConfig) setThemeConfig(e.data.themeConfig);
      if (e.data?.type === "STORE_UPDATE" && e.data.store) setStore(prev => (prev ? { ...prev, ...e.data.store } : prev));
      if (e.data?.type === "HIGHLIGHT_SECTION") setHighlightedSection(e.data.sectionType || null);
    };
    window.addEventListener("message", handler);
    // ✦ نطلبو آخر themeConfig مباشرة (بلاصة نتصنّتو غير على push من load event)
    if (isPreview) {
      try { window.parent.postMessage({ type: "REQUEST_THEME_CONFIG" }, "*"); } catch (_) {}
    }
    return () => window.removeEventListener("message", handler);
  }, []);

  // ── جلب المتجر (مطلوب دائماً — الـ Header/Footer/Theme يجيو منو) ──
  useEffect(() => {
    if (!slug) { setLoading(false); return; }
    (async () => {
      try {
        const sRes  = await fetch(`${API()}/api/stores/public/${slug}`);
        const sData = await sRes.json();
        if (sData.store) setStore(sData.store);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    })();
  }, [slug]);

  // ── الإعدادات الفعلية — من postMessage إذا preview، وإلا من store.themeConfig، وإلا defaults ──
  const rawTc         = themeConfig || store?.themeConfig || null;
  const homeSections   = rawTc?.sections || DEFAULT_HOME_SECTIONS;
  const successSections= rawTc?.success?.sections || DEFAULT_SUCCESS_SECTIONS;
  const styles = rawTc?.styles || DEFAULT_STYLES;

  const primary        = styles.primaryColor    || "#2563eb";
  const font           = styles.fontFamily      || "Cairo";
  const bgColor        = styles.backgroundColor || "#ffffff";
  const surfaceColor   = styles.surfaceColor    || "#f9fafb";
  const textColor      = styles.textColor       || "#111111";
  const mutedTextColor = styles.mutedTextColor  || "#888888";
  const borderColor    = styles.borderColor     || "#eeeeee";
  const direction      = styles.direction       || "rtl";

  useEffect(() => { if (font) loadFont(font); }, [font]);

  const headerSettings  = sec(homeSections, "header")?.settings;
  const announcementSec = sec(homeSections, "announcement");
  const footerSettings  = sec(homeSections, "footer")?.settings;
  const successSec      = sec(successSections, "successMessage");
  const s = successSec?.settings || DEFAULT_SUCCESS_SECTIONS[0].settings;

  // ── بيانات الطلب — حقيقية (state) فـ الاستعمال الفعلي، أو مثال ثابت فـ preview ──
  const orderData = isPreview
    ? {
        orderId: "000000000000000000000001",
        productName: "تيشرت قطني أبيض",
        productImage: "",       // بلا صورة حقيقية — نعرضو placeholder
        quantity: 1,
        totalPrice: 3200,
      }
    : {
        orderId: state?.orderId || "",
        productName: state?.productName || "",
        productImage: state?.productImage || "",
        quantity: state?.quantity || 1,
        totalPrice: state?.totalPrice || 0,
      };

  // ── redirect إذا وصل المستخدم للصفحة بلا بيانات طلب حقيقية (زيارة مباشرة) ──
  if (!isPreview && !state && !loading) { navigate("/"); return null; }

  const tinted = (s.backgroundStyle || "tinted") === "tinted";

  const copyOrderNumber = () => {
    navigator.clipboard?.writeText(shortOrderNumber(orderData.orderId)).catch(() => {});
  };

  const waLink = s.whatsappNumber
    ? `https://wa.me/${s.whatsappNumber.replace(/[^0-9]/g, "")}`
    : null;

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: 36, height: 36, border: "3px solid #eee", borderTopColor: "#111", borderRadius: "50%", animation: "os-spin 0.7s linear infinite" }} />
      <style>{`@keyframes os-spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  return (
    <div dir="rtl" style={{ minHeight: "100vh", position: "relative", background: bgColor, color: textColor, fontFamily: `'${font}', 'Cairo', sans-serif`, direction }}>
      <style>{`
        @keyframes os-checkPop {
          0%   { transform: scale(0) rotate(-10deg); opacity: 0; }
          60%  { transform: scale(1.15) rotate(4deg); opacity: 1; }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }
        @keyframes os-fadeUp { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
        ${ANNOUNCEMENT_BAR_CSS}
        .os-check-circle { opacity: 0; }
        .os-check-circle.visible { opacity: 1; animation: os-checkPop .55s cubic-bezier(.34,1.56,.64,1) forwards; }
        .os-details { opacity: 0; }
        .os-details.visible { opacity: 1; animation: os-fadeUp .5s ease forwards; }
        .os-btn:hover { filter: brightness(0.94); }

        .os-section-wrapper { position: relative; }
        /* ✦ Desktop preview (iframe الحقيقي 1280px) — مربع ملتصق بحدود السكشن (inset:0)
           ✦ Mobile: الـ highlight/hover box والـ label كيترسمو عبر SectionHighlightOverlay (JS-measured، full-width) */
        .os-section-label { display: none; }
        @media (min-width: 769px) {
          .os-section-wrapper:hover::after { content: ""; position: absolute; inset: 0; border: 2px dashed rgba(124,109,242,.55); background: rgba(124,109,242,.05); pointer-events: none; z-index: 140; }
          .os-section-wrapper--highlighted::after { content: ""; position: absolute; inset: 0; border: 2px solid #7c6df2; background: rgba(124,109,242,.10); pointer-events: none; z-index: 140; }
          .os-section-label {
            display: block;
            position: absolute; top: 8px; left: 8px; z-index: 150;
            background: #7c6df2; color: #fff; font-size: 11px; font-weight: 700;
            padding: 3px 10px; border-radius: 6px; pointer-events: none;
            font-family: 'Inter', sans-serif; letter-spacing: .3px; white-space: nowrap;
            box-shadow: 0 2px 8px rgba(124,109,242,.35);
            opacity: 0; transition: opacity .12s ease;
          }
          .os-section-wrapper:hover .os-section-label,
          .os-section-wrapper--highlighted .os-section-label { opacity: 1; }
        }
      `}</style>

      {/* ── Announcement Bar (مشترك مع Home) ── */}
      {isAnnouncementEnabled(announcementSec) && (
        <SectionWrapper type="announcement" isPreview={isPreview} spacing={sec(homeSections, "announcement")?.settings?.spacing} isHighlighted={highlightedSection === "announcement"} registerRef={registerSectionRef} onHoverChange={setHoveredSection}>
          <AnnouncementBar settings={announcementSec.settings} slug={slug} isPreview={isPreview} />
        </SectionWrapper>
      )}

      {/* ── Navbar ── */}
      <SectionWrapper type="header" isPreview={isPreview} spacing={sec(homeSections, "header")?.settings?.spacing} isHighlighted={highlightedSection === "header"} registerRef={registerSectionRef} onHoverChange={setHoveredSection}>
        <StoreNavbar
          store={store}
          slug={slug}
          headerSettings={headerSettings}
          themeColors={{ primary, bgColor, surfaceColor, textColor, mutedTextColor, borderColor }}
          cartCount={isPreview ? 2 : 0}
          onCartClick={() => setCartOpen(true)}
        />
      </SectionWrapper>

      {/* ── Success Message ── */}
      <SectionWrapper type="successMessage" isPreview={isPreview} spacing={successSec?.settings?.spacing} isHighlighted={highlightedSection === "successMessage"} registerRef={registerSectionRef} onHoverChange={setHoveredSection}>
        <div style={{ maxWidth: 480, margin: "0 auto", padding: "48px 20px 64px", display: "flex", flexDirection: "column", alignItems: "center" }}>

          {/* ✦ علامة الصح بأنيميشن */}
          <div
            className={`os-check-circle ${showCheck ? "visible" : ""}`}
            style={{
              width: 64, height: 64, borderRadius: "50%",
              background: `${primary}1a`, border: `2px solid ${primary}`,
              display: "flex", alignItems: "center", justifyContent: "center",
              marginBottom: 20,
            }}
          >
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke={primary} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>

          <div className={`os-details ${showDetails ? "visible" : ""}`} style={{ width: "100%", textAlign: "center" }}>
            <h1 style={{ fontSize: "1.4rem", fontWeight: 800, margin: "0 0 6px" }}>{s.headline}</h1>
            <p style={{ color: mutedTextColor, fontSize: ".9rem", margin: "0 0 22px", lineHeight: 1.6 }}>{s.subtext}</p>

            {/* رقم الطلب */}
            {s.showOrderNumber !== false && (
              <div
                onClick={copyOrderNumber}
                title="نسخ رقم الطلب"
                style={{
                  display: "inline-flex", alignItems: "center", gap: 6, cursor: "pointer",
                  background: surfaceColor, border: `1px solid ${borderColor}`, borderRadius: 999,
                  padding: "6px 14px", fontSize: 12, color: mutedTextColor, marginBottom: 20,
                  fontFamily: "monospace",
                }}
              >
                رقم الطلب {shortOrderNumber(orderData.orderId)}
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
              </div>
            )}

            {/* بطاقة ملخص الطلب */}
            {s.showOrderSummary !== false && orderData.productName && (
              <div style={{
                display: "flex", gap: 12, alignItems: "center", textAlign: "right",
                background: tinted ? `${primary}0d` : surfaceColor,
                border: `1px solid ${borderColor}`, borderRadius: 14, padding: 14, marginBottom: 20,
              }}>
                <div style={{
                  width: 52, height: 52, borderRadius: 10, background: "#eef0f2", flexShrink: 0,
                  backgroundImage: orderData.productImage ? `url(${orderData.productImage})` : undefined,
                  backgroundSize: "cover", backgroundPosition: "center",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  {!orderData.productImage && (
                    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#9aa1a9" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="18" height="18" rx="2" />
                      <circle cx="8.5" cy="8.5" r="1.5" />
                      <path d="M21 15l-5-5L5 21" />
                    </svg>
                  )}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {orderData.productName}
                  </div>
                  <div style={{ fontSize: 12, color: mutedTextColor, marginTop: 2 }}>
                    الكمية {orderData.quantity} · {Number(orderData.totalPrice || 0).toLocaleString()} د.ج
                  </div>
                </div>
              </div>
            )}

            {/* Timeline */}
            {s.showTimeline !== false && (
              <div style={{ display: "flex", alignItems: "flex-start", marginBottom: 26 }}>
                {["تم الاستلام", "التحضير", "التوصيل"].map((label, i) => (
                  <div key={label} style={{ display: "flex", alignItems: "center", flex: i < 2 ? 1 : "0 0 auto" }}>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                      <div style={{
                        width: 10, height: 10, borderRadius: "50%",
                        background: i === 0 ? primary : "transparent",
                        border: `2px solid ${i === 0 ? primary : borderColor}`,
                      }} />
                      <span style={{ fontSize: 10.5, color: i === 0 ? textColor : mutedTextColor, fontWeight: i === 0 ? 700 : 500, whiteSpace: "nowrap" }}>{label}</span>
                    </div>
                    {i < 2 && <div style={{ flex: 1, height: 1, borderTop: `1px dashed ${borderColor}`, marginTop: -18 }} />}
                  </div>
                ))}
              </div>
            )}

            {/* أزرار */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <button
                className="os-btn"
                onClick={() => !isPreview && navigate(s.ctaButtonLink && s.ctaButtonLink !== "/" ? s.ctaButtonLink : (slug ? `/store/${slug}` : "/"))}
                style={{
                  width: "100%", padding: "13px", background: primary, color: "#fff",
                  border: "none", borderRadius: 12, fontFamily: "inherit", fontSize: ".92rem",
                  fontWeight: 700, cursor: "pointer", transition: "filter .15s",
                }}
              >
                {s.ctaButtonText || "تابع التسوق"}
              </button>

              {s.showSecondaryButton !== false && (
                <a
                  href={isPreview ? undefined : (waLink || undefined)}
                  target="_blank" rel="noreferrer"
                  onClick={e => { if (isPreview || !waLink) e.preventDefault(); }}
                  className="os-btn"
                  style={{
                    width: "100%", padding: "13px", background: "transparent", color: textColor,
                    border: `1px solid ${borderColor}`, borderRadius: 12, fontFamily: "inherit",
                    fontSize: ".88rem", fontWeight: 600, cursor: "pointer", textAlign: "center",
                    textDecoration: "none", display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                  }}
                >
                  {s.secondaryButtonText || "تواصل معنا"}
                </a>
              )}
            </div>
          </div>
        </div>
      </SectionWrapper>

      {/* ── Footer ── */}
      <SectionWrapper type="footer" isPreview={isPreview} spacing={sec(homeSections, "footer")?.settings?.spacing} isHighlighted={highlightedSection === "footer"} registerRef={registerSectionRef} onHoverChange={setHoveredSection}>
        <StoreFooter store={store} slug={slug} bgColor={surfaceColor} textColor={textColor} mutedColor={mutedTextColor} light={surfaceColor === "#ffffff"} settings={footerSettings} />
      </SectionWrapper>

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

      {/* ── Highlight overlay (preview, mobile فقط) — full-width، JS-measured ── */}
      {overlayRects.hover && (
        <SectionHighlightOverlay rect={overlayRects.hover} label={SECTION_LABELS[hoveredSection] || hoveredSection} variant="hover" />
      )}
      {overlayRects.active && (
        <SectionHighlightOverlay rect={overlayRects.active} label={SECTION_LABELS[highlightedSection] || highlightedSection} variant="active" />
      )}
    </div>
  );
}

export default OrderSuccess;