import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

// قائمة افتراضية ببعض الولايات وأسعار التوصيل المقترحة (يمكنك التعديل عليها أو توسيعها)
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

function PublicStore() {
  const { storeId } = useParams();

  const [storeName, setStoreName] = useState("متجر إلكتروني");
  const [products, setProducts] = useState([]);
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [shippingPrice, setShippingPrice] = useState(0);
  const [loading, setLoading] = useState(true);

  // تحديث سعر التوصيل عند اختيار الولاية
  const handleCityChange = (cityName) => {
    setSelectedCity(cityName);
    const city = ALGERIAN_CITIES.find((c) => c.name === cityName);
    setShippingPrice(city ? city.price : 0);
  };

  // ==================
  // GET STORE PRODUCTS & INFO
  // ==================
  const getStoreData = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/stores/public/${storeId}`
      );
      const data = await response.json();
      
      if (data.storeName || data.name) {
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
    // التحقق من الحقول قبل الإرسال
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
          headers: {
            "Content-Type": "application/json",
          },
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
        alert(`🎉 تم تسجيل طلبك بنجاح لمنتج: ${productName}.\nالسعر الإجمالي مع التوصيل: ${totalPrice} د.ج.\nسنتصل بك قريباً لتأكيد الشحن!`);
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

  useEffect(() => {
    if (storeId) {
      getStoreData();
    }
  }, [storeId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-500 font-medium animate-pulse">جاري تحميل المتجر...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#1e293b] font-sans pb-16" dir="rtl">
      
      {/* أعلى المتجر (Header) */}
      <header className="bg-white border-b border-slate-100 py-8 shadow-sm sticky top-0 z-40 backdrop-blur-md bg-white/90">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-3 shadow-sm">
            🏪
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-800 mb-1">
            {storeName}
          </h1>
          <p className="text-slate-400 text-xs md:text-sm">الدفع عند الاستلام والتوصيل متوفر لـ 58 ولاية 🇩🇿</p>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 mt-8">
        
        {/* معلومات المشتري (Checkout Form) */}
        <section className="max-w-md mx-auto mb-10 bg-white p-6 rounded-[24px] shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold mb-4 text-center text-slate-800 flex items-center justify-center gap-2">
            <span>📝</span> أدخل معلوماتك للطلب مباشرة
          </h3>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1 mr-1">الاسم الكامل:</label>
              <input
                value={customerName}
                className="w-full border border-slate-200 bg-slate-50/50 p-3 rounded-xl outline-none focus:bg-white focus:border-blue-500 transition-all text-sm"
                placeholder="مثال: محمد بلقاسم"
                onChange={(e) => setCustomerName(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1 mr-1">رقم الهاتف:</label>
              <input
                value={phone}
                type="tel"
                className="w-full border border-slate-200 bg-slate-50/50 p-3 rounded-xl outline-none focus:bg-white focus:border-blue-500 transition-all text-sm text-right"
                placeholder="مثال: 0661234567"
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1 mr-1">الولاية:</label>
              <select
                value={selectedCity}
                className="w-full border border-slate-200 bg-slate-50/50 p-3 rounded-xl outline-none focus:bg-white focus:border-blue-500 transition-all text-sm"
                onChange={(e) => handleCityChange(e.target.value)}
              >
                <option value="">-- اختر ولايتك --</option>
                {ALGERIAN_CITIES.map((city) => (
                  <option key={city.id} value={city.name}>
                    {city.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1 mr-1">البلدية / العنوان (اختياري):</label>
              <input
                value={address}
                className="w-full border border-slate-200 bg-slate-50/50 p-3 rounded-xl outline-none focus:bg-white focus:border-blue-500 transition-all text-sm"
                placeholder="مثال: وسط المدينة بجانب البريد"
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>

            {selectedCity && (
              <div className="bg-blue-50/50 border border-blue-100 p-3 rounded-xl text-xs text-blue-700 flex justify-between items-center font-medium">
                <span>سعر التوصيل للولاية المختارة:</span>
                <span className="font-bold text-sm">{shippingPrice} د.ج</span>
              </div>
            )}
          </div>
        </section>

        {/* عنوان قسم المنتجات */}
        <h2 className="text-xl font-bold mb-6 text-slate-800 border-r-4 border-blue-600 pr-2">
          المنتجات المعروضة ({products.length})
        </h2>

        {/* شبكة عرض المنتجات */}
        {products.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-slate-100">
            <p className="text-slate-400 font-medium">لا توجد منتجات معروضة حالياً في هذا المتجر.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <div
                key={product._id}
                className="bg-white rounded-[24px] shadow-sm border border-slate-100 hover:shadow-md transition-all duration-300 flex flex-col justify-between overflow-hidden"
              >
                <div className="h-44 bg-slate-50 w-full flex items-center justify-center text-4xl">
                  📦
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-lg text-slate-800 mb-1 line-clamp-1">
                      {product.name}
                    </h3>
                    <p className="text-slate-400 text-xs mb-4 line-clamp-2 min-h-[32px]">
                      {product.description}
                    </p>
                  </div>

                  <div>
                    <div className="flex flex-col gap-1 mb-4">
                      <div className="flex items-baseline gap-1">
                        <span className="text-xl font-black text-blue-600">{product.currentPrice} د.ج</span>
                        {product.oldPrice && (
                          <span className="text-slate-300 line-through text-xs mr-2">{product.oldPrice} د.ج</span>
                        )}
                      </div>
                      {selectedCity && (
                        <span className="text-xs text-slate-500 font-medium">
                          الإجمالي: <span className="font-bold text-slate-700">{product.currentPrice + shippingPrice} د.ج</span>
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => orderProduct(product._id, product.name, product.currentPrice)}
                      className="w-full bg-slate-900 hover:bg-blue-600 text-white py-3.5 rounded-xl text-sm font-bold shadow-sm active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                    >
                      <span>🛒</span>
                      اضغط هنا للشراء السريع
                    </button>
                  </div>
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