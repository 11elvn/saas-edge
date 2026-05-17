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
    console.log(error);
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
    console.log(error);
    res.status(500).json({ message: "Server error ❌" });
  }
});

// =============================
// UPDATE ORDER STATUS (Protected)
// =============================
router.put("/update-status/:id", auth, async (req, res) => {
  try {
    const { status } = req.body;

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

    order.status = status || order.status;
    await order.save();

    res.status(200).json({
      message: "Order updated ✅",
      order,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error ❌" });
  }
});

module.exports = router;