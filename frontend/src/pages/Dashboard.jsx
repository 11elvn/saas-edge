import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Dashboard() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  // Store
  const [hasStore, setHasStore] = useState(true);
  const [storeName, setStoreName] = useState("");

  // Products
  const [products, setProducts] = useState([]);

  // Orders
  const [orders, setOrders] = useState([]);

  // Product form
  const [name, setName] = useState("");
  const [description, setDescription] =
    useState("");
  const [currentPrice, setCurrentPrice] =
    useState("");
  const [oldPrice, setOldPrice] =
    useState("");

  // =========================
  // GET PRODUCTS
  // =========================
  const getProducts = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/products/my-products`,
        {
          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      );

      const data =
        await response.json();

      if (response.status === 404) {
        setHasStore(false);
        return;
      }

      setProducts(data);

    } catch (error) {
      console.log(error);
    }
  };

  // =========================
  // GET ORDERS
  // =========================
  const getOrders = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/orders/my-orders`,
        {
          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      );

      const data =
        await response.json();

      setOrders(data);

    } catch (error) {
      console.log(error);
    }
  };

  // =========================
  // CREATE STORE
  // =========================
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

  // =========================
  // CREATE PRODUCT
  // =========================
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

    } catch (error) {
      console.log(error);
    }
  };

  // =========================
  // UPDATE ORDER STATUS
  // =========================
  const markShipped =
    async (orderId) => {
      try {
        await fetch(
          `${import.meta.env.VITE_API_URL}/api/orders/update-status/${orderId}`,
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

  // logout
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
    <div style={{ padding: 20 }}>
      <h1>Dashboard 🚀</h1>

      <button onClick={logout}>
        Logout
      </button>

      <hr />

      {!hasStore ? (
        <div>
          <h2>Create Store</h2>

          <input
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
          >
            Create Store
          </button>
        </div>
      ) : (
        <>
          <h2>Create Product</h2>

          <input
            placeholder="Name"
            onChange={(e) =>
              setName(
                e.target.value
              )
            }
          />

          <br /><br />

          <input
            placeholder="Description"
            onChange={(e) =>
              setDescription(
                e.target.value
              )
            }
          />

          <br /><br />

          <input
            placeholder="Current Price"
            onChange={(e) =>
              setCurrentPrice(
                e.target.value
              )
            }
          />

          <br /><br />

          <input
            placeholder="Old Price"
            onChange={(e) =>
              setOldPrice(
                e.target.value
              )
            }
          />

          <br /><br />

          <button
            onClick={
              createProduct
            }
          >
            Add Product
          </button>

          <hr />

          <h2>
            My Products
          </h2>

          {products.map(
            (product) => (
              <div
                key={
                  product._id
                }
              >
                <h3>
                  {
                    product.name
                  }
                </h3>
                <p>
                  {
                    product.description
                  }
                </p>
                <hr />
              </div>
            )
          )}

          <hr />

          <h2>
            My Orders 📦
          </h2>

          {orders.map(
            (order) => (
              <div
                key={
                  order._id
                }
              >
                <h3>
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

                <p>
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
                  >
                    Mark Shipped
                  </button>
                )}

                <hr />
              </div>
            )
          )}
        </>
      )}
    </div>
  );
}

export default Dashboard;