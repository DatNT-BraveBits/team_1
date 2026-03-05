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
    <s-box padding="base" blockSize="fill">
      <s-stack direction="block" gap="small" blockSize="fill">
        {/* Messages area */}
        <s-box blockSize="fill" overflow="auto">
          <s-stack direction="block" gap="small">
            {messages.length === 0 && (
              <s-box padding="large">
                <s-text tone="subdued" alignment="center">
                  Ask me anything about the products!
                </s-text>
              </s-box>
            )}
            {messages.map((m) => (
              <s-box
                key={m.id}
                padding="small"
                borderRadius="large"
                background={m.role === "user" ? "fill" : "subdued"}
              >
                {m.parts?.map((part, i) =>
                  part.type === "text" ? (
                    <s-text key={i} variant="bodySm">
                      {part.text}
                    </s-text>
                  ) : null,
                )}
              </s-box>
            ))}
            {isLoading && (
              <s-box padding="small">
                <s-text tone="subdued" variant="bodySm">
                  Typing...
                </s-text>
              </s-box>
            )}
          </s-stack>
        </s-box>

        {/* Input area */}
        <form onSubmit={handleSubmit}>
          <s-stack direction="inline" gap="small" alignItems="end">
            <s-box inlineSize="fill">
              <s-text-field
                label="Message"
                labelHidden
                value={input}
                placeholder="Ask about a product..."
                onChange={(e) => setInput(e.target.value)}
              />
            </s-box>
            <s-button submit variant="primary">
              Send
            </s-button>
          </s-stack>
        </form>
      </s-stack>
    </s-box>
  );
}
