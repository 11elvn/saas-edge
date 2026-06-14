// ============================================================
// 📁 Sidebar.jsx
// تصميم جديد: avatar وسط كبير + اسم + لينك + nav يسار→يمين
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

function Sidebar({ store, onLogout }) {
  const { pathname } = useLocation();

  const isActive = (to) =>
    to === "/dashboard"
      ? pathname === "/dashboard"
      : pathname.startsWith(to);

  const initial = store?.name?.charAt(0)?.toUpperCase() || "S";

  return (
    <aside className="sidebar">

      {/* ══ BRAND — avatar وسط كبير ══ */}
      <div className="sb-brand">
        <div className="sb-avatar">
          {store?.logo
            ? <img src={store.logo} alt="logo" className="sb-avatar__img" />
            : <span className="sb-avatar__letter">{initial}</span>
          }
        </div>
        <p className="sb-store-name">{store?.name || "متجري"}</p>
        {store?.slug && (
          <a
            href={`/store/${store.slug}`}
            target="_blank"
            rel="noreferrer"
            className="sb-store-pill"
          >
            <span className="sb-store-pill__dot" />
            {store.slug}
            <span style={{ marginLeft:4, opacity:.7 }}>{Icons.link}</span>
          </a>
        )}
      </div>

      {/* ══ NAV ══ */}
      <nav className="sb-nav">
        {NAV.map((section) => (
          <div key={section.group} className="sb-section">
            <span className="sb-section__label">{section.group}</span>
            {section.items.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={`sb-item ${isActive(item.to) ? "sb-item--active" : ""}`}
              >
                <span className="sb-item__icon">{item.icon}</span>
                <span className="sb-item__label">{item.label}</span>
              </Link>
            ))}
          </div>
        ))}
      </nav>

      {/* ══ FOOTER ══ */}
      <div className="sb-footer">
        <button onClick={onLogout} className="sb-logout">
          {Icons.logout}
          <span>تسجيل الخروج</span>
        </button>
      </div>

      {/* ══ STYLES ══ */}
      <style>{`
        /* brand block */
        .sb-brand {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 24px 16px 20px;
          text-align: center;
          gap: 8px;
        }

        /* avatar */
        .sb-avatar {
          width: 64px; height: 64px;
          border-radius: 18px;
          background: rgba(255,255,255,0.22);
          border: 2px solid rgba(255,255,255,0.30);
          overflow: hidden;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .sb-avatar__img  { width:100%; height:100%; object-fit:cover; }
        .sb-avatar__letter {
          color: #fff;
          font-size: 1.6rem;
          font-weight: 800;
          line-height: 1;
        }

        /* store name */
        .sb-store-name {
          color: #fff;
          font-size: .88rem;
          font-weight: 700;
          margin: 0;
          letter-spacing: .3px;
        }

        /* pill لينك المتجر */
        .sb-store-pill {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          background: rgba(255,255,255,0.15);
          border: 1px solid rgba(255,255,255,0.20);
          color: #fff;
          font-size: .72rem;
          font-weight: 500;
          padding: 4px 10px;
          border-radius: 99px;
          text-decoration: none;
          transition: background .15s;
          white-space: nowrap;
        }
        .sb-store-pill:hover { background: rgba(255,255,255,0.25); }
        .sb-store-pill__dot {
          width: 7px; height: 7px;
          border-radius: 50%;
          background: #4ade80;
          flex-shrink: 0;
        }

        /* nav */
        .sb-nav {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 2px;
          padding: 0 12px;
          overflow-y: auto;
        }

        .sb-section { margin-bottom: 6px; }

        .sb-section__label {
          display: block;
          font-size: .60rem;
          font-weight: 700;
          color: rgba(255,255,255,0.40);
          letter-spacing: 1px;
          padding: 8px 10px 4px;
          text-transform: uppercase;
          direction: ltr;
          text-align: left;
        }

        /* item: أيقونة + نص من يسار لين يمين */
        .sb-item {
          display: flex;
          flex-direction: row;
          align-items: center;
          gap: 10px;
          padding: 9px 12px;
          border-radius: 10px;
          font-size: .83rem;
          font-weight: 500;
          color: rgba(255,255,255,0.72);
          text-decoration: none;
          transition: background .15s, color .15s;
          cursor: pointer;
          direction: ltr;
        }
        .sb-item:hover {
          background: rgba(255,255,255,0.12);
          color: #fff;
        }
        .sb-item--active {
          background: rgba(255,255,255,0.20);
          color: #fff;
          font-weight: 600;
        }
        .sb-item__icon {
          display: flex; align-items: center; justify-content: center;
          width: 18px; flex-shrink: 0;
          opacity: .85;
        }
        .sb-item--active .sb-item__icon { opacity: 1; }
        .sb-item__label { flex: 1; }

        /* footer */
        .sb-footer {
          padding: 12px;
          border-top: 1px solid rgba(255,255,255,0.12);
          margin-top: 4px;
        }

        .sb-logout {
          display: flex;
          flex-direction: row;
          align-items: center;
          gap: 10px;
          padding: 9px 12px;
          border-radius: 10px;
          font-size: .83rem;
          color: rgba(255,255,255,0.72);
          background: none;
          border: none;
          cursor: pointer;
          width: 100%;
          font-family: inherit;
          transition: background .15s, color .15s;
          direction: ltr;
        }
        .sb-logout:hover {
          background: rgba(239,68,68,0.20);
          color: #fca5a5;
        }
      `}</style>
    </aside>
  );
}

export default Sidebar;