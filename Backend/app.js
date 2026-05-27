require('dotenv').config();
const express = require("express");
const cors    = require("cors");
const rateLimit = require("express-rate-limit"); // ✦ إضافة جديدة

const connectDB       = require("./config/db");
const userRoutes      = require("./routes/userRoutes");
const storeRoutes     = require("./routes/storeRoutes");
const productRoutes   = require("./routes/productRoutes");
const orderRoutes     = require("./routes/orderRoutes");
const categoryRoutes  = require("./routes/categoryRoutes");

const app = express();
connectDB();

app.use(express.json());
app.use(cors());

// ==============================
// ✦ RATE LIMITING
// ==============================

// ✦ حماية عامة — كل الـ API
// max 100 طلب كل 15 دقيقة من نفس IP
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 دقيقة
  max: 100,
  message: {
    message: "طلبات كثيرة جداً، حاول مجدداً بعد 15 دقيقة ❌"
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// ✦ حماية خاصة على إنشاء الطلبات — أشد تقييداً
// max 10 طلبات كل 15 دقيقة — يمنع الإساءة من الزبائن
const orderLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 دقيقة
  max: 10,
  message: {
    message: "لقد أرسلت طلبات كثيرة، انتظر قليلاً وحاول مجدداً ❌"
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// ✦ حماية خاصة على تسجيل الدخول — تمنع brute force
// max 5 محاولات كل 15 دقيقة
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 دقيقة
  max: 5,
  message: {
    message: "محاولات كثيرة، حاول مجدداً بعد 15 دقيقة ❌"
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// ✦ تطبيق الحماية العامة على كل الـ API
app.use("/api/", generalLimiter);

// ✦ تطبيق حماية خاصة على مسارات حساسة
app.use("/api/orders/create",   orderLimiter); // ✦ إنشاء طلب
app.use("/api/users/login",     authLimiter);  // ✦ تسجيل الدخول
app.use("/api/users/register",  authLimiter);  // ✦ إنشاء حساب

// ==============================
// ROUTES
// ==============================
app.use("/api/users",      userRoutes);
app.use("/api/stores",     storeRoutes);
app.use("/api/products",   productRoutes);
app.use("/api/orders",     orderRoutes);
app.use("/api/categories", categoryRoutes);

// Test route
app.get("/", (req, res) => {
  res.send("SaaS Edge Backend is Live 🚀");
});

// 404
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});