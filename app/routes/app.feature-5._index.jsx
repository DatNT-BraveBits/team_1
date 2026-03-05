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

  const liveSessions = sessions.filter((s) => s.status === "live" || s.status === "idle");
  const endedSessions = sessions.filter((s) => s.status === "ended");

  return (
    <s-page heading="Live Shopping">
      <Link to="/app/feature-5/create">
        <s-button slot="primary-action" variant="primary">
          Create Livestream
        </s-button>
      </Link>

      {sessions.length === 0 ? (
        <s-section>
          <s-box padding="loose" borderRadius="base" background="subdued">
            <s-stack direction="block" gap="base" align="center">
              <s-text variant="headingMd">No livestreams yet</s-text>
              <s-paragraph>
                Create your first livestream to start selling live to your
                customers.
              </s-paragraph>
              <Link to="/app/feature-5/create">
                <s-button variant="primary">Create Livestream</s-button>
              </Link>
            </s-stack>
          </s-box>
        </s-section>
      ) : (
        <>
          {liveSessions.length > 0 && (
            <s-section heading="Active Streams">
              <s-stack direction="block" gap="base">
                {liveSessions.map((s) => (
                  <s-card key={s.id}>
                    <s-box padding="base">
                      <s-stack direction="block" gap="tight">
                        <s-stack direction="inline" gap="base" align="center">
                          <s-badge tone="success">
                            {s.status === "live" ? "LIVE" : "READY"}
                          </s-badge>
                          <s-heading>{s.title}</s-heading>
                        </s-stack>
                        <s-stack direction="inline" gap="base">
                          <s-text variant="bodySm" tone="subdued">
                            ID: {s.id}
                          </s-text>
                          <s-text variant="bodySm" tone="subdued">
                            Products: {JSON.parse(s.productIds || "[]").length}
                          </s-text>
                        </s-stack>
                        <s-stack direction="inline" gap="tight">
                          <Link to={`/app/feature-5/${s.id}`}>
                            <s-button variant="primary">Manage</s-button>
                          </Link>
                          <Link to={`/app/feature-5/live/${s.id}`}>
                            <s-button variant="tertiary">Preview</s-button>
                          </Link>
                        </s-stack>
                      </s-stack>
                    </s-box>
                  </s-card>
                ))}
              </s-stack>
            </s-section>
          )}

          {endedSessions.length > 0 && (
            <s-section heading="Past Streams">
              <s-stack direction="block" gap="base">
                {endedSessions.map((s) => (
                  <s-card key={s.id}>
                    <s-box padding="base">
                      <s-stack direction="inline" gap="base" align="center">
                        <s-badge tone="default">Ended</s-badge>
                        <s-text>{s.title}</s-text>
                        <s-text variant="bodySm" tone="subdued">
                          {new Date(s.createdAt).toLocaleDateString()}
                        </s-text>
                      </s-stack>
                    </s-box>
                  </s-card>
                ))}
              </s-stack>
            </s-section>
          )}
        </>
      )}

      <s-section slot="aside" heading="How it works">
        <s-unordered-list>
          <s-list-item>Create a livestream and select products</s-list-item>
          <s-list-item>Copy the Stream Key into OBS or your streaming app</s-list-item>
          <s-list-item>Add the Live Shopping block to your store theme</s-list-item>
          <s-list-item>Pin products during the stream to highlight them</s-list-item>
        </s-unordered-list>
      </s-section>

      <s-section slot="aside" heading="Theme Setup">
        <s-paragraph>
          Add the <s-text fontWeight="bold">Live Shopping</s-text> block to any
          page in your theme editor. Enter the Session ID to connect it to a
          livestream.
        </s-paragraph>
      </s-section>
    </s-page>
  );
}

export const headers = (headersArgs) => boundary.headers(headersArgs);
