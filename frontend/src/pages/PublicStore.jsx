import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

function PublicStore() {
  const { storeId } = useParams();

  const [products, setProducts] = useState([]);

  const [customerName, setCustomerName] =
    useState("");

  const [phone, setPhone] =
    useState("");

  // ==================
  // GET STORE PRODUCTS
  // ==================
  const getProducts = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/stores/public/${storeId}`
      );

      const data =
        await response.json();

      setProducts(data.products);

    } catch (error) {
      console.log(error);
    }
  };

  // ==================
  // ORDER PRODUCT
  // ==================
  const orderProduct =
    async (productId) => {
      try {
        const response =
          await fetch(
            `${import.meta.env.VITE_API_URL}/api/orders/create`,
            {
              method: "POST",
              headers: {
                "Content-Type":
                  "application/json",
              },
              body: JSON.stringify({
                productId,
                customerName,
                phone,
              }),
            }
          );

        const data =
          await response.json();

        alert(data.message);

      } catch (error) {
        console.log(error);
      }
    };

  useEffect(() => {
    getProducts();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-8">

      <h1 className="text-4xl font-bold text-center mb-10">
        Store 🛍️
      </h1>

      <div className="max-w-md mx-auto mb-10 bg-white p-6 rounded-2xl shadow">
        <input
          className="border p-3 rounded-xl w-full mb-4"
          placeholder="Your name"
          onChange={(e)=>
            setCustomerName(
              e.target.value
            )
          }
        />

        <input
          className="border p-3 rounded-xl w-full"
          placeholder="Phone"
          onChange={(e)=>
            setPhone(
              e.target.value
            )
          }
        />
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {products.map(
          (product) => (
            <div
              key={product._id}
              className="bg-white p-6 rounded-2xl shadow"
            >
              <h2 className="text-xl font-bold">
                {product.name}
              </h2>

              <p className="text-gray-500 my-3">
                {
                  product.description
                }
              </p>

              <p className="text-blue-600 font-bold text-2xl">
                {
                  product.currentPrice
                } DA
              </p>

              <button
                onClick={() =>
                  orderProduct(
                    product._id
                  )
                }
                className="mt-4 bg-black text-white px-6 py-3 rounded-xl w-full"
              >
                Order
              </button>
            </div>
          )
        )}
      </div>
    </div>
  );
}

export default PublicStore;