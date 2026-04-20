// frontend/src/components/Chatbot.js
import React, { useEffect, useRef, useState } from "react";
import axios from "axios";

/**
 * Very small markdown-to-html helper for basic formatting:
 * - `**bold**`, `*italic*`, code blocks ``` and inline `code`, links [text](url), line breaks
 * This is deliberately minimal — if you want full markdown, install 'marked' or 'react-markdown'.
 */
function renderMarkdownToHtml(md) {
  if (!md) return "";
  let s = md
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  // code blocks
  s = s.replace(/```([\s\S]*?)```/g, (_, code) => `<pre><code>${code}</code></pre>`);

  // inline code
  s = s.replace(/`([^`]+)`/g, (_, code) => `<code>${code}</code>`);

  // bold
  s = s.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");

  // italics
  s = s.replace(/\*([^*]+)\*/g, "<em>$1</em>");

  // links
  s = s.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noreferrer">$1</a>');

  // line breaks
  s = s.replace(/\n/g, "<br/>");

  return s;
}

export default function Chatbot() {
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hi 👋 I’m your habit coach. How can I help you today?" }
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = input;
    setInput("");

    setMessages(prev => [...prev, { role: "user", content: String(userMessage) }]);

    // show typing IMMEDIATELY
    setTyping(true);

    try {
      const res = await axios.post(
        "http://localhost:5000/chatbot",
        { message: userMessage, history: messages },
        { timeout: 20000 }
      );

      let reply = "I’m here 🙂";
      if (res?.data?.reply) {
        // ensure reply is a string
        if (typeof res.data.reply === "string") reply = res.data.reply;
        else reply = JSON.stringify(res.data.reply);
      }

      setMessages(prev => [...prev, { role: "assistant", content: reply }]);
    } catch (err) {
      console.error("Chatbot request failed:", err);
      setMessages(prev => [
        ...prev,
        { role: "assistant", content: "⚠️ I’m responding slower than usual. Please try again." }
      ]);
    } finally {
      setTyping(false);
    }
  };

  const onKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="chatgpt-shell">
      <div className="chatgpt-messages">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`chatgpt-row ${m.role === "user" ? "user" : "assistant"}`}
          >
            <div
              className="chatgpt-bubble"
              dangerouslySetInnerHTML={{
                __html: m.role === "assistant" ? renderMarkdownToHtml(String(m.content)) : String(m.content)
              }}
            />
          </div>
        ))}

        {typing && (
          <div className="chatgpt-row assistant">
            <div className="chatgpt-bubble typing">
              <span></span><span></span><span></span>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      <div className="chatgpt-input">
        <textarea
          rows={1}
          placeholder="Message Habit Coach…"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={onKey}
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
}
