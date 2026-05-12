import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"; // أضفنا Navigate هنا

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* هذا السطر يجعل الصفحة الرئيسية تفتح الـ Login تلقائياً */}
        <Route path="/" element={<Navigate to="/login" />} />

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />

        <Route
          path="/dashboard"
          element={<Dashboard />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;