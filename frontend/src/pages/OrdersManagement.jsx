import React, { useState, useEffect } from "react";
import axios from "axios";

const OrdersManagement = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // 1. جلب الطلبات الخاصة بالمتجر بمجرد فتح الصفحة
  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token"); 
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/orders/my-orders`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setOrders(response.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError("فشل في جلب الطلبات ❌");
      setLoading(false);
    }
  };

  // 2. دالة تحديث حالة الطلب المعدلة لتتوافق 100% مع الباك-أند الخاص بك
  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      const token = localStorage.getItem("token");
      
      // التعديل الجوهري: إرسال الطلب متوافق مع شروط حماية وتوقعات السيرفر لديك
      await axios.put(
        `${import.meta.env.VITE_API_URL}/api/orders/update-status/${orderId}`,
        { status: newStatus },
        { 
          headers: { 
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}` 
          } 
        }
      );
      
      // تحديث الحالة في الواجهة فوراً بدون الحاجة لعمل Refresh للصحفة
      setOrders(
        orders.map((order) =>
          order._id === orderId ? { ...order, status: newStatus } : order
        )
      );

      alert("تم تحديث حالة الطلب بنجاح! 🎉");
    } catch (err) {
      console.error("تفاصيل الخطأ كاملة:", err.response || err);
      alert("حدث خطأ أثناء تحديث حالة الطلب ❌");
    }
  };

  // دالة مساعدة لتلوين "شارة" الحالة (Status Badge)
  const getStatusBadge = (status) => {
    switch (status) {
      case "pending":
        return <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">قيد الانتظار 🟡</span>;
      case "shipped":
        return <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">تم الشحن 🔵</span>;
      case "delivered":
        return <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">تم التوصيل 🟢</span>;
      case "cancelled":
        return <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">ملغي 🔴</span>;
      default:
        return <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm">{status || "غير معروف"}</span>;
    }
  };

  if (loading) return <div className="text-center py-10 font-bold text-slate-600">جاري تحميل الطلبات... 📦</div>;
  if (error) return <div className="text-center py-10 text-red-500 font-bold">{error}</div>;

  return (
    <div className="p-6 bg-gray-50 min-h-screen" dir="rtl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">إدارة الطلبات المتقدمة 📋</h1>
        <span className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-semibold shadow">
          إجمالي الطلبات: {orders.length}
        </span>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white p-8 text-center rounded-xl shadow border text-gray-500 font-medium">
          لا توجد أي طلبات مسجلة في متجرك حالياً 📭
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="bg-gray-100 text-gray-700 border-b">
                  <th className="p-4 font-semibold">الزبون</th>
                  <th className="p-4 font-semibold">الهاتف</th>
                  <th className="p-4 font-semibold">المنتج</th>
                  <th className="p-4 font-semibold">الولاية / العنوان</th>
                  <th className="p-4 font-semibold">السعر الإجمالي</th>
                  <th className="p-4 font-semibold">الحالة</th>
                  <th className="p-4 font-semibold text-center">إجراءات التحكم</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order._id} className="border-b hover:bg-gray-50 transition-colors">
                    <td className="p-4 font-medium text-gray-900">{order.customerName}</td>
                    <td className="p-4 text-gray-600 font-mono">{order.phone}</td>
                    <td className="p-4 text-gray-800">
                      {order.productId ? order.productId.name : <span className="text-red-400">منتج محذوف</span>}
                    </td>
                    <td className="p-4 text-gray-600">
                      <span className="font-bold text-indigo-600">{order.shippingCity || "غير محدد"}</span>
                      <p className="text-xs text-gray-400">{order.address}</p>
                    </td>
                    <td className="p-4 font-bold text-green-600">{order.totalPrice || order.productId?.currentPrice} دج</td>
                    <td className="p-4">{getStatusBadge(order.status)}</td>
                    <td className="p-4">
                      <div className="flex justify-center gap-2">
                        {order.status !== "shipped" && order.status !== "delivered" && order.status !== "cancelled" && (
                          <button
                            onClick={() => handleUpdateStatus(order._id, "shipped")}
                            className="bg-blue-600 text-white px-3 py-1 rounded-md text-xs font-semibold hover:bg-blue-700 transition"
                          >
                            شحن 📦
                          </button>
                        )}
                        {order.status === "shipped" && (
                          <button
                            onClick={() => handleUpdateStatus(order._id, "delivered")}
                            className="bg-green-600 text-white px-3 py-1 rounded-md text-xs font-semibold hover:bg-green-700 transition"
                          >
                            توصيل ✅
                          </button>
                        )}
                        {order.status !== "cancelled" && order.status !== "delivered" && (
                          <button
                            onClick={() => handleUpdateStatus(order._id, "cancelled")}
                            className="bg-red-50 text-red-600 border border-red-200 px-3 py-1 rounded-md text-xs font-semibold hover:bg-red-100 transition"
                          >
                            إلغاء ❌
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersManagement;