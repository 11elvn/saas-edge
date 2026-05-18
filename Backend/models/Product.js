const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  currentPrice: {
    type: Number,
    required: true
  },
  oldPrice: {
    type: Number
  },
  // قمنا بتحويلها إلى ObjectId لترتبط بـ موديل المتجر بشكل صحيح واحترافي
  storeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Store",
    required: true
  },
  // 🆕 حقل الصورة الجديد لليوم 26
  image: {
    type: String,
    // رابط صورة افتراضية جذابة لمنتج غامض حتى لا يظهر الكرت فارغاً
    default: "https://images.unsplash.com/photo-1531403009284-440f080d1e12?q=80&w=400"
  }
}, { timestamps: true }); // أضفنا التوقيت لترتيب المنتجات من الأحدث للأقدم تلقائياً

module.exports = mongoose.model("Product", productSchema);