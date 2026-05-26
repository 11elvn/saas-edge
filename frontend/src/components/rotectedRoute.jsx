// ============================================================
// 📁 ProtectedRoute.jsx
// ✦ مكون الحماية — يتحقق من token قبل ما يعرض أي صفحة محمية
// ✦ إذا ما فيش token → يرجع للـ /login تلقائياً
// ============================================================
import { Navigate } from "react-router-dom";

function ProtectedRoute({ children }) {
  // ✦ نقرأ التوكن من localStorage
  const token = localStorage.getItem("token");

  // ✦ إذا ما فيش توكن → redirect فوري للـ login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // ✦ إذا فيه توكن → نعرض الصفحة المطلوبة
  return children;
}

export default ProtectedRoute;