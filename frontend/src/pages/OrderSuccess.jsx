// ============================================================
// 📁 pages/OrderSuccess.jsx — Success Page (Tassyir-style, theme-driven)
// Sections: Announcement · Header · Success Message · Footer
// كل شي مربوط بـ themeConfig.success.sections (يتحرر من ThemeEdit → Success tab)
// ============================================================

import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import StoreNavbar from "../components/StoreNavbar";
import StoreFooter from "../components/StoreFooter";

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

// ── SectionWrapper — نفس مبدأ ProductDetails، كيبعث SECTION_CLICK للـ ThemeEdit فـ preview ──
function SectionWrapper({ type, isPreview, isHighlighted, children, style = {} }) {
  if (!isPreview) return <div style={style} data-section={type}>{children}</div>;
  const handleClick = () => window.parent.postMessage({ type: "SECTION_CLICK", sectionType: type }, "*");
  return (
    <div
      style={{ position: "relative", ...style, cursor: "pointer", outline: isHighlighted ? "2px solid #7c6df2" : "none", outlineOffset: -2 }}
      data-section={type}
      onClick={handleClick}
    >
      {isHighlighted && (
        <div style={{
          position: "absolute", top: 8, insetInlineStart: 8, zIndex: 20,
          background: "#7c6df2", color: "#fff", fontSize: 11, fontWeight: 700,
          padding: "3px 10px", borderRadius: 6, pointerEvents: "none",
          fontFamily: "'Inter', sans-serif", letterSpacing: ".3px", whiteSpace: "nowrap",
          boxShadow: "0 2px 8px rgba(124,109,242,.35)",
        }}>
          {SECTION_LABELS[type] || type}
        </div>
      )}
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

  // ── Live theme من الـ builder (postMessage) ──
  const [themeConfig, setThemeConfig] = useState(null);
  const [highlightedSection, setHighlightedSection] = useState(null);

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
    <div dir="rtl" style={{ minHeight: "100vh", background: bgColor, color: textColor, fontFamily: `'${font}', 'Cairo', sans-serif`, direction }}>
      <style>{`
        @keyframes os-checkPop {
          0%   { transform: scale(0) rotate(-10deg); opacity: 0; }
          60%  { transform: scale(1.15) rotate(4deg); opacity: 1; }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }
        @keyframes os-fadeUp { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes os-marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        .os-check-circle { opacity: 0; }
        .os-check-circle.visible { opacity: 1; animation: os-checkPop .55s cubic-bezier(.34,1.56,.64,1) forwards; }
        .os-details { opacity: 0; }
        .os-details.visible { opacity: 1; animation: os-fadeUp .5s ease forwards; }
        .os-btn:hover { filter: brightness(0.94); }
        .os-marquee-track { animation: os-marquee 18s linear infinite; }
      `}</style>

      {/* ── Announcement Bar (مشترك مع Home) ── */}
      {announcementSec?.enabled !== false && announcementSec?.settings && (
        <SectionWrapper type="announcement" isPreview={isPreview} isHighlighted={highlightedSection === "announcement"}>
          <div style={{ background: announcementSec.settings.bgColor, borderBottom: "1px solid rgba(0,0,0,.1)", overflow: "hidden", padding: "9px 0", position: "relative" }}>
            {announcementSec.settings.animation ? (
              <div className="os-marquee-track" style={{ display: "flex", width: "max-content" }}>
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

      {/* ── Navbar ── */}
      <SectionWrapper type="header" isPreview={isPreview} isHighlighted={highlightedSection === "header"}>
        <StoreNavbar
          store={store}
          slug={slug}
          headerSettings={headerSettings}
          themeColors={{ primary, bgColor, surfaceColor, textColor, mutedTextColor, borderColor }}
        />
      </SectionWrapper>

      {/* ── Success Message ── */}
      <SectionWrapper type="successMessage" isPreview={isPreview} isHighlighted={highlightedSection === "successMessage"}>
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
      <SectionWrapper type="footer" isPreview={isPreview} isHighlighted={highlightedSection === "footer"}>
        <StoreFooter store={store} slug={slug} bgColor={surfaceColor} textColor={textColor} mutedColor={mutedTextColor} light={surfaceColor === "#ffffff"} settings={footerSettings} />
      </SectionWrapper>
    </div>
  );
}

export default OrderSuccess;