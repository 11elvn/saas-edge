// ============================================================
// 📁 pages/ProductsPage.jsx — Day 20
// إدارة المنتجات: إضافة + تعديل + حذف + بحث + pagination
// مستخرجة من Dashboard.jsx القديم كصفحة مستقلة
// ============================================================

import { useEffect, useState } from "react";
import { useNavigate }         from "react-router-dom";
import ImageUploader           from "../components/ui/ImageUploader";

const API   = () => import.meta.env.VITE_API_URL;
const token = () => localStorage.getItem("token");

const DEFAULT_IMG  = "https://placehold.co/600x400/f8f9fa/94a3b8?text=No+Image";
const OLD_UNSPLASH = "https://images.unsplash.com/photo-1531403009284-440f080d1e12?q=80&w=400";
const resolveImg   = (img) => (!img || img === OLD_UNSPLASH ? DEFAULT_IMG : img);

const PRODUCTS_PER_PAGE = 12;

function ProductsPage() {
  const navigate = useNavigate();

  // ── Data ─────────────────────────────────────────────────
  const [products,    setProducts]    = useState([]);
  const [categories,  setCategories]  = useState([]);
  const [loading,     setLoading]     = useState(true);

  // ── Add Form ─────────────────────────────────────────────
  const [name,             setName]             = useState("");
  const [description,      setDescription]      = useState("");
  const [currentPrice,     setCurrentPrice]     = useState("");
  const [oldPrice,         setOldPrice]         = useState("");
  const [image,            setImage]            = useState("");
  const [stock,            setStock]            = useState(10);
  const [selectedCategory, setSelectedCategory] = useState("");

  // ── Edit Modal ───────────────────────────────────────────
  const [editingProduct, setEditingProduct] = useState(null);
  const [editingStock,   setEditingStock]   = useState(null);

  // ── Search + Filter + Pagination ─────────────────────────
  const [search,       setSearch]       = useState("");
  const [filterCat,    setFilterCat]    = useState("");
  const [page,         setPage]         = useState(1);

  // ── Notification ─────────────────────────────────────────
  const [notif, setNotif] = useState(null);
  const notify = (msg, type = "success") => {
    setNotif({ msg, type });
    setTimeout(() => setNotif(null), 3000);
  };

  // ── Fetch ─────────────────────────────────────────────────
  const fetchProducts = async () => {
    try {
      const res  = await fetch(`${API()}/api/products/my-products`, {
        headers: { Authorization: `Bearer ${token()}` },
      });
      const data = await res.json();
      if (Array.isArray(data)) setProducts(data);
    } catch (e) { console.error(e); }
  };

  const fetchCategories = async () => {
    try {
      const res  = await fetch(`${API()}/api/categories/my-categories`, {
        headers: { Authorization: `Bearer ${token()}` },
      });
      const data = await res.json();
      if (Array.isArray(data)) setCategories(data);
    } catch (e) { console.error(e); }
  };

  useEffect(() => {
    if (!token()) { navigate("/login"); return; }
    Promise.all([fetchProducts(), fetchCategories()]).finally(() => setLoading(false));
  }, []);

  // reset page on filter change
  useEffect(() => { setPage(1); }, [search, filterCat]);

  // ── Derived ───────────────────────────────────────────────
  const filtered = products.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchCat    = filterCat
      ? p.categoryId?._id === filterCat || p.categoryId === filterCat
      : true;
    return matchSearch && matchCat;
  });

  const totalPages = Math.ceil(filtered.length / PRODUCTS_PER_PAGE);
  const paginated  = filtered.slice((page - 1) * PRODUCTS_PER_PAGE, page * PRODUCTS_PER_PAGE);

  // ── Actions ───────────────────────────────────────────────
  const createProduct = async () => {
    if (!name.trim() || !currentPrice) return notify("اسم المنتج والسعر مطلوبان", "error");
    try {
      const res  = await fetch(`${API()}/api/products/create`, {
        method:  "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}` },
        body:    JSON.stringify({
          name, description, currentPrice, oldPrice, image,
          stock: Number(stock) || 10,
          categoryId: selectedCategory || null,
        }),
      });
      const data = await res.json();
      notify(data.message || "تم إضافة المنتج ✅");
      fetchProducts();
      setName(""); setDescription(""); setCurrentPrice(""); setOldPrice("");
      setImage(""); setStock(10); setSelectedCategory("");
    } catch (e) { console.error(e); }
  };

  const updateProduct = async () => {
    try {
      const res  = await fetch(`${API()}/api/products/update/${editingProduct._id}`, {
        method:  "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}` },
        body:    JSON.stringify({
          name:         editingProduct.name,
          description:  editingProduct.description,
          currentPrice: editingProduct.currentPrice,
          oldPrice:     editingProduct.oldPrice,
          image:        editingProduct.image,
          stock:        editingProduct.stock,
          categoryId:   editingProduct.categoryId?._id || editingProduct.categoryId,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setProducts((prev) => prev.map((p) => p._id === editingProduct._id ? { ...p, ...editingProduct } : p));
        setEditingProduct(null);
        notify(data.message || "تم التحديث ✅");
      } else {
        notify(data.message || "فشل التحديث ❌", "error");
      }
    } catch (e) { console.error(e); }
  };

  const updateStock = async () => {
    if (!editingStock) return;
    try {
      const res = await fetch(`${API()}/api/products/update/${editingStock.id}`, {
        method:  "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}` },
        body:    JSON.stringify({ stock: Number(editingStock.value) }),
      });
      if (res.ok) {
        setProducts((prev) => prev.map((p) =>
          p._id === editingStock.id ? { ...p, stock: Number(editingStock.value) } : p
        ));
        setEditingStock(null);
        notify("تم تحديث المخزون ✅");
      }
    } catch (e) { console.error(e); }
  };

  const deleteProduct = async (id) => {
    if (!window.confirm("هل أنت متأكد من حذف هذا المنتج؟")) return;
    try {
      const res  = await fetch(`${API()}/api/products/delete/${id}`, {
        method:  "DELETE",
        headers: { Authorization: `Bearer ${token()}` },
      });
      const data = await res.json();
      if (res.ok) {
        setProducts((prev) => prev.filter((p) => p._id !== id));
        notify(data.message || "تم الحذف ✅");
      }
    } catch (e) { console.error(e); }
  };

  if (loading) return (
    <div className="pp-loading">
      <div className="pp-spinner" />
      <p>جاري تحميل المنتجات...</p>
    </div>
  );

  return (
    <div className="pp-page" dir="rtl">

      {/* ── Toast ── */}
      {notif && (
        <div className={`pp-toast pp-toast--${notif.type}`}>
          {notif.type === "success" ? "✅" : "❌"} {notif.msg}
        </div>
      )}

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━
          فورم إضافة منتج
      ━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <div className="pp-card">
        <div className="pp-card__header">
          <h2 className="pp-card__title">✨ إضافة منتج جديد</h2>
        </div>

        <div className="pp-form">
          {/* عمود المعلومات */}
          <div className="pp-form__col">
            <input className="pp-input" placeholder="اسم المنتج *"
              value={name} onChange={(e) => setName(e.target.value)} />
            <textarea className="pp-input pp-input--textarea" placeholder="وصف المنتج"
              value={description} onChange={(e) => setDescription(e.target.value)} />
            <select className="pp-input" value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}>
              <option value="">اختر تصنيفاً (اختياري)</option>
              {categories.map((c) => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* عمود الأسعار والصورة */}
          <div className="pp-form__col">
            <div className="pp-form__row">
              <input className="pp-input" type="number" placeholder="السعر الحالي (DA) *"
                value={currentPrice} onChange={(e) => setCurrentPrice(e.target.value)} />
              <input className="pp-input" type="number" placeholder="السعر القديم (DA)"
                value={oldPrice} onChange={(e) => setOldPrice(e.target.value)} />
              <input className="pp-input" type="number" min="0" placeholder="المخزون — افتراضي 10"
                value={stock} onChange={(e) => setStock(e.target.value)} />
            </div>

            <ImageUploader
              value={image}
              onChange={setImage}
              label="صورة المنتج"
              aspect="wide"
              dark={false}
            />

            <button className="pp-btn pp-btn--primary pp-btn--full" onClick={createProduct}>
              + إضافة المنتج
            </button>
          </div>
        </div>
      </div>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━
          كتالوج المنتجات
      ━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <div className="pp-card">
        <div className="pp-card__header">
          <h2 className="pp-card__title">📦 كتالوج المنتجات</h2>
          <span className="pp-badge">{filtered.length} / {products.length} منتج</span>
        </div>

        {/* شريط البحث والفلتر */}
        <div className="pp-filters">
          <input className="pp-input pp-input--search" placeholder="🔍 ابحث عن منتج..."
            value={search} onChange={(e) => setSearch(e.target.value)} />
          <select className="pp-input pp-input--select" value={filterCat}
            onChange={(e) => setFilterCat(e.target.value)}>
            <option value="">كل التصنيفات</option>
            {categories.map((c) => (
              <option key={c._id} value={c._id}>{c.name}</option>
            ))}
          </select>
          {(search || filterCat) && (
            <button className="pp-btn pp-btn--ghost"
              onClick={() => { setSearch(""); setFilterCat(""); }}>
              ✕ مسح
            </button>
          )}
        </div>

        {/* Grid */}
        {filtered.length === 0 ? (
          <div className="pp-empty">
            <span>📦</span>
            <p>{products.length === 0 ? "لا توجد منتجات بعد. أضف أول منتج!" : "لا توجد نتائج"}</p>
          </div>
        ) : (
          <>
            <div className="pp-grid">
              {paginated.map((product) => (
                <div key={product._id} className="pp-product-card">
                  {/* صورة */}
                  <div className="pp-product-card__img-wrap">
                    <img
                      src={resolveImg(product.image)}
                      alt={product.name}
                      className="pp-product-card__img"
                      onError={(e) => { e.target.src = DEFAULT_IMG; }}
                    />
                    {product.categoryId && (
                      <span className="pp-product-card__cat">
                        {typeof product.categoryId === "object" ? product.categoryId.name : "تصنيف"}
                      </span>
                    )}
                  </div>

                  {/* معلومات */}
                  <div className="pp-product-card__body">
                    <h3 className="pp-product-card__name">{product.name}</h3>
                    <p className="pp-product-card__desc">{product.description}</p>

                    {/* السعر */}
                    <div className="pp-product-card__price">
                      <span className="pp-product-card__current">{product.currentPrice} DA</span>
                      {product.oldPrice && (
                        <span className="pp-product-card__old">{product.oldPrice} DA</span>
                      )}
                    </div>

                    {/* المخزون */}
                    <div className="pp-stock">
                      <span className="pp-stock__label">المخزون</span>
                      {editingStock?.id === product._id ? (
                        <div className="pp-stock__edit">
                          <input
                            type="number" min="0"
                            value={editingStock.value}
                            onChange={(e) => setEditingStock({ ...editingStock, value: e.target.value })}
                            onKeyDown={(e) => e.key === "Enter" && updateStock()}
                            className="pp-stock__input"
                            autoFocus
                          />
                          <button className="pp-btn pp-btn--success pp-btn--sm" onClick={updateStock}>✓</button>
                          <button className="pp-btn pp-btn--ghost pp-btn--sm" onClick={() => setEditingStock(null)}>✕</button>
                        </div>
                      ) : (
                        <div className="pp-stock__display">
                          <span className={`pp-stock__value ${
                            product.stock === 0 ? "pp-stock__value--red"
                            : product.stock <= 5 ? "pp-stock__value--amber"
                            : "pp-stock__value--green"
                          }`}>
                            {product.stock ?? 0}
                          </span>
                          {product.stock === 0 && <span className="pp-stock__tag pp-stock__tag--red">نفد</span>}
                          {product.stock > 0 && product.stock <= 5 && <span className="pp-stock__tag pp-stock__tag--amber">قليل</span>}
                          <button className="pp-btn pp-btn--ghost pp-btn--xs"
                            onClick={() => setEditingStock({ id: product._id, value: product.stock ?? 0 })}>
                            ✏️
                          </button>
                        </div>
                      )}
                    </div>

                    {/* أزرار */}
                    <div className="pp-product-card__actions">
                      <button className="pp-btn pp-btn--warning pp-btn--sm"
                        onClick={() => setEditingProduct({ ...product })}>
                        ✏️ تعديل
                      </button>
                      <button className="pp-btn pp-btn--danger pp-btn--sm"
                        onClick={() => deleteProduct(product._id)}>
                        🗑️ حذف
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="pp-pagination">
                <button className="pp-btn pp-btn--ghost pp-btn--sm"
                  disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
                  ← السابق
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button key={p}
                    className={`pp-btn pp-btn--sm ${page === p ? "pp-btn--primary" : "pp-btn--ghost"}`}
                    onClick={() => setPage(p)} style={{ minWidth: 36 }}>
                    {p}
                  </button>
                ))}
                <button className="pp-btn pp-btn--ghost pp-btn--sm"
                  disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}>
                  التالي →
                </button>
                <span className="pp-pagination__info">
                  {(page - 1) * PRODUCTS_PER_PAGE + 1}–{Math.min(page * PRODUCTS_PER_PAGE, filtered.length)} من {filtered.length}
                </span>
              </div>
            )}
          </>
        )}
      </div>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━
          Modal التعديل
      ━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {editingProduct && (
        <div className="pp-modal-overlay" onClick={() => setEditingProduct(null)}>
          <div className="pp-modal" onClick={(e) => e.stopPropagation()}>
            <div className="pp-modal__header">
              <h2>✏️ تعديل المنتج</h2>
              <button className="pp-modal__close" onClick={() => setEditingProduct(null)}>✕</button>
            </div>
            <div className="pp-modal__body">
              <input className="pp-input" placeholder="اسم المنتج"
                value={editingProduct.name}
                onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })} />
              <textarea className="pp-input pp-input--textarea" placeholder="الوصف"
                value={editingProduct.description || ""}
                onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })} />
              <div className="pp-form__row">
                <input className="pp-input" type="number" placeholder="السعر (DA)"
                  value={editingProduct.currentPrice}
                  onChange={(e) => setEditingProduct({ ...editingProduct, currentPrice: e.target.value })} />
                <input className="pp-input" type="number" min="0" placeholder="المخزون"
                  value={editingProduct.stock ?? 0}
                  onChange={(e) => setEditingProduct({ ...editingProduct, stock: Number(e.target.value) })} />
              </div>
              <ImageUploader
                value={editingProduct.image === OLD_UNSPLASH ? "" : editingProduct.image || ""}
                onChange={(url) => setEditingProduct({ ...editingProduct, image: url })}
                label="صورة المنتج"
                aspect="wide"
                dark={false}
              />
            </div>
            <div className="pp-modal__footer">
              <button className="pp-btn pp-btn--primary pp-btn--full" onClick={updateProduct}>
                💾 حفظ التغييرات
              </button>
              <button className="pp-btn pp-btn--ghost pp-btn--full" onClick={() => setEditingProduct(null)}>
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default ProductsPage;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🎨 STYLES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const style = document.createElement("style");
style.textContent = `
.pp-page { display:flex; flex-direction:column; gap:24px; }
.pp-loading { display:flex; flex-direction:column; align-items:center; justify-content:center; height:300px; gap:12px; color:#6b7280; font-size:.9rem; }
.pp-spinner { width:28px; height:28px; border:3px solid #f0f0f0; border-top-color:#111827; border-radius:50%; animation:pp-spin .7s linear infinite; }
@keyframes pp-spin { to { transform:rotate(360deg); } }

/* Toast */
.pp-toast { position:fixed; top:20px; left:50%; transform:translateX(-50%); background:#111827; color:#fff; padding:10px 22px; border-radius:99px; font-size:.85rem; font-weight:500; z-index:9999; white-space:nowrap; }
.pp-toast--error { background:#ef4444; }

/* Card */
.pp-card { background:#fff; border:1px solid #f0f0f0; border-radius:14px; padding:24px; }
.pp-card__header { display:flex; align-items:center; justify-content:space-between; margin-bottom:20px; }
.pp-card__title { font-size:1rem; font-weight:600; color:#111827; }
.pp-badge { background:#f3f4f6; color:#6b7280; font-size:.75rem; font-weight:600; padding:3px 10px; border-radius:99px; }

/* Form */
.pp-form { display:grid; grid-template-columns:1fr 1fr; gap:20px; }
.pp-form__col { display:flex; flex-direction:column; gap:12px; }
.pp-form__row { display:flex; gap:10px; }
.pp-form__row .pp-input { flex:1; }
@media(max-width:700px) { .pp-form { grid-template-columns:1fr; } }

/* Input */
.pp-input { width:100%; background:#f9fafb; border:1px solid #e5e7eb; border-radius:10px; padding:10px 14px; color:#111827; font-family:inherit; font-size:.88rem; outline:none; transition:all .15s; }
.pp-input:focus { border-color:#111827; background:#fff; box-shadow:0 0 0 3px rgba(17,24,39,.06); }
.pp-input::placeholder { color:#9ca3af; }
.pp-input--textarea { min-height:100px; resize:vertical; }
.pp-input--search { flex:1; min-width:200px; }

/* Filters */
.pp-filters { display:flex; gap:10px; margin-bottom:20px; flex-wrap:wrap; }

/* Buttons */
.pp-btn { display:inline-flex; align-items:center; justify-content:center; gap:5px; padding:8px 16px; border-radius:8px; border:none; font-family:inherit; font-size:.82rem; font-weight:600; cursor:pointer; transition:all .15s; text-decoration:none; }
.pp-btn:hover { opacity:.85; transform:translateY(-1px); }
.pp-btn--primary { background:#111827; color:#fff; }
.pp-btn--success { background:#f0fdf4; color:#16a34a; border:1px solid #bbf7d0; }
.pp-btn--success:hover { background:#16a34a; color:#fff; }
.pp-btn--warning { background:#fffbeb; color:#d97706; border:1px solid #fde68a; }
.pp-btn--warning:hover { background:#d97706; color:#fff; }
.pp-btn--danger  { background:#fef2f2; color:#dc2626; border:1px solid #fecaca; }
.pp-btn--danger:hover  { background:#dc2626; color:#fff; }
.pp-btn--ghost   { background:#fff; color:#6b7280; border:1px solid #e5e7eb; }
.pp-btn--ghost:hover { background:#f3f4f6; color:#111827; }
.pp-btn--full    { width:100%; }
.pp-btn--sm      { padding:5px 12px; font-size:.78rem; }
.pp-btn--xs      { padding:3px 8px; font-size:.72rem; }

/* Grid */
.pp-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(240px,1fr)); gap:18px; }

/* Product Card */
.pp-product-card { background:#fff; border:1px solid #f0f0f0; border-radius:12px; overflow:hidden; transition:all .2s; display:flex; flex-direction:column; }
.pp-product-card:hover { border-color:#d1d5db; box-shadow:0 4px 20px rgba(0,0,0,.08); transform:translateY(-2px); }
.pp-product-card__img-wrap { height:170px; background:#f8f9fa; position:relative; overflow:hidden; }
.pp-product-card__img { width:100%; height:100%; object-fit:cover; transition:transform .3s; }
.pp-product-card:hover .pp-product-card__img { transform:scale(1.04); }
.pp-product-card__cat { position:absolute; top:8px; right:8px; background:rgba(17,24,39,.8); color:#fff; font-size:.68rem; font-weight:700; padding:2px 8px; border-radius:99px; }
.pp-product-card__body { padding:14px; flex:1; display:flex; flex-direction:column; gap:6px; }
.pp-product-card__name { font-size:.9rem; font-weight:600; color:#111827; }
.pp-product-card__desc { font-size:.78rem; color:#6b7280; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; flex:1; }
.pp-product-card__price { display:flex; align-items:baseline; gap:6px; }
.pp-product-card__current { font-size:1rem; font-weight:700; color:#111827; }
.pp-product-card__old { font-size:.78rem; color:#9ca3af; text-decoration:line-through; }
.pp-product-card__actions { display:flex; gap:6px; margin-top:4px; }
.pp-product-card__actions .pp-btn { flex:1; }

/* Stock */
.pp-stock { display:flex; align-items:center; justify-content:space-between; background:#f9fafb; border:1px solid #f0f0f0; border-radius:8px; padding:6px 10px; }
.pp-stock__label { font-size:.75rem; color:#9ca3af; }
.pp-stock__display { display:flex; align-items:center; gap:6px; }
.pp-stock__edit { display:flex; align-items:center; gap:5px; }
.pp-stock__input { width:56px; border:1px solid #d1d5db; border-radius:6px; padding:3px 6px; font-size:.82rem; text-align:center; outline:none; }
.pp-stock__value { font-size:.9rem; font-weight:700; }
.pp-stock__value--red   { color:#ef4444; }
.pp-stock__value--amber { color:#f59e0b; }
.pp-stock__value--green { color:#10b981; }
.pp-stock__tag { font-size:.65rem; font-weight:700; padding:1px 6px; border-radius:99px; }
.pp-stock__tag--red   { background:#fef2f2; color:#dc2626; border:1px solid #fecaca; }
.pp-stock__tag--amber { background:#fffbeb; color:#d97706; border:1px solid #fde68a; }

/* Empty */
.pp-empty { text-align:center; padding:48px 20px; display:flex; flex-direction:column; align-items:center; gap:12px; color:#9ca3af; }
.pp-empty span { font-size:2.5rem; opacity:.4; }

/* Pagination */
.pp-pagination { display:flex; align-items:center; justify-content:center; gap:6px; margin-top:20px; flex-wrap:wrap; }
.pp-pagination__info { font-size:.78rem; color:#6b7280; margin-right:8px; }

/* Modal */
.pp-modal-overlay { position:fixed; inset:0; background:rgba(0,0,0,.5); backdrop-filter:blur(4px); display:flex; align-items:center; justify-content:center; padding:20px; z-index:200; }
.pp-modal { background:#fff; border-radius:16px; width:100%; max-width:480px; box-shadow:0 20px 60px rgba(0,0,0,.15); }
.pp-modal__header { display:flex; align-items:center; justify-content:space-between; padding:18px 22px; border-bottom:1px solid #f0f0f0; }
.pp-modal__header h2 { font-size:1rem; font-weight:600; color:#111827; }
.pp-modal__close { background:none; border:none; font-size:1.1rem; cursor:pointer; color:#6b7280; width:30px; height:30px; border-radius:6px; display:flex; align-items:center; justify-content:center; transition:all .15s; }
.pp-modal__close:hover { background:#f3f4f6; color:#111827; }
.pp-modal__body { padding:20px 22px; display:flex; flex-direction:column; gap:10px; }
.pp-modal__footer { padding:14px 22px; border-top:1px solid #f0f0f0; display:flex; flex-direction:column; gap:8px; }
`;
if (!document.getElementById("pp-styles")) {
  style.id = "pp-styles";
  document.head.appendChild(style);
}