import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

function OrderSuccess() {
  const { state } = useLocation();
  const navigate  = useNavigate();

  // ✦ مرحلتين: أولاً الأنيميشن، بعدها التفاصيل
  const [showCheck,   setShowCheck]   = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    // ✦ المرحلة 1: علامة الصح تظهر بعد 100ms
    const t1 = setTimeout(() => setShowCheck(true), 100);
    // ✦ المرحلة 2: التفاصيل تظهر بعد 900ms
    const t2 = setTimeout(() => setShowDetails(true), 900);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  if (!state) { navigate("/"); return null; }

  const { productName, totalPrice, customerName, shippingCity, slug } = state;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@400;600;700;800&family=Space+Mono:wght@700&display=swap');

        /* ✦ علامة الصح — تكبر من 0 مع bounce */
        @keyframes checkPop {
          0%   { transform: scale(0) rotate(-10deg); opacity: 0; }
          60%  { transform: scale(1.2) rotate(5deg);  opacity: 1; }
          80%  { transform: scale(0.9) rotate(-2deg); }
          100% { transform: scale(1) rotate(0deg);    opacity: 1; }
        }

        /* ✦ الدائرة الخضراء تنبض */
        @keyframes ringPulse {
          0%   { box-shadow: 0 0 0 0 rgba(16,185,129,0.5); }
          70%  { box-shadow: 0 0 0 20px rgba(16,185,129,0); }
          100% { box-shadow: 0 0 0 0 rgba(16,185,129,0); }
        }

        /* ✦ التفاصيل تنزل من فوق */
        @keyframes fadeSlideDown {
          from { opacity: 0; transform: translateY(-16px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .check-circle {
          width: 90px; height: 90px;
          background: linear-gradient(135deg, #10b981, #059669);
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          margin: 0 auto 28px;
          font-size: 2.5rem;
          opacity: 0;
          transition: opacity 0.1s;
        }
        .check-circle.visible {
          opacity: 1;
          animation: checkPop 0.6s cubic-bezier(0.34,1.56,0.64,1) forwards,
                     ringPulse 1.2s ease 0.6s 2;
        }
        .check-icon {
          opacity: 0;
          transform: scale(0);
        }
        .check-circle.visible .check-icon {
          animation: checkPop 0.5s cubic-bezier(0.34,1.56,0.64,1) 0.1s forwards;
        }

        .details-block {
          opacity: 0;
          pointer-events: none;
        }
        .details-block.visible {
          opacity: 1;
          pointer-events: auto;
          animation: fadeSlideDown 0.5s ease forwards;
        }
      `}</style>

      <div dir="rtl" style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #f0fdf4 0%, #f8fafc 100%)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "20px",
        fontFamily: "'IBM Plex Sans Arabic', sans-serif",
      }}>
        <div style={{
          background: "#fff", borderRadius: "28px",
          padding: "48px 40px", maxWidth: "480px", width: "100%",
          boxShadow: "0 8px 40px rgba(0,0,0,0.08)", textAlign: "center",
        }}>

          {/* ✦ علامة الصح بأنيميشن */}
          <div className={`check-circle ${showCheck ? "visible" : ""}`}>
            <span className="check-icon" style={{ fontSize: "2.5rem" }}>✓</span>
          </div>

          {/* ✦ التفاصيل تظهر بعد الأنيميشن */}
          <div className={`details-block ${showDetails ? "visible" : ""}`}>

            <h1 style={{ fontSize: "1.6rem", fontWeight: "800", color: "#0f172a", marginBottom: "8px" }}>
              تم تسجيل طلبك!
            </h1>
            <p style={{ color: "#64748b", fontSize: ".95rem", marginBottom: "32px" }}>
              شكراً {customerName}، سنتصل بك قريباً لتأكيد الطلب
            </p>

            {/* تفاصيل الطلب */}
            <div style={{
              background: "#f8fafc", border: "1px solid #e2e8f0",
              borderRadius: "16px", padding: "20px",
              marginBottom: "20px", textAlign: "right",
            }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ color: "#64748b", fontSize: ".85rem" }}>المنتج</span>
                  <span style={{ fontWeight: "700", color: "#0f172a", fontSize: ".9rem" }}>{productName}</span>
                </div>

                <div style={{ height: "1px", background: "#e2e8f0" }} />

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ color: "#64748b", fontSize: ".85rem" }}>ولاية التوصيل</span>
                  <span style={{ fontWeight: "700", color: "#0f172a", fontSize: ".9rem" }}>{shippingCity}</span>
                </div>

                <div style={{ height: "1px", background: "#e2e8f0" }} />

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ color: "#64748b", fontSize: ".85rem" }}>المبلغ الإجمالي</span>
                  <span style={{
                    fontWeight: "800", fontSize: "1.1rem", color: "#10b981",
                    fontFamily: "'Space Mono', monospace",
                  }}>
                    {totalPrice.toLocaleString()} د.ج
                  </span>
                </div>

              </div>
            </div>

            {/* بادج COD */}
            <div style={{
              background: "rgba(16,185,129,0.08)",
              border: "1px solid rgba(16,185,129,0.2)",
              borderRadius: "12px", padding: "12px 16px",
              marginBottom: "24px",
              display: "flex", alignItems: "center", gap: "10px", justifyContent: "center",
            }}>
              <span style={{ fontSize: "1.2rem" }}>💵</span>
              <span style={{ color: "#059669", fontWeight: "600", fontSize: ".9rem" }}>
                الدفع عند الاستلام — لا تحتاج دفع مسبق
              </span>
            </div>

            {/* الأزرار */}
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {slug && (
                <button
                  onClick={() => navigate(`/store/${slug}`)}
                  style={{
                    width: "100%", padding: "14px",
                    background: "#0f172a", color: "#fff",
                    border: "none", borderRadius: "14px",
                    fontFamily: "inherit", fontSize: ".95rem",
                    fontWeight: "700", cursor: "pointer",
                  }}
                  onMouseEnter={e => e.target.style.background = "#1e293b"}
                  onMouseLeave={e => e.target.style.background = "#0f172a"}
                >
                  🛍️ تسوق أكثر
                </button>
              )}
              <button
                onClick={() => navigate("/")}
                style={{
                  width: "100%", padding: "14px",
                  background: "transparent", color: "#64748b",
                  border: "1px solid #e2e8f0", borderRadius: "14px",
                  fontFamily: "inherit", fontSize: ".9rem",
                  fontWeight: "600", cursor: "pointer",
                }}
                onMouseEnter={e => { e.target.style.background = "#f8fafc"; e.target.style.color = "#0f172a"; }}
                onMouseLeave={e => { e.target.style.background = "transparent"; e.target.style.color = "#64748b"; }}
              >
                الصفحة الرئيسية
              </button>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}

export default OrderSuccess;