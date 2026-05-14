import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Dashboard() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [hasStore, setHasStore] = useState(true);
  const [storeName, setStoreName] = useState("");

  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);

  const [name, setName] = useState("");
  const [description, setDescription] =
    useState("");
  const [currentPrice, setCurrentPrice] =
    useState("");
  const [oldPrice, setOldPrice] =
    useState("");

  // =====================
  // GET PRODUCTS
  // =====================
  const getProducts = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/products/my-products`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (response.status === 404) {
        setHasStore(false);
        return;
      }

      setProducts(data);
    } catch (error) {
      console.log(error);
    }
  };

  // =====================
  // GET ORDERS
  // =====================
  const getOrders = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/orders/my-orders`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();
      setOrders(data);

    } catch (error) {
      console.log(error);
    }
  };

  // =====================
  // CREATE STORE
  // =====================
  const createStore = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/stores/create`,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
            Authorization:
              `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: storeName,
          }),
        }
      );

      const data =
        await response.json();

      alert(data.message);
      window.location.reload();

    } catch (error) {
      console.log(error);
    }
  };

  // =====================
  // CREATE PRODUCT
  // =====================
  const createProduct = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/products/create`,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
            Authorization:
              `Bearer ${token}`,
          },
          body: JSON.stringify({
            name,
            description,
            currentPrice,
            oldPrice,
          }),
        }
      );

      const data =
        await response.json();

      alert(data.message);

      getProducts();

      setName("");
      setDescription("");
      setCurrentPrice("");
      setOldPrice("");

    } catch (error) {
      console.log(error);
    }
  };

  // =====================
  // UPDATE ORDER
  // =====================
  const markShipped =
    async (id) => {
      try {
        await fetch(
          `${import.meta.env.VITE_API_URL}/api/orders/update-status/${id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type":
                "application/json",
              Authorization:
                `Bearer ${token}`,
            },
            body: JSON.stringify({
              status: "shipped",
            }),
          }
        );

        getOrders();

      } catch (error) {
        console.log(error);
      }
    };

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    getProducts();
    getOrders();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-8">

      {/* HEADER */}
      <div className="bg-white rounded-2xl shadow p-6 flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-blue-600">
          Dashboard 🚀
        </h1>

        <button
          onClick={logout}
          className="bg-red-500 text-white px-5 py-2 rounded-xl hover:bg-red-600"
        >
          Logout
        </button>
      </div>

      {!hasStore ? (
        <div className="bg-white p-10 rounded-2xl shadow text-center">
          <h2 className="text-2xl font-bold mb-4">
            Create your store 🏪
          </h2>

          <input
            className="border p-3 rounded-xl w-full max-w-md"
            placeholder="Store Name"
            onChange={(e) =>
              setStoreName(
                e.target.value
              )
            }
          />

          <br /><br />

          <button
            onClick={createStore}
            className="bg-blue-600 text-white px-8 py-3 rounded-xl"
          >
            Create Store
          </button>
        </div>
      ) : (
        <>
          {/* STATS */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white p-6 rounded-2xl shadow">
              <h3 className="text-gray-500">
                Products
              </h3>
              <p className="text-4xl font-bold text-blue-600">
                {products.length}
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow">
              <h3 className="text-gray-500">
                Orders
              </h3>
              <p className="text-4xl font-bold text-green-600">
                {orders.length}
              </p>
            </div>
          </div>

          {/* CREATE PRODUCT */}
          <div className="bg-white p-8 rounded-2xl shadow mb-8">
            <h2 className="text-2xl font-bold mb-6">
              Add Product
            </h2>

            <div className="grid gap-4">
              <input
                value={name}
                onChange={(e)=>
                  setName(
                    e.target.value
                  )
                }
                className="border p-3 rounded-xl"
                placeholder="Name"
              />

              <textarea
                value={description}
                onChange={(e)=>
                  setDescription(
                    e.target.value
                  )
                }
                className="border p-3 rounded-xl"
                placeholder="Description"
              />

              <input
                value={currentPrice}
                onChange={(e)=>
                  setCurrentPrice(
                    e.target.value
                  )
                }
                className="border p-3 rounded-xl"
                placeholder="Current Price"
              />

              <input
                value={oldPrice}
                onChange={(e)=>
                  setOldPrice(
                    e.target.value
                  )
                }
                className="border p-3 rounded-xl"
                placeholder="Old Price"
              />

              <button
                onClick={createProduct}
                className="bg-black text-white py-3 rounded-xl"
              >
                Save Product
              </button>
            </div>
          </div>

          {/* PRODUCTS */}
          <div className="bg-white p-8 rounded-2xl shadow mb-8">
            <h2 className="text-2xl font-bold mb-6">
              My Products
            </h2>

            <div className="grid md:grid-cols-2 gap-4">
              {products.map(
                (product) => (
                  <div
                    key={
                      product._id
                    }
                    className="border rounded-xl p-4"
                  >
                    <h3 className="font-bold text-lg">
                      {
                        product.name
                      }
                    </h3>

                    <p className="text-gray-500">
                      {
                        product.description
                      }
                    </p>

                    <p className="text-blue-600 font-bold mt-2">
                      {
                        product.currentPrice
                      }{" "}
                      DA
                    </p>
                  </div>
                )
              )}
            </div>
          </div>

          {/* ORDERS */}
          <div className="bg-white p-8 rounded-2xl shadow">
            <h2 className="text-2xl font-bold mb-6">
              My Orders 📦
            </h2>

            <div className="grid gap-4">
              {orders.map(
                (order) => (
                  <div
                    key={
                      order._id
                    }
                    className="border p-4 rounded-xl"
                  >
                    <h3 className="font-bold">
                      {
                        order.customerName
                      }
                    </h3>

                    <p>
                      {
                        order.phone
                      }
                    </p>

                    <p>
                      {
                        order
                          .productId
                          ?.name
                      }
                    </p>

                    <p className="font-bold text-orange-500">
                      {
                        order.status
                      }
                    </p>

                    {order.status ===
                      "pending" && (
                      <button
                        onClick={() =>
                          markShipped(
                            order._id
                          )
                        }
                        className="mt-2 bg-green-500 text-white px-4 py-2 rounded-lg"
                      >
                        Mark Shipped
                      </button>
                    )}
                  </div>
                )
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default Dashboard;