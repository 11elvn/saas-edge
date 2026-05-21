const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
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
  storeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Store",
    required: true
  },
  // 🔄 حقل الصورة القديم (حافظنا عليه باش ما تتكسرش المنتجات القديمة)
  image: {
    type: String,
    default: "https://images.unsplash.com/photo-1531403009284-440f080d1e12?q=80&w=400"
  },
  // 🆕 حقل الصور المتعددة الجديد لـ Phase 02
  images: {
    type: [String],
    default: [] // يبدأ كمصفوفة فارغة، والـ Front-end راح يقرا من هنا أولاً
  },
  // 🆕 حقل القسم (Category) لتنظيم المنتجات
  category: {
    type: String,
    default: "عام" // القسم الافتراضي باللغة العربية للـ DZ Market
  },
  // 🆕 حقل المخزون (Inventory System)
  stock: {
    type: Number,
    default: 10 // الكمية الافتراضية لأي منتج جديد
  }
}, { timestamps: true });

module.exports = mongoose.model("Product", productSchema);