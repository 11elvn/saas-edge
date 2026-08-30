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
  // 🔄 حقل الصورة القديم (لضمان التوافق مع البيانات السابقة)
  image: {
    type: String,
    default: "https://images.unsplash.com/photo-1531403009284-440f080d1e12?q=80&w=400"
  },
  // 🆕 حقل الصور المتعددة الجديد لـ Phase 02
  images: {
    type: [String],
    default: [] 
  },
  // 🔄 التحديث الذكي: ربط المنتج بالقسم
  categoryId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Category", 
    default: null 
  },
  // 🆕 حقل المخزون (Inventory System)
  stock: {
    type: Number,
    default: 10 
  },
  // 🆕 خيارات المنتج — الألوان والمقاييس (Product Variants)
  colors: {
    type: [{
      name: { type: String, required: true, trim: true },
      hex:  { type: String, default: "#000000" },
      _id: false,
    }],
    default: []
  },
  sizes: {
    type: [String],
    default: []
  }
}, { timestamps: true });

module.exports = mongoose.model("Product", productSchema);