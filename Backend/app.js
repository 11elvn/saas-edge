require('dotenv').config();
const express  = require("express");
const cors     = require("cors");
const rateLimit = require("express-rate-limit");

const connectDB      = require("./config/db");
const userRoutes     = require("./routes/userRoutes");
const storeRoutes    = require("./routes/storeRoutes");
const productRoutes  = require("./routes/productRoutes");
const orderRoutes    = require("./routes/orderRoutes");
const categoryRoutes = require("./routes/categoryRoutes");

const app = express();
connectDB();
app.use(express.json());
app.use(cors());

// ==============================
// ✦ RATE LIMITING
// ==============================

// ✦ حماية عامة — رفعنا الحد لأن الـ polling يستهلك requests
// 500 طلب كل 15 دقيقة — كافي للداشبورد + polling
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500, // ✦ رفعناه من 100 → 500 بسبب polling كل 10 ثواني
  message: { message: "طلبات كثيرة جداً، حاول مجدداً بعد 15 دقيقة ❌" },
  standardHeaders: true,
  legacyHeaders: false,
});

// ✦ حماية إنشاء الطلبات — للزبائن فقط
const orderLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { message: "لقد أرسلت طلبات كثيرة، انتظر قليلاً وحاول مجدداً ❌" },
  standardHeaders: true,
  legacyHeaders: false,
});

// ✦ حماية Login/Register — رفعنا الحد لـ 20 للتطوير
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20, // ✦ رفعناه من 5 → 20 باش ما يتبلوكش عند التجربة
  message: { message: "محاولات كثيرة، حاول مجدداً بعد 15 دقيقة ❌" },
  standardHeaders: true,
  legacyHeaders: false,
});

// ✦ تطبيق الحماية العامة
app.use("/api/", generalLimiter);

// ✦ حماية خاصة على مسارات حساسة
app.use("/api/orders/create",  orderLimiter);
app.use("/api/users/login",    authLimiter);
app.use("/api/users/register", authLimiter);

// ==============================
// ROUTES
// ==============================
app.use("/api/users",      userRoutes);
app.use("/api/stores",     storeRoutes);
app.use("/api/products",   productRoutes);
app.use("/api/orders",     orderRoutes);
app.use("/api/categories", categoryRoutes);

app.get("/", (req, res) => res.send("SaaS Edge Backend is Live 🚀"));

app.use((req, res) => res.status(404).json({ message: "Route not found" }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));