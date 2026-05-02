import React from 'react';

const Tokens = () => {
  // Parse the user object from localStorage
  const user = localStorage.getItem('user');
  // const username = user?.username; 

  const fetchTokens = async () => {
    try {
      const res = await fetch("http://localhost:5011/tokens", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ Username: user})
      });

      const data = await res.json();

      if (res.status === 200) {
        alert(`You have ${data.content} tokens left`);
      } else {
        alert("Failed to fetch tokens");
      }
    } catch (err) {
      console.error(err);
      alert("Server error");
    }
  };

  return (
    <div className="grid h-screen place-items-center">
      <button 
        className="px-1 py-2 bg-amber-500 text-white rounded-4xl grid  place-items-center" 
        onClick={fetchTokens}
      >
        Check Tokens
      </button>
    </div>
  );
};

export default Tokens;
