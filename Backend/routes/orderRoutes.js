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
      productId,       // ✦ الشراء المباشر (منتج واحد) — بقات كيما هي، ما تبدلتش
      quantity,
      items,           // ✦ جديد — سلة بعدة منتجات: [{ productId, quantity }]
      customerName,
      phone,
      address,
      municipality,
      note,
      shippingCity,
      shippingPrice,
      totalPrice
    } = req.body;

    // ✦ التحقق من الحقول الإجبارية
    if (!customerName || !phone || !shippingCity) {
      return res.status(400).json({ message: "جميع الحقول الإجبارية مطلوبة ❌" });
    }

    // ✦ التحقق من رقم الهاتف الجزائري
    const cleanPhone = phone.trim().replace(/\s/g, "");
    if (!ALGERIAN_PHONE_REGEX.test(cleanPhone)) {
      return res.status(400).json({
        message: "رقم الهاتف غير صحيح — أدخل رقم جزائري صحيح (مثال: 0550123456) ❌"
      });
    }

    // ✦ نبنيو لائحة عناصر موحدة — سواء جات من "items" (سلة) ولا productId مفرد (شراء مباشر)
    const rawItems = Array.isArray(items) && items.length
      ? items
      : (productId ? [{ productId, quantity: quantity || 1 }] : []);

    if (!rawItems.length) {
      return res.status(400).json({ message: "لا توجد منتجات في الطلب ❌" });
    }

    // ✦ نجيبو كل منتج، نتحققو من وجوده والمخزون ديالو، ونبنيو snapshot (اسم/صورة/سعر وقت الطلب)
    const builtItems = [];
    let storeId = null;
    for (const it of rawItems) {
      const product = await Product.findById(it.productId);
      if (!product) {
        return res.status(404).json({ message: "أحد المنتجات في طلبك لم يعد موجوداً ❌" });
      }
      const qty = Math.max(1, Number(it.quantity) || 1);
      if (product.stock <= 0 || product.stock < qty) {
        return res.status(400).json({ message: `عذراً، "${product.name}" نفد من المخزون 😔` });
      }
      if (!storeId) storeId = product.storeId;
      builtItems.push({
        productId: product._id,
        name:      product.name,
        image:     product.images?.[0] || product.image || "",
        price:     product.currentPrice,
        quantity:  qty,
      });
    }

    const itemsTotal = builtItems.reduce((sum, it) => sum + it.price * it.quantity, 0);

    // ✦ إنشاء الطلب — items هو المصدر الأساسي، productId/quantity كيتولدو من أول عنصر للتوافق القديم
    const order = new Order({
      items:        builtItems,
      productId:    builtItems[0].productId,
      quantity:     builtItems[0].quantity,
      customerName,
      phone:         cleanPhone,
      address:       address || "",
      municipality:  municipality || "",
      note:          note || "",
      shippingCity,
      shippingPrice: Number(shippingPrice) || 0,
      totalPrice:    Number(totalPrice) || (itemsTotal + (Number(shippingPrice) || 0)),
      storeId,
      status:        "pending",
    });

    await order.save();

    // ✦ تناقص المخزون بعد حفظ الطلب لكل منتج — atomic يمنع race condition
    await Promise.all(
      builtItems.map(it => Product.findByIdAndUpdate(it.productId, { $inc: { stock: -it.quantity } }))
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

    // ✦ إذا تم إلغاء الطلب — نرجع المخزون لكل منتج فالطلب (وليس فقط +1)
    if (status === "cancelled") {
      const restoreItems = order.items?.length
        ? order.items
        : (order.productId ? [{ productId: order.productId, quantity: order.quantity || 1 }] : []);
      await Promise.all(
        restoreItems.map(it => Product.findByIdAndUpdate(it.productId, { $inc: { stock: it.quantity } }))
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