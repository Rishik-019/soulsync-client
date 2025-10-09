import React, { useState } from "react";
import axios from "axios";

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isSpeaking, setIsSpeaking] = useState(false);

  const API_URL = "https://soulsync-server.onrender.com"; // 👈 your backend URL

  const sendMessage = async () => {
    if (!input.trim()) return;
    const newMessages = [...messages, { sender: "You", text: input }];
    setMessages(newMessages);
    setInput("");

    try {
      const res = await axios.post(`${API_URL}/chat`, { message: input });
      const reply = res.data.reply;
      setMessages([...newMessages, { sender: "SoulSync", text: reply }]);
    } catch {
      setMessages([...newMessages, { sender: "SoulSync", text: "Error connecting to server." }]);
    }
  };

  const speak = async (text) => {
    setIsSpeaking(true);
    try {
      const res = await fetch(`${API_URL}/speak`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audio.play();
    } catch {
      console.error("Speech error");
    } finally {
      setIsSpeaking(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-black text-white p-4">
      <h1 className="text-3xl font-bold mb-6">SoulSync - Your AI Therapist</h1>

      <div className="bg-gray-800 p-4 rounded-lg w-full max-w-md h-96 overflow-y-auto shadow-lg mb-4">
        {messages.map((msg, i) => (
          <div key={i} className={`my-2 ${msg.sender === "You" ? "text-right" : "text-left"}`}>
            <strong className={msg.sender === "You" ? "text-blue-400" : "text-pink-400"}>
              {msg.sender}:
            </strong>{" "}
            {msg.text}
          </div>
        ))}
      </div>

      <div className="flex w-full max-w-md space-x-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Talk to SoulSync..."
          className="flex-1 p-2 rounded-lg text-black"
        />
        <button onClick={sendMessage} className="bg-blue-500 px-4 py-2 rounded-lg hover:bg-blue-600">
          Send
        </button>
        <button
          onClick={() => speak(messages[messages.length - 1]?.text || "Hello!")}
          disabled={isSpeaking}
          className="bg-pink-500 px-4 py-2 rounded-lg hover:bg-pink-600"
        >
          {isSpeaking ? "..." : "Talk"}
        </button>
      </div>
    </div>
  );
}

export default App;
