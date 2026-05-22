const express = require("express");
const router = express.Router();

const Store = require("../models/Store");
const Product = require("../models/Product");

const auth = require("../middleware/auth");


// ==========================
// CREATE STORE
// ==========================
router.post("/create", auth, async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({
        message: "Store name required ❌",
      });
    }

    const existingStore = await Store.findOne({
      owner: req.user.id,
    });

    if (existingStore) {
      return res.status(400).json({
        message: "Store already exists ❌",
      });
    }

    const store = new Store({
      name,
      owner: req.user.id,
      // الـ slug يتولد تلقائياً هنا بفضل الـ pre-save hook الموجود في الموديل
    });

    await store.save();

    res.status(201).json({
      message: "Store created ✅",
      store,
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Server error ❌",
    });
  }
});


// ==========================
// GET MY STORE (مـحدث للأنظمة الكبيرة)
// ==========================
router.get("/my-store", auth, async (req, res) => {
  try {
    const store = await Store.findOne({
      owner: req.user.id,
    });

    // إذا لم يجد متجر، نرد بـ 200 ونخبر الفرونت-أند بوضوح
    if (!store) {
      return res.status(200).json({
        hasStore: false,
        store: null
      });
    }

    // إذا وجد المتجر، نرسله مع علم نجاح التواجد لتسهيل التحقق في الـ Dashboard
    res.status(200).json({
      hasStore: true,
      store: store
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Server error ❌",
    });
  }
});


// ==========================
// PUBLIC STORE (🆕 مُحدث بالـ Slug للروابط الذكية)
// ==========================
router.get("/public/:slug", async (req, res) => {
  try {
    // درك ولينا نبحثوا بالـ slug المخصص في الرابط في بلاصة الـ ID القديم المعقد
    const store = await Store.findOne({ slug: req.params.slug });

    if (!store) {
      return res.status(404).json({
        message: "Store not found ❌",
      });
    }

    // جلب المنتجات المربوطة بالـ ID نتاع المتجر هذا
    const products = await Product.find({
      storeId: store._id,
    });

    res.status(200).json({
      store,
      products,
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Server error ❌",
    });
  }
});

module.exports = router;