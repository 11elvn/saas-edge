// ============================================================
// 📁 context/CartContext.jsx — سلة التسوق (Cart) — عالمية عبر التطبيق
// ✦ كل متجر (slug) عندو سلة منفصلة، محفوظة فـ localStorage
// ✦ الاستعمال: const { addToCart, getCart, ... } = useCart();
// ============================================================
import { createContext, useContext, useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "saas_edge_carts"; // { [slug]: [{ cartItemId, productId, name, image, price, quantity, stock, color, size }] }

const CartContext = createContext(null);

// ✦ سطر السلة كيتحدد بـ productId + color + size — باش نفس المنتج بـ 2 ألوان/مقاسات
// مختلفين يبقاو سطرين منفصلين فالسلة، ماشي يتجمعو فسطر واحد (كانو قبل كيتجمعو
// ويضيع اختيار الزبون للون/المقاس)
function makeCartItemId(productId, color, size) {
  return `${productId}::${color || ""}::${size || ""}`;
}

function readStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    // ✦ توافق مع سلال قديمة محفوظة قبل إضافة cartItemId — نولدوه إذا ناقص
    Object.keys(parsed).forEach(slug => {
      parsed[slug] = (parsed[slug] || []).map(it => ({
        ...it,
        cartItemId: it.cartItemId || makeCartItemId(it.productId, it.color, it.size),
      }));
    });
    return parsed;
  } catch {
    return {};
  }
}

export function CartProvider({ children }) {
  const [carts, setCarts] = useState(readStorage);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(carts)); } catch { /* تجاهل — localStorage قد يكون معطل */ }
  }, [carts]);

  // ── إضافة منتج (أو زيادة الكمية إذا كان موجود فالسلة بنفس اللون/المقاس) ──
  // ✦ variant: { color, size } — اختياري، كي المنتج فيه ألوان/مقاسات
  const addToCart = useCallback((slug, product, quantity = 1, variant = {}) => {
    const { color = null, size = null } = variant;
    const cartItemId = makeCartItemId(product._id, color, size);
    setCarts(prev => {
      const cart = prev[slug] || [];
      const existing = cart.find(it => it.cartItemId === cartItemId);
      let nextCart;
      if (existing) {
        const nextQty = Math.min(existing.quantity + quantity, product.stock ?? 99);
        nextCart = cart.map(it => it.cartItemId === cartItemId ? { ...it, quantity: nextQty } : it);
      } else {
        nextCart = [...cart, {
          cartItemId,
          productId: product._id,
          name:      product.name,
          image:     product.images?.[0] || product.image || "",
          price:     product.currentPrice,
          stock:     product.stock ?? 99,
          quantity:  Math.min(quantity, product.stock ?? 99),
          color,
          size,
        }];
      }
      return { ...prev, [slug]: nextCart };
    });
  }, []);

  // ── تحديث كمية سطر فالسلة (يحذفو إذا الكمية 0 أو أقل) ──
  const updateQuantity = useCallback((slug, cartItemId, quantity) => {
    setCarts(prev => {
      const cart = prev[slug] || [];
      const nextCart = quantity <= 0
        ? cart.filter(it => it.cartItemId !== cartItemId)
        : cart.map(it => it.cartItemId === cartItemId ? { ...it, quantity: Math.min(quantity, it.stock ?? 99) } : it);
      return { ...prev, [slug]: nextCart };
    });
  }, []);

  const removeFromCart = useCallback((slug, cartItemId) => {
    setCarts(prev => ({ ...prev, [slug]: (prev[slug] || []).filter(it => it.cartItemId !== cartItemId) }));
  }, []);

  const clearCart = useCallback((slug) => {
    setCarts(prev => ({ ...prev, [slug]: [] }));
  }, []);

  const getCart = useCallback((slug) => carts[slug] || [], [carts]);
  const getCartCount = useCallback((slug) => (carts[slug] || []).reduce((sum, it) => sum + it.quantity, 0), [carts]);
  const getCartTotal = useCallback((slug) => (carts[slug] || []).reduce((sum, it) => sum + it.quantity * it.price, 0), [carts]);

  return (
    <CartContext.Provider value={{ addToCart, updateQuantity, removeFromCart, clearCart, getCart, getCartCount, getCartTotal }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart لازم يتستعمل جوه <CartProvider>");
  return ctx;
}