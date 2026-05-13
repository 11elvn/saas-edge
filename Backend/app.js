require('dotenv').config(); // السطر الأهم: يجب أن يكون أول سطر في الملف لتمكين قراءة متغيرات البيئة
const express = require("express");
const cors = require("cors");

const connectDB = require("./config/db");

const userRoutes = require("./routes/userRoutes");
const storeRoutes = require("./routes/storeRoutes");
const productRoutes = require("./routes/productRoutes");
const orderRoutes = require("./routes/orderRoutes");

const app = express();

// الاتصال بقاعدة البيانات
connectDB();

// Middlewares
app.use(express.json());
app.use(cors()); // يسمح لـ Vercel بالتواصل مع السيرفر

// Routes
app.use("/api/users", userRoutes);
app.use("/api/stores", storeRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);

// Test route
app.get("/", (req, res) => {
  res.send("Hello SaaS 🚀 - Server is Running and Database is Connected!");
});

// Server
const PORT = process.env.PORT || 3000; // Render يحدد المنفذ تلقائياً
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});