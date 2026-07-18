// ============================================================
// 📁 components/StoreNavbar.jsx
// Desktop LTR: [Search]  [Nav Links]  [Logo]
//              يسار        وسط         يمين
// Mobile  LTR: [Hamburger]  [Logo]  [Search]
//              يمين          وسط      يسار
// ============================================================

import { useState } from "react";
import { useNavigate } from "react-router-dom";

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
const IconCart = () => (
  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24">
    <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/>
  </svg>
);

function MobileDrawer({ open, onClose, logo, storeName, primaryColor, secondaryColor, links, showStoreName = true }) {
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
        <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:10, margin:"20px 0 32px" }}>
          {logo ? (
            <img src={logo} alt="logo" style={{ width:80, height:80, objectFit:"contain", borderRadius:16 }} />
          ) : showStoreName ? (
            <div style={{ fontWeight:900, fontSize:22, color:"#111", textAlign:"center", lineHeight:1.2 }}>{storeName}</div>
          ) : (
            <div style={{ width:80, height:80, borderRadius:16, background:`linear-gradient(135deg, ${primaryColor}, ${secondaryColor||"#0f172a"})`, display:"flex", alignItems:"center", justifyContent:"center", fontWeight:900, color:"#fff", fontSize:32 }}>{initial}</div>
          )}
          {logo && showStoreName && (
            <div style={{ fontWeight:800, fontSize:15, color:"#111" }}>{storeName}</div>
          )}
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

// ✦ أضفنا headerSettings كـ prop جديد
export default function StoreNavbar({ store, slug, cartCount = 0, onCartClick, onSearchClick, links, headerSettings, themeColors = {} }) {
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const showSearch    = headerSettings?.showSearch    ?? true;
  const showCart      = headerSettings?.showCart      ?? true;
  const sticky        = headerSettings?.sticky        ?? true;
  const showStoreName = headerSettings?.showStoreName ?? true;

  const logo      = store?.logo || "";
  const storeName = store?.name || "المتجر";
  const primary   = themeColors.primary   || store?.primaryColor   || "#2563eb";
  const secondary = themeColors.secondary || store?.secondaryColor || "#0f172a";
  const navBg     = themeColors.bgColor      || "#ffffff";
  const navBorder = themeColors.borderColor  || "#f0f0f0";
  const navText   = themeColors.textColor    || "#111";
  const initial   = storeName.charAt(0);

  const navLinks = links || [
    { label: "الصفحة الرئيسية", action: () => navigate(`/store/${slug}`) },
    { label: "التصنيفات",       action: () => navigate(`/store/${slug}/collections`) },
    { label: "اتصل بنا",        action: () => {} },
  ];

  const handleSearch = () => { onSearchClick ? onSearchClick() : setSearchOpen(true); };

  const LogoEl = ({ height = 68 }) => {
    if (logo) {
      return (
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          {showStoreName && (
            <span style={{ fontWeight:800, fontSize: height * 0.24, color: navText, whiteSpace:"nowrap" }}>{storeName}</span>
          )}
          <img src={logo} alt={storeName} style={{ height, width:"auto", maxWidth:200, objectFit:"contain" }} />
        </div>
      );
    }
    if (showStoreName) {
      return (
        <span style={{ fontWeight:900, fontSize: height * 0.34, color: navText, whiteSpace:"nowrap" }}>{storeName}</span>
      );
    }
    return (
      <div style={{
        height, width:height, borderRadius:14,
        background:`linear-gradient(135deg, ${primary}, ${secondary})`,
        display:"flex", alignItems:"center", justifyContent:"center",
        fontWeight:900, color:"#fff", fontSize: height * 0.38,
      }}>{initial}</div>
    );
  };

  // ✦ position يتغير حسب sticky
  const navPosition = sticky ? "sticky" : "relative";

  return (
    <>
      <MobileDrawer
        open={drawerOpen} onClose={() => setDrawerOpen(false)}
        logo={logo} storeName={storeName}
        primaryColor={primary} secondaryColor={secondary}
        links={navLinks}
        showStoreName={showStoreName}
      />
      {/* ✦ SearchBox تظهر فقط إذا showSearch مفعّل */}
      {showSearch && (
        <SearchBox open={searchOpen} onClose={() => setSearchOpen(false)} slug={slug} primaryColor={primary} />
      )}

      {/* ══════════════ DESKTOP NAV (LTR layout) ══════════════ */}
      <nav className="sn-desktop" style={{
        position: navPosition, top:0, zIndex:100,
        background: navBg,
        backdropFilter:"blur(16px)",
        borderBottom:`1px solid ${navBorder}`,
        height:80,
        display:"flex",
        alignItems:"center",
        padding:"0 40px",
        direction:"ltr",
      }}>
        {/* يسار: بحث + cart */}
        <div style={{ flex:1, display:"flex", alignItems:"center", gap:4 }}>
          {showSearch && (
            <button className="sn-icon-btn" onClick={handleSearch}><IconSearch /></button>
          )}
          {showCart && (
            <button className="sn-icon-btn" onClick={onCartClick}><IconCart /></button>
          )}
        </div>

        {/* وسط: روابط */}
        <div style={{ flex:2, display:"flex", alignItems:"center", justifyContent:"center", gap:4, direction:"rtl" }}>
          {navLinks.map((item, i) => (
            <button key={i} onClick={item.action} className="sn-nav-link">{item.label}</button>
          ))}
        </div>

        {/* يمين: لوجو */}
        <div style={{ flex:1, display:"flex", justifyContent:"flex-end", alignItems:"center", cursor:"pointer" }}
          onClick={() => navigate(`/store/${slug}`)}>
          <LogoEl height={68} />
        </div>
      </nav>

      {/* ══════════════ MOBILE NAV ══════════════ */}
      <nav className="sn-mobile" style={{
        position: navPosition, top:0, zIndex:100,
        background: navBg,
        backdropFilter:"blur(16px)",
        borderBottom:`1px solid ${navBorder}`,
        height:60,
        display:"flex",
        alignItems:"center",
        padding:"0 16px",
        direction:"ltr",
      }}>
        {/* يسار الشاشة: hamburger */}
        <button className="sn-icon-btn" onClick={() => setDrawerOpen(true)}><IconMenu /></button>

        {/* وسط: لوجو */}
        <div style={{
          position:"absolute", left:"50%", transform:"translateX(-50%)",
          display:"flex", alignItems:"center", cursor:"pointer",
        }} onClick={() => navigate(`/store/${slug}`)}>
          <LogoEl height={44} />
        </div>

        {/* يمين الشاشة: cart + بحث */}
        <div style={{ marginLeft:"auto", display:"flex", alignItems:"center", gap:2 }}>
          {showCart && (
            <button className="sn-icon-btn" onClick={onCartClick}><IconCart /></button>
          )}
          {showSearch && (
            <button className="sn-icon-btn" onClick={handleSearch}><IconSearch /></button>
          )}
        </div>
      </nav>

      <style>{`
        .sn-icon-btn {
          background: none; border: none; cursor: pointer;
          color: #555; padding: 8px; border-radius: 8px;
          display: flex; align-items: center;
          transition: background .2s, color .2s;
        }
        .sn-icon-btn:hover { background: #f3f4f6; color: #111; }

        .sn-nav-link {
          background: none; border: none; cursor: pointer;
          color: #444; font-family: inherit; font-size: 15px; font-weight: 600;
          padding: 8px 18px; border-radius: 8px;
          transition: color .2s, background .2s; white-space: nowrap;
        }
        .sn-nav-link:hover { color: #111; background: #f3f4f6; }

        /* Desktop يظهر فوق 768 */
        .sn-desktop { display: flex !important; }
        .sn-mobile  { display: none  !important; }

        @media (max-width: 768px) {
          .sn-desktop { display: none  !important; }
          .sn-mobile  { display: flex  !important; }
        }
      `}</style>
    </>
  );
}