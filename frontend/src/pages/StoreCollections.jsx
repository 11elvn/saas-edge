// ============================================================
// 📁 pages/StoreCollections.jsx — صفحة جميع التشكيلات
// Route: /store/:slug/collections
// ============================================================
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import StoreNavbar from "../components/StoreNavbar";
import StoreFooter from "../components/StoreFooter";

const API = () => import.meta.env.VITE_API_URL;

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

export default function StoreCollections() {
  const { slug } = useParams();
  const navigate  = useNavigate();

  const [store,      setStore]      = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading,    setLoading]    = useState(true);

  const primary = store?.primaryColor || "#111827";
  const font    = store?.fontFamily   || "Cairo";

  useEffect(() => { loadFont("Cairo"); }, []);
  useEffect(() => { if (font) loadFont(font); }, [font]);

  useEffect(() => {
    if (!slug) return;
    (async () => {
      try {
        const sr   = await fetch(`${API()}/api/stores/public/${slug}`);
        const sd   = await sr.json();
        if (sd.store) {
          setStore(sd.store);
          const cr = await fetch(`${API()}/api/categories/public/${sd.store._id}`);
          const cd = await cr.json();
          if (Array.isArray(cd)) setCategories(cd);
        }
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    })();
  }, [slug]);

  const logo      = store?.logo || "";
  const storeName = store?.name || "المتجر";
  const phone     = store?.whatsappNumber || "";

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: 32, height: 32, border: "3px solid #f0f0f0", borderTopColor: "#111", borderRadius: "50%", animation: "sc-spin .7s linear infinite" }} />
      <style>{`@keyframes sc-spin{to{transform:rotate(360deg)}}`}</style>
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

      {/* ── Hero text ── */}
      <div style={{ maxWidth: 960, margin: "0 auto", padding: "52px 24px 36px", textAlign: "center" }}>
        <h1 style={{ fontSize: "clamp(1.8rem,4vw,2.6rem)", fontWeight: 900, color: "#111", margin: "0 0 10px", letterSpacing: -1 }}>
          جميع التشكيلات
        </h1>
        <p style={{ color: "#888", fontSize: 15, margin: 0 }}>ستجد كل ما تبحث عنه</p>
      </div>

      {/* ── Categories Grid ── */}
      <div style={{ maxWidth: 960, margin: "0 auto", padding: "0 24px 80px" }}>
        {categories.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 0", color: "#ccc" }}>
            <p style={{ fontSize: 40 }}>📁</p>
            <p>لا توجد تصنيفات بعد</p>
          </div>
        ) : (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: 20,
          }}>
            {categories.map(cat => (
              <div
                key={cat._id}
                onClick={() => navigate(`/store/${slug}/collections/${cat._id}`)}
                style={{
                  border: "1px solid #eee", borderRadius: 16,
                  overflow: "hidden", cursor: "pointer",
                  background: "#fff",
                  boxShadow: "0 2px 8px rgba(0,0,0,.05)",
                  transition: "transform .25s, box-shadow .25s",
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 12px 32px rgba(0,0,0,.12)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,.05)"; }}
              >
                {/* Image */}
                <div style={{ height: 240, overflow: "hidden", background: "#f9fafb" }}>
                  {cat.image ? (
                    <img
                      src={cat.image} alt={cat.name}
                      style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform .5s" }}
                      onMouseEnter={e => e.target.style.transform = "scale(1.06)"}
                      onMouseLeave={e => e.target.style.transform = "scale(1)"}
                    />
                  ) : (
                    <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 48, color: "#ddd" }}>📁</div>
                  )}
                </div>
                {/* Name */}
                <div style={{ padding: "16px 18px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontWeight: 700, fontSize: 16, color: "#111" }}>{cat.name}</span>
                  <svg width="16" height="16" fill="none" stroke="#999" strokeWidth="2" viewBox="0 0 24 24">
                    <polyline points="15 18 9 12 15 6"/>
                  </svg>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Footer ── */}
      <StoreFooter store={store} slug={slug} />

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