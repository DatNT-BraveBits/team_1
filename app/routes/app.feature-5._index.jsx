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

  const liveSessions = sessions.filter(
    (s) => s.status === "live" || s.status === "idle",
  );
  const endedSessions = sessions.filter((s) => s.status === "ended");
  const totalProducts = sessions.reduce(
    (sum, s) => sum + JSON.parse(s.productIds || "[]").length,
    0,
  );

  return (
    <s-page heading="Live Shopping">
      <Link to="/app/feature-5/create">
        <s-button slot="primary-action" variant="primary">
          Create Livestream
        </s-button>
      </Link>

      {sessions.length === 0 ? (
        <s-section>
          <s-card>
            <s-box padding="large-600">
              <s-stack direction="block" gap="base" align="center">
                <svg
                  width="60"
                  height="60"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#8c9196"
                  strokeWidth="1.5"
                >
                  <rect
                    x="2"
                    y="3"
                    width="20"
                    height="14"
                    rx="2"
                    ry="2"
                  />
                  <polygon
                    points="10 8 16 12 10 16 10 8"
                    fill="#8c9196"
                    stroke="none"
                  />
                  <line x1="8" y1="21" x2="16" y2="21" />
                  <line x1="12" y1="17" x2="12" y2="21" />
                </svg>
                <s-heading>Start live selling</s-heading>
                <s-text tone="subdued">
                  Create your first livestream to showcase products and sell live
                  to your customers.
                </s-text>
                <Link to="/app/feature-5/create">
                  <s-button variant="primary">Create Livestream</s-button>
                </Link>
              </s-stack>
            </s-box>
          </s-card>
        </s-section>
      ) : (
        <>
          {/* Stats */}
          <s-section>
            <s-grid columns="3">
              <s-card>
                <s-box padding="base">
                  <s-stack direction="block" gap="tight">
                    <s-text tone="subdued" variant="bodySm">
                      Total Streams
                    </s-text>
                    <s-text variant="headingLg" fontWeight="bold">
                      {sessions.length}
                    </s-text>
                  </s-stack>
                </s-box>
              </s-card>
              <s-card>
                <s-box padding="base">
                  <s-stack direction="block" gap="tight">
                    <s-text tone="subdued" variant="bodySm">
                      Active Now
                    </s-text>
                    <s-text variant="headingLg" fontWeight="bold">
                      {liveSessions.length}
                    </s-text>
                  </s-stack>
                </s-box>
              </s-card>
              <s-card>
                <s-box padding="base">
                  <s-stack direction="block" gap="tight">
                    <s-text tone="subdued" variant="bodySm">
                      Products Showcased
                    </s-text>
                    <s-text variant="headingLg" fontWeight="bold">
                      {totalProducts}
                    </s-text>
                  </s-stack>
                </s-box>
              </s-card>
            </s-grid>
          </s-section>

          {/* Active Streams */}
          {liveSessions.length > 0 && (
            <s-section heading="Active Streams">
              <s-stack direction="block" gap="base">
                {liveSessions.map((s) => (
                  <Link
                    key={s.id}
                    to={`/app/feature-5/${s.id}`}
                    style={{ textDecoration: "none", color: "inherit" }}
                  >
                    <s-card>
                      <s-box padding="base">
                        <s-stack direction="inline" gap="base" align="center">
                          <s-badge tone="success">
                            {s.status === "live" ? "LIVE" : "Ready"}
                          </s-badge>
                          <s-stack direction="block" gap="tight">
                            <s-text fontWeight="bold">{s.title}</s-text>
                            <s-text variant="bodySm" tone="subdued">
                              {JSON.parse(s.productIds || "[]").length} products
                              ·{" "}
                              {new Date(s.createdAt).toLocaleDateString(
                                "en-US",
                                {
                                  month: "short",
                                  day: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                },
                              )}
                            </s-text>
                          </s-stack>
                        </s-stack>
                      </s-box>
                    </s-card>
                  </Link>
                ))}
              </s-stack>
            </s-section>
          )}

          {/* Past Streams */}
          {endedSessions.length > 0 && (
            <s-section heading="Past Streams">
              <s-stack direction="block" gap="base">
                {endedSessions.map((s) => (
                  <Link
                    key={s.id}
                    to={`/app/feature-5/${s.id}`}
                    style={{ textDecoration: "none", color: "inherit" }}
                  >
                    <s-card>
                      <s-box padding="base">
                        <s-stack direction="inline" gap="base" align="center">
                          <s-badge>{s.status === "ended" ? "Ended" : s.status}</s-badge>
                          <s-stack direction="block" gap="tight">
                            <s-text fontWeight="bold">{s.title}</s-text>
                            <s-text variant="bodySm" tone="subdued">
                              {JSON.parse(s.productIds || "[]").length} products
                              ·{" "}
                              {new Date(s.createdAt).toLocaleDateString(
                                "en-US",
                                {
                                  month: "short",
                                  day: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                },
                              )}
                            </s-text>
                          </s-stack>
                        </s-stack>
                      </s-box>
                    </s-card>
                  </Link>
                ))}
              </s-stack>
            </s-section>
          )}
        </>
      )}
    </s-page>
  );
}

export const headers = (headersArgs) => boundary.headers(headersArgs);
