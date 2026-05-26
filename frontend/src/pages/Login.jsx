// ============================================================
// 📁 Login.jsx — تصميم داكن احترافي
// ============================================================
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
        // ✦ نحفظ التوكن → ProtectedRoute سيسمح بالدخول
        localStorage.setItem("token", data.token);
        navigate("/dashboard");
      } else {
        // ✦ نعرض رسالة الخطأ من الباك-أند بدل alert
        setError(data.message || "فشل تسجيل الدخول ❌");
      }
    } catch {
      setError("خطأ في الاتصال بالخادم ❌");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@400;500;600;700&family=Space+Mono:wght@700&display=swap');

        .login-page {
          font-family: 'IBM Plex Sans Arabic', sans-serif;
          min-height: 100vh;
          background: #080c14;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          position: relative;
          overflow: hidden;
        }

        /* دوائر توهج في الخلفية */
        .login-page::before {
          content: '';
          position: absolute;
          width: 600px; height: 600px;
          background: radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%);
          top: -200px; left: 50%;
          transform: translateX(-50%);
          pointer-events: none;
        }
        .login-page::after {
          content: '';
          position: absolute;
          width: 400px; height: 400px;
          background: radial-gradient(circle, rgba(167,139,250,0.06) 0%, transparent 70%);
          bottom: -100px; right: -100px;
          pointer-events: none;
        }

        .login-card {
          background: #0d1220;
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 28px;
          padding: 48px 44px;
          width: 100%;
          max-width: 440px;
          position: relative;
          z-index: 1;
          box-shadow: 0 24px 80px rgba(0,0,0,0.5);
        }

        .login-logo {
          width: 52px; height: 52px;
          background: linear-gradient(135deg, #6366f1, #a78bfa);
          border-radius: 16px;
          display: flex; align-items: center; justify-content: center;
          font-family: 'Space Mono', monospace;
          font-size: 1rem; font-weight: 700; color: #fff;
          margin: 0 auto 28px;
          box-shadow: 0 0 32px rgba(99,102,241,0.35);
        }

        .login-title {
          font-size: 1.75rem;
          font-weight: 700;
          color: #f1f5f9;
          text-align: center;
          margin-bottom: 8px;
          letter-spacing: -0.5px;
        }

        .login-sub {
          font-size: 0.88rem;
          color: #475569;
          text-align: center;
          margin-bottom: 36px;
        }

        .field-label {
          display: block;
          font-size: 0.75rem;
          font-weight: 600;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.6px;
          margin-bottom: 8px;
        }

        .field-wrap {
          margin-bottom: 18px;
        }

        .login-input {
          width: 100%;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 14px;
          padding: 14px 18px;
          color: #e2e8f0;
          font-family: inherit;
          font-size: 0.92rem;
          outline: none;
          transition: all 0.2s;
        }
        .login-input:focus {
          border-color: #6366f1;
          background: rgba(99,102,241,0.06);
          box-shadow: 0 0 0 3px rgba(99,102,241,0.12);
        }
        .login-input::placeholder { color: #334155; }
        .login-input:disabled { opacity: 0.5; cursor: not-allowed; }

        .error-box {
          background: rgba(239,68,68,0.08);
          border: 1px solid rgba(239,68,68,0.2);
          border-radius: 12px;
          padding: 12px 16px;
          color: #fca5a5;
          font-size: 0.85rem;
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .login-btn {
          width: 100%;
          padding: 15px;
          border-radius: 14px;
          border: none;
          font-family: inherit;
          font-size: 0.95rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
          margin-top: 8px;
          letter-spacing: 0.3px;
        }
        .login-btn:not(:disabled) {
          background: linear-gradient(135deg, #6366f1, #818cf8);
          color: #fff;
          box-shadow: 0 4px 20px rgba(99,102,241,0.35);
        }
        .login-btn:not(:disabled):hover {
          transform: translateY(-1px);
          box-shadow: 0 8px 28px rgba(99,102,241,0.45);
        }
        .login-btn:not(:disabled):active {
          transform: translateY(0);
        }
        .login-btn:disabled {
          background: rgba(255,255,255,0.06);
          color: #475569;
          cursor: not-allowed;
        }

        .divider {
          display: flex;
          align-items: center;
          gap: 12px;
          margin: 28px 0;
        }
        .divider-line {
          flex: 1;
          height: 1px;
          background: rgba(255,255,255,0.06);
        }
        .divider-text {
          font-size: 0.75rem;
          color: #334155;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .register-link {
          text-align: center;
          font-size: 0.88rem;
          color: #475569;
        }
        .register-link span {
          color: #818cf8;
          font-weight: 600;
          cursor: pointer;
          transition: color 0.2s;
        }
        .register-link span:hover { color: #a78bfa; }

        .spinner {
          display: inline-block;
          width: 16px; height: 16px;
          border: 2px solid rgba(255,255,255,0.2);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
          vertical-align: middle;
          margin-left: 8px;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        .forgot {
          font-size: 0.75rem;
          color: #334155;
          cursor: pointer;
          transition: color 0.2s;
          float: left;
        }
        .forgot:hover { color: #818cf8; }
      `}</style>

      <div className="login-page">
        <div className="login-card">

          {/* لوغو */}
          <div className="login-logo">SE</div>

          {/* عنوان */}
          <h1 className="login-title">مرحباً بعودتك</h1>
          <p className="login-sub">سجّل دخولك لإدارة متجرك</p>

          {/* رسالة خطأ */}
          {error && (
            <div className="error-box">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {/* حقل الإيميل */}
          <div className="field-wrap">
            <label className="field-label">البريد الإلكتروني</label>
            <input
              className="login-input"
              type="email"
              placeholder="example@email.com"
              value={email}
              disabled={isLoading}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleLogin()}
            />
          </div>

          {/* حقل الباسورد */}
          <div className="field-wrap">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
              <label className="field-label" style={{ margin: 0 }}>كلمة المرور</label>
              <span className="forgot">نسيت كلمة المرور؟</span>
            </div>
            <input
              className="login-input"
              type="password"
              placeholder="••••••••"
              value={password}
              disabled={isLoading}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleLogin()}
            />
          </div>

          {/* زر الدخول */}
          <button
            className="login-btn"
            onClick={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <>جاري تسجيل الدخول <span className="spinner" /></>
            ) : (
              "تسجيل الدخول ←"
            )}
          </button>

          {/* رابط التسجيل */}
          <div className="divider">
            <div className="divider-line" />
            <span className="divider-text">أو</span>
            <div className="divider-line" />
          </div>

          <div className="register-link">
            ما عندكش حساب؟{" "}
            <span onClick={() => !isLoading && navigate("/register")}>
              أنشئ حساب جديد
            </span>
          </div>

        </div>
      </div>
    </>
  );
}

export default Login;