// ============================================================
// 📁 Dashboard.jsx — لوحة تحكم SaaS ECOMMERCE
// الفريموورك: React + Tailwind CSS + React Router DOM
// الهدف: إدارة المتجر، المنتجات، الطلبات، الإحصائيات
// ============================================================

import { useEffect, useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🎨 MINI COMPONENTS — مكونات صغيرة مساعدة
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// كارد إحصائية واحدة
const StatCard = ({ icon, label, value, color, href }) => {
  const content = (
    <div className={`stat-card stat-card--${color}`}>
      <div className="stat-card__icon">{icon}</div>
      <div className="stat-card__body">
        <span className="stat-card__label">{label}</span>
        <span className="stat-card__value">{value}</span>
      </div>
      <div className="stat-card__glow" />
    </div>
  );
  // إذا فيه رابط نلفه بـ Link، وإلا div عادي
  return href ? <Link to={href} style={{ textDecoration: "none" }}>{content}</Link> : content;
};

// بادج حالة الطلب (pending / shipped / delivered)
const StatusBadge = ({ status }) => {
  const map = {
    pending: { label: "قيد الانتظار", cls: "badge--amber" },
    shipped: { label: "تم الشحن", cls: "badge--blue" },
    delivered: { label: "تم التوصيل", cls: "badge--green" },
  };
  const { label, cls } = map[status] || { label: status, cls: "badge--gray" };
  return <span className={`badge ${cls}`}>{label}</span>;
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🖼️ CONSTANTS — ثوابت الصور الافتراضية
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const DEFAULT_IMG = "https://placehold.co/600x400/0f172a/334155?text=No+Image";
const OLD_UNSPLASH = "https://images.unsplash.com/photo-1531403009284-440f080d1e12?q=80&w=400";

// دالة مساعدة: ترجع الصورة الصحيحة أو الافتراضية
const resolveImg = (img) =>
  !img || img === OLD_UNSPLASH ? DEFAULT_IMG : img;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🏠 MAIN COMPONENT — المكون الرئيسي
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function Dashboard() {
  const navigate = useNavigate();

  // ── Auth ──────────────────────────────────
  // نجيبو التوكن من localStorage (يتحط عند تسجيل الدخول)
  const token = localStorage.getItem("token");

  // ── Store State ───────────────────────────
  const [store, setStore] = useState(null);   // بيانات المتجر
  const [hasStore, setHasStore] = useState(true);   // هل المتجر موجود؟
  const [storeName, setStoreName] = useState("");     // اسم المتجر الجديد عند الإنشاء
  const [isInitialLoading, setIsInitialLoading] = useState(true);   // loading أول تحميل

  // ── Data States ───────────────────────────
  const [products, setProducts] = useState([]);  // قائمة المنتجات
  const [orders, setOrders] = useState([]);  // قائمة الطلبات
  const [categories, setCategories] = useState([]);  // قائمة التصنيفات

  // ── Analytics ─────────────────────────────
  // إحصائيات الداشبورد (products, orders, revenue...)
  const [analytics, setAnalytics] = useState({
    totalProducts: 0,
    totalOrders: 0,
    pendingOrders: 0,
    totalRevenue: 0,
    cancelledOrders: 0, // ✦ Day 12
  });

  // ── Category Form ─────────────────────────
  const [categoryName, setCategoryName] = useState(""); // حقل اسم التصنيف الجديد

  // ── Product Form (Add) ────────────────────
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [currentPrice, setCurrentPrice] = useState("");
  const [oldPrice, setOldPrice] = useState("");
  const [image, setImage] = useState("");
  const [images, setImages] = useState("");
  const [stock, setStock] = useState(10); // ✦ Day 09
  const [selectedCategory, setSelectedCategory] = useState("");
  // ── Product Edit (Modal) ──────────────────
  // إذا editingProduct !== null يظهر modal التعديل
  const [editingProduct, setEditingProduct] = useState(null);
  // ✦ stock: نفصل تعديل المخزون عن تعديل المنتج
  const [editingStock, setEditingStock] = useState(null); // { id, value }
  // ✦ Day 11 — Search + Filter
  const [searchProduct, setSearchProduct] = useState(""); // بحث في المنتجات
  const [filterCategory, setFilterCategory] = useState(""); // فلتر بالتصنيف
  const [filterOrder, setFilterOrder] = useState(""); // فلتر الطلبات بالحالة

  // ── Day 14 — Cloudinary Upload ───────────
  const [isUploadingMain, setIsUploadingMain]     = useState(false);
  const [isUploadingEdit, setIsUploadingEdit]     = useState(false);

  // ── Day 15 — Real-time Notifications ─────
  const [newOrdersCount, setNewOrdersCount] = useState(0);
  const lastOrderIdRef = useRef(null); // ✦ useRef بدل useState — يحل مشكلة stale closure في setInterval

  // ── UI ────────────────────────────────────
  const [activeTab, setActiveTab] = useState("overview"); // التبويب النشط
  const [copied, setCopied] = useState(false);      // حالة نسخ الرابط
  const [notification, setNotification] = useState(null);       // إشعار مؤقت
  // ✦ Day 11 — قوائم مفلترة — بدون API calls إضافية
  // فلترة المنتجات حسب البحث والتصنيف
  const filteredProducts = products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(searchProduct.toLowerCase());
    const matchCategory = filterCategory ? p.categoryId?._id === filterCategory || p.categoryId === filterCategory : true;
    return matchSearch && matchCategory;
  });

  // فلترة الطلبات حسب الحالة
  const filteredOrders = filterOrder
    ? orders.filter(o => o.status === filterOrder)
    : orders;

  // ✦ Day 16 — Pagination
  const PRODUCTS_PER_PAGE = 12;
  const ORDERS_PER_PAGE   = 10;
  const [productPage, setProductPage] = useState(1);
  const [orderPage,   setOrderPage]   = useState(1);

  // نرجع للصفحة 1 عند تغيير الفلتر أو البحث
  useEffect(() => { setProductPage(1); }, [searchProduct, filterCategory]);
  useEffect(() => { setOrderPage(1);   }, [filterOrder]);

  const totalProductPages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE);
  const totalOrderPages   = Math.ceil(filteredOrders.length   / ORDERS_PER_PAGE);

  const paginatedProducts = filteredProducts.slice(
    (productPage - 1) * PRODUCTS_PER_PAGE,
    productPage * PRODUCTS_PER_PAGE
  );
  const paginatedOrders = filteredOrders.slice(
    (orderPage - 1) * ORDERS_PER_PAGE,
    orderPage * ORDERS_PER_PAGE
  );
  // ✦ Day 12 — نسبة الإلغاء
  const cancellationRate = analytics.totalOrders > 0
    ? Math.round((analytics.cancelledOrders / analytics.totalOrders) * 100)
    : 0;

  // ✦ Day 12 — إيرادات متوقعة من الطلبات المعلقة
  const deliveredOrders = analytics.totalOrders - analytics.pendingOrders - analytics.cancelledOrders;
  const avgOrderValue = deliveredOrders > 0
    ? Math.round(analytics.totalRevenue / deliveredOrders)
    : 0;
  const pendingRevenue = analytics.pendingOrders * avgOrderValue;

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 🔔 NOTIFICATION HELPER — إظهار إشعار
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const notify = (msg, type = "success") => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3500);
  };

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 🔔 REAL-TIME POLLING — Day 15
  // يراقب الطلبات الجديدة كل 30 ثانية
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  // صوت تنبيه بسيط بدون ملف خارجي (Web Audio API)
  const playNotifSound = () => {
    try {
      const ctx  = new (window.AudioContext || window.webkitAudioContext)();
      const osc  = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type      = "sine";
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.3);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.5);
    } catch (_) { /* المتصفح قد يمنع الصوت بدون تفاعل مسبق */ }
  };

  // دالة الـ polling — تجلب أحدث طلب وتقارنه بآخر ID شوفناه
  const pollNewOrders = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/orders/my-orders`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      const data = await res.json();
      if (!Array.isArray(data) || data.length === 0) return;

      const latestId = data[0]._id; // الطلبات مرتبة desc (الأحدث أولاً)

      // أول تحميل — نحفظ الـ ID بدون إشعار
      if (lastOrderIdRef.current === null) {
        lastOrderIdRef.current = latestId;
        return;
      }

      // طلب جديد جاء؟
      if (lastOrderIdRef.current !== latestId) {
        // نحسب كم طلب جديد وصل
        const prevDate = data.find(o => o._id === lastOrderIdRef.current)?.createdAt;
        const newCount = prevDate
          ? data.filter(o => new Date(o.createdAt) > new Date(prevDate)).length
          : 1;

        lastOrderIdRef.current = latestId; // نحدث الـ ref فوراً

        setNewOrdersCount(c => c + newCount);
        setOrders(data);
        getAnalytics();
        playNotifSound();
        notify(`🛒 ${newCount > 1 ? `${newCount} طلبات جديدة!` : "طلب جديد وصل!"}`, "success");
      }
    } catch (_) {}
  };

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // ☁️ CLOUDINARY UPLOAD — Day 14
  // يرفع الصورة مباشرة من الفرونت بدون باك-أند
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const CLOUDINARY_CLOUD  = "dbcbkly4w";
  const CLOUDINARY_PRESET = "saas_edge";

  const uploadToCloudinary = async (file, setLoading, onSuccess) => {
    // 1. تحقق من النوع والحجم (5MB max)
    if (!file.type.startsWith("image/")) {
      return notify("الملف المختار ليس صورة ❌", "error");
    }
    if (file.size > 5 * 1024 * 1024) {
      return notify("حجم الصورة يتجاوز 5MB ❌", "error");
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("file",        file);
      formData.append("upload_preset", CLOUDINARY_PRESET);

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD}/image/upload`,
        { method: "POST", body: formData }
      );

      if (!res.ok) throw new Error("فشل رفع الصورة");
      const data = await res.json();

      onSuccess(data.secure_url); // ✦ نعطي الـ URL للـ callback
      notify("تم رفع الصورة بنجاح ✅");
    } catch (err) {
      console.error("❌ Cloudinary upload:", err);
      notify("فشل رفع الصورة، حاول مجدداً ❌", "error");
    } finally {
      setLoading(false);
    }
  };

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 📡 API CALLS — استدعاءات الـ API
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  // جلب بيانات المتجر الخاص بالمستخدم
  const getStore = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/stores/my-store`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      // إذا ما عندوش متجر بعد
      if (data.hasStore === false || !data.store) {
        setHasStore(false);
        return false;
      }
      setStore(data.store);
      setHasStore(true);
      return true;
    } catch (err) {
      console.error("❌ getStore:", err);
      return false;
    } finally {
      setIsInitialLoading(false); // نوقفو loading حتى لو فيه خطأ
    }
  };

  // جلب منتجات المتجر
  const getProducts = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/products/my-products`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (Array.isArray(data)) setProducts(data);
    } catch (err) { console.error("❌ getProducts:", err); }
  };

  // جلب طلبات المتجر + تهيئة lastOrderIdRef
  const getOrders = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/orders/my-orders`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (Array.isArray(data)) {
        setOrders(data);
        // ✦ نحفظ أحدث ID كنقطة مرجعية للـ polling
        if (data.length > 0) {
          lastOrderIdRef.current = data[0]._id;
        }
      }
    } catch (err) { console.error("❌ getOrders:", err); }
  };

  // جلب إحصائيات (عدد المنتجات، الطلبات، الإيرادات...)
  const getAnalytics = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/orders/analytics`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) setAnalytics(data);
    } catch (err) { console.error("❌ getAnalytics:", err); }
  };

  // جلب تصنيفات المتجر
  const getCategories = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/categories/my-categories`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (Array.isArray(data)) setCategories(data);
    } catch (err) { console.error("❌ getCategories:", err); }
  };

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 🏪 STORE ACTIONS — عمليات المتجر
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  // إنشاء متجر جديد
  const createStore = async () => {
    if (!storeName.trim()) return notify("أدخل اسم المتجر أولاً", "error");
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/stores/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: storeName }),
      });
      const data = await res.json();
      notify(data.message);
      window.location.reload(); // إعادة تحميل الصفحة بعد الإنشاء
    } catch (err) { console.error("❌ createStore:", err); }
  };

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 📁 CATEGORY ACTIONS — عمليات التصنيفات
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  // إنشاء تصنيف جديد
  const createCategory = async () => {
    if (!categoryName.trim()) return notify("اكتب اسم التصنيف أولاً", "error");
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/categories/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: categoryName }),
      });
      const data = await res.json();
      if (res.ok) {
        notify("تم إنشاء التصنيف بنجاح ✅");
        setCategoryName("");
        getCategories(); // تحديث قائمة التصنيفات
      } else {
        notify(data.message, "error");
      }
    } catch (err) { console.error("❌ createCategory:", err); }
  };

  // حذف تصنيف (سيُفك ارتباط المنتجات به)
  const deleteCategory = async (id) => {
    if (!window.confirm("سيتم فك ارتباط المنتجات بهذا التصنيف. متأكد؟")) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/categories/delete/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        // نحذفو من الـ state مباشرة بدون re-fetch
        setCategories(prev => prev.filter(c => c._id !== id));
        getProducts(); // نعيد جلب المنتجات لأن تصنيفها تغيّر
        notify(data.message);
      } else {
        notify(data.message, "error");
      }
    } catch (err) { console.error("❌ deleteCategory:", err); }
  };

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 📦 PRODUCT ACTIONS — عمليات المنتجات
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  // إضافة منتج جديد
  const createProduct = async () => {
    if (!name.trim() || !currentPrice) return notify("اسم المنتج والسعر مطلوبان", "error");
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/products/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          name, description, currentPrice, oldPrice, image,
          // نحوّل الصور الإضافية من string مفصول بفاصلة إلى array
          images: images ? images.split(",").map(i => i.trim()) : [],
          stock: Number(stock) || 10, // ✦ يتبعث للباك-أند
          categoryId: selectedCategory || null,
        })
      });
      const data = await res.json();
      notify(data.message);
      getProducts();
      getAnalytics();
      // نصفّر حقول الفورم
      setName(""); setDescription(""); setCurrentPrice(""); setOldPrice("");
      setImage(""); setImages(""); setStock(10); setSelectedCategory("");
    } catch (err) { console.error("❌ createProduct:", err); }
  };

  // تعديل منتج موجود (يُستدعى من modal التعديل)
  const updateProduct = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/products/update/${editingProduct._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(editingProduct),
      });
      const data = await res.json();
      if (res.ok) {
        // نحدّث المنتج في الـ state مباشرة بدون re-fetch كامل
        setProducts(prev => prev.map(p => p._id === editingProduct._id ? editingProduct : p));
        setEditingProduct(null); // نغلق الـ modal
        notify(data.message || "تم تحديث المنتج ✅");
        getAnalytics();
        getProducts();
      } else {
        notify(data.message || "فشل التحديث ❌", "error");
      }
    } catch (err) { console.error("❌ updateProduct:", err); }
  };
  // ✦ تعديل المخزون يدوياً
  const updateStock = async () => {
    if (!editingStock) return;
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/products/update/${editingStock.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ stock: Number(editingStock.value) }),
        }
      );
      const data = await res.json();
      if (res.ok) {
        // ✦ نحدث المخزون في الـ state مباشرة
        setProducts(prev =>
          prev.map(p =>
            p._id === editingStock.id
              ? { ...p, stock: Number(editingStock.value) }
              : p
          )
        );
        setEditingStock(null);
        notify("تم تحديث المخزون ✅");
      } else {
        notify(data.message || "فشل التحديث ❌", "error");
      }
    } catch (err) {
      console.error("❌ updateStock:", err);
    }
  };

  // حذف منتج
  const deleteProduct = async (id) => {
    if (!window.confirm("هل أنت متأكد من حذف هذا المنتج؟")) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/products/delete/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        // نحذفو من الـ state مباشرة بدون re-fetch
        setProducts(prev => prev.filter(p => p._id !== id));
        notify(data.message || "تم حذف المنتج ✅");
        getAnalytics();
      } else {
        notify(data.message || "فشل الحذف ❌", "error");
      }
    } catch (err) { console.error("❌ deleteProduct:", err); }
  };

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 🛒 ORDER ACTIONS — عمليات الطلبات
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  // تحديث حالة الطلب إلى "shipped" (تم الشحن)
  const markShipped = async (id) => {
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/api/orders/update-status/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: "shipped" }),
      });
      getOrders();    // تحديث قائمة الطلبات
      getAnalytics(); // تحديث الإحصائيات
      notify("تم تحديث حالة الطلب إلى: تم الشحن 🚚");
    } catch (err) { console.error("❌ markShipped:", err); }
  };

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 🔐 AUTH — تسجيل الخروج
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const logout = () => {
    localStorage.removeItem("token"); // نمسحو التوكن
    navigate("/login");
  };

  // نسخ رابط المتجر
  const copyStoreLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/store/${store?.slug}`);
    setCopied(true);
    notify("تم نسخ الرابط ✅");
    setTimeout(() => setCopied(false), 2000);
  };

  // ✦ Day 13 — Export الطلبات كـ CSV
  const exportCSV = () => {
    if (orders.length === 0) return notify("لا توجد طلبات للتصدير", "error");

    // ✦ رأس الجدول
    const headers = ["الاسم", "الهاتف", "الولاية", "العنوان", "المنتج", "سعر التوصيل", "المبلغ الإجمالي", "الحالة", "التاريخ"];

    // ✦ ترجمة الحالة للعربية
    const translateStatus = (s) =>
      s === "pending" ? "معلق"
      : s === "shipped" ? "مشحون"
      : s === "delivered" ? "موصّل"
      : s === "cancelled" ? "ملغي"
      : s;

    // ✦ تحويل كل طلب لصف — التاريخ بالأرقام اللاتينية باش ما يكسرش Excel
    const rows = orders.map(order => [
      order.customerName || "",
      order.phone || "",
      order.shippingCity || "",
      order.address || "",
      order.productId?.name || "منتج محذوف",
      order.shippingPrice || 0,
      order.totalPrice || 0,
      translateStatus(order.status),
      new Date(order.createdAt).toLocaleDateString("en-CA"), // ✦ YYYY-MM-DD — أرقام لاتينية دائماً
    ]);

    // ✦ دالة تنظيف الخانة: تهرب الـ " وتلف القيمة بـ "..."
    const escapeCell = (cell) => `"${String(cell).replace(/"/g, '""')}"`;

    // ✦ الفاصل ; بدل , — Excel في الجزائر/أوروبا يقرأ ; كفاصل أعمدة
    const SEP = ";";

    // ✦ sep= في أول سطر يخبر Excel صراحةً بالفاصل المستخدم
    const sepHint = `sep=${SEP}\n`;

    const csvContent = [headers, ...rows]
      .map(row => row.map(escapeCell).join(SEP))
      .join("\n");

    // ✦ BOM + sep hint + المحتوى — الثلاثة مطلوبين للعربية في Excel
    const BOM = "\uFEFF";
    const blob = new Blob([BOM + sepHint + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `طلبات-${store?.slug || "متجر"}-${new Date().toLocaleDateString("en-CA")}.csv`;
    link.click();
    URL.revokeObjectURL(url);

    notify(`تم تصدير ${orders.length} طلب بنجاح ✅`);
  };
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 🔁 useEffect — التشغيل عند أول تحميل
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  useEffect(() => {
    if (!token) return navigate("/login"); // إذا ما فيش توكن نرجعو للـ login

    const init = async () => {
      const storeExists = await getStore();

      if (storeExists) {
        await Promise.all([getProducts(), getOrders(), getAnalytics(), getCategories()]);
      }

      // ✦ polling كل 10 ثواني — اكتشاف سريع للطلبات الجديدة
      const pollingInterval = setInterval(pollNewOrders, 10_000);
      return () => clearInterval(pollingInterval);
    };

    init();
  }, []); // [] = يشتغل مرة واحدة فقط عند mount المكون

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // ⏳ LOADING SCREEN — شاشة التحميل
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  if (isInitialLoading) {
    return (
      <>
        <style>{STYLES}</style>
        <div className="loading-screen">
          <div className="loading-inner">
            <div className="loading-logo">SE</div>
            <div className="loading-bar"><div className="loading-bar-fill" /></div>
            <p className="loading-text">جاري تحميل لوحة التحكم...</p>
          </div>
        </div>
      </>
    );
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 🖼️ RENDER — رندر الصفحة الكاملة
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  return (
    <>
      {/* حقن الـ CSS styles المخصصة */}
      <style>{STYLES}</style>

      <div className="app">

        {/* ── إشعار مؤقت في الأعلى ── */}
        {notification && (
          <div className={`toast toast--${notification.type}`}>
            <span>{notification.type === "success" ? "✅" : "❌"}</span>
            <span>{notification.msg}</span>
          </div>
        )}

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            📦 MAIN CONTENT — المحتوى الرئيسي
            (Navbar انتقل لـ AppLayout/TopBar)
        ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <main className="main-content">

          {/* ── حالة: لا يوجد متجر بعد ── */}
          {!hasStore ? (
            <div className="create-store-screen">
              <div className="create-store-card">
                <div className="create-store-icon">🏪</div>
                <h2>أنشئ متجرك الآن</h2>
                <p>اختر اسماً لمتجرك وابدأ البيع خلال ثوانٍ</p>
                <input
                  className="input"
                  placeholder="مثال: متجر الإلكترونيات الذكي"
                  value={storeName}
                  onChange={e => setStoreName(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && createStore()}
                />
                <button className="btn btn--primary btn--full" onClick={createStore}>
                  🚀 إطلاق المتجر
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                  📎 STORE LINK BANNER — بانر رابط المتجر
              ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
              {store && (
                <div className="store-banner">
                  <div className="store-banner__label">🌐 رابط متجرك العام</div>
                  <div className="store-banner__row">
                    <input
                      readOnly
                      className="store-banner__input"
                      value={`${window.location.origin}/store/${store.slug}`}
                    />
                    <button className="btn btn--light" onClick={copyStoreLink}>
                      {copied ? "✅ تم النسخ" : "📋 نسخ الرابط"}
                    </button>
                    {/* زر فتح المتجر في تاب جديد */}
                    <a
                      href={`${window.location.origin}/store/${store.slug}`}
                      target="_blank"
                      rel="noreferrer"
                      className="btn btn--outline-light"
                    >
                      ↗ فتح المتجر
                    </a>
                  </div>
                </div>
              )}

              {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                  📊 STATS GRID — شبكة الإحصائيات
              ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
              <div className="stats-grid">
                <StatCard icon="📦" label="إجمالي المنتجات" value={analytics.totalProducts} color="blue" />
                <StatCard icon="📋" label="إجمالي الطلبات" value={analytics.totalOrders} href="/dashboard/orders" color="green" />
                <StatCard icon="⏳" label="طلبات معلقة" value={analytics.pendingOrders} href="/dashboard/orders" color="amber" />
                <StatCard icon="💰" label="إيرادات مؤكدة" value={`${analytics.totalRevenue.toLocaleString()} DA`} color="violet" />
                {/* ✦ Day 12 */}
                <StatCard icon="❌" label="طلبات ملغاة" value={`${analytics.cancelledOrders} (${cancellationRate}%)`} color="red" />
                <StatCard icon="🔮" label="إيرادات متوقعة" value={`${pendingRevenue.toLocaleString()} DA`} color="emerald" />
              </div>

              {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                  🗂️ TABS — التبويبات
              ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
              <div className="tabs">
                {[
                  { key: "overview", label: "📊 نظرة عامة" },
                  { key: "products", label: "📦 المنتجات" },
                  { key: "categories", label: "📁 التصنيفات" },
                  { key: "orders", label: "🛒 الطلبات" },
                ].map(tab => (
                  <button
                    key={tab.key}
                    className={`tab-btn ${activeTab === tab.key ? "tab-btn--active" : ""}`}
                    onClick={() => setActiveTab(tab.key)} // تغيير التبويب النشط
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                  📊 TAB: OVERVIEW — الطلبات الأخيرة
              ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
              {activeTab === "overview" && (
                <div className="panel">
                  <div className="panel__header">
                    <h2 className="panel__title">🛒 آخر الطلبات</h2>
                    <Link to="/dashboard/orders" className="link-btn">عرض الكل ←</Link>
                  </div>

                  {orders.length === 0 ? (
                    <div className="empty-state">
                      <span>🛒</span>
                      <p>لا توجد طلبات بعد، استمر في الترويج لمتجرك!</p>
                    </div>
                  ) : (
                    <div className="orders-list">
                      {/* نعرض آخر 5 طلبات فقط في الـ overview */}
                      {orders.slice(0, 5).map(order => (
                        <div key={order._id} className="order-row">
                          <div className="order-row__avatar">
                            {/* أول حرف من اسم الزبون كـ avatar */}
                            {order.customerName?.charAt(0).toUpperCase()}
                          </div>
                          <div className="order-row__info">
                            <span className="order-row__name">{order.customerName}</span>
                            <span className="order-row__meta">
                              {order.phone} • {order.productId?.name}
                            </span>
                          </div>
                          <div className="order-row__actions">
                            <StatusBadge status={order.status} />
                            {/* زر الشحن يظهر فقط للطلبات المعلقة */}
                            {order.status === "pending" && (
                              <button
                                className="btn btn--success btn--sm"
                                onClick={() => markShipped(order._id)}
                              >
                                🚚 شحن
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                  📦 TAB: PRODUCTS — المنتجات
              ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
              {activeTab === "products" && (
                <>
                  {/* ── فورم إضافة منتج جديد ── */}
                  <div className="panel">
                    <div className="panel__header">
                      <h2 className="panel__title">✨ إضافة منتج جديد</h2>
                    </div>
                    <div className="product-form">
                      {/* عمود يسار: المعلومات النصية */}
                      <div className="product-form__col">
                        <input
                          className="input"
                          placeholder="اسم المنتج *"
                          value={name}
                          onChange={e => setName(e.target.value)}
                        />
                        <textarea
                          className="input input--textarea"
                          placeholder="وصف تفصيلي للمنتج"
                          value={description}
                          onChange={e => setDescription(e.target.value)}
                        />
                        {/* select التصنيف — يُعبّأ ديناميكياً من قائمة التصنيفات */}
                        <select
                          className="input input--select"
                          value={selectedCategory}
                          onChange={e => setSelectedCategory(e.target.value)}
                        >
                          <option value="">اختر تصنيفاً (اختياري)</option>
                          {categories.map(cat => (
                            <option key={cat._id} value={cat._id}>{cat.name}</option>
                          ))}
                        </select>
                      </div>

                      {/* عمود يمين: الأسعار والصور */}
                      <div className="product-form__col">
                        <div className="input-row">
                          <input
                            className="input"
                            type="number"
                            placeholder="السعر الحالي (DA) *"
                            value={currentPrice}
                            onChange={e => setCurrentPrice(e.target.value)}
                          />
                          <input
                            className="input"
                            type="number"
                            placeholder="السعر القديم (DA)"
                            value={oldPrice}
                            onChange={e => setOldPrice(e.target.value)}
                          />
                          {/* ✦ حقل المخزون — التاجر يحدد كم عنده من البداية */}
                          <input
                            className="input"
                            type="number"
                            min="0"
                            placeholder="المخزون (عدد القطع) — افتراضي 10"
                            value={stock}
                            onChange={e => setStock(e.target.value)}
                          />
                        </div>
                        {/* ✦ Day 14 — رفع الصورة الرئيسية لـ Cloudinary */}
                        <div style={{
                          border: "1px solid var(--border)",
                          borderRadius: "12px",
                          overflow: "hidden",
                        }}>
                          {/* معاينة الصورة إذا موجودة */}
                          {image && image !== OLD_UNSPLASH && (
                            <div style={{ position: "relative", height: "140px", background: "#0a0f1a" }}>
                              <img
                                src={image}
                                alt="معاينة"
                                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                onError={e => { e.target.onerror = null; e.target.src = DEFAULT_IMG; }}
                              />
                              {/* زر حذف الصورة */}
                              <button
                                onClick={() => setImage("")}
                                style={{
                                  position: "absolute", top: "8px", left: "8px",
                                  background: "rgba(0,0,0,.7)", border: "none",
                                  color: "#fff", borderRadius: "8px",
                                  width: "28px", height: "28px", cursor: "pointer",
                                  fontSize: ".9rem", display: "flex",
                                  alignItems: "center", justifyContent: "center",
                                }}
                              >✕</button>
                            </div>
                          )}
                          {/* زر الرفع */}
                          <label style={{
                            display: "flex", alignItems: "center", justifyContent: "center",
                            gap: "10px", padding: "14px",
                            cursor: isUploadingMain ? "not-allowed" : "pointer",
                            background: "rgba(255,255,255,.03)",
                            color: isUploadingMain ? "var(--text-mute)" : "var(--accent2)",
                            fontSize: ".9rem", fontWeight: "600",
                            transition: "background .2s",
                          }}
                            onMouseEnter={e => !isUploadingMain && (e.currentTarget.style.background = "rgba(99,102,241,.08)")}
                            onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,.03)")}
                          >
                            {isUploadingMain
                              ? <><span style={{ animation: "spin 1s linear infinite", display: "inline-block" }}>⏳</span> جاري الرفع...</>
                              : <>{image ? "🔄 تغيير الصورة" : "📤 رفع صورة المنتج"}</>
                            }
                            <input
                              type="file"
                              accept="image/*"
                              style={{ display: "none" }}
                              disabled={isUploadingMain}
                              onChange={e => {
                                const file = e.target.files?.[0];
                                if (file) uploadToCloudinary(file, setIsUploadingMain, url => setImage(url));
                                e.target.value = ""; // reset باش يقدر يرفع نفس الملف مجدداً
                              }}
                            />
                          </label>
                        </div>
                        <input
                          className="input"
                          placeholder="صور إضافية (مفصولة بفاصلة)"
                          value={images}
                          onChange={e => setImages(e.target.value)}
                        />
                        <button className="btn btn--primary btn--full" onClick={createProduct}>
                          + إضافة المنتج للمتجر
                        </button>
                      </div>
                    </div>
                  </div>
                  {/* ── شبكة عرض المنتجات ── */}
                  <div className="panel">
                    <div className="panel__header">
                      <h2 className="panel__title">📦 كتالوج المنتجات</h2>
                      <span className="badge badge--gray">{filteredProducts.length} / {products.length} منتج</span>
                    </div>

                    {/* ✦ شريط البحث والفلتر */}
                    <div style={{ display: "flex", gap: "12px", marginBottom: "20px", flexWrap: "wrap" }}>
                      <input
                        className="input"
                        placeholder="🔍 ابحث عن منتج..."
                        value={searchProduct}
                        onChange={e => setSearchProduct(e.target.value)}
                        style={{ flex: "1", minWidth: "200px" }}
                      />
                      <select
                        className="input input--select"
                        value={filterCategory}
                        onChange={e => setFilterCategory(e.target.value)}
                        style={{ flex: "1", minWidth: "160px", maxWidth: "220px" }}
                      >
                        <option value="">كل التصنيفات</option>
                        {categories.map(cat => (
                          <option key={cat._id} value={cat._id}>{cat.name}</option>
                        ))}
                      </select>
                      {/* ✦ زر مسح الفلتر */}
                      {(searchProduct || filterCategory) && (
                        <button
                          className="btn btn--ghost"
                          onClick={() => { setSearchProduct(""); setFilterCategory(""); }}
                        >
                          ✕ مسح
                        </button>
                      )}
                    </div>
                    {filteredProducts.length === 0 ? (
                      <div className="empty-state">
                        <span>📦</span>
                        <p>{products.length === 0 ? "لا توجد منتجات بعد. أضف أول منتج!" : "لا توجد نتائج للبحث"}</p>
                      </div>
                    ) : (
                      <div className="products-grid">
                        {paginatedProducts.map(product => (
                          <div key={product._id} className="product-card">
                            {/* صورة المنتج */}
                            <div className="product-card__img-wrap">
                              <img
                                src={resolveImg(product.image)}
                                alt={product.name}
                                className="product-card__img"
                                onError={e => { e.target.onerror = null; e.target.src = DEFAULT_IMG; }}
                              />
                              {/* بادج التصنيف فوق الصورة */}
                              {product.categoryId && (
                                <span className="product-card__cat">
                                  {typeof product.categoryId === "object"
                                    ? product.categoryId.name
                                    : "تصنيف"}
                                </span>
                              )}
                            </div>

                            {/* معلومات المنتج */}
                            <div className="product-card__body">
                              <h3 className="product-card__name">{product.name}</h3>
                              <p className="product-card__desc">{product.description}</p>
                              <div className="product-card__price">
                                <span className="product-card__current">{product.currentPrice} DA</span>
                                {/* السعر القديم يظهر فقط إذا موجود */}
                                {product.oldPrice && (
                                  <span className="product-card__old">{product.oldPrice} DA</span>
                                )}
                              </div>
                              {/* ✦ بادج المخزون */}
                              <div style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                background: "rgba(255,255,255,0.03)",
                                border: "1px solid rgba(255,255,255,0.07)",
                                borderRadius: "10px",
                                padding: "8px 12px",
                                marginBottom: "4px",
                              }}>
                                <span style={{ fontSize: ".8rem", color: "var(--text-mute)" }}>
                                  المخزون
                                </span>
                                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                  {/* ✦ لو بنعدل هذا المنتج نعرض input، غير هيك نعرض الرقم */}
                                  {editingStock?.id === product._id ? (
                                    <div style={{ display: "flex", gap: "6px" }}>
                                      <input
                                        type="number"
                                        min="0"
                                        value={editingStock.value}
                                        onChange={e =>
                                          setEditingStock({ ...editingStock, value: e.target.value })
                                        }
                                        onKeyDown={e => e.key === "Enter" && updateStock()}
                                        style={{
                                          width: "64px",
                                          background: "rgba(99,102,241,0.1)",
                                          border: "1px solid var(--accent)",
                                          borderRadius: "6px",
                                          padding: "3px 8px",
                                          color: "#fff",
                                          fontSize: ".85rem",
                                          outline: "none",
                                          textAlign: "center",
                                        }}
                                        autoFocus
                                      />
                                      {/* زر حفظ */}
                                      <button
                                        className="btn btn--success btn--sm"
                                        onClick={updateStock}
                                      >
                                        ✓
                                      </button>
                                      {/* زر إلغاء */}
                                      <button
                                        className="btn btn--ghost btn--sm"
                                        onClick={() => setEditingStock(null)}
                                      >
                                        ✕
                                      </button>
                                    </div>
                                  ) : (
                                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                      {/* ✦ لون الرقم حسب الكمية */}
                                      <span style={{
                                        fontFamily: "'Space Mono', monospace",
                                        fontWeight: "700",
                                        fontSize: ".95rem",
                                        color: product.stock === 0
                                          ? "var(--red)"          // أحمر إذا نفد
                                          : product.stock <= 5
                                            ? "var(--amber)"        // أصفر إذا قليل
                                            : "var(--green)",       // أخضر إذا كافي
                                      }}>
                                        {product.stock ?? 0}
                                      </span>
                                      {/* ✦ بادج نفد */}
                                      {product.stock === 0 && (
                                        <span style={{
                                          fontSize: ".68rem", fontWeight: "700",
                                          background: "rgba(239,68,68,0.1)",
                                          border: "1px solid rgba(239,68,68,0.3)",
                                          color: "var(--red)",
                                          padding: "2px 7px", borderRadius: "99px",
                                        }}>
                                          نفد
                                        </span>
                                      )}
                                      {/* ✦ تحذير إذا stock ≤ 5 */}
                                      {product.stock > 0 && product.stock <= 5 && (
                                        <span style={{
                                          fontSize: ".68rem", fontWeight: "700",
                                          background: "rgba(245,158,11,0.1)",
                                          border: "1px solid rgba(245,158,11,0.3)",
                                          color: "var(--amber)",
                                          padding: "2px 7px", borderRadius: "99px",
                                        }}>
                                          قليل
                                        </span>
                                      )}
                                      {/* ✦ زر تعديل المخزون */}
                                      <button
                                        className="btn btn--ghost btn--sm"
                                        onClick={() => setEditingStock({ id: product._id, value: product.stock ?? 0 })}
                                        title="تعديل المخزون"
                                        style={{ padding: "3px 8px", fontSize: ".75rem" }}
                                      >
                                        ✏️
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </div>

                              <div className="product-card__actions">
                                <button
                                  className="btn btn--warning btn--sm"
                                  onClick={() => setEditingProduct(product)}
                                >
                                  ✏️ تعديل
                                </button>
                                <button
                                  className="btn btn--danger btn--sm"
                                  onClick={() => deleteProduct(product._id)}
                                >
                                  🗑️ حذف
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* ✦ Day 16 — Pagination المنتجات */}
                  {totalProductPages > 1 && (
                    <div style={{
                      display: "flex", alignItems: "center", justifyContent: "center",
                      gap: "8px", marginTop: "24px", flexWrap: "wrap",
                    }}>
                      <button
                        className="btn btn--ghost btn--sm"
                        disabled={productPage === 1}
                        onClick={() => setProductPage(p => p - 1)}
                      >← السابق</button>

                      {Array.from({ length: totalProductPages }, (_, i) => i + 1).map(page => (
                        <button
                          key={page}
                          className={`btn btn--sm ${productPage === page ? "btn--primary" : "btn--ghost"}`}
                          onClick={() => setProductPage(page)}
                          style={{ minWidth: "36px" }}
                        >{page}</button>
                      ))}

                      <button
                        className="btn btn--ghost btn--sm"
                        disabled={productPage === totalProductPages}
                        onClick={() => setProductPage(p => p + 1)}
                      >التالي →</button>

                      <span style={{ color: "var(--text-mute)", fontSize: ".8rem", marginRight: "8px" }}>
                        {(productPage - 1) * PRODUCTS_PER_PAGE + 1}–{Math.min(productPage * PRODUCTS_PER_PAGE, filteredProducts.length)} من {filteredProducts.length}
                      </span>
                    </div>
                  )}
                </>
              )}

              {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                  📁 TAB: CATEGORIES — التصنيفات
              ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
              {activeTab === "categories" && (
                <div className="panel">
                  <div className="panel__header">
                    <h2 className="panel__title">📁 إدارة التصنيفات</h2>
                  </div>

                  {/* فورم إضافة تصنيف */}
                  <div className="cat-form">
                    <input
                      className="input"
                      placeholder="اسم التصنيف الجديد (مثال: إلكترونيات، أحذية...)"
                      value={categoryName}
                      onChange={e => setCategoryName(e.target.value)}
                      onKeyDown={e => e.key === "Enter" && createCategory()}
                    />
                    <button className="btn btn--primary" onClick={createCategory}>
                      + إضافة تصنيف
                    </button>
                  </div>

                  {/* قائمة التصنيفات */}
                  <div className="cat-list">
                    {categories.length === 0 ? (
                      <p className="empty-text">لا توجد تصنيفات بعد. أضف أول تصنيف!</p>
                    ) : (
                      categories.map(cat => (
                        <div key={cat._id} className="cat-chip">
                          <span>{cat.name}</span>
                          {/* زر حذف التصنيف */}
                          <button
                            className="cat-chip__del"
                            onClick={() => deleteCategory(cat._id)}
                            title="حذف التصنيف"
                          >
                            ✕
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                  🛒 TAB: ORDERS — الطلبات الكاملة
              ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
              {activeTab === "orders" && (
                <div className="panel">
                  <div className="panel__header">
                    <h2 className="panel__title">🛒 جميع الطلبات</h2>
                    <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                      {/* ✦ Day 13 — زر Export CSV */}
                      <button
                        className="btn btn--ghost btn--sm"
                        onClick={exportCSV}
                        title="تحميل الطلبات كـ Excel"
                      >
                        📥 تصدير CSV
                      </button>
                      <Link to="/dashboard/orders" className="link-btn">صفحة الطلبات الكاملة ←</Link>
                    </div>
                  </div>

                  {/* ✦ فلتر الطلبات بالحالة */}
                  <div style={{ display: "flex", gap: "8px", marginBottom: "16px", flexWrap: "wrap" }}>
                    {[
                      { val: "", label: "الكل" },
                      { val: "pending", label: "⏳ معلق" },
                      { val: "shipped", label: "📦 مشحون" },
                      { val: "delivered", label: "✅ موصّل" },
                      { val: "cancelled", label: "❌ ملغي" },
                    ].map(f => (
                      <button
                        key={f.val}
                        className={`btn btn--sm ${filterOrder === f.val ? "btn--primary" : "btn--ghost"}`}
                        onClick={() => setFilterOrder(f.val)}
                      >
                        {f.label}
                        <span style={{
                          background: "rgba(255,255,255,0.15)",
                          borderRadius: "99px",
                          padding: "1px 7px",
                          fontSize: ".72rem",
                          marginRight: "4px",
                        }}>
                          {f.val === "" ? orders.length : orders.filter(o => o.status === f.val).length}
                        </span>
                      </button>
                    ))}
                  </div>
                  {filteredOrders.length === 0 ? (
                    <div className="empty-state">
                      <span>🛒</span>
                      <p>{orders.length === 0 ? "لا توجد طلبات بعد" : "لا توجد طلبات بهذه الحالة"}</p>
                    </div>
                  ) : (
                    <div className="orders-list">
                      {paginatedOrders.map(order => (

                        <div key={order._id} className="order-row">
                          <div className="order-row__avatar">
                            {order.customerName?.charAt(0).toUpperCase()}
                          </div>
                          <div className="order-row__info">
                            <span className="order-row__name">{order.customerName}</span>
                            <span className="order-row__meta">
                              {order.phone} • {order.productId?.name}
                            </span>
                          </div>
                          <div className="order-row__actions">
                            <StatusBadge status={order.status} />
                            {order.status === "pending" && (
                              <button
                                className="btn btn--success btn--sm"
                                onClick={() => markShipped(order._id)}
                              >
                                🚚 شحن
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                  

                  {/* ✦ Day 16 — Pagination الطلبات */}
                  {totalOrderPages > 1 && (
                    <div style={{
                      display: "flex", alignItems: "center", justifyContent: "center",
                      gap: "8px", marginTop: "20px", flexWrap: "wrap",
                    }}>
                      <button
                        className="btn btn--ghost btn--sm"
                        disabled={orderPage === 1}
                        onClick={() => setOrderPage(p => p - 1)}
                      >← السابق</button>

                      {Array.from({ length: totalOrderPages }, (_, i) => i + 1).map(page => (
                        <button
                          key={page}
                          className={`btn btn--sm ${orderPage === page ? "btn--primary" : "btn--ghost"}`}
                          onClick={() => setOrderPage(page)}
                          style={{ minWidth: "36px" }}
                        >{page}</button>
                      ))}

                      <button
                        className="btn btn--ghost btn--sm"
                        disabled={orderPage === totalOrderPages}
                        onClick={() => setOrderPage(p => p + 1)}
                      >التالي →</button>

                      <span style={{ color: "var(--text-mute)", fontSize: ".8rem", marginRight: "8px" }}>
                        {(orderPage - 1) * ORDERS_PER_PAGE + 1}–{Math.min(orderPage * ORDERS_PER_PAGE, filteredOrders.length)} من {filteredOrders.length}
                      </span>
                    </div>
                  )}
               </div>
                  )}
                </div>
              )}
            </>
          )}
        </main>

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            ✏️ EDIT MODAL — modal تعديل المنتج
            يظهر فقط إذا editingProduct !== null
        ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        {editingProduct && (
          <div className="modal-overlay" onClick={() => setEditingProduct(null)}>
            {/* stopPropagation: منعاش يُغلق الـ modal عند النقر داخله */}
            <div className="modal" onClick={e => e.stopPropagation()}>
              <div className="modal__header">
                <h2 className="modal__title">✏️ تعديل المنتج</h2>
                <button className="modal__close" onClick={() => setEditingProduct(null)}>✕</button>
              </div>

              <div className="modal__body">
                <input
                  className="input"
                  placeholder="اسم المنتج"
                  value={editingProduct.name}
                  onChange={e => setEditingProduct({ ...editingProduct, name: e.target.value })}
                />
                <textarea
                  className="input input--textarea"
                  placeholder="الوصف"
                  value={editingProduct.description}
                  onChange={e => setEditingProduct({ ...editingProduct, description: e.target.value })}
                />
                <input
                  className="input"
                  type="number"
                  placeholder="السعر (DA)"
                  value={editingProduct.currentPrice}
                  onChange={e => setEditingProduct({ ...editingProduct, currentPrice: e.target.value })}
                />
                {/* ✦ حقل المخزون في modal التعديل */}
                <input
                  className="input"
                  type="number"
                  min="0"
                  placeholder="المخزون (عدد القطع)"
                  value={editingProduct.stock ?? 0}
                  onChange={e =>
                    setEditingProduct({ ...editingProduct, stock: Number(e.target.value) })
                  }
                />
                {/* ✦ Day 14 — رفع الصورة في modal التعديل */}
                <div style={{
                  border: "1px solid var(--border)",
                  borderRadius: "12px",
                  overflow: "hidden",
                }}>
                  {/* معاينة الصورة الحالية */}
                  {editingProduct.image &&
                   editingProduct.image !== OLD_UNSPLASH &&
                   editingProduct.image !== DEFAULT_IMG && (
                    <div style={{ position: "relative", height: "140px", background: "#0a0f1a" }}>
                      <img
                        src={editingProduct.image}
                        alt="معاينة"
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        onError={e => { e.target.onerror = null; e.target.src = DEFAULT_IMG; }}
                      />
                      <button
                        onClick={() => setEditingProduct({ ...editingProduct, image: "" })}
                        style={{
                          position: "absolute", top: "8px", left: "8px",
                          background: "rgba(0,0,0,.7)", border: "none",
                          color: "#fff", borderRadius: "8px",
                          width: "28px", height: "28px", cursor: "pointer",
                          fontSize: ".9rem", display: "flex",
                          alignItems: "center", justifyContent: "center",
                        }}
                      >✕</button>
                    </div>
                  )}
                  {/* زر الرفع */}
                  <label style={{
                    display: "flex", alignItems: "center", justifyContent: "center",
                    gap: "10px", padding: "14px",
                    cursor: isUploadingEdit ? "not-allowed" : "pointer",
                    background: "rgba(255,255,255,.03)",
                    color: isUploadingEdit ? "var(--text-mute)" : "var(--accent2)",
                    fontSize: ".9rem", fontWeight: "600",
                    transition: "background .2s",
                  }}
                    onMouseEnter={e => !isUploadingEdit && (e.currentTarget.style.background = "rgba(99,102,241,.08)")}
                    onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,.03)")}
                  >
                    {isUploadingEdit
                      ? <><span style={{ animation: "spin 1s linear infinite", display: "inline-block" }}>⏳</span> جاري الرفع...</>
                      : <>{editingProduct.image && editingProduct.image !== OLD_UNSPLASH && editingProduct.image !== DEFAULT_IMG ? "🔄 تغيير الصورة" : "📤 رفع صورة المنتج"}</>
                    }
                    <input
                      type="file"
                      accept="image/*"
                      style={{ display: "none" }}
                      disabled={isUploadingEdit}
                      onChange={e => {
                        const file = e.target.files?.[0];
                        if (file) uploadToCloudinary(
                          file,
                          setIsUploadingEdit,
                          url => setEditingProduct({ ...editingProduct, image: url })
                        );
                        e.target.value = "";
                      }}
                    />
                  </label>
                </div>
              </div>

              <div className="modal__footer">
                <button className="btn btn--primary btn--full" onClick={updateProduct}>
                  💾 حفظ التغييرات
                </button>
                <button
                  className="btn btn--ghost btn--full"
                  onClick={() => setEditingProduct(null)}
                >
                  إلغاء
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🎨 STYLES — CSS مخصص (Design System احترافي)
// يتم حقنه عبر <style>{STYLES}</style> في الـ JSX
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const STYLES = `
  /* ── Google Fonts ── */
  @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@300;400;500;600;700&family=Space+Mono:wght@400;700&display=swap');

  /* ── CSS Variables (Design Tokens) ── */
  :root {
    --bg:        #080c14;
    --bg2:       #0d1220;
    --bg3:       #111827;
    --border:    rgba(255,255,255,0.07);
    --text:      #e2e8f0;
    --text-mute: #64748b;
    --accent:    #6366f1;
    --accent2:   #818cf8;
    --green:     #10b981;
    --amber:     #f59e0b;
    --red:       #ef4444;
    --violet:    #a78bfa;
    --radius:    16px;
    --radius-lg: 24px;
    --shadow:    0 4px 24px rgba(0,0,0,0.4);
  }

  /* ── Reset & Base ── */
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  /* RTL الإتجاه العربي */
  .app {
    direction: rtl;
    font-family: 'IBM Plex Sans Arabic', sans-serif;
    background: var(--bg);
    color: var(--text);
    min-height: 100vh;
  }

  /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     NOTIFICATION BELL — Day 15
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
  .notif-bell {
    position: relative;
    width: 38px; height: 38px;
    border-radius: 10px;
    background: rgba(255,255,255,.05);
    border: 1px solid var(--border);
    color: var(--text-mute);
    display: flex; align-items: center; justify-content: center;
    cursor: pointer;
    transition: all .2s ease;
    flex-shrink: 0;
  }
  .notif-bell:hover {
    background: rgba(255,255,255,.1);
    color: var(--text);
    border-color: rgba(255,255,255,.15);
  }
  /* جرس يتأرجح عند وصول طلب جديد */
  .notif-bell--ringing svg {
    animation: bell-ring .6s ease infinite;
    transform-origin: top center;
  }
  @keyframes bell-ring {
    0%,100% { transform: rotate(0deg); }
    20%      { transform: rotate(15deg); }
    40%      { transform: rotate(-15deg); }
    60%      { transform: rotate(10deg); }
    80%      { transform: rotate(-10deg); }
  }
  /* البادج الأحمر فوق الجرس */
  .notif-bell__badge {
    position: absolute;
    top: -5px; left: -5px;
    background: var(--red);
    color: #fff;
    font-size: .6rem;
    font-weight: 800;
    font-family: 'Space Mono', monospace;
    min-width: 17px; height: 17px;
    border-radius: 99px;
    display: flex; align-items: center; justify-content: center;
    padding: 0 3px;
    box-shadow: 0 0 0 2px var(--bg);
    animation: badge-pop .3s cubic-bezier(.175,.885,.32,1.275);
  }
  @keyframes badge-pop {
    from { transform: scale(0); }
    to   { transform: scale(1); }
  }

  /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     LOADING SCREEN
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
  .loading-screen {
    min-height: 100vh;
    background: var(--bg);
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .loading-inner { text-align: center; }
  .loading-logo {
    width: 72px; height: 72px;
    background: linear-gradient(135deg, var(--accent), var(--violet));
    border-radius: 20px;
    display: flex; align-items: center; justify-content: center;
    font-family: 'Space Mono', monospace;
    font-size: 1.5rem; font-weight: 700; color: #fff;
    margin: 0 auto 24px;
    box-shadow: 0 0 40px rgba(99,102,241,0.5);
    animation: pulse 2s infinite;
  }
  /* شريط التحميل المتحرك */
  .loading-bar {
    width: 200px; height: 3px;
    background: var(--bg3);
    border-radius: 99px;
    margin: 16px auto;
    overflow: hidden;
  }
  .loading-bar-fill {
    height: 100%;
    background: linear-gradient(90deg, var(--accent), var(--violet));
    animation: loading 1.8s ease-in-out infinite;
  }
  @keyframes loading {
    0% { width: 0%; margin-right: 100%; }
    50% { width: 70%; margin-right: 0%; }
    100% { width: 0%; margin-right: 100%; }
  }
  @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
  @keyframes pulse { 0%,100%{box-shadow:0 0 40px rgba(99,102,241,.5)} 50%{box-shadow:0 0 60px rgba(99,102,241,.9)} }
  .loading-text { color: var(--text-mute); font-size: .85rem; }

  /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     TOAST NOTIFICATION
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
  .toast {
    position: fixed; top: 20px; left: 50%; transform: translateX(-50%);
    background: var(--bg2);
    border: 1px solid var(--border);
    padding: 12px 24px;
    border-radius: 99px;
    display: flex; align-items: center; gap: 8px;
    font-size: .9rem; font-weight: 500;
    z-index: 9999;
    animation: slideDown .3s ease;
    box-shadow: var(--shadow);
  }
  .toast--success { border-color: rgba(16,185,129,.3); color: #6ee7b7; }
  .toast--error   { border-color: rgba(239,68,68,.3);  color: #fca5a5; }
  @keyframes slideDown { from{opacity:0;transform:translateX(-50%) translateY(-10px)} to{opacity:1;transform:translateX(-50%) translateY(0)} }

  /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     NAVBAR
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
  .navbar {
    background: rgba(8,12,20,.9);
    backdrop-filter: blur(20px);
    border-bottom: 1px solid var(--border);
    position: sticky; top: 0; z-index: 100;
  }
  .navbar__inner {
    max-width: 1200px; margin: 0 auto;
    padding: 0 24px; height: 64px;
    display: flex; align-items: center; justify-content: space-between;
  }
  .navbar__brand { display: flex; align-items: center; gap: 12px; }
  .navbar__logo {
    width: 38px; height: 38px;
    background: linear-gradient(135deg, var(--accent), var(--violet));
    border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    font-family: 'Space Mono', monospace;
    font-size: .8rem; font-weight: 700; color: #fff;
  }
  .navbar__title {
    font-size: 1.2rem; font-weight: 700; color: #fff;
    letter-spacing: -0.5px;
  }
  .navbar__title span { color: var(--accent2); }
  .navbar__links { display: flex; align-items: center; gap: 10px; }

  /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     BUTTONS
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
  .btn {
    display: inline-flex; align-items: center; justify-content: center;
    gap: 6px; padding: 8px 18px;
    border-radius: 10px; border: none;
    font-family: inherit; font-size: .88rem; font-weight: 600;
    cursor: pointer; transition: all .2s ease;
    text-decoration: none;
  }
  .btn:hover { transform: translateY(-1px); }
  .btn:active { transform: translateY(0); }
  .btn--primary  { background: var(--accent); color: #fff; }
  .btn--primary:hover { background: var(--accent2); }
  .btn--success  { background: rgba(16,185,129,.15); color: var(--green); border: 1px solid rgba(16,185,129,.3); }
  .btn--success:hover { background: var(--green); color: #fff; }
  .btn--warning  { background: rgba(245,158,11,.1); color: var(--amber); border: 1px solid rgba(245,158,11,.3); }
  .btn--warning:hover { background: var(--amber); color: #fff; }
  .btn--danger   { background: rgba(239,68,68,.1); color: var(--red); border: 1px solid rgba(239,68,68,.2); }
  .btn--danger:hover { background: var(--red); color: #fff; }
  .btn--ghost    { background: transparent; color: var(--text-mute); border: 1px solid var(--border); }
  .btn--ghost:hover { background: var(--bg3); color: var(--text); }
  .btn--outline  { background: transparent; color: var(--text-mute); border: 1px solid var(--border); }
  .btn--outline:hover { border-color: var(--accent); color: var(--accent2); }
  .btn--light    { background: rgba(255,255,255,.08); color: #fff; border: 1px solid var(--border); }
  .btn--outline-light { background: transparent; color: var(--accent2); border: 1px solid rgba(99,102,241,.4); }
  .btn--full     { width: 100%; }
  .btn--sm       { padding: 5px 12px; font-size: .8rem; }

  /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     NAV BUTTONS (navbar specific)
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
  .nav-btn { padding: 7px 16px; border-radius: 8px; font-size: .85rem; font-weight: 600; cursor: pointer; border: none; font-family: inherit; text-decoration: none; display: inline-flex; align-items: center; gap: 5px; transition: all .2s; }
  .nav-btn--outline { background: rgba(255,255,255,.05); color: var(--text-mute); border: 1px solid var(--border); }
  .nav-btn--outline:hover { background: rgba(255,255,255,.1); color: var(--text); }
  .nav-btn--danger  { background: rgba(239,68,68,.1); color: #fca5a5; border: 1px solid rgba(239,68,68,.2); }
  .nav-btn--danger:hover { background: var(--red); color: #fff; }

  /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     MAIN CONTENT
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
  .main-content {
    max-width: 1200px; margin: 0 auto;
    padding: 32px 24px 80px;
    display: flex; flex-direction: column; gap: 24px;
  }

  /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     CREATE STORE SCREEN
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
  .create-store-screen {
    min-height: calc(100vh - 64px);
    display: flex; align-items: center; justify-content: center;
  }
  .create-store-card {
    background: var(--bg2);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    padding: 48px; text-align: center;
    max-width: 460px; width: 100%;
    box-shadow: var(--shadow);
  }
  .create-store-icon { font-size: 3.5rem; margin-bottom: 16px; }
  .create-store-card h2 { font-size: 1.8rem; font-weight: 700; margin-bottom: 8px; }
  .create-store-card p { color: var(--text-mute); margin-bottom: 24px; }

  /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     STORE BANNER
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
  .store-banner {
    background: linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%);
    border: 1px solid rgba(99,102,241,.3);
    border-radius: var(--radius-lg);
    padding: 24px 28px;
    position: relative; overflow: hidden;
  }
  .store-banner::before {
    content: '🛒';
    position: absolute; left: -10px; bottom: -20px;
    font-size: 120px; opacity: .04; pointer-events: none;
  }
  .store-banner__label {
    font-size: .8rem; font-weight: 600;
    color: var(--accent2); letter-spacing: .5px;
    text-transform: uppercase; margin-bottom: 12px;
  }
  .store-banner__row {
    display: flex; gap: 10px; flex-wrap: wrap;
  }
  .store-banner__input {
    flex: 1; min-width: 200px;
    background: rgba(255,255,255,.06);
    border: 1px solid rgba(255,255,255,.1);
    border-radius: 10px; padding: 10px 16px;
    color: #fff; font-family: 'Space Mono', monospace;
    font-size: .85rem; outline: none;
  }

  /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     STATS GRID
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 16px;
  }
  .stat-card {
    background: var(--bg2);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 20px 24px;
    display: flex; align-items: center; gap: 16px;
    position: relative; overflow: hidden;
    transition: all .25s ease;
    text-decoration: none;
    color: inherit;
  }
  .stat-card:hover { transform: translateY(-3px); box-shadow: var(--shadow); }
  .stat-card__icon {
    font-size: 1.8rem;
    width: 52px; height: 52px;
    border-radius: 14px;
    display: flex; align-items: center; justify-content: center;
    background: rgba(255,255,255,.05);
    flex-shrink: 0;
  }
  .stat-card__body { flex: 1; }
  .stat-card__label { display: block; font-size: .78rem; color: var(--text-mute); font-weight: 500; margin-bottom: 4px; }
  .stat-card__value { display: block; font-size: 1.6rem; font-weight: 800; font-family: 'Space Mono', monospace; letter-spacing: -1px; }
  /* ألوان بطاقات الإحصائيات */
  .stat-card--blue .stat-card__value   { color: #60a5fa; }
  .stat-card--green .stat-card__value  { color: var(--green); }
  .stat-card--amber .stat-card__value  { color: var(--amber); }
  .stat-card--violet .stat-card__value { color: var(--violet); }
  .stat-card--blue:hover   { border-color: rgba(96,165,250,.3); }
  .stat-card--green:hover  { border-color: rgba(16,185,129,.3); }
  .stat-card--amber:hover  { border-color: rgba(245,158,11,.3); }
  .stat-card--violet:hover { border-color: rgba(167,139,250,.3); }
  /* توهج خلف البطاقة */
  .stat-card__glow {
    position: absolute; width: 80px; height: 80px;
    border-radius: 50%; filter: blur(30px); opacity: .1;
    left: -20px; bottom: -20px; pointer-events: none;
  }
  .stat-card--blue .stat-card__glow   { background: #60a5fa; }
  .stat-card--green .stat-card__glow  { background: var(--green); }
  .stat-card--amber .stat-card__glow  { background: var(--amber); }
  .stat-card--violet .stat-card__glow { background: var(--violet); }
  /* ✦ Day 12 */
.stat-card--red .stat-card__value    { color: var(--red); }
.stat-card--red:hover                { border-color: rgba(239,68,68,.3); }
.stat-card--red .stat-card__glow     { background: var(--red); }
.stat-card--emerald .stat-card__value { color: #34d399; }
.stat-card--emerald:hover            { border-color: rgba(52,211,153,.3); }
.stat-card--emerald .stat-card__glow  { background: #34d399; }

  /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     TABS
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
  .tabs {
    display: flex; gap: 6px; flex-wrap: wrap;
    background: var(--bg2);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 6px;
  }
  .tab-btn {
    padding: 8px 20px; border-radius: 10px; border: none;
    background: transparent; color: var(--text-mute);
    font-family: inherit; font-size: .88rem; font-weight: 600;
    cursor: pointer; transition: all .2s;
  }
  .tab-btn:hover { color: var(--text); background: rgba(255,255,255,.05); }
  .tab-btn--active { background: var(--accent); color: #fff; }

  /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     PANEL (كارد محتوى)
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
  .panel {
    background: var(--bg2);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    padding: 28px;
  }
  .panel__header {
    display: flex; align-items: center; justify-content: space-between;
    margin-bottom: 24px; flex-wrap: wrap; gap: 12px;
  }
  .panel__title { font-size: 1.15rem; font-weight: 700; }
  .link-btn {
    color: var(--accent2); font-size: .85rem; font-weight: 600;
    text-decoration: none; transition: color .2s;
  }
  .link-btn:hover { color: #fff; }

  /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     INPUTS
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
  .input {
    width: 100%;
    background: rgba(255,255,255,.04);
    border: 1px solid var(--border);
    border-radius: 12px; padding: 12px 16px;
    color: var(--text); font-family: inherit; font-size: .9rem;
    outline: none; transition: all .2s;
  }
  .input:focus { border-color: var(--accent); background: rgba(99,102,241,.06); box-shadow: 0 0 0 3px rgba(99,102,241,.12); }
  .input::placeholder { color: var(--text-mute); }
  .input--textarea { min-height: 110px; resize: vertical; }
  .input--select { cursor: pointer; }
  .input-row { display: flex; gap: 12px; }
  .input-row .input { flex: 1; }

  /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     PRODUCT FORM
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
  .product-form {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
  }
  .product-form__col { display: flex; flex-direction: column; gap: 12px; }
  @media (max-width: 700px) {
    .product-form { grid-template-columns: 1fr; }
  }

  /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     PRODUCTS GRID
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
  .products-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
    gap: 20px;
  }
  .product-card {
    background: var(--bg3);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    overflow: hidden;
    transition: all .25s;
    display: flex; flex-direction: column;
  }
  .product-card:hover { border-color: rgba(99,102,241,.4); transform: translateY(-3px); box-shadow: 0 12px 40px rgba(0,0,0,.5); }
  .product-card__img-wrap {
    height: 180px; background: #0a0f1a;
    position: relative; overflow: hidden;
  }
  .product-card__img { width: 100%; height: 100%; object-fit: cover; transition: transform .4s; }
  .product-card:hover .product-card__img { transform: scale(1.05); }
  .product-card__cat {
    position: absolute; top: 10px; right: 10px;
    background: rgba(99,102,241,.9); backdrop-filter: blur(6px);
    color: #fff; font-size: .7rem; font-weight: 700;
    padding: 3px 10px; border-radius: 99px; text-transform: uppercase; letter-spacing: .5px;
  }
  .product-card__body { padding: 18px; flex: 1; display: flex; flex-direction: column; gap: 8px; }
  .product-card__name { font-size: 1rem; font-weight: 700; }
  .product-card__desc {
    font-size: .82rem; color: var(--text-mute);
    display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;
    overflow: hidden; flex: 1;
  }
  .product-card__price { display: flex; align-items: baseline; gap: 8px; }
  .product-card__current { font-size: 1.1rem; font-weight: 800; font-family: 'Space Mono', monospace; color: var(--accent2); }
  .product-card__old { font-size: .8rem; color: var(--text-mute); text-decoration: line-through; }
  .product-card__actions { display: flex; gap: 8px; margin-top: 4px; }
  .product-card__actions .btn { flex: 1; }

  /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     CATEGORIES
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
  .cat-form { display: flex; gap: 12px; margin-bottom: 20px; flex-wrap: wrap; }
  .cat-form .input { flex: 1; min-width: 200px; }
  .cat-list { display: flex; flex-wrap: wrap; gap: 10px; }
  .cat-chip {
    background: rgba(99,102,241,.1);
    border: 1px solid rgba(99,102,241,.25);
    color: var(--accent2);
    padding: 6px 14px 6px 10px;
    border-radius: 99px; font-size: .85rem; font-weight: 600;
    display: flex; align-items: center; gap: 8px;
    transition: all .2s;
  }
  .cat-chip:hover { background: rgba(99,102,241,.2); }
  .cat-chip__del {
    background: none; border: none; cursor: pointer;
    color: var(--text-mute); font-size: .9rem; line-height: 1;
    transition: color .2s; padding: 0;
  }
  .cat-chip__del:hover { color: var(--red); }
  .empty-text { color: var(--text-mute); font-size: .9rem; }

  /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     ORDERS LIST
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
  .orders-list { display: flex; flex-direction: column; gap: 10px; }
  .order-row {
    background: var(--bg3);
    border: 1px solid var(--border);
    border-radius: 12px; padding: 14px 18px;
    display: flex; align-items: center; gap: 14px;
    flex-wrap: wrap; transition: border-color .2s;
  }
  .order-row:hover { border-color: rgba(255,255,255,.12); }
  .order-row__avatar {
    width: 40px; height: 40px; border-radius: 50%;
    background: linear-gradient(135deg, var(--accent), var(--violet));
    display: flex; align-items: center; justify-content: center;
    font-weight: 700; font-size: 1rem; color: #fff; flex-shrink: 0;
  }
  .order-row__info { flex: 1; min-width: 150px; }
  .order-row__name { display: block; font-weight: 600; font-size: .95rem; }
  .order-row__meta { display: block; color: var(--text-mute); font-size: .8rem; margin-top: 2px; }
  .order-row__actions { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }

  /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     BADGES
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
  .badge {
    display: inline-block;
    padding: 4px 12px; border-radius: 99px;
    font-size: .75rem; font-weight: 700; text-transform: uppercase; letter-spacing: .5px;
  }
  .badge--amber { background: rgba(245,158,11,.12); color: var(--amber); border: 1px solid rgba(245,158,11,.25); }
  .badge--blue  { background: rgba(96,165,250,.12); color: #60a5fa;     border: 1px solid rgba(96,165,250,.25); }
  .badge--green { background: rgba(16,185,129,.12);  color: var(--green); border: 1px solid rgba(16,185,129,.25); }
  .badge--gray  { background: rgba(100,116,139,.12); color: var(--text-mute); border: 1px solid var(--border); }

  /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     EMPTY STATE
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
  .empty-state {
    text-align: center; padding: 48px 20px;
    display: flex; flex-direction: column; align-items: center; gap: 12px;
  }
  .empty-state span { font-size: 3rem; opacity: .4; }
  .empty-state p    { color: var(--text-mute); }

  /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     MODAL (تعديل المنتج)
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
  .modal-overlay {
    position: fixed; inset: 0;
    background: rgba(0,0,0,.75); backdrop-filter: blur(8px);
    display: flex; align-items: center; justify-content: center;
    padding: 20px; z-index: 200;
    animation: fadeIn .2s ease;
  }
  @keyframes fadeIn { from{opacity:0} to{opacity:1} }
  .modal {
    background: var(--bg2);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    width: 100%; max-width: 480px;
    box-shadow: 0 24px 80px rgba(0,0,0,.6);
    animation: slideUp .25s ease;
  }
  @keyframes slideUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
  .modal__header {
    display: flex; align-items: center; justify-content: space-between;
    padding: 20px 24px; border-bottom: 1px solid var(--border);
  }
  .modal__title { font-size: 1.1rem; font-weight: 700; }
  .modal__close {
    background: none; border: none; color: var(--text-mute);
    font-size: 1.2rem; cursor: pointer; line-height: 1;
    width: 32px; height: 32px; border-radius: 8px;
    display: flex; align-items: center; justify-content: center;
    transition: all .2s;
  }
  .modal__close:hover { background: var(--bg3); color: var(--text); }
  .modal__body { padding: 24px; display: flex; flex-direction: column; gap: 12px; }
  .modal__footer { padding: 16px 24px; border-top: 1px solid var(--border); display: flex; flex-direction: column; gap: 10px; }

  /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     RESPONSIVE
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
  @media (max-width: 600px) {
    .main-content { padding: 20px 14px 60px; }
    .navbar__links .nav-btn:not(.nav-btn--danger) { display: none; }
    .stats-grid { grid-template-columns: 1fr 1fr; }
    .stat-card__value { font-size: 1.3rem; }
  }
`;

export default Dashboard;