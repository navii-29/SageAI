import { ImAttachment } from "react-icons/im";
import { MdInsertPhoto } from "react-icons/md";
import { IoSend, IoClose } from "react-icons/io5";
import { FaFilePdf, FaFileWord, FaFileAlt } from "react-icons/fa";
import { useState, useRef, useEffect } from "react";
import { useLocation } from "react-router-dom";
// 


// const user = localStorage.getItem("user")
// console.log(user)
const Chatbar = () => {
  // const [input, setInput] = useState('');
  // const [messages, setMessages] = useState([]);
  // const [isLoading, setIsLoading] = useState(false);
  // const [isStreaming, setIsStreaming] = useState(false);
  // const [attachedFiles, setAttachedFiles] = useState([]); // { file, preview, type }
  // const scrollRef = useRef(null);
  // const imageInputRef = useRef(null);
  const user = localStorage.getItem("user");
  // const docInputRef = useRef(null);
  const location = useLocation();
  const key = `${location.pathname}_${user}`;
  console.log(key)

  // useEffect(() => {
  //   if (scrollRef.current) {
  //     scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  //   }
  // }, [messages]);



  const [input, setInput] = useState("");
  const [messages, setMessages] = useState(() => {
    const saved1 = sessionStorage.getItem(key);
    return saved1 ? JSON.parse(saved1) : [];
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState([]);

  const scrollRef = useRef(null);
  const imageInputRef = useRef(null);
  const docInputRef = useRef(null);

  useEffect(() => {
    sessionStorage.setItem(key, JSON.stringify(messages));
  }, [messages, key]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // ── File Helpers ──────────────────────────────────────────────
  const getFileIcon = (file) => {
    if (file.type.startsWith("image/")) return null; // show preview
    if (file.type === "application/pdf") return <FaFilePdf className="text-red-500 text-2xl" />;
    if (file.type.includes("word") || file.name.endsWith(".docx") || file.name.endsWith(".doc"))
      return <FaFileWord className="text-blue-600 text-2xl" />;
    return <FaFileAlt className="text-gray-500 text-2xl" />;
  };

  const handleImageAttach = (e) => {
    const files = Array.from(e.target.files);
    const previews = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      type: "image",
    }));
    setAttachedFiles((prev) => [...prev, ...previews]);
    e.target.value = "";
  };

  const handleDocAttach = (e) => {
    const files = Array.from(e.target.files);
    const docs = files.map((file) => ({
      file,
      preview: null,
      type: "doc",
    }));
    setAttachedFiles((prev) => [...prev, ...docs]);
    e.target.value = "";
  };

  const removeAttachment = (index) => {
    setAttachedFiles((prev) => {
      const updated = [...prev];
      if (updated[index].preview) URL.revokeObjectURL(updated[index].preview);
      updated.splice(index, 1);
      return updated;
    });
  };

  // ── Convert file to base64 ────────────────────────────────────
  const toBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result.split(",")[1]);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
    

  // ── Main Query Handler ────────────────────────────────────────
  const queryHandle = async () => {
    if ((!input.trim() && attachedFiles.length === 0) || isLoading) return;

    // Build user message with text + file previews
    const userMsg = {
      role: "user",
      text: input,
      files: attachedFiles.map((a) => ({
        name: a.file.name,
        preview: a.preview,
        type: a.type,
        fileType: a.file.type,
      })),
    };

    setMessages((prev) => [...prev, userMsg]);
    const currentInput = input;
    const currentFiles = [...attachedFiles];
    setInput("");
    setAttachedFiles([]);
    setIsLoading(true);

    // Add empty bot message placeholder
    setMessages((prev) => [...prev, { role: "bot", text: "" }]);

    try {
      // Encode files for backend
      const encodedFiles = await Promise.all(
        currentFiles.map(async (a) => ({
          name: a.file.name,
          type: a.file.type,
          data: await toBase64(a.file),
        }))
      );

      const response = await fetch("http://127.0.0.1:5011/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: currentInput,
          Username : user,
          files: encodedFiles, // send to backend if supported
        }),
      });

      if (!response.ok) throw new Error(`HTTP error: ${response.status}`);

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      setIsLoading(false);
      setIsStreaming(true);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });

        setMessages((prev) => {
          const updated = [...prev];
          const last = updated[updated.length - 1];
          if (last.role === "bot") {
            updated[updated.length - 1] = { ...last, text: last.text + chunk };
          }
          return updated;
        });
      }
    } catch (error) {
      console.error("Error:", error);
      setMessages((prev) => {
        const updated = [...prev];
        const last = updated[updated.length - 1];
        // Replace empty placeholder or add new error msg
        if (last.role === "bot" && last.text === "") {
          updated[updated.length - 1] = { role: "bot", text: "Error: Could not connect." };
        } else {
          updated.push({ role: "bot", text: "Error: Could not connect." });
        }
        return updated;
      });
    } finally {
      setIsLoading(false);
      setIsStreaming(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      queryHandle();
    }
  };

  const canSend = (input.trim() || attachedFiles.length > 0) && !isLoading && !isStreaming;

  return (
    <div className="w-full h-screen flex flex-col bg-linear-to-br from-amber-50 to-blue-100">

      {/* Header */}
      <div className="p-8 flex justify-center">
        <h1 className="text-3xl font-bold text-gray-700 text-center">
          Hey There! <br /> What's on your mind today?
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
                    : "bg-white text-gray-800 rounded-tl-none border border-gray-100"
                }`}
              >
                {/* Attached file previews inside user bubble */}
                {msg.files && msg.files.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-2">
                    {msg.files.map((f, fi) => (
                      <div key={fi} className="rounded-lg overflow-hidden bg-white/20">
                        {f.type === "image" ? (
                          <img
                            src={f.preview}
                            alt={f.name}
                            className="max-h-40 max-w-xs rounded-lg object-cover"
                          />
                        ) : (
                          <div className="flex items-center gap-2 px-3 py-2 bg-white/30 rounded-lg">
                            {f.fileType === "application/pdf" ? (
                              <FaFilePdf className="text-red-300 text-lg" />
                            ) : (
                              <FaFileWord className="text-blue-200 text-lg" />
                            )}
                            <span className="text-xs text-white truncate max-w-35">
                              {f.name}
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Message text */}
                {msg.text && <p className="whitespace-pre-wrap ">{msg.text}</p>}

                {/* Streaming cursor */}
                {msg.role === "bot" && isStreaming && index === messages.length - 1 && (
                  <span className="inline-block w-1.5 h-4 bg-gray-400 ml-0.5 animate-pulse rounded-sm align-middle" />
                )}
              </div>
            </div>
          ))}

          {/* Typing indicator — only before first chunk arrives */}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white border border-gray-100 text-gray-400 px-4 py-3 rounded-2xl rounded-tl-none text-sm shadow-sm">
                <span className="animate-pulse">Typing...</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Attachment Previews above input bar */}
      {attachedFiles.length > 0 && (
        <div className="max-w-3xl mx-auto w-full px-4">
          <div className="flex flex-wrap gap-2 bg-white/70 rounded-2xl px-3 py-2 shadow-sm border border-gray-100">
            {attachedFiles.map((a, i) => (
              <div key={i} className="relative group">
                {a.type === "image" ? (
                  <img
                    src={a.preview}
                    alt={a.file.name}
                    className="h-16 w-16 object-cover rounded-xl border border-gray-200"
                  />
                ) : (
                  <div className="h-16 w-28 flex flex-col items-center justify-center gap-1 bg-gray-50 rounded-xl border border-gray-200 px-2">
                    {getFileIcon(a.file)}
                    <span className="text-[10px] text-gray-500 truncate w-full text-center">
                      {a.file.name}
                    </span>
                  </div>
                )}
                <button
                  onClick={() => removeAttachment(i)}
                  className="absolute -top-1.5 -right-1.5 bg-gray-700 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <IoClose size={12} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Hidden file inputs */}
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleImageAttach}
      />
      <input
        ref={docInputRef}
        type="file"
        accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        multiple
        className="hidden"
        onChange={handleDocAttach}
      />

      {/* Input Bar */}
      <div className="w-full px-4 pb-6 pt-2">
        <div className="max-w-3xl mx-auto flex items-center bg-white rounded-full shadow-md px-4 py-2 gap-3">
          <input
            className="flex-1 outline-none text-gray-700 placeholder-gray-400 px-2"
            type="text"
            placeholder="Enter your query here..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading || isStreaming}
          />

          <div className="flex items-center gap-3 text-gray-500 text-lg border-l pl-3">
            <button
              onClick={() => docInputRef.current?.click()}
              className="hover:text-blue-500 transition-colors"
              title="Attach PDF or Word doc"
            >
              <ImAttachment />
            </button>
            <button
              onClick={() => imageInputRef.current?.click()}
              className="hover:text-green-500 transition-colors"
              title="Attach image"
            >
              <MdInsertPhoto />
            </button>
          </div>

          <button
            onClick={queryHandle}
            disabled={!canSend}
            className={`p-2 rounded-full transition-all ${
              !canSend
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

export default Chatbar;