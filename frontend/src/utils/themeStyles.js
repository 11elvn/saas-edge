// ============================================================
// 📁 utils/themeStyles.js
// ✦ مصدر واحد لإعدادي ThemeEdit → Styles:
//    1) Border radius  (small | medium | large)
//    2) Button style   (filled | outline | ghost)
// ✦ الاستعمال:
//    - على الـ wrapper الرئيسي لكل صفحة:  style={{ ...themeVars(styles) }}
//    - بدل borderRadius: 12   →   borderRadius: rs(12)
//    - على الأزرار الرئيسية:  style={{ ...حقول الزر, ...btnStyle(styles, primary) }}
// ============================================================

// مضاعف الاستدارة — medium = القيم الأصلية بدون أي تغيير
export const RADIUS_SCALE = { small: 0.35, medium: 1, large: 1.7 };

export const getRadiusScale = (styles) => RADIUS_SCALE[styles?.borderRadius] ?? 1;

// متغيّر CSS يتحط مرة وحدة على الـ wrapper، وكل العناصر الداخلية ترثه
export const themeVars = (styles) => ({ "--r-scale": getRadiusScale(styles) });

// يحوّل رقم px إلى قيمة تتأثر بالمضاعف (بدون JS إضافي في كل عنصر)
export const rs = (n) => `calc(${n}px * var(--r-scale, 1))`;

/**
 * ستايل الزر حسب Button style
 * @param {object}  styles  - themeConfig.styles
 * @param {string}  color   - لون الزر (primary)
 * @param {object}  [opts]
 * @param {boolean} [opts.onImage]    - الزر فوق صورة (يحتاج خلفية بيضاء باش يبقى مقروء)
 * @param {boolean} [opts.secondary]  - زر ثانوي (يخالف الرئيسي باش يبقى التمييز بينهما)
 * @param {string}  [opts.fg]         - لون النص فـ filled
 *
 * ✦ كيتحط ديما فـ آخر style الزر باش يغلب أي background/color/boxShadow قبله
 * ✦ الإطار كيتعمل بـ inset boxShadow (ماشي border) باش حجم الزر ما يتبدلش
 */
export function btnStyle(styles, color, opts = {}) {
  const { onImage = false, secondary = false, fg = "#fff" } = opts;
  let kind = styles?.buttonStyle || "filled";
  if (secondary) kind = kind === "filled" ? "outline" : kind === "outline" ? "ghost" : "outline";

  if (kind === "outline") {
    return {
      background: onImage ? "#ffffff" : "transparent",
      color,
      border: "none",
      boxShadow: `inset 0 0 0 1.5px ${color}`,
    };
  }
  if (kind === "ghost") {
    return {
      background: onImage ? "rgba(255,255,255,.92)" : `color-mix(in srgb, ${color} 12%, transparent)`,
      color,
      border: "none",
      boxShadow: "none",
    };
  }
  // filled (الافتراضي — نفس الشكل القديم)
  return { background: color, color: fg, border: "none" };
}