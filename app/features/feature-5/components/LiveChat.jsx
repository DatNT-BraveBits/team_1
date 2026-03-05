import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useState } from "react";

export default function LiveChat({ sessionId }) {
  const [input, setInput] = useState("");

  const { messages, sendMessage, isLoading } = useChat({
    transport: new DefaultChatTransport({
      api: `/app/feature-5/chat/${sessionId}`,
    }),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    sendMessage({ parts: [{ type: "text", text: input }] });
    setInput("");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "12px",
          display: "flex",
          flexDirection: "column",
          gap: "8px",
        }}
      >
        {messages.length === 0 && (
          <p style={{ color: "#666", textAlign: "center" }}>
            Ask me anything about the products!
          </p>
        )}
        {messages.map((m) => (
          <div
            key={m.id}
            style={{
              padding: "8px 12px",
              borderRadius: "8px",
              background: m.role === "user" ? "#e3f2fd" : "#f5f5f5",
              alignSelf: m.role === "user" ? "flex-end" : "flex-start",
              maxWidth: "80%",
            }}
          >
            {m.parts?.map((part, i) =>
              part.type === "text" ? <span key={i}>{part.text}</span> : null,
            )}
          </div>
        ))}
        {isLoading && (
          <div style={{ color: "#999", fontStyle: "italic" }}>Typing...</div>
        )}
      </div>
      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", gap: "8px", padding: "12px" }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about a product..."
          style={{
            flex: 1,
            padding: "8px 12px",
            borderRadius: "8px",
            border: "1px solid #ccc",
            fontSize: "14px",
          }}
        />
        <s-button submit variant="primary">
          Send
        </s-button>
      </form>
    </div>
  );
}
