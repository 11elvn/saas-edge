// ============================================================
// 📁 components/CartDrawer.jsx — قائمة السلة الجانبية (Drawer)
// ✦ مشترك بين كل صفحات المتجر (Home / Product / Category / Search)
// ✦ Redesign: تصميم عصري (بطاقات، ظلال خفيفة، typography أوضح)
// ✦ + دعم منتجات تجريبية داخل ThemeEdit preview (isPreview + demoItems)
// ============================================================
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";

const DEFAULT_IMG = "https://placehold.co/200x200/f9fafb/94a3b8?text=No+Image";

const IconBag = () => (
  <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/>
  </svg>
);
const IconX = ({ size = 20 }) => (
  <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);
const IconTrash = () => (
  <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
  </svg>
);
const IconCartEmpty = () => (
  <svg width="30" height="30" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/>
  </svg>
);
const IconMinus = () => (
  <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24">
    <line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);
const IconPlus = () => (
  <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);

// ── منتجات تجريبية — تبان غير جوه ThemeEdit (isPreview) كي السلة الحقيقية فارغة ──
// ✦ باش التاجر يشوف كيفاش يبان تصميم السلة بمنتجات، ماشي فارغة دايماً
const DEFAULT_DEMO_ITEMS = [
  { productId: "demo-cart-1", name: "منتج تجريبي 1", image: "", price: 2500, quantity: 1, stock: 99, _demo: true },
  { productId: "demo-cart-2", name: "منتج تجريبي 2", image: "", price: 4200, quantity: 2, stock: 99, _demo: true },
];

export default function CartDrawer({
  open, onClose, slug,
  primary = "#2563eb", textColor = "#111111", mutedTextColor = "#888888",
  borderColor = "#eeeeee", surfaceColor = "#fafafa", bgColor = "#ffffff",
  isPreview = false, demoItems = DEFAULT_DEMO_ITEMS,
}) {
  const navigate = useNavigate();
  const { getCart, updateQuantity, removeFromCart, getCartTotal } = useCart();
  const realItems = getCart(slug);

  // ✦ حالة محلية للمنتجات التجريبية (باش أزرار +/− والحذف يخدمو فـ preview بلا ما يمسو السلة الحقيقية)
  const [demoState, setDemoState] = useState(demoItems);

  const usingDemo = isPreview && realItems.length === 0 && demoState.length > 0;
  const items = usingDemo ? demoState : realItems;
  const total = usingDemo
    ? demoState.reduce((sum, it) => sum + it.quantity * it.price, 0)
    : getCartTotal(slug);

  const handleQty = (productId, nextQty) => {
    if (usingDemo) {
      setDemoState(prev => nextQty <= 0
        ? prev.filter(it => it.productId !== productId)
        : prev.map(it => it.productId === productId ? { ...it, quantity: Math.min(nextQty, it.stock ?? 99) } : it));
    } else {
      updateQuantity(slug, productId, nextQty);
    }
  };
  const handleRemove = (productId) => {
    if (usingDemo) setDemoState(prev => prev.filter(it => it.productId !== productId));
    else removeFromCart(slug, productId);
  };

  if (!open) return null;

  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(15,15,20,.5)", zIndex: 998, backdropFilter: "blur(3px)" }} />
      <div dir="rtl" style={{
        position: "fixed", top: 0, right: 0, height: "100%", width: "min(410px, 92vw)",
        background: bgColor, zIndex: 999, display: "flex", flexDirection: "column",
        animation: "cd-slide-in .3s cubic-bezier(.32,.72,0,1) both", boxShadow: "-16px 0 40px rgba(0,0,0,.16)",
      }}>
        {/* Header */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "20px 22px", borderBottom: `1px solid ${borderColor}`,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 34, height: 34, borderRadius: 10, background: `${primary}17`,
              display: "flex", alignItems: "center", justifyContent: "center", color: primary,
            }}>
              <IconBag />
            </div>
            <h3 style={{ margin: 0, fontSize: 16.5, fontWeight: 800, color: textColor }}>سلة التسوق</h3>
            {items.length > 0 && (
              <span style={{
                fontSize: 11.5, fontWeight: 800, color: "#fff", background: primary,
                borderRadius: 999, minWidth: 21, height: 21, padding: "0 6px",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                {items.length}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="cd-close-btn"
            style={{ background: surfaceColor, border: "none", cursor: "pointer", color: textColor, padding: 7, borderRadius: 10, display: "flex" }}
          >
            <IconX size={18} />
          </button>
        </div>

        {/* Items */}
        <div style={{ flex: 1, overflowY: "auto", padding: items.length ? "16px 18px" : 0 }}>
          {items.length === 0 ? (
            <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12, padding: "0 24px", textAlign: "center" }}>
              <div style={{
                width: 68, height: 68, borderRadius: "50%", background: `${primary}12`,
                display: "flex", alignItems: "center", justifyContent: "center", color: primary,
              }}>
                <IconCartEmpty />
              </div>
              <p style={{ margin: 0, fontSize: 15, fontWeight: 800, color: textColor }}>السلة فارغة</p>
              <p style={{ margin: 0, fontSize: 13, color: mutedTextColor }}>زيد منتجات باش تبدا الطلب</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {items.map(item => (
                <div key={item.productId} style={{
                  display: "flex", alignItems: "center", gap: 11,
                  background: surfaceColor, borderRadius: 14, padding: 9,
                  border: `1px solid ${borderColor}`,
                }}>
                  {/* الصورة */}
                  <div style={{
                    width: 56, height: 56, borderRadius: 10, overflow: "hidden", flexShrink: 0,
                    background: bgColor, backgroundImage: `url(${item.image || DEFAULT_IMG})`,
                    backgroundSize: "cover", backgroundPosition: "center",
                  }} />

                  {/* الاسم + السعر + stepper */}
                  <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 6 }}>
                    <span style={{
                      fontSize: 13.5, fontWeight: 700, color: textColor,
                      whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                    }}>
                      {item.name}
                    </span>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                      <span style={{ fontSize: 12.5, fontWeight: 700, color: primary, whiteSpace: "nowrap" }}>
                        {item.price.toLocaleString()} <span style={{ fontSize: 10.5, fontWeight: 600, color: mutedTextColor }}>د.ج</span>
                      </span>

                      {/* stepper */}
                      <div style={{
                        display: "flex", alignItems: "center", gap: 4,
                        background: bgColor, border: `1px solid ${borderColor}`, borderRadius: 10, padding: "3px 8px",
                      }}>
                        <button
                          onClick={() => handleQty(item.productId, item.quantity - 1)}
                          className="cd-step-btn"
                          style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", padding: 2, color: mutedTextColor, borderRadius: 6 }}
                        ><IconMinus /></button>
                        <span style={{ fontSize: 11.5, fontWeight: 800, color: textColor, minWidth: 16, textAlign: "center" }}>{item.quantity}</span>
                        <button
                          onClick={() => handleQty(item.productId, item.quantity + 1)}
                          disabled={item.quantity >= (item.stock ?? 99)}
                          className="cd-step-btn"
                          style={{
                            background: "none", border: "none", display: "flex", alignItems: "center", justifyContent: "center", padding: 2, borderRadius: 6,
                            cursor: item.quantity >= (item.stock ?? 99) ? "not-allowed" : "pointer",
                            color: item.quantity >= (item.stock ?? 99) ? mutedTextColor : textColor,
                            opacity: item.quantity >= (item.stock ?? 99) ? .5 : 1,
                          }}
                        ><IconPlus /></button>
                      </div>
                    </div>
                  </div>

                  {/* حذف */}
                  <button
                    onClick={() => handleRemove(item.productId)}
                    className="cd-remove-btn"
                    style={{ background: "none", border: "none", cursor: "pointer", color: mutedTextColor, padding: 6, flexShrink: 0, borderRadius: 8 }}
                  >
                    <IconTrash />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div style={{ padding: "18px 22px 22px", borderTop: `1px solid ${borderColor}`, background: bgColor, boxShadow: "0 -8px 24px rgba(0,0,0,.04)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <span style={{ fontSize: 13.5, color: mutedTextColor, fontWeight: 600 }}>المجموع</span>
              <span style={{ fontSize: 19, fontWeight: 800, color: textColor }}>
                {total.toLocaleString()} <span style={{ fontSize: 12.5, fontWeight: 600, color: mutedTextColor }}>د.ج</span>
              </span>
            </div>
            <button
              onClick={() => { if (usingDemo) return; onClose?.(); navigate(`/store/${slug}/checkout`); }}
              className="cd-checkout-btn"
              style={{
                width: "100%", padding: "15px 0", border: "none", borderRadius: 14, background: primary, color: "#fff",
                fontSize: 14.5, fontWeight: 800, fontFamily: "inherit", cursor: usingDemo ? "default" : "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                opacity: usingDemo ? .85 : 1,
              }}
            >
              <IconBag />
              إتمام الطلب
            </button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes cd-slide-in { from { transform: translateX(100%); } to { transform: translateX(0); } }
        .cd-close-btn:hover { filter: brightness(.94); }
        .cd-step-btn:hover:not(:disabled) { background: rgba(0,0,0,.06); }
        .cd-remove-btn:hover { color: #ef4444 !important; background: #ef44441a; }
        .cd-checkout-btn:hover { filter: brightness(1.06); }
        .cd-checkout-btn:active { transform: scale(.98); }
      `}</style>
    </>
  );
}