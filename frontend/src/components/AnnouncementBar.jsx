// ============================================================
// 📁 components/AnnouncementBar.jsx
// ── Announcement Bar موحّد — كان مكرر فـ 6 صفحات (PublicStore,
//    CategoryProducts, SearchResults, Checkout, OrderSuccess,
//    ProductDetails) وكل وحدة فيهم كانت شوية مختلفة عن الأخرى
//    (bug drift) — دابا مصدر واحد، خدمة واحدة، كل الصفحات كيفكيف.
//
// ✦ الإصلاحات مقارنة بالنسخة القديمة:
//   1) فحص "enabled" موحّد فـ الكل (قبل: PublicStore وحدها كانت
//      كتخبّي البار إذا "enabled" ماكانش معرّف/undefined، بينما
//      باقي الصفحات كانو يبانو — نفس الستور كان يبان فـ صفحة
//      ويختفي فـ الأخرى بلا سبب واضح).
//   2) زر الإغلاق (✕) ماكانش كاين خالص فـ ProductDetails.jsx —
//      دابا كاين فـ الكل.
//   3) الإغلاق كان كيبدّل style.display مباشرة على الـ DOM (بلا
//      React state) — كل صفحة بروحها، فما كانش "تذكّر" الإغلاق
//      كي تتبدّل الصفحة (البار كان يولي يبان من جديد) — دابا
//      كنستعملو sessionStorage (مفتاح خاص بكل متجر) باش الإغلاق
//      يبقى محترم فـ كل صفحات نفس المتجر خلال نفس الجلسة.
//   4) سرعة الـ marquee كانت ثابتة 18s بغض النظر عن طول الرسالة —
//      رسالة قصيرة كتلوّح بسرعة زايدة، رسالة طويلة كتبان بطيئة/
//      متقطعة. دابا المدة كتتحسب حسب طول النص باش السرعة (px/s)
//      تبقى ثابتة ومريحة للعين ديما.
//   5) عدد التكرارات ديال الرسالة (كانت 6 ثابتة) — إذا الرسالة
//      قصيرة والشاشة كبيرة، ممكن يبان فراغ/قفزة فـ الدورة. دابا
//      كنزيدو العدد شوية (8) + نتأكدو المسافة بينهم ثابتة.
//   6) position:relative كانت ناقصة فـ ProductDetails (كانت
//      كتخلي زر الإغلاق يتموقع غلط إذا تفعّل).
//   7) preview mode (جوّة محرر الثيم) ما كيستعملش sessionStorage
//      باش الإغلاق ديال التاجر وهو كيجرّب ما يأثرش على الجلسة
//      الحقيقية ديال الزبون (نفس origin أحيانا).
// ============================================================

import { useEffect, useState } from "react";

const CLOSE_KEY_PREFIX = "ann-bar-closed:";

/**
 * @param {object}  props
 * @param {object}  props.settings   - { message, bgColor, textColor, animation, showClose }
 * @param {string}  [props.slug]     - store slug، يتستعمل باش الإغلاق يبقى محترم عبر كل صفحات نفس المتجر
 * @param {boolean} [props.isPreview]- true فـ محرر الثيم (ThemeEdit) — ماكيستعملش sessionStorage
 */
export default function AnnouncementBar({ settings, slug, isPreview }) {
  const [closed, setClosed] = useState(false);

  // ── نقراو حالة الإغلاق المحفوظة (غير فـ الموقع الحقيقي، ماشي فـ preview) ──
  useEffect(() => {
    if (isPreview || !slug) return;
    try {
      if (sessionStorage.getItem(CLOSE_KEY_PREFIX + slug) === "1") setClosed(true);
    } catch (_) { /* sessionStorage قد يكون محظور (private mode) — نتجاهلو بهدوء */ }
  }, [slug, isPreview]);

  if (!settings || closed) return null;

  const { message, bgColor, textColor, animation, showClose } = settings;
  if (!message) return null;

  const handleClose = () => {
    setClosed(true);
    if (!isPreview && slug) {
      try { sessionStorage.setItem(CLOSE_KEY_PREFIX + slug, "1"); } catch (_) {}
    }
  };

  // ── مدة الدورة كتتحسب حسب طول الرسالة باش السرعة البصرية (px/ثانية) تبقى ثابتة
  //    ديما، عوض مدة ثابتة 18s كانت كتبان سريعة برسالة قصيرة وبطيئة برسالة طويلة ──
  const REPEAT_COUNT = 8;
  const duration = Math.min(60, Math.max(12, (message.length || 1) * 0.45));

  return (
    <div style={{ background: bgColor, borderBottom: "1px solid rgba(0,0,0,.1)", overflow: "hidden", padding: "9px 0", position: "relative" }}>
      {animation ? (
        <div
          className="ann-bar-marquee-track"
          style={{ display: "flex", width: "max-content", animationDuration: `${duration}s` }}
        >
          {/* ✦ مسافة على كل عنصر بوحدو (marginInlineEnd) بدل gap على الـ container —
              باش كل عنصر يحسب مساحته كاملة (النص + المسافة)، وتحريك -50% يبقى مضبوط 100% بلا أي قفزة */}
          {[...Array(REPEAT_COUNT)].map((_, i) => (
            <span key={i} style={{ fontSize: 12, fontWeight: 600, letterSpacing: 1.5, color: textColor, whiteSpace: "nowrap", marginInlineEnd: 64 }}>
              {message}
            </span>
          ))}
        </div>
      ) : (
        <p style={{ textAlign: "center", fontSize: 12, fontWeight: 600, color: textColor, margin: 0, letterSpacing: 1 }}>{message}</p>
      )}
      {showClose && (
        <button
          onClick={handleClose}
          aria-label="إغلاق الشريط"
          style={{ position: "absolute", top: "50%", left: 12, transform: "translateY(-50%)", background: "none", border: "none", color: textColor, cursor: "pointer", fontSize: 16, opacity: .7 }}
        >
          ✕
        </button>
      )}
    </div>
  );
}

// ── هل السكشن مفعّل؟ فحص موحّد يتحط بلاصة كل نسخة قديمة مختلفة ──
// (undefined = مفعّل بالافتراض، غير false صريحة كتخبّي البار)
export function isAnnouncementEnabled(section) {
  return !!section?.settings && section.enabled !== false;
}

// ── CSS ديال الأنيميشن — يتضاف مرة وحدة لكل صفحة (نفس نمط injectCSS الموجود) ──
export const ANNOUNCEMENT_BAR_CSS = `
@keyframes ann-bar-marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
.ann-bar-marquee-track { animation-name: ann-bar-marquee; animation-timing-function: linear; animation-iteration-count: infinite; will-change: transform; }
`;