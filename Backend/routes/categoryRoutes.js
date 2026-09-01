const express  = require("express");
const router   = express.Router();
const Category = require("../models/Category");
const Store    = require("../models/Store");
const Product  = require("../models/Product");
const auth     = require("../middleware/auth");

// ── 1. إنشاء قسم جديد (Protected) ──────────────────────────
router.post("/create", auth, async (req, res) => {
  try {
    const { name, image } = req.body;
    if (!name || name.trim() === "")
      return res.status(400).json({ message: "Category name is required! ❌" });

    const store = await Store.findOne({ owner: req.user.id });
    if (!store) return res.status(404).json({ message: "Store not found! ❌" });

    const exists = await Category.findOne({ name: name.trim(), storeId: store._id });
    if (exists) return res.status(400).json({ message: "This category already exists! ⚠️" });

    const newCategory = new Category({ name: name.trim(), storeId: store._id, image: image || "" });
    await newCategory.save();
    res.status(201).json({ message: "Category created! ✅", category: newCategory });
  } catch (err) {
    res.status(500).json({ message: "Server Error ❌" });
  }
});

// ── 2. جلب تصنيفات المستخدم (Protected) ─────────────────────
router.get("/my-categories", auth, async (req, res) => {
  try {
    const store = await Store.findOne({ owner: req.user.id });
    if (!store) return res.status(404).json({ message: "Store not found! ❌" });
    const categories = await Category.find({ storeId: store._id }).sort({ createdAt: -1 });
    res.json(categories);
  } catch (err) {
    res.status(500).json({ message: "Server Error ❌" });
  }
});

// ── 3. تحديث تصنيف (Protected) ──────────────────────────────
router.put("/update/:id", auth, async (req, res) => {
  try {
    const { name, image } = req.body;
    const store = await Store.findOne({ owner: req.user.id });
    if (!store) return res.status(404).json({ message: "Store not found! ❌" });

    const cat = await Category.findById(req.params.id);
    if (!cat) return res.status(404).json({ message: "Category not found! ❌" });
    if (cat.storeId.toString() !== store._id.toString())
      return res.status(403).json({ message: "Unauthorized ⛔" });

    if (name) cat.name = name.trim();
    if (image !== undefined) cat.image = image;
    await cat.save();
    res.json({ message: "Updated ✅", category: cat });
  } catch (err) {
    res.status(500).json({ message: "Server Error ❌" });
  }
});

// ── 4. حذف تصنيف (Protected) ────────────────────────────────
router.delete("/delete/:id", auth, async (req, res) => {
  try {
    const store = await Store.findOne({ owner: req.user.id });
    if (!store) return res.status(404).json({ message: "Store not found! ❌" });

    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ message: "Category not found! ❌" });
    if (category.storeId.toString() !== store._id.toString())
      return res.status(401).json({ message: "Unauthorized ⛔" });

    // ✦ نحيدو الربط من المنتجات اللي كانت مربوطة بهاد التصنيف قبل ما نحذفوه —
    // بلا هادشي، يبقاو شايرين على id محذوف (orphaned reference) وممكن يكسرو
    // الفرونت كي يديرو populate("categoryId")
    await Product.updateMany({ categoryId: category._id }, { categoryId: null });

    await Category.findByIdAndDelete(req.params.id);
    res.json({ message: "Category deleted! ✅" });
  } catch (err) {
    res.status(500).json({ message: "Server Error ❌" });
  }
});

// ── 5. جلب تصنيفات متجر عام بالـ storeId (Public) ───────────
router.get("/public/:storeId", async (req, res) => {
  try {
    const categories = await Category.find({ storeId: req.params.storeId }).sort({ createdAt: -1 });
    res.json(categories);
  } catch (err) {
    res.status(500).json({ message: "Server Error ❌" });
  }
});

module.exports = router;