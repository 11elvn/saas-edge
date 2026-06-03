// ============================================================
// 📁 Sidebar.jsx — الشريط الجانبي الثابت
// يظهر في كل صفحات الداشبورد
// ============================================================

import { Link, useLocation } from "react-router-dom";

// ── nav items ──────────────────────────────────────────────
const NAV = [
  {
    group: "OVERVIEW",
    items: [
      { to: "/dashboard",        icon: "⊞", label: "Overview"    },
      { to: "/dashboard/orders", icon: "🛒", label: "Orders"      },
    ],
  },
  {
    group: "STORE",
    items: [
      { to: "/dashboard/products",    icon: "📦", label: "Products"   },
      { to: "/dashboard/categories",  icon: "📁", label: "Categories" },
      { to: "/theme",                 icon: "🎨", label: "Themes"     },
    ],
  },
  {
    group: "MANAGEMENT",
    items: [
      { to: "/dashboard/inventory", icon: "📊", label: "Inventory"  },
    ],
  },
];

function Sidebar({ store, onLogout }) {
  const { pathname } = useLocation();

  // ── helper: هل الرابط نشط؟ ──
  const isActive = (to) =>
    to === "/dashboard"
      ? pathname === "/dashboard"
      : pathname.startsWith(to);

  return (
    <aside className="sidebar">
      {/* ── Avatar + Store Name ── */}
      <div className="sidebar__brand">
        <div className="sidebar__avatar">
          {store?.logo
            ? <img src={store.logo} alt="logo" className="sidebar__avatar-img" />
            : <span className="sidebar__avatar-initials">
                {store?.name?.charAt(0)?.toUpperCase() || "S"}
              </span>
          }
        </div>
        <div className="sidebar__brand-info">
          <span className="sidebar__store-name">{store?.name || "متجري"}</span>
          <span className="sidebar__store-slug">/{store?.slug || "..."}</span>
        </div>
      </div>

      {/* ── Divider ── */}
      <div className="sidebar__divider" />

      {/* ── Navigation ── */}
      <nav className="sidebar__nav">
        {NAV.map((section) => (
          <div key={section.group} className="sidebar__section">
            <span className="sidebar__group-label">{section.group}</span>
            {section.items.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={`sidebar__item ${isActive(item.to) ? "sidebar__item--active" : ""}`}
              >
                <span className="sidebar__item-icon">{item.icon}</span>
                <span className="sidebar__item-label">{item.label}</span>
                {/* dot نشط */}
                {isActive(item.to) && <span className="sidebar__item-dot" />}
              </Link>
            ))}
          </div>
        ))}
      </nav>

      {/* ── Bottom: Store Link + Logout ── */}
      <div className="sidebar__footer">
        {store?.slug && (
          <a
            href={`/store/${store.slug}`}
            target="_blank"
            rel="noreferrer"
            className="sidebar__store-link"
          >
            <span>🌐</span>
            <span>فتح المتجر</span>
            <span className="sidebar__store-link-arrow">↗</span>
          </a>
        )}
        <button onClick={onLogout} className="sidebar__logout">
          <span>⏻</span>
          <span>تسجيل الخروج</span>
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;