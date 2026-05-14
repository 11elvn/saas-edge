const express = require("express");
const router = express.Router();
const Store = require("../models/Store");
const auth = require("../middleware/auth");

// create store
router.post("/create", auth, async (req, res) => {
  try {
    const { name } = req.body;

    // التأكد من أن المستخدم ليس لديه متجر مسبقاً (إضافي لضمان الحماية)
    const existingStore = await Store.findOne({ owner: req.user.id });
    if (existingStore) {
      return res.status(400).json({ message: "You already have a store! ⚠️" });
    }

    const store = new Store({
      name,
      owner: req.user.id,
    });

    await store.save();

    // ✅ التعديل الأهم: أرسل JSON بدل النص العادي
    res.status(201).json({ 
      success: true,
      message: "Store created successfully! 🏪",
      store 
    });

  } catch (error) {
    // ✅ التعديل الثاني: أرسل الخطأ كـ JSON أيضاً
    console.error(error);
    res.status(500).json({ message: "Server Error ❌" });
  }
});

module.exports = router;