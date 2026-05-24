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

const DEFAULT_PRODUCT_IMAGE = "https://images.unsplash.com/photo-1531403009284-440f080d1e12?q=80&w=400";

function PublicStore() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [storeData, setStoreData] = useState(null); // 🆕 حالة لتخزين إعدادات المتجر
  const [products, setProducts] = useState([]);
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

  const getStoreData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/stores/public/${slug}`);
      const data = await response.json();
      
      if (data.store) {
        setStoreData(data.store); // حفظ إعدادات الثيم واللوغو والبانر
      }
      if (data.products) setProducts(data.products);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const orderProduct = async (productId, productName, productPrice) => {
    // ... (نفس منطق الطلب السابق)
  };

  useEffect(() => {
    if (slug) getStoreData();
  }, [slug]);

  if (loading) return <div className="min-h-screen flex items-center justify-center">جاري تحميل المتجر...</div>;

  return (
    <div 
      className="min-h-screen pb-16" 
      dir="rtl"
      style={{ 
        fontFamily: storeData?.fontFamily || "Inter",
        color: storeData?.secondaryColor || "#1e293b",
        backgroundColor: "#f8fafc"
      }}
    >
      {/* 🖼️ البانر واللوغو */}
      {storeData?.banner && (
        <div className="w-full h-64 overflow-hidden">
          <img src={storeData.banner} className="w-full h-full object-cover" alt="Banner" />
        </div>
      )}

      <header className="max-w-6xl mx-auto px-6 py-8 text-center">
        {storeData?.logo && (
          <img src={storeData.logo} className="w-24 h-24 rounded-full mx-auto mb-4 border-4" style={{ borderColor: storeData.primaryColor }} alt="Logo" />
        )}
        <h1 className="text-3xl font-black">{storeData?.name}</h1>
      </header>

      <main className="max-w-5xl mx-auto px-4">
        {/* معلومات الطلب */}
        <section className="max-w-md mx-auto mb-10 bg-white p-6 rounded-3xl shadow-sm border">
          {/* ... (نموذج إدخال البيانات) */}
        </section>

        {/* المنتجات مع تطبيق الثيم */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <div key={product._id} className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100">
              <img src={product.image || DEFAULT_PRODUCT_IMAGE} className="w-full h-48 object-cover rounded-2xl mb-4" />
              <h3 className="font-bold text-lg">{product.name}</h3>
              <p className="text-blue-600 font-black text-xl my-2" style={{ color: storeData?.primaryColor }}>{product.currentPrice} د.ج</p>
              
              <button
                onClick={() => orderProduct(product._id, product.name, product.currentPrice)}
                className="w-full py-3 rounded-xl font-bold text-white transition"
                style={{ backgroundColor: storeData?.primaryColor }}
              >
                شراء سريع
              </button>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

export default PublicStore;