// ============================================================
// 📁 pages/SearchResults.jsx — نتائج البحث عن منتج (theme-driven)
// Route: /store/:slug/search?q=...
// Sections: Announcement · Header · Collection (grid قابل للتحكم) · Footer
// ============================================================
import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate, useSearchParams, useLocation } from "react-router-dom";
import StoreNavbar from "../components/StoreNavbar";
import StoreFooter from "../components/StoreFooter";
import CartDrawer from "../components/CartDrawer";
import { useCart } from "../context/CartContext";

const API = () => import.meta.env.VITE_API_URL;
const DEFAULT_IMG = "https://placehold.co/600x400/f9fafb/94a3b8?text=No+Image";

// ── DEFAULTS — نفس القيم الافتراضية ديال ThemeEdit ──
const DEFAULT_HOME_SECTIONS = [
  { id: "announcement", type: "announcement", enabled: true, settings: { message: "توصيل لجميع ولايات الجزائر 🇩🇿 · الدفع عند الاستلام 💰", bgColor: "#111827", textColor: "#ffffff", animation: true, showClose: false } },
  { id: "header",       type: "header",       enabled: true, settings: { showSearch: true, showCart: true, sticky: true } },
  { id: "footer",       type: "footer",       enabled: true, settings: { copyright: "", showNewsletter: true, termsText: "الشروط والسياسات", showSocials: true, socials: {} } },
];
// ✦ نفس section الـ Collection — بلا Selection Mode / Carousel / View All (نتائج البحث ديما كاملة)
const DEFAULT_SEARCH_SECTIONS = [
  { id: "searchCollection", type: "collection", enabled: true, settings: {
      title: "نتائج البحث", titleAlign: "right",
      productsShown: 12, columns: 3, cardStyle: "default", imageRatio: "1:1",
      showBadge: true, showRating: false, infiniteScroll: false,
  } },
];
const DEFAULT_STYLES = {
  primaryColor: "#2563eb", secondaryColor: "#0f172a", backgroundColor: "#ffffff",
  surfaceColor: "#fafafa", textColor: "#111111", mutedTextColor: "#666666",
  borderColor: "#ebebeb", fontFamily: "Cairo", direction: "rtl",
};

const sec = (arr, type) => (arr || []).find(s => s.type === type);

// ── منتجات وهمية عامة — تُستعمل فقط فـ preview إذا مازال المتجر بلا أي منتج حقيقي ──
const PLACEHOLDER_PRODUCTS = [1, 2, 3, 4].map(n => ({
  _id: `placeholder-${n}`,
  name: `منتج تجريبي ${n}`,
  currentPrice: 2000 + n * 300,
  oldPrice: null,
  stock: 10,
  images: [],
  __placeholder: true,
}));

function loadFont(font) {
  const id = `font-${font}`;
  if (document.getElementById(id)) return;
  const link = document.createElement("link");
  link.id = id; link.rel = "stylesheet";
  link.href = `https://fonts.googleapis.com/css2?family=${font.replace(/ /g,"+")}:wght@400;600;700;800;900&display=swap`;
  document.head.appendChild(link);
}

// ── اسماء الـ sections للـ label ──
const SECTION_LABELS = {
  announcement: "Announcement Bar",
  header:       "Header",
  collection:   "Search Results",
  footer:       "Footer",
};

// ── CSS للـ preview overlays — نفس منطق PublicStore/CategoryProducts (hover + selected) ──
const PREVIEW_CSS = `
.sr-section-wrapper { position: relative; }
.sr-section-wrapper:hover::after { content: ""; position: absolute; inset: 0; border: 2px dashed rgba(124,109,242,.55); background: rgba(124,109,242,.05); pointer-events: none; z-index: 140; }
.sr-section-wrapper--highlighted::after { content: ""; position: absolute; inset: 0; border: 2px solid #7c6df2; background: rgba(124,109,242,.10); pointer-events: none; z-index: 140; }
.sr-section-label {
  position: absolute; top: 8px; left: 8px; z-index: 150;
  background: #7c6df2; color: #fff; font-size: 11px; font-weight: 700;
  padding: 3px 10px; border-radius: 6px; pointer-events: none;
  font-family: 'Inter', sans-serif; letter-spacing: .3px; white-space: nowrap;
  box-shadow: 0 2px 8px rgba(124,109,242,.35);
  opacity: 0; transition: opacity .12s ease;
}
.sr-section-wrapper:hover .sr-section-label,
.sr-section-wrapper--highlighted .sr-section-label { opacity: 1; }
`;

function injectPreviewCSS() {
  if (document.getElementById("sr-preview-styles")) return;
  const s = document.createElement("style");
  s.id = "sr-preview-styles";
  s.textContent = PREVIEW_CSS;
  document.head.appendChild(s);
}

// ── SectionWrapper — نفس منطق CategoryProducts/ProductDetails ──
function SectionWrapper({ type, isPreview, isHighlighted, children, style = {} }) {
  if (!isPreview) return <div style={style} data-section={type}>{children}</div>;
  const handleClick = () => window.parent.postMessage({ type: "SECTION_CLICK", sectionType: type }, "*");
  return (
    <div
      style={{ position: "relative", ...style, cursor: "pointer" }}
      data-section={type}
      onClick={handleClick}
      className={`sr-section-wrapper${isHighlighted ? " sr-section-wrapper--highlighted" : ""}`}
    >
      <div className="sr-section-label">{SECTION_LABELS[type] || type}</div>
      {children}
    </div>
  );
}

export default function SearchResults() {
  const { slug } = useParams();
  const navigate  = useNavigate();
  const location  = useLocation();
  const [params]  = useSearchParams();
  const q         = params.get("q") || "";
  const isPreview = params.get("preview") === "1";

  const [store,    setStore]    = useState(null);
  const [products, setProducts] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const { getCartCount } = useCart();
  const [cartOpen, setCartOpen] = useState(false);

  // ── Infinite scroll ──
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
  const rawTc          = themeConfig || store?.themeConfig || null;
  const homeSections    = rawTc?.sections || DEFAULT_HOME_SECTIONS;
  const searchSections  = rawTc?.search?.sections || DEFAULT_SEARCH_SECTIONS;

  const announcementSec = sec(homeSections, "announcement");
  const headerSettings  = sec(homeSections, "header")?.settings;
  const collectionSec   = sec(searchSections, "collection");
  const collSettings    = collectionSec?.settings || DEFAULT_SEARCH_SECTIONS[0].settings;

  const styles          = rawTc?.styles || DEFAULT_STYLES;
  const primary         = styles.primaryColor    || "#2563eb";
  const bgColor         = styles.backgroundColor || "#ffffff";
  const surfaceColor    = styles.surfaceColor    || "#fafafa";
  const textColor       = styles.textColor       || "#111111";
  const mutedTextColor  = styles.mutedTextColor  || "#666666";
  const borderColor     = styles.borderColor     || "#ebebeb";
  const font            = styles.fontFamily      || "Cairo";
  const direction       = styles.direction       || "rtl";

  useEffect(() => { loadFont("Cairo"); injectPreviewCSS(); }, []);
  useEffect(() => { if (font) loadFont(font); }, [font]);

  // ── جلب المتجر — وفـ preview نستعمل منتجاته الحقيقية كمثال للنتائج، بلا اعتماد على q ──
  useEffect(() => {
    if (!slug) { setLoading(false); return; }
    (async () => {
      try {
        const sr = await fetch(`${API()}/api/stores/public/${slug}`);
        const sd = await sr.json();
        if (sd.store) {
          setStore(sd.store);
          if (isPreview) {
            const realProducts = Array.isArray(sd.products) ? sd.products : [];
            setProducts(realProducts.length ? realProducts : PLACEHOLDER_PRODUCTS);
          } else if (q.trim()) {
            const pr = await fetch(`${API()}/api/products/search/${sd.store._id}?q=${encodeURIComponent(q.trim())}`);
            const pd = await pr.json();
            if (Array.isArray(pd)) setProducts(pd);
          } else {
            setProducts([]);
          }
        }
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    })();
  }, [slug, q, isPreview]);

  // ✦ Infinite Scroll
  useEffect(() => {
    if (!collSettings.infiniteScroll || !loadMoreRef.current) return;
    const productsShown = collSettings.productsShown || 12;
    const el = loadMoreRef.current;
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        setVisibleCount(prev => Math.min((prev || productsShown) + productsShown, products.length));
      }
    }, { rootMargin: "200px" });
    observer.observe(el);
    return () => observer.disconnect();
  }, [collSettings.infiniteScroll, collSettings.productsShown, products.length]);

  useEffect(() => { setVisibleCount(null); }, [q]);

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: 32, height: 32, border: "3px solid #f0f0f0", borderTopColor: "#111", borderRadius: "50%", animation: "sr-spin .7s linear infinite" }} />
      <style>{`@keyframes sr-spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  const columns        = collSettings.columns || 3;
  const imageRatio     = collSettings.imageRatio || "1:1";
  const cardStyle      = collSettings.cardStyle || "default";
  const showBadge      = collSettings.showBadge !== false;
  const showRating     = !!collSettings.showRating;
  const infiniteScroll = !!collSettings.infiniteScroll;
  const productsShown  = collSettings.productsShown || 12;
  const effectiveCount = infiniteScroll ? (visibleCount || productsShown) : productsShown;
  const visibleProducts = products.slice(0, effectiveCount);
  const aspectMap = { "1:1": "1/1", "3:4": "3/4" };

  const CARD_STYLE_MAP = {
    default:  { cardBorder: "none", cardPadding: 0, imgRadius: 14, titleSize: 14, priceSize: 16, gap: 8 },
    minimal:  { cardBorder: "none", cardPadding: 0, imgRadius: 6,  titleSize: 13, priceSize: 14, gap: 6 },
    bordered: { cardBorder: `1px solid ${borderColor}`, cardPadding: 8, imgRadius: 12, titleSize: 14, priceSize: 16, gap: 8 },
  };
  const cardStyleCfg = CARD_STYLE_MAP[cardStyle] || CARD_STYLE_MAP.default;

  return (
    <div dir={direction} style={{ minHeight: "100vh", background: bgColor, fontFamily: `'${font}','Cairo',sans-serif`, color: textColor, direction }}>
      <style>{`
        @keyframes ps-marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        .ps-marquee-track { animation: ps-marquee 18s linear infinite; }
        .sr-card { transition: transform .25s ease, box-shadow .25s ease; }
        .sr-card:hover { transform: translateY(-4px); }
        .sr-card-cta { opacity: 0; transform: translateY(8px); transition: opacity .22s ease, transform .22s ease; }
        .sr-card:hover .sr-card-cta { opacity: 1; transform: translateY(0); }
        @media (hover: none) { .sr-card-cta { opacity: 1; transform: translateY(0); } }
        @media (max-width: 900px) {
          .sr-grid[data-cols="4"], .sr-grid[data-cols="3"] { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 480px) {
          .sr-grid { grid-template-columns: repeat(1, 1fr) !important; }
        }
      `}</style>

      {/* ── Announcement Bar (مشترك مع Home) ── */}
      {announcementSec?.enabled !== false && announcementSec?.settings && (() => {
        const { message, bgColor: abg, textColor: atx, animation, showClose } = announcementSec.settings;
        return (
          <SectionWrapper type="announcement" isPreview={isPreview} isHighlighted={highlightedSection === "announcement"}>
            <div style={{ background: abg, overflow: "hidden", padding: "9px 0", position: "relative" }}>
              {animation ? (
                <div className="ps-marquee-track" style={{ display: "flex", gap: 64, width: "max-content" }}>
                  {[...Array(6)].map((_, i) => (
                    <span key={i} style={{ fontSize: 12, fontWeight: 600, letterSpacing: 1.5, color: atx, whiteSpace: "nowrap" }}>{message}</span>
                  ))}
                </div>
              ) : (
                <p style={{ textAlign: "center", fontSize: 12, fontWeight: 600, color: atx, margin: 0, letterSpacing: 1 }}>{message}</p>
              )}
              {showClose && (
                <button onClick={e => e.currentTarget.parentElement.style.display = "none"}
                  style={{ position: "absolute", top: "50%", left: 12, transform: "translateY(-50%)", background: "none", border: "none", color: atx, cursor: "pointer", fontSize: 16, opacity: .7 }}>✕</button>
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
          themeColors={{ primary, bgColor, surfaceColor, textColor, mutedTextColor, borderColor }}
          cartCount={getCartCount(slug)}
          onCartClick={() => setCartOpen(true)}
        />
      </SectionWrapper>

      {/* ── عنوان النتائج — نفس تصميم Home بالضبط: عنوان + badge عدد المنتجات ── */}
      <div style={{ maxWidth: 1080, margin: "0 auto", padding: "32px 24px 8px" }}>
        <div style={{
          display: "flex", alignItems: "center", gap: 12,
          justifyContent: (collSettings.titleAlign || "right") === "center" ? "center" : "space-between",
          flexDirection: (collSettings.titleAlign || "right") === "left" ? "row-reverse" : "row",
        }}>
          <h2 style={{ fontSize: "clamp(1.3rem,3vw,1.7rem)", fontWeight: 800, color: textColor, margin: 0, textAlign: collSettings.titleAlign || "right" }}>
            {collSettings.title || "نتائج البحث"}
          </h2>
          {(collSettings.titleAlign || "right") !== "center" && (
            <span style={{ fontSize: 13, color: mutedTextColor, background: surfaceColor, border: `1px solid ${borderColor}`, padding: "5px 14px", borderRadius: 50 }}>
              {products.length} منتج
            </span>
          )}
        </div>
      </div>

      {/* ── Collection grid — قابلة للتحكم كاملة (Columns / Card style / Badge / Rating...) ── */}
      <SectionWrapper type="collection" isPreview={isPreview} isHighlighted={highlightedSection === "collection"}>
        <div style={{ maxWidth: 1080, margin: "0 auto", padding: "16px 24px 80px" }}>
          {products.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 0", color: mutedTextColor }}>
              <p style={{ fontSize: 13.5 }}>{(!isPreview && !q.trim()) ? "أدخل كلمة للبحث" : "لا توجد نتائج مطابقة"}</p>
            </div>
          ) : (
            <div className="sr-grid" data-cols={columns} style={{ display: "grid", gridTemplateColumns: `repeat(${columns}, 1fr)`, gap: 20 }}>
              {visibleProducts.map(product => {
                const img        = product.images?.[0] || product.image || DEFAULT_IMG;
                const outOfStock = product.stock === 0;
                return (
                  <div
                    key={product._id}
                    className="sr-card"
                    onClick={() => !isPreview && navigate(`/store/${slug}/product/${product._id}`)}
                    style={{
                      background: "transparent",
                      border: cardStyleCfg.cardBorder,
                      borderRadius: cardStyleCfg.imgRadius + (cardStyleCfg.cardPadding ? 4 : 0),
                      padding: cardStyleCfg.cardPadding,
                      display: "flex", flexDirection: "column",
                      cursor: isPreview ? "default" : "pointer",
                      opacity: outOfStock ? 0.6 : 1,
                    }}
                  >
                    <div style={{
                      position: "relative", overflow: "hidden", background: surfaceColor,
                      borderRadius: cardStyleCfg.imgRadius,
                      ...(imageRatio === "adapt" ? {} : { aspectRatio: aspectMap[imageRatio] || "1/1" }),
                    }}>
                      <img
                        src={img} alt={product.name}
                        onError={e => { e.target.onerror = null; e.target.src = DEFAULT_IMG; }}
                        style={{ width: "100%", height: imageRatio === "adapt" ? "auto" : "100%", display: "block", objectFit: "cover", transition: "transform .5s ease" }}
                      />
                      {showBadge && product.oldPrice && !outOfStock && (
                        <span style={{ position: "absolute", top: 12, right: 12, background: "#ef4444", color: "#fff", fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 99, letterSpacing: .5 }}>
                          تخفيض
                        </span>
                      )}
                      {outOfStock && (
                        <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,.65)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <span style={{ background: "#111", color: "#fff", fontWeight: 800, fontSize: 12, padding: "6px 18px", borderRadius: 99 }}>نفد من المخزون</span>
                        </div>
                      )}
                      {!outOfStock && (
                        <div className="sr-card-cta" style={{ position: "absolute", left: 10, right: 10, bottom: 10 }}>
                          <button
                            onClick={e => { e.stopPropagation(); if (!isPreview) navigate(`/store/${slug}/product/${product._id}`); }}
                            style={{
                              width: "100%", border: "none", cursor: isPreview ? "default" : "pointer",
                              borderRadius: 12, padding: "12px 0",
                              background: primary, color: "#fff",
                              fontSize: 13.5, fontWeight: 700, fontFamily: "inherit",
                              boxShadow: "0 4px 16px rgba(0,0,0,.25)",
                            }}
                          >
                            اطلب الآن
                          </button>
                        </div>
                      )}
                    </div>

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
                          <span style={{ fontSize: 12.5, color: mutedTextColor, textDecoration: "line-through" }}>{product.oldPrice.toLocaleString()}</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {infiniteScroll && effectiveCount < products.length && (
            <div ref={loadMoreRef} style={{ height: 1 }} />
          )}
        </div>
      </SectionWrapper>

      {/* ── Footer ── */}
      <SectionWrapper type="footer" isPreview={isPreview} isHighlighted={highlightedSection === "footer"}>
        <StoreFooter store={store} slug={slug} bgColor={surfaceColor} textColor={textColor} light={surfaceColor === "#ffffff"} settings={sec(homeSections, "footer")?.settings} />
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
      />
    </div>
  );
}