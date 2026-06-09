// ============================================================
// 📁 pages/ProductsPage.jsx — Tassyr-style
// ============================================================
import { useEffect, useState } from "react";
import { useNavigate }          from "react-router-dom";
import ImageUploader            from "../components/ui/ImageUploader";

const API   = () => import.meta.env.VITE_API_URL;
const token = () => localStorage.getItem("token");
const DEFAULT_IMG = "https://placehold.co/600x400/f8f9fa/94a3b8?text=No+Image";

// ── inject CSS ───────────────────────────────────────────────
function injectCSS() {
  if (document.getElementById("prp-css")) return;
  const s = document.createElement("style");
  s.id = "prp-css";
  s.textContent = `
/* ─── Shared reuse from cp-css ────── */
.prp-wrap { font-family: inherit; display: flex; flex-direction: column; gap: 24px; }

/* Top bar */
.prp-topbar {
  display: flex; align-items: center;
  justify-content: space-between; margin-bottom: 4px;
}
.prp-topbar h1 { font-size: 1.45rem; font-weight: 700; color: #111827; margin: 0; }
.prp-btn-add {
  display: inline-flex; align-items: center; gap: 6px;
  background: #111827; color: #fff; border: none;
  padding: 9px 18px; border-radius: 10px;
  font-size: .85rem; font-weight: 700;
  cursor: pointer; font-family: inherit; transition: opacity .15s;
}
.prp-btn-add:hover { opacity: .85; }

/* ─── Table card ─────────────────── */
.prp-card {
  background: #fff; border: 1px solid #e5e7eb;
  border-radius: 14px; overflow: hidden;
}
.prp-card-head {
  display: flex; align-items: center; justify-content: space-between;
  padding: 14px 18px; border-bottom: 1px solid #f3f4f6;
  flex-wrap: wrap; gap: 10px;
}
.prp-card-head h2 {
  font-size: .95rem; font-weight: 700; color: #111827; margin: 0;
}
.prp-filters { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.prp-search {
  padding: 7px 12px; border-radius: 8px;
  border: 1px solid #e5e7eb; background: #f9fafb;
  font-size: .82rem; color: #111827; font-family: inherit;
  outline: none; width: 200px; transition: all .15s;
}
.prp-search:focus { border-color: #d1d5db; background: #fff; width: 240px; }
.prp-select {
  padding: 7px 10px; border-radius: 8px;
  border: 1px solid #e5e7eb; background: #f9fafb;
  font-size: .82rem; color: #374151; font-family: inherit;
  outline: none; cursor: pointer;
}
.prp-badge {
  background: #f3f4f6; color: #6b7280;
  font-size: .73rem; font-weight: 700;
  padding: 3px 10px; border-radius: 99px;
}

/* Table */
.prp-table { width: 100%; border-collapse: collapse; }
.prp-table thead tr { border-bottom: 1px solid #f3f4f6; }
.prp-table thead th {
  padding: 10px 16px; text-align: left;
  font-size: .72rem; font-weight: 700;
  color: #9ca3af; text-transform: uppercase;
  letter-spacing: .06em; white-space: nowrap;
}
.prp-table tbody tr {
  border-bottom: 1px solid #f9fafb;
  transition: background .12s;
}
.prp-table tbody tr:last-child { border-bottom: none; }
.prp-table tbody tr:hover { background: #fafafa; }
.prp-table td {
  padding: 13px 16px; font-size: .84rem;
  color: #374151; vertical-align: middle;
}

/* Product cell */
.prp-prod-cell { display: flex; align-items: center; gap: 12px; }
.prp-thumb {
  width: 42px; height: 42px; border-radius: 8px;
  object-fit: cover; border: 1px solid #e5e7eb; flex-shrink: 0;
}
.prp-no-thumb {
  width: 42px; height: 42px; border-radius: 8px;
  background: #f3f4f6; border: 1px solid #e5e7eb;
  display: flex; align-items: center; justify-content: center;
  font-size: 16px; flex-shrink: 0;
}
.prp-pname { font-weight: 600; color: #111827; font-size: .88rem; margin: 0; }
.prp-pdesc {
  font-size: .74rem; color: #9ca3af; margin: 2px 0 0;
  max-width: 220px; white-space: nowrap;
  overflow: hidden; text-overflow: ellipsis;
}

/* Price */
.prp-price-cur { font-weight: 700; color: #111827; }
.prp-price-old { font-size: .78rem; color: #9ca3af; text-decoration: line-through; display: block; margin-top: 1px; }

/* Stock badge */
.prp-stock {
  display: inline-flex; align-items: center; gap: 4px;
  font-size: .78rem; font-weight: 700;
  padding: 3px 9px; border-radius: 99px;
}
.prp-stock.ok    { background: #f0fdf4; color: #16a34a; border: 1px solid #bbf7d0; }
.prp-stock.low   { background: #fffbeb; color: #d97706; border: 1px solid #fde68a; }
.prp-stock.empty { background: #fef2f2; color: #ef4444; border: 1px solid #fecaca; }

/* Cat badge */
.prp-cat {
  background: #f3f4f6; color: #374151;
  font-size: .75rem; font-weight: 600;
  padding: 3px 9px; border-radius: 6px;
}

/* Actions */
.prp-actions { display: flex; align-items: center; gap: 6px; }
.prp-icon-btn {
  width: 30px; height: 30px; border-radius: 7px;
  border: 1px solid #e5e7eb; background: #fff;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; transition: all .15s; color: #6b7280;
}
.prp-icon-btn:hover { background: #f3f4f6; color: #111827; border-color: #d1d5db; }
.prp-icon-btn.danger:hover { background: #fef2f2; color: #ef4444; border-color: #fecaca; }
.prp-dots {
  width: 30px; height: 30px; border-radius: 7px;
  border: 1px solid #e5e7eb; background: #fff;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; color: #9ca3af; font-weight: 700;
  font-size: 14px; letter-spacing: 1px; transition: all .15s;
}
.prp-dots:hover { background: #f3f4f6; color: #374151; }

/* Pagination */
.prp-pag {
  display: flex; align-items: center; justify-content: center;
  gap: 4px; padding: 14px; border-top: 1px solid #f9fafb;
}
.prp-pag-btn {
  min-width: 32px; height: 32px; border-radius: 7px;
  border: 1px solid #e5e7eb; background: #fff;
  font-size: .8rem; font-weight: 600; color: #374151;
  cursor: pointer; transition: all .15s;
  display: flex; align-items: center; justify-content: center;
  font-family: inherit;
}
.prp-pag-btn:hover:not(:disabled) { background: #f3f4f6; }
.prp-pag-btn.active { background: #111827; color: #fff; border-color: #111827; }
.prp-pag-btn:disabled { opacity: .35; cursor: not-allowed; }

/* Empty */
.prp-empty {
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  padding: 60px 20px; gap: 12px; color: #9ca3af;
}
.prp-empty span { font-size: 2.2rem; opacity: .35; }
.prp-empty p { font-size: .9rem; margin: 0; }

/* Spinner */
.prp-spinner {
  width: 26px; height: 26px;
  border: 2.5px solid #f0f0f0; border-top-color: #111827;
  border-radius: 50%;
  animation: prp-spin .7s linear infinite;
}
@keyframes prp-spin { to { transform: rotate(360deg); } }

/* ─── Modal ─────────────────────────── */
.prp-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,.45);
  backdrop-filter: blur(3px); z-index: 1000;
  display: flex; align-items: center; justify-content: center; padding: 16px;
}
.prp-modal {
  background: #fff; border-radius: 16px;
  width: 100%; max-width: 540px;
  box-shadow: 0 24px 64px rgba(0,0,0,.18);
  max-height: 90vh; overflow-y: auto;
  animation: prp-in .2s cubic-bezier(.32,.72,0,1);
}
@keyframes prp-in {
  from { opacity:0; transform: scale(.95) translateY(10px); }
  to   { opacity:1; transform: scale(1) translateY(0); }
}
.prp-modal-head {
  display: flex; align-items: center; justify-content: space-between;
  padding: 16px 20px; border-bottom: 1px solid #f3f4f6;
  position: sticky; top: 0; background: #fff; z-index: 2;
}
.prp-modal-head h2 {
  font-size: .95rem; font-weight: 700; color: #111827; margin: 0;
}
.prp-close {
  width: 28px; height: 28px; border-radius: 7px;
  border: 1px solid #e5e7eb; background: #fff;
  cursor: pointer; display: flex; align-items: center;
  justify-content: center; color: #6b7280; font-size: 13px;
  transition: all .15s;
}
.prp-close:hover { background: #f3f4f6; color: #111827; }

.prp-modal-body {
  padding: 0;
}
.prp-msection {
  padding: 18px 20px; border-bottom: 1px solid #f9fafb;
}
.prp-msection:last-child { border-bottom: none; }
.prp-stitle {
  font-size: .7rem; font-weight: 700; color: #9ca3af;
  text-transform: uppercase; letter-spacing: .07em;
  margin: 0 0 14px; padding-bottom: 10px;
  border-bottom: 1px solid #f3f4f6;
}
.prp-field { margin-bottom: 13px; }
.prp-field:last-child { margin-bottom: 0; }
.prp-lbl {
  display: block; font-size: .8rem; font-weight: 600;
  color: #374151; margin-bottom: 6px;
}
.prp-lbl .req { color: #ef4444; margin-right: 2px; }
.prp-inp {
  width: 100%; padding: 10px 12px; border-radius: 10px;
  border: 1px solid #e5e7eb; background: #f9fafb;
  font-family: inherit; font-size: .88rem; color: #111827;
  outline: none; transition: all .15s; box-sizing: border-box;
}
.prp-inp:focus {
  border-color: #111827; background: #fff;
  box-shadow: 0 0 0 3px rgba(17,24,39,.06);
}
.prp-inp::placeholder { color: #9ca3af; }
.prp-textarea { min-height: 80px; resize: vertical; }
.prp-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.prp-row3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; }
@media(max-width:500px) { .prp-row,.prp-row3 { grid-template-columns: 1fr; } }

.prp-modal-foot {
  padding: 14px 20px; border-top: 1px solid #f3f4f6;
  display: flex; gap: 8px;
  position: sticky; bottom: 0; background: #fff; z-index: 2;
}
.prp-foot-cancel {
  padding: 10px 18px; border-radius: 10px;
  border: 1px solid #e5e7eb; background: #fff;
  color: #374151; font-size: .88rem; font-weight: 600;
  cursor: pointer; font-family: inherit; transition: all .15s;
}
.prp-foot-cancel:hover { background: #f3f4f6; }
.prp-foot-save {
  flex: 1; padding: 10px 0; border-radius: 10px;
  background: #111827; color: #fff; border: none;
  font-size: .88rem; font-weight: 700;
  cursor: pointer; font-family: inherit; transition: opacity .15s;
}
.prp-foot-save:hover { opacity: .87; }
.prp-foot-save:disabled { opacity: .45; cursor: not-allowed; }

/* Toast */
.prp-toast {
  position: fixed; top: 20px; left: 50%; transform: translateX(-50%);
  background: #111827; color: #fff; padding: 10px 24px;
  border-radius: 99px; font-size: .84rem; font-weight: 500;
  z-index: 9999; white-space: nowrap;
  box-shadow: 0 4px 20px rgba(0,0,0,.18);
}
.prp-toast.err { background: #ef4444; }
  `;
  document.head.appendChild(s);
}

// ── Product Modal ─────────────────────────────────────────────
function ProductModal({ mode, initial, categories, onSave, onClose, saving }) {
  const [name,        setName]        = useState(initial?.name        || "");
  const [desc,        setDesc]        = useState(initial?.description || "");
  const [price,       setPrice]       = useState(initial?.currentPrice|| "");
  const [oldPrice,    setOldPrice]    = useState(initial?.oldPrice    || "");
  const [stock,       setStock]       = useState(initial?.stock       ?? 10);
  const [image,       setImage]       = useState(initial?.image       || "");
  const [catId,       setCatId]       = useState(
    initial?.categoryId?._id || initial?.categoryId || ""
  );

  const isEdit = mode === "edit";

  return (
    <div className="prp-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="prp-modal">

        {/* Header */}
        <div className="prp-modal-head">
          <h2>{isEdit ? "Edit Product" : "Add New Product"}</h2>
          <button className="prp-close" onClick={onClose}>✕</button>
        </div>

        <div className="prp-modal-body">

          {/* Basic Info */}
          <div className="prp-msection">
            <p className="prp-stitle">Basic Information</p>
            <div className="prp-field">
              <label className="prp-lbl"><span className="req">*</span> Product Name</label>
              <input className="prp-inp" placeholder="Enter product name" value={name} onChange={e => setName(e.target.value)} autoFocus />
            </div>
            <div className="prp-field">
              <label className="prp-lbl">Description</label>
              <textarea className="prp-inp prp-textarea" placeholder="Enter product description (optional)" value={desc} onChange={e => setDesc(e.target.value)} />
            </div>
            <div className="prp-field">
              <label className="prp-lbl">Category</label>
              <select className="prp-inp" value={catId} onChange={e => setCatId(e.target.value)}>
                <option value="">No category</option>
                {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
            </div>
          </div>

          {/* Pricing */}
          <div className="prp-msection">
            <p className="prp-stitle">Pricing & Stock</p>
            <div className="prp-row3">
              <div className="prp-field" style={{ margin: 0 }}>
                <label className="prp-lbl"><span className="req">*</span> Current Price (DA)</label>
                <input className="prp-inp" type="number" placeholder="0" value={price} onChange={e => setPrice(e.target.value)} />
              </div>
              <div className="prp-field" style={{ margin: 0 }}>
                <label className="prp-lbl">Old Price (DA)</label>
                <input className="prp-inp" type="number" placeholder="0" value={oldPrice} onChange={e => setOldPrice(e.target.value)} />
              </div>
              <div className="prp-field" style={{ margin: 0 }}>
                <label className="prp-lbl">Stock</label>
                <input className="prp-inp" type="number" min="0" placeholder="10" value={stock} onChange={e => setStock(e.target.value)} />
              </div>
            </div>
          </div>

          {/* Product Image */}
          <div className="prp-msection">
            <p className="prp-stitle">Product Image</p>
            <ImageUploader value={image} onChange={setImage} label="Product Image" aspect="wide" dark={false} />
          </div>

        </div>

        {/* Footer */}
        <div className="prp-modal-foot">
          <button className="prp-foot-cancel" onClick={onClose}>Cancel</button>
          <button
            className="prp-foot-save"
            disabled={saving}
            onClick={() => onSave({ name, desc, price, oldPrice, stock, image, catId })}
          >
            {saving ? "Saving..." : isEdit ? "Save Changes" : "Add Product"}
          </button>
        </div>

      </div>
    </div>
  );
}

// ── Main ─────────────────────────────────────────────────────
const PER_PAGE = 12;

export default function ProductsPage() {
  const navigate = useNavigate();

  const [products,  setProducts]  = useState([]);
  const [cats,      setCats]      = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [saving,    setSaving]    = useState(false);
  const [notif,     setNotif]     = useState(null);
  const [modal,     setModal]     = useState(null);
  const [search,    setSearch]    = useState("");
  const [filterCat, setFilterCat] = useState("");
  const [page,      setPage]      = useState(1);

  useEffect(() => { injectCSS(); }, []);

  const toast = (msg, type = "ok") => {
    setNotif({ msg, type });
    setTimeout(() => setNotif(null), 3000);
  };

  const loadProducts = async () => {
    try {
      const r = await fetch(`${API()}/api/products/my-products`, {
        headers: { Authorization: `Bearer ${token()}` },
      });
      const d = await r.json();
      if (Array.isArray(d)) setProducts(d);
    } catch {}
  };

  const loadCats = async () => {
    try {
      const r = await fetch(`${API()}/api/categories/my-categories`, {
        headers: { Authorization: `Bearer ${token()}` },
      });
      const d = await r.json();
      if (Array.isArray(d)) setCats(d);
    } catch {}
  };

  useEffect(() => {
    if (!token()) { navigate("/login"); return; }
    Promise.all([loadProducts(), loadCats()]).finally(() => setLoading(false));
  }, []);

  useEffect(() => { setPage(1); }, [search, filterCat]);

  // Filtered
  const filtered = products.filter(p => {
    const ms = p.name.toLowerCase().includes(search.toLowerCase());
    const mc = filterCat
      ? String(p.categoryId?._id || p.categoryId) === filterCat
      : true;
    return ms && mc;
  });
  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paged      = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  // Create
  const handleCreate = async ({ name, desc, price, oldPrice, stock, image, catId }) => {
    if (!name.trim() || !price) return toast("اسم المنتج والسعر مطلوبان", "err");
    setSaving(true);
    try {
      const r = await fetch(`${API()}/api/products/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}` },
        body: JSON.stringify({
          name, description: desc,
          currentPrice: Number(price), oldPrice: Number(oldPrice) || undefined,
          stock: Number(stock) || 10,
          image, categoryId: catId || null,
        }),
      });
      const d = await r.json();
      if (r.ok) { toast("✅ تم إضافة المنتج"); setModal(null); loadProducts(); }
      else toast(d.message || "خطأ", "err");
    } catch { toast("خطأ ❌", "err"); }
    finally { setSaving(false); }
  };

  // Edit
  const handleEdit = async ({ name, desc, price, oldPrice, stock, image, catId }) => {
    if (!name.trim()) return toast("اكتب اسم المنتج", "err");
    setSaving(true);
    try {
      const r = await fetch(`${API()}/api/products/update/${modal.product._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}` },
        body: JSON.stringify({
          name, description: desc,
          currentPrice: Number(price), oldPrice: Number(oldPrice) || undefined,
          stock: Number(stock), image,
          categoryId: catId || null,
        }),
      });
      const d = await r.json();
      if (r.ok) {
        toast("✅ تم التعديل"); setModal(null);
        setProducts(p => p.map(x => x._id === modal.product._id
          ? { ...x, name, description: desc, currentPrice: Number(price), oldPrice: Number(oldPrice)||undefined, stock: Number(stock), image, categoryId: catId ? { _id: catId, name: cats.find(c=>c._id===catId)?.name } : null }
          : x
        ));
      } else toast(d.message || "خطأ", "err");
    } catch { toast("خطأ ❌", "err"); }
    finally { setSaving(false); }
  };

  // Delete
  const handleDelete = async (id) => {
    if (!window.confirm("متأكد من حذف هذا المنتج؟")) return;
    try {
      const r = await fetch(`${API()}/api/products/delete/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token()}` },
      });
      if (r.ok) { setProducts(p => p.filter(x => x._id !== id)); toast("✅ تم الحذف"); }
    } catch { toast("خطأ ❌", "err"); }
  };

  const stockClass = (s) => s === 0 ? "empty" : s <= 5 ? "low" : "ok";
  const stockLabel = (s) => s === 0 ? "Out of stock" : s <= 5 ? `Low (${s})` : s;

  return (
    <div className="prp-wrap" dir="ltr">

      {/* Toast */}
      {notif && <div className={`prp-toast ${notif.type === "err" ? "err" : ""}`}>{notif.msg}</div>}

      {/* Modal */}
      {modal === "create" && (
        <ProductModal mode="create" categories={cats} onSave={handleCreate} onClose={() => setModal(null)} saving={saving} />
      )}
      {modal?.mode === "edit" && (
        <ProductModal mode="edit" initial={modal.product} categories={cats} onSave={handleEdit} onClose={() => setModal(null)} saving={saving} />
      )}

      {/* Top bar */}
      <div className="prp-topbar">
        <h1>Products</h1>
        <button className="prp-btn-add" onClick={() => setModal("create")}>
          <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Add Product
        </button>
      </div>

      {/* Table card */}
      <div className="prp-card">
        {/* Card header: search + filter */}
        <div className="prp-card-head">
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <h2 style={{ margin: 0 }}>All Products</h2>
            <span className="prp-badge">{filtered.length}</span>
          </div>
          <div className="prp-filters">
            <input
              className="prp-search"
              placeholder="🔍 Search products..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <select className="prp-select" value={filterCat} onChange={e => setFilterCat(e.target.value)}>
              <option value="">All categories</option>
              {cats.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
          </div>
        </div>

        {/* Table body */}
        {loading ? (
          <div className="prp-empty"><div className="prp-spinner" /></div>
        ) : paged.length === 0 ? (
          <div className="prp-empty">
            <span>📦</span>
            <p>{products.length === 0 ? "No products yet — add your first one" : "No results found"}</p>
          </div>
        ) : (
          <>
            <table className="prp-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Created</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paged.map(p => (
                  <tr key={p._id}>

                    {/* Product */}
                    <td>
                      <div className="prp-prod-cell">
                        {p.image
                          ? <img src={p.image} alt={p.name} className="prp-thumb" onError={e => e.target.src = DEFAULT_IMG} />
                          : <div className="prp-no-thumb">📦</div>
                        }
                        <div>
                          <p className="prp-pname">{p.name}</p>
                          <p className="prp-pdesc">{p.description || "—"}</p>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td>
                      {p.categoryId
                        ? <span className="prp-cat">{typeof p.categoryId === "object" ? p.categoryId.name : cats.find(c => c._id === p.categoryId)?.name || "—"}</span>
                        : <span style={{ color: "#9ca3af", fontSize: ".8rem" }}>—</span>
                      }
                    </td>

                    {/* Price */}
                    <td>
                      <span className="prp-price-cur">{Number(p.currentPrice).toLocaleString()} DA</span>
                      {p.oldPrice && <span className="prp-price-old">{Number(p.oldPrice).toLocaleString()} DA</span>}
                    </td>

                    {/* Stock */}
                    <td>
                      <span className={`prp-stock ${stockClass(p.stock ?? 0)}`}>
                        {stockLabel(p.stock ?? 0)}
                      </span>
                    </td>

                    {/* Created */}
                    <td style={{ color: "#9ca3af", fontSize: ".79rem", whiteSpace: "nowrap" }}>
                      {new Date(p.createdAt).toLocaleDateString("en-US", { month: "numeric", day: "numeric", year: "numeric" })}
                    </td>

                    {/* Actions */}
                    <td>
                      <div className="prp-actions" style={{ justifyContent: "flex-end" }}>
                        <button className="prp-icon-btn" title="Edit" onClick={() => setModal({ mode: "edit", product: p })}>
                          <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                            <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                          </svg>
                        </button>
                        <button className="prp-icon-btn danger" title="Delete" onClick={() => handleDelete(p._id)}>
                          <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <polyline points="3 6 5 6 21 6"/>
                            <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
                            <path d="M10 11v6M14 11v6"/>
                            <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
                          </svg>
                        </button>
                        <button className="prp-dots">···</button>
                      </div>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="prp-pag">
                <button className="prp-pag-btn" disabled={page === 1} onClick={() => setPage(p => p - 1)}>←</button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
                  <button key={n} className={`prp-pag-btn ${page === n ? "active" : ""}`} onClick={() => setPage(n)}>{n}</button>
                ))}
                <button className="prp-pag-btn" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>→</button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}