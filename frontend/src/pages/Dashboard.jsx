import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";

function Dashboard() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [store, setStore] = useState(null);
  const [hasStore, setHasStore] = useState(true);
  const [storeName, setStoreName] = useState("");

  // حالة تحميل أولية لمنع وميض واجهة الداشبورد قبل التحقق من وجود المتجر
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);

  // حالة تخزين الإحصائيات العامة القادمة من الباك-أند (Day 25)
  const [analytics, setAnalytics] = useState({
    totalProducts: 0,
    totalOrders: 0,
    pendingOrders: 0,
    totalRevenue: 0,
  });

  // حالات إضافة منتج جديد
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [currentPrice, setCurrentPrice] = useState("");
  const [oldPrice, setOldPrice] = useState("");
  const [image, setImage] = useState(""); // حالة جديدة لتخزين رابط صورة المنتج

  // حالة التعديل (Edit Mode)
  const [editingProduct, setEditingProduct] = useState(null);

  // 🆕 رابط الصورة الافتراضية الجديد والأكثر احترافية لحماية الواجهة في الدشبرد
  const DEFAULT_PRODUCT_IMAGE = "https://placehold.co/600x400/f1f5f9/94a3b8?text=No+Image";
  const OLD_UNSPLASH_IMAGE = "https://images.unsplash.com/photo-1531403009284-440f080d1e12?q=80&w=400";

  // ======================
  // API CALLS
  // ======================

  // تم تحديث الدالة لتتوافق مع منطق الـ Enterprise الجديد
  const getStore = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/stores/my-store`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      const data = await res.json();

      // التحقق الذكي من حقلhasStore القادم من السيرفر بـ 200 OK
      if (data.hasStore === false || !data.store) {
        setHasStore(false);
        return false; // نرجع false لكي نعلم الـ useEffect أن المستخدم ليس لديه متجر
      }
      
      setStore(data.store); // نخزن المتجر الحقيقي بداخل الـ State
      setHasStore(true);
      return true; // نرجع true إذا كان المتجر موجوداً
    } catch (err) { 
      console.log(err); 
      return false;
    } finally {
      setIsInitialLoading(false); // نوقف التحميل هنا بعد معرفة النتيجة يقيناً
    }
  };

  const getProducts = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/products/my-products`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (Array.isArray(data)) setProducts(data);
    } catch (err) { console.log(err); }
  };

  const getOrders = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/orders/my-orders`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (Array.isArray(data)) setOrders(data);
    } catch (err) { console.log(err); }
  };

  const getAnalytics = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/orders/analytics`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) setAnalytics(data);
    } catch (err) { console.log("خطأ في جلب الإحصائيات:", err); }
  };

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
    } catch (err) { console.log(err); }
  };

  const createProduct = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/products/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name, description, currentPrice, oldPrice, image }), 
      });
      const data = await res.json();
      alert(data.message);
      getProducts();
      getAnalytics();
      setName(""); setDescription(""); setCurrentPrice(""); setOldPrice(""); setImage(""); 
    } catch (err) { console.log(err); }
  };

  // 🆕 تم تحديث الدالة لتدعم التحديث المحلي الفوري لمنع قلق ثقل السيرفر المجاني
  const updateProduct = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/products/update/${editingProduct._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(editingProduct),
      });
      const data = await res.json();
      
      if (res.ok) {
        // تحديث المنتج في الذاكرة المحلية مباشرة لتسريع الواجهة 
        setProducts(prevProducts => 
          prevProducts.map(p => p._id === editingProduct._id ? editingProduct : p)
        );
        setEditingProduct(null);
        alert(data.message || "Product updated successfully! ✅");
        getAnalytics(); // تحديث الإحصائيات في الخلفية
      } else {
        alert(data.message || "Failed to update ❌");
      }
    } catch (err) { console.log(err); }
  };

  // 🆕 تم تحديث الدالة لتدعم الحذف المحلي الفوري لتسريع الـ UX
  const deleteProduct = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/products/delete/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      
      if (res.ok) {
        // حذف المنتج محلياً فوراً
        setProducts(prevProducts => prevProducts.filter(p => p._id !== id));
        alert(data.message || "Product deleted successfully! ✅");
        getAnalytics();
      } else {
        alert(data.message || "Failed to delete ❌");
      }
    } catch (err) { console.log(err); }
  };

  const markShipped = async (id) => {
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/api/orders/update-status/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: "shipped" }),
      });
      getOrders();
      getAnalytics();
    } catch (err) { console.log(err); }
  };

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  // الاستدعاء المشروط والذكي للـ APIs لمنع الـ 404
  useEffect(() => {
    if (!token) return navigate("/login");

    const checkAndFetchData = async () => {
      // 1. نتحقق من وجود المتجر أولاً وننتظر النتيجة المنطقية المرجعة
      const storeExists = await getStore(); 
      
      // 2. إذا كان عنده متجر فعلاً (true)، نجلب بقية البيانات بالتوازي
      if (storeExists) {
        Promise.all([
          getProducts(),
          getOrders(),
          getAnalytics()
        ]);
      }
    };

    checkAndFetchData();
  }, []);

  // شاشة تحميل نظيفة ومؤقتة تمنع ظهور أي مكونات قبل انتهاء طلب التحقق من السيرفر
  if (isInitialLoading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex flex-col justify-center items-center font-sans antialiased">
        <div className="text-center space-y-3">
          <div className="text-4xl animate-bounce">🚀</div>
          <p className="text-sm font-semibold tracking-wide text-slate-400 uppercase">
            Loading space...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#1e293b] font-sans pb-12">
      
      {/* NAVBAR */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 h-20 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-3xl">🚀</span>
            <h1 className="text-2xl font-black bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              SaaS Edge
            </h1>
          </div>
          <button 
            onClick={logout} 
            className="bg-red-50 text-red-600 border border-red-100 px-6 py-2 rounded-full font-semibold hover:bg-red-600 hover:text-white transition-all duration-300"
          >
            Logout
          </button>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 mt-10">

        {!hasStore ? (
          /* واجهة إنشاء متجر جديد */
          <div className="max-w-md mx-auto bg-white p-8 rounded-3xl shadow-xl border border-slate-100 text-center">
            <div className="text-5xl mb-4">🏪</div>
            <h2 className="text-2xl font-bold mb-2">Build Your Empire</h2>
            <p className="text-slate-500 mb-6">Enter a name for your online store to get started.</p>
            <input 
              className="w-full border border-slate-200 p-4 rounded-2xl focus:ring-4 focus:ring-blue-100 outline-none transition-all mb-4" 
              placeholder="e.g. My Awesome Shop" 
              onChange={(e) => setStoreName(e.target.value)} 
            />
            <button 
              onClick={createStore} 
              className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 active:scale-95 transition-all"
            >
              Launch My Store
            </button>
          </div>
        ) : (
          <>
            {/* رابط المتجر */}
            {store && (
              <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-8 rounded-3xl shadow-2xl text-white mb-10 relative overflow-hidden">
                <div className="relative z-10">
                  <h2 className="text-xl font-medium opacity-90 mb-4 flex items-center gap-2">
                    <span>🌍</span> Your Global Store Link
                  </h2>
                  <div className="flex flex-col md:flex-row gap-3">
                    <input 
                      readOnly 
                      value={`${window.location.origin}/store/${store._id}`} 
                      className="bg-white/10 border border-white/20 p-4 rounded-2xl w-full backdrop-blur-md outline-none text-white placeholder-white/50"
                    />
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(`${window.location.origin}/store/${store._id}`);
                        alert("Link copied!");
                      }} 
                      className="bg-white text-blue-700 px-8 py-4 rounded-2xl font-bold hover:bg-slate-100 transition-all active:scale-95"
                    >
                      Copy Link
                    </button>
                  </div>
                </div>
                <div className="absolute -bottom-10 -right-10 text-[150px] opacity-10 rotate-12">🛒</div>
              </div>
            )}

            {/* شبكة كروت الإحصائيات */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center justify-between group hover:border-blue-300 transition-all duration-300">
                <div>
                  <h3 className="text-slate-400 font-medium text-sm">Total Products</h3>
                  <p className="text-4xl font-black text-slate-800 mt-1 font-mono">{analytics.totalProducts}</p>
                </div>
                <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">📦</div>
              </div>

              <Link to="/dashboard/orders" className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center justify-between group hover:border-emerald-500 hover:shadow-md transition-all duration-300">
                <div>
                  <h3 className="text-slate-400 font-medium text-sm group-hover:text-emerald-600 transition-colors">Total Orders</h3>
                  <p className="text-4xl font-black text-slate-800 mt-1 font-mono">{analytics.totalOrders}</p>
                </div>
                <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center text-2xl group-hover:scale-110 transition-all">📋</div>
              </Link>

              <Link to="/dashboard/orders" className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center justify-between group hover:border-amber-500 hover:shadow-md transition-all duration-300">
                <div>
                  <h3 className="text-slate-400 font-medium text-sm group-hover:text-amber-600 transition-colors">Pending Orders</h3>
                  <p className="text-4xl font-black text-amber-600 mt-1 font-mono">{analytics.pendingOrders}</p>
                </div>
                <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center text-2xl group-hover:scale-110 transition-all">⏳</div>
              </Link>

              <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center justify-between group hover:border-violet-500 transition-all duration-300">
                <div>
                  <h3 className="text-slate-400 font-medium text-sm">Total Revenue</h3>
                  <p className="text-3xl font-black text-violet-600 mt-1 font-mono truncate max-w-[160px]">
                    {analytics.totalRevenue.toLocaleString()} <span className="text-xs font-bold text-slate-400">DA</span>
                  </p>
                </div>
                <div className="w-14 h-14 bg-violet-50 text-violet-600 rounded-2xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">💰</div>
              </div>
            </div>

            {/* النافذة المنبثقة لتعديل بيانات منتج (Modal) */}
            {editingProduct && (
              <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-6 z-50">
                <div className="bg-white p-8 rounded-[32px] shadow-2xl w-full max-w-lg border border-slate-100">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold">Edit Product Details</h2>
                    <button onClick={() => setEditingProduct(null)} className="text-slate-400 hover:text-slate-600">✕</button>
                  </div>
                  <div className="space-y-4">
                    <input value={editingProduct.name} onChange={(e) => setEditingProduct({...editingProduct, name: e.target.value})} className="w-full border border-slate-200 p-4 rounded-2xl outline-none focus:border-blue-500" placeholder="Product Name" />
                    <textarea value={editingProduct.description} onChange={(e) => setEditingProduct({...editingProduct, description: e.target.value})} className="w-full border border-slate-200 p-4 rounded-2xl outline-none focus:border-blue-500 min-h-[100px]" placeholder="Description" />
                    <input value={editingProduct.currentPrice} onChange={(e) => setEditingProduct({...editingProduct, currentPrice: e.target.value})} className="w-full border border-slate-200 p-4 rounded-2xl outline-none focus:border-blue-500" placeholder="Price (DA)" type="number" />
                    
                    {/* 🆕 تم تعديل الـ Input ذكياً ليظهر فارغاً إذا كان المنتج بلا صورة أو يحمل الرابط الافتراضي القديم */}
                    <input 
                      value={(editingProduct.image === OLD_UNSPLASH_IMAGE || editingProduct.image === DEFAULT_PRODUCT_IMAGE) ? "" : (editingProduct.image || "")} 
                      onChange={(e) => setEditingProduct({...editingProduct, image: e.target.value})} 
                      className="w-full border border-slate-200 p-4 rounded-2xl outline-none focus:border-blue-500" 
                      placeholder="Image URL (Link)" 
                    />
                    
                    <div className="flex gap-3 pt-2">
                      <button onClick={updateProduct} className="flex-1 bg-blue-600 text-white py-4 rounded-2xl font-bold hover:bg-blue-700 transition-all">Save Changes</button>
                      <button onClick={() => setEditingProduct(null)} className="flex-1 bg-slate-100 text-slate-600 py-4 rounded-2xl font-bold hover:bg-slate-200 transition-all">Cancel</button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* قسم إضافة منتج جديد */}
            <section className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100 mb-10">
              <h2 className="text-2xl font-bold mb-8 flex items-center gap-3">
                <span className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center text-xl">✨</span>
                Add New Product
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <input value={name} onChange={(e) => setName(e.target.value)} className="w-full border border-slate-100 bg-slate-50 p-4 rounded-2xl focus:bg-white focus:ring-4 focus:ring-indigo-50 outline-none transition-all" placeholder="Product Name" />
                  <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="w-full border border-slate-100 bg-slate-50 p-4 rounded-2xl focus:bg-white focus:ring-4 focus:ring-indigo-50 outline-none transition-all min-h-[120px]" placeholder="Detailed Description" />
                </div>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <input value={currentPrice} onChange={(e) => setCurrentPrice(e.target.value)} className="w-full border border-slate-100 bg-slate-50 p-4 rounded-2xl focus:bg-white focus:ring-4 focus:ring-indigo-50 outline-none transition-all font-bold text-blue-600" placeholder="Price (DA)" type="number" />
                    <input value={oldPrice} onChange={(e) => setOldPrice(e.target.value)} className="w-full border border-slate-100 bg-slate-50 p-4 rounded-2xl focus:bg-white focus:ring-4 focus:ring-indigo-50 outline-none transition-all line-through text-slate-400" placeholder="Old Price" type="number" />
                  </div>
                  <input value={image} onChange={(e) => setImage(e.target.value)} className="w-full border border-slate-100 bg-slate-50 p-4 rounded-2xl focus:bg-white focus:ring-4 focus:ring-indigo-50 outline-none transition-all" placeholder="Product Image URL (Paste link here)" />
                  <button onClick={createProduct} className="w-full bg-slate-900 text-white py-5 rounded-2xl font-bold hover:bg-indigo-600 transition-all shadow-lg shadow-slate-200 active:scale-[0.98]">
                    List Product to Store
                  </button>
                </div>
              </div>
            </section>

            {/* قسم عرض المنتجات الحالية */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-6 px-2">Catalog Inventory</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <div key={product._id} className="bg-white rounded-[28px] shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col justify-between">
                    <div className="h-44 bg-slate-50 w-full relative overflow-hidden border-b border-slate-100">
                      <img 
                        src={(product.image === OLD_UNSPLASH_IMAGE || !product.image) ? DEFAULT_PRODUCT_IMAGE : product.image} 
                        alt={product.name} 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = DEFAULT_PRODUCT_IMAGE;
                        }}
                      />
                    </div>
                    <div className="p-6 flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="font-bold text-xl mb-1 truncate">{product.name}</h3>
                        <p className="text-slate-500 text-sm mb-4 line-clamp-2 min-h-[40px]">{product.description}</p>
                      </div>
                      <div>
                        <div className="flex items-end gap-2 mb-6">
                          <span className="text-2xl font-black text-blue-600">{product.currentPrice} DA</span>
                          {product.oldPrice && <span className="text-slate-300 line-through text-sm mb-1">{product.oldPrice} DA</span>}
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => setEditingProduct(product)} className="flex-1 bg-amber-50 text-amber-600 py-3 rounded-xl font-bold hover:bg-amber-500 hover:text-white transition-all">Edit</button>
                          <button onClick={() => deleteProduct(product._id)} className="flex-1 bg-red-50 text-red-600 py-3 rounded-xl font-bold hover:bg-red-500 hover:text-white transition-all">Delete</button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* قسم إدارة الطلبات المستلمة */}
            <section className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100 overflow-hidden">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-bold flex items-center gap-3">
                  <span className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center text-xl">🛒</span>
                  Recent Orders
                </h2>
                <Link 
                  to="/dashboard/orders" 
                  className="text-blue-600 hover:text-indigo-600 font-semibold text-sm flex items-center gap-1 bg-blue-50 px-4 py-2 rounded-xl hover:bg-blue-100 transition-all"
                >
                  إدارة جميع الطلبات ⬅️
                </Link>
              </div>

              <div className="space-y-4">
                {orders.length === 0 ? (
                  <p className="text-slate-400 text-center py-10">No orders yet. Keep pushing! 🚀</p>
                ) : (
                  orders.slice(0, 5).map((order) => (
                    <div key={order._id} className="bg-slate-50/50 p-5 rounded-2xl flex flex-col md:flex-row justify-between md:items-center gap-4 hover:bg-slate-50 transition-colors">
                      <div className="flex gap-4 items-center">
                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm text-xl">👤</div>
                        <div>
                          <h3 className="font-bold">{order.customerName}</h3>
                          <p className="text-slate-500 text-sm">{order.phone} • {order.productId?.name}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className={`px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${order.status === 'pending' ? 'bg-amber-100 text-amber-600' : order.status === 'delivered' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                          {order.status}
                        </span>
                        {order.status === "pending" && (
                          <button onClick={() => markShipped(order._id)} className="bg-green-600 text-white px-6 py-2 rounded-xl text-sm font-bold shadow-md hover:bg-green-700 active:scale-95 transition-all">
                            Ship Order
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
}

export default Dashboard;