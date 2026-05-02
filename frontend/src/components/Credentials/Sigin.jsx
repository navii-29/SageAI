import { useState } from "react";
import { useNavigate } from "react-router-dom";

const Signin = () => {
  const [Username, setUsername] = useState("");
  const [Password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!Username || !Password) {
      setMessage("Fill all fields");
      return;
    }

    try {
      const res = await fetch("http://localhost:5011/signin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          Username: Username,
          Password: Password,
        }),
      });

      const data = await res.json();
      console.log(data);
      setMessage(data.Message);

      if (data.Message === "Sign in successful!") {
        localStorage.setItem("user", Username);

        navigate("/chat");
      }
    } catch (err) {
      console.error(err);
      setMessage("Server error");
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-linear-to-br from-amber-50 to-blue-100">
      <div className="bg-white p-8 rounded-2xl shadow-md w-80 space-y-4">
        <h2 className="text-xl font-bold text-center">Login</h2>

        <input
          type="text"
          placeholder="Username"
          className="w-full border p-2 rounded"
          value={Username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full border p-2 rounded"
          value={Password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={handleLogin}
          className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
        >
          Sign In
        </button>

        <p className="text-sm text-center text-gray-500">{message}</p>

        <p
          className="text-sm text-center text-blue-500 cursor-pointer"
          onClick={() => navigate("/register")}
        >
          Create account
        </p>
      </div>
    </div>
  );
};

export default Signin;