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
      <s-text variant="bodySm" fontWeight="bold">
        {label}
      </s-text>
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
        <s-link
          slot="secondary-actions"
          href={`/app/feature-5/live/${session.id}`}
        >
          Preview
        </s-link>
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
        <s-banner>
          Use these credentials with OBS or any RTMP-compatible streaming
          software. Copy the Session ID into the theme block settings.
        </s-banner>
        <s-card>
          <s-box padding="base">
            <s-stack direction="block" gap="base">
              <CopyField label="RTMP URL" value={rtmpUrl} />
              <CopyField
                label="Stream Key"
                value={session.muxStreamKey || "N/A"}
              />
              <CopyField label="Session ID" value={session.id} />
            </s-stack>
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
          <s-box
            background="strong"
            border="base"
            borderRadius="base"
            overflow="hidden"
          >
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
                            <s-image
                              src={imgUrl}
                              alt={p.title}
                              objectFit="cover"
                            />
                          ) : (
                            <s-icon type="image" />
                          )}
                        </s-box>
                        <s-text fontWeight="semibold">{p.title}</s-text>
                      </s-stack>
                    </s-table-cell>
                    <s-table-cell>
                      {isPinned && (
                        <s-badge tone="success" icon="pin">
                          Pinned
                        </s-badge>
                      )}
                    </s-table-cell>
                    <s-table-cell>
                      {!isEnded && (
                        <s-stack direction="inline" alignItems="end">
                          {isPinned ? (
                            <fetcher.Form method="post">
                              <input
                                type="hidden"
                                name="intent"
                                value="unpin"
                              />
                              <s-button submit>Unpin</s-button>
                            </fetcher.Form>
                          ) : (
                            <fetcher.Form method="post">
                              <input
                                type="hidden"
                                name="intent"
                                value="pin"
                              />
                              <input
                                type="hidden"
                                name="productId"
                                value={p.id}
                              />
                              <s-button submit variant="primary">
                                Pin
                              </s-button>
                            </fetcher.Form>
                          )}
                        </s-stack>
                      )}
                    </s-table-cell>
                  </s-table-row>
                );
              })}
            </s-table>
          </s-box>
        )}
      </s-section>

      {/* End Stream */}
      {!isEnded && (
        <s-section>
          <s-banner tone="warning">
            <s-stack direction="inline" gap="base" alignItems="center">
              <s-stack direction="block" gap="small">
                <s-text fontWeight="bold">End this stream</s-text>
                <s-text variant="bodySm">
                  This will stop the livestream and disconnect all viewers. This
                  action cannot be undone.
                </s-text>
              </s-stack>
              <fetcher.Form method="post">
                <input type="hidden" name="intent" value="end" />
                <s-button submit variant="primary" tone="critical">
                  End Stream
                </s-button>
              </fetcher.Form>
            </s-stack>
          </s-banner>
        </s-section>
      )}
    </s-page>
  );
}

export const headers = (headersArgs) => boundary.headers(headersArgs);
