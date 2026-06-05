// ============================================================
// 📁 pages/CategoriesPage.jsx — Day 20
// إدارة التصنيفات: إضافة + حذف
// ============================================================

import { useEffect, useState } from "react";
import { useNavigate }         from "react-router-dom";

const API   = () => import.meta.env.VITE_API_URL;
const token = () => localStorage.getItem("token");

function CategoriesPage() {
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [newName,    setNewName]    = useState("");
  const [loading,    setLoading]    = useState(true);
  const [notif,      setNotif]      = useState(null);

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

  const createCategory = async () => {
    if (!newName.trim()) return notify("اكتب اسم التصنيف أولاً", "error");
    try {
      const res  = await fetch(`${API()}/api/categories/create`, {
        method:  "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}` },
        body:    JSON.stringify({ name: newName }),
      });
      const data = await res.json();
      if (res.ok) {
        notify("تم إنشاء التصنيف ✅");
        setNewName("");
        fetchCategories();
      } else {
        notify(data.message, "error");
      }
    } catch (e) { console.error(e); }
  };

  const deleteCategory = async (id) => {
    if (!window.confirm("سيتم فك ارتباط المنتجات بهذا التصنيف. متأكد؟")) return;
    try {
      const res  = await fetch(`${API()}/api/categories/delete/${id}`, {
        method:  "DELETE",
        headers: { Authorization: `Bearer ${token()}` },
      });
      const data = await res.json();
      if (res.ok) {
        setCategories((prev) => prev.filter((c) => c._id !== id));
        notify(data.message || "تم الحذف ✅");
      }
    } catch (e) { console.error(e); }
  };

  return (
    <div style={{ maxWidth: 640 }} dir="rtl">

      {notif && (
        <div className={`pp-toast pp-toast--${notif.type}`}>
          {notif.type === "success" ? "✅" : "❌"} {notif.msg}
        </div>
      )}

      <div className="pp-card">
        <div className="pp-card__header">
          <h2 className="pp-card__title">📁 إدارة التصنيفات</h2>
          <span className="pp-badge">{categories.length} تصنيف</span>
        </div>

        {/* فورم الإضافة */}
        <div style={{ display: "flex", gap: 10, marginBottom: 24 }}>
          <input
            className="pp-input"
            placeholder="اسم التصنيف الجديد (مثال: إلكترونيات، أحذية...)"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && createCategory()}
          />
          <button className="pp-btn pp-btn--primary" style={{ whiteSpace: "nowrap" }}
            onClick={createCategory}>
            + إضافة
          </button>
        </div>

        {/* قائمة التصنيفات */}
        {loading ? (
          <div className="pp-loading" style={{ height: 120 }}>
            <div className="pp-spinner" />
          </div>
        ) : categories.length === 0 ? (
          <div className="pp-empty">
            <span>📁</span>
            <p>لا توجد تصنيفات بعد</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            {categories.map((cat) => (
              <div key={cat._id} style={{
                display: "flex", alignItems: "center", gap: 8,
                background: "#f3f4f6", border: "1px solid #e5e7eb",
                borderRadius: 99, padding: "6px 14px 6px 10px",
                fontSize: ".85rem", fontWeight: 600, color: "#374151",
              }}>
                <span>{cat.name}</span>
                <button
                  onClick={() => deleteCategory(cat._id)}
                  style={{
                    background: "none", border: "none", cursor: "pointer",
                    color: "#9ca3af", fontSize: ".9rem", lineHeight: 1,
                    transition: "color .15s", padding: 0,
                  }}
                  onMouseEnter={(e) => e.target.style.color = "#ef4444"}
                  onMouseLeave={(e) => e.target.style.color = "#9ca3af"}
                >✕</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default CategoriesPage;