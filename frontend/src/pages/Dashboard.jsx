import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";

function Dashboard() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [store, setStore] = useState(null);
  const [hasStore, setHasStore] = useState(false); // ✅ FIX مهم
  const [storeName, setStoreName] = useState("");

  const [isInitialLoading, setIsInitialLoading] = useState(true);

  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);

  const [categories, setCategories] = useState([]);
  const [categoryName, setCategoryName] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  const [images, setImages] = useState("");

  const [analytics, setAnalytics] = useState({
    totalProducts: 0,
    totalOrders: 0,
    pendingOrders: 0,
    totalRevenue: 0,
  });

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [currentPrice, setCurrentPrice] = useState("");
  const [oldPrice, setOldPrice] = useState("");
  const [image, setImage] = useState("");

  const [editingProduct, setEditingProduct] = useState(null);

  const DEFAULT_PRODUCT_IMAGE =
    "https://placehold.co/600x400/f1f5f9/94a3b8?text=No+Image";
  const OLD_UNSPLASH_IMAGE =
    "https://images.unsplash.com/photo-1531403009284-440f080d1e12?q=80&w=400";

  const getStore = async () => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/stores/my-store`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = await res.json();

      if (!data || data.message === "Store not found") {
        setHasStore(false);
        setStore(null);
        return false;
      }

      setStore(data);
      setHasStore(true);
      return true;
    } catch (err) {
      console.log(err);
      setHasStore(false);
      return false;
    } finally {
      setIsInitialLoading(false);
    }
  };

  const getProducts = async () => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/products/my-products`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await res.json();
      if (Array.isArray(data)) setProducts(data);
    } catch (err) {
      console.log(err);
    }
  };

  const getOrders = async () => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/orders/my-orders`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await res.json();
      if (Array.isArray(data)) setOrders(data);
    } catch (err) {
      console.log(err);
    }
  };

  const getAnalytics = async () => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/orders/analytics`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await res.json();
      if (res.ok) setAnalytics(data);
    } catch (err) {
      console.log(err);
    }
  };

  const getCategories = async () => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/categories/my-categories`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await res.json();
      if (Array.isArray(data)) setCategories(data);
    } catch (err) {
      console.log(err);
    }
  };

  // 🔥 FIX CREATE STORE (بدون reload)
  const createStore = async () => {
    if (!storeName.trim()) {
      return alert("اكتب اسم المتجر ❌");
    }

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/stores/create`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ name: storeName }),
        }
      );

      const data = await res.json();

      alert(data.message);

      if (res.ok) {
        const ok = await getStore();
        setHasStore(ok);

        if (ok) {
          await Promise.all([
            getProducts(),
            getOrders(),
            getAnalytics(),
            getCategories(),
          ]);
        }
      }
    } catch (err) {
      console.log(err);
    }
  };

  const createCategory = async () => {
    if (!categoryName.trim())
      return alert("رجاءً اكتب اسم القسم أولاً! ❌");

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/categories/create`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ name: categoryName }),
        }
      );

      const data = await res.json();

      if (res.ok) {
        alert("تم إنشاء القسم بنجاح! ✅");
        setCategoryName("");
        getCategories();
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.log(err);
    }
  };

  const deleteCategory = async (id) => {
    if (!window.confirm("هل أنت متأكد؟")) return;

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/categories/delete/${id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = await res.json();

      if (res.ok) {
        setCategories((prev) => prev.filter((c) => c._id !== id));
        getProducts();
        alert(data.message);
      }
    } catch (err) {
      console.log(err);
    }
  };

  const createProduct = async () => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/products/create`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name,
            description,
            currentPrice,
            oldPrice,
            image,
            images: images
              ? images.split(",").map((img) => img.trim())
              : [],
            categoryId: selectedCategory || null,
          }),
        }
      );

      const data = await res.json();

      alert(data.message);

      if (res.ok) {
        getProducts();
        getAnalytics();

        setName("");
        setDescription("");
        setCurrentPrice("");
        setOldPrice("");
        setImage("");
        setImages("");
        setSelectedCategory("");
      }
    } catch (err) {
      console.log(err);
    }
  };

  const updateProduct = async () => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/products/update/${editingProduct._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(editingProduct),
        }
      );

      const data = await res.json();

      if (res.ok) {
        setProducts((prev) =>
          prev.map((p) =>
            p._id === editingProduct._id ? editingProduct : p
          )
        );

        setEditingProduct(null);
        getAnalytics();
        getProducts();
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.log(err);
    }
  };

  const deleteProduct = async (id) => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/products/delete/${id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = await res.json();

      if (res.ok) {
        setProducts((prev) => prev.filter((p) => p._id !== id));
        getAnalytics();
      }
    } catch (err) {
      console.log(err);
    }
  };

  const markShipped = async (id) => {
    try {
      await fetch(
        `${import.meta.env.VITE_API_URL}/api/orders/update-status/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: "shipped" }),
        }
      );

      getOrders();
      getAnalytics();
    } catch (err) {
      console.log(err);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  useEffect(() => {
    if (!token) return navigate("/login");

    const init = async () => {
      const ok = await getStore();

      if (ok) {
        await Promise.all([
          getProducts(),
          getOrders(),
          getAnalytics(),
          getCategories(),
        ]);
      }
    };

    init();
  }, []);

  if (isInitialLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {!hasStore ? (
        <div>
          <h1>Create Store</h1>
          <input onChange={(e) => setStoreName(e.target.value)} />
          <button onClick={createStore}>Create</button>
        </div>
      ) : (
        <div>
          <h1>Dashboard</h1>
        </div>
      )}
    </div>
  );
}

export default Dashboard;