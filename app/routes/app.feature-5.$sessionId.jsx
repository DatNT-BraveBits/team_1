import { useLoaderData, useFetcher, Link } from "react-router";
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
    <div style={{ marginBottom: "12px" }}>
      <s-text variant="bodySm" fontWeight="bold">
        {label}
      </s-text>
      <div
        style={{
          display: "flex",
          gap: "8px",
          marginTop: "4px",
          alignItems: "center",
        }}
      >
        <input
          type="text"
          value={value}
          readOnly
          style={{
            flex: 1,
            padding: "7px 12px",
            borderRadius: "8px",
            border: "1px solid #8c9196",
            fontSize: "13px",
            fontFamily: "monospace",
            background: "#f6f6f7",
          }}
          onClick={(e) => e.target.select()}
        />
        <button
          type="button"
          onClick={() => navigator.clipboard.writeText(value)}
          style={{
            padding: "7px 14px",
            borderRadius: "8px",
            border: "1px solid #8c9196",
            background: "#fff",
            cursor: "pointer",
            fontSize: "13px",
            fontFamily: "inherit",
          }}
        >
          Copy
        </button>
      </div>
    </div>
  );
}

export default function ManageSession() {
  const { session, products } = useLoaderData();
  const fetcher = useFetcher();

  const rtmpUrl = "rtmp://global-live.mux.com:5222/app";
  const isEnded = session.status === "ended";

  return (
    <s-page heading={session.title} backAction={{ url: "/app/feature-5" }}>
      <s-badge
        slot="title-metadata"
        tone={
          session.status === "live"
            ? "success"
            : isEnded
              ? "default"
              : "info"
        }
      >
        {session.status === "live"
          ? "LIVE"
          : isEnded
            ? "Ended"
            : "Ready"}
      </s-badge>

      {!isEnded && (
        <Link to={`/app/feature-5/live/${session.id}`}>
          <s-button slot="secondary-actions" variant="tertiary">
            Preview
          </s-button>
        </Link>
      )}

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
        <s-card>
          <s-box padding="base">
            <s-text variant="bodySm" tone="subdued">
              Use these credentials with OBS or any RTMP-compatible streaming
              software.
            </s-text>
            <div style={{ marginTop: "12px" }}>
              <CopyField label="RTMP URL" value={rtmpUrl} />
              <CopyField
                label="Stream Key"
                value={session.muxStreamKey || "N/A"}
              />
              <CopyField
                label="Session ID (for theme block)"
                value={session.id}
              />
            </div>
          </s-box>
        </s-card>
      </s-section>

      {/* Products */}
      <s-section heading={`Products (${products.length})`}>
        {products.length === 0 ? (
          <s-card>
            <s-box padding="base">
              <s-text tone="subdued">
                No products added to this livestream.
              </s-text>
            </s-box>
          </s-card>
        ) : (
          <s-stack direction="block" gap="base">
            {products.map((p) => {
              const imgUrl = p.images?.edges[0]?.node?.url;
              const isPinned = session.pinnedProductId === p.id;
              return (
                <s-card key={p.id}>
                  <s-box padding="base">
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                      }}
                    >
                      {imgUrl ? (
                        <img
                          src={imgUrl}
                          alt={p.title}
                          style={{
                            width: "48px",
                            height: "48px",
                            objectFit: "cover",
                            borderRadius: "8px",
                            border: "1px solid #e1e3e5",
                          }}
                        />
                      ) : (
                        <div
                          style={{
                            width: "48px",
                            height: "48px",
                            borderRadius: "8px",
                            background: "#f6f6f7",
                            border: "1px solid #e1e3e5",
                          }}
                        />
                      )}
                      <div style={{ flex: 1 }}>
                        <s-text fontWeight="bold">{p.title}</s-text>
                        {isPinned && (
                          <s-badge tone="success">Pinned</s-badge>
                        )}
                      </div>
                      {!isEnded &&
                        (isPinned ? (
                          <fetcher.Form method="post">
                            <input
                              type="hidden"
                              name="intent"
                              value="unpin"
                            />
                            <button
                              type="submit"
                              style={{
                                padding: "6px 14px",
                                borderRadius: "8px",
                                border: "1px solid #8c9196",
                                background: "#fff",
                                cursor: "pointer",
                                fontSize: "13px",
                                fontFamily: "inherit",
                              }}
                            >
                              Unpin
                            </button>
                          </fetcher.Form>
                        ) : (
                          <fetcher.Form method="post">
                            <input type="hidden" name="intent" value="pin" />
                            <input
                              type="hidden"
                              name="productId"
                              value={p.id}
                            />
                            <button
                              type="submit"
                              style={{
                                padding: "6px 14px",
                                borderRadius: "8px",
                                border: "none",
                                background: "#005bd3",
                                color: "#fff",
                                cursor: "pointer",
                                fontSize: "13px",
                                fontWeight: "600",
                                fontFamily: "inherit",
                              }}
                            >
                              Pin
                            </button>
                          </fetcher.Form>
                        ))}
                    </div>
                  </s-box>
                </s-card>
              );
            })}
          </s-stack>
        )}
      </s-section>

      {/* End Stream */}
      {!isEnded && (
        <s-section heading="Danger Zone">
          <s-card>
            <s-box padding="base">
              <s-stack direction="inline" gap="base" align="center">
                <s-stack direction="block" gap="tight">
                  <s-text fontWeight="bold">End this stream</s-text>
                  <s-text variant="bodySm" tone="subdued">
                    This will stop the livestream and disconnect all viewers.
                    This action cannot be undone.
                  </s-text>
                </s-stack>
                <fetcher.Form method="post">
                  <input type="hidden" name="intent" value="end" />
                  <button
                    type="submit"
                    style={{
                      padding: "8px 16px",
                      borderRadius: "8px",
                      border: "none",
                      background: "#e51c00",
                      color: "#fff",
                      fontWeight: "600",
                      cursor: "pointer",
                      fontSize: "13px",
                      fontFamily: "inherit",
                      whiteSpace: "nowrap",
                    }}
                  >
                    End Stream
                  </button>
                </fetcher.Form>
              </s-stack>
            </s-box>
          </s-card>
        </s-section>
      )}
    </s-page>
  );
}

export const headers = (headersArgs) => boundary.headers(headersArgs);
