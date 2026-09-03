// ============================================================
// 📁 AppLayout.jsx — الهيكل الرئيسي للداشبورد
// يلف كل صفحات الداشبورد: Sidebar + TopBar + Content
// ============================================================

import { useEffect, useRef, useState } from "react";
import { useNavigate }                  from "react-router-dom";
import Sidebar                          from "./Sidebar";
import TopBar                           from "./TopBar";

function AppLayout({ children, title, flush = false }) {
  const navigate  = useNavigate();
  const token     = localStorage.getItem("token");

  // ── Store data ──────────────────────────────
  const [store, setStore] = useState(null);

  // ── Notifications ───────────────────────────
  const [newOrdersCount, setNewOrdersCount] = useState(0);
  const lastOrderIdRef = useRef(null);

  // ── Fetch store ─────────────────────────────
  useEffect(() => {
    if (!token) { navigate("/login"); return; }

    fetch(`${import.meta.env.VITE_API_URL}/api/stores/my-store`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => {
        // ✦ إصلاح: التوكن كي يخلص (401)، الداشبورد كان يبقى فارغ بلا ما
        // المستخدم يفهم علاش — دابا كنمسحو التوكن ونرجعوه للـ login مباشرة
        if (r.status === 401) { localStorage.removeItem("token"); navigate("/login"); return null; }
        return r.json();
      })
      .then((d) => { if (d?.store) setStore(d.store); })
      .catch(console.error);
  }, []);

  // ── Polling (إشعارات real-time) ─────────────
  const playSound = () => {
    try {
      const ctx  = new (window.AudioContext || window.webkitAudioContext)();
      const osc  = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.3);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
      osc.start(); osc.stop(ctx.currentTime + 0.5);
    } catch (_) {}
  };

  const pollOrders = async () => {
    if (!token) return;
    try {
      const res  = await fetch(`${import.meta.env.VITE_API_URL}/api/orders/my-orders`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // ✦ إصلاح: نفس معالجة انتهاء التوكن هنا زادة — الـ polling كان غير كيسكت
      // ويوقف بلا ما يوري حتى إشارة للمستخدم
      if (res.status === 401) { localStorage.removeItem("token"); navigate("/login"); return; }
      if (!res.ok) return;
      const data = await res.json();
      if (!Array.isArray(data) || data.length === 0) return;

      const latestId = data[0]._id;

      if (lastOrderIdRef.current === null) {
        lastOrderIdRef.current = latestId;
        return;
      }

      if (lastOrderIdRef.current !== latestId) {
        const prevDate = data.find((o) => o._id === lastOrderIdRef.current)?.createdAt;
        const count    = prevDate
          ? data.filter((o) => new Date(o.createdAt) > new Date(prevDate)).length
          : 1;
        lastOrderIdRef.current = latestId;
        setNewOrdersCount((c) => c + count);
        playSound();
      }
    } catch (_) {}
  };

  useEffect(() => {
    const id = setInterval(pollOrders, 10_000);
    return () => clearInterval(id);
  }, []);

  // ── Logout ──────────────────────────────────
  const logout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const handleBellClick = () => {
    setNewOrdersCount(0);
    navigate("/dashboard/orders");
  };

  return (
    <div className="app-layout" dir="rtl">

      {/* ── Sidebar ── */}
      <Sidebar store={store} onLogout={logout} />

      {/* ── Main ── */}
      <div className="app-layout__main">
        <TopBar
          title={title}
          newOrdersCount={newOrdersCount}
          onBellClick={handleBellClick}
        />
        <div className={`app-layout__content${flush ? " app-layout__content--flush" : ""}`}>
          {children}
        </div>
      </div>

    </div>
  );
}

export default AppLayout;