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

function statusBadge(status) {
  if (status === "live") return { tone: "success", label: "Live" };
  if (status === "ended") return { tone: "neutral", label: "Ended" };
  return { tone: "info", label: "Standby" };
}

export default function Feature5Dashboard() {
  const { sessions } = useLoaderData();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = sessions
    .filter((s) => {
      if (statusFilter === "active") return s.status === "live" || s.status === "idle";
      if (statusFilter === "ended") return s.status === "ended";
      return true;
    })
    .filter((s) => {
      if (!search) return true;
      return s.title.toLowerCase().includes(search.toLowerCase());
    });

  return (
    <s-page heading="Live Shopping" inlineSize="large">
      <s-link slot="primary-action" href="/app/feature-5/create">
        Create Livestream
      </s-link>

      {sessions.length === 0 ? (
        <s-section accessibilityLabel="Empty state section">
          <s-grid gap="large" justifyItems="center" paddingBlock="large-400">
            <s-box maxInlineSize="260px" maxBlockSize="200px">
              <s-image
                aspectRatio="1/0.6"
                src="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
                alt="Live shopping illustration"
              />
            </s-box>
            <s-grid justifyItems="center" maxInlineSize="400px" gap="base">
              <s-stack alignItems="center" gap="small">
                <s-heading>Go live, sell more</s-heading>
                <s-paragraph>
                  Showcase products in real-time, interact with customers, and pin items during your stream. Set up your first session in under a minute.
                </s-paragraph>
              </s-stack>
              <s-stack direction="inline" gap="small" justifyContent="center">
                <s-link href="/app/feature-5/create">
                  <s-button variant="primary">Create your first stream</s-button>
                </s-link>
              </s-stack>
            </s-grid>
          </s-grid>
        </s-section>
      ) : (
        <s-section padding="none" accessibilityLabel="Streams table section">
          <s-table>
            <s-grid slot="filters" gap="small-200" gridTemplateColumns="1fr auto">
              <s-text-field
                label="Search streams"
                labelAccessibilityVisibility="exclusive"
                icon="search"
                placeholder="Search streams"
                value={search}
                onInput={(e) => setSearch(e.target.value)}
              />
              <s-button
                icon="filter"
                variant="secondary"
                accessibilityLabel="Filter by status"
                commandFor="stream-status-filter"
              />
              <s-popover id="stream-status-filter">
                <s-box padding="small">
                  <s-choice-list
                    label="Status"
                    name="status-filter"
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <s-choice value="all" selected={statusFilter === "all"}>All</s-choice>
                    <s-choice value="active" selected={statusFilter === "active"}>Active</s-choice>
                    <s-choice value="ended" selected={statusFilter === "ended"}>Ended</s-choice>
                  </s-choice-list>
                </s-box>
              </s-popover>
            </s-grid>
            <s-table-header-row>
              <s-table-header listSlot="primary">Stream</s-table-header>
              <s-table-header listSlot="labeled">Products</s-table-header>
              <s-table-header>Created</s-table-header>
              <s-table-header listSlot="inline">Status</s-table-header>
            </s-table-header-row>
            <s-table-body>
              {filtered.map((s) => {
                const badge = statusBadge(s.status);
                const productCount = JSON.parse(s.productIds || "[]").length;
                const date = new Date(s.createdAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                });
                return (
                  <s-table-row key={s.id}>
                    <s-table-cell>
                      <s-link href={`/app/feature-5/${s.id}`}>
                        {s.title}
                      </s-link>
                    </s-table-cell>
                    <s-table-cell>{productCount}</s-table-cell>
                    <s-table-cell>{date}</s-table-cell>
                    <s-table-cell>
                      <s-badge tone={badge.tone}>{badge.label}</s-badge>
                    </s-table-cell>
                  </s-table-row>
                );
              })}
            </s-table-body>
          </s-table>
        </s-section>
      )}
    </s-page>
  );
}

export const headers = (headersArgs) => boundary.headers(headersArgs);
