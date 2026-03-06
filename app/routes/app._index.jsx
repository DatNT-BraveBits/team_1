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

function FeatureIcon({ path, color }) {
  return (
    <div className="db-icon" style={{ "--accent": color }}>
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d={path} />
      </svg>
    </div>
  );
}

export default function Dashboard() {
  const { stats } = useLoaderData();

  return (
    <>
      <style>{styles}</style>
      <s-page heading="Dashboard">
        <div className="db-wrap">
          {/* Hero */}
          <div className="db-hero">
            <div className="db-hero-bg" />
            <div className="db-hero-content">
              <span className="db-hero-tag">ALL-IN-ONE PLATFORM</span>
              <h2 className="db-hero-title">Your toolkit for smarter selling</h2>
              <p className="db-hero-sub">{features.length} tools ready to boost your store</p>
            </div>
          </div>

          {/* Grid */}
          <div className="db-grid">
            {features.map((f, i) => {
              const stat = f.statModel ? stats[f.statModel] : null;
              return (
                <s-link
                  key={f.href}
                  href={f.href}
                  className="db-card"
                  style={{ "--accent": f.color, "--i": i }}
                >
                  <div className="db-card-inner">
                    <div className="db-card-head">
                      <FeatureIcon path={f.iconPath} color={f.color} />
                      {stat != null && (
                        <span className="db-stat">{stat}</span>
                      )}
                    </div>
                    <div className="db-card-info">
                      <h3 className="db-card-name">{f.label}</h3>
                      <p className="db-card-desc">{f.description}</p>
                    </div>
                    <div className="db-card-foot">
                      <span className="db-card-meta">{f.statLabel}: {stat != null ? stat : "\u2014"}</span>
                      <span className="db-card-arrow">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                      </span>
                    </div>
                  </div>
                </s-link>
              );
            })}
          </div>
        </div>
      </s-page>
    </>
  );
}

const styles = `
  .db-wrap {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  /* ---- Hero ---- */
  .db-hero {
    position: relative;
    overflow: hidden;
    border-radius: 14px;
    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
    padding: 40px 36px;
  }

  .db-hero-bg {
    position: absolute;
    inset: 0;
    background:
      radial-gradient(ellipse 50% 80% at 80% 20%, rgba(99, 102, 241, 0.15) 0%, transparent 100%),
      radial-gradient(ellipse 40% 60% at 20% 80%, rgba(236, 72, 153, 0.08) 0%, transparent 100%);
    pointer-events: none;
  }

  .db-hero-content {
    position: relative;
  }

  .db-hero-tag {
    display: inline-block;
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 2px;
    color: rgba(255, 255, 255, 0.5);
    margin-bottom: 14px;
  }

  .db-hero-title {
    font-size: 24px;
    font-weight: 650;
    margin: 0 0 8px;
    letter-spacing: -0.4px;
    color: #fff;
    line-height: 1.2;
  }

  .db-hero-sub {
    font-size: 14px;
    margin: 0;
    color: rgba(255, 255, 255, 0.45);
    font-weight: 400;
  }

  /* ---- Grid ---- */
  .db-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 14px;
  }

  @media (max-width: 820px) {
    .db-grid { grid-template-columns: repeat(2, 1fr); }
  }
  @media (max-width: 520px) {
    .db-grid { grid-template-columns: 1fr; }
  }

  /* ---- Card ---- */
  .db-card {
    text-decoration: none;
    color: inherit;
    border-radius: 12px;
    background: #fff;
    border: 1px solid #e1e3e5;
    transition: all 0.22s cubic-bezier(0.4, 0, 0.2, 1);
    animation: db-in 0.35s ease both;
    animation-delay: calc(var(--i) * 0.06s);
    display: block;
    --s-link-text-decoration: none;
    --s-link-color: inherit;
  }

  @keyframes db-in {
    from { opacity: 0; transform: translateY(10px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .db-card:hover {
    border-color: color-mix(in srgb, var(--accent) 40%, transparent);
    box-shadow:
      0 1px 2px rgba(0,0,0,0.04),
      0 4px 16px rgba(0,0,0,0.06),
      0 0 0 3px color-mix(in srgb, var(--accent) 8%, transparent);
    transform: translateY(-2px);
  }

  .db-card-inner {
    padding: 22px;
    display: flex;
    flex-direction: column;
    gap: 14px;
    height: 100%;
    box-sizing: border-box;
  }

  /* Icon */
  .db-icon {
    width: 40px;
    height: 40px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: color-mix(in srgb, var(--accent) 10%, transparent);
    color: var(--accent);
    flex-shrink: 0;
  }

  .db-card-head {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
  }

  .db-stat {
    font-size: 22px;
    font-weight: 700;
    color: #1a1c1e;
    line-height: 1;
    letter-spacing: -0.5px;
  }

  /* Info */
  .db-card-info {
    flex: 1;
  }

  .db-card-name {
    font-size: 15px;
    font-weight: 620;
    margin: 0 0 4px;
    color: #1a1c1e;
    letter-spacing: -0.15px;
  }

  .db-card-desc {
    font-size: 13px;
    line-height: 1.5;
    margin: 0;
    color: #8c9196;
  }

  /* Footer */
  .db-card-foot {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-top: 14px;
    border-top: 1px solid #f1f2f3;
  }

  .db-card-meta {
    font-size: 12px;
    font-weight: 500;
    color: #8c9196;
  }

  .db-card-arrow {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    border-radius: 8px;
    color: #8c9196;
    background: transparent;
    transition: all 0.2s ease;
  }

  .db-card:hover .db-card-arrow {
    color: var(--accent);
    background: color-mix(in srgb, var(--accent) 8%, transparent);
    transform: translateX(2px);
  }
`;

export const headers = (headersArgs) => boundary.headers(headersArgs);
