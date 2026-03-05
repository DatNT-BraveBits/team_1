# Feature 5: Live Shopping + AI Chat

## Overview

Live streaming e-commerce feature for Shopify merchants. Merchants create livestream sessions with selected products, stream via Mux, and viewers watch with an AI-powered chat assistant that answers product questions using real Shopify data.

## Architecture

```
┌─ Merchant Side ─────────────────────┐
│ /app/feature-5 (Dashboard)          │
│  - Create livestream session        │
│  - Select products from store       │
│  - Get stream key (for OBS/phone)   │
│  - Pin/unpin products during stream │
│  - End stream                       │
└─────────────────────────────────────┘
         │
         ▼
┌─ Backend ───────────────────────────┐
│ Mux API: create/manage live streams │
│ Prisma: session + product data      │
│ AI SDK: streamText for chat         │
│ Shopify GraphQL: product queries    │
└─────────────────────────────────────┘
         │
         ▼
┌─ Viewer Side ───────────────────────┐
│ /app/feature-5/live (Viewer page)   │
│  ┌────────────┐ ┌────────────────┐  │
│  │ MuxPlayer  │ │ AI Chat        │  │
│  │ (live)     │ │ - Ask about    │  │
│  │            │ │   products     │  │
│  └────────────┘ │ - Get answers  │  │
│  ┌────────────────┐ from Shopify │  │
│  │ Product Panel  │ data         │  │
│  │ 📌 Pinned item │              │  │
│  │ [Buy Now]      │              │  │
│  └────────────────┘──────────────┘  │
└─────────────────────────────────────┘
```

## Tech Stack

- **Mux**: `@mux/mux-node` (server) + `@mux/mux-player-react` (client)
- **AI SDK**: `streamText` + `useChat` from `ai` / `@ai-sdk/react`
- **Shopify Admin GraphQL**: query products (title, price, variants, inventory, images)
- **Prisma**: `Feature5_LiveSession`, `Feature5_PinnedProduct`

## Data Model (Prisma)

```prisma
model Feature5_LiveSession {
  id             String   @id @default(cuid())
  shop           String
  title          String
  muxStreamId    String?
  muxPlaybackId  String?
  muxStreamKey   String?
  status         String   @default("idle")  // idle | live | ended
  productIds     String   // JSON array of Shopify product GIDs
  pinnedProductId String?
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
}
```

## Pages & Routes

### 1. Dashboard — `app/routes/app.feature-5.jsx`
- List all sessions (with status badges)
- "Create Livestream" button
- For each session: stream key display, product selector, pin controls

### 2. Create Session — `app/routes/app.feature-5.create.jsx`
- Form: title, select products from store (via Shopify GraphQL)
- On submit: call Mux API to create live stream, save to DB

### 3. Manage Session — `app/routes/app.feature-5.$sessionId.jsx`
- Show stream key + RTMP URL for OBS
- Show MuxPlayer preview
- Pin/unpin products
- End stream button

### 4. Viewer Page — `app/routes/app.feature-5.live.$sessionId.jsx`
- MuxPlayer with live stream
- Product panel (pinned product highlighted)
- AI Chat sidebar
- "Buy Now" buttons → Shopify checkout

### 5. AI Chat API — `app/routes/app.feature-5.chat.$sessionId.jsx`
- POST endpoint for streaming chat
- Loads session's product data from Shopify GraphQL
- System prompt: "You are a live shopping assistant. Answer questions about these products: [product data]"
- Uses `streamText` + returns `toDataStreamResponse()`

## AI Chat Design

The AI chat receives the session's product list as context. On each chat request:

1. Load session from DB → get productIds
2. Query Shopify Admin GraphQL for product details (title, description, variants, price, inventory)
3. Build system prompt with product context
4. Stream response via AI SDK

System prompt template:
```
You are a friendly live shopping assistant. You help viewers learn about products being showcased in this livestream.

Available products:
{product data as structured text}

Rules:
- Answer in the same language the viewer uses
- Be concise and enthusiastic
- If asked about a product not in the list, say you can only help with products in this stream
- Include prices and availability when relevant
```

## Shopify GraphQL Query

```graphql
query getProducts($ids: [ID!]!) {
  nodes(ids: $ids) {
    ... on Product {
      id
      title
      description
      images(first: 1) { edges { node { url } } }
      variants(first: 10) {
        edges {
          node {
            id
            title
            price
            inventoryQuantity
            selectedOptions { name value }
          }
        }
      }
    }
  }
}
```

## Mux Integration

```javascript
// Create live stream
const stream = await mux.video.liveStreams.create({
  playback_policy: ['public'],
  new_asset_settings: { playback_policy: ['public'] },
});
// stream.stream_key → for OBS
// stream.playback_ids[0].id → for MuxPlayer

// Client-side
<MuxPlayer
  playbackId={playbackId}
  streamType="live"
  autoPlay
  muted
/>
```

## Scope for 3 Hours

| Task | Time | Priority |
|------|------|----------|
| Prisma model + migration | 10min | Must |
| Mux server util (create/list streams) | 20min | Must |
| Create session page (form + products) | 30min | Must |
| Dashboard (list sessions) | 20min | Must |
| Viewer page (MuxPlayer + products) | 30min | Must |
| AI Chat API endpoint | 30min | Must |
| AI Chat UI component | 20min | Must |
| Pin product feature | 15min | Nice |
| Polish & testing | 25min | Must |
| **Total** | **~3h** | |
