import React, { useEffect, useRef, useState } from "react";

export default function App() {
  const [messages, setMessages] = useState([
    { sender: "ai", text: "👋 Hi — I'm SoulSync. How are you feeling today?" },
  ]);
  const [input, setInput] = useState("");
  const [listening, setListening] = useState(false);
  const [loading, setLoading] = useState(false);
  const recRef = useRef(null);
  const msgsRef = useRef(null);

  useEffect(() => {
    if (msgsRef.current) msgsRef.current.scrollTop = msgsRef.current.scrollHeight;
  }, [messages, loading]);

  // 🎙 Speech Recognition
  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition not supported in this browser.");
      return;
    }
    const r = new SpeechRecognition();
    recRef.current = r;
    r.lang = "en-US";
    r.interimResults = false;
    r.maxAlternatives = 1;
    r.onstart = () => setListening(true);
    r.onend = () => setListening(false);
    r.onerror = (e) => {
      console.error("Speech recognition error:", e);
      setListening(false);
    };
    r.onresult = (ev) => {
      const transcript = ev.results[0][0].transcript;
      setInput(transcript);
      handleSend(transcript); // auto-send after speech result
    };
    r.start();
  };

  const stopListening = () => {
    if (recRef.current) {
      try { recRef.current.stop(); } catch {}
      recRef.current = null;
      setListening(false);
    }
  };

  // 🔊 Play audio blob or fallback to speechSynthesis
  const playAudioBlobOrFallback = async (blob, fallbackText) => {
    try {
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audio.onended = () => URL.revokeObjectURL(url);
      await audio.play();
    } catch (err) {
      console.warn("Audio play failed, using speechSynthesis fallback:", err);
      if (fallbackText) {
        const u = new SpeechSynthesisUtterance(fallbackText);
        window.speechSynthesis.speak(u);
      }
    }
  };

  // 📨 Send message
  const handleSend = async (overrideText) => {
    const text = overrideText !== undefined ? overrideText : input;
    if (!text.trim()) return;
    setInput("");
    setMessages((prev) => [...prev, { sender: "user", text }]);
    setLoading(true);

    try {
      // Call backend chat
      const resp = await fetch("https://soulsync-server.onrender.com/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });
      const data = await resp.json();
      const reply = data.reply || "Sorry, I couldn't respond.";
      setMessages((prev) => [...prev, { sender: "ai", text: reply }]);

      // Call backend TTS
      try {
        const ttsResp = await fetch("https://soulsync-server.onrender.com/speak", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: reply }),
        });
        if (!ttsResp.ok) throw new Error("TTS fetch failed");
        const blob = await ttsResp.blob();
        if (blob.type.startsWith("audio/")) {
          await playAudioBlobOrFallback(blob, reply);
        } else {
          console.warn("TTS did not return audio, fallback.");
          const u = new SpeechSynthesisUtterance(reply);
          window.speechSynthesis.speak(u);
        }
      } catch (ttsErr) {
        console.error("TTS error:", ttsErr);
        const u = new SpeechSynthesisUtterance(reply);
        window.speechSynthesis.speak(u);
      }
    } catch (err) {
      console.error("Chat error:", err);
      setMessages((prev) => [...prev, { sender: "ai", text: "⚠️ Error connecting to server." }]);
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-black text-white">
      <header className="p-4 text-center font-bold text-2xl shadow-md bg-black/30 backdrop-blur-lg">
        🌸 SoulSync
      </header>

      <main ref={msgsRef} className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.sender === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`px-4 py-2 rounded-2xl max-w-[70%] shadow-md ${
                m.sender === "user" ? "bg-indigo-500 text-white" : "bg-gray-800 text-gray-100"
              }`}
            >
              {m.text}
            </div>
          </div>
        ))}
        {loading && <div className="text-gray-400">SoulSync is typing...</div>}
      </main>

      <footer className="p-3 bg-black/40 backdrop-blur-lg flex items-center space-x-2">
        <input
          className="flex-1 rounded-xl px-4 py-2 text-black focus:outline-none"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
        />
        <button
          onClick={() => handleSend()}
          className="px-4 py-2 bg-indigo-600 rounded-xl hover:bg-indigo-700 transition"
        >
          Send
        </button>
        {!listening ? (
          <button
            onClick={startListening}
            className="px-3 py-2 bg-green-600 rounded-xl hover:bg-green-700 transition"
          >
            🎤 Talk
          </button>
        ) : (
          <button
            onClick={stopListening}
            className="px-3 py-2 bg-red-600 rounded-xl hover:bg-red-700 transition"
          >
            ⏹ Stop
          </button>
        )}
      </footer>
    </div>
  );
}
