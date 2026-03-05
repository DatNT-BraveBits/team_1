# Feature 5: Live Shopping + AI Chat — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a live shopping feature where merchants stream via Mux, viewers watch with product panels, and an AI chat assistant answers product questions using real Shopify data.

**Architecture:** Mux handles video infrastructure (create stream → get stream key for OBS → playback via MuxPlayer). AI SDK streams chat responses using Shopify product data as context. Prisma stores session state. All code lives in `app/features/feature-5/`.

**Tech Stack:** `@mux/mux-node`, `@mux/mux-player-react`, Vercel AI SDK (`ai`, `@ai-sdk/react`), Prisma, Shopify Admin GraphQL

---

### Task 1: Install Dependencies

**Step 1: Install Mux packages**

Run: `npm install @mux/mux-node @mux/mux-player-react`

**Step 2: Verify installation**

Run: `node -e "require('@mux/mux-node'); console.log('ok')"`
Expected: `ok`

**Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "feat(feature-5): add mux dependencies"
```

---

### Task 2: Prisma Model + Migration

**Files:**
- Modify: `prisma/schema.prisma` (add model under FEATURE 5 section)

**Step 1: Add Prisma model**

In `prisma/schema.prisma`, under the `// FEATURE 5` section, add:

```prisma
model Feature5_LiveSession {
  id              String   @id @default(cuid())
  shop            String
  title           String
  muxStreamId     String?
  muxPlaybackId   String?
  muxStreamKey    String?
  status          String   @default("idle")
  productIds      String   @default("[]")
  pinnedProductId String?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}
```

**Step 2: Run migration**

Run: `npx prisma migrate dev --name feature5_live_session`
Expected: Migration created and applied successfully.

**Step 3: Verify**

Run: `npx prisma studio` (open briefly to confirm table exists, then close)

**Step 4: Commit**

```bash
git add prisma/
git commit -m "feat(feature-5): add Feature5_LiveSession model"
```

---

### Task 3: Mux Server Utility

**Files:**
- Create: `app/features/feature-5/utils/mux.server.js`

**Step 1: Create Mux client and helper functions**

```javascript
import Mux from "@mux/mux-node";

const mux = new Mux({
  tokenId: process.env.MUX_TOKEN_ID,
  tokenSecret: process.env.MUX_TOKEN_SECRET,
});

export async function createLiveStream() {
  const stream = await mux.video.liveStreams.create({
    playback_policy: ["public"],
    new_asset_settings: { playback_policy: ["public"] },
  });
  return {
    streamId: stream.id,
    streamKey: stream.stream_key,
    playbackId: stream.playback_ids?.[0]?.id,
  };
}

export async function getLiveStream(streamId) {
  return mux.video.liveStreams.retrieve(streamId);
}

export async function endLiveStream(streamId) {
  await mux.video.liveStreams.complete(streamId);
}
```

**Step 2: Verify env vars are documented**

Add to `.env.example` or note in CLAUDE.md: `MUX_TOKEN_ID` and `MUX_TOKEN_SECRET`

**Step 3: Commit**

```bash
git add app/features/feature-5/utils/mux.server.js
git commit -m "feat(feature-5): add Mux server utility"
```

---

### Task 4: Shopify Product Query Utility

**Files:**
- Create: `app/features/feature-5/utils/products.server.js`

**Step 1: Create product query helper**

```javascript
const PRODUCTS_QUERY = `#graphql
  query getProducts($ids: [ID!]!) {
    nodes(ids: $ids) {
      ... on Product {
        id
        title
        description
        images(first: 1) {
          edges {
            node {
              url
            }
          }
        }
        variants(first: 10) {
          edges {
            node {
              id
              title
              price
              inventoryQuantity
              selectedOptions {
                name
                value
              }
            }
          }
        }
      }
    }
  }
`;

export async function getProductsByIds(admin, productIds) {
  const response = await admin.graphql(PRODUCTS_QUERY, {
    variables: { ids: productIds },
  });
  const json = await response.json();
  return json.data.nodes.filter(Boolean);
}

export function formatProductsForAI(products) {
  return products
    .map((p) => {
      const variants = p.variants.edges.map((e) => e.node);
      const variantInfo = variants
        .map(
          (v) =>
            `  - ${v.title}: $${v.price} (${v.inventoryQuantity > 0 ? `${v.inventoryQuantity} in stock` : "out of stock"})`,
        )
        .join("\n");
      return `${p.title}\n${p.description || "No description"}\nVariants:\n${variantInfo}`;
    })
    .join("\n\n");
}
```

**Step 2: Commit**

```bash
git add app/features/feature-5/utils/products.server.js
git commit -m "feat(feature-5): add Shopify product query utility"
```

---

### Task 5: Dashboard Route — List Sessions + Create Button

**Files:**
- Modify: `app/routes/app.feature-5.jsx` (becomes layout with Outlet)
- Modify: `app/features/feature-5/index.jsx` (dashboard UI)

**Step 1: Update route to be a layout with Outlet**

Replace `app/routes/app.feature-5.jsx`:

```jsx
import { Outlet, useLoaderData, useRouteError } from "react-router";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }) => {
  await authenticate.admin(request);
  return null;
};

export default function Feature5Layout() {
  return <Outlet />;
}

export function ErrorBoundary() {
  return boundary.error(useRouteError());
}

export const headers = (headersArgs) => boundary.headers(headersArgs);
```

**Step 2: Create index route for dashboard**

Create `app/routes/app.feature-5._index.jsx`:

```jsx
import { useLoaderData, Link } from "react-router";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { authenticate } from "../shopify.server";
import prisma from "../db.server";

export const loader = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  const sessions = await prisma.feature5_LiveSession.findMany({
    where: { shop: session.shop },
    orderBy: { createdAt: "desc" },
  });
  return { sessions };
};

export default function Feature5Dashboard() {
  const { sessions } = useLoaderData();

  return (
    <s-page heading="Live Shopping">
      <Link to="/app/feature-5/create">
        <s-button slot="primary-action" variant="primary">
          Create Livestream
        </s-button>
      </Link>

      {sessions.length === 0 ? (
        <s-section>
          <s-paragraph>
            No livestream sessions yet. Create your first one!
          </s-paragraph>
        </s-section>
      ) : (
        <s-section heading="Your Sessions">
          {sessions.map((s) => (
            <s-card key={s.id}>
              <s-box padding="base">
                <s-stack direction="inline" gap="base" align="center">
                  <s-heading>{s.title}</s-heading>
                  <s-badge
                    tone={
                      s.status === "live"
                        ? "success"
                        : s.status === "ended"
                          ? "default"
                          : "info"
                    }
                  >
                    {s.status}
                  </s-badge>
                  <Link to={`/app/feature-5/${s.id}`}>
                    <s-button variant="tertiary">Manage</s-button>
                  </Link>
                </s-stack>
              </s-box>
            </s-card>
          ))}
        </s-section>
      )}
    </s-page>
  );
}

export const headers = (headersArgs) => boundary.headers(headersArgs);
```

**Step 3: Verify** — Run `npm run dev`, navigate to /app/feature-5, confirm dashboard renders.

**Step 4: Commit**

```bash
git add app/routes/app.feature-5.jsx app/routes/app.feature-5._index.jsx app/features/feature-5/index.jsx
git commit -m "feat(feature-5): add dashboard with session list"
```

---

### Task 6: Create Session Page

**Files:**
- Create: `app/routes/app.feature-5.create.jsx`

**Step 1: Build create session form with product selector**

```jsx
import { useLoaderData, useActionData, Form, redirect } from "react-router";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { authenticate } from "../shopify.server";
import prisma from "../db.server";
import { createLiveStream } from "../features/feature-5/utils/mux.server";

const PRODUCTS_LIST_QUERY = `#graphql
  query listProducts {
    products(first: 20) {
      edges {
        node {
          id
          title
          images(first: 1) {
            edges { node { url } }
          }
        }
      }
    }
  }
`;

export const loader = async ({ request }) => {
  const { admin } = await authenticate.admin(request);
  const response = await admin.graphql(PRODUCTS_LIST_QUERY);
  const json = await response.json();
  const products = json.data.products.edges.map((e) => e.node);
  return { products };
};

export const action = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  const formData = await request.formData();
  const title = formData.get("title");
  const selectedProducts = formData.getAll("products");

  const muxStream = await createLiveStream();

  const liveSession = await prisma.feature5_LiveSession.create({
    data: {
      shop: session.shop,
      title,
      muxStreamId: muxStream.streamId,
      muxPlaybackId: muxStream.playbackId,
      muxStreamKey: muxStream.streamKey,
      productIds: JSON.stringify(selectedProducts),
    },
  });

  return redirect(`/app/feature-5/${liveSession.id}`);
};

export default function CreateSession() {
  const { products } = useLoaderData();

  return (
    <s-page heading="Create Livestream" backAction={{ url: "/app/feature-5" }}>
      <Form method="post">
        <s-section heading="Stream Details">
          <s-stack direction="block" gap="base">
            <s-text-field
              label="Title"
              name="title"
              required
              placeholder="My Live Shopping Event"
            />
          </s-stack>
        </s-section>

        <s-section heading="Select Products">
          <s-stack direction="block" gap="base">
            {products.map((p) => (
              <label
                key={p.id}
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                <input type="checkbox" name="products" value={p.id} />
                {p.title}
              </label>
            ))}
          </s-stack>
        </s-section>

        <s-box padding="base">
          <s-button variant="primary" submit>
            Create Livestream
          </s-button>
        </s-box>
      </Form>
    </s-page>
  );
}

export const headers = (headersArgs) => boundary.headers(headersArgs);
```

**Step 2: Verify** — Navigate to /app/feature-5/create, confirm form renders with store products.

**Step 3: Commit**

```bash
git add app/routes/app.feature-5.create.jsx
git commit -m "feat(feature-5): add create session page with product selector"
```

---

### Task 7: Manage Session Page (Stream Key + Pin Products)

**Files:**
- Create: `app/routes/app.feature-5.$sessionId.jsx`

**Step 1: Build manage session page**

```jsx
import { useLoaderData, useFetcher } from "react-router";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { authenticate } from "../shopify.server";
import prisma from "../db.server";
import { endLiveStream } from "../features/feature-5/utils/mux.server";
import { getProductsByIds } from "../features/feature-5/utils/products.server";

export const loader = async ({ request, params }) => {
  const { admin } = await authenticate.admin(request);
  const session = await prisma.feature5_LiveSession.findUnique({
    where: { id: params.sessionId },
  });
  if (!session) throw new Response("Not found", { status: 404 });

  const productIds = JSON.parse(session.productIds);
  const products = productIds.length > 0 ? await getProductsByIds(admin, productIds) : [];

  return { session, products };
};

export const action = async ({ request, params }) => {
  const { admin } = await authenticate.admin(request);
  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "end") {
    const session = await prisma.feature5_LiveSession.findUnique({
      where: { id: params.sessionId },
    });
    if (session?.muxStreamId) {
      try { await endLiveStream(session.muxStreamId); } catch (e) { /* stream may already be ended */ }
    }
    await prisma.feature5_LiveSession.update({
      where: { id: params.sessionId },
      data: { status: "ended" },
    });
  }

  if (intent === "pin") {
    const productId = formData.get("productId");
    await prisma.feature5_LiveSession.update({
      where: { id: params.sessionId },
      data: { pinnedProductId: productId },
    });
  }

  if (intent === "unpin") {
    await prisma.feature5_LiveSession.update({
      where: { id: params.sessionId },
      data: { pinnedProductId: null },
    });
  }

  return { ok: true };
};

export default function ManageSession() {
  const { session, products } = useLoaderData();
  const fetcher = useFetcher();

  const rtmpUrl = "rtmp://global-live.mux.com:5222/app";

  return (
    <s-page heading={session.title} backAction={{ url: "/app/feature-5" }}>
      <s-section heading="Stream Setup">
        <s-stack direction="block" gap="base">
          <s-text-field label="RTMP URL" value={rtmpUrl} readOnly />
          <s-text-field
            label="Stream Key"
            value={session.muxStreamKey || "N/A"}
            readOnly
          />
          <s-text-field
            label="Viewer Link"
            value={`/app/feature-5/live/${session.id}`}
            readOnly
          />
          <s-badge
            tone={
              session.status === "live"
                ? "success"
                : session.status === "ended"
                  ? "default"
                  : "info"
            }
          >
            Status: {session.status}
          </s-badge>
        </s-stack>
      </s-section>

      <s-section heading="Products">
        <s-stack direction="block" gap="base">
          {products.map((p) => (
            <s-card key={p.id}>
              <s-box padding="base">
                <s-stack direction="inline" gap="base" align="center">
                  <s-text fontWeight="bold">{p.title}</s-text>
                  {session.pinnedProductId === p.id ? (
                    <fetcher.Form method="post">
                      <input type="hidden" name="intent" value="unpin" />
                      <s-button variant="primary" submit>
                        Pinned — Unpin
                      </s-button>
                    </fetcher.Form>
                  ) : (
                    <fetcher.Form method="post">
                      <input type="hidden" name="intent" value="pin" />
                      <input type="hidden" name="productId" value={p.id} />
                      <s-button submit>Pin</s-button>
                    </fetcher.Form>
                  )}
                </s-stack>
              </s-box>
            </s-card>
          ))}
        </s-stack>
      </s-section>

      {session.status !== "ended" && (
        <s-section>
          <fetcher.Form method="post">
            <input type="hidden" name="intent" value="end" />
            <s-button variant="primary" tone="critical" submit>
              End Stream
            </s-button>
          </fetcher.Form>
        </s-section>
      )}
    </s-page>
  );
}

export const headers = (headersArgs) => boundary.headers(headersArgs);
```

**Step 2: Commit**

```bash
git add app/routes/app.feature-5.\$sessionId.jsx
git commit -m "feat(feature-5): add manage session page with pin/end controls"
```

---

### Task 8: AI Chat API Endpoint

**Files:**
- Create: `app/routes/app.feature-5.chat.$sessionId.jsx`

**Step 1: Create streaming chat endpoint**

```jsx
import { streamText } from "ai";
import { authenticate } from "../shopify.server";
import prisma from "../db.server";
import { defaultModel } from "../shared/ai.server";
import {
  getProductsByIds,
  formatProductsForAI,
} from "../features/feature-5/utils/products.server";

export const action = async ({ request, params }) => {
  const { admin } = await authenticate.admin(request);
  const { messages } = await request.json();

  const session = await prisma.feature5_LiveSession.findUnique({
    where: { id: params.sessionId },
  });
  if (!session) throw new Response("Session not found", { status: 404 });

  const productIds = JSON.parse(session.productIds);
  const products =
    productIds.length > 0 ? await getProductsByIds(admin, productIds) : [];
  const productContext = formatProductsForAI(products);

  const result = streamText({
    model: defaultModel,
    system: `You are a friendly live shopping assistant helping viewers during a livestream called "${session.title}".

Available products in this stream:
${productContext}

Rules:
- Answer in the same language the viewer uses
- Be concise and enthusiastic
- If asked about a product not in the list, say you can only help with products in this stream
- Include prices and availability when relevant
- Keep responses under 3 sentences unless more detail is asked for`,
    messages,
  });

  return result.toDataStreamResponse();
};
```

**Step 2: Commit**

```bash
git add app/routes/app.feature-5.chat.\$sessionId.jsx
git commit -m "feat(feature-5): add AI chat streaming endpoint"
```

---

### Task 9: Chat UI Component

**Files:**
- Create: `app/features/feature-5/components/LiveChat.jsx`

**Step 1: Create chat component using AI SDK useChat**

```jsx
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
          }}
        />
        <s-button submit variant="primary">
          Send
        </s-button>
      </form>
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add app/features/feature-5/components/LiveChat.jsx
git commit -m "feat(feature-5): add LiveChat component with AI SDK useChat"
```

---

### Task 10: Viewer Page (MuxPlayer + Products + Chat)

**Files:**
- Create: `app/routes/app.feature-5.live.$sessionId.jsx`

**Step 1: Build the viewer page**

```jsx
import { useLoaderData } from "react-router";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { authenticate } from "../shopify.server";
import prisma from "../db.server";
import { getProductsByIds } from "../features/feature-5/utils/products.server";
import MuxPlayer from "@mux/mux-player-react";
import LiveChat from "../features/feature-5/components/LiveChat";

export const loader = async ({ request, params }) => {
  const { admin } = await authenticate.admin(request);
  const session = await prisma.feature5_LiveSession.findUnique({
    where: { id: params.sessionId },
  });
  if (!session) throw new Response("Not found", { status: 404 });

  const productIds = JSON.parse(session.productIds);
  const products =
    productIds.length > 0 ? await getProductsByIds(admin, productIds) : [];

  return {
    session: {
      id: session.id,
      title: session.title,
      muxPlaybackId: session.muxPlaybackId,
      status: session.status,
      pinnedProductId: session.pinnedProductId,
    },
    products,
  };
};

export default function ViewerPage() {
  const { session, products } = useLoaderData();

  const pinnedProduct = products.find((p) => p.id === session.pinnedProductId);
  const otherProducts = products.filter(
    (p) => p.id !== session.pinnedProductId,
  );

  return (
    <s-page heading={session.title}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 360px",
          gap: "16px",
          minHeight: "600px",
        }}
      >
        {/* Left: Video + Products */}
        <div>
          {/* Video Player */}
          <div
            style={{
              borderRadius: "12px",
              overflow: "hidden",
              background: "#000",
              aspectRatio: "16/9",
            }}
          >
            {session.muxPlaybackId ? (
              <MuxPlayer
                playbackId={session.muxPlaybackId}
                streamType="live"
                autoPlay
                muted
                style={{ width: "100%", height: "100%" }}
              />
            ) : (
              <div
                style={{
                  color: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  height: "100%",
                }}
              >
                Stream not available
              </div>
            )}
          </div>

          {/* Pinned Product */}
          {pinnedProduct && (
            <s-card>
              <s-box padding="base">
                <s-stack direction="inline" gap="base" align="center">
                  <s-badge tone="success">LIVE</s-badge>
                  <s-text fontWeight="bold">{pinnedProduct.title}</s-text>
                  <s-text>
                    $
                    {pinnedProduct.variants.edges[0]?.node.price || "N/A"}
                  </s-text>
                  <s-button variant="primary">Buy Now</s-button>
                </s-stack>
              </s-box>
            </s-card>
          )}

          {/* Other Products */}
          <s-section heading="Products">
            <s-grid columns="2">
              {otherProducts.map((p) => (
                <s-card key={p.id}>
                  <s-box padding="base">
                    <s-stack direction="block" gap="tight">
                      {p.images.edges[0]?.node.url && (
                        <img
                          src={p.images.edges[0].node.url}
                          alt={p.title}
                          style={{
                            width: "100%",
                            borderRadius: "8px",
                            aspectRatio: "1",
                            objectFit: "cover",
                          }}
                        />
                      )}
                      <s-text fontWeight="bold">{p.title}</s-text>
                      <s-text>
                        ${p.variants.edges[0]?.node.price || "N/A"}
                      </s-text>
                      <s-button>Buy Now</s-button>
                    </s-stack>
                  </s-box>
                </s-card>
              ))}
            </s-grid>
          </s-section>
        </div>

        {/* Right: Chat */}
        <div
          style={{
            border: "1px solid #e0e0e0",
            borderRadius: "12px",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              padding: "12px",
              borderBottom: "1px solid #e0e0e0",
              fontWeight: "bold",
            }}
          >
            AI Shopping Assistant
          </div>
          <LiveChat sessionId={session.id} />
        </div>
      </div>
    </s-page>
  );
}

export const headers = (headersArgs) => boundary.headers(headersArgs);
```

**Step 2: Commit**

```bash
git add app/routes/app.feature-5.live.\$sessionId.jsx
git commit -m "feat(feature-5): add viewer page with MuxPlayer, products, and AI chat"
```

---

### Task 11: Update Nav Config + Scopes

**Files:**
- Modify: `app/nav-config.js` (update Feature 5 label)
- Modify: `shopify.app.toml` (add `read_products` scope)

**Step 1: Update nav label**

In `app/nav-config.js`, change Feature 5 entry:
```javascript
{
  label: "Live Shopping",
  href: "/app/feature-5",
}
```

**Step 2: Update Shopify scopes**

In `shopify.app.toml`, update scopes to include product read:
```toml
scopes = "write_products,read_products"
```

**Step 3: Commit**

```bash
git add app/nav-config.js shopify.app.toml
git commit -m "feat(feature-5): update nav label and add read_products scope"
```

---

### Task 12: End-to-End Verification

**Step 1: Start dev server**

Run: `npm run dev`

**Step 2: Test flow**

1. Navigate to /app/feature-5 → Dashboard loads
2. Click "Create Livestream" → Form with products renders
3. Fill title, select products, submit → Redirects to manage page
4. Manage page shows stream key + RTMP URL
5. Navigate to viewer page → MuxPlayer + products + chat renders
6. Type in chat → AI responds with product info

**Step 3: Final commit**

```bash
git add -A
git commit -m "feat(feature-5): live shopping with AI chat complete"
```
