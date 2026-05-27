const express = require("express");
const router = express.Router();

const Order   = require("../models/Order");
const Product = require("../models/Product");
const Store   = require("../models/Store");
const auth    = require("../middleware/auth");

// ✦ regex للتحقق من رقم هاتف جزائري
const ALGERIAN_PHONE_REGEX = /^0[5-7][0-9]{8}$/;

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

    // ✦ التحقق من الحقول الإجبارية
    if (!productId || !customerName || !phone || !shippingCity) {
      return res.status(400).json({ message: "جميع الحقول الإجبارية مطلوبة ❌" });
    }

    // ✦ التحقق من رقم الهاتف الجزائري
    const cleanPhone = phone.trim().replace(/\s/g, "");
    if (!ALGERIAN_PHONE_REGEX.test(cleanPhone)) {
      return res.status(400).json({
        message: "رقم الهاتف غير صحيح — أدخل رقم جزائري صحيح (مثال: 0550123456) ❌"
      });
    }

    // ✦ التأكد من وجود المنتج
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "المنتج غير موجود ❌" });
    }

    // ✦ التحقق من المخزون — هنا كانت المشكلة
    if (product.stock <= 0) {
      return res.status(400).json({ message: "عذراً، هذا المنتج نفد من المخزون 😔" });
    }

    // ✦ إنشاء الطلب
    const order = new Order({
      productId,
      customerName,
      phone:         cleanPhone,
      address:       address || "",
      shippingCity,
      shippingPrice: Number(shippingPrice) || 0,
      totalPrice:    Number(totalPrice) || product.currentPrice,
      storeId:       product.storeId,
      status:        "pending",
    });

    await order.save();

    // ✦ تناقص المخزون بعد حفظ الطلب — atomic يمنع race condition
    await Product.findByIdAndUpdate(
      productId,
      { $inc: { stock: -1 } }
    );

    res.status(201).json({
      message: "تم تسجيل طلبك بنجاح ✅",
      order,
    });

  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({ message: "خطأ في السيرفر ❌" });
  }
});

// =============================
// GET MY ORDERS (Protected)
// =============================
router.get("/my-orders", auth, async (req, res) => {
  try {
    const store = await Store.findOne({ owner: req.user.id });
    if (!store) {
      return res.status(404).json({ message: "المتجر غير موجود ❌" });
    }

    const orders = await Order.find({ storeId: store._id })
      .sort({ createdAt: -1 })
      .populate("productId", "name currentPrice");

    res.status(200).json(orders);

  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ message: "خطأ في السيرفر ❌" });
  }
});

// =============================
// GET STORE ANALYTICS (Protected)
// =============================
router.get("/analytics", auth, async (req, res) => {
  try {
    const store = await Store.findOne({ owner: req.user.id });
    if (!store) {
      return res.status(404).json({ message: "المتجر غير موجود ❌" });
    }

    const storeId = store._id;
    const totalProducts = await Product.countDocuments({ storeId });
    const orders        = await Order.find({ storeId });

    const totalOrders    = orders.length;
    const pendingOrders  = orders.filter(o => o.status === "pending").length;
    const cancelledOrders = orders.filter(o => o.status === "cancelled").length;

    const totalRevenue = orders
      .filter(o => o.status === "delivered")
      .reduce((sum, o) => sum + (o.totalPrice || 0), 0);

    res.status(200).json({
      totalProducts,
      totalOrders,
      pendingOrders,
      totalRevenue,
      cancelledOrders, // ✦ جديد — Day 12 سنعرضها في الداشبورد
    });

  } catch (error) {
    console.error("Error in analytics:", error.message);
    res.status(500).json({ message: "خطأ في السيرفر ❌" });
  }
});

// =============================
// UPDATE ORDER STATUS (Protected)
// =============================
router.put("/update-status/:id", auth, async (req, res) => {
  try {
    const { status } = req.body;

    const allowedStatuses = ["pending", "shipped", "delivered", "cancelled"];
    if (!status || !allowedStatuses.includes(status)) {
      return res.status(400).json({ message: "الحالة المرسلة غير صالحة ❌" });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "الطلب غير موجود ❌" });
    }

    const store = await Store.findOne({ owner: req.user.id });
    if (!store) {
      return res.status(404).json({ message: "المتجر غير موجود ❌" });
    }

    if (order.storeId.toString() !== store._id.toString()) {
      return res.status(403).json({ message: "غير مصرح لك بهذا الإجراء ⛔" });
    }

    // ✦ statusFlow — يمنع التراجع في الحالة
    const statusFlow = {
      pending:   ["shipped", "cancelled"],
      shipped:   ["delivered", "cancelled"],
      delivered: [],
      cancelled: [],
    };

    const allowedNext = statusFlow[order.status] || [];
    if (!allowedNext.includes(status)) {
      return res.status(400).json({
        message: `لا يمكن تغيير الحالة من "${order.status}" إلى "${status}" ❌`
      });
    }

    // ✦ إذا تم إلغاء الطلب — نرجع المخزون
    if (status === "cancelled") {
      await Product.findByIdAndUpdate(
        order.productId,
        { $inc: { stock: 1 } }
      );
    }

    order.status = status;
    await order.save();

    res.status(200).json({
      message: "تم تحديث حالة الطلب ✅",
      order,
    });

  } catch (error) {
    console.error("Error updating order status:", error.message);
    res.status(500).json({ message: "خطأ في السيرفر ❌" });
  }
});

module.exports = router;