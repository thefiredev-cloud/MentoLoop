// Minimal GPT-5 hooks for chat and documentation
import { useCallback, useRef, useState } from "react";

type ChatMessage = { role: "user" | "assistant" | "system"; content: string; timestamp?: number };

export function useGPT5Chat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [streamingContent, setStreamingContent] = useState("");
  const abortRef = useRef<AbortController | null>(null);

  const sendMessage = useCallback(
    async (content: string, opts: { stream?: boolean; temperature?: number; maxTokens?: number } = {}) => {
      setIsLoading(true);
      setError(null);
      const userMsg: ChatMessage = { role: "user", content, timestamp: Date.now() };
      setMessages((prev) => [...prev, userMsg]);

      try {
        if (opts.stream) {
          abortRef.current = new AbortController();
          const res = await fetch("/api/gpt5", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ messages: [...messages, userMsg], stream: true, temperature: opts.temperature, maxTokens: opts.maxTokens }),
            signal: abortRef.current.signal,
          });
          if (!res.ok || !res.body) throw new Error("Stream failed");
          const reader = res.body.getReader();
          const decoder = new TextDecoder();
          let full = "";
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            const chunk = decoder.decode(value);
            const lines = chunk.split("\n");
            for (const line of lines) {
              if (!line.startsWith("data: ")) continue;
              const data = line.slice(6);
              if (data === "[DONE]") {
                setMessages((prev) => [...prev, { role: "assistant", content: full, timestamp: Date.now() }]);
                setStreamingContent("");
              } else {
                try {
                  const parsed = JSON.parse(data);
                  full += parsed.text || "";
                  setStreamingContent(full);
                } catch {}
              }
            }
          }
          return full;
        } else {
          const res = await fetch("/api/gpt5", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ messages: [...messages, userMsg], stream: false, temperature: opts.temperature, maxTokens: opts.maxTokens }),
          });
          if (!res.ok) throw new Error("Request failed");
          const data = await res.json();
          const assistantMsg: ChatMessage = { role: "assistant", content: data.content, timestamp: Date.now() };
          setMessages((prev) => [...prev, assistantMsg]);
          return data.content as string;
        }
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Unknown error";
        setError(msg);
        throw e;
      } finally {
        setIsLoading(false);
      }
    },
    [messages]
  );

  const stopStreaming = useCallback(() => {
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }
    setIsLoading(false);
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setStreamingContent("");
    setError(null);
  }, []);

  return { messages, isLoading, error, streamingContent, sendMessage, stopStreaming, clearMessages };
}

export function useClinicalDocumentation() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [documentation, setDocumentation] = useState<string | null>(null);

  const generateDocumentation = useCallback(async (sessionNotes: string, objectives: string[], performance: unknown) => {
    setIsGenerating(true);
    try {
      const res = await fetch("/api/gpt5/documentation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionNotes, objectives, performance }),
      });
      if (!res.ok) throw new Error("Documentation generation failed");
      const data = await res.json();
      setDocumentation(data.documentation);
      return data.documentation as string;
    } finally {
      setIsGenerating(false);
    }
  }, []);

  return { isGenerating, documentation, generateDocumentation };
}

