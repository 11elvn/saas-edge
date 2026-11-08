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
export const RADIUS_SCALE = { square: 0, small: 0.35, medium: 1, large: 1.45, pill: 1.45 };

export const getRadiusScale = (styles) => RADIUS_SCALE[styles?.borderRadius] ?? 1;

// متغيّر CSS يتحط مرة وحدة على الـ wrapper، وكل العناصر الداخلية ترثه
export const themeVars = (styles) => ({ "--r-scale": getRadiusScale(styles) });

// يحوّل رقم px إلى قيمة تتأثر بالمضاعف (بدون JS إضافي في كل عنصر)
export const rs = (n) => `calc(${n}px * var(--r-scale, 1))`;

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
  // كبسولة (للأزرار فقط)
  if (styles?.borderRadius === "pill") out.borderRadius = 999;

  return out;
}