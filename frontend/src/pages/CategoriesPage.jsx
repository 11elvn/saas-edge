// ============================================================
// 📁 pages/CategoriesPage.jsx — Tassyr-style
// ============================================================
import { useEffect, useState } from "react";
import { useNavigate }          from "react-router-dom";
import ImageUploader            from "../components/ui/ImageUploader";

const API   = () => import.meta.env.VITE_API_URL;
const token = () => localStorage.getItem("token");

// ── inject CSS ───────────────────────────────────────────────
function injectCSS() {
  if (document.getElementById("cp-css")) return;
  const s = document.createElement("style");
  s.id = "cp-css";
  s.textContent = `
/* ─── Page ─────────────────────────── */
.cp-wrap { font-family: inherit; }

.cp-topbar {
  display: flex; align-items: center;
  justify-content: space-between; margin-bottom: 22px;
}
.cp-topbar h1 {
  font-size: 1.45rem; font-weight: 700; color: #111827; margin: 0;
}
.cp-btn-create {
  display: inline-flex; align-items: center; gap: 6px;
  background: #111827; color: #fff; border: none;
  padding: 9px 18px; border-radius: 10px;
  font-size: .85rem; font-weight: 700;
  cursor: pointer; font-family: inherit;
  transition: opacity .15s;
}
.cp-btn-create:hover { opacity: .85; }

/* ─── Table card ────────────────────── */
.cp-card {
  background: #fff; border: 1px solid #e5e7eb;
  border-radius: 14px; overflow: hidden;
}
.cp-table {
  width: 100%; border-collapse: collapse;
}
.cp-table thead tr {
  border-bottom: 1px solid #f3f4f6;
}
.cp-table thead th {
  padding: 11px 18px;
  text-align: left; font-size: .72rem;
  font-weight: 700; color: #9ca3af;
  text-transform: uppercase; letter-spacing: .06em;
  white-space: nowrap;
}
.cp-table tbody tr {
  border-bottom: 1px solid #f9fafb;
  transition: background .12s;
}
.cp-table tbody tr:last-child { border-bottom: none; }
.cp-table tbody tr:hover { background: #fafafa; }
.cp-table td {
  padding: 14px 18px; font-size: .85rem;
  color: #374151; vertical-align: middle;
}

/* Category cell */
.cp-cat-cell { display: flex; align-items: center; gap: 12px; }
.cp-num {
  width: 30px; height: 30px; border-radius: 8px;
  background: #f3f4f6; border: 1px solid #e5e7eb;
  display: flex; align-items: center; justify-content: center;
  font-size: .8rem; font-weight: 700; color: #6b7280; flex-shrink: 0;
}
.cp-thumb {
  width: 38px; height: 38px; border-radius: 8px;
  object-fit: cover; border: 1px solid #e5e7eb; flex-shrink: 0;
}
.cp-no-img {
  width: 38px; height: 38px; border-radius: 8px;
  background: #f3f4f6; border: 1px solid #e5e7eb;
  display: flex; align-items: center; justify-content: center;
  font-size: 15px; flex-shrink: 0;
}
.cp-name { font-weight: 600; color: #111827; font-size: .88rem; }
.cp-desc { font-size: .74rem; color: #9ca3af; margin-top: 1px; }

/* Status */
.cp-active {
  display: inline-flex; align-items: center; gap: 5px;
  background: #f0fdf4; color: #16a34a;
  border: 1px solid #bbf7d0;
  font-size: .73rem; font-weight: 700;
  padding: 3px 10px; border-radius: 99px;
}
.cp-active::before {
  content: ''; width: 6px; height: 6px;
  background: #16a34a; border-radius: 50%;
}

/* Products count */
.cp-prod-count {
  display: flex; align-items: center; gap: 5px;
  color: #6b7280; font-size: .83rem;
}

/* Actions */
.cp-actions { display: flex; align-items: center; gap: 6px; }
.cp-icon-btn {
  width: 30px; height: 30px; border-radius: 7px;
  border: 1px solid #e5e7eb; background: #fff;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; transition: all .15s; color: #6b7280;
}
.cp-icon-btn:hover { background: #f3f4f6; color: #111827; border-color: #d1d5db; }
.cp-icon-btn.danger:hover { background: #fef2f2; color: #ef4444; border-color: #fecaca; }
.cp-dots {
  width: 30px; height: 30px; border-radius: 7px;
  border: 1px solid #e5e7eb; background: #fff;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; color: #9ca3af; font-weight: 700;
  font-size: 14px; letter-spacing: 1px;
  transition: all .15s;
}
.cp-dots:hover { background: #f3f4f6; color: #374151; }

/* Empty */
.cp-empty {
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  padding: 64px 20px; gap: 12px;
  color: #9ca3af;
}
.cp-empty span { font-size: 2.2rem; opacity: .35; }
.cp-empty p { font-size: .9rem; margin: 0; }

/* Spinner */
.cp-spinner {
  width: 26px; height: 26px;
  border: 2.5px solid #f0f0f0;
  border-top-color: #111827;
  border-radius: 50%;
  animation: cp-spin .7s linear infinite;
}
@keyframes cp-spin { to { transform: rotate(360deg); } }

/* ─── Modal overlay ─────────────────── */
.cp-overlay {
  position: fixed; inset: 0;
  background: rgba(0,0,0,.45);
  backdrop-filter: blur(3px);
  z-index: 1000;
  display: flex; align-items: center; justify-content: center;
  padding: 16px;
}
.cp-modal {
  background: #fff; border-radius: 16px;
  width: 100%; max-width: 480px;
  box-shadow: 0 24px 64px rgba(0,0,0,.18);
  overflow: hidden;
  animation: cp-modal-in .2s cubic-bezier(.32,.72,0,1);
  max-height: 90vh; overflow-y: auto;
}
@keyframes cp-modal-in {
  from { opacity:0; transform:scale(.95) translateY(10px); }
  to   { opacity:1; transform:scale(1) translateY(0); }
}

/* Modal header */
.cp-modal-head {
  display: flex; align-items: center; justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid #f3f4f6;
  position: sticky; top: 0; background: #fff; z-index: 1;
}
.cp-modal-head h2 {
  font-size: .95rem; font-weight: 700; color: #111827; margin: 0;
}
.cp-close-btn {
  width: 28px; height: 28px; border-radius: 7px;
  border: 1px solid #e5e7eb; background: #fff;
  cursor: pointer; display: flex; align-items: center;
  justify-content: center; color: #6b7280; font-size: 13px;
  transition: all .15s;
}
.cp-close-btn:hover { background: #f3f4f6; color: #111827; }

/* Modal body sections */
.cp-modal-body { padding: 0; }
.cp-section {
  padding: 18px 20px;
  border-bottom: 1px solid #f9fafb;
}
.cp-section-title {
  font-size: .7rem; font-weight: 700;
  color: #9ca3af; text-transform: uppercase;
  letter-spacing: .07em; margin: 0 0 14px;
  padding-bottom: 10px; border-bottom: 1px solid #f3f4f6;
}
.cp-field { margin-bottom: 14px; }
.cp-field:last-child { margin-bottom: 0; }
.cp-label {
  display: block; font-size: .8rem; font-weight: 600;
  color: #374151; margin-bottom: 6px;
}
.cp-label .req { color: #ef4444; margin-right: 2px; }
.cp-input {
  width: 100%; padding: 10px 12px; border-radius: 10px;
  border: 1px solid #e5e7eb; background: #f9fafb;
  font-family: inherit; font-size: .88rem; color: #111827;
  outline: none; transition: all .15s; box-sizing: border-box;
}
.cp-input:focus {
  border-color: #111827; background: #fff;
  box-shadow: 0 0 0 3px rgba(17,24,39,.06);
}
.cp-input::placeholder { color: #9ca3af; }
.cp-textarea { min-height: 80px; resize: vertical; }

/* Sort + Active row */
.cp-sort-row {
  display: flex; align-items: flex-end; gap: 16px;
}
.cp-sort-col { flex: 1; }
.cp-sort-hint {
  font-size: .72rem; color: #9ca3af; margin-top: 5px;
}

/* Toggle */
.cp-toggle-wrap {
  display: flex; align-items: center; gap: 10px; margin-bottom: 6px;
}
.cp-toggle {
  position: relative; width: 40px; height: 22px; cursor: pointer;
}
.cp-toggle input { display: none; }
.cp-toggle-track {
  position: absolute; inset: 0; border-radius: 99px;
  background: #d1d5db; transition: background .2s;
}
.cp-toggle input:checked ~ .cp-toggle-track { background: #111827; }
.cp-toggle-thumb {
  position: absolute; top: 3px; left: 3px;
  width: 16px; height: 16px; border-radius: 50%;
  background: #fff; transition: transform .2s;
  box-shadow: 0 1px 3px rgba(0,0,0,.2);
}
.cp-toggle input:checked ~ .cp-toggle-thumb { transform: translateX(18px); }
.cp-toggle-label {
  font-size: .88rem; font-weight: 600; color: #374151;
}

/* Add Products btn */
.cp-add-prod {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 8px 14px; border-radius: 8px;
  border: 1px solid #e5e7eb; background: #fff;
  color: #374151; font-size: .82rem; font-weight: 600;
  cursor: pointer; font-family: inherit; transition: all .15s;
}
.cp-add-prod:hover { background: #f3f4f6; border-color: #d1d5db; }
.cp-prod-hint { font-size: .76rem; color: #9ca3af; margin: 0 0 10px; }

/* Modal footer */
.cp-modal-foot {
  padding: 14px 20px;
  border-top: 1px solid #f3f4f6;
  display: flex; gap: 8px;
  position: sticky; bottom: 0; background: #fff; z-index: 1;
}
.cp-btn-cancel {
  padding: 10px 18px; border-radius: 10px;
  border: 1px solid #e5e7eb; background: #fff;
  color: #374151; font-size: .88rem; font-weight: 600;
  cursor: pointer; font-family: inherit; transition: all .15s;
}
.cp-btn-cancel:hover { background: #f3f4f6; }
.cp-btn-save {
  flex: 1; padding: 10px 0; border-radius: 10px;
  background: #111827; color: #fff; border: none;
  font-size: .88rem; font-weight: 700;
  cursor: pointer; font-family: inherit; transition: opacity .15s;
}
.cp-btn-save:hover { opacity: .87; }
.cp-btn-save:disabled { opacity: .45; cursor: not-allowed; }

/* Toast */
.cp-toast {
  position: fixed; top: 20px; left: 50%;
  transform: translateX(-50%);
  background: #111827; color: #fff;
  padding: 10px 24px; border-radius: 99px;
  font-size: .84rem; font-weight: 500;
  z-index: 9999; white-space: nowrap;
  box-shadow: 0 4px 20px rgba(0,0,0,.18);
  animation: cp-toast-in .2s ease;
}
@keyframes cp-toast-in { from { opacity:0; transform:translateX(-50%) translateY(-8px); } }
.cp-toast.err { background: #ef4444; }
  `;
  document.head.appendChild(s);
}

// ── Modal ─────────────────────────────────────────────────────
function CategoryModal({ mode, initial, onSave, onClose, saving }) {
  const [name,     setName]     = useState(initial?.name     || "");
  const [desc,     setDesc]     = useState(initial?.desc     || "");
  const [image,    setImage]    = useState(initial?.image    || "");
  const [sortOrder,setSortOrder]= useState(initial?.sortOrder ?? 0);
  const [active,   setActive]   = useState(initial?.active   ?? true);

  const isEdit = mode === "edit";

  return (
    <div className="cp-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="cp-modal">

        {/* Header */}
        <div className="cp-modal-head">
          <h2>{isEdit ? "Edit Category" : "Create Category"}</h2>
          <button className="cp-close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="cp-modal-body">

          {/* ── Basic Information ── */}
          <div className="cp-section">
            <p className="cp-section-title">Basic Information</p>

            <div className="cp-field">
              <label className="cp-label">
                <span className="req">*</span> Category Name
              </label>
              <input
                className="cp-input"
                placeholder="Enter category name"
                value={name}
                onChange={e => setName(e.target.value)}
                autoFocus
              />
            </div>

            <div className="cp-field">
              <label className="cp-label">Description</label>
              <textarea
                className="cp-input cp-textarea"
                placeholder="Enter category description (optional)"
                value={desc}
                onChange={e => setDesc(e.target.value)}
              />
            </div>
          </div>

          {/* ── Category Image ── */}
          <div className="cp-section">
            <p className="cp-section-title">Category Image</p>
            <ImageUploader
              value={image}
              onChange={setImage}
              label="Category Image"
              aspect="wide"
              dark={false}
            />
          </div>

          {/* ── Sort Order + Active ── */}
          <div className="cp-section">
            <p className="cp-section-title">Settings</p>
            <div className="cp-sort-row">
              <div className="cp-sort-col">
                <label className="cp-label">Sort Order</label>
                <input
                  className="cp-input"
                  type="number"
                  min="0"
                  value={sortOrder}
                  onChange={e => setSortOrder(Number(e.target.value))}
                  style={{ maxWidth: 120 }}
                />
                <p className="cp-sort-hint">Lower numbers appear first</p>
              </div>
              <div style={{ paddingBottom: 24 }}>
                <label className="cp-toggle">
                  <input
                    type="checkbox"
                    checked={active}
                    onChange={e => setActive(e.target.checked)}
                  />
                  <div className="cp-toggle-track" />
                  <div className="cp-toggle-thumb" />
                </label>
                <span className="cp-toggle-label" style={{ fontSize: ".82rem", color: "#374151" }}>
                  &nbsp; Active
                </span>
              </div>
            </div>
          </div>

          {/* ── Products ── */}
          <div className="cp-section">
            <p className="cp-section-title">Products</p>
            <p className="cp-prod-hint">Select products to include in this category</p>
            <button className="cp-add-prod" disabled>
              <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              Add Products
            </button>
          </div>

        </div>

        {/* Footer */}
        <div className="cp-modal-foot">
          <button className="cp-btn-cancel" onClick={onClose}>Cancel</button>
          <button
            className="cp-btn-save"
            disabled={saving}
            onClick={() => onSave({ name, desc, image, sortOrder, active })}
          >
            {saving ? "Saving..." : isEdit ? "Save Changes" : "Create Category"}
          </button>
        </div>

      </div>
    </div>
  );
}

// ── Main ─────────────────────────────────────────────────────
export default function CategoriesPage() {
  const navigate = useNavigate();

  const [cats,    setCats]    = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [notif,   setNotif]   = useState(null);
  const [modal,   setModal]   = useState(null);

  useEffect(() => { injectCSS(); }, []);

  const toast = (msg, type = "ok") => {
    setNotif({ msg, type });
    setTimeout(() => setNotif(null), 3000);
  };

  const load = async () => {
    try {
      const r = await fetch(`${API()}/api/categories/my-categories`, {
        headers: { Authorization: `Bearer ${token()}` },
      });
      const d = await r.json();
      if (Array.isArray(d)) setCats(d);
    } catch {}
    finally { setLoading(false); }
  };

  useEffect(() => {
    if (!token()) { navigate("/login"); return; }
    load();
  }, []);

  const handleCreate = async ({ name, image }) => {
    if (!name.trim()) return toast("اكتب اسم التصنيف", "err");
    setSaving(true);
    try {
      const r = await fetch(`${API()}/api/categories/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}` },
        body: JSON.stringify({ name, image }),
      });
      const d = await r.json();
      if (r.ok) { toast("✅ تم إنشاء التصنيف"); setModal(null); load(); }
      else toast(d.message, "err");
    } catch { toast("خطأ ❌", "err"); }
    finally { setSaving(false); }
  };

  const handleEdit = async ({ name, image }) => {
    if (!name.trim()) return toast("اكتب اسم التصنيف", "err");
    setSaving(true);
    try {
      const r = await fetch(`${API()}/api/categories/update/${modal.cat._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}` },
        body: JSON.stringify({ name, image }),
      });
      const d = await r.json();
      if (r.ok) {
        toast("✅ تم التعديل");
        setModal(null);
        setCats(p => p.map(c => c._id === modal.cat._id ? d.category : c));
      } else toast(d.message, "err");
    } catch { toast("خطأ ❌", "err"); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("متأكد من حذف هذا التصنيف؟")) return;
    try {
      const r = await fetch(`${API()}/api/categories/delete/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token()}` },
      });
      if (r.ok) { setCats(p => p.filter(c => c._id !== id)); toast("✅ تم الحذف"); }
    } catch { toast("خطأ ❌", "err"); }
  };

  return (
    <div className="cp-wrap" dir="ltr">

      {/* Toast */}
      {notif && <div className={`cp-toast ${notif.type === "err" ? "err" : ""}`}>{notif.msg}</div>}

      {/* Modal */}
      {modal === "create" && (
        <CategoryModal mode="create" onSave={handleCreate} onClose={() => setModal(null)} saving={saving} />
      )}
      {modal?.mode === "edit" && (
        <CategoryModal mode="edit" initial={modal.cat} onSave={handleEdit} onClose={() => setModal(null)} saving={saving} />
      )}

      {/* Top bar */}
      <div className="cp-topbar">
        <h1>Categories</h1>
        <button className="cp-btn-create" onClick={() => setModal("create")}>
          <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Create Category
        </button>
      </div>

      {/* Table */}
      <div className="cp-card">
        {loading ? (
          <div className="cp-empty"><div className="cp-spinner" /></div>
        ) : cats.length === 0 ? (
          <div className="cp-empty">
            <span>📁</span>
            <p>No categories yet — create your first one</p>
          </div>
        ) : (
          <table className="cp-table">
            <thead>
              <tr>
                <th>Category</th>
                <th>Products</th>
                <th>Sort Order</th>
                <th>Status</th>
                <th>Created</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {cats.map((cat, i) => (
                <tr key={cat._id}>

                  {/* Category */}
                  <td>
                    <div className="cp-cat-cell">
                      <div className="cp-num">{i + 1}</div>
                      {cat.image
                        ? <img src={cat.image} alt={cat.name} className="cp-thumb" onError={e => e.target.style.display = "none"} />
                        : <div className="cp-no-img">📁</div>
                      }
                      <div>
                        <p className="cp-name" style={{ margin: 0 }}>{cat.name}</p>
                        <p className="cp-desc" style={{ margin: 0 }}>{cat.name}</p>
                      </div>
                    </div>
                  </td>

                  {/* Products */}
                  <td>
                    <div className="cp-prod-count">
                      <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                        <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/>
                      </svg>
                      0
                    </div>
                  </td>

                  {/* Sort Order */}
                  <td style={{ color: "#6b7280" }}>{i + 1}</td>

                  {/* Status */}
                  <td><span className="cp-active">Active</span></td>

                  {/* Created */}
                  <td style={{ color: "#9ca3af", fontSize: ".8rem", whiteSpace: "nowrap" }}>
                    {new Date(cat.createdAt).toLocaleDateString("en-US", {
                      month: "numeric", day: "numeric", year: "numeric"
                    })}
                  </td>

                  {/* Actions */}
                  <td>
                    <div className="cp-actions" style={{ justifyContent: "flex-end" }}>
                      <button
                        className="cp-icon-btn"
                        title="Edit"
                        onClick={() => setModal({ mode: "edit", cat })}
                      >
                        <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                          <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                      </button>
                      <button
                        className="cp-icon-btn danger"
                        title="Delete"
                        onClick={() => handleDelete(cat._id)}
                      >
                        <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <polyline points="3 6 5 6 21 6"/>
                          <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
                          <path d="M10 11v6M14 11v6"/>
                          <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
                        </svg>
                      </button>
                      <button className="cp-dots">···</button>
                    </div>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}