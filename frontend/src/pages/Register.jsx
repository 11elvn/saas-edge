import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Register() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  // حالة التحميل لمنع النقرات المتعددة وتسريع التفاعل بصرياً
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async () => {
    if (isLoading) return; // منع إرسال طلب آخر إذا كان الطلب الأول قيد المعالجة

    setIsLoading(true);

    try {
      // ربط عملية التسجيل بالرابط العالمي المنشور على Render
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/users/register`,
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
        navigate("/login");
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
      
      {/* كارت التسجيل الرئيسي بتصميم هندسي نظيف */}
      <div className="bg-white border border-slate-100 p-8 rounded-3xl shadow-sm w-full max-w-md mx-4">
        
        {/* العناوين */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
            Create Account
          </h1>
          <p className="text-sm text-slate-500">
            Start managing your business automated store
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
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Password
            </label>
            <input
              className="w-full px-4 py-3.5 border border-slate-200 rounded-2xl text-slate-800 placeholder-slate-400 focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition-all"
              type="password"
              placeholder="••••••••"
              disabled={isLoading}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {/* زر التسجيل التفاعلي المحمي */}
          <button
            onClick={handleRegister}
            disabled={isLoading}
            className={`w-full py-4 rounded-2xl font-bold tracking-wide text-sm transition-all duration-200 mt-6 ${
              isLoading
                ? "bg-slate-200 text-slate-400 cursor-not-allowed select-none"
                : "bg-slate-900 text-white hover:bg-slate-800 active:scale-[0.99] shadow-sm"
            }`}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                Registering... ⏳
              </span>
            ) : (
              "Register"
            )}
          </button>
        </div>

        {/* رابط الانتقال لصفحة تسجيل الدخول */}
        <div className="text-center mt-6">
          <p className="text-sm text-slate-500">
            Already have an account?{" "}
            <span 
              onClick={() => !isLoading && navigate("/login")}
              className={`font-semibold cursor-pointer text-slate-900 hover:underline ${isLoading && "opacity-50 cursor-not-allowed"}`}
            >
              Sign in
            </span>
          </p>
        </div>

      </div>

    </div>
  );
}

export default Register;