// ============================================================
// 📁 components/StoreNavbar.jsx — Shared navbar for all store pages
// لوغو كبير فقط بدون اسم المتجر، ثابت في كل الصفحات
// ============================================================

import { useState } from "react";
import { useNavigate } from "react-router-dom";

// ── Icons ───────────────────────────────────────────────────
const IconMenu = () => (
  <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24">
    <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
  </svg>
);
const IconX = () => (
  <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);
const IconCart = () => (
  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24">
    <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/>
  </svg>
);
const IconSearch = () => (
  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);

// ── Mobile Drawer ────────────────────────────────────────────
function MobileDrawer({ open, onClose, logo, storeName, primaryColor, secondaryColor, links }) {
  if (!open) return null;
  const initial = storeName?.charAt(0) || "م";

  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: "fixed", inset: 0,
          background: "rgba(0,0,0,.55)",
          zIndex: 998,
          backdropFilter: "blur(2px)",
        }}
      />
      <div style={{
        position: "fixed", top: 0, right: 0,
        width: "75%", maxWidth: 300,
        height: "100%",
        background: "#fff",
        zIndex: 999,
        padding: "24px 20px",
        display: "flex", flexDirection: "column",
        animation: "sn-slide-in .28s cubic-bezier(.32,.72,0,1) both",
        direction: "rtl",
      }}>
        <button
          onClick={onClose}
          style={{ background: "none", border: "none", cursor: "pointer", color: "#111", alignSelf: "flex-end", padding: 4 }}
        >
          <IconX />
        </button>

        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", margin: "20px 0 32px" }}>
          {logo
            ? <img src={logo} alt="logo" style={{ width: 80, height: 80, objectFit: "contain", borderRadius: 16 }} />
            : (
              <div style={{
                width: 80, height: 80, borderRadius: 16,
                background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor || "#0f172a"})`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontWeight: 900, color: "#fff", fontSize: 32,
              }}>{initial}</div>
            )
          }
        </div>

        <nav style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {links.map((item, i) => (
            <button key={i} onClick={() => { item.action(); onClose(); }} style={{
              background: "none", border: "none", cursor: "pointer",
              color: "#333", fontFamily: "inherit", fontSize: 15, fontWeight: 600,
              padding: "12px 16px", borderRadius: 10, textAlign: "right",
              transition: "background .2s",
            }}
            onMouseEnter={e => e.currentTarget.style.background = "#f5f5f5"}
            onMouseLeave={e => e.currentTarget.style.background = "none"}
            >{item.label}</button>
          ))}
        </nav>
      </div>

      <style>{`@keyframes sn-slide-in { from{transform:translateX(100%)} to{transform:translateX(0)} }`}</style>
    </>
  );
}

// ── Search Box ──────────────────────────────────────────────
function SearchBox({ open, onClose, slug, primaryColor }) {
  const navigate = useNavigate();
  const [q, setQ] = useState("");

  if (!open) return null;

  const submit = (e) => {
    e.preventDefault();
    const query = q.trim();
    if (!query) return;
    navigate(`/store/${slug}/search?q=${encodeURIComponent(query)}`);
    onClose();
  };

  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: "fixed", inset: 0,
          background: "rgba(0,0,0,.45)",
          zIndex: 998,
          backdropFilter: "blur(2px)",
        }}
      />
      <div style={{
        position: "fixed", top: 0, left: 0, right: 0,
        zIndex: 999,
        background: "#fff",
        borderBottom: "1px solid #f0f0f0",
        boxShadow: "0 8px 30px rgba(0,0,0,.08)",
        padding: "18px 24px",
        animation: "sn-search-drop .25s ease both",
        direction: "rtl",
      }}>
        <form onSubmit={submit} style={{ maxWidth: 640, margin: "0 auto", display: "flex", alignItems: "center", gap: 10 }}>
          <IconSearch />
          <input
            autoFocus
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder="ابحث عن منتج..."
            style={{
              flex: 1, border: "none", outline: "none",
              fontSize: 16, fontFamily: "inherit",
              background: "none", color: "#111",
              textAlign: "right",
            }}
          />
          <button type="submit" style={{
            background: primaryColor, color: "#fff",
            border: "none", borderRadius: 10,
            padding: "9px 18px", fontSize: 14, fontWeight: 700,
            cursor: "pointer", fontFamily: "inherit",
          }}>بحث</button>
          <button type="button" onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#888", padding: 6 }}>
            <IconX />
          </button>
        </form>
      </div>
      <style>{`@keyframes sn-search-drop { from{transform:translateY(-100%)} to{transform:translateY(0)} }`}</style>
    </>
  );
}

// ── Main Component ───────────────────────────────────────────
export default function StoreNavbar({ store, slug, cartCount = 0, onCartClick, onSearchClick, links }) {
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const logo      = store?.logo || "";
  const storeName = store?.name || "المتجر";
  const primary   = store?.primaryColor   || "#2563eb";
  const secondary = store?.secondaryColor || "#0f172a";
  const initial   = storeName.charAt(0);

  const navLinks = links || [
    { label: "الصفحة الرئيسية", action: () => navigate(`/store/${slug}`) },
    { label: "التصنيفات",       action: () => navigate(`/store/${slug}/collections`) },
  ];

  return (
    <>
      <MobileDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        logo={logo}
        storeName={storeName}
        primaryColor={primary}
        secondaryColor={secondary}
        links={navLinks}
      />

      <SearchBox
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        slug={slug}
        primaryColor={primary}
      />

      <nav style={{
        position: "sticky", top: 0, zIndex: 100,
        background: "rgba(255,255,255,.96)",
        backdropFilter: "blur(16px)",
        borderBottom: "1px solid #f0f0f0",
        padding: "0 24px",
        height: 68,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        direction: "rtl",
      }}>

        <div
          onClick={() => navigate(`/store/${slug}`)}
          style={{ cursor: "pointer", display: "flex", alignItems: "center" }}
        >
          {logo ? (
            <img
              src={logo}
              alt={storeName}
              style={{ height: 52, width: "auto", maxWidth: 160, objectFit: "contain" }}
            />
          ) : (
            <div style={{
              height: 52, width: 52, borderRadius: 12,
              background: `linear-gradient(135deg, ${primary}, ${secondary})`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontWeight: 900, color: "#fff", fontSize: 22,
            }}>{initial}</div>
          )}
        </div>

        <div style={{ display: "flex", gap: 4 }} className="sn-desktop-nav">
          {navLinks.map((item, i) => (
            <button key={i} onClick={item.action} style={{
              background: "none", border: "none", cursor: "pointer",
              color: "#555", fontFamily: "inherit", fontSize: 14, fontWeight: 600,
              padding: "8px 14px", borderRadius: 8,
              transition: "color .2s, background .2s",
            }}
            onMouseEnter={e => { e.currentTarget.style.color = "#111"; e.currentTarget.style.background = "#f3f4f6"; }}
            onMouseLeave={e => { e.currentTarget.style.color = "#555"; e.currentTarget.style.background = "none"; }}
            >{item.label}</button>
          ))}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button onClick={() => { onSearchClick ? onSearchClick() : setSearchOpen(true); }} style={{
            background: "none", border: "none", cursor: "pointer",
            color: "#555", padding: 8, borderRadius: 8,
            transition: "background .2s, color .2s",
          }}
          onMouseEnter={e => { e.currentTarget.style.background = "#f3f4f6"; e.currentTarget.style.color = "#111"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "none"; e.currentTarget.style.color = "#555"; }}
          >
            <IconSearch />
          </button>

          {onCartClick && (
            <button onClick={onCartClick} style={{
              background: "none", border: "none", cursor: "pointer",
              color: "#555", padding: 8, borderRadius: 8,
              position: "relative",
              transition: "background .2s, color .2s",
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "#f3f4f6"; e.currentTarget.style.color = "#111"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "none"; e.currentTarget.style.color = "#555"; }}
            >
              <IconCart />
              {cartCount > 0 && (
                <span style={{
                  position: "absolute", top: 2, right: 2,
                  width: 16, height: 16, borderRadius: "50%",
                  background: primary, color: "#fff",
                  fontSize: 9, fontWeight: 800,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>{cartCount}</span>
              )}
            </button>
          )}

          <button
            onClick={() => setDrawerOpen(true)}
            className="sn-mobile-menu"
            style={{ background: "none", border: "none", cursor: "pointer", color: "#111", padding: 6, borderRadius: 8, display: "none" }}
          >
            <IconMenu />
          </button>
        </div>
      </nav>

      <style>{`
        @media (max-width: 768px) {
          .sn-desktop-nav { display: none !important; }
          .sn-mobile-menu { display: flex !important; }
        }
      `}</style>
    </>
  );
}