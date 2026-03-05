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
    <div style={{ display: "flex", flexDirection: "column", minHeight: "400px" }}>
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          gap: "8px",
          marginBottom: "12px",
        }}
      >
        {messages.length === 0 && (
          <s-box padding="large-100">
            <s-text tone="subdued" alignment="center">
              Ask me anything about the products!
            </s-text>
          </s-box>
        )}
        {messages.map((m) => (
          <s-box
            key={m.id}
            padding="small-200"
            borderRadius="base"
            background={m.role === "user" ? "info" : "subdued"}
            style={{
              alignSelf: m.role === "user" ? "flex-end" : "flex-start",
              maxWidth: "85%",
            }}
          >
            <s-text variant="bodySm">
              {m.parts?.map((part, i) =>
                part.type === "text" ? <span key={i}>{part.text}</span> : null,
              )}
            </s-text>
          </s-box>
        ))}
        {isLoading && (
          <s-text tone="subdued" variant="bodySm">
            Typing...
          </s-text>
        )}
      </div>
      <form onSubmit={handleSubmit}>
        <s-stack direction="inline" gap="small-200">
          <div style={{ flex: 1 }}>
            <s-text-field
              label=""
              placeholder="Ask about a product..."
              value={input}
              onChange={(e) => setInput(e.currentTarget.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSubmit(e);
              }}
            />
          </div>
          <s-button type="submit" variant="primary" disabled={isLoading}>
            Send
          </s-button>
        </s-stack>
      </form>
    </div>
  );
}
