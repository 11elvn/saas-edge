// ============================================================
// 📁 constants/algerianCities.js
// مصدر واحد لكل الولايات — import منه في أي ملف تحتاجه
// بدل ما تكرر نفس القائمة في PublicStore + ProductDetails
// ============================================================

// ✦ 58 ولاية جزائرية كاملة مرتبة حسب الرقم الرسمي
// ✦ price = سعر التوصيل بالدينار الجزائري
// ✦ غيّر الأسعار من هنا فقط — يتطبق تلقائياً في كل الصفحات
export const ALGERIAN_CITIES = [
  { id: "01", name: "أدرار",              en: "Adrar", price: 900 },
  { id: "02", name: "الشلف",              en: "Chlef", price: 600 },
  { id: "03", name: "الأغواط",            en: "Laghouat", price: 700 },
  { id: "04", name: "أم البواقي",         en: "Oum El Bouaghi", price: 600 },
  { id: "05", name: "باتنة",              en: "Batna", price: 550 },
  { id: "06", name: "بجاية",              en: "Béjaïa", price: 500 },
  { id: "07", name: "بسكرة",              en: "Biskra", price: 650 },
  { id: "08", name: "بشار",               en: "Béchar", price: 900 },
  { id: "09", name: "البليدة",            en: "Blida", price: 400 },
  { id: "10", name: "البويرة",            en: "Bouira", price: 450 },
  { id: "11", name: "تمنراست",            en: "Tamanrasset", price: 1100 },
  { id: "12", name: "تبسة",               en: "Tébessa", price: 650 },
  { id: "13", name: "تلمسان",             en: "Tlemcen", price: 600 },
  { id: "14", name: "تيارت",              en: "Tiaret", price: 600 },
  { id: "15", name: "تيزي وزو",           en: "Tizi Ouzou", price: 450 },
  { id: "16", name: "الجزائر العاصمة",    en: "Alger", price: 400 },
  { id: "17", name: "الجلفة",             en: "Djelfa", price: 550 },
  { id: "18", name: "جيجل",               en: "Jijel", price: 550 },
  { id: "19", name: "سطيف",               en: "Sétif", price: 500 },
  { id: "20", name: "سعيدة",              en: "Saïda", price: 650 },
  { id: "21", name: "سكيكدة",             en: "Skikda", price: 550 },
  { id: "22", name: "سيدي بلعباس",        en: "Sidi Bel Abbès", price: 600 },
  { id: "23", name: "عنابة",              en: "Annaba", price: 550 },
  { id: "24", name: "قالمة",              en: "Guelma", price: 600 },
  { id: "25", name: "قسنطينة",            en: "Constantine", price: 500 },
  { id: "26", name: "المدية",             en: "Médéa", price: 450 },
  { id: "27", name: "مستغانم",            en: "Mostaganem", price: 550 },
  { id: "28", name: "مسيلة",              en: "M'sila", price: 600 },
  { id: "29", name: "معسكر",              en: "Mascara", price: 600 },
  { id: "30", name: "ورقلة",              en: "Ouargla", price: 750 },
  { id: "31", name: "وهران",              en: "Oran", price: 500 },
  { id: "32", name: "البيض",              en: "El Bayadh", price: 750 },
  { id: "33", name: "إليزي",              en: "Illizi", price: 1100 },
  { id: "34", name: "برج بوعريريج",       en: "Bordj Bou Arreridj", price: 550 },
  { id: "35", name: "بومرداس",            en: "Boumerdès", price: 400 },
  { id: "36", name: "الطارف",             en: "El Tarf", price: 600 },
  { id: "37", name: "تندوف",              en: "Tindouf", price: 1100 },
  { id: "38", name: "تيسمسيلت",           en: "Tissemsilt", price: 600 },
  { id: "39", name: "الوادي",             en: "El Oued", price: 700 },
  { id: "40", name: "خنشلة",              en: "Khenchela", price: 650 },
  { id: "41", name: "سوق أهراس",          en: "Souk Ahras", price: 600 },
  { id: "42", name: "تيبازة",             en: "Tipaza", price: 400 },
  { id: "43", name: "ميلة",               en: "Mila", price: 550 },
  { id: "44", name: "عين الدفلى",         en: "Aïn Defla", price: 500 },
  { id: "45", name: "النعامة",            en: "Naâma", price: 800 },
  { id: "46", name: "عين تموشنت",         en: "Aïn Témouchent", price: 550 },
  { id: "47", name: "غرداية",             en: "Ghardaïa", price: 750 },
  { id: "48", name: "غليزان",             en: "Relizane", price: 600 },
  { id: "49", name: "تيميمون",            en: "Timimoun", price: 950 },
  { id: "50", name: "برج باجي مختار",     en: "Bordj Badji Mokhtar", price: 1100 },
  { id: "51", name: "أولاد جلال",         en: "Ouled Djellal", price: 700 },
  { id: "52", name: "بني عباس",           en: "Béni Abbès", price: 950 },
  { id: "53", name: "عين صالح",           en: "In Salah", price: 1000 },
  { id: "54", name: "عين قزام",           en: "In Guezzam", price: 1100 },
  { id: "55", name: "تقرت",               en: "Touggourt", price: 750 },
  { id: "56", name: "جانت",               en: "Djanet", price: 1100 },
  { id: "57", name: "المغير",             en: "El M'Ghair", price: 750 },
  { id: "58", name: "المنيعة",            en: "El Meniaa", price: 900 },
];

// ✦ دالة مساعدة — ترجع سعر التوصيل لولاية معينة
// الاستخدام: getShippingPrice("وهران") → 500
export const getShippingPrice = (cityName) => {
  const city = ALGERIAN_CITIES.find((c) => c.name === cityName);
  return city ? city.price : 0;
};

// ✦ اسم الولاية للعرض في الداشبورد حسب اللغة
// القيمة المخزنة في الطلب تبقى عربية (shippingCity) — هذي الدالة للعرض فقط
// الاستخدام: getCityLabel("تمنراست", "en") → "Tamanrasset"
export const getCityLabel = (cityName, lang = "ar") => {
  if (!cityName) return "";
  if (lang === "ar") return cityName;
  const city = ALGERIAN_CITIES.find((c) => c.name === cityName);
  return city ? city.en : cityName;
};