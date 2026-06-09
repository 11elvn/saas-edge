// ============================================================
// 📁 components/StoreFooter.jsx — Shared footer for all store pages
// لوغو كبير في الوسط بدون اسم — نفس تصميم bat-caveee
// ============================================================

import { useNavigate } from "react-router-dom";

const IconWA = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 00-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);
const IconTikTok = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.82a8.16 8.16 0 004.77 1.53V6.89a4.85 4.85 0 01-1-.2z"/>
  </svg>
);
const IconIG = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
  </svg>
);
const IconFB = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/>
  </svg>
);

export default function StoreFooter({ store, slug, links }) {
  const navigate = useNavigate();

  const logo      = store?.logo || "";
  const storeName = store?.name || "المتجر";
  const primary   = store?.primaryColor   || "#2563eb";
  const secondary = store?.secondaryColor || "#0f172a";
  const phone     = store?.whatsappNumber || "";
  const initial   = storeName.charAt(0);

  return (
    <footer style={{
      background: "#0d0d0d",
      borderTop: "1px solid #1a1a1a",
      padding: "48px 24px 32px",
      direction: "rtl",
    }}>
      <div style={{ maxWidth: 980, margin: "0 auto" }}>

        {/* اللوغو كبير في الوسط */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 36 }}>
          {logo ? (
            <img src={logo} alt={storeName} style={{ height: 80, width: "auto", maxWidth: 220, objectFit: "contain", filter: "brightness(1.05)" }} />
          ) : (
            <div style={{ height: 80, width: 80, borderRadius: 20, background: `linear-gradient(135deg, ${primary}, ${secondary})`, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, color: "#fff", fontSize: 34 }}>{initial}</div>
          )}
        </div>

        {/* 3 أعمدة */}
        <div style={{ display: "flex", justifyContent: "center", gap: 8, flexWrap: "wrap", marginBottom: 28 }}>
          {[
            { title: "عن المتجر", items: [
              { label: "عن المتجر",       action: () => navigate(`/store/${slug}`) },
              { label: "طرق الدفع",       action: () => {} },
              { label: "الشحن والتسليم", action: () => {} },
            ]},
            { title: "اتصل بنا", items: [
              { label: "اتصل بنا",         action: () => phone && window.open(`https://wa.me/${phone}`, "_blank") },
              { label: "الأسئلة المتكررة", action: () => {} },
            ]},
            { title: "الشروط والسياسات", items: [
              { label: "شروط الاستخدام",             action: () => {} },
              { label: "سياسة الاستبدال والاسترجاع", action: () => {} },
              { label: "سياسة الخصوصية",             action: () => {} },
            ]},
          ].map((col, ci) => (
            <div key={ci} style={{ minWidth: 160, padding: "0 16px", textAlign: "center" }}>
              <p style={{ margin: "0 0 12px", fontWeight: 700, fontSize: 14, color: "#fff", letterSpacing: .5 }}>{col.title}</p>
              <div style={{ width: 32, height: 2, background: primary, margin: "0 auto 14px", borderRadius: 2 }} />
              {col.items.map((item, ii) => (
                <button key={ii} onClick={item.action} style={{ display: "block", width: "100%", background: "none", border: "none", cursor: "pointer", color: "#888", fontFamily: "inherit", fontSize: 13, padding: "5px 0", textAlign: "center", transition: "color .2s" }}
                  onMouseEnter={e => e.currentTarget.style.color = "#fff"}
                  onMouseLeave={e => e.currentTarget.style.color = "#888"}
                >{item.label}</button>
              ))}
            </div>
          ))}
        </div>

        {/* Social Icons */}
        <div style={{ display: "flex", justifyContent: "center", gap: 14, marginBottom: 28 }}>
          {[
            { icon: <IconTikTok />,  href: "#",                                          hover: "#222"    },
            { icon: <IconIG />,      href: "#",                                          hover: "#c13584" },
            { icon: <IconFB />,      href: "#",                                          hover: "#1877f2" },
            ...(phone ? [{ icon: <IconWA />, href: `https://wa.me/${phone}`, hover: "#25d366" }] : []),
          ].map((s, i) => (
            <a key={i} href={s.href} target="_blank" rel="noreferrer" style={{ width: 44, height: 44, borderRadius: "50%", background: "#111", border: "1px solid #222", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", textDecoration: "none", transition: "background .2s, transform .2s" }}
              onMouseEnter={e => { e.currentTarget.style.background = s.hover; e.currentTarget.style.transform = "scale(1.1)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "#111";  e.currentTarget.style.transform = "scale(1)"; }}
            >{s.icon}</a>
          ))}
        </div>

        {/* Copyright */}
        <div style={{ borderTop: "1px solid #1a1a1a", paddingTop: 20 }}>
          <p style={{ color: "#444", fontSize: 12, margin: 0, textAlign: "center" }}>
            © {new Date().getFullYear()} {storeName} · جميع الحقوق محفوظة
          </p>
        </div>
      </div>
    </footer>
  );
}