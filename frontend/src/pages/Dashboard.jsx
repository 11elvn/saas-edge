import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Dashboard() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [hasStore, setHasStore] = useState(true);
  const [storeName, setStoreName] = useState("");
  const [products, setProducts] = useState([]);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [currentPrice, setCurrentPrice] = useState("");
  const [oldPrice, setOldPrice] = useState("");

  const getProducts = async () => {
    try {
      const response = await fetch(
        "http://localhost:3000/api/products/my-products",
        {
          headers: { Authorization: token },
        }
      );

      const data = await response.json();

      if (response.status === 404) {
        setHasStore(false);
        setProducts([]);
        return;
      }

      if (Array.isArray(data)) {
        setHasStore(true);
        setProducts(data);
      }

    } catch (error) {
      console.log(error);
    }
  };

  const createStore = async () => {
    try {
      const response = await fetch(
        "http://localhost:3000/api/stores/create",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: token,
          },
          body: JSON.stringify({
            name: storeName,
          }),
        }
      );

      const data = await response.json();

      alert(data.message);

      if (response.ok) {
        setHasStore(true);
        getProducts();
      }

    } catch (error) {
      console.log(error);
    }
  };

  const createProduct = async () => {
    try {
      const response = await fetch(
        "http://localhost:3000/api/products/create",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: token,
          },
          body: JSON.stringify({
            name,
            description,
            currentPrice,
            oldPrice,
          }),
        }
      );

      const data = await response.json();

      alert(data.message);
      getProducts();

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
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-6">

      <h1 className="text-4xl font-bold mb-6">
        Dashboard 🚀
      </h1>

      <button
        onClick={logout}
        className="bg-red-500 text-white px-4 py-2 rounded"
      >
        Logout
      </button>

      <hr className="my-6" />

      {hasStore && (
        <div className="grid grid-cols-3 gap-4 mb-8">

          <div className="bg-blue-500 text-white p-6 rounded-xl">
            <h3>Total Products</h3>
            <p className="text-3xl font-bold">
              {products.length}
            </p>
          </div>

          <div className="bg-green-500 text-white p-6 rounded-xl">
            <h3>Total Orders</h3>
            <p className="text-3xl font-bold">
              0
            </p>
          </div>

          <div className="bg-purple-500 text-white p-6 rounded-xl">
            <h3>Total Sales</h3>
            <p className="text-3xl font-bold">
              0 DA
            </p>
          </div>

        </div>
      )}

      {!hasStore ? (
        <div>
          <h2>Create Your Store</h2>

          <input
            className="border p-3 rounded w-full"
            placeholder="Store Name"
            onChange={(e) =>
              setStoreName(e.target.value)
            }
          />

          <br /><br />

          <button
            onClick={createStore}
            className="bg-blue-500 text-white px-6 py-3 rounded"
          >
            Create Store
          </button>
        </div>
      ) : (
        <>
          <h2>Create Product</h2>

          <input
            className="border p-3 rounded w-full"
            placeholder="Name"
            onChange={(e) =>
              setName(e.target.value)
            }
          />

          <br /><br />

          <input
            className="border p-3 rounded w-full"
            placeholder="Description"
            onChange={(e) =>
              setDescription(e.target.value)
            }
          />

          <br /><br />

          <input
            className="border p-3 rounded w-full"
            placeholder="Current Price"
            onChange={(e) =>
              setCurrentPrice(e.target.value)
            }
          />

          <br /><br />

          <input
            className="border p-3 rounded w-full"
            placeholder="Old Price"
            onChange={(e) =>
              setOldPrice(e.target.value)
            }
          />

          <br /><br />

          <button
            onClick={createProduct}
            className="bg-green-500 text-white px-6 py-3 rounded"
          >
            Add Product
          </button>
        </>
      )}

    </div>
  );
}

export default Dashboard;