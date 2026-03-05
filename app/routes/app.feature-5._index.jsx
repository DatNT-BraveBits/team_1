import { useLoaderData } from "react-router";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { authenticate } from "../shopify.server";
import prisma from "../db.server";
import { useState } from "react";

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
      <s-box padding="large-600">
        <s-stack direction="block" gap="base" align="center">
          <s-icon type="camera" size="large" />
          <s-text variant="headingLg">Start live selling</s-text>
          <s-text tone="subdued">
            Create your first livestream to showcase products and sell live to
            your customers.
          </s-text>
          <s-link href="/app/feature-5/create">
            <s-button variant="primary">Create Livestream</s-button>
          </s-link>
        </s-stack>
      </s-box>
    </s-section>
  );
}

function StatusFilter({ filter, onFilter }) {
  return (
    <s-stack direction="inline" gap="small">
      {["all", "active", "ended"].map((f) => (
        <s-button
          key={f}
          variant={filter === f ? "primary" : "secondary"}
          onClick={() => onFilter(f)}
        >
          {f === "all" ? "All" : f === "active" ? "Active" : "Ended"}
        </s-button>
      ))}
    </s-stack>
  );
}

function SessionRow({ session }) {
  const productCount = JSON.parse(session.productIds || "[]").length;
  const date = new Date(session.createdAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <s-table-row>
      <s-table-cell>
        <s-link href={`/app/feature-5/${session.id}`}>
          <s-text fontWeight="semibold">{session.title}</s-text>
        </s-link>
      </s-table-cell>
      <s-table-cell>
        <s-badge
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
      </s-table-cell>
      <s-table-cell>
        <s-text variant="bodySm">{productCount}</s-text>
      </s-table-cell>
      <s-table-cell>
        <s-text variant="bodySm" tone="subdued">{date}</s-text>
      </s-table-cell>
    </s-table-row>
  );
}

export default function Feature5Dashboard() {
  const { sessions } = useLoaderData();
  const [filter, setFilter] = useState("all");

  const filteredSessions = sessions.filter((s) => {
    if (filter === "active") return s.status === "live" || s.status === "idle";
    if (filter === "ended") return s.status === "ended";
    return true;
  });

  const activeSessions = sessions.filter(
    (s) => s.status === "live" || s.status === "idle",
  );
  const totalProducts = sessions.reduce(
    (sum, s) => sum + JSON.parse(s.productIds || "[]").length,
    0,
  );

  return (
    <s-page heading="Live Shopping" inlineSize="large">
      <s-button slot="primary-action" variant="primary" href="/app/feature-5/create">
        Create Livestream
      </s-button>

      {sessions.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          {/* Stats */}
          <s-section>
            <s-stack direction="inline" gap="large">
              <s-stack direction="block" gap="small">
                <s-text tone="subdued" variant="bodySm">Total Streams</s-text>
                <s-text variant="headingLg">{sessions.length}</s-text>
              </s-stack>
              <s-stack direction="block" gap="small">
                <s-text tone="subdued" variant="bodySm">Active Now</s-text>
                <s-text variant="headingLg">{activeSessions.length}</s-text>
              </s-stack>
              <s-stack direction="block" gap="small">
                <s-text tone="subdued" variant="bodySm">Products Showcased</s-text>
                <s-text variant="headingLg">{totalProducts}</s-text>
              </s-stack>
            </s-stack>
          </s-section>

          {/* Filter + Table */}
          <s-section heading="Streams">
            <StatusFilter filter={filter} onFilter={setFilter} />
            <s-table>
              <s-table-header-row>
                <s-table-header>Title</s-table-header>
                <s-table-header>Status</s-table-header>
                <s-table-header>Products</s-table-header>
                <s-table-header>Created</s-table-header>
              </s-table-header-row>
              {filteredSessions.map((s) => (
                <SessionRow key={s.id} session={s} />
              ))}
            </s-table>
          </s-section>
        </>
      )}
    </s-page>
  );
}

export const headers = (headersArgs) => boundary.headers(headersArgs);
