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
//      باقي الصفحات كانو يبانو).
//   2) زر الإغلاق (✕) ماكانش كاين خالص فـ ProductDetails.jsx.
//   3) الإغلاق كان كيبدّل style.display مباشرة على الـ DOM (بلا
//      React state) — دابا sessionStorage (مفتاح خاص بكل متجر)
//      باش الإغلاق يبقى محترم فـ كل صفحات نفس المتجر خلال الجلسة.
//   4) سرعة الـ marquee كانت ثابتة 18s بغض النظر عن طول الرسالة.
//   5) "GAP" فالدورة (النص يختفي من اليسار ويوقف شوية قبل ما يدخل
//      من اليمين) — هذا هو الإصلاح المهم، بالتفصيل تحت.
//   6) position:relative كانت ناقصة فـ ProductDetails.
//   7) preview mode ما كيستعملش sessionStorage.
//
// ✦✦ الحل النهائي ديال الـ GAP (نقطة 5) ✦✦
//    المحاولة السابقة كانت كتقيس عدد التكرارات "المناسب" بالـ JS —
//    هادشي فيه مشكل: القياس async (ResizeObserver) وممكن يبان فراغ
//    وقت ما القياس مازال ماوصلش، خصوصا جوّة iframe المحرر.
//
//    الحل الاحترافي (نفس اللي كتستعملو Shopify/متاجر كبار):
//    عوض ما نحسبو "شحال من نسخة خاصنا"، كنبنيو مجموعتين (Group A / B)
//    مطابقتين تمامًا (نفس المحتوى بالضبط)، وكل مجموعة كنفرضو عليها
//    بالـ CSS مباشرة (min-width بالبيكسل الحقيقي ديال الحاوية):
//      عرض المجموعة >= عرض الحاوية (الشريط) ديما.
//    هكذا رياضيًا: نصف الشريط (Group A) دايما يغطي الشاشة بالكامل،
//    ونصو الثاني (Group B) نفس الشيء — فكي الأنيميشن يوصل لمنتصف
//    الشريط (translateX(-50%))، اللي كيبان هو بالضبط نفس اللي كان
//    باين فالبداية (Group B بدل Group A) — بلا أي إطار واحد فيه فراغ.
//    القياس هنا يستعمل غير عرض الحاوية (رقم وحد، ثابت وسهل)، ماشي
//    عرض كل عنصر — أبسط وأقل عرضة للأخطاء.
// ============================================================

import { useEffect, useRef, useState } from "react";

const CLOSE_KEY_PREFIX = "ann-bar-closed:";
const GAP_PX = 48;              // المسافة بين كل تكرار جوّة نفس المجموعة
const ITEMS_PER_GROUP = 6;      // تكرار كثيف جوّة كل مجموعة (شكل احترافي متلاصق)
const SPEED_PX_PER_SEC = 55;    // سرعة ثابتة (px/ثانية) — كل الرسائل بنفس الإحساس بالسرعة

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

  const message     = settings?.message;
  const showMarquee = !!settings?.animation && !!message;

  // ── قياس عرض الحاوية فقط (رقم وحد بسيط) — هذا كافي باش نضمنو
  //    أن كل مجموعة (Group) تغطي الشاشة بالكامل، بلا حاجة نقيسو
  //    عرض كل عنصر بوحدو (كان مصدر مشاكل فالمحاولة السابقة) ──
  const containerRef = useRef(null);
  const [containerW, setContainerW] = useState(0);

  useEffect(() => {
    if (!showMarquee || !containerRef.current) return;
    const el = containerRef.current;
    const measure = () => setContainerW(el.getBoundingClientRect().width || 0);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [showMarquee]);

  if (!settings || closed || !message) return null;

  const { bgColor, textColor, showClose } = settings;

  const handleClose = () => {
    setClosed(true);
    if (!isPreview && slug) {
      try { sessionStorage.setItem(CLOSE_KEY_PREFIX + slug, "1"); } catch (_) {}
    }
  };

  // ── مدة الدورة تتناسب مع عرض الحاوية (المسافة الحقيقية اللي كيقطعها
  //    نص الشريط) ÷ سرعة ثابتة، باش الإحساس بالسرعة يبقى نفسه ديما ──
  const groupWidthPx = containerW > 0 ? containerW : 600; // fallback معقول قبل القياس
  const duration = Math.min(60, Math.max(8, groupWidthPx / SPEED_PX_PER_SEC));

  // ── مجموعة وحدة = تكرار كثيف ديال الرسالة، و min-width تفرض عليها
  //    تغطي عرض الحاوية بالكامل حتى لو الرسالة قصيرة — هذا بالضبط
  //    اللي كيمنع الـ "gap" ✦ ──
  const renderGroup = (groupKey) => (
    <div
      key={groupKey}
      style={{
        display: "flex", flexShrink: 0, alignItems: "center",
        minWidth: containerW > 0 ? `${containerW}px` : "100%",
      }}
    >
      {[...Array(ITEMS_PER_GROUP)].map((_, i) => (
        <span key={i} style={{ fontSize: 12, fontWeight: 600, letterSpacing: 1.5, color: textColor, whiteSpace: "nowrap", marginInlineEnd: GAP_PX }}>
          {message}
        </span>
      ))}
    </div>
  );

  return (
    <div style={{ background: bgColor, borderBottom: "1px solid rgba(0,0,0,.1)", overflow: "hidden", padding: "9px 0", position: "relative" }}>
      {showMarquee ? (
        <div ref={containerRef} style={{ width: "100%", overflow: "hidden" }}>
          <div
            className="ann-bar-marquee-track"
            style={{ display: "flex", width: "max-content", animationDuration: `${duration}s` }}
          >
            {/* ✦ مجموعتين مطابقتين تمامًا — كل وحدة عرضها الأقل = عرض الحاوية
                (min-width بالبيكسل الحقيقي)، فالأنيميشن (-50%) كيبدّل من
                مجموعة للأخرى بلا أي فراغ ممكن يبان بينهم ✦ */}
            {renderGroup("a")}
            {renderGroup("b")}
          </div>
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