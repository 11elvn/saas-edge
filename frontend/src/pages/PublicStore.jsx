import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const ALGERIAN_CITIES = [
  { id: "16", name: "الجزائر العاصمة", price: 400 },
  { id: "31", name: "وهران", price: 500 },
  { id: "25", name: "قسنطينة", price: 500 },
  { id: "19", name: "سطيف", price: 450 },
];

const DEFAULT_IMG =
  "https://images.unsplash.com/photo-1531403009284-440f080d1e12?q=80&w=400";

function PublicStore() {
  const { slug } = useParams();

  const [store, setStore] = useState({
    name: "Store",
    primaryColor: "#2563eb",
    secondaryColor: "#0f172a",
    fontFamily: "Inter",
    phone: "",
  });

  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);

  const [customer, setCustomer] = useState({
    name: "",
    phone: "",
    address: "",
    cityId: "",
  });

  const [shipping, setShipping] = useState(0);
  const [loading, setLoading] = useState(true);

  // ================= FETCH STORE =================
  const loadStore = async () => {
    try {
      setLoading(true);

      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/stores/public/${slug}`
      );

      const data = await res.json();

      if (data.store) {
        setStore(data.store);
      }

      setProducts(data.products || []);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (slug) loadStore();
  }, [slug]);

  // ================= CITY =================
  const handleCity = (id) => {
    setCustomer({ ...customer, cityId: id });
    const city = ALGERIAN_CITIES.find((c) => c.id === id);
    setShipping(city?.price || 0);
  };

  // ================= CART =================
  const addToCart = (product) => {
    setCart((prev) => {
      const exists = prev.find((p) => p._id === product._id);
      if (exists) return prev;
      return [...prev, product];
    });
  };

  const removeFromCart = (id) => {
    setCart((prev) => prev.filter((p) => p._id !== id));
  };

  const totalPrice =
    cart.reduce((sum, p) => sum + p.currentPrice, 0) + shipping;

  // ================= ORDER =================
  const placeOrder = async () => {
    if (!customer.name || !customer.phone || !customer.cityId) {
      alert("Fill required fields");
      return;
    }

    const city = ALGERIAN_CITIES.find((c) => c.id === customer.cityId);

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/orders/create-bulk`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            customer,
            products: cart,
            shippingCity: city?.name,
            shippingPrice: shipping,
            totalPrice,
          }),
        }
      );

      if (res.ok) {
        const message =
          `🛒 New Order\n` +
          `Name: ${customer.name}\n` +
          `Phone: ${customer.phone}\n` +
          `Total: ${totalPrice} DA`;

        // WhatsApp fallback
        window.open(
          `https://wa.me/${store.phone || ""}?text=${encodeURIComponent(
            message
          )}`,
          "_blank"
        );

        setCart([]);
        alert("Order sent successfully 🎉");
      }
    } catch (err) {
      console.log(err);
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div
      className="min-h-screen pb-24"
      style={{
        fontFamily: store.fontFamily,
        background: "#f8fafc",
        color: store.secondaryColor,
      }}
    >
      {/* HEADER */}
      <div
        className="py-10 text-center text-white"
        style={{ background: store.primaryColor }}
      >
        <h1 className="text-3xl font-black">{store.name}</h1>
        <p className="text-white/80 text-sm">Cash on Delivery 🇩🇿</p>
      </div>

      {/* CUSTOMER FORM */}
      <div className="max-w-2xl mx-auto mt-6 bg-white p-5 rounded-2xl shadow">
        <input
          placeholder="Full Name"
          className="w-full p-3 border rounded-xl mb-3"
          onChange={(e) =>
            setCustomer({ ...customer, name: e.target.value })
          }
        />

        <input
          placeholder="Phone"
          className="w-full p-3 border rounded-xl mb-3"
          onChange={(e) =>
            setCustomer({ ...customer, phone: e.target.value })
          }
        />

        <select
          className="w-full p-3 border rounded-xl"
          onChange={(e) => handleCity(e.target.value)}
        >
          <option>Choose City</option>
          {ALGERIAN_CITIES.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* CART */}
      {cart.length > 0 && (
        <div className="max-w-2xl mx-auto mt-4 bg-white p-4 rounded-2xl shadow">
          <h2 className="font-bold mb-2">🛒 Cart</h2>

          {cart.map((p) => (
            <div key={p._id} className="flex justify-between text-sm mb-1">
              <span>{p.name}</span>
              <button
                onClick={() => removeFromCart(p._id)}
                className="text-red-500"
              >
                remove
              </button>
            </div>
          ))}

          <div className="mt-3 font-bold">
            Total: {totalPrice} DA
          </div>

          <button
            onClick={placeOrder}
            className="w-full mt-3 py-3 text-white rounded-xl font-bold"
            style={{ background: store.primaryColor }}
          >
            Checkout 🚀
          </button>
        </div>
      )}

      {/* PRODUCTS */}
      <div className="max-w-6xl mx-auto mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 px-4">
        {products.map((p) => (
          <div
            key={p._id}
            className="bg-white rounded-2xl shadow hover:shadow-lg transition overflow-hidden"
          >
            <img
              src={p.image || DEFAULT_IMG}
              className="h-52 w-full object-cover"
            />

            <div className="p-4">
              <h3 className="font-bold">{p.name}</h3>
              <p className="text-sm opacity-60">{p.description}</p>

              <div
                className="font-bold mt-2"
                style={{ color: store.primaryColor }}
              >
                {p.currentPrice} DA
              </div>

              <button
                onClick={() => addToCart(p)}
                className="w-full mt-3 py-2 rounded-xl text-white font-bold"
                style={{ background: store.primaryColor }}
              >
                Add to Cart 🛒
              </button>

              <button
                onClick={() =>
                  window.open(
                    `https://wa.me/${store.phone}?text=${encodeURIComponent(
                      `I want ${p.name}`
                    )}`,
                    "_blank"
                  )
                }
                className="w-full mt-2 py-2 rounded-xl border"
              >
                WhatsApp 💬
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default PublicStore;