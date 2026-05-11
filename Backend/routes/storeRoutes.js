const express = require("express");
const router = express.Router();
const Store = require("../models/Store");
const auth = require("../middleware/auth");

// create store
router.post("/create", auth, async (req, res) => {
  try {
    const { name } = req.body;

    const store = new Store({
      name,
      owner: req.user.id,
    });

    await store.save();

    res.send("Store created 🏪");
  } catch (error) {
    res.send("Error ❌");
  }
});

module.exports = router;