// ============================================================
// 📁 pages/OrdersManagement.jsx — Day 21
// ============================================================
import { useState, useEffect } from "react";

const API      = () => import.meta.env.VITE_API_URL;
const getToken = () => localStorage.getItem("token");

const STATUS_CONFIG = {
  pending:   { label: "قيد الانتظار", color: "#f59e0b", bg: "#fffbeb", border: "#fde68a" },
  shipped:   { label: "تم الشحن",     color: "#3b82f6", bg: "#eff6ff", border: "#bfdbfe" },
  delivered: { label: "تم التوصيل",   color: "#10b981", bg: "#f0fdf4", border: "#bbf7d0" },
  cancelled: { label: "ملغي",         color: "#ef4444", bg: "#fef2f2", border: "#fecaca" },
};

const StatusBadge = ({ status }) => {
  const cfg = STATUS_CONFIG[status] || { label: status, color: "#6b7280", bg: "#f3f4f6", border: "#e5e7eb" };
  return (
    <span style={{
      background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`,
      padding: "3px 10px", borderRadius: 99, fontSize: ".72rem", fontWeight: 700,
      display: "inline-flex", alignItems: "center", gap: 5, whiteSpace: "nowrap",
    }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: cfg.color, display: "inline-block" }} />
      {cfg.label}
    </span>
  );
};

const OrdersManagement = () => {
  const [orders,  setOrders]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");
  const [notif,   setNotif]   = useState(null);

  const notify = (msg, type = "success") => {
    setNotif({ msg, type });
    setTimeout(() => setNotif(null), 3000);
  };

  const fetchOrders = async () => {
    try {
      setLoading(true); setError("");
      const res = await fetch(`${API()}/api/orders/my-orders`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setOrders(data);
    } catch { setError("فشل في جلب الطلبات ❌"); }
    finally  { setLoading(false); }
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      const res = await fetch(`${API()}/api/orders/update-status/${orderId}`, {
        method:  "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
        body:    JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (!res.ok) return notify(data.message || "حدث خطأ ❌", "error");
      setOrders(prev => prev.map(o => o._id === orderId ? { ...o, status: newStatus } : o));
      notify("تم تحديث الحالة ✅");
    } catch { notify("خطأ في الاتصال ❌", "error"); }
  };

  useEffect(() => { fetchOrders(); }, []);

  if (loading) return (
    <div className="pp-loading">
      <div className="pp-spinner" />
      <p>جاري تحميل الطلبات...</p>
    </div>
  );

  if (error) return (
    <div className="pp-empty">
      <span>⚠️</span>
      <p style={{ color: "#ef4444" }}>{error}</p>
      <button className="pp-btn pp-btn--primary" onClick={fetchOrders}>إعادة المحاولة</button>
    </div>
  );

  // إحصائيات سريعة
  const stats = [
    { label: "الكل",    count: orders.length,                                        color: "#111827" },
    { label: "معلق",    count: orders.filter(o => o.status === "pending").length,   color: "#f59e0b" },
    { label: "مشحون",   count: orders.filter(o => o.status === "shipped").length,   color: "#3b82f6" },
    { label: "موصّل",   count: orders.filter(o => o.status === "delivered").length, color: "#10b981" },
    { label: "ملغي",    count: orders.filter(o => o.status === "cancelled").length, color: "#ef4444" },
  ];

  return (
    <div dir="rtl">

      {/* Toast */}
      {notif && (
        <div className={`pp-toast pp-toast--${notif.type}`}>
          {notif.type === "success" ? "✅" : "❌"} {notif.msg}
        </div>
      )}

      {/* Stats */}
      <div style={{ display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap" }}>
        {stats.map(s => (
          <div key={s.label} className="pp-card" style={{ padding: "14px 20px", flex: "1 1 80px", textAlign: "center", minWidth: 80 }}>
            <p style={{ fontSize: "1.4rem", fontWeight: 700, color: s.color, margin: 0 }}>{s.count}</p>
            <p style={{ fontSize: ".72rem", color: "#9ca3af", margin: 0 }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="pp-card" style={{ padding: 0, overflow: "hidden" }}>
        <div className="pp-card__header" style={{ padding: "16px 20px" }}>
          <h2 className="pp-card__title">🛒 الطلبات</h2>
          <button className="pp-btn pp-btn--ghost pp-btn--sm" onClick={fetchOrders}>🔄 تحديث</button>
        </div>

        {orders.length === 0 ? (
          <div className="pp-empty">
            <span>📭</span>
            <p>لا توجد طلبات بعد</p>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "right", fontSize: ".84rem" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #f0f0f0", background: "#f9fafb" }}>
                  {["الزبون", "الهاتف", "المنتج", "الولاية", "المبلغ", "الحالة", "إجراءات"].map(h => (
                    <th key={h} style={{ padding: "10px 16px", color: "#6b7280", fontWeight: 600, fontSize: ".75rem", whiteSpace: "nowrap" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {orders.map((order, i) => (
                  <tr key={order._id} style={{ borderBottom: "1px solid #f9fafb", background: i % 2 === 0 ? "#fff" : "#fafafa" }}>

                    {/* الزبون */}
                    <td style={{ padding: "12px 16px", whiteSpace: "nowrap" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{
                          width: 32, height: 32, borderRadius: "50%",
                          background: "#111827", color: "#fff",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontWeight: 700, fontSize: ".85rem", flexShrink: 0,
                        }}>
                          {order.customerName?.charAt(0).toUpperCase()}
                        </div>
                        <span style={{ fontWeight: 600, color: "#111827" }}>{order.customerName}</span>
                      </div>
                    </td>

                    {/* الهاتف */}
                    <td style={{ padding: "12px 16px" }}>
                      <span style={{ fontFamily: "monospace", background: "#f3f4f6", padding: "3px 8px", borderRadius: 6, fontSize: ".8rem", color: "#374151" }}>
                        {order.phone}
                      </span>
                    </td>

                    {/* المنتج */}
                    <td style={{ padding: "12px 16px", maxWidth: 160 }}>
                      <span style={{ color: "#374151", display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {order.productId?.name || <span style={{ color: "#fca5a5", fontSize: ".75rem" }}>منتج محذوف</span>}
                      </span>
                    </td>

                    {/* الولاية */}
                    <td style={{ padding: "12px 16px" }}>
                      <span style={{ color: "#6366f1", fontWeight: 600 }}>{order.shippingCity || "—"}</span>
                      {order.address && <p style={{ color: "#9ca3af", fontSize: ".72rem", margin: 0 }}>{order.address}</p>}
                    </td>

                    {/* المبلغ */}
                    <td style={{ padding: "12px 16px", whiteSpace: "nowrap" }}>
                      <span style={{ fontWeight: 700, color: "#10b981", fontFamily: "monospace" }}>
                        {(order.totalPrice || 0).toLocaleString()} دج
                      </span>
                    </td>

                    {/* الحالة */}
                    <td style={{ padding: "12px 16px" }}>
                      <StatusBadge status={order.status} />
                    </td>

                    {/* الإجراءات */}
                    <td style={{ padding: "12px 16px" }}>
                      <div style={{ display: "flex", gap: 6, justifyContent: "flex-end", flexWrap: "wrap" }}>
                        {order.status === "pending" && (
                          <button className="pp-btn pp-btn--sm"
                            style={{ background: "#eff6ff", color: "#3b82f6", border: "1px solid #bfdbfe" }}
                            onClick={() => handleUpdateStatus(order._id, "shipped")}>
                            📦 شحن
                          </button>
                        )}
                        {order.status === "shipped" && (
                          <button className="pp-btn pp-btn--sm"
                            style={{ background: "#f0fdf4", color: "#10b981", border: "1px solid #bbf7d0" }}
                            onClick={() => handleUpdateStatus(order._id, "delivered")}>
                            ✅ توصيل
                          </button>
                        )}
                        {(order.status === "pending" || order.status === "shipped") && (
                          <button className="pp-btn pp-btn--danger pp-btn--sm"
                            onClick={() => handleUpdateStatus(order._id, "cancelled")}>
                            ✕ إلغاء
                          </button>
                        )}
                        {(order.status === "delivered" || order.status === "cancelled") && (
                          <span style={{ fontSize: ".72rem", color: "#9ca3af", fontStyle: "italic" }}>نهائي</span>
                        )}
                      </div>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>

            <div style={{ borderTop: "1px solid #f0f0f0", padding: "10px 20px" }}>
              <p style={{ fontSize: ".75rem", color: "#9ca3af", margin: 0 }}>
                إجمالي <strong style={{ color: "#374151" }}>{orders.length}</strong> طلب
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersManagement;