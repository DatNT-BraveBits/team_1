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
      <style>{styles}</style>
      <s-page heading="Dashboard">
        {/* Hero Banner */}
        <s-section>
          <div className="db-banner">
            <div className="db-banner-glow" />
            <div className="db-banner-content">
              <div className="db-banner-badge">ALL-IN-ONE</div>
              <h2 className="db-banner-title">Your toolkit for smarter selling</h2>
              <p className="db-banner-sub">{features.length} tools ready to boost your store</p>
            </div>
          </div>
        </s-section>

        {/* Feature Cards */}
        <s-section>
          <div className="db-grid">
            {features.map((f, i) => {
              const stat = f.statModel ? stats[f.statModel] : null;
              return (
                <a
                  key={f.href}
                  href={f.href}
                  className="db-card"
                  style={{ "--accent": f.color, "--i": i }}
                >
                  <div className="db-card-accent" />
                  <div className="db-card-body">
                    <div className="db-card-top">
                      <span className="db-card-icon">{f.icon}</span>
                      <span className="db-card-stat-pill">
                        {stat != null ? stat : "\u2014"} {f.statLabel.toLowerCase()}
                      </span>
                    </div>
                    <h3 className="db-card-title">{f.label}</h3>
                    <p className="db-card-desc">{f.description}</p>
                    <div className="db-card-footer">
                      <span className="db-card-link">
                        Open
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                      </span>
                    </div>
                  </div>
                </a>
              );
            })}
          </div>
        </s-section>
      </s-page>
    </>
  );
}

const styles = `
  /* ---- Banner ---- */
  .db-banner {
    position: relative;
    overflow: hidden;
    border-radius: 14px;
    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
    padding: 36px 32px;
    color: #fff;
  }

  .db-banner-glow {
    position: absolute;
    top: -40%;
    right: -10%;
    width: 300px;
    height: 300px;
    background: radial-gradient(circle, rgba(99, 102, 241, 0.25) 0%, transparent 70%);
    pointer-events: none;
  }

  .db-banner-content {
    position: relative;
    z-index: 1;
  }

  .db-banner-badge {
    display: inline-block;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 1.8px;
    color: rgba(255, 255, 255, 0.65);
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.1);
    padding: 4px 12px;
    border-radius: 100px;
    margin-bottom: 16px;
  }

  .db-banner-title {
    font-size: 22px;
    font-weight: 650;
    margin: 0 0 6px;
    letter-spacing: -0.3px;
    color: #fff;
  }

  .db-banner-sub {
    font-size: 14px;
    margin: 0;
    color: rgba(255, 255, 255, 0.55);
  }

  /* ---- Grid ---- */
  .db-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
  }

  @media (max-width: 800px) {
    .db-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  @media (max-width: 500px) {
    .db-grid {
      grid-template-columns: 1fr;
    }
  }

  /* ---- Cards ---- */
  .db-card {
    position: relative;
    display: flex;
    flex-direction: column;
    background: #fff;
    border-radius: 12px;
    border: 1px solid #e3e5e8;
    overflow: hidden;
    text-decoration: none;
    color: inherit;
    transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
    animation: db-card-in 0.4s ease both;
    animation-delay: calc(var(--i) * 0.07s);
  }

  @keyframes db-card-in {
    from {
      opacity: 0;
      transform: translateY(12px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .db-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(0, 0, 0, 0.04);
    border-color: var(--accent);
  }

  .db-card-accent {
    height: 4px;
    background: var(--accent);
    opacity: 0.85;
  }

  .db-card-body {
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    flex: 1;
  }

  .db-card-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .db-card-icon {
    font-size: 28px;
    line-height: 1;
  }

  .db-card-stat-pill {
    font-size: 11px;
    font-weight: 600;
    color: #6d7175;
    background: #f6f6f7;
    padding: 4px 10px;
    border-radius: 100px;
    white-space: nowrap;
  }

  .db-card-title {
    font-size: 16px;
    font-weight: 650;
    margin: 0;
    color: #1a1c1e;
    letter-spacing: -0.2px;
  }

  .db-card-desc {
    font-size: 13px;
    line-height: 1.45;
    margin: 0;
    color: #6d7175;
    flex: 1;
  }

  .db-card-footer {
    padding-top: 6px;
  }

  .db-card-link {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 13px;
    font-weight: 600;
    color: var(--accent);
    transition: gap 0.2s ease;
  }

  .db-card:hover .db-card-link {
    gap: 10px;
  }

  .db-card-link svg {
    transition: transform 0.2s ease;
  }

  .db-card:hover .db-card-link svg {
    transform: translateX(2px);
  }
`;

export const headers = (headersArgs) => boundary.headers(headersArgs);
