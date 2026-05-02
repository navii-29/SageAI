import { useState } from "react";
import { useNavigate } from "react-router-dom";

const Register = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [tokens, setTokens] = useState(5);
  const [message, setMessage] = useState("");

  const navigate = useNavigate();

  const handleRegister = async () => {
    if (!username || !password) {
      setMessage("Fill all fields");
      return;
    }

    try {
      const res = await fetch("http://localhost:5011/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          username,
          password,
          tokens
        })
      });

      const data = await res.json();

      setMessage(data.message || JSON.stringify(data));

      if (res.status === 200) {
        setTimeout(() => navigate("/signin"), 1000);
      }

    } catch (err) {
      console.error(err);
      setMessage("Server error");
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-linear-to-br from-amber-50 to-blue-100">
      <div className="bg-white p-8 rounded-2xl shadow-md w-80 space-y-4">
        <h2 className="text-xl font-bold text-center">Register</h2>

        <input
          type="text"
          placeholder="Username"
          className="w-full border p-2 rounded"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full border p-2 rounded"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={handleRegister}
          className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
        >
          Sign Up
        </button>

        <p className="text-sm text-center text-gray-500">{message}</p>

        <p
          className="text-sm text-center text-blue-500 cursor-pointer"
          onClick={() => navigate("/signin")}
        >
          Already have an account? Login
        </p>
      </div>
    </div>
  );
};

export default Register;