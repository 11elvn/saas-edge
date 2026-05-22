const mongoose = require("mongoose");

const storeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  // قمنا بتحويل الـ owner لـ ObjectId مرتبط بموديل المستخدم (User) لضمان الأمان
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  // 🆕 الرابط المخصص للمتجر (مثال: saas-edge.com/store/turki-shop)
  slug: {
    type: String,
    required: true,
    unique: true, // يمنع تكرار نفس الرابط بين التجار نهائياً
    trim: true,
    lowercase: true // يحول الرابط دائماً لحروف صغيرة لتفادي أخطاء الـ URLs
  },
  // 🆕 لوغو المتجر
  logo: {
    type: String,
    default: "" // يبقى فارغ حتى يرفعه التاجر
  },
  // 🆕 غلاف المتجر (Banner)
  banner: {
    type: String,
    default: ""
  },
  // 🔄 تم تعويض رقم الواتساب برقم هاتف عادي للمحل بناءً على نظام الطلبيات الداخلي الجديد
  phone: {
    type: String,
    default: ""
  },
  // 🆕 الثيم المختار لشكل المتجر نتاع الزبون
  theme: {
    type: String,
    enum: ["light", "dark", "blue"], // الثيمات المحددة في المخطط نتاعك
    default: "light" // الثيم الافتراضي
  }
}, { timestamps: true }); // أضفنا التوقيت لتسجيل وقت إنشاء المتجر وتحديثه تلقائياً

// ⚙️ دالة ذكية تشتغل تلقائياً لتوليد الـ Slug من اسم المتجر قبل الفحص والحفظ
storeSchema.pre('validate', function(next) {
  if (this.name && !this.slug) {
    this.slug = this.name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '') // تنظيف الرموز الغريبة
      .replace(/[\s_-]+/g, '-') // تعويض الفراغات بمطة -
      .replace(/^-+|-+$/g, ''); // تنظيف المطات الزايدة في البداية والنهاية
  }
  next();
});

module.exports = mongoose.model("Store", storeSchema);