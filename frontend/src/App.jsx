import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import PublicStore from "./pages/PublicStore"; // الصفحة العمومية للزبائن
import ProductDetails from "./pages/ProductDetails"; // صفحة تفاصيل المنتج الجديدة
import OrdersManagement from "./pages/OrdersManagement"; // استيراد صفحة إدارة الطلبات الكاملة

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* التوجيه التلقائي للصفحة الرئيسية إلى تسجيل الدخول */}
        <Route path="/" element={<Navigate to="/login" />} />

        {/* مسارات لوحة التحكم والتاجر */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        
        {/* المسار لجدول إدارة الطلبات الكامل بالأزرار الأربعة */}
        <Route path="/dashboard/orders" element={<OrdersManagement />} />

        {/* 🔄 التعديل 01: رابط المتجر العمومي للزبائن رجع بالـ :slug الاحترافي */}
        <Route path="/store/:slug" element={<PublicStore />} />

        {/* 🔄 التعديل 02: مسار تفاصيل المنتج حتا هو حدثناه ليعتمد على الـ :slug نتاع المتجر */}
        <Route path="/store/:slug/product/:productId" element={<ProductDetails />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;