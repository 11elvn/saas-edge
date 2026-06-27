const Store   = require("../models/Store");
const Product = require("../models/Product");

// ======================
// CREATE STORE
// ======================
exports.createStore = async (req, res) => {
  const { name } = req.body;
  try {
    const existingStore = await Store.findOne({ owner: req.user.id });
    if (existingStore) return res.status(400).json({ message: "You already have a store" });

    const baseSlug   = name.toLowerCase().trim().replace(/[^\w\s-]/g,"").replace(/\s+/g,"-");
    const slugExists = await Store.findOne({ slug: baseSlug });
    const finalSlug  = slugExists ? `${baseSlug}-${Date.now()}` : baseSlug;

    const newStore = new Store({ name, owner: req.user.id, slug: finalSlug });
    await newStore.save();
    res.status(201).json({ message: "Store created successfully", store: newStore });
  } catch (err) {
    res.status(500).json({ message: "Server error: " + err.message });
  }
};

// ======================
// GET MY STORE
// ======================
exports.getMyStore = async (req, res) => {
  try {
    const store = await Store.findOne({ owner: req.user.id });
    if (!store) return res.status(200).json({ hasStore: false });
    res.status(200).json({ hasStore: true, store });
  } catch (err) {
    res.status(500).json({ message: "Server error: " + err.message });
  }
};

// ======================
// UPDATE STORE
// ======================
exports.updateStore = async (req, res) => {
  const {
    name, phone, whatsappNumber,
    logo, banner,
    primaryColor, secondaryColor, fontFamily,
    themeConfig,                               // ✦ Page Builder
  } = req.body;

  try {
    if (!name) return res.status(400).json({ message: "Store name is required" });

    const updateData = {
      name, phone, whatsappNumber,
      logo, banner,
      primaryColor, secondaryColor, fontFamily,
    };

    // نحفظ themeConfig فقط إذا جاء في الـ request
    if (themeConfig !== undefined) updateData.themeConfig = themeConfig;

    const updatedStore = await Store.findOneAndUpdate(
      { owner: req.user.id },
      updateData,
      { new: true }
    );

    if (!updatedStore) return res.status(404).json({ message: "Store not found" });
    res.json({ message: "Store updated successfully ✅", store: updatedStore });
  } catch (err) {
    res.status(500).json({ message: "Server error: " + err.message });
  }
};

// ======================
// UPDATE THEME CONFIG ONLY  ✦ endpoint جديد أسرع
// ======================
exports.updateThemeConfig = async (req, res) => {
  const { themeConfig } = req.body;
  try {
    if (!themeConfig) return res.status(400).json({ message: "themeConfig is required" });

    const updatedStore = await Store.findOneAndUpdate(
      { owner: req.user.id },
      { themeConfig },
      { new: true }
    );

    if (!updatedStore) return res.status(404).json({ message: "Store not found" });
    res.json({ message: "Theme saved ✅", store: updatedStore });
  } catch (err) {
    res.status(500).json({ message: "Server error: " + err.message });
  }
};

// ======================
// GET PUBLIC STORE
// ======================
exports.getPublicStore = async (req, res) => {
  try {
    const store = await Store.findOne({ slug: req.params.slug });
    if (!store) return res.status(404).json({ message: "Store not found" });

    const products = await Product.find({ storeId: store._id }).populate("categoryId");
    res.status(200).json({ store, products });
  } catch (err) {
    res.status(500).json({ message: "Server error: " + err.message });
  }
};