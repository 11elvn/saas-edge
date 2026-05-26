// ============================================================
// 📁 App.jsx
// ✦ إضافة ProtectedRoute على كل صفحة تحتاج token
// ============================================================
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login          from "./pages/Login";
import Register       from "./pages/Register";
import Dashboard      from "./pages/Dashboard";
import PublicStore    from "./pages/PublicStore";
import ProductDetails from "./pages/ProductDetails";
import OrdersManagement from "./pages/OrdersManagement";
import Theme          from "./pages/Theme";

// ✦ المكون الجديد — يحمي الصفحات اللي تحتاج token
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* التوجيه التلقائي */}
        <Route path="/" element={<Navigate to="/login" />} />

        {/* ✦ صفحات عامة — لا تحتاج token */}
        <Route path="/login"    element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* ✦ صفحات محمية — تحتاج token */}
        <Route path="/dashboard" element={
          <ProtectedRoute><Dashboard /></ProtectedRoute>
        } />
        <Route path="/theme" element={
          <ProtectedRoute><Theme /></ProtectedRoute>
        } />
        <Route path="/dashboard/orders" element={
          <ProtectedRoute><OrdersManagement /></ProtectedRoute>
        } />

        {/* ✦ صفحات عامة للزبائن — لا تحتاج token */}
        <Route path="/store/:slug"                    element={<PublicStore />} />
        <Route path="/store/:slug/product/:productId" element={<ProductDetails />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;