// ============================================================
// 📁 pages/CategoriesPage.jsx — Day 23 Update (with images)
// ============================================================
import { useEffect, useState }  from "react";
import { useNavigate }           from "react-router-dom";
import ImageUploader             from "../components/ui/ImageUploader";

const API   = () => import.meta.env.VITE_API_URL;
const token = () => localStorage.getItem("token");

// ── inline styles ────────────────────────────────────────────
const S = {
  page:    { maxWidth: 760, direction: "rtl" },
  grid:    { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16, marginTop: 8 },
  card:    {
    background: "#fff", border: "1px solid #f0f0f0", borderRadius: 16,
    overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,.04)",
    transition: "box-shadow .2s, transform .2s",
  },
  imgBox:  { width: "100%", height: 130, background: "#f9fafb", position: "relative", overflow: "hidden" },
  img:     { width: "100%", height: "100%", objectFit: "cover" },
  noImg:   {
    width: "100%", height: "100%", display: "flex", flexDirection: "column",
    alignItems: "center", justifyContent: "center", gap: 6,
    color: "#d1d5db", fontSize: 28,
  },
  cardBody:{ padding: "12px 14px 14px" },
  catName: { fontWeight: 700, fontSize: ".9rem", color: "#111827", marginBottom: 10 },
  actions: { display: "flex", gap: 8 },
  btnEdit: {
    flex: 1, padding: "7px 0", borderRadius: 8, border: "1px solid #e5e7eb",
    background: "#f9fafb", color: "#374151", fontSize: ".8rem", fontWeight: 600,
    cursor: "pointer", fontFamily: "inherit",
  },
  btnDel:  {
    padding: "7px 10px", borderRadius: 8, border: "1px solid #fee2e2",
    background: "#fef2f2", color: "#ef4444", fontSize: ".8rem", fontWeight: 600,
    cursor: "pointer", fontFamily: "inherit",
  },
  // Modal
  overlay: {
    position: "fixed", inset: 0, background: "rgba(0,0,0,.45)",
    zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center",
    padding: 16,
  },
  modal: {
    background: "#fff", borderRadius: 20, padding: "28px 24px",
    width: "100%", maxWidth: 420, boxShadow: "0 20px 60px rgba(0,0,0,.2)",
    direction: "rtl",
  },
  modalTitle: { fontWeight: 800, fontSize: "1.05rem", color: "#111827", marginBottom: 20 },
  label:   { display: "block", fontSize: ".78rem", color: "#6b7280", fontWeight: 600, marginBottom: 6 },
  input:   {
    width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid #e5e7eb",
    fontSize: ".9rem", outline: "none", fontFamily: "inherit", boxSizing: "border-box",
    marginBottom: 16, transition: "border-color .2s",
  },
  btnPrimary: {
    padding: "11px 0", borderRadius: 10, background: "#111827", color: "#fff",
    border: "none", fontWeight: 700, fontSize: ".9rem", cursor: "pointer",
    fontFamily: "inherit", width: "100%", marginTop: 4,
  },
  btnCancel: {
    padding: "11px 0", borderRadius: 10, background: "#f3f4f6", color: "#6b7280",
    border: "none", fontWeight: 600, fontSize: ".9rem", cursor: "pointer",
    fontFamily: "inherit", width: "100%", marginTop: 8,
  },
};

// ── Modal: Create / Edit ─────────────────────────────────────
function CategoryModal({ mode, initial, onSave, onClose, loading }) {
  const [name,  setName]  = useState(initial?.name  || "");
  const [image, setImage] = useState(initial?.image || "");

  return (
    <div style={S.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={S.modal}>
        <p style={S.modalTitle}>
          {mode === "create" ? "➕ إضافة تصنيف جديد" : "✏️ تعديل التصنيف"}
        </p>

        <label style={S.label}>اسم التصنيف *</label>
        <input
          style={S.input}
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="مثال: إلكترونيات، أحذية..."
          onKeyDown={e => e.key === "Enter" && onSave({ name, image })}
          autoFocus
        />

        <label style={S.label}>صورة التصنيف (اختياري)</label>
        <div style={{ marginBottom: 20 }}>
          <ImageUploader
            value={image}
            onChange={setImage}
            label="صورة التصنيف"
            aspect="wide"
            dark={false}
          />
        </div>

        <button
          style={{ ...S.btnPrimary, opacity: loading ? .6 : 1 }}
          onClick={() => onSave({ name, image })}
          disabled={loading}
        >
          {loading ? "⏳ جاري الحفظ..." : mode === "create" ? "إنشاء التصنيف" : "حفظ التعديلات"}
        </button>
        <button style={S.btnCancel} onClick={onClose}>إلغاء</button>
      </div>
    </div>
  );
}

// ── MAIN ─────────────────────────────────────────────────────
function CategoriesPage() {
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [saving,     setSaving]     = useState(false);
  const [notif,      setNotif]      = useState(null);
  const [modal,      setModal]      = useState(null); // null | "create" | { mode:"edit", cat }

  const notify = (msg, type = "success") => {
    setNotif({ msg, type });
    setTimeout(() => setNotif(null), 3000);
  };

  const fetchCategories = async () => {
    try {
      const res  = await fetch(`${API()}/api/categories/my-categories`, {
        headers: { Authorization: `Bearer ${token()}` },
      });
      const data = await res.json();
      if (Array.isArray(data)) setCategories(data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    if (!token()) { navigate("/login"); return; }
    fetchCategories();
  }, []);

  // ── Create ───────────────────────────────────────────────
  const handleCreate = async ({ name, image }) => {
    if (!name.trim()) return notify("اكتب اسم التصنيف أولاً", "error");
    setSaving(true);
    try {
      const res  = await fetch(`${API()}/api/categories/create`, {
        method:  "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}` },
        body:    JSON.stringify({ name, image }),
      });
      const data = await res.json();
      if (res.ok) {
        notify("تم إنشاء التصنيف ✅");
        setModal(null);
        fetchCategories();
      } else notify(data.message, "error");
    } catch { notify("خطأ في الاتصال ❌", "error"); }
    finally { setSaving(false); }
  };

  // ── Edit ─────────────────────────────────────────────────
  const handleEdit = async ({ name, image }) => {
    if (!name.trim()) return notify("اكتب اسم التصنيف", "error");
    setSaving(true);
    try {
      const res  = await fetch(`${API()}/api/categories/update/${modal.cat._id}`, {
        method:  "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}` },
        body:    JSON.stringify({ name, image }),
      });
      const data = await res.json();
      if (res.ok) {
        notify("تم التعديل ✅");
        setModal(null);
        setCategories(prev => prev.map(c => c._id === modal.cat._id ? data.category : c));
      } else notify(data.message, "error");
    } catch { notify("خطأ في الاتصال ❌", "error"); }
    finally { setSaving(false); }
  };

  // ── Delete ───────────────────────────────────────────────
  const handleDelete = async (id) => {
    if (!window.confirm("سيتم حذف هذا التصنيف. متأكد؟")) return;
    try {
      const res  = await fetch(`${API()}/api/categories/delete/${id}`, {
        method:  "DELETE",
        headers: { Authorization: `Bearer ${token()}` },
      });
      const data = await res.json();
      if (res.ok) {
        setCategories(prev => prev.filter(c => c._id !== id));
        notify("تم الحذف ✅");
      } else notify(data.message, "error");
    } catch { notify("خطأ في الاتصال ❌", "error"); }
  };

  return (
    <div style={S.page}>

      {/* Toast */}
      {notif && (
        <div className={`pp-toast pp-toast--${notif.type}`}>
          {notif.type === "success" ? "✅" : "❌"} {notif.msg}
        </div>
      )}

      {/* Modal */}
      {modal === "create" && (
        <CategoryModal mode="create" onSave={handleCreate} onClose={() => setModal(null)} loading={saving} />
      )}
      {modal?.mode === "edit" && (
        <CategoryModal mode="edit" initial={modal.cat} onSave={handleEdit} onClose={() => setModal(null)} loading={saving} />
      )}

      <div className="pp-card">
        {/* Header */}
        <div className="pp-card__header">
          <div>
            <h2 className="pp-card__title">📁 التصنيفات</h2>
            <p style={{ fontSize: ".78rem", color: "#9ca3af", margin: "2px 0 0" }}>
              أضف صور للتصنيفات باش تظهر في متجرك
            </p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span className="pp-badge">{categories.length} تصنيف</span>
            <button
              className="pp-btn pp-btn--primary"
              style={{ whiteSpace: "nowrap" }}
              onClick={() => setModal("create")}
            >+ تصنيف جديد</button>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="pp-loading" style={{ height: 180 }}>
            <div className="pp-spinner" />
          </div>
        ) : categories.length === 0 ? (
          <div className="pp-empty">
            <span>📁</span>
            <p>لا توجد تصنيفات بعد — أضف أول تصنيف</p>
          </div>
        ) : (
          <div style={S.grid}>
            {categories.map(cat => (
              <div
                key={cat._id}
                style={S.card}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,.1)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = "0 1px 4px rgba(0,0,0,.04)"; e.currentTarget.style.transform = "none"; }}
              >
                {/* Image */}
                <div style={S.imgBox}>
                  {cat.image ? (
                    <img src={cat.image} alt={cat.name} style={S.img} onError={e => e.target.style.display = "none"} />
                  ) : (
                    <div style={S.noImg}>
                      <span>📁</span>
                      <span style={{ fontSize: 11, color: "#d1d5db" }}>لا توجد صورة</span>
                    </div>
                  )}
                </div>

                {/* Body */}
                <div style={S.cardBody}>
                  <p style={S.catName}>{cat.name}</p>
                  <div style={S.actions}>
                    <button
                      style={S.btnEdit}
                      onClick={() => setModal({ mode: "edit", cat })}
                    >✏️ تعديل</button>
                    <button
                      style={S.btnDel}
                      onClick={() => handleDelete(cat._id)}
                    >🗑️</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default CategoriesPage;