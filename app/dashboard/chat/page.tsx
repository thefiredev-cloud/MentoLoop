"use client";
import { useEffect, useRef, useState } from "react";
import { useGPT5Chat } from "@/hooks/use-gpt5";

export default function ChatPage() {
  const { messages, streamingContent, isLoading, error, sendMessage, stopStreaming, clearMessages } = useGPT5Chat();
  const [input, setInput] = useState("");
  const [rateLimited, setRateLimited] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (error && /Rate limit exceeded/i.test(error)) {
      setRateLimited(true);
      const t = setTimeout(() => setRateLimited(false), 4000);
      return () => clearTimeout(t);
    }
  }, [error]);

  const onSend = async () => {
    if (!input.trim()) return;
    try {
      await sendMessage(input.trim(), { stream: true });
      setInput("");
      inputRef.current?.focus();
    } catch {}
  };

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-4">
      <h1 className="text-2xl font-semibold">AI Chat Assistant</h1>
      <div className="border rounded p-4 h-[420px] overflow-auto space-y-2">
        {messages.map((m, i) => (
          <div key={i} data-testid="chat-message" className={m.role === "user" ? "text-right" : "text-left"}>
            <span className="text-xs text-gray-500 mr-2">{m.role}</span>
            <span>{m.content}</span>
          </div>
        ))}
        {streamingContent && (
          <div data-testid="ai-response" className="text-left">
            <span className="text-xs text-gray-500 mr-2">assistant</span>
            <span>{streamingContent}</span>
          </div>
        )}
      </div>
      {isLoading && (
        <div data-testid="typing-indicator" className="text-sm text-gray-600">Assistant is typing…</div>
      )}
      {rateLimited && (
        <div data-testid="rate-limit-warning" className="text-sm text-amber-700">You are sending messages too quickly. Please wait.</div>
      )}
      <div className="flex gap-2">
        <input
          ref={inputRef}
          data-testid="chat-input"
          className="flex-1 border rounded px-3 py-2"
          placeholder="Ask something…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") onSend();
          }}
        />
        <button className="border rounded px-3 py-2" onClick={onSend} disabled={isLoading}>
          Send
        </button>
        <button data-testid="stop-streaming-btn" className="border rounded px-3 py-2" onClick={stopStreaming}>
          Stop
        </button>
        <button className="border rounded px-3 py-2" onClick={clearMessages}>
          Clear
        </button>
      </div>
    </div>
  );
}

