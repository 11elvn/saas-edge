const express = require("express");
const router = express.Router();

const Product = require("../models/Product");
const Store = require("../models/Store");

const auth = require("../middleware/auth");

// CREATE PRODUCT
router.post("/create", auth, async (req, res) => {
  try {
    const {
      name,
      description,
      currentPrice,
      oldPrice,
    } = req.body;

    // validation
    if (!name || !description || !currentPrice) {
      return res.status(400).json({
        message: "Missing fields ❌",
      });
    }

    // find user store
    const store = await Store.findOne({
      owner: req.user.id,
    });

    if (!store) {
      return res.status(404).json({
        message: "Store not found ❌",
      });
    }

    // create product
    const product = new Product({
      name,
      description,
      currentPrice,
      oldPrice,
      storeId: store._id,
    });

    await product.save();

    res.status(201).json({
      message: "Product created 📦",
      product,
    });

  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Server error ❌",
    });
  }
});

// GET MY PRODUCTS
router.get("/my-products", auth, async (req, res) => {
  try {
    const store = await Store.findOne({
      owner: req.user.id,
    });

    if (!store) {
      return res.status(404).json({
        message: "Store not found ❌",
      });
    }

    const products = await Product.find({
      storeId: store._id,
    });

    res.status(200).json(products);

  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Server error ❌",
    });
  }
});

// UPDATE PRODUCT
router.put("/update/:id", auth, async (req, res) => {
  try {
    const product = await Product.findById(
      req.params.id
    );

    if (!product) {
      return res.status(404).json({
        message: "Product not found ❌",
      });
    }

    // find store
    const store = await Store.findOne({
      owner: req.user.id,
    });

    if (!store) {
      return res.status(404).json({
        message: "Store not found ❌",
      });
    }

    // ownership check
    if (
      product.storeId.toString() !==
      store._id.toString()
    ) {
      return res.status(403).json({
        message: "Unauthorized ❌",
      });
    }

    product.name =
      req.body.name || product.name;

    product.description =
      req.body.description ||
      product.description;

    product.currentPrice =
      req.body.currentPrice ||
      product.currentPrice;

    product.oldPrice =
      req.body.oldPrice ||
      product.oldPrice;

    await product.save();

    res.status(200).json({
      message: "Product updated ✏️",
      product,
    });

  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Server error ❌",
    });
  }
});

// DELETE PRODUCT
router.delete("/delete/:id", auth, async (req, res) => {
  try {
    const product = await Product.findById(
      req.params.id
    );

    if (!product) {
      return res.status(404).json({
        message: "Product not found ❌",
      });
    }

    // find store
    const store = await Store.findOne({
      owner: req.user.id,
    });

    if (!store) {
      return res.status(404).json({
        message: "Store not found ❌",
      });
    }

    // ownership check
    if (
      product.storeId.toString() !==
      store._id.toString()
    ) {
      return res.status(403).json({
        message: "Unauthorized ❌",
      });
    }

    await product.deleteOne();

    res.status(200).json({
      message: "Product deleted 🗑️",
    });

  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Server error ❌",
    });
  }
});

module.exports = router;