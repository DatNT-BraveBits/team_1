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
          <BrowserStream
            streamKey={session.muxStreamKey}
            sessionId={session.id}
            title={session.title}
          />
        </s-section>
      )}

      <s-section heading="Stream Configuration (OBS)">
        <s-card>
          <s-box padding="base">
            <s-stack direction="block" gap="base">
              <s-text-field
                label="RTMP URL"
                value={rtmpUrl}
                readOnly
                selectOnFocus
              />
              <s-text-field
                label="Stream Key"
                value={session.muxStreamKey || "N/A"}
                readOnly
                selectOnFocus
              />
              <s-text-field
                label="Session ID (for theme block)"
                value={session.id}
                readOnly
                selectOnFocus
              />
            </s-stack>
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

      <s-section heading={`Products (${products.length})`}>
        <s-stack direction="block" gap="base">
          {products.map((p) => {
            const imgUrl = p.images?.edges[0]?.node?.url;
            const isPinned = session.pinnedProductId === p.id;
            return (
              <s-card key={p.id}>
                <s-box padding="base">
                  <s-stack direction="inline" gap="base" align="center">
                    {imgUrl && (
                      <s-thumbnail src={imgUrl} alt={p.title} size="small-200" />
                    )}
                    <s-stack direction="block" gap="small-200" style={{ flex: 1 }}>
                      <s-text fontWeight="bold">{p.title}</s-text>
                      {isPinned && <s-badge tone="success">Pinned</s-badge>}
                    </s-stack>
                    {isPinned ? (
                      <fetcher.Form method="post">
                        <input type="hidden" name="intent" value="unpin" />
                        <s-button type="submit">Unpin</s-button>
                      </fetcher.Form>
                    ) : (
                      <fetcher.Form method="post">
                        <input type="hidden" name="intent" value="pin" />
                        <input type="hidden" name="productId" value={p.id} />
                        <s-button type="submit" variant="primary">
                          Pin
                        </s-button>
                      </fetcher.Form>
                    )}
                  </s-stack>
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
            <s-button type="submit" tone="critical">
              End Stream
            </s-button>
          </fetcher.Form>
        </s-section>
      )}
    </s-page>
  );
}

export const headers = (headersArgs) => boundary.headers(headersArgs);
