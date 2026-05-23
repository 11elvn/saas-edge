const express = require("express");
const router = express.Router();

const auth =
  require("../middleware/auth");

const {
  getMyStore,
  updateStore,
  createStore,
  getPublicStore,
} = require("../controllers/storeController");

// create
router.post(
  "/create",
  auth,
  createStore
);

// my store
router.get(
  "/my-store",
  auth,
  getMyStore
);

// update
router.put(
  "/update",
  auth,
  updateStore
);

// public store by slug ✅
router.get(
  "/public/:slug",
  getPublicStore
);

module.exports = router;