// ============================================================
// 📁 OrderSuccess.jsx — صفحة تأكيد الطلب الناجح
// تظهر بعد كل طلب ناجح بدل الـ alert القديم
// ============================================================
import { useLocation, useNavigate } from "react-router-dom";

function OrderSuccess() {
  const { state } = useLocation(); // ✦ نجيب بيانات الطلب من navigate
  const navigate  = useNavigate();

  // ✦ لو فتح الصفحة مباشرة بدون بيانات — نرجعه للرئيسية
  if (!state) {
    navigate("/");
    return null;
  }

  const { productName, totalPrice, customerName, shippingCity, slug } = state;

  return (
    <div
      dir="rtl"
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #f0fdf4 0%, #f8fafc 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
        fontFamily: "'IBM Plex Sans Arabic', sans-serif",
      }}
    >
      <div style={{
        background: "#fff",
        borderRadius: "28px",
        padding: "48px 40px",
        maxWidth: "480px",
        width: "100%",
        boxShadow: "0 8px 40px rgba(0,0,0,0.08)",
        textAlign: "center",
      }}>

        {/* أيقونة النجاح */}
        <div style={{
          width: "80px", height: "80px",
          background: "linear-gradient(135deg, #10b981, #059669)",
          borderRadius: "50%",
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 24px",
          fontSize: "2.2rem",
          boxShadow: "0 0 30px rgba(16,185,129,0.3)",
        }}>
          ✅
        </div>

        {/* العنوان */}
        <h1 style={{
          fontSize: "1.6rem", fontWeight: "800",
          color: "#0f172a", marginBottom: "8px",
        }}>
          تم تسجيل طلبك!
        </h1>
        <p style={{ color: "#64748b", fontSize: ".95rem", marginBottom: "32px" }}>
          شكراً {customerName}، سنتصل بك قريباً لتأكيد الطلب
        </p>

        {/* تفاصيل الطلب */}
        <div style={{
          background: "#f8fafc",
          border: "1px solid #e2e8f0",
          borderRadius: "16px",
          padding: "20px",
          marginBottom: "28px",
          textAlign: "right",
        }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ color: "#64748b", fontSize: ".85rem" }}>المنتج</span>
              <span style={{ fontWeight: "700", color: "#0f172a", fontSize: ".9rem" }}>
                {productName}
              </span>
            </div>

            <div style={{ height: "1px", background: "#e2e8f0" }} />

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ color: "#64748b", fontSize: ".85rem" }}>ولاية التوصيل</span>
              <span style={{ fontWeight: "700", color: "#0f172a", fontSize: ".9rem" }}>
                {shippingCity}
              </span>
            </div>

            <div style={{ height: "1px", background: "#e2e8f0" }} />

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ color: "#64748b", fontSize: ".85rem" }}>المبلغ الإجمالي</span>
              <span style={{
                fontWeight: "800", fontSize: "1.1rem",
                color: "#10b981",
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
          borderRadius: "12px",
          padding: "12px 16px",
          marginBottom: "28px",
          display: "flex",
          alignItems: "center",
          gap: "10px",
          justifyContent: "center",
        }}>
          <span style={{ fontSize: "1.2rem" }}>💵</span>
          <span style={{ color: "#059669", fontWeight: "600", fontSize: ".9rem" }}>
            الدفع عند الاستلام — لا تحتاج دفع مسبق
          </span>
        </div>

        {/* أزرار */}
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {/* ✦ زر العودة للمتجر */}
          {slug && (
            <button
              onClick={() => navigate(`/store/${slug}`)}
              style={{
                width: "100%", padding: "14px",
                background: "#0f172a", color: "#fff",
                border: "none", borderRadius: "14px",
                fontFamily: "inherit", fontSize: ".95rem",
                fontWeight: "700", cursor: "pointer",
                transition: "all .2s",
              }}
              onMouseEnter={e => e.target.style.background = "#1e293b"}
              onMouseLeave={e => e.target.style.background = "#0f172a"}
            >
              🛍️ تسوق أكثر
            </button>
          )}

          {/* ✦ زر الرئيسية */}
          <button
            onClick={() => navigate("/")}
            style={{
              width: "100%", padding: "14px",
              background: "transparent", color: "#64748b",
              border: "1px solid #e2e8f0", borderRadius: "14px",
              fontFamily: "inherit", fontSize: ".9rem",
              fontWeight: "600", cursor: "pointer",
              transition: "all .2s",
            }}
            onMouseEnter={e => { e.target.style.background = "#f8fafc"; e.target.style.color = "#0f172a"; }}
            onMouseLeave={e => { e.target.style.background = "transparent"; e.target.style.color = "#64748b"; }}
          >
            الصفحة الرئيسية
          </button>
        </div>

      </div>
    </div>
  );
}

export default OrderSuccess;