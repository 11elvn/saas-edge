import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";

function Dashboard() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  // --- الحالات (States) ---
  const [store, setStore] = useState(null);
  const [hasStore, setHasStore] = useState(true);
  const [storeName, setStoreName] = useState("");
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [categories, setCategories] = useState([]);
  const [categoryName, setCategoryName] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [analytics, setAnalytics] = useState({
    totalProducts: 0, totalOrders: 0, pendingOrders: 0, totalRevenue: 0,
  });
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [currentPrice, setCurrentPrice] = useState("");
  const [oldPrice, setOldPrice] = useState("");
  const [image, setImage] = useState("");
  const [editingProduct, setEditingProduct] = useState(null);

  const DEFAULT_PRODUCT_IMAGE = "https://placehold.co/600x400/f1f5f9/94a3b8?text=No+Image";
  const OLD_UNSPLASH_IMAGE = "https://images.unsplash.com/photo-1531403009284-440f080d1e12?q=80&w=400";

  // --- اتصالات الـ API ---
  const getStore = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/stores/my-store`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.hasStore === false || !data.store) {
        setHasStore(false);
        return false;
      }
      setStore(data.store);
      setHasStore(true);
      return true;
    } catch (err) { console.error(err); return false; } finally { setIsInitialLoading(false); }
  };

  const getProducts = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/products/my-products`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (Array.isArray(data)) setProducts(data);
    } catch (err) { console.error(err); }
  };

  const getOrders = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/orders/my-orders`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (Array.isArray(data)) setOrders(data);
    } catch (err) { console.error(err); }
  };

  const getAnalytics = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/orders/analytics`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (res.ok) setAnalytics(data);
    } catch (err) { console.error(err); }
  };

  const getCategories = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/categories/my-categories`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (Array.isArray(data)) setCategories(data);
    } catch (err) { console.error(err); }
  };

  // --- العمليات ---
  const createStore = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/stores/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: storeName }),
      });
      const data = await res.json();
      alert(data.message);
      window.location.reload();
    } catch (err) { console.error(err); }
  };

  const createCategory = async () => {
    if (!categoryName.trim()) return alert("رجاءً اكتب اسم القسم!");
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/categories/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: categoryName }),
      });
      if (res.ok) { setCategoryName(""); getCategories(); }
    } catch (err) { console.error(err); }
  };

  const deleteCategory = async (id) => {
    if (!window.confirm("هل أنت متأكد؟")) return;
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/api/categories/delete/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
      getCategories();
    } catch (err) { console.error(err); }
  };

  const createProduct = async () => {
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/api/products/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name, description, currentPrice, oldPrice, image, categoryId: selectedCategory }),
      });
      getProducts(); getAnalytics();
      setName(""); setDescription(""); setCurrentPrice(""); setOldPrice(""); setImage("");
    } catch (err) { console.error(err); }
  };

  const updateProduct = async () => {
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/api/products/update/${editingProduct._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(editingProduct),
      });
      setEditingProduct(null); getProducts(); getAnalytics();
    } catch (err) { console.error(err); }
  };

  const deleteProduct = async (id) => {
    if (!window.confirm("هل تريد حذف هذا المنتج؟")) return;
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/api/products/delete/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
      getProducts(); getAnalytics();
    } catch (err) { console.error(err); }
  };

  const markShipped = async (id) => {
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/api/orders/update-status/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: "shipped" }),
      });
      getOrders(); getAnalytics();
    } catch (err) { console.error(err); }
  };

  const logout = () => { localStorage.removeItem("token"); navigate("/login"); };

  // --- التحميل الأولي ---
  useEffect(() => {
    if (!token) return navigate("/login");
    const init = async () => {
      const exists = await getStore();
      if (exists) {
        Promise.all([getProducts(), getOrders(), getAnalytics(), getCategories()]);
      }
    };
    init();
  }, []);

  if (isInitialLoading) return <div className="min-h-screen flex items-center justify-center text-4xl">🚀 Loading...</div>;

  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#1e293b] font-sans pb-12">
      <nav className="bg-white border-b h-20 flex justify-between items-center px-6">
        <h1 className="text-2xl font-black text-indigo-600">SaaS Edge</h1>
        <button onClick={logout} className="bg-red-50 text-red-600 px-6 py-2 rounded-full font-bold">Logout</button>
      </nav>

      <main className="max-w-6xl mx-auto px-6 mt-10">
        {!hasStore ? (
          <div className="bg-white p-8 rounded-3xl shadow text-center">
            <h2 className="text-2xl font-bold mb-4">Build Your Empire</h2>
            <input className="w-full border p-4 rounded-2xl mb-4" placeholder="Store Name" onChange={(e) => setStoreName(e.target.value)} />
            <button onClick={createStore} className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold">Launch My Store</button>
          </div>
        ) : (
          <>
            {/* هنا ستظهر باقي مكوناتك (الأقسام، المنتجات، الطلبات) */}
            <p>Welcome to Dashboard! Your store is ready.</p>
          </>
        )}
      </main>
    </div>
  );
}

export default Dashboard;