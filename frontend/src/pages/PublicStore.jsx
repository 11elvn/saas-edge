import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

// ✦ import من المصدر الواحد — حذفنا ALGERIAN_CITIES المحلية
import { ALGERIAN_CITIES, getShippingPrice } from "../constants/algerianCities";

const DEFAULT_PRODUCT_IMAGE =
  "https://images.unsplash.com/photo-1531403009284-440f080d1e12?q=80&w=400";

function PublicStore() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [storeName,     setStoreName]     = useState("متجر إلكتروني");
  const [products,      setProducts]      = useState([]);
  const [customerName,  setCustomerName]  = useState("");
  const [phone,         setPhone]         = useState("");
  const [address,       setAddress]       = useState("");
  const [selectedCity,  setSelectedCity]  = useState("");
  const [shippingPrice, setShippingPrice] = useState(0);
  const [loading,       setLoading]       = useState(true);

  // ✦ إعدادات الثيم — تأتي من الباك-أند
  const [primaryColor,   setPrimaryColor]   = useState("#2563eb");
  const [secondaryColor, setSecondaryColor] = useState("#0f172a");
  const [fontFamily,     setFontFamily]     = useState("Inter");
  const [logo,           setLogo]           = useState("");
  const [banner,         setBanner]         = useState("");

  // ✦ استخدام getShippingPrice من الـ constants بدل البحث اليدوي
  const handleCityChange = (cityName) => {
    setSelectedCity(cityName);
    setShippingPrice(getShippingPrice(cityName)); // ← سطر واحد بدل 3
  };

  const getStoreData = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/stores/public/${slug}`
      );
      const data = await response.json();

      if (data.store) {
        setStoreName(data.store.name || data.store.storeName);
        setPrimaryColor(data.store.primaryColor   || "#2563eb");
        setSecondaryColor(data.store.secondaryColor || "#0f172a");
        setFontFamily(data.store.fontFamily || "Inter");
        setLogo(data.store.logo   || "");
        setBanner(data.store.banner || "");
      } else if (data.storeName || data.name) {
        setStoreName(data.storeName || data.name);
      }

      if (data.products && Array.isArray(data.products)) {
        setProducts(data.products);
      } else if (Array.isArray(data)) {
        setProducts(data);
      }
    } catch (error) {
      console.error("Error fetching store:", error);
    } finally {
      setLoading(false);
    }
  };

  const orderProduct = async (productId, productName, productPrice) => {
    // ✦ validation محلي قبل إرسال الطلب للباك-أند
    if (!customerName.trim()) {
      alert("يرجى إدخال الاسم الكامل ⚠️"); return;
    }
    if (!phone.trim()) {
      alert("يرجى إدخال رقم الهاتف ⚠️"); return;
    }
    // ✦ تحقق من رقم الهاتف الجزائري — نفس regex الباك-أند
    const phoneRegex = /^0[5-7][0-9]{8}$/;
    if (!phoneRegex.test(phone.trim().replace(/\s/g, ""))) {
      alert("يرجى إدخال رقم هاتف جزائري صحيح (مثال: 0550123456) ⚠️"); return;
    }
    if (!selectedCity) {
      alert("يرجى اختيار الولاية ⚠️"); return;
    }

    const totalPrice = productPrice + shippingPrice;

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/orders/create`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            productId,
            customerName,
            phone: phone.trim().replace(/\s/g, ""), // ✦ نظّف الرقم قبل الإرسال
            address,
            shippingCity:  selectedCity,
            shippingPrice,
            totalPrice,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        alert(
          `🎉 تم تسجيل طلبك بنجاح!\nالمنتج: ${productName}\nالإجمالي: ${totalPrice} د.ج\nسنتصل بك قريباً`
        );
        // ✦ تصفير الفورم بعد الطلب الناجح
        setCustomerName(""); setPhone(""); setAddress("");
        setSelectedCity(""); setShippingPrice(0);
      } else {
        // ✦ نعرض رسالة الخطأ من الباك-أند مباشرة (مثل: "نفد من المخزون")
        alert(data.message || "حدث خطأ أثناء إرسال الطلب");
      }
    } catch (error) {
      console.error("Order error:", error);
      alert("حدث خطأ في الاتصال بالخادم، يرجى المحاولة مجدداً");
    }
  };

  useEffect(() => {
    if (slug) getStoreData();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f5f5f0] flex items-center justify-center" style={{ fontFamily }}>
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-stone-800 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-stone-400 text-sm tracking-widest uppercase">جاري التحميل</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-[#f5f5f0] text-stone-900 pb-20"
      dir="rtl"
      style={{ fontFamily: fontFamily || "inherit" }}
    >
      {/* ===== HEADER ===== */}
      <header
        className="border-b"
        style={{ backgroundColor: primaryColor, borderBottomColor: "rgba(0,0,0,0.08)" }}
      >
        <div className="max-w-5xl mx-auto px-5">
          {banner && (
            <div className="pt-4">
              <img src={banner} alt="banner" className="w-full h-44 object-cover rounded-2xl" />
            </div>
          )}
          <div className="flex items-center gap-4 py-5">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center overflow-hidden flex-shrink-0"
              style={{ background: "rgba(255,255,255,0.2)", border: "1.5px solid rgba(255,255,255,0.35)" }}
            >
              {logo
                ? <img src={logo} alt="logo" className="w-full h-full object-cover" />
                : <span className="text-2xl">🏪</span>
              }
            </div>
            <div>
              <h1 className="text-xl font-semibold leading-tight" style={{ color: "white" }}>
                {storeName}
              </h1>
              <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.65)" }}>
                {/* ✦ نعرض عدد الولايات ديناميكياً من الـ constants */}
                الدفع عند الاستلام · التوصيل لـ {ALGERIAN_CITIES.length} ولاية 🇩🇿
              </p>
            </div>
          </div>
          <div className="flex gap-1 border-t" style={{ borderTopColor: "rgba(255,255,255,0.15)" }}>
            <button className="px-4 py-3 text-sm font-medium border-b-2 -mb-px" style={{ color: "white", borderBottomColor: "white" }}>
              المنتجات
            </button>
            <button className="px-4 py-3 text-sm border-b-2 border-transparent -mb-px" style={{ color: "rgba(255,255,255,0.55)" }}>
              عن المتجر
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-5 mt-7">

        {/* ===== CHECKOUT FORM ===== */}
        <section className="bg-white border border-stone-200 rounded-2xl p-5 mb-8">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-7 h-7 rounded-lg bg-stone-100 flex items-center justify-center">
              <svg className="w-4 h-4 text-stone-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <span className="text-sm font-medium text-stone-800">معلومات الطلب</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-stone-400 mb-1.5">الاسم الكامل</label>
              <input
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="محمد بلقاسم"
                className="w-full h-10 px-3 rounded-xl border border-stone-200 bg-stone-50 text-sm outline-none focus:border-stone-400 focus:bg-white transition-all placeholder:text-stone-300"
              />
            </div>
            <div>
              <label className="block text-xs text-stone-400 mb-1.5">رقم الهاتف</label>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                type="tel"
                placeholder="0661234567"
                className="w-full h-10 px-3 rounded-xl border border-stone-200 bg-stone-50 text-sm outline-none focus:border-stone-400 focus:bg-white transition-all placeholder:text-stone-300 text-right"
              />
            </div>
            <div>
              <label className="block text-xs text-stone-400 mb-1.5">الولاية</label>
              <select
                value={selectedCity}
                onChange={(e) => handleCityChange(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-stone-200 bg-stone-50 text-sm outline-none focus:border-stone-400 focus:bg-white transition-all"
              >
                <option value="">اختر الولاية</option>
                {/* ✦ 58 ولاية من الـ constants */}
                {ALGERIAN_CITIES.map((city) => (
                  <option key={city.id} value={city.name}>{city.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-stone-400 mb-1.5">
                العنوان <span className="text-stone-300 mr-1">(اختياري)</span>
              </label>
              <input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="البلدية، الحي..."
                className="w-full h-10 px-3 rounded-xl border border-stone-200 bg-stone-50 text-sm outline-none focus:border-stone-400 focus:bg-white transition-all placeholder:text-stone-300"
              />
            </div>
          </div>

          {selectedCity && (
            <div className="flex items-center justify-between mt-3 px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl">
              <span className="text-xs text-stone-500">سعر التوصيل إلى {selectedCity}</span>
              <span className="text-sm font-semibold text-stone-800">{shippingPrice} د.ج</span>
            </div>
          )}
        </section>

        {/* ===== PRODUCTS ===== */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-sm font-medium text-stone-500 uppercase tracking-widest">المنتجات</h2>
          <span className="text-xs text-stone-400 bg-stone-100 px-2.5 py-1 rounded-full">
            {products.length} منتج
          </span>
        </div>

        {products.length === 0 ? (
          <div className="bg-white border border-stone-200 rounded-2xl text-center py-16">
            <p className="text-stone-400 text-sm">لا توجد منتجات معروضة حالياً.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map((product) => (
              <div
                key={product._id}
                onClick={() => navigate(`/store/${slug}/product/${product._id}`)}
                className="bg-white border border-stone-200 rounded-2xl overflow-hidden hover:border-stone-400 transition-all duration-200 cursor-pointer group flex flex-col"
              >
                <div className="relative h-52 bg-stone-100 overflow-hidden">
                  <img
                    src={product.image || DEFAULT_PRODUCT_IMAGE}
                    alt={product.name}
                    onError={(e) => { e.target.onerror = null; e.target.src = DEFAULT_PRODUCT_IMAGE; }}
                    className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
                  />
                  {product.oldPrice && (
                    <span className="absolute top-3 right-3 text-xs font-medium bg-red-500 text-white px-2 py-0.5 rounded-full">
                      تخفيض
                    </span>
                  )}
                  {/* ✦ بادج "نفد" — يظهر إذا stock = 0 */}
                  {product.stock === 0 && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <span className="bg-white text-stone-800 text-xs font-bold px-3 py-1 rounded-full">
                        نفد من المخزون
                      </span>
                    </div>
                  )}
                </div>

                <div className="p-4 flex flex-col flex-1">
                  <h3 className="font-medium text-stone-900 text-sm mb-1 truncate">{product.name}</h3>
                  <p className="text-xs text-stone-400 line-clamp-2 mb-4 flex-1 leading-relaxed">{product.description}</p>
                  <div className="flex items-baseline gap-2 mb-3">
                    <span className="text-lg font-semibold text-stone-900">
                      {product.currentPrice.toLocaleString()} د.ج
                    </span>
                    {product.oldPrice && (
                      <span className="text-xs text-stone-300 line-through">
                        {product.oldPrice.toLocaleString()} د.ج
                      </span>
                    )}
                    {selectedCity && (
                      <span className="text-xs text-stone-400 mr-auto">
                        الإجمالي:{" "}
                        <span className="font-medium text-stone-600">
                          {(product.currentPrice + shippingPrice).toLocaleString()} د.ج
                        </span>
                      </span>
                    )}
                  </div>
                  {/* ✦ زر الطلب — معطل إذا نفد المخزون */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      orderProduct(product._id, product.name, product.currentPrice);
                    }}
                    disabled={product.stock === 0} // ✦ يمنع الطلب إذا نفد
                    style={{ backgroundColor: product.stock === 0 ? "#d1d5db" : secondaryColor }}
                    className="w-full h-10 rounded-xl text-white text-sm font-medium flex items-center justify-center gap-2 transition-all disabled:cursor-not-allowed active:scale-[0.98]"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 11H4L5 9z" />
                    </svg>
                    {product.stock === 0 ? "نفد المخزون" : "طلب سريع"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default PublicStore;