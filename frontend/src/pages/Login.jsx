import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  // حالة التحميل لمنع الضغط المتكرر وتأمين الطلب
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (isLoading) return; // منع إرسال طلب تكراري إذا كان الأول قيد المعالجة

    setIsLoading(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/users/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            password,
          }),
        }
      );

      const data = await response.json();

      alert(data.message);

      if (response.ok) {
        // حفظ التوكن في الـ localStorage لإثبات هوية المستخدم في الداشبورد
        localStorage.setItem("token", data.token);
        navigate("/dashboard");
      }

    } catch (error) {
      console.log(error);
      alert("Server error ❌");
    } finally {
      setIsLoading(false); // إعادة تفعيل الزر بعد انتهاء الاستجابة
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 font-sans antialiased">
      
      {/* كارت تسجيل الدخول بتصميم مطابق تماماً لصفحة التسجيل */}
      <div className="bg-white border border-slate-100 p-8 rounded-3xl shadow-sm w-full max-w-md mx-4">
        
        {/* العناوين */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
            Welcome Back
          </h1>
          <p className="text-sm text-slate-500">
            Sign in to manage your automated store dashboard
          </p>
        </div>

        {/* حقول الإدخال */}
        <div className="space-y-5">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Email Address
            </label>
            <input
              className="w-full px-4 py-3.5 border border-slate-200 rounded-2xl text-slate-800 placeholder-slate-400 focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition-all"
              type="email"
              placeholder="name@company.com"
              disabled={isLoading}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                Password
              </label>
              {/* خيار إضافي للمستقبل إذا أردت تفعيل نسيت كلمة المرور */}
              <span className="text-xs text-slate-400 hover:text-slate-900 cursor-pointer transition-colors">
                Forgot?
              </span>
            </div>
            <input
              className="w-full px-4 py-3.5 border border-slate-200 rounded-2xl text-slate-800 placeholder-slate-400 focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition-all"
              type="password"
              placeholder="••••••••"
              disabled={isLoading}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {/* زر تسجيل الدخول المحمي تفاعلياً */}
          <button
            onClick={handleLogin}
            disabled={isLoading}
            className={`w-full py-4 rounded-2xl font-bold tracking-wide text-sm transition-all duration-200 mt-6 ${
              isLoading
                ? "bg-slate-200 text-slate-400 cursor-not-allowed select-none"
                : "bg-slate-900 text-white hover:bg-slate-800 active:scale-[0.99] shadow-sm"
            }`}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                Signing in... ⏳
              </span>
            ) : (
              "Sign In"
            )}
          </button>
        </div>

        {/* رابط الانتقال لصفحة إنشاء حساب */}
        <div className="text-center mt-6">
          <p className="text-sm text-slate-500">
            Don't have an account?{" "}
            <span 
              onClick={() => !isLoading && navigate("/register")}
              className={`font-semibold cursor-pointer text-slate-900 hover:underline ${isLoading && "opacity-50 cursor-not-allowed"}`}
            >
              Sign up
            </span>
          </p>
        </div>

      </div>

    </div>
  );
}

export default Login;