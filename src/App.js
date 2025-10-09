import React, { useState } from "react";

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { role: "user", content: input };
    setMessages([...messages, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("https://soulsync-server.onrender.com/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [...messages, userMessage],
        }),
      });

      const data = await response.json();

      if (data.reply) {
        setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
      } else {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: "⚠️ No reply from server." },
        ]);
      }
    } catch (error) {
      console.error(error);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "❌ Error connecting to server." },
      ]);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-gray-900 flex flex-col items-center justify-center text-white p-4">
      <h1 className="text-4xl font-bold mb-6">SoulSync — Your AI Therapist</h1>

      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 w-full max-w-lg h-[60vh] overflow-y-auto">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`my-2 p-3 rounded-lg ${
              msg.role === "user" ? "bg-indigo-600 text-right" : "bg-gray-700 text-left"
            }`}
          >
            {msg.content}
          </div>
        ))}
        {loading && <div className="text-gray-400 text-center mt-2">SoulSync is typing...</div>}
      </div>

      <div className="flex mt-4 w-full max-w-lg">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          className="flex-1 p-3 rounded-l-lg bg-gray-800 text-white focus:outline-none"
        />
        <button
          onClick={handleSend}
          className="bg-indigo-600 hover:bg-indigo-700 px-6 py-3 rounded-r-lg font-semibold"
        >
          Send
        </button>
      </div>
    </div>
  );
}

export default App;
