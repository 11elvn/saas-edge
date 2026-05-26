const express = require("express");
const router = express.Router();
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const auth = require("../middleware/auth");

// ==============================
// REGISTER
// ==============================
router.post("/register", async (req, res) => {
  try {
    const { email, password } = req.body;

    // ✦ التحقق من وجود الحقول
    if (!email || !password) {
      return res.status(400).json({ message: "الإيميل والباسورد مطلوبان ❌" });
    }

    // ✦ التحقق من صحة الإيميل بـ regex بسيط
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "صيغة الإيميل غير صحيحة ❌" });
    }

    // ✦ التحقق من طول الباسورد قبل ما نوصل للـ model
    if (password.length < 6) {
      return res.status(400).json({ message: "الباسورد لازم يكون 6 أحرف على الأقل ❌" });
    }

    // ✦ التحقق من تكرار الإيميل — نحول للـ lowercase باش يتطابق مع الـ model
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: "هذا الإيميل مسجل مسبقاً ❌" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ email, password: hashedPassword });
    await user.save();

    res.status(201).json({ message: "تم إنشاء الحساب بنجاح ✅" });

  } catch (error) {
    // ✦ معالجة خاصة لخطأ MongoDB عند تكرار الإيميل (code 11000)
    // هذا يحصل لو تجاوز شخصان الـ findOne في نفس اللحظة (race condition)
    if (error.code === 11000) {
      return res.status(400).json({ message: "هذا الإيميل مسجل مسبقاً ❌" });
    }
    console.error("Register error:", error);
    res.status(500).json({ message: "خطأ في السيرفر ❌" });
  }
});

// ==============================
// LOGIN
// ==============================
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // ✦ التحقق من وجود الحقول
    if (!email || !password) {
      return res.status(400).json({ message: "الإيميل والباسورد مطلوبان ❌" });
    }

    // ✦ البحث بـ lowercase باش يتطابق مع ما خزّنه الـ model
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      // ✦ رسالة عامة — لا نقول "إيميل غلط" أو "باسورد غلط" لأسباب أمنية
      return res.status(400).json({ message: "الإيميل أو الباسورد غير صحيح ❌" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      // ✦ نفس رسالة الإيميل الغلط — لا نفصح عن السبب الحقيقي
      return res.status(400).json({ message: "الإيميل أو الباسورد غير صحيح ❌" });
    }

    // ✦ التوكن صالح ليوم واحد — كافي للمرحلة الحالية
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.status(200).json({
      message: "تم تسجيل الدخول بنجاح ✅",
      token,
    });

  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "خطأ في السيرفر ❌" });
  }
});

// ==============================
// PROFILE
// ==============================
router.get("/profile", auth, async (req, res) => {
  try {
    // ✦ select("-password") يمنع إرجاع الباسورد المشفر للفرونت
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "المستخدم غير موجود ❌" });
    }

    res.status(200).json(user);

  } catch (error) {
    console.error("Profile error:", error);
    res.status(500).json({ message: "خطأ في السيرفر ❌" });
  }
});

module.exports = router;