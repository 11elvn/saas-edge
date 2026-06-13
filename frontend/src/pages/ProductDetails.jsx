// ============================================================
// 📁 pages/ProductDetails.jsx — Day 23 Redesign (dark vibe)
// ============================================================

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ALGERIAN_CITIES, getShippingPrice } from "../constants/algerianCities";
import StoreNavbar from "../components/StoreNavbar";
import StoreFooter from "../components/StoreFooter";

const API = () => import.meta.env.VITE_API_URL;
const DEFAULT_IMG = "https://images.unsplash.com/photo-1531403009284-440f080d1e12?q=80&w=600";

const PD_CSS = `
@keyframes pd-fade-up { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
@keyframes pd-spin     { to{transform:rotate(360deg)} }
.pd-fade  { animation: pd-fade-up .45s ease both; }
.pd-d1    { animation-delay: .08s; }
.pd-d2    { animation-delay: .16s; }
.pd-spinner { animation: pd-spin .7s linear infinite; }
.pd-thumb {
  cursor:pointer; border-radius:10px; overflow:hidden;
  border:2px solid transparent;
  transition: border-color .2s, transform .2s;
}
.pd-thumb:hover { transform:scale(1.05); }
.pd-thumb.active { border-color: var(--pd-primary); }
.pd-input {
  width:100%; padding:12px 14px; border-radius:12px;
  border:1px solid #e5e7eb; background:#f9fafb;
  color:#111; font-family:inherit; font-size:14px;
  outline:none; transition: border-color .2s, background .2s;
  text-align:right; box-sizing:border-box;
}
.pd-input:focus { border-color: var(--pd-primary); background:#fff; }
.pd-input::placeholder { color:#aaa; }
.pd-btn-order {
  position:relative; overflow:hidden;
  transition: transform .15s, box-shadow .15s, opacity .2s;
}
.pd-btn-order:not(:disabled):hover { transform:translateY(-2px); box-shadow: 0 8px 28px rgba(0,0,0,.5); }
.pd-btn-order:not(:disabled):active { transform:scale(.97); }
`;

function injectCSS() {
  if (document.getElementById("pd-styles")) return;
  const s = document.createElement("style");
  s.id = "pd-styles";
  s.textContent = PD_CSS;
  document.head.appendChild(s);
}

function ProductDetails() {
  const { slug, productId } = useParams();
  const navigate = useNavigate();

  const [product,      setProduct]      = useState(null);
  const [store,        setStore]        = useState(null);
  const [activeImg,    setActiveImg]    = useState(0);
  const [loading,      setLoading]      = useState(true);
  const [ordering,     setOrdering]     = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [phone,        setPhone]        = useState("");
  const [address,      setAddress]      = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [shippingPrice,setShippingPrice]= useState(0);

  const primary   = store?.primaryColor   || "#6366f1";
  const secondary = store?.secondaryColor || "#4f46e5";
  const font      = store?.fontFamily     || "Cairo";

  useEffect(() => {
    injectCSS();
    document.documentElement.style.setProperty("--pd-primary", primary);
  }, [primary]);

  useEffect(() => {
    if (!productId) return;
    (async () => {
      try {
        // fetch product
        const pRes  = await fetch(`${API()}/api/products/${productId}`);
        const pData = await pRes.json();
        if (pRes.ok) setProduct(pData);

        // fetch store from slug
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

  const handleOrder = async () => {
    if (!customerName.trim() || !phone.trim() || !selectedCity) {
      alert("يرجى ملء جميع الحقول الإجبارية ⚠️"); return;
    }
    const phoneRegex = /^0[5-7][0-9]{8}$/;
    if (!phoneRegex.test(phone.trim().replace(/\s/g, ""))) {
      alert("رقم الهاتف غير صحيح (مثال: 0550123456) ⚠️"); return;
    }
    setOrdering(true);
    try {
      const res  = await fetch(`${API()}/api/orders/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          customerName,
          phone: phone.trim().replace(/\s/g, ""),
          address,
          shippingCity: selectedCity,
          shippingPrice,
          totalPrice: product.currentPrice + shippingPrice,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        navigate("/order-success", { state: {
          productName: product.name,
          totalPrice: product.currentPrice + shippingPrice,
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

  const images = product.images?.length > 0 ? product.images : [product.image || DEFAULT_IMG];
  const outOfStock = product.stock === 0;
  const total = product.currentPrice + shippingPrice;

  return (
    <div
      dir="rtl"
      style={{ minHeight: "100vh", background: "#fff", color: "#111", fontFamily: `'${font}', 'Cairo', sans-serif` }}
    >
      <style>{`
        @media (max-width: 768px) {
          .pd-grid { grid-template-columns: 1fr !important; }
          .pd-thumbs { flex-direction: row !important; }
          .pd-thumb { width: 60px !important; height: 60px !important; }
        }
      `}</style>

      {/* ── Navbar ── */}
      <StoreNavbar
        store={store}
        slug={slug}
        links={[
          { label: "الصفحة الرئيسية", action: () => navigate(`/store/${slug}`) },
          { label: "التصنيفات",       action: () => navigate(`/store/${slug}/collections`) },
          { label: "اتصل بنا",        action: () => store?.whatsappNumber && window.open(`https://wa.me/${store.whatsappNumber}`, "_blank") },
        ]}
      />

      {/* ── Content ── */}
      <div
        className="pd-grid"
        style={{ maxWidth: 980, margin: "0 auto", padding: "36px 24px 80px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32, alignItems: "start" }}
      >

        {/* ── LEFT: Product Images & Info ── */}
        <div className="pd-fade" style={{ display: "flex", gap: 14 }}>
          {/* Thumbnails (vertical on desktop) */}
          {images.length > 1 && (
            <div className="pd-thumbs" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {images.map((img, i) => (
                <div
                  key={i}
                  className={`pd-thumb ${activeImg === i ? "active" : ""}`}
                  onClick={() => setActiveImg(i)}
                  style={{ width: 70, height: 70, flexShrink: 0 }}
                >
                  <img src={img} alt={`img-${i}`} onError={e => { e.target.src = DEFAULT_IMG; }} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
              ))}
            </div>
          )}

          {/* Main image */}
          <div style={{ flex: 1, borderRadius: 18, overflow: "hidden", background: "#f9fafb", border: "1px solid #eee", position: "relative", aspectRatio: "1/1" }}>
            <img
              src={images[activeImg] || DEFAULT_IMG}
              alt={product.name}
              onError={e => { e.target.src = DEFAULT_IMG; }}
              style={{ width: "100%", height: "100%", objectFit: "cover", transition: "opacity .3s" }}
            />
            {outOfStock && (
              <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,.6)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ background: "#fff", color: "#111", fontWeight: 800, fontSize: 13, padding: "8px 22px", borderRadius: 99 }}>نفد من المخزون</span>
              </div>
            )}
          </div>
        </div>

        {/* ── RIGHT: Order Section ── */}
        <div className="pd-fade pd-d1" style={{ display: "flex", flexDirection: "column", gap: 20 }}>

          {/* Product Info */}
          <div style={{ background: "#f9fafb", border: "1px solid #eee", borderRadius: 18, padding: "24px 22px" }}>
            {product.oldPrice && (
              <span style={{ background: "#ef4444", color: "#fff", fontSize: 11, fontWeight: 700, padding: "3px 12px", borderRadius: 99, display: "inline-block", marginBottom: 12 }}>
                خصم {Math.round((1 - product.currentPrice / product.oldPrice) * 100)}%
              </span>
            )}
            <h1 style={{ fontSize: "clamp(1.2rem,3vw,1.6rem)", fontWeight: 900, color: "#111", margin: "0 0 12px", lineHeight: 1.3 }}>
              {product.name}
            </h1>
            <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 14 }}>
              <span style={{ fontSize: "clamp(1.4rem,3vw,2rem)", fontWeight: 900, color: "#111" }}>
                {product.currentPrice.toLocaleString()}
                <span style={{ fontSize: 14, fontWeight: 600, color: "#888", marginRight: 4 }}>د.ج</span>
              </span>
              {product.oldPrice && (
                <span style={{ fontSize: 15, color: "#bbb", textDecoration: "line-through" }}>
                  {product.oldPrice.toLocaleString()} د.ج
                </span>
              )}
            </div>
            <p style={{ fontSize: 14, color: "#666", lineHeight: 1.7, margin: 0 }}>{product.description}</p>
            {product.stock > 0 && product.stock <= 5 && (
              <p style={{ marginTop: 12, fontSize: 13, color: "#f59e0b", fontWeight: 700 }}>
                ⚠️ بقي {product.stock} قطعة فقط
              </p>
            )}
          </div>

          {/* Order Form */}
          <div className="pd-fade pd-d2" style={{ background: "#f9fafb", border: "1px solid #eee", borderRadius: 18, padding: "24px 22px" }}>
            <h3 style={{ margin: "0 0 18px", fontWeight: 800, fontSize: 16, color: "#111", display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 18 }}>🛒</span> تأكيد الطلب
            </h3>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <input
                className="pd-input"
                value={customerName}
                onChange={e => setCustomerName(e.target.value)}
                placeholder="الاسم الكامل *"
              />
              <input
                className="pd-input"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                type="tel"
                placeholder="رقم الهاتف * (مثال: 0550123456)"
              />
              <select
                className="pd-input"
                value={selectedCity}
                onChange={e => handleCityChange(e.target.value)}
                style={{ cursor: "pointer" }}
              >
                <option value="">اختر الولاية *</option>
                {ALGERIAN_CITIES.map(city => (
                  <option key={city.id} value={city.name}>{city.name}</option>
                ))}
              </select>
              <input
                className="pd-input"
                value={address}
                onChange={e => setAddress(e.target.value)}
                placeholder="العنوان التفصيلي (اختياري)"
              />

              {/* Price breakdown */}
              {selectedCity && (
                <div style={{ background: "#fff", border: "1px solid #eee", borderRadius: 12, padding: "14px 16px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                    <span style={{ fontSize: 13, color: "#888" }}>سعر المنتج</span>
                    <span style={{ fontSize: 13, color: "#555" }}>{product.currentPrice.toLocaleString()} د.ج</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10, paddingBottom: 10, borderBottom: "1px solid #eee" }}>
                    <span style={{ fontSize: 13, color: "#888" }}>التوصيل إلى {selectedCity}</span>
                    <span style={{ fontSize: 13, color: "#555" }}>{shippingPrice.toLocaleString()} د.ج</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: "#333" }}>المجموع</span>
                    <span style={{ fontSize: 16, fontWeight: 900, color: "#111" }}>{total.toLocaleString()} د.ج</span>
                  </div>
                </div>
              )}

              <button
                className="pd-btn-order"
                onClick={handleOrder}
                disabled={outOfStock || ordering}
                style={{
                  width: "100%", padding: "15px 0", borderRadius: 14,
                  border: "none", cursor: outOfStock || ordering ? "not-allowed" : "pointer",
                  background: outOfStock ? "#f3f4f6" : `linear-gradient(135deg, ${primary}, ${secondary})`,
                  color: outOfStock ? "#aaa" : "#fff",
                  fontSize: 15, fontWeight: 800, fontFamily: "inherit",
                  opacity: ordering ? 0.7 : 1,
                  boxShadow: outOfStock ? "none" : `0 4px 20px ${primary}44`,
                }}
              >
                {ordering ? "⏳ جاري الإرسال..." : outOfStock ? "نفد من المخزون" : "✅ تأكيد الطلب"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Footer ── */}
      <StoreFooter store={store} slug={slug} light />
    </div>
  );
}

export default ProductDetails;