// ============================================================
// 📁 pages/Theme.jsx — Redesign مع Preview Desktop/Mobile
// ============================================================
import { useEffect, useState } from "react";
import ImageUploader from "../components/ui/ImageUploader";

const API   = () => import.meta.env.VITE_API_URL;
const token = () => localStorage.getItem("token");

const FONTS = ["Inter", "Poppins", "Cairo", "Roboto"];

// ── CSS ──────────────────────────────────────────────────────
const CSS = `
.th-wrap {
  display: flex; flex-direction: column; gap: 0;
  font-family: inherit;
}

/* ── Preview Bar ── */
.th-preview-bar {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  overflow: hidden;
  margin-bottom: 24px;
}
.th-preview-bar__header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 14px 20px;
  border-bottom: 1px solid #f3f4f6;
}
.th-preview-bar__title {
  font-size: .82rem; font-weight: 600; color: #111827;
}
.th-preview-bar__tabs {
  display: flex; gap: 4px;
  background: #f3f4f6; border-radius: 10px; padding: 3px;
}
.th-tab-btn {
  display: flex; align-items: center; gap: 5px;
  padding: 6px 14px; border-radius: 8px; border: none;
  font-size: .78rem; font-weight: 500; cursor: pointer;
  font-family: inherit; transition: all .15s; color: #6b7280;
  background: transparent;
}
.th-tab-btn--active {
  background: #fff; color: #111827;
  box-shadow: 0 1px 3px rgba(0,0,0,.08);
}
.th-tab-btn svg { flex-shrink: 0; }

.th-preview-body {
  background: #f8f9fa;
  display: flex; align-items: center; justify-content: center;
  padding: 32px 24px; min-height: 420px;
  position: relative; overflow: hidden;
}

/* ── Desktop Frame ── */
.th-desktop-frame {
  width: 100%; max-width: 780px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 32px rgba(0,0,0,.12), 0 0 0 1px #e5e7eb;
  overflow: hidden;
  font-family: var(--th-font, Inter);
}
.th-desktop-frame__bar {
  background: #f0f0f0; padding: 8px 12px;
  display: flex; align-items: center; gap: 6px;
  border-bottom: 1px solid #e5e7eb;
}
.th-dot { width: 10px; height: 10px; border-radius: 50%; }
.th-desktop-frame__url {
  flex: 1; margin: 0 8px;
  background: #fff; border-radius: 5px;
  font-size: 9px; color: #6b7280; padding: 3px 8px;
  border: 1px solid #e5e7eb; display: flex; align-items: center; gap: 4px;
}

/* ── Mobile Frame ── */
.th-mobile-wrap {
  display: flex; align-items: flex-end; justify-content: center; gap: 20px;
}
.th-mobile-frame {
  width: 210px;
  background: #1a1a1a;
  border-radius: 34px;
  padding: 10px 8px;
  box-shadow: 0 8px 40px rgba(0,0,0,.25);
  position: relative;
}
.th-mobile-frame__notch {
  width: 60px; height: 5px; background: #333;
  border-radius: 3px; margin: 0 auto 8px;
}
.th-mobile-frame__screen {
  border-radius: 24px; overflow: hidden;
  background: #fff;
}
.th-mobile-frame--sm {
  width: 160px; opacity: .55;
  transform: scale(.9) translateY(10px);
  transform-origin: bottom center;
}

/* ── Store Preview Content ── */
.th-store-header {
  width: 100%; display: flex; align-items: center;
  justify-content: space-between; padding: 0 16px;
  height: 44px; position: relative;
}
.th-store-header__logo {
  width: 28px; height: 28px; border-radius: 7px; object-fit: cover;
}
.th-store-header__logo-placeholder {
  width: 28px; height: 28px; border-radius: 7px;
  background: rgba(255,255,255,.2);
  display: flex; align-items: center; justify-content: center;
  font-size: 13px; color: #fff;
}
.th-store-header__name {
  position: absolute; left: 50%; transform: translateX(-50%);
  font-size: 11px; font-weight: 700; color: #fff; white-space: nowrap;
}
.th-store-header__icons {
  display: flex; gap: 8px;
}
.th-store-header__icon { color: rgba(255,255,255,.8); }
.th-store-banner {
  width: 100%; height: 90px; object-fit: cover; display: block;
}
.th-store-banner-placeholder {
  width: 100%; height: 90px;
  display: flex; align-items: center; justify-content: center;
  font-size: 24px;
}
.th-store-products {
  padding: 12px; display: grid; grid-template-columns: 1fr 1fr; gap: 8px;
}
.th-store-product-card {
  background: #f8f9fa; border-radius: 10px; overflow: hidden;
}
.th-store-product-img {
  height: 54px; background: #e5e7eb;
  display: flex; align-items: center; justify-content: center; font-size: 18px;
}
.th-store-product-info { padding: 7px 8px 8px; }
.th-store-product-name {
  height: 6px; background: #d1d5db; border-radius: 3px;
  width: 80%; margin-bottom: 5px;
}
.th-store-product-price {
  height: 6px; background: #e5e7eb; border-radius: 3px; width: 50%; margin-bottom: 8px;
}
.th-store-product-btn {
  width: 100%; text-align: center; padding: 4px 0;
  border-radius: 6px; font-size: 8px; font-weight: 700; color: #fff;
}

/* Desktop nav */
.th-desktop-nav {
  display: flex; align-items: center; justify-content: space-between;
  padding: 0 24px; height: 52px; border-bottom: 1px solid #f0f0f0;
}
.th-desktop-nav__logo {
  display: flex; align-items: center; gap: 8px;
}
.th-desktop-nav__logo-img {
  width: 30px; height: 30px; border-radius: 7px; object-fit: cover;
}
.th-desktop-nav__logo-placeholder {
  width: 30px; height: 30px; border-radius: 7px;
  display: flex; align-items: center; justify-content: center; font-size: 16px;
}
.th-desktop-nav__name {
  font-size: 13px; font-weight: 700; color: #111827;
}
.th-desktop-nav__links {
  display: flex; gap: 20px;
}
.th-desktop-nav__link {
  font-size: 11px; color: #6b7280; font-weight: 500;
}
.th-desktop-nav__actions { display: flex; gap: 10px; }
.th-desktop-banner {
  width: 100%; height: 130px; object-fit: cover; display: block;
}
.th-desktop-banner-placeholder {
  height: 130px; display: flex; align-items: center;
  justify-content: center; font-size: 36px;
}
.th-desktop-products {
  padding: 16px; display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px;
}
.th-desktop-product-card {
  background: #f8f9fa; border-radius: 10px; overflow: hidden;
}
.th-desktop-product-img {
  height: 70px; background: #e5e7eb;
  display: flex; align-items: center; justify-content: center; font-size: 24px;
}
.th-desktop-product-info { padding: 8px 10px 10px; }
.th-desktop-product-name {
  height: 7px; background: #d1d5db; border-radius: 3px; width: 75%; margin-bottom: 5px;
}
.th-desktop-product-price {
  height: 7px; background: #e5e7eb; border-radius: 3px; width: 45%; margin-bottom: 10px;
}
.th-desktop-product-btn {
  width: 100%; text-align: center; padding: 6px 0;
  border-radius: 7px; font-size: 9px; font-weight: 700; color: #fff;
}

/* ── Settings Panel ── */
.th-settings {
  display: grid; grid-template-columns: 1fr 1fr; gap: 20px;
}
@media (max-width: 700px) {
  .th-settings { grid-template-columns: 1fr; }
}
.th-card {
  background: #fff; border: 1px solid #e5e7eb;
  border-radius: 14px; overflow: hidden;
}
.th-card__header {
  padding: 14px 18px; border-bottom: 1px solid #f3f4f6;
  display: flex; align-items: center; gap: 8px;
}
.th-card__icon {
  width: 28px; height: 28px; border-radius: 8px;
  background: #f3f4f6; display: flex; align-items: center;
  justify-content: center; font-size: 13px;
}
.th-card__title { font-size: .88rem; font-weight: 700; color: #111827; }
.th-card__body { padding: 16px 18px; display: flex; flex-direction: column; gap: 14px; }

.th-label { font-size: .75rem; color: #6b7280; font-weight: 500; display: block; margin-bottom: 6px; }
.th-input {
  width: 100%; padding: 9px 12px; border: 1px solid #e5e7eb;
  border-radius: 9px; font-size: .84rem; color: #111827;
  font-family: inherit; background: #fafafa; outline: none;
  transition: border .15s; box-sizing: border-box;
}
.th-input:focus { border-color: #d1d5db; background: #fff; }

.th-color-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.th-color-item {}
.th-color-label { font-size: .75rem; color: #6b7280; font-weight: 500; margin-bottom: 6px; display: block; }
.th-color-hint { font-size: .68rem; color: #9ca3af; }
.th-color-picker {
  height: 44px; border-radius: 10px; border: 1px solid #e5e7eb;
  overflow: hidden; position: relative; cursor: pointer;
}
.th-color-picker input[type=color] {
  position: absolute; inset: 0; width: 100%; height: 100%;
  opacity: 0; cursor: pointer;
}
.th-color-hex {
  text-align: center; font-size: .7rem; color: #9ca3af;
  margin-top: 4px; font-family: monospace;
}

.th-fonts { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; }
.th-font-btn {
  padding: 10px 8px; border-radius: 9px; border: 1.5px solid #e5e7eb;
  font-size: .82rem; font-weight: 500; cursor: pointer;
  font-family: inherit; transition: all .15s; color: #374151;
  background: #fafafa; text-align: center;
}
.th-font-btn:hover { border-color: #d1d5db; background: #f3f4f6; }
.th-font-btn--active {
  border-color: #111827; background: #111827; color: #fff;
}

.th-slug-box {
  background: #f9fafb; border: 1px solid #f0f0f0; border-radius: 10px;
  padding: 10px 14px; display: flex; justify-content: space-between; align-items: center;
}
.th-slug-label { font-size: .75rem; color: #9ca3af; }
.th-slug-link {
  font-size: .78rem; color: #6366f1; font-weight: 600; text-decoration: none;
}
.th-slug-link:hover { text-decoration: underline; }

.th-save-btn {
  display: flex; align-items: center; justify-content: center; gap: 8px;
  width: 100%; padding: 13px; border-radius: 11px; border: none;
  background: #111827; color: #fff; font-size: .9rem; font-weight: 700;
  cursor: pointer; font-family: inherit; transition: opacity .15s;
  margin-top: 4px;
}
.th-save-btn:hover:not(:disabled) { opacity: .85; }
.th-save-btn:disabled { opacity: .5; cursor: not-allowed; }

.th-toast {
  position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%);
  padding: 11px 22px; border-radius: 12px; font-size: .85rem; font-weight: 600;
  z-index: 9999; box-shadow: 0 4px 20px rgba(0,0,0,.15);
  animation: toast-in .25s ease;
}
@keyframes toast-in { from { opacity:0; transform: translateX(-50%) translateY(12px); } }
.th-toast--success { background: #111827; color: #fff; }
.th-toast--error   { background: #ef4444; color: #fff; }

.th-full-col { grid-column: 1 / -1; }
`;

// ── Store Preview Components ──────────────────────────────────
function MobilePreview({ store }) {
  return (
    <div className="th-mobile-frame">
      <div className="th-mobile-frame__notch" />
      <div className="th-mobile-frame__screen" style={{ fontFamily: store.fontFamily }}>
        {/* Header */}
        <div className="th-store-header" style={{ background: store.primaryColor }}>
          {store.logo
            ? <img src={store.logo} alt="" className="th-store-header__logo" />
            : <div className="th-store-header__logo-placeholder">🏪</div>
          }
          <span className="th-store-header__name">{store.name || "اسم المتجر"}</span>
          <div className="th-store-header__icons">
            <svg className="th-store-header__icon" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            <svg className="th-store-header__icon" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/></svg>
          </div>
        </div>

        {/* Banner */}
        {store.banner
          ? <img src={store.banner} alt="" className="th-store-banner" />
          : <div className="th-store-banner-placeholder" style={{ background: store.primaryColor + "22" }}>🖼️</div>
        }

        {/* Products */}
        <div className="th-store-products">
          {[1, 2].map(i => (
            <div key={i} className="th-store-product-card">
              <div className="th-store-product-img">📦</div>
              <div className="th-store-product-info">
                <div className="th-store-product-name" />
                <div className="th-store-product-price" />
                <div className="th-store-product-btn" style={{ background: store.secondaryColor }}>اطلب الآن</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function DesktopPreview({ store }) {
  return (
    <div className="th-desktop-frame" style={{ "--th-font": store.fontFamily }}>
      {/* Browser chrome */}
      <div className="th-desktop-frame__bar">
        <div className="th-dot" style={{ background: "#ff5f57" }} />
        <div className="th-dot" style={{ background: "#febc2e" }} />
        <div className="th-dot" style={{ background: "#28c840" }} />
        <div className="th-desktop-frame__url">
          <svg width="8" height="8" fill="none" stroke="#9ca3af" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          store.saas-edge.com/{store.slug || "my-store"}
        </div>
      </div>

      {/* Nav */}
      <div className="th-desktop-nav" style={{ background: store.primaryColor }}>
        <div className="th-desktop-nav__logo">
          {store.logo
            ? <img src={store.logo} alt="" className="th-desktop-nav__logo-img" />
            : <div className="th-desktop-nav__logo-placeholder" style={{ background: "rgba(255,255,255,.2)" }}>🏪</div>
          }
          <span className="th-desktop-nav__name" style={{ color: "#fff" }}>{store.name || "اسم المتجر"}</span>
        </div>
        <div className="th-desktop-nav__links">
          {["الرئيسية", "المنتجات", "تواصل"].map(l => (
            <span key={l} className="th-desktop-nav__link" style={{ color: "rgba(255,255,255,.75)" }}>{l}</span>
          ))}
        </div>
        <div className="th-desktop-nav__actions">
          <svg width="14" height="14" fill="none" stroke="rgba(255,255,255,.8)" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          <svg width="14" height="14" fill="none" stroke="rgba(255,255,255,.8)" strokeWidth="2" viewBox="0 0 24 24"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/></svg>
        </div>
      </div>

      {/* Banner */}
      {store.banner
        ? <img src={store.banner} alt="" className="th-desktop-banner" />
        : <div className="th-desktop-banner-placeholder" style={{ background: store.primaryColor + "18" }}>🖼️</div>
      }

      {/* Products */}
      <div className="th-desktop-products">
        {[1, 2, 3].map(i => (
          <div key={i} className="th-desktop-product-card">
            <div className="th-desktop-product-img">📦</div>
            <div className="th-desktop-product-info">
              <div className="th-desktop-product-name" />
              <div className="th-desktop-product-price" />
              <div className="th-desktop-product-btn" style={{ background: store.secondaryColor }}>اطلب الآن</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────
function Theme() {
  const [store, setStore] = useState({
    name: "", slug: "", phone: "", whatsappNumber: "",
    logo: "", banner: "",
    primaryColor: "#2563eb", secondaryColor: "#0f172a", fontFamily: "Inter",
  });
  const [fetchLoading, setFetchLoading] = useState(true);
  const [saving,       setSaving]       = useState(false);
  const [notif,        setNotif]        = useState(null);
  const [viewMode,     setViewMode]     = useState("desktop"); // "desktop" | "mobile"

  const notify = (msg, type = "success") => {
    setNotif({ msg, type });
    setTimeout(() => setNotif(null), 3500);
  };

  const updateField = (field, value) =>
    setStore((prev) => ({ ...prev, [field]: value }));

  useEffect(() => {
    fetch(`${API()}/api/stores/my-store`, {
      headers: { Authorization: `Bearer ${token()}` },
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.hasStore) {
          setStore((prev) => ({ ...prev, ...data.store }));
        }
      })
      .catch(console.error)
      .finally(() => setFetchLoading(false));
  }, []);

  const saveSettings = async () => {
    if (!store.name.trim()) return notify("اسم المتجر مطلوب ⚠️", "error");
    setSaving(true);
    try {
      const res = await fetch(`${API()}/api/stores/update`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}` },
        body: JSON.stringify({
          name: store.name, phone: store.phone,
          whatsappNumber: store.whatsappNumber,
          logo: store.logo, banner: store.banner,
          primaryColor: store.primaryColor,
          secondaryColor: store.secondaryColor,
          fontFamily: store.fontFamily,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        if (data.store) setStore((prev) => ({ ...prev, ...data.store }));
        notify("تم حفظ التغييرات ✅");
      } else {
        notify(data.message || "حدث خطأ ❌", "error");
      }
    } catch { notify("تعذر الاتصال بالخادم ❌", "error"); }
    finally  { setSaving(false); }
  };

  if (fetchLoading) return (
    <div className="pp-loading">
      <div className="pp-spinner" />
      <p>جاري تحميل بيانات المتجر...</p>
    </div>
  );

  return (
    <div className="th-wrap" dir="rtl">
      <style>{CSS}</style>

      {notif && (
        <div className={`th-toast th-toast--${notif.type}`}>{notif.msg}</div>
      )}

      {/* ══ PREVIEW BAR ══ */}
      <div className="th-preview-bar">
        <div className="th-preview-bar__header">
          <span className="th-preview-bar__title">معاينة المتجر</span>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {store.slug && (
              <a
                href={`/store/${store.slug}`}
                target="_blank"
                rel="noreferrer"
                style={{
                  fontSize: ".78rem", color: "#6366f1", fontWeight: 600,
                  textDecoration: "none", display: "flex", alignItems: "center", gap: 4,
                }}
              >
                <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                عرض المتجر
              </a>
            )}
            <div className="th-preview-bar__tabs">
              <button
                className={`th-tab-btn ${viewMode === "desktop" ? "th-tab-btn--active" : ""}`}
                onClick={() => setViewMode("desktop")}
              >
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>
                حاسوب
              </button>
              <button
                className={`th-tab-btn ${viewMode === "mobile" ? "th-tab-btn--active" : ""}`}
                onClick={() => setViewMode("mobile")}
              >
                <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>
                هاتف
              </button>
            </div>
          </div>
        </div>

        <div className="th-preview-body">
          {viewMode === "desktop"
            ? <DesktopPreview store={store} />
            : (
              <div className="th-mobile-wrap">
                {/* نسخة ثانية صغيرة في الخلف */}
                <div className="th-mobile-frame th-mobile-frame--sm">
                  <div className="th-mobile-frame__notch" />
                  <div className="th-mobile-frame__screen" style={{ fontFamily: store.fontFamily }}>
                    <div className="th-store-header" style={{ background: store.primaryColor }}>
                      <div className="th-store-header__logo-placeholder">🏪</div>
                      <span className="th-store-header__name" style={{ fontSize: 9 }}>{store.name || "متجر"}</span>
                      <div />
                    </div>
                    {store.banner
                      ? <img src={store.banner} alt="" className="th-store-banner" style={{ height: 60 }} />
                      : <div style={{ height: 60, background: store.primaryColor + "22" }} />
                    }
                  </div>
                </div>
                {/* الهاتف الرئيسي */}
                <MobilePreview store={store} />
              </div>
            )
          }
        </div>
      </div>

      {/* ══ SETTINGS ══ */}
      <div className="th-settings">

        {/* معلومات المتجر */}
        <div className="th-card">
          <div className="th-card__header">
            <div className="th-card__icon">🏪</div>
            <h2 className="th-card__title">معلومات المتجر</h2>
          </div>
          <div className="th-card__body">
            <div>
              <label className="th-label">اسم المتجر *</label>
              <input className="th-input" placeholder="مثال: متجر النور"
                value={store.name} onChange={(e) => updateField("name", e.target.value)} />
            </div>
            <div>
              <label className="th-label">رقم الهاتف</label>
              <input className="th-input" type="tel" placeholder="0661234567"
                value={store.phone} onChange={(e) => updateField("phone", e.target.value)} />
            </div>
            <div>
              <label className="th-label">رقم واتساب</label>
              <input className="th-input" type="tel" placeholder="0661234567"
                value={store.whatsappNumber} onChange={(e) => updateField("whatsappNumber", e.target.value)} />
            </div>
            {store.slug && (
              <div className="th-slug-box">
                <span className="th-slug-label">رابط المتجر</span>
                <a href={`/store/${store.slug}`} target="_blank" rel="noreferrer" className="th-slug-link">
                  /{store.slug} ↗
                </a>
              </div>
            )}
          </div>
        </div>

        {/* الألوان */}
        <div className="th-card">
          <div className="th-card__header">
            <div className="th-card__icon">🎨</div>
            <h2 className="th-card__title">الألوان</h2>
          </div>
          <div className="th-card__body">
            <div className="th-color-row">
              {[
                { field: "primaryColor",   label: "اللون الرئيسي",  hint: "الهيدر والنافبار" },
                { field: "secondaryColor", label: "لون الأزرار",     hint: "زر الطلب" },
              ].map(({ field, label, hint }) => (
                <div key={field} className="th-color-item">
                  <span className="th-color-label">
                    {label} <span className="th-color-hint">— {hint}</span>
                  </span>
                  <div className="th-color-picker" style={{ background: store[field] }}>
                    <input
                      type="color"
                      value={store[field]}
                      onChange={(e) => updateField(field, e.target.value)}
                    />
                  </div>
                  <p className="th-color-hex">{store[field]}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* الخط */}
        <div className="th-card">
          <div className="th-card__header">
            <div className="th-card__icon">🔤</div>
            <h2 className="th-card__title">الخط</h2>
          </div>
          <div className="th-card__body">
            <div className="th-fonts">
              {FONTS.map((font) => (
                <button key={font}
                  className={`th-font-btn ${store.fontFamily === font ? "th-font-btn--active" : ""}`}
                  style={{ fontFamily: font }}
                  onClick={() => updateField("fontFamily", font)}
                >
                  {font}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* الوسائط */}
        <div className="th-card">
          <div className="th-card__header">
            <div className="th-card__icon">🖼️</div>
            <h2 className="th-card__title">الوسائط</h2>
          </div>
          <div className="th-card__body">
            <div>
              <label className="th-label">اللوجو <span style={{ color: "#9ca3af" }}>(مربع 1:1)</span></label>
              <ImageUploader value={store.logo} onChange={(url) => updateField("logo", url)}
                label="اللوجو" aspect="square" dark={false} />
            </div>
            <div>
              <label className="th-label">البانر <span style={{ color: "#9ca3af" }}>(عريض 16:4)</span></label>
              <ImageUploader value={store.banner} onChange={(url) => updateField("banner", url)}
                label="البانر" aspect="wide" dark={false} />
            </div>
          </div>
        </div>

        {/* زر الحفظ */}
        <div className="th-full-col">
          <button className="th-save-btn" onClick={saveSettings} disabled={saving}>
            {saving
              ? <><span style={{ display: "inline-block", animation: "ov-spin .7s linear infinite" }}>⏳</span> جاري الحفظ...</>
              : <><svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg> حفظ التغييرات</>
            }
          </button>
        </div>

      </div>
    </div>
  );
}

export default Theme;