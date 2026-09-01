// ============================================================
// 📁 components/AnnouncementBar.jsx
// ── Announcement Bar موحّد — كان مكرر فـ 6 صفحات (PublicStore,
//    CategoryProducts, SearchResults, Checkout, OrderSuccess,
//    ProductDetails) وكل وحدة فيهم كانت شوية مختلفة عن الأخرى
//    (bug drift) — دابا مصدر واحد، خدمة واحدة، كل الصفحات كيفكيف.
//
// ✦ الإصلاحات مقارنة بالنسخة القديمة:
//   1) فحص "enabled" موحّد فـ الكل.
//   2) زر الإغلاق (✕) ماكانش كاين خالص فـ ProductDetails.jsx.
//   3) الإغلاق كان كيبدّل style.display مباشرة على الـ DOM — دابا
//      sessionStorage (مفتاح خاص بكل متجر) باش الإغلاق يبقى محترم
//      فـ كل صفحات نفس المتجر خلال الجلسة.
//   4) سرعة الـ marquee كانت ثابتة 18s بغض النظر عن طول الرسالة.
//   5) "GAP" فالدورة (فراغ فارغ بلا نص يبان وسط الدورة) — الإصلاح
//      المهم، بالتفصيل تحت.
//   6) position:relative كانت ناقصة فـ ProductDetails.
//   7) preview mode ما كيستعملش sessionStorage.
//
// ✦✦ الحل النهائي ديال الـ GAP (نقطة 5) ✦✦
//    محاولة سابقة استعملت "min-width: عرض الحاوية" على كل مجموعة —
//    هذا خلق بالضبط المشكل: إذا الرسالة قصيرة (مثلا "9999999999")
//    وعدد التكرارات الثابت (6) ما عمروش عرض الحاوية، الـ min-width
//    كان "كيفرض" عرض فارغ إضافي فآخر المجموعة (فراغ بني بلا نص) —
//    بالضبط اللي بان فالصورة.
//
//    الحل الصحيح: بدل ما نملأ الفراغ بـ min-width، خاصنا نزيدو
//    عدد التكرارات الحقيقي (نصوص فعلية، ماشي فراغ) حتى المحتوى
//    الحقيقي ديال مجموعة وحدة يعمر/يفوق عرض الحاوية بروحو. كنقيسو:
//      - عرض الحاوية (containerW) عبر ResizeObserver
//      - عرض نسخة وحدة ديال الرسالة (itemW) عبر ref على أول span
//    ونحسبو: itemsPerGroup = ceil(containerW / (itemW+GAP)) + 1
//    (+1 هامش أمان). كل مجموعة كتحتوي itemsPerGroup نسخة **حقيقية**
//    ديال الرسالة (بلا أي فراغ فارغ)، فعرضها الطبيعي (بلا فرض) ديما
//    >= عرض الحاوية — وهكذا رياضيًا الفراغ يولي مستحيل، بلا ما
//    نستعملو min-width خالص.
// ============================================================

import { useEffect, useLayoutEffect, useRef, useState } from "react";

const CLOSE_KEY_PREFIX = "ann-bar-closed:";
const GAP_PX = 48;              // المسافة بين كل تكرار جوّة نفس المجموعة
const FALLBACK_ITEMS_PER_GROUP = 10; // قبل ما توصل القياسات الحقيقية (أول رندر)
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

  // ── قياس عرض الحاوية (ResizeObserver) وعرض نسخة وحدة ديال الرسالة
  //    (ref على أول span) — الاثنين خاصهم باش نحسبو عدد التكرارات
  //    الحقيقي الكافي بلا أي فراغ فارغ ──
  const containerRef = useRef(null);
  const probeRef      = useRef(null);
  const [containerW, setContainerW] = useState(0);
  const [itemW, setItemW]           = useState(0);

  useEffect(() => {
    if (!showMarquee || !containerRef.current) return;
    const el = containerRef.current;
    const measure = () => setContainerW(el.getBoundingClientRect().width || 0);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [showMarquee]);

  // ✦ نقيسو عرض نسخة وحدة ديال الرسالة (span مخفي بصريًا، خارج التدفق،
  //   ماشي جوّة الـ marquee نفسه) — قياس ثابت ومباشر، بلا اعتماد على
  //   أول عنصر فـ لائحة كبيرة كتتبدل ──
  useLayoutEffect(() => {
    if (!showMarquee || !probeRef.current) return;
    setItemW(probeRef.current.offsetWidth || 0);
  }, [showMarquee, message]);

  if (!settings || closed || !message) return null;

  const { bgColor, textColor, showClose } = settings;

  const handleClose = () => {
    setClosed(true);
    if (!isPreview && slug) {
      try { sessionStorage.setItem(CLOSE_KEY_PREFIX + slug, "1"); } catch (_) {}
    }
  };

  // ── عدد التكرارات الحقيقي جوّة كل مجموعة (بلا فراغ فارغ) — خاص
  //    يضمن أن عرض المجموعة الطبيعي (نسخ حقيقية فقط) يفوق عرض
  //    الحاوية، حتى الرسالة قصيرة بزاف ──
  const singleItemFullWidth = itemW > 0 ? itemW + GAP_PX : 0;
  const itemsPerGroup = singleItemFullWidth > 0 && containerW > 0
    ? Math.max(3, Math.ceil(containerW / singleItemFullWidth) + 1)
    : FALLBACK_ITEMS_PER_GROUP;

  // ── مدة الدورة = عرض مجموعة وحدة (المسافة الحقيقية اللي كيقطعها
  //    نص الشريط) ÷ سرعة ثابتة px/s — كل الرسائل بنفس إحساس السرعة ──
  const groupWidthPx = singleItemFullWidth > 0
    ? singleItemFullWidth * itemsPerGroup
    : (containerW || 600);
  const duration = Math.min(60, Math.max(8, groupWidthPx / SPEED_PX_PER_SEC));

  const renderGroup = (groupKey) => (
    <div key={groupKey} style={{ display: "flex", flexShrink: 0, alignItems: "center" }}>
      {[...Array(itemsPerGroup)].map((_, i) => (
        <span key={i} style={{ fontSize: 12, fontWeight: 600, letterSpacing: 1.5, color: textColor, whiteSpace: "nowrap", marginInlineEnd: GAP_PX }}>
          {message}
        </span>
      ))}
    </div>
  );

  return (
    <div style={{ background: bgColor, borderBottom: "1px solid rgba(0,0,0,.1)", overflow: "hidden", padding: "9px 0", position: "relative" }}>
      {showMarquee ? (
        <div ref={containerRef} style={{ width: "100%", overflow: "hidden", position: "relative" }}>
          {/* ✦ span مخفي (خارج الشاشة، لا يشغل مكان) غير باش نقيسو عرض
              نسخة وحدة ديال الرسالة بدقة — ماشي جزء من الماركيه المرئي ✦ */}
          <span
            ref={probeRef}
            aria-hidden="true"
            style={{ position: "absolute", visibility: "hidden", whiteSpace: "nowrap", fontSize: 12, fontWeight: 600, letterSpacing: 1.5, pointerEvents: "none", top: 0, insetInlineStart: 0 }}
          >
            {message}
          </span>
          <div
            className="ann-bar-marquee-track"
            style={{
              display: "flex", width: "max-content", animationDuration: `${duration}s`,
              // ✦ نخبّيو التراك المرئي لحد ما نتوصل بقياس حقيقي، باش ما
              //   يبانش فراغ لحظي فأول تحميل قبل ما يتصحح العدد ✦
              visibility: itemW > 0 ? "visible" : "hidden",
            }}
          >
            {/* ✦ مجموعتين مطابقتين، كل وحدة فيها عدد تكرارات حقيقي (بلا فراغ
                فارغ) محسوب باش عرضها الطبيعي يفوق عرض الحاوية — هذا هو
                اللي كيضمن عدم وجود أي فراغ فالدورة ✦ */}
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