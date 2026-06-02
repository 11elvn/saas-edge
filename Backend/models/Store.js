const mongoose = require("mongoose");

const storeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },

    logo: {
      type: String,
      default: "",
    },

    banner: {
      type: String,
      default: "",
    },

    phone: {
      type: String,
      default: "",
    },

    // ✦ Day 15 — رقم واتساب التاجر (يستخدم لإرسال إشعار الطلب)
    whatsappNumber: {
      type: String,
      default: "",
      trim: true,
    },

    // 🎨 Theme Customization
    primaryColor: {
      type: String,
      default: "#2563eb", // blue
    },

    secondaryColor: {
      type: String,
      default: "#0f172a", // dark
    },

    fontFamily: {
      type: String,
      enum: ["Inter", "Poppins", "Cairo", "Roboto"],
      default: "Inter",
    },
  },
  { timestamps: true }
);

// auto generate slug
storeSchema.pre("validate", function (next) {
  if (this.name && !this.slug) {
    this.slug = this.name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }
  next();
});

module.exports = mongoose.model("Store", storeSchema);