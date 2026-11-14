// ============================================================
// 📁 src/context/PrefsContext.jsx — تفضيلات الداشبورد (جديد)
// اللغة (ar / fr / en) + الوضع (light / dark) — كيتخزنو في localStorage
// ✦ دابا كيخدم على الهيكل برك (TopBar + Sidebar)
// ============================================================

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

export const LANGS = [
  { code: "ar", short: "ع",  label: "العربية",  dir: "rtl" },
  { code: "fr", short: "FR", label: "Français", dir: "ltr" },
  { code: "en", short: "EN", label: "English",  dir: "ltr" },
];

// المفتاح = النص الإنجليزي المستعمل في الكود. أي مفتاح ما لقيناهش كيرجع كما هو.
const STRINGS = {
  ar: {
    "Business Analytics": "تحليلات الأعمال",
    "Dashboard (Legacy)": "لوحة التحكم (قديمة)",
    "Orders": "الطلبات",
    "Products": "المنتجات",
    "Categories": "الفئات",
    "Themes": "الثيمات",
    "Overview": "نظرة عامة",
    "Inventory": "المخزون",
    "OVERVIEW": "الرئيسية",
    "STORE": "المتجر",
    "MANAGEMENT": "الإدارة",
    "Store": "المتجر",
    "My store": "متجري",
    "View store": "عرض المتجر",
    "Log out": "تسجيل الخروج",
    "Notifications": "الإشعارات",
    "Language": "اللغة",
    "Dark mode": "الوضع الداكن",
    "Light mode": "الوضع الفاتح",
    "Account": "الحساب",
    "Today": "اليوم",
    "Yesterday": "أمس",
    "Last 7 days": "آخر 7 أيام",
    "Last 30 days": "آخر 30 يوم",
    "This month": "هذا الشهر",
    "Last month": "الشهر الماضي",
    "Period": "الفترة",
    "Hide numbers": "إخفاء الأرقام",
    "Show numbers": "إظهار الأرقام",
  },
  fr: {
    "Business Analytics": "Analyses",
    "Dashboard (Legacy)": "Tableau de bord (ancien)",
    "Orders": "Commandes",
    "Products": "Produits",
    "Categories": "Catégories",
    "Themes": "Thèmes",
    "Overview": "Aperçu",
    "Inventory": "Inventaire",
    "OVERVIEW": "GÉNÉRAL",
    "STORE": "BOUTIQUE",
    "MANAGEMENT": "GESTION",
    "Store": "Boutique",
    "My store": "Ma boutique",
    "View store": "Voir la boutique",
    "Log out": "Se déconnecter",
    "Notifications": "Notifications",
    "Language": "Langue",
    "Dark mode": "Mode sombre",
    "Light mode": "Mode clair",
    "Account": "Compte",
    "Today": "Aujourd'hui",
    "Yesterday": "Hier",
    "Last 7 days": "7 derniers jours",
    "Last 30 days": "30 derniers jours",
    "This month": "Ce mois-ci",
    "Last month": "Mois dernier",
    "Period": "Période",
    "Hide numbers": "Masquer les chiffres",
    "Show numbers": "Afficher les chiffres",
  },
  en: {},
};

const PrefsContext = createContext(null);

const readLS = (key, fallback) => {
  try { return localStorage.getItem(key) || fallback; } catch (_) { return fallback; }
};

export function PrefsProvider({ children }) {
  const [lang, setLang] = useState(() => {
    const v = readLS("dashLang", "ar");
    return LANGS.some((l) => l.code === v) ? v : "ar";
  });
  const [theme, setTheme] = useState(() =>
    readLS("dashTheme", "light") === "dark" ? "dark" : "light"
  );

  useEffect(() => {
    try { localStorage.setItem("dashLang", lang); } catch (_) {}
  }, [lang]);

  useEffect(() => {
    try { localStorage.setItem("dashTheme", theme); } catch (_) {}
  }, [theme]);

  const toggleTheme = useCallback(
    () => setTheme((t) => (t === "dark" ? "light" : "dark")),
    []
  );

  const t = useCallback((key) => STRINGS[lang]?.[key] ?? key, [lang]);

  const value = useMemo(
    () => ({
      lang,
      setLang,
      theme,
      toggleTheme,
      t,
      dir: LANGS.find((l) => l.code === lang)?.dir || "rtl",
    }),
    [lang, theme, toggleTheme, t]
  );

  return <PrefsContext.Provider value={value}>{children}</PrefsContext.Provider>;
}

export function usePrefs() {
  const ctx = useContext(PrefsContext);
  if (!ctx) throw new Error("usePrefs must be used inside <PrefsProvider>");
  return ctx;
}