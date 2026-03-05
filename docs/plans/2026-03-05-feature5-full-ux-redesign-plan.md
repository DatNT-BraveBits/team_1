# Feature 5 Live Shopping - Full UX/UI Redesign Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Rewrite all Feature 5 Live Shopping pages to use 100% Polaris web components with proper Shopify admin UX patterns.

**Architecture:** Replace all inline styles and native HTML with Polaris web components (`s-page`, `s-section`, `s-box`, `s-stack`, `s-grid`, `s-checkbox`, `s-text-field`, `s-button`). Use `s-page` aside slot for sidebar layouts. Use Polaris design tokens for all colors/spacing.

**Tech Stack:** React Router v7, Shopify Polaris Web Components, MuxPlayer, Vercel AI SDK

**Design doc:** `docs/plans/2026-03-05-feature5-full-ux-redesign.md`

**Key Polaris patterns:**
- `s-section` at top level renders as a card - do NOT wrap in `s-card`
- `s-page` aside slot: `<s-section slot="aside">` creates a sidebar (only works with `inlineSize="base"`)
- Scale: `small-300 < small < base < large < large-300`
- `s-stack` and `s-grid` need `gap="base"` for default spacing
- Primary action slot: `<s-button slot="primary-action" variant="primary">`

---

### Task 1: BrowserStream Component

**Files:**
- Modify: `app/features/feature-5/components/BrowserStream.jsx`

**Step 1: Rewrite BrowserStream to use only Polaris components**

Replace native `<button>` with `<s-button>` and `<div>` wrapper with `<s-stack>`:

```jsx
export default function BrowserStream({ streamKey, sessionId, title }) {
  if (!streamKey) {
    return (
      <s-box padding="base">
        <s-text tone="caution">
          No stream key available. Create a new session to get one.
        </s-text>
      </s-box>
    );
  }

  const openStudio = () => {
    const params = new URLSearchParams({ key: streamKey, title: title || "Live Stream" });
    const url = `/streaming-studio?${params.toString()}`;
    window.open(url, "live-studio", "width=900,height=700");
  };

  return (
    <s-stack direction="block" gap="base">
      <s-text variant="bodySm" tone="subdued">
        Opens a streaming studio in a new window with webcam access.
      </s-text>
      <s-button variant="primary" onClick={openStudio}>
        Open Streaming Studio
      </s-button>
    </s-stack>
  );
}
```

**Step 2: Verify the file renders without errors**

Run: `cd /Users/vu/team_1 && npm run dev` (quick visual check)

**Step 3: Commit**

```bash
git add app/features/feature-5/components/BrowserStream.jsx
git commit -m "refactor(feature-5): replace native button with Polaris in BrowserStream"
```

---

### Task 2: LiveChat Component

**Files:**
- Modify: `app/features/feature-5/components/LiveChat.jsx`

**Step 1: Rewrite LiveChat with all Polaris components, zero inline styles**

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
```

**Step 2: Commit**

```bash
git add app/features/feature-5/components/LiveChat.jsx
git commit -m "refactor(feature-5): rewrite LiveChat with Polaris components, remove all inline styles"
```

---

### Task 3: Dashboard Page

**Files:**
- Modify: `app/routes/app.feature-5._index.jsx`

**Step 1: Rewrite dashboard with resource list pattern, status filter, and proper empty state**

Keep the loader unchanged. Rewrite only the component and helper functions:

```jsx
import { useLoaderData } from "react-router";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { authenticate } from "../shopify.server";
import prisma from "../db.server";
import { useState } from "react";

export const loader = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  const sessions = await prisma.feature5_LiveSession.findMany({
    where: { shop: session.shop },
    orderBy: { createdAt: "desc" },
  });
  return { sessions };
};

function EmptyState() {
  return (
    <s-section>
      <s-box padding="large-600">
        <s-stack direction="block" gap="base" align="center">
          <s-icon type="camera" size="large" />
          <s-text variant="headingLg">Start live selling</s-text>
          <s-text tone="subdued">
            Create your first livestream to showcase products and sell live to
            your customers.
          </s-text>
          <s-link href="/app/feature-5/create">
            <s-button variant="primary">Create Livestream</s-button>
          </s-link>
        </s-stack>
      </s-box>
    </s-section>
  );
}

function StatusFilter({ filter, onFilter }) {
  return (
    <s-stack direction="inline" gap="small">
      {["all", "active", "ended"].map((f) => (
        <s-button
          key={f}
          variant={filter === f ? "primary" : "secondary"}
          onClick={() => onFilter(f)}
        >
          {f === "all" ? "All" : f === "active" ? "Active" : "Ended"}
        </s-button>
      ))}
    </s-stack>
  );
}

function SessionRow({ session }) {
  const productCount = JSON.parse(session.productIds || "[]").length;
  const date = new Date(session.createdAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <s-table-row>
      <s-table-cell>
        <s-link href={`/app/feature-5/${session.id}`}>
          <s-text fontWeight="semibold">{session.title}</s-text>
        </s-link>
      </s-table-cell>
      <s-table-cell>
        <s-badge
          tone={
            session.status === "live"
              ? "success"
              : session.status === "ended"
                ? "default"
                : "info"
          }
        >
          {session.status === "live"
            ? "LIVE"
            : session.status === "ended"
              ? "Ended"
              : "Ready"}
        </s-badge>
      </s-table-cell>
      <s-table-cell>
        <s-text variant="bodySm">{productCount}</s-text>
      </s-table-cell>
      <s-table-cell>
        <s-text variant="bodySm" tone="subdued">{date}</s-text>
      </s-table-cell>
    </s-table-row>
  );
}

export default function Feature5Dashboard() {
  const { sessions } = useLoaderData();
  const [filter, setFilter] = useState("all");

  const filteredSessions = sessions.filter((s) => {
    if (filter === "active") return s.status === "live" || s.status === "idle";
    if (filter === "ended") return s.status === "ended";
    return true;
  });

  const activeSessions = sessions.filter(
    (s) => s.status === "live" || s.status === "idle",
  );
  const totalProducts = sessions.reduce(
    (sum, s) => sum + JSON.parse(s.productIds || "[]").length,
    0,
  );

  return (
    <s-page heading="Live Shopping" inlineSize="large">
      <s-button slot="primary-action" variant="primary" href="/app/feature-5/create">
        Create Livestream
      </s-button>

      {sessions.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          {/* Stats */}
          <s-section>
            <s-stack direction="inline" gap="large">
              <s-stack direction="block" gap="small">
                <s-text tone="subdued" variant="bodySm">Total Streams</s-text>
                <s-text variant="headingLg">{sessions.length}</s-text>
              </s-stack>
              <s-stack direction="block" gap="small">
                <s-text tone="subdued" variant="bodySm">Active Now</s-text>
                <s-text variant="headingLg">{activeSessions.length}</s-text>
              </s-stack>
              <s-stack direction="block" gap="small">
                <s-text tone="subdued" variant="bodySm">Products Showcased</s-text>
                <s-text variant="headingLg">{totalProducts}</s-text>
              </s-stack>
            </s-stack>
          </s-section>

          {/* Filter + Table */}
          <s-section heading="Streams">
            <StatusFilter filter={filter} onFilter={setFilter} />
            <s-table>
              <s-table-header-row>
                <s-table-header>Title</s-table-header>
                <s-table-header>Status</s-table-header>
                <s-table-header>Products</s-table-header>
                <s-table-header>Created</s-table-header>
              </s-table-header-row>
              {filteredSessions.map((s) => (
                <SessionRow key={s.id} session={s} />
              ))}
            </s-table>
          </s-section>
        </>
      )}
    </s-page>
  );
}

export const headers = (headersArgs) => boundary.headers(headersArgs);
```

**Step 2: Commit**

```bash
git add app/routes/app.feature-5._index.jsx
git commit -m "refactor(feature-5): redesign dashboard with resource list, status filter, and clean stats"
```

---

### Task 4: Create Livestream Page

**Files:**
- Modify: `app/routes/app.feature-5.create.jsx`

**Step 1: Rewrite create page with Polaris grid, s-checkbox, and proper form pattern**

Keep loader and action unchanged. Rewrite only the component:

```jsx
import { useLoaderData, Form, redirect } from "react-router";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { authenticate } from "../shopify.server";
import prisma from "../db.server";
import { createLiveStream } from "../features/feature-5/utils/mux.server";
import { useState } from "react";

const PRODUCTS_LIST_QUERY = `#graphql
  query listProducts {
    products(first: 20) {
      edges {
        node {
          id
          title
          images(first: 1) { edges { node { url } } }
          variants(first: 1) { edges { node { price } } }
        }
      }
    }
  }
`;

export const loader = async ({ request }) => {
  const { admin } = await authenticate.admin(request);
  const res = await admin.graphql(PRODUCTS_LIST_QUERY);
  const data = await res.json();
  return { products: data.data.products.edges.map((e) => e.node) };
};

export const action = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  const formData = await request.formData();
  const title = formData.get("title");
  const productIds = formData.getAll("products");
  const mux = await createLiveStream();

  const liveSession = await prisma.feature5_LiveSession.create({
    data: {
      shop: session.shop,
      title,
      muxStreamId: mux.streamId,
      muxPlaybackId: mux.playbackId,
      muxStreamKey: mux.streamKey,
      productIds: JSON.stringify(productIds),
    },
  });

  return redirect(`/app/feature-5/${liveSession.id}`);
};

function ProductCard({ product, selected, onToggle }) {
  const imgUrl = product.images.edges[0]?.node.url;
  const price = product.variants.edges[0]?.node.price;

  return (
    <s-card>
      <s-box padding="small">
        <s-stack direction="block" gap="small">
          {imgUrl ? (
            <s-box borderRadius="base" overflow="hidden">
              <s-image src={imgUrl} alt={product.title} objectFit="cover" />
            </s-box>
          ) : (
            <s-box padding="large" background="subdued" borderRadius="base">
              <s-stack direction="block" align="center">
                <s-icon type="image" />
                <s-text tone="subdued" variant="bodySm">No image</s-text>
              </s-stack>
            </s-box>
          )}
          <s-stack direction="block" gap="small">
            <s-text variant="bodySm" fontWeight="semibold">
              {product.title}
            </s-text>
            {price && (
              <s-text variant="bodySm" tone="subdued">${price}</s-text>
            )}
            <s-checkbox
              label="Select"
              labelHidden
              checked={selected}
              onChange={onToggle}
            />
          </s-stack>
        </s-stack>
      </s-box>
    </s-card>
  );
}

export default function CreateSession() {
  const { products } = useLoaderData();
  const [selectedProducts, setSelectedProducts] = useState(new Set());

  const toggleProduct = (id) => {
    setSelectedProducts((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <Form method="post" data-save-bar>
      {/* Hidden inputs for selected products */}
      {[...selectedProducts].map((id) => (
        <input key={id} type="hidden" name="products" value={id} />
      ))}

      <s-page heading="Create Livestream" backAction={{ url: "/app/feature-5" }}>
        <s-button slot="primary-action" variant="primary" submit>
          Create Livestream
        </s-button>

        <s-section heading="Stream Details">
          <s-text-field
            label="Title"
            name="title"
            placeholder="e.g. Summer Collection Launch"
            details="Give your livestream a name that describes the event."
            required
          />
          <s-text-field
            label="Description"
            name="description"
            placeholder="Tell viewers what to expect"
            multiline
          />
        </s-section>

        <s-section heading="Select Products">
          <s-stack direction="block" gap="base">
            <s-stack direction="inline" gap="small" alignItems="center">
              <s-text tone="subdued">
                Choose products to showcase during your livestream.
              </s-text>
              {selectedProducts.size > 0 && (
                <s-badge tone="info">
                  {selectedProducts.size} selected
                </s-badge>
              )}
            </s-stack>
            <s-grid columns="3">
              {products.map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  selected={selectedProducts.has(p.id)}
                  onToggle={() => toggleProduct(p.id)}
                />
              ))}
            </s-grid>
          </s-stack>
        </s-section>
      </s-page>
    </Form>
  );
}

export const headers = (headersArgs) => boundary.headers(headersArgs);
```

**Step 2: Commit**

```bash
git add app/routes/app.feature-5.create.jsx
git commit -m "refactor(feature-5): redesign create page with Polaris grid, checkbox, and proper form layout"
```

---

### Task 5: Stream Management Page

**Files:**
- Modify: `app/routes/app.feature-5.$sessionId.jsx`

**Step 1: Rewrite management page with aside sidebar and clean Polaris layout**

Keep loader and action unchanged. Rewrite only the component and helpers:

```jsx
import { useLoaderData, useFetcher } from "react-router";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { authenticate } from "../shopify.server";
import prisma from "../db.server";
import { endLiveStream } from "../features/feature-5/utils/mux.server";
import { getProductsByIds } from "../features/feature-5/utils/products.server";
import BrowserStream from "../features/feature-5/components/BrowserStream";

export const loader = async ({ request, params }) => {
  const { admin } = await authenticate.admin(request);
  const session = await prisma.feature5_LiveSession.findUnique({
    where: { id: params.sessionId },
  });
  if (!session) throw new Response("Not found", { status: 404 });

  const productIds = JSON.parse(session.productIds);
  const products =
    productIds.length > 0 ? await getProductsByIds(admin, productIds) : [];

  return { session, products };
};

export const action = async ({ request, params }) => {
  await authenticate.admin(request);
  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "end") {
    const session = await prisma.feature5_LiveSession.findUnique({
      where: { id: params.sessionId },
    });
    if (session?.muxStreamId) {
      try {
        await endLiveStream(session.muxStreamId);
      } catch (e) {
        /* stream may already be ended */
      }
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

function CopyField({ label, value }) {
  return (
    <s-stack direction="block" gap="small">
      <s-text variant="bodySm" fontWeight="bold">{label}</s-text>
      <s-stack direction="inline" gap="small">
        <s-box
          padding="small"
          background="subdued"
          border="base"
          borderRadius="base"
          inlineSize="fill"
        >
          <s-text variant="bodySm">{value}</s-text>
        </s-box>
        <s-clipboard-item id={`copy-${label}`} content={value}>
          <s-button command="--copy" commandFor={`copy-${label}`}>
            Copy
          </s-button>
        </s-clipboard-item>
      </s-stack>
    </s-stack>
  );
}

function StatusBadge({ status }) {
  const tone = status === "live" ? "success" : status === "ended" ? "default" : "info";
  const label = status === "live" ? "LIVE" : status === "ended" ? "Ended" : "Ready";
  return <s-badge tone={tone}>{label}</s-badge>;
}

export default function ManageSession() {
  const { session, products } = useLoaderData();
  const fetcher = useFetcher();

  const rtmpUrl = "rtmp://global-live.mux.com:5222/app";
  const isEnded = session.status === "ended";
  const pinnedCount = session.pinnedProductId ? 1 : 0;

  return (
    <s-page heading={session.title} backAction={{ url: "/app/feature-5" }}>
      <StatusBadge status={session.status} slot="title-metadata" />

      {!isEnded && (
        <s-link slot="secondary-actions" href={`/app/feature-5/live/${session.id}`}>
          Preview
        </s-link>
      )}

      {/* Aside sidebar - stream status */}
      <s-section heading="Stream Status" slot="aside">
        <s-stack direction="block" gap="base">
          <s-stack direction="block" gap="small">
            <s-text tone="subdued" variant="bodySm">Status</s-text>
            <StatusBadge status={session.status} />
          </s-stack>
          <s-stack direction="block" gap="small">
            <s-text tone="subdued" variant="bodySm">Products</s-text>
            <s-text fontWeight="semibold">{products.length}</s-text>
          </s-stack>
          <s-stack direction="block" gap="small">
            <s-text tone="subdued" variant="bodySm">Pinned</s-text>
            <s-text fontWeight="semibold">{pinnedCount}</s-text>
          </s-stack>
          {!isEnded && (
            <fetcher.Form method="post">
              <input type="hidden" name="intent" value="end" />
              <s-button submit variant="primary" tone="critical" fullWidth>
                End Stream
              </s-button>
            </fetcher.Form>
          )}
        </s-stack>
      </s-section>

      {/* Page-level banner */}
      <s-banner>
        Use these credentials with OBS or any RTMP-compatible streaming
        software. Copy the Session ID into the theme block settings.
      </s-banner>

      {/* Browser Streaming */}
      {!isEnded && (
        <s-section heading="Go Live from Browser">
          <BrowserStream
            streamKey={session.muxStreamKey}
            sessionId={session.id}
            title={session.title}
          />
        </s-section>
      )}

      {/* Stream Configuration */}
      <s-section heading="Stream Configuration">
        <s-stack direction="block" gap="base">
          <CopyField label="RTMP URL" value={rtmpUrl} />
          <CopyField label="Stream Key" value={session.muxStreamKey || "N/A"} />
          <CopyField label="Session ID" value={session.id} />
        </s-stack>
      </s-section>

      {/* Products */}
      <s-section heading={`Products (${products.length})`}>
        {products.length === 0 ? (
          <s-text tone="subdued">No products added to this livestream.</s-text>
        ) : (
          <s-table>
            <s-table-header-row>
              <s-table-header>Product</s-table-header>
              <s-table-header>Status</s-table-header>
              <s-table-header>
                <s-stack alignItems="end">Action</s-stack>
              </s-table-header>
            </s-table-header-row>
            {products.map((p) => {
              const imgUrl = p.images?.edges[0]?.node?.url;
              const isPinned = session.pinnedProductId === p.id;
              return (
                <s-table-row key={p.id}>
                  <s-table-cell>
                    <s-stack direction="inline" gap="small" alignItems="center">
                      <s-box
                        border="base"
                        borderRadius="base"
                        overflow="hidden"
                        inlineSize="40px"
                        blockSize="40px"
                      >
                        {imgUrl ? (
                          <s-image src={imgUrl} alt={p.title} objectFit="cover" />
                        ) : (
                          <s-icon type="image" />
                        )}
                      </s-box>
                      <s-text fontWeight="semibold">{p.title}</s-text>
                    </s-stack>
                  </s-table-cell>
                  <s-table-cell>
                    {isPinned && (
                      <s-badge tone="success" icon="pin">Pinned</s-badge>
                    )}
                  </s-table-cell>
                  <s-table-cell>
                    {!isEnded && (
                      <s-stack direction="inline" alignItems="end">
                        {isPinned ? (
                          <fetcher.Form method="post">
                            <input type="hidden" name="intent" value="unpin" />
                            <s-button submit>Unpin</s-button>
                          </fetcher.Form>
                        ) : (
                          <fetcher.Form method="post">
                            <input type="hidden" name="intent" value="pin" />
                            <input type="hidden" name="productId" value={p.id} />
                            <s-button submit variant="primary">Pin</s-button>
                          </fetcher.Form>
                        )}
                      </s-stack>
                    )}
                  </s-table-cell>
                </s-table-row>
              );
            })}
          </s-table>
        )}
      </s-section>
    </s-page>
  );
}

export const headers = (headersArgs) => boundary.headers(headersArgs);
```

**Step 2: Commit**

```bash
git add app/routes/app.feature-5.\$sessionId.jsx
git commit -m "refactor(feature-5): redesign management page with aside sidebar and clean Polaris layout"
```

---

### Task 6: Live Viewer Page

**Files:**
- Modify: `app/routes/app.feature-5.live.$sessionId.jsx`

**Step 1: Rewrite viewer page with s-page aside slot for chat, remove all inline styles**

Keep loader unchanged. Rewrite the component:

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

  const pinnedProduct = products.find(
    (p) => p.id === session.pinnedProductId,
  );
  const otherProducts = products.filter(
    (p) => p.id !== session.pinnedProductId,
  );

  return (
    <s-page heading={session.title} backAction={{ url: "/app/feature-5" }}>
      <s-badge
        slot="title-metadata"
        tone={session.status === "live" ? "success" : "info"}
      >
        {session.status === "live" ? "LIVE" : "Preview"}
      </s-badge>

      {/* Chat sidebar via aside slot */}
      <s-section heading="AI Shopping Assistant" slot="aside">
        <LiveChat sessionId={session.id} />
      </s-section>

      {/* Video player */}
      <s-section>
        <s-box borderRadius="large-200" overflow="hidden" background="strong">
          {session.muxPlaybackId ? (
            <MuxPlayer
              playbackId={session.muxPlaybackId}
              streamType="live"
              autoPlay
              muted
              style={{ width: "100%", aspectRatio: "16/9" }}
            />
          ) : (
            <s-box padding="large-600">
              <s-stack direction="block" gap="small" align="center">
                <s-icon type="camera" size="large" />
                <s-text tone="subdued">Waiting for stream...</s-text>
              </s-stack>
            </s-box>
          )}
        </s-box>
      </s-section>

      {/* Pinned Product */}
      {pinnedProduct && (
        <s-section>
          <s-card>
            <s-box padding="base">
              <s-stack direction="inline" gap="base" alignItems="center">
                {pinnedProduct.images?.edges[0]?.node?.url && (
                  <s-box
                    border="base"
                    borderRadius="base"
                    overflow="hidden"
                    inlineSize="56px"
                    blockSize="56px"
                  >
                    <s-image
                      src={pinnedProduct.images.edges[0].node.url}
                      alt={pinnedProduct.title}
                      objectFit="cover"
                    />
                  </s-box>
                )}
                <s-stack direction="block" gap="small" inlineSize="fill">
                  <s-badge tone="success">NOW SHOWING</s-badge>
                  <s-text fontWeight="bold">{pinnedProduct.title}</s-text>
                  <s-text variant="bodySm">
                    ${pinnedProduct.variants.edges[0]?.node.price || "N/A"}
                  </s-text>
                </s-stack>
                <s-button variant="primary">Buy Now</s-button>
              </s-stack>
            </s-box>
          </s-card>
        </s-section>
      )}

      {/* Other Products */}
      {otherProducts.length > 0 && (
        <s-section heading={`Products (${otherProducts.length})`}>
          <s-grid columns="2">
            {otherProducts.map((p) => (
              <s-card key={p.id}>
                <s-box padding="base">
                  <s-stack direction="block" gap="small">
                    {p.images.edges[0]?.node.url && (
                      <s-box border="base" borderRadius="base" overflow="hidden">
                        <s-image
                          src={p.images.edges[0].node.url}
                          alt={p.title}
                          objectFit="cover"
                        />
                      </s-box>
                    )}
                    <s-text fontWeight="bold">{p.title}</s-text>
                    <s-text variant="bodySm" tone="subdued">
                      ${p.variants.edges[0]?.node.price || "N/A"}
                    </s-text>
                  </s-stack>
                </s-box>
              </s-card>
            ))}
          </s-grid>
        </s-section>
      )}
    </s-page>
  );
}

export const headers = (headersArgs) => boundary.headers(headersArgs);
```

**Step 2: Commit**

```bash
git add app/routes/app.feature-5.live.\$sessionId.jsx
git commit -m "refactor(feature-5): redesign viewer page with aside chat sidebar, remove all inline styles"
```

---

### Task 7: Final Verification

**Step 1: Run the dev server and verify all pages render**

Run: `cd /Users/vu/team_1 && npm run dev`

Check each page:
- `/app/feature-5` - Dashboard loads, stats show, filter works, table renders
- `/app/feature-5/create` - Form renders, product grid shows, checkboxes work, submit works
- `/app/feature-5/{id}` - Management page loads, aside sidebar shows, copy fields work, pin/unpin works
- `/app/feature-5/live/{id}` - Viewer loads, video area shows, chat sidebar renders, products display

**Step 2: Verify zero inline styles remain**

Run: `grep -rn 'style={{' app/routes/app.feature-5.*.jsx app/features/feature-5/components/*.jsx`

Expected: Only the MuxPlayer `style` prop on the viewer page (external component, acceptable).

**Step 3: Verify zero hardcoded colors**

Run: `grep -rn '#[0-9a-fA-F]\{3,6\}' app/routes/app.feature-5.*.jsx app/features/feature-5/components/*.jsx`

Expected: No matches.

**Step 4: Final commit**

```bash
git add -A
git commit -m "refactor(feature-5): complete UX/UI redesign with full Polaris compliance"
```
