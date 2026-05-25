import { useEffect, useState } from "react";

// ====================================================
// 🎨 Theme.jsx — صفحة تخصيص المتجر
// ====================================================
// 🔧 إصلاح المشكلة الرئيسية:
//    كان saveSettings يرسل كامل الـ store object مع _id و __v وغيرها
//    من Mongoose — هدا ما كان يسبب تعارض في الباك-أند أحياناً.
//    الحل: نرسل فقط الحقول المطلوبة بشكل صريح (destructuring).
//
// 🔧 إصلاح ثاني:
//    كان ممكن يضغط Save وname فارغ (قبل ما يكمل الـ fetch) →
//    الباك-أند يرجع 400 وما يحفظ شي. الحل: نضيف loading state
//    ونمنع الإرسال إذا name فارغ.
//
// 🔧 إصلاح ثالث:
//    بعد الحفظ الناجح، نحدث الـ state من رسپونس الباك-أند مباشرة
//    باش تبقى البيانات متزامنة دايماً.
// ====================================================

function Theme() {
  // ====================================================
  // STATE
  // ====================================================

  const [store, setStore] = useState({
    name: "",
    slug: "",
    phone: "",
    logo: "",
    banner: "",
    primaryColor: "#2563eb",
    secondaryColor: "#0f172a",
    fontFamily: "Inter",
  });

  // حالة التحميل الأولي (جلب البيانات)
  const [fetchLoading, setFetchLoading] = useState(true);

  // حالة الحفظ (عند الضغط على Save)
  const [saving, setSaving] = useState(false);

  // رسالة النجاح أو الخطأ بعد الحفظ
  const [feedback, setFeedback] = useState(null); // { type: "success"|"error", text: string }

  const token = localStorage.getItem("token");

  // ====================================================
  // جلب بيانات المتجر من الباك-أند
  // ====================================================
  useEffect(() => {
    setFetchLoading(true);

    fetch(`${import.meta.env.VITE_API_URL}/api/stores/my-store`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.hasStore) {
          // نحدث فقط الحقول الموجودة في الـ state — نتجنب حقول Mongoose (_id، __v...)
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
      .catch((err) => console.error("Error fetching store:", err))
      .finally(() => setFetchLoading(false));
  }, [token]);

  // ====================================================
  // حفظ التغييرات
  // ====================================================
  const saveSettings = async () => {
    // 🔧 منع الإرسال إذا الاسم فارغ
    if (!store.name.trim()) {
      setFeedback({ type: "error", text: "اسم المتجر مطلوب ⚠️" });
      return;
    }

    setSaving(true);
    setFeedback(null);

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/stores/update`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          // 🔧 نرسل فقط الحقول المطلوبة — لا نرسل _id أو __v أو owner
          body: JSON.stringify({
            name:           store.name,
            phone:          store.phone,
            logo:           store.logo,
            banner:         store.banner,
            primaryColor:   store.primaryColor,
            secondaryColor: store.secondaryColor,
            fontFamily:     store.fontFamily,
          }),
        }
      );

      const data = await res.json();

      if (res.ok) {
        // 🔧 نحدث الـ state من رسپونس الباك-أند باش نضمن التزامن
        if (data.store) {
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
        setFeedback({ type: "success", text: "تم حفظ التغييرات بنجاح ✅" });
      } else {
        setFeedback({ type: "error", text: data.message || "حدث خطأ أثناء الحفظ ❌" });
      }
    } catch (err) {
      console.error("Error saving store:", err);
      setFeedback({ type: "error", text: "تعذر الاتصال بالخادم، حاول مجدداً" });
    } finally {
      setSaving(false);
      // إخفاء الرسالة بعد 4 ثواني
      setTimeout(() => setFeedback(null), 4000);
    }
  };

  // ====================================================
  // helper: تحديث حقل واحد في الـ state
  // ====================================================
  const updateField = (field, value) =>
    setStore((prev) => ({ ...prev, [field]: value }));

  // ====================================================
  // شاشة التحميل الأولي
  // ====================================================
  if (fetchLoading) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
          <p className="text-white/40 text-sm tracking-widest uppercase">جاري التحميل</p>
        </div>
      </div>
    );
  }

  // ====================================================
  // RENDER
  // ====================================================
  return (
    <div
      className="min-h-screen bg-[#0f0f0f] text-white"
      dir="rtl"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      {/* Google Font */}
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&display=swap');`}</style>

      {/* ===== TOP BAR ===== */}
      <header className="border-b border-white/8 px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center text-sm">
            🎨
          </div>
          <span className="text-sm font-medium text-white/70">تخصيص المتجر</span>
        </div>
        {store.slug && (
          <a
            href={`/store/${store.slug}`}
            target="_blank"
            rel="noreferrer"
            className="text-xs text-white/30 hover:text-white/60 transition-colors flex items-center gap-1"
          >
            <span>/{store.slug}</span>
            <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        )}
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-8">

        {/* ===== LEFT: FORM ===== */}
        <div className="space-y-6">

          {/* Store Name */}
          <div className="bg-white/4 border border-white/8 rounded-2xl p-5">
            <label className="block text-xs text-white/40 uppercase tracking-widest mb-3">
              اسم المتجر
            </label>
            <input
              className="w-full bg-white/6 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/20 outline-none focus:border-white/30 transition-colors"
              placeholder="مثال: متجر النور"
              value={store.name}
              onChange={(e) => updateField("name", e.target.value)}
            />
          </div>

          {/* Colors */}
          <div className="bg-white/4 border border-white/8 rounded-2xl p-5">
            <label className="block text-xs text-white/40 uppercase tracking-widest mb-4">
              الألوان
            </label>
            <div className="grid grid-cols-2 gap-4">

              {/* Primary */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-white/50">اللون الرئيسي</span>
                  {/* 💡 Primary Color = لون الهيدر في المتجر العمومي */}
                  <span className="text-[10px] text-white/25">هيدر المتجر</span>
                </div>
                <div className="relative">
                  <div
                    className="w-full h-11 rounded-xl border border-white/10 cursor-pointer overflow-hidden"
                    style={{ backgroundColor: store.primaryColor }}
                  >
                    <input
                      type="color"
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      value={store.primaryColor}
                      onChange={(e) => updateField("primaryColor", e.target.value)}
                    />
                  </div>
                  <span className="block text-center text-[11px] text-white/30 mt-1.5 font-mono">
                    {store.primaryColor}
                  </span>
                </div>
              </div>

              {/* Secondary */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-white/50">اللون الثانوي</span>
                  {/* 💡 Secondary Color = لون أزرار الشراء في كروت المنتجات */}
                  <span className="text-[10px] text-white/25">زر الشراء</span>
                </div>
                <div className="relative">
                  <div
                    className="w-full h-11 rounded-xl border border-white/10 cursor-pointer overflow-hidden"
                    style={{ backgroundColor: store.secondaryColor }}
                  >
                    <input
                      type="color"
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      value={store.secondaryColor}
                      onChange={(e) => updateField("secondaryColor", e.target.value)}
                    />
                  </div>
                  <span className="block text-center text-[11px] text-white/30 mt-1.5 font-mono">
                    {store.secondaryColor}
                  </span>
                </div>
              </div>

            </div>
          </div>

          {/* Font Family */}
          <div className="bg-white/4 border border-white/8 rounded-2xl p-5">
            <label className="block text-xs text-white/40 uppercase tracking-widest mb-3">
              الخط
            </label>
            <div className="grid grid-cols-4 gap-2">
              {["Inter", "Poppins", "Cairo", "Roboto"].map((font) => (
                <button
                  key={font}
                  onClick={() => updateField("fontFamily", font)}
                  className={`py-2.5 rounded-xl text-xs transition-all border ${
                    store.fontFamily === font
                      ? "bg-white text-black border-white font-medium"
                      : "bg-white/4 text-white/50 border-white/8 hover:border-white/20 hover:text-white/70"
                  }`}
                  style={{ fontFamily: font }}
                >
                  {font}
                </button>
              ))}
            </div>
          </div>

          {/* Media URLs */}
          <div className="bg-white/4 border border-white/8 rounded-2xl p-5 space-y-4">
            <label className="block text-xs text-white/40 uppercase tracking-widest">
              الوسائط
            </label>

            <div>
              <span className="block text-xs text-white/50 mb-2">رابط اللوجو</span>
              <input
                className="w-full bg-white/6 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/20 outline-none focus:border-white/30 transition-colors"
                placeholder="https://..."
                value={store.logo}
                onChange={(e) => updateField("logo", e.target.value)}
              />
            </div>

            <div>
              <span className="block text-xs text-white/50 mb-2">رابط البانر</span>
              <input
                className="w-full bg-white/6 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/20 outline-none focus:border-white/30 transition-colors"
                placeholder="https://..."
                value={store.banner}
                onChange={(e) => updateField("banner", e.target.value)}
              />
            </div>

            <div>
              <span className="block text-xs text-white/50 mb-2">رقم الهاتف</span>
              <input
                type="tel"
                className="w-full bg-white/6 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/20 outline-none focus:border-white/30 transition-colors text-right"
                placeholder="0661234567"
                value={store.phone}
                onChange={(e) => updateField("phone", e.target.value)}
              />
            </div>
          </div>

          {/* Feedback message */}
          {feedback && (
            <div
              className={`px-4 py-3 rounded-xl text-sm text-center transition-all ${
                feedback.type === "success"
                  ? "bg-emerald-500/15 border border-emerald-500/30 text-emerald-400"
                  : "bg-red-500/15 border border-red-500/30 text-red-400"
              }`}
            >
              {feedback.text}
            </div>
          )}

          {/* Save Button */}
          <button
            onClick={saveSettings}
            disabled={saving}
            className="w-full py-3.5 rounded-xl text-sm font-medium bg-white text-black hover:bg-white/90 active:scale-[0.99] transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                جاري الحفظ...
              </>
            ) : (
              "حفظ التغييرات"
            )}
          </button>

        </div>

        {/* ===== RIGHT: LIVE PREVIEW ===== */}
        <div className="lg:sticky lg:top-8 h-fit">
          <p className="text-xs text-white/30 uppercase tracking-widest mb-3 text-center">
            معاينة مباشرة
          </p>

          {/* Phone frame */}
          <div className="mx-auto w-[220px] bg-[#1a1a1a] rounded-[32px] border border-white/10 p-2 shadow-2xl">
            <div className="rounded-[24px] overflow-hidden bg-white" style={{ fontFamily: store.fontFamily }}>

              {/* Preview header — يعكس primaryColor */}
              <div className="p-4 text-center" style={{ backgroundColor: store.primaryColor }}>
                {store.logo ? (
                  <img src={store.logo} alt="logo" className="w-10 h-10 rounded-xl mx-auto mb-2 object-cover" />
                ) : (
                  <div className="w-10 h-10 rounded-xl bg-white/20 mx-auto mb-2 flex items-center justify-center text-lg">🏪</div>
                )}
                <p className="text-white text-xs font-medium truncate px-2">{store.name || "اسم المتجر"}</p>
                <p className="text-white/60 text-[9px] mt-0.5">الدفع عند الاستلام</p>
              </div>

              {/* Preview banner */}
              {store.banner && (
                <img src={store.banner} alt="banner" className="w-full h-16 object-cover" />
              )}

              {/* Preview product card */}
              <div className="p-3">
                <div className="bg-gray-50 rounded-xl p-2.5 mb-2">
                  <div className="h-16 bg-gray-200 rounded-lg mb-2" />
                  <div className="h-2 bg-gray-300 rounded w-3/4 mb-1" />
                  <div className="h-2 bg-gray-200 rounded w-1/2 mb-2" />
                  <div className="h-2.5 bg-gray-800 rounded w-1/3 mb-2" />
                  {/* زر الشراء — يعكس secondaryColor */}
                  <div
                    className="w-full py-1.5 rounded-lg text-white text-[9px] text-center font-medium"
                    style={{ backgroundColor: store.secondaryColor }}
                  >
                    طلب سريع
                  </div>
                </div>
              </div>

            </div>
          </div>

          <p className="text-[10px] text-white/20 text-center mt-3">
            التغييرات تظهر للزبائن بعد الحفظ
          </p>
        </div>

      </main>
    </div>
  );
}

export default Theme;