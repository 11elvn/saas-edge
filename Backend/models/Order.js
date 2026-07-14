const mongoose = require("mongoose");

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
    required: true // السعر الإجمالي = سعر المنتج + سعر التوصيل
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true
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