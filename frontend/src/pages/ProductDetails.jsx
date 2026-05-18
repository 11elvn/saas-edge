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

function ProductDetails() {
  const { storeId, productId } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [shippingPrice, setShippingPrice] = useState(0);
  const [loading, setLoading] = useState(true);

  const handleCityChange = (cityName) => {
    setSelectedCity(cityName);
    const city = ALGERIAN_CITIES.find((c) => c.name === cityName);
    setShippingPrice(city ? city.price : 0);
  };

  const getProductDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/products/${productId}`);
      const data = await response.json();
      if (response.ok) {
        setProduct(data);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const handleOrder = async () => {
    if (!customerName.trim() || !phone.trim() || !selectedCity) {
      alert("يرجى ملء جميع الحقول الإجبارية ⚠️");
      return;
    }

    const totalPrice = product.currentPrice + shippingPrice;

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/orders/create`, {
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
      });

      if (response.ok) {
        alert("🎉 تم تسجيل طلبك بنجاح! سنتصل بك قريباً.");
        setCustomerName(""); setPhone(""); setAddress(""); setSelectedCity(""); setShippingPrice(0);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (productId) getProductDetails();
  }, [productId]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );

  if (!product) return (
    <div className="min-h-screen flex flex-col items-center justify-center" dir="rtl">
      <p className="text-slate-500 font-bold mb-4">المنتج غير موجود ❌</p>
      <button onClick={() => navigate(`/store/${storeId}`)} className="text-blue-600 font-bold">العودة للمتجر</button>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#1e293b] pb-16" dir="rtl">
      <header className="bg-white border-b border-slate-100 py-4 shadow-sm sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 flex justify-between items-center">
          <button onClick={() => navigate(`/store/${storeId}`)} className="font-bold text-slate-600">⬅️ العودة</button>
          <span className="font-black text-slate-700">تفاصيل المنتج</span>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* معلومات المنتج */}
        <div className="space-y-6">
          <div className="h-80 bg-white rounded-[32px] shadow-sm border border-slate-100 flex items-center justify-center text-6xl">📦</div>
          <div className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-100">
            <h1 className="text-2xl font-black mb-2">{product.name}</h1>
            <div className="text-2xl font-black text-blue-600 mb-4">{product.currentPrice} د.ج</div>
            <p className="text-slate-600 text-sm leading-relaxed">{product.description}</p>
          </div>
        </div>

        {/* استمارة الطلب */}
        <div className="h-fit">
          <section className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-100 space-y-4">
            <h3 className="font-bold text-center">🛒 الشراء السريع</h3>
            <div className="space-y-3">
              <input value={customerName} className="w-full border p-3 rounded-xl" placeholder="الاسم الكامل" onChange={(e) => setCustomerName(e.target.value)} />
              <input value={phone} className="w-full border p-3 rounded-xl text-right" placeholder="رقم الهاتف" onChange={(e) => setPhone(e.target.value)} />
              <select value={selectedCity} className="w-full border p-3 rounded-xl" onChange={(e) => handleCityChange(e.target.value)}>
                <option value="">-- اختر ولايتك --</option>
                {ALGERIAN_CITIES.map((city) => <option key={city.id} value={city.name}>{city.name}</option>)}
              </select>
              <input value={address} className="w-full border p-3 rounded-xl" placeholder="العنوان (اختياري)" onChange={(e) => setAddress(e.target.value)} />

              {selectedCity && (
                <div className="bg-blue-50 p-3 rounded-xl text-sm font-bold flex justify-between">
                  <span>المجموع مع التوصيل:</span>
                  <span className="text-blue-600">{product.currentPrice + shippingPrice} د.ج</span>
                </div>
              )}

              <button onClick={handleOrder} className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold hover:bg-blue-600 transition-all">تأكيد الطلب</button>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

export default ProductDetails;