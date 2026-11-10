// ============================================================
// 📁 utils/themeStyles.js
// ✦ مصدر واحد لإعدادات ThemeEdit → Styles → Buttons & corners:
//    1) Corners        (square | small | medium | large | pill)
//    2) Button style   (filled | outline | ghost "Soft")
//    3) Button size    (S | M | L)           — M = القيم الأصلية بدون تغيير
//    4) Secondary style (filled | outline | ghost) — إذا ما تحددش كيتحسب تلقائيا
//    5) Order button   (size M | L | XL + weight) — role: "order"
//    6) On inverted    (brand | contrast) — للأزرار فوق الصور/الخلفيات الداكنة (onImage)
// ✦ الاستعمال:
//    - على الـ wrapper الرئيسي لكل صفحة:  style={{ ...themeVars(styles) }}
//    - بدل borderRadius: 12   →   borderRadius: rs(12)
//    - على الأزرار:  style={{ ...حقول الزر, ...btnStyle(styles, primary, opts) }}
//    - زر الطلب:     btnStyle(styles, primary, { role: "order" })
//    - زر غير عريض 100%: مرر padX باش الحجم يحافظ على الحشو الأفقي
// ============================================================

// مضاعف الاستدارة — medium = القيم الأصلية بدون أي تغيير
// pill: البطاقات والحقول كتبقى بحجم large، والأزرار وحدها كتولي كبسولة (فـ btnStyle)
export const RADIUS_SCALE = { square: 0, small: 0.35, medium: 1, large: 1.7, pill: 1.7 };

export const getRadiusScale = (styles) => RADIUS_SCALE[styles?.borderRadius] ?? 1;

// ✦ Layout & motion — ThemeEdit → Styles → Layout & motion
//    styles.layoutWidth   : narrow | standard | wide          (standard/بلا قيمة = عرض كل صفحة الأصلي)
//    styles.layoutDensity : compact | comfortable | spacious  (comfortable/بلا قيمة = المسافات الأصلية)
//    styles.motion        : none | subtle | lively            (subtle/بلا قيمة = الحركة الأصلية)
//    العرض والكثافة كيوصلو عبر CSS vars (--container-max / --density) والحركة عبر data-motion
export const LAYOUT_WIDTH   = { narrow: 860, wide: 1200 };
export const LAYOUT_DENSITY = { compact: 0.7, spacious: 1.4 };

// متغيّر CSS يتحط مرة وحدة على الـ wrapper، وكل العناصر الداخلية ترثه
export const themeVars = (styles) => ({
  "--r-scale": getRadiusScale(styles),
  ...(LAYOUT_WIDTH[styles?.layoutWidth]     ? { "--container-max": `${LAYOUT_WIDTH[styles.layoutWidth]}px` } : {}),
  ...(LAYOUT_DENSITY[styles?.layoutDensity] ? { "--density": LAYOUT_DENSITY[styles.layoutDensity] } : {}),
  ...(styles?.surfaceColor ? { "--fld-surface": styles.surfaceColor } : {}),
  ...(styles?.borderColor  ? { "--fld-border":  styles.borderColor  } : {}),
});

// يحوّل رقم px إلى قيمة تتأثر بالمضاعف (بدون JS إضافي في كل عنصر)
export const rs = (n) => `calc(${n}px * var(--r-scale, 1))`;

// استدارة الأزرار: قيم px ثابتة لكل مستوى، باش يبان الفرق فعلا بين Medium / Large / Pill
// (قبل: كل زر عندو rs(n) خاص بيه — الـ hero مثلا rs(50) = كبسولة فـ كل المستويات!)
// كتتطبق فقط إيلا styles.borderRadius محدد (باش أزرار فيها styles ناقصة تبقى على الأصل)
const BTN_RADIUS = { square: 0, small: 4, medium: 8, large: 14, pill: 999 };

// أحجام الأزرار (M = بلا override → القيم الأصلية لكل زر)
const BTN_SIZE   = { S: { pad: 9,  fs: 12.5 }, L: { pad: 16, fs: 15.5 } };
const ORDER_SIZE = { L: { pad: 17, fs: 16 },   XL: { pad: 20, fs: 17.5 } };

// نمط الزر الثانوي: المحدد من المستخدم، وإلا مشتق من نمط الزر الرئيسي (السلوك القديم)
export function getSecondaryKind(styles) {
  if (styles?.secondaryButtonStyle) return styles.secondaryButtonStyle;
  const k = styles?.buttonStyle || "filled";
  return k === "filled" ? "outline" : k === "outline" ? "ghost" : "outline";
}

/**
 * ستايل الزر حسب إعدادات Buttons & corners
 * @param {object}  styles  - themeConfig.styles
 * @param {string}  color   - لون الزر (primary)
 * @param {object}  [opts]
 * @param {boolean} [opts.onImage]    - الزر فوق صورة/خلفية داكنة (يتأثر بـ buttonOnInverted)
 * @param {boolean} [opts.secondary]  - زر ثانوي
 * @param {string}  [opts.role]       - "order" لأزرار الطلب (حجم/وزن خاص)
 * @param {number}  [opts.padX=0]     - الحشو الأفقي بالـ px (للأزرار اللي ماشي عرضها 100%)
 * @param {string}  [opts.fg]         - لون النص فـ filled
 *
 * ✦ كيتحط ديما فـ آخر style الزر باش يغلب أي قيمة قبله
 * ✦ ما كيرجّع padding/fontSize/fontWeight إلا إيلا المستخدم بدّل الافتراضي (باش ما يتبدل شي متجر قديم)
 * ✦ الإطار كيتعمل بـ inset boxShadow (ماشي border) باش حجم الزر ما يتبدلش
 */
export function btnStyle(styles, color, opts = {}) {
  const { onImage = false, secondary = false, role = "primary", padX = 0, fg = "#fff" } = opts;
  const kind = secondary ? getSecondaryKind(styles) : (styles?.buttonStyle || "filled");

  let out;
  if (kind === "outline") {
    out = {
      background: onImage ? "#ffffff" : "transparent",
      color,
      border: "none",
      boxShadow: `inset 0 0 0 1.5px ${color}`,
    };
  } else if (kind === "ghost") {
    out = {
      background: onImage ? "rgba(255,255,255,.92)" : `color-mix(in srgb, ${color} 12%, transparent)`,
      color,
      border: "none",
      boxShadow: "none",
    };
  } else if (onImage && styles?.buttonOnInverted === "contrast") {
    // filled فوق صورة/خلفية داكنة — تباين عالٍ (أبيض + نص داكن)
    out = { background: "#ffffff", color: "#111827", border: "none" };
  } else {
    // filled (الافتراضي — نفس الشكل القديم)
    out = { background: color, color: fg, border: "none" };
  }

  // الحجم
  const sz = role === "order" ? ORDER_SIZE[styles?.orderButtonSize] : BTN_SIZE[styles?.buttonSize];
  if (sz) {
    out.padding = `${sz.pad}px ${padX}px`;
    out.fontSize = sz.fs;
  }
  // وزن زر الطلب
  if (role === "order" && styles?.orderButtonWeight) out.fontWeight = Number(styles.orderButtonWeight);
  // استدارة الأزرار (للأزرار فقط — البطاقات والحقول كتبقى على rs())
  const br = BTN_RADIUS[styles?.borderRadius];
  if (br !== undefined) out.borderRadius = br;

  return out;
}

// ============================================================
// ✦ Components (Cards / Badges / Fields) — ThemeEdit → Styles → Components
//    styles.cardVariant : flat | bordered | elevated      (بلا قيمة = السلوك القديم)
//    styles.cardHover   : none | lift | zoom              (بلا قيمة = zoom)
//    styles.badgeStyle  : filled | soft | outline         (بلا قيمة = filled)
//    styles.badgeShape  : corners | pill                  (بلا قيمة = pill)
//    styles.fieldStyle  : outline | filled | underline    (بلا قيمة = السلوك القديم)
//    styles.fieldSize   : compact | comfortable           (بلا قيمة = السلوك القديم)
// ============================================================

// ستايل البطاقة — null إذا ما تحددش cardVariant (باش المتاجر القديمة ما تتبدلش)
export function cardLook(styles, { border = "#ebebeb", bg = "#ffffff" } = {}) {
  const v = styles?.cardVariant;
  if (!v) return null;
  if (v === "bordered") return { border: `1px solid ${border}`, padding: 8, background: bg, boxShadow: "none" };
  if (v === "elevated") return { border: "none", padding: 8, background: bg, boxShadow: "0 6px 20px rgba(15,23,42,.10), 0 1px 3px rgba(15,23,42,.06)" };
  return { border: "none", padding: 0, background: "transparent", boxShadow: "none" };
}

export const cardHoverMode = (styles) => styles?.cardHover || "zoom";

// ستايل البادج فوق الصور (soft/outline كيستعملو خلفية صلبة باش يبقى مقروء فوق أي صورة)
export function badgeLook(styles, color = "#ef4444") {
  const kind  = styles?.badgeStyle || "filled";
  const pill  = (styles?.badgeShape || "pill") === "pill";
  const borderRadius = pill ? 999 : Math.round(6 * getRadiusScale(styles));
  if (kind === "soft")    return { background: `color-mix(in srgb, ${color} 14%, #ffffff)`, color, boxShadow: "none", borderRadius };
  if (kind === "outline") return { background: "#ffffff", color, boxShadow: `inset 0 0 0 1.5px ${color}`, borderRadius };
  return { background: color, color: "#ffffff", boxShadow: "none", borderRadius };
}

// ستايل الحقول (يستعمل فـ معاينة ThemeEdit) — نفس منطق CSS ديال COMPONENTS_CSS
export function fieldLook(styles, { border = "#ebebeb", surface = "#fafafa", text = "#111827" } = {}) {
  const kind  = styles?.fieldStyle || "outline";
  const comfy = (styles?.fieldSize || "comfortable") === "comfortable";
  const r     = Math.round((comfy ? 12 : 10) * getRadiusScale(styles));
  const base  = {
    boxSizing: "border-box", width: "100%", fontFamily: "inherit", color: text,
    fontSize: comfy ? 14 : 13, padding: comfy ? "13px 14px" : "8px 12px",
    borderStyle: "solid", borderWidth: 1.5,
  };
  if (kind === "filled")    return { ...base, background: surface, borderColor: "transparent", borderRadius: r };
  if (kind === "underline") return { ...base, background: "transparent", borderWidth: "0 0 1.5px 0", borderColor: border, borderRadius: 0 };
  return { ...base, background: "transparent", borderColor: border, borderRadius: r };
}

// data-attributes على الـ wrapper ديال الصفحة — كيفعّلو قواعد COMPONENTS_CSS على حقول pd-input
export const themeAttrs = (styles) => ({
  "data-fld": styles?.fieldStyle || undefined,
  "data-fsz": styles?.fieldSize  || undefined,
  "data-motion": styles?.motion && styles.motion !== "subtle" ? styles.motion : undefined,
});

// CSS مشترك — يتحط مرة وحدة داخل wrapper كل صفحة
export const COMPONENTS_CSS = `
[data-card-hover] { transition: translate .25s ease, box-shadow .25s ease; }
[data-card-hover="lift"]:hover { translate: 0 -4px; }
[data-card-hover="lift"]:hover img,
[data-card-hover="none"]:hover img { transform: none !important; }
.cmp-img { transition: transform .25s ease; }
[data-card-hover="zoom"]:hover .cmp-img { transform: scale(1.06); }

[data-fsz="comfortable"] .pd-input { padding: 14px 16px; font-size: 15px; }
[data-fsz="compact"] .pd-input { padding: 8px 12px; font-size: 13px; border-radius: calc(10px * var(--r-scale, 1)); }
[data-fsz] .pd-input--icon { padding-right: 38px; }
[data-fld="outline"] .pd-input { background: transparent; border: 1.5px solid var(--fld-border, var(--pd-border, #e5e7eb)); }
[data-fld="outline"] .pd-input:focus { background: transparent; border-color: var(--pd-primary); }
[data-fld="filled"] .pd-input { background: var(--fld-surface, #f1f2f4); border: 1.5px solid transparent; }
[data-fld="filled"] .pd-input:focus { background: var(--fld-surface, #f1f2f4); border-color: var(--pd-primary); }
[data-fld="underline"] .pd-input { background: transparent; border: none; border-bottom: 1.5px solid var(--fld-border, var(--pd-border, #e5e7eb)); border-radius: 0; }
[data-fld="underline"] .pd-input:focus { background: transparent; border-bottom-color: var(--pd-primary); }

@keyframes ps-fade-up-lively { from { opacity:0; transform:translateY(44px) scale(.95); } to { opacity:1; transform:none; } }
[data-motion="none"] *:not(.ps-spinner),
[data-motion="none"] *:not(.ps-spinner)::before,
[data-motion="none"] *:not(.ps-spinner)::after { animation: none !important; transition: none !important; }
[data-motion="lively"] .ps-fade-up { animation-name: ps-fade-up-lively; animation-duration: .85s; animation-timing-function: cubic-bezier(.2,.8,.2,1); }
[data-motion="lively"] .ps-delay-1 { animation-delay: .12s; }
[data-motion="lively"] .ps-delay-2 { animation-delay: .24s; }
[data-motion="lively"] .ps-delay-3 { animation-delay: .36s; }
[data-motion="lively"] .ps-delay-4 { animation-delay: .48s; }
[data-motion="lively"] [data-card-hover] { transition-duration: .4s; }
[data-motion="lively"] [data-card-hover="lift"]:hover { translate: 0 -8px; }
[data-motion="lively"] [data-card-hover="zoom"]:hover .cmp-img { transform: scale(1.12); }
`;