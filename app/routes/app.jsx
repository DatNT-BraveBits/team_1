import { Outlet, useLoaderData, useRouteError, useNavigation } from "react-router";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { AppProvider } from "@shopify/shopify-app-react-router/react";
import { authenticate } from "../shopify.server";
import { features } from "../nav-config";

export const loader = async ({ request }) => {
  await authenticate.admin(request);

  // eslint-disable-next-line no-undef
  return { apiKey: process.env.SHOPIFY_API_KEY || "" };
};

function LoadingBar() {
  return (
    <>
      <style>{`
        @keyframes loading-slide {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(400%); }
        }
      `}</style>
      <div style={{ position: "fixed", top: 0, left: 0, right: 0, height: 3, zIndex: 9999, background: "#E5E7EB", overflow: "hidden" }}>
        <div style={{
          width: "25%",
          height: "100%",
          background: "linear-gradient(90deg, #2563EB, #60A5FA, #2563EB)",
          borderRadius: 2,
          animation: "loading-slide 1s ease-in-out infinite",
        }} />
      </div>
    </>
  );
}

function PageSkeleton() {
  const bar = (w, h) => ({
    width: w, height: h, borderRadius: 6,
    background: "linear-gradient(90deg, #F3F4F6 25%, #E5E7EB 50%, #F3F4F6 75%)",
    backgroundSize: "200% 100%",
    animation: "shimmer 1.5s infinite",
  });

  return (
    <>
      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
      <div style={{ maxWidth: 960, margin: "0 auto", padding: "0 16px 40px" }}>
        <div style={bar("240px", 24)} />
        <div style={{ ...bar("360px", 14), marginTop: 10 }} />
        <div style={{ display: "flex", gap: 6, marginTop: 24 }}>
          <div style={bar("120px", 38)} />
          <div style={bar("120px", 38)} />
          <div style={bar("120px", 38)} />
        </div>
        <div style={{ ...bar("100%", 200), marginTop: 20 }} />
        <div style={{ ...bar("100%", 140), marginTop: 16 }} />
      </div>
    </>
  );
}

export default function App() {
  const { apiKey } = useLoaderData();
  const navigation = useNavigation();
  const isNavigating = navigation.state === "loading";

  return (
    <AppProvider embedded apiKey={apiKey}>
      <s-app-nav>
        <s-link href="/app">Home</s-link>
        {features.map((f) => (
          <s-link key={f.href} href={f.href}>
            {f.label}
          </s-link>
        ))}
      </s-app-nav>
      {isNavigating && <LoadingBar />}
      <div style={{ opacity: isNavigating ? 0.4 : 1, transition: "opacity 0.15s", pointerEvents: isNavigating ? "none" : "auto" }}>
        {isNavigating ? <PageSkeleton /> : <Outlet />}
      </div>
    </AppProvider>
  );
}

// Shopify needs React Router to catch some thrown responses, so that their headers are included in the response.
export function ErrorBoundary() {
  return boundary.error(useRouteError());
}

export const headers = (headersArgs) => {
  return boundary.headers(headersArgs);
};
