# Live Chat for Livestream - Design Document

**Date:** 2026-03-05
**Feature:** Feature 5 - Live Shopping
**Author:** Vu + Claude

## Overview

Add real-time live chat to the livestream feature, allowing streamer (merchant) and viewers to communicate during a live session. Chat sits alongside the existing AI shopping assistant (kept separate).

## Requirements

- **Chat type:** Chatroom chung - streamer + viewers chat together
- **Audience:** Customers on storefront (public, anonymous)
- **Auth:** Anonymous - auto-generated nickname ("Viewer_XXXX"), user can change
- **Tech:** WebSocket integrated into existing Node server (Railway deployment)
- **History:** Messages saved to DB, loaded on join (viewer sees previous messages)
- **Features (Phase 1):** Text messages, viewer count (~15s update), streamer "Host" badge
- **Features (Phase 2):** Theme App Extension, floating emoji reactions, storefront viewer page
- **AI chat:** Kept as separate tab/panel alongside live chat
- **Layout:** Chat sidebar right of video (desktop), below video (mobile)
- **Streamer chat location:** Manage session page (`/app/feature-5/$sessionId`)

## Phased Approach

### Phase 1 (Current)
- WebSocket server integrated into app
- Live chat (text messages) between streamer + viewers
- Save messages to DB + load history on join
- Auto-generate nickname + allow change
- Viewer count (update every ~15s)
- Chat panel on manage page (streamer) and viewer page (admin-side for testing)
- Streamer has "Host" badge

### Phase 2 (Later)
- Theme App Extension for storefront customer viewer
- Floating emoji reactions (TikTok-style fly-up animation)
- Reaction emoji buttons: heart, fire, laugh, clap, wow
- Ban/mute user
- Typing indicators

## Database Schema

### New Models

```prisma
model Feature5_ChatMessage {
  id        String   @id @default(cuid())
  sessionId String
  session   Feature5_LiveSession @relation(fields: [sessionId], references: [id])
  nickname  String
  clientId  String
  message   String
  createdAt DateTime @default(now())
}

model Feature5_ChatReaction {
  id        String   @id @default(cuid())
  sessionId String
  session   Feature5_LiveSession @relation(fields: [sessionId], references: [id])
  emoji     String
  clientId  String
  createdAt DateTime @default(now())
}
```

### Modified Models

`Feature5_LiveSession` - add relations:
```prisma
messages  Feature5_ChatMessage[]
reactions Feature5_ChatReaction[]
```

## WebSocket Server

### Setup
- Library: `ws`
- Hook into existing HTTP server with `noServer: true` + handle upgrade event
- Endpoint: `wss://<host>/ws/chat/:sessionId`
- Room management: `Map<sessionId, Set<WebSocket>>`

### Connection Flow
1. Client connects with sessionId in URL
2. Client sends `{ type: "join", nickname, clientId }`
3. Server validates session exists + status !== "ended"
4. Server adds connection to room, broadcasts `user_joined`
5. Server sends `history` message with recent messages from DB
6. On disconnect, broadcast `user_left` + updated viewer count

### Message Protocol

**Client -> Server:**
```json
{ "type": "join", "nickname": "Viewer_3847", "clientId": "uuid" }
{ "type": "message", "text": "Hello!" }
{ "type": "reaction", "emoji": "heart" }
{ "type": "update_nickname", "nickname": "NewName" }
```

**Server -> Client:**
```json
{ "type": "user_joined", "nickname": "Viewer_3847", "viewerCount": 12 }
{ "type": "user_left", "viewerCount": 11 }
{ "type": "message", "id": "cuid", "nickname": "Viewer_3847", "text": "Hello!", "isHost": false, "createdAt": "..." }
{ "type": "reaction", "emoji": "heart", "clientId": "uuid" }
{ "type": "history", "messages": [...] }
{ "type": "viewer_count", "count": 12 }
```

### Reconnection
- Client: exponential backoff (1s -> 2s -> 4s -> max 10s)
- On reconnect, send `join` with same `clientId` -> server doesn't double-count viewer

### Viewer Count
- Count unique `clientId` per room
- Broadcast every ~15 seconds

## File Structure

### New Files
```
app/features/feature-5/
  components/
    ChatPanel.jsx            # Container: header (viewer count) + message list + input
    ChatMessageList.jsx      # Scrollable message list
    ChatInput.jsx            # Text input + send
    FloatingReactions.jsx    # (Phase 2) Emoji buttons + fly-up animations
    ViewerCount.jsx          # Eye icon + count
  utils/
    websocket.server.js      # WS server setup, room management, broadcast
    chat.server.js           # DB operations: save message, load history
```

### Modified Files
```
prisma/schema.prisma                         # Add 2 models + relations
app/routes/app.feature-5.$sessionId.jsx      # Add ChatPanel for streamer
app/routes/app.feature-5.live.$sessionId.jsx # Add ChatPanel for viewer
server entry point                           # Hook ws server into HTTP server
package.json                                 # Add dependency: ws
```

### Untouched
- `LiveChat.jsx` (AI chat) - kept as-is
- All other features
- Streaming pipeline (Mux, ffmpeg, relay)

## UI Components

### ChatPanel
- Header: session title + ViewerCount
- Body: ChatMessageList (scrollable, auto-scroll on new message)
- Footer: ChatInput
- Streamer messages show "Host" badge with distinct color

### Nickname
- Auto-generate: `"Viewer_" + random 4 digits`
- Store in `localStorage` along with `clientId` (UUID)
- Small edit button next to name to change nickname

### Layout
- Desktop: chat sidebar right of video player
- Mobile: chat below video, collapsible
