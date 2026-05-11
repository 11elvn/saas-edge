const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  clientName: String,
  phone: String,
  address: String,

  productId: String,
  storeId: String,

  status: {
    type: String,
    default: "pending",
  },
});

module.exports = mongoose.model("Order", orderSchema);