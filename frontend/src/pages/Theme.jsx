// ============================================================
// 📁 pages/Theme.jsx — Day 22
// تخصيص المتجر — تصميم متناسق مع ProductsPage
// ============================================================
import { useEffect, useState } from "react";
import ImageUploader from "../components/ui/ImageUploader";

const API   = () => import.meta.env.VITE_API_URL;
const token = () => localStorage.getItem("token");

const FONTS = ["Inter", "Poppins", "Cairo", "Roboto"];

function Theme() {
  const [store, setStore] = useState({
    name: "", slug: "", phone: "", logo: "", banner: "",
    primaryColor: "#2563eb", secondaryColor: "#0f172a", fontFamily: "Inter",
  });
  const [fetchLoading, setFetchLoading] = useState(true);
  const [saving,       setSaving]       = useState(false);
  const [notif,        setNotif]        = useState(null);

  const notify = (msg, type = "success") => {
    setNotif({ msg, type });
    setTimeout(() => setNotif(null), 3500);
  };

  const updateField = (field, value) =>
    setStore((prev) => ({ ...prev, [field]: value }));

  // ── Fetch ────────────────────────────────────────────────
  useEffect(() => {
    fetch(`${API()}/api/stores/my-store`, {
      headers: { Authorization: `Bearer ${token()}` },
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.hasStore) {
          setStore((prev) => ({
            ...prev,
            name:           data.store.name           ?? prev.name,
            slug:           data.store.slug           ?? prev.slug,
            phone:          data.store.phone          ?? prev.phone,
            logo:           data.store.logo           ?? prev.logo,
            banner:         data.store.banner         ?? prev.banner,
            primaryColor:   data.store.primaryColor   ?? prev.primaryColor,
            secondaryColor: data.store.secondaryColor ?? prev.secondaryColor,
            fontFamily:     data.store.fontFamily     ?? prev.fontFamily,
          }));
        }
      })
      .catch(console.error)
      .finally(() => setFetchLoading(false));
  }, []);

  // ── Save ─────────────────────────────────────────────────
  const saveSettings = async () => {
    if (!store.name.trim()) return notify("اسم المتجر مطلوب ⚠️", "error");
    setSaving(true);
    try {
      const res  = await fetch(`${API()}/api/stores/update`, {
        method:  "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}` },
        body: JSON.stringify({
          name: store.name, phone: store.phone, logo: store.logo,
          banner: store.banner, primaryColor: store.primaryColor,
          secondaryColor: store.secondaryColor, fontFamily: store.fontFamily,
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
    <div dir="rtl">

      {/* Toast */}
      {notif && (
        <div className={`pp-toast pp-toast--${notif.type}`}>
          {notif.type === "success" ? "✅" : "❌"} {notif.msg}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 24, alignItems: "start" }}>

        {/* ── عمود الفورم ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

          {/* اسم المتجر */}
          <div className="pp-card">
            <div className="pp-card__header">
              <h2 className="pp-card__title">🏪 معلومات المتجر</h2>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div>
                <label style={{ fontSize: ".75rem", color: "#6b7280", display: "block", marginBottom: 6 }}>
                  اسم المتجر *
                </label>
                <input className="pp-input" placeholder="مثال: متجر النور"
                  value={store.name} onChange={(e) => updateField("name", e.target.value)} />
              </div>
              <div>
                <label style={{ fontSize: ".75rem", color: "#6b7280", display: "block", marginBottom: 6 }}>
                  رقم الهاتف
                </label>
                <input className="pp-input" type="tel" placeholder="0661234567"
                  value={store.phone} onChange={(e) => updateField("phone", e.target.value)} />
              </div>
              {store.slug && (
                <div style={{ background: "#f9fafb", border: "1px solid #f0f0f0", borderRadius: 10, padding: "10px 14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: ".8rem", color: "#6b7280" }}>رابط المتجر</span>
                  <a href={`/store/${store.slug}`} target="_blank" rel="noreferrer"
                    style={{ fontSize: ".8rem", color: "#6366f1", fontWeight: 600, textDecoration: "none" }}>
                    /{store.slug} ↗
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* الألوان */}
          <div className="pp-card">
            <div className="pp-card__header">
              <h2 className="pp-card__title">🎨 الألوان</h2>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              {[
                { field: "primaryColor",   label: "اللون الرئيسي",  hint: "هيدر المتجر" },
                { field: "secondaryColor", label: "اللون الثانوي",  hint: "زر الشراء"   },
              ].map(({ field, label, hint }) => (
                <div key={field}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                    <span style={{ fontSize: ".78rem", color: "#374151", fontWeight: 500 }}>{label}</span>
                    <span style={{ fontSize: ".7rem", color: "#9ca3af" }}>{hint}</span>
                  </div>
                  <div style={{ position: "relative", height: 48, borderRadius: 10, overflow: "hidden", border: "1px solid #e5e7eb", background: store[field], cursor: "pointer" }}>
                    <input type="color" value={store[field]}
                      onChange={(e) => updateField(field, e.target.value)}
                      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0, cursor: "pointer" }} />
                  </div>
                  <span style={{ display: "block", textAlign: "center", fontSize: ".72rem", color: "#9ca3af", marginTop: 4, fontFamily: "monospace" }}>
                    {store[field]}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* الخط */}
          <div className="pp-card">
            <div className="pp-card__header">
              <h2 className="pp-card__title">🔤 الخط</h2>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
              {FONTS.map((font) => (
                <button key={font} onClick={() => updateField("fontFamily", font)}
                  className={`pp-btn ${store.fontFamily === font ? "pp-btn--primary" : "pp-btn--ghost"}`}
                  style={{ fontFamily: font, padding: "10px 8px" }}>
                  {font}
                </button>
              ))}
            </div>
          </div>

          {/* الوسائط */}
          <div className="pp-card">
            <div className="pp-card__header">
              <h2 className="pp-card__title">🖼️ الوسائط</h2>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <div>
                <label style={{ fontSize: ".75rem", color: "#6b7280", display: "block", marginBottom: 8 }}>
                  اللوجو <span style={{ color: "#9ca3af" }}>(مربع — 1:1)</span>
                </label>
                <ImageUploader value={store.logo} onChange={(url) => updateField("logo", url)}
                  label="اللوجو" aspect="square" dark={false} />
              </div>
              <div>
                <label style={{ fontSize: ".75rem", color: "#6b7280", display: "block", marginBottom: 8 }}>
                  البانر <span style={{ color: "#9ca3af" }}>(عريض — 16:4)</span>
                </label>
                <ImageUploader value={store.banner} onChange={(url) => updateField("banner", url)}
                  label="البانر" aspect="wide" dark={false} />
              </div>
            </div>
          </div>

          {/* زر الحفظ */}
          <button className="pp-btn pp-btn--primary pp-btn--full"
            onClick={saveSettings} disabled={saving}
            style={{ padding: "13px", fontSize: ".9rem" }}>
            {saving ? "⏳ جاري الحفظ..." : "💾 حفظ التغييرات"}
          </button>

        </div>

        {/* ── معاينة مباشرة ── */}
        <div style={{ position: "sticky", top: 24 }}>
          <div className="pp-card" style={{ padding: "16px", textAlign: "center" }}>
            <p style={{ fontSize: ".72rem", color: "#9ca3af", marginBottom: 12, textTransform: "uppercase", letterSpacing: ".08em" }}>
              معاينة مباشرة
            </p>

            {/* إطار الهاتف */}
            <div style={{ margin: "0 auto", width: 200, background: "#1a1a1a", borderRadius: 28, border: "1px solid #e5e7eb", padding: 8, boxShadow: "0 8px 32px rgba(0,0,0,.12)" }}>
              <div style={{ borderRadius: 22, overflow: "hidden", background: "#fff", fontFamily: store.fontFamily }}>

                {/* Header المتجر */}
                <div style={{ background: store.primaryColor }}>
                  {store.banner && (
                    <img src={store.banner} alt="" style={{ width: "100%", height: 44, objectFit: "cover" }} />
                  )}
                  <div style={{ padding: "10px 12px", textAlign: "center" }}>
                    {store.logo
                      ? <img src={store.logo} alt="" style={{ width: 32, height: 32, borderRadius: 8, margin: "0 auto 6px", objectFit: "cover", display: "block" }} />
                      : <div style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(255,255,255,.2)", margin: "0 auto 6px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>🏪</div>
                    }
                    <p style={{ color: "#fff", fontSize: 10, fontWeight: 600, margin: 0 }}>{store.name || "اسم المتجر"}</p>
                    <p style={{ color: "rgba(255,255,255,.6)", fontSize: 8, margin: "2px 0 0" }}>الدفع عند الاستلام</p>
                  </div>
                </div>

                {/* بطاقة منتج وهمية */}
                <div style={{ padding: 10 }}>
                  <div style={{ background: "#f8f9fa", borderRadius: 10, padding: 10 }}>
                    <div style={{ height: 56, background: "#e5e7eb", borderRadius: 8, marginBottom: 8 }} />
                    <div style={{ height: 7, background: "#d1d5db", borderRadius: 4, width: "75%", marginBottom: 5 }} />
                    <div style={{ height: 7, background: "#e5e7eb", borderRadius: 4, width: "50%", marginBottom: 10 }} />
                    <div style={{ background: store.secondaryColor, color: "#fff", fontSize: 8, textAlign: "center", padding: "5px 0", borderRadius: 7, fontWeight: 600 }}>
                      طلب سريع
                    </div>
                  </div>
                </div>

              </div>
            </div>

            <p style={{ fontSize: ".68rem", color: "#d1d5db", marginTop: 10 }}>
              تظهر للزبائن بعد الحفظ
            </p>
          </div>
        </div>

      </div>

      {/* Responsive */}
      <style>{`
        @media (max-width: 700px) {
          [dir="rtl"] > div { grid-template-columns: 1fr !important; }
          [dir="rtl"] > div > div:last-child { position: static !important; }
        }
      `}</style>
    </div>
  );
}

export default Theme;