import { useEffect, useState } from "react";

function Theme() {
  const [store, setStore] = useState({
    name: "",
    slug: "",
    phone: "",
    logo: "",
    banner: "",
    primaryColor: "#2563eb",
    secondaryColor: "#0f172a",
    fontFamily: "Inter",
  });

  const token = localStorage.getItem("token");

  // جلب بيانات المتجر
  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/stores/my-store`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.hasStore) {
          setStore((prev) => ({
            ...prev,
            ...data.store,
          }));
        }
      })
      .catch((err) => console.error("Error fetching store:", err));
  }, [token]);

  // حفظ التغييرات
  const saveSettings = async () => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/stores/update`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(store),
        }
      );

      if (res.ok) {
        alert("Store updated successfully ✅");
      } else {
        alert("Failed to update store ❌");
      }
    } catch (err) {
      console.error("Error saving store:", err);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-8 mt-10 grid grid-cols-1 lg:grid-cols-2 gap-10">
      
      {/* Settings */}
      <div className="bg-white p-8 rounded-3xl shadow-sm border">
        <h1 className="text-2xl font-bold mb-6">
          🎨 Theme Customization
        </h1>

        <div className="space-y-4">

          <div>
            <label className="block text-sm font-medium mb-1">
              Store Name
            </label>
            <input
              className="w-full border p-3 rounded-xl"
              value={store.name}
              onChange={(e) =>
                setStore({ ...store, name: e.target.value })
              }
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Store Slug
            </label>
            <input
              className="w-full border p-3 rounded-xl"
              value={store.slug}
              onChange={(e) =>
                setStore({
                  ...store,
                  slug: e.target.value
                    .toLowerCase()
                    .replace(/\s+/g, "-"),
                })
              }
            />
            <p className="text-xs text-gray-500">
              yourstore.com/store/{store.slug}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Primary Color
              </label>
              <input
                type="color"
                className="w-full h-12 border p-1 rounded-xl"
                value={store.primaryColor}
                onChange={(e) =>
                  setStore({
                    ...store,
                    primaryColor: e.target.value,
                  })
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Secondary Color
              </label>
              <input
                type="color"
                className="w-full h-12 border p-1 rounded-xl"
                value={store.secondaryColor}
                onChange={(e) =>
                  setStore({
                    ...store,
                    secondaryColor: e.target.value,
                  })
                }
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Font Family
            </label>
            <select
              className="w-full border p-3 rounded-xl"
              value={store.fontFamily}
              onChange={(e) =>
                setStore({
                  ...store,
                  fontFamily: e.target.value,
                })
              }
            >
              {["Inter", "Poppins", "Cairo", "Roboto"].map(
                (font) => (
                  <option key={font} value={font}>
                    {font}
                  </option>
                )
              )}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Banner URL
            </label>
            <input
              className="w-full border p-3 rounded-xl"
              value={store.banner}
              onChange={(e) =>
                setStore({
                  ...store,
                  banner: e.target.value,
                })
              }
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Logo URL
            </label>
            <input
              className="w-full border p-3 rounded-xl"
              value={store.logo}
              onChange={(e) =>
                setStore({
                  ...store,
                  logo: e.target.value,
                })
              }
            />
          </div>

          <button
            onClick={saveSettings}
            className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold hover:bg-indigo-700 transition"
          >
            Save Theme Changes
          </button>
        </div>
      </div>

      {/* Live Preview */}
      <div className="bg-gray-50 p-8 rounded-3xl border border-dashed flex flex-col items-center">
        <h2 className="text-lg font-bold mb-4 text-center w-full">
          Live Preview
        </h2>

        <div
          className="w-full max-w-sm bg-white rounded-2xl shadow-lg overflow-hidden transition-all duration-300"
          style={{ fontFamily: store.fontFamily }}
        >
          {store.banner && (
            <img
              src={store.banner}
              alt="Banner"
              className="w-full h-32 object-cover"
            />
          )}

          <div
            className="p-6"
            style={{ color: store.secondaryColor }}
          >
            {store.logo && (
              <img
                src={store.logo}
                alt="Logo"
                className="w-16 h-16 rounded-full mx-auto mb-4 border-2"
                style={{
                  borderColor: store.primaryColor,
                }}
              />
            )}

            <h3 className="text-xl font-bold text-center">
              {store.name || "Store Name"}
            </h3>

            <div
              className="mt-6 p-4 rounded-xl text-white text-center"
              style={{
                backgroundColor: store.primaryColor,
              }}
            >
              Sample Product Button
            </div>

            <div className="mt-4 text-xs opacity-60 text-center">
              Preview mode
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Theme;