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

  return (
    <s-page heading="Live Shopping">
      <Link to="/app/feature-5/create">
        <s-button slot="primary-action" variant="primary">
          Create Livestream
        </s-button>
      </Link>

      {sessions.length === 0 ? (
        <s-section>
          <s-paragraph>
            No livestream sessions yet. Create your first one!
          </s-paragraph>
        </s-section>
      ) : (
        <s-section heading="Your Sessions">
          <s-stack direction="block" gap="base">
            {sessions.map((s) => (
              <s-card key={s.id}>
                <s-box padding="base">
                  <s-stack direction="inline" gap="base" align="center">
                    <s-heading>{s.title}</s-heading>
                    <s-badge
                      tone={
                        s.status === "live"
                          ? "success"
                          : s.status === "ended"
                            ? "default"
                            : "info"
                      }
                    >
                      {s.status}
                    </s-badge>
                    <Link to={`/app/feature-5/${s.id}`}>
                      <s-button variant="tertiary">Manage</s-button>
                    </Link>
                  </s-stack>
                </s-box>
              </s-card>
            ))}
          </s-stack>
        </s-section>
      )}
    </s-page>
  );
}

export const headers = (headersArgs) => boundary.headers(headersArgs);
