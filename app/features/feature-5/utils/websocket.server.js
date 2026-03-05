import { WebSocketServer } from "ws";
import { saveMessage, getRecentMessages } from "./chat.server.js";

// Room state: Map<sessionId, Map<ws, { clientId, nickname }>>
const rooms = new Map();

let wss;

export function getOrCreateWSS() {
  if (!wss) {
    wss = new WebSocketServer({ noServer: true });
    wss.on("connection", handleConnection);
  }
  return wss;
}

export function handleUpgrade(request, socket, head) {
  const url = new URL(request.url, `http://${request.headers.host}`);
  const match = url.pathname.match(/^\/ws\/chat\/(.+)$/);
  if (!match) {
    socket.destroy();
    return;
  }

  const sessionId = match[1];
  const wsServer = getOrCreateWSS();

  wsServer.handleUpgrade(request, socket, head, (ws) => {
    ws._sessionId = sessionId;
    wsServer.emit("connection", ws, request);
  });
}

function handleConnection(ws) {
  const sessionId = ws._sessionId;
  let clientInfo = null;

  ws.on("message", async (raw) => {
    let data;
    try {
      data = JSON.parse(raw.toString());
    } catch {
      return;
    }

    if (data.type === "join") {
      clientInfo = {
        clientId: data.clientId,
        nickname: data.nickname,
      };

      // Add to room
      if (!rooms.has(sessionId)) {
        rooms.set(sessionId, new Map());
      }
      const room = rooms.get(sessionId);

      // Remove existing connection with same clientId (reconnect)
      for (const [existingWs, info] of room) {
        if (info.clientId === data.clientId && existingWs !== ws) {
          room.delete(existingWs);
          break;
        }
      }

      room.set(ws, clientInfo);

      // Send chat history
      const messages = await getRecentMessages(sessionId);
      ws.send(JSON.stringify({ type: "history", messages }));

      // Broadcast join
      broadcast(sessionId, {
        type: "user_joined",
        nickname: data.nickname,
        viewerCount: getViewerCount(sessionId),
      });
    }

    if (data.type === "message" && clientInfo) {
      const text = (data.text || "").trim();
      if (!text || text.length > 500) return;

      const saved = await saveMessage({
        sessionId,
        nickname: clientInfo.nickname,
        clientId: clientInfo.clientId,
        message: text,
      });

      broadcast(sessionId, {
        type: "message",
        id: saved.id,
        nickname: clientInfo.nickname,
        clientId: clientInfo.clientId,
        text,
        createdAt: saved.createdAt.toISOString(),
      });
    }

    if (data.type === "update_nickname" && clientInfo) {
      const newNickname = (data.nickname || "").trim();
      if (!newNickname || newNickname.length > 30) return;
      clientInfo.nickname = newNickname;
    }
  });

  ws.on("close", () => {
    if (!clientInfo) return;
    const room = rooms.get(sessionId);
    if (room) {
      room.delete(ws);
      if (room.size === 0) {
        rooms.delete(sessionId);
      } else {
        broadcast(sessionId, {
          type: "user_left",
          viewerCount: getViewerCount(sessionId),
        });
      }
    }
  });
}

function broadcast(sessionId, data) {
  const room = rooms.get(sessionId);
  if (!room) return;
  const msg = JSON.stringify(data);
  for (const [ws] of room) {
    if (ws.readyState === 1) {
      ws.send(msg);
    }
  }
}

function getViewerCount(sessionId) {
  const room = rooms.get(sessionId);
  if (!room) return 0;
  const uniqueClients = new Set();
  for (const [, info] of room) {
    uniqueClients.add(info.clientId);
  }
  return uniqueClients.size;
}

// Periodic viewer count broadcast
setInterval(() => {
  for (const [sessionId, room] of rooms) {
    if (room.size > 0) {
      broadcast(sessionId, {
        type: "viewer_count",
        count: getViewerCount(sessionId),
      });
    }
  }
}, 15000);
