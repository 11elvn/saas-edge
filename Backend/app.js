require('dotenv').config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

// استيراد الـ Routes
const userRoutes = require("./routes/userRoutes");
const storeRoutes = require("./routes/storeRoutes");
const productRoutes = require("./routes/productRoutes");
const orderRoutes = require("./routes/orderRoutes");
const categoryRoutes = require("./routes/categoryRoutes");

const app = express();

// الاتصال بقاعدة البيانات
connectDB();

// Middlewares
app.use(express.json());
app.use(cors());

// Routes - هذه هي الخريطة التي تجعل السيرفر يعرف المسارات
app.use("/api/users", userRoutes);
app.use("/api/stores", storeRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/categories", categoryRoutes);

// Test route
app.get("/", (req, res) => {
  res.send("SaaS Edge Backend is Live and Running! 🚀");
});

// التعامل مع الأخطاء (404)
app.use((req, res, next) => {
  res.status(404).json({ message: "Route not found" });
});

// تشغيل السيرفر
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});