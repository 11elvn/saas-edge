import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Dashboard() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  // الحالة الابتدائية للمتجر نضعها false لضمان فحصها من السيرفر أولاً
  const [hasStore, setHasStore] = useState(false);
  const [storeName, setStoreName] = useState("");
  const [products, setProducts] = useState([]);

  // حالات إدخال المنتج
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [currentPrice, setCurrentPrice] = useState("");
  const [oldPrice, setOldPrice] = useState("");

  // دالة جلب المنتجات وفحص وجود المتجر
  const getProducts = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/products/my-products`,
        {
          headers: { 
            "Authorization": `Bearer ${token}` 
          },
        }
      );

      const data = await response.json();

      if (response.status === 404) {
        setHasStore(false);
        setProducts([]);
        return;
      }

      if (response.ok && Array.isArray(data)) {
        setHasStore(true);
        setProducts(data);
      }

    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  // دالة إنشاء المتجر
  const createStore = async () => {
    if (!storeName.trim()) return alert("Please enter a store name");

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/stores/create`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: storeName,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        alert("Store created successfully! 🎉");
        setHasStore(true); // تحديث الحالة فوراً لإخفاء نموذج الإنشاء
        getProducts();     // جلب البيانات لتحديث العدادات
      } else {
        alert(data.message || "Error creating store");
      }

    } catch (error) {
      console.error("Error creating store:", error);
    }
  };

  // دالة إضافة منتج جديد
  const createProduct = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/products/create`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
          body: JSON.stringify({
            name,
            description,
            currentPrice,
            oldPrice,
          }),
        }
      );

      const data = await response.json();
      
      if (response.ok) {
        alert("Product added successfully! ✅");
        // تفريغ الحقول بعد النجاح
        setName("");
        setDescription("");
        setCurrentPrice("");
        setOldPrice("");
        // تحديث القائمة
        getProducts();
      } else {
        alert(data.message || "Error adding product");
      }

    } catch (error) {
      console.error("Error creating product:", error);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    getProducts();
  }, [token]);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-4xl font-bold">Dashboard 🚀</h1>
        <button
          onClick={logout}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded transition"
        >
          Logout
        </button>
      </div>

      <hr className="my-6" />

      {/* عرض الإحصائيات فقط إذا كان لديه متجر */}
      {hasStore && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-blue-500 text-white p-6 rounded-xl shadow-lg">
            <h3 className="text-lg opacity-80">Total Products</h3>
            <p className="text-3xl font-bold">{products.length}</p>
          </div>
          <div className="bg-green-500 text-white p-6 rounded-xl shadow-lg">
            <h3 className="text-lg opacity-80">Total Orders</h3>
            <p className="text-3xl font-bold">0</p>
          </div>
          <div className="bg-purple-500 text-white p-6 rounded-xl shadow-lg">
            <h3 className="text-lg opacity-80">Total Sales</h3>
            <p className="text-3xl font-bold">0 DA</p>
          </div>
        </div>
      )}

      {/* التبديل بين نموذج إنشاء المتجر ونموذج إضافة المنتجات */}
      {!hasStore ? (
        <div className="bg-gray-50 p-6 rounded-xl border-2 border-dashed border-gray-300">
          <h2 className="text-2xl font-semibold mb-4">Welcome! Create Your Store First</h2>
          <div className="space-y-4">
            <input
              className="border p-3 rounded w-full focus:ring-2 focus:ring-blue-400 outline-none"
              placeholder="Store Name (e.g., My Awesome Shop)"
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
            />
            <button
              onClick={createStore}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-bold transition w-full md:w-auto"
            >
              Create My Store
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
          <h2 className="text-2xl font-semibold mb-6 text-gray-800">Add New Product</h2>
          <div className="space-y-4">
            <input
              className="border p-3 rounded w-full focus:ring-2 focus:ring-green-400 outline-none"
              placeholder="Product Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <textarea
              className="border p-3 rounded w-full focus:ring-2 focus:ring-green-400 outline-none"
              placeholder="Product Description"
              rows="3"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            <div className="grid grid-cols-2 gap-4">
              <input
                className="border p-3 rounded w-full focus:ring-2 focus:ring-green-400 outline-none"
                placeholder="Current Price (DA)"
                type="number"
                value={currentPrice}
                onChange={(e) => setCurrentPrice(e.target.value)}
              />
              <input
                className="border p-3 rounded w-full focus:ring-2 focus:ring-green-400 outline-none"
                placeholder="Old Price (DA)"
                type="number"
                value={oldPrice}
                onChange={(e) => setOldPrice(e.target.value)}
              />
            </div>
            <button
              onClick={createProduct}
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-bold transition w-full"
            >
              Add Product to Store
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;