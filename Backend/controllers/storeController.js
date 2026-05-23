const Store = require("../models/Store");

// دالة جلب المتجر الخاص بالتاجر المسجل حالياً
exports.getMyStore = async (req, res) => {
  try {
    // req.user.id يأتي من الـ middleware الخاص بالتسجيل (auth)
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
    // التحقق من اسم المتجر
    if (!name) {
      return res.status(400).json({ message: "Store name is required" });
    }

    // البحث عن المتجر الخاص بالتاجر وتحديث بياناته
    const updatedStore = await Store.findOneAndUpdate(
      { owner: req.user.id }, 
      { name, slug, whatsapp, logo, banner },
      { new: true } // ليعيد لنا الكائن بعد التحديث
    );

    if (!updatedStore) {
      return res.status(404).json({ message: "Store not found" });
    }

    res.json({ message: "Store updated successfully", store: updatedStore });
  } catch (err) {
    res.status(500).json({ message: "Server error: " + err.message });
  }
};