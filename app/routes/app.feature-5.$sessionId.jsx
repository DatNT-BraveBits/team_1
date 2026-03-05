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
    <div style={{ marginBottom: "8px" }}>
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
            padding: "6px 10px",
            borderRadius: "6px",
            border: "1px solid #ccc",
            fontSize: "13px",
            fontFamily: "monospace",
            background: "#f9f9f9",
          }}
          onClick={(e) => e.target.select()}
        />
      </div>
    </div>
  );
}

export default function ManageSession() {
  const { session, products } = useLoaderData();
  const fetcher = useFetcher();

  const rtmpUrl = "rtmp://global-live.mux.com:5222/app";

  return (
    <s-page heading={session.title} backAction={{ url: "/app/feature-5" }}>
      <s-badge
        slot="title-metadata"
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

      {session.status !== "ended" && (
        <s-section heading="Go Live from Browser">
          <BrowserStream streamKey={session.muxStreamKey} sessionId={session.id} title={session.title} />
        </s-section>
      )}

      <s-section heading="Stream Configuration (OBS)">
        <s-card>
          <s-box padding="base">
            <CopyField label="RTMP URL" value={rtmpUrl} />
            <CopyField
              label="Stream Key"
              value={session.muxStreamKey || "N/A"}
            />
            <CopyField label="Session ID (for theme block)" value={session.id} />
          </s-box>
        </s-card>
      </s-section>

      <s-section heading="Quick Links">
        <s-stack direction="inline" gap="base">
          <Link to={`/app/feature-5/live/${session.id}`}>
            <s-button variant="tertiary">Preview Viewer Page</s-button>
          </Link>
        </s-stack>
      </s-section>

      <s-section heading="Products ({products.length})">
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
                    {imgUrl && (
                      <img
                        src={imgUrl}
                        alt={p.title}
                        style={{
                          width: "48px",
                          height: "48px",
                          objectFit: "cover",
                          borderRadius: "6px",
                        }}
                      />
                    )}
                    <div style={{ flex: 1 }}>
                      <s-text fontWeight="bold">{p.title}</s-text>
                      {isPinned && (
                        <s-badge tone="success">Pinned</s-badge>
                      )}
                    </div>
                    {isPinned ? (
                      <fetcher.Form method="post">
                        <input type="hidden" name="intent" value="unpin" />
                        <button
                          type="submit"
                          style={{
                            padding: "6px 12px",
                            borderRadius: "6px",
                            border: "1px solid #ccc",
                            background: "#fff",
                            cursor: "pointer",
                            fontSize: "13px",
                          }}
                        >
                          Unpin
                        </button>
                      </fetcher.Form>
                    ) : (
                      <fetcher.Form method="post">
                        <input type="hidden" name="intent" value="pin" />
                        <input type="hidden" name="productId" value={p.id} />
                        <button
                          type="submit"
                          style={{
                            padding: "6px 12px",
                            borderRadius: "6px",
                            border: "none",
                            background: "#008060",
                            color: "#fff",
                            cursor: "pointer",
                            fontSize: "13px",
                            fontWeight: "600",
                          }}
                        >
                          Pin
                        </button>
                      </fetcher.Form>
                    )}
                  </div>
                </s-box>
              </s-card>
            );
          })}
        </s-stack>
      </s-section>

      {session.status !== "ended" && (
        <s-section>
          <fetcher.Form method="post">
            <input type="hidden" name="intent" value="end" />
            <button
              type="submit"
              style={{
                padding: "8px 16px",
                borderRadius: "8px",
                border: "none",
                background: "#e53e3e",
                color: "#fff",
                fontWeight: "bold",
                cursor: "pointer",
                fontSize: "14px",
              }}
            >
              End Stream
            </button>
          </fetcher.Form>
        </s-section>
      )}
    </s-page>
  );
}

export const headers = (headersArgs) => boundary.headers(headersArgs);
