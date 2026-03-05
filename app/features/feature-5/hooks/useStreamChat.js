import { useState, useEffect, useRef, useCallback } from "react";

function generateClientId() {
  const stored = localStorage.getItem("livechat_clientId");
  if (stored) return stored;
  const id = crypto.randomUUID();
  localStorage.setItem("livechat_clientId", id);
  return id;
}

function generateNickname() {
  const stored = localStorage.getItem("livechat_nickname");
  if (stored) return stored;
  const name = `Viewer_${Math.floor(1000 + Math.random() * 9000)}`;
  localStorage.setItem("livechat_nickname", name);
  return name;
}

export function useStreamChat(sessionId, { isHost = false } = {}) {
  const [messages, setMessages] = useState([]);
  const [viewerCount, setViewerCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const [nickname, setNickname] = useState(() => generateNickname());
  const wsRef = useRef(null);
  const reconnectTimer = useRef(null);
  const reconnectDelay = useRef(1000);
  const clientId = useRef(generateClientId());
  const nicknameRef = useRef(nickname);
  nicknameRef.current = nickname;

  const connect = useCallback(() => {
    // Close any existing socket (including CONNECTING state) to prevent orphans
    if (wsRef.current) {
      if (wsRef.current.readyState === WebSocket.OPEN) return;
      if (wsRef.current.readyState === WebSocket.CONNECTING) {
        wsRef.current.close();
      }
    }

    const protocol = window.location.protocol === "https:" ? "wss" : "ws";
    const ws = new WebSocket(
      `${protocol}://${window.location.host}/ws/chat/${sessionId}`,
    );
    wsRef.current = ws;

    ws.onopen = () => {
      setIsConnected(true);
      reconnectDelay.current = 1000;
      ws.send(
        JSON.stringify({
          type: "join",
          nickname: nicknameRef.current,
          clientId: clientId.current,
        }),
      );
    };

    ws.onmessage = (event) => {
      let data;
      try {
        data = JSON.parse(event.data);
      } catch {
        return;
      }

      if (data.type === "history") {
        setMessages(
          data.messages.map((m) => ({
            id: m.id,
            nickname: m.nickname,
            clientId: m.clientId,
            text: m.message,
            createdAt: m.createdAt,
          })),
        );
      }

      if (data.type === "message") {
        setMessages((prev) => [
          ...prev,
          {
            id: data.id,
            nickname: data.nickname,
            clientId: data.clientId,
            text: data.text,
            createdAt: data.createdAt,
          },
        ]);
      }

      if (data.type === "user_joined" || data.type === "user_left") {
        setViewerCount(data.viewerCount);
      }

      if (data.type === "viewer_count") {
        setViewerCount(data.count);
      }
    };

    ws.onclose = () => {
      setIsConnected(false);
      // Only reconnect if this is still the active socket
      if (wsRef.current === ws) {
        reconnectTimer.current = setTimeout(() => {
          reconnectDelay.current = Math.min(reconnectDelay.current * 2, 10000);
          connect();
        }, reconnectDelay.current);
      }
    };

    ws.onerror = () => {
      ws.close();
    };
  }, [sessionId]);

  useEffect(() => {
    connect();
    return () => {
      clearTimeout(reconnectTimer.current);
      wsRef.current?.close();
    };
  }, [connect]);

  const sendMessage = useCallback((text) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: "message", text }));
    }
  }, []);

  const updateNickname = useCallback((newNickname) => {
    setNickname(newNickname);
    localStorage.setItem("livechat_nickname", newNickname);
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({ type: "update_nickname", nickname: newNickname }),
      );
    }
  }, []);

  return {
    messages,
    viewerCount,
    isConnected,
    nickname,
    clientId: clientId.current,
    sendMessage,
    updateNickname,
  };
}
