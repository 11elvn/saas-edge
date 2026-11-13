// ============================================================
// 📁 Sidebar.jsx
// تصميم: خلفية بيضاء — بطاقات (brand card + مجموعات nav + footer card)
// ============================================================

import { Link, useLocation } from "react-router-dom";

// SVG icons بدل emoji
const Icons = {
  overview:   <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>,
  orders:     <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>,
  products:   <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M21 16V8a2 2 0 0 0-1-1.73L13 2.27a2 2 0 0 0-2 0L4 6.27A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73L11 21.73a2 2 0 0 0 2 0L20 17.73A2 2 0 0 0 21 16z"/></svg>,
  categories: <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>,
  themes:     <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 2a10 10 0 0 1 0 20"/><path d="M2 12h20"/></svg>,
  inventory:  <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
  logout:     <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
  link:       <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>,
};

const NAV = [
  {
    group: "OVERVIEW",
    items: [
      { to: "/dashboard",        icon: Icons.overview,   label: "Overview"    },
      { to: "/dashboard/orders", icon: Icons.orders,     label: "Orders"      },
    ],
  },
  {
    group: "STORE",
    items: [
      { to: "/dashboard/products",   icon: Icons.products,   label: "Products"   },
      { to: "/dashboard/categories", icon: Icons.categories, label: "Categories" },
      { to: "/theme",                icon: Icons.themes,     label: "Themes"     },
    ],
  },
  {
    group: "MANAGEMENT",
    items: [
      { to: "/dashboard/inventory", icon: Icons.inventory, label: "Inventory" },
    ],
  },
];

function Sidebar({ store, onLogout, collapsed = false, onToggle }) {
  const { pathname } = useLocation();

  const isActive = (to) =>
    to === "/dashboard"
      ? pathname === "/dashboard"
      : pathname.startsWith(to);

  const initial = store?.name?.charAt(0)?.toUpperCase() || "S";

  return (
    <aside className={`sidebar sb${collapsed ? " sb--collapsed" : ""}`}>

      {/* ══ TOGGLE — فتح / تسكير القائمة ══ */}
      <div className="sb-top">
        <button
          type="button"
          className="sb-toggle"
          onClick={onToggle}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          aria-expanded={!collapsed}
        >
          <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            <rect x="3" y="4" width="18" height="16" rx="2.5"/>
            <line x1="9" y1="4" x2="9" y2="20"/>
          </svg>
        </button>
      </div>

      {/* ══ BRAND CARD ══ */}
      <div className="sb-card sb-brand">
        <div className="sb-brand__row">
          <div className="sb-avatar" title={collapsed ? (store?.name || "") : undefined}>
            {store?.logo
              ? <img src={store.logo} alt="logo" className="sb-avatar__img" />
              : <span className="sb-avatar__letter">{initial}</span>
            }
          </div>
          <div className="sb-brand__info">
            <p className="sb-store-name">{store?.name || "متجري"}</p>
            {store?.slug && (
              <span className="sb-store-slug">
                {store.slug}
                <i className="sb-dot" />
              </span>
            )}
          </div>
        </div>
        {store?.slug && (
          <a
            href={`/store/${store.slug}`}
            target="_blank"
            rel="noreferrer"
            className="sb-view-btn"
          >
            {Icons.link}
            View store
          </a>
        )}
      </div>

      {/* ══ NAV — كل مجموعة في بطاقة ══ */}
      <nav className="sb-nav">
        {NAV.map((section) => (
          <div key={section.group} className="sb-section">
            <span className="sb-section__label">{section.group}</span>
            <div className="sb-card sb-group">
              {section.items.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`sb-item ${isActive(item.to) ? "sb-item--active" : ""}`}
                  title={collapsed ? item.label : undefined}
                >
                  <span className="sb-item__icon">{item.icon}</span>
                  <span className="sb-item__label">{item.label}</span>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* ══ FOOTER CARD ══ */}
      <div className="sb-card sb-footer">
        <button onClick={onLogout} className="sb-logout" title={collapsed ? "تسجيل الخروج" : undefined}>
          {Icons.logout}
          <span>تسجيل الخروج</span>
        </button>
      </div>

      {/* ══ STYLES ══ */}
      <style>{`
        .sidebar.sb {
          padding: 12px;
          gap: 10px;
          background: #faf8ff;
          border-right: 1px solid #ebe7f7;
          font-family: 'Inter', sans-serif;
        }

        /* بطاقة بيضاء مشتركة */
        .sb-card {
          background: #fff;
          border: 1px solid #ebe7f7;
          border-radius: 12px;
        }

        /* brand card */
        .sb-brand { padding: 12px; flex-shrink: 0; }
        .sb-brand__row { display: flex; align-items: center; gap: 10px; }
        .sb-brand__info { min-width: 0; }

        .sb-avatar {
          width: 40px; height: 40px;
          border-radius: 50%;
          background: #ece7fb;
          overflow: hidden;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .sb-avatar__img  { width: 100%; height: 100%; object-fit: cover; }
        .sb-avatar__letter { color: #5b3fd6; font-size: 1.1rem; font-weight: 800; line-height: 1; }

        .sb-store-name {
          color: #1f1747;
          font-size: .88rem;
          font-weight: 700;
          margin: 0;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .sb-store-slug {
          display: flex; align-items: center; gap: 5px;
          color: #8b7fae; font-size: .72rem; margin-top: 2px;
        }
        .sb-dot { width: 7px; height: 7px; border-radius: 50%; background: #34c759; display: block; flex-shrink: 0; }

        .sb-view-btn {
          margin-top: 10px;
          display: flex; align-items: center; justify-content: center; gap: 6px;
          background: #f1eefd; color: #5b3fd6;
          font-size: .74rem; font-weight: 600;
          padding: 7px; border-radius: 8px;
          text-decoration: none;
          transition: background .15s;
        }
        .sb-view-btn:hover { background: #e7e1fa; }

        /* nav */
        .sb-nav {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 10px;
          overflow-y: auto;
          min-height: 0;
        }
        .sb-section__label {
          display: block;
          font-size: .62rem;
          font-weight: 700;
          color: #a89ccb;
          letter-spacing: 1px;
          padding: 0 6px 5px;
          text-transform: uppercase;
          direction: ltr;
          text-align: left;
        }
        .sb-group { padding: 4px; display: flex; flex-direction: column; gap: 1px; }

        .sb-item {
          position: relative;
          display: flex;
          flex-direction: row;
          align-items: center;
          gap: 10px;
          padding: 8px 10px;
          border-radius: 8px;
          font-size: .83rem;
          font-weight: 500;
          color: #5b4f87;
          text-decoration: none;
          transition: background .15s, color .15s;
          cursor: pointer;
          direction: ltr;
        }
        .sb-item:hover { background: #f8f6ff; color: #5b3fd6; }
        .sb-item--active {
          background: #f4f1fe;
          color: #5b3fd6;
          font-weight: 600;
        }
        .sb-item--active::before {
          content: "";
          position: absolute; left: 0; top: 8px; bottom: 8px;
          width: 3px; border-radius: 3px;
          background: #6c5ce7;
        }
        .sb-item__icon {
          display: flex; align-items: center; justify-content: center;
          width: 18px; flex-shrink: 0;
          opacity: .85;
        }
        .sb-item--active .sb-item__icon { opacity: 1; }
        .sb-item__label { flex: 1; }

        /* footer card */
        .sb-footer { padding: 4px; flex-shrink: 0; }
        .sb-logout {
          display: flex;
          flex-direction: row;
          align-items: center;
          gap: 10px;
          padding: 8px 10px;
          border-radius: 8px;
          font-size: .83rem;
          color: #8b7fae;
          background: none;
          border: none;
          cursor: pointer;
          width: 100%;
          font-family: inherit;
          transition: background .15s, color .15s;
          direction: ltr;
        }
        .sb-logout:hover { background: #fef2f2; color: #dc2626; }

        /* زر الفتح / التسكير */
        .sb-top { display: flex; justify-content: flex-end; flex-shrink: 0; }
        .sb-toggle {
          width: 34px; height: 34px;
          display: flex; align-items: center; justify-content: center;
          background: #fff; color: #5b4f87;
          border: 1px solid #ebe7f7; border-radius: 10px;
          cursor: pointer; transition: background .15s, color .15s, border-color .15s;
        }
        .sb-toggle:hover { background: #f4f1fe; color: #5b3fd6; border-color: #e0d9f7; }

        /* ══ حالة التسكير: شريط أيقونات فقط (حاسوب) ══ */
        @media (min-width: 769px) {
          .sidebar.sb { transition: width .22s ease; overflow-x: hidden; }
          .sb--collapsed { padding: 12px 10px; }
          .sb--collapsed .sb-top { justify-content: center; }
          .sb--collapsed .sb-brand { padding: 8px; }
          .sb--collapsed .sb-brand__row { justify-content: center; }
          .sb--collapsed .sb-brand__info,
          .sb--collapsed .sb-view-btn,
          .sb--collapsed .sb-section__label,
          .sb--collapsed .sb-item__label,
          .sb--collapsed .sb-logout span { display: none; }
          .sb--collapsed .sb-item { justify-content: center; padding: 10px 0; }
          .sb--collapsed .sb-item--active::before { display: none; }
          .sb--collapsed .sb-item__icon { width: auto; }
          .sb--collapsed .sb-logout { justify-content: center; padding: 10px 0; }
        }
      `}</style>
    </aside>
  );
}

export default Sidebar;