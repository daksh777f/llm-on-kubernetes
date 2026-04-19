"use client";
import { useState, useRef, useEffect } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const SUGGESTED = [
  "Which model are you?",
  "What's the latest information you have?",
  "What is your knowledge cutoff date?",
  "What can you help me with?",
];

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function send(text?: string) {
    const msg = (text ?? input).trim();
    if (!msg || loading) return;

    const updated: Message[] = [...messages, { role: "user", content: msg }];
    setMessages(updated);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: updated }),
      });

      let reply = "No response from model.";
      try {
        const data = await res.json();
        if (res.ok) {
          reply = data?.response || reply;
        } else {
          reply = data?.response || data?.message || `Request failed (${res.status}).`;
        }
      } catch {
        if (!res.ok) {
          reply = `Request failed (${res.status}).`;
        }
      }

      setMessages([...updated, { role: "assistant", content: reply }]);
    } catch {
      setMessages([...updated, { role: "assistant", content: "Could not reach the LLM. Is port-forward running?" }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gray-950 flex flex-col items-center justify-start py-10 px-4">
      <div className="w-full max-w-2xl flex flex-col gap-4">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-purple-400 mb-1">🧠 LLM Chat</h1>
          <p className="text-gray-400 text-sm">TinyLlama  · Running on Kubernetes</p>
        </div>

        <div className="flex flex-wrap gap-2 justify-center">
          {SUGGESTED.map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => send(q)}
              disabled={loading}
              className="text-xs bg-purple-950 hover:bg-purple-800 border border-purple-700 text-purple-200 px-3 py-1 rounded-full transition-all">
              {q}
            </button>
          ))}
        </div>

        <div className="bg-gray-900 rounded-2xl p-4 h-[450px] overflow-y-auto flex flex-col gap-3">
          {messages.length === 0 && (
            <p className="text-gray-600 text-sm text-center mt-32">
              Click a question above or type below ↓
            </p>
          )}
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[80%] text-sm px-4 py-2 rounded-2xl leading-relaxed ${
                m.role === "user"
                  ? "bg-purple-600 text-white"
                  : "bg-gray-700 text-gray-100"
              }`}>
                {m.role === "assistant" && <span className="text-purple-400 font-bold mr-1">AI:</span>}
                {m.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-gray-700 text-gray-300 text-sm px-4 py-2 rounded-2xl animate-pulse">
                Thinking...
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            void send();
          }}
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask anything..."
            className="flex-1 bg-gray-800 text-white text-sm rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-purple-500 placeholder-gray-500"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white px-5 py-3 rounded-xl text-sm font-semibold transition-all">
            Send
          </button>
        </form>
        <p className="text-center text-xs text-gray-600">Make sure port-forward is running on 11434</p>
      </div>
    </main>
  );
}