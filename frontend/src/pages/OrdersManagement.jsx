// ============================================================
// 📁 OrdersManagement.jsx
// تحويل axios → fetch كامل + تصميم داكن احترافي
// ============================================================
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // ✦ useNavigate بدل <a href>

const OrdersManagement = () => {
  const [orders,  setOrders]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");

  const navigate = useNavigate(); // ✦ للتنقل بدون reload

  // ✦ token يُقرأ داخل الدوال — لا خارجها
  const getToken = () => localStorage.getItem("token");

  useEffect(() => {
    fetchOrders();
  }, []);

  // ==============================
  // GET ORDERS — fetch بدل axios
  // ==============================
  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/orders/my-orders`,
        { headers: { Authorization: `Bearer ${getToken()}` } }
      );

      if (!res.ok) throw new Error("فشل جلب الطلبات");

      const data = await res.json();
      setOrders(data);

    } catch (err) {
      console.error("fetchOrders error:", err);
      setError("فشل في جلب الطلبات، يرجى تحديث الصفحة ❌");
    } finally {
      setLoading(false);
    }
  };

  // ==============================
  // UPDATE STATUS — fetch بدل axios
  // ==============================
  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/orders/update-status/${orderId}`,
        {
          method:  "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization:  `Bearer ${getToken()}`,
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "حدث خطأ ❌");
        return;
      }

      // ✦ تحديث الـ state مباشرة بدون re-fetch
      setOrders(prev =>
        prev.map(order =>
          order._id === orderId ? { ...order, status: newStatus } : order
        )
      );

    } catch (err) {
      console.error("updateStatus error:", err);
      alert("خطأ في الاتصال بالخادم ❌");
    }
  };

  // ==============================
  // STATUS CONFIG
  // ==============================
  const STATUS_CONFIG = {
    pending:   { label: "قيد الانتظار", dot: "bg-amber-400",   bg: "bg-amber-400/10",   text: "text-amber-400"   },
    shipped:   { label: "تم الشحن",     dot: "bg-blue-400",    bg: "bg-blue-400/10",    text: "text-blue-400"    },
    delivered: { label: "تم التوصيل",   dot: "bg-emerald-400", bg: "bg-emerald-400/10", text: "text-emerald-400" },
    cancelled: { label: "ملغي",         dot: "bg-red-400",     bg: "bg-red-400/10",     text: "text-red-400"     },
  };

  const StatusBadge = ({ status }) => {
    const cfg = STATUS_CONFIG[status] || {
      label: status,
      dot:  "bg-slate-400",
      bg:   "bg-slate-400/10",
      text: "text-slate-400",
    };
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${cfg.bg} ${cfg.text}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
        {cfg.label}
      </span>
    );
  };

  // ==============================
  // LOADING
  // ==============================
  if (loading) return (
    <div className="min-h-screen bg-[#080c14] flex items-center justify-center" dir="rtl">
      <div className="text-center space-y-4">
        <div className="w-12 h-12 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-slate-400 text-sm tracking-widest uppercase">جاري تحميل الطلبات</p>
      </div>
    </div>
  );

  // ==============================
  // ERROR
  // ==============================
  if (error) return (
    <div className="min-h-screen bg-[#080c14] flex items-center justify-center" dir="rtl">
      <div className="text-center space-y-4">
        <div className="text-4xl">⚠️</div>
        <p className="text-red-400 font-semibold">{error}</p>
        <button
          onClick={fetchOrders}
          className="bg-indigo-600 text-white px-6 py-2 rounded-xl font-semibold hover:bg-indigo-700 transition"
        >
          إعادة المحاولة
        </button>
      </div>
    </div>
  );

  // ==============================
  // RENDER
  // ==============================
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@400;500;600;700&family=Space+Mono:wght@400;700&display=swap');
        .orders-page { font-family: 'IBM Plex Sans Arabic', sans-serif; }
        .mono { font-family: 'Space Mono', monospace; }
        .table-row:hover td { background: rgba(255,255,255,0.02); }
      `}</style>

      <div className="orders-page min-h-screen bg-[#080c14] text-slate-200 pb-16" dir="rtl">

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            HEADER
        ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <div className="border-b border-white/5 bg-[#0d1220]">
          <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between flex-wrap gap-4">

            <div className="flex items-center gap-3">
              {/* ✦ زر العودة — useNavigate بدل <a href> لمنع reload */}
              <button
                onClick={() => navigate("/dashboard")}
                className="w-9 h-9 rounded-xl bg-white/5 border border-white/[0.08] flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all"
              >
                ←
              </button>
              <div>
                <h1 className="text-lg font-bold text-white">إدارة الطلبات</h1>
                <p className="text-xs text-slate-500 mt-0.5">تتبع وإدارة جميع طلبات متجرك</p>
              </div>
            </div>

            {/* إحصائيات سريعة في الهيدر */}
            <div className="flex items-center gap-3 flex-wrap">
              {[
                { label: "الكل",    count: orders.length,                                          color: "text-slate-300"  },
                { label: "معلق",    count: orders.filter(o => o.status === "pending").length,   color: "text-amber-400"  },
                { label: "مشحون",   count: orders.filter(o => o.status === "shipped").length,   color: "text-blue-400"   },
                { label: "موصّل",   count: orders.filter(o => o.status === "delivered").length, color: "text-emerald-400"},
                { label: "ملغي",    count: orders.filter(o => o.status === "cancelled").length, color: "text-red-400"    },
              ].map(stat => (
                <div key={stat.label} className="bg-white/5 border border-white/[0.08] rounded-xl px-4 py-2 text-center min-w-[64px]">
                  <p className={`mono text-lg font-bold ${stat.color}`}>{stat.count}</p>
                  <p className="text-xs text-slate-500">{stat.label}</p>
                </div>
              ))}
            </div>

          </div>
        </div>

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            CONTENT
        ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <div className="max-w-7xl mx-auto px-6 mt-8">

          {orders.length === 0 ? (
            <div className="bg-[#0d1220] border border-white/5 rounded-2xl text-center py-20">
              <div className="text-5xl mb-4 opacity-30">📭</div>
              <p className="text-slate-400 font-medium">لا توجد طلبات بعد</p>
              <p className="text-slate-600 text-sm mt-1">شارك رابط متجرك لتبدأ في استقبال الطلبات</p>
            </div>
          ) : (
            <div className="bg-[#0d1220] border border-white/5 rounded-2xl overflow-hidden">

              <div className="overflow-x-auto">
                <table className="w-full text-right">
                  <thead>
                    <tr className="border-b border-white/5">
                      {["الزبون", "رقم الهاتف", "المنتج", "الولاية", "المبلغ", "الحالة", "إجراءات"].map(h => (
                        <th key={h} className="px-5 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-white/5">
                    {orders.map((order) => (
                      <tr key={order._id} className="table-row transition-colors">

                        {/* الزبون */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                              {order.customerName?.charAt(0).toUpperCase()}
                            </div>
                            <span className="font-semibold text-white text-sm whitespace-nowrap">
                              {order.customerName}
                            </span>
                          </div>
                        </td>

                        {/* الهاتف */}
                        <td className="px-5 py-4">
                          <span className="mono text-sm text-slate-400 bg-white/5 px-2.5 py-1 rounded-lg">
                            {order.phone}
                          </span>
                        </td>

                        {/* المنتج */}
                        <td className="px-5 py-4">
                          <span className="text-sm text-slate-300 max-w-[160px] truncate block">
                            {order.productId
                              ? order.productId.name
                              : <span className="text-red-400/70 text-xs">منتج محذوف</span>
                            }
                          </span>
                        </td>

                        {/* الولاية */}
                        <td className="px-5 py-4">
                          <div>
                            <span className="text-sm font-semibold text-indigo-400">
                              {order.shippingCity || "غير محدد"}
                            </span>
                            {order.address && (
                              <p className="text-xs text-slate-600 mt-0.5 max-w-[140px] truncate">
                                {order.address}
                              </p>
                            )}
                          </div>
                        </td>

                        {/* المبلغ */}
                        <td className="px-5 py-4">
                          <span className="mono text-sm font-bold text-emerald-400">
                            {(order.totalPrice || order.productId?.currentPrice || 0).toLocaleString()} دج
                          </span>
                        </td>

                        {/* الحالة */}
                        <td className="px-5 py-4">
                          <StatusBadge status={order.status} />
                        </td>

                        {/* الإجراءات */}
                        <td className="px-5 py-4">
                          <div className="flex items-center justify-end gap-2 flex-wrap">

                            {/* شحن — pending فقط */}
                            {order.status === "pending" && (
                              <button
                                onClick={() => handleUpdateStatus(order._id, "shipped")}
                                className="bg-blue-500/10 text-blue-400 border border-blue-500/20 px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-blue-500 hover:text-white hover:border-blue-500 transition-all whitespace-nowrap"
                              >
                                📦 شحن
                              </button>
                            )}

                            {/* توصيل — shipped فقط */}
                            {order.status === "shipped" && (
                              <button
                                onClick={() => handleUpdateStatus(order._id, "delivered")}
                                className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-emerald-500 hover:text-white hover:border-emerald-500 transition-all whitespace-nowrap"
                              >
                                ✅ توصيل
                              </button>
                            )}

                            {/* إلغاء — pending أو shipped فقط */}
                            {(order.status === "pending" || order.status === "shipped") && (
                              <button
                                onClick={() => handleUpdateStatus(order._id, "cancelled")}
                                className="bg-red-500/10 text-red-400 border border-red-500/20 px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-red-500 hover:text-white hover:border-red-500 transition-all whitespace-nowrap"
                              >
                                ✕ إلغاء
                              </button>
                            )}

                            {/* نهائي — delivered أو cancelled */}
                            {(order.status === "delivered" || order.status === "cancelled") && (
                              <span className="text-xs text-slate-600 italic">نهائي</span>
                            )}

                          </div>
                        </td>

                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Footer */}
              <div className="border-t border-white/5 px-5 py-3 flex items-center justify-between">
                <p className="text-xs text-slate-600">
                  إجمالي <span className="text-slate-400 font-semibold">{orders.length}</span> طلب
                </p>
                <button
                  onClick={fetchOrders}
                  className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
                >
                  🔄 تحديث
                </button>
              </div>

            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default OrdersManagement;