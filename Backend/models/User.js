const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    // ✦ email: مطلوب + فريد + ينظف المسافات تلقائياً
    email: {
      type: String,
      required: [true, "الإيميل مطلوب"],
      unique: true,
      trim: true,
      lowercase: true, // يحول ahmed@Gmail.com → ahmed@gmail.com تلقائياً
    },

    // ✦ password: مطلوب + 6 أحرف على الأقل
    password: {
      type: String,
      required: [true, "الباسورد مطلوب"],
      minlength: [6, "الباسورد لازم يكون 6 أحرف على الأقل"],
    },
  },

  // ✦ timestamps: يضيف createdAt و updatedAt تلقائياً
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);