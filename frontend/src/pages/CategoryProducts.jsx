// ============================================================
// 📁 pages/CategoryProducts.jsx — منتجات تصنيف معين
// Route: /store/:slug/collections/:categoryId
// ============================================================
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import StoreNavbar from "../components/StoreNavbar";

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

const IconWA = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="white">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 00-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

export default function CategoryProducts() {
  const { slug, categoryId } = useParams();
  const navigate = useNavigate();

  const [store,    setStore]    = useState(null);
  const [category, setCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [sort,     setSort]     = useState("newest");

  const primary = store?.primaryColor || "#111827";
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

  const logo      = store?.logo || "";
  const storeName = store?.name || "المتجر";
  const phone     = store?.whatsappNumber || "";

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: 32, height: 32, border: "3px solid #f0f0f0", borderTopColor: "#111", borderRadius: "50%", animation: "cp2-spin .7s linear infinite" }} />
      <style>{`@keyframes cp2-spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  return (
    <div dir="rtl" style={{ minHeight: "100vh", background: "#fff", fontFamily: `'${font}','Cairo',sans-serif`, color: "#111" }}>

      {/* ── Navbar ── */}
      <StoreNavbar
        store={store}
        slug={slug}
        links={[
          { label: "الرئيسية",   action: () => navigate(`/store/${slug}`) },
          { label: "التصنيفات", action: () => navigate(`/store/${slug}/collections`) },
        ]}
      />

      {/* ── Breadcrumb ── */}
      <div style={{ maxWidth: 960, margin: "0 auto", padding: "20px 24px 0", display: "flex", alignItems: "center", gap: 8 }}>
        <button onClick={() => navigate(`/store/${slug}/collections`)} style={{ background: "none", border: "none", color: "#888", fontSize: 13, cursor: "pointer", fontFamily: "inherit", padding: 0 }}>
          التشكيلات
        </button>
        <span style={{ color: "#ccc" }}>›</span>
        <span style={{ color: "#111", fontSize: 13, fontWeight: 600 }}>{category?.name || "..."}</span>
      </div>

      {/* ── Header ── */}
      <div style={{ maxWidth: 960, margin: "0 auto", padding: "28px 24px 32px" }}>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
          <div>
            <h1 style={{ fontSize: "clamp(1.6rem,4vw,2.4rem)", fontWeight: 900, color: "#111", margin: "0 0 6px", letterSpacing: -1 }}>
              {category?.name || "التصنيف"}
            </h1>
            <p style={{ color: "#888", fontSize: 14, margin: 0 }}>{sorted.length} منتج</p>
          </div>
          {/* Sort */}
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
      </div>

      {/* ── Products Grid ── */}
      <div style={{ maxWidth: 960, margin: "0 auto", padding: "0 24px 80px" }}>
        {sorted.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 0", color: "#ccc" }}>
            <p style={{ fontSize: 40 }}>📦</p>
            <p style={{ color: "#aaa", fontSize: 14 }}>لا توجد منتجات في هذا التصنيف</p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 20 }}>
            {sorted.map(product => {
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
                  {/* Image */}
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
                  {/* Info */}
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