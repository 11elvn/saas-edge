import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const ALGERIAN_CITIES = [
  { id: "16", name: "الجزائر العاصمة", price: 400 },
  { id: "31", name: "وهران", price: 500 },
  { id: "25", name: "قسنطينة", price: 500 },
  { id: "19", name: "سطيف", price: 450 },
  { id: "06", name: "بجاية", price: 500 },
  { id: "39", name: "الوادي", price: 700 },
  { id: "30", name: "ورقلة", price: 750 },
  { id: "17", name: "الجلفة", price: 550 },
];

const DEFAULT_PRODUCT_IMAGE =
  "https://images.unsplash.com/photo-1531403009284-440f080d1e12?q=80&w=400";

function PublicStore() {
  // 🔄 التعديل 01: تلقي الـ slug من الرابط في بلاصة الـ storeId القديم
  const { slug } = useParams();
  const navigate = useNavigate();

  const [storeName, setStoreName] = useState("متجر إلكتروني");
  const [products, setProducts] = useState([]);
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [shippingPrice, setShippingPrice] = useState(0);
  const [loading, setLoading] = useState(true);

  const [primaryColor, setPrimaryColor] = useState("#2563eb");
  const [secondaryColor, setSecondaryColor] = useState("#0f172a");
  const [fontFamily, setFontFamily] = useState("Inter");
  const [logo, setLogo] = useState("");
  const [banner, setBanner] = useState("");

  const handleCityChange = (cityName) => {
    setSelectedCity(cityName);
    const city = ALGERIAN_CITIES.find((c) => c.name === cityName);
    setShippingPrice(city ? city.price : 0);
  };

  // ==================
  // GET STORE PRODUCTS & INFO (🆕 مُحدث للـ Slug)
  // ==================
  const getStoreData = async () => {
    try {
      setLoading(true);
      // 🔄 التعديل 02: تحديث الرابط ليرسل الـ slug ديريكت للباك-أند
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/stores/public/${slug}`
      );
      const data = await response.json();

      if (data.store) {
        setStoreName(data.store.name || data.store.storeName);
        setPrimaryColor(data.store.primaryColor || "#2563eb");
        setSecondaryColor(data.store.secondaryColor || "#0f172a");
        setFontFamily(data.store.fontFamily || "Inter");
        setLogo(data.store.logo || "");
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
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  // ==================
  // ORDER PRODUCT
  // ==================
  const orderProduct = async (productId, productName, productPrice) => {
    if (!customerName.trim()) {
      alert("يرجى إدخال الاسم الكامل أولاً في الأعلى ⚠️");
      return;
    }
    if (!phone.trim()) {
      alert("يرجى إدخال رقم الهاتف أولاً في الأعلى ⚠️");
      return;
    }
    if (phone.trim().length < 9) {
      alert("يرجى إدخال رقم هاتف صحيح ⚠️");
      return;
    }
    if (!selectedCity) {
      alert("يرجى اختيار الولاية أولاً لحساب التوصيل ⚠️");
      return;
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
            phone,
            address,
            shippingCity: selectedCity,
            shippingPrice,
            totalPrice,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        alert(
          `🎉 تم تسجيل طلبك بنجاح لمنتج: ${productName}.\nالسعر الإجمالي مع التوصيل: ${totalPrice} د.ج.\nسنتصل بك قريباً لتأكيد الشحن!`
        );
        setCustomerName("");
        setPhone("");
        setAddress("");
        setSelectedCity("");
        setShippingPrice(0);
      } else {
        alert(data.message || "حدث خطأ أثناء إرسال الطلب");
      }
    } catch (error) {
      console.log(error);
      alert("حدث خطأ في الاتصال بالخادم، يرجى المحاولة مجدداً");
    }
  };

  // 🔄 التعديل 03: جعل الـ useEffect يراقب ويتفاعل مع تغير الـ slug
  useEffect(() => {
    if (slug) {
      getStoreData();
    }
  }, [slug]);

  if (loading) {
    return (
      <div
        style={{ fontFamily }}
        className="min-h-screen bg-[#f5f5f0] flex items-center justify-center"
      >
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-stone-800 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-stone-400 text-sm tracking-widest uppercase">
            جاري التحميل
          </p>
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
      <header className="bg-white border-b border-stone-200">
        <div className="max-w-5xl mx-auto px-5">

          {/* Banner */}
          {banner && (
            <div className="pt-5">
              <img
                src={banner}
                alt="banner"
                className="w-full h-44 object-cover rounded-2xl"
              />
            </div>
          )}

          {/* Logo + store info */}
          <div className="flex items-center gap-4 py-5">
            <div className="w-14 h-14 rounded-2xl border border-stone-200 bg-stone-50 flex items-center justify-center overflow-hidden flex-shrink-0">
              {logo ? (
                <img src={logo} alt="logo" className="w-full h-full object-cover" />
              ) : (
                <span className="text-2xl">🏪</span>
              )}
            </div>
            <div>
              <h1 className="text-xl font-semibold text-stone-900 leading-tight">
                {storeName}
              </h1>
              <p className="text-xs text-stone-400 mt-0.5">
                الدفع عند الاستلام · التوصيل لـ 58 ولاية 🇩🇿
              </p>
            </div>
          </div>

          {/* Nav tabs */}
          <div className="flex gap-1 border-t border-stone-100">
            <button className="px-4 py-3 text-sm font-medium text-stone-900 border-b-2 border-stone-900 -mb-px">
              المنتجات
            </button>
            <button className="px-4 py-3 text-sm text-stone-400 border-b-2 border-transparent -mb-px">
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
                className="w-full h-10 px-3 rounded-xl border border-stone-200 bg-stone-50 text-sm text-stone-900 outline-none focus:border-stone-400 focus:bg-white transition-all placeholder:text-stone-300"
              />
            </div>
            <div>
              <label className="block text-xs text-stone-400 mb-1.5">رقم الهاتف</label>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                type="tel"
                placeholder="0661234567"
                className="w-full h-10 px-3 rounded-xl border border-stone-200 bg-stone-50 text-sm text-stone-900 outline-none focus:border-stone-400 focus:bg-white transition-all placeholder:text-stone-300 text-right"
              />
            </div>
            <div>
              <label className="block text-xs text-stone-400 mb-1.5">الولاية</label>
              <select
                value={selectedCity}
                onChange={(e) => handleCityChange(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-stone-200 bg-stone-50 text-sm text-stone-900 outline-none focus:border-stone-400 focus:bg-white transition-all"
              >
                <option value="">اختر الولاية</option>
                {ALGERIAN_CITIES.map((city) => (
                  <option key={city.id} value={city.name}>
                    {city.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-stone-400 mb-1.5">
                العنوان
                <span className="text-stone-300 mr-1">(اختياري)</span>
              </label>
              <input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="البلدية، الحي..."
                className="w-full h-10 px-3 rounded-xl border border-stone-200 bg-stone-50 text-sm text-stone-900 outline-none focus:border-stone-400 focus:bg-white transition-all placeholder:text-stone-300"
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

        {/* ===== PRODUCTS SECTION ===== */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-sm font-medium text-stone-500 uppercase tracking-widest">
            المنتجات
          </h2>
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
                // 🔄 التعديل 04: تحديث الرابط ليعتمد على الـ slug في التوجيه لصفحة التفاصيل
                onClick={() => navigate(`/store/${slug}/product/${product._id}`)}
                className="bg-white border border-stone-200 rounded-2xl overflow-hidden hover:border-stone-400 transition-all duration-200 cursor-pointer group flex flex-col"
              >
                {/* Product image */}
                <div className="relative h-52 bg-stone-100 overflow-hidden">
                  <img
                    src={product.image || DEFAULT_PRODUCT_IMAGE}
                    alt={product.name}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = DEFAULT_PRODUCT_IMAGE;
                    }}
                    className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
                  />
                  {product.oldPrice && (
                    <span className="absolute top-3 right-3 text-xs font-medium bg-red-500 text-white px-2 py-0.5 rounded-full">
                      تخفيض
                    </span>
                  )}
                </div>

                {/* Product body */}
                <div className="p-4 flex flex-col flex-1">
                  <h3 className="font-medium text-stone-900 text-sm mb-1 truncate">
                    {product.name}
                  </h3>
                  <p className="text-xs text-stone-400 line-clamp-2 mb-4 flex-1 leading-relaxed">
                    {product.description}
                  </p>

                  {/* Price row */}
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

                  {/* Order button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      orderProduct(product._id, product.name, product.currentPrice);
                    }}
                    style={{ backgroundColor: secondaryColor }}
                    className="w-full h-10 rounded-xl text-white text-sm font-medium flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 11H4L5 9z" />
                    </svg>
                    طلب سريع
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