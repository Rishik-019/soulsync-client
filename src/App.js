import React, { useState } from "react";

const API_BASE = process.env.REACT_APP_API_URL || "https://soulsync-server.onrender.com";

export default function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Handle sending a chat message
  const handleSend = async () => {
    if (!input.trim()) return;
    const userMessage = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input }),
      });

      const data = await response.json();
      const aiMessage = { role: "assistant", content: data.reply || "No response" };
      setMessages((prev) => [...prev, aiMessage]);
      setIsLoading(false);

      // Make SoulSync speak using ElevenLabs
      if (data.reply) {
        await fetch(`${API_BASE}/speak`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: data.reply }),
        });
      }

    } catch (err) {
      console.error("Error sending message:", err);
      setIsLoading(false);
      setMessages((prev) => [...prev, { role: "assistant", content: "Error connecting to server." }]);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-purple-900 via-indigo-900 to-gray-900 text-white px-4">
      <div className="w-full max-w-3xl bg-white/10 backdrop-blur-lg rounded-3xl p-6 shadow-lg border border-white/20">
        <h1 className="text-4xl font-bold text-center mb-6 text-purple-300">
          SoulSync – Your AI Therapist
        </h1>

        <div className="h-96 overflow-y-auto p-4 mb-4 rounded-xl bg-black/30 border border-white/20 scrollbar-thin scrollbar-thumb-purple-500 scrollbar-track-transparent">
          {messages.length === 0 && (
            <p className="text-gray-400 text-center mt-20 italic">
              Talk to SoulSync about how you feel 💬
            </p>
          )}
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`my-2 p-3 rounded-xl max-w-[80%] ${
                msg.role === "user"
                  ? "bg-purple-600 ml-auto text-right"
                  : "bg-gray-700 text-left"
              }`}
            >
              {msg.content}
            </div>
          ))}
          {isLoading && <p className="text-gray-400 italic text-center">SoulSync is thinking...</p>}
        </div>

        <div className="flex gap-3">
          <input
            type="text"
            className="flex-grow p-3 rounded-xl bg-black/50 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="Type your thoughts..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
          />
          <button
            onClick={handleSend}
            disabled={isLoading}
            className="bg-purple-600 hover:bg-purple-700 transition text-white px-5 py-3 rounded-xl font-semibold"
          >
            Send
          </button>
        </div>
      </div>

      <p className="text-sm text-gray-400 mt-6">
        © 2025 SoulSync – AI Therapy with Empathy
      </p>
    </div>
  );
}
