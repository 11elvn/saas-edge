import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import PublicStore from "./pages/PublicStore"; // الصفحة العمومية للزبائن

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

        {/* رابط المتجر العمومي للزبائن (Public Store) */}
        <Route path="/store/:storeId" element={<PublicStore />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;