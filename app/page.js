"use client";

import { useState, useEffect, useRef } from "react";

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const sourceRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (sourceRef.current) sourceRef.current.close();
    setResponse("");
    setIsLoading(true);

    const requestId = Date.now().toString();
    const source = new EventSource(
      `/api/proxy/stream?prompt=${encodeURIComponent(
        prompt
      )}&user_id=${requestId}`
    );
    sourceRef.current = source;

    source.onmessage = (event) => {
      setResponse((prev) => prev + event.data);
    };

    source.addEventListener("done", () => {
      source.close();
      setIsLoading(false);
    });

    source.onerror = () => {
      console.error("SSE error");
      source.close();
      setIsLoading(false);
    };
  };

  useEffect(() => {
    return () => {
      if (sourceRef.current) sourceRef.current.close();
    };
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h1>Streaming AI Chatbot (Next.js 15)</h1>
      <div style={{ margin: "20px 0", whiteSpace: "pre-wrap" }}>
        {response || "Ask me anything..."}
      </div>
      <form onSubmit={handleSubmit}>
        <input
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Type your message..."
          disabled={isLoading}
          style={{ padding: "8px", width: "300px" }}
        />
        <button
          type="submit"
          disabled={isLoading}
          style={{ padding: "8px 16px", marginLeft: "10px" }}
        >
          {isLoading ? "Streaming..." : "Send"}
        </button>
      </form>
    </div>
  );
}
