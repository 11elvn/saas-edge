// ============================================================
// 📁 pages/SearchResults.jsx — نتائج البحث عن منتج
// Route: /store/:slug/search?q=...
// ============================================================
import { useEffect, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import StoreNavbar from "../components/StoreNavbar";
import StoreFooter from "../components/StoreFooter";

const API = () => import.meta.env.VITE_API_URL;
const DEFAULT_IMG = "https://placehold.co/600x400/f9fafb/94a3b8?text=No+Image";

function loadFont(font) {
  const id = `font-${font}`;
  if (document.getElementById(id)) return;
  const link = document.createElement("link");
  link.id = id; link.rel = "stylesheet";
  link.href = `https://fonts.googleapis.com/css2?family=${font.replace(/ /g,"+")}:wght@400;600;700;800;900&display=swap`;
  document.head.appendChild(link);
}

export default function SearchResults() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const q = params.get("q") || "";

  const [store,    setStore]    = useState(null);
  const [products, setProducts] = useState([]);
  const [loading,  setLoading]  = useState(true);

  const primary = store?.primaryColor || "#111827";
  const font    = store?.fontFamily   || "Cairo";
  const phone   = store?.whatsappNumber || "";

  useEffect(() => { loadFont("Cairo"); }, []);
  useEffect(() => { if (font) loadFont(font); }, [font]);

  useEffect(() => {
    if (!slug) return;
    (async () => {
      try {
        const sr = await fetch(`${API()}/api/stores/public/${slug}`);
        const sd = await sr.json();
        if (sd.store) {
          setStore(sd.store);
          if (q.trim()) {
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
  }, [slug, q]);

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: 32, height: 32, border: "3px solid #f0f0f0", borderTopColor: "#111", borderRadius: "50%", animation: "sr-spin .7s linear infinite" }} />
      <style>{`@keyframes sr-spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  return (
    <div dir="rtl" style={{ minHeight: "100vh", background: "#fff", fontFamily: `'${font}','Cairo',sans-serif`, color: "#111" }}>

      {/* ── Navbar ── */}
      <StoreNavbar
        store={store}
        slug={slug}
        links={[
          { label: "الصفحة الرئيسية", action: () => navigate(`/store/${slug}`) },
          { label: "التصنيفات",       action: () => navigate(`/store/${slug}/collections`) },
          { label: "اتصل بنا",        action: () => phone && window.open(`https://wa.me/${phone}`, "_blank") },
        ]}
      />

      {/* ── Header ── */}
      <div style={{ maxWidth: 960, margin: "0 auto", padding: "40px 24px 24px" }}>
        <h1 style={{ fontSize: "clamp(1.5rem,4vw,2.2rem)", fontWeight: 900, color: "#111", margin: "0 0 8px", letterSpacing: -1 }}>
          نتائج البحث
        </h1>
        <p style={{ color: "#888", fontSize: 14, margin: 0 }}>
          {q ? <>عن "<strong style={{ color: "#111" }}>{q}</strong>" — {products.length} منتج</> : "أدخل كلمة للبحث"}
        </p>
      </div>

      {/* ── Results Grid ── */}
      <div style={{ maxWidth: 960, margin: "0 auto", padding: "0 24px 80px" }}>
        {products.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 0", color: "#ccc" }}>
            <p style={{ fontSize: 40 }}>🔍</p>
            <p style={{ color: "#aaa", fontSize: 14 }}>لا توجد نتائج مطابقة</p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 20 }}>
            {products.map(product => {
              const img        = product.images?.[0] || product.image || DEFAULT_IMG;
              const outOfStock = product.stock === 0;
              return (
                <div
                  key={product._id}
                  onClick={() => navigate(`/store/${slug}/product/${product._id}`)}
                  style={{
                    background: "#fff", border: "1px solid #eee",
                    borderRadius: 16, overflow: "hidden", cursor: "pointer",
                    boxShadow: "0 2px 8px rgba(0,0,0,.04)",
                    transition: "transform .25s, box-shadow .25s",
                    opacity: outOfStock ? 0.6 : 1,
                  }}
                  onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 12px 32px rgba(0,0,0,.1)"; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,.04)"; }}
                >
                  <div style={{ height: 220, overflow: "hidden", background: "#f9fafb", position: "relative" }}>
                    <img
                      src={img} alt={product.name}
                      onError={e => { e.target.src = DEFAULT_IMG; }}
                      style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform .4s" }}
                      onMouseEnter={e => e.target.style.transform = "scale(1.05)"}
                      onMouseLeave={e => e.target.style.transform = "scale(1)"}
                    />
                    {product.oldPrice && !outOfStock && (
                      <span style={{ position: "absolute", top: 10, right: 10, background: "#ef4444", color: "#fff", fontSize: 11, fontWeight: 700, padding: "3px 9px", borderRadius: 99 }}>
                        -{Math.round((1 - product.currentPrice / product.oldPrice) * 100)}%
                      </span>
                    )}
                    {outOfStock && (
                      <div style={{ position: "absolute", inset: 0, background: "rgba(255,255,255,.7)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <span style={{ background: "#111", color: "#fff", fontSize: 12, fontWeight: 700, padding: "6px 16px", borderRadius: 99 }}>نفد المخزون</span>
                      </div>
                    )}
                  </div>
                  <div style={{ padding: "14px 16px 16px" }}>
                    <p style={{ fontWeight: 700, fontSize: 14, color: "#111", margin: "0 0 8px", lineHeight: 1.4 }}>{product.name}</p>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 12 }}>
                      <span style={{ fontSize: 16, fontWeight: 800, color: "#111" }}>{product.currentPrice.toLocaleString()} <span style={{ fontSize: 11, color: "#888" }}>د.ج</span></span>
                      {product.oldPrice && <span style={{ fontSize: 12, color: "#bbb", textDecoration: "line-through" }}>{product.oldPrice.toLocaleString()}</span>}
                    </div>
                    <button
                      disabled={outOfStock}
                      onClick={e => { e.stopPropagation(); navigate(`/store/${slug}/product/${product._id}`); }}
                      style={{
                        width: "100%", padding: "10px 0", borderRadius: 10,
                        border: "none", cursor: outOfStock ? "not-allowed" : "pointer",
                        background: outOfStock ? "#f3f4f6" : primary,
                        color: outOfStock ? "#aaa" : "#fff",
                        fontSize: 13, fontWeight: 700, fontFamily: "inherit",
                        transition: "opacity .15s",
                      }}
                      onMouseEnter={e => { if (!outOfStock) e.target.style.opacity = ".85"; }}
                      onMouseLeave={e => { e.target.style.opacity = "1"; }}
                    >
                      {outOfStock ? "نفد المخزون" : "اطلب الآن"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Footer ── */}
      <StoreFooter store={store} slug={slug} light />
    </div>
  );
}