import { useLoaderData } from "react-router";
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

function EmptyState() {
  return (
    <s-section>
      <s-card>
        <s-box padding="large-600">
          <s-stack direction="block" gap="base" align="center">
            <s-icon type="camera" size="large" />
            <s-heading>Start live selling</s-heading>
            <s-text tone="subdued">
              Create your first livestream to showcase products and sell live to
              your customers.
            </s-text>
            <s-link href="/app/feature-5/create">
              <s-button variant="primary">Create Livestream</s-button>
            </s-link>
          </s-stack>
        </s-box>
      </s-card>
    </s-section>
  );
}

function SessionTable({ sessions }) {
  return (
    <s-box background="strong" border="base" borderRadius="base" overflow="hidden">
      <s-table>
        <s-table-header-row>
          <s-table-header>Title</s-table-header>
          <s-table-header>Status</s-table-header>
          <s-table-header>Products</s-table-header>
          <s-table-header>Created</s-table-header>
        </s-table-header-row>
        {sessions.map((s) => (
          <s-table-row key={s.id}>
            <s-table-cell>
              <s-link href={`/app/feature-5/${s.id}`}>{s.title}</s-link>
            </s-table-cell>
            <s-table-cell>
              <s-badge
                tone={
                  s.status === "live"
                    ? "success"
                    : s.status === "ended"
                      ? "default"
                      : "info"
                }
              >
                {s.status === "live"
                  ? "LIVE"
                  : s.status === "ended"
                    ? "Ended"
                    : "Ready"}
              </s-badge>
            </s-table-cell>
            <s-table-cell>
              {JSON.parse(s.productIds || "[]").length}
            </s-table-cell>
            <s-table-cell>
              {new Date(s.createdAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </s-table-cell>
          </s-table-row>
        ))}
      </s-table>
    </s-box>
  );
}

export default function Feature5Dashboard() {
  const { sessions } = useLoaderData();

  const liveSessions = sessions.filter(
    (s) => s.status === "live" || s.status === "idle",
  );
  const endedSessions = sessions.filter((s) => s.status === "ended");

  return (
    <s-page heading="Live Shopping" inlineSize="large">
      <s-link slot="primary-action" href="/app/feature-5/create">
        Create Livestream
      </s-link>

      {sessions.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          {/* Stats */}
          <s-section>
            <s-grid columns="3">
              <s-card>
                <s-box padding="base">
                  <s-text tone="subdued" variant="bodySm">
                    Total Streams
                  </s-text>
                  <s-heading>{sessions.length}</s-heading>
                </s-box>
              </s-card>
              <s-card>
                <s-box padding="base">
                  <s-text tone="subdued" variant="bodySm">
                    Active Now
                  </s-text>
                  <s-heading>{liveSessions.length}</s-heading>
                </s-box>
              </s-card>
              <s-card>
                <s-box padding="base">
                  <s-text tone="subdued" variant="bodySm">
                    Products Showcased
                  </s-text>
                  <s-heading>
                    {sessions.reduce(
                      (sum, s) =>
                        sum + JSON.parse(s.productIds || "[]").length,
                      0,
                    )}
                  </s-heading>
                </s-box>
              </s-card>
            </s-grid>
          </s-section>

          {/* Active Streams */}
          {liveSessions.length > 0 && (
            <s-section heading="Active Streams">
              <SessionTable sessions={liveSessions} />
            </s-section>
          )}

          {/* Past Streams */}
          {endedSessions.length > 0 && (
            <s-section heading="Past Streams">
              <SessionTable sessions={endedSessions} />
            </s-section>
          )}
        </>
      )}
    </s-page>
  );
}

export const headers = (headersArgs) => boundary.headers(headersArgs);
