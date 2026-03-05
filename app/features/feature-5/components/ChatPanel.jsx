import { useStreamChat } from "../hooks/useStreamChat";
import { useState, useRef, useEffect } from "react";

function ChatMessageList({ messages, hostClientId, myClientId }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  if (messages.length === 0) {
    return (
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "#8c9196" }}>
        <p style={{ margin: 0, fontSize: "13px" }}>No messages yet. Say hi!</p>
      </div>
    );
  }

  return (
    <div style={{ flex: 1, overflowY: "auto", padding: "12px 16px", display: "flex", flexDirection: "column", gap: "2px" }}>
      {messages.map((m) => {
        const isHost = m.clientId === hostClientId;
        const isMe = m.clientId === myClientId;
        return (
          <div key={m.id} style={{ padding: "4px 0", lineHeight: "1.45" }}>
            <span style={{
              fontWeight: 700,
              fontSize: "13px",
              color: isHost ? "#2563eb" : isMe ? "#059669" : "#1a1a1a",
              marginRight: "6px",
            }}>
              {m.nickname}
            </span>
            {isHost && (
              <span style={{
                background: "#dbeafe",
                color: "#1d4ed8",
                fontSize: "10px",
                fontWeight: 700,
                padding: "1px 5px",
                borderRadius: "3px",
                marginRight: "6px",
                verticalAlign: "middle",
              }}>
                HOST
              </span>
            )}
            <span style={{ fontSize: "13px", color: "#303030" }}>{m.text}</span>
          </div>
        );
      })}
      <div ref={bottomRef} />
    </div>
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

  const inputRef = useRef(null);
  const [editingName, setEditingName] = useState(false);
  const nicknameInputRef = useRef(null);

  const resolvedHostClientId = isHost ? clientId : hostClientId;

  const handleSend = () => {
    const el = inputRef.current;
    if (!el) return;
    const text = (el.value || "").trim();
    if (!text) return;
    sendMessage(text);
    el.value = "";
  };

  const handleNicknameSave = () => {
    const val = nicknameInputRef.current?.value?.trim();
    if (val && val !== nickname) {
      updateNickname(val);
    }
    setEditingName(false);
  };

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      height: "100%",
      border: "1px solid #e1e3e5",
      borderRadius: "12px",
      background: "#fff",
      overflow: "hidden",
    }}>
      {/* Header */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "12px 16px",
        borderBottom: "1px solid #f1f1f1",
        background: "#fafbfb",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontWeight: 700, fontSize: "14px", color: "#1a1a1a" }}>
            Live Chat
          </span>
          {!isConnected && (
            <span style={{
              fontSize: "11px",
              background: "#ffd79d",
              color: "#6d4400",
              padding: "1px 8px",
              borderRadius: "10px",
              fontWeight: 600,
            }}>
              Connecting...
            </span>
          )}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "4px", color: "#6d7175", fontSize: "13px" }}>
          <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor"><path d="M10 3C5 3 1.73 7.11 1 10c.73 2.89 4 7 9 7s8.27-4.11 9-7c-.73-2.89-4-7-9-7zm0 12a5 5 0 110-10 5 5 0 010 10zm0-8a3 3 0 100 6 3 3 0 000-6z"/></svg>
          <span>{viewerCount}</span>
        </div>
      </div>

      {/* Nickname bar */}
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: "8px",
        padding: "8px 16px",
        borderBottom: "1px solid #f6f6f7",
        fontSize: "12px",
        color: "#6d7175",
      }}>
        {editingName ? (
          <>
            <input
              ref={nicknameInputRef}
              defaultValue={nickname}
              maxLength={30}
              autoFocus
              style={{
                border: "1px solid #c9cccf",
                borderRadius: "6px",
                padding: "4px 8px",
                fontSize: "12px",
                outline: "none",
                width: "120px",
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleNicknameSave();
                if (e.key === "Escape") setEditingName(false);
              }}
            />
            <button onClick={handleNicknameSave} style={{
              background: "#303030",
              color: "#fff",
              border: "none",
              borderRadius: "6px",
              padding: "4px 10px",
              fontSize: "11px",
              fontWeight: 600,
              cursor: "pointer",
            }}>Save</button>
          </>
        ) : (
          <>
            <span>Chatting as <b style={{ color: "#303030" }}>{nickname}</b></span>
            <button onClick={() => setEditingName(true)} style={{
              background: "none",
              border: "none",
              color: "#2c6ecb",
              fontSize: "12px",
              cursor: "pointer",
              padding: 0,
              textDecoration: "underline",
            }}>Edit</button>
          </>
        )}
      </div>

      {/* Messages */}
      <ChatMessageList
        messages={messages}
        hostClientId={resolvedHostClientId}
        myClientId={clientId}
      />

      {/* Input */}
      <div style={{
        display: "flex",
        gap: "8px",
        padding: "12px 16px",
        borderTop: "1px solid #e1e3e5",
        background: "#fafbfb",
      }}>
        <input
          ref={inputRef}
          placeholder="Type a message..."
          maxLength={500}
          autoComplete="off"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleSend();
            }
          }}
          style={{
            flex: 1,
            border: "1px solid #c9cccf",
            borderRadius: "8px",
            padding: "8px 12px",
            fontSize: "13px",
            outline: "none",
            fontFamily: "inherit",
          }}
        />
        <button onClick={handleSend} style={{
          background: "#303030",
          color: "#fff",
          border: "none",
          borderRadius: "8px",
          padding: "8px 16px",
          fontSize: "13px",
          fontWeight: 600,
          cursor: "pointer",
          whiteSpace: "nowrap",
        }}>Send</button>
      </div>
    </div>
  );
}
