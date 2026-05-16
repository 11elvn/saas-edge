import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Dashboard() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [store, setStore] = useState(null);
  const [hasStore, setHasStore] = useState(true);
  const [storeName, setStoreName] = useState("");

  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);

  const [editingId, setEditingId] =
    useState(null);

  const [name, setName] = useState("");
  const [description, setDescription] =
    useState("");
  const [currentPrice, setCurrentPrice] =
    useState("");
  const [oldPrice, setOldPrice] =
    useState("");

  const getStore = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/stores/my-store`,
        {
          headers: {
            Authorization: token,
          },
        }
      );

      const data = await response.json();

      if (response.status === 404) {
        setHasStore(false);
        return;
      }

      setStore(data);
    } catch (error) {
      console.log(error);
    }
  };

  const getProducts = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/products/my-products`,
        {
          headers: {
            Authorization: token,
          },
        }
      );

      const data = await response.json();

      if (Array.isArray(data)) {
        setProducts(data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getOrders = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/orders/my-orders`,
        {
          headers: {
            Authorization: token,
          },
        }
      );

      const data = await response.json();

      if (Array.isArray(data)) {
        setOrders(data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const createStore = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/stores/create`,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
            Authorization: token,
          },
          body: JSON.stringify({
            name: storeName,
          }),
        }
      );

      const data = await response.json();

      alert(data.message);
      window.location.reload();
    } catch (error) {
      console.log(error);
    }
  };

  const createProduct = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/products/create`,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
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

      setName("");
      setDescription("");
      setCurrentPrice("");
      setOldPrice("");
    } catch (error) {
      console.log(error);
    }
  };

  const updateProduct = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/products/update/${editingId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type":
              "application/json",
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

      setEditingId(null);

      setName("");
      setDescription("");
      setCurrentPrice("");
      setOldPrice("");

      getProducts();

    } catch (error) {
      console.log(error);
    }
  };

  const startEdit = (product) => {
    setEditingId(product._id);

    setName(product.name);
    setDescription(product.description);
    setCurrentPrice(product.currentPrice);
    setOldPrice(product.oldPrice);
  };

  const deleteProduct = async (id) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/products/delete/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: token,
          },
        }
      );

      const data = await response.json();

      alert(data.message);
      getProducts();

    } catch (error) {
      console.log(error);
    }
  };

  const markShipped = async (id) => {
    try {
      await fetch(
        `${import.meta.env.VITE_API_URL}/api/orders/update-status/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type":
              "application/json",
            Authorization: token,
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

    getStore();
    getProducts();
    getOrders();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-8">

      <div className="bg-white rounded-2xl shadow p-6 flex justify-between mb-8">
        <h1 className="text-3xl font-bold text-blue-600">
          Dashboard 🚀
        </h1>

        <button
          onClick={logout}
          className="bg-red-500 text-white px-5 py-2 rounded-xl"
        >
          Logout
        </button>
      </div>

      <div className="bg-white p-8 rounded-2xl shadow mb-8">
        <h2 className="text-2xl font-bold mb-6">
          {editingId
            ? "Edit Product ✏️"
            : "Add Product"}
        </h2>

        <div className="grid gap-4">
          <input
            value={name}
            onChange={(e)=>
              setName(e.target.value)
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

          {editingId ? (
            <button
              onClick={updateProduct}
              className="bg-green-600 text-white py-3 rounded-xl"
            >
              Update Product
            </button>
          ) : (
            <button
              onClick={createProduct}
              className="bg-black text-white py-3 rounded-xl"
            >
              Save Product
            </button>
          )}
        </div>
      </div>

      <div className="bg-white p-8 rounded-2xl shadow">
        <h2 className="text-2xl font-bold mb-6">
          My Products
        </h2>

        <div className="grid md:grid-cols-2 gap-4">
          {products.map((product) => (
            <div
              key={product._id}
              className="border p-4 rounded-xl"
            >
              <h3 className="font-bold">
                {product.name}
              </h3>

              <p>
                {product.description}
              </p>

              <p className="text-blue-600 font-bold">
                {product.currentPrice} DA
              </p>

              <div className="flex gap-2 mt-3">
                <button
                  onClick={() =>
                    startEdit(product)
                  }
                  className="bg-yellow-500 text-white px-4 py-2 rounded"
                >
                  Edit
                </button>

                <button
                  onClick={() =>
                    deleteProduct(product._id)
                  }
                  className="bg-red-500 text-white px-4 py-2 rounded"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}

export default Dashboard;