const mongoose = require("mongoose");

const CategorySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  storeId: { type: mongoose.Schema.Types.ObjectId, ref: "Store", required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Category", CategorySchema);