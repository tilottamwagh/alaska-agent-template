import React, { useState, useEffect } from "react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:3000";

export default function AlaskaAgent() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  const appendMessage = (sender, text) =>
    setMessages((m) => [...m, { sender, text }]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    appendMessage("You", input);
    const userText = input;
    setInput("");
    try {
      const res = await fetch(`${BACKEND_URL}/api/ultravox`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userText }),
      });
      const data = await res.json();
      appendMessage("Alaska", data.reply);
      speakText(data.reply);
    } catch (err) {
      appendMessage("System", "⚠️ Error contacting agent");
    }
  };

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;
    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.onresult = (ev) => {
      const t = ev.results[0][0].transcript;
      setInput(t);
      sendMessage();
    };
    const btn = document.getElementById("voice-btn");
    if (btn) btn.onclick = () => recognition.start();
  }, []);

  const speakText = (text) => {
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "en-IN";
    speechSynthesis.speak(u);
  };

  return (
    <div style={{ width: 350, height: 500, position: "fixed", bottom: 20, right: 20, background: "white", padding: 10, borderRadius: 8, boxShadow: "0 2px 8px rgba(0,0,0,0.2)" }}>
      <div style={{ height: "80%", overflowY: "auto" }}>
        {messages.map((m, i) => <div key={i}><b>{m.sender}:</b> {m.text}</div>)}
      </div>
      <div style={{ marginTop: 8 }}>
        <input value={input} onChange={e => setInput(e.target.value)} placeholder="Type your message..." style={{ width: "70%" }} />
        <button onClick={sendMessage}>Send</button>
        <button id="voice-btn">🎤</button>
      </div>
    </div>
  );
}
