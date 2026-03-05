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
    <s-page heading={session.title} backAction={{ url: "/app/feature-5" }}>
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
                  color: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  height: "100%",
                  minHeight: "300px",
                }}
              >
                Stream not available
              </div>
            )}
          </div>

          {pinnedProduct && (
            <s-card>
              <s-box padding="base">
                <s-stack direction="inline" gap="base" align="center">
                  <s-badge tone="success">LIVE</s-badge>
                  <s-text fontWeight="bold">{pinnedProduct.title}</s-text>
                  <s-text>
                    ${pinnedProduct.variants.edges[0]?.node.price || "N/A"}
                  </s-text>
                  <s-button variant="primary">Buy Now</s-button>
                </s-stack>
              </s-box>
            </s-card>
          )}

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
