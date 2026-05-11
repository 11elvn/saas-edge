import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      const response = await fetch(
        "http://localhost:3000/api/users/login",
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

      if (response.ok && data.token) {
        localStorage.setItem(
          "token",
          data.token
        );

        alert(data.message);

        navigate("/dashboard");
      } else {
        alert(data.message);
      }

    } catch (error) {
      console.log(error);
      alert("Server error ❌");
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center">

      <h1 className="text-4xl font-bold mb-6">
        Login
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
        onClick={handleLogin}
        className="bg-blue-500 text-white px-6 py-3 rounded"
      >
        Login
      </button>

    </div>
  );
}

export default Login;