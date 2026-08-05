// ============================================================
// 📁 context/CartContext.jsx — سلة التسوق (Cart) — عالمية عبر التطبيق
// ✦ كل متجر (slug) عندو سلة منفصلة، محفوظة فـ localStorage
// ✦ الاستعمال: const { addToCart, getCart, ... } = useCart();
// ============================================================
import { createContext, useContext, useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "saas_edge_carts"; // { [slug]: [{ productId, name, image, price, quantity, stock }] }

const CartContext = createContext(null);

function readStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function CartProvider({ children }) {
  const [carts, setCarts] = useState(readStorage);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(carts)); } catch { /* تجاهل — localStorage قد يكون معطل */ }
  }, [carts]);

  // ── إضافة منتج (أو زيادة الكمية إذا كان موجود فالسلة) ──
  const addToCart = useCallback((slug, product, quantity = 1) => {
    setCarts(prev => {
      const cart = prev[slug] || [];
      const existing = cart.find(it => it.productId === product._id);
      let nextCart;
      if (existing) {
        const nextQty = Math.min(existing.quantity + quantity, product.stock ?? 99);
        nextCart = cart.map(it => it.productId === product._id ? { ...it, quantity: nextQty } : it);
      } else {
        nextCart = [...cart, {
          productId: product._id,
          name:      product.name,
          image:     product.images?.[0] || product.image || "",
          price:     product.currentPrice,
          stock:     product.stock ?? 99,
          quantity:  Math.min(quantity, product.stock ?? 99),
        }];
      }
      return { ...prev, [slug]: nextCart };
    });
  }, []);

  // ── تحديث كمية منتج فالسلة (يحذفو إذا الكمية 0 أو أقل) ──
  const updateQuantity = useCallback((slug, productId, quantity) => {
    setCarts(prev => {
      const cart = prev[slug] || [];
      const nextCart = quantity <= 0
        ? cart.filter(it => it.productId !== productId)
        : cart.map(it => it.productId === productId ? { ...it, quantity: Math.min(quantity, it.stock ?? 99) } : it);
      return { ...prev, [slug]: nextCart };
    });
  }, []);

  const removeFromCart = useCallback((slug, productId) => {
    setCarts(prev => ({ ...prev, [slug]: (prev[slug] || []).filter(it => it.productId !== productId) }));
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