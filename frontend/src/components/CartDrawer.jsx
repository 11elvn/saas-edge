// ============================================================
// 📁 components/CartDrawer.jsx — قائمة السلة الجانبية (Drawer)
// ✦ مشترك بين كل صفحات المتجر (Home / Product / Category / Search)
// ============================================================
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";

const DEFAULT_IMG = "https://placehold.co/200x200/f9fafb/94a3b8?text=No+Image";

const IconX = () => (
  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);
const IconCartEmpty = () => (
  <svg width="40" height="40" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" viewBox="0 0 24 24">
    <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/>
  </svg>
);

export default function CartDrawer({ open, onClose, slug, primary = "#2563eb", textColor = "#111111", mutedTextColor = "#888888", borderColor = "#eeeeee", surfaceColor = "#fafafa", bgColor = "#ffffff" }) {
  const navigate = useNavigate();
  const { getCart, updateQuantity, removeFromCart, getCartTotal } = useCart();
  const items = getCart(slug);
  const total = getCartTotal(slug);

  if (!open) return null;

  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.5)", zIndex: 998, backdropFilter: "blur(2px)" }} />
      <div dir="rtl" style={{
        position: "fixed", top: 0, right: 0, height: "100%", width: "min(400px, 92vw)",
        background: bgColor, zIndex: 999, display: "flex", flexDirection: "column",
        animation: "cd-slide-in .28s cubic-bezier(.32,.72,0,1) both", boxShadow: "-8px 0 30px rgba(0,0,0,.12)",
      }}>
        {/* Header — العداد يسار / العنوان فالنص / الإغلاق يمين */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", alignItems: "center", padding: "18px 20px", borderBottom: `1px solid ${borderColor}` }}>
          <span style={{ fontSize: 12.5, fontWeight: 600, color: mutedTextColor, justifySelf: "start" }}>
            {items.length > 0 ? `${items.length} منتج` : ""}
          </span>
          <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: textColor, whiteSpace: "nowrap" }}>السلة</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: textColor, padding: 4, justifySelf: "end" }}><IconX /></button>
        </div>

        {/* Items */}
        <div style={{ flex: 1, overflowY: "auto", padding: items.length ? "4px 18px" : 0 }}>
          {items.length === 0 ? (
            <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10, color: mutedTextColor, padding: "0 20px", textAlign: "center" }}>
              <IconCartEmpty />
              <p style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>السلة فارغة</p>
              <p style={{ margin: 0, fontSize: 12.5 }}>زيد منتجات باش تبدا الطلب</p>
            </div>
          ) : items.map((item, i) => (
            <div key={item.productId} style={{
              display: "flex", alignItems: "center", gap: 14, padding: "16px 0",
              borderBottom: i !== items.length - 1 ? `1px solid ${borderColor}` : "none",
            }}>
              {/* الصورة — يمين الصف */}
              <div style={{
                width: 68, height: 68, borderRadius: 12, background: surfaceColor, flexShrink: 0, overflow: "hidden",
                backgroundImage: `url(${item.image || DEFAULT_IMG})`, backgroundSize: "cover", backgroundPosition: "center",
              }} />

              {/* اسم / سعر / stepper — النص */}
              <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 8 }}>
                <div>
                  <p style={{ margin: "0 0 3px", fontSize: 13.5, fontWeight: 700, color: textColor, lineHeight: 1.4, overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
                    {item.name}
                  </p>
                  <span style={{ fontSize: 13, fontWeight: 600, color: mutedTextColor }}>
                    {item.price.toLocaleString()} د.ج
                  </span>
                </div>
                <div style={{ display: "inline-flex", alignItems: "center", gap: 10, border: `1px solid ${borderColor}`, borderRadius: 8, padding: "3px 6px", width: "fit-content" }}>
                  <button onClick={() => updateQuantity(slug, item.productId, item.quantity - 1)} style={{ background: "none", border: "none", cursor: "pointer", width: 20, height: 20, fontSize: 14, color: textColor, fontFamily: "inherit" }}>−</button>
                  <span style={{ fontSize: 12.5, fontWeight: 700, minWidth: 14, textAlign: "center", color: textColor }}>{item.quantity}</span>
                  <button onClick={() => updateQuantity(slug, item.productId, item.quantity + 1)} disabled={item.quantity >= (item.stock ?? 99)} style={{ background: "none", border: "none", cursor: item.quantity >= (item.stock ?? 99) ? "not-allowed" : "pointer", width: 20, height: 20, fontSize: 14, color: item.quantity >= (item.stock ?? 99) ? "#ccc" : textColor, fontFamily: "inherit" }}>+</button>
                </div>
              </div>

              {/* حذف — يسار الصف */}
              <button onClick={() => removeFromCart(slug, item.productId)} style={{ background: "none", border: "none", cursor: "pointer", color: mutedTextColor, padding: 2, flexShrink: 0, alignSelf: "flex-start", marginTop: 2 }}>
                <IconX />
              </button>
            </div>
          ))}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div style={{ padding: "18px 20px", borderTop: `1px solid ${borderColor}`, background: bgColor }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
              <span style={{ fontSize: 13.5, color: mutedTextColor, fontWeight: 600 }}>المجموع</span>
              <span style={{ fontSize: 18, fontWeight: 800, color: textColor }}>{total.toLocaleString()} <span style={{ fontSize: 13, fontWeight: 600, color: mutedTextColor }}>د.ج</span></span>
            </div>
            <button
              onClick={() => { onClose?.(); navigate(`/store/${slug}/checkout`); }}
              style={{ width: "100%", padding: "14px 0", border: "none", borderRadius: 12, background: primary, color: "#fff", fontSize: 14, fontWeight: 800, fontFamily: "inherit", cursor: "pointer" }}
            >
              إتمام الطلب
            </button>
          </div>
        )}
      </div>
      <style>{`@keyframes cd-slide-in { from { transform: translateX(100%); } to { transform: translateX(0); } }`}</style>
    </>
  );
}