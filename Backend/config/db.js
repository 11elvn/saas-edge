const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI;
    
    if (!mongoURI) {
      console.error("❌ MONGO_URI is missing from Environment Variables!");
      process.exit(1);
    }

    await mongoose.connect(mongoURI);
    console.log("MongoDB connected 🚀");
  } catch (error) {
    console.error("DB error:", error.message);
    process.exit(1);
  }
};

module.exports = connectDB;