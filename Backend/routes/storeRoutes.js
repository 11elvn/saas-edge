const express = require("express");
const router  = express.Router();
const auth    = require("../middleware/auth");

const {
  getMyStore,
  updateStore,
  createStore,
  getPublicStore,
  updateThemeConfig,
} = require("../controllers/storeController");

router.post("/create",           auth, createStore);
router.get("/my-store",          auth, getMyStore);
router.put("/update",            auth, updateStore);
router.put("/theme-config",      auth, updateThemeConfig);   // ✦ جديد
router.get("/public/:slug",      getPublicStore);

module.exports = router;