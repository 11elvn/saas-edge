import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Dashboard() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [store, setStore] = useState(null);
  const [hasStore, setHasStore] = useState(true);
  const [storeName, setStoreName] = useState("");

  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);

  // حالات إدخال المنتج (للإضافة)
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [currentPrice, setCurrentPrice] = useState("");
  const [oldPrice, setOldPrice] = useState("");

  // حالات التعديل (Edit Mode)
  const [editingProduct, setEditingProduct] = useState(null);

  // ======================
  // GET STORE
  // ======================
  const getStore = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/stores/my-store`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (response.status === 404) {
        setHasStore(false);
        return;
      }
      setStore(data);
    } catch (error) {
      console.log(error);
    }
  };

  // ======================
  // GET PRODUCTS
  // ======================
  const getProducts = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/products/my-products`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (Array.isArray(data)) setProducts(data);
    } catch (error) {
      console.log(error);
    }
  };

  // ======================
  // GET ORDERS
  // ======================
  const getOrders = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/orders/my-orders`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (Array.isArray(data)) setOrders(data);
    } catch (error) {
      console.log(error);
    }
  };

  // ======================
  // CREATE STORE
  // ======================
  const createStore = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/stores/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: storeName }),
      });
      const data = await response.json();
      alert(data.message);
      window.location.reload();
    } catch (error) {
      console.log(error);
    }
  };

  // ======================
  // CREATE PRODUCT
  // ======================
  const createProduct = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/products/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name, description, currentPrice, oldPrice }),
      });
      const data = await response.json();
      alert(data.message);
      getProducts();
      setName(""); setDescription(""); setCurrentPrice(""); setOldPrice("");
    } catch (error) {
      console.log(error);
    }
  };

  // ======================
  // UPDATE PRODUCT (EDIT) - الميزة الجديدة
  // ======================
  const updateProduct = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/products/update/${editingProduct._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editingProduct),
      });
      const data = await response.json();
      alert(data.message);
      setEditingProduct(null); // إغلاق واجهة التعديل
      getProducts(); // تحديث القائمة
    } catch (error) {
      console.log(error);
    }
  };

  // ======================
  // DELETE PRODUCT
  // ======================
  const deleteProduct = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/products/delete/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      alert(data.message);
      getProducts();
    } catch (error) {
      console.log(error);
    }
  };

  // ======================
  // UPDATE ORDER STATUS
  // ======================
  const markShipped = async (id) => {
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/api/orders/update-status/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: "shipped" }),
      });
      getOrders();
    } catch (error) {
      console.log(error);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  useEffect(() => {
    if (!token) { navigate("/login"); return; }
    getStore(); getProducts(); getOrders();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      {/* الترويسة */}
      <div className="bg-white rounded-2xl shadow p-6 flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-blue-600">Dashboard 🚀</h1>
        <button onClick={logout} className="bg-red-500 text-white px-5 py-2 rounded-xl">Logout</button>
      </div>

      {!hasStore ? (
        <div className="bg-white p-10 rounded-2xl shadow text-center">
          <h2 className="text-2xl font-bold mb-4">Create your store 🏪</h2>
          <input className="border p-3 rounded-xl w-full max-w-md" placeholder="Store Name" onChange={(e) => setStoreName(e.target.value)} />
          <br /><br />
          <button onClick={createStore} className="bg-blue-600 text-white px-8 py-3 rounded-xl">Create Store</button>
        </div>
      ) : (
        <>
          {/* رابط المتجر */}
          {store && (
            <div className="bg-white p-6 rounded-2xl shadow mb-8">
              <h2 className="text-xl font-bold mb-3">Your Store Link 🌍</h2>
              <div className="flex gap-3">
                <input readOnly value={`${window.location.origin}/store/${store._id}`} className="border p-3 rounded-xl w-full" />
                <button onClick={() => navigator.clipboard.writeText(`${window.location.origin}/store/${store._id}`)} className="bg-blue-600 text-white px-6 rounded-xl">Copy</button>
              </div>
            </div>
          )}

          {/* الإحصائيات */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white p-6 rounded-2xl shadow">
              <h3 className="text-gray-500">Products</h3>
              <p className="text-4xl font-bold text-blue-600">{products.length}</p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow">
              <h3 className="text-gray-500">Orders</h3>
              <p className="text-4xl font-bold text-green-600">{orders.length}</p>
            </div>
          </div>

          {/* واجهة تعديل منتج (تظهر فقط عند الضغط على Edit) */}
          {editingProduct && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-lg">
                <h2 className="text-2xl font-bold mb-6">Edit Product ✏️</h2>
                <div className="grid gap-4">
                  <input value={editingProduct.name} onChange={(e) => setEditingProduct({...editingProduct, name: e.target.value})} className="border p-3 rounded-xl" placeholder="Name" />
                  <textarea value={editingProduct.description} onChange={(e) => setEditingProduct({...editingProduct, description: e.target.value})} className="border p-3 rounded-xl" placeholder="Description" />
                  <input value={editingProduct.currentPrice} onChange={(e) => setEditingProduct({...editingProduct, currentPrice: e.target.value})} className="border p-3 rounded-xl" placeholder="Price" type="number" />
                  <div className="flex gap-3">
                    <button onClick={updateProduct} className="bg-green-600 text-white py-3 rounded-xl flex-1 font-bold">Update</button>
                    <button onClick={() => setEditingProduct(null)} className="bg-gray-200 text-gray-700 py-3 rounded-xl flex-1 font-bold">Cancel</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* إضافة منتج */}
          <div className="bg-white p-8 rounded-2xl shadow mb-8">
            <h2 className="text-2xl font-bold mb-6">Add Product</h2>
            <div className="grid gap-4">
              <input value={name} onChange={(e) => setName(e.target.value)} className="border p-3 rounded-xl" placeholder="Name" />
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="border p-3 rounded-xl" placeholder="Description" />
              <input value={currentPrice} onChange={(e) => setCurrentPrice(e.target.value)} className="border p-3 rounded-xl" placeholder="Current Price" type="number" />
              <input value={oldPrice} onChange={(e) => setOldPrice(e.target.value)} className="border p-3 rounded-xl" placeholder="Old Price" type="number" />
              <button onClick={createProduct} className="bg-black text-white py-3 rounded-xl font-bold">Save Product</button>
            </div>
          </div>

          {/* عرض المنتجات */}
          <div className="bg-white p-8 rounded-2xl shadow mb-8">
            <h2 className="text-2xl font-bold mb-6">My Products</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {products.map((product) => (
                <div key={product._id} className="border p-4 rounded-xl hover:border-blue-300 transition">
                  <h3 className="font-bold text-lg">{product.name}</h3>
                  <p className="text-gray-600 text-sm mb-2">{product.description}</p>
                  <p className="text-blue-600 font-bold">{product.currentPrice} DA</p>
                  <div className="flex gap-2 mt-3">
                    <button onClick={() => setEditingProduct(product)} className="bg-yellow-500 text-white px-4 py-2 rounded-lg text-sm font-bold">Edit</button>
                    <button onClick={() => deleteProduct(product._id)} className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm font-bold">Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* عرض الطلبات */}
          <div className="bg-white p-8 rounded-2xl shadow">
            <h2 className="text-2xl font-bold mb-6">My Orders 📦</h2>
            <div className="grid gap-4">
              {orders.map((order) => (
                <div key={order._id} className="border p-4 rounded-xl flex justify-between items-center">
                  <div>
                    <h3 className="font-bold">{order.customerName}</h3>
                    <p className="text-sm text-gray-500">{order.phone}</p>
                    <p className="text-sm font-medium">{order.productId?.name}</p>
                    <p className={`text-sm font-bold ${order.status === 'pending' ? 'text-orange-500' : 'text-green-500'}`}>{order.status}</p>
                  </div>
                  {order.status === "pending" && (
                    <button onClick={() => markShipped(order._id)} className="bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-bold">Mark Shipped</button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default Dashboard;