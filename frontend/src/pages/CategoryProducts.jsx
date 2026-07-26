// ============================================================
// 📁 pages/CategoryProducts.jsx — منتجات تصنيف معين
// Route: /store/:slug/collections/:categoryId
// ============================================================
import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import StoreNavbar from "../components/StoreNavbar";
import StoreFooter from "../components/StoreFooter";

const API = () => import.meta.env.VITE_API_URL;
const DEFAULT_IMG = "https://placehold.co/600x400/f9fafb/94a3b8?text=No+Image";

// ── DEFAULTS — نفس القيم الافتراضية ديال ThemeEdit (Home sections + Category Banner) ──
const DEFAULT_HOME_SECTIONS = [
  { id: "announcement", type: "announcement", enabled: true, settings: { message: "توصيل لجميع ولايات الجزائر 🇩🇿 · الدفع عند الاستلام 💰", bgColor: "#111827", textColor: "#ffffff", animation: true, showClose: false } },
  { id: "header",       type: "header",       enabled: true, settings: { showSearch: true, showCart: true, sticky: true } },
  { id: "footer",       type: "footer",       enabled: true, settings: { copyright: "", showNewsletter: true, termsText: "الشروط والسياسات", showSocials: true, socials: {} } },
];
const DEFAULT_CATEGORY_SECTIONS = [
  { id: "categoryBanner", type: "categoryBanner", enabled: true, settings: { style: "overlay", showProductCount: true } },
  // ✦ نفس section الـ Collection ديال Home — كيتحكم فـ شكل شبكة المنتجات هنا (id فريد: categoryCollection)
  { id: "categoryCollection", type: "collection", enabled: true, settings: {
      title: "منتجات", titleAlign: "right", selectionMode: "all", productsShown: 8, carouselMode: false,
      columns: 3, cardStyle: "default", imageRatio: "1:1", showBadge: true, showRating: false,
      showViewAll: false, viewAllText: "عرض الكل", viewAllStyle: "link", infiniteScroll: false,
  } },
];
const DEFAULT_STYLES = {
  primaryColor: "#2563eb", secondaryColor: "#0f172a", backgroundColor: "#ffffff",
  surfaceColor: "#fafafa", textColor: "#111111", mutedTextColor: "#666666",
  borderColor: "#ebebeb", fontFamily: "Cairo", direction: "rtl",
};

const sec = (arr, type) => (arr || []).find(s => s.type === type);

function loadFont(font) {
  const id = `font-${font}`;
  if (document.getElementById(id)) return;
  const link = document.createElement("link");
  link.id = id; link.rel = "stylesheet";
  link.href = `https://fonts.googleapis.com/css2?family=${font.replace(/ /g,"+")}:wght@400;600;700;800;900&display=swap`;
  document.head.appendChild(link);
}

const IconCart = () => (
  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24">
    <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/>
  </svg>
);
const IconWA = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="white">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 00-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

const SECTION_LABELS = { announcement: "Announcement Bar", header: "Header", categoryBanner: "Category Banner", collection: "Collection", footer: "Footer" };

// ── SectionWrapper — نفس منطق ProductDetails/PublicStore: label + border + كليك يبعث للـ builder ──
function SectionWrapper({ type, isPreview, isHighlighted, children, style = {}, className = "" }) {
  if (!isPreview) return <div style={style} data-section={type} className={className || undefined}>{children}</div>;
  const handleClick = () => window.parent.postMessage({ type: "SECTION_CLICK", sectionType: type }, "*");
  return (
    <div
      style={{ position: "relative", ...style, cursor: "pointer" }}
      data-section={type}
      onClick={handleClick}
      className={`cp-section-wrapper${isHighlighted ? " cp-section-wrapper--highlighted" : ""}${className ? ` ${className}` : ""}`}
    >
      {isHighlighted && <div className="cp-section-label">{SECTION_LABELS[type] || type}</div>}
      {children}
    </div>
  );
}

export default function CategoryProducts() {
  const { slug, categoryId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const isPreview = new URLSearchParams(location.search).get("preview") === "1";

  const [store,    setStore]    = useState(null);
  const [category, setCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [sort,     setSort]     = useState("newest");

  // ── Collection grid — infinite scroll ──
  const loadMoreRef = useRef(null);
  const [visibleCount, setVisibleCount] = useState(null);

  // ── Live theme من الـ builder (postMessage) ──
  const [themeConfig, setThemeConfig] = useState(null);
  const [highlightedSection, setHighlightedSection] = useState(null);

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
    return () => window.removeEventListener("message", handler);
  }, []);

  // ── الإعدادات الفعلية — من postMessage إذا preview، وإلا من store.themeConfig، وإلا defaults ──
  const rawTc         = themeConfig || store?.themeConfig || null;
  const homeSections  = rawTc?.sections || DEFAULT_HOME_SECTIONS;
  const catSections    = rawTc?.category?.sections || DEFAULT_CATEGORY_SECTIONS;

  const announcementSec = sec(homeSections, "announcement");
  const headerSettings  = sec(homeSections, "header")?.settings;
  const bannerSettings  = sec(catSections, "categoryBanner")?.settings || DEFAULT_CATEGORY_SECTIONS[0].settings;
  const bannerStyle     = bannerSettings.style || "overlay";
  const showCount       = bannerSettings.showProductCount !== false;
  const collectionSec   = sec(catSections, "collection");
  const collSettings    = collectionSec?.settings || DEFAULT_CATEGORY_SECTIONS[1].settings;

  // ── ألوان الثيم (Styles tab) — نفس منطق PublicStore/ProductDetails ──
  const styles       = rawTc?.styles || DEFAULT_STYLES;
  const primary       = styles.primaryColor    || store?.primaryColor || "#111827";
  const bgColor        = styles.backgroundColor || "#ffffff";
  const surfaceColor  = styles.surfaceColor    || "#fafafa";
  const textColor     = styles.textColor       || "#111111";
  const mutedTextColor = styles.mutedTextColor || "#666666";
  const borderColor    = styles.borderColor    || "#ebebeb";
  const font    = store?.fontFamily   || "Cairo";

  useEffect(() => { loadFont("Cairo"); }, []);
  useEffect(() => { if (font) loadFont(font); }, [font]);

  useEffect(() => {
    if (!slug || !categoryId) return;
    (async () => {
      try {
        const sr = await fetch(`${API()}/api/stores/public/${slug}`);
        const sd = await sr.json();
        if (sd.store) {
          setStore(sd.store);
          // find category
          const cr = await fetch(`${API()}/api/categories/public/${sd.store._id}`);
          const cd = await cr.json();
          if (Array.isArray(cd)) {
            const found = cd.find(c => c._id === categoryId);
            if (found) setCategory(found);
          }
          // filter products by category
          if (Array.isArray(sd.products)) {
            const filtered = sd.products.filter(p => {
              const cid = p.categoryId?._id ? String(p.categoryId._id) : p.categoryId ? String(p.categoryId) : null;
              return cid === categoryId;
            });
            setProducts(filtered);
          }
        }
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    })();
  }, [slug, categoryId]);

  // Sort
  const sorted = [...products].sort((a, b) => {
    if (sort === "newest")   return new Date(b.createdAt) - new Date(a.createdAt);
    if (sort === "price_asc")  return a.currentPrice - b.currentPrice;
    if (sort === "price_desc") return b.currentPrice - a.currentPrice;
    return 0;
  });

  // ✦ Infinite Scroll — يحمّل المزيد كل ما يوصل المستخدم للـ sentinel (نفس منطق PublicStore)
  useEffect(() => {
    if (!collSettings.infiniteScroll || !loadMoreRef.current) return;
    const productsShown = collSettings.productsShown || 8;
    const el = loadMoreRef.current;
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        setVisibleCount(prev => Math.min((prev || productsShown) + productsShown, sorted.length));
      }
    }, { rootMargin: "200px" });
    observer.observe(el);
    return () => observer.disconnect();
  }, [collSettings.infiniteScroll, collSettings.productsShown, sorted.length, visibleCount]);

  // ✦ نرجّعو عداد العرض لقيمته الأصلية كي يتبدل الترتيب
  useEffect(() => { setVisibleCount(null); }, [sort]);

  const phone = store?.whatsappNumber || "";
  const categoryImg  = category?.image || "";
  const categoryName = category?.name || "التصنيف";

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: 32, height: 32, border: "3px solid #f0f0f0", borderTopColor: "#111", borderRadius: "50%", animation: "cp2-spin .7s linear infinite" }} />
      <style>{`@keyframes cp2-spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  return (
    <div dir="rtl" style={{ minHeight: "100vh", background: "#fff", fontFamily: `'${font}','Cairo',sans-serif`, color: "#111" }}>

      <style>{`
        .cp-section-wrapper { position: relative; }
        .cp-section-wrapper--highlighted { outline: 2px solid #2563eb; outline-offset: -2px; }
        .cp-section-label {
          position: fixed; top: 8px; left: 8px; z-index: 9999;
          background: #2563eb; color: #fff; font-size: 11px; font-weight: 700;
          padding: 3px 10px; border-radius: 6px; pointer-events: none;
          font-family: 'Inter', sans-serif; letter-spacing: .3px; white-space: nowrap;
          box-shadow: 0 2px 8px rgba(37,99,235,.35);
        }
        @keyframes ps-marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        .ps-marquee-track { animation: ps-marquee 18s linear infinite; }
      `}</style>

      {/* ── Announcement Bar (مشترك مع Home) ── */}
      {announcementSec?.enabled !== false && announcementSec?.settings && (() => {
        const { message, bgColor, textColor, animation, showClose } = announcementSec.settings;
        return (
          <SectionWrapper type="announcement" isPreview={isPreview} isHighlighted={highlightedSection === "announcement"}>
            <div style={{ background: bgColor, borderBottom: "1px solid rgba(0,0,0,.1)", overflow: "hidden", padding: "9px 0", position: "relative" }}>
              {animation ? (
                <div className="ps-marquee-track" style={{ display: "flex", gap: 64, width: "max-content" }}>
                  {[...Array(6)].map((_, i) => (
                    <span key={i} style={{ fontSize: 12, fontWeight: 600, letterSpacing: 1.5, color: textColor, whiteSpace: "nowrap" }}>
                      {message}
                    </span>
                  ))}
                </div>
              ) : (
                <p style={{ textAlign: "center", fontSize: 12, fontWeight: 600, color: textColor, margin: 0, letterSpacing: 1 }}>{message}</p>
              )}
              {showClose && (
                <button onClick={e => e.currentTarget.parentElement.style.display = "none"}
                  style={{ position: "absolute", top: "50%", left: 12, transform: "translateY(-50%)", background: "none", border: "none", color: textColor, cursor: "pointer", fontSize: 16, opacity: .7 }}>✕</button>
              )}
            </div>
          </SectionWrapper>
        );
      })()}

      {/* ── Navbar ── */}
      <SectionWrapper type="header" isPreview={isPreview} isHighlighted={highlightedSection === "header"}>
        <StoreNavbar
          store={store}
          slug={slug}
          headerSettings={headerSettings}
        />
      </SectionWrapper>

      {/* ── Breadcrumb ── */}
      <div style={{ maxWidth: 960, margin: "0 auto", padding: "16px 24px 0", display: "flex", alignItems: "center", gap: 8 }}>
        <button onClick={() => navigate(`/store/${slug}/collections`)} style={{ background: "none", border: "none", color: "#888", fontSize: 13, cursor: "pointer", fontFamily: "inherit", padding: 0 }}>
          التشكيلات
        </button>
        <span style={{ color: "#ccc" }}>›</span>
        <span style={{ color: "#111", fontSize: 13, fontWeight: 600 }}>{categoryName}</span>
      </div>

      {/* ── Category Banner (Overlay أو Compact) ── */}
      <SectionWrapper type="categoryBanner" isPreview={isPreview} isHighlighted={highlightedSection === "categoryBanner"}>
        {bannerStyle === "compact" ? (
          /* ══════ Compact — صورة دائرية مضغوطة + الاسم جنبها ══════ */
          <div style={{ maxWidth: 960, margin: "0 auto", padding: "20px 24px", display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ width: 64, height: 64, borderRadius: "50%", overflow: "hidden", background: "#f3f4f6", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
              {categoryImg
                ? <img src={categoryImg} alt={categoryName} onError={e => { e.target.style.display = "none"; }} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                : <span style={{ fontSize: 22 }}>🗂️</span>}
            </div>
            <div>
              <h1 style={{ fontSize: "clamp(1.2rem,3vw,1.7rem)", fontWeight: 900, color: "#111", margin: "0 0 4px", letterSpacing: -0.5 }}>{categoryName}</h1>
              {showCount && <p style={{ color: "#888", fontSize: 13, margin: 0 }}>{sorted.length} منتج</p>}
            </div>
          </div>
        ) : (
          /* ══════ Overlay — صورة كاملة العرض + تعتيم + الاسم فوقها ══════ */
          <div style={{ position: "relative", height: "clamp(180px,28vw,320px)", background: "#f3f4f6", marginTop: 20 }}>
            {categoryImg && (
              <img src={categoryImg} alt={categoryName} onError={e => { e.target.style.opacity = 0; }} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
            )}
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,.55), rgba(0,0,0,.05) 60%)" }} />
            <div style={{ position: "absolute", bottom: 20, right: 24, left: 24 }}>
              <h1 style={{ fontSize: "clamp(1.6rem,4vw,2.4rem)", fontWeight: 900, color: "#fff", margin: "0 0 4px", letterSpacing: -1 }}>{categoryName}</h1>
              {showCount && <p style={{ color: "rgba(255,255,255,.85)", fontSize: 13, margin: 0 }}>{sorted.length} منتج</p>}
            </div>
          </div>
        )}
      </SectionWrapper>

      {/* ── Sort ── */}
      <div style={{ maxWidth: 960, margin: "0 auto", padding: "20px 24px 0", display: "flex", justifyContent: "flex-end" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 13, color: "#888" }}>الترتيب حسب:</span>
          {[
            { val: "newest",     label: "أحدثاً" },
            { val: "price_asc",  label: "الثمن ↑" },
            { val: "price_desc", label: "الثمن ↓" },
          ].map(s => (
            <button key={s.val} onClick={() => setSort(s.val)} style={{
              padding: "6px 13px", borderRadius: 8,
              border: `1px solid ${sort === s.val ? primary : "#e5e7eb"}`,
              background: sort === s.val ? primary : "#fff",
              color: sort === s.val ? "#fff" : "#555",
              fontSize: 12, fontWeight: 600, cursor: "pointer",
              fontFamily: "inherit", transition: "all .15s",
            }}>{s.label}</button>
          ))}
        </div>
      </div>

      {/* ── Products Grid (Collection section) — نفس تصميم PublicStore بالضبط ── */}
      {collectionSec?.enabled !== false && (() => {
        const carouselMode   = !!collSettings.carouselMode;
        const columns         = collSettings.columns || 3;
        const imageRatio      = collSettings.imageRatio || "1:1";
        const cardStyle       = collSettings.cardStyle || "default";
        const showBadge       = collSettings.showBadge !== false;
        const showRating      = !!collSettings.showRating;
        const showViewAll     = collSettings.showViewAll;
        const viewAllText     = collSettings.viewAllText || "عرض الكل";
        const viewAllStyle    = collSettings.viewAllStyle || "link";
        const infiniteScroll  = !!collSettings.infiniteScroll;
        const productsShown   = collSettings.productsShown || 8;

        const effectiveCount  = infiniteScroll ? (visibleCount || productsShown) : productsShown;
        const visibleProducts = carouselMode ? sorted : sorted.slice(0, effectiveCount);
        const aspectMap = { "1:1": "1/1", "3:4": "3/4" };

        // ✦ Card style presets — Default | Minimal | Bordered (نفس presets ديال PublicStore)
        const CARD_STYLE_MAP = {
          default:  { cardBorder: "none", cardPadding: 0, imgRadius: 14, titleSize: 14, priceSize: 16, gap: 8 },
          minimal:  { cardBorder: "none", cardPadding: 0, imgRadius: 6,  titleSize: 13, priceSize: 14, gap: 6 },
          bordered: { cardBorder: `1px solid ${borderColor}`, cardPadding: 8, imgRadius: 12, titleSize: 14, priceSize: 16, gap: 8 },
        };
        const cardStyleCfg = CARD_STYLE_MAP[cardStyle] || CARD_STYLE_MAP.default;

        const viewAllBtnStyle = {
          link:    { background: "none", color: primary, border: "none", textDecoration: "underline" },
          filled:  { background: primary, color: "#fff", border: "none" },
          outline: { background: "none", color: primary, border: `1px solid ${primary}` },
        }[viewAllStyle];

        return (
        <SectionWrapper type="collection" isPreview={isPreview} isHighlighted={highlightedSection === "collection"}>
        <div style={{ maxWidth: 960, margin: "0 auto", padding: "16px 24px 80px" }}>
          <div style={{
            display: "flex", alignItems: "center", marginBottom: 20, gap: 12,
            justifyContent: (collSettings.titleAlign || "right") === "center" ? "center" : "space-between",
            flexDirection: (collSettings.titleAlign || "right") === "left" ? "row-reverse" : "row",
          }}>
            <h2 style={{ fontSize: "clamp(1.2rem,3vw,1.5rem)", fontWeight: 800, color: textColor, margin: 0, textAlign: collSettings.titleAlign || "right" }}>
              {collSettings.title || "منتجات"}
            </h2>
            {(collSettings.titleAlign || "right") !== "center" && (
              <span style={{ fontSize: 13, color: mutedTextColor, background: surfaceColor, border: `1px solid ${borderColor}`, padding: "5px 14px", borderRadius: 50 }}>
                {sorted.length} منتج
              </span>
            )}
          </div>

          {sorted.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 0", color: "#ccc" }}>
              <p style={{ fontSize: 40 }}>📦</p>
              <p style={{ color: "#aaa", fontSize: 14 }}>لا توجد منتجات في هذا التصنيف</p>
            </div>
          ) : (
            <div
              className="cp-coll-grid"
              data-cols={columns}
              data-carousel={carouselMode ? "1" : "0"}
              style={carouselMode ? {
                display: "flex", gap: 20, overflowX: "auto", scrollSnapType: "x mandatory", paddingBottom: 8,
              } : {
                display: "grid", gridTemplateColumns: `repeat(${columns}, 1fr)`, gap: 20,
              }}
            >
              {visibleProducts.map((product, idx) => {
                const img        = product.images?.[0] || product.image || DEFAULT_IMG;
                const outOfStock = product.stock === 0;
                return (
                  <div
                    key={product._id}
                    className="cp-card"
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
                    onClick={() => navigate(`/store/${slug}/product/${product._id}`)}
                  >
                    {/* Image */}
                    <div style={{
                      position: "relative", overflow: "hidden", background: surfaceColor,
                      borderRadius: cardStyleCfg.imgRadius,
                      ...(imageRatio === "adapt" ? {} : { aspectRatio: aspectMap[imageRatio] || "1/1" }),
                    }}>
                      <img
                        src={img}
                        alt={product.name}
                        onError={e => { e.target.onerror = null; e.target.src = DEFAULT_IMG; }}
                        style={{ width: "100%", height: imageRatio === "adapt" ? "auto" : "100%", display: "block", objectFit: "cover", transition: "transform .5s ease" }}
                        onMouseEnter={e => e.target.style.transform = "scale(1.06)"}
                        onMouseLeave={e => e.target.style.transform = "scale(1)"}
                      />
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
                      {!outOfStock && product.stock <= 5 && (
                        <span style={{
                          position: "absolute", top: 12, left: 12,
                          background: "rgba(245,158,11,.9)", color: "#fff",
                          fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 99,
                        }}>⚠️ آخر {product.stock} قطع</span>
                      )}
                      {!outOfStock && (
                        <div
                          className="cp-card-cta"
                          style={{ position: "absolute", left: 10, right: 10, bottom: 10 }}
                        >
                          <button
                            onClick={e => { e.stopPropagation(); navigate(`/store/${slug}/product/${product._id}`); }}
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

                    {/* Info */}
                    <div style={{ padding: `${cardStyleCfg.gap}px 2px 0`, display: "flex", flexDirection: "column" }}>
                      <p style={{ fontSize: cardStyleCfg.titleSize, fontWeight: 700, color: textColor, margin: `0 0 ${cardStyleCfg.gap - 2}px`, lineHeight: 1.4 }}>
                        {product.name}
                      </p>
                      {showRating && (
                        <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 6 }}>
                          <span style={{ fontSize: 12, fontWeight: 700, color: "#f59e0b" }}>5.0</span>
                          <span style={{ fontSize: 12, color: "#f59e0b", letterSpacing: 1 }}>★★★★★</span>
                        </div>
                      )}
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
          )}

          {/* ✦ Infinite scroll sentinel */}
          {!carouselMode && infiniteScroll && effectiveCount < sorted.length && (
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
        </div>
        </SectionWrapper>
        );
      })()}

      {/* Collection grid responsive overrides — نفس منطق PublicStore */}
      <style>{`
        @media (max-width: 900px) {
          .cp-coll-grid[data-carousel="0"][data-cols="4"],
          .cp-coll-grid[data-carousel="0"][data-cols="3"] { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 480px) {
          .cp-coll-grid[data-carousel="0"] { grid-template-columns: repeat(1, 1fr) !important; }
          .cp-coll-grid[data-carousel="1"] > * { flex: 0 0 80% !important; }
        }
        .cp-card { transition: transform .25s ease, box-shadow .25s ease; }
        .cp-card:hover { transform: translateY(-4px); }
        .cp-card-cta { opacity: 0; transform: translateY(8px); transition: opacity .22s ease, transform .22s ease; }
        .cp-card:hover .cp-card-cta { opacity: 1; transform: translateY(0); }
        @media (hover: none) {
          .cp-card-cta { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* ── Footer ── */}
      <SectionWrapper type="footer" isPreview={isPreview} isHighlighted={highlightedSection === "footer"}>
        <StoreFooter store={store} slug={slug} bgColor={surfaceColor} textColor={textColor} light={surfaceColor === "#ffffff"} settings={sec(homeSections, "footer")?.settings} />
      </SectionWrapper>

      {/* WhatsApp */}
      {phone && (
        <a href={`https://wa.me/${phone}`} target="_blank" rel="noreferrer"
          style={{ position: "fixed", bottom: 24, left: 24, zIndex: 999, width: 52, height: 52, borderRadius: "50%", background: "#25D366", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 20px rgba(37,211,102,.4)", transition: "transform .2s" }}
          onMouseEnter={e => e.currentTarget.style.transform = "scale(1.1)"}
          onMouseLeave={e => e.currentTarget.style.transform = "none"}
        ><IconWA /></a>
      )}
    </div>
  );
}