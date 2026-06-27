// ============================================================
// 📁 pages/ThemeEdit.jsx — صفحة تعديل الثيم
// ============================================================
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ImageUploader from "../components/ui/ImageUploader";

const API   = () => import.meta.env.VITE_API_URL;
const token = () => localStorage.getItem("token");
const FONTS = ["Inter", "Poppins", "Cairo", "Roboto"];

const CSS = `
@keyframes te-spin { to { transform: rotate(360deg); } }
@keyframes te-toast { from { opacity:0; transform:translateX(-50%) translateY(10px); } }

.te-wrap { display: grid; grid-template-columns: 1fr 300px; gap: 24px; align-items: start; }
@media (max-width: 768px) { .te-wrap { grid-template-columns: 1fr; } }

/* ── Back button ── */
.te-back {
  display: inline-flex; align-items: center; gap: 6px;
  font-size: .82rem; font-weight: 600; color: #6b7280;
  background: none; border: none; cursor: pointer;
  font-family: inherit; padding: 0; margin-bottom: 20px;
  transition: color .15s;
}
.te-back:hover { color: #111827; }

/* ── Cards ── */
.te-card {
  background: #fff; border: 1px solid #e5e7eb;
  border-radius: 14px; overflow: hidden; margin-bottom: 18px;
}
.te-card:last-child { margin-bottom: 0; }
.te-card__header {
  padding: 14px 18px; border-bottom: 1px solid #f3f4f6;
  display: flex; align-items: center; gap: 9px;
}
.te-card__icon {
  width: 30px; height: 30px; border-radius: 8px;
  background: #f3f4f6; display: flex; align-items: center;
  justify-content: center; font-size: 14px; flex-shrink: 0;
}
.te-card__title { font-size: .9rem; font-weight: 700; color: #111827; }
.te-card__body { padding: 16px 18px; display: flex; flex-direction: column; gap: 14px; }

/* ── Inputs ── */
.te-label { font-size: .75rem; color: #6b7280; font-weight: 500; display: block; margin-bottom: 5px; }
.te-input {
  width: 100%; padding: 9px 12px; border: 1px solid #e5e7eb;
  border-radius: 9px; font-size: .84rem; color: #111827;
  font-family: inherit; background: #fafafa; outline: none;
  transition: border .15s; box-sizing: border-box;
}
.te-input:focus { border-color: #d1d5db; background: #fff; }

/* ── Colors ── */
.te-colors { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.te-color-label { font-size: .75rem; color: #6b7280; font-weight: 500; margin-bottom: 6px; display: flex; justify-content: space-between; }
.te-color-hint { font-size: .68rem; color: #b0b7c3; }
.te-color-picker {
  height: 46px; border-radius: 10px; border: 1px solid #e5e7eb;
  overflow: hidden; position: relative; cursor: pointer;
}
.te-color-picker input[type=color] {
  position: absolute; inset: 0; width: 100%; height: 100%; opacity: 0; cursor: pointer;
}
.te-color-hex { text-align: center; font-size: .7rem; color: #9ca3af; margin-top: 4px; font-family: monospace; }

/* ── Fonts ── */
.te-fonts { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
.te-font-btn {
  padding: 10px 8px; border-radius: 9px; border: 1.5px solid #e5e7eb;
  font-size: .82rem; font-weight: 500; cursor: pointer;
  background: #fafafa; color: #374151; font-family: inherit;
  transition: all .15s; text-align: center;
}
.te-font-btn:hover { border-color: #d1d5db; background: #f3f4f6; }
.te-font-btn--active { border-color: #111827; background: #111827; color: #fff; }

/* ── Slug box ── */
.te-slug {
  background: #f9fafb; border: 1px solid #f0f0f0; border-radius: 10px;
  padding: 10px 14px; display: flex; justify-content: space-between; align-items: center;
}
.te-slug__label { font-size: .75rem; color: #9ca3af; }
.te-slug__link { font-size: .78rem; color: #6366f1; font-weight: 600; text-decoration: none; }
.te-slug__link:hover { text-decoration: underline; }

/* ── Save btn ── */
.te-save-btn {
  width: 100%; padding: 13px; border-radius: 11px; border: none;
  background: #111827; color: #fff; font-size: .9rem; font-weight: 700;
  cursor: pointer; font-family: inherit; transition: opacity .15s;
  display: flex; align-items: center; justify-content: center; gap: 8px;
}
.te-save-btn:hover:not(:disabled) { opacity: .85; }
.te-save-btn:disabled { opacity: .5; cursor: not-allowed; }

/* ── Live preview ── */
.te-preview-sticky { position: sticky; top: 24px; }
.te-preview-card {
  background: #fff; border: 1px solid #e5e7eb;
  border-radius: 14px; overflow: hidden;
}
.te-preview-header {
  padding: 12px 16px; border-bottom: 1px solid #f3f4f6;
  font-size: .75rem; font-weight: 600; color: #9ca3af;
  text-transform: uppercase; letter-spacing: .08em;
  display: flex; align-items: center; gap: 6px;
}
.te-preview-body {
  padding: 20px 16px; display: flex; justify-content: center; background: #f8f9fa;
}
.te-phone {
  width: 180px; background: #1c1c1e; border-radius: 30px;
  padding: 10px 8px; box-shadow: 0 8px 32px rgba(0,0,0,.2);
}
.te-phone__notch {
  width: 50px; height: 5px; background: #3a3a3c;
  border-radius: 3px; margin: 0 auto 8px;
}
.te-phone__screen { border-radius: 22px; overflow: hidden; background: #fff; }
.te-phone__nav {
  height: 40px; display: flex; align-items: center;
  justify-content: space-between; padding: 0 10px;
}
.te-phone__banner { width: 100%; height: 70px; object-fit: cover; }
.te-phone__banner-ph { width: 100%; height: 70px; display: flex; align-items: center; justify-content: center; font-size: 20px; }
.te-phone__products { display: grid; grid-template-columns: 1fr 1fr; gap: 7px; padding: 8px; }
.te-phone__product { background: #f8f9fa; border-radius: 8px; overflow: hidden; }
.te-phone__product-img { height: 44px; background: #efefef; display: flex; align-items: center; justify-content: center; font-size: 16px; }
.te-phone__product-body { padding: 5px 6px 7px; }
.te-phone__product-name { height: 5px; background: #e5e7eb; border-radius: 3px; width: 80%; margin-bottom: 4px; }
.te-phone__product-price { height: 5px; background: #eee; border-radius: 3px; width: 50%; margin-bottom: 6px; }
.te-phone__product-btn { width: 100%; height: 18px; border-radius: 5px; font-size: 6px; font-weight: 700; color: #fff; display: flex; align-items: center; justify-content: center; }

/* ── Toast ── */
.te-toast {
  position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%);
  padding: 11px 22px; border-radius: 12px; font-size: .85rem; font-weight: 600;
  z-index: 9999; box-shadow: 0 4px 20px rgba(0,0,0,.15); white-space: nowrap;
  animation: te-toast .25s ease;
}
.te-toast--success { background: #111827; color: #fff; }
.te-toast--error   { background: #ef4444; color: #fff; }

/* loading */
.te-loading { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 300px; gap: 14px; color: #9ca3af; font-size: .85rem; }
.te-spinner { width: 30px; height: 30px; border: 3px solid #f0f0f0; border-top-color: #111827; border-radius: 50%; animation: te-spin .7s linear infinite; }
`;

function LivePreview({ store }) {
  const pc = store.primaryColor || "#2563eb";
  const sc = store.secondaryColor || "#0f172a";
  return (
    <div className="te-phone">
      <div className="te-phone__notch" />
      <div className="te-phone__screen" style={{ fontFamily: store.fontFamily }}>
        <div className="te-phone__nav" style={{ background: pc }}>
          {store.logo
            ? <img src={store.logo} style={{ width: 22, height: 22, borderRadius: 5, objectFit: "cover" }} />
            : <span style={{ fontSize: 13 }}>🏪</span>
          }
          <span style={{ fontSize: 9, fontWeight: 700, color: "#fff" }}>{store.name || "اسم المتجر"}</span>
          <svg width="11" height="11" fill="none" stroke="rgba(255,255,255,.8)" strokeWidth="2" viewBox="0 0 24 24"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/></svg>
        </div>
        {store.banner
          ? <img src={store.banner} className="te-phone__banner" />
          : <div className="te-phone__banner-ph" style={{ background: pc + "22" }}>🖼️</div>
        }
        <div className="te-phone__products">
          {[1,2].map(i => (
            <div key={i} className="te-phone__product">
              <div className="te-phone__product-img">📦</div>
              <div className="te-phone__product-body">
                <div className="te-phone__product-name" />
                <div className="te-phone__product-price" />
                <div className="te-phone__product-btn" style={{ background: sc }}>اطلب</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ThemeEdit() {
  const navigate = useNavigate();
  const [store,   setStore]   = useState({ name: "", slug: "", phone: "", whatsappNumber: "", logo: "", banner: "", primaryColor: "#2563eb", secondaryColor: "#0f172a", fontFamily: "Inter" });
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [notif,   setNotif]   = useState(null);

  const notify = (msg, type = "success") => { setNotif({ msg, type }); setTimeout(() => setNotif(null), 3500); };
  const set = (field, val) => setStore(p => ({ ...p, [field]: val }));

  useEffect(() => {
    fetch(`${API()}/api/stores/my-store`, { headers: { Authorization: `Bearer ${token()}` } })
      .then(r => r.json())
      .then(d => { if (d.hasStore) setStore(p => ({ ...p, ...d.store })); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const save = async () => {
    if (!store.name.trim()) return notify("اسم المتجر مطلوب ⚠️", "error");
    setSaving(true);
    try {
      const res = await fetch(`${API()}/api/stores/update`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}` },
        body: JSON.stringify({ name: store.name, phone: store.phone, whatsappNumber: store.whatsappNumber, logo: store.logo, banner: store.banner, primaryColor: store.primaryColor, secondaryColor: store.secondaryColor, fontFamily: store.fontFamily }),
      });
      const data = await res.json();
      if (res.ok) { if (data.store) setStore(p => ({ ...p, ...data.store })); notify("تم حفظ التغييرات ✅"); }
      else notify(data.message || "حدث خطأ ❌", "error");
    } catch { notify("تعذر الاتصال ❌", "error"); }
    finally { setSaving(false); }
  };

  if (loading) return (
    <div className="te-loading"><style>{CSS}</style><div className="te-spinner" /><p>جاري التحميل...</p></div>
  );

  return (
    <div dir="rtl">
      <style>{CSS}</style>
      {notif && <div className={`te-toast te-toast--${notif.type}`}>{notif.msg}</div>}

      {/* Back */}
      <button className="te-back" onClick={() => navigate("/theme")}>
        <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>
        العودة للثيمات
      </button>

      <div className="te-wrap">
        {/* ── Settings ── */}
        <div>
          {/* معلومات */}
          <div className="te-card">
            <div className="te-card__header">
              <div className="te-card__icon">🏪</div>
              <h2 className="te-card__title">معلومات المتجر</h2>
            </div>
            <div className="te-card__body">
              <div>
                <label className="te-label">اسم المتجر *</label>
                <input className="te-input" placeholder="مثال: متجر النور" value={store.name} onChange={e => set("name", e.target.value)} />
              </div>
              <div>
                <label className="te-label">رقم الهاتف</label>
                <input className="te-input" type="tel" placeholder="0661234567" value={store.phone} onChange={e => set("phone", e.target.value)} />
              </div>
              <div>
                <label className="te-label">رقم واتساب</label>
                <input className="te-input" type="tel" placeholder="0661234567" value={store.whatsappNumber} onChange={e => set("whatsappNumber", e.target.value)} />
              </div>
              {store.slug && (
                <div className="te-slug">
                  <span className="te-slug__label">رابط المتجر</span>
                  <a href={`/store/${store.slug}`} target="_blank" rel="noreferrer" className="te-slug__link">/{store.slug} ↗</a>
                </div>
              )}
            </div>
          </div>

          {/* ألوان */}
          <div className="te-card">
            <div className="te-card__header">
              <div className="te-card__icon">🎨</div>
              <h2 className="te-card__title">الألوان</h2>
            </div>
            <div className="te-card__body">
              <div className="te-colors">
                {[
                  { field: "primaryColor",   label: "اللون الرئيسي",  hint: "الهيدر" },
                  { field: "secondaryColor", label: "لون الأزرار",     hint: "الطلب" },
                ].map(({ field, label, hint }) => (
                  <div key={field}>
                    <div className="te-color-label">
                      <span>{label}</span>
                      <span className="te-color-hint">{hint}</span>
                    </div>
                    <div className="te-color-picker" style={{ background: store[field] }}>
                      <input type="color" value={store[field]} onChange={e => set(field, e.target.value)} />
                    </div>
                    <p className="te-color-hex">{store[field]}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* خط */}
          <div className="te-card">
            <div className="te-card__header">
              <div className="te-card__icon">🔤</div>
              <h2 className="te-card__title">الخط</h2>
            </div>
            <div className="te-card__body">
              <div className="te-fonts">
                {FONTS.map(f => (
                  <button key={f} className={`te-font-btn ${store.fontFamily === f ? "te-font-btn--active" : ""}`}
                    style={{ fontFamily: f }} onClick={() => set("fontFamily", f)}>
                    {f}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* وسائط */}
          <div className="te-card">
            <div className="te-card__header">
              <div className="te-card__icon">🖼️</div>
              <h2 className="te-card__title">الوسائط</h2>
            </div>
            <div className="te-card__body">
              <div>
                <label className="te-label">اللوجو <span style={{ color: "#9ca3af" }}>(مربع 1:1)</span></label>
                <ImageUploader value={store.logo} onChange={url => set("logo", url)} label="اللوجو" aspect="square" dark={false} />
              </div>
              <div>
                <label className="te-label">البانر <span style={{ color: "#9ca3af" }}>(عريض 16:4)</span></label>
                <ImageUploader value={store.banner} onChange={url => set("banner", url)} label="البانر" aspect="wide" dark={false} />
              </div>
            </div>
          </div>

          <button className="te-save-btn" onClick={save} disabled={saving}>
            {saving
              ? <><span style={{ display: "inline-block", animation: "te-spin .7s linear infinite" }}>⏳</span> جاري الحفظ...</>
              : <><svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg> حفظ التغييرات</>
            }
          </button>
        </div>

        {/* ── Live Preview ── */}
        <div className="te-preview-sticky">
          <div className="te-preview-card">
            <div className="te-preview-header">
              <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>
              معاينة مباشرة
            </div>
            <div className="te-preview-body">
              <LivePreview store={store} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ThemeEdit;