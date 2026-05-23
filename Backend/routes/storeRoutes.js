const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const { getMyStore, updateStore, createStore } = require("../controllers/storeController");

// المسارات
router.post("/create", auth, createStore);
router.get("/my-store", auth, getMyStore);
router.put("/update", auth, updateStore);

module.exports = router;