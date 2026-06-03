// ============================================================
// 📁 TopBar.jsx — الشريط العلوي
// يعرض: عنوان الصفحة + جرس الإشعارات + زر إضافة
// ============================================================

import { useNavigate } from "react-router-dom";

function TopBar({ title = "Dashboard", newOrdersCount = 0, onBellClick }) {
  const navigate = useNavigate();

  return (
    <header className="topbar">
      {/* ── Page Title ── */}
      <h1 className="topbar__title">{title}</h1>

      {/* ── Actions ── */}
      <div className="topbar__actions">

        {/* زر إضافة منتج سريع */}
        <button
          className="topbar__add-btn"
          onClick={() => navigate("/dashboard/products")}
          title="إضافة منتج"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/>
          </svg>
          <span>Product</span>
        </button>

        {/* جرس الإشعارات */}
        <button
          className={`topbar__bell${newOrdersCount > 0 ? " topbar__bell--ringing" : ""}`}
          onClick={onBellClick}
          title="الإشعارات"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M13.73 21a2 2 0 0 1-3.46 0"/>
          </svg>
          {newOrdersCount > 0 && (
            <span className="topbar__bell-badge">
              {newOrdersCount > 99 ? "99+" : newOrdersCount}
            </span>
          )}
        </button>

      </div>
    </header>
  );
}

export default TopBar;