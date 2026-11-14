// ============================================================
// 📁 TopBar.jsx — الشريط العلوي (حبة زجاجية عائمة)
// يعرض: عنوان الصفحة + حبة فيها: رابط المتجر | اللغة | الدارك مود | الجرس | صورة المتجر
// ============================================================

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LANGS, usePrefs } from "../../context/PrefsContext";

const svgProps = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  viewBox: "0 0 24 24",
};

const IconExternal = () => (
  <svg width="15" height="15" {...svgProps}>
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    <polyline points="15 3 21 3 21 9" />
    <line x1="10" y1="14" x2="21" y2="3" />
  </svg>
);
const IconGlobe = () => (
  <svg width="16" height="16" {...svgProps}>
    <circle cx="12" cy="12" r="10" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
);
const IconChevron = () => (
  <svg width="11" height="11" {...svgProps} strokeWidth={2.5}>
    <polyline points="6 9 12 15 18 9" />
  </svg>
);
const IconMoon = () => (
  <svg width="17" height="17" {...svgProps}>
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
);
const IconSun = () => (
  <svg width="17" height="17" {...svgProps}>
    <circle cx="12" cy="12" r="4.5" />
    <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
  </svg>
);
const IconBell = () => (
  <svg width="17" height="17" {...svgProps}>
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);
const IconThemes = () => (
  <svg width="16" height="16" {...svgProps}>
    <circle cx="12" cy="12" r="10" />
    <path d="M12 2a10 10 0 0 1 0 20" />
    <path d="M2 12h20" />
  </svg>
);
const IconLogout = () => (
  <svg width="16" height="16" {...svgProps}>
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);
const IconCheck = () => (
  <svg width="14" height="14" {...svgProps} strokeWidth={2.5}>
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

function TopBar({ title = "Dashboard", newOrdersCount = 0, onBellClick, store, onLogout }) {
  const navigate = useNavigate();
  const { lang, setLang, theme, toggleTheme, t, dir } = usePrefs();

  // أي قائمة مفتوحة: null | "lang" | "account"
  const [open, setOpen] = useState(null);
  const toggle = (name) => setOpen((o) => (o === name ? null : name));
  const close = () => setOpen(null);

  // Escape يسكر القائمة
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === "Escape") setOpen(null); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const menuSide = dir === "rtl" ? "tb-menu--start" : "tb-menu--end";
  const currentLang = LANGS.find((l) => l.code === lang) || LANGS[0];
  const initial = store?.name?.charAt(0)?.toUpperCase() || "S";
  const isDark = theme === "dark";

  return (
    <header className="topbar" dir={dir}>
      {/* ── Page Title ── */}
      <h1 className="topbar__title">{t(title)}</h1>

      {/* ── Floating pill ── */}
      <div className="tb-pill" dir="ltr">

        {/* رابط المتجر */}
        {store?.slug && (
          <>
            <a
              className="tb-btn tb-btn--text tb-store"
              href={`/store/${store.slug}`}
              target="_blank"
              rel="noreferrer"
              title={t("View store")}
            >
              <IconExternal />
              <span className="tb-store__label">{t("Store")}</span>
            </a>
            <span className="tb-sep" />
          </>
        )}

        {/* اللغة */}
        <div className="tb-anchor">
          <button
            type="button"
            className={`tb-btn tb-btn--text${open === "lang" ? " tb-btn--active" : ""}`}
            onClick={() => toggle("lang")}
            title={t("Language")}
            aria-label={t("Language")}
            aria-haspopup="menu"
            aria-expanded={open === "lang"}
          >
            <IconGlobe />
            <span>{currentLang.short}</span>
            <IconChevron />
          </button>

          {open === "lang" && (
            <div className={`tb-menu ${menuSide}`} role="menu" dir={dir}>
              {LANGS.map((l) => (
                <button
                  key={l.code}
                  type="button"
                  role="menuitem"
                  className={`tb-item${l.code === lang ? " tb-item--active" : ""}`}
                  onClick={() => { setLang(l.code); close(); }}
                >
                  <span>{l.label}</span>
                  {l.code === lang && <span className="tb-item__check"><IconCheck /></span>}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* الدارك / اللايت */}
        <button
          type="button"
          className="tb-btn"
          onClick={toggleTheme}
          title={isDark ? t("Light mode") : t("Dark mode")}
          aria-label={isDark ? t("Light mode") : t("Dark mode")}
        >
          {isDark ? <IconSun /> : <IconMoon />}
        </button>

        {/* جرس الإشعارات */}
        <button
          type="button"
          className={`tb-btn tb-bell${newOrdersCount > 0 ? " tb-bell--ringing" : ""}`}
          onClick={onBellClick}
          title={t("Notifications")}
          aria-label={t("Notifications")}
        >
          <IconBell />
          {newOrdersCount > 0 && (
            <span className="tb-bell-badge">{newOrdersCount > 99 ? "99+" : newOrdersCount}</span>
          )}
        </button>

        {/* صورة المتجر + قائمة الحساب */}
        <div className="tb-anchor">
          <button
            type="button"
            className="tb-avatar"
            onClick={() => toggle("account")}
            title={t("Account")}
            aria-label={t("Account")}
            aria-haspopup="menu"
            aria-expanded={open === "account"}
          >
            {store?.logo
              ? <img src={store.logo} alt="" />
              : <span>{initial}</span>}
          </button>

          {open === "account" && (
            <div className={`tb-menu ${menuSide}`} role="menu" dir={dir}>
              <div className="tb-menu__head">
                <strong>{store?.name || t("My store")}</strong>
                {store?.slug && <span>{store.slug}</span>}
              </div>
              <div className="tb-menu__sep" />

              {store?.slug && (
                <a
                  className="tb-item"
                  role="menuitem"
                  href={`/store/${store.slug}`}
                  target="_blank"
                  rel="noreferrer"
                  onClick={close}
                >
                  <IconExternal />
                  <span>{t("View store")}</span>
                </a>
              )}
              <button
                type="button"
                role="menuitem"
                className="tb-item"
                onClick={() => { close(); navigate("/theme"); }}
              >
                <IconThemes />
                <span>{t("Themes")}</span>
              </button>

              <div className="tb-menu__sep" />
              <button
                type="button"
                role="menuitem"
                className="tb-item tb-item--danger"
                onClick={() => { close(); onLogout?.(); }}
              >
                <IconLogout />
                <span>{t("Log out")}</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* طبقة تسكير القوائم عند الضغط خارجها */}
      {open && <div className="tb-overlay" onClick={close} />}
    </header>
  );
}

export default TopBar;