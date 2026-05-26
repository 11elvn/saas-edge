import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login() {
  const navigate = useNavigate();
  const [email,     setEmail]     = useState("");
  const [password,  setPassword]  = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error,     setError]     = useState("");

  const handleLogin = async () => {
    if (isLoading) return;
    setError("");
    setIsLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/users/login`,
        {
          method:  "POST",
          headers: { "Content-Type": "application/json" },
          body:    JSON.stringify({ email, password }),
        }
      );
      const data = await response.json();
      if (response.ok) {
        localStorage.setItem("token", data.token);
        navigate("/dashboard");
      } else {
        setError(data.message || "فشل تسجيل الدخول ❌");
      }
    } catch {
      setError("خطأ في الاتصال بالخادم ❌");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      dir="rtl"
      className="min-h-screen bg-[#080c14] flex items-center justify-center p-5"
      style={{
        fontFamily: "'Segoe UI', sans-serif",
        background: "radial-gradient(ellipse at top, #1a1040 0%, #080c14 60%)",
      }}
    >
      <div
        className="w-full max-w-md rounded-3xl p-10"
        style={{
          background: "#0d1220",
          border: "1px solid rgba(255,255,255,0.07)",
          boxShadow: "0 24px 80px rgba(0,0,0,0.5)",
        }}
      >
        {/* لوغو */}
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-white text-lg mx-auto mb-7"
          style={{
            background: "linear-gradient(135deg, #6366f1, #a78bfa)",
            boxShadow: "0 0 32px rgba(99,102,241,0.4)",
            fontFamily: "monospace",
          }}
        >
          SE
        </div>

        {/* عنوان */}
        <h1
          className="text-2xl font-bold text-center mb-2"
          style={{ color: "#f1f5f9" }}
        >
          مرحباً بعودتك
        </h1>
        <p className="text-center text-sm mb-8" style={{ color: "#475569" }}>
          سجّل دخولك لإدارة متجرك
        </p>

        {/* رسالة خطأ */}
        {error && (
          <div
            className="flex items-center gap-2 rounded-xl px-4 py-3 text-sm mb-5"
            style={{
              background: "rgba(239,68,68,0.08)",
              border: "1px solid rgba(239,68,68,0.2)",
              color: "#fca5a5",
            }}
          >
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {/* حقل الإيميل */}
        <div className="mb-5">
          <label
            className="block text-xs font-semibold uppercase mb-2"
            style={{ color: "#64748b", letterSpacing: "0.6px" }}
          >
            البريد الإلكتروني
          </label>
          <input
            type="email"
            placeholder="example@email.com"
            value={email}
            disabled={isLoading}
            onChange={e => setEmail(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleLogin()}
            className="w-full rounded-xl px-4 py-3.5 text-sm outline-none transition-all"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              color: "#e2e8f0",
            }}
            onFocus={e => {
              e.target.style.border = "1px solid #6366f1";
              e.target.style.background = "rgba(99,102,241,0.06)";
              e.target.style.boxShadow = "0 0 0 3px rgba(99,102,241,0.12)";
            }}
            onBlur={e => {
              e.target.style.border = "1px solid rgba(255,255,255,0.08)";
              e.target.style.background = "rgba(255,255,255,0.04)";
              e.target.style.boxShadow = "none";
            }}
          />
        </div>

        {/* حقل الباسورد */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <label
              className="text-xs font-semibold uppercase"
              style={{ color: "#64748b", letterSpacing: "0.6px" }}
            >
              كلمة المرور
            </label>
            <span
              className="text-xs cursor-pointer transition-colors"
              style={{ color: "#334155" }}
              onMouseEnter={e => e.target.style.color = "#818cf8"}
              onMouseLeave={e => e.target.style.color = "#334155"}
            >
              نسيت كلمة المرور؟
            </span>
          </div>
          <input
            type="password"
            placeholder="••••••••"
            value={password}
            disabled={isLoading}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleLogin()}
            className="w-full rounded-xl px-4 py-3.5 text-sm outline-none transition-all"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              color: "#e2e8f0",
            }}
            onFocus={e => {
              e.target.style.border = "1px solid #6366f1";
              e.target.style.background = "rgba(99,102,241,0.06)";
              e.target.style.boxShadow = "0 0 0 3px rgba(99,102,241,0.12)";
            }}
            onBlur={e => {
              e.target.style.border = "1px solid rgba(255,255,255,0.08)";
              e.target.style.background = "rgba(255,255,255,0.04)";
              e.target.style.boxShadow = "none";
            }}
          />
        </div>

        {/* زر الدخول */}
        <button
          onClick={handleLogin}
          disabled={isLoading}
          className="w-full py-4 rounded-xl font-bold text-sm text-white transition-all"
          style={{
            background: isLoading
              ? "rgba(255,255,255,0.06)"
              : "linear-gradient(135deg, #6366f1, #818cf8)",
            boxShadow: isLoading ? "none" : "0 4px 20px rgba(99,102,241,0.35)",
            color: isLoading ? "#475569" : "#fff",
            cursor: isLoading ? "not-allowed" : "pointer",
          }}
        >
          {isLoading ? "جاري تسجيل الدخول..." : "تسجيل الدخول ←"}
        </button>

        {/* فاصل */}
        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.06)" }} />
          <span className="text-xs font-semibold uppercase" style={{ color: "#334155", letterSpacing: "0.5px" }}>
            أو
          </span>
          <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.06)" }} />
        </div>

        {/* رابط التسجيل */}
        <p className="text-center text-sm" style={{ color: "#475569" }}>
          ما عندكش حساب؟{" "}
          <span
            onClick={() => !isLoading && navigate("/register")}
            className="font-semibold cursor-pointer transition-colors"
            style={{ color: "#818cf8" }}
            onMouseEnter={e => e.target.style.color = "#a78bfa"}
            onMouseLeave={e => e.target.style.color = "#818cf8"}
          >
            أنشئ حساب جديد
          </span>
        </p>

      </div>
    </div>
  );
}

export default Login;