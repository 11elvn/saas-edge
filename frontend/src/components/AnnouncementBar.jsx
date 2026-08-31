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
//      متقطعة. دابا المدة كتتحسب حسب عرض المحتوى الحقيقي (px)
//      باش السرعة البصرية (px/ثانية) تبقى ثابتة ديما.
//   5) "GAP" فالدورة (النص يختفي من اليسار ويوقف شوية قبل ما
//      يدخل من اليمين) — كان سببها عدد تكرارات ثابت (6) ماكانش
//      ديما كافي باش يغطي عرض الحاوية. دابا كنقيسو عرض الحاوية
//      وعرض عنصر وحد بالـ JS (ResizeObserver) ونحسبو عدد
//      التكرارات ديناميكيًا باش كل "نص" (half) ديال التراك يغطي
//      عرض الحاوية بالكامل — بهاد الطريقة الدورة كتبقى سلسة 100%
//      بلا أي فراغ، بغض النظر عن طول الرسالة أو عرض الشاشة، وكتتأقلم
//      أوتوماتيكيًا إذا تبدّل حجم النافذة.
//   6) position:relative كانت ناقصة فـ ProductDetails (كانت
//      كتخلي زر الإغلاق يتموقع غلط إذا تفعّل).
//   7) preview mode (جوّة محرر الثيم) ما كيستعملش sessionStorage
//      باش الإغلاق ديال التاجر وهو كيجرّب ما يأثرش على الجلسة
//      الحقيقية ديال الزبون (نفس origin أحيانا).
// ============================================================

import { useEffect, useLayoutEffect, useRef, useState } from "react";

const CLOSE_KEY_PREFIX = "ann-bar-closed:";
const GAP_PX = 64;          // المسافة بين كل تكرار (marginInlineEnd)
const SPEED_PX_PER_SEC = 55; // سرعة ثابتة (px/ثانية) — كل الرسائل كتلوّح بنفس الإحساس بالسرعة

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

  const message    = settings?.message;
  const showMarquee = !!settings?.animation && !!message;

  // ── قياس عرض الحاوية + عرض عنصر وحد باش نحسبو عدد التكرارات الكافي ──
  const containerRef = useRef(null);
  const itemRef       = useRef(null);
  const [containerW, setContainerW] = useState(0);
  const [itemW, setItemW]           = useState(0);

  useEffect(() => {
    if (!showMarquee || !containerRef.current) return;
    const el = containerRef.current;
    const ro = new ResizeObserver(entries => {
      const w = entries[0]?.contentRect?.width;
      if (w) setContainerW(w);
    });
    ro.observe(el);
    setContainerW(el.offsetWidth || 0);
    return () => ro.disconnect();
  }, [showMarquee]);

  useLayoutEffect(() => {
    if (!showMarquee || !itemRef.current) return;
    setItemW(itemRef.current.offsetWidth || 0);
  }, [showMarquee, message]);

  if (!settings || closed || !message) return null;

  const { bgColor, textColor, showClose } = settings;

  const handleClose = () => {
    setClosed(true);
    if (!isPreview && slug) {
      try { sessionStorage.setItem(CLOSE_KEY_PREFIX + slug, "1"); } catch (_) {}
    }
  };

  // ── عدد التكرارات لكل "نص" (half) ديال التراك — خاصو يغطي عرض الحاوية
  //    بالكامل + هامش أمان، حتى ما يبانش أي فراغ فوقت الدورة. قبل ما توصل
  //    القياسات الحقيقية (أول رندر)، نستعملو fallback كبير (12) باش
  //    البار يبان مليان مباشرة بلا وميض ("flash of gap") ──
  const singleItemWidth = itemW > 0 ? itemW + GAP_PX : 0;
  const itemsPerHalf = singleItemWidth > 0 && containerW > 0
    ? Math.max(2, Math.ceil(containerW / singleItemWidth) + 1)
    : 12;
  const REPEAT_COUNT = itemsPerHalf * 2;

  // ── مدة الدورة = مسافة "نص" وحد (itemsPerHalf عنصر) ÷ سرعة ثابتة px/s —
  //    هكذا كل الرسائل (طويلة/قصيرة) كتلوّح بنفس الإحساس بالسرعة ديما ──
  const halfWidthPx = singleItemWidth > 0 ? singleItemWidth * itemsPerHalf : (message.length || 1) * 9 * itemsPerHalf;
  const duration = Math.min(60, Math.max(8, halfWidthPx / SPEED_PX_PER_SEC));

  return (
    <div style={{ background: bgColor, borderBottom: "1px solid rgba(0,0,0,.1)", overflow: "hidden", padding: "9px 0", position: "relative" }}>
      {showMarquee ? (
        <div ref={containerRef} style={{ width: "100%", overflow: "hidden" }}>
          <div
            className="ann-bar-marquee-track"
            style={{
              display: "flex", width: "max-content",
              animationDuration: `${duration}s`,
              // ✦ نخبّيو التراك بصريًا لحد ما نقيسو الأبعاد الحقيقية (itemW/containerW)
              //   باش ما يبانش "gap" فـ أول رندر قبل ما يتصحح عدد التكرارات
              visibility: itemW > 0 ? "visible" : "hidden",
            }}
          >
            {/* ✦ مسافة على كل عنصر بوحدو (marginInlineEnd) بدل gap على الـ container —
                باش كل عنصر يحسب مساحته كاملة (النص + المسافة)، وتحريك -50% يبقى مضبوط 100% بلا أي قفزة.
                عدد التكرارات (REPEAT_COUNT) محسوب ديناميكيًا باش كل "نص" من التراك يغطي عرض
                الحاوية بالكامل — هذا هو اللي كيمنع الفراغ/التوقف فالدورة */}
            {[...Array(REPEAT_COUNT)].map((_, i) => (
              <span
                key={i}
                ref={i === 0 ? itemRef : null}
                style={{ fontSize: 12, fontWeight: 600, letterSpacing: 1.5, color: textColor, whiteSpace: "nowrap", marginInlineEnd: GAP_PX }}
              >
                {message}
              </span>
            ))}
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