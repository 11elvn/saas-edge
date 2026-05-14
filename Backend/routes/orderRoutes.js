const express = require("express");
const router = express.Router();

const Order = require("../models/Order");
const Product = require("../models/Product");
const Store = require("../models/Store");

const auth = require("../middleware/auth");


// =============================
// CREATE ORDER
// =============================
router.post("/create", async (req, res) => {
  try {
    const {
      productId,
      customerName,
      phone,
    } = req.body;

    // validation
    if (
      !productId ||
      !customerName ||
      !phone
    ) {
      return res.status(400).json({
        message: "Missing fields ❌",
      });
    }

    // check product
    const product =
      await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        message: "Product not found ❌",
      });
    }

    // create order
    const order = new Order({
      productId,
      customerName,
      phone,
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

    res.status(500).json({
      message: "Server error ❌",
    });
  }
});


// =============================
// GET MY ORDERS
// =============================
router.get("/my-orders", auth, async (req, res) => {
  try {
    const store =
      await Store.findOne({
        owner: req.user.id,
      });

    if (!store) {
      return res.status(404).json({
        message: "Store not found ❌",
      });
    }

    const orders =
      await Order.find({
        storeId: store._id,
      }).populate(
        "productId",
        "name currentPrice"
      );

    res.status(200).json(orders);

  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Server error ❌",
    });
  }
});


// =============================
// UPDATE ORDER STATUS
// =============================
router.put(
  "/update-status/:id",
  auth,
  async (req, res) => {
    try {
      const { status } = req.body;

      const order =
        await Order.findById(
          req.params.id
        );

      if (!order) {
        return res.status(404).json({
          message:
            "Order not found ❌",
        });
      }

      const store =
        await Store.findOne({
          owner: req.user.id,
        });

      if (!store) {
        return res.status(404).json({
          message:
            "Store not found ❌",
        });
      }

      // ownership check
      if (
        order.storeId.toString() !==
        store._id.toString()
      ) {
        return res.status(403).json({
          message:
            "Unauthorized ❌",
        });
      }

      order.status =
        status || order.status;

      await order.save();

      res.status(200).json({
        message:
          "Order updated ✅",
        order,
      });

    } catch (error) {
      console.log(error);

      res.status(500).json({
        message:
          "Server error ❌",
      });
    }
  }
);

module.exports = router;