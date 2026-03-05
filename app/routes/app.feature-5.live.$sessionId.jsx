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
                  color: "#666",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  height: "100%",
                  minHeight: "300px",
                  flexDirection: "column",
                  gap: "8px",
                }}
              >
                <svg
                  width="48"
                  height="48"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#666"
                  strokeWidth="1.5"
                >
                  <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                  <polygon
                    points="10 8 16 12 10 16 10 8"
                    fill="#666"
                    stroke="none"
                  />
                  <line x1="8" y1="21" x2="16" y2="21" />
                  <line x1="12" y1="17" x2="12" y2="21" />
                </svg>
                <span>Waiting for stream...</span>
              </div>
            )}
          </div>

          {/* Pinned Product */}
          {pinnedProduct && (
            <div style={{ marginTop: "12px" }}>
              <s-card>
                <s-box padding="base">
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                    }}
                  >
                    {pinnedProduct.images?.edges[0]?.node?.url && (
                      <img
                        src={pinnedProduct.images.edges[0].node.url}
                        alt={pinnedProduct.title}
                        style={{
                          width: "56px",
                          height: "56px",
                          objectFit: "cover",
                          borderRadius: "8px",
                          border: "1px solid #e1e3e5",
                        }}
                      />
                    )}
                    <div style={{ flex: 1 }}>
                      <s-stack direction="inline" gap="tight" align="center">
                        <s-badge tone="success">NOW SHOWING</s-badge>
                      </s-stack>
                      <s-text fontWeight="bold">{pinnedProduct.title}</s-text>
                      <s-text variant="bodySm">
                        $
                        {pinnedProduct.variants.edges[0]?.node.price || "N/A"}
                      </s-text>
                    </div>
                    <s-button variant="primary">Buy Now</s-button>
                  </div>
                </s-box>
              </s-card>
            </div>
          )}

          {/* Other Products */}
          {otherProducts.length > 0 && (
            <div style={{ marginTop: "16px" }}>
              <s-text fontWeight="bold">
                Products ({otherProducts.length})
              </s-text>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(2, 1fr)",
                  gap: "12px",
                  marginTop: "8px",
                }}
              >
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
                        <s-text variant="bodySm" tone="subdued">
                          ${p.variants.edges[0]?.node.price || "N/A"}
                        </s-text>
                      </s-stack>
                    </s-box>
                  </s-card>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: Chat */}
        <div
          style={{
            border: "1px solid #e1e3e5",
            borderRadius: "12px",
            display: "flex",
            flexDirection: "column",
            background: "#fff",
          }}
        >
          <div
            style={{
              padding: "14px 16px",
              borderBottom: "1px solid #e1e3e5",
              fontWeight: "600",
              fontSize: "14px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            AI Shopping Assistant
          </div>
          <LiveChat sessionId={session.id} />
        </div>
      </div>
    </s-page>
  );
}

export const headers = (headersArgs) => boundary.headers(headersArgs);
