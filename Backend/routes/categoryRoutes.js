const express = require("express");
const router = express.Router();
const Category = require("../models/Category");
const Store = require("../models/Store");
const auth = require("../middleware/auth"); // ميدلوير حماية التوكن نتاعك

// ==========================================
// 1️⃣ إنشاء قسم جديد لمتجر المستخدم الحالي (POST)
// ==========================================
router.post("/create", auth, async (req, res) => {
  try {
    const { name } = req.body;

    // 1. التحقق من أن الاسم ليس فارغاً
    if (!name || name.trim() === "") {
      return res.status(400).json({ message: "Category name is required! ❌" });
    }

    // 2. البحث عن المتجر التابع لهذا المستخدم الذي قام بتسجيل الدخول
    const store = await Store.findOne({ userId: req.user.id });
    if (!store) {
      return res.status(404).json({ message: "Store not found for this user! ❌" });
    }

    // 3. منع تكرار نفس اسم القسم في نفس المتجر (حماية الداتابيز من العشوائية)
    const categoryExists = await Category.findOne({ name: name.trim(), storeId: store._id });
    if (categoryExists) {
      return res.status(400).json({ message: "This category already exists in your store! ⚠️" });
    }

    // 4. حفظ القسم الجديد وربطه بـ ObjectId نتاع المتجر
    const newCategory = new Category({
      name: name.trim(),
      storeId: store._id
    });

    await newCategory.save();
    
    res.status(201).json({ 
      message: "Category created successfully! ✅", 
      category: newCategory 
    });

  } catch (err) {
    console.error("Error in creating category:", err.message);
    res.status(500).json({ message: "Server Error during category creation ❌" });
  }
});

// ==========================================
// 2️⃣ جلب جميع أقسام متجر المستخدم الحالي (GET)
// ==========================================
router.get("/my-categories", auth, async (req, res) => {
  try {
    // 1. جلب متجر المستخدم أولاً لمعرفة الـ ID
    const store = await Store.findOne({ userId: req.user.id });
    if (!store) {
      return res.status(404).json({ message: "Store not found! ❌" });
    }

    // 2. جلب الأقسام التابعة للمتجر وترتيبها من الأحدث للأقدم
    const categories = await Category.find({ storeId: store._id }).sort({ createdAt: -1 });
    res.json(categories);

  } catch (err) {
    console.error("Error in fetching categories:", err.message);
    res.status(500).json({ message: "Server Error while fetching categories ❌" });
  }
});

// ==========================================
// 3️⃣ مسح قسم معين مع حماية صارومة (DELETE)
// ==========================================
router.delete("/delete/:id", auth, async (req, res) => {
  try {
    // 1. جلب متجر المستخدم للتأكد من الصلاحيات
    const store = await Store.findOne({ userId: req.user.id });
    if (!store) {
      return res.status(404).json({ message: "Store not found! ❌" });
    }

    // 2. البحث عن القسم المراد حذفه
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: "Category not found! ❌" });
    }

    // 🔥 خطوة الأمان الكبرى: التأكد من أن القسم يخص متجر هذا التاجر فعلاً وليس متجر شخص آخر!
    if (category.storeId.toString() !== store._id.toString()) {
      return res.status(401).json({ message: "Unauthorized! You don't own this category ⛔" });
    }

    // 3. تنفيذ الحذف
    await Category.findByIdAndDelete(req.params.id);
    res.json({ message: "Category deleted successfully! ✅" });

  } catch (err) {
    console.error("Error in deleting category:", err.message);
    res.status(500).json({ message: "Server Error while deleting category ❌" });
  }
});

module.exports = router;