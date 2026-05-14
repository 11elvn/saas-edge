const express = require("express");
const router = express.Router();

const Store = require("../models/Store");
const Product = require("../models/Product");

const auth = require("../middleware/auth");


// ==========================
// CREATE STORE
// ==========================
router.post("/create", auth, async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({
        message: "Store name required ❌",
      });
    }

    const existingStore =
      await Store.findOne({
        owner: req.user.id,
      });

    if (existingStore) {
      return res.status(400).json({
        message:
          "Store already exists ❌",
      });
    }

    const store = new Store({
      name,
      owner: req.user.id,
    });

    await store.save();

    res.status(201).json({
      message:
        "Store created ✅",
      store,
    });

  } catch (error) {
    console.log(error);

    res.status(500).json({
      message:
        "Server error ❌",
    });
  }
});


// ==========================
// GET MY STORE
// ==========================
router.get("/my-store", auth, async (req, res) => {
  try {
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

    res.status(200).json(store);

  } catch (error) {
    console.log(error);

    res.status(500).json({
      message:
        "Server error ❌",
    });
  }
});


// ==========================
// PUBLIC STORE
// ==========================
router.get("/public/:storeId", async (req, res) => {
  try {
    const store =
      await Store.findById(
        req.params.storeId
      );

    if (!store) {
      return res.status(404).json({
        message:
          "Store not found ❌",
      });
    }

    const products =
      await Product.find({
        storeId: store._id,
      });

    res.status(200).json({
      store,
      products,
    });

  } catch (error) {
    console.log(error);

    res.status(500).json({
      message:
        "Server error ❌",
    });
  }
});

module.exports = router;