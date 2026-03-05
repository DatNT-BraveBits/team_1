import { useStreamChat } from "../hooks/useStreamChat";
import { useState, useRef, useEffect } from "react";

function ViewerCount({ count }) {
  return (
    <s-stack direction="inline" gap="small" alignItems="center">
      <s-icon type="view" />
      <s-text variant="bodySm" tone="subdued">
        {count}
      </s-text>
    </s-stack>
  );
}

function ChatMessageList({ messages, hostClientId }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  return (
    <s-box blockSize="fill" overflow="auto">
      <s-stack direction="block" gap="small">
        {messages.length === 0 && (
          <s-box padding="large">
            <s-text tone="subdued" alignment="center">
              No messages yet. Say hi!
            </s-text>
          </s-box>
        )}
        {messages.map((m) => {
          const isHost = m.clientId === hostClientId;
          return (
            <s-box key={m.id} padding="small">
              <s-stack direction="inline" gap="small" alignItems="start">
                <s-text variant="bodySm" fontWeight="bold">
                  {m.nickname}
                </s-text>
                {isHost && <s-badge tone="info">Host</s-badge>}
                <s-text variant="bodySm">{m.text}</s-text>
              </s-stack>
            </s-box>
          );
        })}
        <div ref={bottomRef} />
      </s-stack>
    </s-box>
  );
}

function ChatInput({ onSend }) {
  const [input, setInput] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;
    onSend(text);
    setInput("");
  };

  return (
    <form onSubmit={handleSubmit}>
      <s-stack direction="inline" gap="small" alignItems="end">
        <s-box inlineSize="fill">
          <s-text-field
            label="Message"
            labelHidden
            value={input}
            placeholder="Type a message..."
            onChange={(e) => setInput(e.target.value)}
          />
        </s-box>
        <s-button submit variant="primary">
          Send
        </s-button>
      </s-stack>
    </form>
  );
}

export default function ChatPanel({
  sessionId,
  isHost = false,
  hostClientId = null,
}) {
  const {
    messages,
    viewerCount,
    isConnected,
    nickname,
    clientId,
    sendMessage,
    updateNickname,
  } = useStreamChat(sessionId, { isHost });

  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(nickname);

  const handleNameSave = () => {
    const trimmed = nameInput.trim();
    if (trimmed && trimmed !== nickname) {
      updateNickname(trimmed);
    }
    setEditingName(false);
  };

  const resolvedHostClientId = isHost ? clientId : hostClientId;

  return (
    <s-box padding="base" blockSize="fill">
      <s-stack direction="block" gap="small" blockSize="fill">
        {/* Header */}
        <s-stack
          direction="inline"
          gap="small"
          justifyContent="space-between"
          alignItems="center"
        >
          <s-stack direction="inline" gap="small" alignItems="center">
            <s-text fontWeight="bold">Live Chat</s-text>
            {!isConnected && <s-badge tone="warning">Connecting...</s-badge>}
          </s-stack>
          <ViewerCount count={viewerCount} />
        </s-stack>

        {/* Nickname */}
        <s-box>
          {editingName ? (
            <s-stack direction="inline" gap="small" alignItems="end">
              <s-text-field
                label="Nickname"
                labelHidden
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                autoFocus
              />
              <s-button
                variant="primary"
                size="micro"
                onClick={handleNameSave}
              >
                Save
              </s-button>
            </s-stack>
          ) : (
            <s-stack direction="inline" gap="small" alignItems="center">
              <s-text variant="bodySm" tone="subdued">
                Chatting as <b>{nickname}</b>
              </s-text>
              <s-button
                variant="tertiary"
                size="micro"
                onClick={() => {
                  setNameInput(nickname);
                  setEditingName(true);
                }}
              >
                Edit
              </s-button>
            </s-stack>
          )}
        </s-box>

        {/* Messages */}
        <ChatMessageList
          messages={messages}
          hostClientId={resolvedHostClientId}
        />

        {/* Input */}
        <ChatInput onSend={sendMessage} />
      </s-stack>
    </s-box>
  );
}
