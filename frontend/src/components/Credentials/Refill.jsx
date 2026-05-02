import React, { useState } from 'react';

const Refill = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleRefill = async () => {
    if (!username || !password) {
      setMessage("Please enter username and password");
      return;
    }
    try {
      const res = await fetch("http://localhost:5011/refill", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ Username: username, Password: password })
      });
      const data = await res.json();
      if (res.ok) {
        setMessage("Tokens refilled! Check balance from tokens section");
      } else {
        setMessage(data.content);
      }
    } catch (err) {
      console.error(err);
      setMessage("Server error try again later!");
    }
  };

  return (
    <div className="p-4 max-w-sm mx-auto">
      <h2 className="text-lg font-semibold mb-3">Refill Tokens</h2>
      <input
        type="text"
        placeholder="Username"
        className="w-full mb-2 p-2 border rounded"
        value={username}
        onChange={(e) => setUsername(e.target.value)}  // fixed
      />
      <input
        type="password"
        placeholder="Password"
        className="w-full mb-2 p-2 border rounded"
        value={password}
        onChange={(e) => setPassword(e.target.value)}  // fixed
      />
      <button
        onClick={handleRefill}
        className="w-full bg-amber-950 text-white p-2 rounded"
      >
        Refill Tokens
      </button>
      {message && <p className="mt-3 text-sm">{message}</p>}
    </div>
  );
};

export default Refill;