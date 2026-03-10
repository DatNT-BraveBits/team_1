import { boundary } from "@shopify/shopify-app-react-router/server";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }) => {
  await authenticate.admin(request);
  return null;
};

const S = {
  page: { maxWidth: 960, margin: "0 auto", padding: "0 16px 40px" },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: 700,
    color: "#111827",
    margin: "0 0 6px",
  },
  subtitle: {
    fontSize: 14,
    color: "#6B7280",
    margin: 0,
    lineHeight: 1.5,
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(420px, 1fr))",
    gap: 16,
  },
  card: {
    background: "#FFFFFF",
    border: "1px solid #E5E7EB",
    borderRadius: 12,
    overflow: "hidden",
    transition: "border-color 0.15s, box-shadow 0.15s",
  },
  cardHover: {
    borderColor: "#2563EB",
    boxShadow: "0 0 0 2px rgba(37,99,235,0.15)",
  },
  cardIcon: {
    width: 48,
    height: 48,
    borderRadius: 10,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 22,
    flexShrink: 0,
  },
  cardBody: {
    padding: 20,
    display: "flex",
    alignItems: "flex-start",
    gap: 16,
  },
  cardContent: {
    flex: 1,
    minWidth: 0,
  },
  cardName: {
    margin: 0,
    fontSize: 16,
    fontWeight: 700,
    color: "#111827",
  },
  cardDesc: {
    margin: "6px 0 0",
    fontSize: 13,
    color: "#6B7280",
    lineHeight: 1.5,
  },
  cardFooter: {
    padding: "12px 20px",
    borderTop: "1px solid #F3F4F6",
    background: "#F9FAFB",
    display: "flex",
    justifyContent: "flex-end",
  },
  btn: {
    padding: "8px 20px",
    fontSize: 13,
    fontWeight: 600,
    color: "#FFFFFF",
    background: "#2563EB",
    border: "1px solid #2563EB",
    borderRadius: 8,
    cursor: "pointer",
    textDecoration: "none",
    display: "inline-block",
    transition: "all 0.15s",
  },
};

const features = [
  {
    name: "Switch Layout",
    description: "Change your homepage layout instantly. Choose from preset layouts for multiple themes or customize with your own JSON template.",
    href: "/app/feature-1",
    icon: "🎨",
    iconBg: "#EFF6FF",
    iconBorder: "#BFDBFE",
  },
  {
    name: "Trust Badges",
    description: "Configure product badges, countdown timers, and scheduling to boost conversions on your storefront.",
    href: "/app/feature-2",
    icon: "🛡️",
    iconBg: "#F0FDF4",
    iconBorder: "#BBF7D0",
  },
  {
    name: "Sonic Branding",
    description: "Add sound effects to your storefront — add-to-cart clicks, checkout chimes, and more. Create a unique audio identity for your brand.",
    href: "/app/feature-3",
    icon: "🔊",
    iconBg: "#FFF7ED",
    iconBorder: "#FED7AA",
  },
];

export default function Dashboard() {
  return (
    <div style={S.page}>
      <div style={S.header}>
        <h1 style={S.title}>App-AI Dashboard</h1>
        <p style={S.subtitle}>Manage your storefront features and settings.</p>
      </div>

      <div style={S.grid}>
        {features.map((f) => (
          <div key={f.href} style={S.card}>
            <div style={S.cardBody}>
              <div style={{ ...S.cardIcon, background: f.iconBg, border: `1px solid ${f.iconBorder}` }}>
                {f.icon}
              </div>
              <div style={S.cardContent}>
                <h3 style={S.cardName}>{f.name}</h3>
                <p style={S.cardDesc}>{f.description}</p>
              </div>
            </div>
            <div style={S.cardFooter}>
              <a href={f.href} style={S.btn}>Open Settings</a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export const headers = (headersArgs) => boundary.headers(headersArgs);
