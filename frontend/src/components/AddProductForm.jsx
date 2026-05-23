import React, { useState } from 'react';

const AddProductForm = ({ categories, onAddProduct }) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    currentPrice: "",
    oldPrice: "",
    image: "",      // رابط الصورة الأساسي
    images: "",     // مخصص لروابط إضافية لاحقاً
    stock: 10,      // القيمة الافتراضية للمخزون
    categoryId: ""  // ربط المنتج بالقسم
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    // التأكد من وجود البيانات الأساسية
    if (!formData.name || !formData.currentPrice) {
      return alert("Please fill in the required fields (Name & Price)");
    }
    onAddProduct(formData);
    // تصفير النموذج بعد الإضافة
    setFormData({ name: "", description: "", currentPrice: "", oldPrice: "", image: "", images: "", stock: 10, categoryId: "" });
  };

  return (
    <section className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100 mb-10">
      <h2 className="text-2xl font-bold mb-8 flex items-center gap-3">
        <span className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center text-xl">✨</span>
        Add New Product
      </h2>
      
      <div className="grid md:grid-cols-2 gap-6">
        {/* الجزء الأول: بيانات المنتج */}
        <div className="space-y-4">
          <input name="name" value={formData.name} onChange={handleChange} className="w-full border p-4 rounded-2xl bg-slate-50 outline-none focus:ring-4 focus:ring-indigo-50" placeholder="Product Name" />
          <textarea name="description" value={formData.description} onChange={handleChange} className="w-full border p-4 rounded-2xl bg-slate-50 outline-none focus:ring-4 focus:ring-indigo-50 min-h-[120px]" placeholder="Detailed Description" />
          
          <select name="categoryId" value={formData.categoryId} onChange={handleChange} className="w-full border p-4 rounded-2xl bg-slate-50 outline-none focus:ring-4 focus:ring-indigo-50 text-slate-500">
            <option value="">Select Category (Optional)</option>
            {categories.map((cat) => <option key={cat._id} value={cat._id}>{cat.name}</option>)}
          </select>
        </div>

        {/* الجزء الثاني: السعر، المخزون، والصور */}
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <input name="currentPrice" type="number" value={formData.currentPrice} onChange={handleChange} className="w-full border p-4 rounded-2xl bg-slate-50 outline-none focus:ring-4 focus:ring-indigo-50" placeholder="Price (DA)" />
            <input name="stock" type="number" value={formData.stock} onChange={handleChange} className="w-full border p-4 rounded-2xl bg-slate-50 outline-none focus:ring-4 focus:ring-indigo-50" placeholder="Stock Qty" />
          </div>
          
          <input name="oldPrice" type="number" value={formData.oldPrice} onChange={handleChange} className="w-full border p-4 rounded-2xl bg-slate-50 outline-none focus:ring-4 focus:ring-indigo-50" placeholder="Old Price (Optional)" />
          <input name="image" value={formData.image} onChange={handleChange} className="w-full border p-4 rounded-2xl bg-slate-50 outline-none focus:ring-4 focus:ring-indigo-50" placeholder="Main Image URL" />
          
          <button onClick={handleSubmit} className="w-full bg-slate-900 text-white py-5 rounded-2xl font-bold hover:bg-indigo-600 transition-all shadow-lg active:scale-[0.98]">
            List Product to Store
          </button>
        </div>
      </div>
    </section>
  );
};

export default AddProductForm;