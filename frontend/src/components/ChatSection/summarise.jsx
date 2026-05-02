import { IoSend } from "react-icons/io5";
import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { useLocation } from "react-router-dom";



const user = localStorage.getItem('user');

const markdownComponents = {
  p: ({ node, ...props }) => (
    <p style={{ margin: "4px 0", lineHeight: "1.6" }} {...props} />
  ),
  strong: ({ node, ...props }) => (
    <strong style={{ fontWeight: 600 }} {...props} />
  ),
  em: ({ node, ...props }) => (
    <em style={{ fontStyle: "italic" }} {...props} />
  ),
  ul: ({ node, ...props }) => (
    <ul style={{ paddingLeft: "18px", margin: "6px 0", listStyleType: "disc" }} {...props} />
  ),
  ol: ({ node, ...props }) => (
    <ol style={{ paddingLeft: "18px", margin: "6px 0" }} {...props} />
  ),
  li: ({ node, ...props }) => (
    <li style={{ margin: "4px 0", lineHeight: "1.6" }} {...props} />
  ),
  h1: ({ node, ...props }) => (
    <h1 style={{ fontSize: "17px", fontWeight: 600, margin: "12px 0 6px", lineHeight: "1.4" }} {...props} />
  ),
  h2: ({ node, ...props }) => (
    <h2 style={{ fontSize: "15px", fontWeight: 600, margin: "10px 0 5px", lineHeight: "1.4" }} {...props} />
  ),
  h3: ({ node, ...props }) => (
    <h3 style={{ fontSize: "14px", fontWeight: 600, margin: "8px 0 4px", lineHeight: "1.4" }} {...props} />
  ),
  code: ({ node, inline, className, children, ...props }) =>
    inline ? (
      <code
        style={{
          background: "rgba(0,0,0,0.08)",
          borderRadius: "4px",
          padding: "1px 6px",
          fontSize: "12px",
          fontFamily: "monospace",
        }}
        {...props}
      >
        {children}
      </code>
    ) : (
      <pre
        style={{
          background: "rgba(0,0,0,0.07)",
          borderRadius: "6px",
          padding: "10px 14px",
          overflowX: "auto",
          fontSize: "12px",
          margin: "8px 0",
          fontFamily: "monospace",
        }}
      >
        <code {...props}>{children}</code>
      </pre>
    ),
  blockquote: ({ node, ...props }) => (
    <blockquote
      style={{
        borderLeft: "3px solid rgba(0,0,0,0.15)",
        paddingLeft: "10px",
        margin: "8px 0",
        color: "rgba(0,0,0,0.6)",
        fontStyle: "italic",
      }}
      {...props}
    />
  ),
  hr: () => (
    <hr
      style={{
        border: "none",
        borderTop: "1px solid rgba(0,0,0,0.1)",
        margin: "10px 0",
      }}
    />
  ),
  a: ({ node, ...props }) => (
    <a
      style={{ color: "#3b82f6", textDecoration: "underline" }}
      target="_blank"
      rel="noopener noreferrer"
      {...props}
    />
  ),
};

const Summarization = () => {
  const location = useLocation();
const key = `${location.pathname}_${user}`;
  const [input, setInput] = useState('');
  // const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef(null);

// saving context for chat

  // const [input, setInput] = useState("");
  const [messages, setMessages] = useState(() => {
    const saved3 = sessionStorage.getItem(key);
    return saved3 ? JSON.parse(saved3) : [];
  });

  // const [isLoading, setIsLoading] = useState(false);
  // const [isStreaming, setIsStreaming] = useState(false);
  // const [attachedFiles, setAttachedFiles] = useState([]);

  // const scrollRef = useRef(null);
  // const imageInputRef = useRef(null);
  // const docInputRef = useRef(null);

  useEffect(() => {
    sessionStorage.setItem(key, JSON.stringify(messages));
  }, [messages, user]);

  // 

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const queryhandle = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg = { role: "user", text: input };
    setMessages(prev => [...prev, userMsg]);

    const currentInput = input;
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("http://127.0.0.1:5011/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: currentInput, Username: user }),
      });

      const data = await response.json();
      setMessages(prev => [
        ...prev,
        { role: "bot", text: data.reply || data.content },
      ]);
    } catch (error) {
      setMessages(prev => [
        ...prev,
        { role: "bot", text: "Error: Could not connect." },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full h-screen flex flex-col bg-linear-to-br from-amber-50 to-blue-100">

      {/* Header */}
      <div className="p-8 flex justify-center">
        <h1 className="text-3xl font-bold text-gray-700 text-center">
          Hey There! <br /> Paste External Links Here!
        </h1>
      </div>

      {/* Messages Area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-2">
        <div className="max-w-3xl mx-auto space-y-3">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`px-4 py-3 rounded-2xl max-w-md text-sm shadow-sm ${
                  msg.role === "user"
                    ? "bg-blue-500 text-white rounded-tr-none"
                    : "bg-white text-gray-800 rounded-tl-none border border-gray-100 mt-3"
                }`}
              >
                <ReactMarkdown components={markdownComponents}>
                  {msg.text}
                </ReactMarkdown>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white border border-gray-100 text-gray-400 px-4 py-3 rounded-2xl rounded-tl-none text-sm shadow-sm">
                <span className="animate-pulse">Typing...</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Input Bar */}
      <div className="w-full px-4 pb-6 pt-2">
        <div className="max-w-3xl mx-auto flex items-center bg-white rounded-full shadow-md px-4 py-2 gap-3">
          <input
            className="flex-1 outline-none text-gray-700 placeholder-gray-400 px-2"
            type="text"
            placeholder="Paste URL here..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && queryhandle()}
            disabled={isLoading}
          />

          <button
            onClick={queryhandle}
            disabled={!input.trim() || isLoading}
            className={`p-2 rounded-full transition-all ${
              !input.trim() || isLoading
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "bg-blue-500 hover:bg-blue-600 text-white"
            }`}
          >
            <IoSend />
          </button>
        </div>
      </div>

    </div>
  );
};

export default Summarization;