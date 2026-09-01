const Product =
  require("../models/Product");

const Store =
  require("../models/Store");

// ======================
// CREATE PRODUCT
// ======================
exports.createProduct =
  async (req, res) => {
    try {
      const {
        name,
        description,
        currentPrice,
        oldPrice,
        image,
        images,
        stock,
        categoryId,
        colors,
        sizes,
      } = req.body;

      if (
        !name ||
        !description ||
        !currentPrice
      ) {
        return res
          .status(400)
          .json({
            message:
              "Missing fields ❌",
          });
      }

      const store =
        await Store.findOne({
          owner:
            req.user.id,
        });

      if (!store)
        return res
          .status(404)
          .json({
            message:
              "Store not found ❌",
          });

      const product =
        new Product({
          name,
          description,
          currentPrice,
          oldPrice,
          storeId:
            store._id,
          image:
            image ||
            "https://images.unsplash.com/photo-1531403009284-440f080d1e12?q=80&w=400",
          images:
            images || [],
          stock:
            stock || 10,
          categoryId:
            categoryId ||
            null,
          colors:
            colors || [],
          sizes:
            sizes || [],
        });

      await product.save();

      res.status(201).json({
        message:
          "Product created 📦",
        product,
      });

    } catch (error) {
      res.status(500).json({
        message:
          "Server error ❌",
      });
    }
  };

// ======================
// GET MY PRODUCTS
// ======================
exports.getMyProducts =
  async (req, res) => {
    try {
      const store =
        await Store.findOne({
          owner:
            req.user.id,
        });

      if (!store)
        return res
          .status(404)
          .json({
            message:
              "Store not found ❌",
          });

      const products =
        await Product.find({
          storeId:
            store._id,
        }).populate(
          "categoryId"
        );

      res.status(200).json(
        products
      );

    } catch (error) {
      res.status(500).json({
        message:
          "Server error ❌",
      });
    }
  };

// ======================
// GET PRODUCTS BY STORE
// ======================
exports.getProductsByStore =
  async (req, res) => {
    try {
      const products =
        await Product.find({
          storeId:
            req.params.storeId,
        }).populate(
          "categoryId"
        );

      res.status(200).json(
        products
      );

    } catch (error) {
      res.status(500).json({
        message:
          "Server error ❌",
      });
    }
  };

// ======================
// UPDATE PRODUCT
// ======================
exports.updateProduct =
  async (req, res) => {
    try {
      const product =
        await Product.findById(
          req.params.id
        );

      if (!product)
        return res
          .status(404)
          .json({
            message:
              "Product not found ❌",
          });

      const store =
        await Store.findOne({
          owner:
            req.user.id,
        });

      if (
        !store ||
        product.storeId.toString() !==
          store._id.toString()
      ) {
        return res
          .status(403)
          .json({
            message:
              "Unauthorized ❌",
          });
      }

      // ✦ نحددو بالضبط الحقول المسموح تتبدل — ماشي كل req.body مباشرة (كان قبل يقدر
      // التاجر يبعت storeId فالـ body ويبدل ملكية المنتج لمتجر آخر، حيت Object.assign
      // كان كيمرج كل حاجة بلا فلترة)
      const {
        name, description, currentPrice, oldPrice,
        image, images, stock, categoryId, colors, sizes,
      } = req.body;
      const allowedUpdates = {
        name, description, currentPrice, oldPrice,
        image, images, stock, categoryId, colors, sizes,
      };
      Object.keys(allowedUpdates).forEach(
        key => allowedUpdates[key] === undefined && delete allowedUpdates[key]
      );

      Object.assign(
        product,
        allowedUpdates
      );

      await product.save();

      res.status(200).json({
        message:
          "Product updated ✏️",
        product,
      });

    } catch (error) {
      res.status(500).json({
        message:
          "Server error ❌",
      });
    }
  };

// ======================
// DELETE PRODUCT
// ======================
exports.deleteProduct =
  async (req, res) => {
    try {
      const product =
        await Product.findById(
          req.params.id
        );

      if (!product)
        return res
          .status(404)
          .json({
            message:
              "Product not found ❌",
          });

      const store =
        await Store.findOne({
          owner:
            req.user.id,
        });

      if (
        !store ||
        product.storeId.toString() !==
          store._id.toString()
      ) {
        return res
          .status(403)
          .json({
            message:
              "Unauthorized ❌",
          });
      }

      await Product.findByIdAndDelete(
        req.params.id
      );

      res.status(200).json({
        message:
          "Product deleted successfully ✅",
      });

    } catch (error) {
      res.status(500).json({
        message:
          "Server error ❌",
      });
    }
  };

// ======================
// GET SINGLE PRODUCT
// ======================
exports.getProductById =
  async (req, res) => {
    try {
      const product =
        await Product.findById(
          req.params
            .productId
        );

      if (!product)
        return res
          .status(404)
          .json({
            message:
              "Product not found ❌",
          });

      res.status(200).json(
        product
      );

    } catch (error) {
      res.status(500).json({
        message:
          "Server error ❌",
      });
    }
  };

// ======================
// SEARCH PRODUCTS (PUBLIC)
// ======================
exports.searchProducts =
  async (req, res) => {
    try {
      const { storeId } = req.params;
      const q = (req.query.q || "").trim();

      if (!q) {
        return res.status(200).json([]);
      }

      // ✦ escape للـ regex special characters — بلا هادشي، q كيتحول مباشرة لـ
      // regex pattern حقيقي، وأي زبون (endpoint عام بلا auth) يقدر يبعت pattern
      // ثقيل (ReDoS) يعلق السيرفر
      const escapedQ = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

      const products = await Product.find({
        storeId,
        name: { $regex: escapedQ, $options: "i" },
      }).populate("categoryId");

      res.status(200).json(products);

    } catch (error) {
      res.status(500).json({
        message:
          "Server error ❌",
      });
    }
  };