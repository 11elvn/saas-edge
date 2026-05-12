import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Register() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = async () => {
    try {
      // تم التعديل هنا لربط عملية التسجيل بالرابط العالمي المنشور على Render
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/users/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            password,
          }),
        }
      );

      const data = await response.json();

      alert(data.message);

      if (response.ok) {
        navigate("/login");
      }

    } catch (error) {
      console.log(error);
      alert("Server error ❌");
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center">

      <h1 className="text-4xl font-bold mb-6">
        Register
      </h1>

      <input
        className="border p-3 rounded w-72"
        type="email"
        placeholder="Email"
        onChange={(e) =>
          setEmail(e.target.value)
        }
      />

      <br />

      <input
        className="border p-3 rounded w-72"
        type="password"
        placeholder="Password"
        onChange={(e) =>
          setPassword(e.target.value)
        }
      />

      <br />

      <button
        onClick={handleRegister}
        className="bg-green-500 text-white px-6 py-3 rounded"
      >
        Register
      </button>

    </div>
  );
}

export default Register;