const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");
const auth = require("../middleware/auth");

router.post("/create", auth, productController.createProduct);
router.get("/my-products", auth, productController.getMyProducts);
router.put("/update/:id", auth, productController.updateProduct);
router.get("/:productId", productController.getProductById);

module.exports = router;