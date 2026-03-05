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
