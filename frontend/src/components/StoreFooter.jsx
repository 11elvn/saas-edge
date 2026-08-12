// ============================================================
// 📁 components/StoreFooter.jsx — Shared footer for all store pages
// ✦ تصميم بسيط: Newsletter + Copyright + Terms + Social Icons
// ============================================================

// (لا حاجة لاستيراد React/useState هنا — ماعادش عندنا state محلي بعد حذف Newsletter)

const IconTikTok = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.82a8.16 8.16 0 004.77 1.53V6.89a4.85 4.85 0 01-1-.2z"/>
  </svg>
);
const IconIG = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
  </svg>
);
const IconFB = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/>
  </svg>
);
const IconYT = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M23.5 6.2a3 3 0 00-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 00.5 6.2 31.6 31.6 0 000 12a31.6 31.6 0 00.5 5.8 3 3 0 002.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 002.1-2.1A31.6 31.6 0 0024 12a31.6 31.6 0 00-.5-5.8zM9.6 15.6V8.4L15.8 12z"/>
  </svg>
);
const IconX = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.24 2h3.4l-7.44 8.5L23 22h-6.86l-5.37-7.03L4.6 22H1.2l7.96-9.1L1 2h7.03l4.86 6.42zm-1.2 18h1.89L7.05 3.9H5.02z"/>
  </svg>
);
const IconWA = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 00-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

// ✦ يحسب إذا اللون فاتح ولا غامق باش نختارو ألوان نص/حدود تبقى مقروءة فوقو
function isLightColor(hex) {
  if (!hex) return true;
  const c = hex.replace("#", "");
  const full = c.length === 3 ? c.split("").map(ch => ch + ch).join("") : c;
  const r = parseInt(full.substring(0, 2), 16);
  const g = parseInt(full.substring(2, 4), 16);
  const b = parseInt(full.substring(4, 6), 16);
  if ([r, g, b].some(Number.isNaN)) return true;
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.6;
}

export default function StoreFooter({ store, slug, light = false, bgColor, mutedColor, settings }) {
  const storeName = store?.name || "المتجر";

  // ✦ إلا ما توصلاتش settings كـ prop مباشرة، نقراوها بروحنا من store.themeConfig
  //   هكذا أي صفحة عطات لينا store فيه themeConfig، الفوتر يبان نفسو بلا ما نكرر الكود فكل صفحة
  const resolvedSettings = settings || store?.themeConfig?.sections?.find(s => s.type === "footer")?.settings || {};

  const {
    copyright        = "",
    termsText        = "",
    showSocials      = true,
    socials          = {},
  } = resolvedSettings;

  const resolvedBg = bgColor || (light ? "#ffffff" : "#0d0d0d");
  const useLight   = bgColor ? isLightColor(resolvedBg) : light;

  const colors = useLight
    ? { bg: resolvedBg, border: "#00000022", muted: mutedColor || "#666", icon: "#555" }
    : { bg: resolvedBg, border: "#ffffff2a", muted: mutedColor || "#aaa", icon: "#ccc" };

  // ✦ رقم واتساب مربوط بالإعدادات ديال الفوتر (Social links) — ماشي رقم المتجر العام تلقائي
  // ✦ نبدلو الأرقام العربية (٠-٩) والفارسية (۰-۹) لأرقام عادية قبل التنظيف، حتى إذا كتب التاجر الرقم بلوحة مفاتيح عربية يخدم الرابط
  const normalizeDigits = (str) =>
    (str || "").replace(/[٠-٩]/g, d => String(d.charCodeAt(0) - 0x0660))
                .replace(/[۰-۹]/g, d => String(d.charCodeAt(0) - 0x06F0));
  const waDigits = normalizeDigits(socials.whatsapp).replace(/[^0-9]/g, "");

  const socialList = !showSocials ? [] : [
    { key: "facebook",  url: socials.facebook,  icon: <IconFB />,     hover: "#1877f2" },
    { key: "instagram", url: socials.instagram, icon: <IconIG />,     hover: "#c13584" },
    { key: "youtube",   url: socials.youtube,   icon: <IconYT />,     hover: "#ff0000" },
    { key: "tiktok",    url: socials.tiktok,    icon: <IconTikTok />, hover: "#111"    },
    { key: "twitter",   url: socials.twitter,   icon: <IconX />,      hover: "#111"    },
    { key: "whatsapp",  url: waDigits ? `https://wa.me/${waDigits}` : "", icon: <IconWA />, hover: "#25d366" },
  ].filter(s => s.url);

  return (
    <footer style={{ background: colors.bg, padding: "40px 24px 32px", direction: "rtl" }}>
      <div style={{ maxWidth: 560, margin: "0 auto" }}>

        {/* Bottom box: copyright + terms + socials */}
        <div style={{
          border: `1px solid ${colors.border}`, borderRadius: 14, padding: "20px 20px",
          display: "flex", flexDirection: "column", alignItems: "center", gap: 14,
        }}>
          <p style={{ color: colors.muted, fontSize: 12.5, margin: 0, textAlign: "center" }}>
            {copyright || `© ${new Date().getFullYear()} ${storeName}`}
          </p>

          {termsText.trim() && (
            <button
              onClick={() => {}}
              style={{ background: "none", border: "none", cursor: "pointer", color: colors.muted, fontSize: 12.5, fontWeight: 400, fontFamily: "inherit", padding: 0 }}
            >{termsText}</button>
          )}

          {socialList.length > 0 && (
            <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
              {socialList.map(s => (
                <a key={s.key} href={s.url} target="_blank" rel="noreferrer"
                  style={{ color: colors.icon, display: "flex", transition: "color .2s" }}
                  onMouseEnter={e => e.currentTarget.style.color = s.hover}
                  onMouseLeave={e => e.currentTarget.style.color = colors.icon}
                >{s.icon}</a>
              ))}
            </div>
          )}
        </div>
      </div>
    </footer>
  );
}