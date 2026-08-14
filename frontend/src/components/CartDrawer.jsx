// ============================================================
// 📁 components/CartDrawer.jsx — قائمة السلة الجانبية (Drawer)
// ✦ مشترك بين كل صفحات المتجر (Home / Product / Category / Search)
// ============================================================
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";

const DEFAULT_IMG = "https://placehold.co/200x200/f9fafb/94a3b8?text=No+Image";

const IconTrash = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
  </svg>
);
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
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 20px", borderBottom: `1px solid ${borderColor}` }}>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: textColor }}>سلة التسوق {items.length > 0 && `(${items.length})`}</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: mutedTextColor, padding: 4 }}><IconX /></button>
        </div>

        {/* Items */}
        <div style={{ flex: 1, overflowY: "auto", padding: items.length ? "10px 14px" : 0 }}>
          {items.length === 0 ? (
            <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10, color: mutedTextColor, padding: "0 20px", textAlign: "center" }}>
              <IconCartEmpty />
              <p style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>السلة فارغة</p>
              <p style={{ margin: 0, fontSize: 12.5 }}>زيد منتجات باش تبدا الطلب</p>
            </div>
          ) : items.map(item => (
            <div key={item.productId} style={{ display: "flex", gap: 12, padding: 10, marginBottom: 8, borderRadius: 14, background: surfaceColor }}>
              <div style={{
                width: 56, height: 56, borderRadius: 10, background: bgColor, flexShrink: 0, overflow: "hidden",
                backgroundImage: `url(${item.image || DEFAULT_IMG})`, backgroundSize: "cover", backgroundPosition: "center",
              }} />
              <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: textColor, lineHeight: 1.4, overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
                    {item.name}
                  </p>
                  <button onClick={() => removeFromCart(slug, item.productId)} style={{ background: "none", border: "none", cursor: "pointer", color: mutedTextColor, padding: 2, flexShrink: 0 }}>
                    <IconTrash />
                  </button>
                </div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, border: `1px solid ${borderColor}`, borderRadius: 8, padding: "2px 4px", background: bgColor }}>
                    <button onClick={() => updateQuantity(slug, item.productId, item.quantity - 1)} style={{ background: "none", border: "none", cursor: "pointer", width: 22, height: 22, fontSize: 15, color: primary, fontFamily: "inherit" }}>−</button>
                    <span style={{ fontSize: 12.5, fontWeight: 700, minWidth: 16, textAlign: "center", color: textColor }}>{item.quantity}</span>
                    <button onClick={() => updateQuantity(slug, item.productId, item.quantity + 1)} disabled={item.quantity >= (item.stock ?? 99)} style={{ background: "none", border: "none", cursor: item.quantity >= (item.stock ?? 99) ? "not-allowed" : "pointer", width: 22, height: 22, fontSize: 15, color: item.quantity >= (item.stock ?? 99) ? "#ccc" : primary, fontFamily: "inherit" }}>+</button>
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 800, color: textColor }}>
                    {(item.price * item.quantity).toLocaleString()} <span style={{ fontSize: 11, fontWeight: 600, color: mutedTextColor }}>د.ج</span>
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div style={{ padding: "16px 20px", borderTop: `1px solid ${borderColor}`, background: bgColor }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
              <span style={{ fontSize: 13.5, color: mutedTextColor, fontWeight: 600 }}>المجموع</span>
              <span style={{ fontSize: 17, fontWeight: 800, color: primary }}>{total.toLocaleString()} <span style={{ fontSize: 12, fontWeight: 600, color: mutedTextColor }}>د.ج</span></span>
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