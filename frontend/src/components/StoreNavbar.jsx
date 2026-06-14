// ============================================================
// 📁 components/StoreNavbar.jsx
// Desktop: navbar عريضة — لوجو يمين كبير + nav وسط + بحث يسار
// Mobile:  بحث يسار + لوجو وسط + hamburger يمين
// ============================================================

import { useState } from "react";
import { useNavigate } from "react-router-dom";

// ── Icons ────────────────────────────────────────────────────
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
      <div onClick={onClose} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.55)", zIndex:998, backdropFilter:"blur(2px)" }} />
      <div style={{
        position:"fixed", top:0, right:0,
        width:"75%", maxWidth:300, height:"100%",
        background:"#fff", zIndex:999,
        padding:"24px 20px",
        display:"flex", flexDirection:"column",
        animation:"sn-slide-in .28s cubic-bezier(.32,.72,0,1) both",
        direction:"rtl",
      }}>
        <button onClick={onClose} style={{ background:"none", border:"none", cursor:"pointer", color:"#111", alignSelf:"flex-end", padding:4 }}>
          <IconX />
        </button>
        <div style={{ display:"flex", flexDirection:"column", alignItems:"center", margin:"20px 0 32px" }}>
          {logo
            ? <img src={logo} alt="logo" style={{ width:80, height:80, objectFit:"contain", borderRadius:16 }} />
            : <div style={{ width:80, height:80, borderRadius:16, background:`linear-gradient(135deg, ${primaryColor}, ${secondaryColor||"#0f172a"})`, display:"flex", alignItems:"center", justifyContent:"center", fontWeight:900, color:"#fff", fontSize:32 }}>{initial}</div>
          }
        </div>
        <nav style={{ display:"flex", flexDirection:"column", gap:4 }}>
          {links.map((item, i) => (
            <button key={i} onClick={() => { item.action(); onClose(); }} style={{
              background:"none", border:"none", cursor:"pointer",
              color:"#333", fontFamily:"inherit", fontSize:15, fontWeight:600,
              padding:"12px 16px", borderRadius:10, textAlign:"right", transition:"background .2s",
            }}
            onMouseEnter={e => e.currentTarget.style.background="#f5f5f5"}
            onMouseLeave={e => e.currentTarget.style.background="none"}
            >{item.label}</button>
          ))}
        </nav>
      </div>
      <style>{`@keyframes sn-slide-in { from{transform:translateX(100%)} to{transform:translateX(0)} }`}</style>
    </>
  );
}

// ── Search Box ───────────────────────────────────────────────
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
      <div onClick={onClose} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.45)", zIndex:998, backdropFilter:"blur(2px)" }} />
      <div style={{
        position:"fixed", top:0, left:0, right:0, zIndex:999,
        background:"#fff", borderBottom:"1px solid #f0f0f0",
        boxShadow:"0 8px 30px rgba(0,0,0,.08)",
        padding:"18px 24px",
        animation:"sn-search-drop .25s ease both",
        direction:"rtl",
      }}>
        <form onSubmit={submit} style={{ maxWidth:640, margin:"0 auto", display:"flex", alignItems:"center", gap:10 }}>
          <IconSearch />
          <input autoFocus value={q} onChange={e => setQ(e.target.value)}
            placeholder="ابحث عن منتج..."
            style={{ flex:1, border:"none", outline:"none", fontSize:16, fontFamily:"inherit", background:"none", color:"#111", textAlign:"right" }}
          />
          <button type="submit" style={{ background:primaryColor, color:"#fff", border:"none", borderRadius:10, padding:"9px 18px", fontSize:14, fontWeight:700, cursor:"pointer", fontFamily:"inherit" }}>بحث</button>
          <button type="button" onClick={onClose} style={{ background:"none", border:"none", cursor:"pointer", color:"#888", padding:6 }}><IconX /></button>
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
    { label: "اتصل بنا",        action: () => {} },
  ];

  const handleSearch = () => { onSearchClick ? onSearchClick() : setSearchOpen(true); };

  return (
    <>
      <MobileDrawer
        open={drawerOpen} onClose={() => setDrawerOpen(false)}
        logo={logo} storeName={storeName}
        primaryColor={primary} secondaryColor={secondary}
        links={navLinks}
      />
      <SearchBox open={searchOpen} onClose={() => setSearchOpen(false)} slug={slug} primaryColor={primary} />

      <nav className="sn-nav">

        {/* ══ DESKTOP LAYOUT ══════════════════════════════════ */}
        {/* يسار: بحث */}
        <div className="sn-desktop-left">
          <button className="sn-icon-btn" onClick={handleSearch}>
            <IconSearch />
          </button>
        </div>

        {/* وسط: روابط nav */}
        <div className="sn-desktop-center">
          {navLinks.map((item, i) => (
            <button key={i} onClick={item.action} className="sn-nav-link">{item.label}</button>
          ))}
        </div>

        {/* يمين: لوجو كبير */}
        <div className="sn-desktop-right" onClick={() => navigate(`/store/${slug}`)} style={{ cursor:"pointer" }}>
          {logo ? (
            <img src={logo} alt={storeName} className="sn-logo-img" />
          ) : (
            <div className="sn-logo-fallback" style={{ background:`linear-gradient(135deg, ${primary}, ${secondary})` }}>
              {initial}
            </div>
          )}
        </div>

        {/* ══ MOBILE LAYOUT ═══════════════════════════════════ */}
        {/* يسار: بحث */}
        <button className="sn-mobile-search sn-icon-btn" onClick={handleSearch}>
          <IconSearch />
        </button>

        {/* وسط: لوجو */}
        <div className="sn-mobile-logo" onClick={() => navigate(`/store/${slug}`)} style={{ cursor:"pointer" }}>
          {logo ? (
            <img src={logo} alt={storeName} style={{ height:44, width:"auto", maxWidth:120, objectFit:"contain" }} />
          ) : (
            <div style={{ height:44, width:44, borderRadius:10, background:`linear-gradient(135deg, ${primary}, ${secondary})`, display:"flex", alignItems:"center", justifyContent:"center", fontWeight:900, color:"#fff", fontSize:20 }}>{initial}</div>
          )}
        </div>

        {/* يمين: hamburger */}
        <button className="sn-mobile-menu sn-icon-btn" onClick={() => setDrawerOpen(true)}>
          <IconMenu />
        </button>

      </nav>

      <style>{`
        /* ── Base nav ── */
        .sn-nav {
          position: sticky;
          top: 0;
          z-index: 100;
          background: rgba(255,255,255,.97);
          backdrop-filter: blur(16px);
          border-bottom: 1px solid #f0f0f0;
          direction: rtl;
        }

        /* ── Icon button shared ── */
        .sn-icon-btn {
          background: none;
          border: none;
          cursor: pointer;
          color: #555;
          padding: 8px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          transition: background .2s, color .2s;
        }
        .sn-icon-btn:hover { background: #f3f4f6; color: #111; }

        /* ── Nav link ── */
        .sn-nav-link {
          background: none;
          border: none;
          cursor: pointer;
          color: #444;
          font-family: inherit;
          font-size: 15px;
          font-weight: 600;
          padding: 8px 18px;
          border-radius: 8px;
          transition: color .2s, background .2s;
          white-space: nowrap;
        }
        .sn-nav-link:hover { color: #111; background: #f3f4f6; }

        /* ══════════════════════════════
           DESKTOP  (> 768px)
        ══════════════════════════════ */
        @media (min-width: 769px) {
          .sn-nav {
            height: 80px;
            padding: 0 40px;
            display: flex;
            align-items: center;
            justify-content: space-between;
          }

          /* يسار */
          .sn-desktop-left  { display: flex; align-items: center; gap: 8px; flex: 1; }

          /* وسط */
          .sn-desktop-center {
            display: flex;
            align-items: center;
            gap: 4px;
            flex: 2;
            justify-content: center;
          }

          /* يمين: لوجو */
          .sn-desktop-right { display: flex; align-items: center; flex: 1; justify-content: flex-end; }
          .sn-logo-img      { height: 68px; width: auto; max-width: 200px; object-fit: contain; }
          .sn-logo-fallback {
            height: 60px; width: 60px; border-radius: 14px;
            display: flex; align-items: center; justify-content: center;
            font-weight: 900; color: #fff; font-size: 26px;
          }

          /* إخفاء عناصر الموبايل */
          .sn-mobile-search,
          .sn-mobile-logo,
          .sn-mobile-menu   { display: none !important; }
        }

        /* ══════════════════════════════
           MOBILE  (≤ 768px)
        ══════════════════════════════ */
        @media (max-width: 768px) {
          .sn-nav {
            height: 60px;
            padding: 0 16px;
            display: flex;
            align-items: center;
            justify-content: space-between;
          }

          /* إخفاء عناصر الديسكتوب */
          .sn-desktop-left,
          .sn-desktop-center,
          .sn-desktop-right { display: none !important; }

          /* موبايل */
          .sn-mobile-search { display: flex !important; }
          .sn-mobile-logo   { display: flex !important; position: absolute; left: 50%; transform: translateX(-50%); }
          .sn-mobile-menu   { display: flex !important; }
        }
      `}</style>
    </>
  );
}