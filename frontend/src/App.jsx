// ============================================================
// 📁 App.jsx — Router الرئيسي
// ✦ Day 18: ربط AppLayout مع كل صفحات الداشبورد
// ============================================================

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// ── Pages ──────────────────────────────────────────────────
import Login            from "./pages/Login";
import Register         from "./pages/Register";
import Dashboard        from "./pages/Dashboard";
import PublicStore      from "./pages/PublicStore";
import ProductDetails   from "./pages/ProductDetails";
import OrdersManagement from "./pages/OrdersManagement";
import Theme            from "./pages/Theme";
import OrderSuccess     from "./pages/OrderSuccess";

// ── Layout + Auth ───────────────────────────────────────────
import ProtectedRoute   from "./components/ProtectedRoute";
import AppLayout        from "./components/layout/AppLayout";

// ── Helper: يلف الصفحة بـ ProtectedRoute + AppLayout ───────
const DashPage = ({ component: Component, title }) => (
  <ProtectedRoute>
    <AppLayout title={title}>
      <Component />
    </AppLayout>
  </ProtectedRoute>
);

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Redirect */}
        <Route path="/" element={<Navigate to="/login" />} />

        {/* ── صفحات عامة ── */}
        <Route path="/login"         element={<Login />} />
        <Route path="/register"      element={<Register />} />
        <Route path="/order-success" element={<OrderSuccess />} />

        {/* ── صفحات الداشبورد (محمية + مع Layout) ── */}
        <Route path="/dashboard"
          element={<DashPage component={Dashboard}        title="Business Analytics" />} />
        <Route path="/dashboard/orders"
          element={<DashPage component={OrdersManagement} title="Orders" />} />
        <Route path="/theme"
          element={<DashPage component={Theme}            title="Themes" />} />

        {/* ── صفحات الزبائن ── */}
        <Route path="/store/:slug"                      element={<PublicStore />} />
        <Route path="/store/:slug/product/:productId"   element={<ProductDetails />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;