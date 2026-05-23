import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function StoreSettings() {
  const [store, setStore] = useState({ 
    name: "", 
    slug: "", 
    phone: "", 
    logo: "", 
    banner: "", 
    theme: "light" 
  });
  
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  // 1. جلب بيانات المتجر عند تحميل الصفحة
  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/stores/my-store`, {
      headers: { 
        Authorization: `Bearer ${token}` 
      }
    })
    .then(res => res.json())
    .then(data => {
      if (data.hasStore) {
        setStore(data.store);
      }
    })
    .catch(err => console.error("Error fetching store:", err));
  }, []);

  // 2. دالة حفظ التغييرات
  const saveSettings = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/stores/update`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json", 
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify(store)
      });

      if (res.ok) {
        alert("Store updated successfully ✅");
      } else {
        alert("Failed to update store ❌");
      }
    } catch (err) {
      console.error("Error saving store:", err);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-8 bg-white rounded-3xl shadow-sm border mt-10">
      <h1 className="text-2xl font-bold mb-6">⚙️ Store Settings</h1>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Store Name</label>
          <input className="w-full border p-3 rounded-xl" value={store.name} onChange={e => setStore({...store, name: e.target.value})} />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Slug (URL)</label>
          <input className="w-full border p-3 rounded-xl" value={store.slug} onChange={e => setStore({...store, slug: e.target.value})} />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Phone Number</label>
          <input className="w-full border p-3 rounded-xl" value={store.phone} onChange={e => setStore({...store, phone: e.target.value})} />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Logo URL</label>
          <input className="w-full border p-3 rounded-xl" value={store.logo} onChange={e => setStore({...store, logo: e.target.value})} />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Banner URL</label>
          <input className="w-full border p-3 rounded-xl" value={store.banner} onChange={e => setStore({...store, banner: e.target.value})} />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Theme</label>
          <select className="w-full border p-3 rounded-xl" value={store.theme} onChange={e => setStore({...store, theme: e.target.value})}>
              <option value="light">Light Theme</option>
              <option value="dark">Dark Theme</option>
              <option value="blue">Blue Theme</option>
          </select>
        </div>

        <button onClick={saveSettings} className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold hover:bg-indigo-700 transition">
          Save Changes
        </button>
        
        <button onClick={() => navigate("/dashboard")} className="w-full text-slate-500 py-2">
          Cancel
        </button>
      </div>
    </div>
  );
}

export default StoreSettings;