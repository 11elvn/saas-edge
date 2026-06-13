const express = require("express");
const router = express.Router();

const productController =
  require("../controllers/productController");

const auth =
  require("../middleware/auth");

// create
router.post(
  "/create",
  auth,
  productController.createProduct
);

// my products
router.get(
  "/my-products",
  auth,
  productController.getMyProducts
);

// public store products ✅
router.get(
  "/store/:storeId",
  productController.getProductsByStore
);

// public search ✅
router.get(
  "/search/:storeId",
  productController.searchProducts
);

// update
router.put(
  "/update/:id",
  auth,
  productController.updateProduct
);

// delete
router.delete(
  "/delete/:id",
  auth,
  productController.deleteProduct
);

// single product
router.get(
  "/:productId",
  productController.getProductById
);

module.exports = router;