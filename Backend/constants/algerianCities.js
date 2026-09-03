// ============================================================
// 📁 Backend/constants/algerianCities.js
// ✦ نسخة الباك-أند من جدول أسعار التوصيل (نفس القيم بالضبط ديال
// frontend/src/constants/algerianCities.js) — كنستعملوها باش
// نحسبو shippingPrice سيرفر-سايد وما نثقوش فالرقم الجاي من الفرونت
// (كان قبل أي حد يقدر يبعت shippingPrice: 0 أو حتى رقم سالب مباشرة
// للـ API ويلاعب فـ totalPrice)
// ✦ إذا بدلتي الأسعار فـ frontend، بدلهم هنا زادة باش يبقاو متطابقين
// ============================================================

const ALGERIAN_CITIES = [
  { id: "01", name: "أدرار",              price: 900 },
  { id: "02", name: "الشلف",              price: 600 },
  { id: "03", name: "الأغواط",            price: 700 },
  { id: "04", name: "أم البواقي",         price: 600 },
  { id: "05", name: "باتنة",              price: 550 },
  { id: "06", name: "بجاية",              price: 500 },
  { id: "07", name: "بسكرة",              price: 650 },
  { id: "08", name: "بشار",               price: 900 },
  { id: "09", name: "البليدة",            price: 400 },
  { id: "10", name: "البويرة",            price: 450 },
  { id: "11", name: "تمنراست",            price: 1100 },
  { id: "12", name: "تبسة",               price: 650 },
  { id: "13", name: "تلمسان",             price: 600 },
  { id: "14", name: "تيارت",              price: 600 },
  { id: "15", name: "تيزي وزو",           price: 450 },
  { id: "16", name: "الجزائر العاصمة",    price: 400 },
  { id: "17", name: "الجلفة",             price: 550 },
  { id: "18", name: "جيجل",               price: 550 },
  { id: "19", name: "سطيف",               price: 500 },
  { id: "20", name: "سعيدة",              price: 650 },
  { id: "21", name: "سكيكدة",             price: 550 },
  { id: "22", name: "سيدي بلعباس",        price: 600 },
  { id: "23", name: "عنابة",              price: 550 },
  { id: "24", name: "قالمة",              price: 600 },
  { id: "25", name: "قسنطينة",            price: 500 },
  { id: "26", name: "المدية",             price: 450 },
  { id: "27", name: "مستغانم",            price: 550 },
  { id: "28", name: "مسيلة",              price: 600 },
  { id: "29", name: "معسكر",              price: 600 },
  { id: "30", name: "ورقلة",              price: 750 },
  { id: "31", name: "وهران",              price: 500 },
  { id: "32", name: "البيض",              price: 750 },
  { id: "33", name: "إليزي",              price: 1100 },
  { id: "34", name: "برج بوعريريج",       price: 550 },
  { id: "35", name: "بومرداس",            price: 400 },
  { id: "36", name: "الطارف",             price: 600 },
  { id: "37", name: "تندوف",              price: 1100 },
  { id: "38", name: "تيسمسيلت",           price: 600 },
  { id: "39", name: "الوادي",             price: 700 },
  { id: "40", name: "خنشلة",              price: 650 },
  { id: "41", name: "سوق أهراس",          price: 600 },
  { id: "42", name: "تيبازة",             price: 400 },
  { id: "43", name: "ميلة",               price: 550 },
  { id: "44", name: "عين الدفلى",         price: 500 },
  { id: "45", name: "النعامة",            price: 800 },
  { id: "46", name: "عين تموشنت",         price: 550 },
  { id: "47", name: "غرداية",             price: 750 },
  { id: "48", name: "غليزان",             price: 600 },
  { id: "49", name: "تيميمون",            price: 950 },
  { id: "50", name: "برج باجي مختار",     price: 1100 },
  { id: "51", name: "أولاد جلال",         price: 700 },
  { id: "52", name: "بني عباس",           price: 950 },
  { id: "53", name: "عين صالح",           price: 1000 },
  { id: "54", name: "عين قزام",           price: 1100 },
  { id: "55", name: "تقرت",               price: 750 },
  { id: "56", name: "جانت",               price: 1100 },
  { id: "57", name: "المغير",             price: 750 },
  { id: "58", name: "المنيعة",            price: 900 },
];

// ✦ ترجع سعر التوصيل الحقيقي لولاية معينة، أو null إذا الاسم ماكاينش
// فالجدول (باش نميزو بين "ولاية غير معروفة" و "ولاية سعرها 0")
const getShippingPrice = (cityName) => {
  const city = ALGERIAN_CITIES.find((c) => c.name === cityName);
  return city ? city.price : null;
};

module.exports = { ALGERIAN_CITIES, getShippingPrice };