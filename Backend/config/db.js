const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    // هنا نجعله يقرأ رابط الأطلس من الـ Environment Variables التي وضعناها في Render
    // وإذا لم يجدها (مثلاً في جهازك) سيستخدم الرابط المحلي
    const mongoURI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/saas-ecommerce";
    
    await mongoose.connect(mongoURI);
    console.log("MongoDB connected 🚀");
  } catch (error) {
    console.log("DB error:", error);
  }
};

module.exports = connectDB;