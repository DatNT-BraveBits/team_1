import { boundary } from "@shopify/shopify-app-react-router/server";
import { useLoaderData } from "react-router";
import { authenticate } from "../shopify.server";
import { features } from "../nav-config";
import prisma from "../db.server";

export const loader = async ({ request }) => {
  await authenticate.admin(request);

  const stats = {};
  try {
    stats.Feature4_TryOnSession = await prisma.feature4_TryOnSession.count();
  } catch {
    stats.Feature4_TryOnSession = null;
  }
  try {
    stats.Feature5_LiveSession = await prisma.feature5_LiveSession.count();
  } catch {
    stats.Feature5_LiveSession = null;
  }

  return { stats };
};

export default function Dashboard() {
  const { stats } = useLoaderData();

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: dashboardStyles }} />
      <s-page heading="Dashboard">
        <s-section>
          <s-card>
            <s-box padding="base">
              <div className="dashboard-banner">
                <s-text variant="headingLg">Your all-in-one toolkit for smarter selling</s-text>
                <div style={{ marginTop: "4px" }}>
                  <s-text variant="bodySm" tone="subdued">{features.length} features active</s-text>
                </div>
              </div>
            </s-box>
          </s-card>
        </s-section>

        <s-section>
          <s-grid columns="3">
            {features.map((f) => {
              const stat = f.statModel ? stats[f.statModel] : null;
              return (
                <s-card key={f.href}>
                  <s-box padding="base">
                    <div className="dashboard-card" style={{ borderLeftColor: f.color }}>
                      <div className="dashboard-card-header">
                        <span className="dashboard-card-icon">{f.icon}</span>
                        <s-text variant="headingMd">{f.label}</s-text>
                      </div>
                      <s-text variant="bodySm" tone="subdued">{f.description}</s-text>
                      <div className="dashboard-card-stat">
                        <s-text variant="bodySm" tone="subdued">
                          {f.statLabel}: {stat != null ? stat : "\u2014"}
                        </s-text>
                      </div>
                      <s-link href={f.href}>
                        <s-button>Open</s-button>
                      </s-link>
                    </div>
                  </s-box>
                </s-card>
              );
            })}
          </s-grid>
        </s-section>
      </s-page>
    </>
  );
}

const dashboardStyles = `
  .dashboard-banner {
    background: linear-gradient(135deg, #f6f8fc 0%, #ffffff 100%);
    padding: 8px 0;
  }

  .dashboard-card {
    border-left: 4px solid transparent;
    padding-left: 12px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    transition: transform 0.15s ease, box-shadow 0.15s ease;
  }

  .dashboard-card:hover {
    transform: translateY(-2px);
  }

  .dashboard-card-header {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .dashboard-card-icon {
    font-size: 20px;
  }

  .dashboard-card-stat {
    padding: 4px 0;
  }
`;

export const headers = (headersArgs) => boundary.headers(headersArgs);
