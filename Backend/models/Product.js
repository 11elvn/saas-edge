const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: String,
  description: String,
  currentPrice: Number,
  oldPrice: Number,
  storeId: String,
});

module.exports = mongoose.model("Product", productSchema);