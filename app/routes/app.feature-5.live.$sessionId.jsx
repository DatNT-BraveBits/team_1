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
          <s-box
            border="base"
            borderRadius="large-200"
            overflow="hidden"
            background="strong"
          >
            <div style={{ aspectRatio: "16/9", background: "#000" }}>
              {session.muxPlaybackId ? (
                <MuxPlayer
                  playbackId={session.muxPlaybackId}
                  streamType="live"
                  autoPlay
                  muted
                  style={{ width: "100%", height: "100%" }}
                />
              ) : (
                <s-box padding="large-600">
                  <s-stack direction="block" gap="small" align="center">
                    <s-icon type="camera" size="large" />
                    <s-text tone="subdued">Waiting for stream...</s-text>
                  </s-stack>
                </s-box>
              )}
            </div>
          </s-box>

          {/* Pinned Product */}
          {pinnedProduct && (
            <div style={{ marginTop: "12px" }}>
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
                        $
                        {pinnedProduct.variants.edges[0]?.node.price || "N/A"}
                      </s-text>
                    </s-stack>
                    <s-button variant="primary">Buy Now</s-button>
                  </s-stack>
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
              <s-grid columns="2" style={{ marginTop: "8px" }}>
                {otherProducts.map((p) => (
                  <s-card key={p.id}>
                    <s-box padding="base">
                      <s-stack direction="block" gap="small">
                        {p.images.edges[0]?.node.url && (
                          <s-box
                            border="base"
                            borderRadius="base"
                            overflow="hidden"
                          >
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
            </div>
          )}
        </div>

        {/* Right: Chat */}
        <s-box
          border="base"
          borderRadius="large-200"
          overflow="hidden"
          background="surface"
        >
          <s-box
            padding="base"
            borderBlockEndWidth="base"
          >
            <s-stack direction="inline" gap="small" alignItems="center">
              <s-icon type="chat" />
              <s-text fontWeight="semibold" variant="bodySm">
                AI Shopping Assistant
              </s-text>
            </s-stack>
          </s-box>
          <LiveChat sessionId={session.id} />
        </s-box>
      </div>
    </s-page>
  );
}

export const headers = (headersArgs) => boundary.headers(headersArgs);
