const Store = require("../models/Store");
const Product = require("../models/Product");

// ======================
// CREATE STORE
// ======================
exports.createStore = async (req, res) => {
  const { name } = req.body;

  try {
    const existingStore =
      await Store.findOne({
        owner: req.user.id,
      });

    if (existingStore) {
      return res.status(400).json({
        message:
          "You already have a store",
      });
    }

    const newStore =
      new Store({
        name,
        owner: req.user.id,
        slug: name
          .toLowerCase()
          .replace(/ /g, "-"),
      });

    await newStore.save();

    res.status(201).json({
      message:
        "Store created successfully",
      store: newStore,
    });

  } catch (err) {
    res.status(500).json({
      message:
        "Server error: " +
        err.message,
    });
  }
};

// ======================
// GET MY STORE
// ======================
exports.getMyStore =
  async (req, res) => {
    try {
      const store =
        await Store.findOne({
          owner:
            req.user.id,
        });

      if (!store) {
        return res
          .status(200)
          .json({
            hasStore:
              false,
          });
      }

      res.status(200).json({
        hasStore: true,
        store,
      });

    } catch (err) {
      res.status(500).json({
        message:
          "Server error: " +
          err.message,
      });
    }
  };

// ======================
// UPDATE STORE
// ======================
exports.updateStore =
  async (req, res) => {
    const {
      name,
      slug,
      whatsapp,
      logo,
      banner,
    } = req.body;

    try {
      if (!name) {
        return res
          .status(400)
          .json({
            message:
              "Store name is required",
          });
      }

      const updatedStore =
        await Store.findOneAndUpdate(
          {
            owner:
              req.user.id,
          },
          {
            name,
            slug,
            whatsapp,
            logo,
            banner,
          },
          {
            new: true,
          }
        );

      if (!updatedStore) {
        return res
          .status(404)
          .json({
            message:
              "Store not found",
          });
      }

      res.json({
        message:
          "Store updated successfully",
        store:
          updatedStore,
      });

    } catch (err) {
      res.status(500).json({
        message:
          "Server error: " +
          err.message,
      });
    }
  };

// ======================
// GET PUBLIC STORE
// ======================
exports.getPublicStore =
  async (req, res) => {
    try {
      const store =
        await Store.findOne({
          slug:
            req.params.slug,
        });

      if (!store) {
        return res
          .status(404)
          .json({
            message:
              "Store not found",
          });
      }

      const products =
        await Product.find({
          storeId:
            store._id,
        }).populate(
          "categoryId"
        );

      res.status(200).json({
        store,
        products,
      });

    } catch (err) {
      res.status(500).json({
        message:
          "Server error: " +
          err.message,
      });
    }
  };