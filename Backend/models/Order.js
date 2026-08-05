const mongoose = require("mongoose");

// ✦ عنصر واحد فالسلة/الطلب — سنابشوت (snapshot) لاسم/صورة/سعر المنتج وقت الطلب
// ✦ (باش إذا التاجر بدل السعر بعدين، الطلبات القديمة تبقى تعرض السعر اللي شرى بيه الزبون فعلاً)
const orderItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  name:      { type: String, required: true },
  image:     { type: String, default: "" },
  price:     { type: Number, required: true }, // سعر الوحدة وقت الطلب
  quantity:  { type: Number, default: 1 },
}, { _id: false });

const orderSchema = new mongoose.Schema({
  customerName: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  address: {
    type: String,
    default: "" // حقل العنوان التفصيلي (اختياري)
  },
  municipality: {
    type: String,
    default: "" // البلدية (Commune) — حقل اختياري حسب إعدادات الفورم
  },
  note: {
    type: String,
    default: "" // ملاحظة الزبون على الطلب — حقل اختياري حسب إعدادات الفورم
  },
  // ✦ عدة منتجات فنفس الطلب (سلة حقيقية) — المصدر الأساسي دابا
  items: {
    type: [orderItemSchema],
    default: [],
  },
  // ✦ الحقول القديمة (productId/quantity) — تبقاو للتوافق مع كود Dashboard/OrdersManagement
  // ✦ اللي مازال كيقرا منتج واحد فقط. كيتولدو تلقائياً من items[0] وقت الإنشاء (routes/orderRoutes.js)
  // ✦ — ما تكتبهمش يدوياً مباشرة، دابا الأصل هو items.
  quantity: {
    type: Number,
    default: 1
  },
  shippingCity: {
    type: String,
    required: true // الولاية المختارة (مثل: الجزائر، سطيف، وهران...)
  },
  shippingPrice: {
    type: Number,
    default: 0 // سعر التوصيل الخاص بتلك الولاية
  },
  totalPrice: {
    type: Number,
    required: true // السعر الإجمالي = مجموع أسعار المنتجات + سعر التوصيل
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    // ماعادش required — الطلب يقدر يحتوي عدة منتجات (items)، هذا يبقى فقط أول منتج للتوافق القديم
  },
  storeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Store",
    required: true
  },
  status: {
    type: String,
    // تم إضافة "delivered" هنا لتفادي خطأ الـ ValidationError والـ 500
    enum: ["pending", "shipped", "delivered", "cancelled"], 
    default: "pending"
  }
}, { timestamps: true }); // توليد createdAt و updatedAt تلقائياً لتسهيل الترتيب

module.exports = mongoose.model("Order", orderSchema);