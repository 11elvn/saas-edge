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

function MobileDrawer({ open, onClose, logo, storeName, primaryColor, secondaryColor, links, navBg, navText, navBorder }) {
  if (!open) return null;
  // ✦ لون hover خفيف مبني على navText (يشتغل مع أي خلفية غامقة أو فاتحة)
  const hoverBg = navText === "#111" || !navText ? "#f5f5f5" : `${navText}1a`;
  return (
    <>
      <div onClick={onClose} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.55)", zIndex:998, backdropFilter:"blur(2px)" }} />
      <div style={{
        position:"fixed", top:0, right:0,
        width:"75%", maxWidth:300, height:"100%",
        background: navBg || "#fff",
        borderLeft: `1px solid ${navBorder || "#f0f0f0"}`,
        zIndex:999,
        padding:"24px 20px",
        display:"flex", flexDirection:"column",
        animation:"sn-slide-in .28s cubic-bezier(.32,.72,0,1) both",
        direction:"rtl",
      }}>
        <button onClick={onClose} style={{ background:"none", border:"none", cursor:"pointer", color: navText || "#111", alignSelf:"flex-end", padding:4 }}>
          <IconX />
        </button>
        <div style={{ display:"flex", flexDirection:"column", alignItems:"center", margin:"20px 0 32px" }}>
          {logo
            ? <img src={logo} alt="logo" style={{ width:80, height:80, objectFit:"contain", borderRadius:16 }} />
            : <div style={{ fontWeight:900, fontSize:22, color: navText || "#111", textAlign:"center", lineHeight:1.2 }}>{storeName}</div>
          }
        </div>
        <nav style={{ display:"flex", flexDirection:"column", gap:4 }}>
          {links.map((item, i) => (
            <button key={i} onClick={() => { item.action(); onClose(); }} style={{
              background:"none", border:"none", cursor:"pointer",
              color: navText || "#333", fontFamily:"inherit", fontSize:15, fontWeight:600,
              padding:"12px 16px", borderRadius:10, textAlign:"right", transition:"background .2s",
            }}
            onMouseEnter={e => e.currentTarget.style.background = hoverBg}
            onMouseLeave={e => e.currentTarget.style.background = "none"}
            >{item.label}</button>
          ))}
        </nav>
      </div>
      <style>{`@keyframes sn-slide-in { from{transform:translateX(100%)} to{transform:translateX(0)} }`}</style>
    </>
  );
}

function SearchBox({ open, onClose, slug, primaryColor, navBg, navText, navBorder }) {
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
        background: navBg || "#fff",
        borderBottom: `1px solid ${navBorder || "#f0f0f0"}`,
        boxShadow:"0 8px 30px rgba(0,0,0,.08)",
        padding:"18px 24px",
        animation:"sn-search-drop .25s ease both",
        direction:"rtl",
      }}>
        <form onSubmit={submit} style={{ maxWidth:640, margin:"0 auto", display:"flex", alignItems:"center", gap:10, color: navText || "#111" }}>
          <IconSearch />
          <input autoFocus value={q} onChange={e => setQ(e.target.value)}
            placeholder="ابحث عن منتج..."
            style={{ flex:1, border:"none", outline:"none", fontSize:16, fontFamily:"inherit", background:"none", color: navText || "#111", textAlign:"right" }}
          />
          <button type="submit" style={{ background:primaryColor, color:"#fff", border:"none", borderRadius:10, padding:"9px 18px", fontSize:14, fontWeight:700, cursor:"pointer", fontFamily:"inherit" }}>بحث</button>
          <button type="button" onClick={onClose} style={{ background:"none", border:"none", cursor:"pointer", color: navText || "#888", padding:6, opacity:.7 }}><IconX /></button>
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

  const showSearch = headerSettings?.showSearch ?? true;
  const showCart   = headerSettings?.showCart   ?? true;
  const sticky     = headerSettings?.sticky     ?? true;

  const logo      = store?.logo || "";
  const storeName = store?.name || "المتجر";
  const logoScale = headerSettings?.logoSize ?? 1; // ✦ حجم اللوجو القابل للتحكم من ThemeEdit
  const primary   = themeColors.primary   || store?.primaryColor   || "#2563eb";
  const secondary = themeColors.secondary || store?.secondaryColor || "#0f172a";
  const navBg     = themeColors.bgColor      || "#ffffff";
  const navBorder = themeColors.borderColor  || "#f0f0f0";
  const navText   = themeColors.textColor    || "#111";

  const handleSearch = () => { onSearchClick ? onSearchClick() : setSearchOpen(true); };

  // ✦ يحدد إذا الرابط خارجي (URL كامل / بريد / هاتف) وإلا مسار داخل المتجر
  const isExternalUrl = (url) => /^https?:\/\//i.test(url) || /^mailto:|^tel:/i.test(url) || url?.startsWith("www.");

  const resolveInternalPath = (url) => {
    const path = url.startsWith("/") ? url : `/${url}`;
    return path === "/" ? `/store/${slug}` : `/store/${slug}${path}`;
  };

  const goToLink = (url) => () => {
    if (!url || url === "#") return;
    if (isExternalUrl(url)) {
      const href = url.startsWith("www.") ? `https://${url}` : url;
      window.open(href, "_blank", "noopener,noreferrer");
    } else {
      navigate(resolveInternalPath(url));
    }
  };

  const DEFAULT_NAV_LINKS = [
    { title: "الصفحة الرئيسية", url: "/" },
    { title: "التصنيفات",       url: "/collections" },
    { title: "اتصل بنا",        url: "#" },
  ];

  const navLinks = links || (
    (headerSettings?.links?.length ? headerSettings.links : DEFAULT_NAV_LINKS)
      .map(l => ({ label: l.title || "", action: goToLink(l.url) }))
  );

  const LogoEl = ({ height = 68 }) => logo ? (
    <img src={logo} alt={storeName} style={{ height, width:"auto", maxWidth:200, objectFit:"contain" }} />
  ) : (
    <span style={{ fontWeight:900, fontSize: height * 0.34, color: navText, whiteSpace:"nowrap" }}>{storeName}</span>
  );

  // ✦ position يتغير حسب sticky
  const navPosition = sticky ? "sticky" : "relative";

  return (
    <>
      <MobileDrawer
        open={drawerOpen} onClose={() => setDrawerOpen(false)}
        logo={logo} storeName={storeName}
        primaryColor={primary} secondaryColor={secondary}
        links={navLinks}
        navBg={navBg} navText={navText} navBorder={navBorder}
      />
      {/* ✦ SearchBox تظهر فقط إذا showSearch مفعّل */}
      {showSearch && (
        <SearchBox
          open={searchOpen} onClose={() => setSearchOpen(false)} slug={slug} primaryColor={primary}
          navBg={navBg} navText={navText} navBorder={navBorder}
        />
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
            <button className="sn-icon-btn sn-icon-btn--cart" onClick={onCartClick}>
              <IconCart />
              {cartCount > 0 && <span className="sn-cart-badge" style={{ background: primary }}>{cartCount > 9 ? "9+" : cartCount}</span>}
            </button>
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
          <LogoEl height={68 * logoScale} />
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
          <LogoEl height={44 * logoScale} />
        </div>

        {/* يمين الشاشة: cart + بحث */}
        <div style={{ marginLeft:"auto", display:"flex", alignItems:"center", gap:2 }}>
          {showCart && (
            <button className="sn-icon-btn sn-icon-btn--cart" onClick={onCartClick}>
              <IconCart />
              {cartCount > 0 && <span className="sn-cart-badge" style={{ background: primary }}>{cartCount > 9 ? "9+" : cartCount}</span>}
            </button>
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
        .sn-icon-btn--cart { position: relative; }
        .sn-cart-badge {
          position: absolute; top: 2px; right: 2px;
          min-width: 16px; height: 16px; padding: 0 3px;
          border-radius: 999px; color: #fff;
          font-size: 10px; font-weight: 700; line-height: 16px; text-align: center;
          font-family: inherit;
        }

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