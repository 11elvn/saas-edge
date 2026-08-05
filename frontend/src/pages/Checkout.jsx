// ============================================================
// 📁 pages/Checkout.jsx — صفحة الدفع المستقلة (السلة كاملة)
// Route: /store/:slug/checkout
// كتقرا السلة من CartContext وترسلها items[] للباك اند /api/orders/create
// ============================================================

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ALGERIAN_CITIES, getShippingPrice } from "../constants/algerianCities";
import StoreNavbar from "../components/StoreNavbar";
import StoreFooter from "../components/StoreFooter";
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

const sec = (arr, type) => (arr || []).find(s => s.type === type);

const IconLock = () => (
  <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0110 0v4" />
  </svg>
);
const IconBack = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
  </svg>
);
const FIELD_ICONS = {
  fullName: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  phone: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>,
  province: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>,
  municipality: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M3 21h18M5 21V7l7-4 7 4v14M9 9h1m4 0h1m-6 4h1m4 0h1m-6 4h1m4 0h1"/></svg>,
  address: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  note: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4z"/></svg>,
};

function FieldLabel({ text, required, color }) {
  return (
    <label style={{ display: "block", fontSize: 13, fontWeight: 700, color, marginBottom: 6 }}>
      {text} {required && <span style={{ color: "#ef4444" }}>*</span>}
    </label>
  );
}

function Checkout() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [store,   setStore]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [ordering, setOrdering] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const { getCart, getCartTotal, clearCart } = useCart();
  const items = getCart(slug);
  const itemsTotal = getCartTotal(slug);

  // ── حقول الفورم ──
  const [customerName, setCustomerName] = useState("");
  const [phone,        setPhone]        = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [municipality, setMunicipality] = useState("");
  const [address,      setAddress]      = useState("");
  const [note,         setNote]         = useState("");
  const [shippingPrice, setShippingPrice] = useState(0);

  const tc     = store?.themeConfig || null;
  const styles = tc?.styles || DEFAULT_STYLES;
  const homeSections = tc?.sections || DEFAULT_HOME_SECTIONS;

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
    loadFont("Cairo");
    document.documentElement.style.setProperty("--co-primary", primary);
  }, [primary]);

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

  const total = itemsTotal + shippingPrice;

  const handleOrder = async () => {
    setErrorMsg("");
    if (!items.length) { setErrorMsg("السلة فارغة ⚠️"); return; }
    if (!customerName.trim() || !phone.trim() || !selectedCity) {
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
          shippingCity: selectedCity,
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
      <div style={{ width: 36, height: 36, border: "3px solid #eee", borderTopColor: "#111", borderRadius: "50%", animation: "co-spin .7s linear infinite" }} />
      <style>{`@keyframes co-spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  const inputCls = "co-input";

  return (
    <div dir={direction} style={{ minHeight: "100vh", background: bgColor, color: textColor, fontFamily: `'${font}', 'Cairo', sans-serif` }}>
      {sec(homeSections, "header")?.enabled !== false && (
        <StoreNavbar
          store={store}
          slug={slug}
          headerSettings={sec(homeSections, "header")?.settings}
          themeColors={{ primary, secondary, bgColor, surfaceColor, textColor, mutedTextColor, borderColor }}
          cartCount={items.length}
          onCartClick={() => navigate(`/store/${slug}`)}
        />
      )}

      <div style={{ maxWidth: 980, margin: "0 auto", padding: "28px 16px 80px" }}>
        {/* ── Back + Title ── */}
        <button
          onClick={() => navigate(`/store/${slug}`)}
          style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", color: mutedTextColor, cursor: "pointer", fontFamily: "inherit", fontSize: 13, fontWeight: 600, marginBottom: 18, padding: 0 }}
        >
          <IconBack /> متابعة التسوق
        </button>
        <h1 style={{ fontSize: 22, fontWeight: 900, margin: "0 0 22px" }}>إتمام الطلب</h1>

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
          <div style={{ display: "grid", gridTemplateColumns: "1.15fr 0.85fr", gap: 28 }} className="co-grid">
            {/* ── LEFT: Form ── */}
            <div>
              <div style={{ background: surfaceColor, borderRadius: 16, padding: "22px 20px", border: `1px solid ${borderColor}` }}>
                <h2 style={{ fontSize: 15, fontWeight: 800, margin: "0 0 18px" }}>معلومات التوصيل</h2>

                <div style={{ marginBottom: 14 }}>
                  <FieldLabel text="الاسم الكامل" required color={textColor} />
                  <div className="co-field">
                    <input className={inputCls} value={customerName} onChange={e => setCustomerName(e.target.value)} placeholder="مثال: أحمد بن علي" />
                    <span className="co-field-icon">{FIELD_ICONS.fullName}</span>
                  </div>
                </div>

                <div style={{ marginBottom: 14 }}>
                  <FieldLabel text="رقم الهاتف" required color={textColor} />
                  <div className="co-field">
                    <input className={inputCls} type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="0550123456" />
                    <span className="co-field-icon">{FIELD_ICONS.phone}</span>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }} className="co-row-2">
                  <div>
                    <FieldLabel text="الولاية" required color={textColor} />
                    <div className="co-field">
                      <select className={inputCls} value={selectedCity} onChange={e => handleCityChange(e.target.value)}>
                        <option value="">اختر الولاية</option>
                        {ALGERIAN_CITIES.map(c => (
                          <option key={c.id} value={c.name}>{c.id} - {c.name}</option>
                        ))}
                      </select>
                      <span className="co-field-icon">{FIELD_ICONS.province}</span>
                    </div>
                  </div>
                  <div>
                    <FieldLabel text="البلدية" color={textColor} />
                    <div className="co-field">
                      <input className={inputCls} value={municipality} onChange={e => setMunicipality(e.target.value)} placeholder="البلدية" />
                      <span className="co-field-icon">{FIELD_ICONS.municipality}</span>
                    </div>
                  </div>
                </div>

                <div style={{ marginBottom: 14 }}>
                  <FieldLabel text="العنوان بالتفصيل" color={textColor} />
                  <div className="co-field">
                    <input className={inputCls} value={address} onChange={e => setAddress(e.target.value)} placeholder="الحي، الشارع، رقم المنزل..." />
                    <span className="co-field-icon">{FIELD_ICONS.address}</span>
                  </div>
                </div>

                <div>
                  <FieldLabel text="ملاحظة (اختياري)" color={textColor} />
                  <div className="co-field">
                    <textarea className={`${inputCls} co-textarea`} rows={3} value={note} onChange={e => setNote(e.target.value)} placeholder="أي تفاصيل إضافية على طلبك..." />
                    <span className="co-field-icon co-field-icon--top">{FIELD_ICONS.note}</span>
                  </div>
                </div>
              </div>

              {errorMsg && (
                <div style={{ marginTop: 14, padding: "12px 14px", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 10, color: "#b91c1c", fontSize: 13, fontWeight: 700 }}>
                  {errorMsg}
                </div>
              )}

              {/* زر التأكيد — Desktop */}
              <button
                onClick={handleOrder}
                disabled={ordering}
                className="co-submit-desktop"
                style={{
                  width: "100%", marginTop: 18, padding: "15px 0", border: "none", borderRadius: 12,
                  background: primary, color: "#fff", fontSize: 15, fontWeight: 800, fontFamily: "inherit",
                  cursor: ordering ? "not-allowed" : "pointer", opacity: ordering ? 0.7 : 1,
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                }}
              >
                <IconLock /> {ordering ? "⏳ جاري الإرسال..." : `تأكيد الطلب — ${total.toLocaleString()} د.ج`}
              </button>
            </div>

            {/* ── RIGHT: Order Summary ── */}
            <div>
              <div style={{ background: surfaceColor, borderRadius: 16, padding: "22px 20px", border: `1px solid ${borderColor}`, position: "sticky", top: 90 }}>
                <h2 style={{ fontSize: 15, fontWeight: 800, margin: "0 0 16px" }}>ملخص الطلب ({items.length})</h2>

                <div style={{ display: "flex", flexDirection: "column", gap: 12, maxHeight: 340, overflowY: "auto", marginBottom: 16 }}>
                  {items.map(item => (
                    <div key={item.productId} style={{ display: "flex", gap: 10 }}>
                      <div style={{
                        width: 52, height: 52, borderRadius: 10, flexShrink: 0, overflow: "hidden", background: bgColor,
                        backgroundImage: `url(${item.image || DEFAULT_IMG})`, backgroundSize: "cover", backgroundPosition: "center",
                      }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ margin: 0, fontSize: 12.5, fontWeight: 700, color: textColor, overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
                          {item.name}
                        </p>
                        <p style={{ margin: "4px 0 0", fontSize: 11.5, color: mutedTextColor, fontWeight: 600 }}>
                          الكمية {item.quantity}
                        </p>
                      </div>
                      <span style={{ fontSize: 12.5, fontWeight: 800, color: textColor, whiteSpace: "nowrap" }}>
                        {(item.price * item.quantity).toLocaleString()} د.ج
                      </span>
                    </div>
                  ))}
                </div>

                <div style={{ borderTop: `1px solid ${borderColor}`, paddingTop: 14, display: "flex", flexDirection: "column", gap: 8 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: mutedTextColor, fontWeight: 600 }}>
                    <span>المجموع الفرعي</span>
                    <span>{itemsTotal.toLocaleString()} د.ج</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: mutedTextColor, fontWeight: 600 }}>
                    <span>التوصيل</span>
                    <span>{selectedCity ? `${shippingPrice.toLocaleString()} د.ج` : "—"}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 16, fontWeight: 900, color: textColor, marginTop: 4 }}>
                    <span>الإجمالي</span>
                    <span>{total.toLocaleString()} د.ج</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* زر التأكيد الثابت — Mobile فقط */}
      {items.length > 0 && (
        <div className="co-submit-mobile" style={{
          position: "fixed", bottom: 0, insetInline: 0, padding: "12px 16px", background: bgColor,
          borderTop: `1px solid ${borderColor}`, boxShadow: "0 -6px 20px rgba(0,0,0,.06)", zIndex: 50,
        }}>
          <button
            onClick={handleOrder}
            disabled={ordering}
            style={{
              width: "100%", padding: "14px 0", border: "none", borderRadius: 12,
              background: primary, color: "#fff", fontSize: 14, fontWeight: 800, fontFamily: "inherit",
              cursor: ordering ? "not-allowed" : "pointer", opacity: ordering ? 0.7 : 1,
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            }}
          >
            <IconLock /> {ordering ? "⏳ جاري الإرسال..." : `تأكيد الطلب — ${total.toLocaleString()} د.ج`}
          </button>
        </div>
      )}

      {sec(homeSections, "footer")?.enabled !== false && (
        <StoreFooter store={store} slug={slug} bgColor={surfaceColor} textColor={textColor} light={surfaceColor === "#ffffff"} settings={sec(homeSections, "footer")?.settings || {}} />
      )}

      <style>{`
        .co-field { position: relative; }
        .co-input {
          width: 100%; box-sizing: border-box; padding: 11px 38px 11px 12px; border-radius: 10px;
          border: 1px solid ${borderColor}; background: ${bgColor}; color: ${textColor};
          font-size: 13.5px; font-family: inherit; outline: none; transition: border-color .15s;
        }
        .co-input:focus { border-color: ${primary}; }
        .co-textarea { resize: vertical; min-height: 70px; }
        .co-field-icon {
          position: absolute; top: 50%; right: 12px; transform: translateY(-50%);
          color: ${mutedTextColor}; pointer-events: none; display: flex;
        }
        .co-field-icon--top { top: 16px; transform: none; }
        select.co-input { appearance: none; cursor: pointer; }
        .co-submit-mobile { display: none; }
        @media (max-width: 760px) {
          .co-grid { grid-template-columns: 1fr !important; }
          .co-row-2 { grid-template-columns: 1fr !important; }
          .co-submit-desktop { display: none; }
          .co-submit-mobile { display: block; }
          .co-grid > div:first-child { padding-bottom: 90px; }
        }
      `}</style>
    </div>
  );
}

export default Checkout;