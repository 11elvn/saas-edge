const mongoose = require("mongoose");

const storeSchema = new mongoose.Schema({
  name: String,
  owner: String,
});

module.exports = mongoose.model("Store", storeSchema);