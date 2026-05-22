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
  // 🔄 التحديث الذكي لليوم 03: ربط المنتج بالقسم عبر الـ ObjectId نتاعه
  categoryId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Category", 
    default: null // إذا كان null معنتها راهو في القسم الافتراضي "عام"
  },
  // 🆕 حقل المخزون (Inventory System)
  stock: {
    type: Number,
    default: 10 // الكمية الافتراضية لأي منتج جديد
  }
}, { timestamps: true });

module.exports = mongoose.model("Product", productSchema);