// Route: /app/feature-3
// Owner: Person 3 — edit app/features/feature-3/ instead of this file
import { boundary } from "@shopify/shopify-app-react-router/server";
import { authenticate } from "../shopify.server";
import Feature3Page from "../features/feature-3";

export const loader = async ({ request }) => {
  await authenticate.admin(request);
  return null;
};

export default function () {
  return <Feature3Page />;
}

export const headers = (headersArgs) => boundary.headers(headersArgs);
