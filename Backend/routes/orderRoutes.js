const express = require("express");
const router = express.Router();

const Order = require("../models/Order");
const Product = require("../models/Product");
const Store = require("../models/Store");

const auth = require("../middleware/auth");

// CREATE ORDER
router.post("/create/:productId", async (req, res) => {
  try {

    const { clientName, phone, address } = req.body;

    // نجيب product
    const product = await Product.findById(req.params.productId);

    if (!product) {
      return res.send("Product not found ❌");
    }

    // إنشاء الطلب
    const order = new Order({
      clientName,
      phone,
      address,

      productId: product._id,
      storeId: product.storeId,
    });

    await order.save();

    res.send("Order created 🧾");

  } catch (error) {
    res.send("Error ❌");
  }
});

// GET STORE ORDERS
router.get("/my-orders", auth, async (req, res) => {
  try {

    // نجيب store تاع user
    const store = await Store.findOne({
      owner: req.user.id,
    });

    if (!store) {
      return res.send("Store not found ❌");
    }

    // نجيب الطلبات
    const orders = await Order.find({
      storeId: store._id,
    });

    res.json(orders);

  } catch (error) {
    res.send("Error ❌");
  }
});

module.exports = router;