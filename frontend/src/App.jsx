// ============================================================
// 📁 App.jsx — Router الرئيسي
// ✦ Day 18: ربط AppLayout مع كل صفحات الداشبورد
// ============================================================

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// ── Pages ──────────────────────────────────────────────────
import Login            from "./pages/Login";
import Register         from "./pages/Register";
import Dashboard        from "./pages/Dashboard";
import OverviewPage     from "./pages/OverviewPage";
import ProductsPage     from "./pages/ProductsPage";
import CategoriesPage   from "./pages/CategoriesPage";
import PublicStore        from "./pages/PublicStore";
import ProductDetails     from "./pages/ProductDetails";
import StoreCollections   from "./pages/StoreCollections";
import CategoryProducts   from "./pages/CategoryProducts";
import SearchResults    from "./pages/SearchResults";
import OrdersManagement from "./pages/OrdersManagement";
import Theme            from "./pages/Theme";
import ThemeEdit        from "./pages/ThemeEdit";
import OrderSuccess     from "./pages/OrderSuccess";
import Checkout          from "./pages/Checkout";

// ── Layout + Auth ───────────────────────────────────────────
import ProtectedRoute   from "./components/ProtectedRoute";
import AppLayout        from "./components/layout/AppLayout";

// ── Cart (سلة التسوق) — عالمية عبر التطبيق ──────────────────
import { CartProvider } from "./context/CartContext";

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
    <CartProvider>
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
          element={<DashPage component={OverviewPage}     title="Business Analytics" />} />
        <Route path="/dashboard/legacy"
          element={<DashPage component={Dashboard}        title="Dashboard (Legacy)" />} />
        <Route path="/dashboard/orders"
          element={<DashPage component={OrdersManagement} title="Orders" />} />
        <Route path="/dashboard/products"
          element={<DashPage component={ProductsPage}     title="Products" />} />
        <Route path="/dashboard/categories"
          element={<DashPage component={CategoriesPage}   title="Categories" />} />
        <Route path="/theme"
          element={<DashPage component={Theme}            title="Themes" />} />
        {/* ThemeEdit = fullscreen page builder بدون AppLayout */}
        <Route path="/theme/edit"
          element={<ProtectedRoute><ThemeEdit /></ProtectedRoute>} />

        {/* ── صفحات الزبائن ── */}
        <Route path="/store/:slug"                                   element={<PublicStore />} />
        <Route path="/store/:slug/product/:productId"                element={<ProductDetails />} />
        <Route path="/store/:slug/collections"                       element={<StoreCollections />} />
        <Route path="/store/:slug/collections/:categoryId"           element={<CategoryProducts />} />
        <Route path="/store/:slug/search"                             element={<SearchResults />} />
        <Route path="/store/:slug/checkout"                           element={<Checkout />} />
        <Route path="/store/:slug/order-success"                     element={<OrderSuccess />} />
      </Routes>
    </BrowserRouter>
    </CartProvider>
  );
}

export default App;