const express = require("express");
const router = express.Router();

const Order = require("../models/Order");
const Product = require("../models/Product");
const Store = require("../models/Store");

const auth = require("../middleware/auth");

// =============================
// CREATE ORDER (Public)
// =============================
router.post("/create", async (req, res) => {
  try {
    const { 
      productId, 
      customerName, 
      phone, 
      address, 
      shippingCity, 
      shippingPrice, 
      totalPrice 
    } = req.body;

    // التحقق من الحقول الأساسية الإجبارية
    if (!productId || !customerName || !phone || !shippingCity) {
      return res.status(400).json({ message: "Missing fields ❌" });
    }

    // التأكد من وجود المنتج
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found ❌" });
    }

    // إنشاء الطلب بالحقول الجديدة للشحن والتوصيل الجزائري
    const order = new Order({
      productId,
      customerName,
      phone,
      address: address || "",
      shippingCity,
      shippingPrice: Number(shippingPrice) || 0,
      totalPrice: Number(totalPrice) || product.currentPrice,
      storeId: product.storeId,
      status: "pending",
    });

    await order.save();

    res.status(201).json({
      message: "Order created ✅",
      order,
    });
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({ message: "Server error ❌" });
  }
});

// =============================
// GET MY ORDERS (Protected)
// =============================
router.get("/my-orders", auth, async (req, res) => {
  try {
    const store = await Store.findOne({ owner: req.user.id });
    if (!store) {
      return res.status(404).json({ message: "Store not found ❌" });
    }

    // جلب الطلبات مرتبة من الأحدث إلى الأقدم مع بيانات المنتجات
    const orders = await Order.find({ storeId: store._id })
      .sort({ createdAt: -1 }) 
      .populate("productId", "name currentPrice");

    res.status(200).json(orders);
  } catch (error) {
    console.error("Error fetching store orders:", error);
    res.status(500).json({ message: "Server error ❌" });
  }
});

// =============================
// NEW: GET STORE ANALYTICS (Protected) - Day 25 📊
// =============================
router.get("/analytics", auth, async (req, res) => {
  try {
    // 1. تحديد متجر التاجر الحالي بناءً على الـ Token
    const store = await Store.findOne({ owner: req.user.id });
    if (!store) {
      return res.status(404).json({ message: "Store not found ❌" });
    }

    const storeId = store._id;

    // 2. حساب عدد المنتجات الإجمالي في المتجر تلقائياً
    const totalProducts = await Product.countDocuments({ storeId });

    // 3. جلب جميع طلبات المتجر للقيام بالعمليات الحسابية والفلترة
    const orders = await Order.find({ storeId });

    // 4. إجراء الحسابات اللوجيستية والمالية
    const totalOrders = orders.length;
    const pendingOrders = orders.filter(order => order.status === "pending").length;

    // حساب الإيرادات الإجمالية بناءً على الطلبات التي تم تسليمها فقط (delivered) تماشياً مع طبيعة الـ COD في الجزائر
    const totalRevenue = orders
      .filter(order => order.status === "delivered")
      .reduce((sum, order) => sum + (order.totalPrice || 0), 0);

    // 5. إرجاع الأرقام الجاهزة للفرونت-أند
    res.status(200).json({
      totalProducts,
      totalOrders,
      pendingOrders,
      totalRevenue
    });

  } catch (error) {
    console.error("CRITICAL ERROR IN ANALYTICS ROUTE:", error.message);
    res.status(500).json({ message: "Server error ❌", error: error.message });
  }
});

// =============================
// UPDATE ORDER STATUS (Protected)
// =============================
router.put("/update-status/:id", auth, async (req, res) => {
  try {
    const { status } = req.body;

    // 1. صمام أمان للباك-أند: التحقق من الحالات المدعومة للتجارة الإلكترونية
    const allowedStatuses = ["pending", "shipped", "delivered", "cancelled"];
    if (status && !allowedStatuses.includes(status)) {
      return res.status(400).json({ message: "الحالة المرسلة غير صالحة ❌" });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Order not found ❌" });
    }

    const store = await Store.findOne({ owner: req.user.id });
    if (!store) {
      return res.status(404).json({ message: "Store not found ❌" });
    }

    // التحقق من الملكية لضمان الحماية لـ SaaS الخاص بك
    if (order.storeId.toString() !== store._id.toString()) {
      return res.status(403).json({ message: "Unauthorized ❌" });
    }

    // تحديث الحالة وحفظ التغييرات
    order.status = status || order.status;
    await order.save();

    res.status(200).json({
      message: "Order updated ✅",
      order,
    });
  } catch (error) {
    // طباعة تفصيلية لمعرفة سبب المشكلة فوراً من الـ Logs
    console.error("CRITICAL ERROR IN UPDATE-STATUS:", error.message);
    res.status(500).json({ 
      message: "Server error ❌", 
      error: error.message 
    });
  }
});

module.exports = router;