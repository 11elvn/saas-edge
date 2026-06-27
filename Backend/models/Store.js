const mongoose = require("mongoose");

const storeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    slug: { type: String, required: true, unique: true, trim: true, lowercase: true },
    logo:            { type: String, default: "" },
    banner:          { type: String, default: "" },
    phone:           { type: String, default: "" },
    whatsappNumber:  { type: String, default: "", trim: true },
    primaryColor:    { type: String, default: "#2563eb" },
    secondaryColor:  { type: String, default: "#0f172a" },
    fontFamily:      { type: String, enum: ["Inter","Poppins","Cairo","Roboto"], default: "Inter" },

    // ✦ Page Builder — كل إعدادات الثيم
    themeConfig: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
  },
  { timestamps: true }
);

storeSchema.pre("validate", function (next) {
  if (this.name && !this.slug) {
    this.slug = this.name
      .toLowerCase().trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }
  next();
});

module.exports = mongoose.model("Store", storeSchema);