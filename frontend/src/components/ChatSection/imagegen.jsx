import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";

const ImageGen = () => {
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const user = localStorage.getItem("user");

  const location = useLocation();
  const key = `${location.pathname}_${user}`;

  const [messages, setMessages] = useState(() => {
    try {
      const saved = sessionStorage.getItem(key);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    sessionStorage.setItem(key, JSON.stringify(messages));
  }, [messages, key]);


  const queryHandle = async () => {
    if (!input.trim() || isLoading) return;

    const currentInput = input;

    setMessages((prev) => [
      ...prev,
      { role: "user", text: currentInput },
      { role: "bot", text: "Generating image..." },
    ]);

    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("http://127.0.0.1:5011/img", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: currentInput,Username: user }),
      });

      const data = await response.json();

      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = data.image
          ? { role: "bot", image: data.image }
          : { role: "bot", text: data.content };
        return updated;
      });
    } catch (error) {
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = { role: "bot", text: "Error: Could not connect." };
        return updated;
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full h-screen flex flex-col bg-linear-to-br from-amber-50 to-blue-100 p-4">
      {/* Messages Area */}
      <h1 className="self-center text-4xl text-cyan-900 font-extrabold">Make Your Imagination Alive!</h1>
      <div className="flex-1 overflow-y-auto space-y-4 mb-4 p-2">
        {messages.map((msg, index) => (
          <div key={index} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
            <div className={`max-w-[80%] p-10 rounded-2xl ${msg.role === 'user' ? 'bg-blue-600 text-white' : ' bg-white'}`}>
              <p className="text-xs opacity-50 mb-1 uppercase font-bold">{msg.role}</p>
              
              {msg.image ? (
                <img 
                  className="w-3xl h-1/2 rounded-lg shadow-sm" 
                  src={`data:image/png;base64,${msg.image}`} 
                  alt="AI Generated" 
                />
              ) : (
                <span className="text-lg">{msg.text}</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Input Area */}
      <div className="w-full px-4 pb-6 pt-2 flex justify-center">
  <div className="w-[60%] rounded-2xl p-4 flex gap-3 items-center">
    
    <input
      className="flex-1 outline-none text-gray-700 placeholder-gray-600 px-4 py-3 rounded-xl border border-amber-400"
      type="text"
      value={input}
      onChange={(e) => setInput(e.target.value)}
      onKeyDown={(e) => e.key === "Enter" && queryHandle()}
      placeholder="Describe an image..."
      disabled={isLoading}
    />

    <button
      onClick={queryHandle}
      disabled={isLoading}
      className="bg-blue-300 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 active:scale-95 disabled:bg-gray-400 transition-all"
    >
      {isLoading ? "..." : "Generate"}
    </button>

  </div>


      </div>
    </div>
  );
};

export default ImageGen;
