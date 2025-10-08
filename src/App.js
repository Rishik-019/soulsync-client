import React, { useState } from "react";

const API_BASE = "https://soulsync-server.onrender.com"; // 🔗 Your Render link here

function App() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [lastAIResponse, setLastAIResponse] = useState("");

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMsg = { sender: "You", text: input };
    setMessages([...messages, userMsg]);

    const res = await fetch(`${API_BASE}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: input }),
    });
    const data = await res.json();

    const aiMsg = { sender: "SoulSync", text: data.reply };
    setMessages((prev) => [...prev, aiMsg]);
    setLastAIResponse(data.reply);
    setInput("");
  };

  const handleTalk = async () => {
    if (!lastAIResponse) return;
    try {
      const res = await fetch(`${API_BASE}/speak`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: lastAIResponse }),
      });
      if (!res.ok) throw new Error("Audio fetch failed");

      const blob = await res.blob();
      const audio = new Audio(URL.createObjectURL(blob));
      audio.play();
    } catch (err) {
      console.error("Error in speaking:", err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-gray-900 text-white flex flex-col items-center p-6">
      <h1 className="text-4xl font-bold mb-6">SoulSync - Your AI Therapist</h1>
      <div className="w-full max-w-xl bg-gray-800 p-4 rounded-2xl shadow-lg">
        <div className="h-96 overflow-y-auto space-y-3 mb-4">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`p-3 rounded-lg ${
                msg.sender === "You"
                  ? "bg-blue-600 text-right"
                  : "bg-gray-700 text-left"
              }`}
            >
              <strong>{msg.sender}: </strong>
              {msg.text}
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Type your thoughts..."
            className="flex-1 p-3 rounded-xl text-black"
          />
          <button
            onClick={sendMessage}
            className="bg-blue-600 px-5 py-2 rounded-xl font-semibold"
          >
            Send
          </button>
          <button
            onClick={handleTalk}
            className="bg-pink-600 px-5 py-2 rounded-xl font-semibold"
          >
            🎙️ Talk
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
