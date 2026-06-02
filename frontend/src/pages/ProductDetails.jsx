import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

// ✦ import من المصدر الواحد — حذفنا ALGERIAN_CITIES المحلية
import { ALGERIAN_CITIES, getShippingPrice } from "../constants/algerianCities";

const DEFAULT_PRODUCT_IMAGE =
  "https://images.unsplash.com/photo-1531403009284-440f080d1e12?q=80&w=600";

function ProductDetails() {
  const { slug, productId } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [shippingPrice, setShippingPrice] = useState(0);
  const [loading, setLoading] = useState(true);
  const [ordering, setOrdering] = useState(false);

  // ✦ استخدام getShippingPrice من الـ constants
  const handleCityChange = (cityName) => {
    setSelectedCity(cityName);
    setShippingPrice(getShippingPrice(cityName));
  };

  const getProductDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/products/${productId}`
      );
      const data = await response.json();
      if (response.ok) setProduct(data);
    } catch (error) {
      console.error("Error fetching product:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOrder = async () => {
    // ✦ validation قبل الإرسال
    if (!customerName.trim() || !phone.trim() || !selectedCity) {
      alert("يرجى ملء جميع الحقول الإجبارية ⚠️");
      return;
    }
    // ✦ نفس regex الباك-أند للتناسق
    const phoneRegex = /^0[5-7][0-9]{8}$/;
    if (!phoneRegex.test(phone.trim().replace(/\s/g, ""))) {
      alert("يرجى إدخال رقم هاتف جزائري صحيح (مثال: 0550123456) ⚠️");
      return;
    }

    setOrdering(true); // ✦ نعطل الزر أثناء الإرسال

    const totalPrice = product.currentPrice + shippingPrice;

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/orders/create`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            productId,
            customerName,
            phone: phone.trim().replace(/\s/g, ""), // ✦ نظّف الرقم
            address,
            shippingCity: selectedCity,
            shippingPrice,
            totalPrice,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        navigate("/order-success", {
          state: {
            productName: product.name,
            totalPrice: product.currentPrice + shippingPrice,
            customerName,
            shippingCity: selectedCity,
            slug,
          }
        });
      }
      else {
        // ✦ نعرض رسالة الباك-أند (مثل: "نفد من المخزون")
        alert(data.message || "حدث خطأ أثناء إرسال الطلب ❌");
      }
    } catch (error) {
      console.error("Order error:", error);
      alert("حدث خطأ في الاتصال بالخادم ❌");
    } finally {
      setOrdering(false); // ✦ أعد تفعيل الزر بعد الانتهاء
    }
  };

  useEffect(() => {
    if (productId) getProductDetails();
  }, [productId]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
    </div>
  );

  if (!product) return (
    <div className="min-h-screen flex flex-col items-center justify-center" dir="rtl">
      <p className="text-slate-500 font-bold mb-4">المنتج غير موجود ❌</p>
      <button onClick={() => navigate(`/store/${slug}`)} className="text-blue-600 font-bold">
        العودة للمتجر
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#1e293b] pb-16" dir="rtl">
      <header className="bg-white border-b border-slate-100 py-4 shadow-sm sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 flex justify-between items-center">
          <button onClick={() => navigate(`/store/${slug}`)} className="font-bold text-slate-600">
            ⬅️ العودة للمتجر
          </button>
          <span className="font-black text-slate-700">تفاصيل المنتج</span>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">

        {/* معلومات المنتج */}
        <div className="space-y-6">
          <div className="h-80 bg-white rounded-[32px] shadow-sm border border-slate-100 overflow-hidden relative">
            <img
              src={product.image || DEFAULT_PRODUCT_IMAGE}
              alt={product.name}
              className="w-full h-full object-cover"
              onError={(e) => { e.target.onerror = null; e.target.src = DEFAULT_PRODUCT_IMAGE; }}
            />
            {/* ✦ بادج "نفد" فوق الصورة */}
            {product.stock === 0 && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <span className="bg-white text-stone-800 font-bold px-4 py-2 rounded-full text-sm">
                  نفد من المخزون
                </span>
              </div>
            )}
          </div>

          <div className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-100">
            <h1 className="text-2xl font-black mb-2">{product.name}</h1>
            <div className="flex items-baseline gap-3 mb-4">
              <span className="text-2xl font-black text-blue-600">
                {product.currentPrice.toLocaleString()} د.ج
              </span>
              {product.oldPrice && (
                <span className="text-slate-300 line-through text-lg">
                  {product.oldPrice.toLocaleString()} د.ج
                </span>
              )}
            </div>
            <p className="text-slate-600 text-sm leading-relaxed">{product.description}</p>
            {/* ✦ عرض المخزون المتبقي إذا كان أقل من 5 */}
            {product.stock > 0 && product.stock <= 5 && (
              <p className="text-amber-500 text-sm font-bold mt-3">
                ⚠️ بقي {product.stock} فقط في المخزون
              </p>
            )}
          </div>
        </div>

        {/* فورم الطلب */}
        <div className="h-fit">
          <section className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-100 space-y-4">
            <h3 className="font-bold text-center">🛒 الشراء السريع</h3>
            <div className="space-y-3">
              <input
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full border p-3 rounded-xl outline-none focus:border-blue-500 transition-all"
                placeholder="الاسم الكامل"
              />
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                type="tel"
                className="w-full border p-3 rounded-xl text-right outline-none focus:border-blue-500 transition-all"
                placeholder="0661234567"
              />
              <select
                value={selectedCity}
                onChange={(e) => handleCityChange(e.target.value)}
                className="w-full border p-3 rounded-xl outline-none focus:border-blue-500 transition-all"
              >
                <option value="">-- اختر ولايتك --</option>
                {/* ✦ 58 ولاية من الـ constants */}
                {ALGERIAN_CITIES.map((city) => (
                  <option key={city.id} value={city.name}>{city.name}</option>
                ))}
              </select>
              <input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full border p-3 rounded-xl outline-none focus:border-blue-500 transition-all"
                placeholder="العنوان (اختياري)"
              />

              {selectedCity && (
                <div className="bg-blue-50 p-3 rounded-xl text-sm font-bold flex justify-between">
                  <span>المجموع مع التوصيل:</span>
                  <span className="text-blue-600">
                    {(product.currentPrice + shippingPrice).toLocaleString()} د.ج
                  </span>
                </div>
              )}

              {/* ✦ زر الطلب — معطل إذا نفد المخزون أو أثناء الإرسال */}
              <button
                onClick={handleOrder}
                disabled={product.stock === 0 || ordering}
                className={`w-full py-4 rounded-xl font-bold transition-all ${product.stock === 0
                    ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                    : ordering
                      ? "bg-slate-400 text-white cursor-not-allowed"
                      : "bg-slate-900 text-white hover:bg-blue-600"
                  }`}
              >
                {ordering ? "جاري الإرسال... ⏳" : product.stock === 0 ? "نفد من المخزون" : "تأكيد الطلب"}
              </button>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

export default ProductDetails;