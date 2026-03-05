# Live Chat Phase 1 - Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add real-time live chat (WebSocket) to the livestream feature so streamer and viewers can text chat during a live session.

**Architecture:** WebSocket server (`ws` library) integrated into the existing Node/Express server. Custom server entry replaces `react-router-serve` to hook WS upgrade events. Chat messages persisted to SQLite via Prisma. Client uses a React hook wrapping native WebSocket with auto-reconnect.

**Tech Stack:** `ws` (WebSocket server), Prisma (SQLite), React (Polaris web components), Vite plugin (dev WS support)

---

### Task 1: Add Prisma models for chat

**Files:**
- Modify: `prisma/schema.prisma:61-74`

**Step 1: Add models to schema**

Add after `Feature5_LiveSession` model (after line 74):

```prisma
model Feature5_ChatMessage {
  id        String               @id @default(cuid())
  sessionId String
  session   Feature5_LiveSession @relation(fields: [sessionId], references: [id], onDelete: Cascade)
  nickname  String
  clientId  String
  message   String
  createdAt DateTime             @default(now())
}
```

Add relation to `Feature5_LiveSession` (inside the model block):

```prisma
  messages  Feature5_ChatMessage[]
```

**Step 2: Run migration**

```bash
npx prisma migrate dev --name add-chat-messages
```

Expected: Migration created and applied, `prisma generate` runs automatically.

**Step 3: Verify**

```bash
npx prisma studio
```

Check `Feature5_ChatMessage` table exists. Close studio.

**Step 4: Commit**

```bash
git add prisma/
git commit -m "feat(feature-5): add ChatMessage model for live chat"
```

---

### Task 2: Install `ws` dependency

**Files:**
- Modify: `package.json`

**Step 1: Install**

```bash
npm install ws
```

**Step 2: Commit**

```bash
git add package.json package-lock.json
git commit -m "feat(feature-5): add ws dependency for WebSocket chat"
```

---

### Task 3: Create chat DB operations

**Files:**
- Create: `app/features/feature-5/utils/chat.server.js`

**Step 1: Create the file**

```js
import prisma from "../../../db.server";

export async function saveMessage({ sessionId, nickname, clientId, message }) {
  return prisma.feature5_ChatMessage.create({
    data: { sessionId, nickname, clientId, message },
  });
}

export async function getRecentMessages(sessionId, limit = 50) {
  return prisma.feature5_ChatMessage.findMany({
    where: { sessionId },
    orderBy: { createdAt: "asc" },
    take: limit,
    select: {
      id: true,
      nickname: true,
      clientId: true,
      message: true,
      createdAt: true,
    },
  });
}
```

**Step 2: Commit**

```bash
git add app/features/feature-5/utils/chat.server.js
git commit -m "feat(feature-5): add chat DB operations"
```

---

### Task 4: Create WebSocket server module

**Files:**
- Create: `app/features/feature-5/utils/websocket.server.js`

This is the core module. It manages rooms, broadcasts messages, and handles the WebSocket lifecycle.

**Step 1: Create the file**

```js
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
```

**Step 2: Commit**

```bash
git add app/features/feature-5/utils/websocket.server.js
git commit -m "feat(feature-5): add WebSocket server with room management"
```

---

### Task 5: Create custom server entry for production

**Files:**
- Create: `server.js` (project root)
- Modify: `package.json` (change `start` script)

The default `react-router-serve` doesn't support WebSocket upgrade. We create a custom Express server that replicates what `react-router-serve` does, plus handles WS upgrades.

**Step 1: Create `server.js`**

```js
import { createRequestHandler } from "@react-router/express";
import compression from "compression";
import express from "express";
import morgan from "morgan";
import { handleUpgrade } from "./app/features/feature-5/utils/websocket.server.js";

const port = Number(process.env.PORT || 3000);
const buildPath = "./build/server/index.js";

const app = express();
app.disable("x-powered-by");
app.use(compression());

app.use(
  "/assets",
  express.static("build/client/assets", { immutable: true, maxAge: "1y" })
);
app.use(express.static("build/client", { maxAge: "1h" }));
app.use(express.static("public", { maxAge: "1h" }));
app.use(morgan("tiny"));

const build = await import(buildPath);
app.all("*", createRequestHandler({ build, mode: process.env.NODE_ENV }));

const server = app.listen(port, () => {
  console.log(`[server] http://localhost:${port}`);
});

// WebSocket upgrade handling
server.on("upgrade", (request, socket, head) => {
  handleUpgrade(request, socket, head);
});
```

**Step 2: Update `package.json` start script**

Change:
```json
"start": "react-router-serve ./build/server/index.js",
```
To:
```json
"start": "node server.js",
```

**Step 3: Test build + start**

```bash
npm run build && npm run start
```

Expected: Server starts, no errors. Ctrl+C to stop.

**Step 4: Commit**

```bash
git add server.js package.json
git commit -m "feat(feature-5): custom server entry with WebSocket upgrade support"
```

---

### Task 6: Add WebSocket support for Vite dev server

**Files:**
- Modify: `vite.config.js`

During `shopify app dev`, Vite runs the dev server. We add a plugin that hooks into Vite's HTTP server for WS upgrades.

**Step 1: Add Vite plugin**

Add this plugin to the `plugins` array in `vite.config.js`:

```js
function webSocketPlugin() {
  return {
    name: "live-chat-websocket",
    configureServer(server) {
      // Dynamic import to avoid loading server code in client builds
      import("./app/features/feature-5/utils/websocket.server.js").then(
        ({ handleUpgrade }) => {
          server.httpServer.on("upgrade", (request, socket, head) => {
            // Don't intercept Vite HMR WebSocket
            if (request.headers["sec-websocket-protocol"] === "vite-hmr") return;
            const url = new URL(request.url, `http://${request.headers.host}`);
            if (url.pathname.startsWith("/ws/chat/")) {
              handleUpgrade(request, socket, head);
            }
          });
        }
      );
    },
  };
}
```

Update plugins:
```js
plugins: [reactRouter(), tsconfigPaths(), webSocketPlugin()],
```

**Step 2: Test dev server**

```bash
npm run dev
```

Expected: Vite dev server starts normally, HMR still works.

**Step 3: Commit**

```bash
git add vite.config.js
git commit -m "feat(feature-5): add WebSocket plugin to Vite dev server"
```

---

### Task 7: Create useChat React hook

**Files:**
- Create: `app/features/feature-5/hooks/useStreamChat.js`

Custom hook wrapping native WebSocket with auto-reconnect.

**Step 1: Create the file**

```js
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

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    const protocol = window.location.protocol === "https:" ? "wss" : "ws";
    const ws = new WebSocket(`${protocol}://${window.location.host}/ws/chat/${sessionId}`);
    wsRef.current = ws;

    ws.onopen = () => {
      setIsConnected(true);
      reconnectDelay.current = 1000;
      ws.send(JSON.stringify({
        type: "join",
        nickname,
        clientId: clientId.current,
      }));
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === "history") {
        setMessages(data.messages.map((m) => ({
          id: m.id,
          nickname: m.nickname,
          clientId: m.clientId,
          text: m.message,
          createdAt: m.createdAt,
        })));
      }

      if (data.type === "message") {
        setMessages((prev) => [...prev, {
          id: data.id,
          nickname: data.nickname,
          clientId: data.clientId,
          text: data.text,
          createdAt: data.createdAt,
        }]);
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
      reconnectTimer.current = setTimeout(() => {
        reconnectDelay.current = Math.min(reconnectDelay.current * 2, 10000);
        connect();
      }, reconnectDelay.current);
    };

    ws.onerror = () => {
      ws.close();
    };
  }, [sessionId, nickname]);

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
      wsRef.current.send(JSON.stringify({ type: "update_nickname", nickname: newNickname }));
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
```

**Step 2: Commit**

```bash
git add app/features/feature-5/hooks/useStreamChat.js
git commit -m "feat(feature-5): add useStreamChat React hook with auto-reconnect"
```

---

### Task 8: Create ChatPanel UI component

**Files:**
- Create: `app/features/feature-5/components/ChatPanel.jsx`

**Step 1: Create the file**

```jsx
import { useStreamChat } from "../hooks/useStreamChat";
import { useState, useRef, useEffect } from "react";

function ViewerCount({ count }) {
  return (
    <s-stack direction="inline" gap="small" alignItems="center">
      <s-icon type="view" />
      <s-text variant="bodySm" tone="subdued">{count}</s-text>
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

export default function ChatPanel({ sessionId, isHost = false, hostClientId = null }) {
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

  // Use own clientId as hostClientId if this is the host
  const resolvedHostClientId = isHost ? clientId : hostClientId;

  return (
    <s-box padding="base" blockSize="fill">
      <s-stack direction="block" gap="small" blockSize="fill">
        {/* Header */}
        <s-stack direction="inline" gap="small" justifyContent="space-between" alignItems="center">
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
              <s-button variant="primary" size="micro" onClick={handleNameSave}>
                Save
              </s-button>
            </s-stack>
          ) : (
            <s-stack direction="inline" gap="small" alignItems="center">
              <s-text variant="bodySm" tone="subdued">
                Chatting as <b>{nickname}</b>
              </s-text>
              <s-button variant="tertiary" size="micro" onClick={() => { setNameInput(nickname); setEditingName(true); }}>
                Edit
              </s-button>
            </s-stack>
          )}
        </s-box>

        {/* Messages */}
        <ChatMessageList messages={messages} hostClientId={resolvedHostClientId} />

        {/* Input */}
        <ChatInput onSend={sendMessage} />
      </s-stack>
    </s-box>
  );
}
```

**Step 2: Commit**

```bash
git add app/features/feature-5/components/ChatPanel.jsx
git commit -m "feat(feature-5): add ChatPanel UI component for live chat"
```

---

### Task 9: Integrate ChatPanel into manage session page (streamer)

**Files:**
- Modify: `app/routes/app.feature-5.$sessionId.jsx`

**Step 1: Add import**

At top of file, add:
```js
import ChatPanel from "../features/feature-5/components/ChatPanel";
```

**Step 2: Add ChatPanel to the aside slot**

After the delete button section (after line 162), before the banner, add a new aside section:

```jsx
{!isEnded && (
  <s-section heading="Live Chat" slot="aside">
    <s-box blockSize="400px">
      <ChatPanel sessionId={session.id} isHost={true} />
    </s-box>
  </s-section>
)}
```

**Step 3: Test manually**

1. Run `npm run dev`
2. Go to a live session manage page
3. Chat panel should appear in the aside area
4. Open browser DevTools → Network → WS tab → should see WebSocket connection to `/ws/chat/<sessionId>`

**Step 4: Commit**

```bash
git add app/routes/app.feature-5.\$sessionId.jsx
git commit -m "feat(feature-5): add live chat panel to streamer manage page"
```

---

### Task 10: Integrate ChatPanel into viewer page

**Files:**
- Modify: `app/routes/app.feature-5.live.$sessionId.jsx`

**Step 1: Add import**

At top of file, add:
```js
import ChatPanel from "../features/feature-5/components/ChatPanel";
```

**Step 2: Add ChatPanel as a second aside section**

The viewer page already has AI chat in the aside slot. Add a second section above it (before line 52):

```jsx
{/* Live Chat sidebar */}
<s-section heading="Live Chat" slot="aside">
  <s-box blockSize="400px">
    <ChatPanel sessionId={session.id} />
  </s-box>
</s-section>
```

This puts Live Chat above AI Shopping Assistant in the aside column.

**Step 3: Test manually**

1. Open manage page in one browser tab (streamer)
2. Open viewer/preview page in another tab
3. Send message from one tab → should appear in both tabs in real-time
4. Viewer count should show 2

**Step 4: Commit**

```bash
git add app/routes/app.feature-5.live.\$sessionId.jsx
git commit -m "feat(feature-5): add live chat panel to viewer page"
```

---

### Task 11: End-to-end test

**No files to create.** Manual testing checklist:

1. **Create a new live session** → go to manage page
2. **Chat panel visible** in aside for streamer
3. **Open preview page** in incognito → chat panel visible
4. **Send message from streamer** → appears on viewer side instantly
5. **Send message from viewer** → appears on streamer side with no "Host" badge
6. **Streamer messages** show "Host" badge on viewer side
7. **Viewer count** shows correct number (2)
8. **Close viewer tab** → viewer count drops to 1
9. **Refresh viewer tab** → reconnects, sees message history
10. **Change nickname** → new messages use updated name
11. **Message too long (>500 chars)** → not sent
12. **Session ended** → chat panel not shown on manage page

**If all pass, final commit:**

```bash
git add -A
git commit -m "feat(feature-5): complete Phase 1 live chat implementation"
```
