import { ImAttachment } from "react-icons/im";
import { MdInsertPhoto } from "react-icons/md";
import { IoSend, IoClose } from "react-icons/io5";
import { FaFilePdf, FaFileWord } from "react-icons/fa";
import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { useLocation } from "react-router-dom";



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
  code({ children, className, ...props }) {
  const isInline = !className;

  return isInline ? (
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
    overflowY: "hidden",
    maxWidth: "100%",
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
    overflowWrap: "anywhere",
    fontSize: "12px",
    margin: "8px 0",
    fontFamily: "monospace",
    display: "block",
    boxSizing: "border-box",
  }}
>
      <code {...props}>{children}</code>
    </pre>
  
    )},
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


const Reasoning = () => {
  const user = localStorage.getItem("user");

  const location = useLocation();
  const key = `${location.pathname}_${user}`;

  const [input, setInput] = useState("");
  const [messages, setMessages] = useState(() => {
    const saved2 = sessionStorage.getItem(key);
    return saved2 ? JSON.parse(saved2) : [];
  });

  const [isLoading, setIsLoading] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState([]);

  const scrollRef = useRef(null);
  const imageInputRef = useRef(null);
  const docInputRef = useRef(null);

  useEffect(() => {
    sessionStorage.setItem(key, JSON.stringify(messages));
  }, [messages, user]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);





  const handleImageAttach = (e) => {
    const files = Array.from(e.target.files);
    const previews = files.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      type: "image"
    }));
    setAttachedFiles(prev => [...prev, ...previews]);
    e.target.value = "";
  };

  const handleDocAttach = (e) => {
    const files = Array.from(e.target.files);
    const docs = files.map(file => ({
      file,
      preview: null,
      type: "doc"
    }));
    setAttachedFiles(prev => [...prev, ...docs]);
    e.target.value = "";
  };

  const removeAttachment = (index) => {
    setAttachedFiles(prev => {
      const updated = [...prev];
      if (updated[index].preview) URL.revokeObjectURL(updated[index].preview);
      updated.splice(index, 1);
      return updated;
    });
  };

  const toBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result.split(",")[1]);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const queryhandle = async () => {
    if ((!input.trim() && attachedFiles.length === 0) || isLoading) return;

    const userMsg = {
      role: "user",
      text: input,
      files: attachedFiles.map(a => ({
        name: a.file.name,
        preview: a.preview,
        type: a.type,
        fileType: a.file.type
      }))
    };

    setMessages(prev => [...prev, userMsg]);

    const currentInput = input;
    const currentFiles = [...attachedFiles];

    setInput("");
    setAttachedFiles([]);
    setIsLoading(true);

    try {
      const encodedFiles = await Promise.all(
        currentFiles.map(async (a) => ({
          name: a.file.name,
          type: a.file.type,
          data: await toBase64(a.file),
        }))
      );

      const response = await fetch("http://127.0.0.1:5011/reasoning", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: currentInput,
          files: encodedFiles,
          Username: user
        })
      });

//       console.log("Status:", response.status);
// const text = await response.text(); // use .text() first, not .json()
// console.log("Raw response:", text);

      const data = await response.json();

      setMessages(prev => [
        ...prev,
        { role: "bot", text: data.content }
      ]);

    } catch (error) {
      console.error(error);
      setMessages(prev => [
        ...prev,
        { role: "bot", text: "Error: Could not connect." }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    // ✅ Fixed: was bg-linear-to-br (invalid), now bg-gradient-to-br
    <div className="w-full h-screen flex flex-col bg-linear-to-br from-amber-50 to-blue-100">

      {/* Header */}
      <div className="p-8 flex justify-center">
        <h1 className="text-3xl font-bold text-gray-700 text-center">
          Hey There! <br /> What's on your mind today?
        </h1>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-2">
        <div className="w-full max-w-3xl mx-auto space-y-3 min-w-0">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`px-4 py-3 rounded-2xl text-sm shadow-sm overflow-hidden min-w-0 ${
                msg.role === "user"
                ? "bg-blue-500 text-white rounded-tr-none max-w-md"
                : "bg-white text-gray-800 rounded-tl-none border border-gray-100 mt-3 w-full max-w-3xl"
                   }`}
              >
                {/* File previews inside message */}
                {msg.files && msg.files.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-2">
                    {msg.files.map((f, i) => (
                      <div key={i}>
                        {f.type === "image" ? (
                          <img src={f.preview} className="max-h-40 rounded-lg" alt={f.name} />
                        ) : (
                          <div className="flex items-center gap-2">
                            {f.fileType === "application/pdf" ? (
                              <FaFilePdf className="text-red-400" />
                            ) : (
                              <FaFileWord className="text-blue-400" />
                            )}
                            <span className="text-xs">{f.name}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

               <ReactMarkdown components={markdownComponents}>
  {String(msg?.text || "")}
</ReactMarkdown>
                 {/* {msg.text} */}
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

      {/* Attachment preview above input */}
      {attachedFiles.length > 0 && (
        <div className="max-w-3xl mx-auto w-full px-4 mb-2">
          <div className="flex flex-wrap gap-2 bg-white/70 rounded-2xl px-3 py-2 shadow-sm border">
            {attachedFiles.map((a, i) => (
              <div key={i} className="relative">
                {a.type === "image" ? (
                  <img src={a.preview} className="h-16 w-16 rounded-xl object-cover" alt="preview" />
                ) : (
                  <div className="flex items-center gap-1 bg-white border rounded-lg px-2 py-1">
                    {a.file.type === "application/pdf"
                      ? <FaFilePdf className="text-red-500 text-xl" />
                      : <FaFileWord className="text-blue-500 text-xl" />
                    }
                    <span className="text-xs text-gray-600 max-w-20 truncate">{a.file.name}</span>
                  </div>
                )}
                <button
                  onClick={() => removeAttachment(i)}
                  className="absolute -top-1 -right-1 bg-gray-700 text-white rounded-full p-1"
                >
                  <IoClose size={10} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Hidden file inputs */}
      <input ref={imageInputRef} type="file" accept="image/*" multiple hidden onChange={handleImageAttach} />
      <input ref={docInputRef} type="file" accept=".pdf,.doc,.docx" multiple hidden onChange={handleDocAttach} />

      {/* Input bar */}
      <div className="w-full px-4 pb-6 pt-2">
        <div className="max-w-3xl mx-auto flex items-center bg-white rounded-full shadow-md px-4 py-2 gap-3">

          <input
            className="flex-1 outline-none text-gray-700 placeholder-gray-400 px-2"
            type="text"
            placeholder="Enter your query here..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && queryhandle()}
            disabled={isLoading}
          />

          <div className="flex items-center gap-3 text-gray-500 text-lg border-l pl-3">
            <button onClick={() => docInputRef.current.click()} className="hover:text-blue-500">
              <ImAttachment />
            </button>
            <button onClick={() => imageInputRef.current.click()} className="hover:text-green-500">
              <MdInsertPhoto />
            </button>
          </div>

          <button
            onClick={queryhandle}
            disabled={(!input.trim() && attachedFiles.length === 0) || isLoading}
            className={`p-2 rounded-full transition-all ${
              (!input.trim() && attachedFiles.length === 0) || isLoading
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

export default Reasoning;