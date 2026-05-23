const Store = require("../models/Store");

// دالة إنشاء متجر جديد
exports.createStore = async (req, res) => {
  const { name } = req.body;
  try {
    // التأكد من أن التاجر لا يملك متجراً بالفعل
    const existingStore = await Store.findOne({ owner: req.user.id });
    if (existingStore) {
      return res.status(400).json({ message: "You already have a store" });
    }

    const newStore = new Store({
      name,
      owner: req.user.id,
      slug: name.toLowerCase().replace(/ /g, '-')
    });

    await newStore.save();
    res.status(201).json({ message: "Store created successfully", store: newStore });
  } catch (err) {
    res.status(500).json({ message: "Server error: " + err.message });
  }
};

// دالة جلب المتجر الخاص بالتاجر المسجل حالياً
exports.getMyStore = async (req, res) => {
  try {
    const store = await Store.findOne({ owner: req.user.id });
    
    if (!store) {
      return res.status(404).json({ message: "Store not found" });
    }
    
    res.json(store);
  } catch (err) {
    res.status(500).json({ message: "Server error: " + err.message });
  }
};

// دالة تحديث بيانات المتجر
exports.updateStore = async (req, res) => {
  const { name, slug, whatsapp, logo, banner } = req.body;
  
  try {
    if (!name) {
      return res.status(400).json({ message: "Store name is required" });
    }

    const updatedStore = await Store.findOneAndUpdate(
      { owner: req.user.id }, 
      { name, slug, whatsapp, logo, banner },
      { new: true } 
    );

    if (!updatedStore) {
      return res.status(404).json({ message: "Store not found" });
    }

    res.json({ message: "Store updated successfully", store: updatedStore });
  } catch (err) {
    res.status(500).json({ message: "Server error: " + err.message });
  }
};